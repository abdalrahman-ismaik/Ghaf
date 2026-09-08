# Tasks: Role Header Branding

**Input**: Design documents from `/specs/012-role-header-branding/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md,
contracts/role-header-branding.md, quickstart.md

**Tests**: Shared source and accessibility contracts are test-driven. Real compact-layout inspection
supports the automated contract; physical Android evidence is reported honestly.

## Phase 1: Setup

- [x] T001 Reserve the exact Feature 012 spec, component, and test files in TEAM_OWNERSHIP.md while
  preserving the concurrent Feature 011 reservation
- [x] T002 Audit released Parent/Child routes and identify the five shared header families covering
  dashboard/tab, ordinary flow, R002b nested, and journey-style screens

---

## Phase 2: Foundational

- [x] T003 Complete the specification, research, presentation model, composition contract, plan,
  and quickstart in specs/012-role-header-branding/
- [x] T004 Confirm the immutable official source and existing GhafRasterLogo decorative behavior in
  assets/brand/ghaf/ghaf-mark-full-color-1024.png and src/components/brand/GhafRasterLogo.tsx

**Checkpoint**: The scope is presentation-only, all released role-screen header families are
identified, and no asset, route, state, string, or package change is required.

---

## Phase 3: User Stories 1 and 2 - Brand primary and deeper role screens (Priority: P1) MVP

**Goal**: Apply one official decorative mark through every shared Parent and Child top-header
family while retaining the existing title and controls.

**Independent Test**: Source contracts prove all five header families use the approved component or
source and route inventory proves released role screens continue to consume those families.

### Tests

- [x] T005 [US1] [US2] Add failing official-source, shared-header coverage, no-route-duplication, and
  sole-heading accessibility contracts in tests/role-header-branding.test.tsx
- [x] T006 [US1] [US2] Run the focused test before implementation and record the expected missing
  composition failures in this file

  - RED evidence (2026-09-08): 2 tests passed and 3 failed because
    `GhafHeaderTitle.tsx` did not exist and the compact and journey header families did not yet
    render the official mark.

### Implementation

- [x] T007 [US1] [US2] Build the compact decorative logo/title composition in
  src/components/brand/GhafHeaderTitle.tsx and export it from src/components/brand/index.ts
- [x] T008 [US1] Apply the composition to ParentHomeHeader.tsx and ChildHomeHeader.tsx
- [x] T009 [US2] Apply the composition to R002aFlowHeader.tsx and R002bNestedScreen.tsx
- [x] T010 [US2] Add the same official decorative mark to the title area in
  src/components/journey.tsx without changing its actions or contextual copy

**Checkpoint**: Primary and deeper role screens inherit one official mark through shared chrome.

---

## Phase 4: User Story 3 - Bilingual compact-screen clarity (Priority: P2)

**Goal**: Verify Arabic-first direction, scaling, and control preservation.

- [x] T011 [US3] Extend the focused contract with logical ordering, shrink/wrap, unchanged asset
  checksum, and no one-line clamp assertions in tests/role-header-branding.test.tsx
- [x] T012 [US3] Run the Impeccable detector once against all changed UI components and resolve any
  in-scope finding

  - Detector evidence (2026-09-08): the one required post-implementation pass returned zero
    findings across the shared brand and five header-family components.
- [x] T013 [US3] Inspect representative Parent and Child dashboard and nested layouts in Arabic and
  English at compact widths through the real web app; record only directly observed evidence

  - Visual evidence (2026-09-08): Parent Home and Settings plus Child Today and Settings were
    inspected in the exported app at 320 × 720 and 390 × 844 across Arabic RTL and English LTR.
    The dashboard marks, logical order, sole heading announcement, Back/settings/help/profile
    controls, and bottom navigation remained clear. The first 320 px English Settings inspection
    exposed a mid-word title split; commit `10b9929` added responsive lockup wrapping, and the
    repeated inspection showed the complete title centered below the mark with no hidden control.

---

## Phase 5: Polish and Evidence

- [x] T014 Run the focused test, strict TypeScript, zero-warning lint, formatting, full tests, Git
  whitespace, dependency alignment, and static web/Android exports from quickstart.md
- [x] T015 Record RED/GREEN evidence, validation results, manual evidence, protected concurrent work,
  and final status in tasks.md and TEAM_OWNERSHIP.md

  - Final evidence (2026-09-08): focused branding/presentation checks passed 3 files / 17 tests;
    strict TypeScript, focused zero-warning ESLint, repository formatting, scoped Git whitespace,
    and the full 128-file / 1,391-test suite passed. Web export passed with 39 routes; Android
    export passed with 96 assets and contains the unchanged official mark. The official source
    checksum remains `28a09269c993d4aacbc40385102f9fa70d555d63b2319f238a5fce6cd277e7dc`.
  - The whole-tree lint command currently stops at `app/parent/index.tsx:446` in the separate,
    in-progress Feature 013 reservation (`react/no-children-prop`); every Feature 012 source and
    test file passes ESLint. Dependency alignment remains the documented pre-existing Expo patch
    gap: `expo` 57.0.20 expects 57.0.21 and `expo-router` 57.0.19 expects 57.0.20.
  - The static web proxy logged React hydration error 419 during initial document handoff but
    recovered and completed all inspected role flows. Physical Android, native screen reader, and
    200% system-text review remain `NOT RUN`; source contracts do not upgrade those gates.
  - `TEAM_OWNERSHIP.md` already records Feature 012 complete and physical Android `NOT RUN`. It was
    not edited again because the concurrent Feature 013 session owns that shared file. Its source,
    specification, configuration, and user-owned artifacts remain untouched by this evidence update.

## Dependencies and Execution Order

- T001–T004 establish ownership and the bounded design.
- T005–T006 must fail before T007–T010 implement the shared branding.
- T011 follows the shared component; T012 runs exactly once after UI edits are complete.
- T013 follows implementation and precedes final evidence.
- T014–T015 follow all implementation and inspection.

## Implementation Strategy

1. Lock the official-source, coverage, accessibility, and responsive contracts.
2. Observe the focused RED failure.
3. Build one compact composition and integrate shared headers only.
4. Validate representative Arabic/English compact layouts once.
5. Run repository-wide checks and preserve all concurrent/unrelated work.
