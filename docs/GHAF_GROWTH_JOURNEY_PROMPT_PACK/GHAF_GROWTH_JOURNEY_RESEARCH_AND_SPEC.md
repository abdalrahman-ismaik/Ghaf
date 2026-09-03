# Ghaf Growth Journey — Research, Product Specification, and Screen Blueprint

**Product:** Ghaf — غاف
**Feature name:** Ghaf Growth Journey / **مسار الأثر**
**Collection name:** My Badges / **شاراتي**
**Audience:** UAE families; Child mode optimized first for ages 9–11, with age-band adaptations
**Platform:** Android-first mobile web/native shell, Arabic-first RTL with equivalent English LTR
**Prototype truth:** Local, synthetic demonstration data only; no claim of production accounts, real-world environmental impact, or official endorsement
**Prepared:** 2026-09-02

---

## 1. Executive recommendation

Ghaf should adopt the **progression grammar** that makes modern game passes easy to understand:

- a visible path with a clear current position;
- a small number of previewed next unlocks;
- chapters with a strong visual theme;
- collectible badges and upgradeable mastery;
- a satisfying, brief unlock moment; and
- a permanent gallery that makes progress feel owned.

It should **not** adopt the monetization and compulsion machinery commonly attached to those systems.
There must be no paid child track, purchasable Seeds, random drops, loot boxes, urgency countdowns,
streak loss, expiring earned progress, public child ranking, personalized re-engagement pressure, or
pay-to-skip. The design goal is not to maximize time in the app. It is to make children eager to
return for a meaningful next step, complete a real-world action, understand what they learned, and
then leave the screen confidently.

This is both a better fit for Ghaf and a more defensible child experience. A 2024 meta-analysis of
35 interventions found a small average improvement in intrinsic motivation from gamified learning,
with stronger effects on autonomy and relatedness than on competence. It also found that poor
autonomy and low perceived competence are common failure modes. In other words, badges alone are not
the product; choice, achievable challenge, family connection, and informative feedback are the
product. See the [research source ledger](report-source.md) for claims, confidence, and limitations.

### The product sentence

> **مسار الأثر يحوّل البذور المُضافة بعد مراجعة أحد الوالدين أو وليّ الأمر إلى رحلة واضحة عبر أشجار الإمارات وموائلها وتراثها، مع شارات دائمة توثّق التعلّم والممارسة؛ من دون شراء أو ضغط أو منافسة علنية.**

> The Impact Path turns Parent-approved Seeds into a clear journey through UAE trees, habitats, and
> living heritage, with permanent badges that show what a Child learned and practised—without
> purchases, pressure, or public competition.

---

## 2. What to borrow—and what to leave behind

| Familiar game-pass pattern | Ghaf adaptation | Deliberately excluded |
| --- | --- | --- |
| Season road | A finite, cumulative **Impact Path chapter** | Progress reset at season end |
| XP / pass points | Existing permanent **Seeds** after Parent approval | A second currency or purchasable points |
| Reward tier | A clearly labelled **station — محطة** | Opaque or surprise reward |
| Free and premium tracks | One free stewardship path for every Child | Paid tier, boosts, or level purchases |
| Daily/weekly missions | Parent-approved real-world tasks and short learning stories | Loss-framed streaks and compulsory daily login |
| Badge collection | Private badge gallery with visible criteria and mastery stages | Rarity gambling, tradable items, public status market |
| Choice reward | Choice between two equally safe, permanent cosmetic or learning unlocks | Irreversible high-pressure choice or paid reroll |
| Pass completion reveal | Calm botanical growth and one combined achievement moment | Confetti storm, autoplay, endless reward queue |
| Leaderboard | Personal best and cooperative shared garden | Named ranks, percentiles, podiums, “best child” language |
| Limited event | Highlighted theme that moves later to a self-paced archive | Badge forfeiture, countdown scarcity, fear of missing out |

The experience must be original. Clash Royale and PUBG are interaction-architecture references only.
Do not reproduce their terminology, track composition, chest metaphors, crowns, rarity colors, art,
sound, or proprietary visual identity.

---

## 3. Product model

### 3.1 Canonical terms

| Product concept | Arabic label | Meaning |
| --- | --- | --- |
| Seeds | **بذور** | Existing permanent personal growth granted only after Parent confirmation |
| Impact Path | **مسار الأثر** | The Child’s cumulative, self-comparison progression path |
| Chapter | **مرحلة المسار** | A finite themed range of cumulative Seeds; never deletes earned progress |
| Station | **محطة** | A visible deterministic milestone on a chapter path |
| Badge | **شارة** | A permanent collection item tied to a clearly stated action, skill, or learning outcome |
| Achievement | **إنجاز** | The event of meeting a criterion; it may unlock a badge, story, or botanical customization |
| Recognition | **تقدير** | A one-time, non-collectible acknowledgement; it has no progress target, Seed value, or gallery status |
| Badge mastery | **برعم · غصن · ظل** | Three non-competitive stages showing repeated practice, not rarity |
| Learning story | **قصة معرفية** | A short, sourced, age-appropriate UAE ecology, heritage, or place lesson |
| Badge collection | **شاراتي** | The Child’s private gallery of earned, in-progress, and next badges |

### 3.2 Keep existing meanings intact

- Seeds remain fixed, symbolic, nonfinancial, nontransferable, non-purchasable, and permanent.
- A Child submission never awards Seeds, garden growth, a station, or a badge.
- Parent confirmation is the only event that commits a reward-eligible task award.
- Maintenance and recognition-only tasks continue to receive praise without Seed inflation.
- Help, retry, substitution, or completing with permitted adult help never removes prior progress.
- The garden remains the living consequence of action; the Impact Path is the navigable record and
  anticipation layer. They complement each other and must not become duplicate counters.

### 3.3 Information architecture decision

Keep the established three-item Child navigation in its exact physical order:

**الدوري | حديقتي | اليوم** from physical left to right.

Do not add a fourth cramped destination. Make **مسار الأثر** a major layer within **حديقتي** and a
prominent compact card on **اليوم**. This preserves the Child’s simple mental model:

- **Today** is where I act.
- **My Garden** is where I see growth, my path, and my badges.
- **Shared Growth** is where I see private, cooperative community impact.

The full Impact Path and Badge Gallery are nested routes with a physical-right Back control and a
mathematically centered title.

---

## 4. Launch and first-run onboarding

### 4.1 Separate the system launch from the branded opening moment

The first visible layer must follow platform behavior rather than forcing an advertisement-like
delay.

#### A. Native/system Launch Screen

- Bright Pearl or Deep Forest solid field plus the canonical adaptive Ghaf app icon only.
- No tagline, CTA, progress bar, fake loading percentage, legal copy, or spinner.
- No artificial minimum duration. Dismiss as soon as a stable first app frame is ready.
- Android icon motion, if used, targets no more than 1,000 ms in line with platform guidance and must
  remain comfortably skippable when readiness occurs earlier.
- iOS launch artwork should visually bridge into the first stable frame rather than behave like a
  standalone brand advertisement.

#### B. Ghaf Opening Moment

This is the emotional brand reveal and is an app screen, not the native launch asset.

- Target duration: 700–800 ms when shown, with zero required minimum and a hard 1,200 ms maximum.
  It is immediately interruptible once routing is safe and never becomes a fixed multi-second blocker.
