# Ghaf Design Direction

## 2026-09-13 selected brand identity

**5A Refined Classic** is the user-selected Ghaf logo: three family figures beneath one spreading
Ghaf canopy. Current raster, vector and platform assets derive from one master; the
[5A migration record](brand/5a-refined-classic/README.md) owns its provenance and usage.
Earlier references to immutable logo geometry describe the superseded September 5 mark. This
brand replacement does not change the botanical UI direction, typography or product content.

## 2026-09-11 implemented botanical direction

The user-approved Tamagui and Reanimated redesign is the active visual direction. The built
system is documented in `DESIGN.md`; `src/design/tokens.ts` remains the runtime authority.
The additive botanical palette, geometry, and spacing supersede older presentation values on
migrated surfaces. Historical R001/R002a token values remain unchanged for compatibility.

The result uses limestone ground, warm paper, forest emphasis, sage supporting surfaces, water
tones, and restrained amber. Alexandria headings and Readex body/control roles retain their
existing Arabic/English metrics and local-font fallback. The Living Family Garden remains the
creative north star; the redesign adds no new logo, imagery source, product behavior, or route.

Parent Home now pairs local canopy artwork and cooperative progress with an open next-action
section. Child Today adds profile-scoped landscape context; Garden gives the selected landscape
more space. Task controls, access forms, headers, navigation, review/success states, Family, and
settings use the shared botanical surface language. Divided rows and open sections reduce
repeated card framing. Existing gated Growth surfaces inherit shared styling while remaining gated.

Tamagui owns theme, Text, Card, and general layout composition. Native TextInput retains editing
and keyboard behavior; Reanimated Pressable retains the actual button interaction and style
callback. Native style adapters and explicit web direction/language/accessibility mappings keep
the two renderers aligned. The library choice does not require replacing a working native control.

Shared press feedback is 120ms at scale 0.985, with spatial feedback disabled under reduced motion.
The state timing token is 180ms; existing modal and growth sequences keep their own event-owned
timing. Bottom tabs do not gain a spatial transition. All progress remains independent of motion.

This section and the active eight-section rulebook take precedence over older visual guidance
below. Earlier dated notes preserve decisions from their own revisions; stale startup durations,
route/step counts, and circle-only sharing descriptions are not current product authority.
Current specifications own behavior, and the runbook/evidence checklist owns validation claims.

## 2026-09-07 onboarding image-edge progress clarification

The dark lower strip on the onboarding photographs feels applied after the image rather than
integrated with it. Remove it. Let one fine rounded perimeter stroke begin as a small lower-center
mark and grow evenly in both directions as the six explicit moments advance, completing the frame
only on the last photograph. Keep the treatment calm, high-contrast, and close to the crop edge so
the photography remains dominant. Retain the original lower current/total plus dots as the simple
accessible indicator; do not add another label, timer, glow, or interaction.

## 2026-09-07 compact audio onboarding clarification

The six-moment first-run experience is introduced directly by the Ghaf Guide. Use short
first-person headlines and one concrete sentence per moment: welcoming and energetic, never
chatty, companion-like, or inflated. Center the copy. Reveal every existing 1200×800 photograph in
its responsive 3:2 editorial frame so the curated mix of astonishing wide views and close details
is visible. Restore the original current/total plus dot row directly above the navigation buttons;
use a wider saturated current dot and clearly visible neutral dots without enclosing the indicator
in a heavy panel. Progress follows explicit navigation and is never timed.

Prepared local narration reads the exact visible script after the current moment settles. Remove
the separate Ghaf Guide panel and use one high-contrast speaker icon over the photograph to restart
the clip. Quiet nature ambience may support the foreground onboarding atmosphere, but must duck
beneath speech, stop on exit, and remain off for active screen-reader use. Keep navigation
independent of audio. Do not add a waveform, human avatar, robot, listening pulse, microphone,
background OS playback, or model-processing theater.

## 2026-09-06 first-run experience clarification

The first-run story should feel like opening a vivid family field journal: begin by introducing
Ghaf itself, then show choice, help, and growth through one confident raster mark, one generous
natural photograph, short child-clear copy, and one unmistakable next action at a time.
Enthusiasm comes from warm light, pace, capability, and the promise of visible permanent growth—not
confetti, neon, mascots, streak pressure, or game currency. Use three skippable moments for action,
support, and symbolic growth after the Ghaf introduction; preserve the existing role-separated
Welcome actions afterward.

Startup, every access/setup route, and major role/context handoffs use the same quiet leaf-shadow
photographic field and raster mark as one coherent brand world. The startup hold is 1,200 ms and a
major-section buffer is 900 ms; do not interrupt bottom tabs or nested navigation. Standard motion
is a restrained opacity/vertical-settle sequence; reduced motion is a short static fade. No newly
authored vector image appears in onboarding, splash, or transition presentation.

## 2026-09-06 natural-artwork clarification

