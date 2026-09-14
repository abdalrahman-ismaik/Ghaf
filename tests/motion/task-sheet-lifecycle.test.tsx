import { isValidElement, type ComponentProps, type ReactElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChildCompletionConfirmationSheet } from '@/components/r002a/child/ChildCompletionConfirmationSheet';
import { ParentSupportRequestSheet } from '@/components/r002a/parent/ParentSupportRequestSheet';

interface Slot {
  value?: unknown;
  dependencies?: readonly unknown[];
  cleanup?: () => void;
}
type Element = ReactElement<Record<string, unknown>>;
const mock = vi.hoisted(() => ({
  cursor: 0,
  dirty: false,
  reduced: false,
  platform: 'android',
  slots: [] as Slot[],
  effects: [] as (() => void)[],
  frames: new Map<number, FrameRequestCallback>(),
  nextFrame: 0,
  focus: vi.fn(),
}));

vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>();
  const slot = () => (mock.slots[mock.cursor++] ??= {});
  const changed = (current: Slot, dependencies: readonly unknown[]) =>
    !current.dependencies ||
    dependencies.length !== current.dependencies.length ||
    dependencies.some((value, index) => !Object.is(value, current.dependencies?.[index]));
  return {
    ...react,
    useRef: (initial: unknown) => {
      const current = slot();
      if (!('value' in current)) current.value = { current: initial };
      return current.value;
    },
    useMemo: (factory: () => unknown, dependencies: readonly unknown[]) => {
      const current = slot();
      if (changed(current, dependencies)) {
        current.value = factory();
        current.dependencies = dependencies;
      }
      return current.value;
    },
    useState: (initial: unknown) => {
      const current = slot();
      if (!('value' in current)) current.value = initial;
      return [
        current.value,
        (next: unknown) => {
          const value = typeof next === 'function' ? next(current.value) : next;
          if (!Object.is(current.value, value)) mock.dirty = true;
          current.value = value;
        },
      ];
    },
    useLayoutEffect: (run: () => void | (() => void), dependencies: readonly unknown[]) => {
      const current = slot();
      if (!changed(current, dependencies)) return;
      current.dependencies = dependencies;
      mock.effects.push(() => {
        current.cleanup?.();
        current.cleanup = run() || undefined;
      });
    },
  };
});
vi.mock('react-native', () => ({
  Modal: 'Modal',
  Pressable: 'Pressable',
  ScrollView: 'ScrollView',
  View: 'View',
  Platform: {
    get OS() {
      return mock.platform;
    },
    select: (values: Record<string, unknown>) => values[mock.platform],
  },
  StyleSheet: { create: (styles: unknown) => styles, absoluteFill: {} },
}));
vi.mock('@/utils/accessibilityFocus', () => ({ focusAccessibilityTarget: mock.focus }));
vi.mock('@/utils/useReducedMotionPreference', () => ({
  useReducedMotionPreference: () => mock.reduced,
}));
vi.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
vi.mock('@/components/access', () => ({ GhafIcon: 'GhafIcon' }));
vi.mock('@/components/primitives', () => ({
  PrimaryButton: 'PrimaryButton',
  SecondaryButton: 'SecondaryButton',
  QuietButton: 'QuietButton',
  Text: 'Text',
}));

