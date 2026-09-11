# D-001 independent baseline and acceptance audit

**Verdict: source-audit handoff ready; runtime/browser acceptance NOT RUN in this session;
Android and human acceptance remain BLOCKED / NOT RUN.** This report does not establish demo
readiness or durable recovery. It prepares independent checks for A's successive exact candidates.

- Session: D-20260911T2218Z-p177313; written 2026-09-11T22:24:35+00:00.
- Source: `02b9618631fa9fc1b29f2cda5fa68c6adb2003fd`; branch `redesign/qa-rehearsal`, assigned
  worktree `/home/smyk/projects/Ghaf-qa-rehearsal`. A activated grant D-001-r1; acknowledged at
  canonical board revision 2. Earlier missing-worktree/template observations remain in live status.
- Write boundary: this report only. Product source, tests, config, dependencies and other leads'
  work preserved. Canonical coordination is not staged by D.
- Authority: existing Feature 003 and 005/008/013 contracts plus current shared execution contract.
  Recovery/rationale/memory proposals remain unaccepted; no release flag changed.
- Baseline host: WSL/Linux, Node v24.16.0, npm 11.13.0, Git 2.43.0, Python 3.12.3. No D browser,
  emulator, install, heavy test job, build or native rehearsal ran for this source-audit slice.
- Lead requested settings: Astra/Ultra/Fast. User configuration inspected as `gpt-6-astra` /
  `xhigh` / `fast`; effective lead reasoning/tier not exposed, so Ultra is not claimed verified.
  Independent helper launch explicitly selects `gpt-6-astra` / `ultra`; tier not exposed.
- Student owner/reviewer unknown; actual understanding and named Arabic/cultural/accessibility/
  safeguarding review NOT RUN. Qualification unknown. Zero actual timed rehearsals.

## Read-only baseline audit checkpoint

**Identity**: `02b9618631fa9fc1b29f2cda5fa68c6adb2003fd`, canonical Ghaf checkout only; A selected this exact source audit target in board revision 1 (observed at revision 2). No product source has been executed by D.

- **PASSED — source identity comparison only**: `git diff --name-only 236bbae..02b9618 -- app src
tests package.json package-lock.json app.config.ts eslint.config.js vitest.config.mts tsconfig.json`
  exited 0 with no paths. The three intervening commits are documentation/coordination. Historical
  QA results can be considered by A with that explicit source scope; they are not rerun here and
  do not establish current environment, full bilingual journey or native acceptance.
- **PASSED — inspected package identity subset**: installed versions equal lockfile for Expo
  57.0.20, React Native 0.86.3, Expo Router 57.0.19, SQLite 57.0.2, React 19.2.3, TypeScript 6.0.3,
  Vitest 4.1.11, ESLint 9.39.5, Prettier 3.9.6, Tamagui 2.7.7 and Reanimated 4.5.1. This is not a
  complete dependency installation/audit or test pass.
- Lockfile SHA-256: `d312af8f6b07994c983b02908cad16c7d6c52aadebe68ac33ea068ccc1685ccb`.
  `app.config.ts` SHA-256: `65646459c410de9f985550fe22127add7919dadaf3829e8336fe6881b42bc44b`.
  Source package `ae.ac.ku.ghaf.prototype`, version 0.1.0; installed Android identity unknown.
- **BLOCKED — build/device evidence**: repository `rg --files -uu` inventory for APK/AAB/eas.json,
  excluding Git/dependency/tool trees, returned no match (exit 1, expected search result). This
  does not inventory the entire machine. No APK hash, signing result, model, OS or installation
  established. Fresh ADB list remains empty; no native commands run against a device.
- **NOT RUN — candidate checks**: typecheck, lint, format:check, full/focused tests, browser and
  exports await their applicable resource/candidate grant; D-001 is a report-only audit. Preserve the prior report's initial lint exit 1/cached missing-
  module evidence and subsequent uncached result; do not erase initial failures. If reproduced
  on a granted candidate, use the relevant uncached lint check, not a dependency autofix.
- **PASSED — source default observation only**: `src/config/r002bFeatureFlags.ts:16` constructs all
  eight defaults as false; each flag is independently resolved. No EXPO_PUBLIC_R002B_* variable
  was present in this shell. Built/preview flags are not verified; release activation remains blocked.
