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
    const layout = source('app/child/_layout.tsx');

    expect(existsSync(`${root}${routePath}`)).toBe(true);
    expect(route).toContain('<R002bNestedScreen');
    expect(route).toContain('<RevealBundleScreen');
    expect(route).toContain('<RevealBundleActionBar');
    expect(route).toContain('footer={');
    expect(route).not.toContain('ChildBottomNavigation');
    expect(layout).toContain('name="reveal/[bundleId]"');
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

  it('retires the matching legacy Garden celebration once an authoritative approval reveal is acknowledged', () => {
    const route = source(routePath);

    expect(route).toContain('isLegacyGardenCelebrationReplacement');
    expect(route).toContain("bundle.triggerKind !== 'task_approval'");
    expect(route).toContain("receipt.consequence.kind === 'seed'");
    expect(route).toContain("receipt.consequence.kind === 'plant_stage'");
    expect(route).toContain('consumeCelebration');
    expect(route).toContain('return consumeCelebration().ok');
    expect(route).toContain('consumeReplacedLegacyCelebration(acknowledged.data.bundle)');
    expect(route).toContain('consumeReplacedLegacyCelebration(bundle)');
    expect(
      route.indexOf('consumeReplacedLegacyCelebration(acknowledged.data.bundle)'),
    ).toBeLessThan(route.indexOf('const archived = archiveRevealPresentation(bundle.id)'));
  });

  it('distinguishes a normal first start from a recovered already-presenting mount', () => {
    const route = source(routePath);

    expect(route).toContain(
      "const [enteredAsPresenting] = useState(() => bundle?.lifecycle === 'presenting')",
    );
    expect(route).toContain("recoveryState: enteredAsPresenting ? 'recovered' : 'stable'");
    expect(route).not.toContain("recoveryState: started ? 'stable' : 'interrupted'");
    expect(route).toContain('<RevealBundleScreen initialFocus');
  });

  it('recovers an acknowledged interruption and applies the same lifecycle policy to every Back', () => {
    const route = source(routePath);

    expect(route).toContain("bundle.lifecycle !== 'acknowledged'");
    expect(route).toContain("bundle?.lifecycle !== 'acknowledged'");
    expect(route).toContain('archiveRevealPresentation(bundle.id)');
    expect(route).toContain('onBack={dismissPresentation}');
    expect(route).toContain('onAcknowledge: dismissPresentation');
    expect(route).not.toContain('onBack={onBack}');
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

  it('returns to a stable Child Today region after the Reveal action disappears', () => {
    const child = source('app/child/index.tsx');

    expect(child).toContain("params.restoreFocusTarget === 'open-r002b-reveal-button'");
    expect(child).toContain('const focusRevealReturn = useCallback');
    expect(child).toContain('focusAccessibilityTarget(revealReturnFocusRef.current)');
    expect(child).toContain('revealReturnFocusApplied.current = false;');
    expect(child).toContain('focusRevealReturn();');
    expect(child).toContain('onLayout={focusRevealReturn}');
    expect(child).toContain('nativeID="open-r002b-reveal-button"');
    expect(child).toContain("bundle.lifecycle === 'acknowledged'");
  });

  it('shows the Growth destination only when its independent Impact Path flag is enabled', () => {
    const route = source(routePath);

    expect(route).toMatch(
      /onOpenGrowth:\s*r002bFeatureFlags\.r002b_impact_path_ui\s*\?[\s\S]*?finishPresentation\('growth'\)[\s\S]*?:\s*undefined/u,
    );
  });
});
