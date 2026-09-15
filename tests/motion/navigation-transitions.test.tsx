import { createRequire } from 'node:module';

import { createElement, type ComponentType, type ReactNode } from 'react';
import type { NativeStackNavigationOptions } from 'expo-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import RootLayout from '../../app/_layout';
import ParentAccessLayout from '../../app/access/parent/_layout';
import ChildLayout from '../../app/child/_layout';
import ParentLayout from '../../app/parent/_layout';
import { navigationMotionOptions } from '@/design/navigationMotion';
import { colors } from '@/design/tokens';

interface HostProps {
  children?: ReactNode;
}

interface StackProps extends HostProps {
  screenOptions:
    | NativeStackNavigationOptions
    | ((context: { route: { name: string } }) => NativeStackNavigationOptions);
}

interface ScreenProps {
  name: string;
  options: NativeStackNavigationOptions;
}

interface SessionState {
  locale: string;
  activeExperience: string;
  parentReceipt: boolean;
  childReceipt: boolean;
  authorizeParentExperience: () => { ok: boolean };
  authorizeChildExperience: () => { ok: boolean };
}

const mock = vi.hoisted(() => ({
  platform: 'android',
  reduced: false,
  experience: 'parent',
  parentReceipt: true,
  childReceipt: true,
  stacks: [] as StackProps[],
  screens: [] as ScreenProps[],
  redirects: [] as string[],
  authorizeParent: vi.fn(() => ({ ok: true })),
  authorizeChild: vi.fn(() => ({ ok: true })),
}));

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  // This suite starts at the mounted boundary; hydration has its own execution suite.
  useSyncExternalStore: (_subscribe: unknown, getSnapshot: () => unknown) => getSnapshot(),
}));
vi.mock('expo-router', () => ({
  Stack: Object.assign(
    (props: StackProps) => {
      mock.stacks.push(props);
      return createElement('main', null, props.children);
    },
    {
      Screen: (props: ScreenProps) => {
        mock.screens.push(props);
        return null;
      },
    },
  ),
  Redirect: ({ href }: { href: string }) => {
    mock.redirects.push(href);
    return null;
  },
  usePathname: () => '/parent',
}));
vi.mock('react-native', () => ({
  Platform: {
    get OS() {
      return mock.platform;
    },
    select: (options: Record<string, unknown>) => options[mock.platform] ?? options.default,
  },
  StyleSheet: { create: (styles: unknown) => styles },
  View: ({ children }: HostProps) => createElement('div', null, children),
}));
vi.mock('@/utils/useReducedMotionPreference', () => ({
  useReducedMotionPreference: () => mock.reduced,
}));
vi.mock('@/state/usePrototypeStore', () => ({
  selectHasActiveParentExperience: (state: SessionState) => state.parentReceipt,
  selectCanEnterChildExperience: (state: SessionState) => state.childReceipt,
  usePrototypeStore: (selector: (state: SessionState) => unknown) =>
    selector({
      locale: 'ar',
      activeExperience: mock.experience,
      parentReceipt: mock.parentReceipt,
      childReceipt: mock.childReceipt,
      authorizeParentExperience: mock.authorizeParent,
      authorizeChildExperience: mock.authorizeChild,
    }),
}));
vi.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: HostProps) => children,
}));
vi.mock('tamagui', () => ({ TamaguiProvider: ({ children }: HostProps) => children }));
vi.mock('@/design/tamagui', () => ({ ghafTamaguiConfig: {} }));
vi.mock('@/components/audio', () => ({
  AmbientAudioProvider: ({ children }: HostProps) => children,
}));
vi.mock('@/components/familyMessaging/MessagingLifecycle', () => ({
  MessagingLifecycle: () => null,
}));
vi.mock('@/features/pilot/config', () => ({ getPilotConfig: () => ({ enabled: false }) }));
vi.mock('@/config/demoEntry', () => ({ entryMode: 'ordinary' }));
vi.mock('@/components/pilot', () => ({ PilotGate: ({ children }: HostProps) => children }));
vi.mock('@expo-google-fonts/alexandria/700Bold', () => ({ Alexandria_700Bold: 1 }));
vi.mock('@expo-google-fonts/alexandria/800ExtraBold', () => ({ Alexandria_800ExtraBold: 2 }));
vi.mock('@expo-google-fonts/readex-pro/400Regular', () => ({ ReadexPro_400Regular: 3 }));
vi.mock('@expo-google-fonts/readex-pro/500Medium', () => ({ ReadexPro_500Medium: 4 }));
vi.mock('expo-font', () => ({ useFonts: () => [true, null] }));
vi.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: async () => undefined,
  hideAsync: async () => undefined,
}));
vi.mock('@/features/startup', () => ({
  preloadStartupImages: async () => undefined,
  preloadDeferredImages: async () => ({ failed: 0 }),
  startupImageTotal: 1,
}));
vi.mock('@/i18n', () => ({
  configureNativeDirection: () => undefined,
  setI18nLocale: () => undefined,
  synchronizeWebDocumentLocale: () => undefined,
}));
vi.mock('expo-status-bar', () => ({ StatusBar: () => null }));
vi.mock('@/components/PrototypeStatusBar', () => ({ PrototypeStatusBar: () => null }));
vi.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: HostProps) => children,
}));
vi.mock('@/components/primitives', () => ({
  GhafFontProvider: ({ children }: HostProps) => children,
}));
vi.mock('@/components/onboarding', () => ({
  FirstRunExperienceProvider: ({ children }: HostProps) => children,
  SectionTransitionOverlay: () => null,
  BrandedSplash: () => null,
}));

