import { validateHostHeader } from '@modelcontextprotocol/server';
import { z } from 'zod';

import { childCoachCapabilityMatches, childCoachRequestIsMcpEligible } from './child';
import {
  childCoachTextRequestV1Schema,
  MAX_VOICE_BYTES,
  parentTaskDraftRequestV1Schema,
  voiceTranscriptionMetadataV1Schema,
  type CapabilityTokenClaims,
  type VoiceTranscriptionMetadataV1,
} from '../../../src/models/boundedAi';
import {
  GHAF_MCP_PROTOCOL_VERSION,
  GHAF_MCP_TOOL_OPERATIONS,
  createGhafMcpHandler,
  type GhafMcpOperation,
} from './mcp';
import {
  executeChildCoach,
  executeParentTaskDraft,
  type BoundedAiOperationEnv,
  type GatewayOperationResult,
} from './operations';
import {
  BOUNDED_AI_OPERATION_POLICIES,
  reserveOperationCapacity,
  readBoundedBytes,
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
import { executeVoiceTranscription, type VoiceTranscriptionOperationEnv } from './voice';

export interface AiGatewayWorkerEnv extends BoundedAiOperationEnv, VoiceTranscriptionOperationEnv {
  readonly PARENT_DRAFT_RATE_LIMITER: RateLimitStore;
  readonly CHILD_TEXT_RATE_LIMITER: RateLimitStore;
  readonly CHILD_VOICE_RATE_LIMITER: RateLimitStore;
  readonly CAPABILITY_HMAC_SECRET: string;
  readonly CAPABILITY_ISSUER: string;
  readonly CAPABILITY_AUDIENCE: string;
  readonly ALLOWED_ORIGIN?: string;
  readonly MCP_ENABLED?: string;
  readonly MCP_ALLOWED_HOST?: string;
  readonly REPLAY_STORE?: ReplayStore;
  readonly OPERATION_BUDGET_STORE?: OperationBudgetStore;
}

const routeOperations = Object.freeze({
  '/v1/parent-task-drafts': 'draft_parent_task_v1',
  '/v1/child-coach/text': 'coach_approved_task_v1',
  '/v1/child-coach/transcriptions': 'transcribe_child_task_voice_v1',
} satisfies Record<string, BoundedAiOperation>);

const parentDraftEnvelopeSchema = z
  .object({
    operation: z.literal('draft_parent_task_v1'),
    request: parentTaskDraftRequestV1Schema,
  })
  .strict();

const childCoachEnvelopeSchema = z
  .object({
    operation: z.literal('coach_approved_task_v1'),
    request: childCoachTextRequestV1Schema,
  })
  .strict();

function voiceGrantMatches(
  claims: CapabilityTokenClaims,
  metadata: VoiceTranscriptionMetadataV1,
): boolean {
  return (
    claims.role === 'child' &&
    claims.grantVersion === metadata.grantVersion &&
    claims.noticeVersion === metadata.noticeVersion
  );
}

function operationResponse<T>(
  result: GatewayOperationResult<T>,
  operation: GhafMcpOperation,
  origin: string | null,
): Response {
  return result.ok
    ? safeJsonResponse(
        {
          ok: true,
          data: result.data,
          meta: { operation, schemaVersion: '1.0', origin: 'live' },
        },
        200,
        origin,
      )
    : safeErrorResponse(result.code, result.status, origin, true);
}

async function handleParentTaskDraft(
  request: Request,
  env: AiGatewayWorkerEnv,
  origin: string | null,
): Promise<Response> {
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    return safeErrorResponse('UNSUPPORTED_MEDIA_TYPE', 415, origin, true);
  }
  const body = await readBoundedJson(
    request,
    BOUNDED_AI_OPERATION_POLICIES.draft_parent_task_v1.maxBodyBytes,
  );
  if (!body.ok) return safeErrorResponse('INVALID_INPUT', 400, origin, true);
  const envelope = parentDraftEnvelopeSchema.safeParse(body.value);
  if (!envelope.success) return safeErrorResponse('INVALID_INPUT', 400, origin, true);
  return operationResponse(
    await executeParentTaskDraft(env, envelope.data.request),
    'draft_parent_task_v1',
    origin,
  );
}

