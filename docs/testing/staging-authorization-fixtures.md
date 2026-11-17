# Staging authorization integration test setup

The integration suite in `tests/integration/research-access.test.mjs` validates Supabase RLS, storage access, atomic review RPCs, and immutable curation/release records. It must run only against a dedicated **staging** Supabase project populated with synthetic fixtures.

## Safety boundary

- Never point these tests at production.
- Use synthetic records and dedicated staging identities only. Do not use patient or other real personal data.
- Store JWTs, Supabase URL, and anon key in GitHub Actions repository/environment secrets. Never commit them or place them in issue/PR text.
- The suite does not need a service-role key; clients authenticate with the staging anon key plus individual user JWTs.
- Some tests mutate fixtures. Asset review transitions are one-time, and curation/release tests append history and create a release. Use disposable fixtures and recreate them before each full run.
- Do not run the suite until the migration inventory is applied and verified in staging. No production migrations are authorized by this document.

## Required environment variables

### Shared project access

| Variable | Purpose |
|---|---|
| `JINOX_TEST_SUPABASE_URL` | Staging Supabase project URL |
| `JINOX_TEST_SUPABASE_ANON_KEY` | Staging anon/public key |
| `JINOX_TEST_PROJECT_ID` | Synthetic research project ID |
| `JINOX_TEST_DATASET_ID` | Synthetic research dataset ID |
| `JINOX_TEST_OWNER_TOKEN` | JWT for project owner/manager |
| `JINOX_TEST_RESEARCHER_TOKEN` | JWT for researcher |
| `JINOX_TEST_REVIEWER_TOKEN` | JWT for reviewer |
| `JINOX_TEST_VIEWER_TOKEN` | JWT for viewer |
| `JINOX_TEST_UNRELATED_TOKEN` | JWT for user outside the project |

### Assignment, asset, and annotation fixtures

| Variable | Required fixture |
|---|---|
| `JINOX_TEST_ASSIGNED_ITEM_ID` | Dataset item assigned to the researcher |
| `JINOX_TEST_ASSIGNED_ASSET_ID` | Approved asset linked to the assigned item, with a private object in `jinox-clinical-assets` |
| `JINOX_TEST_PENDING_ASSET_ID` | Pending asset uploaded by the owner; used for negative self-approval and metadata-write checks |
| `JINOX_TEST_SUBMITTED_ANNOTATION_ID` | Submitted annotation authored by the researcher |
| `JINOX_TEST_DRAFT_ANNOTATION_ID` | Draft annotation in the same project, not visible to the reviewer |

### Global asset-review fixtures

| Variable | Required fixture |
|---|---|
| `JINOX_TEST_ASSET_REVIEW_ADMIN_TOKEN` | Global admin JWT, not the uploader of approve/reject/quarantine fixtures |
| `JINOX_TEST_ASSET_REVIEW_NON_ADMIN_TOKEN` | Authenticated non-admin JWT |
| `JINOX_TEST_ASSET_REVIEW_OWNER_TOKEN` | JWT belonging to the uploader of the review-decision fixtures |
| `JINOX_TEST_ASSET_REVIEW_ADMIN_SELF_OWNED_ID` | Pending asset uploaded by the global admin; self-review must fail |
| `JINOX_TEST_ASSET_REVIEW_APPROVE_ID` | Disposable pending asset uploaded by the owner identity |
| `JINOX_TEST_ASSET_REVIEW_REJECT_ID` | Separate disposable pending asset uploaded by the owner identity |
| `JINOX_TEST_ASSET_REVIEW_QUARANTINE_ID` | Separate disposable pending asset uploaded by the owner identity |
| `JINOX_TEST_ASSET_REVIEW_CONCURRENT_ID` | Separate pending asset used only for the concurrent decision race |

The approve, reject, quarantine, and concurrent fixtures must be distinct because each successful review changes the asset status and creates a one-time review record. Recreate them before another full run.

### Curation and release fixtures

| Variable | Required fixture |
|---|---|
| `JINOX_TEST_CURATION_DATASET_ID` | Disposable dataset with rights/status resolved |
| `JINOX_TEST_CURATION_ELIGIBLE_ITEM_ID` | Accepted item with approved asset, checksum, open case, consent/ethics waiver, submitted annotation, and latest accepted independent review |
| `JINOX_TEST_CURATION_INELIGIBLE_ITEM_ID` | Item that deliberately fails at least one release eligibility condition |
| `JINOX_TEST_CURATION_OWNER_TOKEN` | Project manager JWT for the curation dataset |
| `JINOX_TEST_CURATION_REVIEWER_TOKEN` | Reviewer JWT for the curation dataset |
| `JINOX_TEST_CURATION_RESEARCHER_TOKEN` | Researcher JWT for the curation dataset |
| `JINOX_TEST_CURATION_UNRELATED_TOKEN` | JWT for a user outside the curation project |

The curation test appends an inclusion event and creates a release manifest. Use a fresh disposable dataset/item pair for repeat runs, or explicitly provision a clean fixture set through a reviewed staging-only process.

## What the suite verifies

1. Project/dataset visibility for owner and collaborators, with unrelated-user denial.
2. Assignment-scoped access to work items and approved private assets.
3. Owner denial for self-approval and direct asset metadata changes.
4. Reviewer access to submitted annotations but not drafts.
5. Rejection of direct `annotation_reviews` writes and self-review.
6. Global-admin-only asset review, non-owner requirement, audit immutability, and concurrency serialization.
7. Role-gated curation, inclusion eligibility, append-only curation events, release creation, and immutable release manifests.

## Execution and interpretation

Run:

```bash
npm ci
npm run test:integration
```

The test file deliberately skips cases when required variables are absent. A green CI job with skipped tests is **not** proof that RLS, storage, or RPC authorization has passed. Capture the Node test summary and verify that the expected tests ran with zero skips before marking staging authorization as validated.

Before enabling the full suite in CI, provision a dedicated GitHub Actions environment (for example, `staging`) with approval controls and the required secrets. Keep staging credentials separate from Vercel production environment variables. Record the migration versions applied to staging and the fixture-generation procedure, but never store JWT values or private keys in this document.
