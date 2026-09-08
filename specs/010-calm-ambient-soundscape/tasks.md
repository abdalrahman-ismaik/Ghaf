# Tasks: Calm Ambient Soundscape

**Input**: Design documents from `/specs/010-calm-ambient-soundscape/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md,
contracts/calm-soundscape-v2.md, quickstart.md

**Tests**: Asset selection and preservation are test-driven. Objective media inspection supports,
but does not replace, the separately named human Android listening gate.

**Organization**: Tasks are grouped by user story so the calmer source and the unchanged control/
fallback contract remain independently verifiable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it owns a different file after dependencies are satisfied
- **[Story]**: Maps the task to a user story in `spec.md`

## Phase 1: Setup

**Purpose**: Establish exact ownership and preserve the prior evidence baseline.

- [x] T001 Record the Feature 010 planning, asset, source, test, and evidence reservation in TEAM_OWNERSHIP.md
- [x] T002 Audit v1 identity, spectrum, loudness, silence, and current source binding against assets/audio/ambient/nature-soundscape-v1.mp3 and src/components/audio/AmbientAudioProvider.tsx

---

## Phase 2: Foundational

**Purpose**: Lock a narrow, reversible contract before implementation.

- [x] T003 Complete the approved specification and source contract in specs/010-calm-ambient-soundscape/spec.md and specs/010-calm-ambient-soundscape/contracts/calm-soundscape-v2.md
- [x] T004 Confirm existing audio preferences, lifecycle policy, narration ducking, safe failure, reset, UI copy, and dependencies require no change through src/features/audio/ambientAudio.ts and tests/natural-ambient-audio.test.tsx

**Checkpoint**: One asset-only runtime seam is approved; no new control, state, package, permission,
or service is required.

---

## Phase 3: User Story 1 - Hear calm, unobtrusive ambience (Priority: P1) MVP

**Goal**: Replace the repeated tonal v1 source with one even, locally authored v2 ambience.

**Independent Test**: The root provider selects only the documented v2 source; objective media
inspection passes; a later named Android reviewer can listen through one cycle and two boundaries.

### Tests for User Story 1

- [x] T005 [US1] Add a failing v2 source identity, v1 preservation, provenance, and active-binding contract to tests/natural-ambient-audio.test.tsx
- [x] T006 [US1] Run tests/natural-ambient-audio.test.tsx before implementation and record the expected missing-v2 or v1-binding failure in specs/010-calm-ambient-soundscape/tasks.md

  - RED evidence (2026-09-08): 21 passed and 2 failed because the provider still referenced
    `nature-soundscape-v1.mp3` and `calm-soundscape-v2.mp3` did not yet exist.

### Implementation for User Story 1

- [x] T007 [US1] Author the deterministic tone-free circularly crossfaded source at assets/audio/ambient/calm-soundscape-v2.mp3
- [x] T008 [US1] Record v1/v2 provenance, content boundaries, identities, and objective measurements in assets/audio/ambient/README.md
- [x] T009 [US1] Select the v2 local source without changing player behavior in src/components/audio/AmbientAudioProvider.tsx
- [x] T010 [US1] Run the focused test plus FFprobe, loudness, silence, waveform, spectrum, and hash checks for assets/audio/ambient/calm-soundscape-v2.mp3

**Checkpoint**: The new source is active, reversible, objectively within the delivery envelope, and
ready for subjective listening without claiming that gate.

---

## Phase 4: User Story 2 - Retain quiet control and safe fallback (Priority: P1)

**Goal**: Prove that the calmer source changes no preference, access, lifecycle, accessibility,
narration, reset, or product behavior.

**Independent Test**: Existing audio and prototype-state regressions pass with the v2 binding, and
source inspection shows no new UI/state/dependency path.

### Tests for User Story 2

- [x] T011 [US2] Run focused audio, onboarding narration, live-voice exclusion, remembered access, and exact-reset regressions through the existing tests

### Implementation for User Story 2

- [x] T012 [US2] Update the narrow soundscape truth and manual-review guidance in PRODUCT.md, DESIGN.md, PROTOTYPE_LIMITATIONS.md, and DEMO_RUNBOOK.md

**Checkpoint**: The existing control and safe fallback remain complete and unchanged.

---

## Phase 5: Polish and Evidence

**Purpose**: Validate repository integration and report the human gate honestly.

- [x] T013 Run strict TypeScript, zero-warning lint, formatting, full tests, Git whitespace, dependency alignment, and static export validation from specs/010-calm-ambient-soundscape/quickstart.md
- [x] T014 Record exact automated evidence, `NOT RUN` human Android listening, protected unrelated artifacts, and final integration status in TEAM_OWNERSHIP.md and specs/010-calm-ambient-soundscape/tasks.md

  - Final evidence (2026-09-08): strict TypeScript, zero-warning lint, maintained-source and
    Feature 010 formatting, 124 files / 1,371 tests, Git whitespace, 39-route web export, and Android
    JavaScript export with 96 assets passed. Both exports contain byte-identical v2 audio. The
    combined `npm run verify` stops only at the pre-existing Expo patch alignment: `expo` 57.0.20
    expects ~57.0.21 and `expo-router` 57.0.19 expects ~57.0.20. Physical Android listening and
    named human review remain `NOT RUN`.

---

## Dependencies and Execution Order

- Setup tasks T001–T002 establish the prior identity and exact write boundary.
- Foundational tasks T003–T004 must pass before asset work.
- US1 follows TDD order: T005, T006, T007, T008, T009, then T010.
- US2 validation T011 follows the active v2 binding; T012 can follow its verified outcomes.
- Final validation and evidence T013–T014 follow both stories.
- No concurrent writer is permitted on the reserved files. Objective read-only inspection may be
  repeated at any point.

## Parallel Opportunities

- After T010, documentation drafts for the four non-overlapping truth/evidence files may be prepared
  independently, but `/root` remains the only writer under the current repository contract.
- Full repository checks that do not contend for build output may run concurrently; static exports
  remain serialized to keep evidence deterministic.

## Implementation Strategy

1. Freeze the narrow v2 contract and prior v1 identity.
2. Make the active-source test fail against the current v1 binding.
3. Author, inspect, document, and select one v2 asset.
4. Prove unchanged Sound, lifecycle, accessibility, narration, access, and reset behavior.
5. Run repository-wide validation and leave subjective Android listening `NOT RUN` until performed.