- Tooling discovery: system `pdftotext` was absent (command exit 1); pypdf/fitz/pdfplumber were absent
  from default Python. Existing reviewed `output/competition-readiness/template-review/pdf-tools`
  supplied PyMuPDF successfully (exit 0, fitz deprecation warning retained). No install performed.
  Guessed nonexistent source directories during rg discovery were corrected through the actual
  test imports; these are audit lookup errors, not application defects.

### Source authority trace and contract challenges

1. `src/components/family-growth/ParentCheckIn.tsx:180` calls `confirmAndPresentPraise`; its separate
   recognition continuation at line 219 calls `applyRecognition` after praise is presented.
   `src/state/usePrototypeStore.ts:4527` validates the confirmation; `applyRecognition` stages
   domain/provider reconciliation, separate Growth/Reward/League consequences and one reveal,
   then updates them together at line 5033. The duplicate branch at line 4930 validates existing
   secondary authority and returns the detached existing result. Source inspection supports the
   intended design; actual repeated pointer actions and runtime effects are NOT RUN in D.
2. `src/state/usePrototypeStore.ts:366` restores directory/paired markers and line 450 obtains a
   fresh prototype session. Store initialization at line 1409 creates fresh Family Reward, Growth,
   League and reveal authorities. `src/services/mock/index.ts:2073` returns
   `createInitialPrototypeSession()`. Registry local repositories cover directory, remembered
   access, audio preference and saved templates, not accepted-task/progress recovery.
   Feature 003 spec's directory amendment explicitly excludes task/reward/garden persistence;
   Feature 005 affinity contains no progression. Historical QA-01 is therefore a known process-
   local limitation and a proposed recovery gap, not newly reproduced regression evidence.
3. Recovery must preserve the distinction between confirmation/praise presentation and committed
   recognition. Saving only the visible 60 total cannot prove exactly-once +12 or all secondary
   authorities. A's accepted story should define behavior at every interruption boundary, including
   failed writes and whether the user was told a durable commit succeeded.
4. `resetPrototype` at `src/state/usePrototypeStore.ts:2589` clears affinity, directory, audio and
   saved templates sequentially before the final in-memory reset. **Unexecuted challenge**: inject
   failure on a later clear after earlier stores cleared, then retry/reload; define one coherent
   fail-closed recovery result. Do not report a reproduced atomic-reset defect from this read.
   Also test stale loads/writes after reset/family replacement using stable family/profile/epoch
   binding: canonical Child IDs and household fixture IDs alone do not distinguish two local
   family generations. No new persistence contract has been selected by A yet.
5. `src/features/family-connections/index.ts:159` derives Parent planning entries with
   `recognitionMode: recognition_only`, `progressEffects: none`, no scheduling authority and
   `origin: prepared_local`. `src/state/usePrototypeStore.ts:2231` guards the getter with active
   Parent authority. Feature 008 must retain zero progression and private projection; direct
   wrong-role/browser/storage cases are still NOT RUN in this D run.
6. Actual recommendation policy is deterministic category ordering in
   `src/features/assistants/profilePersonalization.ts:149`, including bounded keyword signals
   from supported custom answers. It is not a generalized live Connection Coach. The later
   required-profile amendment/checklist must be included when A selects a rationale contract;
   older descriptions of curated-only inputs must not be blindly used as the current input oracle.
7. A private durable memory leaf has no selected accepted story in this board. Internal recognition
   history/reveal queues are not evidence of that feature. Its absence is not a regression. If
   selected later, require minimal synthetic content, explicit audience, family/profile binding,
   at most one entry/event, deletion/reset, and zero effects on every progression authority.

### Draft acceptance matrix — NOT an executed journey

All browser actions must be actual pointer/keyboard interactions in isolated synthetic contexts;
store injection is separate labeled fault testing. Every runtime row needs the exact integrated candidate, flags and assigned artifact path before execution. A assigns final task IDs and evidence paths; future owners below are proposed queue mappings; D-001 alone is the active report grant. AR and EN each need their own full local journey, not just one mixed-
locale run. Source/test references describe where to verify, not inherited passes.

