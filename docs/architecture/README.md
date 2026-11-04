# JinoX AI — Platform architecture

**Document status:** Living architecture guide  
**Product stage:** AI data operations prototype  
**Last reviewed:** 2026-11-04  
**Product source of truth:** [Operating model](../product/operating-model.md)

## 1. Architecture purpose

JinoX is being built as an AI data operations platform and managed data services system. Its primary workflow is secure data collection, curation, annotation, independent quality assurance, dataset delivery, and model training/evaluation.

Initial domain: oral and craniofacial health, with an East African research context.

The current implementation is an early-stage Next.js/Supabase modular monolith. The architecture must support the target operating model incrementally without implying that every target service is already implemented.

## 2. Current implementation versus target capability

| Domain | Current repository foundation | Target capability / gap |
| --- | --- | --- |
| Organization/project | Project metadata, membership, access structures | Customer onboarding, scoped deliverables, commercial project operations |
| Collection | Case metadata, asset upload, structured intake | Secure multi-channel collection, batch tracking, robust inspection, quarantine, remediation |
| Dataset management | Dataset metadata and item structures | Full curation queues, lifecycle state machine, immutable versions, manifests |
| Annotation | Annotation records and revision foundations | Task templates, work-unit orchestration, qualified workforce, modality-specific tools |
| QA | Some reviewer/access policy foundations | Independent review, sampling, adjudication, agreement, gold/reference workflows |
| Delivery | Governance and export design foundations | Customer-scoped release, reproducible packaging, controlled export, delivery tracking |
| Model development | Training-preparation UI | Dataset splits, training orchestration, experiment tracking, evaluation, model registry |
| Workforce | User roles/access foundations | Qualification, capacity, workload, compensation, contributor operations |
| Governance | Auth, RLS, audit and private-storage foundations | Verified operational controls, privacy/ethics evidence, retention, incident response |

The standalone Research workspace was retired from primary navigation. Legacy research APIs and data structures may remain; their existence does not prove a complete user-facing or production-ready workflow.

## 3. Logical architecture

The target logical flow is:

**Customer/project → Collection/intake → Validation/curation → Dataset registry → Annotation task orchestration → Annotators/domain experts → Independent QA/adjudication → Quality gates and versioning → Dataset delivery**

Approved dataset versions can then feed:

**Dataset splits → Model training/experiments → Evaluation → Model artifact registry**

Identity, permissions, governance, and audit apply across every stage. This is a target logical architecture, not a statement that each component is a separate deployed service. The current implementation is a modular monolith.

## 4. Recommended domain boundaries

1. **Organization and project management:** customer/institution metadata, scope, membership, project status, deliverables.
2. **Identity and access:** authenticated identity, project roles, qualification metadata, permission checks.
3. **Collection and intake:** collection batches, source metadata, modalities, uploads/imports, validation, quarantine, provenance.
4. **Dataset management:** dataset definitions, item inventory, curation status, inclusion/exclusion, versions.
5. **Annotation operations:** task templates, schemas, guidelines, work units, assignments, drafts, submissions, revisions.
6. **Quality assurance:** independent review, sampling, reference items, disagreement, adjudication, agreement and quality reporting.
7. **Dataset delivery:** release gates, manifests, checksums, export grants, recipient scope, delivery history.
8. **Model development:** approved dataset selection, splits, preprocessing, training jobs, experiment tracking, evaluation, model artifacts.
9. **Workforce operations:** onboarding, qualification, availability, workload, compensation and operational performance.
10. **Governance and audit:** legal basis, ethics/consent evidence, permitted use, retention, withdrawal, access, export, and change history.

Keep contributor commercial records separate from patient-derived content and annotation decisions.

## 5. Technology and deployment

- **Web application:** Next.js App Router, React, TypeScript.
- **Presentation:** Tailwind CSS and shared accessible components.
- **Authentication:** Supabase Auth.
- **Relational data:** Supabase PostgreSQL with Row Level Security.
- **Object storage:** private Supabase Storage and short-lived signed URLs.
- **Hosting:** Vercel.
- **Source control and CI:** GitHub and GitHub Actions.

