import type {
  AcquisitionCredit,
  AcquisitionRecordResult,
  AchievementErrorCode,
  AchievementEvaluationEvidence,
  AchievementResult,
  AchievementSkillId,
  AchievementState,
  ApprovedLearningId,
  AssignedAchievementTask,
  BadgeAward,
  BadgeContextualAction,
  BadgeCriterion,
  BadgeCriterionProgress,
  BadgeDefinition,
  BadgeDisplayState,
  BadgeEvaluationInput,
  BadgeEvaluationResult,
  BadgeGalleryProjection,
  BadgeId,
  BadgeProjectionContext,
  BadgeProjectionItem,
  ParentApprovedAcquisitionEvent,
  SemanticCriterionComponent,
  SemanticCriterionEvidence,
} from '../../models/achievements';
import { IMPACT_PATH_STATIONS, type ImpactPathThreshold } from '../../models/growthJourney';
import { isExactIsoTimestamp } from '../../utils/isoTimestamp';
import { BADGE_REGISTRY, getBadgeDefinition } from './badgeRegistry';

const SKILL_IDS = new Set<AchievementSkillId>([
  'skill.sorting',
  'skill.coast_care',
  'skill.water',
  'skill.energy',
  'skill.nature',
]);
const LEARNING_IDS = new Set<ApprovedLearningId>([
  'learning.ghaf_basics.v1',
  'learning.mangrove_roots.v1',
]);
const IMPACT_PATH_THRESHOLDS = IMPACT_PATH_STATIONS.map((station) => station.threshold);
const JOURNEY_BADGE_THRESHOLDS = new Set<number>([12, 60, 120, 180]);
const CANONICAL_RECYCLING_SKILLS = Object.freeze(['skill.sorting', 'skill.coast_care'] as const);

const SEMANTIC_COMPONENTS_BY_BADGE = new Map<BadgeId, ReadonlySet<SemanticCriterionComponent>>([
  [
    'badge.biodiversity.wetland_exploration.v1',
    new Set(['wetland_learning', 'observation_activity']),
  ],
  [
    'badge.heritage.date_palm_gifts.v1',
    new Set(['date_palm_learning', 'parent_led_reuse_activity']),
  ],
  ['badge.heritage.sadu_patterns.v1', new Set(['sadu_learning', 'original_pattern_activity'])],
]);

function failure<T>(code: AchievementErrorCode, message: string): AchievementResult<T> {
  return { ok: false, error: { code, message } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptySingleLine(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim() === value &&
    value.length > 0 &&
    !/[\r\n]/u.test(value)
  );
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isIsoTimestamp(value: unknown): value is string {
  return (
    isNonEmptySingleLine(value) &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value) &&
    isExactIsoTimestamp(value)
  );
}

function isSkillId(value: unknown): value is AchievementSkillId {
  return typeof value === 'string' && SKILL_IDS.has(value as AchievementSkillId);
}

function isLearningId(value: unknown): value is ApprovedLearningId {
  return typeof value === 'string' && LEARNING_IDS.has(value as ApprovedLearningId);
}

function isBadgeId(value: unknown): value is BadgeId {
  return typeof value === 'string' && getBadgeDefinition(value) !== null;
}

function isImpactPathThreshold(value: unknown): value is ImpactPathThreshold {
  return typeof value === 'number' && IMPACT_PATH_THRESHOLDS.includes(value as ImpactPathThreshold);
}

function uniqueStrings(values: readonly string[]): boolean {
  return new Set(values).size === values.length;
}

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function sameUnorderedStrings(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) return false;
  const expected = new Set(right);
  return left.every((value) => expected.has(value));
}

function freezeCredit(credit: AcquisitionCredit): AcquisitionCredit {
  return Object.freeze({ ...credit });
}

function freezeAward(award: BadgeAward): BadgeAward {
  return Object.freeze({ ...award });
}

function isFrozenState(state: AchievementState): boolean {
  return (
    Object.isFrozen(state) &&
    Object.isFrozen(state.acquisitionCredits) &&
    state.acquisitionCredits.every(Object.isFrozen) &&
    Object.isFrozen(state.awards) &&
    state.awards.every(Object.isFrozen)
  );
}

function freezeState(state: AchievementState): AchievementState {
  if (isFrozenState(state)) return state;
  return Object.freeze({
    profileId: state.profileId,
    profileEpochId: state.profileEpochId,
    acquisitionCredits: Object.freeze(state.acquisitionCredits.map(freezeCredit)),
    awards: Object.freeze(state.awards.map(freezeAward)),
  });
}

