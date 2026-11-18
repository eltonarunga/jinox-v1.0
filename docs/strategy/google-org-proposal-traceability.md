# Google.org AI for Science proposal — implementation traceability

**Source:** JinoX AI, *A Multimodal Platform for Oral & Craniofacial Discovery, Simulation, and Precision Health: Beginning in Kenya* (2026 proposal supplied for review)  
**Repository baseline:** `main` at `a1cc94a80c3c3ff3dbd0c766f6fb685fb0835c62`  
**Status:** Internal planning and claim-control document; not evidence of grant award, institutional partnership, ethics approval, or completed capability.

## 1. Purpose

The proposal describes a broad research and public-health ambition. The current JinoX repository is a prototype focused on governed oral-health data operations: project setup, case and asset intake, dataset structures, annotation/review foundations, and preparation for later model development.

This document connects the proposal's six technical layers to the repository's actual backlog and identifies what must be proven before the proposal is presented as an executable 24-month programme.

**Core rule:** A proposal target, intended partnership, planned approval, or future capability must never be described as already achieved. Product screenshots and deployed pages are not evidence of research validity, clinical readiness, participant recruitment, data rights, or institutional approval.

## 2. Proposal-to-repository traceability

| Proposal component | Current repository evidence | Backlog dependencies | Assessment |
| --- | --- | --- | --- |
| Pan-African multimodal dataset | Project, case, asset, dataset-item and annotation foundations exist. Case-to-project linkage is now designed in PR #75, but not implemented in the database. Secure production intake, curation, representativeness and export are incomplete. | JX-004–008, JX-013–017 | **Partial foundations; not a research-ready dataset** |
| Foundational oral-health AI model | The application has a training-preparation surface. There is no connected training execution engine, validated model pipeline, model registry or clinically evaluated model. | JX-018–020 | **Future / gated** |
| Digital-twin simulation engine | No implemented oral-cavity digital twin, validated biological simulator or simulation workflow is established by the repository. | JX-024 | **Research concept only** |
| Genetic risk prediction | No genomic ingestion, genomic analysis pipeline, validated susceptibility model or genomic governance workflow is established by the repository. | JX-017, JX-024 | **Research concept only; high governance dependency** |
| Low-resource AI diagnostics | The repository does not establish a validated on-device diagnostic application, offline inference pipeline or deployment network for Community Health Promoters. | JX-020, JX-023, JX-024 plus a separately scoped deployment workstream | **Not implemented** |
| Climate-health intelligence | The repository does not establish a linked environmental-health dataset, geospatial modelling pipeline or validated county/sub-county risk maps. | JX-006, JX-014, JX-017, JX-024 plus external data agreements and methods | **Research concept only** |
| Open research API and open datasets | Existing repository foundations do not prove a safe public API, open clinical dataset, open model weights or permissioned research access service. | JX-015–020 and JX-017 | **Not implemented** |

### Interpretation

The repository is best positioned today as the data-governance and data-operations foundation that could support later research. It is not yet the six-layer scientific platform described in the proposal. That distinction should be maintained in grant materials, partner discussions, product copy and public demonstrations.

## 3. Recommended programme sequencing

The six proposal layers should not be built in parallel from day one. They depend on a trustworthy, permissioned data foundation.

### Phase A — Make governed data operations real

**Indicative focus:** first 6–9 months; refine after partner and budget validation.

- Complete project-scoped case, asset and dataset relationships. PR #75 documents the design; implementation remains pending.
- Complete dedicated staging RLS, role, storage and revocation tests (JX-004).
- Complete secure intake, quarantine, content inspection and validated de-identification for selected modalities (JX-005).
- Establish source provenance, rights, consent/legal basis and permitted-purpose tracking (JX-006, JX-017).
- Establish backup, restore, incident and access-revocation procedures (JX-007).
- Deliver curation, annotation, independent QA and operational audit coverage (JX-008–014).
- Establish a reproducible, governed dataset release and controlled delivery path (JX-015–016).

**Exit evidence:** actual synthetic staging tests pass; role boundaries and storage isolation are demonstrated; governance owners and approvals are documented; a limited, well-described dataset can be curated and released reproducibly. No real patient data should be used before the project-specific legal, ethics and operational gates are met.

### Phase B — Validate one narrow scientific use case

**Indicative focus:** months 6–15, conditional on Phase A and research partnerships.

Select one initial use case rather than promising all modalities and disease areas at once. A candidate could be a narrowly defined imaging or fluoride/environmental research question, but the final choice must be made with research partners based on data availability, clinical relevance, feasibility, ethics and scientific value.

- Define the research question, intended population, outcome labels, reference standard and intended use.
- Complete a data inventory and feasibility study before setting sample-size targets.
- Pre-register or otherwise document the analysis and evaluation protocol where appropriate.
- Establish baseline models and leakage-safe patient-level splits where required (JX-018).
- Run reproducible experiments and task-specific evaluations (JX-019–020).
- Report calibration, uncertainty, subgroup performance, missingness, external validity and limitations; do not rely on a single headline AUC.

