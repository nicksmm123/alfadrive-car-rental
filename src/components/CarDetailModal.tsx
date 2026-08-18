import { useState, useEffect, useCallback } from 'react';
import {
  X, MessageCircle, ChevronDown, ChevronLeft, ChevronRight,
  Settings, Fuel, Users, Gauge, Tag, ZoomIn,
} from 'lucide-react';
import type { Car as CarType } from '@/lib/supabase';
import { getCarImages } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n';

// ─── Constants ──────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = '+995596078800';

type TierKey = 'day1' | 'day2' | 'day3_4' | 'day5_7' | 'day8plus';
interface Tier { key: TierKey; label: string; price: number }

// ─── Lightbox ────────────────────────────────────────────────────────────────
interface LightboxProps {
  images: string[];
  startIdx: number;
  onClose: () => void;
}

function Lightbox({ images, startIdx, onClose }: LightboxProps) {
  const [idx, setIdx] = useState(startIdx);
  const count = images.length;

  const prev = useCallback(() => setIdx(i => Math.max(0, i - 1)),        []);
  const next = useCallback(() => setIdx(i => Math.min(count - 1, i + 1)), [count]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, prev, next]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label="Image lightbox"
    >
      {/* Image — stop propagation so clicking the image itself doesn't close */}
      <div
        className="relative flex items-center justify-center w-full h-full px-16 py-12"
        onClick={e => e.stopPropagation()}
      >
        <img
          key={idx}
          src={images[idx]}
          alt={`Photo ${idx + 1} of ${count}`}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none"
          draggable={false}
        />

        {/* Counter */}
        {count > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full pointer-events-none tabular-nums">
            {idx + 1} / {count}
          </div>
        )}

        {/* Prev */}
        {count > 1 && (
          <button
            onClick={prev}
            disabled={idx === 0}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            aria-label="Previous photo"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Next */}
        {count > 1 && (
          <button
            onClick={next}
            disabled={idx === count - 1}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            aria-label="Next photo"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* Thumbnail strip at the bottom */}
        {count > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] px-2 pb-1">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`flex-shrink-0 rounded-md overflow-hidden border-2 transition-all duration-150 ${
                  i === idx
                    ? 'border-white opacity-100 scale-105'
                    : 'border-white/20 opacity-50 hover:opacity-80'
                }`}
                aria-label={`View photo ${i + 1}`}
              >
                <img
                  src={src}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-14 h-10 object-cover"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Close — always accessible, outside the stop-propagation zone */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-colors z-10"
        aria-label="Close lightbox"
      >
        <X size={20} />
      </button>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────
interface CarDetailModalProps {
  car: CarType;
  onClose: () => void;
}

export function CarDetailModal({ car, onClose }: CarDetailModalProps) {
  const { t } = useLanguage();
  const images = getCarImages(car);

  // ── Tiers ────────────────────────────────────────────────────────────────
  const tiers: Tier[] = [{ key: 'day1', label: t.card.tiers.day1, price: car.price_per_day }];
  if (car.price_2_day)      tiers.push({ key: 'day2',    label: t.card.tiers.day2,    price: car.price_2_day });
  if (car.price_3_4_day)    tiers.push({ key: 'day3_4',  label: t.card.tiers.day3_4,  price: car.price_3_4_day });
  if (car.price_5_7_day)    tiers.push({ key: 'day5_7',  label: t.card.tiers.day5_7,  price: car.price_5_7_day });
  if (car.price_8_plus_day) tiers.push({ key: 'day8plus',label: t.card.tiers.day8plus,price: car.price_8_plus_day });

  // ── State ────────────────────────────────────────────────────────────────
  const defaultTier = tiers[tiers.length - 1].key;
  const [selectedTierKey, setSelectedTierKey] = useState<TierKey>(defaultTier);
  const [includeDriver, setIncludeDriver]     = useState(false);
  const [activeIdx, setActiveIdx]             = useState(0);
  const [lightboxIdx, setLightboxIdx]         = useState<number | null>(null);

  // ── Lock body scroll ─────────────────────────────────────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // ── Keyboard navigation (modal level — lightbox has its own handler) ──────
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (lightboxIdx !== null) return;          // lightbox takes over
    if (e.key === 'Escape')     onClose();
    if (e.key === 'ArrowLeft')  setActiveIdx(i => Math.max(0, i - 1));
    if (e.key === 'ArrowRight') setActiveIdx(i => Math.min(images.length - 1, i + 1));
  }, [onClose, images.length, lightboxIdx]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // ── Price computation ────────────────────────────────────────────────────
  const activeTier = tiers.find(t => t.key === selectedTierKey) ?? tiers[0];
  const tierPrice  = activeTier.price;
  const driverAddon = includeDriver && car.price_with_driver ? car.price_with_driver : 0;
  const totalPrice  = tierPrice + driverAddon;

  const tierOriginalPrice: number | null = (() => {
    switch (selectedTierKey) {
      case 'day1':    return car.orig_price_1_day      ?? null;
      case 'day2':    return car.orig_price_2_day      ?? null;
      case 'day3_4':  return car.orig_price_3_4_day    ?? null;
      case 'day5_7':  return car.orig_price_5_7_day    ?? null;
      case 'day8plus':return car.orig_price_8_plus_day ?? null;
    }
  })();

  const hasDriver = !!car.price_with_driver;
  const hasTiers  = tiers.length > 1;

  // ── Reserve ──────────────────────────────────────────────────────────────
  const handleReserve = () => {
    const driverOptionLabel = includeDriver && car.price_with_driver
      ? `${t.card.withDriver} (+$${car.price_with_driver}${t.card.day})`
      : t.card.withoutDriver;
    const msg = t.card.reserveMsg(
      car.brand, car.model, car.year,
      activeTier.label, driverOptionLabel, totalPrice,
      includeDriver ? car.price_with_driver : null,
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Lightbox (renders above everything) ── */}
      {lightboxIdx !== null && (
        <Lightbox
          images={images}
          startIdx={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}

      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Panel ── */}
      <div className="fixed inset-0 z-50 overflow-y-auto flex px-4 py-16">
        <div
          className="relative w-full max-w-4xl max-h-[90vh] m-auto rounded-2xl overflow-hidden shadow-2xl bg-card border border-border"
          onClick={e => e.stopPropagation()}
        >
          {/* ── Close button ── */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 bg-black/60 text-white rounded-full hover:bg-black transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* ── Main grid: stacked on mobile, side-by-side on md+ ── */}
          <div className="flex flex-col md:grid md:grid-cols-[55%_45%]">

            {/* ══════════════ LEFT — Gallery ══════════════ */}
            <div className="flex flex-col bg-black/20 md:h-full">

              {/* ── Main image — taller hero, clickable to open lightbox ── */}
              <div
                className="group relative w-full overflow-hidden bg-neutral-950 select-none"
                style={{ minHeight: '320px', maxHeight: '480px', height: '45vw' }}
              >
                {images.length > 0 ? (
                  <>
                    <img
                      key={activeIdx}
                      src={images[activeIdx]}
                      alt={`${car.brand} ${car.model} — photo ${activeIdx + 1}`}
                      className="w-full h-full object-cover object-center cursor-zoom-in"
                      draggable={false}
                      onClick={() => setLightboxIdx(activeIdx)}
                    />
                    {/* Zoom hint overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-zoom-in pointer-events-none"
                    >
                      <div className="bg-black/50 backdrop-blur-sm rounded-full p-3">
                        <ZoomIn size={22} className="text-white" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    <Settings size={64} />
                  </div>
                )}

                {/* Prev / Next arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={e => { e.stopPropagation(); setActiveIdx(i => Math.max(0, i - 1)); }}
                      disabled={activeIdx === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed z-10"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setActiveIdx(i => Math.min(images.length - 1, i + 1)); }}
                      disabled={activeIdx === images.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed z-10"
                      aria-label="Next photo"
                    >
                      <ChevronRight size={20} />
                    </button>

                    {/* Image counter badge */}
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full pointer-events-none tabular-nums">
                      {activeIdx + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* ── Thumbnail strip — extra top padding for breathing room ── */}
              {images.length > 1 && (
                <div className="flex gap-2 pt-4 pb-3 px-3 overflow-x-auto scrollbar-thin bg-black/30">
                  {images.map((src, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setActiveIdx(idx); setLightboxIdx(idx); }}
                      className={`
                        flex-shrink-0 overflow-hidden border-2 transition-all duration-150 rounded-md
                        ${idx === activeIdx
                          ? 'border-primary ring-1 ring-primary/40 opacity-100'
                          : 'border-transparent opacity-50 hover:opacity-80 hover:border-white/30'}
                      `}
                      aria-label={`View photo ${idx + 1}`}
                    >
                      <img
                        src={src}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-16 h-11 object-cover rounded-sm"
                        draggable={false}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ══════════════ RIGHT — Details ══════════════ */}
            <div className="flex flex-col p-5 md:p-6 overflow-y-auto md:max-h-[calc(100vh-3rem)]">

              {/* ── Title ── */}
              <div className="mb-4">
                {car.year && (
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">{car.year}</p>
                )}
                <h2 className="text-2xl font-bold tracking-tight leading-tight">
                  {car.brand} {car.model}
                </h2>
              </div>

              {/* ── Dynamic price display ── */}
              <div className="flex items-end gap-3 mb-5">
                <span className="text-4xl font-black text-green-500 leading-none">${totalPrice}</span>
                {tierOriginalPrice && tierOriginalPrice > tierPrice && (
                  <span className="text-xl font-semibold line-through text-red-500/70 leading-none mb-0.5">
                    ${tierOriginalPrice}
                  </span>
                )}
                <span className="text-sm text-muted-foreground mb-0.5">{t.card.day}</span>
                {driverAddon > 0 && (
                  <span className="text-xs text-muted-foreground/70 ml-auto mb-0.5">
                    +${driverAddon} {t.card.withDriver}
                  </span>
                )}
              </div>

              {/* ── Rental period radios ── */}
              {hasTiers && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2">
                    {t.card.rentalPeriod}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tiers.map(tier => (
                      <label
                        key={tier.key}
                        className={`
                          cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all select-none
                          ${selectedTierKey === tier.key
                            ? 'bg-primary/15 border-primary/60 text-primary'
                            : 'bg-secondary/40 border-border text-muted-foreground hover:border-white/20 hover:text-foreground'}
                        `}
                      >
                        <input
                          type="radio"
                          name={`detail-tier-${car.id}`}
                          value={tier.key}
                          checked={selectedTierKey === tier.key}
                          onChange={() => setSelectedTierKey(tier.key)}
                          className="sr-only"
                        />
                        {tier.label}
                        <span className="ml-1 opacity-60">${tier.price}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Driver option ── */}
              {hasDriver && (
                <div className="mb-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2">
                    {t.card.driverLabel}
                  </p>
                  <div className="relative">
                    <select
                      value={includeDriver ? 'with' : 'without'}
                      onChange={e => setIncludeDriver(e.target.value === 'with')}
                      className="w-full appearance-none bg-secondary/40 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground font-medium cursor-pointer hover:border-white/20 transition-colors focus:outline-none focus:ring-1 focus:ring-primary/50 pr-8"
                    >
                      <option value="without">{t.card.withoutDriver}</option>
                      <option value="with">{t.card.withDriver} (+${car.price_with_driver}{t.card.day})</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              )}

              {/* ── RESERVE CTA ── */}
              <button
                onClick={handleReserve}
                className="w-full bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 shadow-lg shadow-green-500/25 uppercase tracking-wider text-sm mb-6"
              >
                <MessageCircle size={18} />
                {t.card.reserve}
              </button>

              {/* ── Divider ── */}
              <div className="border-t border-border/50 mb-5" />

              {/* ── Specifications ── */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  Specifications
                </p>
                <SpecRow icon={<Settings size={15} />} label="Transmission" value={car.transmission} capitalize />
                <SpecRow icon={<Fuel size={15} />}     label="Fuel Type"     value={car.fuel_type} />
                <SpecRow icon={<Users size={15} />}    label="Seats"         value={`${car.seats} ${t.card.seats}`} />
                {car.engine  && <SpecRow icon={<Gauge size={15} />} label="Engine"   value={car.engine} />}
                {car.mileage && <SpecRow icon={<Gauge size={15} />} label="Mileage"  value={car.mileage} />}
              </div>

              {/* ── Features ── */}
              {car.features && car.features.length > 0 && (
                <div className="mt-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2.5">
                    Features
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {car.features.map((feat, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 px-2.5 py-1 bg-secondary rounded-lg text-xs font-medium text-muted-foreground border border-white/5"
                      >
                        <Tag size={10} className="text-primary/70" />
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Spec row helper ─────────────────────────────────────────────────────────
function SpecRow({
  icon, label, value, capitalize,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-primary/60">{icon}</span>
        {label}
      </span>
      <span className={`text-sm font-semibold text-foreground ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </span>
    </div>
  );
}
