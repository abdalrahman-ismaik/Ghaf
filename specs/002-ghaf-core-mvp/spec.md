# Feature Specification: Ghaf Core MVP

**Feature Branch**: `main`

**Created**: 2026-08-22

**Status**: APPROVED on 2026-08-22 for deterministic mock implementation

**Input**: Define the complete Ghaf competition-prototype journey from family input through a
parent-approved child adventure, completion confirmation, measured food-rescue impact, and visible
Ghaf-tree growth, with a deterministic offline demonstration fallback.

## MVP Prototype First

> Ghaf is an MVP Prototype for competition evaluation. It is designed to demonstrate the product concept, core interactions, AI value, cultural identity, visual quality, and sustainability impact. It is not intended to demonstrate production infrastructure, regulatory compliance, financial integration, large-scale security, or store-ready deployment.

Feature 002 authorizes implementation of the deterministic mock journey defined here. Live AI,
camera capture, audio recording, remote storage, and other optional-later capabilities remain
deferred until the prepared offline journey is reliable and separately approved.

## Prototype Capability Boundaries

| Boundary                                  | Capability                                                                                                                                                                                                                                                                                               |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Must be real in the prototype**         | Mobile navigation; the ten approved Parent and Child screens; Arabic and English presentation; RTL behavior; Parent mission review and approval; Child mission completion; Parent completion confirmation; impact updates; deterministic Ghaf growth animation; prototype role switching; and demo reset |
| **May initially be mocked**               | AI mission generation; voice transcription; image interpretation; evidence review; Parent notifications; data persistence; and authentication                                                                                                                                                            |
| **May later become real if time permits** | Live AI mission generation; remotely saved demo media; live voice transcription; camera capture; audio recording; and saved mission history                                                                                                                                                              |
| **Explicitly future work**                | Production authentication; production child accounts; production privacy controls; multiple families; schools; banking; real rewards; a marketplace; a social feed; store release; and a scalable backend                                                                                                |

Mock, seeded, simulated, and pregenerated behavior MUST be identified honestly in team guidance and
in the demo wherever a judge could otherwise reasonably understand it as live. Prepared media and
local interactions may provide the primary reliable demonstration path.

## Approved Demo Defaults

The team approved these implementation and rehearsal defaults on 2026-08-22:

| Decision               | Approved value                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| Scenario               | Synthetic extra-bread household food-waste situation                                      |
| Child                  | Salem, age range 8–10                                                                     |
| Prepared media         | Food image, family-wisdom clip, mission narration, and Child evidence image               |
| Estimated impact input | 250 g / 2 portions                                                                        |
| Available time         | 15 minutes                                                                                |
| Reward                 | Golden Ghaf Leaf, symbolic and nonfinancial                                               |
| Default language       | Arabic                                                                                    |
| Starting tree state    | Stage 2 — Sapling at 48%                                                                  |
| Completion award       | Deterministic +12 progress, crossing to stage 3 — Young tree                              |
| Demo milestone         | A new branch appears during the impact celebration                                        |
| Provider mode          | Mock-only primary path                                                                    |
| Deferred integrations  | Live AI, camera capture, audio recording, and remote storage                              |
| Android target         | The team's primary Android phone; exact model and OS are BLOCKED pending physical handoff |

Member 1 — Mobile and visual experience is the integration owner for this implementation work
period. Ownership and the approval record are maintained in `docs/TEAM_OWNERSHIP.md`.

## Approved Screen Scope

Feature 002 is limited to these ten judge-facing screens:

1. **Entry**: Ghaf identity, language selection, and entry into the prototype.
2. **Prototype role selector**: Parent or Child selection for a single-device demonstration; this
   is not production authentication.
3. **Parent home**: Current family Ghaf tree, active mission, rescued food, completed missions,
   create-mission action, and switch-to-Child action.
4. **Create mission**: Child, food-waste image, voice note, quantity or portions, available time,
   and optional reward inputs.