function creditId(
  profileId: string,
  profileEpochId: string,
  occurrenceId: string,
  skillId: AchievementSkillId,
): string {
  return `achievement-credit:${profileId}:${profileEpochId}:${occurrenceId}:${skillId}`;
}

function awardId(profileId: string, profileEpochId: string, badgeId: BadgeId): string {
  return `badge-award:${profileId}:${profileEpochId}:${badgeId}`;
}

function validateState(value: unknown): AchievementResult<AchievementState> {
  if (
    !isRecord(value) ||
    !isNonEmptySingleLine(value.profileId) ||
    !isNonEmptySingleLine(value.profileEpochId) ||
    !Array.isArray(value.acquisitionCredits) ||
    !Array.isArray(value.awards)
  ) {
    return failure(
      'INVALID_INPUT',
      'A complete profile- and epoch-scoped achievement state is required',
    );
  }
  const state = value as unknown as AchievementState;
  const creditIds = new Set<string>();
  const creditKeys = new Set<string>();
  const eventToOccurrence = new Map<string, string>();
  const occurrenceToEvent = new Map<string, string>();
  const creditsByOccurrence = new Map<string, AcquisitionCredit[]>();
  for (const candidate of state.acquisitionCredits) {
    if (
      !isRecord(candidate) ||
      !isNonEmptySingleLine(candidate.id) ||
      candidate.profileId !== state.profileId ||
      candidate.profileEpochId !== state.profileEpochId ||
      !isNonEmptySingleLine(candidate.eventId) ||
      !isNonEmptySingleLine(candidate.occurrenceId) ||
      !isNonEmptySingleLine(candidate.taskId) ||
      !isSkillId(candidate.skillId) ||
      candidate.status !== 'committed' ||
      (candidate.recognitionMode !== 'standard' && candidate.recognitionMode !== 'fade_first') ||
      candidate.routinePhase !== 'acquisition' ||
      candidate.private !== true
    ) {
      return failure(
        'INVALID_EVIDENCE',
        'Acquisition credit evidence is incomplete or out of scope',
      );
    }
    const credit = candidate as unknown as AcquisitionCredit;
    if (
      credit.id !==
      creditId(credit.profileId, credit.profileEpochId, credit.occurrenceId, credit.skillId)
    ) {
      return failure(
        'EVIDENCE_CONFLICT',
        'Acquisition credit identity does not match its evidence',
      );
    }
    const creditKey = `${credit.occurrenceId}:${credit.skillId}`;
    if (creditIds.has(credit.id) || creditKeys.has(creditKey)) {
      return failure('EVIDENCE_CONFLICT', 'Duplicate acquisition credit evidence is not permitted');
    }
    creditIds.add(credit.id);
    creditKeys.add(creditKey);
    const knownOccurrence = eventToOccurrence.get(credit.eventId);
    const knownEvent = occurrenceToEvent.get(credit.occurrenceId);
    if (
      (knownOccurrence !== undefined && knownOccurrence !== credit.occurrenceId) ||
      (knownEvent !== undefined && knownEvent !== credit.eventId)
    ) {
      return failure('EVIDENCE_CONFLICT', 'Event and occurrence identities must remain one-to-one');
    }
    eventToOccurrence.set(credit.eventId, credit.occurrenceId);
    occurrenceToEvent.set(credit.occurrenceId, credit.eventId);
    const occurrenceCredits = creditsByOccurrence.get(credit.occurrenceId) ?? [];
    occurrenceCredits.push(credit);
    creditsByOccurrence.set(credit.occurrenceId, occurrenceCredits);
  }
  for (const occurrenceCredits of creditsByOccurrence.values()) {
    const first = occurrenceCredits[0];
    if (!first) {
      return failure('EVIDENCE_CONFLICT', 'Acquisition occurrence evidence cannot be empty');
    }
    if (
      !occurrenceCredits.every(
        (credit) =>
          credit.eventId === first.eventId &&
          credit.taskId === first.taskId &&
          credit.recognitionMode === first.recognitionMode &&
          credit.routinePhase === first.routinePhase,
      )
    ) {
      return failure(
        'EVIDENCE_CONFLICT',
        'Every credit in one occurrence must share the same authoritative task evidence',
      );
    }
    if (
      first.taskId === 'task_recycling_p0_v1' &&
      !sameUnorderedStrings(
        occurrenceCredits.map((credit) => credit.skillId),
        CANONICAL_RECYCLING_SKILLS,
      )
    ) {
      return failure(
        'EVIDENCE_CONFLICT',
        'Canonical recycling evidence requires exactly one sorting and one coast-care credit',
      );
    }
  }

  const awardedBadgeIds = new Set<BadgeId>();
  const awardIds = new Set<string>();
  for (const candidate of state.awards) {
    if (
      !isRecord(candidate) ||
      !isNonEmptySingleLine(candidate.id) ||
      !isBadgeId(candidate.badgeId) ||
      candidate.profileId !== state.profileId ||
      candidate.profileEpochId !== state.profileEpochId ||
      !isNonEmptySingleLine(candidate.sourceEventId) ||
      candidate.status !== 'earned' ||
      (candidate.earnedAt !== null && !isIsoTimestamp(candidate.earnedAt)) ||
      typeof candidate.silentBackfill !== 'boolean' ||
      typeof candidate.celebrationEligible !== 'boolean' ||
      candidate.private !== true ||
      candidate.permanent !== true
    ) {
      return failure('INVALID_EVIDENCE', 'Badge award evidence is incomplete or out of scope');
    }
    const award = candidate as unknown as BadgeAward;
    if (award.id !== awardId(award.profileId, award.profileEpochId, award.badgeId)) {
      return failure('EVIDENCE_CONFLICT', 'Badge award identity does not match its scope');
    }
    if (
      (award.silentBackfill && (award.earnedAt !== null || award.celebrationEligible !== false)) ||
      (!award.silentBackfill && award.earnedAt === null)
    ) {
      return failure('EVIDENCE_CONFLICT', 'Badge award timing conflicts with its backfill status');
    }
    if (awardIds.has(award.id) || awardedBadgeIds.has(award.badgeId)) {
      return failure('EVIDENCE_CONFLICT', 'A badge may be awarded only once per profile epoch');
    }
    awardIds.add(award.id);
    awardedBadgeIds.add(award.badgeId);
  }
  return { ok: true, data: state };
}

