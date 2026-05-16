-- Age and sex collected during onboarding for tailored suggestions
alter table public.profiles
  add column if not exists age_years smallint;

alter table public.profiles
  add column if not exists sex text;

alter table public.profiles drop constraint if exists profiles_age_years_range;

alter table public.profiles
  add constraint profiles_age_years_range
  check (age_years is null or (age_years >= 13 and age_years <= 120));

alter table public.profiles drop constraint if exists profiles_sex_allowed;

alter table public.profiles
  add constraint profiles_sex_allowed
  check (sex is null or sex in ('female', 'male', 'prefer_not_to_say'));

comment on column public.profiles.age_years is 'User-reported age from onboarding (13–120)';
comment on column public.profiles.sex is 'female | male | prefer_not_to_say';
