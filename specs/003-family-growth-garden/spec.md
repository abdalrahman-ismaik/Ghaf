# Feature Specification: Family Growth Garden

**Feature Branch**: `feature/003-family-growth-garden`

**Created**: 2026-08-26

**Status**: Product scope approved. The user's implementation instruction authorizes the
deterministic P0 after the Feature 003 specification, plan, tasks, and cross-artifact quality gates
pass. Native-device and human-review acceptance remain open and cannot be inferred from artifact
approval.

**Input**: Create an Arabic-first Parent–Child task, recognition, bounded AI-coaching, and UAE
living-garden prototype that preserves the Feature 002 historical record while replacing its
judge-facing product journey with one deterministic, safe, offline-capable ten-route vertical
slice.

## Feature Context and Historical Boundary

Feature 003 changes Ghaf's approved product direction from the Feature 002 food-rescue mission to a
family growth garden. Feature 002 remains historical evidence for the reusable application
baseline only. Its specification, routes, screenshots, completed checks, and open physical Android
and rehearsal gates MUST remain attributed to Feature 002 and MUST NOT be rewritten or counted as
Feature 003 evidence.

Feature 003 retires the replaced Feature 002 product routes only after the new route set is
integrated and verified. It does not create a second application. It remains a competition
prototype using synthetic data, deterministic prepared assistance, symbolic progress, and honest
capability labels; it is not production-ready, authenticated, legally compliant, culturally
approved, or a verified environmental-impact platform.

### Capability Truth at Specification Approval

| Capability                 | Feature 003 contract                                                                                                                                                      | Current evidence status                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Product interaction        | Ten authored routes, bilingual direction, synthetic role/Child selection, task approval, Child action, Parent confirmation, reward, garden/circle projection, and reset   | Authorized target; implementation evidence begins `NOT RUN`                               |
| Synthetic/prepared content | Al Noor household, Salem and Alya, cousin-circle aggregate, task catalog, image/voice fixtures, Parent Guide, Child Coach, and Parent summary                             | Required P0 path; MUST be labeled at point of use                                         |
| Child Coach                | Prepared, task-bounded, deterministic interaction only                                                                                                                    | Live Child coaching is out of P0                                                          |
| Optional live Parent AI    | One synthetic-input task refinement only when an approved secure server boundary, structured validation, safety checks, timeout, and deterministic fallback are evidenced | `BLOCKED` for implementation and `NOT RUN` for validation until that boundary is approved |
| Environmental result       | One Parent-confirmed eligible Green Impact action and symbolic garden growth                                                                                              | Activity, not measured environmental impact or a real-tree claim                          |
| Production capabilities    | Accounts, real Child data/media, real family sharing, unrestricted chat, persistence guarantees, notifications, analytics, or production deployment                       | Future and outside P0                                                                     |

The deterministic prepared journey is the acceptance baseline and MUST complete with every external
service denied. Prepared output MUST never be described as live.

## P0 Scope

P0 contains exactly:

- one synthetic Al Noor household with Salem, age 9, and Alya, age 11;
- one seeded, synthetic, aggregate cousin/family circle;
- eight curated task categories and five connected UAE landscape tracks visible from local
  fixtures;
- one executable, Parent-approved, 12-Seed Green Impact recycling task;
- one bounded Parent Guide refinement, one bounded Child Coach exchange, and one strengths-first
  Parent summary;
- optional prepared synthetic image and voice fixtures with visible origin and visibility labels;
- Parent review and assignment, Child choice and action, optional evidence/reflection, Parent
  check-in, kind retry, specific praise, idempotent confirmation, symbolic growth, and privacy-
  filtered circle progress;
- Arabic-first RTL and an equivalent English LTR journey; and
- one Parent-only deterministic reset that requires no remote service.

Breadth beyond this slice is curated fixture content or later work, not an additional P0 flow.

### Users

- **Parent or guardian, including a grandparent acting as guardian**: selects a synthetic Child,
  creates or adapts a task, reviews safety/privacy/reward details, approves assignment, confirms or
  kindly returns work, edits specific praise, and sees neutral observable summaries.
- **Child ages 6–14**: chooses among Parent-approved tasks, may ask for help or a smaller equivalent,
  uses bounded task coaching, submits without early reward, and sees private self-progress.
- **Demo operator**: resets and performs the exact journey offline in Arabic first and English
  second while disclosing prepared and synthetic content.
- **SMAC judge**: sees who chose, acted, assisted, approved, received symbolic progress, and what
  limited aggregate information may reach the circle.

### Authored Route Contract

Feature 003 MUST expose exactly these ten product routes. Loading, empty, assistant, error, timeout,
fallback, retry, awaiting-confirmation, phase-review, and celebration experiences are states of
these routes, not additional routes.

| Route                 | Required purpose                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `/`                   | Entry, language choice, and prototype/synthetic/prepared disclosure                                                                  |
| `/role`               | Demo Parent/Child mode and synthetic Child selection; explicitly not authentication                                                  |
| `/parent`             | Cooperative family overview, combined canopy, next tasks, and bounded Guide summary                                                  |
| `/parent/task/new`    | Curated task/customization and bounded Parent Guide refinement                                                                       |
| `/parent/task/review` | Bilingual task, safety, privacy, recognition, reward, landscape, and assignment approval                                             |
| `/child`              | Parent-approved choices, personal Seeds, own-goal progress, and garden preview                                                       |
| `/child/task`         | Definition of done, steps, bounded Coach, optional prepared media/reflection, and submission                                         |
| `/parent/check-in`    | Completion review, editable praise, kind retry/equivalent, confirmation, neutral observation, and eligible future-phase review state |
| `/garden`             | Confirmed landscape growth and one household-canopy consequence                                                                      |
| `/circle`             | Cooperative aggregate household/cousin/family view with privacy and synthetic/local disclosure                                       |

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Parent Approves a Safe, Useful Task (Priority: P1)

As a Parent or guardian, I can choose Salem, start from a reviewed Green Impact task, use a bounded
Guide to clarify it, compare the suggestion with my wording, and approve the exact bilingual task
only after I understand its definition of done, safety, privacy, fixed reward, and garden mapping.

**Why this priority**: Parent authorship and approval are the first safety gate and make the
assistant's value visible without letting AI assign work or judge a Child.

**Independent Test**: From the reset Parent overview, create the P0 task, invoke the prepared Guide,
keep the original unchanged until accepting the suggestion, review both languages and every
required boundary, then approve exactly one assignment for Salem.

**Acceptance Scenarios**:

1. **Given** the reset state, **When** the Parent opens task creation, **Then** Salem, all eight
   categories, all five landscape tracks, and the curated P0 Green Impact task are available from
   synthetic local content.
2. **Given** the Parent enters “Take the recycling out,” **When** the prepared Guide is invoked,
   **Then** the response is labeled prepared, says AI may be wrong, improves clarity and safety,
   and does not replace the Parent's text until the Parent chooses **Accept suggestion**.
3. **Given** the Guide suggestion, **When** the Parent chooses **Keep mine**, **Then** the original
   task remains unchanged and no assignment is created.
4. **Given** the P0 task is ready for review, **When** the Parent opens review, **Then** Arabic appears
   first and English second with equivalent title, definition of done, purpose, effort,
   supervision, exclusions, optional evidence, recognition mode, phase, 12-Seed award,
   recurrence, landscape, visibility, and circle eligibility.
5. **Given** any safety-critical field is absent or invalid, **When** approval is attempted, **Then**
   assignment remains blocked and the Parent sees the required correction.
6. **Given** the complete reviewed task, **When** the Parent explicitly approves it, **Then** one
   assignment becomes available to Salem and no Seed, garden, canopy, or circle counter changes.

---

### User Story 2 - Child Chooses and Completes with Bounded Help (Priority: P1)

As Salem, I can choose the Parent-approved task, start it deliberately, see achievable steps, ask
the prepared Coach for task-specific help or an adult, and submit with or without optional prepared
media or reflection.

**Why this priority**: The Child must remain an active, dignified participant rather than the
object of Parent tracking or assistant judgment.

**Independent Test**: Begin with the approved assignment, select it from Child home, enter the task,
use one prepared Coach intent, choose “I need an adult,” complete with permitted help, omit optional
media/reflection, and submit for Parent check.

**Acceptance Scenarios**:

1. **Given** two or three Parent-approved choices, **When** Salem opens Child home, **Then** each choice
   shows its purpose, effort, help/supervision, landscape, recognition mode, and any fixed award,
   without sibling ranking.
