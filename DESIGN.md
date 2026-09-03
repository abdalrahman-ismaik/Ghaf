---
name: 'Ghaf — غاف Revision 3 Planning · R001 Batch 1'
description: 'Canonical R001 foundations and Parent-onboarding design; later Revision 2 and all Growth Journey screens remain blocked.'
colors:
  pearl-ground: '#F7F8F3'
  surface: '#F9FAF5'
  surface-container-lowest: '#FFFFFF'
  surface-container-low: '#F3F4EF'
  surface-container: '#EDEEE9'
  surface-container-high: '#E7E9E4'
  surface-container-highest: '#E2E3DE'
  primary: '#00503B'
  on-primary: '#FFFFFF'
  ghaf-emerald: '#126A50'
  deep-forest: '#0D3128'
  mangrove-teal: '#188B83'
  solar-amber: '#F2B84B'
  ink: '#14221D'
  on-surface-variant: '#3F4944'
  outline: '#6F7973'
  outline-variant: '#BEC9C2'
  error: '#BA1A1A'
  error-container: '#FFDAD6'
typography:
  display-family: 'Alexandria'
  ui-family: 'Readex Pro'
  child-hero: '32/44 800'
  parent-hero: '30/42 700'
  child-title: '26/38 700'
  parent-title: '24/36 700'
  child-arabic-body: '18/30 400–500'
  parent-arabic-body: '17/28 400'
  child-button: '17/26 600'
  parent-button: '16/24 600'
  caption-minimum: '14/22'
---

# Ghaf Feature 003 Design Contract — Revision 3 Planning

**Status:** **R001 PARTIALLY APPROVED; GROWTH JOURNEY DESIGN BLOCKED**

**Revision 2 product/UX approved:** 2026-09-01

**Revision 3 Growth Journey:** accepted for planning on 2026-09-03; visual design not approved

**Approved screen design:** Welcome and first-time Parent onboarding, 2026-09-02

**Implementation:** RELEASED for the named Batch 1 routes/foundations; ON HOLD elsewhere

**Generation input:** [`GHAF_GOOGLE_STITCH_PROMPT_PACK.md`](GHAF_GOOGLE_STITCH_PROMPT_PACK.md)

**Growth Journey input:**
[`docs/GHAF_GROWTH_JOURNEY_PROMPT_PACK/`](docs/GHAF_GROWTH_JOURNEY_PROMPT_PACK/)

**Creative brief:** [`DESIGN_DIRECTION.md`](DESIGN_DIRECTION.md)

## Authority Boundary

This file is executable design truth only for the foundations, Welcome, and first-time Parent
onboarding supplied in `docs/design/stitch/releases/ghaf-r001/`. Each `screen.png` is the canonical
composition reference. The generated HTML is a measurement/structure hint and never runtime
authority. The exact partial release is recorded in
`specs/003-family-growth-garden/design-intake/release-gate.md`.

Every later Revision 2 family and every Revision 3 Growth Journey family remains a durable design
requirement but not an executable visual contract. The new prompt pack's route names, interfaces,
timings, fixed viewport language, and instructions to refine an existing Child shell are proposals.
Do not infer or implement exact composition, assets, navigation appearance, or motion until an
approved Stitch release expands the gate.

The 2026-08-28 ten-route design remains historical evidence only. Its system font, role switch,
cooperative-only circle, and route composition are not Revision 2 targets.

## Approved R001 Batch 1

The approved sequence is:

```text
/
  → /access/parent/sign-in
  → /access/parent/verification
  → /access/parent/family-basics
  → /access/parent/add-first-child
  → /access/parent/review-create
  → /access/parent/family-created-success (transparent modal)
  → /parent (integration destination only)
```

The release approves the Soft Organic Modernism system, canonical palette below, Alexandria/Readex
roles, 4 px spacing basis, 20 px phone margin, 48dp minimum target, 56dp dominant actions, 16 px
primary radii, full pills, dot texture, organic tonal backgrounds, transactional access header,
and native success-sheet composition.

The approved PNGs are 487 px wide and have variable full-capture heights. Scale their composition
to the requested 390×844 review viewport and use natural safe-area scrolling; do not reproduce a
fixed preview canvas. English and nondefault state frames were not supplied, so their runtime
equivalence remains subject to fresh evidence rather than inherited visual approval.

## Design Promise

