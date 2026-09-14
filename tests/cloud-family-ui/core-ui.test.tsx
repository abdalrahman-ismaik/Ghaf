import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CloudFamilyMembers,
  CloudFamilySetup,
} from '../../src/components/cloud-family/CloudFamilySetup';
import { CloudGardenView } from '../../src/components/cloud-family/CloudGardenView';
import { CloudFamilyView } from '../../src/components/cloud-family/CloudFamilyView';
import { CloudPreparedTaskGuide } from '../../src/components/cloud-family/CloudPreparedTaskGuide';
import { CloudCustomTaskView } from '../../src/components/cloud-family/CloudCustomTaskView';
import {
  CloudTaskCatalog,
  CloudTaskDetail,
} from '../../src/components/cloud-family/CloudTaskViews';
import type { CloudFamilyController } from '../../src/features/cloud-family';
import { TASK_TEMPLATES } from '../../src/features/tasks/demoContent';
import { cloudFamilyResources } from '../../src/i18n/cloudFamilyResources';
import type {
  CloudFamilySnapshot,
  CloudFamilyState,
  CloudFamilyTask,
} from '../../src/models/cloudFamily';
import type { ParentAccountService } from '../../src/models/parentAccount';

type Hook = { value?: unknown; dependencies?: readonly unknown[] };
const mock = vi.hoisted(() => ({
  cursor: 0,
  slots: [] as Hook[],
  locale: 'en' as 'ar' | 'en',
  fontScale: 1,
}));

vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useState(initial: unknown) {
    const slot = (mock.slots[mock.cursor++] ??= {
      value: typeof initial === 'function' ? initial() : initial,
    });
    return [
      slot.value,
      (next: unknown) => {
        slot.value = typeof next === 'function' ? next(slot.value) : next;
      },
    ];
  },
  useRef(initial: unknown) {
    return (mock.slots[mock.cursor++] ??= { value: { current: initial } }).value;
  },
  useMemo(factory: () => unknown, dependencies: readonly unknown[]) {
    const slot = (mock.slots[mock.cursor++] ??= {});
    if (
      !slot.dependencies ||
      dependencies.some((value, index) => value !== slot.dependencies?.[index])
    )
      slot.value = factory();
    slot.dependencies = dependencies;
    return slot.value;
  },
  useEffect: () => undefined,
  useCallback: (callback: unknown) => callback,
}));
vi.mock('react-native', () => ({
  Platform: {
    OS: 'android',
    select: (options: Record<string, unknown>) => options.android ?? options.default,
  },
  StyleSheet: { create: (value: unknown) => value },
  useWindowDimensions: () => ({ width: 360, height: 800, scale: 2, fontScale: mock.fontScale }),
  View: 'View',
}));
vi.mock('@/components/access', () => ({
  AccessTextField: 'AccessTextField',
  AccessScreen: 'AccessScreen',
  AccessHeader: 'AccessHeader',
}));
vi.mock('@/components/LanguageSwitcher', () => ({ LanguageSwitcher: 'LanguageSwitcher' }));
vi.mock('@/components/cloud-study/CloudStudyView', () => ({ CloudStudyView: 'CloudStudyView' }));
vi.mock('@/components/cloud-growth', () => ({ CloudGrowthView: 'CloudGrowthView' }));
vi.mock('@/components/cloud-messaging', () => ({ CloudMessagingView: 'CloudMessagingView' }));
vi.mock('@/components/illustrations', () => ({ LocalIllustration: 'LocalIllustration' }));
vi.mock('@/components/primitives', () => ({ Button: 'Button', Text: 'Text' }));
vi.mock('@/components/family-growth/GardenLandscape', () => ({
  GardenLandscape: 'GardenLandscape',
}));
vi.mock('@/components/companion/CompanionPortrait', () => ({
  CompanionPortrait: 'CompanionPortrait',
}));
vi.mock('@/features/cloud-family', async () => ({
  ...(await import('../../src/features/cloud-family/progress')),
}));
vi.mock('@/state/usePrototypeStore', () => ({
  usePrototypeStore: (select: (state: object) => unknown) =>
    select({ locale: mock.locale, direction: mock.locale === 'ar' ? 'rtl' : 'ltr' }),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t(key: string, values?: Record<string, unknown>) {
      const result = key
        .replace(/^cloudFamily\./, '')
        .split('.')
        .reduce<unknown>(
          (value, part) =>
            value && typeof value === 'object'
              ? (value as Record<string, unknown>)[part]
              : undefined,
          cloudFamilyResources[mock.locale],
        );
      return Object.entries(values ?? {}).reduce(
        (label, [name, value]) => label.replaceAll(`{{${name}}}`, String(value)),
        typeof result === 'string' ? result : key,
      );
    },
  }),
}));

