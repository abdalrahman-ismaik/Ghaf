import type { BadgeAward } from '../../models/achievements';
import type {
  PraisePresentedPlan,
  PrototypeSession,
  RecognitionAttemptResult,
  RecognitionReceipt,
  SyntheticChildId,
} from '../../models/familyGrowth';
import { IMPACT_PATH_STATIONS, type ImpactPathThreshold } from '../../models/growthJourney';
import type {
  CommittedRevealSourceReceipt,
  RevealBundleErrorCode,
  RevealBundleQueue,
  RevealBundleResult,
  RevealConstructionResult,
} from '../../models/revealBundle';
import { projectFamilyRewardUnlock, type FamilyRewardRuntime } from '../family-hub';
import type {
  GrowthJourneyRecognitionProjection,
  GrowthJourneyRuntimeState,
} from '../growth/bootstrap';
import { selectLifetimeSeeds } from '../growth/seedLedger';
import type { PrivateLeagueRecognitionApplication } from '../league/recognitionRuntime';
import { constructRevealBundle } from './revealBundle';

export interface ApprovalRevealProjectionInput {
  readonly queue: RevealBundleQueue;
  readonly plan: PraisePresentedPlan;
  readonly recognition: RecognitionAttemptResult;
  readonly previousSession: PrototypeSession;
  readonly growthBefore: GrowthJourneyRuntimeState;
  readonly growthProjection: GrowthJourneyRecognitionProjection;
  readonly familyRewardBefore: FamilyRewardRuntime;
  readonly familyRewardAfter: FamilyRewardRuntime;
  readonly privateLeague: PrivateLeagueRecognitionApplication;
}

function failure<T>(code: RevealBundleErrorCode, message: string): RevealBundleResult<T> {
  return { ok: false, error: { code, message } };
}

function sameValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function receiptScope(input: {
  readonly id: string;
  readonly authority: CommittedRevealSourceReceipt['authority'];
  readonly profileId: SyntheticChildId;
  readonly profileEpochId: string;
  readonly triggerEventId: string;
  readonly committedAt: string;
  readonly consequence: CommittedRevealSourceReceipt['consequence'];
}): CommittedRevealSourceReceipt {
  return {
    ...input,
    triggerKind: 'task_approval',
    status: 'committed',
  } as CommittedRevealSourceReceipt;
}

function newBadgeAwards(
  input: ApprovalRevealProjectionInput,
): RevealBundleResult<readonly BadgeAward[]> {
  const transaction = input.recognition.receipt.seedTransaction;
  if (!transaction) return failure('RECEIPT_CONFLICT', 'Approval badge evidence requires Seeds');
  const before = input.growthBefore.achievementsByProfile[transaction.childId];
  const after = input.growthProjection.runtime.achievementsByProfile[transaction.childId];
  if (
    !before ||
    !after ||
    before.profileId !== transaction.childId ||
    after.profileId !== transaction.childId ||
    before.profileEpochId !== after.profileEpochId
  ) {
    return failure('PROFILE_SCOPE_MISMATCH', 'Badge evidence does not match one profile epoch');
  }
  const previousIds = new Set(before.awards.map((award) => award.id));
  const awards = after.awards.filter((award) => !previousIds.has(award.id));
  const projectedIds = new Set(input.growthProjection.newlyEarnedBadgeIds);
  if (
    awards.length !== projectedIds.size ||
    awards.some(
      (award) =>
        !projectedIds.has(award.badgeId) ||
        award.profileId !== transaction.childId ||
        award.profileEpochId !== after.profileEpochId ||
        award.sourceEventId !== input.recognition.receipt.recognitionKey ||
        award.status !== 'earned' ||
        award.earnedAt !== input.plan.checkIn.praisePresentedAt ||
        award.silentBackfill ||
        !award.celebrationEligible ||
        !award.private ||
        !award.permanent,
    )
  ) {
    return failure('RECEIPT_CONFLICT', 'Badge awards do not reconcile with this approval');
  }
  return { ok: true, data: Object.freeze([...awards]) };
}

