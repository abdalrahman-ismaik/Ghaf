import { describe, expect, it, vi } from 'vitest';

import { GatewayVoiceTranscriptionService } from '@/services/remote/GatewayVoiceTranscriptionService';

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
