# Product

<!-- impeccable:product-schema 1 -->

## Status

| Item                      | Truth as of 2026-08-28                                                                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Product                   | Ghaf — غاف                                                                                                                               |
| Competition               | Khalifa University SMAC 2026                                                                                                             |
| Official theme            | AI Adventures in Sustainability                                                                                                          |
| Target feature            | Feature 003 — Family Growth Garden                                                                                                       |
| Decision                  | Deterministic P0 implemented; automated and bilingual web-proxy validation passed                                                        |
| Latest validated baseline | Feature 003: 17 files / 305 tests plus Arabic RTL and English LTR web-proxy journeys; physical Android and named human gates remain open |
| Primary platform          | Android; Arabic-first with equivalent English support                                                                                    |
| Prototype data            | Synthetic only                                                                                                                           |

Feature 003 supersedes the single food-rescue mission as the implemented product direction. Food
rescue remains one useful task family. Feature 002 evidence remains historical and must not be used
to pass any Feature 003 Android or human-review criterion.

## Product Promise

Ghaf helps UAE families turn age-appropriate daily responsibilities into positive routines. A
Parent creates or approves a clear task; a Child chooses, plans, completes, and may reflect; the Parent
recognizes the observable effort; and symbolic **Seeds — بذور** grow a shared UAE living landscape.

The product is not an obedience tracker. It is an autonomy-supportive family tool that makes
responsibility, sustainability, kinship, gratitude, hospitality, and heritage easier to practise
together.

## Users

- **Child, ages 6–14:** completes Parent-approved tasks, receives task coaching, and grows a private
  garden without public ranking.
- **Parent or guardian:** chooses tasks, adjusts difficulty, confirms completion, gives specific
  praise, and sees neutral summaries of observable patterns.
- **Family circle:** P0 previews a future invite-only cousin/family circle using synthetic local
  aggregates; no real invitations or cross-family connection exists.
- **SMAC judge:** should understand the AI value, reward logic, UAE grounding, sustainability
  contribution, and safety boundaries in one short live demo.

Age bands guide defaults rather than define ability:

| Band  | Default interaction                                                                                   |
| ----- | ----------------------------------------------------------------------------------------------------- |
| 6–8   | One to three short tasks, visual steps, immediate feedback, Parent co-use                             |
| 9–11  | Task ladders, if–then plans, choice of order, optional short reflection, structured AI coach          |
| 12–14 | Co-authored goals, longer horizons, more maintenance/recognition-only tasks, stronger privacy control |

Accessibility needs, neurodivergence, disability, family context, and Parent knowledge override an
age default. Completing a task with allowed help still counts.

## Core Family Loop

1. The Parent selects a child, a task category, and one specific positive behavior.
2. The Parent may ask Ghaf Guide to make the task clearer, safer, or age-appropriate.
3. The Child chooses from Parent-approved tasks and may create an if–then cue.
4. The Child opens the bounded Ghaf Coach for steps, phrase practice, or an ask-an-adult reminder.
5. The Child checks the definition of done, receives a neutral acknowledgement, and may add an
   optional reflection or optional prepared evidence.
6. The Parent confirms, returns it kindly for another try, or adjusts an unrealistic task.
7. For a reward-eligible task, prompt Parent approval produces descriptive praise and the fixed,
   previously displayed Seed award.
8. For an acquisition-phase rewarded task, the mapped landscape grows. The household canopy changes
   only when `visibilityScope` is `household`; the circle changes only for `circleEligible` Green
   Impact events after privacy filtering.

No in-app credit, recorded sustainability activity, or symbolic growth is recorded before Parent
confirmation. Confirmation does not establish environmental impact.

## Behavioral Design Contract

| Principle              | Product rule                                                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Positive reinforcement | Recognize the requested observable action promptly after confirmation.                                                                         |
| Descriptive praise     | Name the action, strategy, help-seeking, or improvement; never label the Child's character.                                                    |
| Autonomy               | Let the Child choose among Parent-approved tasks, order, cue, and a cosmetic garden detail.                                                    |
| Competence             | Keep the definition of done achievable; allow help, smaller steps, retry, or substitution.                                                     |
| Relatedness            | Connect the action to a real person, family value, household need, or shared goal.                                                             |
| Predictability         | Use fixed, visible rewards. No loot boxes, random jackpots, scarcity, or variable-ratio mechanics.                                             |
| Internalization        | Let the Parent move future reward-eligible completions from acquisition to zero-Seed maintenance while preserving praise, choice, and meaning. |
| Repair without shame   | A miss never removes earned Seeds, kills a tree, creates debt, or publicly marks failure.                                                      |
| Self-comparison        | Show progress against the Child's own goal. Family and circle views default to cooperation.                                                    |

