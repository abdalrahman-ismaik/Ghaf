import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ChildTaskChecklist,
  type ChildTaskCheckpoint,
} from '@/components/r002a/child/ChildTaskChecklist';
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
  reduced: false,
  slots: [] as HookSlot[],
  effects: [] as (() => void)[],
  values: [] as SharedProgress[],
  cancelled: 0,
  writes: [] as (number | AnimationRequest)[],
}));

vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>();
  const slot = () => (mock.slots[mock.cursor++] ??= {});
  return {
    ...react,
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
  View: 'View',
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
    interpolateColor: (progress: number, _input: readonly number[], output: readonly string[]) =>
      progress >= 1 ? output[1] : output[0],
    useAnimatedStyle: (factory: () => unknown) => factory(),
    withTiming: (target: number, config: Record<string, unknown>): AnimationRequest => ({
      kind: 'timing',
      target,
      config,
    }),
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
        mock.values.push(shared);
        ref.current = shared;
      }
      return ref.current;
    },
  };
});
vi.mock('@/utils/useReducedMotionPreference', () => ({
  useReducedMotionPreference: () => mock.reduced,
}));
vi.mock('@/components/botanical', () => ({ BotanicalPressable: 'BotanicalPressable' }));
vi.mock('@/components/access', () => ({ GhafIcon: 'GhafIcon' }));
vi.mock('@/components/primitives', () => ({ Text: 'Text' }));

const steps: readonly ChildTaskCheckpoint[] = [
  { detail: 'اجمع العلب', id: 'collect', title: 'اجمع' },
  { detail: 'افرز المواد', id: 'sort', title: 'افرز' },
];

function children(node: ReactNode): ReactNode[] {
  if (Array.isArray(node)) return node.flatMap(children);
  if (!isValidElement(node)) return [];
  const props = node.props as { children?: ReactNode };
  return [node, ...children(props.children)];
}

// Each step owns its own settled state, so the harness invokes them in a stable order.
function render(completedStepIds: readonly string[], direction: 'ltr' | 'rtl' = 'rtl') {
  mock.cursor = 0;
  const tree = ChildTaskChecklist({
    completedLabel: `${completedStepIds.length}/${steps.length}`,
    completedStepIds,
    direction,
    onToggle: () => undefined,
    steps,
    title: 'الخطوات',
  }) as ReactElement;
  const nodes = children(tree);
  const rows = nodes.filter((node) => isValidElement(node) && typeof node.type === 'function');
  for (const row of rows) {
    const element = row as ReactElement<Record<string, unknown>>;
    const component = element.type as (props: Record<string, unknown>) => ReactElement;
    nodes.push(...children(component(element.props)));
  }
  mock.effects.splice(0).forEach((effect) => effect());
  return nodes;
}

function byTestID(nodes: readonly ReactNode[], testID: string) {
  return nodes.find(
    (node) => isValidElement(node) && (node.props as { testID?: string }).testID === testID,
  ) as ReactElement<Record<string, unknown>>;
}

function flatStyle(value: unknown): Record<string, unknown> {
  if (Array.isArray(value)) return Object.assign({}, ...value.map(flatStyle));
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

beforeEach(() => {
  mock.cursor = 0;
  mock.reduced = false;
  mock.slots = [];
  mock.effects = [];
  mock.values = [];
  mock.writes = [];
  mock.cancelled = 0;
});

afterEach(() => {
  mock.slots.forEach((slot) => {
    slot.cleanup?.();
    slot.cleanup = undefined;
  });
});

// These assert the requested animation and the committed accessible value. They do not
// measure rendered frames; native progress smoothness still needs a device check.
describe('child task checklist continuity', () => {
  it('reports the committed step count and starts the first paint at that state', () => {
    const nodes = render(['collect']);
    const progress = byTestID(nodes, 'task-step-progress');

    expect(progress.props.accessibilityValue).toEqual({ min: 0, max: 2, now: 1 });
    expect(progress.props.accessibilityRole).toBe('progressbar');
    // A remount or a reopened task must not replay the advance that already happened.
    expect(mock.writes).toEqual([]);
  });

  it('advances the fill continuously to the new fraction after a toggle', () => {
    render([]);
    mock.writes.length = 0;
    render(['collect']);

    expect(mock.writes[0]).toMatchObject({
      target: 0.5,
      config: {
        duration: interactionMotion.timing.progress,
        easing: interactionMotion.easing,
        reduceMotion: 'never',
      },
    });
  });

  it('cancels the running advance before retargeting a reversed toggle', () => {
    render([]);
    render(['collect']);
    const cancelledBefore = mock.cancelled;
    mock.writes.length = 0;
    render([]);

    expect(mock.cancelled).toBeGreaterThan(cancelledBefore);
    expect(mock.writes[0]).toMatchObject({ target: 0 });
  });

  it('settles immediately and skips every animation when motion is reduced', () => {
    mock.reduced = true;
    render([]);
    mock.writes.length = 0;
    render(['collect', 'sort']);

    expect(mock.writes.length).toBeGreaterThan(0);
    expect(mock.writes.every((value) => typeof value === 'number')).toBe(true);
    expect(mock.writes).toContain(1);
  });

  it('scales the fill from the reading start edge in both directions', () => {
    const rtl = byTestID(render(['collect'], 'rtl'), 'task-step-progress');
    const ltr = byTestID(render(['collect'], 'ltr'), 'task-step-progress');
    const fillOf = (progress: ReactElement<Record<string, unknown>>) =>
      flatStyle((progress.props.children as ReactElement<{ style: unknown }>).props.style);

    expect(fillOf(rtl).transformOrigin).toBe('right center');
    expect(fillOf(ltr).transformOrigin).toBe('left center');
    expect(fillOf(rtl).transform).toEqual([{ scaleX: 0.5 }]);
    expect(fillOf(rtl).width).toBe('100%');
  });

  it('keeps every step row an accessible checkbox with no stacked press opacity', () => {
    const nodes = render(['collect']);
    const completed = byTestID(nodes, 'task-step-collect');
    const open = byTestID(nodes, 'task-step-sort');

    expect(completed.props.accessibilityRole).toBe('checkbox');
    expect(completed.props.accessibilityState).toEqual({ checked: true });
    expect(open.props.accessibilityState).toEqual({ checked: false });
    expect(flatStyle(completed.props.style).opacity).toBeUndefined();
    expect(completed.props.animatedStyle).toMatchObject({ backgroundColor: expect.any(String) });
  });
});
