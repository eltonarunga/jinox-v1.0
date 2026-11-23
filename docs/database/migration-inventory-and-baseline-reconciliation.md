# Supabase migration inventory and baseline reconciliation

**Review type:** source-only  
**Reviewed branch:** `main`  
**Scope:** repository SQL files and documented migration dependencies  
**Database access:** none; no staging or production database was queried or changed

## Executive finding

The repository contains **19 timestamped migration files** under `supabase/migrations/` and one separate, unversioned schema snapshot at `supabase/schema.sql`. The snapshot is not included in the migration sequence, but several migrations depend on objects it creates. Consequently, the migration directory is not demonstrably a self-contained clean-install path.

Do not apply the migration directory to empty staging yet. First establish whether `schema.sql` is the authoritative historical baseline, whether it was applied outside migration tracking in any environment, and which schema definition is intended where early migrations declare the same tables differently.

This document records source-level dependencies. It does not assert that any migration has or has not been applied to a hosted database.

## Repository inventory

The following list is ordered by the migration version prefix used by the filenames.

| Order | Migration | Main responsibility / dependency |
|---:|---|---|
| Baseline (unversioned) | `supabase/schema.sql` | Creates `counties`, `screenings`, `model_versions`, `dataset_snapshots`, `handle_updated_at()`, and initial RLS policies. Not part of the timestamped migration directory. |
| 1 | `20261026_secure_research_mvp.sql` | Creates the first definitions of research projects, memberships, datasets, experiments, consents, audit logs, membership helpers, triggers and RLS. Requires Supabase Auth and `pgcrypto`. |
| 2 | `20261027000000_research_workspace.sql` | Re-declares research workspace tables with `IF NOT EXISTS`, adds indexes, timestamp triggers and owner policies. Its triggers call `public.handle_updated_at()`, supplied by `schema.sql`. |
| 3 | `20261027001000_remove_unverified_demo_data.sql` | Deletes narrowly matched prototype rows from `dataset_snapshots`, `model_versions` and `counties`; requires those baseline tables and their expected columns. |
| 4 | `20261027002000_remove_unverified_metadata_defaults.sql` | Drops defaults from `counties.referral_rate`, `counties.source` and `dataset_snapshots.license`; requires the baseline tables/columns. |
| 5 | `20261027003000_multimodal_data_intake.sql` | Creates clinical cases, assets, observations and environmental measurements; adds RLS and private Storage bucket/object policies. Requires Auth and Supabase Storage. |
| 6 | `20261027004000_clinical_assessment_genetics.sql` | Creates clinical assessments and metadata-only genetic-risk study records; depends on clinical cases and Auth. |
| 7 | `20261027005000_restrict_clinical_upload_mime_types.sql` | Tightens the existing `jinox-clinical-assets` bucket's privacy, size and MIME settings; depends on bucket provisioning by the intake migration. |
| 8 | `20261027005500_idempotent_clinical_record_imports.sql` | Adds source-asset and source-row references and uniqueness indexes to clinical observations and environmental measurements; depends on clinical assets and intake tables. |
| 9 | `20261028001000_profiles_roles_admin.sql` | Creates profiles, role helpers, Auth user trigger/backfill, role-change protection, RLS and grants; depends on Supabase Auth. |
| 10 | `20261028002000_dataset_annotation_workflow.sql` | Creates dataset items, annotation revisions and annotation reviews; depends on research datasets, clinical assets and Auth. |
| 11 | `20261028205400_annotation_assignment_access.sql` | Adds project-role helpers, owner membership backfill, item assignment, revised RLS and column grants; depends on research workspace and annotation tables. |
| 12 | `20261028220000_atomic_research_audit.sql` | Adds atomic RPCs for project, dataset, experiment and consent operations with audit records; depends on research tables, audit log and profile-role helper. |
| 13 | `20261104000000_operational_annotation_workflow.sql` | Enforces approved-asset eligibility and adds atomic annotation save/review RPCs; depends on assignment, annotation, clinical asset and Storage policies. |
| 14 | `20261105000000_asset_intake_governance.sql` | Adds MIME validation and asset-intake guard trigger; restricts direct asset updates and Storage uploads; depends on clinical assets and the private bucket. |
| 15 | `20261106000000_asset_review_workflow.sql` | Creates immutable asset-review history and administrator review RPC; depends on profiles/admin role, clinical assets and Storage. |
| 16 | `20261107000000_dataset_curation_releases.sql` | Creates curation events and immutable dataset release manifests; adds curation/release RPCs and removes direct review inserts; depends on annotation workflow, project roles and research audit logs. |
| 17 | `20261124000000_enforce_current_annotation_revisions.sql` | Replaces review and release RPCs so review/release use the current annotation revision; depends on the operational annotation and release schema. |
| 18 | `20261125000000_bind_annotation_to_current_assignment.sql` | Adds reassignment protection and replaces curation, review and release RPCs to bind actions to the current assignee; depends on assignment and release workflow. |
| 19 | `20261125001000_serialize_dataset_release_with_annotation_writes.sql` | Replaces release, curation and review RPC definitions to serialize release creation against workflow writes; depends on the preceding annotation/curation/release functions and tables. |

