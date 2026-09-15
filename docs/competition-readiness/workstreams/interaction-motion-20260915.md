# Interaction motion convergence — 2026-09-15

Objective: answer the user's further request for interaction quality by finishing the
press policy the earlier passes wrote down and by making two committed state changes
continuous. Starting runtime `35631f7` with a clean working tree. Source boundaries are
in [STATUS-INTERACTION-MOTION](../coordination/STATUS-INTERACTION-MOTION.md). Claude
implemented this pass with no subagent and no device lane. No human motion acceptance
or authorship is inferred.

## Repository and compatibility evidence

`package.json` and `package-lock.json` resolve Expo 57.0.20, React Native 0.86.3,
React 19.2.3, Expo Router 57.0.19, Reanimated 4.5.1, Worklets 0.10.1, Gesture Handler
2.32.0, Screens 4.26.x and Tamagui 2.7.7. No haptics, bottom-sheet, Lottie, Skia or
keyboard library is installed. `app.config.ts` keeps `predictiveBackGestureEnabled:
false` and `softwareKeyboardLayoutMode: 'resize'`. This pass changed no dependency,
lockfile entry, native configuration, navigator option, route, guard, store, service
or award rule. Every API used here already appears in shipped code in this repository:
`useSharedValue`/`.get()`/`.set()`, `useAnimatedStyle`, `withTiming`, `cancelAnimation`,
`interpolateColor`, `ReduceMotion.Never` and `Animated.View`.

## Audit of the current experience

Source-confirmed findings from reading the shipped components. These are not observed
frame measurements; no emulator or device ran in this session.

| Interaction / file                                                                             | Evidence                                                                                                                        | Problem                                                                                                           | Change                                                                                     | Benefit                                                         | Risk                                                          |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------- |
| Parent bottom tabs, `r002a/parent/ParentHomeNavigation.tsx`                                    | Raw `Pressable` with `pressed ? styles.pressed : null` (`opacity.pressed`), no shared primitive.                                | The most-touched Parent control had a hard opacity step while every shared button had a settled scale.            | Route through `BotanicalPressable`; drop the local pressed opacity.                        | One press language across the app.                              | Low; broad reuse, existing tests cover layout.                |
| Child bottom tabs, `r002a/child/ChildBottomNavigation.tsx`                                     | `BotanicalPressable` **and** `pressed ? styles.pressed` stacked on the same press.                                              | Scale plus opacity is the stacking `docs/motion.md` P2 already recorded as a defect.                              | Remove the stacked opacity; keep the disabled dim.                                         | Feedback reads as one response, not two.                        | Low.                                                          |
| `IconButton`, `src/components/primitives.tsx`                                                  | Raw `Pressable` with an instant `opacity: 0.76` + `scale: 0.985` style, two functions below a `Button` that uses the primitive. | Two press behaviors in one file; headers and flow controls snapped while their neighbours settled.                | Route through `BotanicalPressable`; delete the duplicated pressed styles.                  | Header and dialog controls match the shared buttons.            | Low; disabled/focus paths asserted in tests.                  |
| Child checklist progress, `r002a/child/ChildTaskChecklist.tsx`                                 | `width: ${progress}%` recomputed per toggle.                                                                                    | The core child loop jumped between discrete widths, so the advance was never visible as an advance.               | Transform-driven fill settled with the shared progress preset, anchored at the start edge. | The step the child just finished is legible as travel.          | Low-medium; the RTL anchor is asserted as a style value only. |
| Child checklist row state, same file                                                           | Row background, border and the check icon all switched on the same render; the icon was conditionally mounted.                  | The completed state appeared with no relationship to the tap that caused it, and a remount could pop the icon in. | `interpolateColor` row tint and box edge plus a mounted mark, all on one settled value.    | One readable completion, no entrance replay on remount.         | Low; colors are light-on-light throughout.                    |
| Parent task-details disclosure, `catalog/CatalogTaskList.tsx` and `catalog/CatalogDetails.tsx` | `{expanded === entry.id ? <CatalogDetails/> : null}`.                                                                           | The list jumped by the height of a text block with nothing connecting the toggle to the content.                  | New measured `ExpandableSection` primitive with height and fade.                           | Review details arrive attached to the control that opened them. | Medium; measured layout, no device profiling.                 |

## Deliberately left unchanged

- **Selected-tab pills in both navigations stay instant.** A translating or
  cross-fading indicator would put a tab label over a partly changed background. The
  Child pill is `botanical.colors.forest` with an `onForest` label, so any fade drops
  the label's contrast mid-transition. Instant selection is the accessible answer here,
  and matches platform tab bars that recolor without animating the selection.
- **Native page transitions and `navigationMotionOptions`** landed in `35631f7` with
  their own suites; peers are already `animation: 'none'`. No second animation was
  layered over the native transition.
- **The native `Modal` sheets** (`ChildCompletionConfirmationSheet`,
  `ParentSupportRequestSheet`, `SuccessSheet`) keep their focus-safe lifecycle. A
  draggable sheet would be a new gesture surface and is out of this scope.
- **Existing RN `Animated` code** (onboarding, garden landscape, loaders) is not
  migrated for stylistic consistency.
- **List rows** keep stable identity with no entrance animations; the workspace
  carousels are untouched so recycling cannot replay motion.
- **Haptics** are not added. No haptics library is installed and `AGENTS.md` requires a
  measured gap and explicit owner approval before a new dependency.

## Motion presets added

`src/design/motion.ts` extends `interactionMotion` only; frozen `botanical.motion`
tokens are unchanged.

