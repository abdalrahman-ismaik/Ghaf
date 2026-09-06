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

| Requirement / outcome range                                                                                             | Primary task coverage                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| FR-001–FR-010 — historical boundary, exact scope, capability truth, synthetic/offline/prepared AI                       | T002–T003, T008, T013, T016, T018–T020, T025, T027–T029, T063–T071, T082–T090                             |
| FR-011–FR-017 — entry, role, household overview, non-surveillant summary                                                | T015, T030–T035, T041, T065–T067, T072–T080, T083–T089                                                    |
| FR-018–FR-029 — category catalog, P0 task, bounded drafting/review/assignment, zero early reward                        | T009–T013, T018–T029, T030–T034, T037–T044, T079, T082–T084                                               |
| FR-030–FR-040 — Child choices, separate choose/start, bounded Coach, optional media/reflection, zero-reward submission  | T009, T013–T016, T018–T021, T025–T030, T033–T035, T045–T050, T063–T071, T079–T084                         |
| FR-041–FR-055 — check-in, retry/equivalent, praise-first idempotent recognition, reward/phase matrix                    | T009–T010, T014, T018, T021–T029, T033, T051–T056, T063, T070, T079–T084, T089–T090                       |
| FR-056–FR-070 — five-stage garden, symbolic claims, privacy-first canopy/circle projection                              | T010–T012, T014–T016, T018–T024, T027–T029, T035, T057–T062, T070–T071, T077–T084, T089–T090              |
| FR-071–FR-081 — exact assistant/media fixtures, prepared-only Coach, safety/fallback/secret boundary                    | T003, T005–T006, T013, T015–T016, T018–T020, T025–T030, T034, T037–T050, T063, T068, T079–T085, T089–T090 |
| FR-082–FR-098 — task safety, culture, bilingual RTL, accessibility, exact reset/duplicate behavior                      | T004–T006, T009–T016, T018–T035, T037–T071, T079–T090                                                     |
| FR-099–FR-105 — preserved baseline, least-privilege access, pairing, reauthentication, and Child grants                 | T111–T116, T130–T131                                                                                      |
| FR-106–FR-110 — private Family Reward lifecycle, eligibility, privacy, and prospective changes                          | T111–T112, T117–T120, T130–T131                                                                           |
| FR-111–FR-115 — private five-Leaf League, capped scoring, rollover, projection, and encouragement                       | T111–T112, T121–T124, T130–T131                                                                           |
| FR-116–FR-118 — age adaptation, synthetic voice lifecycle, and shared service facade                                    | T112, T125–T131                                                                                           |
| FR-119–FR-127 — capability-authorized voice presentation and locale-aware typography                                    | T132–T139                                                                                                 |
| Revision 3 amendment and R001 release — preserved remote ten plus six approved access routes                            | T140–T149                                                                                                 |
| R002a compatibility intake and implementation; independent R002b Growth/schema gate                                     | T150–T178                                                                                                 |
| FR-144–FR-159 — R002b flags, ledger/migration, Growth Journey, learning, reveal, Parent Progress, Shared Growth, routes | T179–T222                                                                                                 |
| SC-001 — preserved remote ten routes, exact R001 inventory of 16, and legacy retirement                                 | T063–T071, T081–T084, T088–T090, T140–T149                                                                |
| SC-002–SC-005 — five offline cycles/resets, exact one-time consequence, no early reward                                 | T009–T010, T014, T016–T017, T021–T029, T036–T071, T083–T090                                               |
| SC-006–SC-008 — reward matrix, stages/category mapping, projection rejection                                            | T010–T012, T017–T024, T027–T029, T036, T051–T062, T077, T082–T090                                         |
| SC-009–SC-011 — point-of-use origins, bounded Coach, safe Parent summary                                                | T005–T006, T013, T015–T020, T025–T030, T034, T036–T050, T068, T072–T084, T089–T090                        |
| SC-012–SC-013 — bilingual physical journey and native accessibility                                                     | T004, T015, T030–T035, T044, T050, T056, T062, T065–T071, T078–T080, T083–T085, T089–T090                 |
| SC-014–SC-017 — rehearsals, comprehension, prohibited claims, named reviews                                             | T002, T004–T006, T071, T077–T086, T089–T090                                                               |
| SC-018 — optional live Parent AI truth and secure-boundary gate                                                         | T003, T008, T013, T016, T025–T029, T068, T082–T086, T089–T090                                             |
| SC-019 — access capability, pairing, reauthentication, and revocation                                                   | T112–T116, T130–T131                                                                                      |
| SC-020 — Family Reward transitions, exclusions, privacy, and rank independence                                          | T112, T117–T120, T130–T131                                                                                |
| SC-021–SC-022 — League scoring, ties, privacy projection, rollover, and allowlists                                      | T112, T121–T124, T130–T131                                                                                |
| SC-023–SC-024 — age/voice domain behavior and complete static/behavioral convergence                                    | T112, T125–T131                                                                                           |
| SC-025–SC-028 — Parent voice grant, bilingual presentation, typography, reset, and proxy evidence                       | T132–T139                                                                                                 |
| SC-036–SC-043 — R002b audit, migration, achievements, learning, reveal, privacy, flags, native/release evidence         | T179–T222                                                                                                 |

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

- [x] T113 [P] [US7] Add RED tests for least-privilege Parent/Child projections, expiring one-use pairing, device revocation, scoped reauthentication, and Parent-owned language/voice/media/AI grants in `tests/access-control.test.ts`
- [x] T114 [P] [US7] Define synthetic principals, separate access sessions/views, capabilities, pairing requests, reauthentication proofs, device state, and Child grants in `src/models/access.ts`
- [x] T115 [US7] Implement fail-closed deterministic access, pairing, projection, reauthentication, revocation, and permission policies in `src/features/access/index.ts`
- [x] T116 [US7] Export the synthetic access service through `src/services/interfaces/index.ts`, `src/services/mock/index.ts`, and `src/services/index.ts`, then run `npm test -- tests/access-control.test.ts`

**Checkpoint**: User Story 7 is independently usable from the service facade and has no real
credential, biometric, network, or persistence path.

---

## Phase 14: User Story 8 — Private Family Reward Promise (Priority: P3)

**Goal**: Model a private Parent promise tied only to personal progress, separate from Seeds,
League position, and payment behavior.

**Independent Test**: Every lifecycle/milestone/promise kind passes; protected activity, League
inputs, withdrawal, retroactive edits, cross-Child views, and Seed conversion fail.

- [x] T117 [P] [US8] Add RED tests for Family Reward plan validation, all milestone kinds, lifecycle idempotency, protected-category exclusion, private projection, prospective edits, and monthly currency totals in `tests/family-reward.test.ts`
- [x] T118 [P] [US8] Define Family Reward plans, milestones, eligibility events, progress snapshots, private views, revisions, and monthly commitments in `src/models/familyReward.ts`
- [x] T119 [US8] Implement deterministic plan creation, personal milestone evaluation, monotonic transitions, future-only revision, private projection, and commitment aggregation in `src/features/family-rewards/index.ts`
- [x] T120 [US8] Export the Family Reward service through `src/services/interfaces/index.ts`, `src/services/mock/index.ts`, and `src/services/index.ts`, then run `npm test -- tests/family-reward.test.ts`

**Checkpoint**: User Story 8 is independently usable and exposes no payment, wallet, custody,
exchange-rate, rank, or public-reward operation.

---

## Phase 15: User Story 9 — Fair Synthetic Weekly Challenge (Priority: P3)

**Goal**: Add a bounded five-Leaf synthetic League with normalized weekly results and a cooperative
goal while keeping the Green Circle unchanged.

**Independent Test**: Focused tests prove exactly-five assignment, score increments/cap, full
help/adaptation credit, shared ties, rollover isolation, strict projection, protected-category
rejection, opt-out, and prepared encouragement.

- [x] T121 [P] [US9] Add RED tests for League eligibility, five-Leaf weeks, idempotent confirmation, scores, ties, opt-out, rollover, strict projections, and encouragement allowlists in `tests/family-league.test.ts`
- [x] T122 [P] [US9] Define Challenge Leaves, League weeks, participants, results, minimal projections, eligibility decisions, rollover input, and prepared encouragement in `src/models/familyLeague.ts`
- [x] T123 [US9] Implement deterministic eligibility, week creation, confirmation credit, score/competition-position calculation, strict projection, prepared encouragement, cooperative totals, and rollover in `src/features/league/index.ts`
- [x] T124 [US9] Export the Family League service through `src/services/interfaces/index.ts`, `src/services/mock/index.ts`, and `src/services/index.ts`, then run `npm test -- tests/family-league.test.ts`

**Checkpoint**: User Story 9 is independently usable with synthetic invitees only, and no League
method accepts task text, evidence, Seeds, speed, or Green Circle state.

---

## Phase 16: User Story 10 — Age-Adaptive Coach and Synthetic Voice (Priority: P3)

