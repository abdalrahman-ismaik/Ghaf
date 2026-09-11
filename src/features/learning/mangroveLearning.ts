import type { SyntheticChildId } from '../../models/familyGrowth';
import type { BadgeId } from '../../models/achievements';
import { IMPACT_PATH_STATIONS, type ImpactPathThreshold } from '../../models/growthJourney';
import type {
  AdvanceLearningStepResult,
  BlockedLearningContent,
  CompleteLearningResult,
  GardenLearningFocusTarget,
  ImpactPathLearningFocusTarget,
  LearningCheckOptionId,
  LearningCompletionConsequences,
  LearningCompletionEvent,
  LearningContentStepId,
  LearningBadgeFilter,
  LearningErrorCode,
  LearningOrigin,
  LearningResult,
  LearningReviewGate,
  LearningRoute,
  LearningRouteDefinition,
  LearningRouteProgress,
  LearningUnlockEvidence,
  MangroveLearningPackageDefinition,
  MangroveLearningReturnIntent,
  MangroveLearningState,
  StartLearningRouteResult,
  SubmitLearningCheckResult,
} from '../../models/learning';
import { hasDensePlainArrayShape } from '../../utils/exactPlainData';
import { BADGE_IDS } from '../growth/badgeRegistry';

const LEARNING_ID = 'learning.mangrove_roots.v1' as const;
const OBJECTIVE_ID = 'objective.mangrove_habitat_stewardship.v1' as const;
const CHECK_ID = 'check.mangrove_habitat_stewardship.v1' as const;
const CORRECT_CHECK_OPTION: LearningCheckOptionId = 'habitat_support_and_care';
const SUPPORTED_PROFILES = new Set<string>(['child_salem', 'child_alya']);
const LEARNING_ROUTES = new Set<string>(['story', 'accessible']);
const CHECK_OPTIONS = new Set<string>(['habitat_support_and_care', 'visit_or_task_reward']);
const MAX_SCROLL_OFFSET = 1_000_000;
const IMPACT_PATH_THRESHOLDS = IMPACT_PATH_STATIONS.map((station) => station.threshold);

const BLOCKED_CONTENT: BlockedLearningContent = Object.freeze({
  status: 'blocked_pending_named_human_review',
  ar: null,
  en: null,
  bilingualParity: 'not_run',
});

const STORY_STEPS = Object.freeze([
  'story_frame_1',
  'story_frame_2',
] as const satisfies readonly LearningContentStepId[]);
const ACCESSIBLE_STEPS = Object.freeze([
  'accessible_section_1',
  'accessible_section_2',
] as const satisfies readonly LearningContentStepId[]);

function freezeRouteDefinition(
  route: LearningRoute,
  routePath: LearningRouteDefinition['routePath'],
  contentStepIds: readonly LearningContentStepId[],
): LearningRouteDefinition {
  return Object.freeze({
    packageId: LEARNING_ID,
    route,
    routePath,
    reviewedLearningObjectiveId: OBJECTIVE_ID,
    completionCreditId: LEARNING_ID,
    contentStepIds,
    checkId: CHECK_ID,
    content: BLOCKED_CONTENT,
    finite: true,
    noFail: true,
  });
}

const REVIEW_GATES: readonly LearningReviewGate[] = Object.freeze(
  [
    'source_link_and_mutable_fact_revalidation',
    'arabic_english_factual_equivalence',
    'uae_cultural_and_place_wording',
    'child_safeguarding_and_age_comprehension',
    'accessible_equal_credit_equivalence',
    'original_illustration_and_rights',
  ].map((id) =>
    Object.freeze({
      id,
      status: 'not_run' as const,
      releaseEffect: 'blocks_release_activation' as const,
      evidence: null,
    }),
  ),
) as readonly LearningReviewGate[];

const STORY_ROUTE = freezeRouteDefinition(
  'story',
  '/garden/learn/learning.mangrove_roots.v1/story',
  STORY_STEPS,
);
const ACCESSIBLE_ROUTE = freezeRouteDefinition(
  'accessible',
  '/garden/learn/learning.mangrove_roots.v1/accessible',
  ACCESSIBLE_STEPS,
);

