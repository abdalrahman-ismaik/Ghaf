# Ghaf Design Direction — Revision 3 Planning

**Revision 2 product/UX direction:** APPROVED on 2026-09-01

**Revision 3 Growth Journey:** accepted for planning on 2026-09-03; visual direction pending

**Visual direction:** R001 Batch 1 approved; later Revision 2 and Growth Journey families pending

**Implementation:** PARTIALLY RELEASED for foundations and Parent onboarding

**Primary platform:** Android, Arabic RTL first with matched English LTR

## Status and Authority

This document records the durable design brief for Feature 003 Revision 3 planning. It inherits the
approved Revision 2 role, League, reward, and safety contract and supersedes the Revision 1
ten-route, role-switch, cooperative-circle design as an implementation target. The
2026-08-28 design and web evidence remain historical only.

The canonical generation workflow is
[`GHAF_GOOGLE_STITCH_PROMPT_PACK.md`](GHAF_GOOGLE_STITCH_PROMPT_PACK.md). Generated screens become
design authority only after the user supplies and explicitly approves them. The user approved
`docs/design/stitch/releases/ghaf-r001/` on 2026-09-02 for the foundations, Welcome, and first-time
Parent onboarding only. Its PNGs now govern that composition; its HTML is a non-runtime hint.
Runtime work outside the partial release remains blocked.

The user-supplied
[`GHAF_GROWTH_JOURNEY_PROMPT_PACK`](docs/GHAF_GROWTH_JOURNEY_PROMPT_PACK/) is additional creative
and product input. It does not prove that Child Today/Garden, Parent progress, entry, or reveal
screens have been designed. Its route suggestions, interfaces, timings, and 390×844 language are
non-executable until a new approved Stitch release is reconciled in
[`growth-journey-preflight.md`](specs/003-family-growth-garden/design-intake/growth-journey-preflight.md).

Related planning contracts are the [badge catalog](docs/content/BADGE_CATALOG.md),
[learning stories](docs/content/LEARNING_STORIES.md), and
[Impact Path projection ADR](docs/architecture/adr/0002-impact-path-projection.md).

The partial release and unresolved evidence are recorded in
`specs/003-family-growth-garden/design-intake/release-gate.md`.

## Creative Idea

Ghaf helps children build positive routines through Parent-approved tasks, child-safe AI support,
permanent Seeds, growing UAE landscapes, friendly family competition, and optional private
Parent-funded rewards.

One modern UAE botanical world supports two distinct experiences:

- Parent mode is calm, premium, highly organized, and focused on stewardship.
- Child mode is brighter and more expressive, with larger controls and stronger landscape moments,
  while remaining capable, polished, and never cartoonish.

The garden is the memory of real action. The app should send the Child back into the world, then
briefly explain what grew after Parent confirmation.

## Experience Architecture

Parent persistent navigation:

1. Home
2. Tasks
3. Garden
4. Family

Child persistent navigation:

1. Today
2. Garden
3. League

Contextual families appear only when needed: welcome/access, Parent sign-in/setup, Child access and
pairing, three-stage Task Builder, Parent Check-in, Family Reward Plan, League setup/member
management, profiles, permissions, devices, settings, and Parent reauthentication.

R001 freezes `/`, six `/access/parent/**` onboarding destinations, and the success transparent
modal. It does not freeze or release either persistent tab shell. The success action targets the
preserved `/parent` integration route without authorizing a Parent Home redesign.

The old `/role` screen and forced Parent/Child switching are removed. Parent and Child are separate
access sessions inside one app. Celebration is a temporary Garden state. AI is embedded inside the
relevant task or decision, not exposed as a chat tab.

## Product Mechanisms Must Stay Distinct

| Mechanism                         | Design meaning                                                                     |
| --------------------------------- | ---------------------------------------------------------------------------------- |
| Seeds — بذور                      | Permanent personal growth after Parent confirmation                                |
| Challenge Leaves — أوراق التحدي   | Five normalized weekly opportunities; confirmed Leaves determine League score      |
| Family canopy — مظلة العائلة      | Cooperative result that grows with confirmed Challenge Leaves                      |
| Family Reward — المكافأة العائلية | Optional private Parent promise unlocked by personal Seeds or landscape milestones |

Never represent Seeds as money, Challenge Leaves as another currency, the canopy as an individual
score, or Family Reward as a wallet.

Impact Path is not another mechanism or currency. It is the Child's private map of confirmed
lifetime Seeds plus separately proven action/learning evidence. It never affects League rank,
spends progress, or exposes another Child.

## Growth Journey Direction — Pending Stitch

The creative idea is an original botanical trail through UAE habitats and living heritage. It may
borrow the clarity of a visible milestone road—current position, a few next stations, transparent
criteria, and a permanent collection—without borrowing a battle pass's economy, urgency, visual
grammar, or social status.

