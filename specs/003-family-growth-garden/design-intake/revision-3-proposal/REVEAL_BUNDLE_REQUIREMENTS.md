# Revision 3 RevealBundle Reconciliation Requirements

> **STATUS: PROPOSED — NOT APPROVED — NOT IMPLEMENTATION AUTHORITY**
>
> **R002 INTAKE RECEIVED — PRODUCT CONFLICTS OPEN — IMPLEMENTATION BLOCKED**

This document proposes a decision-ready superset contract. It does not approve a bundle field,
ordering, route, schema, animation, or implementation. Remote head
`a6ca21a607068d0a74e0e4e6394e502c1fb0b9e2` remains the behavioral baseline; approved existing
requirements remain the product baseline; and local/R002 material remains candidate evidence.

## Why reconciliation is required

- **Verified fact:** The current remote `RecognitionReceipt` contains `seedTransaction`,
  `landscapeGrowth`, `canopyContribution`, `circleEvent`, and `phaseReview`
  (`a6ca21a607068d0a74e0e4e6394e502c1fb0b9e2:src/models/familyGrowth.ts:346-354`). `applyRecognition` derives these consequences,
  commits them with one receipt, and exposes a simple `celebration` flag
  (`src/services/mock/index.ts:991-1191`, especially `1113-1184`). Five retries return the stored
  receipt without changing counters or celebration (`tests/prototype-state.test.ts:420-445`).
- **Approved baseline:** Praise must render before a distinct Parent action applies recognition,
  duplicates must be neutral no-ops, and recognition-only/maintenance events cannot mint disallowed
  growth (`specs/003-family-growth-garden/spec.md:760-785`, `FR-044`–`FR-055`).
- **Verified fact:** Private League/Challenge Leaf and private Family Reward consequences exist in
  separate remote domain services, not the main recognition transaction. League idempotency is
  tested at `tests/family-league.test.ts:292-320`; Family Reward eligibility and deduplication at
  `tests/family-reward.test.ts:160-228`.
- **Candidate conflict:** R002's short reveal order contains praise, Garden, Seeds, achievements, and
  safe-help (`docs/design/stitch/releases/ghaf-r002/GHAF_CODEX_SCREEN_FLOW_AND_INTEGRATION_PROMPT.md:330-347`), but omits the
  current canopy and Green Circle and does not mention private League or Family Reward there.
- **Candidate superset:** Local commit `ecbfb3a2a89fe7eefa23e8547aeb5216724ee56c` proposes praise → optional activity → Seeds →
  Garden → canopy → Challenge Leaf/League → Impact/badges/recognition → Family Reward
  (`ecbfb3a2a89fe7eefa23e8547aeb5216724ee56c:specs/003-family-growth-garden/data-model.md:668-721`). That proposal is not approved.

**Recommendation:** If Revision 3 is approved, use one event-owned bundle that reports every
consequence already committed by the triggering event; never use presentation to calculate or commit
an outcome. All final field inclusion and order decisions below remain open.

## Proposed terminology and invariant

`RevealBundle` is a finite, recoverable presentation projection over an immutable committed event
receipt. It is not the transaction, an award calculator, a queue of independent celebrations, or a
reason to repeat domain evaluation.

There is exactly one bundle per `profileId` and `triggerEventId`, represented by the compound key:

```text
{profileId, triggerEventId}
```

A later event for the same profile has a different `triggerEventId` and may produce another bundle.
The same trigger ID for a different profile is rejected; it is not a global identifier shortcut.
This matches the R002 candidate lifecycle at
`docs/design/stitch/releases/ghaf-r002/GHAF_CODEX_SCREEN_FLOW_AND_INTEGRATION_PROMPT.md:613-628`, but still needs approval.

## Proposed superset fields and open approvals

Status vocabulary:

- **PRESERVE — PROVISIONAL:** existing approved/implemented consequence; retain unless Product
  explicitly replaces it.
- **CANDIDATE — OPEN:** local/R002 proposal with no current approval.
- **CONDITIONAL — OPEN:** include only when the committed event actually caused that consequence.