export const MANGROVE_ROOTS_LEARNING_PACKAGE: MangroveLearningPackageDefinition = Object.freeze({
  id: LEARNING_ID,
  title: Object.freeze({
    ar: 'بين جذور القرم',
    en: 'Among the Mangrove Roots',
  }),
  unlockThreshold: 132,
  reviewedLearningObjectiveId: OBJECTIVE_ID,
  completionCreditId: LEARNING_ID,
  finite: true,
  noFail: true,
  autoplayNextLearning: false,
  content: BLOCKED_CONTENT,
  routes: Object.freeze({
    story: STORY_ROUTE,
    accessible: ACCESSIBLE_ROUTE,
  }),
  provenance: Object.freeze({
    packageAuthority: 'docs/content/LEARNING_STORIES.md',
    candidateResearchLocation:
      '96cad3b917f43adad32c491153be54d3ab24f899:docs/GHAF_GROWTH_JOURNEY_PROMPT_PACK/report-source.md#E2',
    candidateResearchStatus: 'not_revalidated',
    externalRuntimeDependency: false,
  }),
  reviewGates: REVIEW_GATES,
  release: Object.freeze({
    featureFlag: 'r002b_learning_ui',
    defaultEnabled: false,
    implementation: 'authorized',
    activation: 'blocked',
  }),
  capabilities: Object.freeze({
    offline: true,
    requiresGps: false,
    requiresVisitProof: false,
    requiresCamera: false,
    requiresMicrophone: false,
    opensExternalBrowser: false,
    generatedFacts: false,
    liveAi: false,
  }),
});

function failure<T>(code: LearningErrorCode, message: string): LearningResult<T> {
  return { ok: false, error: { code, message } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDensePlainArray(value: unknown): value is unknown[] {
  return Array.isArray(value) && hasDensePlainArrayShape(value);
}

function hasOnlyIndexedValues(
  values: readonly unknown[],
  predicate: (value: unknown) => boolean,
): boolean {
  for (let index = 0; index < values.length; index += 1) {
    if (!predicate(values[index])) return false;
  }
  return true;
}

function isSupportedProfile(value: unknown): value is SyntheticChildId {
  return typeof value === 'string' && SUPPORTED_PROFILES.has(value);
}

function isSafeIdentifier(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= 128 &&
    /^[A-Za-z0-9][A-Za-z0-9._:-]*$/u.test(value)
  );
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isSafeScrollOffset(value: unknown): value is number {
  return isNonNegativeInteger(value) && value <= MAX_SCROLL_OFFSET;
}

function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value)) {
    return false;
  }
  const parsed = new Date(value);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString() === value;
}

function isLearningRoute(value: unknown): value is LearningRoute {
  return typeof value === 'string' && LEARNING_ROUTES.has(value);
}

function isLearningCheckOption(value: unknown): value is LearningCheckOptionId {
  return typeof value === 'string' && CHECK_OPTIONS.has(value);
}

function isImpactPathFocusTarget(value: unknown): value is ImpactPathLearningFocusTarget {
  return value === 'impact-path-learning-station-132' || value === 'impact-path-learning-card';
}

function isGardenFocusTarget(value: unknown): value is GardenLearningFocusTarget {
  return value === 'garden-impact-path-card';
}

function isBadgeId(value: unknown): value is BadgeId {
  return typeof value === 'string' && (BADGE_IDS as readonly string[]).includes(value);
}

function isLearningBadgeFilter(value: unknown): value is LearningBadgeFilter {
  return (
    value === 'all' ||
    value === 'earned' ||
    value === 'in_progress' ||
    value === 'locked' ||
    value === 'archived'
  );
}

function validateOrigin(value: unknown): LearningResult<LearningOrigin> {
  if (!isRecord(value) || !isSupportedProfile(value.profileId)) {
    return failure('INVALID_ORIGIN', 'A supported Child origin is required');
  }
  if (
    value.kind === 'impact_path' &&
    value.route === '/garden/impact-path' &&
    isImpactPathFocusTarget(value.focusTargetId) &&
    isSafeScrollOffset(value.scrollOffset)
  ) {
    return {
      ok: true,
      data: {
        kind: 'impact_path',
        route: '/garden/impact-path',
        profileId: value.profileId,
        focusTargetId: value.focusTargetId,
        scrollOffset: value.scrollOffset,
      },
    };
  }
  if (
    value.kind === 'garden' &&
    value.route === '/garden' &&
    isGardenFocusTarget(value.focusTargetId) &&
    isSafeScrollOffset(value.scrollOffset)
  ) {
    return {
      ok: true,
      data: {
        kind: 'garden',
        route: '/garden',
        profileId: value.profileId,
        focusTargetId: value.focusTargetId,
        scrollOffset: value.scrollOffset,
      },
    };
  }
  if (
    value.kind === 'badge_detail' &&
    value.route === '/garden/badges/[badgeId]' &&
    isBadgeId(value.badgeId) &&
    isLearningBadgeFilter(value.filter) &&
    value.focusTargetId === 'r002b-badge-detail-learning-action' &&
    isSafeScrollOffset(value.galleryScrollOffset) &&
    isSafeScrollOffset(value.scrollOffset)
  ) {
    return {
      ok: true,
      data: {
        kind: 'badge_detail',
        route: '/garden/badges/[badgeId]',
        profileId: value.profileId,
        badgeId: value.badgeId,
        filter: value.filter,
        focusTargetId: 'r002b-badge-detail-learning-action',
        galleryScrollOffset: value.galleryScrollOffset,
        scrollOffset: value.scrollOffset,
      },
    };
  }
  if (
    value.kind === 'today_complete' &&
    value.route === '/child' &&
    value.focusTargetId === 'today-complete-heading' &&
    value.scrollOffset === 0
  ) {
    return {
      ok: true,
      data: {
        kind: 'today_complete',
        route: '/child',
        profileId: value.profileId,
        focusTargetId: 'today-complete-heading',
        scrollOffset: 0,
      },
    };
  }
  return failure('INVALID_ORIGIN', 'The learning origin is not an allowlisted Child destination');
}

