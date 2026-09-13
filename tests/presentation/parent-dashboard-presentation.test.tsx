import { createRequire } from 'node:module';

import { createElement, type ReactNode, type SetStateAction } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ParentHomeScreen from '../../app/parent/index';
import { P0_SAFE_EQUIVALENT_TEMPLATE } from '@/features/tasks/demoContent';
import { i18n, localize } from '@/i18n';
import type { LocaleCode } from '@/models/prototype';
import { createResetSourceSession, type ResetSourceState } from '@/services/mock/fixtures';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import {
  enterChildExperienceForTest,
  enterParentExperienceForTest,
  resetPrototypeForTest,
} from '../helpers/prototypeStore';

interface HostProps {
  children?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  testID?: string;
  onPress?: () => void;
  accessibilityState?: { selected?: boolean; checked?: boolean };
}

const rendered = vi.hoisted(() => ({
  controls: new Map<string, HostProps>(),
  ids: [] as string[],
  text: [] as ReactNode[],
  params: {} as { section?: string; added?: string },
  stateSlots: [] as unknown[],
  stateCursor: 0,
  router: { push: vi.fn(), replace: vi.fn() },
}));

function host(tag: 'main' | 'div' | 'span' | 'button', props: HostProps) {
  if (props.testID) {
    rendered.ids.push(props.testID);
    if (props.onPress) rendered.controls.set(props.testID, props);
  }
  if (tag === 'span') rendered.text.push(props.children);
  return createElement(
    tag,
    { 'data-testid': props.testID },
    props.header,
    props.children,
    props.footer,
  );
}

