import { awardCompletion, requestRetryWithoutAward } from '../../features/impact/awardCompletion';
import { createDeterministicCoachResponse } from '../../features/ai/policy';
import { coachRequestSchema } from '../../features/ai/validation';
import { transitionLifecycle } from '../../features/missions/lifecycle';
import {
  generatedMissionPayloadSchema,
  missionInputSchema,
  submissionDraftSchema,
} from '../../features/missions/validation';
import type {
  CapabilityOrigin,
  ChildSubmission,
  CoachResponse,
  GeneratedMissionPayload,
  MediaKind,
  MediaReference,
  Mission,
  MissionInput,
  MissionStep,
  PrototypeSession,
} from '../../models/prototype';
import type {
  AIService,
  ApproveCompletionRequest,
  CompletionAward,
  ImpactService,
  MediaService,
  MissionGenerationRequest,
  MissionService,
  PrototypeSessionService,
  ResetResult,
  ServiceRegistry,
  ServiceResult,
} from '../interfaces';
import {
  createInitialPrototypeSession,
  createPregeneratedMissionPayload,
  createPreparedMedia,
} from './fixtures';

function success<T>(data: T, origin: CapabilityOrigin, fallbackUsed = false): ServiceResult<T> {
  return { ok: true, data, meta: { origin, fallbackUsed } };
}

function failure(
  code: 'INVALID_INPUT' | 'NOT_FOUND' | 'INVALID_TRANSITION' | 'INVALID_RESPONSE',
  message: string,
): ServiceResult<never> {
  return {
    ok: false,
    error: {
      code,
      message,
      retryable: false,
      fallbackAvailable: false,
    },
  };
}

function formatArabicPortions(value: number, oblique = false): string {
  if (value === 1) return 'حصة واحدة';
  if (value === 2) return oblique ? 'حصتين' : 'حصتان';
  if (value >= 3 && value <= 10) return `${value} حصص`;
  return `${value} حصة`;
}

function formatArabicMinutes(value: number): string {
  if (value === 1) return 'دقيقة واحدة';
  if (value === 2) return 'دقيقتين';
  if (value >= 3 && value <= 10) return `${value} دقائق`;
  return `${value} دقيقة`;
}

function missionSteps(
  missionId: string,
  payload: GeneratedMissionPayload,
): [MissionStep, MissionStep, MissionStep] {
  return payload.steps.map((step) => ({
    id: `${missionId}:step-${step.order}`,
    order: step.order,
    instruction: { ...step.instruction },
    text: { ...step.instruction },
    completed: false,
  })) as [MissionStep, MissionStep, MissionStep];
}

export class MockMissionService implements MissionService {
  validateInput(input: MissionInput): ServiceResult<MissionInput> {
    const parsed = missionInputSchema.safeParse(input);
    if (!parsed.success) {
      return failure('INVALID_INPUT', parsed.error.issues[0]?.message ?? 'Invalid mission input');
    }
    const preparedMedia = createPreparedMedia();
    const validImage = preparedMedia.some(
      (item) => item.id === input.foodImageId && item.kind === 'food-image',
    );
    const validVoiceNote = preparedMedia.some(
      (item) => item.id === input.voiceNoteId && item.kind === 'family-voice-note',
    );
    if (input.childId !== 'child-salem-demo' || !validImage || !validVoiceNote) {
      return failure(
        'INVALID_INPUT',
        'Mission input must reference the seeded Child and prepared food/voice media',
      );
    }
    return success(input, 'seeded');
  }

  buildReviewMission(
    input: MissionInput,
    payload: GeneratedMissionPayload,
    context: { readonly attemptId: string; readonly origin: CapabilityOrigin },
  ): ServiceResult<Mission> {
    const validInput = this.validateInput(input);
    if (!validInput.ok) return validInput;
    const parsedPayload = generatedMissionPayloadSchema.safeParse(payload);
    if (!parsedPayload.success || !input.childId) {
      return failure(
        'INVALID_RESPONSE',
        parsedPayload.success
          ? 'A selected Child is required'
          : (parsedPayload.error.issues[0]?.message ?? 'Invalid mission payload'),
      );
    }

    const missionId = 'mission-bread-rescue-demo';
    const mission: Mission = {
      id: missionId,
      inputId: input.id,
      version: 1,
      assignedChildId: input.childId,
      title: { ...payload.title },
      story: { ...payload.story },
      steps: missionSteps(missionId, payload),
      reflectionPrompt: { ...payload.reflectionPrompt },
      impactTarget: { ...payload.impactTarget },
      evidenceMethod: payload.evidenceMethod,
      reward: payload.reward ? { ...payload.reward } : null,
      origin: context.origin,
      source: context.origin,
      status: 'parent-review',
      generationAttemptId: context.attemptId,
      approvedByParent: false,
    };

    return success(mission, context.origin);
  }

