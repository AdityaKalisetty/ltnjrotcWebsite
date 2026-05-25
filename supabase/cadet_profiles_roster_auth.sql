alter table public.cadet_profiles
  add column if not exists auth_user_id uuid references auth.users (id) on delete set null;

create unique index if not exists cadet_profiles_auth_user_id_key
  on public.cadet_profiles (auth_user_id)
  where auth_user_id is not null;

create unique index if not exists cadet_profiles_email_lower_key
  on public.cadet_profiles (lower(email));

alter table public.cadet_profiles
  enable row level security;

drop policy if exists "cadets can view own profile" on public.cadet_profiles;
create policy "cadets can view own profile"
  on public.cadet_profiles
  for select
  to authenticated
  using (auth.uid() = auth_user_id);

drop policy if exists "cadets can update own profile" on public.cadet_profiles;
create policy "cadets can update own profile"
  on public.cadet_profiles
  for update
  to authenticated
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

create or replace function public.claim_my_cadet_profile(roster_email text)
returns setof public.cadet_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(trim(roster_email));
  session_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if normalized_email = '' then
    raise exception 'Email is required';
  end if;

  if session_email = '' or session_email <> normalized_email then
    raise exception 'Signed-in email does not match the requested roster record';
  end if;

  return query
  update public.cadet_profiles
     set auth_user_id = auth.uid()
   where lower(email) = normalized_email
     and (auth_user_id is null or auth_user_id = auth.uid())
  returning *;

  if not found then
    if exists (
      select 1
      from public.cadet_profiles
      where lower(email) = normalized_email
        and auth_user_id is not null
        and auth_user_id <> auth.uid()
    ) then
      raise exception 'This cadet profile has already been linked to another account';
    end if;

    raise exception 'No approved cadet profile exists for this email';
  end if;
end;
$$;

revoke all on function public.claim_my_cadet_profile(text) from public;
grant execute on function public.claim_my_cadet_profile(text) to authenticated;

-- Staff workflow:
-- 1. Preload cadets into public.cadet_profiles with their real email addresses.
-- 2. Create or invite matching auth users from the Supabase dashboard/admin tools.
-- 3. Cadets use the "Email Me a Setup Link" flow to choose their own password.
