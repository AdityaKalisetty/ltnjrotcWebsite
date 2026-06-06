-- Add profile fields needed for the cadet dashboard and competition form workflow.

alter table public.cadet_profiles
  add column if not exists ns_level text,
  add column if not exists profile_photo_url text,
  add column if not exists ribbons jsonb default '[]'::jsonb,
  add column if not exists competition_signups jsonb default '[]'::jsonb,
  add column if not exists overdue_forms jsonb default '[]'::jsonb;

-- Example structure for `ribbons`:
-- [
--   {"name": "Meritorious Achievement", "attachments": ["Medal Certificate"]},
--   {"name": "Physical Fitness", "attachments": []}
-- ]

-- Example structure for `competition_signups`:
-- [
--   {
--     "competition_id": "area-19-championships-2026",
--     "competition_name": "Area 19 Championships",
--     "date": "June 14, 2026",
--     "location": "Northlake High School",
--     "due_date": "2026-06-01",
--     "required_forms": ["Parental Consent", "Alternative Transportation", "Form 3"],
--     "submitted_forms": [],
--     "completed": false
--   }
-- ]

-- Example structure for `overdue_forms`:
-- [
--   {"competition_id": "area-19-championships-2026", "competition_name": "Area 19 Championships", "reason": "Forms are past due."}
-- ]
