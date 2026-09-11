# Session A — integration contract and executed evidence

## Run and authority

Instance `A-20260911T2220Z-root`; source baseline `02b9618631fa9fc1b29f2cda5fa68c6adb2003fd`,
`redesign/ui-experiments`, `/home/smyk/projects/Ghaf`. Session start September 12 UAE time
(September 11 UTC). Canonical live board/status directory is outside worker checkout copies.
User's full Session A prompt is preserved in [requests](../requests.md), Request 7, and the
[role prompt](../orchestration/session-a-integration.md) at the baseline. Student owner, review and
teach-back remain PENDING; no student participation is inferred from configured commit identity.

Requested model: GPT-6 Astra / Ultra / Fast. Root runtime identifies Codex/GPT-6; actual served
identifier/effort/tier is not exposed. Helper launcher accepted `gpt-6-astra` / `ultra`; Fast was
not selectable or measured. Configuration is not claimed as observed execution.

## A-004 — temporary Parent entry correction

Existing authority: Feature 005 Story 3 / FR-008–010, preserving Feature 003 session-local
first-run behavior. This is QA-04's existing handoff repair, not new onboarding persistence.

Before: a remembered Child can start after restart with a fresh introduction state. Choosing
Parent access correctly ends Child authority but routes to `/`, where the introduction masks
Parent entry. After: Welcome recognizes the existing in-memory temporary handoff and redirects
to the existing Parent sign-in route before checking first-run presentation. Parent verification
is still required. Ordinary signed-out access and reset still reach the introduction; authenticated
Parent/Child redirects retain priority. No durable data, authorization, copy or other route changed.

Changed source: `app/index.tsx` (four lines), new
`tests/temporary-parent-entry-route.test.tsx` (five behavioral cases).

Evidence:

- RED: `npx vitest run tests/temporary-parent-entry-route.test.tsx --maxWorkers=1`, exit 1;
  1 failed / 4 passed. Failure was FirstRunOnboarding instead of Parent sign-in after the real
  eligible store handoff, not a harness/import failure.
- GREEN: `npx vitest run tests/temporary-parent-entry-route.test.tsx tests/device-remembered-access.test.tsx tests/r003-first-run-experience.test.ts --maxWorkers=1`, exit 0;
  3 files / 52 tests. Covers destination choice, no Parent authority, retained Child affinity,
  rejected handoff, cancellation, reset and active Parent priority.
- Scoped Prettier and ESLint on both source paths, exit 0.
- Independent read-only helper review: no actionable source defect; router/native evidence still
  needed. The test invokes the route with a mocked router, so it does not pass mounted navigation,
  Android Back or process restart. Reset uses fresh first-run test context and does not establish
  provider reset behavior.
- `npm run typecheck`: exit 0. Full lint/format/suite will run on the integrated A/B/C candidate;
  no full-suite result is claimed for this initial route slice.
- Named human review: PENDING. Browser and Android retest: NOT RUN for this diff.

## Android prerequisite audit

Read-only helper found a feasible local standalone release-variant path without new runtime
packages, but Java/full SDK/build-tools/NDK are absent. ADB has no devices. Existing ignored
`android/` is stale: manifest backup/storage permissions differ from current `app.config.ts`.
Build from regenerated files in a separate reviewed worktree. Existing release signing is the
template debug identity; do not call it production signing. Exact installed versions and commands
are recorded in [Android build plan](../android-build-and-rehearsal.md). No build, package install,
SDK license acceptance, keystore creation or cloud upload occurred. APK/native acceptance BLOCKED.

## Exact helper prompts and disposition

Helper `/root/android_build_audit`, first task (read-only; completed, no descendants):

