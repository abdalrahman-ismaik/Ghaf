# Specs 004 and 005 implementation audit

Date: 2026-09-11. Integration owner: `/root`. Starting revision: `cfbfc74`.

## Implementation status

| Feature                                                               | Finding                                                                     | Remaining acceptance boundary                                                                                                            |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| [004: Bounded live AI](004-bounded-live-ai/spec.md)                   | T001–T087 already implemented; this audit repairs local correctness defects | Live provider execution, deployment, trusted broker/shared operational stores, native voice, and named reviews remain blocked or not run |
| [005: Remembered device access](005-remembered-device-access/spec.md) | T001–T032 implemented; no missing runtime requirement found                 | Physical Android restart/process death, SQLite, Back, TalkBack, font scale, and named human review remain not run                        |

The “F5 text” and “F5 voice” stages belong to Feature 004; they are not Feature 005.
Both requirements-quality checklists have no unchecked items. Checklist completion describes
requirements quality rather than runtime or release acceptance. The Feature 004 checklist's
proposal-time review-result wording remains historical; current source and task evidence is
reported here without altering reviewer-owned markers.

## Source evidence

- Feature 004: `src/models/boundedAi.ts`, `src/features/assistants/{parentTaskDrafting,
liveChildCoach,liveVoiceCapture}.ts`, prepared/remote/native services, the bounded-AI store
  actions, Parent composer and Child support panels, permissions UI, and
  `workers/ghaf-ai-gateway/src/{index,operations,mcp,security}.ts`.
- Feature 005: `src/models/deviceAccess.ts`, `src/features/access/rememberedDeviceAccess.ts`,
  `src/services/local/deviceAccessRepository.ts`, both access controllers, startup/store
  sequencing, `RememberDeviceChoice.tsx`, and Parent verification/temporary-access routes.
- Feature 005 persistence restores fresh synthetic authority; the affinity marker itself is
  not an authenticated session. Parent/Child authority remains mutually exclusive.
- Optional AI flags still default false; the service registry still supplies the blocked
  capability provider and prepared fallback. No Worker/MCP deployment or real media was used.

## Execution and fixes

Three read-only sub-agents audited the features and produced `004-005-execution-prompt.md`.
Root executed it; a bounded test worker authored voice regressions without editing runtime source.
The prompt is now local-only; its historical version remains in commit `b221284`.

1. Parent drafting copied model `supportCue` into reviewed `permittedHelp`, contrary to FR-014
   and the immutable mapping contract. The mapper now preserves the rule and includes it in
   the authority snapshot. Two corrected assertions failed RED; all 15 Parent drafting tests
   passed after the fix. Commit: `eb3b7a4`.
2. Native recorder creation/configuration/preparation could continue into recording after
   cancellation. Lifecycle operations now serialize, and cancellation invalidates pending
   startup before its next action.
3. Stopping/inspecting/reading audio could publish stale voice state and start transcription
   after reset, cancellation, or replacement. Each stage now revalidates its operation;
   stale returned bytes are cleared and its cache file is deleted.
4. Cancellation awaited cleanup before clearing content, could clear a replacement session,
   and could swallow capture errors. It now invalidates synchronously and reports cleanup
   failure without restoring content or overwriting the replacement.
5. Cancelling submitted voice text now clears and invalidates only its matching Coach request;
   a late response cannot display, while an unrelated typed request remains usable. Native
   start/stop/cancel failures capture the URI before recorder release and delete the file
   afterward through the existing cache-scoped media service. Cleanup errors are reported.
   Voice corrections are committed together at `b0fd9b3`.
6. The existing `docs/DEVELOPMENT.md` formatting failure was a leading blank line; only that
   line was removed.

## Validation ledger

