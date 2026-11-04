# JinoX AI — Engineering backlog

**Status:** Active backlog  
**Last reviewed:** 2026-11-04  
**Prioritization:** P0 = release/security blocker; P1 = core product capability; P2 = research expansion

This file tracks pending work only. Completed work is summarized at the end for traceability. Keep task status current and link each completed task to its pull request, test run, or other verification evidence.

## Working agreements

- Do not ingest real patient data until legal basis, ethics/consent, privacy, storage, access, and incident controls have been verified for the deployment.
- Use synthetic data and dedicated staging accounts for tests.
- A task is complete only when its acceptance criteria and verification evidence are satisfied.
- A CI integration test that skips due to missing credentials is not a successful authorization verification.
- Keep changes small, reviewable, and documented.

## P0 — Security and release readiness

### JX-001 — Dependency security remediation
**Status:** Pending  
**Milestone:** M1  
**Scope:** Run a fresh dependency audit, classify direct and transitive findings, upgrade Next.js to a currently supported patched release, review related React/ESLint/toolchain compatibility, and regenerate the lockfile.

**Acceptance criteria**
- No unresolved critical/high production dependency advisory without a documented accepted-risk decision and mitigation.
- Application builds and passes unit, integration, type, and lint checks after upgrades.
- Upgrade notes and breaking changes are documented.
- No blind `npm audit fix --force` or unreviewed major-version change.

### JX-002 — Environment configuration documentation and template
**Status:** Pending  
**Milestone:** M1  
**Scope:** Reconcile `.env.example`, Supabase client configuration, middleware, and README setup instructions.

**Acceptance criteria**
- Every required and optional variable is listed with purpose and whether it is server-only or browser-visible.
- Template comments match current code; obsolete mock-data/schema instructions are removed or clearly marked.
- Startup fails safely and provides actionable configuration errors.
- No real secret or production identifier is committed.

### JX-003 — Reproducible dependency installation in CI
**Status:** Pending  
**Milestone:** M1  
**Scope:** Verify `package.json` and `package-lock.json` are synchronized, then use `npm ci` in CI and local contributor guidance.

**Acceptance criteria**
- Clean install succeeds from a fresh checkout using the committed lockfile.
- CI and local documented commands use the same supported Node/npm assumptions.
- Dependency changes update the lockfile in the same PR.

### JX-004 — Staging migration and RLS verification
**Status:** Pending  
**Milestone:** M1  
**Scope:** Apply every migration in timestamp order to a dedicated staging Supabase project and verify table, function, trigger, RLS, grants, and Storage behavior.

**Acceptance criteria**
- Migration inventory and applied versions are recorded.
- Owner, principal investigator, researcher, reviewer, viewer, and unrelated-user access scenarios are tested with separate identities.
- Cross-project and cross-user read/write attempts are denied.
- Storage path ownership and signed URL expiry are verified.
- Production migrations remain blocked until staging evidence and recovery plan are reviewed.

### JX-005 — Secure file intake hardening
**Status:** Pending  
**Milestone:** M1  
**Scope:** Add server-side file signature/content inspection, malware scanning, safe archive handling, and a documented DICOM/medical-image de-identification strategy.

**Acceptance criteria**
- Server-side checks do not rely solely on filename, extension, MIME header, or browser validation.
- Unsupported, malformed, oversized, and malicious files are rejected safely.
- De-identification behavior is validated for DICOM metadata and image pixel annotations where applicable.
- Uploads are quarantined or rejected when inspection fails.
- Operational limitations are documented before real patient files are accepted.

### JX-006 — Browser-based smoke and critical-path tests
**Status:** Pending  
**Milestone:** M1  
**Scope:** Add automated browser checks for navigation, authentication, permission-denied states, data intake, dataset selection, annotation save/submit, and responsive layouts.

**Acceptance criteria**
- Critical paths run against a dedicated test deployment and synthetic data.
- Desktop and mobile viewport checks cover core navigation and forms.
- Loading, empty, error, expired-session, and restricted states are tested.
- Test reports are retained in CI or linked from the PR.

### JX-007 — Backup, restore, monitoring, and incident response
**Status:** Pending  
**Milestone:** M1  
**Scope:** Document and test database/storage backup, restore, monitoring, incident ownership, access revocation, and security-event response.

**Acceptance criteria**
- Recovery objectives and backup retention are agreed with the system owner.
- A staging restore exercise is completed and recorded.
- Alerts and escalation paths have named operational owners.
- Incident procedures cover credential exposure, unauthorized access, data disclosure, and deletion/withdrawal requests.

## P1 — Core research data operations

### JX-008 — Complete annotation assignment workflow
**Status:** Pending  
**Milestone:** M2  
**Scope:** Align assignment UI/API behavior with the project-scoped access model and migration policies.

**Acceptance criteria**
- Authorized managers can assign eligible items to qualified project researchers.
- Researchers see only their assigned work.
- Assignment changes are audited.
- Removed members and reassigned items lose access as intended.

### JX-009 — Independent review and adjudication
**Status:** Pending  
**Milestone:** M2  
**Scope:** Build reviewer queue, review decisions, change requests, disagreement tracking, and adjudication history.

**Acceptance criteria**
- Reviewer cannot review their own annotation.
- Submitted revisions are immutable to the annotator.
- Reviewer decisions require configured rationale.
- Disagreement and adjudication records preserve prior decisions.
- UI and database authorization enforce the same rules.

### JX-010 — Annotation guideline and schema versioning
**Status:** Pending  
**Milestone:** M2  
**Scope:** Attach stable schema and guideline versions to each annotation and review.

