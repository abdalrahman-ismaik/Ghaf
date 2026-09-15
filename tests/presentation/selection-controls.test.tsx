import { createRequire } from 'node:module';

import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { EmptyState } from '@/components/botanical/EmptyState';
import { SelectionChip } from '@/components/botanical/SelectionChip';
import { botanical } from '@/design/tokens';

vi.mock('react-native', () => ({
  Platform: {
    OS: 'android',
    select: (values: Record<string, unknown>) => values.android ?? values.default,
  },
  StyleSheet: { create: (styles: unknown) => styles },
  View: 'View',
}));
vi.mock('@/components/botanical/BotanicalPressable', () => ({
  BotanicalPressable: 'BotanicalPressable',
}));
vi.mock('@/components/primitives', () => ({ Text: 'Text' }));
vi.mock('@/components/access', () => ({ GhafIcon: 'GhafIcon' }));

const require_ = createRequire(import.meta.url);
const read = (path: string) => require_('node:fs').readFileSync(path, 'utf8') as string;

function flatStyle(value: unknown): Record<string, unknown> {
  if (Array.isArray(value)) return Object.assign({}, ...value.map(flatStyle));
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function descendants(node: ReactNode): ReactElement<Record<string, unknown>>[] {
  if (Array.isArray(node)) return node.flatMap(descendants);
  if (!isValidElement<Record<string, unknown>>(node)) return [];
  return [node, ...descendants(node.props.children as ReactNode)];
}

function chip(update: Partial<Parameters<typeof SelectionChip>[0]> = {}) {
  return SelectionChip({
    direction: 'rtl',
    label: 'الحالية',
    onPress: () => undefined,
    role: 'radio',
    selected: false,
    ...update,
  });
}

// Prop and style assertions for the shared selection surface. Contrast ratios and
// rendered Android appearance are separate device checks.
describe('shared selection chip', () => {
  it('keeps an unselected option visibly a control rather than plain text', () => {
    const idle = flatStyle(chip().props.style);

    expect(idle.borderWidth).toBe(1);
    expect(idle.borderColor).toBe(botanical.colors.line);
    expect(idle.backgroundColor).toBe(botanical.colors.paper);
    expect(idle.minHeight).toBe(48);
  });

  it('marks the selected option with one light surface in every row', () => {
    const selected = flatStyle(chip({ selected: true }).props.style);

    expect(selected.backgroundColor).toBe(botanical.colors.sage);
    expect(selected.borderColor).toBe(botanical.colors.sageStrong);
    // A dark fill under a light label cannot change state gradually without dropping
    // the label's contrast partway through, so selection stays light on light.
    expect(selected.backgroundColor).not.toBe(botanical.colors.forest);
  });

  it('announces a single choice as a radio and a list filter as a tab', () => {
    expect(chip({ role: 'radio', selected: true }).props).toMatchObject({
      accessibilityRole: 'radio',
      accessibilityState: { checked: true, disabled: false },
      'aria-checked': true,
    });
    expect(chip({ role: 'tab', selected: false }).props).toMatchObject({
      accessibilityRole: 'tab',
      accessibilityState: { selected: false, disabled: false },
      'aria-selected': false,
    });
  });

  it('carries the label as the accessible name and lets a caller override it', () => {
    expect(chip().props.accessibilityLabel).toBe('الحالية');
    expect(chip({ accessibilityLabel: 'تصفية الحالية' }).props.accessibilityLabel).toBe(
      'تصفية الحالية',
    );
    const label = descendants(chip()).find((node) => node.type === 'Text');
    expect(label?.props.children).toBe('الحالية');
  });

  it('shares a narrow row as equal segments and hugs its label otherwise', () => {
    expect(flatStyle(chip({ fill: true }).props.style).flex).toBe(1);
    expect(flatStyle(chip().props.style).flex).toBeUndefined();
    expect(flatStyle(chip().props.style).minWidth).toBe(48);
  });

  it('reports a disabled option to assistive technology and to touch', () => {
    const disabled = chip({ disabled: true });

    expect(disabled.props.disabled).toBe(true);
    expect(disabled.props.accessibilityState).toMatchObject({ disabled: true });
    expect(flatStyle(disabled.props.style).opacity).toBeDefined();
  });
});

describe('shared empty state', () => {
  it('gives an empty section one accessible shape instead of a bare sentence', () => {
    const empty = EmptyState({
      direction: 'rtl',
      message: 'لا توجد مهام في هذا القسم لهذا الطفل بعد.',
      testID: 'catalog-empty',
    });

    expect(empty.props.accessible).toBe(true);
    expect(empty.props.accessibilityLabel).toBe('لا توجد مهام في هذا القسم لهذا الطفل بعد.');
    expect(empty.props.testID).toBe('catalog-empty');
    expect(descendants(empty).some((node) => node.type === 'GhafIcon')).toBe(true);
    expect(
      descendants(empty).some(
        (node) =>
          node.type === 'Text' &&
          node.props.children === 'لا توجد مهام في هذا القسم لهذا الطفل بعد.',
      ),
    ).toBe(true);
  });

  it('joins an optional title into the single accessible name', () => {
    const empty = EmptyState({ direction: 'ltr', message: 'Nothing yet.', title: 'No tasks' });

    expect(empty.props.accessibilityLabel).toBe('No tasks. Nothing yet.');
  });
});

describe('selection surfaces across the Parent journey', () => {
  it('uses the shared chip for every adjacent filter row rather than a local style', () => {
    const parentHome = read('app/parent/index.tsx');
    const workspace = read('src/components/r002a/parent/ParentTaskWorkspace.tsx');
    const ambience = read('src/components/settings/AmbientSoundSetting.tsx');

    for (const [path, contents] of [
      ['app/parent/index.tsx', parentHome],
      ['src/components/r002a/parent/ParentTaskWorkspace.tsx', workspace],
      ['src/components/settings/AmbientSoundSetting.tsx', ambience],
    ] as const) {
      expect(contents, path).toContain('<SelectionChip');
    }
    // The previous local treatments are gone, so two adjacent rows cannot drift apart again.
    expect(parentHome).not.toContain('childFilterItemActive');
    expect(parentHome).not.toContain('taskTabActive');
    expect(workspace).not.toContain('filterChipSelected');
    expect(ambience).not.toContain(
      "variant={preference.volume === volume ? 'primary' : 'secondary'}",
    );
  });

  it('keeps the filter rows as rows without a second container or underline', () => {
    const parentHome = read('app/parent/index.tsx');

    expect(parentHome).not.toMatch(/taskTabs:\s*\{[\s\S]*?borderBottomWidth/u);
    expect(parentHome).not.toMatch(/childFilter:\s*\{[\s\S]*?backgroundColor/u);
    expect(parentHome).toContain('accessibilityRole="radiogroup"');
    expect(parentHome).toContain('accessibilityRole="tablist"');
  });

  it('shows the designed empty section in the task history list', () => {
    const catalog = read('src/components/catalog/CatalogTaskList.tsx');

    expect(catalog).toContain('<EmptyState');
    expect(catalog).toContain('testID="catalog-empty"');
    expect(catalog).toContain("t(filter ? 'catalog.emptySection' : 'catalog.empty')");
  });

  it('centers a compact language switcher around its own options', () => {
    const switcher = read('src/components/LanguageSwitcher.tsx');

    expect(switcher).toMatch(/compactWrapper:\s*\{\s*width:\s*'auto',\s*alignSelf:\s*'center'/u);
  });
});
