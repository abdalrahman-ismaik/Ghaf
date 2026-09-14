# Maintainer audit — 2026-09-11

Starting revision: `07f484c`, clean `main`. Changes remain uncommitted. No live
provider, microphone, external account, payment, message, or deployment is used.

The repository is one Expo 57 / React Native 0.86 application with React 19,
Expo Router, strict TypeScript, Zustand state, Zod validation and Vitest. Routes
delegate to feature policies, the shared store and a service registry. Persistence
is device-local; optional Worker/MCP/AI boundaries remain separate and gated.
Package scripts provide typecheck, lint, formatting, tests and web export; no tracked
CI workflow was found. Manifests, lockfile, configuration and dependencies are unchanged.

## Execution plan

1. Read project contracts, map workflow ownership, and establish existing-check baselines.
2. Trace accepted requirements through policies, store/services, routes, and tests.
3. Reproduce confirmed defects with synthetic regressions; make small bounded fixes.
4. Run focused checks, full static/tests/build checks, and available local browser smoke tests.
5. Review changed boundaries independently and record remaining requirements/evidence gaps.

## Coverage map

| Area                                                      | Requirement authority                                      | Inspection and exercise                                                                                                                               | Status                                                                                                    |
| --------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Parent/Child access and remembered devices                | Feature 005 spec/tasks; Feature 003 access contract        | Controllers, bootstrap, affinity storage, opt-in/out, pairing, handoff/cancel, revocation and route guards; focused synthetic suites                  | Implemented within prototype scope; native restart/SQLite unverified                                      |
| Family directory and reset                                | Feature 003 FR-196–200; Feature 005 persistence contract   | Schema, migration, save/clear ordering, failure/retry, configured identity, corrupt-state routing                                                     | Reset defect repaired; corrupted-directory recovery decision blocked                                      |
| Task, confirmation, Seeds, Garden, League, Family Rewards | Feature 003 product/domain contracts                       | Composer, lifecycle, recognition transaction, immutable receipts, secondary-authority parity, privacy projections and focused suites                  | Complete for the single approved P0 task; no new core defect confirmed                                    |
| Impact Path, badges, learning, reveal                     | Feature 003 R002b contract; independent default-off flags  | Lifetime evidence, deterministic awards, finite accessible learning/replay, reveal authority, Shared Growth consent/action windows                    | Implemented candidates; historical participation defect repaired; release/content gates remain blocked    |
| Prepared/live AI and voice lifecycle                      | Feature 004 spec/contracts/tasks                           | Copy mapping, request/output schemas, grants, deadlines, native port/installed SDK, transient cleanup, Worker/MCP contract source, synthetic services | Implemented with lifecycle/cap and configured-age repairs; physical/provider/broker acceptance unverified |
| Navigation, forms, bilingual UI, startup                  | Feature 003/005 routes and acceptance criteria             | Four actual routes rendered in both languages; browser setup, identity, pairing/Back, remembered access, handoff/cancel and reset                     | Configured identity and Back repaired; listed web flows verified; native interaction unverified           |
| Configuration, commands, documentation, build             | README, CONTRIBUTING, manifests/config, acceptance ledgers | Root scripts, lockfile/dependency inventory, TypeScript/ESLint/Vitest/Expo config, environment example, docs; no tracked CI workflow found            | Stale README corrected; final static, tests and web/Android exports passed                                |

## Findings worklist

### A-PERSIST-01 — medium — verified

Feature 003 FR-196/199/200 requires current directory/pairing authority to survive a
failed reset until reset succeeds. `src/services/local/repository.ts` removed v2
before its v1 migration source. If legacy deletion failed, restart could restore
an older family and pairing marker. Legacy-first deletion now preserves the current
record on either failure. `tests/local-family-repository.test.ts` reproduced the
stale record RED (1 failed/12 passed), then verified both deletion failures and retry.

### AI-01 — medium — verified

