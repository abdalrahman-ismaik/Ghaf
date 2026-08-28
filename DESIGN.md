---
name: 'Ghaf — غاف'
description: 'An Arabic-first family growth garden where confirmed real-world action becomes visible UAE landscape growth.'
colors:
  ghaf: '#1D684F'
  ghaf-pressed: '#14513E'
  forest: '#12372D'
  forest-soft: '#35594D'
  leaf: '#718E6A'
  leaf-light: '#DCE5D7'
  leaf-mist: '#EDF1E8'
  mangrove: '#28736C'
  water: '#77A8A1'
  water-light: '#D9E9E5'
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
  coral: '#A94A3F'
  coral-light: '#F1DEDA'
  transparent: 'transparent'
typography:
  display:
    fontFamily: 'System, sans-serif'
    fontSize: '42px'
    fontWeight: 800
    lineHeight: '51px'
    letterSpacing: '-0.8px'
  title:
    fontFamily: 'System, sans-serif'
    fontSize: '30px'
    fontWeight: 700
    lineHeight: '39px'
    letterSpacing: '-0.4px'
  headline:
    fontFamily: 'System, sans-serif'
    fontSize: '21px'
    fontWeight: 700
    lineHeight: '30px'
  body:
    fontFamily: 'System, sans-serif'
    fontSize: '16px'
    fontWeight: 400
    lineHeight: '26px'
  label:
    fontFamily: 'System, sans-serif'
    fontSize: '14px'
    fontWeight: 600
    lineHeight: '21px'
  caption:
    fontFamily: 'System, sans-serif'
    fontSize: '12px'
    fontWeight: 500
    lineHeight: '19px'
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
motion:
  quick: '120ms'
  standard: '220ms'
  growth: '650ms'
  easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
components:
  button-primary:
    backgroundColor: '{colors.ghaf}'
    textColor: '{colors.white}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    padding: '12px 20px'
    minHeight: '48px'
  button-secondary:
    backgroundColor: '{colors.leaf-light}'
    textColor: '{colors.forest}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    padding: '12px 20px'
    minHeight: '48px'
  button-quiet:
    backgroundColor: '{colors.transparent}'
    textColor: '{colors.ghaf}'
    typography: '{typography.label}'
    rounded: '{rounded.sm}'
    padding: '10px 12px'
    minHeight: '48px'
---

# Ghaf Design System

**Authority:** Feature 003 executable design contract

**Status:** Implemented for deterministic P0; automated and bilingual web-proxy validation passed;
physical Android and named human reviews remain open

**Creative direction:** `DESIGN_DIRECTION.md`

**Product behavior:** `PRODUCT.md`

## Design Promise

Ghaf should make one relationship unmistakable: a Child completes a useful real-world action, a
Parent recognizes it, and the family's UAE living landscape grows. The interface should be warm,
rooted, brief, and calm. It must not resemble a bank, a public behavior chart, a generic analytics
dashboard, or an engagement-maximizing mobile game.

The flagship Ghaf is the household canopy. The other tracks—Samar, Sidr, date-palm oasis, and
mangrove coast—give task categories a memorable home. They are interconnected design metaphors,
not a claim that every species occupies one literal habitat or that digital growth plants real
trees.

## Experience Invariants

1. One dominant action appears at every decision point.
2. No reward or garden growth appears before Parent confirmation.
3. For reward-eligible tasks, Seeds are fixed, symbolic, nonfinancial, and permanent once earned.
4. Help, retry, substitution, and a smaller step remain dignified success paths.
5. The Child's own progress is private; shared surfaces are cooperative and coarse.
6. Faith, kinship, affection, food consumption, wellbeing, hygiene, disability-related routines,
   media, reflections, and Parent observations never appear in a cross-family view.
7. AI is embedded as a bounded tool and is visibly labeled prepared/simulated or live.
8. Arabic and RTL are authored states, not a mirrored afterthought.
9. Prepared media and synthetic identities are visibly disclosed.
10. Motion explains cause and effect, honors reduced motion, and then stops.

## Two Modes, One System

### Parent mode — calm stewardship

Parent screens prioritize definition of done, safety, privacy, choice, and recognition. Use compact
rows, stable type, restrained illustration, and neutral status language. Lead summaries with
strengths and observable facts. Never show a normality score, clinical color scale, surveillance
timeline, or alarmist inference.

