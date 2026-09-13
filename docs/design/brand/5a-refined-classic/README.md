# Ghaf 5A Refined Classic — selected brand identity

On 2026-09-13 the user instructed: “confirm 5ARefined Classic as the new brand logo and replace the old one with it appropriately”. This explicitly selects 5A and authorizes the brand replacement. No additional selection round is required.

The previous September 5 tree-only mark is replaced by three family figures beneath a spreading Ghaf canopy. The user-selected [5A board](selected-5a-board.png) remains intact as the design reference. The [standalone vector](../../../../assets/brand/ghaf/ghaf-mark-full-color.svg) and [transparent raster](../../../../assets/brand/ghaf/ghaf-mark-full-color-1024.png) are the current reusable mark.

## Production assets and placement

The existing 17 canonical assets under `assets/brand/ghaf/` and six public icon copies now contain 5A. Existing filenames/configuration are retained so every existing brand placement receives the change:

- Welcome, onboarding, access and demo-entry lockups.
- Parent/Child headers and the journey header.
- App-owned loading and transition presentations and startup preloading.
- Expo general/iOS/Android legacy icons, Android adaptive/themed layers and native splash.
- Web favicons, Apple touch icon and PWA icons.

The unused reusable `GhafMark` vector component also carries the new geometry, preserving its existing API, accessible labeling, decorative behavior and size choices. All three SVG variants use the same paths. `GhafRasterLogo` remains the single runtime raster source. Arabic `غاف` and English `Ghaf` remain live text in the existing approved fonts; the presentation-board lettering is not embedded into app icons.

No route, access/progress state, registry, dependency, app configuration, token, localized copy, profile avatar, task illustration, landscape, badge, family-canopy progression artwork or feature flag changes. Historical source packs, screenshots, poster/PPTX, exploration boards and native build artifacts are preserved.

## One master and reproducible derivatives

`generation.json` records the exact built-in image-tool prompt and times. The image tool extracted the dominant selected symbol into [extracted-master.png](extracted-master.png), removing the board/wordmarks rather than using its inconsistent miniature studies. This is a generated faithful derivative, not a claim of a byte-identical crop. The AI lead compared the extracted family/canopy and generated platform assets against the selected direction.

The source-board hash is `fb38af19fe6e7192536cc62c3f68da5bef0f21a6b5d66a744b9cae2c0468fa8d`; extracted-master hash is `db6e72ecb8ddf1a370f24f61d36271552324b8fa5baa449d144afd3b7734df8a`.

The new [build script](../../../../scripts/brand/build-5a-assets.mjs) verifies both source identities and adapts the preserved pack's contour algorithm. It translates the extracted alpha boundary at threshold 32, omits low-alpha fringe, simplifies redundant points within 0.8 source pixels, and validates seven connected regions: the tree plus three heads and bodies. Two compound paths retain all gaps and shapes: forest `#0D3128` and the center figure `#188B83`. Reverse uses pearl `#F7F8F3`; themed monochrome uses the same mask. No background glow or generated color variation enters the final assets.

All vector/component/raster outputs use that one geometry. Rasterization uses four-by-four sampling and transparent premultiplied edge averaging. PNGs retain exact RGB/opaque or RGBA/transparent classes. Existing platform mark-width policies are preserved: 680/1024 for opaque icons, 610/1024 for adaptive/maskable layers, 430/1024 for splash, and 820/1024 for small single-color favicons. The runtime square source uses a 960/1024 visible width for the broad canopy. Neither rotation nor nonuniform stretching is allowed.

Regenerate from the committed source files and existing unchanged dependencies:

```bash
node scripts/brand/build-5a-assets.mjs
./node_modules/.bin/prettier --write src/components/brand/GhafMark.tsx docs/design/brand/5a-refined-classic/manifest.json
```

The script uses the already installed `pngjs` resolved from the unchanged dependency tree; no installation or package edit is required. `manifest.json` records every output hash, dimensions, color class, measured alpha bounds and the common geometry hashes. Both source images are checked in so generation never depends on ignored tool cache files. Python was used for metadata, byte copies and verification, not image editing; the image tool performed extraction and the JS script builds the native/vector/platform derivatives.

## Validation and acceptance

The focused brand tests pin the new assets and geometry while preserving exact inventory, transparency, SVG safety, all three vector variants, accessibility, Android safe inset, opaque pearl corners, Expo configuration/plugin bindings, public-copy identity and content/flag separation. Existing first-run and artwork checks cover integration without editing those surfaces. Exact executed checks and findings are in [validation.json](validation.json).

The source generator's repeated run produced identical hashes for all 25 compared generated assets/component/manifest outputs before formatting. AI visual inspection covered the opaque 1024 icon, 192 PWA icon and transparent runtime master. The selected design is user-approved; exact converted asset review/student teach-back and physical Android launcher/themed icon/cold-splash validation remain separate pending evidence. Source checks do not establish an APK/native pass. No native rebuild was started under this task.

Refresh the running web preview to load the new runtime assets. Launcher and native cold-splash resources require a new native build/reinstall; an already installed binary cannot pick up source asset changes. Browser/PWA icons may remain cached until refresh/reinstallation. Runtime asset replacement is complete independently of these native validation gates.

## Assistance and integration record

The lead prepared the master and deterministic generator, integrated all asset authorities, reviewed the helper's tests and recorded validation. A read-only explorer identified the exact consumer boundary; a separate bounded helper updated only three branding test files, then reviewed the generator read-only. Exact prompts/contributions/rejections and requested versus observable settings are retained in [assistance.json](assistance.json). Requested GPT-6 Astra / Ultra / Fast is distinguished from unexposed current effective lead/image service settings. Helper model selection was explicitly Astra/ultra; Fast was not exposed as a helper control. Human reviewer identity remains pending.

This dated selection supersedes current logo-geometry statements in the old migration record, while its historical evidence remains unchanged. Integration uses the current shared `redesign/ui-experiments` branch and preserves unrelated edits. Rollback is an explicit later revert of this cohesive asset/source/docs slice, followed by rebuilding native assets where applicable; it does not delete historical evidence or reset another contributor's work.
