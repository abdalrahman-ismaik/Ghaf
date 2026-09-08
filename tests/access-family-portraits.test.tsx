import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const repositoryRoot = resolve(import.meta.dirname, '..');
const originalParentPath = resolve(
  repositoryRoot,
  'assets/images/access/parent-emirati/parent-access-emirati.jpg',
);
const parentFamilyPath = resolve(
  repositoryRoot,
  'assets/images/access/parent-emirati/parent-access-emirati-family-v2.jpg',
);
const childFamilyPath = resolve(
  repositoryRoot,
  'assets/images/access/child-emirati/child-access-emirati-v1.jpg',
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

function jpegHasComment(bytes: Buffer): boolean {
  let offset = 2;
  while (offset + 4 <= bytes.length && bytes[offset] === 0xff) {
    const marker = bytes[offset + 1];
    if (marker === 0xda) break;
    const length = bytes.readUInt16BE(offset + 2);
    if (marker === 0xfe) return true;
    offset += 2 + length;
  }
  return false;
}

describe('Feature 009 access family portraits', () => {
  it('preserves v1 and ships bounded local 3:2 Parent and Child assets', () => {
    expect(existsSync(originalParentPath)).toBe(true);
    expect(existsSync(parentFamilyPath)).toBe(true);
    expect(existsSync(childFamilyPath)).toBe(true);

    for (const path of [parentFamilyPath, childFamilyPath]) {
      const bytes = readFileSync(path);
      expect(bytes.byteLength).toBeGreaterThan(20_000);
      expect(bytes.byteLength).toBeLessThanOrEqual(500_000);
      expect(jpegDimensions(bytes)).toEqual({ height: 800, width: 1200 });
    }

    expect(jpegHasComment(readFileSync(originalParentPath))).toBe(false);
    expect(jpegHasComment(readFileSync(parentFamilyPath))).toBe(false);
    expect(jpegHasComment(readFileSync(childFamilyPath))).toBe(false);
  });

  it('uses exact responsive 3:2 frames on Welcome and both access components', () => {
    const welcome = source('app/index.tsx');
    const parent = source('src/components/access/ParentAccessPortrait.tsx');
    const child = source('src/components/access/ChildAccessPortrait.tsx');

    expect(welcome).toContain('aspectRatio: 3 / 2');
    expect(welcome).not.toContain('height: 168');
    for (const component of [parent, child]) {
      expect(component).toContain("from 'expo-image'");
      expect(component).toContain('aspectRatio: 3 / 2');
      expect(component).toContain('cachePolicy="memory-disk"');
      expect(component).toContain('contentFit="cover"');
      expect(component).toContain('contentPosition="center"');
      expect(component).toContain('importantForAccessibility="no-hide-descendants"');
      expect(component).toContain('accessibilityElementsHidden');
      expect(component).toContain('onError={() => setFailed(true)}');
      expect(component).toContain('if (failed) return null');
      expect(component).not.toContain('Pressable');
      expect(component).not.toContain('usePrototypeStore');
    }
    expect(parent).not.toContain('compact');
    expect(parent).not.toMatch(/height:\s*\d+/u);
    expect(child).not.toMatch(/height:\s*\d+/u);
  });

  it('keeps portraits local, versioned, and separate from access actions', () => {
    const parentAssets = source('src/components/access/parentAccessAssets.ts');
    const childAssets = source('src/components/access/childAccessAssets.ts');
    const childRoute = source('app/access/child/index.tsx');
    const accessExports = source('src/components/access/index.ts');

    expect(parentAssets).toContain('parent-access-emirati-family-v2.jpg');
    expect(childAssets).toContain('child-access-emirati-v1.jpg');
    expect(`${parentAssets}\n${childAssets}`).not.toMatch(/https?:\/\//u);
    expect(accessExports).toContain("export * from './ChildAccessPortrait'");

    const portraitIndex = childRoute.indexOf('<ChildAccessPortrait');
    const profilesIndex = childRoute.indexOf('<View style={styles.profiles}>');
    expect(portraitIndex).toBeGreaterThan(-1);
    expect(profilesIndex).toBeGreaterThan(portraitIndex);
    expect(childRoute).toContain('testID={`choose-${child.id.replace');
  });

  it('settles each portrait only in its non-critical destination preload', () => {
    const startup = source('src/features/startup/preloadStartupImages.ts');

    expect(startup).toContain('parentAccessPortraitSource');
    expect(startup).toContain('childAccessPortraitSource');
    expect(startup).toContain("'parent-access': [parentAccessPortraitSource");
    expect(startup).toContain("'child-access': [childAccessPortraitSource");

    const criticalBlock = startup.slice(
      startup.indexOf('startupCriticalImageSources'),
      startup.indexOf('startupImageSources'),
    );
    expect(criticalBlock).not.toContain('parentAccessPortraitSource');
    expect(criticalBlock).not.toContain('childAccessPortraitSource');
  });

  it('records exact local generation truth and unclaimed human review', () => {
    const parentProvenance = source('assets/images/access/parent-emirati/PROVENANCE.md');
    const childProvenance = source('assets/images/access/child-emirati/PROVENANCE.md');

    for (const provenance of [parentProvenance, childProvenance]) {
      expect(provenance).toContain('synthetic image generation using no real-person input');
      expect(provenance).toContain('Product authority: none');
      expect(provenance).toContain('Named Emirati cultural review: `NOT RUN`');
      expect(provenance).toContain('Physical Android rendering: `NOT RUN`');
    }
  });
});
