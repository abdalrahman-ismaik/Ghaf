import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import CheckIn from '../../app/parent/check-in';
import ComposerRoute from '../../app/parent/task/new';
import Review from '../../app/parent/task/review';
import { R002bNestedScreen } from '@/components/r002b/R002bNestedScreen';

type Effect = () => void | (() => void);
interface Slot {
  value?: unknown;
  deps?: readonly unknown[];
  cleanup?: () => void;
}
type Element = ReactElement<Record<string, unknown>>;

const mock = vi.hoisted(() => ({
  cursor: 0,
  slots: [] as Slot[],
  effects: [] as (() => void)[],
  focused: true,
  dirty: false,
  platform: 'android',
  state: {} as Record<string, unknown>,
  admission: {} as Record<string, unknown>,
  backs: new Set<() => boolean>(),
  router: { push: vi.fn(), replace: vi.fn(), dismissAll: vi.fn(), dismissTo: vi.fn() },
  restore: vi.fn(),
  edit: vi.fn(),
  approve: vi.fn(),
  translate: (key: string) => key,
}));

vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>();
  const slot = () => (mock.slots[mock.cursor++] ??= {});
  const same = (a?: readonly unknown[], b?: readonly unknown[]) =>
    Boolean(a && b && a.length === b.length && a.every((item, i) => Object.is(item, b[i])));
  const memo = (factory: () => unknown, deps: readonly unknown[]) => {
    const current = slot();
    if (!same(current.deps, deps)) current.value = factory();
    current.deps = deps;
    return current.value;
  };
  return {
    ...react,
    useCallback: (callback: unknown, deps: readonly unknown[]) => memo(() => callback, deps),
    useRef: (initial: unknown) => memo(() => ({ current: initial }), []),
    useState: (initial: unknown) => {
      const current = slot();
      if (!('value' in current)) current.value = initial;
      return [
        current.value,
        (next: unknown) => {
          current.value = typeof next === 'function' ? next(current.value) : next;
          mock.dirty = true;
        },
      ];
    },
    useEffect: (run: Effect, deps: readonly unknown[]) => {
      const current = slot();
      if (same(current.deps, deps)) return;
      current.deps = deps;
      mock.effects.push(() => {
        current.cleanup?.();
        current.cleanup = run() || undefined;
      });
    },
  };
});
vi.mock('expo-router', async () => {
  const { useEffect } = await import('react');
  return {
    useRouter: () => mock.router,
    useNavigationContainerRef: () => ({}),
    useLocalSearchParams: () => ({}),
    // Model a retained screen's focus/blur cleanup, not native frames or navigation animation.
    useFocusEffect: (callback: Effect) => {
      const focused = mock.focused;
      useEffect(() => {
        if (focused) return callback();
      }, [callback, focused]);
    },
  };
});
vi.mock('react-native', () => ({
  BackHandler: {
    addEventListener: (_name: string, callback: () => boolean) => {
      mock.backs.add(callback);
      return { remove: () => mock.backs.delete(callback) };
    },
  },
  Platform: {
    get OS() {
      return mock.platform;
    },
    select: (options: Record<string, unknown>) => options.default,
  },
  StyleSheet: { create: (styles: unknown) => styles, hairlineWidth: 1 },
  View: 'View',
  Pressable: 'Pressable',
}));
vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: mock.translate }) }));
vi.mock('@/state/usePrototypeStore', () => ({
  usePrototypeStore: Object.assign(
    (select: (state: Record<string, unknown>) => unknown) => select(mock.state),
    { getState: () => mock.state },
  ),
}));
vi.mock('@/services', () => ({
  serviceRegistry: { recognition: { resolveCheckInState: () => mock.admission } },
}));
vi.mock('@/i18n', () => ({
  bilingualResource: (key: string) => ({ ar: key, en: key }),
  localize: (value: Record<string, string>, locale: string) => value[locale],
}));
vi.mock('@/features/growth/parentProgress', () => ({
  resolveParentProgressTaskPrefill: () => null,
}));
vi.mock('@/components/family-growth/ParentCheckIn', () => ({ ParentCheckIn: 'ParentCheckIn' }));
vi.mock('@/components/family-growth/ParentTaskComposer', () => ({
  ParentTaskComposer: 'ParentTaskComposer',
}));
vi.mock('@/components/family-growth/ParentVoicePermissionPanel', () => ({
  ParentVoicePermissionPanel: 'ParentVoicePermissionPanel',
}));
vi.mock('@/components/family-growth/TaskPanels', () => ({ SafetyBoundary: 'SafetyBoundary' }));
vi.mock('@/components/journey', () => ({ JourneyHeader: 'JourneyHeader' }));
vi.mock('@/components/access', () => ({ GhafIcon: 'GhafIcon' }));
vi.mock('@/components/brand', () => ({ GhafHeaderTitle: 'GhafHeaderTitle' }));
vi.mock('@/components/primitives', () => ({
  Button: 'Button',
  Text: 'Text',
  Screen: 'Screen',
  QuietButton: 'QuietButton',
}));
vi.mock('@/components/r002a', () => ({
  R002aScreen: 'R002aScreen',
  R002aFlowHeader: 'R002aFlowHeader',
  TaskCreatedSuccessSheet: 'TaskCreatedSuccessSheet',
  TaskStepIndicator: 'TaskStepIndicator',
}));

