# Tasks: Local Progress Recovery

**Status**: DEFERRED by the user's 2026-09-12 decision until the current APK/native journey is
validated. No recovery implementation task is READY. No checkbox below is an implementation grant.
Work stays on the experimental branch; later scope acceptance, exact typed-contract review and
committed accepted authority must precede A's task/file grants. Native validation alone does not
activate these tasks. See the [scope decision](spec.md).

## Phase 1 — Decision and contract gate

- [ ] T001 After current APK/native validation, revisit scope acceptance with the user for
      `specs/014-local-progress-recovery/spec.md`: one-task continuity, save-before-success and
      legacy re-verification/pairing. The 2026-09-12 decision is deferral, not acceptance.
- [ ] T002 After the T004 design is complete, resolve D's independent failure/privacy/migration review in
      `specs/014-local-progress-recovery/analysis.md`; commit the accepted spec/plan/tasks/contracts.
- [ ] T003 Integrate and independently verify B-004's existing replacement repair in
      `src/state/usePrototypeStore.ts` before deriving recovery from that boundary.

## Phase 2 — Foundation (US2/US3 prerequisites, no user-facing partial release)

- [ ] T004 [US2] Specify the exact versioned family-envelope codec and read/update contract in
      `specs/014-local-progress-recovery/contracts/recovery-v1.md`; reconcile existing local-family
      repository/model call sites and minimum lossless recognition fields before runtime edits; review `contracts/approved-task-recovery.md` and its exact execution consumers.
- [ ] T005 [US2] Add failure-first generation/replacement/revision tests in
      `tests/progress-evidence-repository.test.ts`, including reused IDs and stale whole-record writes.
- [ ] T006 [US2] Implement the approved shared family-envelope codec/repository adaptation in
      `src/services/local/repository.ts` and the smallest explicitly granted codec/model
      files; preserve existing family validation and current fields. A owns this serialized seam.
- [ ] T007 [US3] Add known-legacy, missing, unknown, oversized, malformed and unreadable cases in
      `tests/progress-evidence-repository.test.ts`; implement one-time empty-evidence migration only.
- [ ] T008 [US2] Bind affinity to the family generation through the existing
      `src/features/access/rememberedDeviceAccess.ts`, `src/models/deviceAccess.ts` and repository;
      extend `tests/device-remembered-access.test.tsx` for legacy re-entry and crash-after-replacement.

## Phase 3 — US1 evidence and persistence

Goal: supported stages restore without new authority or private content. Independent test: saved
stage → recreated store → correct role → same task/state, with all FR-008 results idempotent.

- [ ] T009 [P] [US1] Write pure evidence red cases in `tests/progress-evidence.test.ts`: exact
      schema/keys, Child/task/variant/policy, legal order, duplicate IDs, denied media/text and projection.
- [ ] T010 [US1] Implement `src/features/progress-recovery/evidence.ts` with the committed allowlist,
      bounds and lossless accepted-receipt validation, with a reviewed redacted restored-view adaptation. Use existing domain projection/validation seams.
- [ ] T011 [US1] Implement `src/services/local/progressEvidenceRepository.ts` over the shared family
      envelope, never a separately committed authority key; pass failure/revision/atomic-record tests.
- [ ] T012 [US1] Integrate save-before-publish and startup restore in `src/state/usePrototypeStore.ts`
      and `src/services/index.ts` only after A explicitly regains those shared files. Cover existing
      task transitions, permitted help, smaller accepted variants and confirmed-pending recognition.
- [ ] T013 [US1] Add `tests/progress-recovery-store.test.ts` for each supported stage, duplicate award,
      fresh praise after pending restore, static recognized restore and no persisted assistant/media.

## Phase 4 — US2 reset/replacement and US3 recovery experience

Goal: old work cannot revive or cross families; errors stay honest and recoverable. Independent
test: interruption at each operation produces complete old/committed-new state, never a mixture.

- [ ] T014 [US2] Add reset/replacement/rollback/stale-callback fault cases to
      `tests/progress-recovery-store.test.ts`, including reset twice and revoked/missing affinity.
- [ ] T015 [US2] Integrate the approved reset/replace ordering and epoch invalidation in
      `src/state/usePrototypeStore.ts`; retain Feature 011 cancellation/failure guarantees.
- [ ] T016 [US3] Define finite recovery notices/actions in `src/i18n/resources.ts` and the existing
      app shell; A grants the exact component/route after an approved view contract. No new signed-out
      reset privilege or authority-bearing route parameter.
- [ ] T017 [US3] Cover valid-directory/invalid-progress, wholly invalid directory, read retry,
      write retry and cleanup-pending states in `tests/progress-recovery-store.test.ts`; verify Arabic/
      English parity and existing reset/repair authorization.

## Phase 5 — Candidate and acceptance

- [ ] T018 Run full typecheck/lint/format/suite on one integrated candidate; record exact hash and
      commands in `docs/competition-readiness/workstreams/a-contract.md` and D's granted evidence.
- [ ] T019 Inspect the actual Arabic/English mounted journey, all independent oracles, failures and
      reset in the constrained preview lane; record browser scope, not native acceptance.
- [ ] T020 Build a standalone APK using `docs/competition-readiness/android-build-and-rehearsal.md`;
      verify signing/permissions/hash and run primary/secondary native checkpoints independently.
- [ ] T021 Record actual student review/teach-back, native results and remaining gates; update
      limitations/demo script only to proven behavior. No release flags or remote service activation.

## Dependencies and parallelism

The earlier T004 draft-design authorization is historical and its file allocation was released.
Further recovery work requires a later explicit grant; no work starts automatically after native
validation. The following dependency graph applies only to a later accepted batch: T001 + T004 → T002
accepted-contract commit; T003 existing repair must also pass before T005–008 → T009–013 →
T014–017 → T018–021. T009's pure tests/validator may run in
parallel with A's T005–008 storage/access foundation only after the common contract is committed
and exact paths are disjoint. B's report may evolve; A alone integrates shared store/registry/codec.
US2 safeguards and US3 error/migration behavior are acceptance dependencies of US1; do not release
a happy-path-only persistence feature. No partial checkbox completion establishes native readiness.

No new memory/rationale story, package, free chat, map, calendar or provider is implicit here.
