import type {
  PrototypeSession,
  RecognitionReceipt,
  SyntheticChildId,
} from '../../models/familyGrowth';
import type {
  AchievementEvaluationEvidence,
  AchievementState,
  BadgeId,
  LearningCompletionEvidence,
  SemanticCriterionEvidence,
} from '../../models/achievements';
import type { MangroveLearningState } from '../../models/learning';
import {
  SCHEMA3_R002A_FIXTURE_VERSION,
  type ProgressionErrorCode,
  type ProgressionResult,
  type SeedLedgerState,
  type WaterAndCoastPathProjection,
} from '../../models/growthJourney';
import { restoreMangroveLearningState } from '../learning/mangroveLearning';
import {
  auditSchema3SeedState,
  createEmptySeedLedger,
  normalizeSchema3SeedLedger,
  projectRecognitionSeedEntry,
  projectWaterAndCoastPath,
  selectLifetimeSeeds,
} from './seedLedger';
import {
  createEmptyAchievementState,
  evaluateBadgeAwards,
  recordParentApprovedAcquisition,
} from './achievements';

const PROFILE_IDS = ['child_salem', 'child_alya'] as const;
const SYNTHETIC_MIGRATION_TIME = '2026-09-05T08:00:00.000Z';
const VALID_FIXED_SEED_AWARDS = new Set<number>([4, 6, 8, 12, 15]);

export interface GrowthJourneyRuntimeState {
  readonly resetSequence: number;
  readonly ledgersByProfile: Readonly<Record<SyntheticChildId, SeedLedgerState>>;
  readonly achievementsByProfile: Readonly<Record<SyntheticChildId, AchievementState>>;
}

export interface GrowthJourneyProfileProjection {
  readonly profileId: SyntheticChildId;
  readonly profileEpochId: string;
  readonly lifetimeSeeds: number;
  readonly path: WaterAndCoastPathProjection;
  readonly ledger: SeedLedgerState;
  readonly achievements: AchievementState;
}

export interface GrowthJourneyRecognitionProjection {
  readonly disposition: 'projected' | 'already_projected' | 'not_applicable';
  readonly runtime: GrowthJourneyRuntimeState;
  readonly addedCreditIds: readonly string[];
  readonly newlyEarnedBadgeIds: readonly BadgeId[];
  readonly newlyReachedThresholds: readonly number[];
}

export interface GrowthJourneyLearningProjection {
  readonly disposition: 'evaluated' | 'already_evaluated';
  readonly runtime: GrowthJourneyRuntimeState;
  readonly newlyEarnedBadgeIds: readonly BadgeId[];
}

