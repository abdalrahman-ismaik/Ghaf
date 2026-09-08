# Tasks: Bounded Live AI Drafting and Coach

**Input**: Design documents from `specs/004-bounded-live-ai/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/bounded-ai-v1.md`

**Tests**: TDD is mandatory. Each story starts with RED behavioral tests, then the smallest GREEN
implementation, then refactoring with tests remaining green.

**Organization**: Tasks are grouped by the five approved user stories. All implementation remains
default-off and synthetic/fake-provider only; activation gates are outside this task list.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Safe to execute concurrently only when a separate writer owns the listed file
- **[Story]**: Maps directly to User Story 1–5 in `spec.md`
- Every task names its file boundary

## Phase 1: Setup and planning integration

**Purpose**: Establish the active Feature 004 artifacts, dependency, and clean baseline.

- [x] T001 Validate and format Feature 004 design artifacts in `specs/004-bounded-live-ai/`
- [x] T002 Record the active planning/runtime ownership boundaries in `TEAM_OWNERSHIP.md`
- [x] T003 Update the managed Spec Kit plan pointer through `.specify/feature.json` and `AGENTS.md`
- [x] T004 Add Expo-compatible FileSystem for explicit audio deletion and Expo Crypto for random 128-bit request bindings in `package.json` and `package-lock.json`
- [x] T005 Record the pre-runtime typecheck/lint/format/test/dependency baseline in `specs/004-bounded-live-ai/tasks.md`

---

## Phase 2: Foundational contracts and controls

**Purpose**: Build default-off selection, shared provider-neutral types, deterministic providers,
and fake-boundary authentication before any user story UI.

**Critical**: No story integration starts until this phase is green.

- [x] T006 [P] Write RED independent/default-off parsing tests in `tests/bounded-ai-feature-flags.test.ts`
- [x] T007 Implement exact Feature 004 flags in `src/config/aiFeatureFlags.ts` and document disabled examples in `.env.example`
- [x] T008 [P] Write RED shared closed-schema, correlation, grant, terminal-result, and zero-effects tests in `tests/bounded-ai-contracts.test.ts`
- [x] T009 Implement provider-neutral Feature 004 entities and strict shared validators in `src/models/boundedAi.ts`
- [x] T010 Add Parent drafting, Child text, voice transcription, token, and ephemeral-media interfaces to `src/services/interfaces/index.ts`
- [x] T011 Add canonical prepared Feature 004 fixtures in `src/services/mock/boundedAiFixtures.ts`
- [x] T012 Implement deterministic F4/F5/voice providers in `src/services/mock/boundedAi.ts`
- [x] T013 Extend registry construction/injection and public exports without changing defaults in `src/services/mock/index.ts` and `src/services/index.ts`
- [x] T014 [P] Write RED capability-claim/auth-before-parse/replay tests in `tests/bounded-ai-gateway-security.test.ts`
- [x] T015 Implement closed capability claims, HMAC verification, replay, rate/budget/concurrency, origin, and safe-error utilities in `workers/ghaf-ai-gateway/src/security.ts`
- [x] T016 Create the non-deployed Feature 004 Worker shell/configuration in `workers/ghaf-ai-gateway/src/index.ts`, `workers/ghaf-ai-gateway/wrangler.jsonc`, and `workers/ghaf-ai-gateway/README.md`
- [x] T017 Verify ignore coverage and run the scoped secret scan against `.gitignore`, Expo configuration, and `workers/ghaf-ai-gateway/`

**Checkpoint**: All flags are false; prepared providers complete every accepted path; fake tokens
can be verified without any mobile/deployed credential.

---

## Phase 3: User Story 1 — Parent drafts from a reviewed archetype (Priority: P1)

**Goal**: Show a bounded bilingual wording diff while deterministic task authorities and Parent
review/approval remain unchanged.

**Independent Test**: Enable only F4 in a synthetic harness; request, compare, accept, keep, edit,
and fail over for each reviewed archetype. Assert every non-copy authority field is retained.

### RED tests