**Goal**: Enforce age-specific prepared Coach output and a task-bound push-to-talk review state
machine without microphone or provider integration.

**Independent Test**: All age bands and voice transitions pass; permission, task/version, state,
background, and delete-before-send failures are explicit.

- [x] T125 [P] [US10] Add RED tests for age-specific step/tone/pace/choice/adult-exit rules in `tests/assistant-age-adaptation.test.ts`
- [x] T126 [P] [US10] Add RED tests for stored grant, task binding, explicit start/stop, prepared transcript review/delete/send, captions, replay, slower playback, and reset in `tests/assistant-voice-session.test.ts`
- [x] T127 [P] [US10] Define Coach output and synthetic voice-session contracts in `src/models/assistantVoice.ts`
- [x] T128 [US10] Implement prepared-result adaptation in `src/features/assistants/ageAdaptation.ts` and voice transitions in `src/features/assistants/voiceSession.ts`
- [x] T129 [US10] Export Coach adaptation and synthetic voice services through `src/services/interfaces/index.ts`, `src/services/mock/index.ts`, and `src/services/index.ts`, then run both focused test files

**Checkpoint**: User Story 10 is independently usable and contains no microphone, audio bytes,
speech provider, biometric inference, background recording, or unreviewed dialect content.

---

## Phase 17: Redesign domain convergence

**Purpose**: Verify the new services together without changing the existing P0 evidence class.

- [x] T130 Run `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`, `git diff --check`, and a ten-route inventory; fix only defects within this window's reserved boundaries
- [x] T131 Review the complete diff for child-safety, privacy, capability truth, comment syntax, secret/network/media absence, and P0 regression; record checks and release all 2026-09-02 boundaries in `TEAM_OWNERSHIP.md`

### Product Experience Redesign dependencies

- Phase 12 blocks Phases 13–16.
- Phases 13, 14, and 15 use disjoint model/feature/test files and may run in parallel after Phase 12.
- Phase 16 is independent at the pure-policy level but shares the final service registry with every
  prior phase, so T116, T120, T124, and T129 are serialized by `/root`.
- Phase 17 begins only after the selected domain phases pass independently.
- Frontend routes, components, design, typography, localization copy, native media, real providers,
  production accounts/invitations/payment, and named human reviews are not tasks in this window.

---

## Phase 18: User Story 11 — Child Voice and Bilingual Typography Presentation (Priority: P3)

**Goal**: Demonstrate the completed prepared Coach and synthetic voice domain inside the existing
journey, with explicit Parent grants and one locale-aware system-font typography source.

**Independent Test**: Parent enablement, age-adapted Coach output, every voice state, Arabic/English
switching, denial, and reset pass without a new route, dependency, microphone, speech provider,
network request, or reward mutation.

- [x] T132 [US11] Authorize the later presentation slice, exact reset values, type rules, and
      capability boundaries in `spec.md`, `plan.md`, `contracts/acceptance-contract.md`, `DESIGN.md`,
      `PROTOTYPE_LIMITATIONS.md`, and `TEAM_OWNERSHIP.md`
- [x] T133 [P] [US11] Add and observe RED locale-role, source-boundary, scaling, and mixed-script
      tests in `tests/bilingual-typography.test.ts`
- [x] T134 [P] [US11] Add and observe RED Parent-grant, age-derived Coach, voice lifecycle,
      locale-preservation, reset, copy-parity, route, and forbidden-import tests in
      `tests/child-ai-presentation.test.ts`
- [x] T135 [US11] Implement complete Arabic/English typography roles in `src/design/tokens.ts`,
      consume the resolver from `src/components/primitives.tsx`, and remove fixed text-bearing badge
      clipping in `src/components/family-growth/TaskPanels.tsx`
- [x] T136 [US11] Implement the private service-authorized application adapter in
      `src/features/assistants/childVoiceController.ts` and expose only safe Coach/voice projections and
      commands through `src/state/usePrototypeStore.ts`
- [x] T137 [US11] Add reusable Parent permission and Child synthetic voice panels, mount them on the
      existing review/task routes, expose the existing language switch, and add paired resources in
      `src/components/family-growth/{ParentVoicePermissionPanel.tsx,SyntheticVoicePanel.tsx}`,
      `app/{parent/task/review.tsx,child/task.tsx}`, and `src/i18n/resources.ts`
- [ ] T138 [US11] Run focused tests, full typecheck/lint/format/test, route inventory, static web
      export, forbidden capability scan, Impeccable detector, and `git diff --check`; correct only
      defects within the reserved window
- [ ] T139 [US11] Record web-proxy versus native evidence truth, review the final diff, release the
      reservation, and commit the validated convergence checkpoint

**Checkpoint**: User Story 11 is demonstrable as prepared/synthetic UI only. Parent enablement is
explicit, locale changes do not alter the task or voice state, reset is exact, and Android/human
acceptance remains evidence-dependent.

---

## Phase 19: Revision 3 Authority Reconciliation and R001 Release

**Historical gate, superseded on 2026-09-05**: the R002-wide runtime block applied during this
R001-only phase. Current work uses the independent R002a and R002b gates in Phases 21–23.

**Goal**: Preserve the remote behavioral baseline, encode the user-authoritative Revision 3 product
contract, and release only the already approved R001 Welcome/Parent-onboarding batch.

- [x] T140 Reconcile `AGENTS.md`, `PRODUCT.md`, `spec.md`, `plan.md`, this task ledger, the R001
      release gate, design authority, limitations, and documentation map without rewriting remote
      implementation evidence or applying any of the six local-only commits.
- [x] T141 [P] Preserve the approved R001 release files from original commit
      `f63e39fc702bb1797791f7543c6316e3b06f3ba9` with their original bytes/checksums; do not import any
      generated web runtime or the untracked R002 directory.
- [x] T142 Validate Markdown, links, stable IDs, exact counts, R001 checksums, authority language,
      `git diff --check`, and changed paths; record that R002 remains unchanged and blocked.

**Checkpoint**: Canonical documents agree that the remote access/League/Family Reward/voice/privacy/
reset implementation is the regression baseline, Revision 3 product rules are approved planning
authority, and only R001 may enter runtime.

## Phase 20: R001 Batch 1 — Native Foundations and Parent Onboarding

**Released routes**: `/`, `/access/parent/sign-in`, `/access/parent/verification`,
`/access/parent/family-basics`, `/access/parent/add-first-child`,
`/access/parent/review-create`, and modal `/access/parent/family-created-success`.

- [x] T143 [P] Write focused RED tests for deterministic Parent identifier/code validation,
      onboarding-draft guards, idempotent local family receipt, capability-scoped `/parent` handoff,
      profile isolation, and exact reset while retaining the existing access tests.
- [x] T144 Implement the smallest R001 onboarding adapter in `src/features/access/**`, the existing
      models/service registry, and store. Preserve remote Parent/Child capabilities, League, Family
      Reward, voice, privacy, reset, `task_recycling_p0_v1`, and all unrelated fixture behavior.
- [x] T145 [P] Write RED localization/structure tests for Arabic/English parity, Alexandria/Readex
      roles, bidi-safe OTP/data, 48dp targets, route guards, modal ownership, and prohibited web/runtime
      imports.
- [x] T146 Reconcile the existing design tokens and primitives; add only reusable R001 access
      controls, locally bundled Alexandria/Readex weights, responsive safe-area/scroll/keyboard shell,
      and native success sheet. Do not remove `expo-audio` or add an overlapping UI library.
- [x] T147 Implement the seven R001 route compositions and interactions from the approved PNGs,
      treating HTML/CSS/JS only as read-only measurement hints. Child entry stays honestly unavailable
      until a Child-access batch is released; `/parent` is a handoff destination, not a redesign.
- [x] T148 Run focused access/localization/route/reset suites after each slice, then `npm run
format:check`, `npm run typecheck`, `npm run lint`, `npm test`, Expo dependency/config checks,
      static export, route inventory, forbidden-import scan, and `git diff --check`.
- [x] T149 Compare all seven screens at 390×844 and test 320×568, 430×932, the target tablet,
      natural scrolling, keyboard visibility, Arabic RTL, English LTR, 100/130/200% font scale,
      reduced motion, TalkBack order, native Back, offline/reset, and success-sheet focus restoration.
      Record unavailable native/human checks as `BLOCKED` or `NOT RUN`, never inferred `PASSED`.

**Checkpoint**: R001 is a coherent deterministic native Parent-onboarding slice over the remote
behavioral baseline. It does not release any later screen.

## Phase 21: R002 Intake Split and R002a Compatibility Release

**Gates**:

- **R002A COMPATIBILITY SCOPE APPROVED — IMPLEMENTATION AUTHORIZED**
- **R002B PRODUCT EXPANSION — DECISIONS OPEN — IMPLEMENTATION BLOCKED**