- Visual: one Seed settles into a soft UAE landscape line; a Ghaf leaf opens; the live wordmark
  **غاف** resolves.
- Live tagline: **كل خطوة صغيرة تُنبت أثرًا.**
- Motion stops completely after the reveal. Reduced motion uses a static frame and short dissolve.
- Show it only after a fresh install and only after the first stable app frame is ready. Never show it
  for an app update, content/schema version change, warm/hot resume, recovery launch, or ordinary
  returning launch.
- First run continues into onboarding. Returning authenticated users bypass it and route directly to
  their last valid role-safe root; returning signed-out users route to access.

#### C. Conditional launch and routing state machine

| Current state | Condition | Next state |
| --- | --- | --- |
| `BOOT` | Native app process is starting | `OS_SPLASH` |
| `OS_SPLASH` | Stable first frame is not ready | Remain system-owned; do not add an app timer |
| `OS_SPLASH` | Stable frame ready; fresh install; opening moment unseen; reduced motion off | `OPENING_MOMENT` for 700–800 ms |
| `OS_SPLASH` | Stable frame ready; fresh install; opening moment unseen; reduced motion on | Static opening frame for at most one brief dissolve, then `routeAfterSplash()` |
| `OS_SPLASH` | Returning launch, app update, or opening moment already seen | Bypass `OPENING_MOMENT`; call `routeAfterSplash()` |
| `OPENING_MOMENT` | Reveal ends | `routeAfterSplash()` |
| Any post-splash route | `onboardingCompleted = false` | `ONBOARDING_1` |
| Any post-splash route | Onboarding complete; valid Parent session | Last valid Parent root, else Parent Home |
| Any post-splash route | Onboarding complete; valid Child session | Last valid Child root, else Child Today |
| Any post-splash route | Onboarding complete; no valid session | Existing Access / Role Choice |
| Any deep link | Route is invalid for the active role or profile | Role-safe root with a quiet explanation; never expose another profile |

Persist `openingMomentSeen` and the initial `onboardingCompleted` flag separately. An unseen onboarding
version introduced by an app/content update does not block launch and does not auto-open; explain new
features contextually and leave full onboarding available through manual replay. Completing, skipping,
or replaying onboarding must never create a profile, award Seeds, complete a story, or unlock an
achievement.

#### Route entry and exit behavior

| Entry mode | On finish | On Skip/Close | Deep-link handling | Recovery behavior |
| --- | --- | --- | --- | --- |
| `first_run` | Existing Access / Role Choice | Existing Access / Role Choice | Hold the requested target in memory; restore it only after a valid role/profile is established and authorized | If flags are unreadable, bypass motion and route to Access / Role Choice; do not loop onboarding |
| `version_update` | Not applicable; onboarding does not auto-open | Not applicable | Route directly if authorized, otherwise use the role-safe fallback | Continue to the last valid role root; show a quiet recoverable notice if local migration failed |
| `manual_replay` from Help/Settings | Return to the recorded `originRoute` | Return to the same `originRoute` | Keep the current authorized route; replay never replaces it | If origin is invalid, return to the active role’s safe root |

A deferred deep link is consumed at most once. It expires when the active role/profile cannot access
it and must never be used to cross profiles, bypass setup, or expose a Parent screen to a Child.
Recovery never interprets a corrupt/missing presentation flag as proof of first run when a valid
session and profile already exist: bypass Opening Moment/onboarding and use the role-safe root. With
no valid session, recover to Access / Role Choice.

### 4.2 First-run onboarding: three screens maximum

Onboarding is first-run only, skippable, replayable from Help/Settings, and free of permission or
rating prompts. All copy is live and localizable; no Arabic may be baked into illustration.

The pre-profile onboarding uses role- and gender-neutral sentence structures. It addresses the family
experience rather than assuming the viewer is Salem, Alia, a Child, or a Parent.

#### Screen 1 — Promise

- Title: **خطوات صغيرة، أثر يكبر**
- Body: **تتحوّل مهام الأسرة اليومية إلى عادات للعناية بالبيت والبيئة من حولنا.**
- Supporting line: **كل خطوة واضحة تساعد الأثر على النمو.**
- Visual: Parent and Child hands tending one stylized Ghaf sapling; no character likenesses or
  gendered stereotypes.
- Primary: **التالي**
- Quiet: **تخطّي المقدمة**
- Status: **الخطوة 1 من 3** with each numeric token isolated.

#### Screen 2 — Learn the core loop through one safe interaction

- Title: **من المهمة إلى البذور**
- Body: **بعد مراجعة أحد الوالدين أو وليّ الأمر، تتحوّل المهمة المكتملة والمؤهلة إلى بذور تساعد الحديقة على بلوغ مراحل جديدة.**
- Supporting line: **تُضاف البذور بعد المراجعة، ليبقى التقدّم واضحًا وعادلًا.**
- Demo: tap a sample completed recycling task; show a Parent-confirmation check; animate one demo
  Seed toward a young plant.
- Label the interaction **تجربة توضيحية**. It must not mutate a profile or imply that a real task was
  recorded.
- Primary: **التالي**
- Secondary: **السابق**
- Quiet: **تخطّي المقدمة**
- Status: **الخطوة 2 من 3**.

#### Screen 3 — Preview the Impact Path

- Title: **شارات من بيئتنا وتراثنا**
- Body: **تفتح المهام التي تمت مراجعتها ووحدات التعلّم مسارات عن الغاف والقرم والواحات والتراث ومعالم الاستدامة. لكل شارة معيار واضح، وكل شارة مكتسبة تبقى في المجموعة.**
- Supporting line: **توجد مسارات مختلفة، والتقدّم فيها يتم بالوتيرة المناسبة لكل أسرة.**
- Privacy line: **رحلتك خاصة بأسرتك، ولا توجد قوائم ترتيب عامة.**
- Visual: one earned sample badge, two reachable next badges with exact criteria, and a few quiet
  silhouettes farther ahead. No random rarity, price, timer, or “exclusive” label.
- Primary: **بدء الرحلة**
- Secondary: **السابق**
- Quiet: **تخطّي المقدمة** remains available.
- Status: **الخطوة 3 من 3**.
- Do not place **الدخول برمز الطفل** inside onboarding; it belongs to the Access surface that follows.

### 4.3 First-run handoff

The final onboarding action must not silently create a Child account. Route to the existing secure
access/setup screen with:

- Parent primary: **إعداد العائلة**;
- Child secondary: **الدخول برمز الطفل**;
- a clear synthetic-demo disclosure in the prototype; and
- no Child email, phone, precise location, school, or unnecessary identity field.

---

## 5. Progression economy

### 5.1 One currency, two kinds of milestones

Use **lifetime Parent-approved Seeds** as the only numeric input to the main path. Do not add XP,
stars, gems, tickets, or energy.

1. **Path stations** are cumulative Seed thresholds and provide predictable pacing.
2. **Mastery badges** use action or learning criteria, so the system recognizes what the Child did,
   not merely how many points accumulated.

This prevents a high Seed total from falsely implying mastery of water, heritage, or biodiversity.

### 5.2 Canonical task-to-growth state transition

These values are the single source of truth for the Salem P0 fixture. The Mangrove denominator and
the lifetime-Seed denominator represent different domains and must never overwrite one another.

