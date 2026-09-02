# Tasks: Family Growth Garden

**Input**: Design documents from `specs/003-family-growth-garden/`

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, and
`quickstart.md`

**Tests**: Feature 003 explicitly requires focused lifecycle, reward, privacy, assistant, reset,
localization, route, and end-to-end flow tests. Each implementation phase therefore begins with a
test and a recorded RED gate before the corresponding production files are changed.

**Organization**: Tasks are grouped by user story. File reservations in `TEAM_OWNERSHIP.md` are
mandatory: one writing owner controls a file boundary at a time, and shared store, registry, i18n,
token, route, test, and runbook files are edited only in the sequence below.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: May run in parallel after its stated prerequisites because it owns different files.
- **[Story]**: Maps the task to a user story in `spec.md`.
- Every task names its exact file or directory boundary.

## Phase 1: Setup and Quality Gates

**Purpose**: Preserve the historical baseline, establish exclusive ownership, audit the inherited
design/assets, and pass the Spec Kit pre-implementation gates without changing dependencies.

- [x] T001 Record the Feature 003 integration window, exact agent/member reservations, dirty-worktree preservation notes, and boundary-release protocol in `TEAM_OWNERSHIP.md`
- [x] T002 Inventory the Feature 002 routes, tests, documentation, screenshots, and open Android/human gates without modifying them, and record the preservation baseline in `specs/003-family-growth-garden/checklists/feature-002-preservation.md`
- [x] T003 Verify the existing Expo dependencies and scripts cover Feature 003 without changing `package.json` or `package-lock.json`, and record the no-dependency decision and baseline command results in `specs/003-family-growth-garden/checklists/implementation-baseline.md`
- [x] T004 [P] Run the Impeccable and Expo Design System audits against `app/**`, `src/components/**`, and `src/design/tokens.ts`, then record token drift, component gaps, Arabic/RTL risks, anti-slop findings, and approved remediation boundaries in `specs/003-family-growth-garden/checklists/design-audit.md`
- [x] T005 [P] Inspect the prepared recycling image for prohibited people, hands, brands, private text, hazards, watermarks, and metadata, then finalize its provenance and accessibility record in `assets/images/fixture-recycling-clean-v1.md` for `assets/images/fixture-recycling-clean-v1.png`
- [x] T006 [P] Register the prepared Arabic plan-audio fixture and document its canonical transcript, synthetic/prepared origin, optionality, Parent visibility, and missing-binary fallback in `assets/audio/fixture-salem-plan-ar-v1.md`; add `assets/audio/fixture-salem-plan-ar-v1.mp3` only if a reviewed synthetic source exists and its ownership/creation/metadata checks pass
- [x] T007 Independently evaluate the P0 implementation-requirements checklist in `specs/003-family-growth-garden/checklists/p0-implementation-readiness.md`, resolving every specification-quality failure before implementation
- [x] T008 Run Spec Kit cross-artifact analysis across `specs/003-family-growth-garden/spec.md`, `specs/003-family-growth-garden/plan.md`, and `specs/003-family-growth-garden/tasks.md`, and resolve every P0-critical inconsistency in the owning artifact before Phase 2

**Checkpoint**: Feature 002 is preserved, ownership is exclusive, the approved design direction has
an actionable audit, asset origins are traceable, dependencies remain unchanged, and Spec Kit
quality gates have no unresolved P0 finding.

---

## Phase 2: Foundational Domain, Contracts, Design System, and RED-to-GREEN Spine

**Purpose**: Build the shared Feature 003 types, deterministic providers, pure policies, session,
bilingual resources, and reusable UI primitives that block every user story.

**CRITICAL**: T009–T016 are authored before any Feature 003 production implementation. T017 must
confirm that they fail for the intended missing behavior, not because of a broken test harness.

### Foundational tests — write first

- [x] T009 [P] Add failing tests for every valid/invalid lifecycle transition, separate `chosen` and `in_progress`, wrong-Child guards, optional media/reflection, permitted help, retry without loss, and no early reward in `tests/task-lifecycle.test.ts`
- [x] T010 [P] Add failing tests for the five allowed recognition/phase rows, all invalid pairings, award allowlist, recurrence rules, help-preserved awards, future-only third fade-first review, and ledger-first duplicate no-ops in `tests/reward-matrix.test.ts`
- [x] T011 [P] Add failing tests for all eight category mappings, five tracks, threshold and near-threshold values at 0/20/60/120/200, monotonic growth, the exact Mangrove 48-to-60 transition, safe hot-gahwa/hazard exclusions, food/body nonpunitive rules, faith/affection recognition-only defaults, and multiple approved cultural-phrase options in `tests/garden-progression.test.ts` and `tests/task-catalog.test.ts`
- [x] T012 [P] Add failing tests proving privacy filtering precedes every shared mutation; the strict minimal projection context rejects unknown identity, Seed, task, media, reflection, assistant, note, timestamp, sensitive, non-Green, and invalid-pairing fields before mutation; and ledger-first duplicates bypass projection entirely in `tests/privacy-projection.test.ts`
- [x] T013 [P] Add failing tests for Parent Guide and Child Coach intent allowlists, pure age-policy rules for every supported age band while P0 service requests remain `9_11`, active-task/version binding, prohibited output classes, retained Parent input, bounded summary correction/revalidation, prepared-only Child mode, timeout/failure/schema/safety fallback, and missing-media fallbacks in `tests/assistant-safety.test.ts`
- [x] T014 [P] Rewrite reset and state tests for the exact schema-versioned Arabic Parent/Salem baseline; every named draft, assistant, prepared-media selected/removed/unavailable, lifecycle, celebration available/consumed, garden, and circle source state; atomic recognition; exact four-counter delta; five duplicate no-ops; and no partial counter setters in `tests/prototype-state.test.ts`
- [x] T015 [P] Add failing Arabic/English resource-key parity, canonical Arabic fixture stability, mixed-script value, prohibited-claim, and prepared-origin-label tests in `tests/localization-parity.test.ts`
- [x] T016 [P] Rewrite the deterministic store-flow test for five external-service-denied Parent-to-Child-to-recognition-to-circle cycles and same-attempt fallbacks in `tests/mock-core-flow.test.ts`
- [x] T017 Run the focused T009–T016 test files, verify each new behavior is RED for the intended missing Feature 003 implementation, and record commands/failure reasons in `specs/003-family-growth-garden/checklists/red-green-evidence.md` before touching T018–T035

### Foundational implementation

