# Ghaf store listing — PRELAUNCH DRAFT

Date: **2026-09-14**. Internal copy preparation only. Current candidate: **NOT READY**.
**Nothing in this document is approved for publication or store submission.**
No store entry, hosted page, asset upload or promotional recording was created.

The complete [45-row release ledger](release-readiness.md) (R01–R38, A01–A07),
[Feature021](../../specs/021-release-readiness/spec.md) and
[security/privacy assessment](release-security-and-privacy.md) remain authoritative.
This shorter marketing narrative does not reduce that scope or defer missing
features. Every functional claim below requires acceptance on the current
standalone Android candidate using two independent clients; historical source,
browser, test and APK evidence cannot pass that gate.

## Candidate listing fields

Counts include spaces and punctuation; Unicode code-point and UTF-16 counts agree
for these strings. Titles are within 30 characters; short descriptions within 80.
Recheck after any copy change. Arabic is draft Modern Standard Arabic; named human
Arabic review and Play Console rendering remain pending.

| Field             | English locale                                                                | Characters | Arabic locale                                          | Characters |
| ----------------- | ----------------------------------------------------------------------------- | ---------- | ------------------------------------------------------ | ---------- |
| Title             | Ghaf — غاف                                                                    | 10 / 30    | غاف — Ghaf                                             | 10 / 30    |
| Short description | Family routines, shared tasks and a growing garden, one small step at a time. | 77 / 80    | روتين عائلي ومهام مشتركة وحديقة تنمو مع كل خطوة صغيرة. | 54 / 80    |

### English full description — unpublished candidate

Ghaf brings family routines into a shared journey, inspired by the Ghaf tree and
the landscapes of the UAE.

Parents choose activities and review completion. Children follow clear steps, ask
for help and submit their tasks for review. Confirmed eligible activities add
Seeds to a symbolic garden.

Keep task planning, study plans and family progress in one place. Revisit eligible
activity memories and use Arabic or English throughout the experience.

The garden represents progress in the app. It does not measure environmental
impact or represent real trees planted.

### الوصف الكامل بالعربية — مسودة غير منشورة

يجمع غاف روتين الأسرة في رحلة مشتركة، مستوحاة من شجرة الغاف والبيئات الطبيعية في دولة الإمارات.

يختار أولياء الأمور الأنشطة ويراجعون إتمامها. يتبع الأطفال خطوات واضحة، ويطلبون المساعدة، ثم يرسلون مهامهم للمراجعة. تضيف الأنشطة المؤهلة التي يؤكدها ولي الأمر بذورًا إلى حديقة رمزية.

اجمعوا تخطيط المهام وخطط الدراسة وتقدم الأسرة في مكان واحد. عودوا إلى ذكريات الأنشطة المؤهلة، واستخدموا العربية أو الإنجليزية خلال التجربة.

تمثل الحديقة التقدم داخل التطبيق. ولا تقيس أثرًا بيئيًا أو تمثل أشجارًا زُرعت في الواقع.

## Draft internal release notes

These notes describe a future internal verification package, not an already
accepted or distributed build. Attach the actual commit, artifact hash and build
mode when that package exists; no version or release date is invented here.

**English:** Prelaunch candidate for internal review. Exercise family setup,
separate Parent/Child access, task help and completion, Parent confirmation,
garden progress and study planning. Verify persistence across two independent
clients. This candidate has not passed release acceptance.

**العربية:** نسخة ما قبل الإطلاق للمراجعة الداخلية. اختبروا إعداد الأسرة، ودخول ولي الأمر والطفل كلٌّ على حدة، والمساعدة في المهام وإتمامها، وتأكيد ولي الأمر، وتقدم الحديقة وخطط الدراسة. تحققوا من حفظ البيانات عبر نسختين مستقلتين من التطبيق. لم تجتز هذه النسخة متطلبات قبول الإصدار.

## Internal capture and promo walkthrough

This is a proposed recording sequence, not an existing recording. Use only
operator-controlled synthetic QA identities in the accepted real-account test
environment. Capture the same standalone build and family on both clients; do not
composite a successful state or show private real-user information. Keep prototype
or prepared-response disclosures visible wherever the app displays them.

| Shot / action after acceptance                                                | English caption draft                    | مسودة التعليق العربي               | Evidence to capture                                                                                        |
| ----------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Parent creates a fresh family, then enrolls a test Child on the second client | A family journey starts here             | هنا تبدأ رحلة الأسرة               | Empty account, explicit membership and independent Child access; no prefilled history.                     |
| Parent selects and assigns an eligible activity; Child opens it               | Clear steps for everyday activities      | خطوات واضحة لأنشطة يومية           | Same assigned task and award on both clients; Parent approval precedes Child access.                       |
| Child opens task help, requests support and completes the steps               | Every step can include support           | يمكن طلب المساعدة في كل خطوة       | Actual prepared help label, permitted-help route and successful submission; no simulated live AI response. |
| Parent reviews and confirms; Child opens the garden                           | Recognize effort. Watch the garden grow. | قدّروا الجهد وشاهدوا نمو الحديقة   | One eligible recognition, matching persistent progress after restart, no duplicate award.                  |
| Revisit an eligible memory and a saved study plan                             | Keep the next small step in view         | أبقوا الخطوة الصغيرة التالية واضحة | Correct family/profile data after reload, Arabic and English captures, no invented memories or completion. |

Do not narrate a response as successful before the actual service succeeds.
Retain original captures and the commit/build/device/locale record. No fixed
performance, completion-time or wellbeing benefit is promised by these captions.

## Claims matrix

The evidence column describes existing implementation, not acceptance of a
public claim. **All publication approvals are NO while the current candidate is
NOT READY**, including the matching Arabic text and walkthrough captions.

