import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

import { describe, expect, it, vi } from 'vitest';

import { GhafMark, ghafMarkSizes } from '../src/components/brand/GhafMark';

vi.mock('react-native-svg', () => ({
  default: 'Svg',
  Path: 'Path',
}));

const root = fileURLToPath(new URL('../', import.meta.url));
const brandRoot = `${root}assets/brand/ghaf`;

const expectedHashes = {
  'app-icon/android-adaptive-foreground-1024.png':
    'cd92b525cdcb53525de7c584d77602f7e7af75220e0def4b4c12a4c5f7f22dbe',
  'app-icon/android-adaptive-monochrome-1024.png':
    '144b160309823643f7209f6ba1daf389084baa29b5778228f50daf94733bdff1',
  'app-icon/android-legacy-icon-1024.png':
    '44bd0b2c27aebbbabcac04c7d2e1858107e551968d3b392fa29291f75309b34c',
  'app-icon/apple-touch-icon-180.png':
    '37cb5f688d4356326b80cf85d187f7c6e09f395196596311b48941214a45c492',
  'app-icon/favicon-32.png': 'd1c008abf714e0094d780582a42892d5cb92d6e44acfb75c2b4c13808f232a95',
  'app-icon/favicon-48.png': '876766c9d7eac42847a2b737b2f5725779b79d347b8c58f721c765530054a8f6',
  'app-icon/icon.png': '44bd0b2c27aebbbabcac04c7d2e1858107e551968d3b392fa29291f75309b34c',
  'app-icon/ios-icon-1024.png': '44bd0b2c27aebbbabcac04c7d2e1858107e551968d3b392fa29291f75309b34c',
  'app-icon/play-store-icon-512.png':
    '908f18f13c49700f0e68fffd7fbc3f12b42e3c28dd52eae6de4a07f8b25b39f4',
  'app-icon/pwa-icon-192.png': '1e6063e6b31770c3b92ec1e4aa03a45882e9f4caff6b94d79639254f6694a92c',
  'app-icon/pwa-icon-512.png': '908f18f13c49700f0e68fffd7fbc3f12b42e3c28dd52eae6de4a07f8b25b39f4',
  'app-icon/pwa-maskable-512.png':
    '4f021290d28a32547d79b6ab2348c83e59f57d25da8c957a1b96060642c5a1d0',
  'app-icon/splash-icon-1024.png':
    '44c2d366cdd176882d4701c58c699f816c01e82d930186a0a9cb23e74730527a',
  'ghaf-mark-deep-forest.svg': '427bab9c4049b81153e31093b20ec9c1aef66a31a8538415435c7e2b74dc9b9a',
  'ghaf-mark-full-color-1024.png':
    'f30e8925f3ff56b3fddbf5c3d653e2a309e99d7af48fefaa30bdc2e704d8c40b',
  'ghaf-mark-full-color.svg': '417f488a937f67c9eabfb6d585ffea1eb220185dcc4e42dcef69277d8a4e2eeb',
  'ghaf-mark-reverse.svg': 'a00a2317eda628280aa14fc4feb89dab90dbdd231809ad760339925b6a3bbca3',
} as const;

const expectedDimensions = {
  'app-icon/android-adaptive-foreground-1024.png': [1024, 1024],
  'app-icon/android-adaptive-monochrome-1024.png': [1024, 1024],
  'app-icon/android-legacy-icon-1024.png': [1024, 1024],
  'app-icon/apple-touch-icon-180.png': [180, 180],
  'app-icon/favicon-32.png': [32, 32],
  'app-icon/favicon-48.png': [48, 48],
  'app-icon/icon.png': [1024, 1024],
  'app-icon/ios-icon-1024.png': [1024, 1024],
  'app-icon/play-store-icon-512.png': [512, 512],
  'app-icon/pwa-icon-192.png': [192, 192],
  'app-icon/pwa-icon-512.png': [512, 512],
  'app-icon/pwa-maskable-512.png': [512, 512],
  'app-icon/splash-icon-1024.png': [1024, 1024],
  'ghaf-mark-full-color-1024.png': [1024, 1024],
} as const;

const transparentPngs = new Set([
  'app-icon/android-adaptive-foreground-1024.png',
  'app-icon/android-adaptive-monochrome-1024.png',
  'app-icon/favicon-32.png',
  'app-icon/favicon-48.png',
  'app-icon/splash-icon-1024.png',
  'ghaf-mark-full-color-1024.png',
]);

