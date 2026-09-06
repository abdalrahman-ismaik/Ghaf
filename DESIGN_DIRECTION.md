# Ghaf Design Direction

**Direction:** APPROVED for Feature 003 specification
**Date:** 2026-08-26
**Creative north star:** **The Living Family Garden — الحديقة العائلية الحية**
**Primary platform:** Android physical demo
**Language posture:** Arabic-first, bilingual

## Creative Idea

Ghaf turns a family's small daily actions into an interconnected UAE landscape. The flagship Ghaf
tree holds the household canopy; native desert groves, an oasis, and a coast show that family,
culture, and environmental stewardship belong to one living system.

The experience should feel warm, rooted, optimistic, and active. It should not look like a banking
rewards app, a school behavior chart, a generic analytics dashboard, a desert-themed skin, or a
mobile game designed to maximize screen time.

The garden is a memory of real action. The Child should want to leave the app to complete the task
and return briefly to see growth.

## Parent and Child Modes

One design system supports two emotional modes.

### Parent mode: calm stewardship

- Clear task status, child choice, safety, privacy, and definition of done.
- Compact evidence and neutral summaries rather than surveillance charts.
- A calm “Ghaf Guide” presence that improves decisions without pretending certainty.
- Specific wins before friction or suggested adjustments.
- No clinical language, alarming risk colors, or “normal/abnormal” scores.

### Child mode: capable explorer

- One obvious task choice, short steps, large targets, and an inviting garden horizon.
- Seeds visible as growth material, never money.
- A bounded “Ghaf Coach” that helps the Child act in the real world.
- Quiet but unmistakable growth after Parent confirmation.
- Language that is respectful and energetic, never babyish, commanding, or manipulative.

The Child mode may use more illustration and motion; the Parent mode may use more structured
records. Both share the same palette, typography, tree grammar, and Arabic-first composition.

## UAE Living Landscape

Represent five connected landscape tracks:

| Track | Visual cue | Task world |
| --- | --- | --- |
| Ghaf desert grove | broad canopy, roots, family gathering shade | kinship and family heritage |
| Samar desert grove | resilient branching and shared work markers | home responsibility and kindness |
| Sidr reflection grove | calm leaves, small reading/reflection place | learning, wellbeing, private faith/gratitude |
| Date-palm oasis | vertical palms, water channel, dates/table details | food care and hospitality |
| Mangrove coast | roots, shallow water, birds/fish silhouettes used sparingly | waste, water, energy, reuse, stewardship |

EAD documents Ghaf, Samar, and Sidr as native trees. The product meanings above are original design
metaphors, not official symbolism. The interface should say “inspired by UAE landscapes” rather
than imply that every species shares one literal habitat.

Ghaf remains the strongest brand silhouette. The other tracks enrich the garden; they do not dilute
the Ghaf identity.

## Growth and Reward Feel

Growth stages are **Seed → Shoot → Sapling → Shade → Flourishing**.

Every confirmed, acquisition-phase rewarded task produces one cause-and-effect sequence:

1. Parent recognition appears in plain language.
2. A small Seed travels from the task record toward the mapped landscape.
3. One visible biological detail changes: root, shoot, branch, leaf, fruit, shade, bird, or water
   ripple.
4. The household Ghaf canopy receives one subtle shared leaf only when `visibilityScope` is
   `household`.
5. The screen returns to the real-world meaning of the action.

Use predictable animation, never a slot-machine reveal. No coin showers, jackpot sounds, mystery
boxes, confetti storms, daily-loss countdowns, or dying vegetation.

Celebrate help-seeking and improvement as valid growth. A retry state should feel like adjusting a
path, not failing a test. Recognition-only and maintenance tasks use Parent acknowledgement and
meaning without a Seed animation or persistent landscape/canopy change. Only a recurrent fade-first
acquisition task prompts a Parent phase review after three confirmed completions; the app never
announces that a habit has formed or changes phase automatically.

## Visual Character

Keep the existing warm field-paper and botanical-ink identity, but open it into a landscape:

- warm ivory and sand as the ground;
- Ghaf green and deep forest as identity and action;
- mangrove teal and sky wash for environmental depth;
- date gold as a scarce milestone accent;
- earth brown for roots, trunks, paths, and task grounding;
- gentle coral only for a safety boundary or required correction.

Use low-radius, tactile controls and flat tonal grouping in Parent mode. Child mode may use slightly
softer task chips and seed vessels, while avoiding bubbly card stacks. Shadows are rare; depth comes
from layered landscape planes, overlap, and motion.

Botanical illustration should be code-native SVG or team-created artwork. Avoid stock desert
silhouettes, generic camel/falcon ornament, copied heritage motifs, emoji, glassmorphism, neon game
colors, and decorative AI avatars.

## Garden-Shaped Dashboard

The dashboard should answer three questions without becoming a grid of scores:

1. **What needs care today?** Parent-approved tasks and clear next actions.
2. **What grew because of us?** Trees, the chosen activity mix, and the family canopy.
3. **How are we contributing together?** A cooperative family or circle milestone.

For siblings, show one combined household canopy; each Child's own goal remains private to that
Child and guardians. Do not place raw Seed totals, pace, or age-unequal contributions side by side.
For cousins or other families, show coarse garden silhouettes or family-level Green Impact progress
bands, not ranked Child tiles.

Prayer, kinship, affection, food consumption, wellbeing, hygiene, disability-related routines,
media, reflections, and Parent observations never appear in a cross-family surface.

## Assistant Presence

AI is a quiet tool embedded in the task, not a decorative chat destination.

- **Ghaf Guide:** a small leaf-and-compass mark beside “Make this clearer,” “Make it smaller,”
  “Check safety,” or “Summarize this week.”
- **Ghaf Coach:** a bounded bottom sheet with large intent choices such as “Show me the steps,”
  “Help me plan,” “Practise the phrase,” or “I need an adult.”
- Always show whether the response is prepared/simulated or live.
- Show one short disclosure that AI may be wrong.
- Do not give the assistant a human face, emotional eyes, streak, pet-like dependence, typing lure,
  or open-ended companion personality.

Photo and voice controls are task actions, not persistent chat affordances. P0 uses prepared
synthetic media with visible labels.

## Arabic and RTL

Arabic is composed first, not mirrored after English.

- Use logical start/end layout, locale-aware alignment, and RTL-aware navigation/progress.
- Mirror only directional icons; do not mirror trees, checkmarks, cultural objects, or nondirectional
  symbols.
- Test Arabic-only, English-only, mixed scripts, Arabic numerals, Latin units, long task names, Seed
  counts, age bands, and cultural phrases.
- Keep Arabic line height generous and never clip diacritics.
- Bilingual Parent review preserves each language's own direction.
- Modern Standard Arabic is the prototype default; dialect and transliteration require human review.

## Motion

Motion explains cause and effect and then stops.

- route change: short fade/slide following logical direction;
- task selection: immediate pressed and selected state;
- assistant: one contained leaf/ink reveal, no fake “thinking” theater longer than needed;
- Seed award: short arc to the mapped landscape;
- growth: restrained root/branch/leaf reveal with a meaningful static final frame;
- cooperative milestone: a brief canopy/water/ambient response, then stillness;
- reset: fast and noncelebratory.

Honor reduced motion with an immediate final state and clear text. State changes must never depend
on animation completion.

## Cultural and Safety Details

- Use family, landscape, hospitality, and heritage references as functional content, not ornament.
- Majlis scenes prioritize listening, greeting, host cues, and permission before photography.
- Wedding tasks offer Parent-approved phrase choices and follow event/family cues.
- Children may set out dates, water, or napkins; they do not handle hot gahwa in P0.
- Waste illustrations show clean, identifiable recyclables and a sealed light bag—never sharps,
  batteries, chemicals, glass, unknown waste, or dramatic garbage.
- Food visuals never claim safety or pressure the Child to eat.
- Prayer content uses a calm private treatment and never appears in competitive celebration.

## Prepared Media Direction

Reuse existing synthetic media only when it fits the new task and the origin remains documented.
Create any new P0 fixture with:

- no child, face, hand, personal data, brand, address, school, readable private text, or watermark;
- a clear task-object focus rather than surveillance evidence;
- consistent warm UAE home lighting and landscape palette;
- metadata removal and a recorded prompt/source/transformation trail; and
- a visible prepared/synthetic label in the interface.

The recycling demo fixture should show only intact, non-sharp, clean paper/plastic items accepted by
the local stream on a
neutral household surface. Do not show glass, batteries, medicine, chemicals, sharp edges, spoiled
food, or a Child.

## Design Review Questions

- Does the screen send the Child toward a real action rather than more screen time?
- Is one next action obvious without explanation?
- Can the Child succeed with help or ask to make the task smaller?
- Does recognition describe an action or strategy rather than worth?
- Is the reward fixed, nonfinancial, and free of loss pressure?
- Is sensitive content private and absent from circle comparison?
- Is the assistant visibly AI, bounded, and subordinate to a Parent-approved task?
- Is symbolic growth separated from measured sustainability impact?
- Does Arabic feel authored rather than mirrored?
- Is UAE identity specific, respectful, and free from generic decoration?
- Does reduced motion preserve the complete meaning?
- Is every prepared, simulated, estimated, or future capability labeled honestly?

## Anti-Patterns

Do not introduce public Child leaderboards, rank podiums, streak flames, coin stores, trophies for
prayer, “good/bad child” copy, normality scores, emotion faces, surveillance timelines, chat-first
navigation, AI friend language, confetti, neon gamification, generic desert décor, excessive cards,
or ecological impact numbers without a defensible method.

This direction becomes implementation truth only after it is captured in an approved Feature 003
specification and verified in the actual Android build.
