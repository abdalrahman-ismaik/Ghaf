import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it, vi } from 'vitest';

import { resolveR002bFeatureFlags } from '@/config/r002bFeatureFlags';
import {
  MANGROVE_ROOTS_LEARNING_PACKAGE,
  createMangroveLearningState,
  createMangroveReturnIntent,
  startMangroveLearningRoute,
} from '@/features/learning/mangroveLearning';
import { createR002bLearningBackHandler } from '@/features/learning/r002bLearningNavigation';
import { guardR002bRoute } from '@/features/navigation/r002bRouteGuard';
import type { LearningOrigin } from '@/models/learning';

const root = fileURLToPath(new URL('../', import.meta.url));
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
