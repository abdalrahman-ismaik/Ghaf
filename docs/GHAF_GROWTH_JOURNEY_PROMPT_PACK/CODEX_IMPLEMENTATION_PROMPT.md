# Codex Master Implementation Prompt — Ghaf Opening, Onboarding, Impact Path, and Badges

Paste this prompt into Codex at the root of the Ghaf implementation repository. Attach or place
`GHAF_GROWTH_JOURNEY_RESEARCH_AND_SPEC.md` beside the repository documentation before starting.

```text
You are the senior product engineer and design-systems implementer for Ghaf — غاف. Extend the
existing Arabic-first UAE family growth application with a refined launch/onboarding experience and
a child-safe, game-rich progression system called “مسار الأثر” (Impact Path), including permanent
badges, achievements, UAE learning stories, a private badge gallery, and a Parent progress view.

Your task is to inspect the existing code and documentation, implement the feature end to end,
verify it, and leave a truthful professional handoff. Do not merely create static mockups. Do not
rewrite unrelated flows or replace the existing architecture without evidence that it is necessary.

READ FIRST
1. Read all repository instructions, especially AGENTS.md, README, PRODUCT.md, DESIGN.md,
   DESIGN_DIRECTION.md, PROTOTYPE_LIMITATIONS.md, CONTRIBUTING.md, DEMO_RUNBOOK.md, and tests.
2. Read GHAF_GROWTH_JOURNEY_RESEARCH_AND_SPEC.md completely.
3. Inspect package manifests, route/state architecture, localization, token system, fixture store,
   reward reducer/service, test stack, native/Expo/PWA configuration, and current screenshots.
4. Run the current quality gates before changing code and record the baseline. Do not “fix” unrelated
   user changes or discard a dirty worktree.
5. Produce a short implementation plan and a source-of-truth matrix before editing.

PRODUCT DECISION
Borrow the clarity of a premium game pass—visible path, finite chapters, previewed next unlocks,
badge collection, mastery stages, and satisfying reveals—without importing its monetization or
compulsion mechanics.

The child-facing product name is “مسار الأثر”, not “Royale Pass,” “Battle Pass,” or a transliteration.
The gallery is “شاراتي”. The umbrella editorial name may be “رحلة غاف”. Use “مكتسبة” for earned,
“خطوتك التالية” only for a reachable next recommendation, and “متاحة لاحقًا” for a locked item while
always showing its exact unmet requirement; avoid punitive child-facing wording.

NON-NEGOTIABLE GUARDRAILS
- One free path only. No child-facing purchases, paid track, purchasable Seeds, boosts, ads, or
  pay-to-skip.
- No random rewards, loot boxes, chests, spins, mystery odds, rarity gambling, or variable rewards.
- No streak loss, expiry of earned progress, countdown urgency, exclusive-for-today copy, nagging
  notifications, autoplay, or infinite reward loops.
- No public Child profiles, rankings, percentiles, podiums, opponent comparisons, chat, comments,
  badge sharing, or cross-family raw totals.
- No GPS, check-ins, photo proof, audio proof, or claim that a Child visited an attraction.
- No claim that an app action planted a tree, saved an animal, delivered quantified environmental
  impact, or earned an official UAE/UNESCO/attraction credential.
- Seeds/path thresholds come only from existing Parent-confirmed reward-eligible acquisition tasks.
  Bounded mastery evidence may come from a confirmed acquisition occurrence or an explicitly
  eligible approved maintenance occurrence; maintenance never mints Seeds. A completed, fact-reviewed
  learning module or its equivalent may satisfy only its stated learning/composite badge criterion.
  Merely opening/viewing content, submitting a task, retry, duplicated/recreated occurrences, and
  recognition-only activity mint neither Seeds nor badges.
- Badges never award additional Seeds. They acknowledge milestones and mastery without inflating the
  existing reward economy.
- Earned Seeds, badges, garden growth, and chapter progress are permanent and cannot decay or be
  deducted.
- All Child achievement data is private to the Child and guardians in P0.

CANONICAL EXISTING RULES
- Seeds are the only progression unit: symbolic, nonfinancial, nontransferable, non-purchasable,
  fixed before a task begins, and issued only after Parent confirmation.
- The Parent approval event is idempotent and remains the sole authority for task-based growth.
- Descriptive Parent praise appears before numeric or collectible outcomes.
- Help, permitted adult assistance, retry, substitution, and smaller steps remain dignified paths.
- The established Child bottom navigation remains three destinations in physical left-to-right
  order: “الدوري | حديقتي | اليوم”. Do not add a cramped fourth item. Surface Impact Path prominently
  within Garden and as a compact entry card on Today.
- Parent mode stays calm and utility-led. Child mode may be richer and more exploratory but must not
  resemble a casino, battle game, toy UI, or dense game HUD.
- Prototype content and identities are synthetic/local unless the repository proves otherwise.

SOURCE-OF-TRUTH RECONCILIATION
Preserve this canonical four-state timeline. Seeds and Mangrove-stage growth are different measures;
48→60 is not an obsolete Seed scenario:

| State | Lifetime Seeds | Current Mangrove stage | Required meaning |
| --- | ---: | ---: | --- |
| Before the already-designed recycling approval | 108/120 | 48/60 | Task is awaiting Parent review; no reward is committed |
| Parent approval transaction | +12 once | +12 once | One idempotent acquisition approval commits both projections |
| Approved historical result / new-feature starting fixture | 120 lifetime | 60/60 complete | The completed Mangrove stage remains archived and permanent |
| Next cumulative Impact Path | 120→180 lifetime | next garden stage | Progress continues from 120; nothing resets |

Do not replace or rewrite legitimate before-approval, awaiting-review, approval, retry, or historical
fixtures merely because the new default fixture starts at 120. Migrate each snapshot according to its
actual lifecycle state, keep immutable history intact, and add a fixture/state identifier for each row
above. The next eligible 12-Seed approval from the 120 starting fixture reaches 132 exactly and
unlocks the “بين جذور القرم” station/story; it must never be described as merely getting closer. If a newer
explicit repository decision conflicts with this table, stop and surface it before implementation.

DELIVERABLE A — CORRECT LAUNCH ARCHITECTURE
Implement two distinct layers, conditional on the repository's actual platform:

1. System launch surface
   - Native iOS/Android or Expo: configure the real platform launch/splash mechanism using the
     existing app icon and one approved static Ghaf background color. The OS controls when it first
     appears; do not attempt to turn it into an interactive screen.
   - PWA/web: configure the manifest/theme/background and a stable initial document paint. Do not
     claim that this is a native launch screen or recreate a fake native splash route.
   - If the repository has no native target, record that limitation and implement only the valid web
     behavior. Do not add an unsupported native shell merely for this deliverable.
   - On every applicable cold/warm launch, show no CTA, tagline, spinner, progress percentage, fake
     loading, or marketing copy. Release it promptly once the app can render an in-app bootstrap or
     recovery state; never wait on “error resolution” and never hold it for a timer.
   - Android icon animation, if supported, is no longer than 1,000 ms and may finish sooner. Verify
     icon density/safe-zone behavior without cropping.

2. In-app Ghaf Opening Moment
   - This is a branded first-install state, not the system launch surface. Show it only on first
     install before the first onboarding; an onboarding-version update or guardian replay starts at
     onboarding and does not replay this brand reveal.
   - It has zero required minimum duration, is immediately interruptible once routing is safe, and
     has a hard maximum of 1,200 ms. Never delay a ready route for marketing.
   - Show the existing canonical Ghaf mark; do not invent a replacement logo.
   - Live Arabic wordmark “غاف” and tagline “كل خطوة صغيرة تُنبت أثرًا.”
   - A Seed settles into a subtle UAE landscape line and one leaf opens. Motion then stops.
   - Reduced motion uses the static end state plus a short dissolve or no transition.

3. Bootstrap recovery and deterministic entry routing
   - Resolve locale, fonts, local schema/fixture hydration, session, active profile, onboarding
     version, last valid root, and pending deep-link intent in an in-app bootstrap coordinator.
   - On recoverable bootstrap failure, release the system splash and show a readable in-app recovery
     surface with “إعادة المحاولة” and a safe route to the existing access/demo reset flow. Never
     leave a blank or permanently held launch surface.
   - Apply this precedence exactly:
     1. bootstrap/recovery;
     2. validate and retain any authorized deep-link intent, but do not bypass onboarding, access,
        role, or profile authorization;
     3. if this is first install and onboarding is incomplete, show Opening Moment then onboarding;
        an app/content update never auto-opens onboarding and instead routes normally with a quiet,
        optional “what’s new” entry to manual replay;
     4. if signed out, show the existing access/setup surface;
     5. if signed in as Parent, open the last valid Parent root;
     6. if signed in as Child, open that profile's last valid Child root;
     7. after required onboarding/access, fulfill the retained deep link if it is still authorized,
        otherwise fall back to the appropriate role root with a neutral explanation.
   - On a shared device, switching profiles changes all role/profile-scoped state and last-root state;
     it never exposes another Child's path or gallery. The onboarding-seen version is an install/app
     preference, not a reward record and not evidence that every profile completed a lesson.
   - System, Android, and browser Back must follow real history. Nested routes retain an explicit
     safe origin (Today, Garden, Gallery, Parent, or authorized deep link) and fall back to their
     role-appropriate root if that origin is absent or unauthorized.

DELIVERABLE B — THREE-SCREEN FIRST-RUN ONBOARDING
Onboarding must be role-neutral because it appears before access/role selection. Automatic onboarding
appears only on fresh install; app/content version updates never auto-open or block it. It is
skippable, replayable by a guardian from Help/Settings, and must not request permissions, ratings,
purchases, or a Child email/phone/location. A manual replay returns to the recorded origin and never
changes account, profile, task, Seed, badge, or analytics state.

Screen 1
- Title: “خطوات صغيرة، أثر يكبر”
- Body: “تتحوّل مهام الأسرة اليومية إلى عادات للعناية بالبيت والبيئة من حولنا.”
- Support: “كل خطوة واضحة تساعد الأثر على النمو.”
- Visual: Parent and Child hands tending one Ghaf sapling; no identifiable people, stereotypes, or
  baked-in text.
- Actions: primary “التالي”; quiet “تخطّي المقدمة”; status “الخطوة 1 من 3”.

Screen 2
- Title: “من المهمة إلى البذور”
- Body: “بعد مراجعة أحد الوالدين أو وليّ الأمر، تتحوّل المهمة المكتملة والمؤهلة إلى بذور تساعد الحديقة على بلوغ مراحل جديدة.”
- Support: “تُضاف البذور بعد المراجعة، ليبقى التقدّم واضحًا وعادلًا.”
- Teach through one interaction: tap a sample completed recycling task; show a Parent-approval check;
  move one demo Seed into a young plant.
- Label it “تجربة توضيحية”. It must operate in isolated demo state and never mutate a profile,
  transaction ledger, garden, path, badge, or analytics identity.
- Actions: primary “التالي”; secondary “السابق”; quiet “تخطّي المقدمة”; status “الخطوة 2 من 3”.

Screen 3
- Title: “شارات من بيئتنا وتراثنا”
- Body: “تفتح المهام التي تمت مراجعتها ووحدات التعلّم مسارات عن الغاف والقرم والواحات والتراث ومعالم الاستدامة. لكل شارة معيار واضح، وكل شارة مكتسبة تبقى في المجموعة.”
- Support: “توجد مسارات مختلفة، والتقدّم فيها يتم بالوتيرة المناسبة لكل أسرة.”
- Privacy: “رحلتك خاصة بأسرتك، ولا توجد قوائم ترتيب عامة.”
- Preview one earned demo badge, two reachable next badges with exact criteria, and quiet farther-ahead
  silhouettes. No price, odds, timer, rarity, or “exclusive” label.
- Actions: primary “بدء الرحلة”; secondary “السابق”; quiet “تخطّي المقدمة”;
  status “الخطوة 3 من 3”.

Both completion and Skip must route to the existing access/setup flow. Do not silently create an
account. Both actions atomically mark the current onboarding version as seen; Skip is not an
uncommitted state that reappears on relaunch. Persist this preference separately from the prototype
session/reward state. Add a guardian/demo-only “إعادة عرض المقدمة” action that records and
returns to its true origin.

DELIVERABLE C — IMPACT PATH DOMAIN
Implement Impact Path as a read projection of the canonical permanent Seed ledger, not a second
currency. Use configuration-driven chapters, stations, conditional unlocks, and immutable unlock
receipts.

P0 chapter:
- id: water_coast_care_v1
- Arabic: “العناية بالمياه والسواحل”
- range: starts at 120 lifetime approved Seeds and completes at 180. At exactly 180, render this
  chapter as complete and preserved, plus a preview of the next chapter; do not make two chapters
  simultaneously current. The next configured chapter becomes current only under its explicit
  boundary rule.
- canonical stations and unlock ownership:
  - 120 / `station.water_coast.120` / “بداية المرحلة”: chapter-start marker; the completed Mangrove stage and prior
    achievements remain preserved.
  - 132 / `station.water_coast.132` / “بين جذور القرم”: unlock `learning.mangrove_roots.v1`, its equivalent concise
    learning-module presentation, and the visible progress card for
    `badge.habitat.mangrove_care.v1`. Reaching 132 does not automatically award that badge.
  - 144 / `station.water_coast.144` / “تموّج الساحل”: permanent cosmetic `garden_cosmetic.coastal_ripple.v1`.
  - 156 / `station.water_coast.156` / “ترشيد المياه”: award `badge.skill.water.bud.v1` only when both components
    are met: at least 156 lifetime Seeds and 2 distinct eligible approved water-care actions. If the
    station is reached first, preserve the reached station and show the exact unmet action component.
  - 168 / `station.water_coast.168` / “حكاية جزيرة الجبيل”: place-inspired module `learning.jubail_mangrove.v1`;
    explicitly not proof of a visit or partnership.
  - 180 / `station.water_coast.180` / “رعاية الساحل”: award `badge.journey.coastal_care.v1`, unlock the next
    garden-stage presentation, preserve this chapter, and show the next evergreen chapter preview.

Configure these exact canonical station arrays—no singular `reward` fallback:

| Station ID | `unlocks[]` |
| --- | --- |
| `station.archive.012` | `badge.journey.seed_start.v1` |
| `station.archive.060` | `badge.journey.growing_branch.v1` |
| `station.water_coast.120` | `badge.journey.expanding_shade.v1` |
| `station.water_coast.132` | `learning.mangrove_roots.v1`; `badge_progress_reveal: badge.habitat.mangrove_care.v1` |
| `station.water_coast.144` | `garden_cosmetic.coastal_ripple.v1` |
| `station.water_coast.156` | `badge.skill.water.bud.v1` (criterion-gated evaluation) |
| `station.water_coast.168` | `learning.jubail_mangrove.v1` |
| `station.water_coast.180` | `badge.journey.coastal_care.v1`; `garden.stage.next_after_mangrove.v1`; `chapter.preview.after_water_coast.v1` |

The canonical Salem starting fixture is 120, so its next station is 132 with exactly 12 Seeds
remaining. The next valid 12-Seed acquisition approval must render “وصلت إلى محطة «بين جذور
القرم»، وفُتحت حكاية جديدة.”, not “you are closer.”

Rules:
- Show 6–8 milestones per chapter and visually emphasize only current + next 2–3.
- Exact unlock content and criteria are visible before earning.
- Highlighted chapters may rotate editorially, but unfinished content moves to a self-paced archive.
- No earned item expires and lifetime Seeds never reset.
- The Child may choose among equivalent safe optional quests at selected future nodes; no permanent
  loss for choosing one.
- Add a finite endpoint: “اكتملت خطوات اليوم” with a clear “العودة إلى حديقتي”
  exit. Do not show “Save” for a read-only projection.

DELIVERABLE D — ACHIEVEMENT ENGINE
Create typed, configuration-driven definitions. Adapt names to the repository language, but preserve
these semantics:

type EvidencePhase = 'acquisition' | 'maintenance';
type TaskCategory =
  | 'waste_sorting'
  | 'water_care'
  | 'energy_care'
  | 'repair_reuse'
  | 'plant_care'
  | 'habitat_care'
  | 'household_care'
  | 'community_care';
type TaskRewardPolicy = 'seed_award' | 'maintenance' | 'recognition_only';
type AdultHelpPolicy = 'not_needed' | 'available' | 'required';
type ChildSafetyClass = 'child_safe' | 'adult_only' | 'prohibited';
type AchievementCategory =
  | 'journey'
  | 'resource_care'
  | 'circularity'
  | 'habitat'
  | 'biodiversity'
  | 'living_heritage'
  | 'clean_energy';
type MasteryFamily =
  | 'skill.sorting'
  | 'skill.water'
  | 'skill.energy'
  | 'skill.repair_reuse'
  | 'skill.nature'
  | 'skill.coast_care';
type BadgeFamilyId =
  | 'journey'
  | 'skill.sorting'
  | 'skill.water'
  | 'skill.energy'
  | 'habitat.ghaf'
  | 'habitat.mangrove'
  | 'biodiversity.wetland'
  | 'heritage.date_palm'
  | 'heritage.sadu';

interface TaskDefinition {
  id: string;
  category: TaskCategory;
  rewardPolicy: TaskRewardPolicy;
  seedAward: number; // positive only for seed_award; otherwise exactly 0
  masteryFamilies: MasteryFamily[];
  adultHelpPolicy: AdultHelpPolicy;
  safetyClass: ChildSafetyClass;
  excludedHazards: string[];
}

type AchievementCriterion =
  | { id: string; type: 'lifetime_seeds'; threshold: number }
  | { id: string; type: 'station_reached'; stationId: string }
  | { id: string; type: 'mastery_credit'; familyId: MasteryFamily; threshold: number;
      eligibleEvidencePhases: EvidencePhase[] }
  | { id: string; type: 'learning_package_complete'; learningPackageId: string }
  | { id: string; type: 'activity_complete'; activityId: string }
  | { id: string; type: 'badge_earned'; badgeId: string }
  | { id: string; type: 'all'; criteria: AchievementCriterion[] }
  | { id: string; type: 'any'; criteria: AchievementCriterion[] };

type StationUnlock =
  | { id: string; type: 'learning_module'; assetId: string; condition: 'station_reached' }
  | { id: string; type: 'garden_cosmetic'; assetId: string; condition: 'station_reached' }
  | { id: string; type: 'garden_stage'; assetId: string; condition: 'station_reached' }
  | { id: string; type: 'chapter_preview'; assetId: string; condition: 'station_reached' }
  | { id: string; type: 'badge_progress_reveal'; achievementId: string;
      condition: 'station_reached' }
  | { id: string; type: 'badge'; achievementId: string;
      condition: { type: 'achievement_met'; achievementId: string } };

interface PathStationDefinition {
  id: string;
  chapterId: string;
  seedThreshold: number;
  titleAr: string;
  titleEn: string;
  unlocks: StationUnlock[];
}

interface AchievementDefinition {
  id: string;
  version: number;
  familyId: BadgeFamilyId;
  tierId: 'seed_start' | 'growing_branch' | 'expanding_shade' | 'coastal_care'
    | 'bud' | 'branch' | 'shade' | 'foundation';
  masteryStage?: 'bud' | 'branch' | 'shade';
  prerequisiteBadgeIds: string[];
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  lockedHintAr: string;
  lockedHintEn: string;
  category: AchievementCategory;
  criterion: AchievementCriterion;
  presentationOwnerId: string;
  badgeAssetId: string;
  whyItMattersAr: string;
  whyItMattersEn: string;
  visibilityScope: 'child_guardian';
  sourceRefs: string[];
  factReviewStatus: 'not_required' | 'draft' | 'reviewed' | 'approved';
  culturalReviewStatus: 'not_required' | 'required' | 'approved';
  rightsReviewStatus: 'original' | 'review_required' | 'cleared';
  isPermanent: true;
  isPurchasable: false;
  isShareableOutsideHousehold: false;
}

Codex may create `draft`, `review_required`, or `not_required` records and may preserve a documented
existing approval, but it must never self-mark factual, cultural, legal, or asset-rights review as
approved/cleared. Named-place, biodiversity, date-palm, and Al-Sadu content stays gated until the
appropriate named human review recorded by the repository has occurred. Use the canonical English
spelling “Al-Sadu” consistently.

interface CriterionProgressComponent {
  criterionKey: string;
  labelAr: string;
  labelEn: string;
  state: 'locked' | 'in_progress' | 'complete';
  current?: number;
  target?: number;
  children?: CriterionProgressComponent[];
}

interface AchievementProgressProjection {
  childProfileId: string;
  achievementId: string;
  state: 'locked' | 'in_progress' | 'awaiting_review' | 'earned';
  isNextRecommended: boolean;
  components: CriterionProgressComponent[];
  isMet: boolean;
}

interface AchievementAward {
  childProfileId: string;
  achievementId: string;
  triggeringEvent: AwardTrigger;
  unlockedAt: string;
  seenAt?: string;
  evaluationVersion: number;
}

interface PathUnlockAward {
  childProfileId: string;
  stationId: string;
  unlockId: string;
  triggeringEvent: AwardTrigger;
  unlockedAt: string;
}

interface LearningCompletionEvent {
  id: string;
  childProfileId: string;
  learningPackageId: string;
  route: 'story' | 'accessible_equivalent' | 'parent_guided_discussion';
  contentVersion: number;
  completedAt: string;
  seedDelta: 0;
  gardenGrowthDelta: 0;
}

type AwardTrigger = {
  type: 'parent_confirmation' | 'learning_completion' | 'activity_completion' | 'migration';
  id: string;
};

interface ActivityDefinition {
  id: string;
  learningObjectiveId: string;
  requiresParent: boolean;
  requiresCamera: false;
  requiresMicrophone: false;
  requiresPreciseLocation: false;
  factReviewStatus: 'draft' | 'reviewed' | 'approved';
  culturalReviewStatus: 'not_required' | 'required' | 'approved';
}

interface ActivityCompletionEvent {
  id: string;
  childProfileId: string;
  activityId: string;
  completedAt: string;
  seedDelta: 0;
  gardenGrowthDelta: 0;
}

interface MaintenanceCreditLedger {
  childProfileId: string;
  familyId: string;
  lifetimeMaintenanceCreditsUsed: 0 | 1;
  sourceApprovalEventId?: string;
}

interface RecognitionGrant {
  childProfileId: string;
  recognitionId: 'recognition.safe_help_once.v1';
  triggeringApprovalEventId: string;
  grantedAt: string;
}

interface RevealBundle {
  id: string;
  childProfileId: string;
  triggeringEventId: string;
  parentPraise?: string;
  seedDelta: number;
  gardenChanges: string[];
  unlockedBadgeIds: string[];
  reachedStationIds: string[];
  unlockedContentIds: string[];
  recognitionIds: string[];
  state: 'pending' | 'seen';
}

Enforce unique keys for (childProfileId, achievementId),
(childProfileId, stationId, unlockId), and each globally scoped event ID. If event IDs are not
globally unique in the existing store, include childProfileId in every event uniqueness constraint.
Enforce at most one pending/seen `RevealBundle` per child and triggering event.
Each mastery tier has its own stable achievement ID and shares `familyId`; earning a higher tier
never overwrites a lower tier. Do not store a mutable level or duplicate Seed total as authority.
Derive path position and gallery state from canonical Seed transactions, immutable evidence events,
station unlocks, and immutable awards. Composite progress must expose every component; a single
scalar current/target is insufficient.

For a station unlock of type `badge`, `PathUnlockAward` references the one canonical
`AchievementAward`; it is not a second badge award. Resolve station and achievement conditions from
the same committed snapshot so a badge-dependent unlock cannot be missed because of evaluation
order.

Persist an immutable, normalized eligibility snapshot on each Parent confirmation: canonical task
category/activity IDs, safety eligibility, lifecycle phase, recurrence/occurrence ID, and the fixed
Seed value shown before the task began. Editing a task later must not rewrite historical badge
progress.

Use these evidence rules:
- Acquisition approval: commits the predeclared fixed Seeds once and may add one eligible mastery
  credit for each explicitly mapped mastery family on that one approved occurrence. For example,
  `task.recycling_sort.v1` adds one `skill.sorting` credit and one `skill.coast_care` credit in the
  same idempotent approval; it does not choose only one family.
- Approved maintenance practice: commits no Seeds or garden growth, but may add at most one lifetime
  maintenance credit per Child per mastery family, and only when that badge definition explicitly
  permits maintenance. Store the cap; dates, reset, or recreated tasks cannot renew it. Preserve any
  existing separately authorized coarse community projection without treating it as badge evidence.
- Recognition-only activity: descriptive praise only; no Seeds, station, badge, or mastery evidence.
- Count at most one evidence record per canonical scheduled occurrence. Reject duplicate/recreated
  submissions and rapid repetitions whose only purpose is progress grinding. Never backdate invented
  evidence to make a badge reachable.
- Appropriate help-seeking is a one-time contextual recognition outside the gallery and path. It has
  no counter, Seeds, mastery tier, “next” recommendation, or repeat reward.

Use an atomic/idempotent Parent-confirmation pipeline:
1. validate transition, Parent authority, fixed reward, and immutable eligibility snapshot;
2. if the confirmation ID was already processed, return its prior committed result as a successful
   no-op; do not throw a user-facing failure or replay presentation;
3. create the existing fixed Seed transaction only for an eligible acquisition approval;
4. record at most one eligible credit per explicitly mapped mastery family for that occurrence,
   respecting each criterion's `eligibleEvidencePhases` and the lifetime maintenance cap;
5. apply eligible existing garden/canopy/community projections;
6. compute reached stations and achievement/component projections from the same committed state;
7. insert only new `AchievementAward` rows;
8. resolve all unconditional and badge-conditioned station `unlocks[]`, inserting each new
   `PathUnlockAward` once and referencing the canonical badge award where applicable;
9. create at most one recoverable `RevealBundle` for the triggering event.

Use a separate idempotent learning-completion pipeline:
1. validate the Child, unlocked module, approved content version, and no-fail completion;
2. return the prior result for a duplicate completion event;
3. persist one `LearningCompletionEvent` for the story or equivalent presentation;
4. mint no Seeds and no task/garden/community action;
5. evaluate only learning/composite badge criteria and insert new awards once;
6. resolve any newly eligible badge-conditioned station unlock receipts once;
7. create at most one recoverable `RevealBundle` when something new unlocks.

Use a third authorized, idempotent activity-completion pipeline:
1. validate the Child, activity definition, required Parent involvement, content/review gates, and
   that no camera, microphone, precise location, or unsafe proof is requested;
2. return the prior committed result for a duplicate activity event ID;
3. persist one `ActivityCompletionEvent` with `seedDelta: 0` and `gardenGrowthDelta: 0`;
4. mint no task, Seed, garden, canopy, or community consequence;
5. evaluate only `activity_complete` and dependent composite criteria, insert new awards and any
   badge-conditioned station receipts once, and create at most one `RevealBundle`.

A Parent preference to minimize stories controls recommendation/presentation, not eligibility. Every
required story has an equivalent concise, sourced, no-fail learning module that emits the same
`learning_package_complete` criterion. No preference may create an unreachable station or badge.

Presentation order:
Parent praise → Seed consequence → garden growth → station/content/badge results in one combined
Growth Moment. Never show a garden celebration followed by a second badge modal. Use dynamic Arabic
singular/dual/plural copy derived from the actual unlocked-item array; never hard-code
“وإنجازان آخران”.

Closing the app, disabling motion, or navigating away must not lose the committed result. The
presentation queue is not reward authority. Recover any unseen combined reveal from immutable awards
and unlock receipts after restart; dismissal marks its presentation record seen without mutating the
earned result.

DELIVERABLE E — STARTER CONTENT
Implement exactly these 16 P0 badge definitions. Do not silently add the broader research backlog to
P0. Each mastery tier is a separate definition and award; related tiers share a family ID.

| Stable ID | Arabic / English | Exact criterion | Canonical Salem-at-120 fixture | Station ownership |
| --- | --- | --- | --- | --- |
| `badge.journey.seed_start.v1` | بذرة البداية / Seed Start | 12 lifetime approved Seeds | earned, 12/12 | `station.archive.012` |
| `badge.journey.growing_branch.v1` | غصن نامٍ / Growing Branch | 60 lifetime approved Seeds | earned, 60/60 | `station.archive.060` |
| `badge.journey.expanding_shade.v1` | ظلّ يتّسع / Expanding Shade | 120 lifetime approved Seeds | earned in approval bundle, 120/120 | `station.water_coast.120` |
| `badge.journey.coastal_care.v1` | رعاية الساحل / Coastal Care | 180 lifetime approved Seeds | in progress, 120/180 | `station.water_coast.180` |
| `badge.skill.sorting.bud.v1` | الفرز الذكي — برعم / Smart Sorting — Bud | 1 distinct eligible approved safe-sorting occurrence | earned in approval bundle, 1/1 | `gallery.family.sorting` |
| `badge.skill.sorting.branch.v1` | الفرز الذكي — غصن / Smart Sorting — Branch | Bud prerequisite + 3 total distinct eligible safe-sorting occurrences | in progress, 1/3 | `gallery.family.sorting` |
| `badge.skill.sorting.shade.v1` | الفرز الذكي — ظل / Smart Sorting — Shade | Branch prerequisite + 7 total distinct eligible safe-sorting occurrences | prerequisite pending; count visible, 1/7 | `gallery.family.sorting` |
| `badge.skill.water.bud.v1` | ترشيد المياه — برعم / Water Care — Bud | all: station 156 reached + 2 distinct eligible approved water-care occurrences | station pending, Seeds 120/156; actions met, 2/2 | `station.water_coast.156` |
| `badge.skill.water.branch.v1` | ترشيد المياه — غصن / Water Care — Branch | Water Bud prerequisite + 5 total distinct eligible water-care occurrences | prerequisite pending; actions 2/5 | `gallery.family.water` |
| `badge.skill.water.shade.v1` | ترشيد المياه — ظل / Water Care — Shade | Water Branch prerequisite + 10 total distinct eligible water-care occurrences | prerequisites pending; actions 2/10 | `gallery.family.water` |
| `badge.skill.energy.bud.v1` | ترشيد الطاقة — برعم / Energy Care — Bud | 2 distinct eligible approved energy-care occurrences | in progress, 1/2 | `gallery.family.energy` |
| `badge.habitat.ghaf_roots.v1` | جذور الغاف / Ghaf Roots | Ghaf module/equivalent + 3 distinct eligible nature-care occurrences | learning 1/1; actions 2/3 | `gallery.family.ghaf` |
| `badge.habitat.mangrove_care.v1` | رعاية القرم / Mangrove Care | all: station 132 reached + Mangrove module/equivalent + 3 coast-care mastery credits from distinct approved events | station 120/132; module 0/1; actions 3/3 | `station.water_coast.132`; progress reveal only until criteria pass |
| `badge.biodiversity.wetland_exploration.v1` | استكشاف الأراضي الرطبة / Wetland Exploration | Wetland module/equivalent + 1 approved no-location observation activity | learning 0/1; activity 0/1 | `gallery.family.wetland` |
| `badge.heritage.date_palm_gifts.v1` | عطاء النخلة / Gifts of the Date Palm | Date-palm module/equivalent + 1 Parent-led eligible care/reuse activity | learning 0/1; activity 0/1 | `gallery.family.date_palm` |
| `badge.heritage.sadu_patterns.v1` | نقوش السدو / Al-Sadu Patterns | Al-Sadu module/equivalent + 1 original geometric-pattern activity | learning 0/1; activity 0/1; content review gated | `gallery.family.sadu` |

Use these exact family/tier mappings:
- `journey`: `seed_start`, `growing_branch`, `expanding_shade`, `coastal_care`;
- `skill.sorting` and `skill.water`: `bud`, `branch`, `shade`;
- `skill.energy`: `bud`;
- `habitat.ghaf`, `habitat.mangrove`, `biodiversity.wetland`, `heritage.date_palm`, and
  `heritage.sadu`: `foundation`.

Only mastery tiers carry badge prerequisites. The canonical
recycling fixture is `task.recycling_sort.v1`, with category `waste_sorting`, reward policy
`seed_award`, fixed award 12, mastery families `skill.sorting` and `skill.coast_care`, required adult
help, and the repository's child-safe exclusions. Resolve UAE factual rows at minimum through
`source.ead.ghaf_tree.v1`, `source.ead.mangrove_national_park.v1`,
`source.ead.al_wathba_wetland.v1`, `source.dct.date_palm.v1`, and
`source.dct.al_sadu.v1`, populated from the authoritative links in the companion research/spec. Do
not mark any of those rows approved or cleared without the required recorded human review.

For the skill definitions above, `acquisition` and explicitly eligible `maintenance` approvals may
provide bounded mastery evidence in the engine, but every one of the 16 P0 badge mastery criteria
sets `eligibleEvidencePhases: ['acquisition']`. Maintenance support is future-safe architecture, not
a hidden P0 shortcut; only acquisition approvals provide Seeds. The registry fixture may state a
value only when canonical history proves it. All other displayed counts must be derived, so
the UI works for Alia, a new Child with an empty history, and future profiles without code changes.

Every badge must show its exact criterion and component progress, why it matters, permanent/private
label, original art key, accessible label, and resolvable review/source metadata. Use one canonical
state enum from the domain model; UI presents `locked` as **متاحة لاحقًا** while its accessibility
name says **مقفلة** and explains the unmet criterion. Avoid common/rare/epic/legendary. Mastery stages describe practice, not
social status. Any additional catalog concepts belong in documented P1, not the P0 fixture.

DELIVERABLE F — LEARNING AND PLACE STORIES
Implement one finite P0 story, “بين جذور القرم”, using sourced, paraphrased facts. It should explain
mangrove roots, habitat, and coastal protection in 3 short sections; include one no-fail ordering or
reflection interaction; end with the neutral copy “اكتملت الحكاية، وأضفنا معرفة جديدة إلى
الرحلة.” Do not autoplay a second story. Provide a concise equivalent presentation with the same
sourced learning objective for a guardian's reduced-story preference; completing either variant
emits the same module completion once, never both.

Store source metadata separately from creative lore:
interface LearningStorySource {
  id: string;
  sourceUrl: string;
  sourceTitle: string;
  publisher: string;
  publishedOrReviewedDate?: string;
  accessedAt: string;
  factVersion: number;
  verifiedFact: string;
  creativeBadgeLore: string;
  humanReviewStatus: 'draft' | 'reviewed' | 'approved';
}

Every factual story and factual Badge Detail must visibly include a child-readable “مصدر المعرفة”
row containing publisher and the source's own published/reviewed date when available, or a precisely
labelled source-access date otherwise, plus an accessible source-detail action. Never present a
source-access date as a Ghaf content-team review or approval without a separately recorded human
review. The
row resolves through `sourceRefs` to the source record; a generic partnership disclaimer is not a
substitute for attribution. Keep source URLs out of decorative artwork and paraphrase source facts.

For named places, show:
- “قصة معرفية مستوحاة من…”
- “يمكنك إكمال الحكاية من المنزل؛ زيارة المكان ليست شرطًا.”
- “لا يحتاج غاف إلى موقعك الجغرافي لإكمال هذه الحكاية.”
- “محتوى تعليمي مستقل؛ لا يعني عرضه وجود شراكة رسمية مع الموقع.”

Use original generic habitat artwork. Do not copy official photography, maps, logos, page layouts,
UNESCO marks, UAE emblems/flag treatments, Nation Brand identity, or exact branded architectural
likenesses without documented clearance.

DELIVERABLE G — SCREENS AND INTEGRATION
Implement responsive, production-quality states within the existing route contract where practical:

1. Opening and onboarding states at the existing entry route.
2. Compact Impact Path entry card on Child Today:
   - “مسار الأثر”
   - derive current/target Seeds and nearest deterministic unlock from the active profile; the Salem
     reference fixture displays 120 of 180 and 12 remaining to station 132, but components contain no
     hard-coded Salem totals
   - one action “عرض مساري”.
3. Child Garden additions:
   - root title is exactly “حديقتي” in Arabic;
   - current chapter summary;
   - “عرض مسار الأثر” and “عرض شاراتي” actions;
   - preserve the existing garden hero and next-stage meaning.
4. Impact Path full view nested within Garden, including “عرض المراحل المحفوظة”,
   preserved completed content, and the explicit next-chapter preview at station 180.
5. Badge Gallery nested within Garden, with filters: “الكل · مكتسبة · قيد التقدم · التالية” and
   categories “الرحلة · العناية بالموارد · الموائل والتنوع · التراث · الطاقة” mapped
   explicitly to the full domain taxonomy. Locked items use friendly “متاحة لاحقًا”
   presentation where appropriate and remain discoverable under “الكل” and category filters;
   “التالية” maps only to `isNextRecommended`.
6. Badge Detail as an accessible sheet with exact criterion, progress, why it matters, source note,
   permanence, and one contextual action. Factual details show the visible “مصدر المعرفة” row.
7. One combined Growth/Achievement Moment after actual committed unlocks. Show one primary outcome,
   a compact list/summary of every additional unlock, and Arabic quantity copy selected from the
   actual zero/singular/dual/plural count. Each item opens its valid detail/story/path destination;
   never stack modals or hard-code an additional-item count.
8. One finite Learning Story view.
9. Parent selected-Child progress panel/sheet showing the selected profile's current chapter, recent
   earned badges with earned dates and exact criteria, structured in-progress components, and
   possible support—without sibling comparison or behavior scoring. Any interests are labeled
   “المسارات المختارة” with the isolated actual profile name shown separately; they are explicitly
   Child-selected, local, editable, and never inferred from behavior. Do not generate gendered
   grammar from a profile name or infer gender.
10. Eligible assigned-task bridge from Impact Path/Badge Detail:
    - “عرض مهمة مناسبة” may open only an already Parent-assigned, safe, currently eligible
      task for that Child; it never creates, selects, or self-assigns a task.
    - If no such assignment exists, show “لا توجد مهمة مناسبة معيّنة الآن. يمكن الحديث مع
      أحد الوالدين أو وليّ الأمر.” with a return to the recorded origin.

Keep the existing three-item Child bottom navigation unchanged. In Arabic its physical left-to-right
order is “الدوري | حديقتي | اليوم”; “الدوري” uses the cooperative groups icon and never a
trophy, podium, or competition icon. Apply the locale-specific header/icon contract under
Localization below, and preserve each nested route's true origin for Back.

Represent nested navigation origin explicitly (for example, a validated `originRoute` plus safe
role-root fallback) rather than guessing from a hard-coded Back destination. Accept only known,
authorized routes; never trust an arbitrary URL or let a deep link cross Parent/Child authorization.

DESIGN SYSTEM
Use the existing approved tokens and components. Do not create near-duplicate hard-coded colors,
radii, or typography. If the current implementation has legacy token names, create a documented
alias/migration rather than silently diverging.

Canonical direction:
- Soft Geometric visual language;
- Bright Pearl foundation;
- Ghaf Emerald and Mangrove Teal growth accents;
- Deep Forest/Ink body text;
- Sky Mist explanatory and safety surfaces;
- restrained Solar Amber only for the next reachable milestone or warm botanical light;
- Alexandria headings and Readex Pro body/UI;
- original flat/vector botanical forms and layered UAE landscapes;
- no proprietary game visual language, crowns, chests, metallic rarity rings, neon, flames, weapons,
  faux luxury gold, or dense HUD.

Prototype at 390×844 and also verify responsive behavior at 360×800 and 430×932. Fixed header and
bottom navigation/action areas must not cover internally scrollable content. Maintain at least 48×48
CSS px on web or the platform-equivalent dp/pt targets on native, with 52–56-unit primary actions.
At 200% text scaling, badge grids become one column, filters wrap or use an accessible overflow menu,
criteria remain unclipped, and no screen requires horizontal scrolling.

LOCALIZATION, RTL, AND ACCESSIBILITY
- Arabic is an authored RTL state, not a mirrored afterthought; English is equivalent LTR.
- Do not letter-space Arabic or bake text into artwork.
- Use this explicit locale matrix:
  - Arabic root: Help physically left, mathematically centered title, botanical avatar physically
    right. Arabic nested: Back physically right with an explicitly right-pointing glyph, centered
    title, empty left. Arabic forward CTA: explicitly left-pointing glyph physically left of label.
    Arabic navigation physical left-to-right: “الدوري | حديقتي | اليوم”.
  - English mirrors semantically: root avatar on physical left and Help on right; nested Back on
    physical left with a left-pointing glyph; forward CTA arrow on physical right; navigation
    physical left-to-right “Today | My Garden | Shared Growth”.
  - Implement physical header/navigation shells with a stable LTR positioning row when needed, then
    apply RTL/LTR to labels individually. Independently center the title. Do not depend on framework
    auto-mirroring; select the glyph direction explicitly and disable auto-mirroring where required.
- Use Latin digits 0–9 in both authored Arabic and English UI, including onboarding status, progress,
  dates, and screen-reader announcements. Use one localization/number adapter configured with
  `numberingSystem: 'latn'` (for example `ar-AE-u-nu-latn`) and verify that it renders
  consistently. On web, isolate each interpolated number/name token with `<bdi>` or CSS
  `unicode-bidi: isolate`; on native, use supported writing-direction wrappers or Unicode FSI/PDI
  isolates. Do not render HTML tags in React Native. Verify `Intl.NumberFormat('ar-AE')` support or
  include the repository-approved polyfill. Prefer the visual form “120 من أصل 180 بذرة” over a
  slash ratio, isolating each number token rather than the entire Arabic sentence.
- Provide screen-reader announcements for earned/in-progress/ready/awaiting-review states and for
  progress updates. Canonical Arabic state labels are “مكتسبة”, “قيد التقدم”, “جاهزة
  للاستكشاف”, “التالية”, and “بانتظار مراجعة وليّ الأمر”. Announce every composite
  component, for example “المهمتان مكتملتان؛ 120 من أصل 156 بذرة”. Do not rely
  on color, sound, or motion.
- Meet WCAG 2.2 AA contrast; test focus order, keyboard access for web, and screen-reader order.
- Honor system reduced motion, high text scaling, safe areas, orientation policy, and touch target
  size.
- No autoplay sound. Optional sound/haptics obey device settings and an actually implemented
  guardian-owned setting; otherwise keep them off and do not show a nonfunctional control.

PERSISTENCE AND MIGRATION
- Version onboarding preference independently from task/reward state.
- Add a schema migration that preserves every Child's existing Seeds, garden stage, approvals, and
  task history. Derive an initial achievement only when immutable history proves every criterion:
  Seed-threshold awards may use the canonical ledger, while task/story/help evidence must not be
  invented from missing history. Record migration provenance; if the historical earned time is
  unknown, do not fabricate one. Never replay migration celebrations.
- Persist immutable awards and seen timestamps. Never recompute a historical earned badge away after
  a definition update.
- Increment evaluationVersion when criteria change and document migration behavior.
- Reset/demo fixtures must enumerate the four canonical timeline states, starting awards/evidence,
  and clear transient presentation state without clearing earned results.
- The full P0 experience must work offline with local fixtures.

DOCUMENTATION TO CREATE OR UPDATE
1. PRODUCT.md: add the Impact Path product contract, terms, economy, guardrails, and P0/P1 scope.
2. DESIGN.md: add badge anatomy, path stations, states, Arabic/RTL, motion, and no-copy game rules.
3. docs/architecture/ADR-impact-path.md: why Impact Path projects the Seed ledger, atomic evaluation,
   station `unlocks[]`, composite progress, all three idempotent event pipelines, migration, and
   origin-aware route integration.
4. docs/content/BADGE_CATALOG.md: the exact 16-ID P0 registry above, bilingual definitions, tier
   families, criteria, canonical fixture evidence, sources, review status, and non-endorsement
   language. Broader researched concepts are clearly P1.
5. docs/content/LEARNING_STORIES.md: fact/lore separation and source/version workflow.
6. PRIVACY or PROTOTYPE_LIMITATIONS: no public profiles, ranking, GPS, proof media, ads, purchases,
   production backend, or real-impact claim.
7. DEMO_RUNBOOK.md: first launch, replay onboarding, Parent approval, unlock, gallery, place story,
   reduced motion, and duplicate-confirmation proof.
8. README/changelog: routes, commands, known limits, and what is actually implemented.

AUTOMATED TESTS
- Native/Expo launch release is prompt and readiness-driven; PWA/web uses its valid initial paint and
  does not claim a native screen. Bootstrap failure leaves the system surface and reaches recovery.
- Fresh storage shows the optional Opening Moment and exactly three role-neutral onboarding panels;
  app/content updates and ordinary returning sessions bypass both. An update may expose a quiet,
  optional entry into manual replay, but it never blocks the valid root. Manual replay is harmless
  and returns to origin without replaying the Opening Moment.
- Skip and completion both record the current onboarding version and reach access; neither mutates
  rewards, creates an account, or requests permissions.
- Routing precedence covers bootstrap failure, retained authorized deep links, signed-out access,
  restored Parent/Child sessions, unauthorized deep-link fallback, and shared-device switching with
  no cross-profile data leakage.
- Arabic/English switching preserves onboarding step and correct RTL/LTR semantics.
- No reward mutation on open, onboarding, task view, help, submission, or retry. Maintenance creates
  no Seeds but can add at most one explicitly eligible bounded mastery-evidence occurrence;
  recognition-only confirmation creates neither Seeds nor badge evidence.
- One valid acquisition approval creates the expected single Seed transaction and one set of
  eligible evidence/awards; replay returns the same result and creates nothing.
- One `task.recycling_sort.v1` approval creates exactly one `skill.sorting` credit and one
  `skill.coast_care` credit from the same occurrence; replay duplicates neither. All P0 mastery
  criteria reject maintenance evidence because their `eligibleEvidencePhases` is acquisition-only.
- A before-approval 108-Seed/48-growth fixture commits +12 once to exactly 120/60. A later valid
  +12 acquisition from the 120 starting fixture reaches exactly 132, unlocks the Mangrove module,
  and never says “closer to 132.”
- The 108→120 approval produces one `RevealBundle` containing the existing Parent praise, Seed and
  Mangrove changes, station 120, `badge.journey.expanding_shade.v1`, and
  `badge.skill.sorting.bud.v1`; it does not award Mangrove Care.
- Threshold, bounded acquisition/maintenance task-count, learning-module, station, prerequisite,
  tier-family, and composite criteria evaluate correctly. The exact P0 registry validates to 16 IDs.
- An early Seed-threshold crossing does not grant a composite badge before its other criteria.
- The Salem water fixture reports actions 2/2 met and Seed/station gate 120/156 unmet; Water Branch
  reports 2/5 with its Bud prerequisite pending.
- Earned awards persist across restart, chapter archive, locale switch, and definition migration.
- Gallery derives earned/in-progress/next/ready states correctly and always shows exact criteria.
- Invalid definitions fail validation: random/purchase/app-time/punitive-streak criteria,
  child-public visibility, duplicate IDs, broken tier prerequisites, singular station reward fields,
  missing bilingual copy, or missing source/review metadata. Validate runtime JSON/config as well as
  static types.
- Closing before a combined reveal and relaunching recovers the unseen presentation exactly once;
  dynamic zero/singular/dual/plural copy matches the actual unlock array.
- Story and concise-equivalent completions are idempotent, satisfy the same module criterion, and
  mint no Seeds. Guardian story preference never makes a badge unreachable.
- An authorized activity completion persists once, can satisfy only `activity_complete` and
  dependent composite criteria, and always has zero Seed/garden/canopy/community delta. Duplicate,
  unauthorized, unsafe, or review-gated activity events award nothing.
- Appropriate safe help can produce `recognition.safe_help_once.v1` once at Parent confirmation,
  but never a gallery badge, counter, Seed, mastery credit, or next recommendation.
- The eligible-task CTA opens only an existing Parent assignment; its no-assignment state creates
  nothing and returns to origin.
- Child achievement data cannot enter shared-league/community projections.
- Place story requires no GPS/camera/microphone and makes no visit/partnership claim.
- Reduced-motion mode commits and announces the identical final outcome without waiting for
  animation.
- Accessibility names, focus order, 48 px targets, safe-area clearance, and bidi-sensitive values
  are covered at component/e2e level where the stack allows. Back tests cover Today, Garden,
  Gallery, Parent, authorized deep link, Android/system Back, and browser Back.
- Run profile-isolation fixtures for Salem, Alia, and a new Child: independent progress, zero-state
  gallery, long/unknown-script names, no masculine default copy, and no cross-profile awards/counts.

MANUAL VERIFICATION
- Test cold launch, warm launch, background resume, and bootstrap failure on a physical Android
  device or the closest available emulator.
- Capture canonical Arabic screenshots for every new/refined surface at 390×844, plus English LTR
  spot checks.
- Test 200% text scale, screen reader, keyboard on web, reduced motion, offline mode, and long Arabic
  strings. Confirm one-column badge reflow, wrapped filters, no clipping, and no horizontal scroll.
- Confirm the opening moment is brief, launch does not feel stuck, and onboarding is skippable.
- Confirm a Child can explain: where they are, what unlocks next, and why it matters.
- Confirm every flow has a clear stop/exit and nothing autoplays.
- Run the complete established Ghaf regression suite and the duplicate-confirmation proof.

HEALTHY PRODUCT METRICS
Do not add third-party child analytics in P0. If local development instrumentation exists, define
success around comprehension of the next criterion, learning recall, Parent-approved task quality,
Child-reported autonomy/enjoyment, Parent trust, equitable access, and ability to stop—not session
length, DAU pressure, or notification opens.

EXECUTION ORDER
1. Audit and reconcile sources of truth.
2. Update domain contracts and fixture migration first.
3. Implement/test the atomic achievement evaluator.
4. Implement launch/bootstrap and versioned onboarding.
5. Build reusable path, badge, gallery, detail, reveal, and story components.
6. Integrate Today, Garden, Parent, and approval presentation states.
7. Complete localization, accessibility, responsive behavior, and reduced motion.
8. Update documentation and runbook.
9. Run all automated and manual checks; iterate until clean.

FINAL HANDOFF FORMAT
Lead with the implemented outcome. Then list:
- files and routes changed;
- exact progression and badge behavior;
- tests/checks run with results;
- screenshots/artifacts produced;
- known limitations and required cultural/legal review;
- confirmation that no unrelated work was overwritten.

Do not claim production authentication, backend persistence, real child data, real partner status,
measured sustainability impact, physical site visits, or store-policy compliance unless separately
implemented and verified. If blocked, report the exact blocker and preserve the repository in a
working state.
```
