# Incremental refactor plan

## Current observations

- The application uses Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth, Postgres and Storage.
- Some pages perform data orchestration directly in large client components.
- Research API handlers repeat input parsing and validation patterns.
- The middleware creates a Supabase client with non-null assertions, so missing environment variables can cause request-time failures.
- The README describes a multimodal clinical-risk platform, while the current product strategy is dataset intake, annotation, review and delivery. Product copy and routes should be aligned to the data operations model.
- The CI workflow uses `npm install` even though a lockfile exists; reproducible CI should use `npm ci`.

## Incremental implementation rules

- Keep the current deployable Next.js + Supabase modular monolith.
- Avoid a framework migration and dependency upgrades in the same change as domain refactoring.
- Do not alter production data or apply database migrations as part of a frontend refactor.
- Introduce one domain boundary at a time and preserve API contracts until callers are migrated.
- Each PR should include a focused diff and report type-check, lint, build and relevant test outcomes.
- Never claim verification when a command or deployment check has not actually run.

## First implementation slice

- Centralize public Supabase environment parsing.
- Make middleware handle missing or invalid configuration without throwing.
- Make CI install from the lockfile.
- Document the target module boundaries and the data-first product model.
- Follow-up PRs should extract dataset/annotation domain services, add access-control integration tests, and finish multi-annotator review and immutable export workflows.
