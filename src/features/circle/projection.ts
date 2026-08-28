import { z } from 'zod';

import type {
  CanopyContributionDTO,
  CircleGoal,
  DomainResult,
  GreenCircleEventDTO,
  HouseholdCanopy,
  ProjectionEligibilityContext,
  ProjectionPlan,
  ProjectionRejectionReason,
} from '../../models/familyGrowth';

export const projectionEligibilityContextSchema = z
  .object({
    schemaVersion: z.literal('1.0'),
    categoryId: z.enum([
      'faith_gratitude',
      'roots_kinship',
      'home_responsibility',
      'green_impact',
      'food_hospitality',
      'heritage_etiquette',
      'kindness_community',
      'learning_wellbeing',
    ]),
    recognitionMode: z.enum(['standard', 'fade_first', 'recognition_only']),
    routinePhase: z.enum(['acquisition', 'maintenance', 'not_applicable']),
    visibilityScope: z.enum(['child_guardian', 'household']),
    circleEligible: z.boolean(),
    consequenceKind: z.enum(['rewarded_acquisition', 'maintenance_activity', 'recognition_only']),
    confirmed: z.literal(true),
    prohibitedSharedFieldsPresent: z.literal(false),
  })
  .strict();

const P0_CIRCLE_GOAL = 12;

const seededCircleFixtureSchema = z
  .object({
    eligibleGreenActions: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
    goal: z.literal(P0_CIRCLE_GOAL),
    origin: z.literal('synthetic_local'),
  })
  .strict();

export type ResolvedCircleFixture =
  | {
      readonly status: 'available';
      readonly current: number;
      readonly goal: typeof P0_CIRCLE_GOAL;
      readonly origin: 'synthetic_local';
    }
  | {
      readonly status: 'unavailable';
      readonly goal: typeof P0_CIRCLE_GOAL;
      readonly origin: 'local_fallback';
    };

/**
 * Treat the seeded circle as untrusted display input. Invalid or expanded
 * shapes collapse to constants so no raw or private field can reach the UI.
 */
export function resolveCircleFixture(input: unknown): ResolvedCircleFixture {
  const parsed = seededCircleFixtureSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: 'unavailable',
      goal: P0_CIRCLE_GOAL,
      origin: 'local_fallback',
    };
  }

  return {
    status: 'available',
    current: parsed.data.eligibleGreenActions,
    goal: parsed.data.goal,
    origin: parsed.data.origin,
  };
}

function privacyFailure(message: string): DomainResult<never> {
  return {
    ok: false,
    error: {
      code: 'PRIVACY_REJECTED',
      message,
      retryable: false,
      fallbackAvailable: false,
    },
  };
}

export function validateEligibilityContext(
  input: unknown,
): DomainResult<ProjectionEligibilityContext> {
  const parsed = projectionEligibilityContextSchema.safeParse(input);
  return parsed.success
    ? { ok: true, data: parsed.data }
    : privacyFailure('Shared projection accepts only the strict allowlisted eligibility fields');
}

function validConsequencePair(context: ProjectionEligibilityContext): boolean {
  if (context.consequenceKind === 'recognition_only') {
    return (
      context.recognitionMode === 'recognition_only' && context.routinePhase === 'not_applicable'
    );
  }
  if (context.recognitionMode === 'recognition_only') return false;
  if (context.consequenceKind === 'rewarded_acquisition') {
    return context.routinePhase === 'acquisition';
  }
  return context.routinePhase === 'maintenance';
}

function canopyRejectionFor(
  context: ProjectionEligibilityContext,
): ProjectionRejectionReason | null {
  if (context.recognitionMode === 'recognition_only') return 'recognition_only';
  if (context.visibilityScope === 'child_guardian') return 'private_scope';
  if (context.consequenceKind !== 'rewarded_acquisition') return 'invalid_pairing';
  return null;
}

function circleRejectionFor(
  context: ProjectionEligibilityContext,
): ProjectionRejectionReason | null {
  if (context.recognitionMode === 'recognition_only') return 'recognition_only';
  if (context.visibilityScope === 'child_guardian') return 'private_scope';
  if (context.categoryId !== 'green_impact') return 'non_green_category';
  if (!context.circleEligible) return 'circle_not_eligible';
  return null;
}

export function planAfterConfirmation(
  input: ProjectionEligibilityContext,
): DomainResult<ProjectionPlan> {
  const validated = validateEligibilityContext(input);
  if (!validated.ok) return validated;
  const context = validated.data;

  if (!validConsequencePair(context)) {
    return privacyFailure('Recognition and consequence policy do not match');
  }
  if (
    context.circleEligible &&
    (context.categoryId !== 'green_impact' || context.visibilityScope !== 'household')
  ) {
    return privacyFailure('Circle projection requires household-visible Green Impact activity');
  }

  const canopyRejection = canopyRejectionFor(context);
  const circleRejection = circleRejectionFor(context);
  const canopyContribution: CanopyContributionDTO | null = canopyRejection
    ? null
    : {
        actionKind: 'eligible_household_acquisition',
        leafDelta: 1,
        origin: 'synthetic',
      };
  const circleEvent: GreenCircleEventDTO | null = circleRejection
    ? null
    : {
        actionKind: 'eligible_green_action',
        actionDelta: 1,
        sourceScope: 'household',
        origin: 'synthetic_local',
      };

  return {
    ok: true,
    data: { canopyContribution, circleEvent, canopyRejection, circleRejection },
  };
}

export function applyCanopy(current: HouseholdCanopy, dto: CanopyContributionDTO): HouseholdCanopy {
  return {
    contributionLeaves: current.contributionLeaves + dto.leafDelta,
    goalLeaves: current.goalLeaves,
  };
}

export function applyCircle(current: CircleGoal, dto: GreenCircleEventDTO): CircleGoal {
  return {
    eligibleGreenActions: current.eligibleGreenActions + dto.actionDelta,
    goal: current.goal,
    origin: current.origin,
  };
}