export function validateAchievementState(value: unknown): AchievementResult<AchievementState> {
  return validateState(value);
}

function scopeFailure<T>(
  profileId: unknown,
  profileEpochId: unknown,
  state: AchievementState,
): AchievementResult<T> | null {
  if (profileId !== state.profileId) {
    return failure('PROFILE_SCOPE_MISMATCH', 'Achievement evidence belongs to another profile');
  }
  if (profileEpochId !== state.profileEpochId) {
    return failure('EPOCH_SCOPE_MISMATCH', 'Achievement evidence belongs to another reset epoch');
  }
  return null;
}

function canonicalStationPrefix(lifetimeSeeds: number): readonly ImpactPathThreshold[] {
  return IMPACT_PATH_THRESHOLDS.filter((threshold) => threshold <= lifetimeSeeds);
}

function validateEvidence(
  value: unknown,
  state: AchievementState,
): AchievementResult<AchievementEvaluationEvidence> {
  if (
    !isRecord(value) ||
    !isRecord(value.lifetimeSeeds) ||
    !isRecord(value.stationProjection) ||
    !Array.isArray(value.learningCompletions) ||
    !Array.isArray(value.semanticCriterionEvidence)
  ) {
    return failure('INVALID_EVIDENCE', 'Complete deterministic badge evidence is required');
  }
  const evidence = value as unknown as AchievementEvaluationEvidence;
  const lifetimeScope = scopeFailure<AchievementEvaluationEvidence>(
    evidence.lifetimeSeeds.profileId,
    evidence.lifetimeSeeds.profileEpochId,
    state,
  );
  if (lifetimeScope) return lifetimeScope;
  if (
    evidence.lifetimeSeeds.source !== 'committed_seed_ledger' ||
    !isNonNegativeInteger(evidence.lifetimeSeeds.amount) ||
    !Array.isArray(evidence.lifetimeSeeds.entryIds) ||
    evidence.lifetimeSeeds.entryIds.length === 0 ||
    !evidence.lifetimeSeeds.entryIds.every(isNonEmptySingleLine) ||
    !uniqueStrings(evidence.lifetimeSeeds.entryIds)
  ) {
    return failure(
      'INVALID_EVIDENCE',
      'Lifetime Seeds require exact unique committed ledger entries',
    );
  }
  if (evidence.lifetimeSeeds.exact !== true) {
    return failure(
      'AMBIGUOUS_LIFETIME_EVIDENCE',
      'Badge evaluation rejects an ambiguous lifetime Seed projection',
    );
  }

  const stationScope = scopeFailure<AchievementEvaluationEvidence>(
    evidence.stationProjection.profileId,
    evidence.stationProjection.profileEpochId,
    state,
  );
  if (stationScope) return stationScope;
  if (
    evidence.stationProjection.source !== 'canonical_impact_path_projection' ||
    !Array.isArray(evidence.stationProjection.reachedThresholds) ||
    !evidence.stationProjection.reachedThresholds.every(isImpactPathThreshold) ||
    !sameStrings(
      evidence.stationProjection.reachedThresholds.map(String),
      canonicalStationPrefix(evidence.lifetimeSeeds.amount).map(String),
    )
  ) {
    return failure(
      'INVALID_EVIDENCE',
      'Reached stations must be the exact ordered prefix derived from lifetime Seeds',
    );
  }

  const completionIds = new Set<string>();
  const completedLearningIds = new Set<ApprovedLearningId>();
  for (const candidate of evidence.learningCompletions) {
    if (
      !isRecord(candidate) ||
      !isNonEmptySingleLine(candidate.id) ||
      !isLearningId(candidate.learningId) ||
      candidate.status !== 'committed'
    ) {
      return failure('INVALID_EVIDENCE', 'Learning completion evidence is incomplete');
    }
    const completionScope = scopeFailure<AchievementEvaluationEvidence>(
      candidate.profileId,
      candidate.profileEpochId,
      state,
    );
    if (completionScope) return completionScope;
    if (completionIds.has(candidate.id)) {
      return failure('EVIDENCE_CONFLICT', 'Learning completion IDs must be unique');
    }
    if (completedLearningIds.has(candidate.learningId)) {
      return failure(
        'EVIDENCE_CONFLICT',
        'A learning package may have only one completion per profile epoch',
      );
    }
    completionIds.add(candidate.id);
    completedLearningIds.add(candidate.learningId);
  }

  const semanticIds = new Set<string>();
  const semanticKeys = new Map<string, SemanticCriterionEvidence>();
  for (const candidate of evidence.semanticCriterionEvidence) {
    if (
      !isRecord(candidate) ||
      !isNonEmptySingleLine(candidate.id) ||
      !isBadgeId(candidate.badgeId) ||
      !isNonEmptySingleLine(candidate.component) ||
      (candidate.status !== 'awaiting_review' && candidate.status !== 'committed')
    ) {
      return failure('INVALID_EVIDENCE', 'Semantic criterion evidence is incomplete');
    }
    const candidateScope = scopeFailure<AchievementEvaluationEvidence>(
      candidate.profileId,
      candidate.profileEpochId,
      state,
    );
    if (candidateScope) return candidateScope;
    const allowedComponents = SEMANTIC_COMPONENTS_BY_BADGE.get(candidate.badgeId);
    if (!allowedComponents?.has(candidate.component as SemanticCriterionComponent)) {
      return failure(
        'INVALID_EVIDENCE',
        'Semantic criterion evidence does not match the approved badge component',
      );
    }
    if (semanticIds.has(candidate.id)) {
      return failure('EVIDENCE_CONFLICT', 'Semantic evidence IDs must be unique');
    }
    semanticIds.add(candidate.id);
    const key = `${candidate.badgeId}:${candidate.component}`;
    const previous = semanticKeys.get(key);
    if (previous && previous.status !== candidate.status) {
      return failure('EVIDENCE_CONFLICT', 'A semantic component has conflicting review states');
    }
    semanticKeys.set(key, candidate as unknown as SemanticCriterionEvidence);
  }
  return { ok: true, data: evidence };
}

