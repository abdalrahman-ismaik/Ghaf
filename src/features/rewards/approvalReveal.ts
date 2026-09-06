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
import { isExactPlainDataEqual as sameValue } from '../../utils/exactPlainData';
import {
  createFamilyRewardRuntime,
  isFamilyRewardRecognitionEligible,
  projectFamilyRewardUnlock,
  type FamilyRewardRuntime,
} from '../family-hub';
import { planAfterConfirmation } from '../circle/projection';
import { nextThresholdForSeeds } from '../garden/progression';
import type {
  GrowthJourneyRecognitionProjection,
  GrowthJourneyRuntimeState,
} from '../growth/bootstrap';
import { selectLifetimeSeeds } from '../growth/seedLedger';
import {
  selectCommittedPrivateLeagueReceipt,
  selectPrivateLeagueRecognitionEligibility,
  type PrivateLeagueRecognitionApplication,
} from '../league/recognitionRuntime';
import { evaluateRecognitionPolicy } from './policy';
import { constructRevealBundle } from './revealBundle';
import { hasValidRoutineProgressAuthority } from '../tasks/recognitionSession';

export interface ApprovalRevealProjectionInput {
  readonly queue: RevealBundleQueue;
  readonly plan: PraisePresentedPlan;
  readonly recognition: RecognitionAttemptResult;
  readonly previousSession: PrototypeSession;
  readonly growthBefore: GrowthJourneyRuntimeState;
  readonly growthProjection: GrowthJourneyRecognitionProjection;
  readonly familyRewardBefore: FamilyRewardRuntime;
  readonly familyRewardAfter: FamilyRewardRuntime;
  readonly privateLeague: PrivateLeagueRecognitionApplication | null;
}

export interface CommittedApprovalRevealReconciliationInput {
  readonly queue: RevealBundleQueue;
  readonly plan: PraisePresentedPlan;
  readonly recognition: RecognitionAttemptResult;
  readonly growthRuntime: GrowthJourneyRuntimeState;
  readonly familyReward: FamilyRewardRuntime;
  readonly privateLeague: PrivateLeagueRecognitionApplication | null;
}

