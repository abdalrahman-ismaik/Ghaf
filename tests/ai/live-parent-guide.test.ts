import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createCanonicalLiveParentGuidePayload,
  LIVE_PARENT_GUIDE_OPERATION,
} from '../../src/features/assistants/liveParentGuide';
import { P0_RECYCLING_TEMPLATE } from '../../src/features/tasks/demoContent';
import type { ParentGuideRequest } from '../../src/models/familyGrowth';
import { serviceRegistry } from '../../src/services';
import { GatewayParentGuideService } from '../../src/services/remote/GatewayParentGuideService';
import { usePrototypeStore } from '../../src/state/usePrototypeStore';
import { enterParentExperienceForTest, resetPrototypeForTest } from '../helpers/prototypeStore';

const ACCESS_TOKEN = 'synthetic-test-token';

function parentRequest(requestId = 'live-parent-guide-request'): ParentGuideRequest {
  return {
    requestId,
    intent: 'make_clearer',
    locale: 'en',
    child: { id: 'child_salem', age: 9, ageBand: '9_11', synthetic: true },
    parentText: { ar: 'أخرج مواد إعادة التدوير.', en: 'Take the recycling out.' },
    taskTemplateId: P0_RECYCLING_TEMPLATE.id,
    taskVersion: 1,
    allowedCategoryId: 'green_impact',
    allowedSafety: P0_RECYCLING_TEMPLATE.safety,
    inputOrigin: 'synthetic',
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function successfulFetch(request = parentRequest()) {
  return vi.fn<typeof fetch>().mockResolvedValue(
    jsonResponse({
      ok: true,
      data: createCanonicalLiveParentGuidePayload(request),
      provider: { name: 'cloudflare-workers-ai', model: 'test-model' },
    }),
  );
}

describe('optional live Parent Guide adapter', () => {
  it('authenticates one HTTPS structured request and returns a validated live suggestion', async () => {
    const request = parentRequest();
    const fetchImplementation = successfulFetch(request);
    const service = new GatewayParentGuideService({
      endpoint: 'https://ai.example.test',
      getAccessToken: async () => ACCESS_TOKEN,
      fetchImplementation,
    });

    await expect(service.refineTask(request)).resolves.toMatchObject({
      ok: true,
      data: {
        originalParentText: request.parentText,
        suggestedContent: P0_RECYCLING_TEMPLATE,
        accepted: false,
        meta: {
          requestId: request.requestId,
          audience: 'parent',
          origin: 'live',
          fixtureId: 'live_parent_guide_v1',
          fallbackUsed: false,
          disclosure: {
            saysAiMayBeWrong: true,
            saysHumanDecides: true,
            preparedIsExplicit: false,
          },
        },
      },
      meta: { origin: 'live', fallbackUsed: false },
    });

    expect(fetchImplementation).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImplementation.mock.calls[0] ?? [];
    expect(url).toBe('https://ai.example.test/v1/parent-guide/refine');
    expect(init).toMatchObject({
      method: 'POST',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${ACCESS_TOKEN}`,
        'content-type': 'application/json',
      },
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      operation: LIVE_PARENT_GUIDE_OPERATION,
      request,
    });
  });

  it('fails closed before fetch when no trusted credential is available', async () => {
    const fetchImplementation = successfulFetch();
    const service = new GatewayParentGuideService({
      endpoint: 'https://ai.example.test',
      getAccessToken: async () => null,
      fetchImplementation,
    });

    await expect(service.refineTask(parentRequest())).resolves.toMatchObject({
      ok: false,
      error: { code: 'REMOTE_UNAVAILABLE', fallbackAvailable: true },
    });
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it('aborts once at the bounded deadline and leaves fallback available', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            const error = new Error('aborted');
            error.name = 'AbortError';
            reject(error);
          });
        }),
    );
    const service = new GatewayParentGuideService({
      endpoint: 'https://ai.example.test',
      getAccessToken: async () => ACCESS_TOKEN,
      timeoutMs: 250,
      fetchImplementation,
    });

    await expect(service.refineTask(parentRequest())).resolves.toMatchObject({
      ok: false,
      error: { code: 'TIMEOUT', fallbackAvailable: true },
    });
    expect(fetchImplementation).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['non-JSON', vi.fn<typeof fetch>().mockResolvedValue(new Response('not-json'))],
    [
      'wrong request correlation',
      vi.fn<typeof fetch>().mockResolvedValue(
        jsonResponse({
          ok: true,
          data: createCanonicalLiveParentGuidePayload(parentRequest('wrong-request')),
        }),
      ),
    ],
    [
      'malformed output',
      vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ ok: true, data: { unsafe: true } })),
    ],
    [
      'gateway rejection',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          jsonResponse(
            { ok: false, error: { code: 'RATE_LIMITED', message: 'Please retry later' } },
            429,
          ),
        ),
    ],
  ])('returns a fallback-eligible error for %s', async (_label, fetchImplementation) => {
    const service = new GatewayParentGuideService({
      endpoint: 'https://ai.example.test',
      getAccessToken: async () => ACCESS_TOKEN,
      fetchImplementation,
    });
    await expect(service.refineTask(parentRequest())).resolves.toMatchObject({
      ok: false,
      error: { fallbackAvailable: true },
    });
  });

  it('rejects insecure endpoints and exposes no live summary or Child operation', async () => {
    expect(
      () =>
        new GatewayParentGuideService({
          endpoint: 'http://ai.example.test',
          getAccessToken: async () => ACCESS_TOKEN,
        }),
    ).toThrow(/HTTPS/u);

    const service = new GatewayParentGuideService({
      endpoint: 'https://ai.example.test',
      getAccessToken: async () => ACCESS_TOKEN,
      fetchImplementation: successfulFetch(),
    });
    await expect(
      service.summarizePattern({
        ...parentRequest('summary-request'),
        intent: 'summarize_observable_pattern',
        syntheticSevenDayFacts: [],
      }),
    ).resolves.toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(service).not.toHaveProperty('respond');
  });
});

describe('live Parent Guide store integration', () => {
  beforeEach(async () => {
    expect(resetPrototypeForTest().ok).toBe(true);
    await enterParentExperienceForTest();
    expect(
      usePrototypeStore.getState().createTaskDraft({
        childId: 'child_salem',
        templateId: P0_RECYCLING_TEMPLATE.id,
        parentText: parentRequest().parentText,
      }).ok,
    ).toBe(true);
  });

  it('accepts a validated live result through the existing Parent review authority', async () => {
    const request = parentRequest('store-live-success');
    const service = new GatewayParentGuideService({
      endpoint: 'https://ai.example.test',
      getAccessToken: async () => ACCESS_TOKEN,
      fetchImplementation: successfulFetch(request),
    });

    const result = await usePrototypeStore
      .getState()
      .requestParentGuide({ requestId: request.requestId, intent: request.intent }, service);

    expect(result).toMatchObject({ ok: true, data: { meta: { origin: 'live' } } });
    expect(usePrototypeStore.getState().acceptGuideSuggestion()).toMatchObject({ ok: true });
    expect(usePrototypeStore.getState().reviewTask()).toMatchObject({ ok: true });
    expect(usePrototypeStore.getState().journey).toMatchObject({
      lifecycle: 'reviewed',
      task: { acceptedGuideFixtureId: 'live_parent_guide_v1' },
    });
  });

  it('uses the same-attempt prepared result when live output is rejected', async () => {
    const service = new GatewayParentGuideService({
      endpoint: 'https://ai.example.test',
      getAccessToken: async () => ACCESS_TOKEN,
      fetchImplementation: vi
        .fn<typeof fetch>()
        .mockResolvedValue(jsonResponse({ ok: true, data: { requestId: 'wrong' } })),
    });

    const result = await usePrototypeStore
      .getState()
      .requestParentGuide({ requestId: 'store-live-fallback', intent: 'make_clearer' }, service);

    expect(result).toMatchObject({
      ok: true,
      data: {
        originalParentText: parentRequest().parentText,
        meta: {
          origin: 'prepared',
          fixtureId: 'guide_recycling_refine_v1',
          fallbackUsed: true,
          fallbackReason: 'malformed_response',
        },
      },
    });
    expect(serviceRegistry.parentGuide.mode).toBe('deterministic_prepared');
  });
});