2. **Given** the P0 task is assigned, **When** Salem chooses it, **Then** lifecycle state becomes
   `chosen` and does not skip directly to `in_progress`.
3. **Given** the chosen task, **When** Salem explicitly starts or opens the actionable task, **Then**
   state becomes `in_progress`, the approved definition of done remains unchanged, and no reward is
   issued.
4. **Given** the active task, **When** Salem opens the Coach, **Then** only task-bounded prepared
   intents are available, the Coach says it is AI and may be wrong, and an **I need an adult** exit
   is visible.
5. **Given** prepared photo or voice controls, **When** Salem considers either, **Then** its synthetic
   origin, optional nature, Parent visibility, and remove path are explained before use.
6. **Given** Salem completes with permitted adult help, **When** the task is submitted without media
   or reflection, **Then** submission succeeds, acknowledges the effort neutrally, and changes zero
   Seeds, landscape progress, canopy leaves, or circle actions.

---

### User Story 3 - Parent Recognizes, Retries, or Confirms Once (Priority: P1)

As a Parent, I can inspect the observable submission, choose a kind retry or safe equivalent without
loss, or confirm it once and send editable, action-specific praise.

**Why this priority**: Human confirmation—not AI judgment—unlocks recognition and any symbolic
progress while retry remains nonpunitive.

**Independent Test**: Start with a seeded submitted task, exercise kind retry and return to active
work without changing prior progress, resubmit, edit the prepared praise, confirm, then repeat
confirmation five times.

**Acceptance Scenarios**:

1. **Given** a submission, **When** the Parent opens check-in, **Then** completion mode, permitted
   help, prepared evidence, optional reflection, observable facts, uncertainty, and suggested
   praise are shown as separate information.
2. **Given** the task needs another attempt, **When** the Parent chooses **Kind retry**, **Then** it
   returns to `in_progress`, prior earned progress is unchanged, and no failure badge, debt, Seed
   loss, or public mark appears.
3. **Given** a smaller or equivalent task is appropriate, **When** it is agreed before the Child
   accepts that replacement, **Then** the new task may show a different fixed award prospectively;
   help after acceptance never reduces the displayed award.
4. **Given** the valid P0 submission, **When** the Parent confirms once, **Then** action-specific praise
   appears first and exactly one guarded 12-Seed recognition result is produced.
5. **Given** the same confirmed submission, **When** confirmation is attempted repeatedly, **Then**
   every repeat is a neutral no-op labeled already confirmed and all counters remain unchanged.

---

### User Story 4 - Confirmed Action Grows the Right Shared Surfaces (Priority: P1)

As a family, we can see the confirmed Green Impact action add permanent symbolic growth to the
Mangrove landscape, one combined-canopy leaf, and one coarse cooperative circle action without
exposing Salem's task record or calling the result measured environmental impact.

**Why this priority**: The UAE living garden is Ghaf's emotional payoff, and privacy filtering is
part of the product behavior rather than a later cleanup.

**Independent Test**: Start at the exact reset counters, confirm the P0 event once, verify all four
post-confirmation values and static/reduced-motion outcomes, then attempt private and non-Green
projections and observe that they are rejected before any shared update.

**Acceptance Scenarios**:

1. **Given** reset Mangrove progress of 48/60 at Shoot, **When** the one confirmed 12-Seed award is
   recognized, **Then** Salem reaches 60 Seeds and the Mangrove reaches 60/60 Sapling.
2. **Given** the task is acquisition-phase, household-visible, and Green Impact, **When** privacy
   filtering succeeds, **Then** the household canopy changes from 19/25 to 20/25 and the circle
   changes from 11/12 to 12/12 using one action—not 12 Seeds.
3. **Given** reduced motion or unavailable animation, **When** recognition completes, **Then** the
   same final counters, stage, cause, and symbolic-growth disclosure appear immediately.
4. **Given** a private, non-Green, sensitive, invalid, or duplicate event, **When** a shared update is
   attempted, **Then** the event is rejected before the canopy/circle visual or counter changes.
5. **Given** the garden celebration, **When** the family reads its meaning, **Then** it names careful
   recycling as a practical sustainability action and does not claim liters, kilograms, carbon,
   habitat restoration, environmental impact, or a planted tree.

---

### User Story 5 - Parent Sees Cooperative Progress, Not Surveillance (Priority: P2)

As a Parent, I can see the combined family canopy, each synthetic Child's next action and requested
support, and a strengths-first summary over a stated time window without raw sibling comparison,
diagnosis, or hidden private content.

**Why this priority**: The overview must help a family adjust routines without becoming a public
behavior chart or assessment system.

**Independent Test**: Open the Parent overview from reset, inspect the combined canopy and prepared
summary, verify its facts/uncertainty/question/adjustment structure, and scan all household and
circle fields for prohibited comparison or sensitive content.

**Acceptance Scenarios**:

1. **Given** Salem and Alya's synthetic records, **When** the Parent overview opens, **Then** it shows
   one combined canopy and useful next actions without side-by-side raw Seed totals, pace, rank, or
   age-unequal contribution trails.
2. **Given** the prepared Parent summary, **When** it is shown, **Then** it names a time window, leads
   with strengths and observable facts, marks uncertainty, proposes one open question and one
   adjustment, and remains correctable by the Parent.
3. **Given** any prohibited diagnostic, character, emotion, truthfulness, religiosity, or parenting-
   quality language, **When** the summary is validated, **Then** it is rejected and the reviewed
   prepared summary is used instead.

---

### User Story 6 - Operator Resets and Demonstrates Offline in Both Languages (Priority: P1)

As a demo operator, I can restore the exact Arabic-first baseline from every meaningful state and
complete the same ten-route Parent-to-Child-to-growth journey with external services denied.

**Why this priority**: Competition reliability and honest fallback are required even when native,
network, or optional live-AI conditions are unavailable.

**Independent Test**: Reset separately from task drafting, assistant result, active task, submitted,
retry, confirmed, garden, and circle states; deny external services; complete the Arabic journey,
reset, switch to English, and complete it again.

**Acceptance Scenarios**:

1. **Given** any meaningful journey state, **When** the Parent confirms **Reset synthetic demo**,
   **Then** the exact canonical state is restored at `/` with Arabic RTL and no stale Back history.
2. **Given** all external services are denied, **When** the judge flow runs, **Then** the reviewed
   prepared Parent Guide, Child Coach, media fallbacks, Parent summary, reward, garden, circle, and
   reset all remain usable.
3. **Given** an optional live Parent refinement timeout, malformed result, safety rejection, or
   failure, **When** the attempt resolves, **Then** the same-attempt prepared result appears with
   retained Parent input and an honest prepared/fallback label.
4. **Given** Arabic or English is selected, **When** the whole flow is completed, **Then** equivalent
   decisions, safety, privacy, reward, disclosures, and final counters are available in the
   corresponding direction.

---

### User Story 7 - Synthetic Parent and Child Access Stay Separate (Priority: P3)

As a prototype family, we can exercise distinct local Parent and Child sessions without treating a
visual role switch as authority or claiming production authentication.

**Why this priority**: The redesign needs a testable access boundary before sensitive Reward,
membership, media, voice, or AI settings can be modeled safely.

**Independent Test**: Sign in with the deterministic Parent fixture, issue and approve an expiring
Child pairing code, open a Child session, and prove the Child projection cannot read or change
Parent-only data. Exercise expired, replayed, revoked, wrong-purpose, and wrong-actor failures.

**Acceptance Scenarios**:

1. **Given** a synthetic Parent session, **When** a pairing request is approved once before expiry,
   **Then** a local Child device session is issued without a Child email address or phone number.
2. **Given** a Child session, **When** it requests Parent reports, Family Reward changes, League
   membership changes, or permission changes, **Then** the capability check denies the request.
3. **Given** a sensitive Parent action, **When** a valid action-scoped reauthentication proof is
   consumed, **Then** the action may proceed once; stale, replayed, or wrong-purpose proofs fail.

---

### User Story 8 - Parent Manages a Private Family Reward Promise (Priority: P3)

As a Parent, I can define an optional private promise tied to a Child's personal Seed or Garden
milestone, without converting Seeds to money or making League position affect eligibility.

**Why this priority**: The feature can represent a clear family agreement while preserving
permanent symbolic progress, child dignity, and the absence of payment infrastructure.

**Independent Test**: Create each supported milestone and promise kind with a valid Parent proof;
evaluate progress before and after the milestone; mark an unlocked promise given; and prove protected
categories, rank inputs, retroactive edits, withdrawal, cross-Child reads, and Seed-to-money
conversion are rejected.

