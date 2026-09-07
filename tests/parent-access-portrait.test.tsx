import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const repositoryRoot = resolve(import.meta.dirname, '..');
const portraitPath = resolve(
  repositoryRoot,
  'assets/images/access/parent-emirati/parent-access-emirati.jpg',
);

function source(relativePath: string): string {
  return readFileSync(resolve(repositoryRoot, relativePath), 'utf8');
}

function jpegDimensions(bytes: Buffer): { readonly height: number; readonly width: number } {
  let offset = 2;
  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;
    const length = bytes.readUInt16BE(offset);
    if (marker !== undefined && [0xc0, 0xc1, 0xc2, 0xc3].includes(marker)) {
      return {
        height: bytes.readUInt16BE(offset + 3),
        width: bytes.readUInt16BE(offset + 5),
      };
    }
    offset += length;
  }
  throw new Error('JPEG dimensions were not found.');
}

function jpegEmbeddedPrompt(bytes: Buffer): string | null {
  const prefix = 'impeccable:prompt\0';
  let offset = 2;
  while (offset + 4 <= bytes.length && bytes[offset] === 0xff) {
    const marker = bytes[offset + 1];
    if (marker === 0xda) break;
    const length = bytes.readUInt16BE(offset + 2);
    if (marker === 0xfe) {
      const comment = bytes.toString('utf8', offset + 4, offset + 2 + length);
      if (comment.startsWith(prefix)) return comment.slice(prefix.length);
    }
    offset += 2 + length;
  }
  return null;
}

describe('Emirati Parent access portrait', () => {
  it('ships one bounded local synthetic portrait with embedded provenance', () => {
    expect(existsSync(portraitPath)).toBe(true);
    const bytes = readFileSync(portraitPath);

    expect(bytes.byteLength).toBeGreaterThan(20_000);
    expect(bytes.byteLength).toBeLessThanOrEqual(500_000);
    expect(jpegDimensions(bytes)).toEqual({ height: 800, width: 1200 });

    const prompt = jpegEmbeddedPrompt(bytes);
    expect(prompt).toContain('Use case: photorealistic-natural');
    expect(prompt).toContain('fictional adult Emirati father');
    expect(prompt).toContain('No child');
    expect(prompt).toContain('readable text');

    const provenance = source('assets/images/access/parent-emirati/PROVENANCE.md');
    expect(provenance).toContain('OpenAI built-in imagegen');
    expect(provenance).toContain('synthetic adult');
    expect(provenance).toContain('Named Emirati cultural review: `NOT RUN`');
  });

  it('renders through a decorative failure-safe Expo image component', () => {
    const asset = source('src/components/access/parentAccessAssets.ts');
    const component = source('src/components/access/ParentAccessPortrait.tsx');

    expect(asset).toContain("require('../../../assets/images/access/parent-emirati/");
    expect(asset).not.toMatch(/https?:\/\//u);
    expect(component).toContain("from 'expo-image'");
    expect(component).toContain('cachePolicy="memory-disk"');
    expect(component).toContain('contentFit="cover"');
    expect(component).toContain('importantForAccessibility="no-hide-descendants"');
    expect(component).toContain('accessibilityElementsHidden');
    expect(component).toContain('onError={() => setFailed(true)}');
    expect(component).toContain('if (failed) return null');
  });

  it('places the same portrait on all Parent entry steps without changing their actions', () => {
    const routes = [
      'app/access/parent/sign-in.tsx',
      'app/access/parent/sign-up.tsx',
      'app/access/parent/verification.tsx',
    ].map(source);

    for (const route of routes) {
      expect(route).toContain('<ParentAccessPortrait');
    }
    expect(routes[0]).toContain('testID="request-parent-code-button"');
    expect(routes[1]).toContain('testID="request-parent-sign-up-code-button"');
    expect(routes[2]).toContain('testID="verify-parent-code-button"');
  });

  it('preloads the portrait only with the Parent access section', () => {
    const startup = source('src/features/startup/preloadStartupImages.ts');

    expect(startup).toContain('parentAccessPortraitSource');
    expect(startup).toContain("'parent-access': [parentAccessPortraitSource");
    expect(startup).not.toContain('startupCriticalImageSources,\n  parentAccessPortraitSource');
  });
});
