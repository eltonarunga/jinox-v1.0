# JinoX AI — Product and UX specification

**Status:** Active product design direction  
**Last reviewed:** 2026-11-04  
**Source of truth:** [Product operating model](docs/product/operating-model.md)

## 1. Product north star

JinoX AI is an AI data operations platform and managed data services business, inspired by the data-centric operating model of companies such as Scale AI. It helps customers and research teams turn raw oral and craniofacial health data into reliable, traceable datasets and model-ready assets.

The primary product lifecycle is:

**Collect → Curate → Annotate → Review / QA → Package and deliver → Prepare, train, and evaluate models**

JinoX's initial specialization is oral and craniofacial health in an East African research context. The analogy to Scale AI is about the business and operating model only; JinoX is not affiliated with Scale AI and does not claim equivalent scale or capabilities.

The current repository is an early prototype. The design describes the target product and must not imply that every workflow is already implemented.

## 2. Product promise

**Make high-quality domain data easier to collect, annotate, validate, deliver, and use to develop AI.**

A successful customer or project team should be able to answer:
- What data was collected, from which source, and under what permitted use?
- What is the current curation and annotation status?
- Which work is assigned, submitted, reviewed, or awaiting adjudication?
- How reliable are the labels, and how was quality measured?
- What dataset version was delivered, to whom, and with which limitations?
- Which exact dataset version and configuration were used to train/evaluate a model?

## 3. Users and operating roles

| User | Primary job | Design priority |
| --- | --- | --- |
| Customer / project owner | Define scope, deliverables, acceptance criteria, and access | Project status, deliverables, governance, auditability |
| Project manager | Coordinate collection, curation, assignments, QA, and delivery | Work queues, workload, blockers, deadlines |
| Data curator | Validate, normalize, and prepare source data | Efficient intake, remediation, provenance |
| Annotator / domain expert | Complete assigned work consistently | Focused workspace, clear guidelines, minimal friction |
| Independent reviewer | Assess submitted labels and record decisions | Review rubric, evidence, independence |
| Quality lead / adjudicator | Resolve disagreements and monitor quality | Sampling, agreement, adjudication history |
| ML engineer / researcher | Prepare datasets, train models, and evaluate results | Versioned datasets, reproducibility, metrics |
| Data steward / administrator | Govern permitted use, privacy, access, and retention | Approval evidence, audit, controlled access |

A person may hold multiple roles across projects. Permissions must be project-scoped and enforced by the server and database, not inferred from UI visibility.

## 4. Information architecture

The primary navigation should follow the operating lifecycle:

1. **Overview** — work in progress, collection status, annotation/review backlog, quality alerts, and delivery blockers.
2. **Projects / Customers** — project purpose, team, scope, governance, deliverables, and activity.
3. **Data Collection** — upload/import, collection batches, source metadata, validation, and remediation.
4. **Datasets** — inventory, curation, modality, inclusion criteria, versions, and lifecycle status.
5. **Annotation Tasks** — task templates, work queues, assignments, annotation workspace, and guideline versions.
6. **Quality Assurance** — reviewer queue, sampling, disagreement, adjudication, and quality reports.
7. **Dataset Delivery** — release gates, manifests, exports, access grants, and delivery history.
8. **Model Development** — dataset splits, training jobs, experiment tracking, evaluation, and model artifacts.
9. **Workforce & Administration** — qualification, capacity, permissions, governance, and operational settings; expose only when implemented and authorized.

Navigation may be consolidated in the prototype, but the underlying product structure should preserve these distinct domain responsibilities. Do not keep a separate generic Research workspace as the primary product identity.

## 5. Core workflows

### 5.1 Customer and project onboarding
1. Create an organization/customer and project.
2. Define use case, modality, expected volume, annotation task, deliverable, quality criteria, and target schedule.
3. Record data ownership, lawful basis, ethics/consent requirements, retention, permitted use, and transfer constraints.
4. Assign project roles and establish approval gates.
5. Keep intake blocked until the required controls are verified.

### 5.2 Data collection and intake
1. Collect through secure uploads, structured capture, approved APIs, or partner/field workflows.
2. Register source, collection method, modality, provenance, rights, consent/legal basis, and project.
3. Validate file signature, schema, metadata, duplicate identifiers, completeness, and de-identification status.
4. Quarantine invalid or unreviewed assets.
5. Show collection progress and actionable remediation tasks.

### 5.3 Curation
1. Normalize supported formats and metadata.
2. Detect duplicates, missing values, corrupted assets, and out-of-scope records.
3. Apply project inclusion/exclusion criteria.
4. Preserve source lineage and curator changes.
5. Generate a curated dataset candidate and quality summary.

### 5.4 Annotation operations
1. Define task type, label taxonomy, schema, rubric, guideline version, examples, and uncertainty rules.
2. Split eligible data into assignable work units.
3. Assign work to appropriately qualified annotators/domain experts.
4. Provide modality-appropriate annotation tools and clear save/submit states.
5. Preserve drafts, submitted revisions, annotator provenance, and corrections.

### 5.5 Quality assurance
1. Route submitted work to independent reviewers.
2. Apply defined sampling and reference-item procedures where appropriate.
3. Capture acceptance, rejection, change request, uncertainty, and disagreement.
4. Adjudicate unresolved disagreements and preserve all decisions.
5. Gate delivery on explicit quality criteria and governance approval.

