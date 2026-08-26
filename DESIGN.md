---
name: 'Ghaf — غاف'
description: 'An Arabic-first phenology ledger where family action becomes measurable Ghaf growth.'
colors:
  ghaf: '#1D684F'
  ghaf-pressed: '#14513E'
  forest: '#12372D'
  forest-soft: '#35594D'
  leaf: '#718E6A'
  leaf-light: '#DCE5D7'
  leaf-mist: '#EDF1E8'
  sand: '#CBB98F'
  sand-light: '#E9E0CC'
  ivory: '#F3F0E7'
  surface: '#FBFAF5'
  earth: '#6F513D'
  gold: '#B87524'
  gold-light: '#E7D2A5'
  gold-glow: '#F3E8D1'
  sky: '#D6E2DE'
  ink: '#172621'
  ink-muted: '#606B65'
  line: '#CBCDC2'
  white: '#FFFFFF'
  success: '#317655'
  success-light: '#DDEBE1'
  danger: '#963E36'
  danger-light: '#F1DEDA'
  transparent: 'transparent'
typography:
  display:
    fontFamily: 'System, sans-serif'
    fontSize: '46px'
    fontWeight: 800
    lineHeight: '53px'
    letterSpacing: '-1px'
  title:
    fontFamily: 'System, sans-serif'
    fontSize: '32px'
    fontWeight: 700
    lineHeight: '39px'
    letterSpacing: '-0.5px'
  headline:
    fontFamily: 'System, sans-serif'
    fontSize: '21px'
    fontWeight: 700
    lineHeight: '29px'
  body:
    fontFamily: 'System, sans-serif'
    fontSize: '16px'
    fontWeight: 400
    lineHeight: '25px'
  label:
    fontFamily: 'System, sans-serif'
    fontSize: '13px'
    fontWeight: 600
    lineHeight: '19px'
  caption:
    fontFamily: 'System, sans-serif'
    fontSize: '12px'
    fontWeight: 500
    lineHeight: '18px'
rounded:
  sm: '6px'
  md: '10px'
  lg: '14px'
  xl: '18px'
  pill: '999px'
spacing:
  xxs: '4px'
  xs: '8px'
  sm: '12px'
  md: '16px'
  lg: '20px'
  xl: '24px'
  xxl: '32px'
  xxxl: '40px'
  huge: '56px'
components:
  button-primary:
    backgroundColor: '{colors.ghaf}'
    textColor: '{colors.white}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    padding: '12px 20px'
    height: '48px'
  button-secondary:
    backgroundColor: '{colors.leaf-light}'
    textColor: '{colors.forest}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    padding: '12px 20px'
    height: '48px'
  button-ghost:
    backgroundColor: '{colors.transparent}'
    textColor: '{colors.ghaf}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    padding: '12px 20px'
    height: '48px'
  card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.lg}'
    padding: '20px'
  input:
    backgroundColor: '{colors.ivory}'
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '12px 16px'
    height: '48px'
  disclosure-prepared:
    backgroundColor: '{colors.gold-glow}'
    textColor: '{colors.ink-muted}'
    typography: '{typography.caption}'
    rounded: '{rounded.sm}'
    padding: '16px'
  disclosure-safety:
    backgroundColor: '{colors.danger-light}'
    textColor: '{colors.ink-muted}'
    typography: '{typography.caption}'
    rounded: '{rounded.sm}'
    padding: '16px'
  origin-pill:
    backgroundColor: '{colors.leaf-mist}'
    textColor: '{colors.forest}'
    typography: '{typography.caption}'
    rounded: '{rounded.sm}'
    padding: '8px 12px'
---

# Design System: Ghaf Phenology Ledger

## Overview

**Creative North Star: "The Ghaf Phenology Ledger"**

Ghaf is a warm field record, not a generic family dashboard. Family wisdom enters as observed
context, a Child carries out one supervised action, a Parent verifies the result, and the record
advances through a living Ghaf specimen. Warm field paper, deep ink green, restrained saffron,
measured rules, and botanical plates make the progression feel culturally rooted and trustworthy.

The interface is expressive through structure rather than decoration. One dominant action appears
before the specimen or record detail; the Ghaf tree remains unboxed wherever progress matters; fine
rules, observation marks, and compact labels provide the visual grammar. Arabic is the first
composition, with English receiving equivalent LTR care.

**Key Characteristics:**

- Warm, field-paper surfaces with dark botanical ink and scarce saffron marks.
- A persistent observation rail and short record lines instead of ornamental chrome.
- One obvious next action before the screen's specimen, evidence, or record detail.
- A six-stage, measured Ghaf tree that carries progress and the emotional climax.
- Honest prototype, media-origin, simulation, and estimated-impact labels.
- Low-radius, tactile controls and flat, ruled surfaces rather than floating card stacks.

