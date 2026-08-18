import { useState } from 'react';
import { motion } from 'framer-motion';
import { Fuel, Users, Settings, MessageCircle, ChevronDown } from 'lucide-react';
import type { Car as CarType } from '@/lib/supabase';
import { getCarImages } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n';
import { CarImageGallery } from '@/components/CarImageGallery';

interface CarCardProps {
  car: CarType;
  index: number;
  onOpenDetail: () => void;
}

const WHATSAPP_NUMBER = '+995596078800';

type TierKey = 'day1' | 'day2' | 'day3_4' | 'day5_7' | 'day8plus';

interface Tier {
  key: TierKey;
  label: string;
  price: number;
}

export function CarCard({ car, index, onOpenDetail }: CarCardProps) {
  const { t } = useLanguage();
  const images = getCarImages(car);

  // Build available tiers from car data
  const tiers: Tier[] = [
    { key: 'day1', label: t.card.tiers.day1, price: car.price_per_day },
  ];
  if (car.price_2_day)       tiers.push({ key: 'day2',    label: t.card.tiers.day2,    price: car.price_2_day });
  if (car.price_3_4_day)     tiers.push({ key: 'day3_4',  label: t.card.tiers.day3_4,  price: car.price_3_4_day });
  if (car.price_5_7_day)     tiers.push({ key: 'day5_7',  label: t.card.tiers.day5_7,  price: car.price_5_7_day });
  if (car.price_8_plus_day)  tiers.push({ key: 'day8plus',label: t.card.tiers.day8plus,price: car.price_8_plus_day });

  const [selectedTierKey, setSelectedTierKey] = useState<TierKey>(tiers[tiers.length - 1].key as TierKey);
  const [includeDriver, setIncludeDriver] = useState(false);

  const hasDriver  = !!car.price_with_driver;
  const hasTiers   = tiers.length > 1;

  const activeTier  = tiers.find(t => t.key === selectedTierKey) ?? tiers[0];
  const tierPrice   = activeTier.price;
  const driverAddon = includeDriver && car.price_with_driver ? car.price_with_driver : 0;
  const totalPrice  = tierPrice + driverAddon;

  const tierOriginalPrice: number | null = (() => {
    switch (selectedTierKey) {
      case 'day1':     return car.orig_price_1_day      ?? null;
      case 'day2':     return car.orig_price_2_day      ?? null;
      case 'day3_4':   return car.orig_price_3_4_day    ?? null;
      case 'day5_7':   return car.orig_price_5_7_day    ?? null;
      case 'day8plus': return car.orig_price_8_plus_day ?? null;
    }
  })();

  const handleReserve = () => {
    const driverOptionLabel = includeDriver && car.price_with_driver
      ? `${t.card.withDriver} (+$${car.price_with_driver}${t.card.day})`
      : t.card.withoutDriver;
    const msg = t.card.reserveMsg(
      car.brand, car.model, car.year,
      activeTier.label, driverOptionLabel, totalPrice,
      includeDriver ? car.price_with_driver : null,
    );
    const url = `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group relative flex flex-col bg-card rounded-xl border border-border overflow-hidden hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
      onClick={onOpenDetail}
    >
      {/* ── Image gallery ── */}
      <CarImageGallery images={images} alt={`${car.brand} ${car.model}`} />

      <div className="p-5 flex flex-col flex-grow">
        {/* ── Title ── */}
        <div className="mb-3">
          {car.year ? <p className="text-muted-foreground text-xs font-medium mb-0.5">{car.year}</p> : null}
          <h3 className="text-lg font-bold tracking-tight leading-tight">{car.brand} {car.model}</h3>
        </div>

        {/* ── Specs ── */}
        <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Settings size={14} className="flex-shrink-0" />
            <span className="capitalize truncate">{car.transmission}</span>
          </div>
          <div className="flex items-center gap-2">
            <Fuel size={14} className="flex-shrink-0" />
            <span className="truncate">{car.fuel_type}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={14} className="flex-shrink-0" />
            <span>{car.seats} {t.card.seats}</span>
          </div>
          {car.engine && (
            <div className="flex items-center gap-2">
              <Settings size={14} className="flex-shrink-0" />
              <span className="truncate">{car.engine}</span>
            </div>
          )}
        </div>

        {/* ── Dynamic Price Display ── */}
        <div className="flex items-center gap-3 my-2 mb-4">
          <span className="text-green-500 text-3xl font-bold">${totalPrice}</span>
          {tierOriginalPrice && tierOriginalPrice > tierPrice && (
            <span className="line-through text-red-500 text-xl font-medium">${tierOriginalPrice}</span>
          )}
          <span className="text-gray-400 text-sm">{t.card.day}</span>
          {driverAddon > 0 && (
            <span className="text-xs text-muted-foreground ml-auto">({t.card.withDriver} +${driverAddon})</span>
          )}
        </div>

        {/* ── Rental Period Radio ── */}
        {hasTiers && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {t.card.rentalPeriod}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tiers.map((tier) => (
                <label
                  key={tier.key}
                  className={`
                    cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all select-none
                    ${selectedTierKey === tier.key
                      ? 'bg-primary/15 border-primary/60 text-primary'
                      : 'bg-secondary/40 border-border text-muted-foreground hover:border-white/20 hover:text-foreground'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name={`tier-${car.id}`}
                    value={tier.key}
                    checked={selectedTierKey === tier.key}
                    onChange={() => setSelectedTierKey(tier.key)}
                    className="sr-only"
                  />
                  {tier.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ── Driver Option Dropdown ── */}
        {hasDriver && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {t.card.driverLabel}
            </p>
            <div className="relative">
              <select
                value={includeDriver ? 'with' : 'without'}
                onChange={(e) => setIncludeDriver(e.target.value === 'with')}
                className="w-full appearance-none bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground font-medium cursor-pointer hover:border-white/20 transition-colors focus:outline-none focus:ring-1 focus:ring-primary/50 pr-8"
              >
                <option value="without">{t.card.withoutDriver}</option>
                <option value="with">{t.card.withDriver} (+${car.price_with_driver}{t.card.day})</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        )}

        {/* ── Features ── */}
        {car.features && car.features.length > 0 && (
          <div className="mb-4 flex-grow">
            <div className="flex flex-wrap gap-1.5">
              {car.features.slice(0, 3).map((feature, i) => (
                <span key={i} className="px-2 py-1 bg-secondary rounded text-xs font-medium text-muted-foreground border border-white/5">
                  {feature}
                </span>
              ))}
              {car.features.length > 3 && (
                <span className="px-2 py-1 bg-secondary/50 rounded text-xs font-medium text-muted-foreground">
                  +{car.features.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── RESERVE button ── */}
        <button
          onClick={e => { e.stopPropagation(); handleReserve(); }}
          className="w-full mt-auto bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/25 uppercase tracking-wide text-sm"
        >
          <MessageCircle size={17} />
          {t.card.reserve}
        </button>
      </div>
    </motion.div>
  );
}
