# Ghaf Feature 003 Demo Runbook

## Feature 006 Natural Ambient Audio Record — 2026-09-08

**Current classification:** implemented local foreground ambience and shared device setting;
physical Android listening, TalkBack/audio-focus behavior, and named-human review remain
`NOT RUN`.

Launch Ghaf and interact once if the browser requires it. Confirm that one quiet nature soundscape
continues without restarting while moving from onboarding through Parent or Child routes and that
prepared narration remains clearly dominant. In each role, open Settings: the Sound section must
follow language, and **Nature ambience** must expose one native on/off switch. Turn it off, move
between routes and roles, and confirm silence; turn it on and confirm playback resumes while the
app is active. Sign out and re-enter the other role to confirm the device preference remains.

Background and foreground the app, exercise prepared narration, and enter an eligible synthetic
voice-capture harness if available. Ambience must pause in the background, duck during narration,
and pause while voice owns audio focus. With a screen reader active it must remain silent. Finish
with the Parent-authorized exact reset and confirm the stored choice is removed and the switch
returns to default-on. Never describe the local soundscape as streaming, live environmental audio,
recording, measured nature, or proof that Ghaf plants trees.

| Gate                                                                                          | Result                    | Evidence                                                                              |
| --------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------- |
| Preference schema, persistence failure, sign-out/role handoff, and exact reset                | `PASSED automated`        | strict device-local record and focused store/reset coverage                           |
| Foreground, browser-unlock, screen-reader, narration-ducking, and voice-focus policy          | `PASSED automated/source` | pure playback matrix and one root-player source contract                              |
| Parent/Child hierarchy, bilingual copy, native switch semantics, and 48dp target              | `PASSED automated/source` | shared component, resource parity, and source assertions                              |
| Mechanical UI review                                                                          | `PASSED`                  | Impeccable detector returned `[]` over the changed provider/onboarding/Settings files |
| Asset provenance and technical identity                                                       | `PASSED local/source`     | local synthesized 48.039s mono MP3; SHA-256 recorded beside the asset                 |
| Focused audio, reset, voice-focus, and onboarding regression                                  | `PASSED`                  | 4 files / 65 tests                                                                    |
| Full repository and production exports                                                        | `PASSED automated`        | typecheck, zero-warning lint, formatting, 121 files / 1,335 tests, 39 web routes, and an Android JavaScript export with 95 assets |
| Expo dependency alignment                                                                      | `PASSED local SDK map`    | dependencies match the installed Expo SDK map; online registry freshness is `NOT RUN` |
| Physical Android naturalness, volume, seam, background/audio focus, silent mode, and TalkBack | `NOT RUN`                 | requires the competition device and a named human listener                            |
| Named Arabic, accessibility, audio, and product review                                        | `NOT RUN`                 | no named reviewer participated in this implementation window                          |

## Emirati Parent Access Portrait Record — 2026-09-08

**Current classification:** integrated local presentation candidate; physical Android and named
Emirati cultural, image-rights, safeguarding, accessibility, and visual review remain
`BLOCKED / NOT RUN`.

From Welcome, choose Parent access in Arabic and English. Verify that the same fictional adult
Emirati Parent portrait appears on sign-in, new-family sign-up, and verification; that the centered
crop remains calm and undistorted; and that the login action stays visually dominant. On a compact
320×720 viewport, confirm that sign-in and sign-up actions remain reachable and verification can
scroll without moving its protected primary action. The portrait is decorative and should not be
announced by a screen reader. It must never be described as a real family member, identity check,
guardian proof, live AI output, or evidence that Ghaf plants trees.

| Gate | Result | Evidence |
| --- | --- | --- |
| Generated source and final crop inspection | `PASSED local visual` | one fictional adult, accurate understated attire, centered 3:2 crop, no Child, props, text, logo, UI, or product claim |
| Exact local provenance, prompt, dimensions, byte budget, and failure-safe component | `PASSED automated/source` | embedded prompt, 1200×800 JPEG, 91,432 bytes, local literal source, Expo Image, and non-blocking decode failure |
| Arabic RTL and English LTR compact presentation | `PASSED Firefox web proxy` | sign-in at 320×720 and 390×844 plus sign-up/verification at 320×720; primary actions reachable and no application console errors |
| Mechanical design review | `PASSED` | Impeccable detector returned `[]` for the component and three Parent routes |
| Focused access/startup regression and scoped source checks | `PASSED` | 5 files / 66 tests; strict TypeScript, zero-warning ESLint, Prettier, dependency alignment, and Git whitespace |
| Whole-repository verification during this window | `BLOCKED by concurrent unrelated work` | the separately reserved Natural Ambient Audio window removed the old onboarding ambience before completing replacement wiring, causing the only typecheck, regression, and web-export failures |
| Physical Android render/decode/memory, TalkBack, font scale, and keyboard | `BLOCKED / NOT RUN` | no qualifying native observation in this window |
| Named Emirati cultural, image-rights, safeguarding, accessibility, and visual review | `NOT RUN` | no named reviewer was available in this implementation window |

## Feature 005 Remembered Device Access Record — 2026-09-07

**Current classification:** implemented device-local prototype continuity; physical Android,
named-human review, production identity, and real cross-device account/state sync remain
`BLOCKED / NOT RUN` or out of P0.

For the Parent-owned path, verify the Parent, leave **Remember me on this device** unchecked, and
confirm an ordinary relaunch remains signed out. Repeat with the choice checked and confirm a
relaunch opens Parent Home through fresh synthetic authority. Choose Parent logout and confirm the
next launch remains signed out.

For the Child-owned path, complete Parent-approved pairing for Salem and relaunch. Confirm Salem
opens Today without repeating the credential. Choose **Parent access** from the Child surface:
Child authority must end before Parent verification, and the pairing must remain. After the Parent
enters, choose Parent logout and confirm Ghaf restores Salem with fresh authority. Revoke Salem or
run the one-action reset, relaunch, and confirm Child restoration is denied. Never present one
installation as remembering Parent and Child simultaneously.

| Gate | Result | Evidence |
| --- | --- | --- |
| Strict affinity schema, repository failures, and no credential/session persistence | `PASSED automated/source` | exact-key parsing, corrupt/mismatch denial, isolated cloned reads, clear ordering, and scoped source inspection |
| Parent opt-in/out, restart, fresh authority, and logout failure safety | `PASSED automated/source` | focused controller/bootstrap/store coverage |
| Child pairing continuity, revocation/reset denial, and single-primary replacement | `PASSED automated/source` | focused controller/bootstrap/store coverage |
| Temporary Child → Parent → Child handoff and mutual authority exclusion | `PASSED automated/source` | focused state/route/source coverage |
| Arabic/English copy and accessible unchecked control | `PASSED automated/source` | resource parity, checkbox semantics, 48 dp target, and Impeccable detector `[]` |
| Full repository regression and source integrity | `PASSED` | typecheck, zero-warning lint, format check, Git whitespace, scoped credential/session inspection, and 119 files / 1,310 tests |
| Physical Android process-death/SQLite, Back, TalkBack, and font scale | `BLOCKED / NOT RUN` | no qualifying physical-device observation in this implementation window |
| Named Arabic/UAE, privacy, safeguarding, accessibility, and visual review | `NOT RUN` | no named reviewer was available in this implementation window |
| Production authentication, trusted-device security, recovery, and real separate-device sync | `OUT OF P0 / NOT IMPLEMENTED` | this build contains one synthetic local family and no network account/state service |

Judges do not configure an account service or MCP for this path. Describe it as reliable offline
demo continuity and the intended one-primary-role-per-installation model, not as production login
or proof that Parent and Child physical devices share live data.

## Feature 004 bounded live AI implementation record — 2026-09-07

**Current classification:** default-off implementation and synthetic/fake-boundary validation;
provider execution, deployment, real Child data/media, physical Android voice evidence, and every
named activation review remain `BLOCKED / NOT RUN`.

Run the ordinary judge journey with all three Feature 004 app flags off. It must remain the exact
prepared Feature 003 flow. If an engineering harness enables one flag independently, describe the
result as a local implementation candidate:

1. F4 shows one reviewed bilingual wording proposal beside the retained task. Accept, keep, or edit
   remains a Parent decision, followed by the unchanged review and assignment lifecycle.
2. F5 text returns one terminal, age-bounded card for the current approved task. The Child can
   decline or choose the adult exit; provider failure returns the prepared result in the same
   attempt and changes no progression state.
3. F5 voice is reachable only in an eligible synthetic ages-12–14 harness with separate text and
   voice grants. Hold to record, release within 15 seconds, verify the local-audio-deleted notice,
   review/edit, separately approve, then explicitly send text. Current Salem/Alya P0 profiles stay
   on the synthetic voice rehearsal and cannot reach real capture.

Never describe the reference Worker, local fake-model tests, in-memory byte clearing, or the
prepared fallback as a deployed/live model result or provider deletion proof. Do not enable a flag,
deploy the gateway, enter real Child data, or connect judges to MCP. The MCP endpoint is separately
default off, server only, and advertises exactly Parent drafting and Child text—no voice/media
tool.

| Gate                                                                                                  | Result                    | Evidence                                                                      |
| ----------------------------------------------------------------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------- |
| F4/F5 contracts, store, UI, fallback, reset, and zero-effects                                         | `PASSED automated/source` | synthetic fixtures and injected services only                                 |
| Child age policy, local/server safety, exact task/grant/correlation binding                           | `PASSED automated/source` | adversarial bilingual and stale-request suites; no real Child input           |
| Voice foreground state, native adapter, cache deletion ordering, reviewed text-only handoff           | `PASSED automated/source` | fake capture/media/transcription plus source/config checks; no real recording |
| Worker auth/replay/rate/budget/body/media/output/error boundaries                                     | `PASSED automated/source` | signed synthetic capabilities and fake Workers AI bindings only               |
| Default-off flags and complete prepared fallback                                                      | `PASSED automated/source` | three independent flags; current P0 profiles remain on prepared voice         |
| Provider/deployment/real network and production token broker/shared stores                            | `BLOCKED / NOT RUN`       | no external service or production credential was used                         |
| Provider ZDR/remote deletion, privacy/legal, safeguarding, Arabic/UAE, accessibility, incident review | `BLOCKED / NOT RUN`       | named evidence is still required                                              |
| Physical Android permission, held capture, interruption/process-death, TalkBack, font scale, deletion | `BLOCKED / NOT RUN`       | no qualifying device run in this implementation window                        |

## R003 AI Services 1–3 Integration Record — 2026-09-07

