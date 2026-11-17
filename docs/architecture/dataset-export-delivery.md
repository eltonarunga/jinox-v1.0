# Dataset export and controlled delivery architecture

**Status:** Proposed design; not implemented  
**Decision scope:** Turn the existing immutable metadata release into a reproducible, permissioned dataset package and delivery workflow.  
**Applies to:** JX-014, JX-015, JX-016, with prerequisites in JX-004, JX-005, JX-006, JX-013 and JX-017.

## 1. Current implementation and verified gap

The current release workflow is an immutable *eligibility manifest*, not a dataset export.

The `create_dataset_release(p_dataset_id)` RPC:
- selects items whose latest curation decision is `include`;
- requires accepted dataset items, approved assets, a non-null recorded asset checksum, open cases and consent status `obtained` or `ethics_waiver`;
- records internal item, asset and annotation IDs, modality, the recorded asset checksum and annotation schema version;
- hashes the JSON manifest and writes an append-only `dataset_releases` row.

It deliberately does not include annotation labels, source files, storage paths, data dictionaries or delivery artifacts. The dataset detail page accurately states that clinical-file exports, annotation-label packages and external delivery controls are not implemented.

The intake schema has a private `jinox-clinical-assets` bucket and stores an asset checksum, but the inspected intake trigger validates storage-object size and MIME metadata; it does not itself recompute SHA-256 over the stored bytes, inspect file signatures, scan for malware or de-identify DICOM. MIME metadata is not proof of file content. The current release therefore must not be represented as a verified export-ready package.

## 2. Design principles

1. **A release is a frozen dataset definition.** A delivery is a separate, permissioned event against that release.
2. **Never expose source storage paths or permanent public URLs.** Source and export buckets remain private.
3. **Verify bytes, not just metadata.** Recompute SHA-256 from the object bytes during packaging and compare it with the approved source checksum.
4. **Fail closed.** Missing rights evidence, failed validation, unknown file type, missing checksum, withdrawn consent, inaccessible object or incomplete QA blocks export.
5. **Preserve reproducibility.** A release must pin exact source assets, annotation revisions, schema/guideline versions and provenance used to build it.
6. **Keep audit and delivery separate.** Creating an export, issuing access, completing a download, revoking access and handling a withdrawal are distinct events.
7. **Do not put patient-identifying content in manifests, filenames, logs or error messages.**
8. **Human governance remains authoritative.** A successful export does not certify clinical validity, representativeness or fitness for a particular model.

## 3. Proposed logical components

### A. Immutable release membership

Add a relational release-membership record for each item, with references to the exact dataset item, approved clinical asset, accepted annotation revision and relevant schema/guideline version. Use restrictive foreign-key behavior so referenced source records cannot silently disappear while a release depends on them.

The existing JSON manifest can remain the portable, hashed summary, but it should be generated from the pinned membership records. It should include stable internal identifiers, modality, verified source checksum, annotation/schema versions, and a provenance summary. Keep labels and source content out of this governance manifest.

Before sealing a release, validate that each referenced object still exists and that the source checksum has been verified against its bytes. Define how a correction, consent withdrawal or source deletion affects already-sealed releases; never silently rewrite a release.

### B. Export job and artifact

Create a server-controlled export job tied to one immutable release. A job should record:
- requesting user and project;
- release ID and requested package format;
- approved purpose / permitted-use scope;
- idempotency key;
- state and timestamps;
- safe failure code (not raw patient data or storage details).

Suggested states: `queued`, `building`, `ready`, `failed`, `revoked`, `expired`.

Store the completed package in a separate private export bucket. Persist the artifact's storage key, media type, byte size, SHA-256, creation time and expiry. Do not let browser clients write job or artifact state directly.

For a first bounded release, package only formats that can be safely validated and delivered within the deployed worker's execution and memory limits. Reject oversized jobs explicitly; do not silently truncate. Move large or long-running exports to a durable background worker/queue when demand and hosting constraints justify it.

### C. Package contents

A versioned ZIP package may contain:
- source files for the approved release membership;
- annotation labels for the exact accepted revision;
- a machine-readable record index mapping pseudonymous record IDs to files and labels;
- a data dictionary and schema/guideline versions;
- provenance and quality summaries with denominators;
- a README describing scope, permitted use, limitations and known exclusions;
- a manifest containing per-file checksums and a package-level checksum.

Use deterministic paths and generated pseudonymous filenames. Do not include original filenames, case codes, direct identifiers, free-text clinical notes or signed URLs by default. Any inclusion of free text or potentially identifying fields requires a separate privacy review and explicit field-level allowlist.

