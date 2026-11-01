# Research authorization integration tests

These tests are intended for a dedicated **staging** Supabase project containing only synthetic test metadata and assets. Never point them at production patient data.

## Prerequisites

Apply and verify the research workspace and annotation-access migrations in staging first. Create separate staging identities with owner, researcher, reviewer, viewer and unrelated-user roles. Give each collaborator membership only in the designated test project. Seed one synthetic dataset, one item assigned to the researcher, one submitted annotation by that researcher, and one draft annotation. Use test-only clinical asset references.

Configure these environment variables in the test runner:

- `JINOX_TEST_SUPABASE_URL`
- `JINOX_TEST_SUPABASE_ANON_KEY`
- `JINOX_TEST_PROJECT_ID`
- `JINOX_TEST_DATASET_ID`
- `JINOX_TEST_OWNER_TOKEN`
- `JINOX_TEST_RESEARCHER_TOKEN`
- `JINOX_TEST_REVIEWER_TOKEN`
- `JINOX_TEST_VIEWER_TOKEN`
- `JINOX_TEST_UNRELATED_TOKEN`
- `JINOX_TEST_ASSIGNED_ITEM_ID`
- `JINOX_TEST_SUBMITTED_ANNOTATION_ID`
- `JINOX_TEST_DRAFT_ANNOTATION_ID`

Use short-lived access tokens from dedicated test users. Do not commit tokens or add them to ordinary CI logs.

Run with:

```sh
node --experimental-strip-types --test tests/integration/research-access.test.mjs
```

Tests skip explicitly when required variables are absent. A skipped suite is **not** evidence that RLS is correct. The suite checks project/dataset metadata visibility, assignment-scoped item access, reviewer visibility of submitted annotations, and a negative self-review attempt that must be rejected by RLS.

Before production rollout, separately verify successful assignment and annotation writes, role changes, audit transaction rollback on audit failure, and private Storage access using distinct role identities. Keep the annotation-access migration out of production until those checks pass.
