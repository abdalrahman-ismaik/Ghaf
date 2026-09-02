import { describe, expect, it, vi } from 'vitest';

import { detectCoachLanguageMode, getCoachAgePolicy } from '../src/features/ai/policy';
import { respondToCoachWithFallback } from '../src/features/ai/respondToCoach';
import { coachResponseSchema } from '../src/features/ai/validation';
import type { CoachRequest, CoachResponse } from '../src/models/prototype';
import { MockAIService } from '../src/services/mock';
import { GatewayAIService } from '../src/services/remote/GatewayAIService';

function coachRequest(patch: Partial<CoachRequest> = {}): CoachRequest {
  return {
    requestId: 'coach-request-1',
    taskId: 'mission-bread-rescue-demo:step-1',
    ageGroup: '9-11',
    locale: 'ar',
    inputMode: 'text',
    message: 'كيف أبدأ this step?',
    currentTask: {
      ar: 'ضع الخبز في طبق نظيف بمساعدة ولي أمرك.',
      en: 'Place the bread on a clean plate with a Parent.',
    },
    permissions: { aiEnabled: true, voiceEnabled: false },
    ...patch,
  };
}

describe('age-adaptive Ghaf Coach', () => {
  it('detects Arabic, English, and natural code-switching', () => {
    expect(detectCoachLanguageMode('كيف أبدأ؟')).toBe('ar');
    expect(detectCoachLanguageMode('How do I start?')).toBe('en');
    expect(detectCoachLanguageMode('كيف أبدأ this step?')).toBe('code-switched');
  });

  it('keeps the three age policies bounded and mature', () => {
    expect(getCoachAgePolicy('6-8')).toMatchObject({ maximumQuickChoices: 2 });
    expect(getCoachAgePolicy('9-11')).toMatchObject({ maximumQuickChoices: 3 });
    expect(getCoachAgePolicy('12-14').instructionStyle).toContain('mature');
  });

  it('returns bilingual, task-bound deterministic help for every age group', async () => {
    const service = new MockAIService();
    for (const ageGroup of ['6-8', '9-11', '12-14'] as const) {
      const result = await service.respondToCoach(coachRequest({ ageGroup }));
      expect(result).toMatchObject({
        ok: true,
        data: {
          requestId: 'coach-request-1',
          taskId: 'mission-bread-rescue-demo:step-1',
          languageMode: 'code-switched',
          safety: { foodSafetyVerdict: false },
        },
        meta: { origin: 'pregenerated-mock' },
      });
      if (result.ok) expect(coachResponseSchema.safeParse(result.data).success).toBe(true);
    }
  });

  it('requires Parent AI permission and separate permission for voice-derived text', async () => {
    const service = new MockAIService();
    await expect(
      service.respondToCoach(
        coachRequest({ permissions: { aiEnabled: false, voiceEnabled: false } }),
      ),
    ).resolves.toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    await expect(
      service.respondToCoach(coachRequest({ inputMode: 'voice-transcript' })),
    ).resolves.toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    await expect(
      service.respondToCoach(
        coachRequest({
          inputMode: 'voice-transcript',
          permissions: { aiEnabled: true, voiceEnabled: true },
        }),
      ),
    ).resolves.toMatchObject({ ok: true });
  });

  it('redirects food-safety and sensitive decisions to an adult without a verdict', async () => {
    const result = await new MockAIService().respondToCoach(
      coachRequest({ message: 'هل هذا الخبز safe to eat?' }),
    );
    expect(result).toMatchObject({
      ok: true,
      data: {
        quickChoices: [],
        askAdult: { recommended: true },
        safety: { foodSafetyVerdict: false, requiresAdult: true },
      },
    });
  });
});

describe('optional live AI gateway', () => {
  it('accepts only matching, locally validated structured Coach output', async () => {
    const request = coachRequest();
    const fallbackResult = await new MockAIService().respondToCoach(request);
    if (!fallbackResult.ok) throw new Error('Expected valid deterministic Coach response');
    const liveResponse: CoachResponse = { ...fallbackResult.data };
    const fetchImplementation = vi.fn(
      async () =>
        new Response(JSON.stringify({ ok: true, data: liveResponse }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    );
    const service = new GatewayAIService({
      endpoint: 'https://ghaf-ai.example.test',
      fetchImplementation,
    });

    await expect(service.respondToCoach(request)).resolves.toMatchObject({
      ok: true,
      meta: { origin: 'live-optional', fallbackUsed: false },
    });
    expect(fetchImplementation).toHaveBeenCalledWith(
      'https://ghaf-ai.example.test',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('rejects mismatched live task output and uses deterministic fallback in the same request', async () => {
    const request = coachRequest();
    const fallbackResult = await new MockAIService().respondToCoach(request);
    if (!fallbackResult.ok) throw new Error('Expected valid deterministic Coach response');
    const fetchImplementation = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ ok: true, data: { ...fallbackResult.data, taskId: 'another-task' } }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
    );
    const live = new GatewayAIService({
      endpoint: 'https://ghaf-ai.example.test',
      fetchImplementation,
    });

    await expect(
      respondToCoachWithFallback(request, live, new MockAIService()),
    ).resolves.toMatchObject({
      ok: true,
      data: { taskId: request.taskId },
      meta: { origin: 'pregenerated-mock', fallbackUsed: true },
    });
  });
});
