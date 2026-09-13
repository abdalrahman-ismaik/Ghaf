# Proposed recovery boundary v1

Status: DRAFT; implementation permission absent. No raw store serialization.

## Operations

- `readFamilyEnvelope`: bounded parse/strict validation; returns complete known envelope, missing,
  unavailable, invalid or unsupported. Read failure must not trigger a fixture write.
- `migrateLegacyFamily`: accepts exactly a known valid legacy directory, creates one generation
  and empty progress, saves atomically, and leaves all legacy affinity untrusted until re-established.
- `readProgress`: projects validated evidence for an exact generation/profile/task policy. Returns
  no partial counters on failure. It never mints role authority.
- `prepareProgressTransition`: pure current-domain validation yielding next evidence and the
  complete separate in-memory projections, or a typed failure. No IO or side-effecting award.
- `commitProgress`: re-checks expected generation/revision against the same envelope key, validates
  and writes one new complete value. On success returns its revision; on failure publishes no
  success. Single app writer only; no cross-tab locking claim.
- `replaceFamily`: final verified replacement writes the new directory/new generation/empty progress
  together; old-generation affinity cannot authorize it. Existing activation rollback restores the
  whole previous envelope when possible. No partial old/new projection is rendered.
- `reset`: authorized existing reset removes the envelope, then completes other established cleanup.
  Stale generation-bound operations fail immediately. Cleanup failure is visible and retryable.

## Failure rules

No “save failed but award shown” branch. No automatically overwriting a corrupt/unknown/unread record.
No silent migration of unsupported policy versions. No reward fallback inferred from displayed Seed,
landscape stage, League rank or a Family Reward amount. All existing privacy filters run before
shared projection. Exactly one accepted event produces its existing results once.

Errors exposed in UI are finite reason codes with bilingual resources, not serialized private
contents. Recovery reset still requires the existing authorized Parent reset/repair path; there is
no new signed-out reset privilege. If the directory itself is corrupt, retain its established access
failure/repair contract; do not make valid-looking progress authorize an otherwise invalid family.

## Evidence needed before acceptance

Validate every supported stage, missing/known legacy/unknown/extra-key/oversized/truncated payload,
wrong Child/family/version, duplicate/out-of-order facts, wrong projection provenance, write failure,
read failure, native single-key interruption, and failure before/after every reset/replacement/rollback
operation. Include same identifiers/timestamps, stale delayed assistant completion and repeated reset.
D reviews the exact independent expected outcomes before implementation starts.

Version 5 requires an explicit empty/journey discriminant. Missing committed evidence is invalid,
not an empty task. A crash after successful envelope write but before UI acknowledgement restores
the committed receipt/result statically; it neither rolls back nor invokes recognition again.

## Absent-family orphan cleanup and restart authority

Startup reads v5 first. If v5 exists but is corrupt, unsupported or unreadable, it does not fall
back or delete anything. If v5 is absent, exhaust the existing known v4/v3/v2/v1 migration/repair
paths. Only when **every known family key is successfully read as absent** is the family absent.
An invalid/unread legacy family is not absence and never triggers destructive automatic cleanup.

For proven absence, inspect the finite app-owned auxiliary keys: `ghaf.device-access.v1`
(and its approved future version if introduced), `ghaf:saved-task-templates:v1`, and
`ghaf.ambient-audio.v1`. Any remaining key, or an error reading/removing it, puts startup in
`cleanup_pending`; no family creation, marker resume, old template/preferences projection or
private progress render is allowed yet. Delete only these known Ghaf keys, idempotently, then
verify their absence before normal Arabic signed-out startup. Never clear all browser/storage
keys or inspect/display their private content. Do not automatically reset a valid or invalid family.

This cleanup is a constrained startup consistency operation, not Parent role minting or a new
public reset command. Its retry action only repeats absence checks and deletes proven-orphan
known keys; it cannot create an envelope, restore a retired generation, authorize a route or award
anything. It needs no stored Parent session. A read/delete failure stays cleanup_pending across
restart because absence/orphan checks run again before entry. Once all keys are absent, a restart
is indistinguishable from a clean installation and is correctly treated as one; no marker is needed.

Reset clears legacy family keys first and v5 last, then completes remaining established cleanup.
If the process stops after v5 removal but before secondary cleanup, the above predicate prevents
orphan reuse. If it stops before v5 removal, v5 still governs the old complete directory/progress;
missing affinity requires normal re-entry and is not proof of reset success. Existing authorized
reset is not reported successful before all required keys/controllers reach the fresh baseline.

Required fault cases: current+legacy coexistence; v5 absent with each auxiliary key independently;
invalid legacy versus true absence; every read/remove throwing; process death after each removal;
retry twice; attempted new-family creation during cleanup; stale callback attempting to recreate
old evidence; and clean absence with no writes. No native crash-atomicity pass is inferred here.
