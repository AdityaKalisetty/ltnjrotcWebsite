-- Run this in the Supabase SQL editor after the existing admin-role setup scripts.

create or replace function public.is_current_user_supply_officer()
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
      and (
        is_admin = true
        or lower(coalesce(role, '')) like '%supply%'
      )
  );
$$;

revoke all on function public.is_current_user_supply_officer() from public;
grant execute on function public.is_current_user_supply_officer() to authenticated;

drop policy if exists "supply officers can view cadet profiles" on public.cadet_profiles;

create table if not exists public.cadet_form_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  file_url text not null,
  storage_path text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.cadet_form_documents enable row level security;

drop policy if exists "cadets can view form documents" on public.cadet_form_documents;
create policy "cadets can view form documents"
  on public.cadet_form_documents for select
  to authenticated
  using (true);

drop policy if exists "admins can manage form documents" on public.cadet_form_documents;
create policy "admins can manage form documents"
  on public.cadet_form_documents for all
  to authenticated
  using (public.is_current_user_admin())
  with check (public.is_current_user_admin());

insert into storage.buckets (id, name, public)
values ('cadet-forms', 'cadet-forms', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "cadets can download cadet forms" on storage.objects;
create policy "cadets can download cadet forms"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'cadet-forms');

drop policy if exists "admins can upload cadet forms" on storage.objects;
create policy "admins can upload cadet forms"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'cadet-forms' and public.is_current_user_admin());

drop policy if exists "admins can update cadet forms" on storage.objects;
create policy "admins can update cadet forms"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'cadet-forms' and public.is_current_user_admin())
  with check (bucket_id = 'cadet-forms' and public.is_current_user_admin());

drop policy if exists "admins can delete cadet forms" on storage.objects;
create policy "admins can delete cadet forms"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'cadet-forms' and public.is_current_user_admin());

create table if not exists public.supply_requests (
  id uuid primary key default gen_random_uuid(),
  cadet_id uuid not null references public.cadet_profiles(id) on delete cascade,
  item_description text not null check (char_length(trim(item_description)) between 1 and 500),
  status text not null default 'pending' check (status in ('pending', 'resolved')),
  created_at timestamptz not null default timezone('utc', now()),
  resolved_at timestamptz,
  resolved_by uuid references public.cadet_profiles(id) on delete set null
);

create index if not exists supply_requests_cadet_id_created_at_idx
  on public.supply_requests (cadet_id, created_at desc);

create index if not exists supply_requests_status_created_at_idx
  on public.supply_requests (status, created_at desc);

alter table public.supply_requests enable row level security;

drop policy if exists "cadets can view own supply requests" on public.supply_requests;
create policy "cadets can view own supply requests"
  on public.supply_requests for select
  to authenticated
  using (
    exists (
      select 1 from public.cadet_profiles
      where cadet_profiles.id = supply_requests.cadet_id
        and cadet_profiles.auth_user_id = auth.uid()
    )
  );

drop policy if exists "cadets can create own supply requests" on public.supply_requests;
create policy "cadets can create own supply requests"
  on public.supply_requests for insert
  to authenticated
  with check (
    exists (
      select 1 from public.cadet_profiles
      where cadet_profiles.id = supply_requests.cadet_id
        and cadet_profiles.auth_user_id = auth.uid()
    )
  );

drop policy if exists "supply officers can view supply requests" on public.supply_requests;
create policy "supply officers can view supply requests"
  on public.supply_requests for select
  to authenticated
  using (public.is_current_user_supply_officer());

drop policy if exists "supply officers can resolve supply requests" on public.supply_requests;
create policy "supply officers can resolve supply requests"
  on public.supply_requests for update
  to authenticated
  using (public.is_current_user_supply_officer())
  with check (public.is_current_user_supply_officer());

create table if not exists public.cadet_form_assignments (
  id uuid primary key default gen_random_uuid(),
  cadet_id uuid not null references public.cadet_profiles(id) on delete cascade,
  form_document_id uuid references public.cadet_form_documents(id) on delete set null,
  form_title text not null,
  event_name text not null default '',
  due_date date,
  status text not null default 'active' check (status in ('active', 'dismissed')),
  assigned_at timestamptz not null default timezone('utc', now())
);

create index if not exists cadet_form_assignments_cadet_id_idx
  on public.cadet_form_assignments (cadet_id, due_date);

alter table public.cadet_form_assignments enable row level security;

drop policy if exists "cadets can view own form assignments" on public.cadet_form_assignments;
create policy "cadets can view own form assignments"
  on public.cadet_form_assignments for select
  to authenticated
  using (exists (select 1 from public.cadet_profiles where id = cadet_form_assignments.cadet_id and auth_user_id = auth.uid()));

drop policy if exists "admins can manage form assignments" on public.cadet_form_assignments;
create policy "admins can manage form assignments"
  on public.cadet_form_assignments for all
  to authenticated
  using (public.is_current_user_admin())
  with check (public.is_current_user_admin());

create table if not exists public.cadet_form_overrides (
  cadet_id uuid not null references public.cadet_profiles(id) on delete cascade,
  requirement_key text not null,
  status text not null default 'dismissed' check (status = 'dismissed'),
  dismissed_at timestamptz not null default timezone('utc', now()),
  primary key (cadet_id, requirement_key)
);

alter table public.cadet_form_overrides enable row level security;

drop policy if exists "cadets can view own form overrides" on public.cadet_form_overrides;
create policy "cadets can view own form overrides"
  on public.cadet_form_overrides for select
  to authenticated
  using (exists (select 1 from public.cadet_profiles where id = cadet_form_overrides.cadet_id and auth_user_id = auth.uid()));

drop policy if exists "admins can manage form overrides" on public.cadet_form_overrides;
create policy "admins can manage form overrides"
  on public.cadet_form_overrides for all
  to authenticated
  using (public.is_current_user_admin())
  with check (public.is_current_user_admin());

notify pgrst, 'reload schema';