5. **AI generation experience**: A visible sequence that listens to family wisdom, understands the
   sustainability lesson, creates the adventure, and prepares the mission.
6. **Parent mission review**: Bilingual title, short story, three steps, impact target, evidence
   method, reward, approve action, and edit action.
7. **Child home**: Ghaf tree, new-adventure card, progress, and reward preview.
8. **Child mission**: Adventure story, three steps, progress, evidence or Parent-confirmation
   request, and one short reflection.
9. **Parent confirmation**: Child submission, Parent-confirmed quantity, approve-completion action,
   and request-retry action.
10. **Impact celebration**: Food rescued, mission completion, Ghaf growth, a new leaf or branch,
    and a family milestone or streak.

Loading, empty, validation, retry, and celebration states MUST remain states of these screens rather
than additional routes. Any proposed extra screen requires a specification update and team review.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Parent Creates and Approves a Mission (Priority: P1)

As a Parent or grandparent, I can combine a real household food-waste situation with family wisdom
and approve a personalized, age-appropriate adventure before the Child receives it.

**Why this priority**: This is where Ghaf's visible AI value and family-cultural identity become
clear; without it, the experience is only a generic sustainability task list.

**Independent Test**: Starting on Parent home with seeded profiles, select the Child, add a prepared
food image and prepared voice note, enter a quantity, time, and reward, generate the deterministic
mission, inspect its bilingual content, and approve it for the Child.

**Acceptance Scenarios**:

1. **Given** one seeded Child profile, prepared food image, and prepared family voice note, **When**
   the Parent completes the required mission inputs, **Then** generation can start and all supplied
   context remains available for review.
2. **Given** valid inputs, **When** generation begins, **Then** the Parent sees the four understandable
   progress stages in order and can tell that family input is being transformed into an adventure.
3. **Given** mock mode or an unavailable live provider, **When** generation completes, **Then** a
   clearly pregenerated mission matching the selected Child, food situation, approximate quantity,
   and available time is presented without blocking the demo.
4. **Given** a generated mission, **When** the Parent reviews it, **Then** the Arabic and English
   title, short story, exactly three steps, estimated impact target, evidence method, and reward are
   visible before approval.
5. **Given** a mission that needs adjustment, **When** the Parent chooses Edit, **Then** they can
   revise available inputs or mission content and return to review without assigning an unapproved
   version to the Child.
6. **Given** an acceptable mission, **When** the Parent approves it, **Then** that approved version
   becomes the Child's assigned adventure and its mocked or live origin remains truthfully labeled.

---

### User Story 2 - Child Completes the Adventure (Priority: P2)

As a Child, I can understand the approved adventure, complete its three simple steps, provide
evidence or request Parent confirmation, and answer a short reflection.

**Why this priority**: The Child experience turns the Parent's family knowledge into visible action
and is the heart of the product's behavior-change story.

**Independent Test**: Switch to Child view after assignment, open the new adventure, complete all
three steps, use seeded evidence or request Parent confirmation, answer the reflection, and submit.

**Acceptance Scenarios**:

1. **Given** a Parent-approved mission, **When** the Child opens Child home, **Then** the new adventure,
   current Ghaf progress, and reward preview are visible.
2. **Given** the Child opens the adventure, **When** its content loads, **Then** the story and three
   age-appropriate action steps are available in the selected language, with prepared narration
   available when included in the demo data.
3. **Given** an active adventure, **When** the Child completes steps, **Then** progress changes visibly
   and the mission cannot be submitted until all three steps are marked complete.
4. **Given** all steps are complete, **When** the Child supplies prepared evidence or requests Parent
   confirmation and answers the reflection, **Then** the mission can be submitted for Parent review.
5. **Given** the Child has submitted, **When** they revisit the mission, **Then** it is shown as awaiting
   Parent confirmation and does not award impact or Ghaf growth early.

---

### User Story 3 - Parent Confirms the Result (Priority: P3)

As a Parent, I can review the Child's submission, approve it or request a retry, and confirm the
estimated amount of food rescued.