**Current classification:** implemented and automatically validated as a prepared-default
integration; live deployment, browser presentation, Android, and named-human evidence remain
blocked or unobserved.

Complete the normal synthetic family setup with Salem's default curated profile, then open Parent
Tasks and create a task. In Task Builder, Green Impact and Learning & Wellbeing should appear first
and carry the prepared profile recommendation label. Read the adjacent disclosure: the ordering is
local, may be wrong, and does not replace Parent review. Select another category to verify that its
templates remain future-only, then return to the canonical Green Impact recycling task and finish
the ordinary prepared Guide/review flow.

Do not claim the optional gateway ran during this journey. The default registry uses the prepared
provider and makes no request. Repository tests inject a synthetic credential and fake Worker
bindings to exercise one exact Parent-only request plus denial/fallback cases. Until an approved
Worker deployment and trusted mobile credential flow exist, describe this as an un-deployed
reference boundary, not live AI evidence.

| Gate                                                                       | Result                    | Evidence                                                                                                                |
| -------------------------------------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Focused live-boundary/profile regression                                   | `PASSED`                  | 10 files / 203 tests, including 26 new gateway/Worker/profile cases                                                     |
| Full repository verification                                               | `PASSED automated`        | typecheck, zero-warning lint, formatting, Git whitespace, and 93 files / 1,116 tests                                    |
| Production exports and public configuration                                | `PASSED automated`        | 134-file / 39-route web export, 94-asset Android JavaScript export, mock service mode, and no public gateway credential |
| HTTPS adapter, schemas, stale-safe store fallback, and exact Parent review | `PASSED automated`        | synthetic injected service; canonical live result accepted, malformed result returns same-attempt prepared fixture      |
| Worker auth/rate/origin/body/path/method/no-store boundary                 | `PASSED automated/source` | fake Workers AI and rate-limit bindings only; no external request                                                       |
| Prepared-default and Child separation                                      | `PASSED automated/source` | independent prepared fallback remains registry default; gateway exposes no Child operation                              |
| Profile recommendation order/opt-out/authority                             | `PASSED automated/source` | exact-once stable catalog plan, invalid-input rejection, bilingual label, non-P0 templates still disabled               |
| Worker deployment, real model call, and trusted mobile token broker        | `BLOCKED / NOT RUN`       | no approved deployment/account/credential-broker evidence                                                               |
| Browser and physical Android presentation                                  | `NOT RUN / BLOCKED`       | no Playwright/browser runtime or attached Android target was available in this session                                  |
| Arabic/UAE, safeguarding, privacy/security, and accessibility review       | `NOT RUN`                 | no named reviewer was available in this session                                                                         |

Expo's dependency checker reported the installed packages up to date using its local SDK map, but
also warned that the result is less reliable because networking is disabled. Treat dependency
registry freshness as `NOT RUN`; no dependency changed in this slice.

The separate Features 4/5 handoff has since become the approved Feature 004 default-off
implementation recorded above. This earlier AI Services 1–3 evidence remains valid only for its
original Parent Guide/profile scope and does not pass any Feature 004 activation gate.

## R003 Onboarding Image Perimeter Progress Record — 2026-09-07

**Current classification:** locally validated presentation candidate; physical Android motion,
TalkBack rendering, and named-human review remain unobserved.

On a fresh launch, the first onboarding photograph should show a short date-gold stroke centered
on its lower edge instead of the prior detached dark strip. Use Next through all six moments: the
stroke must grow evenly in both directions, follow the rounded image edge, and close at the top
center on the final photograph. Back must reverse the same progression. The original lower
current/total plus dots remains above the buttons and is the only progressbar announced by
assistive technology. With reduced motion active, each step must show its correct complete static
extent without a growth transition.

| Gate                                                            | Result                              | Evidence                                                                                                                                                           |
| --------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RED/focused behavior                                            | `PASSED`                            | initial source contract and two visual correction guards each recorded 1 expected failure / 12 passes; final focused file passed 13 tests                          |
| Full repository verification                                    | `PASSED`                            | typecheck, zero-warning lint, formatting, Git whitespace, and 90 files / 1,090 tests                                                                               |
| Integrated first-to-final edge progression                      | `PASSED source + Firefox web proxy` | old `heroAccent` absent; two equal bottom-center paths revealed 6% on moment 1, deterministic intermediate extents, and 100% on moment 6                           |
| Reduced motion and accessibility                                | `PASSED source + Firefox web proxy` | reduced motion applied the exact static step value; image-edge SVG was noninteractive/hidden while the lower row retained sole progressbar semantics               |
| Compact bilingual layout                                        | `PASSED Firefox web proxy`          | Arabic 390×844 and English 320×720 retained the 3:2 frame; compact frame measured 280×186.67 with document/client widths equal and zero console errors or warnings |
| Detector and production exports                                 | `PASSED`                            | Impeccable detector returned `[]`; web exported 134 files and Android JavaScript exported 103 files                                                                |
| Physical Android release motion, TalkBack, and device rendering | `BLOCKED / NOT RUN`                 | `adb devices -l` returned no attached target                                                                                                                       |
| Named Arabic/UAE, accessibility, and visual review              | `NOT RUN`                           | no named reviewer was available in this implementation session                                                                                                     |

## R003 Returning Parent Identifier Lookup Record — 2026-09-07

**Current classification:** complete local implementation candidate; physical Android and named
human review remain unobserved.

Create the one family through explicit sign-up with `parent@example.com`, then sign out or reload.
On Parent sign-in, first enter a different valid email and confirm the route stays on sign-in with
a concise account-not-found error. Enter the saved email with different case/outer whitespace,
then use operator-known code `424242`; verification must open `/parent` (or the established pending
pairing destination) without Family Basics, Child setup, Review, or Success. Sign-in, sign-up, and
verification show no fake biometric action, demo/not-real footer, code disclosure, delivery claim,
or remote-identity claim. The runbook—not the auth UI—retains the deterministic capability truth.

| Gate                                                                      | Result                                 | Evidence                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RED/focused behavior                                                      | `PASSED`                               | RED recorded 15 expected failures / 40 passes; final focused access/schema/source batch passed 6 files / 84 tests                                                                                                                                       |
| Full repository verification                                              | `PASSED`                               | typecheck, zero-warning lint, formatting, Expo dependency/public-config checks, Git whitespace, and 90 files / 1,090 tests                                                                                                                              |
| Schema-2 storage and migration                                            | `PASSED automated + Firefox web proxy` | strict normalized identifier/kind validation; schema-1 canonical migration; current-before-legacy write order; reset clears both keys; browser storage contained only `ghaf.local-family.v2` with `parent@example.com` and no verification code/session |
| Unknown identifier denial                                                 | `PASSED automated + Firefox web proxy` | missing and mismatched email returned `NOT_FOUND`, kept verification signed out, and remained at `/access/parent/sign-in`                                                                                                                               |
| Normalized returning entry                                                | `PASSED automated + Firefox web proxy` | case/whitespace-normalized email and equivalent phone formats matched; `424242` then opened `/parent` with the returning dialog and no setup route                                                                                                      |
| Neutral bilingual auth presentation                                       | `PASSED source + Firefox web proxy`    | Arabic 390×844 and English 320×720 showed concise copy, masked destination, no prototype-auth footer or biometric control, no horizontal overflow, and zero console errors                                                                              |
| Production exports                                                        | `PASSED`                               | web export produced 134 files / 39 static routes; Android JavaScript export produced 103 files                                                                                                                                                          |
| Physical Android SQLite/process death, Back/IME, TalkBack, and font scale | `BLOCKED / NOT RUN`                    | `adb devices -l` returned no attached target                                                                                                                                                                                                            |
| Named Arabic/UAE, privacy, accessibility, and product review              | `NOT RUN`                              | no named reviewer was available in this implementation session                                                                                                                                                                                          |

This lookup authenticates only against the one deterministic device-local family fixture. It is not
a production account, delivered OTP, recovery, encrypted identity store, or remote authentication
service. Those limits remain documentation and test truth without appearing as negative messaging
on the three Parent auth screens.

## R003 Compact Audio Onboarding Record — 2026-09-07

**Current classification:** locally validated presentation candidate; physical Android playback,
TalkBack, and named-human review remain unobserved.

On a fresh launch, confirm that each of the six local photographs shows its complete 3:2 wide or
close composition. Centered first-person Arabic or English copy sits below the visual. One speaker
icon overlays the image and replays the current packaged narration. The original `1/6` plus six-dot
row appears directly above Next/Back. On native, narration requests playback only after the image
and layout settle; quiet nature ambience supports the screen without covering speech. Move to
another moment and switch language to confirm the previous narration stops; ambience now continues
across the onboarding exit when the shared Sound setting and foreground policy allow it.
With a screen reader active, both automatic audio paths stay silent. Browser autoplay refusal or
any audio failure must leave every action and complete transcript available.

| Gate                                                               | Result                              | Evidence                                                                                                                                                                                                                          |
| ------------------------------------------------------------------ | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RED/focused behavior                                               | `PASSED`                            | RED recorded 2 expected failures / 11 passes for the old 1:1/segmented UI and absent prepared-audio boundary; final focused file passed 13 tests                                                                                  |
| Full repository verification                                       | `PASSED`                            | typecheck, zero-warning lint, formatting, Expo dependency/public-config checks, and 90 files / 1,086 tests                                                                                                                        |
| 3:2 wide/close imagery and compact overflow                        | `PASSED (Firefox web proxy)`        | all six existing sources remain native 1200×800; measured 350×233.33 at Arabic 390×844 and 280×186.67 at English 320×720; document/client widths matched and no scroll overflow was present                                       |
| Centered copy, speaker, and original lower dots                    | `PASSED source + Firefox web proxy` | title/body centered; Guide panel absent; speaker measured 48×48 at the image's logical top-end; simple current/total plus six-dot row measured 24px high directly above navigation                                                |
| Prepared narration and ambience                                    | `PASSED source + Firefox web proxy` | 12 exact bilingual narration clips plus one 48.04s local synthesized ambience; first speaker press requested ambience plus `narration-ar-intro`; Next requested `narration-ar-family`; AI pillar requested `narration-ar-ai`      |
| Browser autoplay guard and replay recovery                         | `PASSED`                            | pre-guard fresh Firefox reproduced 2 autoplay rejections; final fresh load made no pre-gesture play call, showed no error overlay, and produced zero console errors; the explicit speaker gesture requested both packaged players |
| Audio/privacy/background boundary                                  | `PASSED automated/source`           | static local `require()` sources, exact visible transcripts, ready-gated native autoplay, step/locale/exit pause, screen-reader suppression, no microphone/recording/runtime URL, and background playback disabled                |
| Detector and production exports                                    | `PASSED`                            | Impeccable detector `[]`; web exported 134 files / 39 static routes including 13 MP3s; Android JavaScript export produced 103 files and all 13 audio SHA-256 values matched the sources                                           |
| Physical Android autoplay, audio focus, TalkBack, and font scale   | `BLOCKED / NOT RUN`                 | `adb devices -l` returned no attached target                                                                                                                                                                                      |
| Named Arabic/UAE, safeguarding, accessibility, voice/rights review | `NOT RUN`                           | no named reviewer was available in this implementation session                                                                                                                                                                    |

