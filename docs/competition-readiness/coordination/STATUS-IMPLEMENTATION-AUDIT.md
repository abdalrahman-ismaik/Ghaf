# Requirement audit and implementation — 2026-09-14

Owner/integrator: `/root`, Windows checkout on `main`, starting HEAD `0f90d24`.
Authority: current user request to audit R01–R38 and A01–A07 and implement feasible gaps.
Existing navigation/motion changes listed by initial `git status --short` belong to
the separate NAV-MOTION session and are preserved. Its reserved routes/components,
motion specification and tests are excluded from this session's write scope.

The reachable coordination location is this Windows folder, per TEAM_OWNERSHIP.
Historical Linux BOARD job assignments are not current processes. This session
allocates four bounded helpers with no descendants, no builds and no service mutations.
Root owns one serialized test lane. C: free space initially approximately 903 MB;
no local Android build/export is started under that constraint.

| Owner              | Initial boundary                                                                                           | Acceptance / next action                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| root               | This file; `docs/competition-readiness/feature-implementation-audit.md`; later explicit spec/source grants | Consolidate all requirements, implement and integrate verified slices; preserve unrelated work                    |
| core_audit         | Read-only core task/growth/memory/catalog code and related sources                                         | Trace R01/R03/R17–19/A01–A07; report exact defects, 24-task list, and implementation boundary                     |
| backend_audit      | Read-only backend/messaging/capacity/build code and related sources                                        | Trace R10/R11/R14–16/R21/R34/R36; separate historical service proof from fresh proof, identify actionable defects |
| planning_ai_audit  | Read-only study/AI/planning code and related sources                                                       | Trace R02/R05–09/R12/R20/R22, approved scope, blockers, concrete repair candidates                                |
| presentation_audit | Read-only access/artwork/audio/onboarding/evidence code and related sources                                | Trace R04/R13/R23–33/R35/R37, asset provenance and actual navigation, source conflicts and repair candidates      |

Helpers must read applicable repository instructions/skills, preserve all other
work, and return evidence without changing files. Source grants follow bounded audit.
No production data, invitations, live charges, calls, child media or secrets are used.

Initial bounded audits completed. Typecheck passed on the initial dirty worktree.
Feature019 spec/plan/tasks records current-user authority for the first slices.

Implementation grants (supersede read-only scopes):

- core_audit: new `src/models/familyMemory.ts`, `src/features/family-memory/**`,
  `src/services/local/familyMemoryRepository.ts`, `src/components/memories/**`,
  `app/garden/memories.tsx`, `src/i18n/memoryResources.ts`, memory tests; integration
  in `src/state/usePrototypeStore.ts`, `src/services/index.ts`,
  `src/services/local/index.ts`, `src/i18n/resources.ts`, `app/garden.tsx`.
- planning_ai_audit: `src/models/study.ts`, `src/features/study/**`,
  `src/components/study/**`, `src/i18n/studyResources.ts`, relevant `tests/study/**`.
- presentation_audit: `src/components/onboarding/**`, new completion repository,
  its onboarding tests, narration API/control integration inside those components.
- backend_audit: `src/services/local/savedTaskTemplateRepository.ts` and its
  focused existing/new tests only, for collision reproduction and repair.

Helpers preserve each other's changes, do not modify NAV-MOTION files, do not
spawn descendants/commit/run heavy checks/mutate services. Root retains all
documentation, architecture/poster work, checks and final integration. Each helper
returns exact files, test commands, limitations and a release of ownership.

Second slice grants: core released store/resources after memory and volume seams.
Root now owns shared resources and checks. planning_ai_audit owns the store only
for `saveFamilyConnections`, `src/components/family/FamilyConnectionPlan.tsx`,
new `app/parent/family/connections.tsx`, the entry in `app/parent/settings/index.tsx`,
new familyConnectionEdit resources and focused family tests. It does not edit the
NAV-MOTION-owned Family route. backend_audit owns Worker `gemini.ts`, text
`operations.ts`, gateway README and new provider tests; no service activation.
presentation_audit reviews memory read-only after releasing audio source.
Root owns architecture/system diagram, README, `.env.example`, poster source,
demo/evidence/assistance updates and final exact-path commits.
Root also owns the current Feature019 addendum in `docs/product/PROTOTYPE_LIMITATIONS.md`;
older dated acceptance records remain historical and intact.