Ghaf should make this sequence unmistakable:

```text
Parent approves a useful task
  → Child chooses and can ask for help
  → Parent confirms and gives specific praise
  → permanent Seeds and UAE landscape growth appear
  → an eligible weekly Challenge Leaf and family canopy update
  → private Impact Path stations and badges explain what changed
  → an optional private Family Reward may unlock last
```

The product must feel like a modern UAE family tool, not a behavior chart, bank, public social
network, or engagement-maximizing game.

## Navigation Contract

### Parent shell

Persistent destinations: Home, Tasks, Garden, Family.

- Home: review priority, family canopy, Child next actions/support, concise Guide summary.
- Tasks: curated assignments, pending reviews, completed work, and Task Builder entry.
- Garden: household or selected-Child UAE landscape progression without winner/loser comparison.
- Family: Child/device management, invite-only League controls, privacy, and Reward Plan access.

### Child shell

Persistent destinations: Today, Garden, League.

- Today: two or three approved choices, current Challenge Leaves, task start, smaller-task request.
- Garden: permanent personal growth and temporary post-confirmation celebration.
- League: weekly standings plus cooperative canopy; no task/evidence or money.

### Contextual screen families

1. Welcome, language, and access choice
2. Parent sign-in and first household setup
3. Child profile access and device pairing
4. Parent Home
5. Parent Tasks hub
6. Guided Task Builder: Choose, Adjust, Review
7. Parent Check-in
8. Parent Family Reward Plans and creation
9. Parent Garden
10. Parent Family, League, and member management
11. Child Today
12. Child Task and bounded Coach
13. Child Garden, celebration, and private reward unlock
14. Child Friendly League
15. Role-appropriate profile, settings, permissions, devices, and reauthentication
16. First-run Opening Moment and three role-neutral introduction panels
17. Nested Child Impact Path, Badge Gallery, Badge Detail, and finite Learning Package
18. Parent selected-Child Progress & Achievements view

“Approximately 14 screen families” describes information architecture, not a hard route count.
The approved Stitch handoff must identify which steps are routes, nested routes, sheets, or states.

For R001 Batch 1, the exact access routes above are frozen. The persistent Parent and Child shells
remain blocked because no tab frame was supplied. The final success action may enter the preserved
`/parent` integration destination but does not authorize its redesign.

Growth Journey adds no persistent destination. **مسار الأثر** and **شاراتي** are nested under Child
Garden, with one compact Today entry. Parent progress begins from the existing selected-Child
Family/profile context. The proposed introduction finishes or skips into R001 `/`; it must not
create an account, infer a role, or return to `/role`.

The removed `/role` screen must not return. Parent and Child are separate access sessions; ordinary
navigation cannot cross the boundary.

## Screen-Level Hierarchy

- One dominant action per screen.
- Use edge-to-edge landscape moments selectively; use whitespace and separators instead of a wall
  of cards.
- Keep required safety and privacy text above the action that depends on it.
- Keep the current task visible behind a Coach sheet.
- Celebration is temporary Garden state, not a permanent destination.
- Settings and device management live behind the profile avatar, not another tab.
- Parent mode is denser but breathable; Child mode uses larger hierarchy and stronger landscape
  color without babyish treatment.

## Product Components

### Foundations

- `Screen`: safe area, locale direction, scroll/keyboard, readable content width.
- `ParentTabs`: Home, Tasks, Garden, Family.
- `ChildTabs`: Today, Garden, League.
- `PrimaryButton`, `SecondaryButton`, `QuietButton`, `DestructiveButton`: explicit pressed,
  disabled, busy, focus, and error recovery states.
- `ProfileAvatarMenu`: settings, devices, permissions, language, access exit/reset where allowed.
- `OriginDisclosure`: synthetic, prepared, simulated, live, self-reported, or future at the object.

### Access

- `ParentAccessForm`, `VerificationCode`, `ReturnAccess`, `HouseholdSetup`.
- `ChildProfilePicker`, `ChildPin`, `PictureSequence`, `PairingCode`, `PairingApproval`.
- `ReauthenticationGate`, `DeviceRow`, `PermissionRow`, `RevokedDeviceState`.
- Wrong/forgotten/expired copy is calm and never blames the Child.

Every P0 access interaction is labeled synthetic where misunderstanding is possible. Visual trust
must not imply production security.

