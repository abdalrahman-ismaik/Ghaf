# Implementation Plan: Fast Demo Entry and Family Onboarding

**Branch**: `redesign/ui-experiments` | **Date**: 2026-09-12 | **Spec**: [spec.md](spec.md)
**Status**: Technically reviewed by D and A; source grants follow this contract commit. Human/native acceptance pending.

## Summary

Add an explicitly build-selected synthetic demo doorway to the existing Expo app. Three fixed
profiles use existing capability controllers without credentials. A platform-neutral memory store
isolates every local repository; ordinary setup remains a separate unchanged configuration. A
synchronous access transaction restores only entry-mutated private state on failure, preventing
partial sessions while preserving permissions/progress. The welcome route hosts a props-only
three-profile selector and three optional story moments. Narration remains silent until matching
reviewed replacement assets exist; old audio is never reused for new text.

## Technical Context

- Language: strict TypeScript6, React19.2.3, React Native0.86.3 and Expo57 (existing lock).
- Dependencies: existing Expo Router, Zustand, i18next, Tamagui, Reanimated, expo-image/audio/SVG.
  No new dependency or lockfile change.
- Storage: isolated process memory for demo family/affinity/templates/ambience; existing SQLite/web
  storage remains ordinary-only. No progress persistence, backend or mode switching at runtime.
- Tests: Vitest4, real store/controller/service behavior, rendered components with native mocks;
  native APK, RTL/Back/audio quality evidenced separately by D and actual human reviewers.
- Platform: Android authoritative; web secondary preview. No emulator requirement.
- Performance: synchronous small entry transaction, one store commit, no fake delay/network or
  media prerequisite. Measure cold-start and tap-to-home separately on actual hardware.
- Scope: three principals, one household/run generation, one adapter, narrow transaction hooks,
  two display components, resource additions and thin integration. One canonical task only.

## Constitution Check

Pre-design review: PASS subject to exact contract review, not release acceptance.

- MVP/one journey: removes access ceremony while preserving Parent confirmation and +12-once.
- Design/Arabic: scoped botanical onboarding/selector, existing fonts/artwork, equivalent AR/EN.
- Mock-first: all entry and task services local/synthetic; no production identity claim.
- Small architecture: fixed build mode avoids registry/store factory refactor or runtime switching.
- Visible AI/truthfulness: prepared/fallible labels survive; no live provider or outcome claim.
- Reliability: rollback handles failed authority creation; sign-out keeps current run, reset creates
  a fresh one. Recovery014 remains deferred rather than persisting privileged state.
- Ownership: A shared integration; B new adapter/tests; C presentation/types/tests; D independent
  contract/artifact acceptance. Commit contract before source grants; no raw snapshots reach UI.

Post-design review repeats in analysis.md after D feedback. Human/native gates remain pending.

## Architecture and state sequence

1. Immutable `entryMode` resolved from exact `EXPO_PUBLIC_GHAF_DEMO_ENTRY === 'true'`; default ordinary.
2. Registry picks isolated memory repositories in demo before controller/store construction. Ordinary
   family/affinity startup restore is bypassed in demo, including fail/migration paths.
3. Signed-out welcome renders DemoEntryScreen before ordinary onboarding. Three controls pass only
   principal and captured expected run generation/entry epoch into A's store command.
4. Command rejects wrong mode/state/generation/epoch, reset-failure latch, active controllers and reentry; lazy adapter uses
   real controller instances and current signed-out state.
5. First-entry initialization validates/saves the canonical memory family without authority. The
   memory fixture may survive a failed access attempt; its presence is not a remembered profile.
6. Composed access→Parent→Child transaction snapshots each owner's entry-mutated state, restores
   directly on error/throw and rejects same-instance reentry. Selected resume method alone creates
   authority. B cannot call reset/verification/permissions through its narrowed ports.
