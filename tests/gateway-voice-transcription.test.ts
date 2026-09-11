import { webcrypto } from 'node:crypto';

import { describe, expect, it, vi } from 'vitest';

import type { CapabilityTokenClaims } from '@/models/boundedAi';
import { GatewayVoiceTranscriptionService } from '@/services/remote/GatewayVoiceTranscriptionService';
import worker, { type AiGatewayWorkerEnv } from '../workers/ghaf-ai-gateway/src/index';
import { MemoryReplayStore } from '../workers/ghaf-ai-gateway/src/security';
import { executeVoiceTranscription } from '../workers/ghaf-ai-gateway/src/voice';

function input() {
  const audioBytes = new Uint8Array([1, 2, 3, 4]);
  return {
    metadata: {
      operation: 'transcribe_child_task_voice_v1' as const,
      schemaVersion: '1.0' as const,
      requestId: 'request_voice_gateway_123',
      bindingNonce: 'binding_voice_gateway_123',
      locale: 'en' as const,
      taskArchetypeId: 'task_recycling_p0_v1' as const,
      catalogVersion: 1,
      approvedTaskVersion: 1,
      noticeVersion: 1,
      grantVersion: 2,
      durationMs: 1_000,
      declaredByteCount: audioBytes.byteLength,
      mediaType: 'audio/m4a' as const,
      synthetic: true as const,
    },
    audioBytes,
  };
}