**Why this priority**: Parent confirmation keeps the experience supervised and converts a completed
activity into an honest, measurable prototype outcome.

**Independent Test**: Open a seeded Child submission, inspect its step completion, evidence or
confirmation request, and reflection, then test both retry and approval outcomes.

**Acceptance Scenarios**:

1. **Given** a submitted mission, **When** the Parent opens confirmation, **Then** the mission summary,
   completed steps, evidence or confirmation request, and reflection are visible together.
2. **Given** the submission is incomplete or needs correction, **When** the Parent requests a retry,
   **Then** the mission returns to the Child with no impact, reward, or tree growth awarded.
3. **Given** an acceptable submission, **When** the Parent enters or confirms an estimated rescued
   quantity and approves completion, **Then** the mission is completed and one impact record is made.
4. **Given** an already approved completion, **When** approval is attempted again, **Then** totals,
   progress, and rewards are not counted twice.

---

### User Story 4 - Family Ghaf Tree Grows (Priority: P4)

As a family, we see our estimated food-rescue impact turn into visible Ghaf-tree growth and a warm
celebration, making sustainable action emotionally memorable.

**Why this priority**: The Ghaf tree is the product's central metaphor, progress mechanism, and
competition-demo climax rather than decorative branding.

**Independent Test**: Start from a known Ghaf stage, approve one seeded completion, and verify that
impact totals, progress, the tree visual, and a milestone or celebration update deterministically.

**Acceptance Scenarios**:

1. **Given** Parent approval records a completed mission, **When** the impact celebration appears,
   **Then** it shows the estimated food rescued, completion result, earned progress, and reward.
2. **Given** the earned progress crosses a configured milestone, **When** the celebration plays,
   **Then** the Ghaf tree visibly advances to the next of six named growth stages and reveals a new
   leaf, branch, bird, shade, family-memory card, or environmental detail appropriate to that stage.
3. **Given** progress does not cross a stage boundary, **When** completion is approved, **Then** the
   tree still responds visibly and shows a progress increase with a bounded celebration without
   claiming a new stage.
4. **Given** the tree has reached Full Ghaf tree, **When** more progress is awarded, **Then** impact and
   milestones can continue without adding an unapproved seventh tree stage.

---

### User Story 5 - Run the Complete Journey Offline (Priority: P5)

As the demo operator, I can reset and perform the complete Parent-to-Child-to-Ghaf-growth journey
with prepared media and deterministic content when internet access or an optional external service
is unavailable.

**Why this priority**: A competition demonstration must remain repeatable in an unfamiliar venue;
network failure cannot obscure the product concept.

**Independent Test**: Disable network access, reset the prototype, and complete entry, role
selection, mission creation, simulated generation, Parent approval, Child completion, Parent
confirmation, impact update, and Ghaf growth using only seeded content.

**Acceptance Scenarios**:

1. **Given** the device has no network access, **When** the operator follows the prepared journey,
   **Then** all ten approved screens and the complete mission lifecycle remain usable.
2. **Given** an optional external operation fails or times out, **When** fallback is activated,
   **Then** the current inputs are preserved and deterministic mock output completes the same flow.
3. **Given** any point in a rehearsal, **When** the operator activates demo reset, **Then** locale,
   role, mission lifecycle, evidence, impact, reward, and Ghaf progress return to the documented
   starting state.
4. **Given** the reset baseline, **When** the prepared journey is demonstrated without pauses for
   explanation, **Then** a judge can understand the full input-to-growth loop in approximately 90
   seconds.

### Edge Cases

- A missing prepared image or voice note offers the other approved prepared asset or an explicit
  retry state; it never silently submits unrelated content.
- Denied microphone or camera permission leaves the prepared-media path available and never starts
  recording without a visible microphone action.
- Generation interrupted by navigation, timeout, or loss of network preserves valid Parent inputs
  and offers deterministic mock generation without duplicating a mission.
- Zero, negative, nonnumeric, or implausibly large quantities are rejected with a clear correction
  prompt; a quantity may use either portions or an estimated weight, but not an unlabeled value.
