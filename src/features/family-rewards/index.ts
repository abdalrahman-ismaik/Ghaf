import { z } from 'zod';

import type {
  EligibleLandscapeTransition,
  FamilyRewardEligibilityEvent,
  FamilyRewardErrorCode,
  FamilyRewardEvaluation,
  FamilyRewardGivenResult,
  FamilyRewardMilestone,
  FamilyRewardPlan,
  FamilyRewardProgressSnapshot,
  FamilyRewardResult,
  FamilyRewardRevision,
  FamilyRewardViewer,
  GiveFamilyRewardInput,
  MonetaryCommitmentRequest,
  MonetaryCommitmentSummary,
  PrivateFamilyRewardView,
  ReviseFamilyRewardPlanInput,
} from '../../models/familyReward';

const childIdSchema = z.enum(['child_salem', 'child_alya']);
const categoryIdSchema = z.enum([
  'faith_gratitude',
  'roots_kinship',
  'home_responsibility',
  'green_impact',
  'food_hospitality',
  'heritage_etiquette',
  'kindness_community',
  'learning_wellbeing',
]);
const landscapeIdSchema = z.enum(['ghaf', 'samar', 'sidr', 'date_palm', 'mangrove']);
const gardenStageSchema = z.enum(['seed', 'shoot', 'sapling', 'shade', 'flourishing']);
const rewardMilestoneStageSchema = z.enum(['shoot', 'sapling', 'shade', 'flourishing']);
const recognitionModeSchema = z.enum(['standard', 'fade_first', 'recognition_only']);
const routinePhaseSchema = z.enum(['acquisition', 'maintenance', 'not_applicable']);
const isoTimestampSchema = z
  .string()
  .trim()
  .min(1)
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/u,
    'Expected an ISO timestamp',
  )
  .refine((value) => Number.isFinite(Date.parse(value)), 'Expected an ISO timestamp');
const monthSchema = z.string().regex(/^\d{4}-(?:0[1-9]|1[0-2])$/u);
const localizedTextSchema = z
  .object({
    ar: z.string().trim().min(1),
    en: z.string().trim().min(1),
  })
  .strict();

const moneyPromiseSchema = z
  .object({
    kind: z.literal('money'),
    label: localizedTextSchema,
    currency: z.string().regex(/^[A-Z]{3}$/u),
    amountMinor: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  })
  .strict();

const nonMoneyPromiseSchema = z
  .object({
    kind: z.enum(['experience', 'privilege', 'gift']),
    label: localizedTextSchema,
  })
  .strict();

const promiseSchema = z.union([moneyPromiseSchema, nonMoneyPromiseSchema]);

const milestoneSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('eligible_seed_delta'),
      requiredSeedDelta: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
    })
    .strict(),
  z
    .object({
      kind: z.literal('landscape_stage'),
      landscapeId: landscapeIdSchema,
      targetStage: rewardMilestoneStageSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal('landscapes_at_stage'),
      targetStage: rewardMilestoneStageSchema,
      requiredCount: z.number().int().min(1).max(5),
    })
    .strict(),
]);

const draftSchema = z
  .object({
    id: z.string().trim().min(1),
    childId: childIdSchema,
    guardianIds: z.array(z.string().trim().min(1)).min(1),
    createdByGuardianId: z.string().trim().min(1),
    month: monthSchema,
    promisedAt: isoTimestampSchema,
    promise: promiseSchema,
    milestone: milestoneSchema,
  })
  .strict();

const planSchema = draftSchema
  .extend({
    version: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
    previousVersion: z.number().int().positive().max(Number.MAX_SAFE_INTEGER).nullable(),
    versionState: z.enum(['current', 'superseded']),
    supersededAt: isoTimestampSchema.nullable(),
    lifecycle: z.enum(['promised', 'unlocked', 'given']),
    privacy: z.literal('child_guardians_only'),
    unlockedAt: isoTimestampSchema.nullable(),
    givenAt: isoTimestampSchema.nullable(),
  })
  .strict();

