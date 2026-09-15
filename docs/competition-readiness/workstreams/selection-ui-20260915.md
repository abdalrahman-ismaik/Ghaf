# Selection control convergence — 2026-09-15

Objective: continue the user's request to improve the UI after `13795b5`, this time on the
visual system rather than motion. Starting runtime `13795b5` with a clean working tree.
Boundaries are in [STATUS-SELECTION-UI](../coordination/STATUS-SELECTION-UI.md). Claude
implemented this pass with no subagent and no device lane.

## How this was audited

Unlike the earlier motion passes, this one was audited against the running application. The
local Expo web dev server was started from `scripts/start-demo.mjs`, the demo journey was
walked at 375x812 and 360x640, and computed styles were read out of the page rather than
judged from screenshots. Two hypotheses formed from screenshots were checked and **discarded**
this way: card body text is `text-align: right`, not centred, and the Garden screen is not
rendered at a larger scale (the screenshot device pixel ratio changed between captures).
Web is the secondary surface; Android remains authoritative and did not run.

## Measured state before the change

Values read from the running Tasks screen and Settings screen. Every row below is a control a
parent uses in the demo journey.

| Surface                               | Unselected                          | Selected                                     |
| ------------------------------------- | ----------------------------------- | -------------------------------------------- |
| Tasks, child filter (`radio`)         | transparent, no border, muted label | `rgb(18,106,80)` ghafEmerald, white label    |
| Tasks, status filter (`tab`)          | transparent, no border, radius 10   | `rgb(231,236,221)` sage, radius 16           |
| Task workspace child filter (flagged) | `sage` fill                         | `forest` fill, white label                   |
| Settings, sound level                 | `Button` variant `secondary` (sage) | `Button` variant `primary` (forest)          |
| Settings, app language                | transparent                         | `rgb(29,104,79)` fill plus an underline mark |

Four different selected fills, three different unselected treatments, and in the two filter
rows that sit directly above each other an unselected option had no container at all — it read
as plain text beside one button. The status row also changed corner radius between its
selected and unselected states (16 against 10), and the row carried a `borderBottomWidth`
tab-bar underline underneath pill-shaped items.

Two further observed defects:

- The task history list rendered its empty section as a bare `<Text>` sentence. The repository
  already contains a designed empty card in `ParentTasksView.tsx`, but that component is
  **never rendered** — `app/parent/index.tsx` imports only `ParentTaskWorkspace`, and the sole
  other reference is a type import. The good empty state was unreachable.
- Parent Settings renders `<LanguageSwitcher compact />` inside a full-width bordered box. Its
  compact options are fixed at 72 dp with `flex: 0`, so the box stretched to 320 dp and left
  about 176 dp of empty bordered space beside the two options.

## What changed

| Change                                                                                                                                                                          | Files                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| New shared `SelectionChip`: one selected surface, an unselected option that still reads as a control, 48 dp target, `radio` or `tab` semantics, equal-segment or hugging layout | `src/components/botanical/SelectionChip.tsx`          |
| New shared `EmptyState`: icon well, optional title, message, one accessible name                                                                                                | `src/components/botanical/EmptyState.tsx`             |
| Tasks child filter and status filter adopt the chip; the row keeps its `radiogroup` and `tablist` roles and drops its own container background and underline                    | `app/parent/index.tsx`                                |
| Flagged task workspace child filter adopts the chip, so turning the flag on cannot reintroduce a third idiom                                                                    | `src/components/r002a/parent/ParentTaskWorkspace.tsx` |
| Settings sound levels adopt the chip instead of primary/secondary `Button` variants                                                                                             | `src/components/settings/AmbientSoundSetting.tsx`     |
| Task history empty section uses the shared empty state                                                                                                                          | `src/components/catalog/CatalogTaskList.tsx`          |
| The compact language switcher hugs its own options instead of stretching a bordered box                                                                                         | `src/components/LanguageSwitcher.tsx`                 |

Selected is `sage` with a `sageStrong` edge and a `deepForest` label; unselected is `paper`
with a `line` edge and an `onSurfaceVariant` label. The choice is deliberate and follows the
earlier motion finding: a dark fill under a light label cannot change state gradually without
dropping the label's contrast partway through, which is why both bottom navigations keep
instant selection. Keeping filters light on light leaves a future transition available and
matches the Parent navigation's selected pill.

**This is a trade, not a pure gain.** The previous child filter separated its selected option by
a dark fill with a white label, which is a much larger luminance step than sage on paper. The
selected chip is now quieter, and more of the signal is carried by the 1 dp `sageStrong` edge and
the darker label. That buys one idiom across every row, an unselected option that reads as a
control, and a state that can change gradually later. Whether the remaining separation is
sufficient is not settled by these screenshots: native gate 2 measures it with an instrument.

Both filter rows use equal-width segments. An early version left the child chips hugging their
labels, which measured 64 dp and 61 dp beside each other where the previous row had been a
uniform 88 dp; adjacent chips of different widths read as ragged in the row this pass exists to
tidy. They now measure 164 dp each, matching the 106 dp segments of the status row directly
below. Hugging chips remain the right layout for the four sound levels, whose labels differ in
length and wrap as a set.

