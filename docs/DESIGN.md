---
name: 'Ghaf — غاف'
description: 'An Arabic-first botanical family app connecting approved action with permanent symbolic UAE landscape growth.'
colors:
  canvas: '#F6F3EB'
  paper: '#FFFCF5'
  forest: '#183F35'
  forest-raised: '#245347'
  ink: '#203D34'
  muted: '#5D6B5E'
  line: '#DCDDCF'
  sage: '#E7ECDD'
  sage-strong: '#CAD9BB'
  amber: '#D9AD5B'
  amber-wash: '#F2E6CC'
  water: '#E1ECE8'
  on-forest: '#FFF9E9'
  text-primary: '#14221D'
  text-secondary: '#3F4944'
  text-heading: '#0D3128'
  text-neutral: '#1A1C19'
  action-text: '#126A50'
  on-action: '#FFFFFF'
  neutral-control: '#F3F4EF'
  error: '#BA1A1A'
  error-surface: '#FFDAD6'
  transparent: 'transparent'
typography:
  display:
    fontFamily: 'Alexandria_800ExtraBold'
    fontSize: '48px'
    fontWeight: 800
    lineHeight: '60px'
    letterSpacing: '0px'
  hero:
    fontFamily: 'Alexandria_700Bold'
    fontSize: '32px'
    fontWeight: 700
    lineHeight: '44px'
    letterSpacing: '0px'
  parent-hero:
    fontFamily: 'Alexandria_700Bold'
    fontSize: '30px'
    fontWeight: 700
    lineHeight: '44px'
    letterSpacing: '0px'
  screen-title:
    fontFamily: 'Alexandria_700Bold'
    fontSize: '24px'
    fontWeight: 700
    lineHeight: '36px'
    letterSpacing: '0px'
  body-large:
    fontFamily: 'ReadexPro_400Regular'
    fontSize: '18px'
    fontWeight: 400
    lineHeight: '31px'
    letterSpacing: '0px'
  body:
    fontFamily: 'ReadexPro_400Regular'
    fontSize: '16px'
    fontWeight: 400
    lineHeight: '26px'
    letterSpacing: '0px'
  control:
    fontFamily: 'ReadexPro_500Medium'
    fontSize: '16px'
    fontWeight: 500
    lineHeight: '26px'
    letterSpacing: '0px'
  label:
    fontFamily: 'ReadexPro_500Medium'
    fontSize: '14px'
    fontWeight: 500
    lineHeight: '24px'
    letterSpacing: '0px'
  caption:
    fontFamily: 'ReadexPro_400Regular'
    fontSize: '12px'
    fontWeight: 400
    lineHeight: '20px'
    letterSpacing: '0px'
rounded:
  small: '10px'
  control: '16px'
  surface: '20px'
  hero: '28px'
  pill: '999px'
spacing:
  xxs: '4px'
  xs: '8px'
  sm: '12px'
  md: '16px'
  lg: '20px'
  xl: '24px'
  section: '28px'
  xxl: '32px'
  xxxl: '40px'
  huge: '56px'
components:
  button-primary:
    backgroundColor: '{colors.forest}'
    textColor: '{colors.on-action}'
    typography: '{typography.control}'
    rounded: '{rounded.control}'
    padding: '12px 20px'
  button-secondary:
    backgroundColor: '{colors.sage}'
    textColor: '{colors.action-text}'
    typography: '{typography.control}'
    rounded: '{rounded.control}'
    padding: '12px 20px'
  button-neutral:
    backgroundColor: '{colors.neutral-control}'
    textColor: '{colors.text-neutral}'
    typography: '{typography.control}'
    rounded: '{rounded.control}'
    padding: '12px 20px'
  button-quiet:
    backgroundColor: '{colors.transparent}'
    textColor: '{colors.action-text}'
    typography: '{typography.control}'
    rounded: '{rounded.control}'
    padding: '12px 20px'
  input:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.text-primary}'
    typography: '{typography.body}'
    rounded: '{rounded.control}'
    padding: '12px 16px'
  card-paper:
    backgroundColor: '{colors.paper}'
    rounded: '{rounded.surface}'
    padding: '20px'
  card-tonal:
    backgroundColor: '{colors.sage}'
    rounded: '{rounded.surface}'
    padding: '20px'
---

# Ghaf Design System

## Feature 017 study and family support — 2026-09-13

Four guarded routes add Study space and Family practices for Parent and Child.
Home, Today and Family expose contextual entries; bottom navigation is unchanged.
These are code-native candidates authorized by Feature 017, using existing botanical
surfaces, typography and controls. Study uses a selected-Child workspace, three views
(plans, agreements, understanding) and explicit review/choice controls. Arabic input
accepts Arabic digits and decimal marks; row ordering is reconciled with inherited RTL.
Practices expose optional supported alternatives, short steps and source limitations.
Browser evidence does not establish native keyboard, Back or human Arabic acceptance.

## Feature 006 adult pilot presentation — 2026-09-13

The separate adult account gate reuses the access shell, Alexandria/Readex Pro,
shared controls and Arabic-first resources. Registration, code verification,
password recovery and approval statuses appear before mounting the sample
navigator. An approved adult chooses to explore the canonical sample; no second
simulated email form is required. A persistent Pilot account control distinguishes
real logout from restarting or leaving a synthetic role. The pilot reuses the
current demo design and preserves all earlier release gates.

