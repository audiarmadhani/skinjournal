-- Multi-angle journal entries: one session per day (or baseline), three photo rows
create table if not exists public.photo_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  baseline boolean not null default false,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists photo_sessions_user_date_idx on public.photo_sessions (user_id, date desc);

alter table public.photos
  add column if not exists session_id uuid references public.photo_sessions(id) on delete cascade,
  add column if not exists angle text;

alter table public.photos drop constraint if exists photos_angle_check;

alter table public.photos
  add constraint photos_angle_check
  check (angle is null or angle in ('front', 'left', 'right'));

create index if not exists photos_session_id_idx on public.photos (session_id);

alter table public.photo_sessions enable row level security;

drop policy if exists "photo_sessions_select" on public.photo_sessions;
create policy "photo_sessions_select" on public.photo_sessions for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "photo_sessions_insert" on public.photo_sessions;
create policy "photo_sessions_insert" on public.photo_sessions for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "photo_sessions_update" on public.photo_sessions;
create policy "photo_sessions_update" on public.photo_sessions for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "photo_sessions_delete" on public.photo_sessions;
create policy "photo_sessions_delete" on public.photo_sessions for delete to authenticated
  using (auth.uid() = user_id);
