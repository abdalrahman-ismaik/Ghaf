# R002a Compatibility Validation Evidence

**Status:** R002A COMPATIBILITY IMPLEMENTED — AUTOMATED AND EXPORT CHECKS PASSED — BOUNDED
BROWSER-PROXY EVIDENCE RECORDED — PHYSICAL AND HUMAN EVIDENCE OPEN

**Evidence date:** 2026-09-05

> **R002A COMPATIBILITY SCOPE APPROVED — IMPLEMENTATION AUTHORIZED**
>
> **R002B PRODUCT EXPANSION — DECISIONS OPEN — IMPLEMENTATION BLOCKED**

## Authority and scope

This record covers only the selected R002a presentation refresh over the verified R001 and
Schema-3 behavior baseline. The [design-intake release gate](release-gate.md),
[R002a screen selections](../../../docs/design/stitch/releases/ghaf-r002a/SCREEN_SELECTIONS.md),
and active [Feature 003 specification](../spec.md) define that boundary.

R002a preserves the existing routes, selectors, actions, services, task lifecycle, reward
transaction, access controls, profile isolation, deterministic synthetic voice, privacy filters,
and Parent-authorized reset. It keeps `task_recycling_p0_v1`, zero reward through Child submission
and praise presentation, and the Schema-3 48→60 recognition oracle. Raw Stitch PNGs are visual
references, and their HTML/CSS/JavaScript is measurement evidence only.

This record does not release R002b, migrate the reset fixture, add Growth Journey behavior, approve
raw assets, or transfer any native or human result from R001. The
[R001 validation record](r001-validation-evidence.md) remains frozen historical evidence.

## Implementation checkpoint

| Field                       | Value                                                                                  |
| --------------------------- | -------------------------------------------------------------------------------------- |
| Worktree                    | `/home/smyk/projects/Ghaf-r002-reconciliation-20260904`                                |
| Branch                      | `integration/r3-r002a-implementation-20260904`                                         |
| Verified R001 baseline      | `76fa682` — `docs(r001): record onboarding validation evidence`                        |
| R002a validation checkpoint | `a0539e9` — `fix(r002): contain large text in Parent surfaces`                         |
| Upstream comparison         | `origin/integration/r3-r001-implementation-20260904`; local branch is 11 commits ahead |
| Evidence state              | Runtime is committed through `a0539e9`; 24 captures remain committed in `f280a43`      |

The 11 commits after the verified baseline are:

| Commit    | Recorded boundary                                               |
| --------- | --------------------------------------------------------------- |
| `086c1d7` | Objective R002 inventory and compatibility authority            |
| `512d92b` | Corrected compatibility-release status                          |
| `0f3c460` | Existing task, reward, access, voice, reset, and privacy oracle |
| `9a37c78` | Parent Home presentation                                        |
| `d02537e` | Parent Tasks and Task Builder presentation                      |
| `f425631` | Child Today and task presentation                               |
| `a59a7e6` | Parent review and support presentation                          |
| `ad6ddcb` | Child support follow-up presentation                            |
| `6d953ae` | Compatible existing Garden presentation                         |
| `f280a43` | Cross-slice RTL, accessibility, responsive, and visual evidence |
| `a0539e9` | Large-text containment fix for Parent surfaces                  |

Commit presence identifies the implemented boundaries; it is not a substitute for the final
repository, responsive, web-proxy, native, or human gates below.

## Focused automated evidence

The following command was run against the cross-slice visual checkpoint `f280a43`:

```bash
npx vitest run tests/r002a-*.test.ts tests/r001-*.test.ts tests/accessibility-announcements.test.ts tests/bilingual-typography.test.ts tests/localization-parity.test.ts tests/access-control.test.ts tests/reset-navigation.test.ts tests/operator-demo-flow.test.ts
```

Result: **PASSED** — exit 0, 16 files and 141/141 tests. This focused batch covers the R002a
behavior characterization, presentation and cross-slice source contracts, selector-derived Garden
projection, canonical task and recognition behavior, access, locale and typography parity,
accessibility announcements, route/history reset, the complete operator flow, and frozen R001
regression contracts.