Every row's final inclusion and every numbered placement is **OPEN** until the named owner approves
it. “Recommended order” is not authority.

The superset covers both newly unlocked learning and any Impact Path station caused by the same
event; they remain separate references below so neither authority is inferred from the other.

| Proposed field/outcome            | Source and semantics                                                                                                                                                                      | Inclusion status       |                                   Recommended order | Final approval                       |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------: | ------------------------------------ |
| `bundleId`                        | Stable ID for the unique `{profileId, triggerEventId}` pair; `evaluatorVersion` is payload metadata and never part of bundle uniqueness.                                                  | CANDIDATE — OPEN       |                                            Metadata | Engineering + Product OPEN           |
| `profileId`                       | Required profile isolation key; every referenced receipt must match it.                                                                                                                   | PRESERVE — PROVISIONAL |                                            Metadata | Product + Engineering OPEN           |
| `triggerEventId`                  | Immutable task-approval, learning-completion, or activity-completion event ID.                                                                                                            | CANDIDATE — OPEN       |                                            Metadata | Engineering OPEN                     |
| `bundleKind`                      | Proposed discriminator: `task_approval`, `learning_completion`, or separately approved `activity_completion`.                                                                             | CANDIDATE — OPEN       |                                            Metadata | Product OPEN                         |
| `evaluatorVersion`                | Pins deterministic result ordering and field interpretation.                                                                                                                              | CANDIDATE — OPEN       |                                            Metadata | Engineering OPEN                     |
| `committedSequence`               | Orders bundles by the committed event, not navigation/render time.                                                                                                                        | CANDIDATE — OPEN       |                                            Metadata | Engineering OPEN                     |
| `sourceReceiptKey`                | Points to the immutable committed source receipt; it must match the bundle profile and trigger.                                                                                           | CANDIDATE — OPEN       |                                            Metadata | Engineering OPEN                     |
| `outcomes`                        | Ordered typed references to only the consequences actually committed for this event.                                                                                                      | CANDIDATE — OPEN       |                                             Payload | Product + Engineering OPEN           |
| Parent praise                     | Exact Parent-approved action/strategy/help-seeking praise already shown before recognition; Child reveal may reference the committed version.                                             | PRESERVE — PROVISIONAL |                                                   1 | Product OPEN                         |
| Self-reported activity            | Optional, honestly labelled observable quantity only when a valid committed method/result exists; never “environmental impact” without a method (`spec.md:801-804`).                      | CONDITIONAL — OPEN     |                                                   2 | Product + sustainability review OPEN |
| Committed Seeds                   | Reference the immutable `SeedTransaction`, including delta, before, after, and symbolic/nonfinancial meaning. Omit for zero-Seed events.                                                  | PRESERVE — PROVISIONAL |                                                   3 | Product OPEN                         |
| Plant growth or stage transition  | Reference `LandscapeGrowth`, including landscape growth, stage transition, and symbolic-only label. Omit when no growth.                                                                  | PRESERVE — PROVISIONAL |                                                   4 | Product + Design OPEN                |
| Canopy consequence                | Include the existing eligible one-leaf household-canopy consequence when committed; never infer it from Seeds.                                                                            | PRESERVE — PROVISIONAL |                                                   5 | Product OPEN                         |
| Green Circle                      | Include current `circleEvent` when committed so Revision 3 does not silently lose the 11/12 → 12/12 consequence. Its future relation to League/Shared Growth is a separate open decision. | PRESERVE — PROVISIONAL |                                                   6 | Product OPEN                         |
| Challenge Leaf consequence        | Include only an already nominated, eligible, confirmed Leaf with the same recognition key. Never make every approved task a Leaf.                                                         | CONDITIONAL — OPEN     |                                                   7 | Product OPEN                         |
| Private League consequence        | Include only the affected Child's private weekly result/position projection and cooperative total allowed by `FR-111`–`FR-115`; never expose task/evidence/Seeds.                         | CONDITIONAL — OPEN     |                                                   8 | Product + privacy OPEN               |
| Impact Path station               | Reference newly stored station receipts caused by this event; no screen-owned threshold evaluation.                                                                                       | CANDIDATE — OPEN       |                                                   9 | Product OPEN                         |
| Earned badge or achievement       | Reference only newly persisted awards whose full deterministic criteria were satisfied by this event; existing awards are not re-celebrated.                                              | CANDIDATE — OPEN       |                                                  10 | Product + content OPEN               |
| Newly unlocked learning           | Reference a package newly unlocked by this event; it is not the same as completing it.                                                                                                    | CANDIDATE — OPEN       |                                                  11 | Product + content OPEN               |
| Safe-help recognition             | Optional one-time descriptive recognition; zero Seeds/mastery and not a badge (`ecbfb3a2a89fe7eefa23e8547aeb5216724ee56c:specs/003-family-growth-garden/data-model.md:567-575`).          | CANDIDATE — OPEN       |                                                  12 | Product + safeguarding OPEN          |
| Phase-review prompt               | Preserve the remote `phaseReview` consequence, but present it in a Parent-owned follow-up surface unless Product explicitly requires it in the Child bundle.                              | CONDITIONAL — OPEN     | Parent follow-up, not recommended in Child sequence | Product OPEN                         |
| Private Family Reward consequence | Include plan ID/version, eligible contribution, before/after lifecycle, and private message only if the event validly changes progress/state. Keep private and independent of League.     | CONDITIONAL — OPEN     |                               13 (recommended last) | Product + privacy OPEN               |
| `reducedMotionEquivalent`         | Static final state carries identical information and actions.                                                                                                                             | PRESERVE — PROVISIONAL |                               Presentation metadata | Design + accessibility OPEN          |
| `lifecycle`                       | `pending`, `presenting`, `seen`; see lifecycle below.                                                                                                                                     | CANDIDATE — OPEN       |                                      State metadata | Engineering + accessibility OPEN     |
| `presentationAttemptId`           | Nullable idempotent claim token for recovery; it never changes domain outcomes.                                                                                                           | CANDIDATE — OPEN       |                                      State metadata | Engineering OPEN                     |
| `firstPresentedAt`                | Nullable deterministic presentation timestamp/fixture value for recovery and evidence, not reward timing.                                                                                 | CANDIDATE — OPEN       |                                      State metadata | Engineering + Product OPEN           |
| `seenAt`                          | Nullable acknowledgement timestamp/fixture value; dismissal cannot roll back committed outcomes.                                                                                          | CANDIDATE — OPEN       |                                      State metadata | Engineering + accessibility OPEN     |

