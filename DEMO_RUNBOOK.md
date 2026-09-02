# Ghaf Feature 003 Demo Runbook

**Target:** Family Growth Garden deterministic P0
**Status date:** 2026-09-02
**Primary target:** physical Android device, Arabic RTL first; English LTR second
**Internal presentation target:** 120–150 seconds; this is not a published SMAC judging rule

## Evidence Truth

Feature 003 has a deterministic post-convergence implementation. The current family experience
checkpoint passes 30 files / 464 tests and sampled Arabic/English replays at 412×915 and 320×700;
the earlier complete ten-route Firefox journeys and mounted reset evidence remain recorded below.
Android configuration and production export pass, but the configured emulator could not boot. It is
**not demo-accepted**: physical Android is blocked, live AI is unavailable, and every named
human-review gate remains open.
Earlier Feature 002 results prove only the reusable food-rescue baseline and are not used below.

| Feature 003 evidence item                               | Status                                           | Evidence required to change status                                                                                                                              |
| ------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec Kit specification, plan, tasks, and analysis       | PASSED artifact gate                             | Feature artifacts exist and the pre-implementation quality gate is recorded; runtime tasks remain evidence-dependent                                            |
| Typecheck, lint, format, unit, and integration checks   | PASSED implementation; Expo dependencies aligned | `npm run verify` passed typecheck, lint, format, 30 files / 464 tests, Expo dependency alignment, and web export                                                |
| Ten-route deterministic journey                         | PASSED bilingual web; native BLOCKED             | Arabic RTL and English LTR completed ten routes; reset locale/direction and six consecutive real Back actions passed                                            |
| Secure live Parent task refinement with synthetic input | BLOCKED; validation NOT RUN                      | No approved server boundary/provider exists; prepared deterministic Guide remains the honest P0 path                                                            |
| Arabic RTL journey                                      | PASSED on web proxy; native BLOCKED              | Complete 390×844 journey and current 412×915/320×700 family samples exist; no native launch observation                                                         |
| English LTR journey                                     | PASSED web proxy; native BLOCKED                 | Complete 390×844 journey and current narrow-width family sample rendered `lang=en`/LTR; no native launch observation                                            |
| Offline/external-service-denied fallback                | PASSED automated; native NOT RUN                 | Five deterministic store cycles pass with external providers denied; no named offline Android observation                                                       |
| Reduced-motion/static outcomes                          | PASSED automated/source; native NOT RUN          | Static final-state equality passes; no named Android accessibility setting was exercised                                                                        |
| Physical Android acceptance                             | BLOCKED                                          | SDK, ADB, emulator, JBR, and API 35 AVD exist, but the AVD still failed its disk-space preflight with about 2.0 GiB free; no installed build/device observation |
| Three-person comprehension check                        | NOT RUN                                          | Three observers, question, answers, and date                                                                                                                    |
| Five timed human rehearsals                             | NOT RUN                                          | Five durations and failure notes                                                                                                                                |
| UAE Arabic/cultural review                              | NOT RUN                                          | Named qualified reviewers and reviewed content version                                                                                                          |
| Faith-content review                                    | NOT RUN                                          | Named qualified UAE Islamic educator/authority and scope                                                                                                        |
| Child-safeguarding review                               | NOT RUN                                          | Named reviewer, findings, and disposition                                                                                                                       |
| Sustainability task/claim review                        | NOT RUN                                          | Named reviewer, reviewed task/claim version, and disposition                                                                                                    |
| Accessibility review                                    | NOT RUN                                          | Named reviewer, build/surface, settings, findings, and disposition                                                                                              |

Do not replace `BLOCKED` or `NOT RUN` with `PASSED` because a screen exists, a simulator opens, or a
Feature 002 test still passes.

## Canonical Reset State

Feature 003 implementation must expose one Parent-only `resetPrototype()` action that produces the
following exact state without network access.

| Field                        | Reset value                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------ |
| Locale/direction             | Arabic / RTL                                                                   |
| Route/history                | `/`; no stale Back history                                                     |
| Demo mode                    | Parent; role switch visibly labeled “not authentication”                       |
| Household                    | Synthetic Al Noor family                                                       |
| Children                     | Salem, age 9; Alya, age 11; both visibly synthetic                             |
| Active Child                 | Salem                                                                          |
| Salem personal earned Seeds  | 48                                                                             |
| Alya personal earned Seeds   | 36                                                                             |
| Salem Mangrove track         | 48/60, **Shoot**                                                               |
| Household Ghaf canopy        | 19/25 contribution leaves                                                      |
| Circle Green Impact goal     | 11/12 eligible Green Impact actions; synthetic/local                           |
| Active assignment/submission | None                                                                           |
| Prepared Parent Guide result | `guide_recycling_refine_v1`                                                    |
| Prepared Child Coach result  | `coach_recycling_steps_v1`                                                     |
| Prepared image               | `fixture_recycling_clean_v1`; synthetic/prepared label visible                 |
| Prepared audio               | `fixture_salem_plan_ar_v1`; synthetic/prepared label visible                   |
| Assistant mode               | Deterministic prepared; no remote dependency                                   |
| Voice and AI grants          | Off                                                                            |
| Synthetic voice view         | Idle; transcript `null`; captions on; 1×; replay 0; inactive; sent time `null` |
| Celebration consumed         | False                                                                          |

