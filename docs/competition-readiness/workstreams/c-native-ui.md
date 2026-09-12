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
