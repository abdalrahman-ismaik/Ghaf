import type { ForwardedRef, ReactElement } from 'react';
import type { GestureResponderEvent, PressableProps, View } from 'react-native';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  BotanicalPressable,
  type BotanicalPressableProps,
} from '@/components/botanical/BotanicalPressable';
import { interactionMotion } from '@/design/motion';

interface HookSlot {
  value?: unknown;
  dependencies?: readonly unknown[];
  cleanup?: () => void;
}

interface AnimationRequest {
  kind: 'timing' | 'spring';
  target: number;
  config: Record<string, unknown>;
}

interface SharedScale {
  current: number;
  pending?: AnimationRequest;
  get: () => number;
  set: (value: number | AnimationRequest) => void;
}

const mock = vi.hoisted(() => ({
  cursor: 0,
  dirty: false,
  reduced: false,
  slots: [] as HookSlot[],
  effects: [] as (() => void)[],
  scales: [] as SharedScale[],
  writes: [] as { from: number; value: number | AnimationRequest }[],
  cancel: vi.fn((scale: SharedScale) => {
    scale.pending = undefined;
  }),
  timing: vi.fn((target: number, config: Record<string, unknown>): AnimationRequest => ({
    kind: 'timing',
    target,
    config,
  })),
  spring: vi.fn((target: number, config: Record<string, unknown>): AnimationRequest => ({
    kind: 'spring',
    target,
    config,
  })),
}));

vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>();
  const slot = () => (mock.slots[mock.cursor++] ??= {});
  return {
    ...react,
    useState: (initial: unknown) => {
      const current = slot();
      if (!('value' in current)) current.value = initial;
      return [
        current.value,
        (next: unknown) => {
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
    useEffect: (effect: () => void | (() => void), dependencies: readonly unknown[]) => {
      const current = slot();
      if (
        current.dependencies?.length === dependencies.length &&
        dependencies.every((value, index) => Object.is(value, current.dependencies?.[index]))
      )
        return;
      current.dependencies = dependencies;
      mock.effects.push(() => {
        current.cleanup?.();
        current.cleanup = effect() || undefined;
      });
    },
  };
});
vi.mock('react-native', () => ({
  Pressable: 'Pressable',
  Platform: { OS: 'android', select: (values: Record<string, unknown>) => values.android },
}));
vi.mock('@/utils/useReducedMotionPreference', () => ({
  useReducedMotionPreference: () => mock.reduced,
}));
vi.mock('react-native-reanimated', async () => {
  const { useRef } = await import('react');
  return {
    default: { createAnimatedComponent: (component: unknown) => component },
    Easing: { cubic: 'cubic', out: (curve: unknown) => curve, bezier: () => undefined },
    ReduceMotion: { System: 'system', Never: 'never' },
    cancelAnimation: mock.cancel,
    withTiming: mock.timing,
    withSpring: mock.spring,
    useAnimatedStyle: (factory: () => unknown) => factory(),
    useSharedValue: (initial: number) => {
      const ref = useRef<SharedScale | null>(null);
      if (!ref.current) {
        const scale: SharedScale = {
          current: initial,
          get: () => scale.current,
          set: (value) => {
            mock.writes.push({ from: scale.current, value });
            if (typeof value === 'number') {
              scale.current = value;
              scale.pending = undefined;
            } else {
              scale.pending = value;
            }
          },
        };
        mock.scales.push(scale);
        ref.current = scale;
      }
      return ref.current;
    },
  };
});

type HostProps = PressableProps & { ref?: ForwardedRef<View> };
const renderComponent = (
  BotanicalPressable as unknown as {
    render: (props: PressableProps, ref: ForwardedRef<View>) => ReactElement<HostProps>;
  }
).render;
const event = { nativeEvent: { pageX: 12, pageY: 20 } } as GestureResponderEvent;
const hoverEvent = { nativeEvent: { pageX: 12, pageY: 20 } } as Parameters<
  NonNullable<PressableProps['onHoverIn']>
>[0];
let input: BotanicalPressableProps;
let host: HostProps;
let ref: ForwardedRef<View>;

function render(update: Partial<BotanicalPressableProps> = {}) {
  input = { ...input, ...update };
  for (let attempt = 0; attempt < 8; attempt += 1) {
    mock.cursor = 0;
    mock.dirty = false;
    host = renderComponent(input, ref).props;
    mock.effects.splice(0).forEach((effect) => effect());
    if (!mock.dirty) return host;
  }
  throw new Error('Pressable did not settle');
}

function flatStyle(value: unknown): Record<string, unknown> {
  if (Array.isArray(value)) return Object.assign({}, ...value.map(flatStyle));
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function unmount() {
  mock.slots.forEach((slot) => {
    slot.cleanup?.();
    slot.cleanup = undefined;
  });
}

beforeEach(() => {
  mock.cursor = 0;
  mock.dirty = false;
  mock.reduced = false;
  mock.slots = [];
  mock.effects = [];
  mock.scales = [];
  mock.writes = [];
  input = {};
  ref = { current: null };
});

afterEach(unmount);

// The native host and hook harness expose callback/cleanup behavior without claiming rendered physics.
describe('BotanicalPressable interaction behavior', () => {
  it('honors a surface static request without allowing false to override the system', () => {
    render({ reducedMotion: true });
    host.onPressIn?.(event);
    render();
    expect(flatStyle(host.style)).toMatchObject({
      transform: [{ scale: 1 }],
      opacity: interactionMotion.reduced.pressedOpacity,
    });
    expect(host).not.toHaveProperty('reducedMotion');
    expect(mock.timing).not.toHaveBeenCalled();
    mock.reduced = true;
    render({ reducedMotion: false });
    host.onPressIn?.(event);
    render();
    expect(mock.timing).not.toHaveBeenCalled();
    expect(flatStyle(host.style).transform).toEqual([{ scale: 1 }]);
  });

  it('cancels a settling press when its surface requests static feedback', () => {
    render();
    host.onPressIn?.(event);
    host.onPressOut?.(event);
    mock.scales[0]!.current = 0.992;
    render({ reducedMotion: true });
    expect(mock.scales[0]!.pending).toBeUndefined();
    expect(mock.scales[0]!.current).toBe(1);
    render({ reducedMotion: false });
    expect(mock.scales[0]!.pending).toBeUndefined();
  });

  it('preserves native callbacks, child rendering, accessible state, touch area and forwarded ref', () => {
    const onPress = vi.fn();
    const onLongPress = vi.fn();
    const children = vi.fn(() => 'Continue');
    const accessibilityState = { busy: true, selected: false };
    const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 };
    render({
      onPress,
      onLongPress,
      children,
      accessibilityRole: 'button',
      accessibilityLabel: 'Continue',
      accessibilityState,
      hitSlop,
      testID: 'continue',
    });
    expect(host).toMatchObject({
      onPress,
      onLongPress,
      children,
      accessibilityRole: 'button',
      accessibilityLabel: 'Continue',
      accessibilityState,
      hitSlop,
      testID: 'continue',
      ref,
    });
    expect(children).not.toHaveBeenCalled();
    host.onPress?.(event);
    expect(onPress).toHaveBeenCalledExactlyOnceWith(event);
    expect(mock.timing).not.toHaveBeenCalled();
    expect(mock.spring).not.toHaveBeenCalled();
  });

  it('provides press feedback immediately while leaving action timing to native Pressable', () => {
    const onPress = vi.fn();
    const onPressIn = vi.fn();
    const onPressOut = vi.fn();
    const style = vi.fn(({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.9 : 1 }));
    render({ onPress, onPressIn, onPressOut, style });
    host.onPressIn?.(event);
    expect(mock.scales[0]?.pending).toMatchObject({
      kind: 'timing',
      target: interactionMotion.displacement.pressScale,
    });
    expect(onPressIn).toHaveBeenCalledExactlyOnceWith(event);
    expect(onPress).not.toHaveBeenCalled();
    render();
    expect(style).toHaveBeenLastCalledWith({ pressed: true, hovered: false });
    host.onPress?.(event);
    expect(onPress).toHaveBeenCalledExactlyOnceWith(event);
    host.onPressOut?.(event);
    expect(mock.scales[0]?.pending).toMatchObject({ kind: 'spring', target: 1 });
    expect(onPressOut).toHaveBeenCalledExactlyOnceWith(event);
    render();
    expect(style).toHaveBeenLastCalledWith({ pressed: false, hovered: false });
  });

  it('retargets interrupted feedback from the live scale without synthetic or duplicate actions', () => {
    const onPress = vi.fn();
    render({ onPress });
    const scale = mock.scales[0]!;
    host.onPressIn?.(event);
    scale.current = 0.993;
    host.onPressOut?.(event);
    expect(mock.writes.at(-1)).toMatchObject({
      from: 0.993,
      value: { kind: 'spring', target: 1 },
    });
    scale.current = 0.996;
    host.onPressIn?.(event);
    expect(mock.writes.at(-1)).toMatchObject({
      from: 0.996,
      value: { kind: 'timing', target: interactionMotion.displacement.pressScale },
    });
    host.onPressOut?.(event);
    expect(onPress).not.toHaveBeenCalled();
    expect(mock.writes.every(({ value }) => typeof value !== 'number')).toBe(true);
    for (let count = 0; count < 3; count += 1) {
      host.onPressIn?.(event);
      host.onPress?.(event);
      host.onPressOut?.(event);
    }
    expect(onPress).toHaveBeenCalledTimes(3);
  });

  it('uses immediate static opacity feedback under reduced motion without scale animation', () => {
    mock.reduced = true;
    const onPress = vi.fn();
    render({ onPress });
    host.onPressIn?.(event);
    render();
    expect(flatStyle(host.style)).toMatchObject({
      transform: [{ scale: 1 }],
      opacity: interactionMotion.reduced.pressedOpacity,
    });
    host.onPress?.(event);
    host.onPressOut?.(event);
    render();
    expect(flatStyle(host.style)).not.toHaveProperty('opacity');
    expect(mock.timing).not.toHaveBeenCalled();
    expect(mock.spring).not.toHaveBeenCalled();
    expect(onPress).toHaveBeenCalledExactlyOnceWith(event);
  });

  it.each(['disabled', 'reduced'] as const)(
    'cancels an active press and clears stale visual state when %s changes',
    (condition) => {
      const onPress = vi.fn();
      const style = vi.fn(() => ({}));
      render({ onPress, style });
      host.onPressIn?.(event);
      host.onHoverIn?.(hoverEvent);
      mock.scales[0]!.current = 0.99;
      if (condition === 'reduced') mock.reduced = true;
      render(condition === 'disabled' ? { disabled: true } : {});
      expect(mock.cancel).toHaveBeenCalledWith(mock.scales[0]);
      expect(mock.scales[0]?.current).toBe(1);
      expect(mock.scales[0]?.pending).toBeUndefined();
      expect(style).toHaveBeenLastCalledWith({ pressed: false, hovered: false });
      expect(onPress).not.toHaveBeenCalled();
      host.onPressOut?.(event);
      expect(mock.spring).not.toHaveBeenCalled();
    },
  );

  it('preserves disabled native semantics without producing animated feedback', () => {
    render({ disabled: true, accessibilityState: { disabled: true } });
    expect(host.disabled).toBe(true);
    expect(host.accessibilityState).toEqual({ disabled: true });
    host.onPressIn?.(event);
    host.onPressOut?.(event);
    expect(mock.scales[0]?.current).toBe(1);
    expect(mock.timing).not.toHaveBeenCalled();
    expect(mock.spring).not.toHaveBeenCalled();
  });

  it.each([false, true])(
    'lets a caller-owned ripple supply feedback (reduced motion: %s)',
    (reduced) => {
      mock.reduced = reduced;
      const android_ripple = { color: '#123456', borderless: false };
      render({ android_ripple });
      host.onPressIn?.(event);
      render();
      expect(host.android_ripple).toBe(android_ripple);
      expect(flatStyle(host.style)).not.toHaveProperty('opacity');
      expect(flatStyle(host.style)).toMatchObject({ transform: [{ scale: 1 }] });
      host.onPressOut?.(event);
      expect(mock.timing).not.toHaveBeenCalled();
      expect(mock.spring).not.toHaveBeenCalled();
    },
  );

  it('preserves hover callbacks and style state without scheduling press motion', () => {
    const onHoverIn = vi.fn();
    const onHoverOut = vi.fn();
    const style = vi.fn(() => ({ marginTop: 4 }));
    render({ onHoverIn, onHoverOut, style });
    host.onHoverIn?.(hoverEvent);
    render();
    expect(onHoverIn).toHaveBeenCalledExactlyOnceWith(hoverEvent);
    expect(style).toHaveBeenLastCalledWith({ pressed: false, hovered: true });
    expect(flatStyle(host.style)).toHaveProperty('marginTop', 4);
    host.onHoverOut?.(hoverEvent);
    render();
    expect(onHoverOut).toHaveBeenCalledExactlyOnceWith(hoverEvent);
    expect(style).toHaveBeenLastCalledWith({ pressed: false, hovered: false });
    expect(mock.timing).not.toHaveBeenCalled();
  });

  it('cancels an outstanding animation on unmount without dispatching any action', () => {
    const onPress = vi.fn();
    const onPressOut = vi.fn();
    render({ onPress, onPressOut });
    host.onPressIn?.(event);
    expect(mock.scales[0]?.pending).toBeDefined();
    unmount();
    expect(mock.cancel).toHaveBeenCalledWith(mock.scales[0]);
    expect(mock.scales[0]?.pending).toBeUndefined();
    expect(onPress).not.toHaveBeenCalled();
    expect(onPressOut).not.toHaveBeenCalled();
  });
});