Feature 004 FR-026 requires pending results to be invalidated by grant expiry or
age-policy changes. `requestLiveChildCoach` in `src/state/usePrototypeStore.ts`
checked grant versions but not current time or age. It now revalidates both and
clears only its owned stale request, preserving newer results and all progression.
`tests/live-child-coach-store.test.ts` reproduced two failures before the fix.

### AI-02 — medium — verified with native acceptance limits

The installed Expo Android recorder resets `currentTime` in `stopRecording()`.
`src/services/native/ExpoVoiceCaptureService.ts` read it afterward, rejecting valid
manual stops; NaN also escaped the original duration condition. The adapter now
uses validated native stop URL/duration when returned, or a finite pre-stop duration
for platforms returning no status. Resolved Android failure statuses cannot become
successful captures. Failed file deletion retains the URI and blocks another capture
until cancellation verifies cleanup. `tests/live-voice-services.test.ts` produced
three initial RED cases and five follow-up RED cases; that focused checkpoint passed
28 cases. No native recording was performed. Automatic cap handling follows below.

### AI-03 — medium — verified

Feature 004 FR-002/005/040 requires local validation, prepared fallback and recoverable
failure. `stopLiveVoiceHold` accepted an `ok` transcription before schema/correlation
validation, then could remain `transcribing` after rejecting it and deleting audio.
It now validates primary and prepared responses before selection, preserves
same-attempt fallback, and settles a bad fallback without displaying content.
`tests/live-voice-integration.test.tsx` reproduced malformed/correlation failures RED
and covers fallback cancellation/replacement and invalid-fallback cleanup.

### AI-04 — medium — verified

The same voice store returned stop failures without leaving `recording_held`, and
used authorization validity to decide whether its own cleanup could settle. Expiry
before release could even prevent stopping the recorder. Cleanup now depends on
exact operation ownership; permission remains required for transcription/fallback
and content acceptance. The store settles verified `deleted` or truthful `failed`,
retains failed file references and preserves newer operations. Regressions exposed
three stop-failure cases, eight pending-expiry cases and one expiry-before-release
case. The final voice integration suite passed 37 tests.

### AI-05 — medium — verified with native acceptance limits

Android's automatic duration cap resets recorder timing and emits a completion event
without duration. A later release therefore rejected the completed clip. The new
adapter path observes terminal completion, verifies its successful status and exact
recorder URI, and reads the file's actual duration through the installed Expo audio
player without playback. Completion and metadata waits are bounded at two seconds
each. Cancellation invalidates the operation, ends active waits and removes late
players/listeners; invalid duration or metadata still deletes the file and fails
closed. No duration is fabricated, no dependency is added, and all live flags remain
off. The initial auto-stop regression failed before the fix; additional synthetic
cases cover failure, mismatch, timeout, cancellation and replacement. The focused
native suite passed 45 cases (17 added to the previous checkpoint). Independent
source review passed; physical Android metadata/timing acceptance is not established.

### SG-01 — medium — verified

Feature 003 FR-155 makes participation changes prospective. In
`src/features/shared-growth/sharedGrowth.ts`, a backdated or equal-time Pause/End
could retain a contribution that the resulting preference made invalid, breaking
subsequent operations. The transition now applies the existing historical-window
invariant before committing. Four RED cases in `tests/r002b-shared-growth.test.ts`
prove the problem; GREEN also covers unchanged input, valid retry, fresh consent,
future contributions and reset.

### UI-01 — medium — verified

Feature 003 FR-197 requires configured display identity. Child PIN/pairing and Parent
device/permission routes still displayed fixture names; PIN/pairing also used fixture
avatars. The four routes now read the configured profile with the existing fixture
fallback, preserving identifiers, credentials and policy. The new
`tests/configured-child-identity-ui.test.tsx` renders actual routes with mocked native
primitives and real bilingual resources. RED: 17 failed/4 passed; GREEN: 21 passed.
An old-export browser run independently reproduced `Salem permissions` after creating
the synthetic `Palm One` profile. Final-build browser testing confirms configured
names in Arabic/English permissions, Arabic PIN/pairing, and pending/approved device
requests. Parent approval and the handoff to Child Today also succeed.

### UI-02 — medium — verified