function canonicalSkillsForEvent(
  event: ParentApprovedAcquisitionEvent,
): AchievementResult<readonly AchievementSkillId[]> {
  if (event.taskId === 'task_recycling_p0_v1') {
    if (event.skillIds !== undefined) {
      if (!Array.isArray(event.skillIds) || !event.skillIds.every(isSkillId)) {
        return failure('INVALID_EVIDENCE', 'Canonical recycling mastery evidence is malformed');
      }
      const supplied = [...new Set(event.skillIds)];
      if (!sameUnorderedStrings(supplied, CANONICAL_RECYCLING_SKILLS)) {
        return failure(
          'EVIDENCE_CONFLICT',
          'Canonical recycling may create only sorting and coast-care acquisition credits',
        );
      }
    }
    return { ok: true, data: CANONICAL_RECYCLING_SKILLS };
  }
  if (
    !Array.isArray(event.skillIds) ||
    event.skillIds.length === 0 ||
    !event.skillIds.every(isSkillId)
  ) {
    return failure(
      'INVALID_EVIDENCE',
      'Approved acquisition evidence requires known skill mappings',
    );
  }
  return { ok: true, data: Object.freeze([...new Set(event.skillIds)]) };
}

function validateAcquisitionEvent(
  value: unknown,
  state: AchievementState,
): AchievementResult<ParentApprovedAcquisitionEvent> {
  if (
    !isRecord(value) ||
    !isNonEmptySingleLine(value.eventId) ||
    !isNonEmptySingleLine(value.occurrenceId) ||
    !isNonEmptySingleLine(value.profileId) ||
    !isNonEmptySingleLine(value.profileEpochId) ||
    !isNonEmptySingleLine(value.taskId) ||
    value.status !== 'committed' ||
    (value.recognitionMode !== 'standard' &&
      value.recognitionMode !== 'fade_first' &&
      value.recognitionMode !== 'recognition_only') ||
    (value.routinePhase !== 'acquisition' &&
      value.routinePhase !== 'maintenance' &&
      value.routinePhase !== 'not_applicable')
  ) {
    return failure(
      'INVALID_EVIDENCE',
      'A complete committed Parent-approved task occurrence is required',
    );
  }
  const event = value as unknown as ParentApprovedAcquisitionEvent;
  const scope = scopeFailure<ParentApprovedAcquisitionEvent>(
    event.profileId,
    event.profileEpochId,
    state,
  );
  if (scope) return scope;
  if (event.recognitionMode === 'recognition_only' || event.routinePhase !== 'acquisition') {
    return failure(
      'NON_ACQUISITION_EVIDENCE',
      'Maintenance and recognition-only evidence cannot create mastery credit',
    );
  }
  return { ok: true, data: event };
}