| ID    | Acceptance / oracle                                                                                                    | Required evidence and source/test entry                                                                  | Proposed owner/task                           | Current result                                     |
| ----- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------- |
| D-M01 | Exact commit, dirt, dependencies, checks, build flags                                                                  | Git; four npm checks; app.config; APK hash/signing                                                       | A-001/A-003; D-001                            | Source subset above; runtime NOT RUN               |
| D-M02 | Signed-out Arabic reset; no privileged Back/deep-link entry                                                            | `reset-navigation`, `access-control`, `r003-store-access-flow`; browser AR/EN, native Back               | D-001/D-002                                   | NOT RUN                                            |
| D-M03 | Unknown identifier denied; verified first/returning Parent entry                                                       | `parent-onboarding-*`, `r003-returning-family-entry`; browser pointer/keyboard                           | D-001/D-002                                   | NOT RUN                                            |
| D-M04 | One/two renamed profiles, mixed scripts and current age bands                                                          | `parent-task-composer-profiles`, `required-child-profile-personalization`; AR/EN compact views           | D-001/D-002                                   | NOT RUN; historical 236bbae retest attributed only |
| D-M05 | Parent chooses prepared suggestion, accepts wording, reviews then assigns +0                                           | `parent-task-flow`, `profile-task-recommendations`, `parent-task-drafting-authority`; UI + service trace | D-001/D-002                                   | NOT RUN                                            |
| D-M06 | Separate Child credential/pairing; wrong Child, expiry/revoke, temporary Parent handoff                                | `r003-child-access-controller`, `device-remembered-access`; AR/EN route attempts                         | D-001/D-002                                   | NOT RUN                                            |
| D-M07 | Child chooses/accepts/starts current task; help retains accepted +12                                                   | `child-task-flow`, `task-lifecycle`, `reward-matrix`; actual Coach/help UI                               | D-001/D-002                                   | NOT RUN                                            |
| D-M08 | Completion waits for Parent; retry removes nothing; no media required                                                  | Same suites plus `r002a-child-support-follow-up`; UI submit/retry                                        | D-001/D-002                                   | NOT RUN                                            |
| D-M09 | Parent-specific praise precedes recognition; repeated confirm adds nothing                                             | `parent-check-in-flow`, `recognition-provider-store-boundary`; actual duplicate UI actions               | D-001/D-002                                   | NOT RUN                                            |
| D-M10 | Default Seeds 48→60; Mangrove 48/60→60/60; Alya unchanged                                                              | `garden-progression`, `r002b-progression-store`, `operator-demo-flow`; exact before/after UI             | D-001/D-002                                   | NOT RUN                                            |
| D-M11 | Canopy 19/25→20/25; eligible Green Circle 11/12→12/12 only                                                             | `privacy-projection`, `garden-circle-flow`, `src/features/circle/projection.ts`; private rejection       | D-001/D-002                                   | NOT RUN                                            |
| D-M12 | Exactly five Leaves; 80→100; shared ties, no speed, extra-task exclusion, weekly isolation                             | `family-league`, `src/features/league/index.ts`; minimal shared DTO and UI                               | D-001/D-002                                   | NOT RUN                                            |
| D-M13 | Private Reward 108/120→120/120 only on eligible provenance; promised→unlocked→given                                    | `family-reward`; Parent privacy, rank independence, prospective reauth, immutable unlock                 | D-001/D-002                                   | NOT RUN                                            |
| D-M14 | Feature 008 remains private recognition-only with zero effects                                                         | `family-connections`; Parent view and Child/shared negative cases                                        | D-001/D-002                                   | NOT RUN                                            |
| D-M15 | Prepared/local/fallible labels; task-bounded age intents; safe offline fallback                                        | `assistant-safety`, `assistant-age-adaptation`, `bounded-ai-prepared-services`; UI labels                | D-001/D-002                                   | NOT RUN                                            |
| D-M16 | All eight R002b flags independently off; lifetime evidence 108→120; optional presentation gated; default balance 48→60 | `r002b-feature-flags`, `r002b-lifetime-seed-projection`; runtime config + guarded routes                 | D-001/D-002                                   | Source defaults inspected; runtime NOT RUN         |
| D-M17 | Every meaningful-state reset, repeated reset, no stale Back or resurrection                                            | `mock-core-flow`, `prototype-state`, `reset-navigation`, family replacement; injected faults separately  | D-002; A-002/B-002 contract for durable cases | NOT RUN                                            |
| D-M18 | Accepted recovery: seven interruption points × reload/process death/write failures                                     | Accepted version/schema, profile/family/epoch, idempotency and stale-load tests plus native execution    | A-002/B-002 then D-002/D-003                  | BLOCKED: contract/candidate absent                 |
| D-M19 | Memory only if selected: private, one/event, restore/delete/reset, all effects zero                                    | Accepted story and new bounded tests/actual UI                                                           | A-002/B-003 then D-002                        | NOT RUN: unselected feature, not regression        |
| D-M20 | AR/EN 320/390; long labels/mixed scripts; large text and reduced motion                                                | `localization-parity`, `bilingual-typography`; captures, widths, focus, pointer/keyboard                 | D-001/D-002                                   | NOT RUN                                            |
| D-M21 | Primary RTL/touch/TalkBack/Back/IME/font scaling/foreground/audio/permissions/reduced motion                           | Direct device identity, installed APK, recorded actions/outcomes                                         | A-003 then D-003                              | BLOCKED: no device or APK                          |
| D-M22 | Secondary independent install/touch/layout/Back/text scaling/persistence/restart/reset                                 | Separate device/OS/serial, same APK hash; no shared-state claim                                          | A-003 then D-003                              | BLOCKED: no device or APK                          |
| D-M23 | Ten actual 2–3 minute primary rehearsals including cold start/offline/reset                                            | Run ID, actual duration, operator, locale/flags, help/fault/outcome                                      | D-003 + actual human operator                 | NOT RUN: 0 runs                                    |
| D-M24 | Named student teach-back, Arabic/cultural/accessibility/safeguarding review                                            | Actual person, exact scope/date, questions/observations                                                  | A/human owner; D evidence                     | NOT RUN; owners pending                            |

