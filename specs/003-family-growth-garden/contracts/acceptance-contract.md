# Acceptance Contract: Family Growth Garden

**Status**: PROPOSED — executable Feature 003 validation contract. No check is passed by this
document alone.

**Primary acceptance surface**: named physical Android build, Arabic RTL first and English LTR
second.

**Deterministic baseline**: local prepared providers with every external service denied.

This contract converts the approved behavior in `../spec.md` and the evidence rules in
`../../../DEMO_RUNBOOK.md` into repeatable checks. It is not a public API contract, a production
release checklist, or evidence that the implementation, Android build, cultural content, or human
journey has passed.

## Evidence Vocabulary

Every recorded check MUST use exactly one of these outcomes:

| Outcome   | Meaning                                                                                              |
| --------- | ---------------------------------------------------------------------------------------------------- |
| `PASSED`  | The named command, build, device, locale, or human exercise was run and met every stated assertion.  |
| `FAILED`  | The check was run and at least one stated assertion did not hold. Record the exact observation.      |
| `BLOCKED` | A required dependency such as a build, device, reviewer, or approved secure boundary is unavailable. |
| `NOT RUN` | The check has not been attempted against the current Feature 003 worktree/build.                     |

A fresh evidence exercise remains `NOT RUN` until someone attempts it. Checking whether its named
prerequisite is available counts as an attempt: if the command, build, device, reviewer, secure
boundary, or other required dependency is then unavailable, change the result to `BLOCKED` and name
that dependency. An exercise that runs becomes `PASSED` or `FAILED`; do not leave an attempted,
dependency-blocked exercise as `NOT RUN` or pre-label an unattempted exercise `BLOCKED`.

A source inspection, unit test, web preview, or Feature 002 result MUST NOT pass a physical-device,
native RTL, media, Back, accessibility, timing, comprehension, or named-human-review criterion.

## Authored Route and Guard Contract

The integrated application MUST contain exactly these ten product routes. Framework files such as
`app/_layout.tsx` are not product routes. Loading, assistant, fallback, retry, awaiting-confirmation,
phase-review, and celebration are states of these routes.

|   # | Route                 | Required entry or safe behavior                                                                                                                                                                              | State mutation allowed on entry                                        |
| --: | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
|   1 | `/`                   | Always reachable; Arabic RTL after canonical reset                                                                                                                                                           | None                                                                   |
|   2 | `/role`               | Always reachable as a shared-device demo selector; visibly not authentication                                                                                                                                | Demo mode and active synthetic Child only after an explicit choice     |
|   3 | `/parent`             | Parent mode; a Child-mode deep link returns to `/role` without exposing Parent-only detail                                                                                                                   | None on entry                                                          |
|   4 | `/parent/task/new`    | Parent mode; otherwise return to `/role`                                                                                                                                                                     | Draft edits only                                                       |
|   5 | `/parent/task/review` | Parent mode plus a complete review candidate; otherwise return to `/parent/task/new` without losing valid draft input                                                                                        | `draft → reviewed` only after validation; no assignment on entry       |
|   6 | `/child`              | Child mode plus an active synthetic profile; otherwise return to `/role`                                                                                                                                     | `assigned → chosen` only after the assigned Child deliberately chooses |
|   7 | `/child/task`         | Child mode plus an assignment for the active Child; a missing or wrong-profile assignment returns to `/child` without revealing private task detail                                                          | `chosen → in_progress` only after an explicit open/start action        |
|   8 | `/parent/check-in`    | Parent mode plus the matching journey in `submitted`, `retry`, `confirmed` with pending praise, or `recognized` with its matching ledger receipt; otherwise return to `/parent` without creating recognition | None on entry; available actions depend on the admitted state          |
|   9 | `/garden`             | Safe read-only family landscape before confirmation and the recognized consequence afterward; available from the authored family flow                                                                        | None on entry                                                          |
|  10 | `/circle`             | Safe synthetic/local aggregate before and after the milestone; no individual record is exposed                                                                                                               | None on entry                                                          |

For `/garden` and `/circle`, direct entry MUST render the counters represented by current session
state and MUST NOT infer a completion. Parent-only reset controls MUST not be exposed as a Child
action even when a shared read-only surface is visible.

For `/parent/check-in`, `submitted` exposes review, kind retry, and confirmation planning; `retry`
resumes the observable no-loss retry panel until the Parent explicitly returns the task to the
Child;
`confirmed` with the matching pending plan resumes the rendered-praise state and its separate
Parent continuation. `recognized` is admitted only when `recognition:<submission.id>` resolves to
the immutable matching receipt, and it exposes only the neutral **Already confirmed** outcome. It
MUST NOT expose retry, praise editing, another confirmation control, recognition continuation, or a
new announcement/celebration. A missing or mismatched submission, pending plan, or receipt follows
the safe `/parent` recovery with no mutation.