| State | Lifetime Seeds | Current/archived Mangrove stage | Impact Path | Required UI meaning |
| --- | ---: | ---: | ---: | --- |
| Before Parent approval | 108 of the current 120-Seed milestone | 48 of 60 growth | Not yet in the 120–180 chapter | The submitted recycling task is pending; its 12 Seeds are potential only |
| Atomic approval transaction | `+12` exactly once | `+12` growth exactly once | Threshold evaluation waits for the commit | Seed ledger, plant growth, and approval status commit together or not at all |
| Immediately after approval | 120 lifetime Seeds | 60 of 60, complete | Chapter opens at 120 | Preserve the completed Mangrove result and show one combined reveal |
| Next-stage persistent view | 120 lifetime Seeds | **60 of 60 — مكتملة** in the archive | **120 من 180 بذرة**; next station is 132 | Never show 0/60, never reset Seeds, and never relabel the archived Mangrove 60/60 as 120/180 |
| Next exact station | 132 lifetime Seeds | Archived 60/60 remains unchanged | 132 of 180 | Unlock the learning package **بين جذور القرم**; do not automatically award its badge |
| Chapter completion | 180 lifetime Seeds | Archived 60/60 remains unchanged | 180 of 180, complete | Unlock **رعاية الساحل**, commit the specifically configured next garden stage, and preserve both histories |

For the P0 fixture, one more 12-Seed award would reach 132, but the interface must say **تبقّت 12 بذرة**,
not “one task,” because future eligible tasks may have different configured Seed values. The next
garden-stage definition at 180 is a separate content record and may not be invented by the UI; if the
asset is not approved, show **المرحلة التالية قيد الإعداد** without claiming that a named tree grew.

The triggering fixture task is `task.recycling_sort.v1`: `category = waste_sorting`,
`rewardPolicy = seed_award`, `seedAward = 12`, mastery families `skill.sorting` and
`skill.coast_care`, `adultHelpPolicy = required`, and `safetyClass = child_safe`. On its first valid
approval, it adds exactly one acquisition credit to **each** mapped family—one to `skill.sorting` and
one to `skill.coast_care`; the two credits are not alternatives and neither duplicates on replay. It
excludes dirty or sharp material, glass, batteries, chemicals, electrical handling, heat, and heavy
objects. Two prior synthetic acquisition-phase approval events provide Salem’s two Water mastery
credits; the current recycling approval provides the first Sorting credit and third Coast Care
credit. No fixture count is inferred from the lifetime Seed total.

### 5.3 Chapter rules

- Each chapter shows 6–8 stations at once; validate the exact density with children.
- Only the current station and the next two or three unlocks should dominate the viewport.
- Every station states its exact criterion and reward.
- A highlighted theme may rotate, but its unfinished content moves to a self-paced archive.
- Earned badges and station rewards never expire.
- Chapters do not reset Seeds.
- The Child may choose one of two equivalent, safe optional quests at selected stations. Neither
  choice closes the other forever.
- A finite completion state ends with **اكتملت خطوات اليوم** and a clear exit.

### 5.4 Canonical Salem demo chapter

Salem begins this feature at **120 lifetime Seeds**, immediately after completing the current
Mangrove stage. The next garden milestone remains **180 total Seeds**.

**Chapter:** العناية بالمياه والسواحل — Water & Coast Care
**Range:** 120–180 lifetime Seeds
**Current position:** 120
**Chapter promise:** **كل قطرة نوفرها، وكل مادة نفرزها، تساعدنا على فهم موائل الساحل والعناية بها.**

| Threshold | Station | Deterministic unlock |
| ---: | --- | --- |
| 120 | **بداية المرحلة** | Chapter opens; prior Mangrove 60/60 and earlier badges remain preserved |
| 132 | **بين جذور القرم** | Unlock `learning.mangrove_roots.v1`, including its story and story-disabled routes, and the visible progress components for **رعاية القرم**; do not award the badge automatically |
| 144 | **تموّج الساحل** | Permanent botanical garden-frame accent; no power advantage |
| 156 | **ترشيد المياه** | Evaluate **ترشيد المياه — برعم**; award it only if two distinct eligible water-care actions are also complete, otherwise show both criterion components |
| 168 | **حكاية جزيرة الجبيل** | Place-inspired learning story; explicitly not proof of a visit |
| 180 | **رعاية الساحل** | Major chapter badge, configured next garden-stage transition, and preview of the next evergreen chapter |

If a Seed threshold is crossed before a composite badge criterion is complete, unlock the station’s
non-badge item and keep the badge visibly in progress. Never award a badge whose stated learning or
action criterion was not met.

### 5.5 Task reward policies and bounded maintenance credit

Task category does not determine reward eligibility by itself. Every task definition must carry one
of these explicit policies:

| Policy | Seeds | Mastery | Recognition |
| --- | ---: | --- | --- |
| `seed_award` | Configured positive award, committed once after Parent approval | One credit in each explicitly mapped family | Descriptive praise first |
| `maintenance` | Always 0 | May provide at most **one lifetime maintenance credit per Child per mastery family**, and only when the badge definition opts in | Descriptive praise; never “missed Seeds” |
| `recognition_only` | Always 0 | Always 0 | Descriptive praise only |

The maintenance cap is stored, not inferred from dates, and cannot be reset or farmed. A maintenance
task may never satisfy a station’s Seed gate. Reclassification of an old task must not retroactively
mint Seeds or duplicate mastery credit. All P0 badge criteria accept acquisition-phase evidence only,
so recorded maintenance credit becomes eligible only for a future definition that explicitly lists
`maintenance` in `eligibleEvidencePhases`.

### 5.6 Reward cadence

- One meaningful reveal per Parent-approved task or completed learning module, not per tap or
  checklist sub-step.
- Combine simultaneous unlocks into one calm summary rather than stacking modal celebrations.
- Show descriptive Parent praise before numeric or collectible outcomes.
- Use botanical motion and a light optional haptic, then stop.
- Never autoplay another story, task, or reward screen.

---

## 6. Badge and achievement system

### 6.1 Badge anatomy

Every badge record must contain:

- Arabic and English names;
- a short action-focused description;
- category and mastery stage;
- exact, deterministic criteria;
- current and target progress where measurable;
- “why it matters” copy;
- an original botanical/geometric illustration;
- an accessibility label that does not rely on color;
- any related learning story and source metadata;
- earned date and viewed date, when applicable;
- permanence and privacy labels; and
- a review status for cultural, factual, and rights clearance.

### 6.2 Gallery states

| Canonical state or presentation flag | Encouraging visible label | Presentation and required behavior |
| --- | --- | --- |
| `earned` | **مكتسبة** / Earned | Full color, earned date, mastery stage; permanent and privately inspectable |
| `in_progress` | **قيد التقدّم** / In progress | Visible ring/bar plus exact count and next achievable action |
| `presentation = next_recommended` over `in_progress` | **خطوتك التالية** / Your next step | One calm Mangrove Teal highlight; only for a currently reachable criterion |
| `locked` | **متاحة لاحقًا** / Available later | Quiet silhouette plus explicit requirement; no mystery odds, price, or countdown |
| `awaiting_review` | **بانتظار المراجعة** / Awaiting review | Neutral clock; never frame a potential outcome as earned |
| `presentation = archived_context` | **محفوظة** / Preserved | Fully browsable self-paced content; no lost or expired label |

