# Tasks: Family Plus Capacity Preview

**Input**: Design documents from `/specs/007-family-plus-capacity/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

**Tests**: Required by the specification and repository validation contract. Write the focused
tests first and record the expected RED result before implementation.

**Organization**: Tasks are grouped by independently demonstrable user story. All writes remain
inside the file reservation recorded in `TEAM_OWNERSHIP.md`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it owns a different file and has no incomplete dependency.
- **[Story]**: Maps the task to a user story in `spec.md`.
- Every task names its exact file boundary.

## Phase 1: Setup and Truth Boundary

**Purpose**: Establish the approved plan before behavior changes.

- [x] T001 Record the approved preview-only architecture, pricing hypothesis, UI contract, and
      validation procedure in `specs/007-family-plus-capacity/plan.md`,
      `specs/007-family-plus-capacity/research.md`, `specs/007-family-plus-capacity/data-model.md`,
      `specs/007-family-plus-capacity/contracts/family-plus-preview-v1.md`, and
      `specs/007-family-plus-capacity/quickstart.md`
- [x] T002 Point the managed Spec Kit context at the Feature 007 plan in `AGENTS.md`
- [x] T003 Write the focused Family Plus contract, arithmetic, bilingual, Parent-only, and
      regression tests in `tests/family-plus-capacity.test.tsx`; run them and record the expected RED
      result before implementation

**Checkpoint**: Scope is approved and the missing behavior is observable through failing tests.

---

## Phase 2: Foundational Plan Model

**Purpose**: Create one immutable, non-authoritative source for capacity and price hypotheses.

- [x] T004 Implement the immutable Free/Plus catalog, fail-closed capacity decision, integer-fils
      saving helpers, and illustrative gross-billings arithmetic in `src/features/family-plan/index.ts`
- [x] T005 Run the pure plan-model assertions in `tests/family-plus-capacity.test.tsx` and verify
      exact AED 79.89 savings, 33% display savings, and AED 159,990.00 illustrative annual billings

**Checkpoint**: Commercial display values are exact, deterministic, and carry no billing or
entitlement authority.

---

## Phase 3: User Story 1 — Discover the Larger-Family Option (Priority: P1) 🎯 MVP

**Goal**: A verified Parent can discover a distinct 3–6-Child Ghaf Plus capacity option without
changing the working one/two-Child family draft.

**Independent Test**: Open Family Basics, preserve the selected one/two-Child value, open and close
the Plus preview, and confirm all draft fields remain unchanged.

- [x] T006 [P] [US1] Add equivalent Arabic and English family-capacity trigger, plan title, and
      dismissal resources in `src/i18n/resources.ts`
- [x] T007 [US1] Add the Parent-only Plus trigger and route-local open state without changing the
      existing selector or draft update path in `app/access/parent/family-basics.tsx`
- [x] T008 [US1] Verify trigger visibility, Parent authority, non-mutation, and unchanged
      one/two-Child acceptance through `tests/family-plus-capacity.test.tsx` and the focused onboarding
      regression suites

**Checkpoint**: Larger households are acknowledged at the correct Parent decision point while the
existing free journey remains executable.

---

## Phase 4: User Story 2 — Understand the Ethical Commercial Plan (Priority: P1)

**Goal**: A Parent or judge can understand the household-wide price hypothesis, free-core parity,
and child-safe monetization boundary in one compact preview.

**Independent Test**: Read the preview in both locales and verify both proposed prices, exact annual
saving, capacity comparison, no per-Child fee, ad-free parity, and no-purchase disclosure.

- [x] T009 [US2] Build the compact, scrollable, token-based Free/Plus comparison with formatted AED
      values and one return action in `src/components/access/FamilyPlusPreview.tsx`
- [x] T010 [US2] Complete the bilingual price-hypothesis, benefit-parity, child-facing-commercial
      exclusion, and prototype-truth resources in `src/i18n/resources.ts`
- [x] T011 [US2] Integrate `FamilyPlusPreview` into
      `app/access/parent/family-basics.tsx` without store, service, networking, analytics, or billing
      imports
- [x] T012 [US2] Verify the UI/source contract and Arabic/English resource parity in
      `tests/family-plus-capacity.test.tsx`

**Checkpoint**: The commercial story is specific and credible without claiming purchase or
profitability.

---

## Phase 5: User Story 3 — Keep the Competition Build Truthful and Reliable (Priority: P2)

**Goal**: The preview works offline, closes correctly, remains absent from Child surfaces, and does
not weaken the deterministic family journey.

**Independent Test**: Open/dismiss offline in Arabic and English, close with Android Back, inspect
Child routes, and finish the unchanged one/two-Child setup.

- [x] T013 [US3] Add modal semantics, accessibility focus, scrim/return dismissal, reduced-motion
      behavior, and 320dp scrolling resilience in `src/components/access/FamilyPlusPreview.tsx`
- [x] T014 [US3] Make Android Back close the preview before route navigation in
      `app/access/parent/family-basics.tsx`
- [x] T015 [US3] Verify zero Child-route commercial imports/copy, zero forbidden remote or billing
      authority, existing third-profile rejection, and reset compatibility in
      `tests/family-plus-capacity.test.tsx`

**Checkpoint**: The complete competition path remains deterministic and the prototype truth is
visible at the point of use.

---

## Phase 6: Commercial Case, Evidence, and Release Readiness

**Purpose**: Give judges a defensible business advantage without overstating evidence.

- [x] T016 [P] Document benchmarks, proposed pricing, exact gross-billings scenarios, excluded
      costs, ethical moat, production billing architecture, and judge wording in
      `docs/GHAF_PLUS_COMMERCIAL_CASE.md`
- [x] T017 [P] Reconcile product promise, visual contract, prototype limitations, and demo evidence
      in `PRODUCT.md`, `DESIGN.md`, `PROTOTYPE_LIMITATIONS.md`, and `DEMO_RUNBOOK.md`
- [x] T018 Inspect Arabic/English layouts at 320×720 and 390×844, including reduced motion and long
      content, and record the exact secondary web evidence in `DEMO_RUNBOOK.md`
- [x] T019 Run `npm run typecheck`, `npm run lint`, `npm run format:check`, the focused Vitest
      suites, `npm test`, and `git diff --check`; record exact outcomes in `DEMO_RUNBOOK.md`
- [x] T020 Re-read the post-design constitution gates, confirm actual 3–6 activation and billing
      remain blocked, mark completed tasks in `specs/007-family-plus-capacity/tasks.md`, and release the
      reservation in `TEAM_OWNERSHIP.md`

---

## Dependencies and Execution Order

- T001–T003 establish scope and the RED test boundary.
- T004–T005 block every price or capacity value rendered by the UI.
- T006–T008 deliver User Story 1 independently.
- T009–T012 deliver User Story 2 on top of the trigger and plan catalog.
- T013–T015 complete User Story 3 behavior and isolation.
- T016 and T017 can proceed in parallel after the UI truth contract is stable.
- T018–T020 require all implementation and documentation tasks to be complete.

## Implementation Strategy

1. Preserve the existing Free setup as the continuously executable baseline.
2. Drive the new boundary with one focused RED test file.
3. Add pure catalog/arithmetic behavior before rendering values.
4. Integrate one Parent-only trigger and one local preview without routes or persistence.
5. Validate bilingual compact layouts and full regressions.
6. Present commercial arithmetic as a hypothesis, never as proven demand, revenue, margin, or
   profit.