### Task and recognition

- `TaskRow`, `TaskChoice`, `DefinitionOfDone`, `TaskSteps`, `SafetyBoundary`.
- `TaskBuilderStepper`: Choose, Adjust, Review inside one guided family.
- `GuideSuggestionComparison`: original and suggested wording with explicit accept/keep actions.
- `PreparedMedia`: optional image/audio/transcript, origin, Parent visibility, remove action.
- `ParentCheckIn`: Confirm, Kind retry, Make smaller, Accept equivalent.
- `PraiseEditor`: action/strategy/help-specific praise before any progression consequence.

### Garden and progression

- `SeedIndicator`: permanent symbolic growth, never money.
- `LandscapeTrack`: Ghaf, Samar, Sidr, date-palm oasis, or mangrove; stage and next milestone.
- `FamilyCanopy`: cooperative household growth.
- `RevealBundle`: one prospective replacement for standalone Growth Celebration, containing praise
  → any self-reported activity result → Seeds → mapped landscape → canopy/Challenge Leaf/League →
  Path/badges/recognition → private Family Reward last. Exact composition remains Stitch-blocked.

### Growth Journey — pending Stitch

Related planning contracts: [Growth preflight](specs/003-family-growth-garden/design-intake/growth-journey-preflight.md),
[badge catalog](docs/content/BADGE_CATALOG.md),
[learning stories](docs/content/LEARNING_STORIES.md), and
[projection ADR](docs/architecture/adr/0002-impact-path-projection.md).

- `OpeningMoment`: brief, interruptible branded state after native launch; never a fake system
  splash or forced marketing delay.
- `FirstRunIntroduction`: exactly three role-neutral, skippable/replayable panels with an isolated
  demo that cannot mutate profile progress.
- `ImpactPathCard`, `ImpactPathChapter`, `PathStation`, `ArchivedLandscape`: one free cumulative
  path derived from confirmed lifetime Seeds; no fourth tab or second currency.
- `BadgeTile`, `BadgeGallery`, `BadgeDetail`: earned, in-progress, next-recommended, locked, and
  awaiting-review states with exact component criteria, permanence, privacy, and source status.
- `LearningPackage`: finite sourced story and equal-credit story-disabled/Parent-guided route; zero
  Seeds and garden growth.
- `ParentChildProgress`: selected profile only, recent earned criteria and structured in-progress
  components; no sibling comparison, ranking, behavior score, or inferred interests.

The P0 chapter is Water & Coast, 120–180 lifetime Seeds, with stations at 120, 132, 144, 156, 168,
and 180. Mangrove 60/60 remains a completed landscape record while the path displays 120/180.
Station 132 unlocks the learning package and badge progress, not the Mangrove Care badge itself.
Station 180 cannot advance a landscape unless the independent landscape rule also qualifies.

Badge art uses original botanical/geometric imagery and the mastery terms **برعم · غصن · ظل**.
Avoid metallic rails, tier plates, chests, crowns, rarity beams, glowing claim buttons, dual paid
rows, copied game layouts, tourism branding, seals, flags, and certification motifs.

### League

- `ChallengeLeafProgress`: exactly five weekly markers.
- `LeagueRow`: tree avatar, nickname, shared rank, tabular score, completed Leaves.
- `LeaguePeriod`, `RestWeek`, `TieState`, `NewMemberState`, `CompletedWeekState`.
- `PreparedEncouragement`: allowlisted bilingual reaction with participation/mute controls in any
  future real deployment.
- `CooperativeCanopyGoal`: visible beside ranking so competition is not the only success frame.

### Family Reward

- `RewardPlanProgress`: personal milestone and state; private to Child/guardians.
- `MonthlyPromisedMaximum`: Parent-only informational summary, not affordability advice.
- `RewardState`: Promised, Unlocked, Given.
- `RewardPlanBuilder`: Child, milestone, target, reward type, optional amount, reauthentication.

No wallet, balance, rate, transfer, cash imagery, paid boost, wager, ranking prize, or removable
unlock.

### Assistant and voice

- `AssistantTrigger`: explicit task-bounded intent, not sparkle-only chrome.
- `AssistantSheet`: AI disclosure, concise result, adult exit, dismiss/accept where applicable.
- `PreparedPushToTalk`: visible timer, prepared transcript, replay, slower playback, captions,
  delete-before-send, send, denied/offline/unavailable states.
