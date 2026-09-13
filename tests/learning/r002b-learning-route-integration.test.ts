import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ImpactPathRoute from '../../app/garden/impact-path';
import BadgeDetailRoute from '../../app/garden/badges/[badgeId]';
import LearningStoryRoute from '../../app/garden/learn/[learningId]/story';
import AccessibleLearningRoute from '../../app/garden/learn/[learningId]/accessible';
import { resolveR002bFeatureFlags } from '@/config/r002bFeatureFlags';
import type { GrowthJourneyPresentationActions } from '@/features/growth/r002bViewModel';
import { projectRecognitionSeedEntry } from '@/features/growth/seedLedger';
import {
  MANGROVE_ROOTS_LEARNING_PACKAGE,
  createMangroveLearningState,
  createMangroveReturnIntent,
  startMangroveLearningRoute,
} from '@/features/learning/mangroveLearning';
import { createR002bLearningBackHandler } from '@/features/learning/r002bLearningNavigation';
import { guardR002bRoute } from '@/features/navigation/r002bRouteGuard';
import { SCHEMA3_R002A_FIXTURE_VERSION } from '@/models/growthJourney';
import type { LearningOrigin } from '@/models/learning';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import { enterChildExperienceForTest, resetPrototypeForTest } from '../helpers/prototypeStore';