Integration cleanup: root reserves only removal of the unused `journey` subscription
and callback dependency in `app/parent/task/new.tsx`, the sole remaining full-lint
warning after NAV-MOTION's focus change. All focus guards, callbacks, navigation
and motion hunks are preserved. The file stays unstaged for the NAV-MOTION owner;
this session does not commit that separately owned feature.
The matching focus test's outer mutable dependency is captured per render before
its mocked effect; its focus/blur assertions are unchanged and the test also stays
unstaged with NAV-MOTION. This second warning was exposed once source lint passed.

After disk recovery, new `.expo` source snapshots produced by another lane exposed
SDK57 router-server's Windows watcher separator bug (`../` versus `..\\`). Root
owns `scripts/repository/refresh-route-types.mjs` and the `package.json` typecheck
prefix: regenerate with the installed generator using only `app/`, preserving
typed routes and dependency versions. Generated declarations are not committed.

## Checkpoint — 2026-09-14

Objective remains the user's full R01–R38/A01–A07 completion audit. This batch
advanced prepared explanations, text memories, goal dates, task/template reliability,
family connections, onboarding, quiet audio, gated Gemini transport and artifacts.
All four helpers released their files; no helper work is promised after this turn.

Completed local commits (interleaved unrelated motion commits are preserved):

- `bb36481`: Feature019 scope contract.
- `260eb7f`: academic goal dates.
- `2fe6127`: saved-template collision/readback safety.
- `ff97863`: bounded server Gemini text adapter and synthetic transport tests.
- `8f2c0fd`: prepared recommendation rationale.
- `b61671b`: private local family connection editor.
- `db9a740`: persisted quiet audio and accessible controls.
- `fbd0f2f`: owned memory/onboarding repositories, UI, guarded reset and regression fixtures.
- `a171330`: executable catalog labels in the existing workspace.
- `7533b26`: app-bounded route cache regeneration before typecheck.

Evidence: repo checks, typecheck, zero-warning lint and format passed. Final full
Vitest run: 219 files / 3,200 tests passed, 2 skipped. The skipped tests are
`tests/access/parent-account-local.integration.test.ts` (`GHAF_LOCAL_ACCOUNT_TEST`)
and `tests/messaging/hosted.integration.test.ts` (`GHAF_RUN_MESSAGING_HOSTED`); no
service acceptance is inferred. Static web export passed (46 routes); Expo emitted
its forced-exit message after successful export with exit code 0. Browser Arabic
smoke checked Child memories empty state, saved mute/volume and selected semantics,
guarded Parent chooser, and family editor save/reload/restore. The new fields used
only a temporary synthetic guardian, then were restored. No native/new hosted or
two-device execution in this lane. Poster PNG/PDF and editable HTML were actually
generated and inspected; exact source/output hashes are linked from its README.

C: recovered from ENOSPC to about 8.4 GB, then about 4.4 GB remained after this and
the other lane's build work. This audit deleted only its regenerable bundled HTML
and Chrome profile and losslessly compressed a generated source map. It did not
erase source, user family data or APKs or attribute all recovery to its small cleanup.

Next action: consult the single implementation ledger, reserve the native lane,
then implement full validated task/progression recovery and shared-family backend
authority. R05–R07/R16 remain missing; R22 lacks trusted activation/broker/provider
evidence; R01/R18/A01–A06 lack durable authoritative history. Legacy multi-key reset
still needs a failure-atomic design after family deletion. Existing configured
messaging/adult accounts must retain their identities and synthetic-data boundaries.
No push, release deployment or production mutation was performed by this audit.

