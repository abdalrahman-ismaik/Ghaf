# Data Model: Bounded Live AI Drafting and Coach

**Date**: 2026-09-07

All remote outputs are untrusted until validated. Local profile, household, assignment, and draft
identifiers stay outside provider payloads. Feature 003 task/reward/growth entities remain
authoritative and are referenced here rather than duplicated.

## Shared value objects

### AiFeatureFlags

| Field                          | Type    | Rule                        |
| ------------------------------ | ------- | --------------------------- |
| `ai_parent_task_drafting_live` | boolean | Defaults false; independent |
| `ai_child_coach_text_live`     | boolean | Defaults false; independent |
| `ai_child_coach_voice_live`    | boolean | Defaults false; independent |

Flags are presentation/runtime-selection inputs, never authorization claims.

### RequestCorrelationV1

| Field           | Type          | Rule                                               |
| --------------- | ------------- | -------------------------------------------------- |
| `requestId`     | string        | URL-safe, 16–64 characters, random per action      |
| `bindingNonce`  | string        | URL-safe, 16–64 characters, random, single use     |
| `schemaVersion` | literal `1.0` | Exact match                                        |
| `issuedAt`      | ISO timestamp | Local snapshot only; not required in provider body |
| `expiresAt`     | ISO timestamp | No more than five minutes after issue              |

### BilingualCopy

| Field | Type   | Rule                                                             |
| ----- | ------ | ---------------------------------------------------------------- |
| `ar`  | string | Non-empty MSA; normalized; operation-specific scalar maximum     |
| `en`  | string | Non-empty English; normalized; operation-specific scalar maximum |

No invisible control characters, external links, contact patterns, or prohibited assistant output.

## Feature 4 entities

### ParentTaskDraftRequestV1

| Field            | Type                   | Rule                                                        |
| ---------------- | ---------------------- | ----------------------------------------------------------- |
| `operation`      | `draft_parent_task_v1` | Exact literal                                               |
| `schemaVersion`  | `1.0`                  | Exact literal                                               |
| `requestId`      | string                 | RequestCorrelationV1                                        |
| `bindingNonce`   | string                 | RequestCorrelationV1                                        |
| `localeSet`      | `ar_en`                | Bilingual result always required                            |
| `ageBand`        | `6_8 \| 9_11 \| 12_14` | Coarse band only                                            |
| `archetypeId`    | allowlisted string     | `task_recycling_p0_v1`, `GI01`, `HR02`, or `LW01` initially |
| `catalogVersion` | positive integer       | Exact local/server catalog version                          |
| `intent`         | enum                   | `draft`, `make_clearer`, `make_smaller`, `adapt_age`        |
| `effortBand`     | enum                   | `five_ten`, `ten_fifteen`, `fifteen_thirty`                 |
| `stepCount`      | integer                | 1–4                                                         |
| `supportMode`    | enum                   | Reviewed curated values only                                |

No free text, names, IDs, notes, media, accessibility profile, reward, task history, evidence,
location, contact, device, League, Circle, Family Reward, or arbitrary policy field.

### ParentTaskDraftSuggestionV1

| Field            | Type                | Rule                                                   |
| ---------------- | ------------------- | ------------------------------------------------------ |
| `schemaVersion`  | `1.0`               | Exact echo                                             |
| `requestId`      | string              | Exact echo                                             |
| `bindingNonce`   | string              | Exact echo                                             |
| `archetypeId`    | string              | Exact echo and allowlist                               |
| `title`          | BilingualCopy       | 1–120 scalars each                                     |
| `positiveAction` | BilingualCopy       | 1–240 scalars each                                     |
| `whyItMatters`   | BilingualCopy       | 1–360 scalars each; no measured-impact claim           |
| `steps`          | 1–4 ordered records | Unique continuous order; text max 280 scalars/language |
| `supportCue`     | BilingualCopy       | 1–180 scalars each; diff-only advice                   |

Unknown keys and all task-authority fields are invalid.

### TaskAuthoritySnapshotV1

| Field group      | Source                          | Rule                                                                 |
| ---------------- | ------------------------------- | -------------------------------------------------------------------- |
| Correlation      | local draft/template            | Archetype ID, catalog version, target Child ID, local draft revision |
| Immutable digest | reviewed `TaskTemplate`         | Canonical digest of every non-copy authority field                   |
| Lifecycle        | current journey                 | Must still be draft/eligible at display and acceptance               |
| Copy baseline    | reviewed template/current draft | Retained text shown beside suggestion                                |

