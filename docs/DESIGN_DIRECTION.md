# Ghaf Design Direction

**Decision status:** PROPOSED

**Primary platform:** Android physical demo device

**Language posture:** Arabic-first, bilingual

Ghaf should feel warm, rooted, calm, and memorable—not like a generic dashboard. The tree is the
emotional center of the experience and should make family progress understandable before a judge
reads any metric.

## Visual Idea

The family begins with a seed. Each approved sustainability adventure adds visible life: roots,
trunk, branches, leaves, and eventually environmental details such as shade or birds. Organic forms
and gentle motion connect household action, Emirati landscape, family memory, and resilience.

The design should be child-friendly without becoming childish. Use generous spacing, rounded
surfaces, tactile buttons, simple illustrations, short copy, and quiet celebrations. Avoid dense
tables, tiny metadata, dashboard grids, neon game styling, and decorative AI-chat conventions.

## Provisional Palette

| Token family | Intended use                                    |
| ------------ | ----------------------------------------------- |
| Ghaf Green   | Primary actions, healthy progress, leaves       |
| Deep Forest  | High-emphasis text, tree depth, selected states |
| Desert Sand  | Warm secondary surfaces and landscape context   |
| Warm Ivory   | Main background and breathing space             |
| Earth Brown  | Trunk, grounding details, supporting text       |
| Soft Gold    | Milestones, reward accents, limited celebration |

Exact color values are implementation tokens, not final brand decisions. Validate contrast, color
meaning, and rendering on the primary Android device before marking them approved. Gold should be
an accent, not body text on ivory. Do not communicate progress or errors by color alone.

## Shape, Type, and Spacing

- Prefer organic rounded cards and buttons with a restrained radius scale.
- Use a small spacing scale consistently; leave extra breathing room around Arabic headlines and
  the Ghaf hero.
- Start with platform-safe type while evaluating an Arabic family with clear diacritics, readable
  numerals, and compatible English companions.
- Keep headings warm and confident; keep mission steps short and highly scannable.
- Use gentle shadows and tonal surface changes. Avoid heavy elevation and floating-dashboard
  stacks.
- Keep primary actions within comfortable thumb reach and maintain practical touch targets.

## Ghaf Tree System

The tree component accepts one deterministic stage so it can serve as a hero, progress indicator,
and celebration anchor across Parent and Child views.

| Stage | Name           | Visual cue                                             |
| ----: | -------------- | ------------------------------------------------------ |
|     0 | Seed           | Seed resting in warm sand                              |
|     1 | Germination    | Small root and first upward shoot                      |
|     2 | Sapling        | Young trunk with a few leaves; Feature 001 reset stage |
|     3 | Young tree     | Taller trunk, established roots, fuller crown          |
|     4 | Branching tree | Distinct spreading branches and richer leaves          |
|     5 | Full Ghaf tree | Wide healthy canopy and optional milestone details     |

Preferred implementation is layered SVG. Animate opacity, scale, translation, and a limited path
reveal with Reanimated when it materially improves the climax. Keep transitions deterministic and
short enough for rehearsal. Do not use fragile path morphs or build a real-time 3D tree. Six
transparent image stages are the reliable fallback; use Lottie only if finished assets already
exist.

## Foundation Component Language

The approved small set is:

```text
Screen
Text
Button
Card
Input
IconButton
ProgressBar
RoleSwitcher
MissionCard
ImpactCard
GhafTree
LoadingExperience
EmptyState
ErrorState
CelebrationOverlay
LanguageSwitcher
```

Components should use tokens and expose only the variants required by approved screens. Loading
and success states should feel intentional, but Feature 001 should not build the full AI generation
or impact celebration screens reserved for Feature 002.

## Arabic and RTL Rules

- Arabic is the starting locale.
- Use logical `start`/`end` alignment and row ordering rather than hard-coded left/right rules.
- Set text alignment from locale for headings, paragraphs, inputs, and cards.
- Mirror back/forward and progression cues; do not mirror nondirectional icons.
- Check Arabic-only, English-only, mixed Arabic/English, long labels, numbers, grams, portions, and
  time values.
- Progress should grow from the logical start edge in each locale.
- Expect global native direction changes to require a reload; per-screen logical styling must keep
  the demonstration readable even before a reload.
- Review line height and clipping on the actual Android build, not only web.

## Motion

Motion should reinforce cause and effect:

- language and role changes: immediate and calm;
- loading: a short organic pulse or leaf movement;
- Ghaf growth: an unmistakable stage transition with restrained leaf/branch reveal;
- milestone: a brief warm overlay, then return focus to the tree and impact;
- reset: fast and unsurprising, without a celebratory animation.