- [x] T150 Automate the objective R002 inventory for all 74 export directories, 71 PNGs, 70 HTML
      files, and 69 complete pairs: record presence, dimensions, hashes, HTML titles, and viewport
      metadata while excluding every `Zone.Identifier` file.
- [x] T151 Select the compatibility-safe R002a Parent, task, review, Child, support-loop, and existing
      Garden variants by mobile composition, pair completeness, live copy, physical RTL,
      accessibility, interaction-state evidence, and asset viability. Treat numbered progress
      exports as route states, not duplicate routes.
- [x] T152 Write `SCREEN_INDEX.md`, `SCREEN_SELECTIONS.md`, `COPY_PARITY.md`,
      `ASSET_PROVENANCE.md`, `INTERACTION_STATE_MATRIX.md`, and detailed grouped `screen-spec.md`
      files for selected R002a runtime surfaces. Draft centralized English parity and conservative
      loading, empty, error, submitting, success, interrupted, and reduced-motion states without
      inventing a business outcome.
- [x] T153 Reconcile the selected presentation with the private five-Leaf League,
      `task_recycling_p0_v1`, schema-3 48→60 behavior, complete approval consequences, access
      guards, voice/`expo-audio`, reset, and profile isolation. Quarantine invalid, desktop,
      duplicate, placeholder, unknown-provenance, and R002b exports; record the explicit user and
      integration-owner R002a release.

No Phase 21 task authorizes application, test, dependency, configuration, or asset changes.

## Phase 22: R002b Product Expansion — Historical Decision Gate

**Historical gate, superseded on 2026-09-05**:
**R002B PRODUCT EXPANSION — DECISIONS OPEN — IMPLEMENTATION BLOCKED**

- [ ] T154 Supply and approve the missing Child Impact Path, Badge Gallery, Badge Detail, Mangrove
      Learning, equal-credit accessible Learning, Parent selected-Child Progress, and combined
      RevealBundle references and specifications.
- [ ] T155 Specify, test, and integration-release the product-approved 108→120 lifetime-Seed/reset
      migration with rollback, idempotency, profile-isolation, and schema-3 compatibility evidence;
      runtime migration execution remains blocked, and Mangrove 48/60 or Family Reward 108/120 must
      not change by inference.
- [ ] T156 Write RED tests for one 120–180 derived Impact Path, exact 16-badge registry, zero-Seed
      equal-credit learning, immutable profile-scoped awards, and one recoverable result per
      `profileId + triggerEventId`.
- [ ] T157 Implement Growth domain/projections only after T154–T156 and a new bounded release gate;
      screens never calculate rewards/unlocks or create a second currency.
- [ ] T158 Implement only the approved Growth screens, then complete full automated, bilingual,
      responsive, accessibility, offline, reset, physical Android, content, cultural, safeguarding,
      and rights evidence.

Phase 22 records the prerequisites that were open before the user approved the bounded product
contract and code-native missing-screen authority. Current implementation is governed by Phase 24
and later. A prompt or export filename still does not create product authority by itself.

## Phase 23: R002a Compatibility Implementation — Authorized

**Gate**: **R002A COMPATIBILITY SCOPE APPROVED — IMPLEMENTATION AUTHORIZED**

- [x] T159 Create `integration/r3-r002a-implementation-20260904` directly from verified remote R001
      evidence head `76fa682`; confirm the original divergent worktree remains untouched and all
      482 baseline tests pass before R002a changes.
- [x] T160 Write an integration-level characterization suite that freezes task-ID stability, zero
      reward at submission, retry/interruption, atomic and idempotent approval, schema-3 Seed and
      Garden results, canopy, Challenge Leaf/private League, private Family Reward, access and
      reauthentication, deterministic voice, reset, and profile isolation.
- [x] T161 [US5] Write focused Parent Home presentation tests for live selector usage, preserved
      action/route/test-ID reachability, Parent guard/reset/language controls, physical RTL/LTR,
      accessibility, scroll, and the absence of hard-coded `108`, `120`, or `180` progression.
- [x] T162 [US5] Recompose `/parent` from `ghaf_parent_home` using the existing tokens, Alexandria
      and Readex roles, reusable native Soft Geometric components, and live canopy/journey/Child
      state. Keep unavailable League/Family Reward numeric fragments out of runtime until a real
      selector adapter is specified.
- [x] T163 Run focused Parent overview/access/reset tests and the complete static/behavioral gate;
      compare Arabic and English at 320, 360, 390, and 430 widths plus one wide viewport, then commit
      the validated Parent Home slice.
- [x] T164 [US1] Write focused Parent Tasks/Builder presentation tests covering Choose, Edit,
      Review, task-created, and task-added states without changing actions or payloads.
- [x] T165 [US1] Recompose Parent Tasks and Builder from the selected compatible variants; preserve
      the existing task composer, bounded Guide, safety review, assignment authority, and route
      guards.
- [x] T166 Validate and commit the Parent Tasks/Builder slice with focused flow, locale, RTL,
      accessibility, responsive, export, and full regression checks.
- [x] T167 [US2] Write focused Child Today/Task presentation tests for Ready, Active 0/2–2/2,
      completion confirmation, submission, waiting, interruption recovery, and zero pre-approval
      rewards.
- [x] T168 [US2] Recompose Child Today, Task Detail, Active Task states, completion, and waiting on
      the existing task state machine and selectors; do not duplicate lifecycle logic in views.
- [x] T169 Validate and commit the Child task slice with focused flow, profile guard, voice, locale,
      RTL, accessibility, responsive, export, and full regression checks.
- [x] T170 [US3] Write focused Parent review and support-loop presentation tests covering pending
      review, support default/selected/sent, approve/retry, approval success, Child follow-up, and
      idempotent resubmission.
- [x] T171 [US3] Recompose Parent review and Child support/follow-up presentation while calling only
      the existing approval/retry transactions and preserving every current reward consequence.
- [x] T172 Validate and commit the review/support slice with focused lifecycle, reward, privacy,
      access, RTL, accessibility, responsive, export, and full regression checks.
- [x] T173 [US4] Write focused Garden presentation tests proving all displayed values derive from
      the current selectors and no cumulative Next Stage or second-currency mechanic appears.
- [x] T174 [US4] Recompose the existing Garden from `ghaf_child_growth_garden_final_corrected` as a
      visual candidate while preserving current schema-3 progression, routes, announcements, and
      reset behavior.
- [x] T175 Validate and commit the Garden slice with focused Garden/canopy/privacy, locale, RTL,
      accessibility, responsive, export, and full regression checks.
- [x] T176 Add cross-slice RTL, accessibility, reduced-motion, overflow, fixed-action clearance,
      keyboard, route-state, and 390×844 visual regression coverage without importing web runtime.
- [x] T177 Run the complete repository gate, Expo configuration and production exports, route/reset
      checks, and physical Android smoke test. Record an unavailable device or SDK as `BLOCKED`, not
      inferred success. Automated, Expo, web, and export gates passed; the physical Android smoke
      test is `BLOCKED` because this environment has no listed ADB device or configured Android SDK.
- [x] T178 Record final R002a evidence, remaining visual deviations, human-copy/provenance review,
      and every deferred R002b surface; verify raw exports and six historical commits remain
      untouched and unapplied in
      `specs/003-family-growth-garden/design-intake/r002a-validation-evidence.md`.

**Checkpoint**: R002a is complete only when every implemented compatibility slice preserves the
characterized behavior and has fresh bilingual, responsive, accessibility, visual, export, reset,
and Android evidence with truthful limitations. This phase never releases R002b.

## Phase 24: R002b Product Contract, Audit, and Characterization

**Gate**:
**R002B PRODUCT CONTRACT APPROVED — FEATURE-FLAGGED IMPLEMENTATION AUTHORIZED — RELEASE ACTIVATION BLOCKED**

- [x] T179 Reconcile the approved R002b contract across `AGENTS.md`, `PRODUCT.md`, Feature 003
      specification/plan/tasks/data model/contracts, design/gate/limitations/runbook records, and
      `TEAM_OWNERSHIP.md`; keep R001/R002a frozen, flags default-off, and release activation blocked.
- [x] T180 Verify clean R002a head `0501cf3`, ancestors `a0539e9` and `76fa682`, the isolated new
      branch, untouched original worktree, and 38 files / 541 tests before R002b changes.
- [x] T181 Audit Schema 3 source, fixtures, reset, recognition ledger, persistence, epoch/event IDs,
      and synthetic-only provenance. Record that 48 is both a personal scalar and current Mangrove
      scalar, no archived 60 or reconciling baseline ledger exists, and any 60 carry-forward is an
      explicit approved Salem-only synthetic fixture assumption rather than verified history.
- [x] T182 [P] Write characterization tests for ledger reconstruction, synthetic eligibility,
      ambiguous/non-synthetic rejection, profile/epoch isolation, reset, task-ID stability, zero
      submission reward, complete approval consequences, and duplicate/concurrent approval.
