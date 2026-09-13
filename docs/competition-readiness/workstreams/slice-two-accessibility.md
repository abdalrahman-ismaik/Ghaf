# Slice2 accessibility delivery

## Outcome and authority

Implemented only assigned QAF-002, QAF-003, QAF-004 and QAF-009. Board97 and bounded contract
`e7fa118` preceded implementation. Runtime commit **08f04b3** is ready for integration within
existing scope. This is a source/web acceptance result, not Android or human acceptance.

The packet `output/playwright/qa-uiux-20260913-independent/NEXT-BATCH.md` remains a proposal;
it did not independently grant implementation. No Garden files changed in this slice.
Latest direct user selection: **Personal landscapes; separate shared family canopy**.
This resolves the product question for later Slice1/3. The next Garden contract must use
profile-scoped landscape authority and keep the cooperative canopy separate; assign the shared
Garden route sequentially between those slices before writing it.

## Exact change boundaries

| Finding             | User-visible repair                                                                                                                   | Files                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| QAF-002, P1         | Web exposes the actual numbered instruction titles/details and success text; native keeps complete grouped labels and focus requests. | `src/components/r002a/child/ChildTaskPlanCard.tsx`, `src/components/access/SuccessSheet.tsx` |
| QAF-003, P1         | Retry checkboxes announce checked state, toggle with mouse/Space/Enter, and disable Send when no selection remains.                   | `src/components/r002a/parent/ParentSupportRequestSheet.tsx`                                  |
| QAF-004, P2         | Existing onboarding brand/actions wrap within compact widths without truncated labels or changed content.                             | Header styles only in `src/components/onboarding/FirstRunOnboarding.tsx`                     |
| QAF-009, P2         | Permission facts display at full opacity, retaining no Child action or permission authority.                                          | Permission row caller only in `app/child/settings.tsx`                                       |
| Regression coverage | AR/EN web/native prop contracts, default/custom success messages, selection/payload, repeats, disabled sends and focus requests.      | `tests/presentation/slice-two-accessibility.test.tsx`                                        |

No global Text, brand, control or token changes. No changed services, store, task awards,
retry payload, access authority, packages or release flags. C's preexisting narration hunk in
FirstRunOnboarding was preserved in the working tree and deliberately excluded from the commit.

## Browser findings resolved during implementation

The first host tests passed, but the actual installed RNW0.21.2 adapter exposed two gaps:

1. `createDOMProps/index.js:180` drops `aria-atomic` by reading the unrelated active-descendant
   value. Use the supported web `status` role, with explicit polite live region and real text.
   Its native branch remains grouped; no node_modules patch. Final actual DOM has role=status,
   aria-live=polite and no replacement label. The role supplies implicit atomic semantics.
2. `PressResponder.js:66–71` accepts Space only for button-like elements; a checkbox-role div
   therefore reacted to Enter but not Space. Add a local web Space handler, prevent scrolling,
   ignore repeats, and leave Enter to the existing adapter. Final AR/EN browser sequences each
   verified Space true→false, Enter true→false and disabled Send at false. No double activation.

These are concrete measured defects and corrections, not assumed screen-reader/device passes.
The live status contains title/message once; consequence text remains separately readable once
inside the modal. Playwright's whole-page snapshot also includes the underlying route, while
actual dialog aria-modal=true was verified. Human assistive-technology traversal remains NOT RUN.

## Candidate and environment

- Shared checkout `/home/smyk/projects/Ghaf`, branch `redesign/ui-experiments`.
- Start HEAD `e7fa118593616cc3ab2562eb76c37588add3d98e`; source commit08f04b3.
  Later unrelated poster-document commit13fde0f was observed before report staging.
- Existing user Metro PID62701, port8082, `expo start --web --offline`; preserved throughout.
  Ordinary local access mode, not the old audit's separate8081 demo-mode preview.