See `RESEARCH_BASIS.md` for the evidence, caveats, age adaptations, and prohibited uses.

## Reward Economy

**Seeds — بذور** are symbolic, nonfinancial, nontransferable progress units. They cannot be bought,
cashed out, traded, lost, or deducted.

| Task shape                                       |  Suggested award |
| ------------------------------------------------ | ---------------: |
| Tiny Parent-agreed task, roughly 1–3 minutes     |          4 Seeds |
| Short routine, roughly 5 minutes                 |          6 Seeds |
| Standard task, roughly 5–15 minutes              |          8 Seeds |
| Multi-step responsibility, roughly 15–30 minutes |         12 Seeds |
| Parent-approved family project                   | 15 Seeds maximum |

Effort, age, access, and required supervision matter more than speed. Parents may lower a task,
split it, or agree to an equivalent before acceptance. Once a task is accepted, completion with
permitted help earns the displayed award; help never causes an after-the-fact reduction. The app
does not award bonus points for perfection, obedience, food consumption, affection, prayer
validity, emotion disclosure, or keeping a secret.

Each task declares one recognition mode:

- **standard:** a finite or one-time practical acquisition task earns its displayed Seeds; it does
  not create an automatic recurrence or indefinite reward;
- **fade-first:** acquisition uses a small displayed award while a recurrent skill is being learned;
  after three confirmed completions, the app asks the Parent whether future completions should move
  to maintenance; and
- **recognition-only:** descriptive Parent acknowledgement and meaning only, with no Seed
  transaction, persistent landscape growth, canopy contribution, or circle event.

Faith, affection, emotion disclosure, and relationship closeness default to recognition-only.
Kinship and kindness default to recognition-only or fade-first preparation skills; the app never
pays for affection, disclosure, spiritual worth, or how close a relationship appears.

`standard` must be finite or `recurrence = once`. A recurrent reward-eligible routine must use
`fade-first` so its third confirmation prompts a Parent phase review.

`routinePhase` applies only to `standard` and `fade-first`; recognition-only uses `not_applicable`.
The valid payout matrix is:

| Recognition/phase                          | Seeds                                    | Persistent landscape/canopy                        | Circle                                                                                |
| ------------------------------------------ | ---------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `standard` + `acquisition`                 | Displayed fixed award after confirmation | Mapped landscape; canopy only if household-visible | One coarse action only if eligible Green Impact                                       |
| `fade-first` + `acquisition`               | Displayed fixed award after confirmation | Same as standard acquisition                       | Same eligibility; Parent review prompt after third confirmed completion               |
| `standard` or `fade-first` + `maintenance` | None                                     | None                                               | An eligible Green Impact action may still be logged as activity, not reward or impact |
| `recognition-only` + `not_applicable`      | None                                     | None                                               | Never                                                                                 |

Every confirmed task receives natural, behavior-specific Parent acknowledgement and one brief
meaning connection. Only acquisition-phase rewarded tasks show a Seed animation and persistent
garden growth. A Parent alone changes future `routinePhase`; the change is prospective, visible,
reversible, and never removes prior Seeds or growth. Ghaf never declares that a habit has formed.

## UAE Living Landscape

The digital garden is an imaginative map of UAE landscapes, not a claim that every species grows
in one physical garden. Ghaf, Samar, and Sidr are documented native trees; app-specific category
meanings are product metaphors and require cultural review.

| Landscape             | Task categories                           | Product meaning                                 | Sharing                                    |
| --------------------- | ----------------------------------------- | ----------------------------------------------- | ------------------------------------------ |
| Ghaf desert grove     | Roots & Kinship; Heritage & Etiquette     | connection, family memory, welcome              | Private or household only                  |
| Samar desert grove    | Home Responsibility; Kindness & Community | dependable contribution                         | Household                                  |
| Sidr reflection grove | Learning & Wellbeing; Faith & Gratitude   | daily growth and reflection                     | Child and guardians only for private items |
| Date-palm oasis       | Food & Hospitality                        | cherishing food, welcoming guests, shared meals | Household                                  |
| Mangrove coast        | Green Impact                              | waste, water, energy, reuse, local stewardship  | Eligible aggregate Green action count      |

Growth stages are **Seed → Shoot → Sapling → Shade → Flourishing**. The flagship Ghaf remains the brand
hero and overall household canopy. A reward-eligible completion grows its mapped landscape. A
household-eligible task may add one canopy leaf. Private tasks remain in the Child-and-guardian
view, and only eligible Green Impact events may update the circle. Growth never implies a real tree
was planted.

## Task Categories

