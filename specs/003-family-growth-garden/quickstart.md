# Quickstart and Verification Guide: Family Growth Garden — Revision 2

**Date**: 2026-09-01

**Current use**: Documentation consistency and Google Stitch design intake.

**Implementation status**: **BLOCKED**. Do not run or present the current Revision 1 app as the
Revision 2 product. Do not change routes, source, tests, assets, fonts, or dependencies until the
user supplies and approves the new Stitch frames.

## 1. Establish the Evidence Boundary

Before review, record:

- worktree state;
- Feature 003 artifact revision (`Revision 2`, approved 2026-09-01);
- Stitch frame/export identifier, or `NOT SUPPLIED`;
- reviewer and date; and
- evidence class: documentation, design, automated, web, Android, or human.

Revision 1's tests, ten-route walkthrough, screenshots, and web evidence are historical only.

## 2. Validate the Documentation Baseline

From the repository root, use read-only or formatting-safe checks:

```bash
git status --short
git diff --check
rg -n "Revision 2|2026-09-01|BLOCKED|Challenge Leaves|Family Reward" \
  .specify/memory/constitution.md specs/003-family-growth-garden
rg -n "production authentication|wallet|Seed-to-AED|speed tiebreak" \
  specs/003-family-growth-garden
```

Expected result:

- Revision 2 is the active target and Revision 1 is labeled historical;
- implementation is blocked on Stitch;
- the five-Leaf formula, tied positions, private noncustodial reward, synthetic access, prepared
  voice, and Alexandria/Readex requirements are present; and
- no artifact claims Revision 2 runtime, Android, or human validation has passed.

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

Preserve the original Stitch files/links and note which direction the user selected. Do not create
an inferred frame to hide a missing state.

## 4. Screen-Family Coverage Gate

The inventory must cover:

- Welcome/access;
- Parent sign-in/setup and Child access/pairing;
- Parent Home, Tasks, three-stage Task Builder, Check-in, Garden, Family/League management, and
  Family Rewards;
- Child Today, Task/Coach, Garden/celebration/reward unlock, and League;
- Parent/Child settings, permissions, device states, and sensitive reauthentication;
- loading, offline, wrong/expired access, pending pairing, permission denied, AI unavailable,
  pending confirmation, duplicate confirmation, tied League, rest week, completed week,
  no-reward, unlocked, and Given states.

Persistent navigation must be exactly Parent Home/Tasks/Garden/Family and Child
Today/Garden/League. No ordinary frame may contain a role toggle or cross-role tab.

## 5. Product-Contract Review on the Frames

Verify the frames make these meanings distinct:

| System              | Must communicate                                                         |
| ------------------- | ------------------------------------------------------------------------ |
| Seeds/garden        | Permanent personal symbolic growth                                       |
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

Any font-asset/package decision remains unapproved until the selected frames and existing
dependency policy are reconciled.

## 7. Exact State-Oracles to Map

The design inventory and later implementation must represent the canonical reset and one-confirm
oracles from `data-model.md` and `acceptance-contract.md`:

- reset: Arabic RTL signed-out access; Salem 4/5 = 80; Mangrove 48/60 Shoot; canopy 19/25;
  reward 108/120 AED 25 Promised;
- confirmation: praise → 12 Seeds → 60/60 Sapling → canopy 20/25 → Salem 5/5 = 100 → reward
  120/120 Unlocked → private unlock message; and
- standings: Salem and Mariam position 1, Alya position 3, Rashid position 4.

Duplicate confirmation must have a neutral no-op state. Weekly rollover resets Leaves/scores only.

## 8. Reconcile Artifacts Before Implementation

After the frame audit passes:

1. update root `DESIGN.md` and `DESIGN_DIRECTION.md` with the selected Stitch system;
2. freeze exact routes, states, components, and font/asset loading in `plan.md`;
3. update `data-model.md` only for frame-driven state decisions that do not weaken the spec;
4. reconcile all three files under `contracts/` and update this guide with exact navigable paths;
5. replace provisional T111+ future tasks with exact file paths and dependencies in `tasks.md`;
6. run cross-artifact analysis and resolve every P0 conflict; and
7. record an explicit integration-owner release of the implementation block.

If any step fails, implementation remains `BLOCKED`.

## 9. Future Runtime Verification — Not Yet Run

Only after the gate is released and Revision 2 is implemented:

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
```

Also verify synthetic access isolation, exact five-Leaf scoring/ties, privacy-before-projection,
reward state/version/monthly maximum, praise-first ordering, prepared voice with no permissions,
Arabic/English parity, exact reset, and external-service-denied completion.

Web may support visual debugging but cannot pass physical Android RTL, keyboard, Back, media,
permissions, reduced motion, screen reader, font scaling, physical touch, or named-human review.

## 10. Handoff Status

Until approved Stitch frames arrive:

- documentation baseline: aligned and reviewed on 2026-09-01;
- exact route/design/component plan: `BLOCKED`;
- Revision 2 implementation and automated evidence: `NOT RUN`;
- physical Android: `BLOCKED`;
- named Arabic/UAE, safeguarding, reward-ethics, accessibility, sustainability, and comprehension
  reviews: `NOT RUN`.