The cross-slice suite rejects a fixed `390×844` runtime canvas, imported Stitch/web runtime,
disabled font scaling, one-line clamping of required header copy, unsafe footer positioning, missing
keyboard-aware shell use, inconsistent physical RTL placement, and animation-dependent dismissal.
Those source contracts do not by themselves prove native layout or assistive-technology behavior.

After the large-text containment fix in `a0539e9`, a focused four-file batch passed 22/22 tests.
The complete 38-file suite was then rerun at that checkpoint and passed 541/541 tests. Typecheck,
lint, format, Expo dependency alignment, Expo Doctor, public configuration, both production
exports, and Git whitespace validation also passed after the fix.

## Route and reset evidence

| Check                                      | Result                    | Evidence                                                                                                            |
| ------------------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Product-route inventory                    | `PASSED` automated/source | Exactly 16 product route files: preserved ten plus six frozen R001 access routes; layout and `+html` files excluded |
| R001 route preservation                    | `PASSED` source           | `git diff --name-only 76fa682..HEAD -- app/access/parent app/index.tsx` returned no paths                           |
| Raw R002 runtime import boundary           | `PASSED` source           | Final app/source scan and cross-slice test found no Stitch path, raw HTML/CSS/PNG, URL, WebView, or DOM runtime     |
| Canonical reset aggregate                  | `PASSED` automated        | `tests/prototype-state.test.ts` passed within the full 541-test suite                                               |
| Route/history reset adapter                | `PASSED` automated        | `tests/reset-navigation.test.ts` and `tests/operator-demo-flow.test.ts` passed within the focused batch             |
| Five external-service-denied cycles        | `PASSED` automated        | Covered by the current `tests/operator-demo-flow.test.ts` focused pass                                              |
| Canonical task and zero early reward       | `PASSED` automated        | `tests/r002a-behavior-characterization.test.ts` passed                                                              |
| One atomic recognition and duplicate no-op | `PASSED` automated        | Characterization and prototype-state suites passed within the final repository gate                                 |
| Public Expo configuration                  | `PASSED`                  | Public config resolved `predictiveBackGestureEnabled: true` and retained the `expo-audio` plugin                    |
| Production web export                      | `PASSED`                  | 1,491 client modules and 1,740 server modules produced 18 static routes and one approximately 3.5 MB JS bundle      |
| Android JavaScript export                  | `PASSED` bundle-only      | 1,979 modules and 35 assets produced one approximately 5.3 MB Hermes bytecode bundle                                |

The observed product route files were:

```text
/
/role
/parent
/parent/task/new
/parent/task/review
/child
/child/task
/parent/check-in
/garden
/circle
/access/parent/sign-in
/access/parent/verification
/access/parent/family-basics
/access/parent/add-first-child
/access/parent/review-create
/access/parent/family-created-success
```

## Final repository and export gate

These results were observed freshly for R002a; none is inherited from R001 or the historical
Feature 003 evidence below it in the runbook.

| Command                                                                       | Result   | Observed evidence                                                                                     |
| ----------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `npm ci`                                                                      | `PASSED` | Exit 0; 863 packages added/audited; two deprecation warnings and 13 moderate vulnerabilities reported |
| `npm run typecheck`                                                           | `PASSED` | Exit 0                                                                                                |
| `npm run lint`                                                                | `PASSED` | Exit 0                                                                                                |
| `npm run format:check`                                                        | `PASSED` | Exit 0                                                                                                |
| `npm test`                                                                    | `PASSED` | Exit 0; 38 files and 541/541 tests                                                                    |
| `npx expo install --check`                                                    | `PASSED` | Expo package alignment check completed successfully                                                   |
| `npx expo-doctor`                                                             | `PASSED` | 21/21 checks passed                                                                                   |
| `npx expo config --type public`                                               | `PASSED` | Public-safe configuration resolved; predictive Back and `expo-audio` remained configured              |
| `npx expo export --platform web --output-dir "$r002a_export_dir/web"`         | `PASSED` | 1,491 client modules, 1,740 server modules, 18 static routes, approximately 3.5 MB JS                 |
| `npx expo export --platform android --output-dir "$r002a_export_dir/android"` | `PASSED` | 1,979 modules, 35 assets, approximately 5.3 MB Hermes bytecode; not a native build or device result   |
| Product-route source inventory                                                | `PASSED` | Exactly 16 product route files                                                                        |
| `git diff --check 76fa682..a0539e9`                                           | `PASSED` | No committed-range whitespace errors                                                                  |

