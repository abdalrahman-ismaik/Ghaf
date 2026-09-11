# Ghaf Official Logo Migration Record

**STATUS: INTERNALLY AUTHORIZED BRAND MIGRATION — PUBLIC TRADEMARK/SIMILARITY REVIEW PENDING**

**Implementation gate:** `R002B PRODUCT CONTRACT APPROVED — FEATURE-FLAGGED IMPLEMENTATION AUTHORIZED — RELEASE ACTIVATION BLOCKED`

## Purpose and boundary

This record documents the narrow integration of the product-owner-designated Ghaf mark from
`docs/Ghaf_Official_Logo_and_App_Icon_Pack_v1.0/`. It covers brand assets, a reusable native mark,
operating-system icons, native splash configuration, favicon/PWA metadata, validation, and a
handoff for the separate Google Stitch prompt.

It does not authorize or perform a screen redesign. R001 and R002a layouts remain unchanged,
R002b feature flags remain default-off, and no product behavior, navigation, fixture, service,
state, reward, privacy rule, profile identity, or canonical product specification changes in this
migration.

## Verified implementation baseline

| Item                      | Verified value                                                  |
| ------------------------- | --------------------------------------------------------------- |
| Isolated worktree         | `/home/smyk/projects/Ghaf-r002-reconciliation-20260904`         |
| Branch                    | `integration/r3-r002b-implementation-20260905`                  |
| Preflight head            | `ca80f9f` — `docs: clarify offline web and USB Android testing` |
| TypeScript                | `npm run typecheck` — PASSED                                    |
| ESLint                    | `npm run lint` — PASSED                                         |
| Repository formatting     | `npm run format:check` — PASSED                                 |
| Automated tests           | `npm test` — PASSED, 78 files / 989 tests                       |
| Expo dependency alignment | `npx expo install --check` — PASSED at preflight                |

The original worktree at `/home/smyk/projects/Ghaf` was used only as a read-only source for the
untracked owner-supplied pack. Its branch, untracked R002 intake, and other local work were not
switched, staged, moved, renamed, or edited.

## Source authority and provenance

The pack declares the supplied silhouette the official internal Ghaf brand direction as of
2026-09-05. The designation establishes product authority and technical provenance; it does not
establish copyright ownership, trademark registrability, or non-infringement.

| Evidence                                      | SHA-256 or verified result                                             |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| Original owner-supplied 1254×1254 RGBA source | `72816b6ad7703a5afd32022134ce08ddad4a15b3e9521edcb7cdfae1992ed76d`     |
| Canonical full-color SVG                      | `67bf09fd84db2b20d030aef73167459d12ebe363d580951336936ca3e255d4a3`     |
| Primary 1024×1024 app icon                    | `27f3aecacfda7697226972d37e04a66001c510d485aa8a8dd9643e99f0d7c1a6`     |
| Codex integration prompt                      | `4899ed80ffbdf8741c20d8aa10ddcb4925ee0ded5de08fc1dc6e23cc52c61391`     |
| Stitch replacement prompt                     | `ed7a49bd5ff186233a1866764c502b4f03a972f331b5b8eeee846f6e4dfc52f9`     |
| Source-pack checksums                         | All 49 listed files PASSED `sha256sum -c`                              |
| Deterministic vector regeneration             | All generated SVG variants matched the supplied variants byte-for-byte |

The canonical SVG has four closed path regions and contains no embedded raster, font, script,
filter, `foreignObject`, or external URL. The full-color, Deep Forest, reverse, adaptive,
monochrome, favicon, splash, and notification variants share the supplied silhouette geometry.
No generative redraw was used.

The supplied vector report records a `0.99590785` alpha-mask intersection-over-union against the
source. A separate PNG parser confirmed every expected dimension, color mode, transparency class,
and non-empty visible bound. Its alpha-at-least-32 measurement found the adaptive foreground at
610×566 from `(207,229)`; the pack's ImageMagick report records 610×568 from `(207,228)`. This
one-to-two-pixel trim-method difference does not change the source files or place the mark outside
the Android safe region.

Windows `Zone.Identifier` sidecars are metadata noise. They are excluded from evidence, runtime
assets, staging, and commits.

`docs/design/brand/official-pack-v1.0/` is a content-faithful metadata and prompt snapshot, not a
second complete asset pack. Terminal blank lines were normalized only where required by Git's
whitespace check; original source hashes remain recorded above. Paths in its manifest, README,
validation files, and `CHECKSUMS.sha256` remain relative to the complete owner-supplied source pack
named above. Run the checksum list from that original pack layout; validate imported runtime files
with the brand tests.

## Approved visual system

