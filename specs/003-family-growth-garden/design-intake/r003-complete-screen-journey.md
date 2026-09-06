# R003 Complete Screen Journey

**Authority date**: 2026-09-05

**Status**: Approved for local prototype implementation. Physical Android and named human review
remain evidence gates.

The 2026-09-06 Parent sign-up correction extends the current source manifest from 36 to 37 product
routes. It is an R003 code-native usability addition, not a rewrite of the frozen R001 route count
or approval for production accounts or a second household.

## Visual inheritance

New screens use the existing Ghaf Soft Geometric system: warm ivory surfaces, deep forest and Ghaf
emerald structure, mangrove teal for secondary environmental meaning, restrained date-gold status,
Alexandria display roles, Readex Pro body/control/data roles, logical RTL/LTR layout, 48dp minimum
targets, flat tonal groups, and botanical geometry from the existing native component set. Raw
Stitch HTML, CSS, JavaScript, rasterized interface text, and unknown-provenance art are not runtime
inputs.

## Canonical route and state manifest

| Sequence | Surface                                    | Route/state owner                                            | Entry                                   | Required exit                                                           |
| -------: | ------------------------------------------ | ------------------------------------------------------------ | --------------------------------------- | ----------------------------------------------------------------------- |
|        1 | Welcome, language, capability disclosure   | `/`                                                          | cold start or sign-out                  | Parent sign-in or Child profile access                                  |
|       2P | Returning Parent sign-in and verification  | `/access/parent/sign-in`, `/access/parent/verification`      | Welcome                                 | Parent Home, or first-family setup when no completion receipt exists     |
|       2N | New-family sign-up and verification        | `/access/parent/sign-up`, `/access/parent/verification`      | Create Family on Parent sign-in          | verified first-family fixture                                           |
|       3P | First-family setup and success             | existing four `/access/parent/**` setup routes               | verified new Parent fixture             | Parent Home with replaced history                                       |
|       2C | Choose Child profile                       | `/access/child`                                              | Welcome                                 | selected profile credential                                             |
|       3C | PIN or accessible picture sequence         | `/access/child/pin`                                          | selected profile                        | Child Today or Pair Device                                              |
|       4C | Pair Device, Parent approval, success      | `/access/child/pair`, route-owned waiting and success states | credential fallback or explicit pairing | Child Today                                                             |
|       5P | Parent Home                                | `/parent`                                                    | authorized Parent session               | Home, Tasks, Garden, or Family                                          |
|       6P | Parent Tasks and contextual Builder/review | existing Parent task routes                                  | Parent navigation or next action        | approved assignment or Parent Home                                      |
|       7C | Child Today and task execution             | existing `/child` and `/child/task`                          | Child credential/session                | submission waiting state                                                |
|       8P | Parent check-in, praise, recognition       | existing `/parent/check-in`                                  | submitted task                          | Child reveal handoff or Garden                                          |
|       9C | Combined result reveal                     | existing `/child/reveal/:bundleId`                           | committed receipt bundle                | Today, Garden, Path, or badge context                                   |
|      10P | Parent Garden                              | `/garden` in Parent role                                     | Parent navigation                       | Home, Tasks, Garden, Family, or Shared Garden                           |
|      10C | Child Garden, Path, badges, learning       | existing Garden nested routes                                | Child navigation                        | Today, Garden, or League                                                |
|      11C | Private Family League                      | `/league`                                                    | Child navigation                        | Today, Garden, or League                                                |
|      11P | Family overview                            | `/parent/family`                                             | Parent navigation                       | selected-Child progress, Reward Plan, access controls, or shared garden |
|      12P | Private Family Reward                      | `/parent/family/reward`                                      | Family overview                         | Family overview; `given` only after `unlocked`                          |
|      13P | Parent settings                            | `/parent/settings`                                           | Parent header                           | permissions, paired devices, reset, language, or sign-out               |
|      14P | Child permissions                          | `/parent/settings/permissions`                               | Parent settings                         | saved local grants or settings                                          |
|      15P | Paired devices                             | `/parent/settings/devices`                                   | Parent settings or pairing              | revoke synthetic pairing or settings                                    |
|      16P | Reauthentication                           | `/parent/reauthenticate` with typed purpose/return target    | protected Parent action                 | exactly one permitted return target                                     |
|      13C | Child settings and own permission view     | `/child/settings`                                            | Child header/help                       | Today or sign-out; no edit authority                                    |

## Navigation contract

- Parent bottom navigation is exactly Home, Tasks, Garden, Family.
- Child bottom navigation is exactly Today, Garden, League.
- Impact Path, Badges, Learning, Shared Growth, Rewards, settings, permissions, devices, and
  reauthentication are contextual destinations, never additional bottom tabs.
- There is no normal in-app Parent/Child role toggle. A role change signs the current experience
  out to `/`, then requires its own deterministic access path.
- Parent sign-in presents returning access first. **Create a new family** navigates to
  `/access/parent/sign-up` without requesting a code; sign-up requests the existing deterministic
  code only from its primary action. Verification Back/cancel restores sign-up only for the closed
  `create-family` marker and never follows an arbitrary return path.
- `/role` is compatibility-only and redirects to `/`; it does not grant a role or expose private
  content.
- `/league` is a preserved canonical Child destination and remains reachable without enabling any
  optional R002b presentation flag.
- Invalid deep links fall back to the active role's safe root, or `/` when no matching access is
  active.

## State and privacy contract

- Child credentials and pairing are visibly synthetic local simulations, expire/reject safely,
  and never claim production authentication.
- Parent-only screens never render from a Child role. Child permissions are read-only in the Child
  experience. Family Reward amounts and lifecycle are private to the relevant Child and guardians.
- P0 contains one synthetic household. A completed onboarding receipt cannot be rewritten, and the
  sign-up route must not imply that a second household or production account can be created.
- Family Reward, League, lifetime Seeds, current landscape growth, and canopy remain separate
  authorities even when the fixture advances them during one recognition.
- A screen reads selectors and invokes domain/store actions; it never calculates an unlock, Seed
  award, League position, badge, or Garden transition.
- Reset remains Parent-authorized and returns to signed-out Arabic-first `/` without remote
  services.

## Evidence boundary

Completion requires source/tests, bilingual web walkthroughs at the representative phone viewport,
route-flow checks, reset replay, and production export. These do not pass physical Android,
TalkBack, native Back/IME, OS font scaling, real offline/device permissions, or named Arabic,
cultural, safeguarding, privacy, sustainability, accessibility, and visual reviews.

All R002b presentation flags remain independently default-off. A browser walkthrough may use
explicit environment `true` values to inspect those candidates, but that evidence does not activate
them by default or release them.

## Code-native Parent sign-up candidate

`/access/parent/sign-up` inherits the approved Soft Geometric access composition: organic pearl
ground, a 64dp tonal family icon plate, centered Alexandria Parent heading, centered concise Readex
orientation copy, one logical-start phone/email field, one full-width filled emerald continuation,
one compact centered returning-family prompt, and one full-width emerald outlined sign-in action.
The field retains automatic bidi handling; both actions retain the shared regular control height
and radius. The content remains keyboard-aware and naturally scrollable at compact height and high
font scale. A fixed disclosure may identify the local synthetic origin, but no copy may claim that
a real message, account, identity verification, or additional household was created.