7. Successful handoff is committed once to the aggregate store with incremented entry epoch; navigation follows only success.
   Failure publishes a generic bilingual error and keeps existing progress/permissions unchanged.
8. Sign-out/Child-to-Parent demo CTA clears old authority and returns to a fresh root selector without
   reseeding, incrementing the entry epoch on successful sign-out. In ordinary mode, existing remembered/temporary handoffs remain unchanged.
9. Authorized reset start increments entry epoch immediately. Successful reset increments generation, invalidates the adapter and returns to
   signed-out Arabic entry. Reject reset during a synchronous entry; stale captured requests fail.
10. Failed demo reset closes the experience and latches a restart-required state; all role/entry
    actions deny until a full process restart. Do not promise rollback of existing sequential reset.
11. Restart constructs a new isolated memory run and signed-out selector. No current-run recovery claim.

Transaction boundaries and exact interfaces are in [contracts/demo-entry-v1.md](contracts/demo-entry-v1.md).
Controllers/services are trusted internal objects. Callbacks are synchronous and cannot perform
unrelated permission/pairing/reset/store operations. Restoring snapshots never calls a fallible
termination/reset method. Existing active voice authority/permissions are tested across failed entry.

## Project Structure and ownership

```text
specs/015-demo-entry-onboarding/        A: spec/plan/tasks/research/model/contracts/checklists/evidence
src/models/demoEntry.ts                A: shared principal/mode/request/handoff type authority
src/config/demoEntry.ts                A: exact immutable build configuration
src/services/local/memoryStorage.ts    A: platform-neutral memory factory extracted without drift
src/services/local/{storage,index}.ts  A: preserve ordinary exports and explicit factory export
src/services/index.ts                 A: repository construction/mode selection
src/features/access/index.ts          A: narrow access-service transaction
src/services/interfaces/index.ts      A: optional narrow access interface method
src/features/access/parentOnboarding/controller.ts A: Parent rollback hook
src/features/access/childAccess.ts     A: Child rollback hook
src/features/access/demoEntry.ts       B: narrow adapter + canonical seed helper
src/state/usePrototypeStore.ts         A: generation/entry/ordinary guards/reset/handoff integration
app/index.tsx                         A: demo entry routing
app/_layout.tsx                       A: omit artificial demo splash/loading holds only
src/components/audio/AmbientAudioProvider.tsx A: silence demo entry/story and failed reset
app/access/_layout.tsx                A: new layout guarding existing ordinary-entry routes in demo
app/parent/task/review.tsx            A: existing approval-to-Child demo handoff uses fresh root
app/parent/settings/index.tsx               A: demo signed-out root navigation as necessary
app/child/settings.tsx                A: demo signed-out root navigation as necessary
src/components/demo/*                 C: exact two components + types from contract only
src/i18n/resources.ts                 A: equivalent reviewed-candidate script/entry copy
```

Verify actual existing interface/access route filenames before source grant; new helper files may
be added only through exact revised ownership. C's shared DemoPrincipal type comes from A's initial
foundation commit, so it never waits for the B adapter module to typecheck. B and C never edit
registry/store/routes/resources or each other's source. A does not overwrite worker reports.

## Validation and build sequencing

- Prove wrapper failure semantics with focused tests before integration: second marker, authorization
  plus cleanup failure, exceptions, malformed/reentrant operations, unrelated permissions/voice state.
- B tests adapter through real controllers and deterministic access, including retry and generation.
- A tests mode/storage byte isolation, store/route authority, normal fallback, sign-out/reset and task
  continuity. C tests real rendered actions/copy/story state; source string assertions cannot pass UX.
- Full typecheck/lint/format/suite once per meaningful integrated runtime candidate. Serialize against
  B build/install; small focused checks use one worker and fresh resource observations.
- B may first build runtime e02d02b ordinary baseline while A/C work in their disjoint worktrees.
  Do not edit B runtime during compilation. Later rebuild one exact015 demo candidate with the
  build flag included in its receipt; D never inherits baseline/native results for changed source.
