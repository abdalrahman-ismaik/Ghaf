import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../', import.meta.url));

function source(path: string): string {
  return readFileSync(`${root}${path}`, 'utf8');
}

const routeFiles = [
  'app/garden/impact-path.tsx',
  'app/garden/badges/index.tsx',
  'app/garden/badges/[badgeId].tsx',
] as const;

describe('R002b guarded Growth route integration', () => {
  it('mounts the approved nested surfaces without adding a bottom-navigation route', () => {
    for (const path of routeFiles) expect(existsSync(`${root}${path}`), path).toBe(true);

    expect(source(routeFiles[0])).toContain('<ImpactPathScreen');
    expect(source(routeFiles[1])).toContain('<BadgeGallery');
    expect(source(routeFiles[2])).toContain('<BadgeDetail');
    for (const path of routeFiles) {
      expect(source(path), path).toContain('<R002bNestedScreen');
      expect(source(path), path).not.toContain('ChildBottomNavigation');
    }
  });

  it('guards untrusted role, profile, flag, entity, and origin before rendering scoped data', () => {
    for (const path of routeFiles) {
      const route = source(path);
      expect(route, path).toContain('resolveR002bRouteRequest');
      expect(route, path).toMatch(/if \(!access\.allowed\) return <Redirect/u);
      expect(route.indexOf('resolveR002bRouteRequest'), path).toBeLessThan(
        route.indexOf('<Authorized'),
      );
      expect(route, path).toContain('authorizedProfileIds: [activeChildId]');
      expect(route, path).toContain('r002bFeatureFlags');
    }
  });

  it('uses only closed typed origins and restores the validated physical Back destination', () => {
    const impactPath = source(routeFiles[0]);
    const gallery = source(routeFiles[1]);
    const detail = source(routeFiles[2]);

    expect(impactPath).toContain("'child_today_path_card'");
    expect(impactPath).toContain("'child_garden_path_card'");
    expect(impactPath).toContain("'badge_detail_path_action'");
    expect(gallery).toContain("'child_garden_badges_card'");
    expect(gallery).toContain("'impact_path_badges_action'");
    expect(detail).toContain("'badge_gallery_badge_card'");
    for (const route of [impactPath, gallery, detail]) {
      expect(route).toContain('createValidatedBackHandler');
      expect(route).not.toMatch(/returnPath|originPath|JSON\.parse/u);
    }
  });

  it('keeps Today and Garden additive, Child-only, and independently flag-controlled', () => {
    const today = source('app/child/index.tsx');
    const garden = source('app/garden.tsx');

    expect(today).toContain('r002bFeatureFlags.r002b_impact_path_ui');
    expect(today).toContain('<TodayImpactPathCard');
    expect(today).toContain("id: 'child_today_path_card'");
    expect(garden).toContain("role === 'child' && r002bGrowthEnabled");
    expect(garden).toContain('<GardenChapterModule');
    expect(garden).toContain("id: 'child_garden_path_card'");
    expect(garden).toContain("id: 'child_garden_badges_card'");
    expect(garden).toContain('r002bFeatureFlags.r002b_badges_ui');
    expect(garden).toContain('restoreProfileId === activeChildId');
    expect(garden).toContain('contentOffset: { x: 0, y: restoredScrollOffset }');
    expect(garden).toContain('initialFocusTargetId={restoredFocusTarget}');

    const detail = source('app/garden/badges/[badgeId].tsx');
    expect(detail).toMatch(
      /r002bFeatureFlags\.r002b_impact_path_ui\s*\?\s*\{ openImpactStation \}\s*:\s*\{\}/u,
    );
  });

  it('derives every Growth value from the profile projection and never writes rewards in UI', () => {
    const integrated = [
      source('app/child/index.tsx'),
      source('app/garden.tsx'),
      ...routeFiles.map(source),
      source('src/features/growth/useR002bGrowthPresentation.ts'),
    ].join('\n');

    expect(integrated).toContain('projectR002bGrowthExperienceWithLearning');
    expect(integrated).toContain('createGrowthJourneyPresentation');
    expect(integrated).toContain('state.landscapeProgress.mangrove');
    expect(integrated).not.toMatch(
      /(?:applyRecognition|projectRecognitionSeedEntry|recordParentApprovedAcquisition|awardBadge|seedDelta\s*:)/u,
    );
  });

  it('uses light system chrome and one reduced-motion-aware shell for all nested Growth routes', () => {
    const layout = source('app/_layout.tsx');
    const shell = source('src/components/r002b/R002bNestedScreen.tsx');

    expect(layout).toContain("pathname.startsWith('/garden/')");
    expect(shell).toContain("BackHandler.addEventListener('hardwareBackPress'");
    expect(shell).toContain("direction === 'rtl' ? backControl : emptySlot");
    expect(shell).toContain('reducedMotion ? styles.pressedStatic : styles.pressedMotion');
    expect(shell).toContain('layout.touchTarget');
  });
});