### Consequence reference rule

Each outcome stores a reference/key plus immutable display snapshot sufficient for deterministic
recovery. It must not copy an independently mutable authority into a second source of truth. For
example, the Family Reward service owns its plan state; the bundle records the evaluated plan
version and transition it presented.

## Proposed non-runtime contract

Field names are illustrative and all remain open:

```ts
type ProposedBundleKind = 'task_approval' | 'learning_completion' | 'activity_completion';
type ProposedBundleLifecycle = 'pending' | 'presenting' | 'seen';

interface ProposedRevealBundle {
  readonly bundleId: string;
  readonly profileId: string;
  readonly triggerEventId: string;
  readonly bundleKind: ProposedBundleKind;
  readonly evaluatorVersion: string;
  readonly committedSequence: number;
  readonly sourceReceiptKey: string;
  readonly outcomes: readonly ProposedRevealOutcome[];
  readonly lifecycle: ProposedBundleLifecycle;
  readonly presentationAttemptId: string | null;
  readonly firstPresentedAt: string | null;
  readonly seenAt: string | null;
  readonly reducedMotionEquivalent: true;
}
```

The outcome union must be typed by consequence kind. Null-filled “universal receipt” objects are
not recommended because they make prohibited effects easy to misread as missing data.

## Deterministic construction and ordering

1. Validate Parent/Child authority, profile binding, task/version/submission chain, and event
   eligibility before any mutation.
