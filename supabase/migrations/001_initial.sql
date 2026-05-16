-- SkinJournal initial schema

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null default '',
  email text not null default '',
  skin_goals text[] default '{}',
  concerns text[] default '{}',
  onboarding_completed boolean default false,
  baseline_photo_id uuid,
  created_at timestamptz default now()
);

create table if not exists public.photos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  image_url text not null,
  storage_path text,
  date date not null,
  metadata jsonb default '{}',
  analysis jsonb,
  baseline boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  brand text,
  routine_type text not null check (routine_type in ('morning', 'night')),
  started_at date default current_date,
  notes text
);

create table if not exists public.routine_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  morning_completed uuid[] default '{}',
  night_completed uuid[] default '{}',
  unique (user_id, date)
);

create table if not exists public.insights (
  id uuid default gen_random_uuid() primary key,
  photo_id uuid references public.photos(id) on delete set null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  summary text not null,
  generated_at timestamptz default now(),
  source text default 'template' check (source in ('openai', 'template'))
);

create table if not exists public.streaks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  current_streak int default 0,
  highest_streak int default 0,
  last_log_date date
);

create table if not exists public.share_cards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  image_url text not null,
  generated_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.photos enable row level security;
alter table public.products enable row level security;
alter table public.routine_logs enable row level security;
alter table public.insights enable row level security;
alter table public.streaks enable row level security;
alter table public.share_cards enable row level security;

create policy "profiles_select" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles_insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_delete" on public.profiles for delete to authenticated using (auth.uid() = id);

create policy "photos_select" on public.photos for select to authenticated using (auth.uid() = user_id);
create policy "photos_insert" on public.photos for insert to authenticated with check (auth.uid() = user_id);
create policy "photos_update" on public.photos for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "photos_delete" on public.photos for delete to authenticated using (auth.uid() = user_id);

create policy "products_select" on public.products for select to authenticated using (auth.uid() = user_id);
create policy "products_insert" on public.products for insert to authenticated with check (auth.uid() = user_id);
create policy "products_update" on public.products for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "products_delete" on public.products for delete to authenticated using (auth.uid() = user_id);

create policy "routine_logs_select" on public.routine_logs for select to authenticated using (auth.uid() = user_id);
create policy "routine_logs_insert" on public.routine_logs for insert to authenticated with check (auth.uid() = user_id);
create policy "routine_logs_update" on public.routine_logs for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "routine_logs_delete" on public.routine_logs for delete to authenticated using (auth.uid() = user_id);

create policy "insights_select" on public.insights for select to authenticated using (auth.uid() = user_id);
create policy "insights_insert" on public.insights for insert to authenticated with check (auth.uid() = user_id);
create policy "insights_update" on public.insights for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "insights_delete" on public.insights for delete to authenticated using (auth.uid() = user_id);

create policy "streaks_select" on public.streaks for select to authenticated using (auth.uid() = user_id);
create policy "streaks_insert" on public.streaks for insert to authenticated with check (auth.uid() = user_id);
create policy "streaks_update" on public.streaks for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "streaks_delete" on public.streaks for delete to authenticated using (auth.uid() = user_id);

create policy "share_cards_select" on public.share_cards for select to authenticated using (auth.uid() = user_id);
create policy "share_cards_insert" on public.share_cards for insert to authenticated with check (auth.uid() = user_id);
create policy "share_cards_update" on public.share_cards for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "share_cards_delete" on public.share_cards for delete to authenticated using (auth.uid() = user_id);

insert into storage.buckets (id, name, public) values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "storage_photos_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "storage_photos_select"
  on storage.objects for select to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "storage_photos_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "storage_photos_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "storage_photos_public_read"
  on storage.objects for select to public
  using (bucket_id = 'photos');