const { renderToStaticMarkup } = createRequire(import.meta.url)('react-dom/server') as {
  renderToStaticMarkup(node: ReactNode): string;
};

function render(layout: ComponentType) {
  mock.stacks = [];
  mock.screens = [];
  mock.redirects = [];
  renderToStaticMarkup(createElement(layout));
}

function optionsFor(routeName: string): NativeStackNavigationOptions {
  expect(mock.stacks).toHaveLength(1);
  const options = mock.stacks[0]!.screenOptions;
  return typeof options === 'function' ? options({ route: { name: routeName } }) : options;
}

beforeEach(() => {
  mock.platform = 'android';
  mock.reduced = false;
  mock.experience = 'parent';
  mock.parentReceipt = true;
  mock.childReceipt = true;
  mock.authorizeParent.mockReturnValue({ ok: true });
  mock.authorizeChild.mockReturnValue({ ok: true });
});

describe('native navigator motion policy', () => {
  it.each([
    ['android', 'fade_from_bottom'],
    ['ios', 'default'],
    ['web', 'fade'],
  ] as const)(
    'uses the supported %s detail transition without custom gesture or duration',
    (platform, animation) => {
      expect(navigationMotionOptions(platform, false)).toEqual({
        animationTypeForReplace: 'push',
        animation,
        contentStyle: { backgroundColor: colors.ivory },
        headerShown: false,
      });
      expect(navigationMotionOptions(platform, false, 'peer')).toMatchObject({
        animation: 'none',
        animationTypeForReplace: 'pop',
      });
      expect(navigationMotionOptions(platform, true).animation).toBe('none');
      expect(navigationMotionOptions(platform, true, 'peer').animation).toBe('none');
    },
  );
});