2. Commit the domain event and all applicable consequences atomically, or commit nothing.
3. Store one immutable source receipt containing references to every consequence.
4. Evaluate Path/badge/learning-unlock consequences from the committed evidence, not tentative
   input; persist new records idempotently.
5. Build the bundle from the stored receipt using a versioned precedence list. Sort same-kind IDs
   lexically by stable ID unless an approved definition supplies a stable ordinal.
6. Insert the bundle once under the unique `{profileId, triggerEventId}` pair and order it by
   `committedSequence`.
7. Return the stored receipt and stored bundle on retry. A materially different payload or
   evaluator version under the same pair returns the existing record or fails closed according to
   an explicitly approved migration; it never inserts a second bundle.

The recommended outcome precedence is the table order. Final inclusion and ordering remain Product
decisions. In particular, R002 puts Garden before Seeds (`R002:337-343`), while local
`ecbfb3a2a89fe7eefa23e8547aeb5216724ee56c:specs/003-family-growth-garden/data-model.md:688-697` puts Seeds before Garden. Product and Design must choose; Git
mechanics cannot resolve this semantic conflict.

## Lifecycle and idempotent operations

```text
none --create--> pending --claim--> presenting --dismiss/acknowledge--> seen
                         \--recover after interruption--/
```

| Operation              | Idempotency key                    | Required behavior                                                                                                                                                                             |
| ---------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create                 | `{profileId,triggerEventId}`       | Same input returns the existing bundle; a changed payload/evaluator under the pair returns the existing record or fails closed under an approved migration and never creates a second bundle. |
| Queue insertion        | `bundleId`                         | Insert once in committed-event order; never stack multiple sheets.                                                                                                                            |
| Claim for presentation | `{bundleId,presentationAttemptId}` | First valid claimant changes `pending → presenting`; a retry from the same attempt returns the same bundle.                                                                                   |
| Recovery               | `bundleId`                         | After crash/background/route loss, recover `pending` or `presenting` as the same finite bundle without re-running the event.                                                                  |
| Render                 | `bundleId`                         | Rendering is pure. Animation callbacks cannot commit, reorder, or acknowledge consequences.                                                                                                   |
| Dismiss/acknowledge    | `{bundleId,seen}`                  | First valid action records `seenAt`; repeat is a neutral no-op. Domain outcomes remain committed.                                                                                             |
| Revisit                | `bundleId`                         | A `seen` bundle is not automatically recreated or replayed. Explicit history view, if ever approved, is non-celebratory.                                                                      |

If several committed events are pending, present one bundle at a time in ascending
`committedSequence`. A second sheet/dialog must not appear above it. When reduced motion is enabled,
render the same final content immediately and preserve focus/announcement order.

## Interruption and recovery cases

| Interruption point                                 | Required recovery                                                                                                     |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Before domain commit                               | No receipt, no bundle, safe retry allowed.                                                                            |
| After domain commit but before bundle insertion    | Reconciliation detects the receipt and creates the one missing bundle with the same key. It does not reapply rewards. |
| After insertion but before first render            | Recover the pending bundle.                                                                                           |
| During animation/presentation                      | Restore the same presenting bundle at a stable final or reduced-motion state; never start another sheet.              |
| After dismissal before acknowledgement persistence | Idempotently record seen on retry; closing cannot roll back outcomes.                                                 |
| After seen                                         | Return to true origin; never recreate from navigation alone.                                                          |

## Task-approval versus learning-completion bundles

| Rule                        | Task approval                                                                | Learning completion                                                                                                      |
| --------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Trigger                     | Valid Parent approval/recognition event after praise                         | One valid, idempotent completion of the approved story, equal-credit accessible route, or Parent-guided equivalent       |
| Authority                   | Parent capability and complete task chain                                    | Authorized Child/profile plus exact learning package/version                                                             |
| Seed/Garden                 | May include the configured Seed and mapped Garden consequence                | Always zero Seeds and zero Garden growth                                                                                 |
| Canopy/Circle/League/Reward | Include only consequences the approval independently qualified and committed | Always no canopy, Circle, League, Challenge Leaf, or Family Reward change                                                |
| Path/station                | May reach stations from the committed Seed transaction                       | Completion cannot reach a Seed station by itself                                                                         |
| Badge                       | Only criteria newly completed by the approval                                | Only criteria explicitly naming that learning completion and newly satisfied                                             |
| Bundle creation             | One finite bundle when there is an approved Child-visible committed outcome  | One zero-Seed bundle only when Product approves completion acknowledgement and/or a new badge; never stack a badge modal |
| Trigger identity            | Approval event ID                                                            | Distinct learning-completion event ID, even for the same profile                                                         |

