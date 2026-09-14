import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BadgeGallery, TodayImpactPathCard } from '@/components/r002b/GrowthJourneyScreens';
import {
  ParentSharedGardenScreen,
  SharedGrowthEntryCard,
  type ParentSharedGardenScreenProps,
  type ParentSharedGrowthConfirmationPresentation,
} from '@/components/r002b/SharedGrowthScreens';

interface Slot {
  value?: unknown;
  dependencies?: readonly unknown[];
  cleanup?: () => void;
}
interface Task {
  run: () => void;
  cancel: ReturnType<typeof vi.fn>;
}
type Element = ReactElement<Record<string, unknown>>;

const mock = vi.hoisted(() => ({
  cursor: 0,
  slots: [] as Slot[],
  effects: [] as (() => void)[],
  tasks: [] as Task[],
  frames: new Map<number, FrameRequestCallback>(),
  nextFrame: 0,
  focus: vi.fn(),
  width: 390,
  fontScale: 1,
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
    useState: (initial: unknown) => [initial, vi.fn()],
    useCallback: (callback: unknown) => callback,
    useLayoutEffect: (run: () => void | (() => void), dependencies: readonly unknown[]) => {
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
    },
  };
});
vi.mock('react-native', () => ({
  ActivityIndicator: 'ActivityIndicator',
  Modal: 'Modal',
  Pressable: 'Pressable',
  ScrollView: 'ScrollView',
  View: 'View',
  Platform: { OS: 'android', select: (values: Record<string, unknown>) => values.android },
  StyleSheet: { create: (styles: unknown) => styles, absoluteFillObject: {} },
  useWindowDimensions: () => ({ width: mock.width, fontScale: mock.fontScale }),
  InteractionManager: {
    runAfterInteractions: (run: () => void) => {
      const task = { run, cancel: vi.fn() };
      mock.tasks.push(task);
      return task;
    },
  },
}));
vi.mock('@/components/access', () => ({ GhafIcon: 'GhafIcon' }));
vi.mock('@/components/illustrations', () => ({ LocalIllustration: 'LocalIllustration' }));
vi.mock('@/components/primitives', () => ({ Text: 'Text' }));
vi.mock('@/components/botanical/BotanicalPressable', () => ({
  BotanicalPressable: 'BotanicalPressable',
}));
vi.mock('@/utils/accessibilityFocus', () => ({ focusAccessibilityTarget: mock.focus }));

function elements(node: ReactNode): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!isValidElement<Record<string, unknown>>(node)) return [];
  return [node, ...elements(node.props.children as ReactNode)];
}

function find(node: ReactNode, name: string): Element {
  const result = elements(node).find((element) =>
    typeof element.type === 'function' ? element.type.name === name : element.type === name,
  );
  if (!result) throw new Error(`Missing ${name}`);
  return result;
}

function renderChild(element: Element): Element {
  const saved = { cursor: mock.cursor, slots: mock.slots };
  mock.cursor = 0;
  mock.slots = [];
  try {
    return (element.type as (props: Record<string, unknown>) => Element)(element.props);
  } finally {
    mock.cursor = saved.cursor;
    mock.slots = saved.slots;
  }
}

function confirmation(): ParentSharedGrowthConfirmationPresentation {
  return {
    action: 'end_participation',
    body: 'Only future contributions change.',
    cancelAction: { label: 'Cancel', accessibilityLabel: 'Cancel', onPress: vi.fn() },
    confirmAction: { label: 'End', accessibilityLabel: 'End', onPress: vi.fn() },
    focusReturnTargetTestID: 'end-participation',
    groupLabel: 'Private settings',
    onRequestFocusRestore: vi.fn(),
    title: 'End participation?',
    tone: 'danger',
  };
}

function screenProps(): ParentSharedGardenScreenProps {
  return {
    contentState: 'ready',
    contributionEnabled: true,
    currentHeading: 'Status',
    currentStatusDescription: 'Contributing',
    currentStatusLabel: 'Continued',
    direction: 'rtl',
    futureOnlyBody: 'Future only',
    futureOnlyHeading: 'Future',
    groupLabel: 'Private',
    language: 'ar',
    noEffectBody: 'Growth stays',
    noEffectHeading: 'Permanent',
    participationActions: [
      {
        action: 'end_participation',
        description: 'End future contributions',
        label: 'End',
        accessibilityLabel: 'End participation',
        onPress: vi.fn(),
        testID: 'end-participation',
        tone: 'danger',
      },
    ],
    participationState: 'continued',
    privacyBody: 'Private',
    privacyHeading: 'Privacy',
    readOnlyBody: 'Read only',
    readOnlyHeading: 'View',
    reducedMotion: false,
    settingsHeading: 'Settings',
    stateMessage: 'Ready',
    statusLabel: 'Ready',
    subtitle: 'Shared garden',
    title: 'Garden',
  };
}

