import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SuccessSheet, type SuccessSheetProps } from '@/components/access/SuccessSheet';
import { GhafLeafLoader } from '@/components/onboarding/GhafLeafLoader';
import { SectionTransitionOverlay } from '@/components/onboarding/SectionTransitionOverlay';
import type { SectionImageLoadResult } from '@/features/startup';

interface HookSlot {
  value?: unknown;
  dependencies?: readonly unknown[];
  cleanup?: () => void;
}

type Animation =
  { kind: 'timing'; target: number } | { kind: 'repeat'; animation: Animation; count: number };

interface SharedValue {
  current: number;
  pending?: Animation;
  get: () => number;
  set: (value: number | Animation) => void;
}

const mock = vi.hoisted(() => ({
  path: '/',
  reduced: false,
  cursor: 0,
  dirty: false,
  slots: [] as HookSlot[],
  effects: [] as (() => void)[],
  values: [] as SharedValue[],
  writes: [] as { from: number; value: number | Animation }[],
  stateWrites: vi.fn(),
  preload: vi.fn<(section: string) => Promise<SectionImageLoadResult>>(),
  cancel: vi.fn((value: SharedValue) => {
    value.pending = undefined;
  }),
  timing: vi.fn((target: number): Animation => ({ kind: 'timing', target })),
  repeat: vi.fn((animation: Animation, count: number): Animation => ({
    kind: 'repeat',
    animation,
    count,
  })),
  frames: new Map<number, FrameRequestCallback>(),
  nextFrame: 0,
  focus: vi.fn(),
}));

vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>();
  const slot = () => (mock.slots[mock.cursor++] ??= {});
  const effect = (run: () => void | (() => void), dependencies: readonly unknown[]) => {
    const current = slot();
    if (
      current.dependencies?.length === dependencies.length &&
      dependencies.every((value, index) => Object.is(value, current.dependencies?.[index]))
    )
      return;
    current.dependencies = dependencies;
    mock.effects.push(() => {
      current.cleanup?.();
      current.cleanup = run() || undefined;
    });
  };
  return {
    ...react,
    useState: (initial: unknown) => {
      const current = slot();
      if (!('value' in current)) current.value = initial;
      return [
        current.value,
        (next: unknown) => {
          mock.stateWrites(next);
          if (!Object.is(current.value, next)) mock.dirty = true;
          current.value = next;
        },
      ];
    },
    useRef: (initial: unknown) => {
      const current = slot();
      if (!('value' in current)) current.value = { current: initial };
      return current.value;
    },
    useEffect: effect,
    useLayoutEffect: effect,
  };
});
vi.mock('react-native', () => ({
  Platform: {
    OS: 'android',
    select: (values: Record<string, unknown>) => values.android ?? values.default,
  },
  StyleSheet: { create: (styles: unknown) => styles, absoluteFill: {} },
  View: 'View',
  ScrollView: 'ScrollView',
  Pressable: 'Pressable',
  AccessibilityInfo: { setAccessibilityFocus: mock.focus },
  findNodeHandle: () => 24,
}));
vi.mock('react-native-reanimated', async () => {
  const { useRef } = await import('react');
  return {
    default: { View: 'AnimatedView' },
    Easing: { cubic: 'cubic', linear: 'linear', out: (curve: unknown) => curve },
    ReduceMotion: { System: 'system', Never: 'never' },
    cancelAnimation: mock.cancel,
    withTiming: mock.timing,
    withRepeat: mock.repeat,
    interpolate: (value: number) => value,
    useAnimatedStyle: (factory: () => unknown) => factory(),
    useSharedValue: (initial: number) => {
      const ref = useRef<SharedValue | null>(null);
      if (!ref.current) {
        const value: SharedValue = {
          current: initial,
          get: () => value.current,
          set: (next) => {
            mock.writes.push({ from: value.current, value: next });
            if (typeof next === 'number') {
              value.current = next;
              value.pending = undefined;
            } else {
              value.pending = next;
            }
          },
        };
        mock.values.push(value);
        ref.current = value;
      }
      return ref.current;
    },
  };
});
vi.mock('expo-router', () => ({ usePathname: () => mock.path }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
vi.mock('@/utils/useReducedMotionPreference', () => ({
  useReducedMotionPreference: () => mock.reduced,
}));
vi.mock('@/features/startup', () => ({ preloadSectionImages: mock.preload }));
vi.mock('@/state/usePrototypeStore', () => ({
  usePrototypeStore: (selector: (state: unknown) => unknown) =>
    selector({ locale: 'ar', direction: 'rtl', activeExperience: 'signed_out' }),
}));
vi.mock('@/components/brand/GhafRasterLogo', () => ({ GhafRasterLogo: 'GhafRasterLogo' }));
vi.mock('@/components/illustrations', () => ({ LocalIllustration: 'LocalIllustration' }));
vi.mock('@/components/primitives', () => ({
  Text: 'Text',
  PrimaryButton: 'PrimaryButton',
  QuietButton: 'QuietButton',
}));
vi.mock('@/components/access/GhafIcon', () => ({ GhafIcon: 'GhafIcon' }));

interface HostProps {
  children?: ReactNode;
  onPress?: () => void;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityRole?: string;
}

type Node = ReactElement<HostProps>;
let tree: ReactNode;
let component: () => ReactNode;

function render() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    mock.cursor = 0;
    mock.dirty = false;
    tree = component();
    mock.effects.splice(0).forEach((effect) => effect());
    if (!mock.dirty) return tree;
  }
  throw new Error('Presentation did not settle');
}