function sameOccurrenceEvidence(
  credits: readonly AcquisitionCredit[],
  event: ParentApprovedAcquisitionEvent,
  skillIds: readonly AchievementSkillId[],
): boolean {
  return (
    credits.length === skillIds.length &&
    credits.every(
      (credit) =>
        credit.eventId === event.eventId &&
        credit.occurrenceId === event.occurrenceId &&
        credit.taskId === event.taskId &&
        credit.recognitionMode === event.recognitionMode &&
        credit.routinePhase === event.routinePhase &&
        skillIds.includes(credit.skillId),
    )
  );
}

export function createEmptyAchievementState(input: {
  readonly profileId: string;
  readonly profileEpochId: string;
}): AchievementResult<AchievementState> {
  if (!isNonEmptySingleLine(input?.profileId) || !isNonEmptySingleLine(input?.profileEpochId)) {
    return failure('INVALID_INPUT', 'Achievement state requires a profile and reset epoch');
  }
  return {
    ok: true,
    data: freezeState({
      profileId: input.profileId,
      profileEpochId: input.profileEpochId,
      acquisitionCredits: [],
      awards: [],
    }),
  };
}

export function recordParentApprovedAcquisition(input: {
  readonly state: AchievementState;
  readonly event: ParentApprovedAcquisitionEvent;
}): AchievementResult<AcquisitionRecordResult> {
  const stateResult = validateState(input?.state);
  if (!stateResult.ok) return stateResult;
  const state = stateResult.data;
  const eventResult = validateAcquisitionEvent(input?.event, state);
  if (!eventResult.ok) return eventResult;
  const event = eventResult.data;
  const skillResult = canonicalSkillsForEvent(event);
  if (!skillResult.ok) return skillResult;
  const skillIds = skillResult.data;

  const sameOccurrence = state.acquisitionCredits.filter(
    (credit) => credit.occurrenceId === event.occurrenceId,
  );
  const sameEvent = state.acquisitionCredits.filter((credit) => credit.eventId === event.eventId);
  if (sameOccurrence.length > 0 || sameEvent.length > 0) {
    if (
      sameOccurrence.length > 0 &&
      sameEvent.length > 0 &&
      sameOccurrenceEvidence(sameOccurrence, event, skillIds) &&
      sameOccurrence.length === sameEvent.length
    ) {
      return {
        ok: true,
        data: Object.freeze({
          disposition: 'already_recorded' as const,
          state: freezeState(state),
          addedCreditIds: Object.freeze([]),
        }),
      };
    }
    return failure(
      'EVIDENCE_CONFLICT',
      'An approval event or task occurrence cannot be reused with different evidence',
    );
  }

  const addedCredits = skillIds.map((skillId) =>
    freezeCredit({
      id: creditId(state.profileId, state.profileEpochId, event.occurrenceId, skillId),
      profileId: state.profileId,
      profileEpochId: state.profileEpochId,
      eventId: event.eventId,
      occurrenceId: event.occurrenceId,
      taskId: event.taskId,
      skillId,
      status: 'committed',
      recognitionMode: event.recognitionMode as Exclude<
        ParentApprovedAcquisitionEvent['recognitionMode'],
        'recognition_only'
      >,
      routinePhase: 'acquisition',
      private: true,
    }),
  );
  const nextState = freezeState({
    ...state,
    acquisitionCredits: [...state.acquisitionCredits, ...addedCredits],
  });
  return {
    ok: true,
    data: Object.freeze({
      disposition: 'recorded' as const,
      state: nextState,
      addedCreditIds: Object.freeze(addedCredits.map((credit) => credit.id)),
    }),
  };
}

