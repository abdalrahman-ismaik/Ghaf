import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../', import.meta.url));

function source(path: string): string {
  return existsSync(`${root}${path}`) ? readFileSync(`${root}${path}`, 'utf8') : '';
}

const routePath = 'app/child/reveal/[bundleId].tsx';

describe('R002b combined RevealBundle route integration', () => {
  it('mounts a route-owned modal candidate with one scroll owner and fixed-safe actions', () => {
    const route = source(routePath);
    const layout = source('app/_layout.tsx');

    expect(existsSync(`${root}${routePath}`)).toBe(true);
    expect(route).toContain('<R002bNestedScreen');
    expect(route).toContain('<RevealBundleScreen');
    expect(route).toContain('<RevealBundleActionBar');
    expect(route).toContain('footer={');
    expect(route).not.toContain('ChildBottomNavigation');
    expect(layout).toContain('name="child/reveal/[bundleId]"');
    expect(layout).toContain("presentation: 'modal'");
  });

  it('guards role, flag, active profile, bundle identity, queue evidence, and typed origin', () => {
    const route = source(routePath);

    expect(route).toContain("routeId: 'child_reveal'");
    expect(route).toContain('resolveR002bRouteRequest');
    expect(route).toMatch(/if \(!access\.allowed\) return <Redirect/u);
    expect(route).toContain('authorizedProfileIds: [activeChildId]');
    expect(route).toContain('r002bFeatureFlags');
    expect(route).toContain("'child_today_reveal_handoff'");
    expect(route).toContain('revealBundleQueue.bundles.find');
    expect(route).toContain('bundle.profileEpochId !== profileEpochId');
  });

  it('starts, acknowledges, and archives through store lifecycle actions only', () => {
    const route = source(routePath);

    expect(route).toContain('startRevealPresentation');
    expect(route).toContain('acknowledgeRevealPresentation');
    expect(route).toContain('archiveRevealPresentation');
    expect(route).not.toMatch(
      /(?:constructRevealBundle|applyRecognition|awardBadge|seedDelta\s*:|landscapeGrowth\s*:)/u,
    );
  });

  it('keeps the R002a fallback and exposes a pending handoff only behind the default-off flag', () => {
    const child = source('app/child/index.tsx');

    expect(child).toContain('r002bFeatureFlags.r002b_reveal_bundle_v2');
    expect(child).toContain('revealBundleQueue');
    expect(child).toContain("id: 'child_today_reveal_handoff'");
    expect(child).toContain("pathname: '/child/reveal/[bundleId]'");
    expect(child).toContain("testID: 'open-r002b-reveal-button'");
    expect(child).toContain("testID: 'open-recognized-garden-button'");
  });
});