Visible labels may be encouraging, but semantics must remain exact. For example, a visible
**متاحة لاحقًا** tile still exposes canonical state `locked`, and its Arabic accessibility label says
**مقفلة** followed by the unmet criterion. **خطوتك التالية** is not a synonym for every locked item.

Avoid “common,” “rare,” “epic,” and “legendary.” Mastery stages are **برعم، غصن، ظل** and describe
practice, not social status.

### 6.3 Exact P0 badge registry

This is the complete P0 registry—no additional badge may appear in fixtures, code, or generated
screens. Each tier is a separate immutable definition with its own stable ID; related tiers share a
`familyId`. “Owner” controls where the badge is introduced or featured, but criteria remain the only
source of truth. These are Ghaf product badges, not official UAE accreditations, government or UNESCO
badges, site-visit proof, or proof of measured environmental impact.

**Canonical post-approval Salem fixture used below:** 120 lifetime Seeds; stations reached through
`station.water_coast.120`; mastery credits `sorting = 1`, `water = 2`, `energy = 1`, `nature = 2`,
and `coast_care = 3` from distinct approved events; `learning.ghaf_basics.v1` complete; all other P0
learning packages and activities incomplete. These are synthetic test facts, not inferred user data.

Every `masteryCredit(...)` criterion in this P0 registry has
`eligibleEvidencePhases = ['acquisition']`. Maintenance evidence is therefore recorded for audit but
does not advance any P0 badge. A future reviewed badge may explicitly include `maintenance`; it may
not inherit that phase implicitly.

| Stable badge ID | Arabic / English | Family and tier | Exact deterministic criterion | Presentation owner | Salem fixture state and visible progress |
| --- | --- | --- | --- | --- | --- |
| `badge.journey.seed_start.v1` | **بذرة البداية** / Seed Start | `journey`, `seed_start` | `lifetimeSeeds >= 12` | `station.archive.012` | Earned; 12/12 |
| `badge.journey.growing_branch.v1` | **غصن نامٍ** / Growing Branch | `journey`, `growing_branch` | `lifetimeSeeds >= 60` | `station.archive.060` | Earned; 60/60 |
| `badge.journey.expanding_shade.v1` | **ظلّ يتّسع** / Expanding Shade | `journey`, `expanding_shade` | `lifetimeSeeds >= 120` | `station.water_coast.120` | Earned in the approval bundle; 120/120 |
| `badge.journey.coastal_care.v1` | **رعاية الساحل** / Coastal Care | `journey`, `coastal_care` | `lifetimeSeeds >= 180` | `station.water_coast.180` | In progress; 120/180 |
| `badge.skill.sorting.bud.v1` | **الفرز الذكي — برعم** / Smart Sorting — Bud | `skill.sorting`, `bud` | `masteryCredit(skill.sorting) >= 1` | `gallery.family.sorting` | Earned in the approval bundle; 1/1 |
| `badge.skill.sorting.branch.v1` | **الفرز الذكي — غصن** / Smart Sorting — Branch | `skill.sorting`, `branch` | `earned(badge.skill.sorting.bud.v1)` AND `masteryCredit(skill.sorting) >= 3` | `gallery.family.sorting` | In progress; 1/3 |
| `badge.skill.sorting.shade.v1` | **الفرز الذكي — ظل** / Smart Sorting — Shade | `skill.sorting`, `shade` | `earned(badge.skill.sorting.branch.v1)` AND `masteryCredit(skill.sorting) >= 7` | `gallery.family.sorting` | Locked by prerequisite; count remains visible as 1/7 |
| `badge.skill.water.bud.v1` | **ترشيد المياه — برعم** / Water Care — Bud | `skill.water`, `bud` | `reached(station.water_coast.156)` AND `masteryCredit(skill.water) >= 2` | `station.water_coast.156` | Locked by station: actions 2/2 complete; Seeds 120/156 |
| `badge.skill.water.branch.v1` | **ترشيد المياه — غصن** / Water Care — Branch | `skill.water`, `branch` | `earned(badge.skill.water.bud.v1)` AND `masteryCredit(skill.water) >= 5` | `gallery.family.water` | Locked by prerequisite; **2/5** actions visible |
| `badge.skill.water.shade.v1` | **ترشيد المياه — ظل** / Water Care — Shade | `skill.water`, `shade` | `earned(badge.skill.water.branch.v1)` AND `masteryCredit(skill.water) >= 10` | `gallery.family.water` | Locked by prerequisite; 2/10 actions visible |
| `badge.skill.energy.bud.v1` | **ترشيد الطاقة — برعم** / Energy Care — Bud | `skill.energy`, `bud` | `masteryCredit(skill.energy) >= 2` | `gallery.family.energy` | In progress; 1/2 |
| `badge.habitat.ghaf_roots.v1` | **جذور الغاف** / Ghaf Roots | `habitat.ghaf`, `foundation` | `learningPackageComplete(learning.ghaf_basics.v1)` AND `masteryCredit(skill.nature) >= 3` | `gallery.family.ghaf` | In progress: learning 1/1; actions 2/3 |
| `badge.habitat.mangrove_care.v1` | **رعاية القرم** / Mangrove Care | `habitat.mangrove`, `foundation` | `reached(station.water_coast.132)` AND `learningPackageComplete(learning.mangrove_roots.v1)` AND `masteryCredit(skill.coast_care) >= 3` | `station.water_coast.132` | Locked: station 120/132; learning 0/1; actions 3/3 |
| `badge.biodiversity.wetland_exploration.v1` | **استكشاف الأراضي الرطبة** / Wetland Exploration | `biodiversity.wetland`, `foundation` | `learningPackageComplete(learning.wetland_basics.v1)` AND `activityComplete(activity.wetland_observation.v1)` | `gallery.family.wetland` | Locked; learning 0/1, activity 0/1 |
| `badge.heritage.date_palm_gifts.v1` | **عطاء النخلة** / Gifts of the Date Palm | `heritage.date_palm`, `foundation` | `learningPackageComplete(learning.date_palm.v1)` AND `activityComplete(activity.date_palm_reuse.parent_led.v1)` | `gallery.family.date_palm` | Locked; learning 0/1, activity 0/1 |
| `badge.heritage.sadu_patterns.v1` | **نقوش السدو** / Al-Sadu Patterns | `heritage.sadu`, `foundation` | `learningPackageComplete(learning.sadu.v1)` AND `activityComplete(activity.sadu_original_pattern.v1)` | `gallery.family.sadu` | Locked; learning 0/1, activity 0/1 |

`learningPackageComplete(id)` means exactly one of the package’s two equivalent routes has produced a
valid idempotent completion event:

1. the sourced, finite story plus its no-fail knowledge check; or
2. a story-disabled accessible module covering the same reviewed learning objective, followed by the
   same no-fail check or a Parent-guided offline discussion confirmation.

The equivalent route is always free, visible, and equal in badge credit. Opening, scrolling, or timing
out a story is not completion. A wrong answer receives an explanation and another try without losing
progress. Neither route awards Seeds.

Every factual badge-detail screen includes a visible **المصدر / Source** row with source title,
publisher, the source’s own published/reviewed date when available or a precisely labelled source-
access date otherwise, and the corresponding `report-source.md` ledger ID: Ghaf uses `E1`, Mangrove
uses `E2`, Wetlands use `E3`, and Date Palm and Al-Sadu use `E4`. Never label a source-access date as
a Ghaf content-team review or approval unless that separate human review is actually recorded.
Product-rule badges show
**معيار من نظام غاف** instead of implying an external accreditation.

