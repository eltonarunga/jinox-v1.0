# JinoX AI — Product and engineering plan

**Status:** Active working roadmap  
**Last reviewed:** 2026-11-04  
**Planning horizon:** Milestone-based; calendar dates are intentionally not committed  
**Product stage:** Research-data operations prototype

## 1. Purpose

This plan defines the sequence for turning the current JinoX prototype into a reliable, secure, and scientifically useful oral-health research data platform.

It separates three things that must not be conflated:

- **Current implementation:** capabilities present in the repository.
- **Near-term product delivery:** engineering work required to make core data operations dependable.
- **Long-term research vision:** foundation models, genomic research, biological simulation, and low-resource clinical tools that require independent evidence and governance.

The active engineering backlog is maintained in [tasks.md](tasks.md). This document describes milestones, dependencies, and completion gates.

## 2. Product direction

JinoX is being built as data infrastructure for East African oral and craniofacial research. The first product objective is to help authorized research teams manage projects, collect and curate research data, prepare annotations, review quality, and eventually release controlled, reproducible datasets.

### Product principles

1. **Data quality before model scale.** Build provenance, authorization, representativeness, annotation quality, and reproducible releases before training large models.
2. **Human accountability.** Research labels and any future AI-assisted outputs must retain provenance and appropriate human review.
3. **Privacy by design.** Minimize sensitive data, keep source assets private, and enforce access on the server and database.
4. **Evidence before claims.** A prototype screen, database row, successful upload, or non-empty dataset is not proof of scientific validity.
5. **Incremental architecture.** Keep the current Next.js/Supabase modular monolith until measured requirements justify more infrastructure.
6. **Africa-first research context.** Build for local data realities, institutional partnerships, connectivity constraints, and responsible cross-border research.

## 3. Current baseline

The repository currently contains:

- Next.js App Router application using React and TypeScript.
- Supabase Auth, PostgreSQL, RLS policies, and private Storage integration.
- Research project and dataset metadata structures and API routes.
- Pseudonymous case and multimodal asset intake workflows.
- Structured clinical-record and environmental measurement capture.
- Annotation item and revision workflows.
- Profile/access-level and administration workflows.
- Genetics research-protocol metadata.
- A case-linked record viewer and training-preparation page.
- Unit tests and staging-oriented authorization integration tests.
- GitHub Actions CI and Vercel deployment configuration.

### Known product boundaries

The current product does **not** provide:

- Validated autonomous diagnosis, triage, or treatment recommendations.
- A production-grade independent review and adjudication workflow end to end.
- Immutable, governed dataset releases and controlled reproducible exports.
- A model-training execution engine, model registry, or validated model-serving pipeline.
- Raw genomic analysis or individual genetic-risk prediction.
- 3D reconstruction or a biological digital-twin simulator.
- Validated county-level environmental disease-risk predictions.

The standalone Research workspace has been removed from primary navigation; research API routes remain in the repository. Refer to the implementation notes before using those endpoints.

## 4. Milestones

### M0 — Product scope and prototype baseline

**Status: Complete**

**Objective:** Establish a coherent, honest product boundary and a minimal workflow-oriented application.

**Delivered baseline:**
- Primary navigation consolidated around the current user workflows.
- Overview and workflow pages simplified.
- Training page describes preparation rather than claiming model execution.
- Case records are described as linked records rather than a biological simulation.
- Tools hub separates optional clinical, environmental, genetics, and administration pages.
- Annotation/environment page maintenance cleanup merged.

**Acceptance evidence:** PR #39 and PR #40 merged into the main branch.

### M1 — Security, dependency, and operational baseline

**Status: Next priority**

**Objective:** Make the existing prototype safer to maintain, test, deploy, and operate.

**Scope:**
- Review and remediate current dependency advisories; move to a supported Next.js release and verify compatible dependencies.
- Reconcile `package.json` and `package-lock.json`; move CI to reproducible clean installs when safe.
- Correct and document environment-variable configuration.
- Verify all database migrations in timestamp order on a dedicated staging Supabase project.
- Exercise project, dataset, case, annotation, and storage authorization using separate synthetic identities.
- Add browser-based smoke and critical-path tests.
- Review upload validation, server-side file inspection, malware scanning, and de-identification gaps.
- Define backup/restore, monitoring, incident response, and release controls.

**Exit criteria:**
- No unresolved critical/high dependency advisory without an explicit accepted-risk record and mitigation.
- Clean dependency installation, type check, lint, unit tests, staging integration tests, and production build pass in CI.
- Staging authorization tests demonstrate cross-user and cross-project isolation.
- Private Storage access and signed URL expiry are verified.
- Upload security limitations are either addressed or explicitly block real clinical-data ingestion.
- Deployment and recovery procedures are documented and tested.

### M2 — Reliable core data operations

**Objective:** Make project, dataset, intake, and annotation workflows consistent and permission-safe.

**Scope:**
- Align UI actions with server-side authorization and database policies.
- Complete dataset-item assignment and assignment visibility.
- Implement independent reviewer workflow and prevent self-review at every layer.
- Add change-request, disagreement, and adjudication history.
- Version annotation guidelines and label schemas.
- Improve intake validation, duplicate handling, provenance, and remediation queues.
- Ensure status transitions are explicit, auditable, and recoverable.

