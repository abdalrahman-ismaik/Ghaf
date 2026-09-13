import { describe, expect, it } from 'vitest';

import {
  applyParentTaskDraftSuggestion,
  createTaskAuthoritySnapshot,
  PARENT_TASK_DRAFT_ATTRIBUTION,
  taskAuthorityValue,
} from '@/features/assistants/parentTaskDrafting';
import { P0_RECYCLING_TEMPLATE } from '@/features/tasks/demoContent';
import type { ParentTaskDraftSuggestionV1 } from '@/models/boundedAi';
import type { TaskJourney } from '@/models/familyGrowth';
import { serviceRegistry } from '@/services';

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

const suggestion: ParentTaskDraftSuggestionV1 = {
  schemaVersion: '1.0',
  requestId: 'request_parent_map_123',
  bindingNonce: 'binding_parent_map_123',
  archetypeId: 'task_recycling_p0_v1',
  title: { ar: 'فرز المواد النظيفة بأمان', en: 'Sort clean items safely' },
  positiveAction: {
    ar: 'افرز الورق والبلاستيك النظيفين بعد فحص شخص بالغ.',
    en: 'Sort clean paper and plastic after an adult check.',
  },
  whyItMatters: {
    ar: 'يساعد الفرز الدقيق الأسرة على التعامل بمسؤولية مع المواد القابلة لإعادة التدوير.',
    en: 'Careful sorting helps the household handle recyclable materials responsibly.',
  },
  steps: [
    {
      order: 1,
      text: {
        ar: 'اطلب من شخص بالغ فحص المواد أولاً.',
        en: 'Ask an adult to check the items first.',
      },
    },
    {
      order: 2,
      text: {
        ar: 'افرز الورق والبلاستيك النظيفين فقط.',
        en: 'Sort only the clean paper and plastic.',
      },
    },
  ],
  supportCue: {
    ar: 'يمكن طلب مساعدة شخص بالغ في أي وقت.',
    en: 'Adult help can be requested at any time.',
  },
};

describe('F4 copy-only authority mapper', () => {
  it('changes only allowlisted copy and preserves every task authority', () => {
    const before = journey();
    const snapshot = createTaskAuthoritySnapshot(before, 4);
    const result = applyParentTaskDraftSuggestion(before, snapshot, suggestion, 4);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(taskAuthorityValue(result.data)).toEqual(taskAuthorityValue(before));
    expect(result.data.task).toMatchObject({
      id: before.task.id,
      version: before.task.version,
      templateId: before.task.templateId,
      targetChildId: before.task.targetChildId,
      parentOriginalText: before.task.parentOriginalText,
      acceptedGuideFixtureId: PARENT_TASK_DRAFT_ATTRIBUTION,
      content: {
        title: suggestion.title,
        positiveAction: suggestion.positiveAction,
        whyItMatters: suggestion.whyItMatters,
        permittedHelp: before.task.content.permittedHelp,
      },
    });
    expect(result.data.assignment).toBeNull();
    expect(result.data.lifecycle).toBe('draft');
    expect(result.data.task.content.permittedHelp).not.toEqual(suggestion.supportCue);
  });

  it('rejects every stale authority mutation and draft revision change', () => {
    const before = journey();
    const snapshot = createTaskAuthoritySnapshot(before, 4);
    const contentMutation = (patch: Partial<TaskJourney['task']['content']>): TaskJourney => ({
      ...before,
      task: { ...before.task, content: { ...before.task.content, ...patch } },
    });
    const mutations: readonly (readonly [string, TaskJourney])[] = [
      ['lifecycle', { ...before, lifecycle: 'reviewed' }],
      ['task id', { ...before, task: { ...before.task, id: 'different_task' } }],
      ['task version', { ...before, task: { ...before.task, version: 2 } }],
      ['template id', { ...before, task: { ...before.task, templateId: 'GI01' } }],
      ['target Child', { ...before, task: { ...before.task, targetChildId: 'child_alya' } }],
      [
        'Parent baseline',
        {
          ...before,
          task: {
            ...before.task,
            parentOriginalText: { ar: 'صياغة أخرى', en: 'Different wording' },
          },
        },
      ],
      ['task origin', { ...before, task: { ...before.task, origin: 'prepared' } }],
      [
        'assignment',
        {
          ...before,
          assignment: {
            id: 'assignment_stale',
            taskId: before.task.id,
            taskVersion: before.task.version,
            childId: before.task.targetChildId,
            approvedByParent: true,
            approvalSequence: 1,
            createdAt: '2026-09-07T10:00:00.000Z',
          },
        },
      ],
      ['content id', contentMutation({ id: 'GI01' })],
      ['category', contentMutation({ categoryId: 'home_responsibility' })],
      ['landscape', contentMutation({ landscapeId: 'samar' })],
      ['age bands', contentMutation({ childAgeBands: ['6_8'] })],
      [
        'estimated effort',
        contentMutation({ estimatedEffort: { ar: 'وقت آخر', en: 'Different effort' } }),
      ],
      ['permitted help', contentMutation({ permittedHelp: suggestion.supportCue })],
      [
        'supervision',
        contentMutation({ supervision: { ar: 'إشراف آخر', en: 'Different supervision' } }),
      ],
      [
        'safety',
        contentMutation({
          safety: { ...before.task.content.safety, childAllowedActions: [] },
        }),
      ],
      ['evidence policy', contentMutation({ evidencePolicy: 'none' })],
      ['reflection policy', contentMutation({ reflectionPolicy: 'none' })],
      ['recognition mode', contentMutation({ recognitionMode: 'fade_first' })],
      ['routine phase', contentMutation({ routinePhase: 'maintenance' })],
      ['recurrence', contentMutation({ recurrence: 'recurrent' })],
      ['displayed award', contentMutation({ displayedSeedAward: 15 })],
      ['visibility', contentMutation({ visibilityScope: 'child_guardian' })],
      ['Circle eligibility', contentMutation({ circleEligible: false })],
      [
        'privacy notice',
        contentMutation({ privacyNotice: { ar: 'نطاق آخر', en: 'Different privacy' } }),
      ],
    ];

    for (const [label, mutation] of mutations) {
      expect(
        applyParentTaskDraftSuggestion(mutation, snapshot, suggestion, 4),
        label,
      ).toMatchObject({
        ok: false,
        error: { code: 'INVALID_TRANSITION' },
      });
    }
    expect(applyParentTaskDraftSuggestion(before, snapshot, suggestion, 5)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
  });
});