### Child mode — capable explorer

Child screens show one task, a few short steps, large controls, a visible meaning statement, and a
garden horizon. They may use more illustration and gentle movement but never baby talk, commands,
coin-shop metaphors, streak flames, public ranks, or infinite assistant conversation.

Both modes use the same palette, typography, growth grammar, logical spacing, and content model.

## Layout Grammar

- Use a safe-area `Screen` shell with 20px phone padding and a readable content maximum on web.
- Compose with logical `start`/`end`, never hard-coded left/right for semantic alignment.
- Use 8px as the base rhythm; major sections normally separate by 24–32px.
- Keep the dominant action reachable and at least 48×48dp.
- Prefer tonal grouping, separators, landscape planes, and whitespace over repeated elevated cards.
- Use one top-level title, one short orientation sentence, and one primary action per screen.
- A bottom action area may be sticky only when it does not cover content or the keyboard.
- Parent review may use a two-column web layout, but the Android contract is one vertical stream.
- No horizontal carousel may hide a required step or safety note.

## Screen Contract

Feature 003 has exactly ten authored routes. Loading, fallback, retry, assistant, confirmation, and
celebration are states within them.

### `/` — entry and disclosure

- Show the Ghaf wordmark, one UAE landscape vignette, and Arabic/English controls.
- State that profiles/media are synthetic. Render assistant status from the active provider:
  “prepared/prewritten” for fixtures and “live” only for a verified secure call.
- Primary action: enter the demo. Secondary action: switch language.
- Do not begin with accounts, statistics, or a rewards balance.

### `/role` — role and Child selection

- Show Parent and Child as demo modes, not authentication.
- Display Salem, age 9, and Alya, age 11, as clearly synthetic profiles.
- Parent selection may continue to `/parent`; Child selection continues to `/child`.
- Warn that private Parent content is safe only because the prototype data is synthetic.

### `/parent` — family overview

- Top: family canopy and the next cooperative milestone, without rank.
- Middle: each Child's next task and requested support; show one combined canopy without raw
  side-by-side Seed totals, pace, or age-unequal contribution trails.
- Bottom: one bounded Ghaf Guide summary beginning with strengths and a time window.
- Primary action: create a task. Secondary actions: open garden or circle.
- Never show private notes in a sibling-comparison visualization.

### `/parent/task/new` — task drafting

- Select Child, category, and a curated template before allowing custom copy.
- Show recognition mode and any exact Seed award before approval; recognition-only/maintenance says
  “Parent recognition, no Seeds.” P0 uses standard acquisition with 12 Seeds.
- Ghaf Guide actions are explicit intents: make clearer, make smaller, check safety, adapt age.
- Preserve Parent authorship: show the original and proposed version with Accept and Keep mine.
- For reward-eligible templates, show acquisition/maintenance. Recognition-only fixes phase to
  `not_applicable`.
- Custom free text never bypasses safety, privacy, and category rules.

### `/parent/task/review` — approval

- Present Arabic and English, observable definition of done, why it matters, estimated effort,
  supervision, exclusions, optional evidence, privacy, recognition mode, any Seeds, phase,
  visibility/circle eligibility, and landscape mapping.
- Safety-critical text sits above the approval action and cannot be collapsed.
- Primary action: approve and assign. Secondary action: edit.
- Explain that Parent confirmation is required before any eligible credit or growth.

### `/child` — task choices

- Greet the selected synthetic Child and show two to three Parent-approved choices at most.
- Each `TaskChoice` shows title, short purpose, effort, help status, recognition mode, any fixed
  acquisition award, and landscape.
- Show personal progress against the Child's own goal plus the shared canopy—not sibling rank.
- Primary action: choose a task. Allow “Ask to make it smaller.”

### `/child/task` — act with bounded support

- Show one definition of done followed by no more than four short steps.
- Offer intent buttons: Show steps, Help me plan, Practise a phrase, I need an adult.
- Prepared photo and push-to-talk fixtures are optional task actions with visible origin labels.
- Before submission, state exactly what the Parent can see.
- Primary action: submit for Parent check. A short reflection is optional and never circle-shared.
- Assistant output never hides or changes the Parent-approved completion criterion.