function find(match: (node: Node) => boolean, node: ReactNode = tree): Node | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = find(match, child ?? null);
      if (found) return found;
    }
  }
  if (!isValidElement<HostProps>(node)) return undefined;
  return match(node) ? node : find(match, node.props.children ?? null);
}

function unmount() {
  mock.slots.forEach((slot) => {
    slot.cleanup?.();
    slot.cleanup = undefined;
  });
  tree = null;
}

function deferred() {
  let resolve!: (result: SectionImageLoadResult) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<SectionImageLoadResult>((accept, fail) => {
    resolve = accept;
    reject = fail;
  });
  return { promise, resolve, reject };
}

const loaded: SectionImageLoadResult = { total: 1, failed: 0 };

beforeEach(() => {
  mock.path = '/';
  mock.reduced = false;
  mock.cursor = 0;
  mock.dirty = false;
  mock.slots = [];
  mock.effects = [];
  mock.values = [];
  mock.writes = [];
  mock.frames.clear();
  mock.nextFrame = 0;
  mock.preload.mockReset().mockResolvedValue(loaded);
  tree = null;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    const frame = ++mock.nextFrame;
    mock.frames.set(frame, callback);
    return frame;
  });
  vi.stubGlobal('cancelAnimationFrame', (frame: number) => mock.frames.delete(frame));
});

