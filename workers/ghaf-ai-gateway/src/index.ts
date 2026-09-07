import { z } from 'zod';

import {
  parentTaskDraftRequestV1Schema,
  type ParentTaskDraftRequestV1,
} from '../../../src/models/boundedAi';
import { validateParentTaskDraftSuggestion } from '../../../src/features/assistants/parentTaskDrafting';
import { createPreparedParentTaskDraftSuggestion } from '../../../src/services/mock/boundedAiFixtures';
import {
  BOUNDED_AI_OPERATION_POLICIES,
  MemoryReplayStore,
  reserveOperationCapacity,
  resolveAllowedOrigin,
  readBoundedJson,
  safeErrorResponse,
  safeJsonResponse,
  verifyCapabilityRequest,
  type BoundedAiOperation,
  type OperationBudgetStore,
  type RateLimitStore,
  type ReplayStore,
} from './security';

interface WorkersAiBinding {
  run(model: string, input: Record<string, unknown>): Promise<unknown>;
}

export interface AiGatewayWorkerEnv {
  readonly AI: WorkersAiBinding;
  readonly PARENT_DRAFT_RATE_LIMITER: RateLimitStore;
  readonly CHILD_TEXT_RATE_LIMITER: RateLimitStore;
  readonly CHILD_VOICE_RATE_LIMITER: RateLimitStore;
  readonly CAPABILITY_HMAC_SECRET: string;
  readonly CAPABILITY_ISSUER: string;
  readonly CAPABILITY_AUDIENCE: string;
  readonly ALLOWED_ORIGIN?: string;
  readonly PARENT_DRAFT_MODEL?: string;
  readonly REPLAY_STORE?: ReplayStore;
  readonly OPERATION_BUDGET_STORE?: OperationBudgetStore;
}

const routeOperations = Object.freeze({
  '/v1/parent-task-drafts': 'draft_parent_task_v1',
  '/v1/child-coach/text': 'coach_approved_task_v1',
  '/v1/child-coach/transcriptions': 'transcribe_child_task_voice_v1',
} satisfies Record<string, BoundedAiOperation>);

const localSyntheticReplayStore = new MemoryReplayStore();
const DEFAULT_PARENT_DRAFT_MODEL = '@cf/meta/llama-3.1-8b-instruct';

const parentDraftEnvelopeSchema = z
  .object({
    operation: z.literal('draft_parent_task_v1'),
    request: parentTaskDraftRequestV1Schema,
  })
  .strict();

function bilingualJsonSchema(maxLength: number) {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      ar: { type: 'string', minLength: 1, maxLength },
      en: { type: 'string', minLength: 1, maxLength },
    },
    required: ['ar', 'en'],
  } as const;
}

function parentDraftJsonSchema(request: ParentTaskDraftRequestV1) {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      schemaVersion: { type: 'string', enum: ['1.0'] },
      requestId: { type: 'string', enum: [request.requestId] },
      bindingNonce: { type: 'string', enum: [request.bindingNonce] },
      archetypeId: { type: 'string', enum: [request.archetypeId] },
      title: bilingualJsonSchema(120),
      positiveAction: bilingualJsonSchema(240),
      whyItMatters: bilingualJsonSchema(360),
      steps: {
        type: 'array',
        minItems: 1,
        maxItems: request.stepCount,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            order: { type: 'integer', minimum: 1, maximum: request.stepCount },
            text: bilingualJsonSchema(280),
          },
          required: ['order', 'text'],
        },
      },
      supportCue: bilingualJsonSchema(180),
    },
    required: [
      'schemaVersion',
      'requestId',
      'bindingNonce',
      'archetypeId',
      'title',
      'positiveAction',
      'whyItMatters',
      'steps',
      'supportCue',
    ],
  } as const;
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

function parentDraftPrompt(request: ParentTaskDraftRequestV1): string | null {
  const reviewed = createPreparedParentTaskDraftSuggestion({
    requestId: request.requestId,
    bindingNonce: request.bindingNonce,
    archetypeId: request.archetypeId,
  });
  if (!reviewed) return null;
  return [
    'Return one terminal bilingual Parent-facing task wording draft as strict JSON.',
    'Use Modern Standard Arabic and equivalent clear English.',
    'Transform copy only. Do not add reward, safety, privacy, eligibility, diagnosis, judgment, or personal data.',
    'Do not claim measured environmental impact or a real tree planted.',
    `Bounded controls: ${JSON.stringify(request)}`,
    `Reviewed server-owned archetype copy: ${JSON.stringify(reviewed)}`,
  ].join('\n');
}

async function runParentDraftModel(
  env: AiGatewayWorkerEnv,
  request: ParentTaskDraftRequestV1,
  timeoutMs: number,
): Promise<
  | { readonly status: 'ok'; readonly value: unknown }
  | { readonly status: 'timeout' }
  | { readonly status: 'error' }
