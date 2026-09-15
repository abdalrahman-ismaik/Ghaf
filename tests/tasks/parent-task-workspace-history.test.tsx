import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ParentHomeScreen from '../../app/parent';
import { CatalogTaskList } from '@/components/catalog/CatalogTaskList';
import { TASK_TEMPLATES } from '@/features/tasks/demoContent';
import { bilingualResource, i18n } from '@/i18n';
import type { SyntheticChildId } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import {
  enterChildExperienceForTest,
  enterParentExperienceForTest,
  resetPrototypeForTest,
  taskPraiseForTest,
} from '../helpers/prototypeStore';

const mock = vi.hoisted(() => ({
  cursor: 0,
  scope: 'route',
  slots: new Map<string, { value: unknown }[]>(),
  candidate: true,
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useState: (initial: unknown) => {
    const slots = mock.slots.get(mock.scope) ?? [];
    mock.slots.set(mock.scope, slots);
    const slot = (slots[mock.cursor++] ??= {
      value: typeof initial === 'function' ? initial() : initial,
    });
    return [
      slot.value,
      (next: unknown) => {
        slot.value = typeof next === 'function' ? next(slot.value) : next;
      },
    ];
  },
  useRef: (initial: unknown) => {
    const slots = mock.slots.get(mock.scope) ?? [];
    mock.slots.set(mock.scope, slots);
    return (slots[mock.cursor++] ??= { value: { current: initial } }).value;
  },
  useEffect: () => undefined,
}));
vi.mock('react-native', () => ({
  Platform: { OS: 'web', select: (options: Record<string, unknown>) => options.default },
  Pressable: 'Pressable',
  View: 'View',
  StyleSheet: { create: <T,>(styles: T) => styles, hairlineWidth: 1 },
}));
vi.mock('expo-router', () => ({
  useRouter: () => ({ push: mock.push, replace: mock.replace }),
  useLocalSearchParams: () => ({ section: 'tasks' }),
}));
vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: i18n.getFixedT(usePrototypeStore.getState().locale) }),
}));
vi.mock('@/components/access', () => ({ GhafIcon: 'GhafIcon' }));
vi.mock('@/components/primitives', () => ({ Button: 'Button', Screen: 'Screen', Text: 'Text' }));
vi.mock('@/components/study/StudyEntries', () => ({ StudyEntries: 'StudyEntries' }));
vi.mock('@/components/masroofi/MasroofiTaskRewardNotice', () => ({
  MasroofiTaskRewardNotice: 'MasroofiTaskRewardNotice',
}));
vi.mock('@/components/family-growth/ParentPatternSummary', () => ({
  ParentPatternSummary: 'ParentPatternSummary',
}));
vi.mock('@/components/session/ReturningWelcomeDialog', () => ({
  ReturningWelcomeDialog: 'ReturningWelcomeDialog',
}));
vi.mock('@/components/r002a', () => ({
  ParentAdjustmentReview: 'ParentAdjustmentReview',
  ParentCanopySummaryCard: 'ParentCanopySummaryCard',
  ParentChildrenSection: 'ParentChildrenSection',
  ParentHomeHeader: 'ParentHomeHeader',
  ParentHomeNavigation: 'ParentHomeNavigation',
  ParentLifecycleCard: 'ParentLifecycleCard',
  ParentTaskWorkspace: 'ParentTaskWorkspace',
  R002aScreen: 'R002aScreen',
}));
vi.mock('@/config/taskWorkspaceFeatureFlag', () => ({
  get taskWorkspaceFeatureFlag() {
    return mock.candidate;
  },
}));
vi.mock('@/state/usePrototypeStore', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/state/usePrototypeStore')>();
  return {
    ...original,
    usePrototypeStore: Object.assign(
      (selector: (state: ReturnType<typeof original.usePrototypeStore.getState>) => unknown) =>
        selector(original.usePrototypeStore.getState()),
      original.usePrototypeStore,
    ),
  };
});

type Node = ReactElement<Record<string, unknown>>;
let route: ReactNode;
let history: ReactNode;

function nodes(value: ReactNode): Node[] {
  if (Array.isArray(value)) return value.flatMap(nodes);
  if (!isValidElement<Record<string, unknown>>(value)) return [];
  return [value, ...nodes(value.props.children as ReactNode)];
}

function render() {
  mock.scope = 'route';
  mock.cursor = 0;
  route = ParentHomeScreen();
  const list = nodes(route).find((node) => node.type === CatalogTaskList);
  expect(list, 'Saved task history must be mounted in both presentations').toBeDefined();
  mock.scope = 'history';
  mock.cursor = 0;
  history = CatalogTaskList(list!.props as Parameters<typeof CatalogTaskList>[0]);
}

function press(testID: string) {
  const node = [...nodes(route), ...nodes(history)].find((item) => item.props.testID === testID);
  expect(node, `${testID} should remain reachable`).toBeDefined();
  (node!.props.onPress as () => void)();
  render();
}

function visibleAssignments() {
  return nodes(history)
    .map((node) => node.props.testID)
    .filter((id): id is string => typeof id === 'string' && id.startsWith('open-'))
    .map((id) => id.slice('open-'.length))
    .sort();
}