The replaced Feature 002 product routes MUST be absent from the final route inventory:

- `/parent/create`
- `/parent/generating`
- `/parent/review`
- `/child/mission`
- `/parent/confirmation`
- `/celebration`

Historical Feature 002 specifications, documentation, screenshots, and evidence remain intact.

### Navigation and History Assertions

1. `assigned → chosen` and `chosen → in_progress` are two observable, guarded transitions.
2. Direct navigation to a conditional route without its prerequisite follows the safe behavior in
   the table and changes no reward or shared counter.
3. Switching language in a safe current state preserves the task identifier, valid input, and
   lifecycle state while updating content direction.
4. Role switching preserves the current approved journey state but never bypasses Parent approval
   or exposes a task assigned to another synthetic Child.
5. Parent reset atomically replaces navigation with `/`; pressing native Back MUST NOT reveal any
   pre-reset draft, task, submission, check-in, garden celebration, or circle milestone.
6. A web browser history check is only a proxy. Android Back passes only after direct observation on
   the named physical build.
7. The resolved Expo configuration MUST set Android predictive Back enabled. On a named supported
   Android OS/device, the predictive gesture and system Back MUST follow the same guarded
   destinations as ordinary navigation, MUST NOT mutate the journey, and MUST NOT preview or reveal
   pre-reset history after reset. Record the config output, build, device, and OS with the native
   observation.

## Canonical Reset Oracle

The Parent-only **Reset synthetic demo** action requires confirmation and MUST restore all values in
one action without a remote dependency.

| Field                          | Exact reset value                                              |
| ------------------------------ | -------------------------------------------------------------- |
| Locale / direction             | Arabic / RTL                                                   |
| Route / history                | `/`; no stale Back history                                     |
| Demo mode                      | Parent; role switch labeled not authentication                 |
| Household                      | Synthetic Al Noor family                                       |
| Children                       | Salem, age 9; Alya, age 11; both visibly synthetic             |
| Active Child                   | Salem                                                          |
| Salem personal earned Seeds    | 48                                                             |
| Alya personal earned Seeds     | 36                                                             |
| Salem Mangrove track           | 48/60, Shoot                                                   |
| Household Ghaf canopy          | 19/25 contribution leaves                                      |
| Circle Green Impact goal       | 11/12 eligible actions; synthetic/local                        |
| Active assignment / submission | None                                                           |
| Parent Guide fixture           | `guide_recycling_refine_v1`                                    |
| Child Coach fixture            | `coach_recycling_steps_v1`                                     |
| Prepared image                 | `fixture_recycling_clean_v1`; prepared/synthetic label visible |
| Prepared audio                 | `fixture_salem_plan_ar_v1`; prepared/synthetic label visible   |
| Assistant mode                 | Deterministic prepared; no remote dependency                   |
| Celebration state              | `available = false`; `consumed = false`                        |

Reset MUST be exercised from draft, prepared-assistant result, prepared fallback, prepared-media
selected, prepared-media removed, image/audio unavailable fallback, reviewed, assigned, chosen,
`in_progress`, submitted, retry, confirmed/recognized, celebration available, celebration
consumed, garden, and circle states. From a Child-only state, first switch to Parent demo mode
without manually changing counters, then invoke reset. Acceptance requires five consecutive exact
resets from every named source state; one mismatch is `FAILED` and must not be repaired by manually
editing counters.

## Lifecycle and No-Early-Reward Oracle

The valid main lifecycle is:

`draft → reviewed → assigned → chosen → in_progress → submitted → confirmed → recognized`

The dignified retry branch is:

`submitted → retry → in_progress`

At each of `reviewed`, `assigned`, `chosen`, `in_progress`, `submitted`, `retry`, and `confirmed`
before the separate recognition continuation, assert all four reward/projection values remain at
the reset baseline: Salem 48 Seeds, Mangrove 48/60 Shoot, canopy 19/25, circle 11/12. Optional media,
optional reflection, permitted adult help, omission of both optional items, neutral submission
acknowledgement, confirmation planning, and praise presentation MUST NOT change those values.

Repeating the exact Parent assignment-approval command after `assigned` MUST return the same
assignment and executable choice as a neutral no-op; it MUST create no second assignment or counter
change. A repeat whose task/version, Child, assignment, or choice does not match remains invalid.

