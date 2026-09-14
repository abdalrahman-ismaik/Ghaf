# Team Ownership

## 2026-09-14 Messaging backend integration and Android acceptance

**Resumed by the owner:** continue from clean checkpoint `ce6bd72`; the phone is
authorized and D: caches are available. Artificial commit spacing is revoked:
commit each completed, verified slice promptly. The
[pause checkpoint](workstreams/messaging-android-resume-20260914.md) remains the
historical handoff, not a current instruction to stay paused.

Current exact grants: `/root/merge_core` owns only
`src/components/study/StudyScreen.tsx` and `src/components/study/shared.tsx` for the
observed native layout correction and scoped checks. Root owns `AGENTS.md`,
coordination/evidence, final integration and the sole heavy build lane.
Root also owns `src/components/familyMessaging/FamilyMessagingScreen.tsx` for the
same directly observed native paragraph-direction correction on messaging access.
That messaging boundary includes `MessagingAccess.tsx` and `MessagingConversation.tsx`
to preserve explicit Arabic role/quick-phrase row order inside the corrected context.
Root also updates the existing React Native mock in `tests/messaging/peer-ui.test.tsx`
to support the platform-aware presentation imports; no domain-test rewrite is granted.
`/root/integration_audit_coordinator` may review the patch read-only. Earlier grants
below are historical releases; no other writer retains a source boundary.

The user explicitly authorized backend integration and physical Android testing
using Android Studio. Root starts from clean `caf2d00` on
`integration/messaging-android-20260914`. A dedicated synthetic team messaging
project may be provisioned/configured and tested; the adult pilot remains separate.
No paid plan, real Child data or broader production rollout is implied.

- `/root`: hosted setup, ignored environment/build artifacts, Android Studio/SDK
  integration, specification/evidence/runbook updates, `.env.example`, and final Git work.
  Root also owns the explicit `package.json` messaging start command.
- `/root/messaging_extension`: read-only backend readiness review until an exact
  implementation grant is issued; now owns only
  `workers/ghaf-family-messaging/README.md` and
  `specs/016-real-family-messaging/quickstart.md` for current setup corrections,
  plus `tests/messaging/hosted.integration.test.ts` for opt-in real HTTP acceptance.
  The follow-up evidence boundary is only
  `specs/016-real-family-messaging/backend-android-validation.md`.
- `/root/study_map`: read-only native tool/device/build inventory; no build lane.
- `/root/merge_core`: `scripts/native/build-apk.ps1` only, a Windows launcher for
  the explicitly selected disposable D: candidate; root retains build execution.

At most four active agents, no descendants, one writer per file, and one serialized
heavy build/database/browser lane. Preserve existing work. Physical passes require
an actual connected phone; emulator and local-service results stay separately labeled.

The user subsequently requested parallel backend/web audits with a coordinator.
Earlier helpers have released their work. The active allocation is root plus
`integration_audit_coordinator` (read-only triage), `backend_security_audit`
(read-only SQL/client review), and `messaging_web_audit` (web review and a separately
allocated lightweight browser lane). No descendants or overlapping writes are
authorized. Root retains the sole heavy build lane and all source fixes; browser
startup must fit the measured Windows headroom before it is granted.

Root granted `backend_security_audit` the bounded terminal-refresh recovery fix:
`src/features/familyMessaging/client.ts` and the minimal existing messaging
client/controller regression test files, with exact names reported before edits.
Only focused single-worker tests are allocated; no full suite, build, remote
mutation or Git work. Root retains final source integration and APK identity.

While the web auditor is idle pending its runtime lane, `messaging_retry_fix`
owns only the additive `workers/ghaf-family-messaging/migrations/003_idempotent_retry_budget.sql`
and exact existing SQL regression files reported to the coordinator. Applied
migrations 001/002 stay unchanged. No hosted mutation, Docker/WSL startup or
heavy database job is granted; root owns deployment and final verification.

The first configured web audit reproduced a browser fetch receiver error before
Auth HTTP dispatch. Prior writers released their boundaries; `messaging_web_audit`
now owns only `src/features/familyMessaging/client.ts` and
`tests/messaging/client.test.ts` for the minimal default-fetch binding correction
and focused regression. Its browser is closed for memory headroom during this fix.

All three audit fixes are released to root. The coordinator reviewed the fetch fix
and Windows launcher without further source findings. Root owns
`scripts/native/build-apk.ps1` and `android-build-and-rehearsal.md` integration.
The documentation helper temporarily owns only the current backend/Android evidence
record; root retains build, device, fresh export and final Git work.

## 2026-09-13 Study and family support — Feature 017

User selected proposals 8–12 and confirmed using their saved proposals. Root starts
from clean `c07bad9` on `feature/017-study-family-support`. This Windows worktree is
the coordination location; prior merge boundaries are released. At most four active
agents, no descendants, and one serialized heavy check/database/browser lane.

- `/root`: Feature017 specification/plan/tasks/research/evidence and governing addenda;
  `src/state/usePrototypeStore.ts`, `src/services/index.ts`, i18n resource aggregation,
  `src/components/study/`, study routes/resources, Home/Today/Family entry points,
  integration tests, final checks and local cohesive commits.
- `/root/study_core`: `src/models/study.ts`, `src/features/study/`,
  `src/services/local/studyRepository.ts`, `tests/study/domain.test.ts` and
  `tests/study/repository.test.ts`; the reviewed family-binding fix additionally owns
  `src/models/localFamily.ts`, `src/features/local-family/schema.ts` and
  `tests/study/family-binding.test.ts`.
- `/root/messaging_extension`: `src/features/familyMessaging/`,
  `src/components/familyMessaging/`, `app/messages/`, `tests/messaging/`,
  `workers/ghaf-family-messaging/`, and `src/i18n/peerMessagingResources.ts` only.
- `/root/family_practices`: `src/features/familyPractices/`,
  `src/components/familyPractices/`, `app/parent/practices.tsx`,
  `app/child/practices.tsx`, `src/i18n/familyPracticeResources.ts`,
  `tests/study/practices.test.tsx` and Feature017 `practice-research.md` only.
  Final integration grant: the five existing route/recovery assertions in
  `tests/access/corrupt-local-family-recovery.test.ts`,
  `tests/integration/operator-demo-flow.test.ts`,
  `tests/platform/r003-first-run-experience.test.ts`,
  `tests/presentation/r001-onboarding-flow.test.ts` and
  `tests/presentation/r002a-child-task-presentation.test.ts`.

Read-only explorers `study_map` and `messaging_map` have released their maps. Writers
are not alone; preserve others' edits and do not stage, commit or run heavy checks.
Root integrates every shared boundary. No provider activation or deployment is
included; real-message delivery readiness is documented separately from source.

**Implementation release:** all helper write boundaries are released to root.
Typecheck, lint, formatting, 2,718 regression tests (one opt-in skip), 41 SQL tests,
compact AR/EN browser journeys and web/Android exports passed. Root owns final
documentation and the user's authorized merge/push. Source is ready for integration;
hosted messaging, physical Android and named human review remain NOT RUN. See
[Feature 017 evidence](../../specs/017-study-family-support/validation.md).

## 2026-09-13 Main merge conflict resolution

The user authorizes pushing all work, merging and resolving conflicts. `/root`
integrates the existing merge of local `9fa5aee` and incoming `abc8598`, preserving
both approved feature sets. This Windows worktree is the coordination location for
this bounded merge; prior publication source boundaries are released. Maximum four
agents including root, no descendants, and one serialized dependency/check lane.

- `/root/merge_core`: `src/state/usePrototypeStore.ts`, `src/services/index.ts`,
  `src/services/local/{index,repository,storage}.ts` only.
- `/root/merge_ui`: `app/{_layout,index}.tsx`,
  `src/components/onboarding/FirstRunOnboarding.tsx`,
  `tests/platform/r003-first-run-experience.test.ts` only.
- `/root/merge_docs`: conflicted Markdown files only, including this record and
  Feature 003 spec/plan/tasks. Preserve both historical evidence sets and paths.
- `/root`: dependency manifests, bilingual resources, other conflicted tests,
  repository integration checks and corrective test paths, merge evidence,
  Git staging/commit/fetch/push and final verification.

Writers preserve each other's changes and do not stage, commit or run heavy checks.
This merge does not activate a feature flag or assert new native/provider evidence.

Follow-up regression grants: `merge_core` owns the relocated access recovery and
pilot lifecycle tests plus the configured-age policy test. `merge_ui` owns the
relocated onboarding-readiness, hydration and recovery UI tests and the shared
ambient provider's existing screen-reader race safeguard. These grants supersede
the initial boundaries only for the named files; root serializes all checks.

The UI follow-up also owns `src/components/access/LocalFamilyRecovery.tsx` for
navigation preflight and the Welcome repair-candidate guard. All helper write
boundaries are now released. Root owns final validation and publication, including
the exact historical-artifact manifest and measured integration-test timeouts.

**Validation complete:** 2,623 tests passed, one opt-in local integration test
skipped; TypeScript, lint, formatting, repository checks and web/Android exports
passed. Independent review is complete. Root owns the authorized normal main
merge/push; the [merge record](workstreams/main-merge-20260913.md) holds exact
evidence and remaining native/provider/human limitations.

## 2026-09-13 Real Parent Pilot Authentication

**Integration owner**: `/root`. The user approved the complete login-only pilot
plan: Supabase in Mumbai, email/password, self-registration with dashboard approval,
Android and web, real adult accounts only. Feature 006 owns the narrow exception.
Preserve all starting worktree changes; baseline copies are ignored under
`.expo/pilot-auth/baseline/`. No more than four agents run concurrently.

**Exclusive write boundaries**:

- `/root`: Feature 006 specification and evidence, constitution and product/runbook
  addenda, this ownership record, dependency/lock/config changes, `app/_layout.tsx`,
  pilot components/controller and their tests, bilingual resources, final integration.
  Root also owns the bounded pilot import mock in the existing hydration test and
  additive Feature 006 guidance in `AGENTS.md`, design and demo runbooks.
- `/root/pilot_accounts`: `src/models/parentAccount.ts`,
  `src/services/accounts/`, and `tests/parent-account-*.test.ts` only.
- `/root/pilot_database`: `supabase/`, `docs/backend/`, and
  `tests/pilot-database-*.test.ts` only.
- `/root/pilot_lifecycle`: `src/state/usePrototypeStore.ts` only additive pilot
  lifecycle commands, `src/services/index.ts`, `src/services/local/` only memory
  storage extraction/exports, `src/features/pilot/config.ts`, and
  `tests/pilot-demo-*.test.ts` only.

Writers are not alone in the repository. Do not revert others' edits, stage their
work, or commit shared files. Root serializes formatting, integration and scoped
commits. Hosted activation remains a separate reviewed gate; provisioning and
SMTP sender readiness are recorded truthfully.

**Status**: Implementation complete; Gmail SMTP and bilingual email templates are
configured and verified. Controlled delivery, hosted account flows and physical
Android acceptance remain outstanding; hosted activation remains blocked. Exact evidence is recorded in
`specs/006-real-parent-pilot/validation.md`.

## 2026-09-13 Repository Completion Review

**Integration owner**: `/root`. Preserve the existing uncommitted maintainer,
configured-age and hydration fixes. Read-only reviewers `unfinished_inventory`,
`growth_task_review` and `async_ui_review` inspect disjoint behavior areas; no more
than four agents run concurrently.

**Initial writer boundary**: `/root` owns this log,
`docs/audits/2026-09-13-repository-completion.md`,
`specs/004-bounded-live-ai/tasks.md` only for the later browser-evidence addendum,
and ignored `.expo/repository-completion/` verification logs. Runtime and regression
test files will be reserved below before edits. No dependency, flag activation,
deployment or shared-history change is included.

**Scope**: Find and repair confirmed defects in approved Features 003–005, verify
the integrated worktree, and distinguish incomplete implementation from historical,
native, provider and named-human acceptance gates. Corrupt-directory recovery was
initially pending; the user explicitly approved confirmed local recovery during
this work period.

**Runtime allocations**:

- `/root/onboarding_audio_fix`: `app/_layout.tsx`,
  `src/components/onboarding/{FirstRunExperienceContext,FirstRunOnboarding}.tsx`,
  the existing narrator/ambience hooks only if necessary, one bounded foreground
  readiness hook in that directory if needed, `tests/r003-first-run-experience.test.ts`,
  and new `tests/onboarding-presentation-readiness.test.tsx`. Repair startup,
  foreground/focus, and failed-image-revisit audio readiness while preserving the
  existing hydration repair and prepared-only playback.
- `/root`: `src/services/mock/index.ts` only Family League week creation and
  `tests/family-league.test.ts`, for filling a rolled week after a prepared
  encouragement without losing that valid encouragement.

Every writer preserves the starting worktree changes and releases its exact
boundary after focused verification. Root serializes final integration.

- `/root/completed_task_suggestion_fix`: `src/features/growth/parentProgress.ts`
  and `tests/r002b-parent-progress.test.ts`;
  suppress an unavailable Task Builder suggestion after the one-time P0 task is
  recognized. Do not add repeat assignments or change any progression authority.

**Confirmed local recovery allocation**: `/root` owns the Feature 003
`{spec,plan,tasks}.md` amendment, Feature 005 `{spec,plan,tasks}.md` compatibility
addendum, `PRODUCT.md`, `PROTOTYPE_LIMITATIONS.md`, `DESIGN.md`, `DESIGN_DIRECTION.md`,
`DEMO_RUNBOOK.md`, and the new audit report. Recovery is an in-route Welcome state,
not a new route or production account-recovery feature.

- `/root/local_recovery_core`: `src/models/localFamily.ts`,
  `src/state/usePrototypeStore.ts` only family-read classification, recovery commands
  and shared reset implementation, `src/services/local/{repository,deviceAccessRepository}.ts`,
  `tests/local-family-repository.test.ts`, new `tests/corrupt-local-family-recovery.test.ts`,
  and affected local-family/remembered-device tests if needed for the new contract.
- `/root/local_recovery_ui`: `app/index.tsx`, new
  `src/components/access/LocalFamilyRecovery.tsx`, `src/i18n/resources.ts` only additive
  recovery copy, and new `tests/local-family-recovery-ui.test.tsx`.

Core and UI writers agree the typed command contract before implementation.
Preserve ordinary Parent-only reset and all previous source changes; no real data
is cleared during verification. Use isolated synthetic storage.

**Status:** All boundaries are released after independent review. Final typecheck,
lint, formatting, whitespace and all 1,768 tests across 133 files pass. Updated web
export has 39 routes; Android Hermes export passes after the required compiler
execution retry. Browser evidence covers bilingual recovery, Cancel/Back, corrupt
Retry, verified three-key clearing, Arabic Welcome and new-family setup. Measured
320-pixel Arabic/English confirmation layouts fit without horizontal overflow.
Physical Android/TalkBack, native media, named Arabic review and external provider
acceptance remain NOT RUN or their existing blocked status. No dependency, flag,
provider, deployment, push or shared-history rewrite occurs. Root owns final scoped
local commits and preserves all unrelated starting changes. Full evidence and file
boundaries are in `docs/audits/2026-09-13-repository-completion.md`.

## 2026-09-12 Interactive Configured Age Verification

**Owner**: `/root`, following the user's explicit request to start interactive
browser verification. Reserved files: this ownership log,
`docs/audits/2026-09-11-maintainer-audit.md`, ignored local preview/browser helpers,
and `output/playwright/maintainer-audit/configured-age-*.png` evidence. Existing
source/test changes remain preserved. `/root/configured_age_map` provides a
read-only route and safety checklist; only root operates the browser.

**Scope**: Local UI-driven synthetic setup, configured-age Coach controls and
permission visibility. No real recording, provider requests, production systems,
release activation, commit or push. Record observed results and exact blockers.

**Status**: Complete and released. Chromium verification captured 332 snapshots
across 21 routes and 20 new synthetic screenshots. Configured-age controls, Parent
grants/revocation, pairing, repeated Coach actions and reset passed. A confirmed
static-web hydration mismatch was repaired and replayed against the final default
build for remembered Arabic/English Child, remembered English Parent and signed-out
reset states. Final typecheck, lint, formatting, whitespace and all 1,699 tests across
130 files passed; default web export produced 39 routes. Browser and preview are
closed (no listeners on 8093/9225). Native/provider acceptance remains unverified.
No default flag, fixture, dependency, commit or push change occurred.

**Confirmed browser fix allocation**: `/root/configured_age_ui` owns
`app/_layout.tsx` and new `tests/web-hydration-boundary.test.tsx` only, for the
verified static-web hydration mismatch between exported signed-out HTML and a
remembered Child session. Preserve native initialization, access rules and store
restoration. Root owns subsequent export and browser replay; no overlapping edits.

## 2026-09-11 Configured Child Age Authority Follow-up

**Integration owner**: `/root`. The user approved configured Child age as the
authority for Coach input options and voice permissions while retaining the
underlying demo fixtures. Preserve every uncommitted maintainer-audit change.

**Root documentation boundary**: this ownership log,
`docs/audits/2026-09-11-maintainer-audit.md`,
`specs/003-family-growth-garden/{spec,plan,tasks,data-model}.md`, and
`specs/004-bounded-live-ai/{spec,plan,tasks}.md` for the approved clarification,
implementation tasks and exact verification evidence. Runtime/test allocations
are recorded below; no overlapping writers.

**Scope**: One shared effective-age projection, corresponding prepared/live Coach
and voice authorization, pending-result invalidation, and the existing Child task
and Parent permissions surfaces. No fixture mutation, age-editing feature,
dependency, native capture, provider call, release activation, commit or push.

**Runtime/test allocation**:

- `/root/configured_age_core`: `src/features/local-family/agePolicy.ts`, its export
  in `src/features/local-family/index.ts`, `src/models/familyGrowth.ts` only the
  `ChildCoachRequest` age field, `src/features/assistants/policy.ts` only prepared
  Coach age validation, and age-related paths in `src/state/usePrototypeStore.ts`.
  Tests: new `tests/configured-child-age-policy.test.ts`, and the directly affected
  age cases in `tests/{assistant-safety,live-child-ai-grants,live-child-coach-store}.test.ts`,
  `tests/{live-voice-integration,bounded-ai-integration}.test.tsx`.
  Also `tests/helpers/configuredChildAge.ts` for shared synthetic directory setup
  that persists through normal access rehydration without changing fixture ages.
- `/root/configured_age_ui`: `app/child/task.tsx`,
  `app/parent/settings/permissions.tsx`, new
  `tests/configured-child-age-ui.test.tsx`, and directly affected source/render
  expectations in `tests/{live-child-coach-ui,live-voice-ui}.test.tsx` only.
- `/root/configured_age_map` remains read-only. Root owns documentation and final
  integration; additional files require an explicit reservation.
- `/root/audit_access_persistence`: browser-only follow-up using isolated local
  synthetic profiles, ignored helper/profile data and `configured-age-*.png`
  evidence under `output/playwright/maintainer-audit/`; no tracked source edits.
- Root resumes the released boundaries for final integration, including formatting
  only `tests/configured-child-age-policy.test.ts` after the global formatter caught
  its newly added cases. Worker source/test edits are complete.

**Status**: Complete and released. Configured age now governs prepared/live Coach
policy and live voice eligibility through one validated selector. Missing or invalid
age fails closed; existing grants remain revocable. Canonical fixture ages and all
previous audit fixes are preserved. Core checks passed 161 tests; UI checks passed
64 tests. Final typecheck, lint, formatting, whitespace and all 1,695 tests across
129 files passed; web export produced 39 routes and Android export one Hermes bundle.
Automatic approval review blocked the isolated Chromium launch with “blocked by
policy”; new interactive browser evidence is `BLOCKED / NOT RUN`, as is native
acceptance without direct device evidence. No provider/audio activity, dependency
change, live-flag activation, commit or push occurred. R-01 is resolved; the unrelated
corrupt-directory recovery decision remains open in the audit report.

## 2026-09-11 Maintainer Correctness and Completeness Audit

**Integration owner and writer**: `/root`.

**Reserved boundary**: `TEAM_OWNERSHIP.md` and
`docs/audits/2026-09-11-maintainer-audit.md` for the worklist and coverage/evidence map.
Runtime, test, and additional documentation boundaries will be reserved explicitly
after a defect is confirmed. Baseline logs and build output remain ignored under
`.expo/` and `dist/`.

**Allocated fix boundaries**:

- `/root/audit_access_persistence`: `src/services/local/repository.ts` and
  `tests/local-family-repository.test.ts` only, for failed reset/legacy resurrection.
- `/root/audit_ai_lifecycle`: `src/state/usePrototypeStore.ts` only inside
  `requestLiveChildCoach` and directly necessary local request-current validation;
  `tests/live-child-coach-store.test.ts` for pending authorization expiry/age changes.
  Also `src/services/native/ExpoVoiceCaptureService.ts` and
  `tests/live-voice-services.test.ts` for duration validation against the installed
  Android recorder's stop/reset behavior, with synthetic adapters only.
  These first two fixes are released. The follow-up allocation is
  `src/state/usePrototypeStore.ts` only `stopLiveVoiceHold` and
  `tests/live-voice-integration.test.tsx` for invalid successful transcription fallback.
  Review follow-up also includes the same native adapter/service tests for resolved
  native stop-status failures, plus current-operation capture failure cleanup in the
  same store/test boundary. No duration may be fabricated for native auto-stop.
- `/root/audit_growth_transactions`: `src/features/shared-growth/sharedGrowth.ts`
  and `tests/r002b-shared-growth.test.ts`, preventing participation actions from
  invalidating existing contribution history.
- `/root/audit_access_persistence`: the repository fix is released. Follow-up
  ownership is `app/access/child/{pin,pair}.tsx`,
  `app/parent/settings/{devices,permissions}.tsx`, and
  `tests/configured-child-identity-ui.test.tsx` for configured identity presentation.
  One small shared presentation selector may be added at
  `src/features/local-family/childIdentity.ts` if needed by these four routes.
- Root: audit/ownership records, navigation investigation, project health, and
  final integration. Root will not edit the store while the AI boundary is owned.
  Root additionally owns `README.md` to correct stale branch/feature-completeness
  statements using accepted implementation evidence.
