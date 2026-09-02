import {
  GENERATION_STAGE_IDS,
  type ChildProfile,
  type GeneratedMissionPayload,
  type MissionInput,
} from '../../models/prototype';
import type { AIService, ServiceResult } from '../../services/interfaces';
import { generatedMissionPayloadSchema } from './validation';

export const GENERATION_STAGES = GENERATION_STAGE_IDS;

export interface GeneratedMissionResult {
  readonly attemptId: string;
  readonly input: MissionInput;
  readonly payload: GeneratedMissionPayload;
}

export interface GenerateMissionOptions {
  readonly input: MissionInput;
  readonly attemptId: string;
  readonly child: Pick<ChildProfile, 'id' | 'ageBand'>;
  readonly primaryService: AIService;
  readonly fallbackService: AIService;
  readonly primaryMode?: 'mock' | 'live-optional';
}

function invalidResponse(message: string): ServiceResult<GeneratedMissionResult> {
  return {
    ok: false,
    error: {
      code: 'INVALID_RESPONSE',
      message,
      retryable: false,
      fallbackAvailable: false,
    },
  };
}

async function invokeProvider(
  service: AIService,
  request: Parameters<AIService['generateMission']>[0],
  fallbackAvailable: boolean,
): Promise<ServiceResult<GeneratedMissionPayload>> {
  try {
    return await service.generateMission(request);
  } catch {
    return {
      ok: false,
      error: {
        code: 'REMOTE_UNAVAILABLE',
        message: 'Mission provider unavailable',
        retryable: fallbackAvailable,
        fallbackAvailable,
      },
    };
  }
}

export async function generateMissionWithFallback({
  input,
  attemptId,
  child,
  primaryService,
  fallbackService,
  primaryMode = 'live-optional',
}: GenerateMissionOptions): Promise<ServiceResult<GeneratedMissionResult>> {
  const primaryRequest = {
    attemptId,
    child,
    input,
    mode: primaryMode,
  };
  const primary = await invokeProvider(primaryService, primaryRequest, true);

  if (primary.ok) {
    const parsed = generatedMissionPayloadSchema.safeParse(primary.data);
    if (parsed.success) {
      return {
        ok: true,
        data: { attemptId, input, payload: primary.data },
        meta: primary.meta,
      };
    }
  } else if (!primary.error.fallbackAvailable) {
    return primary;
  }

  const fallback = await invokeProvider(
    fallbackService,
    { ...primaryRequest, mode: 'mock' },
    false,
  );
  if (!fallback.ok) return fallback;
  const parsedFallback = generatedMissionPayloadSchema.safeParse(fallback.data);
  if (!parsedFallback.success) {
    return invalidResponse(
      parsedFallback.error.issues[0]?.message ?? 'Pregenerated mission payload is invalid',
    );
  }

  return {
    ok: true,
    data: { attemptId, input, payload: fallback.data },
    meta: { origin: 'pregenerated-mock', fallbackUsed: true },
  };
}
