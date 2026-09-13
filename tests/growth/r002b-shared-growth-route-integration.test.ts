import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_R002B_FEATURE_FLAGS, resolveR002bFeatureFlags } from '@/config/r002bFeatureFlags';
import { PARENT_VERIFICATION_CODE } from '@/features/access/parentOnboarding';
import { guardR002bRoute } from '@/features/navigation/r002bRouteGuard';
import { serviceRegistry } from '@/services';
import { usePrototypeStore } from '@/state/usePrototypeStore';

const root = fileURLToPath(new URL('../../', import.meta.url));
const childRoutePath = 'app/circle/shared-growth.tsx';
const parentRoutePath = 'app/parent/family/shared-garden.tsx';

function source(path: string): string {
  return existsSync(`${root}${path}`) ? readFileSync(`${root}${path}`, 'utf8') : '';
}

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): T {
  if (!result.ok || result.data === undefined) {
    throw new Error(`Expected local action to succeed: ${JSON.stringify(result)}`);
  }
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

function privateStateSnapshot() {
  const state = usePrototypeStore.getState();
  return structuredClone({
    task: {
      choicePool: state.choicePool,
      activeAssignmentId: state.activeAssignmentId,
      journey: state.journey,
      childTaskDraft: state.childTaskDraft,
      taskDraftRevision: state.taskDraftRevision,
      routineProgressByTask: state.routineProgressByTask,
    },
    seeds: state.children,
    garden: state.landscapeProgress,
    canopy: state.household.combinedCanopy,
    circleAndChallenge: state.circleGoal,
    recognitionLedger: state.recognitionLedger,
    achievements: state.growthJourney,
    learning: state.mangroveLearningByProfile,
    reveal: state.celebration,
  });
}

describe('R002b Shared Growth route integration', () => {
  beforeEach(() => {
    usePrototypeStore.setState(usePrototypeStore.getInitialState(), true);
    usePrototypeStore.getState().setRole('parent');
  });

  it('mounts two nested shells and guards before reading either scoped projection', () => {
    const child = source(childRoutePath);
    const parent = source(parentRoutePath);
    const rootLayout = source('app/_layout.tsx');

    expect(existsSync(`${root}${childRoutePath}`)).toBe(true);
    expect(existsSync(`${root}${parentRoutePath}`)).toBe(true);
    expect(child).toContain("routeId: 'shared_growth'");
    expect(parent).toContain("routeId: 'parent_shared_garden'");
    expect(child).toContain('<SharedGrowthChildScreen');
    expect(parent).toContain('<ParentSharedGardenScreen');
    expect(child).toContain('<R002bNestedScreen');
    expect(parent).toContain('<R002bNestedScreen');
    expect(`${child}\n${parent}`).not.toMatch(
      /<(?:ChildHomeHeader|ParentHomeHeader|JourneyHeader|ChildBottomNavigation|ParentHomeNavigation)\b/u,
    );
    expect(rootLayout).toContain("pathname.startsWith('/parent')");
    expect(rootLayout).toContain("pathname === '/circle/shared-growth'");

    for (const [route, projection, authorized] of [
      [child, 'getSharedGrowthChildView', '<AuthorizedSharedGrowth'],
      [parent, 'sharedGrowth', '<AuthorizedParentSharedGarden'],
    ] as const) {
      const guardIndex = route.indexOf('resolveR002bRouteRequest');
      const rejectionIndex = route.indexOf('if (!access.allowed)');
      const authorizedIndex = route.indexOf(authorized);
      const projectionIndex = route.indexOf(projection, authorizedIndex);
      expect(guardIndex).toBeGreaterThanOrEqual(0);
      expect(guardIndex).toBeLessThan(rejectionIndex);
      expect(rejectionIndex).toBeLessThan(authorizedIndex);
      expect(authorizedIndex).toBeLessThan(projectionIndex);
    }
  });

  it('keeps view and contribution independent and leaves Child without a mutation action', () => {
    const child = source(childRoutePath);
    const parent = source(parentRoutePath);
    const flags = resolveR002bFeatureFlags({ r002b_shared_growth_view: true });

    expect(flags.r002b_shared_growth_contribution).toBe(false);
    expect(child).not.toContain('changeSharedGrowthParticipation');
    expect(parent).toContain('r002bFeatureFlags.r002b_shared_growth_contribution');
    expect(parent).toContain('contributionEnabled');
    expect(
      guardR002bRoute({
        routeId: 'shared_growth',
        role: 'child',
        activeProfileId: 'child_salem',
        requestedProfileId: 'child_salem',
        authorizedProfileIds: ['child_salem'],
        flags,
      }),
    ).toEqual({ allowed: true });
    expect(
      guardR002bRoute({
        routeId: 'parent_shared_garden',
        role: 'parent',
        activeProfileId: 'child_salem',
        requestedProfileId: 'child_salem',
        authorizedProfileIds: ['child_salem', 'child_alya'],
        flags: DEFAULT_R002B_FEATURE_FLAGS,
      }),
    ).toEqual({ allowed: false, fallback: '/parent', reason: 'feature_disabled' });
  });

  it('allows only the documented origins and adds feature-gated Garden entries', () => {
    const child = source(childRoutePath);
    const parent = source(parentRoutePath);
    const garden = source('app/garden.tsx');
    const circle = source('app/circle.tsx');

    expect(child).toMatch(
      /const ALLOWED_ORIGINS = \[\s*'child_garden_shared_growth_card',?\s*\] as const/u,
    );
    expect(parent).toMatch(
      /const ALLOWED_ORIGINS = \[\s*'parent_garden_shared_settings_card',\s*'parent_family_overview_shared_garden_row',?\s*\] as const/u,
    );
    expect(garden).toContain('r002bFeatureFlags.r002b_shared_growth_view');
    expect(garden).toContain("id: 'child_garden_shared_growth_card'");
    expect(garden).toContain("pathname: '/circle/shared-growth'");
    expect(garden).toContain("id: 'parent_garden_shared_settings_card'");
    expect(garden).toContain("pathname: '/parent/family/shared-garden'");
    expect(circle).toContain('function CircleScreen');
    expect(circle).toContain('testID="circle-screen"');
    expect(circle).not.toContain("'/circle/shared-growth'");
    expect(circle).not.toContain('child_league_shared_growth_card');
    expect(garden).toContain('restoreFocusTarget');
    expect(garden).toContain('restoreScrollOffset');
    expect(garden).toContain('contentOffset');
    expect(garden).toContain('initialFocusTargetId={restoredFocusTarget}');
    expect(garden).toContain('restoreFocus={restoredFocusTarget ===');
  });

  it('uses confirmation state and deterministic command evidence at the existing store boundary', () => {
    const parent = source(parentRoutePath);

    expect(parent).toContain('changeSharedGrowthParticipation');
    expect(parent).toContain('confirmationAction');
    expect(parent).toContain('onRequestConfirmation');
    expect(parent).toContain('freshConsentConfirmed');
    expect(parent).toMatch(/actionId(?:\s*:|,)/u);
    expect(parent).toMatch(/proofId(?:\s*:|,)/u);
    expect(parent).toMatch(/actedAt(?:\s*:|,)/u);
    expect(parent).not.toMatch(/Date\.now|new Date|Math\.random|randomUUID/u);
  });

  it('recovers a failed participation presentation locally before the normal action flow resumes', () => {
    const parent = source(parentRoutePath);
    const recoveryMatch = parent.match(
      /const recoverFromError = \(\) => \{(?<body>[\s\S]*?)\n  \};/u,
    );
    const recoveryBody = recoveryMatch?.groups?.body ?? '';

    expect(parent).toContain('onRecover: recoverFromError');
    expect(recoveryBody).toContain('setConfirmationAction(undefined)');
    expect(recoveryBody).toContain('setPendingAction(undefined)');
    expect(recoveryBody).toContain("setContentState('ready')");
    expect(recoveryBody).not.toContain('changeSharedGrowthParticipation');
    expect(recoveryBody).not.toMatch(/preference|actionId|proofId|actedAt/u);
  });

  it('keeps every private authority unchanged through Pause, Continue, End, and fresh-consent return', async () => {
    await completeParentOnboarding();
    const baseline = privateStateSnapshot();
    const leagueSpies = [
      vi.spyOn(serviceRegistry.familyLeague, 'createWeek'),
      vi.spyOn(serviceRegistry.familyLeague, 'confirmLeaf'),
      vi.spyOn(serviceRegistry.familyLeague, 'rollover'),
    ];
    const rewardSpies = [
      vi.spyOn(serviceRegistry.familyReward, 'createPlan'),
      vi.spyOn(serviceRegistry.familyReward, 'evaluatePlan'),
      vi.spyOn(serviceRegistry.familyReward, 'markGiven'),
    ];
    const commands = [
      {
        actionId: 'shared-growth-route-pause-r1',
        action: 'pause_new_contributions' as const,
        actedAt: '2026-09-04T10:01:00.000Z',
        proofId: 'shared-growth-route-proof-pause-r1',
        freshConsentConfirmed: false,
      },
      {
        actionId: 'shared-growth-route-continue-r2',
        action: 'continue' as const,
        actedAt: '2026-09-04T10:02:00.000Z',
        proofId: 'shared-growth-route-proof-continue-r2',
        freshConsentConfirmed: false,
      },
      {
        actionId: 'shared-growth-route-end-r3',
        action: 'end_participation' as const,
        actedAt: '2026-09-04T10:03:00.000Z',
        proofId: 'shared-growth-route-proof-end-r3',
        freshConsentConfirmed: false,
      },
      {
        actionId: 'shared-growth-route-rejoin-r4',
        action: 'continue' as const,
        actedAt: '2026-09-04T10:04:00.000Z',
        proofId: 'shared-growth-route-proof-rejoin-r4',
        freshConsentConfirmed: true,
      },
    ];

    for (const command of commands) {
      expectOk(usePrototypeStore.getState().changeSharedGrowthParticipation(command));
      expect(privateStateSnapshot()).toEqual(baseline);
    }
    expect(usePrototypeStore.getState().sharedGrowth.preference.status).toBe('continued');
    expect(usePrototypeStore.getState().sharedGrowth.preference.consentReceipts).toHaveLength(2);
    for (const spy of [...leagueSpies, ...rewardSpies]) expect(spy).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});
