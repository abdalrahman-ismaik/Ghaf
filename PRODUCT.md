# Product

<!-- impeccable:product-schema 1 -->

## Status

| Item                      | Truth as of 2026-09-05                                                                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product                   | Ghaf — غاف                                                                                                                                                  |
| Competition               | Khalifa University SMAC 2026                                                                                                                                |
| Official theme            | AI Adventures in Sustainability                                                                                                                             |
| Active product direction  | Feature 003 Revision 3: frozen R001/R002a baseline plus feature-flagged R002b expansion                                                                     |
| Behavioral baseline       | Clean R002a head `0501cf3`: completed R001/R002a surfaces and 541 passing tests                                                                             |
| Frozen regression batch   | R001 native foundations, Welcome, and first-time Parent onboarding                                                                                          |
| R002a implementation gate | **R002A COMPATIBILITY SCOPE APPROVED — IMPLEMENTATION AUTHORIZED**                                                                                          |
| R002b implementation gate | **R002B PRODUCT CONTRACT APPROVED — FEATURE-FLAGGED IMPLEMENTATION AUTHORIZED — RELEASE ACTIVATION BLOCKED**                                                |
| Evidence boundary         | Existing behavior remains authoritative; R002b code stays default-off until its applicable native, content, provenance, accessibility, and human gates pass |
| Primary platform          | Android; Arabic-first RTL with equivalent English LTR                                                                                                       |
| Prototype data            | Synthetic only                                                                                                                                              |

Feature 003 supersedes the single food-rescue mission as the product direction. Food rescue remains
one useful future task family, but the only executable P0 task is the canonical 12-Seed Green
Impact recycling task `task_recycling_p0_v1`. Feature 002 evidence remains historical and must not
be used to pass any Feature 003 Android, design, or human-review criterion.

The R003 first-run presentation introduces Ghaf first, then explains three features in four
optional in-route moments: what Ghaf does for a family, choosing a Parent-approved action, using
permitted help before Parent confirmation, and keeping confirmed action as permanent private
symbolic Garden growth. Child-facing sentences use short, concrete Modern Standard Arabic and
equivalent plain English. The experience uses the official raster Ghaf logo and vivid local nature
photography, then returns to the existing separate Parent and Child access choices. It adds no
route, account, reward, persistence, environmental-impact, or access authority. Startup is visibly
ordered: the configured native splash, a fully opaque Ghaf splash for 2,000 ms after handoff, a
distinct leaf-loading screen for at least 1,000 ms and until the four used font files plus bounded
signed-out image set settle, then onboarding. The splash itself has no loader and cannot fade in
over onboarding. Startup never blocks on Garden or prepared-media imagery.
Major Welcome/access/role handoffs hold for 900 ms and settle only their immediate destination
assets. After the loader exits and onboarding can paint, all 41 remaining packaged rasters warm
asynchronously in bounded batches of six: immediate access/experience imagery first and the large
prepared-media fixture last. Fast navigation reuses the same in-flight request, deeper consumers
retain Expo Image caching, and ordinary tabs remain immediate. Both visible loaders use one simple
three-leaf loop with no visible technical loading copy; the background warm-up has no visible
status. Every access/setup screen uses the shared raster brand lockup and leaf-shadow background
without changing its authentication-looking logic.

The remote implementation is preserved behavior, not permission to change product outcomes. The
six local-only commits remain unapplied candidate provenance; any compatible presentation must be
reconstructed over `76fa682` rather than cherry-picked from the conflicting history.

## R002a Compatibility Release

R002a authorizes a native Soft Geometric presentation layer over the existing deterministic
behavior. It does not authorize a new reward ledger, task identifier, access model, privacy model,
or route-local business logic. R001 Welcome and Parent onboarding are frozen regression baselines;
their handoff into `/parent` must continue to work without an incidental redesign.

R003 separately adds a dedicated `/access/parent/sign-up` usability route. On the returning-Parent
sign-in screen, **Create a new family** opens sign-up before any verification request. Sign-up asks
only for the existing synthetic Parent phone/email identifier, then reuses the same deterministic
verification and first-family setup authority. The current prototype still supports exactly one
synthetic household and creates no production account or identity.

