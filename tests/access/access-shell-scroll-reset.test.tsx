import { createElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AccessScreen, type AccessScreenProps } from '../../src/components/access/AccessShell';

interface HookSlot {
  value?: unknown;
  dependencies?: readonly unknown[];
}

const mock = vi.hoisted(() => ({
  cursor: 0,
  slots: [] as HookSlot[],
  layoutEffects: [] as (() => void)[],
  scrollTo: vi.fn(),
}));

vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>();
  const slot = () => (mock.slots[mock.cursor++] ??= {});
  return {
    ...react,
    useRef: (initial: unknown) => {
      const current = slot();
      current.value ??= { current: initial };
      return current.value;
    },
    useLayoutEffect: (effect: () => void, dependencies: readonly unknown[]) => {
      const current = slot();
      const previous = current.dependencies;
      if (
        previous &&
        previous.length === dependencies.length &&
        previous.every((value, index) => Object.is(value, dependencies[index]))
      )
        return;
      current.dependencies = dependencies;
      mock.layoutEffects.push(effect);
    },
  };
});
vi.mock('react-native', () => ({
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  ScrollView: 'ScrollView',
  View: 'View',
  Platform: {
    OS: 'android',
    select: (values: Record<string, unknown>) => values.android ?? values.default,
  },
  StyleSheet: { create: (styles: unknown) => styles, absoluteFill: {}, hairlineWidth: 1 },
}));
vi.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
vi.mock('@/components/brand/GhafBrandLockup', () => ({ GhafBrandLockup: 'GhafBrandLockup' }));
vi.mock('@/components/illustrations', () => ({ LocalIllustration: 'LocalIllustration' }));
vi.mock('@/components/primitives', () => ({ IconButton: 'IconButton', Text: 'Text' }));
vi.mock('../../src/components/access/GhafIcon', () => ({ GhafIcon: 'GhafIcon' }));

type Node = ReactElement<Record<string, unknown>>;
let tree: ReactNode;
let nativeScroller: { scrollTo: typeof mock.scrollTo };

function find(type: string, value: ReactNode = tree): Node | undefined {
  if (Array.isArray(value)) {
    for (const child of value) {
      const match = find(type, child ?? null);
      if (match) return match;
    }
  }
  if (!isValidElement<Record<string, unknown>>(value)) return undefined;
  return value.type === type ? value : find(type, (value.props.children as ReactNode) ?? null);
}

function render(props: AccessScreenProps, commit = true) {
  mock.cursor = 0;
  tree = AccessScreen(props);
  const scroll = find('ScrollView');
  if (scroll) {
    (scroll.props.ref as { current: typeof nativeScroller }).current = nativeScroller;
  }
  if (commit) for (const effect of mock.layoutEffects.splice(0)) effect();
  return tree;
}

beforeEach(() => {
  mock.cursor = 0;
  mock.slots = [];
  mock.layoutEffects = [];
  mock.scrollTo.mockReset();
  nativeScroller = { scrollTo: mock.scrollTo };
});

describe('AccessScreen optional scroll reset', () => {
  it('preserves existing screens and their scroll position when no reset key is supplied', () => {
    render({ children: 'First content' });
    const scroller = find('ScrollView')!;
    render({ children: 'Changed content', keyboardAware: true });
    expect(find('ScrollView')?.props.ref).toBe(scroller.props.ref);
    expect(mock.scrollTo).not.toHaveBeenCalled();
  });

  it('resets the existing native scroller immediately in layout with no animated exit', () => {
    const header = createElement('Header');
    render({ header, scrollResetKey: 'ready:adult-a', children: 'Private content' });
    const safeArea = find('SafeAreaView')!;
    const scroller = find('ScrollView')!;
    expect(mock.scrollTo).not.toHaveBeenCalled();

    render({ header, scrollResetKey: 'signin:signed-out', children: 'Sign in' }, false);
    expect(find('SafeAreaView')?.type).toBe(safeArea.type);
    expect(find('SafeAreaView')?.key).toBe(safeArea.key);
    expect(find('ScrollView')?.props.ref).toBe(scroller.props.ref);
    expect(find('Header')).toBe(header);
    expect(mock.scrollTo).not.toHaveBeenCalled();
    for (const effect of mock.layoutEffects.splice(0)) effect();
    expect(mock.scrollTo).toHaveBeenCalledExactlyOnceWith({ x: 0, y: 0, animated: false });
  });

  it('does not replay the reset during same-account edits or keyboard changes', () => {
    render({ scrollResetKey: 'ready:adult-a' });
    render({ scrollResetKey: 'ready:adult-b' });
    expect(mock.scrollTo).toHaveBeenCalledOnce();
    render({ scrollResetKey: 'ready:adult-b', children: 'Unsaved edit', keyboardAware: true });
    render({ scrollResetKey: 'ready:adult-b', keyboardVerticalOffset: 20 });
    expect(mock.scrollTo).toHaveBeenCalledOnce();
  });

  it('keeps non-scrolling layouts unchanged and accepts disabling the reset behavior', () => {
    render({ scroll: false, scrollResetKey: 'first' });
    render({ scroll: false, scrollResetKey: 'second' });
    expect(find('ScrollView')).toBeUndefined();
    expect(mock.scrollTo).not.toHaveBeenCalled();
    render({ scrollResetKey: 'second' });
    render({ scrollResetKey: undefined });
    expect(mock.scrollTo).not.toHaveBeenCalled();
  });
});