### `/parent/check-in` — recognize or adjust

- Show the Child's completion mode, optional fixture, and reflection separately.
- Parent options: Confirm, Kind retry, Make smaller, Equivalent task. No reject/shame state.
- Confirmation drafts specific praise that the Parent may edit before sending.
- The Guide summary separates facts, uncertainty, a question to ask, and one possible adjustment.
- Confirmation is idempotent; duplicate input must not issue duplicate Seeds or growth.
- On the third confirmation of a recurrent fade-first acquisition task, show an in-route
  `RoutinePhaseReview` after recognition: **Keep acquisition** or **Move future completions to
  maintenance**. Neither is preselected; the current completion is unchanged. A Parent may reverse
  the future phase from the task detail sheet on `/parent`.

### `/garden` — consequence and meaning

- Animate the 12 Seeds toward the Mangrove track, then show the new static growth stage.
- Add one visible leaf to the household Ghaf canopy.
- Name the real action and its meaning without inventing liters, kilograms, carbon, or real planting.
- Show all five tracks as a connected UAE landscape, with the mapped track visually strongest.
- Primary action: see family circle. Reduced motion jumps directly to the final frame and text.

### `/circle` — cooperative overview

- Show household contribution and seeded family-level cousin aggregates toward one Green Impact goal.
- Use garden silhouettes or progress bands, never a podium, first/last rank, or Child profile grid.
- State that circle data is synthetic/local and sharing is not implemented.
- Exclude prayer, kinship, affection, food consumption, hygiene, wellbeing, disability-related
  routines, exact task history, photos, voice, reflections, assistant content, and Parent notes.
- Primary action: finish or reset the demo.

## Component Contract

### Foundations

- `Screen`: safe area, background, logical padding, scroll/keyboard behavior.
- `JourneyHeader`: back action, bilingual title, short step context; no gamified progress pressure.
- `PrimaryButton`, `SecondaryButton`, `QuietButton`: explicit disabled, pressed, busy, and focus states.
- `LanguageSwitch`: Arabic/English with clear selected state; it is not a flag selector.
- `OriginDisclosure`: prepared, simulated, synthetic, estimated, or live label beside the relevant
  object, not hidden in a general footer.

### Task and recognition

- `TaskChoice`: title, meaning, effort, recognition mode, any fixed Seeds, help/supervision,
  landscape cue.
- `TaskSteps`: ordered, concise, screen-reader announced; completion remains optional until real.
- `SafetyBoundary`: coral accent, icon plus text, adult-action verb; never relies on red alone.
- `DefinitionOfDone`: one observable behavior, distinct from evidence.
- `PraiseEditor`: suggested action-specific line plus editable Parent voice.
- `RetryPanel`: smaller step, help, equivalent, or later; no failure badge.
- `RoutinePhaseReview`: Parent-only, future-facing phase choice with no automatic selection or loss
  of prior progress.

### Garden and family

- `SeedAward`: acquisition-only deterministic quantity and destination; absent for maintenance and
  recognition-only; never animates before confirmation.
- `LandscapeTrack`: species/landscape name, product category, stage, progress, origin note.
- `FamilyCanopy`: one flagship Ghaf with contribution leaves; it is not a leaderboard.
- `HouseholdContribution`: combined household-visible acquisition growth feeding one canopy;
  individual raw totals stay out of the sibling surface.
- `CircleProgress`: family-level aggregate toward a common target, with privacy disclosure.

### Assistant

- `AssistantTrigger`: action label such as “Make this clearer,” not an empty sparkle icon.
- `AssistantSheet`: bounded intent, disclosure, concise response, Accept/Dismiss, and human-help exit.
- `PreparedMedia`: thumbnail or audio control, synthetic origin, visibility statement, remove action.
- `ParentPatternSummary`: time window, strengths, observed facts, uncertainty, question, adjustment,
  and non-diagnostic disclosure.

## Reward and Growth States

Reward-eligible tasks use 4, 6, 8, 12, or 15 Seeds. Recognition-only tasks show no numeric award.
The P0 journey awards exactly 12.

