# Data governance, model-training use, and dataset delivery

JinoX handles sensitive health research data. Governance is required at collection, annotation, release, and model-training stages; it is not a checkbox added at the end.

## Minimum data lifecycle

1. **Proposed:** project, customer, purpose, data sources, and intended outputs are documented.
2. **Authorized:** responsible institution, ethics determination, consent or other lawful basis, permitted use, retention, and access rules are recorded.
3. **Collected:** assets have pseudonymous identifiers, source provenance, modality, and collection metadata.
4. **Curated:** duplicate, corruption, completeness, eligibility, and de-identification checks are recorded.
5. **Annotated:** guideline and schema versions are attached to every annotation.
6. **Reviewed:** independent review, disagreement, and adjudication outcomes are retained.
7. **Released:** immutable version has a manifest, quality report, label dictionary, limitations, permitted use, and approval record.
8. **Used for model development:** dataset release and purpose are approved; splits, preprocessing, model runs, and evaluations are traceable.
9. **Retired or withdrawn:** access is revoked where required and downstream obligations are tracked.

## Collection and annotation controls

- Store originals in private buckets; do not make patient-derived assets public.
- Verify membership and authorization before issuing signed URLs or exports.
- Record source, collector, collection method, modality, timestamps, rights, consent/legal basis, and transformation lineage.
- Preserve original source records and traceable curator corrections.
- Attach explicit task, schema, and guideline versions to annotations.
- Keep annotator identity, reviewer identity, and adjudication decisions attributable.
- Separate workforce payment records from patient data and label content.
- Pseudonymization reduces direct identification but does not make health data anonymous.

## Dataset release gates

A dataset must not be described as ready for model training merely because its item count is non-zero. A release should require:
- documented legal basis and ethics authorization where applicable;
- data minimization and pseudonymization;
- rights to use each source and share it with the intended recipient;
- documented label schema and annotation guideline version;
- quality sampling and inter-annotator agreement appropriate to the task;
- unresolved disagreements below a documented threshold or adjudicated;
- leakage checks and train/validation/test split methodology where applicable;
- reproducible manifest, provenance, dataset version, and checksum;
- retention, withdrawal, and customer-use restrictions;
- named approver and audit event.

## Model-training use gates

Before a dataset is used for training, verify:
- the project approval and source rights explicitly permit model development for the intended purpose;
- consent, waiver, ethics determination, and data-sharing terms cover the proposed use;
- the selected immutable dataset release has passed required curation and QA gates;
- excluded, withdrawn, or restricted records are handled according to policy;
- split methodology prevents inappropriate patient-level or source-level leakage;
- preprocessing and transformations are documented and reproducible;
- model runs, artifacts, access, and evaluation outputs are traceable and protected;
- intended downstream use, especially clinical use, has a separate validation and regulatory pathway.

Training a model is not the same as validating it. Model performance on one dataset does not establish generalizability, clinical utility, or safety.

## Security rules

- Verify identity, project membership, purpose, and role before every sensitive operation.
- Never use a client-provided user ID as proof of identity.
- Never use profile metadata as the source of role authorization.
- Apply least privilege to database roles and storage policies.
- Treat signed URLs as bearer credentials; keep TTL short and do not log them.
- Keep audit logs free of direct identifiers, images, consent documents, and secrets.
- Test that one project member cannot read another project's records or assets.
- Handle withdrawal through a documented workflow covering source assets, annotations, derived assets, exports, and downstream model obligations.

## Commercial and workforce separation

Customer contracts, contributor payments, rates, qualification records, and workload belong in appropriately access-controlled operational records. They must not be mixed into annotation labels or used to influence scientific quality decisions. Restrict contributor identity and payment records to personnel who need them.

## Regional governance

Applicable Kenyan and East African privacy, research ethics, health-data, and data-transfer requirements must be assessed for each project by qualified local governance/legal stakeholders. Regional data access must be based on transparent, lawful partnerships and participant protections—not treated as unrestricted extraction.

## Important distinction

A governance record in the application is not itself proof of formal ethics approval or legal compliance. The project must verify supporting documents and operational controls. Product status labels must reflect verified evidence, not self-attestation alone.