Kind retry MUST preserve every prior earned value, show no failure badge/debt/deduction, and return
the task to `in_progress`. A safe equivalent or smaller replacement may change a displayed future
award only when agreed before Child acceptance; permitted help after acceptance never reduces the
displayed award.

## Confirmation and Idempotency Oracle

The P0 submission is one 12-Seed, recurrence-once `standard + acquisition` Green Impact task with
`visibilityScope = household` and `circleEligible = true`. Its first valid recognition MUST use two
distinct visible Parent actions and an observable intermediate state:

1. From `submitted`, the first action validates the editable action-specific praise, creates the
   pending plan, moves the matching journey to `confirmed`, and renders the final praise in a
   `praise_presented` state. Capture that state with all four counters unchanged and no recognition
   receipt, growth, milestone, announcement, or celebration.
2. Only after that rendered state is present may a second explicit Parent continuation invoke
   recognition. The handler that records/renders praise MUST NOT also call recognition in the same
   press, event callback, effect, animation callback, or dispatch chain.
3. The second action moves the journey to `recognized`, stores one immutable receipt, and changes
   exactly these four counters:

| Counter                     |        Before |       After first valid confirmation |
| --------------------------- | ------------: | -----------------------------------: |
| Salem personal earned Seeds |            48 |                                   60 |
| Salem Mangrove progress     |  48/60, Shoot |                       60/60, Sapling |
| Household canopy            |  19/25 leaves |                         20/25 leaves |
| Circle Green Impact goal    | 11/12 actions | 12/12 actions, cooperative milestone |

No other counter, assignment version, prepared fixture identifier, Child profile, locale, or
private record may change as an incidental consequence. The circle receives one coarse eligible
Green action, never 12 Seeds.

Navigate back to `/parent/check-in` for the recognized matching journey five times and exercise the
guarded duplicate command directly in automated coverage. The rendered route MUST expose only
**Already confirmed** (or its canonical Arabic equivalent), and every attempt MUST return the same
receipt as a neutral no-op. It MUST leave the four post-confirmation values unchanged and duplicate
no Seed transaction, stage reveal, canopy leaf, circle event, milestone, announcement, or
celebration.

## Privacy-Before-Projection Oracle

The full `Task`, `Submission`, check-in, receipt, and other private domain records stay inside the
private recognition boundary. That boundary validates recognition/phase, visibility, category, and
circle eligibility, then derives a minimal strict projection-eligibility context. A shared projector
MUST NOT accept or strip a raw private domain object. Only the strict context may enter shared
candidate construction, and only an allowlisted canopy/circle DTO may reach a shared mutation.

Exercise at least these cases and compare the shared counters before and after each attempt:

- a valid `visibilityScope = child_guardian` task with `circleEligible = false` remains valid private
  data but yields no shared candidate; `child_guardian + true` is rejected before derivation;
- `circleEligible = true` for a non-Green category;
- `circleEligible = true` with `visibilityScope = child_guardian`;
- a raw `Task`, `Submission`, check-in, receipt, or other private domain object offered directly to
  the shared projector;
- an otherwise shaped projection candidate with any unknown Child/household identity, Seed
  quantity, task ID/title/history, timestamp, media, reflection, assistant content, Parent note, or
  Parent observation field;
- prayer, kinship, affection, food consumption, hygiene, wellbeing, or disability-related content;
- invalid recognition/routine-phase combinations; and
- a duplicate recognition key, which MUST return its stored receipt before context derivation or
  projection.

Every malformed, unknown-field, invalid-pairing, or sensitive candidate MUST be rejected before DTO
construction and before a canopy/circle visual or counter changes. A valid private item that is not
shareable yields no shared DTO rather than being copied into a candidate. A valid circle DTO
contains only one coarse synthetic family-level eligible Green action. Parent and sibling surfaces
MUST NOT place Salem and Alya's raw Seeds, pace, rank, or age-unequal contribution trails side by
side.

## Prepared Assistant and Media Fallback Oracle

The deterministic acceptance path makes no external request.