function elements(node: ReactNode): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!isValidElement<Record<string, unknown>>(node)) return [];
  return [node, ...elements(node.props.children as ReactNode)];
}
let tree: Element;
function byId(id: string) {
  const found = elements(tree).find((element) => element.props.testID === id);
  if (!found) throw new Error(`Missing ${id}`);
  return found.props;
}
function call(props: Record<string, unknown>, name: string, ...args: unknown[]) {
  (props[name] as (...values: unknown[]) => void)(...args);
}
function render(component: () => Element) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    mock.cursor = 0;
    mock.dirty = false;
    tree = component();
    elements(tree).forEach((element) => {
      const ref = element.props.ref as { current: unknown } | undefined;
      if (ref) ref.current = heading;
    });
    mock.effects.splice(0).forEach((effect) => effect());
    if (!mock.dirty) return tree.props;
  }
  throw new Error('Sheet did not settle');
}
function unmount() {
  mock.slots.forEach((slot) => {
    slot.cleanup?.();
    slot.cleanup = undefined;
  });
}
function flushFrames() {
  const frames = [...mock.frames.values()];
  mock.frames.clear();
  frames.forEach((frame) => frame(0));
}
const heading = { id: 'heading' };
const trigger = { id: 'trigger' };
const common = () => ({
  busy: false,
  busyLabel: 'Sending',
  direction: 'rtl' as const,
  error: null,
  message: 'Review this task',
  onDismiss: vi.fn(),
  onSubmit: vi.fn(),
  title: 'Review',
  visible: true,
  returnFocusRef: { current: trigger } as unknown as ComponentProps<
    typeof ParentSupportRequestSheet
  >['returnFocusRef'],
});
const supportProps = (): ComponentProps<typeof ParentSupportRequestSheet> => ({
  ...common(),
  backLabel: 'Back',
  language: 'ar',
  noRewardLabel: 'No award yet',
  submitLabel: 'Send',
  steps: [
    { id: 'start', label: 'Help me start with a long multiline instruction' },
    { id: 'prepare', label: 'Prepare together' },
  ],
});
const completionProps = (): ComponentProps<typeof ChildCompletionConfirmationSheet> => ({
  ...common(),
  awardLabel: '12 Seeds after approval',
  hasMedia: false,
  mediaLabel: 'No media',
  noEarlyRewardLabel: 'Parent approval first',
  privacyLabel: 'Private',
  reflectionLabel: 'Optional',
  returnLabel: 'Return',
  submitLabel: 'Send',
  taskCompleteLabel: 'Completed',
  taskTitle: 'Recycling',
  taskTitleLabel: 'Task',
});
beforeEach(() => {
  mock.cursor = 0;
  mock.slots = [];
  mock.effects = [];
  mock.dirty = false;
  mock.reduced = false;
  mock.platform = 'android';
  mock.frames.clear();
  mock.nextFrame = 0;
  vi.stubGlobal('requestAnimationFrame', (frame: FrameRequestCallback) => {
    const id = ++mock.nextFrame;
    mock.frames.set(id, frame);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => mock.frames.delete(id));
});
afterEach(() => {
  unmount();
  vi.unstubAllGlobals();
});

// Host execution verifies lifecycle ownership; it does not simulate native motion or TalkBack.
describe.each(['support', 'completion'] as const)('%s sheet lifecycle', (kind) => {
  function setup() {
    const props = kind === 'support' ? supportProps() : completionProps();
    const show = () =>
      render(() =>
        kind === 'support'
          ? ParentSupportRequestSheet(props as ComponentProps<typeof ParentSupportRequestSheet>)
          : ChildCompletionConfirmationSheet(
              props as ComponentProps<typeof ChildCompletionConfirmationSheet>,
            ),
      );
    return { props, show };
  }
  it('dismisses immediately but restores focus only after committed closure', () => {
    const { props, show } = setup();
    const modal = show();
    call(modal, 'onShow');
    expect(mock.focus).toHaveBeenLastCalledWith(heading);
    mock.focus.mockClear();
    call(modal, 'onRequestClose');
    expect(props.onDismiss).toHaveBeenCalledTimes(1);
    expect(mock.frames.size).toBe(0);
    props.visible = false;
    show();
    flushFrames();
    expect(mock.focus).toHaveBeenCalledExactlyOnceWith(trigger);
  });
  it('cancels restoration on reopening, including an already dequeued callback', () => {
    const { props, show } = setup();
    const first = show();
    props.visible = false;
    show();
    const stale = [...mock.frames.values()][0]!;
    props.visible = true;
    const reopened = show();
    expect(mock.frames.size).toBe(0);
    stale(0);
    call(first, 'onShow');
    expect(mock.focus).not.toHaveBeenCalled();
    call(reopened, 'onShow');
    expect(mock.focus).toHaveBeenCalledExactlyOnceWith(heading);
  });
  it('ignores late show and restore callbacks after unmount', () => {
    const { props, show } = setup();
    const modal = show();
    props.visible = false;
    show();
    const stale = [...mock.frames.values()][0]!;
    unmount();
    stale(0);
    call(modal, 'onShow');
    expect(mock.frames.size).toBe(0);
    expect(mock.focus).not.toHaveBeenCalled();
  });
  it('retains focus for pending/error states and restores after an external success closes it', () => {
    const { props, show } = setup();
    props.busy = true;
    call(show(), 'onRequestClose');
    expect(props.onDismiss).not.toHaveBeenCalled();
    props.busy = false;
    props.error = 'Try again';
    show();
    flushFrames();
    expect(mock.focus).not.toHaveBeenCalled();
    props.visible = false;
    show();
    flushFrames();
    expect(mock.focus).toHaveBeenCalledExactlyOnceWith(trigger);
  });
  it('ignores submit activation during busy work and after cancellation while exiting', () => {
    const { props, show } = setup();
    show();
    if (kind === 'support') {
      call(byId('support-step-start'), 'onPress');
      show();
    }
    const submit = () => {
      const primary = elements(tree).find((element) => element.type === 'PrimaryButton')!;
      call(primary.props, 'onPress');
    };
    props.busy = true;
    show();
    submit();
    props.busy = false;
    props.visible = false;
    show();
    submit();
    expect(props.onSubmit).not.toHaveBeenCalled();
  });
  it('samples live motion on opening without replacing a visible native dialog', () => {
    const { props, show } = setup();
    const entrance = kind === 'support' ? 'slide' : 'fade';
    expect(show().animationType).toBe(entrance);
    call(tree.props, 'onShow');
    mock.focus.mockClear();
    mock.reduced = true;
    expect(show().animationType).toBe(entrance);
    call(tree.props, 'onShow');
    mock.reduced = false;
    show();
    call(tree.props, 'onShow');
    expect(mock.focus).not.toHaveBeenCalled();
    mock.reduced = true;
    props.visible = false;
    expect(show().animationType).toBe(entrance);
    props.visible = true;
    expect(show().animationType).toBe('none');
    mock.reduced = false;
    expect(show().animationType).toBe('none');
    props.visible = false;
    show();
    props.visible = true;
    expect(show().animationType).toBe(entrance);
  });
  it('waits for iOS native dismissal and leaves web focus to its native modal adapter', () => {
    mock.platform = 'ios';
    const { props, show } = setup();
    show();
    props.visible = false;
    const dismissed = show();
    flushFrames();
    expect(mock.focus).not.toHaveBeenCalled();
    call(dismissed, 'onDismiss');
    call(dismissed, 'onDismiss');
    expect(mock.focus).toHaveBeenCalledExactlyOnceWith(trigger);
    mock.focus.mockClear();
    props.visible = true;
    show();
    call(dismissed, 'onDismiss');
    expect(mock.focus).not.toHaveBeenCalled();
    mock.platform = 'web';
    props.visible = false;
    show();
    props.visible = true;
    call(show(), 'onShow');
    props.visible = false;
    call(show(), 'onDismiss');
    flushFrames();
    expect(mock.focus).not.toHaveBeenCalled();
  });
});

describe('support selection lifecycle', () => {
  it('keeps selection through repeated shows, live policy changes, pending work and failed retry', () => {
    const props = supportProps();
    const show = () => render(() => ParentSupportRequestSheet(props));
    show();
    call(byId('support-step-start'), 'onPress');
    show();
    call(tree.props, 'onShow');
    mock.reduced = true;
    show();
    call(tree.props, 'onShow');
    show();
    expect(byId('support-step-start')['aria-checked']).toBe(true);
    props.busy = true;
    show();
    expect(byId('support-step-start')).toMatchObject({
      disabled: true,
      accessibilityState: { checked: true, disabled: true },
    });
    call(byId('support-step-start'), 'onPress');
    show();
    props.busy = false;
    props.error = 'Retry';
    show();
    call(byId('send-support-request-button'), 'onPress');
    expect(props.onSubmit).toHaveBeenCalledExactlyOnceWith(['start']);
    props.visible = false;
    show();
    expect(byId('support-step-start')['aria-checked']).toBe(true);
    expect(byId('send-support-request-button').disabled).toBe(false);
    props.visible = true;
    show();
    expect(byId('support-step-start')['aria-checked']).toBe(false);
    expect(byId('send-support-request-button').disabled).toBe(true);
  });
  it('supports Space activation without repeated toggles or editing a pending selection', () => {
    mock.platform = 'web';
    const props = supportProps();
    const show = () => render(() => ParentSupportRequestSheet(props));
    show();
    const key = (repeat = false) =>
      call(byId('support-step-start'), 'onKeyDown', { key: ' ', repeat, preventDefault: vi.fn() });
    key();
    show();
    key(true);
    show();
    expect(byId('support-step-start')['aria-checked']).toBe(true);
    props.busy = true;
    show();
    key();
    show();
    expect(byId('support-step-start')['aria-checked']).toBe(true);
    props.busy = false;
    show();
    key();
    show();
    expect(byId('support-step-start')['aria-checked']).toBe(false);
  });
});