The prepared voice is presentation—not proof that a live AI model ran, a recording of a person,
or a companion. This onboarding evidence predates the Feature 006 app-wide ownership change above.
Fresh browsers may block first-screen audible autoplay before any gesture; Ghaf
avoids an error overlay, starts sound from the speaker press, and requests automatic playback on
later settled slides after interaction. Physical Android autoplay/audio focus/TalkBack and named
Arabic performance/asset-rights review require the current competition device and reviewers.

## R003 Device-local Family and AI-guided Setup Record — 2026-09-06

**Current classification:** complete local demo implementation candidate; physical Android and
named-human review remain unobserved.

On a fresh reset, create either one or two Children. Family Basics is step 1, each Child receives
one separate indexed form, and Review is last. Required fields precede optional curated choices.
The sparkle profile preview is prepared, local-only, fallible, opt-out capable, and excludes gender
and free text. After creation, reload and verify that Parent authentication bypasses every
first-family screen. Pair one Child, sign out/reload, and verify that only that Child can return and
receives Child-authorized updates. Revoke, then reset, and verify both paired access and the local
family disappear.

| Gate                                                                                      | Result                       | Evidence                                                                                                                                                    |
| ----------------------------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused local family/access/AI behavior                                                   | `PASSED`                     | 8 focused files / 83 tests                                                                                                                                  |
| Strict persistence boundary                                                               | `PASSED automated/source`    | schema version, exact keys, invalid/corrupt data, save preservation, paired marker, configured-profile filtering, and reset coverage                        |
| Multi-child sequence and AI boundary                                                      | `PASSED automated/source`    | one/two indexed drafts, receipt restore, exact personalization allowlist, opt-out, and prohibited gender/free-text rejection                                |
| Bilingual compact persistence journey                                                     | `PASSED (Firefox web proxy)` | Arabic 390×844 and English 320×720; one/two-Child progress, review, reload, returning Parent/Child, configured-only chooser, and zero horizontal overflow   |
| Browser storage inspection                                                                | `PASSED (Firefox web proxy)` | superseded baseline: one namespaced schema-1 record without a Parent lookup identifier; the 2026-09-07 correction migrates it to schema 2                   |
| Browser console                                                                           | `PASSED`                     | zero application errors; only known React Native web development warnings                                                                                   |
| Final repository checks and exports                                                       | `PASSED`                     | typecheck, zero-warning lint, format check, 90 files / 1,085 tests, Expo dependency/public config, 37 product routes, web/Android exports, clean whitespace |
| Physical Android SQLite/process-death, Back/IME, TalkBack, font scale, and reduced motion | `BLOCKED / NOT RUN`          | no attached Android target                                                                                                                                  |
| Named Arabic/UAE, safeguarding/privacy, accessibility, visual, and rights review          | `NOT RUN`                    | no named reviewer was available in this implementation session                                                                                              |

The complete repeatable operator and reviewer checklist is
[`r003-local-family-release-review.md`](specs/003-family-growth-garden/design-intake/r003-local-family-release-review.md).
Do not describe the local directory as a production account database, the welcome summary as push
notifications, or the prepared helper as live AI.

## R003 SMAC Family–Sustainability–AI Onboarding Record — 2026-09-06

**Current classification:** locally validated presentation candidate; physical Android and named
human review remain unobserved.

On a fresh launch, keep the ordered native splash → 2,000 ms app-owned Ghaf splash → minimum
1,000 ms leaf loading → onboarding handoff. Traverse six moments in order: Meet Ghaf, Family,
Sustainability, bounded AI, Help, and permanent private symbolic growth. On the first four moments,
use the live Family/Sustainability/AI controls to jump between pillar stories and confirm that the
controls never choose a role, approve a task, enable AI, or exit onboarding. Read the AI boundary:
Ghaf simplifies only a Parent-approved task, may be wrong, and points the Child to an adult.

| Gate                                                                              | Result                                | Evidence                                                                                                                                                                            |
| --------------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RED/focused behavior                                                              | `PASSED`                              | first RED: 6 expected failures / 9 passes; motion RED: 1 expected failure / 11 passes; final focused batch: 3 files / 26 tests                                                      |
| Full automated suite                                                              | `PASSED`                              | typecheck, lint, format, and 87 files / 1,065 tests                                                                                                                                 |
| Startup/deferred boundary                                                         | `PASSED automated/source`             | exact nine-raster/four-font signed-out gate; 41-image deferred queue preserved after onboarding paint                                                                               |
| Asset provenance                                                                  | `PASSED`                              | 48 local JPEGs, 48 literal imports, unique checksums, exact dimensions/bytes, and 0 missing embedded prompts                                                                        |
| Production exports                                                                | `PASSED`                              | web: 121 files / 39 static routes; Android JS: 90 files; both new JPEGs found byte-identically in both exports                                                                      |
| Bilingual compact layout                                                          | `PASSED (Firefox web proxy)`          | six-step journey and pillar jumps inspected across Arabic RTL/English LTR at 320×720 and 390×844; three 60px targets; body/root width exactly matched 320px; no horizontal overflow |
| Standard/reduced motion                                                           | `PASSED (source + Firefox web proxy)` | 220 ms UI-thread image settle plus 45 ms staged copy; transform/opacity only; emulated reduced motion presented the settled state                                                   |
| Browser console                                                                   | `PASSED`                              | zero page errors during the final pillar, locale, size, and reduced-motion journeys                                                                                                 |
| Physical Android, TalkBack, font scale, and motion feel                           | `BLOCKED / NOT RUN`                   | `adb devices -l` returned no attached device or emulator                                                                                                                            |
| Named Arabic/UAE, safeguarding, botanical, accessibility, and image-rights review | `NOT RUN`                             | no named reviewer was available in this implementation session                                                                                                                      |

Describe Family, Sustainability, and AI as Ghaf's product pillars, not as new authorities. The
photographs are generated local metaphors, symbolic Garden growth is not measured environmental
impact, and this onboarding does not prove a live AI provider ran.

## R003 Returning-family Entry and Dashboard Welcome Record — 2026-09-06

**Current classification:** locally validated implementation candidate; synthetic session-local
entry and update presentation only, with physical Android modal behavior unobserved.

Use a fresh local runtime to demonstrate that the first Parent family still reaches
**لنبدأ بعائلتك** and that first Child pairing enters Today without a return dialog. After signing
out without resetting, repeat Parent verification: the established household receipt bypasses all
family-creation screens and opens Parent Home with one private welcome dialog. Repeat Salem's paired
PIN entry: it opens Salem's Today screen with the Child-specific dialog. Each dialog presents at
most two updates already authorized on that role's dashboard, can be dismissed by its action,
backdrop, or native Back request, and does not reappear during ordinary dashboard navigation.

| Gate                                                                 | Result                       | Evidence                                                                                                                      |
| -------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| RED/focused returning behavior                                       | `PASSED`                     | RED: 5 expected failures; final focused file: 5 tests; integrated access/localization batch: 4 files / 35 tests               |
| Full automated suite                                                 | `PASSED`                     | typecheck, lint, format, and 87 files / 1,063 tests                                                                           |
| Dependency/detector/whitespace                                       | `PASSED`                     | Expo dependencies current; Impeccable detector returned `[]`; `git diff --check` clean                                        |
| Production web export                                                | `PASSED`                     | 39 static routes; no route or dependency added                                                                                |
| Fresh Parent and Child boundary                                      | `PASSED (Firefox web proxy)` | fresh Parent retained Family Basics and no welcome; first Child pairing entered Today without a welcome                       |
| Returning role routing                                               | `PASSED (Firefox web proxy)` | established Parent verification opened `/parent`; paired Salem PIN opened `/child`; neither traversed family creation         |
| Bilingual compact dialog                                             | `PASSED (Firefox web proxy)` | Parent and Child inspected in Arabic and English at 320×720 and 390×844; all copy/actions contained, zero horizontal overflow |
| Browser console                                                      | `PASSED`                     | zero page errors in final returning Parent and Child flows                                                                    |
| Physical Android modal, Back, TalkBack, safe area, and OS font scale | `BLOCKED / NOT RUN`          | `adb devices -l` returned no attached device or emulator                                                                      |

Describe the dialog as a private local summary of current prototype state. Do not call it push
notifications, remote sync, durable account history, production authentication, or cross-household
data. Reset deliberately removes the household receipt and therefore restores first-family setup.

## R003 Ordered Splash-to-loading Startup Record — 2026-09-06

**Current classification:** locally validated implementation candidate; physical Android
first-frame timing and motion feel remain unobserved.

Launch now has three explicit app-visible states. The configured native raster splash yields only
after the logo/field pair settles. A fully opaque app-owned Ghaf splash then remains for 2,000 ms
without a loader or entering fade. The same overlay switches to the accessible three-leaf loading
state for at least 1,000 ms and until the bounded seven-raster/four-font readiness set settles.
Only then does onboarding become visible; deferred warming begins after two onboarding paint
frames.

| Gate                                       | Result                       | Evidence                                                                                                               |
| ------------------------------------------ | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| RED/focused ordering                       | `PASSED`                     | RED: 2 failed / 8 passed; final focused file: 10 tests                                                                 |
| Full automated suite                       | `PASSED`                     | typecheck, lint, format, and 86 files / 1,058 tests                                                                    |
| Dependency/detector                        | `PASSED`                     | Expo dependencies current; Impeccable detector returned `[]`                                                           |
| Production exports                         | `PASSED`                     | web: 119 files; Android JS: 88 files                                                                                   |
| Cached sequence                            | `PASSED (Firefox web proxy)` | first visible stage splash; splash remained topmost with no loader; loading followed for 1,013 ms; onboarding followed |
| Delayed readiness                          | `PASSED (Firefox web proxy)` | first visible stage splash; delayed onboarding raster extended loading to 3,214 ms                                     |
| Deferred boundary                          | `PASSED (Firefox web proxy)` | all 41 deferred requests observed only in the onboarding stage                                                         |
| Compact visual/console                     | `PASSED (Firefox web proxy)` | settled splash and loading inspected at 390×844; zero page errors                                                      |
| Physical Android first-frame/timing/motion | `BLOCKED / NOT RUN`          | `adb devices -l` returned no attached device or emulator                                                               |

