# Tasks: Ghaf Repository Foundation

**Input**: Design documents from `specs/001-ghaf-repository-foundation/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

**Tests**: Focused pure-function/service tests and one mock-flow smoke test are required; manual
route and RTL checks remain part of validation.

**Organization**: Tasks are grouped by user story and bounded to the four Feature 001 routes.

## Provisional Task Ownership

| Owner                                         | Task IDs                                         | Scope                                                                                     |
| --------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Member 1 — Mobile and visual experience       | T001–T004, T010–T016, T018–T019, T021–T026, T034 | Expo, navigation, design system, screens, RTL integration, Ghaf visual, build integration |
| Member 2 — AI and application logic           | T005–T009, T017, T020                            | Models, service contracts/mocks, shared state, pure tests                                 |
| Member 3 — Product, content, QA, presentation | T027–T033, T035–T036                             | Guidance, agents, bilingual content review, scope scans, manual demo QA                   |

Member 1 is the bootstrap-period integration owner and approves cross-owner integration. Any handoff
MUST be recorded in `docs/TEAM_OWNERSHIP.md` before work resumes. Owners MUST coordinate before
touching a file outside their listed task scope.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: May run in parallel because it owns different files and has no unfinished dependency.
- **[Story]**: Maps the task to a specification user story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the current stable Expo project and repeatable commands.

- [x] T001 Scaffold Expo SDK 57 Router/TypeScript configuration and provisional Ghaf metadata in `package.json`, `app.config.ts`, `tsconfig.json`, `eslint.config.js`, and `package-lock.json`
- [x] T002 [P] Create secret-safe repository exclusions and placeholders in `.gitignore`, `.env.example`, `.prettierignore`, and `.prettierrc.json`
- [x] T003 [P] Create approved empty feature and asset directories with tracked `.gitkeep` files under `assets/` and `src/features/`
- [x] T004 Install only approved foundation dependencies and add start, lint, typecheck, format, and test scripts in `package.json` and `package-lock.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared data, service, state, design, and localization foundations required by every route.

**Critical**: No user-story screen work begins before this phase completes.

- [x] T005 [P] Define locale, role, family, mission, impact, Ghaf-progress, and session types in `src/models/prototype.ts`
- [x] T006 [P] Define `ServiceResult` and five replaceable service contracts in `src/services/interfaces/index.ts`
- [x] T007 Create bilingual synthetic fixtures matching the contracts in `src/services/mock/fixtures.ts`
- [x] T008 Implement deterministic `MockMissionService`, `MockMediaService`, `MockAIService`, `MockImpactService`, and `MockPrototypeSessionService` plus a registry in `src/services/mock/index.ts` and `src/services/index.ts`
- [x] T009 Implement the bounded Zustand store with locale, role, shared mission data, and `resetDemo()` in `src/state/usePrototypeStore.ts`
- [x] T010 [P] Define provisional palette, typography, spacing, radii, shadows, and motion tokens in `src/design/tokens.ts`
- [x] T011 [P] Create Arabic and English resources, locale helpers, and direction metadata in `src/i18n/resources.ts` and `src/i18n/index.ts`
- [x] T012 Build reusable `Screen`, `Text`, `Button`, `Card`, `Input`, and `IconButton` primitives in `src/components/primitives.tsx`
- [x] T013 Configure the shared root providers and native stack in `app/_layout.tsx`

**Checkpoint**: Models, services, state, tokens, localization, and primitives compile independently.

---

## Phase 3: User Story 1 - Launch the Ghaf Foundation (Priority: P1) 🎯 MVP

**Goal**: Launch a branded Ghaf shell and reach the role selector.

**Independent Test**: Start the app, see Ghaf/غاف, enter the prototype, and reach the selector.

- [x] T014 [US1] Implement the branded entry route in `app/index.tsx`
- [x] T015 [US1] Implement the prototype role-selector route in `app/role.tsx`
- [x] T016 [US1] Add launch and route validation steps to `specs/001-ghaf-repository-foundation/quickstart.md`

**Checkpoint**: The clean-start P1 story is visually coherent and manually testable.

---

## Phase 4: User Story 2 - Use Arabic or English (Priority: P2)

**Goal**: Make language choice and visible direction work across the shell.

**Independent Test**: Select Arabic and English in turn and observe matching copy and direction.

- [x] T017 [P] [US2] Write locale/direction regression tests in `tests/prototype-state.test.ts`
- [x] T018 [US2] Implement a bilingual `LanguageSwitcher` with native-direction reload guidance in `src/components/LanguageSwitcher.tsx`
- [x] T019 [US2] Apply logical alignment and bilingual copy to `app/index.tsx`, `app/role.tsx`, and `src/components/primitives.tsx`

**Checkpoint**: Arabic and English foundation routes remain independently usable.

---

## Phase 5: User Story 3 - Switch Prototype Roles (Priority: P3)

**Goal**: Show one coherent mock mission and Ghaf stage across Parent and Child views with reset.

**Independent Test**: Switch Parent → Child → Parent, then reset and compare the full starting state.