function sameOrigin(left: LearningOrigin, right: LearningOrigin): boolean {
  const shared =
    left.kind === right.kind &&
    left.route === right.route &&
    left.profileId === right.profileId &&
    left.focusTargetId === right.focusTargetId &&
    left.scrollOffset === right.scrollOffset;
  if (!shared) return false;
  if (left.kind !== 'badge_detail' || right.kind !== 'badge_detail') return true;
  return (
    left.badgeId === right.badgeId &&
    left.filter === right.filter &&
    left.galleryScrollOffset === right.galleryScrollOffset
  );
}

function freezeOrigin(origin: LearningOrigin): LearningOrigin {
  return Object.freeze({ ...origin });
}

function freezeUnlockEvidence(evidence: LearningUnlockEvidence): LearningUnlockEvidence {
  return Object.freeze({
    ...evidence,
    reachedThresholds: Object.freeze([...evidence.reachedThresholds]),
  });
}

function freezeProgress(progress: LearningRouteProgress): LearningRouteProgress {
  return Object.freeze({
    ...progress,
    completedContentStepIds: Object.freeze([...progress.completedContentStepIds]),
  });
}

function freezeConsequences(
  consequences: LearningCompletionConsequences,
): LearningCompletionConsequences {
  return Object.freeze({
    ...consequences,
    masteryCreditIds: Object.freeze([]) as readonly [],
    taskRecognitionIds: Object.freeze([]) as readonly [],
  });
}

function freezeCompletion(event: LearningCompletionEvent): LearningCompletionEvent {
  return Object.freeze({
    ...event,
    consequences: freezeConsequences(event.consequences),
  });
}

function isDeeplyFrozenState(state: MangroveLearningState): boolean {
  return (
    Object.isFrozen(state) &&
    (state.unlockEvidence === null ||
      (Object.isFrozen(state.unlockEvidence) &&
        Object.isFrozen(state.unlockEvidence.reachedThresholds))) &&
    (state.origin === null || Object.isFrozen(state.origin)) &&
    Object.isFrozen(state.routeProgress) &&
    Object.isFrozen(state.routeProgress.story) &&
    Object.isFrozen(state.routeProgress.story.completedContentStepIds) &&
    Object.isFrozen(state.routeProgress.accessible) &&
    Object.isFrozen(state.routeProgress.accessible.completedContentStepIds) &&
    (state.completion === null ||
      (Object.isFrozen(state.completion) &&
        Object.isFrozen(state.completion.consequences) &&
        Object.isFrozen(state.completion.consequences.masteryCreditIds) &&
        Object.isFrozen(state.completion.consequences.taskRecognitionIds)))
  );
}

function freezeState(state: MangroveLearningState): MangroveLearningState {
  if (isDeeplyFrozenState(state)) return state;
  return Object.freeze({
    schemaVersion: 1,
    packageId: LEARNING_ID,
    profileId: state.profileId,
    profileEpochId: state.profileEpochId,
    revision: state.revision,
    unlockEvidence:
      state.unlockEvidence === null ? null : freezeUnlockEvidence(state.unlockEvidence),
    origin: state.origin === null ? null : freezeOrigin(state.origin),
    activeRoute: state.activeRoute,
    routeProgress: Object.freeze({
      story: freezeProgress(state.routeProgress.story),
      accessible: freezeProgress(state.routeProgress.accessible),
    }),
    completion: state.completion === null ? null : freezeCompletion(state.completion),
  });
}

function contentSteps(route: LearningRoute): readonly LearningContentStepId[] {
  return MANGROVE_ROOTS_LEARNING_PACKAGE.routes[route].contentStepIds;
}

function sameStringSequence(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}

