-- Run this SQL in your Supabase dashboard → SQL Editor
-- to create the cars table and set up access policies.

create table if not exists cars (
  id uuid default gen_random_uuid() primary key,
  brand text not null,
  model text not null,
  year integer not null,
  price_per_day numeric(10, 2) not null,
  price_2_day numeric(10, 2),
  price_3_4_day numeric(10, 2),
  price_5_7_day numeric(10, 2),
  price_8_plus_day numeric(10, 2),
  price_with_driver numeric(10, 2),
  original_price numeric(10, 2),
  transmission text not null check (transmission in ('automatic', 'manual')),
  fuel_type text not null,
  seats integer not null,
  engine text,
  mileage text,
  features text[],
  image_url text,
  images text[],
  available boolean default true not null,
  status text check (status in ('available', 'rented', 'maintenance', 'inactive')),
  created_at timestamp with time zone default now() not null
);

-- ── If the table already exists, run these migrations to add new columns ──────
alter table cars add column if not exists price_2_day numeric(10, 2);
alter table cars add column if not exists price_3_4_day numeric(10, 2);
alter table cars add column if not exists price_5_7_day numeric(10, 2);
alter table cars add column if not exists price_8_plus_day numeric(10, 2);
alter table cars add column if not exists price_with_driver numeric(10, 2);
alter table cars add column if not exists original_price numeric(10, 2);
alter table cars add column if not exists status text check (status in ('available', 'rented', 'maintenance', 'inactive'));
-- v3: per-tier strikethrough prices
alter table cars add column if not exists orig_price_1_day numeric(10, 2);
alter table cars add column if not exists orig_price_2_day numeric(10, 2);
alter table cars add column if not exists orig_price_3_4_day numeric(10, 2);
alter table cars add column if not exists orig_price_5_7_day numeric(10, 2);
alter table cars add column if not exists orig_price_8_plus_day numeric(10, 2);
-- v3: multi-image gallery (array of image URLs; first item is the cover photo)
alter table cars add column if not exists images text[];

-- Enable Row Level Security
alter table cars enable row level security;

-- Allow everyone to read all cars
create policy "Public can read cars"
  on cars for select
  using (true);

-- Allow anyone to insert (admin will be protected by app-level password)
create policy "Admin can insert cars"
  on cars for insert
  with check (true);

-- Allow anyone to update
create policy "Admin can update cars"
  on cars for update
  using (true);

-- Allow anyone to delete
create policy "Admin can delete cars"
  on cars for delete
  using (true);

-- Optional: seed a couple of sample cars
insert into cars (brand, model, year, price_per_day, transmission, fuel_type, seats, engine, mileage, features, available)
values
  ('Mercedes-Benz', 'E-Class', 2022, 120, 'automatic', 'Petrol', 5, '2.0L Turbo', '15,000 km', ARRAY['Leather seats', 'Sunroof', 'Navigation', 'Heated seats'], true),
  ('BMW', '5 Series', 2023, 130, 'automatic', 'Diesel', 5, '3.0L Diesel', '8,000 km', ARRAY['M Sport package', 'Panoramic roof', 'Wireless charging', 'Lane assist'], true),
  ('Toyota', 'Camry', 2021, 70, 'automatic', 'Hybrid', 5, '2.5L Hybrid', '30,000 km', ARRAY['Fuel efficient', 'Apple CarPlay', 'Backup camera', 'Adaptive cruise'], true);
