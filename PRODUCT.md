# Product

<!-- impeccable:product-schema 1 -->

## Status

| Item                    | Truth as of 2026-09-01                                                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product                 | Ghaf — غاف                                                                                                                                                  |
| Competition             | Khalifa University SMAC 2026                                                                                                                                |
| Official theme          | AI Adventures in Sustainability                                                                                                                             |
| Active product decision | Feature 003 Revision 2 — separately accessed Parent and Child experiences, Friendly League, and optional Family Rewards                                     |
| Current phase           | Revision 2 product and Spec Kit documents aligned; screen design and implementation are on hold until the approved Google Stitch frames arrive              |
| Implementation evidence | `NOT RUN` for Revision 2; no 2026-08-28 result carries forward to the revised screen, access, League, reward, voice, font, native, or human-review criteria |
| Primary platform        | Android-first; Arabic-first RTL with an equivalent English LTR experience                                                                                   |
| Prototype data          | Synthetic only                                                                                                                                              |

## Superseded Baseline

The deterministic ten-route Feature 003 implementation validated on 2026-08-28 remains an
explicitly superseded historical baseline. Its automated checks and Arabic/English web-proxy
journeys describe only that mounted build: `/role`, forced Parent–Child switching, the cooperative
`/circle` screen, no Family Reward, and the previous typography.

Revision 2 does not inherit those passes. It replaces the product architecture and adds new
acceptance surfaces. The old implementation must not be presented as evidence for separate access,
pairing, reauthentication, Friendly League fairness/privacy, Family Reward states, voice controls,
Alexandria/Readex rendering, the revised navigation, physical Android, or named human review. Do
not backport the redesign into Feature 002 or rewrite historical evidence.

No Revision 2 UI implementation should begin until the approved Stitch frames and their exported
design rules are available and the active Feature 003 specification, plan, and tasks are updated.

## Product Promise

> Ghaf helps children build positive routines through parent-approved tasks, child-safe AI
> support, Seeds, growing UAE landscapes, friendly family competition, and optional parent-funded
> rewards.

Ghaf is an autonomy-supportive family routine tool, not an obedience, surveillance, diagnosis,
banking, or public social system. The Child chooses among approved tasks, may ask for help or a
smaller equivalent, and can succeed with permitted support. The Parent remains responsible for
assignment, confirmation, permissions, family membership, and any real-world reward promise.

## Four Separate Product Meanings

| Mechanism                             | Meaning                                                             | Persistence and visibility                                                                  |
| ------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Seeds — بذور**                      | Permanent symbolic personal growth earned after Parent confirmation | Never lost, transferred, bought, cashed out, or used to rank another Child                  |
| **Weekly Growth Score**               | Friendly League score from five confirmed Challenge Leaves          | Resets weekly; maximum 100; does not change permanent Seeds or trees                        |
| **Family canopy — مظلة العائلة**      | Cooperative growth from confirmed eligible participation            | Shared goal without exposing another Child's task, evidence, accommodations, or money       |
| **Family Reward — المكافأة العائلية** | Optional private milestone promise selected and funded by a Parent  | Visible only to that Child and guardians; fulfilled outside Ghaf; never tied to League rank |

These meanings must never collapse into one currency. A Child cannot buy rank, convert a Seed to a
fixed AED amount, or lose garden progress when the weekly League resets.

## Users and Access

- **Child, ages 6–14:** enters a protected Child experience without an email or phone number,
  chooses Parent-approved tasks, uses bounded task help, sees personal growth and a fair weekly
  League, and may receive a private Family Reward promise.
- **Parent or guardian:** enters a separately protected Parent experience, manages the household,
  approves tasks twice, confirms work, chooses private rewards, manages League membership, and
  controls Child AI/media permissions.
- **Invite-only family participants:** synthetic siblings and cousins appear in P0 through
  nicknames and tree avatars only. There is no public discovery or unrestricted communication.
- **Demo operator:** uses deterministic synthetic access, pairing, reauthentication, data, media,
  and reset states without claiming production security.
- **SMAC judge:** should understand the Parent → Child → confirmation → praise → permanent growth,
  weekly League, and optional private reward separation in one reliable journey.

### Separate access experiences

Parent and Child are not visual modes behind a role toggle.

