-- Premium subscription for face analysis and AI insights
alter table public.profiles
  add column if not exists subscription_tier text not null default 'free'
    check (subscription_tier in ('free', 'premium'));

alter table public.profiles
  add column if not exists premium_expires_at timestamptz;

comment on column public.profiles.subscription_tier is 'free = photos & routine only; premium = AI face analysis';
comment on column public.profiles.premium_expires_at is 'Optional expiry for premium; null means no expiry';
