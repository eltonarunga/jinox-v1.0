# JinoX AI documentation

This directory contains the maintained product, operating-model, technical, governance, and testing documentation for JinoX AI.

## Start here

- [Repository overview and local setup](../README.md)
- [Product operating model](product/operating-model.md)
- [Product and design specification](../design.md)
- [Milestone plan](../planning.md)
- [Pending engineering tasks](../tasks.md)

## Product and technical documentation

| Document | Audience | What it covers |
| --- | --- | --- |
| [Product operating model](product/operating-model.md) | Product, operations, engineering, customers, and partners | Data-operations business model, end-to-end lifecycle, roles, modules, and commercial hypotheses |
| [Architecture](architecture/README.md) | Engineers and technical reviewers | Current implementation, target architecture, system boundaries, security invariants |
| [Incremental refactor plan](architecture/refactor-plan.md) | Engineers | Safe refactoring sequence aligned to the data-operations lifecycle |
| [Multimodal intake](architecture/multimodal-intake.md) | Engineers, data curators, security reviewers | Intake flow, supported records, storage model, limitations, migration checks |
| [Privileged asset review](security/asset-review-workflow.md) | Administrators and engineers | Admin-only review queue, append-only audit, database enforcement, staging tests |
| [Annotation assignment and access](architecture/annotation-assignment-access.md) | Engineers, project owners, reviewers | Project roles, assignment permissions, RLS behavior, staging verification |
| [Profiles, roles, and administration](architecture/profiles-roles-admin.md) | Engineers and administrators | Account access levels, protected role management, migration/bootstrap notes |
| [Data governance](architecture/data-governance.md) | Project owners, data stewards, ethics leads | Data lifecycle, privacy, training-use approval, and release requirements |
| [Research authorization tests](testing/research-authorization.md) | Engineers and QA | Staging identities, test environment, authorization assertions, test limitations |
| [Secure research MVP implementation note](SECURE_RESEARCH_MVP.md) | Engineers maintaining legacy research APIs | Historical scope, migration notes, API examples, outstanding production requirements |

## Documentation standards

1. **Describe observed behavior.** Separate implemented functionality from target design, roadmap items, and research hypotheses.
2. **State limitations.** Identify disabled, incomplete, unverified, or deployment-dependent behavior.
3. **Avoid unsupported claims.** Do not claim clinical validation, ethics approval, production readiness, security certification, dataset quality, model accuracy, or deployment success without evidence.
4. **Keep procedures reproducible.** Include prerequisites, exact commands, expected outcomes, and safe-environment requirements.
5. **Protect sensitive information.** Never include real patient information, credentials, access tokens, private URLs, signed URLs, or production secrets.
6. **Version database guidance.** Distinguish committed migrations from migrations applied to a remote project.
7. **Maintain one source of truth.** Product strategy and lifecycle live in [the operating model](product/operating-model.md); milestones in [planning.md](../planning.md); actionable work in [tasks.md](../tasks.md); detailed implementation guidance in the relevant technical document.
8. **Review documentation with code.** Update docs when routes, schemas, environment variables, permissions, or operational procedures change.

## Maintenance

Review documentation whenever a change affects user-visible capabilities, data operations, database schema, authorization, data handling, model workflows, deployment, or operational responsibilities. Mark obsolete documents as superseded and link to their replacement rather than leaving contradictory instructions.
