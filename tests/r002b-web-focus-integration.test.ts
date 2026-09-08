import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../', import.meta.url));

function source(relativePath: string) {
  return readFileSync(`${root}${relativePath}`, 'utf8');
}

describe('R002b web-safe focus integration', () => {
  it('routes Shared Growth focus through the cross-platform helper', () => {
    const sharedGrowth = source('src/components/r002b/SharedGrowthScreens.tsx');

    expect(sharedGrowth).toContain("from '@/utils/accessibilityFocus'");
    expect(sharedGrowth.match(/focusAccessibilityTarget\(/gu)).toHaveLength(3);
    expect(sharedGrowth).not.toContain('findNodeHandle');
  });

  it('routes Parent Progress return focus through the cross-platform helper', () => {
    const parent = source('app/parent/index.tsx');

    expect(parent).toContain("from '@/utils/accessibilityFocus'");
    expect(parent).toContain('focusAccessibilityTarget(progressEntryRef.current)');
    expect(parent).not.toContain('findNodeHandle');
  });

  it('routes Reveal initial and Child Today return focus through the cross-platform helper', () => {
    const reveal = source('src/components/r002b/RevealBundleScreen.tsx');
    const child = source('app/child/index.tsx');

    expect(reveal).toContain("from '@/utils/accessibilityFocus'");
    expect(reveal).toContain('focusAccessibilityTarget(initialFocusRef.current)');
    expect(child).toContain("from '@/utils/accessibilityFocus'");
    expect(child).toContain('focusAccessibilityTarget(revealReturnFocusRef.current)');
    expect(reveal).not.toContain('findNodeHandle');
    expect(child).not.toContain('findNodeHandle');
  });
});
