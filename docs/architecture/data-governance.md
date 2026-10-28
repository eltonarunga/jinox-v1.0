# Dataset governance and release controls

JinoX handles sensitive health research data. Governance is a release gate, not a text field added after collection.

## Minimum lifecycle

1. **Proposed:** project and data purpose are documented.
2. **Authorized:** responsible institution, ethics determination, consent/legal basis, permitted uses, retention and access rules are recorded.
3. **Collected:** assets have pseudonymous identifiers, source provenance and collection metadata.
4. **Curated:** duplicate, corruption, completeness and eligibility checks are recorded.
5. **Annotated:** guideline and schema versions are attached to every annotation.
6. **Reviewed:** independent review, disagreement and adjudication outcomes are retained.
7. **Released:** an immutable version has a manifest, quality report, label dictionary, limitations, permitted use and approval record.
8. **Retired or withdrawn:** access is revoked where required, and downstream obligations are tracked.

## Release gates

A dataset must not be described as ready for model training merely because its item count is non-zero. A release should require:
- documented legal basis and ethics authorization where applicable;
- data minimization and pseudonymization;
- rights to use each source and to share it with the intended recipient;
- a documented label schema and annotation guideline version;
- quality sampling and inter-annotator agreement appropriate to the task;
- unresolved disagreements below a documented threshold or adjudicated;
- leakage checks and train/validation/test split methodology where applicable;
- reproducible manifest, provenance, dataset version and checksum;
- retention, withdrawal and customer-use restrictions;
- named approver and audit event.

## Security rules

- Store originals in private buckets; no public bucket for patient-derived assets.
- Verify membership and authorization before issuing signed URLs or exports.
- Signed URLs are bearer credentials; keep their TTL short and do not log them.
- Never use a client-provided user ID as proof of identity.
- Never use profile metadata as the source of role authorization.
- Apply least privilege to database roles and storage policies.
- Keep audit logs free of direct identifiers, images, consent documents and secrets.
- Test that one project member cannot read another project's records or assets.
- Handle consent withdrawal through a documented workflow that assesses existing annotations, derived assets and previously released datasets.

## Commercial separation

Customer contracts, worker payments and task rates belong in operational/commercial records, not annotation labels. Keep contributor identity and payment records separated from pseudonymous research records, with access limited to staff who need them.

## Important distinction

Pseudonymization reduces direct identification but does not make health data anonymous. Applicable Kenyan and East African privacy, research ethics and data-transfer requirements must be assessed for each project by qualified local governance/legal stakeholders.
