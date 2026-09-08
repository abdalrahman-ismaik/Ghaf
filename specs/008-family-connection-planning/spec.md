# Feature Specification: Family Connection Planning

**Feature Branch**: `008-family-connection-planning`

**Created**: 2026-09-08

**Status**: Approved for implementation

**Input**: User description: "In the family creation screen, collect the Parents' names first and
let a Parent optionally add grandparents, uncles, and aunts. If relatives are added, use them to
prepare periodic visit, help, and other family-connection task ideas grounded respectfully in
Emirati traditions."

## User Scenarios & Testing

### User Story 1 - Describe the family without oversharing (Priority: P1)

A Parent creating the one local Ghaf household enters their own display name before the Child
profiles. They may add another Parent or guardian and may optionally add selected grandparents,
aunts, or uncles using display names only. Family setup remains complete when every optional field
is skipped.

**Why this priority**: Ghaf needs a small, respectful family directory before it can prepare
meaningful kinship ideas, but optional relatives and data minimization protect families whose
structure, distance, loss, estrangement, or privacy needs differ.

**Independent Test**: Complete Family Basics once with only the required primary Parent/guardian
name and once with two guardians and multiple relatives; confirm both drafts reach Child setup and
review with only the entered people displayed.

**Acceptance Scenarios**:

1. **Given** a verified Parent starts first-family setup, **when** Family Basics opens, **then** the
   required primary Parent/guardian display-name field appears before household and Child-capacity
   information.
2. **Given** the Parent enters a valid primary display name and skips every optional person,
   **when** they continue, **then** setup proceeds without a warning or reduced experience.
3. **Given** the Parent adds another Parent/guardian and a relative, **when** they review the
   family, **then** the chosen display names and relationship labels appear privately in the
   whole-family review.
4. **Given** the Parent adds or removes optional relatives, **when** they navigate back and forward
   before creation, **then** the current draft remains intact and removed relatives do not reappear.

---

### User Story 2 - Receive a calm family-connection rhythm (Priority: P1)

For each relative the Parent explicitly adds, Ghaf prepares a small rotating set of private Roots
& Kinship ideas. The Parent chooses a gentle rhythm—weekly, monthly, every three months, or no
schedule—and can see suitable ideas such as a guardian-arranged visit or call, asking for a family
story, offering one small safe help, sharing a thank-you message, or spending a short phone-free
moment with a willing relative.

**Why this priority**: This is the feature's family-bond value. It turns optional family context
into concrete, respectful real-world actions without creating pressure, surveillance, or a second
reward system.

**Independent Test**: Create a family with one grandparent and one aunt/uncle on different rhythms,
open the Parent Family space, and verify that each person receives a deterministic, relationship-
appropriate, recognition-only idea and an equal call/message alternative.

**Acceptance Scenarios**:

1. **Given** a named grandparent is set to monthly, **when** the family is created, **then** Parent
   Family shows that display name, the monthly rhythm, and one prepared grandparent-appropriate
   connection idea.
2. **Given** a named aunt or uncle is set to every three months, **when** Parent Family opens,
   **then** the prepared idea uses only that selected relationship and display name.
3. **Given** the Parent chooses no schedule for a relative, **when** suggestions are derived,
   **then** the relative remains in the private directory and the idea is presented without a due,
   overdue, reminder, or missed state.
4. **Given** a visit is unsuitable because of distance, access, family context, or preference,
   **when** the Parent reads an idea, **then** an equal call or message route is visible and carries
   no reduced credit or negative wording.

---

### User Story 3 - Preserve dignity, privacy, and the proven demo path (Priority: P2)

A Parent or judge can understand that family-connection ideas are local prepared planning prompts,
not live AI decisions, calendar reminders, proof of contact, or reward-bearing Child assignments.
The existing Parent-approved recycling journey remains the sole executable P0 task.

**Why this priority**: Kinship cannot become a proxy for affection, obedience, religiosity, or
family quality, and private names must never leak into shared or assistant surfaces.

**Independent Test**: Inspect Parent setup, Parent Family, Child routes, shared projections, reset,
and an offline run; verify that relative names stay Parent-private, no connection idea changes any
progress authority, and the recycling journey behaves exactly as before.

**Acceptance Scenarios**:

1. **Given** family-connection information exists, **when** League, Circle, Child Today, Child
   League, assistant requests, or reward projections are inspected, **then** no guardian or
   relative name, relationship, rhythm, or idea is exposed.