```text
You are Session A's single allocated helper, read-only Android build feasibility audit. Other sessions are editing this repository; preserve their work. Do not write any files, install packages, spawn descendants, run heavy builds or edit coordination. Repo /home/smyk/projects/Ghaf baseline 02b9618631fa9fc1b29f2cda5fa68c6adb2003fd on redesign/ui-experiments. Read AGENTS.md and relevant existing Android build docs. Exact question: what is the smallest reproducible local standalone Android build path for this EXISTING Expo57/RN0.86 app, and which prerequisites actually exist now? Inspect app.config.ts, package scripts, ignored/generated native directories if present, existing JDK/SDK/adb/Gradle availability without dumping secrets. Inspect locally installed Expo/RN template metadata for required Android SDK/JDK/NDK, app ID, signing/build variant truth, microphone/permissions. Identify concrete build-only changes or missing prerequisites and whether an APK could be assembled without new runtime packages. Source/docs-only findings, exact paths/commands/evidence; distinguish unknowns. Do not repeat B's persistence or D's acceptance audit. Return a concise actionable report including commands that would generate an artifact, risks, actual observed model settings if exposed, and required external actions. A performs coordination and contract planning independently.
```

Second task to same helper (read-only; completed, no descendants):

```text
Your Android audit is complete and received; A now reuses its sole helper allocation for a separate read-only review of A-004. Other sessions are editing; preserve them. No writes, descendants or heavy commands. Review only /home/smyk/projects/Ghaf/app/index.tsx current four-line diff and tests/temporary-parent-entry-route.test.tsx against Feature 005 Story3/FR008–010 and Feature003 session-local first-run. Red test reproduced valid Child handoff showing onboarding; after change 3 focused files/52tests passed. Identify redirect-loop/access/cancellation/reset regressions or inadequate evidence. Check existing sign-in and route guards read-only for context; don't repeat B recovery or C UI audits. Return actionable issues only, explicitly separate native/router execution gaps. Exact served model/tier remains not claimed. A independently writes build/contract evidence.
```

Rejected approaches: persisting onboarding completion to hide a routing defect; claiming a debug
key is production signing; building stale generated manifest; raw-store progress persistence;
claiming helper/source/browser work as student/native acceptance. No helper suggestion was
misrepresented as a human decision. Completed helper allocation is released for another bounded
A subtask when needed.

## Cross-session decisions

A activated four leads plus four helpers globally after observing 64% WSL memory available and
no current paging. Ten configured helper slots per session remain unchanged. Worktrees share
read-only node_modules only after byte-equal lockfile checks; source grants remain disjoint.
A grants C Family Field Journal for one existing task card; this is A's delegated selection based
on the user's botanical/non-generic preference and C's comparison, not named user/human approval.
A grants B reproduction and, if confirmed, repair of Feature 011 replacement-reset omissions.
B exclusively owns the aggregate store until explicit release. New recovery remains a proposal;
there is no memory, provider, networking, reward, feature-flag or additional UI-system grant.

## A-006 — Arabic duration direction clarification

C's source/historical-image review found that an RTL en-dash range could display fifteen-to-thirty
in reverse order. A accepted C's exact proposed `من 15 إلى 30 دقيقة` wording in the single canonical
`src/features/tasks/demoContent.ts` field, retaining English `15–30 minutes`. Duration, task award,
version and authority are unchanged. Existing expected copy in `tests/parent-task-flow.test.ts`
(two assertions) and `tests/child-task-flow.test.ts` (one assertion) follows that same authority.

`npx vitest run tests/parent-task-flow.test.ts tests/child-task-flow.test.ts tests/parent-task-drafting-authority.test.ts --maxWorkers=1` passed 3 files / 44 tests, exit 0.
Scoped ESLint and Prettier on the three paths passed. No new style-mirroring tests were added.
Fresh browser rendering and named Arabic/native review remain PENDING; historical image evidence
is not re-labeled as this candidate's pass. No illustration, dependency or feature flag changed.

## A-002 — reviewed recovery proposal, not runtime authority

D's source/recovery audit and seven independent proposal findings are preserved in `d-baseline.md`,
including final review242cd49 integrated217f095. A wrote the bounded **DRAFT**
`specs/014-local-progress-recovery/**`: three stories, fifteen functional requirements, versioned
family-envelope/reset contract, explicit restored-approved-task proposal, data model, research,
quickstart, twenty-one proposed tasks, checklist and consistency analysis. No runtime file or
new progress persistence was implemented. This draft needs actual user scope acceptance, exact
T004 mapping/review and failing tests before a committed accepted contract and source grants.

