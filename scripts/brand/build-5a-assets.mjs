import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

// Contour tracing adapted from the preserved official-pack vectorizer.
// Image generation performs extraction; this script builds consistent native/platform derivatives.
const require = createRequire(import.meta.url);
const { PNG } = require('pngjs');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const evidenceRoot = path.join(root, 'docs/design/brand/5a-refined-classic');
const brandRoot = path.join(root, 'assets/brand/ghaf');
const sourceBytes = fs.readFileSync(path.join(evidenceRoot, 'extracted-master.png'));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const masterHash = 'db6e72ecb8ddf1a370f24f61d36271552324b8fa5baa449d144afd3b7734df8a';
if (hash(sourceBytes) !== masterHash)
  throw new Error('Selected 5A extracted-master identity mismatch');
const selectedBoardHash = 'fb38af19fe6e7192536cc62c3f68da5bef0f21a6b5d66a744b9cae2c0468fa8d';
if (hash(fs.readFileSync(path.join(evidenceRoot, 'selected-5a-board.png'))) !== selectedBoardHash)
  throw new Error('Selected 5A board identity mismatch');
const source = PNG.sync.read(sourceBytes);
const { width, height, data } = source;
if (width !== 1536 || height !== 1024) throw new Error('Unexpected 5A master dimensions');
const threshold = 32;
const mask = new Uint8Array(width * height);
for (let i = 0; i < mask.length; i++) mask[i] = data[i * 4 + 3] >= threshold ? 1 : 0;

const labels = new Int32Array(width * height);
labels.fill(-1);
const components = [];
let nextComponentId = 0;
const queueX = new Int32Array(width * height);
const queueY = new Int32Array(width * height);
const neighbors = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const startIndex = y * width + x;
    if (!mask[startIndex] || labels[startIndex] !== -1) continue;

    const componentId = nextComponentId++;
    let head = 0;
    let tail = 0;
    queueX[tail] = x;
    queueY[tail] = y;
    tail += 1;
    labels[startIndex] = componentId;

    const pixels = [];
    let minX = x;
    let maxX = x;
    let minY = y;
    let maxY = y;
    let sumX = 0;
    let sumY = 0;

    while (head < tail) {
      const currentX = queueX[head];
      const currentY = queueY[head];
      head += 1;
      pixels.push([currentX, currentY]);
      minX = Math.min(minX, currentX);
      maxX = Math.max(maxX, currentX);
      minY = Math.min(minY, currentY);
      maxY = Math.max(maxY, currentY);
      sumX += currentX;
      sumY += currentY;

      for (const neighbor of neighbors) {
        const nextX = currentX + neighbor[0];
        const nextY = currentY + neighbor[1];
        if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) continue;
        const nextIndex = nextY * width + nextX;
        if (!mask[nextIndex] || labels[nextIndex] !== -1) continue;
        labels[nextIndex] = componentId;
        queueX[tail] = nextX;
        queueY[tail] = nextY;
        tail += 1;
      }
    }

    if (pixels.length >= 64) {
      components.push({
        id: componentId,
        pixels,
        minX,
        maxX,
        minY,
        maxY,
        centroidX: sumX / pixels.length,
        centroidY: sumY / pixels.length,
        area: pixels.length,
      });
    }
  }
}

function pointKey(x, y) {
  return x + ',' + y;
}

function addEdge(edgeMap, x1, y1, x2, y2, direction) {
  const key = pointKey(x1, y1);
  if (!edgeMap.has(key)) edgeMap.set(key, []);
  edgeMap.get(key).push({ x1, y1, x2, y2, direction, used: false });
}

