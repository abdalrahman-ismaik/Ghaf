import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AcademicGoalCard } from '@/components/study/AcademicGoalCard';
import { StudyForm } from '@/components/study/StudyForm';
import { applyStudyCommand, createEmptyStudyState } from '@/features/study';
import { studyResources } from '@/i18n/studyResources';
import type { AcademicGoal, StudyCommand, StudyState } from '@/models/study';

const mock = vi.hoisted(() => ({
  cursor: 0,
  slots: [] as { value: unknown }[],
  state: { direction: 'rtl' },
  language: 'ar' as 'ar' | 'en',
}));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useState: (initial: unknown) => {
    const slot = (mock.slots[mock.cursor++] ??= { value: initial });
    return [slot.value, (value: unknown) => (slot.value = value)];
  },
}));
vi.mock('react-native', () => ({
  View: 'View',
  Platform: { OS: 'android', select: (values: Record<string, unknown>) => values.default },
  StyleSheet: { create: (styles: unknown) => styles },
}));
vi.mock('@/components/primitives', () => ({ Button: 'Button', Input: 'Input', Text: 'Text' }));
vi.mock('@/state/usePrototypeStore', () => ({
  usePrototypeStore: (selector: (state: typeof mock.state) => unknown) => selector(mock.state),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values: Record<string, unknown> = {}) => {
      const resource = studyResources[mock.language] as Record<string, unknown>;
      const value = resource[key.replace(/^study\./, '')];
      return typeof value === 'string'
        ? value.replace(/\{\{(\w+)\}\}/g, (_, field: string) => String(values[field] ?? ''))
        : key;
    },
  }),
}));

type Node = ReactElement<Record<string, unknown>>;
const context = {
  familyKey: 'family-goal-ui',
  childIds: ['salem'],
  now: '2026-09-14T10:00:00.000Z',
};

function node(tree: ReactNode, testID: string): Node {
  function search(value: ReactNode): Node | undefined {
    if (Array.isArray(value)) {
      for (const child of value) {
        const match = search(child);
        if (match) return match;
      }
    }
    if (!isValidElement<Record<string, unknown>>(value)) return undefined;
    return value.props.testID === testID ? value : search(value.props.children as ReactNode);
  }
  const found = search(tree);
  if (!found) throw new Error(`Missing ${testID}`);
  return found;
}

function createGoal(): AcademicGoal {
  const result = applyStudyCommand(
    createEmptyStudyState(context.familyKey),
    { role: 'parent' },
    {
      type: 'goal.create',
      id: 'goal-ui',
      childId: 'salem',
      input: {
        subject: 'Maths',
        title: 'Explain one example',
        nextStep: 'Choose an example',
        parentSupport: 'Check it together',
        criterion: { kind: 'practice_count', target: 3 },
        prize: null,
        targetDate: '2026-09-20',
        reviewDate: '2026-09-22',
      },
    },
    context,
  );
  if (!result.ok || !result.data.goals[0]) throw new Error('Fixture failed');
  return result.data.goals[0];
}

beforeEach(() => {
  mock.cursor = 0;
  mock.slots = [];
  mock.language = 'ar';
  mock.state.direction = 'rtl';
});

describe('academic goal date form and agreement display', () => {
  it('submits normalized Arabic civil dates through the actual goal domain', () => {
    let state: StudyState = createEmptyStudyState(context.familyKey);
    const onSave = vi.fn((command: StudyCommand) => {
      const result = applyStudyCommand(state, { role: 'parent' }, command, context);
      if (result.ok) state = result.data;
      return result.ok;
    });
    const render = () => {
      mock.cursor = 0;
      return StudyForm({ kind: 'goal', childId: 'salem', onSave, onCancel: vi.fn() });
    };
    let tree = render();
    for (const [testID, value] of [
      ['study-subject', 'Maths'],
      ['study-title', 'Explain one example'],
      ['study-next-step', 'Choose an example'],
      ['study-parent-support', 'Check it together'],
      ['study-goal-target-date', '٢٠٢٦-٠٩-٢٠'],
      ['study-goal-review-date', '۲۰۲۶-۰۹-۲۲'],
    ]) {
      (node(tree, testID!).props.onChangeText as (value: string) => void)(value!);
    }
    tree = render();
    (node(tree, 'study-save').props.onPress as () => void)();
    expect(onSave).toHaveReturnedWith(true);
    expect(state.goals[0]).toMatchObject({
      targetDate: '2026-09-20',
      reviewDate: '2026-09-22',
    });
  });

  it('loads existing proposal dates and submits clearing them as a revision edit', () => {
    const goal = createGoal();
    const onSave = vi.fn(() => true);
    const render = () => {
      mock.cursor = 0;
      return StudyForm({ kind: 'goal', goal, childId: 'salem', onSave, onCancel: vi.fn() });
    };
    let tree = render();
    expect(node(tree, 'study-goal-target-date').props.value).toBe(goal.targetDate);
    expect(node(tree, 'study-goal-review-date').props.value).toBe(goal.reviewDate);
    (node(tree, 'study-goal-target-date').props.onChangeText as (value: string) => void)('');
    (node(tree, 'study-goal-review-date').props.onChangeText as (value: string) => void)('');
    tree = render();
    (node(tree, 'study-save').props.onPress as () => void)();
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'goal.edit',
        id: goal.id,
        expectedRevision: goal.revision,
        input: expect.objectContaining({ targetDate: null, reviewDate: null }),
      }),
    );
  });

  it.each(['ar', 'en'] as const)(
    'displays agreed civil dates with bidi isolation in %s for Parent and Child',
    (language) => {
      mock.language = language;
      for (const role of ['parent', 'child'] as const) {
        mock.cursor = 0;
        mock.slots = [];
        const tree = AcademicGoalCard({
          goal: createGoal(),
          role,
          onCommand: vi.fn(() => true),
          onEdit: vi.fn(),
          onReplace: vi.fn(),
        });
        expect(node(tree, 'study-goal-target-date-display').props.children).toContain(
          '\u20682026-09-20\u2069',
        );
        expect(node(tree, 'study-goal-review-date-display').props.children).toContain(
          '\u20682026-09-22\u2069',
        );
      }
    },
  );
});
