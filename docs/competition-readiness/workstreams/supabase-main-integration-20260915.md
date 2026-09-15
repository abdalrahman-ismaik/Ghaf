# Main integration — 2026-09-15

The user explicitly requests “add them to main also” after approving publication of
`feature/019-normalized-supabase-family-runtime` at `ed14804` to the public Ghaf repository.
Root integrates in the isolated `output/main-integration-20260915` worktree based on
`origin/main` at `35631f7`. The original checkout and its user-owned lockfile/skill edits remain.

## Ownership and scope

Root owns Git integration, all merge conflicts, shared config/service/model/resource boundaries,
Feature 019/020 integration artifacts, documentation and final serialized validation. Three
read-only reviewers cover SQL compatibility, auth/service integration and UI preservation.
Any later writer receives an exact boundary here before editing. No overlapping writes,
hosted reset/deletion, history rewrite or source removal is authorized.

Allocated writers after read-only audit:

- Auth: shared ParentAccount interface/provider, PilotGate/PilotAccountView plus separately named
  normalized gate/views, `src/features/cloudFamily/{config,service,childService}.ts`, CloudAccessGate,
  `tests/access/pilot-account-ui.test.tsx`, and normalized access/config/service/credential tests.
- UI: FamilyConnectionPlan, Parent home/family routes, task-history test, normalized snapshot
  parser and reward/goal fixtures for compatibility with existing academic dates.
- SQL: `scripts/backend/verify-cloud-runtime.mjs` and its explicit isolated validation scope only.
- Root: remaining conflicts, model/resource namespace split, specification/operating documentation,
  integration tests, package/config/lockfile reconciliation and final execution. Writers do not
  commit, run heavy validation, edit others' boundaries or revert one another's changes.

## Preservation contract

- Preserve the deployed Feature 020 application, its `public.app_*` authority, existing secure
  Parent/Child access, Realtime, task/growth/study/messages and recent motion/accessibility fixes.
- Preserve Feature 019's complete normalized runtime and UAE Masroofi card. Select that runtime
  only through an explicit build configuration, never an RPC failure, empty account or guessed
  profile mapping. The deployed runtime remains the default.
- Give incompatible TypeScript models, translation resources and service methods separate names.
  Keep each runtime's actor, session, request, receipt and credential contracts internally coherent.
- Preserve all migrations and historical evidence. Authored Feature 019 SQL does not imply hosted
  installation. Evaluate combined SQL locally; reconcile hosted ordering before any later apply.
- Preserve both implementations' features and all existing records. No automatic family transfer
  or fabricated Seed, recognition, money, learning or League evidence is introduced by this merge.

## Validation

All eighteen textual conflicts are resolved. The stronger deployed identity/session provider and
both family experiences are retained, with separate normalized models/resources/RPC envelopes.
No tracked file is deleted. The deployed lockfile, including its YAML security fix, remains intact;
the original checkout's separate user edits are unchanged. All three helpers released ownership.

| Check                                   | Result and exact scope                                                                                                                                                               |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Clean dependency installation           | PASSED: 1,002 packages from the existing main lockfile. The first sandboxed download failed; its partial files were preserved before the successful isolated install.                |
| TypeScript                              | PASSED again after all auth/test integration changes.                                                                                                                                |
| Lint                                    | PASSED complete application/test/script check.                                                                                                                                       |
| Formatting                              | PASSED complete maintained-file check after four namespace-related line wraps.                                                                                                       |
| Full initial regressions                | 3,846 passed, 7 opt-in integration skips; two test failures and one suite setup failure were repaired. No production runtime test failure remained.                                  |
| Corrected affected regressions          | PASSED: 306 tests in 13 files, including both runtime contracts and Child access cleanup. Fixes corrected a mock Platform export, translation mock namespace and merged route count. |
| Normalized SQL lane                     | PASSED: 447 assertions and 25 SQL-to-app response contracts. Six selected migrations/suites; Feature020/Cron explicitly excluded from this PGlite lane.                              |
| Startup and repository                  | PASSED: 12 launcher tests, five repository tests, navigation/artifact checks and whitespace/conflict checks.                                                                         |
| Combined database and clean web export  | GitHub backend/repository workflows are the final integration gate before updating main; results will be linked after execution.                                                     |
| Hosted project mutation                 | NOT RUN: this Git merge applies no hosted SQL or Auth configuration.                                                                                                                 |
| Physical Android and named human review | NOT RUN for this merge; existing evidence retains its original source scope.                                                                                                         |

The isolated SQL receipt is
`output/supabase-migration/sql-verification-2026-09-15T07-40-59-914Z.json`. Test logs and original
conflict stages remain under ignored `output/integration/`. The original published Feature019
commit `ed14804` separately passed both repository and backend CI; that evidence does not establish
combined migration compatibility. Main retains the deployed runtime until explicit normalized
installation and selection. No automatic cross-runtime import or hosted activation is part of delivery.