  approveForChild(mission: Mission): ServiceResult<Mission> {
    if (
      mission.approvedByParent &&
      ['assigned', 'child-in-progress', 'awaiting-parent-confirmation', 'completed'].includes(
        mission.status,
      )
    ) {
      return success(mission, mission.origin);
    }

    const transition = transitionLifecycle(mission.status, 'approve-mission');
    if (!transition.ok) return transition;
    return success({ ...mission, status: transition.data, approvedByParent: true }, mission.origin);
  }

  setStepCompleted(mission: Mission, stepId: string, completed: boolean): ServiceResult<Mission> {
    if (mission.status !== 'child-in-progress' || !mission.approvedByParent) {
      return failure('INVALID_TRANSITION', 'Steps can change only during approved Child work');
    }
    if (!mission.steps.some((step) => step.id === stepId)) {
      return failure('NOT_FOUND', `Mission step ${stepId} was not found`);
    }

    const steps = mission.steps.map((step) =>
      step.id === stepId ? { ...step, completed } : step,
    ) as [MissionStep, MissionStep, MissionStep];
    return success({ ...mission, steps }, mission.origin);
  }

  buildSubmission(
    mission: Mission,
    draft: Parameters<MissionService['buildSubmission']>[1],
    attempt = 1,
  ): ServiceResult<ChildSubmission> {
    if (mission.status !== 'child-in-progress' || !mission.approvedByParent) {
      return failure('INVALID_TRANSITION', 'Only approved Child work can be submitted');
    }
    if (!mission.steps.every((step) => step.completed)) {
      return failure('INVALID_INPUT', 'Complete all three steps before submitting');
    }
    const parsedDraft = submissionDraftSchema.safeParse(draft);
    if (!parsedDraft.success) {
      return failure('INVALID_INPUT', parsedDraft.error.issues[0]?.message ?? 'Invalid submission');
    }

    const completedStepIds = mission.steps.map((step) => step.id) as [string, string, string];
    return success(
      {
        id: `submission-bread-rescue-demo-attempt-${attempt}`,
        missionId: mission.id,
        completedStepIds,
        evidenceMediaId: draft.evidenceMediaId,
        parentConfirmationRequested: draft.parentConfirmationRequested,
        reflection: draft.reflection.trim(),
        attempt,
        status: 'awaiting-parent',
      },
      'seeded',
    );
  }

  requestRetry(
    mission: Mission,
    submission: ChildSubmission,
  ): ServiceResult<{ mission: Mission; submission: ChildSubmission }> {
    const result = requestRetryWithoutAward(mission, submission);
    if (!result.ok) return result;
    return success({ mission: result.data.mission, submission: result.data.submission }, 'seeded');
  }
}

export class MockMediaService implements MediaService {
  async listPrepared(kind: MediaKind): Promise<ServiceResult<readonly MediaReference[]>> {
    const media = createPreparedMedia().filter((item) => item.kind === kind);
    return success(media, 'prepared');
  }

  async getPrepared(id: string): Promise<ServiceResult<MediaReference>> {
    const media = createPreparedMedia().find((item) => item.id === id);
    return media
      ? success(media, 'prepared')
      : failure('NOT_FOUND', `Prepared media ${id} not found`);
  }

  async playAudio(id: string): Promise<ServiceResult<{ durationMs: number }>> {
    const result = await this.getPrepared(id);
    if (!result.ok) return result;
    if (!['family-voice-note', 'narration'].includes(result.data.kind)) {
      return failure('INVALID_INPUT', `Prepared media ${id} is not audio`);
    }
    return success({ durationMs: result.data.durationMs ?? 0 }, 'prepared');
  }
}

