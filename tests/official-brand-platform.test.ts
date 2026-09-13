import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

import { getConfig } from '@expo/config';
import { describe, expect, it } from 'vitest';

import {
  DEFAULT_R002B_FEATURE_FLAGS,
  R002B_FEATURE_FLAG_NAMES,
} from '../src/config/r002bFeatureFlags';

const root = fileURLToPath(new URL('../', import.meta.url));

type DecodedPng = {
  width: number;
  height: number;
  data: Buffer;
};

type PlatformRaster = {
  path: string;
  width: number;
  height: number;
  sha256: string;
  opacity: 'opaque' | 'transparent';
};

const appIconRoot = 'assets/brand/ghaf/app-icon';
const brightPearl = '#F7F8F3';

const platformAssets = {
  icon: {
    path: `${appIconRoot}/icon.png`,
    width: 1024,
    height: 1024,
    sha256: '44bd0b2c27aebbbabcac04c7d2e1858107e551968d3b392fa29291f75309b34c',
    opacity: 'opaque',
  },
  ios: {
    path: `${appIconRoot}/ios-icon-1024.png`,
    width: 1024,
    height: 1024,
    sha256: '44bd0b2c27aebbbabcac04c7d2e1858107e551968d3b392fa29291f75309b34c',
    opacity: 'opaque',
  },
  androidLegacy: {
    path: `${appIconRoot}/android-legacy-icon-1024.png`,
    width: 1024,
    height: 1024,
    sha256: '44bd0b2c27aebbbabcac04c7d2e1858107e551968d3b392fa29291f75309b34c',
    opacity: 'opaque',
  },
  androidAdaptiveForeground: {
    path: `${appIconRoot}/android-adaptive-foreground-1024.png`,
    width: 1024,
    height: 1024,
    sha256: 'cd92b525cdcb53525de7c584d77602f7e7af75220e0def4b4c12a4c5f7f22dbe',
    opacity: 'transparent',
  },
  androidAdaptiveMonochrome: {
    path: `${appIconRoot}/android-adaptive-monochrome-1024.png`,
    width: 1024,
    height: 1024,
    sha256: '144b160309823643f7209f6ba1daf389084baa29b5778228f50daf94733bdff1',
    opacity: 'transparent',
  },
  splash: {
    path: `${appIconRoot}/splash-icon-1024.png`,
    width: 1024,
    height: 1024,
    sha256: '44c2d366cdd176882d4701c58c699f816c01e82d930186a0a9cb23e74730527a',
    opacity: 'transparent',
  },
  favicon32: {
    path: `${appIconRoot}/favicon-32.png`,
    width: 32,
    height: 32,
    sha256: 'd1c008abf714e0094d780582a42892d5cb92d6e44acfb75c2b4c13808f232a95',
    opacity: 'transparent',
  },
  favicon48: {
    path: `${appIconRoot}/favicon-48.png`,
    width: 48,
    height: 48,
    sha256: '876766c9d7eac42847a2b737b2f5725779b79d347b8c58f721c765530054a8f6',
    opacity: 'transparent',
  },
  pwa192: {
    path: `${appIconRoot}/pwa-icon-192.png`,
    width: 192,
    height: 192,
    sha256: '1e6063e6b31770c3b92ec1e4aa03a45882e9f4caff6b94d79639254f6694a92c',
    opacity: 'opaque',
  },
  pwa512: {
    path: `${appIconRoot}/pwa-icon-512.png`,
    width: 512,
    height: 512,
    sha256: '908f18f13c49700f0e68fffd7fbc3f12b42e3c28dd52eae6de4a07f8b25b39f4',
    opacity: 'opaque',
  },
  pwaMaskable512: {
    path: `${appIconRoot}/pwa-maskable-512.png`,
    width: 512,
    height: 512,
    sha256: '4f021290d28a32547d79b6ab2348c83e59f57d25da8c957a1b96060642c5a1d0',
    opacity: 'opaque',
  },
  appleTouch: {
    path: `${appIconRoot}/apple-touch-icon-180.png`,
    width: 180,
    height: 180,
    sha256: '37cb5f688d4356326b80cf85d187f7c6e09f395196596311b48941214a45c492',
    opacity: 'opaque',
  },
} as const;