The repository Spec Kit specify/plan/tasks skills were read and used for draft structure, template
resolution, prerequisite checks and plan setup. The local ignored `.specify/feature.json` selects014;
Git remains `redesign/ui-experiments`. The setup helper's derived feature branch label does not
mean a branch was created. Optional after-specify/plan context hooks were not run; managed AGENTS
and Feature003 authority remain unchanged. No implementation/analyze automation was invoked.
A authored the consistency analysis without claiming it is a runtime test.

Third exact task to `/root/android_build_audit` (read-only, completed/released; no descendants):

```text
A allocates its one helper slot to a new bounded READ-ONLY design feasibility subtask. Others are editing; preserve all files. No writes, descendants, tests, installs or jobs. Read current draft specs/014-local-progress-recovery/{spec,plan,data-model}.md and contracts/recovery-v1.md in /home/smyk/projects/Ghaf. D independently reviews user-facing privacy/failure/variant acceptance; DO NOT repeat that review. Your exact technical question is T004: can the proposed closed minimal evidence reconstruct current task/recognition validators without storing omitted Child help/reflection/media, Parent notes, raw Parent Guide input, or fabricating historical praise? Inspect src/models/familyGrowth.ts Task/Journey/receipt, src/features/tasks/{recognitionSession,recognitionProviderBoundary,validation,lifecycle}.ts and narrow store restoration selectors. Identify the smallest necessary explicit recovery projection/type seam, mandatory receipt/timeline fields, and whether retaining actual bounded accepted Parent action/praise suffices. We must not weaken normal confirmation/access validators or pretend a restored praise-display token authorizes a new award. Return concrete alternatives/tradeoffs and exact source paths/field mapping with unresolved blockers. You are not implementing recovery. A works on integration and documentation independently. Launcher remains requested Astra/ultra; actual service tier unknown.
```

Exact follow-up steering:

```text
New coordination finding: B independently completed a generic pure-validator map (STATUS-B outbox011); avoid duplicating it. Read that short outbox and focus ONLY remaining T004 design tension: restoring redacted original Parent draft/neutral observation and Child fields while current exact Task/Journey validators require old forms. Recommend smallest honest recovered-view/type contract, and whether this is sufficiently bounded for pre-freeze or should remain blocked. D policy review remains separate. No broad validator inventory needed.
```

Accepted technical finding: recovery needs a typed approved-execution seam because normal Task
validation requires raw original authoring input. Retain final approved copy and actual bounded
praise; mark original/optional content not retained; pending recognition requires fresh praise,
recognized history retains actual order but restores no live continuation or role capability.
Rejected shortcuts: fake original text, cast a redacted object to Task, persist whole store, use
`already_confirmed` as the only historical integrity check, or self-approve the new type boundary.
The exact codec mapping and tests remain future work, not a passed helper implementation.

## Integrated candidate — automated evidence

Runtime candidate `b862eb6f85321935d297a411aaa58744cf72f18b` includes A-004 `ffad798`, A-006
`4d26635`, B-004 `f38f21d` (worker `a081f64`) and C-002 `1428622` (worker `a356998`). A inspected
the released diffs and paired current Arabic/English captures before integration. B's repair
clears the prior family's private League/recognition commitments on successful replacement;
cancelled/failed final saves retain prior state. C places task choice and help before longer
explanations, keeps time/award/adult supervision visible and uses existing tokens/tabular metadata.
No library, source asset or feature flag was added. Authorship was preserved by cherry-picks.

Actual commands, sequential, `CI=1 EXPO_OFFLINE=1`, 2026-09-11 22:42:00–22:43:21 UTC:

- `npm run typecheck`: exit0.
- `npm run lint`: exit0.
- `npm run format:check`: exit0.
- `npm test -- --maxWorkers=2`: exit0, **138 files / 1,669 tests passed**.

Ignored artifacts: `output/competition-readiness/integration-b862eb6/results.json` and four logs.
Python runner PID229181/exec80818 completed; A heavy allocation released. Later documentation-only
commits do not change this tested runtime. D independently retests the mounted b862eb6 journey;
its report remains a separate evidence class. No APK, physical devices or human review passed.

