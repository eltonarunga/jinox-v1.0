# Profiles, access levels and admin dashboard

Migration: `20261028001000_profiles_roles_admin.sql`

## Access levels
- `member`: default role for newly registered accounts.
- `researcher`: research workspace access level.
- `clinician`: clinician workflow access level; does not verify credentials.
- `admin`: can read the user directory and assign access levels.

A new account can never self-assign an elevated role. Role changes are protected by RLS and a database trigger. This migration creates/backfills profiles for existing Supabase Auth users.

## Routes
- `/profile`: update display name, institution and country; role is read-only.
- `/admin`: administrator-only user directory and role management. The UI is not the security boundary; PostgreSQL RLS and trigger enforce permissions.

## Apply migrations and resolve missing table/schema cache errors
The message `Could not find the table 'public.clinical_cases' in the schema cache` normally means the clinical migration has not been applied to the Supabase project queried by the app, or PostgREST has not refreshed its schema cache. The app's migration files in GitHub do not automatically create production tables.

1. In Supabase SQL Editor for project `gvsziwgdttozxzvfploa`, apply the migration files in timestamp order, starting with the research schema migrations and including `20261027003000_multimodal_data_intake.sql`, `20261027004000_clinical_assessment_genetics.sql`, the subsequent intake hardening/idempotency migrations, and this migration.
2. Confirm `public.clinical_cases` and `public.profiles` exist in Table Editor and that RLS is enabled.
3. If the tables exist but the API still reports schema cache errors, run `NOTIFY pgrst, 'reload schema';` in SQL Editor, wait briefly, then retry.
4. Verify the deployed app's `NEXT_PUBLIC_SUPABASE_URL` points at the same project. Do not paste service-role keys into the browser or source code.

Do not make clinical data production-ready until migrations, RLS policies, private storage policies, backup/retention and governance are verified.
