# Recovery data model — proposed

Status: DRAFT. Names describe contracts; they are not implemented TypeScript types.

| Entity                         | Allowed data / validation                                                                                                                                                             | Excluded or derived                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Family envelope v5             | Exact schema version; one existing validated local family; opaque generation; monotonically increasing bounded integer revision; required explicit empty-or-journey recovery evidence | No second family/profile directory, role session, credentials or provider secret                 |
| Task evidence v1               | Generation; configured Child ID; canonical template/variant/task version; policy version; ordered unique transition IDs; allowlisted stage facts                                      | No unvalidated raw Zustand state, UI balance or arbitrary text                                   |
| Assignment/acceptance facts    | Existing Parent-approved choice/version, accepted award-policy reference, accepted smaller-task decision if any                                                                       | No post-acceptance award adjustment; fixture text resolved from reviewed version                 |
| In-progress/submission facts   | Curated step IDs, permitted-help flag, exact allowed task outcome                                                                                                                     | No Coach conversation, media, transcript, reflection or accommodation wording                    |
| Confirmation/recognition facts | Existing strict accepted receipt fields or a lossless minimum projection validated against those same rules; immutable IDs and provenance                                             | No replayable capability, stored Parent session, screen-computed award or praise-view permission |
| Affinity v2                    | Existing non-secret principal binding plus matching family generation                                                                                                                 | No session/token; legacy v1 never grants new-generation affinity by itself                       |
| Recovery outcome               | ready, empty, unavailable, invalid, unsupported, cleanup_pending; finite reason code                                                                                                  | No diagnostic payload containing private record text                                             |

Evidence stages: assigned → chosen → in_progress → submitted → confirmed_pending_recognition →
recognized, plus existing retry/help and approved pre-acceptance smaller-variant transitions.
Legal transitions come from the existing task domain; this list does not redefine them.

The envelope revision identifies committed data mutations, while family generation invalidates
all work after reset/replacement. Neither is a timestamp or privilege. Retiring a generation is
expressed by removing its envelope or atomically replacing it with a different generation. Missing
family means stale callbacks cannot initialize progress. Fresh generation comes only from an
explicitly validated family creation/migration path, never from a generic save retry.

Every projection validates against the applicable original accepted task/policy version. Unsupported
future/old versions return unsupported; do not recompute an old accepted award using a changed
policy. No migration invents old completion. Recognition restoration produces the same separate
results and an already-consumed presentation state, not another award/reveal command.

A valid v5 envelope always declares evidence kind `empty` or `journey`. A journey marker without
its required facts/revision is invalid; missing fields never downgrade a committed record to empty.
A durable commit is authoritative even if the process exits before its success message renders.

## Closed proposed evidence allowlist (no arbitrary extension keys)

- Envelope: `schemaVersion`, `family` (existing v4 validated directory), `generation`, `revision`,
  `evidence`. Evidence is exactly `{kind: empty}` or `{kind: journey, value: ...}`.
- Journey value: `schemaVersion`, `generation`, `profileId`, `taskId`, `taskVersion`, `templateId`,
  `policyVersion`, `lifecycle`, `assignment`, `negotiation`, `attempt`, `submission`, `checkIn`,
  `recognition`, `timeline`. Strings representing IDs are length-bounded and membership-validated.
- Task content: only versioned reviewed template identity plus an optional actual Parent-approved
  final action that passes the existing bounded retained-action grammar. No original draft/Guide
  prompt, arbitrary template body, child title or provider output blob.
- Assignment: `id`, `taskId`, `taskVersion`, `childId`, `approvalSequence`, `createdAt` and the
  validated approved-choice ID. Parent approval is a recorded event, not a reusable access grant.
- Negotiation: `requestId`, source assignment/task/version/Child, requested/resolved kind, exact
  proposal template/version, status and `accept`/`keep_current`/null decision. No proposal text.
- Submission: `id`, `assignmentId`, `taskVersion`, `attempt`, `definitionAcknowledged`,
  `completionMode`, `submittedAt`. No help explanation, optional-content IDs or presence bit
  distinguishing a private media/reflection choice; those fields are unconditionally omitted.
- Check-in: `id`, `submissionId`, decision, actual bounded validated Parent praise, recognition key,
  created/confirmed times and actual historical `praisePresentedAt` for recognized evidence. No neutral observation, uncertainty, note, transient presentation token
  or stored permission to continue. A restored pending check-in requires fresh presentation.
- Recognition: exact validated `RecognitionReceipt` fields: recognition key, check-in ID,
  provenance, Seed transaction, landscape growth, canopy contribution, Circle event and phase
  review. These are evidence to cross-validate, never balances trusted in isolation. Nested fields
  must use the existing exact validators; no arbitrary payload or extra keys are accepted.
- Timeline: bounded allowlisted task/approval/recognition transition IDs, role kind (no session),
  task/profile/version, sequence and valid timestamps needed by existing receipt validators.
  Exclude all assistant/media/reflection interactions; no synthesized historical event.

Actual field spellings/cardinality and the redacted recovered-view adaptation need T004/D review;
this list is closed in intent but is not yet an implementation-ready serializer contract. Missing
required task/receipt facts reject recovery. Omitted optional content is labeled absent/not retained,
never reconstructed by mapping a forbidden private choice ID to prepared content.

The concrete proposed post-approval projection and complete accepted-copy field policy are in
[approved-task-recovery.md](contracts/approved-task-recovery.md). Its source discriminator and
actual historical praise time are required; action/praise alone cannot recover every accepted source.
