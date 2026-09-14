import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StudyForm } from '@/components/study/StudyForm';
import { StudyScreen } from '@/components/study/StudyScreen';

const mock = vi.hoisted(() => ({
  cursor: 0,
  slots: [] as { value: unknown }[],
  focused: true,
  focusEffect: null as (() => void | (() => void)) | null,
  cleanup: null as (() => void) | null,
  listeners: new Set<() => boolean>(),
  removed: vi.fn(),
  keyboardVisible: false,
  dismissKeyboard: vi.fn(),
  router: { replace: vi.fn() },
  state: {
    parent: true,
    child: false,
    direction: 'rtl',
    locale: 'ar',
    activeChildId: 'child_salem',
    children: {},
    localFamily: {
      record: {
        studyInstanceId: 'synthetic-study-instance',
        children: [{ id: 'child_salem', nickname: 'Salem' }],
      },
    },
    studyRevision: 0,
    setActiveChild: vi.fn(),
    initializeStudy: vi.fn(),
    dispatchStudy: vi.fn(),
    getStudy: () => ({ ok: true, data: { plans: [], goals: [] } }),
  },
}));

vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useState: (initial: unknown) => {
    const slot = (mock.slots[mock.cursor++] ??= { value: initial });
    return [slot.value, (value: unknown) => (slot.value = value)];
  },
  useMemo: (calculate: () => unknown) => calculate(),
  useCallback: (callback: unknown) => callback,
  useEffect: (effect: () => void) => effect(),
}));
vi.mock('expo-router', () => ({
  Redirect: 'Redirect',
  useRouter: () => mock.router,
  useFocusEffect: (effect: () => void | (() => void)) => {
    mock.cleanup?.();
    mock.focusEffect = effect;
    mock.cleanup = mock.focused ? (effect() ?? null) : null;
  },
}));
vi.mock('react-native', () => ({
  View: 'View',
  Platform: { OS: 'android', select: (values: Record<string, unknown>) => values.default },
  StyleSheet: { create: (styles: unknown) => styles },
  Keyboard: {
    isVisible: () => mock.keyboardVisible,
    dismiss: () => {
      mock.dismissKeyboard();
      mock.keyboardVisible = false;
    },
  },
  BackHandler: {
    addEventListener: (event: string, callback: () => boolean) => {
      expect(event).toBe('hardwareBackPress');
      mock.listeners.add(callback);
      return {
        remove: () => {
          mock.removed();
          mock.listeners.delete(callback);
        },
      };
    },
  },
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/components/primitives', () => ({
  Screen: 'Screen',
  Button: 'Button',
  Input: 'Input',
  Text: 'Text',
}));
vi.mock('@/config/demoEntry', () => ({ entryMode: 'demo' }));
vi.mock('@/services', () => ({ pilotSampleEnabled: false }));
vi.mock('@/i18n', () => ({ localize: (value: unknown) => value }));
vi.mock('@/components/study/AcademicGoalCard', () => ({ AcademicGoalCard: 'AcademicGoalCard' }));
vi.mock('@/components/study/StudyPlanCard', () => ({ StudyPlanCard: 'StudyPlanCard' }));
vi.mock('@/components/study/StudyPractice', () => ({ StudyPractice: 'StudyPractice' }));
vi.mock('@/state/usePrototypeStore', () => ({
  usePrototypeStore: (selector: (state: typeof mock.state) => unknown) => selector(mock.state),
  selectHasActiveParentExperience: (state: typeof mock.state) => state.parent,
  selectCanEnterChildExperience: (state: typeof mock.state) => state.child,
}));

type Node = ReactElement<Record<string, unknown>>;
type Role = 'parent' | 'child';
let workspaceSlots: { value: unknown }[];
let formSlots: { value: unknown }[];
let formKey: string | null;
let tree: ReactNode;

function find(predicate: (node: Node) => boolean, value: ReactNode = tree): Node | undefined {
  if (Array.isArray(value)) {
    for (const child of value) {
      const found = find(predicate, child);
      if (found) return found;
    }
  }
  if (!isValidElement<Record<string, unknown>>(value)) return undefined;
  return predicate(value) ? value : find(predicate, (value.props.children as ReactNode) ?? null);
}