### 6.4 Safe-help recognition, not a collectible target

`recognition.safe_help_once.v1` is not a badge, has no gallery tile, has no progress bar, and cannot be
recommended as a goal. It may appear once per Child only when all conditions are true:

- the task was authored with `adultHelpPolicy = required` before the Child began;
- the Child requested help or used the persistent help action;
- the Parent confirms that appropriate adult help was used; and
- the recognition key `(childProfileId, recognition.safe_help_once.v1)` has not been committed.

It adds zero Seeds and zero mastery credit. If triggered by the same approval that unlocks badges, it
appears as one line of descriptive praise inside the single combined reveal, never as another modal.

### 6.5 Place-inspired stories

Tourist and cultural locations may inspire educational stories, but a badge must never assert a
physical visit unless a future Parent-confirmed feature has a lawful, necessary, and privacy-safe
reason to do so. The MVP must not request GPS or a Child photo.

Safe initial story anchors include:

- Jubail Mangrove Park or Mangrove National Park for mangrove ecology;
- Al Ain Oasis for date palms and the falaj system;
- Al Wathba Wetland Reserve for wetland biodiversity;
- Jabal Hafit for mountain habitats;
- Terra for sustainability learning; and
- generic coastal, desert, oasis, mountain, and wadi stories across the Emirates.

Use original illustrations and clearly state **قصة معرفية مستوحاة من…** where a named place is
used. Do not copy official photography, maps, logos, branded architecture treatments, tourism-page
layouts, UNESCO marks, the UAE state emblem, or the Nation Brand identity. Do not imply partnership,
certification, or endorsement.

---

## 7. Required screen architecture

### 7.1 New and refined Child surfaces

1. **Native Launch Screen** — system-owned minimal asset.
2. **Ghaf Opening Moment** — brief live brand reveal.
3. **Onboarding 1: Promise** — family growth.
4. **Onboarding 2: Core-loop demo** — task → Parent review → demo Seed.
5. **Onboarding 3: Impact Path preview** — earned, next, and locked badges.
6. **Child Today refinement** — compact Impact Path card showing current station and next unlock.
7. **Child Garden refinement** — strong entry points for **مسار الأثر** and **شاراتي**.
8. **Impact Path home** — current chapter, progress, station road, next three unlocks, archive access.
9. **Badge Gallery** — filterable private collection.
10. **Badge Detail sheet** — criteria, progress, why it matters, source note, related action.
11. **Achievement Moment** — one calm combined reveal after any eligible committed event.
12. **Learning Package** — short sourced ecology/heritage/place story plus an equal story-disabled
    route, both with a finite ending and zero Seeds.

### 7.2 Parent surface

13. **Child Progress & Achievements** nested under the Parent’s selected Child profile:

- current lifetime Seeds and chapter;
- recently earned badges with their exact criteria;
- in-progress skills and what support may help;
- the Child’s optional selected path;
- no reminder control in P0; a clearly separated P1 Parent-owned reminder control may be added later
  and must default off;
- privacy statement: no public badge profile, ranking, location, or other-family visibility; and
- no behavioral score, morality label, intelligence label, prediction, or diagnostic inference.

### 7.3 Event sequences

#### A. Task approval

1. Child completes a Parent-assigned task.
2. Child sends it for review; no Seed, growth, station, badge, or recognition is committed.
3. Parent approves exactly once and sends descriptive praise.
4. In one atomic transaction, commit approval status, the configured Seed transaction, garden growth,
   eligible mastery credits, and any safe-help recognition. A replay with the same approval event ID
   changes nothing.
5. Evaluate deterministic station and badge criteria against the committed snapshot.
6. Persist newly unlocked items idempotently and create one `RevealBundle` for the triggering event.
7. On the Child’s next appropriate entry, show one combined Achievement Moment. Order: Parent praise,
   garden consequence, badges/stations, then safe-help recognition.
8. The moment ends with **عرض مسار الأثر** and **اكتملت خطوات اليوم**; no autoplay.

If the Parent requests support/retry, all existing Seeds, badges, path progress, learning progress,
and archived plant stages remain unchanged.

#### B. Learning-package completion

1. The Child completes either the sourced story route or its reviewed accessible equivalent.
2. The final no-fail check or Parent-guided discussion confirmation commits one
   `LearningCompletionEvent` using its unique event ID.
3. The event adds zero Seeds and zero garden growth, then evaluates only criteria that reference that
   learning package or activity.
4. Persist resulting unlocks idempotently and create at most one combined `RevealBundle`.
5. Finish with **العودة إلى المسار** or **اكتملت خطوات اليوم**; do not autoplay another lesson.

#### C. Activity completion

1. Starting, opening, or partially completing an activity writes no completion evidence.
2. Validate the exact `ActivityDefinition`; if `requiresParent = true`, require an explicit Parent
   confirmation associated with that activity attempt.
3. Commit one `ActivityCompletionEvent` with an immutable activity-event ID. A retry or network/local
   replay with that ID returns the prior result and writes nothing new.
4. The event always commits `seedDelta = 0` and `gardenGrowthDelta = 0` and may satisfy only an
   `activity_complete` criterion naming that exact `activityId`.
5. Evaluate affected composite badges, persist any unlock once, and create at most one combined
   `RevealBundle`; never stack an activity modal over a badge modal.

#### D. Historical migration

On first upgrade to this feature, run `achievementMigrationVersion = 1` once per profile. Evaluate the
stored lifetime Seed ledger and eligible historical approval/activity records, grant every qualifying
historical badge, and mark those grants `origin = migration`. Migrated items appear in the gallery as
earned but do not enqueue a celebration. If historical evidence for a composite criterion is absent,
show the component as incomplete; never infer it from Seed totals.

---

## 8. Screen-level design direction

### 8.1 Visual language

Continue the approved **Ghaf Soft Geometric** system:

- Bright Pearl foundation;
- Ghaf Emerald and Mangrove Teal for primary growth;
- Deep Forest/Ink for readable text;
- Sky Mist for safety and explanatory surfaces;
- Solar Amber only for the next reachable milestone or warm botanical light;
- Alexandria for display and headings;
- Readex Pro for body, metadata, and controls;
- original flat/vector botanical forms, layered UAE landscapes, restrained depth, and generous space.

The feature may feel more adventurous than Parent mode, but never babyish, casino-like, militarized,
or visually derivative of battle games. Avoid crowns, chests, gems, loot beams, weapon silhouettes,
metallic rarity frames, faux gold, neon, fire streaks, aggressive red badges, and dense HUD patterns.

### 8.2 Mobile layout contract

- Canonical design-review artboard: 390×844 px. Production layout must not lock the CSS/native
  viewport to that size.
- Fixed header and bottom navigation/action areas; central content scrolls internally.
- Add sufficient bottom padding so final content clears the fixed control.
- Child root header: Help on physical left, centered title, botanical avatar on physical right.
- Nested Child header: left side empty, centered title, Back on physical right.
- Bottom navigation physical left-to-right: **الدوري | حديقتي | اليوم**.
- Forward CTA arrow appears on the physical left of its Arabic label.
- Minimum touch target: 48×48 px; primary action height: 52–56 px.
- Required content and safety notes may not be hidden in horizontal carousels.
- At 200% text scaling/zoom, every screen becomes a one-column vertical flow with no clipped text,
  hidden criterion, two-dimensional scrolling, or action obscured by a fixed bar. A fixed action may
  become sticky or join document flow when necessary to preserve readable content and focus order.