R002a must be implemented and validated in this order:

1. Parent Home at `/parent`, using `ghaf_parent_home` as the primary candidate composition;
2. Parent Tasks and Task Builder, including choose, edit, review, created, and added states;
3. Child Today and the existing task execution states from ready through 0/2, 1/2, 2/2,
   confirmation, and waiting for Parent approval;
4. Parent review, support-request states, and approved success presentation;
5. the Child support, accepted-step, Parent-note, completion, and resubmission loop; and
6. the existing Garden with a compatible `ghaf_child_growth_garden_final_corrected` presentation.

Every surface must call existing actions and consume existing selectors. The canonical executable
task remains `task_recycling_p0_v1`; `task.recycling_sort.v1` is a design-document alias only and
must never be stored or migrated. Child submission awards nothing. Only the existing atomic,
idempotent Parent approval may commit its complete consequences: praise, 12 Seeds, mapped plant
growth, canopy, eligible Green Circle projection, eligible Challenge Leaf/private League effects,
and eligible private Family Reward effects. Retry, interruption, and support must not lose or
duplicate progress.

The `/parent` refresh is presentation-only. It must retain all currently reachable routes,
navigation, task actions, voice behavior, reset controls, selected-Child state, access and
reauthentication boundaries, guards, privacy, and profile isolation. Private League and Family
Reward remain protected domain behavior. The Child League route consumes an epoch-scoped local
authority seeded from the approved synthetic `4/4/3` summary and one nominated Salem Leaf; the
Family Reward route consumes its private plan projection. Parent Home still has no direct selector
for either detail and must not invent `4/5`, `108/120`, `120/180`, or any other screenshot counter.
It must not relabel the cooperative `/circle` route as the private League.

R002a copy is Arabic-first and centrally paired with equivalent English. It includes conservative
loading, empty, validation-error, recoverable-error, submitting, success, interrupted-recovery, and
reduced-motion states without inventing new business outcomes. Raw Stitch HTML and PNG exports
remain reference evidence, never runtime UI or data.

R002b is authorized for feature-flagged implementation. It reconciles current Mangrove
48/60→60/60 growth with confirmed lifetime Seeds 108→120 and a read-only 120→180 Water & Coast
Impact Path; adds the locked 16-badge registry, equal-credit Mangrove learning, Parent selected-Child
progress, a superset RevealBundle, and additive anonymous Shared Growth. Every R002b surface has an
independent default-off flag, and the R002a UI remains its fallback. Release activation stays
blocked until that surface’s technical, native, bilingual, accessibility, provenance, content, and
human-review gates pass.

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
- **Invite-only League participant:** P0 uses synthetic siblings/cousins, private allowlisted rows,
  exactly five Challenge Leaves, and no real invitations or cross-family connection.
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
8. For an acquisition-phase rewarded task, the mapped landscape grows. A household-visible event
   may add one canopy consequence; a separately nominated Challenge Leaf may add 20 League points.
9. The same idempotent result may reveal an Impact Path station or permanent badge; independent
   private Family Reward progress appears last.

No in-app credit, recorded sustainability activity, or symbolic growth is recorded before Parent
confirmation. Confirmation does not establish environmental impact.

## Behavioral Design Contract

| Principle              | Product rule                                                                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Positive reinforcement | Recognize the requested observable action promptly after confirmation.                                                                                   |
| Descriptive praise     | Name the action, strategy, help-seeking, or improvement; never label the Child's character.                                                              |
| Autonomy               | Let the Child choose among Parent-approved tasks, order, cue, and a cosmetic garden detail.                                                              |
| Competence             | Keep the definition of done achievable; allow help, smaller steps, retry, or substitution.                                                               |
| Relatedness            | Connect the action to a real person, family value, household need, or shared goal.                                                                       |
| Predictability         | Use fixed, visible rewards. No loot boxes, random jackpots, scarcity, or variable-ratio mechanics.                                                       |
| Internalization        | Let the Parent move future reward-eligible completions from acquisition to zero-Seed maintenance while preserving praise, choice, and meaning.           |
| Repair without shame   | A miss never removes earned Seeds, kills a tree, creates debt, or publicly marks failure.                                                                |
| Self-comparison        | Show permanent progress against the Child's own goal. Weekly League opportunity is normalized and every valid Leaf also supports the cooperative canopy. |