function validateRouteProgress(
  value: unknown,
  route: LearningRoute,
): LearningResult<LearningRouteProgress> {
  const completedContentStepIds = isRecord(value) ? value.completedContentStepIds : undefined;
  if (
    !isRecord(value) ||
    value.route !== route ||
    !isDensePlainArray(completedContentStepIds) ||
    !hasOnlyIndexedValues(completedContentStepIds, (stepId) => typeof stepId === 'string') ||
    !isNonNegativeInteger(value.checkAttempts) ||
    typeof value.checkSatisfied !== 'boolean' ||
    (value.lifecycle !== 'not_started' &&
      value.lifecycle !== 'in_progress' &&
      value.lifecycle !== 'awaiting_check' &&
      value.lifecycle !== 'ready_to_complete' &&
      value.lifecycle !== 'completed')
  ) {
    return failure('INVALID_STATE', `The ${route} progress record is malformed`);
  }

  const canonicalStepIds = completedContentStepIds as string[];
  const steps = contentSteps(route);
  if (
    canonicalStepIds.length > steps.length ||
    !sameStringSequence(canonicalStepIds, steps.slice(0, canonicalStepIds.length))
  ) {
    return failure('INVALID_STATE', `The ${route} content progress is not a canonical prefix`);
  }

  const allContentComplete = canonicalStepIds.length === steps.length;
  const lifecycle = value.lifecycle;
  const consistent =
    (lifecycle === 'not_started' &&
      canonicalStepIds.length === 0 &&
      value.checkAttempts === 0 &&
      value.checkSatisfied === false) ||
    (lifecycle === 'in_progress' &&
      !allContentComplete &&
      value.checkAttempts === 0 &&
      value.checkSatisfied === false) ||
    (lifecycle === 'awaiting_check' && allContentComplete && value.checkSatisfied === false) ||
    ((lifecycle === 'ready_to_complete' || lifecycle === 'completed') &&
      allContentComplete &&
      value.checkAttempts >= 1 &&
      value.checkSatisfied === true);
  if (!consistent) {
    return failure('INVALID_STATE', `The ${route} lifecycle conflicts with its recorded progress`);
  }

  return {
    ok: true,
    data: {
      route,
      lifecycle,
      completedContentStepIds: canonicalStepIds as LearningContentStepId[],
      checkAttempts: value.checkAttempts,
      checkSatisfied: value.checkSatisfied,
    },
  };
}

function completionIdentity(profileId: string, profileEpochId: string): string {
  return `learning-completion:${profileId}:${profileEpochId}:${LEARNING_ID}`;
}

function validateUnlockEvidence(value: unknown): LearningResult<LearningUnlockEvidence> {
  const reachedThresholdsValue = isRecord(value) ? value.reachedThresholds : undefined;
  if (
    !isRecord(value) ||
    !isSupportedProfile(value.profileId) ||
    !isSafeIdentifier(value.profileEpochId) ||
    value.source !== 'canonical_impact_path_projection' ||
    !isDensePlainArray(reachedThresholdsValue) ||
    !hasOnlyIndexedValues(
      reachedThresholdsValue,
      (threshold) =>
        typeof threshold === 'number' &&
        IMPACT_PATH_THRESHOLDS.includes(threshold as ImpactPathThreshold),
    )
  ) {
    return failure('INVALID_INPUT', 'Canonical Impact Path unlock evidence is required');
  }
  const reachedThresholds = reachedThresholdsValue as ImpactPathThreshold[];
  if (
    !sameStringSequence(
      reachedThresholds.map(String),
      IMPACT_PATH_THRESHOLDS.slice(0, reachedThresholds.length).map(String),
    )
  ) {
    return failure('INVALID_INPUT', 'Reached stations must be one exact canonical prefix');
  }
  if (!reachedThresholds.includes(132)) {
    return failure('NOT_UNLOCKED', 'Station 132 must be reached before learning starts');
  }
  return {
    ok: true,
    data: {
      profileId: value.profileId,
      profileEpochId: value.profileEpochId,
      source: 'canonical_impact_path_projection',
      reachedThresholds,
    },
  };
}