- [x] T018 [P] [US1] Write request/suggestion schema and archetype allowlist tests in `tests/parent-task-drafting.test.ts`
- [x] T019 [P] [US1] Write exhaustive authority-mutation and deterministic mapper tests in `tests/parent-task-drafting-authority.test.ts`
- [x] T020 [P] [US1] Write HTTPS/token/timeout/status/schema/correlation adapter tests in `tests/gateway-parent-task-drafting.test.ts`
- [x] T021 [P] [US1] Write store stale/fallback/accept/keep/edit/zero-effects tests in `tests/parent-task-drafting-store.test.ts`
- [x] T022 [P] [US1] Write Parent composer flag/diff/origin/RTL/accessibility source tests in `tests/parent-task-drafting-ui.test.tsx`

### GREEN implementation and integration

- [x] T023 [US1] Implement F4 closed schemas, authority snapshots, prepared result, and copy-only mapper in `src/features/assistants/parentTaskDrafting.ts`
- [x] T024 [US1] Implement the HTTPS F4 adapter with blocked-token and bounded-timeout behavior in `src/services/remote/GatewayParentTaskDraftingService.ts` and `src/services/remote/index.ts`
- [x] T025 [US1] Add the F4 Worker route, strict provider prompt/output validation, and operation policy in `workers/ghaf-ai-gateway/src/index.ts`
- [x] T026 [US1] Add F4 request revision, immutable snapshot, same-attempt fallback, accept/keep/edit, and reset actions in `src/state/usePrototypeStore.ts`
- [x] T027 [US1] Integrate curated F4 controls and retained-versus-suggested diff into `src/components/family-growth/ParentTaskComposer.tsx`
- [x] T028 [US1] Add equivalent Arabic/English F4 disclosure, control, origin, fallback, and error strings in `src/i18n/resources.ts`
- [x] T029 [US1] Refactor the F4 slice while keeping focused tests green in `src/features/assistants/parentTaskDrafting.ts`, `src/state/usePrototypeStore.ts`, and `src/components/family-growth/ParentTaskComposer.tsx`

**Checkpoint**: F4 is independently testable, default off, and cannot mutate task authority or
bypass Parent review.

---

## Phase 4: User Story 2 — Child receives bounded live text help (Priority: P2)

**Goal**: Add a one-turn, task-scoped, age-banded Coach request with local safe termination and
prepared fallback.

**Independent Test**: Enable only F5 text in a synthetic harness and exercise every band/intent,
boundary, safety case, failure, stale state, terminal response, and zero effect.

### RED tests

- [x] T030 [P] [US2] Write age-discriminated request and bounded-text policy tests in `tests/live-child-coach.test.ts`
- [x] T031 [P] [US2] Write bilingual safety/adversarial/terminal output corpus tests in `tests/live-child-coach-safety.test.ts`
- [x] T032 [P] [US2] Write HTTPS/token/timeout/status/schema/correlation adapter tests in `tests/gateway-child-coach.test.ts`
- [x] T033 [P] [US2] Write store task/profile/grant/stale/fallback/zero-effects tests in `tests/live-child-coach-store.test.ts`
- [x] T034 [P] [US2] Write Child panel band/terminal/disclosure/adult-exit/RTL/accessibility tests in `tests/live-child-coach-ui.test.tsx`

### GREEN implementation and integration

- [x] T035 [US2] Implement age-banded request builders, local prefilter, terminal response validator, and prepared fallback in `src/features/assistants/liveChildCoach.ts`
- [x] T036 [US2] Implement the HTTPS Child text adapter with blocked-token and bounded-timeout behavior in `src/services/remote/GatewayChildCoachService.ts` and `src/services/remote/index.ts`
- [x] T037 [US2] Add the Child text Worker route, auth/rate/body/catalog/prompt/output safety policy in `workers/ghaf-ai-gateway/src/index.ts`
- [x] T038 [US2] Add Child request revision, task/profile/grant snapshots, local termination, fallback, terminal clearing, and reset actions in `src/state/usePrototypeStore.ts`
- [x] T039 [US2] Build the reusable terminal age-banded Coach UI in `src/components/family-growth/LiveChildCoachPanel.tsx`
- [x] T040 [US2] Integrate the F5 text panel into the existing support section in `app/child/task.tsx`
- [x] T041 [US2] Add equivalent Arabic/English Child notice, intent, disclosure, fallback, denial, and terminal strings in `src/i18n/resources.ts`
- [x] T042 [US2] Refactor the F5 text slice while keeping focused tests green in `src/features/assistants/liveChildCoach.ts`, `src/state/usePrototypeStore.ts`, and `src/components/family-growth/LiveChildCoachPanel.tsx`