## Separate Progress Authorities

| Authority                         | Meaning and persistence                                                                                                                        |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Lifetime Seeds                    | Permanent private symbolic progress created only by an eligible Parent-confirmed acquisition receipt                                           |
| Mapped landscape                  | Permanent category-specific growth derived from eligible Seed provenance; Mangrove is independently 48/60 → 60/60 in the P0 event              |
| Challenge Leaves and League score | Five weekly opportunities, 20 points each, capped at 100; rank resets weekly while permanent progress does not                                 |
| Family canopy                     | Cooperative household consequence without another Child's task, evidence, accommodation, money, or raw Seed total                              |
| Family Reward eligible progress   | Private Parent-promise eligibility, separate from the personal Seed and League ledgers; existing live values only, never a screenshot constant |
| Impact Path                       | R002b read-only projection of confirmed lifetime Seeds and separate criteria; default-off, never writable, spendable, or a second currency     |

Numerical equality does not merge authorities. A screen, migration, or design export may not copy
one value into another ledger.

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

## Family, League, and Privacy Projection

The family dashboard remains garden-shaped and cooperative. Revision 3 also preserves the private,
invite-only five-Leaf League implemented in the remote domain baseline; it is not a public or global
leaderboard.

- **Child view:** own choices, own progress, today/this-week rhythm, and shared family goal.
- **Parent view:** each Child's assignments, observable strengths, supports that helped, requested
  adjustments, chosen activity mix, and private notes.
- **Sibling view:** one combined household canopy; each Child sees only their own goal and no raw
  Seed, pace, or age-unequal comparison.
- **League view:** shows only approved nickname, tree avatar, weekly rank, normalized score, and
  confirmed Challenge Leaves. Ties share position; speed and extra tasks never break ties.
- **Green Impact projection:** remains a separate coarse household-visible Green action projection;
  `circleEligible` never doubles as League eligibility.

Never share prayer, affection, emotional disclosure, private wellbeing, hygiene, disability-related
routines, Parent observations, exact task history, media, free-text reflections, assistant content,
age, accommodations, missed-task reasons, Seeds, or Family Reward amounts across households. The
MVP uses seeded local participants and does not implement real accounts, discovery, messaging,
comments, or invitations.

## Private Family Reward

Family Reward is an optional private Parent promise, not a wallet. It may be money, an experience,
a privilege, or a gift fulfilled outside Ghaf. It has no Seed-to-AED rate, never depends on League
rank, and follows `promised → unlocked → given`. A monetary plan requires synthetic scoped Parent
reauthentication. An unlocked promise cannot be removed or retroactively weakened.

The domain fixture may represent Salem's private plan at 108/120 eligible Seeds and AED 25, with an
eligible confirmation advancing it to 120/120 only after praise, committed Seeds, and mapped garden
growth. Those values are service data, not Parent Home display constants. Until a live authorized
selector exposes a plan, R002a must omit the dashboard counter rather than manufacture one. Unknown,
recognition-only, protected, or prohibited activity contributes zero.

## Private Growth Journey

R002b defines Impact Path as one free private read-only projection, not a spendable balance. Its
Water & Coast chapter spans lifetime Seed stations 120, 132, 144, 156, 168, and 180. It includes
exactly 16 deterministic permanent badge definitions, one finite Mangrove learning package with an
equal-credit accessible route, and a Parent read-only selected-Child view. Implementation is
authorized behind independent default-off flags; release activation remains blocked.

Learning and explicit activity completion are idempotent, create zero Seeds and zero existing
garden/canopy/League/Challenge/Family Reward progress, and never compare siblings. Badge, learning,
and Path screens read authoritative selectors and cannot create a task or calculate an unlock.