- Changing Arabic or English during an in-progress mission preserves the mission lifecycle and
  presents available content in the newly selected language.
- Long Arabic labels, mixed Arabic and English text, numbers, units, back icons, and progress
  direction remain readable and do not hide primary actions.
- A Child cannot submit before all three steps and the reflection are complete; missing optional
  evidence can be replaced by a Parent-confirmation request.
- Parent retry never awards impact; repeated Parent approval never awards the same completion twice.
- Reset during an incomplete or completed mission discards the rehearsal state and restores the
  same documented seed values.
- If food condition is uncertain, the experience gives no safety verdict and directs the Parent to
  decide whether the activity is appropriate; missions never instruct a Child to consume food that
  may be unsafe.
- At the final tree stage, additional completions update impact and milestone details without
  inventing an additional tree stage.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: All active product copy MUST identify the application as Ghaf, غاف, or the technical
  identifier `ghaf`; prior product names MUST NOT appear.
- **FR-002**: Judge-facing guidance MUST identify Ghaf as an MVP Prototype and truthfully distinguish
  real, mocked, seeded, simulated, pregenerated, optional-later, and future capabilities.
- **FR-003**: The complete feature MUST use only the ten screens listed in Approved Screen Scope;
  validation, loading, errors, retries, and celebrations MUST be states of those screens.
- **FR-004**: Entry MUST show the Ghaf identity, allow Arabic or English selection, and provide a
  clear action to enter the prototype.
- **FR-005**: The prototype role selector MUST let the operator choose or switch between one seeded
  Parent and one seeded Child without presenting the shortcut as authentication.
- **FR-006**: Parent home MUST show the family Ghaf tree, active mission, estimated rescued food,
  completed missions, create-mission action, and switch-to-Child action.
- **FR-007**: Child home MUST show the same family Ghaf tree, assigned adventure, current progress,
  reward preview, and switch-to-Parent action.
- **FR-008**: The Parent MUST be able to select the seeded Child and see the Child's configured age
  range before requesting mission generation.
- **FR-009**: The Parent MUST be able to attach a prepared food-waste image; live camera capture MAY
  be added later without being required for the offline path.
- **FR-010**: The Parent MUST be able to select a prepared family voice note; any later live recording
  MUST begin only after a visible microphone action and MUST NOT continue in the background.
- **FR-011**: The Parent MUST be able to enter an approximate food quantity as a labeled weight or
  number of portions.
- **FR-012**: The Parent MUST be able to specify the available time and MAY specify a nonfinancial,
  prototype reward.
- **FR-013**: Mission generation MUST be blocked until the Child, image, voice note, and a valid
  quantity are supplied; optional time and reward omissions MUST have documented demo defaults.
- **FR-014**: Generation MUST visibly connect the selected family input and household food-waste
  situation to the resulting Child adventure.
- **FR-015**: The generation experience MUST present four ordered, human-readable stages: listening
  to family wisdom, understanding the sustainability lesson, creating the Child's adventure, and
  preparing the mission.
- **FR-016**: Mock mode MUST complete generation with deterministic pregenerated content and MUST
  label that content so it is not represented as a live model result.
- **FR-017**: Each generated mission MUST contain an Arabic and English title, a short story, exactly
  three action steps, an estimated impact target, an evidence method, one short reflection prompt,
  and an optional reward.
- **FR-018**: Mission content MUST reflect the selected Child's age range, the supplied family message,
  the food-waste situation, approximate quantity, and available time without claiming certainty
  about unverified image or audio meaning.
- **FR-019**: Parent review MUST show all mission content, including both language versions and the
  impact estimate, before the Child can receive it.
- **FR-020**: The Parent MUST be able to edit the draft and return to review without assigning the
  unapproved version.
- **FR-021**: Only an explicit Parent approval MUST move a reviewed mission into the Child's assigned
  adventures.
