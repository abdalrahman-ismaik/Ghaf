# R003 Natural Artwork Provenance

## Shipping boundary

This directory contains the user-authorized **Quiet UAE Botanical Editorial** artwork refresh for
Ghaf. The shipping files are the 41 JPEGs in `final/` plus `ASSET_MANIFEST.json`. Every runtime
mapping is a literal local import; no image is fetched remotely and no Google Stitch export is
included.

The images are presentation only. They do not calculate or prove a Seed, Garden stage, canopy
contribution, Circle action, League score, learning result, badge, reward, or environmental impact.
The official Ghaf mark, wordmark, and platform icons are outside this library and remain unchanged.

## Origin and transformations

- Generator: OpenAI built-in imagegen, one generation call per distinct source image.
- Generation date: 2026-09-06.
- Source direction: calm natural-history editorial photography with UAE botanical and habitat
  context, natural asymmetry, warm restrained light, and nondirectional crop-safe composition.
- Exclusions: illustration/vector styling, CGI or plastic rendering, fantasy glow, people, faces,
  hands, readable text, logos, brands, UI, private identity, buildings, cars, hazards, litter, and
  visual claims of measured impact.
- Curation: each source and every species-stage sequence was inspected before integration; rejected
  sources were regenerated rather than shipped.
- Normalization: opaque RGB PNG sources were center-cropped and resized with FFmpeg Lanczos
  scaling, encoded as JPEG within the 500,000-byte asset budget, and cleared of non-prompt metadata
  with ExifTool.
- Embedded intent: the exact generation prompt is embedded in each shipping JPEG's
  `impeccable:prompt` comment and is duplicated in `ASSET_MANIFEST.json` with final dimensions,
  bytes, SHA-256 checksum, routes, accessibility mode, and exact transformations.

Generated source PNGs are review intermediates, not shipping assets. They are removed after final
JPEG integrity, embedded-prompt, and visual-crop checks pass.

## Evidence status

| Gate | Status |
| --- | --- |
| Root visual curation, prohibited-content scan, stage continuity, and crop review | `PASSED` — all 41 final crops inspected; two rejected sources were regenerated before shipping |
| Exact manifest, local mapping, dimensions, size, checksum, and embedded-prompt tests | `PASSED` — 4/4 asset-contract tests; 41 rasters scanned with 0 missing prompts |
| Default-on Arabic RTL and English LTR browser-proxy crop/overflow/console review | `PASSED (web proxy)` — Welcome, profile choice, task, Garden, Circle, and League at 320/390 widths; no broken images or final-flow console errors |
| Explicitly enabled default-off Learning, Reveal, and Shared Growth browser review | `NOT RUN` — implementation remains default-off and is covered by focused component/source tests only |
| Web and Android JavaScript production exports | `PASSED` — all 41 local artwork files bundled; Android export is not a native-device result |
| Physical Android rendering, decode, memory, TalkBack, and reduced-motion review | `BLOCKED` — `adb devices -l` found no attached device or emulator |
| Named botanical, Arabic/UAE cultural, safeguarding, accessibility, and image-rights review | `NOT RUN` |

Web and automated evidence do not substitute for the unrun native and named-human gates.