| Region                             | Token         | Hex       |
| ---------------------------------- | ------------- | --------- |
| Trunk, roots, and main shelter     | Deep Forest   | `#0D3128` |
| Upper canopy                       | Ghaf Emerald  | `#126A50` |
| Inner/right canopy                 | Mangrove Teal | `#188B83` |
| Outer-right canopy                 | Dark Mangrove | `#28736C` |
| Primary icon and splash background | Bright Pearl  | `#F7F8F3` |

The paths, proportions, orientation, and negative space are immutable. The mark must not be
stretched, rotated, outlined, shadowed, gradient-filled, recolored ad hoc, or combined with text
inside an app icon. At 40 px or larger, the full-color mark is preferred on a light surface. Below
40 px, the one-color mark or supplied favicon is preferred. On Deep Forest, the approved reverse
mark is used. A minimum clear space equal to one-eighth of the mark width remains around it.

`غاف` and `Ghaf` remain live Alexandria text in wordmark contexts. They are not rasterized or
converted into the logo artwork.

## Repository replacement inventory

The inventory deliberately distinguishes product identity from tree-shaped product content.

| Existing location or surface                                                                                | Classification                                        | Migration decision                                                            | Evidence                                                                     |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `app.config.ts` platform identity                                                                           | Product brand; official icon fields previously absent | Configure supplied launcher, adaptive, monochrome, splash, and favicon assets | Resolved Expo configuration before and after migration                       |
| Web manifest and install assets                                                                             | Product brand; previously absent                      | Add supplied PWA and Apple touch assets plus install metadata                 | Static web export and platform tests                                         |
| `src/i18n/resources.ts` `common.brand` / `brandLatin`                                                       | Live bilingual wordmark                               | Retain unchanged                                                              | Arabic/English copy remains centralized                                      |
| `app/index.tsx` Welcome wordmark                                                                            | Live wordmark; frozen R001 surface                    | Retain unchanged; no logo placeholder exists                                  | `common.brand` text at the approved R001 composition                         |
| `src/components/access/AccessShell.tsx` access header                                                       | Live wordmark; frozen R001 surface                    | Retain unchanged                                                              | Reusable access header renders supplied live copy                            |
| `app/parent/index.tsx`, `app/parent/task/review.tsx`, `src/components/family-growth/ParentTaskComposer.tsx` | Live product-title text                               | Retain unchanged                                                              | Existing header title uses localized brand text                              |
| `src/components/access/GhafIcon.tsx`                                                                        | Generic UI icon family                                | Protect unchanged                                                             | `ghaf-tree` is a simple task/navigation/content glyph, not the official logo |
| `src/components/access/BotanicalAvatar.tsx`                                                                 | Profile identity                                      | Independently refresh with local botanical photos; never substitute the mark | Child avatar selection remains product content, not product branding         |
| `src/components/r002a/child/ChildHomeHeader.tsx`                                                            | Profile identity                                      | Protect unchanged                                                             | Header avatar represents the selected Child                                  |
| `src/components/r002a/child/ChildTaskHero.tsx`                                                              | Task illustration                                     | Independently refresh with provenanced local task photography                | Task context remains product content                                         |
| `src/components/r002a/child/ChildGardenProgressCard.tsx`                                                    | Garden content and navigation symbol                  | Protect unchanged                                                             | Tree/leaf/flower glyphs communicate progress                                 |
| `src/components/family-growth/GardenLandscape.tsx`                                                          | Landscape artwork                                     | Independently refresh with 25 provenanced local state images                 | Garden stage art is product state, not a logo                                |
| `src/components/family-growth/FamilyCanopy.tsx`                                                             | Family canopy artwork                                 | Independently refresh with exact provenanced local state images              | Canopy visual communicates earned family progress                            |
| `src/components/family-growth/CircleProgress.tsx`                                                           | Private community progress                            | Independently refresh with provenanced anonymous habitat photos              | Garden visual remains product content                                        |
| `src/components/r002b/GrowthJourneyScreens.tsx`                                                             | Impact Path and badge artwork                         | Protect unchanged                                                             | Feature content has separate semantic identity                               |
| `src/components/r002b/LearningScreens.tsx`                                                                  | Educational artwork                                   | Independently refresh with a provenanced local habitat study                 | Learning art retains its supporting role                                     |
| `src/components/r002b/RevealBundleScreen.tsx`                                                               | Reward/consequence artwork                            | Independently refresh with provenanced local natural imagery                 | Artwork represents, but never calculates, committed outcomes                 |
| `src/components/r002b/PrivateLeagueScreen.tsx`                                                              | League decoration and tree avatars                    | Remove the watermark; reuse local botanical profile photos for avatar tokens | League identity and projection remain live text/data                         |
| `src/components/r002b/SharedGrowthScreens.tsx`                                                              | Anonymous community artwork                           | Independently refresh with a provenanced local coastal scene                 | Shared Growth imagery remains non-brand product content                      |
| Existing `assets/images/**` and `assets/demo/**` outside `illustrations/r003/`                              | Prepared product content                              | Preserve unchanged; add the independent R003 manifest directory only          | No genuine brand placeholder was found                                       |
| `docs/design/stitch/releases/ghaf-r001/**`                                                                  | Historical approved design reference                  | Preserve unchanged                                                            | A reference is evidence, not runtime UI                                      |
| Original untracked `docs/design/stitch/releases/ghaf-r002/**`                                               | Raw design intake                                     | Preserve unchanged                                                            | Raw PNG/HTML exports are not migrated or staged                              |

