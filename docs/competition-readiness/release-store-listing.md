# Ghaf store listing — PRELAUNCH DRAFT

Updated: **2026-09-15 Dubai**. Internal copy preparation only. Current candidate: **NOT READY**.
**Nothing in this document is approved for publication or store submission.**
No store entry, hosted page, asset upload or public promo was created by this draft.
Root's separate synthetic QA screenshots and recording are identified below.

The complete [45-row release ledger](release-readiness.md) (R01–R38, A01–A07),
[Feature021](../../specs/021-release-readiness/spec.md) and
[security/privacy assessment](release-security-and-privacy.md) remain authoritative.
The [asset notices and commercial-rights gaps](release-asset-notices.md) must also
be reconciled before public distribution; approved appearance alone is insufficient.
This shorter marketing narrative does not reduce that scope or defer missing
features. Every functional claim below still needs its complete release acceptance.
The [QA record](release-qa-results.md) now establishes the bounded b2 standalone
GI01 journey through separate Android users on one emulator; this is evidence for
the exercised flow, not all catalog tasks, two physical devices or accessibility.

The core journey was tested on `ghaf-internal-b2b43028ebd6.apk`, source
`b2b43028ebd61ba943a808bf6c3be35ff8f78d5f`, 88,451,812 bytes, SHA-256
`ec870fa8bf8153c847751482ae4bba161f86fd141bedb4b70078606ea3510ff5`, from
[run34891473556](https://github.com/abdalrahman-ismaik/Ghaf/actions/runs/34891473556).
Its controlled family has two tasks, 16 Seeds, two canopy contributions and two
memories after the native confirmation/save/restart checks. A normal Parent A→B
account switch showed B's empty family setup; B was already approved, not a new
public signup. One QA confirmation email reached its exact Inbox alias, with
the OTP unredeemed; public signup, recovery and reliable delivery remain unverified.
The final `4dd6490` large-text fix passed fresh build and bounded native checks in
[run34896135774](https://github.com/abdalrahman-ismaik/Ghaf/actions/runs/34896135774);
its APK is88,451,956bytes, SHA-256
`eacad1cc78a04e4d2a7d753a646ea07bb0540061e7e0fd47497ad757afd3a886`.
The actual installed hash matched. Enlarged Arabic/English labels, repeat input,
Back, disabled animations, Child upgrade and Parent restoration after clean QA
app data passed. The b2 full core mutation and4dd regression/readback scopes
remain distinct. [Current reviewed captures](release-evidence/2026-09-15/README.md)
are engineering evidence, not approved store artwork or public-release acceptance.

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

These notes accompany internal review of the existing b2 package identified above:
version 0.1.0/code 1, standalone release-mode APK with the Expo internal template
signer. This is not a Play production artifact or release acceptance. Its APK,
receipt and companion font notices are under `output/release-021-candidate/`.
Keep any later 4dd artifact and acceptance evidence separately identified.

**English:** Prelaunch candidate for internal review. Exercise family setup,
separate Parent/Child access, task help and completion, Parent confirmation,
garden progress and study planning. Verify persistence across two independent
clients. This candidate has not passed release acceptance.

**العربية:** نسخة ما قبل الإطلاق للمراجعة الداخلية. اختبروا إعداد الأسرة، ودخول ولي الأمر والطفل كلٌّ على حدة، والمساعدة في المهام وإتمامها، وتأكيد ولي الأمر، وتقدم الحديقة وخطط الدراسة. تحققوا من حفظ البيانات عبر نسختين مستقلتين من التطبيق. لم تجتز هذه النسخة متطلبات قبول الإصدار.

## Internal capture and promo walkthrough

This proposed public promo sequence has not been produced or approved. Existing
b2 captures and `b2-parent-confirmation.mp4` document a bounded synthetic QA run;
they are not an accepted promotional package. Use only operator-controlled
synthetic QA identities in the authorized real-account test environment.
Capture the same standalone build and family on both clients; do not
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

| Candidate claim                                    | Actual source / evidence                                                                                                                                                                                                                                        | Limit and acceptance needed                                                                                                                                                                             | Approved for publication |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Ghaf identity and UAE-inspired garden              | User-selected [5A identity](../design/brand/5a-refined-classic/README.md); [landscape presentation](../../src/components/cloud-family/CloudGardenView.tsx)                                                                                                      | Brand selection is established; source conversion, launcher/store rendering and current captures are separate evidence. No planting/impact claim.                                                       | NO                       |
| Parent-reviewed tasks and Child help               | [Cloud task lifecycle](../../src/components/cloud-family/CloudTaskViews.tsx), [prepared guide](../../src/components/cloud-family/CloudPreparedTaskGuide.tsx); [b2 native GI01 submission/praise/confirmation](release-qa-results.md) executed.                  | One controlled GI01 flow passed state transitions; authoritative adult prerequisites (G1), full help/retry and all-task acceptance remain open. Prepared content is not live AI.                        | NO                       |
| Eligible completion adds Seeds and symbolic growth | [Recognition authority](../../supabase/migrations/20260915000100_family_accounts.sql), [growth migration](../../supabase/migrations/20260915000300_family_growth.sql); b2 native GI01 +8 only after Parent confirmation, 16 total retained after both restarts. | This exact +8 award is verified; it does not establish every task award or safe real-world participation. Recognition-only/maintenance tasks must not be described as earning Seeds.                    | NO                       |
| Study plans and eligible memories                  | [Study UI](../../src/components/cloud-study/CloudStudyView.tsx), [garden/memories UI](../../src/components/cloud-family/CloudGardenView.tsx); b2 native second-memory save and both restart readbacks passed; Study has separate hosted evidence.               | Current native Study forms/lifecycle and complete memory editing/deletion remain pending. Memory removal is not complete account erasure; two Android users are not two physical devices.               | NO                       |
| Arabic and English experience                      | [Bilingual resources](../../src/i18n/resources.ts), [design](../DESIGN.md), [fonts](../../src/design/tokens.ts); b2 bounded Arabic journey/default-font footer observed.                                                                                        | 4dd native font1.5 Arabic/English whole-label checks passed after the b2 defect. Locale persistence, full RTL/LTR, named Arabic and accessibility review remain open; no conformance claim.             | NO                       |
| Account continuity / two-client walkthrough        | [Account service](../../src/services/accounts/SupabaseParentAccountService.ts); [b2 QA](release-qa-results.md) documents paired-Child upgrade, both session restarts and normal Parent A→approved B empty-family switching.                                     | Executed on independent Android users 11/12 on one emulator, with controlled QA accounts. No public signup, full adversarial isolation, offline cloud availability or guaranteed synchronization claim. | NO                       |
| Other committed launch features                    | All R01–R38/A01–A07 in the [release ledger](release-readiness.md)                                                                                                                                                                                               | Missing location, calls, calendar synchronization, billing-related scope and other incomplete rows remain unresolved obligations. Their omission from copy does not defer them.                         | NO                       |

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
  The actual b2 companion folder includes complete OFL/MIT licenses plus the
  Apache/MIT licenses for the packaged Material Symbols font; see the [asset evidence](release-asset-notices.md).
  User-readable in-app notices and remaining rights are still unaccepted.
  Do not replace Arabic fonts or bake text from the logo exploration board into art.
- **Existing screenshots:** [Parent Home Arabic](../screenshots/parent-home-ar.png),
  [Child Today Arabic](../screenshots/child-today-ar.png),
  [Family Garden Arabic](../screenshots/family-garden-ar.png). The
  [repository screenshot note](../../README.md#product-screens) dates them to synthetic
  source `fd73cc4`, 2026-09-09. They predate 5A/current Feature020 and are reference
  material only; **none is approved as a current release screenshot**. Capture
  replacements from the accepted standalone build in both locales.
- **Current internal QA captures:** ignored `.expo/release-20260914/` contains
  b2 native safety/task, Parent two-memory, Child canopy/memory, account-B empty
  and large-text captures listed in the [QA record](release-qa-results.md).
  The 962,223-byte `b2-parent-confirmation.mp4` was requested for 30 seconds; its
  actual duration was independently parsed from MP4 metadata as29.2407seconds,
  but the video was not decoded/reviewed for visual quality. These show controlled synthetic
  data and include an enlarged-text defect. They are not approved store images
  or evidence of human review or all-task acceptance. The later4dd screenshots
  have their own reviewed source/index above.

No image, screenshot, feature graphic or video was generated by this draft update.
Asset provenance and user selection do not themselves establish public trademark,
rights, human review or store acceptance.

## Publication blockers and handoff

| Required item                                                       | Actual state                                                                                                                                                                                              |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accountable operator/developer identity and support contact         | Not established for this release; no invented name, email or phone.                                                                                                                                       |
| Public support URL                                                  | Missing / not verified.                                                                                                                                                                                   |
| Public privacy-policy URL and in-app access                         | Missing / not verified.                                                                                                                                                                                   |
| Public account/data-deletion request URL and in-app initiation      | Missing; sign-out/reset is not deletion.                                                                                                                                                                  |
| Current standalone two-client acceptance and release captures       | Bounded b2 core/A→B switch and final4dd layout/upgrade/clean-app-data restoration passed on separate Android users. Full-feature, accessibility, two-device and public capture acceptance remain pending. |
| All 45 requirements, privacy/operations gates and Play declarations | Current ledger remains NOT READY; no public submission approval.                                                                                                                                          |

Next action: root reconciles this draft with the accepted candidate, actual
operator/contact/URLs, complete release ledger and named Arabic review before any
store-field entry or asset upload. Keep the internal draft labels until that
explicit review is complete; do not publish placeholder URLs or this working note.