## Measured state after the change

Read from the running app at 375x812 and again at 360x640:

- Tasks child filter and status filter: unselected `rgb(255,252,245)` paper with a
  `rgb(220,221,207)` line border; selected `rgb(231,236,221)` sage with a `rgb(202,217,187)`
  border. Every chip 48 dp tall with a single-line label at both widths. The two child chips
  measure 164 dp each and the three status chips 106 dp each, so both rows are equal segments.
- Task history empty section: a 335 x 162 dp card whose single accessible name is the empty
  message. No caller passes a title, so the card shows the icon and the message only.
- Settings sound levels: same two surfaces, 48 dp, replacing the forest/sage button pair.
- Settings language group: 146 dp wide, hugging its two 72 dp options, with no empty bordered
  space beside them.

## Deliberately left unchanged

- **`LanguageSwitcher`'s own visual idiom.** It is a bilingual segmented control whose options
  carry their own script direction, font language and a focus mark. Converting it needs label
  language and direction support in the chip and touches every surface that embeds it; it is a
  separate pass. Only its compact stretching was corrected here.
- **The task workspace category rail.** Its card already has an opaque paper surface and a sage
  icon well, so a shared fill would hide the well and change nothing visible; the card keeps a
  border-only selected state, which is a normal card idiom rather than a fourth chip.
- **`ParentTasksView.tsx`.** It is unrendered dead UI. Its empty-card pattern informed the new
  `EmptyState`; deleting the component is out of this boundary.
- **Bottom navigation selection** stays instant and keeps its own pill, for the contrast reason
  recorded in the motion workstream.
- **Copy.** The Tasks screen still shows two differently worded actions for the same intent
  (`r002aTasks.createTask` and `catalog.create`). Fixing that means bilingual resource edits and
  is not part of this visual boundary.

## Validation actually run

| Check                                                                      | Result                                                                                                                                                                             |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`                                                        | **PASSED**                                                                                                                                                                         |
| `npm run lint`                                                             | **PASSED** (both invocations, `--max-warnings=0`)                                                                                                                                  |
| `npm run format:check`                                                     | **PASSED**                                                                                                                                                                         |
| `npm run repo:check`                                                       | **PASSED**                                                                                                                                                                         |
| `npm test -- --maxWorkers=1`                                               | **PASSED** — 3,449 passed, 7 skipped                                                                                                                                               |
| New-suite red/green                                                        | **PASSED** — with the five changed runtime files restored to `13795b5`, all four integration assertions in `tests/presentation/selection-controls.test.tsx` failed; all pass after |
| Observed web behaviour at 375x812 and 360x640                              | **PASSED** — computed styles above; single-line labels and 48 dp targets at both widths, Arabic and English                                                                        |
| Android device or emulator, TalkBack, large text, measured contrast ratios | **NOT RUN** — no device lane in this session                                                                                                                                       |

`tests/presentation/selection-controls.test.tsx` adds 12 assertions. Five existing host suites
gained mocks or were updated for the new component boundary:
`tests/motion/task-workspace-feedback.test.tsx`,
`tests/presentation/parent-dashboard-presentation.test.tsx`,
`tests/tasks/parent-task-workspace.test.tsx`,
`tests/platform/ambient-volume-controls.test.tsx` and
`tests/platform/natural-ambient-audio.test.tsx`. The volume suite now asserts the choices the
screen hands the shared control, and the ambience source contract asserts `<SelectionChip`,
`role="radio"` and `selected={...}` in place of the literal `accessibilityRole` and
`accessibilityState` it checked before. Those assertions moved rather than disappeared: the
chip's role and state mapping is asserted in `tests/presentation/selection-controls.test.tsx`.

During parallel runs, `tests/demo/demo-task-handoff-route.test.tsx` failed once and passed 3/3
in isolation and in the serial run. It belongs to the same `tests/demo/` module-reset family as
the intermittent failure recorded in the motion workstream; it is neither attributed to this
change nor cleared.

## Remaining native gates

On a representative mid-range Android phone with a release build, in Arabic and English:

1. Parent Tasks: switch child and status filters repeatedly, including rapid alternation. The
   selected chip must be identifiable without colour alone at arm's length, and both rows must
   read as the same kind of control.
2. Measure the contrast ratio of the selected chip label on `sage` and the unselected label on
   `paper`, and the 1 dp border against the canvas, with an instrument rather than by eye.
3. TalkBack: the child row must announce as a radio group with a checked option, the status row
   as a tab list with a selected tab, and the empty section as one labelled region.
4. Largest display and font size: confirm chips wrap to two lines without clipping and keep a
   48 dp target; confirm the three status segments still fit or wrap cleanly at 360 dp.
5. Settings: confirm the language box hugs its options in both locales and that the sound level
   row still saves the selected level after mute and relaunch.
6. Task history: confirm the empty card appears for every filter with no tasks and does not
   push the create action off screen.

No contrast-ratio, production-readiness or human-acceptance claim is made here.
