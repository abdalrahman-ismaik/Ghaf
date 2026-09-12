# C-N01 / C-N03 — task label diagnosis and native verification packet

Session `C-20260912T011718Z-root`, board r25; branch `redesign/native-ui-20260912`, clean source
baseline `52c61fcab45f40b233d823a9178780fd07c56efd` (runtime `7fff0f3`). Source grant is only
`src/components/r002a/child/ChildTodayTaskCard.tsx`; this report and ignored `output/native-ui/**`
are C-owned evidence. Shared controls/tokens/resources/tests/routes are read-only unless A grants
an exact transfer. The user-selected entry/onboarding work is prepared in
[C product/storyboard report](c-product-refinement.md); no new behavior is authorized by this report.

## D-R03: observed clipping, cause not yet established

Read preserved raw files at
`/home/smyk/projects/Ghaf-qa-rehearsal/output/competition-readiness/d-b2208aa/`:
`ar-large-settled.json`, `ar-large-settled.png`, `ar-large-secondary.png`.
Both images visibly cut the bottom of the final word `البدء` in the secondary label
`طلب مهمة أصغر قبل البدء`. The main action `اختيار هذه المهمة` remains readable. The JSON
injects CSS `!important` rules doubling both computed font size and line height on 35 nonempty
leaf `span.is_Text` elements inside Child Home. It verifies doubled font sizes and document width
320, but does not record resulting line heights, secondary label/ancestor boxes or glyph range.

This is **P3 browser CSS-stress evidence**, not an established ordinary-text or native font-scale
regression. D's earlier mixed-worktree preview was invalid for its stated candidate; the later
`d-b2208aa` identity/settled evidence is retained separately. No new browser reproduction has run
in C's native batch: the preview lane is blocked by terminal-owned Metro341101 at activation.
That process belongs to another operator and is not stopped, restarted or trusted by C.

### Source findings and smallest next experiment

The card, `primitives.tsx`, `BotanicalPressable.tsx` and design tokens are unchanged from D's
`b2208aa`. The card sets an8px decision gap and outer `overflow: hidden`, with details continuing
below the secondary control. It imposes no button height/maxHeight/line clamp. Shared `Button`
uses a minimum height, centered row layout, `flexShrink: 1` on its label,20px horizontal and12px
compact vertical padding plus1px border. At320px source predicts a240px-wide button and
three52px text lines, giving182px total height. D's secondary crop is exactly240×182. This argues
against guessing a fixed-height card problem; it does not prove the glyph box is correctly painted.

The stronger hypothesis is a shared label/paint boundary, still unproven. BotanicalPressable
retains a transform even at scale1 in reduced motion; that is a testable compositor hypothesis,
not a diagnosed root cause. Earlier C stress tested14 card text nodes using inline overrides and
left the secondary focused. D used35 nodes with important rules and appears unfocused. C's old
horizontal-overflow assertions cannot close D's vertical-glyph finding. Preserve both histories.

After A grants the isolated preview lane, run one bounded diagnostic pass:

1. Start one Metro with explicit C project root and C-only temporary/cache directory; record PID,
   parent PID, port, command, TMPDIR and disk HEAD. Inspect Metro's actual loaded route/card/shared
   control module paths/source before any result. Correct disk HEAD alone is insufficient.
2. Capture ordinary AR/EN ×320×844/390×844, after font readiness and settled frames. Then apply
   D's exact35-node style technique from preserved JSON; record every final font size/line height.
   Retain normal versus CSS stress as separate rows; no width-equality-only readability pass.
3. Record secondary/button/text/ancestor DOMRect, clientHeight/scrollHeight, overflow, clipPath,
   contain, display, min/maxHeight, padding/border, transform and flexShrink. Record
   `Range.getClientRects()` for `البدء`; capture full button and the final word visibly.
4. Compare blurred and keyboard-focused states first; the existing focus border changes from1
   to2px. Then temporarily remove only the computed button transform, remeasure and capture.
   If necessary, toggle overflow only on the measured clipping ancestor, restoring each variable.
   These are diagnostic browser overrides, not source fixes or acceptance candidates.
5. If card-owned geometry is proved, patch only the owned card using existing tokens. If a shared
   primitive owns the issue, publish exact evidence and minimal proposed diff to A for transfer.
   Do not hide it with shortened Arabic, smaller text, disabled scaling, new custom button or
   removal of unrelated card clipping. Validate the actual patched geometry in both locales.

No exact source patch is proposed yet because the missing measurement determines its owner.
The existing card grant is retained during diagnosis, but no source has changed. An additional
test-file grant must be explicit. Useful existing behavioral cases: `child-task-flow.test.ts`
guarded choose/start and smaller request without progress; `parent-check-in-flow.test.ts`
pre-acceptance negotiation. `r001-design-foundation.test.ts` inspects primitive API/scaling but
does not prove glyph painting. Do not add style-mirroring tests or repeat the entire historical suite.

## C-N03 — concise phone checklist for D's assigned operator

Native status for all rows: **BLOCKED/NOT RUN**. No APK, device model, Android version, font
setting, TalkBack state or owner has been observed by C. D owns actual device sessions; C does
not duplicate them or change global accessibility preferences. CSS200% is not native font scale.
The primary carries the complete local role-separated journey; the secondary independently
checks the same APK. Neither installation communicates with the other.

Before recording: D supplies exact APK SHA256, package/version, source commit and installed
identity; record model/OS, viewport/density, current owner-selected font/display scaling,
locale and accessibility settings. Do not infer these from browser widths. Use synthetic data
only. At the current baseline use normal Parent setup/verification, approve Salem's canonical task,
then valid paired Child entry. Once015 is accepted/integrated, use only its authorized demo selector;
do not import test helpers on a phone or silently treat both entry modes as equivalent.