function failure<T>(
  message: string,
  code: ProgressionErrorCode = 'FIXTURE_EVIDENCE_MISMATCH',
): ProgressionResult<T> {
  return { ok: false, error: { code, message } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function epochId(profileId: SyntheticChildId, resetSequence: number): string {
  return `prototype-reset-${String(resetSequence).padStart(4, '0')}:${profileId}`;
}

function freezeRuntime(input: {
  readonly resetSequence: number;
  readonly ledgersByProfile: Record<SyntheticChildId, SeedLedgerState>;
  readonly achievementsByProfile: Record<SyntheticChildId, AchievementState>;
}): GrowthJourneyRuntimeState {
  return Object.freeze({
    resetSequence: input.resetSequence,
    ledgersByProfile: Object.freeze({ ...input.ledgersByProfile }),
    achievementsByProfile: Object.freeze({ ...input.achievementsByProfile }),
  });
}

function achievementEvidence(
  ledger: SeedLedgerState,
  learningCompletions: readonly LearningCompletionEvidence[] = Object.freeze([]),
  semanticCriterionEvidence: readonly SemanticCriterionEvidence[] = Object.freeze([]),
): ProgressionResult<AchievementEvaluationEvidence> {
  const lifetime = selectLifetimeSeeds(ledger, ledger.profileId, ledger.profileEpochId);
  if (!lifetime.ok) return lifetime;
  const path = projectWaterAndCoastPath(lifetime.data);
  if (!path.ok) return path;
  return {
    ok: true,
    data: Object.freeze({
      lifetimeSeeds: Object.freeze({
        profileId: ledger.profileId,
        profileEpochId: ledger.profileEpochId,
        source: 'committed_seed_ledger' as const,
        exact: true,
        amount: lifetime.data,
        entryIds: Object.freeze(ledger.entries.map((entry) => entry.id)),
      }),
      stationProjection: Object.freeze({
        profileId: ledger.profileId,
        profileEpochId: ledger.profileEpochId,
        source: 'canonical_impact_path_projection' as const,
        reachedThresholds: path.data.reachedThresholds,
      }),
      learningCompletions: Object.freeze([...learningCompletions]),
      semanticCriterionEvidence: Object.freeze([...semanticCriterionEvidence]),
    }),
  };
}

function createBackfilledAchievementState(
  ledger: SeedLedgerState,
): ProgressionResult<AchievementState> {
  const empty = createEmptyAchievementState({
    profileId: ledger.profileId,
    profileEpochId: ledger.profileEpochId,
  });
  if (!empty.ok) return failure(empty.error.message);
  const evidence = achievementEvidence(ledger);
  if (!evidence.ok) return evidence;
  const backfill = evaluateBadgeAwards({
    state: empty.data,
    evidence: evidence.data,
    mode: 'historical_seed_backfill',
    triggerEventId: `schema3-achievement-backfill:${ledger.profileId}:${ledger.profileEpochId}`,
  });
  return backfill.ok ? { ok: true, data: backfill.data.state } : failure(backfill.error.message);
}

function sameReceipt(left: RecognitionReceipt, right: RecognitionReceipt): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function isCanonicalMangroveArchiveTransition(receipt: RecognitionReceipt): boolean {
  const growth = receipt.landscapeGrowth;
  return (
    growth?.landscapeId === 'mangrove' &&
    growth.seedsBefore === 48 &&
    growth.seedsAfter === 60 &&
    growth.stageBefore === 'shoot' &&
    growth.stageAfter === 'sapling' &&
    growth.crossedThreshold === 60 &&
    growth.symbolicOnly === true
  );
}

export function createGrowthJourneyRuntime(
  session: PrototypeSession,
  resetSequence: number,
): ProgressionResult<GrowthJourneyRuntimeState> {
  if (
    !isRecord(session) ||
    !isRecord(session.children) ||
    !isRecord(session.landscapeProgress) ||
    !isRecord(session.landscapeProgress.mangrove) ||
    !isRecord(session.recognitionLedger) ||
    !Number.isSafeInteger(resetSequence) ||
    resetSequence < 0
  ) {
    return failure(
      'A complete Schema-3 reset session and valid reset sequence are required',
      'INVALID_INPUT',
    );
  }

  const ledgers = {} as Record<SyntheticChildId, SeedLedgerState>;
  const achievements = {} as Record<SyntheticChildId, AchievementState>;
  for (const profileId of PROFILE_IDS) {
    const child = session.children[profileId];
    if (!child) return failure(`Synthetic profile ${profileId} is missing`);

    const profileEpochId = epochId(profileId, resetSequence);
    const audit = auditSchema3SeedState({
      schemaVersion: session.schemaVersion,
      fixtureVersion: SCHEMA3_R002A_FIXTURE_VERSION,
      persistence: 'synthetic_in_memory',
      profileId,
      activeProfileId: profileId,
      profileEpochId,
      activeResetEpochId: profileEpochId,
      profileOrigin: child.origin,
      openingEarnedSeeds: child.earnedSeeds,
      recognitionLedgerEntryCount: Object.keys(session.recognitionLedger).length,
      mangroveProgress:
        profileId === 'child_salem'
          ? {
              landscapeId: 'mangrove',
              cumulativeSeeds: session.landscapeProgress.mangrove.cumulativeSeeds,
              stage: session.landscapeProgress.mangrove.stage,
              nextThreshold: session.landscapeProgress.mangrove.nextThreshold,
            }
          : null,
    });
    if (!audit.ok) return audit;

    const empty = createEmptySeedLedger({ profileId, profileEpochId });
    if (!empty.ok) return empty;
    const normalized = normalizeSchema3SeedLedger({
      audit: audit.data,
      ledger: empty.data,
      appliedAt: SYNTHETIC_MIGRATION_TIME,
    });
    if (!normalized.ok) return normalized;
    ledgers[profileId] = normalized.data.ledger;
    const achievementState = createBackfilledAchievementState(normalized.data.ledger);
    if (!achievementState.ok) return achievementState;
    achievements[profileId] = achievementState.data;
  }

  return {
    ok: true,
    data: freezeRuntime({
      resetSequence,
      ledgersByProfile: ledgers,
      achievementsByProfile: achievements,
    }),
  };
}

export function selectGrowthJourneyProfile(
  runtime: GrowthJourneyRuntimeState,
  profileId: SyntheticChildId,
): ProgressionResult<GrowthJourneyProfileProjection> {
  if (
    !isRecord(runtime) ||
    !Number.isSafeInteger(runtime.resetSequence) ||
    runtime.resetSequence < 0 ||
    !isRecord(runtime.ledgersByProfile) ||
    !isRecord(runtime.achievementsByProfile)
  ) {
    return failure('Growth Journey runtime state is incomplete', 'INVALID_INPUT');
  }
  const ledger = runtime.ledgersByProfile[profileId];
  const achievements = runtime.achievementsByProfile[profileId];
  if (!ledger || !achievements) {
    return { ok: false, error: { code: 'UNSUPPORTED_PROFILE', message: 'Profile is missing' } };
  }
  const lifetime = selectLifetimeSeeds(ledger, profileId, ledger.profileEpochId);
  if (!lifetime.ok) return lifetime;
  const path = projectWaterAndCoastPath(lifetime.data);
  if (!path.ok) return path;
  if (
    achievements.profileId !== profileId ||
    achievements.profileEpochId !== ledger.profileEpochId
  ) {
    return failure('Achievement state does not match the active profile epoch');
  }
  return {
    ok: true,
    data: Object.freeze({
      profileId,
      profileEpochId: ledger.profileEpochId,
      lifetimeSeeds: lifetime.data,
      path: path.data,
      ledger,
      achievements,
    }),
  };
}

export function projectLearningCompletionIntoGrowthJourney(input: {
  readonly runtime: GrowthJourneyRuntimeState;
  readonly learningState: MangroveLearningState;
}): ProgressionResult<GrowthJourneyLearningProjection> {
  if (!isRecord(input) || !isRecord(input.runtime) || !isRecord(input.learningState)) {
    return failure('Complete learning projection evidence is required', 'INVALID_INPUT');
  }
  const learning = restoreMangroveLearningState(input.learningState);
  if (!learning.ok || learning.data.completion === null || learning.data.unlockEvidence === null) {
    return failure(
      learning.ok
        ? 'Only one committed learning completion can be projected'
        : learning.error.message,
      'INVALID_INPUT',
    );
  }
  const completion = learning.data.completion;
  const profile = selectGrowthJourneyProfile(input.runtime, completion.profileId);
  if (!profile.ok) return profile;
  if (profile.data.profileEpochId !== completion.profileEpochId) {
    return failure('Learning completion belongs to another reset epoch', 'EPOCH_SCOPE_MISMATCH');
  }
  if (
    learning.data.unlockEvidence.profileId !== profile.data.profileId ||
    !learning.data.unlockEvidence.reachedThresholds.every((threshold) =>
      profile.data.path.reachedThresholds.includes(threshold),
    ) ||
    !profile.data.path.reachedThresholds.includes(132)
  ) {
    return failure(
      'Learning completion does not reconcile with the current Impact Path',
      'FIXTURE_EVIDENCE_MISMATCH',
    );
  }

  const evidence = achievementEvidence(profile.data.ledger, [
    {
      id: completion.id,
      profileId: completion.profileId,
      profileEpochId: completion.profileEpochId,
      learningId: completion.learningId,
      status: 'committed',
    },
  ]);
  if (!evidence.ok) return evidence;
  const evaluated = evaluateBadgeAwards({
    state: profile.data.achievements,
    evidence: evidence.data,
    mode: 'live',
    triggerEventId: completion.triggerEventId,
    occurredAt: completion.completedAt,
  });
  if (!evaluated.ok) return failure(evaluated.error.message);
  const runtime =
    evaluated.data.state === profile.data.achievements
      ? input.runtime
      : freezeRuntime({
          resetSequence: input.runtime.resetSequence,
          ledgersByProfile: { ...input.runtime.ledgersByProfile },
          achievementsByProfile: {
            ...input.runtime.achievementsByProfile,
            [completion.profileId]: evaluated.data.state,
          },
        });
  return {
    ok: true,
    data: Object.freeze({
      disposition:
        evaluated.data.newlyEarnedBadgeIds.length > 0 ? 'evaluated' : 'already_evaluated',
      runtime,
      newlyEarnedBadgeIds: evaluated.data.newlyEarnedBadgeIds,
    }),
  };
}

export function projectRecognitionIntoGrowthJourney(input: {
  readonly runtime: GrowthJourneyRuntimeState;
  readonly previousSession: PrototypeSession;
  readonly nextSession: PrototypeSession;
  readonly receipt: RecognitionReceipt;
  readonly committedAt: string;
  readonly learningCompletions?: readonly LearningCompletionEvidence[];
  readonly semanticCriterionEvidence?: readonly SemanticCriterionEvidence[];
}): ProgressionResult<GrowthJourneyRecognitionProjection> {
  if (
    !isRecord(input) ||
    !isRecord(input.runtime) ||
    !isRecord(input.previousSession) ||
    !isRecord(input.nextSession) ||
    !isRecord(input.receipt) ||
    typeof input.committedAt !== 'string'
  ) {
    return failure('Complete recognition projection evidence is required', 'INVALID_INPUT');
  }
  const transaction = input.receipt.seedTransaction;
  if (transaction === null) {
    return {
      ok: true,
      data: Object.freeze({
        disposition: 'not_applicable',
        runtime: input.runtime,
        addedCreditIds: Object.freeze([]),
        newlyEarnedBadgeIds: Object.freeze([]),
        newlyReachedThresholds: Object.freeze([]),
      }),
    };
  }

  const profileId = transaction.childId;
  const ledger = input.runtime.ledgersByProfile[profileId];
  const achievementState = input.runtime.achievementsByProfile[profileId];
  const previousChild = input.previousSession.children[profileId];
  const nextChild = input.nextSession.children[profileId];
  const previouslyCommitted = input.previousSession.recognitionLedger[input.receipt.recognitionKey];
  const nextCommitted = input.nextSession.recognitionLedger[input.receipt.recognitionKey];
  if (
    !ledger ||
    !achievementState ||
    !previousChild ||
    !nextChild ||
    transaction.recognitionKey !== input.receipt.recognitionKey ||
    !VALID_FIXED_SEED_AWARDS.has(transaction.amount) ||
    transaction.balanceAfter !== transaction.balanceBefore + transaction.amount ||
    nextChild.earnedSeeds !== transaction.balanceAfter ||
    (previouslyCommitted
      ? previousChild.earnedSeeds !== transaction.balanceAfter ||
        !sameReceipt(previouslyCommitted, input.receipt)
      : previousChild.earnedSeeds !== transaction.balanceBefore) ||
    !nextCommitted ||
    !sameReceipt(nextCommitted, input.receipt)
  ) {
    return failure('Recognition receipt does not reconcile with the authoritative sessions');
  }

  const growth = input.receipt.landscapeGrowth;
  if (growth) {
    const previousLandscape = input.previousSession.landscapeProgress[growth.landscapeId];
    const nextLandscape = input.nextSession.landscapeProgress[growth.landscapeId];
    if (
      !previousLandscape ||
      !nextLandscape ||
      nextLandscape.cumulativeSeeds !== growth.seedsAfter ||
      nextLandscape.stage !== growth.stageAfter ||
      (previouslyCommitted
        ? previousLandscape.cumulativeSeeds !== growth.seedsAfter ||
          previousLandscape.stage !== growth.stageAfter
        : previousLandscape.cumulativeSeeds !== growth.seedsBefore ||
          previousLandscape.stage !== growth.stageBefore)
    ) {
      return failure('Landscape receipt does not reconcile with the authoritative sessions');
    }
  }

  const requiresMangroveArchive =
    profileId === 'child_salem' &&
    transaction.balanceBefore === 48 &&
    transaction.balanceAfter === 60;
  if (requiresMangroveArchive && !isCanonicalMangroveArchiveTransition(input.receipt)) {
    return failure('The canonical 48-to-60 approval requires its Mangrove stage transition');
  }

  const projected = projectRecognitionSeedEntry({
    ledger,
    profileId,
    profileEpochId: ledger.profileEpochId,
    triggerEventId: input.receipt.recognitionKey,
    recognitionKey: input.receipt.recognitionKey,
    seedTransactionId: transaction.id,
    amount: transaction.amount,
    committedAt: input.committedAt,
    fixtureVersion: SCHEMA3_R002A_FIXTURE_VERSION,
    mangroveTransition: isCanonicalMangroveArchiveTransition(input.receipt)
      ? {
          landscapeId: 'mangrove',
          seedsBefore: 48,
          seedsAfter: 60,
          stageBefore: 'shoot',
          stageAfter: 'sapling',
          crossedThreshold: 60,
          symbolicOnly: true,
        }
      : null,
  });
  if (!projected.ok) return projected;

  let nextAchievementState = achievementState;
  let addedCreditIds: readonly string[] = Object.freeze([]);
  const journey = input.nextSession.journey;
  if (journey?.task.id === 'task_recycling_p0_v1') {
    if (
      journey.lifecycle !== 'recognized' ||
      !journey.submission ||
      input.receipt.recognitionKey !== `recognition:${journey.submission.id}`
    ) {
      return failure('Canonical mastery credit requires its recognized task occurrence');
    }
    const recorded = recordParentApprovedAcquisition({
      state: nextAchievementState,
      event: {
        eventId: input.receipt.recognitionKey,
        occurrenceId: journey.submission.id,
        profileId,
        profileEpochId: ledger.profileEpochId,
        taskId: journey.task.id,
        status: 'committed',
        recognitionMode: journey.task.content.recognitionMode,
        routinePhase: 'acquisition',
      },
    });
    if (!recorded.ok) return failure(recorded.error.message);
    nextAchievementState = recorded.data.state;
    addedCreditIds = recorded.data.addedCreditIds;
  }

  const nextEvidence = achievementEvidence(
    projected.data.ledger,
    input.learningCompletions ?? Object.freeze([]),
    input.semanticCriterionEvidence ?? Object.freeze([]),
  );
  if (!nextEvidence.ok) return nextEvidence;
  const evaluated = evaluateBadgeAwards({
    state: nextAchievementState,
    evidence: nextEvidence.data,
    mode: 'live',
    triggerEventId: input.receipt.recognitionKey,
    occurredAt: input.committedAt,
  });
  if (!evaluated.ok) return failure(evaluated.error.message);
  nextAchievementState = evaluated.data.state;

  const beforeLifetime = selectLifetimeSeeds(ledger, profileId, ledger.profileEpochId);
  if (!beforeLifetime.ok) return beforeLifetime;
  const beforePath = projectWaterAndCoastPath(beforeLifetime.data);
  const afterPath = projectWaterAndCoastPath(nextEvidence.data.lifetimeSeeds.amount);
  if (!beforePath.ok || !afterPath.ok) {
    return failure('Impact Path station delta could not be derived');
  }
  const previouslyReached = new Set(beforePath.data.reachedThresholds);
  const newlyReachedThresholds = Object.freeze(
    afterPath.data.reachedThresholds.filter((threshold) => !previouslyReached.has(threshold)),
  );

  const nextRuntime =
    projected.data.ledger === ledger && nextAchievementState === achievementState
      ? input.runtime
      : freezeRuntime({
          resetSequence: input.runtime.resetSequence,
          ledgersByProfile: {
            ...input.runtime.ledgersByProfile,
            [profileId]: projected.data.ledger,
          },
          achievementsByProfile: {
            ...input.runtime.achievementsByProfile,
            [profileId]: nextAchievementState,
          },
        });
  return {
    ok: true,
    data: Object.freeze({
      disposition: projected.data.disposition,
      runtime: nextRuntime,
      addedCreditIds,
      newlyEarnedBadgeIds: evaluated.data.newlyEarnedBadgeIds,
      newlyReachedThresholds,
    }),
  };
}

function resetSessionFromRecognized(
  session: PrototypeSession,
  receipt: RecognitionReceipt,
): ProgressionResult<PrototypeSession> {
  const transaction = receipt.seedTransaction;
  if (
    transaction?.childId !== 'child_salem' ||
    transaction.balanceBefore !== 48 ||
    transaction.balanceAfter !== 60 ||
    session.children.child_salem.earnedSeeds !== 60 ||
    session.children.child_alya.earnedSeeds !== 36 ||
    session.landscapeProgress.mangrove.cumulativeSeeds !== 60 ||
    !isCanonicalMangroveArchiveTransition(receipt)
  ) {
    return failure('Recognized session does not preserve the canonical synthetic receipt chain');
  }
  return {
    ok: true,
    data: {
      ...session,
      children: {
        ...session.children,
        child_salem: { ...session.children.child_salem, earnedSeeds: 48 },
      },
      landscapeProgress: {
        ...session.landscapeProgress,
        mangrove: {
          landscapeId: 'mangrove',
          cumulativeSeeds: 48,
          stage: 'shoot',
          nextThreshold: 60,
        },
      },
      recognitionLedger: {},
      celebration: { available: false, consumed: false },
    },
  };
}

export function rehydrateGrowthJourneyRuntime(input: {
  readonly session: PrototypeSession;
  readonly savedRuntime: GrowthJourneyRuntimeState | null;
  readonly resetSequence: number;
}): ProgressionResult<GrowthJourneyRuntimeState> {
  if (
    !isRecord(input) ||
    !isRecord(input.session) ||
    !isRecord(input.session.children) ||
    !isRecord(input.session.landscapeProgress) ||
    !isRecord(input.session.landscapeProgress.mangrove) ||
    !isRecord(input.session.recognitionLedger) ||
    (input.savedRuntime !== null && !isRecord(input.savedRuntime)) ||
    !Number.isSafeInteger(input.resetSequence) ||
    input.resetSequence < 0
  ) {
    return failure('Complete Growth Journey restoration evidence is required', 'INVALID_INPUT');
  }
  if (input.savedRuntime !== null && input.savedRuntime.resetSequence !== input.resetSequence) {
    return failure('Saved Growth Journey reset epoch does not match restoration authority');
  }
  const receipts = Object.values(input.session.recognitionLedger);
  if (receipts.length === 0) {
    const canonical = createGrowthJourneyRuntime(input.session, input.resetSequence);
    if (!canonical.ok) return canonical;
    if (
      input.savedRuntime !== null &&
      JSON.stringify(input.savedRuntime) !== JSON.stringify(canonical.data)
    ) {
      return failure('Saved opening state does not reconcile with the Schema-3 session');
    }
    return { ok: true, data: input.savedRuntime ?? canonical.data };
  }
  if (receipts.length !== 1) {
    return failure('This synthetic restoration boundary supports one canonical approval receipt');
  }
  const receipt = receipts[0];
  if (!receipt) return failure('Recognition receipt is missing');
  const committedAt = input.session.journey?.checkIn?.praisePresentedAt;
  if (
    input.session.journey?.lifecycle !== 'recognized' ||
    input.session.journey.submission === null ||
    receipt.recognitionKey !== `recognition:${input.session.journey.submission.id}` ||
    typeof committedAt !== 'string'
  ) {
    return failure('Recognized restoration requires its exact journey and praise evidence');
  }
  const resetSession = resetSessionFromRecognized(input.session, receipt);
  if (!resetSession.ok) return resetSession;
  const canonicalBase = createGrowthJourneyRuntime(resetSession.data, input.resetSequence);
  if (!canonicalBase.ok) return canonicalBase;
  const canonicalProjection = projectRecognitionIntoGrowthJourney({
    runtime: canonicalBase.data,
    previousSession: resetSession.data,
    nextSession: input.session,
    receipt,
    committedAt,
  });
  if (!canonicalProjection.ok) return canonicalProjection;
  if (input.savedRuntime === null) {
    return { ok: true, data: canonicalProjection.data.runtime };
  }
  const restoredProjection = projectRecognitionIntoGrowthJourney({
    runtime: input.savedRuntime,
    previousSession: resetSession.data,
    nextSession: input.session,
    receipt,
    committedAt,
  });
  if (!restoredProjection.ok) return restoredProjection;
  if (
    JSON.stringify(restoredProjection.data.runtime) !==
    JSON.stringify(canonicalProjection.data.runtime)
  ) {
    return failure('Saved recognition state does not match canonical reconstructed evidence');
  }
  return { ok: true, data: restoredProjection.data.runtime };
}
