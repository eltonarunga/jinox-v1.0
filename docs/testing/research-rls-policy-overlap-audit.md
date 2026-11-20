# Research RLS Policy Overlap Audit

**Scope:** Source migration review only. This document does not claim to describe deployed staging or production policy state.

## Finding

The research MVP migration and the later research workspace migration create policies on overlapping research tables. PostgreSQL's default permissive policies combine with OR semantics for policies applicable to the same command and role. A later policy therefore does not automatically narrow an earlier policy merely because its name or condition appears more restrictive.

The workspace migration creates owner-based policies with names such as `owners manage research projects`, `owners manage research datasets`, `owners manage research experiments`, `owners manage research consents`, and `owners read/write research audit logs`. The MVP migration creates separately named member/manager policies such as `research_projects_read_member`, `research_datasets_create_manager`, `research_datasets_update_manager`, and related policies. The workspace migration does not consistently drop these differently named policies.

## Why it matters

If both policy sets are present, access may be allowed by either policy. That can unintentionally widen effective permissions compared with the policy author’s intended restrictions. Policy names are not precedence rules.

This is a migration-source risk. Confirm the effective policies in a disposable database and staging before treating it as a live finding.

## Required verification

1. Enumerate all policies for each research table from PostgreSQL catalogs, recording command, role, permissive/restrictive mode, USING, and WITH CHECK expressions.
2. For each table and command, evaluate the combined policy result—not each policy in isolation.
3. Test cross-project access using synthetic users and projects.
4. Test member roles independently: owner, principal investigator, researcher, reviewer, viewer, and non-member.
5. Test direct table access and RPC/function paths where present.
6. Verify update/delete behavior, audit-log write restrictions, and project-membership changes.
7. Capture expected and actual API responses plus resulting database state.

## Remediation principles

- Define one canonical policy set per table and command; explicitly remove obsolete policies during reconciliation.
- Prefer explicit least-privilege role/command policies and document intended access.
- Do not assume restrictive policy intent is achieved by adding a second permissive policy.
- Keep access-control tests in CI and staging, including cross-project denial tests.
- Perform the reconciliation only after reviewing the complete migration chain and testing on a disposable clean database.

## Status

- Source review: identified overlapping policy sets in the two research migrations.
- Deployed state: **not verified**.
- Staging state: staging is known to be empty at the last verification; this finding has not been tested against a deployed schema.
- Production: not inspected or modified.

## Related audit

See `docs/testing/research-schema-conflict-audit.md` for overlapping table-definition conflicts and bootstrap questions.
