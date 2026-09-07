import { evaluateAssistantSafety } from '../../../src/features/assistants/policy';
import { validateParentTaskDraftSuggestion } from '../../../src/features/assistants/parentTaskDrafting';
import {
  childCoachTextRequestV1Schema,
  childCoachTextResponseV1Schema,
  parentTaskDraftRequestV1Schema,
  type ChildCoachTextRequestV1,
  type ChildCoachTextResponseV1,
  type ParentTaskDraftRequestV1,
  type ParentTaskDraftSuggestionV1,
} from '../../../src/models/boundedAi';
import {
  createPreparedChildCoachResponse,
  createPreparedParentTaskDraftSuggestion,
} from '../../../src/services/mock/boundedAiFixtures';
import { childCoachRequestIsSafe } from './child';
import { BOUNDED_AI_OPERATION_POLICIES, type GatewayErrorCode } from './security';

export interface WorkersAiBinding {
  run(model: string, input: Record<string, unknown>): Promise<unknown>;
}

export interface BoundedAiOperationEnv {
  readonly AI: WorkersAiBinding;
  readonly PARENT_DRAFT_MODEL?: string;
  readonly CHILD_COACH_MODEL?: string;
}

export type GatewayOperationResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly code: GatewayErrorCode; readonly status: number };

const DEFAULT_PARENT_DRAFT_MODEL = '@cf/meta/llama-3.1-8b-instruct';
const DEFAULT_CHILD_COACH_MODEL = '@cf/meta/llama-3.1-8b-instruct';

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

function nullableBilingualJsonSchema(maxLength: number) {
  return { anyOf: [bilingualJsonSchema(maxLength), { type: 'null' }] } as const;
}

function childCoachJsonSchema(request: ChildCoachTextRequestV1) {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      schemaVersion: { type: 'string', enum: ['1.0'] },
      requestId: { type: 'string', enum: [request.requestId] },
      taskBindingNonce: { type: 'string', enum: [request.taskBindingNonce] },
      intent: { type: 'string', enum: [request.intent] },
      disposition: { type: 'string', enum: ['coach', 'ask_adult', 'decline'] },
      steps: {
        type: 'array',
        maxItems: request.ageBand === '6_8' ? 1 : 3,
        items: bilingualJsonSchema(180),
      },
      ifThenCue: nullableBilingualJsonSchema(180),
      reflectionQuestion: nullableBilingualJsonSchema(180),
      reviewedPhrase: nullableBilingualJsonSchema(180),
      terminal: { type: 'boolean', enum: [true] },
    },
    required: [
      'schemaVersion',
      'requestId',
      'taskBindingNonce',
      'intent',
      'disposition',
      'steps',
      'ifThenCue',
      'reflectionQuestion',
      'reviewedPhrase',
      'terminal',
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

async function runJsonModel(input: {
  readonly env: BoundedAiOperationEnv;
  readonly model: string;
  readonly timeoutMs: number;
  readonly prompt: string;
  readonly schemaName: string;
  readonly schema: Record<string, unknown>;
  readonly maxTokens: number;
}) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      input.env.AI.run(input.model, {
        messages: [
          {
            role: 'system',
            content:
              'You are a bounded Ghaf task transformation. Return only the requested strict JSON.',
          },
          { role: 'user', content: input.prompt },
        ],
        temperature: 0,
        max_tokens: input.maxTokens,
        response_format: {
          type: 'json_schema',
          json_schema: { name: input.schemaName, strict: true, schema: input.schema },
        },
      }).then((value) => ({ status: 'ok' as const, value })),
      new Promise<{ readonly status: 'timeout' }>((resolve) => {
        timeout = setTimeout(() => resolve({ status: 'timeout' }), input.timeoutMs);
      }),
    ]);
  } catch {
    return { status: 'error' as const };
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function executeParentTaskDraft(
  env: BoundedAiOperationEnv,
  input: ParentTaskDraftRequestV1,
): Promise<GatewayOperationResult<ParentTaskDraftSuggestionV1>> {
  const parsed = parentTaskDraftRequestV1Schema.safeParse(input);
  if (!parsed.success) return { ok: false, code: 'INVALID_INPUT', status: 400 };
  const request = parsed.data;
  const reviewed = createPreparedParentTaskDraftSuggestion({
    requestId: request.requestId,
    bindingNonce: request.bindingNonce,
    archetypeId: request.archetypeId,
  });
  if (!reviewed) return { ok: false, code: 'INVALID_INPUT', status: 400 };
  const modelResult = await runJsonModel({
    env,
    model: env.PARENT_DRAFT_MODEL?.trim() || DEFAULT_PARENT_DRAFT_MODEL,
    timeoutMs: BOUNDED_AI_OPERATION_POLICIES.draft_parent_task_v1.providerTimeoutMs,
    prompt: [
      'Return one terminal bilingual Parent-facing task wording draft as strict JSON.',
      'Use Modern Standard Arabic and equivalent clear English.',
      'Transform copy only. Do not add reward, safety, privacy, eligibility, diagnosis, judgment, or personal data.',
      'Do not claim measured environmental impact or a real tree planted.',
      `Bounded controls: ${JSON.stringify(request)}`,
      `Reviewed server-owned archetype copy: ${JSON.stringify(reviewed)}`,
    ].join('\n'),
    schemaName: 'ghaf_parent_task_draft_v1',
    schema: parentDraftJsonSchema(request),
    maxTokens: 1_200,
  });
  if (modelResult.status === 'timeout') return { ok: false, code: 'TIMEOUT', status: 504 };
  if (modelResult.status === 'error') {
    return { ok: false, code: 'REMOTE_UNAVAILABLE', status: 503 };
  }
  const suggestion = validateParentTaskDraftSuggestion(
    request,
    unwrapModelResponse(modelResult.value),
  );
  if (!suggestion.ok) {
    const safety = suggestion.error.code === 'SAFETY_REJECTED';
    return {
      ok: false,
      code: safety ? 'SAFETY_REJECTED' : 'INVALID_RESPONSE',
      status: safety ? 422 : 502,
    };
  }
  return { ok: true, data: suggestion.data };
}

function validateChildCoachOutput(request: ChildCoachTextRequestV1, input: unknown) {
  const parsed = childCoachTextResponseV1Schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, safety: false };
  const response = parsed.data;
  const texts = [
    ...response.steps,
    ...(response.ifThenCue ? [response.ifThenCue] : []),
    ...(response.reflectionQuestion ? [response.reflectionQuestion] : []),
    ...(response.reviewedPhrase ? [response.reviewedPhrase] : []),
  ];
  const maximumSteps = request.ageBand === '6_8' ? 1 : 3;
  if (
    response.requestId !== request.requestId ||
    response.taskBindingNonce !== request.taskBindingNonce ||
    response.intent !== request.intent ||
    response.steps.length > maximumSteps ||
    (response.disposition !== 'coach' && response.steps.length !== 0) ||
    (response.disposition === 'coach' && texts.length === 0)
  ) {
    return { ok: false as const, safety: false };
  }
  if (!evaluateAssistantSafety({ audience: 'child', texts }).accepted) {
    return { ok: false as const, safety: true };
  }
  return { ok: true as const, data: response };
}

