# Quickstart and Verification Guide: Family Growth Garden — Revision 3 Planning

**Date**: 2026-09-03

**Current use**: Documentation consistency and Google Stitch design intake.

**Implementation status**: R001 is **PARTIALLY RELEASED** for Welcome and first-time Parent
onboarding. Growth Journey and its prerequisite later Parent/Child surfaces are **BLOCKED**. Do not
change their routes, source, tests, assets, or dependencies until the user supplies and approves a
complete new Stitch release and the integration owner records its gate.

## 1. Establish the Evidence Boundary

Before review, record:

- worktree state;
- Feature 003 artifact revision (`Revision 3 planning`, amended 2026-09-03);
- runtime release boundary (`ghaf-r001` Batch 1 only);
- Stitch frame/export identifier, or `NOT SUPPLIED`;
- reviewer and date; and
- evidence class: documentation, design, automated, web, Android, or human.

Revision 1's tests, ten-route walkthrough, screenshots, and web evidence are historical only.
Direct R001 evidence applies only to its seven released screens. All Growth Journey automated,
web, Android, accessibility, and human-review evidence starts `NOT RUN` or `BLOCKED`.

## 2. Validate the Documentation Baseline

From the repository root, use read-only or formatting-safe checks:

```bash
git status --short
git diff --check
rg -n "Revision 3|2026-09-03|BLOCKED|Impact Path|RevealBundle" \
  .specify/memory/constitution.md specs/003-family-growth-garden
rg -n "production authentication|wallet|Seed-to-AED|speed tiebreak|exactly 16" \
  specs/003-family-growth-garden
```

Expected result:

- Revision 3 planning is the active target and Revision 1 is labeled historical;
- R001 is described as a bounded partial implementation while Growth runtime is blocked on Stitch;
- the five-Leaf formula, tied positions, private noncustodial reward, synthetic access, prepared
  voice, Alexandria/Readex, one Seed-derived Path, exactly 16 badges, zero-Seed learning, and one
  RevealBundle are present; and
- no artifact claims Growth runtime, Android, or human validation has passed.

## 3. Receive the Stitch Handoff

When the user supplies designs, do not begin implementation immediately. First create an inventory
with one row per frame/state containing:

| Field                | Required value                                                                 |
| -------------------- | ------------------------------------------------------------------------------ |
| Frame ID/name        | Exact Stitch identifier                                                        |
| Role                 | Parent, Child, shared access, or contextual protected state                    |
| Locale/direction     | Arabic RTL first; matched English LTR                                          |
| Screen family        | One of the families in `spec.md`                                               |
| Entry/exit           | Trigger, primary action, Back behavior                                         |
| Data/state           | Reset, pending, success, error, offline, duplicate, permission, or empty state |
| Privacy              | Audience and excluded fields                                                   |
| Accessibility        | order, target sizes, scaling, contrast, reduced motion                         |
| Design tokens/assets | font, color, spacing, radius, icon, illustration, motion references            |
| Source/review        | factual, Arabic/UAE cultural, safeguarding, accessibility, rights status       |

Preserve the original Stitch files/links and note which direction the user selected. Do not create
an inferred frame to hide a missing state. For every runtime surface require a canonical Arabic
PNG, a matched English LTR frame, `screen-spec.md`, material state PNGs, and any exported HTML only
as non-runtime measurement/structure guidance. Preserve original asset files and record their
provenance and rights status.

## 4. Screen-Family Coverage Gate

The inventory must cover:

- Welcome/access;
- Parent sign-in/setup and Child access/pairing;
- Parent Home, Tasks, three-stage Task Builder, Check-in, Garden, Family/League management, and
  Family Rewards;
- Child Today, Task/Coach, Garden/celebration/reward unlock, and League;
- Parent/Child settings, permissions, device states, and sensitive reauthentication;
- native system launch asset; brief Opening Moment; exactly three role-neutral introduction panels;
  and explicit handoff to the released R001 `/`;
- complete Child Today and Garden origins; Impact Path; My Badges; Badge Detail; combined
  RevealBundle; Mangrove story; equal-credit accessible/Parent-guided learning; and Parent
  selected-Child Progress & Achievements;
- the prerequisite Child access/result handoff, Parent Check-in confirmation, and Parent
  selected-Child origin rather than isolated nested screens;
- loading, offline, wrong/expired access, pending pairing, permission denied, AI unavailable,
  pending confirmation, duplicate confirmation, tied League, rest week, completed week,
  no-reward, unlocked, and Given states.

Persistent navigation must be exactly Parent Home/Tasks/Garden/Family and Child
Today/Garden/League. Impact Path and My Badges are nested Garden destinations, never a fourth Child
tab. No ordinary frame may contain a role toggle or cross-role tab.

The Growth state matrix additionally covers first install/return/resume/update/corrupt preference,
Skip/Back/manual replay/deferred deep link, Path current/next/reached/completed/archive, every badge
state and source row, pending/recovered/seen/no-unlock reveals, learning retry and equivalent route,
and Salem/Alya/new-Child profile isolation.

## 5. Product-Contract Review on the Frames

Verify the frames make these meanings distinct:

| System              | Must communicate                                                         |
| ------------------- | ------------------------------------------------------------------------ |
| Seeds/garden        | Permanent personal symbolic growth                                       |
| Impact Path         | Private projection of confirmed lifetime Seeds; not another currency     |
| Badges/mastery      | Permanent private criteria backed by explicit evidence; no rarity/status |
| Learning/activity   | Finite equal-credit completion; zero Seeds and garden growth             |
| Weekly Growth Score | Five normalized opportunities, maximum 100, weekly reset                 |
| Family canopy       | Cooperative contribution from confirmed Challenge Leaves                 |
| Family Reward       | Private Parent promise delivered outside app; no wallet/payment/exchange |

