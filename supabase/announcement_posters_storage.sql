insert into storage.buckets (id, name, public)
values ('announcement-posters', 'announcement-posters', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "public can view announcement posters" on storage.objects;
create policy "public can view announcement posters"
  on storage.objects
  for select
  using (bucket_id = 'announcement-posters');

drop policy if exists "admins can upload announcement posters" on storage.objects;
create policy "admins can upload announcement posters"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'announcement-posters'
    and public.is_current_user_admin()
  );

drop policy if exists "admins can update announcement posters" on storage.objects;
create policy "admins can update announcement posters"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'announcement-posters'
    and public.is_current_user_admin()
  )
  with check (
    bucket_id = 'announcement-posters'
    and public.is_current_user_admin()
  );

drop policy if exists "admins can delete announcement posters" on storage.objects;
create policy "admins can delete announcement posters"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'announcement-posters'
    and public.is_current_user_admin()
  );