- [x] T018 Define the strict Feature 003 scalar, household, Child, category, task, lifecycle, immutable receipt/attempt, minimal projection-context, assistant, media, route, and schema-versioned session types in `src/models/familyGrowth.ts`, keeping router state outside the aggregate, then migrate shared exports in `src/models/prototype.ts`
- [x] T019 [P] Encode the synthetic Al Noor household, Salem/Alya profiles, all eight categories, five landscape mappings, GI01 distinction, two display-only choices, and exact P0 task with canonical bilingual safety copy in `src/features/tasks/demoContent.ts`
- [x] T020 [P] Register the four exact prepared fixture identifiers, Parent Guide/Coach/summary content, image description, audio transcript, optionality, visibility, removal, and fallback metadata in `src/services/mock/fixtures.ts`
- [x] T021 Implement strict task validation, recurrence/sharing guards, and pure `draft → reviewed → assigned → chosen → in_progress → submitted → retry | confirmed → recognized` transitions in `src/features/tasks/validation.ts` and `src/features/tasks/lifecycle.ts`
- [x] T022 [P] Implement fixed award validation, recognition/phase policy, no-loss/help rules, idempotency-key derivation, and future-only fade-first phase review in `src/features/rewards/policy.ts`
- [x] T023 [P] Implement deterministic stage/next-threshold calculation and symbolic monotonic landscape growth in `src/features/garden/progression.ts`
- [x] T024 [P] Implement deny-by-default household/circle DTO construction and privacy-before-projection validation in `src/features/circle/projection.ts`
- [x] T025 [P] Implement Parent/Child intent validation, all-band pure age policies with P0 `9_11` request enforcement, prohibited-output checks, bounded Parent-summary correction/revalidation, disclosure validation, and deterministic fallback decisions in `src/features/assistants/policy.ts`
- [x] T026 Define provider-neutral task, recognition, garden, projection, assistant, media, and prototype-session contracts using the existing `ServiceResult` envelope in `src/services/interfaces/index.ts`
- [x] T027 Implement deterministic local task, recognition, garden, projection, prepared-assistant, media, and reset providers without network or permission calls in `src/services/mock/index.ts`
- [x] T028 Wire only deterministic Feature 003 services through the central registry, with no live adapter, provider SDK, client secret, or Feature 002 parallel source, in `src/services/index.ts`
- [x] T029 Implement the schema-versioned Zustand aggregate without duplicated route state, canonical factory/reset, route-safe role/locale state, guarded application commands, observable `praise_presented` state requiring a distinct later Parent continuation, immutable receipt/attempt semantics, and atomic ledger-first recognition commit in `src/state/usePrototypeStore.ts`
- [x] T030 [P] Replace Feature 002 user-facing resources with complete Arabic-first/English-equivalent Feature 003 route, safety, privacy, reward, assistant, reset, error, and disclosure copy in `src/i18n/resources.ts` and preserve locale utilities in `src/i18n/index.ts`
- [x] T031 [P] Synchronize mangrove/water/coral roles, type ramp, 20dp phone padding, radii, 48dp targets, and 120/220/650ms motion values to the approved contract in `src/design/tokens.ts`
- [x] T032 Build token-only safe-area screen, typography, button busy/disabled/pressed/focus states, logical journey header, language switch, origin disclosure, and reset-confirmation primitives in `src/components/primitives.tsx`, `src/components/journey.tsx`, `src/components/LanguageSwitcher.tsx`, and `src/components/prototype.tsx`
- [x] T033 [P] Build reusable task choice, definition-of-done, task steps, safety boundary, recognition, praise editor, retry, and future-phase-review panels in `src/components/family-growth/TaskPanels.tsx`
- [x] T034 [P] Build bounded assistant trigger/sheet, prepared media with transcript/description/removal, trusted-adult exit, and Parent summary components in `src/components/family-growth/AssistantPanels.tsx`, `src/components/family-growth/PreparedMedia.tsx`, and `src/components/demoAssets.ts`
- [x] T035 [P] Build code-native static five-stage landscape tracks, Mangrove emphasis, combined Ghaf canopy, household contribution, and privacy-safe circle progress in `src/components/family-growth/GardenLandscape.tsx`, `src/components/family-growth/FamilyCanopy.tsx`, and `src/components/family-growth/CircleProgress.tsx`
- [x] T036 Run T009–T016 again, fix only the owning production boundaries until the focused suite is GREEN, and append exact results to `specs/003-family-growth-garden/checklists/red-green-evidence.md`

**Checkpoint**: The domain and deterministic provider path are testable without React Native;
shared UI and i18n contracts are ready; no route can calculate a reward or shared projection.

---

## Phase 3: User Story 1 — Parent Approves a Safe, Useful Task (Priority: P1)

**Goal**: The Parent selects Salem and the P0 task, sees a prepared bounded refinement without
losing original text, reviews every bilingual safety/privacy/reward field, and approves one
assignment with zero reward or shared growth.

**Independent Test**: Starting from the reset Parent overview, create the P0 task, exercise Accept
suggestion and Keep mine, validate the full bilingual review, approve once, and prove that only an
assignment was created.

### Tests for User Story 1 — write and prove RED first

- [x] T037 [US1] Add failing Parent task-flow tests for category/template selection, original-versus-suggestion state, required-field blocking, exact bilingual task/safety values, explicit approval, one executable choice, and zero counter changes in `tests/parent-task-flow.test.ts`
- [ ] T038 [US1] Run `tests/parent-task-flow.test.ts`, confirm RED for missing US1 commands/routes rather than harness failure, and append the command/failures to `specs/003-family-growth-garden/checklists/red-green-evidence.md`

### Implementation for User Story 1

- [x] T039 [US1] Add Parent draft, prepared Guide request/fallback, accept/keep/make-smaller, review, and explicit assignment commands with stale-attempt guards in `src/state/usePrototypeStore.ts`
- [x] T040 [P] [US1] Build the curated category/template selector, original-versus-suggestion comparison, explicit Guide intents, validation feedback, and fixed reward preview in `src/components/family-growth/ParentTaskComposer.tsx`
- [x] T041 [US1] Replace the Parent landing route with a safe cooperative overview shell and one dominant create-task action in `app/parent/index.tsx`
- [x] T042 [US1] Implement Child/category/template selection, bounded prepared Guide states, retained Parent input, and review navigation in `app/parent/task/new.tsx`
- [x] T043 [US1] Implement Arabic-first/English-second uncollapsed task, safety, privacy, recognition, phase, recurrence, landscape, and assignment review with role/prerequisite guards in `app/parent/task/review.tsx`
- [x] T044 [US1] Run the US1 test GREEN and manually verify `/parent → /parent/task/new → /parent/task/review` in both locales with counters fixed at 48, 48/60, 19/25, and 11/12, recording proxy evidence in `specs/003-family-growth-garden/checklists/story-evidence.md`

