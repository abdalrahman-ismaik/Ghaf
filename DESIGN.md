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
    arabicLineHeight: '58px'
    arabicLetterSpacing: '0px'
  title:
    fontFamily: 'System, sans-serif'
    fontSize: '30px'
    fontWeight: 700
    lineHeight: '39px'
    letterSpacing: '-0.4px'
    arabicLineHeight: '43px'
    arabicLetterSpacing: '0px'
  heading:
    fontFamily: 'System, sans-serif'
    fontSize: '21px'
    fontWeight: 700
    lineHeight: '30px'
    arabicLineHeight: '34px'
    arabicLetterSpacing: '0px'
  body:
    fontFamily: 'System, sans-serif'
    fontSize: '16px'
    fontWeight: 400
    lineHeight: '26px'
    arabicLineHeight: '28px'
    arabicLetterSpacing: '0px'
  label:
    fontFamily: 'System, sans-serif'
    fontSize: '14px'
    fontWeight: 600
    lineHeight: '21px'
    arabicLineHeight: '23px'
    arabicLetterSpacing: '0px'
  caption:
    fontFamily: 'System, sans-serif'
    fontSize: '12px'
    fontWeight: 500
    lineHeight: '19px'
    arabicLineHeight: '20px'
    arabicLetterSpacing: '0px'
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

## R003 returning-family welcome extension

Returning users enter value immediately: an established Parent never sees Family Basics or Add
First Child again, and an already paired Child never crosses Parent setup. Parent Home and Child
Today may present one role-bound welcome dialog after successful return. It is a focused modal over
the fully rendered dashboard, not another onboarding sequence or full-screen destination.

The dialog uses the current Soft Geometric system: ivory scrim context, one bright surface,
Alexandria heading, Readex body/control copy, emerald and mangrove functional accents, restrained
continuous radii, and the existing small Ghaf icons. It contains a compact welcome block, an
explicit private-local summary label, no more than two divider-separated update rows, and one
dominant full-width continuation. Rows may invoke only existing authorized dashboard actions.
There is no gradient, glass, decorative illustration, nested-card stack, badge count, notification
bell, urgency color, streak pressure, or new navigation.

Arabic is first and uses logical start/end alignment; mixed numbers are locale-formatted and
tabular. The dialog scrolls within safe areas, remains usable at 320dp and 200% text, uses 48dp
targets, exposes modal semantics and a polite focus announcement, and treats Android Back as
dismissal. Standard motion is a native opacity fade; reduced motion presents the final state
without animation. Dismissal is permanent for that local sign-in, while a later qualifying return
creates a fresh summary from current authorized state.

## R003 first-run experience extension

The first-run surface is an optional four-moment editorial sequence inside `/`, followed by the
existing Parent/Child Welcome decision. The first moment answers “What is Ghaf?” before the next
three show choice, support, and private symbolic growth. Each moment uses the official raster logo,
one generous vivid photograph, a short child-clear title, one concrete supporting sentence,
visible `1/4` progress, and one dominant action. Skip remains visible; Back is quiet; changing
locale keeps the current step. Delight comes from warm light, bold crops, rich emerald/amber
accents, concise active copy, and a restrained vertical settle—not confetti, streak pressure,
mascots, fantasy effects, or competing cards.

The native Expo splash remains the earliest frame and uses the official raster icon. After its
handoff, the fully opaque app-owned splash uses the same mark and local leaf-shadow texture for
2,000 ms with no loader or transparent entrance. It then changes in place to the leaf-loading
state for at least 1,000 ms and until the four current font files and signed-out
onboarding/Welcome images settle. Only then is the overlay removed and onboarding exposed. The
logo and leaf-shadow background settle before native handoff. Garden, League, reveal, learning,
Shared Growth, canopy, Circle, and prepared-media
images remain outside the blocking gate. Once the loader exits and onboarding can paint, the 41
remaining local rasters warm without visible UI in sequential batches of six parallel requests:
access/experience sources first, remaining artwork next, and prepared media last. Section demand
shares the same source promise cache, so it can reuse an in-flight request. A failed raster
advances only into its existing deterministic fallback and records one warning, so readiness never
becomes a dead end. A context
transition overlay is permitted only across Welcome, Parent access, Child access, Parent
experience, and Child experience groups. Paths within a stable Parent or Child group, including
bottom tabs and nested screens, do not trigger it. A major-section buffer stays legible for 900 ms;
it concurrently settles only the immediate destination asset set. Its fade still uses the existing
motion tokens. Neither presentation claims remote loading, identity verification, AI work, sync,
or persistence.

