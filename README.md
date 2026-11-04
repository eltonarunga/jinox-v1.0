# JinoX AI

**JinoX AI is an early-stage research data operations platform for oral and craniofacial health research, beginning in East Africa.** The current product focuses on project and dataset metadata, multimodal research-data intake, case-linked records, environmental measurements, annotation preparation, and access-controlled research workflows.

JinoX is a prototype for research operations. It is **not** a validated clinical decision-support system, diagnostic model, treatment recommender, genomic risk predictor, or biological digital-twin simulator.

## Current product scope

| Area | Current implementation | Important limitation |
| --- | --- | --- |
| Projects | Create and manage research project metadata and project membership | Institutional governance and approval evidence still require operational verification |
| Data intake | Register pseudonymous cases, upload supported assets to private storage, and import supported structured records | Browser-side checks are not a substitute for server-side file inspection, malware scanning, or de-identification |
| Datasets | Register datasets and associate eligible source assets with dataset items | Immutable dataset releases, manifests, and controlled exports are not complete |
| Annotation | Create and submit research annotations for dataset items | A complete independent reviewer, disagreement, and adjudication experience remains outstanding |
| Environmental data | Capture source-attributed water and climate measurements | Records are research inputs, not validated population-risk estimates |
| Clinical assessments | Record clinician-entered assessment information | No AI inference or autonomous diagnosis is connected |
| Genetics | Record research-protocol metadata | Raw genomic ingestion and individual genetic-risk prediction are disabled |
| Case records | View case-linked assets and dated observations | This is not a 3D reconstruction or biological simulation |
| Training preparation | View dataset/annotation preparation status | No model-training runner, model registry, or validated model-serving pipeline is connected |
| Administration | Manage user access levels through protected administration workflows | A role label does not verify professional credentials |

The standalone Research workspace has been retired from primary navigation. Research metadata APIs remain in the codebase; consult the route handlers and migration history before relying on any endpoint.

## Product workflow

1. Create a research project and define its purpose.
2. Register dataset metadata and document source, modality, inclusion criteria, and intended use.
3. Collect authorized data using pseudonymous case references and preserve source provenance.
4. Curate assets and resolve data-quality issues.
5. Prepare and submit annotations against a documented schema.
6. Complete independent review and adjudication before treating labels as release-ready.
7. Publish a controlled, versioned dataset only after governance, quality, and access gates have been implemented and verified.

Steps 6–7 describe the target workflow; they are not a claim that all reviewer, adjudication, release, or export capabilities are already available.

## Technology

- **Application:** Next.js App Router, React, and TypeScript
- **UI:** Tailwind CSS
- **Identity and data:** Supabase Auth and PostgreSQL with Row Level Security (RLS)
- **File storage:** private Supabase Storage with short-lived signed URLs
- **Hosting:** Vercel
- **CI:** GitHub Actions
- **Architecture:** modular monolith; do not introduce distributed services without measured operational need

## Repository map

```text
app/                  Next.js routes, pages, and API handlers
components/           Shared UI and feature components
lib/                  Supabase clients, validation, and shared application logic
supabase/migrations/  Ordered database and RLS migrations
tests/unit/           Unit tests for validation and shared rules
tests/integration/    Staging-oriented authorization tests
docs/                 Architecture, governance, implementation, and testing guides
design.md             Product and interaction design specification
planning.md           Milestones, sequencing, and acceptance gates
tasks.md              Actionable implementation backlog
```

## Documentation

Start with the [documentation index](docs/README.md).

| Document | Purpose |
| --- | --- |
| [Architecture](docs/architecture/README.md) | Current architecture, boundaries, security invariants, and target structure |
| [Data governance](docs/architecture/data-governance.md) | Dataset lifecycle, privacy, and release requirements |
| [Multimodal intake](docs/architecture/multimodal-intake.md) | Implemented intake behavior and known limitations |
| [Annotation access model](docs/architecture/annotation-assignment-access.md) | Roles, assignment boundaries, and staging verification |
| [Profiles and administration](docs/architecture/profiles-roles-admin.md) | Account roles and admin controls |
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

Configure the Supabase project URL and public anon/publishable key required by the application. The checked-in `.env.example` should be treated as a template to verify against the current client configuration; see [pending tasks](tasks.md). Never expose a Supabase service-role key in browser code or a `NEXT_PUBLIC_*` variable.

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

CI currently installs dependencies with `npm install`. A reproducible `npm ci` workflow is a pending maintenance item and should be introduced only after the committed lockfile is verified against `package.json`.

## Security and research-data governance

- Treat oral-health records, images, scans, genomic information, and linked metadata as sensitive health data.
- Use only data with an appropriate legal basis, ethics determination, consent or documented waiver, and permitted-use scope.
- Keep patient-derived assets private by default; verify authorization server-side and through RLS.
- Use pseudonymous identifiers and minimize data in URLs, logs, analytics, screenshots, and test fixtures.
- Pseudonymized data is not automatically anonymous.
- Keep secrets server-side; never commit credentials or tokens.
- Record provenance and preserve annotation revisions and review decisions.
- Do not release datasets until rights, governance, quality, limitations, and access terms have been reviewed.
- Do not use the prototype for autonomous diagnosis, triage, treatment recommendations, or clinical decisions.

Production use requires a verified deployment configuration, applied and tested migrations, security review, backup/restore procedures, incident response, privacy and ethics governance, and appropriate regulatory assessment.

## Project status

The repository is an evolving prototype. The near-term engineering focus is security hardening, reliable intake, project-scoped authorization, complete annotation review, data-quality controls, and reproducible dataset releases. Foundation models, digital twins, genomic prediction, and clinical deployment remain future research directions gated by scientific validation, ethics, safety, and regulatory review.

See [planning.md](planning.md) for milestones and [tasks.md](tasks.md) for the active backlog.
