# Codex Handoff — Ghaf Feature 003 Revision 3

## Current instruction: prepare the Growth release; do not implement it yet

Feature 003 Revision 3 is the active pre-Stitch planning direction. It inherits the approved
Revision 2 product contract and adds a private Growth Journey. The user-approved R001 Batch 1
implements Welcome and first-time Parent onboarding and is the only released runtime. Runtime
implementation for every later Revision 2 screen and every Growth Journey screen is **ON HOLD**
until the user supplies and approves its final Google Stitch design.

Do not widen `app/**`, `src/**`, `tests/**`, assets, dependencies, configuration, generated builds,
or runtime evidence from this document alone. Do not add QR, biometric, authentication, payment,
media, navigation, or social dependencies during the remaining hold.

The 2026-08-28 ten-route implementation is a preserved Revision 1 baseline. Its 305-test and
bilingual web-proxy evidence does not validate the later screen architecture, access boundary,
League, Family Reward, voice, typography, Growth Journey, or Android behavior.

## Approved Revision 2 product contract

- One Expo application contains separately authenticated-looking Parent and Child prototype
  experiences; there is no ordinary in-app role switch.
- Parent navigation is Home, Tasks, Garden, and Family.
- Child navigation is Today, Garden, and League.
- Task Builder, Parent Check-in, Reward Plan, pairing, profiles, permissions, settings, and
  reauthentication are contextual screen families.
- Parent/Child sign-in, PIN, picture sequence, pairing, QR, biometric/passkey, device revocation,
  permissions, and reauthentication are deterministic synthetic prototype interactions, not
  production security or real accounts.
- Each Child receives five age-appropriate weekly Challenge Leaves. Weekly score is
  `(confirmed Challenge Leaves / 5) × 100`, capped at 100. Help and accessibility adaptations earn
  full credit; extra tasks cannot improve rank; ties share position; speed is not a tiebreaker.
- League rows expose only nickname, tree avatar, rank, score, and confirmed Leaves. Prepared
  encouragement is allowlisted; there is no free text, direct chat, discovery, or public League.
- Seeds and landscapes remain permanent personal growth. Weekly League score resets independently.
- Family Reward is an optional private Parent promise fulfilled outside the app. It has no wallet,
  custody, transfer, payment processing, or universal Seed-to-AED exchange rate. Its states are
  `promised → unlocked → given`; an unlocked promise cannot be removed or retroactively weakened.
- Family Reward progress fails closed at the immutable task version. Unknown/prohibited activity
  adds zero, and landscape milestones use eligible contribution provenance rather than displayed
  aggregate growth alone.
- Parent confirmation remains praise-first and idempotent. The P0 result is 12 Seeds, Mangrove
  Shoot→Sapling, one household-canopy leaf, Challenge Leaf 4/5→5/5 and score 100, then a private
  108/120→120/120 Family Reward unlock.
- Child Coach remains bounded to the current Parent-approved task. P0 voice/media states are visibly
  prepared or simulated; there is no real Child recording, ambient listening, upload, or analysis.
- Arabic is the starting locale. Alexandria is the approved display family and Readex Pro the
  approved body/control/data family. R001 Batch 1 contains the approved local font roles and
  tokens for that slice; later layouts, roles, and assets remain pending their Stitch handoff.

## Revision 3 Growth Journey contract

- Keep one free private Impact Path derived only from profile-scoped confirmed lifetime Seeds; do
  not create another currency or a fourth Child tab. Today may show a compact entry and the full
  path belongs inside Child Garden.
- The canonical pre-confirmation fixture independently records 108 lifetime Seeds, Mangrove 48/60,
  and 108/120 Family Reward-eligible Seeds. Those authorities remain separate even when a later
  fixture gives them equal values.
- Use exactly the 16 transparent, permanent badge definitions in
  [`docs/content/BADGE_CATALOG.md`](docs/content/BADGE_CATALOG.md). Badges are private, deterministic,
  profile-isolated, and never scarce, paid, tradable, random, or public status.
- Learning and defined activity completion are idempotent and award zero Seeds and zero garden
  growth. The Mangrove package includes an equal-credit accessible route.
- One Parent confirmation produces one ordered RevealBundle: action-specific praise, optional
  truthful self-reported outcome, Seeds, mapped garden growth, canopy/Challenge Leaf/League,
  Impact Path/badges/safe-help recognition, then private Family Reward last. Screens do not
  calculate or duplicate unlocks.
- Opening Moment and the three role-neutral introduction screens are skippable, replayable, and
  profile-neutral. Finishing or skipping hands off to the existing R001 `/` entry and cannot mutate
  task, Seed, garden, badge, League, or reward state.
- Parent progress is a read-only selected-Child projection; Child progress, badge evidence,
  learning completion, and Child-specific story preferences never leak between profiles.

## Required design intake before coding another batch

When the user supplies the Stitch designs:

1. Preserve the user's image/frame files and record their provenance and approval status.
2. Compare every frame with `PRODUCT.md`, the active Feature 003 specification, `DESIGN.md`,
   `PROTOTYPE_LIMITATIONS.md`, and the safety/privacy invariants in `AGENTS.md`.
3. Confirm the complete prerequisite shell: Child access and Today/Garden/League navigation,
   Parent Check-in and result handoff, and a Parent selected-Child origin. A Growth-only screen set
   is not implementable as a coherent journey without those approved frames.
4. Resolve screen inventory, route/state mapping, all Arabic/English copy, component inventory,
   responsive/native behavior, typography assets, loading/error/empty/offline states, profile
   isolation, and reduced motion before changing runtime files.
5. Update `DESIGN.md` from provisional to approved executable design truth and update the Feature
   003 plan/tasks with exact file boundaries.
6. Run Spec Kit consistency analysis and reserve implementation files in `TEAM_OWNERSHIP.md`.
7. Only then implement with focused tests and fresh revision-specific evidence.

The design-generation inputs are
[`GHAF_GOOGLE_STITCH_PROMPT_PACK.md`](GHAF_GOOGLE_STITCH_PROMPT_PACK.md) and the supplied
[`Growth Journey prompt pack`](docs/GHAF_GROWTH_JOURNEY_PROMPT_PACK/README.md). They are not
approval of generated screens. Resolve their requirements through the active contracts and
[`Growth Journey preflight`](specs/003-family-growth-garden/design-intake/growth-journey-preflight.md)
before implementation; consult the proposed [Impact Path ADR](docs/architecture/adr/0002-impact-path-projection.md)
and [learning story contract](docs/content/LEARNING_STORIES.md) for data and content boundaries.

## Non-negotiable exclusions

Do not build production authentication, real multi-family tenancy, payments or money custody, real
invitations, unrestricted Child chat, direct messaging, public profiles, location/school data,
continuous listening, real Child photo/voice processing, diagnosis, emotion/personality inference,
religious judgment, punitive loss, random rewards, Seed cash-out, or measured environmental-impact
claims.

Do not push, merge, deploy, commit, or rewrite history without explicit authorization.