const eligibilityEventSchema = z
  .object({
    id: z.string().trim().min(1),
    recognitionKey: z.string().trim().min(1),
    childId: childIdSchema,
    categoryId: categoryIdSchema,
    activityKind: z.enum([
      'general',
      'faith',
      'affection',
      'emotional_disclosure',
      'eating',
      'demonstrating_love',
      'private_wellbeing',
    ]),
    recognitionMode: recognitionModeSchema,
    routinePhase: routinePhaseSchema,
    eligibleSeedDelta: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
    landscapeTransition: z
      .object({
        landscapeId: landscapeIdSchema,
        stageBefore: gardenStageSchema,
        stageAfter: gardenStageSchema,
      })
      .strict(),
    occurredAt: isoTimestampSchema,
    prerequisites: z
      .object({
        parentConfirmationRecorded: z.boolean(),
        praisePresented: z.boolean(),
        gardenRecognitionApplied: z.boolean(),
      })
      .strict(),
  })
  .strict();

const evaluationOptionsSchema = z
  .object({
    evaluatedAt: isoTimestampSchema,
  })
  .strict();

const giveInputSchema = z
  .object({
    guardianId: z.string().trim().min(1),
    givenAt: isoTimestampSchema,
  })
  .strict();

const revisionInputSchema = z
  .object({
    guardianId: z.string().trim().min(1),
    expectedVersion: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
    revisedAt: isoTimestampSchema,
    month: monthSchema,
    promise: promiseSchema,
    milestone: milestoneSchema,
  })
  .strict();

const viewerSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('child'), childId: childIdSchema }).strict(),
  z.object({ kind: z.literal('guardian'), guardianId: z.string().trim().min(1) }).strict(),
]);

const commitmentRequestSchema = z
  .object({
    guardianId: z.string().trim().min(1),
  })
  .strict();

const STAGE_ORDER = {
  seed: 0,
  shoot: 1,
  sapling: 2,
  shade: 3,
  flourishing: 4,
} as const;

const ELIGIBLE_SEED_AMOUNTS = new Set([4, 6, 8, 12, 15]);
const PROTECTED_ACTIVITY_KINDS = new Set([
  'faith',
  'affection',
  'emotional_disclosure',
  'eating',
  'demonstrating_love',
  'private_wellbeing',
]);

function failure<T>(code: FamilyRewardErrorCode, message: string): FamilyRewardResult<T> {
  return { ok: false, error: { code, message } };
}

function parsePlan(input: unknown): FamilyRewardResult<FamilyRewardPlan> {
  const parsed = planSchema.safeParse(input);
  if (!parsed.success) return failure('INVALID_INPUT', 'Family Reward plan is invalid');
  if (new Set(parsed.data.guardianIds).size !== parsed.data.guardianIds.length) {
    return failure('INVALID_INPUT', 'Family Reward guardians must be unique');
  }
  if (!parsed.data.guardianIds.includes(parsed.data.createdByGuardianId)) {
    return failure('INVALID_INPUT', 'Creating guardian must remain an authorized guardian');
  }
  if (parsed.data.version === 1 && parsed.data.previousVersion !== null) {
    return failure(
      'INVALID_INPUT',
      'First Family Reward version cannot reference an older version',
    );
  }
  if (parsed.data.version > 1 && parsed.data.previousVersion !== parsed.data.version - 1) {
    return failure('INVALID_INPUT', 'Family Reward versions must remain consecutive');
  }
  if (
    (parsed.data.versionState === 'current' && parsed.data.supersededAt !== null) ||
    (parsed.data.versionState === 'superseded' && parsed.data.supersededAt === null)
  ) {
    return failure('INVALID_INPUT', 'Family Reward version state is inconsistent');
  }
  if (
    (parsed.data.lifecycle === 'promised' &&
      (parsed.data.unlockedAt !== null || parsed.data.givenAt !== null)) ||
    (parsed.data.lifecycle === 'unlocked' &&
      (parsed.data.unlockedAt === null || parsed.data.givenAt !== null)) ||
    (parsed.data.lifecycle === 'given' &&
      (parsed.data.unlockedAt === null || parsed.data.givenAt === null))
  ) {
    return failure('INVALID_INPUT', 'Family Reward lifecycle timestamps are inconsistent');
  }
  const promisedAt = Date.parse(parsed.data.promisedAt);
  if (
    (parsed.data.unlockedAt !== null && Date.parse(parsed.data.unlockedAt) < promisedAt) ||
    (parsed.data.givenAt !== null &&
      parsed.data.unlockedAt !== null &&
      Date.parse(parsed.data.givenAt) < Date.parse(parsed.data.unlockedAt)) ||
    (parsed.data.supersededAt !== null && Date.parse(parsed.data.supersededAt) < promisedAt) ||
    (parsed.data.versionState === 'superseded' && parsed.data.lifecycle !== 'promised')
  ) {
    return failure('INVALID_INPUT', 'Family Reward timeline is inconsistent');
  }
  return { ok: true, data: parsed.data as FamilyRewardPlan };
}

