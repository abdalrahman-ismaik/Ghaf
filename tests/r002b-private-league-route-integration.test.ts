import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const source = (relativePath: string) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

describe('R002b private League route integration', () => {
  it('mounts one guarded Child root that consumes the League presentation adapter', () => {
    const route = source('app/league.tsx');

    expect(route).toContain("routeId: 'private_league'");
    expect(route).toContain('r002bFeatureFlags');
    expect(route).toContain('buildPrivateLeaguePresentation');
    expect(route).toContain('<PrivateLeagueScreen');
    expect(route).toContain('recognitionLedger');
    expect(route).toContain('<Redirect href="/child"');
    expect(route).not.toMatch(/confirmChallengeLeaf|createFamilyLeagueWeek|calculateWeeklyGrowth/u);
  });

  it('enables the League tab only through an explicit handler and preserves R002a fallback', () => {
    const navigation = source('src/components/r002a/child/ChildBottomNavigation.tsx');
    const today = source('app/child/index.tsx');
    const garden = source('app/garden.tsx');

    expect(navigation).toContain('onLeague?: () => void');
    expect(navigation).toContain("id: 'league'");
    expect(navigation).toContain('disabled: !onLeague');
    expect(today).toContain('r002bFeatureFlags.r002b_progression_engine');
    expect(today).toContain("router.replace('/league')");
    expect(garden).toContain('r002bFeatureFlags.r002b_progression_engine');
    expect(garden).toContain("router.replace('/league')");
  });

  it('uses the approved physical Arabic labels and keeps Green Circle separate', () => {
    const resources = source('src/i18n/resources.ts');
    const route = source('app/league.tsx');

    expect(resources).toMatch(/navigation:\s*\{[\s\S]*?childGarden: 'حديقتي'/u);
    expect(resources).toMatch(/navigation:\s*\{[\s\S]*?garden: 'الحديقة'/u);
    expect(resources).toContain("league: 'الدوري'");
    expect(route).not.toContain("'/circle'");
    expect(route).not.toContain('GreenCircle');
  });

  it('defines the missing surface before implementation and does not depend on exported web UI', () => {
    const specification = source(
      'docs/design/stitch/releases/ghaf-r002b/screens/12-private-league/screen-spec.md',
    );
    const component = source('src/components/r002b/PrivateLeagueScreen.tsx');

    expect(specification).toContain('RELEASE ACTIVATION BLOCKED');
    expect(specification).toContain('`/league`');
    expect(component).not.toMatch(/WebView|iframe|<div|<img|className|dangerouslySetInnerHTML/u);
    expect(component).toContain('flexDirection: logicalRowDirection(direction)');
    expect(component).toContain("compact ? 'column' : logicalRowDirection(direction)");
  });

  it('uses a provenance-tagged summary without manufacturing hidden task history', () => {
    const presentation = source('src/features/league/presentation.ts');

    expect(presentation).toContain("provenance: 'approved_synthetic_reset_summary'");
    expect(presentation).not.toContain('fixture-private-league-task');
    expect(presentation).toContain("actionKind !== 'eligible_household_acquisition'");
    expect(presentation).toContain("sourceScope !== 'household'");
  });
});
