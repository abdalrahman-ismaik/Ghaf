# Feature 003 RED-to-GREEN Evidence

**Worktree**: `feature/003-family-growth-garden`
**Date**: 2026-08-26
**Scope**: deterministic P0 tests only; native and human evidence is not inferred

## Foundational RED Gate — T009–T017

**Status**: PASSED as an intentional RED gate

Command:

```bash
npx vitest run tests/task-lifecycle.test.ts tests/reward-matrix.test.ts tests/garden-progression.test.ts tests/task-catalog.test.ts tests/privacy-projection.test.ts tests/assistant-safety.test.ts tests/prototype-state.test.ts tests/localization-parity.test.ts tests/mock-core-flow.test.ts
```

Observed result:

- Exit code: `1`, as required before Feature 003 production implementation.
- Test files: `9 failed (9)`.
- Seven suites stopped at missing planned Feature 003 module boundaries:
  `tasks/lifecycle`, `rewards/policy`, `garden/progression`, `tasks/demoContent`,
  `circle/projection`, and `assistants/policy` (the shared task-content import affects two suites).
- The two store suites imported the existing harness and ran 29 assertions; all failed at the
  intended missing `resetPrototype`/Feature 003 store-command boundary.
- Vitest itself started normally; failures were not caused by configuration, syntax, or a broken
  test harness.
- Both test-author boundaries passed Prettier before release.

This evidence was recorded before any T018–T035 production file was changed.

## Foundational GREEN Gate — T036

**Status**: PASSED at the current implementation checkpoint

Command, rerun 2026-08-27 at 12:23:46 Asia/Dubai:

```bash
npx vitest run tests/task-lifecycle.test.ts tests/reward-matrix.test.ts tests/garden-progression.test.ts tests/task-catalog.test.ts tests/privacy-projection.test.ts tests/assistant-safety.test.ts tests/prototype-state.test.ts tests/localization-parity.test.ts tests/mock-core-flow.test.ts
```

Observed result:

```text
Test Files  9 passed (9)
Tests       147 passed (147)
```

The deterministic domain, providers, state aggregate, localization policy, privacy projection,
assistant fallback, reward matrix, reset sources, and five offline store cycles are GREEN in the
current dirty worktree. This does not replace the final T090 rerun or any native/human gate.

## Story RED gates — T038, T046, T052, T058, T064, T073

**Status**: NOT RUN as historical RED gates

The six story tests exist and are GREEN now, but no trustworthy pre-implementation command output
was recorded for their required individual RED runs. The laptop interruption and subsequent
recovery do not justify reconstructing or fabricating those failures after the production behavior
exists.

Therefore:

| Historical task | Intended file                        | RED evidence                                     |
| --------------- | ------------------------------------ | ------------------------------------------------ |
| T038            | `tests/parent-task-flow.test.ts`     | **NOT RUN / not recorded before implementation** |
| T046            | `tests/child-task-flow.test.ts`      | **NOT RUN / not recorded before implementation** |
| T052            | `tests/parent-check-in-flow.test.ts` | **NOT RUN / not recorded before implementation** |
| T058            | `tests/garden-circle-flow.test.ts`   | **NOT RUN / not recorded before implementation** |
| T064            | `tests/operator-demo-flow.test.ts`   | **NOT RUN / not recorded before implementation** |
| T073            | `tests/parent-overview.test.ts`      | **NOT RUN / not recorded before implementation** |

This is a process-evidence gap, not a claim that the current behaviors fail.

## Story GREEN checkpoint — T044, T050, T056, T062, T070, T077

Command, run 2026-08-27 at 12:23:40 Asia/Dubai:

```bash
npx vitest run tests/parent-task-flow.test.ts tests/child-task-flow.test.ts tests/parent-check-in-flow.test.ts tests/garden-circle-flow.test.ts tests/operator-demo-flow.test.ts tests/parent-overview.test.ts tests/accessibility-announcements.test.ts
```

Observed result:

```text
Test Files  7 passed (7)
Tests       98 passed (98)
```

Taken with the disjoint foundational batch above, that pre-convergence checkpoint covered 16 files
and 245 passing tests. The integration owner also observed `npm test` at 16 files / 245 tests before
the convergence audit.

## Post-convergence GREEN checkpoint — T091–T102

The fresh P0 audit appended T091–T101 for behaviors the earlier story assertions did not fully
cover, and T102 for Expo patch alignment. Domain and route owners completed those tasks and released
their boundaries.

Fresh full-suite command:

```bash
npm test
```

Observed result:

```text
Test Files  16 passed (16)
Tests       265 passed (265)
```

Additional independent evidence:

- domain-focused rerun: 5 files / 139 tests passed; typecheck passed;
- route convergence handoff: 68 focused tests, typecheck, lint, Prettier, and `git diff --check`
  passed; and
- T102: `npx expo install --check` returned `Dependencies are up to date` without adding a new
  library.

These GREEN results do not retroactively supply the missing historical story RED gates above. The
fresh final browser/review/diff pass remains documented separately in `DEMO_RUNBOOK.md`.

## Final-review Coach binding regression

After convergence, root reproduced an intended RED where an accepted adjusted version-2 task could
receive the stale canonical version-1 Coach fixture (`approvedTaskVersion` was observed as `1`). The
provider/store/route fix now keeps the prepared Coach strictly canonical-v1-bound and fails closed
for adjusted tasks to approved content plus a static trusted-adult exit. The focused regression and
typecheck pass. The post-fix core rerun then passed typecheck, lint, format check, and the full suite
at 16 files / 266 tests.

The recorded Coach RED command was:

```bash
npx vitest run tests/child-task-flow.test.ts -t "rebinds prepared Coach"
```

