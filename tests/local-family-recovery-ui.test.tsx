import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import WelcomeScreen from '../app/index';
import { resources } from '../src/i18n/resources';

interface HookSlot {
  value?: unknown;
  dependencies?: readonly unknown[];
  cleanup?: () => void;
}

const mock = vi.hoisted(() => ({
  state: {} as Record<string, unknown>,
  firstRun: { completed: false, step: 'intro' },
  cursor: 0,
  slots: [] as HookSlot[],
  effects: [] as (() => void)[],
  backListeners: new Set<() => boolean>(),
  platform: 'android',
  presentationReady: true,
  focus: vi.fn(),
  dispatch: vi.fn(),
  retry: vi.fn(),
  recover: vi.fn(),
  reset: vi.fn(),
  enterParent: vi.fn(),
  setLocale: vi.fn(),
  router: { dismissAll: vi.fn(), replace: vi.fn(), push: vi.fn() },
}));

vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>();
  const slot = () => (mock.slots[mock.cursor++] ??= {});
  const same = (a?: readonly unknown[], b?: readonly unknown[]) =>
    Boolean(a && b && a.length === b.length && a.every((value, i) => Object.is(value, b[i])));
  const memo = (factory: () => unknown, dependencies: readonly unknown[]) => {
    const current = slot();
    if (!same(current.dependencies, dependencies)) current.value = factory();
    current.dependencies = dependencies;
    return current.value;
  };
  return {
    ...react,
    // Preserve state and effect cleanup while exercising explicit component transitions in Node.
    useState: (initial: unknown) => {
      const current = slot();
      if (!('value' in current)) current.value = initial;
      return [
        current.value,
        (next: unknown) => {
          current.value = typeof next === 'function' ? next(current.value) : next;
        },
      ];
    },
    useEffect: (effect: () => void | (() => void), dependencies?: readonly unknown[]) => {
      const current = slot();
      if (same(current.dependencies, dependencies)) return;
      current.dependencies = dependencies;
      mock.effects.push(() => {
        current.cleanup?.();
        current.cleanup = effect() || undefined;
      });
    },
    useCallback: (callback: unknown, dependencies: readonly unknown[]) =>
      memo(() => callback, dependencies),
    useRef: (value: unknown) => memo(() => ({ current: value }), []),
  };
});
vi.mock('expo-router', () => ({
  Redirect: 'Redirect',
  useRouter: () => mock.router,
}));
vi.mock('react-native', () => ({
  View: 'View',
  Platform: {
    get OS() {
      return mock.platform;
    },
    select: (values: Record<string, unknown>) => values[mock.platform] ?? values.default,
  },
  StyleSheet: { create: (styles: unknown) => styles },
  BackHandler: {
    addEventListener: (_event: string, callback: () => boolean) => {
      mock.backListeners.add(callback);
      return { remove: () => mock.backListeners.delete(callback) };
    },
  },
}));
vi.mock('@/components/access', () => ({
  AccessScreen: 'AccessScreen',
  AccessHeader: 'AccessHeader',
  AccessActionRegion: 'AccessActionRegion',
  PrototypePill: 'PrototypePill',
  StatusBanner: 'StatusBanner',
}));
vi.mock('@/components/brand/GhafRasterLogo', () => ({ GhafRasterLogo: 'GhafRasterLogo' }));
vi.mock('@/components/illustrations', () => ({ LocalIllustration: 'LocalIllustration' }));
vi.mock('@/components/primitives', () => ({ Button: 'Button', Text: 'Text' }));
vi.mock('@/components/onboarding', () => ({
  FirstRunOnboarding: 'FirstRunOnboarding',
  useFirstRunExperience: () => ({
    state: mock.firstRun,
    dispatch: mock.dispatch,
    presentationReady: mock.presentationReady,
  }),
}));
vi.mock('@/utils/accessibilityFocus', () => ({ focusAccessibilityTarget: mock.focus }));
vi.mock('@/state/usePrototypeStore', () => ({
  usePrototypeStore: Object.assign(
    (selector: (state: unknown) => unknown) => selector(mock.state),
    { getState: () => mock.state },
  ),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const dictionary = resources[mock.state.locale as 'ar' | 'en'].translation;
      return (
        key.split('.').reduce<unknown>((value, part) => {
          return value && typeof value === 'object'
            ? (value as Record<string, unknown>)[part]
            : undefined;
        }, dictionary) ?? key
      );
    },
  }),
}));