- `/root/audit_ai_lifecycle`: prior fixes are released. Browser follow-up ownership
  is `app/access/child/pair.tsx` and `tests/child-pairing-back.test.tsx` only,
  restoring the credential-ready state when returning from pairing to PIN.
  Preserve the configured identity presentation edits in the route.
- `/root/audit_access_persistence`: identity edits are released; current work is
  browser verification and its scoped screenshot artifacts only.
- `/root/audit_growth_transactions`: native completion follow-up owns
  `src/services/native/ExpoVoiceCaptureService.ts` and
  `tests/live-voice-services.test.ts` only. Recover trustworthy duration for
  native automatic completion using the installed silent media metadata reader;
  preserve all previous stop/status/cleanup fixes and use synthetic adapters only.

**Scope and authority**: Audit accepted Features 003–005, fix verified defects with
local synthetic regressions, preserve default-off flags and native/human gates.
The starting tree is clean on `main` at `07f484c`. The current user instruction
prohibits commits, pushes, deployment, production activity, and destructive changes;
it supersedes earlier commit/push permissions for this audit.

**Status**: Complete; all runtime and test boundaries released. Root integrated
verified persistence/reset, configured identity, pairing Back, Shared Growth history,
Coach authorization, voice fallback/cleanup, and native stop/duration repairs.
Final typecheck, lint, formatting and all 1,631 tests across 127 files pass. Web export
passes for 39 routes; Android Hermes JavaScript export passes. Isolated Chromium
verified configured identity, pairing/Back, remembered access, temporary Parent
handoff and signed-out Arabic reset; ten synthetic screenshots are retained in
`output/playwright/maintainer-audit/`. Physical Android is blocked by no attached
target; live provider and named-human acceptance remain unrun. Age authority and
corrupt-directory recovery needed owner decisions at that checkpoint; the approved
configured-age follow-up above resolves the former.
No dependencies, release flags or shared history changed. The patch is ready for
contributor review and remains uncommitted/unpushed under the current user authority.

## Repository publication — 2026-09-13

Owner: root publication session. The user explicitly requested an updated README
with the selected logo and current information, followed by an appropriate push of
all latest changes, and confirmed that all other editing sessions are paused.
Root now owns final integration, validation, focused corrections, staging and
committing the pending files captured in `output/publication-20260913/initial-status.txt`.
Additional exact documentation boundaries: `README.md`, this reservation,
`docs/competition-readiness/workstreams/repository-publication-20260913.md` and an
additive final publication entry in the existing coordination board. Preserve all
historical status content, attribution, private inputs and ignored build outputs.
One read-only helper reviews the CE1 authority seams; no helper writes or descendants.
Root runs one serialized check lane. The authorized remote action is a normal push
to `origin/redesign/ui-experiments`; no main merge, force-push or deployment is selected.
The initial branch baseline is `bc21189`. README `b2902a1`, catalog `3b58e95` and
narration `6913c52` are committed. All source checks, 167 files / 2,269 tests,
repository checks and web export passed; Expo retained its shutdown warning.
Source/helper/check boundaries are released. Root retains only the final publication
checkpoint and authorized branch push. Native, human and live-service validation
remain NOT RUN; the publication report preserves exact evidence and initial failures.

Hosted CI follow-up: root reserves `src/components/botanical/BotanicalPressable.tsx`
for the clean-checkout TypeScript excess-property failure reported by GitHub run 34771317980. Preserve pressed/hover behavior; no feature or style change. Root also
owns the README's hosted-check status wording and an additive publication-report
result. The existing push authorization covers this focused correction.
The unchanged fresh-checkout configuration reproduced the failure before the fix
and passed afterward; ordinary typecheck, scoped zero-warning lint, formatting and
whitespace checks also passed. Source scope is released for the follow-up push.

## Root documentation cleanup — 2026-09-13

Owner: root repository-maintenance session, direct user authorization to move unnecessary root
documents, remove redundant local files and add appropriate ignore rules. This supersedes the
earlier maintenance decision to retain all canonical Markdown files at the repository root.
Reserve the eight root product/design/research/runbook/ownership/handoff documents, their new
locations under `docs/`, `AGENTS.md` outside its managed block, `README.md`, `CONTRIBUTING.md`,
maintained documentation link targets, `docs/architecture/**`, `scripts/repository/**`,
`.gitignore`, and a public AI-assistance summary. Historical evidence content and detailed
AI-assistance records remain tracked. No authorship or human-review claim is added.
Preserve M016's active source, spec, package/configuration, index activity and B/C/D/BOARD writers.
No package, dependency, app/source/test, native, provider or heavy-job changes are reserved here.
Update current navigation atomically with relocation; old narrative paths remain traceable in a
document relocation map. No helpers allocated. Completion evidence follows.
Current ownership location: `docs/competition-readiness/TEAM_OWNERSHIP.md`.
Maintenance handoff: eight documents relocated; seven redundant download sidecars removed;
private/reference/tool-state ignore rules added; required AI-assistance evidence retained.
Five repository-tool tests, navigation/relocation checks, scoped lint/format, design-context
discovery, managed-block equality and ignore acceptance passed. Sixteen moved/relinked documents
introduce zero new broken Markdown destinations; 54 existing local/historical destinations remain
attributed to their original records. No application/native/provider checks were claimed.
Status: COMPLETE; release these documentation/tooling paths after the scoped local commit.
M016 source, package, specification, resource/job and coordination ownership remains unchanged.

## Repository organization — completed 2026-09-13

Owner: root, user-authorized repository organization and GitHub review preparation.
Scope: `tests/**` (path organization and corresponding relative references only),
`README.md`, `CONTRIBUTING.md`, `docs/{README,DEVELOPMENT}.md`,
`docs/architecture/{REPOSITORY_STRUCTURE,REPOSITORY_AUDIT}.md`,
`docs/architecture/adr/0003-repository-organization.md`,
`{src,assets,scripts,specs,workers,tools}/README.md`, `.github/**`, `.editorconfig`,
`package.json`, `scripts/repository/**`, and this reservation.
No helpers allocated. One serialized validation job; no native build or preview restart.
Preserve runtime source, canonical product/specification contracts, historical evidence,
all B/C/D status/report ownership, and user-added media/reference directories.
Handoff: cohesive local commits, complete test discovery, static checks, repository navigation
validation, and an explicit remaining-evidence record. Status: COMPLETE; release all reserved
maintenance paths when this record is committed. No helper, build or preview process is retained.

Validation follow-up: additionally reserve `app/index.tsx` for the single unused `t` binding
reported by zero-warning lint. Preserve its translation hook and all route behavior.
The test boundary also covers four existing lint-only warnings (unused bindings, readonly-array
syntax and import order), retaining every test assertion. Include tests, Workers and the new
repository tooling in the maintained lint command.

Handoff: test organization committed as `7624d92`; unused route binding as `29f9fe4`.
Final regression passed 153 files / 2,027 tests; typecheck, expanded zero-warning lint,
formatting, four repository-tool tests, navigation/artifact checks, local Expo compatibility,
workflow YAML and 39-route web export passed. Export retained color/shutdown warnings.
See `docs/architecture/REPOSITORY_AUDIT.md` for precise commands and limitations.
Hosted CI, browser, physical Android and named-human review were NOT RUN. No push, merge,
deployment, native build, flag activation, media intake or other owners' work was included.

## NB1 current integration — 2026-09-12T11:22:10.376696+00:00

Canonical board59 and continuing A instance A-20260911T2220Z-root govern exact grants.
Runtime5d8a3e8 is frozen after148 files/1,919 tests plus typecheck/lint/format passed.
Canonical2bb144d integrates B's stage1 evidence and D's actual connection results.
A owns shared integration/master docs/BOARD/STATUS-A and its two permission JSONs in B output.

B owns scripts/native/build-apk.sh, its report, private native/tool/cache/output paths and two
transient package script fields. A162 grants ONE remaining configure stage on B b32174d/runtime5d,
script99ae/init a2d7 with unchanged tools, signing, inputs and limits. B is sole heavy; source/report
frozen while running. Actual process concurrency and fresh generated-edge proof precede full APK.
Runner133052/script133053/observer133054 are B-owned. No emulator/browser/Metro overlaps.

A's Metro79445 is stopped; one demo-preview restart is owed after native work. Owner tapped Allow,
but D then found zero transports. A's authorized reattachment returned0 then dropped immediately.
A read-only helper usb_drop_diagnosis owns Linux/primary-source diagnosis; A lead checks Windows
logs. No new tools, trust, restart or repeated attach loop. D retains existingADB15824; report and
ignored readiness paths remain exclusively D-owned. Its prior listener ended/released. No actual
Android properties, APK install or native journey has passed. Two phone gates remain pending.

C narration remains silent at runtime: first Wiam clip approved, two clips/provenance/listening
pending. Recovery014 deferred; all eight R002b and three live-AI flags off. Student exact-diff
review pending; rehearsals0/10. Four global helpers maximum; A1/B0/C0/D0 currently, no descendants.
Status writers remain live; only A stages their records after explicit brief pause ACKs.

## NB1 activation (historical) — 2026-09-12 01:18:23 UTC

A resumes instance `A-20260911T2220Z-root` on `redesign/ui-experiments` at3b5317a.
A owns `specs/015-demo-entry-onboarding/**`, `.specify/feature.json`, master competition docs,
canonical BOARD/STATUS-A, and upcoming shared store/registry/routes/config/resources integration.
No shared source edit occurs before the committed015 contract. Managed AGENTS block unchanged.
B/C/D exact initial grants are board revision25 and shared-contract.md; each lead acknowledges
its grant on actual startup. One helper per lead, four global; A helper task_product_trace is
read-only exact isolation/adapter feasibility. No other A instance or worker edits overwritten.
The existing terminal-owned Expo PID341101 at canonical root is not ours to kill; native compile
remains blocked until its owner releases it. B may prepare script and bounded isolated dependencies
under its grant, but no competing preview/native build.

## Product correction handoff — 2026-09-12 01:13:40 UTC

A-P01 review and A-P02 existing-behavior repair completed. Runtime commit `e02d02b` changes only
Child approved-instruction presentation and its meaningful regression tests. All four checks pass,
139 files/1,695 tests; browser/native and human exact-diff acceptance pending. All review/correction
helpers explicitly released. Runner363643/exec21484 ended; no heavy/preview/build job remains.

A temporarily owns `docs/competition-readiness/README.md` as well as the reserved prompt, report,
request/ledger and A coordination files to publish the current handoff and avoid the old recovery
queue being mistaken for selected work. All these completed paths release at the documentation
checkpoint; no unfinished source boundary is held. B/C/D remain stopped on prepared52c61fc branches.
New three-profile entry/onboarding/narration work is requested and specified as product intent,
with exact Spec Kit/typed contract and disjoint source grants next. Recovery014 stays deferred.

## Current product correction and entry brief — 2026-09-12 01:05:19 UTC

A continues A-P01 and records the user's explicit three-profile no-auth demo entry,
onboarding redesign and Arabic narration repair request. A owns the new diagnostic report and
`docs/competition-readiness/native-batch/entry-onboarding-contract.md` plus the previously reserved
prompt/master docs. No new entry behavior is implemented in this documentation step.

A additionally grants one bounded correction helper ONLY `app/child/task.tsx` and new
`tests/child-approved-instruction.test.tsx`: show the existing Parent-approved action in the
chosen and active Child task views without removing safety/checklist content or changing task
authority. Existing 003 Parent-reviewed wording is the authority; no new task/content/service.
The helper must establish a meaningful failing rendered regression, preserve others' work, run
focused checks and release its exact diff to A. A alone commits/integrates and runs the full
candidate checks. Completed read-only helpers free their allocations before this worker starts;
maximum two live A helpers, no descendants. B/C/D remain stopped.

## Product/service review steering — 2026-09-12 01:00:55 UTC

User confirms the connected product/service review because features do not feel properly
implemented. A owns new `docs/competition-readiness/workstreams/a-product-service-review.md`
and already held prompt/master docs. Two read-only explorers may trace bounded current services
and task behavior; no writes, tests, jobs or descendants. App source/native/recovery implementation
remains unchanged in this diagnostic/proposal step. Future B/C/D still NOT STARTED.

## Native-batch prompt preparation — 2026-09-12 00:52:17 UTC

A instance `A-20260911T2220Z-root` owns `docs/competition-readiness/native-batch/{README,shared-contract,session-a-native-integration}.md`,
this ownership record, orchestration README, requests/AI ledger, and canonical BOARD/STATUS-A.
Helper `/root/sustained_prompts` exclusively owns the three new `native-batch/session-{b-android-build,c-native-ui,d-device-qa}.md` prompts.
A may safely prepare fresh branches at52c61fc in the explicitly stopped B/C/D worktrees after clean
status checks, preserving all prior branches. This prepares launch inputs; B/C/D are NOT STARTED.
No application code, dependencies, native generation or other lead's status file changes now.
A helper budget2 during preparation: one prompt writer and one read-only review if useful; no heavy
job or preview. Runtime native-batch grants remain pending A's explicit activation on resume.

**Prompt-preparation handoff**: A inspected the three released helper prompts and added the user's
product-refinement steering to C, shared contract and A review. Both helpers released; no job or
future worker session started. New B/C/D branches at52c61fc are prepared, old branches preserved.
All current prompt-preparation paths released after the documentation commit. Native execution
starts only from the new A activation prompt; future grants are not active now.

## Recovery deferral decision — 2026-09-12 00:48:35 UTC

A instance `A-20260911T2220Z-root` recorded the user's decision on recovery014.
Exact temporary write scope: this file; `specs/014-local-progress-recovery/{spec,plan,tasks}.md`;
`docs/competition-readiness/{requests,ai-assistance-ledger}.md`; canonical BOARD/STATUS-A.
No application, dependency, worker status or native build change. One read-only helper reviewed
the decision semantics and released its allocation; no descendants/jobs. The user confirms B/C/D
stopped; they remain stopped. These temporary documentation paths are released after this decision
commit. APK/native validation comes first; later recovery still needs scope/contract acceptance.

## 2026-09-12 Session A Competition Execution Window

**Integration owner**: Session A instance `A-20260911T2220Z-root`, on
`redesign/ui-experiments`, initial HEAD `02b9618631fa9fc1b29f2cda5fa68c6adb2003fd`.

**Scope**: Execute the user's Session A mission through bounded audits, accepted-contract work,
local integration and honest build/rehearsal evidence. New recovery, rationale and memory behavior
requires its committed accepted contract; this reservation does not approve those features.

**Final disposition — 2026-09-11 23:32:44 UTC**: local source candidate
`7fff0f3c2dc0e802ba1da6a67cd2513a75824809` passes typecheck/lint/format and138files/1,677tests.
A-004/A-006/A-008 and B-004/C-002 repairs/refinement are integrated. A-007 was insufficient and
is preserved as history. D's report93a98c0 integrated7beb61c closes the assigned browser reset
subset; no native/full-matrix acceptance. A/B/C/D finished source/report/artifact paths and helper,
heavy-job and preview allocations are RELEASED at this handoff. All jobs/helpers stopped.
A master docs and draft014 proposal reservations below are historical after the final checkpoint;
014ca54e40 remains unaccepted/unimplemented, not an implementation grant. Canonical status files
retain their sole writers; A remains integration owner for future grants. No unfinished source
path is held. Native/APK, actual devices, student review and rehearsal remain blocked/not run.

**Reserved boundaries during this completed batch**:

- A: canonical `docs/competition-readiness/coordination/BOARD.md` and `STATUS-A.md`, this file,
  `docs/competition-readiness/workstreams/a-contract.md`, `requests.md` and
  `ai-assistance-ledger.md` under `docs/competition-readiness/`, and that directory's
  `android-build-and-rehearsal.md` and `two-device-demo.md`. A controls future shared source grants;
  no application source change is assigned by this initial reservation.
- B/C/D alone write their respective canonical status files. Their exact source/report grants,
  assigned worktrees and task acceptance are published in the live BOARD before writes.
- A's helper allocation is one read-only helper initially; helpers never write coordination.

**Additional A-004 reservation**: `app/index.tsx` and
`tests/temporary-parent-entry-route.test.tsx` for the existing Feature 005 temporary Parent entry
regression; see board revision 2. No store, onboarding persistence or new feature boundary.

**Revision 3 transfers**: A exclusively releases `src/state/usePrototypeStore.ts` to B for
B-004 replacement-reset correction under Feature 011; B also owns its existing replacement test.
C exclusively receives `src/components/r002a/child/ChildTodayTaskCard.tsx` for the selected existing
botanical presentation refinement. Their own reports remain granted. Neither has a new recovery
feature grant. Shared dependencies are linked read-only at identical lockfiles; C owns preview.

**A-002 planning reservation**: `specs/014-local-progress-recovery/**` and
`.specify/feature.json`, A only, DRAFT with no implementation/release authority.

**Status**: Paused at a completed local integration handoff, with remaining native/human/scope gates.
Preserve canonical B/C/D status authorship and untracked `docs/SMAC 2026/`.
Only A stages live coordination, following the status-pause/ACK protocol. No push, main merge,
deployment, release activation or fabricated student approval is authorized.

## 2026-09-12 Sustained Codex Session Coordination Window

**Integration owner**: `/root` on `redesign/ui-experiments`.

**Scope**: User requests stronger multi-hour prompts and explicit shared progress/findings across
independent sessions. This window edits the orchestration workflow and documentation only.
It does not start the proposed product implementation or activate any app feature.

**Reserved boundaries**:

- `/root`: `docs/competition-readiness/coordination/**`, orchestration `README.md` and
  `shared-contract.md`, package `README.md`, `requests.md`, `ai-assistance-ledger.md`, this ownership
  record, the Collaboration and Ownership concurrency paragraph in `AGENTS.md`, and the
  qualification-status correction in `research-and-product-strategy.md`.
- `/root/sustained_prompts`: only the four `orchestration/session-*.md` role prompts.
- `/root/coordination_review`: read-only review; no writes.
- `/root/resource_audit`: read-only WSL resource assessment; no writes.

Preserve all other edits, configured capacity ten, raw references and user-supplied PDFs.
Root serializes shared protocol changes and final documentation integration. At most four agents
run in this editing window. The future four-session protocol has one writer per coordination file. The user additionally
authorizes scoped helpers under the configured per-session capacity of ten; the protocol must
coordinate a measured global budget rather than assume forty helpers are safe.

**Status — completed 2026-09-12**: Four role prompts now continue ordered preauthorized batches
and use scoped helpers, canonical shared status/outbox/ACK records, explicit file release,
resource grants and interruption recovery. The coordination hub contains one A-owned board,
four single-writer status files and the operating/resource guides, initialized honestly as
NOT STARTED. Independent review resolved startup, browser-process-tree and review-gate wording.
A read-only snapshot measured 16 logical CPUs, 7.47 GiB WSL memory and 4.80 GiB available; the
starting global allocation is four helpers plus four leads, with measured growth toward eight
helpers, one heavy job and one Metro/browser lane. Forty helpers were not load-tested.

Scoped Markdown formatting, 171 local links, Git whitespace and preserved Spec Kit-managed
context checks passed. The remaining AGENTS change is only its concurrency paragraph. Application
source, dependencies, `.codex/config.toml`, native configuration and feature flags are unchanged;
no application tests were rerun for this documentation-only work. Student/native evidence remains
pending; qualified attendance is correctly recorded as unconfirmed. All writer boundaries are
released for local integration. No push, main merge, deployment or future-session activation occurred.

## 2026-09-12 Competition Readiness Inspection and Tooling Window

**Integration owner**: `/root` on `redesign/ui-experiments`.

**Scope**: User-authorized bootstrap/tooling review and repository-local installation, extraction
and inspection of supplied design references, current QA, evidence-based product proposals, and
a multi-session implementation prompt pack. Product proposals do not activate new runtime behavior.

**Reserved boundaries**:

- `/root`: `.gitignore`, `.codex/config.toml`, new reviewed `.agents/skills/` additions,
  `scripts/tooling/`, `tools/`, `TEAM_OWNERSHIP.md`, and `docs/competition-readiness/` except
  the three reports reserved below. Runtime source and existing product/specification contracts
  remain read-only in this inspection window.
- `/root/roadmap_writer`: `docs/competition-readiness/research-and-product-strategy.md` and
  `docs/competition-readiness/orchestration/*.md` only; aligns the latest competition-first brief.
- `/root/plan_alignment`: read-only product/prompt alignment review; no write boundary.
- `/root/bootstrap_audit`: read-only bootstrap/configuration inspection; no write boundary.
- `/root/tooling_install`: root delegates `.codex/config.toml`, `tools/codex/`,
  `scripts/tooling/`, the new `ghaf-presentation`, `ghaf-quality-workflow`, and
  `ghaf-reference-intake` skill directories, and `docs/competition-readiness/tooling-report.md`.
- `/root/profile_fix`: `src/components/family-growth/ParentTaskComposer.tsx` and new
  `tests/parent-task-composer-profiles.test.tsx` only. This bounded correction makes existing
  Task Builder choices reflect configured Child profiles; it adds no product capability.
- `/root/template_audit`: `output/competition-readiness/template-review/` and
  `docs/competition-readiness/template-catalog.md` only.
- `/root/qa_audit`: `output/competition-readiness/qa/` and
  `docs/competition-readiness/qa-report.md` only.

All writers preserve the user-supplied source folders, existing skills and one another's work.
Raw bootstrap credentials, third-party archives and extracted exports remain local, outside
commits. No bundled installer is executed before review. No deployment, push, merge, production
service, real Child data, release flag, or new product integration is authorized by this window.
At most four agents run concurrently; root serializes shared tooling and final integration.

**Status — completed 2026-09-12**: Boundaries released after integration review. `9619ed1`
adds pinned project-local MCP tooling and three scoped skills while preserving the user's updated
TOML capacity of ten. `236bbae` corrects configured Child choices and Arabic numeric isolation,
with six regression cases. The final source passes TypeScript, full uncached lint plus a final
scoped lint, maintained-file formatting, and 137 test files / 1,660 tests. Browser retests pass
Arabic one-Child and English two-Child choices at 320 CSS pixels, including visual age-band order;
one complete mixed-locale local task/help/recognition/growth path was observed.