## Actual scope question after the concrete proposal

A presented this question with the committed draft `ca54e40`; response remains PENDING:

> For the reviewed recovery proposal at specs/014-local-progress-recovery/spec.md (commit ca54e40), which scope should drive the next batch? Accepting it includes save-before-success, retaining only bounded Parent-approved task wording/praise, and re-verifying or re-pairing legacy remembered devices; exact typed-contract review must still precede implementation.

Options supplied: “Defer recovery implementation until the current APK/native journey is validated
(recommended).” / “Accept the proposed recovery scope and proceed with the exact contract review
and bounded implementation tasks.” This is a scope question required by the user's Session A
contract, not a fabricated approval. D's current-candidate QA continues independently.

## Exact-diff student review and explanation packet

All rows below are **PENDING**. No reviewer, date, personal contribution or understanding is inferred
from Git identity. Review the actual four production files and four test files in
`git diff 02b9618 b862eb6 -- app src tests`, then record the real person's explanation and gaps.

| Slice / source                                              | Student should explain and demonstrate                                                                                                                                                                   | Evidence limit                                                                                                          |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| A-004 / `app/index.tsx`                                     | Why active-role redirects retain priority; why a signed-out temporary handoff routes to verification but grants no Parent authority; how cancel/reset remove or resolve the handoff                      | Five direct-route regressions use a mocked router; D's mounted interactions are separate; Android Back remains unrun    |
| B-004 / `src/state/usePrototypeStore.ts`                    | Why the new family's recognition epoch, private League ledger and reveal commitments must match; why only successful replacement clears them; how cancellation/save failure preserve the previous family | Four new parameterized cases, not proof of every later activation/rollback failure; no process-death guarantee          |
| A-006 / `src/features/tasks/demoContent.ts`                 | Why explicit Arabic words preserve fifteen-to-thirty minutes without a reversible dash; why English, task version and fixed award stay unchanged                                                         | Actual browser capture supports presentation; named Arabic and native review pending                                    |
| C-002 / `src/components/r002a/child/ChildTodayTaskCard.tsx` | Trace the same callback/guard before and after reordering; show help and choice without hiding rationale or supervision; explain compact scrolling and tabular metadata                                  | Browser state matrix includes labeled injected presentation states; it is not an Android or fully earned journey matrix |

Suggested live teach-back: use the app to request permitted help, show pending completion with no
award, then explain the Parent confirmation/praise boundary before the single +12. Identify which
independent authority updates, why duplicate recognition changes none, and why a remembered Child
on restart does not prove the task survived. Open the relevant existing test assertion while
explaining it. This is an exercise to perform, not a completed student record.

The root assistant's generated documentation and tests are supporting material. Students must
review, understand and make genuine contributions; the packet does not authorize AI to generate
the full app or manufacture a development history. Record rejected changes and unanswered
questions as well as accepted explanations. Exact-diff human acceptance remains a release gate.

## Read-only control-point review

A's one helper slot was reused for `/root/coordination_review` while D performed independent
browser QA. Exact task (no file writes, descendants, tests or jobs):

```text
Session A reuses its one helper allocation for a bounded READ-ONLY control-point review. Other leads are editing; preserve all files. No writes, descendants, tests, browsers or jobs. Read canonical /home/smyk/projects/Ghaf/docs/competition-readiness/coordination/{README,BOARD,STATUS-A,STATUS-B,STATUS-C,STATUS-D}.md and only current top TEAM_OWNERSHIP.md. Exact question: which PRESENT-TENSE stale or contradictory grants/resource/held-path/recovery-cursor statements could mislead a resumed lead, given B/C explicitly completed/released, D active b862eb6 retest, A committed unaccepted draft014ca54e40 and current docs a856b5b, full138files/1669tests passed, user scope decision pending? Distinguish clearly labeled historical revisions from live ambiguity; do not re-audit the protocol, product, recovery design or D runtime. Return a short actionable list confined to A-owned BOARD/STATUS-A/TEAM plus requests A must send to other status writers. Do not edit their files or assume stale heartbeat transfers ownership. A independently prepares exact student/review handoff and awaits D's active QA. Your earlier launcher/model settings remain unchanged; effective tier not claimed.
```

