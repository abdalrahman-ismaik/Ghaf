import {
  createFamilyRewardPlan,
  evaluateFamilyRewardPlan,
  markFamilyRewardGiven,
  projectFamilyRewardPlan,
} from '../family-rewards';
import type {
  EligibleLandscapeTransition,
  FamilyRewardEligibilityEvent,
  FamilyRewardPlan,
  FamilyRewardProgressSnapshot,
  FamilyRewardResult,
  PrivateFamilyRewardView,
} from '../../models/familyReward';
import type { RecognitionReceipt, SyntheticChildId, TaskJourney } from '../../models/familyGrowth';
import { isExactPlainDataEqual as sameValue } from '../../utils/exactPlainData';
import { matchesCanonicalP0TaskContent, validateTaskForReview } from '../tasks/validation';

export const FAMILY_REWARD_BASELINE = 108;
export const FAMILY_REWARD_TARGET = 120;
export const FAMILY_REWARD_ELIGIBILITY_DECISIONS = Object.freeze({
  'task_recycling_p0_v1@1': true,
} as const);

export function isFamilyRewardRecognitionEligible(journey: TaskJourney): boolean {
  const taskVersionKey = `${journey.task.id}@${journey.task.version}`;
  return (
    (FAMILY_REWARD_ELIGIBILITY_DECISIONS as Readonly<Record<string, boolean>>)[taskVersionKey] ===
      true &&
    journey.task.targetChildId === 'child_salem' &&
    journey.task.templateId === 'task_recycling_p0_v1' &&
    validateTaskForReview(journey.task).ok &&
    matchesCanonicalP0TaskContent(
      journey.task.content,
      journey.task.acceptedGuideFixtureId === null ? 'retained_parent_action' : 'exact_guide',
    )
  );
}

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