## Confirmed local recovery state — 2026-09-13

Reuse the existing access shell, brand lockup, Alexandria headings, Readex body and
controls, logical RTL layout, tokens and 48dp buttons. The signed-out Welcome error
state appears before onboarding. Corruption offers an explicit reset proposal and
a separate confirmation with clear local-data consequences, a safe Cancel/Back
action and recoverable error feedback. Unavailable storage offers retry only.
Both languages remain readable without raw saved data, technical exception text,
new imagery, new routes or a new visual system. Success returns to Arabic Welcome.

## 2026-09-13 selected brand identity

The user selected **5A Refined Classic** as the new Ghaf logo and authorized replacement of the
previous mark. The family beneath a spreading Ghaf canopy is now the current identity; see the
[5A master, derivatives and migration record](design/brand/5a-refined-classic/README.md).
This supersedes earlier logo-geometry preservation rules for brand assets only. Live Arabic/English
wordmarks, design tokens, screen layouts and product illustrations retain their existing roles.

## Overview

**Creative North Star: "The Living Family Garden — الحديقة العائلية الحية"**

The active presentation is the user-approved 2026-09-11 botanical redesign: warm limestone,
forest structure, quiet amber, and existing local UAE landscape artwork. Parent screens give
tasks and family oversight a composed rhythm; Child screens give the task and landscape more
visual presence. Shared typography, controls, spacing, and access boundaries connect both.

This document records the built system. `src/design/tokens.ts` is the single runtime authority.
Its additive `botanical` values define redesigned surfaces; `src/design/tamagui.ts` maps them
into Tamagui. Existing semantic text/status colors and the branded R001 typography resolver
remain in use. Frontmatter records Arabic-first branded metrics and shared component defaults.

The eight active sections supersede older presentation instructions for migrated surfaces.
Historical records below retain prior rationale, not current route inventories or release
authority. Product, privacy, access, and default-off gates remain in the active specifications.
Evidence belongs in the botanical evidence checklist and demo runbook, not this visual rulebook.

**Key Characteristics:**

- Local Ghaf and UAE artwork supplies identity.
- Open sections and divided rows clarify the next action.
- Forest, sage, and warm paper establish hierarchy with restrained elevation.
- Arabic-first Alexandria and Readex Pro text remains scalable and script-aware.
- Short press feedback and event-owned growth provide motion.

## Colors

Forest is the strongest structural tone. Sage and water group supporting content; limestone and
warm paper keep the page calm. Amber marks progress and occasional focal details. These values
map directly to `botanical.colors`.

Text still uses the established `r001Ink`, `onSurfaceVariant`, `deepForest`, and
`ghafEmerald` semantic colors, recorded above as text-primary, text-secondary, text-heading,
and action-text. Error and validation colors retain their existing meaning.

**The Meaning Before Color Rule.** Status, selection, award, and error need text and programmatic
semantics. Color supports that meaning. The dark canopy panel uses on-forest text and sage-strong
supporting copy rather than muted gray.

## Typography

Alexandria owns display and heading roles; Readex Pro owns body, controls, labels, and data.
The root loads local Alexandria 700/800 and Readex 400/500 faces.
`resolveR001TypographyRole` chooses the role's font face, script metrics, and platform fallback.
Loaded faces carry their own weight; an additional synthetic weight is not applied.
System fonts remain loading/failure fallbacks and the older unbranded compatibility path.

Frontmatter contains Arabic metrics. English uses the same size/face with these differences:

| Role         | English line height | English tracking |
| ------------ | ------------------- | ---------------- |
| Display      | 58                  | -0.6             |
| Hero         | 42                  | -0.3             |
| Parent hero  | 42                  | -0.2             |
| Screen title | 34                  | 0                |
| Body large   | 30                  | 0                |
| Body         | 26                  | 0                |
| Control      | 24                  | 0                |
| Label        | 22                  | 0                |
| Caption      | 18                  | 0                |

Sizes use React Native logical units. Arabic tracking is zero. Essential labels wrap rather than
shrink or truncate. Rankings, Seeds, and reward values opt into tabular numerals.
The additional compact-body and wordmark roles remain in the same token file.

`botanicalFonts` supplies Tamagui's Readex body and Alexandria heading defaults; it does not
replace Ghaf Text's locale-aware resolver. The preserved six-role `typography` object is a
compatibility record, not the font direction for new branded screens.

**The Script Owns Its Run Rule.** Bilingual runs receive their own language, direction, and
alignment. Web Text supplies actual `lang`, `dir`, heading, label, and live-region semantics;
native Text keeps accessibility language and writing direction. The outer physical shell is
not a substitute for mixed-script direction.

## Layout

R002a uses a safe-area shell, natural vertical scrolling, 20dp horizontal insets, a 520dp maximum
column, 24dp top padding, and 28dp section gaps. The shared generic Screen retains a 720dp
maximum; access layouts may use the established 600dp maximum. These are responsive bounds.

Keep related headings/copy close and separate the next section more generously. Use open
next-action sections and divided utility lists, reserving tonal panels for meaningful groups.
Required safety, help, and completion text remains in the reading flow.

Header and bottom-navigation regions remain outside the scrolling body where the existing shell
requires it. Preserve keyboard avoidance and safe-area padding. Actions have at least 48dp
targets; regular shared buttons and branded inputs use a 56dp minimum and grow with their labels.

