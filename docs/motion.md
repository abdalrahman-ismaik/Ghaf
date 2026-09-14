# Ghaf Android motion

This refinement keeps botanical styling, navigation, task authority and the existing
recognition sequence. Animation communicates feedback/readiness and never authorizes
an operation. Implementation authority and tasks are in the
[motion repair contract](../specs/003-family-growth-garden/motion-interactions.md).
The [session outbox](competition-readiness/coordination/STATUS-MOTION.md) records
exact file ownership alongside the concurrent backend/messaging session.

## Repository evidence and compatibility

`package-lock.json` resolves Expo 57.0.20, React Native 0.86.3, React 19.2.3,
Expo Router 57.0.19, Reanimated 4.5.1, Worklets 0.10.1, Gesture Handler 2.32.0,
Screens 4.26.2, Tamagui and its Reanimated adapter 2.7.7. No Gorhom bottom sheet,
Lottie, Skia, keyboard-controller or haptics library is installed. Expo Router owns
the stack (this version uses `standard-navigation`, not separately installed
`@react-navigation/native-stack`). Vitest 4.1.11 runs Node tests with host mocks.

This is Expo with generated, ignored Android files. Local `android/gradle.properties`
enables New Architecture, Hermes and edge-to-edge. Current app config disables
predictive Back for the verified API 35 compatibility fix (`9d756ef`) and retains
keyboard resize. The RN Gradle version catalog declares minimum SDK 24
(Android 7), compile/target SDK 36; generated app Gradle consumes the root defaults.
No custom Babel/Metro config is tracked. Installed `babel-preset-expo` 57.0.10
auto-configures the Worklets plugin; Metro is 0.84.5. Root already contains
`GestureHandlerRootView`. No package, lockfile, architecture or native config changes.

Checked current primary documentation on 2026-09-14:

