import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { resources } from '../src/i18n/resources';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = (relativePath: string) => readFileSync(`${root}${relativePath}`, 'utf8');

const requiredRoutes = [
  'app/access/child/index.tsx',
  'app/access/child/pin.tsx',
  'app/access/child/pair.tsx',
  'app/access/parent/_layout.tsx',
  'app/parent/family/index.tsx',
  'app/parent/family/reward.tsx',
  'app/parent/settings/index.tsx',
  'app/parent/settings/permissions.tsx',
  'app/parent/settings/devices.tsx',
  'app/parent/reauthenticate.tsx',
  'app/child/settings.tsx',
] as const;

describe('R003 complete screen journey', () => {
  it('owns every missing P0 surface with a native route', () => {
    for (const route of requiredRoutes) {
      expect(existsSync(`${root}${route}`), route).toBe(true);
      const contents = source(route);
      expect(contents, route).not.toMatch(
        /WebView|iframe|<div|className=|dangerouslySetInnerHTML/u,
      );
      expect(contents, route).not.toMatch(/https?:\/\//u);
    }
  });

  it('uses separate access paths and retires the role toggle', () => {
    const welcome = source('app/index.tsx');
    const compatibilityRole = source('app/role.tsx');
    const childPairing = source('app/access/child/pair.tsx');
    const parentSignIn = source('app/access/parent/sign-in.tsx');
    const parentVerification = source('app/access/parent/verification.tsx');
    const parentAccessLayout = source('app/access/parent/_layout.tsx');
    const parentSuccess = source('app/access/parent/family-created-success.tsx');
    const statusBar = source('src/components/PrototypeStatusBar.tsx');
    const parent = source('app/parent/index.tsx');
    const parentDevices = source('app/parent/settings/devices.tsx');
    const child = source('app/child/index.tsx');

    expect(welcome).toMatch(/router\.push\('\/access\/child'(?: as Href)?\)/u);
    expect(compatibilityRole).toContain('<Redirect href="/" />');
    expect(compatibilityRole).not.toContain('setRole');
    expect(parent).not.toContain("setRole('child')");
    expect(parent).not.toContain("router.replace('/child')");
    expect(child).not.toContain("router.replace('/role')");
    expect(childPairing).toContain('enterParentExperience');
    expect(childPairing).not.toContain('approveChildPairing');
    expect(parentDevices).toContain('approveChildPairing');
    expect(parentDevices).toContain('handoffApprovedChildPairing');
    expect(parentSignIn).toContain("activeExperience === 'parent' ? '/parent' : '/'");
    expect(parentVerification).toContain('parentOnboarding.completionReceipt');
    expect(parentVerification).toContain('completeParentOnboarding()');
    expect(parentVerification).toContain("'/parent'");
    expect(parentVerification).toContain('router.replace(destination as Href)');
    expect(parentVerification).toContain("childAccess.status === 'pairing_pending'");
    expect(parentVerification).toContain("'/parent/settings/devices'");
    expect(parentSuccess).toContain("childAccess.status === 'pairing_pending'");
    expect(parentSuccess).toContain("'/parent/settings/devices'");
    expect(parentSuccess).toContain('router.replace(destination as Href)');
    expect(parentAccessLayout).toContain("activeExperience === 'child'");
    expect(parentAccessLayout).toContain('<Redirect href="/child" />');
    expect(statusBar).toContain('selectHasActiveParentExperience');
    expect(statusBar).not.toContain("pathname !== '/role'");
  });

  it('keeps the exact Parent and Child bottom-navigation contracts', () => {
    const parentNavigation = source('src/components/r002a/parent/ParentHomeNavigation.tsx');
    const childNavigation = source('src/components/r002a/child/ChildBottomNavigation.tsx');
    const parent = source('app/parent/index.tsx');

    expect(parentNavigation).toContain(
      "type ParentNavigationKey = 'family' | 'garden' | 'home' | 'tasks'",
    );
    expect(parentNavigation).toContain("key: 'family'");
    expect(parentNavigation).not.toContain("key: 'circle'");
    expect(parent).toMatch(/router\.push\('\/parent\/family'(?: as Href)?\)/u);
    expect(childNavigation).toContain(
      "export type ChildNavigationKey = 'league' | 'garden' | 'today'",
    );
  });

  it('keeps every Salem-specific task-builder action scoped to Salem', () => {
    const parent = source('app/parent/index.tsx');

    expect(parent).toContain('const openSalemTaskBuilder = () => {');
    expect(parent).toContain("setActiveChild('child_salem')");
    expect(parent).toContain("if (nextRoute === '/parent/task/new')");
    expect(parent).toContain('onCreateTask={openSalemTaskBuilder}');
    expect(parent).not.toContain("onCreateTask={() => router.push('/parent/task/new')}");
  });

  it('keeps contextual routes out of bottom navigation', () => {
    const parentNavigation = source('src/components/r002a/parent/ParentHomeNavigation.tsx');
    const childNavigation = source('src/components/r002a/child/ChildBottomNavigation.tsx');
    const combined = `${parentNavigation}\n${childNavigation}`;

    expect(combined).not.toMatch(/impact.path|badge|learning|permission|device|reward/iu);
  });

  it('guards shared private surfaces and hides default-off destinations', () => {
    const circle = source('app/circle.tsx');
    const family = source('app/parent/family/index.tsx');
    const reward = source('app/parent/family/reward.tsx');

    expect(circle).toContain('selectHasActiveParentExperience');
    expect(circle).toContain('selectCanEnterChildExperience');
    expect(circle).toContain('<Redirect href="/"');
    expect(family).toContain('r002b_parent_progress_ui');
    expect(family).toContain('r002b_shared_growth_view');
    expect(family).toContain('getFamilyReward');
    expect(family).not.toContain('projectFamilyRewardRuntime');
    expect(reward).toContain('getFamilyReward');
    expect(reward).not.toContain('projectFamilyRewardRuntime');
  });

  it('fails closed before navigating away from every session sign-out', () => {
    const routes = [
      'app/child/index.tsx',
      'app/child/settings.tsx',
      'app/child/task.tsx',
      'app/circle.tsx',
      'app/garden.tsx',
      'app/parent/check-in.tsx',
      'app/parent/index.tsx',
      'app/parent/settings/index.tsx',
      'app/parent/task/review.tsx',
    ] as const;

    for (const route of routes) {
      const contents = source(route);
      expect(contents, route).not.toMatch(/^\s*signOutExperience\(\);/mu);
      expect(contents, route).toMatch(/const result = signOutExperience\(\)/u);
      expect(contents, route).toMatch(/if \(!result\.ok\)/u);
    }
  });

  it('uses Welcome as the signed-out deep-link fallback and typed Family origins', () => {
    const parentLayout = source('app/parent/_layout.tsx');
    const childLayout = source('app/child/_layout.tsx');
    const family = source('app/parent/family/index.tsx');
    const progress = source('app/parent/family/[profileId]/progress.tsx');
    const sharedGarden = source('app/parent/family/shared-garden.tsx');

    expect(parentLayout).toContain("activeExperience === 'child'");
    expect(parentLayout).toContain('<Redirect href="/" />');
    expect(childLayout).toContain("activeExperience === 'parent'");
    expect(childLayout).toContain("<Redirect href={'/' as Href} />");
    expect(family).toContain("id: 'parent_family_overview_progress_row'");
    expect(family).toContain("id: 'parent_family_overview_shared_garden_row'");
    expect(family).toContain('serializeR002bOrigin');
    expect(progress).toContain("'parent_family_overview_progress_row'");
    expect(sharedGarden).toContain("'parent_family_overview_shared_garden_row'");
  });

  it('isolates every global private route by the active experience', () => {
    const sharedRoutes = ['app/garden.tsx', 'app/circle.tsx'];
    const childOnlyRoutes = [
      'app/league.tsx',
      'app/garden/impact-path.tsx',
      'app/garden/badges/index.tsx',
      'app/garden/badges/[badgeId].tsx',
      'app/garden/learn/[learningId]/story.tsx',
      'app/garden/learn/[learningId]/accessible.tsx',
      'app/circle/shared-growth.tsx',
    ];

    for (const route of sharedRoutes) {
      const contents = source(route);
      expect(contents, route).toContain("activeExperience === 'signed_out'");
      expect(contents, route).toContain('<Redirect href="/" />');
    }
    for (const route of childOnlyRoutes) {
      const contents = source(route);
      expect(contents, route).toContain("activeExperience === 'parent'");
      expect(contents, route).toContain("activeExperience !== 'child'");
      expect(contents, route).not.toContain("<Redirect href={'/access/child' as Href} />");
    }
  });

  it('keeps new progress and picture access controls narrow-width RTL safe', () => {
    const components = source('src/components/r003/index.tsx');
    const credential = source('app/access/child/pin.tsx');

    expect(components).toContain("direction === 'rtl' ? styles.progressFillRtl");
    expect(components).toContain("progressFillRtl: { alignSelf: 'flex-end' }");
    expect(credential).toContain('maxWidth: 96');
    expect(credential).toContain('minWidth: 0');
    expect(credential).toContain('flex: 1');
  });

  it('restores Family focus to the actionable rows rather than wrapper views', () => {
    const family = source('app/parent/family/index.tsx');
    const components = source('src/components/r003/index.tsx');
    const screen = source('src/components/r002a/R002aScreen.tsx');

    expect(components).toContain('forwardRef<View, R003ActionRowProps>');
    expect(components).toContain('ref={ref}');
    expect(family).toContain('ref={childId === activeChildId ? progressEntryRef : undefined}');
    expect(family).toContain('ref={sharedGardenEntryRef}');
    expect(family).not.toMatch(/<View[^>]+ref=\{sharedGardenEntryRef\}/u);
    expect(screen).toContain('scrollViewRef.current?.scrollTo({');
    expect(screen).toContain('animated: false');
  });

  it('describes the Child Today state truthfully when no task is assigned', () => {
    const childToday = source('app/child/index.tsx');

    expect(childToday).toContain('const hasCurrentWork = Boolean(');
    expect(childToday).toContain(
      "t(hasCurrentWork ? 'childHome.todaySummary' : 'childHome.noCurrentTaskSummary')",
    );
  });

  it('describes reset as returning to signed-out Arabic Welcome', () => {
    const arabic = resources.ar.translation.reset.body;
    const english = resources.en.translation.reset.body;

    expect(arabic).toContain('شاشة الترحيب');
    expect(arabic).not.toContain('وضع وليّ الأمر');
    expect(english).toContain('signed-out Arabic Welcome');
    expect(english).not.toContain('Parent mode');
  });

  it('mirrors logical action chevrons without local direction workarounds', () => {
    const icon = source('src/components/access/GhafIcon.tsx');
    const taskBuilderFooter = source('src/components/r002a/parent/TaskBuilderFooter.tsx');

    expect(icon).toContain("isRtl ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'");
    expect(taskBuilderFooter).toContain('direction={direction}');
    expect(taskBuilderFooter).not.toContain("direction === 'rtl' ? 'ltr' : 'rtl'");
  });

  it('keeps completed Growth screens independently default-off with explicit opt-in', () => {
    const flags = source('src/config/r002bFeatureFlags.ts');

    expect(flags).toContain('DEFAULT_R002B_FEATURE_FLAGS');
    expect(flags).toContain("value === true || value === 'true'");
    expect(flags).toContain('createDisabledFlags');
  });
});