function validateCompletion(
  value: unknown,
  profileId: SyntheticChildId,
  profileEpochId: string,
): LearningResult<LearningCompletionEvent> {
  if (!isRecord(value) || !isRecord(value.consequences)) {
    return failure('COMPLETION_CONFLICT', 'The learning completion evidence is malformed');
  }
  const expectedId = completionIdentity(profileId, profileEpochId);
  const consequences = value.consequences;
  const masteryCreditIds = consequences.masteryCreditIds;
  const taskRecognitionIds = consequences.taskRecognitionIds;
  if (
    value.id !== expectedId ||
    value.triggerEventId !== expectedId ||
    value.profileId !== profileId ||
    value.profileEpochId !== profileEpochId ||
    value.learningId !== LEARNING_ID ||
    !isLearningRoute(value.route) ||
    value.status !== 'committed' ||
    !isIsoTimestamp(value.completedAt) ||
    value.completionCreditId !== LEARNING_ID ||
    consequences.seedDelta !== 0 ||
    consequences.gardenGrowthDelta !== 0 ||
    consequences.canopyContributionDelta !== 0 ||
    consequences.greenCircleActionDelta !== 0 ||
    consequences.privateLeagueLeafDelta !== 0 ||
    consequences.challengeLeafDelta !== 0 ||
    consequences.familyRewardProgressDelta !== 0 ||
    !isDensePlainArray(masteryCreditIds) ||
    masteryCreditIds.length !== 0 ||
    !isDensePlainArray(taskRecognitionIds) ||
    taskRecognitionIds.length !== 0
  ) {
    return failure(
      'COMPLETION_CONFLICT',
      'Learning completion evidence must match the one zero-reward package event',
    );
  }
  return {
    ok: true,
    data: {
      id: expectedId,
      triggerEventId: expectedId,
      profileId,
      profileEpochId,
      learningId: LEARNING_ID,
      route: value.route,
      status: 'committed',
      completedAt: value.completedAt,
      completionCreditId: LEARNING_ID,
      consequences: {
        seedDelta: 0,
        gardenGrowthDelta: 0,
        canopyContributionDelta: 0,
        greenCircleActionDelta: 0,
        privateLeagueLeafDelta: 0,
        challengeLeafDelta: 0,
        familyRewardProgressDelta: 0,
        masteryCreditIds: [],
        taskRecognitionIds: [],
      },
    },
  };
}

function validateState(value: unknown): LearningResult<MangroveLearningState> {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1 ||
    value.packageId !== LEARNING_ID ||
    !isSupportedProfile(value.profileId) ||
    !isSafeIdentifier(value.profileEpochId) ||
    !isNonNegativeInteger(value.revision) ||
    (value.activeRoute !== null && !isLearningRoute(value.activeRoute)) ||
    !isRecord(value.routeProgress)
  ) {
    return failure(
      'INVALID_STATE',
      'A complete profile- and epoch-scoped learning state is required',
    );
  }

  const story = validateRouteProgress(value.routeProgress.story, 'story');
  if (!story.ok) return story;
  const accessible = validateRouteProgress(value.routeProgress.accessible, 'accessible');
  if (!accessible.ok) return accessible;

  let origin: LearningOrigin | null = null;
  if (value.origin !== null) {
    const originResult = validateOrigin(value.origin);
    if (!originResult.ok) return failure('INVALID_STATE', originResult.error.message);
    if (originResult.data.profileId !== value.profileId) {
      return failure('INVALID_STATE', 'The recorded origin belongs to another profile');
    }
    origin = originResult.data;
  }

  let unlockEvidence: LearningUnlockEvidence | null = null;
  if (value.unlockEvidence !== null) {
    const unlockResult = validateUnlockEvidence(value.unlockEvidence);
    if (!unlockResult.ok) {
      return failure('INVALID_STATE', unlockResult.error.message);
    }
    if (
      unlockResult.data.profileId !== value.profileId ||
      unlockResult.data.profileEpochId !== value.profileEpochId
    ) {
      return failure('INVALID_STATE', 'The unlock evidence belongs to another profile or epoch');
    }
    unlockEvidence = unlockResult.data;
  }

  let completion: LearningCompletionEvent | null = null;
  if (value.completion !== null) {
    const completionResult = validateCompletion(
      value.completion,
      value.profileId,
      value.profileEpochId,
    );
    if (!completionResult.ok) return completionResult;
    completion = completionResult.data;
  }

  const hasProgress =
    story.data.lifecycle !== 'not_started' || accessible.data.lifecycle !== 'not_started';
  if (
    (hasProgress || completion !== null) &&
    (unlockEvidence === null || origin === null || value.activeRoute === null)
  ) {
    return failure('INVALID_STATE', 'Started learning must retain an origin and active route');
  }
  if (
    !hasProgress &&
    completion === null &&
    (unlockEvidence !== null || origin !== null || value.activeRoute !== null)
  ) {
    return failure('INVALID_STATE', 'Empty learning cannot contain an origin or active route');
  }
  if (
    value.activeRoute !== null &&
    (value.activeRoute === 'story' ? story.data : accessible.data).lifecycle === 'not_started'
  ) {
    return failure('INVALID_STATE', 'The active learning route must have recorded progress');
  }

  const completedRoutes = [story.data, accessible.data].filter(
    (progress) => progress.lifecycle === 'completed',
  );
  if (completion === null && completedRoutes.length > 0) {
    return failure('COMPLETION_CONFLICT', 'Completed route progress requires completion evidence');
  }
  if (
    completion !== null &&
    (completedRoutes.length !== 1 ||
      completedRoutes[0]?.route !== completion.route ||
      value.activeRoute !== completion.route)
  ) {
    return failure(
      'COMPLETION_CONFLICT',
      'Exactly the route that committed the package may be marked completed',
    );
  }

  return {
    ok: true,
    data: {
      schemaVersion: 1,
      packageId: LEARNING_ID,
      profileId: value.profileId,
      profileEpochId: value.profileEpochId,
      revision: value.revision,
      unlockEvidence,
      origin,
      activeRoute: value.activeRoute,
      routeProgress: {
        story: story.data,
        accessible: accessible.data,
      },
      completion,
    },
  };
}

