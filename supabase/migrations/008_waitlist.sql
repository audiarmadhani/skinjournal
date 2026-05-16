-- Waitlist signups for marketing landing page

create table if not exists public.waitlist_signups (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  referrer text,
  created_at timestamptz default now()
);

create unique index if not exists waitlist_signups_email_lower_idx
  on public.waitlist_signups (lower(email));

alter table public.waitlist_signups enable row level security;

create policy "waitlist_signups_insert_anon"
  on public.waitlist_signups
  for insert
  to anon
  with check (true);