- [Expo Reanimated](https://docs.expo.dev/versions/latest/sdk/reanimated/) recommends
  the installed 4.5.1 and confirms the Expo install/automatic Babel workflow.
- [Reanimated reduced motion](https://docs.swmansion.com/react-native-reanimated/docs/device/useReducedMotion/)
  documents its startup snapshot; the installed hook source confirms it does not
  rerender on setting changes.
- [React Native AccessibilityInfo](https://reactnative.dev/docs/accessibilityinfo)
  provides `reduceMotionChanged`, including Android disabled-animation settings.
- [Reanimated springs](https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring/)
  separates physics and duration configuration modes. This change uses physics only.
- [Expo Gesture Handler](https://docs.expo.dev/versions/latest/sdk/gesture-handler/)
  and [New Architecture](https://docs.expo.dev/guides/new-architecture/) were checked;
  no gesture recognizer or architecture migration is needed for these fixes.

Read installed animate-expo plus its press recipe, apple-design for principles,
Software Mansion animations/functions and gesture/tap references, and the available
Vercel native performance/press guidance. Broad skill prescriptions for web code,
new libraries, gesture-only buttons, spring parameter translation and zero-cost
transforms are not applied. Native Pressable semantics remain authoritative;
transforms still need device rendering/compositing measurements.

The installed Android AccessibilityInfo and Reanimated native implementations read
`TRANSITION_ANIMATION_SCALE`. The shared hook therefore follows Android Remove
animations/that platform accessibility signal. Disabling only the separate animator
duration scale is not covered by this API; no extra native settings bridge is added
in this compatible presentation slice.

## Prioritized source audit

These are source-confirmed findings, not observed frame-time measurements.

| Priority / component                                | Finding and user impact                                                                                                                 | Improvement                                                                                      | Risk / verification                                                            |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| P1 SectionTransitionOverlay                         | Leaving a buffered section invalidates its completion but does not clear visibility; Back during preload can strand a blocking overlay. | Clear presentation on section changes and ignore stale completions.                              | Low; deferred-load interruption and Back tests.                                |
| P1 BotanicalPressable, SuccessSheet, GhafLeafLoader | Startup-only reduced motion cannot react to Android settings while running.                                                             | One live, race-safe shared subscription; cancel and settle immediately, suspend in background.   | Medium; query/event race, cleanup and foreground tests, then Android settings. |
| P2 SectionTransitionOverlay                         | Cached assets still incur a mandatory 900 ms cover.                                                                                     | Readiness ends loading immediately; no decorative dwell.                                         | Low; cached/slow/failed preload tests.                                         |
| P2 BotanicalPressable / primitives Button           | Scale and 0.78 opacity are stacked on every shared CTA.                                                                                 | One subtle scale with a firm release; static opacity when motion is off; native ripple opts out. | Low, broadly used; press/cancel/disabled/busy tests and real touch review.     |
| P3 SuccessSheet                                     | Entrance explicitly resets to zero with preference changes; 36dp travel uses older slow timing.                                         | Retarget live progress using the shared small panel preset.                                      | Low; visible/preference interruption, announcement/action tests.               |

Keep finite, event-owned garden recognition, native navigation/Back, stable list
identity, scrolling and keyboard handling. No peer-tab slides, new drag gestures,
recycled-row entrances, blur, shadows, haptics or decorative loops. Other modal
wrappers and growth consumers still use their existing motion behavior; a full
application-wide accessibility migration is not implied by this bounded slice.

## Shared conventions

Changed runtime files are `src/design/motion.ts`,
`src/utils/useReducedMotionPreference.ts`,
`src/components/botanical/BotanicalPressable.tsx`, `src/components/primitives.tsx`,
`src/components/access/SuccessSheet.tsx`, and
`src/components/onboarding/{GhafLeafLoader,SectionTransitionOverlay}.tsx`.
`tests/motion/` adds preference, press and presentation regressions; the existing
`slice-two-accessibility` mock and `r003-first-run-experience` dwell assertion are
updated. Feature 003 spec/plan/tasks link the repair contract and its acceptance.

`src/design/motion.ts` extends existing botanical timings without editing historical
tokens. `useReducedMotionPreference` shares one native listener, handles changes and
foreground refresh, rejects stale queries and removes listeners after the last
consumer unmounts. Unknown preference/query failure/background uses static content.
Consumers explicitly cancel active work and assign final values. Re-enabling motion
does not replay a completed sheet. No per-frame React state or runtime round trips.

| Preset                      | Value / purpose                                                           | Applied to                                          |
| --------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------- |
| press timing                | 120 ms; immediate touch acknowledgement                                   | BotanicalPressable                                  |
| press scale                 | 0.985, inherited botanical identity                                       | Shared buttons/cards                                |
| press release spring        | stiffness 900, damping 60, mass 1, overshoot clamped; firm neutral return | BotanicalPressable release/cancellation             |
| fade / state / panel timing | 140 / 180 / 260 ms                                                        | Loading cover / reserved local state / SuccessSheet |
| panel displacement          | 24dp vertical settle, no horizontal/RTL dependency                        | SuccessSheet                                        |
| busy orbit                  | existing 1600 ms linear cycle                                             | GhafLeafLoader                                      |
| reduced                     | duration 0, scale 1, translation 0, static pressed opacity 0.88           | Live preference consumers                           |

These are Ghaf tuning choices, not Apple specifications or measured performance.
Reanimated animations run on the UI runtime; native Pressable dispatch still begins
on the React Native runtime. No claim that touch dispatch remains responsive under
arbitrary JS blockage. Business callbacks run immediately and independently of
animation completion. Existing route/modal ownership controls dismissal; no delayed
business close is introduced for an exit animation.

## Evidence and Android procedure

The original source-only results below are historical. The main continuation,
including current APK identities, emulator recordings, interruption/accessibility
results and remaining limits, is tracked in the
[native motion evidence](competition-readiness/workstreams/native-motion-main-20260914.md).

Onboarding now reuses the native access footer so progress/Next/Back remain
available while story content scrolls. Web keeps its inline navigation. Its image,
copy and perimeter use the shared 180 ms state timing; image/copy retain the small
8dp story displacement. An optional `LocalIllustration.transitionDuration` defaults
to existing behavior; onboarding passes zero to avoid a second image fade inside
the parent transition. Live preference changes cancel/settle without replay.
Only actual step visits animate. Visit-scoped image/settlement callbacks prevent
old work from authorizing narration after a rapid Next/Back reversal. There are
no navigation delays, new gestures or dependency/native configuration changes.

Baseline before source edits: 3 files / 42 tests passed (`r001-design-foundation`,
`slice-two-accessibility`, `r003-first-run-experience`, single worker). No baseline
failure in this focused set; a full pre-change suite was not run. The representative
press/preferences slice passed 20 new tests and TypeScript before reuse. Final
`npm test -- --maxWorkers=1` passed 2,765 tests across 192 files, with 2 opt-in tests
skipped; this includes all 31 new motion tests. Final `npm run typecheck` passed.
`npm run lint` found a test-harness hook naming error; after correction, the full
equivalent `node node_modules/eslint/bin/eslint.js app src tests workers
scripts/repository --max-warnings=0` passed. The first presentation test run exposed
a recursive helper bug, corrected before the passing full suite. No app failure
was hidden by those harness fixes. Changed-file formatting passed. Repository-wide
`npm run format:check` failed only on
`tests/access/corrupt-local-family-recovery.test.ts`, which is byte-for-byte unchanged
from starting commit `0ad7a0d`; that unrelated file was preserved. Commit identity
and the acknowledged backend handoff are recorded in the session outbox.

Android baseline recording, release frame-time comparison, physical-device feel,
TalkBack, keyboard, large text and live system animation settings: **NOT RUN** in
this session. The backend session owns the active emulator/phone/build lane. Its
installed APK does not contain or validate these changes. Unit mocks do not measure
native motion. No FPS or jank-free claim is made.

After the native lane is released, compare baseline and candidate release APKs on
the same supported mid-range Android phone with the same locale, data, refresh rate
and warm/cold state. Record commit/APK hashes and device/build identity for each:

1. Record a short screen capture and Perfetto FrameTimeline/system trace for the
   same access → Parent task creation → success → dismiss journey. Compare frame
   deadlines/jank around taps and transitions, not only average FPS. Do not compare
   Expo Go/debug to a release candidate.
2. Press, release, repress mid-settle, drag off a button into scrolling and cancel;
   repeat while busy/disabled. Confirm each actual activation invokes its action
   once and recognition/store idempotency still holds.
3. Open/close success repeatedly, use Back during entry, and navigate away while
   loading. Re-enter another role immediately; no stale cover, delayed close or
   stale completion may affect the new screen.
4. Toggle Android Remove animations and transition animation scale off while pressing,
   loading and presenting a sheet; return without restarting. Content settles
   immediately and remains usable. Re-enable and repeat. Background/foreground
   mid-interaction; verify no stranded scale or continuing hidden loader. Separately
   record animator-duration-only/OEM behavior against the API limitation above.
5. Repeat Arabic/English with TalkBack, large font/display size, keyboard open and
   gesture navigation. Check announcement once per opening, focus/dismissal order,
   48dp targets, safe areas, nested scroll and no unexpected horizontal movement.
6. Repeat on long task content and recycled lists. No new row entrance should play.
   Slow drag/flick tests apply to existing native scrolling only; this slice adds
   no custom drag surface or shared-element transition.
