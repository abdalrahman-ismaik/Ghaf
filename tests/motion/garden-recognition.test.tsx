import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  LandscapeTrack,
  type LandscapeTrackProps,
} from '@/components/family-growth/GardenLandscape';
import { motion } from '@/design/tokens';

interface HookSlot {
  value?: unknown;
  dependencies?: readonly unknown[];
  cleanup?: () => void;
}

type Animation =
  | { kind: 'timing'; target: number; config: Record<string, unknown>; reduced: boolean }
  | {
      kind: 'delay';
      duration: number;
      animation: Animation;
      reduceMotion?: string;
      reduced: boolean;
    };

interface SharedValue {
  current: number;
  pending?: Animation;
  get: () => number;
  set: (value: number | Animation) => void;
}

const mock = vi.hoisted(() => ({
  reduced: false,
  systemReduced: false,
  cursor: 0,
  slots: [] as HookSlot[],
  effects: [] as (() => void)[],
  values: [] as SharedValue[],
  writes: [] as { from: number; value: number | Animation }[],
  announce: vi.fn(),
  cancel: vi.fn((value: SharedValue) => {
    value.pending = undefined;
  }),
  timing: vi.fn((target: number, config: Record<string, unknown>): Animation => ({
    kind: 'timing',
    target,
    config,
    reduced: config.reduceMotion !== 'never' && mock.systemReduced,
  })),
  delay: vi.fn((duration: number, animation: Animation, reduceMotion?: string): Animation => ({
    kind: 'delay',
    duration,
    animation,
    reduceMotion,
    reduced: reduceMotion !== 'never' && mock.systemReduced,
  })),
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
  StyleSheet: { create: (styles: unknown) => styles },
  View: 'View',
  AccessibilityInfo: { announceForAccessibility: mock.announce },
}));
vi.mock('react-native-reanimated', async () => {
  const { useRef } = await import('react');
  return {
    default: { View: 'AnimatedView' },
    Easing: { bezier: (...points: number[]) => points },
    ReduceMotion: { System: 'system', Never: 'never' },
    cancelAnimation: mock.cancel,
    withTiming: mock.timing,
    withDelay: mock.delay,
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
            } else if (next.reduced) {
              let terminal = next;
              while (terminal.kind === 'delay') terminal = terminal.animation;
              value.current = terminal.target;
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
vi.mock('@/utils/useReducedMotionPreference', () => ({
  useReducedMotionPreference: () => mock.reduced,
}));
vi.mock('@/state/usePrototypeStore', () => ({
  usePrototypeStore: (selector: (state: unknown) => unknown) =>
    selector({ locale: 'ar', direction: 'rtl' }),
}));
vi.mock('@/components/access', () => ({ GhafIcon: 'GhafIcon' }));
vi.mock('@/components/illustrations', () => ({
  LocalIllustration: 'LocalIllustration',
  landscapeArtworkIds: { mangrove: { sapling: 'mangrove-sapling' } },
}));
vi.mock('@/components/primitives', () => ({ Text: 'Text' }));

interface HostProps {
  children?: ReactNode;
  pointerEvents?: string;
  testID?: string;
}

type Node = ReactElement<HostProps>;
let props: LandscapeTrackProps;
let tree: ReactNode;

function render() {
  mock.cursor = 0;
  tree = LandscapeTrack(props);
  mock.effects.splice(0).forEach((effect) => effect());
  return tree;
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

function setReveal(play: boolean, sequenceKey: string | number = 'recognition-1') {
  props = {
    ...props,
    recognitionReveal: {
      play,
      sequenceKey,
      accessibilityAnnouncement: `Confirmed ${sequenceKey}`,
    },
  };
}

function expectSettled() {
  expect(mock.values.map((value) => value.current)).toEqual([1, 1]);
  expect(mock.values.every((value) => value.pending === undefined)).toBe(true);
}

beforeEach(() => {
  mock.reduced = false;
  mock.systemReduced = false;
  mock.cursor = 0;
  mock.slots = [];
  mock.effects = [];
  mock.values = [];
  mock.writes = [];
  props = {
    activeLabel: 'Active track',
    id: 'mangrove',
    content: {
      accessibilityLabel: 'Mangrove sapling',
      categoryLabel: 'Green Impact',
      cumulativeSeeds: 120,
      name: 'Mangrove',
      progressLabel: '120 of 180 Seeds',
      stage: 'sapling',
      stageLabel: 'Sapling',
      targetSeeds: 180,
    },
  };
  setReveal(true);
  tree = null;
});

afterEach(unmount);

// This hook/native-boundary harness executes lifecycle and cancellation ownership only.
// It does not establish native animation quality, frame timing, TalkBack or app-state delivery.
describe('Garden recognition presentation lifecycle', () => {
  it('starts the finite sequence once while artwork, labels and announcement remain available', () => {
    render();
    expect(mock.values[0]?.pending).toMatchObject({
      kind: 'timing',
      target: 1,
      config: {
        duration: motion.duration.standard + motion.duration.quick,
        reduceMotion: 'never',
      },
    });
    expect(mock.values[1]?.pending).toMatchObject({
      kind: 'delay',
      duration: motion.duration.standard,
      reduceMotion: 'never',
      animation: {
        kind: 'timing',
        target: 1,
        config: {
          duration: motion.duration.growth - motion.duration.standard,
          reduceMotion: 'never',
        },
      },
    });
    expect(find((node) => node.props.testID === 'active-landscape-artwork')).toBeDefined();
    expect(find((node) => node.props.children === props.content.progressLabel)).toBeDefined();
    expect(find((node) => node.props.pointerEvents === 'none')).toBeDefined();
    expect(mock.announce).toHaveBeenCalledExactlyOnceWith('Confirmed recognition-1');
    render();
    expect(mock.timing).toHaveBeenCalledTimes(2);
    expect(mock.delay).toHaveBeenCalledOnce();
  });

  it('settles both interrupted cues when live motion stops and never replays on resume', () => {
    render();
    mock.values[0]!.current = 0.6;
    mock.values[1]!.current = 0.2;
    mock.writes = [];
    mock.reduced = true;
    render();
    expectSettled();
    expect(mock.cancel).toHaveBeenCalledWith(mock.values[0]);
    expect(mock.cancel).toHaveBeenCalledWith(mock.values[1]);
    expect(mock.writes).toEqual([
      { from: 0.6, value: 1 },
      { from: 0.2, value: 1 },
    ]);
    mock.reduced = false;
    render();
    expectSettled();
    expect(mock.timing).toHaveBeenCalledTimes(2);
    expect(mock.writes.some(({ value }) => value === 0)).toBe(false);
    expect(mock.announce).toHaveBeenCalledOnce();
  });

  it('keeps an initially static presentation settled when the initial preference resolves', () => {
    mock.reduced = true;
    render();
    expectSettled();
    expect(mock.timing).not.toHaveBeenCalled();
    expect(mock.announce).toHaveBeenCalledOnce();
    mock.reduced = false;
    render();
    expectSettled();
    expect(mock.timing).not.toHaveBeenCalled();
    expect(mock.writes.some(({ value }) => value === 0)).toBe(false);
  });

  it('uses the live preference for fresh motion even when the startup system snapshot stays reduced', () => {
    mock.systemReduced = true;
    mock.reduced = true;
    render();
    expectSettled();
    expect(mock.timing).not.toHaveBeenCalled();
    mock.reduced = false;
    render();
    expectSettled();
    expect(mock.timing).not.toHaveBeenCalled();
    setReveal(true, 'recognition-2');
    render();
    expect(mock.systemReduced).toBe(true);
    expect(mock.timing).toHaveBeenCalledTimes(2);
    expect(mock.timing.mock.calls.every(([, config]) => config.reduceMotion === 'never')).toBe(
      true,
    );
    expect(mock.delay).toHaveBeenCalledExactlyOnceWith(
      motion.duration.standard,
      expect.objectContaining({ kind: 'timing', reduced: false }),
      'never',
    );
    expect(mock.values.map((value) => value.current)).toEqual([0, 0]);
    expect(mock.values.every((value) => value.pending?.reduced === false)).toBe(true);
    mock.reduced = true;
    render();
    expectSettled();
  });

  it('does not consume an unplayed sequence but cannot restart it after interruption', () => {
    setReveal(false);
    render();
    expect(mock.timing).not.toHaveBeenCalled();
    expect(mock.announce).not.toHaveBeenCalled();
    expect(find((node) => node.props.pointerEvents === 'none')).toBeUndefined();
    setReveal(true);
    render();
    expect(mock.timing).toHaveBeenCalledTimes(2);
    mock.values[0]!.current = 0.3;
    mock.values[1]!.current = 0.1;
    mock.writes = [];
    setReveal(false);
    render();
    expectSettled();
    expect(find((node) => node.props.pointerEvents === 'none')).toBeUndefined();
    setReveal(true);
    render();
    expectSettled();
    expect(mock.timing).toHaveBeenCalledTimes(2);
    expect(mock.writes.some(({ value }) => value === 0)).toBe(false);
    expect(mock.announce).toHaveBeenCalledOnce();
  });

  it('allows a fresh permitted sequence without replaying an older presented sequence', () => {
    render();
    mock.reduced = true;
    render();
    mock.reduced = false;
    render();
    setReveal(true, 'recognition-2');
    render();
    expect(mock.timing).toHaveBeenCalledTimes(4);
    expect(mock.values.every((value) => value.pending !== undefined)).toBe(true);
    expect(mock.announce).toHaveBeenLastCalledWith('Confirmed recognition-2');
    setReveal(true);
    render();
    expectSettled();
    expect(mock.timing).toHaveBeenCalledTimes(4);
    expect(mock.announce).toHaveBeenCalledTimes(2);
  });

  it('consumes a new static sequence too, while the next permitted sequence can animate', () => {
    render();
    mock.reduced = true;
    setReveal(true, 'recognition-2');
    render();
    expectSettled();
    expect(mock.timing).toHaveBeenCalledTimes(2);
    mock.reduced = false;
    render();
    expectSettled();
    expect(mock.timing).toHaveBeenCalledTimes(2);
    setReveal(true, 'recognition-3');
    render();
    expect(mock.timing).toHaveBeenCalledTimes(4);
    expect(mock.announce).toHaveBeenCalledTimes(3);
  });

  it('announces late available copy once without restarting or waiting for the animation', () => {
    props = { ...props, recognitionReveal: { play: true, sequenceKey: 0 } };
    render();
    expect(mock.announce).not.toHaveBeenCalled();
    setReveal(true, 0);
    render();
    expect(mock.announce).toHaveBeenCalledExactlyOnceWith('Confirmed 0');
    props = {
      ...props,
      recognitionReveal: { play: true, sequenceKey: 0, accessibilityAnnouncement: 'Updated copy' },
    };
    render();
    expect(mock.announce).toHaveBeenCalledOnce();
    expect(mock.timing).toHaveBeenCalledTimes(2);
  });

  it('cancels pending travel and delayed detail when navigating away mid-sequence', () => {
    render();
    mock.values[0]!.current = 0.4;
    expect(mock.values[1]?.pending).toMatchObject({ kind: 'delay' });
    unmount();
    expect(mock.values.every((value) => value.pending === undefined)).toBe(true);
    expect(mock.cancel).toHaveBeenCalledWith(mock.values[0]);
    expect(mock.cancel).toHaveBeenCalledWith(mock.values[1]);
    expect(mock.announce).toHaveBeenCalledOnce();
    expect(tree).toBeNull();
  });
});
