# Incremental refactor plan

**Status:** Active engineering guidance  
**Last reviewed:** 2026-11-04  
**Product direction:** [JinoX AI data operations model](../product/operating-model.md)

This document describes how to evolve the existing modular monolith toward the target data-operations workflow. It is not a separate roadmap; milestones live in [planning.md](../../planning.md), and tasks in [tasks.md](../../tasks.md).

## Current baseline

- Next.js App Router, React, TypeScript, and Tailwind CSS.
- Supabase Auth, PostgreSQL with Row Level Security, and private Storage.
- Project, dataset, case/asset intake, annotation, and training-preparation foundations.
- Some data orchestration remains in client components.
- API handlers and validation logic should move toward explicit domain boundaries.
- A complete curation queue, workforce task orchestration, independent QA/adjudication, dataset delivery, and model-training pipeline remain unfinished.
- A committed migration is not evidence that a remote Supabase project has applied it.

## Target domain sequence

1. **Secure collection:** project-scoped intake, source provenance, modality validation, quarantine, de-identification, and remediation.
2. **Dataset curation:** inventory, eligibility, duplicate/missingness checks, curator actions, and traceable status.
3. **Annotation operations:** task templates, schema/guideline versions, work units, assignment, annotation UI, and revision history.
4. **Quality assurance:** independent review, sampling, disagreement, adjudication, agreement, and quality reporting.
5. **Dataset delivery:** release gates, immutable versions, manifests, checksums, exports, and delivery audit.
6. **Model development:** approved dataset splits, leakage checks, training jobs, experiment tracking, evaluation, and model artifacts.
7. **Scale operations:** workforce qualification, capacity, customer reporting, and commercial tooling where demand validates them.

## Refactoring principles

1. Keep the deployable modular monolith; add queues/workers only when real workload requires them.
2. Make one domain-level change at a time.
3. Preserve data and API contracts unless a reviewed migration plan changes them.
4. Separate browser and server responsibilities, especially identity, authorization, secrets, and file validation.
5. Treat RLS and server-side authorization as mandatory.
6. Add tests before or alongside changes to persisted data, permissions, and workflow state.
7. Preserve lineage across collection, curation, annotation, review, release, and model runs.
8. Keep customer operations and contributor payments separate from patient records and annotation judgments.
9. Update docs to distinguish implemented, partial, and planned capabilities.

## Safe change procedure

For each refactor:

1. Identify the user workflow, customer requirement, and domain invariant.
2. Inspect callers, database policies, migrations, and tests.
3. Add tests for permitted and denied behavior.
4. Implement the smallest coherent change.
5. Run unit tests, staging integration tests where configured, type check, lint, and production build.
6. Review data exposure, permissions, migration risks, lineage, and API compatibility.
7. Deploy a preview and verify the affected workflow.
8. Update product, architecture, governance, and operations documentation.
9. Merge only after required checks and reviewer approval.

## Explicitly avoid

- Combining a framework upgrade with broad data-model redesign.
- Running destructive migrations against production without backup and recovery planning.
- Treating browser validation as a security boundary.
- Relying on UI visibility instead of server and database authorization.
- Using production patient data in development, tests, screenshots, or logs.
- Adding microservices, queues, vector databases, or model-serving infrastructure without demonstrated requirements.
- Building model-training execution before dataset governance, versioning, quality, and leakage controls are in place.