**Checkpoint**: One safe Salem assignment exists; no Seed, landscape, canopy, or circle counter has
changed.

---

## Phase 4: User Story 2 — Child Chooses and Completes with Bounded Help (Priority: P1)

**Goal**: Salem deliberately chooses and starts the approved task as separate transitions, uses
only prepared bounded coaching, may omit/remove optional media and reflection, and submits with no
reward.

**Independent Test**: From the approved US1 assignment, choose it, start it separately, invoke a
Coach intent and trusted-adult exit, complete with permitted help and no media/reflection, and
submit with all four counters unchanged.

### Tests for User Story 2 — write and prove RED first

- [x] T045 [US2] Add failing Child-flow tests for two display-only choices plus one executable choice, wrong-profile guards, separate choose/start, task-version binding, Coach allowlists, optional media/reflection, permitted help, neutral submission, and no early reward in `tests/child-task-flow.test.ts`
- [ ] T046 [US2] Run `tests/child-task-flow.test.ts`, confirm RED for missing US2 commands/routes, and append the command/failures to `specs/003-family-growth-garden/checklists/red-green-evidence.md`

### Implementation for User Story 2

- [x] T047 [US2] Add display-only choice guards, deliberate choose/start, prepared Coach, media attach/remove/fallback, optional reflection, permitted-help, adult-exit, and submit commands in `src/state/usePrototypeStore.ts`
- [x] T048 [P] [US2] Implement Salem's two-to-three Parent-approved choices, own-goal progress, shared canopy preview, fixed award/help/meaning/landscape labels, and smaller-task request in `app/child/index.tsx`
- [x] T049 [US2] Implement unchanged definition of done, at most four steps, structured Coach intents, visible AI/adult disclosures, optional prepared image/audio/reflection, Parent-visibility notice, and submit action in `app/child/task.tsx`
- [x] T050 [US2] Run the US2 test GREEN and manually verify choose remains `chosen`, open/start becomes `in_progress`, missing media uses description/transcript, and submission keeps the reset counters unchanged, recording results in `specs/003-family-growth-garden/checklists/story-evidence.md`

**Checkpoint**: A valid submission awaits Parent review; the reward ledger and all persistent/shared
counters remain at reset values.

---

## Phase 5: User Story 3 — Parent Recognizes, Retries, or Confirms Once (Priority: P1)

**Goal**: The Parent sees separated observable information, can return work kindly without loss,
edits action-specific praise, confirms only after praise is presented, and cannot duplicate a
recognition consequence.

**Independent Test**: Exercise kind retry and resume, resubmit with help, plan confirmation, present
praise, apply recognition once, and repeat the visible confirmation five times.

### Tests for User Story 3 — write and prove RED first

- [x] T051 [US3] Add failing check-in tests for separated facts/help/media/reflection/uncertainty, no-loss retry/resume, prospective smaller/equivalent paths, descriptive praise validation, an observable rendered-praise phase followed by a distinct continuation event, an immutable exact first receipt with separate attempt status, future-phase prompt, recognized-route access, and five duplicate no-ops in `tests/parent-check-in-flow.test.ts`
- [ ] T052 [US3] Run `tests/parent-check-in-flow.test.ts`, confirm RED for missing US3 commands/routes, and append the command/failures to `specs/003-family-growth-garden/checklists/red-green-evidence.md`

### Implementation for User Story 3

- [x] T053 [US3] Add kind-retry/resume, prospective smaller/equivalent draft, praise editing, confirmation planning, explicit praise-presentation state, distinct later recognition application, immutable attempt results, and already-confirmed commands in `src/state/usePrototypeStore.ts`
- [x] T054 [P] [US3] Build check-in fact groups, editable descriptive praise, nonpunitive retry/equivalent controls, a visibly rendered praise step with a separate Parent continuation control, neutral duplicate message, and unselected future-phase review in `src/components/family-growth/ParentCheckIn.tsx`
- [x] T055 [US3] Implement Parent-only prerequisite guards for submitted, pending-confirmation, and matching-ledger recognized states; observable submission review; retry paths; a rendered praise-first confirmation step; a separate-event atomic recognition; and neutral duplicate-only state in `app/parent/check-in.tsx`
- [x] T056 [US3] Run the US3 test GREEN; verify retry preserves all prior progress and five repeat confirmations duplicate no transaction, growth, leaf, event, announcement, milestone, or celebration; record results in `specs/003-family-growth-garden/checklists/story-evidence.md`

**Checkpoint**: Exactly one recognition receipt exists for the submission; duplicate confirmation
is a neutral no-op.

---

## Phase 6: User Story 4 — Confirmed Action Grows the Right Shared Surfaces (Priority: P1)

**Goal**: The valid confirmed Green Impact task renders exact Salem/Mangrove/canopy/circle values,
with privacy-safe coarse sharing and a complete static/reduced-motion meaning.

**Independent Test**: Render the one valid recognition result, verify the four post-values, then
attempt private, non-Green, sensitive, identity-bearing, Seed-bearing, invalid, and duplicate
projections without changing shared state.

### Tests for User Story 4 — write and prove RED first

- [x] T057 [US4] Add failing garden/circle integration tests for exact post-confirmation counters, static/reduced-motion equality, one coarse Green action, projection rejection before mutation, symbolic-only claims, and direct-entry no-mutation guards in `tests/garden-circle-flow.test.ts`
- [ ] T058 [US4] Run `tests/garden-circle-flow.test.ts`, confirm RED for missing US4 route/render integration, and append the command/failures to `specs/003-family-growth-garden/checklists/red-green-evidence.md`

### Implementation for User Story 4

- [x] T059 [P] [US4] Implement the five connected UAE tracks, exact Shoot-to-Sapling consequence, one canopy leaf, cause/meaning copy, symbolic-only disclosure, and circle next action in `app/garden.tsx`
- [x] T060 [P] [US4] Implement seeded cooperative 12-action progress, one coarse eligible household action, synthetic/local and privacy disclosures, no rankings/profile grid/social controls, and finish/reset actions in `app/circle.tsx`
- [x] T061 [US4] Add the restrained praise-to-Seed-to-Mangrove 650ms cause/effect sequence, immediate reduced-motion final state, and once-only stage/circle announcements in `src/components/family-growth/GardenLandscape.tsx`
- [x] T062 [US4] Run the US4 test GREEN and manually verify exact 60 Seeds, 60/60 Sapling, 20/25 leaves, and 12/12 actions with no unsupported impact or planted-tree claim, recording results in `specs/003-family-growth-garden/checklists/story-evidence.md`

