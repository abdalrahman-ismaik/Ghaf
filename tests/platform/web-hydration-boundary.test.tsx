import { createRequire } from 'node:module';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import RootLayout from '../../app/_layout';

const { renderToStaticMarkup } = createRequire(import.meta.url)('react-dom/server') as {
  renderToStaticMarkup(node: ReactNode): string;
};

const mock = vi.hoisted(() => ({
  platform: 'web',
  locale: 'ar',
  experience: 'signed_out',
  pathname: '/access/parent/sign-in',
  clientSnapshot: false,
  effects: [] as (() => void | (() => void))[],
  preloadStartupImages: vi.fn(),
  configureNativeDirection: vi.fn(),
  setI18nLocale: vi.fn(),
  synchronizeWebDocumentLocale: vi.fn(),
}));

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  // Use the server snapshot for hydration, then the client snapshot after subscription.
  useSyncExternalStore: (
    subscribe: (callback: () => void) => () => void,
    getSnapshot: () => unknown,
    getServerSnapshot: () => unknown,
  ) => {
    mock.effects.push(() => {
      mock.clientSnapshot = true;
      return subscribe(() => undefined);
    });
    return mock.clientSnapshot ? getSnapshot() : getServerSnapshot();
  },
  useEffect: (effect: () => void | (() => void)) => {
    mock.effects.push(effect);
  },
}));

vi.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: { children?: ReactNode }) => children,
}));
vi.mock('tamagui', () => ({
  TamaguiProvider: ({ children }: { children?: ReactNode }) => children,
}));
vi.mock('@/design/tamagui', () => ({ ghafTamaguiConfig: {} }));
vi.mock('@/components/audio', () => ({
  AmbientAudioProvider: ({ children }: { children?: ReactNode }) => children,
}));
vi.mock('@/components/familyMessaging/MessagingLifecycle', () => ({
  MessagingLifecycle: () => null,
}));
vi.mock('@/features/pilot/config', () => ({ getPilotConfig: () => ({ enabled: false }) }));
vi.mock('@/config/demoEntry', () => ({ entryMode: 'ordinary' }));
vi.mock('@/components/pilot', () => ({
  PilotGate: ({ children }: { children?: ReactNode }) => children,
}));
vi.mock('@expo-google-fonts/alexandria/700Bold', () => ({ Alexandria_700Bold: 1 }));
vi.mock('@expo-google-fonts/alexandria/800ExtraBold', () => ({ Alexandria_800ExtraBold: 2 }));
vi.mock('@expo-google-fonts/readex-pro/400Regular', () => ({ ReadexPro_400Regular: 3 }));
vi.mock('@expo-google-fonts/readex-pro/500Medium', () => ({ ReadexPro_500Medium: 4 }));
vi.mock('expo-font', () => ({ useFonts: () => [true, null] }));
vi.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: async () => undefined,
  hideAsync: async () => undefined,
}));
vi.mock('react-native-reanimated', () => ({ useReducedMotion: () => false }));
vi.mock('@/state/usePrototypeStore', () => ({
  usePrototypeStore: (selector: (state: { locale: string }) => unknown) =>
    selector({ locale: mock.locale }),
}));
vi.mock('@/features/startup', () => ({
  preloadStartupImages: mock.preloadStartupImages,
  preloadDeferredImages: async () => ({ failed: 0 }),
  startupImageTotal: 9,
}));
vi.mock('@/i18n', () => ({
  configureNativeDirection: mock.configureNativeDirection,
  setI18nLocale: mock.setI18nLocale,
  synchronizeWebDocumentLocale: mock.synchronizeWebDocumentLocale,
}));
vi.mock('expo-router', async () => {
  const { createElement } = await import('react');
  return {
    usePathname: () => mock.pathname,
    Stack: () =>
      createElement('main', {
        'data-testid': 'route-stack',
        'data-locale': mock.locale,
        'data-experience': mock.experience,
      }),
  };
});
vi.mock('react-native', async () => {
  const { createElement } = await import('react');
  return {
    Platform: {
      get OS() {
        return mock.platform;
      },
      select: (options: Record<string, unknown>) => options.default,
    },
    StyleSheet: { create: (styles: unknown) => styles },
    View: ({ children, testID }: { children?: ReactNode; testID?: string }) =>
      createElement('div', { 'data-testid': testID }, children),
  };
});
vi.mock('expo-status-bar', () => ({ StatusBar: () => null }));
vi.mock('@/components/PrototypeStatusBar', () => ({ PrototypeStatusBar: () => null }));
vi.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children?: ReactNode }) => children,
}));
vi.mock('@/components/primitives', () => ({
  GhafFontProvider: ({ children }: { children?: ReactNode }) => children,
}));
vi.mock('@/components/onboarding', async () => {
  const { createElement } = await import('react');
  return {
    FirstRunExperienceProvider: ({ children }: { children?: ReactNode }) => children,
    SectionTransitionOverlay: () => null,
    BrandedSplash: ({ phase }: { phase: string }) =>
      createElement('aside', { 'data-testid': 'branded-splash', 'data-phase': phase }),
  };
});

function renderRoot(): string {
  mock.effects = [];
  return renderToStaticMarkup(createElement(RootLayout));
}

beforeEach(() => {
  mock.platform = 'web';
  mock.locale = 'ar';
  mock.experience = 'signed_out';
  mock.pathname = '/access/parent/sign-in';
  mock.clientSnapshot = false;
  mock.effects = [];
});

describe('static-web session hydration boundary', () => {
  it('renders the same first markup for exported Arabic and a remembered English Child', () => {
    const exportedMarkup = renderRoot();
    mock.locale = 'en';
    mock.experience = 'child';
    const firstClientMarkup = renderRoot();

    expect(firstClientMarkup).toBe(exportedMarkup);
    expect(exportedMarkup).toContain('data-testid="web-hydration-boundary"');
    expect(exportedMarkup).not.toContain('data-testid="route-stack"');
    expect(exportedMarkup).not.toContain('data-testid="branded-splash"');
  });

  it('reveals the normal restored route tree after mount and preserves startup effects', () => {
    mock.locale = 'en';
    mock.experience = 'child';
    expect(renderRoot()).toContain('data-testid="web-hydration-boundary"');
    const cleanups = mock.effects.map((effect) => effect());
    const mountedMarkup = renderRoot();

    expect(mountedMarkup).not.toContain('data-testid="web-hydration-boundary"');
    expect(mountedMarkup).toContain('data-testid="route-stack"');
    expect(mountedMarkup).toContain('data-locale="en"');
    expect(mountedMarkup).toContain('data-experience="child"');
    expect(mountedMarkup).toContain('data-testid="branded-splash"');
    expect(mock.preloadStartupImages).toHaveBeenCalledOnce();
    expect(mock.configureNativeDirection).toHaveBeenCalledWith('en');
    expect(mock.setI18nLocale).toHaveBeenCalledWith('en');
    expect(mock.synchronizeWebDocumentLocale).toHaveBeenCalledWith('en');
    for (const cleanup of cleanups) cleanup?.();
  });

  it.each(['android', 'ios'])(
    'keeps the %s route tree available on its first render',
    (platform) => {
      mock.platform = platform;
      const nativeMarkup = renderRoot();

      expect(nativeMarkup).toContain('data-testid="route-stack"');
      expect(nativeMarkup).toContain('data-testid="branded-splash"');
      expect(nativeMarkup).not.toContain('data-testid="web-hydration-boundary"');
    },
  );
});