## Dependency map

### External platform prerequisites

- Supabase Auth objects and roles: `auth.users`, `auth.uid()`, `authenticated`, and `anon`.
- Supabase Storage objects: `storage.buckets` and `storage.objects`.
- PostgreSQL extension `pgcrypto` for UUID generation.
- A private Storage bucket named `jinox-clinical-assets`. Migration 5 creates it; migration 7 updates its configuration. Verify the exact bucket state and object policies as part of baseline comparison.

### Repository-specific prerequisite chain

1. The unversioned schema snapshot supplies the four public-health tables and `public.handle_updated_at()`.
2. The first two research migrations establish the research workspace and its membership/authorization foundation.
3. Clinical intake creates the parent clinical case/asset records. Clinical assessments, import idempotency and dataset annotation then build on those records.
4. Profiles and project membership establish global and project-level authorization used by asset review, annotation, curation and release RPCs.
5. Operational annotation and asset governance must precede curation/release hardening.
6. The three November 24–25 migrations successively replace the review, curation and release function definitions. They are ordered upgrades, not independent feature migrations.

This is a dependency summary inferred from SQL references and function bodies, not an executable dependency graph.

## Findings requiring reconciliation

### 1. The base schema is outside migration history

`supabase/schema.sql` creates `counties`, `screenings`, `model_versions` and `dataset_snapshots`, as well as `handle_updated_at()`. Those objects are prerequisites for migrations 2–4. There is no corresponding versioned baseline migration in `supabase/migrations/`.

The repository therefore does not currently show one complete, ordered clean-install sequence. A clean environment needs a documented baseline decision before timestamped migrations can be considered runnable.

### 2. Early research table declarations conflict

`20261026_secure_research_mvp.sql` creates research workspace tables first. `20261027000000_research_workspace.sql` later declares several of the same tables using `CREATE TABLE IF NOT EXISTS`. That statement does not reconcile an existing table's columns, constraints, defaults or foreign keys.

Examples of source-level differences include:

- `research_projects`: different status constraint/default and owner foreign-key delete behavior.
- `research_datasets`: the first definition includes `storage_uri` and `data_dictionary_uri`; the later definition does not. The consent-basis and license constraints/defaults also differ.
- `research_consents`: the first definition adds a project/participant uniqueness constraint and a granted-consent timestamp check that the later declaration omits.
- `research_audit_logs`: the first definition uses a bigint identity key and nullable project/actor references; the later declaration specifies a UUID key and non-null references.

Because the first migration runs earlier by version, its table definitions will already exist when the later `IF NOT EXISTS` declarations execute. The later file's table statements will not upgrade those definitions. A baseline comparison must establish the intended canonical schema and whether the first definitions are the deployed ones.

### 3. Migration version formats are inconsistent

The first migration uses the 8-digit version prefix `20261026`; subsequent files use 14-digit prefixes. Confirm that the migration runner and every environment's history table represent this version exactly as intended. Do not rename an already-applied migration as a cosmetic cleanup.

### 4. Some migrations perform data or platform-state changes