It produced one intended failure with 12 tests skipped. The revised focused regression then passed.

## Final acceptance-review RED→GREEN checkpoint

The final read-only audit reproduced eight concrete boundary defects before their fixes:

- hazardous English/Arabic task paraphrases bypassed validation;
- a diagnosis embedded in an otherwise observable Parent-summary correction was accepted;
- mixed action-plus-character praise was accepted;
- the proposed safe equivalent was content-identical to the current task;
- leaving the kind-retry state could prevent check-in re-entry;
- a mismatched task version could use the duplicate-assignment no-op;
- entering `/garden` consumed celebration state; and
- a valid post-goal circle total resolved to the unavailable fallback.

RED batch A ran the Parent check-in, Parent task, and garden/circle suites and observed **4 intended
failures / 44 passes (48 total)**. RED batch B ran the assistant-safety, Parent check-in, and
garden/circle suites and observed **4 intended failures / 105 passes (109 total)**.

Exact GREEN command:

```bash
npx vitest run tests/assistant-safety.test.ts tests/parent-check-in-flow.test.ts tests/garden-circle-flow.test.ts tests/parent-task-flow.test.ts
```

Observed result:

```text
Test Files  4 passed (4)
Tests       121 passed (121)
```

Typecheck also passed after these fixes.

## Adversarial replay and final GREEN

Further independent replay found additional variants after the 121-test checkpoint. The recorded
evidence was:

- exact duplicate choice/identity: **1 intended RED / 13 total**, then **13/13 GREEN**;
- stricter bilingual task/summary/praise safety boundary: **5 intended RED / 72 passes**, then
  **78/78 GREEN**, with typecheck and formatting passing; and
- four-suite stable targeted replay before the last variants: **4 files / 127 tests GREEN**.

The exact shell commands for those three intermediate worker batches were not retained, so this
ledger does not invent them. Their assertions are included in the final full-suite result below.

The later fixes closed semantic unsafe-task and summary/praise appends, malformed successful Guide
content, role bypasses, non-P0 Child execution, incomplete duplicate identity, and check-in/receipt
referential mismatches. Independent runtime replay then passed **23/23 probes** and reported no
remaining source-verifiable HIGH/MEDIUM P0 finding.

The reset suite was also expanded to run five consecutive exact atomic resets from every named
source while preserving counters through any required Child-to-Parent switch. Its focused file
passed **24/24**.

Final full-suite command, run on the settled worktree:

```bash
npm test
```

Observed result:

```text
Test Files  16 passed (16)
Tests       287 passed (287)
```

That checkpoint also passed `npm run typecheck`, `npm run lint`, `npm run format:check`, and
`git diff --check`.

## Mounted reset RED→GREEN and final suite

A mounted English-garden reset replay supplied a real RED that the visible-text/store checks had
missed: the URL and strings returned to Arabic `/`, but `html lang` remained `en`, computed direction
remained LTR, and one history shape allowed Back to reach stale `/parent/check-in`. Locale
synchronization plus a marker-based history boundary added a seventeenth test file and initially
made two Back actions remain at `/`.

Independent review then supplied a deeper second RED. With the exact stack
`/` → `/role` → `/parent` → `/garden` → `/circle` → reset, a third real Back action reached stale
`/garden` because Expo Router asynchronously replaced the root history state and stripped the
marker. The focused regression intentionally simulated that state overwrite and failed **1/2**
before the fix. The durable boundary now recognizes both the marker and the reset-root pathname;
the focused file passed **2/2**, and typecheck passed.

Post-fix Firefox evidence from bundle `entry-b6a1a8fc6cff35694e752042443290f8.js` observed URL `/`,
`html lang=ar`, `html dir=rtl`, computed RTL, and Arabic selected. Six consecutive real Back actions
all remained at `/` with the entry visible and no private route. An independent reviewer replayed
the same exact stack and confirmed the six-Back result, zero console errors, and no scoped
HIGH/MEDIUM finding.

Final full-suite command:

```bash
npm test
```

Observed result:

```text
Test Files  17 passed (17)
Tests       289 passed (289)
```

The final settled worktree also passed `npm run typecheck`, `npm run lint`,
`npm run format:check`, `npx expo install --check`, public Expo config, web export, the Impeccable
detector (`[]`), and `git diff --check`. None of these GREEN results retroactively supplies the six
missing historical story RED gates. Physical Android and human-review evidence remain separate and
open.

## Phase 11 professional-audit RED→GREEN — 2026-08-28

Fresh domain RED evidence reproduced six failures with 126 passing, including a real 5006 ms Parent
Guide hang. The remediated focused domain batch then passed 132/132. Recognition now derives its
key internally and validates the assignment/task/Child/version/submission/check-in/plan chain;
reviewed alternatives retain coherent versions and Parent provenance; and the 1500 ms Guide
deadline ignores late completion.

The visual confirm round supplied two additional focused REDs:

- progressive Child definition disclosure source contract: **1 failed / 31 passed** before the
  four-line accessible disclosure was implemented; and
- specific unsafe Parent wording recovery: **1 failed / 20 passed** before the bilingual recovery
  message replaced the generic retry.

Both focused batches turned GREEN. Final settled commands:

```text
npm run typecheck     PASSED
npm run lint          PASSED
npm run format:check  PASSED
npm test              17 files / 305 tests PASSED
git diff --check      PASSED
Impeccable detector   []
Expo web export       12 routes PASSED
```

The persisted Impeccable critique moved from 25/40 to 35/40 with zero P0/P1 findings remaining in
the inspected web/source boundary. This evidence does not fill the historical pre-implementation
story RED gaps and does not substitute for Android or named-human review.
