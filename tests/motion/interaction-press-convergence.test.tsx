import { createRequire } from 'node:module';

import { describe, expect, it, vi } from 'vitest';

import { IconButton, type IconButtonProps } from '@/components/primitives';

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

const require_ = createRequire(import.meta.url);
const read = (path: string) => require_('node:fs').readFileSync(path, 'utf8') as string;

function render(props: IconButtonProps) {
  return IconButton(props);
}

function flatStyle(value: unknown): Record<string, unknown> {
  if (Array.isArray(value)) return Object.assign({}, ...value.map(flatStyle));
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

// Source assertions record the shared contract; the rendered checks cover the props that
// accessibility and cancellation depend on. Neither measures native frame behavior.
describe('shared press feedback convergence', () => {
  it('routes the icon control through the shared pressable without losing its press contract', () => {
    const element = render({ icon: null, label: 'إغلاق' });

    expect(element.type).toBe('BotanicalPressable');
    expect(element.props).toMatchObject({
      accessibilityLabel: 'إغلاق',
      accessibilityRole: 'button',
      accessibilityState: { disabled: false },
    });
    expect(element.props.hitSlop).toBeDefined();
    expect(element.props.pressRetentionOffset).toBeDefined();
    // A style function would bypass the shared pressable's own interaction state.
    expect(typeof element.props.style).not.toBe('function');
  });

  it('stops stacking a second opacity under the shared scale on an enabled control', () => {
    const enabled = flatStyle(render({ icon: null, label: 'Close' }).props.style);
    const disabled = flatStyle(render({ disabled: true, icon: null, label: 'Close' }).props.style);

    expect(enabled.opacity).toBeUndefined();
    expect(disabled.opacity).toBeDefined();
    expect(render({ disabled: true, icon: null, label: 'Close' }).props).toMatchObject({
      accessibilityState: { disabled: true },
      disabled: true,
    });
  });

  it('gives both bottom navigations and the checklist one press treatment', () => {
    const files = [
      'src/components/r002a/parent/ParentHomeNavigation.tsx',
      'src/components/r002a/child/ChildBottomNavigation.tsx',
      'src/components/r002a/child/ChildTaskChecklist.tsx',
    ];

    for (const path of files) {
      const contents = read(path);
      expect(contents, path).toContain(
        "import { BotanicalPressable as Pressable } from '@/components/botanical'",
      );
      expect(contents, path).not.toContain('opacity.pressed');
      expect(contents, path).not.toMatch(/pressed\s*\?\s*styles\.pressed/u);
      expect(contents, path).not.toMatch(/pressed:\s*\{/u);
    }
  });

  it('keeps the disabled and selected tab states readable without press styling', () => {
    const parent = read('src/components/r002a/parent/ParentHomeNavigation.tsx');
    const child = read('src/components/r002a/child/ChildBottomNavigation.tsx');
    const primitives = read('src/components/primitives.tsx');

    expect(parent).toContain('accessibilityRole="tab"');
    expect(parent).toContain('accessibilityState={{ selected: active }}');
    expect(child).toContain('accessibilityState={{ disabled: item.disabled, selected: active }}');
    expect(child).toMatch(/disabled:\s*\{\s*opacity:\s*0\.72/u);
    // The selected tab keeps an immediate, high-contrast pill; a fading dark indicator
    // would place its label on a partly faded background during the change.
    expect(parent).toMatch(/activeItem:\s*\{\s*backgroundColor:\s*botanical\.colors\.sage/u);
    expect(child).toMatch(/activeItem:\s*\{\s*backgroundColor:\s*botanical\.colors\.forest/u);
    expect(primitives).not.toMatch(/brandPressed:\s*\{/u);
  });
});