`npm ci` reported deprecation warnings for `uuid@7.0.3` and `eslint@9.39.5`, plus 13 moderate
audit findings. No automatic audit fix or dependency upgrade was applied because dependency
remediation is outside this presentation-only commit boundary.

Both exports used ephemeral `/tmp` destinations so generated output did not enter the source diff:

```bash
r002a_export_dir="$(mktemp -d /tmp/ghaf-r002a-export.XXXXXX)"
npx expo export --platform web --output-dir "$r002a_export_dir/web"
npx expo export --platform android --output-dir "$r002a_export_dir/android"
```

## Responsive and visual evidence

Twenty-four browser-proxy captures are committed at `output/playwright/r002a/`. The first 21 cover
the selected Arabic route and route-state sequence at `390×844`; the remaining samples cover
English Garden at `430×932`, Arabic Parent Home at `320×568`, and Arabic Parent Home at `768×1024`.
They are secondary visual evidence, not native screenshots or a pixel-diff approval system.

| Exercise                                                                    | Result                            | Observed evidence                                                                                                                                |
| --------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Selected Arabic compositions at 390×844                                     | `PASSED` browser-proxy capture    | 21 retained route/state captures cover Parent Home through recognized Garden with no console errors; they remain comparison evidence             |
| Arabic Parent Home at 320×568                                               | `PASSED` browser proxy            | Retained compact-width capture preserves natural scroll and reachable navigation                                                                 |
| English Garden at 430×932                                                   | `PASSED` sampled browser proxy    | Retained LTR sample preserves live values and wrapping; no matched English Stitch PNG exists                                                     |
| Arabic Parent Home at 768×1024                                              | `PASSED` browser proxy            | Retained wide sample stays bounded rather than stretching into a fixed mobile canvas                                                             |
| Widths 320, 360, 390, 430, and 768                                          | `PASSED` measured browser proxy   | Selected key screens reported zero document-level horizontal overflow at every width; 360 was measured but not retained as a screenshot          |
| Full English LTR journey                                                    | `PASSED` browser proxy            | Onboarding, task creation/execution/submission, support/follow-up/resubmission, approval, +12 and 48→60, canopy/League/Reward, and Garden passed |
| Loading, empty, validation, recoverable error, submitting, and success      | `PASSED` automated/source         | State contracts and representative empty, support, submitting, waiting, praise, and success compositions passed; not every state has a capture   |
| Interrupted recovery and duplicate recognition                              | `PASSED` automated                | Characterization, operator, reset, and full suites preserve lifecycle state and prevent duplicate reward                                         |
| Reduced motion                                                              | `PASSED` source; native `NOT RUN` | Cross-slice tests require optional motion and animation-independent dismissal; Android setting was not exercised                                 |
| Keyboard avoidance                                                          | `PASSED` source; native `NOT RUN` | Shared keyboard-aware contracts passed; actual Android IME behavior was not exercised                                                            |
| 200% text                                                                   | `PASSED` browser approximation    | At 390 and 320, Parent Home had zero document overflow and no visible text escaped the viewport after `a0539e9`; Garden also remained at zero    |
| Accessibility roles, state, order, announcements, modal focus, and 48dp use | `PASSED` source; native `NOT RUN` | Focused assertions passed; TalkBack, physical focus, and physical target measurement require a device                                            |
| Browser console                                                             | `PASSED` secondary evidence       | Playwright: zero app errors; long Arabic session had 7 font-preload warnings and fresh English had 0 warnings; Metro logged the R001 deprecation |
| Browser request ledger                                                      | `NOT RUN`                         | Source/export scans establish no imported raw or remote R002 runtime asset; no separate network-request trace was retained                       |

Browser evidence may pass only the named web-proxy dimensions. It cannot pass Android safe areas,
predictive Back, keyboard/IME, prepared playback, permissions, TalkBack, physical touch, OS font
scale, or native reduced motion.

