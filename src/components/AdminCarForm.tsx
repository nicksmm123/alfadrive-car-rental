import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase, Car, type CarInsert, type CarStatus, getCarImages } from '@/lib/supabase';
import { useCreateCar, useUpdateCar } from '@/hooks/use-cars';
import { useLanguage } from '@/lib/i18n';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, X, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

// ── Form schema ───────────────────────────────────────────────────────────────

const optionalPrice = z.coerce.number().min(1).optional().nullable()
  .or(z.literal('').transform(() => null));

const formSchema = z.object({
  brand:                z.string().min(1),
  model:                z.string().min(1),
  year:                 z.preprocess(
                          v => (v === '' || v === null || v === undefined) ? null : Number(v),
                          z.number().int().min(1900).max(new Date().getFullYear() + 1).nullable().optional()
                        ),
  price_per_day:        z.coerce.number().min(1),
  price_2_day:          optionalPrice,
  price_3_4_day:        optionalPrice,
  price_5_7_day:        optionalPrice,
  price_8_plus_day:     optionalPrice,
  price_with_driver:    optionalPrice,
  orig_price_1_day:     optionalPrice,
  orig_price_2_day:     optionalPrice,
  orig_price_3_4_day:   optionalPrice,
  orig_price_5_7_day:   optionalPrice,
  orig_price_8_plus_day: optionalPrice,
  transmission:         z.enum(['automatic', 'manual']),
  fuel_type:            z.string().min(1),
  seats:                z.coerce.number().min(1),
  engine:               z.string().optional().nullable(),
  mileage:              z.string().optional().nullable(),
  features:             z.string().optional().nullable(),
  status:               z.enum(['available', 'rented', 'maintenance', 'inactive']),
});

type FormValues = z.infer<typeof formSchema>;

interface AdminCarFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  car?: Car | null;
}

const EMPTY_DEFAULTS: FormValues = {
  brand: '', model: '',
  year: null,
  price_per_day: 50,
  price_2_day: null, price_3_4_day: null,
  price_5_7_day: null, price_8_plus_day: null, price_with_driver: null,
  orig_price_1_day: null, orig_price_2_day: null,
  orig_price_3_4_day: null, orig_price_5_7_day: null, orig_price_8_plus_day: null,
  transmission: 'automatic', fuel_type: 'Petrol', seats: 5,
  engine: '', mileage: '', features: '',
  status: 'available',
};