The package catalogs all 13 supplied archives, records bootstrap dispositions and research, and
provides four copy-paste Codex prompts, a 2–3 minute primary-phone script, independent secondary
validation, an APK build path, Q&A guide and honest AI-use record. The roadmap prioritizes local
progress recovery, truthful recommendation rationale and proposed private memory before optional
breadth. Confirmed progress still resets after reload; the memory timeline is unimplemented.
Android installation, physical/native acceptance, timed human rehearsals and named reviews remain
BLOCKED or NOT RUN. User-supplied SMAC PDFs remain untracked and unchanged. Raw source packs,
credentials and local evidence remain excluded from commits. No push, main merge, deployment,
submission or feature-flag activation occurred. Four sessions remain the recommended work plan;
the user's configured capacity of ten is preserved, not treated as a requirement to launch ten.

## 2026-09-11 Tamagui Botanical Redesign Window

**Integration owner**: `/root`. User authorized the proposed app-wide Tamagui and Reanimated
redesign in this session. Preserve the pre-existing package-lock metadata removal while adding
the intentional Tamagui dependency. No push, deployment, R002b activation, or domain changes.

**Reserved boundaries**:

- `/root`: package/configuration, `app/_layout.tsx`, `src/design/**`,
  `src/components/primitives.tsx`, `src/components/botanical/**`,
  `src/components/access/**`, `src/components/r003/**`,
  `src/components/r002a/R002aScreen.tsx`, `src/components/r002a/R002aFlowHeader.tsx`,
  `src/components/onboarding/**`, design/specification/evidence documents and integration tests.
- `/root/parent_ui`: `app/parent/**`, `src/components/r002a/parent/**`,
  `src/components/family/**`. Presentation changes only.
- `/root/child_garden_ui`: `app/child/**`, `app/garden.tsx`, `app/league.tsx`,
  `src/components/r002a/child/**`, `src/components/family-growth/GardenLandscape.tsx`,
  `src/components/family-growth/FamilyCanopy.tsx`,
  `src/components/r002b/PrivateLeagueScreen.tsx`. Presentation changes only.
- `/root/surface_map`: read-only source/test/browser-tooling research; no write boundary.

**Shared contract**: use the existing bilingual copy and product commands. New visual tokens live
in `src/design/tokens.ts` under `botanical`; shared presentation tools live under
`src/components/botanical/`. Root owns that contract and dependencies. Workers must preserve each
other's changes and request boundary handoff before overlapping writes. No more than four agents
run concurrently. Historical validation remains historical; new Android evidence is not assumed.

**Status — completed 2026-09-12**: all writer boundaries released after integration checks and
the bounded browser review. Work is saved on `redesign/tamagui-botanical`; local `main` remains at
the starting commit `16583a3`. Nothing was pushed. Existing lockfile metadata removal remains
outside the redesign commits. Temporary read-only browser tooling and captures remain under
ignored `output/botanical-review/`. See the
[redesign evidence](../../specs/003-family-growth-garden/checklists/tamagui-botanical-evidence.md) for
checks, review scope and outstanding physical Android/human acceptance.

## 2026-09-11 Remote Main Reconciliation and Publication Window

**Integration owner and only writer**: `/root`.

**Reserved boundary**: the active Git merge of local `main` with `origin/main`, including conflict
resolution across root product/evidence documents, `app.config.ts`, `app/_layout.tsx`, the shared
journey/onboarding/store files, restored Spec Kit and repository collaboration files, and focused
integration tests. The completed README showcase and its three screenshots remain unchanged.

**Scope**: Preserve both published histories without force-push or rewrite; retain local Family
Plus, family connection, ambient-audio, family replacement, profile-personalization, Parent Tasks,
README, and repository-cleanup work while incorporating the remote recognition, reveal, learning,
remembered-access, voice-lifecycle, Android-readiness, evidence, and intentionally restored public
collaboration tooling. Validate the merged tree before pushing `main`.

**Exclusion**: `docs/submissions/smac-2026/**` remains an untracked, separately reserved package
whose own record says generation and final validation are pending. It is not part of this merge or
publication.

**Status**: Complete and released for the authorized merge commit and push. Both histories are
preserved without force-push or rewrite. The merge keeps the local app-wide ambient-audio and
family/profile/README work, incorporates the remote recognition/reveal/learning/access/voice and
Android improvements, retains the optimized recycling WebP and wrapping header actions, and
preserves the remote's intentionally restored public collaboration inventory. TypeScript,
zero-warning lint, maintained-file formatting, 7 focused files / 201 tests, Android readiness 2
files / 8 tests, the full 136-file / 1,654-test suite, 39-route web export, Android JavaScript
export with one Hermes bundle / 96 assets, Git whitespace, and conflict-marker checks passed.
The merge also preserves every remote-tracked constitution/specification/design/evidence file,
adds the 64 completed Feature 006–013 Spec Kit files and the required-profile checklist, and keeps
local generated capture, raw-design, image-prompt, duplicate-logo-pack, and unfinished submission
artifacts outside the public tree through narrow ignore rules. Physical Android and named-human
gates were not run. The separately active submission package remains excluded and unchanged.

## 2026-09-11 Public AI and Agent Tooling Restoration Window

**Integration owner and only writer**: `/root`.

**Reserved boundary**: `.gitignore`, `CONTRIBUTING.md`, `docs/README.md`,
`docs/design/brand/GHAF_OFFICIAL_LOGO_MIGRATION.md`,
`specs/004-005-implementation-audit.md`, and the exact 219 assistant/tooling files
removed from tracking by `80212bf`, including this ownership log.

**Scope**: The user requests public contributor access again. Restore the prior
ignore rules and documentation, re-track the preserved local tooling, and push a
new commit on `main`. Preserve this local ownership history and all application
source. A private companion repository is deferred. `/root/audit_spec005` reviews
the restoration read-only and owns no files.

**Handoff**: Verify the exact restored inventory and historical blob identities,
unchanged runtime source, documentation formatting, and remote `main` after push.

**Status**: Complete and released for the authorized commit and push. All 219 files
are restored; 218 have identical historical content and this ownership log preserves
the later work records. Every executable mode matches `eb959ea`. The full staged tree
matches that pre-ignore revision except this log. Independent review, exact inventory
checks, six existing local-file exclusion checks, `npm run format:check`, and Git
whitespace checks passed. Runtime code is unchanged, so behavioral/native tests were
not rerun. This restoration supersedes the local-only policy below; the tooling is
versioned publicly again when the new commit reaches `origin/main`.

## 2026-09-11 Local AI and Agent Tooling Window

**Integration owner and only writer**: `/root`.

**Reserved boundary**: `.gitignore`, `TEAM_OWNERSHIP.md`, `CONTRIBUTING.md`,
`docs/README.md`, `docs/design/brand/GHAF_OFFICIAL_LOGO_MIGRATION.md`, and
`specs/004-005-implementation-audit.md`. Git index removals cover only assistant
configuration, skills, Spec Kit automation, critiques, instruction files, ownership
logs, and execution prompts selected by the new ignore rules. Preserve every local
copy and keep `.specify/memory/constitution.md` tracked as shared product governance.

**Scope**: User-requested local-only development tooling on `main`; retain application
AI source, tests, approved specifications, assets, and provenance. The inventory
reviewer `/root/audit_spec005` is read-only and holds no write boundary.

**Handoff**: Verify ignore coverage, tracked product files, unchanged local tooling
contents, documentation formatting, and the staged change boundary; then commit.

**Status**: Complete and released. Exactly 219 assistant/tooling files were removed
from the Git index. Each local copy remained present with identical SHA-256 across
the untracking operation. All 546 product/source/test/spec/config paths were preserved;
the execution prompt is the sole local-only spec-directory file. The staged boundary
contains only those index removals plus `.gitignore` and four documentation updates.
Independent review, 18 positive/13 negative ignore examples, full `npm run format:check`,
scoped historical-document formatting, and Git whitespace checks passed. No runtime
source changed, so behavioral/native tests were not rerun. This ownership entry is
itself local-only; historical Git content remains available. Ready for the local commit
on `main`; this request does not include a new push or release activation.

## 2026-09-11 Main Branch Integration Window

**Integration owner and writer**: `/root`.

**Reserved boundary**: Git merge of `integration/r3-complete-screens-20260905` into local
`main`, including conflict resolutions in `app/**`, `src/**`, `tests/**`,
`specs/003-family-growth-garden/**`, root product/design/runbook/ownership documents,
`package.json`, `package-lock.json`, and `app.config.ts`. Preserve main's existing prepared
WebP, provenance, and five historical screenshots. New reconciliation evidence is limited to
`docs/merge-notes/main-r3-20260911*`. Other agents perform read-only branch comparisons.

**Test writer**: `/root/voice_regression_tests` exclusively owns
`tests/android-runtime-readiness.test.ts` during merge reconciliation. Root owns all other files.
The worker has released the file after five reconciled readiness tests passed.

**Scope**: User-authorized local merge and continued work on `main`. Keep the current approved
access, RTL, progression, audio, and default-off AI architecture; carry forward compatible
Android settings, prepared-image optimization, and narrow-width header layout. Preserve the
older main history/evidence without reconnecting its superseded role-toggle controller.

**Status**: Complete and released. The 29 conflicts were reconciled using the approved current
runtime, with compatible main improvements and historical evidence preserved as documented in
`docs/merge-notes/main-r3-20260911.md`. All agents released their files. The merged checkout
passed typecheck, zero-warning lint, formatting, 125 files / 1,552 tests, 39-route web export,
and Android JavaScript export with one Hermes bundle / 94 assets. The strengthened inherited
asset test separately passed 3/3 cases. Git whitespace and conflict checks passed.

The online Expo dependency check recommends newer patches for 13 packages; the tested lockfile
is unchanged. The offline installed-SDK check passes with its reliability warning, not as an
online compatibility claim. Physical Android and named reviews remain unperformed. Local `main`
is the working branch for subsequent work; no push or release activation occurred.

## 2026-09-11 Specs 004 and 005 Verification and Voice Lifecycle Window

**Integration owner and only writer**: `/root`

**Reserved boundaries**: `TEAM_OWNERSHIP.md`, `specs/004-005-execution-prompt.md`,
`specs/004-005-implementation-audit.md`, `src/state/usePrototypeStore.ts` (Feature 004 voice
lifecycle only), `src/services/native/ExpoVoiceCaptureService.ts` (recorder lifecycle only),
`src/features/assistants/parentTaskDrafting.ts`, and
`tests/parent-task-drafting-authority.test.ts`. Root also reserves `docs/DEVELOPMENT.md`
for the existing formatting-only validation failure.

**Test writer**: `/root/voice_regression_tests` owned only `tests/live-voice-services.test.ts`
and `tests/live-voice-integration.test.tsx`. Both files are released after 25 added cases,
including initial and follow-up RED evidence. Root implemented all runtime corrections.

**Scope**: Execute the sub-agent's implementation-audit prompt, verify both completed spec task
lists against source, preserve authoritative permitted-help wording in Parent drafting,
reproduce and repair voice cancellation races with synthetic adapters,
and record current regression evidence. Three read-only agents audit each feature and prepare
the execution prompt; they own no files. Preserve unrelated work, default-off AI/MCP flags,
the blocked token provider, and existing release/native/human evidence gates.

**Status**: Complete and released. `eb3b7a4` preserves reviewed Parent task help authority;
`b0fd9b3` repairs recorder startup/cancellation, stale file work, matching voice-origin Coach
invalidation, and cache deletion after recorder failure. The final regression passed 123 files /
1,544 tests; typecheck, zero-warning lint, maintained-source formatting, scoped formatting, and
Git whitespace passed. All 34 Feature 005 cases pass; no Feature 005 runtime change was needed.
The original comment-style test timeout passed on recheck and in the final full run; the existing
development-guide formatting failure was only a leading blank line and was corrected.

The execution prompt and audit are saved under `specs/004-005-*.md`. Every agent released its
boundary. Source is ready for integration; no deployment, provider call, real recording, release
activation, push, or merge occurred. Native and named-human acceptance gates remain unchanged.

## 2026-09-10 Completion and Correctness Audit Window

**Integration owner**: `/root`

**Reserved boundaries**:

- `/root`: this new ownership entry only, `specs/003-family-growth-garden/tasks.md`,
  `specs/005-remembered-device-access/tasks.md`,
  `specs/004-bounded-live-ai/approval-packet.md`,
  `specs/003-family-growth-garden/design-intake/r002b-release-review-packet.md`,
  `src/components/onboarding/{useOnboardingNarrator.ts,useOnboardingAmbience.ts,FirstRunOnboarding.tsx}`,
  `src/features/onboarding/playback.ts`,
  and `tests/{onboarding-audio-lifecycle,r003-first-run-experience,official-brand-platform}.test.ts`.
- Access fix worker: `src/state/usePrototypeStore.ts` returning-Child credential action only and
  `tests/device-remembered-access.test.tsx`.
- Growth fix worker: `app/garden/impact-path.tsx`, `app/garden/badges/[badgeId].tsx`,
  `app/garden/learn/[learningId]/{story.tsx,accessible.tsx}`,
  `tests/r002b-learning-store.test.ts`, and `tests/r002b-learning-route-integration.test.ts`.
  `src/state/usePrototypeStore.ts` transfers to this worker only after the access writer releases
  it; the Growth edit is restricted to `startMangroveLearning`.

**Scope**: Reconcile unfinished authorized work against current evidence, fix reproduced local
access, learning-resume, and onboarding-audio defects, and run proportional regression checks.
Keep Growth and optional AI flags default off. Preserve the pre-existing PDF ownership entries,
untracked PDF and Reveal artifacts, and historical evidence. No production services, deployment,
push, merge, or release activation is authorized by this window.

**Status**: Complete and released. Local commits `b2202e2`, `1278f98`, and `8ba6f75` repair
onboarding playback cleanup, returning Child retry after storage failure, and learning resume/Back.
`a6db1c2` separates the platform-raster cases after the combined batch exceeded its timeout;
the final common case type bounds compiler inference without changing any assertion.
The full regression passed 123 files / 1,519 tests. Typecheck, zero-warning lint, maintained-source
formatting, scoped checks, the 39-route web export, local Expo SDK compatibility, and Git
whitespace passed. The export retains the known file-system web and color-environment warnings.

T138/T139 now cite current-checkout validation; the Reveal packet cites its existing `7d6a6da`
evidence; and the AI packet distinguishes its proposal snapshot from completed local implementation.
CUA exposed no browser and rejected the in-app browser request. Physical Android and named review
remain unverified, and every Growth/optional AI flag remains default off. The original two PDF
ownership entries and untracked PDF/Reveal artifacts remain outside these commits. All workers
released their boundaries. The source is ready for integration; no release, push, or deployment
was performed.

## 2026-09-08 Competition Brief Verification-Section Removal Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `output/pdf/ghaf-competition-brief.tex`, and
`output/pdf/ghaf-competition-brief.pdf` only.

**Scope**: Remove the "Details to Verify Before Submission" divider, heading, and five points;
recompile and visually verify the existing two-page PDF. Preserve all other document content and
the user-owned untracked Reveal evidence.

**Status**: Complete and released. Removed the divider, heading, and all five verification points
from the LaTeX source and regenerated the stable PDF. Bundled Tectonic compilation PASSED without
LaTeX layout warnings. PDF inspection confirmed exactly two A4 pages and 1,047 extracted words;
text extraction confirmed the removed content is absent, and visual inspection of both rendered
pages found no clipping, overlap, unreadable glyphs, or broken page furniture. No other document
content or application files changed.

## 2026-09-08 Competition Brief LaTeX Artifact Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md` and new `output/pdf/**` only. Existing application
source, project contracts, product assets, and browser/Android evidence remain read-only.

**Scope**: Produce one competition-ready, exactly two-page English app idea and functionality
brief in LaTeX, compile it to PDF, and include local Ghaf product imagery. Ground every maturity,
technical, AI, safety, privacy, and impact statement in the current repository. Preserve the
user-owned untracked Reveal evidence and make no product, runtime, dependency, feature-flag,
deployment, release, push, merge, or history change.

**Status**: Complete and released. Delivered `output/pdf/ghaf-competition-brief.tex` and the
compiled `output/pdf/ghaf-competition-brief.pdf` with five local product images. Bundled Tectonic
compilation PASSED with no LaTeX layout warnings; PDF inspection confirmed exactly two A4 pages,
1,085 extracted words, all ten required sections, five verification points, and readable unclipped
content on both rendered pages. `npm run typecheck` PASSED. The parallel `npm test` run passed
1,484 tests while two test files timed out under load; the focused serial rerun of those files
PASSED 12/12. `git diff --check` PASSED. No application source, dependency, flag, deployment,
release, or existing Reveal evidence was changed.

## 2026-09-08 Feature 005 Post-Merge Audit and Context Repair Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `.specify/feature.json`, the Spec Kit-managed block in
`AGENTS.md` through the configured agent-context hook only, `src/state/usePrototypeStore.ts`,
`src/features/access/{childAccess.ts,rememberedDeviceAccess.ts}`, and
`tests/device-remembered-access.test.tsx`, and `specs/005-remembered-device-access/tasks.md`.

**Scope**: Audit the newly merged Feature 005 remembered-device-access specification against its
runtime and focused regressions; repair stale active-feature metadata; and close audited
Child-pairing persistence, revocation, temporary-handoff, stale-affinity, and remembered-locale
failures without weakening Parent/Child authority or changing the approved happy path. Preserve
the user-owned untracked Reveal evidence and all unrelated worktree content.

**Status**: Complete and released — upstream was merged without rewriting history at `64fc34b`;
the local Spec Kit pointer now selects Feature 005 and the configured hook confirms the managed
`AGENTS.md` plan path. The audit made Child pairing persistence transactional, fails closed on
stale or missing handoff affinity, reconciles durable revocation even when controller revocation
fails, clears stale affinity before opt-out family entry, and restores the remembered family's
language. The focused Feature 005 suite passed 33 tests, ten surrounding access/reset files passed
184 tests, and `npm run verify` passed typecheck, zero-warning lint, maintained-source formatting,
122 files / 1,486 tests, Expo dependency alignment, and a 39-route static web export with the known
`expo-file-system` web warning. Git whitespace validation passed. Physical Android process-death,
SQLite, Back, TalkBack, font-scale, and named human reviews remain `NOT RUN`; the untracked Reveal
evidence remained outside this window. The reservation is released.

## 2026-09-07 WSL/Windows Android Command Correction Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md` and `docs/DEVELOPMENT.md` only.

**Scope**: Make the physical-device guide explicit for the current workstation, where the source
terminal is WSL but Android Studio, the Android SDK, ADB, and the USB tablet are Windows-owned.
Document the exact Windows-native build invocation and the WSL Metro/Windows ADB daily loop without
changing application code, dependencies, native configuration, or product behavior.

**Status**: Complete and released — the guide now explains the exact missing-Linux-SDK/no-device
failure mode, prohibits pointing Linux tooling at the Windows SDK, provides the Windows-native
build command from a WSL session, and provides a Windows-ADB/WSL-Metro daily loop. The Windows SDK,
JDK, connected `SM_T835`, direct Windows ADB invocation from WSL, USB reverse, Metro listener, and
clean Windows native checkout were verified. Targeted Prettier and Git whitespace checks passed.
No app code, dependencies, native configuration, or broader Android evidence changed; all protected
local configuration, design inputs, generated output, and other worktree files remained outside
this window.

## 2026-09-07 Physical Android Verification Correction Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md` and `docs/DEVELOPMENT.md` only.

**Scope**: Record the device-selector behavior observed while building and launching the current
debug app on the connected Samsung tablet. Keep ADB serial targeting separate from Expo CLI device
name targeting, without changing application code, dependencies, native configuration, or product
behavior.

**Status**: Complete and released — Windows ADB identified the connected `SM_T835` by serial, USB
reverse for Metro was active, the Expo CLI selected the tablet by model name, and the native debug
build installed and rendered the Arabic RTL onboarding screen on Android 10 / API 29. The Gradle
build passed, Metro served the Android bundle, the package was debuggable and resumed, and scoped
runtime logs contained no React Native or Android runtime errors; deprecation warnings from React
Native core remain non-blocking. Targeted Prettier and Git whitespace checks passed. This evidence
verifies the physical connection/build/render path only and does not promote the other Android
human-review gates. All protected local configuration, design inputs, generated output, and other
worktree files remained outside this window.

## 2026-09-07 Source Publication Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md` and
`specs/004-bounded-live-ai/checklists/requirements.md` only.

**Scope**: Reconcile the final branch-range whitespace audit, verify the exact current revision,
and publish `integration/r3-complete-screens-20260905` to its existing upstream without rewriting
history. Preserve the explicitly protected `.codex/config.toml`, original logo/Stitch inputs, and
untracked generated visual/build output locally and outside every commit.

**Status**: Complete and ready for publication — the two branch-range Markdown whitespace findings
were corrected. `npm run verify` passed typecheck, zero-warning lint, maintained-source formatting,
119 test files / 1,310 tests, Expo dependency alignment, and a 39-route static web export with the
known `expo-file-system` web warning. Targeted Markdown formatting, working-tree whitespace, tracked
secret-pattern, and added-blob size checks passed; no added blob exceeds 5 MiB. The fetched upstream
was zero commits ahead of this branch. The protected local configuration, original design inputs,
and generated output remain unstaged and uncommitted. The reservation is released; publication is
authorized by the product owner's explicit push request.

## 2026-09-07 Android USB Development Guide Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md` and `docs/DEVELOPMENT.md` only.

**Scope**: Correct the local physical-device instructions for the repository's installed Expo CLI.
Document Android Studio setup, USB/ADB verification on Windows and Linux/macOS, the first native
build/install, the daily Metro-only loop, rebuild triggers, multiple-device targeting, and bounded
troubleshooting without changing application code, dependencies, product behavior, or existing
Android evidence.

**Status**: Complete and released — `docs/DEVELOPMENT.md` now distinguishes the first Expo native
build from the Metro-only daily loop, documents Android Studio and cross-platform USB/ADB setup,
and records the WSL2 USB ownership split with official `usbipd-win` commands. The installed Expo
CLI help, ADB availability, targeted Prettier, and Git whitespace checks passed. No physical device
was attached to this WSL2 environment, so no build, installation, or Android evidence status was
claimed or changed. No application code, dependency, provider, feature flag, generated native
project, or other session's worktree files were modified by this window; the reservation is
released.

