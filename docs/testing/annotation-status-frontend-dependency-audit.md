# Annotation status: frontend and database dependency audit

## Scope and evidence

This audit reads the current source files on `main`. It does not query the deployed staging or production database. It does not establish which migrations have been applied. No database or secrets were changed.

Files inspected:
- `app/annotate/page.tsx`
- `app/quality/page.tsx`
- `app/datasets/[datasetId]/page.tsx`
- `supabase/migrations/20261028205400_annotation_assignment_access.sql`
- `supabase/migrations/20261104000000_operational_annotation_workflow.sql`
- `supabase/migrations/20261107000000_dataset_curation_releases.sql`
- `tests/integration/research-access.test.mjs`

## Confirmed status dependencies

### Task assignment writes status directly

In `app/annotate/page.tsx`, `assignItem` updates both `assigned_to` and `status: "queued"` in one direct table update. The assignment action must be changed if authenticated users lose direct status-update permission.

A minimal frontend adjustment to update only `assigned_to` is not a complete workflow design until reassignment semantics are decided. In particular, the intended behavior for reassigning an item that is already `in_progress` or `submitted` must be explicit. Resetting workflow status should be a separate authorized transition, not an incidental side effect of assignment.

### Annotation submission writes parent item status

In `supabase/migrations/20261104000000_operational_annotation_workflow.sql`, `save_dataset_annotation` is `SECURITY INVOKER`. It writes the annotation's own status and then updates `dataset_items.status` to `submitted` or `in_progress`.

A blanket revocation of authenticated status updates would therefore break annotation save/submit unless this function's authorization and transition design is changed at the same time.

### QA queue depends on parent item status

In `app/quality/page.tsx`, the QA queue loads `dataset_items` with `status = 'submitted'`, then loads submitted annotations for those items. It therefore depends on the parent item status being kept synchronized with annotation submission.

If submission state moves to the annotation row alone, QA queue selection must be changed to derive pending review work from submitted annotations and their review history. The query must avoid showing annotations already reviewed or superseded.

### Review RPC checks both states

The `review_dataset_annotation` function currently requires both `dataset_annotations.status = 'submitted'` and `dataset_items.status = 'submitted'`. It inserts an independent `annotation_reviews` row and transitions the parent item to `accepted`, `rejected`, or `in_progress`.

Any design that stops using parent status as the submission marker must revise this precondition and retain the reviewer authorization, self-review denial, row locking, independent review record, and atomic transition behavior.

### Curation and release use independent review evidence

The curation and release functions check for an accepted latest review record on a submitted annotation, alongside item status, asset approval, checksum, case consent and curation state. Keep the independent review record as the authoritative QA evidence; do not replace it with a mutable status value.

## Recommended coordinated design

Before writing a migration, decide and document the state model:

1. **Assignment:** direct authenticated writes may update `assigned_to` only. Assignment must not silently reset workflow status. If assignment needs to cause a state transition, expose a narrowly authorized function with explicit role and transition checks.
2. **Annotation:** `dataset_annotations.status` is the authoritative draft/submitted state. Saving and submitting must validate the assigned researcher and project role.
3. **QA queue:** derive pending review tasks from submitted annotations with no terminal/latest review decision, not from an independently mutable parent status.
4. **Review:** the authorized review function records the independent review and performs the allowed parent-item transition atomically.
5. **Curation/release:** require the corresponding accepted review record, and ensure the selected annotation/review pair is the one represented in the release manifest.
6. **History:** define what happens to submitted annotations and review history when an item is reassigned or resubmitted. Do not overwrite prior review evidence.

## Required tests before staging rollout

- Manager can assign and unassign an item without direct status privileges.
- Assignment does not silently reset an existing workflow state.
- Researcher can save a draft and submit while assigned.
- Unassigned or unrelated researcher cannot save or submit.
- Submitted annotation appears in QA queue even without relying on mutable parent status.
- Already-reviewed, superseded, or self-authored work is not incorrectly offered for review.
- Reviewer can record a decision; researcher and unrelated user cannot.
- Direct manager/researcher status updates are denied.
- Curation and release require the relevant independent accepted review.
- Reassignment/resubmission preserves a coherent, auditable history.

## CI and staging distinction

The integration test suite can skip when required staging environment variables and fixtures are absent. A passing generic CI run is not sufficient evidence that these role and workflow assertions executed. Staging verification must report executed test counts and fail preflight when required fixtures are missing.

No migration is proposed or applied by this document. Production remains out of scope.
