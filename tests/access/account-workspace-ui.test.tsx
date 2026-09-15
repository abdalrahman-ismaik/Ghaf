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
      expect(byId('workspace-navigation')?.props.accessibilityRole).toBe('tablist');
      expect(byId('workspace-show-family')?.props).toMatchObject({
        accessibilityRole: 'tab',
        accessibilityState: { selected: true },
      });
      expect(byId('workspace-show-task')?.props.accessibilityState).toEqual({ selected: false });
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
    expect(byId('workspace-add-member')?.props.disabled).toBe(true);
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
    expect(byId('workspace-show-task')?.props.disabled).toBe(false);
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

  it('reloads a conflicted revision without discarding the draft and lets the user retry', async () => {
    render();
    press('workspace-rename-family');
    render();
    enter('Retained draft');
    mock.state = { ...mock.state, conflict: true, error: 'profile_conflict' };
    render();
    expect(byId('workspace-editor-save')?.props.disabled).toBe(true);
    expect(byId('workspace-reload')?.props.children).toBe(
      pilotResources.ar.workspace.reloadKeepDraft,
    );
    press('workspace-reload');
    await settle();
    expect(byId('workspace-editor-primary')?.props.value).toBe('Retained draft');
    vi.mocked(mock.controller.reload).mockImplementationOnce(async () => {
      mock.state = { ...mock.state, data: { ...saved, revision: 2 }, conflict: false, error: null };
      return true;
    });
    press('workspace-reload');
    await settle();
    expect(byId('workspace-editor-primary')?.props.value).toBe('Retained draft');
    press('workspace-editor-save');
    await settle();
    expect(mock.controller.update).toHaveBeenCalledWith(
      { type: 'rename_family', name: 'Retained draft' },
      2,
    );
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
      accessibilityState: { checked: false },
    });
    enter('Prepared new task');
    expect(byId('workspace-editor-save')?.props.disabled).toBe(true);
    press('workspace-choose-member-b');
    render();
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

  it('keeps a selected member and task draft through language and section changes', () => {
    render();
    press('workspace-show-task');
    render();
    press('workspace-add-task');
    render();
    enter('ترتيب الكتب My books');
    press('workspace-choose-member-b');
    render();
    mock.locale = 'en';
    render();
    expect(byId('workspace-editor-primary')?.props).toMatchObject({
      value: 'ترتيب الكتب My books',
      direction: 'ltr',
      label: pilotResources.en.workspace.taskTitle,
    });
    expect(byId('workspace-choose-member-b')?.props.accessibilityState).toEqual({ checked: true });
    press('workspace-show-family');
    render();
    expect(byId('workspace-family-section')).toBeDefined();
    expect(byId('workspace-show-family')?.props.accessibilityState).toEqual({ selected: true });
    expect(byId('workspace-show-task')?.props.accessibilityState).toEqual({ selected: false });
    expect(byId('workspace-resume-draft')).toBeDefined();
    press('workspace-resume-draft');
    render();
    expect(byId('workspace-show-task')?.props.accessibilityState).toEqual({ selected: true });
    expect(byId('workspace-editor-primary')?.props.value).toBe('ترتيب الكتب My books');
    expect(byId('workspace-choose-member-b')?.props.accessibilityState).toEqual({ checked: true });
    expect(mock.controller.update).not.toHaveBeenCalled();
  });

  it('keeps an editor visible on a transient refresh failure and restores the selected saved member', async () => {
    render();
    press('workspace-show-task');
    render();
    press('workspace-add-task');
    render();
    press('workspace-choose-member-b');
    render();
    enter('Retained on network failure');
    mock.state = { ...mock.state, data: null, error: 'network_unavailable' };
    render();
    expect(byId('workspace-editor-primary')?.props.value).toBe('Retained on network failure');
    expect(byId('workspace-editor-save')?.props.disabled).toBe(true);
    vi.mocked(mock.controller.reload).mockImplementationOnce(async () => {
      mock.state = { ...mock.state, data: { ...saved, revision: 2 }, error: null };
      return true;
    });
    press('workspace-reload');
    await settle();
    expect(byId('workspace-editor-primary')?.props.value).toBe('Retained on network failure');
    expect(byId('workspace-choose-member-b')?.props.accessibilityState).toEqual({ checked: true });
    press('workspace-editor-save');
    await settle();
    expect(mock.controller.update).toHaveBeenCalledWith(
      { type: 'add_task', childId: 'member-b', title: 'Retained on network failure' },
      2,
    );
  });

  it('issues one write for rapid save taps and keeps failed input available for retry', async () => {
    render();
    press('workspace-rename-family');
    render();
    enter('One family write');
    let finish: (value: boolean) => void = () => undefined;
    vi.mocked(mock.controller.update).mockImplementationOnce(
      () =>
        new Promise<boolean>((resolve) => {
          finish = resolve;
        }),
    );
    press('workspace-editor-save');
    press('workspace-editor-save');
    press('workspace-editor-save');
    expect(mock.controller.update).toHaveBeenCalledTimes(1);
    finish(false);
    await settle();
    expect(byId('workspace-editor-primary')?.props.value).toBe('One family write');
    press('workspace-editor-save');
    await settle();
    expect(mock.controller.update).toHaveBeenCalledTimes(2);
  });

  it('issues one completion request while a result is pending and preserves the saved status', async () => {
    render();
    press('workspace-show-task');
    render();
    let finish: (value: boolean) => void = () => undefined;
    vi.mocked(mock.controller.update).mockImplementationOnce(
      () =>
        new Promise<boolean>((resolve) => {
          finish = resolve;
        }),
    );
    press('workspace-complete-task-task-a');
    press('workspace-complete-task-task-a');
    press('workspace-complete-task-task-a');
    expect(mock.controller.update).toHaveBeenCalledExactlyOnceWith(
      { type: 'complete_task', id: 'task-a', completed: true },
      1,
    );
    expect(byId('workspace-task-status-task-a')?.props.children).toBe(
      pilotResources.ar.workspace.open,
    );
    finish(false);
    await settle();
    expect(byId('workspace-task-status-task-a')?.props.children).toBe(
      pilotResources.ar.workspace.open,
    );
  });

  it('requires a selected member to still exist in the reloaded server records', async () => {
    render();
    press('workspace-show-task');
    render();
    press('workspace-add-task');
    render();
    press('workspace-choose-member-b');
    render();
    enter('Do not reassign my task');
    vi.mocked(mock.controller.reload).mockImplementationOnce(async () => {
      mock.state = { ...mock.state, data: { ...saved, revision: 2, members: [saved.members[0]!] } };
      return true;
    });
    press('workspace-reload');
    await settle();
    expect(byId('workspace-editor-primary')?.props.value).toBe('Do not reassign my task');
    expect(byId('workspace-editor-save')?.props.disabled).toBe(true);
    expect(byId('workspace-choose-member-a')?.props.accessibilityState).toEqual({ checked: false });
    expect(mock.controller.update).not.toHaveBeenCalled();
  });

  it('withholds private editor text when account access is denied', () => {
    render();
    press('workspace-rename-family');
    render();
    enter('Private family draft');
    mock.state = { ...mock.state, data: null, error: 'session_expired' };
    render();
    expect(byId('workspace-editor-primary')).toBeUndefined();
    expect(byId('workspace-family-section')).toBeUndefined();
  });

  it('guides the first server-confirmed family name and member into task creation', async () => {
    mock.state = {
      ...mock.state,
      data: { ...saved, familyName: '', members: [], tasks: [], studyPlans: [] },
    };
    render();
    expect(byId('workspace-setup-guidance')).toBeDefined();
    expect(byId('workspace-add-member')?.props.disabled).toBe(true);
    press('workspace-rename-family');
    render();
    enter('عائلتنا');
    vi.mocked(mock.controller.update).mockImplementationOnce(async () => {
      mock.state = {
        ...mock.state,
        data: { ...mock.state.data!, familyName: 'عائلتنا', revision: 2 },
        notice: 'saved',
      };
      return true;
    });
    press('workspace-editor-save');
    await settle();
    expect(byId('workspace-add-member')?.props.disabled).toBe(false);
    press('workspace-add-member');
    render();
    enter('نور');
    vi.mocked(mock.controller.update).mockImplementationOnce(async () => {
      mock.state = {
        ...mock.state,
        data: {
          ...mock.state.data!,
          members: [{ id: 'saved-noor', nickname: 'نور' }],
          revision: 3,
        },
      };
      return true;
    });
    press('workspace-editor-save');
    await settle();
    expect(byId('workspace-member-saved-noor')).toBeDefined();
    press('workspace-setup-tasks');
    render();
    expect(byId('workspace-add-task')?.props.disabled).toBe(false);
    press('workspace-add-task');
    render();
    expect(byId('workspace-choose-saved-noor')?.props.accessibilityState).toEqual({
      checked: false,
    });
  });
});
