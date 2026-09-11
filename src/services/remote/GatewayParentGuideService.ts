import { z } from 'zod';

import {
  createLiveParentGuideSuggestion,
  LIVE_PARENT_GUIDE_ID,
  LIVE_PARENT_GUIDE_OPERATION,
  validateLiveParentGuideRequest,
} from '../../features/assistants/liveParentGuide';
import type {
  ParentGuideRequest,
  ParentGuideTaskSuggestion,
  ParentPatternSummary,
} from '../../models/familyGrowth';
import type { BoundedParentGuideProvider, ParentGuideService, ServiceResult } from '../interfaces';

const envelopeSchema = z
  .object({
    ok: z.literal(true),
    data: z.unknown(),
    provider: z
      .object({ name: z.string().trim().min(1), model: z.string().trim().min(1) })
      .strict()
      .optional(),
  })
  .strict();

export interface GatewayParentGuideServiceOptions {
  readonly endpoint: string;
  readonly getAccessToken: () => Promise<string | null>;
  readonly timeoutMs?: number;
  readonly fetchImplementation?: typeof fetch;
}

function failure<T>(
  code: 'INVALID_INPUT' | 'INVALID_RESPONSE' | 'REMOTE_UNAVAILABLE' | 'SAFETY_REJECTED' | 'TIMEOUT',
  message: string,
  fallbackAvailable = true,
): ServiceResult<T> {
  return {
    ok: false,
    error: { code, message, retryable: fallbackAvailable, fallbackAvailable },
  };
}

function gatewayUrl(value: string): string {
  const url = new URL(value.trim());
  if (url.protocol !== 'https:') throw new Error('Ghaf Parent Guide gateway must use HTTPS');
  if (url.username || url.password || url.search || url.hash) {
    throw new Error('Ghaf Parent Guide gateway URL cannot contain credentials, query, or fragment');
  }
  url.pathname = `${url.pathname.replace(/\/$/u, '')}/v1/parent-guide/refine`;
  return url.toString();
}

export class GatewayParentGuideService implements BoundedParentGuideProvider {
  readonly mode = 'live_optional' as const;
  readonly disclosure = {
    text: {
      ar: 'قد يستخدم هذا الإجراء خدمة ذكاء اصطناعي مباشرة لطلب اصطناعي فقط. قد تكون الاستجابة غير صحيحة، ووليّ الأمر هو صاحب القرار.',
      en: 'This action may use live AI for a synthetic request only. AI may be wrong; the Parent decides.',
    },
    saysAiMayBeWrong: true,
    saysHumanDecides: true,
    preparedIsExplicit: false,
  } as const;

  private readonly endpoint: string;
  private readonly timeoutMs: number;
  private readonly fetchImplementation: typeof fetch;
  private readonly getAccessToken: () => Promise<string | null>;

  constructor(options: GatewayParentGuideServiceOptions) {
    this.endpoint = gatewayUrl(options.endpoint);
    this.timeoutMs = Math.max(250, Math.min(1_400, options.timeoutMs ?? 1_200));
    this.fetchImplementation = options.fetchImplementation ?? fetch;
    this.getAccessToken = options.getAccessToken;
  }

  async refineTask(request: ParentGuideRequest): Promise<ServiceResult<ParentGuideTaskSuggestion>> {
    const validatedRequest = validateLiveParentGuideRequest(request);
    if (!validatedRequest.ok) {
      return { ok: false, error: validatedRequest.error };
    }

    let token: string | null;
    try {
      token = (await this.getAccessToken())?.trim() || null;
    } catch {
      token = null;
    }
    if (!token) {
      return failure(
        'REMOTE_UNAVAILABLE',
        'A trusted Parent Guide gateway credential is unavailable',
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImplementation(this.endpoint, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          operation: LIVE_PARENT_GUIDE_OPERATION,
          request: validatedRequest.data,
        }),
        signal: controller.signal,
      });
      if (!response.ok) {
        return failure(
          'REMOTE_UNAVAILABLE',
          `Parent Guide gateway returned HTTP ${response.status}`,
        );
      }
      if (!response.headers.get('content-type')?.toLowerCase().includes('application/json')) {
        return failure('INVALID_RESPONSE', 'Parent Guide gateway returned non-JSON output');
      }
      let body: unknown;
      try {
        body = await response.json();
      } catch {
        return failure('INVALID_RESPONSE', 'Parent Guide gateway returned invalid JSON');
      }
      const envelope = envelopeSchema.safeParse(body);
      if (!envelope.success) {
        return failure('INVALID_RESPONSE', 'Parent Guide gateway envelope is invalid');
      }
      const suggestion = createLiveParentGuideSuggestion(request, envelope.data.data);
      if (!suggestion.ok) return { ok: false, error: suggestion.error };
      return {
        ok: true,
        data: suggestion.data,
        meta: { origin: 'live', fallbackUsed: false, fixtureId: LIVE_PARENT_GUIDE_ID },
      };
    } catch (error) {
      return error instanceof Error && error.name === 'AbortError'
        ? failure('TIMEOUT', 'Parent Guide gateway exceeded its request deadline')
        : failure('REMOTE_UNAVAILABLE', 'Parent Guide gateway is unavailable');
    } finally {
      clearTimeout(timeout);
    }
  }

  async summarizePattern(
    _request: Parameters<ParentGuideService['summarizePattern']>[0],
  ): Promise<ServiceResult<ParentPatternSummary>> {
    return failure('INVALID_INPUT', 'The live gateway does not expose Parent summaries', false);
  }
}
