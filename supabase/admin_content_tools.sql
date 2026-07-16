create table if not exists public.site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.site_content enable row level security;

drop policy if exists "public can read site content" on public.site_content;
create policy "public can read site content"
  on public.site_content
  for select
  using (true);

drop policy if exists "admins can insert site content" on public.site_content;
create policy "admins can insert site content"
  on public.site_content
  for insert
  to authenticated
  with check (public.is_current_user_admin());

drop policy if exists "admins can update site content" on public.site_content;
create policy "admins can update site content"
  on public.site_content
  for update
  to authenticated
  using (public.is_current_user_admin())
  with check (public.is_current_user_admin());

drop policy if exists "admins can delete site content" on public.site_content;
create policy "admins can delete site content"
  on public.site_content
  for delete
  to authenticated
  using (public.is_current_user_admin());

create or replace function public.set_site_content_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_site_content_updated_at on public.site_content;
create trigger set_site_content_updated_at
before update on public.site_content
for each row
execute function public.set_site_content_updated_at();
