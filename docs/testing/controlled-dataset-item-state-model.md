# Controlled dataset-item workflow state: implementation decision

## Status and scope

This is an implementation decision based on the current source on `main`. It is not a migration and does not establish deployed database state. No staging or production database was queried or changed for this decision.

Related audits:
- `docs/testing/dataset-item-status-write-path-audit.md`
- `docs/testing/dataset-item-status-transition-conflict.md`
- `docs/testing/annotation-status-frontend-dependency-audit.md`

## Decision

Keep `dataset_items.status` as the operational workflow state used by the annotation workspace, QA queue, dataset overview, and curation eligibility checks. Do not move the entire workflow to annotation-row status in this remediation.

Treat the parent item status as a **controlled workflow projection**, not as independent proof that QA occurred. The database must only permit authorized workflow functions to change it. The independent `annotation_reviews` record remains the evidence of a QA decision. Curation and release must continue checking that evidence for the submitted annotation, in addition to the accepted item state and existing asset, consent, rights, and checksum requirements.

This is the smaller compatible change because:
- `save_dataset_annotation` currently changes the parent item to `in_progress` or `submitted`.
- `review_dataset_annotation` records the independent review and changes the parent item to `accepted`, `rejected`, or `in_progress`.
- `app/quality/page.tsx` selects parent items in `submitted` state before loading submitted annotations.
- `app/datasets/[datasetId]/page.tsx` reports parent workflow states.
- curation and release functions use accepted item state as an eligibility gate while separately checking accepted review evidence.

## Required database changes

A future migration must implement all of these together:

1. **Remove direct status-write privilege.** Revoke authenticated `UPDATE` on `dataset_items`, then grant only `UPDATE (assigned_to)`. Do not grant authenticated users direct update access to `status`.
2. **Constrain assignment.** Keep assignment validation to project researchers. Initially permit direct assignment or unassignment only while the item is `queued`; do not allow a normal assignment update to reassign an in-progress, submitted, accepted, or rejected item. A separate audited reassignment/reopen function can be designed later if operationally needed.
3. **Make assignment state-neutral.** Change `app/annotate/page.tsx` so `assignItem` updates only `assigned_to`; it must not write `status: "queued"`. Disable or explain assignment controls for non-queued items.
4. **Preserve annotation submission.** The current `save_dataset_annotation` function is `SECURITY INVOKER` and updates `dataset_items.status`. Once direct status grants are removed, a coordinated replacement is required. If converted to `SECURITY DEFINER`, it must explicitly validate the authenticated actor, item lock and existence, current assignment, researcher membership, allowed item state, annotation ownership, draft/revision behavior, and input limits before writing. Use a fixed empty search path and fully qualified object names. Revoke execute from `PUBLIC` and `anon`; grant only to `authenticated`. Review function ownership and effective privileges before relying on RLS bypass.
5. **Preserve independent review.** Keep `review_dataset_annotation` as the controlled review transition. Retain row locks, project reviewer/manager authorization, self-review denial, submitted-state checks, independent review insertion, and atomic parent-state transition.
6. **Preserve release evidence.** Keep curation and release checks for the latest accepted independent review of a submitted annotation. A mutable parent status alone must never qualify an item for release.

## Required application and integration tests

Before staging rollout, add or confirm tests for:

- A project manager can assign and unassign a queued item to a project researcher.
- Assignment does not change the item's existing status.
- A manager cannot directly update `dataset_items.status`, even when they can assign the item.
- A manager cannot reassign an in-progress or submitted item through the ordinary assignment path.
- A researcher cannot directly update the parent item status.
- The assigned researcher can save a draft and submit through `save_dataset_annotation`; the parent state changes atomically.
- An unassigned researcher, a researcher assigned to another item, and an unrelated user cannot save or submit.
- The QA queue continues to show submitted annotations whose parent item is submitted, and excludes work that has already received a terminal review decision.
- Only an authorized independent reviewer can record a review; self-review remains denied.
- Review decisions and parent item transitions remain atomic.
- Curation and release reject an item without the corresponding accepted independent review, regardless of its parent status.
- Reassignment and resubmission preserve annotation revisions and prior review history.

## CI and staging gate

The existing integration suite can conditionally skip when staging variables or fixtures are absent. A green generic CI result is not evidence that these tests executed.

Before applying a migration to staging:
- establish a clean, reproducible migration baseline;
- verify the migration chain locally using supported tooling;
- create only synthetic staging identities and fixtures;
- configure the staging test workflow through an explicitly authorized secret-management path;
- make staging preflight fail when required fixtures are missing;
- report executed, passed, failed, and skipped test counts.

Do not copy production data into staging. Do not change production. No migration is proposed or applied by this document.