- Migration 3 contains targeted `DELETE` statements for exact prototype-shaped rows. Verify the target predicates against an approved snapshot before any execution.
- Migration 4 removes defaults from existing columns.
- Migration 5 creates/configures the private Storage bucket and object policies.
- Migration 7 updates the bucket's MIME and size configuration.
- Migration 9 backfills profiles from `auth.users` and adds an Auth trigger.
- Later migrations replace RLS policies, grants, triggers and security-definer/invoker RPCs.

These are not all simple additive table creations. Review their effects and prerequisites individually.

### 5. Existing CI success is not database migration validation

Application CI can pass without proving that this migration chain applies cleanly to an empty database or matches a deployed schema. Integration suites that skip when fixtures are absent are not evidence of database behavior. A future staging run must explicitly demonstrate that required staging fixtures were present and that the database tests actually executed.

## Baseline reconciliation plan — no operations authorized by this document

### Phase A — establish the historical baseline

1. Identify whether `supabase/schema.sql` was ever applied to staging or production, when, and by what mechanism. Use deployment records or an operator-provided migration-history export; do not query production.
2. Obtain the migration-history records for staging from an authorized operator only when a separate staging review is approved. The current document does not authorize a database connection.
3. Determine whether any timestamped migrations were applied manually, through CI, through the Supabase dashboard, or through a CLI.
4. Record the exact migration version strings and checksums/commit provenance for every applied migration.
5. Decide whether `schema.sql` is a historical base, a generated snapshot, or an obsolete reference. Do not infer this from its filename or its “Production Supabase Schema” heading alone.

### Phase B — define the canonical schema

1. Compare the schema snapshot and all migrations against an authoritative schema export from the relevant environment, if one is supplied through an approved process.
2. Resolve the duplicate research-table definitions in a forward-only way. Document which columns, constraints, defaults and foreign-key actions are canonical.
3. Verify that the baseline contains the objects required by migrations 2–4, especially `handle_updated_at()`, `counties`, `model_versions` and `dataset_snapshots`.
4. Verify Auth and Storage prerequisites, the `jinox-clinical-assets` bucket, its privacy/size/MIME settings, and the applicable `storage.objects` policies.
5. Review RLS enabled state, policy definitions, table/column grants, function execute grants, triggers and security-definer search paths.

### Phase C — choose a baseline adoption path

Choose only after Phase A and B are complete:

- **If the schema snapshot was never applied:** design and review a versioned initial baseline for a disposable, empty staging environment, preserving the intended schema and ordering. Do not simply execute the unversioned file and then assume the migration chain is tracked.
- **If the schema snapshot was applied outside migration tracking:** use a controlled baseline/adoption procedure only after proving that the live schema matches the baseline. Do not replay the schema snapshot over an existing database.
- **If environments have different histories:** reconcile each environment independently. Do not copy staging migration history into another environment or mark migrations applied based only on filenames.

Any migration-history repair or baseline adoption is a separate, explicitly authorized operation. It must not be bundled with this source-only review.

### Phase D — staging validation gate (future, separately approved)

Before any staging write:

- Confirm the target project is the approved staging project and verify its project reference independently.
- Confirm the baseline decision, exact migration list/order and expected pre-migration state.
- Use a disposable staging environment or a restorable backup; use synthetic data only.
- Review the targeted deletes and all Storage/Auth/RLS changes.
- Apply one controlled step at a time with captured logs and migration-history evidence.
- Run SQL-level schema checks and role-specific integration tests with distinct synthetic users and fixtures. Confirm tests ran rather than skipped.
- Exercise annotation revision, reassignment, asset approval, curation and release concurrency paths.
- Capture the resulting schema/migration history and compare it with the expected canonical state.
- Stop on unexpected cost, unexpected existing data, schema drift, failed migration or unclear ownership.

No production access, production migration, production data operation or manual production deployment is part of this plan.

## Current decision

**Hold:** do not apply the 19 timestamped migrations to empty staging until the unversioned schema baseline and duplicate research-table definitions have been reconciled. This is a source-review conclusion, not a claim about the current hosted database state.

## Review limitations

- Repository source was inspected on `main`; hosted database schemas and migration-history tables were not queried.
- No migration was executed or tested locally. Supabase CLI is not available in this workflow.
- The document does not certify SQL syntax, runtime behavior, policy correctness or production parity.


