import { createRequire } from 'node:module';

import {
  createElement,
  isValidElement,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SuccessSheet } from '@/components/access/SuccessSheet';
import { ChildTaskPlanCard } from '@/components/r002a/child/ChildTaskPlanCard';
import { ParentSupportRequestSheet } from '@/components/r002a/parent/ParentSupportRequestSheet';

interface HostProps {
  children?: ReactNode;
  testID?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: string;
  accessibilityState?: { checked?: boolean };
  accessibilityElementsHidden?: boolean;
  accessibilityLiveRegion?: string;
  role?: 'status';
  importantForAccessibility?: string;
  'aria-checked'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  busy?: boolean;
  disabled?: boolean;
  visible?: boolean;
  onPress?: () => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onRequestClose?: () => void;
  onShow?: () => void;
  ref?: { current: unknown };
}

const rendered = vi.hoisted(() => ({
  platform: 'web',
  hosts: [] as HostProps[],
  effects: [] as (() => void | (() => void))[],
  stateSlots: [] as unknown[],
  stateCursor: 0,
  focus: vi.fn(),
  findNodeHandle: vi.fn((node: unknown) => (node as { nativeTag?: number } | null)?.nativeTag),
}));

function host(tag: 'div' | 'span' | 'button', props: HostProps) {
  rendered.hosts.push(props);
  if (props.ref) props.ref.current = { nativeTag: 42 };
  return createElement(
    tag,
    {
      'data-testid': props.testID,
      'aria-label': props.accessibilityLabel,
      'aria-checked': props['aria-checked'],
      'aria-hidden': props['aria-hidden'],
      'aria-live': props['aria-live'],
      role: props.role ?? props.accessibilityRole,
      disabled: tag === 'button' ? props.disabled || props.busy : undefined,
    },
    props.children,
  );
}

// Host doubles retain callback state and capture native focus requests; they do not prove device focus.
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useEffect: (effect: () => void | (() => void)) => rendered.effects.push(effect),
  useState: <T,>(initial: T | (() => T)) => {
    const slot = rendered.stateCursor++;
    if (!(slot in rendered.stateSlots)) {
      rendered.stateSlots[slot] = typeof initial === 'function' ? (initial as () => T)() : initial;
    }
    return [
      rendered.stateSlots[slot] as T,
      (next: SetStateAction<T>) => {
        rendered.stateSlots[slot] =
          typeof next === 'function'
            ? (next as (previous: T) => T)(rendered.stateSlots[slot] as T)
            : next;
      },
    ];
  },
}));
vi.mock('react-native', () => ({
  Platform: {
    get OS() {
      return rendered.platform;
    },
    select: (options: Record<string, unknown>) => options[rendered.platform] ?? options.default,
  },
  AccessibilityInfo: { setAccessibilityFocus: rendered.focus },
  findNodeHandle: rendered.findNodeHandle,
  StyleSheet: { create: <T,>(styles: T) => styles, absoluteFill: {}, hairlineWidth: 1 },
  View: (props: HostProps) => host('div', props),
  ScrollView: (props: HostProps) => host('div', props),
  Pressable: (props: HostProps) => host('button', props),
  Modal: (props: HostProps) => (props.visible ? host('div', props) : null),
}));
vi.mock('react-native-reanimated', () => ({
  default: { View: (props: HostProps) => host('div', props) },
  Easing: { bezier: vi.fn() },
  cancelAnimation: vi.fn(),
  interpolate: vi.fn(() => 1),
  useAnimatedStyle: (factory: () => unknown) => factory(),
  useReducedMotion: () => true,
  useSharedValue: (initial: number) => ({ get: () => initial, set: vi.fn() }),
  withTiming: (value: number) => value,
}));
vi.mock('react-native-safe-area-context', () => ({
  SafeAreaView: (props: HostProps) => host('div', props),
}));
vi.mock('@/components/access', () => ({ GhafIcon: () => null }));
vi.mock('@/components/access/GhafIcon', () => ({ GhafIcon: () => null }));
vi.mock('@/components/primitives', () => ({
  Text: (props: HostProps) => host('span', props),
  PrimaryButton: (props: HostProps) => host('button', props),
  QuietButton: (props: HostProps) => host('button', props),
}));

const { renderToStaticMarkup } = createRequire(import.meta.url)('react-dom/server') as {
  renderToStaticMarkup: (element: ReactNode) => string;
};

function render(element: ReactNode) {
  rendered.hosts.length = 0;
  rendered.effects.length = 0;
  rendered.stateCursor = 0;
  return renderToStaticMarkup(element);
}

function exposedText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(exposedText).filter(Boolean).join(' ');
  if (!isValidElement<HostProps>(node)) return '';
  const props = node.props;
  if (
    props['aria-hidden'] ||
    props.accessibilityElementsHidden ||
    props.importantForAccessibility === 'no-hide-descendants'
  )
    return '';
  return exposedText(props.children);
}