Browser testing found that entering the correct PIN, choosing Back from pairing,
then entering the same PIN again produced an invalid-credential message. The route
only navigated, leaving the controller in `credential_verified`, while credential
verification requires `profile_selected`. The route now invokes the existing
profile-selection transition and navigates only if it succeeds. The three actual
route/controller tests in `tests/child-pairing-back.test.tsx` failed before the fix
and now pass: verified/PIN re-entry, pending-request cancellation/re-entry, and
rejected Back preserving an authenticated Child without navigation.
The rebuilt app also passed the exact original browser reproduction: correct PIN,
pairing, header Back, the same correct PIN, and a new usable pairing screen.

### DOC-01 — low — fixed

`README.md` named an obsolete integration branch, repeated an old 1,002-test snapshot
as current and claimed Reveal lacked receipts already verified in the accepted
2026-09-07 evidence. It now points to `main`, identifies Features 004/005 and links this
dated audit while preserving native/content/release gates. Historical ledgers remain
unchanged.

## Verification

### Initial checks and focused regressions

- `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run format:check`: **PASSED**.
- Initial `npm.cmd test -- --maxWorkers=2`: **FAILED**, 3 failed/122 passed files;
  3 failed/1,551 passed tests. This run overlapped addition of the repository RED test,
  so its 1,554-case count is not treated as a pristine baseline. One failure is that
  deliberate regression; two were cold configuration/ESLint timeouts under concurrent
  work, without assertion failures.
- Unchanged isolated rerun
  `npm.cmd test -- --run --maxWorkers=1 tests/official-brand-platform.test.ts tests/comment-style-lint.test.ts`:
  **PASSED**, 2 files/23 tests. No timeout, assertion, or check was weakened.
- Initial `EXPO_OFFLINE=1 npm.cmd run build:web`: **PASSED**, 39 static routes.
- `npm.cmd ls --depth=0 --offline`: **PASSED**.
- `EXPO_OFFLINE=1 npx.cmd --no-install expo install --check`: exited successfully,
  reporting dependencies current **with its explicit unreliable-offline-validation warning**.
  Online registry alignment was not rerun; this is not an online compatibility pass.
- `npx.cmd vitest run tests/local-family-repository.test.ts tests/device-remembered-access.test.tsx tests/r003-store-access-flow.test.ts --maxWorkers=1`:
  **PASSED**, 3 files/62 tests.
- `npm test -- --run tests/parent-check-in-flow.test.ts tests/reward-matrix.test.ts tests/family-league.test.ts tests/family-reward.test.ts tests/privacy-projection.test.ts tests/r002b-learning-reveal-integration.test.ts tests/r002b-progression-store.test.ts`:
  **PASSED**, 7 files/112 tests.
- `npm test -- --run --maxWorkers=1 tests/r002b-shared-growth.test.ts tests/r002b-shared-growth-store.test.ts tests/r002b-shared-growth-route-integration.test.ts`:
  **PASSED**, 3 files/42 tests.
- `npx.cmd vitest run tests/configured-child-identity-ui.test.tsx tests/device-remembered-access.test.tsx tests/r003-store-access-flow.test.ts tests/r003-child-access-controller.test.ts --maxWorkers=1`:
  **PASSED**, 4 files/76 tests.
- `npm test -- --run tests/live-child-coach-store.test.ts tests/live-voice-integration.test.tsx`:
  **PASSED**, 2 files/30 tests at the initial Coach-fix checkpoint.
- `npm test -- --run tests/live-voice-services.test.ts tests/live-voice-integration.test.tsx --maxWorkers=1`:
  **PASSED**, 2 files/56 tests at the native-stop checkpoint.
- Latest `npm test -- --run tests/live-voice-integration.test.tsx --maxWorkers=1`:
  **PASSED**, 37 tests after expiry cleanup corrections.
- `npm test -- --run tests/child-pairing-back.test.tsx tests/configured-child-identity-ui.test.tsx --maxWorkers=1`:
  **PASSED**, 2 files/24 tests after the pairing Back correction.