Loading motion has one authored job: make the short loading state calm and recognizable. The
official Ghaf mark/name sits above three small leaves whose container turns with linear
transform-only UI-thread motion. The preceding splash remains still. No resource sentence, count,
percentage, or remote-work claim is visible. Reduced motion keeps the same leaves static, and the
progress label remains accessibility-only.

All Parent and Child access/setup routes inherit one shared branded shell: a compact official
raster Ghaf mark beside the Ghaf name, calm leaf-shadow raster background, clear route title or
progress, and the existing semantic forms and actions. The brand header never displaces Back,
progress, keyboard access, safe areas, or 48 dp targets, and route files do not duplicate it.

All new scenic presentation is raster. Live text, buttons, progress dots, focus state, and loading
status remain semantic native UI; existing functional vectors elsewhere are unchanged. Standard
motion uses opacity plus at most 8 dp of vertical travel over the quick/standard token durations.
Reduced motion removes translation and scaling. At 320 and 390 widths the photograph may shorten,
but the primary action and step status remain visible or reachable by vertical scrolling. Exact
copy, asset, state, and evidence rules live in
`specs/003-family-growth-garden/design-intake/r003-first-run-experience.md`.

## R003 complete-screen extension

The 2026-09-05 user-authorized completion pass extends this same visual world to missing access,
Family, Reward, settings, permissions, devices, reauthentication, and Child-settings surfaces. The
2026-09-06 usability correction additionally authorizes a dedicated Parent sign-up surface. A
missing Stitch frame is no longer an implementation blocker for the local prototype. New screens
must reuse the Soft Geometric palette, typography, spacing, iconography, native shells, and
botanical grammar already present; they do not introduce a second dashboard or generic settings
theme. Exact routes, entries, exits, and privacy boundaries are defined in
`specs/003-family-growth-garden/design-intake/r003-complete-screen-journey.md`.

This extension changes neither business authority nor evidence truth. Screens read live selectors,
protected actions remain protected, role changes sign out, and physical Android and named human
review stay unpassed until directly observed.

**Authority:** Feature 003 Revision 3 design contract with frozen R001/R002a and default-off R002b candidates

**Verified implementation baseline:** `0501cf3` — `docs(r002): record validation and deferred scope`

> **R002A COMPATIBILITY SCOPE APPROVED — IMPLEMENTATION AUTHORIZED**
>
> **R002B PRODUCT CONTRACT APPROVED — FEATURE-FLAGGED IMPLEMENTATION AUTHORIZED — RELEASE ACTIVATION BLOCKED**

**Status:** R001 foundations/onboarding and R002a Parent/task/Child/Garden presentation are frozen
regression baselines except for the user-authorized Parent sign-in/sign-up usability flow recorded below.
R002b code-native Growth candidates may be implemented behind independent default-off flags.

The user-authorized 2026-09-06 natural-artwork refresh replaces the runtime's large scenic,
decorative, profile-choice, task, Garden, canopy, Circle, Learning, Reveal, and Shared Growth
drawings with a provenance-recorded local **Quiet UAE Botanical Editorial** raster library. This is
an asset-layer change only: official Ghaf brand files, small functional vectors, live copy,
semantic progress/selection, routes, state, privacy, rewards, reset, and default-off flags remain
unchanged. The decorative Private League watermark is removed. Generated imagery is
nondirectional, contains no people/text/logos/hazards/fantasy or environmental claims, and never
becomes the authority for a product state.
Release activation remains blocked until the applicable visual, bilingual, accessibility, native,
provenance, content, and human-review gates pass.

**Creative direction:** `DESIGN_DIRECTION.md`

**Product behavior:** `PRODUCT.md`

## Current Design Authority

- R001 PNGs are canonical composition references for `/` and the six historical Parent-onboarding
  steps except `/access/parent/sign-in`. For that route, the user-authorized 2026-09-06 usability
  layout centers screen-level orientation/supporting copy, retains logical-start mixed-identifier
  fields, and keeps the filled credential, neutral biometric, and full-width outlined Create Family
  hierarchy. Create Family now navigates without requesting verification.
- `/access/parent/sign-up` is an R003 code-native Soft Geometric candidate because no approved
  Stitch frame exists. It uses the organic access shell, a tonal 64dp family icon plate, centered
  Alexandria heading and Readex orientation, one mixed phone/email field, one filled full-width
  continuation, a concise returning-family prompt, and one full-width emerald outlined sign-in
  action. It reuses the existing deterministic verification authority and never implies a real
  account or second household.
  Exported HTML/CSS/JS remains read-only measurement/structure evidence and never runtime code.