afterEach(() => {
  unmount();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

// This explicit hook/native-boundary harness checks ownership, lifecycle and callbacks only.
// It does not render native focus, frame timing, animation physics or nested child components.
describe('section image handoff presentation', () => {
  it('clears the loading surface on Back and ignores the abandoned preload result', async () => {
    const preload = deferred();
    mock.preload.mockReturnValue(preload.promise);
    component = SectionTransitionOverlay;
    expect(render()).toBeNull();
    mock.path = '/access/parent/sign-in';
    render();
    expect(find((node) => node.props.testID === 'section-transition-overlay')).toBeDefined();
    expect(mock.preload).toHaveBeenCalledExactlyOnceWith('parent-access');
    mock.path = '/';
    expect(render()).toBeNull();
    mock.stateWrites.mockClear();
    preload.resolve(loaded);
    await preload.promise;
    expect(mock.stateWrites).not.toHaveBeenCalled();
    expect(render()).toBeNull();
  });

  it('does not let an older load hide a newer experience handoff', async () => {
    const access = deferred();
    const experience = deferred();
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mock.preload.mockReturnValueOnce(access.promise).mockReturnValueOnce(experience.promise);
    component = SectionTransitionOverlay;
    render();
    mock.path = '/access/parent/sign-in';
    render();
    mock.path = '/parent';
    render();
    access.resolve({ ...loaded, failed: 1 });
    await access.promise;
    render();
    expect(find((node) => node.props.testID === 'section-transition-overlay')?.props).toMatchObject(
      {
        accessibilityLabel: 'firstRun.loading.parentExperience. firstRun.loading.opening',
      },
    );
    expect(warning).not.toHaveBeenCalled();
    experience.resolve(loaded);
    await experience.promise;
    expect(render()).toBeNull();
  });

  it('finishes a cached image handoff without requiring a decorative timer', async () => {
    vi.useFakeTimers();
    component = SectionTransitionOverlay;
    render();
    mock.path = '/access/child/profile';
    render();
    expect(tree).not.toBeNull();
    await Promise.resolve();
    expect(render()).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('dismisses the surface on preload rejection so local fallback content stays reachable', async () => {
    const preload = deferred();
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mock.preload.mockReturnValue(preload.promise);
    component = SectionTransitionOverlay;
    render();
    mock.path = '/access/parent/sign-in';
    render();
    preload.reject(new Error('Image preload unavailable'));
    await Promise.resolve();
    expect(render()).toBeNull();
    expect(warning).toHaveBeenCalledExactlyOnceWith(
      'Ghaf parent-access images could not be preloaded; using local fallbacks.',
    );
  });

  it('settles visible opacity immediately when the live motion preference changes', () => {
    mock.preload.mockReturnValue(deferred().promise);
    component = SectionTransitionOverlay;
    render();
    mock.path = '/access/parent/sign-in';
    render();
    expect(mock.values[0]?.pending).toMatchObject({ kind: 'timing', target: 1 });
    mock.reduced = true;
    render();
    expect(mock.values[0]?.current).toBe(1);
    expect(mock.values[0]?.pending).toBeUndefined();
    expect(tree).not.toBeNull();
  });

  it('cancels presentation and ignores late results after unmount', async () => {
    const preload = deferred();
    mock.preload.mockReturnValue(preload.promise);
    component = SectionTransitionOverlay;
    render();
    mock.path = '/access/parent/sign-in';
    render();
    unmount();
    expect(mock.values[0]?.pending).toBeUndefined();
    expect(mock.cancel).toHaveBeenCalledWith(mock.values[0]);
    mock.stateWrites.mockClear();
    preload.resolve(loaded);
    await preload.promise;
    expect(mock.stateWrites).not.toHaveBeenCalled();
  });
});

describe('success sheet presentation lifecycle', () => {
  let props: SuccessSheetProps;

  beforeEach(() => {
    props = {
      actionLabel: 'Continue',
      direction: 'rtl',
      language: 'ar',
      message: 'Task saved',
      onAction: vi.fn(),
      onDismiss: vi.fn(),
      dismissLabel: 'Close',
      title: 'Saved',
      visible: true,
    };
    component = () => SuccessSheet(props);
  });

  it('settles an interrupted entrance without resetting or replaying it on preference changes', () => {
    render();
    const progress = mock.values[0]!;
    progress.current = 0.4;
    mock.writes = [];
    mock.reduced = true;
    render();
    expect(progress.current).toBe(1);
    expect(progress.pending).toBeUndefined();
    expect(mock.writes).toEqual([{ from: 0.4, value: 1 }]);
    mock.reduced = false;
    render();
    expect(mock.writes.at(-1)).toMatchObject({
      from: 1,
      value: { kind: 'timing', target: 1 },
    });
    expect(mock.writes.some(({ value }) => value === 0)).toBe(false);
    mock.timing.mockClear();
    render();
    expect(mock.timing).not.toHaveBeenCalled();
  });

  it('keeps action and accessible dismissal immediately available during entrance motion', () => {
    render();
    expect(mock.values[0]?.pending).toBeDefined();
    const action = find((node) => node.type === 'PrimaryButton');
    expect(action?.props.onPress).toBe(props.onAction);
    action?.props.onPress?.();
    expect(props.onAction).toHaveBeenCalledOnce();
    expect(props.onDismiss).not.toHaveBeenCalled();
    const dismissal = find((node) => node.type === 'Pressable');
    expect(dismissal?.props).toMatchObject({
      accessibilityLabel: 'Close',
      accessibilityRole: 'button',
    });
    dismissal?.props.onPress?.();
    expect(props.onDismiss).toHaveBeenCalledOnce();
    expect(mock.values[0]?.pending).toBeUndefined();
  });

  it('cancels active motion and pending focus work when hidden or unmounted', () => {
    render();
    expect(mock.frames.size).toBe(1);
    props.visible = false;
    expect(render()).toBeNull();
    expect(mock.values[0]?.current).toBe(0);
    expect(mock.values[0]?.pending).toBeUndefined();
    expect(mock.frames.size).toBe(0);
    props.visible = true;
    render();
    expect(mock.frames.size).toBe(1);
    expect(mock.values[0]?.pending).toBeDefined();
    unmount();
    expect(mock.frames.size).toBe(0);
    expect(mock.values[0]?.pending).toBeUndefined();
    expect(mock.focus).not.toHaveBeenCalled();
    expect(props.onAction).not.toHaveBeenCalled();
    expect(props.onDismiss).not.toHaveBeenCalled();
  });
});

describe('leaf loading indicator lifecycle', () => {
  beforeEach(() => {
    component = () => GhafLeafLoader({ accessibilityLabel: 'Loading', testID: 'loader' });
  });

  it('stops and resets a running loop under reduced motion, then starts only one replacement', () => {
    render();
    const rotation = mock.values[0]!;
    expect(rotation.pending).toMatchObject({ kind: 'repeat', count: -1 });
    rotation.current = 145;
    mock.reduced = true;
    render();
    expect(rotation.current).toBe(0);
    expect(rotation.pending).toBeUndefined();
    expect(find((node) => node.props.testID === 'loader')?.props).toMatchObject({
      accessibilityLabel: 'Loading',
      accessibilityRole: 'progressbar',
    });
    mock.reduced = false;
    render();
    expect(mock.repeat).toHaveBeenCalledTimes(2);
    expect(rotation.pending).toMatchObject({ kind: 'repeat', count: -1 });
    render();
    expect(mock.repeat).toHaveBeenCalledTimes(2);
    unmount();
    expect(rotation.pending).toBeUndefined();
    expect(mock.cancel).toHaveBeenCalledWith(rotation);
  });

  it('starts static when motion is disabled while retaining the text alternative', () => {
    mock.reduced = true;
    render();
    expect(mock.repeat).not.toHaveBeenCalled();
    expect(mock.timing).not.toHaveBeenCalled();
    expect(mock.values[0]?.current).toBe(0);
    expect(find((node) => node.props.testID === 'loader')?.props.accessibilityLabel).toBe(
      'Loading',
    );
  });
});