1. **Faith & Gratitude — الإيمان والامتنان:** Parent-enabled routines such as preparing a clean prayer
   space, learning a Parent-approved phrase, or using water thoughtfully during wudu. Recognition-
   only by default, private only, and never ranked, diagnosed, or judged by AI.
2. **Roots & Kinship — جذورنا:** calling or visiting a grandparent, checking on an aunt or uncle,
   asking for a family story, or spending a short phone-free family moment.
3. **Home Responsibility — مسؤوليتي:** putting belongings away, preparing a school bag, setting the
   table, sorting laundry, or helping while an adult carries/disposes of a sealed lightweight waste
   bag on a guardian-approved safe route.
4. **Green Impact — أثر أخضر:** refillable bottles, correct-bin sorting, closing taps, switching off
   unused lights, reporting leaks/unsafe items, and adult-vetted reuse/sorting of clean safe items;
   unsafe items are report-only and no-touch.
5. **Food & Hospitality — النعمة والضيافة:** helping place a guardian-approved amount in a shared
   serving dish, helping store safe
   leftovers, checking food before shopping, and setting out dates, water, or napkins. Never reward
   what or how much the Child eats.
6. **Heritage & Etiquette — تراثنا وآدابنا:** greetings, listening in a majlis, thanking a host,
   learning about Al-Ayyala, and practising a Parent-approved wedding congratulations phrase.
7. **Kindness & Community — اللطف والمجتمع:** helping a sibling, thanking someone, donating a clean
   item with a Parent, or sharing a sustainability tip.
8. **Learning & Wellbeing — التعلّم والتوازن:** reading, planning school materials, movement, sleep
   preparation, or choosing a helpful strategy. Feeling disclosure is optional, private, and
   unscored.

Tasks must state: positive observable action, why it matters, definition of done, age band,
estimated effort, supervision, safety exclusions, optional evidence, recognition mode, displayed
Seeds or recognition-only, valid routine phase, tree mapping, recurrence, `visibilityScope`,
`circleEligible`, privacy, and Arabic/English copy. `RESEARCH_BASIS.md` contains the curated starter
catalog.

Canonical sharing behavior is:

- `visibilityScope = child_guardian`: visible to the Child and guardians; no household canopy;
- `visibilityScope = household`: may add one combined-canopy leaf for an acquisition-phase rewarded
  task without sibling raw totals; and
- `circleEligible = true`: permitted only for Green Impact and projects one coarse family-level
  action count after confirmation. It never projects the task record, Child identity, or Seeds.

Reject `circleEligible = true` unless the category is Green Impact and `visibilityScope` is
`household`. A future production circle also requires guardian management and Child assent.

## Family and Circle Dashboard

The dashboard remains central, but it is a garden-shaped cooperative overview rather than a public
leaderboard.

- **Child view:** own choices, own progress, today/this-week rhythm, and shared family goal.
- **Parent view:** each Child's assignments, observable strengths, supports that helped, requested
  adjustments, chosen activity mix, and private notes.
- **Sibling view:** one combined household canopy; each Child sees only their own goal and no raw
  Seed, pace, or age-unequal comparison.
- **Cousin or other-family circle:** future invite-only and Parent-managed; P0 shows seeded family-
  level eligible Green action counts and cooperative milestones only.

Never share prayer, kinship, affection, food consumption, hygiene, disability-related routines,
wellbeing, Parent observations, exact task history, photos, voice, free-text reflections, or Child
chat across households. The MVP uses seeded local aggregates and does not implement real accounts,
discovery, messaging, comments, or invitations.

## AI Experiences

### Ghaf Coach for the Child

The Coach is a bounded task helper, not a friend, therapist, confidant, religious authority, or
replacement Parent. Its approved intents are:

- explain this task in simpler Arabic or English;
- break the task into short steps;
- create an if–then plan;
- rehearse one curated cultural phrase;
- respond to a prepared task photo or push-to-talk fixture;
- offer one optional, skippable, task-focused reflection question; and
- identify when an adult must help.

It says it is AI and may be wrong, never asks for secrets, never uses attachment language, and never
extends conversation to maximize engagement. Ages 6–8 use curated intents and no free text; ages
9–11 use structured intents and template input; ages 12–14 may use guardian-enabled bounded text or
push-to-talk with stronger privacy controls. No age band receives unrestricted chat.

### Ghaf Guide for the Parent

The Guide may:

- suggest age-appropriate tasks from the curated catalog;
- rewrite a task as a clear positive action;
- propose a smaller step or safe equivalent;
- draft descriptive praise;
- summarize observable strengths and changes over a stated time window; and
- suggest questions a Parent can ask the Child.

