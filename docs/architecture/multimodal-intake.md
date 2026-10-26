# JinoX AI multimodal intake: implementation notes

## Implemented in this change

- `/data`: pseudonymous case creation, modality-specific file checks, private Storage upload, asset metadata registration, structured clinical observation entry, and browser-side validation of clinical/environmental CSV and JSON.
- `/environment`: structured environmental measurements with controlled water-source values, unit-aware numeric bounds, date checks and source attribution.
- `/diagnostics`: clinician-entered assessment documentation. This is not an AI diagnostic engine; the interface explicitly says inference is not connected.
- `/twin`: case-linked longitudinal record combining source asset metadata and dated observations. No 3D reconstruction or biological simulation is implemented.
- `/genetics`: research-protocol metadata only. Raw genomic file intake and individual risk prediction are intentionally disabled.
- `/clinical`: entry point to the above workspaces.
- Shared Supabase browser client and upload/structured-record validation helpers.
- CSV templates and JSON Schema documents for supported structured imports.

## Data flow

1. An authenticated user creates a case with a pseudonymous code, county, age band, purpose and documented consent basis.
2. The user selects a modality and explicitly reconfirms consent coverage for each upload batch.
3. Client checks extension, size and structured CSV/JSON shape. A generated filename is used to avoid storing the original filename, which might contain identifiers.
4. Files are uploaded to the private `jinox-clinical-assets` bucket under `<user-id>/<case-id>/...`.
5. Asset metadata is registered in `clinical_assets` with `pending_review` status.
6. Structured observations and environmental measurements are saved to their own RLS-protected tables.

## Security model

- All new application tables enable RLS.
- Case, observation, asset, assessment and environmental rows are scoped to the authenticated owner; child-row policies also check ownership of the linked case.
- Storage object policies check both the authenticated user path prefix and ownership of the case path segment.
- Bucket is private, size-limited to 100 MiB, and restricted to the supported MIME list.
- No service-role key is shipped to the browser.
- Genomics protocol rows force `individual_risk_prediction_enabled = false`.
- Upload validation currently runs in the browser. Bucket MIME restrictions and RLS are additional controls, but they are not a replacement for server-side file-content inspection and malware scanning.

## Apply and verify migrations

Migrations are additive and must be reviewed before production application:

1. `20261027003000_multimodal_data_intake.sql`
2. `20261027004000_clinical_assessment_genetics.sql`
3. `20261027005000_restrict_clinical_upload_mime_types.sql`

After applying them in a non-production Supabase project, verify:
- authenticated user A can create and read their own cases, assets, observations and environmental rows;
- user A cannot read, update or delete user B's rows;
- Storage uploads and reads fail when the path does not match an owned case;
- representative JPEG/PNG/WebP, DICOM, ZIP, STL/PLY/OBJ, CSV and JSON files behave as expected under bucket MIME rules;
- oversized and unsupported uploads are rejected;
- schema constraints reject invalid case codes, categories, units and numeric ranges.

Run Supabase security/performance advisors after migrations and resolve findings before production use.

## Known gaps / next milestones

- Server-side file signature inspection, malware scanning, DICOM metadata de-identification and image pixel de-identification.
- Background processing for large DICOM studies and 3D scan meshes.
- Row-level CSV/JSON import into clinical observations and environmental measurements; current workflow validates then stores the source file.
- A trusted reviewer workflow and immutable server-side audit events.
- Institutional roles and credential verification; clinician role attestation in this prototype is self-declared.
- Validated diagnostic inference endpoint, model registry, calibration and subgroup evaluation.
- 3D tooth/arch reconstruction and scientifically validated digital-twin simulations.
- Genomic governance, secure raw data pipeline, population-specific validation and externally validated genetic risk models.
- Automated tests for schema validation, RLS isolation, storage policy enforcement and clinical workflow permissions.

## Clinical safety

Do not treat a successful upload, a stored clinical impression or a research protocol as an AI-generated diagnosis. The current product does not provide autonomous diagnosis, treatment recommendations or triage. Only validated and appropriately approved models should be made available for clinician-facing decision support.
