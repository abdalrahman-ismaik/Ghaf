import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AccountWorkspaceView } from '../../src/components/pilot/AccountWorkspaceView';
import type {
  AccountWorkspaceController,
  AccountWorkspaceState,
} from '../../src/features/pilot/workspaceController';
import { pilotResources } from '../../src/i18n/pilotResources';
import type { AccountWorkspace } from '../../src/models/accountWorkspace';

const mock = vi.hoisted(() => ({
  cursor: 0,
  slots: [] as { value?: unknown }[],
  locale: 'ar' as 'ar' | 'en',
  state: {} as AccountWorkspaceState,
  controller: {} as AccountWorkspaceController,
}));

vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>();
  return {
    ...react,
    useState: (initial: unknown) => {
      const slot = (mock.slots[mock.cursor++] ??= { value: initial });
      return [
        slot.value,
        (next: unknown) => {
          slot.value = typeof next === 'function' ? next(slot.value) : next;
        },
      ];
    },
    useRef: (initial: unknown) => {
      const slot = (mock.slots[mock.cursor++] ??= { value: { current: initial } });
      return slot.value;
    },
    useEffect: () => undefined,
  };
});
vi.mock('react-native', () => ({
  Platform: {
    OS: 'android',
    select: (options: Record<string, unknown>) => options.android ?? options.default,
  },
  View: 'View',
  ActivityIndicator: 'ActivityIndicator',
  StyleSheet: { create: (styles: unknown) => styles },
}));
vi.mock('@/components/access', () => ({
  AccessTextField: 'AccessTextField',
  StatusBanner: 'StatusBanner',
}));
vi.mock('@/components/primitives', () => ({ Button: 'Button', Text: 'Text' }));
vi.mock('@/state/usePrototypeStore', () => ({
  usePrototypeStore: (selector: (state: object) => unknown) =>
    selector({ locale: mock.locale, direction: mock.locale === 'ar' ? 'rtl' : 'ltr' }),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, string | number>) => {
      const result = key
        .replace(/^pilot\./, '')
        .split('.')
        .reduce<unknown>(
          (current, part) =>
            current && typeof current === 'object'
              ? (current as Record<string, unknown>)[part]
              : undefined,
          pilotResources[mock.locale],
        );
      return Object.entries(values ?? {}).reduce(
        (label, [name, value]) => label.replace(`{{${name}}}`, String(value)),
        typeof result === 'string' ? result : key,
      );
    },
  }),
}));

const saved: AccountWorkspace = {
  userId: 'adult-a',
  workspaceId: 'workspace-a',
  revision: 1,
  updatedAt: '2026-09-14T00:00:00.000Z',
  familyName: 'Prepared family',
  members: [
    { id: 'member-a', nickname: 'Prepared A' },
    { id: 'member-b', nickname: 'Prepared B' },
  ],
  tasks: [{ id: 'task-a', childId: 'member-a', title: 'Prepared task', completed: false }],
  studyPlans: [
    {
      id: 'study-a',
      childId: 'member-b',
      subject: 'Prepared study',
      nextStep: 'Read one page',
      completed: false,
    },
  ],
};
type Node = ReactElement<Record<string, unknown>>;
let tree: ReactNode;
function nodes(value: ReactNode = tree): Node[] {
  if (Array.isArray(value)) return value.flatMap((child) => nodes(child ?? null));
  if (!isValidElement<Record<string, unknown>>(value)) return [];
  return [value, ...nodes((value.props.children as ReactNode) ?? null)];
}
function byId(id: string) {
  return nodes().find((node) => node.props.testID === id);
}
function render() {
  mock.cursor = 0;
  tree = AccountWorkspaceView({ controller: mock.controller, state: mock.state });
}
function press(id: string) {
  const node = byId(id);
  expect(node, `${id} should exist`).toBeDefined();
  (node!.props.onPress as () => void)();
}
function enter(value: string, secondary = false) {
  (
    byId(secondary ? 'workspace-editor-secondary' : 'workspace-editor-primary')!.props
      .onChangeText as (next: string) => void
  )(value);
  render();
}
async function settle() {
  await Promise.resolve();
  await Promise.resolve();
  render();
}

beforeEach(() => {
  mock.cursor = 0;
  mock.slots = [];
  mock.locale = 'ar';
  mock.state = {
    data: saved,
    loading: false,
    busy: false,
    error: null,
    conflict: false,
    notice: null,
  };
  mock.controller = {
    getSnapshot: () => mock.state,
    subscribe: vi.fn(() => () => false),
    load: vi.fn(async () => false),
    reload: vi.fn(async () => false),
    update: vi.fn(async () => false),
    dispose: vi.fn(),
  };
});

