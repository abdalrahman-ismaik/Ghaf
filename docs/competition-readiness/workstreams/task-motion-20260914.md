# Task interaction motion continuation — 2026-09-14

Resumed status: the Android emulator is running and the isolated synthetic Ghaf
Motion app has exercised both task sheets. Source is checkpointed in `a013897`
(sheet lifecycle), `3b970f9` (workspace feedback), `09a2569` (reachable sheet
actions) and `a34cf70` (large Arabic completion label). See the latest evidence
below; historical failures remain dated to their original snapshot.

Final boundary: implemented, locally committed and ready for source integration;
165 focused tests pass. Full TypeScript/lint/format passed in the final run. The
shared full suite remains red only in the other lane's concurrently changing
persistence tests; details below. Physical-device motion acceptance remains open.

Starting HEAD: `0f90d24`. The user requested another implementation pass and then
asked to open the Android emulator. This repair preserves the already dirty
navigation pass and the concurrent Feature019 implementation. It changes no
business rules, flags, dependency, gesture, reward or route.

## What changed

- Parent support and Child completion sheets now share
  `src/utils/useTaskModalPresentation.ts`. Previously dismissal queued unguarded
  focus callbacks immediately. Focus now follows committed closure; reopening
  and unmount invalidate old callbacks. Heading focus runs once per opening.
  Android requests focus on the next frame after removal; iOS waits for its native
  dismissal event. React Native Web retains its existing focus trap/restoration.
- These native sheets formerly used Reanimated's startup-only motion preference.
  Each opening now samples the existing live preference. The native theme stays
  stable while visible and closing: installed RN 0.86.3 recreates the Android
  dialog if `animationType` changes. Android system settings own in-flight native
  animation; this code does not claim to cancel it itself.
- Support selections formerly reset on every native `onShow`. They now reset
  only on a new opening, remain visible during exit, stay fixed while submitting,
  and survive failure for retry. Submission after cancellation or during pending
  work is inert, including keyboard activation while web/iOS retain exit content.
- `ParentTaskWorkspace.tsx` keeps the same 1dp border space around every category.
  Selecting one changes its color without adding 2dp to its dimensions. Category,
  Child-filter and current-task buttons use BotanicalPressable's shared response
  without the old extra pressed opacity. This workspace remains default-off.
- Both sheets reserve room for their action footer while long content scrolls.
  Android previously clipped Send and put Return below the initial viewport.
  The completion action also drops its optional arrow so larger Arabic text can
  wrap completely. No shared button primitive or font token changed.

The occasional sheets serve continuity and predictable focus. Frequent selection
and presses serve immediate feedback. No motion preset changed: shared presses
retain the existing 120ms/0.985 treatment and release spring; native slide/fade
remain native Modal-owned. No extra entrance, delay, spring, blur or haptic.

## Files and authorship

Root owns both sheet files, the new hook, `tests/motion/task-sheet-lifecycle.test.tsx`,
and the three updated presentation regression files (`slice-two-accessibility`,
`r002a-cross-slice-quality`, `r002a-parent-review-presentation`). One bounded helper
authored the workspace geometry/feedback change and six bilingual workspace tests
in `tests/motion/task-workspace-feedback.test.tsx`, then reviewed native lifecycle
risks read-only. No human review is claimed.

The unrelated workspace `previewLabel` change belongs to the implementation-audit
lane and is preserved. Its authorship and staging are separate from motion edits.
Ownership/outbox: `../coordination/STATUS-MOTION-CONTINUATION.md`.
Approved repair contract: `../../../specs/003-family-growth-garden/task-motion-continuation.md`.

## Executed evidence

Initial checks on this lane's source, before the resumed execution below:

| Check                                                       | Result                                                                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Focused motion/task/presentation suite                      | PASSED: 14 files / 147 tests, including 22 new cases                                                   |
| Full strict project TypeScript                              | FAILED on latest run in concurrent Gemini provider/tests/operations; an earlier snapshot passed        |
| Strict changed-root TypeScript with transitive dependencies | PASSED                                                                                                 |
| Scoped ESLint                                               | PASSED: all nine changed runtime/test files                                                            |
| Scoped formatting and Git whitespace                        | PASSED                                                                                                 |
| Full test run                                               | FAILED elsewhere: 3,148 passed, 10 failed, 2 skipped; 209 passing files, 6 failing, 2 skipped          |
| Full ESLint                                                 | FAILED elsewhere: three effect/state errors in Memory/FirstRun context and one task-route hook warning |
| Full formatting                                             | FAILED elsewhere: 16 concurrent Feature019 files                                                       |
| Android production Babel transform                          | PASSED for four runtime files; native build NOT RUN                                                    |

Full-suite failures are the concurrent recovery/memory reset boundaries and route
inventories, not the changed motion tests. Exact output is in ignored local
`.expo/task-motion-20260914/full-tests.log` and `format-check.log`. These results
describe a shared changing worktree, not a clean all-repository acceptance.
The latest project typecheck reported possibly undefined Gemini candidates/mock
tuples and un-narrowed operation results in the implementation-audit lane. Final
strict changed-root checking with transitive dependencies passed after the submit
guards; those unrelated source files are outside this repair.

Initial focused run: the new lifecycle/workspace cases passed; six historical
static-render cases still expected focus before committed dismissal and selection
reset on `onShow`. Those obsolete expectations were reconciled with new lifecycle
tests. Final native-code review caught dialog recreation, exit selection clearing,
and submit-during-exit risks; each correction has focused regression coverage.

Browser: Brave at localhost:8081, Expo development build, existing reduced-motion
preference enabled. Arabic synthetic Parent entry → approved 12-Seed recycling
task → Salem's displayed synthetic PIN → checklist → completion confirmation →
Parent review → support request ran through the actual UI. Completion was opened,
dismissed by its action, reopened, interrupted with Escape and reopened again;
the trigger regained focus and remained usable. Submission showed pending then
the actual submitted state, with no early Seed award. Support rapid selection
changes, Escape, focus return, fresh empty reopening, English copy, Space-toggle
and successful support submission were observed. Arabic was restored afterward.
Screenshot inspection confirmed the completion sheet and scrolling revealed its
bottom action. Attempted browser zoom did not establish a larger-text setting;
no large-text pass is claimed. This smoke preceded the final submit-while-hidden
guard; that extra nonvisual guard is covered by host execution.

Metro compiled web and rendered the app. It logged known web filesystem warnings,
an audio play/pause AbortError and a temporary stale import during the helper
rename; subsequent bundles completed. The concurrent lane's then-unresolved
audio/profile labels were reported in the outbox. No clean-console, release-web,
video, frame timing or Android performance claim follows.

