# Incremental refactor plan

**Status:** Active guidance; task execution is tracked in the root backlog  
**Last reviewed:** 2026-11-04

This document describes how to refactor the existing JinoX modular monolith safely. It is not a separate roadmap. The milestone sequence is maintained in [planning.md](../../planning.md), and actionable work is tracked in [tasks.md](../../tasks.md).

## Current baseline

- Next.js App Router, React, TypeScript, and Tailwind CSS.
- Supabase Auth, PostgreSQL with Row Level Security, and private Storage.
- Application pages contain some data orchestration in client components.
- API route handlers and validation logic should continue moving toward explicit domain boundaries.
- Database migrations are committed under `supabase/migrations/`; a committed migration is not evidence that a remote Supabase project has applied it.
- CI currently runs unit tests, staging-oriented authorization integration tests, type checking, linting, and a Next.js production build.
- A complete reviewer/adjudication workflow, immutable dataset release process, and reproducible export pipeline remain future implementation work.

## Refactoring principles

1. Keep the deployable modular monolith; introduce infrastructure only when measured needs justify it.
2. Make one domain-level change at a time.
3. Preserve existing data and API contracts unless a reviewed migration plan explicitly changes them.
4. Separate browser and server responsibilities, especially identity, authorization, secrets, and file validation.
5. Treat RLS and server-side authorization as mandatory security boundaries.
6. Add tests before or alongside changes to persisted data, permissions, and workflow state.
7. Keep pull requests focused and document the checks that actually ran.
8. Never describe unimplemented model, simulation, or clinical capabilities as available.

## Recommended implementation order

1. **Security and dependency baseline:** see JX-001 through JX-007.
2. **Core workflow boundaries:** centralize validation, authorization, and domain operations; see JX-008 through JX-012.
3. **Quality and release services:** build quality reporting, release gates, manifests, and exports; see JX-013 through JX-016.
4. **Research interoperability:** add stable schemas, documented APIs, and reproducible experiment references; see JX-017 and JX-018.
5. **Research AI extensions:** only proceed through the scientific and governance gates in milestone M5.

## Safe change procedure

For each refactor:

1. Identify the user workflow and domain invariant being changed.
2. Inspect callers, database policies, migrations, and current tests.
3. Add or update tests for expected and denied behavior.
4. Implement the smallest coherent change.
5. Run unit tests, staging integration tests where configured, type check, lint, and production build.
6. Review the diff for data exposure, permission changes, migration risks, and API compatibility.
7. Deploy a preview and verify the affected workflow in a browser.
8. Update the relevant architecture, governance, or operational documentation.
9. Merge only after required checks and reviewer approval.

## Explicitly avoid

- Combining a major framework upgrade with a broad database redesign.
- Running destructive database migrations directly against production without backup and recovery planning.
- Treating browser validation as a security boundary.
- Relying on UI visibility instead of server and database authorization.
- Using production patient data in development, tests, screenshots, or logs.
- Adding microservices, queues, vector databases, or model-serving infrastructure without demonstrated requirements.