function validateRecognitionEnvelope(input: ApprovalRevealProjectionInput): RevealBundleResult<{
  readonly profileId: SyntheticChildId;
  readonly profileEpochId: string;
  readonly receipt: RecognitionReceipt & {
    readonly seedTransaction: NonNullable<RecognitionReceipt['seedTransaction']>;
  };
}> {
  const { plan, recognition, previousSession, growthBefore, growthProjection } = input;
  const receipt = recognition.receipt;
  const transaction = receipt.seedTransaction;
  const journey = recognition.journey;
  if (
    recognition.disposition !== 'applied' ||
    plan.renderState !== 'praise_presented' ||
    plan.checkIn.praisePresentedAt.trim().length === 0 ||
    plan.recognitionKey !== receipt.recognitionKey ||
    plan.checkIn.id !== receipt.checkInId ||
    journey.lifecycle !== 'recognized' ||
    !journey.submission ||
    !journey.checkIn ||
    journey.submission.id !== plan.journey.submission?.id ||
    journey.checkIn.id !== plan.checkIn.id ||
    journey.checkIn.recognitionKey !== receipt.recognitionKey ||
    journey.checkIn.praisePresentedAt !== plan.checkIn.praisePresentedAt ||
    journey.checkIn.confirmationPresentation !== 'recognition_applied' ||
    !sameValue(journey.checkIn.praise, plan.praise) ||
    !transaction ||
    transaction.recognitionKey !== receipt.recognitionKey ||
    transaction.childId !== journey.task.targetChildId ||
    previousSession.recognitionLedger[receipt.recognitionKey] !== undefined ||
    !sameValue(recognition.session.recognitionLedger[receipt.recognitionKey], receipt) ||
    growthProjection.disposition !== 'projected'
  ) {
    return failure('RECEIPT_CONFLICT', 'Approval evidence does not form one committed recognition');
  }

  const beforeLedger = growthBefore.ledgersByProfile[transaction.childId];
  const afterLedger = growthProjection.runtime.ledgersByProfile[transaction.childId];
  if (
    !beforeLedger ||
    !afterLedger ||
    beforeLedger.profileId !== transaction.childId ||
    afterLedger.profileId !== transaction.childId ||
    beforeLedger.profileEpochId !== afterLedger.profileEpochId
  ) {
    return failure('EPOCH_SCOPE_MISMATCH', 'Approval Seed evidence crossed a profile epoch');
  }
  return {
    ok: true,
    data: {
      profileId: transaction.childId,
      profileEpochId: afterLedger.profileEpochId,
      receipt: receipt as typeof receipt & { seedTransaction: typeof transaction },
    },
  };
}

