# Specs 004 and 005 execution prompt

Prepared by `/root/execution_prompt` on 2026-09-11 and handed to `/root` for execution.
The final read-only audit added the Parent permitted-help correction below.

## Objective and current evidence

Work in `C:\Users\narut\OneDrive\Desktop\Project\Ghaf`. Verify Specs 004 and 005 against
the current implementation, repair confirmed omissions within their approved scope, and report
source implementation separately from external acceptance gates.

- Feature 004 has completed T001–T087 and substantive contracts, prepared/remote services,
  store actions, bilingual UI, native adapter, Worker, and server-only MCP implementation.
- Feature 005 has completed T001–T032, including strict device affinity, fresh synthetic
  authority restoration, Parent opt-in/logout, Child continuity, temporary Parent handoff,
  revocation/reset, and storage-failure corrections. No missing runtime requirement was found.
- Spec 004's internal “F5 text” and “F5 voice” labels are stages inside Spec 004.
  Spec 005 concerns remembered device access.
- Proposal-time implementation rows in the Feature 004 approval packet are historical.
  They do not override its later implementation evidence.

## Execution contract

1. Read the repository instructions, constitution, both specs/plans/tasks/contracts, product,
   research, design, limitations, runbook, and current ownership before editing. Inspect
   `git status --short`; preserve unrelated work and historical evidence.
2. Reserve exact files in `TEAM_OWNERSHIP.md`. Root owns integration, the execution prompt,
   the audit report, Parent drafting mapper, and voice lifecycle source. A test worker may own
   only the explicitly transferred voice test files. One writer per file; no more than four
   concurrent agents. Tell workers others share the codebase and must not be reverted.
3. Do not recreate completed features or add dependencies/product scope. Keep optional AI/MCP
   flags independently default off, retain the blocked token provider, and preserve the complete
   deterministic fallback.

## Repair confirmed defects with RED → GREEN tests

### Parent task authority

In `src/features/assistants/parentTaskDrafting.ts`, keep the response's `supportCue` advisory
in the comparison only. Preserve the reviewed task's `permittedHelp` and include it in the
authority snapshot. Correct `tests/parent-task-drafting-authority.test.ts` so a different
support cue cannot overwrite permitted help and a help-rule mutation invalidates the snapshot.
This follows FR-014, the approval packet's immutable mapping rule, and the data model.

### Stale voice stop/transcription

In `src/state/usePrototypeStore.ts`, use deferred fake stop/inspect/read adapters to reproduce
cancellation, reset, authorization changes, or replacement while `stopLiveVoiceHold` awaits.
Stale work must never publish content/state, invoke transcription or Coach, or affect a newer
operation. Revalidate identity and authority at each consequential asynchronous boundary;
clear returned bytes and delete the stale operation's captured file.

Follow-up review: cancellation must also invalidate the matching voice-origin Coach request
during transcript submission, including its retained bounded text and late response, while
preserving unrelated typed Coach state.

### Cancellation ordering

Reproduce cleanup failure and an old cancellation settling after a newer operation starts.
Invalidate the cancelled voice state synchronously, before cleanup awaits. Return truthful
cleanup failures without retaining sendable content or clearing newer state. Cover normal
review/delete/send behavior in `tests/live-voice-integration.test.tsx`.

### Pending native start

In `src/services/native/ExpoVoiceCaptureService.ts`, reproduce cancellation during recorder
creation, audio configuration, and preparation with fake dependencies. A cancelled start must
never later record. Serialize ownership/cleanup so old work releases only its own recorder and
cannot stop a new one. Cover reuse after cleanup in `tests/live-voice-services.test.ts`.
For native start/stop/cancel failure, retain the URI through recorder release and delete the
file using the existing cache-scoped media implementation, with an injectable fake deletion
callback for tests. Return cleanup failure honestly; never leave a sendable transcript.

Use the smallest lifecycle mechanism that fits the existing code. Use only synthetic transcripts
and fake recorder/file/provider adapters. Never activate a microphone or contact a provider.
Do not change code speculatively if a suspected defect does not reproduce and inspection proves
correct behavior.

## Preservation and validation

Preserve separate grants and flags, foreground bounded capture, explicit transcript review/send,
text-only Coach input, zero progression effects, sign-out/reset/profile/task/grant invalidation,
and prepared fallback. Preserve Feature 005's single remembered principal, fresh mutually
exclusive authority, pairing continuity, temporary Parent return, and fail-closed persistence.

Record intended RED failures, then run focused Parent drafting and voice suites plus surrounding
AI/reset/access regressions. Reuse completed baseline evidence; avoid duplicate full runs.
For the completed slice run:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run format:check
npm.cmd test -- --maxWorkers=2
git diff --check
```

Run export/dependency checks only if changed code or failures justify them. Never equate a
JavaScript export with physical Android evidence. Inspect the final diff for unintended store
changes, content persistence, secrets, flag activation, and comment-convention violations.

## Handoff

Save this prompt as `specs/004-005-execution-prompt.md`. Record exact commands, results, counts,
changed files, reproduced defects, and limitations in `specs/004-005-implementation-audit.md`.
Release ownership and commit independently verifiable slices with explicit file staging and
the configured contributor identity. Preserve unrelated edits. Do not push, merge, deploy, or
activate a release.

Complete when reproduced defects are repaired and validated and both specs' status is accurate.
If no additional implementation gap remains, finish without manufacturing tasks. Provider
execution, deployment, trusted remote authentication, real Child media, physical Android
behavior, and named human reviews remain `BLOCKED` or `NOT RUN` without direct authorized
evidence. Report Feature 004 as implemented with live activation blocked, and Feature 005 as
implemented with native/human acceptance pending, subject to the final checks.
