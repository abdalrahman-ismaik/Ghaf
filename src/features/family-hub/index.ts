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

export interface FamilyRewardUnlockProjection {
  readonly planId: string;
  readonly planVersion: number;
  readonly lifecycleBefore: 'promised';
  readonly lifecycleAfter: 'unlocked';
  readonly privacy: 'child_guardians_only';
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

export function projectFamilyRewardUnlock(input: {
  readonly before: FamilyRewardRuntime;
  readonly after: FamilyRewardRuntime;
  readonly recognitionKey: string;
  readonly committedAt: string;
}): FamilyRewardResult<FamilyRewardUnlockProjection | null> {
  const { before, after, recognitionKey, committedAt } = input;
  if (
    recognitionKey.trim().length === 0 ||
    committedAt.trim().length === 0 ||
    before.plan.id !== after.plan.id ||
    before.plan.version !== after.plan.version ||
    before.plan.childId !== after.plan.childId ||
    before.plan.previousVersion !== after.plan.previousVersion ||
    before.plan.versionState !== after.plan.versionState ||
    before.plan.supersededAt !== after.plan.supersededAt ||
    before.plan.createdByGuardianId !== after.plan.createdByGuardianId ||
    before.plan.month !== after.plan.month ||
    before.plan.promisedAt !== after.plan.promisedAt ||
    JSON.stringify(before.plan.guardianIds) !== JSON.stringify(after.plan.guardianIds) ||
    JSON.stringify(before.plan.promise) !== JSON.stringify(after.plan.promise) ||
    JSON.stringify(before.plan.milestone) !== JSON.stringify(after.plan.milestone) ||
    before.plan.privacy !== 'child_guardians_only' ||
    after.plan.privacy !== 'child_guardians_only' ||
    before.baselineEligibleSeeds !== FAMILY_REWARD_BASELINE ||
    after.baselineEligibleSeeds !== FAMILY_REWARD_BASELINE ||
    before.targetEligibleSeeds !== FAMILY_REWARD_TARGET ||
    after.targetEligibleSeeds !== FAMILY_REWARD_TARGET
  ) {
    return {
      ok: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Family Reward reveal evidence does not share one valid plan identity',
      },
    };
  }

  if (before.plan.lifecycle === after.plan.lifecycle) {
    return { ok: true, data: null };
  }
  const priorRecognitionKeys = new Set(before.progress.recognitionKeys);
  const addedRecognitionKeys = after.progress.recognitionKeys.filter(
    (key) => !priorRecognitionKeys.has(key),
  );
  if (
    before.plan.lifecycle !== 'promised' ||
    after.plan.lifecycle !== 'unlocked' ||
    before.plan.unlockedAt !== null ||
    after.plan.unlockedAt !== committedAt ||
    before.plan.givenAt !== after.plan.givenAt ||
    addedRecognitionKeys.length !== 1 ||
    addedRecognitionKeys[0] !== recognitionKey ||
    before.progress.eligibleSeedDelta !== 0 ||
    after.progress.eligibleSeedDelta !== FAMILY_REWARD_TARGET - FAMILY_REWARD_BASELINE
  ) {
    return {
      ok: false,
      error: {
        code: 'INVALID_TRANSITION',
        message: 'Family Reward unlock does not reconcile with this recognition event',
      },
    };
  }

  return {
    ok: true,
    data: Object.freeze({
      planId: after.plan.id,
      planVersion: after.plan.version,
      lifecycleBefore: 'promised' as const,
      lifecycleAfter: 'unlocked' as const,
      privacy: 'child_guardians_only' as const,
    }),
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