**Acceptance Scenarios**:

1. **Given** a valid private plan, **When** the personal milestone is reached after praise and Garden
   recognition, **Then** its lifecycle moves from `promised` to `unlocked` exactly once.
2. **Given** an unlocked plan, **When** any caller tries to withdraw or alter the agreed milestone,
   **Then** the plan stays unlocked and unchanged.
3. **Given** monetary promise metadata, **When** monthly commitments are summarized, **Then** only
   Parent-entered amounts are totaled and no Seed-to-currency rate or payment action exists.

---

### User Story 9 - Family Uses a Fair Synthetic Weekly Challenge (Priority: P3)

As an invited synthetic family group, children can complete five age-appropriate Challenge Leaves,
see a normalized weekly result, share tied positions, and contribute to a cooperative goal without
exposing tasks, evidence, Seeds, or protected activity.

**Why this priority**: The redesign separates permanent personal growth from a bounded weekly
competition and keeps cooperation visible alongside it.

**Independent Test**: Assign exactly five eligible Leaves, confirm them with and without permitted
help, verify capped scores and shared ties, roll to a new week without changing Seeds or Garden,
and validate the strict Child-facing projection and prepared encouragement allowlist.

**Acceptance Scenarios**:

1. **Given** five assigned Challenge Leaves, **When** three are confirmed, **Then** the Weekly Growth
   Score is 60; extra non-Challenge tasks never increase it beyond 100.
2. **Given** equal scores, **When** positions are calculated, **Then** tied children share a position
   and completion timestamps are not accepted as ranking input.
3. **Given** a League projection candidate, **When** it contains task text, evidence, Seeds, media,
   reflections, Parent notes, or protected categories, **Then** it is rejected before projection.

---

### User Story 10 - Coach Adapts Safely and Reviews Synthetic Voice (Priority: P3)

As a Child, I receive age-appropriate task coaching and can rehearse a synthetic push-to-talk flow
only when a Parent grant permits it, while the current approved task and adult exit remain visible.

**Why this priority**: The existing input allowlist is useful but does not yet enforce age-specific
output shape or the voice review lifecycle proposed by the redesign.

**Independent Test**: Validate output constraints for all three age bands and exercise explicit
start, stop, transcript review, delete-before-send, send, replay, captions, slower playback,
permission denial, task mismatch, and reset without requesting a microphone.

**Acceptance Scenarios**:

1. **Given** a supported age band, **When** a prepared Coach result is adapted, **Then** its step
   count, tone, pace, choices, and adult-exit metadata satisfy that band's bounded policy.
2. **Given** no stored Parent voice grant or a mismatched active task, **When** voice start is
   requested, **Then** the request fails without creating a recording state.
3. **Given** a synthetic transcript under review, **When** the Child deletes it before send, **Then**
   no submitted transcript remains and replay is unavailable.

### Edge Cases

- The Parent leaves a required definition, adult-supervision, safety, privacy, reward, or
  recognition field incomplete; review/assignment remains blocked without discarding valid input.
- The Parent rejects the Guide suggestion; the original task remains intact and assignable only
  after its own complete review.
- The Child opens an assignment not intended for the active synthetic profile; selection is
  rejected and no private content is revealed.
- The Child chooses a task but does not start it; the state remains `chosen`, with no inferred work
  or reward.
- The Child completes with help, uses no media, skips reflection, asks for a smaller step, pauses,
  or retries later; each is dignified and no earned progress is removed.
- Prepared image or audio is missing; descriptive synthetic placeholder/transcript remains
  available and completion is never blocked.
- A task contains glass, sharps, batteries, chemicals, medicine, spoiled, leaking, or unknown
  waste, electrical repair, road crossing, a vehicle path, unsafe heat/traffic, a compactor, chute,
  or bin-room machinery; the Child is told to stop and involve an adult, and the unsafe action is
  not assigned.
- Parent confirmation is interrupted, repeated, or resumed after navigation; at most one award,
  growth update, canopy leaf, and circle action exists for that submission.
- A recognition/phase combination is invalid, `standard` is recurrent, or a recurrent rewarded
  task is not `fade_first`; the task is rejected before assignment.
- `circleEligible = true` is paired with a non-Green category or `child_guardian`; the object is
  rejected before any shared projection.
- Maintenance Green Impact is confirmed; it may add one eligible coarse activity after filtering,
  but adds no Seeds or persistent landscape/canopy growth.
- A third recurrent `fade_first` acquisition confirmation occurs; the current completion is
  unchanged and the Parent sees an unselected future-phase choice rather than an automatic switch.
- A language switch occurs during a safe in-progress state; task identity and lifecycle remain
  unchanged while copy and direction update.
- Large Arabic copy, mixed scripts, 12-Seed values, diacritics, font scaling, reduced motion,
  keyboard, or Back navigation must not hide safety or the dominant action.
- Reload loses in-memory rehearsal state; the prototype discloses this and reset restores the exact
  baseline rather than implying persistent accounts.
- The circle fixture is unavailable; a local privacy explanation and household goal appear without
  exposing an individual record.

## P0 Demonstration Contract

### Exact Task Fixture

| Field                | Required value                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Child                | Salem, synthetic, age 9                                                                                            |
| Category / landscape | Green Impact — أثر أخضر / Mangrove coast                                                                           |
| English title        | Sort clean recyclables and go with an adult to the guardian-approved safe recycling bin                            |
| Arabic title         | فرز المواد النظيفة القابلة لإعادة التدوير ومرافقة شخص بالغ إلى حاوية إعادة تدوير آمنة يحددها وليّ الأمر            |
| Estimated effort     | 15–30 minutes                                                                                                      |
| `recognitionMode`    | `standard`                                                                                                         |
| `routinePhase`       | `acquisition`                                                                                                      |
| Recurrence           | `once`                                                                                                             |
| Displayed award      | 12 Seeds after one Parent confirmation                                                                             |
| `visibilityScope`    | `household`                                                                                                        |
| `circleEligible`     | `true`                                                                                                             |
| Evidence/reflection  | Optional prepared synthetic fixtures; neither is required to complete                                              |
| Meaning              | Responsible handling of locally accepted recyclable material; no quantified or verified environmental-impact claim |

**Definition of done**: After an adult pre-check, Salem sorts intact, non-sharp clean paper and
plastic accepted by the local stream into the correct household recycling container. If needed,
Salem helps only after the adult's second check to close one lightweight recycling bag, then
accompanies the adult on a guardian-approved safe route. The adult assesses heat and traffic,
carries the bag, and handles disposal. The route requires no road crossing, and Salem stays out of
vehicle paths, compactors, waste chutes, and bin-room machinery. If heat or traffic is unsafe, the
family postpones the route or uses an indoor sorting alternative. General household waste is not
part of this task.

The Arabic definition of done and safety text MUST use the canonical Modern Standard Arabic in
`DEMO_RUNBOOK.md` unchanged until a named fluent/cultural review records a correction. Agents MUST
NOT improvise alternative safety-critical Arabic.

**Required safety boundary**:

- an adult pre-checks every item and approves the local recycling stream;
- Salem handles only intact, non-sharp, clean paper and plastic approved by the adult;
- Salem never touches glass, sharps, batteries, chemicals, medicine, spoiled material, leaking
  bags, or unknown waste;
- Salem never repairs a bin, appliance, light, or electrical item and asks an adult whenever
  unsure;
- the adult performs a second check before bag closing, assesses heat and traffic, carries the
  bag, chooses and owns the route, and handles disposal;
- the route has no road crossing and keeps Salem out of vehicle paths, compactors, chutes, and
  bin-room machinery; unsafe heat or traffic causes postponement or an indoor alternative; and
- Salem washes hands afterward.

The starter-catalog task `GI01` remains an 8-Seed, single-step `fade_first + acquisition` sorting
routine. The P0 task is a separate 12-Seed, multi-step, recurrence-once `standard + acquisition`
variant; the higher fixed amount reflects the approved 15–30-minute scope and MUST NOT silently
change `GI01`. General household-waste disposal remains Home Responsibility and never receives
Green/circle credit.

### Category and Landscape Visibility