### 5.6 Dataset delivery
1. Create an immutable dataset version.
2. Include manifest, checksums, schema/guideline versions, provenance, quality report, and limitations.
3. Confirm customer access rights, permitted use, recipient, and delivery format.
4. Generate a controlled export and record access, delivery, expiry, and withdrawal obligations.

### 5.7 Model development
1. Select an approved dataset release.
2. Define preprocessing and train/validation/test split strategy.
3. Run leakage checks, including patient-level separation where appropriate.
4. Track code, configuration, compute environment, dataset version, model version, and evaluation protocol.
5. Evaluate with defined cohorts, uncertainty, subgroup coverage, and limitations.

**Current boundary:** the app has a training-preparation surface only. Training execution, experiment orchestration, evaluation pipelines, and model registry are target capabilities, not current shipped features.

## 6. Key screens

### Overview
Prioritize actionable work:
- Collection batches requiring attention.
- Curation issues and dataset readiness.
- Annotation assignments and submission status.
- Reviewer backlog and adjudication blockers.
- Dataset releases awaiting approval or delivery.
- Model jobs and evaluations only when real pipeline data exists.

Avoid vanity metrics and invented volume, accuracy, or impact claims.

### Project workspace
Use tabs such as Overview, Collection, Datasets, Tasks, Quality, Deliverables, Team, Governance, and Activity. Show the owner, purpose, status, scope, and blockers.

### Collection workspace
Support batch-based intake with progress, validation results, source metadata, duplicate detection, and remediation. Keep sensitive source content out of general activity feeds and browser URLs.

### Dataset workspace
Separate Summary, Items, Curation, Annotation, Quality, Versions, Delivery, and Governance. Clearly distinguish registered, collecting, curating, annotation-ready, in annotation, QA, approved, released, and archived states.

### Annotation workspace
Show one authorized work item at a time, relevant evidence, persistent guideline/schema version, label controls, uncertainty options, save state, and explicit submission. Never silently submit.

### QA workspace
Show submitted annotation, evidence, rubric, and review decisions. Prevent self-review in both UI and authorization logic. Preserve rationale and decision history.

### Model development workspace
Display selected dataset version, split configuration, training status, resource usage, experiment metadata, evaluation results, and limitations. Do not show fabricated progress or metrics.

## 7. Visual design direction

JinoX should feel like professional data operations software: scientific, precise, calm, operationally efficient, and trustworthy.

- Use the existing restrained monochrome visual system.
- Build hierarchy with typography, spacing, borders, and neutral surfaces.
- Keep dense tables readable with filters, clear statuses, responsive overflow, and persistent headers where useful.
- Use charts only for real operational or scientific questions; show units, cohort, denominator, time range, and missingness.
- Avoid decorative AI gradients, glowing effects, vanity metrics, and excessive animation.
- Keep repeated annotation actions fast, accessible, and keyboard-friendly.

## 8. Interaction and content rules

- Use explicit verbs: **Create project**, **Collect data**, **Curate records**, **Assign tasks**, **Submit annotation**, **Review labels**, **Approve dataset**, **Deliver dataset**, **Run training**, **Evaluate model**.
- Explain why an action is unavailable and what permission or requirement is missing.
- Confirm irreversible actions such as deletion, release, export, and withdrawal.
- Distinguish draft, submitted, reviewed, adjudicated, released, and delivered states.
- Do not describe AI-generated labels as ground truth.
- Never expose SQL errors, tokens, signed URLs, stack traces, or sensitive metadata.
- Show real source-backed metrics only, with definitions and denominators.

## 9. Privacy, security, and trust

- Patient-derived data remains private by default.
- Pseudonymized data is still sensitive data.
- Verify identity, project membership, purpose, role, and asset-level authorization server-side.
- Use RLS as defense in depth and test cross-project isolation.
- Use short-lived signed URLs and never persist them in logs or analytics.
- Record collection, curation, assignment, annotation, review, release, export, and model-run lineage.
- Keep contributor identity and compensation separate from patient records and annotation judgments.
- Apply retention, withdrawal, and deletion requirements to source and derived data.
- Do not train on data unless the project terms and approvals explicitly permit that use.

## 10. Operational measures

Track measures that improve data quality and delivery:
- Collection completeness and provenance coverage.
- Intake rejection and remediation rates.
- Curation cycle time and unresolved issues.
- Annotation throughput alongside acceptance/rework rates.
- Reviewer turnaround and independent agreement.
- Disagreement and adjudication rates.
- Dataset coverage, missingness, and representation gaps.
- Delivery acceptance and reproducibility.
- Training reproducibility, leakage checks, and evaluation validity.

Do not optimize solely for items processed per hour.

## 11. Delivery sequence

**Now:** secure collection, project authorization, dataset inventory, provenance, curation, and annotation assignment.

**Next:** full annotation workspaces, independent QA, adjudication, quality reporting, versioned dataset releases, and controlled customer delivery.

**Then:** reproducible dataset splits, training orchestration, experiment tracking, evaluation, and model registry.

**Later / gated:** workforce scale operations, customer commercial tooling, AI-assisted annotation, and advanced scientific AI.

## 12. Definition of done

A significant workflow is ready when:
- User role, permissions, and acceptance criteria are documented.
- Loading, empty, error, restricted, and success states are designed.
- Sensitive-data exposure and data-use permissions are reviewed.
- Keyboard and responsive behavior are usable.
- Server/database authorization matches the UI.
- Relevant automated tests and a deployment preview have been checked.
- Documentation distinguishes implemented behavior from remaining gaps.