The snapshot is local only. It is recomputed before display and acceptance. Any mismatch makes the
response stale.

### ParentTaskDraftView

| Field                 | Type                                | Rule                                                  |
| --------------------- | ----------------------------------- | ----------------------------------------------------- |
| `status`              | enum                                | `idle`, `requesting`, `ready`, `fallback`, `rejected` |
| `origin`              | `prepared \| live`                  | Truthful display label                                |
| `suggestion`          | ParentTaskDraftSuggestionV1 or null | Ephemeral until accept/keep/edit                      |
| `retainedCopy`        | copy baseline                       | Display-only diff                                     |
| `acceptedAttribution` | origin/schema/archetype or null     | Added only after Parent accepts                       |
| `requestRevision`     | non-negative integer                | Stale-response guard                                  |

Transitions:

```text
idle → requesting → ready|fallback|rejected
ready|fallback → accepted|kept|edited
any transient → idle on edit/profile/task/sign-out/reset
```

Acceptance passes through the deterministic mapper and current task validation. It does not review,
assign, approve, confirm, or recognize a task.

## Feature 5 text entities

### LiveChildCoachGrant

| Field                                | Type                              | Rule                                                |
| ------------------------------------ | --------------------------------- | --------------------------------------------------- |
| `capability`                         | `text \| voice`                   | Separate record/decision per capability             |
| `status`                             | `granted \| revoked \| expired`   | Fail closed                                         |
| `childSubject`                       | local/claim-only opaque reference | Never forwarded to provider                         |
| `grantVersion`                       | positive integer                  | Exact token/request match                           |
| `noticeVersion`                      | positive integer                  | Exact active Child notice                           |
| `policyVersion`                      | string                            | Exact active policy                                 |
| `providerVersion`                    | string                            | Forces re-consent on material change                |
| `issuedAt`, `expiresAt`, `revokedAt` | ISO timestamps/null               | Proposed max 30 days; immediate revoke              |
| `reauthenticationProofId`            | string                            | Parent authority reference; never provider input    |
| `capabilityTruth`                    | explicit value                    | Synthetic test grant is not production consent/auth |

### ChildCoachTextRequestV1 common fields

| Field                                   | Type                     | Rule                                         |
| --------------------------------------- | ------------------------ | -------------------------------------------- |
| `operation`                             | `coach_approved_task_v1` | Exact literal                                |
| `schemaVersion`                         | `1.0`                    | Exact literal                                |
| `requestId`, `taskBindingNonce`         | strings                  | Random, single use                           |
| `ageBand`                               | discriminant             | `6_8`, `9_11`, `12_14`                       |
| `locale`                                | `ar \| en`               | Requested reading locale; response bilingual |
| `intent`                                | exact age-band allowlist | One task-help action                         |
| `taskArchetypeId`                       | reviewed public ID       | Server-owned task context                    |
| `catalogVersion`, `approvedTaskVersion` | positive integers        | Exact binding                                |
| `noticeVersion`, `grantVersion`         | positive integers        | Exact capability binding                     |

### ChildCoach6To8Input

Additional fields: none. Intents: `show_next_step`, `make_step_shorter`, `need_adult`. No text,
voice, media, or arbitrary structured input.

### ChildCoach9To11Input

| Field                         | Type          | Rule                                                                                   |
| ----------------------------- | ------------- | -------------------------------------------------------------------------------------- |
| `templateInput.supportChoice` | enum          | `first_step`, `next_step`, `smaller_chunk`, `if_then`, `rehearse_phrase`, `need_adult` |
| `templateInput.stepOrdinal`   | 1–4 or absent | Only when meaningful to intent                                                         |

No free text, voice, media, arbitrary key/value, or history.

### ChildCoach12To14Input

| Field           | Type                                 | Rule                                                                |
| --------------- | ------------------------------------ | ------------------------------------------------------------------- |
| `templateInput` | ChildCoach9To11Input or absent       | Exact shape                                                         |
| `topic`         | enum                                 | `clarify_step`, `plan_order`, `ask_for_help`, `reflect_on_strategy` |
| `boundedText`   | string or absent                     | Max 240 Unicode scalars and 512 UTF-8 bytes; one logical line       |
| `inputOrigin`   | `typed \| reviewed_voice_transcript` | Voice origin requires separate valid grant                          |

