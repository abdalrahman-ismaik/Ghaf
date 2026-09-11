import { z } from 'zod';

import {
  parentTaskDraftRequestV1Schema,
  type ParentTaskDraftRequestV1,
  type ParentTaskDraftSuggestionV1,
} from '../../models/boundedAi';
import { validateParentTaskDraftSuggestion } from '../../features/assistants/parentTaskDrafting';
import type { ParentTaskDraftingService, ServiceResult } from '../interfaces';

const envelopeSchema = z
  .object({
    ok: z.literal(true),
    data: z.unknown(),
    meta: z
      .object({
        operation: z.literal('draft_parent_task_v1'),
        schemaVersion: z.literal('1.0'),
        origin: z.literal('live'),
      })
      .strict(),
  })
  .strict();

export interface GatewayParentTaskDraftingServiceOptions {
  readonly endpoint: string;
  readonly getAccessToken: () => Promise<string | null>;
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
  url.pathname = `${url.pathname.replace(/\/$/u, '')}/v1/parent-task-drafts`;
  return url.toString();
}

export class GatewayParentTaskDraftingService implements ParentTaskDraftingService {
  private readonly endpoint: string;
  private readonly timeoutMs: number;
  private readonly fetchImplementation: typeof fetch;
  private readonly getAccessToken: () => Promise<string | null>;

  constructor(options: GatewayParentTaskDraftingServiceOptions) {
    this.endpoint = gatewayUrl(options.endpoint);
    this.timeoutMs = Math.max(250, Math.min(2_500, options.timeoutMs ?? 2_500));
    this.fetchImplementation = options.fetchImplementation ?? fetch;
    this.getAccessToken = options.getAccessToken;
  }

  async draft(
    request: ParentTaskDraftRequestV1,
  ): Promise<ServiceResult<ParentTaskDraftSuggestionV1>> {
    const validRequest = parentTaskDraftRequestV1Schema.safeParse(request);
    if (!validRequest.success) {
      return failure('INVALID_INPUT', 'Parent task drafting request is outside policy');
    }
    let token: string | null;
    try {
      token = (await this.getAccessToken())?.trim() || null;
    } catch {
      token = null;
    }
    if (!token) {
      return failure('REMOTE_UNAVAILABLE', 'A trusted Parent capability is unavailable');
    }

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
        return failure(
          'REMOTE_UNAVAILABLE',
          `Parent task drafting gateway returned HTTP ${response.status}`,
        );
      }
      if (!response.headers.get('content-type')?.toLowerCase().includes('application/json')) {
        return failure('INVALID_RESPONSE', 'Parent task drafting gateway returned non-JSON output');
      }
      let body: unknown;
      try {
        body = await response.json();
      } catch {
        return failure('INVALID_RESPONSE', 'Parent task drafting gateway returned invalid JSON');
      }
      const envelope = envelopeSchema.safeParse(body);
      if (!envelope.success) {
        return failure('INVALID_RESPONSE', 'Parent task drafting gateway envelope is invalid');
      }
      const suggestion = validateParentTaskDraftSuggestion(validRequest.data, envelope.data.data);
      if (!suggestion.ok) return { ok: false, error: suggestion.error };
      return {
        ok: true,
        data: suggestion.data,
        meta: { origin: 'live', fallbackUsed: false },
      };
    } catch (error) {
      return error instanceof Error && error.name === 'AbortError'
        ? failure('TIMEOUT', 'Parent task drafting gateway exceeded its deadline')
        : failure('REMOTE_UNAVAILABLE', 'Parent task drafting gateway is unavailable');
    } finally {
      clearTimeout(timeout);
    }
  }
}
