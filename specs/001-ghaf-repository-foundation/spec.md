# Feature Specification: Ghaf Repository Foundation

**Feature Branch**: `main`

**Created**: 2026-08-22

**Status**: Implemented and code-converged; physical Android validation pending

**Input**: Establish the smallest polished, bilingual mobile foundation for the Ghaf competition prototype without implementing the full mission journey.

## MVP Prototype First

> Ghaf is an MVP Prototype for competition evaluation. It is designed to demonstrate the product concept, core interactions, AI value, cultural identity, visual quality, and sustainability impact. It is not intended to demonstrate production infrastructure, regulatory compliance, financial integration, large-scale security, or store-ready deployment.

Feature 001 is deliberately limited to the repository and application shell. The complete mission-creation and completion journey belongs to Feature 002.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Launch the Ghaf Foundation (Priority: P1)

As a team member, I can install dependencies and launch a recognizable Ghaf mobile shell so the team has one dependable starting point for the competition prototype.

**Why this priority**: No later demo work can proceed reliably until every member can run the same typed application foundation.

**Independent Test**: Starting from a clean checkout, install dependencies, start the application, and reach the Ghaf entry screen without a runtime error.

**Acceptance Scenarios**:

1. **Given** a clean checkout with supported tooling, **When** a team member follows the quickstart, **Then** the mobile application starts and displays the Ghaf name in English and Arabic.
2. **Given** the application is running, **When** the user enters the prototype, **Then** basic navigation reaches the prototype role selector.
3. **Given** source validation is run, **When** the type and lint checks finish, **Then** both complete without errors.

---

### User Story 2 - Use Arabic or English (Priority: P2)

As a demo operator, I can select Arabic or English and see a visibly appropriate layout direction so the prototype can be presented naturally in either language.

**Why this priority**: Arabic-first identity is central to the product and cannot be postponed until after screens are built.

**Independent Test**: Select each language in turn and verify translated shell copy, text alignment, logical spacing, and directional cues on the same device.

**Acceptance Scenarios**:

1. **Given** the entry screen, **When** Arabic is selected, **Then** Arabic copy is shown and the interface visibly uses right-to-left direction.
2. **Given** Arabic is active, **When** English is selected, **Then** English copy is shown and the interface visibly returns to left-to-right direction.
3. **Given** either locale, **When** the user opens parent and child routes, **Then** shared shell components follow the selected locale and direction.

---

### User Story 3 - Switch Prototype Roles (Priority: P3)

As a demo operator, I can switch between one seeded parent and one seeded child, see a mock mission, and view a staged Ghaf tree so the core product metaphor is immediately understandable.

**Why this priority**: Role switching makes one-device demonstration practical, while the mission card and Ghaf visual establish the product concept without implementing Feature 002.

**Independent Test**: Enter parent view, switch to child view, and return to parent view while the same seeded mission and tree stage remain coherent.

**Acceptance Scenarios**:

1. **Given** the role selector, **When** Parent is selected, **Then** the parent route displays a Ghaf tree, impact summary, mock mission, and switch-role action.
2. **Given** the parent route, **When** the role is changed to Child, **Then** the child route displays the same family tree and an age-appropriate mock adventure card.
3. **Given** the seeded session has changed, **When** the demo reset is activated, **Then** locale, role, mission, impact, and tree stage return to documented starting values.

---

### User Story 4 - Collaborate Without Scope Drift (Priority: P4)

As one of three contributors, I can find current specifications, ownership, prototype boundaries, agent roles, and everyday commands so I can make a small change without inventing production infrastructure or overlapping another member's work.

**Why this priority**: A clear repository reduces integration friction during a short competition build.

**Independent Test**: A new contributor can identify the active feature, their provisional area, setup commands, mock boundaries, and demo reset instructions using only repository documentation.

**Acceptance Scenarios**:

1. **Given** the repository root, **When** a contributor reads the primary guidance, **Then** MVP Prototype First, team ownership, validation commands, and prohibited scope are explicit.
2. **Given** a Codex session in the trusted project, **When** a contributor inspects available project assets, **Then** official Spec Kit skills and five focused Ghaf agent definitions are discoverable.

### Edge Cases

