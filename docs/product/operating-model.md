# JinoX AI — Product and operating model

**Status:** Active product direction  
**Last reviewed:** 2026-11-04  
**Audience:** Product, engineering, data operations, research partners, and commercial stakeholders

## 1. Product thesis

JinoX AI is an AI data operations platform and managed data services business, inspired by the data-centric operating model used by companies such as Scale AI.

The core business is to help organizations turn raw, fragmented, domain-specific data into reliable datasets and model-ready assets through an end-to-end workflow:

**Collect → Curate → Annotate → Review / QA → Package and deliver → Prepare, train, and evaluate models**

The initial domain specialization is oral and craniofacial health, with an East African data and research context. The platform should be designed so the same data-operations capabilities can later support adjacent health and scientific domains, subject to separate governance and validation.

JinoX is not primarily a clinical app, a research dashboard, or a digital-twin product. Its primary value is the operational infrastructure and expert workflows required to produce high-quality data for AI development.


## 1A. Lead positioning and relationship to the research proposal

JinoX's current product and commercial lead story is an **AI data operations platform and managed data services business**, initially focused on oral and craniofacial health. The core customer value is governed collection, curation, annotation, independent quality workflows, and reproducible dataset packaging and delivery. Model preparation, training, and evaluation are downstream services or extensions, not prerequisites for describing the data-operations product.

The broader foundational-model, digital-twin, genomics, climate-health, and low-resource diagnostic ambitions described in the Google.org AI for Science proposal are a **research programme direction**, not the current product capability or a claim of implementation. They depend on lawful data access, completed governance controls, research partnerships, scientific feasibility, and separate validation. External materials should preserve this distinction: the operating platform is the near-term product; the research programme describes possible future applications of the data foundation.

## 2. What the Scale AI analogy means for JinoX

The relevant analogy is the business and operating model, not a claim of affiliation or feature parity.

JinoX should combine:

1. **A data operations platform:** customer/project workspaces, secure intake, dataset management, task orchestration, annotation tools, quality control, and delivery.
2. **Human-in-the-loop services:** domain-trained annotators, clinical subject-matter experts, independent reviewers, and adjudicators working under documented guidelines.
3. **Data quality and evaluation:** measurable quality gates, reviewer agreement, benchmark sets, model evaluation, and traceable feedback loops.
4. **Model development support:** curated training datasets, dataset versioning, experiment tracking, training orchestration, and evaluation workflows.
5. **Enterprise and institutional delivery:** scoped projects, access controls, service-level expectations, auditability, and customer-specific data governance.

JinoX should not copy another company's proprietary systems, workflows, branding, or claims. It should build a differentiated operation around oral-health expertise, regional data realities, responsible health-data stewardship, and research-grade provenance.

## 3. Primary operating lifecycle

### Stage 1 — Customer and project onboarding

- Register an organization/customer and its authorized users.
- Define the project objective, data domain, intended model/task, deliverables, and acceptance criteria.
- Agree data ownership, permitted use, retention, security, ethics/consent basis, and any cross-border processing requirements.
- Define roles, annotation scope, quality thresholds, delivery format, and commercial terms.
- Keep projects blocked from real-data intake until required approvals and controls are verified.

### Stage 2 — Dataset collection and intake

- Collect data through secure uploads, structured forms, APIs, approved partner integrations, and documented field-collection workflows.
- Support domain-relevant modalities such as clinical records, dental images, radiographs, scans, structured labels, and approved contextual/environmental data.
- Register source, provenance, collection method, modality, rights, consent/legal basis, and permitted purpose.
- Validate file signatures, schema, metadata, duplicates, completeness, and de-identification status.
- Quarantine invalid or unreviewed assets and provide actionable remediation queues.
- Track collection targets and coverage without confusing volume with quality.

### Stage 3 — Dataset curation

- Normalize supported formats and metadata.
- Resolve duplicates, missing values, corrupted files, inconsistent identifiers, and out-of-scope records.
- Apply project-specific inclusion and exclusion criteria.
- Preserve source lineage and every curator change.
- Produce a curated dataset candidate with a clear quality and readiness report.