| Preset                  | Value  | Purpose                                                                                       |
| ----------------------- | ------ | --------------------------------------------------------------------------------------------- |
| `timing.progress`       | 200 ms | A committed checklist step reads as one advance and still finishes before a child's next tap. |
| `timing.disclosure`     | 220 ms | A measured section travels further than a tint, so it uses the upper small-transition band.   |
| `timing.disclosureFade` | 140 ms | Disclosure content is legible before the height settles, reusing the existing fade duration.  |

Existing `press` (120 ms), `state` (180 ms), `panel` (260 ms), the press scale 0.985 and
the clamped release spring are reused unchanged. These are Ghaf tuning choices, not
Apple specifications or measured performance.

## Implementation notes a reviewer will ask about

- `ExpandableSection` keeps its content mounted after the first opening. Unmounting
  after a close would need a worklet completion callback crossing back to the React
  runtime, and remounting would remeasure and flash on reopening. The closed state is
  therefore guarded by `pointerEvents: 'none'`, `accessibilityElementsHidden` and
  `importantForAccessibility="no-hide-descendants"` instead. A section that was never
  opened renders nothing at all.
- The transform anchor for the progress fill is asserted as a style value in tests.
  Whether the composed transform honours `transformOrigin` on the Android new
  architecture is a rendered behaviour, and it is native gate 2 below. That gate is the
  most likely place this pass looks wrong on a device in Arabic.
- `IconButton` now inherits `BotanicalPressable`'s native-ripple opt-out. It passes no
  `android_ripple`, so it takes the scale path; no ripple behaviour is claimed or wired.
- The completed row tint, its 2 dp box edge and the check mark all read the same settled
  value, so no part of one completion snaps while another travels.

## Reduced motion and accessibility

Every new animation reads `useReducedMotionPreference` and passes
`ReduceMotion.Never`, so the live Android setting supersedes Reanimated's startup
snapshot exactly as `BotanicalPressable` already does. When motion is reduced, final
values are assigned directly and no animation is scheduled. All animations cancel on
retarget and on unmount. A closed `ExpandableSection` is `pointerEvents: 'none'`,
`accessibilityElementsHidden` and `importantForAccessibility="no-hide-descendants"`
while it settles. The checklist progressbar keeps `accessibilityValue` on the committed
step count, never an in-flight value; checkbox roles, checked state, tab roles, selected
and disabled states, hit slop, press retention and focus rings are unchanged. No
business action waits for an animation.

## Validation actually run

| Check                                                                                               | Result                                                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run typecheck`                                                                                 | **PASSED**                                                                                                                                                                                       |
| `npm run lint`                                                                                      | **PASSED** (both invocations, `--max-warnings=0`)                                                                                                                                                |
| `npm run format:check`                                                                              | **PASSED** for the whole matched set                                                                                                                                                             |
| `npm run repo:check`                                                                                | **PASSED**                                                                                                                                                                                       |
| `npm test`                                                                                          | **PASSED** — 3,437 passed, 7 skipped, 238 files, repeated three times; one earlier run reported 3 failures whose identity was not captured before the log was replaced, and it did not reproduce |
| `npm test -- --maxWorkers=1`                                                                        | **PASSED** — same totals serially                                                                                                                                                                |
| New-test red/green                                                                                  | **PASSED** — with `ChildTaskChecklist.tsx` and `primitives.tsx` restored to `35631f7`, 9 of the 10 new assertions in the two applicable suites failed; all pass after the change                 |
| Android emulator or device, TalkBack, large text, keyboard, system animation settings, frame timing | **NOT RUN** — no device or build lane in this session                                                                                                                                            |

New suites: `tests/motion/interaction-press-convergence.test.tsx` (4),
`tests/motion/checklist-continuity.test.tsx` (6),
`tests/motion/expandable-section.test.tsx` (6). Two existing host suites gained mocks
for the new imports: `tests/presentation/parent-dashboard-presentation.test.tsx` and
`tests/tasks/child-approved-instruction.test.tsx`. Unit mocks report requested
animations and accessibility props; they do not measure rendered frames.

## Remaining native gates

Run these on a representative mid-range Android phone with a release build, comparing
`35631f7` against this candidate at the same locale, data, refresh rate and warm state.
Record commit and APK hashes for each.

1. Parent Home → Tasks → Garden → Family and Child Today → Garden → League: press,
   release, repress mid-settle, and drag off a tab into scrolling. Each activation must
   run once, the selected pill must change immediately, and no press state may strand.
2. Child task checklist with 2 and 5 steps in Arabic and English: toggle steps forward,
   backward and rapidly. The fill must grow from the reading start edge, never overshoot
   the track, and the announced value must match the visible count at rest.
3. Parent task list: open and close task details repeatedly, including during the
   animation, with TalkBack on. A closed section must not be reachable by swipe
   navigation, and the open height must match the content at 200% font scale.
4. Toggle Android Remove animations and transition animation scale while a checklist
   toggle and a disclosure are in flight; background and foreground mid-interaction.
   Content must settle immediately and stay usable, with no stranded height or scale.
5. Repeat with the keyboard open on the task screen, with system Back and the gesture
   navigation bar, and at the largest display size.
6. Capture a Perfetto FrameTimeline trace around the checklist and disclosure. Compare
   frame deadlines around the taps, not average FPS. The measured height animation in
   `ExpandableSection` is the item most likely to show layout cost on a low-end device;
   if it does, the fallback is the previous conditional mount with no animation.

No FPS, jank-free, production-readiness or human-acceptance claim is made here.