- **FR-022**: Child home MUST distinguish a newly assigned adventure from completed or
  awaiting-confirmation work.
- **FR-023**: The Child mission MUST present the approved story and exactly three simple steps in the
  selected language, with prepared narration when the demonstration fixture includes it.
- **FR-024**: The Child MUST be able to mark each step complete and see progress after every change.
- **FR-025**: Submission MUST remain unavailable until all three steps are complete.
- **FR-026**: After completing the steps, the Child MUST be able to attach prepared evidence or request
  direct Parent confirmation.
- **FR-027**: The Child MUST answer one short, age-appropriate reflection before submission.
- **FR-028**: Submitting MUST move the mission to awaiting Parent confirmation without changing impact,
  reward, or Ghaf growth.
- **FR-029**: The Child experience MUST NOT provide an unrestricted chatbot or food-safety verdict.
- **FR-030**: Parent confirmation MUST show the mission, completed steps, evidence or confirmation
  request, and Child reflection together.
- **FR-031**: The Parent MUST be able to approve completion or request a retry.
- **FR-032**: Before approval, the Parent MUST enter or confirm the estimated rescued amount with a
  visible unit.
- **FR-033**: A retry MUST return the mission to actionable Child work and MUST NOT award impact,
  progress, tree growth, or reward.
- **FR-034**: Approval MUST complete the mission exactly once, even if the action is repeated.
- **FR-035**: Each approved completion MUST create one estimated food-rescue impact record tied to
  the mission and the Parent-confirmed amount.
- **FR-036**: Parent home, Child home, and the impact celebration MUST present coherent rescued-food,
  completed-mission, and Ghaf-progress totals after approval.
- **FR-037**: Ghaf progress MUST use six deterministic stages: Seed, Germination, Sapling, Young tree,
  Branching tree, and Full Ghaf tree.
- **FR-038**: Completion MUST cause the Ghaf tree to respond visibly, update its progress, and show a
  bounded celebration; crossing a stage boundary MUST visibly reveal a new tree or environmental
  detail.
- **FR-039**: Progress beyond Full Ghaf tree MUST continue to update impact or milestones without
  creating an unapproved seventh tree stage.
- **FR-040**: Every approved screen and mission state MUST be available in Arabic and English.
- **FR-041**: Arabic MUST use visibly appropriate RTL order, text alignment, logical spacing,
  directional icons, and progress direction; English MUST use the corresponding LTR treatment.
- **FR-042**: Mixed-script content, long Arabic labels, numbers, quantity units, step order, and back
  actions MUST remain understandable in both language directions.
- **FR-043**: Mock mode MUST support the full journey without network access using prepared media,
  pregenerated mission content, seeded evidence, simulated processing, and local demo state.
- **FR-044**: A single reset action MUST restore Arabic, Parent role, an empty mission-creation draft,
  no pending Child submission, 1,250 rescued grams, 5 rescued portions, 3 completed missions, a
  2-day streak, and Ghaf stage 2 (Sapling at 48%); the pregenerated mission MUST remain available as
  the next generation fallback without already being assigned to the Child.
- **FR-045**: All profiles, media, reflections, and household scenarios MUST use synthetic or
  team-created demo information; no secret key or real Child data may be included.
- **FR-046**: Parent approval MUST remain required for mission assignment and completion, and the
  prototype MUST NOT claim that AI decides whether food is safe to eat.
- **FR-047**: Feature 002 MUST NOT introduce production authentication, production child accounts,
  multiple families, schools, banking, real rewards, marketplace, social feed, store release,
  scalable backend, enterprise security, or regulatory-compliance work.

### Approved Requirement Classification

This classification controls implementation order. **DEMO-CRITICAL** requirements form the
deterministic judge path or its minimum safeguards. **POLISH** requirements improve resilience or
presentation without blocking the happy-path demonstration. **DEFERRED** requirements are outside
the approved judging path and MUST NOT delay it.