**The Living Record Rule.** Every major screen must connect action, Parent supervision, estimated
food rescue, and Ghaf growth; the tree is never decorative filler.

## Colors

The palette reads as ink and specimens on sun-warmed paper. Green establishes identity and action;
saffron records milestones; sand and brown ground the family-food context; red is reserved for
safety and correction.

### Primary

- **Ghaf Green** (`ghaf`): primary actions, progress fills, selected controls, and healthy growth.
- **Pressed Ghaf** (`ghaf-pressed`): the darker interaction state when a solid control needs it.
- **Deep Forest Ink** (`forest`): high-emphasis headings and the strongest non-action text.
- **Field Ink** (`ink`): default readable body copy.

### Secondary

- **Leaf Family** (`leaf`, `leaf-light`, `leaf-mist`): selected, completed, prepared, and calm
  supporting states. These tones support green; they do not replace the primary action color.
- **Earth** (`earth`): tree structure, record annotations, quantities, and grounded supporting copy.
- **Desert Sand** (`sand`, `sand-light`): dividers, secondary field surfaces, and household context.

### Tertiary

- **Saffron Record** (`gold`, `gold-light`, `gold-glow`): observation ticks, reward and milestone
  accents, bounded celebration, and focus. Use it sparingly so it retains meaning.
- **Success** (`success`, `success-light`): confirmed completion when an explicit positive state is
  needed.
- **Correction** (`danger`, `danger-light`): validation, retry, and food-safety boundaries only.

### Neutral

- **Warm Field Paper** (`ivory`): the application canvas.
- **Raised Paper** (`surface`): cards and selection surfaces with minimal tonal separation.
- **Graphite Annotation** (`ink-muted`): descriptions and disclosure copy.
- **Measured Rule** (`line`): borders, dividers, tree guides, and progress tracks.
- **White** (`white`): text or marks on solid dark green; not a default page background.
- **Sky Wash** (`sky`): an available environmental supporting tone, never a new brand accent.

**The Scarce Saffron Rule.** Gold is a record mark, milestone, or focus cue—not body text, a large
background field, or generic premium decoration.

**The State Is More Than Color Rule.** Selection, progress, error, and completion also use labels,
shapes, numbers, or marks; no meaning depends on color alone.

## Typography

**Display, Body, and Label Font:** the platform-safe system family (`sans-serif` on Android), using
the six roles in the frontmatter. The shipped prototype does not depend on an unverified custom
font.

**Character:** heavy, calm headlines feel like specimen titles; open body leading supports Arabic
diacritics and short mission narratives. Labels and captions are compact enough for metadata but
remain plain-language and readable.

### Hierarchy

- **Display:** reserved for rare identity or climax statements; never repeated through one screen.
- **Title:** one screen title or hero claim.
- **Headline:** section titles, mission titles, and primary metric values.
- **Body:** stories, explanations, and mission instructions.
- **Label:** controls, structured fields, and high-priority annotations.
- **Caption:** origin, prototype, estimate, progress, and supporting-status copy.

Arabic removes negative tracking, uses RTL writing direction, and aligns to the logical start.
English uses the corresponding LTR treatment. Explicit Arabic and English previews keep their own
direction even when shown together. Numbers and units stay on the same readable record line.

**The One Title Rule.** A screen has one title-level statement. Subsequent hierarchy steps down to
headline, body, label, and caption roles rather than inventing local sizes.

**The Arabic Is Composed Rule.** Never mechanically mirror an English layout. Check Arabic line
breaks, diacritics, mixed scripts, numerals, grams, portions, and long actions in their final visual
order.

## Layout

Screens use a centered content column capped at 720dp, with a 520dp compact reference width. The
base screen inset is 24dp horizontally, 40dp at the top, and 56dp at the bottom. The 4/8/12/16/20/
24/32/40/56 spacing rhythm governs all gaps; local one-off spacing is a defect unless it describes
the specimen artwork itself.

### Structural composition

- **Screen observation rail:** a one-pixel rule sits 12dp from the logical start edge. Its green
  cap and small saffron mark identify the page as a field record without becoming navigation.
- **Record line:** headings end with a short saffron rule and an eyebrow/caption. Section boundaries
  use fine neutral rules instead of nested containers.
- **Action before specimen:** after the header, place the dominant next action before the tree,
  mission record, or evidence block. The judge should know what to do before inspecting detail.
- **Unboxed measured Ghaf:** tree heroes sit directly on paper between rules. Vertical guides,
  ground axes, stage labels, and progress bars measure the specimen; do not put the tree in a
  decorative floating card.
- **Record density:** cards are reserved for real grouping—mission, impact, selection, input, or
  state—not for every section. Long screens scroll as one continuous ledger.