async function handleChildCoach(
  request: Request,
  env: AiGatewayWorkerEnv,
  origin: string | null,
  claims: CapabilityTokenClaims,
): Promise<Response> {
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    return safeErrorResponse('UNSUPPORTED_MEDIA_TYPE', 415, origin, true);
  }
  const body = await readBoundedJson(
    request,
    BOUNDED_AI_OPERATION_POLICIES.coach_approved_task_v1.maxBodyBytes,
  );
  if (!body.ok) return safeErrorResponse('INVALID_INPUT', 400, origin, true);
  const envelope = childCoachEnvelopeSchema.safeParse(body.value);
  if (!envelope.success) return safeErrorResponse('INVALID_INPUT', 400, origin, true);
  if (!childCoachCapabilityMatches(claims, envelope.data.request)) {
    return safeErrorResponse('FORBIDDEN', 403, origin, true);
  }
  return operationResponse(
    await executeChildCoach(env, envelope.data.request),
    'coach_approved_task_v1',
    origin,
  );
}

const voiceFormFields = new Set([
  'operation',
  'schemaVersion',
  'requestId',
  'bindingNonce',
  'locale',
  'taskArchetypeId',
  'catalogVersion',
  'approvedTaskVersion',
  'noticeVersion',
  'grantVersion',
  'durationMs',
  'declaredByteCount',
  'mediaType',
  'synthetic',
  'audio',
]);

type RequestFormData = Awaited<ReturnType<Request['formData']>>;

function formText(form: RequestFormData, name: string): string | null {
  const values = form.getAll(name);
  return values.length === 1 && typeof values[0] === 'string' ? values[0] : null;
}

async function handleVoiceTranscription(
  request: Request,
  env: AiGatewayWorkerEnv,
  origin: string | null,
  claims: CapabilityTokenClaims,
): Promise<Response> {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith('multipart/form-data;')) {
    return safeErrorResponse('UNSUPPORTED_MEDIA_TYPE', 415, origin, true);
  }
  const boundedBody = await readBoundedBytes(
    request,
    BOUNDED_AI_OPERATION_POLICIES.transcribe_child_task_voice_v1.maxBodyBytes,
  );
  if (!boundedBody.ok) {
    return safeErrorResponse('BODY_TOO_LARGE', 413, origin, true);
  }

  let form: RequestFormData;
  try {
    form = await new Request(request.url, {
      method: 'POST',
      headers: { 'content-type': contentType },
      body: boundedBody.value.slice().buffer as ArrayBuffer,
    }).formData();
  } catch {
    return safeErrorResponse('INVALID_INPUT', 400, origin, true);
  } finally {
    boundedBody.value.fill(0);
  }
  const formKeys = (form as RequestFormData & { keys(): IterableIterator<string> }).keys();
  if ([...formKeys].some((name) => !voiceFormFields.has(name))) {
    return safeErrorResponse('INVALID_INPUT', 400, origin, true);
  }
  const audioValues = form.getAll('audio');
  const audio = audioValues.length === 1 ? audioValues[0] : null;
  if (!(audio instanceof Blob)) {
    return safeErrorResponse('INVALID_INPUT', 400, origin, true);
  }

  const metadata = voiceTranscriptionMetadataV1Schema.safeParse({
    operation: formText(form, 'operation'),
    schemaVersion: formText(form, 'schemaVersion'),
    requestId: formText(form, 'requestId'),
    bindingNonce: formText(form, 'bindingNonce'),
    locale: formText(form, 'locale'),
    taskArchetypeId: formText(form, 'taskArchetypeId'),
    catalogVersion: Number(formText(form, 'catalogVersion')),
    approvedTaskVersion: Number(formText(form, 'approvedTaskVersion')),
    noticeVersion: Number(formText(form, 'noticeVersion')),
    grantVersion: Number(formText(form, 'grantVersion')),
    durationMs: Number(formText(form, 'durationMs')),
    declaredByteCount: Number(formText(form, 'declaredByteCount')),
    mediaType: formText(form, 'mediaType'),
    synthetic: formText(form, 'synthetic') === 'true',
  });
  if (!metadata.success) return safeErrorResponse('INVALID_INPUT', 400, origin, true);
  if (audio.type !== metadata.data.mediaType) {
    return safeErrorResponse('UNSUPPORTED_MEDIA_TYPE', 415, origin, true);
  }
  if (audio.size > MAX_VOICE_BYTES) {
    return safeErrorResponse('BODY_TOO_LARGE', 413, origin, true);
  }
  if (audio.size !== metadata.data.declaredByteCount) {
    return safeErrorResponse('INVALID_INPUT', 400, origin, true);
  }
  if (!voiceGrantMatches(claims, metadata.data)) {
    return safeErrorResponse('FORBIDDEN', 403, origin, true);
  }

  const result = await executeVoiceTranscription(
    env,
    metadata.data,
    new Uint8Array(await audio.arrayBuffer()),
  );
  return result.ok
    ? safeJsonResponse(
        {
          ok: true,
          data: result.data,
          meta: {
            operation: 'transcribe_child_task_voice_v1',
            schemaVersion: '1.0',
            origin: 'live',
            deletionOutcome: 'deleted',
          },
        },
        200,
        origin,
      )
    : safeErrorResponse(result.code, result.status, origin, true);
}

