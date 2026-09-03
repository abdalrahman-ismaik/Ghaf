# Codex Handoff — Ghaf Feature 003 Revision 2

## Current instruction: preserve the partial release; do not widen it

Feature 003 Revision 2 was approved as a product contract on 2026-09-01. The user-approved R001
Batch 1 implements Welcome and first-time Parent onboarding. Runtime implementation for every
later screen is **ON HOLD** until the user supplies and approves its final Google Stitch design.

Do not widen `app/**`, `src/**`, `tests/**`, assets, dependencies, configuration, generated builds,
or runtime evidence from this document alone. Do not add QR, biometric, authentication, payment,
media, navigation, or social dependencies during the remaining hold.

The 2026-08-28 ten-route implementation is a preserved Revision 1 baseline. Its 305-test and
bilingual web-proxy evidence does not validate the Revision 2 screen architecture, access boundary,
League, Family Reward, voice, typography, or Android behavior.

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

## Required design intake before coding another batch

When the user supplies the Stitch designs:

1. Preserve the user's image/frame files and record their provenance and approval status.
2. Compare every frame with `PRODUCT.md`, the active Feature 003 specification, `DESIGN.md`,
   `PROTOTYPE_LIMITATIONS.md`, and the safety/privacy invariants in `AGENTS.md`.
3. Resolve screen inventory, route/state mapping, all Arabic/English copy, component inventory,
   responsive/native behavior, typography assets, loading/error/empty/offline states, and reduced
   motion before changing runtime files.
4. Update `DESIGN.md` from provisional to approved executable design truth and update the Feature
   003 plan/tasks with exact file boundaries.
5. Run Spec Kit consistency analysis and reserve implementation files in `TEAM_OWNERSHIP.md`.
6. Only then implement with focused tests and fresh Revision 2 evidence.

The canonical design-generation input is
[`GHAF_GOOGLE_STITCH_PROMPT_PACK.md`](GHAF_GOOGLE_STITCH_PROMPT_PACK.md). It is not itself approval
of generated screens.

## Non-negotiable exclusions

Do not build production authentication, real multi-family tenancy, payments or money custody, real
invitations, unrestricted Child chat, direct messaging, public profiles, location/school data,
continuous listening, real Child photo/voice processing, diagnosis, emotion/personality inference,
religious judgment, punitive loss, random rewards, Seed cash-out, or measured environmental-impact
claims.

Do not push, merge, deploy, commit, or rewrite history without explicit authorization.