**Checkpoint**: The emotional payoff is complete, deterministic, privacy-filtered, and legible
without motion, sound, or color.

---

## Phase 7: User Story 6 — Operator Resets and Demonstrates Offline in Both Languages (Priority: P1)

**Goal**: The operator can enter through the bilingual disclosure and role selector, complete the
same guarded ten-route flow offline, and reset atomically from every meaningful state with no stale
history.

**Independent Test**: Deny external services, complete Arabic and English cycles, exercise guarded
deep links, reset from each meaningful state, and prove that only the ten approved product routes
remain.

### Tests for User Story 6 — write and prove RED first

- [x] T063 [US6] Add failing operator tests for exact ten-route inventory, role/deep-link guards including submitted/pending/recognized check-in access, safe locale switching, every reset source state, no duplicated or stale route state, five offline cycles, prepared fallback reasons, missing fixtures, and legacy-route absence in `tests/operator-demo-flow.test.ts`
- [ ] T064 [US6] Run `tests/operator-demo-flow.test.ts`, confirm RED for missing US6 entry/navigation/reset/retirement behavior, and append the command/failures to `specs/003-family-growth-garden/checklists/red-green-evidence.md`

### Implementation for User Story 6

- [x] T065 [P] [US6] Replace entry with Arabic-first Ghaf identity, UAE landscape cue, language selection, point-of-use synthetic/prepared disclosures, reload limitation, and one dominant enter action in `app/index.tsx`
- [x] T066 [P] [US6] Replace role selection with Parent/Child demo modes, synthetic Salem/Alya selection, not-authentication copy, and private-Parent-content disclosure in `app/role.tsx`
- [x] T067 [US6] Implement the root route shell, logical transitions, safe role/prerequisite guards, locale-preserving navigation, Parent-only reset confirmation, history replacement to Arabic `/`, stale-Back prevention, and enabled Android predictive Back in `app/_layout.tsx`, `src/utils/navigation.ts`, and `app.config.ts`
- [x] T068 [US6] Add deterministic same-attempt timeout/failure/malformed/safety-rejection and missing-image/audio/circle fallbacks that retain current input and lifecycle in `src/state/usePrototypeStore.ts` and `src/services/mock/index.ts`
- [x] T069 [US6] Verify all ten replacements resolve and the store-flow smoke test passes, then remove only `app/parent/create.tsx`, `app/parent/generating.tsx`, `app/parent/review.tsx`, `app/child/mission.tsx`, `app/parent/confirmation.tsx`, and `app/celebration.tsx`
- [x] T070 [US6] Run the US6 test GREEN, enumerate `app/**/*.tsx` to prove exactly ten product routes, execute five automated external-service-denied cycles and reset trials from every named FR-095 source state, and record results in `specs/003-family-growth-garden/checklists/story-evidence.md`
- [x] T071 [US6] Walk all ten routes in Arabic RTL and English LTR on the web proxy, verify equivalent decisions/copy/direction and browser-history reset while labeling native-only claims unverified, and record evidence in `specs/003-family-growth-garden/checklists/web-proxy.md`

**Checkpoint**: The complete deterministic competition path works in both locales without any
external service; route inventory contains only the approved ten routes.

---

## Phase 8: User Story 5 — Parent Sees Cooperative Progress, Not Surveillance (Priority: P2)

**Goal**: The Parent sees one combined canopy, useful next actions/support, and a correctable
strengths-first seven-day summary with no sibling ranking, diagnosis, or leaked sensitive content.

**Independent Test**: Inspect the Parent overview and prepared summary, validate its fact/
uncertainty/question/adjustment structure, and inject every prohibited summary/join field to prove
fallback and exclusion.

### Tests for User Story 5 — write and prove RED first

- [x] T072 [US5] Add failing overview tests for one combined canopy, no side-by-side raw totals/rank/pace, Child next actions/support, exact prepared seven-day summary shape, bounded local Parent fact correction, revalidation, prohibited-language fallback, and private-field exclusion in `tests/parent-overview.test.ts`
- [ ] T073 [US5] Run `tests/parent-overview.test.ts`, confirm RED for missing US5 overview/summary behavior, and append the command/failures to `specs/003-family-growth-garden/checklists/red-green-evidence.md`

### Implementation for User Story 5

- [x] T074 [P] [US5] Implement the exact prepared seven-day summary, strict structured validation, bounded local correction of synthetic fact fields, post-correction revalidation, and prohibited-language fallback in `src/services/mock/index.ts` and `src/features/assistants/policy.ts`
- [x] T075 [P] [US5] Build the time-window, strengths, observable facts, bounded Parent correction control, uncertainty, open question, adjustment, origin, validation feedback, and non-diagnostic summary presentation in `src/components/family-growth/ParentPatternSummary.tsx`
- [x] T076 [US5] Complete the Parent overview with one combined canopy, cooperative milestone, Salem/Alya next actions and requested support without raw comparison, bounded correctable summary commands, and garden/circle secondary actions in `app/parent/index.tsx`
- [x] T077 [US5] Run the US5 test GREEN and manually scan Parent/household/circle projections for rank, raw sibling totals, sensitive content, diagnostic language, and unsupported inference, recording results in `specs/003-family-growth-garden/checklists/story-evidence.md`

**Checkpoint**: The complete P0 is functionally present; Parent insight remains supportive,
cooperative, synthetic, bounded, and non-diagnostic.

---

## Phase 9: Polish, Acceptance Evidence, Convergence, and Review

**Purpose**: Apply the approved anti-slop direction consistently, retire orphaned Feature 002
implementation code, run every automated/web check, record native/human evidence honestly, converge
against the artifacts, and fix P0-critical review findings.