export function constructApprovalReveal(
  input: ApprovalRevealProjectionInput,
): RevealBundleResult<RevealConstructionResult> {
  const envelope = validateRecognitionEnvelope(input);
  if (!envelope.ok) return envelope;
  const { profileId, profileEpochId, receipt } = envelope.data;
  const { seedTransaction, landscapeGrowth, canopyContribution, circleEvent } = receipt;
  const recognitionKey = receipt.recognitionKey;
  const committedAt = input.plan.checkIn.praisePresentedAt;
  const beforeLedger = input.growthBefore.ledgersByProfile[profileId];
  const afterLedger = input.growthProjection.runtime.ledgersByProfile[profileId];
  const beforeLifetime = selectLifetimeSeeds(beforeLedger, profileId, profileEpochId);
  const afterLifetime = selectLifetimeSeeds(afterLedger, profileId, profileEpochId);
  if (
    !beforeLifetime.ok ||
    !afterLifetime.ok ||
    afterLifetime.data !== beforeLifetime.data + seedTransaction.amount
  ) {
    return failure('RECEIPT_CONFLICT', 'Lifetime Seed totals do not reconcile with the approval');
  }

  const priorEntryIds = new Set(beforeLedger.entries.map((entry) => entry.id));
  const newEntries = afterLedger.entries.filter((entry) => !priorEntryIds.has(entry.id));
  const seedEntry = newEntries.find(
    (entry) =>
      entry.kind === 'task_recognition' &&
      entry.profileId === profileId &&
      entry.profileEpochId === profileEpochId &&
      entry.triggerEventId === recognitionKey &&
      entry.amount === seedTransaction.amount &&
      entry.status === 'committed' &&
      entry.committedAt === committedAt &&
      entry.silentBackfill === false &&
      entry.provenance.source === 'recognition_receipt' &&
      sameValue(entry.provenance.sourceIds, [recognitionKey, seedTransaction.id]),
  );
  if (newEntries.length !== 1 || !seedEntry) {
    return failure(
      'RECEIPT_CONFLICT',
      'Approval is missing its unique committed Seed ledger entry',
    );
  }

  const receipts: CommittedRevealSourceReceipt[] = [
    receiptScope({
      id: `reveal-receipt:parent-check-in:${input.plan.checkIn.id}`,
      authority: 'parent_check_in',
      profileId,
      profileEpochId,
      triggerEventId: recognitionKey,
      committedAt,
      consequence: {
        kind: 'parent_praise',
        checkInId: input.plan.checkIn.id,
        text: input.plan.praise,
      },
    }),
    receiptScope({
      id: `reveal-receipt:${seedEntry.id}`,
      authority: 'seed_ledger',
      profileId,
      profileEpochId,
      triggerEventId: recognitionKey,
      committedAt,
      consequence: {
        kind: 'seed',
        transactionId: seedEntry.id,
        delta: seedTransaction.amount,
        before: beforeLifetime.data,
        after: afterLifetime.data,
        meaning: 'symbolic_nonfinancial',
      },
    }),
  ];

  const priorArchiveIds = new Set(beforeLedger.plantStageArchives.map((archive) => archive.id));
  const newArchives = afterLedger.plantStageArchives.filter(
    (archive) => !priorArchiveIds.has(archive.id),
  );
  if (landscapeGrowth) {
    const archive = newArchives.find(
      (candidate) =>
        candidate.profileId === profileId &&
        candidate.profileEpochId === profileEpochId &&
        candidate.triggerEventId === recognitionKey &&
        candidate.landscapeId === landscapeGrowth.landscapeId &&
        candidate.seedsBefore === landscapeGrowth.seedsBefore &&
        candidate.seedsAfter === landscapeGrowth.seedsAfter &&
        candidate.stageBefore === landscapeGrowth.stageBefore &&
        candidate.stageAfter === landscapeGrowth.stageAfter &&
        candidate.threshold === landscapeGrowth.crossedThreshold &&
        candidate.symbolicOnly === landscapeGrowth.symbolicOnly,
    );
    if (newArchives.length !== 1 || !archive) {
      return failure('RECEIPT_CONFLICT', 'Plant-stage archive does not match the approval');
    }
    receipts.push(
      receiptScope({
        id: `reveal-receipt:${archive.id}`,
        authority: 'garden',
        profileId,
        profileEpochId,
        triggerEventId: recognitionKey,
        committedAt,
        consequence: {
          kind: 'plant_stage',
          growthId: archive.id,
          landscapeId: landscapeGrowth.landscapeId,
          seedsBefore: landscapeGrowth.seedsBefore,
          seedsAfter: landscapeGrowth.seedsAfter,
          stageBefore: landscapeGrowth.stageBefore,
          stageAfter: landscapeGrowth.stageAfter,
          crossedThreshold: landscapeGrowth.crossedThreshold,
          symbolicOnly: true,
        },
      }),
    );
  } else if (newArchives.length > 0) {
    return failure('RECEIPT_CONFLICT', 'Plant-stage archive exists without a Garden consequence');
  }

  if (canopyContribution) {
    const before = input.previousSession.household.combinedCanopy;
    const after = input.recognition.session.household.combinedCanopy;
    if (
      canopyContribution.actionKind !== 'eligible_household_acquisition' ||
      canopyContribution.leafDelta !== 1 ||
      canopyContribution.origin !== 'synthetic' ||
      before.goalLeaves !== 25 ||
      after.goalLeaves !== before.goalLeaves ||
      after.contributionLeaves !== before.contributionLeaves + canopyContribution.leafDelta
    ) {
      return failure('RECEIPT_CONFLICT', 'Canopy counters do not match the committed contribution');
    }
    const contributionId = `canopy:${profileEpochId}:${recognitionKey}`;
    receipts.push(
      receiptScope({
        id: `reveal-receipt:${contributionId}`,
        authority: 'canopy',
        profileId,
        profileEpochId,
        triggerEventId: recognitionKey,
        committedAt,
        consequence: {
          kind: 'canopy',
          contributionId,
          leavesBefore: before.contributionLeaves,
          leavesAfter: after.contributionLeaves,
          leafDelta: 1,
          goalLeaves: 25,
          origin: 'synthetic',
        },
      }),
    );
  } else if (
    !sameValue(
      input.previousSession.household.combinedCanopy,
      input.recognition.session.household.combinedCanopy,
    )
  ) {
    return failure('RECEIPT_CONFLICT', 'Canopy changed without a committed contribution');
  }

  if (circleEvent) {
    const before = input.previousSession.circleGoal;
    const after = input.recognition.session.circleGoal;
    if (
      circleEvent.actionKind !== 'eligible_green_action' ||
      circleEvent.actionDelta !== 1 ||
      circleEvent.sourceScope !== 'household' ||
      circleEvent.origin !== 'synthetic_local' ||
      before.goal !== 12 ||
      after.goal !== before.goal ||
      after.eligibleGreenActions !== before.eligibleGreenActions + circleEvent.actionDelta
    ) {
      return failure('RECEIPT_CONFLICT', 'Green Circle counters do not match the committed event');
    }
    const eventId = `circle:${profileEpochId}:${recognitionKey}`;
    receipts.push(
      receiptScope({
        id: `reveal-receipt:${eventId}`,
        authority: 'green_circle',
        profileId,
        profileEpochId,
        triggerEventId: recognitionKey,
        committedAt,
        consequence: {
          kind: 'green_circle',
          eventId,
          actionsBefore: before.eligibleGreenActions,
          actionsAfter: after.eligibleGreenActions,
          actionDelta: 1,
          goal: 12,
          sourceScope: 'household',
          origin: 'synthetic_local',
        },
      }),
    );
  } else if (!sameValue(input.previousSession.circleGoal, input.recognition.session.circleGoal)) {
    return failure('RECEIPT_CONFLICT', 'Green Circle changed without a committed event');
  }

  const league = input.privateLeague.receipt;
  if (
    input.privateLeague.disposition !== 'applied' ||
    league.profileId !== profileId ||
    league.profileEpochId !== profileEpochId ||
    league.recognitionKey !== recognitionKey ||
    league.committedAt !== committedAt ||
    league.completionMode !== input.recognition.journey.submission?.completionMode ||
    league.accessibilityAdapted !== false ||
    league.confirmedLeavesBefore !== 4 ||
    league.confirmedLeavesAfter !== 5 ||
    league.leafDelta !== 1 ||
    league.status !== 'committed' ||
    league.privacy !== 'private_family_league' ||
    league.leagueReceiptId.trim().length === 0 ||
    league.leafId.trim().length === 0 ||
    input.privateLeague.runtime.profileId !== profileId ||
    input.privateLeague.runtime.profileEpochId !== profileEpochId ||
    !sameValue(input.privateLeague.runtime.receiptsByRecognitionKey[recognitionKey], league)
  ) {
    return failure('RECEIPT_CONFLICT', 'Private League receipt does not match this approval');
  }
  receipts.push(
    receiptScope({
      id: `reveal-receipt:${league.leagueReceiptId}`,
      authority: 'private_league',
      profileId,
      profileEpochId,
      triggerEventId: recognitionKey,
      committedAt,
      consequence: {
        kind: 'private_league_leaf',
        weekKey: league.weekKey,
        leagueReceiptId: league.leagueReceiptId,
        leafId: league.leafId,
        confirmedLeavesBefore: league.confirmedLeavesBefore,
        confirmedLeavesAfter: league.confirmedLeavesAfter,
        leafDelta: 1,
        privacy: 'private_family_league',
      },
    }),
    receiptScope({
      id: `reveal-receipt:challenge:${profileEpochId}:${league.weekKey}:${league.leafId}`,
      authority: 'challenge_leaf',
      profileId,
      profileEpochId,
      triggerEventId: recognitionKey,
      committedAt,
      consequence: {
        kind: 'challenge_leaf',
        weekKey: league.weekKey,
        leafId: league.leafId,
        recognitionKey,
        state: 'confirmed',
        privacy: 'private_family_league',
      },
    }),
  );

  const familyReward = projectFamilyRewardUnlock({
    before: input.familyRewardBefore,
    after: input.familyRewardAfter,
    recognitionKey,
    committedAt,
  });
  if (!familyReward.ok) return failure('RECEIPT_CONFLICT', familyReward.error.message);
  if (familyReward.data) {
    receipts.push(
      receiptScope({
        id: `reveal-receipt:family-reward:${familyReward.data.planId}:${familyReward.data.planVersion}:${recognitionKey}`,
        authority: 'family_reward',
        profileId,
        profileEpochId,
        triggerEventId: recognitionKey,
        committedAt,
        consequence: { kind: 'private_family_reward', ...familyReward.data },
      }),
    );
  }

  const awards = newBadgeAwards(input);
  if (!awards.ok) return awards;
  for (const award of awards.data) {
    receipts.push(
      receiptScope({
        id: `reveal-receipt:${award.id}`,
        authority: 'achievements',
        profileId,
        profileEpochId,
        triggerEventId: recognitionKey,
        committedAt,
        consequence: {
          kind: 'earned_badge',
          awardId: award.id,
          badgeId: award.badgeId,
          newlyEarned: true,
          earnedAt: award.earnedAt!,
          private: true,
          permanent: true,
        },
      }),
    );
  }

  for (const threshold of input.growthProjection.newlyReachedThresholds) {
    const station = IMPACT_PATH_STATIONS.find((candidate) => candidate.threshold === threshold);
    if (!station) {
      return failure('RECEIPT_CONFLICT', 'Impact Path projection contains an unknown station');
    }
    receipts.push(
      receiptScope({
        id: `reveal-receipt:impact-path:${profileEpochId}:${threshold}:${recognitionKey}`,
        authority: 'impact_path',
        profileId,
        profileEpochId,
        triggerEventId: recognitionKey,
        committedAt,
        consequence: {
          kind: 'impact_path_station',
          threshold: threshold as ImpactPathThreshold,
          result: station.result,
          newlyReached: true,
        },
      }),
    );
    if (threshold === 132) {
      receipts.push(
        receiptScope({
          id: `reveal-receipt:learning-unlock:${profileEpochId}:${recognitionKey}`,
          authority: 'learning',
          profileId,
          profileEpochId,
          triggerEventId: recognitionKey,
          committedAt,
          consequence: {
            kind: 'unlocked_learning',
            unlockId: `learning-unlock:${profileEpochId}:learning.mangrove_roots.v1`,
            learningId: 'learning.mangrove_roots.v1',
            newlyUnlocked: true,
          },
        }),
      );
    }
  }

  const submission = input.recognition.journey.submission;
  if (submission?.completionMode === 'permitted_help') {
    if (!submission.helpUsed) {
      return failure('RECEIPT_CONFLICT', 'Permitted-help approval is missing its help evidence');
    }
    const recognitionId = `safe-help:${submission.id}`;
    receipts.push(
      receiptScope({
        id: `reveal-receipt:${recognitionId}`,
        authority: 'safe_help',
        profileId,
        profileEpochId,
        triggerEventId: recognitionKey,
        committedAt,
        consequence: {
          kind: 'safe_help',
          recognitionId,
          helpKind: 'permitted_help',
          recognized: true,
        },
      }),
    );
  }

  return constructRevealBundle({
    queue: input.queue,
    profileId,
    profileEpochId,
    triggerEventId: recognitionKey,
    triggerKind: 'task_approval',
    triggeredAt: committedAt,
    receipts,
  });
}