export async function executeChildCoach(
  env: BoundedAiOperationEnv,
  input: ChildCoachTextRequestV1,
): Promise<GatewayOperationResult<ChildCoachTextResponseV1>> {
  const parsed = childCoachTextRequestV1Schema.safeParse(input);
  if (!parsed.success) return { ok: false, code: 'INVALID_INPUT', status: 400 };
  const request = parsed.data;
  if (!childCoachRequestIsSafe(request)) {
    return { ok: false, code: 'SAFETY_REJECTED', status: 422 };
  }
  const reviewed = createPreparedChildCoachResponse(request);
  const modelResult = await runJsonModel({
    env,
    model: env.CHILD_COACH_MODEL?.trim() || DEFAULT_CHILD_COACH_MODEL,
    timeoutMs: BOUNDED_AI_OPERATION_POLICIES.coach_approved_task_v1.providerTimeoutMs,
    prompt: [
      'Return one terminal bilingual Child task-coaching card as strict JSON.',
      'Use Modern Standard Arabic and equivalent clear English.',
      'Stay within the current reviewed task and intent. Never ask for secrets, more conversation, or personal data.',
      'Do not diagnose, infer feelings or character, make religious judgments, or change any reward or task authority.',
      `Bounded request: ${JSON.stringify(request)}`,
      `Reviewed server-owned safe pattern: ${JSON.stringify(reviewed)}`,
    ].join('\n'),
    schemaName: 'ghaf_child_coach_text_v1',
    schema: childCoachJsonSchema(request),
    maxTokens: 800,
  });
  if (modelResult.status === 'timeout') return { ok: false, code: 'TIMEOUT', status: 504 };
  if (modelResult.status === 'error') {
    return { ok: false, code: 'REMOTE_UNAVAILABLE', status: 503 };
  }
  const response = validateChildCoachOutput(request, unwrapModelResponse(modelResult.value));
  if (!response.ok) {
    return {
      ok: false,
      code: response.safety ? 'SAFETY_REJECTED' : 'INVALID_RESPONSE',
      status: response.safety ? 422 : 502,
    };
  }
  return { ok: true, data: response.data };
}