### Stage 4 — Annotation task design and execution

- Define task types, label taxonomies, schemas, rubrics, guidelines, examples, and uncertainty rules.
- Break datasets into assignable work units.
- Assign work to appropriately trained annotators and domain experts.
- Provide focused image, record, text, or multimodal annotation workspaces as appropriate.
- Save drafts, record submissions, preserve revisions, and capture annotator provenance.
- Track throughput as an operational metric, never as a substitute for quality.

### Stage 5 — Quality assurance and adjudication

- Use independent review and risk-based sampling.
- Prevent self-review where independent review is required.
- Measure agreement with an explicitly defined metric and sample.
- Record disagreements, corrections, reviewer rationale, adjudication outcomes, and guideline changes.
- Maintain gold/reference items where appropriate and approved.
- Gate dataset delivery on customer-defined and scientifically defensible quality thresholds.

### Stage 6 — Dataset packaging and delivery

- Generate versioned datasets with manifests, checksums, schema and guideline versions, provenance summaries, quality reports, and known limitations.
- Support permissioned exports and customer-specific delivery formats.
- Record approvals, recipients, access, export, expiry, and withdrawal obligations.
- Ensure each delivered dataset is reproducible and traceable to authorized source material.

### Stage 7 — Model preparation, training, and evaluation

- Convert approved dataset versions into training, validation, and test inputs using documented split rules.
- Detect leakage, duplicates across splits, and inappropriate patient-level overlap.
- Track dataset version, code, configuration, compute environment, model version, evaluation protocol, and metrics.
- Support training orchestration and model evaluation as the product matures.
- Keep model outputs and generated labels distinguishable from human ground truth.
- Require appropriate clinical, scientific, security, and regulatory review before any clinical deployment.

**Current implementation boundary:** the repository currently has a training-preparation surface, not a complete training execution engine, experiment orchestration system, model registry, or validated model-serving pipeline. The lifecycle above is the target operating model. Each stage must be marked as implemented, partial, or planned in the product and technical documentation.

## 4. Core product modules

The long-term information architecture should be organized around the operating lifecycle:

| Module | Primary responsibility |
| --- | --- |
| Organizations & projects | Customer onboarding, project scope, membership, governance, and contracts metadata |
| Data collection | Secure uploads, imports, structured capture, provenance, and collection progress |
| Dataset management | Dataset registry, item inventory, curation, versioning, and lifecycle status |
| Annotation operations | Task design, assignment, annotation workspace, guidelines, and workforce queues |
| Quality assurance | Independent review, sampling, adjudication, agreement, and quality reporting |
| Dataset delivery | Release gates, manifests, exports, access grants, and delivery history |
| Model development | Dataset splits, experiment tracking, training orchestration, model evaluation, and registry |
| Workforce operations | Annotator onboarding, qualification, availability, workload, and performance governance |
| Administration & governance | Identity, permissions, audit, security, privacy, retention, and compliance evidence |

Workforce operations and commercial administration must be separated from patient-derived data and annotation content. Compensation, contracts, and contributor identity must not influence labels or scientific quality scores.

## 5. Users and operating roles

- **Customer / project owner:** defines deliverables, authorized use, acceptance criteria, and project access.
- **Project manager:** coordinates collection, curation, task assignment, timelines, and delivery.
- **Data curator:** validates, normalizes, and prepares source data.
- **Annotator:** completes assigned labels under a versioned guideline.
- **Clinical/domain expert:** contributes specialized interpretation within a defined scope and credential-verification process.
- **Independent reviewer:** checks submitted annotations and records review outcomes.
- **Adjudicator / quality lead:** resolves disagreements and monitors quality thresholds.
- **ML engineer / researcher:** prepares splits, runs experiments, evaluates models, and documents reproducibility.
- **Data steward / security or ethics lead:** oversees permitted use, retention, privacy, access, and governance.

A user may hold multiple roles across different projects, but authorization must be explicit, project-scoped, and enforced server-side and in the database.

## 6. Business model hypotheses

These are commercial hypotheses to validate with customers, not current revenue streams or committed pricing.