function isAuthorizedGuardian(plan: FamilyRewardPlan, guardianId: string): boolean {
  return plan.guardianIds.includes(guardianId);
}

function emptyProgress(plan: FamilyRewardPlan): FamilyRewardProgressSnapshot {
  return {
    childId: plan.childId,
    eligibleSeedDelta: 0,
    recognitionKeys: [],
    eligibleLandscapeTransitions: [],
    landscapesCrossingTarget: [],
  };
}

function stageCrossed(transition: EligibleLandscapeTransition, target: keyof typeof STAGE_ORDER) {
  return (
    STAGE_ORDER[transition.stageBefore] < STAGE_ORDER[target] &&
    STAGE_ORDER[transition.stageAfter] >= STAGE_ORDER[target]
  );
}

function milestoneTargetStage(milestone: FamilyRewardMilestone) {
  return milestone.kind === 'eligible_seed_delta' ? null : milestone.targetStage;
}

function milestoneReached(
  milestone: FamilyRewardMilestone,
  progress: FamilyRewardProgressSnapshot,
): boolean {
  if (milestone.kind === 'eligible_seed_delta') {
    return progress.eligibleSeedDelta >= milestone.requiredSeedDelta;
  }
  if (milestone.kind === 'landscape_stage') {
    return progress.eligibleLandscapeTransitions.some(
      (transition) =>
        transition.landscapeId === milestone.landscapeId &&
        stageCrossed(transition, milestone.targetStage),
    );
  }
  return progress.landscapesCrossingTarget.length >= milestone.requiredCount;
}

export function createFamilyRewardPlan(input: unknown): FamilyRewardResult<FamilyRewardPlan> {
  const parsed = draftSchema.safeParse(input);
  if (!parsed.success) return failure('INVALID_INPUT', 'Family Reward draft is invalid');
  if (new Set(parsed.data.guardianIds).size !== parsed.data.guardianIds.length) {
    return failure('INVALID_INPUT', 'Family Reward guardians must be unique');
  }
  if (!parsed.data.guardianIds.includes(parsed.data.createdByGuardianId)) {
    return failure('NOT_AUTHORIZED', 'Only a listed guardian can create this private promise');
  }

  return {
    ok: true,
    data: {
      ...parsed.data,
      version: 1,
      previousVersion: null,
      versionState: 'current',
      supersededAt: null,
      lifecycle: 'promised',
      privacy: 'child_guardians_only',
      unlockedAt: null,
      givenAt: null,
    } as FamilyRewardPlan,
  };
}

