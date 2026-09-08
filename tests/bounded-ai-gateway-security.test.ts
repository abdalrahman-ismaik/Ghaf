import { webcrypto } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import type { CapabilityTokenClaims } from '@/models/boundedAi';
import {
  BOUNDED_AI_OPERATION_POLICIES,
  MemoryReplayStore,
  reserveOperationCapacity,
  readBoundedBytes,
  resolveAllowedOrigin,
  safeErrorResponse,
  verifyCapabilityRequest,
} from '../workers/ghaf-ai-gateway/src/security';

const SECRET = 'synthetic-test-secret-at-least-thirty-two-bytes';
const ISSUER = 'ghaf-test-broker';
const AUDIENCE = 'ghaf-bounded-ai-gateway';

function base64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64url');
}

async function signClaims(claims: CapabilityTokenClaims): Promise<string> {
  const payload = base64Url(new TextEncoder().encode(JSON.stringify(claims)));
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
  return `v1.${payload}.${base64Url(new Uint8Array(signature))}`;
}

function parentClaims(overrides: Partial<CapabilityTokenClaims> = {}): CapabilityTokenClaims {
  return {
    iss: ISSUER,
    aud: AUDIENCE,
    sub: 'subject_parent_1234',
    tenant: 'tenant_family_1234',
    role: 'parent',
    scope: 'draft_parent_task_v1',
    grantVersion: null,
    noticeVersion: null,
    iat: 1_788_768_000,
    exp: 1_788_768_300,
    jti: 'token_replay_key_1234',
    synthetic: true,
    ...overrides,
  };
}

async function authenticatedRequest(
  claims: CapabilityTokenClaims = parentClaims(),
): Promise<Request> {
  const token = await signClaims(claims);
  return new Request('https://gateway.example/v1/parent-task-drafts', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: '{"private":"body must remain unread until authentication passes"}',
  });
}

function verificationOptions(replayStore = new MemoryReplayStore()) {
  return {
    secret: SECRET,
    issuer: ISSUER,
    audience: AUDIENCE,
    expectedRole: 'parent' as const,
    expectedScope: 'draft_parent_task_v1' as const,
    nowEpochSeconds: 1_788_768_030,
    replayStore,
  };
}

describe('Feature 004 gateway security', () => {
  it('verifies one exact-scope synthetic capability and rejects replay', async () => {
    const replayStore = new MemoryReplayStore();
    const options = verificationOptions(replayStore);

    const first = await verifyCapabilityRequest(await authenticatedRequest(), options);
    expect(first).toMatchObject({
      ok: true,
      claims: { role: 'parent', scope: 'draft_parent_task_v1', synthetic: true },
    });

    const second = await verifyCapabilityRequest(await authenticatedRequest(), options);
    expect(second).toEqual({ ok: false, code: 'REPLAYED', status: 409 });
  });

  it.each([
    ['wrong role', { role: 'child' as const }],
    ['wrong scope', { scope: 'coach_approved_task_v1' as const }],
    ['expired', { exp: 1_788_768_029 }],
    ['future-issued', { iat: 1_788_768_061, exp: 1_788_768_200 }],
    ['not synthetic', { synthetic: false as const }],
  ])('rejects %s claims', async (_label, overrides) => {
    const request = await authenticatedRequest(
      parentClaims(overrides as Partial<CapabilityTokenClaims>),
    );

    await expect(verifyCapabilityRequest(request, verificationOptions())).resolves.toMatchObject({
      ok: false,
    });
    expect(request.bodyUsed).toBe(false);
  });

  it('rejects missing and malformed credentials before reading the body', async () => {
    for (const authorization of [null, 'Basic abc', 'Bearer malformed']) {
      const headers = new Headers({ 'content-type': 'application/json' });
      if (authorization) headers.set('authorization', authorization);
      const request = new Request('https://gateway.example/v1/parent-task-drafts', {
        method: 'POST',
        headers,
        body: '{not-json}',
      });

      await expect(verifyCapabilityRequest(request, verificationOptions())).resolves.toEqual({
        ok: false,
        code: 'UNAUTHORIZED',
        status: 401,
      });
      expect(request.bodyUsed).toBe(false);
    }
  });

  it('uses exact browser origins while allowing originless native requests', () => {
    expect(resolveAllowedOrigin(null, 'https://demo.example')).toBe(null);
    expect(resolveAllowedOrigin('https://demo.example', 'https://demo.example')).toBe(
      'https://demo.example',
    );
    expect(resolveAllowedOrigin('https://attacker.example', 'https://demo.example')).toBe(false);
    expect(resolveAllowedOrigin('https://demo.example', '')).toBe(false);
  });

  it('publishes closed operation budgets and content-free errors', async () => {
    expect(BOUNDED_AI_OPERATION_POLICIES).toEqual({
      draft_parent_task_v1: expect.objectContaining({
        role: 'parent',
        maxBodyBytes: 8_192,
        maxConcurrent: 2,
      }),
      coach_approved_task_v1: expect.objectContaining({
        role: 'child',
        maxBodyBytes: 4_096,
        maxConcurrent: 1,
      }),
      transcribe_child_task_voice_v1: expect.objectContaining({
        role: 'child',
        maxBodyBytes: 278_528,
        maxConcurrent: 1,
      }),
    });
    expect(Object.isFrozen(BOUNDED_AI_OPERATION_POLICIES)).toBe(true);

    const response = safeErrorResponse('INVALID_INPUT', 400, null, true);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({
      ok: false,
      error: { code: 'INVALID_INPUT', retryable: false, fallbackAvailable: true },
    });
  });

  it('remeasures binary request bodies independently of their declared length', async () => {
    await expect(
      readBoundedBytes(
        new Request('https://gateway.example/v1/child-coach/transcriptions', {
          method: 'POST',
          body: new Uint8Array([1, 2, 3, 4]),
        }),
        4,
      ),
    ).resolves.toMatchObject({ ok: true, value: new Uint8Array([1, 2, 3, 4]) });
    await expect(
      readBoundedBytes(
        new Request('https://gateway.example/v1/child-coach/transcriptions', {
          method: 'POST',
          headers: { 'content-length': '2' },
          body: new Uint8Array([1, 2, 3, 4]),
        }),
        3,
      ),
    ).resolves.toEqual({ ok: false });
  });

  it('rate-limits before taking a daily/concurrency lease and releases once', async () => {
    let acquired = 0;
    let released = 0;
    const denied = await reserveOperationCapacity({
      operation: 'draft_parent_task_v1',
      claims: parentClaims(),
      rateLimiter: { limit: async () => ({ success: false }) },
      budgetStore: {
        acquire: async () => {
          acquired += 1;
          return { success: true, leaseId: 'unused' };
        },
        release: async () => undefined,
      },
    });
    expect(denied).toEqual({ ok: false, code: 'RATE_LIMITED', status: 429 });
    expect(acquired).toBe(0);

    const allowed = await reserveOperationCapacity({
      operation: 'draft_parent_task_v1',
      claims: parentClaims(),
      rateLimiter: { limit: async () => ({ success: true }) },
      budgetStore: {
        acquire: async (input) => {
          acquired += 1;
          expect(input).toMatchObject({
            maxPerDaySubject: 30,
            maxPerDayTenant: 30,
            maxConcurrent: 2,
          });
          return { success: true, leaseId: 'lease_synthetic_1' };
        },
        release: async () => {
          released += 1;
        },
      },
    });
    expect(allowed.ok).toBe(true);
    if (!allowed.ok) return;
    await allowed.release();
    await allowed.release();
    expect(acquired).toBe(1);
    expect(released).toBe(1);
  });
});