No genuine runtime product-logo placeholder was found. Consequently, this migration does not add
an official mark to a frozen or approved screen merely to manufacture a visible replacement. The
new native `GhafMark` component is the exact, reusable identity primitive for a future explicitly
approved placement.

The product-owner-authorized 2026-09-06 natural-artwork refresh independently changes the product
content rows marked above. It does not revise the brand classification or permit any official mark,
wordmark, launcher, splash, favicon, or PWA derivative to change. Official brand checksums remain a
required regression gate for that refresh.

## Canonical repository assets

The integration copies only checksum-verified production derivatives into
`assets/brand/ghaf/`. Canonical vectors remain at the brand-root paths; launcher, adaptive,
themed, splash, favicon, PWA, Apple touch, and store raster derivatives remain under
`assets/brand/ghaf/app-icon/`. The unused notification and dark-alternate derivatives remain only
in the preserved source-pack evidence. Runtime and build configuration reference local assets only.

The reusable `GhafMark` component uses the project's existing `react-native-svg` dependency. It
reproduces the supplied paths directly, exposes only approved `fullColor`, `deepForest`, and
`reverse` variants, preserves the SVG view box and aspect ratio, and provides a decorative mode or
an explicit accessible label. No SVG transformer, WebView, DOM element, remote URL, or additional
illustration library is introduced.

## Platform mapping

| Surface                     | Approved source                                                         | Integration rule                                              |
| --------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------- |
| General Expo icon           | `app-icon/icon.png`                                                     | Supplied opaque 1024×1024 square; platform applies final mask |
| iOS icon                    | `app-icon/ios-icon-1024.png`                                            | Supplied opaque 1024×1024 square; no pre-rounded corners      |
| Android legacy icon         | `app-icon/android-legacy-icon-1024.png`                                 | Used as the legacy fallback                                   |
| Android adaptive foreground | `app-icon/android-adaptive-foreground-1024.png`                         | Transparent supplied foreground over Bright Pearl             |
| Android themed icon         | `app-icon/android-adaptive-monochrome-1024.png`                         | Transparent supplied monochrome layer; no custom recolor      |
| Native splash               | `app-icon/splash-icon-1024.png`                                         | Contained mark on Bright Pearl through the Expo splash plugin |
| Web favicon                 | `app-icon/favicon-48.png`                                               | Local configured favicon                                      |
| PWA icons                   | `app-icon/pwa-icon-192.png`, `pwa-icon-512.png`, `pwa-maskable-512.png` | Local manifest assets with explicit purpose                   |
| Apple web clip              | `app-icon/apple-touch-icon-180.png`                                     | Linked from the Expo Router document head                     |

Adding install metadata does not add a service worker, background networking, analytics, push
notifications, or a new product capability. The optional notification icon is archived as an
approved derivative but is not wired to a notification feature.

No splash configuration existed at the baseline. `imageWidth: 240` is therefore a conservative
captured choice rather than a change to an approved Opening Moment. Because the transparent source
contains about 430 px of visible artwork within its 1024 px canvas, the configured visible mark is
approximately 101 px wide. A preview or release build must confirm the final device composition.

## Prompt execution record

### Codex brand integration prompt

The prompt was executed as a constrained local integration: baseline audit, checksum and geometry
verification, replacement inventory, protected-content classification, exact local asset import,
native component creation, platform configuration, automated tests, documentation, and isolated
local commits. The duplicate root and nested prompt copies are byte-identical.

### Google Stitch brand replacement prompt

**BLOCKED — EXTERNAL TOOL UNAVAILABLE.** This session has no Google Stitch connector, project
handle, or mutation tool. The repository therefore does not pretend that any Stitch file was
updated. A content-faithful owner-supplied handoff is preserved at
`docs/design/brand/official-pack-v1.0/STITCH_BRAND_REPLACEMENT_PROMPT.md` for a teammate with Stitch
access. Raw Stitch exports remain untouched.