| Task category        | Arabic            | Landscape track       | Default sharing boundary                                          |
| -------------------- | ----------------- | --------------------- | ----------------------------------------------------------------- |
| Faith & Gratitude    | الإيمان والامتنان | Sidr reflection grove | Child/guardian; recognition-only by default                       |
| Roots & Kinship      | جذورنا            | Ghaf desert grove     | Child/guardian or household; never circle                         |
| Home Responsibility  | مسؤوليتي          | Samar desert grove    | Household; never circle unless a separate valid Green task exists |
| Green Impact         | أثر أخضر          | Mangrove coast        | Household may be circle-eligible after filtering                  |
| Food & Hospitality   | النعمة والضيافة   | Date-palm oasis       | Household; never circle                                           |
| Heritage & Etiquette | تراثنا وآدابنا    | Ghaf desert grove     | Private/household; never circle                                   |
| Kindness & Community | اللطف والمجتمع    | Samar desert grove    | Recognition-only or fade-first preparation; never circle          |
| Learning & Wellbeing | التعلّم والتوازن  | Sidr reflection grove | Child/guardian; never circle                                      |

### Exact Reset and Confirmation Values

The Parent-only reset requires a small confirmation and MUST restore all values atomically without
network access.

| Field                        | Canonical reset value                                          |
| ---------------------------- | -------------------------------------------------------------- |
| Locale/direction             | Arabic / RTL                                                   |
| Route/history                | `/`; no stale Back history                                     |
| Demo mode                    | Parent; role switch labeled not authentication                 |
| Household                    | Synthetic Al Noor family                                       |
| Children                     | Salem, age 9; Alya, age 11; both visibly synthetic             |
| Active Child                 | Salem                                                          |
| Salem personal earned Seeds  | 48                                                             |
| Alya personal earned Seeds   | 36                                                             |
| Salem Mangrove track         | 48/60, Shoot                                                   |
| Household Ghaf canopy        | 19/25 contribution leaves                                      |
| Circle Green Impact goal     | 11/12 eligible actions; synthetic/local                        |
| Active assignment/submission | None                                                           |
| Prepared Parent Guide result | `guide_recycling_refine_v1`                                    |
| Prepared Child Coach result  | `coach_recycling_steps_v1`                                     |
| Prepared image               | `fixture_recycling_clean_v1`; synthetic/prepared label visible |
| Prepared audio               | `fixture_salem_plan_ar_v1`; synthetic/prepared label visible   |
| Assistant mode               | Deterministic prepared; no remote dependency                   |
| Celebration state            | `available = false`; `consumed = false`                        |

One valid confirmation changes only these counters:

| Counter                     |        Before |                                After |
| --------------------------- | ------------: | -----------------------------------: |
| Salem personal earned Seeds |            48 |                                   60 |
| Salem Mangrove progress     |  48/60, Shoot |                       60/60, Sapling |
| Household canopy            |  19/25 leaves |                         20/25 leaves |
| Circle Green Impact goal    | 11/12 actions | 12/12 actions, cooperative milestone |

A duplicate confirmation changes nothing.

### Prepared Assistant and Recognition Fixture Contract

The prepared Parent Guide interaction uses `guide_recycling_refine_v1` with the Parent input
“Take the recycling out.” Its reviewed response MUST turn that wording into the Exact Task
Fixture without omitting any adult check, item exclusion, route, heat/traffic, disposal, or
ask-an-adult boundary. The Parent sees **Accept suggestion**, **Keep mine**, and **Make smaller**.
The point-of-use disclosure is “Prepared AI example. AI can be wrong; the Parent decides.” The
Arabic controls and disclosure use the canonical `DEMO_RUNBOOK.md` wording until named review.

The prepared Child Coach interaction uses `coach_recycling_steps_v1` and exactly these task-bounded
steps:

1. Ask an adult to pre-check the clean items and choose the household recycling bin.
2. Sort only the intact, non-sharp paper and plastic the adult approved.
3. Stop and ask an adult if anything is sharp, leaking, dirty, or unknown.
4. After the adult checks again, help close the light recycling bag if needed, go with the adult on
   the safe route while the adult carries/disposes, then wash your hands.

Its prepared if–then cue is “After the adult checks the items, I sort the clean recyclables.” It
shows **I need an adult** and the disclosure “Prepared AI-assistant example; this response is
prewritten and may be wrong.” The canonical Arabic steps, cue, exit, and disclosure in
`DEMO_RUNBOOK.md` MUST remain unchanged until named review. There is no live Child Coach in P0.

The prepared editable praise is: “You sorted the clean recyclables and asked before going to the
bin—that kept the job safe and helped our household.” Its Arabic pair is «لقد فرزت المواد النظيفة
القابلة لإعادة التدوير وسألت قبل الذهاب إلى الحاوية؛ وهذا جعل المهمة أكثر أماناً وساعد أسرتنا.»

The prepared Parent summary MUST cover the current synthetic seven-day window, lead with Salem's
two Green Impact steps and one appropriate request for adult help, state that the record is
synthetic and cannot explain a postponed task, and suggest asking which step felt easiest and
whether the next task should stay the same size. It MUST NOT infer a motive, trait, diagnosis,
emotion, truthfulness, religiosity, or parenting quality.

### Lifecycle and Transition Guards

The machine values for recognition are exactly `standard | fade_first | recognition_only`. The
machine values for routine phase are exactly `acquisition | maintenance | not_applicable`.
The machine values for `visibilityScope` are exactly `child_guardian | household`, and
`circleEligible` is a Boolean. User-facing labels MAY use “fade-first” and “recognition-only,” but
stored or exchanged domain values MUST use underscores.

The task lifecycle is:

`draft → reviewed → assigned → chosen → in_progress → submitted → retry | confirmed → recognized`

- `draft → reviewed` requires complete positive action, definition, safety, privacy, reward, and
  bilingual fields.
- `reviewed → assigned` requires explicit Parent approval.
- `assigned → chosen` requires the assigned Child's deliberate choice.
- `chosen → in_progress` requires an explicit start/open action and MUST remain a separate guarded
  transition.
- `in_progress → submitted` requires the approved definition of done to be acknowledged; prepared
  media and reflection remain optional.
- `submitted → retry → in_progress` changes no reward or persistent/shared progress.
- `submitted → confirmed` requires one Parent confirmation.
- `confirmed → recognized` presents Parent praise and applies any valid result once. Award
  application is a guarded idempotent consequence, not a universal lifecycle state.

No other transition may issue Seeds, persistent garden/canopy growth, or circle activity.

### Reward and Projection Matrix

Only these recognition/phase combinations are valid:

| `recognitionMode` + `routinePhase`  | Seeds after confirmation | Persistent landscape/canopy                          | Circle                                                                  |
| ----------------------------------- | ------------------------ | ---------------------------------------------------- | ----------------------------------------------------------------------- |
| `standard + acquisition`            | Fixed displayed award    | Mapped landscape; canopy only when household-visible | One coarse event only for eligible household Green Impact               |
| `fade_first + acquisition`          | Fixed displayed award    | Same                                                 | Same; third recurrent confirmation prompts a Parent future-phase review |
| `standard + maintenance`            | None                     | None                                                 | One coarse eligible Green Impact activity may be recorded               |
| `fade_first + maintenance`          | None                     | None                                                 | One coarse eligible Green Impact activity may be recorded               |
| `recognition_only + not_applicable` | None                     | None                                                 | Never                                                                   |

Every other pairing is invalid. `standard` MUST be finite or have `recurrence = once`. A recurrent
reward-eligible task MUST use `fade_first`. A third confirmed recurrent `fade_first` acquisition
completion prompts **Keep acquisition** or **Move future completions to maintenance** with neither
preselected. Only the Parent may make or reverse that prospective choice. The current completion
and all prior Seeds/growth remain unchanged, and Ghaf never declares that a habit formed.

Allowed fixed awards are 4, 6, 8, 12, or 15 Seeds. Completing an accepted task with permitted help
earns the displayed amount. Only a smaller replacement agreed before acceptance may display a
smaller amount. Seeds are symbolic, nonfinancial, nontransferable, nonpurchasable, permanent, and
never randomized or deducted.

### Five-Stage Growth Thresholds

Landscape stages use these deterministic cumulative Seed thresholds:

| Stage       | Cumulative threshold |
| ----------- | -------------------: |
| Seed        |                    0 |
| Shoot       |                   20 |
| Sapling     |                   60 |
| Shade       |                  120 |
| Flourishing |                  200 |

The P0 begins at 48/60 Shoot. The single valid 12-Seed confirmation reaches the threshold and MUST
present 60/60 Sapling. No progress may reverse or wither. A static, text-equivalent final state is
required when motion is reduced or unavailable.

## Requirements _(mandatory)_

### Functional Requirements