| Requirement | Classification | Rationale                                                                                            |
| ----------- | -------------- | ---------------------------------------------------------------------------------------------------- |
| FR-001      | DEMO-CRITICAL  | Correct Ghaf identity is required on every judge-facing screen.                                      |
| FR-002      | DEMO-CRITICAL  | Honest prototype labels are a minimum safeguard.                                                     |
| FR-003      | DEMO-CRITICAL  | The ten-screen limit protects the approved demo scope.                                               |
| FR-004      | DEMO-CRITICAL  | Entry and language choice begin the rehearsed journey.                                               |
| FR-005      | DEMO-CRITICAL  | Single-device role switching replaces authentication in the demo.                                    |
| FR-006      | DEMO-CRITICAL  | Parent home is the start and status hub for the loop.                                                |
| FR-007      | DEMO-CRITICAL  | Child home exposes the assigned adventure and shared progress.                                       |
| FR-008      | DEMO-CRITICAL  | Salem's age range is required personalization context.                                               |
| FR-009      | DEMO-CRITICAL  | The prepared food image is required; the optional live-camera clause is deferred.                    |
| FR-010      | DEMO-CRITICAL  | The prepared family-wisdom clip is required; live recording is deferred.                             |
| FR-011      | DEMO-CRITICAL  | The 250 g / 2 portions estimate anchors measurable impact.                                           |
| FR-012      | DEMO-CRITICAL  | The 15-minute limit and Golden Ghaf Leaf complete the approved mission input.                        |
| FR-013      | DEMO-CRITICAL  | Required-field validation prevents a broken generation state.                                        |
| FR-014      | DEMO-CRITICAL  | Visible transformation of family input is Ghaf's AI value.                                           |
| FR-015      | DEMO-CRITICAL  | The four stages make simulated generation legible to judges.                                         |
| FR-016      | DEMO-CRITICAL  | Deterministic pregenerated output is the reliable primary provider.                                  |
| FR-017      | DEMO-CRITICAL  | The structured bilingual mission is the contract for the complete loop.                              |
| FR-018      | DEMO-CRITICAL  | Personalization connects Salem, family wisdom, bread, impact, and time.                              |
| FR-019      | DEMO-CRITICAL  | Full Parent review is required before assignment.                                                    |
| FR-020      | POLISH         | Edit-and-return is useful recovery but is not exercised in the 90-second happy path.                 |
| FR-021      | DEMO-CRITICAL  | Explicit Parent assignment approval is a core safeguard.                                             |
| FR-022      | POLISH         | Clear status distinctions improve comprehension without blocking assignment or completion.           |
| FR-023      | DEMO-CRITICAL  | The approved story, three steps, and prepared narration drive the Child experience.                  |
| FR-024      | DEMO-CRITICAL  | Visible three-step progress is the Child's primary interaction.                                      |
| FR-025      | DEMO-CRITICAL  | The completion gate prevents an invalid happy-path submission.                                       |
| FR-026      | DEMO-CRITICAL  | Prepared evidence or Parent confirmation enables offline submission.                                 |
| FR-027      | DEMO-CRITICAL  | The reflection completes the behavior-change story.                                                  |
| FR-028      | DEMO-CRITICAL  | Awaiting confirmation preserves the Parent approval gate and prevents early awards.                  |
| FR-029      | DEMO-CRITICAL  | No chatbot or food-safety verdict is a minimum safeguard.                                            |
| FR-030      | DEMO-CRITICAL  | Parent confirmation must show enough context for the final decision.                                 |
| FR-031      | DEMO-CRITICAL  | Approval completes the path; retry remains its bounded rejection state.                              |
| FR-032      | DEMO-CRITICAL  | Parent-confirmed impact supplies the displayed 250 g / 2 portions result.                            |
| FR-033      | POLISH         | Retry-without-award is important recovery behavior outside the rehearsed happy path.                 |
| FR-034      | POLISH         | Idempotency hardens repeated taps without changing the intended one-tap demo.                        |
| FR-035      | DEMO-CRITICAL  | One impact record turns completion into a measurable result.                                         |
| FR-036      | DEMO-CRITICAL  | Coherent totals connect confirmation to both homes and celebration.                                  |
| FR-037      | DEMO-CRITICAL  | The six-stage model is the deterministic progression contract.                                       |
| FR-038      | DEMO-CRITICAL  | The +12 stage crossing and new branch are the demo climax.                                           |
| FR-039      | DEFERRED       | Progress after Full Ghaf tree is outside the prepared stage-2-to-stage-3 judging path.               |
| FR-040      | DEMO-CRITICAL  | The complete approved flow must work in Arabic and English.                                          |
| FR-041      | DEMO-CRITICAL  | Correct Arabic RTL and English LTR are core product behavior.                                        |
| FR-042      | DEMO-CRITICAL  | Mixed-script, long-label, number/unit, and directional behavior must be tested from first implementation. |
| FR-043      | DEMO-CRITICAL  | A no-network mock journey is the primary reliability requirement.                                    |
| FR-044      | DEMO-CRITICAL  | Exact reset values make repeated rehearsals deterministic.                                           |
| FR-045      | DEMO-CRITICAL  | Synthetic data and secret exclusion are minimum safeguards.                                          |
| FR-046      | DEMO-CRITICAL  | Parent approval and no food-safety claim are non-negotiable boundaries.                              |
| FR-047      | DEMO-CRITICAL  | The exclusion list prevents production scope from displacing the MVP.                                |