export class MockAIService implements AIService {
  async generateMission(
    request: MissionGenerationRequest,
  ): Promise<ServiceResult<GeneratedMissionPayload>> {
    const validInput = missionInputSchema.safeParse(request.input);
    if (!validInput.success || request.child.id !== 'child-salem-demo') {
      return failure('INVALID_INPUT', 'The mock mission request has invalid demo context');
    }

    const payload = createPregeneratedMissionPayload();
    const quantity = request.input.quantity;
    if (!quantity) {
      return failure('INVALID_INPUT', 'A labeled quantity is required');
    }
    const quantityAr =
      quantity.unit === 'grams'
        ? `${quantity.value} غرامًا`
        : formatArabicPortions(quantity.value, true);
    const stepQuantityAr = quantity.unit === 'grams' ? `كمية ${quantityAr}` : quantityAr;
    const foodSituationAr =
      quantity.unit === 'grams'
        ? `خبز إضافي بعد الغداء، بكمية تقديرية ${quantityAr}.`
        : `خبز إضافي بعد الغداء، بكمية تقديرية تعادل ${quantityAr}.`;
    const quantityEn = `${quantity.value} ${
      quantity.unit === 'grams'
        ? quantity.value === 1
          ? 'gram'
          : 'grams'
        : quantity.value === 1
          ? 'portion'
          : 'portions'
    }`;
    const customizedPayload: GeneratedMissionPayload = {
      ...payload,
      story: {
        ar: `تذكّرت عائلة سالم أن النعمة تكبر حين نحفظها ونشاركها. بقي خبز إضافي بعد الغداء. خلال ${formatArabicMinutes(request.input.availableMinutes)}، سيعمل سالم مع وليّ أمره على استخدامه بطريقة جديدة وإنقاذ نحو ${quantityAr} من الهدر.`,
        en: `Salem's family remembered that caring for food helps a blessing grow. Extra bread remained after lunch. In ${request.input.availableMinutes} ${request.input.availableMinutes === 1 ? 'minute' : 'minutes'}, Salem and a Parent will give it a new purpose and keep about ${quantityEn} from going to waste.`,
      },
      steps: [
        {
          ...payload.steps[0],
          instruction: {
            ar: `اطلب من وليّ أمرك اختيار الخبز المناسب للمهمة، ثم ضع ${stepQuantityAr} في طبق نظيف.`,
            en: `Ask a Parent to choose bread suitable for this mission, then place ${quantityEn} on a clean plate.`,
          },
        },
        payload.steps[1],
        payload.steps[2],
      ],
      impactTarget: { ...quantity },
      reward: request.input.reward ? { ...request.input.reward } : null,
      personalization: {
        ...payload.personalization,
        foodSituation: {
          ar: foodSituationAr,
          en: `Extra bread after lunch, estimated at ${quantityEn}.`,
        },
        availableMinutes: request.input.availableMinutes,
      },
    };

    return success(customizedPayload, 'pregenerated-mock');
  }

  async respondToCoach(
    request: Parameters<AIService['respondToCoach']>[0],
  ): Promise<ServiceResult<CoachResponse>> {
    const parsed = coachRequestSchema.safeParse(request);
    if (!parsed.success) {
      return failure(
        'INVALID_INPUT',
        parsed.error.issues[0]?.message ?? 'The mock Coach request is invalid',
      );
    }
    return success(createDeterministicCoachResponse(request), 'pregenerated-mock');
  }
}

export class MockImpactService implements ImpactService {
  approveCompletion(
    request: ApproveCompletionRequest,
    existingRecords: Parameters<ImpactService['approveCompletion']>[1],
  ): ServiceResult<CompletionAward> {
    return awardCompletion(request, existingRecords);
  }
}

export class MockPrototypeSessionService implements PrototypeSessionService {
  getInitialSession(): PrototypeSession {
    return createInitialPrototypeSession();
  }

  reset(): ResetResult {
    return { session: createInitialPrototypeSession(), navigateTo: '/parent' };
  }
}

export function createMockServiceRegistry(): ServiceRegistry {
  return {
    mission: new MockMissionService(),
    media: new MockMediaService(),
    ai: new MockAIService(),
    impact: new MockImpactService(),
    prototypeSession: new MockPrototypeSessionService(),
  };
}
