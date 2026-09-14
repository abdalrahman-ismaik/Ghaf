import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sourcePath = 'docs/competition-readiness/poster/current-poster.html';
const output = path.join(root, 'output/feature-audit-poster');
const inputs = [
  [
    '../../../assets/brand/ghaf/ghaf-mark-full-color-1024.png',
    'image/png',
    'Approved 5A runtime mark; unchanged',
  ],
  [
    '../../screenshots/parent-home-ar.png',
    'image/png',
    'Historical synthetic Arabic Parent Home capture',
  ],
  [
    '../../screenshots/child-today-ar.png',
    'image/png',
    'Historical synthetic Arabic Child Today capture',
  ],
  [
    '../../screenshots/family-garden-ar.png',
    'image/png',
    'Historical synthetic Arabic Family Garden capture',
  ],
  [
    '../../../node_modules/@expo-google-fonts/alexandria/600SemiBold/Alexandria_600SemiBold.ttf',
    'font/ttf',
    'Approved Alexandria display font',
  ],
  [
    '../../../node_modules/@expo-google-fonts/readex-pro/400Regular/ReadexPro_400Regular.ttf',
    'font/ttf',
    'Approved Readex Pro body font',
  ],
  [
    '../../../node_modules/@expo-google-fonts/readex-pro/500Medium/ReadexPro_500Medium.ttf',
    'font/ttf',
    'Approved Readex Pro medium control font',
  ],
];
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const source = readFileSync(path.join(root, sourcePath));
let html = source.toString('utf8');
const assets = inputs.map(([reference, mime, usage]) => {
  const absolute = path.resolve(root, path.dirname(sourcePath), reference);
  const bytes = readFileSync(absolute);
  if (!html.includes(reference)) throw new Error(`Source asset reference missing: ${reference}`);
  html = html.replaceAll(reference, `data:${mime};base64,${bytes.toString('base64')}`);
  return {
    path: path.relative(root, absolute).replaceAll('\\', '/'),
    mime,
    usage,
    bytes: bytes.length,
    sha256: sha256(bytes),
  };
});
if (/https?:\/\//.test(html))
  throw new Error('Poster must remain independent of network resources.');
mkdirSync(output, { recursive: true });
const bundledPath = path.join(output, 'ghaf-current-poster.html');
writeFileSync(bundledPath, html);
const licenses = [];
for (const family of ['alexandria', 'readex-pro']) {
  const sourceLicense = `node_modules/@expo-google-fonts/${family}/LICENSE_FONT`;
  const bytes = readFileSync(path.join(root, sourceLicense));
  const name = `${family}-font-license.txt`;
  writeFileSync(path.join(output, name), bytes);
  licenses.push({ path: sourceLicense, output: name, sha256: sha256(bytes) });
}
const manifest = {
  format: 'Editable HTML, A1 portrait',
  source: sourcePath,
  sourceSha256: sha256(source),
  physicalSizeMm: { width: 594, height: 841 },
  screenshotSizePx: { width: 2245, height: 3178 },
  assets,
  licenses,
  boundaries: [
    'Screenshots are historical checked-in synthetic captures, not new-feature or native acceptance evidence.',
    'Original referenced PowerPoint and template inputs were not located in this checkout.',
    'Prepared AI is not a successful live Gemini request. Supabase messaging requires separate configuration.',
    'Task/growth synchronisation across devices and production acceptance are not established.',
  ],
};
writeFileSync(path.join(output, 'source-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

if (process.argv.includes('--render')) {
  const candidates = [
    process.env.GHAF_POSTER_CHROME,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].filter(Boolean);
  const browser = candidates.find(existsSync);
  if (!browser)
    throw new Error(
      'No supported Chromium executable found; set GHAF_POSTER_CHROME to its absolute path. HTML and source manifest were created.',
    );
  const common = [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-background-networking',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=3000',
    `--user-data-dir=${path.join(output, '.chrome-profile')}`,
  ];
  const browserUrl = pathToFileURL(bundledPath).href;
  const run = (args) => {
    const result = spawnSync(browser, [...common, ...args, browserUrl], {
      cwd: root,
      timeout: 45000,
      windowsHide: true,
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
    });
    if (result.error) throw result.error;
    if (result.status !== 0)
      throw new Error(
        `Chromium export failed (${result.status}): ${(result.stderr ?? '').slice(-1200)}`,
      );
  };
  const pngPath = path.join(output, 'ghaf-current-poster.png');
  const pdfPath = path.join(output, 'ghaf-current-poster.pdf');
  run(['--window-size=2245,3178', `--screenshot=${pngPath}`]);
  const png = readFileSync(pngPath);
  if (png.length < 24 || png.subarray(1, 4).toString('ascii') !== 'PNG') {
    throw new Error(
      'Chrome did not write a usable PNG. Check available disk space; no render success is claimed.',
    );
  }
  run(['--no-pdf-header-footer', `--print-to-pdf=${pdfPath}`]);
  const pdf = readFileSync(pdfPath);
  if (pdf.length < 100 || pdf.subarray(0, 5).toString('ascii') !== '%PDF-') {
    throw new Error(
      'Chrome did not write a usable PDF. Check available disk space; no render success is claimed.',
    );
  }
  const pdfText = pdf.toString('latin1');
  const pages = [...pdfText.matchAll(/\/Type\s*\/Page\b/g)].length;
  const mediaBox = pdfText.match(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/);
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  if (width !== 2245 || height !== 3178 || pages !== 1 || !mediaBox) {
    throw new Error(
      `Unexpected export dimensions or page count: ${JSON.stringify({ width, height, pages, mediaBox: mediaBox?.slice(1) })}`,
    );
  }
  const report = {
    renderedAt: new Date().toISOString(),
    browser,
    sourceSha256: sha256(source),
    png: {
      path: path.relative(root, pngPath).replaceAll('\\', '/'),
      width,
      height,
      bytes: png.length,
      sha256: sha256(png),
    },
    pdf: {
      path: path.relative(root, pdfPath).replaceAll('\\', '/'),
      pages,
      mediaBoxPt: mediaBox.slice(1).map(Number),
      bytes: pdf.length,
      sha256: sha256(pdf),
    },
    visualInspection:
      'Required after generation; see poster README for the recorded human/agent review status.',
  };
  writeFileSync(path.join(output, 'render-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(
    `Created ${path.relative(root, bundledPath)} and source-manifest.json. Add --render for PNG/PDF export.`,
  );
}