| Condition                                                                              | Required behavior                                                                                                                                  |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parent enters “Take the recycling out.”                                                | Input remains unchanged until **Accept suggestion**; **Keep mine** preserves it.                                                                   |
| Prepared Parent Guide opens                                                            | Uses `guide_recycling_refine_v1`; labels the result prepared; says AI may be wrong and the Parent decides.                                         |
| Optional live Parent call times out, fails schema/safety validation, or is unavailable | On the same route and attempt, retain Parent input and show the reviewed prepared result with a fallback/prepared label.                           |
| Child Coach opens                                                                      | Uses only `coach_recycling_steps_v1`; stays bound to the active approved task; shows **I need an adult** and the prepared/may-be-wrong disclosure. |
| Prepared image is absent                                                               | Show an accessible descriptive synthetic placeholder; completion remains available.                                                                |
| Prepared audio is absent                                                               | Show the canonical transcript and Coach steps; do not request microphone permission.                                                               |
| All external services are denied                                                       | Parent Guide, Child Coach, summary, media fallbacks, reward, garden, circle, and reset remain usable.                                              |

The Child Coach has no live mode in P0. No assistant may provide unrestricted chat, diagnostic or
religious judgment, emotional/personality inference, secrecy/exclusivity language, food-safety
verdicts, or hazardous instructions. Prepared content MUST never be labeled live.

Optional live Parent refinement remains `BLOCKED` for implementation and `NOT RUN` for validation
until an approved secure server boundary, structured validation, timeout/fallback evidence, and
secret isolation are directly demonstrated. Its absence does not block the deterministic P0.

## Parent Summary Correction Oracle

On `/parent`, open the prepared seven-day summary and its bounded correction control. The control
MUST expose only the defined synthetic observable-fact fields; it MUST NOT become an open prompt,
Child-analysis surface, or remote conversation. Apply one neutral factual correction and verify the
same structured and prohibited-language validation runs before the local corrected summary is
shown with its synthetic/prepared origin and unchanged time window, uncertainty, open question, and
possible adjustment.

Then attempt a correction containing a character label, diagnosis/condition conclusion,
emotion/personality/risk inference, truthfulness/religiosity judgment, or parenting/family-quality
judgment. The correction MUST be rejected with neutral feedback, the last safe summary MUST remain
available, and no remote request, task/reward mutation, Child-profile inference, or shared
projection may occur. Run the valid and rejected correction checks in Arabic and English.

## Bilingual, RTL, and Accessibility Oracle

Run the complete journey in Arabic first, reset, then run the equivalent English journey. For every
route and in-route assistant/retry/celebration state, verify:

- the same decisions, safety boundaries, privacy meaning, fixed award, disclosure, and final values;
- Arabic logical order/alignment and progress direction; English LTR order/alignment;
- only directional arrows mirror; trees, checkmarks, landscape objects, and nondirectional symbols
  do not mirror;
- canonical Arabic safety and assistant copy from `../../../DEMO_RUNBOOK.md` is not improvised;
- mixed Arabic/English names, Latin fixture IDs, 12-Seed values, numerals, diacritics, and long labels
  wrap without clipping;
- normal-size text meets at least 4.5:1 contrast, large text meets at least 3:1, and essential UI
  component boundaries/states meet at least 3:1 against adjacent colors, satisfying the applicable
  WCAG 2.2 AA text and non-text contrast criteria;
- required copy and dominant actions remain operable at 200% font scale;
- dominant controls are at least 48×48dp and adjacent small targets have at least 8dp separation;
- screen-reader order, labels, roles, selected/disabled states, and bottom-sheet focus are logical;
- submission, confirmation, reward, Sapling stage, and circle milestone are each announced once;
- prepared audio has visible equivalent text and prepared imagery has a concise description and
  point-of-use origin label;
- reduced motion produces the same static counters, stage, cause, and symbolic-growth disclosure
  without waiting for animation; and
- the resolved Android configuration has predictive Back enabled and, on a supported named Android
  build/device, predictive/system Back follows every route guard and cannot reveal stale state after
  reset.

These checks remain `NOT RUN` until exercised on a current named build. Source or web inspection may
produce separate proxy evidence but cannot pass the Android criteria.

## Automated Verification Matrix

The implementation MUST provide focused automated evidence for the following behavior. Exact test
filenames may follow repository conventions, but every row must be traceable to one or more tests.