- `TrustedAdultExit`: “Ask an adult — اسأل شخصًا كبيرًا” remains prominent.

P0 media is prepared/simulated. The design must not imply ambient listening, live analysis, a
human assistant, or open conversation.

## Typography Contract

Alexandria is the approved display family; Readex Pro is the approved body/UI/data family in both
Arabic and English.

| Role         | Child                 | Parent                |
| ------------ | --------------------- | --------------------- |
| Hero         | Alexandria 800, 32/44 | Alexandria 700, 30/42 |
| Screen title | Alexandria 700, 26/38 | Alexandria 700, 24/36 |
| Arabic body  | Readex 400–500, 18/30 | Readex 400, 17/28     |
| Button       | Readex 600, 17/26     | Readex 600, 16/24     |
| Caption      | minimum 14/22         | minimum 14/22         |

- Do not synthesize thin Arabic weights.
- Do not add Arabic letter spacing.
- Prevent diacritic clipping and preserve generous Arabic line height.
- Use tabular numerals for ranks, Seeds, scores, targets, and AED values.
- Isolate mixed-direction content such as `AED 25`, `١٢٠ بذرة`, dates, and mixed-script names.
- Support font scaling through 200% without clipping safety or dominant actions.
- Use one localized language on ordinary screens; bilingual review appears only when it is the job.

R001 Batch 1 bundles Alexandria 400/700/800 and Readex Pro 400/500/600/700 through local
Expo-compatible font packages. Runtime uses their explicit weight-specific family names, never a
remote Google Fonts URL and never synthetic `fontWeight` over a loaded face. The root layout must
hold navigable UI until loading resolves, provide a deterministic readable fallback on load error,
and keep the complete flow usable offline. Package license metadata travels with the installed
packages; native rendering still requires direct validation.

## Color and Material

R001 approves a bright pearl ground, decisive emerald/forest identity, mangrove teal for ecology,
amber for restrained emphasis, and dark ink for reading. The release design-system semantic
surface, outline, primary, secondary, tertiary, and error roles are canonical for this batch.
`#3F4944` is the default secondary reading color; `#6F7973` is primarily an outline/disabled role,
not small body copy.

Depth comes from tonal planes, code-native SVG overlap, and limited purposeful elevation—not
ubiquitous shadows or a new blur/glass dependency. Later Parent/Child modes may extend this palette
only after their own approved frames.

## League Privacy Contract

League projection may contain only:

- approved nickname;
- safe tree avatar;
- weekly rank, including shared ties;
- normalized score from 0 to 100; and
- confirmed Challenge Leaves from 0 to 5.

It must exclude task/category/title, evidence, media, Seeds, reward/money, age, accessibility or
help detail, prayer, affection, emotional disclosure, wellbeing, missed-task reasons, Parent notes,
assistant content, location, school, contact data, and timestamps that reveal pace.

Challenge Leaf eligibility is distinct from Green Impact `circleEligible`. Do not weaken the
existing Green-only environmental projection rule to construct League data.

## Family Reward Contract

- Money is optional; experience, privilege, or gift are equally valid plan types.
- Milestones use newly earned eligible Seeds or eligible-provenance landscape stages; never
  displayed aggregate growth alone or League rank.
- Amount is visible only to that Child and guardians.
- Parent reauthentication is required before monetary creation/change and other protected actions.
- Future plans may change; an agreed milestone cannot be rewritten retroactively.
- Unlocked cannot move backward to Promised and cannot be removed as punishment.
- Praise and garden growth always precede the unlock sheet.
- The app does not transfer, store, custody, redeem, or guarantee fulfillment of money.

## Arabic, RTL, and Localization

- Arabic is the reset/start locale and the first design pass.
- Use page-level RTL and logical start/end layout; do not manually reverse isolated components.
- Mirror navigation arrows and ordered movement only. Do not mirror trees, checkmarks, cultural
  objects, or nondirectional symbols.
- Safety and sensitive content use reviewed MSA.
- Gulf/Emirati greetings and encouragement require named review and Parent approval.
- English variants preserve inventory, hierarchy, spacing, state, and meaning rather than
  redesigning the screen.
- Test long Arabic labels, mixed names, Arabic and Latin numerals, `AED 25`, `5/5`, `100`, and
  screen-reader order.

## Accessibility