- [x] T183 Define the eight independent default-off flags and prove that disabled flags preserve the
      exact R002a routes, presentation, task lifecycle, counters, voice, access, privacy, and reset.
- [x] T184 Validate and commit the contract and characterization boundaries separately; stage exact
      paths and retain all raw exports and six held commits unchanged.

## Phase 25: Lifetime Seed Projection and Versioned Migration

- [x] T185 Implement a pure shadow-mode Seed-ledger audit and `lifetimeSeeds` selector whose only
      authority is unique committed entries within the active profile epoch.
- [x] T186 Add one immutable versioned synthetic migration receipt with explicit fixture provenance:
      Salem 108 from approved carry-forward-60 assumption plus verified current 48; Alya retains her own
      verified 36 scalar with no Salem carry-forward; unsupported cousin profiles remain ineligible.
- [x] T187 Reject ambiguous, real/non-synthetic, cross-profile, wrong-epoch, duplicate, malformed,
      partial, and non-atomic migration inputs without changing current state.
- [x] T188 Integrate the existing `+12` recognition entry once so Mangrove remains 48→60 while
      lifetime Seeds project 108→120; preserve canopy, League, Challenge, Family Reward, praise,
      task identity, and zero reward before recognition.
- [x] T189 Record a completed Mangrove 60/60 archive and derive reached Water & Coast stations without
      a writable Impact Path balance, backfill celebration, or fabricated task/mastery/learning data.
- [x] T190 Cover thresholds 107, 108, 119, 120, 131, 132, 179, and 180; no spending/decrease; retry,
      concurrency, restart at transaction boundaries, reset epoch, and profile isolation.
- [x] T191 Run focused progression/reward/reset tests, full suite, static checks, Expo configuration,
      production export, route scan, and `git diff --check`; commit the validated migration slice.

## Phase 26: Impact Path, Badge Registry, and Candidate Screens

- [x] T192 Write grouped `screen-spec.md` files for the compact Today card, Garden chapter module,
      Impact Path, Badge Gallery, and Badge Detail before implementing their routes/components.
- [x] T193 Encode exactly 16 stable bilingual badge definitions and deterministic criteria in one
      typed registry; reject duplicate/unknown IDs and preserve permanent private awards.
- [x] T194 Map each unique `task_recycling_p0_v1` approval to one `skill.sorting` and one separate
      `skill.coast_care` acquisition credit; never backfill unproved mastery.
- [x] T195 Implement deterministic badge evaluation/backfill, including 1/3/7 sorting, 2/5/10 water
      with station-156 Bud gate, two-credit Energy Bud, and the full Mangrove Care composite.
- [x] T196 Implement Water & Coast stations 120/132/144/156/168/180 as read-only projections and a
      configured-next-stage fallback without implying a visit or inventing content.
- [x] T197 Add gated Today/Garden entry components plus `/garden/impact-path`, `/garden/badges`, and
      `/garden/badges/:badgeId` with typed same-role origin restoration and safe deep-link fallback.
- [x] T198 Implement earned/in-progress/next/locked/archived gallery states and Badge Detail identity,
      exact criteria/progress/meaning/provenance/one contextual action without Child task creation.
- [x] T199 Add bilingual/RTL/LTR, responsive, accessibility, reduced-motion, route-guard, and visual
      coverage; capture each canonical code-native candidate at 390×844 after implementation.
- [x] T200 Validate and commit achievements/Impact Path in independent domain and presentation
      boundaries, with every related flag still off by default.

**Evidence note:** T196–T198 and T200 are implemented and committed through `5c06cef`, with later
route/origin/accessibility corrections through `895af72` and `680f91b`. T199 is complete at the
bounded web/source evidence level: all five named surfaces have Arabic and English
320/360/390/430/768 samples, synthetic 200%-text containment, zero document horizontal overflow,
and settled reduced-motion samples. Physical Android and named human review remain separate release
blockers under T220/T221.

## Phase 27: Equal-Credit Learning and Superset RevealBundle

- [x] T201 Write `screen-spec.md` files for Story, accessible alternative, and combined Child reveal
      before their route/component implementation.
- [x] T202 Implement the finite bilingual `learning.mangrove_roots.v1` package, sourced content
      metadata, resumable progress, neutral no-fail check, and equal-credit Story/accessible routes.
- [x] T203 Record exactly one profile/epoch/package completion from either route; the other becomes a
      duplicate no-op, and both award zero Seeds/Garden/canopy/League/Challenge/Family Reward.
- [x] T204 Implement typed origin resume/recovery and prevent lesson autoplay; keep Learning release
      off pending source provenance and named human content review.
- [x] T205 Define `reveal:<profileId>:<triggerEventId>` and lifecycle
      `ready → presenting → acknowledged → archived` with deterministic event-order queueing,
      exactly-once construction, one visible bundle, interruption resume, and no rebuild after seen.
- [ ] T206 Construct the approval bundle as a role-specific projection of existing committed
      authorities with complete praise/Seed/stage/canopy/eligible Green Circle/private League/
      Challenge/Family Reward/badge/station/learning/safe-help consequence parity and no screen-side
      reward calculation.
- [x] T207 Permit a separate zero-Seed learning bundle only when its unique completion causes a new
      eligible outcome; dismissal never reverses committed state and flags never show R002a and v2
      reveals together.
- [ ] T208 Add the gated Child reveal route/sheet, static reduced-motion outcome, focus containment,
      restoration, and 390×844 code-native capture.
- [ ] T209 Test retry, interruption at every lifecycle boundary, queue order, duplicate/concurrent
      triggers, role projection, consequence parity, and default-off R002a fallback; validate and
      commit Learning and RevealBundle as separate slices.

**Evidence note:** Learning and the receipt-only Reveal lifecycle are implemented, tested, and
committed. `680f91b` additionally hardens initial/return focus, truthful recovered presentation,
acknowledged interruption recovery, and Back handling without changing reward authority. T206,
T208, and T209 remain open because the normal approval flow does not yet expose all authoritative
private League, Challenge Leaf, and Family Reward receipts required for a complete live v2 approval
bundle, and no valid 390×844 Reveal capture exists. Learning remains default-off pending named
content/provenance review and a truthful station-132 live capture.

## Phase 28: Parent Progress and Additive Shared Growth

- [x] T210 Write `screen-spec.md` files for Parent selected-Child Progress, Child Shared Growth, and
      Parent Shared Garden settings before route implementation.
- [x] T211 Implement Parent-only `/parent/family/:profileId/progress` from profile-scoped selectors:
      lifetime/current/archive, earned/in-progress badges, unlocked learning, and transparent task
      suggestions with no manual grant/revoke/edit operation.
- [x] T212 Let Create Suitable Task prefill the existing builder while preserving ordinary Parent
      review/save; switching Child clears Salem-specific origin/filter/selection state.
- [x] T213 Implement `/circle/shared-growth` as a secondary qualitative synthetic anonymous view with
      no names, profiles, ranks, percentages, participant counts, task detail, Seeds, badges, or
      identifiable events. Keep private five-Leaf League root and identity unchanged.
- [x] T214 Implement Parent-only `/parent/family/shared-garden` with Continue/Pause/End future-signal
      controls; Pause/End never alter existing private or task state, and returning after End
      requires fresh Parent consent.
- [x] T215 Keep view and contribution behind separate default-off flags and prove view-without-
      contribution, participation-state independence, profile isolation, reset, privacy, and
      feature-flag rollback.
- [x] T216 Add bilingual, accessibility, responsive, route/deep-link, 200%-text, reduced-motion, and
      canonical 390×844 captures; validate and commit Parent Progress and Shared Growth separately.

**Evidence note:** T211–T215 are implemented and committed through `6730dc1`, with independent-flag,
Garden-entry, focus, origin, and recoverable-error corrections through `38ff275`. T216 is complete
at the bounded web/source evidence level: Parent Progress, Shared Growth, and Shared Garden settings
have Arabic and English 320/360/390/430/768 samples, 200%-text evidence, zero document horizontal
overflow, and settled reduced-motion samples. Physical Android/TalkBack and named privacy/copy
review remain separate T220/T221 blockers. The separately gated `/league` compatibility root
restores private League identity and strict projection; it does not change Shared Growth into a
League replacement.

## Phase 29: R002b Convergence and Release-Blocked Evidence

- [x] T217 Add cross-feature migration, restart, feature-flag, route-origin, RTL/LTR, accessibility,
      overflow, focus, keyboard, safe-area, and consequence-parity coverage while retaining all 541
      R002a tests.
- [ ] T218 Validate widths 320/360/390/430/768, Arabic RTL, English LTR, 200% text, reduced motion,
      no horizontal overflow, fixed-action clearance, semantic roles/states, and 48dp controls.
- [x] T219 Run formatting, lint, typecheck, full unit/integration suite, Expo dependency/configuration
      checks, production web and Android JavaScript exports, route/reset scans, and `git diff --check`.