type Node = ReactElement<Record<string, unknown>>;
let tree: ReactNode;

function find(match: (node: Node) => boolean, value: ReactNode = tree): Node | undefined {
  if (Array.isArray(value)) {
    for (const child of value) {
      const found = find(match, child);
      if (found) return found;
    }
  }
  if (!isValidElement<Record<string, unknown>>(value)) return undefined;
  if (match(value)) return value;
  return (
    find(match, (value.props.children as ReactNode) ?? null) ??
    find(match, (value.props.header as ReactNode) ?? null) ??
    find(match, (value.props.trailing as ReactNode) ?? null)
  );
}

function byId(testID: string) {
  return find((node) => node.props.testID === testID);
}

function refresh() {
  mock.cursor = 0;
  tree = WelcomeScreen();
  if (isValidElement(tree) && typeof tree.type === 'function') {
    tree = (tree.type as (props: unknown) => ReactNode)(tree.props);
    const title = byId('local-family-recovery-title');
    const ref = title?.props.ref as { current: unknown } | undefined;
    if (ref) ref.current = { testID: 'local-family-recovery-title' };
  } else {
    for (const slot of mock.slots) slot.cleanup?.();
  }
  for (const effect of mock.effects.splice(0)) effect();
}

function press(testID: string) {
  const button = byId(testID);
  expect(button, `Expected available control ${testID}`).toBeDefined();
  (button!.props.onPress as () => void)();
  refresh();
}

function unavailable(corrupt = true) {
  mock.state.localFamily = {
    status: 'unavailable',
    record: null,
    configuredChildIds: [],
    errorCode: corrupt ? 'corrupt_local_data' : 'invalid_or_unavailable_local_data',
  };
}

function expectNoRecoveryCommands() {
  expect(mock.retry).not.toHaveBeenCalled();
  expect(mock.recover).not.toHaveBeenCalled();
  expect(mock.reset).not.toHaveBeenCalled();
  expect(mock.enterParent).not.toHaveBeenCalled();
  expect(mock.router.replace).not.toHaveBeenCalled();
  expect(mock.router.push).not.toHaveBeenCalled();
}

beforeEach(() => {
  vi.resetAllMocks();
  mock.cursor = 0;
  mock.slots = [];
  mock.effects = [];
  mock.backListeners.clear();
  mock.platform = 'android';
  mock.presentationReady = true;
  mock.firstRun = { completed: false, step: 'intro' };
  mock.state = {
    activeExperience: 'signed_out',
    locale: 'ar',
    direction: 'rtl',
    localFamily: { status: 'ready', record: null, errorCode: null },
    parentOnboarding: { status: 'signed_out' },
    childAccess: { canEnterChildExperience: false },
    retryLocalFamilyLoad: mock.retry,
    confirmCorruptLocalFamilyRecovery: mock.recover,
    resetPrototype: mock.reset,
    enterParentExperience: mock.enterParent,
    setLocale: mock.setLocale,
  };
  mock.setLocale.mockImplementation((locale: string) => {
    mock.state.locale = locale;
    mock.state.direction = locale === 'ar' ? 'rtl' : 'ltr';
  });
  mock.dispatch.mockImplementation(() => {
    mock.firstRun.completed = true;
  });
  mock.retry.mockReturnValue({ ok: false, error: { message: 'PRIVATE RAW STORAGE FAILURE' } });
  mock.recover.mockReturnValue({ ok: false, error: { message: 'PRIVATE RAW STORAGE FAILURE' } });
});

afterEach(() => {
  for (const slot of mock.slots) slot.cleanup?.();
});

