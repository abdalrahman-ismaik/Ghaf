# Team Ownership

**Work period:** Feature 003 planning and implementation beginning 2026-08-26
**Team size:** Three members
**Integration owner:** Member 1 — Mobile and visual experience

Replace `Member 1`, `Member 2`, and `Member 3` with names only when the team chooses to do so.

## Decision Record

| Item                         | Decision                                                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Product direction            | APPROVED — Family Growth Garden                                                                                                                                    |
| Implementation authorization | USER-AUTHORIZED deterministic P0; implementation begins only after the Feature 003 checklist and cross-artifact gates pass                                         |
| Technical baseline           | Preserve and adapt the locally/web-validated Feature 002 Expo/TypeScript foundation; Android/human gates did not pass                                              |
| Required path                | Deterministic local P0 with prepared synthetic media and assistant fixtures                                                                                        |
| Competition AI path          | One real synthetic-input model transformation when an approved secure server boundary exists; deterministic fallback always remains                                |
| Demo household               | Synthetic Parent plus Salem (9) and Alya (11)                                                                                                                      |
| Social surface               | Seeded, aggregate, cooperative cousin/family circle only                                                                                                           |
| Reward                       | Fixed, symbolic Seeds; never purchased, transferred, removed, or randomized                                                                                        |
| Garden                       | Ghaf, Samar, Sidr, date-palm, and mangrove landscape tracks; Ghaf remains brand hero                                                                               |
| Main demo task               | 12-Seed multi-step Green Impact recycling variant; general waste remains a separate Home Responsibility task with no circle credit                                 |
| Sensitive content            | Prayer, kinship, affection, food consumption, wellbeing, hygiene, disability-related routines, media, reflections, and Parent notes stay out of cross-family views |
| Validation status            | Feature 003 checks begin `NOT RUN`; Feature 002 passes do not transfer                                                                                             |

The product-direction decision authorizes specification work. It does not authorize implementation
outside an approved Spec Kit plan or permit a claim that Feature 003 is complete.

## Integration Owner

Member 1 coordinates shared configuration, dependencies, route integration, combined diffs, final
validation, and the physical Android build. This role does not allow silent overwrites of another
owner's active boundary.

Only the integration owner may merge shared configuration changes. A proposed dependency or route
change must identify the need, affected files, fallback, and validation cost before integration.

## Human Ownership

| Member                                        | Primary responsibility                                                                                                                 | Default write scope                                                                                                                                 | Cross-cutting duty                                                      |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Member 1 — Mobile and visual experience       | Expo routes, navigation, design tokens, Arabic/RTL integration, garden/tree visuals, motion, accessibility, Android build, integration | `app/**`, `src/components/**`, `src/design/**`, `src/i18n/**`, UI feature folders, visual assets; shared config only in reserved integration window | Verify child/parent visual modes and physical Android demo              |
| Member 2 — AI and application logic           | Task/reward schemas, state machine, deterministic assistant providers, garden/circle calculations, reset, focused automated tests      | `src/models/**`, `src/services/**`, `src/state/**`, `src/utils/**`, task/reward/assistant/garden logic and tests                                    | Enforce fixed reward, idempotency, privacy filtering, provider fallback |
| Member 3 — Product, content, QA, presentation | Spec Kit product artifacts, bilingual task catalog, behavioral rules, cultural review coordination, manual QA, runbook, pitch          | `specs/003-family-growth-garden/**` product artifacts, named root documents, demo fixtures/copy through handoff                                     | Own evidence ledger; obtain Arabic/cultural/faith review status         |

Implementation copy in `src/i18n/**` remains inside Member 1's file boundary. Member 3 prepares
reviewed bilingual copy and hands it off rather than editing concurrently.

Member 2 owns automated test files during active logic work. Member 3 owns manual evidence and the
runbook. Reassign explicitly if the work period changes.

## Required Cross-Cutting Reviews

Before Feature 003 is called demo-accepted, record named status for:

| Review                               | Owner                                  | Required evidence                                                      |
| ------------------------------------ | -------------------------------------- | ---------------------------------------------------------------------- |
| Arabic and RTL                       | Member 1 + named fluent reviewer       | Arabic/English walkthrough on target Android build                     |
| Emirati culture and phrase pack      | Member 3 + named UAE cultural reviewer | Reviewed task/phrase IDs and corrections                               |
| Faith content                        | Member 3 + qualified local reviewer    | Scope and wording review; private/nonpunitive confirmation             |
| Child safeguarding and AI boundaries | Member 2 + Member 3                    | Intent allowlist, prohibited-output tests, synthetic-only media review |
| Accessibility                        | Member 1                               | Font scale, touch, contrast, screen-reader labels, reduced motion      |
| Sustainability claims                | Member 3                               | Source for task wording; no unsupported impact conversion              |
| Demo and reset                       | Integration owner                      | Named Android build, exact reset, timed human rehearsals               |

If a reviewer is not available before the competition build, remove or visibly label the unreviewed
sensitive content rather than guessing.

## Project-Agent Write Scopes

Project-scoped Codex agents are helpers, not owners. Reserve their boundaries before use.

| Agent                     | Allowed write scope                                                                         | Never overlaps with                                   |
| ------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `ghaf-orchestrator`       | Feature 003 coordination artifacts, root guidance, explicitly reserved shared configuration | Any human editing those shared files                  |
| `ghaf-product-spec-agent` | Feature 003 `spec.md`, checklists, research/task content assigned by Member 3               | Orchestrator or Member 3 in the same artifact         |
| `ghaf-ui-expo-agent`      | Approved routes, UI components, design, i18n, garden SVG/motion                             | Member 1 or another UI agent in the same area         |
| `ghaf-ai-prototype-agent` | Models, services, store, rewards, assistant fixtures, circle filtering, tests               | Member 2 or another logic agent in the same area      |
| `ghaf-demo-qa-agent`      | Focused tests only when reserved; `DEMO_RUNBOOK.md`                                         | Member 2 in the same tests or Member 3 in the runbook |

Run no more than four agents concurrently. Independent read-only research and review may overlap;
writes to the same file, dependency set, routes, shared configuration, task schema, or bilingual
resource may not.

## Recommended Feature 003 Work Packages

| Package                    | Owner                        | Outcome                                                                                                                                           | Dependency                    |
| -------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| F003-A Specification       | Member 3                     | Approved spec, plan, tasks, screen/state contracts                                                                                                | Constitution and product docs |
| F003-B Domain model        | Member 2                     | Task, recognition mode, valid routine phase, `visibilityScope`, `circleEligible`, assignment, completion, reward, garden, circle, assistant types | Approved spec                 |
| F003-C Deterministic state | Member 2                     | Seed fixtures, no-loss reward, idempotent approval, reset, privacy-before-projection filters                                                      | F003-B                        |
| F003-D Visual foundation   | Member 1                     | Parent/Child modes, garden components, task/reward primitives, RTL                                                                                | Approved design + F003-B      |
| F003-E Parent flow         | Member 1 + Member 2 handoff  | Create/refine/review/assign task                                                                                                                  | F003-C/D                      |
| F003-F Child flow          | Member 1 + Member 2 handoff  | Task/Coach/optional evidence/optional reflection/submit                                                                                           | F003-C/D                      |
| F003-G Confirmation/growth | Member 1 + Member 2 handoff  | Praise, 12 Seeds, Mangrove growth, one eligible canopy leaf and circle action                                                                     | F003-E/F                      |
| F003-H Content review      | Member 3                     | Bilingual categories, task catalog, phrase/safety review                                                                                          | F003-A                        |
| F003-I Demo acceptance     | Integration owner + Member 3 | Android build, reset, timing, comprehension, disclosure                                                                                           | Integrated P0                 |

Member 1 and Member 2 must reserve exact boundary files for each handoff; the table does not permit
simultaneous edits to the same feature folder.

## Reservation Protocol

Record before work starts:

```text
Work period: date/time or session label
Owner: Member/agent
Feature/task IDs: F003-T0XX
Write scope: exact files/directories
Inputs: spec/design/content version
Expected handoff: outcome and validation
```

On completion, record files changed, checks, manual evidence, content review, known gaps, readiness,
and boundary release.

## Active Feature 003 Codex Window

**Work period**: 2026-08-26 Codex implementation session
**Integration owner**: `/root` acting for Member 1
**Inputs**: approved root handoff dated 2026-08-26 and `specs/003-family-growth-garden/`
**Preservation rule**: existing dirty-worktree files, Feature 001/002 artifacts, historical
screenshots, and open native/human evidence remain untouched unless a Feature 003 task explicitly
names the current root document.

| Phase / task IDs                         | Exclusive writer                                                                       | Reserved boundary                                                                                                                                   | Handoff condition                                                                        |
| ---------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| T001–T008 setup and artifact gates       | `/root` orchestrator; independent reviewers are read-only except their named checklist | `TEAM_OWNERSHIP.md`, `specs/003-family-growth-garden/checklists/**`, prepared-fixture provenance files                                              | Checklist and analysis have no unresolved P0 issue                                       |
| T009–T017 RED tests                      | `ghaf-demo-qa-agent`                                                                   | `tests/**` only                                                                                                                                     | Intended Feature 003 failures recorded; boundary released before source work             |
| T018–T029 domain and deterministic state | `ghaf-ai-prototype-agent`                                                              | `src/models/**`, `src/features/{tasks,rewards,garden,circle,assistants}/**`, `src/services/**`, `src/state/**`                                      | Focused policy/store suite GREEN; public contracts handed to UI owner                    |
| T030–T035 design foundation              | `ghaf-ui-expo-agent` after model handoff                                               | `src/i18n/**`, `src/design/**`, `src/components/**`, prepared asset resolver                                                                        | Typecheck and component-level inspection pass; no concurrent domain edits                |
| T037–T077 route stories                  | Same domain/UI owners in task order, one owner per named file                          | Exact files named by each task; shared store and Parent route windows are sequential; T067 reserves `app.config.ts` for predictive Back integration | Story-specific GREEN evidence and released boundary                                      |
| T078–T090 integration and review         | `/root` orchestrator; fresh QA/design reviewers read-only unless assigned a finding    | Whole-tree integration, root `DEMO_RUNBOOK.md`, final ownership handoff                                                                             | Automated/web evidence recorded; unavailable native/human gates stay `BLOCKED`/`NOT RUN` |

### 2026-08-27 recovery reservations

The laptop shutdown released the interrupted agent processes. The recovery window preserves all
completed domain work and replaces the abandoned zero-byte component stub in place.