- [x] T220 Attempt physical Android, TalkBack, native Back/IME, OS font scaling, and release-build
      smoke checks; record unavailable device/SDK as `BLOCKED`, never infer a pass from web.
- [x] T221 Record content/provenance/human-review gates and keep each applicable flag default-off;
      update the runbook and R002b validation evidence without rewriting R001/R002a history.
- [x] T222 Review exact staged paths, prove raw exports/metadata and six held commits remain untouched,
      and commit final R002b test/evidence boundaries without push, merge, deploy, rebase, or amend.

**Checkpoint:** The core checkpoint `895af72` passed 76 files / 967 tests. Final hardened
runtime/test checkpoint `4adcb73` passes 78 files / 989 tests; typecheck, lint, formatting, Expo
dependency/configuration checks, production web and Android JavaScript exports, route/reset scans,
and Git whitespace validation also pass. The physical Android attempt is recorded as `BLOCKED`
because no ADB device is available in this environment; TalkBack, native Back/IME, safe areas,
reduced motion, and OS font scaling therefore remain unobserved. All eight flags remain off by
default. T218 stays open because Learning Story and Accessible Learning remain truthfully locked,
approval Reveal remains fail-closed and uncaptured, and the private League bilingual width matrix is
partial. Passing tests or browser-proxy captures do not activate a release flag or pass native and
human-review gates.

## Phase 30: Complete Parent and Child Screen Journey

**Gate**: User-authorized local prototype screen completion. Missing Stitch frames inherit the
existing Soft Geometric design system; Android and named human gates remain separate.

- [x] T223 Record the R003 completion authority, reserve exact writer boundaries, and define the
      canonical route/state, navigation, access, privacy, and evidence manifest before runtime work.
- [x] T224 Write RED route-flow and presentation tests for separate Parent/Child access, removal of
      the role toggle, exact bottom navigation, Family/Reward/settings destinations, typed
      reauthentication returns, and safe deep-link fallback.
- [x] T225 Implement Child profile selection, PIN/picture-sequence, synthetic pairing
      pending/approval/success, active Child-session projection, and signed-out reset using the
      existing access service boundary.
- [x] T226 Replace all normal `/role` handoffs with sign-out/access-safe routes; make `/role` a
      compatibility redirect and expose settings without weakening Parent/Child route guards.
- [x] T227 Implement Parent Family overview, selected-Child progress entry, private Family Reward
      plan, Shared Garden entry, and the exact Home/Tasks/Garden/Family bottom navigation.
- [x] T228 Implement Parent settings, Child read-only settings, permission grants, paired-device
      management, language, deterministic reset, and typed one-use reauthentication screens.
- [x] T229 Preserve every completed R002b presentation behind its independent default-off flag,
      prove explicit environment opt-in and R002a fallback, then complete the receipt-only approval
      Reveal projection or preserve its fail-closed R002a result when any authority is absent.
- [x] T230 Run focused and full type/lint/format/unit/export gates; walk both Arabic RTL and English
      LTR journeys at representative phone widths, verify no horizontal overflow or browser errors,
      replay reset/Back/deep links, and record Android/human limitations truthfully.
- [x] T231 Perform the final design/craft review, reconcile `DESIGN.md`, limitations, runbook,
      evidence, and task states, inspect exact staged paths, and create cohesive local commits
      without pushing or merging.

## Phase 31: Parent Sign-up Route and Sign-in Hierarchy

**Gate**: User-authorized R003 access usability correction. Frozen R001 evidence stays historical;
the current operational route inventory may add exactly one code-native sign-up route.

- [x] T232 Record the 37-route sign-up contract, one-household boundary, closed verification-origin
      behavior, code-native visual inheritance, and exact writer reservation in the active spec,
      plan, requirements checklist, R003 journey manifest, `DESIGN.md`, and `TEAM_OWNERSHIP.md`.
- [x] T233 Write RED access/route tests proving centered screen-level sign-in copy, logical-start
      identifier safeguards, navigation-only Create Family behavior, native sign-up presence,
      verification origin restoration, bilingual parity, and the exact 37-route inventory.
- [x] T234 Implement `/access/parent/sign-up` and the bounded sign-in/verification route changes
      using existing access components, tokens, resources, and Parent verification authority only.
- [x] T235 Run focused tests, typecheck, lint, format, full tests, route inventory, web export,
      `git diff --check`, and scoped Arabic/English browser inspection at 320×720 and 390×844;
      record native and named-human checks without inference.
- [x] T236 Reconcile the quickstart, acceptance contract, runbook, ownership release, and exact
      evidence before one cohesive local commit; do not push or merge.

## Phase 32: Natural Botanical Artwork Refresh

**Gate**: User-authorized presentation-only replacement of poor vector-like scenic drawings. The
official Ghaf brand and functional vector controls remain protected; no behavior or release flag
changes.

- [x] T237 Audit every tracked runtime visual, classify official brand, functional icon/progress,
      scenic/decorative drawing, existing prepared media, and evidence-only artifact; reserve exact
      writers and record the 41-asset prompt/usage manifest before runtime work.
- [x] T238 Write RED artwork coverage for exact local static mappings, twenty-five distinct Garden
      states, provenance/checksums/dimensions, accessibility/fallback behavior, unchanged official
      brand, no remote sources, and removal of replaced scenic vector functions.
- [x] T239 Generate, inspect, normalize, compress, metadata-clean, prompt-embed, and checksum the
      complete Quiet UAE Botanical Editorial library with no people, text, logos, hazards, fantasy,
      misleading ecology, or crop-direction dependency.
- [x] T240 Add the approved Expo image dependency plus the typed local registry and reusable
      decorative/informative image wrapper; migrate existing runtime raster presentation without
      adding networking, capture, analysis, route, flag, or product-state authority.
- [x] T241 Replace the access backdrop, Welcome hero, botanical profile choices, and Child task hero
      while preserving all copy, selection semantics, 48dp targets, Arabic/English layout, and
      deterministic access/task behavior.
- [x] T242 Replace Garden stages, family-canopy states, and Circle garden scenes while keeping live
      progress, contribution, privacy, recognition announcements, reduced motion, and data authority
      outside the pixels.
- [x] T243 Replace gated Learning, Reveal, and Shared Growth scenes, remove the decorative League
      watermark, and preserve each unavailable state, accessible learning route, and default-off
      feature flag.
- [x] T244 Run focused tests, typecheck, lint, formatting, full tests, Expo dependency/configuration
      checks, route/reset scans, production exports, asset/provenance audit, and `git diff --check`.
- [ ] T245 Inspect Arabic RTL and English LTR at 320/390 widths for Welcome, profile selection, task,
      Garden, Circle, and explicitly enabled gated art surfaces; record crop, overflow, console,
      Android/TalkBack, named-human, and rights evidence truthfully before cohesive local commits.

      Default-on Arabic/English web-proxy inspection is complete. Explicitly enabled default-off
          art routes, physical Android/TalkBack, named-human, and image-rights evidence remain open.

## Phase 33: First-run Onboarding and Context Transitions

**Gate**: User-authorized presentation refinement inside the existing route and authority model.

- [x] T246 Read the active product/design/safety contract, reserve exact writer boundaries, and
      document the three-state onboarding, native/app splash handoff, bounded transition groups,
      raster-only artwork, accessibility, and evidence truth before runtime work.
- [x] T247 Write RED source/flow tests for ordered onboarding, skip/back/next/start, active-session
      bypass, 37-route preservation, bounded context transitions, raster logo, exact 45-asset local
      registry/provenance, bilingual parity, and reduced-motion behavior.
- [x] T248 Generate, inspect, normalize, prompt-embed, checksum, and register four Quiet UAE
      Botanical Editorial raster assets with no people, hands, text, logos, UI, vectors, hazards,
      fantasy, runtime URL, or impact claim.
- [x] T249 Build reusable first-run, raster-logo, branded-splash, and context-transition components
      with existing tokens, Expo Image, Alexandria/Readex, 48 dp controls, localized alternatives,
      fallback, polite announcements, and reduced-motion equivalence.
- [x] T250 Integrate the three moments into `/`, preserve active-session redirects and the existing
      Parent/Child Welcome actions, then classify only major access/experience handoffs for the
      root transition buffer.
- [x] T251 Run focused and full tests, typecheck, lint, formatting, dependency/configuration checks,
      route/reset scans, exports, asset/provenance audit, and `git diff --check`; inspect Arabic and
      English at 320/390 widths and record Android, TalkBack, font-scale, human-review, and rights
      gaps truthfully before cohesive local commits.

      Completed locally on 2026-09-06: focused flow/route/reset coverage passed 7 files / 76 tests;
      the full suite passed 86 files / 1,052 tests; typecheck, lint, format, dependency check, web
      and Android JS exports, asset provenance, and diff checks passed. Firefox proxy inspection
      passed at 320×720 and 390×844 in Arabic RTL and English LTR. Physical Android/TalkBack/OS
      font-scale is `BLOCKED / NOT RUN` with no attached ADB device; named-human and rights review
      remains `NOT RUN`.

