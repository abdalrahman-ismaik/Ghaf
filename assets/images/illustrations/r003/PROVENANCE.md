# R003 Natural Artwork Provenance

## Shipping boundary

This directory contains the user-authorized **Quiet UAE Botanical Editorial** artwork refresh for
Ghaf. The shipping files are the 48 JPEGs in `final/` plus `ASSET_MANIFEST.json`. Every runtime
mapping is a literal local import; no image is fetched remotely and no Google Stitch export is
included.

The 2026-09-06 first-run extension now contains seven separately generated and inspected local
photographs: `onboarding-ghaf-intro`, `onboarding-family`, `onboarding-action`, `onboarding-ai`,
`onboarding-support`, `onboarding-growth`, and `section-transition`. The SMAC pillar refinement
added the Family canopy and bounded-AI guided-path metaphors without people, readable text, UI, or
robot/companion imagery. The earlier child-clear refinement added the introduction, replaced the
three original feature photographs, and corrected the growth scene's foreground pods through one
focused image edit. The current shipping boundary is therefore **48 JPEGs** and 48 literal registry
imports. The official raster logo remains outside this generated-artwork registry and keeps its
existing checksum.

The images are presentation only. They do not calculate or prove a Seed, Garden stage, canopy
contribution, Circle action, League score, learning result, badge, reward, or environmental impact.
The official Ghaf mark, wordmark, and platform icons are outside this library and remain unchanged.

On 2026-09-07, `welcome-ghaf-habitat` alone was regenerated from the earlier Welcome photograph as
a style and palette reference. The new exact 3:2 wide-angle composition uses one mature Ghaf,
younger growth, and a foreground seed-pod/leaf trail as a natural metaphor for family support,
small daily actions, and permanent symbolic growth. It remains decorative and contains no people,
text, UI, logo, reward, quantity, or measured-impact claim. The generated 1536×1024 RGB PNG was
resized to 1200×800, encoded as JPEG, stripped of non-prompt metadata, visually inspected, and
received a replacement embedded prompt and manifest checksum.

## Origin and transformations

- Generator: OpenAI built-in imagegen, one generation call per distinct source image.
- Generation date: original library 2026-09-06; Welcome hero regeneration 2026-09-07.
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

| Gate                                                                                       | Status                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root visual curation, prohibited-content scan, stage continuity, and crop review           | `PASSED` — all 41 earlier crops, seven first-run images, and the regenerated Welcome hero were inspected; the Welcome, Family, and AI metaphors contain no people, readable text, UI, or prohibited imagery |
| Exact manifest, local mapping, dimensions, size, checksum, and embedded-prompt tests       | `PASSED` — 4/4 asset-contract tests; 48 rasters scanned with 0 missing prompts                                                                                                                              |
| Default-on Arabic RTL and English LTR browser-proxy crop/overflow/console review           | `PASSED (web proxy)` — six-step journey and pillars inspected across 320×720 and 390×844; no broken images, horizontal overflow, or page errors                                                             |
| Explicitly enabled default-off Learning, Reveal, and Shared Growth browser review          | `NOT RUN` — implementation remains default-off and is covered by focused component/source tests only                                                                                                        |
| Web and Android JavaScript production exports                                              | `PASSED` — web produced 121 files and Android JS produced 90 files; byte-identical copies of both new first-run rasters were found in each export                                                           |
| Physical Android rendering, decode, memory, TalkBack, and reduced-motion review            | `BLOCKED` — `adb devices -l` found no attached device or emulator                                                                                                                                           |
| Named botanical, Arabic/UAE cultural, safeguarding, accessibility, and image-rights review | `NOT RUN`                                                                                                                                                                                                   |

Web and automated evidence do not substitute for the unrun native and named-human gates.