| Feature/task IDs                                                       | Exclusive writer        | Exact write scope                                                                                                                                                                                                                                                                                                         | Expected handoff                                                                                                                 |
| ---------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| T032–T034                                                              | `f003_ui_foundation`    | `src/components/primitives.tsx`, `src/components/journey.tsx`, `src/components/LanguageSwitcher.tsx`, `src/components/prototype.tsx`, `src/components/demoAssets.ts`, `src/components/family-growth/TaskPanels.tsx`, `src/components/family-growth/AssistantPanels.tsx`, `src/components/family-growth/PreparedMedia.tsx` | Token-only, bilingual/RTL-safe shared components with scoped checks                                                              |
| T035                                                                   | `f003_visuals`          | `src/components/family-growth/GardenLandscape.tsx`, `src/components/family-growth/FamilyCanopy.tsx`, `src/components/family-growth/CircleProgress.tsx`                                                                                                                                                                    | Code-native, privacy-safe static visual system with scoped checks                                                                |
| T061 recovery follow-up                                                | `recovery_visuals`      | `src/components/family-growth/GardenLandscape.tsx` only, after releasing the static T035 boundary                                                                                                                                                                                                                         | Optional 650ms transform/opacity cause-effect reveal with an immediate equivalent reduced-motion state                           |
| T037/T045/T051/T057/T063/T072                                          | `f003_story_tests`      | `tests/parent-task-flow.test.ts`, `tests/child-task-flow.test.ts`, `tests/parent-check-in-flow.test.ts`, `tests/garden-circle-flow.test.ts`, `tests/operator-demo-flow.test.ts`, `tests/parent-overview.test.ts`                                                                                                          | Requirement-grounded tests that fail only for missing story integration; no production edits                                     |
| T036–T090 integration                                                  | `/root`                 | `app/**`, `app.config.ts`, `src/utils/navigation.ts`, remaining named story components, store/service integration windows, Spec Kit evidence, and root `DEMO_RUNBOOK.md`                                                                                                                                                  | Integrated ten-route P0, full automated/web validation, and truthful native/human gate status                                    |
| T074/T089 safety remediation                                           | `assistant_safety_fix`  | `src/features/assistants/policy.ts`, `tests/assistant-safety.test.ts` only                                                                                                                                                                                                                                                | Prohibited Parent/Child language variants fail closed; focused and full tests pass                                               |
| T075/T076 summary correction                                           | `summary_editor_fix`    | `src/components/family-growth/ParentPatternSummary.tsx`, `tests/parent-overview.test.ts` only                                                                                                                                                                                                                             | Parent can locally edit a bounded synthetic fact; unsafe edits fail closed with focused tests                                    |
| T047/T053 adjustment requests                                          | `prospective_actions`   | `src/models/familyGrowth.ts`, `src/state/usePrototypeStore.ts`, `tests/child-task-flow.test.ts`, `tests/parent-check-in-flow.test.ts` only                                                                                                                                                                                | Child/Parent prospective adjustment requests persist without lifecycle, Seed, or growth mutation                                 |
| T068 resilient fixtures                                                | `fixture_fallbacks`     | `src/components/family-growth/PreparedMedia.tsx`, `src/features/circle/projection.ts`, `app/circle.tsx`, `src/i18n/resources.ts`, `tests/garden-circle-flow.test.ts` only                                                                                                                                                 | Image load failure and unavailable circle data render honest local fallbacks with no private records                             |
| T044/T050/T056/T062/T070/T071/T077/T078/T082–T086/T090 evidence ledger | `/root/evidence_ledger` | `specs/003-family-growth-garden/checklists/{story-evidence,web-proxy,source-scan,red-green-evidence,design-audit}.md`, root `DEMO_RUNBOOK.md`, and `TEAM_OWNERSHIP.md` final evidence/release sections only                                                                                                               | Truthful separation of automated, web, native, human, and historical-process evidence; boundary returns to `/root` after handoff |

All recovery writers are aware that other work exists in the shared worktree. They must preserve
and accommodate it, never revert it, and release their exact boundary after reporting checks.

### 2026-08-27 convergence reservations — closed

These historical reservations superseded the broad T036–T090 integration row while convergence was
active. Their boundaries were disjoint and are now released.

