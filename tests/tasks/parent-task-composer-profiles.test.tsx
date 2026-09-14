import { createRequire } from 'node:module';

import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ParentTaskComposer } from '@/components/family-growth/ParentTaskComposer';
import { i18n, setI18nLocale } from '@/i18n';
import type { LocalChildProfile } from '@/models/localFamily';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import {
  enterParentExperienceForTest,
  resetAlteredFamilyFixtureForTest,
} from '../helpers/prototypeStore';

interface ControlProps {
  children?: ReactNode;
  testID?: string;
  disabled?: boolean;
  accessibilityState?: { checked?: boolean; disabled?: boolean };
  onPress?: () => void;
}

const rendered = vi.hoisted(() => ({ controls: new Map<string, ControlProps>() }));

vi.mock('react-native', () => ({
  Platform: { OS: 'web', select: (options: Record<string, unknown>) => options.default },
  StyleSheet: { create: <T,>(styles: T) => styles },
  View: ({ children }: ControlProps) => createElement('div', null, children),
  Pressable: (props: ControlProps) => {
    if (props.testID) rendered.controls.set(props.testID, props);
    return createElement('button', { disabled: props.disabled }, props.children);
  },
}));
vi.mock('expo-crypto', () => ({ randomUUID: () => 'prepared-composer-test' }));
vi.mock('@/components/access', () => ({ GhafIcon: () => null }));
vi.mock('@/components/AssistantIdentity', () => ({ AssistantIdentity: () => null }));
vi.mock('@/components/primitives', () => ({
  Text: ({ children }: ControlProps) => createElement('span', null, children),
  Button: ({ children }: ControlProps) => createElement('button', null, children),
  Input: () => null,
}));
vi.mock('@/components/r002a', () => ({
  R002aScreen: ({ children, footer }: ControlProps & { footer: ReactNode }) =>
    createElement('main', null, children, footer),
  R002aFlowHeader: () => null,
  TaskStepIndicator: () => null,
  TaskBuilderFooter: (props: ControlProps) => {
    if (props.testID) rendered.controls.set(props.testID, props);
    return null;
  },
}));
vi.mock('@/config/taskWorkspaceFeatureFlag', () => ({ taskWorkspaceFeatureFlag: false }));
vi.mock('@/state/usePrototypeStore', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/state/usePrototypeStore')>();
  return {
    ...original,
    usePrototypeStore: Object.assign(
      (selector: (state: ReturnType<typeof original.usePrototypeStore.getState>) => unknown) =>
        selector(original.usePrototypeStore.getState()),
      original.usePrototypeStore,
    ),
  };
});

const { renderToStaticMarkup } = createRequire(import.meta.url)('react-dom/server') as {
  renderToStaticMarkup: (element: ReactNode) => string;
};

function configureProfiles(profiles: readonly Partial<LocalChildProfile>[]) {
  const localFamily = usePrototypeStore.getState().localFamily;
  if (!localFamily.record) throw new Error('Expected configured family');
  const record = localFamily.record;
  const children = profiles.map((profile, index) => {
    const original = record.children[index];
    if (!original) throw new Error('Expected configured Child slot');
    return { ...original, ...profile, personalizationEnabled: false };
  });
  usePrototypeStore.setState({
    localFamily: {
      ...localFamily,
      configuredChildIds: children.map((child) => child.id),
      record: { ...localFamily.record, children },
    },
  });
}

function renderComposer() {
  rendered.controls.clear();
  return renderToStaticMarkup(
    createElement(ParentTaskComposer, { onBack: vi.fn(), onReadyForReview: vi.fn() }),
  );
}

function childChoices() {
  return [...rendered.controls.entries()].filter(([id]) => id.startsWith('task-child-'));
}

describe('Task Builder configured Child choices', () => {
  beforeEach(async () => {
    expect(resetAlteredFamilyFixtureForTest().ok).toBe(true);
    await enterParentExperienceForTest();
  });

  it.each(['ar', 'en'] as const)(
    'shows only the configured Child with their current nickname and age band in %s',
    async (locale) => {
      await setI18nLocale(locale);
      usePrototypeStore.setState({ locale, direction: locale === 'ar' ? 'rtl' : 'ltr' });
      configureProfiles([{ nickname: 'نور Noor', ageBand: '6_8' }]);

      const markup = renderComposer();

      expect(childChoices().map(([id]) => id)).toEqual(['task-child-salem']);
      expect(markup).toContain('نور Noor');
      expect(markup).toContain(i18n.t('access.setup.ageBand'));
      expect(markup).toContain(i18n.t('access.setup.ageSixEight'));
      expect(markup).toContain(`\u2066${i18n.t('access.setup.ageSixEight')}\u2069`);
      expect(markup).not.toContain(i18n.t('role.chooseSalem'));
      expect(markup).not.toContain(i18n.t('role.chooseAlya'));
      expect(rendered.controls.get('task-child-salem')?.accessibilityState?.checked).toBe(true);
      expect(rendered.controls.get('task-builder-continue')?.disabled).toBe(false);
    },
  );

  it.each(['ar', 'en'] as const)(
    'uses both renamed profiles and preserves the active second Child selection in %s',
    async (locale) => {
      await setI18nLocale(locale);
      usePrototypeStore.setState({ locale, direction: locale === 'ar' ? 'rtl' : 'ltr' });
      configureProfiles([
        { nickname: 'زيد Zayd', ageBand: '6_8' },
        { nickname: 'مريم Maryam', ageBand: '12_14' },
      ]);
      expect(usePrototypeStore.getState().setActiveChild('child_alya').ok).toBe(true);

      const markup = renderComposer();

      expect(childChoices().map(([id]) => id)).toEqual(['task-child-salem', 'task-child-alya']);
      expect(markup).toContain('زيد Zayd');
      expect(markup).toContain('مريم Maryam');
      expect(markup).toContain(i18n.t('access.setup.ageSixEight'));
      expect(markup).toContain(i18n.t('access.setup.ageTwelveFourteen'));
      expect(markup).toContain(`\u2066${i18n.t('access.setup.ageTwelveFourteen')}\u2069`);
      expect(rendered.controls.get('task-child-salem')?.accessibilityState?.checked).toBe(false);
      expect(rendered.controls.get('task-child-alya')?.accessibilityState?.checked).toBe(true);
      expect(rendered.controls.get('task-builder-continue')?.disabled).toBe(true);
      expect(usePrototypeStore.getState().journey).toBeNull();
    },
  );

  it('does not invent configured profiles or enable the canonical task without a family', () => {
    usePrototypeStore.setState({
      localFamily: {
        ...usePrototypeStore.getState().localFamily,
        status: 'unavailable',
        record: null,
        configuredChildIds: [],
      },
    });

    renderComposer();

    expect(childChoices()).toHaveLength(0);
    expect(rendered.controls.get('task-builder-continue')?.disabled).toBe(true);
    expect(usePrototypeStore.getState().journey).toBeNull();
  });

  it('does not treat an excluded profile as selected even when its record and active ID remain', () => {
    const localFamily = usePrototypeStore.getState().localFamily;
    usePrototypeStore.setState({
      activeChildId: 'child_salem',
      localFamily: { ...localFamily, configuredChildIds: ['child_alya'] },
    });

    renderComposer();

    expect(childChoices().map(([id]) => id)).toEqual(['task-child-alya']);
    expect(rendered.controls.get('task-child-alya')?.accessibilityState?.checked).toBe(false);
    expect(rendered.controls.get('task-builder-continue')?.disabled).toBe(true);
    expect(usePrototypeStore.getState().journey).toBeNull();
  });
});