export function validateFamilyRewardEligibilityEvent(
  planInput: unknown,
  eventInput: unknown,
): FamilyRewardResult<FamilyRewardEligibilityEvent> {
  const parsedPlan = parsePlan(planInput);
  if (!parsedPlan.ok) return parsedPlan;
  const parsedEvent = eligibilityEventSchema.safeParse(eventInput);
  if (!parsedEvent.success)
    return failure('INVALID_INPUT', 'Family Reward eligibility event is invalid');
  const plan = parsedPlan.data;
  const event = parsedEvent.data;

  if (event.childId !== plan.childId) {
    return failure('WRONG_CHILD', 'Family Reward progress must belong to the promised Child');
  }
  if (
    event.categoryId === 'faith_gratitude' ||
    event.recognitionMode === 'recognition_only' ||
    event.routinePhase !== 'acquisition' ||
    PROTECTED_ACTIVITY_KINDS.has(event.activityKind)
  ) {
    return failure('PROTECTED_ACTIVITY', 'Protected or recognition-only activity is not eligible');
  }
  if (!ELIGIBLE_SEED_AMOUNTS.has(event.eligibleSeedDelta)) {
    return failure('INVALID_INPUT', 'Eligibility requires one fixed acquisition Seed award');
  }
  if (
    !event.prerequisites.parentConfirmationRecorded ||
    !event.prerequisites.praisePresented ||
    !event.prerequisites.gardenRecognitionApplied
  ) {
    return failure(
      'PREREQUISITE_NOT_MET',
      'Parent confirmation, praise, and Garden recognition must happen before eligibility',
    );
  }
  if (
    STAGE_ORDER[event.landscapeTransition.stageAfter] <
    STAGE_ORDER[event.landscapeTransition.stageBefore]
  ) {
    return failure('INVALID_INPUT', 'Eligible landscape progress cannot move backwards');
  }

  return { ok: true, data: event as FamilyRewardEligibilityEvent };
}

export function evaluateFamilyRewardPlan(
  planInput: unknown,
  eventInputs: readonly unknown[],
  optionsInput: unknown,
): FamilyRewardResult<FamilyRewardEvaluation> {
  const parsedPlan = parsePlan(planInput);
  if (!parsedPlan.ok) return parsedPlan;
  const parsedOptions = evaluationOptionsSchema.safeParse(optionsInput);
  if (!parsedOptions.success) return failure('INVALID_INPUT', 'Evaluation time is invalid');
  const plan = parsedPlan.data;

  if (plan.versionState !== 'current') {
    return failure('INVALID_TRANSITION', 'A superseded Family Reward version cannot unlock');
  }
  const evaluatedAt = Date.parse(parsedOptions.data.evaluatedAt);
  if (evaluatedAt < Date.parse(plan.promisedAt)) {
    return failure('INVALID_INPUT', 'Evaluation time cannot precede the promise');
  }
  if (plan.lifecycle === 'given' || plan.lifecycle === 'unlocked') {
    return {
      ok: true,
      data: {
        disposition: plan.lifecycle === 'given' ? 'already_given' : 'already_unlocked',
        plan,
        progress: emptyProgress(plan),
      },
    };
  }

  const uniqueEvents = new Map<string, FamilyRewardEligibilityEvent>();
  for (const input of eventInputs) {
    const validated = validateFamilyRewardEligibilityEvent(plan, input);
    if (!validated.ok) return validated;
    if (!uniqueEvents.has(validated.data.recognitionKey)) {
      uniqueEvents.set(validated.data.recognitionKey, validated.data);
    }
  }

  const eligibleEvents = [...uniqueEvents.values()].filter(
    (item) =>
      Date.parse(item.occurredAt) >= Date.parse(plan.promisedAt) &&
      Date.parse(item.occurredAt) <= evaluatedAt,
  );
  let eligibleSeedDelta = 0;
  for (const item of eligibleEvents) {
    eligibleSeedDelta += item.eligibleSeedDelta;
    if (!Number.isSafeInteger(eligibleSeedDelta)) {
      return failure('INVALID_INPUT', 'Eligible Seed total exceeds supported range');
    }
  }

  const targetStage = milestoneTargetStage(plan.milestone);
  const landscapesCrossingTarget = targetStage
    ? [
        ...new Set(
          eligibleEvents
            .map((item) => item.landscapeTransition)
            .filter((transition) => stageCrossed(transition, targetStage))
            .map((transition) => transition.landscapeId),
        ),
      ].sort()
    : [];
  const progress: FamilyRewardProgressSnapshot = {
    childId: plan.childId,
    eligibleSeedDelta,
    recognitionKeys: eligibleEvents.map((item) => item.recognitionKey),
    eligibleLandscapeTransitions: eligibleEvents.map((item) => item.landscapeTransition),
    landscapesCrossingTarget,
  };

  if (!milestoneReached(plan.milestone, progress)) {
    return { ok: true, data: { disposition: 'not_reached', plan, progress } };
  }
  return {
    ok: true,
    data: {
      disposition: 'unlocked',
      plan: {
        ...plan,
        lifecycle: 'unlocked',
        unlockedAt: parsedOptions.data.evaluatedAt,
      },
      progress,
    },
  };
}