> {
  const prompt = parentDraftPrompt(request);
  if (!prompt) return { status: 'error' };
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      env.AI.run(env.PARENT_DRAFT_MODEL?.trim() || DEFAULT_PARENT_DRAFT_MODEL, {
        messages: [
          {
            role: 'system',
            content: 'You are a bounded task copy transformation. Return only the requested JSON.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0,
        max_tokens: 1_200,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'ghaf_parent_task_draft_v1',
            strict: true,
            schema: parentDraftJsonSchema(request),
          },
        },
      }).then((value) => ({ status: 'ok' as const, value })),
      new Promise<{ readonly status: 'timeout' }>((resolve) => {
        timeout = setTimeout(() => resolve({ status: 'timeout' }), timeoutMs);
      }),
    ]);
  } catch {
    return { status: 'error' };
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

async function handleParentTaskDraft(
  request: Request,
  env: AiGatewayWorkerEnv,
  origin: string | null,
): Promise<Response> {
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    return safeErrorResponse('UNSUPPORTED_MEDIA_TYPE', 415, origin, true);
  }
  const policy = BOUNDED_AI_OPERATION_POLICIES.draft_parent_task_v1;
  const body = await readBoundedJson(request, policy.maxBodyBytes);
  if (!body.ok) return safeErrorResponse('INVALID_INPUT', 400, origin, true);
  const envelope = parentDraftEnvelopeSchema.safeParse(body.value);
  if (!envelope.success) return safeErrorResponse('INVALID_INPUT', 400, origin, true);

  const modelResult = await runParentDraftModel(
    env,
    envelope.data.request,
    policy.providerTimeoutMs,
  );
  if (modelResult.status === 'timeout') {
    return safeErrorResponse('TIMEOUT', 504, origin, true);
  }
  if (modelResult.status === 'error') {
    return safeErrorResponse('REMOTE_UNAVAILABLE', 503, origin, true);
  }
  const suggestion = validateParentTaskDraftSuggestion(
    envelope.data.request,
    unwrapModelResponse(modelResult.value),
  );
  if (!suggestion.ok) {
    const safety = suggestion.error.code === 'SAFETY_REJECTED';
    return safeErrorResponse(
      safety ? 'SAFETY_REJECTED' : 'INVALID_RESPONSE',
      safety ? 422 : 502,
      origin,
      true,
    );
  }
  return safeJsonResponse(
    {
      ok: true,
      data: suggestion.data,
      meta: { operation: 'draft_parent_task_v1', schemaVersion: '1.0', origin: 'live' },
    },
    200,
    origin,
  );
}

async function handle(request: Request, env: AiGatewayWorkerEnv): Promise<Response> {
  const origin = resolveAllowedOrigin(request.headers.get('origin'), env.ALLOWED_ORIGIN);
  if (origin === false) return safeErrorResponse('ORIGIN_DENIED', 403, null, false);
  const operation = routeOperations[new URL(request.url).pathname as keyof typeof routeOperations];
  if (!operation) return safeErrorResponse('INVALID_INPUT', 404, origin, false);
  if (request.method !== 'POST') {
    return safeErrorResponse('METHOD_NOT_ALLOWED', 405, origin, false);
  }
  const policy = BOUNDED_AI_OPERATION_POLICIES[operation];
  const authorization = await verifyCapabilityRequest(request, {
    secret: env.CAPABILITY_HMAC_SECRET,
    issuer: env.CAPABILITY_ISSUER,
    audience: env.CAPABILITY_AUDIENCE,
    expectedRole: policy.role,
    expectedScope: operation,
    nowEpochSeconds: Math.floor(Date.now() / 1_000),
    replayStore: env.REPLAY_STORE ?? localSyntheticReplayStore,
  });
  if (!authorization.ok) {
    return safeErrorResponse(authorization.code, authorization.status, origin, true);
  }

  const rateLimiter =
    operation === 'draft_parent_task_v1'
      ? env.PARENT_DRAFT_RATE_LIMITER
      : operation === 'coach_approved_task_v1'
        ? env.CHILD_TEXT_RATE_LIMITER
        : env.CHILD_VOICE_RATE_LIMITER;
  if (!env.OPERATION_BUDGET_STORE) {
    return safeErrorResponse('BUDGET_BLOCKED', 503, origin, true);
  }
  const capacity = await reserveOperationCapacity({
    operation,
    claims: authorization.claims,
    rateLimiter,
    budgetStore: env.OPERATION_BUDGET_STORE,
  });
  if (!capacity.ok) {
    return safeErrorResponse(capacity.code, capacity.status, origin, true);
  }
  try {
    return operation === 'draft_parent_task_v1'
      ? await handleParentTaskDraft(request, env, origin)
      : safeErrorResponse('BUDGET_BLOCKED', 503, origin, true);
  } finally {
    await capacity.release();
  }
}

export default { fetch: handle };