const platformAssetCases: PlatformRaster[] = Object.values(platformAssets);

const protectedContentComponents = [
  'src/components/access/BotanicalAvatar.tsx',
  'src/components/family-growth/GardenLandscape.tsx',
  'src/components/family-growth/FamilyCanopy.tsx',
  'src/components/r002a/child/ChildTaskHero.tsx',
  'src/components/r002a/child/ChildGardenProgressCard.tsx',
] as const;

function bytes(relativePath: string) {
  return readFileSync(resolve(root, relativePath));
}

function sha256(relativePath: string) {
  return createHash('sha256').update(bytes(relativePath)).digest('hex');
}

function paeth(left: number, above: number, upperLeft: number) {
  const prediction = left + above - upperLeft;
  const leftDistance = Math.abs(prediction - left);
  const aboveDistance = Math.abs(prediction - above);
  const upperLeftDistance = Math.abs(prediction - upperLeft);

  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) return left;
  return aboveDistance <= upperLeftDistance ? above : upperLeft;
}

function decode(relativePath: string) {
  const content = bytes(relativePath);
  expect(content.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

  const width = content.readUInt32BE(16);
  const height = content.readUInt32BE(20);
  const bitDepth = content.readUInt8(24);
  const colorType = content.readUInt8(25);
  const interlaceMethod = content.readUInt8(28);
  const idatChunks: Buffer[] = [];
  let hasTransparencyChunk = false;
  let offset = 8;

  while (offset < content.length) {
    const chunkLength = content.readUInt32BE(offset);
    const type = content.toString('ascii', offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + chunkLength;
    if (type === 'IDAT') idatChunks.push(content.subarray(dataStart, dataEnd));
    if (type === 'tRNS') hasTransparencyChunk = true;
    offset = dataEnd + 4;
  }

  expect(bitDepth).toBe(8);
  expect(interlaceMethod).toBe(0);
  expect([2, 6]).toContain(colorType);
  expect(hasTransparencyChunk).toBe(false);

  const channels = colorType === 6 ? 4 : 3;
  const stride = width * channels;
  const scanlines = inflateSync(Buffer.concat(idatChunks));
  expect(scanlines.length).toBe(height * (stride + 1));

  const previous = Buffer.alloc(stride);
  const current = Buffer.alloc(stride);
  const data = Buffer.alloc(width * height * 4);
  let cursor = 0;

  for (let row = 0; row < height; row += 1) {
    const filter = scanlines.readUInt8(cursor);
    expect([0, 1, 2, 3, 4]).toContain(filter);
    cursor += 1;

    for (let column = 0; column < stride; column += 1) {
      const encoded = scanlines.readUInt8(cursor);
      cursor += 1;
      const left = column >= channels ? current.readUInt8(column - channels) : 0;
      const above = previous.readUInt8(column);
      const upperLeft = column >= channels ? previous.readUInt8(column - channels) : 0;
      let predictor = 0;

      if (filter === 1) predictor = left;
      else if (filter === 2) predictor = above;
      else if (filter === 3) predictor = Math.floor((left + above) / 2);
      else if (filter === 4) predictor = paeth(left, above, upperLeft);

      current.writeUInt8((encoded + predictor) & 0xff, column);
    }

    for (let pixel = 0; pixel < width; pixel += 1) {
      const sourceOffset = pixel * channels;
      const targetOffset = (row * width + pixel) * 4;
      data.writeUInt8(current.readUInt8(sourceOffset), targetOffset);
      data.writeUInt8(current.readUInt8(sourceOffset + 1), targetOffset + 1);
      data.writeUInt8(current.readUInt8(sourceOffset + 2), targetOffset + 2);
      data.writeUInt8(
        colorType === 6 ? current.readUInt8(sourceOffset + 3) : 255,
        targetOffset + 3,
      );
    }

    previous.set(current);
  }

  return { width, height, data };
}

function alphaBounds(image: DecodedPng) {
  let minX = image.width;
  let minY = image.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      if (image.data[(y * image.width + x) * 4 + 3] === 0) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  return { minX, minY, maxX, maxY };
}

function everyAlpha(image: DecodedPng, predicate: (alpha: number) => boolean) {
  for (let index = 3; index < image.data.length; index += 4) {
    if (!predicate(image.data[index] ?? 0)) return false;
  }
  return true;
}

function nestedFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? nestedFiles(path) : [path];
  });
}