### Key Entities

- **Family**: The single seeded household represented in the prototype; relates one Parent, one
  Child, shared impact totals, and one Ghaf progression.
- **Parent Profile**: A synthetic Parent or grandparent identity permitted to create and approve
  missions and confirm estimated impact.
- **Child Profile**: A synthetic Child identity with bilingual display name and age range; receives
  only Parent-approved missions.
- **Prototype Session**: The current locale, role, mock-mode status, active mission lifecycle, and
  reset baseline for one demonstration device.
- **Mission Input**: The selected Child, food-waste image, family voice note, estimated quantity and
  unit, available time, and optional reward supplied before generation.
- **Media Reference**: A prepared or later-captured image, audio clip, or evidence item with its
  source identified as seeded, prepared, or live.
- **Mission**: The bilingual title and story, three ordered steps, reflection prompt, impact target,
  evidence method, reward, origin label, assigned Child, and lifecycle status.
- **Mission Step**: One of exactly three ordered, age-appropriate actions with an incomplete or
  complete state.
- **Child Submission**: The completed-step state, evidence or Parent-confirmation request, reflection,
  and submission status awaiting Parent decision.
- **Parent Confirmation**: The Parent's approve-or-retry decision and the confirmed estimated food
  quantity and unit.
- **Impact Record**: A single estimated rescued-food outcome created only after Parent approval and
  tied to one completed mission.
- **Ghaf Progress**: The family's progress amount, one of six growth stages, completed-mission total,
  rescued-food totals, streak, and unlocked milestone detail.

### Mission Lifecycle

`Draft input → Generating → Parent review → Parent approved/Assigned → Child in progress → Awaiting
Parent confirmation → Completed`

Parent edit returns a mission from Parent review to Draft input. Parent retry returns it from
Awaiting Parent confirmation to Child in progress. Reset returns all Feature 002 changes to the
documented ready-to-create seeded baseline. No other transition may award impact or Ghaf progress.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Using the prepared demonstration path, an operator can show household situation,
  family voice note, mission generation, Parent approval, Child completion, Parent confirmation,
  impact, and Ghaf growth in 75–105 seconds in at least four of five rehearsals.
- **SC-002**: All ten approved screens are reachable in their intended sequence without a blocked
  action or runtime failure during five consecutive reset-and-rehearsal trials.
- **SC-003**: The complete prepared journey succeeds with network access disabled in five out of
  five trials, including simulated generation and impact celebration.
- **SC-004**: Arabic and English each support the full prepared journey; every approved screen shows
  the selected language and visibly correct direction in a manual review.