| Owner                   | Exact write scope                                                                                                                                                                                                                                                                                                                                                        | Excluded/coordination boundary                                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain_convergence`    | `src/models/**`, `src/features/tasks/**`, `src/features/assistants/policy.ts`, `src/services/mock/index.ts`, `src/state/usePrototypeStore.ts`, `src/components/family-growth/ParentCheckIn.tsx`, and related domain tests `tests/{task-lifecycle,reward-matrix,assistant-safety,prototype-state,parent-check-in-flow,mock-core-flow,parent-overview}.test.ts`            | Does not edit routes, i18n, evidence, Spec Kit artifacts, package files, or shared integration files; coordinates any public-contract change with `/root` and `route_convergence`                        |
| `route_convergence`     | `app/child/index.tsx`, `app/child/task.tsx`, `app/parent/task/review.tsx`, `app/parent/check-in.tsx`, `app/parent/index.tsx` solely for the T095 Parent-resolution surface, `src/components/family-growth/ParentTaskComposer.tsx`, `src/i18n/**`, and route/localization tests `tests/{child-task-flow,parent-task-flow,operator-demo-flow,localization-parity}.test.ts` | Does not edit domain/store/mock policy, evidence, Spec Kit artifacts, package files, or other routes/shared integration files; the added Parent overview reservation ends immediately after T095 handoff |
| `/root`                 | All integrated Feature 003 implementation, Spec Kit, package, and final evidence files after the handoff below                                                                                                                                                                                                                                                           | Evidence files were exclusive until final release; `/root` now owns them for integration/commit                                                                                                          |
| `/root/evidence_ledger` | Historical final-evidence boundary: Feature 003 checklists, root `DEMO_RUNBOOK.md`, and `TEAM_OWNERSHIP.md` evidence/release sections                                                                                                                                                                                                                                    | **Released**; no file reservation retained                                                                                                                                                               |

If a needed change falls in another row, the current owner reports the finding and waits for a
handoff; it does not widen its scope.

**Convergence release update**: `domain_convergence` and `route_convergence` completed T091–T101,
reported focused and shared checks, and released every implementation/test boundary in their rows
back to `/root`. The verified/interrupted `domain_convergence` process retains no file ownership.
`/root` owns the integrated implementation and final review fixes. The final mounted reset replay is
GREEN, and `/root/evidence_ledger` releases its documentation boundary to `/root` with the handoff
below. No convergence, recovery, safety, route, or evidence writer retains a file reservation.

No reservation authorizes a dependency change, remote provider, commit, push, merge, deployment, or
history rewrite. A writer must be explicitly assigned before its phase begins and must not revert
another writer's edits.

## 2026-08-28 Professional MVP Audit Window

**Integration owner**: `/root`
**Completed read-only reviewers**: `/root/design_assessment_a` and
`/root/detector_assessment_b`
**Inputs**: Feature 003 specification, approved Living Family Garden direction, current dirty
worktree, and the final 2026-08-27 evidence baseline

| Owner / workstream                                                                                                                     | Exact reserved boundary                                                                                                                                                                                          | Handoff condition                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `/root/mvp_logic_review` (`domain_hardening`) — reference integrity, coherent alternatives, Guide decision state, and provider timeout | `src/state/usePrototypeStore.ts`, `src/services/mock/index.ts`, `src/features/tasks/{validation,lifecycle}.ts`, and `tests/{parent-check-in-flow,parent-task-flow,assistant-safety,task-lifecycle}.test.ts` only | RED evidence for each accepted defect, focused GREEN tests, exact changed-file report, then release to `/root`                               |
| `/root/child_flow_polish` — lifecycle-aware Child work and role handoff                                                                | `app/child/index.tsx`, `app/child/task.tsx`, `app/role.tsx`, and `tests/{child-task-flow,operator-demo-flow}.test.ts` only                                                                                       | Active assignment first, correct resume/submitted/recognized actions, concise Child composition, handoff state, focused checks, then release |
| `/root/garden_polish` — hierarchy and logical RTL accent                                                                               | `app/garden.tsx`, `src/components/family-growth/GardenLandscape.tsx`, and `tests/{garden-progression,garden-circle-flow}.test.ts` only                                                                           | Changed Mangrove remains dominant, four required tracks remain visible compactly, logical accent verified, focused checks, then release      |
| `/root` — Parent UX, integration, i18n, audit, and evidence                                                                            | All other `app/**`; all other `src/components/**`; `src/i18n/**`; `.impeccable/critique/**`; Feature 003 tasks/checklists; root `DEMO_RUNBOOK.md`; and this section                                              | Before/after critique, bilingual browser verification, full validation, and truthful native/human gates recorded                             |

Every writer is aware that other work exists in the same dirty worktree, must preserve and
accommodate it, must not revert another writer's edits, and must not widen its file boundary.
Package/dependency files remain outside every reservation. The historical Feature 001/002 and
user-owned diffs remain untouched.

**Professional audit release — 2026-08-28**: `mvp_logic_review`, `child_flow_polish`, and
`garden_polish` completed their focused RED/GREEN work and released every boundary to `/root`.
`/root` completed the Parent/integration confirm round, including the progressive Child definition
disclosure and specific unsafe-wording recovery. The settled worktree passed typecheck, lint,
format check, `git diff --check`, the Impeccable detector (`[]`), a 12-route Expo export, and 17
files / 305 tests. Arabic RTL and English LTR 390×844 journeys completed with zero browser errors,
zero horizontal overflow, correct 60/60 growth/circle consequence, and Arabic RTL reset surviving
six Back actions. All audit reservations are released; Android and named human gates remain
`BLOCKED`/`NOT RUN`.

## 2026-08-27 Evidence Handoff and Boundary Release

**Evidence owner**: `/root/evidence_ledger`
**Receiving integration owner**: `/root`
**Worktree**: dirty Feature 003 implementation checkpoint; no commit hash represents the evidence
state

| Item                               | Handoff result                                                                                                                                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Files changed                      | Feature 003 `story-evidence.md`, `web-proxy.md`, `source-scan.md`, `red-green-evidence.md`, `design-audit.md`; root `DEMO_RUNBOOK.md`; this final handoff section                                 |
| Fresh focused checks               | Review batch 4 files / 121; reset file 24/24; independent probes 23/23; final full suite 17 files / 289 tests                                                                                     |
| Convergence                        | T091–T101 and later adversarial/reset writer boundaries released after GREEN; T102 aligned Expo SDK 57 patches without a new library                                                              |
| Final review fix                   | Coach binding, safety/semantic guards, safe equivalent, retry, exact identity/referential checks, garden/circle behavior, and reset locale/direction/history defects fixed                        |
| Latest integration checks reported | `npm ci`, typecheck, lint, format, 289-test suite, Expo install/config/export, detector `[]`, and `git diff --check` passed; 12 static routes exported                                            |
| Web evidence                       | Final bundle completed Arabic RTL and English LTR ten-route journeys; duplicate/equivalent/retry mounted; reset `lang=ar`/RTL and six consecutive Back actions passed; 0 errors, 1 bundle warning |
| Design evidence                    | One token entry; zero measured token escapes across 15,659 TS/TSX lines; final detector `[]`; final Arabic/English and branch frames follow the Living Family Garden direction                    |
| Android                            | **BLOCKED**: `adb`, `emulator`, `sdkmanager`, and `java` were `NOT_FOUND`; `ANDROID_HOME` and `ANDROID_SDK_ROOT` were `NOT_SET`; no device or named build                                         |
| Human/named review                 | Five rehearsals, comprehension, Arabic/UAE culture, faith, safeguarding, sustainability, and accessibility all **NOT RUN**                                                                        |
| Historical process gap             | Required story RED runs T038/T046/T052/T058/T064/T073 were not recorded and remain **NOT RUN**; no retroactive RED was fabricated                                                                 |
| Integration readiness              | **Ready for integration/commit** with truthful limits; **not** ready to claim physical-demo acceptance                                                                                            |

The evidence writer releases every assigned documentation file to `/root` with this record. Any
later result must be incorporated with its exact command/artifact; do not silently upgrade native
or human statuses.

## Handoff Record

| Effective time | Previous owner  | New owner | Work period                                 | Reason                                             |
| -------------- | --------------- | --------- | ------------------------------------------- | -------------------------------------------------- |
| 2026-08-22     | —               | Member 1  | Feature 001 foundation                      | Initial provisional integration assignment         |
| 2026-08-22     | Member 1        | Member 1  | Feature 002 deterministic food-rescue slice | Plan approved; ownership continued                 |
| 2026-08-26     | Member 1        | Member 1  | Feature 003 planning and implementation     | Family Growth Garden direction approved            |
| 2026-08-27     | evidence ledger | `/root`   | Feature 003 final integration               | Final evidence recorded; all reservations released |

If there is no newer row, Member 1 remains integration owner.

## Conflict Rule

If overlapping work appears, stop both writers, preserve both diffs, and let the integration owner
choose one base. Do not reset, discard, or silently merge either version. A scope addition first
goes to the active Feature 003 specification; it is never resolved by quietly widening a boundary.

## 2026-08-28 Repository Architecture and Developer Experience Cleanup

**Integration owner**: `/root`
**Read-only reviewers**: `/root/repo_architecture_audit`, `/root/docs_inventory_audit`, and
`/root/devex_audit`

| Owner / workstream                                                                                                | Exact reserved boundary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Handoff condition                                                                                                                                                                                                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/root` — repository structure, documentation, commands, artifact curation, and final naming/layering integration | `.env.example`, `.gitignore`, `.nvmrc`, `package.json`, `README.md`, `CONTRIBUTING.md`, `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, `PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`, `TEAM_OWNERSHIP.md`, `docs/{README.md,DEVELOPMENT.md}`, `docs/architecture/**`, `specs/003-family-growth-garden/{quickstart.md,checklists/story-evidence.md,checklists/web-proxy.md}`, `app/{child/task.tsx,parent/index.tsx}`, `src/components/family-growth/{AssistantPanels.tsx,TrustedAdultExit.tsx,ParentCheckIn.tsx,ParentTaskComposer.tsx}`, `src/services/index.ts`, the exact `.gitkeep` files recorded in this cleanup, and the exact generated/archive paths classified for removal | Current implementation status is truthful; active and historical documents are clearly indexed; one-command verification and reproducible launch paths pass; misleading dead-file names, direct presentation imports of concrete mock modules, and only confirmed generated, superseded, or empty-placeholder files are removed |
| `/root/runtime_launch_polish` — clean Arabic-first web bootstrap and cross-platform accessibility output          | `app/+html.tsx`, `app/index.tsx`, `src/components/{LanguageSwitcher.tsx,journey.tsx,primitives.tsx}`, `src/components/family-growth/{AssistantPanels.tsx,CircleProgress.tsx,FamilyCanopy.tsx,PreparedMedia.tsx,GardenLandscape.tsx,TaskPanels.tsx}`, and `tests/operator-demo-flow.test.ts` only                                                                                                                                                                                                                                                                                                                                                                              | Static HTML starts `ar`/RTL, deprecated web props no longer reach the DOM, native accessibility meaning remains explicit, dead exports inside `AssistantPanels.tsx` are removed, focused/full static checks pass, then release                                                                                                  |
| `/root/dead_code_cleanup` — retired compatibility surface                                                         | `src/components/prototype.tsx`, `src/state/usePrototypeStore.ts`, `src/services/index.ts`, and `src/services/mock/index.ts` only                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Confirmed unreachable component, retired selectors, and unused registry alias are removed without behavior changes; focused/full static checks pass, then release                                                                                                                                                               |

All writers know that the Feature 003 worktree already contains user-owned and prior-agent changes.
They must preserve those changes, use disjoint boundaries, and must not commit, push, move historical
Feature 002 evidence, change dependencies, or widen their reservation.

**Repository cleanup release — 2026-08-28**: all three read-only audits completed. The two bounded
implementation workers removed the retired compatibility surface, cleaned the cross-platform web
document/accessibility output, passed focused and shared checks, and released every file. `/root`
completed documentation indexing, architecture/ADR guidance, current-status corrections, command
consolidation, public service-facade imports, exact artifact curation, and final integration.

The settled cleanup checkpoint passed a clean `npm ci`, `npm run verify` (17 files / 305 tests,
typecheck, lint, maintained-file formatting, Expo dependency alignment, and 12-route export), strict
unused-code TypeScript, local-link validation across 55 Markdown files, `git diff --check`, and an
offline web-start smoke check with Arabic/RTL root HTML. The optional React Native DevTools binary
remains unavailable on this host because `libnspr4.so` is missing; Metro and the app endpoint were
usable. Physical Android and named-human gates remain unchanged. All cleanup reservations are
released to the integration owner; no cleanup subagent retains a write boundary.
