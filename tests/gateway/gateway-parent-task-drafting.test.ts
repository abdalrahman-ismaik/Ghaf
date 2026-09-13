import { webcrypto } from 'node:crypto';

import { describe, expect, it, vi } from 'vitest';

import type { CapabilityTokenClaims } from '@/models/boundedAi';
import { createPreparedParentTaskDraftSuggestion } from '@/services';
import { GatewayParentTaskDraftingService } from '@/services/remote';
import worker, { type AiGatewayWorkerEnv } from '../../workers/ghaf-ai-gateway/src/index';
import { MemoryReplayStore } from '../../workers/ghaf-ai-gateway/src/security';

const request = {
  operation: 'draft_parent_task_v1' as const,
  schemaVersion: '1.0' as const,
  requestId: 'request_gateway_f4_123',
  bindingNonce: 'binding_gateway_f4_123',
  localeSet: 'ar_en' as const,
  ageBand: '9_11' as const,
  archetypeId: 'task_recycling_p0_v1' as const,
  catalogVersion: 1,
  intent: 'make_clearer' as const,
  effortBand: 'fifteen_thirty' as const,
  stepCount: 2,
  supportMode: 'adult_alongside' as const,
};

function validResponse() {
  return new Response(
    JSON.stringify({
      ok: true,
      data: createPreparedParentTaskDraftSuggestion({
        requestId: request.requestId,
        bindingNonce: request.bindingNonce,
        archetypeId: request.archetypeId,
      }),
      meta: { operation: request.operation, schemaVersion: '1.0', origin: 'live' },
    }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );
}

describe('GatewayParentTaskDraftingService', () => {
  it('requires a clean HTTPS base URL', () => {
    for (const endpoint of [
      'http://gateway.example',
      'https://user:pass@gateway.example',
      'https://gateway.example?token=value',
      'https://gateway.example#fragment',
    ]) {
      expect(
        () =>
          new GatewayParentTaskDraftingService({
            endpoint,
            getAccessToken: async () => 'token',
          }),
      ).toThrow();
    }
  });

  it('does not fetch when the trusted token source is unavailable', async () => {
    const fetchImplementation = vi.fn<typeof fetch>();
    const service = new GatewayParentTaskDraftingService({
      endpoint: 'https://gateway.example/base',
      getAccessToken: async () => null,
      fetchImplementation,
    });

    await expect(service.draft(request)).resolves.toMatchObject({
      ok: false,
      error: { code: 'REMOTE_UNAVAILABLE', fallbackAvailable: true },
    });
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it('posts one strict operation with a bearer capability and validates correlation', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(validResponse());
    const service = new GatewayParentTaskDraftingService({
      endpoint: 'https://gateway.example/base/',
      getAccessToken: async () => 'short-lived-capability',
      fetchImplementation,
    });

    await expect(service.draft(request)).resolves.toMatchObject({
      ok: true,
      meta: { origin: 'live', fallbackUsed: false },
      data: { requestId: request.requestId, bindingNonce: request.bindingNonce },
    });
    expect(fetchImplementation).toHaveBeenCalledTimes(1);
    expect(fetchImplementation).toHaveBeenCalledWith(
      'https://gateway.example/base/v1/parent-task-drafts',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ authorization: 'Bearer short-lived-capability' }),
        body: JSON.stringify({ operation: request.operation, request }),
      }),
    );
  });

  it.each([
    ['HTTP failure', async () => new Response('{}', { status: 429 })],
    [
      'wrong content type',
      async () => new Response('{}', { status: 200, headers: { 'content-type': 'text/plain' } }),
    ],
    [
      'unknown envelope key',
      async () =>
        new Response(JSON.stringify({ ...(await validResponse().json()), provider: 'hidden' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    ],
    [
      'wrong correlation',
      async () => {
        const body = (await validResponse().json()) as Record<string, unknown>;
        return new Response(
          JSON.stringify({
            ...body,
            data: { ...(body.data as object), requestId: 'different_request_123' },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
      },
    ],
  ])('fails safely for %s', async (_label, responseFactory) => {
    const service = new GatewayParentTaskDraftingService({
      endpoint: 'https://gateway.example',
      getAccessToken: async () => 'short-lived-capability',
      fetchImplementation: vi.fn<typeof fetch>().mockResolvedValue(await responseFactory()),
    });

    await expect(service.draft(request)).resolves.toMatchObject({
      ok: false,
      error: { fallbackAvailable: true },
    });
  });

  it('aborts once at the bounded deadline without retrying', async () => {
    vi.useFakeTimers();
    try {
      const fetchImplementation = vi.fn<typeof fetch>((_url, init) => {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError')),
          );
        });
      });
      const service = new GatewayParentTaskDraftingService({
        endpoint: 'https://gateway.example',
        getAccessToken: async () => 'short-lived-capability',
        timeoutMs: 2_500,
        fetchImplementation,
      });
      const pending = service.draft(request);
      await vi.advanceTimersByTimeAsync(2_500);

      await expect(pending).resolves.toMatchObject({ ok: false, error: { code: 'TIMEOUT' } });
      expect(fetchImplementation).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});

async function workerToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1_000);
  const claims: CapabilityTokenClaims = {
    iss: 'ghaf-test-broker',
    aud: 'ghaf-bounded-ai-gateway',
    sub: 'subject_parent_f4_123',
    tenant: 'tenant_family_f4_123',
    role: 'parent',
    scope: 'draft_parent_task_v1',
    grantVersion: null,
    noticeVersion: null,
    iat: now,
    exp: now + 300,
    jti: `token_parent_f4_${String(Math.random()).replace('.', '')}`,
    synthetic: true,
  };
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const key = await webcrypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('synthetic-test-secret-at-least-thirty-two-bytes'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await webcrypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`v1.${payload}`),
  );
  return `v1.${payload}.${Buffer.from(signature).toString('base64url')}`;
}

function workerEnv(modelResult: unknown): AiGatewayWorkerEnv {
  return {
    AI: { run: vi.fn().mockResolvedValue(modelResult) },
    PARENT_DRAFT_RATE_LIMITER: { limit: vi.fn().mockResolvedValue({ success: true }) },
    CHILD_TEXT_RATE_LIMITER: { limit: vi.fn().mockResolvedValue({ success: true }) },
    CHILD_VOICE_RATE_LIMITER: { limit: vi.fn().mockResolvedValue({ success: true }) },
    CAPABILITY_HMAC_SECRET: 'synthetic-test-secret-at-least-thirty-two-bytes',
    CAPABILITY_ISSUER: 'ghaf-test-broker',
    CAPABILITY_AUDIENCE: 'ghaf-bounded-ai-gateway',
    REPLAY_STORE: new MemoryReplayStore(),
    OPERATION_BUDGET_STORE: {
      acquire: vi.fn().mockResolvedValue({ success: true, leaseId: 'lease_parent_f4_123' }),
      release: vi.fn().mockResolvedValue(undefined),
    },
  };
}

async function workerRequest(body: unknown): Promise<Request> {
  return new Request('https://gateway.example/v1/parent-task-drafts', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${await workerToken()}`,
      'content-type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
  });
}

describe('F4 Worker route', () => {
  it('validates and returns only the closed live envelope', async () => {
    const suggestion = createPreparedParentTaskDraftSuggestion({
      requestId: request.requestId,
      bindingNonce: request.bindingNonce,
      archetypeId: request.archetypeId,
    });
    const env = workerEnv({ response: suggestion });
    const response = await worker.fetch(
      await workerRequest({ operation: request.operation, request }),
      env,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: suggestion,
      meta: { operation: 'draft_parent_task_v1', schemaVersion: '1.0', origin: 'live' },
    });
    expect(env.AI.run).toHaveBeenCalledTimes(1);
    expect(env.AI.run).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        temperature: 0,
        response_format: expect.objectContaining({ type: 'json_schema' }),
      }),
    );
    expect(env.OPERATION_BUDGET_STORE?.release).toHaveBeenCalledTimes(1);
  });

  it('rejects malformed requests and authority-bearing output before returning content', async () => {
    const malformedEnv = workerEnv({ response: {} });
    const malformed = await worker.fetch(
      await workerRequest({
        operation: request.operation,
        request: { ...request, parentName: 'x' },
      }),
      malformedEnv,
    );
    expect(malformed.status).toBe(400);
    expect(malformedEnv.AI.run).not.toHaveBeenCalled();

    const authorityEnv = workerEnv({
      response: {
        ...createPreparedParentTaskDraftSuggestion({
          requestId: request.requestId,
          bindingNonce: request.bindingNonce,
          archetypeId: request.archetypeId,
        }),
        displayedSeedAward: 100,
      },
    });
    const authority = await worker.fetch(
      await workerRequest({ operation: request.operation, request }),
      authorityEnv,
    );
    expect(authority.status).toBe(502);
    await expect(authority.json()).resolves.toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE', fallbackAvailable: true },
    });
  });
});