Keep a modular monolith until measured scale, workload, isolation, or reliability requirements justify queues, separate workers, storage services, or model-training infrastructure. Training compute should be isolated from the interactive web request lifecycle when it is implemented.

## 6. Security invariants

- Patient-linked records and source assets remain private by default.
- UI visibility is not authorization. Verify identity, project membership, role, purpose, and object access on the server and in RLS.
- Never authorize using user-editable profile metadata.
- Keep service-role credentials server-only; never expose them through browser modules or NEXT_PUBLIC variables.
- Issue short-lived signed URLs only after authorization.
- Preserve source provenance, curator changes, annotation revisions, review decisions, and dataset versions.
- Independent review must not be performed by the original annotator when independence is required.
- Dataset export and model-training access must be permissioned, purpose-limited, and audited.
- Only use data for model training when the relevant rights, consent/legal basis, ethics approvals, and project terms explicitly permit it.
- Keep training artifacts, logs, and evaluation reports free of unnecessary patient identifiers.
- Pseudonymized health data must not be described as anonymous without a defensible formal determination.
- Do not place real patient data, tokens, signed URLs, or source files in tests, screenshots, analytics, or logs.

See [data governance](data-governance.md), [annotation assignment and access](annotation-assignment-access.md), and [authorization testing](../testing/research-authorization.md).

## 7. Engineering standards

### Application boundaries
- Keep route handlers thin: parse input, authenticate, authorize, validate, call domain logic, and map errors to stable HTTP responses.
- Centralize domain rules and validation.
- Keep browser and server Supabase clients separate.
- Use explicit TypeScript types for persisted records and API payloads.
- Never trust client-provided owner IDs, role names, file paths, task status, or workflow transitions.

### Database changes
- Every schema change is a timestamped migration committed to source control.
- Review RLS policies, grants, triggers, and security-definer functions with every migration.
- Apply migrations first to dedicated staging and verify expected behavior.
- A committed migration is not proof that a remote database has applied it.
- Include rollback or forward-recovery notes for persisted-data changes.

### Workflow state and lineage
- Model collection, curation, annotation, review, release, and training as explicit state transitions.
- Validate transitions server-side and enforce them in the database where appropriate.
- Preserve actor, timestamp, source version, and reason for consequential changes.
- Do not let a status badge substitute for evidence of completed work.

### Testing
- Unit-test validation and domain rules.
- Integration-test authentication, RLS, project isolation, storage access, assignment, review, export, and training access with separate synthetic users.
- Add browser coverage for collection, curation, annotation, review, release, and model-development flows as those capabilities ship.
- Test loading, empty, error, permission-denied, expired-session, and network-failure states.
- A skipped integration suite is not a passing authorization assessment.

### Dependency and release management
- Keep package manifests and lockfiles synchronized.
- Prefer reproducible clean installs in CI.
- Review advisories and breaking changes before upgrades.
- Require CI and preview checks before merging.
- Record migration and deployment requirements in each release PR.

## 8. Delivery sequence

See [planning.md](../../planning.md) and [tasks.md](../../tasks.md).

1. Security and collection foundation.
2. Dataset curation and annotation task operations.
3. Independent QA, dataset quality, versioning, and delivery.
4. Reproducible model training and evaluation.
5. Workforce/commercial operations and capacity.
6. Advanced scientific AI under separate evidence and governance gates.

## 9. Architecture decision rules

- Prefer the smallest implementation that satisfies a documented user, customer, and security requirement.
- Do not introduce infrastructure for speculative scale.
- Do not combine major framework upgrades, schema redesigns, and workflow refactors.
- Do not silently change API contracts or persisted data semantics.
- Treat health, genomic, and other sensitive data processing as high-risk changes requiring explicit review.
- Keep product copy aligned with shipped behavior.

## 10. Change control

Update this guide when changes affect domain boundaries, data lifecycle, authorization, storage, model-development topology, or operational responsibilities. Significant decisions should record context, alternatives, consequences, and migration plans in an ADR or PR description.