The cached web timeline included development bundling and the pre-handoff critical pair, so total
visible splash time was longer than 2,000 ms; the app-owned post-handoff timer is exactly 2,000 ms.
Do not describe either hold as networking, authentication, AI processing, or sync.

## R003 Deferred Post-onboarding Image Warm-up Record — 2026-09-06

**Current classification:** locally validated implementation candidate; physical Android
decode/cache/memory behavior remains unobserved.

Launch readiness remains exactly seven signed-out rasters and four current brand-font files. After
the app-owned splash exits and two paint frames have been yielded, the other 41 packaged rasters
warm without visible progress in batches of six parallel requests. The first group contains the
five botanical avatars plus the access field; the task image follows at the start of batch two.
The remaining artwork follows, with the 2.3 MB prepared recycling fixture last. Section preparation
uses the same per-source promise cache and therefore does not duplicate an in-flight warm-up.

| Gate                                 | Result                              | Evidence                                                                                                         |
| ------------------------------------ | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| RED/focused behavior                 | `PASSED`                            | RED failed on the absent batch helper; final focused file: 9 tests                                               |
| Full automated suite                 | `PASSED`                            | typecheck, lint, format, and 86 files / 1,057 tests                                                              |
| Expo dependency/configuration        | `PASSED`                            | dependency check current; no dependency, font, asset, or config change                                           |
| Production exports                   | `PASSED`                            | web: 119 files; Android JS: 88 files                                                                             |
| Blocking boundary                    | `PASSED (Firefox web proxy)`        | delayed onboarding image kept the splash visible; zero deferred requests at 1,700 ms                             |
| Deferred order/concurrency           | `PASSED (Firefox web proxy/source)` | 41 unique deferred requests; first six started within 1 ms, task began in batch two, prepared fixture was last   |
| Failure and duplicate handling       | `PASSED automated/source`           | all-settled batches continue after failure; startup, section, and background work share one source-promise cache |
| Browser console                      | `PASSED`                            | zero page errors in the delayed request flow                                                                     |
| Physical Android decode/cache/memory | `BLOCKED / NOT RUN`                 | `adb devices -l` returned no attached device or emulator                                                         |

Do not describe the background warm-up as startup readiness, screen data loading, remote sync, or
proof that every image has decoded on Android. It is a local asset-cache optimization only.

## R003 Section-scoped Loading Record — 2026-09-06

**Current classification:** locally validated implementation candidate; native animation feel,
TalkBack announcements, and physical Android decode/memory behavior remain unobserved.

At launch, the native raster splash yields after the official Ghaf mark and leaf-shadow background
settle. The app-owned screen then remains visibly present for at least 1,200 ms and until only its
bounded signed-out set settles: seven rasters and the four font files used by current brand roles.
It displays the official mark/name and one three-leaf loop with no visible resource sentence,
count, or percentage. Garden, League, reveal, learning, Shared Growth, canopy, Circle, and
prepared-media imagery is not requested at startup; those consumers stay lazy and retain Expo
Image memory/disk caching. Major access/experience buffers concurrently settle their small
destination set and the existing 900 ms dwell.

The explicit readiness set fell from 48 rasters plus seven fonts (10,638,873 bytes) to seven
signed-out rasters plus four used fonts (2,196,726 bytes), a 79.4% reduction. All application assets
remain packaged for offline use; packaging is intentionally separate from runtime preloading.

| Gate                                                         | Result                              | Evidence                                                                                                                   |
| ------------------------------------------------------------ | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Focused readiness/motion tests                               | `PASSED`                            | RED: 3 failed / 5 passed; final: 2 files / 15 tests                                                                        |
| Full automated suite                                         | `PASSED`                            | typecheck, lint, format, and 86 files / 1,056 tests                                                                        |
| Expo dependency/configuration                                | `PASSED`                            | dependency check current; exactly four configured brand font files                                                         |
| Production exports                                           | `PASSED`                            | web: 119 files; Android JS: 88 files; both contain the four intended brand font assets                                     |
| Startup request boundary                                     | `PASSED (Firefox web proxy)`        | exactly seven Ghaf startup rasters and four brand fonts; no later-section or prepared-media raster                         |
| Cached/delayed timing                                        | `PASSED (Firefox web proxy)`        | cached loader visible 1,318 ms including exit; delayed onboarding raster kept it visible until settlement                  |
| Dynamic section loading                                      | `PASSED (Firefox web proxy/source)` | five botanical avatar requests began only after access handoff; destination overlay remained bounded to the access section |
| Loading motion                                               | `PASSED (Firefox web proxy/source)` | rotation matrices changed over 300 ms; reduced motion stayed at `matrix(1, 0, 0, 1, 0, 0)`                                 |
| Compact layout and console                                   | `PASSED (Firefox web proxy)`        | 320×720 and 390×844 had zero horizontal overflow; zero page errors                                                         |
| Physical Android, TalkBack, decode/memory, and OS font scale | `BLOCKED / NOT RUN`                 | `adb devices -l` returned no attached device or emulator                                                                   |

Do not describe packaged later-section files as preloaded, or either buffer as network sync, AI
processing, authentication, or measured impact. Browser timing is secondary readiness evidence,
not physical Android performance acceptance.

## R003 Startup Asset-readiness Record — 2026-09-06 (superseded by the record above)

**Current classification:** locally validated implementation candidate; native animation feel,
TalkBack announcements, and physical Android decode/memory behavior remain unobserved.

At launch, the native raster splash now yields only after the official Ghaf mark and leaf-shadow
background settle. The app-owned branded splash stays visible until all seven local font files and
48 runtime raster modules settle, and for at least 1,200 ms. Its emerald seed line is real
resource-derived progress, not a percentage or remote-work simulation. A raster failure records a
warning and continues through the existing deterministic image fallback. Standard motion gives the
Ghaf mark one subtle UI-thread growth pulse; reduced motion keeps the mark still.

| Gate                                                         | Result                              | Evidence                                                                                                                                                           |
| ------------------------------------------------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Focused readiness/motion tests                               | `PASSED`                            | 1 file / 7 tests; the RED state first failed on the absent startup loader                                                                                          |
| Full automated suite                                         | `PASSED`                            | typecheck, lint, format, and 86 files / 1,055 tests                                                                                                                |
| Expo dependency/configuration                                | `PASSED`                            | `npx expo install --check`; no dependency change                                                                                                                   |
| Production exports                                           | `PASSED`                            | web: 122 files; Android JS: 91 files; local fonts and raster modules remain bundled                                                                                |
| Delayed-raster behavior                                      | `PASSED (Firefox web proxy)`        | one local coastal raster was delayed; splash remained visible after 3.2 s with progress at `0.927273`, then dismissed after settlement with onboarding usable      |
| Loading motion                                               | `PASSED (Firefox web proxy/source)` | standard logo scale changed during the pulse; reduced motion remained exactly `scale(1)` across two samples; Arabic 320×720 and 390×844 layouts remained contained |
| Browser console                                              | `PASSED`                            | zero page errors in the final delayed-load flow; development-only warnings do not establish native quality                                                         |
| Physical Android, TalkBack, decode/memory, and OS font scale | `BLOCKED / NOT RUN`                 | `adb devices -l` returned no attached device or emulator                                                                                                           |

Do not describe the preload as network sync, AI processing, authentication, or measured impact.
The browser delay is evidence of readiness orchestration only, not Android performance evidence.

## R003 First-run Experience Record — 2026-09-06

The current SMAC pillar revision expands this presentation candidate to six moments: meet Ghaf,
Family, Sustainability, bounded AI, help, and permanent private symbolic growth. On the first four
moments, use the three live pillar controls to jump among Family, Sustainability, and AI; confirm
that no selection exits onboarding or changes a role. Read the AI disclosure aloud: it simplifies
only a Parent-approved task, may be wrong, and points the Child to an adult. The two additional
photographs are packaged local rasters; the startup gate is now nine rasters plus four fonts, while
the post-paint deferred queue remains 41. Treat the validation table below as the earlier four-step
record until Phase 40 records replacement evidence; it must not be quoted as acceptance of the
six-step revision.

**Current classification:** local implementation candidate; not Android-accepted, human-reviewed,
rights-cleared, release-activated, or demo-accepted.

On a fresh runtime, allow the native raster splash to hand off to the branded local screen, then
show the four Arabic onboarding moments: meet Ghaf, choose, ask for help, and see symbolic growth.
Demonstrate Back on moment two, continue through the final moment, and select **Start with Ghaf**
to reveal the existing Parent/Child Welcome actions. For a shorter judge run, **Skip** reaches the
same Welcome state and grants no role. Changing language should preserve the current moment. The
context buffer may appear when entering Parent or Child access and when that access produces its
authenticated-looking local experience; it must not appear between Home, Tasks, Garden, Family,
Today, or League tabs.

Describe the imagery and growth as local, generated, and symbolic. Do not describe startup or
transition as server loading, verification, model work, sync, or production authentication. A
reload may restore onboarding because completion is session-local.

The implementation preserves exactly 37 product routes because onboarding is state inside `/`.
All five presentation photographs and the official logo are local raster files. The app-owned
splash has a declared 1,200 ms minimum and major-section buffers have a declared 900 ms dwell; they
add no remote fetch, vector artwork, product authority, task/reward change, fake percentage, or
server-work claim.

