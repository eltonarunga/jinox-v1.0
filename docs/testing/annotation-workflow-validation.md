# Annotation workflow validation

This suite exercises the database workflow introduced by:

- `20261124000000_enforce_current_annotation_revisions.sql`
- `20261125000000_bind_annotation_to_current_assignment.sql`

It is intentionally separate from the ordinary PR integration suite. It requires an already-reconciled staging schema and **synthetic-only fixtures**. It must never be run against production or with patient data.

## Run

```bash
npm run test:annotation-workflow
```

Set `JINOX_REQUIRE_ANNOTATION_WORKFLOW_TESTS=1` to make missing fixtures a hard failure rather than a skipped suite.

## Required environment variables

Use staging-only URL, publishable/anon key and short-lived test-user access tokens:

- `JINOX_TEST_SUPABASE_URL`
- `JINOX_TEST_SUPABASE_ANON_KEY`
- `JINOX_TEST_OWNER_TOKEN`
- `JINOX_TEST_RESEARCHER_TOKEN`
- `JINOX_TEST_REVIEWER_TOKEN`

Supply disposable synthetic fixture IDs:

- `JINOX_TEST_ANNOTATION_STALE_SUBMITTED_ID`: submitted annotation with a newer draft revision for the same item and annotator.
- `JINOX_TEST_ANNOTATION_WRONG_ASSIGNEE_ID`: submitted annotation whose annotator is not the item's current assignee.
- `JINOX_TEST_ANNOTATION_ACCEPT_ID`: current assignee's latest submitted revision, with no prior review; reviewer may accept it.
- `JINOX_TEST_ANNOTATION_CHANGES_REQUESTED_ID`: current assignee's latest submitted revision; reviewer may request changes and researcher may create the next draft.
- `JINOX_TEST_ANNOTATION_ACTIVE_REASSIGN_ITEM_ID`: item whose status is not queued and whose current assignee differs from the target researcher.
- `JINOX_TEST_ANNOTATION_QUEUED_ASSIGN_ITEM_ID`: queued item that can be assigned to the target researcher.
- `JINOX_TEST_ANNOTATION_NEW_ASSIGNEE_ID`: user ID of a researcher who is a member of both assignment fixtures' project(s).
- `JINOX_TEST_RELEASE_DATASET_ID`: release-eligible synthetic dataset.
- `JINOX_TEST_RELEASE_STALE_ITEM_ID`: included/accepted item whose current assignee has a newer draft after an earlier accepted revision.
- `JINOX_TEST_RELEASE_ELIGIBLE_ITEM_ID`: positive-control item eligible for release.

The release fixture must contain both the stale item and positive-control item. The positive-control item must have an approved asset, checksum, open case, valid consent basis, latest curation decision `include`, and latest submitted annotation revision independently accepted. The stale item must otherwise satisfy those conditions but have a newer draft revision so the release query must exclude it.

## Coverage

1. Stale submitted revision cannot be reviewed.
2. Annotation from a non-current assignee cannot be reviewed.
3. Current submitted revision can be accepted and advances the item to `accepted`.
4. `changes_requested` moves the item back to `in_progress`; the assigned researcher can create a higher draft revision; the old revision then becomes unreviewable.
5. Reassignment after work starts is rejected by the trigger and leaves the assignee unchanged.
6. Queued assignment remains possible.
7. Release contains the positive control, excludes the stale item, and has no duplicate dataset-item IDs.

## Important limitations

- The suite performs writes to staging fixtures: it creates review records, creates a new annotation revision, assigns a queued item, and creates an immutable release. Use disposable fixtures and reset/recreate them between runs.
- It does not create users or fixtures, and does not use the service-role key.
- It does not test concurrent save/review races. That requires a separate two-session test once the staging schema baseline and fixture environment are ready.
- A skipped run is not a passing validation. Confirm all seven tests actually execute before treating the workflow as validated.
