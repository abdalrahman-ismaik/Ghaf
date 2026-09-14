# Current Ghaf competition poster

[current-poster.html](current-poster.html) is the editable A1 portrait source (594 × 841 mm). It uses the approved 5A runtime mark, Alexandria and Readex Pro, and the three existing checked-in Arabic screenshots. Text, layout and captions remain editable HTML/CSS. No illustration was generated or screenshot altered.

The screenshots are historical synthetic prototype captures. Their earlier name and branding are intentionally preserved and explicitly captioned. They do not verify the latest memory, goal, onboarding or audio changes. The poster's truth footer distinguishes prepared AI, separately configured Supabase messaging, unverified cross-device task/growth synchronisation and symbolic environmental progress. [source-manifest.json](source-manifest.json) records the exact source assets and font hashes used for this export.

## Sources

| Asset or claim              | Source and boundary                                                                                                                                                                                                                                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Exact 5A mark               | `assets/brand/ghaf/ghaf-mark-full-color-1024.png`; approval/provenance in `docs/design/brand/5a-refined-classic/README.md`.                                                                                                                                                                                                 |
| Arabic screenshots          | `docs/screenshots/parent-home-ar.png`, `child-today-ar.png`, `family-garden-ar.png`; historical checked-in synthetic captures, not fresh device acceptance.                                                                                                                                                                 |
| Fonts                       | Existing `@expo-google-fonts/alexandria` and `@expo-google-fonts/readex-pro` packages; original font licences accompany the generated standalone HTML.                                                                                                                                                                      |
| Current behavior and limits | `docs/competition-readiness/feature-implementation-audit.md` and `specs/019-feature-completion-audit/`; code/automated evidence remains separate from native, hosted and two-device evidence.                                                                                                                               |
| Original poster/template    | Previously referenced `output/poster-20260912/final-reviewed/Ghaf-Team-SMAC-2026-A1-PRINT.pptx`, `assets/external templates and designs`, `output/competition-readiness/template-review`, and `docs/SMAC 2026` were not located in this checkout. Their contents were not inspected. Older handoff documents are preserved. |

## Reproduce

From the repository root after installing the existing lockfile dependencies:

```bash
node scripts/presentation/build-current-poster.mjs
node scripts/presentation/build-current-poster.mjs --render
```

The first command embeds the unchanged local assets and fonts into a self-contained HTML file. The second uses installed Chrome/Chromium in hidden headless mode to export PNG/PDF. Set `GHAF_POSTER_CHROME` to the absolute installed browser path if needed. No package installation, network asset fetch, provider credentials or live family data are required. The editable source itself can also be opened locally and printed at A1, 100% scale, with browser headers/footers disabled and background graphics enabled.

Generated files are restricted to `output/feature-audit-poster/`: standalone HTML, source asset hashes, font licences, PNG, PDF and render report. The report checks the 2245 × 3178 pixel preview, one PDF page and page dimensions. Inspect every fresh render visually before distribution. Browser export does not prove native app behavior or print-shop colour fidelity. The temporary `.chrome-profile` is disposable; preserve the source, screenshots and approved assets.

## Current verification and limitations

The approved logo and all three input screenshots were visually inspected. After recovery from an initial full-disk failure, `node scripts/presentation/build-current-poster.mjs --render` passed on 2026-09-14 using installed Chrome 152.0.7977.83. The PNG is 2245 × 3178 pixels; the PDF has one A1 page, with MediaBox 1684.08 × 2383.9199 points (browser rounding). Exact timestamps, source/output hashes and byte counts are in `output/feature-audit-poster/render-report.json`.

The actual PNG was visually inspected with `view_image`: the unchanged 5A mark is undistorted; all three screenshots remain uncropped; headings, historic-capture caption, five-step journey and truth footer are readable without overlap or clipping. The PDF's page count, header and physical dimensions were checked against its emitted bytes. No PDF rasterisation library was installed, so independent PDF rasterisation and physical print proof remain not run. Browser output is presentation evidence only, not app runtime acceptance.

Outputs: [standalone HTML](../../../output/feature-audit-poster/ghaf-current-poster.html), [PNG preview](../../../output/feature-audit-poster/ghaf-current-poster.png), [A1 PDF](../../../output/feature-audit-poster/ghaf-current-poster.pdf). The initial zero-byte outputs were replaced by the successful export. Only the new regenerable output/profile were removed during disk recovery; source and user assets were preserved. The disposable browser profile is removed after export.

PPTX was not created: the required presentation artifact runtime/tool is unavailable and the prior PPTX source is absent. This delivery provides editable HTML under the current generic editable-poster request. No substitute runtime was installed.

AI assistance authored this new HTML/CSS composition and deterministic packaging script from existing approved assets. There is no claimed human design, Arabic/cultural, physical-device or print proof approval.
