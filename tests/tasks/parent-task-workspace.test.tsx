import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ParentTaskWorkspace } from '../../src/components/r002a/parent/ParentTaskWorkspace';
import { TASK_TEMPLATES } from '../../src/features/tasks/demoContent';
import { i18n, localize } from '../../src/i18n';

function host({
  children,
  accessibilityLabel,
}: {
  children?: ReactNode;
  accessibilityLabel?: string;
}) {
  return createElement('div', { 'aria-label': accessibilityLabel }, children);
}

vi.mock('react-native', () => ({
  View: host,
  FlatList: ({
    data,
    renderItem,
  }: {
    data: readonly unknown[];
    renderItem: (input: { item: unknown }) => ReactNode;
  }) => createElement('div', null, ...data.map((item) => renderItem({ item }))),
  StyleSheet: { create: (styles: unknown) => styles, hairlineWidth: 1 },
  Platform: {
    OS: 'web',
    select: (options: Record<string, unknown>) => options.web ?? options.default,
  },
  useWindowDimensions: () => ({ width: 390, height: 844 }),
}));
vi.mock('@/components/access', () => ({ GhafIcon: () => null }));
vi.mock('@/components/botanical', () => ({ BotanicalPressable: host }));
vi.mock('@/components/primitives', () => ({ Button: host, Text: host }));

const { renderToStaticMarkup } = createRequire(import.meta.url)('react-dom/server') as {
  renderToStaticMarkup: (node: ReactNode) => string;
};

function source(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(`../../${relativePath}`, import.meta.url)), 'utf8');
}

describe('default-off Parent task workspace candidate', () => {
  it('keeps create outside lifecycle conditions and provides all-children and native rails', () => {
    const route = source('app/parent/index.tsx');
    const workspace = source('src/components/r002a/parent/ParentTaskWorkspace.tsx');
    expect(route).toContain('<ParentTaskWorkspace');
    expect(route).toContain('taskWorkspaceFeatureFlag');
    expect(workspace).toContain('testID="parent-tasks-create-task"');
    expect(workspace).toContain("'all'");
    expect(workspace).toContain('<FlatList');
    expect(workspace).toContain('horizontal');
    expect(workspace).not.toContain('autoPlay');
  });

  it('keeps saved Parent templates out of Child routes and preserves the original task path', () => {
    const child = source('app/child/index.tsx') + source('app/child/task.tsx');
    const composer = source('src/components/family-growth/ParentTaskComposer.tsx');
    expect(child).not.toMatch(/savedTaskTemplate|saved-task-template/u);
    expect(composer).toContain('selectedTemplateId === P0_RECYCLING_TEMPLATE.id');
    expect(composer).toContain('savedTaskTemplates');
  });

  it.each(['ar', 'en'] as const)(
    'labels executable catalog cards accurately in %s',
    async (locale) => {
      await i18n.changeLanguage(locale);
      const markup = renderToStaticMarkup(
        <ParentTaskWorkspace
          activeChildId="child_salem"
          childProfiles={[{ id: 'child_salem', label: 'Salem' }]}
          current={null}
          direction={locale === 'ar' ? 'rtl' : 'ltr'}
          locale={locale}
          onCreateTask={() => undefined}
          onOpenCurrent={() => undefined}
        />,
      );
      const displayed = TASK_TEMPLATES.filter((item) => item.categoryId === 'green_impact');
      expect(displayed.length).toBeGreaterThan(0);
      for (const template of displayed) {
        expect(template.catalogExecution).toBeDefined();
        expect(markup).toContain(`${localize(template.title, locale)}. ${i18n.t('catalog.ready')}`);
      }
      expect(markup).not.toContain(i18n.t('taskWorkspace.previewOnly'));
    },
  );

  it('defaults the independent candidate flag to off', () => {
    const flag = source('src/config/taskWorkspaceFeatureFlag.ts');
    expect(flag).toContain('=== true');
    expect(flag).toContain("=== 'true'");
    expect(flag).not.toMatch(/\?\?\s*true/u);
  });
});
