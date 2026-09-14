# Specification completion audit — 14 September 2026

The user authorized finishing accepted specifications, updating the existing
backend, committing reviewed work and pushing `main`. The subsequent explicit
decision is **keep Feature014 deferred**. This report separates existing source
implementation from remaining acceptance evidence; an unchecked historical task
does not establish missing code.

Root owns backend integration, validation and publication. The bounded audit
helper read all 19 feature task lists, applicable plans, current evidence and
relevant source/tests, then wrote only this report. It ran no tests, builds,
database operations, device actions or remote commands. Hosted deployment and
readiness claims remain pending root's current verification and readback.

## Current feature matrix

Paths below are under `specs/` unless otherwise stated. Existing implementation
means the planned source and supporting evidence are present, not that all native,
human or production requirements have passed.

| Feature                         | Implementation disposition                                                                                                                                                               | Remaining acceptance or deliberate boundary                                                                                                                                                                                                                         |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 001 repository foundation       | Implemented historical foundation.                                                                                                                                                       | `001-ghaf-repository-foundation/tasks.md` T037: named Android phone, RTL and offline acceptance.                                                                                                                                                                    |
| 002 core MVP                    | Implemented historical mission journey; Feature003 owns the current product.                                                                                                             | `002-ghaf-core-mvp/tasks.md` T039/T041: physical bilingual journey, timed rehearsals and comprehension review.                                                                                                                                                      |
| 003 family growth               | Core, R002a, default-off R002b, onboarding and CE1 implemented.                                                                                                                          | T080/T086/T218/T245 remain visual/native/human gates. Historical RED rows and superseded expansion tasks are explained below. Default-off flags remain unchanged.                                                                                                   |
| 004 bounded live AI             | All 91 source tasks recorded complete, including configured-age corrections.                                                                                                             | `004-bounded-live-ai/plan.md` specifies a default-off reference boundary. Real broker/provider, shared replay/budget controls, media/privacy and named review gates remain; completing the prototype does not activate them.                                        |
| 005 remembered device           | Implemented synthetic affinity, handoff and persistence-failure corrections.                                                                                                             | Native accessibility and named review remain separate. The affinity is not a Supabase credential or production session.                                                                                                                                             |
| 006 natural ambient audio       | Implemented root player, preferences, focus/lifecycle and reset.                                                                                                                         | Direct Android listening and complete native lifecycle acceptance remain distinct from source tests.                                                                                                                                                                |
| 006 real parent pilot           | Implemented real adult authentication, secure persistence and administrator approval. Feature018 extends its saved-data scope.                                                           | Use Feature018's current account evidence and the pilot validation record; hosted operational/email and final native gates are not implied by the checked task list.                                                                                                |
| 007 family plus capacity        | Implemented Parent-only local preview and exact price arithmetic.                                                                                                                        | Real billing and extra-profile activation are excluded by its plan, not unfinished checkout code.                                                                                                                                                                   |
| 008 family connection planning  | Implemented bounded private directory, migration and relative planning.                                                                                                                  | Native and named cultural/privacy/accessibility reviews remain. Planning ideas gain no execution or cloud authority by inference.                                                                                                                                   |
| 009 access family portraits     | Implemented local decorative assets and destination preload. Later Welcome logo selection supersedes its Welcome-photo presentation.                                                     | Image rights, named cultural/accessibility review and native acceptance remain independent.                                                                                                                                                                         |
| 010 calm ambient soundscape     | Implemented replacement soundscape using the existing player.                                                                                                                            | `010-calm-ambient-soundscape/tasks.md` T014 records human Android listening NOT RUN.                                                                                                                                                                                |
| 011 verified family replacement | Implemented, including integrated B-004 authority cleanup.                                                                                                                               | T019 is a visual/accessibility/failure-state matrix. Its old code-entry wording is partly superseded by Feature015's no-code local entry.                                                                                                                           |
| 012 role header branding        | Implemented; subsequent native header/Back corrections have separate Feature016/017 evidence.                                                                                            | Screen-reader, system text scaling and exact-candidate presentation acceptance remain. Historical temporary lint/hydration failures are not current failure claims.                                                                                                 |
| 013 Parent task workspace       | Alternate default-off workspace, saved templates and all 24 CE1 execution workflows implemented.                                                                                         | T011 is manual/native acceptance. CE1 T015–T019 are stale implementation checkpoints; T020/T021 also contain a still-unverified bilingual CE1 browser batch.                                                                                                        |
| 014 local progress recovery     | Runtime absent and explicitly deferred by the user's current decision.                                                                                                                   | No implementation work is selected. A future accepted contract must reconcile multi-occurrence authority, lossless receipts, migration, failure and privacy safeguards first.                                                                                       |
| 015 demo entry onboarding       | Adapter/transactional entry, original six-page presentation, Parent chooser/no-code entry and narration source implemented.                                                              | T012/T014/T015 and original Phase5 T017/T018 retain applicable mounted/native/listening/rights/build gates. T021–T024 visual proposal is superseded; duplicate task IDs require section-qualified references.                                                       |
| 016 real family messaging       | Auth/enrollment, durable messages, peer authorization and UI implemented.                                                                                                                | Current `016-real-family-messaging/backend-android-validation.md` supersedes the old no-project statement. Final-candidate lifecycle/revocation/offline/unknown-send, Arabic peer, accessibility and full native build gates remain.                                |
| 017 study and family support    | All 12 source tasks complete: study/goals/prizes, peer permissions and guided practices.                                                                                                 | `017-study-family-support/validation.md` records bounded emulator and earlier diagnostic physical passes, with broader final-native/error/reset/accessibility/named review still open. Local study and Feature018 account plans are distinct.                       |
| 018 persistent adult accounts   | Profile and family/task/study workspace, ownership/RPCs, account UI and safe session/logout isolation implemented. Two native packages on one emulator have independent-client evidence. | Apply and verify current backend changes through root's release lane. `018-persistent-adult-accounts/tasks.md` separately retains actual second-device, fresh Gradle, hosted/email, native recovery/expiry/revocation/accessibility and physical-performance gates. |

