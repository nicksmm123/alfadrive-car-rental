import { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Car } from 'lucide-react';

interface CarImageGalleryProps {
  images: string[];
  alt: string;
}

const SWIPE_THRESHOLD = 40; // px — minimum horizontal distance to register a swipe

export function CarImageGallery({ images, alt }: CarImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const count = images.length;
  // Guard against stale index when images array length changes
  const safeIdx = count > 0 ? Math.min(activeIdx, count - 1) : 0;

  const prev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIdx(i => (i - 1 + count) % count);
  }, [count]);

  const next = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIdx(i => (i + 1) % count);
  }, [count]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    // Only fire if the horizontal component dominates (not a vertical scroll)
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) next();
      else prev();
    }
  };

  /* ── Empty state ────────────────────────────────────────────────────────── */
  if (count === 0) {
    return (
      <div className="w-full h-72 bg-neutral-900 flex items-center justify-center">
        <Car size={52} className="opacity-10 text-muted-foreground" />
      </div>
    );
  }

  /* ── Single image — no carousel controls needed ─────────────────────────── */
  if (count === 1) {
    return (
      <div className="w-full h-72 bg-neutral-900 overflow-hidden">
        <img
          src={images[0]}
          alt={alt}
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>
    );
  }

  /* ── Multi-image carousel ───────────────────────────────────────────────── */
  // Cap dots at 7; beyond that the counter badge is the cleaner indicator
  const showDots = count <= 7;

  return (
    <div
      className="group relative w-full h-72 bg-neutral-900 overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Active image ──────────────────────────────────────────────────── */}
      <img
        key={safeIdx}
        src={images[safeIdx]}
        alt={`${alt} — photo ${safeIdx + 1} of ${count}`}
        className="w-full h-full object-contain transition-opacity duration-300"
        draggable={false}
      />

      {/* Subtle gradient edges so arrows read against any photo colour */}
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/30 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/30 to-transparent pointer-events-none" />

      {/* ← Prev arrow — hidden by default, appears on hover/focus */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous photo"
        className="
          absolute left-2.5 top-1/2 -translate-y-1/2
          w-9 h-9 rounded-full
          bg-black/60 backdrop-blur-sm
          flex items-center justify-center text-white
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          hover:bg-black/85 active:scale-95
          focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
        "
      >
        <ChevronLeft size={18} strokeWidth={2.5} />
      </button>

      {/* → Next arrow — hidden by default, appears on hover/focus */}
      <button
        type="button"
        onClick={next}
        aria-label="Next photo"
        className="
          absolute right-2.5 top-1/2 -translate-y-1/2
          w-9 h-9 rounded-full
          bg-black/60 backdrop-blur-sm
          flex items-center justify-center text-white
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          hover:bg-black/85 active:scale-95
          focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
        "
      >
        <ChevronRight size={18} strokeWidth={2.5} />
      </button>

      {/* ── Bottom bar: dots (≤7 images) or counter (>7 images) ────────────── */}
      <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

      {showDots ? (
        /* Dot indicators — clickable, pill shape for active */
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-auto">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={e => { e.stopPropagation(); setActiveIdx(i); }}
              aria-label={`Go to photo ${i + 1}`}
              className={`rounded-full transition-all duration-200 ${
                i === safeIdx
                  ? 'w-5 h-1.5 bg-white shadow-md'
                  : 'w-1.5 h-1.5 bg-white/55 hover:bg-white/85'
              }`}
            />
          ))}
        </div>
      ) : (
        /* Counter badge when there are too many dots to show cleanly */
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-[11px] text-white font-semibold pointer-events-none tabular-nums">
          {safeIdx + 1} / {count}
        </div>
      )}
    </div>
  );
}