function isFamilyRewardTimestamp(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim() === value &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/u.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function isValidGivenTimestamp(givenAt: unknown, unlockedAt: unknown): givenAt is string {
  return (
    isFamilyRewardTimestamp(givenAt) &&
    isFamilyRewardTimestamp(unlockedAt) &&
    Date.parse(givenAt) >= Date.parse(unlockedAt)
  );
}

function isReconciledRewardOutcome(input: {
  readonly runtime: FamilyRewardRuntime;
  readonly expectedProfileId: SyntheticChildId;
  readonly expectedLandscapeTransition: EligibleLandscapeTransition | null;
  readonly recognitionKey: string;
  readonly committedAt: string;
}): boolean {
  const { runtime, expectedProfileId, expectedLandscapeTransition, recognitionKey, committedAt } =
    input;
  if (!expectedLandscapeTransition) return false;
  const baseline = createFamilyRewardRuntime();
  const lifecycleIsValid =
    isFamilyRewardTimestamp(committedAt) &&
    ((runtime.plan.lifecycle === 'unlocked' && runtime.plan.givenAt === null) ||
      (runtime.plan.lifecycle === 'given' &&
        isValidGivenTimestamp(runtime.plan.givenAt, committedAt)));
  const expectedProgress: FamilyRewardProgressSnapshot = {
    childId: expectedProfileId,
    eligibleSeedDelta: FAMILY_REWARD_TARGET - FAMILY_REWARD_BASELINE,
    recognitionKeys: [recognitionKey],
    eligibleLandscapeTransitions: [expectedLandscapeTransition],
    landscapesCrossingTarget: [],
  };
  const expectedRuntime: FamilyRewardRuntime = {
    ...baseline,
    plan: {
      ...baseline.plan,
      lifecycle: runtime.plan.lifecycle,
      unlockedAt: committedAt,
      givenAt: runtime.plan.lifecycle === 'given' ? runtime.plan.givenAt : null,
    },
    progress: expectedProgress,
  };
  return (
    expectedProfileId === baseline.plan.childId &&
    lifecycleIsValid &&
    sameValue(runtime, expectedRuntime)
  );
}

function isReconciledRecordedRecognition(input: {
  readonly runtime: FamilyRewardRuntime;
  readonly receipt: RecognitionReceipt;
  readonly committedAt: string;
}): boolean {
  const { runtime, receipt, committedAt } = input;
  const seed = receipt.seedTransaction;
  const growth = receipt.landscapeGrowth;
  return (
    seed !== null &&
    growth !== null &&
    seed.recognitionKey === receipt.recognitionKey &&
    seed.childId === runtime.plan.childId &&
    seed.amount === FAMILY_REWARD_TARGET - FAMILY_REWARD_BASELINE &&
    isReconciledRewardOutcome({
      runtime,
      expectedProfileId: seed.childId,
      expectedLandscapeTransition: {
        landscapeId: growth.landscapeId,
        stageBefore: growth.stageBefore,
        stageAfter: growth.stageAfter,
      },
      recognitionKey: receipt.recognitionKey,
      committedAt,
    })
  );
}

export function applyRecognitionToFamilyReward(input: {
  readonly runtime: FamilyRewardRuntime;
  readonly journey: TaskJourney;
  readonly receipt: RecognitionReceipt;
  readonly committedAt: string;
}): FamilyRewardResult<FamilyRewardRuntime> {
  const { runtime, journey, receipt, committedAt } = input;
  if (!isFamilyRewardRecognitionEligible(journey)) {
    return { ok: true, data: runtime };
  }
  if (runtime.progress.recognitionKeys.includes(receipt.recognitionKey)) {
    return isReconciledRecordedRecognition({ runtime, receipt, committedAt })
      ? { ok: true, data: runtime }
      : {
          ok: false,
          error: {
            code: 'INVALID_TRANSITION',
            message: 'Family Reward recognition exists without its reconciled private outcome',
          },
        };
  }
  if (runtime.plan.lifecycle !== 'promised') {
    return {
      ok: false,
      error: {
        code: 'INVALID_TRANSITION',
        message: 'Family Reward lifecycle has no reconciled recognition authority',
      },
    };
  }
  if (!sameValue(runtime, createFamilyRewardRuntime())) {
    return {
      ok: false,
      error: {
        code: 'INVALID_TRANSITION',
        message: 'Family Reward promise does not match its private eligibility baseline',
      },
    };
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
  readonly expectedProfileId: SyntheticChildId;
  readonly expectedLandscapeTransition: EligibleLandscapeTransition | null;
  readonly recognitionKey: string;
  readonly committedAt: string;
}): FamilyRewardResult<FamilyRewardUnlockProjection | null> {
  const {
    before,
    after,
    expectedProfileId,
    expectedLandscapeTransition,
    recognitionKey,
    committedAt,
  } = input;
  if (
    (expectedProfileId !== 'child_salem' && expectedProfileId !== 'child_alya') ||
    recognitionKey.trim().length === 0 ||
    committedAt.trim().length === 0 ||
    before.plan.id !== after.plan.id ||
    before.plan.version !== after.plan.version ||
    before.plan.childId !== after.plan.childId ||
    before.plan.childId !== expectedProfileId ||
    before.progress.childId !== expectedProfileId ||
    after.progress.childId !== expectedProfileId ||
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

  const baseline = createFamilyRewardRuntime();
  if (before.plan.lifecycle === after.plan.lifecycle) {
    const isValidUnchangedAuthority =
      sameValue(before, after) &&
      (before.plan.lifecycle === 'promised'
        ? sameValue(before, baseline)
        : isReconciledRewardOutcome({
            runtime: before,
            expectedProfileId,
            expectedLandscapeTransition,
            recognitionKey,
            committedAt,
          }));
    return isValidUnchangedAuthority
      ? { ok: true, data: null }
      : {
          ok: false,
          error: {
            code: 'INVALID_TRANSITION',
            message: 'Family Reward unchanged state has no reconciled private authority',
          },
        };
  }
  const expectedAfterPlan: FamilyRewardPlan = {
    ...baseline.plan,
    lifecycle: 'unlocked',
    unlockedAt: committedAt,
  };
  const expectedAfterProgress: FamilyRewardProgressSnapshot | null = expectedLandscapeTransition
    ? {
        childId: expectedProfileId,
        eligibleSeedDelta: FAMILY_REWARD_TARGET - FAMILY_REWARD_BASELINE,
        recognitionKeys: [recognitionKey],
        eligibleLandscapeTransitions: [expectedLandscapeTransition],
        landscapesCrossingTarget: [],
      }
    : null;
  const expectedAfterRuntime: FamilyRewardRuntime | null = expectedAfterProgress
    ? { ...baseline, plan: expectedAfterPlan, progress: expectedAfterProgress }
    : null;
  if (
    before.plan.lifecycle !== 'promised' ||
    after.plan.lifecycle !== 'unlocked' ||
    before.plan.unlockedAt !== null ||
    after.plan.unlockedAt !== committedAt ||
    before.plan.givenAt !== null ||
    after.plan.givenAt !== null ||
    expectedAfterRuntime === null ||
    !sameValue(before, baseline) ||
    !sameValue(after, expectedAfterRuntime)
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
