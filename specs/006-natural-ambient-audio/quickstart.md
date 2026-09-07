# Quickstart: Natural Ambient Audio Validation

## Prerequisites

- Use the repository-supported Node/npm versions and installed dependencies.
- Keep the device volume audible for listening checks.
- Use synthetic/local app data only; no network or microphone is required.

## Automated validation

```bash
npm test -- tests/natural-ambient-audio.test.tsx tests/r003-first-run-experience.test.ts tests/prototype-state.test.ts
npm run typecheck
npm run lint
npm run format:check
npm test
git diff --check
```

Expected result: strict preference validation and failure behavior, persisted toggle/reset behavior,
single-player loop policy, bilingual accessible settings integration, and all existing regressions
pass.

## Parent Settings flow

1. Enter the synthetic Parent experience and open Settings.
2. Find the Sound section after App language.
3. Turn Nature ambience off once.
4. Confirm current ambience stops promptly while the app remains usable.
5. Leave and reopen Settings, sign out/sign in, and restart the app; confirm the switch remains off.
6. Turn it on and confirm the same ambience resumes without a permission prompt.

## Child Settings flow

1. Enter a configured paired Child experience and open My settings.
2. Confirm the same Nature ambience state appears.
3. Toggle it and confirm Parent Settings later shows the same device-level choice.
4. Confirm no Child permission, pairing, task, or AI grant changes.

## Lifecycle and accessibility flow

1. With ambience on, background Ghaf; confirm it becomes silent.
2. Return to the foreground; confirm it resumes.
3. Enable TalkBack; confirm ambience remains silent and the switch title/state/hint are announced.
4. Disable TalkBack; confirm ambience may resume when enabled.
5. Repeat at 200% font scale in Arabic RTL and English LTR at compact width.

## Reset flow

1. Turn ambience off.
2. From active Parent Settings, confirm Reset prototype.
3. Confirm signed-out Arabic first-run state and default-on ambience.
4. Confirm all existing canonical reset values remain unchanged.

## Human listening gate

On the authoritative Android device, listen through at least two full 48-second boundaries and one
narration replay. Record `PASSED`, `FAILED`, `BLOCKED`, or `NOT RUN` for:

- no melody, beat, voice, alarm, or obviously artificial repetition;
- calm breeze/foliage/water-like texture with restrained bird-like accents;
- no obvious pause longer than 250ms or abrupt level change at the loop boundary;
- ambience clearly below narration and not distracting from task use; and
- immediate toggle, background pause, foreground resume, and TalkBack silence.

Source inspection and exports do not substitute for this listening review.