**Acceptance criteria**
- Every annotation references an explicit schema/guideline version.
- New versions do not silently reinterpret existing annotations.
- Version changes are documented and migration-safe.

### JX-011 — Intake quality and provenance controls
**Status:** Pending  
**Milestone:** M2  
**Scope:** Improve validation, duplicate detection, source lineage, missing metadata handling, and curator remediation.

**Acceptance criteria**
- Original source metadata and derived records are traceable.
- Duplicate detection behavior is deterministic and documented.
- Validation failures are actionable and do not discard valid user input.
- Curator corrections preserve the audit trail.

### JX-012 — Transactional audit coverage
**Status:** Pending  
**Milestone:** M2  
**Scope:** Review every security-relevant write path and ensure resource changes and required audit events are committed atomically.

**Acceptance criteria**
- Critical writes fail safely if required audit persistence fails.
- Tests prove rollback behavior.
- Audit records include actor, action, object, timestamp, and outcome without storing patient content or secrets.

## P1 — Dataset quality and controlled release

### JX-013 — Dataset quality framework
**Status:** Pending  
**Milestone:** M3  
**Scope:** Define quality checks, sampling plans, label distributions, missingness, duplicates, representation summaries, and inter-annotator agreement.

**Acceptance criteria**
- Every metric has a definition, denominator, scope, and reporting period.
- Quality checks are appropriate to each modality and task.
- Missing and unverified values are visible, not silently imputed.
- Quality reports describe known limitations and subgroup coverage.

### JX-014 — Governed dataset release and manifest
**Status:** Pending  
**Milestone:** M3  
**Scope:** Implement release gates, immutable versioning, manifests, checksums, label dictionaries, quality reports, limitations, and approval records.

**Acceptance criteria**
- Release is blocked when governance or quality requirements are incomplete.
- Every release is traceable to source assets, project, schema, and guideline versions.
- Manifest and checksums allow artifact integrity verification.
- Release approval and subsequent access/export are audited.

### JX-015 — Controlled dataset export
**Status:** Pending  
**Milestone:** M3  
**Scope:** Implement permissioned export generation, scoped access grants, expiry, audit logging, and withdrawal/retention handling.

**Acceptance criteria**
- Export authorization is enforced server-side.
- Export scope matches permitted use and recipient.
- Export events are auditable without exposing source content in logs.
- Expired/revoked access is denied and downstream obligations are documented.

### JX-016 — Privacy, retention, and ethics operationalization
**Status:** Pending  
**Milestone:** M1–M3  
**Scope:** Confirm project-specific legal basis, ethics determinations, consent/waiver evidence, data-sharing agreements, retention/deletion, withdrawal, and cross-border transfer controls.

**Acceptance criteria**
- A named institutional data steward and approval process exist for each real-data project.
- Policies are reviewed by qualified Kenyan privacy, research ethics, and regulatory stakeholders.
- Retention and withdrawal procedures cover source assets, derived data, exports, and downstream copies.
- Product policy text matches actual operational practices.

## P2 — Research interoperability and future capabilities

### JX-017 — Canonical data schemas and API documentation
**Status:** Pending  
**Milestone:** M4  
**Scope:** Document supported modality schemas, API contracts, error models, versioning, and examples; add machine-readable API specification where appropriate.

**Acceptance criteria**
- Supported and unsupported fields/formats are explicit.
- API documentation matches tested route behavior.
- Schema changes have compatibility and versioning guidance.

### JX-018 — Reproducible research experiment tracking
**Status:** Pending  
**Milestone:** M4  
**Scope:** Tie experiments to immutable dataset versions, code/config references, evaluation protocols, and reported metrics.

**Acceptance criteria**
- Results can be traced to exact dataset version and evaluation procedure.
- Metrics include confidence/uncertainty and subgroup definitions where appropriate.
- No caller-supplied metric is presented as independently validated.

### JX-019 — AI-assisted annotation research
**Status:** Future / gated  
**Milestone:** M5  
**Scope:** Explore pre-labeling only after human-reviewed reference datasets and evaluation criteria exist.

**Acceptance criteria**
- Model outputs are explicitly marked as suggestions.
- Human verification and correction provenance are preserved.
- Performance is evaluated on held-out, representative data.
- No automatic clinical decisions are made.

### JX-020 — Genomics, digital-twin, and clinical AI research
**Status:** Future / gated  
**Milestone:** M5  
**Scope:** Research pathways for genomic analysis, biological simulation, and clinical AI only under separate approved protocols and validated methods.

**Acceptance criteria**
- Dedicated ethics, consent, access, security, and data governance are approved.
- Scientific validity and reproducibility are independently reviewed.
- Clinical deployment requires separate safety, human-factors, and regulatory assessment.
- Marketing and UI language never imply unimplemented or unvalidated capabilities are available.

## Completed recently

- [x] Consolidated primary navigation and simplified workflow pages — [PR #39](https://github.com/eltonarunga/jinox-v1.0/pull/39).
- [x] Cleaned annotation/environment page lint issues, corrected effect dependencies, and improved private asset preview handling — [PR #40](https://github.com/eltonarunga/jinox-v1.0/pull/40).

## How to update this backlog

1. Give each new task a unique `JX-NNN` identifier.
2. Assign a milestone and priority.
3. State the current status: Pending, In progress, Blocked, or Future / gated.
4. Write testable acceptance criteria.
5. Link implementation PRs and verification evidence when complete.
6. Move completed work to the completed section rather than deleting its history.
