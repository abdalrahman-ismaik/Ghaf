# Tasks: Verified Family Replacement

**Input**: Design documents from `specs/011-verified-family-replacement/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/family-replacement-state.md`, `quickstart.md`

**Tests**: TDD is required for every behavior slice. Run the new focused test RED before changing
runtime source, then GREEN before continuing.

## Phase 1: Setup and contract

**Purpose**: Establish the approved one-household replacement boundary before runtime work.

- [x] T001 Record the approved specification, research, state model, contract, validation guide,
      quality checklist, and file reservation in `specs/011-verified-family-replacement/**`,
      `.specify/feature.json`, `AGENTS.md`, and `TEAM_OWNERSHIP.md`
- [x] T002 Commit the validated Feature 011 planning slice without staging `.codex/config.toml`,
      generated outputs, source design packs, or unrelated assets

---

## Phase 2: Foundational RED contracts

**Purpose**: Prove the missing entry and unsafe-transition gaps before implementation.

- [x] T003 Write RED source/store tests for always-visible entry, separate replacement intent,
      wrong-code/cancel preservation, verified draft staging, failed-save recovery, final reset, and
      returning sign-in isolation in `tests/family-replacement-flow.test.ts`
- [x] T004 Write RED controller tests for reversible receipt/draft backup, guarded staging,
      cancellation restoration, reset cleanup, and successful backup disposal in
      `tests/parent-onboarding-controller.test.ts`
- [x] T005 Run both Feature 011 tests alone, confirm failures correspond to missing behavior, and
      record the RED command/result in `specs/011-verified-family-replacement/quickstart.md`

**Checkpoint**: Missing behavior is captured without changing runtime code.

---

## Phase 3: User Story 1 - Always-visible new-family entry (Priority: P1)

**Goal**: Keep the action visible and present an informed one-device replacement entry state.

**Independent Test**: With and without an existing local family, open Parent sign-in and reach the
correct identifier screen without requesting verification or changing the saved family.

- [x] T006 [US1] Remove the completion-receipt visibility gate while preserving action hierarchy,
      busy state, offline query, and 48dp behavior in `app/access/parent/sign-in.tsx`
- [x] T007 [US1] Allow existing-family entry, select the closed fresh/replacement command, and show
      a preservation notice with an explicit continuation label in `app/access/parent/sign-up.tsx`
- [x] T008 [US1] Add equivalent Arabic/English entry, preservation, and replacement-action resources
      in `src/i18n/resources.ts`
- [x] T009 [US1] Run the US1 source/localization cases GREEN in
      `tests/family-replacement-flow.test.ts` and relevant existing access tests

**Checkpoint**: The requested action and identifier step work without changing the current family.

---

## Phase 4: User Story 2 - Verified reversible setup (Priority: P1)

**Goal**: Verify first, then expose a fresh personal/family draft while retaining cancellation safety.

**Independent Test**: Wrong code and Back preserve the old family; accepted code opens Family Basics;
cancelling from setup restores the old receipt and returning sign-in.

- [x] T010 [US2] Add guarded begin/restore transitions and transient receipt/draft backup to
      `src/features/access/parentOnboarding/controller.ts`
- [x] T011 [US2] Add closed pending-creation intent, replacement verification request, guarded begin,
      and cancel/reset cleanup to `src/state/usePrototypeStore.ts`
- [x] T012 [US2] Route accepted replacement verification into the guarded begin command and preserve
      direct/deep-link fail-closed behavior in `app/access/parent/verification.tsx`
- [x] T013 [US2] Run the controller and reversible setup cases GREEN in
      `tests/parent-onboarding-controller.test.ts` and `tests/family-replacement-flow.test.ts`

**Checkpoint**: Verification precedes setup, and no pre-review exit deletes the current family.

---

## Phase 5: User Story 3 - Explicit final replacement (Priority: P1)

**Goal**: Save one complete new family and clear prior private runtime only from explicit final review.

**Independent Test**: A successful final action activates only the new family at canonical runtime
state; an injected storage failure preserves only the old family and permits safe retry/cancel.

- [x] T014 [US3] Extend `completeParentOnboarding` with validated replacement save, best-effort
      rollback, prior-household runtime reset, new Parent activation, and device-preference
      preservation in `src/state/usePrototypeStore.ts`
- [x] T015 [US3] Repeat the replacement consequence and use a replacement-specific primary action
      only for the staged replacement path in `app/access/parent/review-create.tsx`
- [x] T016 [US3] Run successful replacement, injected-save-failure, reset, pairing, permissions,
      assistant state, and returning-identifier cases GREEN in
      `tests/family-replacement-flow.test.ts`

**Checkpoint**: The sole saved family changes only after a deliberate, complete, successful action.

---

## Phase 6: Polish and evidence

**Purpose**: Prove regressions, presentation, truthfulness, and integration readiness.

- [x] T017 Run the focused command from `specs/011-verified-family-replacement/quickstart.md`, then
      `npm run typecheck`, `npm run lint`, `npm run format:check`, and `git diff --check`
- [x] T018 Run `npm test`, dependency alignment, 39-route inventory, web export, and Android
      JavaScript export; distinguish pre-existing dependency drift from Feature 011 failures
- [ ] T019 Run the Impeccable detector once over the finished changed UI targets and inspect Arabic
      RTL/English LTR at 320×720 and 390×844, increased text, keyboard, Back, wrong code,
      cancellation, replacement, and save-failure states
- [x] T020 Record truthful product, design, limitation, and rehearsal evidence in `PRODUCT.md`,
      `DESIGN.md`, `PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`, and release the reservation in
      `TEAM_OWNERSHIP.md`
- [x] T021 Commit the verified runtime slice and final evidence as small cohesive commits without
      staging protected/unrelated files or pushing shared history

---

## Dependencies & Execution Order

- Phase 1 blocks every runtime task.
- Phase 2 blocks US1–US3 implementation and must fail RED first.
- US1 entry precedes US2 verification staging; US2 precedes US3 final replacement.
- Final validation/evidence depends on all three user stories.
- Shared ownership of `src/state/usePrototypeStore.ts`, `src/i18n/resources.ts`, and the access routes
  means these tasks are intentionally sequential; no overlapping write task is marked `[P]`.

## Implementation Strategy

1. Contract and reserve the smallest boundary.
2. Capture the complete requested journey and safety regressions RED.
3. Restore the always-visible action and informed identifier entry.
4. Add reversible verified setup without touching persistence.
5. Commit the sole persistent replacement only from final review and reset private runtime.
6. Validate focused behavior, all regressions, bilingual presentation, exports, and honest evidence.

## Format Validation

All 21 tasks use the required checkbox, sequential task ID, optional story label, concrete action,
and exact file path. No task is marked parallel because the implementation shares central access
and store authorities.