Text cannot contain a URL, email, phone, contact/location/secret disclosure, prohibited topic,
prompt injection, unsafe/hazard request, crisis/sensitive content, or continuation request.

### ChildCoachTextResponseV1

| Field                                                      | Type                            | Rule                                             |
| ---------------------------------------------------------- | ------------------------------- | ------------------------------------------------ |
| `schemaVersion`, `requestId`, `taskBindingNonce`, `intent` | exact echoes                    | Mismatch invalid                                 |
| `disposition`                                              | `coach \| ask_adult \| decline` | Terminal routing                                 |
| `steps`                                                    | bilingual array                 | Max 1 for 6–8; max 3 otherwise; 180 scalars each |
| `ifThenCue`                                                | BilingualCopy or null           | 180 scalars each                                 |
| `reflectionQuestion`                                       | BilingualCopy or null           | At most one; optional/skippable                  |
| `reviewedPhrase`                                           | BilingualCopy or null           | Only for reviewed phrase intent                  |
| `terminal`                                                 | literal true                    | No continuation                                  |

The AI disclosure and always-visible adult exit are local UI, never provider fields.

### LiveChildCoachView

| Field                                                        | Type                                                | Rule                      |
| ------------------------------------------------------------ | --------------------------------------------------- | ------------------------- |
| `status`                                                     | `idle \| requesting \| ready \| fallback \| denied` | Ephemeral                 |
| `origin`                                                     | `prepared \| live \| null`                          | Truthful label            |
| `result`                                                     | ChildCoachTextResponseV1 or null                    | Not persisted             |
| `requestRevision`                                            | non-negative integer                                | Invalidate pending call   |
| `boundProfileEpoch`, `taskId`, `taskVersion`, `grantVersion` | local snapshot                                      | Must match before display |

Any terminal result or task/route/profile/grant/sign-out/reset transition clears provider
correlation/history. A new intent is a new independent request.

## Feature 5 voice entities

### VoiceCaptureEnvelopeV1

| Field                                         | Type                                             | Rule                                              |
| --------------------------------------------- | ------------------------------------------------ | ------------------------------------------------- |
| `voiceSessionId`, `requestId`, `bindingNonce` | random strings                                   | One session/clip; single use                      |
| `status`                                      | enum                                             | State machine below                               |
| `locale`                                      | `ar \| en`                                       | No inferred language/identity                     |
| `permissionState`                             | `unknown \| denied \| granted`                   | Native truth                                      |
| `startedAt`, `stoppedAt`                      | ISO timestamps/null                              | Duration validation                               |
| `durationMs`                                  | integer                                          | 0–15,000                                          |
| `byteCount`                                   | integer/null                                     | 0–262,144 before upload                           |
| `cacheUri`                                    | string/null                                      | Local transient only; never store/analytics/error |
| `noticeVersion`, `grantVersion`               | positive integers                                | Separate voice authority                          |
| `taskArchetypeId`, `approvedTaskVersion`      | reviewed public binding                          | Active task only                                  |
| `deletionStatus`                              | `not_applicable \| pending \| deleted \| failed` | Failed deletion blocks send/activation evidence   |

### VoiceTranscriptDraftV1

| Field                       | Type                                    | Rule                                          |
| --------------------------- | --------------------------------------- | --------------------------------------------- |
| `requestId`, `bindingNonce` | exact voice echoes                      | Stale guard                                   |
| `text`                      | string                                  | Same 240-scalar/512-byte bounded 12–14 policy |
| `locale`                    | `ar \| en`                              | Child-selected; no language inference field   |
| `origin`                    | `prepared_synthetic \| transcribed`     | Truthful label                                |
| `reviewStatus`              | `unreviewed \| edited \| ready_to_send` | Explicit Child control                        |

No raw audio, confidence label, segment timing, speaker, biometric, emotion, personality,
truthfulness, health, gender, age, accent, or location field.

### Voice state transitions

