import type { AchievementState, LearningCompletionEvidence } from '../../models/achievements';
import type {
  CheckInRouteState,
  ConfirmationAttempt,
  DomainErrorCode,
  DomainResult,
  PendingConfirmationPlan,
  PraisePresentationAction,
  PraisePresentedPlan,
  PrototypeSession,
  RecognitionAttemptResult,
  RecognitionContinuationAction,
  RecognitionReceipt,
  RoutineProgressState,
  SyntheticChildId,
  TaskJourney,
} from '../../models/familyGrowth';
import type { RecognitionService, ServiceResult } from '../../services/interfaces';
import {
  hasDensePlainArrayShape as hasDenseArrayShape,
  hasExactPlainDataKeys as hasExactKeys,
  hasOnlyPlainDataProperties,
  isExactPlainDataEqual as sameValue,
  isPlainDataRecord as isPlainRecord,
} from '../../utils/exactPlainData';
import { isExactIsoTimestamp } from '../../utils/isoTimestamp';
import { applyCanopy, applyCircle, planAfterConfirmation } from '../circle/projection';
import { nextThresholdForSeeds, planLandscapeGrowth, stageForSeeds } from '../garden/progression';
import {
  evaluateBadgeAwards,
  recordParentApprovedAcquisition,
  validateAchievementState,
} from '../growth/achievements';
import { BADGE_REGISTRY } from '../growth/badgeRegistry';
import type { GrowthJourneyRuntimeState } from '../growth/bootstrap';
import { projectWaterAndCoastPath, selectLifetimeSeeds } from '../growth/seedLedger';
import { evaluateRecognitionPolicy } from '../rewards/policy';
import { SYNTHETIC_CHILDREN, SYNTHETIC_HOUSEHOLD } from './demoContent';
import { isDescriptiveTaskPraise } from './validation';

const PROFILE_IDS = ['child_salem', 'child_alya'] as const;
const LANDSCAPE_IDS = ['ghaf', 'samar', 'sidr', 'date_palm', 'mangrove'] as const;
const OPENING_LANDSCAPE_SEEDS = {
  ghaf: 0,
  samar: 0,
  sidr: 0,
  date_palm: 0,
  mangrove: 48,
} as const;
const FIXED_SEED_AWARDS = new Set<number>([4, 6, 8, 12, 15]);

function failure(message: string): DomainResult<never> {
  return {
    ok: false,
    error: {
      code: 'INVALID_RESPONSE',
      message,
      retryable: false,
      fallbackAvailable: false,
    },
  };
}

function requestFailure(message: string): DomainResult<never> {
  return {
    ok: false,
    error: {
      code: 'INVALID_TRANSITION',
      message,
      retryable: false,
      fallbackAvailable: false,
    },
  };
}

function inputFailure(message: string): DomainResult<never> {
  return {
    ok: false,
    error: {
      code: 'INVALID_INPUT',
      message,
      retryable: false,
      fallbackAvailable: false,
    },
  };
}

function clonePlainValue(value: unknown, stack: WeakSet<object>): unknown {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'boolean'
  ) {
    return value;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Non-finite boundary number');
    return value;
  }
  if (typeof value !== 'object' || stack.has(value)) {
    throw new Error('Recognition boundary value is not acyclic plain data');
  }
  stack.add(value);
  if (Array.isArray(value)) {
    if (!hasDenseArrayShape(value)) throw new Error('Recognition boundary array is malformed');
    const clone: unknown[] = [];
    for (let index = 0; index < value.length; index += 1) {
      clone[index] = clonePlainValue(value[index], stack);
    }
    stack.delete(value);
    return clone;
  }
  if (!isPlainRecord(value)) throw new Error('Recognition boundary object is not plain data');
  const clone: Record<string, unknown> = Object.create(Object.getPrototypeOf(value)) as Record<
    string,
    unknown
  >;
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (
      typeof key !== 'string' ||
      descriptor === undefined ||
      !descriptor.enumerable ||
      !('value' in descriptor)
    ) {
      throw new Error('Recognition boundary object has a non-data property');
    }
    Object.defineProperty(clone, key, {
      value: clonePlainValue(descriptor.value, stack),
      enumerable: true,
      configurable: true,
      writable: true,
    });
  }
  stack.delete(value);
  return clone;
}

export function cloneRecognitionBoundaryInput<T>(value: T): DomainResult<T> {
  try {
    return { ok: true, data: clonePlainValue(value, new WeakSet<object>()) as T };
  } catch {
    return failure('Recognition service input is not isolated plain data');
  }
}

function canonicalSeedLedger(
  ledger: GrowthJourneyRuntimeState['ledgersByProfile'][SyntheticChildId],
) {
  return {
    profileId: ledger.profileId,
    profileEpochId: ledger.profileEpochId,
    entries: ledger.entries.map((entry) => ({
      id: entry.id,
      profileId: entry.profileId,
      profileEpochId: entry.profileEpochId,
      triggerEventId: entry.triggerEventId,
      kind: entry.kind,
      amount: entry.amount,
      status: entry.status,
      committedAt: entry.committedAt,
      silentBackfill: entry.silentBackfill,
      provenance: {
        fixtureVersion: entry.provenance.fixtureVersion,
        source: entry.provenance.source,
        sourceIds: [...entry.provenance.sourceIds],
        sourceFingerprint: entry.provenance.sourceFingerprint,
      },
    })),
    migrationReceipts: ledger.migrationReceipts.map((receipt) => ({
      id: receipt.id,
      migrationVersion: receipt.migrationVersion,
      fixtureVersion: receipt.fixtureVersion,
      profileId: receipt.profileId,
      profileEpochId: receipt.profileEpochId,
      sourceFingerprint: receipt.sourceFingerprint,
      status: receipt.status,
      entryIds: [...receipt.entryIds],
      appliedAt: receipt.appliedAt,
      syntheticOnly: receipt.syntheticOnly,
      silentBackfill: receipt.silentBackfill,
    })),
    plantStageArchives: ledger.plantStageArchives.map((archive) => ({
      id: archive.id,
      profileId: archive.profileId,
      profileEpochId: archive.profileEpochId,
      landscapeId: archive.landscapeId,
      threshold: archive.threshold,
      seedsBefore: archive.seedsBefore,
      seedsAfter: archive.seedsAfter,
      stageBefore: archive.stageBefore,
      stageAfter: archive.stageAfter,
      triggerEventId: archive.triggerEventId,
      symbolicOnly: archive.symbolicOnly,
    })),
  };
}

function canonicalAchievementState(
  state: GrowthJourneyRuntimeState['achievementsByProfile'][SyntheticChildId],
) {
  return {
    profileId: state.profileId,
    profileEpochId: state.profileEpochId,
    acquisitionCredits: state.acquisitionCredits.map((credit) => ({
      id: credit.id,
      profileId: credit.profileId,
      profileEpochId: credit.profileEpochId,
      eventId: credit.eventId,
      occurrenceId: credit.occurrenceId,
      taskId: credit.taskId,
      skillId: credit.skillId,
      status: credit.status,
      recognitionMode: credit.recognitionMode,
      routinePhase: credit.routinePhase,
      private: credit.private,
    })),
    awards: state.awards.map((award) => ({
      id: award.id,
      badgeId: award.badgeId,
      profileId: award.profileId,
      profileEpochId: award.profileEpochId,
      sourceEventId: award.sourceEventId,
      status: award.status,
      earnedAt: award.earnedAt,
      silentBackfill: award.silentBackfill,
      celebrationEligible: award.celebrationEligible,
      private: award.private,
      permanent: award.permanent,
    })),
  };
}

export function validateGrowthJourneyRuntimeBoundary(
  value: unknown,
): DomainResult<GrowthJourneyRuntimeState> {
  const isolated = cloneRecognitionBoundaryInput(value);
  if (!isolated.ok) return isolated;
  try {
    const candidate = isolated.data as GrowthJourneyRuntimeState;
    const expected = {
      resetSequence: candidate.resetSequence,
      ledgersByProfile: {
        child_salem: canonicalSeedLedger(candidate.ledgersByProfile.child_salem),
        child_alya: canonicalSeedLedger(candidate.ledgersByProfile.child_alya),
      },
      achievementsByProfile: {
        child_salem: canonicalAchievementState(candidate.achievementsByProfile.child_salem),
        child_alya: canonicalAchievementState(candidate.achievementsByProfile.child_alya),
      },
    };
    if (!sameValue(candidate, expected)) {
      return failure('Growth Journey runtime has an invalid plain-data shape');
    }
    for (const profileId of PROFILE_IDS) {
      const ledger = candidate.ledgersByProfile[profileId];
      if (
        ledger.entries.some(
          (entry) => entry.committedAt !== null && !isExactIsoTimestamp(entry.committedAt),
        ) ||
        ledger.migrationReceipts.some((receipt) => !isExactIsoTimestamp(receipt.appliedAt)) ||
        !selectLifetimeSeeds(ledger, profileId, ledger.profileEpochId).ok
      ) {
        return failure('Growth Journey Seed authority is invalid');
      }
    }
    if (
      !validateAchievementState(candidate.achievementsByProfile.child_salem).ok ||
      !validateAchievementState(candidate.achievementsByProfile.child_alya).ok
    ) {
      return failure('Growth Journey achievement authority is invalid');
    }
    return { ok: true, data: candidate };
  } catch {
    return failure('Growth Journey runtime has malformed authority data');
  }
}

export function hasCommittedGrowthRecognitionEvidence(
  runtime: GrowthJourneyRuntimeState,
  recognitionKey: string,
): boolean {
  return (['child_salem', 'child_alya'] as const).some((profileId) => {
    const ledger = runtime.ledgersByProfile[profileId];
    const achievements = runtime.achievementsByProfile[profileId];
    return (
      ledger.entries.some(
        (entry) =>
          entry.triggerEventId === recognitionKey ||
          entry.provenance.sourceIds.includes(recognitionKey),
      ) ||
      ledger.plantStageArchives.some((archive) => archive.triggerEventId === recognitionKey) ||
      achievements.acquisitionCredits.some((credit) => credit.eventId === recognitionKey) ||
      achievements.awards.some((award) => award.sourceEventId === recognitionKey)
    );
  });
}

