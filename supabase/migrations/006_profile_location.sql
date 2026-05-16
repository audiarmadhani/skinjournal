-- One-time approximate device location (with OS consent), stored on the user profile
alter table public.profiles
  add column if not exists location_latitude double precision,
  add column if not exists location_longitude double precision,
  add column if not exists location_accuracy_m double precision,
  add column if not exists location_city text,
  add column if not exists location_region text,
  add column if not exists location_country text,
  add column if not exists location_captured_at timestamptz;

comment on column public.profiles.location_latitude is 'Approximate latitude from one-time foreground location request';
comment on column public.profiles.location_longitude is 'Approximate longitude from one-time foreground location request';
comment on column public.profiles.location_accuracy_m is 'Horizontal accuracy in meters when captured';
comment on column public.profiles.location_captured_at is 'When coordinates were saved; null means not captured yet';