RTL changes the logical edge of the observation rail, row order where sequence matters, back-arrow
direction and position, prepared-badge edge, text alignment, and progress origin. LTR makes the
corresponding changes. Non-directional botanical and status symbols do not mirror.

### Fixed ten-screen application

The visual system serves exactly these authored screens and no more:

1. Entry (`/`): identity, unboxed Ghaf specimen, entry action, language, prototype disclosure.
2. Role selector (`/role`): Parent/Child demonstration role choice; explicitly not authentication.
3. Parent home (`/parent`): next action, family Ghaf, estimated impact, active mission, role switch.
4. Create mission (`/parent/create`): prepared context, bounded inputs, symbolic reward, safety note.
5. Generation (`/parent/generating`): four ordered simulated record stages and preserved context.
6. Parent review (`/parent/review`): both language versions and explicit assignment approval.
7. Child home (`/child`): approved adventure action, shared Ghaf, impact, reward preview.
8. Child mission (`/child/mission`): story, narration, three actions, evidence, reflection, submit.
9. Parent confirmation (`/parent/confirmation`): submission, evidence, estimate, retry, approval.
10. Celebration (`/celebration`): estimated rescue, growth transition, milestone, and family return.

Loading, empty, error, retry, awaiting, and celebration treatments remain states of those screens.
Do not create routes to hold transient states.

## Elevation & Depth

The ledger is flat by default. Depth comes first from warm tonal layers, measured borders, overlap,
and the tree's ground shadow. `soft` is a low ambient shadow (`0 2px 10px rgba(24, 49, 39, 0.06)`);
`lifted` is reserved for a genuinely elevated overlay (`0 16px 40px rgba(24, 49, 39, 0.14)`). The
celebration modal adds a dark scrim because it interrupts the current record.

**The Flat Paper Rule.** Cards at rest use tone and a one-pixel rule. Do not add a shadow merely to
make a section look important.

**The Single Lift Rule.** At most one interrupting layer may feel lifted at a time; stacked modal,
card, and tooltip elevation does not belong in this prototype.

## Shapes

The form language is botanical but measured: low continuous corners for controls, slightly softer
corners for grouped paper, and true pills only for tiny stage or progress indicators. The radius
scale in frontmatter is exhaustive.

- Small corners: segmented controls, icon buttons, state badges, step numbers, and record marks.
- Medium corners: buttons, inputs, media choices, action steps, and image clipping.
- Large corners: cards and modal paper.
- Extra-large corners: exceptional large surfaces only; do not make it the default.
- Pill geometry: progress tracks, dots, stems, and leaf construction—not large text containers.

Botanical icons are built from simple stems, leaves, rules, and geometric checks. They are
code-native React Native views or SVG, not emoji, stock icon badges, or a competing illustration
language.

**The Low-Radius Rule.** Ghaf is a field ledger, not a bubble UI. Avoid excessive pills, fully
rounded cards, or soft blobs around ordinary content.

## Components

### Screen and header

`Screen` owns the ivory canvas, logical observation rail, safe scrolling, keyboard behavior, and
content width. `JourneyHeader` owns one title, optional subtitle, one back/action row, and the short
record line. Routes stay thin and compose these primitives.

### Buttons and selection controls

Primary buttons are solid Ghaf green; secondary buttons are pale leaf; ghost buttons are ruled and
transparent. Use one dominant primary action per decision point. All controls have at least a
48×48dp target, visible pressed feedback, disabled opacity, and a two-pixel saffron focus border.
Segmented language, role, and quantity controls stay rectangular and use explicit radio semantics.

### Cards, fields, and record groups

Cards group a coherent record and otherwise remain flat. Inputs use the paper background, measured
rule, logical text direction, helper/error copy, and a visible focus state. Impact metrics use a
ruled two-column record grid. Mission details use dividers and numbered rows rather than decorative
tiles.

### Ghaf tree and progress

`GhafTree` is the signature component: one deterministic layered SVG with Seed, Germination,
Sapling, Young tree, Branching tree, and Full Ghaf tree stages. Guides and ground establish scale;
stage and percent copy make the illustration measurable. Parent approval drives progress; the tree
must not imply biological precision or grow before confirmation. Progress fills from logical start.

### Prepared media and origin disclosures

Prepared selections combine a clear label, source detail, selected mark, and prepared badge. Audio
controls expose play/pause, buffering, fallback text, and prepared-media status. `OriginPill` and
`DisclosureCard` classify seeded, prepared, simulated, pregenerated mock, live-optional, estimated,
and safety-boundary content without allowing metadata to dominate the task.

The two shipping raster assets are synthetic demo fixtures:

- `assets/demo/food-rescue-bread.jpg`: generated in the built-in image generator's generate mode,
  converted from PNG to a metadata-stripped 1448×1086 JPEG, and used as prepared Parent input.
- `assets/demo/child-evidence.jpg`: generated by the same process and dimensions, and used as
  prepared Child evidence.

