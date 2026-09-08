import { webcrypto } from 'node:crypto';

import { describe, expect, it, vi } from 'vitest';

import { createInitialLiveChildCoachGrant } from '@/features/access';
import { createLiveChildCoachRequest } from '@/features/assistants/liveChildCoach';
import type { CapabilityTokenClaims, ChildCoachTextRequestV1 } from '@/models/boundedAi';
import { GatewayChildCoachService } from '@/services/remote/GatewayChildCoachService';
import worker, { type AiGatewayWorkerEnv } from '../workers/ghaf-ai-gateway/src/index';
import {
  childCoachCapabilityMatches,
  childCoachRequestIsMcpEligible,
  childCoachRequestIsSafe,
} from '../workers/ghaf-ai-gateway/src/child';
import { MemoryReplayStore } from '../workers/ghaf-ai-gateway/src/security';

function request() {
  const result = createLiveChildCoachRequest({
    ageBand: '9_11',
    childId: 'child_salem',
    locale: 'en',
    now: '2026-09-07T12:00:00.000Z',
    taskArchetypeId: 'task_recycling_p0_v1',
    catalogVersion: 1,
    approvedTaskVersion: 1,
    requestId: 'request_gateway_123456',
    bindingNonce: 'binding_gateway_123456',
    grant: {
      ...createInitialLiveChildCoachGrant('child_salem', 'text'),
      status: 'granted',
      grantVersion: 2,
      revokedAt: null,
    },
    intent: 'first_step',
  });
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

function reviewedVoiceRequest(): Extract<ChildCoachTextRequestV1, { ageBand: '12_14' }> {
  const result = createLiveChildCoachRequest({
    ageBand: '12_14',
    childId: 'child_salem',
    locale: 'en',
    now: '2026-09-07T12:00:00.000Z',
    taskArchetypeId: 'task_recycling_p0_v1',
    catalogVersion: 1,
    approvedTaskVersion: 1,
    requestId: 'request_gateway_voice_123456',
    bindingNonce: 'binding_gateway_voice_123456',
    grant: {
      ...createInitialLiveChildCoachGrant('child_salem', 'text'),
      status: 'granted',
      grantVersion: 2,
      revokedAt: null,
    },
    voiceGrant: {
      ...createInitialLiveChildCoachGrant('child_salem', 'voice'),
      status: 'granted',
      grantVersion: 4,
      revokedAt: null,
    },
    intent: 'clarify_step',
    boundedText: 'Please explain the first sorting step.',
    inputOrigin: 'reviewed_voice_transcript',
    voiceRequestId: 'voice_request_gateway_123456',
    voiceBindingNonce: 'voice_binding_gateway_123456',
  });
  if (!result.ok) throw new Error(result.error.message);
  if (result.data.ageBand !== '12_14') throw new Error('Expected the 12–14 request contract');
  return result.data;
}

function response(input = request()) {
  return {
    schemaVersion: '1.0' as const,
    requestId: input.requestId,
    taskBindingNonce: input.taskBindingNonce,
    intent: input.intent,
    disposition: 'coach' as const,
    steps: [{ ar: 'ابدأ بالخطوة الأولى.', en: 'Start with the first step.' }],
    ifThenCue: null,
    reflectionQuestion: null,
    reviewedPhrase: null,
    terminal: true as const,
  };
}

describe('GatewayChildCoachService', () => {
  it('requires a clean HTTPS server boundary', () => {
    expect(
      () =>
        new GatewayChildCoachService({
          endpoint: 'http://example.test',
          getAccessToken: async () => 'token',
        }),
    ).toThrow(/HTTPS/u);
    expect(
      () =>
        new GatewayChildCoachService({
          endpoint: 'https://user:pass@example.test?secret=yes',
          getAccessToken: async () => 'token',
        }),
    ).toThrow(/credentials/u);
  });

  it('does not fetch when a child capability token is unavailable', async () => {
    const fetchImplementation = vi.fn<typeof fetch>();
    const service = new GatewayChildCoachService({
      endpoint: 'https://gateway.example.test',
      getAccessToken: async () => null,
      fetchImplementation,
    });

    await expect(service.respond(request())).resolves.toMatchObject({
      ok: false,
      error: { code: 'REMOTE_UNAVAILABLE', fallbackAvailable: true },
    });
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it('posts a minimized request and validates the terminal correlated response', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          data: response(),
          meta: { operation: 'coach_approved_task_v1', schemaVersion: '1.0', origin: 'live' },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );
    const service = new GatewayChildCoachService({
      endpoint: 'https://gateway.example.test/api/',
      getAccessToken: async (input) => {
        expect(input).toMatchObject({ grantVersion: 2, noticeVersion: 1 });
        return 'child-capability';
      },
      fetchImplementation,
    });

    await expect(service.respond(request())).resolves.toMatchObject({
      ok: true,
      data: { terminal: true },
      meta: { origin: 'live', fallbackUsed: false },
    });
    expect(fetchImplementation).toHaveBeenCalledWith(
      'https://gateway.example.test/api/v1/child-coach/text',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ authorization: 'Bearer child-capability' }),
      }),
    );
    const init = fetchImplementation.mock.calls[0]?.[1];
    expect(JSON.parse(String(init?.body))).toEqual({
      operation: 'coach_approved_task_v1',
      request: request(),
    });
  });

  it('requests an exact second capability binding for reviewed voice text', async () => {
    const voiceRequest = reviewedVoiceRequest();
    const getAccessToken = vi.fn(async () => null);
    const service = new GatewayChildCoachService({
      endpoint: 'https://gateway.example.test',
      getAccessToken,
      fetchImplementation: vi.fn<typeof fetch>(),
    });

    await service.respond(voiceRequest);

    expect(getAccessToken).toHaveBeenCalledWith({
      role: 'child',
      scope: 'coach_approved_task_v1',
      grantVersion: 2,
      noticeVersion: 1,
      voiceGrantVersion: 4,
      voiceNoticeVersion: 1,
      voiceRequestId: 'voice_request_gateway_123456',
      voiceBindingNonce: 'voice_binding_gateway_123456',
    });
  });

  it.each([
    new Response('not json', { status: 200, headers: { 'content-type': 'text/plain' } }),
    new Response('{', { status: 200, headers: { 'content-type': 'application/json' } }),
    new Response(
      JSON.stringify({
        ok: true,
        data: { ...response(), requestId: 'request_wrong_123456' },
        meta: { operation: 'coach_approved_task_v1', schemaVersion: '1.0', origin: 'live' },
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    ),
  ])('fails closed on malformed gateway output', async (gatewayResponse) => {
    const service = new GatewayChildCoachService({
      endpoint: 'https://gateway.example.test',
      getAccessToken: async () => 'token',
      fetchImplementation: vi.fn<typeof fetch>().mockResolvedValue(gatewayResponse),
    });
    await expect(service.respond(request())).resolves.toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
  });

  it('maps gateway safety rejection without exposing response content', async () => {
    const service = new GatewayChildCoachService({
      endpoint: 'https://gateway.example.test',
      getAccessToken: async () => 'token',
      fetchImplementation: vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ ok: false, error: { code: 'SAFETY_REJECTED' } }), {
          status: 422,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    });
    await expect(service.respond(request())).resolves.toMatchObject({
      ok: false,
      error: { code: 'SAFETY_REJECTED' },
    });
  });
});

