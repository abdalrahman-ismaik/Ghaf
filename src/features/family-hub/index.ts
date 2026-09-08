import {
  createFamilyRewardPlan,
  evaluateFamilyRewardPlan,
  markFamilyRewardGiven,
  projectFamilyRewardPlan,
} from '../family-rewards';
import type {
  FamilyRewardEligibilityEvent,
  FamilyRewardPlan,
  FamilyRewardProgressSnapshot,
  FamilyRewardResult,
  PrivateFamilyRewardView,
} from '../../models/familyReward';
import type { RecognitionReceipt, SyntheticChildId, TaskJourney } from '../../models/familyGrowth';

export const FAMILY_REWARD_BASELINE = 108;
export const FAMILY_REWARD_TARGET = 120;
export const FAMILY_REWARD_ELIGIBILITY_DECISIONS = Object.freeze({
  'task_recycling_p0_v1@1': true,
} as const);

export interface FamilyRewardRuntime {
  readonly plan: FamilyRewardPlan;
  readonly progress: FamilyRewardProgressSnapshot;
  readonly baselineEligibleSeeds: typeof FAMILY_REWARD_BASELINE;
  readonly targetEligibleSeeds: typeof FAMILY_REWARD_TARGET;
}

export interface FamilyRewardPresentation {
  readonly view: PrivateFamilyRewardView;
  readonly currentEligibleSeeds: number;
  readonly targetEligibleSeeds: number;
  readonly remainingEligibleSeeds: number;
  readonly origin: 'synthetic';
}

function emptyProgress(): FamilyRewardProgressSnapshot {
  return {
    childId: 'child_salem',
    eligibleSeedDelta: 0,
    recognitionKeys: [],
    eligibleLandscapeTransitions: [],
    landscapesCrossingTarget: [],
  };
}

export function createFamilyRewardRuntime(): FamilyRewardRuntime {
  const plan = createFamilyRewardPlan({
    id: 'family-reward-salem-september-v1',
    childId: 'child_salem',
    guardianIds: ['parent_al_noor'],
    createdByGuardianId: 'parent_al_noor',
    month: '2026-09',
    promisedAt: '2026-08-01T09:00:00.000Z',
    promise: {
      kind: 'experience',
      label: {
        ar: 'اختيار نشاط عائلي لعطلة نهاية الأسبوع',
        en: 'Choose a family weekend activity',
      },
    },
    milestone: { kind: 'eligible_seed_delta', requiredSeedDelta: 12 },
  });
  if (!plan.ok) throw new Error(`Family Reward fixture is invalid: ${plan.error.message}`);
  return {
    plan: plan.data,
    progress: emptyProgress(),
    baselineEligibleSeeds: FAMILY_REWARD_BASELINE,
    targetEligibleSeeds: FAMILY_REWARD_TARGET,
  };
}

export function applyRecognitionToFamilyReward(input: {
  readonly runtime: FamilyRewardRuntime;
  readonly journey: TaskJourney;
  readonly receipt: RecognitionReceipt;
  readonly committedAt: string;
}): FamilyRewardResult<FamilyRewardRuntime> {
  const { runtime, journey, receipt, committedAt } = input;
  const taskVersionKey = `${journey.task.id}@${journey.task.version}`;
  const eligibilityDecision = (
    FAMILY_REWARD_ELIGIBILITY_DECISIONS as Readonly<Record<string, boolean>>
  )[taskVersionKey];
  if (
    eligibilityDecision !== true ||
    runtime.progress.recognitionKeys.includes(receipt.recognitionKey) ||
    runtime.plan.lifecycle !== 'promised'
  ) {
    return { ok: true, data: runtime };
  }
  if (receipt.seedTransaction === null || receipt.landscapeGrowth === null) {
    return { ok: true, data: runtime };
  }
  const event: FamilyRewardEligibilityEvent = {
    id: `family-reward:${receipt.seedTransaction.id}`,
    recognitionKey: receipt.recognitionKey,
    childId: receipt.seedTransaction.childId,
    categoryId: journey.task.content.categoryId,
    activityKind: 'general',
    recognitionMode: journey.task.content.recognitionMode,
    routinePhase: journey.task.content.routinePhase,
    eligibleSeedDelta: receipt.seedTransaction.amount,
    landscapeTransition: {
      landscapeId: receipt.landscapeGrowth.landscapeId,
      stageBefore: receipt.landscapeGrowth.stageBefore,
      stageAfter: receipt.landscapeGrowth.stageAfter,
    },
    occurredAt: committedAt,
    prerequisites: {
      parentConfirmationRecorded: true,
      praisePresented: true,
      gardenRecognitionApplied: true,
    },
  };
  const evaluated = evaluateFamilyRewardPlan(runtime.plan, [event], {
    evaluatedAt: committedAt,
  });
  if (!evaluated.ok) return evaluated;
  return {
    ok: true,
    data: {
      ...runtime,
      plan: evaluated.data.plan,
      progress: evaluated.data.progress,
    },
  };
}

export function markFamilyRewardRuntimeGiven(
  runtime: FamilyRewardRuntime,
  givenAt: string,
): FamilyRewardResult<FamilyRewardRuntime> {
  const given = markFamilyRewardGiven(runtime.plan, {
    guardianId: 'parent_al_noor',
    givenAt,
  });
  return given.ok ? { ok: true, data: { ...runtime, plan: given.data.plan } } : given;
}

export function projectFamilyRewardRuntime(
  runtime: FamilyRewardRuntime,
  viewer:
    | { readonly kind: 'guardian'; readonly guardianId: 'parent_al_noor' }
    | { readonly kind: 'child'; readonly childId: SyntheticChildId },
): FamilyRewardResult<FamilyRewardPresentation> {
  const projected = projectFamilyRewardPlan(runtime.plan, viewer);
  if (!projected.ok) return projected;
  const currentEligibleSeeds = Math.min(
    runtime.targetEligibleSeeds,
    runtime.baselineEligibleSeeds + runtime.progress.eligibleSeedDelta,
  );
  return {
    ok: true,
    data: {
      view: projected.data,
      currentEligibleSeeds,
      targetEligibleSeeds: runtime.targetEligibleSeeds,
      remainingEligibleSeeds: Math.max(0, runtime.targetEligibleSeeds - currentEligibleSeeds),
      origin: 'synthetic',
    },
  };
}