- Nested Back uses the recorded `originRoute` for that navigation entry, including whether Badge
  Detail was opened from Today, Garden, Impact Path, or Gallery. A direct/deep link with no valid
  origin falls back to the active role’s safe root. Back never crosses profiles or roles.

Accessibility acceptance uses the [W3C WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/).
The 48×48 px touch target is Ghaf’s stronger child-usability target; it must not be misrepresented as
the literal WCAG 2.5.8 minimum, which is 24×24 CSS pixels subject to the criterion’s exceptions.

#### Physical-position and locale matrix

| Surface | Arabic `ar-AE` | English `en` |
| --- | --- | --- |
| Child root header | Help physical left; title independently centered; avatar physical right | Mirror semantically: avatar physical left; title centered; Help physical right |
| Nested header | Back physical right with right-pointing glyph; title centered; physical left empty | Back physical left with left-pointing glyph; title centered; physical right empty |
| Child bottom navigation | Physical left-to-right: **الدوري | حديقتي | اليوم** | Physical left-to-right: **Today | My Garden | Shared Growth** |
| Forward full-width CTA | Left-pointing glyph on physical left of Arabic label | Right-pointing glyph on physical right of English label |

Implement the Arabic physical row with an LTR positioning container and individually marked RTL text
runs; do not depend on framework icon auto-mirroring. The title is centered to the viewport, not to
the remaining space between unequal actions. This matrix supersedes generic mirroring behavior.

### 8.3 Arabic and bidirectional text

- Set native/web locale and language metadata to `ar-AE`; set Arabic content to true RTL, not merely
  right-aligned. English content uses `lang=en` and LTR.
- Never letter-space Arabic.
- Keep all labels as live text.
- P0 uses Latin digits `0–9` consistently with the existing Ghaf screens. Isolate each numeric
  token—not the whole sentence—with native attributed-direction spans or web `<bdi dir="ltr">` /
  `unicode-bidi: isolate`. Canonical visual fixtures are **120 من 180 بذرة**, **60 من 60 — مكتملة**,
  **2 من 5**, **اليوم، 7:30 مساءً**, and **12 سبتمبر 2026**.
- Screen-reader strings must express meaning rather than punctuation, for example:
  **مئة وعشرون بذرة من أصل مئة وثمانين** and **خطوتان مكتملتان من أصل خمس خطوات**.
- Screen-reader labels must announce state as well as name: earned, in progress, locked, or awaiting
  review. Canonical Arabic states are **مكتسبة**، **قيد التقدّم**، **مقفلة**، and
  **بانتظار مراجعة وليّ الأمر**.
- Automated visual and accessibility tests cover mixed Arabic/Latin badge IDs, Western numerals,
  dates, times, slash fractions, TalkBack, and VoiceOver.

### 8.4 Motion and sound

- Motion explains cause and effect and then stops.
- Standard UI: 120–220 ms; botanical growth/reveal: approximately 500–800 ms.
- Reduced motion: opacity/state change only; no travelling Seed, scale burst, or parallax.
- No autoplay sound. Optional sounds and haptics obey device settings and a Parent-controlled toggle.
- Do not use repeated sparkle, pulsing claim buttons, or “unclaimed reward” animation.

---

## 9. Data and content architecture

### 9.1 Suggested entities

```ts
type TaskCategory =
  | 'waste_sorting'
  | 'water_care'
  | 'energy_care'
  | 'repair_reuse'
  | 'plant_care'
  | 'habitat_care'
  | 'household_care'
  | 'community_care';

type AchievementCategory =
  | 'journey'
  | 'resource_care'
  | 'circularity'
  | 'habitat'
  | 'biodiversity'
  | 'living_heritage'
  | 'clean_energy';

type MasteryFamily =
  | 'skill.sorting'
  | 'skill.water'
  | 'skill.energy'
  | 'skill.repair_reuse'
  | 'skill.nature'
  | 'skill.coast_care';

type EvidencePhase = 'acquisition' | 'maintenance';

type BadgeFamilyId =
  | 'journey'
  | 'skill.sorting'
  | 'skill.water'
  | 'skill.energy'
  | 'habitat.ghaf'
  | 'habitat.mangrove'
  | 'biodiversity.wetland'
  | 'heritage.date_palm'
  | 'heritage.sadu';

type TaskRewardPolicy = 'seed_award' | 'maintenance' | 'recognition_only';
type AdultHelpPolicy = 'not_needed' | 'available' | 'required';
type ChildSafetyClass = 'child_safe' | 'adult_only' | 'prohibited';

interface TaskDefinition {
  id: string;
  category: TaskCategory;
  rewardPolicy: TaskRewardPolicy;
  seedAward: number; // > 0 only for seed_award; otherwise exactly 0
  masteryFamilies: MasteryFamily[];
  adultHelpPolicy: AdultHelpPolicy;
  safetyClass: ChildSafetyClass;
  excludedHazards: Array<
    'electricity' | 'battery' | 'glass' | 'chemical' | 'blade' | 'heat' | 'heavy_object'
  >;
}

type AchievementCriterion =
  | { id: string; type: 'lifetime_seeds'; threshold: number }
  | { id: string; type: 'station_reached'; stationId: string }
  | {
      id: string;
      type: 'mastery_credit';
      familyId: MasteryFamily;
      threshold: number;
      eligibleEvidencePhases: EvidencePhase[];
    }
  | { id: string; type: 'learning_package_complete'; learningPackageId: string }
  | { id: string; type: 'activity_complete'; activityId: string }
  | { id: string; type: 'badge_earned'; badgeId: string }
  | { id: string; type: 'all'; criteria: AchievementCriterion[] }
  | { id: string; type: 'any'; criteria: AchievementCriterion[] };

interface CriterionProgress {
  criterionId: string;
  state: 'locked' | 'in_progress' | 'complete';
  current?: number;
  target?: number;
  labelAr: string;
  labelEn: string;
  children?: CriterionProgress[];
}

interface AchievementDefinition {
  id: string;
  familyId: BadgeFamilyId;
  tierId: 'seed_start' | 'growing_branch' | 'expanding_shade' | 'coastal_care'
    | 'bud' | 'branch' | 'shade' | 'foundation';
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: AchievementCategory;
  masteryStage?: 'bud' | 'branch' | 'shade';
  criterion: AchievementCriterion;
  presentationOwnerId: string;
  badgeAssetId: string;
  whyItMattersAr: string;
  whyItMattersEn: string;
  sourceRefs: string[];
  factReviewStatus: 'draft' | 'reviewed' | 'approved';
  culturalReviewStatus: 'not_required' | 'required' | 'approved';
  rightsReviewStatus: 'original' | 'review_required' | 'cleared';
  isPermanent: true;
  isPurchasable: false;
  isShareableOutsideHousehold: false;
}

interface ChildAchievementProgress {
  childProfileId: string;
  achievementId: string;
  state: 'locked' | 'in_progress' | 'awaiting_review' | 'earned';
  presentation: 'default' | 'next_recommended' | 'archived_context';
  components: CriterionProgress[];
  earnedAt?: string;
  seenAt?: string;
  triggeringEventId?: string;
  origin?: 'live_event' | 'migration';
  evaluationVersion: number;
}

type StationUnlock =
  | { type: 'learning_package'; id: string }
  | { type: 'badge'; id: string }
  | { type: 'badge_progress_reveal'; id: string }
  | { type: 'garden_cosmetic'; id: string }
  | { type: 'garden_stage_transition'; id: string }
  | { type: 'chapter_preview'; id: string };

interface ImpactPathStation {
  id: string;
  chapterId: string;
  threshold: number;
  titleAr: string;
  titleEn: string;
  unlocks: StationUnlock[];
}

interface ImpactPathChapter {
  id: string;
  titleAr: string;
  titleEn: string;
  seedStart: number;
  seedEnd: number;
  stationIds: string[];
  learningPackageIds: string[];
  archiveState: 'current' | 'upcoming' | 'self_paced_archive' | 'complete';
}

interface PlantStageProgress {
  childProfileId: string;
  stageId: string;
  plantId: string;
  current: number;
  target: number;
  state: 'current' | 'complete' | 'archived';
  completedAt?: string;
  sourceApprovalEventId?: string;
}

interface LearningPackageDefinition {
  id: string;
  storyRouteId: string;
  accessibleEquivalentRouteId: string;
  reviewedLearningObjectiveId: string;
  sourceRefs: string[];
}

interface ActivityDefinition {
  id: string;
  learningObjectiveId: string;
  requiresParent: boolean;
  requiresCamera: false;
  requiresMicrophone: false;
  requiresPreciseLocation: false;
  factReviewStatus: 'draft' | 'reviewed' | 'approved';
  culturalReviewStatus: 'not_required' | 'required' | 'approved';
}

interface LearningCompletionEvent {
  id: string; // idempotency key
  childProfileId: string;
  learningPackageId: string;
  route: 'story' | 'accessible_equivalent' | 'parent_guided_discussion';
  completedAt: string;
  seedDelta: 0;
  gardenGrowthDelta: 0;
}

interface ApprovalEvent {
  id: string; // idempotency key
  childProfileId: string;
  taskDefinitionId: string;
  seedDelta: number;
  gardenGrowthDelta: number;
  masteryCredits: Array<{ familyId: MasteryFamily; delta: 0 | 1; phase: EvidencePhase }>;
  recognitionIds: string[];
  approvedAt: string;
}

interface ActivityCompletionEvent {
  id: string; // idempotency key
  childProfileId: string;
  activityId: string;
  completedAt: string;
  seedDelta: 0;
  gardenGrowthDelta: 0;
}

interface MaintenanceCreditLedger {
  childProfileId: string;
  familyId: MasteryFamily;
  lifetimeMaintenanceCreditsUsed: 0 | 1;
  sourceApprovalEventId?: string;
}

interface RecognitionGrant {
  childProfileId: string;
  recognitionId: 'recognition.safe_help_once.v1';
  triggeringApprovalEventId: string;
  grantedAt: string;
}

interface RevealBundle {
  id: string;
  childProfileId: string;
  triggeringEventId: string;
  parentPraise?: string;
  gardenChanges: string[];
  unlockedBadgeIds: string[];
  reachedStationIds: string[];
  recognitionIds: string[];
  state: 'pending' | 'seen';
}

interface LearningStorySource {
  id: string;
  sourceUrl: string;
  sourceTitle: string;
  publisher: string;
  publishedOrReviewedDate?: string;
  accessedAt: string;
  factVersion: number;
  verifiedFact: string;
  creativeBadgeLore: string;
}
```