The physical shell stays stable while rows use `logicalRowDirection` and text uses logical
alignment. Directional chevrons follow locale. Habitat images and nondirectional symbols do not
mirror.

## Elevation & Depth

Tonal layering and artwork supply most depth. Parent task sections and Family/settings rows
use spacing and thin separators instead of repeated shadows. Card is flat by default; its
elevated variant uses `botanical.shadow.surface`.

The shadow vocabulary is surface (`0 4px 18px rgba(24, 63, 53, 0.05)`) and floating
(`0 6px 24px rgba(24, 63, 53, 0.10)`). Existing modal sheets may retain their R001 overlay
shadow and scrim. The faint local field-paper texture remains behind the shell and carries no
text or interaction.

## Shapes

Controls use the control radius, ordinary panels the surface radius, and focal illustrated panels
the hero radius. Small icon plates use the small radius. Pills remain for avatars and compact
filters; descriptive metadata does not need a capsule.

Use continuous corner curves where supported and preserve clipping around artwork.
The Ghaf silhouette comes from official brand assets and local botanical imagery.

## Components

### Buttons and motion

Shared buttons retain their existing variants, labels, busy/disabled states, focus, and callbacks.
Their actual interactive root is `BotanicalPressable`, a Reanimated React Native Pressable.
Tamagui supplies theme, Text, Card, and layout composition; there is no decorative Tamagui button
wrapper around the native control.

Compact buttons use frontmatter padding and a 48dp minimum. Regular buttons use 16dp vertical
padding and a 56dp minimum. Focus, pressed response, busy indicators, and disabled semantics
remain explicit.

Shared press feedback lasts 120ms, settles at scale 0.985, and runs on the UI thread. Reduced
motion removes spatial press feedback. The configured 180ms state and 260ms sheet tokens do not
mean that every surface was reanimated: existing modal sheets retain their own R001 timing.
The confirmation-owned recognition/growth reveal remains the signature event; motion never earns
progress or delays access.

### Selection controls and empty sections

One filter or option row uses one treatment. `SelectionChip` is the shared surface: an
unselected option keeps a paper fill, a 1dp line edge, and a muted label, so it still reads as a
control rather than plain text beside a button; a selected option keeps a sage fill, a
sage-strong edge, and a deep-forest label. Both keep the 48dp target and the pill radius.

Selection stays light on light on purpose. A dark fill under a light label cannot change state
gradually without dropping the label's contrast partway through, which is also why the Parent and
Child bottom navigations change their selected pill instantly. Keeping filters light leaves a
later transition available without that cost.

The chip carries `radio` semantics for choosing one value in a group and `tab` semantics for
choosing which slice of one list is shown. The rows keep their `radiogroup` and `tablist` roles:
the two controls look related and are still announced and navigated differently. A row adds no
second container or underline behind chips that already carry their own edge. A card-shaped
option with its own opaque surface, such as the task category rail, keeps a border-only selected
state instead of a fill it would hide.

An empty section uses `EmptyState`: an icon well, an optional title, the message, and one
accessible name, rather than a bare sentence where content is expected.

### Inputs

Inputs retain React Native TextInput keyboard, editing, selection, and validation behavior.
They use warm paper, a thin border, the control radius, and existing focus/error/success states.
Arabic and English fields may coexist with independent direction and font metrics. Errors remain
textual and politely announced.

### Sections, cards, and utility rows

Card offers paper, tonal, water, and existing coral variants. R003Section uses Tamagui YStack;
action rows keep their icon, wrapping copy, metadata, and direction-aware chevron. Family and
settings use divided sections rather than equal-weight dashboard cards.

Tamagui 2 web composition receives flattened native styles through `nativeViewStyles` /
`nativeTextStyles` as component props. Raw React Native style arrays must not become DOM style.
Text accessibility aliases are explicitly mapped on web; native controls retain native props.

### Navigation and overlays

Parent and Child navigation retain their existing destinations and role isolation. Parent
navigation uses a warm-paper bar with a sage selected surface; Child navigation shares the token
language. Selection has programmatic semantics, and tabs do not gain spatial transitions.

Existing sheets retain dismissal, safe-area handling, focus restoration, and reduced-motion
behavior. A success surface never owns approval or progression.

### Botanical progression

Parent Home pairs local canopy artwork with cooperative progress and an open next action.
Child Today adds profile-scoped landscape context to the task focus. Garden gives the selected
landscape a broad frame and supporting tracks open sections. League keeps its five Leaves,
approved identity fields, and readable ranking rows.

Artwork is local and offline. Copy, counters, progress, and controls remain live UI.
Opening a screen, waiting, or finishing an animation never earns growth.

## Do's and Don'ts

### Do

- **Do** reuse botanical tokens and the shared typography resolver.
- **Do** preserve translated content, task actions, accessibility IDs, and feature gates.
- **Do** separate sections with space and reserve tonal panels for meaningful groups.
- **Do** keep long Arabic text, mixed numbers, focus, and reduced-motion states complete.
- **Do** reuse local Ghaf/UAE imagery and the official mark.

### Don't

- **Don't** repeat the same rounded card for every section or capsule for every label.
- **Don't** add continuous decoration, excessive motion, fantasy growth, or image-baked text.
- **Don't** turn symbolic progress into a measured-impact claim or change product authority.
- **Don't** treat historical route inventories or browser checks as current Android acceptance.
- **Don't** reinstate the Tamagui asChild wrapper that discarded native button style callbacks.