The P0 confirmation changes only these counters:

| Counter                     |        Before |               After one confirmation |
| --------------------------- | ------------: | -----------------------------------: |
| Salem personal earned Seeds |            48 |                                   60 |
| Salem Mangrove progress     |  48/60, Shoot |                       60/60, Sapling |
| Household canopy            |  19/25 leaves |                         20/25 leaves |
| Circle Green Impact goal    | 11/12 actions | 12/12 actions, cooperative milestone |

A repeated confirmation changes nothing. The circle update is permitted because the P0 event is an
eligible Green Impact task. Private or non-environmental categories must never update the circle.

## P0 Task Fixture

**English title:** Sort clean recyclables and go with an adult to the guardian-approved safe recycling bin
**Arabic title:** فرز المواد النظيفة القابلة لإعادة التدوير ومرافقة شخص بالغ إلى حاوية إعادة تدوير آمنة يحددها وليّ الأمر

**Definition of done:** After an adult pre-check, Salem sorts intact, non-sharp clean paper and
plastic accepted by the local stream into the correct household recycling container. If needed,
Salem helps after the adult's second check to close one lightweight recycling bag, then accompanies
the adult on a guardian-approved safe route. The adult assesses heat and traffic, carries the bag,
and handles disposal. The route requires no road crossing, and Salem stays out of vehicle paths,
compactors, waste chutes, and bin-room machinery. If heat or traffic is unsafe, the family postpones
the route or uses an indoor sorting alternative. General household waste is not part of this task.

**التعريف العربي للإنجاز:** بعد أن يفحص شخص بالغ المواد مسبقاً، يفرز سالم الورق والبلاستيك
النظيفين والسليمين وغير الحادّين والمقبولين في نظام إعادة التدوير المحلي، ويضعهما في الحاوية
المنزلية الصحيحة. عند الحاجة، يساعد سالم بعد فحص ثانٍ من الشخص البالغ على إغلاق كيس إعادة تدوير
خفيف، ثم يرافق الشخص البالغ عبر مسار آمن يوافق عليه وليّ الأمر. يقيّم الشخص البالغ الحرارة وحركة
المركبات، ويحمل الكيس ويتولى التخلّص منه. لا يتطلب المسار عبور طريق، ويبقى سالم بعيداً عن مسارات
المركبات وضواغط النفايات ومزالقها وآلات غرف الحاويات. إذا كانت الحرارة أو حركة المركبات غير آمنة،
تؤجَّل الرحلة أو يُستخدم بديل للفرز داخل المنزل. النفايات المنزلية العامة ليست جزءاً من هذه المهمة.

**Why it matters:** Careful sorting helps the household handle recyclable materials responsibly.
This is a practical sustainability connection, not a quantified carbon, water, waste, or real-tree
claim.

**لماذا تهمّ المهمة:** يساعد الفرز الدقيق الأسرة على التعامل بمسؤولية مع المواد القابلة لإعادة
التدوير. هذه صلة عملية بالاستدامة، وليست قياساً لكمية الكربون أو الماء أو النفايات، ولا تعني زراعة
شجرة حقيقية.

**Fixed award:** 12 Seeds after one Parent confirmation. This is a 15–30-minute, Parent-approved
multi-step P0 variant with `standard + acquisition` and `recurrence = once`; it does not change the
starter catalog's 8-Seed single-step sorting task.

**Required safety copy:**

- the adult pre-checks all items; use only intact, non-sharp clean paper and plastic accepted by the
  household's local recycling stream;
- do not touch glass, sharps, batteries, chemicals, medicine, spoiled material, leaking bags, or
  unknown waste;
- do not repair a bin, appliance, light, or electrical item;
- ask an adult whenever unsure;
- the adult checks again before bag closing, assesses heat/traffic, carries the bag, and owns the
  route/disposal; the route requires no road crossing and the Child stays out of vehicle paths,
  compactors, chutes, and bin-room machinery; postpone or use an indoor alternative if heat or
  traffic is unsafe; and
- wash hands afterward.

**نص السلامة العربي المطلوب:**

- يفحص شخص بالغ جميع المواد مسبقاً؛ ويقتصر الفرز على الورق والبلاستيك النظيفين والسليمين وغير
  الحادّين والمقبولين في نظام إعادة التدوير المحلي؛
- يُمنع لمس الزجاج أو الأدوات الحادّة أو البطاريات أو المواد الكيميائية أو الأدوية أو المواد
  الفاسدة أو الأكياس المتسربة أو أي مادة مجهولة؛
