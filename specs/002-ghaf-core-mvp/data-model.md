# Data Model: Ghaf Core MVP

**Status**: PROPOSED — this model guides planning and does not authorize Feature 002 implementation.

Feature 002 extends the synthetic in-memory Feature 001 model. It defines twelve core entities and
a few small value objects. No database, migration, production identity, or multi-family model is
required.

## Shared Value Objects

### `LocalizedText`

| Field | Type   | Rule                                                |
| ----- | ------ | --------------------------------------------------- |
| `ar`  | string | Required, trimmed, non-empty Arabic-facing content  |
| `en`  | string | Required, trimmed, non-empty English-facing content |

### `Quantity`

| Field   | Type                    | Rule                                               |
| ------- | ----------------------- | -------------------------------------------------- |
| `value` | integer                 | Positive and within the configured prototype range |
| `unit`  | `'grams' \| 'portions'` | Always visible beside the value                    |

Suggested form limits are 1–5,000 grams or 1–20 portions. They exist only to block broken demo
states and should be confirmed with the prepared scenario.

### `CapabilityOrigin`

`'seeded' | 'prepared' | 'simulated' | 'pregenerated-mock' | 'live-optional'`

Every AI or media result carries one origin. The UI maps the value to plain bilingual disclosure;
it never infers or hides the source.

### `ServiceError`

| Field               | Type          | Rule                                                          |
| ------------------- | ------------- | ------------------------------------------------------------- |
| `code`              | stable string | Suitable for branching and focused tests                      |
| `message`           | string        | Developer-facing fallback; UI uses bilingual copy             |
| `retryable`         | boolean       | `true` only when retry can reasonably succeed                 |
| `fallbackAvailable` | boolean       | Identifies whether deterministic mock completion is available |

## Core Entities

### 1. Family

| Field         | Type            | Rule                                  |
| ------------- | --------------- | ------------------------------------- |
| `id`          | string          | One stable synthetic family fixture   |
| `displayName` | `LocalizedText` | Synthetic public-demo name            |
| `parentId`    | string          | References exactly one Parent Profile |
| `childId`     | string          | References exactly one Child Profile  |

### 2. Parent Profile

| Field         | Type            | Rule                                       |
| ------------- | --------------- | ------------------------------------------ |
| `id`          | string          | Stable synthetic identifier                |
| `displayName` | `LocalizedText` | No real personal data                      |
| `role`        | `'parent'`      | Prototype role, not an authorization claim |

The same profile may be presented as a Parent or grandparent in story copy. Production permissions
are outside scope.

### 3. Child Profile

| Field         | Type            | Rule                                  |
| ------------- | --------------- | ------------------------------------- |
| `id`          | string          | Stable synthetic identifier           |
| `displayName` | `LocalizedText` | No real Child data                    |
| `role`        | `'child'`       | Prototype role only                   |
| `ageBand`     | string enum     | One curated value, initially `'8-10'` |

The age band shapes prepared copy; it is not used for production identity or age verification.

### 4. Prototype Session

| Field                  | Type                        | Rule                                                      |
| ---------------------- | --------------------------- | --------------------------------------------------------- |
| `locale`               | `'ar' \| 'en'`              | Reset/default is `ar`                                     |
| `direction`            | `'rtl' \| 'ltr'`            | Derived from locale                                       |
| `role`                 | `'parent' \| 'child'`       | Reset/default is `parent`                                 |
| `mode`                 | `'mock' \| 'live-optional'` | Mock is always available and is the reset mode            |
| `journeyStatus`        | `MissionLifecycleStatus`    | Controls navigation eligibility                           |
| `missionInput`         | `MissionInput`              | Current editable Parent draft                             |
| `activeMission`        | Mission or null             | Null at reset; pregenerated fallback stays in `AIService` |
| `submission`           | ChildSubmission or null     | Null until the Child begins work                          |
| `confirmation`         | ParentConfirmation or null  | Current Parent decision, if any                           |
| `sessionImpactRecords` | `ImpactRecord[]`            | Empty at reset; one entry per newly approved completion   |
| `impactSummary`        | `ImpactSummary`             | Baseline plus approved session records                    |
| `ghaf`                 | `GhafProgress`              | Shared by Parent and Child views                          |

The session is the one-device aggregate. Screens use store commands rather than editing nested
fields directly.

### 5. Mission Input

| Field              | Type                  | Rule                                                  |
| ------------------ | --------------------- | ----------------------------------------------------- |
| `id`               | string                | Stable for one generation attempt                     |
| `childId`          | string or null        | Must reference the seeded Child before generation     |
| `foodImageId`      | string or null        | Required `MediaReference` of kind `food-image`        |
| `voiceNoteId`      | string or null        | Required `MediaReference` of kind `family-voice-note` |
| `quantity`         | Quantity or null      | Required and validated before generation              |
| `availableMinutes` | integer               | Proposed default 15; supported prototype range 5–60   |
| `reward`           | LocalizedText or null | Optional, symbolic, nonfinancial, short               |
| `updatedAt`        | ISO date-time string  | Local display/debug aid; no audit claim               |