### Historical feature and presentation records

The following material preserves earlier rationale and feature-specific records. It does not
override the active system above or current specifications. Old ten-route inventories, first-run
timing, circle/League descriptions, and implementation ordering are historical.

Frozen records remain in `src/design/tokens.ts`: `colors.ghaf` is `#1D684F`,
`colors.forest` is `#12372D`, `colors.ghafEmerald` is `#126A50`, and
`colors.pearlGround` is `#F7F8F3`. Legacy radii are 6/10/14/18/pill; R001 radii are
4/8/12/16/24/28/pill. Migrated backgrounds and geometry use the additive botanical values.
The former System-font frontmatter and stale palette aliases are superseded by the actual
branded system recorded above.

#### Feature 011 verified family replacement

Parent sign-in always retains the full-width outlined **Create a new family** action beneath the
returning sign-in form. When a saved family exists, the new-family identifier screen adds one calm
status banner before the field: a short preservation heading, one plain-language explanation of the
one-device boundary, and a replacement-specific continuation label. Verification remains visually
and behaviorally identical to the established access step, so personal information never appears
before the accepted code.

After verification, the existing Family Basics, indexed Child profile, and whole-family review
composition is reused without a parallel setup design. Review repeats the consequence immediately
before an explicit **Replace family and create new** primary action. Fresh creation keeps its normal
**Create family** label. All replacement copy is bilingual, uses logical alignment and existing
status/banner primitives, wraps at 320dp, and introduces no destructive red styling or urgency.
Leaving before the final action returns to signed-out access with the established family preserved.

#### Feature 007 Family Plus capacity preview

Keep the existing one/two-Child segmented control unchanged. Directly below it, place one
full-width 76dp minimum Parent-only capacity row for **3–6 Children**. Use the existing gold tonal
roles as a restrained capacity accent, a lock mark, one `Ghaf Plus` pill, a one-household summary,
and one direction-aware chevron. The entire row is the 48dp-or-larger target; pressed state changes
tone and opacity, while meaning remains explicit without color or icon recognition.

The row opens a native modal bottom sheet, not a new route or checkout. The sheet has one compact
family mark, one title and sentence, stacked Free/Plus plan cards, four short parity/value rows, one
proposed-price panel, one prototype-truth panel, and one dominant return action. It scrolls within
the modal at 320dp and large text. Arabic uses Arabic-Indic price digits and logical RTL order;
`Ghaf Plus` is bidi-isolated. English mirrors the information hierarchy in LTR.

Use only shared Alexandria/Readex roles, semantic tokens, continuous radii, safe-area insets, and
UI-thread transform/opacity motion. Reduced motion presents the final state immediately. Opening
focuses and announces the title/summary; scrim, visible action, and Android Back dismiss; focus then
returns to the capacity row. Do not add a Subscribe button, fake checkout, countdown, trial,
discount urgency, crossed-out price, celebratory commerce motion, Child-facing promotion, or any
visual suggestion that the plan can already be purchased.

#### Feature 006 natural ambient audio

Use one root-owned, locally packaged nature soundscape as optional foreground atmosphere across
Ghaf. It loops continuously through route changes at a quiet base level, ducks beneath prepared
narration, and yields completely to background/inactive lifecycle, screen-reader speech, and live
voice capture. Playback failure resolves to silence. The ambience does not own navigation,
progress, feedback, permission, or any product state.

Both Parent and Child Settings place a dedicated Sound section directly after language. The shared
row uses a wrapping logical-start label and explanation with the platform-native switch fixed at
logical end, a 48dp minimum target, explicit switch state/label/hint, and identical Arabic/English
information hierarchy. The preference is device-level, not a Child media permission; either role
may silence it without changing access authority. Persistence failure keeps the previous visible
state and adds a polite warning.

The active Feature 010 soundscape is non-verbal and locally authored from centered filtered-noise
layers intended as soft breeze and distant water. It contains no tonal or bird-like generator,
melody, beat, speech, alert, downloaded recording, or hard stereo movement; the earlier v1 source
remains only for rollback. Do not add music controls, a volume slider, decorative waveform,
animated equalizer, playlist, account sync, recording affordance, runtime URL, or sound-only
meaning. Human Android review owns subjective calmness, naturalness, volume, narration balance,
and loop-seam acceptance.

#### R003 onboarding image perimeter progress

Remove the detached filled strip from the lower portion of every onboarding photograph. Replace it
with one inset, rounded perimeter treatment that reads as part of the image frame: a restrained
light edge track and a narrow date-gold progress stroke. Two equal branches originate at the bottom
center. The first moment shows only a short centered mark, intermediate moments carry the line
around the bottom corners and side edges, and the final moment closes at the top center.

The perimeter responds only to explicit step state and stays visually subordinate to the image,
copy, and primary action. It is decorative to assistive technology because the unchanged lower
current/total plus dot row owns progress semantics. Standard motion reveals the SVG dash on the UI
thread using the existing 220 ms state-change timing; reduced motion jumps directly to the same
static extent. Do not add glow, pulse, timer, gradient, thick ring, or a second text label.

#### R003 compact audio first-run refinement