function rateLimiterFor(env: AiGatewayWorkerEnv, operation: BoundedAiOperation): RateLimitStore {
  return operation === 'draft_parent_task_v1'
    ? env.PARENT_DRAFT_RATE_LIMITER
    : operation === 'coach_approved_task_v1'
      ? env.CHILD_TEXT_RATE_LIMITER
      : env.CHILD_VOICE_RATE_LIMITER;
}

async function authorizeOperation(
  request: Request,
  env: AiGatewayWorkerEnv,
  operation: BoundedAiOperation,
) {
  // Deployment requires atomic shared replay storage; local tests inject their adapter explicitly.
  if (!env.REPLAY_STORE) {
    return { ok: false, code: 'BUDGET_BLOCKED', status: 503 } as const;
  }
  const policy = BOUNDED_AI_OPERATION_POLICIES[operation];
  return verifyCapabilityRequest(request, {
    secret: env.CAPABILITY_HMAC_SECRET,
    issuer: env.CAPABILITY_ISSUER,
    audience: env.CAPABILITY_AUDIENCE,
    expectedRole: policy.role,
    expectedScope: operation,
    nowEpochSeconds: Math.floor(Date.now() / 1_000),
    replayStore: env.REPLAY_STORE,
  });
}

function withMcpResponseHeaders(response: Response, origin: string | null): Response {
  const headers = new Headers(response.headers);
  if (origin) headers.set('access-control-allow-origin', origin);
  headers.set('cache-control', 'no-store');
  headers.set('referrer-policy', 'no-referrer');
  headers.set('x-content-type-options', 'nosniff');
  headers.set('vary', 'Origin');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function mcpToolOperation(request: Request): GhafMcpOperation | null {
  const name = request.headers.get('mcp-name');
  return name && Object.hasOwn(GHAF_MCP_TOOL_OPERATIONS, name)
    ? GHAF_MCP_TOOL_OPERATIONS[name as keyof typeof GHAF_MCP_TOOL_OPERATIONS]
    : null;
}

async function handleMcp(request: Request, env: AiGatewayWorkerEnv): Promise<Response> {
  if (env.MCP_ENABLED !== 'true') return safeErrorResponse('INVALID_INPUT', 404, null, false);

  const origin = resolveAllowedOrigin(request.headers.get('origin'), env.ALLOWED_ORIGIN);
  if (origin === false) return safeErrorResponse('ORIGIN_DENIED', 403, null, false);
  const allowedHost = env.MCP_ALLOWED_HOST?.trim();
  if (!allowedHost) return safeErrorResponse('BUDGET_BLOCKED', 503, origin, false);
  if (!validateHostHeader(request.headers.get('host'), [allowedHost]).ok) {
    return safeErrorResponse('ORIGIN_DENIED', 403, origin, false);
  }
  if (request.method !== 'POST') {
    return safeErrorResponse('METHOD_NOT_ALLOWED', 405, origin, false);
  }
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    return safeErrorResponse('UNSUPPORTED_MEDIA_TYPE', 415, origin, false);
  }
  if (request.headers.get('mcp-protocol-version') !== GHAF_MCP_PROTOCOL_VERSION) {
    return safeErrorResponse('INVALID_INPUT', 400, origin, false);
  }

  const mcpMethod = request.headers.get('mcp-method');
  if (mcpMethod === 'server/discover' || mcpMethod === 'tools/list') {
    const body = await readBoundedJson(request, 4_096);
    if (!body.ok) return safeErrorResponse('INVALID_INPUT', 400, origin, false);
    const response = await createGhafMcpHandler({
      authorizedOperation: null,
      executeParentTaskDraft: (input) => executeParentTaskDraft(env, input),
      executeChildCoach: (input) => executeChildCoach(env, input),
    }).fetch(request, { parsedBody: body.value });
    return withMcpResponseHeaders(response, origin);
  }
  if (mcpMethod !== 'tools/call') {
    return safeErrorResponse('INVALID_INPUT', 404, origin, false);
  }

  const operation = mcpToolOperation(request);
  if (!operation) return safeErrorResponse('INVALID_INPUT', 404, origin, false);
  const authorization = await authorizeOperation(request, env, operation);
  if (!authorization.ok) {
    return safeErrorResponse(authorization.code, authorization.status, origin, true);
  }
  if (!env.OPERATION_BUDGET_STORE) {
    return safeErrorResponse('BUDGET_BLOCKED', 503, origin, true);
  }
  const capacity = await reserveOperationCapacity({
    operation,
    claims: authorization.claims,
    rateLimiter: rateLimiterFor(env, operation),
    budgetStore: env.OPERATION_BUDGET_STORE,
  });
  if (!capacity.ok) return safeErrorResponse(capacity.code, capacity.status, origin, true);

  try {
    const body = await readBoundedJson(
      request,
      BOUNDED_AI_OPERATION_POLICIES[operation].maxBodyBytes,
    );
    if (!body.ok) return safeErrorResponse('INVALID_INPUT', 400, origin, true);
    const claims = authorization.claims;
    const response = await createGhafMcpHandler({
      authorizedOperation: operation,
      executeParentTaskDraft: (input) => executeParentTaskDraft(env, input),
      executeChildCoach: async (input) =>
        childCoachRequestIsMcpEligible(input) && childCoachCapabilityMatches(claims, input)
          ? executeChildCoach(env, input)
          : { ok: false, code: 'FORBIDDEN', status: 403 },
    }).fetch(request, { parsedBody: body.value });
    return withMcpResponseHeaders(response, origin);
  } finally {
    await capacity.release();
  }
}

