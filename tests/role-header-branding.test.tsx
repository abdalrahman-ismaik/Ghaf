import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../', import.meta.url));

function source(relativePath: string) {
  return readFileSync(`${root}${relativePath}`, 'utf8');
}

const compactHeaderFiles = [
  'src/components/r002a/parent/ParentHomeHeader.tsx',
  'src/components/r002a/child/ChildHomeHeader.tsx',
  'src/components/r002a/R002aFlowHeader.tsx',
  'src/components/r002b/R002bNestedScreen.tsx',
] as const;

const routeHeaderInventory = [
  ['app/parent/index.tsx', 'ParentHomeHeader'],
  ['app/parent/family/index.tsx', 'ParentHomeHeader'],
  ['app/garden.tsx', 'ParentHomeHeader'],
  ['app/child/index.tsx', 'ChildHomeHeader'],
  ['app/league.tsx', 'ChildHomeHeader'],
  ['app/garden.tsx', 'ChildHomeHeader'],
  ['src/components/family-growth/ParentTaskComposer.tsx', 'R002aFlowHeader'],
  ['src/components/family-growth/ParentCheckIn.tsx', 'R002aFlowHeader'],
  ['app/parent/task/review.tsx', 'R002aFlowHeader'],
  ['app/parent/settings/index.tsx', 'R002aFlowHeader'],
  ['app/parent/settings/permissions.tsx', 'R002aFlowHeader'],
  ['app/parent/settings/devices.tsx', 'R002aFlowHeader'],
  ['app/parent/reauthenticate.tsx', 'R002aFlowHeader'],
  ['app/parent/family/reward.tsx', 'R002aFlowHeader'],
  ['app/child/task.tsx', 'R002aFlowHeader'],
  ['app/child/settings.tsx', 'R002aFlowHeader'],
  ['app/child/reveal/[bundleId].tsx', 'R002bNestedScreen'],
  ['app/circle/shared-growth.tsx', 'R002bNestedScreen'],
  ['app/garden/impact-path.tsx', 'R002bNestedScreen'],
  ['app/parent/family/shared-garden.tsx', 'R002bNestedScreen'],
  ['app/parent/family/[profileId]/progress.tsx', 'R002bNestedScreen'],
  ['app/garden/learn/[learningId]/accessible.tsx', 'R002bNestedScreen'],
  ['app/garden/learn/[learningId]/story.tsx', 'R002bNestedScreen'],
  ['app/garden/badges/index.tsx', 'R002bNestedScreen'],
  ['app/garden/badges/[badgeId].tsx', 'R002bNestedScreen'],
  ['app/circle.tsx', 'JourneyHeader'],
] as const;

describe('role header branding', () => {
  it('keeps the approved 5A local mark as the sole logo source', () => {
    const assetPath = `${root}assets/brand/ghaf/ghaf-mark-full-color-1024.png`;
    const rasterLogo = source('src/components/brand/GhafRasterLogo.tsx');

    expect(createHash('sha256').update(readFileSync(assetPath)).digest('hex')).toBe(
      'f30e8925f3ff56b3fddbf5c3d653e2a309e99d7af48fefaa30bdc2e704d8c40b',
    );
    expect(rasterLogo).toContain(
      "require('../../../assets/brand/ghaf/ghaf-mark-full-color-1024.png')",
    );
    expect(rasterLogo).not.toMatch(/https?:\/\//u);
  });

  it('defines one compact, logical, decorative mark and title composition', () => {
    const path = 'src/components/brand/GhafHeaderTitle.tsx';

    expect(existsSync(`${root}${path}`)).toBe(true);
    const headerTitle = source(path);
    expect(headerTitle).toContain('<GhafRasterLogo');
    expect(headerTitle).toContain('decorative');
    expect(headerTitle).toContain('accessibilityRole="header"');
    expect(headerTitle).toContain('logicalRowDirection(direction)');
    expect(headerTitle).toMatch(/root:\s*\{[\s\S]*?maxWidth:\s*'100%'/u);
    expect(headerTitle).toMatch(/root:\s*\{[\s\S]*?flexWrap:\s*'wrap'/u);
    expect(headerTitle).toMatch(
      /title:\s*\{[\s\S]*?maxWidth:\s*'100%'[\s\S]*?minWidth:\s*0[\s\S]*?flexShrink:\s*0/u,
    );
    expect(headerTitle).not.toMatch(/numberOfLines|ellipsizeMode|allowFontScaling=\{false\}/u);
    expect(source('src/components/brand/index.ts')).toContain("from './GhafHeaderTitle'");
  });

  it('brands every compact Parent and Child header through the shared composition', () => {
    for (const path of compactHeaderFiles) {
      const contents = source(path);
      expect(contents, path).toContain("from '@/components/brand'");
      expect(contents, path).toContain('<GhafHeaderTitle');
      expect(contents, path).not.toContain('<GhafRasterLogo');
    }
  });

  it('brands the structurally distinct journey title without changing its controls', () => {
    const journey = source('src/components/journey.tsx');

    expect(journey).toContain("import { GhafRasterLogo } from '@/components/brand'");
    expect(journey).toContain('<GhafRasterLogo decorative');
    expect(journey).toContain('styles.headerTitleRow');
    expect(journey).toContain("direction === 'rtl' ? styles.rowRtl : styles.rowLtr");
    expect(journey).toContain('accessibilityRole="header"');
    expect(journey).toContain('<IconButton');
  });

  it('keeps routes thin and lets every released role screen inherit shared branding', () => {
    for (const [path, header] of routeHeaderInventory) {
      const contents = source(path);
      expect(contents, path).toContain(`<${header}`);
      expect(contents, path).not.toContain('GhafRasterLogo');
      expect(contents, path).not.toContain('GhafHeaderTitle');
    }
  });
});
