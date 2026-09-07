import {
  BOUNDED_AI_OPERATION_POLICIES,
  MemoryReplayStore,
  reserveOperationCapacity,
  resolveAllowedOrigin,
  safeErrorResponse,
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
  readonly REPLAY_STORE?: ReplayStore;
  readonly OPERATION_BUDGET_STORE?: OperationBudgetStore;
}

const routeOperations = Object.freeze({
  '/v1/parent-task-drafts': 'draft_parent_task_v1',
  '/v1/child-coach/text': 'coach_approved_task_v1',
  '/v1/child-coach/transcriptions': 'transcribe_child_task_voice_v1',
} satisfies Record<string, BoundedAiOperation>);

const localSyntheticReplayStore = new MemoryReplayStore();

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
  await capacity.release();

  return safeErrorResponse('BUDGET_BLOCKED', 503, origin, true);
}

export default { fetch: handle };
