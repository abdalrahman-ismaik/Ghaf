import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import RootLayout from '../../app/_layout';
import { AmbientAudioProvider } from '@/components/audio';
import { LocalIllustration } from '../../src/components/illustrations/LocalIllustration';
import { FirstRunExperienceProvider } from '../../src/components/onboarding/FirstRunExperienceContext';
import { FirstRunOnboarding } from '../../src/components/onboarding/FirstRunOnboarding';
import { interactionMotion } from '../../src/design/motion';
import { firstRunMotion, motion } from '../../src/design/tokens';
import { resources } from '../../src/i18n/resources';

type Effect = () => void | (() => void);
interface HookSlot {
  value?: unknown;
  dependencies?: readonly unknown[];
  cleanup?: () => void;
}
interface HookScope {
  cursor: number;
  slots: HookSlot[];
  effects: (() => void)[];
}
interface TimingAnimation {
  kind: 'timing';
  target: number;
  config: { duration: number; reduceMotion: string };
}
interface SharedValue {
  value: number;
  animation?: TimingAnimation;
  get: () => number;
  set: (next: number | TimingAnimation | ((current: number) => number | TimingAnimation)) => void;
}

const mock = vi.hoisted(() => ({
  scope: null as HookScope | null,
  dirty: false,
  platform: 'android',
  focused: true,
  appState: 'active' as string | null,
  appListeners: new Set<(state: string | null) => void>(),
  screenReader: false,
  queryScreenReader: null as (() => Promise<boolean>) | null,
  screenReaderListeners: new Set<(active: boolean) => void>(),
  experience: {} as Record<string, unknown>,
  contexts: new Map<unknown, unknown>(),
  locale: 'ar',
  reducedMotion: false,
  sharedValues: [] as SharedValue[],
  cancelAnimation: vi.fn((shared: SharedValue) => {
    shared.animation = undefined;
  }),
  withTiming: vi.fn((target: number, config: TimingAnimation['config']): TimingAnimation => ({
    kind: 'timing',
    target,
    config,
  })),
  players: new Map<string, ReturnType<typeof createPlayer>>(),
}));

function createPlayer() {
  return {
    loop: false,
    volume: 1,
    playing: false,
    pause: vi.fn(function (this: { playing: boolean }) {
      this.playing = false;
    }),
    play: vi.fn(function (this: { playing: boolean }) {
      this.playing = true;
    }),
    seekTo: vi.fn(async (_seconds: number): Promise<void> => undefined),
  };
}

vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>();
  const slot = () => {
    const scope = mock.scope!;
    const index = scope.cursor++;
    return (scope.slots[index] ??= {});
  };
  const same = (a?: readonly unknown[], b?: readonly unknown[]) =>
    Boolean(a && b && a.length === b.length && a.every((value, i) => Object.is(value, b[i])));
  const useState = (initial: unknown) => {
    const current = slot();
    if (!('value' in current)) current.value = typeof initial === 'function' ? initial() : initial;
    return [
      current.value,
      (next: unknown) => {
        const value = typeof next === 'function' ? next(current.value) : next;
        if (!Object.is(value, current.value)) mock.dirty = true;
        current.value = value;
      },
    ];
  };
  const useEffect = (effect: Effect, dependencies?: readonly unknown[]) => {
    const current = slot();
    if (same(current.dependencies, dependencies)) return;
    current.dependencies = dependencies;
    mock.scope!.effects.push(() => {
      current.cleanup?.();
      current.cleanup = effect() || undefined;
    });
  };
  const memoize = (factory: () => unknown, dependencies: readonly unknown[]) => {
    const current = slot();
    if (!same(current.dependencies, dependencies)) current.value = factory();
    current.dependencies = dependencies;
    return current.value;
  };
  return {
    ...react,
    // Preserve hook state and effect cleanup across explicit component renders in Node.
    useState,
    useEffect,
    useLayoutEffect: useEffect,
    useMemo: memoize,
    useCallback: (callback: unknown, dependencies: readonly unknown[]) =>
      memoize(() => callback, dependencies),
    useRef: (initial: unknown) => memoize(() => ({ current: initial }), []),
    useReducer: (reducer: (state: unknown, action: unknown) => unknown, initial: unknown) => {
      const [value, setValue] = useState(initial);
      return [
        value,
        (action: unknown) =>
          (setValue as (next: unknown) => void)((current: unknown) => reducer(current, action)),
      ];
    },
    useContext: (context: unknown) => mock.contexts.get(context) ?? mock.experience,
    useSyncExternalStore: (
      subscribe: (notify: () => void) => () => void,
      snapshot: () => unknown,
    ) => {
      useEffect(
        () =>
          subscribe(() => {
            mock.dirty = true;
          }),
        [subscribe],
      );
      return snapshot();
    },
  };
});