**Exit evidence:** a reproducible research result with a defined cohort, methods, limitations and independent scientific review. This is not equivalent to clinical validation or regulatory clearance.

### Phase C — Gated scientific extensions

**Indicative focus:** months 15–24, only if feasibility and independent review support them.

- Genomics: separate protocol, lawful data access, participant engagement, consent scope, privacy threat assessment, specialist analysis and governance.
- Digital twins: begin with a bounded biological subsystem and validate model assumptions and parameters against independent experimental/clinical evidence. Do not describe a broad oral-cavity simulator as validated until each component is.
- Climate-health: verify environmental data provenance, spatial/temporal resolution, sampling coverage and confounders; distinguish association from causal inference.
- Low-resource deployment: assess device capability, connectivity, workflow integration, usability, clinical oversight, safety and applicable regulatory requirements before field deployment.

**Exit evidence:** a separately reviewed feasibility package and validation evidence for each extension. A successful imaging model does not validate a genomic model, digital twin, climate-risk model or mobile deployment.

## 4. Proposal claims and target register

The following figures and statements appear in the supplied proposal. They are proposal claims or targets, not facts established by this repository.

| Proposal statement | Correct status in project materials | Evidence required before external use |
| --- | --- | --- |
| 3.5 billion people affected by oral diseases | Background statistic cited by proposal | Current authoritative global burden source, exact definition and year |
| Kenya dentist ratio of 1:50,000 | Background statistic cited by proposal | Current workforce source, year, denominator and whether registered, active or practising dentists are counted |
| Less than 2% of global medical imaging datasets from Sub-Saharan Africa | Estimate stated in proposal | Traceable publication or dataset landscape analysis with a defensible denominator |
| No publicly available African oral-health foundational model / world's first model | Strong novelty claim | Systematic literature, model and dataset landscape review with a dated search strategy; narrow the claim if counterexamples exist |
| Largest open oral-health dataset in the Global South | Aspirational claim | Defined scope, comparable datasets, data-rights feasibility and independently auditable dataset size/coverage |
| 50,000+ records | 18-month target in proposal | Bottom-up recruitment and data-access plan, modality mix, site capacity, duplicate rules, consent rate, curation yield and budget |
| Diagnostic performance above 85% AUC | 18-month target in proposal | Defined task and cohort, reference standard, sample-size/power plan, locked test set, confidence intervals, calibration and external validation |
| 6–10 peer-reviewed papers | 18-month target in proposal | Research questions, investigators, data readiness, analysis plans, authorship and publication timeline |
| 50+ facilities and 100,000+ patients screened | 18-month targets in proposal | Signed or documented partner pipeline, workflow capacity, clinical oversight, approvals, deployment/support costs and a realistic screening definition |
| 200+ institutions accessing open dataset/API | 18-month target in proposal | Open-data governance, API design, access policy, support capacity, licensing and measurable adoption definition |
| Risk maps for 20+ counties | 18-month target in proposal | Environmental data coverage, outcome linkage, spatial validation, uncertainty reporting and county-level partner review |
| KEMRI/IRB approval and KMPDC compliance | Future commitments described in proposal | Actual approval/determination letters, scope, protocol versions and regulatory advice; do not imply approvals already exist |
| $2 million / 24-month programme | Requested budget and implementation window | Detailed costed workplan, staffing, compute, data collection, partner sub-awards, ethics, security, evaluation, contingency and milestone cashflow |

The proposal refers to an 18-month target table and a 24-month implementation window. The final workplan should explain which targets are due by month 18 and what is delivered in months 19–24.

## 5. Scientific and governance issues to resolve

### 5.1 Dataset scale versus dataset quality

A 50,000-record target is not a scientific outcome by itself. Define what counts as a record, patient, visit, image, genomic sample and environmental observation. Prevent repeated visits or multiple images from being reported as independent patients. Track modality coverage, missingness, consent status, geographic representation, age distribution and curation yield.

### 5.2 AUC is not a complete clinical performance claim

An AUC threshold alone does not define a safe or useful diagnostic system. Specify the task, comparator, intended setting, prevalence, sensitivity/specificity at clinically relevant thresholds, calibration, confidence intervals, subgroup performance, external validation and prospective workflow evaluation. Internal validation is not independent clinical validation.

### 5.3 Open science must be compatible with participant rights

The proposal's ambition to release de-identified datasets and models under open licenses requires a careful data-release policy. Pseudonymisation is not anonymisation, and genomic or linked multimodal data can create substantial re-identification risks. Open code, schemas, documentation, synthetic data and aggregate statistics may be open by default; human-level data should be released only when the lawful basis, consent scope, ethics approval, risk assessment and controlled-access model support it.

### 5.4 Genomics requires a distinct governance track

Genomic data should not be treated as an ordinary optional field in a clinical dataset. Define purpose limitation, consent and future-use scope, access controls, retention, sharing, community engagement, withdrawal handling, cross-border transfer and oversight. Avoid using broad ethnic categories as convenient biological proxies without a justified scientific design and careful participant/community governance.

