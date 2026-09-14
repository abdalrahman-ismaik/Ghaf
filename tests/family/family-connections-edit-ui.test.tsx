import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FamilyConnectionPlan } from '@/components/family/FamilyConnectionPlan';
import ParentFamilyConnectionsRoute from '../../app/parent/family/connections';
import { createFamilyConnectionPlan } from '@/features/family-connections';

const mock = vi.hoisted(() => ({
  cursor: 0,
  slots: [] as { value: unknown }[],
  keyboardVisible: false,
  back: null as (() => boolean) | null,
  cleanup: null as (() => void) | null,
  state: {
    allowed: true,
    locale: 'ar',
    direction: 'rtl',
    demoRunGeneration: 3,
    localFamily: {
      record: {
        createdAt: '2026-09-14T00:00:00.000Z',
        parent: { normalizedIdentifier: 'synthetic@example.test' },
        familyConnections: {
          primaryGuardianName: 'Rashid',
          secondaryGuardianName: '',
          relatives: [],
        },
      },
    },
    saveFamilyConnections: vi.fn(() => ({ ok: true })),
    getFamilyConnectionPlan: vi.fn(),
  },
}));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useState: (initial: unknown) => {
    const slot = (mock.slots[mock.cursor++] ??= { value: initial });
    return [slot.value, (value: unknown) => (slot.value = value)];
  },
  useCallback: (callback: unknown) => callback,
}));
vi.mock('expo-router', () => ({
  Redirect: 'Redirect',
  useRouter: () => ({ replace: vi.fn() }),
  useFocusEffect: (effect: () => void | (() => void)) => {
    mock.cleanup?.();
    mock.cleanup = effect() ?? null;
  },
}));
vi.mock('react-native', () => ({
  View: 'View',
  Platform: { OS: 'android', select: (values: Record<string, unknown>) => values.default },
  StyleSheet: { create: (styles: unknown) => styles, hairlineWidth: 1 },
  Keyboard: {
    isVisible: () => mock.keyboardVisible,
    dismiss: () => (mock.keyboardVisible = false),
  },
  BackHandler: {
    addEventListener: (_event: string, callback: () => boolean) => {
      mock.back = callback;
      return { remove: () => (mock.back = null) };
    },
  },
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/components/access', () => ({ GhafIcon: 'Icon' }));
vi.mock('@/components/access/FamilyPeopleEditor', () => ({ FamilyPeopleEditor: 'PeopleEditor' }));
vi.mock('@/components/primitives', () => ({ Button: 'Button', Row: 'Row', Text: 'Text' }));
vi.mock('@/components/r003', () => ({ R003Section: 'Section', R003Status: 'Status' }));
vi.mock('@/components/r002a', () => ({ R002aFlowHeader: 'Header', R002aScreen: 'Screen' }));
vi.mock('@/state/usePrototypeStore', () => ({
  usePrototypeStore: (selector: (state: typeof mock.state) => unknown) => selector(mock.state),
  selectHasActiveParentExperience: (state: typeof mock.state) => state.allowed,
}));

type Node = ReactElement<Record<string, unknown>>;
function find(tree: ReactNode, predicate: (node: Node) => boolean): Node | undefined {
  if (Array.isArray(tree)) {
    for (const child of tree) {
      const found = find(child, predicate);
      if (found) return found;
    }
  }
  if (!isValidElement<Record<string, unknown>>(tree)) return undefined;
  return predicate(tree) ? tree : find(tree.props.children as ReactNode, predicate);
}

function node(tree: ReactNode, testID: string): Node {
  const found = find(tree, (item) => item.props.testID === testID);
  if (!found) throw new Error(`Missing ${testID}`);
  return found;
}

function plan() {
  const result = createFamilyConnectionPlan(mock.state.localFamily.record.familyConnections);
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

function renderEditor() {
  mock.cursor = 0;
  const tree = FamilyConnectionPlan({
    direction: 'rtl',
    language: 'ar',
    plan: plan(),
    editable: true,
  });
  const editor = find(
    tree,
    (item) => typeof item.type === 'function' && item.type.name === 'FamilyConnectionEditor',
  );
  if (!editor || typeof editor.type !== 'function') throw new Error('Expected the editor');
  return (editor.type as (props: Record<string, unknown>) => ReactNode)(editor.props);
}

function press(tree: ReactNode, testID: string) {
  (node(tree, testID).props.onPress as () => void)();
}

beforeEach(() => {
  mock.cleanup?.();
  mock.cleanup = null;
  mock.back = null;
  mock.slots = [];
  mock.cursor = 0;
  mock.keyboardVisible = false;
  mock.state.allowed = true;
  mock.state.saveFamilyConnections.mockReset().mockReturnValue({ ok: true });
  mock.state.getFamilyConnectionPlan
    .mockReset()
    .mockImplementation(() => ({ ok: true, data: plan() }));
});

describe('post-creation family directory interaction', () => {
  it('reaches an editable plan with no relatives and denies unauthorized direct entry', () => {
    const route = ParentFamilyConnectionsRoute();
    const component = find(route, (item) => item.type === FamilyConnectionPlan);
    expect(component?.props.editable).toBe(true);
    expect(component?.props.plan).toMatchObject({ entries: [] });
    mock.state.allowed = false;
    expect(ParentFamilyConnectionsRoute().type).toBe('Redirect');
  });

  it('cancels the detached directory draft without invoking a save', () => {
    press(renderEditor(), 'edit-family-connections');
    let tree = renderEditor();
    const people = find(tree, (item) => item.type === 'PeopleEditor');
    expect(people).toBeDefined();
    (people!.props.onChange as (value: unknown) => void)({
      ...mock.state.localFamily.record.familyConnections,
      primaryGuardianName: 'Changed draft',
    });
    tree = renderEditor();
    press(tree, 'cancel-family-connections');
    expect(node(renderEditor(), 'edit-family-connections')).toBeDefined();
    expect(mock.state.saveFamilyConnections).not.toHaveBeenCalled();
    expect(mock.state.localFamily.record.familyConnections.primaryGuardianName).toBe('Rashid');
  });

  it('blocks an unfinished relative edit and saves only after the explicit final action', () => {
    press(renderEditor(), 'edit-family-connections');
    let tree = renderEditor();
    let people = find(tree, (item) => item.type === 'PeopleEditor')!;
    (people.props.onEditingChange as (value: boolean) => void)(true);
    tree = renderEditor();
    expect(node(tree, 'save-family-connections').props.disabled).toBe(true);
    press(tree, 'save-family-connections');
    expect(mock.state.saveFamilyConnections).not.toHaveBeenCalled();
    people = find(tree, (item) => item.type === 'PeopleEditor')!;
    (people.props.onEditingChange as (value: boolean) => void)(false);
    press(renderEditor(), 'save-family-connections');
    expect(mock.state.saveFamilyConnections).toHaveBeenCalledWith({
      directory: mock.state.localFamily.record.familyConnections,
      expectedFamilySnapshot: JSON.stringify(mock.state.localFamily.record),
      expectedGeneration: 3,
    });
  });

  it('uses Back to dismiss the keyboard, then cancel without saving', () => {
    press(renderEditor(), 'edit-family-connections');
    renderEditor();
    mock.keyboardVisible = true;
    expect(mock.back?.()).toBe(true);
    expect(mock.keyboardVisible).toBe(false);
    expect(node(renderEditor(), 'save-family-connections')).toBeDefined();
    expect(mock.back?.()).toBe(true);
    expect(node(renderEditor(), 'edit-family-connections')).toBeDefined();
    expect(mock.state.saveFamilyConnections).not.toHaveBeenCalled();
  });
});
