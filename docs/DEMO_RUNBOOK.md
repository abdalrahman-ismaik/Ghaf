# Ghaf Demo Runbook

Ghaf is an MVP Prototype for the SMAC 2026 competition. This runbook records the deterministic
mock journey separately from the still-unverified physical Android journey. Never present prepared,
simulated, or pregenerated behavior as a live production service.

## Evidence Status — 2026-08-22

| Check                                | Status  | Evidence                                                                                                                     |
| ------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Feature 001 local checks             | PASSED  | Clean install, typecheck, lint, format check, focused tests, Expo dependency check, config resolution, and web export passed |
| Feature 002 automated checks         | PASSED  | `npm test` passed 5 files / 32 tests; typecheck, lint, format check, and Expo dependency check passed                        |
| Ten authored screens                 | PASSED  | Expo exported the ten approved routes; `_sitemap` and `+not-found` are Expo built-ins                                        |
| Arabic and English browser journeys  | PASSED  | Five 412×915 rehearsals alternated Arabic/RTL and English/LTR through all ten screens                                        |
| RTL/LTR layout on web                | PASSED  | Computed direction, logical row order, mirrored back glyph/position, and progress origin were checked                        |
| External-service-free mock journey   | PASSED  | Each browser trial denied every non-local request, served only exported local assets, and completed through reset            |
| Prepared images                      | PASSED  | Both synthetic JPEGs rendered in the input/evidence path                                                                     |
| Prepared audio controls on web       | PASSED  | Separate online browser playback check loaded both language families without console/page errors                             |
| Prepared audio on Android            | BLOCKED | Bundled playback is implemented, but no Android device/emulator is available here                                            |
| Retry without award                  | PASSED  | First browser trial exercised retry; focused test kept impact/Ghaf unchanged                                                 |
| Repeated approval                    | PASSED  | Focused test invoked approval five times and retained one impact record/award                                                |
| Dynamic quantity coherence           | PASSED  | Browser trials carried 250 g, 2 portions, and 400 g through review, confirmation, celebration, and aggregate totals          |
| Generation Back recovery             | PASSED  | Browser left generation, returned to Create, restarted, and reached review without a stranded session                        |
| Reset state and history              | PASSED  | Five browser resets plus five source-state store resets restored the exact baseline; Back did not reopen journey history     |
| Six-stage progression contract       | PASSED  | Pure tests verified stages 0–5, the 48→60 crossing, unique milestone, and stage-5 saturation                                 |
| Growth feedback within three seconds | PASSED  | Browser observed celebration and 60% progress 0.9 seconds after Parent approval                                              |
| Human 75–105-second rehearsal        | NOT RUN | Automation time is not substituted for a three-person judge-path rehearsal                                                   |
| Three-person concept check           | NOT RUN | The three members have not yet recorded the comprehension review                                                             |
| Primary physical Android journey     | BLOCKED | `adb`, Android SDK environment, emulator, and connected phone are absent                                                     |

`PASSED` is based on recorded command or runtime evidence. Browser evidence does not make a native
Android requirement pass.

## Validation Commands and Results

Run from the repository root:

```bash
npm ci
npm run typecheck
npm run lint
npm run format:check
npm test
npx expo install --check
npx expo config --type public
npx expo export --platform web --output-dir dist
```

Latest result: all exited `0`; Vitest passed 5 files / 32 tests; Expo reported dependencies up to
date and exported 12 static routes (ten authored routes plus two built-ins). The public config shows
`expo-audio` with microphone permission, Android recording, background recording, and background
playback all disabled. The provisional native identifier is explicitly marked provisional.

`npm ci`/`npm audit --omit=dev` reported 10 moderate transitive findings in the current Expo CLI and
configuration toolchain. The offered forced fix would replace the selected Expo SDK with an
incompatible older major, so no forced dependency change was made during this prototype bootstrap.

The five-flow UI rehearsal used a one-off Playwright QA harness at a 412×915 viewport against the
static export. The harness allowed only the local exported files and denied every external host. It
checked:

- five full flows alternating Arabic and English;
- all ten authored routes and the four visible generation stages;
- bilingual review including reflection, impact, evidence, and reward;
- exactly three Child steps, prepared evidence, reflection, retry, and confirmation validation;
- 250 g, 2 portions, and 400 g context propagation;
- one 48%→60% Ghaf award and one milestone per flow;
- updated rescued-food and four-completed-missions totals on the celebration;
- reset after every flow, generation-Back recovery, and reset-history cleanup;
- no browser console or page errors.

