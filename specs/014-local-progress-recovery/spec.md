# Feature Specification: Local Progress Recovery

**Feature directory**: `specs/014-local-progress-recovery`

**Working branch**: `redesign/ui-experiments` (preserved)

**Created**: 2026-09-12 UAE time

**Status**: DRAFT — proposed scope; implementation and release NOT AUTHORIZED

**Input**: Session A competition mission: prioritize local progress recovery/reset, with validated
versioned evidence, family/Child/task binding, idempotency, interrupted-write handling and stale-work
invalidation. Directory/remembered access is not task continuity. No privileged authority or
Child-private assistant/media content may be persisted. Memory/rationale are separate proposals.

## User Scenarios & Testing

### User Story 1 — Resume the same private local task (Priority: P1)

A Parent or Child reopening this installation can resume the last durably committed stage of the
one approved recycling task. Existing role access still determines what that person can see or do.
The app explains if an action could not be saved instead of claiming it survived restart.

**Why this priority**: Losing a task or confirmed growth during a demonstration undermines the
family's trust and repeatability. Recovery must not bypass Parent decisions.

**Independent Test**: In an already configured synthetic family, restart after each supported
stage and enter the appropriate role. Verify the same task/profile/stage, with no automatic
confirmation, award, replayed assistant content or stronger access.

**Acceptance Scenarios**:

1. **Given** an assigned, chosen, in-progress, submitted or retry-paused canonical task, **when**
   its latest committed action is followed by restart, **then** the same durably committed supported state returns
   for the same family and Child; submission/help creates no progression.
2. **Given** a Parent has confirmed but not completed praise and recognition, **when** restart
   occurs, **then** the task remains awaiting Parent recognition; fresh Parent access and visible
   praise are required before the original award can be committed once.
3. **Given** a saved recognition, **when** either role reopens repeatedly or a duplicate action
   arrives, **then** its separate earned results remain unchanged and no award/celebration runs as
   a side effect of restoration.
4. **Given** a storage failure before an action is saved, **when** the person retries, **then** the
   app retains the last durably committed task state and explains the failure; a rejected save never
   appears as a successful completion or award.
5. **Given** a Child asks for permitted help, **when** the task resumes or is recognized, **then**
   the full accepted award is retained. A smaller task agreed before acceptance retains its own
   originally displayed award; restart never silently changes the accepted version. Pending
   Parent review and pending Child acceptance of a proposal survive distinctly; neither is
   automatically resolved by restart, and keeping the current task remains a separate choice.

### User Story 2 — Reset and replace without reviving old family data (Priority: P1)

The Parent can reset the prototype or replace the family through the existing verified flow.
A restart, late assistant response or old task callback cannot resurrect the previous household's
work, access, progress or result presentation.

**Why this priority**: Reused synthetic IDs and independent stored keys must not mix families or
undo a deliberate reset. This story is a prerequisite to accepting Story 1.

**Independent Test**: Recognize a task, replace/reset at each write boundary and restart. Repeat
using the same identifier, household/Child IDs and fixture timestamps. Confirm no old evidence
attaches to the new family and the new family's task can still earn its single valid award.

**Acceptance Scenarios**:

1. **Given** a recognized family, **when** verified replacement succeeds, **then** the new family
   has a fresh recovery identity, the existing fresh independent baselines and no prior task,
   recognition, pairing or private progress.
2. **Given** replacement is cancelled or fails before its final durable commit, **when** the app
   restarts, **then** the previously saved family and evidence remain recoverable; no draft is saved.
3. **Given** reset succeeds, **when** restart or an earlier pending action occurs, **then** the
   app stays signed out in Arabic with the documented fresh fixtures and no recovered family/task.
4. **Given** interruption happens during a final replacement/reset operation, **when** startup
   resumes, **then** only a complete prior or complete committed state is admitted. Incomplete
   cleanup remains explicitly blocked/retryable and cannot expose mixed-family data.

### User Story 3 — Handle old or damaged local records honestly (Priority: P2)

An existing demo installation receives a defined one-time migration, and an invalid record never
becomes a guessed balance or authentication shortcut. Read failures remain retryable.

**Independent Test**: Load known legacy, unknown-version, corrupt, oversized and contradictory
records, and simulate unavailable storage. Verify truthful recovery feedback and no partial reward.

**Acceptance Scenarios**:

1. **Given** a valid pre-recovery family, **when** its supported migration succeeds, **then** its
   directory remains intact, no historical completion is invented, and the person is told that
   task continuity starts with this version. Existing legacy remembrance is re-established through
   normal verification/pairing, not silently converted into privileged authority.
2. **Given** invalid/unknown progress evidence, **when** startup examines it, **then** no partial
   progress is exposed. A bounded retry/reset explanation appears; stored material is not silently
   deleted or represented as a successful migration.
3. **Given** a read error, **when** storage becomes available, **then** retry validates the same
   record; it never overwrites unread data with fixture defaults merely to make startup succeed.

### Edge Cases

- Duplicate/out-of-order evidence, task edits after acceptance, unknown policy versions and reused
  profile IDs must not bypass validation.
- Revoked/missing Child pairing and Parent logout still prevent private route access even when
  valid task evidence exists.
- Confirmation interrupted before recognition never auto-awards. Restored result presentation is
  static; it does not claim praise was shown in the current session or replay a reveal animation.
- Only an explicit empty-evidence marker in a validated new/migrated envelope means no saved
  task. Missing evidence in a record declaring committed work is invalid/retryable, never a fresh
  baseline. A crash after durable commit but before success rendering restores that committed
  result statically; it neither rolls back earned results nor invokes the action again.
