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
