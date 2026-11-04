> **Document status: historical implementation note.** This file records the original secure research MVP implementation and migration/API examples. The standalone `/research` workspace is no longer part of the primary product navigation. Research API route groups and database structures remain in the repository, but this document must not be read as a statement that a complete Research UI or production-ready research workflow is currently shipped. For current scope and delivery priorities, see the [repository README](../README.md), [documentation index](README.md), [milestone plan](../planning.md), and [active task backlog](../tasks.md).

# JinoX AI — Secure Research MVP patch

This patch adds a project-scoped research metadata foundation. It does **not** implement or validate the proposal's multimodal foundation model, digital twin, genomic risk model, clinical diagnostic model, or climate-health predictions.

## Included

- Additive Supabase migration for research projects, memberships, dataset metadata, experiment records, consent metadata, and audit logs.
- Row Level Security (RLS) policies scoped to project membership and owner/principal-investigator permissions.
- API bearer-token verification through Supabase Auth, with all queries using the caller's JWT so RLS remains active.
- `GET/POST /api/research/projects`, `GET/POST /api/research/datasets`, `GET/POST /api/research/experiments`, and `GET/POST /api/research/governance/consents`.
- Research workspace UI at `/research`.
- Dataset registration only; no patient file upload is enabled by this patch.

## Install and validate

1. Use a feature branch and review the diff before merging.
2. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Do not expose or use a service-role key in browser-facing code.
3. Apply `supabase/migrations/20261026_secure_research_mvp.sql` to a **development/staging** Supabase project after reviewing the SQL. Keep a backup and use a migration workflow before production.
4. Run `npm install`, `npm run type-check`, and `npm run build`.
5. In Supabase Auth, create a test user. Sign in through the app and verify all endpoints use the session's access token.
6. Test with two accounts and confirm each can only access projects to which they belong.

## API examples

Create project:

```http
POST /api/research/projects
Authorization: Bearer <access-token>
Content-Type: application/json

{"name":"Kenya fluoride and oral health pilot","description":"Research metadata workspace","research_area":"environmental_health"}
```

Register dataset metadata:

```http
POST /api/research/datasets
Authorization: Bearer <access-token>
Content-Type: application/json

{"project_id":"<project-uuid>","name":"County water-quality observations","modality":"environmental","source_type":"public_dataset","consent_basis":"public_licensed","license":"Confirm source licence before use","record_count":0}
```

List projects: `GET /api/research/projects`

List datasets: `GET /api/research/datasets?project_id=<project-uuid>`

Example experiment body:

```json
{"project_id":"<project-uuid>","name":"Baseline data-quality audit","hypothesis":"Measure missingness by modality","method":"Descriptive analysis","status":"planned","metrics":{}}
```

Example consent metadata body:

```json
{"project_id":"<project-uuid>","participant_code":"PSEUDO_001","consent_version":"v1.0","consent_status":"pending","language":"sw"}
```

## Before production

- Run automated tests against a staging Supabase project, including two users in separate projects and attempts to access each other's data.
- Review the `SECURITY DEFINER` functions and grants with a database security reviewer; limit function execution grants if your Supabase role configuration requires it.
- Add rate limits, request-size limits, structured server-side logging, monitoring, and a documented incident-response process.
- Audit writes are best-effort in these API handlers; production use should move resource + audit writes into a database transaction/RPC and fail the request if audit persistence fails.
- Create a private Storage bucket and explicit upload/download policies before storing any real images or records. Do not store names, national IDs, phone numbers, or direct patient identifiers in this metadata layer.
- Establish ethics approval, informed-consent procedures or documented waivers, retention/deletion policy, access review, and data-sharing agreements before ingesting real patient or genomic data.
- Review the existing `screenings` anonymous-insert policy separately; do not send identifiable or sensitive data through it.
- Verify the provenance of seeded county readings, screening totals, dataset sizes, and model metrics in the existing schema. Label unverified values as demo data and exclude them from scientific claims.

The endpoints have not been executed against your Supabase instance or tested with real users. Consent metadata is not a substitute for the approved consent process or signed records required by the study protocol. The workspace records metadata and does not run scientific inference or validate caller-submitted model metrics.