2. **Given** a Parent views a connection idea, **when** they leave or ignore it, **then** no Seed,
   Garden growth, canopy, League score, Family Reward progress, streak, debt, or failure state is
   created.
3. **Given** the device is offline, **when** setup is completed and Parent Family is opened,
   **then** the saved directory and prepared suggestions remain available without a request.
4. **Given** the Parent performs the exact prototype reset, **when** the app returns to Arabic
   Welcome, **then** all added guardian and relative information is removed.

### Edge Cases

- Duplicate display names are allowed because two relatives may share a name; each entry retains
  its selected relationship independently.
- Empty, whitespace-only, control-character, overlong, or partially configured relative entries
  cannot be saved. A Parent may either complete or remove the affected optional row.
- At most six optional relatives may be stored; the add action becomes unavailable at the limit
  while every existing row remains editable and removable.
- Changing a relationship or rhythm immediately recalculates the local preview without changing
  another relative's entry.
- The feature never assumes a relative is alive, nearby, contactable, safe to visit, or willing to
  participate; only people the Parent adds receive ideas, and every idea remains optional.
- A selected weekly rhythm is descriptive, not a streak or deadline. No idea becomes overdue and a
  skipped period has no consequence.
- Arabic/English switching preserves typed display names without translating or mirroring them.
- Existing valid local-family data created before this feature remains usable with a generic
  primary Parent label, no added relatives, and no personalized connection idea.
- At 320dp and 200% text size, all configured people, remove controls, rhythm choices, review data,
  and Parent Family ideas remain readable and reachable by vertical scrolling.

## Requirements

### Functional Requirements

- **FR-001**: First-family setup MUST request the primary Parent or guardian display name before
  family name, application language, and Child capacity.
- **FR-002**: The primary Parent/guardian display name MUST be required, trimmed, between 2 and 40
  characters, and reject control characters.
- **FR-003**: Setup MUST offer one visibly optional additional Parent/guardian display name with the
  same validation boundary as the primary name.
- **FR-004**: Setup MUST allow zero to six optional relatives and MUST make clear that skipping them
  does not reduce the core Ghaf experience.
- **FR-005**: Each relative MUST contain exactly one Parent-entered display name, one relationship
  chosen from grandmother, grandfather, aunt, or uncle, and one rhythm chosen from weekly, monthly,
  every three months, or no schedule.
- **FR-006**: A Parent MUST be able to add, edit, and remove an optional relative before family
  creation without losing other setup values.
- **FR-007**: The feature MUST NOT request or store a relative's phone number, account identifier,
  address, location, birthday, health information, relationship notes, free-text family history,
  or reason for non-contact.
- **FR-008**: Family review MUST show the entered guardian names and each configured relative's
  display name, relationship, and rhythm before the Parent creates the family.
- **FR-009**: The local family directory MUST preserve the validated guardian and relative data
  across an ordinary app restart and return isolated copies to callers.
- **FR-010**: Existing valid family records MUST migrate safely with no relatives, no personalized
  ideas, and no change to Child profiles, pairing, access, tasks, or progress.
- **FR-011**: The exact Parent-authorized reset MUST remove every guardian and relative field with
  the rest of the device-local family directory.
- **FR-012**: The system MUST derive connection ideas only for relatives the Parent explicitly
  configured; it MUST NOT infer relatives from a family name, Child name, contact list, media,
  assistant content, or another household.
- **FR-013**: Each configured relative MUST produce a deterministic private planning entry with the
  selected rhythm and at least one relationship-appropriate prepared idea.
- **FR-014**: The prepared idea set MUST include a guardian-arranged visit/call route, a family-story
  route, a small safe-help route, a thank-you message route, or a short phone-free moment as
  appropriate to the selected relationship.
- **FR-015**: Any visit-oriented idea MUST visibly provide an equal call or message alternative and
  state or imply no loss of recognition for using it.
- **FR-016**: All connection ideas MUST be optional, Parent-reviewed, Child-choice-compatible,
  recognition-only, and use neutral observable actions rather than affection, closeness, virtue,
  obedience, or family-quality judgments.
- **FR-017**: A connection idea MUST create no Seed transaction, Garden or canopy growth, Circle
  event, Challenge Leaf, League score, Family Reward progress, badge, Impact Path progress, streak,
  deadline, penalty, or failure state.