The existing six moments remain a first-person Ghaf Guide introduction. Restore the original
logically ordered current/total plus six-dot row in the lower navigation region directly above the
buttons. Neutral dots must remain visible on the botanical page and the current dot becomes both
wider and saturated; programmatic progress semantics ensure color is never the only signal. The
row changes only with explicit Back, Next, or pillar navigation.

Each existing 1200×800 onboarding photograph uses its native responsive 3:2 frame with `cover`, the
current continuous radius, and local source. This exposes the full mix of wide and close
compositions while reclaiming vertical room. Center one short headline and one concrete sentence.
Remove the narration panel and place one 48dp high-contrast speaker control at the logical top-end
of the photograph. The exact visible headline and body remain the narration transcript.

Packaged prepared narration begins only after the local image and screen layout settle and native
screen-reader detection reports no active assistive speech. The speaker icon always restarts the
current clip. Quiet packaged nature ambience comes from the app-wide foreground player and ducks
under narration. Speech stops before a new locale/step or onboarding exit; eligible ambience
continues across the route handoff and follows the shared Sound setting. Browser autoplay refusal
and audio failure leave the complete screen operable. No waveform, avatar, microphone,
voice capture/recognition, runtime URL, background OS playback, timer-driven story advance, or
live-AI indicator is used. Existing 220 ms transform/opacity motion and reduced-motion parity remain
unchanged.

#### Feature 008 family connection planning

Family Basics places the private family-person directory before the existing household fields.
The required primary Parent/guardian and optional second guardian use the established full-width
inputs. Optional relatives stay collapsed behind one **Add relative** action; one inline editor at
a time exposes a display name plus relationship and rhythm radio groups. Saved entries become
compact tonal rows with named Edit and Remove actions. An unfinished row locks Continue until the
Parent saves or cancels it, preventing quiet loss at the fixed action boundary.

The whole-family review presents guardians first, then configured relatives, then the existing
family and Child summaries. Parent Family places a dedicated stacked connection plan directly
below its hero. Each relative row keeps the name and rhythm compact, gives the current idea the
strongest hierarchy, and includes an equal call/message alternative. One section-level boundary
explains Parent review, Child choice, and zero progression/reward effects instead of repeating the
same caveat on every row. No AI sparkle, due date, completion control, or task-assignment action is
used.

Arabic remains first, long relationship labels wrap in the existing radio control, mixed-script
names use automatic bidi direction, and every action keeps the shared 48dp minimum. The ivory,
emerald, pearl, and quiet teal surfaces reuse the released Soft Geometric system without a new
illustration or dependency.

#### R003 device-local family setup extension

First-family setup is one visible sequence: Family Basics asks for the minimized family-person
directory, family name, application language, and one-or-two Child count; the next route renders
Child 1 and, when selected, Child 2 as separate indexed steps; Review shows the complete family
before the one-time create action. Back retains each complete draft entry. Required identity-light
Child fields come first—nickname, botanical avatar, age band, and preferred language—followed by
required male/female sex, curated interests, hobbies, support, accessibility, and
prepared-personalization choice. Each multi-choice group ends with one Other chip that reveals one
matching 2–80-character native text field. Other counts toward the existing selection limit and
clears its text immediately when deselected. There is no unbounded “important information” box;
custom entries are purpose-labeled and warn against names, contact details, diagnoses, or private
family narratives.

The screens reuse the current Soft Geometric botanical system: organic ivory background, strong
Alexandria headings, Readex controls/body, emerald primary action, outlined semantic chips, generous
vertical rhythm, one fixed-safe action region, natural keyboard-aware scrolling, and 48dp targets.
Optional preference choices are visibly skippable. Step totals adapt to the selected count (`1/3` through
`3/3`, or `1/4` through `4/4`), and the review remains an editable summary rather than another
form.

The AI profile preview is the only new profile-level sparkle surface. The star labels a bounded
prepared helper, not decoration or a claim that a live model ran. It previews a coaching style and
at most two reviewed categories from an exhaustive allowlist, remains visible when opted out, says
AI may be wrong, and says the Parent decides. Gender, nickname, family name, contact data, free
text, diagnosis, emotion, media, and task history never enter the helper. Existing sparkle marks
remain on the Parent Guide and Child Coach where AI functionality is actually available.

#### R003 returning-family welcome extension

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

#### R003 first-run experience extension

The first-run surface is an optional six-moment editorial sequence inside `/`, followed by the
existing Parent/Child Welcome decision. It introduces Ghaf, then gives Family, Sustainability, and
bounded AI one unmistakable moment each before the existing help and private symbolic-growth
close. Each moment uses the official raster logo, one generous vivid photograph, a short
child-clear title, one concrete supporting sentence, visible `1/6` progress, and one dominant
action. The first four moments also expose the same live three-pillar navigator: three 48dp targets
with a color-coded active state and bilingual labels that jump only among Family,
Sustainability, and AI. Skip remains visible; Back is quiet; changing locale keeps the current
step. Delight comes from warm light, bold crops, step-specific emerald/teal/amber surfaces,
energetic but concise active copy, and one restrained two-beat settle: the photograph resolves over
220 ms with opacity, 8dp travel, and a 0.985→1 scale while copy follows 45 ms later—not confetti,
streak pressure, mascots, fantasy effects, robot companions, or competing card stacks.