## Phase 34: Child-clear First-run and Branded Access Refinement

**Gate**: User-authorized refinement of the completed first-run/access presentation; product and
route authorities remain unchanged.

- [x] T252 Re-read the active product/design/safety contract, inspect all Parent/Child access
      screens and shared components, reserve exact writer boundaries, and record the superseding
      four-moment, child-copy, raster, loader-timing, and shared-brand contract before runtime work.
- [x] T253 Update RED tests for `intro → choose → support → growth`, `1/4` semantics, child-clear
      bilingual fields, exact 46-asset provenance, 1,200/900 ms timing tokens, shared raster brand
      imports, and brand/backdrop inheritance across all existing access routes.
- [x] T254 Generate and inspect one new vivid Ghaf-introduction photograph and three replacement
      feature photographs; normalize, prompt-embed, checksum, and register them without people,
      hands, text, logos, vectors, UI, hazards, fantasy, or impact claims.
- [x] T255 Refactor the shared raster logo into `src/components/brand/`, add one reusable compact
      brand lockup, and apply it plus the leaf-shadow background through `AccessHeader` and
      `AccessScreen` without duplicating route code.
- [x] T256 Implement the four child-clear onboarding moments, richer raster framing, simple copy,
      bilingual alternatives, accessible progress, and reduced-motion-equivalent transitions.
- [x] T257 Implement the 1,200 ms startup minimum and 900 ms major-section dwell using existing
      motion tokens, real local-readiness state, clean timer cancellation, and no fake progress.
- [x] T258 Run focused and full tests, typecheck, lint, format, detector, route/reset scans,
      production exports, asset/provenance audit, and `git diff --check`; inspect Arabic/English
      onboarding and representative Parent/Child access screens at 320/390 widths, then record
      physical Android, TalkBack, OS font-scale, named-human, and rights gaps truthfully.

      Completed locally on 2026-09-06: the required RED state recorded 2 files with 5 failing and
      4 passing tests before implementation. The final focused brand/onboarding/artwork batch
      passed 3 files / 16 tests, and the complete suite passed 86 files / 1,053 tests. Typecheck,
      lint, formatting, Expo dependency alignment, the Impeccable detector, manifest integrity,
      web export (122 files), Android JS export (91 files), five-image export checksum matching,
      and `git diff --check` passed. Firefox proxy inspection covered four onboarding moments and
      eight reachable Parent/Child access states at 320×720 and 390×844 in Arabic RTL and English
      LTR with zero final-flow console errors. Startup remained visible about 1.48 seconds after
      mount and the major-section overlay about 1.37 seconds including fade-out. The state-gated
      pairing screen was source-audited through the same shared shell. Physical Android, TalkBack,
      OS font scale, named-human review, and public image-rights review remain `BLOCKED` or
      `NOT RUN`; `adb devices -l` returned no attached device or emulator.

## Phase 35: Startup Asset Readiness and Ghaf Loading Motion

**Gate**: User-authorized loading refinement over the completed R003 first-run presentation; all
product, route, access, artwork, and feature-flag authorities remain unchanged.

- [x] T259 Re-read the active contract, inspect startup/font/image paths, reserve exact writer
      boundaries, and record font-plus-raster readiness, fallback, progress, reduced-motion, and
      native-splash handoff rules before runtime work.
- [x] T260 Write RED coverage proving the splash waits for every local runtime raster plus fonts,
      critical brand assets settle before native handoff, progress is resource-derived, and one
      failed image cannot trap startup.
- [x] T261 Implement the typed batched local raster preloader and root readiness orchestration with
      clean cancellation, truthful warnings, the existing 1,200 ms minimum, and no remote request.
- [x] T262 Replace the generic spinner with a Ghaf-specific Reanimated transform/opacity sequence,
      real accessible progress, bilingual child-clear loading copy, and a calm reduced-motion state.
- [x] T263 Run focused/full tests, typecheck, lint, format, dependency/asset/route checks, production
      exports, detector, and bounded delayed-asset visual inspection; record physical Android and
      named-human limitations truthfully before a cohesive local commit.

      Completed locally on 2026-09-06: the focused RED state failed because the startup loader did
      not yet exist. The final focused file passed 7 tests and the full suite passed 86 files /
      1,055 tests. Typecheck, lint, format, dependency alignment, detector, web export (122 files),
      Android JS export (91 files), and Git whitespace checks passed. In Firefox, delaying one local
      raster kept the splash visible after 3.2 seconds with the real progress transform at
      `0.927273`; it dismissed only after settlement and exposed usable onboarding with zero page
      errors. Standard pulse values changed over time; reduced motion held the logo at exactly
      `scale(1)`. Arabic 320×720 and 390×844 proxy layouts were contained. Physical Android,
      TalkBack, native decode/memory, OS font scale, and named-human review remain `BLOCKED` or
      `NOT RUN`; `adb devices -l` returned no attached target.

## Phase 36: Section-scoped Loading and Simple Ghaf Leaf Loop

**Gate**: User-authorized performance correction over Phase 35; section boundaries, routes,
product behavior, and the 46-artwork registry remain unchanged.

- [x] T264 Re-read the active contract, inspect measured raster/font sizes and consumers, reserve
      exact writer boundaries, and replace the all-app readiness requirement with a bounded
      signed-out set plus dynamic access/experience section sets before runtime work.
- [x] T265 Write RED coverage proving startup excludes all Garden/prepared-media imagery, uses only
      the four referenced brand font files, starts its visible hold after native splash handoff,
      dynamically settles bounded section images, and renders a static reduced-motion equivalent.
- [x] T266 Implement signed-out and section-scoped local image preparation with caching, failure
      settlement, and no runtime URL; leave deeper screen imagery lazy through Expo Image.
- [x] T267 Replace visible technical loading copy, progress, pulse, and generic spinner with one
      reusable accessible three-leaf transform loop across startup and major-section buffers.
- [x] T268 Run focused/full tests, typecheck, lint, format, dependency/asset/route checks,
      production exports, detector, bounded delayed-asset browser inspection, and the available
      Android gate; record measured evidence and remaining limitations before a cohesive commit.

      Completed locally on 2026-09-06: the focused RED state recorded 3 failing and 5 passing
      tests. The final focused batch passed 2 files / 15 tests and the full suite passed 86 files /
      1,056 tests. Typecheck, lint, formatting, Expo dependency alignment, detector, Git whitespace,
      119-file web export, and 88-file Android JS export passed. Startup now requests seven
      signed-out rasters (1,650,726 bytes) and four used branded fonts (546,000 bytes), down from
      48 rasters plus seven fonts (10,638,873 combined bytes), a 79.4% reduction in the explicit
      readiness set. Firefox showed the app-owned loader for 1,318 ms on a cached launch including
      exit, retained it for a delayed onboarding raster, requested five avatar rasters only after
      entering access, changed the standard leaf rotation, kept reduced motion at the identity
      matrix, produced zero page errors, and had zero horizontal overflow at 320/390 widths.
      Physical Android, TalkBack, native decode/memory, and OS font scale remain `BLOCKED / NOT RUN`
      because `adb devices -l` returned no attached target.

---

## Phase 37: Deferred Post-onboarding Image Warm-up

**Purpose**: Keep first entry bounded while warming every later local raster after onboarding can
paint, using controlled parallelism and one request cache.

- [x] T269 Re-read the active contract, inspect startup/section source registries and current
      request measurements, reserve exact writer boundaries, and amend spec/plan/tasks before
      runtime work.
- [x] T270 Write RED coverage proving deferred work is excluded from startup readiness, begins only
      after the app-owned splash exits and a paint opportunity, uses bounded parallel batches,
      prioritizes access/experience imagery, shares one source cache, and places prepared media last.
- [x] T271 Extract the cached local-image loader, implement the singleton failure-tolerant deferred
      queue, and preserve the existing startup and section result contracts.
- [x] T272 Trigger the queue from root as non-blocking post-splash work without visible progress,
      route/state authority, duplicate downloads, or a new dependency.
- [x] T273 Run focused/full tests, typecheck, lint, format, dependency/asset/route checks,
      production exports, delayed browser request-order inspection, available Android evidence, and
      record truthful documentation plus the cohesive local checkpoint.

      Completed locally on 2026-09-06: RED failed on the absent batch helper; the focused file then
      passed 9 tests and the full suite passed 86 files / 1,057 tests. Typecheck, lint, format,
      dependency alignment, Git whitespace, 119-file web export, and 88-file Android JS export
      passed. In Firefox, a 2,600 ms delayed onboarding raster kept the branded splash present with
      zero deferred requests at 1,700 ms. After handoff, all 41 remaining rasters were requested:
      the five avatars and field image began together within 1 ms, the task image opened batch two,
      and the 2.3 MB prepared fixture was last. The flow produced zero browser errors. Physical
      Android decode/cache/memory remains `BLOCKED / NOT RUN` because `adb devices -l` returned no
      attached target.