function emptyRouteProgress(route: LearningRoute): LearningRouteProgress {
  return {
    route,
    lifecycle: 'not_started',
    completedContentStepIds: [],
    checkAttempts: 0,
    checkSatisfied: false,
  };
}

function readScopedRouteCommand(value: unknown): LearningResult<{
  readonly state: MangroveLearningState;
  readonly profileId: SyntheticChildId;
  readonly profileEpochId: string;
  readonly route: LearningRoute;
}> {
  if (
    !isRecord(value) ||
    !isSupportedProfile(value.profileId) ||
    !isSafeIdentifier(value.profileEpochId) ||
    !isLearningRoute(value.route)
  ) {
    return failure('INVALID_INPUT', 'A supported profile, epoch, and learning route are required');
  }
  const stateResult = validateState(value.state);
  if (!stateResult.ok) return stateResult;
  if (stateResult.data.profileId !== value.profileId) {
    return failure(
      'PROFILE_SCOPE_MISMATCH',
      'The command profile does not own this learning state',
    );
  }
  if (stateResult.data.profileEpochId !== value.profileEpochId) {
    return failure('EPOCH_SCOPE_MISMATCH', 'The command epoch is not the active learning epoch');
  }
  return {
    ok: true,
    data: {
      state: freezeState(stateResult.data),
      profileId: value.profileId,
      profileEpochId: value.profileEpochId,
      route: value.route,
    },
  };
}

function replaceRouteProgress(
  state: MangroveLearningState,
  route: LearningRoute,
  progress: LearningRouteProgress,
): Readonly<Record<LearningRoute, LearningRouteProgress>> {
  return route === 'story'
    ? { story: progress, accessible: state.routeProgress.accessible }
    : { story: state.routeProgress.story, accessible: progress };
}

export function createMangroveLearningState(input: unknown): LearningResult<MangroveLearningState> {
  if (
    !isRecord(input) ||
    !isSupportedProfile(input.profileId) ||
    !isSafeIdentifier(input.profileEpochId)
  ) {
    return failure(
      'INVALID_INPUT',
      'A supported synthetic Child and active reset epoch are required',
    );
  }
  return {
    ok: true,
    data: freezeState({
      schemaVersion: 1,
      packageId: LEARNING_ID,
      profileId: input.profileId,
      profileEpochId: input.profileEpochId,
      revision: 0,
      unlockEvidence: null,
      origin: null,
      activeRoute: null,
      routeProgress: {
        story: emptyRouteProgress('story'),
        accessible: emptyRouteProgress('accessible'),
      },
      completion: null,
    }),
  };
}

export function restoreMangroveLearningState(
  input: unknown,
): LearningResult<MangroveLearningState> {
  const result = validateState(input);
  if (!result.ok) return result;
  return { ok: true, data: freezeState(result.data) };
}

