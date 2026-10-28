# Research authorization integration tests

These tests intentionally run only against a dedicated **staging** Supabase project with synthetic metadata. Never point them at production patient data.

## Prerequisites

Apply and verify the research workspace and annotation-access migrations in staging first. Create separate staging identities with owner, researcher, reviewer, viewer and unrelated-user roles. Give each collaborator membership only in the designated test project. Create one synthetic dataset in that project.

Configure the following environment variables in the test runner:

- `JINOX_TEST_SUPABASE_URL`
- `JINOX_TEST_SUPABASE_ANON_KEY`
- `JINOX_TEST_PROJECT_ID`
- `JINOX_TEST_DATASET_ID`
- `JINOX_TEST_OWNER_TOKEN`
- `JINOX_TEST_RESEARCHER_TOKEN`
- `JINOX_TEST_REVIEWER_TOKEN`
- `JINOX_TEST_VIEWER_TOKEN`
- `JINOX_TEST_UNRELATED_TOKEN`

Use short-lived access tokens from dedicated test users. Do not commit tokens or add them to ordinary CI logs.

Run with:

```sh
node --experimental-strip-types --test tests/integration/research-access.test.mjs
```

If staging variables are absent, the suite skips explicitly; a skipped suite is **not** evidence that RLS is correct. The current automated assertions cover project/dataset metadata visibility. Before production rollout, also verify assignment writes, annotation visibility and edits, reviewer separation (no self-review), audit-write atomicity, and private Storage access using separate role identities. Keep the annotation migration out of production until those checks pass.