const userId = '10000000-0000-4000-8000-000000000001';
const familyId = '20000000-0000-4000-8000-000000000001';
const childId = '30000000-0000-4000-8000-000000000001';
const taskId = '40000000-0000-4000-8000-000000000001';
const template = TASK_TEMPLATES.find((item) => item.id === 'GI01')!;
const childProfile = {
  id: childId,
  familyId,
  displayName: 'Test Child',
  ageBand: '9_11' as const,
  active: true,
};
const assigned: CloudFamilyTask = {
  id: taskId,
  familyId,
  childId,
  catalogId: template.id,
  status: 'assigned',
  revision: 1,
  stepStates: {},
  helpRequested: false,
  praise: null,
  createdAt: '2026-09-14T10:00:00.000Z',
  submittedAt: null,
  recognizedAt: null,
  template,
};
function snapshot(role: 'parent' | 'child' = 'parent'): CloudFamilySnapshot {
  return {
    schemaVersion: 1,
    actor: { userId, role, familyId, childId: role === 'child' ? childId : null },
    families: [{ id: familyId, name: 'Test Family', revision: 0 }],
    family: { id: familyId, name: 'Test Family', revision: 0 },
    familyCanopyContributions: 0,
    members: [],
    children: [childProfile],
    tasks: [],
    recognitions: [],
    memories: [],
    deletedMemoryTaskIds: [],
    catalog: TASK_TEMPLATES,
    customTemplates: [],
  };
}
function state(data: CloudFamilySnapshot): CloudFamilyState {
  return {
    status: data.family ? 'ready' : 'empty',
    snapshot: data,
    busy: false,
    error: null,
    conflict: false,
    pendingRequestId: null,
    pendingCommand: null,
    lastInvite: null,
    subscriptionError: false,
  };
}
let controller: CloudFamilyController;
let tree: ReactNode;
type Node = ReactElement<Record<string, unknown>>;
function visit(value: ReactNode): Node[] {
  if (Array.isArray(value)) return value.flatMap((child) => visit(child));
  if (!isValidElement<Record<string, unknown>>(value)) return [];
  return [value, ...visit(value.props.children as ReactNode)];
}
function nodes(): Node[] {
  return visit(tree);
}
function find(id: string) {
  return nodes().find((node) => node.props.testID === id);
}
function render(component: () => ReactNode) {
  mock.cursor = 0;
  tree = component();
}
function press(id: string) {
  const node = find(id);
  expect(node, id).toBeDefined();
  (node!.props.onPress as () => void)();
}
function labels(): string {
  return nodes()
    .flatMap((node) => (typeof node.props.children === 'string' ? [node.props.children] : []))
    .join(' ');
}
async function settle() {
  await Promise.resolve();
  await Promise.resolve();
}

beforeEach(() => {
  mock.cursor = 0;
  mock.slots = [];
  mock.locale = 'en';
  mock.fontScale = 1;
  controller = {
    command: vi.fn(async () => true),
    redeemInvite: vi.fn(async () => true),
    selectFamily: vi.fn(async () => true),
    getSnapshot: () => state(snapshot()),
  } as unknown as CloudFamilyController;
});

