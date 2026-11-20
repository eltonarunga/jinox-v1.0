# Dataset item status transition: authorization and workflow conflict

## Scope

This is a source-level review of the migration files and integration test on the repository's current `main` branch. It is not evidence about the deployed staging or production database. No database was queried or changed for this review.

## Findings

### 1. Direct status updates remain granted

`supabase/migrations/20261028205400_annotation_assignment_access.sql` revokes table-level UPDATE from `authenticated`, then grants column-level UPDATE on both `assigned_to` and `status`:

```sql
revoke update on public.dataset_items from authenticated;
grant update (assigned_to, status) on public.dataset_items to authenticated;
```

The same migration creates the `managers assign items and researchers update own status` UPDATE policy. Its `USING` and `WITH CHECK` clauses include a project-manager branch. That branch does not restrict the new status value. Consequently, the source currently permits project managers to attempt direct status changes, subject to the deployed policy set and other applicable grants/policies.

### 2. PR #84 adds a regression assertion that conflicts with the current source

`tests/integration/research-access.test.mjs` now asserts that a project manager's direct update of an eligible `dataset_items.status` fails and leaves the status as `accepted`.

That assertion is a useful target invariant, but it is not yet satisfied by the migration source above. CI success alone is not proof that the assertion ran: the integration suite has conditional fixture/environment skips, as documented in `docs/testing/staging-integration-test-skip-audit.md`.

### 3. A simple privilege revocation would break annotation submission

`supabase/migrations/20261104000000_operational_annotation_workflow.sql` defines `save_dataset_annotation` as `SECURITY INVOKER`. After writing the annotation row, it directly updates `dataset_items.status` to `submitted` or `in_progress`.

Because it is SECURITY INVOKER, that update is subject to the caller's table privileges and RLS. Removing authenticated users' `status` column privilege without changing this workflow would cause annotation saves/submissions to fail.

### 4. Review and release logic depends on item status and independent review records

The `review_dataset_annotation` function is SECURITY DEFINER and explicitly inserts an `annotation_reviews` row before changing the item status. The curation and release functions additionally require an independently accepted review record. These are useful controls, but they do not neutralize a separate direct status-update grant.

## Recommended remediation sequence

Do not apply a one-line revoke in isolation. First trace all application and database consumers of `dataset_items.status`, including filters and queue transitions.

A safer design to evaluate is:

1. Keep annotation submission state on `dataset_annotations.status`, which is already set to `submitted` by `save_dataset_annotation`.
2. Remove the direct `dataset_items.status` update from the SECURITY INVOKER annotation-save function.
3. Update the review RPC's preconditions and transition logic so it validates a submitted annotation independently of a client-writable item status.
4. Restrict direct authenticated updates to `assigned_to` only, with RLS checks that constrain assignment changes to authorized project managers.
5. Keep accepted/rejected/changes-requested item transitions inside the narrowly authorized review RPC.
6. Preserve curation/release checks for the independent accepted review record; consider verifying that the latest accepted review corresponds to the annotation selected for release.
7. Add positive and negative integration tests for assignment, draft save, submission, review, rejected direct status changes, curation, and release.

Before implementing this design, inspect all frontend status filters and write paths. In particular, determine whether any UI depends on `dataset_items.status = 'submitted'` to find work awaiting review. If it does, replace that dependency deliberately rather than silently changing the workflow.

## Verification required

- Run the integration suite with all required staging fixture variables present and confirm the status-update test is reported as executed, not skipped.
- Verify that a manager can still assign an item but cannot directly change its status.
- Verify that an assigned researcher can save drafts and submit annotations after direct status privilege is removed.
- Verify that only the authorized review RPC changes item status to accepted/rejected/changes-requested.
- Verify that curation and release reject items without the corresponding independent accepted review.
- Run RLS/security advisor checks and inspect deployed policy/grant catalogs in staging only.

No migration is proposed or applied by this document. Production remains out of scope.
