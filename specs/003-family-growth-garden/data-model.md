# Feature 003 Data Model — Revision 2

**Revision 2 approved**: 2026-09-01

## Purpose and Boundary

This is the approved conceptual model for Feature 003 Revision 2. It supersedes the Revision 1
linear-route/Circle model for future implementation while preserving that implementation as
history. No Revision 2 runtime type or migration is implemented yet; the work remains **BLOCKED**
until approved Stitch designs are reconciled.

Every access record, household, Child, device, League member, reward, assistant result, media item,
and voice state in P0 is deterministic and synthetic/prepared. The model does not represent
production authentication, payment, custody, networking, or real Child media.

## Canonical Scalars

```ts
type LocaleCode = 'ar' | 'en';
type TextDirection = 'rtl' | 'ltr';
type ExperienceRole = 'parent' | 'child';
type AgeBand = '6_8' | '9_11' | '12_14';
type CapabilityOrigin = 'synthetic' | 'prepared' | 'simulated';
type FixedSeedAward = 4 | 6 | 8 | 12 | 15;
type LandscapeId = 'ghaf' | 'samar' | 'sidr' | 'date_palm' | 'mangrove';
type GardenStage = 'seed' | 'shoot' | 'sapling' | 'shade' | 'flourishing';

interface LocalizedText {
  readonly ar: string;
  readonly en: string;
}
```

Exact route identifiers are intentionally absent until Stitch intake. Persistent navigation sets
are fixed as Parent `home | tasks | garden | family` and Child `today | garden | league`.

## Synthetic Access and Protection State

```ts
type AccessState = 'signed_out' | 'verifying' | 'authenticated_parent' | 'authenticated_child';

interface ParentAccessFixture {
  readonly origin: 'synthetic';
  readonly identifierKind: 'email' | 'phone';
  readonly verificationState: 'idle' | 'code_sent' | 'invalid' | 'verified';
  readonly returnGate: 'pin' | 'passkey_simulation' | 'biometric_simulation';
  readonly productionAuthentication: false;
}

interface ChildAccessFixture {
  readonly origin: 'synthetic';
  readonly childId: ChildId;
  readonly sharedDeviceGate: 'pin' | 'picture_sequence';
  readonly pairingId: string | null;
  readonly productionAuthentication: false;
}

type PairingState =
  'created' | 'awaiting_parent' | 'approved' | 'denied' | 'expired' | 'offline' | 'revoked';

interface DevicePairing {
  readonly id: string;
  readonly childId: ChildId;
  readonly method: 'prepared_qr' | 'short_code';
  readonly state: PairingState;
  readonly origin: 'simulated';
  readonly cameraUsed: false;
  readonly networkUsed: false;
}

interface ParentReauthentication {
  readonly state: 'required' | 'verified' | 'expired';
  readonly scope:
    | 'monetary_reward'
    | 'family_member'
    | 'league_membership'
    | 'trusted_device'
    | 'media_permission';
  readonly origin: 'simulated';
}
```

Child access never contains Parent reports, permissions, member controls, or reward-edit authority.
A reauthentication receipt is short-lived, scope-bound, and synthetic.

## Household, Profiles, and Permissions

```ts
type ChildId = 'child_salem' | 'child_alya';

interface SyntheticChildProfile {
  readonly id: ChildId;
  readonly nickname: LocalizedText;
  readonly age: 9 | 11;
  readonly ageBand: '9_11';
  readonly treeAvatarId: string;
  readonly preferredLocale: LocaleCode;
  readonly accessibilityDefaults: readonly string[];
  readonly origin: 'synthetic';
}

interface ChildPermissions {
  readonly childId: ChildId;
  readonly preparedVoiceEnabled: boolean;
  readonly captionsEnabled: boolean;
  readonly slowerPlaybackEnabled: boolean;
  readonly reducedMotion: boolean;
  readonly textScale: number;
  readonly realMicrophone: false;
  readonly realCamera: false;
}

interface SyntheticHousehold {
  readonly id: 'household_al_noor';
  readonly childIds: readonly ['child_salem', 'child_alya'];
  readonly trustedDevices: readonly DevicePairing[];
  readonly canopy: FamilyCanopy;
  readonly origin: 'synthetic';
}
```

## Task and Recognition Spine

The eight categories and five landscape mappings remain inherited product data. Revision 2 adds a
distinct `challengeLeafEligible` decision; it MUST NOT reuse Revision 1 `circleEligible`.