## 2026-09-07 Feature 005 Remembered Device Access Window

**Owner and only writer**: `/root`

**Planning reservation**: `TEAM_OWNERSHIP.md`, `.specify/feature.json`, the Spec Kit-managed block
in `AGENTS.md` through the configured agent-context hook, and
`specs/005-remembered-device-access/**`.

**Runtime reservation**: `src/models/deviceAccess.ts`,
`src/features/access/{childAccess.ts,parentOnboarding/controller.ts,rememberedDeviceAccess.ts}`,
`src/services/{index.ts,local/index.ts,local/deviceAccessRepository.ts}`,
`src/state/usePrototypeStore.ts`, `src/components/access/{index.ts,RememberDeviceChoice.tsx}`,
`app/access/parent/{sign-in.tsx,verification.tsx}`, `app/child/{index.ts,settings.tsx,task.tsx}`,
`app/{garden.tsx,circle.tsx}`,
`src/i18n/resources.ts`,
`tests/{device-remembered-access.test.tsx,r003-screen-flow.test.ts,`
`r002a-garden-presentation.test.ts}`, and the narrowly scoped truthful-boundary updates in
`PRODUCT.md`, `PROTOTYPE_LIMITATIONS.md`, and `DEMO_RUNBOOK.md`.

**Scope**: Add an explicit Parent remember-this-device choice and automatic device-local Child
return after approved pairing. One app installation remembers at most one primary role/profile.
An active Parent must explicitly sign out before Child access on the same installation. A Child
may start temporary Parent access without unpairing; Parent sign-out then restores the same paired
Child. Persist only a validated local device-affinity marker, never a verification code, password,
session token, task, reward, media, or private assistant content. Preserve deterministic offline
reset and label the behavior as synthetic prototype continuity, not production authentication,
secure device trust, account sync, or multi-device account infrastructure.

**Status**: Complete and ready for source integration — commits `3274cab`, `4a2bdbb`, `fa8e6ca`,
and `55ab2a1` contain the specification, strict affinity storage, fresh authority restoration, and
bilingual handoff presentation; the closing evidence/test adjustment is recorded with this
window. Focused access coverage passed 65 tests, the Impeccable UI detector returned `[]`, and the
final typecheck, zero-warning lint, format check, Git whitespace, scoped credential/session
inspection, and full 119-file / 1,310-test regression passed. Physical Android process-death,
SQLite, Back, TalkBack, font-scale, and named Arabic/UAE, privacy, safeguarding, accessibility,
and visual reviews remain `BLOCKED / NOT RUN`. Production accounts, trusted-device security, and
real separate-device state sync remain out of P0. The prior AI Services presentation worktree
edits remain protected and are not part of this completed window.

## 2026-09-07 AI Services 1–3 Presentation Integration Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `specs/004-bounded-live-ai/tasks.md`,
`src/components/AssistantIdentity.tsx`, `src/components/access/AIProfilePreview.tsx`,
`src/components/family-growth/{ParentTaskComposer.tsx,ParentPatternSummary.tsx}`,
`app/child/task.tsx`, `src/i18n/resources.ts`, and
`tests/ai-services-presentation-integration.test.tsx` only.

**Scope**: Integrate the already implemented AI Services 1–3 into one coherent Parent/Child
presentation hierarchy. Clarify prepared/live origin before each action, separate prepared profile
support style from recommended starting categories, preserve Parent ownership in Task Builder,
make the task-bound Child Coach easier to scan, and structure the Parent summary around observable
facts and one next question. Preserve all Feature 004 flags, grants, provider boundaries, state,
service contracts, progression authority, and default-off behavior unchanged.

**Status**: Complete and released — commit `d56b896` adds the shared assistant identity/origin
pattern and integrates the prepared profile helper, Parent Guide, prepared Child Coach, and Parent
summary without changing Feature 004 flags, grants, store authority, providers, or gateway code.
The new contract first failed all six intended hierarchy tests, then passed. Ten focused files /
81 tests and the full 119-file / 1,310-test suite passed with typecheck, zero-warning lint,
formatting, Git whitespace, and Expo dependency checks. Fresh web export produced 39 routes;
Android JavaScript export produced one Hermes bundle and 94 assets. The Impeccable mechanical scan
returned zero findings. Real-browser Arabic/English screenshot inspection is `BLOCKED`: Chromium
could not start because this container lacks `libnss3`, and Playwright's dependency installer
requires an unavailable sudo password. Physical Android and named human accessibility/Arabic
review remain `NOT RUN`; source/export evidence does not substitute for them. User-owned worktree
artifacts were preserved.

## 2026-09-07 Feature 004 Minimal MCP Adapter Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `package.json`, `package-lock.json`,
`specs/004-bounded-live-ai/{spec.md,plan.md,research.md,data-model.md,quickstart.md,tasks.md,contracts/bounded-ai-v1.md}`,
`workers/ghaf-ai-gateway/{README.md,src/index.ts,src/mcp.ts,src/operations.ts}`, and
`tests/bounded-ai-mcp.test.ts`.

**Scope**: Add one server-only, default-off MCP projection over the existing bounded Parent task
drafting and Child Coach text operations. The Expo app continues to use provider-neutral HTTPS
services; judges do not connect to MCP. The adapter exposes exactly `draft_parent_task` and
`coach_current_task`, reuses the same strict schemas, handlers, safety checks, authorization,
budgets, and prepared/fake evidence, and adds no voice/media tool, resource, prompt, sampling,
account, persistence, business authority, public discovery, or deployment.

**Activation boundary**: Implementation and synthetic local tests only. MCP is disabled unless a
server-only switch is exactly `true`; no provider call, real Child data, public endpoint, judge
setup, release activation, or production-readiness claim is authorized.

**Status**: Complete and released — commits `1704480`, `44cd73c`, `0b9535c`, `644009c`, and
`e4fb1f3` contain the approved specification, pinned Worker-only SDK, exact two-tool adapter,
shared bounded text operations, final Child text/voice gateway reconciliation, and cross-feature
isolation evidence. The dedicated MCP suite passed 10 tests; the combined gateway suite passed 61
tests; typecheck, lint, formatting, Expo dependency compatibility, Git whitespace, secret-pattern,
export-isolation, and the full 117-file / 1,280-test regression passed. MCP remains exactly default
off, the native app contains no MCP client/setup, judges do not connect, and no provider,
deployment, real Child data/media, activation gate, unrelated file, or user-owned artifact was
changed by this window.

## 2026-09-07 Feature 004 Planning and Implementation Window

**Owner and only writer**: `/root`

**Planning reservation**: `TEAM_OWNERSHIP.md`, `.specify/feature.json`, the Spec Kit-managed block
in `AGENTS.md` through the configured agent-context hook only, and
`specs/004-bounded-live-ai/{plan.md,research.md,data-model.md,quickstart.md,tasks.md,contracts/**}`.

**Runtime reservation**: `package.json`, `package-lock.json`, `.env.example`, `app.config.ts`,
`src/config/aiFeatureFlags.ts`, `src/models/boundedAi.ts`,
`src/features/assistants/{parentTaskDrafting.ts,liveChildCoach.ts,liveVoiceCapture.ts}`,
`src/services/interfaces/index.ts`, `src/services/index.ts`,
`src/services/mock/{index.ts,boundedAi.ts,boundedAiFixtures.ts}`,
`src/services/remote/{index.ts,GatewayParentTaskDraftingService.ts,GatewayChildCoachService.ts,GatewayVoiceTranscriptionService.ts}`,
`src/services/native/{index.ts,ExpoVoiceCaptureService.ts}`, `src/features/access/index.ts`,
`src/state/usePrototypeStore.ts`, `src/components/family-growth/{ParentTaskComposer.tsx,LiveChildCoachPanel.tsx,LiveVoiceCapturePanel.tsx}`,
`app/child/task.tsx`, `app/parent/settings/permissions.tsx`, `src/i18n/resources.ts`, new
`workers/ghaf-ai-gateway/**`, the Feature 004-focused tests named in
`specs/004-bounded-live-ai/tasks.md`, and final truthful evidence edits in `PRODUCT.md`,
`PROTOTYPE_LIMITATIONS.md`, and `DEMO_RUNBOOK.md`.

**Scope**: Plan and implement the approved F4 Parent task drafting, F5 bounded live Child Coach
text, and F5 ages-12–14 push-to-talk voice as three independent default-off slices. Use strict
contracts, TDD, prepared same-attempt fallback, zero AI reward/progression authority, synthetic
inputs/media, and server-side provider boundaries. Preserve the complete Feature 003 journey.

**Activation boundary**: No provider deployment/call, real Child data, live flag activation,
production-security claim, or release approval is included. F5 text/voice activation remains
blocked on the named authentication, provider/ZDR, privacy/legal, safeguarding, Arabic/UAE,
accessibility, incident, physical Android, deletion, and human-evidence gates.

**Status**: Complete and released — commits `9a35ea7`, `38994eb`, `331fbb2`, `92f59b5`,
`cc3d0ea`, `644009c`, `e4fb1f3`, and `c4716c3`, plus the final evidence checkpoint, implement the
approved F4 Parent drafting, F5 bounded Child Coach text, separate implementation-only grants, and
ages-12–14 foreground push-to-talk transcript review. The Feature 004 focused suite passed 24
files / 164 tests; the full repository passed 117 files / 1,280 tests with typecheck, zero-warning
lint, formatting, Expo dependency/public-config checks, web and Android JavaScript exports, Git
whitespace, public-bundle isolation, and scoped secret checks. All app flags remain false, current
P0 profiles retain prepared voice, and the deterministic journey/reset remain complete. No
provider call, Worker/MCP deployment, real Child data/audio, production credential, release
activation, push, merge, unrelated file, or user-owned artifact was included. Trusted auth/shared
stores, provider/ZDR, privacy/legal, safeguarding, Arabic/UAE, accessibility, incident/deletion,
physical Android, and named human-rehearsal gates remain `BLOCKED / NOT RUN`.

## 2026-09-07 AI Features 4–5 All-Three Approval Recording Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md` and
`specs/004-bounded-live-ai/{spec.md,approval-packet.md,checklists/requirements.md}` only.

**Scope**: Record the product owner's explicit "all three" implementation authorization for F4
Parent task drafting, F5 bounded live Child Coach text, and F5 real push-to-talk voice. Approval
authorizes independently flagged, default-off implementation and synthetic/fake-provider testing;
it does not activate a provider, permit real Child data in tests, deploy a gateway, or approve
release. Amend the voice contract with exact age, capture, transcript review, delete-before-send,
data, consent, fallback, native-evidence, and no-background/no-biometric boundaries. Preserve
Feature 003 as the active deterministic fallback and do not modify runtime files in this window.

**Handoff condition**: The proposal and checklist unambiguously distinguish implementation
approval from activation gates, contain no obsolete "voice unapproved" wording, and pass targeted
formatting and whitespace checks. Planning/runtime ownership must be reserved separately.

**Completion — 2026-09-07**: `/root` recorded the product owner's explicit **all three** decision
as default-off implementation authorization for F4, F5-TEXT, and F5-VOICE. The amended contract
limits voice to separately granted ages 12–14, one visible held recording, transcript review,
delete-before-send, explicit text-only Coach submission, ephemeral audio deletion, and no
background/continuous capture or biometric/speaker/emotion/personality/truthfulness inference.
Release activation, deployment, real provider execution, and real Child data remain blocked on
the recorded token-broker, provider/ZDR, privacy/legal, safeguarding, Arabic/UAE, accessibility,
incident, physical Android, deletion, and human-rehearsal gates. Targeted formatting, whitespace,
approval-consistency, six-threat, and no-placeholder checks passed. No runtime file, active Feature
003 artifact, feature metadata, provider, deployment, branch/ref, or user-owned artifact changed;
the reservation is released and planning/runtime ownership must be reserved separately.

## 2026-09-07 AI Features 4–5 Phase 1 Proposal Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md` and new
`specs/004-bounded-live-ai/**` proposal artifacts only.

**Scope**: Perform read-only archaeology of the historical Feature 002 AI gateway and the current
Feature 003 task, assistant, access, privacy, registry, state, localization, and test boundaries;
then author a proposed, non-authorizing specification and approval packet for independently gated
Parent task drafting, live Child Coach text, and later Child voice. No runtime implementation,
feature activation, provider request, deployment, active Feature 003 artifact change, or Feature
002 historical change is authorized in this window.

**Handoff condition**: The proposal records product exclusions, age-band and data allowlists,
consent/privacy controls, architecture and state sequences, threat model, evidence gates, test
matrix, dependency-ordered implementation stages, and exact approval decisions. Runtime work stays
blocked until explicit product approval; Child release activation additionally stays blocked on
trusted authentication, legal/privacy/safeguarding review, provider retention evidence, and native
device evidence.

**Status**: Complete and released. The Phase 1 proposal package passed targeted formatting and
whitespace checks. No runtime file, active Feature 003 artifact, feature metadata, provider,
branch/ref, deployment, or user-owned artifact was changed; implementation and activation remain
blocked on the explicit approval checkpoint.

## 2026-09-07 AI Services 1–3 Integration Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `PROTOTYPE_LIMITATIONS.md`,
`DEMO_RUNBOOK.md`, `.env.example`, `specs/003-family-growth-garden/{spec.md,plan.md,tasks.md}`,
new `docs/CODEX_HANDOFF_AI_FEATURES_4_5.md`,
`src/features/assistants/{liveParentGuide.ts,profilePersonalization.ts}`,
`src/features/tasks/validation.ts`, `src/models/familyGrowth.ts`,
`src/services/{index.ts,interfaces/index.ts,mock/index.ts,remote/**}`,
`src/state/usePrototypeStore.ts`, `src/components/family-growth/ParentTaskComposer.tsx`,
`src/i18n/resources.ts`, new `workers/ghaf-parent-guide/**`, and focused AI/profile/Parent-task
tests only.

**Scope**: Consolidate the currently implemented deterministic Parent Guide, Child Coach, Parent
summary, age adaptation, synthetic voice, prepared media, and profile helper as the mandatory
offline path; add one authenticated and rate-limited server-side live Parent Guide transformation
for the exact synthetic P0 recycling request behind an injectable default-off service boundary;
and use the prepared profile helper to rank and visibly identify allowlisted Task Builder
categories without assigning a task or changing the sole executable P0 task. Provider activation,
deployment, live evidence, production authentication, and every live Child Coach or real media path
remain blocked. The parallel Features 4/5 handoff owns no runtime file in this window.

**Handoff condition**: Contract changes land before behavior; focused RED/GREEN evidence covers
strict schemas, secret isolation, authentication, rate limiting, timeout/error/safety fallback,
prepared-default behavior, recommendation ordering, opt-out, and Parent authority; full repository
checks pass; direct live-provider, deployment, Android, and named-human evidence remains honestly
`NOT RUN` or `BLOCKED`.

**Status**: Complete and released. AI Services 1–3 passed the recorded automated/source/export
checks without activation. The Features 4/5 document is a non-authorizing prompt for a separate
spec-first session; it owns no runtime boundary after this handoff.

**Work period:** Feature 003 planning and implementation beginning 2026-08-26
**Team size:** Three members
**Integration owner:** Member 1 — Mobile and visual experience

Replace `Member 1`, `Member 2`, and `Member 3` with names only when the team chooses to do so.

## 2026-09-07 Reveal Browser-Evidence Window

**Owner and only writer**: `/root`

**Branch**: `integration/r3-complete-screens-20260905` at reviewed baseline `092cdd9`.

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/tasks.md`,
`specs/003-family-growth-garden/design-intake/r002b-validation-evidence.md`,
`docs/design/stitch/releases/ghaf-r002b/SCREEN_INDEX.md`, and
`output/playwright/r003-reveal-evidence/`, `app/child/index.tsx`,
`app/child/reveal/[bundleId].tsx`,
`src/components/r002b/RevealBundleScreen.tsx`, `src/components/r002b/R002bNestedScreen.tsx`,
`src/utils/accessibilityFocus.ts`, and focused
`tests/{accessibility-focus,r002b-nested-screen-hardening,r002b-reveal-route-integration,r002b-reveal-screen-components}.test.*`
only. Other runtime and test files remain read-only unless this reservation is amended again.

**Scope**: Complete the host-verifiable portion of T208 by locally enabling only
`r002b_reveal_bundle_v2`, traversing the normal Parent/Child approval journey without state
injection, and recording Arabic RTL and English LTR 390x844 browser-proxy evidence, including a
reduced-motion static result, focus/Back/archive restoration, overflow, console, network, and
default-off fallback observations. Keep every source default off and do not claim physical
Android, TalkBack, OS font scaling, named-human review, or release activation evidence. The live
English pass exposed that Reveal initial focus remains on the web document body; repair that
reproducible focus defect through the smallest shared adapter or Reveal integration change and add
focused regression coverage before completing the captures. The same pass also exposed an
unsupported web BackHandler subscription and a body-focus return after Reveal archive; keep their
repairs inside this Reveal/navigation boundary and verify the stable Today return region.

**Status**: Closed. Runtime/test repairs are committed at `7d6a6da`. A fresh normal journey with
only the Reveal flag locally enabled retained four untracked Arabic/English 390×844 captures,
verified 12 ordered consequences, interruption recovery, zero horizontal overflow, zero console
errors, no non-static request, and final Today focus restoration. Typecheck, lint, formatting, 89
files / 1,225 tests, Expo dependency/public-config checks, and fresh web/Android JavaScript exports
passed. T208 is complete only at this bounded host-evidence level; T218/T245, physical Android,
TalkBack, native Back/IME/font scale, named-human review, and release activation remain open.

## 2026-09-07 Welcome Hero Regeneration Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`,
`assets/images/illustrations/r003/{ASSET_MANIFEST.json,PROVENANCE.md}`, and
`assets/images/illustrations/r003/final/welcome-ghaf-habitat.jpg` only.

**Scope**: Regenerate only the existing 3:2 Welcome hero as an eye-catching wide-angle Quiet UAE
Botanical Editorial scene that better communicates family support, small daily actions, permanent
growth, and UAE nature. Preserve the existing artwork ID, route, crop behavior, official brand,
access controls, product state, and all protected user work. The image remains opaque, local,
nondirectional, decorative, and free of people, text, logos, UI, unsafe objects, and measured-impact
claims. No route, dependency, remote runtime asset, product behavior, push, merge, deployment, or
release activation is authorized.

**Completion — 2026-09-07**: `/root` regenerated the existing Welcome hero through the built-in
OpenAI image generator, retained its 3:2 source and 1200×800 shipping dimensions, embedded the exact
prompt, and updated its local manifest/provenance without changing the runtime artwork ID or screen.
The full-frame source and the current wide mobile center crop were inspected; both retain the mature
Ghaf, three younger growth stages, seed-pod/leaf trail, and distant UAE landscape without people,
text, UI, brand marks, unsafe objects, or impact claims. The focused artwork contract passed 4/4,
all 48 shipping rasters retained embedded prompts, formatting and Git whitespace passed, and the
Impeccable detector returned no findings. Physical Android rendering and named botanical,
Arabic/UAE, safeguarding, accessibility, and image-rights reviews remain `NOT RUN`. The reservation
is released at this local checkpoint; no push, merge, deployment, or release activation occurred.

## 2026-09-07 Onboarding Image Perimeter Progress Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`DESIGN_DIRECTION.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md}`, the existing
`specs/003-family-growth-garden/design-intake/r003-first-run-experience.md`,
`src/components/onboarding/FirstRunOnboarding.tsx`, and
`tests/r003-first-run-experience.test.ts` only.

**Scope**: Remove the detached solid strip from the bottom of every onboarding photograph and
replace it with a quiet, image-integrated rounded perimeter progress stroke. The stroke begins as
a short mark at the bottom center, grows symmetrically in both directions only when explicit
Back/Next/pillar navigation changes the moment, and closes around the full 3:2 image on the sixth
moment. Retain the simple lower current/total plus dot row requested in the preceding correction as
the primary semantic indicator. Reduced motion shows each step's correct static perimeter state.
Preserve the existing photographs, crop, speaker, narration, ambience, reducer, routes, startup,
access, privacy, reward, reset, and default-off feature behavior. No image, dependency, timer,
autoplay navigation, gesture, product authority, push, merge, deployment, or release activation is
authorized.

**Completion — 2026-09-07**: `/root` removed `heroAccent` and integrated one inset SVG edge track
with two date-gold progress branches that originate together at the image's bottom center. The
first moment shows a short centered stroke, explicit navigation reveals the rounded bottom corners,
sides, and top edges in order, Back reverses the same value, and the sixth moment closes the frame.
The existing lower current/total plus dots retain the sole progressbar semantics; the edge stroke
is noninteractive and hidden from assistive technology. Reanimated changes only the normalized
dash length over the existing 220 ms UI-thread timing, while reduced motion applies the target
directly. RED recorded one expected failure / 12 passes for the source contract and for each of two
visual-correction guards; the final focused file passed 13 tests and the full suite passed 90 files
/ 1,090 tests. Typecheck, zero-warning lint, formatting, Expo dependency/public-config checks,
Git whitespace, Impeccable detection, web export (134 files), and Android JavaScript export (103
files) passed. Firefox covered Arabic 390×844, English 320×720, first/intermediate/final extents,
reduced motion, exact 3:2 layout, zero horizontal overflow, and zero console errors or warnings.
Physical Android motion/TalkBack rendering and named-human review remain `BLOCKED / NOT RUN`. The
reservation is released at this local checkpoint; no push, merge, deployment, or release
activation was performed.

## 2026-09-07 Returning Parent Identifier Lookup Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md,quickstart.md,data-model.md}`,
`specs/003-family-growth-garden/design-intake/r003-local-family-release-review.md`,
`docs/architecture/{ARCHITECTURE.md,adr/0002-device-local-family-directory.md}`,
`app/access/parent/{sign-in,sign-up,verification}.tsx`,
`src/models/{localFamily,parentOnboarding}.ts`,
`src/features/access/parentOnboarding/{controller,policy}.ts`,
`src/features/local-family/schema.ts`, `src/services/local/{index,repository}.ts`,
`src/services/index.ts`, `src/state/usePrototypeStore.ts`, `src/i18n/resources.ts`, and focused
Parent access/local-family/localization/route tests only.

