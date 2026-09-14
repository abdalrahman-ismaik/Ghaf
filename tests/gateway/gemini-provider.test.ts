import { afterEach, describe, expect, it, vi } from 'vitest';

import { createInitialLiveChildCoachGrant } from '../../src/features/access';
import { createLiveChildCoachRequest } from '../../src/features/assistants/liveChildCoach';
import {
  createPreparedChildCoachResponse,
  createPreparedParentTaskDraftSuggestion,
} from '../../src/services/mock/boundedAiFixtures';
import { GEMINI_MAX_RESPONSE_BYTES, runGeminiText } from '../../workers/ghaf-ai-gateway/src/gemini';
import worker, { type AiGatewayWorkerEnv } from '../../workers/ghaf-ai-gateway/src/index';
import {
  executeChildCoach,
  executeParentTaskDraft,
} from '../../workers/ghaf-ai-gateway/src/operations';

const config = { GEMINI_API_KEY: 'synthetic-key-canary', GEMINI_MODEL: 'synthetic-test-model' };
const modelInput = {
  prompt: 'Synthetic bounded input',
  schema: { type: 'object', properties: { answer: { type: 'string' } }, required: ['answer'] },
  maxTokens: 800,
  timeoutMs: 1_500,
};
const parentRequest = {
  operation: 'draft_parent_task_v1' as const,
  schemaVersion: '1.0' as const,
  requestId: 'request_gemini_test_123',
  bindingNonce: 'binding_gemini_test_123',
  localeSet: 'ar_en' as const,
  ageBand: '9_11' as const,
  archetypeId: 'task_recycling_p0_v1' as const,
  catalogVersion: 1,
  intent: 'make_clearer' as const,
  effortBand: 'fifteen_thirty' as const,
  stepCount: 2,
  supportMode: 'adult_alongside' as const,
};

function candidate(value: unknown) {
  return {
    finishReason: 'STOP',
    content: { role: 'model', parts: [{ text: JSON.stringify(value) }] },
  };
}

function jsonResponse(value: unknown) {
  return new Response(JSON.stringify(value), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function providerFetch(value: unknown) {
  return vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ candidates: [candidate(value)] }));
}

function operationEnv() {
  return { ...config, TEXT_AI_PROVIDER: 'gemini', AI: { run: vi.fn() } };
}

