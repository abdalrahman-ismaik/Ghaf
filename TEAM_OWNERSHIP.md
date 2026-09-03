# Team Ownership

**Work period:** Feature 003 planning and implementation beginning 2026-08-26
**Team size:** Three members
**Integration owner:** Member 1 — Mobile and visual experience

Replace `Member 1`, `Member 2`, and `Member 3` with names only when the team chooses to do so.

## 2026-09-03 Growth Journey Revision 3 Planning Window

**Owner**: `/root` acting as integration owner
**Purpose**: Preserve the supplied Growth Journey prompt pack, reconcile it as a proposed Feature
003 Revision 3, and prepare an implementation-ready product/domain/design-intake plan without
changing runtime behavior before approved Stitch frames arrive.
**Implementation status**: **DOCUMENTATION ONLY — DESIGN BLOCKED**.
**Exclusive write scope**: `AGENTS.md`, `README.md`, `docs/README.md`, `PRODUCT.md`,
`RESEARCH_BASIS.md`, `DESIGN.md`, `DESIGN_DIRECTION.md`, `PROTOTYPE_LIMITATIONS.md`,
`CODEX_IMPLEMENTATION_PROMPT.md`, `DEMO_RUNBOOK.md`, `TEAM_OWNERSHIP.md`,
`docs/GHAF_GROWTH_JOURNEY_PROMPT_PACK/**`, new Growth Journey records under `docs/content/**` and
`docs/architecture/adr/**`, and documentation under `specs/003-family-growth-garden/**`.
**Excluded boundary**: `app/**`, `src/**`, `tests/**`, dependencies, generated native projects,
assets, build evidence, and every runtime screen outside the already released R001 Batch 1.
**Preservation rule**: Keep R001 and its four implementation commits intact. Extend rather than
replace the existing task, Seed, garden, League, canopy, Family Reward, privacy, and reset
contracts. Treat the supplied TypeScript, routes, timings, and Stitch wording as candidate input,
not runtime authority.
**Handoff condition**: Canonical documents state the resolved Revision 3 boundary, exact open
conflicts, proposed state/data contracts, lean MVP, Stitch artifact inventory, dependency-ordered
tasks, truthful evidence status, and the implementation gate. The window closes only after Spec
Kit consistency checks and repository validation pass.
**Handoff result**: **PASSED for documentation preparation**. Spec Kit context refresh and
cross-artifact analysis completed with no unresolved P0-critical inconsistency; numeric/domain and
document-map audits were reconciled. Typecheck, lint, format checks, 20 files / 332 tests, diff
hygiene, exact task/badge identifier checks, and 92 local links across 32 planning Markdown files
passed. Growth design/runtime and named content/human review remain **BLOCKED** or `NOT RUN` until
the required approved Stitch release arrives.

## 2026-09-02 Expo Go Android Reliability Window

**Owner**: `/root` acting as integration owner
**Purpose**: Diagnose the physical-phone Expo Go startup failure and make the smallest SDK 57
compatibility and startup corrections required for the R001 Batch 1 MVP.
**Exclusive write scope**: `package.json`, `package-lock.json`, `app.config.ts`, `app/_layout.tsx`,
`DEMO_RUNBOOK.md`, `TEAM_OWNERSHIP.md`, and focused configuration/startup tests if required.
**Preservation rule**: Do not alter approved screen composition, later Revision 2 routes, or
unrelated uncommitted work. Dependency changes are limited to Expo Doctor-compatible SDK 57 patch
alignment and required direct native peers.
**Handoff condition**: Expo Doctor, Android export, repository checks, and a fresh Expo Go startup
attempt are reported with device/network limitations stated separately from app defects.

**Handoff and release**: SDK 57 core patches are aligned; unused `expo-audio`, React Hook Form, and
resolver dependencies are removed; Android has no unnecessary audio permission; and the WSL-safe
`start:tunnel` script is available. Expo Doctor passed 21/21 checks, the clean 1,936-module Android
Hermes export passed at approximately 9 MB total, and all 332 tests passed. A Windows release APK
subsequently built, installed, and received an open command on SM_T835. The rendered journey was
not directly observed, so native visual and interaction gates remain open. This boundary is
released.

## 2026-09-02 Approved Ghaf R001 Batch 1 Implementation Window

**Work period**: 2026-09-02 approved Stitch Parent-onboarding batch
**Integration owner**: `/root` acting for Member 1
**Feature/task IDs**: T111–T120 scoped intake; approved Batch 1 slices of T121, T126, T128,
T131–T136, and T167–T171
**Inputs**: user-approved `ghaf-r001` PNG/HTML export, Revision 2 product contracts, and the
explicit limitation to Welcome plus Parent sign-in and first-family setup
**Preservation rule**: all pre-existing dirty documentation and the Revision 1 runtime remain
preserved unless a reserved file below requires a narrow integration change.