| Case                                  | Route/setup and exact expected result                                                                                                                                                                                                                  | Screenshots/evidence to collect                                                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Ordinary Arabic                       | `/child`, Salem assigned task,48 Seeds. Full `طلب مهمة أصغر قبل البدء`, especially `البدء`; primary `اختيار هذه المهمة`; help `تُقبل المساعدة المسموح بها ولا تقلل المكافأة المعروضة.` and award `12 بذرة ثابتة بعد تأكيد وليّ الأمر` remain readable. | `ar-ordinary-child-choice.png`, `ar-ordinary-secondary.png`; actual text/button measurements where available.                            |
| Ordinary English                      | Same task; `Ask for a smaller task before starting`, `Choose this task`, `Permitted help counts and does not reduce the displayed award.` Full lines, no hidden final word. Arabic synthetic name in English is a mixed-script sample, not a failure.  | `en-ordinary-child-choice.png`, `en-ordinary-secondary.png`.                                                                             |
| Enlarged text                         | Owner-approved native font setting, record actual value. Both locales: wrapping and vertical growth expose every glyph and touch target; scroll may be required. Never shrink label or switch scaling off.                                             | `ar-native-large-secondary.png`, `en-native-large-secondary.png`; setting/value and return-to-original confirmation if changed by owner. |
| Touch and selection                   | Tap smaller request once. It requests Parent review; original main choice becomes disabled with explanation, no award or growth. No accidental task acceptance from adjacent target.                                                                   | `ar-smaller-pending.png`, `en-smaller-pending.png`; operator action trace, Seeds48/current award12.                                      |
| Focus/TalkBack                        | Follow visual reading order; role/name/disabled state spoken once; full smaller label available. Focus moves without hiding final line. Touch targets at least48dp under actual native measurement.                                                    | Focus screenshots plus operator observations; do not claim TalkBack from web ARIA.                                                       |
| Back/reentry                          | Back leaves the current surface via agreed stack semantics, never reopens another authorized role; reentry preserves actual current-run pending state. Task details/resume retain existing callback meaning.                                           | Route/action trace and before/after states at exact APK; source assertions alone do not pass Back.                                       |
| Reduced motion                        | Owner's actual reduced-motion preference; same content/action immediately usable, no press/reentry completion gate or continuous decoration.                                                                                                           | Actual setting + static final state and observed behavior; browser emulation is a separate row.                                          |
| Confirmation/recognition              | Submission remains waiting with no confirmed growth. Parent review/praise/recognition adds accepted +12 once; default Seeds48→60, Mangrove48/60→60/60. Permitted help retains award; no repeated gain.                                                 | D's core journey receipt/screens; C need not duplicate D's whole rehearsal.                                                              |
| Reset                                 | Existing Parent reset returns signed-out Arabic entry, canonical baseline and no recoverable old authorized Back route. Record mode: ordinary local versus later isolated demo.                                                                        | D's exact reset/Back/entry trace; process-local restart is not durable recovery.                                                         |
| Selected onboarding, once implemented | Exactly Parent/Salem/Alya; all three entry controls work without demo credentials; optional three-moment story is fully readable/silent; language, Skip and entry accessible; missing image/audio do not block.                                        | Paired entry/story images, D's profile-isolation/Back/restart evidence. Source contract not yet committed at r25.                        |
| Narration, once reviewed clips exist  | Listen/Stop/Replay; stop on step, locale, Back, Skip, entry, background; TalkBack speech priority; exact MSA/transcript/volume/pronunciation review on phone.                                                                                          | Per-clip reviewer/date/settings/results, accepted/rejected takes; checksum alone is not listening quality.                               |

For each row record PASSED/FAILED/BLOCKED/NOT RUN with its own source/APK/locale/settings and
evidence. Ordinary browser, CSS stress and native rows never share a blanket verdict. An image
of the final word is necessary for the clipping case; geometric width equality is insufficient.

## Assistance, prompts and review

Root requested GPT-6 Astra/Ultra/Fast. Fresh allowlisted user config is `gpt-6-astra`/`xhigh`/
`fast`; effective served root settings are unexposed, Ultra not verified. Existing helper
`/root/duration_review` was originally launched with accepted Astra/ultra, Fast not exposed.
It reused the one r25 allocation, read only, and finished with no writes/jobs/descendants.

Exact helper follow-up:

```text
New NB1 C helper scope, board25 one slot, no descendants. Retain actual originally accepted Astra/ultra launch; Fast unavailable. You are not alone; preserve all contributors' edits. READ ONLY, no source/report/coordination writes, browser, server, tests, installs or jobs. C worktree /home/smyk/projects/Ghaf-ui-studio, redesign/native-ui-20260912 at52c61fc clean. Bounded task C-N01 D-R03: read raw /home/smyk/projects/Ghaf-qa-rehearsal/output/competition-readiness/d-b2208aa/ar-large-settled.json and two PNGs ar-large-settled.png/ar-large-secondary.png, current ChildTodayTaskCard.tsx, shared primitives.tsx Button/QuietButton/Text and BotanicalPressable. Determine plausible precise layout constraint causing final Arabic word clipped under D's injected doubled CSS font-size AND line-height at320. Distinguish observed pixels, source hypotheses, and unproven native behavior. Compare our earlier C stress method if helpful; don't duplicate whole audit. Report whether cause is card-owned or needs A shared-control grant, smallest proposed patch/geometry experiment and exact existing focused interaction tests. Do not guess/apply a fix without actual preview; lane blocked by terminal Metro341101 not ours. Parent lead concurrently writes selected three-profile onboarding storyboard/scripts and proposed reciprocal story; no need audit access/audio services again. Send bounded findings and release allocation.
```

Lead inspected both raw images, exact JSON and current source, accepts the helper's uncertainty
and measurement plan, and rejects a guessed minHeight/card workaround. The generated contribution
is a bounded diagnosis, native checklist and the adjacent storyboard/report. No full application,
image/audio, source fix, human review or device acceptance is generated or implied. Student owner,
teach-back, exact-diff acceptance and Arabic/audio reviewer remain PENDING. No take has been recorded.

User role prompt source: canonical `docs/competition-readiness/native-batch/session-c-native-ui.md`,
SHA256 `adc2142821a4eca68cf69980bffc3122ea7b89e09fe88bbfa228212534ee33c6`.
Read constitution and required003/005/product/design/research/limits/demo documents; their diff
from the prior read02b9618 through52c61fc is empty. Read current native shared/entry contract,
strategy/catalog, build guide and D report; reuse A's completed service/audio/access findings.
Impeccable onboarding context ran once for the actual native component; known Android authority
overrides its legacy-schema web inference. No PRODUCT/schema rewrite was requested or performed.