```ts
type TaskLifecycle =
  | 'draft'
  | 'reviewed'
  | 'assigned'
  | 'chosen'
  | 'in_progress'
  | 'submitted'
  | 'retry'
  | 'confirmed'
  | 'recognized';

type FamilyRewardEligibilityDecision =
  | {
      readonly eligible: true;
      readonly sourceTaskId: string;
      readonly sourceTaskVersion: number;
      readonly reason: 'eligible';
      readonly failClosed: true;
    }
  | {
      readonly eligible: false;
      readonly sourceTaskId: string;
      readonly sourceTaskVersion: number;
      readonly reason:
        | 'recognition_only'
        | 'sensitive_or_private'
        | 'basic_need_or_essential_access'
        | 'unknown_or_unreviewed';
      readonly failClosed: true;
    };

interface ReviewedTask {
  readonly id: string;
  readonly version: number;
  readonly childId: ChildId;
  readonly categoryId: string;
  readonly landscapeId: LandscapeId;
  readonly title: LocalizedText;
  readonly definitionOfDone: LocalizedText;
  readonly whyItMatters: LocalizedText;
  readonly steps: readonly LocalizedText[];
  readonly ageBands: readonly AgeBand[];
  readonly estimatedEffort: LocalizedText;
  readonly permittedHelp: LocalizedText;
  readonly supervision: 'none' | 'nearby_adult' | 'direct_adult';
  readonly adultBoundary: LocalizedText;
  readonly safetyExclusions: readonly LocalizedText[];
  readonly optionalEvidence: boolean;
  readonly recognitionMode: 'standard' | 'fade_first' | 'recognition_only';
  readonly routinePhase: 'acquisition' | 'maintenance' | 'not_applicable';
  readonly recurrent: boolean;
  readonly displayedSeedAward: FixedSeedAward | null;
  readonly familyRewardEligibility: FamilyRewardEligibilityDecision;
  readonly challengeLeafEligible: boolean;
  readonly circleEligible: boolean;
  readonly visibilityScope: 'child_guardian' | 'household';
  readonly lifecycle: TaskLifecycle;
}

interface Submission {
  readonly id: string;
  readonly taskId: string;
  readonly taskVersion: number;
  readonly completionMode: 'independent' | 'permitted_help' | 'accessibility_adapted';
  readonly preparedMediaIds: readonly string[];
  readonly reflection: LocalizedText | null;
  readonly observableFacts: readonly LocalizedText[];
}
```

Assignment, choice, start, Coach use, and submission create no Seed, garden, canopy, League, or
Family Reward effect. A retry creates no loss. A smaller/equivalent task receives a new prospective
reviewed version before Child acceptance. `circleEligible = true` is valid only for Green Impact
with `visibilityScope = 'household'`; it remains independent of `challengeLeafEligible` and never
enters a League row. Recognition-only and maintenance work creates no Seed, persistent
landscape/canopy growth, or coarse Circle event.

## Ghaf Family League

```ts
type LeagueMemberId = 'child_salem' | 'child_alya' | 'cousin_mariam' | 'cousin_rashid';
type ChallengeLeafState = 'planned' | 'confirmed';

interface ChallengeLeaf {
  readonly id: string;
  readonly weekId: string;
  readonly memberId: LeagueMemberId;
  readonly slot: 1 | 2 | 3 | 4 | 5;
  readonly approvedTaskRef: string;
  readonly state: ChallengeLeafState;
  readonly confirmedByParent: boolean;
  readonly fullCredit: true;
}

interface LeagueWeek {
  readonly id: string;
  readonly state: 'setup' | 'active' | 'completed' | 'rest';
  readonly memberIds: readonly LeagueMemberId[];
  readonly leavesByMember: Readonly<Record<LeagueMemberId, readonly ChallengeLeaf[]>>;
  readonly cooperativeCanopyGoal: FamilyCanopy;
  readonly origin: 'synthetic';
}

interface LeagueProjectionRow {
  readonly nickname: LocalizedText;
  readonly treeAvatarId: string;
  readonly position: number;
  readonly weeklyGrowthScore: 0 | 20 | 40 | 60 | 80 | 100;
  readonly confirmedLeaves: 0 | 1 | 2 | 3 | 4 | 5;
}
```

Validation and derivation rules:

1. An active non-rest week has exactly five distinct slots per participating member.
2. `weeklyGrowthScore = confirmedLeaves / 5 * 100`; extra tasks are ignored.
3. Sort by score descending. Equal scores share the same competition position; the next position is
   the one-based row index, producing `1, 1, 3, 4`. No timestamp or speed enters the algorithm.
