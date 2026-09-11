# Implementation Plan: Local Progress Recovery

**Branch**: `redesign/ui-experiments` | **Date**: 2026-09-12 | **Spec**: [spec.md](spec.md)

**Status**: DRAFT design, not accepted implementation authority. Spec Kit setup reported the
feature-directory label as `BRANCH`; actual Git remains `redesign/ui-experiments`.

## Summary

Recover the existing canonical task from strict minimal evidence, with save-before-success,
separate validated projections, fresh access checks and no revived presentation or private
assistant/media content. Make family incarnation and evidence share one durable commit boundary.
Do not layer a second aggregate store or independent counter cache onto the application.

## Technical Context

- TypeScript 6 strict, Expo 57 / React Native 0.86, Zustand 5 and existing Zod/SQLite KV.
- Existing synchronous `LocalKeyValueStorage`: SQLite KV native, localStorage web, memory tests.
- Existing family repository/controller/registry and task recognition validators remain seams.
- Testing: Vitest behavioral/fault-injection tests, existing source suite, secondary browser,
  authoritative APK/native evidence. No new test/runtime package.
- Scope: one current canonical task, existing curated variants, at most one household and existing
  configured profiles. No history browser, future task catalog, memory, provider or release flag.
- Bounded serialized envelope proposed maximum 128 KiB, progress facts maximum 64 per current
  journey; reject oversize before parsing/deep traversal. Exact limits must be validated against
  real allowed fixtures, not tightened until valid tasks fail.
- Native performance target: bounded synchronous read/validate/restore during existing startup;
  measure on actual phones, do not claim a numerical startup pass from desktop tests.

## Constitution Check

Design assessment: MVP/local scope, existing Arabic stack, no new service/package, Child privacy,
separate progress authority and student explainability are preserved. No constitution exception
requested. Acceptance remains pending user scope decision, D's failure/privacy review and then
native/student evidence. A draft's internally consistent design is not approval to implement.

## Architecture decision and commit boundary

**Proposed storage design:** evolve the existing family storage payload to one versioned envelope
holding the existing validated directory, opaque generation/revision and bounded recovery facts.
Serialize them under one new version-5 family key, using one complete replacement per mutation.
The nested directory retains its existing v4 schema/validator; the envelope discriminator is 5.
Read v5 first and never fall back from invalid/unknown v5 to legacy v4/v3/v2/v1. A supported legacy
migration writes v5 atomically, then clears old keys; interrupted cleanup cannot replace valid v5.
Expose directory and progress through separate repository projections over one shared codec.
An envelope is a persistence boundary, not a new domain authority or duplicate profile directory.

This deliberately avoids pretending multiple KV writes form a transaction. Directory replacement
and its new empty progress generation become one atomic write. Existing family/profile/pairing
updates must preserve the latest evidence and use expected-generation/revision validation. They
must not replace it with a stale whole-record snapshot. JavaScript serialization provides a single
writer per installation in the prototype; do not claim cross-process/cross-tab CAS support.

Use the installed SQLite/localStorage single-key replacement semantics; verify actual native
interruption behavior before accepting crash safety. A read/check/write sequence is not a database
transaction across independent writers. Only one active app instance is in scope.

Existing valid legacy family data migrates once into an empty-evidence envelope with a freshly
created opaque generation. Do not use fixture IDs, normalized identifiers or fixed timestamps as
generation. Legacy access affinity is deliberately not silently upgraded: normal Parent
verification/Child pairing creates a generation-bound affinity v2. Old markers fail closed and
may be removed after the migration. No access session/capability is ever stored in the envelope.

### Task transition

1. Require existing active role/controller authority and the expected current family generation.
2. Use current domain functions to prepare the entire candidate result without mutating the store.
3. Validate the candidate's allowed evidence, ordering, scope, task/policy version and every
   independent projection. Approval evidence is a fact, never a capability for a future action.
4. Re-read/compare expected envelope generation and revision; a stale candidate fails before save.
5. Write one complete envelope. Only after success publish the already-validated store state.
   If the process dies between durable write and UI publication, startup restores the committed
   result statically; an unobserved success message does not undo or repeat its accepted event.
6. On failure retain the last durably committed state and expose retryable feedback. Do not announce
   confirmation/growth before step 5. No fire-and-forget persistence or permissive raw-store dump.

### Startup and result presentation

Read and validate the envelope first. Version 5 requires an explicit `empty` or `journey`
evidence discriminant; missing/mismatched evidence is invalid, not empty. Only known legacy
migration or an explicit new-family commit may initialize empty evidence. Restore supported task state and reconstruct results through
pure existing validators/projections; never invoke a command that awards Seeds or confirms a task.
Restore role access separately through existing controllers and generation-matching affinity.
Invalid evidence yields no partial totals. A valid directory may still support normal Parent
verification so an authorized recovery/reset is possible; it never makes invalid progress valid.

A confirmed-but-unrecognized task resumes pending Parent recognition. Require a newly visible
prepared praise action before the original recognition command; do not persist a transient
presentation commitment as permission to award. A recognized task restores its accepted result
with celebration/reveal already consumed; it cannot reopen an animation as a new accomplishment.
Child Coach/media drafts are discarded. Durable checklist/task facts retain only curated IDs and
permitted-help booleans needed by the approved task; no Child wording or transcript.