The category-to-family map is closed in P0. A task definition may select only the listed family or
families; `household_care` and `community_care` receive no mastery credit unless a future reviewed
definition adds a new explicit family.

| Task category | Permitted mastery family IDs | P0 safety/reward note |
| --- | --- | --- |
| `waste_sorting` | `skill.sorting`, `skill.coast_care` | Only clean, child-safe materials; configured task may award Seeds after approval |
| `water_care` | `skill.water`, `skill.coast_care` | No chemical, plumbing, open-water, or unsupervised outdoor work |
| `energy_care` | `skill.energy` | No sockets, wiring, batteries, heat, or appliance repair |
| `repair_reuse` | `skill.repair_reuse` | P0 assignment is blocked unless explicitly reviewed child-safe/adult-only |
| `plant_care` | `skill.nature` | No ingestion, thorns, pesticides, unknown species, or unsafe tools |
| `habitat_care` | `skill.nature`, `skill.coast_care` | No visit, wildlife contact, GPS, photo, or environmental-impact claim required |
| `household_care` | none | Praise and task completion only unless a future definition explicitly maps a reviewed family |
| `community_care` | none | Private household action only; no live cross-family data or public comparison |

Canonical station unlock arrays are:

| Station ID | `unlocks[]` |
| --- | --- |
| `station.archive.012` | `badge.journey.seed_start.v1` |
| `station.archive.060` | `badge.journey.growing_branch.v1` |
| `station.water_coast.120` | `badge.journey.expanding_shade.v1` |
| `station.water_coast.132` | `learning.mangrove_roots.v1`; `badge_progress_reveal: badge.habitat.mangrove_care.v1` |
| `station.water_coast.144` | `garden_cosmetic.coastal_ripple.v1` |
| `station.water_coast.156` | `badge.skill.water.bud.v1` (criterion-gated evaluation) |
| `station.water_coast.168` | `learning.jubail_mangrove.v1` |
| `station.water_coast.180` | `badge.journey.coastal_care.v1`; `garden.stage.next_after_mangrove.v1`; `chapter.preview.after_water_coast.v1` |

A `badge` reference in `unlocks[]` requests evaluation; it never bypasses that badge’s criterion. A
station with an unmet composite badge shows the persisted component progress instead of granting it.

### 9.2 Evaluation and idempotency

- Evaluate only from committed Parent-approval, learning-package, and explicitly defined activity
  completion events.
- Use each event’s own immutable ID as its idempotency key. A learning event never reuses an approval
  event ID.
- A repeated network/local replay must not duplicate Seeds, station rewards, or badges.
- Learning and activity events always have `seedDelta = 0` and `gardenGrowthDelta = 0`.
- Maintenance uses the stored one-credit-per-family lifetime cap, but every P0 mastery criterion has
  `eligibleEvidencePhases = ['acquisition']`; recognition-only tasks never add a mastery credit.
- Separate `verifiedFact` from `creativeBadgeLore`.
- Definitions are configuration, not UI conditionals scattered across components.
- Store cumulative progress; never recompute historical earned badges away after a definition update.
- If criteria change, increment `evaluationVersion` and use an explicit migration policy.
- Enforce one pending/seen `RevealBundle` per triggering event. Multiple simultaneous badge, station,
  garden, and recognition outcomes appear in that bundle, never as stacked modals.
- The prototype uses local fixtures and persistence only; do not claim a production backend.

### 9.3 Healthy product measures

Do not use session length, endless return frequency, or notification opens as the primary success
measure. Prototype evaluation should ask whether:

- a Child can explain how the next badge is earned;
- a Child understands that Parent review comes before Seeds;
- the system improves learning recall and the quality of completed real-world actions;
- the Child reports choice, competence, enjoyment, and family connection;
- children across abilities can find an achievable route;
- Parents trust the criteria and privacy boundaries; and
- children can stop easily after a finite task or story.