function traceComponent(component) {
  const edgeMap = new Map();
  const id = component.id;

  for (const pixel of component.pixels) {
    const x = pixel[0];
    const y = pixel[1];
    const same = (candidateX, candidateY) => {
      if (candidateX < 0 || candidateX >= width || candidateY < 0 || candidateY >= height)
        return false;
      return labels[candidateY * width + candidateX] === id;
    };

    if (!same(x, y - 1)) addEdge(edgeMap, x, y, x + 1, y, 0);
    if (!same(x + 1, y)) addEdge(edgeMap, x + 1, y, x + 1, y + 1, 1);
    if (!same(x, y + 1)) addEdge(edgeMap, x + 1, y + 1, x, y + 1, 2);
    if (!same(x - 1, y)) addEdge(edgeMap, x, y + 1, x, y, 3);
  }

  const allEdges = Array.from(edgeMap.values()).flat();
  const loops = [];
  const turnPriority = [1, 0, 3, 2];

  for (const firstEdge of allEdges) {
    if (firstEdge.used) continue;
    const loop = [{ x: firstEdge.x1, y: firstEdge.y1 }];
    let edge = firstEdge;
    let guard = 0;

    while (edge && !edge.used && guard < allEdges.length + 4) {
      edge.used = true;
      loop.push({ x: edge.x2, y: edge.y2 });
      if (edge.x2 === firstEdge.x1 && edge.y2 === firstEdge.y1) break;

      const candidates = (edgeMap.get(pointKey(edge.x2, edge.y2)) || []).filter(
        (candidate) => !candidate.used,
      );
      let nextEdge = null;
      for (const relativeTurn of turnPriority) {
        const wantedDirection = (edge.direction + relativeTurn) % 4;
        nextEdge = candidates.find((candidate) => candidate.direction === wantedDirection);
        if (nextEdge) break;
      }
      edge = nextEdge || candidates[0] || null;
      guard += 1;
    }

    if (
      loop.length >= 4 &&
      loop[0].x === loop[loop.length - 1].x &&
      loop[0].y === loop[loop.length - 1].y
    ) {
      loops.push(loop.slice(0, -1));
    }
  }
  return loops;
}

function pointSegmentDistanceSquared(point, start, end) {
  let x = start.x;
  let y = start.y;
  let dx = end.x - x;
  let dy = end.y - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((point.x - x) * dx + (point.y - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = end.x;
      y = end.y;
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  dx = point.x - x;
  dy = point.y - y;
  return dx * dx + dy * dy;
}

function simplifyOpen(points, tolerance) {
  if (points.length <= 2) return points;
  const squareTolerance = tolerance * tolerance;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];

  while (stack.length > 0) {
    const pair = stack.pop();
    const first = pair[0];
    const last = pair[1];
    let maxDistance = squareTolerance;
    let split = -1;
    for (let index = first + 1; index < last; index += 1) {
      const distance = pointSegmentDistanceSquared(points[index], points[first], points[last]);
      if (distance > maxDistance) {
        split = index;
        maxDistance = distance;
      }
    }
    if (split !== -1) {
      keep[split] = 1;
      stack.push([first, split], [split, last]);
    }
  }
  return points.filter((unused, index) => keep[index]);
}

function simplifyClosed(points, tolerance) {
  if (points.length <= 8) return points;
  let minXIndex = 0;
  for (let index = 1; index < points.length; index += 1) {
    if (points[index].x < points[minXIndex].x) minXIndex = index;
  }
  const rotated = points.slice(minXIndex).concat(points.slice(0, minXIndex));
  let maxXIndex = 1;
  for (let index = 2; index < rotated.length; index += 1) {
    if (rotated[index].x > rotated[maxXIndex].x) maxXIndex = index;
  }
  const firstArc = rotated.slice(0, maxXIndex + 1);
  const secondArc = rotated.slice(maxXIndex).concat([rotated[0]]);
  const simplifiedFirst = simplifyOpen(firstArc, tolerance);
  const simplifiedSecond = simplifyOpen(secondArc, tolerance);
  return simplifiedFirst.slice(0, -1).concat(simplifiedSecond.slice(0, -1));
}

if (components.length !== 7)
  throw new Error(`Expected tree and six family regions; got ${components.length}`);
const bounds = {
  minX: Math.min(...components.map((c) => c.minX)),
  minY: Math.min(...components.map((c) => c.minY)),
  maxX: Math.max(...components.map((c) => c.maxX)) + 1,
  maxY: Math.max(...components.map((c) => c.maxY)) + 1,
};
const scale = 960 / (bounds.maxX - bounds.minX);
const centerX = (bounds.minX + bounds.maxX) / 2;
const centerY = (bounds.minY + bounds.maxY) / 2;
const rounded = (n) => Math.round(n * 1000) / 1000;
const regions = components.map((component) => {
  const meanGreen =
    component.pixels.reduce((sum, [x, y]) => sum + data[(y * width + x) * 4 + 1], 0) /
    component.area;
  return {
    fill: meanGreen > 90 ? '#188B83' : '#0D3128',
    area: component.area,
    loops: traceComponent(component).map((loop) =>
      simplifyClosed(loop, 0.8).map((point) => ({
        x: rounded(512 + (point.x - centerX) * scale),
        y: rounded(512 + (point.y - centerY) * scale),
      })),
    ),
  };
});
if (regions.filter((region) => region.fill === '#188B83').length !== 2)
  throw new Error('Expected only the central figure head/body to be teal');
const fills = ['#0D3128', '#188B83'];
const groupedLoops = fills.map((fill) =>
  regions.filter((region) => region.fill === fill).flatMap((region) => region.loops),
);
const loopPath = (loop) =>
  loop.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join('') + 'Z';
const canonicalPaths = groupedLoops.map((loops) => loops.map(loopPath).join(''));
const variantFills = {
  fullColor: fills,
  deepForest: ['#0D3128', '#0D3128'],
  reverse: ['#F7F8F3', '#F7F8F3'],
};
const svgNames = {
  fullColor: 'ghaf-mark-full-color.svg',
  deepForest: 'ghaf-mark-deep-forest.svg',
  reverse: 'ghaf-mark-reverse.svg',
};
fs.mkdirSync(path.join(brandRoot, 'app-icon'), { recursive: true });
const manifest = {
  version: 1,
  identity: '5A Refined Classic',
  selectedBoardSha256: selectedBoardHash,
  extractedMasterSha256: masterHash,
  viewBox: '0 0 1024 1024',
  fills,
  geometryHashes: canonicalPaths.map(hash),
  contourPolicy: {
    threshold,
    tolerance: 0.8,
    components: 7,
    compoundColorPaths: 2,
    runtimeMarkWidth: 960,
  },
  assets: {},
  publicCopies: {},
};
for (const [variant, colors] of Object.entries(variantFills)) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" role="img" aria-label="Ghaf">\n' +
    canonicalPaths
      .map(
        (geometry, index) =>
          `  <path id="region-${index + 1}" fill="${colors[index]}" fill-rule="evenodd" d="${geometry}"/>`,
      )
      .join('\n') +
    '\n</svg>\n';
  fs.writeFileSync(path.join(brandRoot, svgNames[variant]), svg);
  manifest.assets[svgNames[variant]] = { sha256: hash(svg) };
}