describe('saved account workspace presentation', () => {
  it.each(['ar', 'en'] as const)(
    'uses bilingual controls and keeps device demo data explicitly separate in %s',
    (locale) => {
      mock.locale = locale;
      render();
      expect(
        nodes().some((node) => node.props.children === pilotResources[locale].workspace.separate),
      ).toBe(true);
      expect(byId('workspace-family-name')?.props.children).toBe(saved.familyName);
      expect(byId('workspace-show-family')?.props.accessibilityState).toEqual({ expanded: true });
      press('workspace-rename-family');
      render();
      expect(byId('workspace-editor-primary')?.props).toMatchObject({
        label: pilotResources[locale].workspace.familyName,
        direction: locale === 'ar' ? 'rtl' : 'ltr',
        value: saved.familyName,
      });
      expect(byId('workspace-editor-save')?.props.children).toBe(
        pilotResources[locale].workspace.save,
      );
    },
  );

  it('shows loading and retry without rendering fabricated saved records', () => {
    mock.state = { ...mock.state, data: null, loading: true, busy: true };
    render();
    expect(byId('workspace-loading')).toBeDefined();
    expect(byId('workspace-family-section')).toBeUndefined();
    mock.state = { ...mock.state, loading: false, busy: false, error: 'profile_unavailable' };
    render();
    expect(byId('workspace-loading')).toBeUndefined();
    expect(byId('workspace-reload')?.props.disabled).toBe(false);
    expect(
      nodes().some((node) => node.props.message === pilotResources.ar.workspace.unavailable),
    ).toBe(true);
  });

  it('provides empty states and requires a saved family member before tasks or study', () => {
    mock.state = {
      ...mock.state,
      data: { ...saved, familyName: '', members: [], tasks: [], studyPlans: [] },
    };
    render();
    expect(byId('workspace-members-empty')).toBeDefined();
    expect(byId('workspace-add-member')?.props.disabled).toBe(false);
    press('workspace-show-task');
    render();
    expect(byId('workspace-tasks-empty')).toBeDefined();
    expect(byId('workspace-add-task')?.props.disabled).toBe(true);
    press('workspace-show-study');
    render();
    expect(byId('workspace-study-empty')).toBeDefined();
    expect(byId('workspace-add-study')?.props.disabled).toBe(true);
  });

  it('preserves a dirty form and its captured revision through background data changes', async () => {
    render();
    press('workspace-rename-family');
    render();
    enter('My unsaved family');
    mock.state = { ...mock.state, data: { ...saved, familyName: 'Other client', revision: 2 } };
    render();
    expect(byId('workspace-editor-primary')?.props.value).toBe('My unsaved family');
    expect(byId('workspace-show-task')?.props.disabled).toBe(true);
    expect(byId('workspace-add-member')?.props.disabled).toBe(true);
    press('workspace-editor-save');
    await settle();
    expect(mock.controller.update).toHaveBeenCalledExactlyOnceWith(
      { type: 'rename_family', name: 'My unsaved family' },
      1,
    );
    expect(byId('workspace-editor-primary')?.props.value).toBe('My unsaved family');
    expect(nodes().some((node) => node.props.message === pilotResources.ar.workspace.saved)).toBe(
      false,
    );
  });

  it('retains conflicted edits until an explicit reload succeeds', async () => {
    render();
    press('workspace-rename-family');
    render();
    enter('Retained draft');
    mock.state = { ...mock.state, conflict: true, error: 'profile_conflict' };
    render();
    expect(byId('workspace-editor-save')?.props.disabled).toBe(true);
    expect(byId('workspace-reload')?.props.children).toBe(
      pilotResources.ar.workspace.discardReload,
    );
    press('workspace-reload');
    await settle();
    expect(byId('workspace-editor-primary')?.props.value).toBe('Retained draft');
    vi.mocked(mock.controller.reload).mockResolvedValueOnce(true);
    press('workspace-reload');
    await settle();
    expect(byId('workspace-family-editor')).toBeUndefined();
  });

  it('cancels an unsubmitted draft without writing and removes a successfully saved editor', async () => {
    render();
    press('workspace-add-member');
    render();
    enter('Cancelled nickname');
    press('workspace-editor-cancel');
    render();
    expect(byId('workspace-member-editor')).toBeUndefined();
    expect(mock.controller.update).not.toHaveBeenCalled();
    press('workspace-add-member');
    render();
    enter('Saved nickname');
    vi.mocked(mock.controller.update).mockResolvedValueOnce(true);
    press('workspace-editor-save');
    await settle();
    expect(mock.controller.update).toHaveBeenCalledExactlyOnceWith(
      { type: 'add_member', nickname: 'Saved nickname' },
      1,
    );
    expect(byId('workspace-member-editor')).toBeUndefined();
  });

  it('allows a task to choose a member through accessible controls and sends a bounded command', async () => {
    render();
    press('workspace-show-task');
    render();
    press('workspace-add-task');
    render();
    expect(byId('workspace-editor-save')?.props.disabled).toBe(true);
    expect(byId('workspace-choose-member-a')?.props).toMatchObject({
      accessibilityRole: 'radio',
      accessibilityState: { checked: true },
    });
    press('workspace-choose-member-b');
    render();
    enter('Prepared new task');
    press('workspace-editor-save');
    await settle();
    expect(mock.controller.update).toHaveBeenCalledWith(
      { type: 'add_task', childId: 'member-b', title: 'Prepared new task' },
      1,
    );
  });

  it('edits study subject and next step while keeping the assigned member fixed', async () => {
    render();
    press('workspace-show-study');
    render();
    press('workspace-edit-study-study-a');
    render();
    expect(byId('workspace-choose-member-a')).toBeUndefined();
    expect(byId('workspace-editor-secondary')?.props).toMatchObject({
      multiline: true,
      value: 'Read one page',
    });
    enter('Prepared revised study');
    enter('Practise one example', true);
    press('workspace-editor-save');
    await settle();
    expect(mock.controller.update).toHaveBeenCalledWith(
      {
        type: 'edit_study_plan',
        id: 'study-a',
        subject: 'Prepared revised study',
        nextStep: 'Practise one example',
      },
      1,
    );
  });

  it('does not announce completion until the server data changes', async () => {
    render();
    press('workspace-show-task');
    render();
    press('workspace-complete-task-task-a');
    await settle();
    expect(mock.controller.update).toHaveBeenCalledWith(
      { type: 'complete_task', id: 'task-a', completed: true },
      1,
    );
    expect(byId('workspace-task-status-task-a')?.props.children).toBe(
      pilotResources.ar.workspace.open,
    );
    mock.state = {
      ...mock.state,
      data: { ...saved, revision: 2, tasks: [{ ...saved.tasks[0]!, completed: true }] },
      notice: 'saved',
    };
    render();
    expect(byId('workspace-task-status-task-a')?.props.children).toBe(
      pilotResources.ar.workspace.completed,
    );
    expect(byId('workspace-complete-task-task-a')?.props.children).toBe(
      pilotResources.ar.workspace.reopen,
    );
  });

  it('renders only one section and ten stable records at a time with realistic volume', () => {
    const tasks = Array.from({ length: 200 }, (_, index) => ({
      id: `task-${index}`,
      childId: 'member-a',
      title: `Prepared ${index}`,
      completed: false,
    }));
    mock.state = { ...mock.state, data: { ...saved, tasks } };
    render();
    expect(byId('workspace-task-task-0')).toBeUndefined();
    press('workspace-show-task');
    render();
    expect(byId('workspace-family-section')).toBeUndefined();
    expect(byId('workspace-study-section')).toBeUndefined();
    expect(
      nodes().filter((node) => String(node.props.testID).startsWith('workspace-task-task-')),
    ).toHaveLength(10);
    expect(byId('workspace-task-task-0')?.key).toBe('task-0');
    expect(byId('workspace-task-task-10')).toBeUndefined();
    press('workspace-task-next');
    render();
    expect(byId('workspace-task-task-0')).toBeUndefined();
    expect(byId('workspace-task-task-10')?.key).toBe('task-10');
    expect(byId('workspace-add-task')?.props.disabled).toBe(true);
  });

  it('keeps pending writes disabled without clearing the visible draft', () => {
    render();
    press('workspace-rename-family');
    render();
    enter('Pending family');
    mock.state = { ...mock.state, busy: true };
    render();
    expect(byId('workspace-editor-primary')?.props).toMatchObject({
      editable: false,
      value: 'Pending family',
    });
    expect(byId('workspace-editor-save')?.props.disabled).toBe(true);
    expect(byId('workspace-editor-cancel')?.props.disabled).toBe(true);
    expect(byId('workspace-reload')?.props.disabled).toBe(true);
  });
});