## Checkpoint and next action

No runtime file edited and no browser/test/native job launched. Formatting and Git whitespace are
the proportional checks for these reports. C-N01 remains awaiting isolated preview and measured
root cause; no defect closure claimed. C-N04 selected onboarding takes priority when A's committed
Feature015/interface grant arrives. Native rows need A's exact APK and D's owner-authorized devices.
Commit/release is published in canonical STATUS-C; prior evidence and branches remain preserved.

## C-N04 — selected entry and three-moment source candidate

This section follows the historical r25 packet above. A051/r28 grants the requested entry/story
implementation under committed Feature015 `293d351112d7b87b00d138e05905035d4df05b25`, following
D004's technical review. A's exact synchronization was applied cleanly as `38d71cf` (e02d02b),
`f1d7928` (293d351) and `f0f90d024c3f2a40e71a2288de58579a11068db9` (31f1833). Earlier branches,
report history and the existing ChildTodayTaskCard remain intact. C owns only the three new
`src/components/demo/` files and `tests/demo-entry-presentation.test.tsx`, plus this evidence report.
A retains resources/routes/store/controllers/shared controls/config and integration. No015 flag
was enabled in C's worktree. A053 accepts fixed-order profile validation; A056 explicitly re-holds this evidence report.

### Visible problem, action and selected composition

The old signed-out route asks a presenter to move through a six-moment introduction and access
ceremony before demonstrating the family interaction. The selected demo contract places the
synthetic Parent, Salem and Alya immediately on the entry page. Each choice displays its supplied
name, role and intended action. The optional story explains safe choice, permitted help and
Parent-confirmed symbolic growth. Completing it returns to the selector; it never creates a session.

Family Field Journal remains selected by A. The implementation uses the official Ghaf raster mark,
Alexandria/Readex through existing Tamagui primitives, warm botanical surfaces, generous text-first
profile controls, logical rows, and the existing action/support/growth artwork. The selector has no
large introductory image ahead of the choices. Each story moment gives one image and one complete
paragraph room to breathe, with manual progress, Skip, Next/Finish and Back. The content scrolls
rather than constraining body text or shrinking Arabic. Header controls can wrap. Photographs are
not mirrored. No library, token, translation authority, remote service or template asset was added.
Template composition provenance and the exact candidate scripts remain in the released
[c-product-refinement.md](c-product-refinement.md); no second direction comparison was opened.

### Actual component boundary and states

- `DemoEntryScreen.tsx`: props-only selector, fixed canonical order, explicit callback guards,
  local story-open/step state, hardware-Back subscription while a story is open and heading focus
  requests. No direct store, router, controller, service or narration import. Busy copy is visible
  and profile/language/story controls are disabled for an in-flight selection. Normal entry errors
  are announced and leave valid profile retry controls. No delayed fake loading state is created.
- `DemoOnboardingStory.tsx`: controlled three-step content; Next requests the next step, last Finish
  closes, first Back closes, subsequent Back requests the previous step. Skip closes immediately.
  Image readiness is never a condition for an action. Existing LocalIllustration owns its failed
  image fallback and reduced-motion image transition. Shared buttons own press/reduced-motion
  feedback. There is no automatic timer, new continuous motion or audio playback control.
- `types.ts`: A's exact props contract and small internal controlled-story props; DemoPrincipal
  comes from A's shared model. Profile entry supplies only that principal to A's callback.
- `restartRequired`: complete localized restart instructions plus language, with no profiles or
  story controls and no authority-dependent contents. This is an A-owned failed-reset latch;
  C does not calculate reset/permission/progression state.
- Invalid profile copy: A053 requires denial for malformed, missing, duplicate or unknown values.
  The source validates all three records before exposing any profile control, including sparse
  array holes after independent helper review. It never invents an account or labels. Dedicated
  `copy.unavailableError` is now approved by A056/committed3f7d5a9 and rendered automatically
  for invalid copy even when the ordinary entry-error prop is null. A owns native/web wording.

No award, eligibility, unlock, lifetime Seed or landscape calculation was introduced. Permitted
help and all safety/AI/symbolic-growth meanings are supplied by A's bilingual resource candidate.
R002b,008 recognition-only and deferred014 boundaries are unchanged.

### Evidence classes and follow-up matrix

| Evidence           | Actual result                                                                  | Limits / next exact check                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| First source check | PASSED: scoped UI lint/format/typecheck;27 rendered/callback tests             | Real React SSR with mocked native/primitive/image leaves; no mounted state or native claim                                           |
| Source receipt     | `output/native-ui/c-n04-source-checks/presentation-tests.receipt.json` and log | UTC01:40:58.147644–01:40:59.075559, runner407468/test407469, all four candidate SHA256 values; both processes ended                  |
| Final source check | PASSED:29 focused tests, typecheck, scoped lint and formatting                 | Final receipt matches all four committed source/test hashes at931a186                                                                |
| Normal browser     | NOT RUN at this new source                                                     | Pair AR/EN entry and all3 story moments,320/390 widths; error/busy/restart-required and missing media                                |
| Browser stress     | NOT RUN at this new source                                                     | Complete labels, overflow and glyph geometry under recorded large-text CSS; reduced motion and focus; one bounded matrix after grant |
| Native             | BLOCKED / NOT RUN                                                              | D's exact APK/source/flag/hash; real device model/OS/font setting, touch, TalkBack, Back/reentry and full restart                    |
| Arabic narration   | BLOCKED / PENDING review                                                       | No reviewed matching clip, no accepted narrator, no replacement take, no audio playback implementation in this slice                 |
| Human/student      | PENDING                                                                        | No named exact-diff acceptance, Arabic editorial review, listening review or teach-back was invented                                 |

No C Metro/browser/native process exists. B holds the native-heavy lane. Paired before/after captures
cannot be produced until A grants the preview lane and loaded-root/candidate proof. The old raw
D-R03 clipping evidence remains open and attributable to its own source and CSS conditions.
Missing browser/native evidence must not be converted into a visual/device acceptance pass.