The native Expo splash remains the earliest frame and uses the official raster icon. After its
handoff, the fully opaque app-owned splash uses the same mark and local leaf-shadow texture for
2,000 ms with no loader or transparent entrance. It then changes in place to the leaf-loading
state for at least 1,000 ms and until the four current font files and nine signed-out
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

All new scenic presentation is raster. Live text, buttons, pillar controls, progress dots, focus
state, and loading status remain semantic native UI; existing functional vectors elsewhere are
unchanged. Standard motion uses opacity plus at most 8 dp of vertical travel and 0.015 scale over
the quick/standard token durations. Reduced motion removes translation and scaling. At 320 and 390 widths the photograph may shorten,
but the primary action and step status remain visible or reachable by vertical scrolling. The
screen contracts below define the public copy, state, and evidence rules.

#### R003 complete-screen extension

The 2026-09-05 user-authorized completion pass extends this same visual world to missing access,
Family, Reward, settings, permissions, devices, reauthentication, and Child-settings surfaces. The
2026-09-06 usability correction additionally authorizes a dedicated Parent sign-up surface. A
missing reference frame is no longer an implementation blocker for the local prototype. New screens
must reuse the Soft Geometric palette, typography, spacing, iconography, native shells, and
botanical grammar already present; they do not introduce a second dashboard or generic settings
theme. The route contracts below define entries, exits, and privacy boundaries.

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

#### Historical Design Authority

- R001 PNGs are canonical composition references for `/` and the six historical Parent-onboarding
  steps except `/access/parent/sign-in`. For that route, the user-authorized 2026-09-06 usability
  layout centers screen-level orientation/supporting copy, retains logical-start mixed-identifier
  fields, and keeps the filled credential plus full-width outlined Create Family hierarchy. The
  simulated biometric action is removed. Sign-in checks the normalized identifier against the
  schema-2 local family record before verification; a matching Parent bypasses setup after the
  deterministic code, while an unknown identifier stays on sign-in. Create Family navigates
  without requesting verification.
- `/access/parent/sign-up` is an R003 code-native Soft Geometric candidate because no approved
  reference frame exists. It uses the organic access shell, a tonal 64dp family icon plate, centered
  Alexandria heading and Readex orientation, one mixed phone/email field, one filled full-width
  continuation, a concise returning-family prompt, and one full-width emerald outlined sign-in
  action. It reuses the existing deterministic verification authority and binds the normalized
  identifier only when the complete family is saved. Sign-in, sign-up, and verification use neutral
  copy with no demo/not-real footer and no claim that a message was sent or identity was remotely
  proven. The internal product boundary remains one local synthetic household.
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

#### Design Promise

Ghaf should make one relationship unmistakable: a Child completes a useful real-world action, a
Parent recognizes it, and the family's UAE living landscape grows. The interface should be warm,
rooted, brief, and calm. It must not resemble a bank, a public behavior chart, a generic analytics
dashboard, or an engagement-maximizing mobile game.

The flagship Ghaf is the household canopy. The other tracks—Samar, Sidr, date-palm oasis, and
mangrove coast—give task categories a memorable home. They are interconnected design metaphors,
not a claim that every species occupies one literal habitat or that digital growth plants real
trees.

#### Experience Invariants

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

#### Two Modes, One System

##### Parent mode — calm stewardship

Parent screens prioritize definition of done, safety, privacy, choice, and recognition. Use compact
rows, stable type, restrained illustration, and neutral status language. Lead summaries with
strengths and observable facts. Never show a normality score, clinical color scale, surveillance
timeline, or alarmist inference.

##### Child mode — capable explorer

Child screens show one task, a few short steps, large controls, a visible meaning statement, and a
garden horizon. They may use more illustration and gentle movement but never baby talk, commands,
coin-shop metaphors, streak flames, public ranks, or infinite assistant conversation.

Both modes use the same palette, typography, growth grammar, logical spacing, and content model.

#### Layout Grammar

- Use a safe-area `Screen` shell with 20px phone padding and a readable content maximum on web.
- Compose with logical `start`/`end`, never hard-coded left/right for semantic alignment.
- Use 8px as the base rhythm; major sections normally separate by 24–32px.
- Keep the dominant action reachable and at least 48×48dp.
- Prefer tonal grouping, separators, landscape planes, and whitespace over repeated elevated cards.
- Use one top-level title, one short orientation sentence, and one primary action per screen.
- A bottom action area may be sticky only when it does not cover content or the keyboard.
- Parent review may use a two-column web layout, but the Android contract is one vertical stream.
- No horizontal carousel may hide a required step or safety note.

#### Preserved R001/R002a Screen Contract

The historical R001/R002a baseline below has ten authored routes. Loading, fallback, retry,
assistant, confirmation, and celebration are states within them. The R003 completion routes are
documented in this contract; `/role` is now a compatibility redirect only.

##### `/` — entry and disclosure

- Show the Ghaf wordmark, one UAE landscape vignette, and Arabic/English controls.
- State that profiles/media are synthetic. Render assistant status from the active provider:
  “prepared/prewritten” for fixtures and “live” only for a verified secure call.
- Primary action: enter the demo. Secondary action: switch language.
- Do not begin with accounts, statistics, or a rewards balance.

##### `/role` — role and Child selection

- Show Parent and Child as demo modes, not authentication.
- Display Salem, age 9, and Alya, age 11, as clearly synthetic profiles.
- Parent selection may continue to `/parent`; Child selection continues to `/child`.
- Warn that private Parent content is safe only because the prototype data is synthetic.