- يُمنع إصلاح الحاويات أو الأجهزة أو المصابيح أو أي شيء كهربائي؛
- يجب سؤال شخص بالغ عند الشك؛
- يعيد الشخص البالغ الفحص قبل إغلاق الكيس، ويقيّم الحرارة وحركة المركبات، ويحمل الكيس ويتولى
  المسار والتخلّص؛ لا يتطلب المسار عبور طريق، ويبقى الطفل بعيداً عن مسارات المركبات والضواغط
  والمزالق وآلات غرف الحاويات؛ وتؤجَّل الرحلة أو يُستخدم بديل داخلي إذا كانت الحرارة أو حركة
  المركبات غير آمنة؛ و
- تُغسل اليدان بعد الانتهاء.

Photo and voice are optional prepared fixtures. Completion cannot depend on media or disclosure.

## Judge Journey

Reset immediately before presenting. Use the verified secure live Parent refinement only if the
same build/provider passed preflight; otherwise use the prepared deterministic fallback and state
that it is prepared. Never gamble the core journey on network access.

|     Time | Route/state                  | Operator action                                                                                                                          | What the judge must understand                                                              |
| -------: | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
|    0–10s | `/`                          | Point out Arabic-first RTL and the synthetic/prepared disclosure; enter                                                                  | Ghaf is a transparent prototype for real family action                                      |
|   10–20s | `/role`                      | Choose Parent and Salem                                                                                                                  | Two synthetic siblings exist; the role switch is not authentication                         |
|   20–32s | `/parent`                    | Show one household canopy and strengths-first Guide summary; tap create                                                                  | The dashboard is cooperative, not a Child leaderboard                                       |
|   32–48s | `/parent/task/new`           | Choose Green Impact and the P0 task; ask Guide to make it clear/safe; point out live or prepared status                                  | A bounded, structured assistant refines a Parent-owned task                                 |
|   48–60s | `/parent/task/review`        | Show definition, safety, optional evidence, 12 Seeds, Mangrove; explicitly enable the prepared voice rehearsal, then approve             | Permission is separate from role/assignment; Parent approval precedes assignment and reward |
|   60–70s | `/role` → `/child`           | Switch to Child/Salem and choose the new task                                                                                            | The Child chooses among approved actions and sees the fixed reward                          |
|   70–90s | `/child/task`                | Open age-adapted Coach steps; start/stop the synthetic rehearsal, switch language, review or delete its prepared transcript, then submit | AI/voice are bounded, task-specific, prepared, and capture no Child audio                   |
|  90–108s | `/role` → `/parent/check-in` | Return as Parent; show facts, edit/accept praise, confirm once                                                                           | Parent recognition—not AI judgment—unlocks the reward                                       |
| 108–126s | `/garden`                    | Let 12 Seeds move to Mangrove; show Shoot → Sapling and canopy 19 → 20                                                                   | Symbolic growth is predictable, permanent, and tied to the action                           |
| 126–145s | `/circle`                    | Show eligible Green actions 11 → 12 and privacy disclosure                                                                               | Families cooperate through coarse sustainability activity only                              |

Suggested spoken close: “Ghaf helps families turn safe, useful actions into routines through choice,
specific Parent recognition, live or visibly prepared assistant support, and a shared UAE living
landscape—without public ranking, punishment, or pretending that a digital tree is a real
environmental measurement.”

## Prepared Assistant Fixtures

### Parent Guide — `guide_recycling_refine_v1`

**Parent input:** “Take the recycling out.”

**Prepared result:** “For Salem, age 9: after an adult checks the items, sort only intact, non-sharp
clean paper and plastic accepted by the local stream into the correct recycling container. If a
lightweight recycling bag is ready, wait for the adult's second check, then help close it and go with
the adult on the guardian-approved safe route. The adult carries and disposes. The route requires no
road crossing; stay out of vehicle paths, compactors, chutes, bin-room machinery, glass, sharps,
batteries, chemicals, medicine, spoiled or unknown waste. Postpone or use an indoor alternative if
heat or traffic is unsafe. Ask an adult whenever you are unsure.”

**النتيجة العربية المُعدّة مسبقاً:** «لسالم، 9 سنوات: بعد أن يفحص شخص بالغ المواد، اقتصر على فرز
الورق والبلاستيك النظيفين والسليمين وغير الحادّين والمقبولين محلياً، وضعهما في حاوية إعادة التدوير
الصحيحة. إذا كان كيس إعادة تدوير خفيف جاهزاً، فانتظر الفحص الثاني من الشخص البالغ، ثم ساعد في
إغلاقه ورافق الشخص البالغ عبر المسار الآمن الذي يوافق عليه وليّ الأمر. يحمل الشخص البالغ الكيس
ويتولى التخلّص منه. لا يتطلب المسار عبور طريق، وابتعد عن مسارات المركبات والضواغط والمزالق وآلات
غرف الحاويات والزجاج والأدوات الحادّة والبطاريات والمواد الكيميائية والأدوية والمواد الفاسدة أو
المجهولة. اسأل شخصاً بالغاً عند الشك.»