The exact badge criteria and learning package live in [the badge catalog](docs/content/BADGE_CATALOG.md)
and [learning contract](docs/content/LEARNING_STORIES.md). They are approved product authority for
default-off implementation. Learning release still requires source provenance and named bilingual,
content, cultural, safeguarding, and accessibility review.

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

## Revision 3 Product-Expansion Contract

R002b remains one application and one deterministic journey. Its implementation is feature-flagged
and its release activation is independently gated:

- separate capability-scoped Parent and Child access with no ordinary in-app role toggle;
- Parent Home, Tasks, Garden, and Family navigation; Child Today, Garden, and League navigation;
- eight curated task categories, five UAE landscape tracks, and one executable 12-Seed Green
  Impact recycling task;
- five Challenge Leaves per Child, private normalized League results, and cooperative canopy;
- Salem's private 108/120 Family Reward plan and one 120–180 Impact Path chapter;
- exactly 16 badges, one finite Mangrove learning package with equal-credit alternative, one Parent
  selected-Child progress view, and one combined recoverable result;
- deterministic prepared Guide, Coach, media, and voice behavior with `expo-audio` preserved; and
- Parent-authorized signed-out Arabic-first reset, profile isolation, offline operation, and
  equivalent English.

The R002b combined result is a superset projection of an already committed authoritative event. Its
deterministic order is Parent praise → Seed delta and before/after → plant/stage → canopy → eligible
Green Circle projection → private League Leaf → Challenge Leaf → private Family Reward → newly
earned badges → reached stations → unlocked learning → optional safe-help recognition. A screen
never commits or recalculates those effects. Duplicate confirmation remains a no-op in both scopes.

R001 freezes foundations and Welcome → Parent sign-in → verification → family basics → add first
Child → review/create → native success sheet → preserved `/parent` destination. R002a remains the
visible fallback. R002b routes and mechanics may be implemented locally only behind independent
default-off flags; no feature is released merely because its code or candidate screen exists.

## Preserved Remote Demonstration Baseline

The section below records the earlier ten-route implementation and may be used only as regression
evidence while Revision 3 is integrated. It is not the target route inventory and does not release
post-R001 UI.

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

The historical authored screen contract for the preserved R001/R002a baseline was:

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
extra routes. The active R003 completion route and state manifest is maintained in
`specs/003-family-growth-garden/design-intake/r003-complete-screen-journey.md`; `/role` is now a
compatibility redirect only.

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

## Implemented Product Experience Redesign Domain Foundation

The remote behavioral baseline already implements deterministic services for separate access,
private Family Reward, private weekly Family League, age-adapted Coach output, and synthetic voice.
These services remain regression authority. R002a may present already wired behavior through its
authorized compatibility surfaces, but every surface still requires fresh native and human evidence.

- **Synthetic access** demonstrates least-privilege Parent/Child sessions, expiring pairing,
  revocation, action-scoped Parent reauthentication, and per-Child grants. It is not production
  authentication, identity verification, consent, or secure credential storage.
- **Family Reward** is a private Parent-authored promise tied to personal Seed or Garden milestones.
  It is separate from Seed transactions and League position. Ghaf has no wallet, payment, transfer,
  custody, exchange rate, purchase, or cash-out behavior.
- **Family League** uses five Parent-approved weekly Challenge Leaves, normalized scores capped at
  100, full credit with help/adaptation, shared ties, opt-out, no speed tiebreak, and a cooperative
  family goal. Its synthetic minimal projection is separate from the Green Circle and never exposes
  task text, evidence, Seeds, media, reflections, or protected activity.
- **Coach and voice** may enforce age-specific prepared output and a synthetic push-to-talk review
  lifecycle. Real recording, transcription, code-switch understanding, dialect output, and provider
  integration remain unavailable.

The cooperative circle, Schema-3 48→60 personal Seed presentation, and ten-route shell remain the
R002a behavioral oracle. R002b may supersede values or add projections only through a separately
approved versioned migration and released screens.