function failure<T>(code: RevealBundleErrorCode, message: string): RevealBundleResult<T> {
  return { ok: false, error: { code, message } };
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
  const expectedRecognizedCheckIn = {
    ...plan.checkIn,
    confirmationPresentation: 'recognition_applied' as const,
  };
  if (
    recognition.disposition !== 'applied' ||
    plan.renderState !== 'praise_presented' ||
    plan.journey.lifecycle !== 'confirmed' ||
    plan.presentationActionId.trim().length === 0 ||
    plan.continuation.action !== 'apply_recognition' ||
    plan.continuation.source !== 'visible_parent_control' ||
    plan.checkIn.praisePresentedAt.trim().length === 0 ||
    plan.recognitionKey !== receipt.recognitionKey ||
    plan.checkIn.id !== receipt.checkInId ||
    !sameValue(plan.journey.checkIn, plan.checkIn) ||
    !sameValue(previousSession.journey, plan.journey) ||
    journey.lifecycle !== 'recognized' ||
    !journey.submission ||
    !journey.checkIn ||
    !sameValue(journey.task, plan.journey.task) ||
    !sameValue(journey.assignment, plan.journey.assignment) ||
    !sameValue(journey.submission, plan.journey.submission) ||
    !sameValue(journey.checkIn, expectedRecognizedCheckIn) ||
    !sameValue(recognition.session.journey, journey) ||
    !sameValue(plan.checkIn.praise, plan.praise) ||
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

  const task = input.recognition.journey.task;
  const submission = input.recognition.journey.submission;
  const existingRoutineProgress = input.previousSession.routineProgressByTask?.[task.id] ?? null;
  const recurringFadeFirst =
    task.content.recognitionMode === 'fade_first' && task.content.recurrence === 'recurrent';
  const effectiveRoutinePhase = recurringFadeFirst
    ? (existingRoutineProgress?.futurePhase ?? task.content.routinePhase)
    : task.content.routinePhase;
  const confirmedAcquisitionCount =
    recurringFadeFirst && effectiveRoutinePhase === 'acquisition'
      ? (existingRoutineProgress?.confirmedAcquisitionCount ?? 0) + 1
      : (existingRoutineProgress?.confirmedAcquisitionCount ?? 0);
  const policy = submission
    ? evaluateRecognitionPolicy({
        submissionId: submission.id,
        recognitionMode: task.content.recognitionMode,
        routinePhase: effectiveRoutinePhase,
        recurrence: task.content.recurrence,
        displayedSeedAward:
          effectiveRoutinePhase === 'maintenance' ? null : task.content.displayedSeedAward,
        completionMode: submission.completionMode,
        confirmedAcquisitionCount,
        existingReceipt: null,
      })
    : null;
  if (
    !policy?.ok ||
    policy.data.disposition !== 'new' ||
    policy.data.seedAmount !== seedTransaction.amount ||
    !sameValue(
      receipt.phaseReview,
      policy.data.phaseReview ? { taskId: task.id, ...policy.data.phaseReview } : null,
    )
  ) {
    return failure('RECEIPT_CONFLICT', 'Approval reward policy does not match its Seed receipt');
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
  if (
    !sharedProjection.ok ||
    !sameValue(canopyContribution, sharedProjection.data.canopyContribution) ||
    !sameValue(circleEvent, sharedProjection.data.circleEvent)
  ) {
    return failure('RECEIPT_CONFLICT', 'Shared consequences do not match the approved task policy');
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
  if (!landscapeGrowth) {
    return failure('RECEIPT_CONFLICT', 'Seed approval is missing its Garden growth consequence');
  }
  const beforeLandscape = input.previousSession.landscapeProgress[landscapeGrowth.landscapeId];
  const afterLandscape = input.recognition.session.landscapeProgress[landscapeGrowth.landscapeId];
  const expectedLandscapeProgress = {
    ...input.previousSession.landscapeProgress,
    [landscapeGrowth.landscapeId]: {
      landscapeId: landscapeGrowth.landscapeId,
      cumulativeSeeds: landscapeGrowth.seedsAfter,
      stage: landscapeGrowth.stageAfter,
      nextThreshold: nextThresholdForSeeds(landscapeGrowth.seedsAfter),
    },
  };
  if (
    !beforeLandscape ||
    !afterLandscape ||
    beforeLandscape.cumulativeSeeds !== landscapeGrowth.seedsBefore ||
    beforeLandscape.stage !== landscapeGrowth.stageBefore ||
    afterLandscape.cumulativeSeeds !== landscapeGrowth.seedsAfter ||
    afterLandscape.stage !== landscapeGrowth.stageAfter ||
    landscapeGrowth.seedsAfter !== landscapeGrowth.seedsBefore + seedTransaction.amount ||
    landscapeGrowth.symbolicOnly !== true ||
    !sameValue(input.recognition.session.landscapeProgress, expectedLandscapeProgress)
  ) {
    return failure('RECEIPT_CONFLICT', 'Garden growth does not match the approval sessions');
  }
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
  const requiresStageArchive =
    landscapeGrowth.stageBefore !== landscapeGrowth.stageAfter ||
    landscapeGrowth.crossedThreshold !== null;
  if (newArchives.length > 1 || (newArchives.length === 1 && !archive)) {
    return failure('RECEIPT_CONFLICT', 'Plant-stage archive does not match the approval');
  }
  if ((requiresStageArchive && !archive) || (!requiresStageArchive && newArchives.length > 0)) {
    return failure('RECEIPT_CONFLICT', 'Garden stage change does not match its archive evidence');
  }
  const growthId = archive?.id ?? `landscape-growth:${profileEpochId}:${recognitionKey}`;
  receipts.push(
    receiptScope({
      id: `reveal-receipt:${growthId}`,
      authority: 'garden',
      profileId,
      profileEpochId,
      triggerEventId: recognitionKey,
      committedAt,
      consequence: {
        kind: 'plant_stage',
        growthId,
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

  const leagueEligibility = selectPrivateLeagueRecognitionEligibility(input.recognition.journey);
  if ((leagueEligibility === null) !== (input.privateLeague === null)) {
    return failure('RECEIPT_CONFLICT', 'Private League eligibility does not match its application');
  }
  if (input.privateLeague) {
    const league = input.privateLeague.receipt;
    const committedLeague = selectCommittedPrivateLeagueReceipt(input.privateLeague.runtime);
    if (
      !committedLeague.ok ||
      committedLeague.data === null ||
      !sameValue(committedLeague.data, league) ||
      input.privateLeague.disposition !== 'applied' ||
      leagueEligibility?.leafId !== league.leafId ||
      leagueEligibility.profileId !== profileId ||
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
      input.privateLeague.runtime.challengeLeaf.state !== 'confirmed' ||
      input.privateLeague.runtime.challengeLeaf.recognitionKey !== recognitionKey ||
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
  }

  const familyRewardEligible = isFamilyRewardRecognitionEligible(input.recognition.journey);
  const familyReward = familyRewardEligible
    ? projectFamilyRewardUnlock({
        before: input.familyRewardBefore,
        after: input.familyRewardAfter,
        expectedProfileId: profileId,
        expectedLandscapeTransition: landscapeGrowth
          ? {
              landscapeId: landscapeGrowth.landscapeId,
              stageBefore: landscapeGrowth.stageBefore,
              stageAfter: landscapeGrowth.stageAfter,
            }
          : null,
        recognitionKey,
        committedAt,
      })
    : sameValue(input.familyRewardBefore, input.familyRewardAfter)
      ? { ok: true as const, data: null }
      : failure<null>(
          'RECEIPT_CONFLICT',
          'Ineligible approval changed the private Family Reward authority',
        );
  if (!familyReward.ok) return failure('RECEIPT_CONFLICT', familyReward.error.message);
  if (familyRewardEligible && familyReward.data === null) {
    return failure('RECEIPT_CONFLICT', 'Eligible approval is missing its Family Reward unlock');
  }
  if (familyReward.data !== null) {
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

  const expectedReachedThresholds = IMPACT_PATH_STATIONS.flatMap((station) =>
    station.threshold > beforeLifetime.data && station.threshold <= afterLifetime.data
      ? [station.threshold]
      : [],
  );
  if (!sameValue(input.growthProjection.newlyReachedThresholds, expectedReachedThresholds)) {
    return failure('RECEIPT_CONFLICT', 'Impact Path stations do not match the lifetime Seed delta');
  }
  for (const threshold of expectedReachedThresholds) {
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

export function reconcileCommittedApprovalReveal(
  input: CommittedApprovalRevealReconciliationInput,
): RevealBundleResult<RevealConstructionResult> {
  const { recognition, plan } = input;
  const { receipt, session } = recognition;
  const transaction = receipt.seedTransaction;
  const profileId = transaction?.childId;
  if (
    recognition.disposition !== 'already_confirmed' ||
    !transaction ||
    !profileId ||
    !session.journey ||
    !hasValidRoutineProgressAuthority(session.routineProgressByTask, session.journey) ||
    !session.children[profileId] ||
    session.children[profileId].earnedSeeds !== transaction.balanceAfter
  ) {
    return failure('RECEIPT_CONFLICT', 'Repeated approval is missing its committed Seed authority');
  }

  const currentLedger = input.growthRuntime.ledgersByProfile[profileId];
  const currentAchievements = input.growthRuntime.achievementsByProfile[profileId];
  if (!currentLedger || !currentAchievements) {
    return failure('PROFILE_SCOPE_MISMATCH', 'Repeated approval has no matching Growth profile');
  }
  const priorEntries = currentLedger.entries.filter(
    (entry) => entry.triggerEventId !== receipt.recognitionKey,
  );
  const priorArchives = currentLedger.plantStageArchives.filter(
    (archive) => archive.triggerEventId !== receipt.recognitionKey,
  );
  const currentAwards = currentAchievements.awards.filter(
    (award) => award.sourceEventId === receipt.recognitionKey,
  );
  const priorAwards = currentAchievements.awards.filter(
    (award) => award.sourceEventId !== receipt.recognitionKey,
  );
  const growthBefore: GrowthJourneyRuntimeState = {
    ...input.growthRuntime,
    ledgersByProfile: {
      ...input.growthRuntime.ledgersByProfile,
      [profileId]: {
        ...currentLedger,
        entries: priorEntries,
        plantStageArchives: priorArchives,
      },
    },
    achievementsByProfile: {
      ...input.growthRuntime.achievementsByProfile,
      [profileId]: { ...currentAchievements, awards: priorAwards },
    },
  };
  const beforeLifetime = selectLifetimeSeeds(
    growthBefore.ledgersByProfile[profileId],
    profileId,
    currentLedger.profileEpochId,
  );
  const afterLifetime = selectLifetimeSeeds(currentLedger, profileId, currentLedger.profileEpochId);
  if (!beforeLifetime.ok || !afterLifetime.ok) {
    return failure('RECEIPT_CONFLICT', 'Repeated approval Seed totals are not reproducible');
  }

  const task = session.journey.task;
  const recurringFadeFirst =
    task.content.recognitionMode === 'fade_first' && task.content.recurrence === 'recurrent';
  let previousRoutineProgressByTask = session.routineProgressByTask;
  if (recurringFadeFirst) {
    const currentProgress = session.routineProgressByTask?.[task.id];
    if (
      !currentProgress ||
      currentProgress.taskId !== task.id ||
      currentProgress.confirmedAcquisitionCount < 1
    ) {
      return failure(
        'RECEIPT_CONFLICT',
        'Repeated approval has no valid routine progress authority',
      );
    }
    const approvalCreatedPhaseReview = currentProgress.confirmedAcquisitionCount === 3;
    previousRoutineProgressByTask = {
      ...session.routineProgressByTask,
      [task.id]: {
        ...currentProgress,
        confirmedAcquisitionCount: currentProgress.confirmedAcquisitionCount - 1,
        futurePhase: 'acquisition',
        phaseReview: approvalCreatedPhaseReview ? null : currentProgress.phaseReview,
        decision: approvalCreatedPhaseReview ? null : currentProgress.decision,
      },
    };
  }

  const currentChild = session.children[profileId];
  const previousSession: PrototypeSession = {
    ...session,
    household: receipt.canopyContribution
      ? {
          ...session.household,
          combinedCanopy: {
            ...session.household.combinedCanopy,
            contributionLeaves:
              session.household.combinedCanopy.contributionLeaves -
              receipt.canopyContribution.leafDelta,
          },
        }
      : session.household,
    children: {
      ...session.children,
      [profileId]: { ...currentChild, earnedSeeds: transaction.balanceBefore },
    },
    journey: plan.journey,
    landscapeProgress: receipt.landscapeGrowth
      ? {
          ...session.landscapeProgress,
          [receipt.landscapeGrowth.landscapeId]: {
            landscapeId: receipt.landscapeGrowth.landscapeId,
            cumulativeSeeds: receipt.landscapeGrowth.seedsBefore,
            stage: receipt.landscapeGrowth.stageBefore,
            nextThreshold: nextThresholdForSeeds(receipt.landscapeGrowth.seedsBefore),
          },
        }
      : session.landscapeProgress,
    circleGoal: receipt.circleEvent
      ? {
          ...session.circleGoal,
          eligibleGreenActions:
            session.circleGoal.eligibleGreenActions - receipt.circleEvent.actionDelta,
        }
      : session.circleGoal,
    recognitionLedger: Object.fromEntries(
      Object.entries(session.recognitionLedger).filter(([key]) => key !== receipt.recognitionKey),
    ),
    routineProgressByTask: previousRoutineProgressByTask,
    celebration: { available: false, consumed: false },
  };
  const familyRewardAfter: FamilyRewardRuntime =
    input.familyReward.plan.lifecycle === 'given'
      ? {
          ...input.familyReward,
          plan: { ...input.familyReward.plan, lifecycle: 'unlocked', givenAt: null },
        }
      : input.familyReward;
  const familyRewardEligible = isFamilyRewardRecognitionEligible(recognition.journey);
  const normalizedLeague = input.privateLeague
    ? { ...input.privateLeague, disposition: 'applied' as const }
    : null;
  return constructApprovalReveal({
    queue: input.queue,
    plan,
    recognition: { ...recognition, disposition: 'applied', message: null },
    previousSession,
    growthBefore,
    growthProjection: {
      disposition: 'projected',
      runtime: input.growthRuntime,
      addedCreditIds: [],
      newlyEarnedBadgeIds: currentAwards.map((award) => award.badgeId),
      newlyReachedThresholds: IMPACT_PATH_STATIONS.flatMap((station) =>
        station.threshold > beforeLifetime.data && station.threshold <= afterLifetime.data
          ? [station.threshold]
          : [],
      ),
    },
    familyRewardBefore: familyRewardEligible ? createFamilyRewardRuntime() : input.familyReward,
    familyRewardAfter: familyRewardEligible ? familyRewardAfter : input.familyReward,
    privateLeague: normalizedLeague,
  });
}