**Checkpoint**: Each accepted intent produces one terminal result or deterministic safe exit; no
band has unrestricted chat and no remote result changes persistent authority.

---

## Phase 5: User Story 3 — Guardian controls live Child access and data (Priority: P2)

**Goal**: Separate text and voice grants, Parent reauthentication, Child notice/decline, immediate
revocation, and transient deletion without claiming production consent/authentication.

**Independent Test**: Grant/revoke one capability for one synthetic test profile, confirm the
other capability/profile remains off, invalidate pending calls, and inspect deletion/control state.

### RED tests

- [x] T043 [P] [US3] Write separate grant/version/expiry/revoke/reauth/profile-isolation tests in `tests/live-child-ai-grants.test.ts`
- [x] T044 [P] [US3] Write Parent permission and Child notice/decline copy/flow tests in `tests/live-child-ai-permissions-ui.test.tsx`

### GREEN implementation and integration

- [x] T045 [US3] Add synthetic implementation-only text/voice grant models and validation without changing production claims in `src/models/boundedAi.ts` and `src/features/access/index.ts`
- [x] T046 [US3] Add grant issuance/revocation/version checks and pending-request invalidation in `src/services/mock/boundedAi.ts` and `src/state/usePrototypeStore.ts`
- [x] T047 [US3] Add separate default-off text and voice permission actions behind Parent reauthentication in `app/parent/settings/permissions.tsx`
- [x] T048 [US3] Add equivalent Arabic/English purpose, risk, provider-blocked, notice, decline, revoke, and deletion strings in `src/i18n/resources.ts`
- [x] T049 [US3] Refactor the grant slice while keeping focused tests green in `src/models/boundedAi.ts`, `src/services/mock/boundedAi.ts`, and `src/state/usePrototypeStore.ts`

**Checkpoint**: Synthetic fixture grants are visibly not production consent/auth; revocation and
profile/task changes fail closed before inference and display.

---

## Phase 6: User Story 4 — Child reviews a push-to-talk transcript (Priority: P3)

**Goal**: Implement separately gated ages-12–14 foreground held recording, transcript review,
delete-before-send, explicit text-only Coach send, and complete transient cleanup.

**Independent Test**: Use fake native media/file/transcription adapters to exercise permission,
capture, release, background/interruption, review/delete/send, stale/reset, limits, and cleanup;
then compile the native adapter without activating it or using real audio.

### RED tests

- [x] T050 [P] [US4] Write pure voice state-machine transition and invalid-transition tests in `tests/live-voice-capture.test.ts`
- [x] T051 [P] [US4] Write fake recorder/file cleanup/transcriber and text-only Coach handoff tests in `tests/live-voice-services.test.ts`
- [x] T052 [P] [US4] Write voice Worker auth/size/type/transcript/deletion/failure tests in `tests/gateway-voice-transcription.test.ts`
- [x] T053 [P] [US4] Write panel age/grant/permission/held-action/review/delete/send/accessibility tests in `tests/live-voice-ui.test.tsx`
- [x] T054 [P] [US4] Write app background/route/task/profile/grant/sign-out/reset integration tests in `tests/live-voice-integration.test.tsx`

### GREEN implementation and integration

