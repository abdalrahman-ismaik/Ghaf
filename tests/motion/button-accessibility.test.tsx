import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Button, type ButtonProps } from '@/components/primitives';

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useState: (initial: unknown) => [initial, vi.fn()],
}));
vi.mock('react-native', () => ({
  ActivityIndicator: 'ActivityIndicator',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  Platform: {
    OS: 'android',
    select: (values: Record<string, unknown>) => values.android ?? values.default,
  },
  Pressable: 'Pressable',
  ScrollView: 'ScrollView',
  StyleSheet: { create: (styles: unknown) => styles },
  Text: 'NativeText',
  TextInput: 'NativeTextInput',
  View: 'View',
}));
vi.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
vi.mock('tamagui', () => ({ Text: 'TamaguiText', View: 'TamaguiView' }));
vi.mock('@/components/botanical', () => ({ BotanicalPressable: 'BotanicalPressable' }));
vi.mock('@/state/usePrototypeStore', () => ({
  usePrototypeStore: (selector: (state: { direction: string }) => unknown) =>
    selector({ direction: 'rtl' }),
}));

function render(props: ButtonProps) {
  return Button(props).props;
}

describe('native button accessible names', () => {
  it.each([
    ['Sign in', 'Signing in'],
    ['تسجيل الدخول', 'جارٍ تسجيل الدخول'],
  ])('replaces the busy accessible name with the idle label %s', (label, busyLabel) => {
    const props = { children: label, busyLabel };
    expect(render(props)).toMatchObject({
      accessibilityLabel: label,
      accessibilityRole: 'button',
      accessibilityState: { busy: false, disabled: false },
    });
    expect(render({ ...props, busy: true })).toMatchObject({
      accessibilityLabel: busyLabel,
      'aria-busy': true,
      accessibilityState: { busy: true, disabled: true },
      disabled: true,
    });
    expect(render({ ...props, busy: false })).toMatchObject({
      accessibilityLabel: label,
      'aria-busy': false,
      accessibilityState: { busy: false, disabled: false },
      disabled: false,
    });
  });

  it('keeps a supplied native label throughout the busy transition', () => {
    const props = { children: 'Save', busyLabel: 'Saving', accessibilityLabel: 'Save family name' };
    for (const busy of [false, true, false]) {
      expect(render({ ...props, busy }).accessibilityLabel).toBe('Save family name');
    }
  });

  it('preserves aria-label precedence used by the installed native Pressable', () => {
    const host = render({
      children: 'Save',
      busy: true,
      busyLabel: 'Saving',
      accessibilityLabel: 'Native override',
      'aria-label': 'Accessible override',
    });
    expect(host).toMatchObject({
      accessibilityLabel: 'Accessible override',
      'aria-label': 'Accessible override',
    });
  });

  it('retains caller radio semantics, checked state and disabled behavior', () => {
    const props: ButtonProps = {
      children: 'English',
      accessibilityRole: 'radio',
      accessibilityState: { checked: true },
    };
    expect(render(props)).toMatchObject({
      accessibilityLabel: 'English',
      accessibilityRole: 'radio',
      accessibilityState: { checked: true, busy: false, disabled: false },
    });
    expect(render({ ...props, disabled: true })).toMatchObject({
      accessibilityRole: 'radio',
      accessibilityState: { checked: true, busy: false, disabled: true },
      disabled: true,
    });
  });

  it('keeps the idle name when no busy label is supplied and preserves press handling', () => {
    const onPress = vi.fn();
    const host = render({ children: 'Save', busy: true, onPress });
    expect(host.accessibilityLabel).toBe('Save');
    expect(host.onPress).toBe(onPress);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('leaves non-string content naming to its children or explicit caller label', () => {
    const children = createElement('NamedContent');
    expect(render({ children }).accessibilityLabel).toBeUndefined();
    expect(render({ children, accessibilityLabel: 'Named control' }).accessibilityLabel).toBe(
      'Named control',
    );
  });
});
