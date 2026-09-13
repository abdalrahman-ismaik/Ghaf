# Repository organization audit

Date: 2026-09-13. Scope: recursive tracked-file inventory, runtime module boundaries, tests,
documentation, assets, scripts, hidden project tooling and GitHub contribution workflow.
This is repository maintenance, not a product behavior or release-activation change.

The subsequent user-authorized root cleanup is documented in the
[root-file guide](PUBLIC_REPOSITORY.md). It supersedes this audit's initial decision to keep
canonical product documents at the root. The measurements and validation below describe the
earlier maintenance slice; they are not new passes for concurrent Feature 016 implementation.

## Findings and treatment

| Finding at intake                                               | Treatment                                                                                    |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1,162 tracked files; useful application layers already exist    | Preserve one Expo application; publish explicit placement rules                              |
| 153 test files directly under `tests/`                          | Move into 11 subject folders; preserve all basenames and assertions; add historical path map |
| No `.github/` workflow or review templates                      | Add read-only verification workflow, focused PR template and reproducible-defect template    |
| Supporting folders have no consistent entry guides              | Add guides for source, tests, assets, scripts, specs, Workers and tools                      |
| Documentation index contains stale implementation language      | Replace stale overview with current navigation and links to per-feature authority/evidence   |
| README demo instructions describe a superseded three-page entry | Reconcile with the current original six-page onboarding and Parent/Child entry               |
| 66 protected artifacts are tracked inside ignored `output/`     | Keep exact paths and contents; enumerate exceptions and reject new tracked output            |
| Root and `docs/` contain similarly named policy documents       | Explain current root authority versus historical Feature 002 evidence; keep both             |
| Test and documentation path moves could break references        | Validate maintained navigation and the complete historical test path map                     |
| Local references, new narration and B/C/D work are present      | Preserve them outside this change; no review or packaging approval inferred                  |

## Runtime architecture assessment

The default Expo lint command omitted tests and Workers. The maintained lint command now covers
them and the new repository tooling. Four existing test warnings and one unused route binding
were corrected without changing assertions or route behavior; the translation hook remains active.

The current route/component/feature/model/service/state split is a suitable small-team structure.
Local, mock, native and remote providers have distinct locations; optional Worker code is already
outside the mobile source tree. Tests can discover domain behavior without introducing another
package workspace. See the [architecture](ARCHITECTURE.md) and
[repository map](REPOSITORY_STRUCTURE.md).

The following files deserve bounded future refactoring. Line counts were measured at intake and
are indicators for inspection, not quality scores or arbitrary size limits.

| File                                            | Intake lines | Next useful boundary                                                                                                                       |
| ----------------------------------------------- | -----------: | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/state/usePrototypeStore.ts`                |        5,352 | Characterize command ordering, then extract cohesive access/task/growth command groups while retaining one reset and transaction authority |
| `src/i18n/resources.ts`                         |        3,885 | Consider feature resource modules with unchanged keys, parity and one composed public resource object                                      |
| `src/features/tasks/recognitionSession.ts`      |        2,160 | Separate pure projections from transaction sequencing only under focused invariant tests                                                   |
| `src/services/mock/index.ts`                    |        2,148 | Extract individual provider implementations while retaining the registry's public interface                                                |
| `src/components/r002b/GrowthJourneyScreens.tsx` |        1,874 | Extract repeated presentation after the default-off/fallback behavior is characterized                                                     |

These are separate engineering tasks. This organization change does not claim to have reduced
their complexity. Splitting them by line count alone would obscure coupling without proving
better behavior.

## Validation record

- Final Vitest regression: **PASSED**, 153 files / 2,027 tests,
  `npm test -- --maxWorkers=2` (38.56 seconds).
- Strict TypeScript: **PASSED**, `npm run typecheck`.
- Expanded zero-warning lint: **PASSED**, `npm run lint`; includes app/source, tests, Workers and
  repository tooling. The five pre-existing warnings identified above were corrected.
- Maintained-source/document formatting: **PASSED**, `npm run format:check`.
- Repository navigation, all 153 historical test destinations and artifact rules: **PASSED**,
  `npm run repo:check`; four additional Node tool regressions passed.
- Workflow YAML, triggers, read-only permissions and full action commit references: **PASSED**
  using the installed YAML parser; this is local validation, not a hosted Actions execution.
- Expo local SDK compatibility: **PASSED**, `EXPO_OFFLINE=1 EXPO_NO_DOTENV=1 npx --no-install expo
install --check`. Expo warns that offline validation cannot establish registry freshness.
- Web export: **PASSED**, `EXPO_OFFLINE=1 EXPO_NO_DOTENV=1 EXPO_NO_TELEMETRY=1 npm run build:web
-- --max-workers 2`; 39 routes / 137 files, exit 0. Node color-environment warnings and Expo's
  post-export forced-shutdown warning remain recorded. A stalled sandbox attempt was interrupted;
  the successful rerun used the approved external runner.
- Diff/whitespace review: **PASSED**. Runtime changes are limited to the unused binding cleanup;
  configuration flags, dependencies/lockfiles, assets, historical evidence and other owners' work
  remain unchanged by this slice.
- Hosted GitHub Actions: **NOT RUN**; workflow prepared locally, no push or hosted run performed.
- Browser, physical Android and named-human acceptance: **NOT RUN** in this maintenance slice.

Local validation used Node 24.16.0 and npm 11.13.0 with the existing dependency installation.
CI uses the unchanged `.nvmrc` baseline; a fresh hosted install has not been observed. Machine
logs are local `/tmp/ghaf-repository-*` outputs; no generated build or log is included in Git.
The maintenance boundary is ready for integration. Product release gates remain independent.

## Remaining owner decisions

No root license or real GitHub reviewer handles were established by this audit. Licensing and
CODEOWNERS assignments need actual ownership decisions; this change does not invent either.
The user's 35% GitHub criterion motivates reviewability here; no rubric score or judging result
is inferred from source checks. Existing native, narration, content-rights and human-review gates
remain attached to their original evidence records.

CI pins the verified [checkout v6.0.2 release](https://github.com/actions/checkout/releases/tag/v6.0.2)
and [setup-node v6.0.0 release](https://github.com/actions/setup-node/releases/tag/v6.0.0), using
[workflow permissions/concurrency syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax).
The workflow uses `.nvmrc`, the committed npm lockfile and bounded workers. No dependency upgrade,
remote setting change, deployment or branch-protection claim is part of this slice.
