# Google Stitch Professional Prompt Pack — Ghaf Opening, Onboarding, Impact Path, and Badges

**Use in:** Ghaf Stitch project `10584890474013625126`
**Existing reference screen:** `c45b7aad352f40d7b8ef00bf7479e298`
**Method:** Paste the foundation prompt once, then paste each screen prompt separately in order. Keep
all work in the same project so Stitch reuses the current visual language and canvas history.

Do not paste the entire document as one generation request. Google Stitch performs better when a
specific surface and interaction are refined in each turn. After a screen is close, use the targeted
correction prompts at the end rather than regenerating the whole set.

This sequence follows Google’s current guidance to prompt in clear natural language, give the canvas
project context, iterate screen by screen, connect approved screens into a prototype, and preserve
system rules in `DESIGN.md`: [Effective Prompting](https://stitch.withgoogle.com/docs/learn/prompting),
[DESIGN.md overview](https://stitch.withgoogle.com/docs/design-md/overview), and
[Stitch prototypes and design agent](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/).

---

## Prompt 00 — Lock the feature direction before generating screens

```text
Extend the existing Ghaf — غاف project with a refined first-run opening/onboarding flow and a new
child progression feature called “مسار الأثر” (Impact Path). Preserve every approved Parent Task,
Child Today, Child Garden, Shared Growth, task-review, and privacy decision already on this canvas.
Do not redesign unrelated screens.

PRODUCT INTENT
Create the clarity, anticipation, and collectible progression of a premium game journey: a visible
path, finite chapters, previewed next milestones, permanent badges, mastery stages, a private badge
gallery, and brief achievement reveals. Make it original to Ghaf and the UAE.

This is not a paid or competitive pass. Use one free cumulative path only. Do not show purchases,
premium tracks, shops, gems, chests, loot boxes, random rewards, spins, rarity odds, countdowns,
streak loss, expiring progress, leaderboards, public Child profiles, or “beat other players” copy.
Do not copy Clash Royale, PUBG, or any other game’s composition, terminology, reward-track geometry,
art, icons, crowns, metallic frames, or sound language.

CANONICAL MEANINGS
- “بذور” are the existing permanent symbolic growth units added only after Parent approval.
- “مسار الأثر” is a cumulative projection of those Seeds, not a second currency.
- “محطة” is a deterministic path milestone.
- “شارة” is a permanent acknowledgement of an action, skill, or learning outcome.
- Badge mastery stages are “برعم · غصن · ظل”, not common/rare/epic/legendary.
- “شاراتي” is Salem’s private collection, visible only inside the family experience.
- Place content is a “حكاية مكان” completed in the app; it never claims a physical visit.

CANONICAL DEMO TIMELINE — DO NOT REINTERPRET THE NUMBERS
1. Before approval of the recycling task: Salem has 108 lifetime Seeds and Mangrove growth 48/60.
2. Parent approval commits exactly one +12 Seed transaction atomically.
3. After approval: Salem has 120 lifetime Seeds; Mangrove growth reaches 60/60 and that stage is
   archived as complete. No value resets.
4. The next cumulative chapter spans 120→180 lifetime Seeds. At 120, exactly 12 Seeds remain to the
   132 station. A later +12 approval changes 120→132, reaches the station, unlocks the learning story
   `learning.mangrove_roots.v1`, including its story and story-disabled routes, and exposes progress toward “رعاية القرم”;
   it does not automatically award that badge.
5. Use exactly one `RevealBundle` for all outcomes from one event—Parent praise, Seed consequence,
   garden growth, badges, stations/stories, and safe-help recognition. It replaces the old standalone
   Garden Growth Moment; never stack or sequence a second result surface. Copy and singular/dual/
   plural grammar derive from the actual result set; never hard-code “one more” or “two more”.

CANONICAL P0 BADGE REGISTRY — EXACTLY 16 DEFINITIONS; DO NOT ADD OR RENAME
Treat stable ID, Arabic/English name, family/tier, prerequisite, criterion, and owner as one contract.
`learningPackageComplete(id)` means either the sourced story or its reviewed equal-credit
story-disabled route completed the same no-fail learning objective. `masteryCredit` counts distinct
eligible approved events only. Every P0 `masteryCredit` criterion uses
`eligibleEvidencePhases: ['acquisition']`; maintenance is not a hidden P0 shortcut.

| Stable ID | Arabic / English | Family · tier | Exact criterion and prerequisite | Presentation owner |
| --- | --- | --- | --- | --- |
| `badge.journey.seed_start.v1` | بذرة البداية / Seed Start | `journey` · `seed_start` | `lifetimeSeeds >= 12` | `station.archive.012` |
| `badge.journey.growing_branch.v1` | غصن نامٍ / Growing Branch | `journey` · `growing_branch` | `lifetimeSeeds >= 60` | `station.archive.060` |
| `badge.journey.expanding_shade.v1` | ظلّ يتّسع / Expanding Shade | `journey` · `expanding_shade` | `lifetimeSeeds >= 120` | `station.water_coast.120` |
| `badge.journey.coastal_care.v1` | رعاية الساحل / Coastal Care | `journey` · `coastal_care` | `lifetimeSeeds >= 180` | `station.water_coast.180` |
| `badge.skill.sorting.bud.v1` | الفرز الذكي — برعم / Smart Sorting — Bud | `skill.sorting` · `bud` | `masteryCredit(skill.sorting) >= 1` | `gallery.family.sorting` |
| `badge.skill.sorting.branch.v1` | الفرز الذكي — غصن / Smart Sorting — Branch | `skill.sorting` · `branch` | prerequisite `earned(badge.skill.sorting.bud.v1)` AND `masteryCredit(skill.sorting) >= 3` | `gallery.family.sorting` |
| `badge.skill.sorting.shade.v1` | الفرز الذكي — ظل / Smart Sorting — Shade | `skill.sorting` · `shade` | prerequisite `earned(badge.skill.sorting.branch.v1)` AND `masteryCredit(skill.sorting) >= 7` | `gallery.family.sorting` |
| `badge.skill.water.bud.v1` | ترشيد المياه — برعم / Water Care — Bud | `skill.water` · `bud` | `reached(station.water_coast.156)` AND `masteryCredit(skill.water) >= 2` | `station.water_coast.156` |
| `badge.skill.water.branch.v1` | ترشيد المياه — غصن / Water Care — Branch | `skill.water` · `branch` | prerequisite `earned(badge.skill.water.bud.v1)` AND `masteryCredit(skill.water) >= 5` | `gallery.family.water` |
| `badge.skill.water.shade.v1` | ترشيد المياه — ظل / Water Care — Shade | `skill.water` · `shade` | prerequisite `earned(badge.skill.water.branch.v1)` AND `masteryCredit(skill.water) >= 10` | `gallery.family.water` |
| `badge.skill.energy.bud.v1` | ترشيد الطاقة — برعم / Energy Care — Bud | `skill.energy` · `bud` | `masteryCredit(skill.energy) >= 2` | `gallery.family.energy` |
| `badge.habitat.ghaf_roots.v1` | جذور الغاف / Ghaf Roots | `habitat.ghaf` · `foundation` | `learningPackageComplete(learning.ghaf_basics.v1)` AND `masteryCredit(skill.nature) >= 3` | `gallery.family.ghaf` |
| `badge.habitat.mangrove_care.v1` | رعاية القرم / Mangrove Care | `habitat.mangrove` · `foundation` | `reached(station.water_coast.132)` AND `learningPackageComplete(learning.mangrove_roots.v1)` AND `masteryCredit(skill.coast_care) >= 3` | `station.water_coast.132` |
| `badge.biodiversity.wetland_exploration.v1` | استكشاف الأراضي الرطبة / Wetland Exploration | `biodiversity.wetland` · `foundation` | `learningPackageComplete(learning.wetland_basics.v1)` AND `activityComplete(activity.wetland_observation.v1)` | `gallery.family.wetland` |
| `badge.heritage.date_palm_gifts.v1` | عطاء النخلة / Gifts of the Date Palm | `heritage.date_palm` · `foundation` | `learningPackageComplete(learning.date_palm.v1)` AND `activityComplete(activity.date_palm_reuse.parent_led.v1)` | `gallery.family.date_palm` |
| `badge.heritage.sadu_patterns.v1` | نقوش السدو / Al-Sadu Patterns | `heritage.sadu` · `foundation` | `learningPackageComplete(learning.sadu.v1)` AND `activityComplete(activity.sadu_original_pattern.v1)` | `gallery.family.sadu` |

CANONICAL STATION UNLOCK MAP — COPY EXACTLY
| Station ID | `unlocks[]` |
| --- | --- |
| `station.archive.012` | `badge.journey.seed_start.v1` |
| `station.archive.060` | `badge.journey.growing_branch.v1` |
| `station.water_coast.120` | `badge.journey.expanding_shade.v1` |
| `station.water_coast.132` | `learning.mangrove_roots.v1`; `badge_progress_reveal: badge.habitat.mangrove_care.v1` |
| `station.water_coast.144` | `garden_cosmetic.coastal_ripple.v1` |
| `station.water_coast.156` | `badge.skill.water.bud.v1` — criterion-gated evaluation |
| `station.water_coast.168` | `learning.jubail_mangrove.v1` |
| `station.water_coast.180` | `badge.journey.coastal_care.v1`; `garden.stage.next_after_mangrove.v1`; `chapter.preview.after_water_coast.v1` |

A badge reference asks for deterministic evaluation; it never bypasses prerequisites or criteria.

Do not invent or restore any draft-only label outside this 16-definition P0 registry. Appropriate
adult-help use may receive one calm, one-time recognition message, but it is not a gallery badge, grants no Seeds,
and creates no mastery track. Show it only when the task was authored as requiring adult help before
work began, help was requested/used, the Parent confirmed it, and the Child has not received the
one-time recognition before.

INFORMATION ARCHITECTURE
Keep the canonical three-item Child bottom navigation exactly as already approved, in physical
left-to-right order: “الدوري | حديقتي | اليوم”. Do not add a fourth item. Place a prominent
“مسار الأثر” module inside “حديقتي” and a compact next-unlock card on “اليوم”. Full Path, Gallery,
Badge Detail, and Story views are nested surfaces.

Use the approved cooperative groups icon for “الدوري”; never restore a trophy, podium, crown, or
competitive-rank icon. The Garden root header title is exactly “حديقتي”, never “My Garden”. Keep
the destination that owns the current root highlighted with icon, label, and a non-color state cue.

VISUAL SYSTEM
Continue the approved Ghaf Soft Geometric system: Bright Pearl #F7F8F3 foundation; Ghaf Emerald
#126A50; Deep Forest #0D3128; Mangrove Teal #188B83; Sky Mist #DDEFF0; restrained Solar Amber
#F2B84B; Ink #14221D. Use Alexandria for display/headings and Readex Pro for body, metadata, and
controls. Use original flat/vector botanical art, layered UAE terrain, soft organic forms, restrained
depth, and generous white space. Child mode may feel adventurous and premium but never babyish,
casino-like, militarized, neon, or like a dense game HUD.

LAYOUT AND ACCESSIBILITY
- Design every frame at exactly 390×844 px.
- Arabic is the authored primary state with true RTL; keep all text live and localizable.
- Never bake Arabic into art and never letter-space Arabic.
- P0 uses Latin digits `0–9` consistently with the existing Ghaf screens. Render visual progress
  as “120 من 180 بذرة”. Isolate each numeric token independently using
  the platform equivalent of `<bdi dir="ltr">` / `unicode-bidi: isolate`; do not isolate only the
  entire Arabic sentence. Apply the same rule to ranges, dates, times, fractions, and mixed-script
  names, and verify visual order plus TalkBack/VoiceOver reading order.
- Screen-reader copy expresses meaning rather than punctuation, for example “مئة وعشرون بذرة من أصل
  مئة وثمانين” and “خطوتان مكتملتان من أصل خمس خطوات”. Announce the Arabic state with the name:
  “مكتسبة”، “قيد التقدّم”، “مقفلة”، or “بانتظار مراجعة وليّ الأمر”.
- Arabic root Child header: use a physical LTR positioning container; Help is physically left, the
  title is independently and mathematically centered, and the botanical Ghaf avatar is physically
  right. Give each Arabic label its own RTL text direction.
- Arabic nested Child/Parent header: a right-pointing Back glyph is physically right, the title is
  independently centered, and the physical-left side is empty. Do not rely on icon auto-mirroring.
- Arabic forward CTA: a left-pointing glyph is physically left of the RTL label. English LTR mirrors
  semantically: Back and its left-pointing glyph are physically left; the forward/right-pointing
  glyph is physically right of the label; English bottom navigation is Today | My Garden | Shared Growth
  from physical left to right. Preserve the same destination identity and route in both locales.
- Bottom navigation remains fixed; internal content scrolls and clears it.
- Minimum touch target 48×48 px; primary action height 52–56 px; body text at least 14 px; high
  contrast; state is never communicated by color alone.
- At 200% text scale, reflow two-column grids to one column, allow controls to wrap vertically, keep
  all criteria visible, and prohibit horizontal page scrolling or clipped labels.
- Every motion concept must have a reduced-motion static/fade alternative.

CONTENT AND RIGHTS
Use original illustrations. Attraction, government, UNESCO, UAE emblem/flag, and Nation Brand marks
must not appear. Named locations may inspire independent educational stories only; do not imply
partnership, certification, a site visit, or that a digital task planted a real tree.

Use this direction for every prompt that follows. Do not create a screen in this step. Preserve it as
an addendum to the project’s DESIGN.md/design rules.
```

---

## Prompt 01 — Native Launch Screen and Ghaf Opening Moment

Generate two adjacent, clearly labelled frames. Do not merge them.

```text
Using the locked Ghaf system, create two distinct opening surfaces at 390×844 px.

FRAME A — “Ghaf — System Launch”
This represents the operating-system launch screen, not a marketing page. Use a solid Bright Pearl
field with only the existing canonical adaptive Ghaf app icon precisely
centered. No text, tagline, CTA, spinner, progress percentage, legal copy, illustration, or fake
loading. The design should visually bridge into Frame B and be able to disappear immediately when
the app is ready. It may be presented by the operating system on cold or warm launch, but it is not
an app route and is never clickable. Do not invent a new logo.

FRAME B — “Ghaf — Opening Moment”
Create the static final frame of a brief 700–800 ms first-install-only in-app brand reveal. A single Seed has settled
into a minimal layered UAE landscape line and one Ghaf leaf has opened. Show the live Arabic wordmark
“غاف” and live tagline “كل خطوة صغيرة تُنبت أثرًا.” Use calm Mangrove Teal and Ghaf Emerald over
Bright Pearl with a warm Solar Amber dawn accent. The result should feel fresh, optimistic, and
premium enough to make a family curious to continue, without a button or an artificial wait. Show it
only during `first_run` after a fresh install and only after the first stable app frame is ready. Do
not show it for `version_update`, `manual_replay`, a returning user, or a warm/hot resume.

Add a small annotation outside the mobile frames describing the transition: Seed settles → leaf
opens → wordmark resolves → route continues. Reduced motion: static end state plus dissolve. Do not
place this annotation inside the UI. Annotate the modes explicitly:
- `first_run`: Frame B → Onboarding 1 → Access/Role setup;
- `version_update`: bypass Frame B and onboarding, restore the authorized root, and optionally show a
  quiet “ما الجديد؟” entry that starts `manual_replay` only after the user chooses it;
- `manual_replay`: bypass Frame B, start Onboarding 1, and return to the recorded authorized origin
  after Skip/completion instead of Access;
- normal return: authenticated user restores the last valid role root or authorized deep link;
  signed-out user opens Access while preserving an authorized pending deep link for post-auth resume;
- recoverable bootstrap error: dismiss System Launch into Retry; successful Retry resumes the same
  mode/deep link without replaying onboarding or mutating progress.
```

### Targeted correction if Stitch creates a long splash

```text
Correct only the opening architecture. Remove every spinner, percentage, CTA, and forced-duration
message from the System Launch frame. Keep the Ghaf Opening Moment as a separate in-app surface. It
must never block readiness for several seconds; show only the final visual state on the canvas.
```

---

## Prompt 02 — First-run onboarding, three connected screens

```text
Using the approved Ghaf opening direction, create exactly three connected first-run onboarding
screens side by side at 390×844 px. This onboarding appears once, can be skipped, and can later be
replayed. Make the set visually exciting through botanical discovery, clear progress, and a preview
of meaningful future goals—not urgency or reward pressure.

This flow appears before the app knows whether the person is a Parent or Child. Use role-neutral,
gender-neutral Arabic throughout; do not address an unknown person with masculine or feminine verb
forms, and do not imply that a Child profile or progress already exists.

SHARED ANATOMY
- Top safe area: quiet “تخطّي المقدمة” action on the physical left with a 48×48 px target; no account
  avatar yet.
- Live progress label near the top using independently isolated numbers: “الخطوة 1 من 3”, etc.
- One dominant original vector illustration occupying roughly the upper half.
- Title, two short supporting lines, and one full-width 56 px primary action near the bottom.
- Keep text readable at 14 px or larger and actions clear of the safe area.
- Do not request notifications, location, camera, microphone, ratings, purchases, or personal data.

SCREEN 1 — “Ghaf — Onboarding — Purpose”
Title: “خطوات صغيرة، أثر يكبر”
Body: “تتحوّل مهام الأسرة اليومية إلى عادات للعناية بالبيت والبيئة من حولنا.”
Support: “كل خطوة واضحة تساعد الأثر على النمو.”
Illustration: two non-identifiable family hands tending one Ghaf sapling, with subtle desert, coast,
and oasis layers emerging around it. Avoid gender stereotypes and cartoon characters.
Primary: “التالي”, with forward arrow on the physical left.

SCREEN 2 — “Ghaf — Onboarding — Core Loop”
Title: “من المهمة إلى البذور”
Body: “بعد مراجعة أحد الوالدين أو وليّ الأمر، تتحوّل المهمة المكتملة والمؤهلة إلى بذور تساعد الحديقة على بلوغ مراحل جديدة.”
Support: “تُضاف البذور بعد المراجعة، ليبقى التقدّم واضحًا وعادلًا.”
Illustration/UI demo: one sample recycling task card, a visible Parent-review check, and one demo Seed
moving toward a young Mangrove. Label the module “تجربة توضيحية”. Make clear that submission alone
does not award anything.
Wire the isolated demo inside this frame: initial sample card “مهمة تجريبية” → tap “عرض كيف تعمل” →
state “أُرسلت للمراجعة — لا بذور بعد” → tap a clearly labelled simulated Parent-review control
“محاكاة الموافقة” → show one demo Seed moving to the plant and “مثال فقط — لم يتغيّر أي ملف”. Provide
“إعادة التجربة”. Every demo state stays inside onboarding and writes no profile, task, ledger, story,
badge, analytics identity, or permission.
Primary: “التالي”. Secondary: “السابق”.

SCREEN 3 — “Ghaf — Onboarding — Badges”
Title: “شارات من بيئتنا وتراثنا”
Body: “تفتح المهام التي تمت مراجعتها ووحدات التعلّم مسارات عن الغاف والقرم والواحات والتراث ومعالم الاستدامة. لكل شارة معيار واضح، وكل شارة مكتسبة تبقى في المجموعة.”
Support: “توجد مسارات مختلفة، والتقدّم فيها يتم بالوتيرة المناسبة لكل أسرة.”
Privacy line in a quiet Sky Mist capsule: “رحلتك خاصة بأسرتك، ولا توجد قوائم ترتيب عامة.”
Preview: one earned sample badge in full color, two reachable next badges with explicit short
requirements, and three quiet farther-ahead silhouettes. Use mastery labels “برعم · غصن · ظل”.
Primary: “بدء الرحلة”. Secondary: “السابق”.
Do not place “الدخول برمز الطفل” on this onboarding screen; that action belongs only to the Access
surface, never to onboarding.

INTERACTION ANNOTATIONS OUTSIDE THE FRAMES
- In `first_run`, Skip and “بدء الرحلة” route to existing Access/Role setup. In `manual_replay`, they
  return to the recorded authorized origin. `version_update` does not auto-open onboarding. No mode creates a profile, Seeds, a
  badge, a task, or any other progress.
- Screen 2 demo is isolated and does not modify Salem’s real Seed or badge state.
- Returning users see onboarding only after explicit manual replay; an update may offer a quiet
  replay entry but never auto-opens or blocks the valid root. Manual replay never replays the Opening Moment.
- Reduced motion uses state changes and opacity only.
```

### Targeted correction if onboarding becomes childish

```text
Refine only the visual tone of the three onboarding frames. Keep all copy and anatomy unchanged.
Increase editorial confidence, landscape depth, and premium typography; reduce toy-like icons,
oversized bubbles, mascots, gradients, and decorative stars. The audience is a capable UAE child
around age 9–11 and their parent, not a preschool audience.
```

---

## Prompt 03 — Access handoff after onboarding

Use this only if the existing welcome/access screen needs an onboarding handoff state.

```text
Create one refinement of the existing Ghaf welcome/access screen that follows onboarding. Preserve
the existing logo, design system, authentication truth, and synthetic-data disclosure.

Title: “رحلتكم تبدأ من هنا”
Body: “يُعدّ وليّ الأمر العائلة، ثم يدخل كل طفل بمساره الخاص.”
Primary action: “إعداد العائلة”
Secondary action: “الدخول برمز الطفل”
Quiet action: “إعادة عرض المقدمة” inside Help/Settings, not as a dominant entry action.

Do not create an account automatically. Do not ask a Child for email, phone, school, exact age,
precise location, camera, or microphone. Do not make Parent and Child a reversible in-app role toggle.
```

---

## Prompt 04 — Refine Child Today and Child Garden entry points

Generate refinements of the two existing root screens. Do not replace their approved structure.

```text
Refine only the existing “Ghaf — Child Today” and “Ghaf — Child Garden — Next Stage” screens to make
the new Impact Path a main, discoverable part of Salem’s experience. Keep all existing task, garden,
header, navigation, privacy, scrolling, and physical-position decisions.

FRAME A — CHILD TODAY REFINEMENT
Keep the root header title exactly “اليوم”. Keep Help physically left and the botanical avatar
physically right. Keep the physical-right “اليوم” navigation destination active.
Below the primary task card and above lower educational content, add a compact Soft Geometric card:
- eyebrow: “مسار الأثر”
- title: “محطتك التالية قريبة”
- progress: “120 من 180 بذرة” with each number isolated independently
- next unlock: “تبقّت 12 بذرة إلى محطة «بين جذور القرم»؛ عند 132 تُفتح الحكاية”
- a short linear/organic progress indicator with explicit text, not color alone
- one action: “عرض مساري”, with the arrow on the physical left

FRAME B — CHILD GARDEN REFINEMENT
Keep the root header title exactly “حديقتي”, never “My Garden”. Keep Help physically left and the
botanical avatar physically right. Keep the center “حديقتي” navigation destination active.
Preserve the canonical Mangrove hero and “achievement preserved” content. Directly after the current
garden-stage summary, add one prominent Impact Path module:
- archived Mangrove remains “60 من 60 — مكتملة”; do not replace this plant-growth denominator with
  the lifetime-Seed path or reset it
- heading: “مسار الأثر”
- current chapter: “العناية بالمياه والسواحل”
- progress: “120 من 180 بذرة” with each number isolated independently
- nearest mastery: “ترشيد المياه — برعم”: show action criterion “2 من 2” complete and station
  criterion “120 من 156” incomplete; do not present the badge as earned
- primary: “عرض مسار الأثر”
- secondary: “عرض شاراتي”
On both roots, preserve the physical left-to-right navigation order “الدوري | حديقتي | اليوم”. Use
the cooperative groups icon for “الدوري” and never a trophy.

Do not add another currency, fourth navigation destination, shop, reward claim badge, timer, or
pulsing notification dot. Internal content must scroll fully above the fixed navigation.
```

---

## Prompt 05 — Child Impact Path home

```text
Create a new nested screen named “Ghaf — Child Impact Path — Water & Coast” at 390×844 px.

HEADER
Use a physical-right Back control, mathematically centered title “مسار الأثر”, and an empty physical
left side. Use a right-pointing glyph in Arabic. Minimum 48×48 px target. No bottom navigation on
this nested view. Back returns to the true origin and restores its scroll position: Today when opened
from Today, Garden when opened from Garden; never hard-code one parent route.

USER AND MOMENT
Salem, age 9–11, has 120 lifetime approved Seeds and has completed the current Mangrove stage. He
wants to understand where he is, what comes next, and why the next chapter matters.

HERO
- eyebrow: “مرحلتك الحالية”
- title: “العناية بالمياه والسواحل”
- promise: “كل قطرة نوفرها، وكل مادة نفرزها، تساعدنا على فهم موائل الساحل والعناية بها.”
- progress: “120 من 180 بذرة” and “تبقّت 60 بذرة للمحطة الكبرى”, isolating each numeric token
- small permanence note: “أثرك محفوظ، ويمكنك المتابعة من حيث توقفت.”
- original illustration blending a young Mangrove, shallow coast, and water ripples; no baked text.

PATH
Create an original gently curving vertical botanical path, not a copy of any battle-pass road. Show
six deterministic stations with large enough tap targets:
1. 120 — “بداية المرحلة” — complete
2. 132 — “بين جذور القرم” — next; exactly 12 Seeds remain; reaching it unlocks
   `learning.mangrove_roots.v1`, including its story and story-disabled routes, and exposes “رعاية القرم” progress, but does
   not automatically award that badge
3. 144 — “تموّج الساحل” — visible cosmetic preview
4. 156 — “ترشيد المياه” — the “ترشيد المياه — برعم” badge requires this station plus 2 unique
   approved water-care tasks; in Salem’s 120-Seed fixture, show tasks “2 من 2” complete and station
   progress “120 من 156” incomplete
5. 168 — “حكاية جزيرة الجبيل” — place story; not a visit badge
6. 180 — “رعاية الساحل” — single canonical chapter award plus the specifically configured next
   garden-stage transition and a quiet preview of the next evergreen stage. If that garden asset is
   not approved, show “المرحلة التالية قيد الإعداد” and do not invent a named tree or growth result.

Only current + next three should dominate; farther stations remain visible but quiet. Every station
shows its exact requirement; no mystery lock, price, odds, timer, rarity, or claim button. For a
composite station, show its Seed threshold and action/story criterion separately. Reaching the Seed
threshold never presents an unmet mastery badge as earned; retain a visible in-progress state with
the exact remaining criterion.

If the Parent has turned UAE learning stories off, never hide a required station, strand progress,
or silently weaken its criterion. In the same station, offer the reviewed Parent-approved equivalent
activity defined by the registry, label it “نشاط تعلّم بديل”, and explain that either route satisfies
the same learning component. Keep this alternative discoverable as “طريقة أخرى للتعلّم” even when
stories are enabled. Turning stories back on preserves all prior progress.

LOWER CONTENT
- section “ماذا تودّ أن تستكشف؟” with equal choices: “الطبيعة · الموارد · تراث الإمارات · حكايات الأماكن”
- compact “أقرب تقدّم إليك” card showing the two separate “ترشيد المياه — برعم” requirements above;
  also preview the later “ترشيد المياه — غصن” task mastery as “2 من 5”, clearly blocked until
  “برعم” is earned
- quiet archive action “عرض المراحل المحفوظة”; completed stages and unfinished highlighted content
  remain browsable without an expired or lost label
- full-width primary action “عرض مهمة مناسبة” opens only an existing Parent-assigned eligible task;
  it never creates, assigns, or approves a task for the Child
- when no eligible assigned task exists, replace the primary action with a neutral empty state:
  “لا توجد مهمة مناسبة الآن. يمكن لوليّ الأمر إضافة مهمة جديدة.” and “العودة إلى حديقتي”
- quiet finite exit “اكتملت خطوات اليوم” / “العودة إلى حديقتي”

The central area scrolls with sufficient bottom clearance. Use Alexandria hierarchy, Readex Pro
metadata, original art, high contrast, and non-color status symbols.
```

### Targeted correction if Stitch makes it look like a battle pass

```text
Correct only the Impact Path visual metaphor. Remove rails, metallic tier plates, loot containers,
crowns, rarity beams, glowing claim buttons, and dual reward rows. Replace them with one organic
botanical trail, quiet station stones/leaves, original UAE habitat vignettes, and explicit text
requirements. Keep all milestone values and copy unchanged.
```

---

## Prompt 06 — Child Badge Gallery

```text
Create a new nested screen named “Ghaf — Child Badges — Gallery” at 390×844 px.

HEADER
Physical-right Back control with a right-pointing Arabic glyph, centered title “شاراتي”, empty
physical-left side. No bottom navigation. Back returns to the true originating screen and restores its
state and scroll position.

INTRODUCTION
- live copy: “كل شارة تحفظ تعلّمًا وممارسة حقيقية.”
- private label: “خاص بأسرتك”
- derived count, never a decorative constant. In the canonical post-approval Salem fixture it is
  “4 شارات مكتسبة”, derived from “بذرة البداية”, “غصن نامٍ”, “ظلّ يتّسع”, and
  “الفرز الذكي — برعم”. Never copy Salem’s count to Alia or a newly created Child.

FILTERS
Canonical state row: “الكل · مكتسبة · قيد التقدّم · التالية”. “التالية” is the derived
next-recommended view, not a stored badge state.
Canonical category row: “الرحلة · العناية بالموارد · الموائل والتنوع · التراث · الطاقة”, explicitly
mapped to the full domain families in the 16-definition registry. Do not create an “الأماكن” badge
family; place stories are learning-package content. Locked items remain discoverable under “الكل” and
their category even when they are not selected as “التالية”.
Use accessible segmented controls that scroll only if necessary; no required content may depend on
a hidden carousel.

GALLERY
Use a breathable two-column grid with original badge medallions that feel like carved leaves,
seeds, water ripples, woven geometry, or habitat emblems—not coins, military medals, or loot rarity.
Include these visible states:
- earned journey cards: “بذرة البداية”, “غصن نامٍ”, and “ظلّ يتّسع”, each with earned date, exact
  threshold, and full color;
- earned: “الفرز الذكي — برعم” only when one unique safe-sorting task is approved;
- composite in progress: “ترشيد المياه — برعم”, showing action “2 من 2” complete and station
  “120 من 156” incomplete; do not dim the completed requirement or label the badge earned;
- later mastery preview: “ترشيد المياه — غصن”, “2 من 5”, with prerequisite “برعم قيد التقدم”;
- available later with visible progress: “رعاية القرم”, with all three exact components shown separately: reach station
  132, complete `learning.mangrove_roots.v1` or its approved equivalent, and complete 3 unique approved
  events credited to `skill.coast_care`. In Salem’s canonical fixture show station 120/132, learning 0/1, and
  coast-care actions 3/3; no component may be implied complete without fixture evidence;
- not started: “نقوش السدو”, with its reviewed story/equivalent plus original-pattern criterion and
  cultural-review-safe generic original geometry;
- not started: “عطاء النخلة”, with its reviewed story/equivalent plus one Parent-led reuse activity.

“بين جذور القرم” is a learning story/station, not a P0 badge or collectible stamp. Do not place it in
the badge grid. Link to it from the relevant “رعاية القرم” criterion only after station 132 is reached.

Locked/not-started cards are quiet silhouettes but never hide the criterion. Do not show “rare”,
“legendary”, odds, countdowns, price, share-to-public, or notification pressure. Include a clear
empty state variant outside the main frame annotation: “لم تبدأ هذه المجموعة بعد. يمكن فتح أي شارة
لرؤية طريقها بوضوح.”

Every card announces one canonical Arabic accessibility state—“مكتسبة”، “قيد التقدّم”، “مقفلة”، or
“بانتظار مراجعة وليّ الأمر”—plus its next criterion. A locked card uses the encouraging visible
label “متاحة لاحقًا”, while its accessible name still says “مقفلة” and explains why; for example,
“ترشيد المياه — برعم، مقفلة؛ اكتملت خطوتان من خطوتين، وتتبقّى محطة 156”. Never use opacity alone,
“فشلت”, “متأخر”, or a red failure treatment.

Create two compact state variants beside the main frame:
1. “Alia / Existing Child”: derive all counts and card states from Alia’s own ledger and awards. If no
   Alia fixture exists, show the new-Child empty state rather than inventing or copying Salem data.
2. “New Child”: count “0 شارات مكتسبة”, no earned styling, and the exact first eligible criteria for
   “بذرة البداية” and “الفرز الذكي — برعم”. Do not imply failure or being behind.

At 200% text scale, convert the grid to one column and the segmented filters to wrapped full-width
controls. No horizontal page scrolling, clipped criteria, or hidden-carousel dependency.
```

---

## Prompt 07 — Badge Detail sheet and its states

```text
From the approved Badge Gallery, create a 28 px radius Bright Pearl bottom sheet named
“Ghaf — Badge Detail — Mangrove Care”. Show it over a softly scrimmed Gallery. Keep the Gallery
recognizable but non-interactive behind the sheet.

SHEET CONTENT
- drag handle and accessible close action
- eyebrow: “تفاصيل الشارة”
- original badge art
- title: “رعاية القرم”
- status: “قيد التقدم”
- description: “توثّق تعلّمًا عن موائل القرم وممارسة خطوات للعناية بالمياه والمواد.”
- heading: “لماذا تهم؟”
- copy: “تساعد جذور القرم على تثبيت التربة وتهدئة حركة المياه، وتوفّر موطنًا لكائنات ساحلية.”
- heading: “طريق الشارة”
- show three independently labelled, non-color-only requirements: (1) reach station 132; (2) complete
  `learning.mangrove_roots.v1` or its Parent-approved equivalent; (3) complete 3 unique approved
  events credited to `skill.coast_care`. Derive and show current/target progress for each requirement; never replace
  these with one misleading combined percentage.
- current 120-Seed state: station “120 من 132”; learning “0 من 1 — تُفتح عند المحطة”; coast-care
  actions “3 من 3”.
- review clarification: “تُحتسب المهمة بعد مراجعة أحد الوالدين أو وليّ الأمر والموافقة عليها.”
- permanence: “بعد اكتساب الشارة، تبقى في المجموعة دائمًا.”
- visible source card: heading “مصدر المعرفة”; publisher “هيئة البيئة – أبوظبي”; source title
  “منتزه القرم الوطني”; research-ledger reference “E2”; “تاريخ الاطلاع على المصدر: 2 سبتمبر 2026”; and accessible “عرض المصدر”. Keep the
  source URL in the prototype annotation, not as tiny raw UI text:
  https://www.ead.gov.ae/en/experience-green-abu-dhabi/places-to-go/mangrove-national-park
- primary before station 132: “عرض مسار الأثر”; after station 132: “بدء حكاية بين جذور القرم”; when
  Parent has disabled stories: “عرض نشاط التعلّم البديل”. Every state remains completable.
- secondary: “العودة إلى شاراتي”

Create two small state variants beside it:
1. Earned “الفرز الذكي — غصن”: “اكتملت متطلبات الشارة في 2 سبتمبر 2026”, “3 مهام فريدة من 3”,
   “معيار من نظام غاف”, and “خاص بالعائلة”; no undefined showcase action and no public Share. In
   implementation, the date is localized from the award record rather than hard-coded.
2. Place-inspired learning: show “محتوى تعليمي مستقل داخل غاف، وليس اعتمادًا رسميًا من الموقع.” and
   state that a visit, GPS, photo, and microphone are not required.

The sheet must scroll internally when text grows and clear the fixed actions/keyboard. Do not hide
criteria in an accordion. Closing or Back returns to the exact origin—Gallery or Path—with filters,
scroll position, and focus restored.
```

---

## Prompt 08 — Single RevealBundle after a committed event

```text
Create one 28 px radius, internally scrollable surface named “Ghaf — Child RevealBundle — Approved”
at 390×844 px. This single surface replaces the separate Garden Growth Moment plus Achievement modal:
do not present, stack, or sequence another growth, badge, station, story, or safe-help celebration for
the same event. The underlying state is already committed; closing the surface cannot undo it.

EMOTIONAL GOAL
Create a calm but memorable botanical achievement reveal that makes Salem proud of the action and
curious about the journey. Use one leaf unfurl, subtle coastal light, and the badge settling into its
place. No confetti, fireworks, chest opening, shower of coins, rarity beam, pulsing claim button,
autoplay sound, or infinite next reward.

PRIMARY CANONICAL APPROVAL BUNDLE — `task.recycling_sort.v1`
- committed before→after: 108→120 lifetime Seeds and Mangrove 48/60→60/60
- Parent praise appears first
- one botanical consequence block shows the Mangrove reaching 60/60 and the stage becoming archived
  as complete; this is the former Garden Growth Moment content inside this same RevealBundle
- one Seed line: “أُضيفت 12 بذرة؛ أصبح المجموع 120 بذرة.”
- one achievement area contains both newly earned badges, “ظلّ يتّسع” and
  “الفرز الذكي — برعم”, when their canonical criteria are newly met
- any eligible `recognition.safe_help_once.v1` is one descriptive praise line in this same bundle,
  never a badge, tile, progress target, or second surface
- actions: “عرض حديقتي”, “عرض مسار الأثر”, and quiet “اكتملت خطوات اليوم”

FUTURE 132 VARIANT
Beside the primary frame, create one compact state variant for this exact future fixture: Salem has
120 lifetime Seeds and 2/3 sorting credits; Parent approval adds +12 and the third sorting credit.
The committed result is 132 Seeds; station “بين جذور القرم” and `learning.mangrove_roots.v1` unlock;
“الفرز الذكي — غصن” is earned; archived Mangrove remains 60/60 with no invented plant change.

VARIANT CONTENT
- eyebrow: “لحظة إنجاز”
- title: “شارة جديدة: «الفرز الذكي — غصن»”
- support: “عمل رائع يا سالم. كل خطوة تضيف أثرًا.”
- one compact committed-results list, in this order:
  1. “أُضيفت 12 بذرة؛ أصبح المجموع 132 من 180 بذرة.”
  2. “وصل مسار الأثر إلى محطة «بين جذور القرم»، وفُتحت حكاية جديدة.”
  3. “اكتملت متطلبات «الفرز الذكي — غصن»: 3 مهام فريدة من 3.”
- permanence: “الشارة والتقدّم محفوظان في مجموعة سالم الخاصة بالعائلة.”
- primary: “عرض الشارة”
- secondary: “عرض مسار الأثر”
- quiet finish: “اكتملت خطوات اليوم”

Each frame represents exactly one `RevealBundle`. If another committed event produces a different
result count, generate the sections from that event’s actual result set and use correct Arabic
singular/dual/plural grammar; never hard-code “وإنجازان آخران”. “عرض الشارة” opens the earned Badge
Detail; “عرض مسار الأثر” opens the reached station; the quiet finish returns to Today. Reduced motion
shows the final arrangement immediately with one complete, encouraging screen-reader announcement.
```

---

## Prompt 09 — Mangrove learning package: story and equal-credit alternative

```text
Create two adjacent, fully designed 390×844 px routes for the same learning package
`learning.mangrove_roots.v1`. They are equal-credit alternatives with the same reviewed learning
objective and no-fail check. Neither route is a travel check-in, content feed, lesser option, or Seed
reward. Do not make Frame B a small annotation.

FRAME A — “Ghaf — Learning Package — Between the Mangrove Roots — Story”

HEADER
Physical-right Back with a right-pointing Arabic glyph, centered title “رحلة الإمارات”, empty
physical-left. No bottom navigation. Back returns to the exact originating Path/Badge Detail state.

HERO
- eyebrow: “حكاية مكان · أبوظبي”
- title: “بين جذور القرم”
- subtitle: “اكتشف كيف تساعد أشجار القرم على حماية الساحل وتمنح الكائنات موطنًا.”
- original vector Mangrove/coast illustration with no copied photography, logo, map, branded building,
  or baked text.

THREE SHORT STORY SECTIONS
1. “جذور تتنفس” — explain in short age-appropriate live text that some Mangrove roots rise above the
   mud to reach air.
2. “مأوى على الساحل” — explain that fish, birds, and other life find food/protection among roots and
   calm water.
3. “حارس طبيعي” — explain that roots help stabilize soil and soften water movement at the coast.

INTERACTION
One no-fail card-ordering activity: arrange three illustrated cards to show how roots support a
coastal habitat. Offer explanation after any attempt; do not show lives, score, countdown, or wrong
red alarm. Progress line: “تكتمل إحدى خطوات شارة «رعاية القرم».” Show that the station requirement is
complete, this story requirement becomes complete only after “إكمال الحكاية”, and the separate
`skill.coast_care` criterion remains derived from approved history. In the canonical station-132
fixture it is 3/3; therefore completing either learning route satisfies the final missing criterion
and may unlock “رعاية القرم”. Never award it before all three components are true.

SAFETY AND PRIVACY
Open, non-collapsible Sky Mist note:
- “يمكنك إكمال الحكاية من المنزل؛ زيارة المكان ليست شرطًا.”
- “لا يحتاج غاف إلى موقعك الجغرافي لإكمال هذه الحكاية.”
- “محتوى تعليمي مستقل؛ لا يعني عرضه وجود شراكة رسمية مع الموقع.”

VISIBLE SOURCE
Add an open, readable “مصدر المعرفة” card—not an accordion—with publisher “هيئة البيئة – أبوظبي”,
source title “منتزه القرم الوطني”, research-ledger reference “E2”, “تاريخ الاطلاع على المصدر: 2 سبتمبر 2026”, and an accessible “عرض
المصدر” action. Keep this source URL in the prototype annotation:
https://www.ead.gov.ae/en/experience-green-abu-dhabi/places-to-go/mangrove-national-park

PRIMARY ACTION
“إكمال الحكاية”. Completed state: “اكتملت الحكاية، وأضفنا معرفة جديدة إلى الرحلة.” Then show a visible
“حفظ وخروج”. Do not autoplay another story or task. If the Parent later turns stories off, a story
already completed or earned remains visible in the archive; the setting cannot remove progress.

FRAME B — “Ghaf — Learning Package — Between the Mangrove Roots — Accessible Alternative”
Use the same nested header, source, privacy safeguards, origin route, learning-package ID, and final
check. Title: “تعلّم بطريقة أخرى”. Support: “المعرفة نفسها بخطوات مختصرة وواضحة.” Present the same
three reviewed concepts as large, plain-language illustrated fact cards with optional text-to-speech,
no travelling animation, no time limit, and no hidden carousel. After all three cards are explored,
show the same no-fail ordering check. Also offer an equal Parent-guided offline discussion route with
the visible confirmation “ناقشنا الفكرة مع وليّ الأمر”; it requires explicit Parent confirmation and
does not collect a recording, photo, or free-text transcript. Primary: “إكمال وحدة التعلّم”.
Frame B remains visibly available as “طريقة أخرى للتعلّم” even when stories are enabled; when the
Parent disables stories it becomes the default route. It is never described as reduced credit.

COMPLETION AND REVEAL FOR EITHER FRAME
Commit one idempotent `LearningCompletionEvent` with Seed delta 0 and garden-growth delta 0. Re-evaluate
only criteria referencing this package/activity. With station 132 reached and
`masteryCredit(skill.coast_care) = 3`, award “رعاية القرم” and show exactly one zero-Seed learning
`RevealBundle`: “اكتملت وحدة التعلّم” + “شارة جديدة: رعاية القرم” + “لم يتغيّر رصيد البذور”. Do not
show a separate story-complete modal or another badge modal. If no badge unlocks, use one finite
completion state and return to the recorded origin.
```

---

## Prompt 10 — Parent view of Salem’s progress and badges

```text
Create a nested Parent screen named “Ghaf — Parent — Salem Progress & Achievements” at 390×844 px.
Keep Parent mode calmer and denser than Child mode while preserving Soft Geometric continuity.

HEADER
Physical-right Back control with a right-pointing Arabic glyph and accessible label “العودة إلى
العائلة”, centered title “تقدّم سالم”, empty physical-left side. Internal content scrolls above a
fixed safe-area action bar. Back returns to the exact selected-Child origin without changing profile.

INTRODUCTION
- “نظرة هادئة على ما أنجزه سالم، وما يتعلمه، وما يمكن دعمه فيه بعد ذلك.”
- privacy badge: “خاص بالعائلة”
- privacy copy: “لا تظهر شارات سالم أو أرقام تقدّمه للعائلات الأخرى.”

SUMMARY
- current stage: “العناية بالمياه والسواحل”
- “120 من 180 بذرة” with independently isolated numeric tokens
- derived post-approval Salem count: “4 شارات مكتسبة”, supported only by the exact P0 fixture:
  “بذرة البداية”, “غصن نامٍ”, “ظلّ يتّسع”, and “الفرز الذكي — برعم”
- derived active-progress count: “4 شارات قيد التقدم”: “رعاية الساحل” 120/180,
  “الفرز الذكي — غصن” 1/3, “ترشيد الطاقة — برعم” 1/2, and “جذور الغاف” learning 1/1 plus
  nature-care actions 2/3. Keep station-gated “ترشيد المياه — برعم” and “رعاية القرم” visibly locked
  with their completed and incomplete components—Water: actions 2/2 plus Seeds 120/156; Mangrove:
  station 120/132, learning 0/1, coast-care actions 3/3. Do not count them as active progress.
- current approval bundle: “مهمة واحدة تمت مراجعتها، و12 بذرة مضافة، وشارتان جديدتان”
Use no sibling side-by-side totals, behavior score, morality score, rank, prediction, diagnosis, or
alarmist trend.

RECENT AND IN-PROGRESS DETAIL
- “أحدث الشارات”: show “ظلّ يتّسع” at 120/120 and “الفرز الذكي — برعم” at 1/1, each with localized
  earned date and exact criterion.
- “تقدّم يمكن دعمه”: show at least “الفرز الذكي — غصن” 1/3; “ترشيد المياه — برعم” with actions 2/2
  complete plus station 120/156 incomplete; and “جذور الغاف” with learning 1/1 plus actions 2/3.
- “المسار الحالي”: “العناية بالمياه والسواحل”. If no optional Child-selected path exists in the
  fixture, say “لا يوجد مسار اختياري محدد” rather than inferring interests from behavior.

LEARNING AND SUPPORT
- heading: “ما الذي يتعلمه سالم؟”
- “الفرز وإعادة الاستخدام، والعناية بالموارد، ودور القرم في حماية الساحل.”
- next support: “بقيت مهمتان للوصول إلى «الفرز الذكي — غصن».”
- primary contextual action: “إنشاء مهمة مناسبة” opens the existing Parent Task Builder with a
  transparent suggestion; nothing is assigned until the Parent reviews and saves it
- secondary: “عرض شارات سالم”

PARENT CONTROLS
P0 contains one clear full-width Parent setting row only:
- “حكايات التعلّم من الإمارات”: on/off. Turning this off exposes the equally credited accessible
  learning module or Parent-guided discussion confirmation, never a dead end; completed stories and
  earned progress remain visible. When on, the alternative remains available as another accessible
  learning choice.
Do not render reminder, notification, weekly-summary, or undefined badge-showcase/profile controls in
the P0 frame. Add one annotation outside the frame: “P1 candidate after validation: Parent-owned quiet
notice/weekly summary, default off; no push permission or remote delivery in this prototype.”

SAFEGUARD PANEL
Title: “مصممة للنمو، لا للضغط”
Copy: “لا توجد مشتريات أو مكافآت عشوائية أو قوائم ترتيب عامة. لا تنتهي الشارات، ولا يفقد سالم تقدّمه إذا أخذ استراحة. تُكتسب الشارات من مهام معتمدة وحكايات مكتملة، ولا يمكن شراؤها أو فتحها يدويًا.”

FIXED ACTION
“حفظ الإعدادات”; clean state “الإعدادات محفوظة”. Ensure every content block can scroll fully above
the action bar. Retain the prototype/synthetic-data truth where the current Parent experience shows it.

Create two compact fixture variants beside the main frame:
1. Alia: derive counts and cards only from Alia’s own fixture; if none exists, show the new-Child
   state and never copy Salem’s 120 Seeds or four earned badges.
2. New Child: 0 Seeds, 0 earned badges, no negative trend language, and a clear first-step explanation.
```

---

## Prompt 11 — Design-system components and state matrix

```text
Using the approved generated screens, create a compact component/state reference on the canvas. Do
not redesign the application screens.

Include:
- Impact Path station: complete, current, next, ready to explore, and farther ahead;
- badge card using only the exact P0 registry: earned, in progress, next recommended,
  prerequisite-locked, station-locked, not started, and awaiting Parent review;
- mastery stages: برعم, غصن, ظل using shape/label differences, not metallic rarity colors;
- badge detail sheet: in progress, earned, and place-story disclaimer;
- one combined `RevealBundle`: one result, several results with dynamic Arabic grammar, and
  reduced-motion final state; never a modal stack or fixed “وإنجازان آخران” count;
- onboarding indicator, Skip, Back, and replay entry;
- progress card for Today and Garden;
- Parent privacy and safeguard panels;
- stories-enabled and equal-credit stories-disabled learning routes, both with a finite exit;
- Salem, Alia/no-fixture, and New Child derived-data states; never shared decorative counts;
- loading, offline, empty, long Arabic text, 200% one-column reflow, and focus states.

Document the Arabic/English physical-position matrix, right-pointing Arabic Back glyph, 48×48 targets,
52–56 px actions, safe-area clearance, live Arabic text, `ar-AE`/`en` metadata, per-token bidi
isolation, Latin digits `0–9`, Alexandria/Readex Pro type usage, approved palette tokens,
true-origin Back restoration, visible source rows, and accessible state/progress labels.
Explicitly mark these prohibited states: paid track, random reward, timer, streak-loss warning,
public share, public rank, GPS check-in, and unreviewed official-partner claim.

Export or append these rules to the project’s DESIGN.md so future Stitch and coding work can reuse
the same system.
```

---

## Prompt 12 — Wire the prototype flow

```text
Connect the approved screens into a clickable prototype without changing their visual design.

LAUNCH AND ROLE ROUTING
- `BOOT` → system-owned `OS_SPLASH` while the stable frame is unavailable; no app timer or clickable
  route.
- `first_run` means fresh install only: optional 700–800 ms Opening Moment → role-neutral Onboarding 1
  → wired Onboarding 2 demo → Onboarding 3 → Access/Role setup. Reduced motion uses one static end
  state and brief dissolve.
- `version_update` bypasses Opening Moment and onboarding, then restores the authorized route/session.
  A quiet optional “ما الجديد؟” entry may start `manual_replay`; no update blocks entry with onboarding.
- `manual_replay` means Help/Settings started onboarding: bypass Opening Moment, record the authorized
  `originRoute`, and return to that exact origin after Skip/completion. It never routes a signed-in
  user to Access merely because onboarding was replayed.
- During `first_run`, Skip and “بدء الرحلة” go to Access. In all modes, Back preserves the current step,
  and onboarding writes no profile, task, Seed, story completion, badge, or analytics identity.
- Normal return: authenticated Child restores the last valid Child root, else Today; authenticated
  Parent restores the last valid Parent root, else Parent Home; signed-out user opens Access.
- Preserve an authorized pending deep link across bootstrap and sign-in, then resume it only if it is
  valid for the active role/profile. An invalid or unauthorized link falls back to the role-safe root
  with a quiet explanation and never exposes another profile.
- Recoverable bootstrap failure opens Retry outside `OS_SPLASH`; successful Retry resumes the same
  mode, authorized deep link, onboarding step, and origin without replaying a committed event.

CHILD ROUTES AND TRUE-ORIGIN BACK
- Child Today → “عرض مساري” → Impact Path with `originRoute=Today`.
- Child Garden → “عرض مسار الأثر” → Impact Path with `originRoute=Garden`.
- Child Garden → “عرض شاراتي” → Badge Gallery with `originRoute=Garden`.
- Path/Gallery → Badge Detail records that immediate origin. Back/Close restores the exact origin,
  filter, scroll position, and focus. A direct link with no valid origin falls back to the active
  Child’s safe root.
- “عرض مهمة مناسبة” opens only an existing Parent-assigned eligible task. If none exists, show the
  specified neutral empty state; never create or assign a Child task from Path or Badge Detail.

APPROVAL OUTCOME
- Canonical first approval: pending task at 108 Seeds and Mangrove 48/60 → Parent approval atomically
  commits +12 → 120 Seeds and Mangrove 60/60 → exactly one `RevealBundle` containing Parent praise,
  the full garden-growth consequence, “ظلّ يتّسع”, and “الفرز الذكي — برعم” when the canonical
  criteria are newly met. The old standalone Garden Growth Moment must not appear. Any eligible
  safe-help recognition is one descriptive line in this same bundle, never a badge/modal.
- Future demonstration from Prompt 08: 120→132 plus third sorting credit → exactly one combined reveal
  containing “الفرز الذكي — غصن” and the newly unlocked “بين جذور القرم” story/station.
- Generate each reveal from the actual committed result list with correct Arabic singular/dual/plural;
  never hard-code a result count. “عرض الشارة” opens the earned Badge Detail; “عرض مسار الأثر” opens
  the reached station; “اكتملت خطوات اليوم” returns to Today.
- Do not show a reveal for submission, pending review, retry, merely opening a screen, or a replayed
  event. One triggering event creates at most one `RevealBundle`; never stack or sequence a Garden
  Growth Moment, badge modal, station modal, story modal, or recognition modal.

LEARNING
Impact Path station 132 → story-enabled Frame A or equal-credit story-disabled Frame B → same no-fail
knowledge objective → one idempotent `LearningCompletionEvent` with zero Seeds and zero garden growth.
With canonical `skill.coast_care = 3`, completion satisfies the last “رعاية القرم” criterion, so create
exactly one learning `RevealBundle` containing the completion and badge unlock; do not show a separate
story-complete or badge modal. If no badge unlocks, show one finite completion state. Save/Exit returns
to the recorded origin and no route autoplays another story.

PARENT
Parent Family/selected Salem → “تقدّم سالم” → Parent Progress & Achievements → optional matching task
creation using the existing Task Builder → return without changing settings unless Save is tapped.
Switching to Alia or a new Child recomputes the screen from that profile’s own fixture; no Salem count,
award, route origin, or selected-path state may leak across profiles.

Prototype the disabled, loading, success, and reduced-motion outcomes. Do not add a shop, reward
claim queue, public sharing, public leaderboard, location prompt, or notification permission prompt.
```

---

## Precision correction prompts

Use only when the specific error appears.

### Physical RTL correction

```text
Correct only physical positioning. Do not change copy, colors, spacing, or content. On root Child
screens place Help physically left, the title mathematically centered, and Salem’s botanical avatar
physically right; the Garden title is exactly “حديقتي”. On Arabic nested Child and Parent detail
screens place a right-pointing Back glyph physically right, keep the title centered, and leave the
physical-left side empty. Use an LTR positioning container with individually RTL Arabic labels and do
not depend on auto-mirrored icons. Place a left-pointing forward glyph on the physical left of Arabic
CTA labels. In English, mirror semantically: Back/left-pointing glyph physically left and forward/
right-pointing glyph physically right. Keep “الدوري” represented by cooperative groups, never a trophy.
```

### Viewport and scrolling correction

```text
Correct only viewport architecture. Constrain the frame to exactly 390×844 px with overflow hidden at
the root. Keep the header and bottom navigation/action bar fixed. Make only the central region scroll,
and add enough bottom padding for the last card/button to move completely above the fixed control.
Do not shrink type or content to force everything into one static viewport. At 200% text scale,
reflow every grid to one column, wrap segmented controls vertically, and let a fixed action join the
document flow when necessary for readable focus order. No horizontal page scrolling or clipped text.
```

### Reward-safety correction

```text
Correct only the progression semantics. Remove any premium/free dual track, shop, currency other than
Seeds, chest, random reward, rarity label, countdown, streak-loss copy, public ranking, or “claim
before it expires” behavior. Show one permanent deterministic path with exact criteria, private
badges from the exact P0 registry, and a visible stop/exit. The sole 180-Seed award is “رعاية الساحل”.
At 132, reach “بين جذور القرم” and unlock its learning package while only exposing the separate
“رعاية القرم” progress components; do not auto-award that badge.
```

### Arabic and live-text correction

```text
Correct only typography and localization. Replace every baked-in Arabic label with live interface
text. Use Alexandria for headings and Readex Pro for body/UI, no Arabic letter spacing, 14 px minimum
body text, native/web locale metadata `ar-AE`, and true RTL flow. Use Latin digits `0–9` to match
the existing Ghaf UI. Isolate every numeric token separately with an attributed direction span or
`<bdi dir="ltr">` / `unicode-bidi: isolate`; test values, dates, times, fractions, TalkBack, and
VoiceOver. Do not change illustration beyond what is required for readable text reflow.
```

### Factual-source correction

```text
Correct only factual-source visibility. Every factual Badge Detail and Learning Story must include an
open “مصدر المعرفة” row with the source title, publisher, and either the source's own published/
reviewed date or a precisely labelled source-access date, plus an accessible source action. Never
invent or imply a Ghaf content-team review/approval date. Product-rule-only badges show “معيار من نظام غاف” instead of implying external
accreditation. Keep the independent-content/no-partnership disclosure; do not hide sources in an
accordion or use a logo as attribution.
```

### Originality and rights correction

```text
Correct only visual originality. Remove any art, badge border, track, icon, crown, chest, map, logo,
or layout that resembles a named game, UAE government mark, UNESCO mark, tourism brand, or official
attraction asset. Replace it with original Soft Geometric botanical art and generic habitat forms.
Keep factual copy as live text and keep the independent-content/no-partnership disclosure.
```
