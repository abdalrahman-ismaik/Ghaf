import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../', import.meta.url));

function source(path: string): string {
  return readFileSync(`${root}${path}`, 'utf8');
}

describe('R002b nested screen system-inset hardening', () => {
  it('protects footerless content from the Android bottom system inset', () => {
    const shell = source('src/components/r002b/R002bNestedScreen.tsx');

    expect(shell).toContain('const safeAreaEdges = footer');
    expect(shell).toContain("['top', 'left', 'right', 'bottom']");
    expect(shell).toContain('safeAreaEdges={safeAreaEdges}');
  });

  it('keeps the Reveal busy action readable instead of dimming its whole control', () => {
    const primitives = source('src/components/primitives.tsx');
    const reveal = source('src/components/r002b/RevealBundleScreen.tsx');

    expect(primitives).toContain('dimWhenDisabled?: boolean');
    expect(primitives).toContain('isDisabled && dimWhenDisabled');
    expect(reveal).toContain('dimWhenDisabled={false}');
  });

  it('turns off native route transitions when the system requests reduced motion', () => {
    const layout = source('app/_layout.tsx');

    expect(layout).toContain("import { useReducedMotion } from 'react-native-reanimated'");
    expect(layout).toContain("animation: reducedMotion ? 'none' : 'fade'");
  });
});
