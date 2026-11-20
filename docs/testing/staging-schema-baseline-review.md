# Staging schema baseline and migration reconciliation

## Purpose
Establish a safe, reproducible path for initializing JinoX staging before any SQL migrations are applied. This document is a review plan only; it does not apply database changes.

## Environment boundaries
- Staging project: `jinox-staging`
- Production remains isolated. Never copy production records or credentials into staging.
- Test fixtures and identities must be synthetic.
- Staging migrations must be applied and verified before any production migration is considered.

## Baseline sources requiring reconciliation
The repository has two early research schema sources:
- `supabase/migrations/20261026_secure_research_mvp.sql`
- `supabase/migrations/20261027000000_research_workspace.sql`

Both declare overlapping research tables, but their columns, constraints, status vocabularies, audit-log shapes, and policy design differ. The second migration uses `public.handle_updated_at()`, which is defined in `supabase/schema.sql`. The migration directory does not include an explicit baseline migration for that helper.

The repository also contains `supabase/schema.sql`, which includes legacy operational tables and the `handle_updated_at()` helper. The deployment/init contract must be clarified: whether this schema is a bootstrap baseline, a historical snapshot, or a production-only schema file.

## Required reconciliation steps
1. Establish the intended bootstrap source and migration-history contract from repo configuration and deployment workflow.
2. Inventory duplicate table/function/policy definitions across all migrations and schema snapshots.
3. Identify which migration is canonical for each object and document legacy compatibility needs.
4. Create a clean-database migration plan with explicit dependency order and idempotency review.
5. Add automated schema smoke tests for required objects and constraints.
6. Apply the reviewed plan only to staging and verify migration records, table definitions, triggers, RLS policies, and storage policies.
7. Run authorization tests with synthetic identities and ensure no test suite silently skips when staging configuration is present.
8. Capture the exact successful migration sequence and staging validation results for reproducibility.

## Safety requirements
- Do not apply these migrations to production as part of this work.
- Do not seed real patient data, copy production data, or use real user identities for integration tests.
- Do not expose service-role credentials in logs, documentation, client code, or PR content.
- Avoid manual SQL edits in staging that are not recorded as migrations.
- If a baseline cannot be determined safely, stop and resolve the repository's deployment contract before applying DDL.

## Current staging status
At the time of writing, the staging project is healthy and empty. No migrations or application tables have been applied. Supabase advisors on the empty database returned no findings; this is not evidence that application schema security is validated.