## Raw R002 intake preservation

The raw intake remains in the original worktree at
`/home/smyk/projects/Ghaf/docs/design/stitch/releases/ghaf-r002/`. It was inspected read-only and
was not copied into this integration worktree.

| Measure                               | Observed result |
| ------------------------------------- | --------------: |
| Immediate export directories          |              74 |
| `screen.png` files                    |              71 |
| `code.html` files                     |              70 |
| Complete PNG/HTML pairs               |              69 |
| Files ending in `:Zone.Identifier`    |             148 |
| Registered PNG/HTML digests checked   |             141 |
| Registered PNG/HTML digest matches    |         141/141 |
| Registered PNG/HTML digest mismatches |               0 |

The original worktree remained at `ecbfb3a2a89fe7eefa23e8547aeb5216724ee56c`. Its tracked
working tree and index produced no diff; normal untracked status reported only
`docs/design/stitch/releases/ghaf-r002/`.

This proof is intentionally bounded. The intake contains seven non-Zone Markdown files in addition
to the 141 registered PNG/HTML files, but no canonical pre-implementation digest baseline was
stored for those Markdown files. Therefore the defensible statement is **141/141 registered
PNG/HTML hashes matched**. This record does not claim that all 148 non-Zone raw files were proven
byte-for-byte unchanged.

## Divergent local commit preservation

Each historical commit was checked with `git merge-base --is-ancestor <commit> HEAD` against
`a0539e9`; all six commands returned exit 1, meaning none is an ancestor of the R002a branch.

| Historical commit | Subject                                           | Result                     |
| ----------------- | ------------------------------------------------- | -------------------------- |
| `f63e39f`         | Record Revision 2 and Ghaf R001 partial release   | `UNAPPLIED` / non-ancestor |
| `1dda546`         | Add deterministic Parent access domain            | `UNAPPLIED` / non-ancestor |
| `d217520`         | Add R001 native design system and access controls | `UNAPPLIED` / non-ancestor |
| `5f3f1a2`         | Implement Welcome and Parent setup journey        | `UNAPPLIED` / non-ancestor |
| `96cad3b`         | Define Growth Journey product guardrails          | `UNAPPLIED` / non-ancestor |
| `ecbfb3a`         | Plan Stitch-gated Growth Journey implementation   | `UNAPPLIED` / non-ancestor |

`git cherry -v HEAD backup/feature-003-local-pre-r002-reconciliation-20260904` reported `+` for all
six commits. This establishes branch ancestry and patch-history status; it does not imply that the
remote baseline lacks separately reviewed equivalent behavior.

## Native Android and human evidence boundary

| Gate                                                                      | Result    | Required next evidence                                                                                   |
| ------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| Physical Android install and Arabic/English journey                       | `BLOCKED` | A named usable build, device model, Android version, operator, observer, date, and complete route result |
| Android predictive/native Back and reset history                          | `NOT RUN` | Direct exercise on that named build/device                                                               |
| Native keyboard/IME and safe-area behavior                                | `NOT RUN` | Direct editable-state and inset observations                                                             |
| TalkBack order, focus, announcements, and modal containment/restoration   | `NOT RUN` | Named build/device, settings, reading order, and findings                                                |
| Native offline launch and deterministic continuation                      | `NOT RUN` | Connectivity-disabled journey on the named device                                                        |
| Prepared playback and permission behavior                                 | `NOT RUN` | Direct native observation; Android JavaScript export is insufficient                                     |
| Native reduced motion, 130%/200% font scale, contrast, and physical touch | `NOT RUN` | Named accessibility settings and measured observations                                                   |
| Fluent Arabic/UAE copy review                                             | `NOT RUN` | Named reviewer, exact R002a copy version, findings, and disposition                                      |
| Child-safeguarding review                                                 | `NOT RUN` | Named reviewer, findings, and disposition                                                                |
| Sustainability-claim review                                               | `NOT RUN` | Named reviewer, reviewed task/claim version, and disposition                                             |
| Accessibility review                                                      | `NOT RUN` | Named reviewer, named build/surface/settings, findings, and disposition                                  |
| Five timed rehearsals and three-person comprehension                      | `NOT RUN` | Operators/observers, five durations, answers, failure notes, and date                                    |