##### `/parent` — family overview

- Top: family canopy and the next cooperative milestone, without rank.
- Middle: each Child's next task and requested support; show one combined canopy without raw
  side-by-side Seed totals, pace, or age-unequal contribution trails.
- Bottom: one bounded Ghaf Guide summary beginning with strengths and a time window.
- Primary action: create a task. Secondary actions: open garden or circle.
- Never show private notes in a sibling-comparison visualization.

##### `/parent/task/new` — task drafting

- Select Child, category, and a curated template before allowing custom copy.
- Show recognition mode and any exact Seed award before approval; recognition-only/maintenance says
  “Parent recognition, no Seeds.” P0 uses standard acquisition with 12 Seeds.
- Ghaf Guide actions are explicit intents: make clearer, make smaller, check safety, adapt age.
- Preserve Parent authorship: show the original and proposed version with Accept and Keep mine.
- For reward-eligible templates, show acquisition/maintenance. Recognition-only fixes phase to
  `not_applicable`.
- Custom free text never bypasses safety, privacy, and category rules.

##### `/parent/task/review` — approval

- Present Arabic and English, observable definition of done, why it matters, estimated effort,
  supervision, exclusions, optional evidence, privacy, recognition mode, any Seeds, phase,
  visibility/circle eligibility, and landscape mapping.
- Safety-critical text sits above the approval action and cannot be collapsed.
- Primary action: approve and assign. Secondary action: edit.
- Explain that Parent confirmation is required before any eligible credit or growth.

##### `/child` — task choices

- Greet the selected synthetic Child and show two to three Parent-approved choices at most.
- Each `TaskChoice` shows title, short purpose, effort, help status, recognition mode, any fixed
  acquisition award, and landscape.
- Show personal progress against the Child's own goal plus the shared canopy—not sibling rank.
- Primary action: choose a task. Allow “Ask to make it smaller.”

##### `/child/task` — act with bounded support

- Show one definition of done followed by no more than four short steps.
- Offer intent buttons: Show steps, Help me plan, Practise a phrase, I need an adult.
- Prepared photo and push-to-talk fixtures are optional task actions with visible origin labels.
- Before submission, state exactly what the Parent can see.
- Primary action: submit for Parent check. A short reflection is optional and never circle-shared.
- Assistant output never hides or changes the Parent-approved completion criterion.

##### `/parent/check-in` — recognize or adjust

- Show the Child's completion mode, optional fixture, and reflection separately.
- Parent options: Confirm, Kind retry, Make smaller, Equivalent task. No reject/shame state.
- Confirmation drafts specific praise that the Parent may edit before sending.
- The Guide summary separates facts, uncertainty, a question to ask, and one possible adjustment.
- Confirmation is idempotent; duplicate input must not issue duplicate Seeds or growth.
- On the third confirmation of a recurrent fade-first acquisition task, show an in-route
  `RoutinePhaseReview` after recognition: **Keep acquisition** or **Move future completions to
  maintenance**. Neither is preselected; the current completion is unchanged. A Parent may reverse
  the future phase from the task detail sheet on `/parent`.

##### `/garden` — consequence and meaning

- Animate the 12 Seeds toward the Mangrove track, then show the new static growth stage.
- Add one visible leaf to the household Ghaf canopy.
- Name the real action and its meaning without inventing liters, kilograms, carbon, or real planting.
- Show all five tracks as a connected UAE landscape, with the mapped track visually strongest.
- Primary action: see family circle. Reduced motion jumps directly to the final frame and text.

##### `/circle` — cooperative overview

- Show household contribution and seeded family-level cousin aggregates toward one Green Impact goal.
- Use garden silhouettes or progress bands, never a podium, first/last rank, or Child profile grid.
- State that circle data is synthetic/local and sharing is not implemented.
- Exclude prayer, kinship, affection, food consumption, hygiene, wellbeing, disability-related
  routines, exact task history, photos, voice, reflections, assistant content, and Parent notes.
- Primary action: finish or reset the demo.

#### Component Contract

##### Foundations

- `Screen`: safe area, background, logical padding, scroll/keyboard behavior.
- `JourneyHeader`: back action, bilingual title, short step context; no gamified progress pressure.
- `PrimaryButton`, `SecondaryButton`, `QuietButton`: explicit disabled, pressed, busy, and focus states.
- `LanguageSwitch`: Arabic/English with clear selected state; it is not a flag selector.
- `OriginDisclosure`: prepared, simulated, synthetic, estimated, or live label beside the relevant
  object, not hidden in a general footer.

##### Task and recognition

- `TaskChoice`: title, meaning, effort, recognition mode, any fixed Seeds, help/supervision,
  landscape cue.
- `TaskSteps`: ordered, concise, screen-reader announced; completion remains optional until real.
- `SafetyBoundary`: coral accent, icon plus text, adult-action verb; never relies on red alone.
- `DefinitionOfDone`: one observable behavior, distinct from evidence.
- `PraiseEditor`: suggested action-specific line plus editable Parent voice.
- `RetryPanel`: smaller step, help, equivalent, or later; no failure badge.
- `RoutinePhaseReview`: Parent-only, future-facing phase choice with no automatic selection or loss
  of prior progress.

##### Garden and family

