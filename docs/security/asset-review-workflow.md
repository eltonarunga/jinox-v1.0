# Privileged asset review workflow

## Purpose

Uploaded assets enter `pending_review`. This workflow provides a global-administrator review queue and a one-time decision to approve, reject, or quarantine an asset. Project annotation reviewer permissions do not grant asset-approval authority.

## Database enforcement

Apply `20261106000000_asset_review_workflow.sql` to a dedicated Supabase staging project first.

- `clinical_asset_reviews` is an append-only audit table. Authenticated users may read it only when their global profile role is `admin`; authenticated clients receive no insert, update, or delete grants.
- `review_clinical_asset` is the only authenticated review write path. It verifies the global admin role, prevents uploader self-review, locks the pending asset row, requires a reason for rejection or quarantine, writes the audit row, and changes the asset state in one transaction.
- The existing intake trigger permits an update only when the same transaction contains a matching audit row authored by the same non-owner administrator. Asset identity, storage path, filename, modality, MIME, size, checksum, and metadata remain immutable during review.
- Admin-only Storage SELECT access is limited to the private `jinox-clinical-assets` bucket and supports short-lived signed review links.

## Application

Open `/admin/assets-review` using a global administrator account. The page lists up to 100 pending assets, filters by modality, creates five-minute signed links, captures rationale, and displays the latest 25 audit decisions.

## Validation

Configure synthetic staging users and four distinct pending asset fixtures in `.env.example`:

- approve, reject, quarantine and concurrency fixture IDs;
- a global admin JWT, non-admin JWT and uploader JWT.

Run:

```bash
npm run test:integration
npm run type-check
npm run lint
npm run build
```

The integration tests are skipped unless all review fixtures are configured. A skipped test is not evidence that staging authorization works. The concurrency fixture is consumed by the test and must be reset to a new pending synthetic asset before another run.

## Limitations

The workflow is a human governance gate, not file-safety validation. It does not implement malware scanning, binary content sniffing, archive inspection, DICOM metadata de-identification, image-pixel redaction, or automated consent verification. Do not treat approval as proof that those controls have occurred.