function childRequest() {
  const request = createLiveChildCoachRequest({
    ageBand: '9_11',
    childId: 'child_salem',
    locale: 'en',
    now: '2026-09-14T12:00:00.000Z',
    taskArchetypeId: 'task_recycling_p0_v1',
    catalogVersion: 1,
    approvedTaskVersion: 1,
    requestId: 'request_gemini_child_123',
    bindingNonce: 'binding_gemini_child_123',
    grant: {
      ...createInitialLiveChildCoachGrant('child_salem', 'text'),
      status: 'granted',
      grantVersion: 2,
      revokedAt: null,
    },
    intent: 'first_step',
  });
  if (!request.ok) throw new Error('Expected bounded Child request');
  return request.data;
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('server-only Gemini text adapter', () => {
  it('sends the existing bounded prompt and JSON schema to one fixed HTTPS origin', async () => {
    const fetcher = providerFetch({ answer: 'Synthetic answer' });
    await expect(runGeminiText(config, modelInput, fetcher)).resolves.toEqual({
      status: 'ok',
      value: { response: { answer: 'Synthetic answer' } },
    });
    expect(fetcher).toHaveBeenCalledOnce();
    const [url, init] = fetcher.mock.calls[0]!;
    expect(url).toBe(
      'https://generativelanguage.googleapis.com/v1beta/models/synthetic-test-model:generateContent',
    );
    expect(String(url)).not.toContain(config.GEMINI_API_KEY);
    expect(init).toMatchObject({
      method: 'POST',
      redirect: 'error',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': config.GEMINI_API_KEY },
    });
    const body = JSON.parse(String(init?.body));
    expect(body.contents).toEqual([{ role: 'user', parts: [{ text: modelInput.prompt }] }]);
    expect(body.generationConfig).toEqual({
      temperature: 0,
      candidateCount: 1,
      maxOutputTokens: 800,
      responseMimeType: 'application/json',
      responseJsonSchema: modelInput.schema,
    });
    expect(body).not.toHaveProperty('tools');
    expect(body).not.toHaveProperty('cachedContent');
    expect(JSON.stringify(body)).not.toContain(config.GEMINI_API_KEY);
  });

  it.each([
    { GEMINI_API_KEY: undefined },
    { GEMINI_API_KEY: 'bad\r\nkey' },
    { GEMINI_MODEL: undefined },
    { GEMINI_MODEL: '../other' },
    { GEMINI_MODEL: 'models/example' },
    { GEMINI_MODEL: 'https://attacker.invalid/model' },
    { GEMINI_MODEL: 'example?key=another' },
  ])('requires explicit clean server configuration without a model default: %j', async (patch) => {
    const fetcher = vi.fn<typeof fetch>();
    await expect(runGeminiText({ ...config, ...patch }, modelInput, fetcher)).resolves.toEqual({
      status: 'error',
    });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it.each([
    ['prompt block', { promptFeedback: { blockReason: 'SAFETY' } }, 'blocked'],
    ['candidate block', { candidates: [{ finishReason: 'SAFETY' }] }, 'blocked'],
    [
      'blocked rating',
      { candidates: [{ ...candidate({}), safetyRatings: [{ blocked: true }] }] },
      'blocked',
    ],
    ['truncated', { candidates: [{ ...candidate({}), finishReason: 'MAX_TOKENS' }] }, 'invalid'],
    ['missing finish', { candidates: [{ content: candidate({}).content }] }, 'invalid'],
    ['multiple candidates', { candidates: [candidate({}), candidate({})] }, 'invalid'],
    ['missing candidates', {}, 'invalid'],
    [
      'malformed JSON text',
      { candidates: [{ ...candidate({}), content: { role: 'model', parts: [{ text: '{' }] } }] },
      'invalid',
    ],
    [
      'tool content',
      {
        candidates: [
          {
            ...candidate({}),
            content: { role: 'model', parts: [{ functionCall: { name: 'unsafe' } }] },
          },
        ],
      },
      'invalid',
    ],
    [
      'thought content',
      {
        candidates: [
          { ...candidate({}), content: { role: 'model', parts: [{ text: '{}', thought: true }] } },
        ],
      },
      'invalid',
    ],
  ] as const)('rejects %s without returning provider content', async (_name, envelope, status) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(envelope));
    await expect(runGeminiText(config, modelInput, fetcher)).resolves.toEqual({ status });
  });

  it('measures streamed bytes despite a misleading small content length and cancels excess', async () => {
    const canceled = vi.fn();
    const response = new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array(GEMINI_MAX_RESPONSE_BYTES));
          controller.enqueue(new Uint8Array(1));
        },
        cancel: canceled,
      }),
      { headers: { 'content-type': 'application/json', 'content-length': '1' } },
    );
    await expect(
      runGeminiText(config, modelInput, vi.fn<typeof fetch>().mockResolvedValue(response)),
    ).resolves.toEqual({ status: 'invalid' });
    expect(canceled).toHaveBeenCalledOnce();
  });

  it('aborts and returns at the deadline even when fetch ignores cancellation', async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn<typeof fetch>().mockImplementation(() => new Promise(() => undefined));
    const result = runGeminiText(config, modelInput, fetcher);
    await vi.advanceTimersByTimeAsync(modelInput.timeoutMs);
    await expect(result).resolves.toEqual({ status: 'timeout' });
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher.mock.calls[0]![1]?.signal?.aborted).toBe(true);
  });

  it('includes response-body consumption in the deadline and cancels a stalled stream', async () => {
    vi.useFakeTimers();
    const canceled = vi.fn();
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(new ReadableStream({ cancel: canceled }), {
        headers: { 'content-type': 'application/json' },
      }),
    );
    const result = runGeminiText(config, modelInput, fetcher);
    await vi.advanceTimersByTimeAsync(modelInput.timeoutMs);
    await expect(result).resolves.toEqual({ status: 'timeout' });
    expect(canceled).toHaveBeenCalledOnce();
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher.mock.calls[0]![1]?.signal?.aborted).toBe(true);
  });

  it('redacts HTTP and transport failures instead of returning secret or prompt text', async () => {
    const privateError = `${config.GEMINI_API_KEY} ${modelInput.prompt}`;
    for (const fetcher of [
      vi.fn<typeof fetch>().mockRejectedValue(new Error(privateError)),
      vi.fn<typeof fetch>().mockResolvedValue(new Response(privateError, { status: 429 })),
    ]) {
      const result = await runGeminiText(config, modelInput, fetcher);
      expect(result).toEqual({ status: 'error' });
      expect(JSON.stringify(result)).not.toContain(privateError);
    }
  });
});

