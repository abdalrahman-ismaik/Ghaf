import {
  LIVE_PARENT_GUIDE_OPERATION,
  liveParentGuideJsonSchema,
  validateLiveParentGuidePayload,
  validateLiveParentGuideRequest,
} from '../../../src/features/assistants/liveParentGuide';

interface WorkersAiBinding {
  run(model: string, input: Record<string, unknown>): Promise<unknown>;
}

interface RateLimitBinding {
  limit(input: { readonly key: string }): Promise<{ readonly success: boolean }>;
}

export interface ParentGuideWorkerEnv {
  readonly AI: WorkersAiBinding;
  readonly PARENT_GUIDE_RATE_LIMITER: RateLimitBinding;
  readonly GHAF_DEMO_ACCESS_TOKEN: string;
  readonly AI_MODEL?: string;
  readonly ALLOWED_ORIGIN?: string;
}

interface GatewayRequestBody {
  readonly operation: unknown;
  readonly request: unknown;
}

const DEFAULT_MODEL = '@cf/meta/llama-3.1-8b-instruct';
const ROUTE = '/v1/parent-guide/refine';
const MAX_BODY_BYTES = 12_000;

function corsOrigin(request: Request, env: ParentGuideWorkerEnv): string | null | false {
  const origin = request.headers.get('origin');
  if (!origin) return null;
  const allowed = env.ALLOWED_ORIGIN?.trim();
  return allowed && origin === allowed ? origin : false;
}

function responseHeaders(origin: string | null): HeadersInit {
  return {
    ...(origin ? { 'access-control-allow-origin': origin } : {}),
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8',
    'referrer-policy': 'no-referrer',
    'x-content-type-options': 'nosniff',
    vary: 'Origin',
  };
}

function json(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders(origin),
  });
}

function errorResponse(
  code: string,
  message: string,
  status: number,
  origin: string | null,
): Response {
  return json({ ok: false, error: { code, message } }, status, origin);
}

function constantTimeEqual(left: string, right: string): boolean {
  const leftBytes = new TextEncoder().encode(left);
  const rightBytes = new TextEncoder().encode(right);
  const length = Math.max(leftBytes.length, rightBytes.length);
  let difference = leftBytes.length ^ rightBytes.length;
  for (let index = 0; index < length; index += 1) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }
  return difference === 0;
}

function bearerToken(request: Request): string | null {
  const value = request.headers.get('authorization');
  const match = /^Bearer ([^\s]+)$/u.exec(value ?? '');
  return match?.[1] ?? null;
}

function unwrapModelResponse(input: unknown): unknown {
  if (!input || typeof input !== 'object') return null;
  const response = (input as { readonly response?: unknown }).response;
  if (typeof response === 'string') {
    try {
      return JSON.parse(response) as unknown;
    } catch {
      return null;
    }
  }
  return response ?? input;
}

function modelPrompt(input: GatewayRequestBody): string {
  return [
    'Transform the exact synthetic Ghaf Parent request into the reviewed bilingual task structure.',
    'Return only JSON matching the supplied schema; do not add fields or commentary.',
    'Use the exact reviewed Modern Standard Arabic and English strings required by the schema.',
    'Do not infer Child traits, emotion, diagnosis, truthfulness, religiosity, or family quality.',
    'Do not change task identity, safety, reward, privacy, or Parent approval authority.',
    `Synthetic request JSON: ${JSON.stringify(input.request)}`,
  ].join('\n');
}

function parseBody(text: string): GatewayRequestBody | null {
  let value: unknown;
  try {
    value = JSON.parse(text) as unknown;
  } catch {
    return null;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  if (
    keys.length !== 2 ||
    !keys.every((key) => key === 'operation' || key === 'request') ||
    !keys.includes('operation') ||
    !keys.includes('request')
  ) {
    return null;
  }
  return { operation: record.operation, request: record.request };
}

async function handle(request: Request, env: ParentGuideWorkerEnv): Promise<Response> {
  const origin = corsOrigin(request, env);
  if (origin === false) return errorResponse('ORIGIN_DENIED', 'Origin is not allowed', 403, null);
  const responseOrigin = origin;
  const url = new URL(request.url);
  if (url.pathname !== ROUTE)
    return errorResponse('NOT_FOUND', 'Route not found', 404, responseOrigin);
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...responseHeaders(responseOrigin),
        'access-control-allow-headers': 'authorization, content-type',
        'access-control-allow-methods': 'POST, OPTIONS',
        'access-control-max-age': '600',
      },
    });
  }
  if (request.method !== 'POST') {
    return errorResponse('METHOD_NOT_ALLOWED', 'POST is required', 405, responseOrigin);
  }

  const configuredToken = env.GHAF_DEMO_ACCESS_TOKEN?.trim();
  const providedToken = bearerToken(request);
  if (!configuredToken || !providedToken || !constantTimeEqual(providedToken, configuredToken)) {
    return errorResponse('UNAUTHORIZED', 'Authentication is required', 401, responseOrigin);
  }

  const rate = await env.PARENT_GUIDE_RATE_LIMITER.limit({
    key: 'authenticated-parent-guide',
  });
  if (!rate.success) {
    return errorResponse('RATE_LIMITED', 'Please retry later', 429, responseOrigin);
  }

  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    return errorResponse('INVALID_INPUT', 'JSON content type is required', 415, responseOrigin);
  }

  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return errorResponse('BODY_TOO_LARGE', 'Request body is too large', 413, responseOrigin);
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
    return errorResponse('BODY_TOO_LARGE', 'Request body is too large', 413, responseOrigin);
  }

  const body = parseBody(text);
  if (!body)
    return errorResponse('INVALID_INPUT', 'Valid contract JSON is required', 400, responseOrigin);
  if (body.operation !== LIVE_PARENT_GUIDE_OPERATION) {
    return errorResponse('INVALID_INPUT', 'Unknown operation', 400, responseOrigin);
  }
  const validatedRequest = validateLiveParentGuideRequest(body.request);
  if (!validatedRequest.ok) {
    return errorResponse(
      'INVALID_INPUT',
      'Request is outside the synthetic Parent scope',
      400,
      responseOrigin,
    );
  }

  const model = env.AI_MODEL?.trim() || DEFAULT_MODEL;
  let result: unknown;
  try {
    result = await env.AI.run(model, {
      messages: [
        {
          role: 'system',
          content: 'You are a bounded Parent task-structuring service. Return only reviewed JSON.',
        },
        { role: 'user', content: modelPrompt(body) },
      ],
      temperature: 0,
      max_tokens: 1_600,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'ghaf_parent_guide_v1',
          strict: true,
          schema: liveParentGuideJsonSchema(validatedRequest.data),
        },
      },
    });
  } catch {
    return errorResponse('REMOTE_UNAVAILABLE', 'Model service is unavailable', 503, responseOrigin);
  }

  const payload = unwrapModelResponse(result);
  const validatedPayload = validateLiveParentGuidePayload(validatedRequest.data, payload);
  if (!validatedPayload.ok) {
    return errorResponse('INVALID_RESPONSE', 'Model output failed validation', 502, responseOrigin);
  }
  return json(
    {
      ok: true,
      data: validatedPayload.data,
      provider: { name: 'cloudflare-workers-ai', model },
    },
    200,
    responseOrigin,
  );
}

export default { fetch: handle };