- `SeedAward`: acquisition-only deterministic quantity and destination; absent for maintenance and
  recognition-only; never animates before confirmation.
- `LandscapeTrack`: species/landscape name, product category, stage, progress, origin note.
- `FamilyCanopy`: one flagship Ghaf with contribution leaves; it is not a leaderboard.
- `HouseholdContribution`: combined household-visible acquisition growth feeding one canopy;
  individual raw totals stay out of the sibling surface.
- `CircleProgress`: family-level aggregate toward a common target, with privacy disclosure.

##### Assistant

- `AssistantTrigger`: action label such as “Make this clearer,” not an empty sparkle icon.
- `AssistantSheet`: bounded intent, disclosure, concise response, Accept/Dismiss, and human-help exit.
- `PreparedMedia`: thumbnail or audio control, synthetic origin, visibility statement, remove action.
- `ParentVoicePermissionPanel`: a separate Parent action for stored synthetic voice and AI grants;
  it never rides on assignment approval or the shared-device role selector.
- `SyntheticVoicePanel`: task-bound prepared rehearsal with explicit active, transcript-review,
  sent, delete, caption, simulated-rate, replay, and reset states; no microphone or audio capture.
- `ParentPatternSummary`: time window, strengths, observed facts, uncertainty, question, adjustment,
  and non-diagnostic disclosure.

#### Reward and Growth States

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

#### Assistant State Contract

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

#### UAE Content Presentation

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

#### Arabic, RTL, and Localization

- Arabic is the default demo locale and first content field in bilingual Parent review.
- Use `I18nManager`/locale state and logical flex/alignment helpers consistently.
- Mirror back/forward arrows and ordered journey movement; do not mirror trees, checkmarks, Arabic
  calligraphy, the dallah, or nondirectional symbols.
- Give Arabic body copy at least 1.55× line height and test diacritics without clipping.
- Treat Arabic phrases and Latin units as isolated directional runs where necessary.
- Never concatenate translated fragments to build a sentence or plural.
- Test long Arabic titles, mixed Arabic/English names, 4/6/8/12/15 counts, and screen-reader order.
- Locale switching must preserve the current safe app state and update navigation direction.

##### Bilingual typography roles

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

#### Accessibility

- Minimum touch target: 48×48dp; minimum spacing between adjacent small targets: 8dp.
- Text contrast: target WCAG AA; do not encode state by color, shape, motion, or sound alone.
- Support font scaling through at least 200% without truncating actions or safety notes.
- Provide labels, roles, state, and hints for controls; group Seed amount with its meaning.
- Announce submission, Parent confirmation, reward, growth stage, and circle milestone once.
- Reading order follows the locale and remains logical when bottom sheets open.
- Prepared audio always has visible text; prepared images have concise alt text and origin labels.
- Reduced motion renders the same final state immediately with a textual cause-and-effect summary.
- Let either Parent or Child turn off ambient audio. Parents may also remove evidence, shorten
  tasks, allow help, and select accessible alternatives without decreasing the Child's dignity.

#### Motion and Sound

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
Ambient sound uses one foreground-only loop, ducks under narration, and pauses for screen readers
or exclusive voice work. Its native switch lives in both role-specific Settings spaces.

#### Media and Provenance

P0 uses prepared synthetic fixtures only. A fixture must contain no Child, face, hand, personal
data, brand, address, school, readable private text, or watermark. The recycling image shows clean,
intact, non-sharp, clean paper/plastic items accepted by the local stream on a neutral surface.
Remove metadata and record source, prompt or
creation method, transformation, license/ownership, reviewer, and date.

The decorative access portraits are a narrow presentation exception, not task/media fixtures. The
shared Parent composition may show exactly one fictional synthetic Emirati father and one
fictional synthetic Emirati mother in culturally appropriate local attire, including the requested
traditional abaya and hijab. Child profile access may show exactly one fictional synthetic Emirati
boy and one fictional synthetic Emirati girl in age-appropriate traditional clothing, but the
composition stays visibly separate from the actionable tree-avatar profile controls and does not
depict the seeded profiles. Neither image may contain a real user, identifying data, text, device,
unsafe prop, task evidence, or product-state claim. Both use centered responsive 3:2 frames, remain
outside the accessibility tree, have no identity, access, or selection authority, and must fail
without blocking login. Exact prompts, transformations, checksums, routes, and unrun named-human
reviews are recorded beside the versioned local assets. The compositions do not claim to represent
every Emirati family appearance.

Photo and voice controls must explain:

- that the item is prepared/synthetic in P0;
- what a Parent will see;
- that evidence is optional;
- how to remove it; and
- that live capture, upload, retention, and analysis are not implemented.

#### Error, Offline, and Reset

- The deterministic flow works without network access.
- An assistant timeout falls back to the reviewed fixture on the same route and retains Parent text.
- A missing prepared image uses descriptive placeholder copy and never blocks task completion.
- A duplicate confirmation is a no-op with a neutral “Already confirmed” message.
- A reload restores only the validated device-local family directory and approved paired-Child
  markers. Sessions and task/Seed/Garden/League/Reward state remain deterministic prototype state;
  the app must not imply broader persistence.
- Reset is one Parent-only demo action, requires a small confirmation, and restores the exact seeded
  state documented in `DEMO_RUNBOOK.md`.

#### Implementation Notes

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

#### Review Checklist

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
