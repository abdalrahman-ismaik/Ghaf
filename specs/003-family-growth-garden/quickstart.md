# Quickstart and Verification Guide: Family Growth Garden

**Status**: IMPLEMENTED — deterministic P0 automated and bilingual web-proxy validation passed;
physical Android and named human-review acceptance remain open.

Use this guide from the repository root. The normative behavior oracle is
`contracts/acceptance-contract.md`; canonical Arabic, fixture content, timing records, build/device
evidence, and reviewer evidence belong in `../../DEMO_RUNBOOK.md`.

## 1. Prerequisites and Evidence Header

- Work from the canonical Ghaf repository on the Feature 003 branch/worktree.
- Use Node.js 22.13 or newer and npm.
- Keep the deterministic prepared providers enabled; no API key, account, camera, microphone, or
  remote service is required for the P0 path.
- Use only the supplied synthetic Al Noor household, synthetic Salem/Alya profiles, synthetic circle
  aggregate, and prepared media/assistant fixtures.
- Obtain a named Android build/device before attempting native acceptance. Web remains a secondary
  preview and evidence proxy.

Before each recorded run, capture the exact source state:

```bash
git branch --show-current
git rev-parse --short HEAD
git status --short
node --version
npm --version
```

Record uncommitted files rather than describing the run as a clean-commit result. Never transfer a
Feature 002 pass into the Feature 003 record.

Every fresh evidence exercise starts `NOT RUN`. Checking whether its named prerequisite is
available counts as an attempt: if the required command, build, device, reviewer, secure boundary,
or other dependency is unavailable, change the result to `BLOCKED` and record that dependency. If
the exercise runs, record `PASSED` or `FAILED`. Do not leave an attempted blocked exercise as
`NOT RUN` or mark an unattempted exercise `BLOCKED`.

## 2. Install and Static Validation

Install the locked dependencies, then run the complete local command set:

```bash
npm ci
npm run typecheck
npm run lint
npm run format:check
npm test
npx expo install --check
npx expo config --type public
npx expo export --platform web --output-dir dist
git diff --check
git diff --stat
git status --short
```

Record each command separately as `PASSED`, `FAILED`, `BLOCKED`, or `NOT RUN`. `npm ci` may require
package-registry access to populate an empty cache; that installation requirement is separate from
the app's no-network runtime contract.

Inspect `app.config.ts` and the resolved `npx expo config --type public` result. The Feature 003
build must report Android predictive Back enabled (`android.predictiveBackGestureEnabled: true`). A
false/missing value is a static configuration `FAILED` result; a true value does not by itself pass
native Back behavior.

Inspect the authored route inventory:

```bash
rg --files app | sort
rg -n "router\.(push|replace)|<Redirect|href=" app src
```

The only product routes must resolve to:

```text
/
/role
/parent
/parent/task/new
/parent/task/review
/child
/child/task
/parent/check-in
/garden
/circle
```

`_layout` files are framework structure, not product routes. Confirm the replaced Feature 002
routes are absent from `app/`: `/parent/create`, `/parent/generating`, `/parent/review`,
`/child/mission`, `/parent/confirmation`, and `/celebration`.

## 3. Start the Deterministic App

For the local Expo development server with remote dependency discovery disabled:

```bash
npm start -- --offline
```

For the secondary web preview:

```bash
npm run web -- --offline
```

For the authoritative physical target, connect the named Android device/build and run:

```bash
npm run android
```

Record the build identifier, device model, Android version, locale, accessibility settings, network
state, operator, observer, and date. If no installable build or device is available, mark Android
`BLOCKED` after that availability attempt and name the missing dependency; do not substitute a web
pass.

## 4. Verify the Canonical Reset First

Open Parent demo controls, choose **Reset synthetic demo**, and confirm. Assert:

- route `/`, no stale Back history, Arabic RTL;
- Parent demo mode, Salem active, role switch visibly not authentication;
- synthetic Al Noor household; Salem age 9 and Alya age 11;
- Salem 48 earned Seeds; Alya 36;
- Salem Mangrove 48/60 at Shoot;
- household canopy 19/25 leaves;
- synthetic/local circle 11/12 eligible Green actions;
- no active assignment or submission;
- `guide_recycling_refine_v1`, `coach_recycling_steps_v1`,
  `fixture_recycling_clean_v1`, and `fixture_salem_plan_ar_v1` available with point-of-use prepared/
  synthetic labels;
- deterministic prepared assistant mode; and
- celebration availability and consumption are both `false`.