Exact follow-up:

```text
Received and applying A-owned corrections. A-021 already requests D's current checkpoint; will add explicit stale paragraph correction. Please finish bounded review with any remaining TEAM/current-grant finding, then release your allocation. No broader audit needed.
```

Accepted corrections: current commit/task/resource descriptions, explicit proposal path holding,
initial-versus-current assistance labels, inactive paused B/C quotas and current TEAM disposition.
A sent other-status corrections through numbered outbox messages, preserving sole writers and
unacknowledged asks. No stale timestamp transferred ownership. Helper completed and released;
review does not pass product, native or human evidence. Actual prompt/settings limits preserved.

## D preview attribution failure — initial evidence withdrawn

D-015 found that port8097 served `../Ghaf-ui-studio/app/index.tsx` without A-004 while D disk
HEAD was b862eb6. Initial D browser journeys/screenshots/probes are therefore candidate-ineligible.
A had viewed `ar-assigned-390.png` and `ar-growth.png` as visual observations; they do not establish
this integrated runtime's pass. D preserves the mismatch artifact and reruns after clearing the
owned preview cache and verifying loaded routes. This is a development-preview identity failure,
not yet a reproduced app regression. The full automated suite ran in the canonical source checkout
and remains separately attributable. No source fix or dependency mutation follows from inference.

Read-only Expo cache/root task to the reused `/root/android_build_audit` helper:

```text
A reuses its one helper quota for READ-ONLY Expo preview identity analysis. Others edit; preserve all files. No writes, descendants, tests, server, browser, install or package edits. D owns uncached repro/retest. Exact observed failure: D worktree /home/smyk/projects/Ghaf-qa-rehearsal at b862eb6 ran port8097, but loaded Metro route ../Ghaf-ui-studio/app/index.tsx lacked A004 while store module appeared src/state/usePrototypeStore.ts. All worker node_modules are symlinks to canonical /home/smyk/projects/Ghaf/node_modules with byte-equal lockfiles. D stopped owned preview and is retrying --clear; do NOT duplicate that work. Inspect only installed Expo Router/Metro/Babel root/cache handling and local config read-only to explain plausible shared-dependency cross-worktree transform contamination and the smallest explicit launch isolation if --clear is insufficient. Distinguish inspected facts from inference. Return exact supported options/paths and which process must own any mutation; no workaround that edits shared node_modules or changes app behavior. A independently updates evidence and integration board. Effective tier remains unknown.
```

Exact follow-up:

```text
D's 22:53:11 status now confirms --clear loads its own app/index.tsx including A004; relevant retest continues. Keep your output bounded to the supported launch/cache mechanism and one prevention note for future worktree switching. No alternate config work is needed unless local inspection identifies a concrete unresolved issue. Then release.
```

Helper identified shared `_ctx.web.js` relative transform keys, differing embedded Expo route roots
and shared temporary Metro cache as a plausible mechanism. Exact bad cached artifact was not
inspected. A accepted a future per-worktree TMPDIR/explicit-root/clear launch note in the Android
and preview guide; no app configuration, dependency or active D preview was changed. D's already
successful uncached identity check stands separately. Helper completed/released, zero descendants
or jobs. Rejected actions: changing app code for wrong-bundle symptoms, editing shared packages,
restarting a now-correct active retest just to exercise an optional precaution, or keeping the
initial mixed-source screenshots as candidate passes.

## A-007 — guard reset's queued stack dismissal

D-017 observed an unhandled POP_TO_TOP in the correct b862eb6 development preview after the
remembered-Child reload → temporary Parent verification → Settings reset path. Its error overlay
intercepted the next verification click for30seconds. This is an existing Feature003 FR-095/096
reset-usability defect; production/native effect remains NOT RUN. Source utility always called
`dismissAll`; installed Expo enqueues the action, so a surrounding synchronous catch cannot catch
an unhandled queued action.