function rgba(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
    255,
  ];
}

function rasterize(size, targetWidth, mode, opaque) {
  const sample = 4;
  const highSize = size * sample;
  const buffer = Buffer.alloc(highSize * highSize * 4);
  if (opaque) {
    for (let i = 0; i < buffer.length; i += 4) buffer.set([247, 248, 243, 255], i);
  }
  const factor = (targetWidth / 960) * (highSize / 1024);
  for (let group = 0; group < groupedLoops.length; group++) {
    const color = mode === 'monochrome' ? [0, 0, 0, 255] : rgba(variantFills[mode][group]);
    const loops = groupedLoops[group].map((loop) =>
      loop.map((point) => ({
        x: highSize / 2 + (point.x - 512) * factor,
        y: highSize / 2 + (point.y - 512) * factor,
      })),
    );
    for (let y = 0; y < highSize; y++) {
      const scanY = y + 0.5;
      const crossings = [];
      for (const loop of loops) {
        for (let i = 0; i < loop.length; i++) {
          const a = loop[i];
          const b = loop[(i + 1) % loop.length];
          if (a.y > scanY !== b.y > scanY)
            crossings.push(a.x + ((scanY - a.y) * (b.x - a.x)) / (b.y - a.y));
        }
      }
      crossings.sort((a, b) => a - b);
      if (crossings.length % 2) throw new Error('Open raster contour');
      for (let i = 0; i < crossings.length; i += 2) {
        const left = Math.max(0, Math.ceil(crossings[i] - 0.5));
        const right = Math.min(highSize, Math.ceil(crossings[i + 1] - 0.5));
        for (let x = left; x < right; x++) buffer.set(color, (y * highSize + x) * 4);
      }
    }
  }
  const pixels = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      let alpha = 0;
      const channels = [0, 0, 0];
      for (let sy = 0; sy < sample; sy++)
        for (let sx = 0; sx < sample; sx++) {
          const index = ((y * sample + sy) * highSize + x * sample + sx) * 4;
          const a = buffer[index + 3];
          alpha += a;
          for (let c = 0; c < 3; c++) channels[c] += buffer[index + c] * a;
        }
      const index = (y * size + x) * 4;
      for (let c = 0; c < 3; c++) pixels[index + c] = alpha ? Math.round(channels[c] / alpha) : 0;
      pixels[index + 3] = Math.round(alpha / (sample * sample));
    }
  return pixels;
}

function alphaBounds(pixels, size) {
  const result = { minX: size, minY: size, maxX: -1, maxY: -1 };
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      if (!pixels[(y * size + x) * 4 + 3]) continue;
      result.minX = Math.min(result.minX, x);
      result.minY = Math.min(result.minY, y);
      result.maxX = Math.max(result.maxX, x);
      result.maxY = Math.max(result.maxY, y);
    }
  return result;
}

