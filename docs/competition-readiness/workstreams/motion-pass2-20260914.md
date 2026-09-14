# Android motion second pass — 2026-09-14

Objective: improve interruption, consistency and responsiveness in existing Ghaf
journeys while the concurrent agent completes login/backend/native delivery.
Starting runtime `5ad7faa`; backend independently committed its documentation as
`810c7ce`. Source boundaries and acknowledgments are in
[STATUS-MOTION-PASS2](../coordination/STATUS-MOTION-PASS2.md). Codex implemented this
pass, with one read-only flow/review helper and one bounded garden source/test
writer. No human motion acceptance or authorship is inferred.

## Actual previous state and chosen repairs

The previous shared press primitive, live preference subscription, cancellable
SuccessSheet entrance, section-loader interruption repair and onboarding footer
are implemented. Their timings and functionality remain the baseline.

| Existing journey / source defect                                                                                                   | Implemented result                                                                                                                                                                                                                   | Why this scope                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Parent-confirmed recognition → Garden: recognition still used the startup motion snapshot and reset both cues on effect changes.   | Garden now uses the live preference, cancels/settles both cues, and consumes each presented sequence once per mounted surface. Settings/background/play changes cannot replay that sequence; a fresh permitted sequence can animate. | Protect the main recognition moment and the static accessible outcome.        |
| Growth entry/actions/badges: direct pressed styles snapped between scale/opacity values, with separate 0.985 and 0.99 definitions. | Six control renderers reuse BotanicalPressable's immediate press timing and interruptible release. Native action callbacks, refs, accessibility, stable badge keys, disabled/busy states and touch layout are preserved.             | Reuse the proven primitive instead of another helper or arbitrary timing set. |
| Shared Growth confirmation → dismissal → rapid reopen: the unmounted child queued uncancelled interaction/frame callbacks.         | The persistent parent schedules restoration only after authoritative removal. Reopen/unmount cancels both stages; stale callbacks check ownership again.                                                                             | Prevent background focus stealing without delaying confirmation actions.      |

The Growth/Shared Growth surfaces retain their independent default-off flags. They
are candidate surfaces, not a claim that these controls appear in the delivered
pilot APK. Main Garden recognition remains part of the existing synthetic journey.
No login/account/domain/store/schema/route/flag/dependency/native config changed.

## Files and motion choices

- `src/components/family-growth/GardenLandscape.tsx`: reuse
  `useReducedMotionPreference`; sequence-owned finite presentation/announcement.
- `src/components/botanical/BotanicalPressable.tsx`: optional `reducedMotion`
  request preserves a caller's static presentation. `false` cannot override the
  system preference, and the prop is not passed to the native host.
- `src/components/r002b/GrowthJourneyScreens.tsx`: badge cards and Growth actions.
- `src/components/r002b/SharedGrowthScreens.tsx`: entry, recovery, participation
  and confirmation controls; persistent focus lifecycle.
- `tests/motion/{garden-recognition,growth-interactions,press-feedback}.test.tsx`
  and three existing source-contract suites cover the changed boundaries.
- `specs/003-family-growth-garden/motion-interactions.md`: bounded second-pass
  contract before implementation. This report and the outbox retain AI evidence.

No preset values changed. Existing shared feedback remains 120 ms toward 0.985,
with stiffness 900 / damping 60 / mass 1 / clamped release. Static feedback uses
opacity 0.88. Garden retains its finite event-specific timings. Garden timing and
delay explicitly use `ReduceMotion.Never` only after the live policy guard, so a
stale startup snapshot cannot suppress a newly permitted animation. Continuous
properties remain Reanimated transforms/opacity; no per-frame React state, new
gesture, loop, layout animation or animation-completion business callback.