- Focused `tests/live-voice-services.test.ts` run: **PASSED**, 45 tests including
  automatic completion and metadata cleanup (worker-reported evidence).
- A subsequent typecheck caught an inferred `never` return type in the new pairing
  test helper. An explicit callback return type fixed the test-only issue;
  `npm run typecheck` and the 3 pairing regressions then **PASSED**. Runtime behavior
  and assertions were unchanged.
- Scoped ESLint with zero warnings, Prettier and `git diff --check`: **PASSED** for
  each completed slice. Independent cross-reviews covered the reset, Shared Growth,
  request ownership and native stop/fallback changes; follow-up findings were fixed.

### Final checks

After the initial runtime fixes, `npm.cmd run typecheck`, `npm.cmd run lint`, and
`npm.cmd run format:check` all **PASSED**. Final-source `npm run typecheck` also
**PASSED** after the native and Back follow-ups. Final-source
`EXPO_OFFLINE=1 npm.cmd run build:web -- --max-workers 2` **PASSED**, exporting
39 routes.

- `npm.cmd test -- --maxWorkers=1`: **PASSED**, 127 files / 1,631 tests.
- Final `npm.cmd run lint` and `npm.cmd run format:check`: **PASSED**.
- `EXPO_OFFLINE=1 npx.cmd --no-install expo export --platform android --output-dir .expo/maintainer-android-final --max-workers 2`:
  **PASSED**, one Android Hermes JavaScript bundle and metadata. This is compilation,
  not a native-device test.
- `git diff --check`: **PASSED**. Final diff review found no weakened existing
  assertions, dependency/lockfile/configuration changes, debug code or tracked build
  output. All optional feature flags remain unchanged/default-off.

### Browser smoke evidence

The exported app was served only on `127.0.0.1:8093`, using a fresh isolated Chromium
profile and synthetic `Audit Palm Family`, `Palm One`, and `Palm Two` inputs.
Trusted browser input exercised the rendered interface without injecting application
state. Native tooling/Playwright launcher caches were unavailable, so the installed
Chromium headless shell was controlled through its local CDP connection.

Observed at 390 × 844:

- Setup, explicit Parent remember opt-in, and a fresh document restoring the Parent.
- Configured permissions in English and Arabic; configured Arabic PIN and pairing.
- Correct PIN, pairing request, Parent approval, completion and Child Today.
- Temporary Parent entry cancellation returning to the same Child; verification with
  no Remember option; paired-device identity; Parent sign-out returning to that Child.
- Fresh document restoring the paired Child; reset cancellation preserving settings;
  confirmed reset returning to signed-out Arabic RTL Welcome with no Child profiles;
  another fresh document remaining signed out in Arabic.

Before the final Back-fix replay, 82 recorded action snapshots covered 12 local routes
without document overflow. All 271 observed network responses while connected were
HTTP 200 from the local server; no loading failure or nonlocal response was observed.
Three fresh documents logged React's recovered error #419. The installed React source
and unfinished exported Suspense marker identify static-render-to-client recovery;
subsequent controls and routing worked. This warning is recorded, not claimed absent.

Screenshots are in `output/playwright/maintainer-audit/`: the baseline permission-name
defect and final permissions (English/Arabic), Child PIN/pairing (Arabic), pending and
paired devices (Arabic), and reset (Arabic). They contain only synthetic data. Browser
evidence does not establish native RTL, Back/IME, TalkBack, microphone, or persistence
behavior on a physical Android device.

The final export's original pairing Back reproduction **PASSED** using a fresh
synthetic `Replay Palm` profile. `final-pair-back-retry-success-ar.png` records the
usable pairing screen after entering the same correct PIN twice with Back between
attempts; the observed document again had no horizontal overflow.
The pending-request branch also **PASSED**: request, Back, the same PIN and a new
usable request. `final-pair-pending-back-retry-ar.png` records that result. The final
replay captured 26 snapshots across four routes and 83 local HTTP 200 responses,
with no observed loading failure/nonlocal response and one recovered #419 on fresh
document entry. The owned Chromium process was closed after evidence capture.

## Configured age follow-up — 2026-09-11