describe('official Ghaf platform branding', () => {
  it.each(platformAssetCases)(
    'preserves approved raster $path byte-for-byte with its exact image class',
    (asset) => {
      expect(existsSync(resolve(root, asset.path)), asset.path).toBe(true);
      expect(sha256(asset.path), asset.path).toBe(asset.sha256);

      const image = decode(asset.path);
      expect([image.width, image.height], asset.path).toEqual([asset.width, asset.height]);

      if (asset.opacity === 'opaque') {
        expect(
          everyAlpha(image, (alpha) => alpha === 255),
          asset.path,
        ).toBe(true);
      } else {
        expect(
          everyAlpha(image, (alpha) => alpha === 255),
          asset.path,
        ).toBe(false);
        expect(
          everyAlpha(image, (alpha) => alpha === 0),
          asset.path,
        ).toBe(false);
      }
    },
  );

  it('keeps adaptive and splash artwork within the validated transparent bounds', () => {
    const foreground = decode(platformAssets.androidAdaptiveForeground.path);
    const monochrome = decode(platformAssets.androidAdaptiveMonochrome.path);
    const splash = decode(platformAssets.splash.path);

    expect(alphaBounds(foreground)).toEqual({ minX: 207, minY: 324, maxX: 816, maxY: 699 });
    expect(alphaBounds(monochrome)).toEqual({ minX: 207, minY: 324, maxX: 816, maxY: 699 });
    expect(alphaBounds(splash)).toEqual({ minX: 297, minY: 379, maxX: 726, maxY: 644 });

    const guaranteedSafeInset = Math.floor((1024 - (1024 * 66) / 108) / 2);
    const guaranteedSafeLimit = 1023 - guaranteedSafeInset;
    for (const image of [foreground, monochrome]) {
      const bounds = alphaBounds(image);
      expect(bounds.minX).toBeGreaterThanOrEqual(guaranteedSafeInset);
      expect(bounds.minY).toBeGreaterThanOrEqual(guaranteedSafeInset);
      expect(bounds.maxX).toBeLessThanOrEqual(guaranteedSafeLimit);
      expect(bounds.maxY).toBeLessThanOrEqual(guaranteedSafeLimit);
    }
  });

  it('keeps iOS artwork opaque and full-bleed without pre-rounded corners', () => {
    const image = decode(platformAssets.ios.path);
    const cornerOffsets = [
      0,
      (image.width - 1) * 4,
      (image.height - 1) * image.width * 4,
      (image.width * image.height - 1) * 4,
    ];

    for (const offset of cornerOffsets) {
      expect([...image.data.subarray(offset, offset + 4)]).toEqual([247, 248, 243, 255]);
    }
  });

  it('resolves the SDK 57 Expo icon and splash configuration without dropping plugins', () => {
    const { exp } = getConfig(root, { skipSDKVersionRequirement: true });
    const plugins = exp.plugins ?? [];
    const pluginNames = plugins.map((plugin) => (Array.isArray(plugin) ? plugin[0] : plugin));

    expect(exp.icon).toBe(`./${platformAssets.icon.path}`);
    expect(exp.ios?.icon).toBe(`./${platformAssets.ios.path}`);
    expect(exp.android?.icon).toBe(`./${platformAssets.androidLegacy.path}`);
    expect(exp.android?.adaptiveIcon).toEqual({
      foregroundImage: `./${platformAssets.androidAdaptiveForeground.path}`,
      monochromeImage: `./${platformAssets.androidAdaptiveMonochrome.path}`,
      backgroundColor: brightPearl,
    });
    expect(exp.web?.favicon).toBe(`./${platformAssets.favicon48.path}`);
    expect(pluginNames).toEqual(
      expect.arrayContaining([
        'expo-router',
        'expo-image',
        'expo-font',
        'expo-audio',
        'expo-localization',
        'expo-splash-screen',
      ]),
    );
    expect(pluginNames.filter((name) => name === 'expo-splash-screen')).toHaveLength(1);

    const splashPlugin = plugins.find(
      (plugin) => Array.isArray(plugin) && plugin[0] === 'expo-splash-screen',
    );
    expect(splashPlugin).toEqual([
      'expo-splash-screen',
      {
        image: `./${platformAssets.splash.path}`,
        imageWidth: 240,
        resizeMode: 'contain',
        backgroundColor: brightPearl,
      },
    ]);
    expect(JSON.stringify(exp)).not.toMatch(/notification|dark-alternate/iu);

    const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
      dependencies: Record<string, string>;
    };
    expect(packageJson.dependencies['expo-splash-screen']).toBe('~57.0.8');
  });

  it('publishes branding-only PWA metadata and exact public copies without a service worker', () => {
    const manifest = JSON.parse(
      readFileSync(resolve(root, 'public/manifest.webmanifest'), 'utf8'),
    ) as {
      background_color: string;
      theme_color: string;
      icons: { src: string; sizes: string; type: string; purpose: string }[];
    };

    expect(manifest.background_color).toBe(brightPearl);
    expect(manifest.theme_color).toBe('#0D3128');
    expect(manifest.icons).toEqual([
      {
        src: '/icons/pwa-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/pwa-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/pwa-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ]);

    const publicCopies = {
      'public/favicon-32.png': platformAssets.favicon32,
      'public/favicon-48.png': platformAssets.favicon48,
      'public/apple-touch-icon.png': platformAssets.appleTouch,
      'public/icons/pwa-icon-192.png': platformAssets.pwa192,
      'public/icons/pwa-icon-512.png': platformAssets.pwa512,
      'public/icons/pwa-maskable-512.png': platformAssets.pwaMaskable512,
    } as const;
    for (const [publicPath, canonical] of Object.entries(publicCopies)) {
      expect(sha256(publicPath), publicPath).toBe(canonical.sha256);
    }

    const html = readFileSync(resolve(root, 'app/+html.tsx'), 'utf8');
    expect(html).toContain('href="/manifest.webmanifest" rel="manifest"');
    expect(html).toContain('href="/apple-touch-icon.png" rel="apple-touch-icon"');
    expect(html).toContain('href="/favicon-32.png" rel="icon"');
    expect(html).toContain('href="/favicon-48.png" rel="icon"');
    expect(html).not.toMatch(/serviceWorker/iu);
    expect(existsSync(resolve(root, 'public/service-worker.js'))).toBe(false);
  });

  it('excludes Windows metadata and keeps brand assets out of protected content artwork', () => {
    const canonicalFiles = nestedFiles(resolve(root, 'assets/brand/ghaf'));
    const publicFiles = nestedFiles(resolve(root, 'public'));
    expect([...canonicalFiles, ...publicFiles]).not.toContainEqual(
      expect.stringContaining('Zone.Identifier'),
    );

    for (const path of protectedContentComponents) {
      const source = readFileSync(resolve(root, path), 'utf8');
      expect(source, path).not.toMatch(/assets\/brand\/ghaf|components\/brand|GhafMark/u);
    }

    expect(R002B_FEATURE_FLAG_NAMES).toHaveLength(8);
    expect(Object.values(DEFAULT_R002B_FEATURE_FLAGS)).toEqual(Array(8).fill(false));
  });
});
