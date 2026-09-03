# Feature 003 Data Model — Revision 3 Planning Amendment

**Revision 2 approved**: 2026-09-01

**Revision 3 Growth Journey planning amendment**: 2026-09-03

## Purpose and Boundary

This is the conceptual target model for Feature 003 Revision 3. It retains the approved Revision 2
access, task, garden, League, canopy, reward, assistant, and privacy contracts and adds the proposed
Growth Journey projection. R001 implements only the Welcome and first-time Parent-onboarding
subset. No Growth Journey runtime type, persistence adapter, or migration is approved; that work
remains **BLOCKED** until a complete Stitch release is supplied, approved, and reconciled.

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

Exact unreleased route identifiers are intentionally absent until Stitch intake. Persistent
navigation sets remain Parent `home | tasks | garden | family` and Child
`today | garden | league`. Impact Path and My Badges are nested Garden destinations, not tabs.

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

type MasteryFamily =
  'skill.sorting' | 'skill.water' | 'skill.energy' | 'skill.nature' | 'skill.coast_care';

interface GrowthJourneyTaskMapping {
  readonly taskId: string;
  readonly taskVersion: number;
  readonly actionType: string;
  readonly acquisitionMasteryCredits: readonly {
    readonly family: MasteryFamily;
    readonly delta: 1;
  }[];
  readonly reviewed: true;
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

Growth Journey mappings are subordinate metadata keyed to an immutable reviewed task version.
They never replace the eight category IDs or weaken `recognitionMode`, `routinePhase`, safety,
visibility, Green, League, Challenge Leaf, or Family Reward decisions. The P0
`task_recycling_p0_v1` acquisition mapping may add at most one `skill.sorting` and one
`skill.coast_care` credit after its one valid Parent approval.

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

## Growth Journey Evidence and Projections

The following records are a proposed Revision 3 extension. The Seed transaction ledger is the
only authority for lifetime Seeds. All other values below are profile-scoped projections or
immutable evidence with their own idempotency keys.

```ts
type GrowthChapterId = 'water_coast_care_v1';
type GrowthStationSeed = 120 | 132 | 144 | 156 | 168 | 180;
type GrowthStationId =
  | 'station.water_coast.120'
  | 'station.water_coast.132'
  | 'station.water_coast.144'
  | 'station.water_coast.156'
  | 'station.water_coast.168'
  | 'station.water_coast.180';
type AchievementState = 'locked' | 'in_progress' | 'awaiting_review' | 'earned';
type MasteryPhase = 'acquisition' | 'maintenance';

type AchievementId =
  | 'badge.journey.seed_start.v1'
  | 'badge.journey.growing_branch.v1'
  | 'badge.journey.expanding_shade.v1'
  | 'badge.journey.coastal_care.v1'
  | 'badge.skill.sorting.bud.v1'
  | 'badge.skill.sorting.branch.v1'
  | 'badge.skill.sorting.shade.v1'
  | 'badge.skill.water.bud.v1'
  | 'badge.skill.water.branch.v1'
  | 'badge.skill.water.shade.v1'
  | 'badge.skill.energy.bud.v1'
  | 'badge.habitat.ghaf_roots.v1'
  | 'badge.habitat.mangrove_care.v1'
  | 'badge.biodiversity.wetland_exploration.v1'
  | 'badge.heritage.date_palm_gifts.v1'
  | 'badge.heritage.sadu_patterns.v1';

interface LifetimeSeedProjection {
  readonly childId: ChildId;
  readonly confirmedTotal: number;
  readonly sourceConfirmationKeys: readonly string[];
  readonly derivedFromSeedLedger: true;
}

interface GrowthChapter {
  readonly id: GrowthChapterId;
  readonly title: LocalizedText;
  readonly startSeed: 120;
  readonly completionSeed: 180;
  readonly stationSeeds: readonly [120, 132, 144, 156, 168, 180];
  readonly free: true;
  readonly purchasableProgress: false;
}

interface GrowthStationReceipt {
  readonly id: string;
  readonly childId: ChildId;
  readonly chapterId: GrowthChapterId;
  readonly stationId: GrowthStationId;
  readonly stationSeed: GrowthStationSeed;
  readonly triggeringEvidenceKey: string;
  readonly reachedAtSequence: number;
  readonly permanent: true;
}

type AchievementCriterion =
  | { readonly type: 'lifetime_seeds'; readonly target: number }
  | { readonly type: 'station_reached'; readonly stationSeed: GrowthStationSeed }
  | {
      readonly type: 'mastery_credit';
      readonly family: MasteryFamily;
      readonly phase: 'acquisition';
      readonly target: number;
    }
  | { readonly type: 'learning_complete'; readonly learningId: LearningPackageId }
  | { readonly type: 'activity_complete'; readonly activityId: ActivityId }
  | { readonly type: 'badge_earned'; readonly badgeId: AchievementId };

interface AchievementDefinition {
  readonly id: AchievementId;
  readonly title: LocalizedText;
  readonly family: string;
  readonly masteryStage: 'bud' | 'branch' | 'shade' | null;
  readonly criteria: readonly AchievementCriterion[];
  readonly owner: string;
  readonly private: true;
  readonly permanent: true;
  readonly monetaryValue: null;
}

interface AchievementComponentProgress {
  readonly criterion: AchievementCriterion;
  readonly current: number;
  readonly target: number;
  readonly satisfied: boolean;
  readonly evidenceKeys: readonly string[];
}

interface AchievementProgress {
  readonly childId: ChildId;
  readonly badgeId: AchievementId;
  readonly state: AchievementState;
  readonly components: readonly AchievementComponentProgress[];
  readonly nextRecommended: boolean;
}

interface MasteryEvidenceEvent {
  readonly idempotencyKey: string;
  readonly childId: ChildId;
  readonly taskId: string;
  readonly taskVersion: number;
  readonly confirmationKey: string;
  readonly family: MasteryFamily;
  readonly phase: MasteryPhase;
  readonly delta: 1;
}

type LearningPackageId =
  | 'learning.ghaf_basics.v1'
  | 'learning.mangrove_roots.v1'
  | 'learning.jubail_mangrove.v1'
  | 'learning.wetland_basics.v1'
  | 'learning.date_palm.v1'
  | 'learning.sadu.v1';
type ActivityId =
  | 'activity.wetland_observation.v1'
  | 'activity.date_palm_reuse.parent_led.v1'
  | 'activity.sadu_original_pattern.v1';

interface LearningCompletionEvent {
  readonly idempotencyKey: string;
  readonly childId: ChildId;
  readonly learningId: LearningPackageId;
  readonly route: 'story' | 'equal_credit_accessible' | 'parent_guided';
  readonly seedDelta: 0;
  readonly gardenDelta: 0;
}

interface ActivityCompletionEvent {
  readonly idempotencyKey: string;
  readonly childId: ChildId;
  readonly activityId: ActivityId;
  readonly parentConfirmed: true;
  readonly seedDelta: 0;
  readonly gardenDelta: 0;
}

interface AchievementAward {
  readonly awardKey: string;
  readonly childId: ChildId;
  readonly badgeId: AchievementId;
  readonly origin: 'event' | 'migration';
  readonly evidenceKeys: readonly string[];
  readonly earnedAt:
    | { readonly status: 'known'; readonly iso8601: string; readonly eventSequence: number }
    | {
        readonly status: 'unknown_historical';
        readonly iso8601: null;
        readonly eventSequence: null;
      };
  readonly permanent: true;
}

interface SafeHelpRecognition {
  readonly recognitionKey: 'recognition.safe_help_once.v1';
  readonly childId: ChildId;
  readonly sourceConfirmationKey: string;
  readonly oneTime: true;
  readonly badge: false;
  readonly seedDelta: 0;
  readonly masteryDelta: 0;
}
```

Canonical unlock ownership is configuration, not screen logic:

| Station ID                | Versioned `unlocks[]` ownership                                                                                            | Revision 3 MVP disposition                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `station.archive.012`     | `badge.journey.seed_start.v1`                                                                                              | Provable historical award; no migration reveal                                                                                      |
| `station.archive.060`     | `badge.journey.growing_branch.v1`                                                                                          | Provable historical award; no migration reveal                                                                                      |
| `station.water_coast.120` | `badge.journey.expanding_shade.v1`                                                                                         | Evaluated in the canonical approval bundle                                                                                          |
| `station.water_coast.132` | `learning.mangrove_roots.v1`; progress reveal for `badge.habitat.mangrove_care.v1`                                         | One complete story/equal-credit package; no automatic badge                                                                         |
| `station.water_coast.144` | `garden_cosmetic.coastal_ripple.v1`                                                                                        | Permanent original cosmetic; no gameplay advantage                                                                                  |
| `station.water_coast.156` | criterion-gated `badge.skill.water.bud.v1` evaluation                                                                      | Requires station plus two distinct water acquisition credits                                                                        |
| `station.water_coast.168` | `learning.jubail_mangrove.v1`                                                                                              | Configured but Child-facing content remains blocked/deferred until its own review and approved design; P0 fixture does not reach it |
| `station.water_coast.180` | `badge.journey.coastal_care.v1`; conditional `garden.stage.next_after_mangrove.v1`; `chapter.preview.after_water_coast.v1` | Path badge/chapter complete; garden consequence only with independent landscape provenance; preview is noninteractive               |

If a threshold is reached while a composite or content gate is incomplete, the station receipt is
preserved and the exact unmet or blocked component remains visible. No fallback reward is invented.
The 168 package is not one of the fully authored P0 stories; a later released content amendment is
required before it can be presented or completed.

`nextRecommended` and archive/current labels are presentation projections, not achievement states.
Only the exact 16 IDs in `docs/content/BADGE_CATALOG.md` are configured for P0. Bud, Branch, and
Shade describe mastery stages, never rarity. Station 180 can complete the chapter and its badge;
it cannot advance a landscape unless a separate landscape rule and provenance also qualify.

## First-Run Presentation, Learning Content, and Migration

```ts
interface InstallationFirstRunPreference {
  readonly openingMomentSeen: boolean;
  readonly introductionVersionSeen: number | null;
}

interface ChildGrowthPresentationPreference {
  readonly childId: ChildId;
  readonly storiesEnabled: boolean;
}

type ReplayOrigin =
  | { readonly scope: 'install'; readonly route: 'welcome' | 'parent_settings' }
  | { readonly scope: 'child'; readonly childId: ChildId; readonly route: 'child_settings' };

interface DeferredAuthorizedNavigation {
  readonly destination: string;
  readonly role: ExperienceRole;
  readonly childId: ChildId | null;
  readonly status: 'pending' | 'consumed' | 'rejected';
}

interface GrowthNavigationPresentationState {
  readonly replayOrigin: ReplayOrigin | null;
  readonly deferredNavigation: DeferredAuthorizedNavigation | null;
  readonly nestedRouteOriginByChild: Readonly<Record<ChildId, string | null>>;
}

interface ContentSourceRecord {
  readonly id: 'E1' | 'E2' | 'E3' | 'E4';
  readonly url: string;
  readonly factSummary: LocalizedText;
  readonly creativeLore: LocalizedText | null;
  readonly factualReview: 'not_run' | 'approved' | 'changes_required';
  readonly culturalReview: 'not_required' | 'not_run' | 'approved' | 'changes_required';
  readonly rightsReview: 'not_run' | 'approved' | 'changes_required';
}

interface GrowthMigrationReceipt {
  readonly migrationKey: string;
  readonly schemaFrom: number;
  readonly schemaTo: 5;
  readonly evaluationVersion: 'growth_evaluator.v1';
  readonly childId: ChildId;
  readonly evidenceKeysUsed: readonly string[];
  readonly badgeIdsBackfilled: readonly AchievementId[];
  readonly inferredMasteryCredits: 0;
  readonly seedDelta: 0;
  readonly revealQueued: false;
}
```

The native system splash is configuration, not a route. The optional Opening Moment and exactly
three role-neutral panels hand off to the released R001 `/` after Finish or Skip. Manual replay
returns to a validated origin and mutates no domain data. A Child route or preference always carries
that Child's ID; install-level flags never impersonate profile state. Deferred navigation is
validated against role and Child ID before use, then consumed or rejected. Source access never means
Ghaf factual, cultural, accessibility, safeguarding, or rights approval.

New event awards record the trusted event timestamp and monotonic sequence. A historical migration
copies a date only when its immutable evidence proves that date; otherwise it stores
`unknown_historical` and the UI says the date is unavailable rather than displaying migration time.
The migration key includes `evaluationVersion`. Criteria changes require a new versioned definition
or an explicit prospective migration; they never revoke or silently reinterpret an earned award.

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
  readonly growthEvaluationKey: string;
  readonly revealBundleId: string;
  readonly presentationOrder: readonly [
    'praise',
    'self_reported_activity_if_present',
    'seeds',
    'garden',
    'canopy',
    'challenge_leaf_and_league',
    'impact_path_badges_and_recognition',
    'family_reward',
  ];
}

