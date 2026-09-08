import { z } from 'zod';

import type {
  DomainResult,
  LocalizedText,
  ParentGuideRequest,
  ParentGuideTaskSuggestion,
} from '../../models/familyGrowth';
import { P0_RECYCLING_TEMPLATE } from '../tasks/demoContent';
import { matchesCanonicalP0TaskContent } from '../tasks/validation';
import { evaluateAssistantSafety } from './policy';

export const LIVE_PARENT_GUIDE_OPERATION = 'refine_parent_task_v1' as const;
export const LIVE_PARENT_GUIDE_ID = 'live_parent_guide_v1' as const;

const localizedTextSchema = z
  .object({
    ar: z.string().trim().min(1).max(1_200),
    en: z.string().trim().min(1).max(1_200),
  })
  .strict();

const requestSchema = z
  .object({
    requestId: z.string().trim().min(1).max(120),
    intent: z.literal('make_clearer'),
    locale: z.enum(['ar', 'en']),
    child: z
      .object({
        id: z.literal('child_salem'),
        age: z.literal(9),
        ageBand: z.literal('9_11'),
        synthetic: z.literal(true),
      })
      .strict(),
    parentText: z
      .object({
        ar: z.string().trim().min(1).max(240),
        en: z.string().trim().min(1).max(240),
      })
      .strict(),
    taskTemplateId: z.literal('task_recycling_p0_v1'),
    taskVersion: z.literal(1),
    allowedCategoryId: z.literal('green_impact'),
    allowedSafety: z.unknown(),
    inputOrigin: z.literal('synthetic'),
  })
  .strict();

const payloadSchema = z
  .object({
    schemaVersion: z.literal('1.0'),
    requestId: z.string().trim().min(1).max(120),
    positiveAction: localizedTextSchema,
    whyItMatters: localizedTextSchema,
    definitionOfDone: localizedTextSchema,
    estimatedEffort: localizedTextSchema,
    permittedHelp: localizedTextSchema,
    supervision: localizedTextSchema,
  })
  .strict();

export interface LiveParentGuidePayload {
  readonly schemaVersion: '1.0';
  readonly requestId: string;
  readonly positiveAction: LocalizedText;
  readonly whyItMatters: LocalizedText;
  readonly definitionOfDone: LocalizedText;
  readonly estimatedEffort: LocalizedText;
  readonly permittedHelp: LocalizedText;
  readonly supervision: LocalizedText;
}

function failure(message: string, code: 'INVALID_INPUT' | 'INVALID_RESPONSE' | 'SAFETY_REJECTED') {
  return {
    ok: false as const,
    error: {
      code,
      message,
      retryable: false,
      fallbackAvailable: code !== 'INVALID_INPUT',
    },
  };
}

function sameValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function validateLiveParentGuideRequest(
  input: unknown,
): DomainResult<ParentGuideRequest & { readonly intent: 'make_clearer' }> {
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success || !sameValue(parsed.data.allowedSafety, P0_RECYCLING_TEMPLATE.safety)) {
    return failure(
      'Live Parent Guide accepts only the exact synthetic P0 request',
      'INVALID_INPUT',
    );
  }
  return {
    ok: true,
    data: parsed.data as ParentGuideRequest & { readonly intent: 'make_clearer' },
  };
}

export function createCanonicalLiveParentGuidePayload(
  request: Pick<ParentGuideRequest, 'requestId'>,
): LiveParentGuidePayload {
  return {
    schemaVersion: '1.0',
    requestId: request.requestId,
    positiveAction: P0_RECYCLING_TEMPLATE.positiveAction,
    whyItMatters: P0_RECYCLING_TEMPLATE.whyItMatters,
    definitionOfDone: P0_RECYCLING_TEMPLATE.definitionOfDone,
    estimatedEffort: P0_RECYCLING_TEMPLATE.estimatedEffort,
    permittedHelp: P0_RECYCLING_TEMPLATE.permittedHelp,
    supervision: P0_RECYCLING_TEMPLATE.supervision,
  };
}

export function liveParentGuideJsonSchema(request: Pick<ParentGuideRequest, 'requestId'>) {
  const canonical = createCanonicalLiveParentGuidePayload(request);
  const localizedEnum = (value: LocalizedText) => ({
    type: 'object',
    additionalProperties: false,
    properties: {
      ar: { type: 'string', enum: [value.ar] },
      en: { type: 'string', enum: [value.en] },
    },
    required: ['ar', 'en'],
  });
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      schemaVersion: { type: 'string', enum: ['1.0'] },
      requestId: { type: 'string', enum: [request.requestId] },
      positiveAction: localizedEnum(canonical.positiveAction),
      whyItMatters: localizedEnum(canonical.whyItMatters),
      definitionOfDone: localizedEnum(canonical.definitionOfDone),
      estimatedEffort: localizedEnum(canonical.estimatedEffort),
      permittedHelp: localizedEnum(canonical.permittedHelp),
      supervision: localizedEnum(canonical.supervision),
    },
    required: [
      'schemaVersion',
      'requestId',
      'positiveAction',
      'whyItMatters',
      'definitionOfDone',
      'estimatedEffort',
      'permittedHelp',
      'supervision',
    ],
  } as const;
}