#### Scope, Routes, and Capability Truth

- **FR-001**: Feature 003 MUST preserve Feature 002 artifacts and evidence as historical records and
  MUST NOT use any Feature 002 pass to satisfy a Feature 003 criterion.
- **FR-002**: The product MUST expose exactly the ten authored routes in the Authored Route Contract
  and no additional authored product route.
- **FR-003**: Loading, assistant, empty, timeout, fallback, retry, awaiting-confirmation, phase-
  review, and celebration behavior MUST remain states within the ten routes.
- **FR-004**: Replaced Feature 002 product routes MUST be retired only after the Feature 003 route
  set is integrated and verified; historical Feature 002 artifacts MUST remain intact.
- **FR-005**: Every judge-facing capability MUST be labeled as real interaction, synthetic,
  prepared/prewritten, simulated, estimated/self-reported, live, blocked/not run, or future wherever
  misunderstanding is reasonably possible.
- **FR-006**: The role selector MUST state that it is a shared-device demo shortcut and not
  authentication.
- **FR-007**: P0 MUST use only synthetic household, Child, media, assistant, summary, and circle data.
- **FR-008**: The complete deterministic journey MUST remain usable with every external service
  denied.
- **FR-009**: Optional live Parent AI MUST remain unavailable and labeled `BLOCKED`/`NOT RUN` unless
  an approved secure server boundary and direct validation evidence exist; it MUST NOT block P0.
- **FR-010**: The Child Coach MUST be prepared-only in P0, with no live or unrestricted-chat mode.

#### Entry, Role, and Family Overview

- **FR-011**: `/` MUST begin in Arabic RTL and show the Ghaf identity, one landscape cue, language
  choice, synthetic/prepared prototype disclosure, and one dominant enter action.
- **FR-012**: `/role` MUST offer Parent mode and the synthetic Salem/Alya Child choices without
  accounts, passwords, identity verification, or production privacy claims.
- **FR-013**: Salem MUST be shown as synthetic and age 9; Alya MUST be shown as synthetic and age 11.
- **FR-014**: `/parent` MUST show one combined family canopy, the next cooperative milestone, each
  Child's next task/requested support, a bounded strengths-first Guide summary, one dominant create-
  task action, and secondary garden/circle actions.
- **FR-015**: The Parent and sibling-facing overview MUST NOT place Salem and Alya's raw Seeds, pace,
  ranks, or age-unequal contributions side by side.
- **FR-016**: The Parent summary MUST state its time window, lead with strengths, report observable
  facts, separate uncertainty, offer one open question and one adjustment, and remain Parent-
  correctable through a bounded local edit of the synthetic observable facts followed by the same
  prohibited-language validation; correction MUST NOT open free-form Child analysis or a remote
  conversation.
- **FR-017**: The Parent summary MUST reject normal/abnormal, lazy/defiant, good/bad Child, diagnosis,
  ADHD or condition names as conclusions, emotion/personality/risk scores, deception/truthfulness,
  religiosity, parenting quality, and family-quality judgments.

#### Task Catalog, Drafting, and Approval

- **FR-018**: The eight named task categories and five mapped landscape tracks in the P0 contract
  MUST be visible from local curated fixtures.
- **FR-019**: Every task MUST declare a positive observable action, why it matters, definition of
  done, age band, estimated effort, permitted help, supervision, safety exclusions, optional
  evidence, `recognitionMode`, displayed award or recognition-only status, `routinePhase`,
  recurrence, landscape, `visibilityScope`, `circleEligible`, privacy, and Arabic/English copy.
- **FR-020**: The P0 executable task MUST match the Exact Task Fixture, including Salem, 15–30-minute
  scope, adult checks, accompanied route, `standard + acquisition`, `once`, 12 Seeds, Mangrove,
  `household`, and `circleEligible = true`.
- **FR-021**: The P0 task MUST remain distinct from 8-Seed catalog task `GI01`; general household-
  waste disposal MUST remain Home Responsibility and MUST NOT receive circle credit.
- **FR-022**: `/parent/task/new` MUST require a Child and curated category/template before custom
  wording can proceed to review.
- **FR-023**: The Parent Guide MUST expose explicit bounded actions such as make clearer, make
  smaller, check safety, or adapt age rather than an open chat.
- **FR-024**: Parent-authored text MUST remain unchanged until the Parent explicitly accepts a Guide
  suggestion; **Keep mine** MUST preserve the original.
- **FR-025**: Custom wording MUST pass the same task, safety, reward, privacy, and category rules as a
  curated template.
- **FR-026**: `/parent/task/review` MUST present Arabic first and English second with equivalent
  action, definition, meaning, effort, supervision, exclusions, evidence, recognition, award,
  phase, recurrence, landscape, visibility, and circle eligibility.
- **FR-027**: Safety-critical text MUST appear before assignment approval and MUST NOT be hidden or
  collapsible.
- **FR-028**: Only explicit Parent approval after complete review MAY move a task from `reviewed` to
  `assigned`.
- **FR-029**: Assignment approval MUST create no Seeds, persistent growth, canopy leaf, activity
  record, or circle progress.

#### Child Choice, Task, Help, and Submission

- **FR-030**: `/child` MUST show two or three Parent-approved choices and MUST display each
  choice's purpose, effort, permitted help, recognition, fixed award if any, and landscape.
- **FR-031**: The Child MUST be able to choose, ask for help, ask to make a task smaller, accept a
  safe equivalent, complete with permitted help, retry, or return later without shame or loss.
- **FR-032**: `assigned → chosen` and `chosen → in_progress` MUST be separate, guarded lifecycle
  transitions; choosing MUST NOT imply that work started.
- **FR-033**: `/child/task` MUST show one unchanged Parent-approved definition of done followed by no
  more than four short steps.
- **FR-034**: The Child Coach MUST remain bound to the active Parent-approved task and MUST NOT alter
  its completion criterion.
- **FR-035**: Child Coach intents MUST be limited to simplify, show steps, create an if–then cue,
  rehearse one reviewed phrase, respond to one prepared fixture, offer one optional skippable task-
  focused reflection, or request an adult.
- **FR-036**: Ages 6–8 MUST use curated intents without free text; ages 9–11 MUST use structured
  intents/template input; ages 12–14 MAY use guardian-enabled bounded text or push-to-talk with
  stronger controls; no band MAY receive unrestricted chat.
- **FR-037**: The Child Coach MUST say it is AI and may be wrong, stay on task, and provide a visible
  trusted-adult exit for hazards or uncertainty.
- **FR-038**: Photo, audio, and reflection MUST be optional and skippable; their omission MUST NOT
  prevent task completion or reduce the displayed reward.
- **FR-039**: Before optional prepared media or reflection is submitted, the Child MUST be told what
  the Parent can see and that no cross-household sharing occurs.
- **FR-040**: Submission MUST provide a neutral acknowledgement and move to `submitted` with zero
  Seeds, landscape growth, canopy change, activity record, or circle progress.

#### Parent Check-In, Recognition, and Reward

- **FR-041**: `/parent/check-in` MUST show completion mode, permitted help, optional prepared
  evidence, optional reflection, and observable facts separately. It MUST remain safely reachable
  for the matching pending-confirmation or recognized journey so the Parent can complete the
  praise-first continuation or receive the neutral duplicate-confirmation result.
- **FR-042**: The Parent MUST be able to confirm, choose kind retry, make a future task smaller, or
  agree a safe equivalent without a reject/shame state.
- **FR-043**: Kind retry MUST return the current task to `in_progress` and MUST NOT change prior Seeds,
  growth, canopy, or circle totals.
- **FR-044**: Suggested praise MUST describe the action, strategy, improvement, or appropriate help-
  seeking and MUST remain editable before sending.
- **FR-045**: A valid P0 confirmation MUST render the final praise in an observable intermediate
  state, then require a distinct Parent continuation before applying exactly one 12-Seed result;
  one event handler MUST NOT mark praise presented and apply recognition in the same turn.
- **FR-046**: Parent confirmation MUST be idempotent; duplicate attempts MUST be neutral no-ops that
  duplicate no transaction, growth, leaf, activity, milestone, or celebration.
- **FR-047**: Completing an accepted task with permitted help MUST earn the displayed award; only a
  smaller replacement agreed before acceptance MAY display a lower award.
- **FR-048**: Fixed numeric awards MUST be limited to 4, 6, 8, 12, or 15 Seeds and MUST never use
  randomness, multipliers, purchase, transfer, cash value, debt, deduction, or scarcity.