- Isolated Firefox155.0 Linux through MCP1611. Viewports320×740 and390×844 CSS pixels.
- Browser served the shared working candidate, including preexisting C narration/access changes;
  it is **not** evidence for a clean HEAD-only export. Exact source hashes, staged diff and remaining
  narration hunk are in staging-receipt.json/source-staged.patch and the final identity receipt.
- No synthetic store/account injection. Local prepared family and task were reached through real
  controls. CSS200% text sizing and prefers-reduced-motion emulation are explicitly diagnostic
  browser overrides, restored/closed afterward. Two waits for obsolete intermediate Welcome
  routes timed out; observed direct destinations were used successfully. Those harness failures
  are preserved, not reported as product navigation defects.

## Validation matrix

| Check                                                             | Status  | Evidence / practical limit                                                                                                                                                             |
| ----------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial affected pool                                             | PASSED  | focused-tests.log:186 tests/13 files, one worker                                                                                                                                       |
| Final changed semantic paths                                      | PASSED  | final-affected-tests.log:90 tests/6 files, includes4 additional default-message cases; not276 unique tests                                                                             |
| Final TypeScript                                                  | PASSED  | final-typecheck.log, exit0                                                                                                                                                             |
| Scoped lint/format and staged diff                                | PASSED  | final-lint.log/final-format.log, git diff --cached --check                                                                                                                             |
| Six original pages, AR/EN,320/390                                 | PASSED  | all-six-onboarding receipt:24 screen states,72 brand/button geometry assertions; complete labels and both action targets≥48px                                                          |
| Next/Back/topic/Skip/finish                                       | PASSED  | onboarding-large-topic-skip and reset-restart-six-finish receipts; topic goes to step3; all6 finish to two-choice Welcome                                                              |
| AR/EN real task instructions                                      | PASSED  | child-plan-en, child-plan-ar-settings snapshots: both numbered titles and details exposed                                                                                              |
| Task-created and recognition success                              | PASSED  | task-created-final-reduced-en and approval-success-fixed; final status role, real title/message/consequences; screenshots ending fixed.png                                             |
| Ordinary default-message SuccessSheet                             | PASSED  | Focused rendered AR/EN web/android contract checks and source consumer inventory; full new-family browser creation NOT RUN                                                             |
| Retry mouse/keyboard/empty/reentry                                | PASSED  | retry-keyboard-fixed-ar / retry-fixed-en-and-approval; no-choice Send disabled, onShow reset, same prepared submission                                                                 |
| Actual deterministic task and retry flow                          | PASSED  | Parent create/review/approve→Child choose/start/submit→Parent retry→Child resubmit→Parent praise/confirm. Retry leaves48; +12 once gives60; canopy19→20. No injected task state        |
| Child permission facts, AR/EN                                     | PASSED  | permissions receipt; opacity1, no button role, tabindex−1, underlying disabled Pressable retained; measured contrast12.735:1 label,5.912:1 status on actual backgroundrgb(246,243,235) |
| Browser larger text                                               | PASSED  | Diagnostic only: recorded font16→32 and title24→48; header controls/Next reachable after scroll AR/EN320. Success AR320 main action fully reachable at200%,272×138                     |
| Browser reduced motion                                            | PASSED  | Actual matchMedia=true; finish/task-created success/dismissal reached with preference enabled                                                                                          |
| Reset and reload                                                  | PASSED  | Reset after recognition returns Arabic signed-out entry; reload then all6 finish. No claim of native process-death durability                                                          |
| APK, Android TalkBack/font scale/Back/focus/keyboard              | NOT RUN | No hardware or native execution in this slice; mocked android/ios host tests are not native acceptance                                                                                 |
| Human Arabic/listening/student comprehension or exact-diff review | NOT RUN | No participant or cultural pronunciation review performed/invented                                                                                                                     |
| Audio integrity/playback acceptance                               | NOT RUN | Audio is outside this slice. Browser console has headless media decode/sink warnings; these do not establish corrupt narration files. Preserve C's separate audio evidence             |
| New two-device messaging acceptance                               | BLOCKED | No Supabase project exists, per user; this UI slice does not resolve service provisioning or native two-device gates                                                                   |
| Garden personal projection implementation                         | NOT RUN | Decision resolved; later bounded contract and exact source grants required                                                                                                             |