- **Parent access target:** email or phone sign-in, followed by a Parent PIN, passkey, or biometric
  gate. Reauthentication appears before changing monetary rewards, trusted family membership,
  paired devices, or Child media permissions.
- **Child access target on a shared device:** select a Parent-created nickname and tree avatar, then
  enter a Child PIN or picture sequence.
- **Child access target on a separate device:** scan a family QR code or enter a short pairing code;
  the Parent must approve the device before Child access succeeds.
- Children never need an email address or phone number and cannot reveal Parent controls through a
  bottom tab or simple mode switch.

Every P0 credential, account, biometric prompt, QR image, pairing code, approval, revocation, and
reauthentication event is a deterministic synthetic simulation. It demonstrates product boundaries,
not identity verification, encryption, tenancy, or production access control.

## Revised Screen Architecture

Revision 2 uses approximately fourteen screen families. Each authenticated role sees only the
surfaces needed for that role.

|   # | Screen family                               | Role and purpose                                                                                            |
| --: | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
|   1 | Welcome and access                          | Language choice, product promise, Parent entry, Child entry, and synthetic-demo disclosure                  |
|   2 | Parent access and household setup           | Parent sign-in, verification, protected return, family creation, and first Child setup                      |
|   3 | Child access and device pairing             | Avatar/PIN or picture access, QR/code pairing, Parent approval, and safe recovery states                    |
|   4 | Parent Home                                 | Family canopy, prioritized check-ins, next approved tasks, and bounded weekly Guide summary                 |
|   5 | Parent Tasks and guided Task Builder        | Task hub plus one three-stage Choose → Adjust → Review family; no separate review route is required         |
|   6 | Parent Check-in                             | Evidence review, specific praise, confirm, kind retry, smaller task, or safe equivalent                     |
|   7 | Parent Garden                               | Household and private Child landscape views without winner/loser sibling comparison                         |
|   8 | Parent Family and League management         | Household profiles, five weekly Challenge Leaves per Child, invitations, privacy, and cooperative goal      |
|   9 | Parent Family Rewards                       | Private plans, monthly maximum promised amount, reauthentication, and Promised/Unlocked/Given states        |
|  10 | Child Today                                 | Two or three approved choices, current Challenge Leaves, private growth, and dignified smaller-task request |
|  11 | Child Task and Ghaf Coach                   | Definition of done, safe steps, bounded AI actions, simulated push-to-talk, and submission                  |
|  12 | Child Garden                                | Permanent landscapes plus temporary praise-first growth and private reward-unlock states                    |
|  13 | Child Friendly League                       | Invite-only standings, tied ranks, prepared encouragement, and shared family-canopy goal                    |
|  14 | Profile, settings, permissions, and devices | Role-appropriate settings behind the avatar; Parent controls remain unavailable to the Child                |

Parent primary navigation is **Home, Tasks, Garden, Family**. Child primary navigation is **Today,
Garden, League**. Task Builder, Check-in, Family Reward, pairing, permissions, device management,
and settings are contextual. Ghaf Coach stays inside the current task; it is never a chat tab.

## Core Family Loop

1. The Parent enters the protected Parent experience and approves or creates a safe task.
2. The Parent may ask Ghaf Guide to clarify, shorten, or safety-check wording, but accepts the exact
   result before assignment.
3. The Child enters the separate Child experience, chooses an approved task, and may request help,
   a smaller task, or a safe equivalent.
4. The Child may use the bounded Ghaf Coach for steps, an if–then cue, a curated phrase, or the
   prominent **Ask an adult — اسأل شخصًا كبيرًا** path.
5. Submission changes no Seed, landscape, canopy, League, or Family Reward state.
6. The Parent reviews the observable submission and confirms once, requests a kind retry, accepts
   an agreed equivalent, or makes future work smaller.
7. Confirmation shows specific Parent praise first, then the displayed Seed award and permanent
   eligible garden/canopy growth.
8. If the task was one of that Child's five nominated Challenge Leaves, it also adds one confirmed
   Leaf and 20 weekly Growth Score points. If an independent private Family Reward milestone is
   reached, the Child sees its unlock only after praise and garden growth.

Parent confirmation does not prove environmental impact. Duplicate confirmation is idempotent and
changes nothing.

## Seeds and Permanent Garden Growth