- **FR-049**: Earned Seeds and persistent growth MUST be permanent; no missed day, illness, travel,
  disability, access need, rest, or retry may create a punitive streak, public failure, or dying
  vegetation.
- **FR-050**: Only the five recognition/phase combinations in the Reward and Projection Matrix MAY
  be accepted; every other combination MUST be rejected before assignment.
- **FR-051**: `standard` MUST be finite or `recurrence = once`; every recurrent reward-eligible
  routine MUST use `fade_first`.
- **FR-052**: `recognition_only` MUST use `not_applicable` and MUST create no Seed transaction,
  persistent landscape/canopy growth, or circle event.
- **FR-053**: `standard` or `fade_first` maintenance MUST create no Seeds or persistent landscape/
  canopy growth; an eligible Green Impact completion MAY still create one coarse activity event.
- **FR-054**: The third confirmed recurrent `fade_first` acquisition completion MUST prompt an
  unselected Parent choice for future completions; it MUST NOT change phase automatically or alter
  the current or prior completions.
- **FR-055**: A Parent phase decision MUST be prospective, visible, reversible, and MUST NOT imply
  that a habit has formed.

#### Garden Growth and Shared Projection

- **FR-056**: Landscape progression MUST use cumulative thresholds Seed 0, Shoot 20, Sapling 60,
  Shade 120, and Flourishing 200.
- **FR-057**: The P0 MUST start at Mangrove 48/60 Shoot and one valid confirmation MUST present
  60/60 Sapling after adding exactly 12 Seeds.
- **FR-058**: `/garden` MUST show praise/cause before or with the final symbolic consequence, add one
  household canopy leaf, show all five connected tracks, visually emphasize Mangrove, and offer the
  circle as the next dominant action.
- **FR-059**: Growth MUST remain understandable from its static stage, label, and changed detail and
  MUST NOT depend on color, motion, or sound alone.
- **FR-060**: Reduced motion or motion failure MUST render the same final values and a textual cause-
  and-effect explanation immediately.
- **FR-061**: Garden growth MUST be labeled symbolic and MUST NOT claim real planting, habitat
  restoration, liters, kilograms, carbon, or measured environmental impact.
- **FR-062**: A Parent-confirmed observable quantity MAY be labeled self-reported or estimated
  activity; it MUST NOT be called environmental impact without an approved conversion method.
- **FR-063**: Privacy filtering MUST run before every household/circle visual or counter update.
- **FR-064**: `visibilityScope = child_guardian` MUST remain visible only to the Child and guardians
  and MUST add no household-canopy contribution.
- **FR-065**: A household-visible acquisition rewarded task MAY add one combined-canopy leaf without
  exposing an individual raw total.
- **FR-066**: `circleEligible = true` MUST be accepted only for Green Impact with
  `visibilityScope = household`; every other pairing MUST be rejected before projection.
- **FR-067**: A valid circle projection MUST contain only one coarse family-level eligible Green
  action and MUST exclude the task record, Child identity, and Seeds.
- **FR-068**: `/circle` MUST show seeded family-level cooperative progress and a common goal, offer
  finish or Parent reset, and contain no podiums, first/last rank, Child profile grids, messages,
  comments, reactions, discovery, or real invitations.
- **FR-069**: `/circle` MUST state that its data is synthetic/local and real sharing is not
  implemented.
- **FR-070**: Prayer, kinship, affection, food consumption, hygiene, wellbeing, disability-related
  routines, Parent observations, exact task history, photo/voice, reflections, assistant content,
  and Parent notes MUST never be projected across households.

#### Assistant and Prepared Media Safety

- **FR-071**: The reset MUST provide the exact prepared fixture identifiers in the canonical reset
  table and each fixture MUST carry its origin label beside the relevant control or result.
- **FR-072**: The prepared Child Coach result MUST be `coach_recycling_steps_v1`; no live Child Coach
  call MAY exist in P0.
- **FR-073**: The prepared Parent refinement MUST be `guide_recycling_refine_v1` and MUST retain the
  Parent's input when fallback occurs.
- **FR-074**: The Parent Guide MAY suggest reviewed tasks, clearer/smaller steps, safety checks,
  descriptive praise, questions, and neutral time-bounded summaries only.
- **FR-075**: The Child Coach MUST NOT ask for secrets, exclusivity, affection, dependence, continued
  conversation, or emotional disclosure and MUST NOT act as friend, therapist, confidant,
  religious authority, or replacement Parent.
- **FR-076**: Neither assistant MAY diagnose, infer emotion/personality, recognize a face or voice,
  judge truthfulness/religiosity, or issue medical, food-safety, religious, or hazardous-action
  decisions.
- **FR-077**: The prototype MUST NOT process real Child photo/voice, listen continuously or in the
  background, or request camera/microphone permission for the deterministic path.
- **FR-078**: Prepared image and voice fixtures MUST contain no Child, face, hand, personal data,
  brand, address, school, readable private text, or watermark and MUST be visibly synthetic.
- **FR-079**: Missing prepared media MUST fall back to descriptive text or transcript and MUST NOT
  block completion.
- **FR-080**: Any optional live Parent refinement MUST use synthetic input, bounded structured
  fields, age/safety validation, a short timeout, and same-attempt deterministic fallback; no live
  result may be labeled without direct verification.
- **FR-081**: No provider secret MAY appear in the client-facing prototype, fixture, documentation,
  log, or source history.

#### Safety, Arabic, Culture, Accessibility, and Reset

- **FR-082**: The Exact Task Fixture's adult pre-check, second check, route ownership, carrying,
  disposal, heat/traffic assessment, no-road-crossing rule, hazard exclusions, indoor alternative,
  ask-an-adult instruction, and handwashing MUST all remain visible and testable.
- **FR-083**: Children MUST NOT be assigned hot gahwa, glass, sharps, chemicals, batteries, unknown
  waste, electrical repair, unsafe outdoor routes, or unsupervised disposal.
- **FR-084**: Food tasks MUST NOT score weight, calories, amount eaten, dieting, or a clean plate;
  Parents retain all food-safety decisions.
- **FR-085**: Faith content MUST be Parent-enabled, private, nonpunitive, `recognition_only` by
  default, excluded from comparison, and free from AI judgment of validity, sincerity, or
  religiosity.
- **FR-086**: Affection, emotion disclosure, and relationship closeness MUST default to
  `recognition_only`; kinship/kindness MUST use recognition-only or fade-first preparation without
  paying for affection or disclosure.
- **FR-087**: Modern Standard Arabic MUST be the P0 default; Emirati dialect, transliteration,
  gendered forms, wedding/majlis/hospitality copy, species metaphors, and all faith copy MUST remain
  marked for named human review.
- **FR-088**: Cultural phrase tasks MUST offer multiple Parent-approved options and MUST NOT present
  one family expression as universally correct.
- **FR-089**: Arabic MUST be the starting locale, use RTL-aware order and directional controls, and
  preserve equivalent decisions, safety, privacy, reward, and disclosure with English LTR.
- **FR-090**: Language switching during a safe current state MUST preserve task identity,
  lifecycle, and valid user input.
- **FR-091**: All dominant controls MUST provide at least a 48×48dp target; adjacent small targets
  MUST have at least 8dp separation.
- **FR-092**: Required content MUST remain operable at 200% font scale without truncating safety or
  actions; text and essential UI contrast MUST meet WCAG 2.2 AA targets; and state MUST not rely on
  color, motion, or sound alone.
- **FR-093**: Controls and changed states MUST have meaningful names, roles, selected/disabled
  states, and once-only announcements for submission, confirmation, reward, stage, and circle
  milestone.
- **FR-094**: Prepared audio MUST have equivalent visible text; prepared images MUST have concise
  descriptions and origin labels.
- **FR-095**: The Parent-only reset MUST require a small confirmation and atomically restore every
  canonical reset value from draft, assistant result/fallback, prepared-media selected/removed/
  unavailable, reviewed, assigned, chosen, in-progress, submitted, retry, confirmed/recognized,
  celebration available/consumed, garden, and circle states.
- **FR-096**: Reset MUST land at `/` in Arabic RTL with no stale Back history and MUST require no
  network access.
- **FR-097**: Exactly one valid P0 confirmation MUST change only the four counters in the canonical
  pre/post table; a duplicate MUST change none.
- **FR-098**: A reload MAY clear rehearsal state only when that limitation is disclosed; reset MUST
  still restore the exact baseline.

#### Product Experience Redesign Domain Foundation

