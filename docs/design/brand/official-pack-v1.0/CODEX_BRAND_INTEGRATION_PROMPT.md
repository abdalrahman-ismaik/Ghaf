# Codex Prompt — Integrate the Official Ghaf Logo and App Icon

Copy everything below this line into Codex after extracting this asset pack into a known local path.

---
You are working in the Ghaf repository on the local branch `integration/r3-r002b-implementation-20260905`.

The product owner has approved the supplied logo pack as the official Ghaf brand mark and authorizes a narrowly scoped brand-asset migration. Implement it professionally across the application, while preserving every existing R001, R002a, and feature-flagged R002b behavior.

## Current verified baseline

- R001/R002a onboarding, Parent dashboard, tasks, Child flow, review/support, and Garden are complete.
- Twelve R002b candidate screens exist behind default-off flags.
- 40/44 R002b tasks are complete.
- The reported baseline has passing typecheck, lint, formatting, exports, and 989 tests.
- Reveal v2 receipts, the 132-seed Learning unlock, physical Android/TalkBack validation, and human content/privacy/accessibility reviews retain their current status.

This brand migration does **not** authorize you to resolve, bypass, enable, redesign, or change any of those product gates.

## Inputs

The extracted official asset pack is at:

`<ABSOLUTE_PATH_TO_EXTRACTED_GHAF_OFFICIAL_LOGO_PACK>`

Before editing, verify that this directory contains:

- `svg/ghaf-mark-full-color.svg`
- `svg/ghaf-mark-deep-forest.svg`
- `svg/ghaf-mark-reverse.svg`
- `app-icon/icon.png`
- `app-icon/ios-icon-1024.png`
- `app-icon/android-legacy-icon-1024.png`
- `app-icon/android-adaptive-foreground-1024.png`
- `app-icon/android-adaptive-monochrome-1024.png`
- `app-icon/splash-icon-1024.png`
- favicon and PWA derivatives
- `README.md`, `PROVENANCE.md`, `VECTOR_TRACE_REPORT.json`, and `CHECKSUMS.sha256`

If the path or any required file is missing, stop and report the exact missing input. Do not recreate the mark from memory.

## Authority and hard boundaries

You are authorized to:

1. Add the official logo assets to the repository's canonical brand-assets location.
2. Replace genuine temporary/mock Ghaf product-logo usages across implemented and feature-flagged screens.
3. Configure the native app icon, Android adaptive/themed icon, native launch screen, web favicon, and PWA icons.
4. Add a reusable logo component if the architecture benefits from one.
5. Add tests, migration documentation, asset inventory, and validation evidence.

You are **not** authorized to:

- change feature flags or their defaults;
- unblock R002b product decisions;
- invent League, Challenge Leaf, Family Reward, or Reveal v2 receipts;
- alter reward, seed, garden, task, review, authentication, privacy, or learning-unlock logic;
- modify raw Stitch exports;
- replace content illustrations merely because they contain a tree;
- merge, rebase, push, publish, deploy, or create a pull request;
- discard or overwrite unrelated user changes;
- run `expo prebuild --clean` or any destructive cleanup.

Keep the work on the current integration branch unless repository instructions explicitly require a short-lived child branch. Do not switch to the original worktree.

## Phase 1 — Preflight and repository discovery

1. Read the repository instructions (`AGENTS.md` and any nested equivalents), architecture notes, current design-intake gates, package scripts, and Expo configuration before editing.
2. Run and record:
   - `git status --short --branch`
   - `git log -8 --oneline --decorate`
   - current Node/package-manager versions
3. Confirm the checked-out branch is exactly `integration/r3-r002b-implementation-20260905`. If it is not, stop and report the mismatch.
4. If the worktree is dirty, identify every pre-existing change and preserve it. Do not fold unrelated work into these commits.
5. Find the actual Expo config (`app.json`, `app.config.*`, or equivalent), asset directories, web manifest, splash plugin configuration, icon declarations, reusable brand components, and all logo-like files/references. Use `rg`/`rg --files` first.
6. Record a baseline of the relevant fast checks before changing code. Use repository scripts rather than inventing new commands.

## Phase 2 — Build a replacement inventory before replacing anything

Create a checked-in migration inventory, preferably at `docs/design/brand/GHAF_OFFICIAL_LOGO_MIGRATION.md`, with one row per current logo-like asset or component:

| Existing path/component | Used by | Classification | Decision | Replacement |
| --- | --- | --- | --- | --- |

Classify each item as one of:

- `brand-placeholder` — replace;
- `official-brand-asset` — retain or normalize;
- `profile-avatar` — do not replace;
- `botanical-content` — do not replace;
- `badge-or-achievement` — do not replace;
- `navigation-or-task-icon` — do not replace;
- `partner-or-legal-mark` — do not replace;
- `unclear` — stop and request a decision for that item.

