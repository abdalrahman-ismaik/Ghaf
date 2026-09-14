import { createRequire } from 'node:module';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import MemoryRoute from '../../app/garden/memories';
import { i18n, setI18nLocale } from '../../src/i18n';
import { createResetSourceSession } from '../../src/services/mock/fixtures';
import { usePrototypeStore } from '../../src/state/usePrototypeStore';
import {
  enterChildExperienceForTest,
  enterParentExperienceForTest,
  resetPrototypeForTest,
  seedPrototypeStateForTest,
} from '../helpers/prototypeStore';

interface Props {
  children?: ReactNode;
  header?: ReactNode;
  testID?: string;
  onPress?: () => void;
  onBack?: () => void;
  title?: string;
  direction?: string;
}
const controls = vi.hoisted(() => ({
  buttons: new Map<string, Props>(),
  header: null as Props | null,
  replace: vi.fn(),
}));
function Host(props: Props) {
  return createElement(
    'div',
    { 'data-testid': props.testID, dir: props.direction },
    props.header,
    props.children,
  );
}
vi.mock('react-native', () => ({
  Platform: { OS: 'web', select: (values: Record<string, unknown>) => values.default },
  View: Host,
  StyleSheet: { create: <T,>(value: T) => value },
}));
vi.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => createElement('span', null, `redirect:${href}`),
  useRouter: () => ({ replace: controls.replace }),
}));
vi.mock('@/components/access', () => ({ GhafIcon: () => null }));
vi.mock('@/components/primitives', () => ({
  Text: Host,
  Button: (props: Props) => {
    if (props.testID) controls.buttons.set(props.testID, props);
    return Host(props);
  },
}));
vi.mock('@/components/r002a', () => ({
  R002aScreen: Host,
  R002aFlowHeader: (props: Props) => {
    controls.header = props;
    return createElement('h1', null, props.title);
  },
}));
vi.mock('react-i18next', async (originalImport) => ({
  ...(await originalImport<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: i18n.getFixedT(usePrototypeStore.getState().locale) }),
}));
vi.mock('@/state/usePrototypeStore', async (originalImport) => {
  const original = await originalImport<typeof import('@/state/usePrototypeStore')>();
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
  renderToStaticMarkup: (node: ReactNode) => string;
};
function render() {
  controls.buttons.clear();
  return renderToStaticMarkup(createElement(MemoryRoute));
}

beforeEach(async () => {
  expect(resetPrototypeForTest().ok).toBe(true);
  await enterParentExperienceForTest();
  controls.replace.mockClear();
});

describe('Garden family memory destination', () => {
  it.each(['ar', 'en'] as const)(
    'exposes the approved save operation and stored leaf in %s',
    async (locale) => {
      seedPrototypeStateForTest(createResetSourceSession('recognized'));
      await setI18nLocale(locale);
      usePrototypeStore.setState({ locale, direction: locale === 'ar' ? 'rtl' : 'ltr' });
      const initial = render();
      expect(initial).toContain(i18n.t('memories.title'));
      expect(initial).toContain(`dir="${locale === 'ar' ? 'rtl' : 'ltr'}"`);
      expect(controls.buttons.has('memory-save')).toBe(true);
      controls.buttons.get('memory-save')!.onPress!();
      expect(usePrototypeStore.getState().getFamilyMemories()).toMatchObject({
        ok: true,
        data: [expect.objectContaining({ childId: 'child_salem' })],
      });
      const updated = render();
      expect(updated).toContain('data-testid="memory-leaf"');
      expect(controls.buttons.has('memory-delete')).toBe(true);
      expect(updated).toContain(i18n.t('memories.local'));
      controls.header!.onBack!();
      expect(controls.replace).toHaveBeenCalledWith('/garden');
    },
  );

  it('denies signed-out entry and hides Parent mutations and sibling memories from Children', async () => {
    seedPrototypeStateForTest(createResetSourceSession('recognized'));
    expect(usePrototypeStore.getState().saveFamilyMemory().ok).toBe(true);
    await enterChildExperienceForTest('child_alya');
    const siblingView = render();
    expect(siblingView).not.toContain('data-testid="memory-leaf"');
    expect(controls.buttons.has('memory-save')).toBe(false);
    expect(controls.buttons.has('memory-delete')).toBe(false);
    await enterChildExperienceForTest('child_salem');
    expect(render()).toContain('data-testid="memory-leaf"');
    expect(usePrototypeStore.getState().signOutExperience().ok).toBe(true);
    expect(render()).toContain('redirect:/');
  });
});