The owner selected configured age as the policy authority while preserving the
underlying demo fixtures. The starting tree retained every uncommitted audit fix;
the preceding 127-file / 1,631-test pass is the baseline, not this follow-up's result.

The implementation uses one validated, fail-closed directory age selector; prepared
Coach requests now support the existing three reviewed bands; store and UI callers
share that authority. Voice remains separately granted and default-off. A prepared
output's zero quick-choice limit no longer removes its curated action controls.

- UI RED: 13 failed / 8 passed before the route changes.
- UI GREEN:
  `npx.cmd vitest run tests/configured-child-age-ui.test.tsx tests/configured-child-identity-ui.test.tsx tests/live-child-coach-ui.test.tsx tests/live-voice-ui.test.tsx --maxWorkers=1`:
  **PASSED**, 4 files / 49 tests. These render actual routes/panels using mocked native
  primitives, real bilingual resources, validated directories and real age adaptation.
- Prepared-schema RED: 1 failed / 79 passed before accepting configured age bands.
- Configured-age store RED: 4 failed / 11 passed before correcting fixture-age requests,
  stale prepared output and missing-directory authorization.
- Additional RED: one prepared 6–8 template-text rejection and one live 6–8 text-input
  rejection failed before their bounded policy corrections.
- Core GREEN:
  `npm.cmd test -- --run tests/configured-child-age-policy.test.ts tests/assistant-safety.test.ts tests/live-child-ai-grants.test.ts tests/live-child-coach-store.test.ts tests/live-voice-integration.test.tsx tests/bounded-ai-integration.test.tsx --maxWorkers=1`:
  **PASSED**, 6 files / 161 tests. Coverage includes all bands, missing/invalid directory,
  sibling isolation, prepared/live pending changes, voice grant denial/revocation,
  age-downgrade audio cleanup, and unchanged synthetic fixture ages.
- Independent source review approved the core changes and identified a Parent UI
  revocation gap after age downgrade. Ten UI regressions failed before correction;
  the same four-file UI command then **PASSED 64 tests**. Known grants remain revocable
  after downgrade or missing age; no new grant can be enabled from an unknown age,
  and the text/voice flag gates remain independent.
- New interactive browser evidence is **BLOCKED / NOT RUN**. Automatic approval
  review rejected the isolated hidden Chromium launch with only “blocked by policy.”
  No browser, setup or new screenshot was produced; the local preview was stopped.
  Earlier audit screenshots do not verify this follow-up.
- Final `npm.cmd run typecheck` and `npm.cmd run lint`: **PASSED**.
- The first global `npm.cmd run format:check` found one new test file needing
  formatting. After formatting only that file, `npm.cmd run format:check` **PASSED**.
- `npm.cmd test -- --maxWorkers=1`: **PASSED**, 129 files / 1,695 tests.
- With `EXPO_OFFLINE=1`,
  `npm.cmd run build:web -- --max-workers 2`: **PASSED**, 39 routes.
- With `EXPO_OFFLINE=1`,
  `npx.cmd --no-install expo export --platform android --output-dir .expo/configured-age-android --max-workers 2`:
  **PASSED**, one Hermes bundle. This is JavaScript compilation, not native evidence.
- `git diff --check`: **PASSED**. Final inspection confirms no fixture-file,
  dependency, application-configuration or release-flag changes. All earlier audit
  fixes remain present; changes remain uncommitted and unpushed on `main`.

## Interactive browser follow-up — 2026-09-12

The user explicitly requested interactive verification. The integrated CUA and Node
REPL tools could not initialize (`failed to write kernel assets`, OS error 3).
The installed Chromium launch succeeded with the renewed request; the previous
day's automatic-review blocker is historical, not the result of this run.

Root operated an isolated Chromium profile at 390 × 844 through trusted CDP pointer
and text input, using the local preview at `127.0.0.1:8093`. Setup created three
separate synthetic first-slot Children: PalmSix (6–8), PalmNine (9–11), and
PalmTwelve (12–14), with a normal Parent reset between families. No store injection,
real recording, provider request, external account or production data was used.