- [x] T055 [US4] Implement the pure foreground voice state machine and bounded transcript validation in `src/features/assistants/liveVoiceCapture.ts`
- [x] T056 [US4] Implement cache-file inspection/deletion and Expo Audio recorder adapters in `src/services/native/ExpoVoiceCaptureService.ts` and `src/services/native/index.ts`
- [x] T057 [US4] Implement prepared and HTTPS transcription services with blocked-token fallback in `src/services/mock/boundedAi.ts`, `src/services/remote/GatewayVoiceTranscriptionService.ts`, and `src/services/remote/index.ts`
- [x] T058 [US4] Add the transcription Worker route, remeasured limits, text-only response, and deletion handling in `workers/ghaf-ai-gateway/src/index.ts`
- [x] T059 [US4] Configure microphone permission while keeping background recording/playback false in `app.config.ts`
- [x] T060 [US4] Add ephemeral voice state/actions, text-only Coach send, stop/cleanup invalidation, and reset integration in `src/state/usePrototypeStore.ts`
- [x] T061 [US4] Build the ages-12–14 held push-to-talk/transcript review panel in `src/components/family-growth/LiveVoiceCapturePanel.tsx`
- [x] T062 [US4] Integrate the voice panel into the existing Child support section without changing current P0 profiles in `app/child/task.tsx`
- [x] T063 [US4] Add equivalent Arabic/English permission, recording, review, delete, send, fallback, and cleanup strings in `src/i18n/resources.ts`
- [x] T064 [US4] Refactor the voice slice while keeping focused tests green in `src/features/assistants/liveVoiceCapture.ts`, `src/services/native/ExpoVoiceCaptureService.ts`, and `src/components/family-growth/LiveVoiceCapturePanel.tsx`

**Checkpoint**: Voice code is independently default off, current profiles expose no real capture,
raw audio never enters Coach generation, and activation remains blocked on external/native gates.

---

## Phase 7: Cross-cutting integration and evidence

**Purpose**: Prove flags-off regression, zero effects, reset, privacy, bilingual UI, and build health
across all stories.

- [x] T065 [P] Write combined flag independence, fallback, zero-effects, and exact reset tests in `tests/bounded-ai-integration.test.tsx`
- [x] T066 [P] Add Worker no-content log/error canaries and operation-isolation tests in `tests/bounded-ai-gateway.test.ts`
- [x] T067 Run all Feature 004 focused RED/GREEN suites and record exact evidence in `specs/004-bounded-live-ai/tasks.md`
- [x] T068 Run `npm run typecheck`, `npm run lint`, `npm run format:check`, and full `npm test`; record exact evidence in `specs/004-bounded-live-ai/tasks.md`
- [x] T069 Run Expo dependency/config checks plus web and Android JavaScript exports; record exact evidence in `specs/004-bounded-live-ai/tasks.md`
- [x] T070 Run Git whitespace, tracked-state, public-bundle secret, and scoped security scans; record exact evidence in `specs/004-bounded-live-ai/tasks.md`
- [x] T071 Update truthful implementation/blocked evidence in `PROTOTYPE_LIMITATIONS.md`, `PRODUCT.md`, and `DEMO_RUNBOOK.md`
- [x] T072 Complete the implementation handoff, release ownership, and unchanged external gates in `TEAM_OWNERSHIP.md`

---

## Phase 8: User Story 5 — Minimal server-only MCP projection (Priority: P3)

**Goal**: Expose the same two bounded text transformations through a local, independently
default-off MCP endpoint without adding MCP to Expo or the judge journey.

**Independent Test**: Enable MCP only in the fake Worker harness, discover exactly two read-only
tools, invoke both with synthetic exact-scope credentials, and prove HTTPS parity plus fail-closed
disabled, legacy, unknown-tool/argument, replay, and scope-mismatch behavior.

