# Google Stitch Prompt — Replace Mock Branding with the Official Ghaf Mark

Attach `svg/ghaf-mark-full-color.svg` (or `png/ghaf-mark-full-color-1024.png` if SVG upload is unavailable), `svg/ghaf-mark-deep-forest.svg`, `svg/ghaf-mark-reverse.svg`, and `app-icon/icon.png`, then paste the prompt below.

---
Update the existing Ghaf — غاف design project to use the attached mark as the official Ghaf product identity. This is an asset migration, not a visual redesign. Preserve all approved screens, frame names, 390×844 mobile dimensions, copy, Arabic RTL and English LTR behavior, physical navigation anchoring, interactions, component states, feature documentation, and screen order.

## Official assets and colors

Use the attached vector geometry exactly. Do not redraw, reinterpret, simplify, crop, stretch, rotate, or generate a replacement.

- Full-color mark: Deep Forest `#0D3128`, Ghaf Emerald `#126A50`, Mangrove Teal `#188B83`, and Dark Mangrove `#28736C`.
- Preferred light background: Bright Pearl `#F7F8F3`.
- Use the Deep Forest one-color mark for compact placements on light surfaces.
- Use the Bright Pearl reverse mark on Deep Forest/dark surfaces.
- Keep Solar Amber as a supporting interface/celebration accent; do not add it inside the official logo.
- Keep `غاف` and `Ghaf` as live Alexandria text. Never bake text into the symbol.

## Audit before replacement

First inventory every logo-like object and classify it. Replace only objects functioning as a temporary or mock Ghaf product logo, including:

- System Launch and Opening Moment branding;
- Welcome, sign-in, verification, pairing, and onboarding brand marks;
- reusable Ghaf header/login brand marks;
- app-icon previews, favicon/PWA previews, and explicit generic logo placeholders;
- any other screen placement clearly labeled as the Ghaf logo.

Do not replace:

- Salem's botanical/profile avatar;
- Ghaf or Mangrove garden-stage hero illustrations;
- task-category art or task icons;
- badges, achievements, mastery emblems, or locked-badge silhouettes;
- League/community plant illustrations;
- navigation icons, accessibility icons, status icons, partner marks, or legal marks.

If an object is ambiguous, leave it unchanged and list it in the migration note for review. Do not run a blind global tree-image replacement.

## Placement rules

- Preserve the official mark's aspect ratio and internal negative space.
- Keep clear space of at least one-eighth of the mark width.
- Use full color at 40 px or larger; use the one-color variant below 40 px.
- Do not add gradients, shadows, outlines, glass effects, glow, bevels, containers, or decorative rings unless an already approved screen uses a background container. The logo artwork itself remains flat.
- Do not pre-round the app icon. Show the supplied full-square icon master and, when documenting masks, display separate circle/squircle/rounded-square previews.
- For the pure System Launch frame, retain only the centered app icon/mark on Bright Pearl with no copy, progress, buttons, percentages, or footer.
- For Opening Moment, use the official mark as the brand anchor while preserving the approved seed/leaf transition and live Arabic wordmark where they already exist. Do not merge the botanical transition art into the official logo.
- Make decorative logo instances non-announced in accessibility notes; standalone identifying/actionable instances use the localized accessible name `غاف` or `Ghaf`.

## Required design outputs

1. Update every approved frame that contains a genuine mock Ghaf logo.
2. Create one canonical component set outside the app frames:
   - `Ghaf Mark / Full Color`
   - `Ghaf Mark / Deep Forest`
   - `Ghaf Mark / Reverse`
   - `Ghaf App Icon / Primary`
   - `Ghaf App Icon / Dark Alternate — Preview Only`
3. Add a compact external documentation card titled `Ghaf — Official Brand Asset Migration` listing:
   - exact colors;
   - usage and clear-space rules;
   - all replaced frames;
   - all protected non-logo illustrations left unchanged;
   - any ambiguous placements requiring review;
   - app-icon mask previews.
4. Keep all documentation outside the 390×844 runtime frames.

## Verification

Before reporting completion, inspect every changed frame at 100% and verify:

- no mock product logo remains;
- no avatar, botanical content, badge, achievement, or navigation symbol was accidentally replaced;
- the logo is not clipped at 32, 40, 48, 64, and 96 px placements;
- Arabic and English text remain live and correctly directional;
- header and bottom-action physical anchoring is unchanged;
- System Launch and Opening Moment remain separate states;
- the app-icon mark survives circle, squircle, rounded-square, and teardrop previews;
- the official vector geometry and palette are unchanged.

Finish with a migration report naming every changed frame and every protected asset intentionally left untouched. Do not create new product screens, change feature gates, redesign badges, or alter R002b behavior as part of this request.

---