### A-WEB-01 — medium — verified

Static exported Parent sign-in HTML represented a signed-out Arabic session, while
the browser's initial Zustand snapshot could already contain a remembered Child
and English locale. Fresh navigation to Parent sign-in therefore produced React
hydration error #418 before recovering to the correct Child route. This violated
the server/client initial-markup invariant; the access redirect itself remained
correct. Earlier root entries also reported recovered #419 Suspense errors.

`app/_layout.tsx` now uses stable `useSyncExternalStore` hydration snapshots to
render the same neutral web boundary during export and initial hydration, then
reveal the existing application tree. Store restoration, route guards, startup
effects and immediate native rendering are preserved. New regression coverage in
`tests/web-hydration-boundary.test.tsx` failed **2 cases / passed 2** before the fix.
The final focused command passed **4 files / 31 tests**:

```text
npx.cmd vitest run tests/web-hydration-boundary.test.tsx tests/r001-onboarding-flow.test.ts tests/r003-first-run-experience.test.ts tests/r002b-nested-screen-hardening.test.ts --maxWorkers=1
```

The initial mount-effect candidate failed the existing ESLint rule and was replaced
with hydration snapshots; no rule was suppressed. Final fresh-document browser
replays passed for remembered Arabic Child, remembered English Child, remembered
English Parent and signed-out Arabic reset, with no captured hydration/runtime
exception. Exported web pages now begin with a neutral shell until hydration;
this is the intentional web-only startup behavior change.

### Observed age and access behavior

| Workflow | Result and evidence |
| --- | --- |
| Configured 6–8 prepared Coach | **PASSED:** one short step, slower pace, displayed configured band; Show steps then Plan both worked and curated buttons remained usable. |
| Configured 6–8 gated Coach | **PASSED:** three curated intents, no free-text field or live voice control; repeated prepared terminal responses worked. Parent voice grant action was absent. |
| Configured 9–11 gated Coach | **PASSED:** six structured intents, no free text or live voice control; Arabic if–then and English help-phrase requests returned labeled prepared responses. Parent voice grant action was absent. |
| Configured 12–14 gated Coach | **PASSED:** bounded text and five intents; four task-help actions disabled for empty input while adult help remained available. Synthetic task text enabled the action and returned a prepared terminal response. |
| Configured 12–14 voice permission | **PASSED for UI only:** separate Parent grant enabled the voice panel. Microphone permission and recording were never requested. |
| Parent reauthentication/revocation | **PASSED:** incorrect code changed no grant; correct code enabled text and voice separately. Revoke returned both to Off; Child text input and microphone-permission action disappeared, with permission-required explanations. |
| Final default build | **PASSED:** optional AI flags absent/off in the exported bundle. Prepared 12–14 Coach showed up to three short steps, standard pace and usable repeated actions. |
| Setup, access, pairing, remembered access, reset | **PASSED:** configured identities, Parent-approved task assignment, PIN/pairing, temporary Parent return, pairing revocation, remembered Parent reload and reset. Fresh reset returned to signed-out Arabic entry; after skipping the introduction, Child access contained no configured profiles. |

Optional presentation controls were exercised in isolated exports with only
`EXPO_PUBLIC_GHAF_AI_CHILD_COACH_TEXT_LIVE=true` and
`EXPO_PUBLIC_GHAF_AI_CHILD_COACH_VOICE_LIVE=true`. The existing registry still used
prepared adapters. These were local test overrides, not release activation.
An initial cached export ignored the overrides; a clean export verified their
actual bundle values before the gated checks. Final `dist` was rebuilt with those
variables removed and its default-off values inspected.

Browser evidence totals **332 snapshots, 21 routes, 793 captured local responses,
20 new screenshots**, and zero observed horizontal overflow. Twenty-nine temporary
image 404s occurred while the first test export directory was being rebuilt; all
those assets exist in the final export. Later exports used separate directories.
The final default-build interval contains **60 snapshots and 297 HTTP 200 responses**,
zero runtime exceptions, and one canceled `ERR_ABORTED` request while skipping the
introduction. No nonlocal response was captured. These counts cover attached
capture intervals, not a continuous network trace.

