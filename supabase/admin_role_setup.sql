alter table public.cadet_profiles
  add column if not exists is_admin boolean not null default false;

create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cadet_profiles
    where auth_user_id = auth.uid()
      and is_admin = true
  );
$$;

revoke all on function public.is_current_user_admin() from public;
grant execute on function public.is_current_user_admin() to authenticated;

drop policy if exists "admins can view all cadet profiles" on public.cadet_profiles;
create policy "admins can view all cadet profiles"
  on public.cadet_profiles
  for select
  to authenticated
  using (public.is_current_user_admin());

drop policy if exists "admins can update all cadet profiles" on public.cadet_profiles;
create policy "admins can update all cadet profiles"
  on public.cadet_profiles
  for update
  to authenticated
  using (public.is_current_user_admin())
  with check (public.is_current_user_admin());

-- Turn yourself into an admin after the column exists:
-- update public.cadet_profiles
--    set is_admin = true
--  where lower(email) = lower('your-email@example.com');
