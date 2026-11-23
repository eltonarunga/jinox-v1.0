# Research schema migration source audit

**Scope:** source files on `main` only. This is not a live database catalog audit.

## Decision

Do not apply the research migration chain to the empty staging project yet. The two early research schema migrations define overlapping tables differently. Because they use `CREATE TABLE IF NOT EXISTS`, whichever migration creates the table first can prevent later definitions from reconciling its structure. The migration history and intended canonical baseline must be resolved before staging.

## Confirmed source conflicts

| Table | `20261026_secure_research_mvp.sql` | `20261027000000_research_workspace.sql` | Impact |
|---|---|---|---|
| `research_projects` | Status: `draft/active/paused/archived`; owner FK uses `ON DELETE RESTRICT`; name uses trimmed length validation | Status: `active/archived`; owner FK uses `ON DELETE CASCADE`; name length is not trimmed | Different status vocabulary and deletion semantics. |
| `research_datasets` | Includes `storage_uri` and `data_dictionary_uri`; consent_basis has no default; status includes `under_review/approved`; URI check disallows HTTP(S) | Omits storage URI fields; consent_basis defaults to `pending_review`; status includes `available`; license length capped at 300 | Incompatible data model and dataset lifecycle semantics. |
| `research_experiments` | `model_version` nullable text without length limit; creator FK uses `ON DELETE RESTRICT` | `model_version` nullable text capped at 160; creator FK has default delete behavior | Different validation and referential behavior. |
| `research_consents` | Consent version has no length check; creator FK uses `ON DELETE RESTRICT`; includes constraint that granted consent requires `consented_at` | Consent version length 1–80; creator FK default delete behavior; no equivalent granted timestamp constraint in table definition | Different validation and integrity rules. |
| `research_audit_logs` | Bigint identity PK; project/actor nullable; project delete sets null; resource ID text | UUID PK; project/actor non-null; project delete cascades; resource ID UUID | Fundamentally incompatible audit record structure. |

## Why this blocks staging

1. These are competing definitions, not additive changes.
2. `IF NOT EXISTS` does not alter an existing table to match a later definition.
3. Later policies, functions, triggers, and app code may assume columns, status values, or constraints that do not match the table actually created.
4. Choosing a migration order without a reviewed reconciliation plan risks producing a staging schema that is neither migration's intended model.

## Recommended remediation sequence

1. Decide the canonical definitions for each overlapping table, with product owners confirming lifecycle states, delete behavior, storage fields, audit identifier strategy, and consent integrity.
2. Identify which schema file is the canonical source for a fresh installation; clarify the role of `supabase/schema.sql` (currently labeled a production schema) relative to migrations.
3. Create a reviewed baseline/reconciliation migration plan. Do not rewrite historical migrations without an explicit strategy for already-provisioned environments.
4. Validate the full migration chain on a disposable local PostgreSQL/Supabase environment and inspect the resulting catalog.
5. Only after review and clean validation, apply the baseline to the empty staging project.
6. Provision synthetic fixtures and execute strict authorization tests.

## Explicit limits

- No Supabase project catalog was queried for this audit.
- No migration was applied.
- Staging and production databases were not modified.
- The audit is based on GitHub source migration text, not deployed state.
