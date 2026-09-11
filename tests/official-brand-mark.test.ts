import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

import { describe, expect, it, vi } from 'vitest';

import { GhafMark, ghafMarkSizes } from '../src/components/brand';

vi.mock('react-native-svg', () => ({
  default: 'Svg',
  Path: 'Path',
}));

const root = fileURLToPath(new URL('../', import.meta.url));
const brandRoot = `${root}assets/brand/ghaf`;

const expectedHashes = {
  'app-icon/android-adaptive-foreground-1024.png':
    '0eac8d971c0cdf1d3979a21ff23f818a51b273b41a91070c01d57ece0e75860e',
  'app-icon/android-adaptive-monochrome-1024.png':
    'be0b45bb2b18a5860591a4c1fd2bdf9232ec37243d94a7267c070b687e9adf6d',
  'app-icon/android-legacy-icon-1024.png':
    '27f3aecacfda7697226972d37e04a66001c510d485aa8a8dd9643e99f0d7c1a6',
  'app-icon/apple-touch-icon-180.png':
    'e3a514a89004f38d6161a933da5d438f50dae17bf1eab3550b9ee886054cc45e',
  'app-icon/favicon-32.png': 'f960eafe6d8b0fe1cc0444db1f87ae40c31b4c7b22d7566f9341324553cbe503',
  'app-icon/favicon-48.png': '6f6c075f39cd88e838e2266062b1ac116d32b479e1723bb40c30db2394b00acb',
  'app-icon/icon.png': '27f3aecacfda7697226972d37e04a66001c510d485aa8a8dd9643e99f0d7c1a6',
  'app-icon/ios-icon-1024.png': '27f3aecacfda7697226972d37e04a66001c510d485aa8a8dd9643e99f0d7c1a6',
  'app-icon/play-store-icon-512.png':
    'f28aaca3dd5d1ab0c162624b7bcb42148920fb97b554e5ac19ab35503198bddc',
  'app-icon/pwa-icon-192.png': '9ae053a566460c9dae05a766ccb4e0952e47f1c1a2684ed18d25d51b6ca7e28f',
  'app-icon/pwa-icon-512.png': 'f28aaca3dd5d1ab0c162624b7bcb42148920fb97b554e5ac19ab35503198bddc',
  'app-icon/pwa-maskable-512.png':
    '816e6516a0c6b2982a1b04c04be2e65d83eaaf6175d0f9824061cfa2f525f2b6',
  'app-icon/splash-icon-1024.png':
    'd12917f3289c3bf8da71ed1365aebefe8c09cc54e56233ddc93f5ce05d6aedba',
  'ghaf-mark-deep-forest.svg': 'f0a6f2c7349f7c49cda0cf29b881dcf753095a60c1c21c17939077392ab3dc0b',
  'ghaf-mark-full-color-1024.png':
    '28a09269c993d4aacbc40385102f9fa70d555d63b2319f238a5fce6cd277e7dc',
  'ghaf-mark-full-color.svg': '67bf09fd84db2b20d030aef73167459d12ebe363d580951336936ca3e255d4a3',
  'ghaf-mark-reverse.svg': '9a8e357cb51279291ceadf4419691ecad0430ef32ca4ca51b5859cf9ac8ea2c2',
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
  '3b68797794cdf1a6abeb91e2ebb6054ed30c933fc5b49d6bf88fea786aa594d7',
  '99b16b161a3d2d931911611f25a8a9e8d00250fc7b8875add37a7b1a593c975c',
  'feee89d2a20b393dbcf1870a165365c6004530ce6b9ccc903cfa895e7993e088',
  '7b7edd738bd8722df8e95241502b3d81779ee3450c3b5104fe8b9e0849d75db3',
] as const;

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
      } else {
        expect(filter).toBe(0);
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

  it('preserves every supplied file byte-for-byte', () => {
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

  it('keeps the three vectors safe and their four canonical regions identical', () => {
    const variants = [
      parseSvg('ghaf-mark-full-color.svg'),
      parseSvg('ghaf-mark-deep-forest.svg'),
      parseSvg('ghaf-mark-reverse.svg'),
    ];

    for (const variant of variants) {
      expect(variant.contents).toContain('viewBox="0 0 1254 1254"');
      expect(variant.contents).not.toMatch(
        /<(?:image|script|filter|font|linearGradient|radialGradient)\b/iu,
      );
      expect(variant.contents).not.toMatch(/\b(?:href|xlink:href)\s*=|url\(/iu);
      expect(variant.ids).toEqual(['region-1', 'region-2', 'region-3', 'region-4']);
      expect(variant.geometry.map(hash)).toEqual(expectedGeometryHashes);
      expect(variant.geometry.every((path) => path.endsWith('Z'))).toBe(true);
    }

    expect(variants[0]?.fills).toEqual(['#0D3128', '#126A50', '#28736C', '#188B83']);
    expect(variants[1]?.fills).toEqual(Array(4).fill('#0D3128'));
    expect(variants[2]?.fills).toEqual(Array(4).fill('#F7F8F3'));
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

  it('renders canonical vector geometry without stretching or arbitrary color', () => {
    const rendered = asElement(
      GhafMark({
        accessibility: 'decorative',
        size: 'standard',
        variant: 'fullColor',
      }),
    );
    const props = rendered.props;
    const paths = props.children as MockElement[];

    expect(props).toMatchObject({
      height: 64,
      preserveAspectRatio: 'xMidYMid meet',
      viewBox: '0 0 1254 1254',
      width: 64,
    });
    expect(paths.map((path) => hash(String(path.props.d)))).toEqual(expectedGeometryHashes);
    expect(paths.map((path) => path.props.fill)).toEqual([
      '#0D3128',
      '#126A50',
      '#28736C',
      '#188B83',
    ]);
    expect(paths.map((path) => path.props.fillRule)).toEqual(Array(4).fill('evenodd'));
  });

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