- [x] T020 [P] [US3] Write deterministic mock-service and reset-flow tests in `tests/mock-flow.test.ts`
- [x] T021 [P] [US3] Build the reusable six-stage layered SVG component in `src/components/GhafTree.tsx`
- [x] T022 [P] [US3] Build `ProgressBar`, `RoleSwitcher`, `MissionCard`, and `ImpactCard` in `src/components/prototype.tsx`
- [x] T023 [P] [US3] Build lightweight `LoadingExperience`, `EmptyState`, `ErrorState`, and `CelebrationOverlay` in `src/components/states.tsx`
- [x] T024 [US3] Implement the seeded parent foundation route in `app/parent/index.tsx`
- [x] T025 [US3] Implement the seeded child foundation route in `app/child/index.tsx`
- [x] T026 [US3] Wire role switching, locale retention, mock disclosure, and one-action reset across `app/role.tsx`, `app/parent/index.tsx`, and `app/child/index.tsx`

**Checkpoint**: The role-switching shell completes five deterministic reset trials offline.

---

## Phase 6: User Story 4 - Collaborate Without Scope Drift (Priority: P4)

**Goal**: Make project intent, ownership, agent roles, and operating commands easy to find.

**Independent Test**: A new contributor finds their scope and completes setup using repository docs.

- [x] T027 [P] [US4] Create the root collaboration contract with the exact MVP Prototype First clarification verbatim and active-plan markers in `AGENTS.md`
- [x] T028 [P] [US4] Create five supported standalone agent definitions and a four-agent concurrency cap in `.codex/agents/ghaf-orchestrator.toml`, `.codex/agents/ghaf-product-spec-agent.toml`, `.codex/agents/ghaf-ui-expo-agent.toml`, `.codex/agents/ghaf-ai-prototype-agent.toml`, `.codex/agents/ghaf-demo-qa-agent.toml`, and `.codex/config.toml`
- [x] T029 [P] [US4] Document team setup, branch discipline, commands, and integration-owner practice in `CONTRIBUTING.md` and `docs/TEAM_OWNERSHIP.md`
- [x] T030 [P] [US4] Document visual direction and the six-stage tree in `docs/DESIGN_DIRECTION.md`
- [x] T031 [P] [US4] Document the reset/rehearsal path in `docs/DEMO_RUNBOOK.md`
- [x] T032 [P] [US4] Document mocked behavior, minimum safeguards, and repository status with the exact MVP Prototype First clarification verbatim in `docs/PROTOTYPE_LIMITATIONS.md`
- [x] T033 [US4] Create the primary product, status, stack, Spec Kit, and command guide with the exact MVP Prototype First clarification verbatim in `README.md`

**Checkpoint**: The repository can be understood without a separate documentation hierarchy.

---

## Phase 7: Polish & Cross-Cutting Validation

**Purpose**: Prove the bounded foundation is coherent and ready for Feature 002 review.

- [x] T034 Run `npm run typecheck`, `npm run lint`, `npm run format:check`, and `npm test`, fixing foundation-only defects in affected source files
- [x] T035 Scan the repository for prohibited legacy product names, committed secret-shaped values, unapproved routes, and production-backend additions using the commands documented in `README.md`
- [x] T036 Execute the available Feature 001 quickstart, browser-based offline role flow,
      progress-direction check, five store-level resets, one rendered reset, clean-checkout setup
      timing, and web role/locale checks, recording the observed results in `README.md`
- [ ] T037 On the named primary Android phone, execute the Arabic/RTL checklist, offline preview-build
      flow, five rendered resets, locale tap count, role-switch timing, and contributor-discovery
      timing, recording device/build evidence separately in `README.md` and `docs/DEMO_RUNBOOK.md`

T037 is an external device-validation gate. It remains unchecked until direct physical-device
evidence exists; web behavior and source inspection cannot complete it.

---

## Dependencies & Execution Order

- Phase 1 blocks Phase 2.
- Phase 2 blocks every screen story.
- US1 establishes navigation before US2 and US3 integrate with those routes.
- US2 and the independent US3 components may proceed in parallel after US1; route integration is
  serialized through T026.
- US4 documentation and agent files may proceed after the plan is stable and in parallel with UI.
- Phase 7 waits for all desired Feature 001 stories.

## Parallel Opportunities

- T002 and T003 own separate setup files after T001.
- T005, T006, T010, and T011 own separate foundation areas.
- T017 can be written while US3 component files T021–T023 are built.
- T027–T032 own distinct guidance or agent files.

## Parallel Example: User Story 3

```text
Task: T020 Write mock/reset tests in tests/mock-flow.test.ts
Task: T021 Build GhafTree in src/components/GhafTree.tsx
Task: T022 Build prototype cards/controls in src/components/prototype.tsx
Task: T023 Build reusable state views in src/components/states.tsx
```

## Implementation Strategy

1. Complete setup and shared foundations.
2. Validate US1 before adding language integration.
3. Validate Arabic/English before role routes are polished.
4. Complete role switching, mock mission, tree, and reset.
5. Add collaboration artifacts and run the proportional validation gate.
6. Stop: Feature 002 remains planning-only pending team approval.
7. Run `$speckit-converge`; implement any appended gap tasks and rerun until clean.

## Format Validation

All 36 tasks use a checkbox, sequential task ID, appropriate parallel/story labels, and concrete
file paths or exact validation commands.
