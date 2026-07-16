insert into storage.buckets (id, name, public)
values ('event-photos', 'event-photos', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "public can view event photos" on storage.objects;
create policy "public can view event photos"
  on storage.objects
  for select
  using (bucket_id = 'event-photos');

drop policy if exists "admins can upload event photos" on storage.objects;
create policy "admins can upload event photos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'event-photos'
    and public.is_current_user_admin()
  );

drop policy if exists "admins can update event photos" on storage.objects;
create policy "admins can update event photos"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'event-photos'
    and public.is_current_user_admin()
  )
  with check (
    bucket_id = 'event-photos'
    and public.is_current_user_admin()
  );

drop policy if exists "admins can delete event photos" on storage.objects;
create policy "admins can delete event photos"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'event-photos'
    and public.is_current_user_admin()
  );