// ── Unified image entry ───────────────────────────────────────────────────────
// Every photo in the gallery is one of:
//   • pending  — has file + blob: url, awaiting upload on submit
//   • saved    — has no file, https: url already in Supabase Storage
interface ImageEntry {
  id: string;       // stable key via crypto.randomUUID()
  file?: File;      // defined only for pending uploads
  url: string;      // blob: (pending) or https: (saved)
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AdminCarForm({ open, onOpenChange, car }: AdminCarFormProps) {
  const createCar = useCreateCar();
  const updateCar = useUpdateCar();
  const { t } = useLanguage();
  const f = t.admin.form;

  const isEditing = !!car;
  const isPending = createCar.isPending || updateCar.isPending;

  // ── Image state ───────────────────────────────────────────────────────────
  const [images, setImages]         = useState<ImageEntry[]>([]);
  // Mirror of images in a ref — onSubmit reads this so it ALWAYS sees the
  // latest entries regardless of closure age or effect re-runs.
  const imagesRef                   = useRef<ImageEntry[]>([]);
  // Keep ref in sync on every render (runs synchronously before paint)
  imagesRef.current                 = images;

  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput]     = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Form ──────────────────────────────────────────────────────────────────
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  useEffect(() => {
    if (open) {
      const vals: FormValues = car ? {
        brand: car.brand, model: car.model, year: car.year ?? null,
        price_per_day: car.price_per_day,
        price_2_day: car.price_2_day ?? null,
        price_3_4_day: car.price_3_4_day ?? null,
        price_5_7_day: car.price_5_7_day ?? null,
        price_8_plus_day: car.price_8_plus_day ?? null,
        price_with_driver: car.price_with_driver ?? null,
        orig_price_1_day: car.orig_price_1_day ?? null,
        orig_price_2_day: car.orig_price_2_day ?? null,
        orig_price_3_4_day: car.orig_price_3_4_day ?? null,
        orig_price_5_7_day: car.orig_price_5_7_day ?? null,
        orig_price_8_plus_day: car.orig_price_8_plus_day ?? null,
        transmission: car.transmission, fuel_type: car.fuel_type, seats: car.seats,
        engine: car.engine || '', mileage: car.mileage || '',
        features: car.features ? car.features.join(', ') : '',
        status: (car.status as CarStatus) ?? (car.available ? 'available' : 'inactive'),
      } : EMPTY_DEFAULTS;
      form.reset(vals);
      // Revoke any leftover blobs from a previous session, then seed from car
      setImages(prev => {
        prev.forEach(e => { if (e.url.startsWith('blob:')) URL.revokeObjectURL(e.url); });
        return car
          ? getCarImages(car).map(url => ({ id: crypto.randomUUID(), url }))
          : [];
      });
      setUrlInput('');
      setUploadError('');
    } else {
      // Revoke any leftover blobs when form closes
      setImages(prev => {
        prev.forEach(e => { if (e.url.startsWith('blob:')) URL.revokeObjectURL(e.url); });
        return prev;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [car, open]); // `form` intentionally omitted — form.reset() can change its
                   // reference in some RHF versions, causing this effect to re-run
                   // and wipe the images[] state that was built up during cropping.

  // ── File picker → append entries directly (no crop step) ────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadError('');
    const newEntries: ImageEntry[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
    }));
    setImages(prev => [...prev, ...newEntries]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── URL add ───────────────────────────────────────────────────────────────
  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
      setImages(prev => [...prev, { id: crypto.randomUUID(), url: trimmed }]);
      setUrlInput('');
      setUploadError('');
    } catch {
      setUploadError('Please enter a valid URL (must start with https://)');
    }
  };

  // ── Gallery helpers ───────────────────────────────────────────────────────
  const removeImage = (id: string) => {
    setImages(prev => {
      const entry = prev.find(e => e.id === id);
      if (entry?.url.startsWith('blob:')) URL.revokeObjectURL(entry.url);
      return prev.filter(e => e.id !== id);
    });
  };

  const moveImage = (id: string, dir: -1 | 1) => {
    setImages(prev => {
      const idx = prev.findIndex(e => e.id === id);
      const to = idx + dir;
      if (idx < 0 || to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[to]] = [next[to], next[idx]];
      return next;
    });
  };

  // ── Submit — sequential explicit upload, then DB save ────────────────────
  const onSubmit = async (values: FormValues) => {
    setIsUploading(true);
    setUploadError('');

    // Always read from the ref — never from the closure — so we see the
    // latest cropped files even if a stale closure or effect re-run wiped state.
    const currentImages = imagesRef.current;

    const pendingCount = currentImages.filter(e => !!e.file).length;
    console.log(
      `[AdminCarForm] onSubmit start — ${currentImages.length} total image(s), ` +
      `${pendingCount} pending upload (${pendingCount > 0 ? currentImages.filter(e=>!!e.file).map(e=>e.file!.name).join(', ') : 'none'}), ` +
      `${currentImages.length - pendingCount} already saved`,
    );

    try {
      // Snapshot blob: URLs so we can revoke them after a confirmed DB save
      const pendingBlobUrls = currentImages
        .filter(e => e.url.startsWith('blob:'))
        .map(e => e.url);

      // ── Upload every pending file sequentially ──
      // Sequential (not Promise.all) so errors are attributed to a specific photo.
      const finalImages: string[] = [];

      for (let i = 0; i < currentImages.length; i++) {
        const item = currentImages[i];

        if (item.file) {
          // ── Pending: upload to Supabase Storage ──
          const isCropped = item.file.name.startsWith('primary_cropped_');
          const rawExt = item.file.name.split('.').pop() ?? '';
          const ext = /^[a-z0-9]+$/i.test(rawExt) ? rawExt.toLowerCase() : 'jpg';
          const fileName = `car_${Date.now()}_${i}.${ext}`;

          console.log(
            `[AdminCarForm] Uploading ${isCropped ? '✂️ CROPPED' : 'original'} photo ` +
            `${i + 1}/${images.length}: "${item.file.name}" → "${fileName}" ` +
            `(${(item.file.size / 1024).toFixed(1)} KB)`,
          );

          const { data, error } = await supabase.storage
            .from('car-images')
            .upload(fileName, item.file, { cacheControl: '3600', upsert: false });

          if (error) {
            throw new Error(
              `Photo ${i + 1} ("${item.file.name}") upload failed: ${error.message}`,
            );
          }

          const { data: { publicUrl } } = supabase.storage
            .from('car-images')
            .getPublicUrl(data.path);

          if (!publicUrl || !publicUrl.startsWith('http')) {
            throw new Error(
              `Photo ${i + 1}: Supabase returned an invalid public URL ("${publicUrl}"). ` +
              'Verify that the "car-images" bucket is set to Public.',
            );
          }

          console.log(`[AdminCarForm] Photo ${i + 1} uploaded ✓`, publicUrl);
          finalImages.push(publicUrl);

        } else if (item.url.startsWith('http')) {
          // ── Already saved: pass through unchanged ──
          console.log(`[AdminCarForm] Photo ${i + 1} already saved, keeping:`, item.url);
          finalImages.push(item.url);

        } else {
          // ── Unrecoverable: blob without a File object ──
          throw new Error(
            `Photo ${i + 1} has a local preview but no file to upload. ` +
            'Please remove it and re-add.',
          );
        }
      }

      // ── Debug alert when some uploads appear to have gone missing ──
      if (pendingCount >= 2 && finalImages.length < images.length) {
        const msg =
          `Warning: expected ${images.length} photos but only ${finalImages.length} ` +
          `were processed. Check the console for details.`;
        console.warn(`[AdminCarForm] ${msg}`);
        alert(msg);
      }

      console.log(`[AdminCarForm] Final images array (${finalImages.length}):`, finalImages);

      // Replace state with permanent URLs so the gallery shows real images
      // and any retry re-uses them without re-uploading
      setImages(finalImages.map(url => ({ id: crypto.randomUUID(), url })));

      // ── Build DB payload ──
      const featuresArray = values.features
        ? values.features.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const carData: CarInsert = {
        brand: values.brand, model: values.model, year: values.year ?? null,
        price_per_day: values.price_per_day,
        price_2_day: values.price_2_day || null,
        price_3_4_day: values.price_3_4_day || null,
        price_5_7_day: values.price_5_7_day || null,
        price_8_plus_day: values.price_8_plus_day || null,
        price_with_driver: values.price_with_driver || null,
        orig_price_1_day: values.orig_price_1_day || null,
        orig_price_2_day: values.orig_price_2_day || null,
        orig_price_3_4_day: values.orig_price_3_4_day || null,
        orig_price_5_7_day: values.orig_price_5_7_day || null,
        orig_price_8_plus_day: values.orig_price_8_plus_day || null,
        transmission: values.transmission, fuel_type: values.fuel_type, seats: values.seats,
        engine: values.engine || null, mileage: values.mileage || null,
        features: featuresArray.length > 0 ? featuresArray : null,
        // All photos (cover = index 0, rest = additional) in the images array.
        // image_url mirrors index 0 for backward compatibility.
        images: finalImages.length > 0 ? finalImages : null,
        image_url: finalImages[0] ?? null,
        status: values.status,
        available: values.status === 'available',
      };

      console.log('[AdminCarForm] DB payload — images:', carData.images);

      const handleMutationError = (err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[AdminCarForm] DB mutation error:', msg);
        setUploadError(msg || f.uploadErrorGeneric);
      };

      // Revoke blob: URLs only after the DB record is confirmed written
      const handleSuccess = () => {
        console.log('[AdminCarForm] Save successful, revoking blob URLs');
        pendingBlobUrls.forEach(url => URL.revokeObjectURL(url));
        onOpenChange(false);
      };

      if (isEditing && car?.id) {
        updateCar.mutate(
          { id: car.id, car: carData },
          { onSuccess: handleSuccess, onError: handleMutationError },
        );
      } else {
        createCar.mutate(
          carData,
          { onSuccess: handleSuccess, onError: handleMutationError },
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[AdminCarForm] Upload error:', msg);
      setUploadError(msg || f.uploadErrorGeneric);
    } finally {
      setIsUploading(false);
    }
  };

  const STATUS_OPTIONS: { value: CarStatus; label: string }[] = [
    { value: 'available',   label: f.statusAvailable   },
    { value: 'rented',      label: f.statusRented      },
    { value: 'maintenance', label: f.statusMaintenance },
    { value: 'inactive',    label: f.statusInactive    },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[680px] bg-card text-card-foreground border-border max-h-[92dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {isEditing ? f.editTitle : f.addTitle}
            </DialogTitle>
            <DialogDescription className="sr-only">Vehicle form</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-2">

              {/* ── Photos ───────────────────────────────────────────────── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">{f.photo}</label>
                  {images.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {images.length} photo{images.length !== 1 ? 's' : ''} · first = cover
                      {images.some(e => e.file) && (
                        <span className="ml-1 text-amber-400">
                          · {images.filter(e => e.file).length} pending
                        </span>
                      )}
                    </span>
                  )}
                </div>

                {/* ── Gallery grid ── */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {images.map((entry, i) => (
                      <div
                        key={entry.id}
                        className="relative group aspect-[4/3] rounded-xl overflow-hidden border border-border bg-secondary"
                      >
                        <img
                          src={entry.url}
                          alt={`Photo ${i + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {/* Cover badge */}
                        {i === 0 && (
                          <div className="absolute top-1.5 left-1.5 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none pointer-events-none">
                            COVER
                          </div>
                        )}

                        {/* Pending-upload badge — file is queued for upload on submit */}
                        {entry.file && (
                          <div className="absolute bottom-1.5 left-1.5 bg-amber-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-none pointer-events-none">
                            {entry.file.name.startsWith('primary_cropped_') ? 'CROPPED' : 'PENDING'}
                          </div>
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => removeImage(entry.id)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/80"
                          title="Remove photo"
                        >
                          <X size={12} />
                        </button>

                        {/* Reorder */}
                        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {i > 0 && (
                            <button
                              type="button"
                              onClick={() => moveImage(entry.id, -1)}
                              className="w-6 h-6 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black/90"
                              title="Move left"
                            >
                              <ChevronLeft size={12} />
                            </button>
                          )}
                          {i < images.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveImage(entry.id, 1)}
                              className="w-6 h-6 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black/90"
                              title="Move right"
                            >
                              <ChevronRight size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Add-more tile */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-[4/3] rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-secondary/30 hover:bg-secondary/50 transition-colors flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <Plus size={20} />
                      <span className="text-xs font-medium">Add photo</span>
                    </button>
                  </div>
                )}

                {/* Empty state */}
                {images.length === 0 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-secondary/30 hover:bg-secondary/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Upload size={22} />
                    <span className="text-xs font-medium">{f.uploadPhoto}</span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* Upload-more button */}
                {images.length > 0 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-white/20 bg-secondary/30"
                  >
                    <Upload size={12} />
                    Upload more photos
                  </button>
                )}

                {/* URL input */}
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">{f.orPasteUrl}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder={f.urlPlaceholder}
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())}
                    className="flex-1 bg-secondary/50 border-border text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addUrl}
                    disabled={!urlInput.trim()}
                    className="shrink-0"
                  >
                    Add
                  </Button>
                </div>

                {uploadError && (
                  <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2 whitespace-pre-wrap">
                    {uploadError}
                  </p>
                )}
              </div>

              {/* ── Brand / Model / Year ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField control={form.control} name="brand" render={({ field }) => (
                  <FormItem>
                    <label className="text-sm font-medium text-foreground">{f.brand}</label>
                    <FormControl><Input placeholder="BMW" {...field} className="bg-secondary/50 border-border" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="model" render={({ field }) => (
                  <FormItem>
                    <label className="text-sm font-medium text-foreground">{f.model}</label>
                    <FormControl><Input placeholder="X5" {...field} className="bg-secondary/50 border-border" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="year" render={({ field }) => (
                  <FormItem>
                    <label className="text-sm font-medium text-foreground">{f.year}</label>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value === '' ? null : e.target.value)}
                        className="bg-secondary/50 border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* ── Specs ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField control={form.control} name="seats" render={({ field }) => (
                  <FormItem>
                    <label className="text-sm font-medium text-foreground">{f.seats}</label>
                    <FormControl><Input type="number" {...field} className="bg-secondary/50 border-border" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="transmission" render={({ field }) => (
                  <FormItem>
                    <label className="text-sm font-medium text-foreground">{f.transmission}</label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="automatic">{f.automatic}</SelectItem>
                        <SelectItem value="manual">{f.manual}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="fuel_type" render={({ field }) => (
                  <FormItem>
                    <label className="text-sm font-medium text-foreground">{f.fuelType}</label>
                    <FormControl><Input placeholder={f.fuelPlaceholder} {...field} className="bg-secondary/50 border-border" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField control={form.control} name="engine" render={({ field }) => (
                  <FormItem>
                    <label className="text-sm font-medium text-foreground">{f.engine}</label>
                    <FormControl><Input placeholder={f.enginePlaceholder} {...field} value={field.value || ''} className="bg-secondary/50 border-border" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="mileage" render={({ field }) => (
                  <FormItem>
                    <label className="text-sm font-medium text-foreground">{f.mileage}</label>
                    <FormControl><Input placeholder={f.mileagePlaceholder} {...field} value={field.value || ''} className="bg-secondary/50 border-border" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* ── Pricing ── */}
              <div className="rounded-xl border border-border p-4 space-y-3 bg-secondary/20">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{f.pricingHeader}</p>

                <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr] gap-2 px-0.5">
                  <span className="text-xs text-muted-foreground font-medium">პერიოდი</span>
                  <span className="text-xs text-green-500 font-semibold">ფასი ($)</span>
                  <span className="text-xs text-muted-foreground line-through font-medium">ძველი ფასი ($)</span>
                </div>

                {[
                  { label: f.day1,     price: 'price_per_day'    as const, orig: 'orig_price_1_day'     as const, ph: '50' },
                  { label: f.day2,     price: 'price_2_day'      as const, orig: 'orig_price_2_day'     as const, ph: '45' },
                  { label: f.day3_4,   price: 'price_3_4_day'    as const, orig: 'orig_price_3_4_day'   as const, ph: '40' },
                  { label: f.day5_7,   price: 'price_5_7_day'    as const, orig: 'orig_price_5_7_day'   as const, ph: '35' },
                  { label: f.day8plus, price: 'price_8_plus_day' as const, orig: 'orig_price_8_plus_day'as const, ph: '30' },
                ].map(row => (
                  <div key={row.price} className="grid grid-cols-[auto_1fr_1fr] sm:grid-cols-[1fr_1fr_1fr] gap-2 items-end">
                    <span className="text-sm font-medium text-foreground pb-2 whitespace-nowrap">{row.label}</span>
                    <FormField control={form.control} name={row.price} render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="number" placeholder={row.ph} {...field}
                            value={field.value ?? ''}
                            className="bg-background/50 border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name={row.orig} render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="number" placeholder="—" {...field}
                            value={field.value ?? ''}
                            className="bg-background/50 border-border border-dashed opacity-70 focus:opacity-100" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                ))}

                <div className="pt-1 border-t border-border/40">
                  <div className="grid grid-cols-[auto_1fr_1fr] sm:grid-cols-[1fr_1fr_1fr] gap-2 items-end">
                    <span className="text-sm font-medium text-foreground pb-2 whitespace-nowrap">{f.withDriver}</span>
                    <FormField control={form.control} name="price_with_driver" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="number" placeholder="80" {...field}
                            value={field.value ?? ''}
                            className="bg-background/50 border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div />
                  </div>
                </div>
              </div>

              {/* ── Features ── */}
              <FormField control={form.control} name="features" render={({ field }) => (
                <FormItem>
                  <label className="text-sm font-medium text-foreground">
                    {f.features} <span className="text-muted-foreground font-normal">{f.featuresHint}</span>
                  </label>
                  <FormControl>
                    <Input placeholder={f.featuresPlaceholder} {...field} value={field.value || ''} className="bg-secondary/50 border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* ── Status ── */}
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <label className="text-sm font-medium text-foreground">{f.status}</label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-secondary/50 border-border">
                        <SelectValue placeholder={f.status} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATUS_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">{f.statusHint}</p>
                  <FormMessage />
                </FormItem>
              )} />

              {/* ── Submit ── */}
              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{f.cancel}</Button>
                <Button
                  type="submit"
                  disabled={isPending || isUploading}
                  className="bg-primary hover:bg-primary/90 text-white min-w-28"
                >
                  {(isPending || isUploading) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isUploading ? 'Uploading…' : isEditing ? f.save : f.add}
                </Button>
              </div>

            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