Their exact prompts are preserved in `docs/DESIGN_DIRECTION.md`. Neither image contains a person,
Child, face, identifying information, logo, brand, text, watermark, or food-safety verdict. The
four MP3 files are synthetic text-to-speech fixtures; they are not real family recordings. The
Ghaf tree and UI symbols are repository-native vector/code artwork, not shipping rasters.

### Motion and icons

Screen navigation fades. Press feedback uses subtle opacity and scale. Generation advances through
four bounded stages with a short record-plate reveal. Tree entry and milestone growth use opacity,
translation, scale, and a short deterministic reveal. Motion durations are quick 160ms, standard
260ms, slow 520ms, and reveal 760ms. System reduced-motion preference produces an immediate or
near-immediate static final state; state never depends on animation completion.

Back arrows are geometric and reverse for RTL. Checks, play/pause marks, disclosure bars, and
branch/leaf symbols use the same simple line-and-specimen grammar. Mirror only directional icons.

### Accessibility targets

- Preserve 48dp minimum targets and at least 8dp separation where adjacent controls could collide.
- Supply roles, labels, selected/checked/disabled states, progress values, and polite live regions.
- Keep keyboard avoidance, visible focus, pressed and disabled feedback, and modal dismissal.
- Support font scaling and long Arabic wrapping without obscuring the primary action.
- Keep text/background contrast and redundant state cues; gold never carries body copy on ivory.
- Honor reduced motion and keep a meaningful static final frame.

### Capability honesty

- **Real prototype interaction:** navigation, locale/role selection, form choices, Parent review and
  approvals, Child steps and reflection, local impact update, deterministic tree response, reset.
- **Prepared/synthetic:** the two JPEGs and four TTS audio fixtures.
- **Simulated:** the four-stage processing sequence.
- **Pregenerated mock:** the structured bilingual mission returned by the deterministic provider.
- **Seeded:** the synthetic Ghaf family, Salem age 8–10, and starting impact/tree record.
- **Estimated:** the food-rescue quantity explicitly entered and confirmed by a Parent.
- **Optional later/future:** live AI, capture, recording, storage, production accounts, and all
  production infrastructure. None may be presented as shipped.

AI never determines food safety. The Parent decides whether a situation is suitable, approves a
mission before assignment, and confirms completion before impact, reward, or tree growth.

## Do's and Don'ts

### Do

- **Do** preserve the observation rail, record line, action-before-specimen hierarchy, and unboxed
  measured tree as the cross-screen signature.
- **Do** design Arabic/RTL first, then verify the corresponding English/LTR composition and mixed
  bilingual review state.
- **Do** use the token frontmatter and `src/design/tokens.ts` as synchronized design/runtime sources;
  change both together and reuse shared primitives before adding a local style.
- **Do** keep exactly one dominant action, Parent review visible, and estimated food-rescue outcome
  legible at the relevant decision and celebration points.
- **Do** add provenance beside any future shipping raster: creator/tool, mode, prompt or source,
  transformations, dimensions, metadata treatment, rights, and synthetic/real disclosure.
- **Do** validate Android touch, font scaling, RTL, Back behavior, media, keyboard, safe areas, and
  reduced motion on the named physical build before recording native acceptance.

### Don't

- **Don't** return to centered card stacks, pastel wellness decoration, generic achievement chrome,
  confetti, neon game styling, decorative AI chat, glassmorphism, or dashboard grids.
- **Don't** substitute generic desert ornament, heritage motifs, or stock botanical imagery for the
  specific family Ghaf and measured-ledger world.
- **Don't** box the hero tree, add a seventh stage, build a 3D game, or let metrics compete with the
  tree at the growth climax.
- **Don't** use emoji or mirror nondirectional icons; do not create left/right assumptions outside
  explicit directional artwork.
- **Don't** hide prepared, simulated, pregenerated, seeded, estimated, or prototype status, and do
  not imply food-safety judgment, authentication, monetary reward, or production readiness.
- **Don't** add an eleventh authored screen or turn a loading, error, retry, awaiting, or celebration
  state into a route without an approved specification change.

### Maintenance and finish gate

- The fresh Impeccable re-review is **PASS** for the shipped design direction represented by the
  ten source-defined screens and the final web-mobile evidence.
- Typecheck, lint, and format checks pass; Vitest passes 5 files / 32 tests.
- The five `output/playwright/*-final.png` captures are 412×915 web-mobile proxies and QA evidence,
  not product assets or native screenshots.
- Feature 001 T037 and Feature 002 T039 physical Android evidence remain **BLOCKED**. Feature 002
  T041 human timed/concept rehearsal remains **NOT RUN**.
- Ghaf remains an MVP Prototype. These results do not establish production readiness, physical
  Android acceptance, store readiness, or legal/compliance claims.
