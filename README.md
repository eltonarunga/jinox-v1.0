# JinoX AI

**JinoX AI is building data infrastructure for East African oral-health AI.** The platform is designed to help authorized data partners collect and curate dental research data, coordinate qualified annotators, review label quality, preserve dataset provenance, and deliver versioned datasets to researchers and AI developers.

JinoX is a research data operations platform, not a validated clinical decision-support product. Any future clinical AI functionality requires separate validation, governance and appropriate regulatory review.

## Product workflow

1. **Create a research project** with its purpose, access rules and governance requirements.
2. **Register a dataset** with a modality, collection source, inclusion criteria and label schema.
3. **Collect and curate assets** with permission records, pseudonymous identifiers, metadata and provenance.
4. **Annotate** using qualified contributors and documented guidelines.
5. **Review and adjudicate** disagreements with independent reviewers and task-specific quality thresholds.
6. **Release a dataset version** with a manifest, label dictionary, quality report, limitations and permitted-use terms.

## Technology stack

- **Application:** Next.js App Router, React and TypeScript
- **UI:** Tailwind CSS and reusable accessible components
- **Identity:** Supabase Auth
- **Database:** Supabase Postgres with Row Level Security (RLS)
- **File storage:** private Supabase Storage buckets with short-lived signed URLs
- **Deployment:** Vercel and GitHub Actions
- **Architecture:** modular monolith; domain services and thin route handlers, with managed infrastructure until scale justifies additional services

See [the architecture guide](docs/architecture/README.md) and [incremental refactor plan](docs/architecture/refactor-plan.md).

## Local development

Requirements: Node.js 20+ and npm.

```bash
git clone https://github.com/eltonarunga/jinox-v1.0.git
cd jinox-v1.0
npm install
cp .env.example .env.local
npm run dev
```

Configure the public Supabase project URL and publishable/anon key in `.env.local` for authenticated data workflows. Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code or any `NEXT_PUBLIC_*` variable.

## Quality checks

```bash
npm run type-check
npm run lint
npm run build
```

The repository CI runs these checks for pushes and pull requests. The package manifest and lockfile should be kept synchronized; until the lockfile is reconciled with all declared dependencies, CI uses `npm install` rather than `npm ci`.

## Security and data governance

- Use only data with an appropriate legal basis, consent or other applicable authorization and ethics approval where required.
- Treat dental records and related metadata as sensitive health data.
- Keep source assets private by default; authorize every access and use short-lived signed URLs.
- Enforce access through server-side authorization and PostgreSQL RLS, not UI checks alone.
- Keep provenance, annotation revisions, reviewer decisions and export events auditable.
- Do not place patient identifiers or source clinical data in logs, analytics, screenshots or test fixtures.
- Pseudonymized data is not automatically anonymous.
- Dataset releases must document their permitted purposes, limitations and applicable access terms.

## Current scope and roadmap

The current implementation is an evolving prototype. The near-term priorities are reliable intake, dataset registration, annotation workflows, reviewer/adjudication operations, access-control tests and reproducible dataset exports. AI-assisted pre-labeling, benchmarking APIs and enterprise data services should follow once the human-reviewed data pipeline is reliable.