| Gate                                                                              | Result                      | Evidence                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-run, artwork, route, and brand focus                                        | `PASSED`                    | 3 files / 16 tests, including four-state navigation, exact 46-asset provenance, official brand preservation, and shared access inheritance                                                                                  |
| Full automated suite                                                              | `PASSED`                    | typecheck, lint, format, and 86 files / 1,053 tests                                                                                                                                                                         |
| Expo dependency/configuration                                                     | `PASSED`                    | `npx expo install --check`; native Expo splash still uses the official local raster mark                                                                                                                                    |
| Production exports                                                                | `PASSED`                    | web: 122 files; Android JS: 91 files; byte-identical copies of all five first-run JPEGs found in each export                                                                                                                |
| Arabic/English visual proxy                                                       | `PASSED (web proxy)`        | Firefox at 320×720 and 390×844; all four moments, Back/Skip/Start, both directions, and eight reachable access states inspected with zero final-flow console errors; state-gated pairing inherited the source-audited shell |
| Loading duration                                                                  | `PASSED (web proxy/source)` | startup remained visible about 1.48 s after mount; a major-section overlay remained visible about 1.37 s including fade-out; source tokens are 1,200/900 ms                                                                 |
| Context-transition behavior                                                       | `PASSED (web proxy)`        | major Welcome → Parent access handoff captured; ordinary/same-section route suppression remains covered by source tests                                                                                                     |
| Reduced-motion behavior                                                           | `PASSED (web proxy/source)` | reduced motion retained the complete state change without positional travel; native setting remains unobserved                                                                                                              |
| Physical Android, TalkBack, Back/IME, safe areas, and OS font scale               | `BLOCKED / NOT RUN`         | `adb devices -l` returned no attached device or emulator; exports and browser inspection are not native evidence                                                                                                            |
| Named Arabic/UAE, safeguarding, accessibility, botanical, and image-rights review | `NOT RUN`                   | Requires named reviewers and the exact reviewed build/assets                                                                                                                                                                |

## R003 Natural Artwork Refresh Record — 2026-09-06

**Current classification:** local implementation candidate; not Android-accepted, human-reviewed,
rights-cleared, release-activated, or demo-accepted.

The authorized refresh replaces scenic/decorative vector-like drawings with 41 provenance-recorded
local Quiet UAE Botanical Editorial images. The official Ghaf logo/wordmark and platform assets,
small functional icons, route count, task/reward logic, privacy, reset, and all default-off flags
must remain unchanged. Browser/source evidence may verify exact asset loading, copy separation,
crop, and overflow; it cannot establish botanical/cultural accuracy, public image rights, TalkBack,
physical Android decode/memory behavior, or native visual quality.

The final local library contains 41 JPEGs and 41 literal static imports, including 25 distinct
landscape-stage images. All prompts, dimensions, byte counts, transformations, routes, and SHA-256
checksums are recorded in `assets/images/illustrations/r003/ASSET_MANIFEST.json`; the prompt scan
reported `41 rasters, 0 missing`.

| Gate                                | Result               | Evidence                                                                                                                                                                      |
| ----------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Artwork, route, and reset focus     | `PASSED`             | 15 files / 151 tests, including the 4/4 artwork contract and reset/state oracles                                                                                              |
| Full automated suite                | `PASSED`             | typecheck, lint, format, and 85 files / 1,048 tests                                                                                                                           |
| Expo dependency/config              | `PASSED`             | dependency check current; `expo-image` registered; Android predictive Back enabled                                                                                            |
| Production exports                  | `PASSED`             | web: 39 static routes, 116 files; Android JS: 2,096 modules, 85 files; both include all 41 images                                                                             |
| Default-on visual proxy             | `PASSED (web proxy)` | Arabic/English at 320/390 widths on Welcome, profile choice, task, Garden, Circle, and League; zero broken images, no horizontal overflow, and zero final-flow console errors |
| Default-off gated visual proxy      | `NOT RUN`            | Learning, Reveal, and Shared Growth implementations remain independently default-off; focused component/source checks passed                                                  |
| Physical Android artwork pass       | `BLOCKED`            | `adb devices -l` returned no attached device or emulator; the JS export is not native evidence                                                                                |
| Named-human and image-rights review | `NOT RUN`            | Botanical, Arabic/UAE cultural, safeguarding, accessibility, and rights review remain open                                                                                    |

Protected user-owned Stitch/logo source packs were not altered. Browser/source evidence verifies
local loading, copy separation, crop, and overflow only; it does not establish botanical/cultural
accuracy, public image rights, TalkBack, physical Android decode/memory behavior, or native visual
quality.

## R003 Complete-Screen Integration Record — 2026-09-06

**Current classification:** local implementation candidate; not Android-accepted, human-reviewed,
or demo-accepted.

The current integration worktree is `integration/r3-complete-screens-20260905`. The complete-screen
runtime began at local checkpoint `40fc5fc`; the current validated worktree adds the dedicated
Parent sign-up correction. No commit in this window was pushed or merged.

R003 replaces the normal shared `/role` selector with separate synthetic access journeys. `/role`
remains only as a compatibility redirect to `/`; it grants no role, session, Child selection, or
private capability. Every Parent/Child change signs out the current experience and requires the
receiving access path. The fixed identifier, codes, Child credentials, pairing, devices,
permissions, and reauthentication are visible local simulations—not production authentication or
security.

### Current route and navigation contract

- Parent tabs: **Home, Tasks, Garden, Family**.
- Child tabs: **Today, Garden, League**.
- Family Reward, settings, permissions, devices, reauthentication, Impact Path, Badges, Learning,
  Reveal, Parent Progress, Shared Growth, and Shared Garden are contextual routes, never extra tabs.
- Source inspection finds 37 product route files, excluding `_layout.tsx` and `+html.tsx`. One is
  the `/role` compatibility redirect and nine are independently default-off R002b candidates.
- The new Parent sign-up, Parent Family/Reward/settings, and Child access/settings screens without
  an approved Stitch frame are documented code-native Soft Geometric candidates. They use the
  existing Ghaf theme; their presence is not Stitch approval or release evidence.

### Current Arabic-first judge spine

```text
/
→ /access/parent/sign-in → /access/parent/sign-up → /access/parent/verification
→ first-family setup when required → /parent
→ /parent/task/new → /parent/task/review
→ /access/child → /access/child/pin → /access/child/pair when required
→ Parent access/verification → /parent/settings/devices → /access/child/pair
→ /child → /child/task → /
→ Parent access/verification → /parent → /parent/check-in
→ /garden → /circle
→ / → Child access/credential → /child → /garden → /league
```

Use saved Parent identifier `parent@example.com`, Parent verification code `424242`, Salem PIN
`2468`, Alya's Leaf → Water → Tree picture sequence, and action-scoped Parent reauthentication code
`4242`. The Parent sign-in/code UI is intentionally neutral and does not expose the operator fixture
or claim code delivery; this runbook retains the deterministic prototype truth. A previously paired
Child skips only the pairing approval branch, not profile credential entry. After recognition, the
normal default-off path keeps the R002a result; do not fabricate or force the combined RevealBundle.

### Complete-screen sweep after the core spine

1. Parent Family → private Family Reward → Family.
2. Parent settings → permissions → typed reauthentication → permissions.
3. Parent settings → paired devices; verify revoke and the required re-pair path.
4. Child settings; verify own permission state is read-only and sign-out returns to Welcome.
5. With all R002b flags off, verify that Impact Path, Badges, Learning, Reveal, Parent Progress,
   Shared Growth, and Shared Garden entries are absent or safely unavailable. Explicit local flag
   overrides inspect candidates only and do not activate a release.

### R003 evidence status at closeout

| Gate                                                                                         | Status                           | Direct evidence / next requirement                                                                                                                                                      |
| -------------------------------------------------------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 37-file route/source manifest and `/role` redirect                                           | `PASSED` source inspection       | Current validated worktree; nine optional candidate routes remain guarded and `/league` remains canonical                                                                               |
| Exact Parent/Child tab labels and contextual-route separation                                | `PASSED` source inspection       | `tests/r003-screen-flow.test.ts` and the final full suite                                                                                                                               |
| Focused access/navigation/reveal/localization suites                                         | `PASSED`                         | Parent sign-up slice: 3 files / 57 tests; prior complete-screen sweep: 15 files / 135 tests on 2026-09-06                                                                               |
| Complete repository suite and static/export gate                                             | `PASSED`                         | Typecheck, lint, format, 84 files / 1,044 tests, dependency alignment, public Expo config, `git diff --check`, and 39-route web export                                                  |
| Fresh Arabic/English complete-screen browser walk                                            | `PASSED (web proxy)`             | Existing complete-screen journey plus Parent sign-in/sign-up at 320×720 and 390×844; centered/logical alignment, sign-up origin/Back/offline flow, no overflow, and zero console errors |
| Optional Parent Progress and Shared Garden origin restoration                                | `PASSED (flagged web proxy)`     | Explicit local opt-in only: Progress restored `280 → 280` with action focus; Shared Garden restored `498 → 498` with action focus; flags remain default-off                             |
| Final design/craft review                                                                    | `PASSED` source/web; `recapture` | The code-native screens match the Ghaf system, but no authoritative native Android capture exists; disposition is recapture, not ship                                                   |
| Physical Android Arabic/English journey                                                      | `BLOCKED`                        | `/usr/bin/adb` reports no attached device; `emulator`, `sdkmanager`, and `java` are missing; `ANDROID_HOME`, `ANDROID_SDK_ROOT`, and `JAVA_HOME` are unset                              |
| TalkBack, native Back/IME, safe areas, reduced motion, permissions, and 200% OS text         | `NOT RUN`                        | Must be observed on the named physical Android build                                                                                                                                    |
| Arabic/UAE cultural, safeguarding, privacy, sustainability, accessibility, and visual review | `NOT RUN`                        | Requires named reviewers and reviewed content/build versions                                                                                                                            |
| Five rehearsals and three-person comprehension                                               | `NOT RUN`                        | Time the longer R003 access/pairing path before approving a rehearsal target                                                                                                            |
| Live Parent AI, real Child media, real auth/pairing, invitations, and payment                | `BLOCKED` or out of P0           | Demonstrate only the honestly labeled deterministic local fixtures                                                                                                                      |

The Firefox warning ledger contained generated-bundle unreachable-code and font-preload timing
warnings. It contained zero application console errors; those warnings do not constitute native
Android evidence.

The sections below preserve named R001, R002a, and R002b checkpoints. They are regression history,
not fresh R003 acceptance evidence.

## Preserved Revision 3 / R002b Evidence Boundary — 2026-09-05

> **R002A COMPATIBILITY SCOPE APPROVED — IMPLEMENTATION AUTHORIZED**
>
> **R002B PRODUCT CONTRACT APPROVED — FEATURE-FLAGGED IMPLEMENTATION AUTHORIZED — RELEASE ACTIVATION BLOCKED**

- Clean head `0501cf3` on `integration/r3-r002a-implementation-20260904` is the R002b behavioral and
  presentation baseline. It contains `a0539e9`, all completed R001/R002a surfaces, and 541 passing
  tests. The six conflicting local-only commits remain unapplied.