---

## 10. Safety, privacy, and wellbeing guardrails

These are product requirements, not optional polish.

1. One free path; no child-facing purchases, ads, premium tier, boosts, or pay-to-skip.
2. No loot boxes, random rewards, spins, mystery odds, or variable-ratio drops.
3. No loss-framed streak, countdown, expiring earned reward, or “come back before it disappears.”
4. No public Child profile, named rank, percentile, opponent, friend comparison, chat, comments, or
   public badge sharing.
5. No precise location, GPS-required badge, photo proof, audio proof, or attraction check-in in P0.
6. Child reminders are off by default. A future reminder is configured by a Parent and never uses
   guilt, scarcity, or loss language.
7. Praise describes the action, strategy, learning, safe help-seeking, or improvement. Never say
   “smartest,” “best,” “good child,” or imply moral worth.
8. An earned item is permanent. Retry never removes progress, kills a plant, or creates debt.
9. Provide **حفظ وخروج** / Save & Exit and a visible daily endpoint.
10. Cultural and environmental copy is sourced, versioned, and reviewed. App activity does not equal
    measured impact, an official certification, a site visit, or a real planted tree.
11. Original artwork only. Legal/IP review is required before using official marks, exact branded
    destination likenesses, or partner language.
12. Before release, conduct co-design/usability work with UAE children ages 9–11 and Parents,
    including Arabic comprehension, locked-state emotion, stopping behavior, accessibility,
    neurodiverse needs, and cultural accuracy.
13. A repair/reuse task is `prohibited` for Child mode unless a reviewed task definition explicitly
    marks it `child_safe` or `adult_only`; electricity, batteries, glass, chemicals, blades, heat, and
    heavy objects are excluded from P0 Child tasks.
14. Safe help is recognized only by `recognition.safe_help_once.v1`; it is never a repeatable badge,
    target, recommendation, or source of Seeds/mastery.

---

## 11. MVP scope and later phases

### P0 — implement now

- system launch asset and the conditional, first-install-only Ghaf Opening Moment;
- three-screen first-run onboarding;
- the full canonical Salem transition from 108 Seeds and Mangrove 48/60, through one +12 approval, to
  120 lifetime Seeds, archived Mangrove 60/60, and the cumulative 120–180 path;
- one complete 120–180 Impact Path chapter;
- exactly the 16 stable badge definitions in §6.3, with no fixture-only additions;
- gallery, detail sheet, one combined unlock moment, one sourced learning package, and its equivalent
  story-disabled route;
- Today and Garden entry points without changing Child bottom navigation;
- Parent read-only progress/achievement overview;
- local fixture state, idempotent evaluator, Arabic/English copy, reduced motion, and tests.

### P1 — validate before expanding

- mastery upgrades across more task categories;
- choice stations among equivalent paths;
- more Emirates/ecosystem stories after cultural and rights review;
- content-authoring workflow and review metadata;
- optional Parent-scheduled neutral reminders;
- child co-design iteration and accessibility improvements.

### Explicitly out of scope

- paid pass or marketplace;
- randomized rewards;
- public leaderboard or badge sharing;
- real location/visit verification;
- real partner claims;
- live cross-family data;
- push engagement optimization;
- generative free-text cultural or scientific facts; and
- claims that an in-app task created quantified environmental impact.

---

## 12. Acceptance criteria

The feature is complete only when all of the following are demonstrably true:

- Native launch does not impose an artificial delay; the branded reveal is a separate app surface.
- The opening moment appears only on fresh install; app updates, returning launches, recovery, and
  warm/hot starts bypass it.
- An unseen onboarding/content version introduced by an update routes directly to the authorized root
  and never blocks launch; `manual_replay` returns or closes to its recorded origin.
- First-run Finish/Skip goes to Access / Role Choice; a deferred authorized deep link is consumed once;
  corrupt presentation flags recover to the valid role root or, without a session, Access / Role Choice.
- Onboarding appears only when incomplete, uses role-neutral pre-profile copy, can be skipped, and can
  be replayed without mutating profile state.
- The onboarding demo does not mutate Salem’s state.
- The tested state transition is exactly 108 Seeds + Mangrove 48/60, one atomic +12 approval, then 120
  lifetime Seeds + completed/archived Mangrove 60/60 + cumulative path 120/180.
- The next station is exactly 132; it unlocks `learning.mangrove_roots.v1` and its equivalent route,
  not the **رعاية القرم** badge itself.
- Historical 12-, 60-, and 120-Seed badges backfill once without enqueuing celebration modals.
- Parent approval exactly once can advance Seeds and unlock an eligible achievement exactly once.
- Submission, retry, merely opening/scrolling a screen, or replaying onboarding cannot award anything.
- Learning/activity completion is idempotent, awards zero Seeds/garden growth, and can satisfy only its
  declared criterion.
- Maintenance awards zero Seeds, records no more than one lifetime maintenance-phase credit per
  mastery family, and advances no P0 badge because all P0 criteria are acquisition-only;
  recognition-only tasks contribute praise only.
- The P0 registry IDs, family/tier relationships, criteria, presentation owners, and fixture progress
  match §6.3 exactly, including Water Branch at 2/5.
- All locked badges show deterministic criteria and no price, odds, timer, or FOMO copy.
- Earned badges persist after chapter changes and app restart.
- All outcomes from one event render in a single `RevealBundle`; the Child can exit and nothing
  autoplays into another task or story.
- Gallery state is private and has no public sharing control.
- Place stories work with no GPS, camera, microphone, or claim of a visit.
- Arabic uses `ar-AE`, true RTL, explicit per-token bidi isolation, correct physical glyph direction,
  and readable screen-reader phrases; English follows the locale matrix.
- Headers, navigation, CTA arrows, 48 px touch targets, scrolling clearance, and safe areas match the
  canonical physical layout.
- Back returns to the recorded valid origin; a direct link falls back to the active role/profile’s safe
  root and never crosses profiles.
- Core contrast meets WCAG 2.2 AA; earned/locked states are not color-only.
- At 200% text scaling/zoom, every surface is one-column, fully readable, and free of clipped or
  obscured actions.
- Reduced-motion behavior removes travelling/burst motion without hiding the outcome.
- Automated tests cover idempotency, thresholds, structured composite criteria, persistence
  migration, conditional launch/onboarding routing, origin-aware Back, story-disabled equivalence,
  localization, and accessibility names.
- Repeat the canonical flows with Alia and a third synthetic profile to prove there is no hard-coded
  Salem name, masculine copy, shared progress, cross-profile reveal, or cross-profile Back destination.
- Every factual badge detail renders its required **المصدر / Source** row and maps to the source ledger.
- Documentation distinguishes implemented behavior, fixture behavior, proposed future behavior, and
  unsupported real-world claims.

---

## 13. Final design position

Ghaf can feel as polished and anticipatory as a premium game without behaving like a monetized
battle pass. The strongest version gives Salem a beautiful answer to three questions:

1. **Where am I now?** — at a visible station in a preserved journey.
2. **What can I unlock next?** — one understandable, achievable, deterministic outcome.
3. **Why does it matter?** — a real skill, a family contribution, or a sourced story about the UAE.

That is the experience to build: not “stay online longer,” but **want to return, act in the real
world, learn something true, and watch your garden and identity as a steward grow over time.**