describe('Gemini uses the real bounded operations', () => {
  it('validates Parent drafts through the existing schema and correlation policy', async () => {
    const env = operationEnv();
    const suggestion = createPreparedParentTaskDraftSuggestion(parentRequest);
    if (!suggestion) throw new Error('Expected reviewed Parent fixture');
    const fetcher = providerFetch(suggestion);
    vi.stubGlobal('fetch', fetcher);
    await expect(executeParentTaskDraft(env, parentRequest)).resolves.toEqual({
      ok: true,
      data: suggestion,
    });
    expect(env.AI.run).not.toHaveBeenCalled();
    expect(fetcher).toHaveBeenCalledOnce();
    const body = JSON.parse(String(fetcher.mock.calls[0]![1]?.body));
    expect(body.generationConfig.responseJsonSchema.properties.requestId.enum).toEqual([
      parentRequest.requestId,
    ]);
    expect(body.generationConfig.responseJsonSchema.properties.title.properties.en).toEqual({
      type: 'string',
    });
    for (const invalid of [
      { ...suggestion, requestId: 'unrelated_request_123' },
      { ...suggestion, displayedSeedAward: 100 },
      { ...suggestion, title: { ...suggestion.title, en: 'x'.repeat(121) } },
      { response: suggestion },
    ]) {
      fetcher.mockResolvedValueOnce(jsonResponse({ candidates: [candidate(invalid)] }));
      await expect(executeParentTaskDraft(env, parentRequest)).resolves.toEqual({
        ok: false,
        code: 'INVALID_RESPONSE',
        status: 502,
      });
    }
  });

  it('keeps Child correlation, age-bounded output and safety validation', async () => {
    const request = childRequest();
    const response = createPreparedChildCoachResponse(request);
    const env = operationEnv();
    const fetcher = providerFetch(response);
    vi.stubGlobal('fetch', fetcher);
    await expect(executeChildCoach(env, request)).resolves.toEqual({ ok: true, data: response });
    expect(env.AI.run).not.toHaveBeenCalled();
    expect(fetcher).toHaveBeenCalledOnce();
    const body = JSON.parse(String(fetcher.mock.calls[0]![1]?.body));
    expect(body.generationConfig.responseJsonSchema.properties.terminal).toEqual({
      type: 'boolean',
    });
    fetcher.mockResolvedValueOnce(
      jsonResponse({ candidates: [candidate({ ...response, terminal: false })] }),
    );
    await expect(executeChildCoach(env, request)).resolves.toMatchObject({
      ok: false,
      code: 'INVALID_RESPONSE',
    });
    fetcher.mockResolvedValueOnce(
      jsonResponse({
        candidates: [candidate({ ...response, taskBindingNonce: 'wrong_binding_123' })],
      }),
    );
    await expect(executeChildCoach(env, request)).resolves.toMatchObject({
      ok: false,
      code: 'INVALID_RESPONSE',
    });
    fetcher.mockResolvedValueOnce(
      jsonResponse({
        candidates: [candidate({ ...response, steps: [{ ar: 'خطوة', en: 'You are lazy.' }] })],
      }),
    );
    await expect(executeChildCoach(env, request)).resolves.toMatchObject({
      ok: false,
      code: 'SAFETY_REJECTED',
    });
  });

  it('keeps Workers AI as the default and rejects unknown provider configuration', async () => {
    const fetcher = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetcher);
    const env = {
      ...config,
      AI: {
        run: vi
          .fn()
          .mockResolvedValue({ response: createPreparedParentTaskDraftSuggestion(parentRequest) }),
      },
    };
    await expect(executeParentTaskDraft(env, parentRequest)).resolves.toMatchObject({ ok: true });
    expect(env.AI.run).toHaveBeenCalledOnce();
    env.AI.run.mockClear();
    await expect(
      executeParentTaskDraft({ ...env, TEXT_AI_PROVIDER: 'Gemini' }, parentRequest),
    ).resolves.toEqual({
      ok: false,
      code: 'REMOTE_UNAVAILABLE',
      status: 503,
    });
    expect(fetcher).not.toHaveBeenCalled();
    expect(env.AI.run).not.toHaveBeenCalled();
  });

  it('does not contact Gemini when the Worker request lacks trusted authorization', async () => {
    const fetcher = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetcher);
    const env: AiGatewayWorkerEnv = {
      ...operationEnv(),
      CAPABILITY_HMAC_SECRET: 'synthetic-test-secret-at-least-thirty-two-bytes',
      CAPABILITY_ISSUER: 'synthetic-test-issuer',
      CAPABILITY_AUDIENCE: 'synthetic-test-audience',
      PARENT_DRAFT_RATE_LIMITER: { limit: vi.fn() },
      CHILD_TEXT_RATE_LIMITER: { limit: vi.fn() },
      CHILD_VOICE_RATE_LIMITER: { limit: vi.fn() },
    };
    const response = await worker.fetch(
      new Request('https://gateway.example/v1/parent-task-drafts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ operation: parentRequest.operation, request: parentRequest }),
      }),
      env,
    );
    expect(response.status).toBe(401);
    expect(fetcher).not.toHaveBeenCalled();
    expect(env.AI.run).not.toHaveBeenCalled();
  });
});