| Candidate claim                                    | Actual source / evidence                                                                                                                                              | Limit and acceptance needed                                                                                                                                                     | Approved for publication |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Ghaf identity and UAE-inspired garden              | User-selected [5A identity](../design/brand/5a-refined-classic/README.md); [landscape presentation](../../src/components/cloud-family/CloudGardenView.tsx)            | Brand selection is established; source conversion, launcher/store rendering and current captures are separate evidence. No planting/impact claim.                               | NO                       |
| Parent-reviewed tasks and Child help               | [Cloud task lifecycle](../../src/components/cloud-family/CloudTaskViews.tsx), [prepared guide](../../src/components/cloud-family/CloudPreparedTaskGuide.tsx)          | Verify assignment, help, submission and Parent confirmation across the two current clients, including failed/repeated requests. Prepared content is not live AI.                | NO                       |
| Eligible completion adds Seeds and symbolic growth | [Recognition authority](../../supabase/migrations/20260915000100_family_accounts.sql), [growth migration](../../supabase/migrations/20260915000300_family_growth.sql) | Verify eligible-only, idempotent and persistent awards. Recognition-only/maintenance tasks must not be described as earning Seeds.                                              | NO                       |
| Study plans and eligible memories                  | [Study UI](../../src/components/cloud-study/CloudStudyView.tsx), [garden/memories UI](../../src/components/cloud-family/CloudGardenView.tsx)                          | Current standalone save/reload/isolation and two-client acceptance pending. Memory removal is not complete account erasure.                                                     | NO                       |
| Arabic and English experience                      | [Bilingual resources](../../src/i18n/resources.ts), [current design contract](../DESIGN.md), [font authority](../../src/design/tokens.ts)                             | Human Arabic review, current RTL/LTR, large-text and complete-flow checks pending. No accessibility-conformance claim.                                                          | NO                       |
| Account continuity / two-client walkthrough        | [Account service](../../src/services/accounts/SupabaseParentAccountService.ts), [Feature020 inventory](supabase-data-migration.md)                                    | Historical hosted evidence is not current standalone acceptance. No offline cloud availability or guaranteed synchronization claim.                                             | NO                       |
| Other committed launch features                    | All R01–R38/A01–A07 in the [release ledger](release-readiness.md)                                                                                                     | Missing location, calls, calendar synchronization, billing-related scope and other incomplete rows remain unresolved obligations. Their omission from copy does not defer them. | NO                       |

Live AI, billing/payment capability, location tracking, calls, calendar sync,
measured environmental or wellbeing outcomes, security/compliance certifications
and present availability are excluded from this draft. Their source/evidence and
release obligations must be resolved through the ledger, not marketing wording.

## Exact assets and provenance

- **Store icon source:** [play-store-icon-512.png](../../assets/brand/ghaf/app-icon/play-store-icon-512.png),
  512×512 RGB in the [5A manifest](../design/brand/5a-refined-classic/manifest.json).
  The file hash was checked against that manifest on 2026-09-14:
  `908f18f13c49700f0e68fffd7fbc3f12b42e3c28dd52eae6de4a07f8b25b39f4`.
  Do not substitute the adaptive foreground layer or an exploration-board crop.
- **Runtime mark:** [transparent 1024px source](../../assets/brand/ghaf/ghaf-mark-full-color-1024.png),
  used by [GhafRasterLogo](../../src/components/brand/GhafRasterLogo.tsx). The
  [selection/extraction record](../design/brand/5a-refined-classic/README.md)
  distinguishes the user-selected reference from its generated derivative. Keep
  proportions, forest/teal palette and live Arabic/English wordmarks.
- **Fonts:** approved roles are Alexandria headings and Readex Pro body/controls,
  documented in the [R001 release](../design/stitch/releases/ghaf-r001/STITCH_DESIGN.md)
  and [current design contract](../DESIGN.md), with exact local font paths in
  [Expo configuration](../../app.config.ts). The installed packages' `LICENSE_FONT`
  files state SIL OFL 1.1; retain license notices in the release asset inventory.
  Do not replace Arabic fonts or bake text from the logo exploration board into art.
- **Existing screenshots:** [Parent Home Arabic](../screenshots/parent-home-ar.png),
  [Child Today Arabic](../screenshots/child-today-ar.png),
  [Family Garden Arabic](../screenshots/family-garden-ar.png). The
  [repository screenshot note](../../README.md#product-screens) dates them to synthetic
  source `fd73cc4`, 2026-09-09. They predate 5A/current Feature020 and are reference
  material only; **none is approved as a current release screenshot**. Capture
  replacements from the accepted standalone build in both locales.

No new image, screenshot, feature graphic or video was generated for this draft.
Asset provenance and user selection do not themselves establish public trademark,
rights, human review or store acceptance.

## Publication blockers and handoff

| Required item                                                       | Actual state                                                        |
| ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Accountable operator/developer identity and support contact         | Not established for this release; no invented name, email or phone. |
| Public support URL                                                  | Missing / not verified.                                             |
| Public privacy-policy URL and in-app access                         | Missing / not verified.                                             |
| Public account/data-deletion request URL and in-app initiation      | Missing; sign-out/reset is not deletion.                            |
| Current standalone two-client acceptance and release captures       | Pending; historical artifacts cannot substitute.                    |
| All 45 requirements, privacy/operations gates and Play declarations | Current ledger remains NOT READY; no public submission approval.    |

Next action: root reconciles this draft with the accepted candidate, actual
operator/contact/URLs, complete release ledger and named Arabic review before any
store-field entry or asset upload. Keep the internal draft labels until that
explicit review is complete; do not publish placeholder URLs or this working note.