A reserves `src/utils/navigation.ts` and `tests/reset-navigation.test.ts` in boardr12. The narrow
candidate requires the existing Router `canDismiss` method and enqueues dismissal only when it
reports an available stack. Root replacement and the web Back boundary remain intact. No account,
store, persistent data, other route or reset authority changes. One existing test type spelling
was normalized to remove a scoped ESLint warning; no new dependency or suppression was added.

RED: `npx vitest run tests/reset-navigation.test.ts --maxWorkers=1` exit1, one expected failure /
two passes: a root-only router queued POP_TO_TOP despite reporting canDismiss=false. GREEN:
`npx vitest run tests/reset-navigation.test.ts tests/device-remembered-access.test.tsx tests/temporary-parent-entry-route.test.tsx --maxWorkers=1`
exit0, three files /42tests. This covers root-only replacement, ordinary dismissal, locale/history
guard, temporary access and remembered-access behavior. Scoped ESLint/Prettier pass after the
existing Array<T> spelling was normalized. Actual async route-guard races still require D's
mounted retest; a fake router test alone does not pass them. Native and human review remain open.

Exact read-only helper task (`/root/android_build_audit`, A quota1):

```text
A-007 narrow READ-ONLY reset review; one A helper quota, others editing preserve files. No writes, tests, server, descendants or jobs. D independently reproduced development POP_TO_TOP error blocking next verification after Parent reset; exact D017 in canonical status. A owns src/utils/navigation.ts and tests/reset-navigation.test.ts. Existing try/catch dismissAll is unconditional; installed router enqueues POP_TO_TOP asynchronously. New red case root-only canDismiss false still queues pop (1failed/2passed). A will require canDismiss and guard dismissAll, preserve replace('/') and web Back boundary; normal true case remains. Review only this proposed/current diff and supported installed router semantics for a concrete regression or evidence gap, especially delayed route guards. Do not audit unrelated dismissAll callsites or broaden native fixes; native unrun. D will retest actual reset. A implements/tests and coordinates independently. Return bounded findings, then release.
```

Independent helper found no source regression in the guard. It identified the remaining timing
case: canDismiss reads current state, but reset's Parent route redirect can change it before the
queued pop executes. D must test both root-only and dismissible-history resets through fresh
verification with no unhandled action or blocking toast. This is an execution gap, not a reproduced
patch defect. Helper completed/released, no files/tests/jobs/descendants; no alternate scope added.

Full correction-candidate check on `b2208aaaf06ec16d7fb12cc0781aeaba754a7eff`:
`npm run typecheck`, `npm run lint`, `npm run format:check`, and
`npm test -- --maxWorkers=2` all exit0; **138files /1,670tests passed**. Sequential execution
2026-09-11 23:01:43–23:02:40 UTC, CI=1/EXPO_OFFLINE=1. Exact results/four logs in ignored
`output/competition-readiness/integration-b2208aa/`. Runner251443/exec2855 ended; A heavy slot
released. This rerun follows the actual utility change; docs-only handoffs do not require another
full suite. D-004 actual reset retest remains pending, so no full browser/native acceptance yet.

## A-008 — one validated root reset after the queued-pop failure

D-020 reproduced the remaining A-007 failure on b2208aa: canDismiss was true before reset,
but Parent route cleanup ran before the queued POP_TO_TOP, leaving an unhandled action/toast.
The first guard patch is **not accepted as closing D-R02**. Its passing tests remain accurately
attributed, and its failed browser trace is preserved in D's report/artifacts.

A-008 replaces that strategy using the public `useNavigationContainerRef()` at Parent Settings
and PrototypeStatusBar. The latter is outside the app Stack, so using the same app-level navigation
hook at both locations would target different navigators. `prepareEntryReset` first validates the
mounted outer route's nested Stack and declared index route. Callers return without clearing data
if preparation fails. After the existing authorized store reset succeeds, one public resetRoot
retains the actual outer wrapper name and a sole nested index route. No previous keys, parameters
or routes are copied. There is no queued pop/replace sequence or internal runtime navigation import.
The existing browser Back boundary remains; non-browser window objects without history skip it.

