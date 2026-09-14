import { createRequire } from 'node:module';

import { createElement, type ComponentProps, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import PrivateLeagueRoute from '../../app/league';
import type { ChildHomeHeader } from '@/components/r002a/child/ChildHomeHeader';
import type { PrivateLeagueScreen } from '@/components/r002b/PrivateLeagueScreen';
import { i18n, localize } from '@/i18n';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import {
  enterChildExperienceForTest,
  resetAlteredFamilyFixtureForTest,
} from '../helpers/prototypeStore';

interface HostProps {
  children?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}

const captured = vi.hoisted(() => ({
  header: null as ComponentProps<typeof ChildHomeHeader> | null,
  league: null as ComponentProps<typeof PrivateLeagueScreen> | null,
}));

function host(props: HostProps) {
  return createElement('div', null, props.header, props.children, props.footer);
}

vi.mock('expo-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  Redirect: () => null,
}));
vi.mock('react-native', () => ({
  Platform: { OS: 'web', select: (options: Record<string, unknown>) => options.default },
  StyleSheet: { create: <T,>(styles: T) => styles },
  View: host,
}));
vi.mock('expo-crypto', () => ({ randomUUID: () => 'league-header-test' }));
vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: i18n.getFixedT(usePrototypeStore.getState().locale) }),
}));
vi.mock('@/config/demoEntry', () => ({ entryMode: 'ordinary' }));
vi.mock('@/components/access', () => ({ GhafIcon: () => null }));
vi.mock('@/components/primitives', () => ({ QuietButton: host, Text: host }));
vi.mock('@/components/r002a', () => ({
  R002aScreen: host,
  ChildBottomNavigation: () => null,
  ChildHomeHeader: (props: ComponentProps<typeof ChildHomeHeader>) => {
    captured.header = props;
    return null;
  },
}));
vi.mock('@/components/r002b/PrivateLeagueScreen', () => ({
  PrivateLeagueScreen: (props: ComponentProps<typeof PrivateLeagueScreen>) => {
    captured.league = props;
    return null;
  },
}));
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

function renderLeague() {
  captured.header = null;
  captured.league = null;
  renderToStaticMarkup(createElement(PrivateLeagueRoute));
}

beforeEach(() => {
  expect(resetAlteredFamilyFixtureForTest().ok).toBe(true);
});

describe.each(['ar', 'en'] as const)('League profile identity in %s', (locale) => {
  it.each(['child_salem', 'child_alya'] as const)(
    'uses only %s’s local header identity without changing shared rows',
    async (childId) => {
      await enterChildExperienceForTest(childId);
      usePrototypeStore.setState({ locale, direction: locale === 'ar' ? 'rtl' : 'ltr' });
      renderLeague();
      const sharedRows = structuredClone(captured.league!.participants);
      const state = usePrototypeStore.getState();
      const record = state.localFamily.record!;
      const nickname = locale === 'ar' ? 'اسم الطفل المحلي' : 'Local Child Name';

      usePrototypeStore.setState({
        localFamily: {
          ...state.localFamily,
          record: {
            ...record,
            children: record.children.map((child) =>
              child.id === childId
                ? { ...child, nickname, avatarId: 'flower' as const }
                : { ...child, nickname: 'PRIVATE SIBLING', avatarId: 'ghaf_tree' as const },
            ),
          },
        },
      });
      renderLeague();

      expect(captured.header).toMatchObject({ avatarId: 'flower', avatarLabel: nickname });
      expect(captured.league!.participants).toEqual(sharedRows);
      expect(JSON.stringify(captured.league)).not.toContain(nickname);
      expect(JSON.stringify(captured.league)).not.toContain('PRIVATE SIBLING');
      expect(usePrototypeStore.getState().privateLeague).toBe(state.privateLeague);
    },
  );

  it('uses the active fixture name when no matching local profile exists', async () => {
    await enterChildExperienceForTest('child_alya');
    const state = usePrototypeStore.getState();
    const record = state.localFamily.record!;
    usePrototypeStore.setState({
      locale,
      direction: locale === 'ar' ? 'rtl' : 'ltr',
      localFamily: {
        ...state.localFamily,
        record: {
          ...record,
          children: record.children.filter((child) => child.id !== 'child_alya'),
        },
      },
    });
    renderLeague();

    expect(captured.header?.avatarLabel).toBe(
      localize(state.children.child_alya.displayName, locale),
    );
    expect(captured.header?.avatarId).toBeUndefined();
  });
});