- [x] T078 Re-run Impeccable and Expo Design System audits across all ten routes and shared components, fix hierarchy/card-stack/token/copy/alignment/component-state drift within `app/**`, `src/components/**`, and `src/design/**`, and update `specs/003-family-growth-garden/checklists/design-audit.md` with before/after findings
- [x] T079 Verify canonical Arabic safety/assistant/praise/summary text, English equivalence, logical RTL/LTR order, mixed scripts, long labels, no translated-fragment concatenation, and resource parity in `src/i18n/resources.ts` and `tests/localization-parity.test.ts`
- [ ] T080 Verify WCAG 2.2 AA text and essential-UI contrast, 48dp targets, 8dp adjacent spacing, 200% font-scale resilience, keyboard-safe actions, roles/states/hints, bottom-sheet reading order, visible media alternatives, once-only announcements, and reduced-motion static outcomes in `src/components/**` and `app/**`
- [x] T081 Remove orphaned Feature 002 food-rescue UI/domain imports and tests only after replacement coverage passes in `src/components/MissionGenerationExperience.tsx`, `src/features/missions/**`, `src/features/impact/**`, `src/features/ghaf-tree/**`, `tests/mission-lifecycle.test.ts`, `tests/impact-idempotency.test.ts`, and `tests/ghaf-progress.test.ts`, while leaving `specs/001-*`, `specs/002-*`, `docs/**`, and historical screenshots untouched
- [x] T082 Scan `app/**`, `src/**`, `assets/**`, `app.config.ts`, and `package.json` for secrets, network clients, camera/microphone/background capture, real Child data, unrestricted chat, prohibited claims, hard-coded duplicate user copy, and legacy route references; fix every in-scope violation and record the scan in `specs/003-family-growth-garden/checklists/source-scan.md`
- [x] T083 Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`, `npx expo install --check`, `npx expo config --type public`, `npx expo export --platform web --output-dir dist`, `git diff --check`, `git diff --stat`, and `git status --short`, fixing in-scope failures and recording exact worktree/date/results in `DEMO_RUNBOOK.md`
- [x] T084 Validate every P0 route and meaningful assistant/retry/confirmation/garden/circle state on the static web build, inspect console and responsive Arabic/English layouts, verify reset and five duplicate confirmations, and record only web-proxy evidence in `DEMO_RUNBOOK.md`
- [x] T085 Attempt the named physical Android Arabic/English journey, enabled predictive Back/reset, WCAG 2.2 AA contrast, keyboard, prepared media, offline mode, reduced motion, screen reader, touch targets, and 200% font scale; record direct evidence in `DEMO_RUNBOOK.md`, or preserve `BLOCKED`/`NOT RUN` with the exact missing build/device instead of inferring a pass
- [ ] T086 Conduct or schedule the five timed rehearsals, three-person comprehension exercise, and named fluent Arabic/UAE culture, faith, safeguarding, sustainability, and accessibility reviews; record only observed results in `DEMO_RUNBOOK.md`, using `NOT RUN` before an attempt and `BLOCKED` only after an attempted gate cannot proceed because its named reviewer/build/device dependency is unavailable
- [x] T087 Re-evaluate every requirements-quality item in `specs/003-family-growth-garden/checklists/p0-implementation-readiness.md` after implementation/convergence, resolve any artifact-traceability regression, and keep runtime/native/human statuses exclusively in `DEMO_RUNBOOK.md` rather than treating checklist markers as behavior evidence
- [x] T088 Run Spec Kit convergence against `specs/003-family-growth-garden/spec.md`, `specs/003-family-growth-garden/plan.md`, and `specs/003-family-growth-garden/tasks.md`; append dependency-ordered tasks for any unbuilt P0 gap and complete those tasks before final review
- [x] T089 Run a fresh code review against `CODEX_IMPLEMENTATION_PROMPT.md`, `specs/003-family-growth-garden/contracts/acceptance-contract.md`, and `DEMO_RUNBOOK.md` plus a fresh Impeccable finish review of all ten routes; fix every P0-critical correctness, privacy, safety, RTL, accessibility, or design finding in its owning file boundary
- [x] T090 Re-run the complete T083 command set and exact reset/route/duplicate/offline checks, update final evidence and remaining blockers in `DEMO_RUNBOOK.md`, and release implementation boundaries with the final changed-files/checks/gaps handoff in `TEAM_OWNERSHIP.md`

---

## Requirement and Outcome Traceability

Every Feature 003 requirement and success criterion has at least one implementation, test,
integration, or evidence task. A task that records `BLOCKED` or `NOT RUN` still satisfies the
traceability obligation; it does not satisfy the underlying native or human outcome.

| Requirement / outcome range                                                                                            | Primary task coverage                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| FR-001–FR-010 — historical boundary, exact scope, capability truth, synthetic/offline/prepared AI                      | T002–T003, T008, T013, T016, T018–T020, T025, T027–T029, T063–T071, T082–T090                             |
| FR-011–FR-017 — entry, role, household overview, non-surveillant summary                                               | T015, T030–T035, T041, T065–T067, T072–T080, T083–T089                                                    |
| FR-018–FR-029 — category catalog, P0 task, bounded drafting/review/assignment, zero early reward                       | T009–T013, T018–T029, T030–T034, T037–T044, T079, T082–T084                                               |
| FR-030–FR-040 — Child choices, separate choose/start, bounded Coach, optional media/reflection, zero-reward submission | T009, T013–T016, T018–T021, T025–T030, T033–T035, T045–T050, T063–T071, T079–T084                         |
| FR-041–FR-055 — check-in, retry/equivalent, praise-first idempotent recognition, reward/phase matrix                   | T009–T010, T014, T018, T021–T029, T033, T051–T056, T063, T070, T079–T084, T089–T090                       |
| FR-056–FR-070 — five-stage garden, symbolic claims, privacy-first canopy/circle projection                             | T010–T012, T014–T016, T018–T024, T027–T029, T035, T057–T062, T070–T071, T077–T084, T089–T090              |
| FR-071–FR-081 — exact assistant/media fixtures, prepared-only Coach, safety/fallback/secret boundary                   | T003, T005–T006, T013, T015–T016, T018–T020, T025–T030, T034, T037–T050, T063, T068, T079–T085, T089–T090 |
| FR-082–FR-098 — task safety, culture, bilingual RTL, accessibility, exact reset/duplicate behavior                     | T004–T006, T009–T016, T018–T035, T037–T071, T079–T090                                                     |
| SC-001 — exact ten routes and legacy retirement                                                                        | T063–T071, T081–T084, T088–T090                                                                           |
| SC-002–SC-005 — five offline cycles/resets, exact one-time consequence, no early reward                                | T009–T010, T014, T016–T017, T021–T029, T036–T071, T083–T090                                               |
| SC-006–SC-008 — reward matrix, stages/category mapping, projection rejection                                           | T010–T012, T017–T024, T027–T029, T036, T051–T062, T077, T082–T090                                         |
| SC-009–SC-011 — point-of-use origins, bounded Coach, safe Parent summary                                               | T005–T006, T013, T015–T020, T025–T030, T034, T036–T050, T068, T072–T084, T089–T090                        |
| SC-012–SC-013 — bilingual physical journey and native accessibility                                                    | T004, T015, T030–T035, T044, T050, T056, T062, T065–T071, T078–T080, T083–T085, T089–T090                 |
| SC-014–SC-017 — rehearsals, comprehension, prohibited claims, named reviews                                            | T002, T004–T006, T071, T077–T086, T089–T090                                                               |
| SC-018 — optional live Parent AI truth and secure-boundary gate                                                        | T003, T008, T013, T016, T025–T029, T068, T082–T086, T089–T090                                             |

The traceability ranges above are complemented by each story's independent-test statement and by
the executable assertions in `contracts/acceptance-contract.md`.

## Dependencies and Execution Order

### Phase Dependencies

- **Phase 1 — Setup**: Starts immediately. T007 and T008 must pass before implementation.
- **Phase 2 — Foundation**: Depends on Phase 1. T009–T016 may be authored in parallel; T017 is a
  hard RED gate; T018 releases shared types before policies/providers/store/UI consume them.
- **US1**: Depends on Phase 2 and creates the sole executable assignment.
- **US2**: Depends on US1 because the Child must receive a Parent-approved assignment.
- **US3**: Depends on US2 because check-in requires a valid submission.
- **US4**: Depends on US3 because growth and circle consequences require one valid recognition.
- **US6**: Depends on US1–US4 because it integrates the complete guarded ten-route offline journey
  and retires legacy routes only after replacements pass.
- **US5**: Depends on Phase 2 and the US1 Parent shell; it is sequenced after US6 to avoid concurrent
  edits to `app/parent/index.tsx` and to preserve the complete P1 spine.
- **Phase 9 — Polish**: Depends on all six stories. T088 may append work; T089 and T090 cannot begin
  until appended P0 tasks are complete.

### Within Every Story

1. Author the named story test.
2. Run it and record an intentional RED result.
3. Release its test file boundary before production implementation starts.
4. Implement pure/store behavior before route integration.
5. Run the story test GREEN and record the independent scenario.
6. Release every file boundary before the next owner edits a shared file.

### Parallel Opportunities

- T004–T006 own independent audit/asset files and may run together.
- T009–T016 own independent test files and may run together before the single T017 RED gate.
- After T018 releases types, T019/T020, T022–T025, T030, and T031 own disjoint boundaries.
- T033–T035 own disjoint shared-component files after tokens/primitives stabilize.
- Within US1, T040 can proceed while the route owner prepares T041 after T039 releases store types.
- Within US4, `/garden` and `/circle` route files may be implemented in parallel after shared
  projections are released.
- Within US6, entry and role routes may be implemented in parallel before the root navigation
  integration window.
- Within US5, summary provider policy and summary presentation own different files, but the policy
  owner must release `src/features/assistants/policy.ts` before any later review fix touches it.
- Native/human evidence collection may run in parallel with read-only final review, but no reviewer
  may mark an unavailable gate passed.

---

## Parallel Examples

### Foundation test batch

```text
Task: T009 — tests/task-lifecycle.test.ts
Task: T010 — tests/reward-matrix.test.ts
Task: T011 — tests/garden-progression.test.ts
Task: T012 — tests/privacy-projection.test.ts
Task: T013 — tests/assistant-safety.test.ts
Task: T014 — tests/prototype-state.test.ts
Task: T015 — tests/localization-parity.test.ts
Task: T016 — tests/mock-core-flow.test.ts
```

### Released policy batch

```text
Task: T022 — src/features/rewards/policy.ts
Task: T023 — src/features/garden/progression.ts
Task: T024 — src/features/circle/projection.ts
Task: T025 — src/features/assistants/policy.ts
Task: T030 — src/i18n/resources.ts and src/i18n/index.ts
Task: T031 — src/design/tokens.ts
```

### Growth-route batch

```text
Task: T059 — app/garden.tsx
Task: T060 — app/circle.tsx
```

---

## Implementation Strategy

### Deterministic Spine First

1. Complete Setup and pass the Spec Kit/artifact gates.
2. Write all shared policy/state tests and prove RED.
3. Implement the pure deterministic foundation and prove GREEN.
4. Deliver US1 → US2 → US3 → US4 as the smallest complete Parent/Child/recognition/growth spine.
5. Integrate US6 to make the spine bilingual, offline, resettable, guarded, and exactly ten routes.
6. Complete US5 so the required Parent overview/summary is cooperative and non-surveillant.
7. Polish, validate, converge, and review; fix every P0-critical finding.

### P0 Scope

US1 alone is an early integration checkpoint, not the Feature 003 MVP. The approved competition P0
requires all six user stories because the judge journey includes Parent approval, Child choice,
confirmation, garden/circle projection, bilingual offline reset, and the Parent summary. Optional
live Parent AI, a live Child Coach, real media, accounts, networking, persistence, impact conversion,
and any eleventh route remain outside this task list.

### Evidence Discipline

- Automated and web checks may become `PASSED` only with exact current-worktree evidence.
- Physical Android stays `BLOCKED` until a named build/device is exercised.
- Native accessibility/media/Back/keyboard checks and human/cultural reviews stay `NOT RUN` until
  directly observed.
- Prepared, synthetic, symbolic, blocked, future, and live capabilities retain honest point-of-use
  labels.
- No task in this list authorizes a commit, push, merge, deployment, dependency change, or history
  rewrite.

## Notes

- `[P]` always means a disjoint write boundary after shared prerequisites are released; it never
  permits two writers in one route, store, registry, i18n, token, test, asset manifest, or runbook.
- Every task that changes behavior includes an exact file path and a focused verification handoff.
- Legacy Feature 002 implementation routes are removed only at T069; its historical specs,
  runbooks, screenshots, and open acceptance gates remain untouched.
- Assistant, loading, fallback, retry, phase-review, and celebration are in-route states, never
  additional authored routes.
- The deterministic prepared provider is the required path. No remote adapter or client secret is
  needed or authorized.

## Phase 10: Convergence

- [x] T091 CRITICAL add RED-to-GREEN tests and enforce one reviewed Parent-authored positive action for **Keep mine** plus instruction-to-safety cross-validation for custom and Guide wording before review/acceptance in `tests/parent-task-flow.test.ts`, `tests/assistant-safety.test.ts`, `src/features/tasks/validation.ts`, and `src/services/mock/index.ts` per FR-024, FR-025, FR-076, FR-083, and Constitution VII (contradicts)
- [x] T092 CRITICAL replace condition-name denylisting with a bounded observable-fact correction schema that rejects diagnosis/condition conclusions in both locales, add regression coverage for autism/dyslexia and safe observable facts, and preserve prepared fallback in `tests/assistant-safety.test.ts`, `tests/parent-overview.test.ts`, and `src/features/assistants/policy.ts` per FR-016, FR-017, and the Constitution prototype boundary (partial)
- [x] T093 require bilingual Parent praise to reference an observable action, strategy, improvement, or appropriate help-seeking and reject trait-only labels without weakening general assistant safety in `tests/parent-check-in-flow.test.ts` and `src/services/mock/index.ts` per FR-044 (partial)
- [x] T094 collapse confirmation to the specified two visible Parent actions—first validate and render `praise_presented` with zero counters, then apply recognition—while preserving navigation restore, immutable receipt, and five duplicate no-ops in `tests/parent-check-in-flow.test.ts`, `src/state/usePrototypeStore.ts`, and `src/components/family-growth/ParentCheckIn.tsx` per FR-045 and US3/AC4–5 (contradicts)
- [x] T095 implement a bounded pre-acceptance smaller/safe-equivalent negotiation with Parent resolution and explicit Child accept/keep choice, preserving the current assignment, displayed award, no-loss rules, one executable P0 journey, and reset in `tests/child-task-flow.test.ts`, `tests/parent-check-in-flow.test.ts`, `src/models/familyGrowth.ts`, `src/state/usePrototypeStore.ts`, `app/child/index.tsx`, and the existing Parent route state per FR-031 and FR-042 (missing)
- [x] T096 persist confirmed recurrent fade-first counts and an unselected prospective phase review; add apply/reverse commands whose decisions affect future completions only, then wire the UI to store state rather than local-only selection in `tests/reward-matrix.test.ts`, `tests/parent-check-in-flow.test.ts`, `src/models/familyGrowth.ts`, `src/services/mock/index.ts`, `src/state/usePrototypeStore.ts`, and `src/components/family-growth/ParentCheckIn.tsx` per FR-054 and FR-055 (missing)
- [x] T097 render every preview choice's actual mapped landscape and verify the bounded Alya/empty-state behavior without inventing an assignment, rank, or extra executable task in `tests/child-task-flow.test.ts` and `app/child/index.tsx` per FR-030 and the P0 seeded-choice contract (partial)
- [x] T098 show prepared evidence at Parent check-in with its origin, accessible image description or audio transcript, optionality, and private visibility while retaining null-media separation in `tests/parent-check-in-flow.test.ts` and `src/components/family-growth/ParentCheckIn.tsx` per FR-041, FR-071, and FR-094 (partial)
- [x] T099 make kind retry an observable in-route no-loss state followed by an explicit resume action instead of requesting and resuming in one press in `tests/parent-check-in-flow.test.ts` and `src/components/family-growth/ParentCheckIn.tsx` per FR-003, FR-043, and US3/AC2 (partial)
- [x] T100 automatically replace invalid conditional deep links with `/parent/task/new`, `/child`, or `/parent` without exposing private state or creating a transition in `tests/operator-demo-flow.test.ts`, `app/parent/task/review.tsx`, `app/child/task.tsx`, and `app/parent/check-in.tsx` per the Authored Route Contract and FR-003 (partial)
- [x] T101 render the canonical prepared Parent Guide and Child Coach disclosure from the validated fixture/result metadata at each point of use, with Arabic/English parity tests and no duplicate copy source in `tests/localization-parity.test.ts`, `src/components/family-growth/ParentTaskComposer.tsx`, and `app/child/task.tsx` per FR-005, FR-071–073, and SC-009 (partial)
- [x] T102 reconcile the Expo/Router/React Native patch alignment in `package.json` and `package-lock.json` with `npx expo install --check`, then document the measured compatibility change in `specs/003-family-growth-garden/plan.md` and `specs/003-family-growth-garden/checklists/implementation-baseline.md` without adding a new library per plan: dependency decision and Constitution VI (contradicts)

## Phase 11: Professional MVP audit remediation

- [x] T103 reproduce and fail closed on forged/stale recognition links and caller-supplied idempotency keys; derive the key from the active submission and validate the complete assignment/task/Child/version/submission/check-in/plan chain before any private or shared mutation
- [x] T104 make accepted smaller/safe-equivalent proposals coherent reviewed replacement versions that preserve Parent authorship and provenance, update all linked versions atomically, validate before every downstream transition, and complete the full recognized path exactly once
- [x] T105 make Parent Guide comparison a resolved decision state: pending suggestions block conflicting edits/intents/review, acceptance clears the pending record while preserving authorship, and a concise applied confirmation replaces repeated Accept/Keep actions
- [x] T106 derive Child route/actions from lifecycle, place current work before preview-only fixtures, restore resume/submitted/recognized states, and remove false actionable completed states
- [x] T107 sequence Parent drafting through visible prerequisites, style disabled states honestly, remove repeated review-policy records without collapsing required safety, and add explicit assignment handoff context
- [x] T108 reshape Child task and garden composition so the approved contract remains complete while the first action/steps and changed Mangrove are dominant; keep optional evidence progressive and all five tracks visible
- [x] T109 fix logical RTL accents, duplicate copy/accessibility labels, redundant wrappers/actions, and enforce the documented bounded provider timeout with late-result protection
- [x] T110 rerun the full bilingual P0 journey, reset, duplicate recognition, focused adversarial branches, detector, export, type-check, lint, formatting, and complete test suite; record exact before/after evidence without upgrading Android or human gates

## Phase 12: Product Experience Redesign authority and contracts

**Goal**: Reconcile the redesign brief with the constitution and preserve the current P0 before any
new domain behavior is added.

**Independent Test**: The gap matrix classifies every redesign area, the active artifacts describe
the same domain-only boundary, and production/frontend work remains explicitly deferred.

- [x] T111 [P] Record the implemented, partial, missing, conflicting, and deferred redesign capabilities with page-level source mapping and phased disposition in `specs/003-family-growth-garden/redesign-gap-analysis.md`
- [x] T112 Add US7–US10, FR-099–FR-118, SC-019–SC-024, technical decisions, domain entities, service contracts, validation scenarios, capability limits, and exact ownership boundaries in `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `PROTOTYPE_LIMITATIONS.md`, `specs/003-family-growth-garden/spec.md`, `specs/003-family-growth-garden/plan.md`, `specs/003-family-growth-garden/research.md`, `specs/003-family-growth-garden/data-model.md`, `specs/003-family-growth-garden/contracts/domain-contract.md`, and `specs/003-family-growth-garden/quickstart.md`

