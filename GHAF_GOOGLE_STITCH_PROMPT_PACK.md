# Ghaf — Google Stitch Professional Prompt Pack

**Prepared:** 2026-09-01

**Product:** Ghaf — غاف

**Target:** Android-first mobile app, Arabic-first RTL with matched English LTR

**Status:** Approved Revision 2 design-generation input

## Authority and Hold

This pack is the canonical input for generating the next Ghaf screen designs in one Google Stitch
project. It records approved product intent, content, safety rules, interaction states, and visual
directions. It is **not executable design truth**, an implementation specification, a validation
result, or evidence that any generated screen is approved.

Implementation remains on hold until the user supplies and approves the generated Stitch screens.
After approval, the selected frames and exported design rules must be reconciled with the active
Feature 003 specification, plan, tasks, root design documents, implementation, and tests before
code changes begin. The superseded 2026-08-28 ten-route implementation and its evidence do not
validate these prompts or their future outputs.

## 1. Google Stitch Working Method

Google's prompt guidance recommends plain-language project intent followed by focused
screen-by-screen generation and small, specific refinements. For a complex app, establish the
product and visual direction first, select a variant, lock a shared design system, and then create
each screen inside the same Stitch project.

Current Stitch can use natural language, images, text, sketches, and code as canvas context. Its
project canvas can preserve context, explore variants, connect screens into a playable prototype,
and exchange design rules through DESIGN.md. Keep all Ghaf screens in one project so the selected
system remains consistent.

Reference links supplied with the approved design brief:

- [Effective Prompting — Stitch documentation](https://stitch.withgoogle.com/docs/learn/prompting)
- [Official Stitch Prompt Guide](https://discuss.ai.google.dev/t/stitch-prompt-guide/83844)
- [Google's 2026 Stitch overview](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/)
- [Stitch DESIGN.md overview](https://stitch.withgoogle.com/docs/design-md/overview)
- [Google Stitch](https://stitch.withgoogle.com)

Recheck external documentation before generation if Stitch behavior or supported export formats
have changed.

### Prompt format

Each screen prompt uses these concerns:

1. **Scope** — the exact screen or component to create.
2. **User and moment** — who is using it and what they need now.
3. **Anatomy** — layout, hierarchy, navigation, and primary action.
4. **Content** — realistic labels, values, tasks, and sample data.
5. **Interactions and states** — what happens after a tap and which states must exist.
6. **Vibe and system** — design language and role-specific emotional tone.
7. **Localization and accessibility** — Arabic/RTL, English/LTR, typography, contrast, and touch
   size.
8. **Do not** — likely but incorrect patterns to exclude.

Do not paste the complete pack into Stitch at once. Run the prompts in the working order at the end
of this document. When a screen is close, select that exact frame or component and use a short
repair prompt instead of regenerating it with another long prompt.

## 2. Canonical Ghaf System for Every Prompt

These mechanisms must remain distinct:

| Mechanism                             | Meaning                                                                      |
| ------------------------------------- | ---------------------------------------------------------------------------- |
| **Seeds — بذور**                      | Permanent personal garden growth earned after Parent confirmation            |
| **Challenge Leaves — أوراق التحدي**   | Five normalized weekly Friendly League opportunities per participating Child |
| **Weekly Growth Score**               | Confirmed Challenge Leaves ÷ 5 × 100; maximum 100 and reset weekly           |
| **Family canopy — مظلة العائلة**      | Cooperative household growth                                                 |
| **Family Reward — المكافأة العائلية** | Optional private milestone prize promised and funded by a Parent             |

Core rules:

- Ghaf is one app with separately accessed Parent and Child experiences. P0 access, pairing,
  biometrics, reauthentication, accounts, and permissions are deterministic synthetic simulations.
- Parent navigation is **Home, Tasks, Garden, Family**.
- Child navigation is **Today, Garden, League**.
- Parent mode is calm, premium, organized, and concise.
- Child mode is brighter and more exploratory, but never babyish or cartoonish.
- A Child selects from Parent-approved tasks and may request help or a smaller equivalent.
- Submission awards nothing. Parent confirmation produces specific praise first, then any eligible
  Seeds, permanent garden growth, Challenge Leaf, canopy contribution, and private Family Reward
  progress.
- League standings are invite-only for synthetic siblings and cousins. They compare five
  age-appropriate Challenge Leaves, not raw Seeds, speed, money, task difficulty, or evidence.
- Help and accessibility adaptations earn full Challenge Leaf credit. Ties share position.
- Family Reward is private, optional, personal-milestone based, and fulfilled outside Ghaf. It is
  not a wallet and never depends on League rank.
- Ghaf Coach is embedded inside the current Parent-approved task. It is age-adapted, bounded, and
  never an unrestricted chat or companion.
- P0 push-to-talk is a prepared synthetic audio/transcript simulation. Do not imply real capture,
  speech recognition, or live Child media processing.
- The five visual landscapes are Ghaf desert grove, Samar desert grove, Sidr reflection grove,
  date-palm oasis, and mangrove coast.
- Symbolic garden growth does not imply a real tree planted or measured environmental impact.

## Prompt 01 — Project Foundation and First Screen

Paste this into a new Stitch project.

Create the visual foundation and first mobile screen for Ghaf — غاف, an Android-first family growth
app for UAE children ages 6–14 and their parents. Ghaf turns Parent-approved real-world tasks into
specific praise, Seeds, growing UAE landscapes, friendly family competition, and optional private
Family Rewards.

Create one Arabic-first welcome and access screen at a 390×844 mobile viewport. Do not generate the
rest of the app yet.

USER AND MOMENT

A family opens Ghaf and must immediately understand the promise, select a language, and choose the
correct protected access path. Parent and Child are separate experiences, not a role toggle after
sign-in. In this competition prototype all access behavior is synthetic and must be labeled
honestly.

ANATOMY

Use an edge-to-edge but uncluttered mobile composition. Place the Ghaf wordmark and a distinctive,
contemporary Ghaf-tree silhouette near the top. Use one short promise, a restrained UAE landscape
horizon, then two large actions: “دخول وليّ الأمر” and “دخول الطفل”. Add a quiet English language
control in the top safe area. Include a small, unobtrusive prototype note: “نسخة تجريبية ببيانات
اصطناعية”. Do not show an account balance, dashboard, leaderboard, or statistics on entry.

CONTENT

Wordmark: “غاف”

Headline: “نزرع العادات الجميلة معًا”

Supporting text: “مهام يومية، تشجيع من الأسرة، وحديقة تنمو بإنجازاتكم.”

Primary action: “دخول وليّ الأمر”

Secondary action: “دخول الطفل”

VIBE AND SYSTEM

Establish a modern UAE botanical editorial style: clean, confident, warm, optimistic, culturally
specific, and high quality. Avoid the look of a beige heritage brochure or a generic green eco app.
Use bright pearl #F7F8F3 as the main ground, Ghaf emerald #126A50, deep forest #0D3128, mangrove teal
#188B83, sky mist #DDEFF0, solar amber #F2B84B, restrained coral #D96C55, and ink #14221D. Use
Alexandria Bold or ExtraBold for display type and Readex Pro for body and UI text in both Arabic and
English. Use crisp geometry, generous space, mostly flat tonal surfaces, limited shadows, and
code-friendly vector botanical illustration.

LOCALIZATION AND ACCESSIBILITY

The generated screen must be true RTL, not merely right-aligned. Arabic is the only main interface
language on this screen. Give Arabic generous line height, no artificial letter spacing, readable
weights, 48dp touch targets, high contrast, and safe-area spacing.

DO NOT

Do not use camels, falcons, generic mosque silhouettes, faux luxury gold, neon gaming UI,
glassmorphism, coin graphics, a cartoon mascot, excessive cards, or childish typography.

## Prompt 02 — Explore Three Visual Directions

Use this after Prompt 01. Keep the content and flow unchanged.

Using the approved Ghaf welcome-screen anatomy and exact Arabic content, create three clearly
different visual variants side by side. Do not change the actions, hierarchy, navigation logic, or
product meaning.

Variant A — Contemporary UAE Editorial Garden:

Premium, typographic, airy, mature, with bold Alexandria headings, controlled emerald fields,
precise iconography, and elegant landscape cropping.

Variant B — Modern Botanical Adventure:

More expressive for children while still professional, using layered vector landscapes, brighter
mangrove teal and solar amber, tactile task shapes, and restrained organic motion cues.

Variant C — Calm Family Utility:

The cleanest and most restrained direction, with strong information hierarchy, subtle botanical
details, minimal decoration, and especially clear Parent usability.

All three variants must remain Arabic-first RTL, use Alexandria and Readex Pro, meet accessible
contrast, and feel recognizably part of the same Ghaf brand. Avoid generic Material templates,
glassmorphism, cartoon characters, beige heritage styling, and fintech aesthetics.

Choose one direction before continuing. Direction A is the recommended base; selected elements from
Direction B may be used in Child mode. This recommendation is design-generation guidance, not final
screen approval.

## Prompt 03 — Lock the Shared Design System

Replace [SELECTED VARIANT] before pasting.

Use [SELECTED VARIANT] as the canonical Ghaf direction for this Stitch project. Apply it to all
existing and future generated screens. Do not introduce a new palette, font family, icon style,
radius system, navigation pattern, or illustration style unless I explicitly request a system-wide
change.

Create a compact design-system reference on the canvas containing:

- Arabic and English display, screen-title, body, button, caption, and numeric styles;
- primary, secondary, quiet, destructive, and disabled buttons;
- text fields, PIN fields, selectors, switches, and segmented controls;
- Parent four-item bottom navigation and Child three-item bottom navigation;
- task row, task card, pending check-in row, Seed indicator, Challenge Leaf indicator, tree-stage
  progress, Family Reward progress, League row, AI helper sheet, privacy note, and safety note;
- empty, loading, offline, success, locked, and permission-denied states.

Use Alexandria for display and Readex Pro for UI/body. Parent mode should use restrained surfaces and
dense but breathable information. Child mode may use larger type, stronger landscape color, and
more expressive progress visuals without becoming childish. Use 48dp minimum touch targets,
accessible contrast, reduced-motion-compatible outcomes, and true Arabic RTL behavior.

Keep the reference concise. Do not design application screens in this step.

Preserve these generated rules inside the Stitch project. They remain proposed design input until
the user approves the generated frames and exports.

## Prompt 04 — Parent Authentication and Household Setup

Extend the selected Ghaf design system. Create the Parent authentication screen and its first-time
household-setup continuation. Preserve the established fonts, palette, controls, illustration style,
and Arabic RTL behavior.

USER AND MOMENT

An adult is entering a protected Parent experience. The flow should feel trustworthy and simple,
not like banking software. The Parent controls tasks, confirmation, Family Rewards, League
membership, Child profiles, and AI/media permissions. All P0 authentication states are synthetic
simulations.

ANATOMY

On the authentication screen, show the Ghaf wordmark, heading “مرحبًا بوليّ الأمر”, phone-or-email
input, a clear continue button, and quiet passkey or biometric return access. Include a link for
creating a new family. Use a focused single-column form with no social-login clutter.

For first-time setup, create a connected continuation screen with a short progress header. Ask for a
family display name, then add the first Child using nickname, avatar, age band 6–8 / 9–11 / 12–14,
preferred language, and basic accessibility needs. Explain briefly that the Parent manages Child
access and privacy. Finish with “إنشاء العائلة”.

INTERACTIONS AND STATES

Show default, verification-code, invalid-code, loading, and successful setup states. Sensitive
changes later require Parent reauthentication. Do not imply that production authentication is
implemented; keep a discreet synthetic-demo label.

DO NOT

Do not request a Child email or phone number. Do not collect unnecessary location, school, medical,
or identity data. Do not use a Parent/Child role switch inside the signed-in app.

## Prompt 05 — Child Access and Device Pairing

Extend the selected Ghaf design system. Create a dedicated Child access experience that is visually
related to Parent authentication but brighter, simpler, and clearly protected from Parent controls.
Generate the primary shared-device screen and one pairing continuation state.

USER AND MOMENT

A Child wants to reach Today with as few decisions as possible. The Child never uses an email or
phone number. On a shared device, they select a Parent-created profile and enter a PIN or picture
sequence. On a separate device, they enter or scan a short family pairing code that a Parent must
approve. Every code, QR, approval, and device state is synthetic in P0.

ANATOMY

Use heading “أهلًا بك”. Show two or three large synthetic profile choices with safe illustrated tree
avatars: سالم, علياء, and “إضافة جهاز”. After selecting سالم, reveal a large, accessible four-digit
PIN keypad. Secondary action: “استخدام رمز العائلة”. The pairing state should show a QR scan area,
six-digit code entry, and a calm “بانتظار موافقة وليّ الأمر” status.

INTERACTIONS AND STATES

Include wrong PIN without shame, forgotten PIN directing to Parent help, expired pairing code,
offline state, waiting for Parent approval, approved success, and revoked-device state. Success goes
directly to Child Today.

DO NOT

Do not expose Parent mode, Parent reports, monetary controls, family contact information, or a simple
role toggle. Avoid lockout language that blames the Child. Do not imply real camera scanning,
identity verification, or production device security.

## Prompt 06 — Parent Home

Extend the selected Ghaf Parent system. Create the Arabic RTL Parent Home screen. Keep the
established four-item Parent navigation: Home, Tasks, Garden, Family. Home is selected.

USER GOAL

The Parent should understand in under five seconds what needs attention, what the family is growing,
and the best next action. This is stewardship, not surveillance or dense analytics.

ANATOMY

Use a compact greeting and a visually meaningful family Ghaf canopy at the top, with progress 19/25
leaves toward the next shared milestone. Immediately below, show a prioritized review panel:
“مهمتان بانتظار المراجعة”, with Salem’s recycling task first. Make “مراجعة الآن” the dominant action.
Then show a concise section for each Child’s next approved task and requested support. Add a clear
“إنشاء مهمة” action. End with a small Ghaf Guide weekly summary that begins with an observable
strength and offers one question, not a score.

REALISTIC CONTENT

Salem, age 9: recycling task submitted; Mangrove 48/60; four of five Challenge Leaves; one
adult-help request; private Family Reward progress 108/120 Seeds.

Alya, age 11: school-bag task next; Sidr progress visible privately to the Parent.

Guide summary: Salem completed two Green Impact steps and appropriately asked for adult help once.

VISUAL PRIORITY

Use one emotional canopy visual, one review block, and clean rows rather than a wall of cards. Keep
money off this screen except for a quiet private Reward Plan progress link. Use no Child comparison
chart, red risk score, normal/abnormal label, or long activity feed.

## Prompt 07 — Parent Tasks Hub

Extend the selected Ghaf Parent system. Create the Arabic RTL Tasks hub with the Parent bottom
navigation visible and Tasks selected.

USER GOAL

The Parent needs to find, assign, and monitor age-appropriate tasks without navigating a complex
project-management interface.

ANATOMY

Use a strong page title, a primary “إنشاء مهمة” button, and three simple filters: Child, status, and
category. Use a quiet segmented status control for “المسندة”, “بانتظار المراجعة”, and “المكتملة”.
Show a concise list with task title, Child avatar, category/landscape cue, schedule, fixed Seeds or
“تشجيع من وليّ الأمر دون بذور”, and status. Keep task details progressive rather than showing every
field in the list.

CONTENT

Include realistic UAE-rooted examples: sort clean recyclables with an adult; prepare a school bag;
help store safe leftovers; call a grandparent; prepare a clean prayer space. Mark only eligible tasks
with a Challenge Leaf. Recognition-only tasks must show no Seed amount and cannot be Challenge
Leaves.

INTERACTIONS AND STATES

Tapping a row opens task detail. The create button opens the guided Task Builder. Include useful
empty, filtered-empty, offline, and loading states.

DO NOT

Do not make this a kanban board, spreadsheet, enterprise dashboard, or infinite list of tiny cards.
Do not show private task categories in League-related status.

## Prompt 08A — Task Builder: Choose the Task

Extend the selected Ghaf Parent system. Create Step 1 of a three-step Task Builder within one guided
screen family. Preserve the Parent navigation and established system.

USER GOAL

The Parent chooses who the task is for and starts from a safe curated task instead of confronting a
large blank form.

ANATOMY

Show a calm three-step indicator: 1 Choose, 2 Adjust, 3 Review. Step 1 is active. First select Salem
or Alya. Then show the eight task categories as a compact, scannable list or two-column grid with
subtle landscape cues: Faith & Gratitude, Roots & Kinship, Home Responsibility, Green Impact, Food &
Hospitality, Heritage & Etiquette, Kindness & Community, Learning & Wellbeing. After selecting Green
Impact, show three curated templates and one secondary custom-task option.

Use “فرز المواد النظيفة القابلة لإعادة التدوير مع شخص بالغ” as the selected template. Show its
estimated effort, adult-help requirement, 12 fixed Seeds, Mangrove mapping, and Challenge Leaf
eligibility before continuing. Primary action: “متابعة”.

DO NOT

Do not show the full safety policy or every technical field yet. Do not use a chatbot or ask the
Parent to write a perfect prompt.

## Prompt 08B — Task Builder: Adjust with Ghaf Guide

Duplicate the approved Task Builder frame and create Step 2, Adjust. Preserve all global and Task
Builder components; do not redesign the flow.

Show the original Parent task and a structured editable version with: positive task title, one
observable definition of done, why it matters, no more than four Child steps, effort, supervision,
schedule, fixed 12 Seeds, and optional Challenge Leaf.

Embed Ghaf Guide as a quiet contextual tool, not a chat page. Provide four explicit actions:
“اجعلها أوضح”, “قسّمها إلى خطوة أصغر”, “تحقّق من السلامة”, and “ناسبها لعمر الطفل”. When the Guide
responds, show Original and Suggested wording with “قبول الاقتراح” and “الاحتفاظ بنصي”. Label the
response as AI and say it may be wrong; the Parent remains the decision maker.

For the recycling example, surface the essential safety boundary: an adult checks items; the Child
handles only intact, non-sharp clean paper and plastic; unknown, sharp, leaking, electrical,
chemical, glass, battery, medicine, or spoiled items are adult-only. Primary action: “مراجعة
المهمة”.

Do not let AI silently overwrite Parent wording, change the fixed reward, authorize unsafe work, or
turn into an open-ended conversation.

## Prompt 08C — Task Builder: Review and Assign

Duplicate the approved Task Builder frame and create Step 3, Review. Keep the established design and
stepper; do not create a separate visual theme.

Present a clean, scrollable Arabic RTL review of the final task. Use progressive sections for:
definition of done, why it matters, Child steps, adult role, safety exclusions, schedule, optional
evidence, privacy, fixed 12 Seeds, Mangrove growth, Challenge Leaf eligibility, and who can see the
completion. Keep the safety section visible and above the approval action.

Show a compact reward explanation: “١٢ بذرة بعد تأكيد وليّ الأمر”. Explain that submission alone
does not grow the garden. Show Challenge Leaf as weekly League credit, not another currency. Primary
action: “اعتماد وإسناد المهمة”. Secondary action: “تعديل”. On success, show a short assigned state
with a path back to Tasks.

Do not show money on this task review unless it contributes to an already configured private Family
Reward milestone. Do not imply that digital growth measures real environmental impact.

## Prompt 09 — Parent Check-in and Confirmation

Extend the selected Ghaf Parent system. Create the Arabic RTL Parent Check-in screen opened from the
Home review inbox.

USER GOAL

The Parent reviews what happened, recognizes the Child, and chooses the next supportive action.

ANATOMY

Show the task title, definition of done, submission time, completion mode “مع مساعدة شخص بالغ”, and
optional prepared photo, voice, and reflection as separate items. Label every prepared media item
as synthetic. Then show four clear actions: Confirm, Kind retry, Make smaller, and Accept equivalent.
Confirm is primary; the alternatives are respectful and visually neutral.

Before confirmation, show an editable specific-praise suggestion:

“لقد فرزت المواد النظيفة وسألت قبل الذهاب إلى الحاوية؛ وهذا جعل المهمة أكثر أمانًا وساعد أسرتنا.”

INTERACTIONS AND STATES

The successful sequence is: Parent praise first; then exactly 12 Seeds; Mangrove Shoot becomes
Sapling; the family canopy gains one leaf; Salem moves from four of five to five of five Challenge
Leaves; private Family Reward progress moves from 108/120 to 120/120 and unlocks. A duplicate
confirmation must show “تم التأكيد سابقًا” and change nothing. Kind retry must preserve all earned
progress and offer smaller/equivalent choices.

DO NOT

Do not use Reject, Failed, lazy/defiant labels, diagnostic language, red shame treatment, point loss,
or an AI decision about whether the Child deserves a reward.

## Prompt 10 — Parent Family Rewards

Extend the selected Ghaf Parent system. Create the Arabic RTL Family Rewards area as a protected
Parent sub-screen, not a main navigation tab and not a wallet.

USER GOAL

The Parent privately promises an affordable real-world reward for a meaningful personal milestone.

ANATOMY

At the top, explain “مكافآت تحددها الأسرة وتُقدَّم خارج التطبيق”. Show a private summary of active
plans and the maximum promised amount this month. Present one active plan for Salem: reach 120 new
eligible Seeds to unlock AED 25, currently 108/120. Show states Promised, Unlocked, and Given.
Primary action: “إنشاء مكافأة”.

The create flow should select Child, milestone type, target, reward type, and optional amount. Offer
milestones based on new eligible Seeds after the plan begins, a landscape reaching a stage, or
several tree types reaching Sapling. Reward types: money, family experience, privilege, or gift.
Require Parent reauthentication before saving a monetary promise. Keep a visible synthetic-demo
label on the reauthentication state.

PRODUCT RULES

There is no wallet, payment transfer, balance, Seed-to-AED exchange rate, paid boost, wagering, or
winner-take-all prize. League position never determines money. Amounts are visible only to that
Child and guardians. An unlocked reward cannot be removed as punishment. The Parent may change
future plans prospectively, but not retroactively change an agreed milestone. Basic needs, prayer,
affection, eating, emotional disclosure, private wellbeing, disability-related activity, and proof
of family love cannot be monetized. Reward progress is fail-closed: only Parent-confirmed
contributions explicitly marked eligible may advance a plan. Unknown or prohibited activity adds
zero reward progress, including for landscape-stage milestones.

VIBE

Keep this warm and family-controlled, not financial or casino-like. Use the same botanical progress
language as the garden, with restrained AED typography and no cash imagery.

## Prompt 11 — Parent Garden

Extend the selected Ghaf Parent system. Create the Arabic RTL Parent Garden screen with Garden
selected in the four-item navigation.

USER GOAL

The Parent understands how the household is growing without comparing siblings as winners and
losers.

ANATOMY

Use the shared Ghaf canopy as the hero with 19/25 leaves. Below it, offer a small
household/Salem/Alya filter that changes detail without putting raw totals side by side. Show the five
connected UAE landscapes in one coherent visual system: Ghaf grove, Samar grove, Sidr reflection
grove, date-palm oasis, and mangrove coast. Each landscape shows its growth stage, next milestone,
and the categories it represents. Make Mangrove progress 48/60 for Salem visible in the selected
state.

Include a small recent-growth list using specific real actions and Parent praise. Clearly label
growth as symbolic. Use landscape illustration as information, not decoration.

INTERACTIONS AND STATES

Tapping a landscape opens its detail. Support no-new-growth, newly confirmed growth, maximum stage,
offline, and reduced-motion states. Celebration is temporary and does not replace the Garden
screen.

DO NOT

Do not create a 3D world, city builder, tree shop, sibling comparison chart, environmental impact
calculator, or claim that a real tree was planted.

## Prompt 12 — Parent Family and League Management

Extend the selected Ghaf Parent system. Create the Arabic RTL Family screen with Family selected in
the Parent navigation.

USER GOAL

The Parent manages children, trusted family-circle membership, Friendly League rules, and sharing
without navigating scattered settings.

ANATOMY

Use three clear sections: Household, Ghaf Family League, and Privacy. Household shows Salem and Alya
with safe tree avatars and synthetic device status. League shows invited synthetic cousins, the
current weekly period, and a preview of standings based on five Challenge Leaves. Include a
cooperative canopy goal beside the ranking. Primary League action: “إعداد تحديات الأسبوع”.
Secondary action: “إدارة الأعضاء”.

The weekly setup lets the Parent nominate exactly five age-appropriate League-eligible tasks per
Child before the week begins. Explain that each confirmed Challenge Leaf contributes 20 points,
maximum 100. Ties share a place. Extra tasks may earn Seeds but cannot improve League rank. Include
pause, opt-out, and no-penalty rest-week controls.

PRIVACY

Only nickname, tree avatar, weekly score, Challenge Leaves completed, and rank appear to
participants. Never share task titles, evidence, age, accommodations, praise, monetary amounts,
prayer, wellbeing, family-contact activity, or reasons for missed tasks. Include guardian-managed
invitation and Child participation controls.

DO NOT

Do not create public discovery, open profiles, comments, free-text or direct messaging, location,
school data, a global leaderboard, or real networking claims.

## Prompt 13 — Child Today

Extend the selected Ghaf Child system. Create the Arabic RTL Child Today screen for Salem, age 9.
Use the three-item Child navigation: Today, Garden, League. Today is selected.

USER GOAL

Salem should know what he can choose now, why it matters, and how to begin without reading a Parent
dashboard.

ANATOMY

Open with a warm greeting, a compact garden horizon, and this week’s Challenge Leaves shown as five
large leaf markers, four confirmed. Show only two or three Parent-approved task choices. Each choice
contains a clear title, one-line meaning, estimated effort, adult-help cue, landscape, fixed Seeds
or recognition-only label, and Challenge Leaf marker if eligible. Make the recycling task the
dominant choice with 12 Seeds and Mangrove mapping.

Show a secondary private Family Reward progress strip: “١٠٨ من ١٢٠ بذرة نحو مكافأتك العائلية”,
without making money the main reason to act. Provide “اطلب تصغير المهمة” as a dignified action.
Primary action on the selected task: “ابدأ المهمة”.

VIBE

Use larger type, stronger landscape color, inviting motion cues, and capable language. The Child
should feel like an explorer contributing to a family, not a cartoon player collecting coins.

DO NOT

Do not show Parent reports, sibling raw Seed totals, monetary amounts belonging to anyone else,
streak flames, countdown pressure, a shop, or an AI chat entry point.

## Prompt 14 — Child Task and Bounded Ghaf Coach

Extend the selected Ghaf Child system. Create the Arabic RTL Child Task screen for the selected
recycling task, plus its Ghaf Coach bottom-sheet state. Preserve the established Child navigation
and typography.

USER GOAL

Salem should leave the screen to complete one safe real-world task, using short help only when
needed.

ANATOMY

Keep the task title and purpose visible. Show one observable definition of done, no more than four
short steps, the adult-help boundary, 12 fixed Seeds after Parent confirmation, and one Challenge
Leaf. Add four bounded Coach actions: “أرني الخطوات”, “ساعدني أخطط”, “أحتاج إلى شخص بالغ”, and a
simulated push-to-talk action. Keep “اسأل شخصًا كبيرًا” permanently visible.

COACH SHEET

The bottom sheet must identify itself as an AI helper that can be wrong. Use age-appropriate,
friendly language and one step at a time. Include a push-to-talk control, visible timer, prepared
synthetic transcript, replay/slower playback, delete-before-send, captions, and a clear send action.
Label the audio/transcript as simulated; do not imply real recording or speech recognition. Use
clear MSA for safety and only a light Parent-approved Emirati/Gulf conversational register for
reviewed greetings and encouragement. The task remains visible behind the sheet.

SUBMISSION STATE

Primary action: “إرسال لوليّ الأمر”. Before sending, state exactly what the Parent will see. After
sending, show “بانتظار مراجعة وليّ الأمر” with zero Seeds and no garden, League, canopy, or Family
Reward change yet.

DO NOT

Do not create open chat, ambient listening, a human AI avatar, companion language, secrets, medical
or religious advice, or AI confirmation of task completion.

## Prompt 15 — Child Garden, Celebration, and Private Reward Unlock

Extend the selected Ghaf Child system. Create the Arabic RTL Child Garden screen with Garden
selected, plus a temporary post-confirmation celebration state. Keep the established visual system.

DEFAULT GARDEN

Show Salem’s connected five-landscape garden, current Seed total, current stages, and next personal
milestones. Make the Mangrove coast selected at 48/60, Shoot stage. Include the shared family Ghaf
canopy secondarily. Use informative vector ecology details and a calm, explorable composition.

CELEBRATION STATE

After Parent confirmation, show the Parent’s exact praise first. Then show 12 Seeds moving toward
the Mangrove, Mangrove changing from Shoot to Sapling at 60/60, and one family-canopy leaf
appearing. Motion is short, causal, and stops. Reduced motion displays the same final state
immediately with text.

PRIVATE REWARD STATE

This milestone also moves Salem from 108/120 to 120/120 eligible Seeds and unlocks his configured
Family Reward. Show one restrained final sheet after garden growth: “تم فتح مكافأتك العائلية —
بانتظار وليّ الأمر”. Show only Salem’s own promised reward. Do not style this as a wallet, jackpot,
or cash shower.

DO NOT

Do not let trees wilt or lose stages. Do not use confetti storms, slot-machine reveals, mystery
rewards, environmental-impact numbers, or a permanent celebration screen.

## Prompt 16 — Child Friendly League

Extend the selected Ghaf Child system. Create the Arabic RTL Ghaf Family League screen with League
selected in the Child navigation.

USER GOAL

Children should enjoy friendly, understandable competition while still seeing a cooperative family
goal. Competition is based on equal opportunities, not age, raw Seeds, money, task difficulty,
evidence, or speed.

ANATOMY

Title: “دوري غاف”. Show the post-confirmation weekly state and Salem’s five Challenge Leaves, all
five confirmed. Present an invite-only ranked list using safe tree avatars and nicknames. Use
realistic synthetic standings:

1 Salem — 100 points — 5/5 Leaves

1 Mariam — 100 points — 5/5 Leaves

3 Alya — 60 points — 3/5 Leaves

4 Rashid — 40 points — 2/5 Leaves

Ties share first place. Pin Salem’s row if it would otherwise leave the viewport. Next to the
standing, show a shared family-canopy target that grows with every confirmed Challenge Leaf. Add a
small set of prepared bilingual encouragement reactions with no free-text messaging, replies, or
reaction counts.

TONE AND STATES

Use energetic but respectful visual emphasis for the leaders. Show progress and an achievable next
step for every Child. Include tied rank, rest week, opted-out/private, newly joined, completed week,
and no-League states. Rank resets weekly; permanent Seeds and trees do not reset.

DO NOT

Do not show monetary rewards, private tasks, photos, voice, age, accommodations, prayer, wellbeing,
missed-task reasons, red loser states, downward-shame notifications, a speed tiebreaker, unlimited
extra-task scoring, public discovery, or direct chat.

## Prompt 17 — Profiles, Permissions, Devices, and Accessibility

Extend the selected Ghaf system. Create role-appropriate Settings reached from the profile avatar,
not from an additional bottom-navigation tab.

PARENT SETTINGS

Show Parent account protection, Child profiles, paired devices, language, notifications, League
participation, Child photo/voice permissions, age-band communication settings, and what
family-circle members can see. Require Parent reauthentication before changing Family Rewards,
permissions, trusted devices, or circle membership. Include device removal and forgotten Child PIN
reset. Mark all P0 security/device/media states as synthetic simulations.

CHILD SETTINGS

Show only safe controls: language, Parent-approved voice, voice speed, captions, reduced motion, text
size, League participation/rest, reaction mute, and tree avatar. Do not expose Parent permissions,
money configuration, reports, or invitations.

STATES

Include permission off, permission requested, denied, revoked device, offline, and successful
update. Use plain language and short explanations. Keep Arabic RTL and the shared Ghaf design
system.

DO NOT

Do not create a dense system-settings clone or expose technical privacy jargon to children.

## Prompt 18 — Create Matched English LTR Variants

Run this only after the Arabic screens are structurally approved inside Stitch.

Create matched English LTR variants of the approved Ghaf screens. Preserve each screen’s component
inventory, information hierarchy, spacing rhythm, visual identity, synthetic data, states, and
role-specific navigation. Localize the interface rather than redesigning it.

Use Alexandria for display headings and Readex Pro for UI/body in English as already defined. Change
page direction to true LTR, mirror only directional navigation and progress movement, and keep
trees, checkmarks, cultural objects, and nondirectional icons unchanged. Keep Seed, Challenge Leaf,
Family canopy, and Family Reward meanings exactly equivalent. Use natural English labels, not
literal word-for-word fragments.

Do not display Arabic and English simultaneously on ordinary controls. Do not substitute another
font, palette, navigation model, icon set, or illustration style.

## Prompt 19 — Connect and Test the Interactive Prototype

Connect the approved Ghaf screens into an interactive mobile prototype without redesigning them.

Shared access:

- Welcome → Parent sign-in or Child access.

Parent journey:

- Parent sign-in → Parent Home.
- Home review item → Parent Check-in.
- Home Create task → Tasks → Task Builder Choose → Adjust → Review → Assigned → Tasks.
- Check-in Confirm → Parent confirmation-complete state and queue a pending Child celebration;
  never navigate directly into the Child experience.
- Parent navigation links Home, Tasks, Garden, and Family.
- Family links League setup, member management, and Family Rewards.
- Sensitive reward/member/permission changes → synthetic Parent reauthentication.

Child journey:

- Child access → Today.
- Pairing code/QR state → waiting for Parent → approved → Today.
- Today selected task → Child Task.
- Coach actions open the bounded bottom sheet without leaving the task.
- Submit → waiting-for-Parent state.
- Parent confirmation makes the next Child Garden visit show praise and growth.
- Child navigation links Today, Garden, and League.

Add logical Back behavior, preserve state, and prevent access across Parent/Child boundaries. Use a
small clearly labeled synthetic demo switch only in hidden prototype controls, never in normal
product navigation. Make all primary actions playable and keep offline/fallback, rest/opt-out,
duplicate-confirmation, and reset states reachable for review.

This playable Stitch connection is a design prototype, not authentication, security, networking,
money transfer, voice capture, or implementation evidence.

## Prompt 20 — Final Consistency and Accessibility Remaster

Audit and remaster the approved Ghaf Stitch project for consistency and accessibility. Revise
existing screens; do not invent a new visual direction.

Check every screen for:

- the same Alexandria and Readex Pro hierarchy;
- consistent colors, radii, icons, buttons, sheets, task components, and progress visuals;
- correct Parent four-tab and Child three-tab navigation;
- one dominant action and a clear reading order;
- true Arabic RTL, correct English LTR, generous Arabic line height, no Arabic letter spacing, and
  correct mixed-direction handling for AED 25, ١٢٠ بذرة, dates, and names;
- minimum 48dp touch targets, accessible contrast, captions, text scaling, screen-reader order, and
  reduced-motion parity;
- realistic long Arabic labels without clipping;
- empty, loading, offline, permission-denied, pairing-expired, AI-unavailable,
  pending-confirmation, duplicate-confirmation, no-reward, tied-League, rest-week, opted-out, and
  completed-week states;
- visible synthetic labels on P0 sign-in, pairing, biometric, reauthentication, media, voice,
  family, and reward fixtures;
- no Seed, garden, League, canopy, or Family Reward progress before Parent confirmation;
- no public Child data, money in League, open AI chat, wallet, shop, streak pressure, shame, or
  environmental-impact claims.

Return a concise list of the screens changed and why, then show the remastered frames on the
existing canvas. The remaster remains pending user approval and must not be exported as executable
design truth automatically.

## 3. Short Repair Prompts

Use these only after selecting the exact screen or component on the Stitch canvas.

### Simplify a Busy Screen

On this selected screen, reduce visual noise without removing required information. Preserve the
current design system and navigation. Replace repeated cards with whitespace, separators, and one
clear grouped section. Keep one dominant action and no more than two secondary actions visible.

### Repair Arabic Typography Only

On this selected screen, change only Arabic typography and RTL composition. Preserve components,
content, colors, and interactions. Use Alexandria for headings and Readex Pro for UI/body, increase
Arabic line height, remove letter spacing, prevent diacritic clipping, isolate mixed-direction
numbers, and verify logical RTL reading order.

### Restore System Consistency

Restyle this selected screen to use the already selected Ghaf components and tokens. Do not change
its content or flow. Match the project’s exact navigation, buttons, inputs, typography, spacing,
icons, landscape illustration, and state treatments.

### Make Child Mode More Engaging Without Becoming Childish

On this selected Child screen, increase energy through larger hierarchy, stronger landscape color,
clear progress, and one restrained organic illustration or motion cue. Preserve readability and the
current system. Do not add cartoon characters, coin graphics, confetti, streaks, a store, neon,
glassmorphism, or extra cards.

### Make Parent Mode More Professional

On this selected Parent screen, improve professional clarity through tighter information hierarchy,
fewer containers, stronger labels, calmer color use, and clearer primary/secondary actions. Preserve
all content, privacy rules, and the selected Ghaf system. Do not turn it into analytics, finance, or
enterprise project-management UI.

### Fix a Single Component Without Disturbing the Screen

Change only the selected [COMPONENT]. Keep every other component, position, dimension, color, font,
copy item, and interaction unchanged. Make [ONE SPECIFIC CHANGE].

### Repair Synthetic Capability Labels

On this selected screen, keep layout and interaction unchanged. Correct only capability labels so
the P0 sign-in, pairing, biometric, reauthentication, QR, device, media, voice, reward, or family
state is clearly described as a synthetic prototype simulation and never as a live production
service.

### Repair League Fairness and Privacy

On this selected League screen, preserve the selected visual system. Show exactly five normalized
Challenge Leaves, maximum score 100, shared ties, full credit with help, and a cooperative canopy.
Remove raw Seeds, money, task details, evidence, speed comparison, private categories, shame, or
public data. Keep rest and opt-out dignified.

### Repair Family Reward Separation

On this selected Family Reward screen, preserve the selected visual system. Make the plan private,
optional, Parent-funded, personal-milestone based, and non-custodial. Use Promised, Unlocked, and
Given. Remove any wallet, Seed exchange rate, League dependency, cash-store imagery, punishment,
basic-needs condition, or retroactive milestone change.

## 4. Recommended Working Order

1. Create one new mobile project in [Google Stitch](https://stitch.withgoogle.com).
2. Run Prompt 01 only.
3. Run Prompt 02 and compare all three visual directions without changing product content.
4. Select one direction. Direction A is the recommended foundation; the user's selection is
   authoritative.
5. Replace [SELECTED VARIANT] and run Prompt 03.
6. Generate Prompts 04–17 individually, in order, inside the same Stitch project.
7. Review the Arabic RTL frames structurally and visually before running Prompt 18.
8. Run Prompt 18 to generate matched English LTR variants.
9. Connect the approved frames with Prompt 19 and test the prototype paths in Stitch.
10. Use short repair prompts on selected frames/components only; avoid broad regeneration when one
    issue is local.
11. Run Prompt 20 as the final Stitch consistency/accessibility audit.
12. Export the selected system and screen artifacts only after the user approves the generated
    frames.
13. Supply the approved frames/exports back to the repository integration owner.
14. Update Feature 003 specification, plan, tasks, design contracts, implementation, tests, and
    evidence before claiming Revision 2 is built or validated.

Do not hand the 2026-08-28 implementation evidence to a design or coding agent as if it passes
Revision 2. Do not implement directly from this prompt pack. The user-approved generated screens
are the missing design input.