// Persist only local UI state across server renders so actual filter callbacks can be exercised.
// Store commands remain real; this harness does not establish mounted effects or native layout.
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
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
vi.mock('expo-router', () => ({
  useRouter: () => rendered.router,
  useLocalSearchParams: () => rendered.params,
}));
vi.mock('react-native', () => ({
  Platform: { OS: 'web', select: (options: Record<string, unknown>) => options.default },
  StyleSheet: {
    create: <T,>(styles: T) => styles,
    flatten: <T,>(styles: T) => styles,
    hairlineWidth: 1,
  },
  View: (props: HostProps) => host('div', props),
  Pressable: (props: HostProps) => host('button', props),
}));
vi.mock('tamagui', () => ({ YStack: (props: HostProps) => host('div', props) }));
vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
vi.mock('expo-crypto', () => ({ randomUUID: () => 'parent-dashboard-test' }));
vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: i18n.getFixedT(usePrototypeStore.getState().locale) }),
}));
vi.mock('@/config/demoEntry', () => ({ entryMode: 'ordinary' }));
vi.mock('@/config/taskWorkspaceFeatureFlag', () => ({ taskWorkspaceFeatureFlag: false }));
vi.mock('@/config/r002bFeatureFlags', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/config/r002bFeatureFlags')>();
  return { ...original, r002bFeatureFlags: original.DEFAULT_R002B_FEATURE_FLAGS };
});
vi.mock('@/components/access', () => ({ GhafIcon: () => null }));
vi.mock('@/components/botanical', () => ({
  BotanicalPressable: (props: HostProps) => host('button', props),
}));
vi.mock('@/components/illustrations', () => ({ LocalIllustration: () => null }));
vi.mock('@/components/primitives', () => ({
  Button: (props: HostProps) => host('button', props),
  Screen: (props: HostProps) => host('main', props),
  Text: (props: HostProps) => host('span', props),
}));
vi.mock('@/components/family-growth/ParentPatternSummary', () => ({
  ParentPatternSummary: () => null,
}));
vi.mock('@/components/session/ReturningWelcomeDialog', () => ({
  ReturningWelcomeDialog: () => null,
}));
vi.mock('@/components/r002a', async () => ({
  ...(await import('@/components/r002a/parent/ParentLifecycleCard')),
  ...(await import('@/components/r002a/parent/ParentChildrenSection')),
  ...(await import('@/components/r002a/parent/ParentCanopySummaryCard')),
  ...(await import('@/components/r002a/parent/ParentAdjustmentReview')),
  ...(await import('@/components/r002a/parent/ParentTasksView')),
  ...(await import('@/components/r002a/parent/ParentHomeNavigation')),
  R002aScreen: (props: HostProps) => host('main', props),
  ParentHomeHeader: () => null,
  ParentTaskWorkspace: () => null,
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

function renderHome() {
  rendered.controls.clear();
  rendered.ids.length = 0;
  rendered.text.length = 0;
  rendered.stateCursor = 0;
  return renderToStaticMarkup(createElement(ParentHomeScreen));
}

function control(testID: string) {
  expect(rendered.ids.filter((id) => id === testID)).toHaveLength(1);
  const result = rendered.controls.get(testID);
  expect(result?.onPress).toEqual(expect.any(Function));
  return result!;
}

function press(testID: string) {
  control(testID).onPress!();
}

function progress() {
  const state = usePrototypeStore.getState();
  return structuredClone({
    children: state.children,
    landscapes: state.landscapeProgress,
    canopy: state.household.combinedCanopy,
    circle: state.circleGoal,
    recognitionLedger: state.recognitionLedger,
  });
}

async function prepareParent(locale: LocaleCode, lifecycle: ResetSourceState = 'submitted') {
  usePrototypeStore.setState(createResetSourceSession(lifecycle));
  await enterParentExperienceForTest();
  usePrototypeStore.setState({ locale, direction: locale === 'ar' ? 'rtl' : 'ltr' });
  return i18n.getFixedT(locale);
}

beforeEach(() => {
  expect(resetPrototypeForTest().ok).toBe(true);
  rendered.params = {};
  rendered.stateSlots.length = 0;
  vi.stubGlobal('requestAnimationFrame', (callback: (time: number) => void) => {
    callback(0);
    return 1;
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe.each(['ar', 'en'] as const)('Parent dashboard rendered behavior in %s', (locale) => {
  it.each([
    ['submitted', 'parentHome.awaitingReview', 'parentHome.reviewTask'],
    ['retry', 'parentHome.retryRequested', 'parentHome.reviewTask'],
    ['confirmed', 'parentHome.approvalRecorded', 'parentHome.continueRecognition'],
  ] as const)(
    'puts the %s review action before the canopy without awarding progress',
    async (lifecycle, statusKey, actionKey) => {
      const t = await prepareParent(locale, lifecycle);
      const before = progress();
      const journey = structuredClone(usePrototypeStore.getState().journey!);

      renderHome();

      expect(rendered.text).toContain(t(statusKey));
      expect(rendered.text).toContain(localize(journey.task.content.title, locale));
      expect(rendered.text).toContain(localize(journey.task.content.permittedHelp, locale));
      expect(rendered.text).toContain(
        t('childHome.awardAfterConfirmation', { count: journey.task.content.displayedSeedAward }),
      );
      expect(control('parent-primary-action').children).toBe(t(actionKey));
      expect(rendered.ids.indexOf('parent-primary-action')).toBeLessThan(
        rendered.ids.indexOf('family-combined-canopy'),
      );

      press('parent-primary-action');

      expect(rendered.router.push).toHaveBeenCalledExactlyOnceWith('/parent/check-in');
      expect(rendered.router.replace).not.toHaveBeenCalled();
      expect(progress()).toEqual(before);
      expect(usePrototypeStore.getState().journey).toEqual(journey);
    },
  );

  it('selects Alya without hiding Salem’s pending task and keeps create explicitly for Salem', async () => {
    const t = await prepareParent(locale);
    const journey = structuredClone(usePrototypeStore.getState().journey!);
    const before = progress();

    renderHome();
    press('parent-child-child_alya');
    renderHome();

    expect(usePrototypeStore.getState().activeChildId).toBe('child_alya');
    expect(control('parent-child-child_alya').accessibilityState?.selected).toBe(true);
    expect(control('parent-child-child_salem').accessibilityState?.selected).toBe(false);
    expect(rendered.text).toContain(localize(journey.task.content.title, locale));
    expect(rendered.text).toContain(localize(journey.task.content.permittedHelp, locale));
    const names = usePrototypeStore.getState().localFamily.record!.children;
    expect(rendered.text).toContain(
      t('parentHome.alyaSupport', {
        child: names.find((child) => child.id === 'child_alya')!.nickname,
      }),
    );
    expect(control('parent-create-task-button').children).toBe(
      t('parentHome.createTask', {
        child: names.find((child) => child.id === 'child_salem')!.nickname,
      }),
    );

    press('parent-create-task-button');

    expect(usePrototypeStore.getState().activeChildId).toBe('child_salem');
    expect(rendered.router.push).toHaveBeenCalledExactlyOnceWith('/parent/task/new');
    expect(usePrototypeStore.getState().journey).toEqual(journey);
    expect(progress()).toEqual(before);
  });

  it('filters pending tasks by Child and restores the current task through its real action', async () => {
    const t = await prepareParent(locale);
    const before = progress();
    rendered.params = { section: 'tasks', added: usePrototypeStore.getState().journey!.task.id };
    renderHome();
    expect(rendered.ids).not.toContain('parent-current-task');
    expect(rendered.text).toContain(t('r002aTasks.emptyAssignedTitle'));

    press('parent-tasks-primary-action');
    renderHome();
    expect(control('parent-tasks-tab-pending').accessibilityState?.selected).toBe(true);
    expect(rendered.ids).toContain('parent-current-task');
    expect(rendered.ids).not.toContain('parent-task-added-status');

    press('parent-tasks-child-child_alya');
    renderHome();
    expect(control('parent-tasks-child-child_alya').accessibilityState?.checked).toBe(true);
    expect(rendered.ids).not.toContain('parent-current-task');
    expect(rendered.text).toContain(t('r002aTasks.emptyPendingTitle'));

    press('parent-tasks-primary-action');
    renderHome();
    expect(usePrototypeStore.getState().activeChildId).toBe('child_salem');
    expect(control('parent-tasks-tab-pending').accessibilityState?.selected).toBe(true);
    expect(rendered.ids).toContain('parent-current-task');
    expect(rendered.router.push).not.toHaveBeenCalled();
    expect(rendered.router.replace).not.toHaveBeenCalled();
    expect(progress()).toEqual(before);
  });

  it('keeps a matching adjustment review ahead of the canopy and preserves safe-equivalent handoff', async () => {
    const t = await prepareParent(locale, 'assigned');
    await enterChildExperienceForTest();
    expect(usePrototypeStore.getState().requestSmallerTask().ok).toBe(true);
    await enterParentExperienceForTest();
    usePrototypeStore.setState({ locale, direction: locale === 'ar' ? 'rtl' : 'ltr' });
    const before = progress();
    const journey = structuredClone(usePrototypeStore.getState().journey);

    renderHome();

    expect(rendered.ids).not.toContain('parent-primary-action');
    expect(rendered.ids.indexOf('pre-acceptance-parent-review')).toBeGreaterThanOrEqual(0);
    expect(rendered.ids.indexOf('pre-acceptance-parent-review')).toBeLessThan(
      rendered.ids.indexOf('family-combined-canopy'),
    );
    expect(control('resolve-smaller-task-button').children).toBe(t('parentHome.resolveSmaller'));
    expect(control('resolve-safe-equivalent-button').children).toBe(
      t('parentHome.resolveSafeEquivalent'),
    );
    expect(rendered.text).toContain(t('parentHome.childDecisionNext'));
    expect(rendered.text).toContain(
      localize(
        P0_SAFE_EQUIVALENT_TEMPLATE.safety.routeConstraint ??
          P0_SAFE_EQUIVALENT_TEMPLATE.safety.stopAndAskAdult,
        locale,
      ),
    );

    press('resolve-safe-equivalent-button');

    expect(usePrototypeStore.getState().preAcceptanceAdjustment).toMatchObject({
      resolvedKind: 'safe_equivalent',
      status: 'child_decision_required',
    });
    expect(usePrototypeStore.getState().activeExperience).toBe('signed_out');
    expect(rendered.router.replace).toHaveBeenCalledExactlyOnceWith('/access/child');
    expect(usePrototypeStore.getState().journey).toEqual(journey);
    expect(progress()).toEqual(before);
  });

  it('excludes Parent content and actions when a Child opens the route', async () => {
    const t = await prepareParent(locale);
    const title = localize(usePrototypeStore.getState().journey!.task.content.title, locale);
    await enterChildExperienceForTest('child_alya');
    usePrototypeStore.setState({ locale, direction: locale === 'ar' ? 'rtl' : 'ltr' });

    renderHome();

    expect(rendered.ids).toEqual(['parent-home-role-guard']);
    expect(rendered.text).toEqual([t('errors.wrongRole')]);
    expect(rendered.text).not.toContain(title);
    expect(rendered.controls.size).toBe(0);
  });
});