### Replacement, reset and interrupted cleanup

- Verified final replacement prepares a complete new family envelope with a new generation and
  empty evidence. Until that single write succeeds, the old envelope remains authoritative.
- A successful new envelope write invalidates old affinity by generation before any route may
  activate. Existing subsequent cleanup stays guarded. If activation fails, attempt restoration
  of the complete previous envelope as Feature 011 requires; if rollback fails, expose a blocked
  retry/cancel recovery state and activate neither mixed family nor stale session.
- Reset clears all legacy v1–v4 family keys before removing v5 last, preserving the existing
  repository clear-order principle. Only then may it report success or show fresh access. A missing
  envelope invalidates all generation-bound work and affinity, even if other-key cleanup was
  interrupted. Retry cleanup without reconstructing the retired family from a late callback.
- Failed removal before commit leaves the old envelope/state available; interruption after
  removal is a committed clear with cleanup pending. Never claim the whole reset succeeded before
  existing directory, affinity, templates, preferences and controllers reach their required state.
- Cancellation before final replacement commit remains untouched. Existing same-identifier and
  reused-profile cases receive a genuinely new generation on successful replacement only.

Read [data model](data-model.md) and [contracts](contracts/recovery-v1.md) for boundary details.
D must review this cross-key cleanup and rollback design before any accepted implementation grant.

## Proposed files and ownership

B may later own pure evidence and repository modules after exact grants:

- `src/features/progress-recovery/evidence.ts`, `tests/progress-evidence.test.ts`.
- `src/services/local/progressEvidenceRepository.ts`, `tests/progress-evidence-repository.test.ts`.

A retains shared seams unless explicitly released: local-family storage codec/repository/models,
access affinity model/parser, `src/services/index.ts`, `src/state/usePrototypeStore.ts`, bilingual
resources and a small existing-shell recovery notice. Add a single codec module only after inspecting
existing repository schema boundaries; do not duplicate family validation in progress code.

D owns independent tests/evidence only after a candidate and exact paths are granted. C has no
recovery UI grant from its separate card task. B-004 replacement correction must integrate first;
its active aggregate-store reservation is not overridden by this proposed file map.

## Delivery and validation

[Tasks](tasks.md) sequence a decision/contract gate, storage/identity foundation, pure task evidence,
atomic repository, shared integration, failure feedback and final native validation. No story is
accepted in isolation from reset/generation/failure safeguards. Use focused red/green cases per
slice; full typecheck/lint/format/suite once per meaningful integrated candidate. Re-run existing
access, replacement, reward, League/privacy and fallback checks after relevant integration.

SDK/native toolchain is currently unavailable. Device names/OS, APK, native SQLite interruption,
TalkBack/Back/IME and ten real rehearsals stay BLOCKED/NOT RUN, not inferred from a web export.

## Privacy/variant reconciliation from D's review

Persist no full Journey/Task/Submission/CheckIn object. The closed allowlist below distinguishes
actual bounded Parent task/praise text from Child-private content. Current raw Parent draft and
provider text must be omitted, even when a reviewed final task is retained. A recovered read-only
Parent task view must show that original draft/optional content was not retained instead of
claiming placeholder text was written by a Parent or Child. A small recovery-provenance model/view
adaptation is required where current Task validation assumes original text exists; it must not
weaken normal task-authoring validation or trust a caller-supplied recovery flag. Final accepted
content and the receipt still pass existing task/policy/projection validation.

Full recognized recovery retains the actual bounded descriptive Parent praise only if it passed
existing praise grammar/safety validation at commit and restoration. Never substitute a prepared
phrase for custom praise and label it historical. Pending confirmation restores its real accepted
praise, but fresh Parent access/presentation is required to apply recognition. Optional Child help
explanation, reflection, media and observations restore absent with an explicit not-retained label;
`permitted_help` alone preserves full accepted credit. Neutral Parent observations/uncertainty are
also omitted and must not be silently fabricated to satisfy an old equality check.

This requires an explicit recovered-evidence validator/projection seam, not replaying the old
confirmation request or altering its source validators to accept arbitrary missing data. The
exact model adaptation and lossless receipt mapping remain a blocking design task (T004) before
an implementation-ready contract, even if the user accepts this product scope. D review must
confirm this boundary does not reintroduce private fields through fixture IDs or omission metadata.

See [the post-approval task seam](contracts/approved-task-recovery.md) for T004’s concrete
proposed direction, complete accepted-copy fields, historical praise timestamp and exact execution
consumers. This resolves a design direction, not user acceptance, implemented types or native proof.

[Recovery contract](contracts/recovery-v1.md) now defines the absent-family orphan predicate,
finite auxiliary-key set, blocked-entry/retry behavior and no-role cleanup operation. It covers
the separate crash window after v5 removal and before affinity/templates/preferences cleanup.
Invalid/unread legacy data is never classified as absence or automatically deleted.