Visible controls: **Accept suggestion**, **Keep mine**, **Make smaller**. Visible disclosure:
“Prepared AI example. AI can be wrong; the Parent decides.”

التحكمات العربية: **قبول الاقتراح**، **الاحتفاظ بنصي**، **تصغير المهمة**. الإفصاح العربي:
«مثال مُعدّ مسبقاً لمساعد بالذكاء الاصطناعي. قد تكون الاستجابة غير صحيحة، ووليّ الأمر هو صاحب
القرار.»

### Child Coach — `coach_recycling_steps_v1`

Prepared, bounded steps:

1. Ask an adult to pre-check the clean items and choose the household recycling bin.
2. Sort only the intact, non-sharp paper and plastic the adult approved.
3. Stop and ask an adult if anything is sharp, leaking, dirty, or unknown.
4. After the adult checks again, help close the light recycling bag if needed, go with the adult on
   the safe route while the adult carries/disposes, then wash your hands.

الخطوات العربية المُعدّة:

1. اطلب من شخص بالغ فحص المواد النظيفة مسبقاً وتحديد حاوية إعادة التدوير المنزلية.
2. افرز فقط الورق والبلاستيك السليمين وغير الحادّين اللذين وافق عليهما الشخص البالغ.
3. توقّف واسأل شخصاً بالغاً إذا كان أي شيء حاداً أو متسرباً أو متسخاً أو مجهولاً.
4. بعد الفحص الثاني، ساعد في إغلاق كيس إعادة التدوير الخفيف عند الحاجة، ورافق الشخص البالغ عبر
   المسار الآمن بينما يحمل الكيس ويتولى التخلّص منه، ثم اغسل يديك.

Prepared if–then cue: “After the adult checks the items, I sort the clean recyclables.”
Visible exit: **I need an adult**.
Prepared-mode disclosure: “Prepared AI-assistant example; this response is prewritten and may be
wrong.” The Child Coach has no live mode in P0.

خطة «إذا–فسأفعل» العربية: «بعد أن يفحص الشخص البالغ المواد، أفرز المواد النظيفة القابلة لإعادة
التدوير.»
الخروج الظاهر: **أحتاج إلى شخص بالغ**.
إفصاح الوضع المُعدّ: «مثال مُعدّ مسبقاً لمساعد بالذكاء الاصطناعي؛ هذه الاستجابة مكتوبة مسبقاً وقد
تكون غير صحيحة.» لا يوجد وضع مباشر لمدرب الطفل في P0.

### Parent recognition and summary

Prepared praise: “You sorted the clean recyclables and asked before going to the bin—that kept the
job safe and helped our household.”

الثناء العربي المُعدّ: «لقد فرزت المواد النظيفة القابلة لإعادة التدوير وسألت قبل الذهاب إلى
الحاوية؛ وهذا جعل المهمة أكثر أماناً وساعد أسرتنا.»

Prepared summary:

> “This week, Salem independently completed two Green Impact steps and asked for adult help once.
> Asking first was a safe choice. The current record is synthetic and limited; it does not show why
> another task was postponed. Ask which step felt easiest and whether the next task should stay the
> same size.”

> «خلال هذا الأسبوع، أكمل سالم خطوتين من مهام الأثر الأخضر باستقلالية، وطلب مساعدة شخص بالغ مرة
> واحدة. كان السؤال أولاً خياراً آمناً. السجل الحالي اصطناعي ومحدود، ولا يوضّح سبب تأجيل مهمة
> أخرى. اسأل أي خطوة بدت أسهل، وما إذا كان من الأفضل إبقاء المهمة التالية بالحجم نفسه.»

The Arabic fixture above is the canonical P0 MSA draft and still requires the named fluent/cultural
review recorded in the evidence table; Codex must not improvise alternate safety-critical Arabic.

Do not say normal, abnormal, lazy, defiant, good child, ADHD, diagnosis, emotion score, personality
score, truthfulness score, religiosity, or parenting quality.

## Expected Screen Evidence

- All ten routes are reachable through the authored flow; assistant/loading/celebration are states.
- Arabic and English contain equivalent decisions, safety, privacy, fixed reward, and disclosure.
- The Parent task remains unchanged until the Parent accepts the prepared refinement.
- Child submission produces acknowledgement but zero Seeds, growth, canopy, or circle change.
- Kind retry and smaller-task paths preserve all prior progress and show no failure badge.
- Confirm produces the prepared praise before one 12-Seed transaction.
- A duplicate confirm is a neutral no-op.
- The garden reaches Mangrove Sapling and the canopy reaches 20/25.
- The circle reaches 12/12 using one eligible coarse Green Impact action, not 12 Seeds.
- Reset from task, assistant, submitted, check-in, garden, and circle returns the canonical state.

## Fallback Matrix