```text
idle
  → requesting_permission → permission_denied|ready
ready
  → recording_held → transcribing
transcribing
  → transcript_review|failed
transcript_review
  → deleted|ready_to_send
ready_to_send
  → sending_text → terminal|failed
any nonterminal state
  → deleting → deleted
any capture/transcription state
  → deleting on release boundary, background, route exit, revoke, task/profile change, sign-out, reset
```

Invalid transitions fail closed. `recording_held` exists only while the visible control is held and
the app is active. Transcript completion never enters `sending_text` automatically.

### VoiceTranscriptionRequestV1

The app-to-gateway request is a separate bounded binary/multipart operation containing one audio
part plus `operation=transcribe_child_task_voice_v1`, schema version, random correlation, locale,
public task/catalog version, voice notice/grant version, duration, and declared byte count. Local
profile identity appears only as an opaque signed-token subject and is not forwarded to the
transcription provider.

### VoiceTranscriptionResponseV1

| Field                                        | Type                 | Rule                                                          |
| -------------------------------------------- | -------------------- | ------------------------------------------------------------- |
| `schemaVersion`, `requestId`, `bindingNonce` | exact echoes         | Mismatch invalid                                              |
| `text`                                       | string               | Non-empty and within bounded-text maximum after normalization |
| `locale`                                     | exact request locale | Provider-detected identity/language not exposed               |
| `audioDeleted`                               | literal true         | Gateway/provider adapter asserts completed cleanup path       |

The client still deletes its local cache file. A server assertion is evidence input, not proof of
provider contractual deletion/ZDR.

## Capability token claims

| Claim                           | Rule                                                 |
| ------------------------------- | ---------------------------------------------------- |
| `iss`, `aud`                    | Exact configured values                              |
| `sub`                           | Opaque authenticated subject; never provider input   |
| `tenant`                        | Opaque household boundary where required             |
| `role`                          | `parent \| child` exact operation match              |
| `scope`                         | One exact operation only                             |
| `grantVersion`, `noticeVersion` | Required for Child operations                        |
| `iat`, `exp`                    | Maximum five-minute lifetime with bounded clock skew |
| `jti`                           | Random single-use replay key                         |
| `synthetic`                     | Required true for implementation sandbox             |

The reference verifier rejects unknown claims, missing claims, expired/future tokens, wrong role or
scope, non-synthetic implementation requests, and replay before parsing the operation body.

## MCP projection

MCP introduces no new domain entity, storage record, conversation, or authority. Its two tool
arguments and structured results are exact transport projections of existing models:

| MCP tool             | Capability scope         | Input model                | Structured result model       |
| -------------------- | ------------------------ | -------------------------- | ----------------------------- |
| `draft_parent_task`  | `draft_parent_task_v1`   | `ParentTaskDraftRequestV1` | `ParentTaskDraftSuggestionV1` |
| `coach_current_task` | `coach_approved_task_v1` | `ChildCoachTextRequestV1`  | `ChildCoachTextResponseV1`    |

The tool name is server routing metadata, not model input. Discovery contains descriptions and
closed schemas only. A tool call is authorized against the mapped exact operation before its
arguments are parsed, and its result adds only a short non-sensitive text summary beside the
existing structured DTO. No MCP session, memory, identity, content record, resource, prompt,
sampling request, task, or app object is retained.

## AiControlEvent

Allowed non-content fields only: operation, schema version, coarse age band, outcome category,
latency bucket, fallback reason, rate-limit bucket, deployment version, random request correlation,
and deletion outcome. No raw request/response, task text, name, direct ID, credential, audio,
transcript, URI, or stack trace containing content.

## Relationships and authority

```text
Reviewed TaskTemplate ──creates──> TaskAuthoritySnapshotV1
ParentTaskDraftSuggestionV1 ──copy-only mapper──> existing private Task draft
LiveChildCoachGrant(text) ──authorizes──> one ChildCoachTextRequestV1
LiveChildCoachGrant(voice) + text grant ──authorizes──> one VoiceCaptureEnvelopeV1
VoiceCaptureEnvelopeV1 ──transcription──> VoiceTranscriptDraftV1
VoiceTranscriptDraftV1 ──Child explicit send──> ChildCoach12To14Input
ChildCoachTextResponseV1 ──displays only──> terminal Coach card
AI entities ──never mutate──> task completion, Seeds, Garden, Circle, League,
                              Family Reward, badges, learning, or recognition
```