- **Managed data projects:** fixed-scope or milestone-based collection, curation, annotation, QA, and dataset delivery.
- **Usage-based annotation services:** pricing based on task type, modality, complexity, review depth, and accepted work units.
- **Platform subscription:** recurring access to project, dataset, task, QA, governance, and delivery workflows.
- **Model-development services:** paid dataset preparation, training support, benchmarking, and evaluation.
- **Long-term enterprise/institutional partnerships:** ongoing data operations with agreed governance, capacity, support, and service levels.

Pricing should reflect complexity, expertise, quality requirements, data sensitivity, review effort, and delivery obligations—not just raw item count. Do not launch a contributor marketplace or promise turnaround/quality service levels until workforce vetting, operational capacity, contracts, and QA are demonstrably in place.

## 7. Differentiation and strategic focus

JinoX's initial advantage should come from:

- Domain-specific oral and craniofacial health data workflows.
- Access to regional research and clinical expertise through lawful, transparent partnerships.
- Collection workflows designed for East African institutions and connectivity constraints.
- Strong provenance, consent/rights tracking, and health-data governance.
- Annotation taxonomies and quality processes designed with qualified domain experts.
- High-quality, representative datasets that can support reproducible research and model development.

Regional data access must never be treated as unrestricted data extraction. Every project needs a lawful basis, ethics review where applicable, participant protections, permitted-use scope, and transparent institutional agreements.

## 8. Product principles and metrics

Prioritize:
- Collection completeness and provenance coverage.
- Curation rejection and remediation rates.
- Annotation accuracy against approved reference sets.
- Independent-review agreement and adjudication rates.
- Reviewer turnaround and unresolved-work backlog.
- Dataset coverage and representation gaps.
- Dataset release reproducibility and export audit completeness.
- Model evaluation validity, leakage controls, and subgroup performance where appropriate.
- Customer delivery acceptance and repeat engagement.

Do not optimize solely for records per hour, annotation speed, or headline dataset size. Throughput is useful only when paired with quality, fairness, lawful use, and traceability.

## 9. Current state versus target state

| Capability | Current repository state | Target direction |
| --- | --- | --- |
| Projects and access | Project and membership structures exist; deployment and policy behavior require verification | Customer/project workspaces with governed onboarding |
| Data collection | Existing case, asset, and structured intake flows | Multi-channel secure collection with collection operations and progress tracking |
| Dataset management | Dataset metadata and item structures exist | Full lifecycle, curation queues, versions, manifests, and delivery |
| Annotation | Annotation records and revision foundations exist | Task design, workforce assignment, rich annotation tools, and scalable queues |
| Quality assurance | Some review/access foundations and tests exist; complete experience remains unfinished | Independent QA, sampling, adjudication, gold sets, and quality analytics |
| Dataset delivery | Governance principles and partial structures exist | Reproducible, permissioned customer delivery and export |
| Model training | Training-preparation UI only | Training orchestration, experiment tracking, evaluation, and model registry |
| Workforce operations | Not a complete workforce management system | Qualification, assignment, workload, compensation, and performance operations |
| Commercial operations | Not established as a complete customer billing/contract system | Project scoping, contracts, usage, billing, and service reporting |

## 10. What JinoX is not claiming

- No claim of affiliation with Scale AI.
- No claim of matching another provider's scale, customer base, or capabilities.
- No claim that the current application already implements every target workflow above.
- No claim that any dataset is clinically representative, validated, or suitable for training until measured and approved.
- No claim that a model trained on JinoX data is safe or suitable for clinical use without independent evaluation and relevant authorization.

## 11. Product decision rule

When prioritizing features, ask:

1. Does this improve collection, curation, annotation, QA, dataset delivery, or model development?
2. Does it make data more reliable, traceable, secure, or useful to a customer/research team?
3. Can its permissions, quality criteria, and acceptance conditions be tested?
4. Does it fit the current architecture without unnecessary complexity?
5. Is the capability actually implemented, or is it clearly labelled as planned?

If a feature does not support the core data-operations lifecycle or a necessary governance/security control, it is secondary until the core business is operational.