| State                 | Visual treatment                           | Required copy behavior                                                 |
| --------------------- | ------------------------------------------ | ---------------------------------------------------------------------- |
| Acquisition available | Seed outline and visible fixed amount      | “{displayedSeedAmount} Seeds after Parent confirmation”                |
| Submitted             | Quiet pending leaf, no growth              | “Waiting for a Parent check”                                           |
| Kind retry            | Path marker and unchanged garden           | State the next achievable step; never say failed                       |
| Acquisition confirmed | Praise first, then short Seed arc          | Name the observed action                                               |
| New stage             | One biological detail plus stage label     | Explain symbolic growth, not measured impact                           |
| Maintenance           | No Seed arc or persistent growth           | “Parent recognition, no Seeds”; keep choice and meaning                |
| Recognition-only      | No transaction or persistent visual change | Acknowledge meaning without paying for affection, faith, or disclosure |

Growth stages are **Seed → Shoot → Sapling → Shade → Flourishing**. Each stage needs a visually distinct
static SVG state; state recognition cannot depend on hue or animation. Earned vegetation never
withers, reverses, or becomes sad.

## Assistant State Contract

Each assistant interaction has `idle`, `prepared-loading`, `result`, `fallback`, and `dismissed`
states. The Parent Guide alone may add `live-loading`, `live-result`, and `live-error` through the
optional secure competition adapter. The Child Coach remains prepared in P0, and the deterministic
fixture remains the offline acceptance path.

- Loading lasts only long enough to communicate processing and is not fake companion theater.
- Result states say “AI can be wrong” and point to the Parent or another trusted adult when needed.
- Child output is limited to the current Parent-approved task and curated intents.
- Ages 6–8 use curated intents without free text; ages 9–11 use structured intents/template input;
  ages 12–14 may use guardian-enabled bounded text or push-to-talk. No band gets unrestricted chat.
- The Coach never issues religious rulings, food-safety judgments, medical advice, or instructions
  involving hot liquids, electricity, sharps, chemicals, unknown waste, or unsupervised routes.
- The Guide never diagnoses, labels normality, infers emotion/personality/religiosity, or scores a
  Child or Parent.
- High-risk disclosures leave ordinary coaching and use a separately reviewed safeguarding handoff;
  P0 demonstrates this only as a scripted synthetic state.

## UAE Content Presentation

- Use Modern Standard Arabic and plain English as the P0 content pair.
- Present cultural phrases as several Parent-approved options, never one universally correct line.
- Majlis tasks emphasize greeting, listening, host cues, and permission before recording.
- Wedding tasks follow Parent/event cues; no required photographs or performance.
- Children may set out dates, water, or napkins; they do not handle hot gahwa in P0.
- Waste tasks show clean, identifiable recyclables or a sealed lightweight bag only. Exclude glass,
  sharps, batteries, chemicals, medicine, spoiled food, and unknown items.
- Faith content is Parent-enabled, calm, private, and nonpunitive. AI never judges validity or
  sincerity.
- Species meanings beyond documented ecology are labeled as Ghaf product metaphors.

Curated task copy comes from `RESEARCH_BASIS.md`; it may not be improvised into code without the
required cultural, safety, Arabic, and safeguarding review.

## Arabic, RTL, and Localization

- Arabic is the default demo locale and first content field in bilingual Parent review.
- Use `I18nManager`/locale state and logical flex/alignment helpers consistently.
- Mirror back/forward arrows and ordered journey movement; do not mirror trees, checkmarks, Arabic
  calligraphy, the dallah, or nondirectional symbols.
- Give Arabic body copy at least 1.55× line height and test diacritics without clipping.
- Treat Arabic phrases and Latin units as isolated directional runs where necessary.
- Never concatenate translated fragments to build a sentence or plural.
- Test long Arabic titles, mixed Arabic/English names, 4/6/8/12/15 counts, and screen-reader order.
- Locale switching must preserve the current safe app state and update navigation direction.

## Accessibility

- Minimum touch target: 48×48dp; minimum spacing between adjacent small targets: 8dp.
- Text contrast: target WCAG AA; do not encode state by color, shape, motion, or sound alone.
- Support font scaling through at least 200% without truncating actions or safety notes.
- Provide labels, roles, state, and hints for controls; group Seed amount with its meaning.
- Announce submission, Parent confirmation, reward, growth stage, and circle milestone once.
- Reading order follows the locale and remains logical when bottom sheets open.
- Prepared audio always has visible text; prepared images have concise alt text and origin labels.
- Reduced motion renders the same final state immediately with a textual cause-and-effect summary.
- Let Parents turn off audio, remove evidence, shorten tasks, allow help, and select accessible
  alternatives without decreasing the Child's dignity.