let input: ParentSharedGardenScreenProps;
let tree: Element;

function render(update: Partial<ParentSharedGardenScreenProps> = {}) {
  input = { ...input, ...update };
  mock.cursor = 0;
  tree = ParentSharedGardenScreen(input);
  mock.effects.splice(0).forEach((effect) => effect());
  return tree;
}

function flushFrames() {
  const frames = [...mock.frames.values()];
  mock.frames.clear();
  frames.forEach((run) => run(0));
}

function unmount() {
  mock.slots.forEach((slot) => {
    slot.cleanup?.();
    slot.cleanup = undefined;
  });
}

beforeEach(() => {
  mock.cursor = 0;
  mock.slots = [];
  mock.effects = [];
  mock.tasks = [];
  mock.frames.clear();
  mock.nextFrame = 0;
  mock.width = 390;
  mock.fontScale = 1;
  input = screenProps();
  vi.stubGlobal('requestAnimationFrame', (run: FrameRequestCallback) => {
    const id = ++mock.nextFrame;
    mock.frames.set(id, run);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => mock.frames.delete(id));
});

afterEach(() => {
  unmount();
  vi.unstubAllGlobals();
});

// Host mocks execute ownership/cancellation, not native focus traversal or rendered motion.
describe('Shared Growth confirmation lifecycle', () => {
  it('commits Back immediately and restores focus only after actual dismissal', () => {
    const dialog = confirmation();
    render({ confirmation: dialog });
    const target = { focusTarget: 'end' };
    (find(tree, 'ParentParticipationAction').props.actionRef as (node: unknown) => void)(target);
    const modal = renderChild(find(tree, 'ParentParticipationConfirmation'));
    (modal.props.onRequestClose as () => void)();
    expect(dialog.cancelAction.onPress).toHaveBeenCalledOnce();
    expect(mock.tasks).toHaveLength(0);
    render({ confirmation: undefined });
    expect(
      elements(tree).some(
        (node) =>
          typeof node.type === 'function' && node.type.name === 'ParentParticipationConfirmation',
      ),
    ).toBe(false);
    mock.tasks[0]!.run();
    flushFrames();
    expect(mock.focus).toHaveBeenCalledExactlyOnceWith(target);
    expect(dialog.onRequestFocusRestore).toHaveBeenCalledExactlyOnceWith('end-participation');
  });

  it('does not move focus behind a pending or failed confirmation', () => {
    const dialog = confirmation();
    render({ confirmation: dialog });
    const modal = renderChild(find(tree, 'ParentParticipationConfirmation'));
    const button = find(modal, 'ConfirmationButton');
    (button.props.onPress as () => void)();
    expect(dialog.confirmAction.onPress).toHaveBeenCalledOnce();
    render({ contentState: 'submitting' });
    render({ contentState: 'error', confirmation: { ...dialog, body: 'Try again' } });
    expect(mock.tasks).toHaveLength(0);
    expect(mock.focus).not.toHaveBeenCalled();
  });

  it('invalidates the pending interaction task when reopened before it runs', () => {
    const oldDialog = confirmation();
    render({ confirmation: oldDialog });
    render({ confirmation: undefined });
    const oldTask = mock.tasks[0]!;
    render({ confirmation: confirmation() });
    expect(oldTask.cancel).toHaveBeenCalledOnce();
    oldTask.run();
    flushFrames();
    expect(mock.frames.size).toBe(0);
    expect(mock.focus).not.toHaveBeenCalled();
    expect(oldDialog.onRequestFocusRestore).not.toHaveBeenCalled();
  });

  it('invalidates a queued frame on rapid reopen, even if the obsolete frame executes', () => {
    render({ confirmation: confirmation() });
    render({ confirmation: undefined });
    mock.tasks[0]!.run();
    const staleFrame = [...mock.frames.values()][0]!;
    render({ confirmation: confirmation() });
    expect(mock.frames.size).toBe(0);
    staleFrame(0);
    expect(mock.focus).not.toHaveBeenCalled();
  });

  it('cancels restoration when navigating away before either scheduling stage', () => {
    render({ confirmation: confirmation() });
    render({ confirmation: undefined });
    const task = mock.tasks[0]!;
    task.run();
    const staleFrame = [...mock.frames.values()][0]!;
    unmount();
    expect(task.cancel).toHaveBeenCalledOnce();
    expect(mock.frames.size).toBe(0);
    task.run();
    staleFrame(0);
    expect(mock.focus).not.toHaveBeenCalled();
  });

  it('restores only the most recent dismissal and supports a removed-trigger fallback', () => {
    render({ confirmation: confirmation() });
    render({ confirmation: undefined });
    const oldTask = mock.tasks[0]!;
    const latest = confirmation();
    render({ confirmation: latest, reducedMotion: true });
    const status = { focusTarget: 'status' };
    (find(tree, 'ParentCurrentStatus').props.elementRef as (node: unknown) => void)(status);
    render({ confirmation: undefined, participationActions: [] });
    oldTask.run();
    mock.tasks[1]!.run();
    flushFrames();
    expect(mock.focus).toHaveBeenCalledExactlyOnceWith(status);
    expect(latest.onRequestFocusRestore).toHaveBeenCalledOnce();
  });

  it('keeps busy cancellation blocked by operation state, independently of motion', () => {
    const dialog = confirmation();
    dialog.cancelAction.busy = true;
    render({ confirmation: dialog, reducedMotion: true });
    const modal = renderChild(find(tree, 'ParentParticipationConfirmation'));
    expect(modal.props.animationType).toBe('none');
    (modal.props.onRequestClose as () => void)();
    expect(dialog.cancelAction.onPress).not.toHaveBeenCalled();
    expect(mock.tasks).toHaveLength(0);
  });
});

describe('Growth controls reuse shared press feedback', () => {
  it('preserves entry-card activation/ref and the explicit static request', () => {
    const onPress = vi.fn();
    const entry = SharedGrowthEntryCard({
      actionLabel: 'View',
      body: 'Private view',
      direction: 'rtl',
      language: 'ar',
      onPress,
      reducedMotion: true,
      statusLabel: 'Ready',
      testID: 'entry',
      title: 'Growth',
      tone: 'child',
    });
    expect(entry.type).toBe('BotanicalPressable');
    expect(entry.props).toMatchObject({
      accessibilityRole: 'button',
      reducedMotion: true,
      onPress,
    });
    expect(entry.props.ref).toBeDefined();
    (entry.props.onPress as () => void)();
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('keeps busy participation and recovery actions disabled without delaying results', () => {
    input.participationActions[0]!.busy = true;
    render({
      recoveryAction: {
        label: 'Retry',
        accessibilityLabel: 'Retry',
        busy: true,
        onPress: vi.fn(),
      },
    });
    for (const name of ['ParentParticipationAction', 'SharedGrowthRecoveryAction']) {
      const button = renderChild(find(tree, name));
      expect(button.type).toBe('BotanicalPressable');
      expect(button.props).toMatchObject({ disabled: true, accessibilityState: { busy: true } });
      expect(button.props.onPress).toBeTypeOf('function');
    }
  });

  it('preserves badge identity, immediate navigation and large-text layout props', () => {
    mock.width = 320;
    mock.fontScale = 2;
    const onPress = vi.fn();
    const gallery = BadgeGallery({
      chapterTitle: 'Journey',
      contentState: 'ready',
      description: 'Private badges',
      direction: 'rtl',
      groupLabel: 'Badges',
      language: 'ar',
      privacyNote: 'Private',
      reducedMotion: false,
      statusLabel: 'Ready',
      items: [
        {
          id: 'badge-a',
          accessibilityLabel: 'Badge A',
          criterionText: 'Complete learning',
          onPress,
          progressText: 'Complete',
          state: 'earned',
          statusLabel: 'Earned',
          testID: 'badge-a',
          title: 'A long badge title that can wrap',
        },
      ],
    });
    const card = find(gallery, 'BadgeGalleryCard');
    expect(card.key).toBe('badge-a');
    const button = renderChild(card);
    expect(button.type).toBe('BotanicalPressable');
    expect(button.props).toMatchObject({ nativeID: 'badge-a', testID: 'badge-a', onPress });
    expect(button.props.ref).toBeDefined();
    (button.props.onPress as () => void)();
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('preserves disabled Growth actions and full labels under supplied reduced motion', () => {
    const card = TodayImpactPathCard({
      chapterTitle: 'Journey',
      contentState: 'ready',
      direction: 'ltr',
      groupLabel: 'Growth',
      language: 'en',
      lifetimeLabel: 'Seeds',
      lifetimeValue: '120',
      nearestStationLabel: 'Next',
      reducedMotion: true,
      requirementText: 'Learning',
      statusLabel: 'Ready',
      action: {
        accessibilityLabel: 'Open journey',
        label: 'Open journey',
        disabled: true,
        onPress: vi.fn(),
        testID: 'journey',
      },
    });
    const button = renderChild(find(card, 'GrowthActionButton'));
    expect(button.type).toBe('BotanicalPressable');
    expect(button.props).toMatchObject({
      accessibilityLabel: 'Open journey',
      disabled: true,
      reducedMotion: true,
      accessibilityState: { disabled: true },
      nativeID: 'journey',
    });
  });
});