| Check                             | Result            | Evidence                                                                                                                                                                                                                             |
| --------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Spec Kit prerequisites            | PASSED            | Bundled FreeCAD Python ran `check_prerequisites.py --json --require-tasks --include-tasks`; active Feature 005 and required artifacts resolved. Plain `python` was unavailable. No before/after implementation hooks are configured. |
| Baseline typecheck/lint           | PASSED            | `npm.cmd run typecheck`; `npm.cmd run lint`                                                                                                                                                                                          |
| Baseline formatting               | FAILED, corrected | Leading blank line in `docs/DEVELOPMENT.md`; formatting-only correction                                                                                                                                                              |
| Baseline full regression          | FAILED            | 122 files passed, one file failed; 1,518 tests passed, one comment-style lint test timed out under concurrent load. No assertion failure in either feature.                                                                          |
| Timeout recheck and Feature 005   | PASSED            | `npm.cmd test -- tests/comment-style-lint.test.ts tests/device-remembered-access.test.tsx --maxWorkers=2`: 2 files / 40 tests, including all 34 remembered-device tests                                                              |
| Parent mapper RED/GREEN           | PASSED            | 2 intended RED failures, then 4 Parent-drafting files / 15 passing tests                                                                                                                                                             |
| Initial voice lifecycle RED/GREEN | PASSED            | 15 intended RED failures with 12 existing passes, then 2 files / 27 passing tests after repair                                                                                                                                       |
| Final full checks                 | PASSED            | Typecheck, zero-warning lint, formatting, Git whitespace, and full regression: 123 files / 1,544 tests                                                                                                                               |

All voice tests use fake recorders, fake file callbacks, synthetic transcripts, and fake
providers. They are automated implementation evidence only. No physical recording, network
provider call, browser visual review, deployment, or named human acceptance occurred.

The follow-up voice tests first produced 9 intended failures with 28 passes; all 37 cases
passed after the second repair. Typecheck then caught a test assertion accessing a property
absent from younger-age request variants; an equivalent object assertion corrected the test
without changing runtime behavior. The bounded final read-only source review found no
introduced blocker. There are 25 new voice cases in total.

Focused reproduction and verification commands:

```powershell
npm.cmd test -- tests/parent-task-drafting-authority.test.ts --maxWorkers=1
npm.cmd test -- tests/parent-task-drafting.test.ts tests/parent-task-drafting-authority.test.ts tests/parent-task-drafting-store.test.ts tests/parent-task-drafting-ui.test.tsx --maxWorkers=2
npm.cmd test -- tests/live-voice-services.test.ts tests/live-voice-integration.test.tsx --maxWorkers=2
npm.cmd test -- tests/comment-style-lint.test.ts tests/device-remembered-access.test.tsx --maxWorkers=2
```

No dependencies, routes, Expo configuration, or release flags changed, so no additional
export/build evidence was required for this correction. Existing native and release gaps
remain explicit rather than being inferred from source or automated passes.

## Handoff

Complete; source is ready for integration and every reservation is released. Final commands
`npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run format:check`,
`npm.cmd test -- --maxWorkers=2`, and `git diff --check` passed. The full regression passed
123 files / 1,544 tests, including the formerly timed-out lint test and both feature suites.
Additional targeted source and audit-document formatting passed. No code defect found in this
bounded audit remains open.

Changed files:

- `src/features/assistants/parentTaskDrafting.ts`
- `tests/parent-task-drafting-authority.test.ts`
- `src/services/native/ExpoVoiceCaptureService.ts`
- `src/state/usePrototypeStore.ts`
- `tests/live-voice-services.test.ts`
- `tests/live-voice-integration.test.tsx`
- `docs/DEVELOPMENT.md` (one leading blank line only)
- `TEAM_OWNERSHIP.md`
- `specs/004-005-execution-prompt.md`
- `specs/004-005-implementation-audit.md`

Manual evidence is limited to source/diff review. Physical Android, provider, privacy/legal,
safeguarding, Arabic/UAE, accessibility, and named-human gates were not performed or promoted.
Source implementation does not activate optional features or satisfy external acceptance gates.
No push, merge, deployment, or release occurred.
