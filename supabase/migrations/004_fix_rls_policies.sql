-- Fix RLS: INSERT/UPDATE need WITH CHECK; storage upsert needs UPDATE policy.

-- Profiles
drop policy if exists "Users own profile" on public.profiles;
create policy "profiles_select" on public.profiles for select to authenticated
  using (auth.uid() = id);
create policy "profiles_insert" on public.profiles for insert to authenticated
  with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_delete" on public.profiles for delete to authenticated
  using (auth.uid() = id);

-- Photos
drop policy if exists "Users own photos" on public.photos;
create policy "photos_select" on public.photos for select to authenticated
  using (auth.uid() = user_id);
create policy "photos_insert" on public.photos for insert to authenticated
  with check (auth.uid() = user_id);
create policy "photos_update" on public.photos for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "photos_delete" on public.photos for delete to authenticated
  using (auth.uid() = user_id);

-- Products
drop policy if exists "Users own products" on public.products;
create policy "products_select" on public.products for select to authenticated
  using (auth.uid() = user_id);
create policy "products_insert" on public.products for insert to authenticated
  with check (auth.uid() = user_id);
create policy "products_update" on public.products for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "products_delete" on public.products for delete to authenticated
  using (auth.uid() = user_id);

-- Routine logs
drop policy if exists "Users own routine_logs" on public.routine_logs;
create policy "routine_logs_select" on public.routine_logs for select to authenticated
  using (auth.uid() = user_id);
create policy "routine_logs_insert" on public.routine_logs for insert to authenticated
  with check (auth.uid() = user_id);
create policy "routine_logs_update" on public.routine_logs for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "routine_logs_delete" on public.routine_logs for delete to authenticated
  using (auth.uid() = user_id);

-- Insights
drop policy if exists "Users own insights" on public.insights;
create policy "insights_select" on public.insights for select to authenticated
  using (auth.uid() = user_id);
create policy "insights_insert" on public.insights for insert to authenticated
  with check (auth.uid() = user_id);
create policy "insights_update" on public.insights for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "insights_delete" on public.insights for delete to authenticated
  using (auth.uid() = user_id);

-- Streaks
drop policy if exists "Users own streaks" on public.streaks;
create policy "streaks_select" on public.streaks for select to authenticated
  using (auth.uid() = user_id);
create policy "streaks_insert" on public.streaks for insert to authenticated
  with check (auth.uid() = user_id);
create policy "streaks_update" on public.streaks for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "streaks_delete" on public.streaks for delete to authenticated
  using (auth.uid() = user_id);

-- Share cards
drop policy if exists "Users own share_cards" on public.share_cards;
create policy "share_cards_select" on public.share_cards for select to authenticated
  using (auth.uid() = user_id);
create policy "share_cards_insert" on public.share_cards for insert to authenticated
  with check (auth.uid() = user_id);
create policy "share_cards_update" on public.share_cards for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "share_cards_delete" on public.share_cards for delete to authenticated
  using (auth.uid() = user_id);

-- Storage (photos bucket)
drop policy if exists "Users upload own photos" on storage.objects;
drop policy if exists "Users read own photos" on storage.objects;

create policy "storage_photos_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_photos_select"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_photos_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_photos_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public bucket: allow anyone to read objects via public URL
create policy "storage_photos_public_read"
  on storage.objects for select to public
  using (bucket_id = 'photos');
