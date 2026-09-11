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