const routeHarness = vi.hoisted(() => ({
  params: {} as Record<string, string>,
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  presentation: vi.fn(),
}));

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useRef: <T>(current: T) => ({ current }),
}));
vi.mock('expo-router', () => ({
  Redirect: () => null,
  useLocalSearchParams: () => routeHarness.params,
  useRouter: () => ({
    push: routeHarness.push,
    replace: routeHarness.replace,
    back: routeHarness.back,
    canGoBack: () => false,
  }),
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/config/r002bFeatureFlags', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/config/r002bFeatureFlags')>();
  return {
    ...original,
    r002bFeatureFlags: original.resolveR002bFeatureFlags({
      r002b_impact_path_ui: true,
      r002b_badges_ui: true,
      r002b_learning_ui: true,
    }),
  };
});
vi.mock('@/components/r002b/R002bNestedScreen', () => ({
  R002bNestedScreen: () => null,
  R002bUnavailableState: () => null,
}));
vi.mock('@/components/r002b/GrowthJourneyScreens', () => ({
  ImpactPathScreen: () => null,
  BadgeDetail: () => null,
}));
vi.mock('@/components/r002b/LearningScreens', () => ({
  MangroveStoryScreen: () => null,
  AccessibleLearningScreen: () => null,
}));
vi.mock('@/features/learning/useR002bLearningPresentation', () => ({
  useR002bLearningPresentation: (input: { route: 'story' | 'accessible' }) => ({
    ok: true,
    state: usePrototypeStore.getState().mangroveLearningByProfile.child_salem,
    data: { kind: input.route, props: { reducedMotion: true } },
  }),
}));
vi.mock('@/features/growth/useR002bGrowthPresentation', () => ({
  useR002bGrowthPresentation: (input: unknown) => {
    routeHarness.presentation(input);
    return { ok: false };
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

const root = fileURLToPath(new URL('../../', import.meta.url));
const learningId = 'learning.mangrove_roots.v1' as const;
const profileId = 'child_salem' as const;
const profileEpochId = 'reset-epoch-001';

const routeFiles = {
  story: 'app/garden/learn/[learningId]/story.tsx',
  accessible: 'app/garden/learn/[learningId]/accessible.tsx',
} as const;

function source(path: string): string {
  return existsSync(`${root}${path}`) ? readFileSync(`${root}${path}`, 'utf8') : '';
}

function adapterSources(): string {
  const directory = `${root}src/features/learning`;
  if (!existsSync(directory)) return '';

  return readdirSync(directory)
    .filter(
      (name) => name !== 'mangroveLearning.ts' && (name.endsWith('.ts') || name.endsWith('.tsx')),
    )
    .sort()
    .map((name) => source(`src/features/learning/${name}`))
    .join('\n');
}

function integratedLearningSource(): string {
  return [
    source(routeFiles.story),
    source(routeFiles.accessible),
    source('app/garden/impact-path.tsx'),
    source('app/garden/badges/[badgeId].tsx'),
    adapterSources(),
  ].join('\n');
}

const impactPathOrigin: LearningOrigin = {
  kind: 'impact_path',
  route: '/garden/impact-path',
  profileId,
  focusTargetId: 'impact-path-learning-station-132',
  scrollOffset: 0,
};

const mangroveBadgeId = 'badge.habitat.mangrove_care.v1';

function openEntrySurface(kind: 'impact_path' | 'badge_detail') {
  routeHarness.params = {
    profileId,
    originProfileId: profileId,
    ...(kind === 'impact_path'
      ? { originId: 'child_garden_path_card' }
      : {
          badgeId: mangroveBadgeId,
          originId: 'badge_gallery_badge_card',
          originEntityId: mangroveBadgeId,
          originFilter: 'in_progress',
          originScrollOffset: '90',
        }),
  };
  const authorized = kind === 'impact_path' ? ImpactPathRoute() : BadgeDetailRoute();
  const renderAuthorized = authorized.type as (props: unknown) => ReactElement<{
    scrollProps: {
      onScroll: (event: { nativeEvent: { contentOffset: { y: number } } }) => void;
    };
  }>;
  const screen = renderAuthorized(authorized.props);
  const presentation = routeHarness.presentation.mock.lastCall?.[0] as {
    actions: GrowthJourneyPresentationActions;
  };
  return {
    actions: presentation.actions,
    scrollTo: (y: number) =>
      screen.props.scrollProps.onScroll({ nativeEvent: { contentOffset: { y } } }),
  };
}

describe('R002b Learning entry callbacks', () => {
  beforeEach(async () => {
    expect(resetPrototypeForTest().ok).toBe(true);
    await enterChildExperienceForTest();
    const runtime = usePrototypeStore.getState().growthJourney;
    let ledger = runtime.ledgersByProfile.child_salem;
    for (const threshold of [120, 132]) {
      const projected = projectRecognitionSeedEntry({
        ledger,
        profileId,
        profileEpochId: ledger.profileEpochId,
        triggerEventId: `learning-entry-${threshold}`,
        recognitionKey: `recognition:learning-entry-${threshold}`,
        seedTransactionId: `seed-transaction:learning-entry-${threshold}`,
        amount: 12,
        committedAt: '2026-09-05T12:00:00.000Z',
        fixtureVersion: SCHEMA3_R002A_FIXTURE_VERSION,
        mangroveTransition: null,
      });
      if (!projected.ok) throw new Error(projected.error.message);
      ledger = projected.data.ledger;
    }
    usePrototypeStore.setState({
      growthJourney: {
        ...runtime,
        ledgersByProfile: { ...runtime.ledgersByProfile, child_salem: ledger },
      },
    });
  });

  it.each(['impact_path', 'badge_detail'] as const)(
    'resumes the same learning origin after scrolling the %s entry',
    (kind) => {
      const surface = openEntrySurface(kind);
      surface.scrollTo(25);
      surface.actions.openLearning?.(learningId);
      expect(routeHarness.push).toHaveBeenCalledTimes(1);
      expect(
        usePrototypeStore.getState().advanceMangroveLearning('story', 'story_frame_1').ok,
      ).toBe(true);
      const learningBefore = usePrototypeStore.getState().mangroveLearningByProfile.child_salem;
      const growthBefore = usePrototypeStore.getState().growthJourney;

      surface.scrollTo(30);
      surface.actions.openLearning?.(learningId);

      expect(routeHarness.push).toHaveBeenCalledTimes(2);
      expect(routeHarness.push.mock.lastCall).toEqual(routeHarness.push.mock.calls[0]);
      expect(usePrototypeStore.getState().mangroveLearningByProfile.child_salem).toEqual(
        learningBefore,
      );
      expect(usePrototypeStore.getState().growthJourney).toBe(growthBefore);
    },
  );

  it.each([
    ['impact_path', 'badge_detail'],
    ['badge_detail', 'impact_path'],
  ] as const)(
    'resumes from %s through %s and preserves the original safe Back destination',
    (first, next) => {
      const initialSurface = openEntrySurface(first);
      initialSurface.scrollTo(25);
      initialSurface.actions.openLearning?.(learningId);
      expect(routeHarness.push).toHaveBeenCalledTimes(1);
      const originalLearning = usePrototypeStore.getState().mangroveLearningByProfile.child_salem;
      const originalReturn = createMangroveReturnIntent({ state: originalLearning });
      if (!originalReturn.ok) throw new Error(originalReturn.error.message);
      const nextSurface = openEntrySurface(next);
      nextSurface.scrollTo(5);

      nextSurface.actions.openLearning?.(learningId);

      expect(routeHarness.push).toHaveBeenCalledTimes(2);
      expect(routeHarness.push.mock.lastCall).toEqual(routeHarness.push.mock.calls[0]);
      const resumedLearning = usePrototypeStore.getState().mangroveLearningByProfile.child_salem;
      expect(resumedLearning).toEqual(originalLearning);
      const replaceValidatedOrigin = vi.fn();
      const replaceSafeRoot = vi.fn();
      createR002bLearningBackHandler({
        state: resumedLearning,
        profileId,
        canGoBack: () => false,
        goBack: vi.fn(),
        replaceSafeRoot,
        replaceValidatedOrigin,
      })();
      expect(replaceValidatedOrigin).toHaveBeenCalledWith(originalReturn.data);
      expect(replaceSafeRoot).not.toHaveBeenCalled();
    },
  );

  it('opens the accessible route from Impact Path with the existing Badge origin', () => {
    const badge = openEntrySurface('badge_detail');
    badge.scrollTo(25);
    badge.actions.openLearning?.(learningId);
    const originalLearning = usePrototypeStore.getState().mangroveLearningByProfile.child_salem;
    const path = openEntrySurface('impact_path');
    path.scrollTo(5);

    path.actions.openAccessibleLearning?.(learningId);

    expect(routeHarness.push).toHaveBeenLastCalledWith({
      pathname: '/garden/learn/[learningId]/accessible',
      params: routeHarness.push.mock.calls[0]?.[0].params,
    });
    const learning = usePrototypeStore.getState().mangroveLearningByProfile.child_salem;
    expect(learning.origin).toEqual(originalLearning.origin);
    expect(learning.activeRoute).toBe('accessible');
    expect(learning.completion).toBeNull();
  });

  it.each([
    ['impact_path', 'profile'],
    ['impact_path', 'epoch'],
    ['badge_detail', 'profile'],
    ['badge_detail', 'epoch'],
  ] as const)('rejects a %s resume with a stale %s snapshot', (kind, mismatch) => {
    const surface = openEntrySurface(kind);
    surface.actions.openLearning?.(learningId);
    const state = usePrototypeStore.getState();
    usePrototypeStore.setState({
      mangroveLearningByProfile: {
        ...state.mangroveLearningByProfile,
        child_salem: {
          ...state.mangroveLearningByProfile.child_salem,
          ...(mismatch === 'profile'
            ? { profileId: 'child_alya' as const }
            : { profileEpochId: 'stale-learning-epoch' }),
        },
      },
    });
    const learningBefore = usePrototypeStore.getState().mangroveLearningByProfile;

    surface.actions.openLearning?.(learningId);

    expect(routeHarness.push).toHaveBeenCalledTimes(1);
    expect(usePrototypeStore.getState().mangroveLearningByProfile).toBe(learningBefore);
  });

  it.each([
    ['impact_path', 'story'],
    ['impact_path', 'accessible'],
    ['badge_detail', 'story'],
    ['badge_detail', 'accessible'],
  ] as const)('restores focus and scroll to %s after %s Back without history', (kind, route) => {
    const entry = openEntrySurface(kind);
    entry.scrollTo(25);
    entry.actions.openLearning?.(learningId);
    const learning = usePrototypeStore.getState().mangroveLearningByProfile.child_salem;
    if (!learning.origin) throw new Error('Expected a recorded learning origin');
    if (route === 'accessible') {
      expect(usePrototypeStore.getState().startMangroveLearning(route, learning.origin).ok).toBe(
        true,
      );
    }
    routeHarness.params = routeHarness.push.mock.lastCall?.[0].params;
    const authorized = route === 'story' ? LearningStoryRoute() : AccessibleLearningRoute();
    const renderAuthorized = authorized.type as (props: unknown) => ReactElement<{
      onBack: () => void;
    }>;

    renderAuthorized(authorized.props).props.onBack();

    expect(routeHarness.back).not.toHaveBeenCalled();
    const target = routeHarness.replace.mock.lastCall?.[0];
    expect(target.params).toMatchObject({
      restoreProfileId: profileId,
      restoreFocusTarget: learning.origin.focusTargetId,
      restoreScrollOffset: '25',
    });
    routeHarness.params = target.params;
    const destination = kind === 'impact_path' ? ImpactPathRoute() : BadgeDetailRoute();
    expect(destination.props).toMatchObject(
      kind === 'impact_path'
        ? { restored: { focusTarget: learning.origin.focusTargetId, scrollOffset: 25 } }
        : { restoreFocusTarget: learning.origin.focusTargetId, restoredScrollOffset: 25 },
    );
  });
});

describe('R002b guarded Learning route integration', () => {
  it('mounts exactly the two approved nested Learning surfaces without Child bottom navigation', () => {
    const story = source(routeFiles.story);
    const accessible = source(routeFiles.accessible);

    expect(existsSync(`${root}${routeFiles.story}`)).toBe(true);
    expect(existsSync(`${root}${routeFiles.accessible}`)).toBe(true);
    expect(story).toContain("routeId: 'learning_story'");
    expect(accessible).toContain("routeId: 'learning_accessible'");
    expect(story).toMatch(/(?:<MangroveStoryScreen|(?:mode|route)=['{]story)/u);
    expect(accessible).toMatch(/(?:<AccessibleLearningScreen|(?:mode|route)=['{]accessible)/u);

    for (const route of [story, accessible]) {
      expect(route).toContain('<R002bNestedScreen');
      expect(route).not.toContain('ChildBottomNavigation');
    }
  });

  it('resolves role, profile, package, flag, and origin before mounting profile-scoped content', () => {
    for (const [mode, path] of Object.entries(routeFiles)) {
      const route = source(path);
      const guardIndex = route.indexOf('resolveR002bRouteRequest');
      const rejectionIndex = route.indexOf('if (!access.allowed)');
      const authorizedIndex = route.indexOf('<Authorized');
      const preAuthorization = authorizedIndex < 0 ? route : route.slice(0, authorizedIndex);

      expect(route, mode).toContain('requestedProfileParam: params.profileId');
      expect(route, mode).toContain('entityParam: params.learningId');
      expect(route, mode).toContain('authorizedProfileIds: [activeChildId]');
      expect(route, mode).toContain('r002bFeatureFlags');
      expect(route, mode).toMatch(
        /if \(!access\.allowed\) return <Redirect href=\{access\.fallback\} \/>/u,
      );
      expect(guardIndex, mode).toBeGreaterThanOrEqual(0);
      expect(guardIndex, mode).toBeLessThan(rejectionIndex);
      expect(rejectionIndex, mode).toBeLessThan(authorizedIndex);
      expect(preAuthorization, mode).not.toMatch(
        /mangroveLearningByProfile|advanceMangroveLearning|answerMangroveLearningCheck|completeMangroveLearning/u,
      );
    }
  });

  it('uses the one exact package identity and keeps flag-off requests on the safe Child root', () => {
    const integration = integratedLearningSource();

    expect(MANGROVE_ROOTS_LEARNING_PACKAGE.id).toBe(learningId);
    expect(integration).toContain('MANGROVE_ROOTS_LEARNING_PACKAGE');
    expect(integration).toContain('learning.mangrove_roots.v1');
    expect(
      guardR002bRoute({
        routeId: 'learning_story',
        role: 'child',
        activeProfileId: profileId,
        requestedProfileId: profileId,
        authorizedProfileIds: [profileId],
        entityId: learningId,
        flags: resolveR002bFeatureFlags({}),
      }),
    ).toEqual({ allowed: false, fallback: '/child', reason: 'feature_disabled' });
    expect(
      guardR002bRoute({
        routeId: 'learning_accessible',
        role: 'child',
        activeProfileId: profileId,
        requestedProfileId: profileId,
        authorizedProfileIds: [profileId],
        entityId: 'learning.unknown.v1',
        flags: resolveR002bFeatureFlags({ r002b_learning_ui: true }),
      }),
    ).toEqual({ allowed: false, fallback: '/child', reason: 'invalid_entity' });
  });

  it('starts from an allowlisted typed origin and restores only the same profile and focus target', () => {
    const empty = createMangroveLearningState({ profileId, profileEpochId });
    if (!empty.ok) throw new Error(empty.error.message);

    const started = startMangroveLearningRoute({
      state: empty.data,
      profileId,
      profileEpochId,
      route: 'story',
      origin: impactPathOrigin,
      unlockEvidence: {
        profileId,
        profileEpochId,
        source: 'canonical_impact_path_projection',
        reachedThresholds: [120, 132],
      },
    });
    if (!started.ok) throw new Error(started.error.message);

    expect(createMangroveReturnIntent({ state: started.data.state })).toEqual({
      ok: true,
      data: {
        kind: 'restore_origin',
        route: '/garden/impact-path',
        profileId,
        focusTargetId: 'impact-path-learning-station-132',
        scrollOffset: 0,
        replaceHistory: true,
        autoplayLearningId: null,
      },
    });
    expect(
      startMangroveLearningRoute({
        state: empty.data,
        profileId,
        profileEpochId,
        route: 'story',
        origin: { ...impactPathOrigin, profileId: 'child_alya' },
        unlockEvidence: {
          profileId,
          profileEpochId,
          source: 'canonical_impact_path_projection',
          reachedThresholds: [120, 132],
        },
      }),
    ).toMatchObject({ ok: false, error: { code: 'PROFILE_SCOPE_MISMATCH' } });

    const integration = integratedLearningSource();
    expect(integration).toContain('createMangroveReturnIntent');
    expect(integration).toContain("kind: 'impact_path'");
    expect(integration).toContain("focusTargetId: 'impact-path-learning-station-132'");
    expect(integration).not.toMatch(/returnPath|originPath|JSON\.parse/u);
    expect(integration).toContain('replaceValidatedOrigin');
    expect(integration).toContain('restoreFocusTarget');
    expect(source('app/garden/impact-path.tsx')).toContain("'impact_path_learning_action'");
  });

  it('supports the approved Badge Detail entry and typed no-stack return without arbitrary URLs', () => {
    const badgeDetail = source('app/garden/badges/[badgeId].tsx');
    const story = source(routeFiles.story);
    const accessible = source(routeFiles.accessible);

    expect(badgeDetail).toContain("id: 'badge_detail_learning_action'");
    expect(badgeDetail).toContain("kind: 'badge_detail'");
    expect(badgeDetail).toContain("focusTargetId: 'r002b-badge-detail-learning-action'");
    expect(badgeDetail).toContain("pathname: '/garden/learn/[learningId]/story'");
    expect(story).toContain("'badge_detail_learning_action'");
    expect(accessible).toContain("'badge_detail_learning_action'");
    expect(story).toContain("pathname: '/garden/badges/[badgeId]'");
    expect(accessible).toContain("pathname: '/garden/badges/[badgeId]'");
    expect(story).toContain('replaceValidatedOrigin');
    expect(accessible).toContain('replaceValidatedOrigin');
    expect([badgeDetail, story, accessible].join('\n')).not.toMatch(
      /(?:returnPath|originPath|redirectTo|JSON\.parse)/u,
    );
  });

  it('uses a validated typed return intent when interrupted navigation has no back stack', () => {
    const empty = createMangroveLearningState({ profileId, profileEpochId });
    if (!empty.ok) throw new Error(empty.error.message);
    const started = startMangroveLearningRoute({
      state: empty.data,
      profileId,
      profileEpochId,
      route: 'story',
      origin: impactPathOrigin,
      unlockEvidence: {
        profileId,
        profileEpochId,
        source: 'canonical_impact_path_projection',
        reachedThresholds: [120, 132],
      },
    });
    if (!started.ok) throw new Error(started.error.message);
    const goBack = vi.fn();
    const replaceSafeRoot = vi.fn();
    const replaceValidatedOrigin = vi.fn();

    createR002bLearningBackHandler({
      state: started.data.state,
      profileId,
      canGoBack: () => false,
      goBack,
      replaceSafeRoot,
      replaceValidatedOrigin,
    })();

    expect(goBack).not.toHaveBeenCalled();
    expect(replaceSafeRoot).not.toHaveBeenCalled();
    expect(replaceValidatedOrigin).toHaveBeenCalledWith({
      kind: 'restore_origin',
      route: '/garden/impact-path',
      profileId,
      focusTargetId: 'impact-path-learning-station-132',
      scrollOffset: 0,
      replaceHistory: true,
      autoplayLearningId: null,
    });
  });

  it('wires both equal-credit modes through the existing store instead of a second state machine', () => {
    const integration = integratedLearningSource();

    for (const action of [
      'startMangroveLearning',
      'advanceMangroveLearning',
      'answerMangroveLearningCheck',
      'completeMangroveLearning',
    ]) {
      expect(integration, action).toContain(action);
    }
    expect(integration).toContain("'story'");
    expect(integration).toContain("'accessible'");
    expect(integration).toContain('/garden/learn/[learningId]/story');
    expect(integration).toContain('/garden/learn/[learningId]/accessible');
    expect(integration).not.toMatch(
      /createMangroveLearningState|startMangroveLearningRoute|advanceMangroveLearningStep|submitMangroveLearningCheck|completeMangroveLearning\s*\(\s*\{/u,
    );
  });

  it('maps finite steps, the no-fail check, completion, and mode switching to route-owned actions', () => {
    const integration = integratedLearningSource();

    expect(integration).toContain('contentStepIds');
    expect(integration).toContain("'habitat_support_and_care'");
    expect(integration).toContain("'visit_or_task_reward'");
    expect(integration).toMatch(/modeSwitchAction|switchMode/u);
    expect(integration).toMatch(/router\.(?:replace|push)/u);
    expect(integration).toMatch(/already_completed|completed/u);
    expect(integration).toMatch(/retry_available|retry/u);
    expect(integration).toMatch(/ready_to_complete|submitting/u);
  });

  it('does not calculate task rewards or mutate unrelated Ghaf progress in presentation code', () => {
    const integration = integratedLearningSource();

    expect(integration).not.toMatch(
      /(?:seedDelta|gardenGrowthDelta|canopyContributionDelta|privateLeagueLeafDelta|challengeLeafDelta|familyRewardProgressDelta)\s*:/u,
    );
    expect(integration).not.toMatch(
      /(?:applyRecognition|projectRecognitionSeedEntry|recordParentApprovedAcquisition|projectLearningCompletionIntoGrowthJourney|awardBadge|grantReward)/u,
    );
    expect(integration).not.toContain('task_recycling_p0_v1');
  });

  it('remains finite, offline, non-autoplaying, and free of media or network runtime dependencies', () => {
    const integration = integratedLearningSource();

    expect(MANGROVE_ROOTS_LEARNING_PACKAGE.autoplayNextLearning).toBe(false);
    expect(MANGROVE_ROOTS_LEARNING_PACKAGE.capabilities).toMatchObject({
      offline: true,
      requiresCamera: false,
      requiresMicrophone: false,
      opensExternalBrowser: false,
      liveAi: false,
    });
    expect(integration).not.toMatch(
      /(?:fetch\(|axios|WebView|expo-av|expo-audio|Audio\.|Camera|ImagePicker|Location\.|https?:\/\/|setTimeout\(|Animated\.loop|autoPlay)/u,
    );
    expect(integration).not.toContain('ChildBottomNavigation');
  });
});