- [x] T073 [US5] Amend the approved specification, plan, research, data model, contract, quickstart, tasks, and ownership boundary for the exact minimal MCP scope in `specs/004-bounded-live-ai/` and `TEAM_OWNERSHIP.md`
- [x] T074 [US5] Pin the official MCP server package for the Worker-only boundary in `package.json` and `package-lock.json`
- [x] T075 [US5] Write RED discovery, disabled/legacy/header, tool-call parity, authorization-before-arguments, unknown-capability, and no-Expo-import tests in `tests/bounded-ai-mcp.test.ts`
- [x] T076 [US5] Extract shared Parent and Child text operation functions without changing HTTPS behavior in `workers/ghaf-ai-gateway/src/operations.ts` and `workers/ghaf-ai-gateway/src/index.ts`
- [x] T077 [US5] Implement the default-off stateless MCP handler with exactly two tools in `workers/ghaf-ai-gateway/src/mcp.ts` and route it from `workers/ghaf-ai-gateway/src/index.ts`
- [x] T078 [US5] Complete MCP structured-result/error parity, scope/replay, unsupported-capability, and source-isolation tests in `tests/bounded-ai-mcp.test.ts`
- [x] T079 [US5] Document local synthetic verification and truthful non-deployment/judge boundaries in `workers/ghaf-ai-gateway/README.md`
- [x] T080 [US5] Run focused and repository validation, record exact evidence here, and release the MCP reservation in `TEAM_OWNERSHIP.md`

**Checkpoint**: The adapter is locally testable, exact, and default off; the native app remains the
only judge-facing surface and no external activation gate changes.

---

## Phase 9: AI Services 1–3 presentation integration

**Purpose**: Make the prepared profile helper, Parent Guide, prepared Child Coach, and Parent
summary read as one coherent experience after Feature 004 integration, without changing any AI,
task, consent, reward, or progression authority.

- [x] T081 Reserve the exact UI-only boundary and document the post-Feature-004 spatial thesis in `TEAM_OWNERSHIP.md`
- [x] T082 Write a RED hierarchy, origin, bilingual-copy, and Parent/Child authority test in `tests/ai-services-presentation-integration.test.tsx`
- [x] T083 Add one reusable prepared/live assistant identity header in `src/components/AssistantIdentity.tsx`
- [x] T084 Restructure profile recommendations and Parent Task Builder guidance in `src/components/access/AIProfilePreview.tsx` and `src/components/family-growth/ParentTaskComposer.tsx`
- [x] T085 Restructure the prepared Child Coach and Parent summary hierarchy in `app/child/task.tsx` and `src/components/family-growth/ParentPatternSummary.tsx`
- [x] T086 Add equivalent Arabic/English presentation copy in `src/i18n/resources.ts`
- [x] T087 Run focused tests, repository checks, attempt one bounded visual pass, and record exact passed/blocked evidence here and in `TEAM_OWNERSHIP.md`

**Checkpoint**: Prepared/live origin, capability purpose, bounded action, result, and human
authority appear in that order; one primary action remains obvious; Feature 004 flags remain
independent/default off and every deterministic fallback remains complete.

---

## Phase 10: Parent AI disclosure consolidation

**Purpose**: Keep one clear Parent-facing AI fallibility/non-diagnosis notice without repeating the
same caveat across setup, Task Builder, summary, and check-in surfaces.

- [x] T088 Reserve the exact UI, resource, test, design, and evidence boundary in `TEAM_OWNERSHIP.md`
- [x] T089 Amend the Parent disclosure contract in `specs/004-bounded-live-ai/{spec.md,plan.md,tasks.md}` before runtime changes
- [x] T090 Write a RED exact-once Parent notice and unchanged Child disclosure test in `tests/ai-services-presentation-integration.test.tsx`
- [x] T091 Consolidate Parent presentation in `src/components/family-growth/{ParentPatternSummary.tsx,ParentTaskComposer.tsx,ParentCheckIn.tsx}` and `src/i18n/resources.ts`
- [x] T092 Reconcile localization and Parent review source contracts in `tests/{localization-parity.test.ts,r002a-parent-review-presentation.test.ts}`
- [x] T093 Run focused and repository validation, the Impeccable detector, and record exact evidence in this file and `TEAM_OWNERSHIP.md`

**Checkpoint**: Parent Home contains the one generic Parent AI caveat in small readable type;
prepared/live origin and Parent review authority remain contextual, validated metadata remains
intact, and no Child disclosure or adult exit changes.

---

## Dependencies and execution order

### Phase dependencies

- Phase 1 has no dependency.
- Phase 2 depends on Phase 1 and blocks every user story.
- US1 depends on Phase 2 and is the first independently valuable slice.
- US2 depends on Phase 2; it does not depend on F4 behavior.
- US3 depends on Phase 2 and must complete before store/UI activation paths for US2/US4 can be
  considered complete.
