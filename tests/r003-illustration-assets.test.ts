import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const repositoryRoot = resolve(import.meta.dirname, '..');
const manifestPath = resolve(
  repositoryRoot,
  'assets/images/illustrations/r003/ASSET_MANIFEST.json',
);

const expectedAssetIds = [
  'field-paper',
  'welcome-ghaf-habitat',
  'onboarding-ghaf-intro',
  'onboarding-action',
  'onboarding-support',
  'onboarding-growth',
  'section-transition',
  'avatar-ghaf',
  'avatar-leaf',
  'avatar-flower',
  'avatar-energy-leaf',
  'avatar-water-drop',
  'task-recycling',
  ...['ghaf', 'samar', 'sidr', 'date-palm', 'mangrove'].flatMap((landscape) =>
    ['seed', 'shoot', 'sapling', 'shade', 'flourishing'].map((stage) => `${landscape}-${stage}`),
  ),
  'family-canopy-19',
  'family-canopy-20',
  'circle-garden-1',
  'circle-garden-2',
  'circle-garden-3',
  'recognition-reveal',
  'mangrove-habitat',
  'shared-coastal-canopy',
] as const;

const expectedSourceDimensions: Readonly<
  Record<(typeof expectedAssetIds)[number], { readonly height: number; readonly width: number }>
> = {
  'field-paper': { height: 1672, width: 941 },
  'welcome-ghaf-habitat': { height: 1024, width: 1536 },
  'onboarding-ghaf-intro': { height: 1024, width: 1536 },
  'onboarding-action': { height: 1024, width: 1536 },
  'onboarding-support': { height: 1024, width: 1536 },
  'onboarding-growth': { height: 1024, width: 1536 },
  'section-transition': { height: 1536, width: 1024 },
  'avatar-ghaf': { height: 1254, width: 1254 },
  'avatar-leaf': { height: 1254, width: 1254 },
  'avatar-flower': { height: 1254, width: 1254 },
  'avatar-energy-leaf': { height: 1254, width: 1254 },
  'avatar-water-drop': { height: 1254, width: 1254 },
  'task-recycling': { height: 887, width: 1774 },
  'ghaf-seed': { height: 964, width: 1632 },
  'ghaf-shoot': { height: 963, width: 1634 },
  'ghaf-sapling': { height: 963, width: 1634 },
  'ghaf-shade': { height: 964, width: 1631 },
  'ghaf-flourishing': { height: 965, width: 1630 },
  'samar-seed': { height: 964, width: 1631 },
  'samar-shoot': { height: 964, width: 1632 },
  'samar-sapling': { height: 964, width: 1632 },
  'samar-shade': { height: 954, width: 1648 },
  'samar-flourishing': { height: 954, width: 1648 },
  'sidr-seed': { height: 964, width: 1631 },
  'sidr-shoot': { height: 964, width: 1631 },
  'sidr-sapling': { height: 964, width: 1632 },
  'sidr-shade': { height: 965, width: 1630 },
  'sidr-flourishing': { height: 965, width: 1629 },
  'date-palm-seed': { height: 964, width: 1632 },
  'date-palm-shoot': { height: 964, width: 1632 },
  'date-palm-sapling': { height: 963, width: 1634 },
  'date-palm-shade': { height: 964, width: 1632 },
  'date-palm-flourishing': { height: 965, width: 1630 },
  'mangrove-seed': { height: 964, width: 1631 },
  'mangrove-shoot': { height: 964, width: 1632 },
  'mangrove-sapling': { height: 964, width: 1632 },
  'mangrove-shade': { height: 965, width: 1630 },
  'mangrove-flourishing': { height: 965, width: 1630 },
  'family-canopy-19': { height: 1067, width: 1474 },
  'family-canopy-20': { height: 1067, width: 1474 },
  'circle-garden-1': { height: 1115, width: 1411 },
  'circle-garden-2': { height: 1114, width: 1412 },
  'circle-garden-3': { height: 1114, width: 1411 },
  'recognition-reveal': { height: 1254, width: 1254 },
  'mangrove-habitat': { height: 992, width: 1586 },
  'shared-coastal-canopy': { height: 992, width: 1586 },
};

interface ArtworkManifestAsset {
  readonly accessibility: 'decorative' | 'informative';
  readonly final: {
    readonly bytes: number;
    readonly height: number;
    readonly path: string;
    readonly sha256: string;
    readonly width: number;
  };
  readonly generatedAt: string;
  readonly generator: string;
  readonly id: string;
  readonly prompt: string;
  readonly reviewStatus: string;
  readonly routes: readonly string[];
  readonly source: {
    readonly format: 'RGB PNG';
    readonly height: number;
    readonly width: number;
  };
  readonly transformations: readonly string[];
}

interface ArtworkManifest {
  readonly assets: readonly ArtworkManifestAsset[];
  readonly assetRoot: string;
  readonly direction: string;
  readonly generatedArtworkIsProductStateAuthority: boolean;
  readonly version: number;
}

function source(relativePath: string): string {
  return readFileSync(resolve(repositoryRoot, relativePath), 'utf8');
}

