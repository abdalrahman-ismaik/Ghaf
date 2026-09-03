# Feature 003 Story Evidence

**Recorded**: 2026-08-27 12:23; final post-reset-fix validation update
**Branch**: `feature/003-family-growth-garden`
**Worktree**: dirty implementation worktree; no commit hash represents this checkpoint
**Scope**: current deterministic implementation, focused automated checks, and secondary web
proxy observations only

This ledger starts Feature 003 evidence fresh. It does not inherit a Feature 002 pass, and it does
not convert browser or source evidence into physical-Android, native-accessibility, or human-review
evidence.

## Automated story checkpoint

Command:

```bash
npx vitest run tests/parent-task-flow.test.ts tests/child-task-flow.test.ts tests/parent-check-in-flow.test.ts tests/garden-circle-flow.test.ts tests/operator-demo-flow.test.ts tests/parent-overview.test.ts tests/accessibility-announcements.test.ts
```

Observed at 12:23:40 Asia/Dubai:

```text
Test Files  7 passed (7)
Tests       98 passed (98)
```

This is the original story checkpoint. Final validation is recorded below.

A later P0 gap audit appended convergence tasks T091–T101. Domain and route convergence completed
those tasks. The integration owner then observed the post-convergence suite at **16 files / 265
tests passed**; it also independently reran the five domain-focused files at **139 tests passed**,
while the route handoff reported **68 focused tests passed**.

## Post-convergence automated checkpoint

Command:

```bash
npm test
```

Observed 2026-08-27 after T091–T101:

```text
Test Files  16 passed (16)
Tests       265 passed (265)
```

The post-convergence coverage includes reviewed Keep-mine safety, bounded fact correction,
action-specific praise, two-action praise/recognition, smaller/equivalent resolution and Child
choice, persistent future phase review, preview mappings, prepared check-in evidence, observable
retry/resume, deep-link replacement, and canonical assistant disclosures.

A subsequent root review reproduced an adjusted-task Coach binding defect: accepted version-2
content could receive the canonical version-1 Coach fixture. The fix keeps the prepared provider
strictly bound to canonical v1 and fails closed for adjusted tasks to the approved positive action,
one stop/ask-an-adult step, and a static trusted-adult/unavailability notice. Its focused regression
and the post-fix typecheck, lint, format check, and full **16 files / 266 tests** pass.

A final acceptance audit then reproduced eight more boundary defects: hazard-paraphrase task text,
embedded diagnosis context, mixed action-plus-trait praise, an unchanged safe-equivalent proposal,
retry re-entry, non-exact duplicate assignment approval, garden entry mutation, and post-goal circle
display. Two focused RED batches recorded eight intended failures. After the fixes, the exact
four-file focused batch passed **121 tests** and typecheck passed.

Further adversarial replay closed semantic append, malformed Guide result, role, Child identity,
duplicate-choice identity, and check-in referential-integrity variants. An independent replay passed
23/23 runtime probes with no remaining source-verifiable HIGH/MEDIUM P0 finding. The reset suite was
then expanded to five consecutive exact resets from every named source and passed 24/24. Final fresh
commands passed typecheck, lint, format check, `git diff --check`, and the full suite:

```text
Test Files  16 passed (16)
Tests       287 passed (287)
```

A deeper mounted reset replay then found stale English document direction and Back history. After
the fix, that checkpoint passed typecheck, lint, format check, `git diff --check`, and the expanded
full suite at **17 files / 289 tests**. Its bundle completed both Arabic and English ten-route
Firefox journeys. English-garden reset produced Arabic `lang`/RTL/computed direction, and two real
Back actions remained at `/` with no private route.

The subsequent professional MVP audit hardened referential integrity, reviewed alternatives,
Guide decision/timeout behavior, Child lifecycle actions, role handoff, Parent composition, and the
garden hierarchy. The final post-audit checkpoint passed **17 files / 305 tests**, typecheck, lint,
format check, `git diff --check`, a 12-route static export, and complete Arabic RTL and English LTR
390×844 web-proxy journeys with zero runtime errors or horizontal overflow. Android and named-human
statuses did not change.

## Per-story evidence