## Detailed source comparison: first two research migrations

A second pass over the complete SQL bodies confirms that the overlap is more consequential than repeated table names alone.

### Table-definition differences

| Object | First migration: `20261026_secure_research_mvp.sql` | Second migration: `20261027000000_research_workspace.sql` | Consequence if applied in filename order |
|---|---|---|---|
| `research_projects` | Status allows `draft/active/paused/archived`; owner FK uses `ON DELETE RESTRICT`; name/description checks trim or bound content. | Status allows only `active/archived`; owner FK uses `ON DELETE CASCADE`; name check does not trim. | The first definition remains; the second `IF NOT EXISTS` does not narrow status values or change FK behavior. |
| `research_datasets` | Includes `storage_uri` and `data_dictionary_uri`; status includes `under_review/approved`; consent basis is required; private-URL check on `storage_uri`. | Omits both URI columns; status includes `available`; consent basis defaults to `pending_review`; license and model-version fields have additional length checks. | The first table shape remains. Later code expecting columns only in the second declaration may not find them; the reverse applies to columns only in the first declaration. |
| `research_experiments` | `model_version` is unrestricted text. | `model_version` is nullable text capped at 160 characters. | The first constraint set remains. |
| `research_consents` | Adds unique `(project_id, participant_code)` and requires `consented_at` when status is granted. | No matching uniqueness or granted-timestamp check in this declaration; adds length check for `consent_version`. | The first constraints remain; the later length check is not introduced by `IF NOT EXISTS`. |
| `research_audit_logs` | Bigint identity primary key; nullable project and actor references with `ON DELETE SET NULL`; `resource_id text`. | UUID primary key; project and actor are non-null with `ON DELETE CASCADE`; `resource_id uuid`. | The first key and column types/nullability remain. This is a material schema-contract difference for audit consumers and future migrations. |
| `research_project_members` | Created in the first migration with project/user composite primary key and role check. | Not declared in the second migration. | It is not a duplicate table declaration; it is already present before the later membership migration. |

The table outcomes above follow PostgreSQL's `CREATE TABLE IF NOT EXISTS` behavior: it skips creation when a relation of that name already exists; it does not compare or merge definitions.

### Policy and helper-function overlap

The first migration creates policies such as `research_projects_read_member`, `research_projects_update_manager`, `research_datasets_read_member`, `research_experiments_read_member`, and the consent/audit policies. The second migration creates differently named `owners manage ...` policies on several of the same tables. It does not first remove all the earlier policy names.

The later assignment-access migration drops its own policy names (for example, `project members can read projects`) but does not explicitly remove the original `research_* ` policies from the first migration.

PostgreSQL permissive RLS policies are combined with OR semantics for a command. Therefore, multiple surviving permissive policies can grant the union of their allowed rows/actions. A reviewer must evaluate the complete effective policy set, not only the most recently added policy. The exact effective permissions still depend on each policy's command, role, USING and WITH CHECK expressions and table grants.

The first migration also creates `research_is_member(uuid)` and `research_can_manage(uuid)`; later migrations introduce differently named project-role helpers. The earlier helpers and policies are not automatically superseded merely because newer helpers exist.

### Required resolution before baseline adoption

1. Select the canonical definitions for all six objects above, including the intended project deletion behavior, dataset status vocabulary, consent constraints and audit-log key/resource types.
2. Decide whether legacy membership policies are intended to remain. If not, prepare explicit forward-only policy cleanup after analyzing the effective RLS matrix for owner, principal investigator, researcher, reviewer, viewer and unrelated authenticated users.
3. Inspect all application queries, generated TypeScript database types (if any), RPCs and downstream audit consumers for assumptions about `research_audit_logs.id`, `resource_id`, nullability and dataset URI columns.
4. Design an explicit reconciliation migration that alters existing tables and removes/replaces obsolete policies safely. Do not edit historical migrations that may already be recorded as applied.
5. Validate the reconciliation on a disposable, empty staging clone using synthetic users and role-specific RLS tests before any real staging adoption is considered.

This comparison is based on repository SQL text only. It does not establish which definitions exist in staging or production, whether the migrations were applied, or whether the policies are currently active in either hosted environment.