function render(role: Role) {
  mock.slots = workspaceSlots;
  mock.cursor = 0;
  const route = StudyScreen({ role });
  tree =
    typeof route.type === 'function'
      ? (route.type as (props: { role: Role }) => ReactNode)({ role })
      : route;
}

function renderForm() {
  const form = find((node) => node.type === StudyForm);
  expect(form).toBeDefined();
  if (form!.key !== formKey) formSlots = [];
  formKey = form!.key;
  mock.slots = formSlots;
  mock.cursor = 0;
  return StudyForm(form!.props as Parameters<typeof StudyForm>[0]);
}

function pressBack() {
  return [...mock.listeners].reverse().some((listener) => listener());
}

function blur() {
  mock.focused = false;
  mock.cleanup?.();
  mock.cleanup = null;
}

beforeEach(() => {
  blur();
  vi.clearAllMocks();
  mock.listeners.clear();
  mock.focused = true;
  mock.focusEffect = null;
  mock.keyboardVisible = false;
  mock.state.parent = true;
  mock.state.child = false;
  workspaceSlots = [];
  formSlots = [];
  formKey = null;
  tree = null;
});

describe('Study Android Back navigation', () => {
  it.each(['parent', 'child'] as const)(
    'consumes Back and returns authorized %s to its own Home',
    (role) => {
      mock.state.parent = role === 'parent';
      mock.state.child = role === 'child';
      render(role);
      expect(pressBack()).toBe(true);
      expect(mock.router.replace).toHaveBeenCalledExactlyOnceWith(`/${role}`);
      expect(mock.state.dispatchStudy).not.toHaveBeenCalled();
    },
  );

  it.each(['parent', 'child'] as const)(
    'dismisses the keyboard first and preserves the %s plan draft',
    (role) => {
      mock.state.parent = role === 'parent';
      mock.state.child = role === 'child';
      render(role);
      (find((node) => node.props.testID === 'study-add-plan')!.props.onPress as () => void)();
      render(role);
      const draft = renderForm();
      (
        find((node) => node.props.testID === 'study-title', draft)!.props.onChangeText as (
          text: string,
        ) => void
      )('Synthetic revision plan');
      mock.keyboardVisible = true;

      expect(pressBack()).toBe(true);
      expect(mock.dismissKeyboard).toHaveBeenCalledOnce();
      expect(mock.router.replace).not.toHaveBeenCalled();
      render(role);
      expect(find((node) => node.props.testID === 'study-title', renderForm())!.props.value).toBe(
        'Synthetic revision plan',
      );
      expect(mock.state.dispatchStudy).not.toHaveBeenCalled();
      expect(pressBack()).toBe(true);
      expect(mock.router.replace).toHaveBeenCalledExactlyOnceWith(`/${role}`);
    },
  );

  it('gives the onscreen Back action the same keyboard-first navigation', () => {
    render('parent');
    const back = find((node) => node.props.children === 'study.back')!.props.onPress as () => void;
    mock.keyboardVisible = true;
    back();
    expect(mock.dismissKeyboard).toHaveBeenCalledOnce();
    expect(mock.router.replace).not.toHaveBeenCalled();
    back();
    expect(mock.router.replace).toHaveBeenCalledExactlyOnceWith('/parent');
  });

  it('removes its Back subscription on blur and restores only one subscription on refocus', () => {
    render('parent');
    expect(mock.listeners.size).toBe(1);
    blur();
    expect(mock.removed).toHaveBeenCalledOnce();
    expect(pressBack()).toBe(false);
    expect(mock.router.replace).not.toHaveBeenCalled();
    mock.focused = true;
    mock.cleanup = mock.focusEffect?.() ?? null;
    expect(mock.listeners.size).toBe(1);
    expect(pressBack()).toBe(true);
    expect(mock.router.replace).toHaveBeenCalledExactlyOnceWith('/parent');
    blur();
    expect(mock.listeners.size).toBe(0);
  });

  it.each(['parent', 'child'] as const)(
    'registers no handler for an unauthorized %s screen',
    (role) => {
      mock.state.parent = false;
      mock.state.child = false;
      render(role);
      expect(find((node) => node.props.href === '/')).toBeDefined();
      expect(pressBack()).toBe(false);
      expect(mock.router.replace).not.toHaveBeenCalled();
    },
  );
});