- A missing or malformed stored locale falls back to Arabic without blocking launch.
- A platform that cannot apply global direction immediately still shows correct per-screen alignment and explains that a reload may be needed for native direction changes.
- A missing optional prepared media asset does not block the shell; mock mission text remains usable.
- Repeated role changes do not create duplicate missions or lose the seeded Ghaf stage.
- Reset invoked from either role returns to the same deterministic Arabic-first starting state.
- Long Arabic labels and mixed Arabic/English mission content wrap without hiding primary actions.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The repository MUST identify the product only as Ghaf, غاف, or the technical identifier `ghaf`; legacy product names MUST NOT appear in active project content.
- **FR-002**: The foundation MUST open on a branded entry screen that offers Arabic and English.
- **FR-003**: The foundation MUST provide basic navigation among entry, role selector, parent, and child routes.
- **FR-004**: Users MUST be able to switch between one seeded parent role and one seeded child role without authentication.
- **FR-005**: Arabic selection MUST produce visibly right-to-left content alignment, ordering, and directional treatment; English MUST produce left-to-right treatment.
- **FR-006**: Shared user-facing shell copy MUST be available in Arabic and English.
- **FR-007**: Parent and child views MUST display the same deterministic mock mission through a replaceable service boundary.
- **FR-008**: The foundation MUST display a reusable Ghaf tree visual with six addressable stages: Seed, Germination, Sapling, Young tree, Branching tree, and Full Ghaf tree.
- **FR-009**: The initial shell MUST use a small shared token set for color, spacing, typography, radii, and motion.
- **FR-010**: The foundation MUST provide reusable primitives for screens, text, buttons, cards, role switching, mission summary, impact summary, progress, tree, loading, empty, error, and celebration states; Feature 001 MAY keep nonessential primitives minimal.
- **FR-011**: The mock service layer MUST expose clear mission, media, AI, impact, and prototype-session contracts with deterministic local implementations.
- **FR-012**: The prototype MUST provide a one-action reset to an Arabic-first, parent-role, seeded-mission starting state.
- **FR-013**: `README.md`, root `AGENTS.md`, the constitution, this product specification, the technical plan, and the repository-status section of `docs/PROTOTYPE_LIMITATIONS.md` MUST reproduce the required MVP Prototype First clarification verbatim; repository guidance and judge-facing prototype surfaces MUST also identify real, mocked, seeded, pregenerated, optional-later, and future behavior where relevant.
- **FR-014**: Repository guidance MUST define provisional ownership for mobile/visual, AI/application logic, and product/content/QA work; Member 1 is the bootstrap-period integration owner until the team records a handoff.
- **FR-015**: Five project-scoped Ghaf Codex agents MUST be available with non-overlapping purposes and explicit write scopes; project guidance MUST cap concurrent agents at four and prohibit simultaneous edits to the same files.
- **FR-016**: Basic developer commands MUST cover application start, lint, type checking, focused tests, and formatting validation.
- **FR-017**: The foundation MUST NOT include production authentication, a remote database, payment or banking features, production analytics, deployment automation, or Feature 002 mission-creation screens.
- **FR-018**: No secret key or real child data may be committed; any environment example MUST contain placeholders only.
- **FR-019**: Audio recording MUST NOT run continuously or in the background; Feature 001 MUST NOT claim food-safety determination.
- **FR-020**: Android MUST be documented as the primary physical demo platform; iOS compatibility and web development are secondary.

### Key Entities

- **Prototype Session**: Current locale, active role, seeded family, impact summary, tree stage, and reset state for the single-device demo.
- **Locale Choice**: Arabic or English selection and its associated display direction.
- **Prototype Role**: The seeded Parent or Child perspective used in place of authentication.
- **Mission Summary**: One seeded adventure with bilingual title, short story, three steps, status, reward, and impact target.
- **Ghaf Progress**: A deterministic stage from zero through five plus the associated completed-mission and food-rescue totals.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A team member can install dependencies and reach the branded entry screen from a clean checkout in no more than 10 minutes, excluding dependency-download time.
- **SC-002**: All four foundation routes—entry, role selector, parent, and child—are reachable without a runtime error.
- **SC-003**: Arabic and English can each be selected in no more than two taps, and the visible direction changes on every foundation route.
- **SC-004**: A demo operator can switch Parent → Child → Parent in no more than 15 seconds while retaining one coherent mock mission.
- **SC-005**: Reset restores Arabic, Parent, assigned mission, 1,250 rescued grams, 5 rescued portions, 3 completed missions, 2 streak days, and Ghaf stage 2 (Sapling at 48%) every time across five consecutive trials.
- **SC-006**: The Ghaf visual can display all six named stages through an isolated component preview or supported component property.
- **SC-007**: Type checking, linting, formatting validation, and the focused foundation test set all pass from documented commands.
- **SC-008**: A repository text scan finds zero legacy product-name references in active content and zero committed secret values.
- **SC-009**: A new contributor can identify their provisional ownership and the active Spec Kit artifacts in under five minutes.
- **SC-010**: Feature 001 adds zero production backend services and zero screens beyond the approved foundation routes.
- **SC-011**: Entry, language selection, Parent → Child → Parent switching, mock mission display, and reset complete successfully with device network access disabled.

## Assumptions

- The repository begins empty except for the official Spec Kit scaffold created during bootstrap.
- One Android device will be used for the primary competition demonstration.
- Arabic is the default locale and Parent is the initial prototype role.
- The reset state uses one assigned pregenerated mission, 1,250 rescued grams, 5 rescued portions, 3 completed missions, 2 streak days, and Ghaf stage 2 (Sapling at 48%).
- The seeded mission uses synthetic family names and team-created content.
- Mock services and local state are sufficient for Feature 001; optional persistence can be evaluated in Feature 002.
- The approved technical plan will use the project-mandated Expo, TypeScript, and file-based navigation foundation.
- Exact mobile package and bundle identifiers remain provisional and MUST be labeled as such.

## Out of Scope

- Mission creation, recording, image capture, AI generation, mission review, evidence upload, parent confirmation, and impact celebration screens.
- Production accounts, authentication, authorization, storage, backend, notifications, payments, analytics, security programs, compliance work, release signing, and store deployment.
- Any second application, web administration surface, 3D tree, game, VR experience, social feed, school feature, or unrestricted chatbot.