export function hasSeedReceiptGrowthParity(
  session: PrototypeSession,
  runtime: GrowthJourneyRuntimeState,
  allowedMissingRecognitionKey?: string,
): boolean {
  try {
    const coreTransactions = new Map(
      Object.values(session.recognitionLedger)
        .filter(
          (
            receipt,
          ): receipt is RecognitionReceipt & {
            readonly seedTransaction: NonNullable<RecognitionReceipt['seedTransaction']>;
          } => receipt.seedTransaction !== null,
        )
        .map((receipt) => [receipt.recognitionKey, receipt.seedTransaction] as const),
    );
    const growthEntries = PROFILE_IDS.flatMap((profileId) =>
      runtime.ledgersByProfile[profileId].entries.filter(
        (entry) => entry.kind === 'task_recognition',
      ),
    );
    const growthKeys = new Set(growthEntries.map((entry) => entry.triggerEventId));
    const missingCoreKeys = [...coreTransactions.keys()].filter((key) => !growthKeys.has(key));
    if (
      missingCoreKeys.length > 1 ||
      (missingCoreKeys.length === 1 && missingCoreKeys[0] !== allowedMissingRecognitionKey) ||
      growthEntries.some((entry) => !coreTransactions.has(entry.triggerEventId))
    ) {
      return false;
    }
    return growthEntries.every((entry) => {
      const transaction = coreTransactions.get(entry.triggerEventId);
      return (
        transaction !== undefined &&
        transaction.childId === entry.profileId &&
        transaction.amount === entry.amount &&
        transaction.id === entry.provenance.sourceIds[1] &&
        transaction.recognitionKey === entry.provenance.sourceIds[0] &&
        transaction.recognitionKey === entry.triggerEventId
      );
    });
  } catch {
    return false;
  }
}

export interface CommittedLearningAchievementEvent extends LearningCompletionEvidence {
  readonly triggerEventId: string;
  readonly completedAt: string;
}

function hasCanonicalLearningEvents(
  events: readonly CommittedLearningAchievementEvent[],
  profileId: SyntheticChildId,
  profileEpochId: string,
): boolean {
  const ids = new Set<string>();
  const triggerIds = new Set<string>();
  return events.every((event) => {
    if (
      event.profileId !== profileId ||
      event.profileEpochId !== profileEpochId ||
      event.status !== 'committed' ||
      typeof event.id !== 'string' ||
      event.id.trim().length === 0 ||
      typeof event.triggerEventId !== 'string' ||
      event.triggerEventId.trim().length === 0 ||
      !isExactIsoTimestamp(event.completedAt) ||
      ids.has(event.id) ||
      triggerIds.has(event.triggerEventId)
    ) {
      return false;
    }
    ids.add(event.id);
    triggerIds.add(event.triggerEventId);
    return true;
  });
}

interface AchievementReplayEvent {
  readonly triggerEventId: string;
  readonly occurredAt: string;
  readonly ledgerEntryId: string;
  readonly receipt: RecognitionReceipt;
}