Before accepting a future Stitch update, verify that it preserves mobile composition, Arabic RTL,
English LTR, live Alexandria wordmarks, approved typography, interaction states, and every
protected avatar/illustration/icon boundary in the inventory above. Any new exports remain design
evidence until separately reviewed and selected.

## Validation record

| Check                                             | Result  | Evidence                                                                                     |
| ------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------- |
| Source-pack integrity                             | PASSED  | 49/49 entries passed `sha256sum -c` in the original pack layout                              |
| Deterministic vector regeneration                 | PASSED  | Every regenerated SVG variant matched the supplied file byte-for-byte                        |
| Official mark tests                               | PASSED  | `tests/official-brand-mark.test.ts`: 7/7                                                     |
| Platform-brand tests                              | PASSED  | `tests/official-brand-platform.test.ts`: 6/6                                                 |
| Full automated suite                              | PASSED  | `npm test`: 80 files / 1,002 tests                                                           |
| TypeScript                                        | PASSED  | `npm run typecheck`                                                                          |
| ESLint                                            | PASSED  | `npm run lint`                                                                               |
| Repository formatting                             | PASSED  | `npm run format:check`                                                                       |
| Scoped new-file formatting                        | PASSED  | Prettier checks for brand TypeScript, JSON, manifest, and documentation                      |
| Expo dependency alignment                         | PASSED  | `npx expo install --check`: dependencies up to date                                          |
| Expo diagnostics                                  | PASSED  | `npx expo-doctor`: 21/21 checks                                                              |
| Resolved Expo configuration                       | PASSED  | `npx expo config --type public` resolved every official asset and preserved existing plugins |
| Production web export                             | PASSED  | 28 static routes; exported manifest, both favicons, Apple touch icon, and PWA icon set       |
| Production Android JavaScript export              | PASSED  | Android Hermes bundle and metadata exported successfully                                     |
| Git whitespace validation                         | PASSED  | `git diff --check` and staged diff checks                                                    |
| External Google Stitch mutation                   | BLOCKED | No Stitch connector, project handle, or mutation tool is available in this session           |
| Physical Android launcher/themed icon/cold splash | BLOCKED | No configured Android device, Java, or SDK is available in this environment                  |
| Physical iOS icon/splash                          | NOT RUN | No iOS build environment or device is available                                              |
| Installed PWA icon/cache behavior                 | NOT RUN | Static files were verified; browser installation remains a manual device check               |

Static visual inspection covered the owner source silhouette, pack preview, primary app icon,
adaptive foreground, monochrome layer, splash mark, Deep Forest mark, reverse mark, and 32 px
favicon. Shape, orientation, palette, negative space, and transparent/opaque background treatment
matched the pack. The canonical SVG and 17 imported runtime/build assets remain byte-identical to
their source files.

Provided asset inspection is not a substitute for physical launcher/splash validation. Android
launcher masks, Android 13 themed icons, Android cold launch, iOS icon/splash behavior, installed
PWA appearance, and platform cache refresh remain BLOCKED until tested on the applicable devices
and build types. Expo Go is not authoritative for a configured app icon or native splash.

## Cache, rebuild, and release notes

Launcher icons and native splash configuration are build-time native resources. After pulling the
brand commits, reinstall dependencies, clear the Metro cache for troubleshooting as needed, and
create a new development or release build. Reopening an old installed binary cannot validate these
changes. OS launchers and browsers may cache icons; uninstall/reinstall the app or remove/reinstall
the PWA before judging a stale icon.

Release activation remains blocked until physical Android validation and the project's outstanding
R002b release gates pass. Public store submission additionally requires owner-held rights evidence
and a normal trademark/similarity review.

## Rollback

Rollback is commit-scoped: revert the local brand commits in reverse order, rebuild the native
application, and reinstall it so cached platform resources are replaced. Do not delete or rewrite
shared history. The source pack and this provenance record remain available for audit even if the
runtime configuration is reverted.

## Deliberate exclusions

- No raw Stitch PNG/HTML or Windows metadata is imported.
- No existing route or screen layout is edited.
- No profile avatar, Garden/League/learning/reward illustration, badge, task icon, or navigation
  symbol is replaced.
- No remote asset, external script, rasterized interface text, DOM-based runtime, or WebView is
  introduced.
- No dark alternate icon is enabled without a separately approved appearance policy.
- No notification feature is inferred from the supplied notification derivative.
- No push, merge, rebase, amend, deployment, publication, or remote mutation is part of this work.
