# Quickstart and Acceptance Guide: Ghaf Core MVP

**Status**: IMPLEMENTED LOCALLY — deterministic mock journey approved 2026-08-22. Automated checks
and five bilingual browser flows pass. Physical Android and human timed/concept rehearsals remain
open and must not be inferred from local or web evidence.

## Approval record

The team approved:

- the ten-screen flow and reset destination;
- prepared synthetic image, family voice note, mission narration, evidence, and bilingual mission
  content;
- quantity/time defaults, Ghaf award thresholds, and the celebration milestone;
- mock-only generation with live AI/camera/recording/storage deferred;
- Member 1 — Mobile and visual experience as integration owner.

The exact primary Android model/OS remains blocked pending physical handoff. Mock mode remains
required if any later live experiment is approved. No OpenAI key belongs in the mobile application
or repository.

## Prerequisites

- The Feature 001 foundation remains passing.
- Node.js 22.13 or newer and npm are available.
- The named Android development build or device is available for native RTL review.
- Synthetic prepared images and audio contain no real Child data.
- Optional live services are not prerequisites and are not implemented.

## Install and validate

Run from the repository root:

```bash
npm ci
npm run typecheck
npm run lint
npm run format:check
npm test
```

Observed result on 2026-08-22: every command exited successfully. Vitest passed 5 files / 32 tests,
covering mission lifecycle, rejected-provider fallback, retry, idempotent impact, six-stage Ghaf
progression, five source-state resets, and the complete mock flow.

Start the development surface with:

```bash
npm start
```

Use the Android development build for final native behavior. Web is useful for quick layout checks
but does not validate Android RTL, permissions, media, or release behavior.

## Prepared 90-second journey

1. **Entry** — show `Ghaf — غاف`, select Arabic, and enter.
2. **Role selector** — choose Parent and point out that this is a prototype shortcut.
3. **Parent home** — show the current Sapling and family impact; choose Create Mission.
4. **Create mission** — select the seeded Child, prepared food image, prepared voice note, labeled
   quantity, available time, and symbolic reward.
5. **AI generation** — show the four ordered simulated stages and the prepared/mock disclosure.
6. **Parent review** — show bilingual story, exactly three steps, target, evidence method, reward,
   and explicit approval.
7. **Child home and mission** — switch role, open the assigned adventure, complete three steps,
   choose prepared evidence or Parent confirmation, answer one reflection, and submit.
8. **Parent confirmation** — switch role, review everything together, confirm the estimated amount,
   and approve.
9. **Impact celebration** — show one impact update, Ghaf growth or visible progress, and the seeded
   milestone.

Target: 75–105 seconds in at least four of five rehearsals. Labels must truthfully say prepared,
simulated, or pregenerated; the demonstration must not imply food-safety determination.

## Exact reset check

Invoke Reset Demo from Parent, Child, generation, confirmation, and celebration states in five
separate trials. Each trial should navigate to Parent home and restore:

- Arabic / RTL, Parent role, and mock mode;
- an empty mission draft and no active assignment, submission, confirmation, or celebration;
- prepared mock assets and pregenerated mission still available but not selected or assigned;
- 1,250 rescued grams, 5 rescued portions, 3 completed missions, and a 2-day streak;
- Ghaf stage 2, Sapling, at 48%.

Record `PASSED`, `FAILED`, `BLOCKED`, or `NOT RUN` for every trial; do not infer a device result from
source inspection.

## Offline and provider-failure check

1. Reset, disable network access, and complete the entire prepared journey.
2. Confirm all ten screens remain reachable and generation uses deterministic local content.
3. In optional-live mode, simulate timeout or invalid structured output after valid Parent input.
4. Confirm the same input remains present, the fallback completes the same generation attempt, and
   exactly one review mission appears.
5. Confirm the UI changes its origin label to pregenerated/mock.

Required result: five of five complete offline trials pass before the competition build is called
demo-ready.

## Lifecycle and impact checks

- Parent Edit returns to the draft and never assigns the unapproved mission.
- The Child cannot submit until all three steps, one reflection, and evidence or a Parent-
  confirmation request are present.
- Child submission changes no impact, reward, or Ghaf progress.
- Parent Retry returns the mission to Child work and changes no totals.
- One Parent approval creates one impact record and one completed mission.
- Five repeated approval attempts leave all totals unchanged after the first award.
- A completion below a stage boundary still produces bounded progress feedback.
- A seeded boundary completion changes the tree stage and reveals the approved milestone.
- Further progress at Full Ghaf tree keeps stage 5 while impact continues.

## Arabic, English, and device review

Complete the full prepared journey once in Arabic and once in English on the primary Android device.
For each of the ten screens, inspect:

- locale-specific text alignment and logical start/end spacing;
- visual order, back icons, step order, and progress direction;
- long Arabic labels, mixed Arabic/English content, numbers, and quantity units;
- keyboard avoidance, touch target access, wrapping, and primary-action visibility;
- tree stage, loading motion, and celebration smoothness;
- explicit mock/prepared/live labels and the role-switch disclosure.

Record device model, OS version, build identifier, observed reload behavior, result, and reviewer.

## Acceptance record

| Check                      | Required evidence                             | Initial status |
| -------------------------- | --------------------------------------------- | -------------- |
| Automated validation       | Successful command output                     | PASSED         |
| Ten-screen navigation      | Five consecutive reset-and-flow trials        | PASSED (web)   |
| Arabic journey / RTL       | Named physical Android review                 | NOT RUN        |
| English journey / LTR      | Named physical Android review                 | NOT RUN        |
| Offline mock journey       | Five complete offline trials                  | PASSED (web)   |
| Retry without award        | Before/after totals plus focused test         | PASSED         |
| Idempotent approval        | Five repeated approvals plus focused test     | PASSED         |
| Six Ghaf stages            | Isolated deterministic stage review           | PASSED (logic) |
| 90-second demo             | Timings from five rehearsals                  | NOT RUN        |
| Three-person concept check | Each person identifies the five core concepts | NOT RUN        |

Feature 002 is locally implemented, but the competition build is not demo-accepted until the
physical Android and human rehearsal rows pass with no critical blocker. Optional live AI, cloud
storage, recording, camera capture, and saved history may remain unimplemented.
