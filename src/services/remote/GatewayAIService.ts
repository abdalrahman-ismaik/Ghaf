import { coachRequestSchema, validateCoachResponseForRequest } from '../../features/ai/validation';
import {
  missionInputSchema,
  generatedMissionPayloadSchema,
} from '../../features/missions/validation';
import type {
  CapabilityOrigin,
  CoachRequest,
  CoachResponse,
  GeneratedMissionPayload,
  ServiceErrorCode,
} from '../../models/prototype';
import type { AIService, MissionGenerationRequest, ServiceResult } from '../interfaces';

interface GatewayAIServiceOptions {
  readonly endpoint: string;
  readonly timeoutMs?: number;
  readonly fetchImplementation?: typeof fetch;
}

interface GatewayEnvelope {
  readonly ok?: unknown;
  readonly data?: unknown;
  readonly error?: { readonly code?: unknown; readonly message?: unknown };
}

function failure<T>(
  code: ServiceErrorCode,
  message: string,
  fallbackAvailable: boolean,
): ServiceResult<T> {
  return {
    ok: false,
    error: {
      code,
      message,
      retryable: fallbackAvailable,
      fallbackAvailable,
    },
  };
}

function success<T>(data: T, origin: CapabilityOrigin = 'live-optional'): ServiceResult<T> {
  return { ok: true, data, meta: { origin, fallbackUsed: false } };
}

export class GatewayAIService implements AIService {
  private readonly endpoint: string;
  private readonly timeoutMs: number;
  private readonly fetchImplementation: typeof fetch;

  constructor(options: GatewayAIServiceOptions) {
    const endpoint = options.endpoint.trim();
    if (!/^https?:\/\//iu.test(endpoint)) {
      throw new Error('Ghaf AI gateway endpoint must be an absolute HTTP(S) URL');
    }
    this.endpoint = endpoint;
    this.timeoutMs = Math.max(1_000, options.timeoutMs ?? 8_000);
    this.fetchImplementation = options.fetchImplementation ?? fetch;
  }

  private async invoke(
    operation: 'generateMission' | 'respondToCoach',
    request: unknown,
  ): Promise<ServiceResult<unknown>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImplementation(this.endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ operation, request }),
        signal: controller.signal,
      });
      let envelope: GatewayEnvelope;
      try {
        envelope = (await response.json()) as GatewayEnvelope;
      } catch {
        return failure('INVALID_RESPONSE', 'AI gateway returned non-JSON output', true);
      }
      if (!response.ok || envelope.ok !== true) {
        const code =
          envelope.error?.code === 'INVALID_INPUT' ? 'INVALID_INPUT' : 'REMOTE_UNAVAILABLE';
        const message =
          typeof envelope.error?.message === 'string'
            ? envelope.error.message
            : `AI gateway failed with HTTP ${response.status}`;
        return failure(code, message, code !== 'INVALID_INPUT');
      }
      return success(envelope.data);
    } catch (error) {
      const message =
        error instanceof Error && error.name === 'AbortError'
          ? 'AI gateway timed out'
          : 'AI gateway is unavailable';
      return failure('REMOTE_UNAVAILABLE', message, true);
    } finally {
      clearTimeout(timeout);
    }
  }

  async generateMission(
    request: MissionGenerationRequest,
  ): Promise<ServiceResult<GeneratedMissionPayload>> {
    if (!missionInputSchema.safeParse(request.input).success) {
      return failure('INVALID_INPUT', 'Live mission request contains invalid mission input', false);
    }
    const result = await this.invoke('generateMission', { ...request, mode: 'live-optional' });
    if (!result.ok) return result;
    const parsed = generatedMissionPayloadSchema.safeParse(result.data);
    return parsed.success
      ? success(parsed.data as GeneratedMissionPayload)
      : failure(
          'INVALID_RESPONSE',
          parsed.error.issues[0]?.message ?? 'Invalid live mission response',
          true,
        );
  }

  async respondToCoach(request: CoachRequest): Promise<ServiceResult<CoachResponse>> {
    const parsedRequest = coachRequestSchema.safeParse(request);
    if (!parsedRequest.success) {
      return failure(
        'INVALID_INPUT',
        parsedRequest.error.issues[0]?.message ?? 'Invalid Coach request',
        false,
      );
    }
    const result = await this.invoke('respondToCoach', request);
    if (!result.ok) return result;
    const validated = validateCoachResponseForRequest(request, result.data);
    return validated.success
      ? success(validated.data)
      : failure('INVALID_RESPONSE', validated.message, true);
  }
}
