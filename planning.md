# JinoX AI — Product and engineering roadmap

**Status:** Active working roadmap  
**Last reviewed:** 2026-11-04  
**Product stage:** Early-stage AI data operations prototype

## 1. Product direction

JinoX AI is an AI data operations platform and managed data services business, inspired by the data-centric operating model of companies such as Scale AI. It will help customers and research teams convert raw domain data into reliable, traceable datasets and model-ready assets.

Initial specialization: oral and craniofacial health, with an East African research context.

The core lifecycle is:

**Customer/project onboarding → Data collection → Curation → Annotation → Independent QA → Dataset delivery → Model training and evaluation**

See [docs/product/operating-model.md](docs/product/operating-model.md) for the product thesis, roles, modules, target workflows, and commercial hypotheses.

This analogy refers to the operating model only. JinoX is not affiliated with Scale AI and does not claim equivalent scale or capabilities.

## 2. Product priorities

1. Build dependable data collection and dataset management.
2. Make annotation work assignable, measurable, auditable, and reviewable.
3. Establish independent QA, adjudication, and dataset quality gates.
4. Deliver reproducible, permissioned datasets to customers and research teams.
5. Add model training, experiment tracking, and evaluation on top of approved dataset versions.
6. Keep clinical AI, genomics, digital-twin, and other scientific extensions secondary and separately governed.

## 3. Product principles

- **Data operations first:** every major feature should support collection, curation, annotation, QA, delivery, or model development.
- **Quality over volume:** collection counts and throughput never substitute for accuracy, representativeness, provenance, or lawful use.
- **Human accountability:** expert labels and AI-assisted suggestions retain provenance and review history.
- **Privacy by design:** minimize sensitive data, keep assets private, and enforce access server-side and in the database.
- **Customer trust:** define scope, acceptance criteria, permitted use, delivery format, and auditability for each project.
- **Evidence before claims:** distinguish working code from a proposed workflow and validated research outcome.
- **Incremental architecture:** retain the modular monolith until measured requirements justify additional infrastructure.
- **Africa-first, not extractive:** build with regional institutions and participants through lawful, transparent partnerships.

## 4. Current implementation baseline

The repository contains:
- Next.js App Router application using React and TypeScript.
- Supabase Auth, PostgreSQL, RLS policies, and private Storage integration.
- Project and dataset metadata structures and API routes.
- Pseudonymous case and multimodal asset intake foundations.
- Structured clinical-record and environmental measurement capture.
- Dataset-item and annotation revision foundations.
- Profile/access-level and administration workflows.
- Case-linked record viewer and training-preparation page.
- Unit tests and staging-oriented authorization integration tests.
- GitHub Actions CI and Vercel deployment configuration.

### Important gaps

The repository does not yet provide a complete:
- Customer/organization onboarding and commercial project management system.
- Secure multi-channel collection and production-grade file inspection pipeline.
- Dataset curation/remediation queue and complete lifecycle.
- Workforce task orchestration and qualification system.
- Independent annotation review, disagreement resolution, adjudication, and quality analytics.
- Immutable dataset release, manifest, customer delivery, and controlled export process.
- Model training execution, experiment orchestration, model registry, or validated serving pipeline.

The current training page is preparation-only. The target model-development workflow is planned, not shipped.

## 5. Milestones

### M0 — Product direction and prototype baseline
**Status: Complete**

- Consolidated primary navigation and simplified existing workflow pages.
- Established clear prototype limitations.
- Documentation baseline and initial roadmap established.
- Supabase public configuration validation and tests improved.

**Evidence:** PRs #39, #40, #41, and #42 merged.

### M1 — Secure platform and collection foundation
**Status: In progress / next priority**

**Objective:** Make project onboarding, access, and data collection safe and dependable.

Scope:
- Resolve dependency security and lockfile consistency.
- Verify authentication, project membership, RLS, storage policies, and environment configuration.
- Implement robust server-side file validation, quarantine, and de-identification strategy.
- Define collection metadata, source provenance, modality schemas, and intake error handling.
- Add collection progress and curator remediation states.
- Establish backup, restore, monitoring, and incident response.

Exit criteria:
- Clean install, tests, type check, lint, and production build pass in CI.
- Cross-project and cross-user access tests pass in a dedicated staging environment.
- File validation is server-side and limitations are explicit.
- Collection records preserve source provenance and governance evidence.
- No real-data project proceeds without documented approvals and operational controls.

### M2 — Dataset curation and annotation operations
**Objective:** Make annotation work a managed, repeatable production workflow.

