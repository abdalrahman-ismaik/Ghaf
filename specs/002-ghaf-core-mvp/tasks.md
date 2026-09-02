---
description: 'Dependency-ordered implementation backlog for the Ghaf Core MVP'
---

# Tasks: Ghaf Core MVP

**Input**: Design artifacts in `specs/002-ghaf-core-mvp/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/service-contracts.md`, and `quickstart.md`

**Implementation gate**: APPROVED on 2026-08-22 for the deterministic mock journey. Member 1 is the
integration owner. Local implementation and evidence tasks are complete; T039 physical Android and
T041 human rehearsal remain open. Live AI, camera, recording, and storage remain deferred.

**Tests**: Include only the focused logic, state, and mock-flow tests required by the specification
and plan. Do not add a coverage target or a large test suite.

## Format: `[ID] [P?] [Story] Description with exact path`

- **[P]**: Safe to run concurrently after its listed prerequisites because it writes different files.
- **[US#]**: Maps the task to one independently testable user story from `spec.md`.
- Setup, foundational, and polish tasks intentionally have no user-story label.

## Provisional Ownership and Integration

| Owner                                                 | Exclusive write scope for this backlog                                                        |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Member 1 — Mobile and visual experience**           | `app/`, `src/components/`, `src/design/`, dependency files, and physical Android review       |
| **Member 2 — AI and application logic**               | `src/models/`, `src/features/` logic, `src/services/`, `src/state/`, and automated tests      |
| **Member 3 — Product, content, QA, and presentation** | `src/i18n/resources.ts`, synthetic content/assets, acceptance records, and rehearsal evidence |

Member 1 is the current Feature 002 integration owner and remains so until the team records a handoff.
Before every implementation work period, exactly one of the three members MUST be named as integration
owner in `docs/TEAM_OWNERSHIP.md`. That person serializes changes to shared configuration, the service
registry, the store, and final integration. Tasks that revisit the same file run in task-ID order and
MUST NOT be assigned concurrently, even when different phases are otherwise parallelizable.

## Phase 1: Setup and Approval Gate

**Purpose**: Resolve the small team choices that affect implementation and prepare only approved
dependencies and synthetic public-demo content.

- [x] T001 Member 3 — Record plan approval, selected demo assets/defaults, Ghaf thresholds, primary Android device status, and Member 1 as the named integration owner for the work period in docs/TEAM_OWNERSHIP.md
- [x] T002 Member 1 — Add only the approved React Hook Form, Zod, Hook Form resolver, and `expo-audio` prepared-playback dependencies while keeping recording and image picking optional-later in package.json and package-lock.json
- [x] T003 [P] Member 3 — Create reviewed bilingual mission content and synthetic public-demo fixtures in src/features/missions/demoContent.ts, assets/demo/food-rescue-bread.jpg, assets/demo/family-wisdom-ar.mp3, assets/demo/family-wisdom-en.mp3, assets/demo/mission-narration-ar.mp3, assets/demo/mission-narration-en.mp3, and assets/demo/child-evidence.jpg

**Checkpoint**: Do not continue unless T001 records explicit approval and one named integration owner.

---

## Phase 2: Foundational Model and Offline Boundaries

**Purpose**: Establish the shared model, contracts, deterministic mocks, session baseline, and copy
that every user story consumes.

**Critical**: This phase blocks all user-story implementation.

- [x] T004 Member 2 — Replace the Feature 001 summary types with the twelve Feature 002 entities, value objects, lifecycle statuses, and ready-to-create session shape in src/models/prototype.ts
- [x] T005 Member 2 — Extend ServiceResult metadata and the five service interfaces to match the reviewed internal contracts in src/services/interfaces/index.ts
- [x] T006 [P] Member 2 — Implement quantity, mission-input, exact-three-step, bilingual payload, reflection, and submission validation in src/features/missions/validation.ts
- [x] T007 [P] Member 2 — Implement guarded pure lifecycle transitions for generation, edit, assignment, Child work, submission, retry, and completion in src/features/missions/lifecycle.ts
- [x] T008 Member 2 — Replace the assigned Feature 001 seed with the ready-to-create baseline plus prepared media, evidence, and unassigned pregenerated mission fixtures in src/services/mock/fixtures.ts
- [x] T009 Member 2 — Implement deterministic Mission, Media, AI, Impact, and Prototype Session mocks and bind the default registry in src/services/mock/index.ts and src/services/index.ts
- [x] T010 Member 2 — Evolve the Zustand session to the Feature 002 shape with typed selectors and an atomic Arabic/Parent/mock ready-to-create reset in src/state/usePrototypeStore.ts
- [x] T011 [P] Member 3 — Add reviewed Arabic and English interface copy for all ten screens, validation, mock disclosures, retry, reset, and celebration states in src/i18n/resources.ts

**Checkpoint**: The application has one coherent local session and five replaceable offline service
contracts; no route imports fixtures or concrete providers.

---

## Phase 3: User Story 1 — Parent Creates and Approves a Mission (Priority: P1)

**Goal**: A Parent selects prepared family and food context, sees visible simulated transformation,
reviews the structured bilingual mission, edits if needed, and explicitly approves assignment.

**Independent Test**: From the ready-to-create Parent state, supply the prepared Child/image/voice,
quantity, time, and reward; complete the four simulated stages; inspect both languages and exactly
three steps; edit once; then approve one mission for the Child.

### Focused test

- [x] T012 [US1] Member 2 — Write failing tests for required input, quantity bounds, exact-three-step payload validation, same-attempt mock fallback replacement, edit return, and assignment approval guards in tests/mission-lifecycle.test.ts

### Implementation

- [x] T013 [US1] Member 2 — Implement the small mission form schema, defaults, and conversion to MissionInput in src/features/missions/form.ts
- [x] T014 [US1] Member 2 — Implement four-stage simulated generation, structured result validation, same-attempt deterministic fallback, and origin metadata in src/features/missions/generateMission.ts
- [x] T015 [US1] Member 2 — Add draft, generation, edit, and approve-for-Child commands without direct screen mutation in src/state/usePrototypeStore.ts
- [x] T016 [P] [US1] Member 1 — Build the bounded four-stage loading and honest origin-disclosure component in src/components/MissionGenerationExperience.tsx
- [x] T017 [US1] Member 1 — Build the Create Mission form with prepared media controls and link it from Parent home in app/parent/create.tsx and app/parent/index.tsx
- [x] T018 [US1] Member 1 — Build the simulated generation route with preserved-input fallback and retry states in app/parent/generating.tsx
- [x] T019 [US1] Member 1 — Build bilingual Parent review, edit, and explicit assignment approval in app/parent/review.tsx

**Checkpoint**: US1 is independently demonstrable with pregenerated content and no network.

---

## Phase 4: User Story 2 — Child Completes the Adventure (Priority: P2)

**Goal**: The Child opens the approved mission, completes exactly three steps, supplies prepared
evidence or requests Parent confirmation, answers one reflection, and submits without an award.

**Independent Test**: Start from a seeded Parent-approved mission, mark the three steps, choose one
evidence path, answer the reflection, submit, and observe awaiting-Parent state with unchanged impact.

### Focused test

- [x] T020 [US2] Member 2 — Extend lifecycle tests with step completion, locale-preserved progress, evidence-or-confirmation, required reflection, submission guards, and zero-award assertions in tests/mission-lifecycle.test.ts

### Implementation

- [x] T021 [US2] Member 2 — Add Child step, evidence choice, reflection, and submit-for-confirmation commands in src/state/usePrototypeStore.ts
- [x] T022 [US2] Member 1 — Build the Child mission story, real prepared narration playback, three-step progress, evidence choice, reflection, and awaiting-Parent state in app/child/mission.tsx
- [x] T023 [US2] Member 1 — Update Child home with assigned-adventure status, reward preview, Ghaf progress, and mission entry in app/child/index.tsx

**Checkpoint**: US2 is independently testable with a seeded approved mission and changes no impact.

---

## Phase 5: User Story 3 — Parent Confirms the Result (Priority: P3)

**Goal**: A Parent reviews a complete submission, requests a retry without an award, or approves one
estimated rescued quantity exactly once.

**Independent Test**: Start from a seeded awaiting-Parent submission; exercise retry, then approve a
valid labeled quantity and repeat approval five times while totals remain unchanged after the first.

### Focused test

- [x] T024 [US3] Member 2 — Write failing tests for retry-without-award, quantity validation, one awardKey record, and five repeated approval attempts in tests/impact-idempotency.test.ts

### Implementation

- [x] T025 [US3] Member 2 — Implement the atomic idempotent completion award and retry-without-award use cases in src/features/impact/awardCompletion.ts
- [x] T026 [US3] Member 2 — Integrate requestRetry and approveCompletion commands as single store updates in src/state/usePrototypeStore.ts
- [x] T027 [US3] Member 1 — Build Parent submission review, estimated quantity confirmation, retry, approve, and duplicate-action feedback in app/parent/confirmation.tsx

**Checkpoint**: US3 is independently testable with a seeded submission and cannot double-award.

---

## Phase 6: User Story 4 — Family Ghaf Tree Grows (Priority: P4)

**Goal**: One approved completion updates estimated impact and causes a bounded, deterministic Ghaf
response, including stage crossing and saturation at Full Ghaf tree.

**Independent Test**: Feed seeded awards below a threshold, across the demo threshold, and at stage 5;
observe the expected progress, one unlocked milestone, and no seventh stage.

### Focused test

- [x] T028 [US4] Member 2 — Write failing pure-function tests for below-threshold progress, configured stage crossing, unique milestones, and stage-5 saturation in tests/ghaf-progress.test.ts

### Implementation

- [x] T029 [US4] Member 2 — Implement approved local point thresholds, six-stage derivation, milestone uniqueness, and stage-5 clamping in src/features/ghaf-tree/progression.ts
- [x] T030 [P] [US4] Member 1 — Preserve the existing six-stage SVG Ghaf rendering and add deterministic stage-transition and milestone details with bounded opacity, transform, and short reveal motion in src/components/GhafTree.tsx
- [x] T031 [US4] Member 1 — Extend the existing CelebrationOverlay in src/components/states.tsx and build the impact celebration route with estimated-impact disclosure, milestone, reward, and reset/continue actions in app/celebration.tsx

**Checkpoint**: US4 is independently testable from a seeded completion award and keeps the tree central.

---

## Phase 7: User Story 5 — Complete Offline Demo Fallback (Priority: P5)

**Goal**: The complete ten-screen journey resets and runs deterministically with prepared assets when
network or an optional provider is unavailable.

**Independent Test**: Disable network access, reset from five source states, complete the full journey
five times, and confirm one review mission, one impact award, visible Ghaf feedback, and exact reset.

### Focused tests

- [x] T032 [P] [US5] Member 2 — Extend reset tests for all source states, exact ready-to-create values, cleared assignment/submission/celebration, and still-available unassigned fallback in tests/prototype-state.test.ts
- [x] T033 [P] [US5] Member 2 — Write the complete deterministic service/store smoke test for the ten-screen lifecycle, provider failure, same-attempt fallback, one award, and reset in tests/mock-core-flow.test.ts

### Implementation

- [x] T034 [US5] Member 2 — Complete retryable provider-error mapping, preserved-input fallback, and atomic session reset behavior in src/features/missions/generateMission.ts, src/services/mock/index.ts, and src/state/usePrototypeStore.ts
- [x] T035 [US5] Member 1 — Add a shared bilingual prototype-mode/origin disclosure and reset control that returns to Parent home from every journey state in src/components/PrototypeStatusBar.tsx and app/_layout.tsx

**Checkpoint**: US5 joins US1–US4 into the reliable competition flow; optional live services remain
nonblocking.

---

## Phase 8: Polish and Proportional Validation

**Purpose**: Apply final bilingual presentation quality, run focused automated checks, record native
evidence, rehearse the judge path, and enforce the approved MVP boundary.

- [x] T036 [P] Member 1 — Apply shared RTL-safe logical spacing, keyboard avoidance, touch sizing, focus feedback, and motion-reduction behavior in src/components/primitives.tsx and src/design/tokens.ts
- [x] T037 [P] Member 3 — Review Arabic/English mission wording, age suitability, mock disclosures, nonfinancial rewards, and food-safety boundaries in src/i18n/resources.ts and src/features/missions/demoContent.ts
- [x] T038 Integration owner — Run typecheck, lint, formatting, and focused tests from package.json and record exact results in docs/DEMO_RUNBOOK.md
- [ ] T039 Member 1 — Complete and record the full journey in Arabic/RTL and English/LTR on the named physical Android device, including prepared-media playback, wrapping, touch, keyboard, and motion review in docs/DEMO_RUNBOOK.md
- [x] T040 Member 3 — Record five offline flows, five source-state resets, retry-without-award, five repeated approvals, impact-and-tree feedback within three seconds, and all six Ghaf-stage checks in docs/DEMO_RUNBOOK.md
- [ ] T041 Member 3 — Record Parent input-to-review within 45 seconds, five complete 75–105-second rehearsals, and the three-person concept-comprehension review in docs/DEMO_RUNBOOK.md
- [x] T042 Integration owner — Audit exact ten-screen scope, synthetic data, secret absence, honest capability labels, optional-later exclusions, and final PASSED/FAILED/BLOCKED/NOT RUN status in docs/PROTOTYPE_LIMITATIONS.md

---

## Dependencies and Execution Order

### Phase dependencies

1. **Setup and approval (Phase 1)** has no technical prerequisite, but T001 is the authorization gate.
2. **Foundation (Phase 2)** starts after Phase 1 and blocks all user stories.
3. **US1–US4 (Phases 3–6)** can be developed as independently seeded slices after Foundation; integrate
   in priority order US1 → US2 → US3 → US4 because the live demo lifecycle is sequential.
4. **US5 (Phase 7)** depends on integrated US1–US4 because it validates the complete offline loop.
5. **Polish and validation (Phase 8)** depends on the stories selected for the competition build;
   T042 follows all required validation records.

### User-story dependency graph

```text
Setup approval → Foundation
                    ├─ US1 (seeded input)
                    ├─ US2 (seeded approved mission)
                    ├─ US3 (seeded awaiting-Parent submission)
                    └─ US4 (seeded completion award)

Integrated US1 → US2 → US3 → US4 → US5 offline loop → final validation
```

### Safe parallel opportunities

- After T001, T002 and T003 can run together because dependency files and demo-content files do not
  overlap.
- After T004, T006 and T007 can run together; T011 can run alongside Member 2 foundation work.
- In US1, T016 can run alongside T013–T015 after the shared model and copy exist.
- In US4, T030 can run alongside T028–T029 because the visual accepts a stage value and does not own
  progression calculations.
- In US5, T032 and T033 are separate test files and can be written concurrently before T034.
- In polish, T036 and T037 are separate Member 1 and Member 3 file areas.
- No parallel task may edit `package.json`, `package-lock.json`, `src/services/index.ts`,
  `src/state/usePrototypeStore.ts`, `app/_layout.tsx`, or the same acceptance record simultaneously.

## Implementation Strategy

### First independently demonstrable slice

1. Complete approved Setup and Foundation.
2. Complete US1 and demonstrate prepared input → visible generation → Parent approval offline.
3. Stop for an independent check before integrating Child work.

US1 alone is useful progress but is **not** the competition MVP.

### Competition MVP

1. Integrate US1 through US4 in priority order.
2. Complete US5 so the same journey works offline and resets exactly.
3. Complete proportional automated checks, named Android review, and rehearsals.
4. Stop when the ten-screen journey is polished and reliable; do not add optional live AI, camera,
   recording, storage, authentication, or additional screens unless separately approved.

### Three-member coordination

- Member 1 owns visual/navigation files, Member 2 owns logic/service/state/test files, and Member 3
  owns copy/assets/evidence files for the duration recorded in `docs/TEAM_OWNERSHIP.md`.
- The named integration owner sequences any exception to those boundaries and records the next
  handoff before another work period begins.
- T001 is complete because the approval record and integration owner are now documented. Checking
  T002–T042 requires both the specified file change and the acceptance evidence stated by that task.

## Notes

- Tests in each story are written first and must fail for the intended missing behavior before that
  story's implementation tasks begin.
- `[P]` never permits concurrent edits to a shared file or work that still depends on an incomplete
  prerequisite.
- Prepared, simulated, seeded, and pregenerated behavior remains visibly labeled.
- No task adds production authentication, a production backend, banking, real rewards, continuous
  recording, an unrestricted Child chatbot, food-safety determination, enterprise security, or a
  screen beyond the approved ten.
- Feature 002 deterministic mock implementation is approved; optional live integrations remain
  deferred until the complete mock journey is reliable on the primary Android phone.

---

## Phase 9: Approved AI-only Extension (2026-09-01)

**Purpose**: Implement the AI requirements from `Ghaf_Product_Experience_Redesign.pdf` without
changing the UI or expanding the broader product redesign.

- [x] T043 Member 3 — Record the age-adaptive, bilingual, task-bounded Coach requirements and the
      unchanged-UI boundary in spec.md, plan.md, and contracts/service-contracts.md
- [x] T044 Member 2 — Add Coach request/response models, Parent AI/voice permission gates, language
      detection, age policies, prompt construction, and structured response validation in
      src/models/prototype.ts and src/features/ai/
- [x] T045 Member 2 — Extend MockAIService with deterministic bilingual age-adaptive Coach replies
      and preserve mock mission generation in src/services/mock/index.ts
- [x] T046 Member 2 — Add the timeout-bounded, schema-validating mobile gateway adapter and opt-in
      AI registry selection in src/services/remote/, src/services/index.ts, and the AI generation call
      site in src/state/usePrototypeStore.ts
- [x] T047 Member 2 — Add a minimal Cloudflare Workers AI gateway with structured mission and Coach
      output, deploy-time model selection, no mobile provider secret, and no production persistence in
      workers/ghaf-ai/
- [x] T048 Member 2 — Add focused AI safety, age adaptation, code-switching, permission, remote
      validation, and fallback tests in tests/ai-features.test.ts and affected existing tests
- [x] T049 Integration owner — Run typecheck, lint, format check, and focused/full automated tests;
      record live provider deployment and physical voice/UI behavior as NOT RUN unless separately done