function render(component: () => ReactNode, focused = mock.focused): ReactNode {
  mock.focused = focused;
  let result: ReactNode;
  let count = 0;
  do {
    if (++count > 10) throw new Error('Focus render did not settle');
    mock.dirty = false;
    mock.cursor = 0;
    result = component();
    mock.effects.splice(0).forEach((run) => run());
  } while (mock.dirty);
  return result;
}
function elements(node: ReactNode): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!isValidElement<Record<string, unknown>>(node)) return [];
  return [node, ...elements(node.props.children as ReactNode)];
}
function screen(node: ReactNode, type: string): Element {
  const result = elements(node).find((element) => element.type === type);
  if (!result) throw new Error(`Missing ${type}`);
  return result;
}
function back(): boolean {
  for (const callback of [...mock.backs].reverse()) if (callback()) return true;
  return false;
}
function cleanup() {
  mock.slots.forEach((slot) => slot.cleanup?.());
}

beforeEach(() => {
  vi.clearAllMocks();
  mock.slots = [];
  mock.effects = [];
  mock.focused = true;
  mock.platform = 'android';
  mock.backs.clear();
  mock.edit.mockReturnValue({ ok: true });
  mock.approve.mockReturnValue({ ok: true });
  mock.state = {
    locale: 'ar',
    direction: 'rtl',
    role: 'parent',
    activeChildId: 'child_salem',
    children: { child_salem: { displayName: { ar: 'سالم', en: 'Salem' } } },
    childVoiceView: { permissionEnabled: false },
    returnReviewedTaskToDraft: mock.edit,
    approveAssignment: mock.approve,
    restoreCheckInState: mock.restore,
    journey: {
      lifecycle: 'reviewed',
      submission: { id: 'submission-1' },
      task: {
        id: 'task-1',
        targetChildId: 'child_salem',
        content: {
          title: { ar: 'مهمة', en: 'Task' },
          recognitionMode: 'standard',
          routinePhase: 'acquisition',
          visibilityScope: 'household',
          displayedSeedAward: 12,
        },
      },
    },
  };
  mock.admission = { ok: true, data: { state: 'awaiting_confirmation' } };
});
afterEach(cleanup);

