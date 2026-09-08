# Tasks: Family Connection Planning

**Input**: Design documents from `/specs/008-family-connection-planning/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

**Tests**: Required by the feature specification and repository contract. Write focused behavior
tests first and record the expected RED result before implementation.

**Organization**: Tasks are grouped by independently demonstrable user story. All writes remain
inside the reservation recorded in `TEAM_OWNERSHIP.md`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it owns a different file and has no incomplete dependency.
- **[Story]**: Maps the task to a user story in `spec.md`.
- Every task names its exact file boundary.

## Phase 1: Setup and Approved Boundary

**Purpose**: Establish the feature authority before runtime behavior changes.

- [x] T001 Record requirements, research decisions, schema design, UI/privacy contract, and
      validation guide in `specs/008-family-connection-planning/`
- [x] T002 Run the configured agent-context hook so the managed block in `AGENTS.md` points to
      `specs/008-family-connection-planning/plan.md`
- [ ] T003 Create focused draft, schema, projection, privacy, bilingual, and UI source contracts in
      `tests/family-connections.test.tsx`; run the file and record the expected RED result

**Checkpoint**: The missing behavior is observable through focused failing tests.

---

## Phase 2: Foundational Family Directory and Migration

**Purpose**: Add one validated, private data authority before presenting any personalized idea.

- [ ] T004 Define immutable guardian, relative, rhythm, and plan-entry contracts in
      `src/models/familyConnections.ts`
- [ ] T005 [P] Extend onboarding draft/receipt types in `src/models/parentOnboarding.ts` and strict
      schema-3 storage constants/record types in `src/models/localFamily.ts`
- [ ] T006 Implement exact draft validation, bounded relative editing, trimming, and deep cloning in
      `src/features/access/parentOnboarding/policy.ts`
- [ ] T007 Carry the directory through view/receipt cloning, completion, and restoration in
      `src/features/access/parentOnboarding/controller.ts`
- [ ] T008 Implement schema-3 exact parsing plus v2/v1 migration and clone isolation in
      `src/features/local-family/schema.ts`
- [ ] T009 Update v3→v2→v1 read precedence, safe write-before-delete migration, and legacy-first/
      current-last clear behavior in `src/services/local/repository.ts` and exports in
      `src/services/local/index.ts`
- [ ] T010 Pass the validated directory into atomic family creation and add a Parent-authority-
      checked plan getter in `src/state/usePrototypeStore.ts`
- [ ] T011 Update existing constructor/receipt/migration fixtures in
      `tests/local-family-repository.test.ts`, `tests/parent-onboarding-controller.test.ts`,
      `tests/parent-onboarding-store.test.ts`, `tests/r003-local-family-onboarding.test.ts`,
      `tests/r003-store-access-flow.test.ts`, and `tests/device-remembered-access.test.tsx`; verify
      schema preservation and remembered access

**Checkpoint**: Valid minimized family data round-trips, migrates, restores, and resets without
changing access authority.

---

## Phase 3: User Story 1 — Describe the Family Without Oversharing (Priority: P1) 🎯 MVP

**Goal**: A Parent enters one required name and may add/edit/remove up to six optional relatives
before Child setup.

**Independent Test**: Complete setup with zero relatives and with multiple relatives; navigate Back,
switch locale, and verify exact private whole-family review.

- [ ] T012 [P] [US1] Add equivalent Arabic/English guardian, relative, relationship, rhythm,
      validation, privacy, and review resources in `src/i18n/resources.ts`
- [ ] T013 [US1] Build the progressive inline guardian/relative editor with actual radio semantics,
      Save/Cancel/Edit/Remove controls, compact summary rows, and 48dp targets in
      `src/components/access/FamilyPeopleEditor.tsx`
- [ ] T014 [US1] Integrate controlled family-person state, Back/Continue persistence, validation,
      and ordering before existing family fields in `app/access/parent/family-basics.tsx`
- [ ] T015 [US1] Present private guardian and optional relative groups before Child summaries in
      `app/access/parent/review-create.tsx`
- [ ] T016 [US1] Verify zero-relative skip, six-relative limit, partial-row recovery, mixed-script
      names, locale preservation, and review semantics in `tests/family-connections.test.tsx` and
      `tests/r003-screen-flow.test.ts`

**Checkpoint**: First-family setup collects only the Parent-selected minimum and reviews it clearly.

---

## Phase 4: User Story 2 — Receive a Calm Family-Connection Rhythm (Priority: P1)

**Goal**: Each explicitly configured relative produces one private, deterministic,
recognition-only Parent planning entry.

**Independent Test**: Create a grandmother and uncle with different rhythms and verify two stable,
relationship-appropriate entries with equal remote alternatives.

- [ ] T017 [US2] Implement fail-closed deterministic idea selection and immutable no-effects
      metadata in `src/features/family-connections/index.ts`
- [ ] T018 [US2] Build the stacked Arabic-friendly Parent-only connection-plan component with one
      section disclosure and no executable affordance in `src/components/family/FamilyConnectionPlan.tsx`
- [ ] T019 [US2] Render the authority-checked plan directly below the Parent Family hero in
      `app/parent/family/index.tsx`
- [ ] T020 [US2] Verify stable one-entry-per-relative derivation, zero-input omission, exact rhythm,
      sourced idea kinds, optionality, and no-effects metadata in
      `tests/family-connections.test.tsx`

**Checkpoint**: The family-bond concept is visible and personal without becoming a schedule,
assignment, proof, or reward.

---

## Phase 5: User Story 3 — Preserve Dignity, Privacy, and the Demo Path (Priority: P2)

**Goal**: Keep relative data Parent-private, preserve the sole executable recycling journey, and
remove the directory through exact reset.

**Independent Test**: Exercise signed-out/Child plan denial, inspect every shared/assistant/reward
boundary, complete recycling, restart offline, then reset.

- [ ] T021 [US3] Add source/behavior assertions for signed-out and Child plan denial, zero imports
      into Child/shared/assistant/reward modules, unchanged task-service P0 allowlist, no schedule/
      notification authority, and exact reset in `tests/family-connections.test.tsx`
- [ ] T022 [P] [US3] Reconcile the implemented family-bond promise and no-effects/privacy boundary in
      `PRODUCT.md`, `DESIGN.md`, and `PROTOTYPE_LIMITATIONS.md`
- [ ] T023 [US3] Run focused access, local-family, reset, task, League, Circle, reward, assistant,
      bilingual, and route regressions; fix only Feature 008 defects inside the reserved source files

**Checkpoint**: Feature 008 adds private planning value while every protected authority remains
unchanged.

---

## Phase 6: Evidence and Release Readiness

**Purpose**: Validate the judge-facing presentation and record evidence without overstating it.

- [ ] T024 Load the Impeccable craft-floor guidance immediately before UI edits and run its
      applicable mechanical detector after the final UI change
- [ ] T025 Inspect Arabic/English layouts at 320×720 and 390×844, including zero and six relatives,
      keyboard, long/mixed names, and reduced motion where available; record exact secondary web
      evidence in `DEMO_RUNBOOK.md`
- [ ] T026 Run `npm run typecheck`, `npm run lint`, `npm run format:check`, focused Vitest suites,
      `npm test`, and `git diff --check`; record exact outcomes in `DEMO_RUNBOOK.md`
- [ ] T027 Re-check the constitution and UI/privacy contract, mark completed tasks in
      `specs/008-family-connection-planning/tasks.md`, update the Feature 008 status in
      `TEAM_OWNERSHIP.md`, and keep physical Android plus named Arabic/UAE, cultural, safeguarding,
      privacy, accessibility, and visual review truthfully `NOT RUN` unless directly evidenced

---

## Dependencies and Execution Order

- T001–T003 establish scope and the RED test boundary.
- T004–T011 create the shared data/migration authority and block both user-facing stories.
- T012 can proceed beside foundational model work; T013–T016 depend on the validated draft types.
- T017 depends on the family-connection model; T018 depends on the projection; T019 depends on the
  authority-checked getter and presentation component.
- T021–T023 require both user-facing stories to be complete.
- T024 is required immediately before T013/T018 implementation and again as the mechanical finish
  gate; T025–T027 require all runtime work to be complete.

## Implementation Strategy

1. Write one focused RED suite for the family directory, plan projection, UI contract, and isolation.
2. Upgrade and migrate the local family record before rendering new private values.
3. Deliver the zero-relative setup path first, then progressive optional-relative editing/review.
4. Add the pure Parent-only plan projection and dedicated stacked presentation.
5. Prove no Child, task, assistant, shared, or progress authority changed.
6. Validate bilingual compact layouts, full regressions, exact reset, and evidence truth.