4. Permitted help, accessibility adaptations, and agreed equivalents keep `fullCredit = true`.
5. Prayer, affection, emotional disclosure, food consumption, private wellbeing, hygiene,
   disability-related routines, and proof of love are never eligible source tasks.
6. Projection is constructed only after private-source validation. Unknown/private fields cause
   rejection before a row or shared counter exists.

Every newly confirmed Challenge Leaf produces at most one cooperative canopy contribution. Weekly
rollover replaces League slots/scores but not Seeds, gardens, canopy history, or rewards.

## Family Canopy

```ts
interface FamilyCanopy {
  readonly contributionLeaves: number;
  readonly goalLeaves: 25;
}

interface CanopyContribution {
  readonly confirmationKey: string;
  readonly leafDelta: 1;
  readonly reason: 'confirmed_challenge_leaf';
}
```

The P0 event changes 19/25 → 20/25 once. The confirmation key prevents the garden and League paths
from adding two leaves for the same action.

## Family Reward

```ts
type RewardState = 'promised' | 'unlocked' | 'given';
type RewardKind = 'money' | 'family_experience' | 'privilege' | 'gift';

type RewardMilestone =
  | {
      readonly type: 'new_eligible_seeds';
      readonly target: number;
      readonly baseline: number;
      readonly progressSource: 'eligible_confirmations_only';
    }
  | {
      readonly type: 'landscape_stage';
      readonly landscapeId: LandscapeId;
      readonly target: GardenStage;
      readonly eligibleStageBaseline: GardenStage;
      readonly progressSource: 'eligible_confirmations_only';
    }
  | {
      readonly type: 'landscapes_at_sapling';
      readonly targetCount: number;
      readonly progressSource: 'eligible_confirmations_only';
    };

interface FamilyRewardPlan {
  readonly id: string;
  readonly version: number;
  readonly childId: ChildId;
  readonly milestone: RewardMilestone;
  readonly rewardKind: RewardKind;
  readonly description: LocalizedText;
  readonly currency: 'AED' | null;
  readonly amount: number | null;
  readonly monthKey: string;
  readonly progress: number;
  readonly state: RewardState;
  readonly agreedSnapshotImmutable: true;
  readonly deliveredOutsideApp: true;
  readonly rankIndependent: true;
  readonly custody: false;
  readonly exchangeRate: null;
}

interface MonthlyPromiseSummary {
  readonly monthKey: string;
  readonly currency: 'AED';
  readonly maximumPromised: number;
  readonly privateToGuardians: true;
}
```

Only `promised → unlocked → given` is valid. Unlocked cannot reverse or be deleted as punishment.
Changing a future promise creates a new plan/version and leaves the agreed snapshot intact. The
monthly maximum is the deterministic sum of each agreed monetary plan assigned to the month,
whether Promised, Unlocked, or Given. Draft and nonmonetary plans add zero. Money never enters a
League projection. Validation rejects prayer, affection, emotional disclosure, eating or body
outcomes, private wellbeing or disability-related activity, and proof of love as monetary
milestones. A Family Reward cannot condition food, water, clothing, safe shelter, sleep,
healthcare, education, transport, ordinary family contact, affection, safety, dignity, or ordinary
religious participation.

All plan progress consumes eligibility from the immutable confirmation receipt. A false or missing
decision adds zero. Seed milestones sum only eligible Seed transactions. Landscape and
multi-landscape milestones evaluate `familyRewardEligibleStage`; displayed aggregate growth can
never unlock a plan by itself.

The P0 plan is Salem, `new_eligible_seeds`, target 120, progress 108, AED 25, `promised`. The one
valid recycling confirmation carries `eligible: true`; its 12-Seed result changes progress to 120
and state to `unlocked`.

## Garden and Seed Progress

```ts
interface SeedTransaction {
  readonly confirmationKey: string;
  readonly childId: ChildId;
  readonly amount: FixedSeedAward;
  readonly familyRewardEligibility: FamilyRewardEligibilityDecision;
  readonly permanent: true;
  readonly financialValue: null;
}

interface FamilyRewardContribution {
  readonly confirmationKey: string;
  readonly taskId: string;
  readonly taskVersion: number;
  readonly childId: ChildId;
  readonly landscapeId: LandscapeId;
  readonly eligibleSeedDelta: FixedSeedAward | 0;
  readonly decision: FamilyRewardEligibilityDecision;
}

interface LandscapeProgress {
  readonly landscapeId: LandscapeId;
  readonly cumulativeSeeds: number;
  readonly stage: GardenStage;
  readonly familyRewardEligibleSeeds: number;
  readonly familyRewardEligibleStage: GardenStage;
  readonly symbolicOnly: true;
}
```