| Story                                               | Automated result                                                                                                                                                                                                                                                | Web-proxy observation                                                                                                                                                                                                                                  | Status and boundary                                                                                                                                   |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| US1 — Parent approves a safe task                   | `tests/parent-task-flow.test.ts`: complete fields, fail-closed bilingual authored-action review, Guide validation, Parent/Child identity and role boundaries, exact-repeat assignment identity, Accept/Keep, explicit approval, and zero early counters covered | Both final-bundle journeys exposed prerequisite gating, eight categories, distinct P0 template, prepared Guide original/proposal, and complete safety/reward review before approval                                                                    | **PASSED automated; PASSED Arabic and English final-bundle web proxy.** Android remains open                                                          |
| US2 — Child chooses and completes with bounded help | `tests/child-task-flow.test.ts`: wrong-profile guards, separate choose/start, prepared task-bound Coach, prospective smaller request, optional media/removal/fallback/reflection, permitted help, and zero-reward submission covered                            | Both final journeys exercised choose/open-start, bounded Coach/adult exit, prepared media/transcript, acknowledgement, and submission; adjusted-task Coach unavailable/trusted-adult exit was also mounted                                             | **PASSED automated; PASSED Arabic and English final-bundle web proxy.** Native media/TalkBack remain unverified                                       |
| US3 — Parent retries or confirms once               | `tests/parent-check-in-flow.test.ts`: no-loss retry/re-entry, distinct smaller/equivalent plans, referential checks, semantic praise rejection, praise-first state, immutable receipt, five duplicate no-ops, and future-only review covered                    | Main confirmation, duplicate already-confirmed state, distinct safe equivalent, and English no-loss retry/open-start resume were mounted                                                                                                               | **PASSED automated; PASSED main and sampled branch web proxy.** Native behavior remains open                                                          |
| US4 — Correct symbolic/shared growth                | `tests/garden-circle-flow.test.ts` plus `tests/accessibility-announcements.test.ts`: exact four-counter delta, one coarse event, projection rejection, static outcome, deny-by-default fallbacks, and one concise consequence announcement covered              | Arabic garden showed Salem/Mangrove 60/60 Sapling and canopy 20/25; Arabic circle showed 12/12. English garden showed the equivalent symbolic/nonfinancial claim and 60/60 state. Captured screenshots are under `output/playwright/feature003-audit/` | **PASSED automated; PASSED sampled Arabic/English web proxy.** Reduced-motion behavior is automated/source evidence only; native setting is `NOT RUN` |
| US5 — Cooperative Parent overview                   | `tests/parent-overview.test.ts`: one combined canopy DTO, distinct supports, structured seven-day summary, bounded local bilingual fact correction, revalidation/fallback, and prohibited-language rejection covered                                            | Arabic Parent overview showed one 19/25 combined canopy, distinct Salem/Alya next actions/support, synthetic/private boundary, and the bounded correction editor. The editor was opened and cancelled without changing the record                      | **PASSED automated; PASSED Arabic web proxy for the sampled states.** Named safeguarding/content review remains `NOT RUN`                             |
| US6 — Bilingual offline operator/reset              | Operator/reset suites cover exact routes, guarded roles/deep links, locale switching, history replacement, five denied-provider cycles, missing media, and five consecutive exact resets from every named source                                                | Final Arabic and English journeys each traversed ten routes. English-garden reset produced URL `/`, `lang=ar`, RTL/computed RTL, Arabic selected; six consecutive Back actions remained `/`; requests stayed static-only                               | **PASSED automated and bilingual web proxy.** Physical Android/offline and human timing evidence remain open                                          |

## Counter and privacy checkpoints

| Moment                                | Salem Seeds | Mangrove       | Canopy | Circle | Evidence                                                                        |
| ------------------------------------- | ----------: | -------------- | -----: | -----: | ------------------------------------------------------------------------------- |
| Canonical reset                       |          48 | 48/60, Shoot   |  19/25 |  11/12 | Session/reset tests and reset web snapshots                                     |
| Assignment, choice, start, submission |          48 | 48/60, Shoot   |  19/25 |  11/12 | Passing lifecycle/store story tests; no web claim is used for an unread counter |
| One valid recognition                 |          60 | 60/60, Sapling |  20/25 |  12/12 | Passing store/garden tests and Arabic garden/circle web snapshots               |
| Five duplicate attempts               |          60 | 60/60, Sapling |  20/25 |  12/12 | Passing tests; mounted browser showed already confirmed with no added counters  |

The circle projection tests reject private, sensitive, non-Green, wrong-visibility, identity-bearing,
task-bearing, Seed-bearing, media, reflection, assistant, note, timestamp, unknown, and duplicate
candidates before shared mutation. The web circle observation confirms only the rendered coarse
family-level 12/12 state; it is not proof of production access control or real sharing.

## Evidence still open

- T091–T110 plus subsequent acceptance/reset/audit fixes: **PASSED automated** in the final 305-test
  suite; independent 23/23 runtime probes found no remaining source-verifiable HIGH/MEDIUM issue.
- Final-bundle Arabic and English ten-route web journeys: **PASSED**.
- Browser kind retry and duplicate confirmation: **PASSED sampled**. Synthetic missing-image/circle
  injection: **NOT RUN** in browser; deterministic tests pass.
- Browser document locale/direction plus six consecutive Back actions after English reset:
  **PASSED**. Native
  predictive Back remains open.
- Physical Android Arabic/English, offline mode, predictive Back, keyboard/IME, prepared playback,
  reduced motion, TalkBack, 200% font scale, and native touch/contrast: **BLOCKED** because no Android
  toolchain, emulator, connected device, or named build is available. T085's attempt itself is
  complete: `adb`, `emulator`, `sdkmanager`, and `java` were `NOT_FOUND`; `ANDROID_HOME` and
  `ANDROID_SDK_ROOT` were `NOT_SET`.
- Five timed human rehearsals, three-person comprehension, and named Arabic/UAE culture, faith,
  child-safeguarding, sustainability, and accessibility reviews: **NOT RUN**.

## 2026-08-28 professional MVP audit evidence

The Phase 11 audit added fail-closed reference-chain and exact-once alternative coverage, a real
Guide deadline/late-result guard, lifecycle-driven Child re-entry coverage, progressive Child
definition/media presentation, and a specific safety-recovery message for Parent-authored wording.
The final suite passed **17 files / 305 tests** with typecheck, lint, formatting, detector `[]`,
12-route export, and diff hygiene also passing.

The final Arabic and English web-proxy journeys each reached the exact recognized counter state:
Salem 60 Seeds, Mangrove 60/60 Sapling, canopy 20/25, and circle 12/12. The English replay also
proved that unsafe shorthand fails without mutation, explains the necessary recovery, and can then
continue through a bounded Guide decision. Final reset restored Arabic RTL `/` and survived six
Back actions. Android/native and named-human evidence remains unchanged and open.

# Revision 1 Historical Evidence

> These story results belong to the superseded 2026-08-28 ten-route implementation. Revision 2
> separate access, League, Family Reward, typography, and revised screen journeys remain `NOT RUN`.
