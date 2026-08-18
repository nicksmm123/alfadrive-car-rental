import { useState, useCallback, useEffect, useRef } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import { ZoomIn, ZoomOut, RotateCcw, Loader2, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCroppedImg } from '@/lib/crop-image';

interface ImageCropperModalProps {
  /** URL or blob: URL of the image to crop */
  src: string;
  /** Label shown in the header, e.g. "Photo 2 of 5" */
  label?: string;
  aspect?: number;
  /** Called with the cropped JPEG blob */
  onCrop: (blob: Blob) => Promise<void>;
  /** Skip cropping and keep the raw original (only for queue items, not re-crop) */
  onSkip?: () => Promise<void>;
  /** Cancel cropping this item (and the whole queue) */
  onCancel: () => void;
  /** @deprecated no longer used — processing state is managed internally */
  uploading?: boolean;
}

const DEFAULT_CROP: Point = { x: 0, y: 0 };
const DEFAULT_ZOOM = 1;
// 4:3 matches the public card image container (aspect-[4/3]).
// Changing this value requires updating CarImageGallery.tsx in lockstep.
const ASPECT = 4 / 3;

export function ImageCropperModal({
  src,
  label,
  aspect = ASPECT,
  onCrop,
  onSkip,
  onCancel,
}: ImageCropperModalProps) {
  const [crop, setCrop]                         = useState<Point>(DEFAULT_CROP);
  const [zoom, setZoom]                         = useState(DEFAULT_ZOOM);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [error, setError]                       = useState('');
  const [processing, setProcessing]             = useState(false);

  // ── CORS fix: convert remote URLs to local blob URLs ─────────────────────
  // canvas.toBlob() throws a "tainted canvas" SecurityError when the source
  // image was loaded from a cross-origin URL (e.g. Supabase Storage).
  // Fetching the image first and converting to a local object URL sidesteps
  // the restriction entirely — the browser treats blob: URLs as same-origin.
  const [localSrc, setLocalSrc]     = useState<string | null>(
    src.startsWith('blob:') ? src : null,   // blob: URLs are already safe
  );
  const [loadingImg, setLoadingImg] = useState(!src.startsWith('blob:'));
  const objectUrlRef                = useRef<string | null>(null);

  useEffect(() => {
    if (src.startsWith('blob:')) {
      // Already a local blob — no fetch needed, use directly
      setLocalSrc(src);
      setLoadingImg(false);
      return;
    }

    // Remote URL: fetch → blob → object URL
    let cancelled = false;
    setLoadingImg(true);
    setError('');

    (async () => {
      try {
        const res  = await fetch(src);
        if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`);
        const blob = await res.blob();
        if (cancelled) { URL.revokeObjectURL(URL.createObjectURL(blob)); return; }
        const objUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objUrl;
        setLocalSrc(objUrl);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load image for cropping');
      } finally {
        if (!cancelled) setLoadingImg(false);
      }
    })();

    return () => {
      cancelled = true;
      // Revoke the object URL we created (not the original blob: from parent)
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [src]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleReset = () => {
    setCrop(DEFAULT_CROP);
    setZoom(DEFAULT_ZOOM);
  };

  const handleCropSave = async () => {
    // localSrc is the blob: URL fetched from Supabase — always use it here,
    // never `src` directly. Using the original https:// URL would re-taint
    // the canvas the moment drawImage() runs, making toBlob() return null.
    if (!croppedAreaPixels || !localSrc) return;
    setError('');
    setProcessing(true);
    try {
      console.log('[ImageCropperModal] Generating cropped blob from localSrc:', localSrc);
      const blob = await getCroppedImg(localSrc, croppedAreaPixels, 'image/jpeg', 0.95);
      console.log('[ImageCropperModal] Cropped blob created:', blob.size, 'bytes, type:', blob.type);
      await onCrop(blob);
      console.log('[ImageCropperModal] onCrop callback completed — blob handed to form');
    } catch (err) {
      console.error('[ImageCropperModal] Crop failed:', err);
      setError(err instanceof Error ? err.message : 'Crop failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    /* Full-screen overlay — sits above the vehicle form dialog */
    <div className="fixed inset-0 z-[200] flex flex-col bg-black/95 backdrop-blur">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <Scissors size={16} className="text-primary" />
          <span className="text-sm font-semibold text-white">Adjust &amp; Crop Photo</span>
          {label && (
            <span className="text-xs text-white/50 bg-white/10 rounded-full px-2 py-0.5">{label}</span>
          )}
        </div>
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="text-xs text-white/50 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10 disabled:opacity-40"
        >
          Cancel
        </button>
      </div>

      {/* ── Crop area ── */}
      <div className="relative flex-1 min-h-0">
        {loadingImg ? (
          /* Fetching remote image to local blob — avoids tainted-canvas CORS error */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/50">
            <Loader2 size={32} className="animate-spin text-primary" />
            <span className="text-xs">Loading image…</span>
          </div>
        ) : localSrc ? (
          <Cropper
            image={localSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
            showGrid
            style={{
              containerStyle: { background: '#0a0a0a' },
              cropAreaStyle: {
                border: '2px solid hsl(var(--primary))',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
              },
            }}
          />
        ) : null}
      </div>

      {/* ── Controls ── */}
      <div className="shrink-0 border-t border-white/10 bg-black/60 backdrop-blur px-5 py-4 space-y-4">

        {/* Zoom row */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setZoom(z => Math.max(1, z - 0.1))}
            disabled={zoom <= 1}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-30 transition-colors shrink-0"
          >
            <ZoomOut size={15} />
          </button>

          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="flex-1 accent-[hsl(var(--primary))] cursor-pointer h-1 rounded-full"
          />

          <button
            type="button"
            onClick={() => setZoom(z => Math.min(4, z + 0.1))}
            disabled={zoom >= 4}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-30 transition-colors shrink-0"
          >
            <ZoomIn size={15} />
          </button>

          <button
            type="button"
            onClick={handleReset}
            title="Reset zoom & position"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors shrink-0"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Aspect ratio hint */}
        <p className="text-[11px] text-white/35 text-center -mt-1">
          4:3 ratio · matches the public card · drag to reframe · scroll to zoom
        </p>

        {/* Error */}
        {error && (
          <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-center">{error}</p>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {onSkip && (
            <Button
              type="button"
              variant="outline"
              onClick={onSkip}
              disabled={processing}
              className="flex-1 border-white/20 text-white/70 hover:text-white hover:bg-white/10 bg-transparent"
            >
              Skip crop
            </Button>
          )}
          <Button
            type="button"
            onClick={handleCropSave}
            disabled={processing || !croppedAreaPixels}
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold"
          >
            {processing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
            ) : (
              'Crop & Save'
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}
