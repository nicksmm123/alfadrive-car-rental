import { createClient } from '@supabase/supabase-js';

const _rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Strip trailing slashes and any appended path (e.g. /rest/v1) from the URL.
 * new URL(raw).origin gives us just scheme + host — no path, no trailing slash.
 * This prevents the "Invalid path specified in request URL" error from @supabase/supabase-js.
 */
function normaliseUrl(raw: string | undefined): string {
  if (!raw) return '';
  try {
    return new URL(raw.trim()).origin;
  } catch {
    return raw.trim();
  }
}

const supabaseUrl = normaliseUrl(_rawUrl);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars are not set — database features will be unavailable.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey ?? '');

// ---- Types ----

export type CarStatus = 'available' | 'rented' | 'maintenance' | 'inactive';

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number | null;
  price_per_day: number;
  price_2_day?: number | null;
  price_3_4_day?: number | null;
  price_5_7_day?: number | null;
  price_8_plus_day?: number | null;
  price_with_driver?: number | null;
  orig_price_1_day?: number | null;     // per-tier strikethrough prices
  orig_price_2_day?: number | null;
  orig_price_3_4_day?: number | null;
  orig_price_5_7_day?: number | null;
  orig_price_8_plus_day?: number | null;
  transmission: 'automatic' | 'manual';
  fuel_type: string;
  seats: number;
  engine: string | null;
  mileage: string | null;
  features: string[] | null;
  image_url: string | null;
  images?: string[] | null;            // multi-image gallery (v3 schema)
  available: boolean;
  status?: CarStatus | null;           // optional — added in v2 schema
  created_at: string;
}

/**
 * Returns the full ordered image list for a car.
 * Falls back to [image_url] for cars created before the multi-image migration.
 */
export function getCarImages(car: Car): string[] {
  if (car.images && car.images.length > 0) return car.images;
  if (car.image_url) return [car.image_url];
  return [];
}

export type CarInsert = Omit<Car, 'id' | 'created_at'>;
export type CarUpdate = Partial<CarInsert>;

// Derive status from the available boolean if status column doesn't exist yet
export function resolveCarStatus(car: Car): CarStatus {
  if (car.status) return car.status;
  return car.available ? 'available' : 'inactive';
}

// ---- Graceful error helper ----
function isTableMissingError(error: { code?: string; message?: string }): boolean {
  const msg = (error.message ?? '').toLowerCase();
  return error.code === '42P01' || msg.includes('does not exist') || msg.includes('relation');
}

// ---- Queries ----

export async function getCars(): Promise<Car[]> {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    if (isTableMissingError(error)) return [];
    throw error;
  }
  return data ?? [];
}

export async function getAvailableCars(): Promise<Car[]> {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('available', true)
    .order('created_at', { ascending: false });
  if (error) {
    if (isTableMissingError(error)) return [];
    throw error;
  }
  return data ?? [];
}

// Columns added in schema v2 — stripped from payloads only when the DB reports
// they don't exist, keeping saves safe on older DB instances.
// NOTE: `images` is intentionally NOT in this list — the column is live and
// must always be written so all uploaded photos persist.
const OPTIONAL_COLS = [
  'orig_price_1_day',
  'orig_price_2_day',
  'orig_price_3_4_day',
  'orig_price_5_7_day',
  'orig_price_8_plus_day',
] as const;
type OptionalCol = (typeof OPTIONAL_COLS)[number];

function stripNull<T extends Record<string, unknown>>(car: T): T {
  const copy = { ...car } as T;
  for (const col of OPTIONAL_COLS) {
    if ((copy as Record<string, unknown>)[col] == null) {
      delete (copy as Record<string, unknown>)[col];
    }
  }
  return copy;
}

function stripCol<T extends Record<string, unknown>>(car: T, col: OptionalCol): T {
  const copy = { ...car } as T;
  delete (copy as Record<string, unknown>)[col];
  return copy;
}

// Detect PostgREST "column not found in schema cache" errors for optional cols.
function missingCol(error: { code?: string; message?: string }): OptionalCol | null {
  const msg = (error.message ?? '').toLowerCase();
  for (const col of OPTIONAL_COLS) {
    if (msg.includes(col)) return col;
  }
  return null;
}

export async function createCar(car: CarInsert): Promise<Car> {
  let payload = stripNull(car) as Record<string, unknown>;
  // Retry loop: strip any unrecognised optional column and re-attempt.
  // `images` is never stripped — it is a required column after migration.
  for (let i = 0; i <= OPTIONAL_COLS.length; i++) {
    const { data, error } = await supabase.from('cars').insert([payload]).select().single();
    if (!error) {
      if (!data) throw new Error('createCar: no data returned');
      return data as Car;
    }
    const col = missingCol(error);
    if (!col) throw error;   // not a strippable column — surface the real error
    payload = stripCol(payload as CarInsert, col);
  }
  throw new Error('createCar: failed after stripping all optional columns');
}

export async function updateCar(id: string, car: CarUpdate): Promise<Car> {
  let payload = stripNull(car) as Record<string, unknown>;
  // Retry loop: strip any unrecognised optional column and re-attempt.
  // `images` is never stripped — it is a required column after migration.
  for (let i = 0; i <= OPTIONAL_COLS.length; i++) {
    const { data, error } = await supabase
      .from('cars').update(payload).eq('id', id).select().single();
    if (!error) {
      if (!data) throw new Error('updateCar: no data returned');
      return data as Car;
    }
    const col = missingCol(error);
    if (!col) throw error;   // not a strippable column — surface the real error
    payload = stripCol(payload as CarUpdate, col);
  }
  throw new Error('updateCar: failed after stripping all optional columns');
}

export async function deleteCar(id: string): Promise<void> {
  const { error } = await supabase.from('cars').delete().eq('id', id);
  if (error) throw error;
}

// ---- Storage ----

export async function uploadCarImage(file: File): Promise<string> {
  // Sanitise extension: only allow alphanumeric characters
  const rawExt = file.name.split('.').pop() ?? '';
  const ext = /^[a-z0-9]+$/i.test(rawExt) ? rawExt.toLowerCase() : 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  const { data, error } = await supabase.storage
    .from('car-images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false });

  if (error) {
    // Surface the exact Supabase error so the admin knows what went wrong
    throw new Error(`Upload failed for "${file.name}": ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('car-images')
    .getPublicUrl(data.path);

  if (!publicUrl || !publicUrl.startsWith('http')) {
    throw new Error(
      `Could not retrieve a public URL for "${file.name}". ` +
      'Check that the "car-images" bucket exists and is set to Public.',
    );
  }

  return publicUrl;
}