export function startMangroveLearningRoute(
  input: unknown,
): LearningResult<StartLearningRouteResult> {
  const command = readScopedRouteCommand(input);
  if (!command.ok) return command;
  if (!isRecord(input)) return failure('INVALID_INPUT', 'A learning start command is required');

  const originResult = validateOrigin(input.origin);
  if (!originResult.ok) return originResult;
  if (originResult.data.profileId !== command.data.profileId) {
    return failure('PROFILE_SCOPE_MISMATCH', 'The origin belongs to another Child profile');
  }

  const state = command.data.state;
  let unlockEvidence = state.unlockEvidence;
  if (unlockEvidence === null) {
    if (input.unlockEvidence === undefined) {
      return failure('NOT_UNLOCKED', 'Station 132 evidence is required before learning starts');
    }
    const unlockResult = validateUnlockEvidence(input.unlockEvidence);
    if (!unlockResult.ok) return unlockResult;
    if (unlockResult.data.profileId !== command.data.profileId) {
      return failure('PROFILE_SCOPE_MISMATCH', 'The unlock evidence belongs to another Child');
    }
    if (unlockResult.data.profileEpochId !== command.data.profileEpochId) {
      return failure('EPOCH_SCOPE_MISMATCH', 'The unlock evidence belongs to another reset epoch');
    }
    unlockEvidence = unlockResult.data;
  } else if (input.unlockEvidence !== undefined) {
    const unlockResult = validateUnlockEvidence(input.unlockEvidence);
    if (!unlockResult.ok) return unlockResult;
    if (
      unlockResult.data.profileId !== unlockEvidence.profileId ||
      unlockResult.data.profileEpochId !== unlockEvidence.profileEpochId ||
      !sameStringSequence(
        unlockResult.data.reachedThresholds.map(String),
        unlockEvidence.reachedThresholds.map(String),
      )
    ) {
      return failure(
        'UNLOCK_EVIDENCE_CONFLICT',
        'The recorded learning unlock evidence cannot change mid-package',
      );
    }
  }
  if (state.origin !== null && !sameOrigin(state.origin, originResult.data)) {
    return failure('ORIGIN_CONFLICT', 'The recorded return origin cannot change mid-package');
  }
  if (state.completion !== null) {
    return {
      ok: true,
      data: { disposition: 'already_completed', state },
    };
  }

  const route = command.data.route;
  const progress = state.routeProgress[route];
  if (progress.lifecycle !== 'not_started' && state.activeRoute === route) {
    return { ok: true, data: { disposition: 'resumed', state } };
  }

  const startedProgress: LearningRouteProgress =
    progress.lifecycle === 'not_started' ? { ...progress, lifecycle: 'in_progress' } : progress;
  const nextState = freezeState({
    ...state,
    revision: state.revision + 1,
    unlockEvidence,
    origin: state.origin ?? originResult.data,
    activeRoute: route,
    routeProgress: replaceRouteProgress(state, route, startedProgress),
  });
  return {
    ok: true,
    data: {
      disposition: progress.lifecycle === 'not_started' ? 'started' : 'resumed',
      state: nextState,
    },
  };
}

export function advanceMangroveLearningStep(
  input: unknown,
): LearningResult<AdvanceLearningStepResult> {
  const command = readScopedRouteCommand(input);
  if (!command.ok) return command;
  if (!isRecord(input) || typeof input.stepId !== 'string') {
    return failure('INVALID_INPUT', 'A canonical content step is required');
  }

  const state = command.data.state;
  const route = command.data.route;
  if (state.activeRoute !== route) {
    return failure('INACTIVE_ROUTE', 'Start or resume this learning route before changing it');
  }
  const progress = state.routeProgress[route];
  const steps = contentSteps(route);
  if (!steps.includes(input.stepId as LearningContentStepId)) {
    return failure('INVALID_INPUT', 'The content step does not belong to this learning route');
  }
  if (progress.completedContentStepIds.includes(input.stepId as LearningContentStepId)) {
    return { ok: true, data: { disposition: 'already_recorded', state } };
  }
  const expected = steps[progress.completedContentStepIds.length];
  if (progress.lifecycle !== 'in_progress' || input.stepId !== expected) {
    return failure('INVALID_STEP_ORDER', 'Learning content must be completed in canonical order');
  }

  const completedContentStepIds = [
    ...progress.completedContentStepIds,
    input.stepId as LearningContentStepId,
  ];
  const nextProgress: LearningRouteProgress = {
    ...progress,
    lifecycle: completedContentStepIds.length === steps.length ? 'awaiting_check' : 'in_progress',
    completedContentStepIds,
  };
  const nextState = freezeState({
    ...state,
    revision: state.revision + 1,
    activeRoute: route,
    routeProgress: replaceRouteProgress(state, route, nextProgress),
  });
  return { ok: true, data: { disposition: 'recorded', state: nextState } };
}

export function submitMangroveLearningCheck(
  input: unknown,
): LearningResult<SubmitLearningCheckResult> {
  const command = readScopedRouteCommand(input);
  if (!command.ok) return command;
  if (!isRecord(input) || !isLearningCheckOption(input.optionId)) {
    return failure('INVALID_INPUT', 'A canonical no-fail check option is required');
  }

  const state = command.data.state;
  const route = command.data.route;
  if (state.activeRoute !== route) {
    return failure('INACTIVE_ROUTE', 'Start or resume this learning route before changing it');
  }
  const progress = state.routeProgress[route];
  if (progress.lifecycle === 'ready_to_complete' || progress.lifecycle === 'completed') {
    return { ok: true, data: { disposition: 'already_ready', state } };
  }
  if (progress.lifecycle !== 'awaiting_check') {
    return failure('NOT_READY_FOR_CHECK', 'All finite content must be completed before the check');
  }

  const correct = input.optionId === CORRECT_CHECK_OPTION;
  const nextProgress: LearningRouteProgress = {
    ...progress,
    lifecycle: correct ? 'ready_to_complete' : 'awaiting_check',
    checkAttempts: progress.checkAttempts + 1,
    checkSatisfied: correct,
  };
  const nextState = freezeState({
    ...state,
    revision: state.revision + 1,
    activeRoute: route,
    routeProgress: replaceRouteProgress(state, route, nextProgress),
  });
  return {
    ok: true,
    data: {
      disposition: correct ? 'ready_to_complete' : 'retry_available',
      state: nextState,
    },
  };
}