| Area              | Required assertions                                                                                                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lifecycle         | Every valid transition; invalid skips rejected; `chosen` distinct from `in_progress`; wrong Child rejected; exact duplicate Parent assignment approval is an idempotent no-op                |
| Early reward      | Review, assignment, choice, start, submission, media, reflection omission, help, retry, confirmation planning, and praise presentation change none of the four counters                      |
| Reward matrix     | Five valid recognition/phase rows; every other pair rejected; fixed awards limited to 4/6/8/12/15                                                                                            |
| Confirmation      | Distinct rendered `praise_presented` state; separate second Parent continuation; no shared handler/effect; one exact four-counter delta; five matching-receipt duplicates are neutral no-ops |
| Fade-first review | Third recurrent acquisition confirmation prompts an unselected, future-only Parent decision; no automatic phase change; reversal preserves progress                                          |
| Garden            | Eight category mappings; five track thresholds at and around 0/20/60/120/200; no reversal                                                                                                    |
| Privacy           | Raw private records never enter the strict projection candidate; unknown identity/Seed/private fields and invalid/sensitive contexts reject before DTO construction or mutation              |
| Circle            | Only one coarse household-visible eligible Green action is accepted; no task/Child/Seed fields                                                                                               |
| Child Coach       | Age-band and intent allowlists, active-task binding, prepared fixture/disclosure, prohibited intent/output rejection                                                                         |
| Parent Guide      | Structured prepared/fallback result, retained input, strengths-first summary shape, bounded local fact correction, revalidation, and prohibited-language rejection                           |
| Failure fallback  | Network denial, timeout, malformed result, safety rejection, missing image/audio all return to the deterministic path without duplicate state                                                |
| Localization      | Arabic/English resource-key parity and stable mixed-script fixture values                                                                                                                    |
| Reset/history     | Every meaningful source state restores the complete oracle; check-in admits only matching submitted/pending-praise/recognized-receipt states; predictive Back config is enabled              |
| Claims/provenance | No real-tree/unsupported impact claim; prepared/synthetic origin labels are present                                                                                                          |

Run and record at least:

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npx expo install --check
npx expo config --type public
npx expo export --platform web --output-dir dist
git diff --check
```

Command success does not replace behavior evidence. An unattempted check is `NOT RUN`; after an
attempt, a missing named dependency makes it `BLOCKED`, while an executed check is `PASSED` or
`FAILED`.

## Judge-Journey Acceptance

From a fresh reset, complete the route sequence below without hidden setup:

`/ → /role → /parent → /parent/task/new → /parent/task/review → /role → /child → /child/task → /role → /parent/check-in → /garden → /circle`

Although several routes recur in navigation, the inventory remains exactly ten authored routes.
The current internal target is 120–150 seconds; it is not a published SMAC judging rule. Run five
uninterrupted rehearsals and record operator, duration, reset result, fallback use, and failure note.
All five must complete at or below 150 seconds for the rehearsal criterion to pass.

Ask three people unfamiliar with the detailed design what Salem did, what the assistant did, who
approved the reward, and what another family can see. Record enough of each answer to verify they
understood the real action, bounded/prepared AI, Parent gate, and one coarse eligible Green action.

## Web Proxy and Physical Android Limits

Web evidence may validate route reachability, deterministic logic, browser console health, basic
layout, copy presence, and a web-specific history proxy. Label it `PASSED (web proxy)` where
appropriate. It does not validate Android RTL layout, native Back, keyboard/IME, safe areas, touch
targets, screen reader, reduced-motion setting, prepared native media, permissions, performance, or
an installable build.

At planning time, preserve these truthful initial statuses:

The physical Android row is `BLOCKED` because the recorded baseline availability attempt already
identified the missing named build/device; `BLOCKED` is not the default for an unattempted
exercise. Each native subcheck remains `NOT RUN` until it is attempted.

| Gate                                                                                                 | Initial Feature 003 status                     |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Automated implementation commands                                                                    | `NOT RUN`                                      |
| Ten-route deterministic journey                                                                      | `NOT RUN`                                      |
| Arabic RTL and English LTR physical journey                                                          | `BLOCKED` pending named build/device           |
| Predictive/native Back, WCAG contrast, keyboard, media, reduced motion, screen reader, and 200% font | `NOT RUN`                                      |
| Five timed rehearsals and three-person comprehension                                                 | `NOT RUN`                                      |
| Arabic/UAE cultural, faith, safeguarding, sustainability, and accessibility reviews                  | `NOT RUN`                                      |
| Optional live Parent refinement                                                                      | implementation `BLOCKED`; validation `NOT RUN` |

## Release Boundary

This contract is ready for implementation when it is consistent with the approved Feature 003
specification, plan, data model, service contracts, and tasks. Feature 003 is ready for integration
only after automated checks and deterministic route/reset/idempotency evidence pass from a named
worktree state.

Feature 003 MUST NOT be called **Android-accepted** or **demo-accepted** until the physical bilingual
journey, offline fallback, predictive/native Back, WCAG contrast, reset/media/accessibility checks,
five timed rehearsals, three-person comprehension exercise, and required named human reviews are
recorded in
`../../../DEMO_RUNBOOK.md`. Missing native or human evidence remains `BLOCKED` or `NOT RUN`; it is
never inferred.