- Selected R002a PNGs are candidate composition references for the existing Parent Home, Parent
  Tasks/Builder, Child Today/task, Parent review/support, Child follow-up, and Garden surfaces. The
  tracked R002a index and per-surface specifications record the exact selection and required
  corrections; filenames such as `final` or `corrected` do not establish authority by themselves.
- Implement R002a in this order: Parent Home, Parent Tasks/Builder, Child Today/task execution,
  Parent review, Child support/resubmission, then the compatible existing Garden. R001 remains
  unchanged while `/parent` becomes the first visible Soft Geometric result after onboarding.
- Alexandria owns display/headline roles. Readex Pro owns body, control, task, dialogue, and data
  roles. R002b extends the same released palette, Soft Geometric radii, local assets, generous
  Arabic leading, zero artificial Arabic tracking, tabular numerals, and deterministic fallback;
  it does not create a parallel visual system.
- R001 uses responsive safe-area layouts and natural scrolling. A 390×844 frame is a comparison
  viewport, not a fixed canvas. Only explicitly specified header/action/sheet regions may remain
  fixed while central content scrolls and avoids the keyboard.
- All interactive controls retain at least 48dp targets and visible focus, pressed, disabled, busy,
  validation-error, offline, and success meaning. The success moment is one native modal sheet with
  focus restoration and reduced-motion parity.
- Parent/Child role authority comes from the access/session boundary, never visual tab state. R002a
  may restyle an existing route but may not weaken its guards, actions, privacy, reset, voice, or
  profile isolation.
- The remote behavior at `76fa682` remains authoritative. R002a displays live selector values and
  never copies screenshot counters, renames `task_recycling_p0_v1`, rebuilds task transitions in a
  view, or drops an existing approval consequence for visual similarity.
- Raw R002 HTML/CSS/JS, remote imagery, rasterized interface text, and `Zone.Identifier` files stay
  outside runtime and commits. Unknown-provenance illustrations are replaced with approved local or
  code-native equivalents.

The private five-Leaf League and separate Family Reward remain preserved behavior. Their candidate
Parent Home counters are not renderable until a live authorized dashboard selector exists; R002a
must omit those unsupported numbers rather than fabricate them or relabel `/circle`. The
108→120→180 projection, Impact Path, badges, learning, Parent Progress, revised RevealBundle,
additive Shared Growth, shared-garden controls, and cumulative Garden chapter are authorized only as
default-off R002b candidates. Their product behavior comes from the current specification, not a
screenshot, and their release remains blocked.

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

## Preserved R001/R002a Screen Contract

The historical R001/R002a baseline below has ten authored routes. Loading, fallback, retry,
assistant, confirmation, and celebration are states within them. The active R003 completion route
and state manifest is maintained in
`specs/003-family-growth-garden/design-intake/r003-complete-screen-journey.md`; `/role` is now a
compatibility redirect only.

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
- `ParentVoicePermissionPanel`: a separate Parent action for stored synthetic voice and AI grants;
  it never rides on assignment approval or the shared-device role selector.
- `SyntheticVoicePanel`: task-bound prepared rehearsal with explicit active, transcript-review,
  sent, delete, caption, simulated-rate, replay, and reset states; no microphone or audio capture.
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
- The presentation consumes the registered age-adaptation result rather than slicing or rewriting
  Coach content in a route. Salem's prepared 9–11 result contains no more than three complete steps
  and three reviewed quick choices with a persistent adult exit.
- The synthetic push-to-talk presentation begins only after a distinct Parent grant. “Active” is a
  visible state simulation, stop loads a canonical prepared transcript, replay is simulated, and
  send ends the rehearsal without live model processing or evidence attachment.
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

### Bilingual typography roles

- `src/design/tokens.ts` is the only type-token authority. The six roles are `display`, `title`,
  `heading`, `body`, `label`, and `caption`; screens do not invent sizes or families.
- Arabic and English use the established platform system family so text appears immediately without
  a font asset or loading reflow. Locale-specific role records own leading and tracking.
- English keeps the approved 51/39 px display/title leading and −0.8/−0.4 px tracking. Arabic uses
  58/43 px leading for those roles and zero tracking throughout so shaping is not pulled apart.
- Arabic heading/body/label/caption leading is 34/28/23/20 px. The 16 px Arabic body ratio is 1.75,
  above the 1.55 minimum and leaves room for diacritics and Android font padding.
- Explicit `language` on `Text` selects that script's metrics even when the surrounding interface
  uses the other locale. `Input` resolves the same body role from the active locale.
- Font scaling remains enabled. Text-bearing counters use minimum dimensions and padding instead of
  fixed boxes, and required Child actions, transcripts, disclosures, and safety text are unclamped.

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