function control(testID: string) {
  const found = rendered.hosts.find((props) => props.testID === testID);
  expect(found?.onPress).toEqual(expect.any(Function));
  return found!;
}

function press(props: HostProps) {
  if (!props.disabled && !props.busy) props.onPress?.();
}

const copies = [
  {
    language: 'ar' as const,
    direction: 'rtl' as const,
    title: 'خطوات المهمة',
    first: 'جهّز الأدوات',
    detail: 'اطلب المساعدة عند الحاجة.',
    second: 'ابدأ بخطوة صغيرة',
    success: 'تم إرسال المهمة',
    message: 'يمكنك متابعة مهامك.',
    consequence: 'لا تتغير البذور حتى التأكيد.',
    send: 'إرسال',
    back: 'رجوع',
  },
  {
    language: 'en' as const,
    direction: 'ltr' as const,
    title: 'Task steps',
    first: 'Prepare the tools',
    detail: 'Ask for help when needed.',
    second: 'Start with a small step',
    success: 'Task sent',
    message: 'You can continue your tasks.',
    consequence: 'Seeds stay unchanged until confirmation.',
    send: 'Send',
    back: 'Back',
  },
];

beforeEach(() => {
  rendered.platform = 'web';
  rendered.hosts.length = 0;
  rendered.effects.length = 0;
  rendered.stateSlots.length = 0;
  rendered.stateCursor = 0;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});
afterEach(() => vi.unstubAllGlobals());

