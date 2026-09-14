import { webcrypto } from 'node:crypto';

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { CapabilityTokenClaims } from '@/models/boundedAi';
import worker, { type AiGatewayWorkerEnv } from '../../workers/ghaf-ai-gateway/src/index';
import { MemoryReplayStore } from '../../workers/ghaf-ai-gateway/src/security';

const SECRET = 'synthetic-test-secret-at-least-thirty-two-bytes';
const CONTENT_CANARY = 'PRIVATE_CHILD_CONTENT_MUST_NOT_ESCAPE';

async function token(overrides: Partial<CapabilityTokenClaims>): Promise<string> {
  const now = Math.floor(Date.now() / 1_000);
  const claims: CapabilityTokenClaims = {
    iss: 'ghaf-test-broker',
    aud: 'ghaf-bounded-ai-gateway',
    sub: 'subject_gateway_canary_123',
    tenant: 'tenant_gateway_canary_123',
    role: 'child',
    scope: 'coach_approved_task_v1',
    grantVersion: 2,
    noticeVersion: 1,
    iat: now,
    exp: now + 300,
    jti: `token_gateway_canary_${webcrypto.randomUUID()}`,
    synthetic: true,
    ...overrides,
  };
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const key = await webcrypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(SECRET),
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

function env(): AiGatewayWorkerEnv {
  return {
    AI: { run: vi.fn() },
    PARENT_DRAFT_RATE_LIMITER: { limit: vi.fn().mockResolvedValue({ success: true }) },
    CHILD_TEXT_RATE_LIMITER: { limit: vi.fn().mockResolvedValue({ success: true }) },
    CHILD_VOICE_RATE_LIMITER: { limit: vi.fn().mockResolvedValue({ success: true }) },
    CAPABILITY_HMAC_SECRET: SECRET,
    CAPABILITY_ISSUER: 'ghaf-test-broker',
    CAPABILITY_AUDIENCE: 'ghaf-bounded-ai-gateway',
    REPLAY_STORE: new MemoryReplayStore(),
    OPERATION_BUDGET_STORE: {
      acquire: vi.fn().mockResolvedValue({ success: true, leaseId: 'lease_gateway_canary_123' }),
      release: vi.fn().mockResolvedValue(undefined),
    },
  };
}

const consoleSpies: ReturnType<typeof vi.spyOn>[] = [];

function watchConsole() {
  for (const method of ['debug', 'error', 'info', 'log', 'warn'] as const) {
    consoleSpies.push(vi.spyOn(console, method).mockImplementation(() => undefined));
  }
}

afterEach(() => {
  for (const spy of consoleSpies.splice(0)) spy.mockRestore();
});

describe('bounded AI gateway isolation and content canaries', () => {
  it.each([
    {
      path: '/v1/parent-task-drafts',
      scope: 'draft_parent_task_v1',
      role: 'parent',
    },
    { path: '/v1/child-coach/text', scope: 'coach_approved_task_v1', role: 'child' },
    {
      path: '/v1/child-coach/transcriptions',
      scope: 'transcribe_child_task_voice_v1',
      role: 'child',
    },
  ] as const)(
    'blocks $scope without configured replay storage before consuming content',
    async ({ path, scope, role }) => {
      watchConsole();
      const workerEnv = { ...env(), REPLAY_STORE: undefined };
      const request = new Request(`https://gateway.example${path}`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${await token({
            scope,
            role,
            ...(role === 'parent' ? { grantVersion: null, noticeVersion: null } : {}),
          })}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ private: CONTENT_CANARY }),
      });

      const response = await worker.fetch(request, workerEnv);

      expect(response.status).toBe(503);
      expect(await response.json()).toMatchObject({ error: { code: 'BUDGET_BLOCKED' } });
      expect(request.bodyUsed).toBe(false);
      expect(workerEnv.AI.run).not.toHaveBeenCalled();
      expect(workerEnv.OPERATION_BUDGET_STORE?.acquire).not.toHaveBeenCalled();
      expect(workerEnv.PARENT_DRAFT_RATE_LIMITER.limit).not.toHaveBeenCalled();
      expect(workerEnv.CHILD_TEXT_RATE_LIMITER.limit).not.toHaveBeenCalled();
      expect(workerEnv.CHILD_VOICE_RATE_LIMITER.limit).not.toHaveBeenCalled();
      expect(consoleSpies.every((spy) => spy.mock.calls.length === 0)).toBe(true);
    },
  );

  it('rejects a cross-operation capability before reading or rate-limiting the body', async () => {
    watchConsole();
    const workerEnv = env();
    const request = new Request('https://gateway.example/v1/parent-task-drafts', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${await token({})}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ private: CONTENT_CANARY }),
    });

    const response = await worker.fetch(request, workerEnv);

    expect(response.status).toBe(403);
    expect(request.bodyUsed).toBe(false);
    expect(workerEnv.PARENT_DRAFT_RATE_LIMITER.limit).not.toHaveBeenCalled();
    expect(workerEnv.CHILD_TEXT_RATE_LIMITER.limit).not.toHaveBeenCalled();
    expect(workerEnv.CHILD_VOICE_RATE_LIMITER.limit).not.toHaveBeenCalled();
    expect(JSON.stringify(await response.json())).not.toContain(CONTENT_CANARY);
    expect(consoleSpies.every((spy) => spy.mock.calls.length === 0)).toBe(true);
  });

  it('returns a content-free error and uses only the exact operation budget', async () => {
    watchConsole();
    const workerEnv = env();
    const response = await worker.fetch(
      new Request('https://gateway.example/v1/child-coach/text', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${await token({})}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'coach_approved_task_v1',
          request: { privateText: CONTENT_CANARY },
        }),
      }),
      workerEnv,
    );

    expect(response.status).toBe(400);
    const body = JSON.stringify(await response.json());
    expect(body).toContain('INVALID_INPUT');
    expect(body).not.toContain(CONTENT_CANARY);
    expect(workerEnv.CHILD_TEXT_RATE_LIMITER.limit).toHaveBeenCalledOnce();
    expect(workerEnv.PARENT_DRAFT_RATE_LIMITER.limit).not.toHaveBeenCalled();
    expect(workerEnv.CHILD_VOICE_RATE_LIMITER.limit).not.toHaveBeenCalled();
    expect(workerEnv.AI.run).not.toHaveBeenCalled();
    expect(workerEnv.OPERATION_BUDGET_STORE?.release).toHaveBeenCalledOnce();
    expect(consoleSpies.every((spy) => spy.mock.calls.length === 0)).toBe(true);
  });
});
