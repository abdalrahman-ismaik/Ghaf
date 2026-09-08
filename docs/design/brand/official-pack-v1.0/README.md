# Ghaf Official Logo & App-Icon Pack

Status: **Product-owner-designated official brand direction**, prepared 2026-09-05. Public release should still receive an ordinary trademark/similarity review; this package does not represent legal clearance.

## Brand decision

The supplied black silhouette is preserved as the canonical Ghaf mark. It reads as a mature native tree, a protective family canopy, a central seed, and grounded roots. The production vector uses four flat colors from the established Ghaf system:

| Region | Token | Hex | Role |
| --- | --- | --- | --- |
| Trunk, roots, and main shelter | Deep Forest | `#0D3128` | Structural anchor |
| Upper canopy | Ghaf Emerald | `#126A50` | Ghaf identity and growth |
| Inner/right canopy | Mangrove Teal | `#188B83` | Water, renewal, and ecological breadth |
| Outer-right canopy | Dark Mangrove | `#28736C` | Depth without gradients |
| Primary icon background | Bright Pearl | `#F7F8F3` | Calm, premium contrast |

Solar Amber remains a supporting UI and campaign accent. It is intentionally absent from the core logo because inserting it into the negative-space seed would change the supplied silhouette.

## SVG or PNG?

Use `svg/ghaf-mark-full-color.svg` as the canonical source for in-app UI, web, print, and future exports. It is resolution-independent, contains four editable paths, and embeds no raster image, font, script, filter, or external reference.

Use the supplied PNG derivatives for operating-system surfaces. Expo's splash icon requires PNG, and platform launchers apply their own masks and processing to app-icon files.

## Primary assets

| Surface | Asset |
| --- | --- |
| Canonical brand mark | `svg/ghaf-mark-full-color.svg` |
| One-color dark mark | `svg/ghaf-mark-deep-forest.svg` |
| Reversed mark | `svg/ghaf-mark-reverse.svg` |
| Primary app icon | `app-icon/icon.png` |
| iOS icon | `app-icon/ios-icon-1024.png` |
| Android legacy icon | `app-icon/android-legacy-icon-1024.png` |
| Android adaptive foreground | `app-icon/android-adaptive-foreground-1024.png` |
| Android themed/monochrome layer | `app-icon/android-adaptive-monochrome-1024.png` |
| Native splash icon | `app-icon/splash-icon-1024.png` |
| Web favicon | `app-icon/favicon-48.png` and `app-icon/favicon-32.png` |
| PWA icons | `app-icon/pwa-icon-192.png`, `pwa-icon-512.png`, and `pwa-maskable-512.png` |
| Apple web clip | `app-icon/apple-touch-icon-180.png` |
| Store submission | `app-icon/play-store-icon-512.png` |
| Optional Android notification mark | `app-icon/notification-icon-96.png` |

`app-icon/app-icon-dark-alternate-1024.png` is an approved alternate for future dark-appearance support, not the default icon.

## Usage rules

- Preserve the paths, proportions, orientation, and internal negative space.
- Keep clear space of at least one-eighth of the mark width on all sides.
- Use the full-color mark at 40 px or larger. Below 40 px, prefer the one-color mark or the supplied favicon.
- Never stretch, rotate, outline, add gradients, add drop shadows, recolor ad hoc, or place text inside the app icon.
- In a wordmark lockup, keep `غاف` or `Ghaf` as live Alexandria text; do not convert it into the icon artwork.
- On Bright Pearl or other light surfaces, use full color or Deep Forest. On Deep Forest, use the reversed Bright Pearl mark.
- Use the complete app-icon files as supplied; do not add rounded corners. iOS and Android apply the final device mask.

## Replacement boundary

Replace only marks that are functioning as temporary Ghaf product branding, including launch/splash marks, app icons, favicon/PWA icons, wordmark-adjacent brand marks, and generic logo placeholders.

Do **not** replace Salem's profile/avatar, botanical hero illustrations, garden-stage trees, mangrove/Ghaf educational illustrations, badge artwork, navigation icons, task-category icons, achievement symbols, partner marks, or legal certification marks. Those are product content, not logo placeholders.

## Technical validation

- Source: 1254×1254 RGBA PNG with transparent background.
- Vector: four closed path regions; no embedded bitmap.
- Shape comparison: 0.99590785 intersection-over-union at the source alpha threshold.
- Primary iOS/legacy icon: 1024×1024, opaque, square, no pre-rounded corners.
- Adaptive foreground and monochrome assets: 1024×1024 with transparency; meaningful mark fitted within the central Android safe region.
- Splash: 1024×1024 transparent PNG.
- Small-size renders were generated at their native pixel sizes rather than downscaled at runtime.

See `VECTOR_TRACE_REPORT.json`, `RASTER_VALIDATION.txt`, and `CHECKSUMS.sha256` for reproducible evidence. Re-run `scripts/render-assets.sh` after intentionally changing any source SVG.

## Provenance

- Original file: `source/ghaf-original-user-supplied.png`
- Original SHA-256: `72816b6ad7703a5afd32022134ce08ddad4a15b3e9521edcb7cdfae1992ed76d`
- Direction: the product owner explicitly selected the supplied mark as the official Ghaf logo on 2026-09-05.
- Transformation: deterministic alpha-boundary vectorization and palette application; no generative redraw.

The product owner should retain any creation-history and rights records for the original artwork and commission a trademark/similarity search before public registration or store launch.

## Current platform references

- Expo: <https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/>
- Android adaptive icons: <https://developer.android.com/develop/ui/compose/system/icon_design_adaptive>
- Apple app icons: <https://developer.apple.com/design/human-interface-guidelines/app-icons/>
- PWA maskable icons: <https://web.dev/articles/maskable-icon>