These requirements are a post-P0, domain-only foundation. They MUST NOT add routes, alter the
validated ten-route journey, weaken the Green Circle projector, or imply that production identity,
payment, invitation, or voice infrastructure exists.

- **FR-099**: The existing Feature 003 P0 session, route contract, reset oracle, and deterministic
  Parent → Child → confirmation → growth journey MUST remain the default behavior.
- **FR-100**: Parent and Child access MUST use separate synthetic session types and least-privilege
  projections; a mutable visual role value MUST NOT grant Parent capabilities.
- **FR-101**: The deterministic access service MUST support a synthetic Parent fixture and a Child
  avatar credential without requiring a Child email address or phone number, and MUST label both as
  local prototype behavior rather than production authentication.
- **FR-102**: A Child device pairing request MUST expire, require Parent approval, be consumable once,
  bind to one synthetic Child/device pair, and remain revocable; expired, replayed, mismatched, or
  revoked requests MUST fail closed.
- **FR-103**: Creating or changing monetary Family Reward metadata, League membership, or voice,
  media, or AI permission MUST require an unexpired Parent reauthentication proof scoped to that
  exact action; a proof MUST fail after use or for a different actor or purpose.
- **FR-104**: A Child session MUST NOT edit Family Rewards, change League membership, change
  permissions, enter the Parent experience, or view Parent-only reports.
- **FR-105**: Language preference and separate voice, media, and AI grants MUST be stored per Child;
  sensitive grant changes MUST be Parent-owned and reauthenticated.
- **FR-106**: A Family Reward Plan MUST be a private Parent promise with lifecycle
  `promised → unlocked → given` and MUST remain separate from Seed transactions, Garden growth, and
  Weekly Growth Score.
- **FR-107**: A Family Reward milestone MAY use eligible new Seeds, one named landscape reaching a
  stage, or a count of landscapes reaching a stage; it MUST depend only on personal progress and
  MUST NOT accept League score, rank, speed, or another Child's progress.
- **FR-108**: A Family Reward promise MAY describe money, an experience, a privilege, or a gift, but
  the application MUST NOT transfer, store, reserve, purchase, or take custody of value and MUST NOT
  define a universal Seed-to-currency exchange rate.
- **FR-109**: Family Reward plans and amounts MUST be visible only to the relevant Child and
  guardians. Prayer, affection, emotional disclosure, eating, demonstrating love, private wellbeing,
  or recognition-only activity MUST NOT generate Family Reward eligibility.
- **FR-110**: An unlocked Family Reward MUST NOT be withdrawn or have its agreed milestone changed.
  Parent edits MUST create a prospective plan version, and a monthly summary MAY total only active
  Parent-entered monetary promises in one matching currency.
- **FR-111**: A synthetic League week MUST assign exactly five age-appropriate, Parent-approved,
  accessibility-adaptable Challenge Leaves per participating Child; protected or private activity
  MUST be rejected before assignment.
- **FR-112**: Weekly Growth Score MUST equal confirmed Challenge Leaves divided by five multiplied by
  100, capped at 100. Permitted help and accessibility adaptations MUST earn full credit, tied scores
  MUST share a position, and completion speed MUST NOT be ranking input.
- **FR-113**: League credit MUST be idempotent by recognition key. Weekly rollover MUST clear weekly
  assignments, credit, score, and encouragement while preserving all earned Seeds and Garden growth.
- **FR-114**: A Child-facing League projection MUST contain only an approved synthetic nickname,
  tree-avatar token, completed-Leaf count, score, and position. It MUST reject task text, exact task
  history, evidence, Seeds, media, reflections, assistant content, Parent notes, and protected
  categories before producing output.
- **FR-115**: League interaction MUST use prepared bilingual encouragement identifiers only, prohibit
  free text and direct contact, and add each confirmed Challenge Leaf to a separate cooperative
  weekly family goal.
- **FR-116**: Child Coach output policy MUST define age-specific maximum steps, pace, tone,
  quick-choice availability, and early adult exit while retaining the same Parent-approved task and
  prepared-only P0 provider.
- **FR-117**: A synthetic voice session MUST be push-to-talk only, bind to the active approved task
  and stored Parent grant, and model visible start/stop, transcript review, delete-before-send,
  captions, replay, slower playback, send, and reset. It MUST NOT request a microphone, process real
  voice, identify a speaker, or run in the background.
- **FR-118**: Access, Family Reward, League, age-adaptation, and voice behavior MUST be exposed through
  small deterministic service contracts with no network, new dependency, client secret, production
  persistence claim, or frontend integration in this phase.

### Key Entities

- **Synthetic Household**: Al Noor family; contains the synthetic Parent context, Salem, Alya, one
  combined canopy, and no real identity or account.
- **Synthetic Child Profile**: Salem (9) or Alya (11), with age-band interaction defaults and
  private own-progress; never a public profile.
- **Task Category**: One of the eight bilingual curated categories, mapped to one landscape and a
  default privacy/safety posture.
- **Task Template**: Reviewed bilingual starting content with purpose, definition, age/ability,
  effort, help, supervision, hazards, recognition, phase, recurrence, landscape, visibility, and
  circle eligibility.
- **Task**: A Parent-owned reviewed action created from a template or validated custom wording;
  carries the exact machine values and lifecycle state.
- **Assignment**: One explicit Parent approval connecting a reviewed Task to one synthetic Child;
  creates no reward or progress.
- **Submission**: The Child's completion mode, permitted help, optional prepared media, optional
  reflection, and awaiting-Parent state; creates no reward by itself.
- **Parent Check-In**: The idempotent confirm, kind-retry, smaller, or equivalent decision plus
  editable descriptive praise and neutral observations.
- **Seed Transaction**: One permanent, symbolic, fixed award tied to one valid confirmed
  acquisition completion; never money or an impact unit.
- **Landscape Progress**: Cumulative Seeds and one of five deterministic stages for each mapped
  landscape.
- **Canopy Contribution**: One privacy-filtered household leaf from an eligible household-visible
  acquisition reward; not an individual leaderboard entry.
- **Green Circle Event**: One coarse, family-level eligible Green Impact action after confirmation
  and filtering; contains no Child identity, task record, Seeds, media, or reflection.
- **Assistant Intent/Result**: One allowlisted Parent Guide or Child Coach purpose, structured
  bounded input/output, origin/status, disclosure, and fallback result.
- **Prepared Media Fixture**: Optional synthetic image/audio plus identifier, origin, accessible
  description/transcript, Parent visibility statement, and remove path.
- **Prototype Session**: Locale, demo mode, active Child, task lifecycle, counters, prepared fixture
  identifiers, celebration state, and one exact reset baseline.
- **Synthetic Access Session**: A local Parent or Child principal plus an allowlisted capability
  projection; never a production identity or security claim.
- **Pairing Request / Reauthentication Proof**: Expiring, scoped, replay-resistant local tokens used
  to demonstrate Parent approval and sensitive-action gates.
- **Child Permission Grant**: Parent-owned language, voice, media, and AI preferences for one
  synthetic Child.
- **Family Reward Plan**: A versioned private promise, personal milestone, lifecycle, and optional
  Parent-entered amount with no payment or exchange behavior.
- **Challenge Leaf / League Week**: Five age-appropriate approved weekly challenges, idempotent
  confirmation credit, normalized score, shared position, cooperative total, and rollover state.
- **League Projection**: A strict minimal synthetic participant view that cannot carry task,
  evidence, Seed, or protected-category data.
- **Synthetic Voice Session**: Task-bound local interaction state from explicit start through
  transcript review/delete/send/replay; it never represents captured Child audio.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A route inventory contains exactly the ten authored Feature 003 routes and zero
  replaced Feature 002 product routes after integration.
- **SC-002**: Five consecutive external-service-denied journeys complete from reset through circle
  without a blocked action or prepared/live mislabel.
- **SC-003**: Five consecutive resets from each named FR-095 source state restore every canonical
  value, Arabic RTL `/`, and empty history exactly.
- **SC-004**: One confirmation changes Salem 48→60 Seeds, Mangrove 48/60 Shoot→60/60 Sapling,
  canopy 19/25→20/25, and circle 11/12→12/12; five duplicate confirmation attempts change nothing.
- **SC-005**: Assignment, choosing, starting, and submission each create zero Seeds, persistent
  landscape/canopy growth, and circle progress in all automated and manual checks.
- **SC-006**: All tested valid and invalid recognition/phase rows match the Reward and Projection
  Matrix, including future-only third-confirmation review and no automatic phase change.