Seeds remain symbolic, nonfinancial, nontransferable personal progress. They cannot be bought,
cashed out, traded, deducted, or shown as another Child's rank.

| Task shape                                       | Suggested Seed award |
| ------------------------------------------------ | -------------------: |
| Tiny Parent-agreed task, roughly 1–3 minutes     |                    4 |
| Short routine, roughly 5 minutes                 |                    6 |
| Standard task, roughly 5–15 minutes              |                    8 |
| Multi-step responsibility, roughly 15–30 minutes |                   12 |
| Parent-approved family project                   |           15 maximum |

An accepted task completed with permitted help earns the displayed award. Only a smaller task
agreed before acceptance may display a smaller award. No bonus is awarded for speed, perfection,
obedience, food consumption, affection, prayer validity, emotional disclosure, or keeping a secret.

Each task still declares `standard`, `fade-first`, or `recognition-only`:

- **standard:** finite acquisition work may earn the displayed Seeds after confirmation;
- **fade-first:** a recurrent acquisition routine may earn the displayed Seeds, then prompts a
  Parent review after three confirmed completions; no phase changes automatically; and
- **recognition-only:** specific Parent acknowledgement only, with no Seed transaction, persistent
  landscape/canopy growth, League Leaf, or circle event.

Maintenance earns no new Seed or persistent garden/canopy growth. Earned Seeds and tree stages are
permanent. A missed day, rest week, retry, access need, illness, travel, or League reset never creates
debt, breaks a punitive streak, or makes a tree die.

## Ghaf Family League

The Friendly League introduces visible competition while normalizing opportunity across age,
ability, task difficulty, and available support.

### Weekly score

Each participating Child receives exactly five Parent-approved, age-appropriate **Challenge Leaves
— أوراق التحدي** at the beginning of the week.

`Weekly Growth Score = confirmed Challenge Leaves ÷ 5 × 100`

Each confirmed Leaf is therefore worth 20 points and the maximum is 100. Extra tasks may earn Seeds
and grow a landscape, but cannot improve rank. Challenge Leaves are opportunities, not another
currency.

### Fairness, dignity, and privacy rules

- League membership is guardian-managed and invite-only for siblings and cousins. Child
  participation must support assent, pause, opt-out, and a no-penalty rest week.
- The Parent nominates five eligible tasks for each Child before the week begins. Tasks may differ
  by age, ability, schedule, and permitted help.
- Completing with help or an accessibility adaptation earns full Leaf credit. A different-sized
  equivalent agreed before acceptance also earns its nominated Leaf.
- Ties share the same position. Speed, evidence quantity, raw Seeds, task difficulty, money, age,
  and extra tasks are never tiebreakers.
- Rankings reset weekly; earned Seeds and landscape stages do not reset.
- Prayer, affection, emotional disclosure, relationship closeness, eating, private wellbeing,
  hygiene, disability-related routines, and `recognition-only` tasks cannot become Challenge
  Leaves.
- A participant sees only nickname, safe tree avatar, shared position, score, and completed Leaves.
  Another Child's task, evidence, age, schedule, accommodations, praise, private notes, Seed total,
  and Family Reward are never shown.
- Prepared bilingual encouragement such as **Great growing!** may be sent without free text. There
  are no reaction counts, pile-ons, public comments, direct messages, or engagement pressure.
- Every confirmed Challenge Leaf also advances a cooperative family-canopy goal so ranking is
  balanced with a shared result.

`leagueEligible` is separate from `visibilityScope` and `circleEligible`. The existing
`circleEligible` invariant still permits only a household-visible Green Impact event to enter a
coarse cross-household environmental activity projection. League participants never receive the
underlying event or task record.

## Family Reward — المكافأة العائلية

A Family Reward is an optional, private promise made and funded by a Parent. It may be money, a
family experience, a privilege, or a gift. Ghaf records the promise and milestone; it does not
transfer, store, custody, redeem, settle, or guarantee the real-world reward.

Supported personal milestones include:

- earning a Parent-selected number of **new eligible Seeds** after the plan begins;
- growing one named landscape from one stage to a later stage; or
- growing a Parent-selected number of different landscapes to a named stage.