### 5.5 Climate association is not causation

Fluoride concentration, water source, diet, geography, socioeconomic conditions, access to care and other factors may be correlated. A county-level map can conceal substantial local variation. Document sampling methods, spatial resolution, time periods, confounders and uncertainty. Do not describe an association model as a causal disease-prediction system without an appropriate causal design.

### 5.6 Digital twins need bounded validation

A virtual representation of the whole oral cavity is an expansive research ambition. Start with a specific subsystem, define its state variables and biological assumptions, calibrate parameters against data, and test predictions against independent observations. Simulation output is not biological evidence unless validated against suitable experimental or clinical reference data.

### 5.7 Clinical deployment is a separate gate

The proposal's decision-support framing is appropriate as an ambition, but probability scores and clinician oversight do not by themselves establish safety. Each intended use requires task-specific validation, human-factors evaluation, risk management, privacy/security review and assessment of applicable Kenyan regulatory requirements before deployment.

## 6. Partner and evidence workstream

Before fixing the 24-month scope, create a partner/evidence register with one row per proposed institution or data source:

- Institution and named accountable contact.
- Proposed role: clinical site, research partner, data provider, laboratory, environmental data source, technical partner or evaluator.
- Evidence of engagement: exploratory discussion, letter of support, memorandum, agreement or executed data-sharing agreement. These statuses are not interchangeable.
- Data or service offered, modalities, estimated volume and provenance.
- Rights, permitted purpose, ethics review responsibility and transfer restrictions.
- Recruitment or data access dependencies and realistic lead time.
- Budget contribution or cost to JinoX.
- Owner, next action and evidence location.

The proposal mentions University of Nairobi, Kenyatta National Hospital, Aga Khan University Hospital, KEMRI and environmental sources. Mention in a proposal is not proof of partnership, endorsement, data access or approval. Record each relationship using its actual evidence status.

## 7. Budget and workplan requirements

The $2 million request should be linked to costed work packages rather than distributed evenly across six ambitious layers. At minimum, budget for:

- Core engineering, data operations, security and platform maintenance.
- Clinical, research, data stewardship and project management staff.
- Institutional partner costs, site onboarding and participant-facing work.
- Data collection, digitisation, annotation, review and adjudication.
- Secure storage, backup, compute, model development and evaluation.
- Ethics review, legal advice, privacy/security assessment and regulatory consultation.
- Genomic laboratory and specialist analysis costs, only if that workstream is selected.
- Environmental data acquisition, field validation and geospatial expertise.
- Independent scientific evaluation, publication and open-science stewardship.
- Training, connectivity, device support and deployment evaluation.
- Contingency, currency/inflation assumptions and post-grant sustainability.

Each work package needs a lead, start/end month, dependencies, deliverable, acceptance evidence, cost and risk owner. Avoid allocating budget to a digital twin, genomics or 50-facility deployment before feasibility and partner capacity are demonstrated.

## 8. Recommended scope for a credible first funded programme

A defensible first programme should prioritize:

1. Governed oral-health data infrastructure with verified project, case, asset and dataset boundaries.
2. A carefully scoped Kenyan dataset collection and curation pilot with documented provenance and participant protections.
3. One primary research use case with a defined protocol and independent evaluation.
4. Open tooling, schemas, documentation and synthetic examples, with controlled access for sensitive human-level data.
5. Feasibility studies—not promises of full implementation—for genomics, digital twins, climate-health and low-resource deployment.

This creates a credible foundation for expansion without presenting every research ambition as a deliverable that can be completed simultaneously.

## 9. Current engineering gates

The repository backlog remains the source of engineering execution status:

- JX-004 to JX-007: security, intake, provenance, recovery and incident readiness.
- JX-008 to JX-014: curation, annotation, QA, audit and quality framework.
- JX-015 to JX-017: release, controlled delivery, privacy and data-use governance.
- JX-018 to JX-020: reproducible model development and evaluation.
- JX-024: advanced scientific AI, genomics and simulation, gated by separate protocols and validation.

PR #75 documents the project-to-case-to-asset-to-dataset relationship but does not implement it. The staging authorization suite must be shown to execute against dedicated synthetic staging identities; a green CI step that skipped tests is not proof of authorization correctness.

## 10. External communication rule

Use three labels consistently in decks, grant applications, website copy and demonstrations:

- **Implemented:** present in the repository and supported by tests or operational evidence.
- **In progress / partial:** foundations exist, but defined acceptance criteria remain unmet.
- **Proposed / research hypothesis:** future capability or scientific direction without implementation or validation evidence.

Do not use "world's first", "largest", "clinically validated", "KEMRI-approved", "KMPDC-compliant", "open dataset", "deployed across 50 facilities" or equivalent language unless the relevant evidence has been independently checked and the claim is appropriately qualified.

---

**Decision:** Treat the Google.org proposal as the strategic research vision, and the repository backlog as the engineering delivery baseline. Align them through explicit evidence gates, not by relabelling planned research capabilities as shipped product features.