function criterionProgress(
  definition: BadgeDefinition,
  criterion: BadgeCriterion,
  state: AchievementState,
  evidence: AchievementEvaluationEvidence,
  earnedBadgeIds: ReadonlySet<BadgeId>,
): BadgeCriterionProgress {
  let current = 0;
  let required = 1;
  let awaitingReview = false;
  if (criterion.kind === 'lifetime_seeds') {
    current = evidence.lifetimeSeeds.amount;
    required = criterion.required;
  } else if (criterion.kind === 'station_reached') {
    current = evidence.stationProjection.reachedThresholds.includes(criterion.threshold) ? 1 : 0;
  } else if (criterion.kind === 'acquisition_credits') {
    current = state.acquisitionCredits.filter(
      (credit) => credit.skillId === criterion.skillId,
    ).length;
    required = criterion.required;
  } else if (criterion.kind === 'prerequisite_badge') {
    current = earnedBadgeIds.has(criterion.badgeId) ? 1 : 0;
  } else if (criterion.kind === 'learning_completed') {
    current = evidence.learningCompletions.some(
      (completion) => completion.learningId === criterion.learningId,
    )
      ? 1
      : 0;
  } else {
    const semantic = evidence.semanticCriterionEvidence.find(
      (item) => item.badgeId === definition.id && item.component === criterion.component,
    );
    current = semantic?.status === 'committed' ? 1 : 0;
    awaitingReview = semantic?.status === 'awaiting_review';
  }
  return Object.freeze({
    kind: criterion.kind,
    current,
    required,
    satisfied: current >= required,
    awaitingReview,
    criterion,
  });
}

function definitionProgress(
  definition: BadgeDefinition,
  state: AchievementState,
  evidence: AchievementEvaluationEvidence,
  earnedBadgeIds: ReadonlySet<BadgeId>,
): readonly BadgeCriterionProgress[] {
  return Object.freeze(
    definition.criteria.map((criterion) =>
      criterionProgress(definition, criterion, state, evidence, earnedBadgeIds),
    ),
  );
}

export function evaluateBadgeAwards(
  input: BadgeEvaluationInput,
): AchievementResult<BadgeEvaluationResult> {
  if (!isRecord(input) || (input.mode !== 'live' && input.mode !== 'historical_seed_backfill')) {
    return failure('INVALID_INPUT', 'Badge evaluation mode is not supported');
  }
  const stateResult = validateState(input?.state);
  if (!stateResult.ok) return stateResult;
  const state = stateResult.data;
  const evidenceResult = validateEvidence(input?.evidence, state);
  if (!evidenceResult.ok) return evidenceResult;
  if (!isNonEmptySingleLine(input.triggerEventId)) {
    return failure('INVALID_INPUT', 'Badge evaluation requires an authoritative trigger event');
  }
  if (input.mode === 'live' && !isIsoTimestamp(input.occurredAt)) {
    return failure('INVALID_INPUT', 'Live badge evaluation requires an explicit event timestamp');
  }

  const earnedBadgeIds = new Set(state.awards.map((award) => award.badgeId));
  const newAwards: BadgeAward[] = [];
  for (const definition of BADGE_REGISTRY) {
    if (earnedBadgeIds.has(definition.id)) continue;
    if (
      input.mode === 'historical_seed_backfill' &&
      !definition.criteria.every((criterion) => criterion.kind === 'lifetime_seeds')
    ) {
      continue;
    }
    const progress = definitionProgress(definition, state, evidenceResult.data, earnedBadgeIds);
    if (!progress.every((criterion) => criterion.satisfied)) continue;
    const silentBackfill = input.mode === 'historical_seed_backfill';
    const award = freezeAward({
      id: awardId(state.profileId, state.profileEpochId, definition.id),
      badgeId: definition.id,
      profileId: state.profileId,
      profileEpochId: state.profileEpochId,
      sourceEventId: input.triggerEventId,
      status: 'earned',
      earnedAt: silentBackfill ? null : input.occurredAt,
      silentBackfill,
      celebrationEligible: !silentBackfill,
      private: true,
      permanent: true,
    });
    newAwards.push(award);
    earnedBadgeIds.add(definition.id);
  }

  const nextState =
    newAwards.length === 0
      ? freezeState(state)
      : freezeState({ ...state, awards: [...state.awards, ...newAwards] });
  const newlyEarnedBadgeIds = Object.freeze(newAwards.map((award) => award.badgeId));
  return {
    ok: true,
    data: Object.freeze({
      state: nextState,
      newlyEarnedBadgeIds,
      celebrationBadgeIds: Object.freeze(
        newAwards.filter((award) => award.celebrationEligible).map((award) => award.badgeId),
      ),
    }),
  };
}