**Scope**: Persist the normalized synthetic Parent phone/email identifier with the single
device-local family directory, migrate the previous schema-1 fixture to the canonical prepared
Parent identifier, and require an exact normalized local-record match before returning sign-in may
request the existing deterministic code. An unknown identifier stays on sign-in and cannot enter
first-family setup; only explicit sign-up may create a family. A verified matching returning Parent
must enter Parent Home (or the established pending-pairing destination) without Family Basics,
Child setup, review, or success. Remove the simulated biometric shortcut and user-facing
demo/synthetic/not-real wording from Parent sign-in, sign-up, and verification while making no
claim that a message was sent or identity was remotely proven. Documentation and test evidence
retain the truthful local-prototype boundary. Preserve the one-household limit, reset, role
separation, offline deterministic code, routes, default-off flags, and protected user work. No
production authentication, account service, network, real OTP, credential persistence, dependency,
push, merge, deployment, or release activation is authorized.

**Completion — 2026-09-07**: `/root` added a strict schema-2 normalized Parent identifier/kind,
bounded schema-1 canonical migration, separate explicit-sign-up and returning-sign-in commands,
and fail-closed `NOT_FOUND` matching before deterministic code entry. Matching returning Parents
reuse the receipt and enter Parent Home or the pending-pairing destination; verification without
the create-family marker cannot fall into setup. The fake biometric path and Parent auth
demo/not-real footers were removed, and bilingual copy makes no send/remote-verification claim.
RED recorded 15 expected failures / 40 passes; focused tests passed 6 files / 84 tests and the full
suite passed 90 files / 1,090 tests. Typecheck, zero-warning lint, formatting, Expo dependency and
public-config checks, Git whitespace, web export (134 files / 39 routes), and Android JavaScript
export (103 files) passed. Firefox covered Arabic 390×844 and English 320×720 creation, storage
inspection, mismatch denial, normalized match, and direct `/parent` entry with no overflow or
console errors. Physical Android and named-human review remain `BLOCKED / NOT RUN`. The reservation
is released at this local checkpoint; no push, merge, deployment, or release activation was
performed.

## 2026-09-07 Compact Audio Onboarding Correction Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`DESIGN_DIRECTION.md`, `PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md}`, the existing
`specs/003-family-growth-garden/design-intake/r003-first-run-experience.md`, `package.json`,
`package-lock.json`, `src/components/access/GhafIcon.tsx`,
`src/components/onboarding/{FirstRunOnboarding.tsx,useOnboardingNarrator.ts}`, new
`src/components/onboarding/{onboardingAudioSources.ts,useOnboardingAmbience.ts}`,
`src/components/illustrations/LocalIllustration.tsx`,
`src/i18n/resources.ts`, new prepared local files and provenance under
`assets/audio/onboarding/`, and `tests/r003-first-run-experience.test.ts` only.

**Scope**: Supersede only the square/segmented/Guide-panel portion of the immediately preceding
onboarding presentation. Reveal the existing 1200×800 photographs in responsive 3:2 frames so
their curated wide and close compositions remain intact; center the live title/body; restore the
original current/total plus dot indicator directly above the navigation actions; and replace the
Guide panel with one high-contrast 48dp speaker icon that replays the current narration. Start the
prepared synthetic narration after the slide image and layout settle, stop it on slide/locale/exit,
and add quiet looping foreground-only nature ambience that stops on exit and yields to assistive
speech. The six visible scripts remain the transcript and navigation remains explicit. Preserve
the six-state reducer, pillar navigation, routes, startup/deferred-image behavior, access/session,
task/reward/privacy/reset authorities, default-off flags, official logo, and protected user work.
No microphone, recording, background OS playback, background listening, runtime URL, live model,
provider secret, new image, push, merge, deployment, or release activation is authorized.

**Completion — 2026-09-07**: `/root` restored the original current/total plus dot row, revealed all
six approved 1200×800 photographs in 3:2 wide/close compositions, centered the concise copy, and
replaced the Guide panel with one 48dp speaker control. Twelve prepared synthetic bilingual clips
and one locally synthesized nature ambience now use the existing foreground-only `expo-audio`
boundary; native playback waits for image/layout settlement, screen readers suppress both paths,
the speaker recovers first-screen web sound, and all players stop on transition/exit. The obsolete
`expo-speech` dependency was removed. RED recorded 2 expected failures / 11 passes; the focused file
passed 13 tests and the full suite passed 90 files / 1,086 tests. Typecheck, zero-warning lint,
formatting, Expo dependency/public-config, Git whitespace, web/Android exports, 13-asset checksum
matching, and the final Impeccable detector passed. Firefox covered Arabic 390×844 and English
320×720 with exact 3:2 measurements, centered copy, a 48dp speaker, simple lower dots, no overflow,
local audio requests, and zero final console errors. Physical Android audio/TalkBack/font scale and
named Arabic/voice/rights review remain `BLOCKED / NOT RUN`. The reservation is released at this
local checkpoint; no push, merge, deployment, or release activation was performed.

## 2026-09-07 AI-narrated Square Onboarding Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`DESIGN_DIRECTION.md`, `PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md}`, the existing
`specs/003-family-growth-garden/design-intake/r003-first-run-experience.md`, `package.json`,
`package-lock.json`, `src/components/onboarding/FirstRunOnboarding.tsx`, new
`src/components/onboarding/useOnboardingNarrator.ts`, `src/i18n/resources.ts`, and
`tests/r003-first-run-experience.test.ts` only.

**Scope**: Refine the existing six-moment first-run presentation with 1:1 local artwork, a
high-contrast lower segmented story indicator directly above the navigation actions, shorter
energetic first-person Ghaf Guide copy, and optional automatic device text-to-speech narration.
Narration must stop between moments and on exit, expose
an on-screen replay/stop control, remain silent when a screen reader is active, retain complete
visible text, and fail without blocking onboarding. The voice is device-synthesized presentation,
not a live model call, recording, companion, or proof that AI ran. Preserve the six-state order,
three-pillar navigation, ordered startup/deferred image boundaries, route count, access/session,
task/reward/privacy/reset authorities, default-off flags, official logo, and protected user work.
One Expo-compatible `expo-speech` dependency is authorized as the measured minimum because
`expo-audio` can play prepared files but cannot synthesize the bilingual slide copy and no reviewed
onboarding audio binaries exist. No microphone, recording, background listening/playback, runtime
URL, new image, provider call, push, merge, deployment, or release activation is authorized.

**Completion — 2026-09-07**: `/root` shipped the six square local crops, concise bilingual
first-person Ghaf Guide scripts, a high-contrast lower story rail directly above navigation, and
bounded `expo-speech` device narration with native screen-reader suppression, web opt-in, replay,
cleanup, and nonblocking fallback. The focused file passed 13 tests and the full suite passed 90
files / 1,086 tests. Typecheck, zero-warning lint, formatting, Expo dependency/public-config,
39-route web export, 90-file Android JavaScript export, Git whitespace, and the final Impeccable
detector passed. Firefox inspected Arabic 390×844 and English 320×720, measured a square
275.8×275.8 px crop, found no horizontal overflow, confirmed `1/6 → 2/6`, and exercised the web
voice-unavailable fallback with zero page errors. Physical Android TTS/audio focus, TalkBack, OS
font scale, motion feel, and named-human review remain `BLOCKED / NOT RUN` because no Android
target or reviewer was available. The reservation is released at this local checkpoint; no push,
merge, deployment, or release activation was performed.

## 2026-09-06 Approval Reveal Consequence-parity Window

**Owner and only writer**: `/root`