export function markFamilyRewardGiven(
  planInput: unknown,
  input: GiveFamilyRewardInput,
): FamilyRewardResult<FamilyRewardGivenResult> {
  const parsedPlan = parsePlan(planInput);
  if (!parsedPlan.ok) return parsedPlan;
  const parsedInput = giveInputSchema.safeParse(input);
  if (!parsedInput.success) return failure('INVALID_INPUT', 'Given action is invalid');
  const plan = parsedPlan.data;

  if (!isAuthorizedGuardian(plan, parsedInput.data.guardianId)) {
    return failure('NOT_AUTHORIZED', 'Only a matching guardian can mark this promise given');
  }
  if (plan.versionState !== 'current') {
    return failure('INVALID_TRANSITION', 'A superseded Family Reward version cannot be given');
  }
  if (plan.lifecycle === 'given') {
    return { ok: true, data: { disposition: 'already_given', plan } };
  }
  if (plan.lifecycle !== 'unlocked' || plan.unlockedAt === null) {
    return failure('INVALID_TRANSITION', 'Only an unlocked Family Reward can be given');
  }
  if (Date.parse(parsedInput.data.givenAt) < Date.parse(plan.unlockedAt)) {
    return failure('INVALID_INPUT', 'Given time cannot precede unlock time');
  }

  return {
    ok: true,
    data: {
      disposition: 'given',
      plan: { ...plan, lifecycle: 'given', givenAt: parsedInput.data.givenAt },
    },
  };
}

export function reviseFamilyRewardPlan(
  planInput: unknown,
  input: ReviseFamilyRewardPlanInput,
): FamilyRewardResult<FamilyRewardRevision> {
  const parsedPlan = parsePlan(planInput);
  if (!parsedPlan.ok) return parsedPlan;
  const parsedInput = revisionInputSchema.safeParse(input);
  if (!parsedInput.success) return failure('INVALID_INPUT', 'Family Reward revision is invalid');
  const plan = parsedPlan.data;

  if (!isAuthorizedGuardian(plan, parsedInput.data.guardianId)) {
    return failure('NOT_AUTHORIZED', 'Only a matching guardian can revise this private promise');
  }
  if (plan.lifecycle !== 'promised') {
    return failure('IMMUTABLE_UNLOCKED_PLAN', 'Unlocked or given milestones cannot be revised');
  }
  if (plan.versionState !== 'current') {
    return failure('STALE_VERSION', 'Superseded Family Reward versions cannot be revised');
  }
  if (plan.version !== parsedInput.data.expectedVersion) {
    return failure('STALE_VERSION', 'Family Reward version does not match');
  }
  if (Date.parse(parsedInput.data.revisedAt) < Date.parse(plan.promisedAt)) {
    return failure('INVALID_INPUT', 'A revision cannot precede the current promise');
  }

  const created = createFamilyRewardPlan({
    id: plan.id,
    childId: plan.childId,
    guardianIds: plan.guardianIds,
    createdByGuardianId: parsedInput.data.guardianId,
    month: parsedInput.data.month,
    promisedAt: parsedInput.data.revisedAt,
    promise: parsedInput.data.promise,
    milestone: parsedInput.data.milestone,
  });
  if (!created.ok) return created;

  return {
    ok: true,
    data: {
      priorVersion: {
        ...plan,
        versionState: 'superseded',
        supersededAt: parsedInput.data.revisedAt,
      },
      revisedPlan: {
        ...created.data,
        version: plan.version + 1,
        previousVersion: plan.version,
      },
    },
  };
}