function validateProjectionContext(
  value: unknown,
  state: AchievementState,
): AchievementResult<BadgeProjectionContext> {
  if (
    !isRecord(value) ||
    !Array.isArray(value.archivedSeedThresholds) ||
    !Array.isArray(value.unlockedLearningIds) ||
    !Array.isArray(value.assignedTasks) ||
    !value.archivedSeedThresholds.every(
      (threshold) => isNonNegativeInteger(threshold) && JOURNEY_BADGE_THRESHOLDS.has(threshold),
    ) ||
    !uniqueStrings(value.archivedSeedThresholds.map(String)) ||
    !value.unlockedLearningIds.every(isLearningId) ||
    !uniqueStrings(value.unlockedLearningIds) ||
    !value.assignedTasks.every(isRecord)
  ) {
    return failure('INVALID_EVIDENCE', 'Badge projection context is malformed');
  }
  const context = value as unknown as BadgeProjectionContext;
  const assignmentIds = new Set<string>();
  for (const candidate of context.assignedTasks) {
    const task = candidate as AssignedAchievementTask;
    if (
      !isNonEmptySingleLine(task.assignmentId) ||
      !isNonEmptySingleLine(task.taskId) ||
      (task.status !== 'assigned' && task.status !== 'chosen' && task.status !== 'in_progress') ||
      !Array.isArray(task.skillIds) ||
      task.skillIds.length === 0 ||
      !task.skillIds.every(isSkillId) ||
      !uniqueStrings(task.skillIds)
    ) {
      return failure('INVALID_EVIDENCE', 'Assigned task opportunity is incomplete');
    }
    const scope = scopeFailure<BadgeProjectionContext>(task.profileId, task.profileEpochId, state);
    if (scope) return scope;
    if (assignmentIds.has(task.assignmentId)) {
      return failure('EVIDENCE_CONFLICT', 'Assigned task opportunity IDs must be unique');
    }
    assignmentIds.add(task.assignmentId);
  }
  return { ok: true, data: context };
}

function completionRatio(criteria: readonly BadgeCriterionProgress[]): number {
  if (criteria.length === 0) return 0;
  const total = criteria.reduce(
    (sum, criterion) => sum + Math.min(criterion.current / criterion.required, 1),
    0,
  );
  return total / criteria.length;
}

function contextualActionFor(
  definition: BadgeDefinition,
  criteria: readonly BadgeCriterionProgress[],
  context: BadgeProjectionContext,
  state: AchievementState,
  evidence: AchievementEvaluationEvidence,
  earnedBadgeIds: ReadonlySet<BadgeId>,
  visitedBadgeIds: ReadonlySet<BadgeId> = new Set(),
): BadgeContextualAction | null {
  if (visitedBadgeIds.has(definition.id)) return null;
  const nextVisitedBadgeIds = new Set(visitedBadgeIds);
  nextVisitedBadgeIds.add(definition.id);
  for (const progress of criteria) {
    if (progress.satisfied || progress.awaitingReview) continue;
    const criterion = progress.criterion;
    if (
      criterion.kind === 'lifetime_seeds' &&
      (criterion.required === 120 || criterion.required === 180)
    ) {
      return { kind: 'impact_path_station', threshold: criterion.required };
    }
    if (criterion.kind === 'station_reached') {
      return { kind: 'impact_path_station', threshold: criterion.threshold };
    }
    if (
      criterion.kind === 'learning_completed' &&
      context.unlockedLearningIds.includes(criterion.learningId)
    ) {
      return { kind: 'unlocked_learning', learningId: criterion.learningId };
    }
    if (criterion.kind === 'acquisition_credits') {
      const task = [...context.assignedTasks]
        .sort((left, right) => left.assignmentId.localeCompare(right.assignmentId))
        .find((candidate) => candidate.skillIds.includes(criterion.skillId));
      if (task) {
        return {
          kind: 'assigned_task',
          assignmentId: task.assignmentId,
          taskId: task.taskId,
        };
      }
    }
    if (criterion.kind === 'prerequisite_badge') {
      const prerequisite = getBadgeDefinition(criterion.badgeId);
      if (prerequisite) {
        const prerequisiteProgress = definitionProgress(
          prerequisite,
          state,
          evidence,
          earnedBadgeIds,
        );
        const action = contextualActionFor(
          prerequisite,
          prerequisiteProgress,
          context,
          state,
          evidence,
          earnedBadgeIds,
          nextVisitedBadgeIds,
        );
        if (action) return action;
      }
    }
  }
  return null;
}

