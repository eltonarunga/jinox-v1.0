# JinoX AI documentation

This directory contains the maintained technical, product, governance, and testing documentation for the JinoX AI repository.

## Start here

- [Repository overview and local setup](../README.md)
- [Product and design specification](../design.md)
- [Milestone plan](../planning.md)
- [Pending engineering tasks](../tasks.md)

## Technical documentation

| Document | Audience | What it covers |
| --- | --- | --- |
| [Architecture](architecture/README.md) | Engineers and technical reviewers | Current implementation, system boundaries, security invariants, engineering standards |
| [Multimodal intake](architecture/multimodal-intake.md) | Engineers, data curators, security reviewers | Intake flow, supported records, storage model, limitations, migration checks |
| [Annotation assignment and access](architecture/annotation-assignment-access.md) | Engineers, project owners, reviewers | Project roles, assignment permissions, RLS behavior, staging verification |
| [Profiles, roles, and administration](architecture/profiles-roles-admin.md) | Engineers and administrators | Account access levels, protected role management, migration/bootstrap notes |
| [Data governance](architecture/data-governance.md) | Project owners, data stewards, ethics leads | Data lifecycle, release gates, privacy and retention principles |
| [Research authorization tests](testing/research-authorization.md) | Engineers and QA | Staging identities, test environment, authorization assertions, test limitations |
| [Secure research MVP implementation note](SECURE_RESEARCH_MVP.md) | Engineers maintaining legacy research APIs | Historical scope, migration notes, API examples, outstanding production requirements |

## Documentation standards

Documentation in this repository follows these rules:

1. **Describe observed behavior.** Separate implemented functionality from proposed design, roadmap items, and research hypotheses.
2. **State limitations.** Identify disabled, incomplete, unverified, or deployment-dependent behavior.
3. **Avoid unsupported claims.** Do not claim clinical validation, ethics approval, production readiness, security certification, dataset quality, model accuracy, or deployment success without evidence.
4. **Keep procedures reproducible.** Include prerequisites, exact commands, expected outcomes, and safe-environment requirements.
5. **Protect sensitive information.** Never include real patient information, credentials, access tokens, private URLs, signed URLs, or production secrets.
6. **Version database guidance.** Reference migration filenames in timestamp order and distinguish committed migrations from migrations applied to a remote project.
7. **Maintain one source of truth.** Keep active delivery priorities in [tasks.md](../tasks.md), milestone outcomes in [planning.md](../planning.md), and detailed implementation guidance in the relevant technical document.
8. **Review documentation with code.** Update relevant docs in the same pull request when routes, schemas, environment variables, permissions, or operational procedures change.

## Suggested document metadata

For substantial new documents, include:
- Title and purpose
- Status (draft, active, superseded)
- Last reviewed date
- Intended audience
- Scope and explicit exclusions
- Prerequisites and dependencies
- Verification steps and known limitations
- Links to related source files and decisions

## Maintenance

Review documentation whenever a change affects user-visible capabilities, database schema, authorization, data handling, deployment, or operational responsibilities. If a document becomes obsolete, mark it as superseded and link to its replacement rather than leaving contradictory instructions in place.
