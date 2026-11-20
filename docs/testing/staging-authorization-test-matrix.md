# Staging authorization test matrix

## Scope
This matrix translates the repository's authorization intent into staging tests. It is a test plan, not evidence that policies or functions currently pass. Use synthetic accounts, projects, cases, assets, and datasets only.

## Required synthetic identities
- Global administrator (not an asset uploader)
- Project owner / manager
- Project reviewer
- Assigned researcher
- Unassigned researcher
- User from a separate project
- Clinical asset owner/uploader

Keep identities distinct when a test depends on separation of duties. A reviewer must not be the annotator for the same annotation, and the administrator reviewing an asset must not be its uploader.

## Test matrix

| Surface | Positive test | Negative / boundary test |
|---|---|---|
| Project membership | Owner adds eligible project member | Non-owner cannot add or alter membership |
| Project metadata | Member can view own project | Non-member cannot read project metadata |
| Dataset metadata | Member can view datasets in own project | Cross-project dataset reads denied |
| Clinical case | Owner creates and reads own case | Another user cannot read, alter, or delete it |
| Asset intake | Owner uploads asset to own open case with consent/waiver | No consent, closed case, wrong owner, or client-set approval state rejected |
| Storage | Owner accesses own authorized object | Other user and unrelated project access denied |
| Asset approval | Separate global admin performs one permitted review transition | Uploader cannot review; non-admin cannot decide; repeat decision blocked |
| Dataset item | Manager adds approved owned asset and valid assignment | Pending/quarantined assets and non-members cannot be added |
| Assignment | Manager assigns to researcher in project | Cross-project or non-researcher assignment rejected |
| Annotation | Assigned researcher saves draft and submits | Unassigned user, wrong project, or non-researcher cannot write |
| Annotation edits | Researcher edits own draft | Submitted/reviewed work cannot be edited outside allowed transition |
| Review | Eligible reviewer reviews submitted annotation | Annotator cannot review own work; direct insert blocked if RPC is required |
| Curation | Reviewer/manager records decision with rationale | Unauthorized roles, invalid decisions, or missing rationale rejected |
| Release | Eligible workflow creates release manifest | Empty manifest, unauthorized creation, duplicate release number/hash rejected |
| Append-only history | Read permitted curation/review/release history | Update/delete attempts against immutable history rejected |
| Audit | Successful and denied governance transitions produce expected records | Missing, mismatched, or cross-transaction audit records rejected |

## Execution expectations
1. Run tests against the staging project only.
2. Record the test case, role, expected result, actual result, and evidence for each case.
3. Assert both returned data and database state; a denied API response alone does not prove state was unchanged.
4. Test direct table access and RPC paths separately where both exist.
5. Include cross-project cases and role combinations; do not only test a happy path.
6. Treat missing test configuration as a hard failure in staging runs, not a silent skip.
7. Keep credentials out of logs and test output.

## Release gate
Do not declare staging authorization validated until every required case has a recorded result. Any unexpected allow, state change after a denied operation, or unexplained skip is a blocker. This matrix does not replace migration reconciliation or schema verification.
