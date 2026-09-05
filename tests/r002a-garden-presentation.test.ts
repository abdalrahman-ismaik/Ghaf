import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { resources } from '../src/i18n/resources';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

describe('R002a compatible Garden presentation', () => {
  const route = read('../app/garden.tsx');
  const rootLayout = read('../app/_layout.tsx');
  const landscape = read('../src/components/family-growth/GardenLandscape.tsx');
  const canopy = read('../src/components/family-growth/FamilyCanopy.tsx');

  it('uses the shared R002a shell with role-specific headers and persistent navigation', () => {
    expect(route).toContain('<R002aScreen');
    expect(route).toContain('<ChildHomeHeader');
    expect(route).toContain('<ChildBottomNavigation');
    expect(route).toContain('activeKey="garden"');
    expect(route).toContain('<ParentHomeHeader');
    expect(route).toContain('<ParentHomeNavigation');
    expect(route).toContain('testID="garden-screen"');
    expect(rootLayout).toContain("pathname === '/garden'");
  });

  it('guards the shared route and keeps Parent-only controls behind Parent authorization', () => {
    expect(route).toContain('state.role');
    expect(route).toContain('state.activeChildId');
    expect(route).toContain('selectHasActiveParentExperience');
    expect(route).toContain('selectCanEnterChildExperience');
    expect(route).toContain("activeExperience === 'signed_out'");
    expect(route).not.toContain('<Redirect href="/access/parent/sign-in"');
    expect(route).toContain('<Redirect href="/"');
    expect(route).toContain("router.push('/parent/settings' as Href)");
    expect(route).toContain('signOutExperience');
  });

  it('derives the active profile receipt and every landscape target from canonical state', () => {
    expect(route).toContain('resolveActiveGardenRecognition({');
    expect(route).toContain('deriveLandscapeDisplayTarget(progress, exactGrowth)');
    expect(route).toContain('activeChildId');
    expect(route).not.toMatch(/Object\.(?:keys|values)\(recognitionLedger\)\[0\]/);
    expect(route).not.toMatch(/\b(?:108|180)\b/);
    expect(route).not.toContain('task.recycling_sort.v1');
    expect(route).not.toContain('next stage');
    expect(route).not.toContain('Next Stage');
    expect(route).toContain('testID="garden-data-unavailable"');
    expect(route).not.toContain('Math.max(progress.cumulativeSeeds, 1)');
    expect(route).toContain(
      "t('garden.progressReached', { current: currentLabel, target: targetLabel })",
    );
  });

  it('retains all five tracks, exact consequence identity, symbolic disclosure, and explicit continuation', () => {
    expect(route).toContain("['mangrove', 'ghaf', 'samar', 'sidr', 'date_palm']");
    expect(route).toContain('testID="garden-cause-record"');
    expect(route).toContain('testID="uae-landscape-tracks"');
    expect(route).toContain('testID="recognized-family-canopy"');
    expect(route).toContain('testID="open-circle-button"');
    expect(route).toContain('activeRecognition.recognitionKey');
    expect(route).toContain("t('garden.symbolicDisclosure')");
    expect(route).toMatch(
      /const openCircle = \(\) =>[\s\S]*consumeCelebration\(\)[\s\S]*router\.push\('\/circle'\)/,
    );
  });

  it('uses the released typography, Soft Geometric surfaces, and fluid narrow-width canopy', () => {
    expect(landscape).toContain('brand');
    expect(landscape).toContain('r001Radii');
    expect(landscape).toContain('r001Shadows');
    expect(canopy).toContain('brand');
    expect(canopy).toContain('r001Radii');
    expect(canopy).toContain('r001Shadows');
    expect(canopy).toContain('aspectRatio: 288 / 208');
    expect(canopy).toContain('minWidth: 0');
    expect(canopy).not.toContain('minWidth: 238');
    expect(canopy).not.toContain('height: 238');
    expect(landscape).toContain('color="primary" variant="caption"');
    expect(landscape).toContain('direction={direction}');
  });

  it('provides equivalent live Garden copy without prototype placeholders', () => {
    const keys = [
      'screenTitle',
      'profileContext',
      'progressToward',
      'progressReached',
      'causeDefault',
      'circleAction',
      'helpTitle',
      'helpBody',
      'unavailableTitle',
      'unavailableBody',
      'unavailableAction',
    ] as const;

    for (const key of keys) {
      expect(resources.ar.translation.garden[key]).toBeTruthy();
      expect(resources.en.translation.garden[key]).toBeTruthy();
      expect(resources.ar.translation.garden[key]).not.toMatch(/EN:S|TODO|placeholder/i);
      expect(resources.en.translation.garden[key]).not.toMatch(/EN:S|TODO|placeholder/i);
    }
    expect(resources.ar.translation.garden.progressReached).toContain('{{target}}');
    expect(resources.en.translation.garden.progressReached).toContain('{{target}}');
  });
});