describe('Welcome local demo-family recovery', () => {
  it('keeps healthy first-run and ordinary Welcome unchanged without hidden commands', () => {
    refresh();
    expect(find((node) => node.type === 'FirstRunOnboarding')).toBeDefined();
    mock.firstRun.completed = true;
    refresh();
    expect(byId('welcome-screen')).toBeDefined();
    expect(byId('local-family-recovery-screen')).toBeUndefined();
    expectNoRecoveryCommands();
  });

  it.each(['parent', 'child'])(
    'preserves the active %s redirect even with unavailable data',
    (role) => {
      unavailable();
      mock.state.activeExperience = role;
      mock.state.parentOnboarding = { status: 'authenticated_parent' };
      mock.state.childAccess = { canEnterChildExperience: true };
      refresh();
      expect(find((node) => node.type === 'Redirect')?.props.href).toBe(`/${role}`);
      expectNoRecoveryCommands();
    },
  );

  it.each(['ar', 'en'] as const)(
    'shows localized %s corruption before first-run with a separate proposal',
    (locale) => {
      unavailable();
      mock.setLocale(locale);
      refresh();
      expect(byId('local-family-recovery-screen')).toBeDefined();
      expect(find((node) => node.type === 'FirstRunOnboarding')).toBeUndefined();
      expect(byId('local-family-recovery-confirm')).toBeUndefined();
      const title = byId('local-family-recovery-title')!;
      expect(title.props.accessibilityLabel).not.toMatch(/^access\./);
      expect(title.props.accessibilityLanguage).toBe(locale === 'ar' ? 'ar-AE' : 'en-AE');
      const heading = find((node) => node.type === 'Text', title)!;
      expect(heading.props.direction).toBe(locale === 'ar' ? 'rtl' : 'ltr');
      expect(title.props.accessibilityRole).toBe('header');
      press('local-family-recovery-propose');
      expect(byId('local-family-recovery-confirm')).toBeDefined();
      expectNoRecoveryCommands();
    },
  );

  it.each(['cancel', 'header', 'android'])(
    'makes %s Back from confirmation non-destructive',
    (action) => {
      unavailable();
      refresh();
      press('local-family-recovery-propose');
      if (action === 'cancel') press('local-family-recovery-cancel');
      if (action === 'header') {
        (find((node) => node.type === 'AccessHeader')!.props.onBack as () => void)();
        refresh();
      }
      if (action === 'android') {
        expect(mock.backListeners.size).toBe(1);
        expect([...mock.backListeners][0]!()).toBe(true);
        refresh();
      }
      expect(byId('local-family-recovery-propose')).toBeDefined();
      expect(byId('local-family-recovery-confirm')).toBeUndefined();
      expectNoRecoveryCommands();
    },
  );

  it('keeps transient unavailability retry-only and hides raw errors', () => {
    unavailable(false);
    refresh();
    expect(byId('local-family-recovery-propose')).toBeUndefined();
    expect(byId('local-family-recovery-confirm')).toBeUndefined();
    press('local-family-recovery-retry');
    expect(mock.retry).toHaveBeenCalledTimes(1);
    expect(mock.recover).not.toHaveBeenCalled();
    expect(mock.reset).not.toHaveBeenCalled();
    const error = find((node) => node.type === 'StatusBanner' && node.props.tone === 'error');
    expect(error).toBeDefined();
    expect(error!.props.message).not.toContain('PRIVATE');
    expect(error!.props.message).not.toMatch(/^access\./);
  });

  it('allows non-destructive retry after a failed read and returns to normal access when repaired', () => {
    unavailable(false);
    mock.firstRun.completed = true;
    refresh();
    press('local-family-recovery-retry');
    mock.retry.mockImplementation(() => {
      mock.state.localFamily = { status: 'ready', record: { synthetic: true }, errorCode: null };
      return { ok: true, data: true };
    });
    press('local-family-recovery-retry');
    expect(mock.retry).toHaveBeenCalledTimes(2);
    expect(byId('welcome-screen')).toBeDefined();
    expect(mock.recover).not.toHaveBeenCalled();
    expect(mock.router.replace).not.toHaveBeenCalled();
    expect(mock.state.activeExperience).toBe('signed_out');
  });

  it.each([true, false])(
    'preserves cold-start access after retry with saved family present: %s',
    (present) => {
      unavailable(false);
      mock.retry.mockImplementation(() => {
        mock.state.localFamily = {
          status: 'ready',
          record: present ? { synthetic: true } : null,
          errorCode: null,
        };
        return { ok: true, data: true };
      });
      refresh();
      press('local-family-recovery-retry');
      if (present) {
        expect(byId('welcome-screen')).toBeDefined();
        expect(mock.dispatch).toHaveBeenCalledExactlyOnceWith({ type: 'skip' });
      } else {
        expect(find((node) => node.type === 'FirstRunOnboarding')).toBeDefined();
        expect(mock.dispatch).not.toHaveBeenCalled();
      }
      expect(mock.recover).not.toHaveBeenCalled();
      expect(mock.reset).not.toHaveBeenCalled();
      expect(mock.router.replace).not.toHaveBeenCalled();
      expect(mock.state.activeExperience).toBe('signed_out');
    },
  );

  it('keeps failed confirmation retryable and resets history only after successful clearing', () => {
    unavailable();
    mock.setLocale('en');
    refresh();
    press('local-family-recovery-propose');
    press('local-family-recovery-confirm');
    expect(mock.recover).toHaveBeenCalledExactlyOnceWith({ confirmed: true });
    expect(byId('local-family-recovery-confirm')).toBeDefined();
    expect(mock.router.replace).not.toHaveBeenCalled();
    expect(mock.dispatch).not.toHaveBeenCalled();
    const error = find((node) => node.type === 'StatusBanner' && node.props.tone === 'error');
    expect(error!.props.message).not.toContain('PRIVATE');
    mock.recover.mockImplementation(() => {
      mock.state.localFamily = { status: 'ready', record: null, errorCode: null };
      mock.state.locale = 'ar';
      mock.state.direction = 'rtl';
      return { ok: true, data: { navigation: { to: '/', replaceHistory: true } } };
    });
    press('local-family-recovery-confirm');
    expect(mock.recover).toHaveBeenCalledTimes(2);
    expect(mock.router.dismissAll).toHaveBeenCalledOnce();
    expect(mock.router.replace).toHaveBeenCalledExactlyOnceWith('/');
    expect(mock.dispatch).toHaveBeenCalledExactlyOnceWith({ type: 'skip' });
    expect(byId('welcome-screen')).toBeDefined();
    expect(byId('welcome-title')!.props.language).toBe('ar');
    expect(mock.state.activeExperience).toBe('signed_out');
    expect(mock.reset).not.toHaveBeenCalled();
    expect(mock.enterParent).not.toHaveBeenCalled();
  });

  it('switches language during confirmation without reading or clearing saved data', () => {
    unavailable();
    refresh();
    press('local-family-recovery-propose');
    press('local-family-recovery-language');
    expect(mock.state.locale).toBe('en');
    expect(byId('local-family-recovery-title')!.props.accessibilityLanguage).toBe('en-AE');
    expect(byId('local-family-recovery-confirm')).toBeDefined();
    expectNoRecoveryCommands();
  });

  it('focuses each stage heading after startup is ready and preserves non-destructive Back', () => {
    mock.presentationReady = false;
    unavailable();
    refresh();
    expect(mock.focus).not.toHaveBeenCalled();
    mock.presentationReady = true;
    refresh();
    expect(mock.focus).toHaveBeenCalledExactlyOnceWith({ testID: 'local-family-recovery-title' });
    press('local-family-recovery-propose');
    expect(mock.focus).toHaveBeenCalledTimes(2);
    press('local-family-recovery-cancel');
    expect(mock.focus).toHaveBeenCalledTimes(3);
    expectNoRecoveryCommands();
  });

  it('removes destructive controls if the latest classification becomes unavailable', () => {
    unavailable();
    refresh();
    press('local-family-recovery-propose');
    unavailable(false);
    refresh();
    expect(byId('local-family-recovery-confirm')).toBeUndefined();
    expect(byId('local-family-recovery-propose')).toBeUndefined();
    expect(byId('local-family-recovery-retry')).toBeDefined();
    expectNoRecoveryCommands();
  });

  it('does not register unsupported web BackHandler listeners', () => {
    mock.platform = 'web';
    unavailable();
    refresh();
    press('local-family-recovery-propose');
    expect(mock.backListeners.size).toBe(0);
    press('local-family-recovery-cancel');
    expectNoRecoveryCommands();
  });
});