**Exit criteria:**
- Owner, principal investigator, researcher, reviewer, viewer, and unrelated-user scenarios are covered in staging.
- Annotators can only access authorized assigned work.
- Submitted work cannot be silently edited; revisions remain traceable.
- Reviewers cannot review their own submissions.
- Disagreements and adjudication decisions are preserved.
- Critical workflows have automated tests and browser verification.

### M3 — Dataset quality and governed release

**Objective:** Establish a reproducible process for determining whether a dataset is fit for a defined research use.

**Scope:**
- Define modality-specific quality checks and sampling procedures.
- Track completeness, duplicates, label distributions, missingness, and provenance coverage.
- Add inter-annotator agreement with documented metric, denominator, and sample definition.
- Record unresolved disagreements and adjudication outcomes.
- Implement release gates for ethics/legal basis, source rights, consent/waiver, permitted use, retention, and access terms.
- Generate immutable dataset versions, manifests, checksums, label dictionaries, quality reports, and limitations.
- Implement controlled exports and audit events.

**Exit criteria:**
- A release cannot proceed when required governance or quality gates are incomplete.
- Each release has a stable version, manifest, provenance, schema/guideline version, quality report, and limitations.
- Export authorization is enforced server-side and audited.
- A released artifact can be reproduced and verified from its manifest.
- Withdrawal and downstream obligations are documented.

### M4 — Research interoperability and reproducibility

**Objective:** Make curated datasets easier to inspect, reuse, and analyze without overstating clinical readiness.

**Scope:**
- Document canonical schemas for image, radiographic, clinical, environmental, and other approved modalities.
- Publish machine-readable dataset documentation and schema versions.
- Add controlled research APIs and export formats.
- Record experiment metadata, dataset version, code/configuration references, and evaluation protocols.
- Add research dashboards only when measures have clear definitions and real source data.
- Evaluate low-bandwidth and offline workflows based on partner requirements.

**Exit criteria:**
- Researchers can identify the provenance, schema, access conditions, and limitations of each approved release.
- Experiments can be traced to exact dataset versions and evaluation protocols.
- API access is permissioned, rate-limited, documented, and auditable.

### M5 — Validated research AI and scientific extensions

**Objective:** Develop research models and computational methods only after data, governance, and evaluation foundations are dependable.

**Potential workstreams:**
- Human-reviewed AI-assisted annotation and pre-labeling.
- Multimodal representation learning and model benchmarking.
- Environmental/oral-health association studies.
- Genomic research under dedicated consent, ethics, access, and computational controls.
- Tooth, periodontal, microbiome, or other biological simulation research.
- Low-resource model optimization and deployment studies.

**Mandatory gates:**
- Approved research protocol and data-use rights.
- Documented training/evaluation datasets with provenance and leakage controls.
- Pre-specified evaluation, calibration, subgroup analysis, and uncertainty reporting.
- Independent scientific review and reproducibility.
- Clinical safety, human factors, regulatory, and deployment review before any clinical use.
- No model output is presented as validated clinical advice without the required evidence and authorization.

## 5. Dependencies and sequencing

The intended dependency chain is:

```text
M0 Product baseline
       |
       v
M1 Security and operational baseline
       |
       v
M2 Reliable data operations
       |
       v
M3 Quality and governed releases
       |
       v
M4 Research interoperability
       |
       v
M5 Validated research AI
```

Some work can proceed in parallel, but model development must not bypass data authorization, quality, and evaluation gates.

## 6. Proposal targets — strategic context only

The accompanying Google.org AI for Science proposal draft describes an aspirational 18-month impact horizon and targets including 50,000+ records, 6–10 publications, 50+ facilities, 100,000 patients screened, 200+ research institutions, and environmental mapping across 20+ counties. These are **proposal targets**, not current platform metrics, funded commitments, validated forecasts, or acceptance criteria for this software roadmap.

Any use of these targets in external materials must be checked against the approved proposal, available funding, partner capacity, ethics approvals, and a defensible measurement plan. Model performance targets such as AUC must be defined for a specific task and dataset before they are meaningful.

## 7. Delivery and change control

- Milestones are outcome-based; no calendar dates are implied until owners, dependencies, resourcing, and partner commitments are confirmed.
- Each task in [tasks.md](tasks.md) should have a clear owner, priority, acceptance criteria, and verification evidence before implementation starts.
- Deliver work in focused pull requests. Avoid combining framework upgrades, database redesigns, and broad UI refactors in one PR.
- Do not apply production migrations without reviewed SQL, staging verification, backup/rollback planning, and explicit release approval.
- Update this plan when milestone scope or dependencies change.
- Mark a milestone complete only when its exit criteria are met and evidence is linked.

## 8. Related documents

- [Repository overview](README.md)
- [Documentation index](docs/README.md)
- [Architecture](docs/architecture/README.md)
- [Data governance](docs/architecture/data-governance.md)
- [Active tasks](tasks.md)