**Branch**: `integration/r3-complete-screens-20260905` at reviewed baseline `3ad8357`.

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/tasks.md`, `src/state/usePrototypeStore.ts`,
new `src/features/tasks/recognitionSession.ts`,
new `src/features/tasks/recognitionProviderBoundary.ts`,
new `src/utils/exactPlainData.ts`,
new `src/utils/isoTimestamp.ts`,
`src/services/mock/index.ts`,
`src/features/growth/achievements.ts`,
`src/features/growth/seedLedger.ts`,
`src/features/league/presentation.ts`, new `src/features/league/recognitionRuntime.ts`,
`src/features/family-hub/index.ts`, `src/features/family-rewards/index.ts`,
new `src/features/rewards/approvalReveal.ts`,
`src/features/rewards/revealBundle.ts`, `app/league.tsx`,
`output/playwright/r003-reveal-evidence/`,
and focused `tests/{r002b-private-league-presentation,r002b-private-league-route-integration,r002b-reveal-bundle,r002b-reveal-store-integration,r002b-reveal-route-integration,r003-family-hub}.test.*`
plus `tests/{family-reward,reward-matrix}.test.ts`
and
`tests/{r002b-lifetime-seed-projection,recognition-provider-boundary,recognition-provider-store-boundary}.test.ts`
only.

**Scope**: Complete T206 by projecting the normal idempotent Parent approval into one ordered
receipt-only RevealBundle from already committed praise, lifetime Seed, landscape, canopy, eligible
Green Circle, private League/Challenge Leaf, private Family Reward, badge, Impact Path, applicable
learning, and safe-help authorities. Keep the existing `+12` recognition as the only reward
transaction, commit every derived authority and the bundle in one store update, preserve the R002a
celebration, and fail closed before mutation when any applicable receipt cannot be reconciled. The
existing Reveal route remains behind `r002b_reveal_bundle_v2`, every R002b flag stays independent
and off by default, and no screen calculates a consequence. Validate retry, queue, reset,
role/profile, and default-off behavior without claiming Android, named-human, provenance, or
release activation evidence. No dependency, network, production account, real media, push, merge,
deployment, or shared-history rewrite is authorized.

**Closed:** `44f185f`, `c7ee6d6`, and `f546ad9`; final local validation passed 89 files / 1,221
tests, dependency alignment, and a 39-page web export. Physical Android and named-human gates were
not run in this checkpoint.

## 2026-09-06 Device-local Family and AI-guided Setup Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`, `docs/architecture/**`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md,data-model.md,quickstart.md}`, new
`specs/003-family-growth-garden/checklists/local-family-onboarding.md`, current R002b readiness
checklists and design-intake review records, `package.json`, `package-lock.json`, `app.config.ts`,
`app/_layout.tsx`,
`app/access/{parent,child}/**`, `app/{parent,child}/index.tsx`, `app/parent/family/index.tsx`, new
`src/components/access/{ChildProfileForm,AIProfilePreview}.tsx`, existing bounded assistant trigger
components, `src/features/access/**`, new `src/features/local-family/**`, new
`src/features/assistants/profilePersonalization.ts`, `src/models/{access,parentOnboarding}.ts`, new
`src/models/localFamily.ts`, `src/services/{index.ts,interfaces/**,local/**}`,
`src/state/usePrototypeStore.ts`, `src/i18n/resources.ts`, and focused tests for local family,
onboarding, access, assistant policy, routes, reset, localization, and architecture only.

**Scope**: Add one validated, versioned device-local family directory backed by Expo SQLite on
native, guarded localStorage on web, and memory in tests. Persist only one synthetic Parent, one or
two configured Child profiles, minimum curated preferences, and approved synthetic paired-device
markers. Redesign setup as Family Basics plus one indexed Child form per selected count and one
review. Add deterministic prepared AI profile suggestions using age/interests/hobbies/support
preferences only; exclude gender and sensitive/free-text inputs and retain Parent approval. Restore
returning-role routing before first-family decisions, filter unconfigured slots, and clear local
data on Parent reset. Preserve every task, reward, Seed, Garden, League, privacy, route, offline,
and default-off R002b authority. No production account/security/compliance claim, cloud, sync,
notification service, analytics, real Child media/data, remote model, provider secret, push, merge,
deployment, or release activation is authorized.

**Completion — 2026-09-06**: Root implemented the strict schema-1 repository with SQLite native,
localStorage web, and memory test adapters; one/two-Child indexed setup and whole-family review;
configured-role projection; paired-marker restoration/revocation/reset; and deterministic
allowlisted sparkle-marked profile personalization. The focused batch passed 8 files / 83 tests and
the full suite passed 90 files / 1,085 tests. Typecheck, zero-warning lint, formatting, Expo
dependency/public-config checks, route inventory, Git whitespace, the one final detector pass, and
web/Android JavaScript exports passed. Firefox covered Arabic/English at 320×720 and 390×844,
storage inspection, reset, and returning-role paths with no horizontal overflow or console errors.
Physical Android and named-human gates remain `BLOCKED / NOT RUN`. The reservation is released at
this local checkpoint; no push, merge, deployment, or release activation was performed.

## 2026-09-06 SMAC Pillar Onboarding Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md}`, the existing
`specs/003-family-growth-garden/design-intake/r003-first-run-experience.md`,
`assets/images/illustrations/r003/{ASSET_MANIFEST.json,PROVENANCE.md,final/onboarding-*.jpg}`,
`src/components/onboarding/{FirstRunOnboarding.tsx,experienceModel.ts}`,
`src/components/illustrations/illustrationSources.ts`, `src/i18n/resources.ts`,
`src/features/startup/preloadStartupImages.ts`, and
`tests/{r003-first-run-experience,r003-illustration-assets,r001-onboarding-flow}.test.ts` only.

**Scope**: Expand the optional first-run story from four to six child-clear moments so Family,
Sustainability, and bounded task-focused AI are distinct, prominent pillars after the Ghaf
introduction and before the existing help and permanent symbolic-growth close. Add two generated
local raster photographs and an accessible three-pillar navigator, then use one purposeful
UI-thread step transition with a reduced-motion equivalent. Startup may add only those two
onboarding photographs to its bounded signed-out readiness set; the remaining packaged imagery
continues warming asynchronously after onboarding paints. Preserve the ordered native splash →
2,000 ms app-owned splash → minimum 1,000 ms loading → onboarding sequence, exact routes,
session/access/task/reward/privacy authorities, deterministic fallback, default-off flags, official
logo, existing assets, and protected user work. AI copy must disclose that it may be wrong and
remain limited to Parent-approved tasks with an adult-help exit. No vector scene, person, hand,
readable text in imagery, remote asset, dependency, networking, new AI behavior, push, merge,
deployment, or release activation is authorized.

**Completion — 2026-09-06**: Root expanded the in-route flow to six bilingual child-clear moments,
made Family, Sustainability, and bounded AI directly selectable pillars, and kept Help and permanent
private symbolic growth as the close. Two OpenAI imagegen JPEGs were visually curated, normalized
to 1200×800 under 500 KB, prompt-embedded, checksummed, and added to the exact 48-entry local
registry. Startup now derives nine blocking rasters while the deferred queue remains 41. One
220 ms image settle and 45 ms staged copy transition uses transform/opacity on the UI thread;
reduced motion is immediately settled. RED recorded 6 expected feature failures and one later
motion failure; final focused coverage passed 3 files / 26 tests and the full suite passed 87 files
/ 1,065 tests. Typecheck, lint, format, Expo dependency alignment, Git whitespace, the 48-raster
prompt scan, and Impeccable detector passed. Web exported 121 files / 39 static routes and Android
JS exported 90 files; both new rasters were byte-identical in both exports. Firefox traversed all
six moments and pillar jumps across Arabic/English at 320×720 and 390×844 with 60px pillar targets,
no horizontal overflow, reduced-motion parity, and zero page errors. Physical Android and named
human-review gates remain `BLOCKED / NOT RUN` because ADB found no target and no reviewer was
available. The reservation is released at this local checkpoint; no push, merge, deployment, or
release activation was performed.

## 2026-09-06 Returning-family Entry and Welcome Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md}`, `app/access/parent/**`,
`app/{parent,child}/index.tsx`, new `src/components/session/**`,
`src/state/usePrototypeStore.ts`, `src/i18n/resources.ts`, and
`tests/{r003-returning-family-entry,r003-screen-flow}.test.ts` only.

**Scope**: Keep first-family creation available only when the immutable local household receipt is
absent. A verified returning Parent with that receipt must reuse the existing family and land on
Parent Home; a returning Child on an active paired-device fixture must land on Today. Record a
one-use, role-bound presentation signal only after those returning sign-ins, then show an
Arabic-first private local update dialog over the corresponding dashboard. The dialog may read
only data already visible to that role, must be dismissible, and must not claim push delivery,
remote sync, production persistence, or a second household. First-family success, new Child
pairing, access separation, reset, default-off flags, route count, existing authorities, theme,
and protected user work remain unchanged. No dependency, asset, URL, push, merge, deployment, or
release activation is authorized.

**Completion — 2026-09-06**: Root added one transient, role-bound returning-user presentation
signal derived only from the established Parent receipt or active Child paired-device fixture.
Returning Parent verification now reuses the existing household and enters Parent Home; returning
Child credentials enter that Child's Today screen. Fresh Parent setup and first Child pairing do not
set the signal. One shared bilingual Soft Geometric modal presents at most two current, private,
role-authorized updates and clears on dismiss, navigation, sign-out, handoff, or reset. RED recorded
5 expected failures; final focused coverage passed 5 tests, the integrated batch passed 4 files /
35 tests, and the full suite passed 87 files / 1,063 tests. Typecheck, lint, formatting, dependency
alignment, Git whitespace, detector, and the 39-route web export passed. Firefox verified fresh and
returning Parent/Child journeys plus Arabic/English 320×720 and 390×844 dialog layouts with no
horizontal overflow or page errors. Physical Android and assistive-technology checks remain
`BLOCKED / NOT RUN` because ADB found no target. The reservation is released at this local
checkpoint; no push, merge, deployment, or release activation was performed.

## 2026-09-06 Ordered Splash-to-loading Startup Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md}`, `app/_layout.tsx`,
`src/components/onboarding/BrandedSplash.tsx`, `src/design/tokens.ts`, and
`tests/r003-first-run-experience.test.ts` only.

**Scope**: Replace the combined startup overlay with an explicit ordered presentation: configured
native splash, fully opaque app-owned Ghaf splash for 2,000 ms after native handoff, simple
three-leaf loading state for at least 1,000 ms and until bounded signed-out readiness settles, then
onboarding. The initial app-owned splash may not enter from transparent or expose the mounted
onboarding surface. Deferred 41-image warming begins only after the loading stage completes.
Preserve the current logo, raster field, leaf loader, reduced-motion behavior, route/access/product
authorities, local asset sets, fallback, flags, and protected user work. No new asset, dependency,
URL, product claim, push, merge, deployment, or release activation is authorized.

**Completion — 2026-09-06**: Root replaced the combined boolean overlay with explicit
`splash → loading → complete` state, removed initial and final overlay transparency, separated
2,000 ms splash and 1,000 ms loading tokens, kept readiness attached only to loading, and deferred
the 41-image queue until two onboarding paint frames. RED recorded 2 failures / 8 passes; final
focused coverage passed 10 tests and the full suite passed 86 files / 1,058 tests. Typecheck, lint,
format, dependency alignment, detector, Git whitespace, web export (119 files), and Android JS
export (88 files) passed. Fresh cached and delayed Firefox timelines both began with the topmost
loader-free splash, then loading, then onboarding; cached loading measured 1,013 ms, delayed
readiness extended it to 3,214 ms, all deferred requests occurred in onboarding, and compact visual
inspection produced zero errors. Physical Android first-frame timing/motion remains
`BLOCKED / NOT RUN` because ADB found no device. The reservation is released at the cohesive local
checkpoint; no push, merge, deployment, or release activation was performed.

## 2026-09-06 Deferred Post-onboarding Image Warm-up Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md}`, `app/_layout.tsx`,
`src/features/startup/**`, and `tests/r003-first-run-experience.test.ts` only.

**Scope**: Preserve the seven-raster/four-font blocking startup gate, then begin a non-blocking
warm-up only after the app-owned splash exits and the onboarding surface has received a paint
opportunity. Load the remaining local rasters asynchronously in bounded parallel batches, share
the existing source-level promise cache with demand-driven section preparation, prioritize the
immediate access/experience set, and leave the large prepared-media fixture until the final batch.
The background queue may never delay first paint, navigation, section transitions, fallback, or
reset and exposes no visible progress or remote-work claim. Preserve routes, access/session and
product authorities, offline packaging, feature flags, current images, fonts, UI, and protected
user work. No new asset, dependency, URL, vector image, push, merge, deployment, or release
activation is authorized.

**Completion — 2026-09-06**: Root extracted one per-source `expo-asset` promise cache, retained the
seven-raster/four-font startup calculation, and added a singleton 41-raster background queue that
starts after two post-splash frames. Batches load six sources concurrently, prioritize access and
experience art, tolerate individual failures, and leave the 2.3 MB prepared fixture last. RED
failed on the absent helper; final focused coverage passed 9 tests and the full suite passed 86
files / 1,057 tests. Typecheck, lint, format, dependency alignment, Git whitespace, web export (119
files), and Android JS export (88 files) passed. A delayed Firefox flow recorded zero deferred
requests while the splash was pending, then exactly 41 after handoff with six simultaneous priority
starts and prepared media last; it had zero page errors. Physical Android decode/cache/memory
remains `BLOCKED / NOT RUN` because ADB found no device. The reservation is released at the
cohesive local checkpoint; no push, merge, deployment, or release activation was performed.

## 2026-09-06 Section-scoped Asset Loading and Simple Leaf-loop Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`, `app.config.ts`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md}`, the existing
`specs/003-family-growth-garden/design-intake/r003-first-run-experience.md`, `app/_layout.tsx`,
`src/features/startup/**`, `src/components/onboarding/**`, `src/i18n/resources.ts`, and
`tests/{r001-design-foundation,r003-first-run-experience}.test.ts` only.

**Scope**: Supersede the all-app startup preload with a section-scoped local-asset policy. Startup
may block only on the official logo, shared leaf-shadow field, four onboarding photographs,
Welcome photograph, and four font files used by the current Alexandria/Readex roles. Parent/Child
access handoffs may warm the five small botanical avatars; Parent/Child experience handoffs may
warm only their immediate field/task imagery. Garden, League, reveal, learning, Shared Growth,
canopy, Circle, and prepared-media rasters remain lazy through the existing Expo Image memory/disk
cache. Begin the 1,200 ms app-owned splash window only after the native splash hide settles, replace
visible resource copy/progress with one reusable three-leaf transform-only loop, keep an
accessibility-only localized loading label and static reduced-motion state, and let the 900 ms
major-section buffer wait for its bounded destination assets. Preserve routes, access/session and
product authorities, offline fallback, flags, image registry, and protected user work. No new
asset, dependency, remote URL, vector image, fake progress, push, merge, deployment, or release
activation is authorized.

**Completion — 2026-09-06**: Root replaced the 48-raster/seven-font startup gate with seven
signed-out rasters and the four font files used by current brand roles, then added cached bounded
access/experience preparation while keeping all deeper imagery lazy in Expo Image. Combined
startup file bytes fell from 10,638,873 to 2,196,726 (79.4%). Native handoff now starts the full
1,200 ms app-owned presentation window. Startup and section buffers share one transform-only
three-leaf loop, no visible technical resource copy, and a static reduced-motion state. The focused
batch passed 2 files / 15 tests after the required RED state; the full suite passed 86 files /
1,056 tests, with typecheck, lint, format, dependency alignment, detector, production exports, and
Git whitespace checks passing. Firefox request/timing evidence showed only the exact seven rasters
and four fonts at startup, a 1,318 ms cached visible handoff including exit, delayed-asset waiting,
post-handoff avatar requests, changing standard rotation, static reduced motion, zero errors, and no
horizontal overflow at 320/390 widths. Physical Android/TalkBack/native decode and OS font-scale
remain `BLOCKED / NOT RUN` because ADB listed no target. The reservation is released at the
cohesive local checkpoint; no push, merge, deployment, or release activation was performed.

## 2026-09-06 Startup Asset-readiness and Loading-motion Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md}`, the existing
`specs/003-family-growth-garden/design-intake/r003-first-run-experience.md`, `app/_layout.tsx`,
new `src/features/startup/**`, `src/components/brand/GhafRasterLogo.tsx`,
`src/components/demoAssets.ts`, `src/components/illustrations/illustrationSources.ts`,
`src/components/onboarding/BrandedSplash.tsx`, `src/i18n/resources.ts`, and
`tests/r003-first-run-experience.test.ts` only.

**Scope**: Keep the branded app-owned splash visible until Alexandria/Readex fonts and every
registered local runtime raster image have settled, including deterministic image-fallback paths.
Load the splash logo and leaf-shadow background before yielding the native splash, then preload the
remaining local images with measured settled-resource progress. Replace the generic spinner with
one Ghaf-specific, UI-thread loading animation and a calm reduced-motion equivalent. Preserve the
1,200 ms minimum, offline behavior, exact routes, access/session and product authorities, image
registry, default-off flags, and protected user work. No new image, dependency, remote URL, fake
percentage, business behavior, push, merge, deployment, or release activation is authorized.

**Completion — 2026-09-06**: Root implemented critical-brand-first loading, batched preload of all
48 registered runtime raster modules, seven-font-set readiness, real accessible progress, fallback
failure accounting, and the Ghaf-specific UI-thread pulse with a static reduced-motion path. The
focused file passed 7 tests and the full suite passed 86 files / 1,055 tests; typecheck, lint,
formatting, dependency alignment, detector, 122-file web export, 91-file Android JS export, and Git
whitespace checks passed. Firefox delayed-raster inspection proved the splash remained after 3.2
seconds at real progress `0.927273`, dismissed after settlement, and logged zero page errors;
Arabic 320×720 and 390×844 layouts were contained. Physical Android/TalkBack/OS font scale and
named-human review remain `BLOCKED / NOT RUN` with no attached ADB target. The reservation is
released to the integration owner at the cohesive local checkpoint; no push, merge, deployment, or
release activation was performed.

## 2026-09-06 Child-clear Onboarding and Branded Access Refinement Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`DESIGN_DIRECTION.md`, `PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md}`, the existing
`specs/003-family-growth-garden/design-intake/r003-first-run-experience.md`, `app/_layout.tsx`,
`app/access/**`,
`assets/images/illustrations/r003/{ASSET_MANIFEST.json,PROVENANCE.md,final/onboarding-*.jpg}`,
`src/design/tokens.ts`, `src/components/access/AccessShell.tsx`, `src/components/brand/**`,
`src/components/onboarding/**`, `src/components/illustrations/illustrationSources.ts`,
`src/i18n/resources.ts`, and
`tests/{r003-first-run-experience,r003-illustration-assets,r001-onboarding-flow,r003-screen-flow}.test.ts`
only.

**Scope**: Supersede the three-moment first-run sequence with four moments beginning with a clear
introduction to Ghaf, rewrite all onboarding copy for younger readers without weakening product
truth, replace the three feature photographs with more vivid child-welcoming raster photography,
and add one new Ghaf-introduction raster. Give startup a measured 1,200 ms minimum presentation
window and major-section orientation buffers a 900 ms dwell, without fake progress or remote-work
claims. Refactor the shared access shell so every Parent/Child sign-in, verification, pairing, and
first-family setup surface carries the official raster Ghaf logo/name and the loader's leaf-shadow
visual world. Preserve exact routes, state, access separation, reset, task/reward authorities,
default-off flags, offline behavior, and protected user work. No vector scene, new dependency,
remote image, production authentication claim, push, merge, deployment, or release activation is
authorized.

**Completion — 2026-09-06**: Root implemented and validated the four-moment child-clear bilingual
onboarding, four vivid onboarding photographs, declared 1,200/900 ms presentation holds, and one
shared raster-logo/leaf-shadow access shell across all Parent/Child access routes. The focused
suite passed 3 files / 16 tests and the complete suite passed 86 files / 1,053 tests; typecheck,
lint, formatting, Expo dependency alignment, the Impeccable detector, 122-file web export,
91-file Android JS export, five-image checksum matching, and Git whitespace checks passed. Firefox
proxy evidence covered four onboarding moments and eight reachable access states at compact
Arabic/English widths with zero final-flow console errors. Physical Android/TalkBack/OS font scale
remains `BLOCKED / NOT RUN` with no attached ADB device; named Arabic/UAE, safeguarding,
accessibility, botanical, and image-rights review remains `NOT RUN`. All reserved boundaries are
released to the integration owner; no push, merge, deployment, or release activation was
performed.

## 2026-09-06 First-run Onboarding and Context Transition Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`DESIGN_DIRECTION.md`, `PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md}`,
`specs/003-family-growth-garden/design-intake/r003-first-run-experience.md`, `app/_layout.tsx`,
`app/index.tsx`, `assets/images/illustrations/r003/{ASSET_MANIFEST.json,PROVENANCE.md,final/**}`,
`src/components/illustrations/illustrationSources.ts`, `src/components/onboarding/**`,
`src/i18n/resources.ts`, and
`tests/{r003-first-run-experience,r003-illustration-assets}.test.ts` only.

**Scope**: Add a three-moment, optional Arabic-first onboarding presentation inside the existing
Welcome route, retain visible Parent and Child access choices after onboarding, and bridge the
native raster splash into one branded local loading presentation. Add one professional transition
buffer only when the app crosses between Welcome, role-specific access, and an authenticated
Parent or Child experience; routine tabs and contextual routes within the same experience never
show the buffer. Use the immutable official raster logo and four new locally generated raster
photographs in the Quiet UAE Botanical Editorial direction. No new product route, vector scene,
account authority, persistence claim, network request, artificial delay, reward/state change,
remote loading claim, dependency, release activation, push, merge, or deployment is authorized.
Existing functional vectors outside this boundary remain protected. Completion is session-local,
skippable, reduced-motion aware, offline deterministic, and equivalent in Arabic RTL and English
LTR. Protected user-owned paths remain untouched.

**Completion — 2026-09-06**: Root implemented the three-moment bilingual onboarding, official
raster-logo treatment, local branded startup handoff, and bounded experience-transition overlay
without adding a route, dependency, network request, or durable authority. Four generated JPEGs
were inspected, normalized, prompt-embedded, checksummed, registered, and verified in both web and
Android production exports. Focused onboarding/route/reset coverage passed 7 files / 76 tests; the
full suite passed 86 files / 1,052 tests; typecheck, lint, formatting, Expo dependency checks, and
`git diff --check` passed. Firefox proxy inspection passed Arabic RTL and English LTR at 320×720
and 390×844 with no horizontal overflow or console errors, including Back/Skip/Start, same-section
transition suppression, and reduced-motion equivalence. Physical Android, TalkBack, OS font-scale,
named-human, and image-rights review remain `BLOCKED` or `NOT RUN` because no device or reviewer was
available. All reserved boundaries are released to the integration owner at the local checkpoints;
no push, merge, deployment, or release activation was performed.

## 2026-09-06 Natural Botanical Artwork Refresh Window

**Integration owner and only runtime/documentation writer**: `/root`

**Asset-generation contributors**: up to three `/root/illustration_*` workers, each restricted to
its separately assigned subdirectory under `assets/images/illustrations/r003/`. They are not
authorized to edit runtime, tests, shared manifests, configuration, evidence, or this ownership
record.

**Exact generation allocation**: `batch-access-ghaf/**` holds the field, Welcome, profile, task,
Ghaf-stage, and first Circle sources; `batch-groves-canopy/**` holds Samar and Sidr stage sources;
`batch-oasis-coast/**` holds Date Palm, Mangrove, reveal, learning, and shared-coastal sources; and
`batch-canopy-circle/**` holds only the two family-canopy and remaining two Circle sources. Root
alone curates those non-overlapping inputs into the shipping `final/**` directory and shared
manifest.

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `DESIGN.md`, `DESIGN_DIRECTION.md`,
`PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`, `docs/design/brand/GHAF_OFFICIAL_LOGO_MIGRATION.md`,
`docs/design/stitch/releases/ghaf-r002a/ASSET_PROVENANCE.md`,
`docs/design/stitch/releases/ghaf-r002b/{SCREEN_INDEX.md,screens/02-garden-chapter/screen-spec.md,screens/06-learning-story/screen-spec.md,screens/08-child-reveal/screen-spec.md,screens/10-shared-growth/screen-spec.md,screens/12-private-league/screen-spec.md}`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md,quickstart.md}`,
`specs/003-family-growth-garden/checklists/requirements.md`,
`specs/003-family-growth-garden/contracts/acceptance-contract.md`,
`specs/003-family-growth-garden/design-intake/{r003-complete-screen-journey.md,r003-natural-artwork-refresh.md}`,
`package.json`, `package-lock.json`, `app.config.ts`, `app/index.tsx`, `assets/images/illustrations/r003/**`,
`src/components/illustrations/**`, `src/components/access/{AccessShell.tsx,BotanicalAvatar.tsx}`,
`src/components/r002a/{R002aScreen.tsx,child/ChildTaskHero.tsx}`,
`src/components/family-growth/{GardenLandscape.tsx,FamilyCanopy.tsx,CircleProgress.tsx,PreparedMedia.tsx}`,
`src/components/r002b/{LearningScreens.tsx,RevealBundleScreen.tsx,SharedGrowthScreens.tsx,PrivateLeagueScreen.tsx}`,
`src/i18n/resources.ts`, and
`tests/{r001-design-foundation,official-brand-platform,r002a-child-task-presentation,r002a-garden-presentation,r002a-parent-home-presentation,r002a-cross-slice-quality,r002b-learning-screen-components,r002b-reveal-screen-components,r002b-shared-growth-screen-components,r003-illustration-assets}.test.{ts,tsx}` only.

**Scope**: Replace vector-like scenic, decorative, botanical-state, task, learning, reveal,
cooperative-growth, and profile-choice drawings with an offline, provenance-recorded local raster
library in the **Quiet UAE Botanical Editorial** direction. The exact library contains one subtle
field texture, one welcome habitat hero, five botanical profile images, one recycling task hero,
twenty-five species-and-stage Garden scenes, two 19/25 and 20/25 family-canopy scenes, three
anonymous cooperative-garden scenes, one recognition reveal, one Mangrove habitat study, and one
shared coastal canopy. Preserve the official Ghaf mark and wordmark, app/platform icons, small
functional navigation/status/safety controls, live progress geometry, accessibility semantics,
Arabic/English copy, routes, state, reward authority, privacy filtering, deterministic reset, and
all default-off R002b flags. Generated images contain no people, faces, hands, readable text,
logos, brands, hazards, fantasy claims, or rasterized UI. Raw Stitch exports and protected
user-owned paths remain untouched. One Expo-native image dependency is authorized only for local
decode, crop, caching, transition, and memory behavior; it adds no media capture or remote service.
No push, merge, deployment, release activation, or shared-history rewrite is authorized.

**Completion — 2026-09-06**: Root curated and integrated 41 local photographic artwork files with
exact prompt, source/final dimension, transformation, route, accessibility, checksum, and review
records. Scenic runtime drawings and the decorative League watermark are removed; the official
Ghaf brand and small functional vectors remain protected. Focused artwork/route/reset coverage
passed 15 files / 151 tests; the full suite passed 85 files / 1,048 tests; typecheck, lint,
formatting, Expo dependency/configuration checks, prompt scan, web export, Android JavaScript
export, and `git diff --check` passed. Default-on Arabic/English Firefox proxy inspection passed at
320/390 widths. Explicitly enabled default-off art routes and named-human/rights checks remain
`NOT RUN`; physical Android is `BLOCKED` because no device or emulator was attached. All reserved
boundaries are released to the integration owner at this local checkpoint. No push, merge,
deployment, or release activation was performed.

## 2026-09-06 Parent Sign-up Flow and Sign-in Hierarchy Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md,quickstart.md}`,
`specs/003-family-growth-garden/checklists/requirements.md`,
`specs/003-family-growth-garden/contracts/acceptance-contract.md`,
`specs/003-family-growth-garden/design-intake/r003-complete-screen-journey.md`,
`app/access/parent/{sign-in.tsx,sign-up.tsx,verification.tsx}`,
`src/i18n/resources.ts`, and
`tests/{r001-onboarding-flow,r003-screen-flow,operator-demo-flow}.test.ts` only.

**Scope**: Center the Parent sign-in orientation and supporting copy while retaining logical-start
alignment for mixed phone/email data entry, preserve the filled/neutral/outlined action hierarchy,
and route **Create a new family** to a dedicated code-native Soft Geometric sign-up screen. The
sign-up screen reuses the existing deterministic Parent verification authority and continues to
first-family setup; a closed `create-family` flow marker may restore Verification Back/cancel only
to sign-up. No second household, production account, new access authority, dependency, or live
service is authorized. Delegated audits are read-only; protected user-owned paths remain untouched
and no push or merge is authorized.

**Completion — 2026-09-06**: Parent sign-in now centers its screen-level orientation and support
copy while keeping identifier labels and helper text on the logical form axis. **Create a new
family** navigates without requesting a code to the dedicated bilingual sign-up screen; its
allowlisted verification origin restores sign-up on visible Back, Android Back, and identifier
change, including offline preview. Focused access/navigation coverage passed 3 files / 57 tests;
the full suite passed 84 files / 1,044 tests; typecheck, lint, formatting, dependency/configuration
checks, `git diff --check`, the exact 37-product-route inventory, and the 39-route web export passed.
Firefox proxy inspection passed Arabic and English at 320×720 and 390×844 with equal action
geometry, zero horizontal overflow, and zero application console errors. Physical Android remains
blocked by the recorded unavailable device/toolchain, and named human review remains `NOT RUN`.
All reserved boundaries are released to the integration owner at this checkpoint; no push or merge
was performed.

## 2026-09-06 Parent Sign-in Spacing Refinement Window

**Owner and only writer**: `/root`

**Reserved boundary**: `app/access/parent/sign-in.tsx`,
`tests/r001-onboarding-flow.test.ts`, and this ownership record only.

**Scope**: Refine the user-approved Parent sign-in layout with an explicit logical text axis and a
token-only 4/12/16/20 dp vertical rhythm. Preserve the existing group order, equal button sizing,
copy, behavior, access boundaries, and design authority. Delegated audits are read-only; protected
user-owned paths remain untouched and no push or merge is authorized.

**Completion — 2026-09-06**: Intro and supporting copy now use explicit logical-start alignment;
related text/action gaps use the approved 4/12/16/20 dp cadence; the redundant second divider was
removed; and the content column centers only when spare height exists while remaining naturally
scrollable on compact or keyboard-constrained layouts. Firefox verified Arabic RTL and English LTR
at 320×720 plus the balanced English tall layout at 390×844 with zero console errors. The focused
regression, full 84-file/1,044-test suite, typecheck, lint, formatting, and scoped layout detector
passed. Physical Android remains blocked by the recorded unavailable device/toolchain. The
reservation is released after the cohesive local commit.

## 2026-09-06 Parent Sign-in Layout Redesign Window

**Owner and only writer**: `/root`

**Reserved boundary**: `app/access/parent/sign-in.tsx`,
`tests/r001-onboarding-flow.test.ts`, `DESIGN.md`, and this ownership record only.

**Scope**: Recompose the existing Parent sign-in screen into clear credential, biometric, and
new-family groups using only the approved Ghaf tokens and shared controls. All three actions must
share the full content width, regular minimum height, and corner geometry while preserving their
filled, neutral, and outlined hierarchy. Copy, handlers, route order, synthetic disclosures,
offline/error states, and Parent/Child access separation remain unchanged. Delegated audits are
read-only; protected user-owned paths remain untouched and no push or merge is authorized.

**Completion — 2026-09-06**: The screen now uses a compact intro and deliberate credential,
biometric, and new-family groups instead of one uniform action stack. At the 320×720 Firefox proxy,
all three actions measured 280×60 with 16 px corners; Arabic RTL and English LTR kept the full
Create Family control above the disclosure footer with zero console errors. The focused regression,
full 84-file/1,044-test suite, typecheck, lint, formatting, and scoped layout detector passed.
Physical Android remains blocked by the previously recorded unavailable device/toolchain, so no
native visual claim is added. The reservation is released after the cohesive local commit.

## 2026-09-06 Parent Sign-in CTA Clarity Window

**Owner and only writer**: `/root`

**Reserved boundary**: `app/access/parent/sign-in.tsx`,
`tests/r001-onboarding-flow.test.ts`, and this ownership record only.

**Scope**: Give the existing Parent sign-in “Create a new family” secondary action a clearly
visible outer frame using the approved Ghaf design tokens and shared Button behavior. Preserve its
copy, route action, hierarchy, bilingual layout, and all unrelated access behavior. The delegated
screen audit is read-only; protected user-owned paths remain untouched and no push or merge is
authorized.

**Completion — 2026-09-06**: The CTA now renders the existing shared 1 px Button border in Ghaf
emerald while retaining its quiet variant, 48 px touch target, pill geometry, focus behavior, and
Arabic/English copy. The focused regression, full 84-file/1,044-test suite, typecheck, lint, and
format checks passed. Firefox at 390×844 confirmed the border in Arabic RTL and English LTR with
zero console errors. The reservation is released after the cohesive local commit.

## 2026-09-05 Complete Screen Journey Window

**Integration owner and only writer**: `/root`

**Branch**: `integration/r3-complete-screens-20260905`, created from the validated R002b
implementation checkpoint `45b18bc`.

**User authority**: Complete every missing P0 screen and make the Parent and Child sequences
coherent. A missing Google Stitch frame is no longer an implementation blocker for this local
prototype; new surfaces inherit the approved Soft Geometric Ghaf system in `DESIGN.md` and
`DESIGN_DIRECTION.md`. Existing R002b presentations remain independently default-off; explicit
opt-in is for targeted validation only and does not activate release.

**Reserved boundary**: Feature 003 `spec.md`, `plan.md`, `tasks.md`, new completion design-intake
records, `DESIGN.md`, `DESIGN_DIRECTION.md`, `PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`,
`app/**`, `src/components/r002a/**`, new `src/components/r003/**`, `src/config/**`,
`src/features/access/**`, new `src/features/family-hub/**`, `src/i18n/**`,
`src/state/usePrototypeStore.ts`, and new/focused completion tests in `tests/**`.

The writer must preserve `.codex/config.toml`,
`docs/Ghaf_Official_Logo_and_App_Icon_Pack_v1.0/`, and
`docs/design/stitch/releases/ghaf-r002/` as user-owned input. Those paths must not be edited,
staged, or committed. No package/dependency, production account, network, payment, real media,
push, merge, deployment, or shared-history rewrite is authorized. The reservation ends after the
implemented route manifest, focused/full validation, browser walkthrough, truthful limitations,
and cohesive local commits are handed off.

**Completion and release — 2026-09-06**: Runtime and tests were committed locally as `40fc5fc`;
the documentation/evidence closeout is the commit containing this paragraph. Final gates passed
typecheck, lint, formatting, 84 files / 1,044 tests, dependency/configuration checks, Git whitespace,
and a 38-route web export. Firefox 390×844 passed the scoped Arabic/English journey, revoke/re-pair,
League, reset/Back, and signed-origin focus/scroll probes with zero console errors. Physical Android
remains `BLOCKED` because ADB has no attached device and the SDK/Java toolchain is unavailable;
native and named-human subchecks remain `NOT RUN`. The final design disposition is `recapture`, not
ship, until an authoritative Android capture exists. The protected user-owned paths remained
unstaged, no push or merge occurred, and the complete-screen reservation is released to the team.

**Authority-hardening test migration delegation — 2026-09-06**: `/root` retains runtime and
integration ownership. `/root/session_tests_core` exclusively owns the existing core-flow test
files `mock-core-flow.test.ts`, `parent-task-flow.test.ts`, `child-task-flow.test.ts`,
`garden-circle-flow.test.ts`, `child-ai-presentation.test.ts`, `parent-check-in-flow.test.ts`,
`operator-demo-flow.test.ts`, `prototype-state.test.ts`, `r002a-behavior-characterization.test.ts`,
and `r002a-child-support-follow-up.test.ts`. `/root/session_tests_growth` exclusively owns the
existing Growth test files `r002b-progression-store.test.ts`,
`r002b-reveal-store-integration.test.ts`, `r002b-learning-store.test.ts`,
`r002b-schema3-ledger-characterization.test.ts`, `r002b-shared-growth-store.test.ts`,
`r002b-learning-reveal-integration.test.ts`, and `reward-matrix.test.ts`. Both delegations may use
the shared `tests/helpers/prototypeStore.ts` access helpers but must not edit it, runtime files, or
each other's files; they return focused green evidence without committing.

`/root/r003_flow_docs` exclusively owns `DEMO_RUNBOOK.md`, `PROTOTYPE_LIMITATIONS.md`,
`specs/003-family-growth-garden/quickstart.md`, and
`specs/003-family-growth-garden/contracts/acceptance-contract.md` for the current R003 handoff. It
must replace operational `/role`/role-selector instructions with the implemented Welcome →
role-specific synthetic access → experience sequence, preserve clearly marked historical R001 and
R002a evidence, keep all native/human validation claims truthful, and make no runtime or task-file
edits. It returns documentation checks without committing.

## 2026-09-05 Local Run Guide Simplification Window

**Owner**: `/root`

**Reserved boundary**: `README.md` and `docs/DEVELOPMENT.md` only.

**Scope**: Keep the detailed developer guide consistent with the README by documenting exactly two
supported app-running workflows: offline web testing and a Windows Android Studio/ADB USB device.
Remove QR/Expo Go, LAN/tunnel, emulator, and iOS launch instructions without changing repository
scripts or runtime behavior.

## 2026-09-05 Official Ghaf Brand Migration Window

**Integration owner**: `/root`

**Worktree and branch**:
`/home/smyk/projects/Ghaf-r002-reconciliation-20260904` on
`integration/r3-r002b-implementation-20260905` at preflight head `ca80f9f`.

**Scope**: Integrate the product-owner-designated official Ghaf mark, launcher/adaptive/themed
icons, native splash asset, favicon, and PWA derivatives without changing R001/R002a layouts,
R002b feature-flag defaults, or any product behavior. The source pack in the original worktree is
read-only; `Zone.Identifier` files and raw R002 exports remain excluded.

| Exclusive writer                                                | Exact reserved boundary                                                                                                                          | Handoff condition                                                                                                                                                 |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/root` — brand integration and documentation                   | `TEAM_OWNERSHIP.md`, new `docs/design/brand/**`, final integration review, exact staging, validation, and commits                                | Preserve all behavior and protected content art; record source hashes, replacement decisions, external Stitch status, native blockers, and rollback               |
| `/root/official_brand_orchestrator/brand_asset_inventory`       | New `assets/brand/ghaf/**`, new `src/components/brand/**`, and new `tests/official-brand-mark.test.ts` only                                      | Copy checksum-verified assets without modifying geometry; add one typed mark component using the existing SVG stack; test variants, accessibility, and SVG safety |
| `/root/official_brand_orchestrator/brand_validation_capability` | `app.config.ts`, `package.json`, `package-lock.json`, new `app/+html.tsx`, new `public/**`, and new `tests/official-brand-platform.test.ts` only | Configure platform/web branding against Expo SDK 57, keep existing plugins/config intact, and validate exact dimensions, opacity, safe areas, and resolved paths  |

No writer may edit an existing route, profile avatar, botanical illustration, Garden/League art,
badge, task/navigation icon, feature flag, fixture, service, state, or product specification during
this migration. Delegated writers must accommodate concurrent changes and return work uncommitted.

## 2026-09-05 R002b Feature-Flagged Implementation Window

**Integration owner**: `/root`

**Worktree and branch**:
`/home/smyk/projects/Ghaf-r002-reconciliation-20260904` on
`integration/r3-r002b-implementation-20260905`, created from clean R002a head `0501cf3`.

**Gate**:

- **R002B PRODUCT CONTRACT APPROVED — FEATURE-FLAGGED IMPLEMENTATION AUTHORIZED — RELEASE ACTIVATION BLOCKED**

**Preservation boundary**: R001 and R002a remain regression baselines and the default presentation
whenever an R002b flag is disabled. The six divergent historical commits remain unapplied. The
original worktree and its untracked raw R002 exports remain read-only and must not be staged,
renamed, edited, or imported.

| Exclusive writer                                                                                          | Exact reserved boundary                                                                                                                                                                                                                                                                                                                                                                                                                   | Handoff condition                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/root/r002b_orchestrator` and read-only delegates                                                        | Repository-wide R002b authority, Schema-3, badge, route, flag, and architecture audits only                                                                                                                                                                                                                                                                                                                                               | Return exact evidence and non-overlapping implementation boundaries; no edits                                                                                                                                                                                                    |
| `/root` — contract and integration                                                                        | `PRODUCT.md`, `PROTOTYPE_LIMITATIONS.md`, `DESIGN.md`, `DEMO_RUNBOOK.md`, `TEAM_OWNERSHIP.md`, Feature 003 `spec.md`, `plan.md`, `tasks.md`, `data-model.md`, contracts, design-intake gates/specifications, shared models/store/services/i18n/configuration, `src/features/growth/bootstrap.ts`, `tests/r002b-feature-flags.test.ts`, `tests/r002b-progression-store.test.ts`, route integration, exact staging, validation, and commits | Serialize shared files, keep flags default-off, preserve all R002a behavior, and record every gate truthfully                                                                                                                                                                    |
| `/root/r002b_orchestrator/schema3_characterization_writer`                                                | New `tests/r002b-schema3-ledger-characterization.test.ts` only                                                                                                                                                                                                                                                                                                                                                                            | Add all-green audit coverage for the existing Schema-3 mismatch, task/reward/reset/profile invariants, and absence of persistence; edit no runtime, documentation, or other test file                                                                                            |
| `/root/r002b_orchestrator/progression_engine_writer`                                                      | New `src/models/growthJourney.ts`, `src/features/growth/seedLedger.ts`, and `tests/r002b-lifetime-seed-projection.test.ts` only                                                                                                                                                                                                                                                                                                           | Build the pure immutable ledger audit/migration/lifetime-projection boundary test-first; edit no store, fixture, service, route, resource, configuration, documentation, or other test file                                                                                      |
| `/root/r002b_orchestrator/achievement_engine_writer`                                                      | New `src/models/achievements.ts`, `src/features/growth/badgeRegistry.ts`, `src/features/growth/achievements.ts`, and `tests/r002b-achievements.test.ts` only                                                                                                                                                                                                                                                                              | Encode and evaluate the exact locked 16-badge registry test-first; edit no existing progression file, store, fixture, service, route, resource, configuration, documentation, or other test file                                                                                 |
| `/root/r002b_orchestrator/learning_engine_writer`                                                         | New `src/models/learning.ts`, `src/features/learning/mangroveLearning.ts`, and `tests/r002b-learning.test.ts` only                                                                                                                                                                                                                                                                                                                        | Implement the finite equal-credit package and idempotent completion test-first; edit no store, route, resource, shared model, fixture, service registry, or documentation                                                                                                        |
| `/root/r002b_orchestrator/reveal_bundle_writer`                                                           | New `src/models/revealBundle.ts`, `src/features/rewards/revealBundle.ts`, and `tests/r002b-reveal-bundle.test.ts` only                                                                                                                                                                                                                                                                                                                    | Build the receipt-only superset bundle and lifecycle test-first; never calculate or mutate a reward, and edit no store, route, resource, fixture, service registry, or documentation                                                                                             |
| `/root/r002b_orchestrator/shared_growth_writer`                                                           | New `src/models/sharedGrowth.ts`, `src/features/shared-growth/sharedGrowth.ts`, and `tests/r002b-shared-growth.test.ts` only                                                                                                                                                                                                                                                                                                              | Build the anonymous qualitative view and Parent-governed future-contribution state test-first; preserve private League and every personal/reward authority; edit no store, route, resource, fixture, configuration, or documentation                                             |
| `/root` — queued Parent Progress projection                                                               | New `src/features/growth/parentProgress.ts` and `tests/r002b-parent-progress.test.ts` only                                                                                                                                                                                                                                                                                                                                                | Build a Parent-only, profile/epoch-scoped, read-only projection with transparent Task Builder prefill intents; never assign, mutate, grant, or edit progress, and validate before route integration                                                                              |
| `/root/r002b_orchestrator/learning_content_writer` (reused for Growth UI after releasing its prior files) | New `src/components/r002b/GrowthJourneyScreens.tsx` and `tests/r002b-growth-screen-components.test.tsx` only                                                                                                                                                                                                                                                                                                                              | Build reusable code-native Today/Garden/Impact Path/Badge Gallery/Badge Detail presentation components from the approved screen specs and existing tokens; accept copy/actions/data as props and edit no route, store, resource, token, fixture, configuration, or documentation |
| `/root/r002b_orchestrator/learning_screens_writer`                                                        | New `src/components/r002b/LearningScreens.tsx` and `tests/r002b-learning-screen-components.test.tsx` only                                                                                                                                                                                                                                                                                                                                 | Build prop-driven code-native Story and accessible-equivalent Learning surfaces with finite, no-fail, equal-credit, resumable presentation; edit no route, store, i18n, configuration, documentation, or domain file                                                             |
| `/root` — R002b screen specifications and UI integration                                                  | New `docs/design/stitch/releases/ghaf-r002b/**`, future `src/components/r002b/**` except the reserved `GrowthJourneyScreens.tsx`, future nested R002b route files, and serialized integration into existing routes after the applicable domain interface is stable                                                                                                                                                                        | Define every code-native candidate before implementation, keep each surface behind its independent default-off flag, and preserve the exact R002a fallback and all existing behavior                                                                                             |
| `/root/r002b_evidence_docs` — closeout evidence                                                           | `specs/003-family-growth-garden/tasks.md`, new `specs/003-family-growth-garden/design-intake/r002b-validation-evidence.md`, `docs/design/stitch/releases/ghaf-r002b/SCREEN_INDEX.md`, `TEAM_OWNERSHIP.md`, and `DEMO_RUNBOOK.md` only                                                                                                                                                                                                     | Reconcile only evidence-proven task states, preserve every release/native/human gate, validate the Markdown diff, and return files unstaged to `/root`                                                                                                                           |
| `/root/r002b_completion_audit/shared_garden_recovery` — Shared Garden recovery                            | `app/parent/family/shared-garden.tsx`, `src/features/shared-growth/r002bSharedGrowthViewModel.ts`, `src/components/r002b/SharedGrowthScreens.tsx`, `src/i18n/resources.ts`, and the three focused `tests/r002b-shared-growth-{view-model,screen-components,route-integration}.test.*` files only                                                                                                                                          | Add a bilingual, accessible retry from presentation error back to ready/recovered state without changing participation, consent, flags, store, or domain semantics; use red/green tests and return changes uncommitted                                                           |
| `/root/r002b_completion_audit/reveal_impact_focus` — Reveal and Impact focus hardening                    | `app/child/reveal/[bundleId].tsx`, `app/child/index.tsx`, `src/components/r002b/RevealBundleScreen.tsx`, `src/components/r002b/GrowthJourneyScreens.tsx`, and focused Reveal/Growth/focus/Back tests only                                                                                                                                                                                                                                 | Correct accessible focus targets, initial/return focus, truthful resumed presentation, acknowledged interruption recovery, and native-Back policy using existing lifecycle actions; do not change copy, reward authorities, flags, fixtures, or store/domain semantics           |

No writer may change the same file concurrently. Shared files remain reserved to `/root`; delegated
workers must treat the rest of the repository as read-only and accommodate concurrent changes.

**Progression checkpoint — 2026-09-05**: The pure Seed ledger is integrated with the existing
recognition service through one atomic store write. The compatibility-only validation set passed
42 files / 601 tests, typecheck, focused lint/format, Expo public configuration, dependency check,
18-route static web export, and Git whitespace validation. Restoration is proven for opening,
praise-presented, and one recognized synthetic boundary when a session/runtime snapshot is
available; durable device storage and physical restart evidence remain release-blocked and must not
be inferred from these tests.

**Achievement-domain checkpoint — 2026-09-05**: The exact 16-ID registry, deterministic mastery
credits, permanent private awards, silent Seed-threshold backfill, and gallery/detail projections
passed 49 focused tests and the 43-file / 650-test full suite. Missing criterion translation,
why-it-matters copy, content review, and provenance remain explicit pending fields; this checkpoint
does not authorize the default-off badge UI for release.

**Achievement-integration checkpoint — 2026-09-05**: The same authoritative recognition receipt
now adds the canonical sorting/coast-care credits and evaluates badge awards in the atomic Growth
Journey store projection. Initial Seed-threshold awards remain silent; the new 120 and Sorting Bud
outcomes remain private and resumable. Typecheck, lint, formatting, 43 files / 651 tests, and Git
whitespace validation passed with every R002b presentation flag still default-off.

**Code-native screen-specification checkpoint — 2026-09-05**: The eleven authorized R002b
route surfaces and route-owned modules now have implementation-candidate specifications under
`docs/design/stitch/releases/ghaf-r002b/`. Each specification records its independent default-off
flag, R002a fallback, data/action authority, route/origin guard, responsive/RTL/accessibility states,
and unresolved review evidence before any route implementation. No raw R002 export, runtime file,
or release flag changed; canonical 390×844 implementation captures remain pending until each
surface exists.

**Route-safety checkpoint — 2026-09-05**: A closed R002b route/origin policy now rejects raw return
paths, arbitrary entity IDs, wrong-role or wrong-profile restoration, unauthorized Parent profiles,
and independently disabled features before any new route mounts. Focus, bounded scroll, and Gallery
filter restoration use known tokens with safe Child/Parent fallbacks. The focused 11-test route
suite and 45-file / 681-test repository suite excluding only the concurrently unfinished RevealBundle
test passed; the complete suite is required again after that isolated writer releases its files.

**Growth-presentation checkpoint — 2026-09-05**: One immutable, profile-scoped projection now joins
the canonical Seed ledger, Water and Coast Path station states, actual Mangrove archives, the exact
16-badge Gallery, approved learning unlocks, and existing assigned-task opportunities. It exposes no
writable Impact Path balance, never invents a configured next Garden stage, and fails closed on
cross-profile evidence. The focused 5-test suite, repository typecheck, exact lint/format checks, and
Git whitespace validation passed before route integration; every consuming surface remains behind
its independent default-off flag.

**RevealBundle-domain checkpoint — 2026-09-05**: A receipt-only, immutable Child presentation queue
now preserves and orders all 12 supported consequence kinds under the stable
`reveal:<profileId>:<triggerEventId>` identity, with replay protection, profile/reset isolation,
single-visible-bundle recovery, and the `ready → presenting → acknowledged → archived` lifecycle.
The focused 38-test suite, typecheck, lint, formatting, and Git whitespace validation passed. This
constructor validates every supplied receipt but cannot prove an applicable authority was omitted;
the authority-derived parity adapter remains required before RevealBundle v2 can be integrated or
its default-off flag considered for activation.

**Mangrove-learning evidence checkpoint — 2026-09-05**: A non-authoritative bilingual candidate
pack now traces three bounded lesson claims to directly opened official EAD Arabic/English and Dubai
Municipality pages. It specifies equivalent Story and concise routes, one no-fail check, stable
resource keys, zero reward consequences, offline delivery, and no autoplay. The focused 6-test
evidence suite, typecheck, exact lint/format checks, and Git whitespace validation passed. Factual,
Arabic/English, UAE cultural, safeguarding, accessibility-equivalence, and illustration-rights human
reviews remain NOT RUN, so `r002b_learning_ui` remains default-off and release activation blocked.

**Mangrove-learning resource checkpoint — 2026-09-05**: Every candidate message is now centralized
under the existing Arabic/English i18next resources and mechanically checked against the sourced
evidence pack. The focused resource and repository localization suites passed 8 tests together with
typecheck, exact lint/format checks, and Git whitespace validation. Runtime availability does not
upgrade content approval: the feature flag remains default-off and all six human review gates remain
release-blocking.

**Mangrove-learning integration checkpoint — 2026-09-05**: Profile- and reset-epoch-scoped
learning state now lives beside the Growth Journey runtime. Child-only store actions start or resume
either equal-credit route, record finite ordered progress, provide a no-fail check, and atomically
project the one idempotent completion into achievement evaluation without mutating Seeds, Garden,
canopy, League, Challenge Leaves, Family Rewards, or the existing recognition receipt. Later
recognitions retain the completion evidence needed for composite badge evaluation. Seven focused
files / 132 tests and the complete 51-file / 762-test repository suite passed with typecheck, lint,
formatting, and Git whitespace validation while the separately reserved Shared Growth boundary was
also green. The learning-engine boundary is released to `/root`; `r002b_learning_ui` remains
default-off and all content-review gates remain release-blocking.

**Shared Growth domain checkpoint — 2026-09-05**: A separate household-scoped authority now models
continued, paused, and ended participation for future anonymous signals only. Parent actions require
a supplied bounded reauthentication reference; Pause can reuse consent, while return after End
requires a distinct next-version consent recorded strictly after the matching End. State restoration
replays the consent/action lifecycle and rejects signals recorded outside an active contribution
window. The Child projection strips identity, timestamps, counts, rankings, tasks, Seeds, badges,
League, Challenge, and reward data and remains viewable in every participation state. The focused
27-test suite and complete 51-file / 764-test suite passed with typecheck, lint, formatting, and Git
whitespace validation. The domain writer's three-file boundary is released to `/root`. UI mutation
remains blocked until the existing access service supplies the required capability and
reauthentication adapter; both Shared Growth flags remain default-off.

**Parent Progress projection checkpoint — 2026-09-05**: A pure Parent-report projection now keeps
the selected Child's canonical lifetime ledger, current Mangrove stage, completed-stage archive,
16-badge state, exact criteria, and unlocked learning separate and read-only. It requires an
explicit `view_parent_reports` authority and profile allowlist, rejects profile/reset mismatches,
and recomputes Alya without retaining Salem's stage, learning, or task context. Its only task action
is a typed `prefill_only` intent into the existing Task Builder with normal Parent review/save still
required; it cannot create or assign. The focused 5-test suite, typecheck, exact lint/format checks,
and Git whitespace validation passed. Route/store authorization wiring and visual/device review
remain pending behind the default-off `r002b_parent_progress_ui` flag.

**Parent Progress access checkpoint — 2026-09-05**: The Parent onboarding controller now issues a
least-privilege `view_parent_reports` handoff for exactly one recognized synthetic Child only after
the existing completed Parent session authorizes that capability. The store converts that handoff
into the read-only projection without changing selected-Child, task, Garden, or Growth state, rejects
presentation-role forgery and unknown profiles, and loses report authority on the existing Parent
reset. Ten focused projection/access tests and repository typecheck passed. The route and visual
surface remain pending behind the default-off `r002b_parent_progress_ui` flag.

**Shared Growth access/store checkpoint — 2026-09-05**: The established access service now owns a
dedicated `manage_shared_growth_contribution` capability and single-use
`change_shared_growth_participation` reauthentication purpose. The Parent onboarding controller
keeps its private session hidden while producing a bounded, verified handoff; the store applies
Continue, Pause, and End only to the separate Shared Growth preference, requires fresh explicit
synthetic consent after End, reuses consent after Pause, and creates a new participation epoch on
Parent reset. The qualitative Child view remains available while paused or ended and contains no
identity, task, ranking, numeric, Seed, badge, or reward fields. Fifty-two focused domain/access
tests and repository typecheck passed. Both Shared Growth flags remain default-off.

**Growth Journey presentation checkpoint — 2026-09-05**: Reusable native Today path-card, Garden
chapter, Impact Path, Badge Gallery, and Badge Detail components now accept only typed presentation
data, copy, actions, locale direction, and reduced-motion state. They keep navigation, flags,
translation lookup, state mutation, and reward calculations outside the component boundary; adapt
from compact large-text layouts through wider viewports; and preserve named 48dp controls, live
status text, logical RTL rows, and tabular progress values. An incomplete recommended-badge hint now
falls back to the complete registry instead of hiding an item. The repository test and formatting
globs now collect TSX tests, and the TypeScript project includes those files. The complete suite passed
55 files / 792 tests with typecheck,
lint, formatting, and Git whitespace validation. Route mounting and implementation screenshots
remain pending; all consuming flags remain default-off.

**Growth Journey view-model checkpoint — 2026-09-05**: One pure bilingual adapter now converts the
active profile's immutable Growth projection into Today, Garden, Impact Path, exact 16-badge
Gallery, and Badge Detail presentation contracts. It keeps current Mangrove 48/60 visibly separate
from lifetime 108 and next station 120, derives every visible number from the supplied selectors,
preserves exact composite criteria, and exposes only contextual Path, unlocked-learning, or
already-assigned-task callbacks supplied by the guarded route. Candidate Arabic and English copy is
centralized and honestly marks pending human review/provenance. Eleven focused view-model and
resource-parity tests, typecheck, lint, formatting, and Git whitespace validation passed; no route
or feature flag was activated.

**R002b default-off implementation checkpoint — 2026-09-05**: The branch contains all eleven
expansion surfaces plus the private five-Leaf League compatibility surface, nine guarded nested
route files, and the gated `/league` Child root. The core checkpoint `895af72` passed 76 files / 967
tests; final hardened runtime/test checkpoint `4adcb73` passes 78 files / 989 tests. Local untracked
browser-proxy evidence includes valid
390×844 captures for Child Today, Garden chapter, Impact Path, Badge Gallery, Badge Detail, Parent
Progress, Shared Growth, and Parent Shared Garden settings, plus one R002a Parent Home regression
capture and a private League capture. The eight nonblocked expansion surfaces above now have Arabic
and English 320/360/390/430/768 matrices plus synthetic 200%-text and reduced-motion evidence with
zero document horizontal overflow. Learning Story and Accessible Learning do not have live captures
because the normal fixture truthfully stops before station 132; the combined Child Reveal has no
live capture because the task-approval path remains fail-closed until all private League, Challenge
Leaf, and Family Reward source receipts are authoritative. The private League matrix remains
partial. Commits `38ff275` and `680f91b` harden Shared Garden recovery and Reveal/Impact focus
without changing product authority. All eight flags remain off. Physical Android/TalkBack/Back/IME/
OS font scaling and every named content, privacy, provenance, and human review remain open, so
release activation stays blocked.

**Private League compatibility checkpoint — 2026-09-05**: The new presentation consumes only a
provenance-tagged `approved_synthetic_reset_summary` and sends it through the strict League privacy
projector. It invents no task history. Salem's 4/5→5/5 projection requires the exact canonical task,
Seed receipt, Mangrove receipt, canopy action/origin, and Green-event action/scope/origin. The native
screen preserves RTL Leaf order, compact/large-text reflow, safe error/empty return, the physical
`الدوري | حديقتي | اليوم` order, and the separate identities of private League, Green Circle, and
Shared Growth. Focused League/navigation coverage passes 46 tests; final hardened runtime/test
checkpoint `4adcb73` passes the complete 78-file / 989-test suite. A 390×844 Arabic capture plus Arabic
320/360/200%-text and English 390/430/768 samples are retained as local untracked evidence.

## 2026-09-05 R002a Compatibility Implementation Window

**Integration owner**: `/root`

**Worktree and branch**:
`/home/smyk/projects/Ghaf-r002-reconciliation-20260904` on
`integration/r3-r002a-implementation-20260904`, based on verified R001 evidence head `76fa682` from
`origin/integration/r3-r001-implementation-20260904`.

**Gates**:

- **R002A COMPATIBILITY SCOPE APPROVED — IMPLEMENTATION AUTHORIZED**
- **R002B PRODUCT EXPANSION — DECISIONS OPEN — IMPLEMENTATION BLOCKED**

**Purpose**: Refresh the R002 design inventory, freeze the verified behavioral baseline, and apply
the approved Soft Geometric presentation to compatibility-safe Parent, task, review, Child, and
Garden surfaces. R001 Welcome and Parent onboarding remain frozen regression baselines. The six
divergent historical commits remain unapplied, and the original worktree's untracked R002 exports
remain read-only evidence.

**Completion record — 2026-09-05**: The implementation reservations below were completed and
returned through `a0539e9`. The isolated branch contains separate characterization, Parent Home,
Parent Tasks/Builder, Child task, Parent review/support, Child follow-up, compatible Garden, and
cross-slice quality/visual commits, followed by a bounded Parent large-text containment fix.
Focused tests passed 141/141 and the full suite passed 541/541;
typecheck, lint, formatting, Expo configuration, web export, Android JavaScript export, route/reset
checks, and Git whitespace validation passed. Browser evidence covers Arabic and English plus
320, 360, 390, 430, and 768 widths. Physical Android is `BLOCKED` because no ADB device is listed
and no Android SDK is configured in this environment; named human reviews remain `NOT RUN`. All
temporary reservations are released by the release-documentation commit; the historical table is
kept as an audit of the completed file boundaries.

| Exclusive writer                                                          | Exact reserved boundary                                                                                                                                                                                                                                               | Handoff condition                                                                                                                                                                           |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/root/r002a_orchestrator` and delegated documentation writers            | `PRODUCT.md`, `PROTOTYPE_LIMITATIONS.md`, `DESIGN.md`, `DEMO_RUNBOOK.md`, `specs/003-family-growth-garden/{spec.md,contracts/acceptance-contract.md,design-intake/release-gate.md}`, and newly tracked R002a intake metadata/specifications only                      | Record the split gates and compatibility authority without changing product semantics or importing raw exports; return files for integration review                                         |
| `/root/r002a_orchestrator/r002_inventory` — read-only intake audit        | Original untracked `docs/design/stitch/releases/ghaf-r002/**` only                                                                                                                                                                                                    | Return objective counts, dimensions, hashes, titles, viewport metadata, and candidate classifications; make no file changes                                                                 |
| `/root/r002a_orchestrator/parent_architecture` — read-only behavior audit | `app/parent/**`, relevant components, state, services, and tests                                                                                                                                                                                                      | Identify every existing Parent Home capability and selector without changing files                                                                                                          |
| `/root` — specification integration and commits                           | `AGENTS.md`, `README.md`, `CODEX_IMPLEMENTATION_PROMPT.md`, `docs/README.md`, Growth-only prompt/content records, `TEAM_OWNERSHIP.md`, Feature 003 `plan.md`, `tasks.md`, readiness checklists, historical gate notices, exact staging, validation, and local commits | Keep R002a and R002b gates independent, serialize shared files, validate each slice, and never push without separate authorization                                                          |
| Future R002a characterization writer                                      | New `tests/r002a-behavior-characterization.test.ts` only                                                                                                                                                                                                              | Freeze task ID, zero-reward submission, approval consequences/idempotency, retry, League, canopy, Family Reward, access, voice, reset, and profile-isolation behavior before visual changes |
| Future Parent Home UI writer                                              | `app/parent/index.tsx`, new `src/components/r002a/parent/**`, and new `tests/r002a-parent-home.test.ts` only                                                                                                                                                          | Recompose `/parent` from live selectors, preserve every reachable behavior, and omit unsupported screenshot-only values rather than hard-code them                                          |

Shared runtime files such as `app/_layout.tsx`, `src/i18n/resources.ts`, and
`src/design/tokens.ts` remain reserved to `/root`. No worker may edit R001 routes, dependencies,
fixtures, services, models, state, raw exports, or another worker's boundary. R002b Impact Path,
badges, learning, Parent Progress, Shared Growth changes, combined RevealBundle changes, and
cumulative progression remain blocked.

## 2026-09-04 Revision 3 and R001 Documentation Reconciliation Window

**Integration owner**: `/root`

**Worktree and branch**:
`/home/smyk/projects/Ghaf-r002-reconciliation-20260904` on
`integration/r3-r001-implementation-20260904`, based on documentation checkpoint `b9f01ef2` and
behavioral baseline `a6ca21a6`.

**Purpose**: Reconcile the current user-authoritative Revision 3 product baseline and the approved
R001 Parent-onboarding partial release into the remote-head canonical documentation before any new
runtime work. The remote access, private five-Leaf League, Family Reward, synthetic voice,
privacy/profile isolation, and Parent-authorized reset implementation remains behavioral evidence
that must be preserved rather than overwritten by the six divergent local commits.

**Historical gate, superseded on 2026-09-05**: this window blocked all R002 runtime work and did not
approve an export, post-R001 route, component, asset, dependency, test, or runtime change. The
current independent gates are recorded in the R002a window above.

| Exclusive writer                                                                                                 | Exact reserved boundary                                                                                                                                                                                                                                                                                                                                                                                         | Handoff condition                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/root/r3_preflight` — orchestration and ownership record — **released**                                         | `TEAM_OWNERSHIP.md` only                                                                                                                                                                                                                                                                                                                                                                                        | Recorded the documentation, domain, store, and UI-foundation handoffs; released the file to the integration owner before font/configuration and route integration                                                                                                                               |
| `/root/r3_preflight/r3_product_reconcile` — product/specification reconciliation                                 | `AGENTS.md`, `PRODUCT.md`, `RESEARCH_BASIS.md`, `DESIGN.md`, `DESIGN_DIRECTION.md`, `PROTOTYPE_LIMITATIONS.md`, `README.md`, `CODEX_IMPLEMENTATION_PROMPT.md`, `DEMO_RUNBOOK.md`, `docs/README.md`, `docs/GHAF_GROWTH_JOURNEY_PROMPT_PACK/**`, `docs/content/**`, `docs/architecture/adr/0002-impact-path-projection.md`, and `specs/003-family-growth-garden/**` except `design-intake/revision-3-proposal/**` | Reconcile with targeted patches against the remote baseline; preserve implementation/test facts; keep R001 narrow and later runtime blocked; return exact changed files and validation evidence without committing                                                                              |
| `/root/r3_preflight/r001_access_domain` — tests-first Parent-onboarding controller — **released after QA fixes** | `src/features/access/index.ts`, `src/features/access/parentOnboarding/**`, and new focused test file `tests/parent-onboarding-controller.test.ts`; preserve the integration owner's required service-contract/model layering edits                                                                                                                                                                              | Prove an old session generation and its reauthentication proofs remain invalid after terminate-and-reuse; preserve unrelated sessions/proofs and rerun access/voice/League/Reward/reset regressions; no store, route, UI, registry, config, documentation, or commit                            |
| `/root/r3_preflight/r001_ui_foundation` — R001 native design foundation — **released after integration review**  | `src/design/tokens.ts`, `src/components/primitives.tsx`, `src/components/access/**`, and new focused test file `tests/r001-design-foundation.test.ts` only                                                                                                                                                                                                                                                      | Reconcile reusable R001 tokens, Alexandria/Readex role names, native RTL/LTR primitives and controls, responsive access shell, botanical/icon components, and reduced-motion-aware success sheet; no routes, state, services, registry, i18n resources, package/config, assets, docs, or commit |
| `/root` — R001 integration, routes, and commits                                                                  | `package.json`, `package-lock.json`, `app.config.ts`, `app/_layout.tsx`, `app/index.tsx`, `app/role.tsx`, `app/access/parent/**`, `app/parent/_layout.tsx`, `src/i18n/**`, the service registry, `src/state/usePrototypeStore.ts`, `tests/operator-demo-flow.test.ts`, `tests/r001-onboarding-flow.test.ts`, `tests/parent-onboarding-store.test.ts`, staged-file review, and final commits                     | Install/load the approved fonts, integrate guarded onboarding authority and the seven R001 compositions, preserve the ten remote routes and later-screen gate, run the complete R001 validation, and create only cohesive commits after each GREEN boundary                                     |

No product/specification writer in this window may edit `app/**`, `src/**`, `tests/**`, `assets/**`,
`package.json`, `package-lock.json`, `app.config.ts`, generated output, the untracked R002 directory
in the original worktree, or remote state. The access/domain reservation above is the sole scoped
exception and remains excluded from the documentation commit. The six local-only commits remain
candidate evidence and must not be cherry-picked. All writers must preserve concurrent work and may
not revert another writer's changes.

### Documentation checkpoint handoff

The product/specification reconciliation boundary and `TEAM_OWNERSHIP.md` orchestration boundary
were released to `/root` after the documentation handoff. The checkpoint modifies only canonical
documentation and adds the approved R001 release gate plus non-runtime Growth Journey planning and
content artifacts. Its validation passed Markdown formatting, internal relative-link resolution,
unique task IDs `T001`–`T158`, the exact 16-badge registry, R001 seven-screen inventory and authority
markers, `git diff --check`, preservation of the Revision 3 proposal package, and confirmation that
all six divergent local commits remain unapplied. The access/domain worker above remains separately
reserved, and the UI foundation worker begins only after this documentation commit. Their disjoint
source/test changes must enter separate implementation commits after integration review.

### R001 implementation integration boundary

`/root` exclusively owns `package.json`, `package-lock.json`, `app.config.ts`, `app/**`,
`src/i18n/**`, the service registry, store integration, route guards, and final commits. The UI
foundation worker may define the approved font-family roles but must not install or load font
packages; the integration owner performs that serialized dependency/configuration step while
preserving `expo-audio`. Neither implementation worker may touch R001/R002 design exports or begin a
post-R001 route.

#### R001 access/domain handoff

The access/domain boundary was released to `/root` after adding a private
`ParentOnboardingController`, safe onboarding model/policy projections, and the narrow
identity-validated `terminateParentSession` operation. The focused access/onboarding suite passed 43
tests; the broader access, voice, League, Family Reward, prototype-state, and reset batch passed 149
tests. Typecheck and lint passed before the concurrent UI RED test was added; lint, targeted
formatting, and `git diff --check` passed after the final expired-session cleanup. The full suite's
only four failures were the integration owner's intentionally RED R001 route/resource/layout tests,
not domain regressions. No file was staged or committed by the worker.

The boundary was re-opened after independent read-only QA found two commit-blocking lifecycle gaps:
deterministic ID reuse could make an old session object match a new stored generation, and
unconsumed reauthentication proofs could survive termination into that reused generation. The
worker owns tests-first generation binding and proof cleanup while preserving the integration
owner's required `SyntheticAccessService` termination contract change.

The re-opened boundary was released after the three lifecycle tests went RED then GREEN. Session
resolution now binds to the immutable issued/expiry generation, termination removes only proofs
belonging to that exact Parent session identity, unrelated sessions/proofs remain valid, and
controller cleanup surfaces a termination failure. The final focused eight-file regression batch
passed 152 tests; targeted ESLint, Prettier, and `git diff --check` passed. Global type/lint checks
were deferred only while the concurrent UI worker's import graph was incomplete.

#### R001 store integration checkpoint

The integration owner added the safe onboarding projection/actions to
`src/state/usePrototypeStore.ts` with focused coverage in
`tests/parent-onboarding-store.test.ts`. The test was RED 4/4 before the integration and GREEN 4/4
afterward. The store owns one controller backed by the existing shared access registry, never
exposes the raw Parent session, changes locale and legacy role only after successful capability
completion, preserves household/Child fixtures, and invalidates onboarding authority during the
existing Parent-gated reset. Final R001-A validation and commit were held until the re-opened
session-generation/proof fixes passed the 152-test regression batch recorded in the access/domain
handoff. This store boundary is now ready for the integration owner's final R001-A validation.

#### R001 design-foundation handoff

The UI boundary was released after adding scoped R001 palette, typography, radii, shadow, motion,
logical RTL/bidi helpers, controlled native access controls, a responsive safe-area/scroll/keyboard
shell, code-native icons and botanical avatars, and the reduced-motion-aware success surface. The
integration review restored every legacy palette, radius, shadow, motion, Card, and unbranded
primitive value so the preserved ten-route UI is not redesigned by this release; a focused
regression test now locks that boundary. The botanical picker uses the authoritative underscore
`ChildTreeAvatarId` values and maps them internally to icon names.

The final five-file focused batch passed 43 tests across the R001 foundation, existing bilingual
typography, localization, accessibility, and access suites. Global typecheck, repository lint and
format checks, targeted no-cache ESLint, and `git diff --check` passed after mechanically formatting
the final avatar focus-state fix. Independent read-only QA found no remaining functional commit
blocker. No file was staged or committed by either worker. Route composition screenshots, physical
Android, TalkBack, 200% font scale, and success-sheet focus restoration remain `NOT RUN` until the
integration owner completes R001 routes. The integration owner retains exclusive ownership of the
Expo-compatible font packages/configuration, root font loader, transparent success route, Android
Back behavior, and focus restoration.

### R001-C route integration reservation and handoff

`/root` reserved the shared navigation and route-test boundary. Two disjoint route writers owned
Welcome through verification and family setup through success, while `/root/r001_routes` performed
read-only integration QA. The writers preserved the remote behavioral baseline and did not touch
R002, later Revision 2/Growth screens, the shared store, services, dependencies, or canonical
product authority.

The route writers released all seven R001 route files to `/root` after TypeScript, targeted ESLint,
targeted Prettier, Git whitespace validation, and 88 focused onboarding, access, and operator-flow
tests passed. `/root` now owns their integration, reference comparison, responsive and
accessibility checks, complete repository validation, and final cohesive commits. Physical Android,
TalkBack, native keyboard/IME, and native font-scale evidence remain separate gates and may not be
inferred from browser or source checks.

#### R001 final validation and evidence handoff — 2026-09-05

The integration owner completed R001-C in `4b47394` and reduced the direct font bundle to the
approved weights in `f4451c1`. The final focused audit passed 79/79 tests, and the complete suite
passed 29 files / 482 tests. Typecheck, lint, maintained-file formatting, Expo dependency checks,
Expo Doctor 21/21, public Expo config, web and Android JavaScript exports, the exact 16-product-route
inventory, and Git whitespace validation passed.

All seven Arabic R001 surfaces passed scoped composition comparison against their canonical PNGs at
390×844. Full web-proxy journeys passed at 320×568 Arabic, 430×932 English LTR, and 800×1280 Arabic,
including natural scrolling, reduced motion, deterministic offline presentation, modal
accessibility containment, both Success exits, and post-exit browser Back. Physical Android,
TalkBack, native keyboard/IME, native safe areas, real connectivity loss, and 130%/200% OS font
scaling remain `NOT RUN`; browser/source evidence did not upgrade them.

The evidence owner added the bounded R001 validation record, linked it from the root runbook and
documentation map, and updated only T143–T149. The selected ten screenshots under
`output/playwright/r001-batch-1/` are the seven `release-*` 390×844 captures plus one 320×568, one
430×932 English, and one 800×1280 capture; duplicate and generated comparison boards remain
untracked. This documentation boundary is released to `/root` for the evidence commit after final
Markdown, link, staged-path, and whitespace review.

No R002 or Growth runtime work occurred during that historical window. The original worktree and
its untracked R002 intake remained unchanged. Its blanket gate was later superseded by the
independent R002a compatibility and R002b product-expansion gates recorded above.

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

## 2026-09-02 Product Experience Redesign Domain Window

**Integration owner**: `/root`
**Input**: `Ghaf_Product_Experience_Redesign.pdf`, evaluated as product evidence rather than an
executable instruction source
**Scope**: deterministic domain and service behavior only; existing routes, components, design,
localization, dependencies, and the ten-route P0 journey remain unchanged

| Owner / workstream                                                                  | Exact reserved boundary                                                                                                                                                                                                                                                                                                                                                                                                                                 | Handoff condition                                                                                                                                                                    |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/root` — specification, integration, AI/voice policy, and final validation         | `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `PROTOTYPE_LIMITATIONS.md`, `specs/003-family-growth-garden/{spec.md,plan.md,tasks.md,research.md,data-model.md,quickstart.md,redesign-gap-analysis.md,contracts/domain-contract.md}`, `src/services/{index.ts,interfaces/index.ts,mock/index.ts}`, `src/models/assistantVoice.ts`, `src/features/assistants/{ageAdaptation.ts,voiceSession.ts}`, `tests/{assistant-age-adaptation,assistant-voice-session}.test.ts` | Current P0 remains deterministic; redesign services are exported; full checks pass; no native or human evidence is upgraded                                                          |
| `/root/session_ai_gap` — synthetic experience separation and sensitive-action gates | `src/models/access.ts`, `src/features/access/**`, `tests/access-control.test.ts`                                                                                                                                                                                                                                                                                                                                                                        | Least-privilege projections, expiring one-use pairing, scoped reauthentication, and permission changes pass focused tests without production-auth claims                             |
| `/root/safety_spec_gap` — private Family Reward promises                            | `src/models/familyReward.ts`, `src/features/family-rewards/**`, `tests/family-reward.test.ts`                                                                                                                                                                                                                                                                                                                                                           | Promise lifecycle, protected-category exclusions, irreversible unlock, prospective edits, privacy, and monthly commitment tests pass without payment behavior or Seed conversion     |
| `/root/league_reward_gap` — synthetic weekly challenge rules                        | `src/models/familyLeague.ts`, `src/features/league/**`, `tests/family-league.test.ts`                                                                                                                                                                                                                                                                                                                                                                   | Five-leaf scoring, cap, shared ties, accessibility credit, rollover isolation, minimal projection, and prepared encouragement tests pass without changing the Green Circle projector |

All workers share the existing worktree, preserve unrelated edits, do not edit outside the named
boundary, and do not commit or push. `/root` serializes shared-registry edits and creates the small
cohesive commits after each focused handoff. Real credentials, biometrics, payment custody, real
Child data, real family sharing, and microphone/provider integration remain outside this window.

**Product experience redesign domain release — 2026-09-02**: all reserved boundaries are released
to `/root`. The six phased checkpoints are recorded in commits `eefc435`, `cd86631`, `e8e0630`,
`4e4d5ca`, `acfc02b`, `0f46eb3`, `533d74a`, `978257a`, and `44f5077`. The settled domain code adds
only deterministic access, private Family Reward, synthetic Family League, age-adaptation, and
synthetic voice contracts; no `app/**` file or authored route changed.

| Final evidence                    | Result                                                                                                                                                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Focused redesign suites           | **PASSED** — 5 files / 95 tests                                                                                                                                                                                    |
| Full static and behavioral checks | **PASSED** — typecheck, lint, format check, 23 files / 407 tests, and `git diff --check`                                                                                                                           |
| Route/P0 preservation             | **PASSED** — exactly 10 authored routes; zero `app/**` diff; the existing Zustand P0 aggregate and Green Circle projector remain separate                                                                          |
| Source boundary scan              | **PASSED** — no added block comments in TypeScript and no added network, secret, microphone, audio-capture, speech-provider, or biometric path                                                                     |
| Independent review                | `/root/session_ai_gap`, `/root/league_reward_gap`, and `/root/safety_spec_gap` found no remaining P0–P3 implementation defect after final corrections                                                              |
| Deferred evidence                 | Frontend redesign, physical Android, real microphone/provider behavior, production identity/invitation/payment/persistence, and named Arabic/UAE/safeguarding/accessibility review are **NOT RUN** or out of scope |
| Integration readiness             | **Ready for the domain-only branch checkpoint**; not ready to claim frontend, native-demo, production-security, or human-review acceptance                                                                         |

The Family Reward facade deliberately accepts strict Parent-authorized candidate event fixtures in
this local domain phase. A later frontend phase must derive those events from the authoritative
confirmation/Garden store. Registry recreation or reload may clear all new process-local ledgers;
this is not production persistence. No external security issue records were created because this
was not a sealed Codex Security scan and no issue destination was provided.

## 2026-09-02 Child Voice and Bilingual Typography Integration Window

**Integration owner**: `/root`
**Read-only reviewers**: `/root/child_voice_path`, `/root/typography_audit`, and
`/root/ui_test_audit`
**Scope**: authorize and implement one in-route, prepared-only Child voice rehearsal plus the
existing system-font bilingual typography refinement; no route, dependency, microphone, speech
provider, network service, or production identity is added

| Owner / workstream                                                                                         | Exact reserved boundary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Handoff condition                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/root` — specification, application adapter, Parent grant, Child presentation, typography, and validation | `TEAM_OWNERSHIP.md`, `DESIGN.md`, `PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`, `specs/003-family-growth-garden/{spec.md,plan.md,tasks.md,contracts/acceptance-contract.md,checklists/story-evidence.md,checklists/web-proxy.md}`, `src/design/tokens.ts`, `src/components/{primitives.tsx,LanguageSwitcher.tsx}`, `src/components/family-growth/{TaskPanels.tsx,ParentVoicePermissionPanel.tsx,SyntheticVoicePanel.tsx}`, `src/features/assistants/childVoiceController.ts`, `src/state/usePrototypeStore.ts`, `src/i18n/resources.ts`, `app/{child/task.tsx,parent/task/review.tsx}`, and `tests/{bilingual-typography,child-ai-presentation,child-task-flow}.test.ts` | Parent enablement is explicit and service-authorized; the Child receives age-adapted prepared Coach output and a fully labeled synthetic transcript rehearsal; both scripts use the shared typography resolver; focused/full checks pass; native and named-human evidence stays truthful |

The reviewers are read-only and hold no file boundary. All changes remain inside the exact reserved
files, preserve the ten-route journey and P0 counters, and are committed by `/root` as small,
validated slices. Real Child audio, camera or microphone permission, speech recognition, biometric
inference, live Child AI, and background capture remain prohibited.

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