Exact files: `src/utils/navigation.ts`, `app/parent/settings/index.tsx`,
`src/components/PrototypeStatusBar.tsx`, `tests/reset-navigation.test.ts`. No root-layout, registry,
store, dependency, persisted data, privilege or feature-flag change. Authority is existing003
FR-095/096; boardr15/16 reserved both callers explicitly before editing.

RED used Expo's installed StackRouter, not a throwing mock: the old guard queued POP_TO_TOP while
history was dismissible, then the actual reducer returned null against the collapsed entry state
(1failed/3passed). GREEN covers root-only, dismissible, missing-entry and post-preparation collapse
through outer/inner reducers, unavailable/invalid preparation, no browser-history API and repeated
web Back boundaries. Tests import the installed bundled reducer; runtime uses public APIs only.
The three-file reset/access suite passes49tests. Initial typecheck identified test partial-state
inference; the fixture now uses the reducer's actual rehydration API. Final typecheck, scoped lint
and format pass. Independent helper found no actionable source defect; actual container/URL/guard
ordering and native behavior still need D/native evidence. No unit result is substituted for them.

Exact read-only design task to `/root/android_build_audit`:

```text
A one-helper READ-ONLY A-008 design review, no writes/tests/jobs/descendants, preserve others. D reproduced predicted async race on b2208aa: router.canDismiss true at /parent/settings, reset clears role/redirects, queued POP_TO_TOP unhandled and blocking toast persists. Exact new artifact QA output/competition-readiness/d-b2208aa/reset-remembered-child.json. We need the smallest queue-safe full reset-to-entry navigation retaining no stale Back history under Feature003 FR095/096, using installed Expo57 public API, no dependencies. Inspect targeted dismissTo('/') semantics versus root navigation reset (useNavigation('/') / navigation.reset or supported ref). A inspects reducer-test setup independently. Key tradeoff: dismissTo falls back to replace if index route absent, potentially retaining old native routes; root reset reliably sets sole index but needs exact public root seam/callers. Recommend exact smallest safe change and affected existing files, avoiding internal imports in runtime or symptom suppression. Current two callers are Parent Settings and PrototypeStatusBar; both currently use replaceHistoryWithEntry(router). Native still unrun; D owns actual next retest. Do not revisit broad unrelated routes/UI. Return source-grounded bounded recommendation and release.
```

Exact steering:

```text
Received outer __root warning; do not use app-level reset against outer navigator. Please finalize smallest public-ref payload preserving correct outer wrapper while replacing nested app stack with sole index, ideally derive wrapper name from actual root state rather than importing internals. I can add reducer tests using installed vendored StackRouter only in tests, including collapsed/dismissible history and missing entry. Exact additional caller grants will be published before edits. No need generic architecture.
```

Exact final review task:

```text
A re-holds its single read-only helper allocation for final A-008 diff review. No writes/tests/jobs/descendants; others editing preserve them. Actual diff now in /home/smyk/projects/Ghaf: src/utils/navigation.ts exports prepareEntryReset, validates outer active wrapper's child stack declares index before caller clears data, captures only wrapper name and sole nested index, returns one resetRoot closure, retains web Back guard only when window.history exists. Parent Settings and PrototypeStatusBar use public useNavigationContainerRef, prepare before store reset, apply only on success. tests/reset-navigation.test.ts uses bundled StackRouter in tests only for root-only/dismissible/entry-absent/collapse-after-prepare, invalid shape, non-browser window and web Back. Earlier new red reducer test on b2208aa failed as expected (POP_TO_TOP null after collapse). Review exact four-file diff for correctness, both caller contexts, validation-before-clear and no retained history/authority. D independently retests actual URL/Back after commit. Return only actionable issue or remaining evidence limit, then release.
```

Accepted: one root-ref reset with derived wrapper and prevalidation. Rejected: dismissTo's
replace fallback retaining preceding routes, blindly applying app-level reset to the status bar,
internal runtime imports, hiding development errors, or claiming success before actual D retest.
Both helper tasks completed/released; no writes, descendants, tests or jobs by the helper. Named
student review and physical Android remain pending. Arabic CSS200% secondary-label clipping is a
separate P3 browser stress observation; no unrestricted large-text/native pass or UI rewrite follows.
