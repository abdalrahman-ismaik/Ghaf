# Ghaf Demo Runbook

This runbook separates the runnable Feature 001 foundation rehearsal from the planned Feature 002
competition journey. Do not present planned or simulated capability as a live production service.

## Evidence Status

| Check                               | Status  | Evidence                                                                                          |
| ----------------------------------- | ------- | ------------------------------------------------------------------------------------------------- |
| Foundation app launch               | PASSED  | Static web export hydrated at a 412×915 mobile viewport with no page or console errors            |
| Arabic selection                    | PASSED  | Browser rehearsal rendered the Arabic entry and Child views                                       |
| English selection                   | PASSED  | Browser rehearsal switched to and rendered English without losing state                           |
| Visible RTL/LTR change              | PASSED  | Browser computed `rtl` for Arabic and `ltr` for English; native Android remains unverified        |
| Parent route                        | PASSED  | Browser rehearsal reached the rendered Parent route                                               |
| Child route                         | PASSED  | Browser rehearsal reached the rendered Child route while offline                                  |
| Parent → Child → Parent role switch | PASSED  | Browser rehearsal completed both transitions and retained shared state                            |
| Mock mission and shared impact      | PASSED  | Browser rehearsal observed the pregenerated mission and seeded impact                             |
| Ghaf component at the seeded stage  | PASSED  | Browser rehearsal observed Sapling at 48%; all-stage native review remains unrecorded             |
| Deterministic reset                 | PASSED  | Five repeated store-level trials and one rendered browser reset restored the Feature 001 baseline |
| Five full UI reset rehearsals       | NOT RUN | Five browser or physical-device reset-and-flow trials have not been recorded                      |
| Offline client-side web journey     | PASSED  | The hydrated Parent/Child foundation path completed after browser networking was disabled         |
| Offline preview-build journey       | NOT RUN | No installable preview-build evidence recorded                                                    |
| Primary physical Android device     | NOT RUN | Device and build have not been recorded                                                           |

Update a row only after direct observation. Static code review can support a separate finding, but
it cannot turn a runtime, RTL, offline, or physical-device row into `PASSED`.

## Before Each Rehearsal

1. Confirm the working tree and intended build:

   ```bash
   git status --short
   npm ci
   npm run typecheck
   npm run lint
   npm run format:check
   npm test
   ```

2. Start the intended target:

   ```bash
   npm start
   ```

   Use `npm run android` when the Android target is ready. For a true network-off rehearsal, use a
   previously installed preview APK that does not depend on Metro.

3. Confirm the app uses mock mode and contains no real child information.
4. Confirm sound, brightness, orientation lock, and screen-casting before the judge enters.
5. Open the app and use `Reset Demo` before starting the timed path.

## Reset Baseline

Every reset must restore this exact state:

```text
locale: ar
direction: rtl
role: parent
mode: mock
mission status: assigned
mission source: pregenerated-mock
rescued grams: 1250
rescued portions: 5
completed missions: 3
streak days: 2
Ghaf stage: 2 (Sapling)
Ghaf progress: 48%
```

The role selector is a clearly labeled prototype shortcut, not authentication. The synthetic
family, mission, impact values, and Ghaf progress remain the same across Parent and Child views.

## Feature 001 Foundation Rehearsal

Use this path to validate the bootstrap definition of done:

1. **Entry:** Confirm `Ghaf` and `غاف` are visible.
2. **Arabic:** Select Arabic and enter the prototype in no more than two taps.
3. **Direction:** Confirm right-to-left ordering, text alignment, directional icons, and progress
   direction.
4. **Role selector:** Confirm Parent and Child are clearly presented as demo roles and mock mode is
   disclosed.
5. **Parent:** Open Parent. Confirm the staged tree, one mission, 1,250 g, 5 portions, 3 completed
   missions, a 2-day streak, and a role-switch action.
6. **Child:** Switch to Child. Confirm the same family tree and mission appear as an age-appropriate
   adventure with progress/reward preview.
7. **English:** Select English. Confirm copy, order, text alignment, back icon, and progress move to
   left-to-right treatment.
8. **Return:** Switch Child → Parent and confirm mission/impact/tree coherence.
9. **Reset:** Activate `Reset Demo` and verify every baseline field above.
10. **Repeat:** Run the reset check five times. Any drift is a critical demo blocker.

Also check long Arabic labels, mixed Arabic/English text, numbers and units, button wrapping, inputs,
and directional controls. The complete foundation path should continue to work when external
network services are unavailable.

## Planned 90-Second Competition Journey

This is the Feature 002 target and remains planning-only until its technical plan is approved:

```text
Household food-waste situation
        ↓
Parent or grandparent voice note
        ↓
Visible AI generation sequence
        ↓
Parent reviews and approves the child mission
        ↓
Child completes three steps and reflects
        ↓
Parent confirms the result and estimated impact
        ↓
Ghaf tree visibly grows and a milestone appears
```

The final rehearsal should show this loop in approximately 90 seconds. Prepared image/audio,
pregenerated mission content, seeded evidence, and timed AI stages are legitimate fallbacks when
clearly labeled.

## Failure and Fallback Order

| Failure                                  | Deterministic response                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------- |
| Network or real AI unavailable           | Stay in mock mode and use the pregenerated bilingual mission                    |
| Microphone permission or recording fails | Select the prepared team-created voice clip                                     |
| Camera or image capture fails            | Select the prepared food-waste image                                            |
| Evidence upload fails                    | Use seeded evidence or request the planned Parent confirmation path             |
| Native RTL reload is delayed             | Keep locale-aware screen alignment active, then reload before the timed demo    |
| Animation is unstable                    | Display the final static SVG/image stage and continue with impact copy          |
| State drifts after rehearsal             | Use one-action reset and verify the baseline before restarting                  |
| Preview build cannot launch              | Use the last verified build/device pair; do not change dependencies on demo day |

None of these fallbacks may be described as live model inference, objective evidence verification,
food-safety assessment, or production behavior.

## Critical Demo Blockers

- app cannot launch on the chosen demonstration build;
- an approved route cannot be reached;
- Arabic text is clipped or the main RTL order is wrong;
- Parent/Child switching loses the shared mission or tree state;
- reset does not return to the exact baseline;
- mock flow unexpectedly requires internet;
- the app exposes a secret or real child information;
- the operator cannot tell whether a key capability is simulated.

Optional polish includes secondary motion tuning, additional leaf detail, extra copy variants, or
nonessential device support. Do not delay the complete journey for optional polish.

## Physical-Device Evidence Record

Append one row for each meaningful rehearsal:

| Date/time        | Device and Android version | Build identifier | Locale/path | Network state | Result  | Notes/operator |
| ---------------- | -------------------------- | ---------------- | ----------- | ------------- | ------- | -------------- |
| Not yet recorded | NOT RUN                    | NOT RUN          | NOT RUN     | NOT RUN       | NOT RUN | —              |

After a passing rehearsal, leave the app at the exact reset baseline, keep the verified build
installed, and record who owns the device and backup artifact.