The phrase “replace all mock logos” means all actual temporary Ghaf product-brand marks. It does **not** mean global replacement of every tree, leaf, seed, mangrove, Ghaf illustration, or circular avatar.

Explicitly protect:

- Salem's botanical/profile avatar;
- garden and growth-stage hero art;
- Mangrove and Ghaf educational illustrations;
- badge and achievement art;
- task-category and navigation icons;
- community/shared-growth illustrations;
- partner, government, certification, and legal marks.

Do not perform a blind filename-based or visual global replacement.

## Phase 3 — Add canonical assets

Follow existing repository conventions. If no convention exists, use a structure equivalent to:

```text
assets/brand/ghaf/
  ghaf-mark-full-color.svg
  ghaf-mark-deep-forest.svg
  ghaf-mark-reverse.svg
  ghaf-mark-full-color-1024.png
  app-icon/
    icon.png
    ios-icon-1024.png
    android-legacy-icon-1024.png
    android-adaptive-foreground-1024.png
    android-adaptive-monochrome-1024.png
    splash-icon-1024.png
    favicon-48.png
    favicon-32.png
    pwa-icon-192.png
    pwa-icon-512.png
    pwa-maskable-512.png
    apple-touch-icon-180.png
    play-store-icon-512.png
```

Also copy the pack's `README.md`, `PROVENANCE.md`, `VECTOR_TRACE_REPORT.json`, and checksums into the project's design/brand evidence location. Preserve these approved colors exactly:

- Deep Forest `#0D3128`
- Ghaf Emerald `#126A50`
- Mangrove Teal `#188B83`
- Dark Mangrove `#28736C`
- Bright Pearl `#F7F8F3`

Do not add gradients, shadows, outlines, an amber seed, text, or decorative effects to the official mark.

## Phase 4 — Reusable in-app brand component

Inspect the existing rendering stack before choosing an implementation.

- If `react-native-svg` and the project's SVG strategy are already present, create or update a typed `GhafMark` component using the canonical vector paths/assets.
- If SVG loading is not supported, use the supplied transparent PNG fallback for native runtime and retain SVG as the design/web source of truth.
- Do not add a new transformer or dependency solely for this migration unless the existing architecture clearly requires it and the change is justified in the migration record.

The component should support only approved variants:

- `fullColor` on Bright Pearl/light surfaces;
- `deepForest` for compact one-color/light-surface use;
- `reverse` on Deep Forest/dark surfaces.

It should preserve aspect ratio, accept a semantic size, and avoid arbitrary recoloring. When the mark is adjacent to visible `غاف`/`Ghaf` text, treat the mark as decorative for screen readers. When it appears alone as an actionable or identifying element, expose the localized accessible name (`غاف` in Arabic, `Ghaf` in English). Do not announce decorative splash artwork.

## Phase 5 — Replace approved product-brand usages

Replace every item classified `brand-placeholder`, including as applicable:

- native/system launch branding;
- the in-app Opening Moment brand mark;
- Welcome/sign-in/onboarding wordmark-adjacent marks;
- Parent and Child product-brand marks in headers or profile-selection surfaces;
- generic Ghaf logo placeholders inside implemented or feature-flagged R002b screens;
- browser favicon/PWA install branding;
- store/app icon assets.

Preserve the approved layouts, spacing, RTL/LTR behavior, 390×844 reference geometry, accessibility targets, animations, and reduced-motion behavior. This migration changes brand art, not screen hierarchy or product copy.

Use `غاف`/`Ghaf` as live Alexandria text where a wordmark is required. Never bake words into the icon.

## Phase 6 — Configure platform icons and splash safely

Merge into the existing Expo config; never overwrite the existing `plugins` array or unrelated config.

Use the equivalent of the following only after adapting paths to repository conventions and verifying the installed Expo SDK schema:

```json
{
  "expo": {
    "icon": "./assets/brand/ghaf/app-icon/icon.png",
    "ios": {
      "icon": "./assets/brand/ghaf/app-icon/ios-icon-1024.png"
    },
    "android": {
      "icon": "./assets/brand/ghaf/app-icon/android-legacy-icon-1024.png",
      "adaptiveIcon": {
        "foregroundImage": "./assets/brand/ghaf/app-icon/android-adaptive-foreground-1024.png",
        "backgroundColor": "#F7F8F3",
        "monochromeImage": "./assets/brand/ghaf/app-icon/android-adaptive-monochrome-1024.png"
      }
    },
    "web": {
      "favicon": "./assets/brand/ghaf/app-icon/favicon-48.png"
    }
  }
}
```

For the existing `expo-splash-screen` plugin:

- point `image` to `splash-icon-1024.png`;
- set/preserve Bright Pearl `#F7F8F3` as the approved light background;
- preserve the already approved image width/timing unless the repository has no value;
- if no image width exists, choose a conservative value, capture it, and document the decision rather than silently changing the Opening Moment composition;
- preserve any current dark-mode policy; do not introduce the alternate dark icon as a default without product approval.

If the project has a web manifest, register separate `any` and `maskable` icons with correct sizes and purposes. Use `pwa-maskable-512.png` only for `purpose: "maskable"`.

Configure `notification-icon-96.png` only if notifications and their icon field already exist. It is a white transparent Android status-bar silhouette, not a general UI logo.

If the project owns native `ios/` or `android/` directories without Expo Prebuild authority, follow the repository's existing native asset workflow. Do not assume app-config changes alone will update checked-in native resources.

## Phase 7 — Automated validation

Add focused tests where appropriate and run the repository's canonical commands. At minimum verify:

1. Every configured asset path resolves.
2. Required dimensions are exact.
3. iOS, legacy Android, PWA, Apple-touch, and store icons are opaque.
4. Adaptive foreground, adaptive monochrome, splash, favicon, and optional notification assets have the expected transparency.
5. The iOS icon is square, full-bleed, and has no pre-rounded corners.
6. The adaptive mark remains inside the central safe zone and survives circle, squircle, rounded-square, and teardrop masks.
7. SVG files contain no `<image>`, external URLs, scripts, filters, or fonts.
8. No old brand-placeholder reference remains except intentional historical documentation/fixtures.
9. Protected avatars, illustrations, badges, and icons are byte-identical unless they were independently changed before this work.
10. Arabic RTL and English LTR layouts are unchanged except for the intended logo asset.
11. Feature-flag defaults and product-state snapshots are unchanged.

Then run, using the repository's actual scripts:

- typecheck;
- lint;
- formatting check;
- full test suite (expected baseline: 989 tests unless the repository has legitimately advanced);
- Expo config resolution (`npx expo config --type public` or repository equivalent);
- Expo Doctor;
- web production export;
- Android JavaScript export/build path used by the project;
- documentation-link and Git whitespace validation.

Do not claim native icon or splash validation from Expo Go. Current Expo guidance requires an internal/preview or production build for trustworthy splash testing, and launcher icons require a native rebuild.

## Phase 8 — Visual and device evidence

Capture and retain evidence for:

- system launch screen;
- in-app Opening Moment;
- Welcome/onboarding/sign-in surfaces that show the brand;
- representative Parent and Child surfaces where the brand appears;
- browser favicon and installed-PWA icon;
- Android launcher masks: circle, squircle, rounded square, and teardrop;
- Android 13+ themed icon using the monochrome layer;
- iOS launcher icon on at least one light and one visually busy wallpaper;
- 1×/2×/3× rendering and the favicon at 16/32/48 px;
- Arabic and English;
- reduced-motion launch behavior.

When a physical Android device is unavailable, mark physical launcher, splash, themed-icon, TalkBack, and native Back/IME checks as `NOT RUN` or `BLOCKED`; do not convert them into false passes.

## Phase 9 — Documentation

Update the migration document with:

- source and destination inventory;
- every replaced usage and every protected non-logo usage;
- config changes;
- source SHA-256 and provenance;
- exact palette;
- test commands and results;
- visual evidence paths;
- blocked physical/human reviews;
- cache/rebuild notes;
- rollback procedure.

Document that this is the internally approved official mark but that public trademark/similarity clearance remains a product/legal action, not a software-test result.

## Commit plan

Keep commits reviewable and do not mix unrelated changes. Prefer:

1. `chore(brand): add official Ghaf logo asset system`
2. `feat(brand): replace mock Ghaf marks on approved surfaces`
3. `build(brand): configure app icons splash and web assets`
4. `test(brand): validate official logo integration`
5. `docs(brand): record migration evidence and provenance`

If repository conventions favor fewer commits, combine only adjacent phases while retaining a clear history. Run relevant checks before each commit. Do not amend unrelated existing commits. Do not push.

## Definition of done

The migration is complete only when:

- one canonical Ghaf mark system is used everywhere product branding appears;
- all mock product logos are removed or explicitly documented as historical fixtures;
- no protected content artwork was replaced;
- app, adaptive, themed, splash, favicon, PWA, and store assets are correctly configured;
- all feature flags and product behavior are unchanged;
- automated validation passes;
- evidence and remaining physical/human blocks are truthfully recorded;
- the worktree is clean and commits are local.

Finish with a concise report containing:

1. branch and commit hashes;
2. exact files/surfaces migrated;
3. tests and exports run with counts;
4. visual evidence paths;
5. blocked/not-run validations;
6. confirmation that nothing was pushed, merged, rebased, deployed, or product-unblocked.

---