- R001 native foundations plus Welcome and first-time Parent onboarding are frozen. Fresh evidence
  remains in the [R001 validation record](specs/003-family-growth-garden/design-intake/r001-validation-evidence.md).
- R001 and R002a are frozen regressions and remain the fallback whenever an R002b flag is off.
- The R002a behavior oracle remains `task_recycling_p0_v1`, zero reward through Child submission,
  the existing atomic/idempotent Parent approval, Schema-3 48→60 Garden behavior, and all current
  canopy, private League, Challenge Leaf, private Family Reward, access, voice, reset, privacy, and
  profile-isolation consequences.
- Exported counters are not runtime data. The Parent Home must omit League/Family Reward counters
  until an authorized selector exists, and it must not relabel cooperative `/circle` as the private
  League.
- R002b may implement the ledger-derived 108→120→180 projection, Impact Path, locked badges,
  equal-credit learning, Parent Progress, superset RevealBundle, additive Shared Growth, Parent
  shared-garden controls, and cumulative Garden chapter behind independent default-off flags.
  Release activation stays blocked pending applicable technical, native, bilingual, accessibility,
  content, provenance, privacy, and human-review evidence.

Do not use historical R001/R002a evidence to pass an R002b visual, native, or human gate. Record
each new result as `PASSED`, `FAILED`, `BLOCKED`, or `NOT RUN` with exact evidence.

### R002b activation rule

All eight R002b flags default off. A local implementation, unit test, web capture, or JavaScript
export never activates a release flag. Learning additionally requires named source/content review;
Shared Growth contribution requires guardian-governance/privacy review; RevealBundle v2 requires
complete legacy-consequence parity. Physical Android, TalkBack, native Back/IME, and OS font scaling
remain blockers until performed on a named build and device.

### R002b default-off implementation checkpoint

The final hardened runtime/test checkpoint is `4adcb73` on
`integration/r3-r002b-implementation-20260905`, based on frozen R002a head `0501cf3`; it passes 78
files / 989 tests. The earlier core checkpoint `895af72` passed 76 files / 967 tests before the
private five-Leaf League compatibility and recovery-hardening slices. All eleven expansion surfaces have native
implementations, and the League compatibility surface restores its canonical Child root. The nine
new nested route files and gated `/league` route are guarded, and all eight feature flags remain off
by default. See the
[detailed R002b validation record](specs/003-family-growth-garden/design-intake/r002b-validation-evidence.md).

| Gate                                      | Result                             | Current evidence                                                                                                                                                                                          |
| ----------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domain and route implementation           | `PASSED` automated/source          | Ledger projection, 16-badge registry, equal-credit learning, Reveal lifecycle, Parent Progress, Shared Growth, private League, flags, access, reset, and typed origins are included in the 989-test suite |
| R001/R002a fallback                       | `PASSED` automated/source          | Flag-off tests preserve the existing onboarding, task, Child, Garden, access, voice, privacy, reset, and recognition flow                                                                                 |
| Code-native screen set                    | `PASSED` implementation            | Twelve indexed surfaces, including the restored private League root, use native components/routes; no raw Stitch web runtime is imported                                                                  |
| Local browser-proxy matrix                | `PARTIAL`                          | Eight nonblocked surfaces have Arabic/English 320/360/390/430/768 evidence plus large-text/reduced-motion samples; private League is partial, while Learning and approval Reveal remain blocked           |
| Learning live route                       | `BLOCKED` by normal fixture state  | Salem reaches 120 after the canonical approval; station 132 is required before learning can open                                                                                                          |
| Child Reveal v2 approval route            | `BLOCKED` by consequence authority | The bundle implementation is receipt-only, but the live approval projection remains on R002a until private League, Challenge Leaf, and Family Reward receipts are all authoritative                       |
| Physical Android and native accessibility | `BLOCKED / NOT RUN`                | No named build/device result exists for install, TalkBack, Back/IME, safe areas, reduced motion, offline interruption, or OS font scaling                                                                 |
| Named human review                        | `NOT RUN`                          | Learning facts/copy, Arabic/English, culture/safeguarding, privacy/consent, visual design, comprehension, and asset provenance remain open                                                                |

### R002b candidate review flow — not the released judge path

Keep every R002b flag off for the ordinary R002a judge journey. For an engineering/design review
with explicit local flag overrides, establish the correct Parent or Child session before opening a
nested route; direct reload without that session must fall back safely.

1. As Salem, open Child Today and inspect the compact nearest-station card.
2. Open `الدوري / League` and confirm the private five-Leaf projection shows only the allowlisted
   nickname, tree avatar, weekly position, normalized score, and confirmed Leaves. Do not confuse
   it with Green Circle or Shared Growth.
3. Open Garden, then Impact Path. Confirm current Mangrove progress stays separate from lifetime
   Seeds and the 120→180 Water & Coast chapter.
4. Open Badge Gallery, choose a badge, inspect its exact criteria, and return to the same Gallery
   filter/scroll/focus origin.
5. Open Shared Growth only from its approved nested entry. Confirm the view remains qualitative,
   synthetic, anonymous, and independent from contribution state.
6. As an authorized Parent, open Salem's Progress. Confirm it is read-only; **Create suitable task**
   may prefill the existing Builder but still requires normal Parent review and save.
7. Open Shared Garden settings. Confirm Continue/Pause/End affects only future anonymous signals and
   returning after End requires fresh Parent consent.
8. Do not bypass station 132 to demonstrate Learning. Do not fabricate a task-approval RevealBundle.
   Until those fixture/receipt gates are satisfied, demonstrate the unchanged R002a approval result
   and describe R002b as a default-off candidate.

The retained browser-proxy files are untracked local evidence under `output/playwright/r002b/` and
must not be presented as approved mobile references. Child Today, Garden chapter, Impact Path,
Badge Gallery, Badge Detail, Parent Progress, Shared Growth, and Parent Shared Garden settings cover
Arabic and English at 320/360/390/430/768 widths, synthetic 200%-text reflow, and representative
reduced-motion outcomes with zero document horizontal overflow. The League matrix remains partial,
and Learning/approval Reveal remain truthfully blocked. Browser evidence does not pass Android,
TalkBack, native Back/IME, system font scaling, or human-review gates.

## Preserved R002a Final Validation Evidence — 2026-09-05

> **R002A COMPATIBILITY SCOPE APPROVED — IMPLEMENTATION AUTHORIZED**
>
> **R002B PRODUCT EXPANSION — DECISIONS OPEN — IMPLEMENTATION BLOCKED**

The quoted R002b gate above is retained as the status at the time of this R002a record. It was
superseded by the approved default-off R002b contract and does not describe the current R003
implementation authority.

Validation was recorded on branch `integration/r3-r002a-implementation-20260904` with
implementation and test evidence through `a0539e9`. The automated/source, export, browser-proxy,
native, and human gates remain separate; a pass in one gate does not transfer to another.

| Gate                              | Result                         | Exact evidence                                                                                                                                                     |
| --------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Focused automated/source          | `PASSED`                       | 16 files, 141/141 tests                                                                                                                                            |
| Complete repository               | `PASSED`                       | 38 files, 541/541 tests; typecheck, lint, and format passed                                                                                                        |
| Expo and export                   | `PASSED`                       | Expo install check passed; Expo Doctor passed 21/21 checks; public configuration passed; web static export passed with 18 routes; Android JavaScript export passed |
| Product-route source inventory    | `PASSED`                       | Exactly 16 product routes                                                                                                                                          |
| Browser proxy                     | `PASSED` secondary evidence    | 24 retained captures and no app errors; warning ledger includes font preloads plus the frozen R001 `pointerEvents` web deprecation                                 |
| Browser large-text approximation  | `PASSED` secondary evidence    | Parent Home at 390 and 320 widths had no visible text overflow after `a0539e9`; this is not native OS font-scale evidence                                          |
| Raw R002 intake preservation      | `PASSED`                       | 74 immediate directories, 71 PNG files, 70 HTML files, 69 complete PNG/HTML pairs, 148 `Zone.Identifier` files, and 141/141 registered digest matches              |
| Divergent historical commits      | `PASSED` preservation boundary | All six historical commits remain unapplied                                                                                                                        |
| Physical Android                  | `BLOCKED`                      | `adb` lists no device and `ANDROID_HOME` is unset                                                                                                                  |
| Native exercises and human review | `NOT RUN`                      | No physical-device, native accessibility, native keyboard/Back, or named human-review result was inferred                                                          |
| R002b product expansion           | `BLOCKED`                      | R002a evidence does not release any R002b behavior or screen                                                                                                       |

Browser-proxy and export evidence do not prove native rendering, safe areas, keyboard/IME behavior,
system or predictive Back, TalkBack, physical touch targets, OS font scaling, reduced motion,
permissions, playback, offline behavior, or physical-device reliability. See the
[detailed R002a validation record](specs/003-family-growth-garden/design-intake/r002a-validation-evidence.md)
for commands, retained artifacts, deviations, and the complete evidence boundary.

## R001 Batch 1 Fresh Evidence — 2026-09-05

Runtime head `f4451c1` on `integration/r3-r001-implementation-20260904` passed the focused R001
suite at 79/79 tests and the complete repository suite at 29 files / 482 tests. `npm run verify`,
Expo Doctor 21/21, public Expo config, web production export, Android JavaScript export, exact
16-product-route inventory, and Git whitespace validation passed. The Android export proves bundle
construction only; it is not a physical-device result.

All seven Arabic surfaces were compared with their canonical PNGs at 390×844 and passed the scoped
composition review. Full browser-proxy journeys also passed at 320×568 Arabic, 430×932 English LTR,
and 800×1280 Arabic tablet dimensions. Natural scroll, reduced motion, deterministic offline
presentation, both Success exits, post-exit browser Back, and Success accessibility containment
passed on the web proxy with zero console errors.

Physical Android launch, system/predictive Back behavior, native keyboard/IME, TalkBack, safe-area
rendering, actual connectivity loss, and 130%/200% OS font scaling remain `NOT RUN` on this exact
checkpoint. State-specific Stitch frames, matched English reference PNGs, and named human reviews
also remain open. Exact commands, screenshots, deviations, and evidence boundaries are in the
[detailed R001 validation record](specs/003-family-growth-garden/design-intake/r001-validation-evidence.md).

## Preserved 2026-08-28 R002a Evidence Record