---

## Phase 38: Ordered Splash-to-loading Startup

**Purpose**: Guarantee that the Ghaf splash is the first visible app-owned frame, then show a
distinct loading state before onboarding.

- [x] T274 Inspect the native/app-owned startup handoff, identify the onboarding exposure, reserve
      exact writer boundaries, and amend the active spec/plan/tasks before runtime work.
- [x] T275 Write RED coverage for the explicit `splash → loading → complete` order, 2,000/1,000 ms
      timing tokens, no loader or entering transparency on splash, asset-gated loading, and deferred
      warming only after completion.
- [x] T276 Implement the ordered root state and distinct splash/loading contents while preserving
      the existing native handoff, asset readiness, fallback, accessibility, and reduced motion.
- [x] T277 Verify fresh cached and delayed launches show no onboarding before splash/loading,
      preserve the exact seven blocking and 41 deferred raster boundaries, and produce no errors.
- [x] T278 Run focused/full tests, typecheck, lint, format, dependency/route/asset checks,
      production exports, detector, available Android evidence, and record the cohesive checkpoint.

      Completed locally on 2026-09-06: RED recorded 2 failing / 8 passing focused tests; the final
      file passed 10 tests and the full suite passed 86 files / 1,058 tests. Typecheck, lint,
      formatting, dependency alignment, detector, Git whitespace, 119-file web export, and 88-file
      Android JS export passed. Fresh Firefox timelines began with a fully covering splash without
      the leaf loader, changed to loading, then exposed onboarding. Cached loading remained 1,013
      ms; a 5,200 ms delayed onboarding raster extended loading to 3,214 ms. All 41 deferred
      requests occurred only during onboarding, and the compact 390×844 splash/loading inspection
      produced zero page errors. Web total splash time included development bundling and critical
      pre-handoff preparation; the post-handoff code token is exactly 2,000 ms. Physical Android
      first-frame timing and motion remain `BLOCKED / NOT RUN` because ADB returned no target.

---

## Phase 39: Returning-family Entry and Dashboard Welcome

**Purpose**: Keep established families out of first-family setup and orient each returning role
with a concise private summary over its own dashboard.

- [x] T279 Re-read the active access/design/safety contract, inspect existing Parent receipts and
      Child pairing authority, reserve exact writer boundaries, and amend spec/plan/tasks before
      runtime work.
- [x] T280 Write focused RED state and source tests proving fresh setup/pairing receives no welcome,
      returning Parent/Child entry receives exactly one role-bound signal, clear boundaries remove
      it, and completed families cannot render the first-family routes.
- [x] T281 Implement the transient store signal and hardened returning-Parent route handoff without
      changing controller authority, receipt semantics, route count, reset, or first-family success.
- [x] T282 Build and integrate one bilingual, accessible, reduced-motion-aware Soft Geometric
      welcome dialog over Parent Home and Child Today using only role-authorized current state and
      existing actions.
- [x] T283 Run focused/full tests, typecheck, lint, format, route/reset/claim checks, detector,
      bilingual compact browser inspection, and available Android evidence; reconcile product,
      design, limitations, runbook, ownership release, and the cohesive checkpoint.

      Completed locally on 2026-09-06: RED recorded 5 expected failures in the new focused file;
      final returning-entry coverage passed 5 tests, the integrated access/localization batch
      passed 4 files / 35 tests, and the full suite passed 87 files / 1,063 tests. Typecheck, lint,
      format, Expo dependency alignment, Git whitespace, the Impeccable detector, and the 39-route
      web export passed. Fresh Parent setup retained Family Basics and first Child pairing showed no
      return dialog. Existing Parent verification went directly to `/parent`; an already paired
      Salem PIN went directly to `/child`. Arabic and English Parent/Child dialogs were inspected at
      320×720 and 390×844 with contained copy, usable actions, no horizontal overflow, and zero page
      errors. Physical Android, TalkBack, native Back/modal behavior, and OS font scale remain
      `BLOCKED / NOT RUN` because `adb devices -l` returned no attached target.

---

## Phase 40: SMAC Family–Sustainability–AI Onboarding

**Purpose**: Make the competition pillars immediately understandable and exciting for children
without weakening Ghaf's safety, privacy, approval, symbolic-growth, or truthful-AI boundaries.

- [x] T284 Re-read the active first-run/design/safety contract, inspect the four-step runtime and
      startup boundary, reserve exact writer scope, and amend spec/plan/tasks before runtime work.
- [x] T285 Write focused RED model, copy, source, startup, and provenance tests for six ordered
      steps, closed three-pillar navigation, bounded AI wording, two new raster assets, exact 48
      artwork entries, nine startup rasters, and the preserved 41-image deferred queue.
- [x] T286 Generate, inspect, normalize, prompt-embed, checksum, and register the Family and bounded
      AI Quiet UAE Botanical Editorial photographs with no people, hands, text, UI, robot, fantasy,
      hazard, or measured-impact claim.
- [x] T287 Implement the child-clear bilingual six-step story, accessible three-pillar navigator,
      energetic editorial layout, and one UI-thread step transition with reduced-motion parity;
      preserve all route, role, task, reward, privacy, reset, and feature-flag authority.
- [x] T288 Run focused/full tests, typecheck, lint, format, route/startup/deferred/asset checks,
      detector, bilingual 320×720 and 390×844 browser inspection, reduced-motion checks,
      production exports, and available Android evidence; reconcile docs, release ownership, and
      create one cohesive local checkpoint without push/merge/deployment/release activation.

      Completed locally on 2026-09-06: the first RED state recorded 6 expected failures / 9 passes
      and the motion refinement recorded 1 expected failure / 11 passes. Final focused coverage
      passed 3 files / 26 tests; the full suite passed 87 files / 1,065 tests. Typecheck, lint,
      formatting, Expo dependency alignment, Git whitespace, the 48-raster prompt scan, and the
      Impeccable detector passed. Web exported 121 files / 39 static routes and Android JS exported
      90 files; both new onboarding rasters appeared byte-identically in both. Firefox traversed
      the six moments, pillar jumps, locale change, 320×720 and 390×844 layouts, and reduced motion
      with 60px pillar targets, no horizontal overflow, and zero page errors. Physical Android,
      TalkBack, OS font scale, and motion feel remain `BLOCKED / NOT RUN` because ADB returned no
      target; named Arabic/UAE, safeguarding, botanical, accessibility, and rights review remains
      `NOT RUN`.

---

## Phase 41: Device-local Family Directory, Multi-child Setup, and AI Profile Helper

**Purpose**: Remember one configured demo family across restarts, guide one or two Child profiles
through a clear setup sequence, and make bounded AI personalization visibly useful and safe.

- [x] T289 Re-read the active product/design/safety/architecture contract, inspect current
      onboarding/session/access boundaries, reserve exact files, verify the official Expo SQLite
      path, and amend spec/plan/tasks before behavior work.
- [x] T290 Write RED tests for the strict versioned local-family schema, platform repository
      contract, corrupted/unknown data, minimum collection, configured profile filtering, restore,
      pairing-marker lifecycle, and reset clearing.
- [x] T291 Extend the Parent onboarding model/controller with one-or-two Child drafts, indexed
      updates, full-directory validation, immutable multi-child receipt restoration, and atomic
      persist-before-authentication semantics.
- [x] T292 Add the service-registry local repository with SQLite-backed native, localStorage web,
      and deterministic memory test adapters; hydrate family/profile/pairing state and clear it on
      Parent reset without persisting task/reward/garden authorities.
- [x] T293 Write RED assistant-policy and presentation tests, then implement deterministic
      allowlisted profile personalization that excludes gender/free text and uses the labeled
      sparkle mark with local/prepared/fallible/Parent-decides disclosure.
- [x] T294 Redesign Family Basics, sequential Child forms, whole-family review, and success copy in
      the current Soft Geometric Arabic-first system with clear ordering, optional selections,
      preserved Back state, keyboard scrolling, 48dp controls, and compact-width resilience.
- [x] T295 Filter Parent/Child profile selectors and summaries to configured users, persist only an
      approved synthetic paired marker, restore returning Parent/Child entry and existing role
      welcome behavior after reload, and reject direct unconfigured-profile access.
- [x] T296 Complete the open source-verifiable R002b readiness audit, add canonical release-review
      and physical-device/human-review packets, update only directly supported checklist markers,
      and retain external gates as `NOT RUN` or `BLOCKED`.