Every contribution is evaluated from the immutable Parent-approved task version before
confirmation. Unknown, recognition-only, sensitive/private, and basic-needs activity contributes
zero Family Reward progress even when it may still receive appropriate praise or symbolic garden
growth. Seed milestones sum only explicitly eligible Seed transactions. Landscape milestones use
an eligible-provenance stage derived from eligible confirmations, never the displayed landscape
stage alone.

Example: **Earn 120 new eligible Seeds → AED 25**. There is no universal Seed-to-AED exchange rate.
The Parent chooses a reward within their circumstances and sees the maximum amount promised for the
current month before saving another monetary plan.

### Family Reward rules

- States are `Promised → Unlocked → Given`.
- The amount and plan are visible only to the selected Child and guardians; money never appears in
  League standings, another Child's view, or shared family reactions.
- A Child can unlock their own plan regardless of League position. Finishing first never unlocks
  money.
- A Parent reauthenticates before creating or changing a monetary promise.
- The target, reward, and eligibility terms are explicit when promised. A Parent may change or end
  a future plan prospectively, but cannot retroactively move an agreed milestone or remove an
  unlocked reward as punishment.
- Specific praise and garden growth appear before any reward-progress or unlock message.
- Basic needs and essential access—including food, water, clothing, safe shelter, sleep,
  healthcare, education, transport, family contact, affection, and ordinary religious
  participation—can never be made conditional on a Family Reward.
- Prayer, affection, emotional disclosure, eating, body measures, demonstrating love, and private
  wellbeing or disability-related activity cannot be monetized.
- Families may disable monetary rewards, choose a nonmonetary plan, pause future plans, or use Seeds
  and garden growth without any Family Reward.

## UAE Living Landscape

The garden is an imaginative map of UAE landscapes, not a claim that every species shares one
physical habitat or that a real tree was planted.

| Landscape             | Task categories                           | Product meaning                              |
| --------------------- | ----------------------------------------- | -------------------------------------------- |
| Ghaf desert grove     | Roots & Kinship; Heritage & Etiquette     | connection, family memory, and welcome       |
| Samar desert grove    | Home Responsibility; Kindness & Community | dependable contribution                      |
| Sidr reflection grove | Learning & Wellbeing; Faith & Gratitude   | daily growth and private reflection          |
| Date-palm oasis       | Food & Hospitality                        | food care, welcome, and shared meals         |
| Mangrove coast        | Green Impact                              | waste, water, energy, reuse, and stewardship |

Growth stages remain **Seed → Shoot → Sapling → Shade → Flourishing**. The flagship Ghaf is the brand
hero and household-canopy silhouette. Growth is permanent and symbolic; only a Parent-confirmed,
approved method may support a separately labeled self-reported activity metric.

## AI Experiences

### Ghaf Coach for the Child

The Coach is embedded in the current Parent-approved task. It may simplify the task, show steps,
create an if–then cue, rehearse a curated phrase, respond to a prepared synthetic fixture, offer one
optional skippable task-focused reflection, or direct the Child to an adult. It identifies itself as
AI and says it may be wrong.

| Age band | Default communication and input                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------- |
| 6–8      | Slower prepared voice, one very short instruction at a time, curated intents only, and an early Ask an adult action |
| 9–11     | Two or three steps, a friendly explanation, quick-choice responses, and structured/template input                   |
| 12–14    | Respectful concise language, guardian-enabled bounded text or voice controls, and no babyish tone                   |

No band receives unrestricted chat. The Coach never asks for secrets or exclusivity, encourages
dependence, diagnoses, infers emotion/personality, recognizes faces, judges truthfulness or faith,
acts as a therapist/friend/religious authority, or continues listening in the background.

P0 push-to-talk is a prepared simulation using synthetic audio/transcript fixtures. The target UI
shows a deliberate press action, visible recording state, transcript, delete-before-send, replay,
captions, slower playback, and clear Parent visibility while keeping the task and **Ask an adult**
action present. It does not capture or process a real Child's voice.

### Ghaf Guide for the Parent

The Guide may suggest curated tasks, clearer positive wording, smaller steps, safety questions,
specific praise, and neutral time-bounded summaries. The Parent sees original and suggested wording
and must accept a change explicitly.

It must never output normal/abnormal, lazy/defiant, a diagnosis, ADHD or another condition, an
emotion/risk/personality score, a parenting-quality judgment, or a religious judgment. It does not
decide assignment, completion, League eligibility, or Family Reward entitlement.