**Target:** Family Growth Garden deterministic P0
**Status date:** 2026-08-28
**Primary target:** physical Android device, Arabic RTL first; English LTR second
**Historical internal presentation target:** 120–150 seconds for the shorter R002a path; this is
not a published SMAC judging rule and is not yet an approved R003 timing target

### Historical evidence truth

The 2026-08-28 R002a checkpoint has a deterministic post-convergence implementation, a final
17-file / 305-test pass,
and complete Arabic RTL and English LTR ten-route Firefox journeys. The mounted reset fix passed
document locale/direction and six consecutive real Back actions. It is **not demo-accepted**: physical Android
is blocked, live AI is unavailable, and every named human-review gate remains open.
These results remain valid regression evidence but do not pass the current R003 route/access flow.
Earlier Feature 002 results prove only the reusable food-rescue baseline and are not used below.

| Feature 003 evidence item                               | Status                                  | Evidence required to change status                                                                                       |
| ------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Spec Kit specification, plan, tasks, and analysis       | PASSED artifact gate                    | Feature artifacts exist and the pre-implementation quality gate is recorded; runtime tasks remain evidence-dependent     |
| Typecheck, lint, format, unit, and integration checks   | PASSED final                            | `npm ci`, typecheck, lint, format, 17 files / 305 tests, Expo checks/export, detector, and diff check passed             |
| Ten-route deterministic journey                         | PASSED bilingual web; native BLOCKED    | Arabic RTL and English LTR completed ten routes; reset locale/direction and six consecutive real Back actions passed     |
| Secure live Parent task refinement with synthetic input | BLOCKED; validation NOT RUN             | No approved server boundary/provider exists; prepared deterministic Guide remains the honest P0 path                     |
| Arabic RTL journey                                      | PASSED on web proxy; native BLOCKED     | Firefox 390×844 walkthrough exists; named physical Android build/device does not                                         |
| English LTR journey                                     | PASSED web proxy; native BLOCKED        | Final Firefox journey covered all ten routes under `lang=en` and computed LTR                                            |
| Offline/external-service-denied fallback                | PASSED automated; native NOT RUN        | Five deterministic store cycles pass with external providers denied; no named offline Android observation                |
| Reduced-motion/static outcomes                          | PASSED automated/source; native NOT RUN | Static final-state equality passes; no named Android accessibility setting was exercised                                 |
| Physical Android acceptance                             | BLOCKED                                 | `adb`, `emulator`, `sdkmanager`, and `java` not found; `ANDROID_HOME`/`ANDROID_SDK_ROOT` unset; no device or named build |
| Three-person comprehension check                        | NOT RUN                                 | Three observers, question, answers, and date                                                                             |
| Five timed human rehearsals                             | NOT RUN                                 | Five durations and failure notes                                                                                         |
| UAE Arabic/cultural review                              | NOT RUN                                 | Named qualified reviewers and reviewed content version                                                                   |
| Faith-content review                                    | NOT RUN                                 | Named qualified UAE Islamic educator/authority and scope                                                                 |
| Child-safeguarding review                               | NOT RUN                                 | Named reviewer, findings, and disposition                                                                                |
| Sustainability task/claim review                        | NOT RUN                                 | Named reviewer, reviewed task/claim version, and disposition                                                             |
| Accessibility review                                    | NOT RUN                                 | Named reviewer, build/surface, settings, findings, and disposition                                                       |

Do not replace `BLOCKED` or `NOT RUN` with `PASSED` because a screen exists, a simulator opens, or a
Feature 002 test still passes.

## Preserved Remote Canonical Reset State

The table below preserves the R002a domain-value oracle. R003 retains every listed household,
task, counter, fixture, and assistant value but changes the access reset overlay: reset is available
only from an active Parent experience and lands on signed-out Arabic RTL `/` with no active
Parent/Child session, no paired device or pending pairing, and no transient permission proof.
`/role` redirects to Welcome and is not a reset value.

The Parent-only `resetPrototype()` action produces the following preserved domain values without a
network dependency.

| Field                        | Reset value                                                    |
| ---------------------------- | -------------------------------------------------------------- |
| Locale/direction             | Arabic / RTL                                                   |
| Route/history                | `/`; no stale Back history                                     |
| Historical presentation role | Parent in the R002a oracle; R003 access state is signed out    |
| Household                    | Synthetic Al Noor family                                       |
| Children                     | Salem, age 9; Alya, age 11; both visibly synthetic             |
| Active Child                 | Salem                                                          |
| Salem personal earned Seeds  | 48                                                             |
| Alya personal earned Seeds   | 36                                                             |
| Salem Mangrove track         | 48/60, **Shoot**                                               |
| Household Ghaf canopy        | 19/25 contribution leaves                                      |
| Circle Green Impact goal     | 11/12 eligible Green Impact actions; synthetic/local           |
| Active assignment/submission | None                                                           |
| Prepared Parent Guide result | `guide_recycling_refine_v1`                                    |
| Prepared Child Coach result  | `coach_recycling_steps_v1`                                     |
| Prepared image               | `fixture_recycling_clean_v1`; synthetic/prepared label visible |
| Prepared audio               | `fixture_salem_plan_ar_v1`; synthetic/prepared label visible   |
| Assistant mode               | Deterministic prepared; no remote dependency                   |
| Celebration consumed         | False                                                          |

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

Do not reuse the historical 120–150 second allocation for this longer R003 path. Record fresh
durations during rehearsal, including whether first-family setup and first-device pairing were
required.

| Phase | Route/state                                                    | Operator action                                                                                                                                                                            | What the judge must understand                                                                                              |
| ----: | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
|     1 | `/`                                                            | Point out Arabic-first RTL, the synthetic/prepared disclosure, and separate Parent/Child entry actions; choose Parent                                                                      | Ghaf is a transparent prototype for real family action; access is simulated but role-separated                              |
|     2 | Parent sign-in → verification                                  | Use saved fixture `parent@example.com` and operator-known code `424242`; first try an unknown email and confirm it stays on sign-in                                                        | Matching is local and deterministic; only the saved identifier reaches verification, and no setup screen opens on return    |
|     3 | First-family setup, when reset requires it                     | Complete family basics, Salem profile, review, and success; returning Parents skip this branch                                                                                             | Setup is synthetic, idempotent, and hands off into the Parent experience                                                    |
|     4 | `/parent` → `/parent/family` → Reward → Home/Tasks             | Show the combined canopy, private Family Reward promise, and exact Home/Tasks/Garden/Family tabs                                                                                           | Parent Family and Reward data are private; Reward is a promise, not money custody or a Seed exchange rate                   |
|     5 | `/parent/task/new`                                             | Choose Green Impact and `task_recycling_p0_v1`; ask the prepared Guide to make it clear/safe                                                                                               | A bounded, structured, visibly prepared assistant proposes a change to a Parent-owned task                                  |
|     6 | `/parent/task/review`                                          | Show definition, adult safety, optional evidence, 12 Seeds, Mangrove, then approve and continue                                                                                            | Parent approval precedes assignment; the handoff signs the Parent out and awards nothing                                    |
|     7 | Child profile → credential → pairing branch                    | Select Salem, enter `2468`; if unpaired, request pairing, return through Parent verification to Devices, approve, and finish on the Child side                                             | Child access and device pairing are local simulations; Parent approval is explicit and one-use                              |
|     8 | `/child` → `/child/task`                                       | Choose, separately start, open prepared Coach steps, show optional prepared media, and submit                                                                                              | The Child chooses among approved actions; Coach is task-bound; help/media/reflection are optional; submission awards zero   |
|     9 | `/` → Parent access → `/parent` → `/parent/check-in`           | Reach Home, open the pending review, edit/accept action-specific praise, confirm, visibly present praise, then use the separate recognition continuation                                   | Parent recognition—not AI judgment—commits the fixed reward exactly once                                                    |
|    10 | `/garden` → `/circle`                                          | Show Mangrove Shoot → Sapling, canopy 19 → 20, and one coarse Green action 11 → 12                                                                                                         | Symbolic Garden growth is predictable/permanent; Circle is privacy-filtered activity, not measured impact or private League |
|    11 | Sign out → Child credential → `/child` → `/garden` → `/league` | Re-enter the paired Child, show Today/Garden/League tabs and the private five-Leaf League                                                                                                  | League is private, capped, and separate from Circle, Seeds, and Family Reward                                               |
|    12 | Settings and final reset sweep                                 | Re-enter Parent for settings, permission change through reauthentication `4242`, and paired devices; sign out and re-enter Child for read-only settings; finally re-enter Parent and reset | Sensitive changes stay Parent-controlled; Child sees only own permission state; reset returns signed out to Arabic Welcome  |

Suggested spoken close: “Ghaf helps families turn safe, useful actions into routines through choice,
specific Parent recognition, visibly prepared assistant support, and a shared UAE living
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

- All 37 product route files match the R003 manifest; `/role` redirects to `/`, and every disabled
  R002b route fails safely without becoming released navigation.
- Welcome reaches distinct Parent and Child access paths; every Parent/Child handoff signs out the
  current experience and cannot continue if session termination fails.
- Parent **Create a new family** opens sign-up without requesting a code; only sign-up continuation
  reaches verification, whose closed origin restores sign-up on visible or system Back.
- Parent tabs are exactly Home/Tasks/Garden/Family; Child tabs are exactly Today/Garden/League;
  contextual routes never appear as extra tabs.
- First-device pairing reaches Parent verification and `/parent/settings/devices`, then returns to
  the still-pending Child pairing state without replay or authority leakage.
- Parent Family, private Reward, settings, permissions, devices, reauthentication, and Child
  read-only settings are reachable only with the appropriate active experience.
- Arabic and English contain equivalent decisions, safety, privacy, fixed reward, and disclosure.
- The Parent task remains unchanged until the Parent accepts the prepared refinement.
- Child submission produces acknowledgement but zero Seeds, growth, canopy, or circle change.
- Kind retry and smaller-task paths preserve all prior progress and show no failure badge.
- Confirm produces the prepared praise before one 12-Seed transaction.
- A duplicate confirm is a neutral no-op.
- The garden reaches Mangrove Sapling and the canopy reaches 20/25.
- The circle reaches 12/12 using one eligible coarse Green Impact action, not 12 Seeds.
- The private `/league` stays separate from Circle and exposes only the allowlisted weekly row.
- Reset from every meaningful Parent-authorized state returns to signed-out Arabic `/`, clears
  sessions/pairing/transient proofs, and restores the canonical domain state.

## Fallback Matrix