- Keep the existing three Child tabs. Today gets one compact path card; Garden owns prominent
  **مسار الأثر** and **شاراتي** entries; League remains the approved private invite-only League.
- Keep the Ghaf tree and family canopy visually dominant across the product. Mangrove is the first
  chapter, not a replacement identity.
- Show the completed Mangrove 60/60 as preserved history and the cumulative path as 120/180. Never
  reuse one progress denominator for the other.
- Present a small number of reachable stations and explicit composite criteria. Locked content is
  understandable, not mysterious, priced, timed, glowing, or labelled rare.
- Use **برعم · غصن · ظل** as noncompetitive mastery language and original botanical/geometric badge
  art. No crown, chest, metallic rail, rarity beam, dual premium row, seal, flag, or copied game
  composition.
- One combined RevealBundle explains all outcomes and then stops. Praise leads; private Family
  Reward remains last. Never stack a Garden modal, badge modal, and reward modal.
- One finite sourced Mangrove story and a visible equal-credit alternative end cleanly. Source rows
  are readable; named places never imply a visit, partnership, certification, or official badge.
- A brief first-install Opening Moment and exactly three role-neutral introduction panels may layer
  before R001 access only after approval. Skip and replay are quiet, progress-neutral choices.
- Parent progress is a calm selected-Child summary, never a sibling comparison, diagnostic insight,
  morality score, or inferred interest profile.

There is no paid path, shop, boost, loot box, random drop, streak loss, countdown, expiring progress,
autoplay, public badge profile, public sharing, GPS, location/venue check-in, or photo/audio proof.

## Friendly League Direction

The Ghaf Family League combines a visible weekly ranking with personal permanent growth and one
shared family result.

- Each Child has five Parent-nominated, age-appropriate Challenge Leaves.
- `Weekly Growth Score = confirmed Challenge Leaves ÷ 5 × 100`, capped at 100.
- Help and accessibility adaptations earn full credit.
- Extra tasks can grow the garden but cannot improve rank.
- Ties share position; speed is never a tiebreaker.
- Weekly rank/score resets; Seeds and landscapes do not.
- League rows show only nickname, tree avatar, rank, score, and completed Leaves.
- Prepared bilingual encouragement is allowed; free text and direct chat are not.
- Prayer, affection, emotional disclosure, private wellbeing, evidence, accommodations, money, and
  task details never appear.

Competition should feel energetic but not adversarial. Leaders may receive stronger emphasis, but
there are no loser treatments, downward-shame alerts, podium spectacle, or pressure countdowns.

## Family Reward Direction

Family Reward is warm, private, and family-controlled. It is not fintech.

- A plan may promise money, an experience, a privilege, or a gift.
- It unlocks through personal eligible Seeds or eligible-provenance landscape milestones, never
  displayed aggregate growth alone or League rank.
- States are `Promised → Unlocked → Given`.
- Praise and garden growth appear before an unlock message.
- Amounts are visible only to that Child and guardians.
- The Parent sees the maximum amount promised for the month.
- There is no balance, wallet, Seed-to-AED rate, transfer, paid boost, wagering, cash imagery, or
  jackpot treatment.
- An unlocked promise cannot be removed or retroactively weakened.
- Prayer, affection, emotional disclosure, eating, love, basic needs, safety, caregiving, education,
  and dignity cannot be monetized.

## Access and Trust

The prototype should look and behave like separate protected experiences while disclosing that its
security is synthetic.

- Parent: phone/email fixture, verification state, PIN/passkey/biometric return, household setup,
  full controls, and reauthentication before sensitive changes.
- Child shared device: Parent-created avatar plus PIN or picture sequence.
- Child separate device: QR or short pairing code, Parent approval, expiry, waiting, approval, and
  revoked-device states.
- A Child never receives a Parent tab, reports, reward editing, invitation control, or a simple
  switch into Parent mode.

Avoid banking aesthetics, security theater, blame-oriented lockout copy, and production-security
claims.

## AI, Voice, and Language

Ghaf Coach remains a bounded task helper.

- Ages 6–8: slower voice, one short instruction, early Ask an adult action.
- Ages 9–11: two or three steps, friendly explanation, quick-choice responses.
- Ages 12–14: respectful, concise, mature language.
- Safety and task requirements use clear Modern Standard Arabic.
- Greetings and encouragement may use a light Parent-approved Gulf/Emirati register only after
  named review.
- Arabic-English code-switching may be represented through reviewed deterministic fixtures.
- Push-to-talk is visible and deliberate, with timer, transcript, delete-before-send, replay,
  captions, and slower playback. The task remains visible and Ask an adult remains prominent.

