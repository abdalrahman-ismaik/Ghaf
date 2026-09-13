import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { beforeEach, describe, expect, it } from 'vitest';

import { DEFAULT_R002B_FEATURE_FLAGS, resolveR002bFeatureFlags } from '@/config/r002bFeatureFlags';
import { PARENT_VERIFICATION_CODE } from '@/features/access/parentOnboarding';
import {
  readLegacyParentHomeParam,
  readStrictParentHomeParam,
} from '@/features/navigation/parentHomeParams';
import { guardR002bRoute } from '@/features/navigation/r002bRouteGuard';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import { resetPrototypeForTest } from '../helpers/prototypeStore';

const root = fileURLToPath(new URL('../../', import.meta.url));
const routePath = 'app/parent/family/[profileId]/progress.tsx';

function source(path: string): string {
  return existsSync(`${root}${path}`) ? readFileSync(`${root}${path}`, 'utf8') : '';
}

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): T {
  if (!result.ok || result.data === undefined) throw new Error('Expected local action to succeed');
  return result.data;
}

async function completeParentOnboarding(): Promise<void> {
  expectOk(
    usePrototypeStore.getState().requestParentVerification({
      identifier: 'parent@example.com',
      networkAvailable: false,
    }),
  );
  expectOk(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
  expectOk(usePrototypeStore.getState().completeParentOnboarding());
}

describe('R002b Parent Progress route integration', () => {
  beforeEach(() => {
    usePrototypeStore.setState(usePrototypeStore.getInitialState(), true);
    usePrototypeStore.getState().setRole('parent');
  });

  it('mounts one nested Parent-only progress route behind its independent default-off flag', () => {
    const route = source(routePath);

    expect(existsSync(`${root}${routePath}`)).toBe(true);
    expect(route).toContain("routeId: 'parent_progress'");
    expect(route).toContain('r002bFeatureFlags');
    expect(route).toContain('<ParentProgressScreen');
    expect(route).toContain('<R002bNestedScreen');
    expect(route).not.toContain('ParentHomeNavigation');

    expect(
      guardR002bRoute({
        routeId: 'parent_progress',
        role: 'parent',
        activeProfileId: 'child_salem',
        requestedProfileId: 'child_salem',
        authorizedProfileIds: ['child_salem', 'child_alya'],
        flags: DEFAULT_R002B_FEATURE_FLAGS,
      }),
    ).toEqual({ allowed: false, fallback: '/parent', reason: 'feature_disabled' });
    expect(
      guardR002bRoute({
        routeId: 'parent_progress',
        role: 'parent',
        activeProfileId: 'child_salem',
        requestedProfileId: 'child_salem',
        authorizedProfileIds: ['child_salem', 'child_alya'],
        flags: resolveR002bFeatureFlags({ r002b_parent_progress_ui: true }),
      }),
    ).toEqual({ allowed: true });
  });

  it('guards role, household profile, flag, and typed origin before reading scoped progress', () => {
    const route = source(routePath);
    const guardIndex = route.indexOf('resolveR002bRouteRequest');
    const rejectionIndex = route.indexOf('if (!access.allowed)');
    const authorizedIndex = route.indexOf('<AuthorizedParentProgress');
    const projectionIndex = route.indexOf('getParentChildProgress');

    expect(route).toContain('requestedProfileParam: params.profileId');
    expect(route).toContain('authorizedProfileIds');
    expect(route).toContain("'parent_family_progress_card'");
    expect(route).toMatch(
      /if \(!access\.allowed\) return <Redirect href=\{access\.fallback\} \/>/u,
    );
    expect(guardIndex).toBeGreaterThanOrEqual(0);
    expect(guardIndex).toBeLessThan(rejectionIndex);
    expect(rejectionIndex).toBeLessThan(authorizedIndex);
    expect(authorizedIndex).toBeLessThan(projectionIndex);
    expect(route).not.toMatch(/returnPath|originPath|JSON\.parse/u);
  });

  it('adds an R002b-only selected-child entry without changing the R002a fallback', () => {
    const home = source('app/parent/index.tsx');

    expect(home).toContain('r002bFeatureFlags.r002b_parent_progress_ui');
    expect(home).toContain("id: 'parent_family_progress_card'");
    expect(home).toContain("pathname: '/parent/family/[profileId]/progress'");
    expect(home).toContain('r002b-parent-family-progress-card');
    expect(home).toContain('<ParentChildrenSection');
    expect(home).toContain('restoreFocusTarget');
    expect(home).toContain('restoreScrollOffset');

    expect(readLegacyParentHomeParam(['tasks', 'home'])).toBe('tasks');
    expect(readLegacyParentHomeParam(['task-added-v1', 'ignored'])).toBe('task-added-v1');
    expect(readStrictParentHomeParam(['child_salem'])).toBeUndefined();
  });

  it('switches profile through the existing selector and replaces the route with a fresh origin', () => {
    const route = source(routePath);

    expect(route).toContain('setActiveChild');
    expect(route).toContain("access.origin.id === 'parent_family_overview_progress_row'");
    expect(route).toContain("? 'parent_family_overview_progress_row'");
    expect(route).toContain(": 'parent_family_progress_card'");
    expect(route).toContain('scrollOffset: access.origin.scrollOffset');
    expect(route).not.toContain('scrollOffset: 0');
    expect(route).toContain("pathname: '/parent/family/[profileId]/progress'");
    expect(route).toMatch(/router\.replace/u);
  });

  it('keeps task suggestions prefill-only and does not mutate task or reward state on view', async () => {
    expectOk(resetPrototypeForTest());
    await completeParentOnboarding();
    const beforeState = usePrototypeStore.getState();
    const before = structuredClone({
      children: beforeState.children,
      growthJourney: beforeState.growthJourney,
      journey: beforeState.journey,
      landscapeProgress: beforeState.landscapeProgress,
      learning: beforeState.mangroveLearningByProfile,
      recognitionLedger: beforeState.recognitionLedger,
    });
    const result = usePrototypeStore.getState().getParentChildProgress('child_salem');

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.suitableTaskSuggestions[0]?.prefill).toMatchObject({
      route: '/parent/task/new',
      childId: 'child_salem',
      templateId: 'task_recycling_p0_v1',
      intent: 'prefill_only',
      requiresParentReviewAndSave: true,
    });
    const afterState = usePrototypeStore.getState();
    expect({
      children: afterState.children,
      growthJourney: afterState.growthJourney,
      journey: afterState.journey,
      landscapeProgress: afterState.landscapeProgress,
      learning: afterState.mangroveLearningByProfile,
      recognitionLedger: afterState.recognitionLedger,
    }).toEqual(before);

    const progressIntegration = `${source(routePath)}\n${source(
      'src/components/r002b/ParentProgressScreen.tsx',
    )}`;
    const taskBuilderIntegration = `${source('app/parent/task/new.tsx')}\n${source(
      'src/components/family-growth/ParentTaskComposer.tsx',
    )}`;
    expect(progressIntegration).toContain('onOpenSuitableTask');
    expect(taskBuilderIntegration).toContain('resolveParentProgressTaskPrefill');
    expect(taskBuilderIntegration).toContain('initialPrefill={initialPrefill ?? undefined}');
    expect(taskBuilderIntegration).toContain(
      'initialPrefill.templateId === P0_RECYCLING_TEMPLATE.id',
    );
    expect(progressIntegration).not.toMatch(
      /(?:createTaskDraft|reviewTask|approveAssignment|applyRecognition|completeMangroveLearning)\s*\(/u,
    );
  });

  it('uses paired Arabic and English copy without placeholders or hard-coded live totals', () => {
    const resources = source('src/i18n/resources.ts');
    const integrated = `${source(routePath)}\n${source(
      'src/features/growth/r002bParentProgressViewModel.ts',
    )}\n${source('src/components/r002b/ParentProgressScreen.tsx')}`;

    expect(resources).toContain('r002bParentProgress:');
    expect(integrated).not.toMatch(/EN:S|\{\{DATA:SCREEN:/u);
    expect(integrated).not.toMatch(
      /(?:lifetimeSeeds|currentSeeds|targetSeeds)\s*[:=]\s*(?:108|120|180)\b/u,
    );
    expect(integrated).not.toMatch(
      /(?:seedDelta|gardenGrowthDelta|canopyContributionDelta|leagueLeafDelta|familyRewardProgressDelta)\s*:/u,
    );
  });
});
