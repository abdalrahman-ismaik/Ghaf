import { z } from 'zod';

import {
  voiceTranscriptionMetadataV1Schema,
  voiceTranscriptionResponseV1Schema,
  type VoiceTranscriptionResponseV1,
} from '../../models/boundedAi';
import type {
  CapabilityTokenRequest,
  ServiceResult,
  VoiceTranscriptionInput,
  VoiceTranscriptionService,
} from '../interfaces';

const envelopeSchema = z
  .object({
    ok: z.literal(true),
    data: z.unknown(),
    meta: z
      .object({
        operation: z.literal('transcribe_child_task_voice_v1'),
        schemaVersion: z.literal('1.0'),
        origin: z.literal('live'),
        deletionOutcome: z.literal('deleted'),
      })
      .strict(),
  })
  .strict();

export interface GatewayVoiceTranscriptionServiceOptions {
  readonly endpoint: string;
  readonly getAccessToken: (request: CapabilityTokenRequest) => Promise<string | null>;
  readonly timeoutMs?: number;
  readonly fetchImplementation?: typeof fetch;
}

function failure<T>(
  code: 'INVALID_INPUT' | 'INVALID_RESPONSE' | 'REMOTE_UNAVAILABLE' | 'SAFETY_REJECTED' | 'TIMEOUT',
  message: string,
): ServiceResult<T> {
  return {
    ok: false,
    error: { code, message, retryable: false, fallbackAvailable: code !== 'INVALID_INPUT' },
  };
}

function gatewayUrl(value: string): string {
  const url = new URL(value.trim());
  if (url.protocol !== 'https:') throw new Error('Ghaf AI gateway must use HTTPS');
  if (url.username || url.password || url.search || url.hash) {
    throw new Error('Ghaf AI gateway URL cannot contain credentials, query, or fragment');
  }
  url.pathname = `${url.pathname.replace(/\/$/u, '')}/v1/child-coach/transcriptions`;
  return url.toString();
}

function multipartBody(input: VoiceTranscriptionInput): FormData {
  const metadata = input.metadata;
  const body = new FormData();
  for (const [key, value] of Object.entries({
    operation: metadata.operation,
    schemaVersion: metadata.schemaVersion,
    requestId: metadata.requestId,
    bindingNonce: metadata.bindingNonce,
    locale: metadata.locale,
    taskArchetypeId: metadata.taskArchetypeId,
    catalogVersion: metadata.catalogVersion,
    approvedTaskVersion: metadata.approvedTaskVersion,
    noticeVersion: metadata.noticeVersion,
    grantVersion: metadata.grantVersion,
    durationMs: metadata.durationMs,
    declaredByteCount: metadata.declaredByteCount,
    mediaType: metadata.mediaType,
    synthetic: metadata.synthetic,
  })) {
    body.append(key, String(value));
  }
  const bytes = input.audioBytes.slice();
  body.append('audio', new Blob([bytes.buffer], { type: metadata.mediaType }));
  return body;
}

export class GatewayVoiceTranscriptionService implements VoiceTranscriptionService {
  private readonly endpoint: string;
  private readonly timeoutMs: number;
  private readonly fetchImplementation: typeof fetch;
  private readonly getAccessToken: GatewayVoiceTranscriptionServiceOptions['getAccessToken'];

  constructor(options: GatewayVoiceTranscriptionServiceOptions) {
    this.endpoint = gatewayUrl(options.endpoint);
    this.timeoutMs = Math.max(500, Math.min(4_000, options.timeoutMs ?? 4_000));
    this.fetchImplementation = options.fetchImplementation ?? fetch;
    this.getAccessToken = options.getAccessToken;
  }

  async transcribe(
    input: VoiceTranscriptionInput,
  ): Promise<ServiceResult<VoiceTranscriptionResponseV1>> {
    const metadata = voiceTranscriptionMetadataV1Schema.safeParse(input.metadata);
    if (
      !metadata.success ||
      input.audioBytes.byteLength === 0 ||
      input.audioBytes.byteLength !== metadata.data.declaredByteCount
    ) {
      return failure('INVALID_INPUT', 'Voice transcription input is outside policy');
    }
    let token: string | null;
    try {
      token =
        (
          await this.getAccessToken({
            role: 'child',
            scope: 'transcribe_child_task_voice_v1',
            grantVersion: metadata.data.grantVersion,
            noticeVersion: metadata.data.noticeVersion,
          })
        )?.trim() || null;
    } catch {
      token = null;
    }
    if (!token) return failure('REMOTE_UNAVAILABLE', 'A trusted voice capability is unavailable');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImplementation(this.endpoint, {
        method: 'POST',
        headers: { accept: 'application/json', authorization: `Bearer ${token}` },
        body: multipartBody({ metadata: metadata.data, audioBytes: input.audioBytes }),
        signal: controller.signal,
      });
      if (!response.ok) {
        return response.status === 422
          ? failure('SAFETY_REJECTED', 'Voice transcription gateway rejected the transcript')
          : response.status === 504
            ? failure('TIMEOUT', 'Voice transcription gateway exceeded its deadline')
            : failure('REMOTE_UNAVAILABLE', 'Voice transcription gateway is unavailable');
      }
      if (!response.headers.get('content-type')?.toLowerCase().includes('application/json')) {
        return failure('INVALID_RESPONSE', 'Voice transcription gateway returned non-JSON output');
      }
      let body: unknown;
      try {
        body = await response.json();
      } catch {
        return failure('INVALID_RESPONSE', 'Voice transcription gateway returned invalid JSON');
      }
      const envelope = envelopeSchema.safeParse(body);
      if (!envelope.success) {
        return failure('INVALID_RESPONSE', 'Voice transcription gateway envelope is invalid');
      }
      const transcript = voiceTranscriptionResponseV1Schema.safeParse(envelope.data.data);
      if (
        !transcript.success ||
        transcript.data.requestId !== metadata.data.requestId ||
        transcript.data.bindingNonce !== metadata.data.bindingNonce ||
        transcript.data.locale !== metadata.data.locale
      ) {
        return failure('INVALID_RESPONSE', 'Voice transcription response is stale or malformed');
      }
      return { ok: true, data: transcript.data, meta: { origin: 'live', fallbackUsed: false } };
    } catch (error) {
      return error instanceof Error && error.name === 'AbortError'
        ? failure('TIMEOUT', 'Voice transcription gateway exceeded its deadline')
        : failure('REMOTE_UNAVAILABLE', 'Voice transcription gateway is unavailable');
    } finally {
      clearTimeout(timeout);
    }
  }
}