export function completeMangroveLearning(input: unknown): LearningResult<CompleteLearningResult> {
  const command = readScopedRouteCommand(input);
  if (!command.ok) return command;
  if (!isRecord(input) || !isIsoTimestamp(input.completedAt)) {
    return failure('INVALID_INPUT', 'A deterministic ISO completion time is required');
  }

  const state = command.data.state;
  if (state.completion !== null) {
    return {
      ok: true,
      data: {
        disposition: 'already_completed',
        state,
        event: state.completion,
      },
    };
  }

  const route = command.data.route;
  if (state.activeRoute !== route) {
    return failure('INACTIVE_ROUTE', 'Start or resume this learning route before completing it');
  }
  const progress = state.routeProgress[route];
  if (progress.lifecycle !== 'ready_to_complete' || !progress.checkSatisfied) {
    return failure(
      'NOT_READY_TO_COMPLETE',
      'Learning completion requires finished content and a satisfied no-fail check',
    );
  }

  const eventId = completionIdentity(command.data.profileId, command.data.profileEpochId);
  const completion: LearningCompletionEvent = {
    id: eventId,
    triggerEventId: eventId,
    profileId: command.data.profileId,
    profileEpochId: command.data.profileEpochId,
    learningId: LEARNING_ID,
    route,
    status: 'committed',
    completedAt: input.completedAt,
    completionCreditId: LEARNING_ID,
    consequences: {
      seedDelta: 0,
      gardenGrowthDelta: 0,
      canopyContributionDelta: 0,
      greenCircleActionDelta: 0,
      privateLeagueLeafDelta: 0,
      challengeLeafDelta: 0,
      familyRewardProgressDelta: 0,
      masteryCreditIds: [],
      taskRecognitionIds: [],
    },
  };
  const completedProgress: LearningRouteProgress = {
    ...progress,
    lifecycle: 'completed',
  };
  const nextState = freezeState({
    ...state,
    revision: state.revision + 1,
    activeRoute: route,
    routeProgress: replaceRouteProgress(state, route, completedProgress),
    completion,
  });
  if (nextState.completion === null) {
    return failure('COMPLETION_CONFLICT', 'The completion event could not be committed');
  }
  return {
    ok: true,
    data: {
      disposition: 'completed',
      state: nextState,
      event: nextState.completion,
    },
  };
}

export function createMangroveReturnIntent(
  input: unknown,
): LearningResult<MangroveLearningReturnIntent> {
  if (!isRecord(input)) return failure('INVALID_INPUT', 'A learning state is required');
  const stateResult = validateState(input.state);
  if (!stateResult.ok) return stateResult;
  const origin = stateResult.data.origin;
  if (origin === null) {
    return failure('INVALID_ORIGIN', 'Learning has no recorded return origin');
  }

  if (origin.kind === 'today_complete') {
    return {
      ok: true,
      data: Object.freeze({
        kind: 'today_complete',
        route: '/child',
        profileId: origin.profileId,
        focusTargetId: 'today-complete-heading',
        scrollOffset: 0,
        replaceHistory: true,
        autoplayLearningId: null,
      }),
    };
  }
  if (origin.kind === 'badge_detail') {
    return {
      ok: true,
      data: Object.freeze({
        kind: 'badge_detail',
        route: '/garden/badges/[badgeId]',
        profileId: origin.profileId,
        badgeId: origin.badgeId,
        filter: origin.filter,
        focusTargetId: origin.focusTargetId,
        galleryScrollOffset: origin.galleryScrollOffset,
        scrollOffset: origin.scrollOffset,
        replaceHistory: true,
        autoplayLearningId: null,
      }),
    };
  }
  return {
    ok: true,
    data: Object.freeze({
      kind: 'restore_origin',
      route: origin.route,
      profileId: origin.profileId,
      focusTargetId: origin.focusTargetId,
      scrollOffset: origin.scrollOffset,
      replaceHistory: true,
      autoplayLearningId: null,
    }),
  };
}
