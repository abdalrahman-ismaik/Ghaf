import { z } from 'zod';

import { validateLiveChildCoachResponse } from '../../features/assistants/liveChildCoach';
import {
  childCoachTextRequestV1Schema,
  type ChildCoachTextRequestV1,
  type ChildCoachTextResponseV1,
} from '../../models/boundedAi';
import type {
  CapabilityTokenRequest,
  LiveChildCoachTextService,
  ServiceResult,
} from '../interfaces';

const envelopeSchema = z
  .object({
    ok: z.literal(true),
    data: z.unknown(),
    meta: z
      .object({
        operation: z.literal('coach_approved_task_v1'),
        schemaVersion: z.literal('1.0'),
        origin: z.literal('live'),
      })
      .strict(),
  })
  .strict();

export interface GatewayChildCoachServiceOptions {
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
  url.pathname = `${url.pathname.replace(/\/$/u, '')}/v1/child-coach/text`;
  return url.toString();
}

export class GatewayChildCoachService implements LiveChildCoachTextService {
  private readonly endpoint: string;
  private readonly timeoutMs: number;
  private readonly fetchImplementation: typeof fetch;
  private readonly getAccessToken: GatewayChildCoachServiceOptions['getAccessToken'];

  constructor(options: GatewayChildCoachServiceOptions) {
    this.endpoint = gatewayUrl(options.endpoint);
    this.timeoutMs = Math.max(250, Math.min(1_500, options.timeoutMs ?? 1_500));
    this.fetchImplementation = options.fetchImplementation ?? fetch;
    this.getAccessToken = options.getAccessToken;
  }

  async respond(
    request: ChildCoachTextRequestV1,
  ): Promise<ServiceResult<ChildCoachTextResponseV1>> {
    const validRequest = childCoachTextRequestV1Schema.safeParse(request);
    if (!validRequest.success) {
      return failure('INVALID_INPUT', 'Child Coach request is outside policy');
    }
    let token: string | null;
    try {
      token =
        (
          await this.getAccessToken({
            role: 'child',
            scope: 'coach_approved_task_v1',
            grantVersion: validRequest.data.grantVersion,
            noticeVersion: validRequest.data.noticeVersion,
            ...(validRequest.data.ageBand === '12_14' &&
            validRequest.data.inputOrigin === 'reviewed_voice_transcript'
              ? {
                  voiceGrantVersion: validRequest.data.voiceGrantVersion,
                  voiceNoticeVersion: validRequest.data.voiceNoticeVersion,
                  voiceRequestId: validRequest.data.voiceRequestId,
                  voiceBindingNonce: validRequest.data.voiceBindingNonce,
                }
              : {}),
          })
        )?.trim() || null;
    } catch {
      token = null;
    }
    if (!token) return failure('REMOTE_UNAVAILABLE', 'A trusted Child capability is unavailable');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImplementation(this.endpoint, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${token}`,
          'content-type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({ operation: request.operation, request: validRequest.data }),
        signal: controller.signal,
      });
      if (!response.ok) {
        return response.status === 422
          ? failure('SAFETY_REJECTED', 'Child Coach gateway rejected unsafe output')
          : response.status === 504
            ? failure('TIMEOUT', 'Child Coach gateway exceeded its deadline')
            : failure('REMOTE_UNAVAILABLE', 'Child Coach gateway is unavailable');
      }
      if (!response.headers.get('content-type')?.toLowerCase().includes('application/json')) {
        return failure('INVALID_RESPONSE', 'Child Coach gateway returned non-JSON output');
      }
      let body: unknown;
      try {
        body = await response.json();
      } catch {
        return failure('INVALID_RESPONSE', 'Child Coach gateway returned invalid JSON');
      }
      const envelope = envelopeSchema.safeParse(body);
      if (!envelope.success) {
        return failure('INVALID_RESPONSE', 'Child Coach gateway envelope is invalid');
      }
      const validated = validateLiveChildCoachResponse(validRequest.data, envelope.data.data);
      if (!validated.ok) return { ok: false, error: validated.error };
      return { ok: true, data: validated.data, meta: { origin: 'live', fallbackUsed: false } };
    } catch (error) {
      return error instanceof Error && error.name === 'AbortError'
        ? failure('TIMEOUT', 'Child Coach gateway exceeded its deadline')
        : failure('REMOTE_UNAVAILABLE', 'Child Coach gateway is unavailable');
    } finally {
      clearTimeout(timeout);
    }
  }
}
