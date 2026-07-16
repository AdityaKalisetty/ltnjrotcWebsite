drop policy if exists "authenticated cadets can view all cadet portfolios" on public.cadet_profiles;
create policy "authenticated cadets can view all cadet portfolios"
  on public.cadet_profiles
  for select
  to authenticated
  using (true);