// These host renders execute current layout guards and inspect the options passed to Stack.
// They do not run native navigation, Back gestures, transition frames or mounted focus effects.
describe('layout transition ownership', () => {
  it.each([
    { name: 'root', layout: RootLayout, detail: 'messages/index', experience: 'parent' },
    { name: 'parent', layout: ParentLayout, detail: 'task/review', experience: 'parent' },
    { name: 'child', layout: ChildLayout, detail: 'task', experience: 'child' },
    {
      name: 'parent access',
      layout: ParentAccessLayout,
      detail: 'sign-in',
      experience: 'signed_out',
    },
  ])(
    'updates $name stack options immediately across repeated live preference changes',
    ({ layout, detail, experience }) => {
      mock.experience = experience;
      for (const reduced of [false, true, false, true, false]) {
        mock.reduced = reduced;
        render(layout);
        expect(mock.redirects).toEqual([]);
        expect(optionsFor(detail)).toEqual({
          animationTypeForReplace: layout === ParentLayout ? 'pop' : 'push',
          animation: reduced ? 'none' : 'fade_from_bottom',
          contentStyle: { backgroundColor: colors.ivory },
          headerShown: false,
        });
      }
    },
  );

  it.each(['android', 'ios', 'web'])('keeps root peer destinations still on %s', (platform) => {
    mock.platform = platform;
    render(RootLayout);
    for (const route of ['index', 'parent', 'child', 'garden', 'league']) {
      expect(optionsFor(route).animation).toBe('none');
    }
    expect(optionsFor('garden/impact').animation).toBe(
      navigationMotionOptions(platform, false).animation,
    );
  });

  it('keeps Parent home/family and Child Today still while details use their native stack', () => {
    render(ParentLayout);
    expect(optionsFor('index').animation).toBe('none');
    expect(optionsFor('family/index').animation).toBe('none');
    expect(optionsFor('family/members').animation).toBe('fade_from_bottom');
    mock.experience = 'child';
    render(ChildLayout);
    expect(optionsFor('index').animation).toBe('none');
    expect(optionsFor('task').animation).toBe('fade_from_bottom');
  });

  it('reverses existing Parent return replacements while access steps keep moving forward', () => {
    for (const reduced of [false, true, false]) {
      mock.reduced = reduced;
      render(RootLayout);
      expect(optionsFor('parent').animationTypeForReplace).toBe('pop');
      expect(optionsFor('garden').animationTypeForReplace).toBe('pop');
      expect(optionsFor('access/parent').animationTypeForReplace).toBe('push');
      render(ParentLayout);
      for (const route of ['index', 'family/index', 'task/review', 'reauthenticate', 'settings']) {
        expect(optionsFor(route).animationTypeForReplace).toBe('pop');
      }
      render(ParentAccessLayout);
      for (const route of ['sign-in', 'verify-code', 'setup']) {
        expect(optionsFor(route).animationTypeForReplace).toBe('push');
      }
    }
    mock.experience = 'child';
    render(ChildLayout);
    expect(optionsFor('index').animationTypeForReplace).toBe('pop');
    expect(optionsFor('task').animationTypeForReplace).toBe('push');
  });

  it('retains the Child reveal modal with a reduced-motion fallback', () => {
    mock.experience = 'child';
    for (const reduced of [false, true, false]) {
      mock.reduced = reduced;
      render(ChildLayout);
      expect(mock.screens).toEqual([
        {
          name: 'reveal/[bundleId]',
          options: {
            animation: reduced ? 'none' : 'fade',
            gestureEnabled: false,
            presentation: 'modal',
          },
        },
      ]);
    }
  });

  it('lets SuccessSheet own the access success surface without a second navigator animation', () => {
    mock.experience = 'signed_out';
    for (const reduced of [false, true]) {
      mock.reduced = reduced;
      render(ParentAccessLayout);
      expect(mock.screens).toEqual([
        {
          name: 'family-created-success',
          options: {
            animation: 'none',
            contentStyle: { backgroundColor: colors.transparent },
            gestureEnabled: false,
            presentation: 'transparentModal',
          },
        },
      ]);
    }
  });

  it('redirects cross-role entry without mounting any stack', () => {
    mock.experience = 'child';
    for (const layout of [ParentLayout, ParentAccessLayout]) {
      render(layout);
      expect(mock.redirects).toEqual(['/child']);
      expect(mock.stacks).toHaveLength(0);
    }
    mock.experience = 'parent';
    render(ChildLayout);
    expect(mock.redirects).toEqual(['/parent']);
    expect(mock.stacks).toHaveLength(0);
  });

  it.each([
    { layout: ParentLayout, experience: 'parent', role: 'parent' },
    { layout: ChildLayout, experience: 'child', role: 'child' },
  ] as const)(
    'keeps the $role stack closed for missing receipts and failed authorization',
    ({ layout, experience, role }) => {
      mock.experience = experience;
      const authorize = role === 'parent' ? mock.authorizeParent : mock.authorizeChild;
      if (role === 'parent') mock.parentReceipt = false;
      else mock.childReceipt = false;
      render(layout);
      expect(mock.redirects).toEqual(['/']);
      expect(mock.stacks).toHaveLength(0);
      expect(authorize).not.toHaveBeenCalled();
      mock.parentReceipt = true;
      mock.childReceipt = true;
      authorize.mockReturnValue({ ok: false });
      mock.reduced = true;
      render(layout);
      expect(mock.redirects).toEqual(['/']);
      expect(mock.stacks).toHaveLength(0);
      expect(authorize).toHaveBeenCalledOnce();
    },
  );
});
