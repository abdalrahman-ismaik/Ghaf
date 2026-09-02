import type { CoachRequest, CoachResponse } from '../../models/prototype';
import type { AIService, ServiceResult } from '../../services/interfaces';
import { coachRequestSchema, validateCoachResponseForRequest } from './validation';

function invalidInput(message: string): ServiceResult<CoachResponse> {
  return {
    ok: false,
    error: { code: 'INVALID_INPUT', message, retryable: false, fallbackAvailable: false },
  };
}

export async function respondToCoachWithFallback(
  request: CoachRequest,
  primaryService: AIService,
  fallbackService: AIService,
): Promise<ServiceResult<CoachResponse>> {
  const parsedRequest = coachRequestSchema.safeParse(request);
  if (!parsedRequest.success)
    return invalidInput(parsedRequest.error.issues[0]?.message ?? 'Invalid Coach request');

  try {
    const primary = await primaryService.respondToCoach(request);
    if (primary.ok) {
      const validated = validateCoachResponseForRequest(request, primary.data);
      if (validated.success) return { ...primary, data: validated.data };
    } else if (!primary.error.fallbackAvailable) {
      return primary;
    }
  } catch {
    // The deterministic provider below is the required offline path.
  }

  const fallback = await fallbackService.respondToCoach(request);
  if (!fallback.ok) return fallback;
  const validatedFallback = validateCoachResponseForRequest(request, fallback.data);
  if (!validatedFallback.success) {
    return {
      ok: false,
      error: {
        code: 'INVALID_RESPONSE',
        message: validatedFallback.message,
        retryable: false,
        fallbackAvailable: false,
      },
    };
  }
  return {
    ok: true,
    data: validatedFallback.data,
    meta: { origin: 'pregenerated-mock', fallbackUsed: true },
  };
}