### Unexecuted device and student handoff

Before native work, A provides the exact signed APK, SHA-256, source hash, flag configuration and
build versions. Record primary and secondary serial/model/OS/build independently. Existing source
package is provisional; confirm the installed package/version, not merely app.config values.
Use targeted `adb -s <observed-serial>` commands only after device selection. Never use unqualified
multi-device installation or represent an Android JavaScript export as an APK.

On the primary, perform actual normal access/setup/pairing and the Parent→Child→Parent journey.
Record all initial counters, permitted help, pending completion with no award, praise and one
recognition, the before/after Garden and private League, then duplicate and reset attempts.
Run the complete journey independently in Arabic and English. For offline native evidence, cold
launch the installed build with Metro unavailable and internet off; browser request blocking is a
separate proxy. Inspect TalkBack reading/focus, native Back/IME, OS text scale, touch, background/
foreground, audio interruption, permissions and reduced motion individually. Real Child recording
remains unauthorized; use prepared synthetic fixtures. Repeat installation, touch/responsive layout, native Back, text scaling, persistence, restart and
reset on the secondary independently, with secondary-specific artifacts and outcomes. Current
directory/access persistence and unapproved task/progress recovery must remain distinct. Do not
transfer application state or claim synchronized devices.

For an approved recovery candidate, use these seven checkpoints: before assignment, after
acceptance, during help, after Child completion, during confirmation, after growth, during reset.
At each, record the previously acknowledged durable state and the expected post-restart state.
Cover reload and actual native force-stop/process restart separately. Fault tests independently
cover corrupt/unknown records, unavailable storage, interrupted writes, family replacement,
repeated reset and stale reads/writes; label fault injection. Reopening the screen must neither
re-award +12 nor recreate deleted memory or another family's data.

Prepare ten empty run records only after the final build is known; completed count currently zero.
Each actual record needs start/end UTC, seconds, operator, device/OS, APK/commit, locale/flags,
preparation, faults/help and outcome. The 2–3 minute live target and ten runs are internal goals;
the supplied orientation independently requires a 2–3 minute video. Qualification remains unknown.

Student teach-back packet (suggested questions; no student has answered):

- Trace `ParentCheckIn` → store confirmation/praise → `applyRecognition` → independent authorities.
  Explain what prevents a second +12 and what remains unproven across reload.
- Explain why asking for help retains +12 and why a retry/Child submission grants no progress.
  Open `reward-matrix.test.ts` and `task-lifecycle.test.ts`; tests were not rerun in this audit.
- Explain directory/affinity versus session/task/progress; open registry repositories and initial
  store construction. Identify process-local reset truth rather than claiming durable history.