The product-owner-requested artwork refresh replaces vector-like scenic and decorative drawings
with **Quiet UAE Botanical Editorial** imagery: calm local nature photography, tactile botanical
detail, soft warm light, natural asymmetry, restrained Ghaf colors, and crop-safe nondirectional
composition. Keep all explanatory copy, values, state, progress, and controls as live interface
elements. Do not generate people, faces, hands, text, logos, brands, fantasy glow, generic UAE
ornament, hazards, or visual impact claims.

This is not a logo change. Preserve the official Ghaf mark and wordmark, app/platform icons, and
small semantic navigation/status/safety/control vectors. Replace scenic Garden, canopy, task,
learning, reveal, Shared Growth, access texture, and botanical profile-choice art; remove the
decorative League watermark. Every shipping raster is local, offline, provenance-recorded, and
never mirrored for RTL.

## 2026-09-05 screen-completion clarification

Missing P0 screens are now approved for professional code-native design in this established Living
Family Garden world. Use the existing warm botanical field, deep forest structure, Ghaf emerald,
mangrove teal, restrained date gold, Alexandria/Readex hierarchy, logical RTL/LTR flow, and calm
Parent/capable-Child modes. The absence of an approved reference frame is not a reason to leave a route
missing and is not permission to import raw web exports or create a new visual style.

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

The Child mode may use more natural botanical imagery and motion; the Parent mode may use more
structured records. Both share the same palette, typography, tree grammar, and Arabic-first
composition.

## UAE Living Landscape

Represent five connected landscape tracks:

| Track                 | Visual cue                                                  | Task world                                   |
| --------------------- | ----------------------------------------------------------- | -------------------------------------------- |
| Ghaf desert grove     | broad canopy, roots, family gathering shade                 | kinship and family heritage                  |
| Samar desert grove    | resilient branching and shared work markers                 | home responsibility and kindness             |
| Sidr reflection grove | calm leaves, small reading/reflection place                 | learning, wellbeing, private faith/gratitude |
| Date-palm oasis       | vertical palms, water channel, dates/table details          | food care and hospitality                    |
| Mangrove coast        | roots, shallow water, birds/fish silhouettes used sparingly | waste, water, energy, reuse, stewardship     |

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

The implemented botanical palette retains the field-paper and local landscape identity:

- limestone and warm paper as the ground;
- forest as structural emphasis and the primary action;
- sage and water tones for supporting surfaces;
- restrained amber for progress and occasional focal detail;
- existing semantic ink, green, and error colors where the shared components retain them;
- natural local Ghaf/UAE imagery for landscape character.

Use the implemented 16dp control, 20dp surface, and 28dp hero radii, with smaller icon plates and
pills reserved for their existing roles. Parent sections use open composition and divided rows;
Child screens give landscape and task context more presence. Tonal layering supplies most depth,
with the shared surface shadow available for elevated cards and established scrims for overlays.

Large botanical and habitat artwork should use the approved local Quiet UAE Botanical Editorial
raster library. Code-native vectors remain only for small functional controls, semantic progress,
and the official mark. Avoid stock desert silhouettes, generic camel/falcon ornament, copied
heritage motifs, emoji, glassmorphism, neon game colors, decorative AI avatars, flat vector scenes,
plastic 3D rendering, and text baked into imagery.

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
- Show one short, clear Parent disclosure on Parent Home that AI may be wrong, does not diagnose or
  infer motives, and leaves every decision with the Parent. Do not repeat that generic warning in
  Parent setup, Task Builder, or check-in; keep prepared/live origin labels at the relevant action.
- Keep the Child's age-appropriate disclosure and visible adult exit at each Child AI result.
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

- route change: the existing short fade, disabled under reduced motion;
- task selection: immediate selected state and shared 120ms press feedback where applied;
- assistant: one contained leaf/ink reveal, no fake “thinking” theater longer than needed;
- Seed award: short arc to the mapped landscape;
- growth: restrained root/branch/leaf reveal with a meaningful static final frame;
- cooperative milestone: a brief canopy/water/ambient response, then stillness;
- reset: fast and noncelebratory.

Honor reduced motion with an immediate final state and clear text. State changes must never depend
on animation completion.

The 2026-09-11 migration adds no continuous scenic animation, tab slide, or additional growth
trigger. Existing onboarding, sheet, and recognition sequences retain their own timing; the
botanical 180ms state and 260ms sheet tokens are not a claim that all sequences now use them.

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

# Tamagui Botanical Redesign — 2026-09-11

The user's accepted contemporary botanical direction now owns the broad UI redesign: warm
limestone, deep forest and sage, restrained amber, approved Alexandria/Readex fonts and existing
UAE landscape assets. Tamagui provides one themed foundation; Reanimated provides purposeful
press feedback and the preserved event-owned growth reveal. See the active section in DESIGN.md
and the Tamagui botanical direction record in Feature 003. Older directions below remain
historical reference; no product, privacy or feature-flag boundary is superseded.