Phone collection packet for this component: use `/` in the exact **demo** build, signed out.
Record entry in AR/EN with all three supplied profile labels, language and synthetic notice; open
three moments and capture their complete paragraphs and progress. Capture ordinary and the owner's
actual enlarged-font setting, with full Next/Skip/Back/Finish labels reachable through scrolling.
Check each profile's real home separately through A/D's authority sequence. In a story, hardware
Back steps backward and closes at the first moment; Back after handoff must follow A's route guard.
TalkBack should read named controls once, skip decorative mark/icons, and reach complete content.
Verify no unrequested narration/ambience; actual global silence depends on A054's provider seam.
Use `ar-entry.png`, `en-entry.png`, paired `story-together`, `story-support`, `story-growth`,
`entry-error`, `entry-busy`, `entry-restart-required`, plus native font/focus/reduced-motion settings
and action receipts. Do not call a320/390 browser probe a device size or CSS200% a native font scale.

### Supporting AI and review record

Requested GPT-6 Astra / Ultra / Fast; observed allowlisted lead config Astra/xhigh/fast, effective
root settings unexposed. No setting changed. Helper launch explicitly accepted Astra/ultra; Fast
cannot be selected or verified in the launcher. C used one helper at a time, zero descendants.
Lead applied Impeccable onboarding/craft floor and existing Expo design-system conventions.

Exact read-only harness follow-up to `/root/duration_review`:

```text
NB1 bounded read-only test-harness preparation, under C's one helper quota; no descendants. C is awaiting A's committed015/exact grant for DemoEntryScreen, DemoOnboardingStory, types and tests/demo-entry-presentation.test.tsx. You are not alone; preserve all other edits. Read draft /home/smyk/projects/Ghaf/specs/015-demo-entry-onboarding/contracts/demo-entry-v1.md and existing C worktree tests/parent-task-composer-profiles.test.tsx. Installed React DOM client/server exist but react-test-renderer/jsdom/happy-dom/testing-library do not. Find a concrete dependency-free way to meaningfully test real rendered props/actions, three-profile enforcement, story navigation and restart-required/busy/error fallback in the prospective components; no fake claim of native/browser/lifecycle testing. Recommend exact harness and test split, no new dependencies, UI rewrites, browsers/tests/jobs or file writes. Lead is preparing UI seams independently. Return concise recommendation and known gaps.
```

It recommended the existing React SSR harness, real hooks, array-based captured controls and
controlled story callback tests, with mounted-state limits. C accepted this bounded contribution.
No file/job was produced; that allocation was released before the implementation helper.

Exact implementation helper prompt to `/root/demo_presentation_tests`:

```text
Session C-N04-r28 under A051/contract293d351. You own ONLY /home/smyk/projects/Ghaf-ui-studio/tests/demo-entry-presentation.test.tsx. You are not alone; preserve others' concurrent edits, never revert them. NO coordination/report/source/config/dependency writes, no descendants, browser/native/heavy jobs. Requested Astra/Ultra, launcher explicit; Fast unavailable. Lead implements three files in src/components/demo. Read worktree AGENTS, committed specs/015-demo-entry-onboarding/{spec,plan,tasks}.md and contracts/demo-entry-v1.md. Root has synced to f0f90d0. Build meaningful focused rendered/callback tests using installed react-dom/server and existing tests/parent-task-composer-profiles.test.tsx pattern. Keep React hooks real, mock only RN/primitive/art/image leaves. Capture controls in ARRAY (not duplicate-hiding Map). No new dependency. Entry export DemoEntryScreen, props exact committed DemoEntryScreenProps from types. Internal controlled story export DemoOnboardingStory; props from types.ts: locale, direction, copy:DemoEntryCopy, step:DemoStoryStep(0|1|2), onStepChange(step), onClose(). Story uses fixed moment IDs together/support/growth, close and first back close; next requests next index, last primary closes only. Test IDs planned: demo-profile-parent_al_noor / child_salem / child_alya; demo-language; demo-story-open; demo-entry-error; demo-entry-busy; demo-restart-required; demo-story-close/back/next/finish/progress; demo-story-image-{moment.id}. Test AR/EN text/actions, fixed3canonical order with duplicate/unknown inputs cannot create extra controls; busy/disabled callback guard; error visible/announced and profile retry; restartRequired dominates and has no profile/story actions; each story exact copy/asset/alt/progress/navigation callbacks, silent missing-audio label/no narration. No claims SSR proves mounted state, focus/layout/native/audio lifecycle. Missing-profile policy pending A (do not guess); start canonical cases and adapt lead notices. Do not run tests until source exists and lead approves small test start after pressure check. Write test file, report exact prompt/contribution/limits, notify readiness; lead runs/reviews tests and commits. Comments // only.
```

The helper wrote only the test file, handed its writer boundary to C, then independently reviewed
source. A053 superseded the initial duplicate-filtering assumption with whole-entry denial. The
helper found that `every`/`map` skip sparse array holes, allowing two profiles through a three-slot
check; lead accepted the finding, normalized with Array.from and added AR/EN sparse cases. Lead
owns the final source, tests, checks and commit review. No helper ran tests or wrote coordination.

Rejected approaches: new testing dependencies, fake React hooks, a Map hiding duplicate controls,
claiming image-leaf omission tests prove actual image-error lifecycle, reusing six old narration
clips, guessing a shared-control clipping patch, authoring new translated runtime strings, and
expanding this slice into accounts/routes/state/progression. No human selection or participation
is attributed to AI review. Student owner and exact-diff review remain PENDING.

### Source release — 2026-09-12 01:44:46 UTC

Commit `931a186ab8b483c08ef37cfc0fa8119711f9e2d2`, parent `f0f90d024c3f2a40e71a2288de58579a11068db9`,
contains only the two components, their types and focused test. All four committed blobs match
`output/native-ui/c-n04-source-checks/final-checks.receipt.json`. Staged exact-file list and
whitespace check passed. No application-wide suite, preview, APK or device check was run by C.

