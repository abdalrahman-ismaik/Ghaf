import type { DomainResult, LocalizedText } from '../../models/familyGrowth';
import type {
  AdaptCoachResultInput,
  AgeAdaptedCoachResult,
  ChildCoachOutputPolicy,
  PreparedCoachMaterial,
} from '../../models/assistantVoice';
import { P0_APPROVED_COACH_BINDING, PREPARED_COACH_MATERIALS } from './preparedContent';

export { PREPARED_COACH_MATERIALS } from './preparedContent';

const outputPolicies: Readonly<Record<ChildCoachOutputPolicy['ageBand'], ChildCoachOutputPolicy>> =
  Object.freeze({
    '6_8': Object.freeze({
      ageBand: '6_8',
      maximumSteps: 1,
      pace: 'slow',
      tone: 'very_short',
      quickChoiceLimit: 0,
      adultExitPlacement: 'early',
    }),
    '9_11': Object.freeze({
      ageBand: '9_11',
      maximumSteps: 3,
      pace: 'standard',
      tone: 'friendly_clear',
      quickChoiceLimit: 3,
      adultExitPlacement: 'persistent',
    }),
    '12_14': Object.freeze({
      ageBand: '12_14',
      maximumSteps: 3,
      pace: 'standard',
      tone: 'respectful_mature',
      quickChoiceLimit: 0,
      adultExitPlacement: 'persistent',
    }),
  });

function failure(message: string): DomainResult<never> {
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

function validLocalizedText(value: LocalizedText): boolean {
  return (
    value.ar.trim().length > 0 &&
    value.en.trim().length > 0 &&
    !/[\r\n]/u.test(value.ar) &&
    !/[\r\n]/u.test(value.en)
  );
}

function validAgeBand(value: unknown): value is ChildCoachOutputPolicy['ageBand'] {
  return value === '6_8' || value === '9_11' || value === '12_14';
}

export function coachOutputPolicyForAgeBand(
  ageBand: ChildCoachOutputPolicy['ageBand'],
): ChildCoachOutputPolicy {
  if (!validAgeBand(ageBand)) {
    throw new RangeError('Coach age band is outside the reviewed policy');
  }
  return { ...outputPolicies[ageBand] };
}

function sameLocalizedText(left: LocalizedText, right: LocalizedText): boolean {
  return left.ar === right.ar && left.en === right.en;
}

function matchesPreparedFixture(material: PreparedCoachMaterial): boolean {
  const fixture = PREPARED_COACH_MATERIALS[material.fixtureId];
  return (
    !!fixture &&
    material.taskId === fixture.taskId &&
    material.approvedTaskVersion === fixture.approvedTaskVersion &&
    material.origin === fixture.origin &&
    material.steps.length === fixture.steps.length &&
    material.steps.every((step, index) => sameLocalizedText(step, fixture.steps[index]!)) &&
    material.quickChoices.length === fixture.quickChoices.length &&
    material.quickChoices.every((choice, index) =>
      sameLocalizedText(choice, fixture.quickChoices[index]!),
    ) &&
    sameLocalizedText(material.adultExit, fixture.adultExit) &&
    sameLocalizedText(material.aiDisclosure, fixture.aiDisclosure)
  );
}

export function adaptPreparedCoachResult(
  input: AdaptCoachResultInput,
): DomainResult<AgeAdaptedCoachResult> {
  const { context, material } = input;
  if (!validAgeBand(context.ageBand)) {
    return failure('Coach age band is outside the reviewed policy');
  }
  if (
    !context.approvedByParent ||
    !['chosen', 'in_progress'].includes(context.lifecycle) ||
    context.childId !== P0_APPROVED_COACH_BINDING.childId ||
    context.taskId !== material.taskId ||
    context.approvedTaskVersion !== material.approvedTaskVersion ||
    context.approvedTaskVersion < 1
  ) {
    return failure('Prepared Coach material is not bound to the active approved task');
  }

  if (
    !matchesPreparedFixture(material) ||
    material.steps.length < 1 ||
    material.steps.length > 4 ||
    !material.steps.every(validLocalizedText) ||
    !material.quickChoices.every(validLocalizedText) ||
    !validLocalizedText(material.adultExit) ||
    !validLocalizedText(material.aiDisclosure)
  ) {
    return failure('Prepared Coach material is incomplete or outside the bounded shape');
  }

  const policy = coachOutputPolicyForAgeBand(context.ageBand);
  const minimumSteps = context.ageBand === '9_11' ? 2 : 1;
  if (material.steps.length < minimumSteps) {
    return failure('Prepared Coach material does not have enough steps for this age band');
  }

  return {
    ok: true,
    data: {
      childId: context.childId,
      ageBand: context.ageBand,
      taskId: context.taskId,
      approvedTaskVersion: context.approvedTaskVersion,
      policy,
      steps: material.steps.slice(0, policy.maximumSteps),
      quickChoices: material.quickChoices.slice(0, policy.quickChoiceLimit),
      adultExit: {
        label: material.adultExit,
        placement: policy.adultExitPlacement,
        alwaysVisible: true,
      },
      aiDisclosure: material.aiDisclosure,
      changesDefinitionOfDone: false,
      origin: 'prepared',
    },
  };
}