function baseDisplayState(
  earned: boolean,
  criteria: readonly BadgeCriterionProgress[],
): Exclude<BadgeDisplayState, 'next_recommended'> {
  if (earned) return 'earned';
  if (criteria.some((criterion) => criterion.awaitingReview)) return 'awaiting_review';
  if (criteria.some((criterion) => criterion.current > 0)) return 'in_progress';
  return 'locked';
}

function freezeProjectionItem(item: BadgeProjectionItem): BadgeProjectionItem {
  return Object.freeze({
    ...item,
    criteria: Object.freeze([...item.criteria]),
    contextualAction: item.contextualAction ? Object.freeze({ ...item.contextualAction }) : null,
    archivedContext: item.archivedContext ? Object.freeze({ ...item.archivedContext }) : null,
  });
}

export function projectBadgeGallery(input: {
  readonly state: AchievementState;
  readonly evidence: AchievementEvaluationEvidence;
  readonly context: BadgeProjectionContext;
}): AchievementResult<BadgeGalleryProjection> {
  const stateResult = validateState(input?.state);
  if (!stateResult.ok) return stateResult;
  const state = stateResult.data;
  const evidenceResult = validateEvidence(input?.evidence, state);
  if (!evidenceResult.ok) return evidenceResult;
  const contextResult = validateProjectionContext(input?.context, state);
  if (!contextResult.ok) return contextResult;
  const context = contextResult.data;
  const earnedBadgeIds = new Set(state.awards.map((award) => award.badgeId));

  const baseItems = BADGE_REGISTRY.map((definition) => {
    const criteria = definitionProgress(definition, state, evidenceResult.data, earnedBadgeIds);
    const earned = earnedBadgeIds.has(definition.id);
    const lifetimeCriterion = definition.criteria.find(
      (criterion): criterion is Extract<BadgeCriterion, { kind: 'lifetime_seeds' }> =>
        criterion.kind === 'lifetime_seeds',
    );
    return {
      id: definition.id,
      label: definition.label,
      criterionText: definition.criterionText,
      displayState: baseDisplayState(earned, criteria),
      criteria,
      completionRatio: completionRatio(criteria),
      whyItMatters: definition.whyItMatters,
      sourceNote: definition.sourceNote,
      contextualAction: contextualActionFor(
        definition,
        criteria,
        context,
        state,
        evidenceResult.data,
        earnedBadgeIds,
      ),
      archivedContext:
        earned &&
        lifetimeCriterion &&
        context.archivedSeedThresholds.includes(lifetimeCriterion.required)
          ? {
              kind: 'completed_seed_stage' as const,
              threshold: lifetimeCriterion.required,
            }
          : null,
      private: true as const,
    } satisfies BadgeProjectionItem;
  });

  let recommendationIndex = -1;
  let recommendationRatio = -1;
  for (let index = 0; index < baseItems.length; index += 1) {
    const item = baseItems[index];
    if (!item || item.displayState === 'earned' || item.displayState === 'awaiting_review')
      continue;
    if (item.completionRatio > recommendationRatio) {
      recommendationIndex = index;
      recommendationRatio = item.completionRatio;
    }
  }
  const items = Object.freeze(
    baseItems.map((item, index) =>
      freezeProjectionItem({
        ...item,
        displayState: index === recommendationIndex ? 'next_recommended' : item.displayState,
      }),
    ),
  );
  return {
    ok: true,
    data: Object.freeze({
      profileId: state.profileId,
      profileEpochId: state.profileEpochId,
      items,
    }),
  };
}

export function projectBadgeDetail(input: {
  readonly badgeId: string;
  readonly state: AchievementState;
  readonly evidence: AchievementEvaluationEvidence;
  readonly context: BadgeProjectionContext;
}): AchievementResult<BadgeProjectionItem> {
  if (!isBadgeId(input?.badgeId)) {
    return failure('UNKNOWN_BADGE', 'Badge detail requires one of the 16 approved badge IDs');
  }
  const gallery = projectBadgeGallery({
    state: input.state,
    evidence: input.evidence,
    context: input.context,
  });
  if (!gallery.ok) return gallery;
  const item = gallery.data.items.find((candidate) => candidate.id === input.badgeId);
  return item
    ? { ok: true, data: item }
    : failure('UNKNOWN_BADGE', 'Badge detail requires one of the 16 approved badge IDs');
}