Five screenshot artifacts were inspected during the run in `/tmp/ghaf-feature2-screens/`; they are
ephemeral QA evidence and are not product assets. A separate online browser check played the four
prepared clips in Arabic and English without page or console errors. If the static web server itself
is disconnected, uncached media may use the visible matching-text fallback because this secondary
web export has no service worker; native bundled playback remains the authoritative Android check.

The first targeted TDD runs intentionally failed before the generation-cancel and rejected-provider
fallback implementations existed. Their new regression tests now pass. Earlier browser harness
iterations also exposed stale navigation history and the stranded-generation state; both were fixed
before the passing five-flow run.

## Exact Reset Baseline

`Reset Demo` must dismiss journey history, navigate to Parent home, and restore:

```text
locale: ar
direction: rtl
role: parent
mode: mock
mission status: draft-input
mission selection: empty
active mission: none
submission / confirmation / celebration: none
rescued grams: 1250
rescued portions: 5
completed missions: 3
streak days: 2
Ghaf stage: 2 (Sapling)
Ghaf progress: 48%
```

Prepared media and the unassigned pregenerated mission remain available. The role selector is a
prototype shortcut, not authentication.

## Competition Journey

1. **Entry:** Show `Ghaf — غاف`, Arabic-first identity, and the MVP Prototype disclosure.
2. **Role selector:** Choose Parent and explain that one-device role switching replaces login.
3. **Parent home:** Show Sapling at 48%, existing family impact, and Create Mission.
4. **Create mission:** Select Salem, prepared bread image, matching prepared family message, 250 g,
   15 minutes, and the symbolic Golden Ghaf Leaf.
5. **Generation:** Show the four ordered simulated stages and the pregenerated-content label.
6. **Parent review:** Show both languages, story, three steps, reflection, impact, evidence, reward,
   and explicit approval.
7. **Child:** Open the assigned adventure, play or point to prepared narration, complete three
   steps, choose evidence, answer the reflection, and submit.
8. **Parent confirmation:** Review the complete submission, confirm 250 g, and approve once.
9. **Celebration:** Show the estimated rescue, +12 progress, Sapling→Young tree transition, and new
   branch milestone.
10. **Reset:** Return to the exact Arabic/Parent/48% baseline before the next judge.

Target for the human rehearsal is 75–105 seconds in at least four of five trials. Do not use
automation timings as the acceptance result.

## Failure and Fallback Order

| Failure                                              | Deterministic response                                                                    |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Network or optional AI unavailable                   | Use the same-attempt pregenerated bilingual mission                                       |
| Optional provider rejects or returns invalid content | Convert the failure to a bounded error and use the validated mock fallback                |
| Prepared audio cannot play                           | Continue with the exact visible transcript; do not imply transcription occurred           |
| Microphone permission or recording unavailable       | Select the synthetic prepared family clip; recording is not enabled                       |
| Camera/image capture unavailable                     | Select the synthetic prepared food image; capture is deferred                             |
| Evidence upload unavailable                          | Use prepared evidence or direct Parent confirmation                                       |
| Native RTL reload delayed                            | Use per-screen logical layout, then reopen before the timed demonstration                 |
| Motion unstable or reduced                           | Show the deterministic final SVG stage and impact copy                                    |
| State or history drifts                              | Activate Reset Demo and verify all baseline fields before restarting                      |
| Preview build unavailable                            | Use the last physically verified build/device pair; never change dependencies on demo day |

No fallback may be described as live inference, objective evidence review, food-safety assessment,
or production behavior.

## Physical Android Gate

On the team's named primary Android phone, run the complete journey once in Arabic and once in
English, then five timed Arabic-first rehearsals. Check playback, long Arabic wrapping, keyboard
avoidance, touch/focus/pressed states, back behavior, progress origin, reset after five source
states, reduced motion, and the Ghaf transition. Record device model, Android version, build ID,
operator, network state, and result below.

| Date/time  | Device / Android          | Build            | Locale/path  | Network       | Result  | Notes/operator                                                   |
| ---------- | ------------------------- | ---------------- | ------------ | ------------- | ------- | ---------------------------------------------------------------- |
| 2026-08-22 | Primary phone unavailable | No Android build | Full journey | Not exercised | BLOCKED | No `adb`, SDK, emulator, or connected device in this environment |

After the first passing physical rehearsal, leave the verified build installed, save its reset
state, and record who owns the phone and backup artifact.
