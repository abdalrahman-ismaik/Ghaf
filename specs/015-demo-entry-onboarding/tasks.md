# Tasks: Fast Demo Entry and Family Onboarding

**Input**: spec.md, plan.md, research.md, data-model.md and contracts/demo-entry-v1.md.
**Status**: Implementation active under committed contract293d351 and exact NB1 grants. Human/native acceptance remains pending.

2026-09-14 current checkpoint: the accepted entry/onboarding implementation and
later superseding six-page/Parent-chooser decisions are integrated. The status
above and older task reservations describe their original checkpoints. Continue
only unresolved acceptance against the current candidate; do not reimplement the
superseded restoration proposal. See
[the current spec completion report](../../docs/competition-readiness/workstreams/spec-completion-20260914.md).

Tests are required by the selected behavior/safety/competition scope. A owns shared integration;
B/C/D roles are actual separate leads, with one helper each and serialized heavy work.

## Phase 1 — Contract and foundation

- [x] T001 A: Write selected-scope stories, plan, model and exact contract in specs/015-demo-entry-onboarding/; preserve branch/managed AGENTS block and deferred014.
- [x] T002 D/A: Resolve D failure/privacy review in specs/015-demo-entry-onboarding/analysis.md; confirm postconditions, entry epoch, reset-failure oracle and actual source seams; commit accepted artifacts before source grants.
- [x] T003 A: Publish shared DemoPrincipal/EntryMode/request types in src/models/demoEntry.ts and immutable exact build mode in src/config/demoEntry.ts; test strict resolution in tests/demo-entry-mode.test.ts.
- [x] T004 A: Extract memory factory into src/services/local/memoryStorage.ts; preserve src/services/local/storage.ts ordinary behavior, explicit export src/services/local/index.ts and select all4 isolated repositories in src/services/index.ts; test storage separation in tests/demo-storage-isolation.test.ts.
- [x] T005 A: Add narrow rollback capability to src/features/access/index.ts, src/services/interfaces/index.ts, src/features/access/parentOnboarding/controller.ts and src/features/access/childAccess.ts; drive second-marker/authorization+cleanup/throw/reentry/permission-preservation regressions in tests/demo-entry-transaction.test.ts. D-NATIVE-001 requires shared synchronous rollback scope in src/features/access/demoEntryTransaction.ts plus all-three composition regressions; A correction2ecea74 passes145focused cases including unchanged D tests; D independent unchanged8 plus existing68 =76 tests passed; native acceptance remains pending.

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
- [ ] T012 C/D [US3]: After granted preview/native resources, inspect actual AR/EN narrow/large-text/reduced-motion/missing-media states and record exact source/device evidence in their own workstream reports. C browser scope passed atf16112d (report219a6f4): four entry,12 normal/12 CSS story rows,
      focus/fallback, corrected headings/handoff and eight label rows. Native remains NOT RUN;
      no source-only native pass.

## Phase 4 — US4: Arabic narration

- [x] T013 C [US4]: Prepare exact three-body Arabic/English script, proposed voice method/settings/rights and reviewer packet in docs/competition-readiness/workstreams/c-product-refinement.md; retain rejected takes and actual review status. Six candidates generated under A060; user rejected all three Arabic Fatima-v1 takes.
      Historical Hamed/Salma auditions were not selected. All three Wiam/Multilingual v2 clips now have user quality approval and are imported in candidate 0d23b8e; Free-plan public-use rights, native playback and student review remain separate pending gates.