async function handle(request: Request, env: AiGatewayWorkerEnv): Promise<Response> {
  const pathname = new URL(request.url).pathname;
  if (pathname === '/mcp') return handleMcp(request, env);

  const origin = resolveAllowedOrigin(request.headers.get('origin'), env.ALLOWED_ORIGIN);
  if (origin === false) return safeErrorResponse('ORIGIN_DENIED', 403, null, false);
  const operation = routeOperations[pathname as keyof typeof routeOperations];
  if (!operation) return safeErrorResponse('INVALID_INPUT', 404, origin, false);
  if (request.method !== 'POST') {
    return safeErrorResponse('METHOD_NOT_ALLOWED', 405, origin, false);
  }
  const authorization = await authorizeOperation(request, env, operation);
  if (!authorization.ok) {
    return safeErrorResponse(authorization.code, authorization.status, origin, true);
  }
  if (!env.OPERATION_BUDGET_STORE) {
    return safeErrorResponse('BUDGET_BLOCKED', 503, origin, true);
  }
  const capacity = await reserveOperationCapacity({
    operation,
    claims: authorization.claims,
    rateLimiter: rateLimiterFor(env, operation),
    budgetStore: env.OPERATION_BUDGET_STORE,
  });
  if (!capacity.ok) {
    return safeErrorResponse(capacity.code, capacity.status, origin, true);
  }
  try {
    return operation === 'draft_parent_task_v1'
      ? await handleParentTaskDraft(request, env, origin)
      : operation === 'coach_approved_task_v1'
        ? await handleChildCoach(request, env, origin, authorization.claims)
        : await handleVoiceTranscription(request, env, origin, authorization.claims);
  } finally {
    await capacity.release();
  }
}

export default { fetch: handle };
