alter table public.cadet_profiles
  enable row level security;

drop policy if exists "cadets can insert own profile" on public.cadet_profiles;
create policy "cadets can insert own profile"
  on public.cadet_profiles
  for insert
  to authenticated
  with check (auth.uid() = auth_user_id);

create or replace function public.initialize_my_cadet_profile()
returns public.cadet_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile public.cadet_profiles;
  normalized_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  display_name text := nullif(trim(coalesce(auth.jwt() -> 'user_metadata' ->> 'name', '')), '');
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select *
    into current_profile
    from public.cadet_profiles
   where auth_user_id = auth.uid()
   limit 1;

  if current_profile.id is not null then
    return current_profile;
  end if;

  if normalized_email <> '' then
    update public.cadet_profiles
       set auth_user_id = auth.uid(),
           email = coalesce(nullif(email, ''), normalized_email),
           name = coalesce(nullif(name, ''), display_name, name)
     where lower(email) = normalized_email
       and (auth_user_id is null or auth_user_id = auth.uid())
    returning *
      into current_profile;

    if current_profile.id is not null then
      return current_profile;
    end if;
  end if;

  insert into public.cadet_profiles (
    auth_user_id,
    email,
    name,
    ribbons,
    competition_signups,
    overdue_forms
  )
  values (
    auth.uid(),
    nullif(normalized_email, ''),
    coalesce(display_name, ''),
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb
  )
  returning *
    into current_profile;

  return current_profile;
end;
$$;

revoke all on function public.initialize_my_cadet_profile() from public;
grant execute on function public.initialize_my_cadet_profile() to authenticated;
