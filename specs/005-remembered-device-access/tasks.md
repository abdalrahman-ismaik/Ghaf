# Tasks: Remembered Device Access

**Input**: Design documents from `/specs/005-remembered-device-access/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/device-access-v1.md`

**Tests**: Required by SC-004 and the repository TDD contract. Each behavior group begins RED.

## Phase 1: Setup and ownership

- [x] T001 Reserve exact planning/runtime files in `TEAM_OWNERSHIP.md`
- [x] T002 Create Feature 005 specification, checklist, plan, research, data model, contract, and
  quickstart in `specs/005-remembered-device-access/`
- [x] T003 Update `.specify/feature.json` and run the configured agent-context hook for `AGENTS.md`

---

## Phase 2: Foundational persistent boundary

**Purpose**: Establish a non-authorizing, strict, independently testable affinity record.

- [x] T004 [US1] Write failing repository/schema tests for exact Parent/Child records, absent data,
  unknown keys/version, malformed JSON, timestamp validation, mismatched Child pairing, storage
  failures, clone isolation, targeted Child clearing, and full clear in
  `tests/device-remembered-access.test.tsx`
- [x] T005 [US1] Add strict types/constants in `src/models/deviceAccess.ts` and parser/policy in
  `src/features/access/rememberedDeviceAccess.ts`
- [x] T006 [US1] Implement `src/services/local/deviceAccessRepository.ts`, export through
  `src/services/local/index.ts`, and register through `src/services/index.ts`
- [x] T007 Run the focused repository/schema tests GREEN and refactor without broadening stored data

**Checkpoint**: One validated principal can be stored; it cannot authorize a route.

---

## Phase 3: User Story 1 - Parent remembered access (Priority: P1)

**Goal**: Explicit Parent opt-in restores a fresh local Parent authority after restart; logout
reliably removes the preference.

**Independent Test**: Remember Parent, run startup policy with fresh controllers, verify Parent
authority; clear on logout and prove a second startup remains signed out.

- [x] T008 [US1] Write failing controller/bootstrap/store tests for Parent opt-in, opt-out, fresh
  authority, mismatch denial, write failure, and clear-before-logout failure behavior in
  `tests/device-remembered-access.test.tsx`
- [x] T009 [US1] Add fresh remembered-Parent resume to
  `src/features/access/parentOnboarding/controller.ts`
- [x] T010 [US1] Integrate affinity view, Parent preference, synchronous bootstrap, successful-entry
  persistence, and explicit logout clearing in `src/state/usePrototypeStore.ts`
- [x] T011 [US1] Run Parent-focused tests GREEN and existing Parent/access suites for regression

**Checkpoint**: Parent remembrance is optional, fresh, local, and removable.

---

## Phase 4: User Story 2 - Child device continuity (Priority: P1)

**Goal**: Completed pairing makes one Child primary on that installation and restart restores that
same eligible Child without credential entry.

**Independent Test**: Pair Salem, run startup policy with fresh controllers, then revoke/reset and
prove restore is denied.

- [x] T012 [US2] Write failing controller/bootstrap/store tests for automatic Child affinity,
  restart resume, Parent replacement, configured-profile binding, revocation, reset, and invalid
  marker denial in `tests/device-remembered-access.test.tsx`
- [x] T013 [US2] Add paired Child resume to `src/features/access/childAccess.ts`
- [x] T014 [US2] Integrate Child affinity on completed pairing plus matching revocation/reset
  clearing in `src/state/usePrototypeStore.ts`
- [x] T015 [US2] Run Child-focused tests GREEN and existing Child/access/reset suites for regression

**Checkpoint**: A valid paired Child resumes; revoked/reset/mismatched Children never do.

---

## Phase 5: User Story 3 - Safe shared-device handoff (Priority: P1)

**Goal**: Child starts temporary Parent access without unpairing; Parent logout returns to the same
eligible Child, with no simultaneous authority.