R002 candidate evidence for equal credit and zero-Seed learning is at
`docs/design/stitch/releases/ghaf-r002/GHAF_CODEX_SCREEN_FLOW_AND_INTEGRATION_PROMPT.md:440-446,621-628`; local candidate records are at
`ecbfb3a2a89fe7eefa23e8547aeb5216724ee56c:specs/003-family-growth-garden/data-model.md:521-549,700-721`.

## Zero-reward submission and recognition behavior

- **Approved baseline:** Assignment, choice, start, and submission create zero reward/growth
  (`specs/003-family-growth-garden/spec.md:1063-1064`, `SC-005`). Submission may show a normal status
  confirmation, but it must not create a celebration `RevealBundle`.
- **Recommendation, open:** A Parent-approved recognition-only or maintenance event with no new
  persistent Child-visible consequence should retain its receipt/praise but create no celebration
  bundle. If Product wants a calm acknowledgement, specify a non-reward status pattern or a distinct
  `acknowledgement` bundle kind; do not imply Seeds, growth, badge, or scarcity.
- **Unresolved:** Whether praise alone counts as sufficient Child-visible bundle content. Product and
  safeguarding owners must decide this before the discriminated union is frozen.
- A learning completion is “zero-Seed,” not “nothing happened”: it may persist that exact learning
  evidence and an eligible newly earned badge, but it must explicitly say the Seed balance did not
  change.

## Privacy and access requirements

- A bundle is readable only by its Child profile and authorized guardian view; the presenter validates
  active session capability and matching `profileId` again at recovery time.
- Never include another Child's amount, task, position, reward, evidence, notes, media, or event ID.
- League content uses only the strict child projection approved by `FR-114`; Family Reward stays
  child-and-guardians-only.
- A stale/cross-role deep link goes to the active role's safe root without acknowledging the bundle.
- Bundle history, if later approved, is private and non-shareable.

## Required tests before implementation can be approved

1. One canonical approval creates one receipt and one bundle for the same profile/trigger.
2. Double tap, retry, refresh, Back, remount, and process recovery create no duplicate transaction,
   Seed, growth, canopy, Circle, Leaf, League, reward, station, badge, safe-help, or bundle.
3. Same key/different payload and wrong-profile receipt references fail closed.
4. Every applicable remote consequence is represented; every inapplicable consequence is absent.
5. Queue order follows committed sequence; only one modal/sheet is visible.
6. Interruption at every lifecycle boundary recovers the same bundle and focus target.
7. Dismissal is idempotent and cannot roll back state.
8. Submission alone and zero-reward recognition follow the approved no-bundle/acknowledgement rule.
9. Learning completion creates zero Seeds/Garden/canopy/Circle/League/reward and can award only an
   exact named criterion once.
10. Arabic/English copy parity, bidi-isolated numbers, TalkBack order, 200% text, reduced motion,
    device Back, and true-origin restoration pass on a named Android build.

## Approval checklist

Before this contract becomes canonical, Product must approve: consequence membership; Seeds versus
Garden order; Green Circle's relationship to League/Shared Growth; Challenge Leaf mapping;
Family Reward placement; praise-only and zero-reward behavior; learning bundle contents; badge and
safe-help inclusion; and whether phase review stays outside the Child bundle. Engineering must then
approve schema, uniqueness, recovery, and persistence. Design/accessibility must approve the one-sheet
composition, focus, announcements, reduced motion, and origin restoration.

Until all decisions and missing designs are supplied, no field or sequence above is implementation
authority and the gate remains unchanged.