Final serial commands were Prettier check on the four code/test files and this report, ESLint on
the four code/test files, `npm run typecheck`, and
`./node_modules/.bin/vitest run tests/demo-entry-presentation.test.tsx --maxWorkers=1 --no-file-parallelism`.
All exited0; final tests29/29. Interval 2026-09-12T01:43:32.962224+00:00–2026-09-12T01:43:57.129733+00:00.
Runner411640, formatter411643, lint411717,
typecheck411795, test412265 all finished. Memory before this serial
pass was2312MiB available/7645total,1552MiB swap occupied; no new helper/preview/heavy slot.
Report-only release metadata was appended afterward and checked separately.

The four source/test paths and helper allocation are **RELEASED for A's local integration**.
A supplies final resource props and authoritative callbacks; C's module is not yet a routed surface
in this worktree. Arabic reviewer, voice assets/listening, exact-diff student review, paired browser
captures and native evidence remain pending as labeled above. No audio repair is claimed.
C continues the active queue after this checkpoint, using only a later exact preview/candidate
grant for C-N01 reproduction or C-N04 visual inspection.

## Integrated browser pass and heading correction — 2026-09-12

This section supersedes earlier NOT RUN rows only for the exact browser states below. Android,
TalkBack, native font scaling, native Back/audio and student acceptance remain NOT RUN/PENDING.
A065/A070 granted one browser against A's canonical Metro and the MCP artifact directory; A072
then re-granted only the two demo components for the reproduced duplicate-heading correction.

### Candidate and harness identity

Served runtime: `2ecea74f3dc0886a2be4461d701678365673beaa` from `/home/smyk/projects/Ghaf`.
A's initial launch HEAD78975ca and observed later327fd52 differ only in documentation/tooling;
`git diff 2ecea74 -- src app assets app.config.ts package.json package-lock.json` was empty.
Metro441606/npm441578/shell441576, port8081, exec44936, explicit canonical cwd, demo=true,
R002b/live-AI flags=false, CI/no hot reload, one worker. Private TMP/cache:
`/home/smyk/projects/Ghaf/output/native-integration/015/preview-cache`.

C used only Firefox444083, MCP176458, isolated profile `/tmp/playwright_firefoxdev_profile-ND135H`.
The loaded Metro module registry identifies initialized DemoEntryScreen, DemoOnboardingStory,
resources and demo configuration; loaded `entryMode` is `demo`, revised Arabic body and malformed
copy fallback are present, and each factory SHA256 is recorded. This is served-module evidence
plus verified server root, not disk HEAD alone. The browser used `http://127.0.0.1:8081/`.

Initial localhost navigation timed out at the MCP60s limit; a second root navigation timed out
at25s. `/status` returned200 in0.084s. A's log then recorded first SSR67.7s/web70.7s compilation,
and the page settled normally. These are first-bundle/harness timing observations, not device
startup measurements or UI failures. The optional DevTools missing-libnss3 warning and web-only
expo-file-system warnings do not establish an app or APK defect.

MCP initially denied the C worktree artifact path. A070 granted
`/home/smyk/projects/Ghaf/output/playwright/176426/**`. Two relative filenames unexpectedly landed
in canonical root; C moved only its own screenshot/proof into the granted subdirectory. Every
later filename was absolute. A failed VM dynamic-import attempt and an overlarge command-argument
attempt wrote no evidence and were abandoned. No permission root was bypassed or package installed.

### Covered browser states

All viewports are CSS pixels with height844; they are compact browser probes, not physical phone
sizes. Fonts settled through `document.fonts.ready` and two animation frames before measurement.

| Scope                                 | Exact coverage                        | Result and limit                                                                                                                                                                                                              |
| ------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Signed-out selector                   | AR/EN ×320/390                        | Exactly Parent/Salem/Alya, immediate profile controls, language and optional story visible; no horizontal overflow; buttons at least50px high.                                                                                |
| Three story moments                   | AR/EN ×3×320/390                      | All12 states captured; full revised body copy, approved local images loaded, manual Next/Back/Finish available; no horizontal overflow or target below48px.                                                                   |
| CSS stress                            | AR/EN ×3×320/390                      | 12 story states with doubled computed font size AND line height on nonempty leaf Text spans; separate top/action captures. No horizontal overflow or undersized target. This is not native font scaling.                      |
| Story interactions                    | Both locales                          | Finish returns selector; reopening starts1/3; visible Back2→1→selector works; title receives web focus and next Tab reaches Parent profile. Browser hardware-history Back/native Back were not inferred.                      |
| Image failure + reduced motion        | Both locales, first moment            | Abort actual onboarding-action image request after fresh page load with reduced-motion media preference. Localized fallback and complete body remain; Next reaches2/3. Restore route interception/media preference afterward. |
| Real synthetic entry                  | Parent, Alya, Salem                   | Parent Home, Alya's no-assignment Child state and Salem's48/60 state reached without credentials. Parent sign-out and Child Parent-access return to selector. This is browser routing, not APK acceptance.                    |
| Parent assignment handoff             | Arabic canonical Green task           | Parent prepared MakeClear→accept→review→approve succeeds; no growth on assignment. Success-dialog Child handoff reaches selector but emits POP_TO_TOP warning; separate A-owned defect below.                                 |
| Busy/error/malformed/restart-required | Existing29 focused presentation tests | Source/SSR callback evidence only; no browser fault injection was added and no native pass inferred.                                                                                                                          |

Copied evidence root: `output/native-ui/integrated-015/`; original captures remain in the granted
canonical `output/playwright/176426/integrated-015/`. The initial copy verified55
files by SHA256. Key paired captures:

- `captures/ar-entry-390.png` and `captures/en-entry-390.png`;
- `captures/ar-story-1-320.png` and `captures/en-story-1-320.png`;
- `captures/ar-story-2-390-css200-action.png` and `captures/en-story-2-390-css200-action.png`;
- `captures/ar-missing-image-reduced.png` and `captures/en-missing-image-reduced.png`.