describe.each(copies)('Slice 2 accessibility in $language', (copy) => {
  const steps = [
    { id: 'prepare', title: copy.first, detail: copy.detail },
    { id: 'start', title: copy.second, detail: copy.detail },
  ];

  it('exposes real numbered web instructions once without generic replacement labels', () => {
    const markup = render(
      <ChildTaskPlanCard direction={copy.direction} steps={steps} title={copy.title} />,
    );
    expect(rendered.hosts.some((props) => props.accessibilityLabel)).toBe(false);
    expect(markup).not.toContain('aria-hidden="true"');
    const formatter = new Intl.NumberFormat(copy.language === 'ar' ? 'ar-AE' : 'en-AE');
    for (const [index, step] of steps.entries()) {
      expect(markup.split(`>${formatter.format(index + 1)}<`)).toHaveLength(2);
      expect(markup.split(step.title)).toHaveLength(2);
    }
    expect(markup.split(copy.detail)).toHaveLength(3);
  });

  it.each(['android', 'ios'])('retains complete grouped step labels on %s', (platform) => {
    rendered.platform = platform;
    render(<ChildTaskPlanCard direction={copy.direction} steps={steps} title={copy.title} />);
    const grouped = rendered.hosts.filter((props) => props.accessible && props.accessibilityLabel);
    const formatter = new Intl.NumberFormat(copy.language === 'ar' ? 'ar-AE' : 'en-AE');
    expect(grouped.map((props) => props.accessibilityLabel)).toEqual(
      steps.map((step, index) => `${formatter.format(index + 1)}. ${step.title}. ${step.detail}`),
    );
    for (const group of grouped) expect(exposedText(group.children)).toBe('');
    expect(rendered.hosts.filter((props) => props.accessibilityElementsHidden)).toHaveLength(4);
  });

  function success(visible = true) {
    return (
      <SuccessSheet
        actionLabel={copy.send}
        announcementMessage={`${copy.message} ${copy.consequence}`}
        direction={copy.direction}
        language={copy.language}
        message={copy.message}
        onAction={vi.fn()}
        title={copy.success}
        visible={visible}
      >
        <span>{copy.consequence}</span>
      </SuccessSheet>
    );
  }

  it('uses a web live region containing actual success title/message and keeps consequences readable', () => {
    const markup = render(success());
    const live = rendered.hosts.filter((props) => props['aria-live'] === 'polite');
    expect(live).toHaveLength(1);
    expect(live[0]).toMatchObject({ accessible: false, role: 'status' });
    expect(markup).toContain('role="status"');
    expect(live[0]!.accessibilityLabel).toBeUndefined();
    expect(exposedText(live[0]!.children)).toBe(`${copy.success} ${copy.message}`);
    for (const text of [copy.success, copy.message, copy.consequence]) {
      expect(markup.split(text)).toHaveLength(2);
    }
    for (const effect of rendered.effects) effect();
    expect(rendered.focus).not.toHaveBeenCalled();
  });

  it.each(['web', 'android'])(
    'supports ordinary success messages without an override on %s',
    (platform) => {
      rendered.platform = platform;
      render(
        <SuccessSheet
          actionLabel={copy.send}
          direction={copy.direction}
          language={copy.language}
          message={copy.message}
          onAction={vi.fn()}
          title={copy.success}
          visible
        />,
      );
      const live = rendered.hosts.find((props) =>
        platform === 'web' ? props.role === 'status' : props.accessibilityLiveRegion === 'polite',
      );
      if (platform === 'web') {
        expect(live?.accessibilityLabel).toBeUndefined();
        expect(exposedText(live!.children)).toBe(`${copy.success} ${copy.message}`);
      } else {
        expect(live?.accessibilityLabel).toBe(`${copy.success}. ${copy.message}`);
      }
    },
  );

  it.each(['android', 'ios'])(
    'retains the complete native success announcement and focus request on %s',
    (platform) => {
      rendered.platform = platform;
      render(success());
      const live = rendered.hosts.find((props) => props.accessibilityLiveRegion === 'polite');
      expect(live).toMatchObject({
        accessible: true,
        accessibilityLabel: `${copy.success}. ${copy.message} ${copy.consequence}`,
      });
      expect(live!.role).toBeUndefined();
      expect(exposedText(live!.children)).toBe('');
      const cleanup = rendered.effects[0]!();
      expect(rendered.focus).toHaveBeenCalledWith(42);
      if (cleanup) cleanup();
      expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
      rendered.focus.mockClear();
      expect(render(success(false))).toBe('');
      for (const effect of rendered.effects) effect();
      expect(rendered.focus).not.toHaveBeenCalled();
    },
  );

  it.each(['web', 'android', 'ios'])(
    'preserves retry selection, payload, disabled send and dismissal on %s',
    (platform) => {
      rendered.platform = platform;
      const onSubmit = vi.fn();
      const onDismiss = vi.fn();
      const returnFocusRef = { current: { nativeTag: 73 } } as unknown as ComponentProps<
        typeof ParentSupportRequestSheet
      >['returnFocusRef'];
      const props: ComponentProps<typeof ParentSupportRequestSheet> = {
        backLabel: copy.back,
        busy: false,
        busyLabel: copy.send,
        direction: copy.direction,
        error: null,
        language: copy.language,
        message: copy.message,
        noRewardLabel: copy.consequence,
        onDismiss,
        onSubmit,
        returnFocusRef,
        steps: steps.map((step) => ({ id: step.id, label: step.title })),
        submitLabel: copy.send,
        title: copy.title,
        visible: true,
      };
      const show = () => render(<ParentSupportRequestSheet {...props} />);
      show();
      expect(control('send-support-request-button').disabled).toBe(true);
      press(control('send-support-request-button'));
      expect(onSubmit).not.toHaveBeenCalled();
      for (const step of steps) {
        expect(control(`support-step-${step.id}`)).toMatchObject({
          accessibilityRole: 'checkbox',
          accessibilityState: { checked: false },
          'aria-checked': false,
        });
      }
      if (platform === 'web') {
        const preventDefault = vi.fn();
        const key = (value: string, repeat = false) => {
          control('support-step-start').onKeyDown!({
            key: value,
            repeat,
            preventDefault,
          } as unknown as KeyboardEvent);
          show();
        };
        key(' ');
        expect(control('support-step-start')['aria-checked']).toBe(true);
        key(' ', true);
        expect(control('support-step-start')['aria-checked']).toBe(true);
        key('Enter');
        expect(control('support-step-start')['aria-checked']).toBe(true);
        key('Spacebar');
        expect(control('support-step-start')['aria-checked']).toBe(false);
        expect(control('send-support-request-button').disabled).toBe(true);
        expect(preventDefault).toHaveBeenCalledTimes(3);
      } else {
        expect(control('support-step-start').onKeyDown).toBeUndefined();
      }
      press(control('support-step-start'));
      show();
      expect(control('support-step-start')).toMatchObject({
        accessibilityState: { checked: true },
        'aria-checked': true,
      });
      press(control('support-step-prepare'));
      show();
      press(control('send-support-request-button'));
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith(['start', 'prepare']);
      press(control('support-step-start'));
      show();
      expect(control('support-step-start')['aria-checked']).toBe(false);
      expect(control('support-step-prepare')['aria-checked']).toBe(true);
      props.busy = true;
      show();
      press(control('send-support-request-button'));
      rendered.hosts.find((hostProps) => hostProps.onRequestClose)!.onRequestClose!();
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onDismiss).not.toHaveBeenCalled();
      props.busy = false;
      show();
      rendered.hosts.find((hostProps) => hostProps.onRequestClose)!.onRequestClose!();
      expect(onDismiss).toHaveBeenCalledTimes(1);
      if (platform === 'web') expect(rendered.focus).not.toHaveBeenCalled();
      else expect(rendered.focus).toHaveBeenLastCalledWith(73);
      rendered.hosts.find((hostProps) => hostProps.onShow)!.onShow!();
      show();
      expect(control('send-support-request-button').disabled).toBe(true);
      expect(control('support-step-prepare')['aria-checked']).toBe(false);
      if (platform !== 'web') expect(rendered.focus).toHaveBeenLastCalledWith(42);
    },
  );
});
