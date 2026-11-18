# JinoX AI — Product and engineering backlog

**Status:** Active backlog  
**Last reviewed:** 2026-11-18  
**Prioritization:** P0 = security/release blocker; P1 = core data operations; P2 = model development and scale; P3 = gated research expansion

This backlog is organized around JinoX's AI data operations business: collect, curate, annotate, quality-check, deliver datasets, then support model training and evaluation. See [the product operating model](docs/product/operating-model.md) and [roadmap](planning.md).

## Working agreements

- Do not ingest real patient data until legal basis, ethics/consent, privacy, storage, access, and incident controls are verified for the project.
- Use synthetic data and dedicated staging accounts for tests.
- A task is complete only when acceptance criteria and verification evidence are satisfied.
- A skipped integration suite is not successful authorization verification.
- Keep customer data, contributor identity/payments, and annotation judgments appropriately separated.
- Keep changes small, reviewable, and documented.

## P0 — Security and platform foundation

### JX-001 — Dependency security remediation
**Status:** In progress — partial remediation merged · **Milestone:** M1  
The dependency baseline has been upgraded and the lockfile is reproducible. PR #58 moved the application to Next.js 15.5.29 and restored npm ci; PR #62 updated the TypeScript ESLint toolchain; PR #63 patched PostCSS, postcss-selector-parser, and source-map-js.

The latest audit on 2026-11-17 reports 18 high-severity vulnerable package entries and no critical, moderate, or low entries. These are not 18 independent advisories: the audit dependency graph traces them through a shared transitive `picomatch` ReDoS advisory, GHSA-fc5q-39xc-vjpf (CVSS 7.5), affecting `picomatch` versions through 4.0.7. The vulnerable path reaches tooling packages including `tinyglobby`, `micromatch`, `fast-glob`, `anymatch`, `chokidar`, Tailwind CSS, and the TypeScript ESLint dependency chain. The affected package entries are in the development/tooling dependency graph; this audit alone does not establish exploitability in the deployed application. The current npm report offers major-version migration suggestions (notably Tailwind CSS 4) rather than a verified compatible `picomatch` patch. Do not force a major Tailwind/Next.js migration or override to an unverified fork merely to make npm audit green. Recheck the upstream advisory and package releases on each scheduled audit.

**Acceptance:** No unresolved critical/high production advisory without accepted-risk mitigation; clean build and all checks pass; upgrade notes documented; no blind force-upgrade. Remaining tooling advisory is explicitly tracked, reviewed, and rechecked until an upstream patch is available.

### JX-002 — Environment configuration and startup validation
**Status:** In progress / verify after PR #42 · **Milestone:** M1  
Reconcile environment template, Supabase clients, middleware, and startup behavior.

**Acceptance:** Every variable has purpose and exposure classification; browser and server secrets are separated; configuration errors are actionable; no secrets committed.

### JX-003 — Reproducible dependency installation
**Status:** Complete · **Milestone:** M1  
CI installs from the committed lockfile using `npm ci`. The lockfile was regenerated through npm in GitHub Actions and committed with the dependency updates.

**Verification:** PR #58 and subsequent CI runs on PRs #62–#64 passed dependency installation, unit tests, type checking, lint, and application build. Staging authorization integration coverage remains separately unverified where required credentials/fixtures are unavailable.

**Acceptance:** Clean install succeeds from lockfile; CI and contributor Node/npm versions align; dependency changes update lockfile in the same PR.

### JX-004 — Staging authentication, RLS, and storage verification
**Status:** Pending · **Milestone:** M1  
Apply migrations in order and test project, dataset, case, annotation, and storage access with separate synthetic identities.

**Acceptance:** Cross-user/project access is denied; role scenarios are verified; signed URL expiry and storage paths are tested; applied migration inventory is recorded.

### JX-005 — Secure collection and file intake
**Status:** Pending · **Milestone:** M1  
Implement server-side file signature/content inspection, malware scanning, quarantine, safe archive handling, and a documented DICOM/medical-image de-identification approach.

**Acceptance:** Checks do not rely only on browser/MIME/extension; malformed, oversized, and malicious files are rejected; de-identification is validated; real-data limitations are explicit.

### JX-006 — Collection provenance and intake remediation
**Status:** Pending · **Milestone:** M1  
Standardize source, modality, collection method, rights, consent/legal basis, timestamps, and provenance; add actionable intake errors and curator remediation.