export function hasRecognitionAchievementParity(
  session: PrototypeSession,
  runtime: GrowthJourneyRuntimeState,
  learningEvents: readonly CommittedLearningAchievementEvent[] = Object.freeze([]),
  allowedMissingRecognitionKey?: string,
): boolean {
  try {
    for (const profileId of PROFILE_IDS) {
      const ledger = runtime.ledgersByProfile[profileId];
      const achievements = runtime.achievementsByProfile[profileId];
      if (
        !ledger ||
        !achievements ||
        !validateAchievementState(achievements).ok ||
        !hasCanonicalLearningEvents(
          learningEvents.filter((event) => event.profileId === profileId),
          profileId,
          ledger.profileEpochId,
        )
      ) {
        return false;
      }

      const historicalSeeds = ledger.entries
        .filter((entry) => entry.kind !== 'task_recognition')
        .reduce((total, entry) => total + entry.amount, 0);
      const expectedBackfillAwards = BADGE_REGISTRY.filter(
        (definition) =>
          definition.criteria.length > 0 &&
          definition.criteria.every(
            (criterion) =>
              criterion.kind === 'lifetime_seeds' && criterion.required <= historicalSeeds,
          ),
      ).map((definition) => ({
        id: `badge-award:${profileId}:${ledger.profileEpochId}:${definition.id}`,
        badgeId: definition.id,
        profileId,
        profileEpochId: ledger.profileEpochId,
        sourceEventId: `schema3-achievement-backfill:${profileId}:${ledger.profileEpochId}`,
        status: 'earned' as const,
        earnedAt: null,
        silentBackfill: true,
        celebrationEligible: false,
        private: true as const,
        permanent: true as const,
      }));
      const actualBackfillAwards = achievements.awards.filter((award) => award.silentBackfill);
      if (!sameValue(actualBackfillAwards, expectedBackfillAwards)) return false;

      const taskEntries = ledger.entries.filter((entry) => entry.kind === 'task_recognition');
      const coreRecognitionKeys = Object.values(session.recognitionLedger)
        .filter(
          (receipt) =>
            receipt.seedTransaction !== null && receipt.provenance.profileId === profileId,
        )
        .map((receipt) => receipt.recognitionKey);
      const taskEntryKeys = new Set(taskEntries.map((entry) => entry.triggerEventId));
      const missingCoreKeys = coreRecognitionKeys.filter((key) => !taskEntryKeys.has(key));
      if (
        taskEntries.some(
          (entry) =>
            session.recognitionLedger[entry.triggerEventId]?.provenance.profileId !== profileId,
        ) ||
        missingCoreKeys.length > 1 ||
        (missingCoreKeys.length === 1 && missingCoreKeys[0] !== allowedMissingRecognitionKey)
      ) {
        return false;
      }

      const replayEvents: AchievementReplayEvent[] = [];
      const activeCheckIn = session.journey?.checkIn;
      for (const recognitionKey of coreRecognitionKeys) {
        const receipt = session.recognitionLedger[recognitionKey];
        const entry = taskEntries.find((candidate) => candidate.triggerEventId === recognitionKey);
        if (!receipt || receipt.seedTransaction === null) return false;
        if (entry) {
          if (!isExactIsoTimestamp(entry.committedAt)) return false;
          replayEvents.push({
            triggerEventId: recognitionKey,
            occurredAt: entry.committedAt,
            ledgerEntryId: entry.id,
            receipt,
          });
        } else if (
          recognitionKey === allowedMissingRecognitionKey &&
          activeCheckIn?.recognitionKey === recognitionKey &&
          isExactIsoTimestamp(activeCheckIn.praisePresentedAt)
        ) {
          replayEvents.push({
            triggerEventId: recognitionKey,
            occurredAt: activeCheckIn.praisePresentedAt,
            ledgerEntryId: `achievement-parity-recovery:${recognitionKey}`,
            receipt,
          });
        } else {
          return false;
        }
      }

      const profileLearningEvents = learningEvents.filter((event) => event.profileId === profileId);
      if (profileLearningEvents.length > 1) return false;
      const learningEvent = profileLearningEvents[0];
      const initialEntryIds = ledger.entries
        .filter((entry) => entry.kind !== 'task_recognition')
        .map((entry) => entry.id);

      const replayWithLearningAt = (learningPosition: number | null): AchievementState | null => {
        let replayState: AchievementState = {
          profileId,
          profileEpochId: ledger.profileEpochId,
          acquisitionCredits: [],
          awards: expectedBackfillAwards,
        };
        let replayLifetime = historicalSeeds;
        const replayEntryIds = [...initialEntryIds];
        let learningCompletions: readonly LearningCompletionEvidence[] = Object.freeze([]);

        const evaluateAt = (triggerEventId: string, occurredAt: string): boolean => {
          const path = projectWaterAndCoastPath(replayLifetime);
          if (!path.ok) return false;
          const evaluated = evaluateBadgeAwards({
            state: replayState,
            evidence: {
              lifetimeSeeds: {
                profileId,
                profileEpochId: ledger.profileEpochId,
                source: 'committed_seed_ledger',
                exact: true,
                amount: replayLifetime,
                entryIds: replayEntryIds,
              },
              stationProjection: {
                profileId,
                profileEpochId: ledger.profileEpochId,
                source: 'canonical_impact_path_projection',
                reachedThresholds: path.data.reachedThresholds,
              },
              learningCompletions,
              semanticCriterionEvidence: [],
            },
            mode: 'live',
            triggerEventId,
            occurredAt,
          });
          if (!evaluated.ok) return false;
          replayState = evaluated.data.state;
          return true;
        };

        for (let index = 0; index <= replayEvents.length; index += 1) {
          if (learningEvent && learningPosition === index) {
            const pathAtLearning = projectWaterAndCoastPath(replayLifetime);
            if (
              !pathAtLearning.ok ||
              (learningEvent.learningId === 'learning.mangrove_roots.v1' &&
                !pathAtLearning.data.reachedThresholds.includes(132))
            ) {
              return null;
            }
            learningCompletions = Object.freeze([
              Object.freeze({
                id: learningEvent.id,
                profileId,
                profileEpochId: ledger.profileEpochId,
                learningId: learningEvent.learningId,
                status: learningEvent.status,
              }),
            ]);
            if (!evaluateAt(learningEvent.triggerEventId, learningEvent.completedAt)) return null;
          }
          if (index === replayEvents.length) break;

          const event = replayEvents[index];
          if (!event) return null;
          const transaction = event.receipt.seedTransaction;
          if (!transaction) return null;
          replayLifetime += transaction.amount;
          replayEntryIds.push(event.ledgerEntryId);
          if (event.receipt.provenance.taskId === 'task_recycling_p0_v1') {
            const recorded = recordParentApprovedAcquisition({
              state: replayState,
              event: {
                eventId: event.triggerEventId,
                occurrenceId: event.receipt.provenance.submissionId,
                profileId,
                profileEpochId: ledger.profileEpochId,
                taskId: event.receipt.provenance.taskId,
                status: 'committed',
                recognitionMode: event.receipt.provenance.projection.recognitionMode,
                routinePhase: event.receipt.provenance.projection.routinePhase,
              },
            });
            if (!recorded.ok) return null;
            replayState = recorded.data.state;
          }
          if (!evaluateAt(event.triggerEventId, event.occurredAt)) return null;
        }
        return replayState;
      };

      const learningPositions = learningEvent
        ? Array.from({ length: replayEvents.length + 1 }, (_, index) => index)
        : [null];
      const hasExactReplay = learningPositions.some((learningPosition) => {
        const replayState = replayWithLearningAt(learningPosition);
        return (
          replayState !== null &&
          sameValue(canonicalAchievementState(replayState), canonicalAchievementState(achievements))
        );
      });
      if (!hasExactReplay) return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function hasExactTaskJourneyTimeline(journey: TaskJourney): boolean {
  const assignment = journey.assignment;
  const submission = journey.submission;
  const checkIn = journey.checkIn;
  if (
    !assignment ||
    !isExactIsoTimestamp(assignment.createdAt) ||
    (submission !== null &&
      (!isExactIsoTimestamp(submission.submittedAt) ||
        Date.parse(assignment.createdAt) > Date.parse(submission.submittedAt))) ||
    (checkIn !== null &&
      (!submission ||
        !isExactIsoTimestamp(checkIn.createdAt) ||
        Date.parse(submission.submittedAt) > Date.parse(checkIn.createdAt)))
  ) {
    return false;
  }
  if (checkIn === null) return true;
  const presentationHasRecordedPraise =
    checkIn.confirmationPresentation === 'praise_presented' ||
    checkIn.confirmationPresentation === 'recognition_applied';
  return presentationHasRecordedPraise
    ? checkIn.praisePresentedAt !== null &&
        isExactIsoTimestamp(checkIn.praisePresentedAt) &&
        Date.parse(checkIn.createdAt) <= Date.parse(checkIn.praisePresentedAt)
    : checkIn.praisePresentedAt === null;
}

export function hasExactRecognitionTimeline(journey: TaskJourney): boolean {
  return (
    hasExactTaskJourneyTimeline(journey) &&
    journey.submission !== null &&
    journey.checkIn !== null &&
    journey.checkIn.praisePresentedAt !== null
  );
}

type SeedReceiptEvidence = {
  readonly transaction: NonNullable<RecognitionReceipt['seedTransaction']>;
  readonly growth: NonNullable<RecognitionReceipt['landscapeGrowth']>;
};

const CATEGORY_LANDSCAPES = {
  faith_gratitude: 'sidr',
  roots_kinship: 'ghaf',
  home_responsibility: 'samar',
  green_impact: 'mangrove',
  food_hospitality: 'date_palm',
  heritage_etiquette: 'ghaf',
  kindness_community: 'samar',
  learning_wellbeing: 'sidr',
} as const;

function isCanonicalSeedTransaction(
  value: unknown,
  recognitionKey: string,
): value is SeedReceiptEvidence['transaction'] {
  if (
    !isPlainRecord(value) ||
    !hasExactKeys(value, [
      'id',
      'recognitionKey',
      'childId',
      'amount',
      'balanceBefore',
      'balanceAfter',
      'meaning',
    ]) ||
    !recognitionKey.startsWith('recognition:')
  ) {
    return false;
  }
  const submissionId = recognitionKey.slice('recognition:'.length);
  return (
    submissionId.length > 0 &&
    value.id === `seed_transaction_${submissionId}` &&
    value.recognitionKey === recognitionKey &&
    (value.childId === 'child_salem' || value.childId === 'child_alya') &&
    typeof value.amount === 'number' &&
    FIXED_SEED_AWARDS.has(value.amount) &&
    typeof value.balanceBefore === 'number' &&
    Number.isSafeInteger(value.balanceBefore) &&
    value.balanceBefore >= 0 &&
    typeof value.balanceAfter === 'number' &&
    Number.isSafeInteger(value.balanceAfter) &&
    value.balanceAfter === value.balanceBefore + value.amount &&
    value.meaning === 'symbolic_nonfinancial'
  );
}

export function hasCanonicalRecognitionProvenance(
  receipt: RecognitionReceipt,
  recognitionKey: string,
): boolean {
  const provenance = receipt.provenance;
  if (
    !isPlainRecord(provenance) ||
    !hasExactKeys(provenance, [
      'schemaVersion',
      'taskId',
      'taskVersion',
      'submissionId',
      'profileId',
      'landscapeId',
      'completionMode',
      'projection',
      'recurrence',
      'familyRewardEligible',
      'challengeLeafEligible',
      'routineCompletionCountBefore',
      'routineCompletionCountAfter',
    ]) ||
    provenance.schemaVersion !== 'r003.recognition-provenance.v1' ||
    typeof provenance.taskId !== 'string' ||
    provenance.taskId.trim().length === 0 ||
    !Number.isSafeInteger(provenance.taskVersion) ||
    provenance.taskVersion < 1 ||
    typeof provenance.submissionId !== 'string' ||
    provenance.submissionId.trim().length === 0 ||
    recognitionKey !== `recognition:${provenance.submissionId}` ||
    (provenance.profileId !== 'child_salem' && provenance.profileId !== 'child_alya') ||
    (provenance.completionMode !== 'independent' &&
      provenance.completionMode !== 'permitted_help') ||
    (provenance.recurrence !== 'once' && provenance.recurrence !== 'recurrent') ||
    typeof provenance.familyRewardEligible !== 'boolean' ||
    typeof provenance.challengeLeafEligible !== 'boolean' ||
    !Number.isSafeInteger(provenance.routineCompletionCountBefore) ||
    provenance.routineCompletionCountBefore < 0 ||
    !Number.isSafeInteger(provenance.routineCompletionCountAfter) ||
    provenance.routineCompletionCountAfter < 0 ||
    !isPlainRecord(provenance.projection)
  ) {
    return false;
  }
  const projection = planAfterConfirmation(provenance.projection);
  if (
    !projection.ok ||
    CATEGORY_LANDSCAPES[provenance.projection.categoryId] !== provenance.landscapeId ||
    !sameValue(receipt.canopyContribution, projection.data.canopyContribution) ||
    !sameValue(receipt.circleEvent, projection.data.circleEvent)
  ) {
    return false;
  }
  const recurringFadeFirst =
    provenance.projection.recognitionMode === 'fade_first' && provenance.recurrence === 'recurrent';
  const expectedRoutineAfter =
    recurringFadeFirst && provenance.projection.routinePhase === 'acquisition'
      ? provenance.routineCompletionCountBefore + 1
      : provenance.routineCompletionCountBefore;
  if (
    provenance.routineCompletionCountAfter !== expectedRoutineAfter ||
    (!recurringFadeFirst &&
      (provenance.routineCompletionCountBefore !== 0 ||
        provenance.routineCompletionCountAfter !== 0)) ||
    (provenance.projection.consequenceKind === 'rewarded_acquisition') !==
      (receipt.seedTransaction !== null) ||
    (receipt.seedTransaction === null) !== (receipt.landscapeGrowth === null) ||
    (receipt.seedTransaction !== null &&
      (receipt.seedTransaction.childId !== provenance.profileId ||
        receipt.landscapeGrowth?.landscapeId !== provenance.landscapeId))
  ) {
    return false;
  }
  const expectsPhaseReview =
    recurringFadeFirst &&
    provenance.projection.routinePhase === 'acquisition' &&
    provenance.routineCompletionCountAfter === 3;
  if (
    expectsPhaseReview
      ? !isCanonicalPhaseReview(receipt.phaseReview, provenance.taskId)
      : receipt.phaseReview !== null
  ) {
    return false;
  }
  const canonicalExplicitDecision =
    provenance.taskId === 'task_recycling_p0_v1' &&
    provenance.taskVersion === 1 &&
    provenance.profileId === 'child_salem' &&
    provenance.landscapeId === 'mangrove' &&
    provenance.recurrence === 'once' &&
    provenance.projection.categoryId === 'green_impact' &&
    provenance.projection.recognitionMode === 'standard' &&
    provenance.projection.routinePhase === 'acquisition' &&
    provenance.projection.visibilityScope === 'household' &&
    provenance.projection.circleEligible === true &&
    provenance.projection.consequenceKind === 'rewarded_acquisition' &&
    receipt.seedTransaction?.amount === 12;
  return (
    provenance.familyRewardEligible === canonicalExplicitDecision &&
    provenance.challengeLeafEligible === canonicalExplicitDecision
  );
}

function recognitionProvenanceMatchesJourney(
  receipt: RecognitionReceipt,
  journey: TaskJourney,
): boolean {
  const submission = journey.submission;
  const provenance = receipt.provenance;
  return (
    submission !== null &&
    provenance.taskId === journey.task.id &&
    provenance.taskVersion === journey.task.version &&
    provenance.submissionId === submission.id &&
    provenance.profileId === journey.task.targetChildId &&
    provenance.landscapeId === journey.task.content.landscapeId &&
    provenance.completionMode === submission.completionMode &&
    provenance.recurrence === journey.task.content.recurrence &&
    provenance.projection.categoryId === journey.task.content.categoryId &&
    provenance.projection.recognitionMode === journey.task.content.recognitionMode &&
    provenance.projection.visibilityScope === journey.task.content.visibilityScope &&
    provenance.projection.circleEligible === journey.task.content.circleEligible
  );
}

function hasCanonicalRecognitionAggregateAuthority(session: PrototypeSession): boolean {
  try {
    if (
      !isPlainRecord(session.recognitionLedger) ||
      !hasOnlyPlainDataProperties(session.recognitionLedger) ||
      !isPlainRecord(session.children) ||
      !hasExactKeys(session.children, PROFILE_IDS) ||
      !isPlainRecord(session.landscapeProgress) ||
      !hasExactKeys(session.landscapeProgress, LANDSCAPE_IDS) ||
      !isPlainRecord(session.household) ||
      !isPlainRecord(session.household.combinedCanopy) ||
      !isPlainRecord(session.circleGoal) ||
      !isPlainRecord(session.celebration)
    ) {
      return false;
    }

    const seedEvidence: SeedReceiptEvidence[] = [];
    let canopyContributions = 0;
    let circleEvents = 0;
    for (const [recognitionKey, candidate] of Object.entries(session.recognitionLedger)) {
      if (
        !isPlainRecord(candidate) ||
        !hasExactKeys(candidate, [
          'recognitionKey',
          'checkInId',
          'provenance',
          'seedTransaction',
          'landscapeGrowth',
          'canopyContribution',
          'circleEvent',
          'phaseReview',
        ]) ||
        candidate.recognitionKey !== recognitionKey ||
        typeof candidate.checkInId !== 'string' ||
        candidate.checkInId.trim().length === 0
      ) {
        return false;
      }
      const receipt = candidate as unknown as RecognitionReceipt;
      if (!hasCanonicalRecognitionProvenance(receipt, recognitionKey)) return false;
      if (receipt.seedTransaction === null) {
        if (
          receipt.landscapeGrowth !== null ||
          receipt.canopyContribution !== null ||
          receipt.phaseReview !== null
        ) {
          return false;
        }
      } else {
        if (
          !isCanonicalSeedTransaction(receipt.seedTransaction, recognitionKey) ||
          !isPlainRecord(receipt.landscapeGrowth)
        ) {
          return false;
        }
        seedEvidence.push({
          transaction: receipt.seedTransaction,
          growth: receipt.landscapeGrowth,
        });
      }
      if (receipt.canopyContribution !== null) {
        if (
          !sameValue(receipt.canopyContribution, {
            actionKind: 'eligible_household_acquisition',
            leafDelta: 1,
            origin: 'synthetic',
          })
        ) {
          return false;
        }
        canopyContributions += 1;
      }
      if (receipt.circleEvent !== null) {
        if (
          !sameValue(receipt.circleEvent, {
            actionKind: 'eligible_green_action',
            actionDelta: 1,
            sourceScope: 'household',
            origin: 'synthetic_local',
          })
        ) {
          return false;
        }
        circleEvents += 1;
      }
    }

    const routineProvenanceByTask = new Map<string, RecognitionReceipt['provenance'][]>();
    for (const receipt of Object.values(session.recognitionLedger)) {
      if (
        receipt.provenance.projection.recognitionMode !== 'fade_first' ||
        receipt.provenance.recurrence !== 'recurrent'
      ) {
        continue;
      }
      const existing = routineProvenanceByTask.get(receipt.provenance.taskId) ?? [];
      existing.push(receipt.provenance);
      routineProvenanceByTask.set(receipt.provenance.taskId, existing);
    }
    for (const [taskId, provenances] of routineProvenanceByTask) {
      const progress = session.routineProgressByTask?.[taskId];
      if (!progress) return false;
      const acquisitionTransitions = provenances
        .filter((provenance) => provenance.projection.routinePhase === 'acquisition')
        .sort(
          (left, right) => left.routineCompletionCountBefore - right.routineCompletionCountBefore,
        );
      if (
        acquisitionTransitions.some(
          (provenance, index) =>
            index > 0 &&
            provenance.routineCompletionCountBefore !==
              acquisitionTransitions[index - 1]!.routineCompletionCountAfter,
        ) ||
        progress.confirmedAcquisitionCount !==
          Math.max(...provenances.map((value) => value.routineCompletionCountAfter))
      ) {
        return false;
      }
    }

    for (const profileId of PROFILE_IDS) {
      let balance = SYNTHETIC_CHILDREN[profileId].earnedSeeds;
      const pending = seedEvidence.filter(({ transaction }) => transaction.childId === profileId);
      while (pending.length > 0) {
        const candidates = pending.filter(
          ({ transaction }) => transaction.balanceBefore === balance,
        );
        if (candidates.length !== 1) return false;
        const next = candidates[0]!;
        balance = next.transaction.balanceAfter;
        pending.splice(pending.indexOf(next), 1);
      }
      if (session.children[profileId].earnedSeeds !== balance) return false;
    }

    for (const landscapeId of LANDSCAPE_IDS) {
      let progress: PrototypeSession['landscapeProgress'][typeof landscapeId] = {
        landscapeId,
        cumulativeSeeds: OPENING_LANDSCAPE_SEEDS[landscapeId],
        stage: stageForSeeds(OPENING_LANDSCAPE_SEEDS[landscapeId]),
        nextThreshold: nextThresholdForSeeds(OPENING_LANDSCAPE_SEEDS[landscapeId]),
      };
      const pending = seedEvidence.filter(({ growth }) => growth.landscapeId === landscapeId);
      while (pending.length > 0) {
        const candidates = pending.filter(
          ({ growth }) => growth.seedsBefore === progress.cumulativeSeeds,
        );
        if (candidates.length !== 1) return false;
        const next = candidates[0]!;
        const planned = planLandscapeGrowth({
          landscape: progress,
          seedAmount: next.transaction.amount,
        });
        if (!planned.ok || !sameValue(planned.data, next.growth)) return false;
        progress = {
          landscapeId,
          cumulativeSeeds: planned.data.seedsAfter,
          stage: planned.data.stageAfter,
          nextThreshold: nextThresholdForSeeds(planned.data.seedsAfter),
        };
        pending.splice(pending.indexOf(next), 1);
      }
      if (!sameValue(session.landscapeProgress[landscapeId], progress)) return false;
    }

    return (
      session.household.combinedCanopy.contributionLeaves ===
        SYNTHETIC_HOUSEHOLD.combinedCanopy.contributionLeaves + canopyContributions &&
      session.household.combinedCanopy.goalLeaves ===
        SYNTHETIC_HOUSEHOLD.combinedCanopy.goalLeaves &&
      session.circleGoal.eligibleGreenActions === 11 + circleEvents &&
      session.circleGoal.goal === 12 &&
      session.circleGoal.origin === 'synthetic_local'
    );
  } catch {
    return false;
  }
}

function isCanonicalPhaseReview(value: unknown, taskId: string): boolean {
  return (
    isPlainRecord(value) &&
    hasExactKeys(value, [
      'taskId',
      'confirmedAcquisitionCount',
      'options',
      'selected',
      'appliesTo',
      'reversibleByParent',
    ]) &&
    value.taskId === taskId &&
    value.confirmedAcquisitionCount === 3 &&
    Array.isArray(value.options) &&
    hasDenseArrayShape(value.options) &&
    sameValue(value.options, ['keep_acquisition', 'move_future_to_maintenance']) &&
    value.selected === null &&
    value.appliesTo === 'future_completions_only' &&
    value.reversibleByParent === true
  );
}

function isCanonicalRoutineDecision(value: unknown): boolean {
  if (
    !isPlainRecord(value) ||
    !hasExactKeys(value, [
      'selected',
      'futurePhase',
      'appliesTo',
      'reversibleByParent',
      'decidedAt',
    ]) ||
    (value.selected !== 'keep_acquisition' && value.selected !== 'move_future_to_maintenance') ||
    value.appliesTo !== 'future_completions_only' ||
    value.reversibleByParent !== true ||
    !isExactIsoTimestamp(value.decidedAt)
  ) {
    return false;
  }
  return (
    value.futurePhase === (value.selected === 'keep_acquisition' ? 'acquisition' : 'maintenance')
  );
}

export function hasValidRoutineProgressAuthority(
  value: unknown,
  activeJourney: TaskJourney | null,
): boolean {
  if (value === undefined) return true;
  if (!isPlainRecord(value) || !hasOnlyPlainDataProperties(value)) return false;
  return Reflect.ownKeys(value).every((key) => {
    if (typeof key !== 'string') return false;
    const progress = value[key];
    if (
      !isPlainRecord(progress) ||
      !hasExactKeys(progress, [
        'taskId',
        'confirmedAcquisitionCount',
        'futurePhase',
        'phaseReview',
        'decision',
      ]) ||
      progress.taskId !== key ||
      !Number.isSafeInteger(progress.confirmedAcquisitionCount) ||
      (progress.confirmedAcquisitionCount as number) < 0 ||
      (progress.futurePhase !== 'acquisition' && progress.futurePhase !== 'maintenance')
    ) {
      return false;
    }
    const count = progress.confirmedAcquisitionCount as number;
    const phaseReview = progress.phaseReview;
    const decision = progress.decision;
    const activeTask = activeJourney?.task.id === key ? activeJourney.task : null;
    if (
      activeTask &&
      (activeTask.content.recognitionMode !== 'fade_first' ||
        activeTask.content.recurrence !== 'recurrent')
    ) {
      return false;
    }
    if (count === 0) {
      return (
        progress.futurePhase === 'maintenance' &&
        phaseReview === null &&
        decision === null &&
        (activeTask === null || activeTask.content.routinePhase === 'maintenance')
      );
    }
    if (count < 3) {
      return progress.futurePhase === 'acquisition' && phaseReview === null && decision === null;
    }
    if (!isCanonicalPhaseReview(phaseReview, key)) return false;
    if (decision === null) return progress.futurePhase === 'acquisition';
    return (
      isPlainRecord(decision) &&
      isCanonicalRoutineDecision(decision) &&
      decision.futurePhase === progress.futurePhase
    );
  });
}

function zeroSeedDuplicateMatchesPolicy(
  session: PrototypeSession,
  journey: TaskJourney,
  receipt: RecognitionReceipt,
): boolean {
  if (
    !isPlainRecord(receipt) ||
    !hasExactKeys(receipt, [
      'recognitionKey',
      'checkInId',
      'provenance',
      'seedTransaction',
      'landscapeGrowth',
      'canopyContribution',
      'circleEvent',
      'phaseReview',
    ])
  ) {
    return false;
  }
  if (receipt.seedTransaction !== null) return true;
  const submission = journey.submission;
  if (!submission) return false;
  const task = journey.task;
  const progress = session.routineProgressByTask?.[task.id] ?? null;
  const recurringFadeFirst =
    task.content.recognitionMode === 'fade_first' && task.content.recurrence === 'recurrent';
  const effectiveRoutinePhase =
    task.content.recognitionMode === 'recognition_only'
      ? 'not_applicable'
      : task.content.routinePhase === 'maintenance'
        ? 'maintenance'
        : recurringFadeFirst &&
            progress !== null &&
            progress.confirmedAcquisitionCount >= 3 &&
            isCanonicalPhaseReview(progress.phaseReview, task.id)
          ? 'maintenance'
          : task.content.routinePhase;
  const policy = evaluateRecognitionPolicy({
    submissionId: submission.id,
    recognitionMode: task.content.recognitionMode,
    routinePhase: effectiveRoutinePhase,
    recurrence: task.content.recurrence,
    displayedSeedAward:
      effectiveRoutinePhase === 'maintenance' ? null : task.content.displayedSeedAward,
    completionMode: submission.completionMode,
    confirmedAcquisitionCount: progress?.confirmedAcquisitionCount ?? 0,
    existingReceipt: null,
  });
  if (!policy.ok || policy.data.disposition !== 'new' || policy.data.seedAmount !== null) {
    return false;
  }
  const sharedProjection = planAfterConfirmation({
    schemaVersion: '1.0',
    categoryId: task.content.categoryId,
    recognitionMode: task.content.recognitionMode,
    routinePhase: effectiveRoutinePhase,
    visibilityScope: task.content.visibilityScope,
    circleEligible: task.content.circleEligible,
    consequenceKind: policy.data.consequenceKind,
    confirmed: true,
    prohibitedSharedFieldsPresent: false,
  });
  return (
    sharedProjection.ok &&
    receipt.landscapeGrowth === null &&
    sameValue(receipt.canopyContribution, sharedProjection.data.canopyContribution) &&
    sameValue(receipt.circleEvent, sharedProjection.data.circleEvent) &&
    sameValue(
      receipt.phaseReview,
      policy.data.phaseReview ? { taskId: task.id, ...policy.data.phaseReview } : null,
    )
  );
}

const DOMAIN_ERROR_CODES: ReadonlySet<DomainErrorCode> = new Set([
  'INVALID_INPUT',
  'NOT_FOUND',
  'INVALID_TRANSITION',
  'NOT_ASSIGNED_CHILD',
  'SAFETY_REJECTED',
  'PRIVACY_REJECTED',
  'INVALID_REWARD_PAIRING',
  'PREPARED_FIXTURE_UNAVAILABLE',
  'REMOTE_UNAVAILABLE',
  'TIMEOUT',
  'INVALID_RESPONSE',
]);

const ALREADY_CONFIRMED_MESSAGE = Object.freeze({
  ar: 'تم تأكيد هذه المهمة مسبقاً.',
  en: 'This task was already confirmed.',
});

function isExactLocalizedText(value: unknown, expected: typeof ALREADY_CONFIRMED_MESSAGE): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    isPlainRecord(value) &&
    hasExactKeys(value, ['ar', 'en']) &&
    value.ar === expected.ar &&
    value.en === expected.en
  );
}

export function validateRecognitionProviderResult(
  value: unknown,
): DomainResult<ServiceResult<RecognitionAttemptResult>> {
  const isolated = cloneRecognitionBoundaryInput(value);
  if (!isolated.ok) return isolated;
  const candidate = isolated.data;
  if (typeof candidate !== 'object' || candidate === null || !isPlainRecord(candidate)) {
    return failure('Recognition provider result is not an object envelope');
  }
  if (candidate.ok === false) {
    const error = candidate.error;
    if (
      !hasExactKeys(candidate, ['ok', 'error']) ||
      typeof error !== 'object' ||
      error === null ||
      !isPlainRecord(error) ||
      !hasExactKeys(error, ['code', 'message', 'retryable', 'fallbackAvailable']) ||
      typeof error.code !== 'string' ||
      !DOMAIN_ERROR_CODES.has(error.code as DomainErrorCode) ||
      typeof error.message !== 'string' ||
      error.message.trim().length === 0 ||
      typeof error.retryable !== 'boolean' ||
      typeof error.fallbackAvailable !== 'boolean'
    ) {
      return failure('Recognition provider failure envelope is malformed');
    }
    return { ok: true, data: candidate as unknown as ServiceResult<RecognitionAttemptResult> };
  }
  const data = candidate.data;
  const meta = candidate.meta;
  if (
    candidate.ok !== true ||
    !hasExactKeys(candidate, ['ok', 'data', 'meta']) ||
    typeof data !== 'object' ||
    data === null ||
    !isPlainRecord(data) ||
    !hasExactKeys(data, ['disposition', 'session', 'journey', 'receipt', 'message']) ||
    (data.disposition !== 'applied' && data.disposition !== 'already_confirmed') ||
    typeof data.session !== 'object' ||
    data.session === null ||
    !isPlainRecord(data.session) ||
    typeof data.journey !== 'object' ||
    data.journey === null ||
    !isPlainRecord(data.journey) ||
    typeof data.receipt !== 'object' ||
    data.receipt === null ||
    !isPlainRecord(data.receipt) ||
    (data.disposition === 'applied'
      ? data.message !== null
      : !isExactLocalizedText(data.message, ALREADY_CONFIRMED_MESSAGE)) ||
    typeof meta !== 'object' ||
    meta === null ||
    !isPlainRecord(meta) ||
    !hasExactKeys(meta, ['origin', 'fallbackUsed']) ||
    meta.origin !== 'synthetic' ||
    meta.fallbackUsed !== false
  ) {
    return failure('Recognition provider success envelope is malformed');
  }
  return { ok: true, data: candidate as unknown as ServiceResult<RecognitionAttemptResult> };
}

function validateRecognitionRequestIsolated(input: {
  readonly session: PrototypeSession;
  readonly plan: PraisePresentedPlan;
  readonly action: RecognitionContinuationAction;
}): DomainResult<PraisePresentedPlan> {
  const { session, plan, action } = input;
  const currentJourney = session.journey;
  const { assignment, submission, checkIn, task } = plan.journey;
  if (
    !hasValidRoutineProgressAuthority(session.routineProgressByTask, currentJourney) ||
    session.role !== 'parent' ||
    !currentJourney ||
    !assignment ||
    !submission ||
    !checkIn ||
    !hasExactRecognitionTimeline(plan.journey) ||
    plan.renderState !== 'praise_presented' ||
    plan.journey.lifecycle !== 'confirmed' ||
    checkIn.decision !== 'confirm' ||
    checkIn.confirmationPresentation !== 'praise_presented' ||
    checkIn.praisePresentedAt === null ||
    !isExactIsoTimestamp(checkIn.praisePresentedAt) ||
    checkIn.recognitionKey !== plan.recognitionKey ||
    plan.recognitionKey !== `recognition:${submission.id}` ||
    plan.presentationActionId.trim().length === 0 ||
    plan.continuation.action !== 'apply_recognition' ||
    plan.continuation.source !== 'visible_parent_control' ||
    assignment.taskId !== task.id ||
    assignment.taskVersion !== task.version ||
    assignment.childId !== task.targetChildId ||
    submission.assignmentId !== assignment.id ||
    submission.taskVersion !== task.version ||
    checkIn.submissionId !== submission.id ||
    session.activeAssignmentId !== assignment.id ||
    session.activeChildId !== task.targetChildId ||
    action.source !== 'parent_press' ||
    action.observedRenderState !== 'praise_presented' ||
    action.presentationActionId !== plan.presentationActionId ||
    action.actionId.trim().length === 0 ||
    action.actionId === plan.presentationActionId ||
    !sameValue(plan.checkIn, checkIn) ||
    !sameValue(plan.praise, checkIn.praise)
  ) {
    return requestFailure(
      'Recognition request does not prove the distinct Parent continuation action',
    );
  }

  const comparableCurrentJourney: TaskJourney =
    currentJourney.lifecycle === 'recognized' && currentJourney.checkIn
      ? {
          ...currentJourney,
          lifecycle: 'confirmed',
          checkIn: {
            ...currentJourney.checkIn,
            confirmationPresentation: 'praise_presented',
          },
        }
      : currentJourney;
  const expectedPlan: PraisePresentedPlan = {
    journey: plan.journey,
    checkIn: plan.checkIn,
    recognitionKey: plan.recognitionKey,
    praise: plan.praise,
    renderState: 'praise_presented',
    presentationActionId: plan.presentationActionId,
    continuation: { action: 'apply_recognition', source: 'visible_parent_control' },
  };
  const expectedAction: RecognitionContinuationAction = {
    actionId: action.actionId,
    source: 'parent_press',
    observedRenderState: 'praise_presented',
    presentationActionId: plan.presentationActionId,
  };
  const activeReceipt = session.recognitionLedger[plan.recognitionKey];
  const authorityMatchesLifecycle =
    (currentJourney.lifecycle === 'confirmed' && activeReceipt === undefined) ||
    (currentJourney.lifecycle === 'recognized' && activeReceipt !== undefined);
  return authorityMatchesLifecycle &&
    sameValue(plan, expectedPlan) &&
    sameValue(action, expectedAction) &&
    sameValue(plan.journey, comparableCurrentJourney)
    ? { ok: true, data: plan }
    : requestFailure('Recognition request no longer matches the active approval authority');
}

export function validateRecognitionRequest(input: {
  readonly session: PrototypeSession;
  readonly plan: PraisePresentedPlan;
  readonly action: RecognitionContinuationAction;
}): DomainResult<PraisePresentedPlan> {
  const isolated = cloneRecognitionBoundaryInput(input);
  if (!isolated.ok) {
    return requestFailure('Recognition request is not isolated plain data');
  }
  try {
    if (
      !isPlainRecord(isolated.data) ||
      !hasExactKeys(isolated.data, ['session', 'plan', 'action']) ||
      !isPlainRecord(isolated.data.session) ||
      !isPlainRecord(isolated.data.plan) ||
      !isPlainRecord(isolated.data.action)
    ) {
      return requestFailure('Recognition request has an invalid boundary shape');
    }
    return validateRecognitionRequestIsolated(isolated.data);
  } catch {
    return requestFailure('Recognition request has malformed approval authority');
  }
}

type ConfirmationRequest = Parameters<RecognitionService['planConfirmation']>[1];

function isBilingualText(value: unknown): value is { readonly ar: string; readonly en: string } {
  return (
    isPlainRecord(value) &&
    hasExactKeys(value, ['ar', 'en']) &&
    typeof value.ar === 'string' &&
    value.ar.trim().length > 0 &&
    typeof value.en === 'string' &&
    value.en.trim().length > 0
  );
}

function hasActiveSubmissionAuthority(session: PrototypeSession, submissionId: string): boolean {
  const journey = session.journey;
  const assignment = journey?.assignment;
  const submission = journey?.submission;
  if (!journey || !assignment || !submission) return false;
  return (
    submission.id === submissionId &&
    session.activeAssignmentId === assignment.id &&
    session.activeChildId === assignment.childId &&
    assignment.taskId === journey.task.id &&
    assignment.taskVersion === journey.task.version &&
    assignment.childId === journey.task.targetChildId &&
    submission.assignmentId === assignment.id &&
    submission.taskVersion === journey.task.version &&
    hasExactTaskJourneyTimeline(journey) &&
    hasValidRoutineProgressAuthority(session.routineProgressByTask, journey) &&
    hasCanonicalRecognitionAggregateAuthority(session)
  );
}

export function validateConfirmationPlanningRequest(input: {
  readonly session: PrototypeSession;
  readonly request: ConfirmationRequest;
}): DomainResult<true> {
  const isolated = cloneRecognitionBoundaryInput(input);
  if (!isolated.ok) return requestFailure('Confirmation request is not isolated plain data');
  try {
    if (
      !isPlainRecord(isolated.data) ||
      !hasExactKeys(isolated.data, ['session', 'request']) ||
      !isPlainRecord(isolated.data.request) ||
      !hasExactKeys(isolated.data.request, [
        'submissionId',
        'praise',
        'neutralObservation',
        'uncertainty',
      ]) ||
      typeof isolated.data.request.submissionId !== 'string'
    ) {
      return requestFailure('Confirmation request has an invalid boundary shape');
    }
    const { session, request } = isolated.data;
    if (!hasActiveSubmissionAuthority(session, request.submissionId)) {
      return requestFailure('Confirmation request does not match the active submission authority');
    }
    const journey = session.journey!;
    const submission = journey.submission!;
    const checkIn = journey.checkIn;
    const recognitionKey = `recognition:${submission.id}`;
    const storedReceipt = session.recognitionLedger[recognitionKey];
    if (storedReceipt !== undefined) {
      return journey.lifecycle === 'recognized' &&
        checkIn?.decision === 'confirm' &&
        checkIn.recognitionKey === recognitionKey &&
        storedReceipt.checkInId === checkIn.id &&
        sameValue(request.praise, checkIn.praise) &&
        sameValue(request.neutralObservation, checkIn.neutralObservation) &&
        sameValue(request.uncertainty, checkIn.uncertainty)
        ? { ok: true, data: true }
        : requestFailure('Stored recognition does not match the confirmation request');
    }
    if (journey.lifecycle === 'confirmed') {
      return checkIn?.decision === 'confirm' &&
        checkIn.praise !== null &&
        isDescriptiveTaskPraise(checkIn.praise) &&
        checkIn.recognitionKey === recognitionKey &&
        (checkIn.confirmationPresentation === 'editing_praise' ||
          checkIn.confirmationPresentation === 'praise_presented') &&
        sameValue(request.praise, checkIn.praise) &&
        sameValue(request.neutralObservation, checkIn.neutralObservation) &&
        sameValue(request.uncertainty, checkIn.uncertainty)
        ? { ok: true, data: true }
        : requestFailure('Existing confirmation no longer matches its request');
    }
    return journey.lifecycle === 'submitted' &&
      checkIn === null &&
      isBilingualText(request.praise) &&
      isDescriptiveTaskPraise(request.praise) &&
      (request.neutralObservation === null || isBilingualText(request.neutralObservation)) &&
      (request.uncertainty === null || isBilingualText(request.uncertainty))
      ? { ok: true, data: true }
      : inputFailure('New confirmation input is malformed');
  } catch {
    return requestFailure('Confirmation request contains malformed authority data');
  }
}

export function validateCheckInRouteRequest(input: {
  readonly session: PrototypeSession;
  readonly submissionId: string;
}): DomainResult<true> {
  const isolated = cloneRecognitionBoundaryInput(input);
  if (!isolated.ok) return requestFailure('Check-in request is not isolated plain data');
  try {
    if (
      !isPlainRecord(isolated.data) ||
      !hasExactKeys(isolated.data, ['session', 'submissionId']) ||
      typeof isolated.data.submissionId !== 'string' ||
      isolated.data.submissionId.trim().length === 0 ||
      !hasActiveSubmissionAuthority(isolated.data.session, isolated.data.submissionId)
    ) {
      return requestFailure('Check-in request does not match the active submission authority');
    }
    const journey = isolated.data.session.journey!;
    const checkIn = journey.checkIn;
    const resumable =
      (journey.lifecycle === 'submitted' && checkIn === null) ||
      (journey.lifecycle === 'retry' && checkIn?.decision === 'kind_retry') ||
      ((journey.lifecycle === 'confirmed' || journey.lifecycle === 'recognized') &&
        checkIn?.decision === 'confirm' &&
        checkIn.praise !== null &&
        isDescriptiveTaskPraise(checkIn.praise));
    return resumable
      ? { ok: true, data: true }
      : requestFailure('Check-in request is not safely resumable');
  } catch {
    return requestFailure('Check-in request contains malformed authority data');
  }
}

export function validatePraisePresentationRequest(input: {
  readonly pendingPlan: PendingConfirmationPlan;
  readonly action: PraisePresentationAction;
}): DomainResult<true> {
  const isolated = cloneRecognitionBoundaryInput(input);
  if (!isolated.ok) return requestFailure('Praise presentation request is not plain data');
  try {
    if (
      !isPlainRecord(isolated.data) ||
      !hasExactKeys(isolated.data, ['pendingPlan', 'action']) ||
      !isPlainRecord(isolated.data.pendingPlan) ||
      !hasExactKeys(isolated.data.pendingPlan, [
        'journey',
        'checkIn',
        'recognitionKey',
        'praise',
        'renderState',
      ]) ||
      !isPlainRecord(isolated.data.action) ||
      !hasExactKeys(isolated.data.action, ['actionId', 'source', 'presentedAt'])
    ) {
      return requestFailure('Praise presentation request has an invalid boundary shape');
    }
    const { pendingPlan, action } = isolated.data;
    const assignment = pendingPlan.journey.assignment;
    const submission = pendingPlan.journey.submission;
    const checkIn = pendingPlan.journey.checkIn;
    const valid =
      pendingPlan.renderState === 'confirmation_pending' &&
      pendingPlan.journey.lifecycle === 'confirmed' &&
      assignment !== null &&
      submission !== null &&
      checkIn !== null &&
      checkIn.confirmationPresentation === 'editing_praise' &&
      checkIn.praisePresentedAt === null &&
      typeof action.actionId === 'string' &&
      action.actionId.trim().length > 0 &&
      action.source === 'parent_press' &&
      isExactIsoTimestamp(action.presentedAt) &&
      isExactIsoTimestamp(assignment.createdAt) &&
      isExactIsoTimestamp(submission.submittedAt) &&
      isExactIsoTimestamp(checkIn.createdAt) &&
      Date.parse(assignment.createdAt) <= Date.parse(submission.submittedAt) &&
      Date.parse(submission.submittedAt) <= Date.parse(checkIn.createdAt) &&
      Date.parse(checkIn.createdAt) <= Date.parse(action.presentedAt) &&
      checkIn.praise !== null &&
      isDescriptiveTaskPraise(checkIn.praise) &&
      sameValue(pendingPlan.checkIn, checkIn) &&
      sameValue(pendingPlan.praise, checkIn.praise) &&
      pendingPlan.recognitionKey === checkIn.recognitionKey;
    return valid
      ? { ok: true, data: true }
      : requestFailure('Praise presentation request does not match pending approval authority');
  } catch {
    return requestFailure('Praise presentation request contains malformed authority data');
  }
}

export function validateActivePraisePresentationRequest(input: {
  readonly session: PrototypeSession;
  readonly pendingPlan: PendingConfirmationPlan;
  readonly action: PraisePresentationAction;
}): DomainResult<true> {
  const isolated = cloneRecognitionBoundaryInput(input);
  if (!isolated.ok) return requestFailure('Active praise authority is not isolated plain data');
  try {
    if (
      !isPlainRecord(isolated.data) ||
      !hasExactKeys(isolated.data, ['session', 'pendingPlan', 'action'])
    ) {
      return requestFailure('Active praise authority has an invalid boundary shape');
    }
    const { session, pendingPlan } = isolated.data;
    const request = validatePraisePresentationRequest({
      pendingPlan,
      action: isolated.data.action,
    });
    if (!request.ok) return request;
    const assignment = pendingPlan.journey.assignment;
    return assignment !== null &&
      session.activeAssignmentId === assignment.id &&
      session.activeChildId === assignment.childId &&
      sameValue(session.journey, pendingPlan.journey) &&
      hasValidRoutineProgressAuthority(session.routineProgressByTask, session.journey) &&
      hasCanonicalRecognitionAggregateAuthority(session)
      ? { ok: true, data: true }
      : requestFailure('Praise plan is stale for the active Parent task authority');
  } catch {
    return requestFailure('Active praise authority contains malformed data');
  }
}

export function validateConfirmationPlanningTransition(input: {
  readonly session: PrototypeSession;
  readonly request: ConfirmationRequest;
  readonly attempt: ConfirmationAttempt;
}): DomainResult<ConfirmationAttempt> {
  const isolated = cloneRecognitionBoundaryInput(input);
  if (!isolated.ok) return failure('Confirmation plan is not isolated plain data');
  try {
    if (
      !isPlainRecord(isolated.data) ||
      !hasExactKeys(isolated.data, ['session', 'request', 'attempt']) ||
      !isPlainRecord(isolated.data.request) ||
      !hasExactKeys(isolated.data.request, [
        'submissionId',
        'praise',
        'neutralObservation',
        'uncertainty',
      ])
    ) {
      return failure('Confirmation plan has an invalid boundary shape');
    }
    const { session, request, attempt } = isolated.data;
    const requestAuthority = validateConfirmationPlanningRequest({ session, request });
    if (!requestAuthority.ok) return failure(requestAuthority.error.message);
    const journey = session.journey;
    const assignment = journey?.assignment;
    const submission = journey?.submission;
    if (
      !journey ||
      !assignment ||
      !submission ||
      request.submissionId !== submission.id ||
      session.activeAssignmentId !== assignment.id ||
      session.activeChildId !== assignment.childId ||
      assignment.taskId !== journey.task.id ||
      assignment.taskVersion !== journey.task.version ||
      assignment.childId !== journey.task.targetChildId ||
      submission.assignmentId !== assignment.id ||
      submission.taskVersion !== journey.task.version ||
      !hasExactTaskJourneyTimeline(journey) ||
      !hasValidRoutineProgressAuthority(session.routineProgressByTask, journey) ||
      !hasCanonicalRecognitionAggregateAuthority(session)
    ) {
      return failure('Confirmation plan does not match the active submitted authority');
    }
    const recognitionKey = `recognition:${submission.id}`;
    const storedReceipt = session.recognitionLedger[recognitionKey];
    let expected: ConfirmationAttempt;
    if (storedReceipt !== undefined) {
      if (
        journey.lifecycle !== 'recognized' ||
        !journey.checkIn ||
        journey.checkIn.recognitionKey !== recognitionKey ||
        storedReceipt.checkInId !== journey.checkIn.id
      ) {
        return failure('Stored recognition does not match its active journey');
      }
      expected = {
        disposition: 'already_confirmed',
        journey,
        receipt: storedReceipt,
        message: ALREADY_CONFIRMED_MESSAGE,
      };
    } else if (journey.lifecycle === 'confirmed') {
      const checkIn = journey.checkIn;
      if (
        !checkIn ||
        checkIn.decision !== 'confirm' ||
        checkIn.praise === null ||
        !isDescriptiveTaskPraise(checkIn.praise) ||
        checkIn.recognitionKey !== recognitionKey ||
        (checkIn.confirmationPresentation !== 'editing_praise' &&
          checkIn.confirmationPresentation !== 'praise_presented')
      ) {
        return failure('Existing confirmation plan is malformed');
      }
      const pendingPlan: PendingConfirmationPlan = {
        journey,
        checkIn,
        recognitionKey,
        praise: checkIn.praise,
        renderState: 'confirmation_pending',
      };
      expected =
        checkIn.confirmationPresentation === 'praise_presented'
          ? {
              disposition: 'praise_presented',
              plan: {
                ...pendingPlan,
                checkIn: checkIn as PraisePresentedPlan['checkIn'],
                renderState: 'praise_presented',
                presentationActionId: `presentation:${checkIn.id}`,
                continuation: { action: 'apply_recognition', source: 'visible_parent_control' },
              },
            }
          : { disposition: 'pending_praise', plan: pendingPlan };
    } else if (journey.lifecycle === 'submitted') {
      if (
        journey.checkIn !== null ||
        !isBilingualText(request.praise) ||
        !isDescriptiveTaskPraise(request.praise) ||
        (request.neutralObservation !== null && !isBilingualText(request.neutralObservation)) ||
        (request.uncertainty !== null && !isBilingualText(request.uncertainty))
      ) {
        return failure('New confirmation input is malformed');
      }
      const checkIn = {
        id: `checkin_${submission.id}`,
        submissionId: submission.id,
        decision: 'confirm' as const,
        praise: request.praise,
        neutralObservation: request.neutralObservation,
        uncertainty: request.uncertainty,
        replacementTaskId: null,
        recognitionKey,
        confirmationPresentation: 'editing_praise' as const,
        praisePresentedAt: null,
        createdAt: '2026-08-26T09:38:00.000Z',
      };
      const confirmedJourney = { ...journey, lifecycle: 'confirmed' as const, checkIn };
      expected = {
        disposition: 'pending_praise',
        plan: {
          journey: confirmedJourney,
          checkIn,
          recognitionKey,
          praise: checkIn.praise,
          renderState: 'confirmation_pending',
        },
      };
    } else {
      return failure('Task lifecycle cannot produce a confirmation plan');
    }
    return sameValue(attempt, expected)
      ? { ok: true, data: attempt }
      : failure('Confirmation provider returned conflicting task authority');
  } catch {
    return failure('Confirmation plan contains malformed authority data');
  }
}

export function validateCheckInRouteTransition(input: {
  readonly session: PrototypeSession;
  readonly submissionId: string;
  readonly route: CheckInRouteState;
}): DomainResult<CheckInRouteState> {
  const isolated = cloneRecognitionBoundaryInput(input);
  if (!isolated.ok) return failure('Check-in route is not isolated plain data');
  try {
    if (
      !isPlainRecord(isolated.data) ||
      !hasExactKeys(isolated.data, ['session', 'submissionId', 'route']) ||
      typeof isolated.data.submissionId !== 'string' ||
      isolated.data.submissionId.trim().length === 0 ||
      !isPlainRecord(isolated.data.route)
    ) {
      return failure('Check-in route has an invalid boundary shape');
    }
    const { session, submissionId, route } = isolated.data;
    const requestAuthority = validateCheckInRouteRequest({ session, submissionId });
    if (!requestAuthority.ok) return failure(requestAuthority.error.message);
    const journey = session.journey;
    const assignment = journey?.assignment;
    const submission = journey?.submission;
    if (
      !journey ||
      !assignment ||
      !submission ||
      submission.id !== submissionId ||
      session.activeAssignmentId !== assignment.id ||
      session.activeChildId !== assignment.childId ||
      assignment.taskId !== journey.task.id ||
      assignment.taskVersion !== journey.task.version ||
      assignment.childId !== journey.task.targetChildId ||
      submission.assignmentId !== assignment.id ||
      submission.taskVersion !== journey.task.version ||
      !hasExactTaskJourneyTimeline(journey) ||
      !hasValidRoutineProgressAuthority(session.routineProgressByTask, journey) ||
      !hasCanonicalRecognitionAggregateAuthority(session)
    ) {
      return failure('Check-in route does not match the active submission authority');
    }

    let expected: CheckInRouteState;
    if (journey.lifecycle === 'submitted' && journey.checkIn === null) {
      expected = { state: 'submitted', journey, submission };
    } else if (journey.lifecycle === 'retry' && journey.checkIn?.decision === 'kind_retry') {
      expected = { state: 'retry', journey, submission };
    } else if (journey.lifecycle === 'confirmed' || journey.lifecycle === 'recognized') {
      const checkIn = journey.checkIn;
      if (
        !checkIn ||
        checkIn.decision !== 'confirm' ||
        checkIn.praise === null ||
        !('attempt' in route)
      ) {
        return failure('Check-in route has no resumable confirmation authority');
      }
      const transition = validateConfirmationPlanningTransition({
        session,
        request: {
          submissionId,
          praise: checkIn.praise,
          neutralObservation: checkIn.neutralObservation,
          uncertainty: checkIn.uncertainty,
        },
        attempt: route.attempt,
      });
      if (!transition.ok) return failure(transition.error.message);
      expected =
        transition.data.disposition === 'already_confirmed'
          ? { state: 'already_confirmed', journey, attempt: transition.data }
          : { state: 'confirmation_pending', journey, attempt: transition.data };
    } else {
      return failure('Check-in route is not safely resumable');
    }
    return sameValue(route, expected)
      ? { ok: true, data: route }
      : failure('Check-in provider returned conflicting task authority');
  } catch {
    return failure('Check-in route contains malformed authority data');
  }
}

export function validatePraisePresentationTransition(input: {
  readonly pendingPlan: PendingConfirmationPlan;
  readonly action: PraisePresentationAction;
  readonly presentedPlan: PraisePresentedPlan;
}): DomainResult<PraisePresentedPlan> {
  const isolated = cloneRecognitionBoundaryInput(input);
  if (!isolated.ok) return failure('Praise presentation result is not isolated plain data');
  try {
    if (
      !isPlainRecord(isolated.data) ||
      !hasExactKeys(isolated.data, ['pendingPlan', 'action', 'presentedPlan'])
    ) {
      return failure('Praise presentation result has an invalid boundary shape');
    }
    const { pendingPlan, action, presentedPlan } = isolated.data;
    const requestAuthority = validatePraisePresentationRequest({ pendingPlan, action });
    if (!requestAuthority.ok) return failure(requestAuthority.error.message);
    const assignment = pendingPlan.journey.assignment;
    const submission = pendingPlan.journey.submission;
    const pendingCheckIn = pendingPlan.journey.checkIn;
    if (
      pendingPlan.renderState !== 'confirmation_pending' ||
      pendingPlan.journey.lifecycle !== 'confirmed' ||
      !assignment ||
      !submission ||
      !pendingCheckIn ||
      pendingCheckIn.confirmationPresentation !== 'editing_praise' ||
      pendingCheckIn.praisePresentedAt !== null ||
      typeof action.actionId !== 'string' ||
      action.actionId.trim().length === 0 ||
      action.source !== 'parent_press' ||
      !isExactIsoTimestamp(action.presentedAt) ||
      !isExactIsoTimestamp(assignment.createdAt) ||
      !isExactIsoTimestamp(submission.submittedAt) ||
      !isExactIsoTimestamp(pendingCheckIn.createdAt) ||
      Date.parse(assignment.createdAt) > Date.parse(submission.submittedAt) ||
      Date.parse(submission.submittedAt) > Date.parse(pendingCheckIn.createdAt) ||
      Date.parse(pendingCheckIn.createdAt) > Date.parse(action.presentedAt) ||
      pendingCheckIn.praise === null ||
      !isDescriptiveTaskPraise(pendingCheckIn.praise) ||
      !sameValue(pendingPlan.journey.checkIn, pendingPlan.checkIn) ||
      !sameValue(pendingPlan.praise, pendingCheckIn.praise)
    ) {
      return failure('Praise presentation does not match its pending approval authority');
    }
    const checkIn = {
      ...pendingCheckIn,
      confirmationPresentation: 'praise_presented' as const,
      praisePresentedAt: action.presentedAt,
    };
    const journey = { ...pendingPlan.journey, checkIn };
    const expected: PraisePresentedPlan = {
      journey,
      checkIn,
      recognitionKey: pendingPlan.recognitionKey,
      praise: pendingPlan.praise,
      renderState: 'praise_presented',
      presentationActionId: action.actionId,
      continuation: { action: 'apply_recognition', source: 'visible_parent_control' },
    };
    return sameValue(presentedPlan, expected) && hasExactRecognitionTimeline(journey)
      ? { ok: true, data: presentedPlan }
      : failure('Praise presentation provider returned conflicting approval authority');
  } catch {
    return failure('Praise presentation result contains malformed authority data');
  }
}

function validateRecognitionSessionTransitionIsolated(input: {
  readonly before: PrototypeSession;
  readonly after: PrototypeSession;
  readonly disposition: 'applied' | 'already_confirmed';
  readonly journey: TaskJourney;
  readonly receipt: RecognitionReceipt;
}): DomainResult<PrototypeSession> {
  const { before, after, disposition, journey, receipt } = input;
  if (
    !hasValidRoutineProgressAuthority(before.routineProgressByTask, before.journey) ||
    !hasValidRoutineProgressAuthority(after.routineProgressByTask, after.journey) ||
    !hasCanonicalRecognitionAggregateAuthority(before) ||
    !hasCanonicalRecognitionAggregateAuthority(after)
  ) {
    return failure('Recognition session has invalid persisted reward authority');
  }
  if (disposition === 'already_confirmed') {
    const { task, assignment, submission, checkIn } = journey;
    const storedReceipt = before.recognitionLedger[receipt.recognitionKey];
    return journey.lifecycle === 'recognized' &&
      assignment !== null &&
      submission !== null &&
      checkIn !== null &&
      assignment.taskId === task.id &&
      assignment.taskVersion === task.version &&
      assignment.childId === task.targetChildId &&
      submission.assignmentId === assignment.id &&
      submission.taskVersion === task.version &&
      checkIn.submissionId === submission.id &&
      checkIn.decision === 'confirm' &&
      checkIn.confirmationPresentation === 'recognition_applied' &&
      checkIn.recognitionKey === receipt.recognitionKey &&
      hasExactRecognitionTimeline(journey) &&
      receipt.recognitionKey === `recognition:${submission.id}` &&
      recognitionProvenanceMatchesJourney(receipt, journey) &&
      receipt.checkInId === checkIn.id &&
      zeroSeedDuplicateMatchesPolicy(before, journey, receipt) &&
      storedReceipt !== undefined &&
      sameValue(receipt, storedReceipt) &&
      sameValue(journey, before.journey) &&
      sameValue(after, before)
      ? { ok: true, data: after }
      : failure('Duplicate recognition result does not match its committed session authority');
  }
  if (disposition !== 'applied') {
    return failure('Recognition result disposition is invalid');
  }
  const { task, assignment, submission, checkIn } = journey;
  if (
    journey.lifecycle !== 'recognized' ||
    !assignment ||
    !submission ||
    !checkIn ||
    !hasExactRecognitionTimeline(journey) ||
    checkIn.decision !== 'confirm' ||
    checkIn.confirmationPresentation !== 'recognition_applied' ||
    checkIn.praisePresentedAt === null ||
    checkIn.recognitionKey === null ||
    receipt.recognitionKey !== checkIn.recognitionKey ||
    receipt.recognitionKey !== `recognition:${submission.id}` ||
    receipt.checkInId !== checkIn.id ||
    assignment.taskId !== task.id ||
    assignment.taskVersion !== task.version ||
    assignment.childId !== task.targetChildId ||
    submission.assignmentId !== assignment.id ||
    submission.taskVersion !== task.version ||
    before.recognitionLedger[receipt.recognitionKey] !== undefined
  ) {
    return failure('Recognition session authority does not match its confirmed task chain');
  }

  const expectedBeforeJourney: TaskJourney = {
    ...journey,
    lifecycle: 'confirmed',
    checkIn: { ...checkIn, confirmationPresentation: 'praise_presented' },
  };
  if (!sameValue(before.journey, expectedBeforeJourney) || !sameValue(after.journey, journey)) {
    return failure('Recognition session changed outside its approved journey transition');
  }

  const existingRoutineProgress = before.routineProgressByTask?.[task.id] ?? null;
  const recurringFadeFirst =
    task.content.recognitionMode === 'fade_first' && task.content.recurrence === 'recurrent';
  const effectiveRoutinePhase = recurringFadeFirst
    ? (existingRoutineProgress?.futurePhase ?? task.content.routinePhase)
    : task.content.routinePhase;
  const confirmedAcquisitionCount =
    recurringFadeFirst && effectiveRoutinePhase === 'acquisition'
      ? (existingRoutineProgress?.confirmedAcquisitionCount ?? 0) + 1
      : (existingRoutineProgress?.confirmedAcquisitionCount ?? 0);
  const policy = evaluateRecognitionPolicy({
    submissionId: submission.id,
    recognitionMode: task.content.recognitionMode,
    routinePhase: effectiveRoutinePhase,
    recurrence: task.content.recurrence,
    displayedSeedAward:
      effectiveRoutinePhase === 'maintenance' ? null : task.content.displayedSeedAward,
    completionMode: submission.completionMode,
    confirmedAcquisitionCount,
    existingReceipt: null,
  });
  if (!policy.ok || policy.data.disposition !== 'new') {
    return failure('Recognition session could not reproduce its reward policy');
  }

  const projectionContext = {
    schemaVersion: '1.0',
    categoryId: task.content.categoryId,
    recognitionMode: task.content.recognitionMode,
    routinePhase: effectiveRoutinePhase,
    visibilityScope: task.content.visibilityScope,
    circleEligible: task.content.circleEligible,
    consequenceKind: policy.data.consequenceKind,
    confirmed: true,
    prohibitedSharedFieldsPresent: false,
  } as const;
  const projection = planAfterConfirmation(projectionContext);
  if (!projection.ok) {
    return failure('Recognition session could not reproduce its privacy projection');
  }

  const expectedPhaseReview = policy.data.phaseReview
    ? { taskId: task.id, ...policy.data.phaseReview }
    : null;
  const child = before.children[task.targetChildId];
  const landscape = before.landscapeProgress[task.content.landscapeId];
  let expectedSeedTransaction: RecognitionReceipt['seedTransaction'] = null;
  let expectedLandscapeGrowth: RecognitionReceipt['landscapeGrowth'] = null;
  let expectedChildren = before.children;
  let expectedLandscapeProgress = before.landscapeProgress;

  if (policy.data.seedAmount !== null) {
    const growth = planLandscapeGrowth({ landscape, seedAmount: policy.data.seedAmount });
    if (!growth.ok) {
      return failure('Recognition session could not reproduce its Garden growth');
    }
    expectedSeedTransaction = {
      id: `seed_transaction_${submission.id}`,
      recognitionKey: receipt.recognitionKey,
      childId: child.id,
      amount: policy.data.seedAmount,
      balanceBefore: child.earnedSeeds,
      balanceAfter: child.earnedSeeds + policy.data.seedAmount,
      meaning: 'symbolic_nonfinancial',
    };
    expectedLandscapeGrowth = growth.data;
    expectedChildren = {
      ...before.children,
      [child.id]: { ...child, earnedSeeds: expectedSeedTransaction.balanceAfter },
    };
    expectedLandscapeProgress = {
      ...before.landscapeProgress,
      [growth.data.landscapeId]: {
        landscapeId: growth.data.landscapeId,
        cumulativeSeeds: growth.data.seedsAfter,
        stage: growth.data.stageAfter,
        nextThreshold: nextThresholdForSeeds(growth.data.seedsAfter),
      },
    };
  }

  const expectedReceipt: RecognitionReceipt = {
    recognitionKey: receipt.recognitionKey,
    checkInId: checkIn.id,
    provenance: {
      schemaVersion: 'r003.recognition-provenance.v1',
      taskId: task.id,
      taskVersion: task.version,
      submissionId: submission.id,
      profileId: task.targetChildId,
      landscapeId: task.content.landscapeId,
      completionMode: submission.completionMode,
      projection: projectionContext,
      recurrence: task.content.recurrence,
      familyRewardEligible: receipt.provenance.familyRewardEligible,
      challengeLeafEligible: receipt.provenance.challengeLeafEligible,
      routineCompletionCountBefore: recurringFadeFirst
        ? (existingRoutineProgress?.confirmedAcquisitionCount ?? 0)
        : 0,
      routineCompletionCountAfter: recurringFadeFirst ? confirmedAcquisitionCount : 0,
    },
    seedTransaction: expectedSeedTransaction,
    landscapeGrowth: expectedLandscapeGrowth,
    canopyContribution: projection.data.canopyContribution,
    circleEvent: projection.data.circleEvent,
    phaseReview: expectedPhaseReview,
  };
  if (!sameValue(receipt, expectedReceipt)) {
    return failure('Recognition receipt does not match the reproduced session transition');
  }

  let expectedRoutineProgress = before.routineProgressByTask;
  if (recurringFadeFirst) {
    const nextRoutineProgress: RoutineProgressState = {
      taskId: task.id,
      confirmedAcquisitionCount,
      futurePhase:
        existingRoutineProgress?.futurePhase ??
        (effectiveRoutinePhase === 'maintenance' ? 'maintenance' : 'acquisition'),
      phaseReview: expectedPhaseReview ?? existingRoutineProgress?.phaseReview ?? null,
      decision: existingRoutineProgress?.decision ?? null,
    };
    expectedRoutineProgress = {
      ...(before.routineProgressByTask ?? {}),
      [task.id]: nextRoutineProgress,
    };
  }

  const expectedAfter: PrototypeSession = {
    ...before,
    household: projection.data.canopyContribution
      ? {
          ...before.household,
          combinedCanopy: applyCanopy(
            before.household.combinedCanopy,
            projection.data.canopyContribution,
          ),
        }
      : before.household,
    children: expectedChildren,
    journey,
    landscapeProgress: expectedLandscapeProgress,
    circleGoal: projection.data.circleEvent
      ? applyCircle(before.circleGoal, projection.data.circleEvent)
      : before.circleGoal,
    recognitionLedger: {
      ...before.recognitionLedger,
      [receipt.recognitionKey]: expectedReceipt,
    },
    routineProgressByTask: expectedRoutineProgress,
    celebration: { available: policy.data.seedAmount !== null, consumed: false },
  };
  return sameValue(after, expectedAfter)
    ? { ok: true, data: after }
    : failure('Recognition provider changed fields outside the approved session delta');
}

export function validateRecognitionSessionTransition(input: {
  readonly before: PrototypeSession;
  readonly after: PrototypeSession;
  readonly disposition: 'applied' | 'already_confirmed';
  readonly journey: TaskJourney;
  readonly receipt: RecognitionReceipt;
}): DomainResult<PrototypeSession> {
  const isolated = cloneRecognitionBoundaryInput(input);
  if (!isolated.ok) {
    return failure('Recognition session transition is not isolated plain data');
  }
  try {
    if (
      !isPlainRecord(isolated.data) ||
      !hasExactKeys(isolated.data, ['before', 'after', 'disposition', 'journey', 'receipt']) ||
      !isPlainRecord(isolated.data.before) ||
      !isPlainRecord(isolated.data.after) ||
      !isPlainRecord(isolated.data.journey) ||
      !isPlainRecord(isolated.data.receipt)
    ) {
      return failure('Recognition session transition has an invalid boundary shape');
    }
    return validateRecognitionSessionTransitionIsolated(isolated.data);
  } catch {
    return failure('Recognition session transition contains malformed authority data');
  }
}