interface RevealBundle {
  readonly id: string;
  readonly childId: ChildId;
  readonly triggeringEvidenceKey: string;
  readonly recognitionReceiptKey: string | null;
  readonly learningCompletionKey: string | null;
  readonly activityCompletionKey: string | null;
  readonly stationReceiptIds: readonly string[];
  readonly badgeAwardKeys: readonly string[];
  readonly safeHelpRecognitionKey: string | null;
  readonly status: 'pending' | 'seen';
  readonly reducedMotionEquivalent: true;
}
```

The first valid confirmation stores one immutable receipt and commits all valid state atomically.
Repeated confirmation returns the stored receipt with `already_confirmed` and performs no mutation
or second reveal. Presentation may be animated, but state correctness does not depend on animation
callbacks. An optional honestly labelled self-reported activity result appears after praise. Path,
badge, and safe-help consequences follow League/canopy consequences; the private Family Reward is
always last. A learning-only completion may create its own finite bundle but changes no Seed,
garden, canopy, League, or Family Reward value.

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

## Revision 3 Target Session and Reset

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

interface Revision3GrowthSessionExtension {
  readonly schemaVersion: 5;
  readonly installationPresentation: InstallationFirstRunPreference;
  readonly childPresentation: Readonly<Record<ChildId, ChildGrowthPresentationPreference>>;
  readonly navigationPresentation: GrowthNavigationPresentationState;
  readonly lifetimeSeeds: Readonly<Record<ChildId, LifetimeSeedProjection>>;
  readonly growthChapters: readonly GrowthChapter[];
  readonly growthStationReceipts: readonly GrowthStationReceipt[];
  readonly achievementDefinitions: readonly AchievementDefinition[];
  readonly achievementProgress: Readonly<Record<ChildId, readonly AchievementProgress[]>>;
  readonly achievementAwards: readonly AchievementAward[];
  readonly masteryEvidence: readonly MasteryEvidenceEvent[];
  readonly learningCompletions: readonly LearningCompletionEvent[];
  readonly activityCompletions: readonly ActivityCompletionEvent[];
  readonly safeHelpRecognitions: readonly SafeHelpRecognition[];
  readonly revealBundles: readonly RevealBundle[];
  readonly migrationReceipts: readonly GrowthMigrationReceipt[];
}

type Revision3PrototypeSession = Omit<Revision2PrototypeSession, 'schemaVersion'> &
  Revision3GrowthSessionExtension;
```