## Historical checkpoints and source evidence

Feature003 `tasks.md`, Phase48 T328, explicitly preserves the unrecorded RED rows
T038/T046/T052/T058/T064/T073 and superseded T154–T158. A passing current test cannot
reconstruct a historical pre-implementation failure. Phase22 says Phase24 and
later govern the implemented expansion. These rows must not trigger duplicate
implementations or fabricated RED evidence.

Feature003 Phase50 explicitly preserves CE1's original planning checkpoint and
links [publication evidence](repository-publication-20260913.md). That report
records `3b58e95` implementing all 24 task workflows and the integrated 2,269-test
checkpoint. Feature013 CE1 T015–T019 describe the same implemented boundary:

- `src/features/tasks/catalogDefinitions.ts` supplies canonical definitions.
- `src/features/tasks/assignmentInstances.ts` allocates occurrence identities,
  archives attempts, selects entries and projects personal landscapes.
- `src/state/usePrototypeStore.ts` integrates the collection, selected context,
  recognition authority and reset.
- `src/components/catalog/` contains the Parent/Child execution surfaces.
- `tests/tasks/catalog-execution.test.ts` exercises 24 tasks for both Children,
  fixed/zero awards, duplicate recognition, interleaving, retries and reset.
- `tests/tasks/catalog-engine.test.ts` and
  `tests/growth/catalog-garden-presentation.test.tsx` cover detached authority and
  personal Garden mapping.

The publication report explicitly leaves a new CE1 browser pass NOT RUN. It must
not be inferred from store tests or unrelated later browser evidence. Feature013
T020/T021 combine completed checks/commits with this remaining gate.

Feature015's "Exact original restoration" section records `46e9b58` and explicitly
supersedes the reference-led T022–T024 proposal. The later publication report
records `6913c52` integrating all six Arabic v2 clips. Earlier three-clip source
handoffs are historical; unverified mounted/native/rights rows are not a request
to reinstall the old visual/audio proposal.

## Deferred recovery boundary

Feature014's `plan.md` and `tasks.md` remain draft/deferred. Proposed
`src/features/progress-recovery/evidence.ts` and
`src/services/local/progressEvidenceRepository.ts` are absent; current local
family schema is 4 and device-affinity schema is 1. This accurately describes
missing deferred implementation, rather than a defect in the accepted account
increment.

The old plan targets one canonical task and proposes a version5 family/evidence
envelope. The later
[CE1 contract](../../../specs/013-parent-task-workspace/contracts/catalog-execution.md)
owns many occurrences and states in CE10 that work remains process-local without
Recovery014. T004's lossless accepted-receipt/type contract and T002's independent
failure/privacy review therefore remain future prerequisites. T003's B-004
replacement repair already has integration evidence in
[the earlier contract handoff](a-contract.md) and
[independent candidate review](d-candidate.md). Feature018 cloud planning records
do not persist or restore synthetic Seeds, recognition receipts or this deferred
journey authority.

## Current execution sequence

1. Complete the accepted existing-backend increment: inspect migration parity and
   account/messaging authorization, apply compatible additive changes through the
   serialized release lane, and add repeatable backend checks. Preserve data and
   existing identities. Record actual local and hosted readback separately.
2. Verify the resulting database/provider behavior and current native account
   clients, including ownership denial, session isolation and relevant failures.
   Run proportional application checks. Keep missing toolchain, physical-device,
   email and human-review evidence explicit; do not relabel them as passed.
3. Reconcile current documentation with the exact verified result, review tracked
   changes for secrets and artifacts, create coherent commits and push `main`
   using the user's current authorization. Record the resulting commit/remote/CI
   evidence when observed. No deployment or publication success is claimed here.

The installed local-test apps currently depend on local Supabase. Keep their
Docker services running while that dependency remains. Stopping the backend is
appropriate only after root confirms those clients no longer require it; database
volumes and app data are preserved. Feature014 and optional release activations
are outside this accepted execution sequence.

## Assistance and handoff

The audit helper's contribution is this read-only source/evidence audit and its
single documentation file. Root owns independent checks, integration and final
claims. This report is not student review, human acceptance, new runtime testing,
or proof of production readiness. The next action is root's backend validation
and publication sequence above, retaining the unresolved gates in their original
feature records.
