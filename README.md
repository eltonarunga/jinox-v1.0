# JinoX AI

**JinoX AI is an AI data operations platform and managed data services business, focused initially on oral and craniofacial health.** Its operating model is inspired by data-centric AI companies such as Scale AI: help customers and research teams collect, curate, annotate, quality-check, package, and ultimately use high-quality datasets to develop and evaluate AI models.

JinoX's differentiation is its oral-health domain focus, East African research context, specialist human-in-the-loop workflows, and responsible handling of sensitive health data. This is a strategic analogy, not an affiliation or claim of feature parity with Scale AI.

The repository is an evolving prototype. It does not yet implement the complete target operating model, and it is not a validated clinical decision-support system.

## Product north star

**Turn raw, fragmented domain data into reliable, traceable, model-ready datasets.**

The primary operating lifecycle is:

**Collect → Curate → Annotate → Review / QA → Package and deliver → Prepare, train, and evaluate models**

The core product is the data operations workflow. Clinical tools, environmental research, genetics, case records, and future simulation capabilities are supporting or gated extensions—not the primary business.

## Core product modules

| Module | Purpose | Current implementation boundary |
| --- | --- | --- |
| Organizations and projects | Customer/project setup, team, scope, governance | Project metadata and membership foundations exist; full customer onboarding and commercial operations are incomplete |
| Data collection | Secure upload/import, structured capture, provenance, collection progress | Case, asset, and structured intake foundations exist; production-grade collection operations and file inspection remain incomplete |
| Dataset management | Inventory, curation, lifecycle, versioning, delivery | Dataset metadata and item structures exist; immutable releases and controlled delivery remain incomplete |
| Annotation operations | Task design, assignment, guidelines, annotation workspaces | Annotation records/revisions and some access foundations exist; full workforce-scale task orchestration is incomplete |
| Quality assurance | Independent review, sampling, adjudication, agreement | Some review/access foundations exist; end-to-end QA and adjudication are incomplete |
| Dataset delivery | Manifests, quality reports, export and access control | Governance principles exist; reproducible controlled delivery remains to be implemented |
| Model development | Dataset splits, training, experiment tracking, evaluation | Current training page is preparation-only; no training execution engine, model registry, or validated serving pipeline is connected |
| Workforce operations | Annotator qualification, workload, performance and compensation | Not implemented as a complete workforce-management system |
| Administration and governance | Identity, permissions, audit, privacy, retention | Partial application and database foundations exist; production readiness requires verification |

The target workflow is detailed in [the product operating model](docs/product/operating-model.md). Always distinguish shipped functionality from planned operations.

## Primary users

- Customers, institutions, and project owners who commission or manage data projects.
- Project managers and data curators who collect and prepare source data.
- Annotators and qualified domain experts who label assigned work.
- Independent reviewers and quality leads who assess and adjudicate labels.
- ML engineers and researchers who prepare datasets, train models, and evaluate results.
- Data stewards and administrators responsible for governance and access.

## Current product workflow

The repository currently provides foundations for project metadata, pseudonymous case and asset intake, dataset metadata/items, annotation records/revisions, case-linked records, and training preparation. The intended end-to-end workflow adds secure collection channels, curation queues, annotation task orchestration, independent QA, versioned dataset delivery, and reproducible model development.

The target workflow must not be mistaken for complete implementation. In particular:
- File inspection, malware scanning, and robust de-identification need further work before real sensitive files are accepted.
- Reviewer assignment, disagreement handling, adjudication, and quality analytics are incomplete.
- Governed dataset manifests and controlled exports are incomplete.
- Model training execution, experiment orchestration, evaluation pipelines, and model registry are not connected.

## Technology

- **Application:** Next.js App Router, React, TypeScript
- **UI:** Tailwind CSS
- **Identity and data:** Supabase Auth and PostgreSQL with Row Level Security (RLS)
- **File storage:** private Supabase Storage with short-lived signed URLs
- **Hosting:** Vercel
- **CI:** GitHub Actions
- **Architecture:** modular monolith; add infrastructure only when justified by measured product requirements

## Repository map

```text
app/                  Next.js routes, pages, and API handlers
components/           Shared UI and feature components
lib/                  Supabase clients, validation, and shared application logic
supabase/migrations/  Ordered database and RLS migrations
tests/unit/           Unit tests for validation and shared rules
tests/integration/    Staging-oriented authorization tests
docs/product/         Product strategy and operating model
docs/                 Architecture, governance, implementation, and testing guides
design.md             Product and interaction design specification
planning.md           Milestones, sequencing, and acceptance gates
tasks.md              Actionable implementation backlog
```

## Documentation

Start with the [documentation index](docs/README.md).

| Document | Purpose |
| --- | --- |
| [Product operating model](docs/product/operating-model.md) | Data operations business model, workflow, roles, and target modules |
| [Design specification](design.md) | User experience aligned to collection, annotation, QA, delivery, and model workflows |
| [Architecture](docs/architecture/README.md) | Current architecture, boundaries, security invariants, and target structure |
| [Data governance](docs/architecture/data-governance.md) | Data lifecycle, privacy, and release requirements |
| [Multimodal intake](docs/architecture/multimodal-intake.md) | Implemented intake behavior and known limitations |
| [Annotation access model](docs/architecture/annotation-assignment-access.md) | Roles, assignment boundaries, and staging verification |
| [Testing guide](docs/testing/research-authorization.md) | Staging authorization test setup and limitations |
| [Planning](planning.md) | Milestones and delivery strategy |
| [Tasks](tasks.md) | Prioritized pending work |

## Local development

**Requirements:** Node.js 20 or later and npm. Use the Node version configured by CI where possible.

```bash
git clone https://github.com/eltonarunga/jinox-v1.0.git
cd jinox-v1.0
npm install
cp .env.example .env.local
npm run dev
```

Configure the Supabase project URL and public anon/publishable key required by the application. See [.env.example](.env.example). Never expose a Supabase service-role key in browser code or a `NEXT_PUBLIC_*` variable.

## Quality checks

Run before opening a pull request:

```bash
npm run test:unit
npm run test:integration
npm run type-check
npm run lint
npm run build
```

Integration tests require dedicated staging credentials and synthetic data. If required variables are absent, a skipped integration suite is **not** evidence that authorization policies are correct. See the [authorization test guide](docs/testing/research-authorization.md).

## Security and data governance

- Treat oral-health records, images, scans, genomic information, and linked metadata as sensitive health data.
- Use only data with an appropriate legal basis, ethics determination, consent or documented waiver, and permitted-use scope.
- Keep patient-derived assets private by default; verify authorization server-side and through RLS.
- Use pseudonymous identifiers and minimize data in URLs, logs, analytics, screenshots, and test fixtures.
- Pseudonymized data is not automatically anonymous.
- Keep secrets server-side; never commit credentials or tokens.
- Preserve source provenance, curator changes, annotation revisions, review decisions, and dataset versions.
- Separate contributor identity and compensation records from patient-derived records and annotation judgments.
- Do not release datasets or use them for model training until rights, governance, quality, split methodology, and access terms have been reviewed.
- Do not use the prototype for autonomous diagnosis, triage, treatment recommendations, or clinical decisions.

## Project status

The strategic direction is an end-to-end AI data operations platform. Near-term engineering priorities are security and reliable collection, dataset curation, annotation assignment, independent QA, and governed dataset delivery. Model-training orchestration and evaluation follow once high-quality, traceable datasets and reproducible workflows exist. Clinical AI, genomics, and biological simulation remain separate research directions gated by evidence and governance.

See [planning.md](planning.md) for milestones and [tasks.md](tasks.md) for the active backlog.
