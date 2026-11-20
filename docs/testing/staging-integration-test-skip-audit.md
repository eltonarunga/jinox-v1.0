# Staging Integration Test Skip Audit

## Scope

Review of `.github/workflows/ci.yml`, `package.json`, and `tests/integration/research-access.test.mjs`. Source review only; no tests were executed here and no staging credentials or secrets were accessed.

## Finding: integration tests can report a successful CI job while all staging checks are skipped

The CI workflow runs `npm run test:integration`. The integration test suite checks for staging-specific environment variables (project URL, anon key, project/dataset fixture IDs, and owner/researcher/reviewer/viewer/unrelated-user tokens). When the base variables are missing, it assigns `baseTest = test.skip`, skipping the base tests. Additional tests have skip conditions for item, asset, annotation, asset-review, and curation fixture variables. The test file adds a skipped prerequisite test when base variables are absent.

This means a green workflow run alone does not prove staging authorization tests executed. It may mean only the test runner completed with tests skipped because staging fixtures were not configured.

## Recommendations

1. Make the distinction visible in CI: report unit tests separately from staging integration tests.
2. In ordinary pull-request CI without staging credentials, explicitly report integration tests as **not run** rather than treating them as verified.
3. In a dedicated staging integration workflow, require the expected staging environment variables and fixtures. If any are missing, fail the preflight step instead of silently skipping.
4. Use GitHub Environment protections and staging-only credentials for that workflow; do not use production tokens or clinical data.
5. Keep staging tests manual/controlled until synthetic fixtures are provisioned, and publish a clear test summary showing passed, failed, and skipped counts.
6. Ensure negative access tests (unrelated user, viewer restrictions, self-review denial, direct insert denial, immutable release/audit records) are not silently skipped in the staging validation run.

## Status

- Source finding: confirmed from the integration test file's conditional skip logic.
- Runtime CI behavior: not independently executed during this audit; workflow logs should be inspected to determine the current skipped test count.
- Staging test execution: not confirmed.
- Production: not accessed or modified.