- [ ] T014 C/A [US4]: All three C060 Arabic clips have user quality approval; exact source work is governed by contracts/demo-narration-v1.md after D technical review/contract commit.
  - [x] T014a A (source preparation complete;44controller/49shared tests PASS; full TypeScript validation pending after bounded heap failure): src/features/onboarding/demoPlayback.ts and tests/demo-playback.test.ts; exact three assets/audio/demo-onboarding/ar-{together,support,growth}-wiam-v1.mp3 plus README.md; publish stable controller/assets plus src/components/demo/types.ts, route/resources and typed presentation-fixture updates as a coherent preparatory commit before C synchronization. Release types and presentation tests explicitly to C afterward.
  - T014b C (source released as 61d2576, integrated as 0d23b8e; 40 SSR/resolver tests PASS; mounted validation pending): src/components/demo/{types.ts,DemoEntryScreen.tsx,DemoOnboardingStory.tsx,useDemoOnboardingNarrator.ts,demoNarrationSources.ts}; tests/{demo-entry-presentation.test.tsx,demo-narration.test.tsx}; explicit play/stop/replay, lifecycle cancellation and screen-reader priority, no resource/route/ordinary-hook writes. Mounted lifecycle rows remain BLOCKED until an existing-tool harness under ignored output/native-ui/narration-lifecycle-harness/** is prepared and actually run under an A preview grant; SSR/hook mocks are not mounted evidence.
  - T014c A (source integration complete at 0d23b8e; full candidate checks pending): app/index.tsx generation/epoch props and narration copy wiring; src/i18n/resources.ts equivalent control/status strings; tests/demo-entry-routes.test.tsx. Integrate released C source, focused checks and full candidate checks after heavy release.
  - T014d D/B: independent exact native APK/lifecycle review and new-candidate rebuild only after A publication; baseline5d evidence retained. Public rights/native/student acceptance remain separate.
    Preserve the complete silent visual flow whenever unavailable. A186 source authority has been exercised and C074 released the source; pending mounted/native/human gates do not imply full feature acceptance.
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

## Existing-contract navigation correction after browser validation

- [x] T020 A: C030 reproduced an unhandled POP_TO_TOP warning on the demo approval dialog's
      Child handoff. Repair only app/parent/task/review.tsx using existing prepareEntryReset before
      sign-out in demo mode; fresh signed-out selector after successful sign-out, no dismissAll in
      that branch. Preserve ordinary path. tests/demo-task-handoff-route.test.tsx must exercise actual
      approval/store callbacks, unavailable root, failed sign-out and accepted handoff. This extends
      T009 to the newly observed caller; no task/authority/product behavior change. Implementedf16112d;
      four real-route cases plus21 Parent-flow tests pass, full corrected148files/1919tests pass.
      C affected browser and physical Android remain separate acceptance gates.

## September 12 user correction

- [x] T017 Record rejected selector-first/audio-unavailable delivery and exact correction contract.
- [x] T018 Implement distinct default story pages, fixed navigation and clear three-profile entry.
- [x] T019 Enable explicit browser Arabic narration while preserving native/accessibility guards.
- [x] T020 Run meaningful fresh/handoff/three-page/audio/browser and full candidate checks; record
      exact source, real media-clock/cancellation and remaining native/human gates.

## User-selected six-page restoration — September 12

- [ ] T021 A: Commit the selected six-page restoration contract and reference mapping.
- [ ] T022 A/helper: Restore six-page visual story and clear full-width demo entry.
- [ ] T023 A: Verify six-step navigation, exact three-clip mapping, bilingual layout and role isolation.
- [ ] T024 A: Independent visual review, final checks, evidence and student/native review handoff.

## Exact original restoration — latest user instruction

- [x] T025 A: Reuse original six-page/Welcome UI; retain safe demo callbacks and Child selection.
- [x] T026 A: Verify original source equality, real navigation/access and bilingual browser render.
- [x] T027 A: Final integrated checks and honest evidence; narration follows actual user answer.

Exact restoration46e9b58: all4checksPASS,153files/2025tests. Browser original6AR/6EN and3accountsPASS. Native/studentacceptance pending; oldnarration remains off while optional userchoice is unanswered. Reference-led T022–T024 are superseded visual work, not user-accepted delivery.

## September 13 — selected Parent account chooser

- [x] T026 Record and commit the bounded local account chooser contract before behavior edits.
- [x] T027 Implement transactional local Parent entry and focused data/role/failure/handoff tests.
- [x] T028 Replace credential form with botanical account selection and Create family; AR/EN parity.
- [x] T029 Run proportional checks and one bounded browser pass; publish evidence, commit and release.

T026–T029: contract4f48a75, runtime65efe80; report docs/competition-readiness/workstreams/parent-account-chooser.md. Actual browser account selection passes in AR/EN; native/human acceptance remains NOT RUN.

## Parent no-code follow-up

- [x] T030 Commit the no-code local Parent follow-up contract.
- [x] T031 Implement and test direct local setup/replacement/repair staging.
- [x] T032 Retire OTP UI, connect direct routes and move optional remember control.
- [x] T033 Validate affected guards/cancellation and AR/EN browser; commit/report/release.

T030–T033: contract56c9063, runtime42eb809. No local OTP UI; direct setup/repair, preserved replacement/cancel authority. Report docs/competition-readiness/workstreams/parent-no-code-entry.md. AR390x844/EN320x740 browser passed; full type/lint/format passed, initial2110pass/4obsolete source assertions corrected with44affected tests passing. Native/human NOT RUN.

## Natural prepared family name

- [x] T034 Apply the user-selected عائلة أبو راشد / Abu Rashid Family to prepared names and examples;
      display old canonical saved names compatibly without persistence changes, preserve custom names,
      and verify Arabic/English entry. Runtime0b400da;208focused tests/typecheck/scoped lint+format PASS;
      actual browser and isolated synthetic legacy fixture PASS, native/human exact-diff NOT RUN.

## Selected Welcome logo focus

- [x] T035 Remove Welcome photo, enlarge selected5A mark and retain all original controls/copy.
      Runtime829c9db. Typecheck/scoped lint+format and46existing focused tests PASS. Actual AR390x844/
      EN320x740 logo/photo/language/navigation checks PASS; native/human and effective enlarged-text
      NOT RUN. Evidence and limitation: docs/competition-readiness/workstreams/welcome-logo-focus.md.

## Assigned QA Slice2 — accessibility and compact controls

- [x] T036 Commit the bounded QAF-002/003/004/009 contract and exact board97 assignment before edits.
- [x] T037 Repair web task/success semantics, retry state/Space activation, compact onboarding
      header and readable noninteractive Child permissions; preserve native and task behavior.
- [x] T038 Complete affected checks, AR/EN browser evidence, cohesive commit and exact-path release.
      Runtime08f04b3; report docs/competition-readiness/workstreams/slice-two-accessibility.md.
      Source/web passed; Android and human acceptance NOT RUN.

The user selected personal landscapes with a separate shared family canopy for later Slice1/3.
No Garden source grant or implementation is included here.
