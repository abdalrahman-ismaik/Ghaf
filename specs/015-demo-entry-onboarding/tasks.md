# Tasks: Fast Demo Entry and Family Onboarding

**Input**: spec.md, plan.md, research.md, data-model.md and contracts/demo-entry-v1.md.
**Status**: Implementation active under committed contract293d351 and exact NB1 grants. Human/native acceptance remains pending.
Tests are required by the selected behavior/safety/competition scope. A owns shared integration;
B/C/D roles are actual separate leads, with one helper each and serialized heavy work.

## Phase 1 — Contract and foundation

- [x] T001 A: Write selected-scope stories, plan, model and exact contract in specs/015-demo-entry-onboarding/; preserve branch/managed AGENTS block and deferred014.
- [x] T002 D/A: Resolve D failure/privacy review in specs/015-demo-entry-onboarding/analysis.md; confirm postconditions, entry epoch, reset-failure oracle and actual source seams; commit accepted artifacts before source grants.
- [x] T003 A: Publish shared DemoPrincipal/EntryMode/request types in src/models/demoEntry.ts and immutable exact build mode in src/config/demoEntry.ts; test strict resolution in tests/demo-entry-mode.test.ts.
- [x] T004 A: Extract memory factory into src/services/local/memoryStorage.ts; preserve src/services/local/storage.ts ordinary behavior, explicit export src/services/local/index.ts and select all4 isolated repositories in src/services/index.ts; test storage separation in tests/demo-storage-isolation.test.ts.
- [x] T005 A: Add narrow rollback capability to src/features/access/index.ts, src/services/interfaces/index.ts, src/features/access/parentOnboarding/controller.ts and src/features/access/childAccess.ts; drive second-marker/authorization+cleanup/throw/reentry/permission-preservation regressions in tests/demo-entry-transaction.test.ts. D-NATIVE-001 requires shared synchronous rollback scope in src/features/access/demoEntryTransaction.ts plus all-three composition regressions; A correction2ecea74 passes145focused cases including unchanged D tests; independent D retest separately pending.

## Phase 2 — US1/US2: Three-profile access and current-run continuity

**Goal**: One selection reaches the correct role; handoff preserves current run and ordinary storage.
**Independent test**: Three principals, real controller authority, rollback/retry and +12-once handoff.

- [x] T006 B [US1]: Implement only src/features/access/demoEntry.ts and tests/demo-entry-adapter.test.ts against committed contract; canonical two-Child record, narrowed ports, generation/epoch, synchronous transaction and retry; no store/route import.
- [x] T007 A [US1]: Integrate lazy adapter and single successful store commit in src/state/usePrototypeStore.ts; bypass ordinary restoration in demo; cover real guarded actions in tests/demo-entry-store.test.ts.
- [x] T008 A [US2]: Integrate entry epoch, sign-out/current-run retention, demo temporary-Parent CTA semantics and reset-failure latch in src/state/usePrototypeStore.ts; tests/demo-entry-store.test.ts covers stale callbacks, successful reset, first/middle/last failures and fresh-process recovery.
- [x] T009 A [US1]: Route demo welcome through app/index.tsx and new app/access/_layout.tsx; preserve ordinary/role layouts. Use fresh-root navigation in existing settings callers if required. In app/_layout.tsx omit only demo artificial splash/loading holds, keeping actual readiness/fallback; in src/components/audio/AmbientAudioProvider.tsx gate signed-out demo ambience. Prove route/deep-link/Back guards in tests/demo-entry-routes.test.tsx; no ordinary credential bypass.

## Phase 3 — US3: Optional botanical onboarding

**Goal**: Immediate profiles plus three clear, skippable bilingual story moments.
**Independent test**: Real rendered controls for all profiles/story transitions/error/fallback without services.

- [x] T010 C [P] [US3]: Implement exact src/components/demo/{DemoEntryScreen,DemoOnboardingStory}.tsx and types.ts from contract; import A's published shared principal type, no router/store/services. Test actions/three-profile enforcement/three moments/restart-required state in tests/demo-entry-presentation.test.tsx.
- [x] T011 A [US3]: Add equivalent reviewed-candidate copy from released C report to src/i18n/resources.ts and wire route props; record user-delegated AI editorial review distinctly from pending user listening; never invent a human name or approval. Cover resource parity and no legacy narration in tests/demo-entry-routes.test.tsx.
- [ ] T012 C/D [US3]: After granted preview/native resources, inspect actual AR/EN narrow/large-text/reduced-motion/missing-media states and record exact source/device evidence in their own workstream reports. No source-only native pass.

## Phase 4 — US4: Arabic narration

- [x] T013 C [US4]: Prepare exact three-body Arabic/English script, proposed voice method/settings/rights and reviewer packet in docs/competition-readiness/workstreams/c-product-refinement.md; retain rejected takes and actual review status. Six candidate clips generated under A060; user listening and runtime import remain pending.
- [ ] T014 C/A [US4]: Only after matching reviewed candidate and exact asset/lifecycle grant, implement packaged opt-in play/stop/replay with transcript parity, cancellation and screen-reader priority; exact paths must be added to this task and BOARD before writes. Otherwise complete silent visual flow and mark audio BLOCKED.
- [ ] T015 D [US4]: Record actual Arabic editorial, user listening and device review and lifecycle evidence in docs/competition-readiness/workstreams/d-native-acceptance.md; no metadata/test substitute.

## Phase 5 — Integration and independent acceptance

- [x] T016 A: Inspect/release coherent worker commits, integrate preserving authorship, run typecheck/lint/format/full suite once per meaningful source candidate; publish exact source/flag/check receipt in workstreams/a-contract.md and AI assistance ledger.
- [ ] T017 B: Build exact source with EXPO_PUBLIC_GHAF_DEMO_ENTRY=true using isolated pinned toolchain; receipt includes APK SHA, source, env/flags, bundled JS/assets, signing, permissions, tools. Preserve ordinary baseline receipt separately.
- [ ] T018 D: Independently verify exact APK and actual primary/secondary installation/role/isolation/Back/reset/RTL/audio matrix, ordinary-vs-demo restart and real rehearsals. Missing phones/listening/student review remain BLOCKED/NOT RUN.
- [ ] T019 A: Restore user-authorized canonical Expo preview in demo mode when B releases native-heavy lane and source is ready; record PID/port/command and current ownership. Update honest demo/Q&A and student exact-diff review queue.

## Dependencies and parallel work

T001→T002→T003. T004/T005 are A-owned foundational modules; T006 depends on stable transaction/type
contract and B's build work permitting source edits. T010 can run in C's disjoint tree after T003;
it does not depend on the B implementation. T007/008 require T004/005/006; T009/011 require T010.
T012 follows integration plus resource grant. T013 can continue as a report while other work proceeds;
T014/015 require real clip/content review, never scope invention. T016→T017→T018, with T019 following
native resource release. Baseline e02d02b APK work is independent of these new source edits in A/C.

## Implementation strategy

Deliver coherent typed foundation/rollback, adapter, silent entry/story and integrated journey slices.
Do not wait for audio approval to complete silent UI, and do not call the audio story complete from
silent fallback. Do not edit B runtime while its APK compiles. Keep source commits small; only A
stages live coordination after a brief status-write pause/ACK. No push/main merge/release activation.