export function projectFamilyRewardPlan(
  planInput: unknown,
  viewerInput: FamilyRewardViewer,
): FamilyRewardResult<PrivateFamilyRewardView> {
  const parsedPlan = parsePlan(planInput);
  if (!parsedPlan.ok) return parsedPlan;
  const parsedViewer = viewerSchema.safeParse(viewerInput);
  if (!parsedViewer.success) return failure('INVALID_INPUT', 'Family Reward viewer is invalid');
  const plan = parsedPlan.data;
  const viewer = parsedViewer.data;
  const authorized =
    (viewer.kind === 'child' && viewer.childId === plan.childId) ||
    (viewer.kind === 'guardian' && isAuthorizedGuardian(plan, viewer.guardianId));
  if (!authorized) {
    return failure('NOT_AUTHORIZED', 'Family Reward is private to its Child and guardians');
  }

  return {
    ok: true,
    data: {
      id: plan.id,
      version: plan.version,
      childId: plan.childId,
      lifecycle: plan.lifecycle,
      month: plan.month,
      promise: plan.promise,
      milestone: plan.milestone,
      promisedAt: plan.promisedAt,
      unlockedAt: plan.unlockedAt,
      givenAt: plan.givenAt,
      privacy: plan.privacy,
    },
  };
}

export function summarizeMonthlyMonetaryCommitments(
  planInputs: readonly unknown[],
  requestInput: MonetaryCommitmentRequest,
): FamilyRewardResult<readonly MonetaryCommitmentSummary[]> {
  const parsedRequest = commitmentRequestSchema.safeParse(requestInput);
  if (!parsedRequest.success) return failure('INVALID_INPUT', 'Commitment request is invalid');
  const latestByPlan = new Map<string, FamilyRewardPlan>();

  for (const input of planInputs) {
    const parsed = parsePlan(input);
    if (!parsed.ok) return parsed;
    const plan = parsed.data;
    if (!isAuthorizedGuardian(plan, parsedRequest.data.guardianId)) continue;
    const current = latestByPlan.get(plan.id);
    const lifecycleOrder = { promised: 0, unlocked: 1, given: 2 } as const;
    const versionStateOrder = { current: 0, superseded: 1 } as const;
    if (
      !current ||
      plan.version > current.version ||
      (plan.version === current.version &&
        (lifecycleOrder[plan.lifecycle] > lifecycleOrder[current.lifecycle] ||
          (lifecycleOrder[plan.lifecycle] === lifecycleOrder[current.lifecycle] &&
            versionStateOrder[plan.versionState] > versionStateOrder[current.versionState])))
    ) {
      latestByPlan.set(plan.id, plan);
    }
  }

  const groups = new Map<string, MonetaryCommitmentSummary>();
  for (const plan of latestByPlan.values()) {
    if (
      plan.versionState !== 'current' ||
      plan.lifecycle === 'given' ||
      plan.promise.kind !== 'money'
    ) {
      continue;
    }
    const key = `${plan.month}:${plan.promise.currency}`;
    const current = groups.get(key);
    const totalAmountMinor = (current?.totalAmountMinor ?? 0) + plan.promise.amountMinor;
    if (!Number.isSafeInteger(totalAmountMinor)) {
      return failure('INVALID_INPUT', 'Monthly monetary commitment exceeds supported range');
    }
    groups.set(key, {
      month: plan.month,
      currency: plan.promise.currency,
      totalAmountMinor,
      planCount: (current?.planCount ?? 0) + 1,
    });
  }

  return {
    ok: true,
    data: [...groups.values()].sort(
      (left, right) =>
        left.month.localeCompare(right.month) || left.currency.localeCompare(right.currency),
    ),
  };
}