| Failure                                   | Required operator/app response                                          | Forbidden response                                |
| ----------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------- |
| Network denied                            | Continue on prepared providers                                          | Stop the core journey or claim live AI            |
| Optional live AI timeout/malformed output | Same-attempt prepared result; retain Parent/Child state                 | Blank screen, unsafe raw output, or second reward |
| Prepared image unavailable                | Show descriptive synthetic placeholder; continue without evidence       | Block completion                                  |
| Prepared audio unavailable                | Show the transcript and Coach steps                                     | Request microphone permission                     |
| Motion/Reanimated failure                 | Render confirmed counters and final static SVG stage                    | Leave progress between states                     |
| Reduced motion enabled                    | Skip the arc/reveal; announce text changes once                         | Hide cause and effect                             |
| Back/history anomaly                      | Use Parent-only reset and restart; record defect                        | Improvise through stale state                     |
| Parent/Child session termination fails    | Stay on the current route; show the recoverable retry state             | Navigate and expose the receiving experience      |
| Child pairing expires or mismatches       | Return to credential/pairing recovery and require fresh Parent approval | Reuse the stale request or enter Child Today      |
| Parent reauthentication code is wrong     | Change nothing and retain the scoped settings return                    | Apply a permission or broaden the return target   |
| Circle fixture unavailable                | Show local privacy explanation and household goal                       | Expose individual/sensitive records               |
| Duplicate confirm                         | Show “Already confirmed”; leave all counters unchanged                  | Award again                                       |
| Physical-device unavailable               | Mark Android evidence `BLOCKED`; use web only as a fallback preview     | Call the Android criterion passed                 |

## R003 Reset Procedure

1. Open the Parent-only demo controls.
2. Choose **Reset synthetic demo** and confirm.
3. Verify signed-out `/`, Arabic RTL, no active Parent or Child session, no paired device/pending
   pairing/transient permission proof, 48 Salem Seeds, no active assignment, Mangrove 48/60,
   canopy 19/25, circle 11/12 eligible Green Impact actions, and no consumed celebration.
4. Deny or disable network access when exercising the deterministic acceptance path.
5. Confirm `/role` redirects to `/`, and native Back cannot reveal either pre-reset experience.
6. If any value differs, stop and record a reset defect; do not manually patch counters during a
   judged run.

## Preserved R002a Validation Record

The rows and command table below preserve the 2026-08-27/28 R002a record. They are not fresh R003
evidence. For the current journey, add a separate dated row to the R003 table near the top and do
not infer a pass from web/source evidence.

| Date       | Commit/build   | Device/OS                      | Locale      | Journey         | Offline | Reduced motion | Result  | Observer/notes                                                                                                     |
| ---------- | -------------- | ------------------------------ | ----------- | --------------- | ------- | -------------- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| 2026-08-27 | none available | none; Android toolchain absent | Arabic RTL  | Could not start | NOT RUN | NOT RUN        | BLOCKED | `adb`, `emulator`, `sdkmanager`, and `java` were `NOT_FOUND`; `ANDROID_HOME` and `ANDROID_SDK_ROOT` were `NOT_SET` |
| 2026-08-27 | none available | none; Android toolchain absent | English LTR | Could not start | NOT RUN | NOT RUN        | BLOCKED | Same missing build/toolchain/device dependency; no native result inferred                                          |

Secondary web-proxy observations are recorded separately in
`specs/003-family-growth-garden/checklists/web-proxy.md`.

### Historical R002a automated checks

| Command                                                                    | Date/worktree                          | Result                 | Notes                                                                                                                                     |
| -------------------------------------------------------------------------- | -------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci`                                                                   | 2026-08-28 repository-cleanup worktree | PASSED                 | Exit 0; 861 packages installed; uuid/eslint deprecation notices and 10 moderate advisories; no audit fix run                              |
| `npm run verify`                                                           | 2026-08-28 repository-cleanup worktree | PASSED                 | Typecheck, lint, maintained-file format check, 17 files / 305 tests, Expo dependency check, and 12-route export                           |
| `CI=1 BROWSER=none npm run web -- --offline --port 8091`                   | 2026-08-28 repository-cleanup worktree | PASSED app / WARN tool | Served HTTP in offline CLI mode with Arabic/RTL root HTML and no deprecated DOM-prop warning; optional DevTools lacked host `libnspr4.so` |
| `npm ci`                                                                   | 2026-08-27 dirty Feature 003 worktree  | PASSED final           | Exit 0; uuid/eslint deprecation notices and 10 moderate advisories; no audit fix/dependency upgrade run                                   |
| `npm run typecheck`                                                        | 2026-08-27 dirty Feature 003 worktree  | PASSED final           | Exit 0                                                                                                                                    |
| `npm run lint`                                                             | 2026-08-27 dirty Feature 003 worktree  | PASSED final           | Exit 0                                                                                                                                    |
| `npm run format:check`                                                     | 2026-08-27 dirty Feature 003 worktree  | PASSED final           | Exit 0; all matched files use Prettier                                                                                                    |
| `npm test`                                                                 | 2026-08-28 professional-audit worktree | PASSED final           | 17 files / 305 tests                                                                                                                      |
| `npx expo install --check`                                                 | 2026-08-27 dirty Feature 003 worktree  | PASSED T102            | Exact output: `Dependencies are up to date`; Expo SDK 57 patch alignment documented with no new library                                   |
| `npx expo config --type public`                                            | 2026-08-27 dirty Feature 003 worktree  | PASSED final           | Mock service mode; predictive Back enabled; recording/background flags false                                                              |
| `npx expo export --platform web --output-dir output/web-feature003-final`  | 2026-08-27 dirty Feature 003 worktree  | PASSED checkpoint      | Static export contained ten product pages plus support pages; generated directory was intentionally not retained                          |
| `npx expo export --platform web --output-dir output/web-feature003-final2` | 2026-08-27 dirty Feature 003 worktree  | PASSED build           | Pre-convergence bundle; recorded walk is partial and generated directory was intentionally not retained                                   |
| `npx expo export --platform web --output-dir dist`                         | 2026-08-27 dirty Feature 003 worktree  | PASSED final           | Exit 0; 12 static routes = ten product routes plus generated sitemap/not-found; `dist` is gitignored                                      |
| `git diff --check`                                                         | 2026-08-27 dirty Feature 003 worktree  | PASSED final           | Exit 0                                                                                                                                    |

The repository-cleanup export produced 12 static routes and bundle
`entry-735bb0ad95f4d16e3497160215ba85e4.js`; `dist/index.html` began with Arabic `lang="ar"` and
`dir="rtl"`. This was a clean install/build/start checkpoint, not a new manual ten-route browser
acceptance run. The curated 2026-08-28 professional-audit journey below remains the latest manual
web-proxy evidence.

The final Impeccable detector returned JSON `[]`. Bundle
`entry-09e5b5d373078942395b4f713ab42137.js` produced 0 console errors and one generated-bundle
warning, “unreachable code after return statement” at line 673. It did not block an observed
transition and remains recorded as a framework/bundle follow-up.

### Historical R002a deterministic behavior evidence

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
| Current story-level RED history                    | NOT RUN                          | T038/T046/T052/T058/T064/T073 were not recorded before implementation and cannot be reconstructed truthfully                                                 |

### Historical R002a final web-proxy pass

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

### R002a checkpoint blockers and gaps

- Convergence and later adversarial/reset/audit fixes are **PASSED automated**: final full suite 305/305,
  independent runtime replay 23/23, and no remaining source-verifiable HIGH/MEDIUM P0 finding.
  Synthetic missing-image/circle injection remains automated proxy evidence.
- T085 physical Android attempt: **COMPLETE with BLOCKED outcome**. `adb`, `emulator`, `sdkmanager`,
  and `java` were `NOT_FOUND`; `ANDROID_HOME` and `ANDROID_SDK_ROOT` were `NOT_SET`; no named build
  or device exists.
- Optional live Parent model transformation: **BLOCKED** because there is no approved secure
  server-side boundary; the competition build uses the honestly labeled prepared fallback.
- Final `npm ci`, typecheck, lint, format, 305-test suite, Expo dependency/config/export, detector,
  and diff: **PASSED**.
- Final-bundle Arabic/English journeys, reset locale/direction, and six browser Back actions:
  **PASSED on web proxy**.
- Android offline, predictive Back, keyboard/IME, prepared playback, permissions, reduced motion,
  TalkBack, 200% font scale, physical touch targets, and native contrast: **NOT RUN** because the
  physical build could not start.
- Five timed rehearsals and three-person comprehension: **NOT RUN**.
- Named fluent Arabic/UAE culture, faith, child-safeguarding, sustainability, and accessibility
  reviews: **NOT RUN**.

### Human rehearsal

Run five uninterrupted rehearsals of the complete R003 flow from reset and record every duration,
including first-family setup, pairing branch, and any fallback; report median and maximum. The old
150-second target applied to the shorter R002a route sequence. Record and approve a new R003 target
before using timing as a pass criterion.

| Run | Operator | Duration | Setup/pairing branch | Reset exact | Error/fallback used | Result  |
| --: | -------- | -------: | -------------------- | ----------- | ------------------- | ------- |
|   1 | —        |        — | —                    | —           | —                   | NOT RUN |
|   2 | —        |        — | —                    | —           | —                   | NOT RUN |
|   3 | —        |        — | —                    | —           | —                   | NOT RUN |
|   4 | —        |        — | —                    | —           | —                   | NOT RUN |
|   5 | —        |        — | —                    | —           | —                   | NOT RUN |

Ask three people unfamiliar with the detailed design: “What did the Child do, what did the AI do,
who approved the reward, and what can other families see?” Record answers verbatim enough to show
whether they understood the action, bounded AI, Parent gate, and aggregate-only sharing.

## Demo-Acceptance Gate

Do not describe Feature 003 as demo-accepted until:

- the active Spec Kit artifacts are approved;
- all automated checks pass from a named worktree state;
- the exact R003 role-separated journey and complete-screen sweep pass on a named Android build in
  Arabic and English;
- offline, duplicate-confirm, reset, Back, reduced-motion, and prepared-media fallbacks pass;
- five timed rehearsals meet a recorded R003 target approved after measuring the longer
  access/pairing path;
- three comprehension checks identify the core loop and privacy boundary; and
- remaining cultural, faith, safeguarding, or accessibility review gaps are disclosed by name.

Real Child media, real accounts, and real family circles are outside this gate. A secure live Parent
task-refinement call with synthetic input is the competition AI target; if it is unavailable, keep
the prepared journey usable and report live AI as `BLOCKED` or `NOT RUN` rather than claiming it.
