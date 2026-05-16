-- Per-product schedule: use every N days (1 = daily), anchored from started_at
alter table public.products
  add column if not exists usage_interval_days smallint not null default 1
  check (usage_interval_days >= 1 and usage_interval_days <= 90);