Press native Back once. It must not reveal pre-reset state. Browser Back is only a web history proxy.
Stop and record a reset defect if any value differs; do not patch counters manually.

## 5. Arabic-First Judge Journey

Use the canonical Arabic safety and assistant wording in `../../DEMO_RUNBOOK.md`. Do not improvise
safety-critical Arabic.

| Step | Route / action                                                              | Required observation                                                                                                                                                                                                    |
| ---: | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|    1 | `/` — show disclosure, then enter                                           | Arabic RTL; household/profiles/media are synthetic; assistant is prepared/prewritten unless a separately verified live boundary exists                                                                                  |
|    2 | `/role` — choose Parent and Salem                                           | Salem and Alya are visibly synthetic; selector says it is not authentication                                                                                                                                            |
|    3 | `/parent` — inspect overview, then create                                   | One combined canopy and cooperative milestone; no sibling rank/raw Seed comparison; seven-day strengths-first prepared summary with bounded local correction                                                            |
|    4 | `/parent/task/new` — select Green Impact and P0 recycling task              | All eight categories and all five UAE landscape tracks are locally visible; P0 is a separate 12-Seed multi-step variant, not catalog `GI01`                                                                             |
|    5 | Enter “Take the recycling out.” and invoke Guide                            | Prepared `guide_recycling_refine_v1`; Parent text remains unchanged until **Accept suggestion**; disclosure says prepared and may be wrong                                                                              |
|    6 | `/parent/task/review` — inspect and approve                                 | Arabic first, English second; definition, adult checks, hazards, privacy, optional evidence, `standard + acquisition`, `once`, 12 Seeds, Mangrove, household visibility, circle eligibility all visible before approval |
|    7 | `/role` — switch to Child/Salem                                             | Existing approved assignment is preserved; no reward/projection changes                                                                                                                                                 |
|    8 | `/child` — choose the approved task                                         | Lifecycle becomes `chosen`, not `in_progress`; fixed award/help/meaning/landscape are visible without sibling ranking                                                                                                   |
|    9 | `/child/task` — explicitly open/start                                       | Lifecycle becomes `in_progress`; the Parent-approved definition stays unchanged; no more than four prepared steps                                                                                                       |
|   10 | Open Coach and choose a bounded intent                                      | Prepared `coach_recycling_steps_v1`; AI-may-be-wrong disclosure; **I need an adult** visible; no open chat                                                                                                              |
|   11 | Optionally view prepared image/audio, then skip reflection/media and submit | Origin and Parent-visibility labels appear; omission is allowed; submission is neutral and changes zero counters                                                                                                        |
|   12 | `/role` — switch to Parent, then `/parent/check-in`                         | Facts, permitted help, optional evidence/reflection, uncertainty, editable action-specific praise are separate                                                                                                          |
|   13 | Confirm and present the final praise                                        | A distinct rendered `praise_presented` state appears on `/parent/check-in`; lifecycle is `confirmed`; all four counters remain at baseline and no receipt exists                                                        |
|   14 | Use the separate Parent continuation                                        | Only this second visible action applies one guarded recognition result; it is not the same handler/effect as praise presentation                                                                                        |
|   15 | `/garden`                                                                   | Salem 60; Mangrove 60/60 Sapling; canopy 20/25; static/reduced-motion meaning remains complete; symbolic growth is not measured impact or real planting                                                                 |
|   16 | `/circle`                                                                   | Circle 12/12 from one coarse eligible Green action, not 12 Seeds; synthetic/local disclosure; no Child/task/media/Seed details or rank                                                                                  |

Expected route sequence:

```text
/ → /role → /parent → /parent/task/new → /parent/task/review
→ /role → /child → /child/task → /role → /parent/check-in
→ /garden → /circle
```

The repeated `/role` transitions do not add authored routes. Loading, assistant, retry,
awaiting-confirmation, and celebration remain in-route states.

The Step 13 praise state must be visibly rendered before Step 14 becomes available. Capture the
intermediate state and verify the praise-presentation press, callback, effect, or animation does not
also apply recognition. Navigate away from this confirmed pending-praise state and return to
`/parent/check-in`; it must resume the same praise and separate continuation without adding a
receipt or changing a counter.

### Bounded Parent summary correction check

On `/parent`, open the prepared seven-day summary's correction control. Edit one defined synthetic
observable-fact field to another neutral fact, save it locally, and verify the corrected summary is
revalidated and remains strengths-first, time-bounded, uncertain where appropriate, correctable,
and visibly synthetic/prepared. The control must not open chat, arbitrary Child analysis, or a
remote request.