Raw matrix/interaction receipts: `normal-story-matrix.json`, `entry-stress-matrix.json`,
`story-interactions.json`, `failure-reduced-motion.json`; loaded proof is
`captures/loaded-module-proof.json`. Lead visually inspected representative AR/EN story and
normal/stressed secondary-control captures; geometry alone was not treated as readability proof.

### Reproduced defects and exact ownership

**C-N04 heading:** the entry and story each rendered an outer named focusable header plus an inner
Text whose parentHero variant automatically adds another header role. Accessibility snapshots
listed the same title twice, although pixels showed it once. A072 authorized the smallest
component change: `accessibilityRole="text"` on each inner title, retaining the outer heading,
focus behavior, typography, content and callbacks. Shared Text was unchanged.

Commit `5cd3b9178c1a3c003e7b500a2b9fffd52e0b819e`, parentf998c36, contains only
`src/components/demo/DemoEntryScreen.tsx` and `src/components/demo/DemoOnboardingStory.tsx`.
Scoped Prettier/ESLint and existing29 presentation tests passed, serially02:14:25.037980–02:14:28.301441UTC.
Runner458498, children458499/458510/458619, all exited0. Receipt:
`output/native-ui/heading-fix-checks/receipt.json`, with exact args and both source hashes.
No mirror-style test or full suite was added. Both source paths are RELEASED for A integration.
The corrected-candidate heading retest below passes; the earlier source-only checkpoint did not establish that pass.

**C030 handoff warning:** after actual Parent approval, pressing `فتح تجربة الطفل` opened the
selector but produced a visible developer warning: `The action 'POP_TO_TOP' was not handled`.
Original snapshot `page-2026-09-12T02-12-07-331Z.yml` and console trace remain under MCP176426.
C reported the route issue without changing business state or hiding it. A074 owns the exact
review-route/test repair; the actual corrected-candidate handoff result is recorded below.

**D-R03 initial P3 interpretation:** exact35-leaf-span doubling at320 reproduced the same final-word
image previously interpreted as cut; the later isolated reference below contradicts that clipping interpretation. Ordinary Arabic320/390 labels are readable; main action remains readable.
Button240×182, label198×156, font32/line52; last-word Range40px high stays inside label/button
bounds. No max-height, line clamp or nearby clipping boundary explained the cut pixels.
Focus/blur, button transform:none and display:block did not resolve it. C initially misread the temporary `position:relative` capture as an improvement. Subsequent byte
comparison disproved that reading: the before, temporary relative, original D and corrected-candidate
images are identical. Explicit overflow:visible was already the computed value. All temporary
diagnostic inline changes were restored. See the isolated-glyph comparison below; this was not a fix.

The direct label is owned by shared Button in `src/components/primitives.tsx`, not the card.
The initially proposed A-owned experiment was web-only relative position for `styles.buttonLabel`;
it was implemented by A, but the contrary evidence below does not support retaining it as a fix.
C applied no card workaround, shared primitive change, font shrink, truncation or award calculation.
Before/diagnostic images are `ar-card-css200-secondary.png` and
`ar-card-css200-relative-diagnostic.png`; exact source/geometry is in `card-diagnostic-ar.json`
and `captures/ar-card-css200-computed.json`. This does not prove a native font-scale regression.

The follow-on English card matrix hit a strict-locator error because retained hidden and current
routes both exposed the same testID after settings Back. `card-diagnostic-en.json` preserves this
harness failure; those new EN card rows are NOT RUN, not a product failure or pass. Browser was
closed for the planned source-check handoff rather than repeating assignment setup. Further card
checks require the same ownership/resource protocol and a scoped visible route locator.

### Assistance, review and release

Lead used Impeccable onboarding and existing Expo design-system conventions, then the repository's
installed Playwright MCP; no new design assets/dependency or second server. Actual bounded tool
instructions were to inspect loaded modules, record AR/EN320/390 states, inject exact doubled CSS,
exercise public controls, fail an image request, restore diagnostics and preserve receipts. No
helper produced the full application. Narrator helper work is recorded in the product report.

Rejected directions: speculative card fix, geometry-only readability claim, clearing another
process cache, broad consistency rewrite, runtime audio from rejected takes, and treating the
native gate as passed. User listening has rejected the first three Arabic recordings; new narrator
samples remain separate from UI and pending actual selection. Student exact-diff review remains
PENDING; no reviewer name or participation is invented.

Firefox444083 was closed and confirmed absent before source checks at02:14; the browser allocation
and unchanged ChildTodayTaskCard path are RELEASED. A owns Metro shutdown/restart and integration.
Reports/evidence remain held until the corrected-candidate receipt below is committed.

### Corrected candidate retest and evidence correction — 02:20–02:23 UTC

A078 granted C the sole browser for three affected boundaries only. Candidate
`f16112d2daf0378445df08654e7da872af4f5658` includes headinged51b32, handofff16112d and the
experimental web-label changeaf8da6c. A's type/lint/format and148files/1919tests passed, attributed
to its receipt `output/native-integration/015/full-f16112d/`; C did not repeat the suite.

Fresh browser467810, parent176458, profile `/tmp/playwright_firefoxdev_profile-joVWA9` loaded
A Metro466808/8081. Canonical cwd and exact runtime-input diff to f16112d verified. Initialized
loaded factories expose both inner text roles, the actual web-relative label, corrected route's
prepareEntryReset and demo configuration; factory hashes are in `captures/corrected/loaded-proof.json`.

- **Heading PASS, browser scope:** AR/EN entry each has four headings total (one page title plus
  three profile names), with zero nested headings. First story has one heading with zero nesting.
  Each page title still receives focus. `corrected-headings.json` and four paired PNGs record this.
- **Approval handoff PASS, browser scope:** repeat actual canonical Parent task setup, accept
  prepared MakeClear wording, review, approve, and success-dialog Child handoff. Selector has
  exactly3 profiles, no visible POP_TO_TOP warning and no console error/warning of that kind during
  the handoff; Salem subsequently reaches the assigned task. `corrected-handoff.json` and
  `captures/corrected/ar-approved-handoff-selector.png` preserve it. This is not a native Back pass.