**Checkpoint**: The existing ten-route P0 and its reset oracle remain unchanged; the redesign is
authorized only as deterministic service/domain work.

---

## Phase 13: User Story 7 — Synthetic Parent and Child Access (Priority: P3)

**Goal**: Demonstrate separate least-privilege local sessions and Parent-gated sensitive changes
without claiming production authentication.

**Independent Test**: Focused tests cover both projections, pairing, revocation, reauthentication,
permissions, and every wrong-actor/purpose/device/expiry/replay path.

- [ ] T113 [P] [US7] Add RED tests for least-privilege Parent/Child projections, expiring one-use pairing, device revocation, scoped reauthentication, and Parent-owned language/voice/media/AI grants in `tests/access-control.test.ts`
- [ ] T114 [P] [US7] Define synthetic principals, separate access sessions/views, capabilities, pairing requests, reauthentication proofs, device state, and Child grants in `src/models/access.ts`
- [ ] T115 [US7] Implement fail-closed deterministic access, pairing, projection, reauthentication, revocation, and permission policies in `src/features/access/index.ts`
- [ ] T116 [US7] Export the synthetic access service through `src/services/interfaces/index.ts`, `src/services/mock/index.ts`, and `src/services/index.ts`, then run `npm test -- tests/access-control.test.ts`