Then enter a character label, diagnosis/condition conclusion, emotion/personality/risk inference,
truthfulness/religiosity judgment, or parenting/family-quality judgment into the bounded field. The
validation must reject it with neutral feedback, retain the last safe summary, and change no task,
reward, Child profile, canopy, or circle state. Repeat the valid and rejected correction checks in
English during the equivalence pass.

## 6. Verify No Early Reward and Dignified Retry

In a separate reset trial, capture the four counters after review, assignment, Child choice, start,
submission, and kind retry. Every capture before first Parent confirmation must remain:

```text
Salem Seeds: 48
Mangrove: 48/60, Shoot
Household canopy: 19/25
Circle: 11/12
```

From `/parent/check-in`, choose **Kind retry**. Verify the task returns to `in_progress`, existing
progress is unchanged, and no failure badge, debt, deduction, public mark, or dying garden appears.
Resubmit with permitted adult help. The displayed 12-Seed award must remain unchanged.

Also verify **Keep mine** on the Parent Guide preserves the original wording, and that a smaller
replacement can change a future displayed award only when agreed before Child acceptance.

## 7. Verify First and Duplicate Confirmation

From an exact reset and valid submitted P0 task, use the first Parent action to validate the edited
praise and render it. Before continuing, record lifecycle `confirmed`, presentation
`praise_presented`, no recognition receipt, and the unchanged reset values:

```text
Salem Seeds: 48
Mangrove: 48/60, Shoot
Household canopy: 19/25
Circle: 11/12
```

Use the separate visible Parent continuation. Only then record the first recognition before/after:

| Counter              |       Before | Required after |
| -------------------- | -----------: | -------------: |
| Salem earned Seeds   |           48 |             60 |
| Salem Mangrove       | 48/60, Shoot | 60/60, Sapling |
| Household canopy     |        19/25 |          20/25 |
| Circle Green actions |        11/12 |          12/12 |

Return to `/parent/check-in` five times for the recognized matching journey and exercise the guarded
duplicate application command in automated coverage. The route must expose only **Already
confirmed** (or the canonical Arabic equivalent), with no retry, praise editor, confirm, or
continuation control. Every attempt must return the same receipt, change none of the four values,
and duplicate no transaction, leaf, event, milestone, announcement, or celebration.

## 8. Verify Route Guards and Reset Matrix

From reset, deep-link or navigate to each conditional route without its prerequisite:

- Child mode → `/parent`, `/parent/task/new`, `/parent/task/review`, or `/parent/check-in` returns to
  `/role` without Parent-detail exposure;
- Parent mode → `/child` returns to `/role` until a Child mode/profile is selected;
- `/parent/task/review` without a complete candidate returns to `/parent/task/new` and changes no
  assignment/reward;
- `/child/task` without an assignment for the active Child returns to `/child` and reveals no other
  Child's task; and
- `/parent/check-in` admits only Parent mode plus the matching journey in one of three states:
  `submitted` shows review/retry/confirmation planning; `confirmed` with its pending-praise plan
  resumes the rendered praise and separate continuation; `recognized` with
  `recognition:<submission.id>` resolving to its immutable receipt shows only the neutral **Already
  confirmed** outcome. A missing/mismatched submission, pending plan, or receipt, or any other
  lifecycle state returns to `/parent` and creates no recognition.

Direct `/garden` and `/circle` entry may show safe current aggregate state, but must not infer a
completion or mutate counters.

Exercise confirmed reset from every meaningful state: draft, Guide result, Guide fallback,
prepared media selected, prepared media removed, image/audio unavailable fallback, reviewed,
assigned, chosen, `in_progress`, submitted, retry, confirmed/recognized, celebration available,
celebration consumed, garden, and circle. Run five consecutive reset trials per source state for
formal acceptance. Each must restore the full oracle, land on Arabic RTL `/`, and leave no stale
Back destination.

## 9. Verify External-Service Denial and Fallbacks

With the app already available, deny external network access and run the complete journey five
times. The deterministic Parent Guide, Child Coach, Parent summary, reward, garden, circle, and
reset must remain usable.

Exercise these in-route failure states:

- Parent refinement timeout, malformed structured result, safety rejection, and provider failure:
  retain Parent input and show the same-attempt prepared result with honest fallback status;
- missing prepared image: descriptive synthetic placeholder, no blocked completion;
- missing prepared audio: visible transcript and Coach steps, no microphone request;
- reduced motion or animation failure: immediate final counters/stage and textual cause; and
- unavailable circle fixture: local privacy explanation and household goal without individual data.

