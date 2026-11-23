# Annotation review must be bound to the current submitted revision

## Scope

Source-only audit of `supabase/migrations/20261104000000_operational_annotation_workflow.sql`. This note does not assert that the migration is deployed or that the behavior has been reproduced in a database.

## Observed source behavior

- `save_dataset_annotation` locks the dataset item, validates the assigned researcher and workflow state, then updates an existing draft annotation or inserts a new revision.
- When a review decision is `changes_requested`, `review_dataset_annotation` moves the dataset item to `in_progress`, but does not change the reviewed annotation's `status` from `submitted`.
- `review_dataset_annotation` accepts an annotation ID and checks that the selected annotation is `submitted`, the associated dataset item is `submitted`, the reviewer is not the annotator, and the caller is a reviewer or project manager. It does not appear to check that the selected annotation is the latest revision for that item/annotator.

## Risk to verify

After changes are requested, the researcher may create a newer annotation revision while an earlier submitted annotation remains marked submitted. Once the item is submitted again, the review RPC's source checks appear capable of allowing the older submitted annotation ID to be reviewed, even if it is no longer the current revision. This is a source-level concern; staging behavior has not been verified.

## Suggested invariant

Review decisions should be bound to the exact current submitted revision for the dataset item. A review should fail if the annotation is stale, superseded, or not the revision the workflow currently expects.

Consider making annotation revision supersession explicit and/or validating the selected annotation against the latest revision under the same lock/transaction. Keep review evidence tied to an immutable revision identifier.

## Regression tests to add before migration rollout

Use synthetic staging identities and metadata only:

1. A reviewer can review the current submitted annotation.
2. A reviewer cannot review an older submitted revision after a newer revision is created and submitted.
3. A `changes_requested` decision followed by a new revision cannot make the previous revision reviewable again.
4. A stale review attempt does not change the dataset-item status or create a review row.
5. Concurrent submissions/reviews are serialized and cannot produce review evidence for an outdated revision.

## Status

- Source inspection only; no SQL was executed.
- Staging remains empty and no migrations were applied.
- No production database or patient data was accessed.