function savePng(name, size, targetWidth, mode, opaque) {
  const pixels = rasterize(size, targetWidth, mode, opaque);
  const bytes = PNG.sync.write(
    { width: size, height: size, data: pixels },
    { colorType: opaque ? 2 : 6, inputColorType: 6 },
  );
  fs.writeFileSync(path.join(brandRoot, name), bytes);
  manifest.assets[name] = {
    sha256: hash(bytes),
    width: size,
    height: size,
    colorType: opaque ? 2 : 6,
    targetWidth,
    mode,
    alphaBounds: alphaBounds(pixels, size),
  };
}
savePng('ghaf-mark-full-color-1024.png', 1024, 960, 'fullColor', false);
savePng('app-icon/icon.png', 1024, 680, 'fullColor', true);
for (const name of ['ios-icon-1024.png', 'android-legacy-icon-1024.png']) {
  fs.copyFileSync(
    path.join(brandRoot, 'app-icon/icon.png'),
    path.join(brandRoot, 'app-icon', name),
  );
  manifest.assets[`app-icon/${name}`] = { ...manifest.assets['app-icon/icon.png'] };
}
savePng('app-icon/android-adaptive-foreground-1024.png', 1024, 610, 'fullColor', false);
savePng('app-icon/android-adaptive-monochrome-1024.png', 1024, 610, 'monochrome', false);
savePng('app-icon/splash-icon-1024.png', 1024, 430, 'fullColor', false);
savePng('app-icon/favicon-32.png', 32, 820, 'deepForest', false);
savePng('app-icon/favicon-48.png', 48, 820, 'deepForest', false);
savePng('app-icon/pwa-icon-192.png', 192, 680, 'fullColor', true);
savePng('app-icon/pwa-icon-512.png', 512, 680, 'fullColor', true);
fs.copyFileSync(
  path.join(brandRoot, 'app-icon/pwa-icon-512.png'),
  path.join(brandRoot, 'app-icon/play-store-icon-512.png'),
);
manifest.assets['app-icon/play-store-icon-512.png'] = {
  ...manifest.assets['app-icon/pwa-icon-512.png'],
};
savePng('app-icon/pwa-maskable-512.png', 512, 610, 'fullColor', true);
savePng('app-icon/apple-touch-icon-180.png', 180, 680, 'fullColor', true);
for (const [dest, sourceName] of Object.entries({
  'public/favicon-32.png': 'favicon-32.png',
  'public/favicon-48.png': 'favicon-48.png',
  'public/apple-touch-icon.png': 'apple-touch-icon-180.png',
  'public/icons/pwa-icon-192.png': 'pwa-icon-192.png',
  'public/icons/pwa-icon-512.png': 'pwa-icon-512.png',
  'public/icons/pwa-maskable-512.png': 'pwa-maskable-512.png',
})) {
  fs.copyFileSync(path.join(brandRoot, 'app-icon', sourceName), path.join(root, dest));
  manifest.publicCopies[dest] = `app-icon/${sourceName}`;
}
const componentPath = path.join(root, 'src/components/brand/GhafMark.tsx');
const component = fs.readFileSync(componentPath, 'utf8');
const geometryBlock = `const canonicalPaths = ${JSON.stringify(canonicalPaths, null, 2)} as const;`;
const fillBlock = `const approvedFills: Record<GhafMarkVariant, readonly [string, string]> = ${JSON.stringify(variantFills, null, 2)};`;
if (
  !/const canonicalPaths = \[[\s\S]*?\] as const;/.test(component) ||
  !/const approvedFills:[\s\S]*?\n};/.test(component)
)
  throw new Error('Brand component generation seam changed; review required');
fs.writeFileSync(
  componentPath,
  component
    .replace(/const canonicalPaths = \[[\s\S]*?\] as const;/, geometryBlock)
    .replace(/const approvedFills:[\s\S]*?\n};/, fillBlock)
    .replace(/viewBox="[^"]+"/, 'viewBox="0 0 1024 1024"'),
);
fs.writeFileSync(
  path.join(evidenceRoot, 'manifest.json'),
  JSON.stringify(manifest, null, 2) + '\n',
);
console.log(
  JSON.stringify({
    identity: manifest.identity,
    components: 7,
    compoundPaths: 2,
    assets: Object.keys(manifest.assets).length,
    publicCopies: Object.keys(manifest.publicCopies).length,
    geometryHashes: manifest.geometryHashes,
  }),
);