Generation eligibility is true only when the Child, image, voice note, and valid labeled quantity
are present. The available-time and reward defaults are applied explicitly before generation.

### 6. Media Reference

| Field        | Type                                                                     | Rule                                               |
| ------------ | ------------------------------------------------------------------------ | -------------------------------------------------- |
| `id`         | string                                                                   | Stable fixture or temporary local identifier       |
| `kind`       | `'food-image' \| 'family-voice-note' \| 'evidence-image' \| 'narration'` | Determines where it can be used                    |
| `uri`        | string                                                                   | Local bundled URI first; optional remote URI later |
| `label`      | `LocalizedText`                                                          | Human-readable synthetic description               |
| `origin`     | `CapabilityOrigin`                                                       | Prepared path is labeled `prepared`                |
| `durationMs` | integer or null                                                          | Audio only; non-negative                           |
| `mimeType`   | string or null                                                           | Metadata only; no content inference                |

Recording may be created only after a visible microphone action. A media reference never contains
an API secret, food-safety verdict, or real Child data.

### 7. Mission

| Field                 | Type                                                       | Rule                                                                  |
| --------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------- |
| `id`                  | string                                                     | One stable mission identifier                                         |
| `inputId`             | string                                                     | References the input that generated this version                      |
| `version`             | positive integer                                           | Increments after Parent edit/regeneration                             |
| `assignedChildId`     | string                                                     | Must match the selected seeded Child                                  |
| `title`               | `LocalizedText`                                            | Required in both languages                                            |
| `story`               | `LocalizedText`                                            | Short, age-appropriate, family-contextual, no safety claim            |
| `steps`               | tuple of three `MissionStep`                               | Exactly three, ordered 1–3                                            |
| `reflectionPrompt`    | `LocalizedText`                                            | Exactly one short prompt                                              |
| `impactTarget`        | `Quantity`                                                 | Estimated target, visibly labeled                                     |
| `evidenceMethod`      | `'prepared-evidence' \| 'parent-confirmation' \| 'either'` | Offline path always available                                         |
| `reward`              | LocalizedText or null                                      | Symbolic only                                                         |
| `origin`              | `CapabilityOrigin`                                         | Pregenerated fallback is `pregenerated-mock`                          |
| `status`              | `MissionLifecycleStatus`                                   | Must follow the transition table below                                |
| `generationAttemptId` | string                                                     | Makes fallback and retry replace one attempt rather than duplicate it |
| `approvedByParent`    | boolean                                                    | Becomes true only through explicit assignment approval                |

Generated content is schema-validated before Parent review. The Child never sees a mission whose
`approvedByParent` value is false.

### 8. Mission Step

| Field         | Type             | Rule                                                     |
| ------------- | ---------------- | -------------------------------------------------------- |
| `id`          | string           | Unique within the mission                                |
| `order`       | integer enum 1–3 | Exactly one of each value                                |
| `instruction` | `LocalizedText`  | Simple, age-appropriate, actionable                      |
| `completed`   | boolean          | Initially false; changes only in Child in-progress state |

All three values must be true before submission. Changing locale does not change completion state.

### 9. Child Submission

| Field                         | Type                                                                | Rule                                             |
| ----------------------------- | ------------------------------------------------------------------- | ------------------------------------------------ |
| `id`                          | string                                                              | Stable per submission attempt                    |
| `missionId`                   | string                                                              | References one Parent-approved mission           |
| `completedStepIds`            | tuple of three strings                                              | Must contain all three unique mission-step IDs   |
| `evidenceMediaId`             | string or null                                                      | Prepared evidence when selected                  |
| `parentConfirmationRequested` | boolean                                                             | May replace optional evidence                    |
| `reflection`                  | string                                                              | Required, trimmed, short, age-appropriate        |
| `attempt`                     | positive integer                                                    | Increments after a Parent retry and resubmission |
| `status`                      | `'editing' \| 'awaiting-parent' \| 'retry-requested' \| 'approved'` | Mirrors decision state                           |

Exactly one of prepared evidence or direct Parent confirmation must be available before submission.
Submission changes no impact, reward, or Ghaf progress.

### 10. Parent Confirmation

| Field               | Type                   | Rule                                                     |
| ------------------- | ---------------------- | -------------------------------------------------------- |
| `id`                | string                 | Stable decision identifier                               |
| `missionId`         | string                 | References the active mission                            |
| `submissionId`      | string                 | References the current submission attempt                |
| `decision`          | `'approve' \| 'retry'` | Explicit Parent action                                   |
| `confirmedQuantity` | Quantity or null       | Required for approval; absent for retry                  |
| `retryMessage`      | LocalizedText or null  | Optional short guidance for retry                        |
| `awardKey`          | string                 | `missionId:submissionId`; unique for completion awarding |

A retry creates no impact record. An approval is accepted only while the mission is awaiting Parent
confirmation and the quantity is valid.

### 11. Impact Record