The current R001 runtime uses a partial schema-4 aggregate for Parent onboarding. A future target
schema 5 composes that aggregate with `Revision3GrowthSessionExtension` only after the persistence
gap and migration behavior are approved. This document does not authorize a storage library.

Canonical reset restores:

- Arabic RTL welcome/access, signed out, with no protected Back history;
- synthetic Al Noor, Salem 9, Alya 11, and prepared access/pairing fixtures;
- real camera/microphone disabled, prepared voice enabled, captions on;
- Salem 4/5 = 80, Mariam 5/5 = 100, Alya 3/5 = 60, Rashid 2/5 = 40;
- Mangrove 48/60 Shoot and family canopy 19/25;
- Salem lifetime Seeds 108, no Water & Coast station receipt yet, and 108/120 toward the first
  chapter station;
- Salem reward progress 108/120, AED 25, `promised`;
- Seed Start and Growing Branch present only with provable historical evidence and no migration
  reveal; pre-approval acquisition mastery is sorting 0, water 2, energy 1, nature 2, and coast care
  2;
- Ghaf Basics complete; Mangrove Roots and the three P0 activities incomplete;
- no pending reveal or safe-help recognition;
- installation first-run flags preserved by Parent reset and cleared only by the separate operator
  first-run reset; per-Child story preferences preserved; transient navigation intent cleared;
