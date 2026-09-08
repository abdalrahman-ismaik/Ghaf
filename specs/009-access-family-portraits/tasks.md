# Tasks: Access Family Portraits

**Input**: Design documents from `/specs/009-access-family-portraits/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

**Tests**: Required by the feature specification and repository contract. Write focused asset and
source contracts first and record the expected RED result before implementation.

**Organization**: Tasks are grouped by independently demonstrable user story. All writes remain
inside the reservation recorded in `TEAM_OWNERSHIP.md`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it owns a different file and has no incomplete dependency.
- **[Story]**: Maps the task to a user story in `spec.md`.
- Every task names its exact file boundary.

## Phase 1: Setup and Approved Boundary

**Purpose**: Establish image, cultural-truth, and no-authority contracts before generation or UI
work.

- [x] T001 Record the approved specification, checklist, research, data model, UI contract,
      validation guide, and ownership in `specs/009-access-family-portraits/`,
      `TEAM_OWNERSHIP.md`, and `.specify/feature.json`
- [x] T002 Run the configured agent-context hook so the managed block in `AGENTS.md` points to
      `specs/009-access-family-portraits/plan.md`
- [x] T003 Create the focused JPEG, prompt, 3:2 component, route placement, preload, accessibility,
      and no-interaction source contracts in `tests/access-family-portraits.test.tsx`; run the file
      and record the expected RED result

**Checkpoint**: The missing assets and presentation behavior are observable through one focused
failing suite.

---

## Phase 2: User Story 1 — Recognize the Two Access Paths (Priority: P1) 🎯 MVP

**Goal**: Welcome and Child profile access use clear responsive 3:2 imagery while existing profile
controls retain authority.

**Independent Test**: Inspect Welcome and Child access at compact Arabic/English widths; confirm
3:2 images, image/profile-control separation, graceful decode failure, and reachable actions.

- [x] T004 [P] [US1] Generate and inspect the exact two-child candidate, then normalize and record
      its prompt/provenance in `assets/images/access/child-emirati/`
- [x] T005 [US1] Register the local source in `src/components/access/childAccessAssets.ts`,
      implement the decorative, failure-safe 3:2 wrapper in
      `src/components/access/ChildAccessPortrait.tsx`, and export it from
      `src/components/access/index.ts`
- [x] T006 [US1] Place the Child portrait between the existing hero and actionable profile list in
      `app/access/child/index.tsx`
- [x] T007 [US1] Replace Welcome's fixed image height with exact responsive 3:2 geometry in
      `app/index.tsx`
- [x] T008 [US1] Verify subject constraints, exact dimensions/bytes/prompt, route order,
      non-interaction, action preservation, and image-failure behavior in
      `tests/access-family-portraits.test.tsx`

**Checkpoint**: A signed-out family can distinguish the polished Child path without changing how a
profile is selected.

---

## Phase 3: User Story 2 — Represent Emirati Mothers and Fathers (Priority: P1)

**Goal**: All three Parent access routes share one 3:2 two-adult composition with the requested
traditional attire.

**Independent Test**: Open Parent sign-in, sign-up, and verification in both locales; confirm the
same safe composition and reachable unchanged actions.

- [x] T009 [P] [US2] Generate and inspect the exact two-adult versioned candidate using the v1
      father as a reference, then normalize and update prompt/provenance in
      `assets/images/access/parent-emirati/`
- [x] T010 [US2] Point `src/components/access/parentAccessAssets.ts` to the v2 composition and
      convert `src/components/access/ParentAccessPortrait.tsx` to one exact responsive 3:2 frame
      without a compact fixed-height exception; remove the obsolete compact call-site option from
      `app/access/parent/sign-up.tsx` and `app/access/parent/verification.tsx`
- [x] T011 [US2] Reconcile shared-route, preserved-action, v1-preservation, two-subject, prompt,
      provenance, and failure-safe assertions in `tests/parent-access-portrait.test.tsx`,
      `tests/access-family-portraits.test.tsx`, and `tests/r001-onboarding-flow.test.ts`

**Checkpoint**: Parent entry visibly includes a fictional mother and father with no access behavior
change.

---

## Phase 4: User Story 3 — Keep Portraits Truthful, Safe, and Offline (Priority: P2)

**Goal**: Generated access imagery stays local, non-blocking, decorative, and separate from every
identity, profile, session, and progress authority.

**Independent Test**: Inspect source/preload/provenance and exercise offline access, failure,
remembered-device, role isolation, and exact reset regressions.

- [x] T012 [US3] Add the Parent and Child sources only to their non-blocking destination sets in
      `src/features/startup/preloadStartupImages.ts`
- [x] T013 [US3] Assert local-only loading, destination preload, accessibility exclusion, no press
      handler/store import, no startup-critical wait, and no route/state mutation in
      `tests/access-family-portraits.test.tsx`
- [x] T014 [P] [US3] Reconcile the narrow fictional-access-portrait exception, two compositions,
      exact 3:2 presentation, and unclaimed review gates in `DESIGN.md` and
      `PROTOTYPE_LIMITATIONS.md`
- [x] T015 [US3] Run focused onboarding, startup, access isolation, remembered-device, reset, and
      bilingual regressions; fix only Feature 009 defects inside the reserved runtime files

**Checkpoint**: The visual addition remains polish, not identity or business behavior.

---

## Phase 5: Evidence and Release Readiness

**Purpose**: Validate judge-facing presentation and record only observed evidence.

- [x] T016 Reload the Impeccable craft-floor guidance immediately before UI edits, run its detector
      once after the final UI change, and perform the required finish review
- [x] T017 Inspect final image crops plus Arabic/English layouts at 320×720 and 390×844, including
      200% text and image-failure behavior where available; record exact secondary evidence in
      `DEMO_RUNBOOK.md`
- [x] T018 Run focused Vitest, `npm run typecheck`, `npm run lint`, `npm run format:check`,
      `npm test`, `npm run build:web`, Expo dependency alignment, asset checksums,
      `git diff --check`, and a scoped secret scan; record exact outcomes in `DEMO_RUNBOOK.md`
- [x] T019 Re-check the constitution and UI contract, mark completed tasks in
      `specs/009-access-family-portraits/tasks.md`, update Feature 009 status in
      `TEAM_OWNERSHIP.md`, and keep physical Android plus named Arabic/UAE, Emirati cultural,
      safeguarding, accessibility, visual, and image-rights reviews truthfully `NOT RUN` unless
      directly evidenced

---

## Dependencies and Execution Order

- T001–T003 establish scope and the RED boundary.
- T004–T008 deliver the standalone Welcome/Child visual story.
- T009–T011 deliver the standalone shared Parent visual story.
- T012–T015 depend on both generated-source boundaries and protect the combined offline/access
  contract.
- T016 must be satisfied immediately before runtime UI editing and again at the mechanical finish;
  T017–T019 require all runtime work to be complete.

## Parallel Opportunities

- T004 and T009 own separate generated-asset directories and can be prepared independently after
  T003; this implementation keeps generation sequential for deliberate visual inspection.
- T014 owns documentation and can proceed after the final component contract while runtime
  regression T015 runs.
- No overlapping writes are delegated; `/root` remains the only writer for the reserved boundary.

## Implementation Strategy

1. Establish one failing contract suite for every requested screen and asset.
2. Deliver Child access plus Welcome geometry as the first judge-visible increment.
3. Deliver the shared Parent composition without touching any Parent route behavior.
4. Add only destination preloading and prove access/session/reset isolation.
5. Validate compact bilingual crops and the full deterministic repository path.
6. Record prompts, hashes, checks, and explicit evidence gaps before integration handoff.
