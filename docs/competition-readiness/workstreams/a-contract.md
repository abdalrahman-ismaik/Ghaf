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