- [x] T297 Run focused/full tests, typecheck, lint, format, dependency/route/reset/privacy/asset
      checks, one final detector pass, bilingual 320×720 and 390×844 persistence/onboarding
      browser journeys, web/Android production exports, and available Android evidence; reconcile
      all docs, release ownership, and cohesive local checkpoints without push/merge/deployment or
      release activation.

      Completed locally on 2026-09-06: the focused local-family/access/AI batch passed 8 files / 83
      tests and the full suite passed 90 files / 1,085 tests. Typecheck, zero-warning lint, format,
      Expo dependency/public-config checks, 37-file product-route inventory, Git whitespace, and
      the one permitted final Impeccable detector pass succeeded. Web exported 121 files / 39
      static routes; Android JavaScript exported 90 files with `expo-sqlite@57.0.2` resolved.
      Firefox completed the one- and two-Child setup/review, direct storage inspection, reset, and
      returning Parent/Child paths across Arabic RTL and English LTR at 320×720 and 390×844 with
      zero horizontal overflow and zero console errors. Physical Android SQLite/process-death,
      Back/IME, TalkBack, OS font scale, and reduced-motion evidence remains `BLOCKED / NOT RUN`
      because `adb devices -l` returned no attached device; all named-human review rows remain
      `NOT RUN` and every R002b flag stays default off.

---

## Phase 42: Convergence

- [x] T298 Persist an established family's changed application language and prefer that current
      local value on returning Parent handoff per FR-191 and FR-197 (partial).

      Completed locally on 2026-09-06: focused RED reproduced the stored-`ar`/active-`en`
      mismatch, then the corrected store test passed 12/12. The complete local-family batch passed
      8 files / 83 tests and the full suite passed 90 files / 1,085 tests. The existing family
      record now persists a valid changed app language and returning Parent entry prefers it without
      mutating the immutable completion receipt or restoring a session.

---

## Phase 43: AI-narrated Square Onboarding

**Purpose**: Present the existing six-moment Ghaf Guide introduction as a compact story with square
artwork, high-contrast lower progress, clearer energy, and optional accessible on-device narration.

- [x] T299 Inspect the active onboarding, voice, accessibility, dependency, and ownership
      boundaries; reserve exact files; measure the `expo-audio`/missing-binary TTS gap; and amend
      spec, plan, tasks, product, design, limitations, and first-run intake before behavior work.
- [x] T300 Write focused RED source/resource tests for a 1:1 image frame, lower high-contrast
      six-segment story progress, concise first-person bilingual scripts, visible narrator
      identity/origin, optional stop/enable/replay controls, step/locale/exit cleanup, screen-reader
      suppression, and nonblocking speech failure.
- [x] T301 Install the Expo-compatible `expo-speech` package and implement one bounded onboarding
      narration hook with no microphone, recording, background listening, provider, route, store,
      or product authority.
- [x] T302 Recompose `FirstRunOnboarding` with the lower high-contrast story rail, square local
      artwork, narrator control, and rewritten resources while preserving six-state/pillar
      navigation, reduced motion, startup/deferred sets, and all access/product behavior.
- [x] T303 Run focused/full tests, typecheck, lint, format, Expo dependency/route/startup checks,
      the one final Impeccable detector pass, web export, compact bilingual browser inspection,
      and available Android/TalkBack/TTS evidence.
- [x] T304 Reconcile product/design/limitations/runbook/ownership with exact results, retain native
      and named-human gaps truthfully, and create one cohesive local commit without push, merge,
      deployment, or release activation.

      Completed locally on 2026-09-07: the initial RED state recorded 3 failures / 10 passes; the
      requested lower-indicator correction and web opt-in voice guard each recorded 1 expected
      failure / 12 passes. The final focused file passed 13 tests and the full suite passed 90 files
      / 1,086 tests. Typecheck, zero-warning lint, format, Expo dependency/public-config, Git
      whitespace, the final Impeccable detector, 39-route web export, and 90-file Android
      JavaScript export passed. Firefox inspected Arabic RTL at 390×844 and English LTR at 320×720,
      measured a 275.8×275.8 px crop, found no horizontal overflow, confirmed the lower rail above
      the action and `1/6 → 2/6`, and exercised the localized web speech fallback with zero page
      errors. Physical Android speech/audio focus, TalkBack, OS font scale, motion feel, and named
      review remain `BLOCKED / NOT RUN`; ADB returned no target.

---

## Phase 44: Compact Audio Onboarding Correction

**Purpose**: Preserve the six-moment AI introduction while reclaiming height, simplifying progress
and voice control, and making narration replay reliable through prepared local audio.

- [x] T305 Re-read the active onboarding/audio/safety/asset contract, inspect all six 1200×800
      source photographs, reserve exact files, and amend spec/plan/tasks/product/design/limitations/
      runbook/first-run intake before behavior work.
- [x] T306 Write focused RED source/resource tests for responsive 3:2 artwork, centered copy, the
      original lower current/total plus dots, removal of the Guide panel/toggle, one accessible
      speaker replay control, image/layout-gated automatic narration, quiet foreground ambience,
      screen-reader suppression, exit cleanup, local provenance, and no microphone/runtime URL.
- [x] T307 Prepare exact bilingual synthetic narration clips plus one locally authored nature
      soundscape under `assets/audio/onboarding/`, record authoring provenance/checksums, register
      static local sources, and remove the now-unused `expo-speech` dependency.
- [x] T308 Implement the bounded narration and ambience hooks and recompose
      `FirstRunOnboarding` with the 3:2 frame, centered copy, single speaker icon, and restored dot
      row while preserving reducer, pillar, startup/deferred-image, route, privacy, and product
      behavior.
- [x] T309 Run focused/full tests, typecheck, lint, format, Expo dependency/public-config checks,
      one final Impeccable detector pass, web/Android exports, compact bilingual browser/audio
      inspection, and available physical Android/TalkBack/audio evidence.
- [x] T310 Reconcile the evidence in runbook/ownership, retain browser-autoplay/native/human gates
      truthfully, and create one cohesive local commit without push, merge, deployment, or release
      activation.

      Completed locally on 2026-09-07: RED recorded 2 expected failures / 11 passes and the final
      focused file passed 13 tests. The full suite passed 90 files / 1,086 tests; typecheck,
      zero-warning lint, formatting, Expo dependency/public-config checks, Git whitespace, and the
      final Impeccable detector passed. Web exported 134 files / 39 static routes with 13 MP3s;
      Android JavaScript exported 103 files and all 13 prepared-audio hashes matched. Firefox
      measured exact 3:2 frames at Arabic 390×844 and English 320×720, a 48dp speaker, the 24px
      original dot row directly above navigation, centered copy, and zero overflow. The speaker
      requested narration plus ambience; subsequent explicit navigation requested the matching
      settled-slide narration. A fresh web launch made no pre-gesture autoplay call and had zero
      final console errors; first-screen web autoplay remains platform-limited. Physical Android,
      TalkBack, audio focus, font scale, and named Arabic/voice/rights review remain
      `BLOCKED / NOT RUN`; ADB returned no target.

---

## Phase 45: Returning Parent Identifier Lookup

**Purpose**: Bind the one local family to its Parent identifier so returning sign-in can verify
membership and always bypass first-family creation.

- [x] T311 Re-read the active access/privacy/storage contract, inspect the current local record and
      verification routes, reserve exact writer boundaries, and amend spec/plan/tasks before
      behavior work.
- [x] T312 Write RED schema, repository, store, route, and bilingual-copy tests for normalized
      identifier persistence, schema-1 canonical migration, mismatch denial without state change,
      explicit-sign-up-only creation, direct returning handoff, neutral copy, and removal of the
      simulated biometric control.
- [x] T313 Implement schema-2 local Parent identifier storage/migration and separate create-family
      versus returning-sign-in store commands without persisting the deterministic code or session.
- [x] T314 Harden sign-in/verification routing and rewrite the Parent access UI so a matched Parent
      enters the existing family directly, an unknown identifier stays out of setup, and the three
      auth screens show no demo/synthetic/not-real messaging or fake biometric action.
- [x] T315 Run focused/full tests, typecheck, lint, format, dependency/config/route/privacy checks,
      web/Android exports, compact bilingual browser inspection, and available physical Android
      evidence; reconcile docs, release ownership, and one cohesive local commit without push,
      merge, deployment, or release activation.

      Completed locally on 2026-09-07: RED recorded 15 expected failures / 40 passes; the final
      focused batch passed 6 files / 84 tests and the full suite passed 90 files / 1,090 tests.
      Typecheck, zero-warning lint, formatting, Expo dependency/public-config checks, Git
      whitespace, schema/privacy scans, 39-route web export (134 files), and Android JavaScript
      export (103 files) passed. Firefox created the schema-2 family, inspected the normalized
      Parent identifier, denied an unknown email without leaving sign-in, matched a differently
      cased/space-padded email, and entered `/parent` after `424242` without setup. Arabic 390×844
      and English 320×720 had no horizontal overflow or console errors. Physical Android and named
      review remain `BLOCKED / NOT RUN`; `adb devices -l` returned no target.