Stages remain Seed 0, Shoot 20, Sapling 60, Shade 120, Flourishing 200. The P0 Mangrove starts at
48/60 Shoot and becomes 60/60 Sapling after exactly 12 Seeds.

## Confirmation Receipt and Ordering

```ts
interface RecognitionReceipt {
  readonly confirmationKey: string;
  readonly submissionId: string;
  readonly praise: LocalizedText;
  readonly seedTransaction: SeedTransaction;
  readonly familyRewardContribution: FamilyRewardContribution;
  readonly landscapeBefore: LandscapeProgress;
  readonly landscapeAfter: LandscapeProgress;
  readonly canopyContribution: CanopyContribution;
  readonly challengeLeafId: string;
  readonly leagueScoreBefore: 80;
  readonly leagueScoreAfter: 100;
  readonly familyRewardPlanId: string;
  readonly rewardStateBefore: 'promised';
  readonly rewardStateAfter: 'unlocked';
  readonly presentationOrder: readonly [
    'praise',
    'seeds',
    'garden',
    'canopy',
    'challenge_leaf',
    'family_reward',
  ];
}
```

The first valid confirmation stores one immutable receipt and commits all valid state atomically.
Repeated confirmation returns the stored receipt with `already_confirmed` and performs no mutation
or second celebration. Presentation may be animated, but state correctness does not depend on
animation callbacks. The reward message appears only after praise and garden growth.

## Prepared Coach and Voice State

```ts
type CoachIntent = 'show_steps' | 'help_plan' | 'simplify' | 'ask_adult' | 'prepared_push_to_talk';

interface PreparedVoiceInteraction {
  readonly fixtureId: 'fixture_salem_plan_ar_v1';
  readonly origin: 'prepared';
  readonly taskId: string;
  readonly visibleState: 'idle' | 'recording_simulated' | 'transcript_ready' | 'deleted' | 'sent';
  readonly transcript: LocalizedText | null;
  readonly replayAvailable: boolean;
  readonly slowerPlaybackAvailable: boolean;
  readonly captionsAvailable: true;
  readonly deleteBeforeSend: true;
  readonly microphoneUsed: false;
  readonly backgroundListening: false;
}
```

Age-band policies determine step count, tone, available intents, and speed. P0 uses prepared MSA
safety/task copy and reviewed prepared conversational variants; it does not claim unrestricted
speech or code-switch understanding.

## Revision 2 Prototype Session and Reset

```ts
interface Revision2PrototypeSession {
  readonly schemaVersion: 4;
  readonly implementationStatus: 'design_blocked' | 'implemented';
  readonly locale: LocaleCode;
  readonly direction: TextDirection;
  readonly accessState: AccessState;
  readonly activeRole: ExperienceRole | null;
  readonly parentAccess: ParentAccessFixture;
  readonly childAccess: ChildAccessFixture | null;
  readonly pairings: readonly DevicePairing[];
  readonly household: SyntheticHousehold;
  readonly children: Readonly<Record<ChildId, SyntheticChildProfile>>;
  readonly permissions: Readonly<Record<ChildId, ChildPermissions>>;
  readonly task: ReviewedTask | null;
  readonly submission: Submission | null;
  readonly landscapes: Readonly<Record<LandscapeId, LandscapeProgress>>;
  readonly leagueWeek: LeagueWeek;
  readonly rewardPlans: readonly FamilyRewardPlan[];
  readonly recognitionLedger: Readonly<Record<string, RecognitionReceipt>>;
  readonly preparedGuideFixtureId: 'guide_recycling_refine_v1';
  readonly preparedCoachFixtureId: 'coach_recycling_steps_v1';
  readonly preparedVoiceFixtureId: 'fixture_salem_plan_ar_v1';
}
```

Canonical reset restores:

- Arabic RTL welcome/access, signed out, with no protected Back history;
- synthetic Al Noor, Salem 9, Alya 11, and prepared access/pairing fixtures;
- real camera/microphone disabled, prepared voice enabled, captions on;
- Salem 4/5 = 80, Mariam 5/5 = 100, Alya 3/5 = 60, Rashid 2/5 = 40;
- Mangrove 48/60 Shoot and family canopy 19/25;
- Salem reward progress 108/120, AED 25, `promised`;
- no active task/submission/recognition or celebration; and
- the exact prepared Guide, Coach, image, and voice identifiers.

`resetPrototype()` replaces the complete aggregate; it does not patch counters individually. The
navigation adapter then returns to welcome/access and clears protected history. Reset requires no
network, camera, microphone, auth, payment, invitation, or AI service.