export function validateLiveParentGuidePayload(
  request: ParentGuideRequest,
  input: unknown,
): DomainResult<LiveParentGuidePayload> {
  const parsed = payloadSchema.safeParse(input);
  if (!parsed.success || parsed.data.requestId !== request.requestId) {
    return failure('Live Parent Guide response is malformed or mismatched', 'INVALID_RESPONSE');
  }
  const canonical = createCanonicalLiveParentGuidePayload(request);
  if (!sameValue(parsed.data, canonical)) {
    return failure('Live Parent Guide response changed reviewed P0 content', 'SAFETY_REJECTED');
  }
  return { ok: true, data: parsed.data as LiveParentGuidePayload };
}

export function createLiveParentGuideSuggestion(
  request: ParentGuideRequest,
  input: unknown,
): DomainResult<ParentGuideTaskSuggestion> {
  const validRequest = validateLiveParentGuideRequest(request);
  if (!validRequest.ok) return validRequest;
  const payload = validateLiveParentGuidePayload(request, input);
  if (!payload.ok) return payload;
  const suggestedContent = {
    ...P0_RECYCLING_TEMPLATE,
    positiveAction: payload.data.positiveAction,
    whyItMatters: payload.data.whyItMatters,
    definitionOfDone: payload.data.definitionOfDone,
    estimatedEffort: payload.data.estimatedEffort,
    permittedHelp: payload.data.permittedHelp,
    supervision: payload.data.supervision,
    safety: request.allowedSafety,
  };
  if (!matchesCanonicalP0TaskContent(suggestedContent, 'exact_guide')) {
    return failure('Live Parent Guide result left the reviewed task boundary', 'SAFETY_REJECTED');
  }
  const safety = evaluateAssistantSafety({
    audience: 'parent',
    texts: [
      suggestedContent.positiveAction,
      suggestedContent.whyItMatters,
      suggestedContent.definitionOfDone,
      suggestedContent.estimatedEffort,
      suggestedContent.permittedHelp,
      suggestedContent.supervision,
    ],
  });
  if (!safety.accepted) {
    return failure('Live Parent Guide result failed local safety review', 'SAFETY_REJECTED');
  }
  return {
    ok: true,
    data: {
      meta: {
        requestId: request.requestId,
        audience: 'parent',
        origin: 'live',
        fixtureId: LIVE_PARENT_GUIDE_ID,
        fallbackUsed: false,
        fallbackReason: null,
        disclosure: {
          text: {
            ar: 'اقتراح مباشر بالذكاء الاصطناعي لطلب اصطناعي مُراجع. قد يكون غير صحيح، ووليّ الأمر هو صاحب القرار.',
            en: 'Live AI suggestion for a reviewed synthetic request. AI may be wrong; the Parent decides.',
          },
          saysAiMayBeWrong: true,
          saysHumanDecides: true,
          preparedIsExplicit: false,
        },
      },
      originalParentText: request.parentText,
      suggestedContent,
      changedFields: [
        'positiveAction',
        'whyItMatters',
        'definitionOfDone',
        'estimatedEffort',
        'permittedHelp',
        'supervision',
        'safety',
      ],
      availableActions: ['accept_suggestion', 'keep_mine', 'make_smaller'],
      accepted: false,
    },
  };
}

export function validateLiveParentGuideSuggestion(
  request: ParentGuideRequest,
  suggestion: ParentGuideTaskSuggestion,
): boolean {
  if (
    suggestion.meta.origin !== 'live' ||
    suggestion.meta.fixtureId !== LIVE_PARENT_GUIDE_ID ||
    suggestion.meta.fallbackUsed ||
    suggestion.meta.fallbackReason !== null ||
    suggestion.meta.disclosure.preparedIsExplicit ||
    !suggestion.meta.disclosure.saysAiMayBeWrong ||
    !suggestion.meta.disclosure.saysHumanDecides
  ) {
    return false;
  }
  const recreated = createLiveParentGuideSuggestion(request, {
    schemaVersion: '1.0',
    requestId: suggestion.meta.requestId,
    positiveAction: suggestion.suggestedContent.positiveAction,
    whyItMatters: suggestion.suggestedContent.whyItMatters,
    definitionOfDone: suggestion.suggestedContent.definitionOfDone,
    estimatedEffort: suggestion.suggestedContent.estimatedEffort,
    permittedHelp: suggestion.suggestedContent.permittedHelp,
    supervision: suggestion.suggestedContent.supervision,
  });
  return recreated.ok && sameValue(recreated.data, suggestion);
}
