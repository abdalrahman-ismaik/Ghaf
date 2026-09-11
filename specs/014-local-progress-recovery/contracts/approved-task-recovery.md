# Approved-task recovery seam — technical proposal, not implementation authority

This resolves the direction of T004 after B's pure-validator map and A's independent typed-source
review. It does not claim a serializer can hydrate today's authoring `Task` unchanged. No runtime
file has been written, and source/native/student review gates remain open.

## Why a separate projection is necessary

`Task.parentOriginalText` is mandatory and authoring validation requires nonempty original text;
retained-action tasks additionally require it to match the final action. That validator is reused
for already-approved choose/start/submit/recognition and Family Reward eligibility. Existing
pre-acceptance variant acceptance copies original input. Restoring an omitted draft as fixture text
or as the final action would fabricate authorship, even if it made the existing validator pass.

Keep `Task` and `validateTaskForReview` strict for authoring. Introduce an explicit recovered
post-approval task projection with the same validated accepted content/identity and
`authoringContext: not_retained`. It cannot enter draft review or be presented as a historical raw
Parent request. Do not add a caller-controlled `recovered: true` bypass to the current validator.

## Proposed interfaces and trust boundaries

- `decodeRecoveryEnvelope` returns a strict, in-memory validated evidence value or typed failure.
  Its nonserialized validation proof binds generation/revision/task/profile/policy. The stored
  record cannot supply that proof. This proves validated local data only, not role authentication.
- `projectRecoveredApprovedTask` resolves the approved source and exact accepted version from that
  evidence into `RecoveredApprovedTask`: task/template/version/profile, accepted source, content,
  assignment evidence, generation/revision, and absent authoring context. No raw Parent draft field.
- `validateApprovedExecutionTask` supports authored tasks through unchanged authoring checks and
  recovered tasks through the strict evidence/content resolver plus current generation/revision.
  Both paths preserve existing approval/task/version/privacy/award checks. Execution still requires
  the current controller's active Parent or Child authority; the projection never grants access.
- `projectRecoveredJourney` provides the existing lifecycle/assignment/submission/check-in fields
  with the recovered task variant. Execution consumers explicitly accept this approved-task union;
  authoring consumers retain the existing `Task`. No cast or placeholder converts it into `Task`.
- `validateHistoricalRecognition` reconstructs and validates the historical transition with exact
  receipt/provenance/counter consequences using pure current rules, then projects consumed/static
  results. The duplicate-command branch alone is insufficient policy validation. Neither provider
  award command nor a presentation continuation is invoked during restoration.

Proposed serialized identity values are ordinary bounded IDs. A TypeScript brand or in-memory proof
is an implementation integrity aid, not tamper-proof storage or production security. Physical
single-key commit behavior and failure handling remain separately tested requirements.

## Accepted source and exact final content

The closed source discriminator must cover the currently approved prepared sources:

1. Exact prepared Guide content: pinned source/template version resolves all accepted fields.
2. Retained Parent action: keep the actual accepted final action, validate the same bounded grammar,
   and resolve all unchanged fields from the pinned reviewed template.
3. `bounded_parent_task_draft_v1`: keep the exact Parent-accepted final title, positive action,
   rationale (`whyItMatters`), definition of done and permitted-help copy that its current validator
   allows to vary. Re-run the existing bounded final-copy validator; safety/privacy/award fields
   remain pinned. Saving only the action would silently alter the accepted task.
4. Existing smaller `GI01` and safe-equivalent proposals: retain exact template/version and pending/
   accepted/kept-current decision facts; source templates supply their content. Their separate
   League/Reward eligibility remains fail-closed by original version, not borrowed from +12.

These are final approved task fields, not a saved provider response, raw request or conversation.
Use existing field bounds plus the overall envelope bound; validate actual fixture maxima before
finalizing limits. Unsupported sources/policy versions are explicit unsupported recovery, never
silently converted to the standard template. No optional live source is selected by this proposal.

## Optional content and praise

- Child help explanation/media/reflection/observations restore uniformly as null/null/null/empty
  array. Retain completion mode and acknowledged task facts; permitted help still earns full credit.
- Parent neutral observation/uncertainty restore uniformly null. Derive a general not-retained
  provenance from recovery, not stored presence flags revealing which private input once existed.
- Retain actual bounded bilingual descriptive Parent praise and re-run `isDescriptiveTaskPraise`.
  Never replace custom accepted praise with a prepared phrase and present it as historical speech.
- Pending confirmation restores `confirmed`, actual praise, `editing_praise`, null praise timestamp,
  and no confirmation plan/continuation. Use a fresh Parent presentation action before recognition.
- Recognized evidence includes the **actual historical** `praisePresentedAt`, with
  assignment ≤ submission ≤ check-in ≤ praise ordering. It restores `recognized` /
  `recognition_applied`, no confirmation plan, and consumed/static celebration. Historical time is
  a fact to validate; it is never permission to perform a new award.

Do not replay the original confirmation request. Current restoration builds requests from its
projected check-in, so exact equality checks can remain intact against uniformly redacted optional
fields. Any additional strict invariant discovered during implementation must be reconciled in the
contract; never weaken it or silently retain excluded content to get a test passing.

## Exact implementation seams to inspect before granting writes

- `src/models/familyGrowth.ts`: authored Task/Journey versus approved execution projection.
- `src/features/tasks/validation.ts`: shared accepted-content validation, preserving draft checks.
- `src/features/tasks/recognitionSession.ts`: pure historical validation and pending/static mapping.
- `src/services/mock/index.ts`: approved lifecycle/link guards, no hydration command replay.
- `src/features/family-hub/index.ts`: approved task eligibility validation remains fail-closed.
- `src/state/usePrototypeStore.ts`: variant acceptance, restored projections and generation guards.
- `src/components/family-growth/ParentTaskComposer.tsx`: no fallback claiming prepared text was the
  missing original draft; existing authored-task behavior remains unchanged.
- `src/components/family-growth/ParentCheckIn.tsx`: no invented optional-content fallback in a
  recovered view; fresh praise/pending handling and normal authored flow remain explicit.

A owns these shared seams unless an exact committed task grant transfers a whole file. One new
pure recovery module may own decoding/projection after its stable contract is accepted. This is
several execution consumers, not a four-line persistence patch; the team must review and explain
it. Given the September 14 freeze and missing native evidence, implementation remains BLOCKED
until this expanded but necessary boundary is accepted and its failure tests are specified.