- US4 depends on Phase 2, US2 bounded-text validation, and US3 separate voice grants.
- US5 depends on Phase 2 plus the completed F4 and F5 text operation handlers; it does not depend
  on voice implementation or activation.
- Phase 7 depends on every implemented story.

### User-story dependency graph

```text
Setup → Foundation → US1
                   → US2 ─┐
                   → US3 ─┼→ US4
                   → US5  │
                          └→ Cross-cutting validation
```

### Within each story

- RED tests must fail for missing behavior before implementation.
- Closed schemas/models precede providers.
- Providers precede store commands.
- Store commands precede UI integration.
- Local/fake provider evidence precedes any remote/native adapter claim.
- Focused tests pass before a cohesive commit.

### Parallel opportunities

- T006, T008, and T014 touch separate test files.
- Within US1, T018–T022 are independent RED files.
- Within US2, T030–T034 are independent RED files.
- Within US4, T050–T054 are independent RED files.
- F4 and the pure F5 text policy can proceed independently after Phase 2 if separate writers reserve
  non-overlapping files; store/registry/resources integration remains serialized.

## Parallel example: User Story 1

```text
Task: T018 request/suggestion contract tests in tests/parent-task-drafting.test.ts
Task: T019 authority mutation tests in tests/parent-task-drafting-authority.test.ts
Task: T020 remote adapter tests in tests/gateway-parent-task-drafting.test.ts
Task: T022 UI source/component tests in tests/parent-task-drafting-ui.test.tsx
```

## Implementation strategy

### MVP first

1. Complete Setup and Foundation.
2. Complete US1 F4 Parent drafting.
3. Validate and commit the independent F4 slice with all flags false.
4. Add US2 and US3 together because live Child text requires the grant boundary.
5. Add US4 only after the bounded-text and separate-grant contracts are green.

### Incremental delivery

- Commit planning/setup separately.
- Commit foundational contracts/flags/prepared providers.
- Commit F4 policy/service/store/UI.
- Commit F5 text plus grants.
- Commit the MCP adapter after both text handlers exist; do not wait for voice.
- Commit voice state/native/transcription/UI.
- Commit cross-cutting evidence/documentation.

No commit activates a flag, deploys a Worker, calls a provider, or marks external evidence passed.

## Evidence log

Implementation commands and exact counts are appended here as tasks complete. `PASSED` applies only
to the named evidence; external gates remain as defined in `quickstart.md`.

- **Pre-runtime baseline — PASSED (2026-09-07)**: `npm run typecheck`, `npm run lint`,
  `npm run format:check`, `npm test -- --run`, and `npx expo install --check` exited successfully.
  Vitest reported 93 files and 1,116 tests passed. This is source/local evidence only; no provider,
  deployment, real media, or physical Android gate ran.
- **Ephemeral deletion dependency — PASSED (2026-09-07)**: Expo installed
  `expo-file-system@57.0.6`, `npx expo install --check` reported dependencies up to date, and
  `npm ls expo-file-system --depth=0` resolved the expected direct version. The npm audit summary
  still reports 14 pre-existing moderate findings; no automatic or breaking audit rewrite was run.
- **Correlation dependency — PASSED (2026-09-07)**: The F4 UI exposed the missing secure random-ID
  primitive before integration. Expo installed `expo-crypto@57.0.2`; `npx expo install --check`
  reported dependencies up to date and `npm ls expo-crypto --depth=0` resolved the expected direct
  version. Each explicit request now creates separate UUID request and binding values; no timestamp,
  counter, or `Math.random()` is used in the app path.
- **Foundation RED/GREEN — PASSED (2026-09-07)**: The two initial suites failed because the new
  flag and contract modules did not exist; the gateway security suite then failed on the missing
  security module. After implementation, four focused files passed 24 tests. Typecheck and
  zero-warning lint passed. The registry selects prepared providers for all three capabilities and
  its token service fails closed unless a trusted dependency is injected.