Raw console retained: no JavaScript error-level entries observed in the bounded pass; warnings
include unsupported web file-system, deprecated pointerEvents, font preload and headless media
sink/decoding warnings. No performance or audio success claim is made.

## Reproduction / retest cursor

Use existing ordinary preview. Start Arabic onboarding at320×740; traverse6, reverse in English,
repeat at390×844, inspect complete language/Skip labels and48px targets. Switch topic, Skip, and
separately finish all6. Parent→local family→create canonical Green task→Continue→Make it clearer→
Accept suggestion→Review→Approve. Task-added modal must expose a status with actual title/body.
Open Child experience, select Salem and use the existing local PIN2468. Choose task→View details;
read both step titles/details in each locale. Open Child profile/settings, inspect permission
facts without a working Child permission action. Start task, check existing steps/definition,
submit. Parent access→local family→Review now→request another attempt: click, Space and Enter
must reflect checked state; empty Send disabled. Dismiss/reopen resets selection; send prepared
support, resume Child, resubmit, approve praise then apply recognition once. Final result48→60.
Reset afterward. Use a fresh isolated browser context; do not reset another session's preview.

Native retest: on physical Android in both locales check TalkBack order/duplicate announcements,
complete task instructions, success focus, retry checked state, hardware/software keyboard,
Back/dismissal, large system text and reduced motion. Ask participants to explain permission
facts and which action follows a submission. None of these gates is inherited from web.

## Assistance, selections and rejected directions

Requested model: GPT-6 Astra / Ultra / Fast. Observable local config at handoff:
`model=gpt-6-astra`, `model_reasoning_effort=xhigh`, `service_tier=fast`.
Effective runtime reasoning/service tier cannot be independently verified; do not label xhigh as
Ultra. Existing helper was requested as Astra/Ultra in this session; follow-up reused it, with
no exposed Fast selector. No configuration was changed.

Relevant Ghaf quality workflow and established UI/design-system/Spec Kit practices applied.
One helper, messaging_seams, implemented ONLY its three semantic files and new test; lead owned
onboarding/settings, integration, actual browser and final adapter corrections. No descendants or
helper jobs/browser/commits. Two bounded read-only reviews identified the adapter cause and then
found no actionable double-activation/native-leak issue in the correction.
Exact scoped prompts/replies and actual browser scripts are retained in assistance.json and
browser-receipts.json. Rejected directions: hiding real web text behind generic labels; relying
on a host mock for actual DOM acceptance; using aria-atomic despite measured adapter loss;
replacing onboarding design; adding Child permission controls; expanding into Garden or catalog
work. No student authorship, live-service success or human exact-diff acceptance is claimed.

## Handoff / release

All six source paths are committed locally in08f04b3. Source/helpers/browser/test allocations
are released after final report checks. No browser tabs or owned runners remain; original
Metro62701/8082 remains running. No push, merge, package install, deployment or history rewrite.
After this browser pass closed, concurrent screen-clarity edits appeared in app/child/index.tsx,
app/league.tsx, app/parent/task/review.tsx and ChildTodayLandscape.tsx. Those later changes are
not covered by this slice's checks and were not staged or reverted.
Other sessions' status/audio/source/proposals remain outside these commits. Future Garden work
must implement the user's personal-landscape decision and share one explicit route owner with
Slice3. See canonical board98 for final release and proposed next coordination.

Evidence directory: `/home/smyk/projects/Ghaf/output/competition-readiness/slice2-accessibility-20260913/`.