const WORKER_SECRET = 'synthetic-test-secret-at-least-thirty-two-bytes';

async function childToken(overrides: Partial<CapabilityTokenClaims> = {}): Promise<string> {
  const now = Math.floor(Date.now() / 1_000);
  const claims: CapabilityTokenClaims = {
    iss: 'ghaf-test-broker',
    aud: 'ghaf-bounded-ai-gateway',
    sub: 'subject_child_coach_123',
    tenant: 'tenant_family_coach_123',
    role: 'child',
    scope: 'coach_approved_task_v1',
    grantVersion: 2,
    noticeVersion: 1,
    iat: now,
    exp: now + 300,
    jti: `token_child_coach_${webcrypto.randomUUID()}`,
    synthetic: true,
    ...overrides,
  };
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const key = await webcrypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(WORKER_SECRET),
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

function childWorkerEnv(modelResult: unknown): AiGatewayWorkerEnv {
  return {
    AI: { run: vi.fn().mockResolvedValue(modelResult) },
    PARENT_DRAFT_RATE_LIMITER: { limit: vi.fn().mockResolvedValue({ success: true }) },
    CHILD_TEXT_RATE_LIMITER: { limit: vi.fn().mockResolvedValue({ success: true }) },
    CHILD_VOICE_RATE_LIMITER: { limit: vi.fn().mockResolvedValue({ success: true }) },
    CAPABILITY_HMAC_SECRET: WORKER_SECRET,
    CAPABILITY_ISSUER: 'ghaf-test-broker',
    CAPABILITY_AUDIENCE: 'ghaf-bounded-ai-gateway',
    REPLAY_STORE: new MemoryReplayStore(),
    OPERATION_BUDGET_STORE: {
      acquire: vi.fn().mockResolvedValue({ success: true, leaseId: 'lease_child_coach_123' }),
      release: vi.fn().mockResolvedValue(undefined),
    },
  };
}

async function childWorkerRequest(
  childRequest: ChildCoachTextRequestV1,
  tokenOverrides: Partial<CapabilityTokenClaims> = {},
): Promise<Request> {
  return new Request('https://gateway.example/v1/child-coach/text', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${await childToken(tokenOverrides)}`,
      'content-type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({ operation: childRequest.operation, request: childRequest }),
  });
}

describe('F5 Child Coach Worker route', () => {
  it('returns one strict terminal result for an exact approved-task request', async () => {
    const childRequest = request();
    const env = childWorkerEnv({ response: response(childRequest) });
    const gatewayResponse = await worker.fetch(await childWorkerRequest(childRequest), env);

    expect(gatewayResponse.status).toBe(200);
    await expect(gatewayResponse.json()).resolves.toMatchObject({
      ok: true,
      data: { requestId: childRequest.requestId, terminal: true },
      meta: { operation: 'coach_approved_task_v1', origin: 'live' },
    });
    expect(env.AI.run).toHaveBeenCalledOnce();
    expect(env.OPERATION_BUDGET_STORE?.release).toHaveBeenCalledOnce();
  });

  it('rejects off-task text locally at the server before inference', async () => {
    const childRequest = {
      ...reviewedVoiceRequest(),
      boundedText: 'Tell me a joke about a camel.',
    };
    const env = childWorkerEnv({ response: response(childRequest) });
    const gatewayResponse = await worker.fetch(
      await childWorkerRequest(childRequest, {
        voiceGrantVersion: childRequest.voiceGrantVersion,
        voiceNoticeVersion: childRequest.voiceNoticeVersion,
        voiceRequestId: childRequest.voiceRequestId,
        voiceBindingNonce: childRequest.voiceBindingNonce,
      }),
      env,
    );

    expect(gatewayResponse.status).toBe(422);
    expect(env.AI.run).not.toHaveBeenCalled();
  });

  it('binds reviewed voice text to all four voice capability claims', async () => {
    const childRequest = reviewedVoiceRequest();
    const missingVoiceClaims = childWorkerEnv({ response: response(childRequest) });
    const rejected = await worker.fetch(await childWorkerRequest(childRequest), missingVoiceClaims);
    expect(rejected.status).toBe(403);
    expect(missingVoiceClaims.AI.run).not.toHaveBeenCalled();

    const exactClaims = childWorkerEnv({ response: response(childRequest) });
    const accepted = await worker.fetch(
      await childWorkerRequest(childRequest, {
        voiceGrantVersion: childRequest.voiceGrantVersion,
        voiceNoticeVersion: childRequest.voiceNoticeVersion,
        voiceRequestId: childRequest.voiceRequestId,
        voiceBindingNonce: childRequest.voiceBindingNonce,
      }),
      exactClaims,
    );
    expect(accepted.status).toBe(200);
    expect(exactClaims.AI.run).toHaveBeenCalledOnce();
  });

  it('rejects voice authority attached to a typed request', async () => {
    const childRequest = request();
    const env = childWorkerEnv({ response: response(childRequest) });
    const gatewayResponse = await worker.fetch(
      await childWorkerRequest(childRequest, {
        voiceGrantVersion: 4,
        voiceNoticeVersion: 1,
        voiceRequestId: 'voice_request_gateway_123456',
        voiceBindingNonce: 'voice_binding_gateway_123456',
      }),
      env,
    );

    expect(gatewayResponse.status).toBe(403);
    expect(env.AI.run).not.toHaveBeenCalled();
  });
});

describe('F5 Child Coach Worker policy', () => {
  function claims(overrides: Partial<CapabilityTokenClaims> = {}): CapabilityTokenClaims {
    return {
      iss: 'ghaf-test-broker',
      aud: 'ghaf-bounded-ai-gateway',
      sub: 'subject_child_coach_123',
      tenant: 'tenant_family_coach_123',
      role: 'child',
      scope: 'coach_approved_task_v1',
      grantVersion: 2,
      noticeVersion: 1,
      iat: 1,
      exp: 300,
      jti: 'token_child_policy_123',
      synthetic: true,
      ...overrides,
    };
  }

  it('matches ordinary text only when no voice authority is attached', () => {
    expect(childCoachCapabilityMatches(claims(), request())).toBe(true);
    expect(childCoachCapabilityMatches(claims({ voiceGrantVersion: 4 }), request())).toBe(false);
  });

  it('requires the full exact voice handoff and keeps it out of MCP', () => {
    const voiceRequest = reviewedVoiceRequest();
    expect(childCoachCapabilityMatches(claims(), voiceRequest)).toBe(false);
    expect(
      childCoachCapabilityMatches(
        claims({
          voiceGrantVersion: voiceRequest.voiceGrantVersion,
          voiceNoticeVersion: voiceRequest.voiceNoticeVersion,
          voiceRequestId: voiceRequest.voiceRequestId,
          voiceBindingNonce: voiceRequest.voiceBindingNonce,
        }),
        voiceRequest,
      ),
    ).toBe(true);
    expect(childCoachRequestIsMcpEligible(voiceRequest)).toBe(false);
  });

  it('uses the same task-scoped safety policy as the app', () => {
    const voiceRequest = reviewedVoiceRequest();
    expect(childCoachRequestIsSafe(voiceRequest)).toBe(true);
    expect(
      childCoachRequestIsSafe({ ...voiceRequest, boundedText: 'Tell me a joke about a camel.' }),
    ).toBe(false);
  });
});