- **Label matrix executed:** AR/EN ×320/390 ×normal/CSS200,8 rows, scoped by visible exact accessible
  label rather than duplicate retained-route testIDs. All35 leaf Text spans in the visible Child
  root doubled in each stress row; main and secondary controls captured separately. Full labels,
  geometry and computed relative position are in `corrected-card-matrix.json`. Ordinary controls
  remain readable; no font size or label was changed to pass.

**Correction to C031 and A075's experimental fix rationale:** SHA256 of original D
`ar-large-secondary.png`, C's reproduced before, temporary relative diagnostic and corrected
AR320 CSS200 result is the same:
`c5a98062115434ae4c05d6a927a06766fcd21141c0db974421cbf34aeac79488`.
The earlier visual claim that relative positioning restored missing word paint was wrong. C
reported this immediately in C037; D independently identified the byte equality too. No D-R03
closure may be based on that unchanged image or the position change.

C then rendered the actual last word from the existing Text node in a temporary, aria-hidden,
fixed body div outside the card/button: same ReadexPro_500Medium,32px font,52px line height, RTL,
198px content width, visible overflow. The isolated word reference is
`captures/corrected/ar-isolated-final-word-reference.png`; the temporary node was removed.
A read-only Pillow pixel analysis selected green ink (`G > R*1.2`, `G > B`, `R <180`) and compared
the original last line (y≥115) with that isolated reference after bounding-box translation.
Original bbox[90,131,148,163], reference[91,26,149,58]; each contains483 ink pixels; masks are
exactly equal, IoU1.0, no missing or extra pixel. No image was edited or resized.
`glyph-reference-comparison.json` preserves the measurements.

This comparison supports the natural complete glyph shape in the approved font, rather than
missing paint in this observed state. It does not erase D's initial P3 concern or prove native
large-text acceptance. A/D own the final disposition; C038 requested removal of the unneeded
experimental shared-label change. No additional card/shared fix is justified by this evidence.
The earlier English harness failure remains preserved; the eight corrected-candidate rows supply
new successful scoped execution, not a rewritten historical result.

Final copied artifact manifest verifies81 files, including both console traces and the original
handoff-warning snapshot, while preserving canonical originals. Browser467810 closed and was
confirmed absent at02:22:54UTC; sole browser allocation is RELEASED. C owns no helper/server/test/
native process. Both heading source files and unchanged ChildTodayTaskCard are already RELEASED.
The report/evidence release follows its local commit. Human/student exact-diff, phone settings,
TalkBack, native Back and recording selection remain pending independently.

A080/A081 disposition at this report checkpoint: remove the unsupported web-only label property,
retain the historical P3 concern as OPEN while D independently reviews the isolated-glyph evidence,
and stop further browser/font investigation in this batch. C ACKs that boundary. The removal is
A-owned; it neither changes C's heading commit nor upgrades the native scaling gate. No additional
C source, preview or helper work is held for it.

## C-N07 / T014b — approved narration implementation

Status: source slice ready for A integration after the bounded A190 checks. Mounted/native and
full integrated validation remain pending; T014 is not fully accepted.

Authority: A186/A188, board64, accepted Feature015 contract40a6299 and shared preparation
fa9821c68eb80985b690f5551fee08c7c9cdcd33. On 2026-09-12 C created the explicitly granted
`redesign/narration-ui-20260912` branch at that exact preparation commit in the existing
Ghaf-ui-studio worktree. Previous `redesign/native-ui-20260912` at c91f95e remains preserved.
B's concurrent APK build remains frozen at runtime5d8a3e8 and contains none of this new adapter.

The visible problem is that the three-moment introduction has complete text but cannot play the
three accepted Arabic recordings. The intended action is optional **استمع إلى النص**; while
loading or playing it becomes **إيقاف السرد**, with **إعادة الاستماع** after playback has begun.
Navigation and the complete transcript remain available. English remains silent with the supplied
unavailable notice; active screen readers receive the supplied priority explanation. The existing
botanical composition, Alexandria/Readex, logical direction, artwork and control primitives remain.
No new visual direction, dependency, state authority or progression behavior is introduced.

### Bounded contribution and review record

Actual user continuation: “Start with the READY C-N06 task under A173. All three Wiam recordings
are user-approved, and the user confirmed they were generated on the Free plan. Record the
rights/attribution findings, then continue into T014b when A publishes its committed contract and
exact source grant. Preserve the running baseline APK build and coordinate through the canonical
board.” C-N06 report commit c91f95e was integrated by A as2145636. Its official-source findings,
actual prompts and rejected claims remain in c-product-refinement.md; they are not repeated here.

C/AI authored the hook, immutable source resolver, entry cancellation wrappers and focused checks.
The hook consumes A's existing pure playback controller and supplied run generation/entry epoch;
it does not establish sessions, roles, progress or audio rights. A owns resources, routes,
controller, assets and public-use decisions. Existing design-system and Ghaf quality workflow
skills were applied. Requested settings: GPT-6 Astra, Ultra and Fast. Last observable root settings
were Astra/xhigh/fast; effective serving is unexposed. The reused helper was previously launched
as Astra/ultra; its Fast setting is unexposed. No configuration was changed or serving guarantee made.

One helper `/root/abdullah_voice_review` prepares only ignored native/audio/presentation doubles
under `output/native-ui/narration-lifecycle-harness/mocks/**`; no descendants or coordination edits.
Lead independently owns the real hook/Entry/source resolver and harness root files. Helper work
is reviewed before acceptance and any next disjoint allocation. The mock prompt/contribution
receipt and subsequent precise allocation will be retained here when released.

Rejected implementation directions: automatic playback, reused retired players, effects that
resume audio, pause-only cancellation, an enabled English playback button without accepted media,
assuming browser screen-reader detection is false, adding a testing/UI library, changing global
native audio mode, and treating server rendering or media checksums as lifecycle/listening proof.
The current implementation follows the reviewed fresh-player-per-intent and guarded retirement
contract. It does not claim to eliminate the installed native player's already-captured focus race.

User review of full wording/pronunciation/delivery is **APPROVED for all three supplied clips**;
model and Free-plan generation are user-reported. AI reviewed MSA text at the user's direction.
Named student owner, exact-diff understanding/acceptance and native listening remain **PENDING**.
No additional human participation or approval is inferred. English narration is unselected.

