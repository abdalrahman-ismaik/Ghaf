import { describe, expect, it } from 'vitest';

import {
  createParentTaskDraftRequest,
  validateParentTaskDraftSuggestion,
} from '@/features/assistants/parentTaskDrafting';
import { P0_RECYCLING_TEMPLATE } from '@/features/tasks/demoContent';
import {
  parentTaskDraftRequestV1Schema,
  parentTaskDraftSuggestionV1Schema,
} from '@/models/boundedAi';
import { createPreparedParentTaskDraftSuggestion, serviceRegistry } from '@/services';

function journey() {
  const result = serviceRegistry.task.createDraft({
    childId: 'child_salem',
    templateId: P0_RECYCLING_TEMPLATE.id,
    parentText: {
      ar: 'افرز الورق والبلاستيك النظيفين بعد فحص شخص بالغ.',
      en: 'Sort clean paper and plastic after an adult check.',
    },
  });
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

function request() {
  const result = createParentTaskDraftRequest({
    journey: journey(),
    ageBand: '9_11',
    requestId: 'request_parent_f4_123',
    bindingNonce: 'binding_parent_f4_123',
    catalogVersion: 1,
    intent: 'make_clearer',
    effortBand: 'fifteen_thirty',
    stepCount: 2,
    supportMode: 'adult_alongside',
  });
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

describe('F4 Parent task drafting contracts', () => {
  it('accepts exactly the four reviewed initial archetypes', () => {
    const base = request().request;
    for (const archetypeId of ['task_recycling_p0_v1', 'GI01', 'HR02', 'LW01'] as const) {
      expect(
        parentTaskDraftRequestV1Schema.safeParse({ ...base, archetypeId }).success,
        archetypeId,
      ).toBe(true);
      expect(
        parentTaskDraftSuggestionV1Schema.safeParse(
          createPreparedParentTaskDraftSuggestion({
            requestId: base.requestId,
            bindingNonce: base.bindingNonce,
            archetypeId,
          }),
        ).success,
        archetypeId,
      ).toBe(true);
    }
  });

  it('builds a minimized request with no profile, task, reward, or free-text field', () => {
    const result = request();

    expect(parentTaskDraftRequestV1Schema.safeParse(result.request).success).toBe(true);
    expect(result.request).toEqual({
      operation: 'draft_parent_task_v1',
      schemaVersion: '1.0',
      requestId: 'request_parent_f4_123',
      bindingNonce: 'binding_parent_f4_123',
      localeSet: 'ar_en',
      ageBand: '9_11',
      archetypeId: 'task_recycling_p0_v1',
      catalogVersion: 1,
      intent: 'make_clearer',
      effortBand: 'fifteen_thirty',
      stepCount: 2,
      supportMode: 'adult_alongside',
    });
    expect(JSON.stringify(result.request)).not.toMatch(
      /Salem|سالم|child_salem|reward|seed|safety|note|parentText/iu,
    );
  });

  it('rejects unknown archetypes, free text, unknown keys, and broken step order', () => {
    const validRequest = request().request;
    expect(
      parentTaskDraftRequestV1Schema.safeParse({ ...validRequest, archetypeId: 'custom' }).success,
    ).toBe(false);
    expect(
      parentTaskDraftRequestV1Schema.safeParse({ ...validRequest, parentText: 'free text' })
        .success,
    ).toBe(false);

    const fixture = createPreparedParentTaskDraftSuggestion({
      requestId: validRequest.requestId,
      bindingNonce: validRequest.bindingNonce,
      archetypeId: validRequest.archetypeId,
    });
    expect(parentTaskDraftSuggestionV1Schema.safeParse(fixture).success).toBe(true);
    expect(
      parentTaskDraftSuggestionV1Schema.safeParse({ ...fixture, displayedSeedAward: 100 }).success,
    ).toBe(false);
    expect(
      parentTaskDraftSuggestionV1Schema.safeParse({
        ...fixture,
        steps: [
          { order: 2, text: { ar: 'خطوة', en: 'Step' } },
          { order: 1, text: { ar: 'خطوة أخرى', en: 'Another step' } },
        ],
      }).success,
    ).toBe(false);
  });

  it('requires exact request, binding, and archetype echoes before display', () => {
    const built = request();
    const fixture = createPreparedParentTaskDraftSuggestion({
      requestId: built.request.requestId,
      bindingNonce: built.request.bindingNonce,
      archetypeId: built.request.archetypeId,
    });

    expect(validateParentTaskDraftSuggestion(built.request, fixture)).toMatchObject({ ok: true });
    for (const candidate of [
      { ...fixture, requestId: 'different_request_123' },
      { ...fixture, bindingNonce: 'different_binding_123' },
      { ...fixture, archetypeId: 'GI01' },
    ]) {
      expect(validateParentTaskDraftSuggestion(built.request, candidate)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_RESPONSE' },
      });
    }
  });

  it('rejects prohibited Parent-assistant judgments even when the JSON shape is valid', () => {
    const built = request();
    const fixture = createPreparedParentTaskDraftSuggestion({
      requestId: built.request.requestId,
      bindingNonce: built.request.bindingNonce,
      archetypeId: built.request.archetypeId,
    });

    expect(
      validateParentTaskDraftSuggestion(built.request, {
        ...fixture,
        whyItMatters: {
          ar: 'هذا يثبت أن الطفل كسول وغير طبيعي.',
          en: 'This proves the child is lazy and abnormal.',
        },
      }),
    ).toMatchObject({ ok: false, error: { code: 'SAFETY_REJECTED' } });
  });
});