Evidence is `output/playwright/maintainer-audit/configured-age-*.png`; the ignored
action log is `.expo/configured-age-browser-events.jsonl`. Image review confirmed
readable Arabic/English controls and the expected voice restrictions. Screenshots
alone do not prove disabled semantics or distinguish identical revoke labels;
DOM states and subsequent actions establish those results. The 6–8 screenshot
partly obscures the lower age-policy card, and the default 12–14 lower-page frame
shows synthetic voice; full policy text was verified in the DOM capture.

Final checks on the integrated source:

- `npm.cmd run typecheck`: **PASSED**.
- `npm.cmd run lint`: **PASSED**.
- `npm.cmd run format:check`: **PASSED**.
- `npm.cmd test -- --maxWorkers=1`: **PASSED**, 130 files / 1,699 tests.
- `EXPO_OFFLINE=1 npm.cmd run build:web -- --max-workers 2 --clear`, with the two
  local AI overrides removed: **PASSED**, 39 routes.
- `git diff --check`: **PASSED**.

The owned Chromium and preview were closed; ports 8093 and 9225 have no remaining
listeners. All previous audit edits remain preserved and uncommitted. No fixture,
dependency, release flag or application configuration changed. Physical Android,
actual microphone/provider behavior, an age-editing workflow and corrupt-directory
recovery were not exercised or added; their existing acceptance limits remain.

## Remaining requirements and acceptance boundaries

- **R-01 — resolved; automated and scoped browser checks verified:** the owner explicitly
  approved configured age controlling Coach options and voice permissions while
  preserving underlying demo fixtures. The clarification is recorded in Feature 003
  FR-197/data model/plan and Feature 004 FR-018/034/plan, with tasks T088–T091.
  One shared fail-closed selector drives prepared/live Coach input/output,
  grants, voice lifecycle and both UIs. Missing or unconfigured profile data does
  not authorize input; pending responses revalidate effective age. No new
  profile-editing feature, fixture mutation or live activation is included.
- **R-02 — medium requirement conflict; BLOCKED:** corrupt directory data is correctly
  rejected, but all entry paths then fail while reset requires an authenticated Parent.
  Recovery prose promises fresh setup without defining a permitted recovery authority.
  An owner-approved Parent recovery/reset mechanism is needed; this audit does not
  introduce unauthenticated data deletion.
- **R-03 — native acceptance gap; BLOCKED:** the automatic-completion source defect
  is repaired as AI-05. The exact Android device must still verify native cap timing,
  local metadata duration, permission/interruption handling and deletion. No target
  is attached, and live voice stays default-off.
- **Unconfirmed, low-priority:** League rollover accepts a different syntactically valid
  earlier week. No current UI caller or explicit forward-only requirement was found;
  historical-week policy remains a question, not a verified defect.
- Live provider, trusted remote authority, deployed Worker/MCP, actual audio, provider
  retention/deletion and named human content/privacy/accessibility review are **NOT RUN**.
- Physical Android is **BLOCKED**: the installed SDK `adb devices -l` reports no attached
  target. JavaScript export or browser rendering cannot satisfy native gates.

## Coverage limits

This run prioritizes current Features 003–005. Large validation/store modules were
traced through the listed workflows, not every line or possible input. Historical
Features 001/002, vendored assistant tooling, every illustration, all secondary
responsive states and real external systems were not exhaustively audited. Tests
using mocks establish local contracts, not external service or native behavior.

## Handoff

All confirmed, safely actionable findings within this coverage are repaired and
verified. Changes are ready for contributor review on `main`, remain uncommitted
and unpushed, and require no setup or dependency change. Exact modified boundaries
are listed in `TEAM_OWNERSHIP.md`; this report and thirty synthetic browser screenshots
are retained as evidence. R-01 is resolved by the approved configured-age follow-up;
the 2026-09-12 section records interactive evidence and the web hydration repair.
Resolve R-02 and complete the native/provider/human
gates before any affected release activation.
