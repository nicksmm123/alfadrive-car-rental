import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useCars, useDeleteCar, useUpdateCar } from '@/hooks/use-cars';
import { type Car, type CarStatus, resolveCarStatus, getCarImages } from '@/lib/supabase';
import { AdminCarForm } from '@/components/AdminCarForm';
import { Button } from '@/components/ui/button';
import {
  Loader2, Plus, Pencil, Trash2, Car as CarIcon,
  CarFront, CheckCircle2, Wrench, EyeOff, LogOut,
  Users, CircleDot,
} from 'lucide-react';
import { motion } from 'framer-motion';
import alfaDriveLogo from '@/assets/alfadrive-logo-raw.png';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<CarStatus, string> = {
  available:   'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  rented:      'text-blue-400   bg-blue-400/10   border-blue-400/20',
  maintenance: 'text-amber-400  bg-amber-400/10  border-amber-400/20',
  inactive:    'text-zinc-400   bg-zinc-400/10   border-zinc-400/20',
};

const STATUS_ICONS: Record<CarStatus, React.ElementType> = {
  available: CheckCircle2,
  rented: Users,
  maintenance: Wrench,
  inactive: EyeOff,
};

function StatusBadge({ status, label }: { status: CarStatus; label: string }) {
  const Icon = STATUS_ICONS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[status]}`}>
      <Icon size={11} />
      {label}
    </span>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, accent }: {
  label: string; value: number; icon: React.ElementType; accent: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Admin() {
  const { session, loading: authLoading, signOut } = useAuth();
  const { t } = useLanguage();
  const d = t.admin.dashboard;
  const [, navigate] = useLocation();

  const { data: cars, isLoading: carsLoading } = useCars();
  const deleteCar = useDeleteCar();
  const updateCar = useUpdateCar();

  const [formOpen, setFormOpen]     = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [search, setSearch]         = useState('');

  useEffect(() => {
    if (!authLoading && !session) navigate('/admin/login');
  }, [authLoading, session, navigate]);

  if (authLoading || !session) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  // Translated status labels
  const STATUS_LABELS: Record<CarStatus, string> = {
    available:   d.available,
    rented:      d.rented,
    maintenance: d.maintenance,
    inactive:    d.inactive,
  };

  const total       = cars?.length ?? 0;
  const available   = cars?.filter(c => resolveCarStatus(c) === 'available').length   ?? 0;
  const rented      = cars?.filter(c => resolveCarStatus(c) === 'rented').length      ?? 0;
  const maintenance = cars?.filter(c => resolveCarStatus(c) === 'maintenance').length ?? 0;

  const filtered = (cars ?? []).filter(c =>
    `${c.brand} ${c.model}`.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setEditingCar(null); setFormOpen(true); };
  const openEdit = (car: Car) => { setEditingCar(car); setFormOpen(true); };

  const handleDelete = (id: string) => {
    if (confirm(d.deleteConfirm)) deleteCar.mutate(id);
  };

  const handleStatusChange = (car: Car, newStatus: CarStatus) => {
    updateCar.mutate({ id: car.id, car: { status: newStatus, available: newStatus === 'available' } });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <img src={alfaDriveLogo} alt="AlfaDrive"
            style={{ height: 44, width: 'auto', mixBlendMode: 'screen' }} />

          <div className="flex items-center gap-2 ml-auto">
            <LanguageSelector />
            <span className="hidden sm:block text-xs text-muted-foreground bg-secondary rounded-full px-3 py-1">
              {session.user.email ?? ''}
            </span>
            <button
              onClick={() => navigate('/')}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary whitespace-nowrap"
            >
              {d.publicSite}
            </button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}
              className="gap-1.5 text-muted-foreground hover:text-foreground">
              <LogOut size={14} /> {d.signOut}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Page title ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{d.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">{d.subtitle}</p>
          </div>
          <Button onClick={openAdd} className="gap-2 bg-primary hover:bg-primary/90 text-white self-start sm:self-auto">
            <Plus size={15} /> {d.addVehicle}
          </Button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label={d.totalFleet}   value={total}       icon={CarFront}     accent="bg-primary/10 text-primary"          />
          <StatCard label={d.available}    value={available}   icon={CheckCircle2} accent="bg-emerald-500/10 text-emerald-400"  />
          <StatCard label={d.rented}       value={rented}      icon={CircleDot}    accent="bg-blue-500/10 text-blue-400"        />
          <StatCard label={d.maintenance}  value={maintenance} icon={Wrench}       accent="bg-amber-500/10 text-amber-400"      />
        </div>

        {/* ── Fleet table ── */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-border/50">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {d.vehicles} · {filtered.length}
            </h2>
            <input
              type="search"
              placeholder={d.search}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-9 w-full sm:w-56 rounded-lg border border-border bg-secondary/50 px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs uppercase text-muted-foreground bg-secondary/30 border-b border-border/50">
                  <th className="px-6 py-3 font-semibold">{d.colPhoto}</th>
                  <th className="px-4 py-3 font-semibold">{d.colVehicle}</th>
                  <th className="px-4 py-3 font-semibold hidden lg:table-cell">{d.colSpecs}</th>
                  <th className="px-4 py-3 font-semibold">{d.colPrice}</th>
                  <th className="px-4 py-3 font-semibold">{d.colStatus}</th>
                  <th className="px-4 py-3 font-semibold text-right">{d.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {carsLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                      <Loader2 className="animate-spin mx-auto mb-3" size={28} />
                      {d.loadingFleet}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                      <CarIcon size={36} className="mx-auto mb-3 opacity-30" />
                      {search ? d.noMatch : d.noVehicles}
                    </td>
                  </tr>
                ) : (
                  filtered.map((car, i) => {
                    const status = resolveCarStatus(car);
                    return (
                      <motion.tr
                        key={car.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-border/40 hover:bg-secondary/20 transition-colors"
                      >
                        {/* Photo */}
                        <td className="px-6 py-4">
                          <div className="w-20 h-14 bg-secondary rounded-lg overflow-hidden flex-shrink-0 border border-border/50 relative">
                            {getCarImages(car)[0] ? (
                              <>
                                <img src={getCarImages(car)[0]} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover" />
                                {getCarImages(car).length > 1 && (
                                  <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[9px] font-bold px-1 rounded leading-tight">
                                    {getCarImages(car).length}
                                  </span>
                                )}
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                                <CarIcon size={22} />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Vehicle */}
                        <td className="px-4 py-4">
                          <p className="font-bold text-base leading-tight">{car.brand} {car.model}</p>
                          {car.year ? <p className="text-xs text-muted-foreground mt-0.5">{car.year}</p> : null}
                        </td>

                        {/* Specs */}
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <div className="space-y-0.5 text-xs text-muted-foreground">
                            <p><span className="text-foreground font-medium">{d.specTrans}</span> {car.transmission === 'automatic' ? d.auto : d.manual}</p>
                            {car.engine && <p><span className="text-foreground font-medium">{d.specEngine}</span> {car.engine}</p>}
                            <p><span className="text-foreground font-medium">{d.specSeats}</span> {car.seats}</p>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-4">
                          <p className="font-bold text-base">${car.price_per_day}<span className="text-muted-foreground font-normal text-xs">{d.perDay}</span></p>
                          {car.price_with_driver && (
                            <p className="text-xs text-muted-foreground mt-0.5">{d.withDriver} ${car.price_with_driver}</p>
                          )}
                        </td>

                        {/* Status — quick-change */}
                        <td className="px-4 py-4">
                          <Select
                            value={status}
                            onValueChange={val => handleStatusChange(car, val as CarStatus)}
                            disabled={updateCar.isPending}
                          >
                            <SelectTrigger className="h-8 w-36 border-0 bg-transparent p-0 focus:ring-0 [&>span]:flex [&>span]:items-center">
                              <SelectValue>
                                <StatusBadge status={status} label={STATUS_LABELS[status]} />
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              {(Object.keys(STATUS_LABELS) as CarStatus[]).map(s => (
                                <SelectItem key={s} value={s} className="cursor-pointer">
                                  <StatusBadge status={s} label={STATUS_LABELS[s]} />
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => openEdit(car)}
                              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Edit">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => handleDelete(car.id)} disabled={deleteCar.isPending}
                              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>


      </main>

      <AdminCarForm open={formOpen} onOpenChange={setFormOpen} car={editingCar} />
    </div>
  );
}