| Exclusive writer      | Exact reserved boundary                                                                                                                                                                                                                                             | Expected handoff                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/root/design_intake` | `docs/design/stitch/releases/ghaf-r001/{STITCH_DESIGN.md,SCREEN_INDEX.md}`, `specs/003-family-growth-garden/design-intake/**`, root `DESIGN.md`, `DESIGN_DIRECTION.md`, and scoped status/task text in `specs/003-family-growth-garden/{spec.md,plan.md,tasks.md}`  | Record the user's batch approval, supplied/missing artifacts, routes, conflicts, audits, and a partial gate that releases only this batch               |
| `/root/ui_foundation` | `src/design/tokens.ts`, `src/components/primitives.tsx`, `src/components/LanguageSwitcher.tsx`, and `src/components/access/**`                                                                                                                                      | Canonical native tokens, font-role primitives, RTL-safe controls, setup shell, responsive OTP, and success-sheet presentation components                |
| `/root/access_domain` | `src/models/familyGrowth.ts`, `src/features/access/**`, `src/services/interfaces/index.ts`, `src/services/mock/index.ts`, `src/services/index.ts`, `src/state/usePrototypeStore.ts`, and `tests/revision2-access.test.ts`                                           | Deterministic synthetic Parent access/setup contract, mock service, store commands/reset, and focused tests without changing Revision 1 outcomes        |
| `/root`               | `package.json`, `package-lock.json`, `app.config.ts`, `app/**`, `src/i18n/**`, `src/components/PrototypeStatusBar.tsx`, `src/utils/navigation.ts`, affected existing tests, font asset/license files, final evidence, and integration fixes after released handoffs | Integrate native routes and guards, bilingual copy, Alexandria/Readex loading, full validation, responsive screenshot comparison, and truthful evidence |

No writer may widen its boundary or overwrite another writer's changes. The missing screen-spec and
English/state frames are recorded as assumptions and remaining release gaps, not silently invented
as approved Stitch evidence. Child entry remains an honest unavailable state until its own frames
are approved; it must not open the legacy role-toggle route.

**Handoff and release:** The reserved boundaries are released. The seven native routes, shared
access foundation, deterministic Parent onboarding, local font bundle, protected Parent
destination, and legacy role/Child route denial are integrated. Formatter, typecheck, lint,
20-file / 332-test suite, static export, Expo config, Firefox 390×844 journey, responsive/scroll/
keyboard-height/text-scale proxies, English LTR, and offline fallback passed. Physical Android
release build and installation later passed on SM_T835, but the rendered journey was not directly
observed. Complete Revision 2 navigation and later screens remain outside this release. The work is
ready for the user-authorized checkpoint commits.

## 2026-09-02 Stitch Release Scaffold Window

**Work period**: 2026-09-02 design-intake scaffold
**Owner**: `/root`
**Feature/task IDs**: F003-R2-B / T111 preparation only
**Write scope**: `docs/design/stitch/releases/ghaf-r001/**` and this reservation record
**Inputs**: Feature 003 Revision 2 documentation plus the user-requested release tree
**Expected handoff**: The exact intake scaffold exists without treating placeholders as approved
Stitch output or changing runtime UI, tests, dependencies, fonts, assets, or evidence status.

**Handoff and release**: The requested seven-screen Parent-onboarding scaffold exists. The Welcome
reference image and HTML are explicitly marked placeholders; no Stitch approval or runtime gate
changed. `find`, PNG type inspection, and `git diff --check` passed. Empty asset and later-screen
directories remain filesystem-only until real exports add content. This write boundary is released
to the integration owner.

## 2026-09-01 Approved Product-Contract Revision Window

**Integration owner**: `/root` acting for Member 3's documentation boundary
**Purpose**: Record the approved separately authenticated Parent/Child experiences, Ghaf Family
League, private Family Reward, voice/language, typography, and Stitch handoff before any new screen
implementation.
**Implementation status**: **ON HOLD** until the user supplies and approves the Google Stitch screen
designs. This window authorizes documentation only.

| Owner                    | Exact reserved boundary                                                                                                                                                                                                                                                                                                                   | Excluded boundary                                                                                                           | Handoff condition                                                                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/root`                  | `.specify/memory/constitution.md`, `AGENTS.md`, `README.md`, `PRODUCT.md`, `RESEARCH_BASIS.md`, `DESIGN.md`, `DESIGN_DIRECTION.md`, `PROTOTYPE_LIMITATIONS.md`, `CODEX_IMPLEMENTATION_PROMPT.md`, `DEMO_RUNBOOK.md`, `TEAM_OWNERSHIP.md`, `GHAF_GOOGLE_STITCH_PROMPT_PACK.md`, and `specs/003-family-growth-garden/**` documentation only | `app/**`, `src/**`, `tests/**`, assets, dependencies, generated builds, Feature 001/002 artifacts, and all runtime evidence | Current product truth is internally consistent; the prior ten-route build is labeled historical; new implementation tasks remain blocked on approved Stitch frames |
| `spec_conflict_audit`    | Read-only review of `spec.md`, `plan.md`, and `tasks.md`                                                                                                                                                                                                                                                                                  | All writes                                                                                                                  | Conflict report returned                                                                                                                                           |
| `handoff_conflict_audit` | Read-only review of root product/research/limitations/ownership/runbook documents                                                                                                                                                                                                                                                         | All writes                                                                                                                  | Conflict report returned                                                                                                                                           |
| `design_conflict_audit`  | Read-only review of design documents and current route/theme structure                                                                                                                                                                                                                                                                    | All writes                                                                                                                  | Conflict report returned                                                                                                                                           |

No agent may translate the prompt pack into Expo screens, change routes, add fonts or packages,
alter state/models, rewrite tests, or upgrade any validation result in this window. The existing
2026-08-28 implementation remains a preserved prior baseline; it is not evidence for the revised
authentication, League, Family Reward, navigation, or typography contract.

**Documentation handoff:** The Revision 2 contract files and Google Stitch prompt pack were aligned
on 2026-09-01. No runtime, test, asset, dependency, generated-build, or Revision 1 evidence file was
changed. The documentation reservation is released after final consistency checks; the next
authorized activity is user-supplied Stitch design intake under T111–T120, not implementation.

## Decision Record

| Item                         | Decision                                                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Product direction            | APPROVED — Feature 003 Revision 2: separate Parent/Child access, Family League, private Family Reward, and revised bilingual design                                |
| Implementation authorization | **ON HOLD** until the user supplies and approves the Google Stitch screens; documentation/design-intake work only                                                  |
| Technical baseline           | Preserve the 2026-08-28 Revision 1 ten-route app as historical reusable code; none of its evidence transfers to Revision 2                                         |
| Required path                | Deterministic local P0 with prepared synthetic media and assistant fixtures                                                                                        |
| Competition AI path          | One real synthetic-input model transformation when an approved secure server boundary exists; deterministic fallback always remains                                |
| Demo household               | Synthetic Parent plus Salem (9) and Alya (11)                                                                                                                      |
| Access                       | Deterministic synthetic Parent sign-in/reauth and Child PIN/picture/pairing experiences; no production security claim                                              |
| Social surface               | Seeded invite-only Ghaf Family League with five normalized Challenge Leaves, tied ranks, prepared reactions, and cooperative canopy                                |
| Reward                       | Permanent symbolic Seeds plus optional private non-custodial Family Reward plans; no exchange rate, payment, transfer, or rank dependency                          |
| Garden                       | Ghaf, Samar, Sidr, date-palm, and mangrove landscape tracks; Ghaf remains brand hero                                                                               |
| Main demo task               | 12-Seed multi-step Green Impact recycling variant; general waste remains a separate Home Responsibility task with no circle credit                                 |
| Sensitive content            | Prayer, kinship, affection, food consumption, wellbeing, hygiene, disability-related routines, media, reflections, and Parent notes stay out of cross-family views |
| Validation status            | Revision 2 checks begin `NOT RUN`; Revision 1 and Feature 002 passes do not transfer                                                                               |

The product-direction decision authorizes documentation and Stitch design preparation only. It
does not authorize Revision 2 implementation or permit a claim that the revised experience exists.

## Integration Owner

Member 1 coordinates shared configuration, dependencies, route integration, combined diffs, final
validation, and the physical Android build. This role does not allow silent overwrites of another
owner's active boundary.

Only the integration owner may merge shared configuration changes. A proposed dependency or route
change must identify the need, affected files, fallback, and validation cost before integration.

## Human Ownership

| Member                                        | Primary responsibility                                                                                                                                                      | Default write scope                                                                                                                                        | Cross-cutting duty                                                                       |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Member 1 — Mobile and visual experience       | Separate Parent/Child navigation and access UI, Stitch intake, fonts, Arabic/RTL, pairing/permissions UI, garden/League visuals, motion, accessibility, Android integration | `app/**`, `src/components/**`, `src/design/**`, `src/i18n/**`, UI feature folders, visual/font assets; shared config only in a reserved integration window | Verify access isolation, role-specific modes, typography, and Android demo               |
| Member 2 — AI and application logic           | Access/session contracts, tasks/Seeds, Family Reward plans, League scoring/privacy/rollover, deterministic assistants, reset, focused tests                                 | `src/models/**`, `src/services/**`, `src/state/**`, `src/utils/**`, feature policy and tests                                                               | Enforce reauthentication, fixed awards, idempotency, League/Reward privacy, and fallback |
| Member 3 — Product, content, QA, presentation | Revised Spec Kit artifacts, Stitch prompt/handoff, bilingual task/League/reward copy, behavioral rules, cultural/voice review, manual QA, runbook                           | `specs/003-family-growth-garden/**` product artifacts and named root documents; implementation copy only through handoff                                   | Own Revision 2 evidence ledger and named product/content reviews                         |

Implementation copy in `src/i18n/**` remains inside Member 1's file boundary. Member 3 prepares
reviewed bilingual copy and hands it off rather than editing concurrently.

Member 2 owns automated test files during active logic work. Member 3 owns manual evidence and the
runbook. Reassign explicitly if the work period changes.

## Required Cross-Cutting Reviews

Before Feature 003 is called demo-accepted, record named status for:

| Review                                | Owner                                  | Required evidence                                                                   |
| ------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------- |
| Arabic and RTL                        | Member 1 + named fluent reviewer       | Arabic/English walkthrough on target Android build                                  |
| Emirati culture and phrase pack       | Member 3 + named UAE cultural reviewer | Reviewed task/phrase IDs and corrections                                            |
| Faith content                         | Member 3 + qualified local reviewer    | Scope and wording review; private/nonpunitive confirmation                          |
| Child safeguarding and AI boundaries  | Member 2 + Member 3                    | Intent allowlist, prohibited-output tests, synthetic-only media review              |
| Accessibility                         | Member 1                               | Font scale, touch, contrast, screen-reader labels, reduced motion                   |
| Sustainability claims                 | Member 3                               | Source for task wording; no unsupported impact conversion                           |
| Demo and reset                        | Integration owner                      | Named Android build, exact reset, timed human rehearsals                            |
| Synthetic access and reauthentication | Member 1 + Member 2                    | Route isolation, fixture truth labels, pairing/revocation, threat-boundary review   |
| League fairness and privacy           | Member 2 + Member 3                    | Five-Leaf normalization, ties, help credit, opt-out/rest, projection review         |
| Family Reward psychology and privacy  | Member 2 + Member 3                    | Non-custodial states, private amounts, immutable unlock, prohibited-category review |
| Voice and Gulf/Emirati register       | Member 1 + Member 3 + named reviewers  | Prepared/simulated media truth, MSA safety, dialect/voice phrase review             |

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

## Revision 2 Work Packages — Pending Stitch Approval

| Package                        | Owner                        | Outcome                                                                                          | Gate                                              |
| ------------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| F003-R2-A Product contract     | Member 3                     | Revision 2 spec, research, limitations, evidence reset                                           | Documentation consistency                         |
| F003-R2-B Stitch design intake | Member 1 + Member 3          | Approved Arabic-first frames, English variants, exported design rules, component/state inventory | User supplies and approves Stitch output          |
| F003-R2-C Access and session   | Member 2, then Member 1      | Deterministic Parent/Child access, pairing, reauth, devices, and protected navigation            | F003-R2-B plus exact route contract               |
| F003-R2-D League               | Member 2, then Member 1      | Five-Leaf scoring, weekly rollover, privacy projection, ties, reactions, cooperative canopy      | Access/session contracts released                 |
| F003-R2-E Family Reward        | Member 2, then Member 1      | Private milestone plans, monthly maximum, immutable unlock, given state, no custody              | Access/reauth and confirmation contracts released |
| F003-R2-F Typography and UI    | Member 1                     | Alexandria/Readex assets, tokens, role navigation, contextual screens, RTL/accessibility         | Approved Stitch design and dependency review      |
| F003-R2-G Acceptance           | Integration owner + Member 3 | Fresh automated, bilingual web, physical Android, and named human evidence                       | Integrated Revision 2 build                       |

No package after F003-R2-A may begin during the current documentation hold.

## Historical Revision 1 Work Packages

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

| Effective time | Previous owner  | New owner | Work period                                 | Reason                                                                  |
| -------------- | --------------- | --------- | ------------------------------------------- | ----------------------------------------------------------------------- |
| 2026-08-22     | —               | Member 1  | Feature 001 foundation                      | Initial provisional integration assignment                              |
| 2026-08-22     | Member 1        | Member 1  | Feature 002 deterministic food-rescue slice | Plan approved; ownership continued                                      |
| 2026-08-26     | Member 1        | Member 1  | Feature 003 planning and implementation     | Family Growth Garden direction approved                                 |
| 2026-08-27     | evidence ledger | `/root`   | Feature 003 final integration               | Final evidence recorded; all reservations released                      |
| 2026-09-01     | Member 1        | `/root`   | Feature 003 Revision 2 documentation intake | Record approved product changes; runtime implementation remains on hold |

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