| Failure                                   | Required operator/app response                                      | Forbidden response                                |
| ----------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------- |
| Network denied                            | Continue on prepared providers                                      | Stop the core journey or claim live AI            |
| Optional live AI timeout/malformed output | Same-attempt prepared result; retain Parent/Child state             | Blank screen, unsafe raw output, or second reward |
| Prepared image unavailable                | Show descriptive synthetic placeholder; continue without evidence   | Block completion                                  |
| Prepared audio unavailable                | Show the transcript and Coach steps                                 | Request microphone permission                     |
| Motion/Reanimated failure                 | Render confirmed counters and final static SVG stage                | Leave progress between states                     |
| Reduced motion enabled                    | Skip the arc/reveal; announce text changes once                     | Hide cause and effect                             |
| Back/history anomaly                      | Use Parent-only reset and restart; record defect                    | Improvise through stale state                     |
| Circle fixture unavailable                | Show local privacy explanation and household goal                   | Expose individual/sensitive records               |
| Duplicate confirm                         | Show “Already confirmed”; leave all counters unchanged              | Award again                                       |
| Physical-device unavailable               | Mark Android evidence `BLOCKED`; use web only as a fallback preview | Call the Android criterion passed                 |

## Reset Procedure

1. Open the Parent-only demo controls.
2. Choose **Reset synthetic demo** and confirm.
3. Verify `/`, Arabic RTL, 48 Salem Seeds, no active assignment, Mangrove 48/60, canopy 19/25,
   circle 11/12 eligible Green Impact actions, and no consumed celebration.
4. Deny or disable network access when exercising the deterministic acceptance path.
5. If any value differs, stop and record a reset defect; do not manually patch counters during a
   judged run.

## Fresh Validation Record

Record one row per build/device/locale. Do not infer a pass from web/source evidence.

| Date       | Commit/build   | Device/OS                      | Locale      | Journey         | Offline | Reduced motion | Result  | Observer/notes                                                                                                          |
| ---------- | -------------- | ------------------------------ | ----------- | --------------- | ------- | -------------- | ------- | ----------------------------------------------------------------------------------------------------------------------- |
| 2026-08-27 | none available | none; Android toolchain absent | Arabic RTL  | Could not start | NOT RUN | NOT RUN        | BLOCKED | `adb`, `emulator`, `sdkmanager`, and `java` were `NOT_FOUND`; `ANDROID_HOME` and `ANDROID_SDK_ROOT` were `NOT_SET`      |
| 2026-08-27 | none available | none; Android toolchain absent | English LTR | Could not start | NOT RUN | NOT RUN        | BLOCKED | Same missing build/toolchain/device dependency; no native result inferred                                               |
| 2026-09-02 | `6679bb8`      | Pixel_9_Pro_XL / API 35 x86_64 | Arabic RTL  | Could not start | NOT RUN | NOT RUN        | BLOCKED | Three safe headless launches failed before boot: only about 147 MiB was free on `C:`                                    |
| 2026-09-02 | `6679bb8`      | Pixel_9_Pro_XL / API 35 x86_64 | English LTR | Could not start | NOT RUN | NOT RUN        | BLOCKED | Same pre-boot disk-space blocker; no application install or native result inferred                                      |
| 2026-09-02 | `e4d77ad`      | Pixel_9_Pro_XL / API 35 x86_64 | Not reached | Could not start | NOT RUN | NOT RUN        | BLOCKED | Final headless retry passed host/hypervisor checks but failed the emulator disk-space preflight with about 2.0 GiB free |

Secondary web-proxy observations are recorded separately in
`specs/003-family-growth-garden/checklists/web-proxy.md`.

### Automated checks