- Explain the actual deterministic recommendation inputs and Parent acceptance; identify the
  prepared mode label. Do not describe a live Connection Coach or infer personality.
- Explain why League rows omit private details and why the Green Circle and private Reward use
  separate eligibility. Open `privacy-projection.test.ts` and `family-reward.test.ts`.
- Identify the actual human's own contribution and supporting AI prompts/diffs. Record unanswered
  questions and follow-up learning; never fill an understanding/review row from this answer guide.

Supplied organizer materials were directly read through the existing PDF reader: Orientation
physical pages 3/9/10/12/13/17 and GitHub Guide physical pages 7–11. Orientation SHA-256
`134921ede4b12532d2b49e32ea4c87253b3de0930959ff64939fb2f2aa3eb6a9`; GitHub Guide SHA-256
`55e7c4cfc31923cb45721b1fd6af0bf0357f704cbea0eb2aa24f31f95144768d`. These substantiate the bounded
supporting-AI and real student-understanding requirements; no qualification or human participation
is established. Raw files remain untracked/unmodified.

## Finding register

No new runtime product defect was reproduced during D-001. These records distinguish actual
source/environment observations from future tests and previously reported browser failures.

| ID     | Priority / class                                 | Candidate/platform and reproduction                              | Expected / observed                                                                                       | Evidence / owner / retest                                                                      |
| ------ | ------------------------------------------------ | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| D-F001 | P1 restart target gap; known process-local limit | 02b9618 source; trace initial session and local repositories     | Durable target needs a new story; current source rebuilds task/progress while restoring directory/access  | Source trace above; historical QA-01 belongs to 55f9f2b; A-002/B-002; D runtime retest NOT RUN |
| D-F002 | P0 physical acceptance blocker                   | Host ADB exit 0 empty; APK search no matches within stated scope | Need exact standalone build and devices; none established here                                            | Environment record above; A-003/operator; native BLOCKED                                       |
| D-F003 | Contract challenge, severity unassigned          | 02b9618 source; sequential clears in resetPrototype              | A must define coherent recovery after later storage failure and stale work; fault behavior not reproduced | Source trace item 4 and D-M17/18; A/B contract owner; NOT RUN                                  |

A-004 temporary Parent handoff correction, B-004 family replacement investigation and C-002
presentation are active producers in board revision 3. Their released integrated hash needs a
separate D-002 record. Do not fold future corrected outcomes into this baseline report.

## Actual assistance, review and handoff

User task: “Session D — independent QA and rehearsal,” supplied in this conversation. The session
role prompt is preserved at `docs/competition-readiness/orchestration/session-d-qa.md` in baseline
02b9618; current conversation instructions govern if they differ. Exact operative user excerpt:

> If no candidate is assigned, start the read-only baseline/contract audit and publish findings in
> your outbox. Do not edit the board, change product source or claim another session's test slot.

D generated only the source-audit findings, acceptance matrix, device/Q&A preparation and status/
report records. No app code, test, image, provider result, student review or rehearsal was generated.
Skill applied: `.agents/skills/ghaf-quality-workflow/SKILL.md`.

Independent helper `/root/privacy_matrix_review` received this actual prompt:

> You are Session D's single allocated helper (board revision 2, D-001-r1). Read-only bounded task
> in /home/smyk/projects/Ghaf-qa-rehearsal at exact 02b9618631fa9fc1b29f2cda5fa68c6adb2003fd:
> independently challenge privacy/authority acceptance coverage for canonical +12 recognition,
> League vs Green Circle, Feature 008 zero progression, and reset/recovery family/profile identity.
> Read repository instructions and canonical coordination README/BOARD; do not edit any file,
> including lead statuses. You are not alone: preserve others' work. No helpers/descendants, test
> execution, installs, browser, builds or resource jobs. D owns durable report; you return findings
> only. Read D-M01–D-M24 draft matrix in canonical
> /home/smyk/projects/Ghaf/docs/competition-readiness/coordination/STATUS-D.md; inspect focused
> source/tests for gaps without duplicating the full repository audit. Return at most 5 concrete
> corrections or uncovered acceptance cases with exact source/test paths, clearly distinguish
> source-derived risk from reproduced defect, and state any rejected false-positive suggestion.
> Do not claim human/native evidence or unknown behavior. Include actual model/reasoning requested
> vs observable. Root does source-report production in parallel.