Family Reward progress must be visibly tied to explicitly eligible confirmations. A displayed
landscape stage cannot by itself prove reward eligibility; unknown or prohibited provenance adds
zero.

Reject or return frames that show:

- money, raw Seeds, task details, evidence, age, accommodations, or speed in League;
- prayer, affection, emotional disclosure, eating, or private wellbeing as Challenge Leaves or
  Family Reward milestones;
- public discovery, free-text messaging, direct contact, paid boosts, or winner-take-all prizes;
- public badges, a paid path, rarity, artificial scarcity, randomized unlocks, or a second currency;
- visit/location proof, copied official art, or government/tourism/environmental endorsement;
- Child access to Parent reports, rewards, invitations, or permissions;
- reward unlock before praise and garden growth; or
- production-auth, payment, live voice, or measured-impact claims.

## 6. Arabic, Typography, and Accessibility Review

Arabic frames are reviewed before English variants. Confirm:

- true page-level RTL and logical navigation/progress direction;
- Alexandria for display and Readex Pro for body/control/dialogue/data;
- Child/Parent sizes and minimum 14/22 captions from `spec.md`;
- no artificial Arabic letter spacing or thin Arabic weights;
- correct mixed-direction `AED 25`, `١٢٠ بذرة`, names, dates, ranks, and scores;
- long Arabic labels and diacritics fit at 200% scale;
- at least 48dp targets, visible focus/selected/disabled states, logical screen-reader order,
  captions, and reduced-motion final states; and
- only one locale on ordinary controls.

R001 already uses its approved local Alexandria and Readex Pro integration. A later release may
reuse it; any font-package or token change still requires a measured need and explicit approval.

Compare each default PNG at 390×844, then verify 320×568, 360×800, 430×932, and the connected
SM_T835/tablet viewport. Test natural scrolling, keyboard/IME visibility, 100/130/200% text,
Arabic RTL, equivalent English LTR, long Arabic and mixed-script names, bidi values, TalkBack,
sheet focus restoration, offline behavior, native Back/deep links, and reduced motion.

## 7. Exact State-Oracles to Map

The design inventory and later implementation must represent the canonical reset and one-confirm
oracles from `data-model.md` and `acceptance-contract.md`:

- reset: Arabic RTL signed-out access; Salem 4/5 = 80; lifetime Seeds 108; no Water & Coast station
  receipt and next station 120; Mangrove 48/60 Shoot; canopy 19/25; Seed Start and Growing Branch
  already proven; sorting credit 0; and reward 108/120 AED 25 Promised;
- confirmation: praise → optional honestly labelled activity result → lifetime Seeds 120 →
  Mangrove 60/60 Sapling → canopy 20/25 → Salem 5/5 = 100 → Path 120/180, next 132 → Expanding
  Shade + Sorting Bud and four Gallery badges → optional safe-help recognition → reward 120/120
  Unlocked and private message last;
- station 132: Mangrove Roots can complete by story or equal-credit route, adds zero Seeds/garden,
  and cannot award Sorting Branch without provable earlier sorting credit; and
- standings: Salem and Mariam position 1, Alya position 3, Rashid position 4.

Duplicate confirmation must have a neutral no-op state and no second RevealBundle. Weekly rollover
resets Leaves/scores only. Station 180 changes a garden only when its independent landscape mapping
and provenance also qualify.

## 8. Reconcile Artifacts Before Implementation

After the frame audit passes:

1. update root `DESIGN.md` and `DESIGN_DIRECTION.md` with the selected Stitch system;
2. freeze exact routes, states, components, and font/asset loading in `plan.md`;
3. resolve the smallest versioned local-persistence seam and migration behavior in ADR 0002;
4. resolve release-consistent digit glyphs, the 132 sorting-credit provenance, station-180 garden
   provenance, and every named content-review status;
5. update `data-model.md` only for frame-driven state decisions that do not weaken the spec;
6. reconcile all three files under `contracts/` and update this guide with exact navigable paths;
7. refine T181+ with exact file paths and dependencies in `tasks.md`;
8. run cross-artifact analysis and resolve every P0 conflict; and
9. record an explicit integration-owner release of the implementation block.

If any step fails, implementation remains `BLOCKED`.

## 9. Future Runtime Verification — Not Yet Run

Only after the gate is released and the relevant Revision 2 foundations plus Revision 3 Growth
slice are implemented:

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
```

Also verify synthetic access isolation, exact five-Leaf scoring/ties, privacy-before-projection,
reward state/version/monthly maximum, praise-first ordering, prepared voice with no permissions,
Arabic/English parity, exact reset, external-service-denied completion, Path/badge evaluation,
zero-Seed learning, profile isolation, migration idempotency, RevealBundle recovery, and ordinary
restart versus explicit demo reset.

Web may support visual debugging but cannot pass physical Android RTL, keyboard, Back, media,
permissions, reduced motion, screen reader, font scaling, physical touch, or named-human review.

## 10. Handoff Status

Until approved Stitch frames arrive:

- Revision 3 product/domain documentation and Growth preflight: `PASSED` when the current amendment
  validation is recorded;
- R001 Welcome/Parent-onboarding runtime: `PARTIALLY RELEASED` under its existing gate;
- exact Growth route/design/component/persistence plan: `BLOCKED`;
- Growth implementation and automated/web evidence: `BLOCKED` / `NOT RUN`;
- physical Android Growth Journey: `NOT RUN`;
- named Arabic/UAE, safeguarding, reward-ethics, accessibility, sustainability, and comprehension
  reviews: `NOT RUN`.