Scope:
- Complete dataset-item inventory, eligibility, and curation queues.
- Define task templates, label schemas, rubrics, guideline versions, and examples.
- Implement work-unit creation, assignment, reassignment, and workload tracking.
- Build focused annotation workspaces for supported modalities.
- Preserve drafts, submissions, revisions, and annotator provenance.
- Add qualification and access controls for annotators and domain experts.

Exit criteria:
- Managers can assign eligible items within an authorized project.
- Annotators see only assigned work and applicable guideline versions.
- Submitted revisions are immutable and traceable.
- Assignment changes and curator actions are audited.
- Core workflows have automated and browser-based tests.

### M3 — Quality assurance and dataset delivery
**Objective:** Produce reliable, auditable datasets that meet defined customer and research requirements.

Scope:
- Implement independent review and self-review prevention.
- Add sampling, reference/gold items where appropriate, disagreement, and adjudication workflows.
- Measure agreement with defined metrics and denominators.
- Add modality-specific quality reports and dataset readiness gates.
- Implement immutable dataset versions, manifests, checksums, schema/guideline references, and limitations.
- Build permissioned customer exports, access expiry, delivery records, and withdrawal handling.

Exit criteria:
- QA decisions and disagreements are preserved and attributable.
- Dataset release is blocked until governance and quality requirements pass.
- Delivered artifacts are reproducible from manifests.
- Export permissions and audit events are verified.
- Customer acceptance criteria can be evaluated against recorded evidence.

### M4 — Model training and evaluation workflows
**Objective:** Turn approved dataset releases into reproducible model-development inputs and evaluation outputs.

Scope:
- Define training/validation/test split workflows and patient-level leakage controls.
- Record dataset versions, preprocessing, code/configuration, compute environment, model version, and experiment parameters.
- Add training orchestration appropriate to measured workload and budget.
- Add model evaluation, benchmark sets, subgroup analysis, and experiment comparison.
- Establish model artifact registry and access controls.
- Keep training and evaluation outputs distinct from validated clinical claims.

Exit criteria:
- Each experiment is reproducible from a specific dataset release and configuration.
- Split logic and leakage checks are documented and tested.
- Metrics include task definitions, cohorts, uncertainty, and limitations.
- Model artifacts and outputs have access, lineage, and retention controls.
- No clinical deployment without separate validation and regulatory review.

### M5 — Scale operations and domain expansion
**Objective:** Expand capacity and adjacent capabilities only after the core data operation is reliable.

Scope:
- Evaluate workforce management, contributor qualification, workload, and compensation operations.
- Add customer usage, project reporting, billing integration, and service-level reporting where validated by customer demand.
- Improve APIs, partner integrations, and low-bandwidth collection workflows.
- Explore AI-assisted annotation with human verification.
- Consider adjacent health/scientific domains only with dedicated partners and governance.

Exit criteria:
- Operational capacity and quality are measurable.
- Customer contracts, data rights, workforce terms, and service obligations are supported by real operating procedures.
- New domains have distinct schema, quality, ethics, and validation plans.

### M6 — Advanced scientific research (gated)
**Objective:** Explore multimodal foundation models, genomics, simulation, and clinical AI only after the data foundation is credible.

Exit criteria:
- Approved research protocols and data-use rights.
- Representative, quality-controlled datasets.
- Independent scientific and safety review.
- Appropriate clinical, human-factors, and regulatory assessment before deployment.

## 6. Commercial validation workstream

The following are hypotheses to test, not established revenue or pricing:
- Managed collection, curation, annotation, QA, and dataset-delivery projects.
- Usage-based pricing for accepted annotation work units, adjusted for modality and complexity.
- Platform subscriptions for project, dataset, workforce, QA, and governance workflows.
- Dataset preparation, model training support, benchmarking, and evaluation services.
- Long-term institutional and enterprise data-operations partnerships.

Validate willingness to pay, procurement cycles, service costs, data rights, workforce supply, and delivery quality before committing to a pricing model.

## 7. Delivery and change control

- Keep each PR focused on one domain or operational invariant.
- Do not combine major framework upgrades, database redesign, and workflow refactors.
- Apply and verify migrations in staging before production.
- Use synthetic data and separate test identities.
- Require tests for both permitted and denied access.
- Update product, architecture, and operational documentation with code changes.
- Do not mark a milestone complete without evidence from tests, staging, and user workflow verification.

The actionable backlog is maintained in [tasks.md](tasks.md).