- Failed cleanup after a committed reset/replacement must not restore the retired generation.
- Off flags and unsupported gated Growth/learning data cannot be activated through recovery.

## Requirements

- **FR-001**: Recovery MUST cover only the existing local synthetic household and canonical
  `task_recycling_p0_v1` journey, including existing approved pre-acceptance variants, `parent_review_required`,
  `child_decision_required`, accepted/kept-current decisions and retry/help transitions. No new task execution, memory surface, coach, agenda or second household is added.
- **FR-002**: Every saved stage MUST bind to an opaque family generation, configured Child, exact
  accepted task/variant version, applicable policy version and ordered evidence revision.
- **FR-003**: Saving MUST validate the complete proposed state before a successful action is shown.
  On write failure the last durably committed state remains authoritative and the action is retryable.
- **FR-004**: Evidence MUST contain only bounded task-state facts, prepared option IDs and the
  minimum accepted approval/recognition facts needed to validate the same deterministic result.
  For the existing bounded Parent draft source, retain only the final Parent-accepted title,
  action, rationale, definition of done and permitted help, plus actual validated Parent praise;
  never retain the generating exchange or fabricate omitted original authoring text.
- **FR-005**: Recovery MUST NOT persist sessions, access capabilities, credentials, verification
  codes, provider prompts/responses, assistant conversation, voice/transcript/photo, emotional
  reflection, private notes, raw task/media payloads or unvalidated free text. Existing directory fields keep their
  separate established contract; no duplicate profile directory is added to task evidence.
- **FR-006**: Parent approval before assignment and confirmation before progression MUST remain
  required. Recovery reads evidence; it MUST NOT call an award action or mint access authority.
- **FR-007**: Lifetime Seeds, Garden, private League/canopy, Green projection and Family Reward
  eligibility MUST remain separate validated authorities. Do not save a displayed total as proof.
- **FR-008**: The original canonical task at version 1 alone MUST retain this default oracle: +12 once, Seeds 48→60, Mangrove 48/60→60/60,
  canopy 19/25→20/25, Green Circle 11/12→12/12 and Salem League 4/5/80→5/5/100; Alya remains 36.
  Private Family Reward eligibility 108/120→120/120 and gated lifetime 108→120 are distinct fixtures. The accepted smaller `GI01` version 2 retains +8 (48→56); the accepted
  safe-equivalent version 2 retains +12 (48→60). Their original independent League/Reward
  eligibility MUST be revalidated, never inherited from version 1 or inferred from equal Seeds.
- **FR-009**: Recovery MUST preserve the no-loss/help-equivalence rules and prevent duplicate
  recognition. Result restoration grants zero new progression and creates zero memory leaves.
- **FR-010**: Reset and verified family replacement MUST invalidate old generations durably.
  IDs, timestamps and normalized Parent identifiers alone MUST NOT establish a generation.
- **FR-011**: Late work MUST re-check both current generation and evidence revision before commit.
  A retired generation cannot be recreated by a stale callback, retry or startup default.
- **FR-012**: A known legacy migration MUST be explicit and tested. Unknown, malformed, oversized
  or inconsistent data MUST fail closed without partial restoration or destructive automatic reset.
- **FR-013**: Recovery error/retry/reset states MUST use Arabic-first resources with equivalent
  English, accessible controls and accurate local/offline labels. No “synced” or secure-storage claim.
- **FR-014**: Feature 008 stays private Parent recognition-only with zero progression. R002b flags
  stay independently off. No provider, network, real media, package or storage-service addition.
- **FR-015**: Native SQLite restart/process-death/reset behavior and installed APK evidence MUST
  remain acceptance gates distinct from tests/browser evidence. Named student review is required
  before accepting the exact generated diff.

### Key Entities

- **Family generation**: A non-secret local identity for one committed family incarnation; not a
  token, account or role authority.
- **Recovery evidence**: Bounded ordered facts for the current approved synthetic task, tied to
  family/profile/task/policy and validated before restoration.
- **Recovery outcome**: Ready, no saved task, unavailable, invalid/unsupported, or cleanup pending;
  never an inferred successful save.
- **Retired generation**: A prior incarnation that cannot receive or restore further task evidence.

## Success Criteria

- **SC-001**: Every supported stage returns to its last durably committed state after restart with
  zero duplicate awards, unauthorized routes or Child-private content restored.
- **SC-002**: Repeated recognition/reload, help and retry preserve the original canonical version-1
  oracle and each accepted variant-specific result in FR-008, with no borrowed secondary eligibility.
- **SC-003**: Faults at every write boundary yield a complete old or complete committed-new state,
  never mixed-family data; stale work after repeated reset adds zero progression.
- **SC-004**: Corrupt/unknown/read-failure records produce an understandable recovery route without
  silently discarding or replacing unread progress.
- **SC-005**: The exact APK passes native checkpoints on the primary Android and independent
  secondary installation, with recorded model/OS, offline cold launch and reset evidence.

## Assumptions and pending decision

This proposal selects save-before-success, a minimal bounded record of actual Parent-approved
wording/praise, and one-time re-verification/re-pairing of legacy
remembered installations. It excludes a memory leaf and broader rationale work. Those choices,
the bounded new persistence boundary and its failure experience require the user's acceptance of
this concrete proposal; no implementation permission is inferred from the priority list.

Existing Feature 011 cancellation/save-failure guarantees remain in force. If implementation
cannot preserve them, revise and review this contract before code, rather than weakening tests.