- **FR-018**: A configured rhythm MUST be a planning label only. The prototype MUST add no calendar,
  notification, background job, due-date authority, overdue state, or proof-of-visit behavior.
- **FR-019**: Parent Family MUST show the private family-connection plan only to an authorized
  Parent and MUST state that it is a prepared local planning preview requiring Parent review.
- **FR-020**: Guardian/relative names, relationships, rhythms, and ideas MUST be excluded from Child
  routes, League, Circle, shared-growth projections, assistant requests, logs, analytics, and
  cross-household views.
- **FR-021**: The existing canonical recycling task MUST remain the sole executable P0 assignment;
  personalized kinship ideas MUST NOT bypass Task Builder, Parent review, assignment approval, or
  current task authority.
- **FR-022**: The idea catalog MUST use Modern Standard Arabic and equivalent plain English,
  present cultural behavior as family-selected options rather than one universal Emirati custom,
  and keep final public release subject to named UAE cultural and Arabic review.
- **FR-023**: All visit or help ideas MUST require a Parent to arrange any transport/contact and
  own unsafe, hot, breakable, electrical, sharp, chemical, medication, or outdoor-route actions.
- **FR-024**: Setup, review, and Parent Family MUST use Arabic-first logical RTL and equivalent LTR,
  preserve mixed-script display names, provide at least 48dp targets, and remain operable at 200%
  text size.
- **FR-025**: The entire feature MUST operate without network access, use no live contact, mapping,
  calendar, notification, or AI provider, and preserve the deterministic competition reset path.

### Key Entities

- **Family Guardian**: A private display-only representation of the primary Parent/guardian and an
  optional additional Parent/guardian. It is separate from synthetic access authority and carries
  no contact or identity-verification data.
- **Named Relative**: One optional private entry containing a local identifier, display name,
  relationship type, and Parent-selected planning rhythm.
- **Connection Rhythm**: A non-enforcing label—weekly, monthly, every three months, or no schedule—
  used to organize prepared ideas without dates, reminders, overdue states, or penalties.
- **Connection Idea**: A deterministic recognition-only Roots & Kinship planning prompt derived
  from one configured relative. It is not an assignment, completion record, proof of contact,
  reward event, or AI output.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A Parent can complete Family Basics with only the required display name and continue
  in under 45 seconds without interacting with any optional-relative control.
- **SC-002**: A Parent can add one named relative, choose a relationship and rhythm, and reach the
  whole-family review in under 90 seconds.
- **SC-003**: Every valid configured relative produces exactly one current deterministic planning
  entry in Parent Family, while zero configured relatives produce zero personalized entries.
- **SC-004**: Automated privacy inspection finds zero guardian/relative names, relationships,
  rhythms, or connection ideas in Child, League, Circle, shared-growth, assistant-request, or reward
  outputs.
- **SC-005**: Every connection entry visibly communicates its rhythm, optional nature, Parent-review
  boundary, recognition-only state, and equal remote alternative within one Parent Family scroll at
  320dp width.
- **SC-006**: Existing family data migrates with 100% preservation of family name, language, Parent
  identifier, Child profiles, and paired-Child markers; exact reset removes 100% of new fields.
- **SC-007**: The complete existing recycling task-to-recognition journey passes with no changed
  Seed, Garden, Circle, League, Family Reward, access, assistant, or reset outcome.

## Assumptions

- “Parents” is implemented inclusively as one required Parent/guardian display name and one
  optional additional Parent/guardian display name so single-guardian households are not blocked.
- Six optional relatives are sufficient for the competition MVP and keep the setup screen
  manageable; production relationship modeling is future work.
- Relationship types stay intentionally broad. Maternal/paternal branches, cousins, siblings,
  guardianship law, household membership, contact permissions, and family-tree inference are out of
  scope.
- The selected rhythm organizes a prepared plan but does not calculate a next date or trigger a
  reminder in this offline prototype.
- The existing sourced Roots & Kinship catalog is the content authority. The new small-help idea
  remains a prepared candidate requiring named cultural, Arabic, safeguarding, and accessibility
  review before a public release claim.
- Relationship ideas remain Parent-only planning previews because the approved P0 supports one
  executable recycling task. A later feature may promote reviewed ideas into full assignments
  without weakening Parent approval or recognition-only rules.