It must not output “normal/abnormal,” diagnose, infer ADHD or another condition, score personality
or emotion, judge faith or parenting quality, or replace a pediatrician, teacher, counselor, or
qualified religious adviser. A safe summary leads with strengths, separates fact from uncertainty,
and lets the Parent correct the record.

## Privacy and Safeguarding Posture

The competition prototype uses synthetic children, prepared media, and an always-available
deterministic assistant path; a separately labeled live call may use synthetic task input only.
If real child-facing AI is later enabled, it requires a separately approved production design with:

- verified guardian consent and age-appropriate Child assent;
- privacy by default, no ads, sale, tracking, or commercial profiling;
- clear disclosure of exactly what a Parent can see before a Child sends content;
- separate opt-in for photo and voice, visible capture, metadata removal, task-scoped deletion,
  short retention, and no provider training or secondary use;
- no biometric template, face/voice identification, facial analysis, or emotion inference;
- push-to-talk only, never ambient or background listening;
- age-appropriate filters, monitoring, reporting, and reviewed high-risk escalation;
- an alternative trusted-adult path because a Parent is not always the safe recipient; and
- applicable UAE child-digital-safety, data-protection, and provider requirements reviewed by
  qualified counsel before release.

Do not claim legal compliance from prototype safeguards.

## Competition MVP — P0

P0 demonstrates breadth with curated content and one complete, deterministic vertical slice:

- one synthetic household, two synthetic siblings, and one seeded aggregate cousin circle;
- the eight task categories and five landscape tracks visible in local data;
- one fully executable, recurrence-once, standard-acquisition Green Impact task;
- one Parent task-drafting exchange, one Child coaching exchange, and one Parent summary through
  typed schemas and reviewed safety filters;
- prepared synthetic image and voice fixtures, visibly labeled;
- Parent confirmation, specific praise, a 12-Seed award, landscape growth, one household leaf, and
  one eligible Green Impact action added to the family-circle goal;
- Arabic-first RTL and equivalent English LTR; and
- one-action reset with no network dependency.

For the competition, the architecture should support one real model transformation using synthetic
input through an approved secure server-side provider, with structured output, validation, short
timeout, and same-attempt deterministic fallback. If that boundary is not available, keep the
prepared path honest and mark live AI `BLOCKED` or `NOT RUN`; never place a provider secret in the
mobile bundle or describe a prepared response as live.

The authored screen contract for Feature 003 is:

| Route                 | Purpose                                                            |
| --------------------- | ------------------------------------------------------------------ |
| `/`                   | Entry, language, prototype disclosure                              |
| `/role`               | Demo role and synthetic Child selection; not authentication        |
| `/parent`             | Parent family overview and bounded Guide summary                   |
| `/parent/task/new`    | Task template/custom task and AI refinement                        |
| `/parent/task/review` | Bilingual, safety-aware Parent approval                            |
| `/child`              | Child choices, Seeds, and garden preview                           |
| `/child/task`         | Steps, bounded Coach, optional evidence fixture/reflection, submit |
| `/parent/check-in`    | Parent confirmation, praise, retry, observation                    |
| `/garden`             | Landscape growth and family canopy celebration                     |
| `/circle`             | Cooperative sibling/cousin/family overview                         |

Loading, fallback, error, retry, celebration, and assistant panels are states of these screens, not
extra routes.

## Success Criteria

- A judge can explain the Parent → Child → recognition → garden loop after one demonstration.
- The demo visibly uses AI to improve a task, coach a Child, and summarize for a Parent while
  disclosing simulated or live status accurately.
- At least one action has a defensible sustainability connection; symbolic growth is not presented
  as measured environmental impact.
- A Child can succeed with help, retry without shame, and never lose earned progress.
- Prayer and sensitive categories remain private and absent from circle comparison.
- All Child media and identities in the MVP are synthetic.
- Arabic/RTL and English/LTR complete the same deterministic flow on the target Android device.
- The full resettable journey is understandable and reliable with the remote provider denied; any
  live synthetic-input transformation is separately labeled and validated.

## Explicit Non-Goals for P0

- production authentication, real child accounts, or real multi-family tenancy;
- open social discovery, public leaderboards, messaging, comments, or direct Child contact;
- real child photo/voice processing, continuous listening, emotion recognition, or facial analysis;
- diagnosis, developmental screening, religious rulings, or automated welfare decisions;
- money, banking, purchases, gift cards, redeemable coins, advertising, or loot boxes;
- real-tree-planting claims or fabricated carbon, water, waste, or food-impact numbers;
- production notifications, analytics, monitoring, compliance claims, or store release; and
- a second app, 3D world, or backend that can delay the deterministic competition path.