- **Boundary hygiene — PASSED (2026-09-07)**: `.dev.vars*`, `.wrangler/`, and `.env.*` are ignored;
  the scoped tracked-file scan found no public token/secret/API-key variable, provider-key pattern,
  or assigned capability secret. Worker source/config/README formatting passed. The Worker is
  explicitly non-deployed and still returns `BUDGET_BLOCKED` after authentication/capacity checks
  until story-specific handlers land.
- **F4 RED/GREEN — PASSED (2026-09-07)**: Five focused suites were first RED for the missing
  domain, adapter, store, and UI seams; the Worker route separately recorded 503/503 before its
  handler landed. The final focused run passed five files and 25 tests with typecheck and
  zero-warning lint. Evidence covers all four reviewed archetypes at the strict schema boundary,
  prohibited output, whole-authority snapshot comparison and stale mutation rejection, HTTPS and
  blocked-token behavior, 2.5-second no-retry timeout, closed live envelope, authenticated Worker
  capacity release, same-attempt prepared fallback, accept/keep/edit, existing Parent review,
  zero progression effects, independent default-off UI, RTL layout helpers, polite announcements,
  truthful origin, and Arabic/English key parity. No provider or deployment ran.
- **F4 full regression — PASSED (2026-09-07)**: Typecheck, zero-warning lint, formatting, Expo
  dependency compatibility, Git whitespace, and the full 102-file / 1,165-test suite passed. This
  does not change any external activation gate or constitute physical Android/provider evidence.
- **Minimal MCP RED/GREEN — PASSED (2026-09-07)**: The initial test failed because the MCP module
  did not exist; the router test then recorded the expected 404/403 mismatch before the default-off
  guard and exact host/origin validation landed. The final dedicated MCP run passed one file and 10
  tests. Evidence covers content-free discovery of exactly two read-only tools, strict closed
  arguments, shared HTTPS-operation results, authorization and replay before inference, disabled
  and exact-case switches, legacy/unknown capability rejection, safe errors, and absence of MCP
  imports or setup wording in `app/` and `src/`.
- **Combined gateway regression — PASSED (2026-09-07)**: The final Parent drafting, Child Coach,
  voice transcription, gateway security, and MCP run passed five files and 61 tests. The voice
  route stays HTTPS-only and is not advertised through MCP. It remeasures the complete multipart
  request and audio, binds exact voice grant/notice claims, rejects off-task or unsafe transcripts,
  zeroes transient byte buffers, and returns text-only deletion evidence.
- **Repository validation — PASSED (2026-09-07)**: `npm run typecheck`, zero-warning
  `npm run lint`, `npm run format:check`, `npx expo install --check`, Git whitespace checks, and the
  full 117-file / 1,280-test suite passed. The pinned dependency resolves
  `@modelcontextprotocol/server@2.0.0` with `@modelcontextprotocol/core@2.0.0`.
- **Export and isolation evidence — PASSED WITH KNOWN WARNING (2026-09-07)**: Web and Android Expo
  JavaScript exports completed with 39 static routes; Android produced its Hermes bundle and 94
  assets. Web emitted the known `expo-file-system` unsupported-platform warning from the default-off
  voice dependency. Scanning both exports found no MCP SDK, protocol, discovery, or tool markers,
  and the scoped tracked-source secret-pattern scan found zero credential signatures.
- **External gates — BLOCKED / NOT RUN (2026-09-07)**: No Worker or provider was deployed or
  called, no real Child data or media was used, and MCP remains off unless its server switch is
  exactly `true`. Judges use only the native app and do not connect an MCP client. Trusted
  authentication/broker, shared replay and budget stores, provider/ZDR, privacy/legal,
  safeguarding, Arabic/UAE human review, accessibility, incident response, deletion evidence,
  physical Android, and judge rehearsal remain unchanged release gates.