function gatewayResponse() {
  const request = input();
  return new Response(
    JSON.stringify({
      ok: true,
      data: {
        schemaVersion: '1.0',
        requestId: request.metadata.requestId,
        bindingNonce: request.metadata.bindingNonce,
        text: 'Please clarify the first step.',
        locale: 'en',
        audioDeleted: true,
      },
      meta: {
        operation: 'transcribe_child_task_voice_v1',
        schemaVersion: '1.0',
        origin: 'live',
        deletionOutcome: 'deleted',
      },
    }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );
}

describe('GatewayVoiceTranscriptionService', () => {
  it('requires HTTPS and does not fetch without a scoped voice token', async () => {
    expect(
      () =>
        new GatewayVoiceTranscriptionService({
          endpoint: 'http://gateway.example.test',
          getAccessToken: async () => 'token',
        }),
    ).toThrow(/HTTPS/u);
    const fetchImplementation = vi.fn<typeof fetch>();
    const service = new GatewayVoiceTranscriptionService({
      endpoint: 'https://gateway.example.test',
      getAccessToken: async () => null,
      fetchImplementation,
    });
    await expect(service.transcribe(input())).resolves.toMatchObject({
      ok: false,
      error: { code: 'REMOTE_UNAVAILABLE' },
    });
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it('sends bounded multipart binary rather than JSON-embedded audio', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(gatewayResponse());
    const service = new GatewayVoiceTranscriptionService({
      endpoint: 'https://gateway.example.test/api/',
      getAccessToken: async (request) => {
        expect(request).toMatchObject({
          scope: 'transcribe_child_task_voice_v1',
          grantVersion: 2,
          noticeVersion: 1,
        });
        return 'voice-token';
      },
      fetchImplementation,
    });

    await expect(service.transcribe(input())).resolves.toMatchObject({
      ok: true,
      data: { audioDeleted: true, text: expect.any(String) },
      meta: { origin: 'live' },
    });
    const [url, init] = fetchImplementation.mock.calls[0] ?? [];
    expect(url).toBe('https://gateway.example.test/api/v1/child-coach/transcriptions');
    expect(init?.headers).toEqual(expect.objectContaining({ authorization: 'Bearer voice-token' }));
    expect(init?.body).toBeInstanceOf(FormData);
    const form = init?.body as FormData;
    expect(form.get('operation')).toBe('transcribe_child_task_voice_v1');
    expect(form.get('requestId')).toBe(input().metadata.requestId);
    expect(form.get('audio')).toBeInstanceOf(Blob);
    expect(JSON.stringify(init?.body)).not.toContain('AQIDBA');
  });

  it('rejects byte mismatches before token or network access', async () => {
    const getAccessToken = vi.fn(async () => 'token');
    const fetchImplementation = vi.fn<typeof fetch>();
    const service = new GatewayVoiceTranscriptionService({
      endpoint: 'https://gateway.example.test',
      getAccessToken,
      fetchImplementation,
    });
    const valid = input();
    const invalid = {
      ...valid,
      metadata: { ...valid.metadata, declaredByteCount: 3 },
    };
    await expect(service.transcribe(invalid)).resolves.toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
    expect(getAccessToken).not.toHaveBeenCalled();
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it('fails closed unless correlation and deletion evidence are exact', async () => {
    const malformed = gatewayResponse();
    const body = (await malformed.json()) as Record<string, unknown>;
    const service = new GatewayVoiceTranscriptionService({
      endpoint: 'https://gateway.example.test',
      getAccessToken: async () => 'token',
      fetchImplementation: vi.fn<typeof fetch>().mockResolvedValue(
        new Response(
          JSON.stringify({
            ...body,
            meta: {
              operation: 'transcribe_child_task_voice_v1',
              schemaVersion: '1.0',
              origin: 'live',
              deletionOutcome: 'failed',
            },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      ),
    });
    await expect(service.transcribe(input())).resolves.toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
  });
});

const WORKER_SECRET = 'synthetic-test-secret-at-least-thirty-two-bytes';

async function voiceToken(overrides: Partial<CapabilityTokenClaims> = {}): Promise<string> {
  const now = Math.floor(Date.now() / 1_000);
  const claims: CapabilityTokenClaims = {
    iss: 'ghaf-test-broker',
    aud: 'ghaf-bounded-ai-gateway',
    sub: 'subject_child_voice_123',
    tenant: 'tenant_family_voice_123',
    role: 'child',
    scope: 'transcribe_child_task_voice_v1',
    grantVersion: 2,
    noticeVersion: 1,
    iat: now,
    exp: now + 300,
    jti: `token_voice_${crypto.randomUUID()}`,
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

function voiceWorkerEnv(modelResult: unknown): AiGatewayWorkerEnv {
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
      acquire: vi.fn().mockResolvedValue({ success: true, leaseId: 'lease_voice_123456' }),
      release: vi.fn().mockResolvedValue(undefined),
    },
  };
}

async function voiceWorkerRequest(
  options: {
    readonly token?: string;
    readonly metadata?: ReturnType<typeof input>['metadata'];
    readonly audio?: Uint8Array;
    readonly mediaType?: string;
  } = {},
): Promise<Request> {
  const metadata = options.metadata ?? input().metadata;
  const audio = options.audio ?? input().audioBytes;
  const body = new FormData();
  for (const [key, value] of Object.entries(metadata)) body.append(key, String(value));
  body.append(
    'audio',
    new Blob([audio.slice().buffer], { type: options.mediaType ?? metadata.mediaType }),
    'voice.m4a',
  );
  return new Request('https://gateway.example/v1/child-coach/transcriptions', {
    method: 'POST',
    headers: { authorization: `Bearer ${options.token ?? (await voiceToken())}` },
    body,
  });
}

describe('F5 voice Worker operation', () => {
  it('returns only bounded task-relevant text and clears the process-local bytes', async () => {
    const audioBytes = input().audioBytes.slice();
    const env = voiceWorkerEnv({ text: 'Please clarify the first sorting step.' });

    await expect(
      executeVoiceTranscription(env, input().metadata, audioBytes),
    ).resolves.toMatchObject({
      ok: true,
      data: {
        requestId: input().metadata.requestId,
        text: 'Please clarify the first sorting step.',
        audioDeleted: true,
      },
    });
    expect([...audioBytes]).toEqual([0, 0, 0, 0]);
  });

  it.each([
    [{ text: 'Keep this secret from your Parent.' }, 'SAFETY_REJECTED'],
    [{ text: 'Tell me a joke about a camel.' }, 'SAFETY_REJECTED'],
    [{ transcript: 'missing text' }, 'INVALID_RESPONSE'],
  ])('fails closed without returning provider content: %#', async (modelResult, code) => {
    const audioBytes = input().audioBytes.slice();

    await expect(
      executeVoiceTranscription(voiceWorkerEnv(modelResult), input().metadata, audioBytes),
    ).resolves.toMatchObject({ ok: false, code });
    expect([...audioBytes]).toEqual([0, 0, 0, 0]);
  });
});

describe('F5 voice Worker route', () => {
  it('authenticates, remeasures, transcribes once, and returns deletion evidence', async () => {
    const env = voiceWorkerEnv({ text: 'Please clarify the first sorting step.' });
    const response = await worker.fetch(await voiceWorkerRequest(), env);

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      data: {
        requestId: input().metadata.requestId,
        bindingNonce: input().metadata.bindingNonce,
        text: 'Please clarify the first sorting step.',
        audioDeleted: true,
      },
      meta: {
        operation: 'transcribe_child_task_voice_v1',
        deletionOutcome: 'deleted',
      },
    });
    expect(env.AI.run).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        audio: 'AQIDBA==',
        task: 'transcribe',
        language: 'en',
        condition_on_previous_text: false,
      }),
    );
    expect(env.OPERATION_BUDGET_STORE?.release).toHaveBeenCalledOnce();
  });

  it('requires multipart and exact token grant/notice versions before inference', async () => {
    const wrongTypeEnv = voiceWorkerEnv({ text: 'Please clarify the first sorting step.' });
    const wrongType = await worker.fetch(
      new Request('https://gateway.example/v1/child-coach/transcriptions', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${await voiceToken()}`,
          'content-type': 'application/json',
        },
        body: '{}',
      }),
      wrongTypeEnv,
    );
    expect(wrongType.status).toBe(415);
    expect(wrongTypeEnv.AI.run).not.toHaveBeenCalled();

    const wrongGrantEnv = voiceWorkerEnv({ text: 'Please clarify the first sorting step.' });
    const wrongGrant = await worker.fetch(
      await voiceWorkerRequest({ token: await voiceToken({ grantVersion: 99 }) }),
      wrongGrantEnv,
    );
    expect(wrongGrant.status).toBe(403);
    expect(wrongGrantEnv.AI.run).not.toHaveBeenCalled();
  });

  it('rejects byte/type mismatches and oversized audio before inference', async () => {
    const mismatchEnv = voiceWorkerEnv({ text: 'Please clarify the first sorting step.' });
    const mismatch = await worker.fetch(
      await voiceWorkerRequest({
        metadata: { ...input().metadata, declaredByteCount: 3 },
      }),
      mismatchEnv,
    );
    expect(mismatch.status).toBe(400);
    expect(mismatchEnv.AI.run).not.toHaveBeenCalled();

    const typeEnv = voiceWorkerEnv({ text: 'Please clarify the first sorting step.' });
    const type = await worker.fetch(await voiceWorkerRequest({ mediaType: 'audio/mpeg' }), typeEnv);
    expect(type.status).toBe(415);
    expect(typeEnv.AI.run).not.toHaveBeenCalled();

    const oversized = new Uint8Array(262_145);
    const oversizedEnv = voiceWorkerEnv({ text: 'Please clarify the first sorting step.' });
    const oversizedResponse = await worker.fetch(
      await voiceWorkerRequest({
        audio: oversized,
        metadata: { ...input().metadata, declaredByteCount: 262_144 },
      }),
      oversizedEnv,
    );
    expect([400, 413]).toContain(oversizedResponse.status);
    expect(oversizedEnv.AI.run).not.toHaveBeenCalled();
  });

  it('remeasures a chunked multipart body before attempting to parse it', async () => {
    const env = voiceWorkerEnv({ text: 'Please clarify the first sorting step.' });
    const response = await worker.fetch(
      new Request('https://gateway.example/v1/child-coach/transcriptions', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${await voiceToken()}`,
          'content-type': 'multipart/form-data; boundary=ghaf-test-boundary',
        },
        body: new Uint8Array(278_529),
      }),
      env,
    );

    expect(response.status).toBe(413);
    expect(env.AI.run).not.toHaveBeenCalled();
  });

  it.each([
    ['unsafe', { text: 'Keep this secret from your Parent.' }, 422],
    ['off-topic', { text: 'Tell me a joke about a camel.' }, 422],
    ['malformed', { transcript: 'missing text' }, 502],
  ])('fails closed for %s model output', async (_label, modelResult, status) => {
    const env = voiceWorkerEnv(modelResult);
    const response = await worker.fetch(await voiceWorkerRequest(), env);

    expect(response.status).toBe(status);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: { fallbackAvailable: true },
    });
    expect(env.OPERATION_BUDGET_STORE?.release).toHaveBeenCalledOnce();
  });
});