## Motion and Sound

| Event            | Standard motion                     | Reduced motion                           |
| ---------------- | ----------------------------------- | ---------------------------------------- |
| Route            | 120–220ms logical fade/slide        | Cut or short fade                        |
| Assistant result | Contained leaf/ink reveal           | Immediate result                         |
| Confirmation     | Praise settles before reward        | Static praise then state update          |
| Seed award       | One 650ms arc to mapped track       | Text “{displayedSeedAmount} Seeds added” |
| Growth           | Root/leaf/water detail reveals once | Final stage plus announcement            |
| Circle milestone | Brief canopy/water response         | Static milestone banner                  |

Sound is optional, quiet, and never required for comprehension. No casino, cash-register, streak,
alarm, or failure sounds. Do not block state updates on an animation or sound callback.

## Media and Provenance

P0 uses prepared synthetic fixtures only. A fixture must contain no Child, face, hand, personal
data, brand, address, school, readable private text, or watermark. The recycling image shows clean,
intact, non-sharp, clean paper/plastic items accepted by the local stream on a neutral surface.
Remove metadata and record source, prompt or
creation method, transformation, license/ownership, reviewer, and date.

Photo and voice controls must explain:

- that the item is prepared/synthetic in P0;
- what a Parent will see;
- that evidence is optional;
- how to remove it; and
- that live capture, upload, retention, and analysis are not implemented.

## Error, Offline, and Reset

- The deterministic flow works without network access.
- An assistant timeout falls back to the reviewed fixture on the same route and retains Parent text.
- A missing prepared image uses descriptive placeholder copy and never blocks task completion.
- A duplicate confirmation is a no-op with a neutral “Already confirmed” message.
- A reload may reset in-memory P0 data; the app must disclose this rather than imply persistence.
- Reset is one Parent-only demo action, requires a small confirmation, and restores the exact seeded
  state documented in `DEMO_RUNBOOK.md`.

## Implementation Notes

- Adapt the existing Expo, React Native, strict TypeScript, Expo Router, Zustand, StyleSheet, SVG,
  Reanimated, audio, service-registry, and deterministic-fixture foundation after verifying it in
  the repository.
- Keep design tokens centralized and synchronize runtime values with this frontmatter.
- Store content as typed bilingual data; do not scatter Arabic/English literals through screens.
- Model task, `routinePhase` including `not_applicable`, recognition mode, `visibilityScope`,
  `circleEligible`, submission, confirmation, reward, garden, circle projection, assistant, and
  reset as explicit states.
- Separate symbolic Seed/garden progress from any measured environmental metric at the type level.
- Keep a provider interface for prepared AI and an optional server-side live adapter. Never place
  an API secret in the mobile bundle.
- Create Feature 003 through Spec Kit before implementation; do not silently widen Feature 002 or
  manually edit the Spec Kit-managed block in `AGENTS.md`.

## Review Checklist

- One next action is obvious and all required safety text is visible.
- The Child can ask for help, a smaller step, or an equivalent without shame.
- Any acquisition Seed amount is fixed and visible; recognition-only/maintenance visibly says no
  Seeds; no earned progress can be lost.
- Completing an accepted task with permitted help earns its displayed award; only a smaller task
  agreed before acceptance may display a smaller award.
- Recognition describes action, strategy, improvement, or help-seeking—not character.
- Shared views are cooperative; privacy filtering happens before any shared visual or counter update.
- AI is bounded, non-diagnostic, non-companion, and honestly labeled.
- Symbolic garden growth is separate from measured sustainability claims.
- Arabic and English preserve meaning, layout, screen-reader order, and route completion.
- UAE content is functional, sourced, and flagged where local human review remains required.
- Prepared, simulated, synthetic, estimated, live, and future capabilities are labeled at point of
  use.
- Static, reduced-motion, offline, retry, duplicate, and reset states remain complete.

Detailed pass/fail evidence belongs only in `DEMO_RUNBOOK.md`. Feature 002 evidence cannot be used
to claim that this Feature 003 contract has passed.