- no active task/submission/recognition or result bundle; and
- the exact prepared Guide, Coach, image, and voice identifiers.

The first valid P0 approval atomically changes lifetime Seeds 108 → 120, Mangrove 48/60 Shoot →
60/60 Sapling, canopy 19/25 → 20/25, Salem 4/5 → 5/5 and 80 → 100, and Family Reward eligible
progress 108/120 Promised → 120/120 Unlocked. It records station 120; shows Path 120/180 with next
station 132; adds one sorting and one coast-care acquisition credit; awards Expanding Shade and
Sorting Bud so the Gallery has four earned badges; and may add the one-time safe-help recognition
when its explicit evidence qualifies. One `RevealBundle` presents those consequences with the
private Family Reward last. Duplicate approval repeats none of them.

`resetPrototype()` replaces the complete aggregate; it does not patch counters individually. The
navigation adapter then returns to Arabic RTL welcome/access and clears protected history.
Ordinary restart and manual introduction replay preserve earned records, install first-run flags,
and per-Child story preferences. The explicit Parent-authorized demo reset restores the domain
fixture and clears transient navigation intent without changing those preferences. The operator-only
first-run reset may separately clear only install-level Opening Moment/introduction flags. Neither
path requires network, camera, microphone, authentication service, payment, invitation, or AI
service.
