# Release concurrency validation

## Source-level guarantee

`create_dataset_release(uuid)` locks the dataset row, then locks every dataset item in stable ID order before selecting release eligibility. Annotation save and review operations lock the dataset item before touching its annotation. This establishes a shared item-level serialization point.

Expected outcomes:

- If a save or review obtains an item lock first, release creation waits; its later manifest query sees the committed workflow state.
- If release creation obtains the item lock first, the save or review waits; the release records the state that existed before that later write.
- Curation and release both use dataset -> item lock ordering. Annotation save and review use item -> annotation ordering.

The trade-off is that release creation briefly locks all items in the dataset, including items that will not be included. This favors correctness over maximum write concurrency during the relatively infrequent release operation.

## Required staging-only two-session test

Run only after migration-baseline reconciliation and with disposable synthetic fixtures.

1. Prepare one release-eligible item with an accepted latest annotation revision and one assigned researcher.
2. Session A starts a transaction that acquires the dataset-item row lock, then pauses before committing a new annotation revision or a changes-requested review.
3. Session B invokes `create_dataset_release(dataset_id)`.
4. Confirm Session B waits for Session A rather than creating a release from a stale snapshot.
5. Commit Session A. Confirm Session B completes and the manifest reflects the committed state: a newer draft must exclude the older accepted annotation; a current accepted revision may remain eligible.
6. Repeat with Session B acquiring the item lock first. Confirm Session A waits until release creation completes.

Do not use `pg_sleep` or persistent lock-holding sessions against production. Do not use patient data. Record both session outcomes and inspect the immutable release manifest and checksum.

## Limitations

This document specifies a manual concurrency test; it is not evidence that the database behavior has been executed. The migration has not been applied to staging or production.