- Minimum target: 48×48dp with 8dp between adjacent small controls.
- Meet WCAG 2.2 AA for text and essential UI.
- Do not communicate status by color, sound, motion, rank ornament, or shape alone.
- Provide labels, roles, selected/disabled/busy states, and logical sheet focus.
- Captions/transcripts are available wherever prepared audio appears.
- Reduced motion presents identical ordered consequences and announcements without animation.
- League, voice, and reward features have rest/skip/permission-off/no-plan states.

## Motion and Sound

Use short logical route transitions, immediate press response, one contained assistant reveal, and
one causal growth sequence. League confirmation may settle one Leaf; reward unlock appears only
after growth. State commits do not depend on animation callbacks.

Opening Moment and RevealBundle must be immediately understandable without motion, interruptible,
and finite. Standard transitions may be brief; exact timing comes from approved motion frames, not
the prompt pack. Reduced motion uses state/opacity changes without travelling Seeds, bursts, or
parallax and preserves every consequence and focus transition.

No cash-register, casino, failure, alarm, streak, ranking-loss, or engagement-lure sound. Sound is
optional and never needed for comprehension.

## Required States

Every approved screen family must account for relevant default, loading, empty, offline, error,
success, permission-off, permission-denied, pairing-waiting, pairing-expired, revoked-device,
wrong-PIN, forgotten-PIN, reauthentication, AI-unavailable, pending-confirmation,
duplicate-confirmation, no-reward, promised, unlocked, given, tied-League, rest-week, newly-joined,
completed-week, no-circle, reduced-motion, and long-copy/font-scale states.

For R001 Batch 1, focused, disabled, loading, validation-error, offline-fallback, and success states
are released through shared semantic components even though no separate state PNG was supplied.
Permission, pairing, PIN, AI, confirmation, reward, League, and circle states remain blocked.

Growth Journey additionally requires first/returning/bootstrap-recovery, introduction step/skip/
replay, current/next/reached/archive, earned/in-progress/next/locked/awaiting-review, composite
criterion, source-review, story-disabled, wrong-answer retry, duplicate/seen/recovered reveal,
profile-empty/isolation, and Parent-progress offline/error states. None is visually approved yet.

## Explicit Exclusions

No public/global leaderboard, discovery, direct messaging, free text, comments, task/evidence
sharing, location, school, public profile, winner-take-all prize, money in League, wallet, shop,
Seed exchange rate, payment/custody, randomized reward, punitive streak, countdown pressure, dying
tree, paid path, premium tier, purchasable/tradable badge, rarity, public badge sharing, autoplay
reward queue, GPS/visit/photo/audio proof, role toggle, chat tab, AI companion, diagnosis,
emotion/truth/religiosity score, surveillance timeline, environmental-impact conversion, generic
UAE ornament, cartoon mascot, neon, glass, confetti storm, or cash shower.

## Stitch Intake Checklist

Before releasing the complete Revision 3 design:

- [x] User supplied and approved `ghaf-r001` Batch 1 and its Soft Organic Modernism direction.
- [x] Exact Batch 1 route, Back, success-modal, token, and font decisions are recorded.
- [ ] Arabic RTL frames cover every screen family and required state.
- [ ] English LTR variants preserve the same hierarchy and inventory.
- [ ] Final palette, radii, icons, illustration, navigation, sheets, and component states are
      extracted.
- [ ] Alexandria/Readex assets, weights, licensing, runtime names, loading, and fallback are known.
- [ ] Route/state/Back mapping and protected access behavior are explicit.
- [ ] Long Arabic, mixed bidi, 200% scale, 48dp, contrast, screen-reader order, and reduced motion
      have design-level acceptance targets.
- [ ] Product, safety, League privacy, Family Reward, and capability labels pass review.
- [ ] Feature plan/tasks name exact runtime files and new evidence gates.
- [x] Growth Journey preflight records product/data conflicts and the exact required future frame
      inventory.
- [ ] Growth Journey supplies canonical Arabic and matched English full-screen frames, mandatory
      `screen-spec.md`, material states, original asset provenance, and prerequisite Child/Parent
      shell frames.
- [ ] Badge/source/content and equal-credit learning routes pass named factual, cultural,
      safeguarding, accessibility, and rights review.

Until every remaining item is resolved, implementation outside the explicit R001 Batch 1 release
remains blocked.