Physical Android is `BLOCKED`: `adb devices` listed no attached device and `ANDROID_HOME` was unset
in the validation environment. The individual native exercises remain `NOT RUN`; neither the
focused source tests, web proxy, nor an Android JavaScript export may upgrade them.

## Remaining deviations and assumptions

- Selected R002a exports are Arabic-led and there are no matched English Stitch reference PNGs.
  The complete equivalent English journey passed in the browser proxy, but only its Garden state
  has a retained screenshot and no English visual approval is inferred.
- The Parent Home source is a naturally scrolling 402×1600 composition, and most selected mobile
  references are 706×1600. A 390×844 comparison is a viewport exercise, not a fixed-canvas target.
- Eleven raw HTML files disable browser zoom, 17 directories reference remote images, and all raw
  HTML contains generated web dependencies. Those choices are rejected for native runtime.
- Remote images and the two standalone illustration PNGs retain `UNVERIFIED` provenance and were
  `NOT USED` by the R002a runtime. Final app/source and committed-path scans found no raw-intake,
  remote-image, or standalone-export asset import; the presentation uses repository-owned and
  code-native assets.
- Width 360 was measured with zero document overflow but has no retained capture. The retained set
  also omits every conservative error/loading state.
- After `a0539e9`, a direct-text `200%` browser approximation at 390 and 320 reported zero document
  overflow and no visible text outside the viewport. All four Parent navigation tabs reported
  equal client and scroll widths—85 pixels at 390 and 67 pixels at 320—and canopy text stayed
  within its card. The canopy container's remaining scroll width belongs only to intentionally
  clipped decorative circles. This proxy result does not validate native OS font scaling.
- Seven font-preload warnings accumulated in the long-lived Arabic browser session. No console
  error was observed there, and the fresh complete English journey's Playwright counter had zero
  errors and warnings.
- Metro's web-proxy output logged the existing React Native Web `props.pointerEvents` deprecation
  from the frozen R001 `AccessShell`. It is not an app failure and was not mixed into this R002a
  presentation release, but it remains a maintenance item.
- The final Expo exports logged a build-process warning that `NO_COLOR` was ignored because
  `FORCE_COLOR` was set. Both exports completed successfully; this was not an app runtime warning.
- Newly drafted privacy or safety wording retains named human-copy review status `NOT RUN`.
- Static/source assertions do not prove responsive layout, focus order, screen-reader behavior,
  native gestures, physical target size, or OS font scaling.
- Optional live Parent refinement remains implementation `BLOCKED` and validation `NOT RUN`; the
  deterministic prepared path remains the required competition behavior.

## R002b deferrals

The following remain behind **R002B PRODUCT EXPANSION — DECISIONS OPEN — IMPLEMENTATION BLOCKED**:

- the 108→120 lifetime-Seed/reset migration and any 120→180 cumulative progression;
- Child Impact Path;
- Badge Gallery and Badge Detail;
- Mangrove Learning and its equal-credit accessible alternative;
- Parent selected-Child Progress and Achievements;
- revised combined RevealBundle behavior;
- Shared Growth or Parent shared-garden participation changes; and
- cumulative Garden Next Stage.

No R002a focused pass, export, screenshot, or native result releases these items. Tasks T154–T158
remain blocked until their separate product, design, migration, test, and release gates are met.

## Final handoff condition

R002a is implemented and its automated, export, and bounded browser-proxy evidence is recorded
through `a0539e9`. It is ready for documentation integration, not native or human demo acceptance.
The exact remaining gates are:

1. install this checkpoint on a named Android device and exercise Arabic/English, system Back,
   keyboard/IME, safe areas, TalkBack, reduced motion, offline continuation, prepared playback,
   physical touch targets, and 130%/200% font scaling;
2. complete the named Arabic/UAE copy, safeguarding, sustainability, accessibility, comprehension,
   and rehearsal reviews; and
3. keep every R002b task and surface blocked until its separate product, design, migration, test,
   and release authority exists.