Always provide a static final state. Avoid long blocking sequences, excessive particle effects, and
motion that makes the 90-second demo difficult to control.

## Synthetic Prepared-Media Direction

The two food photographs are synthetic competition-demo fixtures generated with the built-in image
generator in **generate** mode. They contain no people, identifying information, brands, or food-
safety judgment. The generated PNGs were converted to repository-sized JPEGs and metadata was
removed. The exact prompts were:

```text
Use case: photorealistic-natural
Asset type: prepared household food-waste situation image for a polished Arabic-first family sustainability mobile prototype
Primary request: a believable overhead photograph of several pieces of extra Arabic flatbread on a warm ceramic plate, clearly a household leftover-food situation ready for an adult to assess and reuse
Scene/backdrop: warm ivory stone kitchen surface with a folded desert-sand linen napkin and a subtle Ghaf-green accent bowl at the edge
Subject: only the plate and extra flatbread; food looks ordinary and dry but not moldy, spoiled, unsafe, or unappetizing
Style/medium: photorealistic natural editorial food photography, authentic texture, restrained competition-demo polish
Composition/framing: portrait-friendly 4:3 crop, centered plate, generous clean margins for mobile card cropping
Lighting/mood: soft UAE morning window light, warm, calm, respectful
Color palette: warm ivory, desert sand, deep brown, restrained Ghaf green
Constraints: no people, no hands, no faces, no personal information, no logos, no brands, no text, no watermark, no implication that AI judged food safety, no excessive food styling
Avoid: mold, decay, garbage bins, dramatic waste imagery, glossy stock-photo look
```

```text
Use case: photorealistic-natural
Asset type: prepared child-evidence image for a polished Arabic-first family sustainability mobile prototype
Primary request: an overhead photograph showing the successful result of reusing approved extra Arabic flatbread as crisp toasted bread pieces beside a simple fresh family salad, clearly connected to a completed bread-rescue adventure
Scene/backdrop: warm ivory stone kitchen surface with the same desert-sand linen and restrained Ghaf-green ceramic accent as the input image
Subject: finished toasted flatbread pieces and a modest family salad; no people or hands
Style/medium: photorealistic natural editorial food photography, authentic homemade texture, warm and achievable rather than restaurant luxury
Composition/framing: portrait-friendly 4:3 crop, evidence object centered with generous margins for a mobile evidence card
Lighting/mood: soft UAE morning window light, celebratory but calm
Color palette: warm ivory, desert sand, deep brown, Ghaf green, subtle fresh vegetable color
Constraints: no people, no child, no hands, no faces, no personal information, no logos, no brands, no text, no watermark, no food-safety claim, no before-and-after labels
Avoid: lavish feast, excessive styling, mold, waste bin, plastic packaging, glossy stock-photo look
```

The four voice fixtures are synthetic text-to-speech, not recordings of real family members or
children. They were generated with `edge-tts 7.2.8` using UAE Arabic and British English voices.
Their exact bilingual scripts, durations, and file mapping are maintained in
`src/features/missions/demoContent.ts` so visible transcripts match playback. After bilingual copy
review, all four clips were regenerated from those exact scripts; current durations are 11.424 s
(family Arabic), 8.376 s (family English), 18.288 s (narration Arabic), and 12.048 s (narration
English).

## Screen Hierarchy

Each approved screen should answer three questions at a glance:

1. Where am I: Ghaf identity and current role.
2. What should I do next: one dominant action.
3. Why it matters: tree progress, mission purpose, or food-rescue impact.

The initial four foundation routes establish this hierarchy. The Feature 002 plan evaluates only
the entry, role selector, Parent home, create mission, AI generation, Parent review, Child home,
Child mission, Parent confirmation, and impact celebration sequence. Do not add screens until that
flow is coherent.

## Design Review Checklist

- Ghaf/غاف identity is visible without crowding the screen.
- The tree is the strongest visual element where progress matters.
- One primary action is obvious.
- Arabic and English layouts feel composed rather than mechanically mirrored.
- Long Arabic copy wraps without obscuring actions.
- Touch targets, contrast, and focus/pressed/disabled states are clear.
- Mock or pregenerated behavior is disclosed without dominating the experience.
- The primary Android device and build are recorded.
- Motion has a deterministic static fallback.

Physical-device visual approval remains **NOT RUN** until a device/build observation is recorded in
the demo runbook and repository status table. A 412×915 browser review passed the Arabic and English
Parent home, bilingual review, and celebration compositions; it specifically verified logical row
order, RTL/LTR progress origin, back direction/position, long-copy wrapping, and the tree's
Sapling-to-Young-tree climax.