**Acceptance:** Every accepted asset has required provenance; corrections preserve history; missing or invalid metadata is visible; no silent data loss.

### JX-007 — Backup, restore, monitoring, and incident response
**Status:** Pending · **Milestone:** M1  
Define and test recovery, monitoring, access revocation, incident ownership, and retention.

**Acceptance:** Recovery objectives agreed; staging restore recorded; escalation owners identified; procedures cover unauthorized access, disclosure, credential exposure, and withdrawal.

## P1 — Dataset curation and annotation operations

### JX-008 — Dataset curation workbench
**Status:** Pending · **Milestone:** M2  
Build item inventory, inclusion/exclusion rules, duplicate detection, missing-data checks, validation status, and curator remediation queues.

**Acceptance:** Curators can filter and resolve issues; source data remains traceable; changes are audited; quality flags have defined meanings.

### JX-009 — Annotation task templates and guideline versioning
**Status:** Pending · **Milestone:** M2  
Define task types, label schemas, rubrics, guideline versions, examples, uncertainty rules, and modality-specific input requirements.

**Acceptance:** Every annotation references exact schema/guideline versions; changes do not silently reinterpret historical labels; task definitions are testable and documented.

### JX-010 — Annotation assignment and workload operations
**Status:** Pending · **Milestone:** M2  
Complete work-unit creation, assignment, reassignment, eligibility, and workload views for authorized project managers.

**Acceptance:** Only eligible users receive tasks; annotators see assigned work only; assignment changes are audited; revoked members lose access.

### JX-011 — Annotation workspace and revision history
**Status:** Pending · **Milestone:** M2  
Deliver focused annotation interfaces for supported modalities with draft/save/submit states, keyboard/accessibility support, and immutable submitted revisions.

**Acceptance:** User input is preserved safely; submissions retain actor and timestamp; revisions are traceable; permission boundaries are tested.

### JX-012 — Independent QA, review, and adjudication
**Status:** Pending · **Milestone:** M3  
Build reviewer queues, independent review, sampling, disagreement, change requests, adjudication, and quality reporting.

**Acceptance:** Self-review is blocked in UI and database; reviewer rationale is captured; disagreement history is retained; agreement metrics define method, denominator, and sample.

### JX-013 — Operational audit coverage
**Status:** Pending · **Milestone:** M2–M3  
Make critical collection, curation, assignment, annotation, review, release, and export events attributable and reliable.

**Acceptance:** Required audit writes are atomic with critical resource changes; tests prove rollback; logs exclude patient content and secrets.

## P1 — Dataset quality, packaging, and customer delivery

### JX-014 — Dataset readiness and quality framework
**Status:** Pending · **Milestone:** M3  
Define modality/task-specific completeness, duplicates, label distribution, missingness, representativeness, provenance coverage, and QA checks.

**Acceptance:** Metrics have definitions and denominators; unverified values remain visible; reports include limitations and coverage gaps.