function sha256(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function jpegDimensions(bytes: Buffer): { readonly height: number; readonly width: number } {
  expect(bytes[0]).toBe(0xff);
  expect(bytes[1]).toBe(0xd8);

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
    const isStartOfFrame = marker === 0xc0 || marker === 0xc1 || marker === 0xc2 || marker === 0xc3;
    if (isStartOfFrame) {
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

describe('R003 generated natural artwork contract', () => {
  it('ships the exact 46-asset local manifest with complete provenance', () => {
    expect(existsSync(manifestPath)).toBe(true);
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as ArtworkManifest;

    expect(manifest.version).toBe(1);
    expect(manifest.assetRoot).toBe('assets/images/illustrations/r003/final');
    expect(manifest.direction).toBe('Quiet UAE Botanical Editorial');
    expect(manifest.generatedArtworkIsProductStateAuthority).toBe(false);
    expect(manifest.assets).toHaveLength(46);
    expect(manifest.assets.map(({ id }) => id).sort()).toEqual([...expectedAssetIds].sort());
    expect(new Set(manifest.assets.map(({ final }) => final.sha256)).size).toBe(46);

    for (const asset of manifest.assets) {
      expect(asset.generator).toBe('OpenAI imagegen');
      expect(asset.generatedAt).toBe('2026-09-06');
      expect(asset.source).toEqual({
        format: 'RGB PNG',
        ...expectedSourceDimensions[asset.id as (typeof expectedAssetIds)[number]],
      });
      expect(asset.prompt.length).toBeGreaterThan(240);
      expect(asset.prompt).toMatch(/(?:No|Avoid:|Constraints:)[\s\S]{0,1500}\billustration\b/iu);
      expect(asset.prompt).toMatch(
        /(?:No|Avoid:|Constraints:)[\s\S]{0,1500}\b(?:people|person)\b/iu,
      );
      expect(asset.routes.length).toBeGreaterThan(0);
      expect(asset.transformations.length).toBeGreaterThan(0);
      expect(asset.reviewStatus).toBe('curated-local-candidate');
      expect(asset.final.path).toMatch(
        /^assets\/images\/illustrations\/r003\/final\/[a-z0-9-]+\.jpg$/u,
      );
      expect(asset.final.sha256).toMatch(/^[a-f0-9]{64}$/u);
      expect(asset.final.bytes).toBeGreaterThan(10_000);
      expect(asset.final.bytes).toBeLessThanOrEqual(500_000);

      const absolutePath = resolve(repositoryRoot, asset.final.path);
      expect(existsSync(absolutePath), asset.id).toBe(true);
      const bytes = readFileSync(absolutePath);
      expect(bytes.byteLength).toBe(asset.final.bytes);
      expect(sha256(bytes)).toBe(asset.final.sha256);
      expect(jpegEmbeddedPrompt(bytes)).toBe(asset.prompt);
      expect(jpegDimensions(bytes)).toEqual({
        height: asset.final.height,
        width: asset.final.width,
      });
    }
  });

  it('uses literal local sources and an accessibility-aware Expo image primitive', () => {
    const registry = source('src/components/illustrations/illustrationSources.ts');
    const localIllustration = source('src/components/illustrations/LocalIllustration.tsx');

    expect(registry).not.toMatch(/https?:\/\//u);
    expect(registry.match(/require\(/gu)).toHaveLength(46);
    for (const id of expectedAssetIds) expect(registry).toContain(`'${id}'`);
    expect(registry).toContain('landscapeArtworkSources');
    expect(registry).toContain('familyCanopyArtworkSources');
    expect(registry).toContain('circleGardenArtworkSources');
    expect(registry).toContain('leagueAvatarArtworkIds');
    expect(localIllustration).toContain("from 'expo-image'");
    expect(localIllustration).toContain('accessibilityLabel');
    expect(localIllustration).toContain('decorative');
    expect(localIllustration).toContain('onError');
    expect(localIllustration).toContain('useReducedMotion');
  });

  it('removes scenic drawing implementations while retaining live UI geometry', () => {
    const scenicSources = [
      'src/components/access/AccessShell.tsx',
      'src/components/access/BotanicalAvatar.tsx',
      'src/components/r002a/R002aScreen.tsx',
      'src/components/r002a/child/ChildTaskHero.tsx',
      'src/components/family-growth/GardenLandscape.tsx',
      'src/components/family-growth/FamilyCanopy.tsx',
      'src/components/family-growth/CircleProgress.tsx',
      'src/components/r002b/LearningScreens.tsx',
      'src/components/r002b/RevealBundleScreen.tsx',
      'src/components/r002b/SharedGrowthScreens.tsx',
      'src/components/r002b/PrivateLeagueScreen.tsx',
    ].map(source);
    const combined = scenicSources.join('\n');

    expect(combined).not.toContain('function LandscapeSpecimen');
    expect(combined).not.toContain('function GardenSilhouette');
    expect(combined).not.toContain('function MangroveHabitatDiagram');
    expect(combined).not.toContain('function RevealBotanicalScene');
    expect(combined).not.toContain('function SharedCoastalCanopyScene');
    expect(combined).not.toContain('heroBotanicalMark');
    expect(source('src/components/access/AccessShell.tsx')).not.toContain('<Svg');
    expect(source('src/components/r002a/R002aScreen.tsx')).not.toContain('<Svg');
    expect(source('src/components/access/BotanicalAvatar.tsx')).not.toContain('<GhafIcon');
    expect(source('src/components/r002b/PrivateLeagueScreen.tsx')).not.toContain('AVATAR_ICON');
  });

  it('keeps official brand assets outside the generated-artwork registry', () => {
    const registry = source('src/components/illustrations/illustrationSources.ts');
    const manifest = readFileSync(manifestPath, 'utf8');

    expect(registry).not.toContain('assets/brand/ghaf');
    expect(manifest).not.toContain('assets/brand/ghaf');
    expect(source('src/components/brand/GhafMark.tsx')).toContain('react-native-svg');
  });
});