function ok<T>(result: { ok: true; data: T } | { ok: false; error: { message: string } }): T {
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

async function assign(childId: SyntheticChildId = 'child_salem') {
  await enterParentExperienceForTest();
  const template = TASK_TEMPLATES.find((item) => item.id === 'HR01')!;
  ok(
    usePrototypeStore.getState().createTaskDraft({
      childId,
      templateId: template.id,
      parentText: template.positiveAction,
    }),
  );
  ok(usePrototypeStore.getState().reviewTask());
  return ok(usePrototypeStore.getState().approveAssignment()).assignment!.id;
}

async function submit(id: string) {
  await enterChildExperienceForTest();
  ok(usePrototypeStore.getState().selectTaskOccurrence(id));
  ok(
    usePrototypeStore
      .getState()
      .chooseAssignment(usePrototypeStore.getState().choicePool.p0AssignmentChoice!.id),
  );
  ok(usePrototypeStore.getState().startAssignment());
  ok(
    usePrototypeStore.getState().submitTask({
      definitionAcknowledged: true,
      completionMode: 'independent',
      helpUsed: null,
      preparedMediaFixtureId: null,
      reflection: null,
      observableFacts: [],
    }),
  );
  await enterParentExperienceForTest();
}

async function complete(id: string) {
  await submit(id);
  ok(usePrototypeStore.getState().selectTaskOccurrence(id));
  const submissionId = usePrototypeStore.getState().journey!.submission!.id;
  ok(
    usePrototypeStore.getState().confirmAndPresentPraise(
      {
        submissionId,
        praise: taskPraiseForTest(),
        neutralObservation: null,
        uncertainty: bilingualResource('checkIn.uncertainty'),
      },
      {
        actionId: `history-praise:${submissionId}`,
        source: 'parent_press',
        presentedAt: '2026-09-14T17:00:00.000Z',
      },
    ),
  );
  const plan = usePrototypeStore.getState().confirmationPlan!;
  if (plan.renderState !== 'praise_presented') throw new Error('Expected presented praise');
  ok(
    usePrototypeStore.getState().applyRecognition({
      actionId: `history-recognition:${submissionId}`,
      source: 'parent_press',
      observedRenderState: 'praise_presented',
      presentationActionId: plan.presentationActionId,
    }),
  );
}

beforeEach(async () => {
  mock.slots.clear();
  mock.push.mockClear();
  mock.replace.mockClear();
  mock.candidate = true;
  ok(resetPrototypeForTest());
  await enterParentExperienceForTest();
});

describe('Parent task history across workspace presentations', () => {
  it.each([true, false])(
    'retains repeated assignments and sibling access with candidate=%s',
    async (candidate) => {
      mock.candidate = candidate;
      const first = await assign();
      const second = await assign();
      const sibling = await assign('child_alya');
      ok(usePrototypeStore.getState().setActiveChild('child_salem'));
      const saved = usePrototypeStore.getState().taskAssignments;

      render();
      expect(visibleAssignments()).toEqual([first, second].sort());
      press(`open-${first}`);
      expect(usePrototypeStore.getState().journey?.assignment?.id).toBe(first);
      expect(visibleAssignments()).toEqual([first, second].sort());
      press('parent-tasks-child-child_alya');
      expect(visibleAssignments()).toEqual([sibling]);
      press('parent-tasks-child-child_salem');
      expect(visibleAssignments()).toEqual([first, second].sort());
      press('catalog-create');
      expect(mock.push).toHaveBeenLastCalledWith('/parent/task/new');
      expect(usePrototypeStore.getState().journey).toBeNull();
      expect(visibleAssignments()).toEqual([first, second].sort());
      expect(usePrototypeStore.getState().taskAssignments.byId).toEqual(saved.byId);
    },
  );

  it.each(['ar', 'en'] as const)(
    'keeps pending and completed work reachable after a newer task in %s',
    async (locale) => {
      const completed = await assign();
      await complete(completed);
      const pending = await assign();
      await submit(pending);
      const newest = await assign();
      usePrototypeStore.getState().setLocale(locale);
      const saved = usePrototypeStore.getState();

      render();
      expect(visibleAssignments()).toEqual([newest]);
      press('parent-tasks-tab-pending');
      expect(visibleAssignments()).toEqual([pending]);
      press(`open-${pending}`);
      expect(mock.push).toHaveBeenLastCalledWith('/parent/check-in');
      expect(usePrototypeStore.getState().journey?.assignment?.id).toBe(pending);
      press('parent-tasks-tab-completed');
      expect(visibleAssignments()).toEqual([completed]);
      press(`open-${completed}`);
      expect(mock.push).toHaveBeenLastCalledWith('/parent/check-in');
      expect(usePrototypeStore.getState().journey?.assignment?.id).toBe(completed);
      press('parent-tasks-tab-assigned');
      expect(visibleAssignments()).toEqual([newest]);
      expect(usePrototypeStore.getState().taskAssignments.byId).toEqual(saved.taskAssignments.byId);
      expect(usePrototypeStore.getState().children).toEqual(saved.children);
      expect(usePrototypeStore.getState().masroofi).toEqual(saved.masroofi);
    },
  );
});