**Checkpoint**: User Story 7 is independently usable from the service facade and has no real
credential, biometric, network, or persistence path.

---

## Phase 14: User Story 8 — Private Family Reward Promise (Priority: P3)

**Goal**: Model a private Parent promise tied only to personal progress, separate from Seeds,
League position, and payment behavior.

**Independent Test**: Every lifecycle/milestone/promise kind passes; protected activity, League
inputs, withdrawal, retroactive edits, cross-Child views, and Seed conversion fail.

- [ ] T117 [P] [US8] Add RED tests for Family Reward plan validation, all milestone kinds, lifecycle idempotency, protected-category exclusion, private projection, prospective edits, and monthly currency totals in `tests/family-reward.test.ts`
- [ ] T118 [P] [US8] Define Family Reward plans, milestones, eligibility events, progress snapshots, private views, revisions, and monthly commitments in `src/models/familyReward.ts`
- [ ] T119 [US8] Implement deterministic plan creation, personal milestone evaluation, monotonic transitions, future-only revision, private projection, and commitment aggregation in `src/features/family-rewards/index.ts`
- [ ] T120 [US8] Export the Family Reward service through `src/services/interfaces/index.ts`, `src/services/mock/index.ts`, and `src/services/index.ts`, then run `npm test -- tests/family-reward.test.ts`