| Command                                                                    | Date/worktree                          | Result                 | Notes                                                                                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------- | -------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify`                                                           | 2026-09-02 family experience frontend  | PASSED                 | Typecheck, lint, format, 30 files / 464 tests, Expo dependencies current, and 12-page web export; bundle `entry-3296e802c2835dbc71e4d5e1108ed2ec.js`                                                                                                                                  |
| Seven focused presentation/mobile suites                                   | 2026-09-02 family experience frontend  | PASSED                 | 7 files / 42 tests covering family controller/store/UI, bilingual resources/type, Android config, and runtime image selection                                                                                                                                                         |
| Final correction regression and two independent re-reviews                 | 2026-09-02 family experience frontend  | PASSED                 | 3 files / 13 tests; one inherited direction authority, protected role handoff, structural heading semantics, and prepared encouragement intent; no remaining P0–P2 defect                                                                                                             |
| `npx expo config --type introspect --json`                                 | 2026-09-02 family experience frontend  | PASSED                 | Android package resolved; backup false; predictive Back true; `adjustResize`; ar/en locales; recording/audio/external-storage permissions removed                                                                                                                                     |
| `npx expo export --platform android --output-dir output/android/export`    | 2026-09-02 family experience frontend  | PASSED                 | 1,919 modules; 5,082,731-byte Hermes bundle `entry-b3c7bf145c9a72aa784c751ce65ea8a7.hbc`; SHA-256 `761D1CD5887F7F50C60FF95E5049CA61D56436E6881DF8D515643DFE7DE4F186`                                                                                                                  |
| Three hidden/headless API 35 AVD launch attempts                           | 2026-09-02 family experience frontend  | BLOCKED                | Emulator stopped before boot because `C:` had about 147 MiB free; no `adb` device appeared, so install and native interaction checks were not run                                                                                                                                     |
| Headed production-web family replay                                        | 2026-09-02 family experience frontend  | PASSED sampled         | Arabic 412×915 and English 320×700 inherited direction, no overflow, explicit heading structure, matching “Keep growing” encouragement, and Parent → role → Salem Back to `about:blank`; initial local `favicon.ico` 404 only                                                         |
| `npm run typecheck && npm run lint && npm run format:check && npm test`    | 2026-09-02 Child voice integration     | PASSED                 | Typecheck/lint/format exit 0; 25 files / 435 tests                                                                                                                                                                                                                                    |
| `npm run build:web`                                                        | 2026-09-02 Child voice integration     | PASSED                 | 12 static routes; ten authored product routes plus sitemap/not-found; bundle `entry-a36ed701f6f11cbcbc2a457b47e66670.js`                                                                                                                                                              |
| `npm run verify`                                                           | 2026-09-02 Child voice integration     | FAILED dependency gate | The initial run passed all static checks and the then-current 430 tests first; `expo install --check` then reported four installed Expo patch versions behind recommendations; later review regressions raised the independently validated suite to 435 without changing dependencies |
| Impeccable detector and capability/route scans                             | 2026-09-02 Child voice integration     | PASSED                 | Detector `[]`; ten authored routes; zero forbidden presentation imports/calls; zero added TypeScript block comments                                                                                                                                                                   |
| `npm ci`                                                                   | 2026-08-28 repository-cleanup worktree | PASSED                 | Exit 0; 861 packages installed; uuid/eslint deprecation notices and 10 moderate advisories; no audit fix run                                                                                                                                                                          |
| `npm run verify`                                                           | 2026-08-28 repository-cleanup worktree | PASSED                 | Typecheck, lint, maintained-file format check, 17 files / 305 tests, Expo dependency check, and 12-route export                                                                                                                                                                       |
| `CI=1 BROWSER=none npm run web -- --offline --port 8091`                   | 2026-08-28 repository-cleanup worktree | PASSED app / WARN tool | Served HTTP in offline CLI mode with Arabic/RTL root HTML and no deprecated DOM-prop warning; optional DevTools lacked host `libnspr4.so`                                                                                                                                             |
| `npm ci`                                                                   | 2026-08-27 dirty Feature 003 worktree  | PASSED final           | Exit 0; uuid/eslint deprecation notices and 10 moderate advisories; no audit fix/dependency upgrade run                                                                                                                                                                               |
| `npm run typecheck`                                                        | 2026-08-27 dirty Feature 003 worktree  | PASSED final           | Exit 0                                                                                                                                                                                                                                                                                |
| `npm run lint`                                                             | 2026-08-27 dirty Feature 003 worktree  | PASSED final           | Exit 0                                                                                                                                                                                                                                                                                |
| `npm run format:check`                                                     | 2026-08-27 dirty Feature 003 worktree  | PASSED final           | Exit 0; all matched files use Prettier                                                                                                                                                                                                                                                |
| `npm test`                                                                 | 2026-08-28 professional-audit worktree | PASSED final           | 17 files / 305 tests                                                                                                                                                                                                                                                                  |
| `npx expo install --check`                                                 | 2026-08-27 dirty Feature 003 worktree  | PASSED T102            | Exact output: `Dependencies are up to date`; Expo SDK 57 patch alignment documented with no new library                                                                                                                                                                               |
| `npx expo config --type public`                                            | 2026-08-27 dirty Feature 003 worktree  | PASSED final           | Mock service mode; predictive Back enabled; recording/background flags false                                                                                                                                                                                                          |
| `npx expo export --platform web --output-dir output/web-feature003-final`  | 2026-08-27 dirty Feature 003 worktree  | PASSED checkpoint      | Static export contained ten product pages plus support pages; generated directory was intentionally not retained                                                                                                                                                                      |
| `npx expo export --platform web --output-dir output/web-feature003-final2` | 2026-08-27 dirty Feature 003 worktree  | PASSED build           | Pre-convergence bundle; recorded walk is partial and generated directory was intentionally not retained                                                                                                                                                                               |
| `npx expo export --platform web --output-dir dist`                         | 2026-08-27 dirty Feature 003 worktree  | PASSED final           | Exit 0; 12 static routes = ten product routes plus generated sitemap/not-found; `dist` is gitignored                                                                                                                                                                                  |
| `git diff --check`                                                         | 2026-08-27 dirty Feature 003 worktree  | PASSED final           | Exit 0                                                                                                                                                                                                                                                                                |

The repository-cleanup export produced 12 static routes and bundle
`entry-735bb0ad95f4d16e3497160215ba85e4.js`; `dist/index.html` began with Arabic `lang="ar"` and
`dir="rtl"`. This was a clean install/build/start checkpoint, not a new manual ten-route browser
acceptance run. The curated 2026-08-28 professional-audit journey remains the latest complete
ten-route replay; the 2026-09-02 family replay below is the latest bounded web sample.

The final Impeccable detector returned JSON `[]`. Bundle
`entry-09e5b5d373078942395b4f713ab42137.js` produced 0 console errors and one generated-bundle
warning, “unreachable code after return statement” at line 673. It did not block an observed
transition and remains recorded as a framework/bundle follow-up.

### Deterministic behavior evidence

| Check                                              | Status                           | Direct checkpoint evidence                                                                                                                                   |
| -------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Exact route inventory                              | PASSED automated/source          | Ten product route files plus `_layout.tsx`; no replaced Feature 002 route file                                                                               |
| Five external-service-denied cycles                | PASSED automated                 | `tests/operator-demo-flow.test.ts` in the 98-test story batch                                                                                                |
| Five exact resets from every FR-095 source state   | PASSED automated                 | `tests/prototype-state.test.ts` focused run: 24/24; final 305-test suite includes it                                                                         |
| Assignment/choice/start/submission issue no reward | PASSED automated                 | Lifecycle, Parent, Child, and operator suites                                                                                                                |
| One confirmation changes exactly four counters     | PASSED automated + sampled web   | 48→60 Seeds, 48/60 Shoot→60/60 Sapling, 19→20 canopy, 11→12 circle                                                                                           |
| Five duplicate confirmations                       | PASSED automated                 | Same immutable receipt; no extra transaction, growth, leaf, action, announcement, milestone, or celebration                                                  |
| Privacy before shared mutation                     | PASSED automated                 | Strict minimal projection rejects private/sensitive/non-Green/identity/Seed/task/media/reflection/assistant/note/unknown/duplicate candidates                |
| Prepared timeout/failure/schema/safety fallback    | PASSED automated                 | Same-attempt deterministic fallback retains current Parent input                                                                                             |
| Adjusted-task Coach binding                        | PASSED focused review regression | Canonical prepared Coach remains v1-bound; an accepted adjusted v2 task fails closed to approved action + stop/ask step and trusted-adult/unavailable notice |
| Final adversarial boundary replay                  | PASSED independent               | 23/23 runtime probes; no remaining source-verifiable HIGH/MEDIUM P0 finding                                                                                  |
| Missing image/audio/circle fixtures                | PASSED automated/source          | Image error clears selection; transcript/description remain; circle fails closed to local household goal                                                     |
| Arabic resource parity/canonical fixture stability | PASSED automated                 | `tests/localization-parity.test.ts`; named fluent review remains `NOT RUN`                                                                                   |
| Parent voice/AI authority and denial               | PASSED automated + sampled web   | Grants start off; Child role cannot grant; Parent uses service-backed reauthentication; Arabic Parent panel showed off/on states                             |
| Age-derived prepared Coach presentation            | PASSED automated + sampled web   | Salem `9_11` renders at most three complete steps/choices, standard pace, task binding, and persistent adult exit                                            |
| Synthetic voice lifecycle and locale preservation  | PASSED automated + sampled web   | Active/review/sent/delete/reset, captions, 0.75×/1×, replay, canonical transcript, English/Arabic switching, and stale lifecycle denial                      |
| Bilingual typography resolver                      | PASSED automated/source          | Six roles resolve per script; Arabic tracking 0 and body leading ≥1.55; `Text`/`Input` share the resolver; detector returned `[]`                            |
| Current story-level RED history                    | NOT RUN                          | T038/T046/T052/T058/T064/T073 were not recorded before implementation and cannot be reconstructed truthfully                                                 |

### Final web-proxy pass

- Firefox at 390×844 completed final-bundle Arabic RTL and English LTR journeys through all ten
  authored routes.
- Required task gating, prepared Guide, full review, Child choose and separate start, Coach,
  prepared image, unavailable-audio transcript, submission, praise-first recognition, garden, and
  circle were observed.
- Arabic garden/circle showed 60/60 Sapling, 20/25 canopy, and 12/12 coarse eligible actions.
- English garden/circle showed equivalent 60/60, 20 leaves, 12/12, and explicit aggregate-only
  privacy copy.
- From recognized English garden, reset produced URL `/`, `html lang=ar`, `html dir=rtl`, computed
  RTL, and Arabic selected. Six consecutive real Back actions remained `/` with entry visible and
  no private route, including the history depth that previously exposed stale routes; an
  independent reviewer reproduced the final result with zero console errors.
- No non-static request was recorded by the browser request ledger.
- Duplicate already-confirmed, distinct safe-equivalent/adjusted Coach, and English kind-retry
  branches were mounted successfully. Synthetic missing-image/circle injection was not mounted.

Web proxy details and artifact names are in
`specs/003-family-growth-garden/checklists/web-proxy.md`. Web cannot pass Android media, keyboard,
Back, reduced-motion, TalkBack, font-scale, permission, or physical-touch requirements.

### 2026-09-02 Child voice presentation replay

A headed 390×844 browser replay exercised the new prepared-only slice in Arabic and English. The
Parent permission began off, changed only through the dedicated Parent action, and stayed separate
from assignment approval. Salem's Coach displayed the `9_11` cap of three steps and three quick
choices, standard pace, task binding, no-open-chat notice, and the persistent adult exit.

The Child rehearsal visibly completed start, active stop, canonical transcript review, captions,
0.75×/1× simulated playback, replay count, English/Arabic switching, rehearsal-only send, reset,
and delete-before-send. The sampled width remained 390px with no horizontal overflow. Screenshots
are in `output/playwright/feature003-voice/`. One local `/favicon.ico` 404 was the only console error;
no application exception was observed. Android and named-human evidence remain unchanged.

### 2026-09-02 Family experience frontend replay

A headed production-web replay at 412×915 and 320×700 exercised synthetic Parent/Child entry,
Parent-only Salem revoke/restore, private Reward creation/delivery, the fixed three-person League,
Salem's strict private/minimal projections, and the displayed “Keep growing” encouragement. Arabic
began with inherited RTL at 412×915; English switched the document and UI to inherited LTR at
320×700; both samples had no horizontal overflow. Parent → role → Salem cleared app history, so
browser Back reached `about:blank` rather than a stale Child or Parent screen. Visible heading
navigation excluded wordmarks, totals, praise, and metrics. The initial local `/favicon.ico` 404 was
the only console error; no application exception was observed. Android and named-human status did
not change.

### Current implementation blockers and gaps

- Convergence and later adversarial/reset/audit fixes remain **PASSED automated**; the current full
  suite is 464/464, and the historical independent runtime replay was 23/23 with no remaining
  source-verifiable HIGH/MEDIUM P0 finding. Synthetic missing-image/circle injection remains
  automated proxy evidence.
- Current local Android attempt: **COMPLETE with BLOCKED outcome**. Java, SDK, ADB, emulator, and a
  `Pixel_9_Pro_XL` API 35 AVD exist. The final headless retry passed host and hypervisor checks but
  still failed the emulator disk-space preflight with about 2.0 GiB free. No application install or
  native observation occurred.
- Optional live Parent model transformation: **BLOCKED** because there is no approved secure
  server-side boundary; the competition build uses the honestly labeled prepared fallback.
- Current typecheck, lint, format, 464-test suite, Expo dependency check, web export, Android config
  introspection, Android export, capability scan, route inventory, and diff: **PASSED**.
- Final-bundle Arabic/English journeys, reset locale/direction, and six browser Back actions:
  **PASSED on web proxy**.
- Android offline, predictive Back, keyboard/IME, prepared playback, permissions, reduced motion,
  TalkBack, 200% font scale, physical touch targets, native contrast, and runtime performance:
  **NOT RUN** because neither the AVD nor a physical build could start.
- Five timed rehearsals and three-person comprehension: **NOT RUN**.
- Named fluent Arabic/UAE culture, faith, child-safeguarding, sustainability, and accessibility
  reviews: **NOT RUN**.

### Human rehearsal

Run five uninterrupted rehearsals from reset and record every duration; report median and maximum.
The internal target is five of five complete journeys at or below 150 seconds with no hidden setup.

| Run | Operator | Duration | Reset exact | Error/fallback used | Result  |
| --: | -------- | -------: | ----------- | ------------------- | ------- |
|   1 | —        |        — | —           | —                   | NOT RUN |
|   2 | —        |        — | —           | —                   | NOT RUN |
|   3 | —        |        — | —           | —                   | NOT RUN |
|   4 | —        |        — | —           | —                   | NOT RUN |
|   5 | —        |        — | —           | —                   | NOT RUN |

Ask three people unfamiliar with the detailed design: “What did the Child do, what did the AI do,
who approved the reward, and what can other families see?” Record answers verbatim enough to show
whether they understood the action, bounded AI, Parent gate, and aggregate-only sharing.

## Demo-Acceptance Gate

Do not describe Feature 003 as demo-accepted until:

- the active Spec Kit artifacts are approved;
- all automated checks pass from a named worktree state;
- the exact journey passes on a named Android build in Arabic and English;
- offline, duplicate-confirm, reset, Back, reduced-motion, and prepared-media fallbacks pass;
- five timed rehearsals meet the internal target;
- three comprehension checks identify the core loop and privacy boundary; and
- remaining cultural, faith, safeguarding, or accessibility review gaps are disclosed by name.

Real Child media, real accounts, and real family circles are outside this gate. A secure live Parent
task-refinement call with synthetic input is the competition AI target; if it is unavailable, keep
the prepared journey usable and report live AI as `BLOCKED` or `NOT RUN` rather than claiming it.