P0 recording, voice understanding, QR, pairing, biometric, and passkey states are synthetic
simulations unless separately approved and directly validated. Never show ambient listening, a
human AI avatar, companion language, or open chat.

## Typography

Use the same bilingual families in both locales:

- Alexandria for display headings, garden names, and milestones.
- Readex Pro for body copy, controls, tasks, AI dialogue, and League/reward data.

| Element      | Child mode            | Parent mode           |
| ------------ | --------------------- | --------------------- |
| Hero heading | 32/44, Alexandria 800 | 30/42, Alexandria 700 |
| Screen title | 26/38, Alexandria 700 | 24/36, Alexandria 700 |
| Arabic body  | 18/30, Readex 400–500 | 17/28, Readex 400     |
| Button       | 17/26, Readex 600     | 16/24, Readex 600     |
| Caption      | minimum 14/22         | minimum 14/22         |

Requirements: true page-level RTL, generous Arabic line height, no artificial Arabic tracking, no
thin Arabic weights, tabular numerals for rank/Seeds/rewards, correct mixed-direction `AED 25` and
`١٢٠ بذرة`, font scaling without clipped actions, and one localized language per ordinary screen.

R001 uses local Expo-compatible Alexandria 400/700/800 and Readex Pro 400/500/600/700 packages with
explicit weight-specific runtime names, deterministic loading/error fallback, and no remote font
request. Native Arabic shaping, fallback behavior, and package license evidence remain validation
items rather than assumptions.

## Visual Character

Shared character:

- modern UAE botanical identity;
- strong bilingual typography;
- clean surfaces with limited card stacking;
- purposeful, code-friendly landscape illustration;
- restrained causal motion;
- one dominant action per screen;
- no generic UAE ornament.

R001 approves pearl `#F7F8F3`, primary `#00503B`, Ghaf emerald `#126A50`, deep forest `#0D3128`,
mangrove teal `#188B83`, solar amber `#F2B84B`, ink `#14221D`, and the supplied semantic
surface/outline/error roles for this batch. Tonal surfaces and code-native organic SVG create
depth; generated CSS blur is not a native dependency requirement.

## Selected Batch Direction

R001 selects **Soft Organic Modernism** for onboarding: premium bilingual typography, a quiet pearl
dot field, restrained organic horizon layers, decisive emerald actions, soft geometric radii, and
minimal transactional chrome. The direction is calm and capable for Parent operation without
banking aesthetics or generic heritage ornament.

No conclusion about the brighter Child mode, persistent navigation, task/garden hierarchy, League,
Family Reward, or growth celebration may be inferred from these onboarding frames.

## Motion

Motion explains a cause and then stops: access success, selection, bounded assistant result,
Parent praise, Seed movement, landscape stage change, canopy leaf, Challenge Leaf confirmation, and
private reward unlock. Growth Journey adds only a brief interruptible opening and one finite
combined result. Reduced motion presents the same ordered final result immediately with text; exact
timings require approved motion references.

No confetti storm, slot-machine reveal, cash-register sound, streak flame, alarm, failure sound,
looping lure, or animation-dependent state commit.

## Anti-Patterns

Do not introduce a public/global leaderboard, public Child profile, free-text messaging, public
task/evidence sharing, wallet, store, Seed cash-out, paid boost, cash shower, role toggle, chat tab,
AI friend, diagnostic summary, surveillance timeline, generic Material template, glassmorphism,
neon gaming UI, premium path, rarity tier, glowing claim loop, public badge sharing, GPS/visit
proof, faux luxury gold, beige heritage brochure, camel/falcon/mosque ornament, cartoon mascot,
excessive cards, dying vegetation, shame, or unsupported environmental-impact numbers.

## Design Intake Exit Gate

The complete direction is ready for implementation only when later approved Stitch frames and the
team record:

- Arabic-first and matched English frames for every required screen family;
- selected palette, typography assets, component/radius/icon/illustration system;
- exact route-versus-state map and Back behavior;
- default, loading, empty, offline, error, denied, expired, duplicate, rest-week, tied, unlocked,
  given, and reduced-motion states;
- long-copy, 200% font-scale, screen-reader, mixed-bidi, and 48dp evidence targets; and
- a component inventory that can be reconciled with the existing Expo code without silently
  broadening scope.

The same requirements remain open for every screen outside R001 Batch 1. Within the partial batch,
the exact route/component map, design audits, state assumptions, and local font decision are frozen
under `specs/003-family-growth-garden/design-intake/`.

The Growth Journey release must additionally supply full Arabic/English frames and mandatory
screen specifications for the entry layer, complete Child Today/Garden/League shell, Path, Gallery,
Detail, combined RevealBundle, learning/equivalent routes, Parent Check-in/result handoff, and Parent
selected-Child origin. Nested feature frames without those prerequisites do not pass the gate.
