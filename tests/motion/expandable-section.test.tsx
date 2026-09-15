import { createElement, isValidElement, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ExpandableSection,
  type ExpandableSectionProps,
} from '@/components/botanical/ExpandableSection';
import { interactionMotion } from '@/design/motion';

interface HookSlot {
  value?: unknown;
  dependencies?: readonly unknown[];
  cleanup?: () => void;
}

interface AnimationRequest {
  kind: 'timing';
  target: number;
  config: Record<string, unknown>;
}

interface SharedProgress {
  current: number | AnimationRequest;
  get: () => number | AnimationRequest;
  set: (value: number | AnimationRequest) => void;
}

const mock = vi.hoisted(() => ({
  cursor: 0,
  dirty: false,
  reduced: false,
  slots: [] as HookSlot[],
  effects: [] as (() => void)[],
  cancelled: 0,
  writes: [] as (number | AnimationRequest)[],
}));

vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>();
  const slot = () => (mock.slots[mock.cursor++] ??= {});
  return {
    ...react,
    useState: (initial: unknown) => {
      const current = slot();
      if (!('value' in current))
        current.value = typeof initial === 'function' ? initial() : initial;
      return [
        current.value,
        (next: unknown) => {
          const resolved = typeof next === 'function' ? next(current.value) : next;
          if (!Object.is(current.value, resolved)) mock.dirty = true;
          current.value = resolved;
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
  Platform: {
    OS: 'android',
    select: (values: Record<string, unknown>) => values.android ?? values.default,
  },
  StyleSheet: { create: (styles: unknown) => styles },
}));
vi.mock('react-native-reanimated', async () => {
  const { useRef } = await import('react');
  return {
    default: { View: 'AnimatedView' },
    Easing: { cubic: 'cubic', out: (curve: unknown) => curve },
    ReduceMotion: { Never: 'never', System: 'system' },
    cancelAnimation: () => {
      mock.cancelled += 1;
    },
    useAnimatedStyle: (factory: () => unknown) => factory(),
    useSharedValue: (initial: number) => {
      const ref = useRef<SharedProgress | null>(null);
      if (!ref.current) {
        const shared: SharedProgress = {
          current: initial,
          get: () => shared.current,
          set: (value) => {
            mock.writes.push(value);
            shared.current = value;
          },
        };
        ref.current = shared;
      }
      return ref.current;
    },
    withTiming: (target: number, config: Record<string, unknown>): AnimationRequest => ({
      kind: 'timing',
      target,
      config,
    }),
  };
});
vi.mock('@/utils/useReducedMotionPreference', () => ({
  useReducedMotionPreference: () => mock.reduced,
}));

let input: ExpandableSectionProps;

function render(update: Partial<ExpandableSectionProps> = {}) {
  input = { ...input, ...update };
  for (let attempt = 0; attempt < 8; attempt += 1) {
    mock.cursor = 0;
    mock.dirty = false;
    const tree = ExpandableSection(input);
    mock.effects.splice(0).forEach((effect) => effect());
    if (!mock.dirty) return tree;
  }
  throw new Error('Disclosure did not settle');
}

function content(tree: ReactElement | null) {
  if (!tree) throw new Error('Disclosure is not mounted');
  const inner = (tree.props as { children: unknown }).children;
  if (!isValidElement(inner)) throw new Error('Disclosure has no measured content');
  return inner as ReactElement<{ onLayout: (event: unknown) => void; style: unknown }>;
}

function measure(tree: ReactElement | null, height: number) {
  content(tree).props.onLayout({ nativeEvent: { layout: { height } } });
}

beforeEach(() => {
  mock.cursor = 0;
  mock.dirty = false;
  mock.reduced = false;
  mock.slots = [];
  mock.effects = [];
  mock.writes = [];
  mock.cancelled = 0;
  input = { children: createElement('Detail'), expanded: false };
});

afterEach(() => {
  mock.slots.forEach((slot) => {
    slot.cleanup?.();
    slot.cleanup = undefined;
  });
});

// The harness reports the requested height animation and the accessibility state around it.
// Real measured layout and native smoothness still need a device check.
describe('measured expandable section', () => {
  it('renders nothing until a section is opened for the first time', () => {
    expect(render()).toBeNull();
    expect(mock.writes).toEqual([]);
  });

  it('waits for one real measurement instead of guessing an opening height', () => {
    const opened = render({ expanded: true });

    expect(opened).not.toBeNull();
    expect(mock.writes).toEqual([]);

    measure(opened, 148);
    const settled = render();

    expect(mock.writes[0]).toMatchObject({
      target: 148,
      config: {
        duration: interactionMotion.timing.disclosure,
        easing: interactionMotion.easing,
        reduceMotion: 'never',
      },
    });
    expect(mock.writes[1]).toMatchObject({
      target: 1,
      config: { duration: interactionMotion.timing.disclosureFade, reduceMotion: 'never' },
    });
    expect((settled as ReactElement).props).toMatchObject({
      accessibilityElementsHidden: false,
      importantForAccessibility: 'auto',
      pointerEvents: 'auto',
    });
  });

  it('closes to zero and removes the settling content from touch and TalkBack', () => {
    const opened = render({ expanded: true });
    measure(opened, 120);
    render();
    mock.writes.length = 0;
    const closing = render({ expanded: false });

    expect(mock.writes[0]).toMatchObject({ target: 0 });
    expect(mock.writes[1]).toMatchObject({ target: 0 });
    expect((closing as ReactElement).props).toMatchObject({
      accessibilityElementsHidden: true,
      importantForAccessibility: 'no-hide-descendants',
      pointerEvents: 'none',
    });
  });

  it('cancels the running travel before reversing so a reopened section never jumps', () => {
    const opened = render({ expanded: true });
    measure(opened, 96);
    render();
    render({ expanded: false });
    const cancelledBefore = mock.cancelled;
    mock.writes.length = 0;
    render({ expanded: true });

    expect(mock.cancelled).toBeGreaterThan(cancelledBefore);
    expect(mock.writes[0]).toMatchObject({ target: 96 });
  });

  it('applies the final open and closed values with no animation when motion is reduced', () => {
    mock.reduced = true;
    const opened = render({ expanded: true });
    measure(opened, 210);
    render();

    expect(mock.writes).toEqual([210, 1]);

    mock.writes.length = 0;
    render({ expanded: false });

    expect(mock.writes).toEqual([0, 0]);
  });

  it('retargets to a new measurement when content or text size changes while open', () => {
    const opened = render({ expanded: true });
    measure(opened, 100);
    const settled = render();
    mock.writes.length = 0;
    measure(settled, 260);
    render();

    expect(mock.writes[0]).toMatchObject({ target: 260 });
  });
});