### Candidate behavior and evidence boundaries

A player is allocated only by accepted Play/Replay. A fresh token binds the current source,
locale, moment, generation and entry epoch. Pending intents coalesce. The hook displays playing
only after a matching loaded/non-buffering player status. A 10-second startup deadline falls
back to readable text, without automatic retry. Stop remains available during loading.

Cancellation clears the active session before controller cancellation/disposal and independently
guarded subscription removal, player removal and player release. Entry wrappers cancel before
step/close/finish/Back/language/profile callbacks. Layout cleanup handles changed scope and unmount.
Known-active AppState and observed screen-reader-disabled state are required. Unknown or failed
observation fails closed; newer reader events take priority over the initial query. Background,
reader enablement, observed interruption, error and completion retire the session. Foreground
return, reader disablement and source changes do not play audio.

| Check                                   | Current status / exact scope                                                                                                      |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Approved asset identity                 | PASSED A190: actual resolver registration/order, exact three SHA256s, invalid-step/inactive/English rejection                     |
| Entry/Story rendered controls           | PASSED A190: full text, silent/load/play/replay/reader/error controls, callback order and scope; effects are not exercised by SSR |
| Real React mount / mocked native events | BLOCKED pending working existing-Metro/ReactDOM harness and A's preview resource grant after B release                            |
| Actual botanical browser layout         | NOT RUN for this delta; requires the real unmocked presentation, separate from lifecycle doubles                                  |
| Full integrated type/lint/format/suite  | A-owned pending after heavy release; A's earlier 768MiB TypeScript heap failure is not a source diagnostic or a pass              |
| Native playback, focus and TalkBack     | BLOCKED; no authorized device/artifact result                                                                                     |
| Public video/demo/APK rights            | Pending competition-use classification and format-specific attribution; internal noncommercial evaluation only                    |

Ignored harness preparation uses an explicit C project root, private run/cache directories and
future localhost8082. Its proof records candidate HEAD plus individual source/asset hashes and
process PID. Native/audio and presentation doubles are explicit; it mounts the real React hook,
components and A controller but cannot pass actual fonts, touch geometry, native audio or TalkBack.
No harness server/browser is launched while B holds the heavy slot. No API key is read or bundled.

### Direct Android collection packet — T014b

Use A's next published APK/source/hash, not baseline5d. D owns the device session; actual model,
OS and owner-approved font settings remain unknown until observed. Keep ordinary text and
owner-approved enlarged text in separate rows. CSS200% is not Android font scale.

1. Signed-out demo entry `/`: verify exactly Parent, Salem and Alya with no automatic sound;
   open the three-moment story. Collect `ar-together-silent`, `ar-support-silent`,
   `ar-growth-silent` screenshots with full body and visible navigation/audio labels.
2. Explicitly press **استمع إلى النص**; collect `ar-together-playing` and one actual loading
   state if observable. Check Stop **إيقاف السرد** is reachable immediately, then Replay
   **إعادة الاستماع** starts a fresh reading. Confirm each moment uses its approved body clip.
3. While starting/playing, separately test Next, Back button, hardware Back, Skip, Finish,
   language change and exit/profile entry. No audio may delay navigation or resume on return.
   Record exact event sequence and observed sound, not only a static screenshot.
4. Background/foreground, transient audio focus interruption followed by Stop and focus return,
   and background followed by Stop/cancellation and foreground require actual device evidence.
   An already-captured native reference may outlive JS retirement; source/mocks do not prove this.
5. With owner-approved TalkBack settings, narration must remain silent, text and controls readable,
   and focus follow headings/navigation. Enable the reader while loading/playing, then disable;
   no automatic restart. Collect `ar-screen-reader-priority` and the actual focus/event notes.
6. English keeps complete equivalent text and `Narration is unavailable. Read the text and continue.`
   Collect `en-support-silent`; no Arabic or old six-step clip substitutes for English narration.
7. Collect `ar-support-large-text` and `en-support-large-text` at observed native settings; inspect
   full labels, wrapping, touch/focus order, mixed-script language action and no cropped final words.
   Reduced motion must expose the same content and controls promptly; no motion gates access.
8. Restart/reset and reenter: silent initially, no old completion/error/seek may restart playback.
   Record APK SHA, source identity, date/operator, actual font/accessibility settings and outcome
   PASSED/FAILED/BLOCKED/NOT RUN for every row. Do not modify global settings without owner approval.

### A190 source checkpoint — 2026-09-12T12:14:01Z

Executed from `/home/smyk/projects/Ghaf-ui-studio`, base fa9821c plus the seven-file C slice:

```bash
node --max-old-space-size=256 node_modules/vitest/vitest.mjs run tests/demo-entry-presentation.test.tsx tests/demo-narration.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism
```

**PASSED: 2 files, 40 tests**, exit0. Actual UTC12:13:59.448–12:14:01.478; child PID189456,
command session38387 both ended. Initial memory2933824/7829156KiB (37.47%) satisfied A190's35%
guard. Timeout60s was not reached. Exact command, input hashes and log:
`output/native-ui/narration-lifecycle-harness/checks/20260912T121359Z/{receipt.json,focused.log}`.
The 40 tests include unchanged existing presentation cases; they are not 40 new lifecycle tests.
No full TypeScript/lint/suite or browser process was run. Scoped Prettier and `git diff --check`
pass for this slice; A retains mandatory adequate-memory full checks after B heavy release.

Lead owns the actual Story/control implementation and both test edits; the helper's scope remains
ignored doubles only. No helper runtime code is included in this source checkpoint. All seven
changed source/test/report paths may integrate as one cohesive candidate; exact commit is published
in canonical STATUS-C. The unused types.ts grant is also released without a change. C retains
only its status and A183 ignored harness preparation while awaiting the preview allocation.
Any actual mounted defect must be corrected under the live ownership grant before claiming its row.
This checkpoint does not end the active continuation: helper preparation, A integration and B's
packaging are verified in-flight handoffs. No paired screenshot exists for this delta yet.
