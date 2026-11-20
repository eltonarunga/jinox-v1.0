# Research schema conflict audit

## Status and scope
This is a source-level reconciliation audit of the two early research migrations. It does not represent the state of a deployed database. The dedicated staging database remains empty; do not apply these migrations until the canonical schema and migration order are reconciled.

## Confirmed overlapping definitions

### `research_projects`
| Attribute | MVP migration | Workspace migration | Conflict |
|---|---|---|---|
| `status` | `draft, active, paused, archived` (default `draft`) | `active, archived` (default `active`) | Values/defaults incompatible |
| `owner_id` deletion | `ON DELETE RESTRICT` | `ON DELETE CASCADE` | Referential behavior differs |
| `name` | Trimmed length 3–160 | Length 3–160 without trim | Whitespace handling differs |

### `research_datasets`
| Attribute | MVP migration | Workspace migration | Conflict |
|---|---|---|---|
| `consent_basis` | Required; no default | Defaults to `pending_review` | Requiredness/default differs |
| `license` | Unconstrained text | Max 300 chars | Constraint differs |
| `status` | `metadata_only, under_review, approved, restricted, archived` | `metadata_only, available, restricted, archived` | Status vocabulary differs; `approved` and `under_review` not shared with later definition |
| `storage_uri` | Present, constrained to avoid public URLs | Absent | Column missing in later definition |
| `data_dictionary_uri` | Present | Absent | Column missing in later definition |
| `created_by` | `ON DELETE RESTRICT` | Default FK behavior | Referential behavior differs |

### `research_experiments`
The column set is substantially similar. The later migration adds length validation for `model_version` and uses a different FK deletion specification for `created_by`. Confirm the desired constraints before selecting the canonical definition.

### `research_consents`
The later migration changes constraint details for `consent_version`, but does not reproduce the unique constraint on `(project_id, participant_code)` present in the MVP migration. That uniqueness requirement must be explicitly decided and retained or intentionally replaced.

### `research_audit_logs`
| Attribute | MVP migration | Workspace migration | Conflict |
|---|---|---|---|
| `id` | bigint identity | UUID | Primary key type differs |
| `project_id` | nullable; `ON DELETE SET NULL` | required; `ON DELETE CASCADE` | Optionality and deletion behavior differ |
| `actor_id` | nullable; `ON DELETE SET NULL` | required | Optionality differs |
| `resource_id` | text | uuid | Type differs |
| `action/resource_type` | lengths 2–120 / 2–80 | lengths 1–120 / 1–120 | Validation differs |

## Migration sequencing risks

1. Both early migrations use `CREATE TABLE IF NOT EXISTS` for overlapping relations. The second does not reconcile a table already created by the first.
2. Subsequent migrations refer to the research membership, helper functions, tables and columns; verify their dependency chain against the selected canonical definitions.
3. `supabase/schema.sql` is a separate schema snapshot containing objects used by later migrations (including `handle_updated_at()`). Its role in a clean bootstrap must be verified, not assumed.
4. Existing migrations should not be silently rewritten if they have been applied in any shared environment. A repair should use a deliberate clean-install baseline or forward migration strategy and record the intended path.

## Required decisions before staging application
- Pick one canonical definition for each overlapping research table.
- Decide project lifecycle values and defaults.
- Decide whether dataset storage pointers remain and what access constraints apply.
- Decide consent uniqueness and consent-basis defaults.
- Decide audit log key and resource ID types, nullability, retention, and deletion behavior.
- Confirm whether `schema.sql` is baseline, snapshot, or manually applied; document exactly.
- Confirm all subsequent migrations against that contract and generate a dependency map.
- Test the proposed clean-install migration path on a disposable local PostgreSQL instance before applying to staging.

## Non-goals
- No production schema change.
- No staging migration applied.
- No real clinical data.
- No migration files altered in this audit.