- **SC-007**: All eight categories map to the specified five landscapes, and all five cumulative
  growth thresholds return the expected stage at boundary and near-boundary values.
- **SC-008**: Every tested private, sensitive, non-Green, identity-bearing, Seed-bearing, or
  `child_guardian + circleEligible` event is rejected before a shared visual or counter changes.
- **SC-009**: The prepared Parent Guide, prepared Child Coach, image, audio, and summary display
  point-of-use origin/disclosure labels in both languages; zero prepared results are labeled live.
- **SC-010**: The pure Child-interaction policy accepts or rejects all age bands and intents exactly
  as specified; P0 service requests remain limited to the synthetic `9_11` profiles and every
  request remains bound to the active Parent-approved task.
- **SC-011**: A prohibited-language review of Parent summaries finds zero diagnostic, normality,
  character, emotion/personality/risk, deception, religiosity, or parenting-quality judgments.
- **SC-012**: Arabic RTL and English LTR each complete the same ten-route decisions with equivalent
  safety, privacy, reward, and capability meaning on a named physical Android build.
- **SC-013**: Required task/safety copy, actions, and disclosures remain usable at 200% font scale,
  with 48dp targets, logical reading order, once-only announcements, and reduced-motion static
  outcomes on the named target build.
- **SC-014**: Five uninterrupted human rehearsals complete at or below the internal 150-second
  target with exact reset and no hidden setup; median, maximum, and fallback use are recorded.
- **SC-015**: Three people unfamiliar with the detailed design can each explain what Salem did,
  what the bounded assistant did, who approved the reward, and that other families see only one
  coarse eligible Green action.
- **SC-016**: A content review finds zero unsupported environmental conversions, real-tree claims,
  food-safety verdicts, public Child rankings, punishment, random rewards, or real Child data.
- **SC-017**: Named fluent Arabic/cultural, faith, child-safeguarding, sustainability, and
  accessibility reviews are recorded before Feature 003 is described as demo-accepted; any missing
  review remains explicitly `NOT RUN` or causes sensitive content to be removed/labeled.
- **SC-018**: Optional live Parent refinement is described as live only after direct evidence of an
  approved secure boundary, validated synthetic-input result, timeout/fallback, and secret
  isolation; otherwise it remains `BLOCKED`/`NOT RUN` without impairing P0.
- **SC-019**: Every access capability, pairing request, and reauthentication proof test returns the
  expected least-privilege result, including expired, replayed, revoked, wrong-actor, and
  wrong-purpose failures.
- **SC-020**: Family Reward tests cover every lifecycle transition and milestone kind, reject every
  protected-category and League-derived input, preserve unlocked plans, and find no payment or
  Seed-to-currency operation.
- **SC-021**: League tests assign exactly five Leaves, produce scores 0/20/40/60/80/100, cap extra
  credit at 100, share tied positions, ignore completion time, preserve full credit with permitted
  help, and leave Seeds/Garden unchanged at rollover.
- **SC-022**: Every forbidden League projection field is rejected before output; prepared
  encouragement accepts only the bilingual allowlist and cooperative weekly credit remains separate
  from the Green Circle.
- **SC-023**: Age-adaptation tests enforce the configured output shape for all three bands while
  voice-session tests cover permission, task binding, explicit start/stop, transcript deletion,
  send, captions, replay, slower playback, and reset without microphone access.
- **SC-024**: `npm run typecheck`, `npm run lint`, `npm run format:check`, and `npm test` pass with the
  existing ten-route P0 behavior unchanged; frontend, Android, and named-human gates remain at their
  prior evidence status.

## Dependencies and Assumptions

- The existing Feature 002 application is a reusable local foundation, not acceptance evidence for
  Feature 003.
- Arabic is the default locale and the canonical P0 Arabic safety copy remains unchanged until a
  named fluent/cultural reviewer approves revisions.
- The competition prototype uses one shared device, synthetic profiles, local prepared fixtures,
  and no production authentication or persistence guarantee.
- The redesign domain foundation may demonstrate separate local sessions, fixed synthetic
  participants, expiring pairing, and reauthentication state, but none is a production identity,
  tenancy, consent, or security system.
- A Family Reward is only Parent-authored private promise metadata. Ghaf never holds or transfers
  value, and League performance never unlocks it.
- The synthetic League is separate from the current Green Circle. Its strict projection and weekly
  cooperative count cannot be passed to the existing circle projector or P0 counters.
- The deterministic prepared assistant path is sufficient for P0 completion and offline
  acceptance. Optional live Parent refinement is nonblocking and currently lacks an approved
  secure boundary.
- The P0 circle is a local seeded aggregate and implements no real invitation, account, discovery,
  access-control, or sharing behavior.
- Seeds and garden growth are symbolic progression. One eligible circle action is a coarse
  self-reported activity, not an environmental-impact conversion.
- Parents/guardians determine task appropriateness, local recycling acceptance, heat/traffic,
  routes, food safety, cultural phrasing, and when adult help is required.
- Feature 003 implementation may proceed after the complete Spec Kit artifacts and cross-artifact
  quality analysis pass; no additional product-choice approval is required unless a genuine
  unresolved conflict or scope expansion appears.
- Physical Android, Arabic/RTL, reduced-motion, media, Back/keyboard, timing, comprehension,
  cultural, faith, safeguarding, and accessibility evidence starts fresh for Feature 003.

## External Review and Evidence Gates

| Gate                                                                | Status at specification creation | Requirement to change status                                             |
| ------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------ |
| Feature 003 plan/tasks/cross-artifact quality                       | `NOT RUN`                        | Complete approved artifacts with no unresolved P0 conflict               |
| Automated implementation checks                                     | `NOT RUN`                        | Exact command, worktree state, and result                                |
| Physical Android Arabic/English journey                             | `BLOCKED`                        | Named build, device/OS, locales, observer, and results                   |
| Reduced motion, media, Back, keyboard, screen reader, and 200% font | `NOT RUN`                        | Direct named-build observations                                          |
| Five timed rehearsals and three-person comprehension                | `NOT RUN`                        | Recorded operators/observers, durations, answers, and date               |
| Fluent Arabic and UAE cultural review                               | `NOT RUN`                        | Named reviewer and reviewed content version                              |
| Faith-content review                                                | `NOT RUN`                        | Named qualified local reviewer and scope                                 |
| Child-safeguarding review                                           | `NOT RUN`                        | Named reviewer, findings, and disposition                                |
| Sustainability task/claim review                                    | `NOT RUN`                        | Named reviewer, reviewed task/claim version, and disposition             |
| Accessibility review                                                | `NOT RUN`                        | Named reviewer, named build/surface, settings, findings, and disposition |
| Optional live Parent refinement                                     | `BLOCKED` / validation `NOT RUN` | Approved secure boundary plus direct structured-result/fallback evidence |

No source inspection, web preview, Feature 002 pass, or artifact completion may change a native or
human gate to `PASSED`.

An evidence exercise remains `NOT RUN` until someone attempts it. If an attempt is made but a named
build, device, reviewer, secure boundary, or other required dependency is unavailable, record
`BLOCKED` with that dependency. Do not use `NOT RUN` to conceal an attempted blocked check.

## Out of Scope

- Any authored product route beyond the ten-route contract or a second application.
- Production accounts, authentication, guardian-consent systems, age assurance, multi-family
  tenancy, persistence guarantees, notifications, analytics, monitoring, or store deployment;
  deterministic synthetic access fixtures do not remove this boundary.
- Real Child names, profiles, photos, voice, free text, location, school, biometrics, or family
  stories; camera capture, ambient/background listening, or real media analysis.
- Unrestricted Child chat, AI companionship, therapy, diagnosis, developmental screening, emotion
  or personality inference, face/voice recognition, deception detection, religious rulings, or
  automated welfare decisions.
- Real social discovery, invitations, public profiles, public rankings, free messages, comments,
  reactions, direct Child contact, or cross-household task/media/reflection sharing. The domain-only
  League uses fixed synthetic invitees and allowlisted encouragement identifiers.
- Payment, purchase, transfer, custody, banking, gift cards, redeemable currency, universal
  Seed-to-money conversion, ads, random rewards, loot boxes, scarcity, debt, deductions, punitive
  streaks, or dying vegetation. Private Parent promise metadata does not implement any of these.
- Real-tree planting, verified carbon/water/waste/food claims, unsupported impact conversions, or
  AI food-safety decisions.
- Production legal-compliance claims, a broad backend, a 3D/VR garden, or architecture work that
  delays the deterministic competition path.