- **F5 text/grants/voice RED/GREEN — PASSED (2026-09-07)**: Tests first recorded the missing
  Child gateway, exact reviewed-voice capability binding, and multipart-body remeasurement as
  expected failures. The final consolidated Feature 004 run passed 24 files and 164 tests.
  Evidence covers every age band, task relevance and prohibited-input filters, one terminal result,
  separate versioned/expiring text and voice grants, reauthentication, revocation, profile/task
  invalidation, same-attempt prepared fallback, zero progression effects, a foreground 15-second /
  256-KiB capture contract, permission denial, app background/route/sign-out cleanup, local deletion
  before transcript display, explicit review/approval, text-only Coach handoff, strict multipart
  parsing, in-memory byte clearing, and content-free gateway errors.
- **Final repository regression — PASSED (2026-09-07)**: `npm run typecheck`, zero-warning
  `npm run lint`, `npm run format:check`, `npx expo install --check`, and Git whitespace checks
  exited successfully. `npm test -- --run` passed 117 files and 1,280 tests. The two final
  cross-feature suites prove independent flags, combined fallback, exact reset, operation
  isolation, auth-before-body, and no Child-content logging/error reflection.
- **Final public config and exports — PASSED WITH KNOWN WEB WARNING (2026-09-07)**: Expo public
  config contains `android.permission.RECORD_AUDIO` while both background recording and playback
  remain false. Web export produced 39 static routes / 135 files; Android JavaScript export
  produced 103 files including one Hermes bundle and 94 assets. Web emitted the known
  `expo-file-system is not supported on web` warning; the prepared/text fallback remains available.
  Exact scans found no MCP package/server/discovery/tool marker or gateway HMAC secret in either
  public export. The shared `draft_parent_task_v1` app operation name is expected and is not an MCP
  client or credential.
- **Final boundary hygiene — PASSED (2026-09-07)**: `.dev.vars` and `.wrangler/` remain ignored;
  the tracked runtime source scan found no assigned provider/API/capability secret and every public
  Feature 004 flag remains explicitly false in `.env.example`. The working tree retained the
  user's pre-existing `.codex/config.toml`, design/logo directories, and visual-output artifacts
  unchanged.
- **Physical/provider evidence — BLOCKED / NOT RUN (2026-09-07)**: No provider call, Worker/MCP
  deployment, real credential, real Child data/audio, remote deletion/ZDR check, or physical
  Android recording/TalkBack/process-death run occurred. Named privacy/legal, safeguarding,
  Arabic/UAE, accessibility, incident, provider, deletion, and human-rehearsal owners must still
  approve activation.
- **AI Services 1–3 presentation integration — PASSED AUTOMATED / VISUAL BLOCKED (2026-09-07)**:
  Commit `d56b896` unifies prepared/live identity and origin, separates profile support style from
  suggested categories, restores one Task Builder title hierarchy, places the adult exit before
  bounded Child help, reveals the prepared adult result instead of leaving it hidden, and orders
  the Parent summary around observed facts and one next question. The six-test presentation
  contract first failed RED, then passed; ten focused files / 81 tests and the full 119-file /
  1,310-test suite passed. Typecheck, zero-warning lint, formatting, Git whitespace, and Expo
  dependency checks passed. Fresh web export produced 39 routes; Android JavaScript export produced
  one Hermes bundle and 94 assets. The Impeccable scan returned zero findings. Playwright browser
  inspection is `BLOCKED` because Chromium lacks `libnss3` in the container and dependency
  installation requires an unavailable sudo password; physical Android and named Arabic/
  accessibility review remain `NOT RUN`.
- **Parent AI disclosure consolidation — PASSED AUTOMATED / HUMAN REVIEW NOT RUN (2026-09-08)**:
  The exact-once presentation test first failed because the shared Parent notice did not exist,
  then passed after Parent Home received one clear 12-point bilingual caption and equivalent
  fallibility/non-diagnosis warnings were removed from Parent setup, Task Builder, permissions,
  and check-in. Eight focused files passed 114 tests, including unchanged Child disclosure/adult
  exit and retained provider metadata. `npm run verify` passed strict TypeScript, zero-warning lint,
  formatting, 122 files / 1,343 tests, Expo dependency alignment, and a 39-route web export with
  the known `expo-file-system` web warning. The Impeccable detector returned `[]`; physical Android
  and named Arabic/accessibility review remain `NOT RUN`.
