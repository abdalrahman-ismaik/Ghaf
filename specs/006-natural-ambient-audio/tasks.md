# Tasks: Natural Ambient Audio

**Input**: Design documents from `/specs/006-natural-ambient-audio/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/ambient-audio-v1.md`

**Tests**: Required by SC-002, SC-004, SC-006, and the repository TDD contract. Each behavior phase
begins RED.

## Phase 1: Setup and ownership

- [x] T001 Reserve exact planning, runtime, asset, test, and evidence files in
      `TEAM_OWNERSHIP.md`
- [x] T002 Create the specification, quality checklist, plan, research, data model, contract, and
      quickstart in `specs/006-natural-ambient-audio/`
- [x] T003 Update `.specify/feature.json` and refresh the Spec Kit-managed block in `AGENTS.md`

---

## Phase 2: Foundational preference and policy

**Purpose**: Establish strict device-local preference storage and a pure, independently testable
playback decision before any native player or Settings UI changes.

- [x] T004 Write failing v1 schema, repository, store, and playback-policy tests in
      `tests/natural-ambient-audio.test.tsx`
- [x] T005 Add exact preference types plus parsing and playback policy in
      `src/models/audioPreferences.ts` and `src/features/audio/ambientAudio.ts`
- [x] T006 Implement `src/services/local/audioPreferencesRepository.ts`, export/register it through
      `src/services/local/index.ts` and `src/services/index.ts`, and integrate the view/action in
      `src/state/usePrototypeStore.ts`
- [x] T007 Run the focused foundation tests GREEN and refactor without broadening the stored record

**Checkpoint**: One Boolean preference is strict, persisted, resettable, and separate from playback.

---

## Phase 3: User Story 1 - Calm continuous nature ambience (Priority: P1) 🎯 MVP

**Goal**: One quiet local nature soundscape loops across the active app and ducks under narration.

**Independent Test**: Start the app with ambience enabled, navigate across routes, replay narration,
and verify one root player uses the local soundscape, loop mode, and quiet/ducked policy without
network or product-state effects.

- [x] T008 [US1] Extend failing source/integration coverage for one root-owned looping local player,
      narration ducking, and removal of the onboarding-only player in
      `tests/natural-ambient-audio.test.tsx` and `tests/r003-first-run-experience.test.ts`
- [x] T009 [US1] Move the existing ambience into `assets/audio/ambient/`, preserve provenance in
      `assets/audio/ambient/README.md`, and keep narration-only provenance in
      `assets/audio/onboarding/README.md`
- [x] T010 [US1] Build the single provider and shared playback focus contract in
      `src/components/audio/AmbientAudioProvider.tsx` and `src/components/audio/index.ts`
- [x] T011 [US1] Mount the provider once in `app/_layout.tsx`, connect narration focus/browser
      interaction in `src/components/onboarding/FirstRunOnboarding.tsx`, remove
      `src/components/onboarding/useOnboardingAmbience.ts`, and narrow
      `src/components/onboarding/onboardingAudioSources.ts` to narration
- [x] T012 [US1] Run the focused playback and first-run suites GREEN and commit the independently
      verifiable app-wide ambience slice

**Checkpoint**: Enabled ambience uses one local player continuously across Ghaf.

---

## Phase 4: User Story 2 - Shared settings control (Priority: P1)

**Goal**: Parent and Child can immediately turn the same persisted device preference off or on.

**Independent Test**: Toggle from each role separately, verify immediate store response and shared
state through restart/sign-out/handoff, and prove a failed write leaves the prior state visible.

- [x] T013 [US2] Add failing bilingual, accessibility, hierarchy, shared-state, and write-failure
      tests in `tests/natural-ambient-audio.test.tsx`
- [x] T014 [US2] Build the native switch row in
      `src/components/settings/AmbientSoundSetting.tsx` and add equivalent copy in
      `src/i18n/resources.ts`
- [x] T015 [US2] Place the Sound section after language in `app/parent/settings/index.tsx` and
      `app/child/settings.tsx` without changing role or permission authority
- [x] T016 [US2] Run the focused Settings/store tests GREEN and commit the independently verifiable
      preference-control slice

**Checkpoint**: Either role can control the same device ambience with one accessible action.

---

## Phase 5: User Story 3 - Quiet lifecycle and exact reset (Priority: P2)

**Goal**: Ambience pauses for background/inactive/screen-reader/exclusive-audio states and exact
reset restores the default without changing other product values.

**Independent Test**: Evaluate every policy branch, toggle off then reset as an authorized Parent,
and verify default-on preference plus the unchanged canonical app reset state.

- [x] T017 [US3] Add failing lifecycle, safe-fallback, no-permission, and reset regression tests in
      `tests/natural-ambient-audio.test.tsx` and `tests/prototype-state.test.ts`
- [x] T018 [US3] Complete foreground, screen-reader, browser-unlock, exclusive-audio, failure-to-
      silence, and reset integration in `src/components/audio/AmbientAudioProvider.tsx` and
      `src/state/usePrototypeStore.ts`
- [x] T019 [US3] Run the lifecycle/reset tests GREEN and commit the independently verifiable safety
      slice

**Checkpoint**: Optional ambience never becomes background, assistive-technology-competing, or
reset-stale audio.

---

## Phase 6: Polish, evidence, and release checks

- [ ] T020 Update truthful feature behavior and limits in `PRODUCT.md`, `DESIGN.md`,
      `PROTOTYPE_LIMITATIONS.md`, and `DEMO_RUNBOOK.md`
- [ ] T021 Run the Impeccable detector once over the changed Settings/provider UI files, inspect
      audio metadata/checksum/silence boundaries, and record physical Android listening as direct
      evidence or `NOT RUN`
- [ ] T022 Run focused tests, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`,
      Expo dependency checks, and `git diff --check`
- [ ] T023 Reconcile every requirement/task, update `tasks.md` and `TEAM_OWNERSHIP.md` with exact
      evidence and known gaps, and commit only the reserved feature files

## Dependencies and execution order

- T004–T007 block native playback and Settings work.
- User Story 1 establishes the single player before User Story 2 controls it.
- User Story 3 hardens the completed player/preference and depends on both P1 stories.
- Documentation and complete validation follow all runtime behavior.
- The single owner executes sequentially because the store, provider, settings, tests, and evidence
  boundaries are intentionally shared.

## Implementation strategy

The MVP is User Story 1 plus the P1 Settings control: continuous ambience without immediate opt-out
is not independently acceptable. User Story 3 is required before handoff because foreground-only,
screen-reader silence, failure fallback, and reset are repository invariants rather than optional
polish.