### JX-015 — Versioned dataset release and manifest
**Status:** In progress — immutable eligibility manifest implemented; export-grade release controls remain pending · **Milestone:** M3  
The current release RPC creates a hashed, append-only eligibility manifest. It does not yet pin a relational release-membership record for exact annotation revisions, verify source bytes against stored checksums, or include the full quality/provenance approval package. See [dataset export and controlled delivery architecture](docs/architecture/dataset-export-delivery.md) (PR #69) for the proposed design.

**Acceptance:** Release blocked when governance or quality gates fail; artifacts are reproducible; every release is traceable and audited.

### JX-016 — Permissioned dataset delivery and export
**Status:** Pending — architecture documented; implementation blocked on JX-004, JX-005, JX-006 and JX-017 · **Milestone:** M3  
Implement customer/partner-scoped exports, delivery formats, access expiry, audit, and withdrawal/retention handling. Do not expose files until byte-level integrity, malware/content validation, de-identification, permitted-use checks and staging authorization are verified.

**Acceptance:** Server-side authorization; scope matches permitted use; delivery events are auditable; revoked/expired access is denied.

### JX-017 — Privacy, ethics, and data-use governance
**Status:** Pending · **Milestone:** M1–M3  
Operationalize project-specific ethics determination, consent/waiver, lawful basis, data-sharing terms, retention, deletion, withdrawal, and cross-border transfer controls.

**Acceptance:** Named data steward and approval process per real-data project; qualified local review; source and downstream obligations documented; product copy matches actual controls.

## P2 — Model development and operational scale

### JX-018 — Reproducible dataset splits and leakage controls
**Status:** Pending · **Milestone:** M4  
Create versioned training/validation/test split workflows appropriate to the task, including patient-level separation where required.

**Acceptance:** Split logic is documented and deterministic; leakage checks are tested; split artifacts are tied to immutable dataset versions.

### JX-019 — Model training orchestration and experiment tracking
**Status:** Future / gated · **Milestone:** M4  
Add training execution only after governed dataset releases exist; track code, configuration, compute environment, dataset version, model version, and run metadata.

**Acceptance:** Experiments can be reproduced; compute access and artifacts are permissioned; failures and resource use are recorded; no clinical readiness is implied.

### JX-020 — Model evaluation and registry
**Status:** Future / gated · **Milestone:** M4  
Add benchmark evaluation, subgroup analysis, model artifact registry, versioning, and controlled access.

**Acceptance:** Evaluation protocol and cohorts are explicit; metrics include uncertainty and limitations; outputs are traceable; deployment remains separately gated.

### JX-021 — Workforce qualification and operations
**Status:** Future / validate demand · **Milestone:** M5  
Explore annotator onboarding, qualification, training, availability, workload, reviewer capacity, and contributor operations.

**Acceptance:** Role qualification is verified; workload and quality are measured fairly; contributor identity/payment data is segregated from clinical records and labels; capacity assumptions are validated.

### JX-022 — Customer project and commercial operations
**Status:** Future / validate demand · **Milestone:** M5  
Explore scoped proposals, acceptance criteria, service reporting, usage measurement, contracts, billing integration, and customer support.

**Acceptance:** Commercial terms align with data rights and service capacity; pricing reflects complexity and QA; no unsupported service-level promises.

## P3 — Gated research extensions

### JX-023 — AI-assisted annotation
**Status:** Future / gated · **Milestone:** M6  
Explore model suggestions only after representative human-reviewed reference datasets and evaluation criteria exist.

**Acceptance:** Suggestions are clearly marked; human verification and provenance are preserved; held-out performance is measured; no autonomous clinical decision.

### JX-024 — Advanced scientific AI, genomics, and simulation
**Status:** Future / gated · **Milestone:** M6  
Research additional scientific capabilities only under separate approved protocols and validated methods.

**Acceptance:** Dedicated ethics, consent, access, and security review; independent scientific and safety evaluation; regulatory assessment before clinical deployment.

## Completed recently

- [x] Consolidated primary navigation and simplified workflow pages — [PR #39](https://github.com/eltonarunga/jinox-v1.0/pull/39).
- [x] Cleaned annotation/environment page lint issues, corrected effect dependencies, and improved private asset preview handling — [PR #40](https://github.com/eltonarunga/jinox-v1.0/pull/40).
- [x] Hardened public Supabase URL validation, added unit tests, and corrected environment template guidance — [PR #42](https://github.com/eltonarunga/jinox-v1.0/pull/42).
- [x] Hardened GitHub Actions permissions/concurrency and moved CI to reproducible npm ci installs — [PRs #54–#58](https://github.com/eltonarunga/jinox-v1.0/pulls?q=is%3Apr+is%3Amerged).
- [x] Removed the generic service-role client from the public screening write path — [PR #57](https://github.com/eltonarunga/jinox-v1.0/pull/57).
- [x] Removed unverified seeded-data fallbacks and documented data-governance requirements — [PR #60](https://github.com/eltonarunga/jinox-v1.0/pull/60).
- [x] Added scheduled dependency auditing and retained machine-readable plus human-readable audit artifacts — [PR #61](https://github.com/eltonarunga/jinox-v1.0/pull/61).
- [x] Updated the TypeScript ESLint dependency chain — [PR #62](https://github.com/eltonarunga/jinox-v1.0/pull/62).
- [x] Patched PostCSS, postcss-selector-parser, and source-map-js dependencies without a Tailwind/Next.js major migration — [PR #63](https://github.com/eltonarunga/jinox-v1.0/pull/63).
- [x] Documented the controlled dataset export architecture, explicitly distinguishing metadata releases from actual export packages — [PR #69](https://github.com/eltonarunga/jinox-v1.0/pull/69).

## Backlog maintenance

Give every task a unique ID, milestone, status, testable acceptance criteria, and verification link. Move completed tasks to the completed section with evidence rather than deleting history.