### D. Server-side authorization and delivery

All job creation and artifact access must pass through server-side authorization. Check the authenticated identity, project membership/role, release scope, approved recipient or partner, purpose, rights basis and current withdrawal/revocation state on every request.

For external delivery, create an explicit delivery grant with recipient, permitted-use scope, expiry and revocation state. Do not infer external customer access from ordinary project membership.

A short-lived signed URL can be a delivery mechanism, but logging its issuance does not prove the file was downloaded. If verified receipt is required, use an authenticated download proxy or single-use download ticket and record the completed transfer. In either design, record access issuance and revocation in an append-only delivery event log.

### E. Revocation, withdrawal and retention

Revocation must prevent future access to the artifact and invalidate outstanding grants as far as the chosen delivery mechanism permits. On consent withdrawal or rights change, block new exports, assess affected releases and recipients, record the decision, and support required downstream notification/deletion workflows.

A previously downloaded copy cannot be technically recalled by JinoX. This limitation must be explicit in customer agreements and delivery receipts. Retention and deletion schedules must be defined per project and legal basis; immutable audit history should avoid retaining unnecessary clinical content.

## 4. Mandatory export gates

An export job must fail closed unless all applicable checks pass:

- the requester is authorized for the project and release;
- the release is sealed and its manifest hash verifies;
- the source asset remains approved and is still within the release's permitted scope;
- consent/legal basis, license, ethics determination and permitted use cover the requested export and recipient;
- withdrawal, restriction, retention and deletion state have been checked;
- the exact annotation revision is submitted and independently accepted;
- file bytes are available and their recomputed SHA-256 matches the pinned source checksum;
- file signature/content inspection, malware scanning and modality-specific validation have passed;
- required de-identification has passed, including DICOM metadata and applicable image/pixel-level review;
- the package index, per-file checksums and package checksum are generated and verified;
- export size, format and execution limits are satisfied.

A stored MIME type, filename extension, non-null checksum field or client-supplied hash is not sufficient evidence for these gates.

## 5. Security boundaries

- Keep both source and export buckets private with RLS/storage policies denying anonymous access.
- Do not use a generic service-role client in browser code. Any privileged worker must have narrowly scoped credentials, server-only execution and auditable inputs/outputs.
- Avoid broad `SECURITY DEFINER` RPCs for file delivery. If a privileged function is unavoidable, restrict execute grants, pin `search_path`, validate `auth.uid()` and project scope in the function, and test every role boundary.
- Do not accept a client-supplied storage path as authority. Resolve objects from pinned database references.
- Protect against path traversal, archive bombs, malformed archives, duplicate entries, oversized files and decompression/resource exhaustion.
- Never place signed URLs, tokens, patient content or raw storage errors in logs.
- Verify cross-project isolation, unauthorized recipient denial, expiry, revocation and concurrent access in staging.

## 6. Recommended implementation sequence

1. Complete staging authorization/RLS/storage verification (JX-004), using dedicated synthetic identities and fixtures. A skipped integration suite is not verification.
2. Complete secure intake controls (JX-005) and provenance/withdrawal handling (JX-006/JX-017), including server-side content inspection, malware scanning and validated de-identification.
3. Define a versioned release-membership schema and tests that prove exact annotation revision pinning, referential retention, checksum verification and release reproducibility.
4. Implement a server-only, bounded export worker and private artifact storage. Start with one or two supported formats; reject unsupported modalities rather than passing through unvalidated files.
5. Implement project/partner delivery grants, expiry, revocation, append-only events and download receipts.
6. Run staging adversarial tests for cross-project access, path manipulation, forged MIME/hash metadata, malformed files, withdrawal, expiry, revocation, duplicate requests, worker retries and concurrent exports.
7. Only after evidence is reviewed, consider production rollout through the normal migration and deployment process.

## 7. Explicit non-goals for the first release

- Public or anonymous dataset downloads.
- Direct browser access to source bucket paths.
- Arbitrary SQL/query-based exports.
- Automatic export of DICOM/CBCT archives before validated de-identification.
- Training or inference triggered by an export.
- Claims that exported data is clinically validated or representative.
- A microservice, Kubernetes or separate data warehouse architecture.

## 8. Decision

Adopt a two-stage model: **immutable governed release → separately authorized export job → private artifact → time-limited delivery grant**.

Do not implement export endpoints or add production migrations until the staging authorization fixtures are available and the intake, checksum and de-identification gates can be tested. The existing metadata release remains useful as a governance snapshot, but it is not a deliverable dataset.