- D independently validates APK/hash/flags, actual phone installation/access/Back/RTL/large text,
  ordinary versus demo restart, audio and human review. Missing hardware/reviewer stays BLOCKED.
- Reviewable silent onboarding is a useful slice, not a claim Arabic narration is repaired. Asset
  provenance and actual listening gate accepted replacement clips; no new service/package inferred.

## Complexity tracking

The three local transaction wrappers add complexity because existing public cleanup can fail and
leave unowned sessions/device markers. Narrowed operations, private snapshots, synchronous execution
and focused fault tests bound it. Whole-service reset was rejected because it would reset permission
and voice state; runtime mode switching was rejected because registry/store objects are captured.
No generic persistence/transaction framework, new account infrastructure or second app is introduced.

## Selected T014 narration continuation

C060/5dca312 records all three exact Arabic clips approved by the user. The smallest remaining
US4 slice is a separate pure demo controller, existing-Expo hook and presentation controls, with
explicit cancellation and no ordinary narrator change. See contracts/demo-narration-v1.md for
exact types/paths/evidence. A prepares this additive plan under existing015 authority; setup_plan
reused the existing plan without changing actual redesign/ui-experiments or managed AGENTS.
D reviews failure/privacy cases before the contract is committed and source grants start.
The frozen5d APK pipeline continues independently. New source requires its own checks/rebuild.
Constitution recheck: one optional existing-story interaction, no new dependency/account/provider,
no Child recording, no persistence/progression authority, silent accessible fallback preserved.
Optional agent-context post-hook is skipped under the user's managed-block preservation instruction.

A180 preparation decision: D061 already reviewed the exact pure-controller/shared publication
boundary and closed reentrancy/foreground contract clarifications. A accepts T014a preparation
after this committed contract; the new native-retirement revision still requires D review before
C's T014b runtime grant. No acceptance of an unreviewed adapter is inferred from elapsed time.

D063 reviewed the concrete A177 retirement revision and found no new cleanup/ownership blocker.
D-T014004 is closed for the pause-only contract correction; actual native no-resume/race and
mounted lifecycle gates remain BLOCKED. A accepts this adapter contract for implementation after
prerequisite publication. The status amendment does not change its reviewed interface or rules.

## September 12 correction implementation

A owns the bounded015 amendment, DemoEntryScreen/Story presentation, types/resources and tests.
Use existing entryEpoch to choose initial local story state: zero→0, nonzero→null; no store changes.
Expose Story navigation through the existing AccessScreen footer with a default inline fallback
for direct component use. All script text stays byte-identical. Profile headings change through
bilingual resources only. Story close/finish always return to profiles, never create authority.
The one helper may own only the narrator hook and its regression after A grants the committed
contract; it must preserve native reader gating, foreground checks and session retirement.
Web uses explicit-user-intent permission without asserting a screen-reader value. Inspect actual
HTML media playback and cancelled seeks, using the sole existing preview/browser lane. Run focused
regressions, source checks, then one full suite for the integrated candidate. No new library/tool.

## User-selected six-page restoration — September 12

Implement [the six-page restoration contract](contracts/six-page-restoration.md) with existing Expo/Tamagui components, assets and local narrator; no new library. A owns shared composition; helper entry-screen ownership is disjoint.

## Exact original restoration

Reuse existing FirstRunOnboarding and extract the original Welcome JSX/styles into a callback-only
shared presentation. Keep demo authority behind those original actions; no store/provider change.
See contracts/exact-original-restoration.md; original narration is a separate user decision.

## September 13 — Parent account chooser

Follow contracts/parent-account-chooser.md. Reuse the existing canonical family factory and
transactional synthetic controllers; a small localParentEntry helper and one store action feed
the existing route. No mode, registry, package, real Auth or task authority changes.
