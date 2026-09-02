import { beforeEach, describe, expect, it } from 'vitest';

import {
  generatedMissionPayloadSchema,
  missionInputSchema,
  submissionDraftSchema,
} from '../src/features/missions/validation';
import { transitionLifecycle } from '../src/features/missions/lifecycle';
import { generateMissionWithFallback } from '../src/features/missions/generateMission';
import {
  createDemoMissionInput,
  createPregeneratedMissionPayload,
} from '../src/services/mock/fixtures';
import { MockAIService } from '../src/services/mock';
import { serviceRegistry } from '../src/services';
import type { AIService, ServiceResult } from '../src/services/interfaces';
import type { GeneratedMissionPayload } from '../src/models/prototype';
import { usePrototypeStore } from '../src/state/usePrototypeStore';

const unsupportedCoach: AIService['respondToCoach'] = async () => {
  throw new Error('Coach is not used by this mission-provider test double');
};

describe('mission input and payload validation', () => {
  it('requires Child, prepared media, a labeled bounded quantity, and bounded time', () => {
    const valid = createDemoMissionInput();

    expect(missionInputSchema.safeParse(valid).success).toBe(true);
    expect(missionInputSchema.safeParse({ ...valid, childId: null }).success).toBe(false);
    expect(missionInputSchema.safeParse({ ...valid, foodImageId: null }).success).toBe(false);
    expect(missionInputSchema.safeParse({ ...valid, voiceNoteId: null }).success).toBe(false);
    expect(
      missionInputSchema.safeParse({ ...valid, quantity: { value: 0, unit: 'grams' } }).success,
    ).toBe(false);
    expect(
      missionInputSchema.safeParse({ ...valid, quantity: { value: 5_001, unit: 'grams' } }).success,
    ).toBe(false);
    expect(
      missionInputSchema.safeParse({ ...valid, quantity: { value: 21, unit: 'portions' } }).success,
    ).toBe(false);
    expect(missionInputSchema.safeParse({ ...valid, availableMinutes: 61 }).success).toBe(false);
    expect(
      serviceRegistry.mission.validateInput({ ...valid, childId: 'unknown-child' }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(
      serviceRegistry.mission.validateInput({ ...valid, foodImageId: 'family-wisdom-ar' }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(
      serviceRegistry.mission.validateInput({ ...valid, voiceNoteId: 'food-rescue-bread' }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
  });

  it('requires bilingual content and exactly three ordered steps', () => {
    const payload = createPregeneratedMissionPayload();

    expect(generatedMissionPayloadSchema.safeParse(payload).success).toBe(true);
    expect(
      generatedMissionPayloadSchema.safeParse({ ...payload, steps: payload.steps.slice(0, 2) })
        .success,
    ).toBe(false);
    expect(
      generatedMissionPayloadSchema.safeParse({
        ...payload,
        title: { ...payload.title, ar: '  ' },
      }).success,
    ).toBe(false);
  });

  it('requires a reflection and exactly one offline evidence path before submission', () => {
    expect(
      submissionDraftSchema.safeParse({
        evidenceMediaId: 'prepared-evidence-bread-demo',
        parentConfirmationRequested: false,
        reflection: 'تعلمت أن أحفظ النعمة.',
      }).success,
    ).toBe(true);
    expect(
      submissionDraftSchema.safeParse({
        evidenceMediaId: null,
        parentConfirmationRequested: false,
        reflection: 'Complete',
      }).success,
    ).toBe(false);
    expect(
      submissionDraftSchema.safeParse({
        evidenceMediaId: 'prepared-evidence-bread-demo',
        parentConfirmationRequested: true,
        reflection: 'Complete',
      }).success,
    ).toBe(false);
  });
});

describe('guarded mission lifecycle', () => {
  it('permits only reviewed transitions and rejects skipped states', () => {
    expect(transitionLifecycle('draft-input', 'start-generation')).toMatchObject({
      ok: true,
      data: 'generating',
    });
    expect(transitionLifecycle('generating', 'generation-succeeded')).toMatchObject({
      ok: true,
      data: 'parent-review',
    });
    expect(transitionLifecycle('parent-review', 'approve-mission')).toMatchObject({
      ok: true,
      data: 'assigned',
    });
    expect(transitionLifecycle('assigned', 'open-child-mission')).toMatchObject({
      ok: true,
      data: 'child-in-progress',
    });
    expect(transitionLifecycle('child-in-progress', 'submit-for-confirmation')).toMatchObject({
      ok: true,
      data: 'awaiting-parent-confirmation',
    });
    expect(transitionLifecycle('awaiting-parent-confirmation', 'request-retry')).toMatchObject({
      ok: true,
      data: 'child-in-progress',
    });
    expect(transitionLifecycle('awaiting-parent-confirmation', 'approve-completion')).toMatchObject(
      {
        ok: true,
        data: 'completed',
      },
    );
    expect(transitionLifecycle('draft-input', 'approve-mission')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
  });

  it('returns review to the preserved input and never assigns without explicit approval', async () => {
    usePrototypeStore.getState().resetDemo();
    usePrototypeStore.getState().applyDemoInput();
    expect(usePrototypeStore.getState().startGeneration().ok).toBe(true);
    expect((await usePrototypeStore.getState().completeGeneration()).ok).toBe(true);
    const reviewedInput = usePrototypeStore.getState().missionInput;

    expect(usePrototypeStore.getState().activeMission).toMatchObject({
      status: 'parent-review',
      approvedByParent: false,
    });
    expect(usePrototypeStore.getState().openChildMission()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState().editMission()).toMatchObject({ ok: true });
    expect(usePrototypeStore.getState()).toMatchObject({
      journeyStatus: 'draft-input',
      missionInput: reviewedInput,
      activeMission: { version: 1, status: 'draft-input', approvedByParent: false },
    });

    expect(usePrototypeStore.getState().startGeneration()).toMatchObject({ ok: true });
    expect(usePrototypeStore.getState().activeMission).toMatchObject({
      version: 1,
      approvedByParent: false,
    });
    await expect(usePrototypeStore.getState().completeGeneration()).resolves.toMatchObject({
      ok: true,
      data: { version: 2, status: 'parent-review', approvedByParent: false },
    });
    const firstApproval = usePrototypeStore.getState().approveMission();
    const repeatedApproval = usePrototypeStore.getState().approveMission();
    expect(firstApproval).toMatchObject({
      ok: true,
      data: { status: 'assigned', approvedByParent: true },
    });
    expect(repeatedApproval).toEqual(firstApproval);
  });

  it('keeps one attempt and the original input when a provider uses mock fallback', async () => {
    const input = createDemoMissionInput();
    const failingService: AIService = {
      respondToCoach: unsupportedCoach,
      generateMission: async (): Promise<ServiceResult<GeneratedMissionPayload>> => ({
        ok: false,
        error: {
          code: 'REMOTE_UNAVAILABLE',
          message: 'Synthetic provider outage',
          retryable: true,
          fallbackAvailable: true,
        },
      }),
    };

    const result = await generateMissionWithFallback({
      input,
      attemptId: 'generation-attempt-demo-1',
      child: { id: 'child-salem-demo', ageBand: '8-10' },
      primaryService: failingService,
      fallbackService: new MockAIService(),
    });

    expect(result).toMatchObject({
      ok: true,
      data: {
        attemptId: 'generation-attempt-demo-1',
        input,
        payload: { schemaVersion: '1.0' },
      },
      meta: { origin: 'pregenerated-mock', fallbackUsed: true },
    });
  });

  it('uses the deterministic fallback when an optional provider rejects', async () => {
    const rejectingService: AIService = {
      respondToCoach: unsupportedCoach,
      generateMission: async () => {
        throw new Error('Synthetic network rejection');
      },
    };

    await expect(
      generateMissionWithFallback({
        input: createDemoMissionInput(),
        attemptId: 'generation-rejected-provider',
        child: { id: 'child-salem-demo', ageBand: '8-10' },
        primaryService: rejectingService,
        fallbackService: new MockAIService(),
      }),
    ).resolves.toMatchObject({
      ok: true,
      data: { attemptId: 'generation-rejected-provider' },
      meta: { origin: 'pregenerated-mock', fallbackUsed: true },
    });
  });

  it('honors an unavailable-fallback error and never invokes the fallback service', async () => {
    let fallbackCalls = 0;
    const noFallback: AIService = {
      respondToCoach: unsupportedCoach,
      generateMission: async () => ({
        ok: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Do not replace this invalid request',
          retryable: false,
          fallbackAvailable: false,
        },
      }),
    };
    const fallback: AIService = {
      respondToCoach: unsupportedCoach,
      generateMission: async () => {
        fallbackCalls += 1;
        return {
          ok: true,
          data: createPregeneratedMissionPayload(),
          meta: { origin: 'pregenerated-mock', fallbackUsed: false },
        };
      },
    };

    const result = await generateMissionWithFallback({
      input: createDemoMissionInput(),
      attemptId: 'generation-no-fallback',
      child: { id: 'child-salem-demo', ageBand: '8-10' },
      primaryService: noFallback,
      fallbackService: fallback,
    });

    expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(fallbackCalls).toBe(0);
  });

  it('reflects edited quantity, time, and reward in deterministic mock output', async () => {
    const input = {
      ...createDemoMissionInput(),
      quantity: { value: 2, unit: 'portions' as const },
      availableMinutes: 30,
      reward: null,
    };

    const result = await new MockAIService().generateMission({
      attemptId: 'generation-edited-demo',
      child: { id: 'child-salem-demo', ageBand: '8-10' },
      input,
      mode: 'mock',
    });

    expect(result).toMatchObject({
      ok: true,
      data: {
        impactTarget: { value: 2, unit: 'portions' },
        reward: null,
        personalization: { availableMinutes: 30 },
      },
    });
    if (result.ok) {
      expect(result.data.story.en).toContain('30 minutes');
      expect(result.data.story.en).toContain('2 portions');
      expect(result.data.story.ar).toContain('نحو حصتين');
      expect(result.data.steps[0].instruction.ar).toContain('ضع حصتين');
      expect(result.data.personalization.foodSituation.ar).toContain('تعادل حصتين');
      expect(generatedMissionPayloadSchema.safeParse(result.data).success).toBe(true);
    }
  });

  it('rejects a stale async result after reset and a new generation attempt', async () => {
    const deferred: {
      resolve?: (result: ServiceResult<GeneratedMissionPayload>) => void;
    } = {};
    const slowService: AIService = {
      respondToCoach: unsupportedCoach,
      generateMission: () =>
        new Promise((resolve) => {
          deferred.resolve = resolve;
        }),
    };

    usePrototypeStore.getState().resetDemo();
    usePrototypeStore.getState().applyDemoInput();
    usePrototypeStore.getState().startGeneration();
    const staleCompletion = usePrototypeStore.getState().completeGeneration(slowService);
    const staleAttemptId = usePrototypeStore.getState().generation?.attemptId;

    usePrototypeStore.getState().resetDemo();
    usePrototypeStore.getState().applyDemoInput();
    usePrototypeStore.getState().startGeneration();
    const currentAttemptId = usePrototypeStore.getState().generation?.attemptId;
    expect(currentAttemptId).not.toBe(staleAttemptId);

    const resolveSlow = deferred.resolve;
    if (!resolveSlow) throw new Error('Expected the synthetic provider to be pending');
    resolveSlow({
      ok: true,
      data: createPregeneratedMissionPayload(),
      meta: { origin: 'pregenerated-mock', fallbackUsed: false },
    });

    await expect(staleCompletion).resolves.toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState()).toMatchObject({
      journeyStatus: 'generating',
      activeMission: null,
      generation: { attemptId: currentAttemptId, status: 'running' },
    });
  });

  it('does not resurrect a stale provider failure after reset', async () => {
    const deferred: {
      resolve?: (result: ServiceResult<GeneratedMissionPayload>) => void;
    } = {};
    const slowFailure: AIService = {
      respondToCoach: unsupportedCoach,
      generateMission: () =>
        new Promise((resolve) => {
          deferred.resolve = resolve;
        }),
    };

    usePrototypeStore.getState().resetDemo();
    usePrototypeStore.getState().applyDemoInput();
    usePrototypeStore.getState().startGeneration();
    const staleCompletion = usePrototypeStore.getState().completeGeneration(slowFailure);
    usePrototypeStore.getState().resetDemo();

    const resolveSlow = deferred.resolve;
    if (!resolveSlow) throw new Error('Expected the synthetic provider to be pending');
    resolveSlow({
      ok: false,
      error: {
        code: 'REMOTE_UNAVAILABLE',
        message: 'The old attempt finished after reset',
        retryable: true,
        fallbackAvailable: false,
      },
    });

    await expect(staleCompletion).resolves.toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState()).toMatchObject({
      locale: 'ar',
      role: 'parent',
      journeyStatus: 'draft-input',
      activeMission: null,
      generation: null,
      lastError: null,
    });
  });
});

describe('Child submission gates', () => {
  beforeEach(async () => {
    usePrototypeStore.getState().resetDemo();
    usePrototypeStore.getState().applyDemoInput();
    usePrototypeStore.getState().startGeneration();
    await usePrototypeStore.getState().completeGeneration();
    usePrototypeStore.getState().approveMission();
    usePrototypeStore.getState().openChildMission();
  });

  it('blocks incomplete steps, missing reflection, and missing evidence without early award', () => {
    const baselineImpact = usePrototypeStore.getState().impactSummary;
    const baselineGhaf = usePrototypeStore.getState().ghaf;
    const mission = usePrototypeStore.getState().activeMission;
    if (!mission) throw new Error('Expected active mission');

    expect(usePrototypeStore.getState().submitForConfirmation()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
    for (const step of mission.steps) {
      usePrototypeStore.getState().setStepCompleted(step.id, true);
    }
    expect(usePrototypeStore.getState().submitForConfirmation()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
    usePrototypeStore.getState().setReflection('I learned how to rescue bread.');
    expect(usePrototypeStore.getState().submitForConfirmation()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
    expect(usePrototypeStore.getState().impactSummary).toEqual(baselineImpact);
    expect(usePrototypeStore.getState().ghaf).toEqual(baselineGhaf);
  });

  it('preserves completed steps across locale changes and accepts Parent confirmation instead', () => {
    const mission = usePrototypeStore.getState().activeMission;
    if (!mission) throw new Error('Expected active mission');
    for (const step of mission.steps) {
      usePrototypeStore.getState().setStepCompleted(step.id, true);
    }
    usePrototypeStore.getState().setLocale('en');
    usePrototypeStore.getState().requestParentEvidenceConfirmation();
    usePrototypeStore.getState().setReflection('I will rescue extra food with my family.');

    expect(usePrototypeStore.getState().activeMission?.steps.every((step) => step.completed)).toBe(
      true,
    );
    expect(usePrototypeStore.getState().submitForConfirmation()).toMatchObject({
      ok: true,
      data: {
        evidenceMediaId: null,
        parentConfirmationRequested: true,
        status: 'awaiting-parent',
      },
    });
    expect(usePrototypeStore.getState()).toMatchObject({
      locale: 'en',
      direction: 'ltr',
      journeyStatus: 'awaiting-parent-confirmation',
      impactSummary: { rescuedGrams: 1_250, completedMissions: 3 },
      ghaf: { progressPercent: 48 },
    });
  });
});