The Child Coach must remain prepared-only. If no approved secure server-side Parent provider exists,
record optional live Parent refinement as implementation `BLOCKED` and validation `NOT RUN`; do not
label prepared output live.

## 10. English Equivalence and Native Accessibility

Reset, switch to English, and repeat the full journey. Compare both locales route by route for
equivalent decisions, safety, privacy, fixed award, assistant disclosure, and final counters.

On the named Android build, separately test:

- Arabic RTL and English LTR order, progress direction, and directional icons;
- mixed Arabic/English content, numerals, fixture IDs, 12 Seeds, long labels, wrapping, and Arabic
  diacritics;
- normal-size text at 4.5:1 or better, large text at 3:1 or better, and essential UI
  boundaries/states at 3:1 or better against adjacent colors for applicable WCAG 2.2 AA text and
  non-text contrast;
- resolved Expo config with `android.predictiveBackGestureEnabled: true`, then predictive/system
  Back on a supported named Android OS/device from every conditional route; verify expected guarded
  destinations, no journey mutation, and no stale pre-reset preview/history after reset;
- keyboard avoidance from every editable route;
- 200% font scaling with safety and dominant actions still usable;
- 48×48dp dominant targets and 8dp separation between adjacent small targets;
- screen-reader labels, roles, states, focus order, and once-only announcements;
- prepared audio transcript, prepared-image description, optional removal, and origin labels; and
- reduced-motion final state without reliance on motion, color, or sound.

Record these as physical-device observations. Web layout inspection cannot pass them.

## 11. Privacy and Claim Checks

Use focused tests and a manual scan to confirm:

- raw `Task`, `Submission`, check-in, receipt, or other private domain objects remain inside the
  private recognition boundary and never enter the strict shared projection candidate;
- only the derived minimal projection context enters strict candidate validation; any unknown
  Child/household identity, Seed, task/history, timestamp, media, reflection, assistant, note, or
  other private field is rejected before DTO construction or shared visual/counter mutation;
- valid `child_guardian + circleEligible = false` data yields no shared DTO, while
  `child_guardian + true`, non-Green eligibility, sensitive content, invalid pairings, and malformed
  unknown-field candidates are rejected before mutation;
- duplicate recognition returns the immutable receipt before projection derivation;
- household and circle views contain no raw sibling ranking, podium, first/last state, Child profile
  grid, messages, comments, reactions, discovery, or real invitation;
- the circle adds one family Green action only;
- no wording claims a real planted tree, measured environmental impact, carbon/water/waste value,
  diagnosis, truthfulness, religiosity, parenting quality, food-safety decision, production
  authentication, or legal compliance; and
- no API key, client provider secret, unintended network client, camera/microphone/background
  permission, or real Child data appears in the Feature 003 path.

## 12. Evidence Limits and Handoff

The web preview may support `PASSED (web proxy)` evidence for route reachability, deterministic
logic, console health, basic wrapping, and browser-history recovery. Keep the following statuses
until direct evidence exists:

Apply the transition literally: an unattempted exercise is `NOT RUN`; an attempt that cannot proceed
because its named dependency is unavailable is `BLOCKED`; an executed exercise is `PASSED` or
`FAILED`. The physical Android row below is `BLOCKED` only after the recorded availability attempt
identifies the missing named build/device. Fresh native subchecks that have not been attempted
remain `NOT RUN`.

| Gate                                                                                                  | Status before direct evidence                  |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Automated commands and focused tests                                                                  | `NOT RUN`                                      |
| Ten-route fresh journey                                                                               | `NOT RUN`                                      |
| Physical Android Arabic/English journey                                                               | `BLOCKED` pending named build/device           |
| Predictive/native Back, WCAG contrast, RTL, keyboard, media, reduced motion, screen reader, 200% font | `NOT RUN`                                      |
| Five timed 120–150-second rehearsals                                                                  | `NOT RUN`                                      |
| Three-person comprehension check                                                                      | `NOT RUN`                                      |
| Arabic/UAE cultural, faith, safeguarding, sustainability, accessibility review                        | `NOT RUN`                                      |
| Optional live Parent refinement                                                                       | implementation `BLOCKED`; validation `NOT RUN` |

After implementation, write actual command, route, build/device, locale, timing, fallback, and human
evidence into `../../DEMO_RUNBOOK.md`. A planning artifact, passing web export, or old Feature 002
record does not make Feature 003 Android-accepted or demo-accepted.
