# Dataset item status write-path audit

## Finding

The annotation workflow intends status transitions to be performed atomically by the
`save_dataset_annotation` and `review_dataset_annotation` RPCs. The review RPC is
documented as the path that records an independent review and advances an item to
`accepted`, `rejected`, or `in_progress`.

The current grants and row-level policy also permit direct client updates to the
`dataset_items.status` column:

- `20261028205400_annotation_assignment_access.sql` grants authenticated users
  column-level updates on `assigned_to` and `status`.
- Its `managers assign items and researchers update own status` policy allows
  project managers to update an item when they manage its project. The manager
  branch of the policy does not constrain the new status value.
- `20261104000000_operational_annotation_workflow.sql` adds the atomic review RPC,
  but does not remove the direct status-update grant or narrow the manager branch.
- `20261107000000_dataset_curation_releases.sql` relies on
  `dataset_items.status = 'accepted'` as one of the release eligibility gates.

Consequently, a project manager can use the table update path to mark an item
`accepted` without creating an `annotation_reviews` row through
`review_dataset_annotation`. This weakens the intended separation between
annotation work and independent review, and makes the item status alone an
unreliable proof that the review workflow ran.

This is a source-level finding. It has not yet been exercised against a deployed
database; the staging project remains an empty baseline and production has not
been queried or changed.

## Recommended remediation

1. Remove direct authenticated-client permission to update
   `dataset_items.status`. Keep assignment changes separately permissioned.
2. Preserve the workflow's legitimate status changes through narrowly scoped
   database functions. In particular, review status changes should remain atomic
   with the review row. The save-annotation function should retain its explicit
   assigned-researcher and project-role checks if it is changed to a privileged
   execution context.
3. Add negative integration tests proving that a manager cannot directly set
   `status = 'accepted'`, and positive tests proving that the authorized review
   RPC can still accept, reject, or request changes.
4. Verify that release creation rejects an item unless a corresponding
   independent accepted review exists, rather than trusting a mutable status
   field alone.

## Scope and status

No SQL was applied, no test identities or fixtures were created, and no data or
settings were changed. The next implementation change should be reviewed and
tested in a disposable clean database before it is applied to staging.
