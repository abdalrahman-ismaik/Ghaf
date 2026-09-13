import { createRequire } from 'node:module';

import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import GardenScreen from '../../app/garden';
import type { GardenLandscapeProps } from '@/components/family-growth/GardenLandscape';
import { i18n } from '@/i18n';
import type { LocaleCode } from '@/models/prototype';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import {
  createCatalogSubmittedStateForTest,
  enterChildExperienceForTest,
  enterParentExperienceForTest,
  resetPrototypeForTest,
  seedPrototypeStateForTest,
  taskPraiseForTest,
} from '../helpers/prototypeStore';

interface HostProps {
  accessibilityLabel?: string;
  children?: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
  testID?: string;
}

const rendered = vi.hoisted(() => ({ landscape: [] as GardenLandscapeProps[] }));

function HostView({ accessibilityLabel, children, footer, header, testID }: HostProps) {
  return (
    <div aria-label={accessibilityLabel} data-testid={testID}>
      {header}
      {children}
      {footer}
    </div>
  );
}

vi.mock('expo-router', () => ({
  Redirect: () => null,
  useLocalSearchParams: () => ({}),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock('expo-crypto', () => ({ randomUUID: () => 'catalog-garden-test' }));
vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: i18n.getFixedT(usePrototypeStore.getState().locale) }),
}));
vi.mock('react-native', () => ({
  Platform: { OS: 'web', select: (options: Record<string, unknown>) => options.default },
  StyleSheet: { create: <T,>(styles: T) => styles, hairlineWidth: 1 },
  View: HostView,
}));
vi.mock('react-native-reanimated', () => ({ useReducedMotion: () => true }));
vi.mock('@/components/access', () => ({ GhafIcon: () => null }));
vi.mock('@/components/LanguageSwitcher', () => ({ LanguageSwitcher: () => null }));
vi.mock('@/components/primitives', () => ({
  PrimaryButton: HostView,
  QuietButton: HostView,
  Text: HostView,
}));
vi.mock('@/components/r002a', () => ({
  ChildBottomNavigation: () => null,
  ChildHomeHeader: () => null,
  ParentHomeHeader: () => null,
  ParentHomeNavigation: () => null,
  R002aScreen: HostView,
}));
vi.mock('@/components/r003', () => ({ R003Status: () => null }));
vi.mock('@/components/r002b/GrowthJourneyScreens', () => ({ GardenChapterModule: () => null }));
vi.mock('@/components/r002b/SharedGrowthScreens', () => ({ SharedGrowthEntryCard: () => null }));
vi.mock('@/features/growth/useR002bGrowthPresentation', () => ({
  useR002bGrowthPresentation: () => ({ ok: false }),
}));
vi.mock('@/config/r002bFeatureFlags', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/config/r002bFeatureFlags')>();
  return { ...original, r002bFeatureFlags: original.DEFAULT_R002B_FEATURE_FLAGS };
});
vi.mock('@/components/family-growth/FamilyCanopy', () => ({ FamilyCanopy: () => null }));
vi.mock('@/components/family-growth/GardenLandscape', () => ({
  GardenLandscape: (props: GardenLandscapeProps) => {
    rendered.landscape.push(props);
    return <HostView accessibilityLabel={props.accessibilityLabel} testID={props.testID} />;
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

function ok<T>(result: { ok: true; data: T } | { ok: false; error: { message: string } }): T {
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

function renderGarden(locale: LocaleCode) {
  usePrototypeStore.getState().setLocale(locale);
  rendered.landscape.length = 0;
  const markup = renderToStaticMarkup(<GardenScreen />);
  expect(rendered.landscape).toHaveLength(1);
  return { markup, props: rendered.landscape[0]! };
}

function recognizeCatalogTask() {
  const journey = usePrototypeStore.getState().journey!;
  ok(
    usePrototypeStore.getState().confirmAndPresentPraise(
      {
        submissionId: journey.submission!.id,
        praise: taskPraiseForTest(),
        neutralObservation: null,
        uncertainty: null,
      },
      {
        actionId: 'catalog-garden-praise',
        source: 'parent_press',
        presentedAt: '2026-09-13T14:00:00.000Z',
      },
    ),
  );
  return ok(
    usePrototypeStore.getState().applyRecognition({
      actionId: 'catalog-garden-recognition',
      source: 'parent_press',
      observedRenderState: 'praise_presented',
      presentationActionId: 'catalog-garden-praise',
    }),
  ).receipt;
}

beforeEach(async () => {
  ok(resetPrototypeForTest());
  await enterParentExperienceForTest();
  seedPrototypeStateForTest(createCatalogSubmittedStateForTest('HR01'));
});

describe.each(['ar', 'en'] as const)('CE1 Garden presentation in %s', (locale) => {
  it('focuses the approved Samar task before confirmation without showing a growth reveal', async () => {
    await enterChildExperienceForTest();

    const { props, markup } = renderGarden(locale);

    expect(props.activeLandscapeId).toBe('samar');
    expect(props.labels.activeTrack).toBe(i18n.getFixedT(locale)('garden.focusTrack'));
    expect(props.accessibilityLabel).toContain(props.tracks.samar.accessibilityLabel);
    expect(props.recognitionReveal).toBeUndefined();
    expect(markup).not.toContain('garden-cause-record');
  });

  it('presents the confirmed HR01 award on Samar with the same accessible landscape meaning', async () => {
    const receipt = recognizeCatalogTask();
    expect(receipt.landscapeGrowth?.landscapeId).toBe('samar');
    await enterChildExperienceForTest();
    const recognitionLedger = structuredClone(usePrototypeStore.getState().recognitionLedger);

    const { props, markup } = renderGarden(locale);
    const t = i18n.getFixedT(locale);
    const nickname = usePrototypeStore
      .getState()
      .localFamily.record!.children.find((child) => child.id === 'child_salem')!.nickname;

    expect(props.activeLandscapeId).toBe('samar');
    expect(props.tracks.samar.name).toBe(t('garden.samar'));
    expect(props.tracks.samar.cumulativeSeeds).toBe(receipt.landscapeGrowth!.seedsAfter);
    expect(props.accessibilityLabel).toBe(
      `${t('catalog.personalLandscape', { child: nickname })}. ${props.tracks.samar.accessibilityLabel}`,
    );
    expect(props.accessibilityLabel).not.toContain(props.tracks.mangrove.accessibilityLabel);
    expect(props.labels.activeTrack).toBe(t('garden.activeTrack'));
    expect(props.recognitionReveal?.sequenceKey).toBe(receipt.recognitionKey);
    expect(props.recognitionReveal?.accessibilityAnnouncement).toContain(t('garden.samar'));
    expect(markup).toContain('garden-cause-record');
    expect(usePrototypeStore.getState().recognitionLedger).toEqual(recognitionLedger);
  });

  it.each(['cleared', 'stale'] as const)(
    'keeps Alya’s landscape and accessible label independent with %s Salem task context',
    async (context) => {
      recognizeCatalogTask();
      const salemJourney = usePrototypeStore.getState().journey;
      const salemCelebration = usePrototypeStore.getState().celebration;
      const alyaProgress = structuredClone(
        usePrototypeStore.getState().landscapeProgressByChild!.child_alya,
      );
      await enterChildExperienceForTest('child_alya');
      expect(usePrototypeStore.getState().journey).toBeNull();
      if (context === 'stale') {
        // Exercise the route's profile guard against a stale previous-profile snapshot.
        usePrototypeStore.setState({ journey: salemJourney, celebration: salemCelebration });
      }

      const { props, markup } = renderGarden(locale);
      const t = i18n.getFixedT(locale);
      const nickname = usePrototypeStore
        .getState()
        .localFamily.record!.children.find((child) => child.id === 'child_alya')!.nickname;

      expect(props.activeLandscapeId).toBe('mangrove');
      expect(props.accessibilityLabel).toBe(
        `${t('catalog.personalLandscape', { child: nickname })}. ${props.tracks.mangrove.accessibilityLabel}`,
      );
      expect(props.tracks.samar.cumulativeSeeds).toBe(alyaProgress.samar.cumulativeSeeds);
      expect(props.tracks.mangrove.cumulativeSeeds).toBe(alyaProgress.mangrove.cumulativeSeeds);
      expect(props.labels.activeTrack).toBe(t('garden.focusTrack'));
      expect(props.recognitionReveal).toBeUndefined();
      expect(markup).not.toContain('garden-cause-record');
      expect(usePrototypeStore.getState().landscapeProgressByChild!.child_alya).toEqual(
        alyaProgress,
      );
    },
  );
});