Recovery implementation detail for the next owner: serializing `PrototypeSession`
alone omits the current task assignment/context collections, per-Child landscapes
and separate League/Family Reward authorities. `withTaskAssignments` also treats a
reset-epoch change as a reason to reinitialize those collections. Define a strict
versioned family-bound DTO and restore the active store's separate ledgers together;
do not reuse Feature014's old P0-only snapshot or make memory records award authority.

The resumed read-only `core_audit` confirmed the generic registry Reward/League
maps currently have no app/store callers; the active authorities are the store's
family-hub reward and private-League runtimes. The DTO must include full session,
assignment order/IDs/generation/next occurrence/approved snapshots/attempt history,
per-task contexts and support requests, both growth ledgers/archives/achievements,
family reward provenance, private League receipt/week, both learning states,
reveal queue plus approval commitments, shared-growth consent/history, and
`memoryRunId`. Exclude authorization, session capabilities, AI grants/responses
and live media. Validate all archived occurrences and reconcile every receipt,
not only the selected journey. The existing P0 rehydrator rejects multiple
receipts. Candidate validation and verified persistence must precede a successful
mutation result; a write-after-publish store subscriber cannot do this. Recovery
must bypass the ordinary reset-epoch reinitialization only through a separately
validated initialization path. This investigation changed no runtime code.

Resume after disk recovery: C: had 3,708,350,464 bytes free. Root is capturing the
final test result in `.expo/feature-audit-final-tests.log`, including the separate
motion fix `a34cf70`. `core_audit` has a read-only follow-up on complete progression
recovery. `backend_audit` is granted only `src/services/local/repository.ts` and
`tests/access/local-family-repository.test.ts` for canonical save/migration/repair
readback protection. No other file ownership changes; root integrates and checks.

To MOTION-CONTINUATION: resumed suite started 21:59:36 and ended in 70.18 s,
3,199 passed / 1 failed / 2 skipped. The sole failure is your now-reserved
`tests/presentation/r002a-child-task-presentation.test.ts`: the removed-arrow
assertion was loaded before the motion owner's new footer assertion landed. The
error frame displayed the newer source while the error text still requires
`iconPosition="end"`; this is not evidence against the replacement regex. Full
receipt is `.expo/feature-audit-final-tests.log`. This lane leaves the owned test
alone and will use the owner's replacement check. The test lane is now released.

Resumed R24/R25 repair: `backend_audit` added 24 repository regressions that failed
before the fix, then 106 repository/profile-repair/corrupt-recovery tests passed.
Root inspected the patch and ran full typecheck, lint and format successfully.
Canonical save/migration/repair now requires exact serialized readback before
legacy deletion; cleanup verifies absence and interrupted operations can retry.
This does not make the multi-repository reset failure-atomic. Both helper scopes
are released; no background helper is left running.

Root also exercised the full isolated browser quick-demo task journey, original
six Arabic onboarding screens and narration Stop control. Prepared rationale/Guide,
Parent assignment, Child choice/steps/prepared coaching/submission, Parent praise,
recognition 48→60 Seeds/Mangrove sapling/canopy 19→20, and duplicate-safe memory
save all completed. English garden/memory retained the same result. Exact limits
and observed console messages are in the implementation ledger. No new real
provider, device, account or production mutation was used. Browser and Metro closed.

Final resumed integrated evidence: `npm.cmd test -- --maxWorkers=2 --reporter=dot`
passed 219 files / 3,224 tests, two files/tests skipped, at 22:07:35 Asia/Dubai,
72.86 s. Log `.expo/feature-audit-integrated-tests.log`. Typecheck, zero-warning
lint and format also passed after the repository fix. C: measured 5,129,568,256
bytes free at 22:07:56; concurrent cleanup is not attributed to this lane.
The resumed repository fix and regressions were committed locally as `7aa0112`.
The prior integrated ledger, poster and architecture commit is `718336e`.
Remaining unstaged navigation/motion files retain their independent ownership;
this audit made no push, shared-history rewrite, deployment or release build.
