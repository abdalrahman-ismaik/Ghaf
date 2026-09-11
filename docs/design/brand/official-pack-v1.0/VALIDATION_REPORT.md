# Ghaf Brand Asset Validation Report

Date: 2026-09-05

## Result

**PASS for asset-package handoff.** Repository integration and physical-device validation remain separate work because the Ghaf source repository is not present in this workspace.

## Geometry and vector integrity

| Check | Result |
| --- | --- |
| Original source | 1254×1254 RGBA PNG |
| Meaningful source bounds | 1196×1110 at +29,+72 |
| Vector meaningful bounds | 1196×1110 at +29,+72 |
| Connected regions | 4 |
| SVG paths per variant | 4 |
| Shape intersection-over-union | 0.99590785 |
| Embedded raster images | None |
| Scripts / filters / foreign objects | None |
| External asset or paint references | None |

The IoU check compares the source alpha mask and a 1254×1254 render of the canonical SVG at alpha threshold 32/255.

## Raster outputs

| Asset class | Dimensions | Channel result |
| --- | --- | --- |
| Primary, iOS, Android legacy | 1024×1024 | `srgb` — opaque, no alpha channel |
| Android adaptive foreground | 1024×1024 | `srgba` — transparent layer |
| Android adaptive monochrome | 1024×1024 | `srgba` — transparent layer |
| Splash icon | 1024×1024 | `srgba` — transparent layer |
| PWA regular | 192×192 and 512×512 | `srgb` — opaque |
| PWA maskable | 512×512 | `srgb` — opaque |
| Apple touch | 180×180 | `srgb` — opaque |
| Play Store | 512×512 | `srgb` — opaque |
| Favicon | 32×32 and 48×48 | `srgba` — transparent |
| Optional notification | 96×96 | `srgba` — white mark on transparency |

## Safe-area results

- Android adaptive foreground content: 610×568 at +207,+228 inside a 1024×1024 canvas.
- Android adaptive monochrome content: 610×568 at +207,+228.
- This fits within Android's central 66/108 guaranteed-safe square.
- Splash content: 430×400 at +297,+312.
- Favicon content: 40×36 at +4,+6 on the 48×48 export.
- Primary icon was visually inspected under square, rounded-square, and circular masks. The complete mark remains visible and recognizable.

## Visual review

- Full-color silhouette preserved.
- Deep Forest successfully anchors trunk, roots, and protective canopy.
- Ghaf Emerald, Mangrove Teal, and Dark Mangrove provide clear canopy separation without gradients.
- Negative-space seed remains open and recognizable.
- The favicon remains identifiable at 32 px.
- The primary Bright Pearl icon and reverse Deep Forest alternate both retain strong figure/ground separation.

## Still required during repository integration

- Verify every old logo usage is correctly classified before replacement.
- Resolve and validate the project's actual Expo/native/web configuration.
- Re-run the full repository test, lint, typecheck, export, and documentation suite.
- Build a native preview or production binary; Expo Go is not authoritative for splash or launcher icons.
- Validate Android circle, squircle, rounded-square, teardrop, and themed-icon behavior.
- Validate the iOS launcher icon on device.
- Check installed-PWA and favicon caching behavior.
- Run the project's human brand, content, accessibility, privacy, and legal/trademark reviews.