- **SC-005**: In Arabic review, all long labels, mixed-script content, numbers, units, directional
  icons, progress indicators, and primary actions remain visible and understandable on the primary
  demo device.
- **SC-006**: A Parent can provide the required prepared inputs and reach the mission review in no
  more than 45 seconds during a rehearsed flow.
- **SC-007**: Every mission shown to the Child has explicit Parent approval, exactly three steps, one
  reflection, an impact target, and an evidence or Parent-confirmation method.
- **SC-008**: A Child submission changes zero impact, reward, or tree progress until Parent approval,
  and a retry changes zero totals in all tested cases.
- **SC-009**: One Parent approval adds exactly one completed mission and one estimated impact record;
  five repeated approval attempts produce no duplicate increase.
- **SC-010**: Within three seconds of Parent completion approval on the prepared path, the operator
  sees updated rescued-food impact, Ghaf progress, and a celebration or growth change.
- **SC-011**: All six named Ghaf stages can be demonstrated deterministically, and a seeded completion
  can visibly move the tree to its next configured milestone.
- **SC-012**: Reset restores the documented Arabic-first baseline values exactly in five consecutive
  trials, whether invoked from Parent, Child, generation, confirmation, or celebration state.
- **SC-013**: In a review with three people unfamiliar with the detailed design, all three can identify
  the family input, Parent approval gate, Child action, estimated food-rescue result, and tree growth
  after watching the prepared demonstration once.
- **SC-014**: A review of every AI, media, evidence, and persistence step finds a visible or documented
  classification as real, mocked, seeded, simulated, pregenerated, optional-later, or future.
- **SC-015**: The implemented scope, when approved, contains zero screens beyond the approved ten and
  zero production authentication, banking, marketplace, social-feed, or scalable-backend features.

## Assumptions

- Feature 001 is complete and provides the bilingual shell, role switching, deterministic mock
  services, shared design language, Ghaf visual, and reset foundation before Feature 002 begins.
- The competition path uses one synthetic family, one Parent profile, and one Child profile on one
  primary Android demonstration device.
- Arabic is the default locale; the same approved journey remains available in English.
- The rehearsed 90-second path uses a prepared image, prepared family voice clip, prepared mission
  narration, pregenerated mission, seeded evidence, and simulated processing so permission prompts
  and network timing do not affect the judge demonstration.
- Food-rescue quantities are Parent-entered estimates for prototype storytelling, not measurements
  produced by computer vision or a food-safety system.
- Rewards are symbolic or family-defined and have no monetary, banking, or redeemable value.
- A small curated mission library is sufficient for the prototype; an optional live AI provider may
  later produce the same mission fields but is not required for completion.
- Persistence may remain local or simulated. Losing rehearsal changes after a reset is intentional.
- Parent notifications are represented by role switching or seeded state rather than a production
  notification service.
- Live camera capture, audio recording, transcription, cloud storage, and mission history are
  optional-later items, not acceptance dependencies.
- Native package and bundle identifiers remain provisional.

## Dependencies

- The implemented and validated Feature 001 foundation.
- Team-created synthetic food image, family voice clip, mission narration, evidence, bilingual
  mission copy, and reset fixture approved for public competition use.
- Human review of Arabic terminology, RTL presentation, and age-appropriate mission content.
- Team review and explicit approval of the Feature 002 technical plan before implementation starts.

## Out of Scope

- Any screen or journey outside the ten listed in Approved Screen Scope.
- Production registration, authentication, child accounts, password flows, permissions systems,
  multi-family tenancy, school administration, or production privacy controls.
- Financial integration, banking, cards, real rewards, marketplace, social feed, or monetization.
- Production backend, scalable infrastructure, enterprise data policies, observability program,
  compliance program, security workstream, incident response, or store deployment.
- Autonomous food-safety decisions, accurate image-based food-weight measurement, continuous or
  background audio recording, or an unrestricted Child chatbot.
- A second application, web administration application, monorepo, native-only application, 3D tree,
  3D game, or VR experience.