**Independent Test**: Salem → Parent access → Parent verification → Parent logout → Salem, plus
cancel/revoke/error branches.

- [x] T016 [US3] Write failing store and source-presentation tests for authority ordering,
  temporary context, cancel, Parent logout return, revoke denial, and protected active-Parent Child
  entry in `tests/device-remembered-access.test.tsx`
- [x] T017 [US3] Implement begin/cancel/resume temporary Parent access actions and sequential
  authority transitions in `src/state/usePrototypeStore.ts`
- [x] T018 [US3] Replace Child-to-Parent generic logout calls with the dedicated handoff in
  `app/child/index.tsx`, `app/child/settings.tsx`, `app/child/task.tsx`, `app/garden.tsx`, and
  `app/circle.tsx`; preserve explicit Parent logout
- [x] T019 [US3] Run handoff tests GREEN and existing route/access tests for regression

**Checkpoint**: Shared-device use is asymmetric, explicit, and mutually exclusive.

---

## Phase 6: Bilingual accessible presentation

- [x] T020 [US1] Write failing source/component tests for unchecked Parent choice, accessible
  checkbox semantics, temporary Child-device notice, and Arabic/English parity in
  `tests/device-remembered-access.test.tsx`
- [x] T021 [US1] Build `src/components/access/RememberDeviceChoice.tsx`, export it, and integrate it
  in `app/access/parent/verification.tsx`
- [x] T022 [US3] Make Parent sign-in cancellation return to the remembered Child in
  `app/access/parent/sign-in.tsx`; update Child actions and additive bilingual copy in
  `src/i18n/resources.ts`
- [x] T023 Run the focused UI/source tests GREEN, then run the Impeccable detector once across only
  the changed UI targets

---

## Phase 7: Truthful evidence and release checks

- [x] T024 Update `PRODUCT.md`, `PROTOTYPE_LIMITATIONS.md`, and `DEMO_RUNBOOK.md` with exact local
  behavior, separate-device limitation, fixtures, evidence, and native/human gaps
- [x] T025 Run `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`, and
  `git diff --check`; inspect scoped secret/session-token absence
- [x] T026 Update this task list and `TEAM_OWNERSHIP.md` with exact results, changed files, known
  gaps, and integration readiness; commit cohesive completed slices without including protected
  unrelated worktree edits

## Dependencies and execution order

- T004–T007 block all runtime stories.
- Parent resume (T008–T011) and Child resume (T012–T015) depend on the same foundation and are
  implemented sequentially because both touch controller/store boundaries.
- Shared-device handoff depends on both resume paths.
- Presentation follows stable behavior so copy reflects actual transitions.
- Documentation and full checks follow all implemented stories.

## MVP delivery

All three P1 stories form the minimum coherent slice: Parent convenience alone would not satisfy
the user's normal separate-device or shared-device rules. No optional breadth is included.

## Post-merge audit and remediation — 2026-09-08

- [x] T027 Add RED regression coverage for family-marker and Child-affinity write failures, stale
  affinity during opt-out family entry, missing affinity during temporary Parent return/cancel,
  controller revocation failure, repository read exceptions and clone isolation, and remembered
  locale selection in `tests/device-remembered-access.test.tsx`
- [x] T028 Make pairing persistence transactional before Child activation; refresh persistent
  handoff authority; reconcile durable revocation; clear stale affinity before opt-out entry; and
  restore the configured family language in `src/state/usePrototypeStore.ts`,
  `src/features/access/childAccess.ts`, and `src/features/access/rememberedDeviceAccess.ts`
- [x] T029 Re-run the configured context hook and implementation prerequisites, then validate 33
  focused Feature 005 tests, 184 surrounding access/reset tests, and `npm run verify` at 122 files /
  1,486 tests plus the 39-route web export; retain native process-death, SQLite, Back, TalkBack,
  font-scale, and named human review as `NOT RUN`