const expectedGeometryHashes = [
  '0ed22b2cfe20b0b44f159b27cc5404d1841cba701c2692a4d435df550fe178a3',
  'f37556dd428505a2ae1f4bc9505ed352a53ff6a51314700208b53e5640ab998c',
] as const;

const expectedFills = {
  fullColor: ['#0D3128', '#188B83'],
  deepForest: ['#0D3128', '#0D3128'],
  reverse: ['#F7F8F3', '#F7F8F3'],
} as const;

interface PngInfo {
  readonly colorType: number;
  readonly hasTransparency: boolean;
  readonly height: number;
  readonly width: number;
}

interface MockElement {
  readonly props: Record<string, unknown>;
}

function hash(content: Buffer | string) {
  return createHash('sha256').update(content).digest('hex');
}

function listFiles(path: string, prefix = ''): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    return entry.isDirectory() ? listFiles(`${path}/${entry.name}`, relativePath) : [relativePath];
  });
}

function asElement(value: unknown) {
  return value as MockElement;
}

function paeth(left: number, above: number, upperLeft: number) {
  const prediction = left + above - upperLeft;
  const leftDistance = Math.abs(prediction - left);
  const aboveDistance = Math.abs(prediction - above);
  const upperLeftDistance = Math.abs(prediction - upperLeft);

  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) {
    return left;
  }
  return aboveDistance <= upperLeftDistance ? above : upperLeft;
}

function inspectPng(relativePath: keyof typeof expectedDimensions): PngInfo {
  const content = readFileSync(`${brandRoot}/${relativePath}`);
  expect(content.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

  const width = content.readUInt32BE(16);
  const height = content.readUInt32BE(20);
  const bitDepth = content.readUInt8(24);
  const colorType = content.readUInt8(25);
  const interlaceMethod = content.readUInt8(28);
  const idatChunks: Buffer[] = [];
  let offset = 8;

  while (offset < content.length) {
    const chunkLength = content.readUInt32BE(offset);
    const type = content.toString('ascii', offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + chunkLength;

    if (type === 'IDAT') {
      idatChunks.push(content.subarray(dataStart, dataEnd));
    }
    offset = dataEnd + 4;
  }

  expect(bitDepth).toBe(8);
  expect(interlaceMethod).toBe(0);
  expect([2, 6]).toContain(colorType);

  if (colorType === 2) {
    return { colorType, hasTransparency: false, height, width };
  }

  const channels = 4;
  const stride = width * channels;
  const scanlines = inflateSync(Buffer.concat(idatChunks));
  expect(scanlines.length).toBe(height * (stride + 1));

  const previous = Buffer.alloc(stride);
  const current = Buffer.alloc(stride);
  let cursor = 0;
  let hasTransparency = false;

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

      if (filter === 1) {
        predictor = left;
      } else if (filter === 2) {
        predictor = above;
      } else if (filter === 3) {
        predictor = Math.floor((left + above) / 2);
      } else if (filter === 4) {
        predictor = paeth(left, above, upperLeft);
      }

      current.writeUInt8((encoded + predictor) & 0xff, column);
    }

    for (let alphaColumn = 3; alphaColumn < stride; alphaColumn += channels) {
      if (current.readUInt8(alphaColumn) < 255) {
        hasTransparency = true;
        break;
      }
    }
    previous.set(current);
  }

  return { colorType, hasTransparency, height, width };
}

function parseSvg(relativePath: string) {
  const contents = readFileSync(`${brandRoot}/${relativePath}`, 'utf8');
  const matches = [
    ...contents.matchAll(
      /<path id="(region-\d+)" fill="(#[0-9A-F]{6})" fill-rule="evenodd" d="([^"]+)"\/>/gu,
    ),
  ];
  const paths = matches.map((match) => {
    const id = match[1];
    const fill = match[2];
    const geometry = match[3];

    if (!id || !fill || !geometry) {
      throw new Error(`Invalid canonical SVG path in ${relativePath}`);
    }
    return { fill, geometry, id };
  });

  return {
    contents,
    fills: paths.map((path) => path.fill),
    geometry: paths.map((path) => path.geometry),
    ids: paths.map((path) => path.id),
  };
}

