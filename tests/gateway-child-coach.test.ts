import { describe, expect, it, vi } from 'vitest';

import { createInitialLiveChildCoachGrant } from '@/features/access';
import { createLiveChildCoachRequest } from '@/features/assistants/liveChildCoach';
import { GatewayChildCoachService } from '@/services/remote/GatewayChildCoachService';

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