**Checkpoint**: User Story 8 is independently usable and exposes no payment, wallet, custody,
exchange-rate, rank, or public-reward operation.

---

## Phase 15: User Story 9 — Fair Synthetic Weekly Challenge (Priority: P3)

**Goal**: Add a bounded five-Leaf synthetic League with normalized weekly results and a cooperative
goal while keeping the Green Circle unchanged.

**Independent Test**: Focused tests prove exactly-five assignment, score increments/cap, full
help/adaptation credit, shared ties, rollover isolation, strict projection, protected-category
rejection, opt-out, and prepared encouragement.

- [ ] T121 [P] [US9] Add RED tests for League eligibility, five-Leaf weeks, idempotent confirmation, scores, ties, opt-out, rollover, strict projections, and encouragement allowlists in `tests/family-league.test.ts`
- [ ] T122 [P] [US9] Define Challenge Leaves, League weeks, participants, results, minimal projections, eligibility decisions, rollover input, and prepared encouragement in `src/models/familyLeague.ts`
- [ ] T123 [US9] Implement deterministic eligibility, week creation, confirmation credit, score/competition-position calculation, strict projection, prepared encouragement, cooperative totals, and rollover in `src/features/league/index.ts`
- [ ] T124 [US9] Export the Family League service through `src/services/interfaces/index.ts`, `src/services/mock/index.ts`, and `src/services/index.ts`, then run `npm test -- tests/family-league.test.ts`

**Checkpoint**: User Story 9 is independently usable with synthetic invitees only, and no League
method accepts task text, evidence, Seeds, speed, or Green Circle state.

---

## Phase 16: User Story 10 — Age-Adaptive Coach and Synthetic Voice (Priority: P3)

**Goal**: Enforce age-specific prepared Coach output and a task-bound push-to-talk review state
machine without microphone or provider integration.

**Independent Test**: All age bands and voice transitions pass; permission, task/version, state,
background, and delete-before-send failures are explicit.

- [ ] T125 [P] [US10] Add RED tests for age-specific step/tone/pace/choice/adult-exit rules in `tests/assistant-age-adaptation.test.ts`
- [ ] T126 [P] [US10] Add RED tests for stored grant, task binding, explicit start/stop, prepared transcript review/delete/send, captions, replay, slower playback, and reset in `tests/assistant-voice-session.test.ts`
- [ ] T127 [P] [US10] Define Coach output and synthetic voice-session contracts in `src/models/assistantVoice.ts`
- [ ] T128 [US10] Implement prepared-result adaptation in `src/features/assistants/ageAdaptation.ts` and voice transitions in `src/features/assistants/voiceSession.ts`
- [ ] T129 [US10] Export Coach adaptation and synthetic voice services through `src/services/interfaces/index.ts`, `src/services/mock/index.ts`, and `src/services/index.ts`, then run both focused test files

**Checkpoint**: User Story 10 is independently usable and contains no microphone, audio bytes,
speech provider, biometric inference, background recording, or unreviewed dialect content.

---

## Phase 17: Redesign domain convergence

**Purpose**: Verify the new services together without changing the existing P0 evidence class.

- [ ] T130 Run `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`, `git diff --check`, and a ten-route inventory; fix only defects within this window's reserved boundaries
- [ ] T131 Review the complete diff for child-safety, privacy, capability truth, comment syntax, secret/network/media absence, and P0 regression; record checks and release all 2026-09-02 boundaries in `TEAM_OWNERSHIP.md`

### Product Experience Redesign dependencies

- Phase 12 blocks Phases 13–16.
- Phases 13, 14, and 15 use disjoint model/feature/test files and may run in parallel after Phase 12.
- Phase 16 is independent at the pure-policy level but shares the final service registry with every
  prior phase, so T116, T120, T124, and T129 are serialized by `/root`.
- Phase 17 begins only after the selected domain phases pass independently.
- Frontend routes, components, design, typography, localization copy, native media, real providers,
  production accounts/invitations/payment, and named human reviews are not tasks in this window.