Helper contribution: four source-derived matrix corrections accepted by D; no source writes or
runtime checks. The helper's closing self-description said inherited settings; the actual parent
launcher supplied Astra/ultra explicitly. Record launcher selection only, not proven served settings.
No helper suggestion is represented as an observed UI defect.

Accepted corrections:

1. D-M12 distinguishes the visible `privateLeague` runtime from generic week-service behavior.
   `src/features/league/presentation.ts:10` starts at prepared 4/4/3 and the canonical event adds
   Salem's fifth Leaf. Add `tests/r002b-private-league-presentation.test.ts` and
   `tests/r002b-private-league-route-integration.test.ts`; generic `family-league.test.ts` rollover
   tests do not establish an executable weekly-reset UI.
2. D-M16 means lifetime evidence 108→120 with optional presentation gated. The default-off source
   still maintains the internal lifetime projection (`usePrototypeStore.ts:4843`;
   `tests/r002b-progression-store.test.ts:136`). Reject the false positive that internal projection
   itself violates the flag gate. The default personal display remains 48→60.
3. D-M14 must compare all authorities before/after repeated Parent plan viewing and inspect actual
   Child/shared/assistant outputs for synthetic guardian/relative names, relationships, rhythms and
   ideas. Include badges, Path, Reveal queue, League and Reward; `progressEffects: none` metadata
   and selected import scans alone do not prove absence of effects or indirect leakage.
4. D-M11 separates non-Green household acquisition (possible canopy, never Circle) from eligible
   Green maintenance (possible Circle, zero Seeds/persistent canopy). These are labeled domain
   cases in `tests/privacy-projection.test.ts:134`; changing the immutable canonical recycling
   payload is not a valid way to complete the UI task as another category.

Lead rejected treating template quotas as active authority, inherited historical passes, config
xhigh as proven Ultra, static tests as native evidence, and current process-local limitations or
unselected memory as new regression defects.

A second helper, `/root/rehearsal_packet_review`, used the same single quota only after the first
helper completed/released. Launcher selection: `gpt-6-astra` / `ultra`; service tier not exposed.
Actual prompt:

> Session D's single helper slot is reassigned to you after privacy_matrix_review completed/released.
> Board revision 3, D-001-r1; exact baseline 02b9618631fa9fc1b29f2cda5fa68c6adb2003fd in
> /home/smyk/projects/Ghaf-qa-rehearsal. Concrete bounded read-only question: review only the
> device/rehearsal and student Q&A portions of docs/competition-readiness/workstreams/d-baseline.md
> against canonical user Session D mission at docs/competition-readiness/orchestration/session-d-qa.md,
> shared-contract.md and two-device-demo.md. Identify at most 3 missing or misleading evidence
> requirements, especially independent primary/secondary tests, physical vs browser accessibility,
> actual timed runs and safe treatment of unknown human owners. Do not redo source/privacy audit
> or Android build prerequisite analysis. Return corrections with section references or 'no changes
> needed'. You are not alone; preserve others' work. No file writes, status writes,
> helpers/descendants, tests, browser, installs or jobs. Parent is formatting/checking report
> concurrently. Launcher requested GPT-6 Astra / ultra; do not claim effective service-tier/runtime
> settings not observable.

Contribution accepted: make secondary-specific Back, text scaling and persistence evidence explicit
in D-M22 and the handoff, alongside install/touch/layout/restart/reset. The helper found no further
change needed for timed runs, browser/native boundaries or pending human ownership. No writes or
runtime execution; helper allocation released after completion. No second-helper suggestion rejected.

## Report verification and release

- Scoped Prettier check: PASSED (exit 0).
- Referenced explicit local source/report paths: 17 checked, zero missing (exit 0).
- Staged whitespace and exact-file review: recorded by the final commit command and live status.
- Application suites/browser/native checks: NOT RUN for this report-only slice; no inherited pass.
- Only this report is committed. `node_modules` is A's read-only symlink to byte-equal locked
  dependencies and remains untracked/uncommitted; it is not a D product edit.
- Both helpers finished and released their read-only allocations. Student/human acceptance pending.
- Ready for A's source-audit integration after the cohesive report commit; source-path release and
  exact commit are published in canonical STATUS-D. Continue to the active producer's next candidate.