| Field                   | Type                 | Rule                                                    |
| ----------------------- | -------------------- | ------------------------------------------------------- |
| `id`                    | string               | Stable local identifier                                 |
| `awardKey`              | string               | Unique; one record for one approved submission          |
| `missionId`             | string               | References the completed mission                        |
| `confirmationId`        | string               | References the approving Parent confirmation            |
| `rescuedQuantity`       | `Quantity`           | Parent-confirmed estimate, not sensor or AI measurement |
| `awardedProgressPoints` | non-negative integer | Deterministic value from local configuration            |
| `origin`                | `'parent-estimate'`  | Always disclosed as an estimate                         |

`ImpactSummary` is a derived display value with rescued grams, rescued portions, completed missions,
and streak days. It starts from seeded baseline totals and adds each unique session record once.

### 12. Ghaf Progress

| Field                  | Type                  | Rule                                                   |
| ---------------------- | --------------------- | ------------------------------------------------------ |
| `stage`                | integer enum 0–5      | Seed through Full Ghaf tree; clamped at 5              |
| `progressPercent`      | integer 0–100         | Reset value 48; deterministic from configured progress |
| `progressPoints`       | non-negative integer  | Internal calculation value                             |
| `unlockedMilestoneIds` | string[]              | No duplicates                                          |
| `newMilestone`         | LocalizedText or null | Celebration detail for the latest award                |

The six named stage mapping remains Seed, Germination, Sapling, Young tree, Branching tree, and Full
Ghaf tree. Stage thresholds and the exact demo award are local content configuration requiring team
approval. At stage 5, additional points update impact or milestones without creating stage 6.

## Relationships

```text
Family ──1 Parent Profile
       └─1 Child Profile

Prototype Session
  ├─1 Mission Input ──2 required Media References
  ├─0..1 Mission ──exactly 3 Mission Steps
  ├─0..1 Child Submission ──0..1 evidence Media Reference
  ├─0..1 Parent Confirmation
  ├─0..n session Impact Records
  └─1 Ghaf Progress

Mission → assigned Child Profile
Impact Record → Mission + approving Parent Confirmation
```

## Lifecycle and Guarded Transitions

`MissionLifecycleStatus` is:

```text
draft-input
generating
parent-review
assigned
child-in-progress
awaiting-parent-confirmation
completed
```

| From                           | Command                 | To                             | Guard and side effect                                                          |
| ------------------------------ | ----------------------- | ------------------------------ | ------------------------------------------------------------------------------ |
| `draft-input`                  | `startGeneration`       | `generating`                   | Required input valid; establish one `generationAttemptId`                      |
| `generating`                   | `generationSucceeded`   | `parent-review`                | Structured mission valid; replace result for the same attempt                  |
| `generating`                   | `useMockFallback`       | `parent-review`                | Preserve input; store pregenerated origin; do not insert a second mission      |
| `parent-review`                | `editMission`           | `draft-input`                  | Preserve editable input; unapproved generated version is not assigned          |
| `parent-review`                | `approveMission`        | `assigned`                     | Explicit Parent action; set `approvedByParent`                                 |
| `assigned`                     | `openChildMission`      | `child-in-progress`            | Parent approval already true                                                   |
| `child-in-progress`            | `submitForConfirmation` | `awaiting-parent-confirmation` | Three steps, reflection, and evidence/confirmation choice valid; award nothing |
| `awaiting-parent-confirmation` | `requestRetry`          | `child-in-progress`            | Mark retry attempt; award nothing                                              |
| `awaiting-parent-confirmation` | `approveCompletion`     | `completed`                    | Valid quantity; atomically create/reuse one impact record and update Ghaf      |

Opening screens, switching roles, changing locale, reloading an already generated result, or
repeating a completed approval cannot advance the lifecycle.

## Idempotent Parent Approval

The local `approveCompletion` use case performs one synchronous store update:

1. Derive `awardKey` from the active mission and current submission.
2. If an `ImpactRecord` already exists for that key, return its existing celebration result and do
   not update any total.
3. Otherwise require `awaiting-parent-confirmation`, matching IDs, and a valid confirmed quantity.
4. Create one confirmation and one impact record, set the submission and mission to completed,
   derive totals and Ghaf progress, and store one celebration payload together.

Parent assignment approval is similarly safe to repeat: once a mission is assigned or later in its
lifecycle, the command returns the same mission without creating another assignment.

## Exact Reset Baseline

`resetDemo()` deep-replaces the entire Feature 002 session and returns navigation to Parent home:

- locale `ar`, direction `rtl`, role `parent`, mode `mock`;
- a fresh empty Mission Input with explicit 15-minute default and no reward;
- no active assigned mission, submission, confirmation, session impact record, or celebration;
- 1,250 rescued grams, 5 rescued portions, 3 completed missions, and a 2-day streak;
- Ghaf stage 2 (Sapling) at 48%;
- the prepared image, voice note, evidence, and pregenerated mission remain available from mock
  services but are not preselected or assigned.

Reset intentionally discards rehearsal changes. Running the same prepared journey after reset can
award its local fixture again because the prior session record has been removed.