## Arabic, English, Voice, and Typography

- Arabic is the starting locale and uses true page-level RTL. English is a matched LTR localization;
  ordinary screens do not display both languages on every control.
- Use clear Modern Standard Arabic for requirements, safety, privacy, money terms, and sensitive
  content. A light Parent-approved Emirati/Gulf conversational register may be used for greetings
  and encouragement only after named local review.
- The bounded Coach may recognize prepared Arabic-English code-switch examples, but P0 does not
  claim general speech understanding.
- Do not use exaggerated dialect, invented cultural phrases, or AI religious rulings. Emirati
  parents, children, Arabic specialists, and relevant cultural/religious reviewers must approve the
  final phrase and voice library.
- Use **Alexandria** for display headings, garden names, and milestone moments, and **Readex Pro** for
  body copy, controls, tasks, AI dialogue, settings, rewards, and League data in both languages.
- Arabic requires generous line height, readable weights, no artificial letter spacing, and no
  clipped diacritics. Mixed content such as `AED 25`, `١٢٠ بذرة`, dates, and names needs explicit
  bidirectional handling.
- Rankings, Seeds, and reward amounts use tabular numerals. Font scaling must preserve labels,
  buttons, touch targets, and reading order.

| Element      |                Child mode |           Parent mode |
| ------------ | ------------------------: | --------------------: |
| Hero heading |     Alexandria 800, 32/44 | Alexandria 700, 30/42 |
| Screen title |     Alexandria 700, 26/38 | Alexandria 700, 24/36 |
| Arabic body  | Readex Pro 400–500, 18/30 | Readex Pro 400, 17/28 |
| Button       |     Readex Pro 600, 17/26 | Readex Pro 600, 16/24 |
| Caption      |             Minimum 14/22 |         Minimum 14/22 |

## Revision 2 P0 Design Contract

The next approved designs must preserve one deterministic vertical slice with:

- one synthetic household, Salem and Alya, and seeded invite-only cousin League participants;
- separate synthetic Parent and Child entry, one shared-device Child PIN path, one separate-device
  pairing path, and one Parent reauthentication state;
- Parent navigation Home/Tasks/Garden/Family and Child navigation Today/Garden/League;
- eight curated task categories and five UAE landscape tracks from local fixtures;
- one executable Parent-approved Green Impact task with bounded Guide and Coach states;
- Parent check-in, specific praise, an idempotent fixed 12-Seed award, landscape growth, one canopy
  leaf, one Challenge Leaf, and independent private Family Reward progress/unlock;
- a seeded five-Leaf Friendly League week with a tie, shared canopy target, privacy explanation,
  rest/opt-out state, and prepared bilingual encouragement;
- one private Parent-funded plan showing Promised, Unlocked, and Given, plus the monthly maximum
  promised amount and non-custodial disclosure;
- prepared synthetic media and simulated push-to-talk with visible origin labels;
- Arabic-first RTL and matched English LTR using Alexandria and Readex Pro; and
- one Parent-only deterministic reset that restores access, task, League, garden, and reward state
  without a remote service.

The Stitch frames must be reviewed before routes, component inventory, transitions, or exact layout
are frozen. Until then, design, implementation, Android, accessibility, and human-review statuses
remain `NOT RUN` or `BLOCKED` as their evidence warrants.

## Explicit Non-Goals for P0

- production authentication, identity verification, passkeys, biometrics, QR scanning, secure
  pairing, encrypted tenancy, or real family accounts;
- networking, real invitations, public discovery, global leaderboards, open profiles, comments,
  free-text messaging, direct Child contact, or reaction counts;
- wallet balances, payments, money custody, transfers, withdrawal, universal Seed conversion,
  gift-card fulfillment, paid boosts, wagers, or winner-take-all prizes;
- real Child photo/voice capture or processing, continuous listening, face/voice identification,
  emotion recognition, or unrestricted Child AI;
- diagnosis, developmental screening, religious rulings, or automated safety/completion/reward
  decisions;
- real-tree planting or fabricated carbon, water, waste, food, or environmental-impact numbers;
- production notifications, analytics, moderation, monitoring, compliance claims, or store release;
  and
- a second app, 3D world, or backend that can delay the deterministic offline competition path.