describe('official Ghaf brand assets', () => {
  it('contains only the approved canonical and platform derivatives at exact paths', () => {
    expect(listFiles(brandRoot).sort()).toEqual(Object.keys(expectedHashes).sort());
    expect(listFiles(brandRoot).some((path) => path.includes('Zone.Identifier'))).toBe(false);
    expect(listFiles(brandRoot)).not.toContain('app-icon/notification-icon-96.png');
    expect(listFiles(brandRoot)).not.toContain('app-icon/app-icon-dark-alternate-1024.png');
  });

  it('pins every approved 5A master and platform derivative byte-for-byte', () => {
    for (const [relativePath, expectedHash] of Object.entries(expectedHashes)) {
      expect(hash(readFileSync(`${brandRoot}/${relativePath}`)), relativePath).toBe(expectedHash);
    }
  });

  it('preserves exact PNG dimensions and transparency contracts', () => {
    for (const [relativePath, dimensions] of Object.entries(expectedDimensions)) {
      const info = inspectPng(relativePath as keyof typeof expectedDimensions);
      expect([info.width, info.height], relativePath).toEqual(dimensions);
      expect(info.hasTransparency, relativePath).toBe(transparentPngs.has(relativePath));
      expect(info.colorType, relativePath).toBe(transparentPngs.has(relativePath) ? 6 : 2);
    }
  });

  it('keeps the three vectors safe and their two canonical 5A color regions identical', () => {
    const variants = [
      parseSvg('ghaf-mark-full-color.svg'),
      parseSvg('ghaf-mark-deep-forest.svg'),
      parseSvg('ghaf-mark-reverse.svg'),
    ];

    for (const variant of variants) {
      expect(variant.contents).toContain('viewBox="0 0 1024 1024"');
      expect(variant.contents).not.toMatch(
        /<(?:image|script|filter|font|linearGradient|radialGradient)\b/iu,
      );
      expect(variant.contents).not.toMatch(/\b(?:href|xlink:href)\s*=|url\(/iu);
      expect(variant.ids).toEqual(['region-1', 'region-2']);
      expect(variant.geometry.map(hash)).toEqual(expectedGeometryHashes);
      expect(variant.geometry.every((path) => path.endsWith('Z'))).toBe(true);
    }

    expect(variants[0]?.fills).toEqual(expectedFills.fullColor);
    expect(variants[1]?.fills).toEqual(expectedFills.deepForest);
    expect(variants[2]?.fills).toEqual(expectedFills.reverse);
  });
});

describe('GhafMark', () => {
  it('offers only approved variants and semantic dimensions', () => {
    expect(ghafMarkSizes).toEqual({
      compact: 40,
      standard: 64,
      hero: 112,
    });

    const source = readFileSync(`${root}src/components/brand/GhafMark.tsx`, 'utf8');
    expect(source).toContain(
      "export type GhafMarkVariant = 'fullColor' | 'deepForest' | 'reverse'",
    );
    expect(source).toContain("export type GhafMarkLanguage = 'ar' | 'en'");
    expect(source).not.toContain('@/models/familyGrowth');
    expect(source).not.toMatch(/(?:color|fill|height|width)\??:/u);
  });

  it.each(['fullColor', 'deepForest', 'reverse'] as const)(
    'renders canonical 5A %s geometry without stretching or arbitrary color',
    (variant) => {
      const rendered = asElement(
        GhafMark({
          accessibility: 'decorative',
          size: 'standard',
          variant,
        }),
      );
      const props = rendered.props;
      const paths = props.children as MockElement[];

      expect(props).toMatchObject({
        height: 64,
        preserveAspectRatio: 'xMidYMid meet',
        viewBox: '0 0 1024 1024',
        width: 64,
      });
      expect(paths.map((path) => hash(String(path.props.d)))).toEqual(expectedGeometryHashes);
      expect(paths.map((path) => path.props.fill)).toEqual(expectedFills[variant]);
      expect(paths.map((path) => path.props.fillRule)).toEqual(['evenodd', 'evenodd']);
    },
  );

  it('hides decorative marks and localizes identifying marks', () => {
    const decorative = asElement(
      GhafMark({
        accessibility: 'decorative',
        size: 'compact',
        variant: 'deepForest',
      }),
    ).props;
    expect(decorative).toMatchObject({
      accessibilityElementsHidden: true,
      accessible: false,
      'aria-hidden': true,
      importantForAccessibility: 'no-hide-descendants',
    });
    expect(decorative.accessibilityLabel).toBeUndefined();

    for (const [language, label] of [
      ['ar', 'غاف'],
      ['en', 'Ghaf'],
    ] as const) {
      const identifying = asElement(
        GhafMark({
          accessibility: 'identifying',
          language,
          size: 'hero',
          variant: 'reverse',
        }),
      ).props;
      expect(identifying).toMatchObject({
        accessibilityElementsHidden: false,
        accessibilityLabel: label,
        accessibilityRole: 'image',
        accessible: true,
        'aria-hidden': false,
        importantForAccessibility: 'yes',
      });
    }
  });
});