Installed SDK/API review used local RN 0.86.3 Modal.js and ReactModalHostView.kt,
plus the [official Modal documentation](https://reactnative.dev/docs/modal) and
[Reanimated reduced-motion documentation](https://docs.swmansion.com/react-native-reanimated/docs/device/useReducedMotion/).
The Android production Babel transform completed for all four runtime files using
the installed Expo preset. This is source compilation only, not Hermes bytecode,
a full bundle, Gradle, APK or native execution.

## Initial native limits and walkthrough (historical)

This entire section describes the initial disk-blocked run. Resumed native and
commit evidence below supersedes its NOT RUN and uncommitted status statements.

ADB initially listed no device. `Ghaf_API35_ARM64Bridge -no-snapshot-save` was
launched with the user's updated permissions, then retried with startup logs. It
exited before boot because `hasSufficientDiskSpace` failed (about 0.83 GiB free on
C: initially). No installed app or AVD data was cleared. Local APK/export jobs were
not started under that constraint. No current physical device was available.

NOT RUN: native open/close reversals, system Back during transition, native gesture
interruption/fast scroll, TalkBack, IME, OS font scale, release frame-time comparison,
lower/mid-range physical-device feel and animation-disable changes while in flight.
Native mock events verify intent/cancellation only. The installed previous APK
does not validate this source candidate.

To experience the changes: complete the synthetic Child task and repeatedly
open/return from its completion sheet; submit it, enter Parent review and open
Request another kind attempt, select topics, dismiss and reopen. Try both languages.
In an already-authorized workspace preview, switch categories and Child filters
rapidly; content remains immediate and category dimensions stay constant.
Source boundary is reviewable independently; native motion acceptance remains open.

Original checkpoint BLOCKED: the local Git add/commit attempt failed with `No space left
on device`. C: subsequently reported 0.00 GiB free. HEAD remains `0f90d24`; the
index is empty and all motion source remains in the worktree. No commit or push
occurred. Source reservations are released. Next action: free disk space, rerun
the focused checks, commit only these scoped paths/hunks (preserving the other
workspace preview-label edit), then build and validate on Android.

## Resumed execution with disk space and new permissions

The user resumed this task with unrestricted tool permissions and 7.64 GiB free.
Both cohesive motion commits succeeded; the unrelated workspace `previewLabel`
hunk remains uncommitted and untouched by these commits. Exact scoped source is
`3b970f9`; the main working tree still contains concurrent Feature019/navigation
work, so a whole-repository acceptance is not claimed.

- PASSED: repeated focused suite, 14 files / 147 tests; scoped motion ESLint.
- PASSED: full project TypeScript and full project formatting at this snapshot.
- FAILED: full lint, only the unnecessary `journey` dependency warning in the
  NAV-MOTION-owned `app/parent/task/new.tsx`.
- FAILED: full suite, 3,183 passed / 17 failed / 2 skipped; 214 passing files,
  5 failing, 2 skipped. Failure groups are local-family-profile-repair (2),
  live-child-ai-grants (3), family-connections-edit (2), league-profile-header (5)
  and composer-profiles (5). All report reset-fixture rejection / changed saved
  family, outside this motion boundary. Output: ignored `resumed-tests.log`.

The API35 emulator booted (`sys.boot_completed=1`) and the existing Ghaf app opened.
Its existing adult session was preserved; no account/family interaction or reset
was performed. Android showed a System UI timeout during startup while host free
RAM was exceptionally low; after choosing Wait the app rendered. These captures
contain existing account information and remain ignored local artifacts. This
does not establish candidate motion quality. Root stopped only its emulator to
recover RAM before compiling an isolated synthetic candidate.

Root extracted an immutable runtime archive at `3b970f9` (SHA256
`9d3300bd5e8130a9b6b80900e21fd0b5ae55a6e669ec8c139d344bc9ca09a19e`). The build
uses the already installed dependencies with a build-only Metro resolver and
explicit demo/mock flags; dotenv, account service settings and live AI are excluded.
This intentionally excludes concurrent uncommitted Feature019/navigation changes.
Root owns ignored compilation/packaging scripts. The resumed helper only supplied
a read-only feasibility assessment; no independent native compatibility pass is
claimed from it. Native package and device results follow separately.

The first isolated export compiled but failed resource identity: its shared
`node_modules` junction added a relative-folder prefix to generated Android asset
names. No app/resource content changed. A build-only
[Metro asset plugin](https://metrobundler.dev/docs/configuration/#assetplugins)
restores the original dependency asset paths in both the JavaScript registry and
copied resources. The subsequent candidate must still match all 98 resource hashes
exactly; no resource check was relaxed. The first failed receipt is preserved.

The `3b970f9` candidate passed export, Hermes98, all 98 resources, alignment,
signature verification and exact ZIP payload checks. It installed as Ghaf Motion
(`ae.ac.ku.ghaf.motiontest`, Android UID10211), distinct from original UID10209
and Test2 UID10210. APK SHA256:
`1295eaaa43ca59bb0798e44ffd489e46596610387c0da62125d952336e6feaea`.
Only the JavaScript bundle and three package-identity payloads changed; 1,623
other payloads match the pinned compatible container. This is a local test-only
APK with production JavaScript/Hermes, not a fresh Gradle/release build.

Native execution reached Parent task creation, validation error, prepared Guide
clarification, acceptance, approval, Child selection, both checklist items and
completion confirmation. The Parent wording field showed the IME; Back hid it
(`mInputShown=true` then `false`) without leaving the composer. A settled completion
sheet dismissed with system Back. Immediate open/Back input returned cleanly to
Today without leaving an overlay; this is early-Back/unmount evidence, not a
measured open/close reversal or velocity-continuity pass. Candidate launch also
encountered the host-starved System UI timeout; later UI actions completed.

Native inspection found a further actionable defect at the existing 720×1600
override / density320 / font1.0: the Child sheet's long Arabic body partially
clipped Send in its initial viewport and placed Return below the fold. Root moved
the two sheets' actions into reserved nonshrinking footers while their bodies
scroll. This is committed in `09a2569`; no duration, spring or state action changed.
Its 52 focused tests, strict changed-root TypeScript and scoped ESLint pass.
The follow-up immutable `09a2569` archive includes intervening committed study-date
and saved-template fixes by the other lane; this session does not claim to validate
those features. It still excludes their uncommitted work.

## Native footer and large-text follow-up

The `09a2569` APK (`6d59ae46ab9adeb854e370940e7ae504318a4dc87cc36cb7096b45c4a3a15b5d`)
passed the same export, Hermes, resource, signature and payload checks. On Android,
the initial completion sheet now shows both full action targets at normal font.
At system font scale 1.3 both targets remain accessible, but visual inspection
found the Arabic Send label clipped beside its arrow. Root removed only that
decorative icon in `a34cf70`, matching the text-only support action. Its lifecycle
suite (16 tests), scoped ESLint, formatting and whitespace checks pass.

Executed against `09a2569`, Arabic, font 1.3 and all three OS animation scales 0:

- Completion: Return, reopen, Submit and actual submitted state passed. Changing
  the animation scales while the sheet was visible left it usable.
- Support: quick first/second/first toggles left only the second item checked;
  system Back followed by reopening cleared both choices and disabled Send.
- Starting a scroll on the selected support item preserved its selection and
  moved the body without moving the footer. Sending then reached the support-sent
  state. There was no overlay preventing the next interaction.

Changing font scale while completion was open recreated the Android activity and
returned to Today; the existing task-recovery flow required checking transient
steps again. This is not an in-place font-change continuity or progress-retention
pass. Large-text checks reopened the sheet after that configuration change.
Evidence remains ignored under `.expo/task-motion-20260914/`: `completion-footer-normal`,
`completion-large-open`, `native-submitted`, `support-rapid-selection`,
`support-reopened-empty`, `support-scroll-cancellation` and `support-sent-native`.

The final immutable native candidate is `a34cf70`, archive SHA256
`164794d1cc06d1e02b3efa2966cb9ea9cd330bb70da3e8cde2a5a6c63b415619`;
installed APK SHA256
`2f7d21ab54a9339f0063979d1068823009aaa37541acac28f5c2686d32bc4079`.
Export, Hermes98, all 98 resources, alignment, signature and payload checks passed
again. Package compatibility additionally verifies the other lane's exact
typecheck-script-only change; no dependency or native config allowance was added.
The snapshot includes its intervening committed persistence/workspace work;
these task-flow checks do not establish acceptance of those independent features.

PASSED on that installed candidate at font 1.3 / OS animation scales 0: the full
Arabic completion label now wraps to two lines instead of losing its final word;
both footer controls are fully visible. Return works, reopening works, and the
final Submit reaches `child-task-submitted-screen`. Evidence: `label-completion-final`
PNG/XML/JSON and `label-submission-result`. Immediate Back just after an opening
request again returned to Today before the modal owned Back; no overlay remained,
and Resume worked. Its misleadingly named `label-submitted-final` capture records
that Today state, not successful submission. Recovery rechecks transient steps.
This does not pass in-flight visual reversal or preserved gesture velocity.

All four emulator settings were restored and read back against the saved baseline:
window/transition 1.0, animator setting absent, font scale 1.0. Receipt:
`settings-restored-final.json`. `installed-final-sha256.txt` matches the final APK.
The emulator remains open; original Ghaf and Test2 accounts/data were preserved.

## Remaining evidence limits

- Native functional evidence is from an API35 x86 emulator with the ARM64 bridge,
  360dp width, and an isolated synthetic test-only compatible container. No fresh
  Gradle release build or distributable release acceptance: installed NDK 27.0
  differs from RN's required 27.1 and CMake is absent.
- TalkBack focus restoration, physical lower/mid-range device feel, predictive
  Back, velocity continuity, frame timing and comparable release performance are
  NOT RUN. No FPS or smoothness claim follows from host tests or emulator captures.
- Repeated input, stale completion callbacks, busy/error retry and unmount guards
  have host execution coverage. UI-runtime visual interruption remains separate.
- Browser Arabic/English keyboard and focus checks preceded the footer/icon
  polish. Native final large-label visual checking is Arabic; English equivalence
  remains covered by existing bilingual tests and the earlier browser flow.
- The task workspace remains default-off. Its geometry and pressed-feedback
  changes have host coverage; no native workspace gesture/performance pass.

## Walkthrough

In Ghaf Motion, use the synthetic Parent entry to approve the recycling task,
then open the Child demo and complete its checklist. Open the confirmation sheet,
scroll its summary and use Return/reopen: both actions stay available. Submit,
return through the existing Parent entry and request another kind attempt. Toggle
support topics, scroll, dismiss and reopen to see intentional selection reset.
For the default-off workspace in an authorized preview, switch category and Child
filters: content changes immediately and category borders reserve constant space.

## Final checks and handoff

- PASSED: final full project TypeScript, ESLint and formatting (`final-checks.json`
  and corresponding `final-typecheck`, `final-lint`, `final-format` logs).
- The first final full suite passed 3,199 tests and failed one historical
  presentation assertion requiring the removed arrow. `47ebfef` replaces it with
  the reserved-footer structure assertion; all 18 tests in that file pass.
- The corrected full run at 22:01:16 local passed 3,200 tests, failed 24 and
  skipped 2 (218 passing files, 1 failing, 2 skipped). All failures belong to the
  implementation-audit lane's actively edited `local-family-repository.test.ts`
  ignored-write/readback/migration/repair/pairing cases. The source and tests were
  changing during the run; no clean-snapshot acceptance is claimed. The owner
  received the exact `final-tests-corrected.log` result in MOTION-CONT-016.
- PASSED: final bounded motion/task/presentation rerun at 22:03:45 local,
  15 files / 165 tests, including the corrected footer regression. Receipt:
  `final-focused.log`. Final changed-test ESLint and formatting also passed.
- PASSED: source whitespace checks and both handoff documents' formatting.

This root authored the additional footer, large-label, regression and native
packaging work. Its one helper's final read-only review found no further material
lifecycle defect and corrected historical-report wording. There is no student or
independent physical-device acceptance claim. No push, deploy, original-account
mutation or artifact cleanup occurred. All exact source/test reservations are
released after this documentation checkpoint; other lanes' work remains intact.
The emulator is open on Ghaf Motion's Child Today, showing the submitted task.
Next acceptance action is the recorded physical-device/TalkBack/performance pass;
the independent persistence owner retains the unrelated full-suite failures.