vi.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: 'GestureHandlerRootView',
}));
vi.mock('tamagui', () => ({ TamaguiProvider: 'TamaguiProvider' }));
vi.mock('@/design/tamagui', () => ({ ghafTamaguiConfig: {} }));
vi.mock('@/components/pilot', () => ({ PilotGate: 'PilotGate' }));
vi.mock('@/features/pilot/config', () => ({ getPilotConfig: () => ({ enabled: false }) }));
vi.mock('@/config/demoEntry', () => ({ entryMode: 'ordinary' }));
vi.mock('@/components/familyMessaging/MessagingLifecycle', () => ({
  MessagingLifecycle: 'MessagingLifecycle',
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
vi.mock('expo-router', () => ({
  Stack: 'Stack',
  usePathname: () => (mock.focused ? '/' : '/access/parent/sign-in'),
  useIsFocused: () => mock.focused,
}));
vi.mock('react-native', () => ({
  Platform: {
    get OS() {
      return mock.platform;
    },
    select: (values: Record<string, unknown>) => values.default,
  },
  AppState: {
    get currentState() {
      return mock.appState;
    },
    addEventListener: (_event: string, callback: (state: string | null) => void) => {
      mock.appListeners.add(callback);
      return { remove: () => mock.appListeners.delete(callback) };
    },
  },
  AccessibilityInfo: {
    isScreenReaderEnabled: () => mock.queryScreenReader?.() ?? Promise.resolve(mock.screenReader),
    addEventListener: (_event: string, callback: (active: boolean) => void) => {
      mock.screenReaderListeners.add(callback);
      return { remove: () => mock.screenReaderListeners.delete(callback) };
    },
  },
  StyleSheet: { create: (styles: unknown) => styles },
  View: 'View',
  useWindowDimensions: () => ({ width: 390, height: 844 }),
}));
vi.mock('react-native-reanimated', async () => {
  const { useRef } = await import('react');
  return {
    default: { View: 'AnimatedView', createAnimatedComponent: (component: unknown) => component },
    cancelAnimation: mock.cancelAnimation,
    Easing: { bezier: () => undefined, out: () => undefined, cubic: undefined },
    ReduceMotion: { System: 'system', Never: 'never' },
    useAnimatedStyle: () => ({}),
    useAnimatedProps: () => ({}),
    useReducedMotion: () => false,
    useSharedValue: (initial: number) => {
      const reference = useRef<SharedValue | null>(null);
      if (!reference.current) {
        const shared: SharedValue = {
          value: initial,
          get: () => shared.value,
          set: (next) => {
            const result = typeof next === 'function' ? next(shared.value) : next;
            if (typeof result === 'number') {
              shared.value = result;
              shared.animation = undefined;
            } else shared.animation = result;
          },
        };
        reference.current = shared;
        mock.sharedValues.push(shared);
      }
      return reference.current;
    },
    withTiming: mock.withTiming,
    withDelay: (_delay: number, value: unknown) => value,
  };
});
vi.mock('@/utils/useReducedMotionPreference', () => ({
  useReducedMotionPreference: () => mock.reducedMotion,
}));
vi.mock('react-native-svg', () => ({ default: 'Svg', Path: 'Path' }));
vi.mock('expo-image', () => ({ Image: 'Image' }));
vi.mock('expo-status-bar', () => ({ StatusBar: 'StatusBar' }));
vi.mock('react-native-safe-area-context', () => ({ SafeAreaProvider: 'SafeAreaProvider' }));
vi.mock('@/components/PrototypeStatusBar', () => ({ PrototypeStatusBar: 'PrototypeStatusBar' }));
vi.mock('@/components/access', () => ({ AccessScreen: 'AccessScreen', GhafIcon: 'GhafIcon' }));
vi.mock('@/components/brand/GhafBrandLockup', () => ({ GhafBrandLockup: 'GhafBrandLockup' }));
vi.mock('@/components/primitives', () => ({
  Button: 'Button',
  IconButton: 'IconButton',
  Text: 'Text',
  GhafFontProvider: 'GhafFontProvider',
}));
vi.mock('@/components/illustrations/illustrationSources', () => ({ artworkSources: {} }));
vi.mock('@/components/illustrations', async () => ({
  LocalIllustration: (await import('../../src/components/illustrations/LocalIllustration'))
    .LocalIllustration,
  onboardingArtworkIds: [
    'intro-art',
    'family-art',
    'sustainability-art',
    'ai-art',
    'support-art',
    'growth-art',
  ],
}));
vi.mock('@/components/onboarding', async () => ({
  FirstRunExperienceProvider: (
    await import('../../src/components/onboarding/FirstRunExperienceContext')
  ).FirstRunExperienceProvider,
  BrandedSplash: 'BrandedSplash',
  SectionTransitionOverlay: 'SectionTransitionOverlay',
}));
vi.mock('@/features/startup', () => ({
  startupImageTotal: 9,
  preloadStartupImages: async (progress: (value: unknown) => void) => {
    progress({ failed: 0, presentationReady: true, settled: 9, total: 9 });
  },
  preloadDeferredImages: async () => ({ failed: 0 }),
}));
vi.mock('@/i18n', () => ({
  configureNativeDirection: () => undefined,
  setI18nLocale: async () => undefined,
  synchronizeWebDocumentLocale: () => undefined,
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => (key === 'firstRun.steps' ? resources.ar.translation.firstRun.steps : key),
  }),
}));
vi.mock('@/state/usePrototypeStore', () => ({
  usePrototypeStore: (selector: (state: unknown) => unknown) =>
    selector({
      locale: mock.locale,
      direction: mock.locale === 'ar' ? 'rtl' : 'ltr',
      ambientAudioPreference: { enabled: true },
      activeExperience: 'signed_out',
      setLocale: (locale: string) => {
        mock.locale = locale;
        mock.dirty = true;
      },
    }),
}));
vi.mock('../../src/components/onboarding/onboardingAudioSources', () => ({
  onboardingNarrationSources: Object.fromEntries(
    ['ar', 'en'].map((locale) => [
      locale,
      Object.fromEntries(
        ['intro', 'family', 'sustainability', 'ai', 'support', 'growth'].map((step) => [
          step,
          `${locale}-${step}`,
        ]),
      ),
    ]),
  ),
}));
vi.mock('expo-audio', () => ({
  setAudioModeAsync: async () => undefined,
  useAudioPlayer: (source: string) => {
    if (!mock.players.has(source)) mock.players.set(source, createPlayer());
    return mock.players.get(source)!;
  },
  useAudioPlayerStatus: (player: { playing: boolean }) => ({ playing: player.playing }),
}));
vi.mock('@/components/audio', async () => {
  const { readFileSync } = await import('node:fs');
  const { runInNewContext } = await import('node:vm');
  const ts = await import('typescript');
  const imports: Record<string, unknown> = {
    react: await import('react'),
    'react/jsx-runtime': await import('react/jsx-runtime'),
    'react-native': await import('react-native'),
    'expo-audio': await import('expo-audio'),
    '@/features/audio': await import('../../src/features/audio'),
    '@/config/demoEntry': { entryMode: 'ordinary' },
    '@/state/usePrototypeStore': await import('@/state/usePrototypeStore'),
    '../../../assets/audio/ambient/calm-soundscape-v2.mp3': 'ambience',
  };
  const file = 'src/components/audio/AmbientAudioProvider.tsx';
  const compiled = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  const exports: Record<string, unknown> = {};
  // Execute the production provider with the same React/native doubles and a local audio handle.
  runInNewContext(
    compiled.outputText,
    {
      exports,
      require: (name: string) => {
        if (!(name in imports)) throw new Error(`Unexpected ambient import: ${name}`);
        return imports[name];
      },
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    },
    { filename: file },
  );
  return exports;
});

function scope(): HookScope {
  return { cursor: 0, slots: [], effects: [] };
}
function render<T>(hooks: HookScope, component: () => T): T {
  mock.scope = hooks;
  hooks.cursor = 0;
  const result = component();
  for (const effect of hooks.effects.splice(0)) effect();
  return result;
}
function dispose(hooks: HookScope) {
  for (const slot of hooks.slots) slot.cleanup?.();
}

type Node = ReactElement<Record<string, unknown>>;
function find(tree: ReactNode, match: (node: Node) => boolean): Node | undefined {
  if (Array.isArray(tree)) {
    for (const child of tree) {
      const found = find(child, match);
      if (found) return found;
    }
  }
  if (!isValidElement<Record<string, unknown>>(tree)) return undefined;
  if (match(tree)) return tree;
  return (
    find(tree.props.children as ReactNode, match) ??
    find(tree.props.header as ReactNode, match) ??
    find(tree.props.footer as ReactNode, match)
  );
}

let rootScope: HookScope;
let ambientScope: HookScope;
let providerScope: HookScope;
let onboardingScope: HookScope;
let imageScope: HookScope;
let imageKey: unknown;
let onboarding: ReactNode;
let imageTree: ReactNode;
let startupPhase: unknown;

function refresh() {
  for (let pass = 0; pass < 15; pass += 1) {
    mock.dirty = false;
    const root = render(rootScope, RootLayout);
    startupPhase = find(root, (node) => node.type === 'BrandedSplash')!.props.phase;
    const ambientProvider = find(root, (node) => node.type === AmbientAudioProvider)!;
    const ambientContext = render(ambientScope, () =>
      AmbientAudioProvider({ startupReady: ambientProvider.props.startupReady === true }),
    );
    mock.contexts.set(ambientContext.type, ambientContext.props.value);
    const provider = find(root, (node) => node.type === FirstRunExperienceProvider)!;
    const context = render(providerScope, () =>
      FirstRunExperienceProvider({ presentationReady: provider.props.presentationReady === true }),
    );
    mock.experience = context.props.value;
    onboarding = render(onboardingScope, FirstRunOnboarding);
    const illustration = find(onboarding, (node) => node.type === LocalIllustration)!;
    if (imageKey !== illustration.key) {
      dispose(imageScope);
      imageScope = scope();
      imageKey = illustration.key;
    }
    imageTree = render(imageScope, () => LocalIllustration(illustration.props as never));
    if (!mock.dirty) return;
  }
  throw new Error('Onboarding did not settle after 15 renders.');
}

async function flush() {
  for (let i = 0; i < 5; i += 1) {
    await Promise.resolve();
    refresh();
  }
}
async function advance(milliseconds: number) {
  await vi.advanceTimersByTimeAsync(milliseconds);
  await flush();
}
function press(testID: string) {
  const control = find(onboarding, (node) => node.props.testID === testID)!;
  (control.props.onPress as () => void)();
  refresh();
}
function settleImage(error = false) {
  const image = find(imageTree, (node) => node.type === 'Image');
  expect(image, 'a revisited image must get a fresh load or failure callback').toBeDefined();
  (image!.props[error ? 'onError' : 'onLoad'] as () => void)();
  refresh();
}
async function reveal() {
  await flush();
  await advance(firstRunMotion.splashHold + 20);
  await advance(firstRunMotion.loadingHold + 20);
  expect(startupPhase).toBe('complete');
}
function player(source = 'ar-intro') {
  return mock.players.get(source)!;
}
function changeAppState(state: string | null) {
  mock.appState = state;
  for (const listener of mock.appListeners) listener(state);
  refresh();
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('requestAnimationFrame', (callback: () => void) => setTimeout(callback, 1));
  vi.stubGlobal('cancelAnimationFrame', clearTimeout);
  mock.platform = 'android';
  mock.focused = true;
  mock.appState = 'active';
  mock.screenReader = false;
  mock.queryScreenReader = null;
  mock.locale = 'ar';
  mock.reducedMotion = false;
  mock.sharedValues.length = 0;
  mock.cancelAnimation.mockClear();
  mock.withTiming.mockClear();
  mock.players.clear();
  mock.appListeners.clear();
  mock.screenReaderListeners.clear();
  mock.contexts.clear();
  rootScope = scope();
  ambientScope = scope();
  providerScope = scope();
  onboardingScope = scope();
  imageScope = scope();
  imageKey = undefined;
});
afterEach(() => {
  for (const hooks of [rootScope, ambientScope, providerScope, onboardingScope, imageScope]) {
    dispose(hooks);
  }
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('onboarding presentation readiness', () => {
  it.each(['android', 'web'])(
    'keeps %s navigation in its supported container with progress before the actions',
    (platform) => {
      mock.platform = platform;
      refresh();
      const screen = find(onboarding, (node) => node.type === 'AccessScreen')!;
      const footerNavigation = find(
        screen.props.footer as ReactNode,
        (node) => node.props.testID === 'first-run-navigation',
      );
      const inlineNavigation = find(
        screen.props.children as ReactNode,
        (node) => node.props.testID === 'first-run-navigation',
      );
      const navigation = platform === 'android' ? footerNavigation : inlineNavigation;
      expect(navigation).toBeDefined();
      expect(platform === 'android' ? inlineNavigation : footerNavigation).toBeUndefined();
      const contentStyles = screen.props.contentStyle as (Record<string, unknown> | false)[];
      const contentStyle = Object.assign({}, ...contentStyles.filter(Boolean));
      expect(contentStyle).toEqual(
        expect.objectContaining(
          platform === 'android' ? { flex: 0, flexGrow: 1, flexShrink: 0 } : { flex: 1 },
        ),
      );
      expect((navigation!.props.children as Node[]).map((node) => node.props.testID)).toEqual([
        'first-run-progress',
        'first-run-navigation-actions',
      ]);
      expect(
        find(onboarding, (node) => node.props.testID === 'first-run-back-button'),
      ).toBeUndefined();

      press('first-run-next-button');
      expect(
        find(onboarding, (node) => node.props.testID === 'first-run-title-family'),
      ).toBeDefined();
      expect(
        find(onboarding, (node) => node.props.testID === 'first-run-progress')!.props
          .accessibilityValue,
      ).toEqual(expect.objectContaining({ now: 2, min: 1, max: 6 }));
      press('first-run-back-button');
      expect(
        find(onboarding, (node) => node.props.testID === 'first-run-title-intro'),
      ).toBeDefined();
      expect(
        find(onboarding, (node) => node.props.testID === 'first-run-progress')!.props
          .accessibilityValue,
      ).toEqual(expect.objectContaining({ now: 1 }));

      for (let step = 1; step < 6; step += 1) press('first-run-next-button');
      expect(
        find(onboarding, (node) => node.props.testID === 'first-run-title-growth'),
      ).toBeDefined();
      expect(
        find(onboarding, (node) => node.props.testID === 'first-run-next-button'),
      ).toBeUndefined();
      press('first-run-start-button');
      expect(mock.experience.state).toEqual(expect.objectContaining({ completed: true }));
    },
  );

  it('changes the story immediately and moves its image and copy together without a delayed start', () => {
    refresh();
    mock.withTiming.mockClear();
    press('first-run-next-button');
    expect(
      find(onboarding, (node) => node.props.testID === 'first-run-title-family'),
    ).toBeDefined();
    expect(find(imageTree, (node) => node.type === 'Image')!.props.transition).toBe(0);
    expect(mock.sharedValues).toHaveLength(2);
    expect(mock.withTiming).toHaveBeenCalledTimes(2);
    for (const shared of mock.sharedValues) {
      expect(shared.get()).toBe(0);
      expect(shared.animation).toEqual({
        kind: 'timing',
        target: 1,
        config: expect.objectContaining({
          duration: interactionMotion.timing.state,
          reduceMotion: 'never',
        }),
      });
    }
  });

  it('preserves the default image transition outside the onboarding-owned fade', () => {
    const standaloneScope = scope();
    try {
      const illustration = render(standaloneScope, () =>
        LocalIllustration({ assetId: 'onboarding-ghaf-intro' }),
      );
      expect(find(illustration, (node) => node.type === 'Image')!.props.transition).toBe(
        motion.duration.quick,
      );
    } finally {
      dispose(standaloneScope);
    }
  });

  it('retargets an interrupted step from each live value instead of flashing back to zero', () => {
    refresh();
    press('first-run-next-button');
    const [visual, copy] = mock.sharedValues;
    visual!.value = 0.45;
    copy!.value = 0.6;
    mock.cancelAnimation.mockClear();
    press('first-run-back-button');
    expect(find(onboarding, (node) => node.props.testID === 'first-run-title-intro')).toBeDefined();
    expect(visual!.get()).toBe(0.45);
    expect(copy!.get()).toBe(0.6);
    for (const shared of [visual, copy]) {
      expect(mock.cancelAnimation).toHaveBeenCalledWith(shared);
      expect(shared!.animation?.target).toBe(1);
    }
  });

  it('settles a running transition when motion is disabled and does not replay it on re-enable', () => {
    refresh();
    press('first-run-next-button');
    for (const shared of mock.sharedValues) shared.value = 0.4;
    mock.reducedMotion = true;
    refresh();
    for (const shared of mock.sharedValues) {
      expect(shared.get()).toBe(1);
      expect(shared.animation).toBeUndefined();
    }
    mock.withTiming.mockClear();
    mock.reducedMotion = false;
    refresh();
    expect(mock.withTiming).not.toHaveBeenCalled();
    for (const shared of mock.sharedValues) expect(shared.get()).toBe(1);
    press('first-run-next-button');
    expect(mock.withTiming).toHaveBeenCalledTimes(2);
  });

  it('shows a reduced-motion step immediately without starting an animation', () => {
    mock.reducedMotion = true;
    refresh();
    press('first-run-next-button');
    expect(mock.withTiming).not.toHaveBeenCalled();
    expect(
      find(onboarding, (node) => node.props.testID === 'first-run-title-family'),
    ).toBeDefined();
    expect(find(imageTree, (node) => node.type === 'Image')!.props.transition).toBe(0);
    for (const shared of mock.sharedValues) {
      expect(shared.get()).toBe(1);
      expect(shared.animation).toBeUndefined();
    }
  });

  it('does not add a motion delay before narrating a ready reduced-motion step', async () => {
    mock.reducedMotion = true;
    refresh();
    settleImage();
    await reveal();
    press('first-run-next-button');
    settleImage();
    await advance(0);
    expect(player('ar-family').play).toHaveBeenCalledOnce();
    expect(mock.withTiming).not.toHaveBeenCalled();
  });

  it('narrates only the latest ready slide after rapid navigation finishes settling', async () => {
    refresh();
    settleImage();
    await reveal();
    press('first-run-next-button');
    settleImage();
    await advance(interactionMotion.timing.state - 1);
    expect(player('ar-family').play).not.toHaveBeenCalled();
    press('first-run-next-button');
    settleImage();
    await advance(1);
    expect(player('ar-family').play).not.toHaveBeenCalled();
    expect(player('ar-sustainability').play).not.toHaveBeenCalled();
    await advance(interactionMotion.timing.state - 1);
    expect(player('ar-family').play).not.toHaveBeenCalled();
    expect(player('ar-sustainability').play).toHaveBeenCalledOnce();
  });

  it.each(['normal', 'reduced'])(
    'waits for the current intro visit to load and settle after immediate Next/Back with %s motion',
    async (motionPreference) => {
      mock.reducedMotion = motionPreference === 'reduced';
      refresh();
      settleImage();
      await reveal();
      const introPlays = player().play.mock.calls.length;
      expect(introPlays).toBe(1);

      press('first-run-next-button');
      press('first-run-back-button');
      await flush();
      expect(player().play).toHaveBeenCalledTimes(introPlays);
      expect(player('ar-family').play).not.toHaveBeenCalled();

      settleImage();
      await flush();
      expect(player().play).toHaveBeenCalledTimes(introPlays);
      if (mock.reducedMotion) await advance(0);
      else {
        await advance(interactionMotion.timing.state - 1);
        expect(player().play).toHaveBeenCalledTimes(introPlays);
        await advance(1);
      }
      expect(player().play).toHaveBeenCalledTimes(introPlays + 1);
      expect(player('ar-family').play).not.toHaveBeenCalled();
    },
  );

  it.each(['normal', 'reduced'])(
    'rejects a previous intro image callback while revisiting intro with %s motion',
    async (motionPreference) => {
      mock.reducedMotion = motionPreference === 'reduced';
      refresh();
      const previousIntroLoad = find(imageTree, (node) => node.type === 'Image')!.props
        .onLoad as () => void;
      settleImage();
      await reveal();
      const introPlays = player().play.mock.calls.length;
      expect(introPlays).toBe(1);

      press('first-run-next-button');
      press('first-run-back-button');
      previousIntroLoad();
      refresh();
      await advance(mock.reducedMotion ? 0 : interactionMotion.timing.state);
      expect(player().play).toHaveBeenCalledTimes(introPlays);

      settleImage();
      await flush();
      expect(player().play).toHaveBeenCalledTimes(introPlays + 1);
      expect(player('ar-family').play).not.toHaveBeenCalled();
    },
  );

  it('cancels pending narration settlement and animations on unmount', async () => {
    refresh();
    settleImage();
    await reveal();
    // RootLayout's post-paint image warmup still owns a mocked animation-frame timer.
    const unrelatedTimers = vi.getTimerCount();
    const scheduleTimeout = vi.spyOn(globalThis, 'setTimeout');
    const cancelTimeout = vi.spyOn(globalThis, 'clearTimeout');
    try {
      press('first-run-next-button');
      settleImage();
      expect(scheduleTimeout).toHaveBeenCalledTimes(1);
      expect(scheduleTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        interactionMotion.timing.state,
      );
      const narrationTimeout = scheduleTimeout.mock.results[0]!.value;
      expect(vi.getTimerCount()).toBe(unrelatedTimers + 1);
      mock.cancelAnimation.mockClear();
      cancelTimeout.mockClear();
      dispose(onboardingScope);
      expect(cancelTimeout).toHaveBeenCalledWith(narrationTimeout);
      expect(vi.getTimerCount()).toBe(unrelatedTimers);
      for (const shared of mock.sharedValues) {
        expect(mock.cancelAnimation).toHaveBeenCalledWith(shared);
        expect(shared.animation).toBeUndefined();
      }
      await vi.advanceTimersByTimeAsync(interactionMotion.timing.state);
      expect(player('ar-family').play).not.toHaveBeenCalled();
    } finally {
      scheduleTimeout.mockRestore();
      cancelTimeout.mockRestore();
    }
  });

  it('keeps settled-slide narration and ambience silent through both opaque startup stages', async () => {
    refresh();
    settleImage();
    await flush();
    await advance(motion.duration.standard + 50);
    expect(startupPhase).toBe('splash');
    expect(player().play).not.toHaveBeenCalled();
    expect(player('ambience').play).not.toHaveBeenCalled();
    press('first-run-narration-replay');
    await flush();
    expect(player().play).not.toHaveBeenCalled();
    await advance(firstRunMotion.splashHold);
    expect(startupPhase).toBe('loading');
    expect(player().play).not.toHaveBeenCalled();
    expect(player('ambience').play).not.toHaveBeenCalled();
    await advance(firstRunMotion.loadingHold + 20);
    expect(player().play).toHaveBeenCalledOnce();
    expect(player('ambience').playing).toBe(true);
  });

  it.each(['android', 'web'])(
    'pauses both players when %s loses foreground and suppresses replay',
    async (platform) => {
      mock.platform = platform;
      refresh();
      settleImage();
      await reveal();
      press('first-run-narration-replay');
      await flush();
      expect(player().playing).toBe(true);
      expect(player('ambience').playing).toBe(true);
      const plays = player().play.mock.calls.length;
      changeAppState('background');
      expect(player().playing).toBe(false);
      expect(player('ambience').playing).toBe(false);
      press('first-run-narration-replay');
      await flush();
      expect(player().play).toHaveBeenCalledTimes(plays);
      expect(player('ambience').playing).toBe(false);
      changeAppState('active');
      await flush();
      press('first-run-narration-replay');
      await flush();
      expect(player().playing).toBe(true);
    },
  );

  it('cancels a pending seek on blur even if the welcome route stays mounted', async () => {
    refresh();
    settleImage();
    await reveal();
    let finishSeek!: () => void;
    player().seekTo.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishSeek = resolve;
        }),
    );
    const plays = player().play.mock.calls.length;
    press('first-run-narration-replay');
    mock.focused = false;
    refresh();
    expect(player().playing).toBe(false);
    expect(player('ambience').playing).toBe(true);
    finishSeek();
    await flush();
    expect(player().play).toHaveBeenCalledTimes(plays);
    press('first-run-narration-replay');
    await flush();
    expect(player().play).toHaveBeenCalledTimes(plays);
  });

  it('cancels a pending seek before a backgrounded app returns to the foreground', async () => {
    refresh();
    settleImage();
    await reveal();
    let finishSeek!: () => void;
    player().seekTo.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishSeek = resolve;
        }),
    );
    press('first-run-narration-replay');
    changeAppState('inactive');
    changeAppState('active');
    await flush();
    const plays = player().play.mock.calls.length;
    finishSeek();
    await flush();
    expect(player().play).toHaveBeenCalledTimes(plays);
  });

  it('settles a failed illustration again after another slide, then permits replay', async () => {
    refresh();
    settleImage(true);
    await reveal();
    press('first-run-next-button');
    settleImage();
    await advance(motion.duration.standard + 50);
    expect(player('ar-family').playing).toBe(true);
    press('first-run-back-button');
    settleImage(true);
    await advance(motion.duration.standard + 50);
    expect(
      find(imageTree, (node) => node.props.testID === 'first-run-image-intro-fallback'),
    ).toBeDefined();
    const plays = player().play.mock.calls.length;
    press('first-run-narration-replay');
    await flush();
    expect(player().play).toHaveBeenCalledTimes(plays + 1);
    expect(player('ar-family').playing).toBe(false);
  });

  it('keeps screen-reader suppression and releases the foreground listener on unmount', async () => {
    mock.screenReader = true;
    refresh();
    settleImage();
    await reveal();
    press('first-run-narration-replay');
    await flush();
    expect(player().play).not.toHaveBeenCalled();
    expect(player('ambience').play).not.toHaveBeenCalled();
    expect(mock.appListeners.size).toBe(2);
    dispose(onboardingScope);
    expect(mock.appListeners.size).toBe(1);
    dispose(ambientScope);
    expect(mock.appListeners.size).toBe(0);
  });

  it('keeps both players silent when a stale accessibility query resolves after a change event', async () => {
    let resolveQuery!: (active: boolean) => void;
    const query = new Promise<boolean>((resolve) => {
      resolveQuery = resolve;
    });
    mock.queryScreenReader = () => query;
    refresh();
    settleImage();
    await reveal();
    expect(player().play).not.toHaveBeenCalled();
    expect(player('ambience').play).not.toHaveBeenCalled();

    for (const listener of mock.screenReaderListeners) listener(true);
    refresh();
    resolveQuery(false);
    await flush();
    press('first-run-narration-replay');
    await flush();
    expect(player().play).not.toHaveBeenCalled();
    expect(player('ambience').play).not.toHaveBeenCalled();
  });
});