Version evidence: installed Expo 57.0.20, RN 0.86.3, Reanimated 4.5.1, Worklets
0.10.1, Gesture Handler 2.32.0. Checked installed APIs plus official
[Reanimated timing documentation](https://docs.swmansion.com/react-native-reanimated/docs/animations/withTiming/)
and [RN Modal documentation](https://reactnative.dev/docs/0.86/modal).
Native modal/navigation presentation is retained. The existing deferred focus
scheduler is now cancellable; its ordering relative to Android's native window
dismissal still needs TalkBack execution.

## Validation

Initial executed baseline: 3 files / 41 tests passed. First integrated focused
run: 7 files / 74 tests passed. Subsequent final checks are recorded below.

- **PASSED:** complete single-worker Vitest regression: 203 files passed / 2
  opt-in files skipped; 3,005 tests passed / 2 skipped, including 22 new cases.
  Command: `node --max-old-space-size=768 --max-semi-space-size=4
node_modules/vitest/vitest.mjs run --maxWorkers=1 --no-file-parallelism`.
  Actual run: 18:39:55 local start, 122.98 seconds.
- **PASSED:** scoped ESLint of all four changed runtime files and six test files,
  with `--max-warnings=0` (memory-bounded Node; unchanged rules).
- **BLOCKED:** full-project `tsc --noEmit` exhausted host allocation; 768 MB and
  1,024 MB bounded retries exhausted their heaps. No successful full-project type
  result is claimed for this candidate; no checker options were weakened.
- **PASSED:** TypeScript on all ten changed source/test roots and their transitive
  dependencies, including the existing Expo and Vitest ambient roots, using the
  unchanged strict compiler options. Command: `node --max-old-space-size=1024
--max-semi-space-size=4 node_modules/typescript/bin/tsc --noEmit --project
.expo/motion-pass2-20260914/tsconfig.json`. This scoped check is distinct from the
  memory-blocked full-project command.
- **PASSED:** all four changed runtime files compiled in memory with installed
  `babel-preset-expo`, Metro's Android caller and the Worklets plugin; both animated
  components contain transformed worklets. Command: `node
.expo/motion-pass2-20260914/check-android-transform.cjs`. No output bundle/APK.
- **BLOCKED:** full `npm run lint` at a bounded 768 MB heap exhausted memory;
  a serialized 60-file batch at 640 MB also exhausted memory before completing.
  The successful changed-file ESLint run remains the lint evidence for this pass.
- **PASSED:** full `npm run format:check` and `git diff --check`. Changed
  workstream/contract/coordination Markdown was additionally formatted explicitly.

The hook/host tests execute interrupted shared-value ownership and actual component
callbacks, but do not render native frames. Cases include rapid press release and
repress, cancellation into scrolling via native press-out, explicit/system static
feedback, disabled/busy transitions, settings changes, partial garden interruption,
static first presentation, stale startup snapshot, repeated sequence, fresh sequence,
announcement deduplication, Back callback, dismiss/reopen before either queued
focus stage, stale callbacks, unmount and fallback focus when a trigger disappears.

The actual Shared Growth route closes confirmation before its synchronous store
operation, then displays saved/error status. The pending/error modal test exercises
supported presentation props; it is not evidence of a new async save flow.

Native APK/build/export: **BLOCKED / NOT RUN for this source**. Backend explicitly
acknowledged the separate lane and requested no local APK/export with C: nearly
full (27–44 MB observed). Its delivered APK remains source `5ad7faa` and contains
none of this pass. No package was installed, no remote job dispatched, and no
emulator/user settings or data changed here.

Representative physical-device release timing, dropped frames, touch/scroll feel,
actual Android Back/focus ordering, keyboard appearance/dismissal, TalkBack spoken
traversal, large-text clipping and before/after recording: **NOT RUN**. Source and
mock large-text/RTL props are not native layout acceptance. No FPS claim.

## Review walkthrough

1. In the synthetic task journey, complete Parent confirmation and open Garden.
   During the finite recognition cue, background the app or enable Remove
   animations. It should settle; returning/re-enabling should not replay the same
   receipt. A new permitted receipt retains its recognition sequence.
2. In an already authorized Growth candidate build, press and release an Impact
   Path action, badge card or Shared Growth entry. Drag off into scrolling and
   rapidly press again. Feedback should return through the shared release behavior;
   navigation/content must not wait for it. Repeat with static motion enabled.
3. In the Shared Growth candidate Parent settings, open a participation
   confirmation, cancel/Back and reopen quickly. The old dismissal must not move
   focus behind the new dialog. Dismiss normally and verify focus returns to the
   trigger, or current status if that trigger no longer exists. Navigate away during
   dismissal and verify no old callback moves focus on the next screen.

These are the exact native checks still owed, not claims they were performed. No
feature flags were enabled to expose candidate surfaces.

## Integration handoff

Local commits, preserving the repository's configured contributor identity:

- `8e32cd7`: Garden interruption/one-shot recognition, contract and nine regressions.
- `349d895`: shared static-motion request and private Growth press reuse.
- `d806d82`: Shared Growth press reuse, owned focus restoration and eleven regressions.

The other session's `0761c70` is documentation-only and is preserved. No push,
merge, branch switch, installation or remote dispatch was performed by this lane.
All source/test reservations are released after the final documentation checkpoint;
no checker, helper or native job remains active. The four runtime files are ready
for source integration review with passing full behavioral tests, scoped static
checks and Android source transforms. Full-project type/lint and native release
acceptance remain explicitly open. Next action: the integration owner includes
these commits in a future source-based Android candidate after resource/build
availability, then runs the exact native walkthrough above.