describe('retained Parent page focus lifecycle', () => {
  it('removes review Back on blur, restores one listener on return, and removes it on unmount', () => {
    render(Review);
    expect(mock.backs.size).toBe(1);
    render(Review, false);
    expect(back()).toBe(false);
    expect(mock.edit).not.toHaveBeenCalled();
    render(Review, true);
    render(Review);
    expect(mock.backs.size).toBe(1);
    expect(back()).toBe(true);
    expect(mock.edit).toHaveBeenCalledTimes(1);
    expect(mock.router.replace).toHaveBeenCalledWith('/parent/task/new');
    cleanup();
    expect(mock.backs.size).toBe(0);
  });

  it('does not redirect a covered review when the authoritative task changes', () => {
    render(Review);
    render(Review, false);
    mock.state.journey = null;
    render(Review);
    expect(mock.router.replace).not.toHaveBeenCalled();
    render(Review, true);
    expect(mock.router.replace).toHaveBeenCalledExactlyOnceWith('/parent/task/new');
  });

  it('keeps review interactive on failed edit and releases Back when approval opens success', () => {
    mock.edit.mockReturnValue({ ok: false });
    render(Review);
    expect(back()).toBe(true);
    render(Review);
    expect(mock.router.replace).not.toHaveBeenCalled();
    const root = screen(render(Review), 'R002aScreen');
    const footer = root.props.footer as Element;
    (footer.props.onApprove as () => void)();
    const success = screen(render(Review), 'TaskCreatedSuccessSheet');
    expect(mock.approve).toHaveBeenCalledTimes(1);
    expect(success.props.visible).toBe(true);
    expect(mock.backs.size).toBe(0);
  });

  it('leaves redirects and check-in restoration to the focused route', () => {
    render(CheckIn, false);
    mock.admission = { ok: false };
    render(CheckIn);
    expect(mock.router.replace).not.toHaveBeenCalled();
    render(CheckIn, true);
    expect(mock.router.replace).toHaveBeenCalledWith('/parent');
    render(CheckIn, false);
    mock.admission = {
      ok: true,
      data: {
        state: 'confirmation_pending',
        attempt: {
          plan: { recognitionKey: 'recognition-1', renderState: 'praise_pending' },
        },
      },
    };
    render(CheckIn);
    expect(mock.restore).not.toHaveBeenCalled();
    render(CheckIn, true);
    expect(mock.restore).toHaveBeenCalledExactlyOnceWith('submission-1');
  });

  it('refreshes a covered composer only when returning, keeping its existing review action', () => {
    const first = screen(render(ComposerRoute), 'ParentTaskComposer');
    expect(screen(render(ComposerRoute), 'ParentTaskComposer').key).toBe(first.key);
    (first.props.onReadyForReview as () => void)();
    expect(mock.router.push).toHaveBeenCalledExactlyOnceWith('/parent/task/review');
    expect(screen(render(ComposerRoute, false), 'ParentTaskComposer').key).toBe(first.key);
    const returned = screen(render(ComposerRoute, true), 'ParentTaskComposer');
    expect(returned.key).not.toBe(first.key);
    expect(screen(render(ComposerRoute), 'ParentTaskComposer').key).toBe(returned.key);
    render(ComposerRoute, false);
    expect(screen(render(ComposerRoute, true), 'ParentTaskComposer').key).not.toBe(returned.key);
  });

  it.each(['android', 'web'])('focus-scopes the shared nested Back shell on %s', (platform) => {
    mock.platform = platform;
    const onBack = vi.fn();
    const Nested = () =>
      R002bNestedScreen({
        backLabel: 'Back',
        direction: 'rtl',
        language: 'ar',
        onBack,
        reducedMotion: true,
        testID: 'nested',
        title: 'تفاصيل طويلة',
      });
    render(Nested);
    expect(mock.backs.size).toBe(platform === 'android' ? 1 : 0);
    render(Nested, false);
    expect(back()).toBe(false);
    render(Nested, true);
    expect(back()).toBe(platform === 'android');
    expect(onBack).toHaveBeenCalledTimes(platform === 'android' ? 1 : 0);
    cleanup();
    expect(mock.backs.size).toBe(0);
  });
});