describe('real family controls with synthetic test DTOs', () => {
  it.each(['ar', 'en'] as const)(
    'exposes exactly the selected tab to web and native accessibility in %s',
    (locale) => {
      mock.locale = locale;
      const data = { ...snapshot(), children: [] };
      const renderView = () =>
        CloudFamilyView({
          controller,
          state: state(data),
          snapshot: data,
          service: {} as ParentAccountService,
          userId,
          onSignOut: () => undefined,
        });
      const tabs = () =>
        visit((tree as Node).props.footer as ReactNode).filter(
          (node) => node.props.accessibilityRole === 'tab',
        );
      render(renderView);
      expect(tabs().filter((node) => node.props['aria-selected'])).toHaveLength(1);
      expect(
        tabs().find((node) => node.props.testID === 'cloud-tab-family')!.props['aria-selected'],
      ).toBe(true);
      (
        tabs().find((node) => node.props.testID === 'cloud-tab-garden')!.props.onPress as () => void
      )();
      render(renderView);
      const selected = tabs().filter((node) => node.props['aria-selected']);
      expect(selected).toHaveLength(1);
      expect(selected[0]!.props.testID).toBe('cloud-tab-garden');
      expect(selected[0]!.props.accessibilityState).toEqual({ selected: true });
      expect(
        tabs().find((node) => node.props.testID === 'cloud-tab-family')!.props['aria-selected'],
      ).toBe(false);
      expect(find('cloud-empty-garden-artwork')!.props.assetId).toBe('ghaf-seed');
      expect(find('cloud-empty-garden-artwork')!.props.decorative).toBe(true);
      mock.fontScale = 1.5;
      render(renderView);
      expect(tabs()).toHaveLength(6);
      const enlargedSelection = tabs().filter((node) => node.props['aria-selected']);
      expect(enlargedSelection).toHaveLength(1);
      expect(enlargedSelection[0]!.props.testID).toBe('cloud-tab-garden');
      expect(enlargedSelection[0]!.props.style).toContainEqual({ flexBasis: '45%' });
      expect(controller.command).not.toHaveBeenCalled();
    },
  );
  it('keeps the prepared helper scoped to this task and advances to its next instruction', () => {
    const first = template.catalogExecution!.steps[0]!;
    const second = template.catalogExecution!.steps[1]!;
    const task = { ...assigned, stepStates: { [first.id]: 'done' as const } };
    const renderGuide = () => CloudPreparedTaskGuide({ task });
    render(renderGuide);
    expect(find('cloud-prepared-guide')).toBeUndefined();
    press('cloud-prepared-guide-toggle');
    render(renderGuide);
    expect(find('cloud-prepared-guide')).toBeDefined();
    expect(labels()).toContain(second.text.en);
    expect(labels()).not.toContain(first.text.en);
    expect(labels()).toContain('not a live AI conversation');
    expect(controller.command).not.toHaveBeenCalled();
  });
  it.each(['ar', 'en'] as const)(
    'shows a genuine empty setup in %s without inventing children or progress',
    (locale) => {
      mock.locale = locale;
      const empty: CloudFamilySnapshot = {
        ...snapshot(),
        actor: { userId, role: 'parent', familyId: null, childId: null },
        family: null,
        families: [],
        children: [],
      };
      render(() => (
        <CloudFamilyMembers
          snapshot={empty}
          state={state(empty)}
          controller={controller}
          disabled={false}
          onEdit={() => undefined}
        />
      ));
      const element = tree as ReactElement<Parameters<typeof CloudFamilyMembers>[0]>;
      render(() => CloudFamilyMembers(element.props));
      expect(find('cloud-create-family')).toBeDefined();
      expect(find('cloud-join-family')).toBeDefined();
      expect(labels()).not.toMatch(/Salem|Alya|Abu Rashid|سالم|علياء|أبو راشد/);
      expect(controller.command).not.toHaveBeenCalled();
    },
  );

  it('requires the real Parent name before creating a fresh family', async () => {
    const renderForm = () =>
      CloudFamilySetup({
        editor: { kind: 'create' },
        snapshot: { ...snapshot(), family: null, families: [], children: [] },
        controller,
        disabled: false,
        onClose: () => undefined,
      });
    render(renderForm);
    (find('cloud-family-name-input')!.props.onChangeText as (value: string) => void)('New Family');
    render(renderForm);
    expect(find('cloud-family-editor-save')!.props.disabled).toBe(true);
    press('cloud-family-editor-save');
    expect(controller.command).not.toHaveBeenCalled();
    (find('cloud-parent-name-input')!.props.onChangeText as (value: string) => void)(
      '  Test Parent  ',
    );
    render(renderForm);
    expect(find('cloud-family-editor-save')!.props.disabled).toBe(false);
    press('cloud-family-editor-save');
    await settle();
    expect(controller.command).toHaveBeenCalledExactlyOnceWith({
      type: 'create_family',
      name: 'New Family',
      displayName: 'Test Parent',
    });
  });

  it('limits new Child profiles without deleting an existing larger family or showing Child commercial copy', () => {
    const data = {
      ...snapshot(),
      children: [
        childProfile,
        {
          ...childProfile,
          id: '30000000-0000-4000-8000-000000000002',
          displayName: 'Second Child',
        },
      ],
    };
    render(() =>
      CloudFamilyMembers({
        snapshot: data,
        state: state(data),
        controller,
        disabled: false,
        onEdit: () => undefined,
      }),
    );
    expect(find('cloud-add-child')!.props.disabled).toBe(true);
    expect(find(`cloud-child-${childId}`)).toBeDefined();
    expect(find('cloud-child-30000000-0000-4000-8000-000000000002')).toBeDefined();
    mock.slots = [];
    const renderForm = () =>
      CloudFamilySetup({
        editor: { kind: 'add-child' },
        snapshot: data,
        controller,
        disabled: false,
        onClose: () => undefined,
      });
    render(renderForm);
    (find('cloud-family-name-input')!.props.onChangeText as (value: string) => void)('Third Child');
    press('cloud-age-6_8');
    render(renderForm);
    expect(find('cloud-family-editor-save')!.props.disabled).toBe(true);
    press('cloud-family-editor-save');
    expect(controller.command).not.toHaveBeenCalled();
    mock.slots = [];
    const childData = snapshot('child');
    render(() =>
      CloudFamilyMembers({
        snapshot: childData,
        state: state(childData),
        controller,
        disabled: false,
        onEdit: () => undefined,
      }),
    );
    expect(labels()).not.toContain('Free families');
    expect(find('cloud-add-child')).toBeUndefined();
  });

  it('requires a chosen age band and sends only the entered Child profile', async () => {
    const close = vi.fn();
    const renderForm = () =>
      CloudFamilySetup({
        editor: { kind: 'add-child' },
        snapshot: snapshot(),
        controller,
        disabled: false,
        onClose: close,
      });
    render(renderForm);
    (find('cloud-family-name-input')!.props.onChangeText as (value: string) => void)('New Child');
    render(renderForm);
    expect(find('cloud-family-editor-save')!.props.disabled).toBe(true);
    press('cloud-age-6_8');
    render(renderForm);
    press('cloud-family-editor-save');
    await settle();
    expect(controller.command).toHaveBeenCalledExactlyOnceWith({
      type: 'add_child',
      displayName: 'New Child',
      ageBand: '6_8',
    });
    expect(close).toHaveBeenCalledOnce();
  });

  it('keeps setup inputs and save disabled while the server request is uncertain', () => {
    render(() =>
      CloudFamilySetup({
        editor: { kind: 'create' },
        snapshot: snapshot(),
        controller,
        disabled: true,
        onClose: () => undefined,
      }),
    );
    expect(find('cloud-family-name-input')!.props.editable).toBe(false);
    expect(find('cloud-family-editor-save')!.props.disabled).toBe(true);
  });

  it('admits only the assigned Child and never renders Parent approval controls in that view', () => {
    const data = { ...snapshot('child'), tasks: [assigned] };
    render(() =>
      CloudTaskDetail({
        task: assigned,
        snapshot: data,
        controller,
        disabled: false,
        onGarden: () => undefined,
      }),
    );
    press('cloud-task-accept');
    expect(controller.command).toHaveBeenCalledWith({
      type: 'accept_task',
      taskId,
      expectedRevision: 1,
    });
    expect(find('cloud-task-praise')).toBeUndefined();
    expect(find('cloud-task-recognize')).toBeUndefined();
    expect(find('cloud-task-save-memory')).toBeUndefined();
    mock.slots = [];
    render(() =>
      CloudTaskDetail({
        task: { ...assigned, childId: 'different-child' },
        snapshot: data,
        controller,
        disabled: false,
        onGarden: () => undefined,
      }),
    );
    expect(tree).toBeNull();
  });

  it('requires action completion and a done-or-skipped decision for every other step before review', () => {
    const task: CloudFamilyTask = { ...assigned, status: 'in_progress' };
    const data = { ...snapshot('child'), tasks: [task] };
    const firstAction = template.catalogExecution!.steps.find((step) => step.kind === 'action')!;
    const guidance = template.catalogExecution!.steps.find((step) => step.kind !== 'action')!;
    expect(guidance).toBeDefined();
    render(() =>
      CloudTaskDetail({
        task,
        snapshot: data,
        controller,
        disabled: false,
        onGarden: () => undefined,
      }),
    );
    expect(find('cloud-task-submit')!.props.disabled).toBe(true);
    expect(find(`cloud-step-skip-${firstAction.id}`)).toBeUndefined();
    press(`cloud-step-done-${firstAction.id}`);
    expect(controller.command).toHaveBeenCalledWith({
      type: 'set_step',
      taskId,
      expectedRevision: 1,
      stepId: firstAction.id,
      state: 'done',
    });
    const actionsDone: CloudFamilyTask = {
      ...task,
      revision: 2,
      stepStates: Object.fromEntries(
        template
          .catalogExecution!.steps.filter((step) => step.kind === 'action')
          .map((step) => [step.id, 'done']),
      ),
    };
    render(() =>
      CloudTaskDetail({
        task: actionsDone,
        snapshot: { ...data, tasks: [actionsDone] },
        controller,
        disabled: false,
        onGarden: () => undefined,
      }),
    );
    expect(find('cloud-task-submit')!.props.disabled).toBe(true);
    press('cloud-task-submit');
    expect(
      vi.mocked(controller.command).mock.calls.some(([command]) => command.type === 'submit_task'),
    ).toBe(false);
    press(`cloud-step-skip-${guidance.id}`);
    expect(controller.command).toHaveBeenCalledWith({
      type: 'set_step',
      taskId,
      expectedRevision: 2,
      stepId: guidance.id,
      state: 'skipped',
    });
    const completed: CloudFamilyTask = {
      ...actionsDone,
      revision: 3,
      stepStates: Object.fromEntries(
        template.catalogExecution!.steps.map((step) => [
          step.id,
          step.kind === 'action' ? 'done' : 'skipped',
        ]),
      ),
    };
    render(() =>
      CloudTaskDetail({
        task: completed,
        snapshot: { ...data, tasks: [completed] },
        controller,
        disabled: false,
        onGarden: () => undefined,
      }),
    );
    expect(find('cloud-task-submit')!.props.disabled).toBe(false);
    press('cloud-task-submit');
    expect(controller.command).toHaveBeenCalledWith({
      type: 'submit_task',
      taskId,
      expectedRevision: 3,
    });
    const allDone = {
      ...completed,
      stepStates: Object.fromEntries(
        template.catalogExecution!.steps.map((step) => [step.id, 'done' as const]),
      ),
    };
    render(() =>
      CloudTaskDetail({
        task: allDone,
        snapshot: { ...data, tasks: [allDone] },
        controller,
        disabled: false,
        onGarden: () => undefined,
      }),
    );
    expect(find('cloud-task-submit')!.props.disabled).toBe(false);
    const skippedAction = {
      ...completed,
      stepStates: { ...completed.stepStates, [firstAction.id]: 'skipped' as const },
    };
    render(() =>
      CloudTaskDetail({
        task: skippedAction,
        snapshot: { ...data, tasks: [skippedAction] },
        controller,
        disabled: false,
        onGarden: () => undefined,
      }),
    );
    expect(find('cloud-task-submit')!.props.disabled).toBe(true);
  });

  it('requires Parent-written praise before its separate confirmation action', async () => {
    const task: CloudFamilyTask = {
      ...assigned,
      status: 'submitted',
      submittedAt: '2026-09-14T10:05:00.000Z',
    };
    const data = { ...snapshot(), tasks: [task] };
    const renderDetail = () =>
      CloudTaskDetail({
        task,
        snapshot: data,
        controller,
        disabled: false,
        onGarden: () => undefined,
      });
    render(renderDetail);
    expect(find('cloud-task-praise')!.props.disabled).toBe(true);
    expect(find('cloud-task-recognize')).toBeUndefined();
    (find('cloud-task-praise-input')!.props.onChangeText as (value: string) => void)(
      'You asked for help before sorting.',
    );
    render(renderDetail);
    press('cloud-task-praise');
    await settle();
    expect(controller.command).toHaveBeenCalledWith({
      type: 'praise_task',
      taskId,
      expectedRevision: 1,
      praise: 'You asked for help before sorting.',
    });
    expect(find('cloud-task-accept')).toBeUndefined();
    expect(find('cloud-task-submit')).toBeUndefined();
  });

  it('shows actual Parent praise to the Child and keeps all reward controls absent', () => {
    const task: CloudFamilyTask = {
      ...assigned,
      status: 'praised',
      praise: 'You used the safe materials we selected.',
    };
    render(() =>
      CloudTaskDetail({
        task,
        snapshot: { ...snapshot('child'), tasks: [task] },
        controller,
        disabled: false,
        onGarden: () => undefined,
      }),
    );
    expect(find('cloud-task-parent-praise')).toBeDefined();
    expect(labels()).toContain(task.praise);
    expect(find('cloud-task-recognize')).toBeUndefined();
  });

  it('derives a zero garden from empty receipts and omits tombstoned memory actions', () => {
    const data = snapshot();
    render(() =>
      CloudGardenView({ snapshot: data, controller, disabled: false, recognitionId: null }),
    );
    const landscape = nodes().find((node) => node.props.testID === 'cloud-personal-landscape')!;
    const tracks = landscape.props.tracks as Record<
      string,
      { cumulativeSeeds: number; stage: string }
    >;
    expect(
      Object.values(tracks).every((track) => track.cumulativeSeeds === 0 && track.stage === 'seed'),
    ).toBe(true);
    expect(labels()).toContain('0 confirmed contributions');
    const done: CloudFamilyTask = {
      ...assigned,
      status: 'recognized',
      recognizedAt: '2026-09-14T10:10:00.000Z',
    };
    const deleted = {
      ...data,
      tasks: [done],
      deletedMemoryTaskIds: [taskId],
      recognitions: [
        {
          id: 'receipt-1',
          taskId,
          childId,
          seeds: 12,
          landscapeId: 'mangrove' as const,
          canopyContribution: 1,
          createdAt: done.recognizedAt!,
        },
      ],
    };
    mock.slots = [];
    render(() =>
      CloudGardenView({ snapshot: deleted, controller, disabled: false, recognitionId: null }),
    );
    expect(find(`cloud-memory-save-${taskId}`)).toBeUndefined();
  });

  it('keeps curated task actions read-only while assigning reviewed title text', () => {
    const data = snapshot();
    const props = { snapshot: data, controller, disabled: false, onAssigned: () => undefined };
    render(() => CloudTaskCatalog(props));
    press(`cloud-review-${template.id}`);
    render(() => CloudTaskCatalog(props));
    const editor = tree as ReactElement<Record<string, unknown>>;
    mock.slots = [];
    render(() => (editor.type as (props: Record<string, unknown>) => ReactNode)(editor.props));
    expect(find('cloud-task-title-input')).toBeDefined();
    expect(find('cloud-task-action-input')).toBeUndefined();
    press('cloud-task-assign');
    expect(controller.command).toHaveBeenCalledWith({
      type: 'assign_task',
      childId,
      catalogId: template.id,
      content: { title: template.title },
    });
  });

  it('populates a saved custom template unchanged and requires review before creating its private definition', async () => {
    const draft = {
      categoryId: 'learning_wellbeing' as const,
      title: { ar: 'نشاط اختباري', en: 'Test activity' },
      positiveAction: { ar: 'رتّب بطاقات آمنة.', en: 'Arrange safe cards.' },
      recurrence: 'once' as const,
    };
    const props = {
      snapshot: snapshot(),
      controller,
      disabled: false,
      draft,
      onAssigned: () => undefined,
    };
    render(() => CloudCustomTaskView(props));
    expect(find('cloud-custom-title-ar')!.props.value).toBe(draft.title.ar);
    expect(find('cloud-custom-action-en')!.props.value).toBe(draft.positiveAction.en);
    press('cloud-custom-review-save');
    expect(controller.command).not.toHaveBeenCalled();
    render(() => CloudCustomTaskView(props));
    expect(labels()).toContain(draft.positiveAction.en);
    press('cloud-custom-review-save');
    await settle();
    expect(controller.command).toHaveBeenCalledExactlyOnceWith({
      type: 'create_custom_template',
      ...draft,
      reviewed: true,
    });
  });

  it('does not expose custom definition creation to a Child', () => {
    render(() =>
      CloudCustomTaskView({
        snapshot: snapshot('child'),
        controller,
        disabled: false,
        onAssigned: () => undefined,
      }),
    );
    expect(tree).toBeNull();
    expect(controller.command).not.toHaveBeenCalled();
  });
});
