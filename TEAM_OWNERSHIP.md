# Team Ownership

## 2026-09-07 Android USB Development Guide Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md` and `docs/DEVELOPMENT.md` only.

**Scope**: Correct the local physical-device instructions for the repository's installed Expo CLI.
Document Android Studio setup, USB/ADB verification on Windows and Linux/macOS, the first native
build/install, the daily Metro-only loop, rebuild triggers, multiple-device targeting, and bounded
troubleshooting without changing application code, dependencies, product behavior, or existing
Android evidence.

**Status**: Complete and released — `docs/DEVELOPMENT.md` now distinguishes the first Expo native
build from the Metro-only daily loop, documents Android Studio and cross-platform USB/ADB setup,
and records the WSL2 USB ownership split with official `usbipd-win` commands. The installed Expo
CLI help, ADB availability, targeted Prettier, and Git whitespace checks passed. No physical device
was attached to this WSL2 environment, so no build, installation, or Android evidence status was
claimed or changed. No application code, dependency, provider, feature flag, generated native
project, or other session's worktree files were modified by this window; the reservation is
released.

## 2026-09-07 Feature 005 Remembered Device Access Window

**Owner and only writer**: `/root`

**Planning reservation**: `TEAM_OWNERSHIP.md`, `.specify/feature.json`, the Spec Kit-managed block
in `AGENTS.md` through the configured agent-context hook, and
`specs/005-remembered-device-access/**`.

**Runtime reservation**: `src/models/deviceAccess.ts`,
`src/features/access/{childAccess.ts,parentOnboarding/controller.ts,rememberedDeviceAccess.ts}`,
`src/services/{index.ts,local/index.ts,local/deviceAccessRepository.ts}`,
`src/state/usePrototypeStore.ts`, `src/components/access/{index.ts,RememberDeviceChoice.tsx}`,
`app/access/parent/{sign-in.tsx,verification.tsx}`, `app/child/{index.ts,settings.tsx,task.tsx}`,
`app/{garden.tsx,circle.tsx}`,
`src/i18n/resources.ts`,
`tests/{device-remembered-access.test.tsx,r003-screen-flow.test.ts,`
`r002a-garden-presentation.test.ts}`, and the narrowly scoped truthful-boundary updates in
`PRODUCT.md`, `PROTOTYPE_LIMITATIONS.md`, and `DEMO_RUNBOOK.md`.

**Scope**: Add an explicit Parent remember-this-device choice and automatic device-local Child
return after approved pairing. One app installation remembers at most one primary role/profile.
An active Parent must explicitly sign out before Child access on the same installation. A Child
may start temporary Parent access without unpairing; Parent sign-out then restores the same paired
Child. Persist only a validated local device-affinity marker, never a verification code, password,
session token, task, reward, media, or private assistant content. Preserve deterministic offline
reset and label the behavior as synthetic prototype continuity, not production authentication,
secure device trust, account sync, or multi-device account infrastructure.

**Status**: Complete and ready for source integration — commits `3274cab`, `4a2bdbb`, `fa8e6ca`,
and `55ab2a1` contain the specification, strict affinity storage, fresh authority restoration, and
bilingual handoff presentation; the closing evidence/test adjustment is recorded with this
window. Focused access coverage passed 65 tests, the Impeccable UI detector returned `[]`, and the
final typecheck, zero-warning lint, format check, Git whitespace, scoped credential/session
inspection, and full 119-file / 1,310-test regression passed. Physical Android process-death,
SQLite, Back, TalkBack, font-scale, and named Arabic/UAE, privacy, safeguarding, accessibility,
and visual reviews remain `BLOCKED / NOT RUN`. Production accounts, trusted-device security, and
real separate-device state sync remain out of P0. The prior AI Services presentation worktree
edits remain protected and are not part of this completed window.

## 2026-09-07 AI Services 1–3 Presentation Integration Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `specs/004-bounded-live-ai/tasks.md`,
`src/components/AssistantIdentity.tsx`, `src/components/access/AIProfilePreview.tsx`,
`src/components/family-growth/{ParentTaskComposer.tsx,ParentPatternSummary.tsx}`,
`app/child/task.tsx`, `src/i18n/resources.ts`, and
`tests/ai-services-presentation-integration.test.tsx` only.

**Scope**: Integrate the already implemented AI Services 1–3 into one coherent Parent/Child
presentation hierarchy. Clarify prepared/live origin before each action, separate prepared profile
support style from recommended starting categories, preserve Parent ownership in Task Builder,
make the task-bound Child Coach easier to scan, and structure the Parent summary around observable
facts and one next question. Preserve all Feature 004 flags, grants, provider boundaries, state,
service contracts, progression authority, and default-off behavior unchanged.

**Status**: Paused at the user's newer access request — existing UI-only edits remain protected
and uncommitted. They are not owned, completed, or released by Feature 005.

## 2026-09-07 Feature 004 Minimal MCP Adapter Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `package.json`, `package-lock.json`,
`specs/004-bounded-live-ai/{spec.md,plan.md,research.md,data-model.md,quickstart.md,tasks.md,contracts/bounded-ai-v1.md}`,
`workers/ghaf-ai-gateway/{README.md,src/index.ts,src/mcp.ts,src/operations.ts}`, and
`tests/bounded-ai-mcp.test.ts`.

**Scope**: Add one server-only, default-off MCP projection over the existing bounded Parent task
drafting and Child Coach text operations. The Expo app continues to use provider-neutral HTTPS
services; judges do not connect to MCP. The adapter exposes exactly `draft_parent_task` and
`coach_current_task`, reuses the same strict schemas, handlers, safety checks, authorization,
budgets, and prepared/fake evidence, and adds no voice/media tool, resource, prompt, sampling,
account, persistence, business authority, public discovery, or deployment.

**Activation boundary**: Implementation and synthetic local tests only. MCP is disabled unless a
server-only switch is exactly `true`; no provider call, real Child data, public endpoint, judge
setup, release activation, or production-readiness claim is authorized.

**Status**: Complete and released — commits `1704480`, `44cd73c`, `0b9535c`, `644009c`, and
`e4fb1f3` contain the approved specification, pinned Worker-only SDK, exact two-tool adapter,
shared bounded text operations, final Child text/voice gateway reconciliation, and cross-feature
isolation evidence. The dedicated MCP suite passed 10 tests; the combined gateway suite passed 61
tests; typecheck, lint, formatting, Expo dependency compatibility, Git whitespace, secret-pattern,
export-isolation, and the full 117-file / 1,280-test regression passed. MCP remains exactly default
off, the native app contains no MCP client/setup, judges do not connect, and no provider,
deployment, real Child data/media, activation gate, unrelated file, or user-owned artifact was
changed by this window.

## 2026-09-07 Feature 004 Planning and Implementation Window

**Owner and only writer**: `/root`

**Planning reservation**: `TEAM_OWNERSHIP.md`, `.specify/feature.json`, the Spec Kit-managed block
in `AGENTS.md` through the configured agent-context hook only, and
`specs/004-bounded-live-ai/{plan.md,research.md,data-model.md,quickstart.md,tasks.md,contracts/**}`.

**Runtime reservation**: `package.json`, `package-lock.json`, `.env.example`, `app.config.ts`,
`src/config/aiFeatureFlags.ts`, `src/models/boundedAi.ts`,
`src/features/assistants/{parentTaskDrafting.ts,liveChildCoach.ts,liveVoiceCapture.ts}`,
`src/services/interfaces/index.ts`, `src/services/index.ts`,
`src/services/mock/{index.ts,boundedAi.ts,boundedAiFixtures.ts}`,
`src/services/remote/{index.ts,GatewayParentTaskDraftingService.ts,GatewayChildCoachService.ts,GatewayVoiceTranscriptionService.ts}`,
`src/services/native/{index.ts,ExpoVoiceCaptureService.ts}`, `src/features/access/index.ts`,
`src/state/usePrototypeStore.ts`, `src/components/family-growth/{ParentTaskComposer.tsx,LiveChildCoachPanel.tsx,LiveVoiceCapturePanel.tsx}`,
`app/child/task.tsx`, `app/parent/settings/permissions.tsx`, `src/i18n/resources.ts`, new
`workers/ghaf-ai-gateway/**`, the Feature 004-focused tests named in
`specs/004-bounded-live-ai/tasks.md`, and final truthful evidence edits in `PRODUCT.md`,
`PROTOTYPE_LIMITATIONS.md`, and `DEMO_RUNBOOK.md`.

**Scope**: Plan and implement the approved F4 Parent task drafting, F5 bounded live Child Coach
text, and F5 ages-12–14 push-to-talk voice as three independent default-off slices. Use strict
contracts, TDD, prepared same-attempt fallback, zero AI reward/progression authority, synthetic
inputs/media, and server-side provider boundaries. Preserve the complete Feature 003 journey.

**Activation boundary**: No provider deployment/call, real Child data, live flag activation,
production-security claim, or release approval is included. F5 text/voice activation remains
blocked on the named authentication, provider/ZDR, privacy/legal, safeguarding, Arabic/UAE,
accessibility, incident, physical Android, deletion, and human-evidence gates.

**Status**: Complete and released — commits `9a35ea7`, `38994eb`, `331fbb2`, `92f59b5`,
`cc3d0ea`, `644009c`, `e4fb1f3`, and `c4716c3`, plus the final evidence checkpoint, implement the
approved F4 Parent drafting, F5 bounded Child Coach text, separate implementation-only grants, and
ages-12–14 foreground push-to-talk transcript review. The Feature 004 focused suite passed 24
files / 164 tests; the full repository passed 117 files / 1,280 tests with typecheck, zero-warning
lint, formatting, Expo dependency/public-config checks, web and Android JavaScript exports, Git
whitespace, public-bundle isolation, and scoped secret checks. All app flags remain false, current
P0 profiles retain prepared voice, and the deterministic journey/reset remain complete. No
provider call, Worker/MCP deployment, real Child data/audio, production credential, release
activation, push, merge, unrelated file, or user-owned artifact was included. Trusted auth/shared
stores, provider/ZDR, privacy/legal, safeguarding, Arabic/UAE, accessibility, incident/deletion,
physical Android, and named human-rehearsal gates remain `BLOCKED / NOT RUN`.

## 2026-09-07 AI Features 4–5 All-Three Approval Recording Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md` and
`specs/004-bounded-live-ai/{spec.md,approval-packet.md,checklists/requirements.md}` only.

**Scope**: Record the product owner's explicit "all three" implementation authorization for F4
Parent task drafting, F5 bounded live Child Coach text, and F5 real push-to-talk voice. Approval
authorizes independently flagged, default-off implementation and synthetic/fake-provider testing;
it does not activate a provider, permit real Child data in tests, deploy a gateway, or approve
release. Amend the voice contract with exact age, capture, transcript review, delete-before-send,
data, consent, fallback, native-evidence, and no-background/no-biometric boundaries. Preserve
Feature 003 as the active deterministic fallback and do not modify runtime files in this window.

**Handoff condition**: The proposal and checklist unambiguously distinguish implementation
approval from activation gates, contain no obsolete "voice unapproved" wording, and pass targeted
formatting and whitespace checks. Planning/runtime ownership must be reserved separately.

**Completion — 2026-09-07**: `/root` recorded the product owner's explicit **all three** decision
as default-off implementation authorization for F4, F5-TEXT, and F5-VOICE. The amended contract
limits voice to separately granted ages 12–14, one visible held recording, transcript review,
delete-before-send, explicit text-only Coach submission, ephemeral audio deletion, and no
background/continuous capture or biometric/speaker/emotion/personality/truthfulness inference.
Release activation, deployment, real provider execution, and real Child data remain blocked on
the recorded token-broker, provider/ZDR, privacy/legal, safeguarding, Arabic/UAE, accessibility,
incident, physical Android, deletion, and human-rehearsal gates. Targeted formatting, whitespace,
approval-consistency, six-threat, and no-placeholder checks passed. No runtime file, active Feature
003 artifact, feature metadata, provider, deployment, branch/ref, or user-owned artifact changed;
the reservation is released and planning/runtime ownership must be reserved separately.

## 2026-09-07 AI Features 4–5 Phase 1 Proposal Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md` and new
`specs/004-bounded-live-ai/**` proposal artifacts only.

**Scope**: Perform read-only archaeology of the historical Feature 002 AI gateway and the current
Feature 003 task, assistant, access, privacy, registry, state, localization, and test boundaries;
then author a proposed, non-authorizing specification and approval packet for independently gated
Parent task drafting, live Child Coach text, and later Child voice. No runtime implementation,
feature activation, provider request, deployment, active Feature 003 artifact change, or Feature
002 historical change is authorized in this window.

**Handoff condition**: The proposal records product exclusions, age-band and data allowlists,
consent/privacy controls, architecture and state sequences, threat model, evidence gates, test
matrix, dependency-ordered implementation stages, and exact approval decisions. Runtime work stays
blocked until explicit product approval; Child release activation additionally stays blocked on
trusted authentication, legal/privacy/safeguarding review, provider retention evidence, and native
device evidence.

**Status**: Complete and released. The Phase 1 proposal package passed targeted formatting and
whitespace checks. No runtime file, active Feature 003 artifact, feature metadata, provider,
branch/ref, deployment, or user-owned artifact was changed; implementation and activation remain
blocked on the explicit approval checkpoint.

## 2026-09-07 AI Services 1–3 Integration Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `PROTOTYPE_LIMITATIONS.md`,
`DEMO_RUNBOOK.md`, `.env.example`, `specs/003-family-growth-garden/{spec.md,plan.md,tasks.md}`,
new `docs/CODEX_HANDOFF_AI_FEATURES_4_5.md`,
`src/features/assistants/{liveParentGuide.ts,profilePersonalization.ts}`,
`src/features/tasks/validation.ts`, `src/models/familyGrowth.ts`,
`src/services/{index.ts,interfaces/index.ts,mock/index.ts,remote/**}`,
`src/state/usePrototypeStore.ts`, `src/components/family-growth/ParentTaskComposer.tsx`,
`src/i18n/resources.ts`, new `workers/ghaf-parent-guide/**`, and focused AI/profile/Parent-task
tests only.

**Scope**: Consolidate the currently implemented deterministic Parent Guide, Child Coach, Parent
summary, age adaptation, synthetic voice, prepared media, and profile helper as the mandatory
offline path; add one authenticated and rate-limited server-side live Parent Guide transformation
for the exact synthetic P0 recycling request behind an injectable default-off service boundary;
and use the prepared profile helper to rank and visibly identify allowlisted Task Builder
categories without assigning a task or changing the sole executable P0 task. Provider activation,
deployment, live evidence, production authentication, and every live Child Coach or real media path
remain blocked. The parallel Features 4/5 handoff owns no runtime file in this window.

**Handoff condition**: Contract changes land before behavior; focused RED/GREEN evidence covers
strict schemas, secret isolation, authentication, rate limiting, timeout/error/safety fallback,
prepared-default behavior, recommendation ordering, opt-out, and Parent authority; full repository
checks pass; direct live-provider, deployment, Android, and named-human evidence remains honestly
`NOT RUN` or `BLOCKED`.

**Status**: Complete and released. AI Services 1–3 passed the recorded automated/source/export
checks without activation. The Features 4/5 document is a non-authorizing prompt for a separate
spec-first session; it owns no runtime boundary after this handoff.

**Work period:** Feature 003 planning and implementation beginning 2026-08-26
**Team size:** Three members
**Integration owner:** Member 1 — Mobile and visual experience

Replace `Member 1`, `Member 2`, and `Member 3` with names only when the team chooses to do so.

## 2026-09-07 Welcome Hero Regeneration Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`,
`assets/images/illustrations/r003/{ASSET_MANIFEST.json,PROVENANCE.md}`, and
`assets/images/illustrations/r003/final/welcome-ghaf-habitat.jpg` only.

**Scope**: Regenerate only the existing 3:2 Welcome hero as an eye-catching wide-angle Quiet UAE
Botanical Editorial scene that better communicates family support, small daily actions, permanent
growth, and UAE nature. Preserve the existing artwork ID, route, crop behavior, official brand,
access controls, product state, and all protected user work. The image remains opaque, local,
nondirectional, decorative, and free of people, text, logos, UI, unsafe objects, and measured-impact
claims. No route, dependency, remote runtime asset, product behavior, push, merge, deployment, or
release activation is authorized.

**Completion — 2026-09-07**: `/root` regenerated the existing Welcome hero through the built-in
OpenAI image generator, retained its 3:2 source and 1200×800 shipping dimensions, embedded the exact
prompt, and updated its local manifest/provenance without changing the runtime artwork ID or screen.
The full-frame source and the current wide mobile center crop were inspected; both retain the mature
Ghaf, three younger growth stages, seed-pod/leaf trail, and distant UAE landscape without people,
text, UI, brand marks, unsafe objects, or impact claims. The focused artwork contract passed 4/4,
all 48 shipping rasters retained embedded prompts, formatting and Git whitespace passed, and the
Impeccable detector returned no findings. Physical Android rendering and named botanical,
Arabic/UAE, safeguarding, accessibility, and image-rights reviews remain `NOT RUN`. The reservation
is released at this local checkpoint; no push, merge, deployment, or release activation occurred.

## 2026-09-07 Onboarding Image Perimeter Progress Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`DESIGN_DIRECTION.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md}`, the existing
`specs/003-family-growth-garden/design-intake/r003-first-run-experience.md`,
`src/components/onboarding/FirstRunOnboarding.tsx`, and
`tests/r003-first-run-experience.test.ts` only.

**Scope**: Remove the detached solid strip from the bottom of every onboarding photograph and
replace it with a quiet, image-integrated rounded perimeter progress stroke. The stroke begins as
a short mark at the bottom center, grows symmetrically in both directions only when explicit
Back/Next/pillar navigation changes the moment, and closes around the full 3:2 image on the sixth
moment. Retain the simple lower current/total plus dot row requested in the preceding correction as
the primary semantic indicator. Reduced motion shows each step's correct static perimeter state.
Preserve the existing photographs, crop, speaker, narration, ambience, reducer, routes, startup,
access, privacy, reward, reset, and default-off feature behavior. No image, dependency, timer,
autoplay navigation, gesture, product authority, push, merge, deployment, or release activation is
authorized.

**Completion — 2026-09-07**: `/root` removed `heroAccent` and integrated one inset SVG edge track
with two date-gold progress branches that originate together at the image's bottom center. The
first moment shows a short centered stroke, explicit navigation reveals the rounded bottom corners,
sides, and top edges in order, Back reverses the same value, and the sixth moment closes the frame.
The existing lower current/total plus dots retain the sole progressbar semantics; the edge stroke
is noninteractive and hidden from assistive technology. Reanimated changes only the normalized
dash length over the existing 220 ms UI-thread timing, while reduced motion applies the target
directly. RED recorded one expected failure / 12 passes for the source contract and for each of two
visual-correction guards; the final focused file passed 13 tests and the full suite passed 90 files
/ 1,090 tests. Typecheck, zero-warning lint, formatting, Expo dependency/public-config checks,
Git whitespace, Impeccable detection, web export (134 files), and Android JavaScript export (103
files) passed. Firefox covered Arabic 390×844, English 320×720, first/intermediate/final extents,
reduced motion, exact 3:2 layout, zero horizontal overflow, and zero console errors or warnings.
Physical Android motion/TalkBack rendering and named-human review remain `BLOCKED / NOT RUN`. The
reservation is released at this local checkpoint; no push, merge, deployment, or release
activation was performed.

## 2026-09-07 Returning Parent Identifier Lookup Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md,quickstart.md,data-model.md}`,
`specs/003-family-growth-garden/design-intake/r003-local-family-release-review.md`,
`docs/architecture/{ARCHITECTURE.md,adr/0002-device-local-family-directory.md}`,
`app/access/parent/{sign-in,sign-up,verification}.tsx`,
`src/models/{localFamily,parentOnboarding}.ts`,
`src/features/access/parentOnboarding/{controller,policy}.ts`,
`src/features/local-family/schema.ts`, `src/services/local/{index,repository}.ts`,
`src/services/index.ts`, `src/state/usePrototypeStore.ts`, `src/i18n/resources.ts`, and focused
Parent access/local-family/localization/route tests only.

**Scope**: Persist the normalized synthetic Parent phone/email identifier with the single
device-local family directory, migrate the previous schema-1 fixture to the canonical prepared
Parent identifier, and require an exact normalized local-record match before returning sign-in may
request the existing deterministic code. An unknown identifier stays on sign-in and cannot enter
first-family setup; only explicit sign-up may create a family. A verified matching returning Parent
must enter Parent Home (or the established pending-pairing destination) without Family Basics,
Child setup, review, or success. Remove the simulated biometric shortcut and user-facing
demo/synthetic/not-real wording from Parent sign-in, sign-up, and verification while making no
claim that a message was sent or identity was remotely proven. Documentation and test evidence
retain the truthful local-prototype boundary. Preserve the one-household limit, reset, role
separation, offline deterministic code, routes, default-off flags, and protected user work. No
production authentication, account service, network, real OTP, credential persistence, dependency,
push, merge, deployment, or release activation is authorized.

**Completion — 2026-09-07**: `/root` added a strict schema-2 normalized Parent identifier/kind,
bounded schema-1 canonical migration, separate explicit-sign-up and returning-sign-in commands,
and fail-closed `NOT_FOUND` matching before deterministic code entry. Matching returning Parents
reuse the receipt and enter Parent Home or the pending-pairing destination; verification without
the create-family marker cannot fall into setup. The fake biometric path and Parent auth
demo/not-real footers were removed, and bilingual copy makes no send/remote-verification claim.
RED recorded 15 expected failures / 40 passes; focused tests passed 6 files / 84 tests and the full
suite passed 90 files / 1,090 tests. Typecheck, zero-warning lint, formatting, Expo dependency and
public-config checks, Git whitespace, web export (134 files / 39 routes), and Android JavaScript
export (103 files) passed. Firefox covered Arabic 390×844 and English 320×720 creation, storage
inspection, mismatch denial, normalized match, and direct `/parent` entry with no overflow or
console errors. Physical Android and named-human review remain `BLOCKED / NOT RUN`. The reservation
is released at this local checkpoint; no push, merge, deployment, or release activation was
performed.

## 2026-09-07 Compact Audio Onboarding Correction Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`DESIGN_DIRECTION.md`, `PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md}`, the existing
`specs/003-family-growth-garden/design-intake/r003-first-run-experience.md`, `package.json`,
`package-lock.json`, `src/components/access/GhafIcon.tsx`,
`src/components/onboarding/{FirstRunOnboarding.tsx,useOnboardingNarrator.ts}`, new
`src/components/onboarding/{onboardingAudioSources.ts,useOnboardingAmbience.ts}`,
`src/components/illustrations/LocalIllustration.tsx`,
`src/i18n/resources.ts`, new prepared local files and provenance under
`assets/audio/onboarding/`, and `tests/r003-first-run-experience.test.ts` only.

**Scope**: Supersede only the square/segmented/Guide-panel portion of the immediately preceding
onboarding presentation. Reveal the existing 1200×800 photographs in responsive 3:2 frames so
their curated wide and close compositions remain intact; center the live title/body; restore the
original current/total plus dot indicator directly above the navigation actions; and replace the
Guide panel with one high-contrast 48dp speaker icon that replays the current narration. Start the
prepared synthetic narration after the slide image and layout settle, stop it on slide/locale/exit,
and add quiet looping foreground-only nature ambience that stops on exit and yields to assistive
speech. The six visible scripts remain the transcript and navigation remains explicit. Preserve
the six-state reducer, pillar navigation, routes, startup/deferred-image behavior, access/session,
task/reward/privacy/reset authorities, default-off flags, official logo, and protected user work.
No microphone, recording, background OS playback, background listening, runtime URL, live model,
provider secret, new image, push, merge, deployment, or release activation is authorized.

**Completion — 2026-09-07**: `/root` restored the original current/total plus dot row, revealed all
six approved 1200×800 photographs in 3:2 wide/close compositions, centered the concise copy, and
replaced the Guide panel with one 48dp speaker control. Twelve prepared synthetic bilingual clips
and one locally synthesized nature ambience now use the existing foreground-only `expo-audio`
boundary; native playback waits for image/layout settlement, screen readers suppress both paths,
the speaker recovers first-screen web sound, and all players stop on transition/exit. The obsolete
`expo-speech` dependency was removed. RED recorded 2 expected failures / 11 passes; the focused file
passed 13 tests and the full suite passed 90 files / 1,086 tests. Typecheck, zero-warning lint,
formatting, Expo dependency/public-config, Git whitespace, web/Android exports, 13-asset checksum
matching, and the final Impeccable detector passed. Firefox covered Arabic 390×844 and English
320×720 with exact 3:2 measurements, centered copy, a 48dp speaker, simple lower dots, no overflow,
local audio requests, and zero final console errors. Physical Android audio/TalkBack/font scale and
named Arabic/voice/rights review remain `BLOCKED / NOT RUN`. The reservation is released at this
local checkpoint; no push, merge, deployment, or release activation was performed.

## 2026-09-07 AI-narrated Square Onboarding Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`DESIGN_DIRECTION.md`, `PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md}`, the existing
`specs/003-family-growth-garden/design-intake/r003-first-run-experience.md`, `package.json`,
`package-lock.json`, `src/components/onboarding/FirstRunOnboarding.tsx`, new
`src/components/onboarding/useOnboardingNarrator.ts`, `src/i18n/resources.ts`, and
`tests/r003-first-run-experience.test.ts` only.

**Scope**: Refine the existing six-moment first-run presentation with 1:1 local artwork, a
high-contrast lower segmented story indicator directly above the navigation actions, shorter
energetic first-person Ghaf Guide copy, and optional automatic device text-to-speech narration.
Narration must stop between moments and on exit, expose
an on-screen replay/stop control, remain silent when a screen reader is active, retain complete
visible text, and fail without blocking onboarding. The voice is device-synthesized presentation,
not a live model call, recording, companion, or proof that AI ran. Preserve the six-state order,
three-pillar navigation, ordered startup/deferred image boundaries, route count, access/session,
task/reward/privacy/reset authorities, default-off flags, official logo, and protected user work.
One Expo-compatible `expo-speech` dependency is authorized as the measured minimum because
`expo-audio` can play prepared files but cannot synthesize the bilingual slide copy and no reviewed
onboarding audio binaries exist. No microphone, recording, background listening/playback, runtime
URL, new image, provider call, push, merge, deployment, or release activation is authorized.

**Completion — 2026-09-07**: `/root` shipped the six square local crops, concise bilingual
first-person Ghaf Guide scripts, a high-contrast lower story rail directly above navigation, and
bounded `expo-speech` device narration with native screen-reader suppression, web opt-in, replay,
cleanup, and nonblocking fallback. The focused file passed 13 tests and the full suite passed 90
files / 1,086 tests. Typecheck, zero-warning lint, formatting, Expo dependency/public-config,
39-route web export, 90-file Android JavaScript export, Git whitespace, and the final Impeccable
detector passed. Firefox inspected Arabic 390×844 and English 320×720, measured a square
275.8×275.8 px crop, found no horizontal overflow, confirmed `1/6 → 2/6`, and exercised the web
voice-unavailable fallback with zero page errors. Physical Android TTS/audio focus, TalkBack, OS
font scale, motion feel, and named-human review remain `BLOCKED / NOT RUN` because no Android
target or reviewer was available. The reservation is released at this local checkpoint; no push,
merge, deployment, or release activation was performed.

## 2026-09-06 Device-local Family and AI-guided Setup Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`, `docs/architecture/**`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md,data-model.md,quickstart.md}`, new
`specs/003-family-growth-garden/checklists/local-family-onboarding.md`, current R002b readiness
checklists and design-intake review records, `package.json`, `package-lock.json`, `app.config.ts`,
`app/_layout.tsx`,
`app/access/{parent,child}/**`, `app/{parent,child}/index.tsx`, `app/parent/family/index.tsx`, new
`src/components/access/{ChildProfileForm,AIProfilePreview}.tsx`, existing bounded assistant trigger
components, `src/features/access/**`, new `src/features/local-family/**`, new
`src/features/assistants/profilePersonalization.ts`, `src/models/{access,parentOnboarding}.ts`, new
`src/models/localFamily.ts`, `src/services/{index.ts,interfaces/**,local/**}`,
`src/state/usePrototypeStore.ts`, `src/i18n/resources.ts`, and focused tests for local family,
onboarding, access, assistant policy, routes, reset, localization, and architecture only.

**Scope**: Add one validated, versioned device-local family directory backed by Expo SQLite on
native, guarded localStorage on web, and memory in tests. Persist only one synthetic Parent, one or
two configured Child profiles, minimum curated preferences, and approved synthetic paired-device
markers. Redesign setup as Family Basics plus one indexed Child form per selected count and one
review. Add deterministic prepared AI profile suggestions using age/interests/hobbies/support
preferences only; exclude gender and sensitive/free-text inputs and retain Parent approval. Restore
returning-role routing before first-family decisions, filter unconfigured slots, and clear local
data on Parent reset. Preserve every task, reward, Seed, Garden, League, privacy, route, offline,
and default-off R002b authority. No production account/security/compliance claim, cloud, sync,
notification service, analytics, real Child media/data, remote model, provider secret, push, merge,
deployment, or release activation is authorized.

**Completion — 2026-09-06**: Root implemented the strict schema-1 repository with SQLite native,
localStorage web, and memory test adapters; one/two-Child indexed setup and whole-family review;
configured-role projection; paired-marker restoration/revocation/reset; and deterministic
allowlisted sparkle-marked profile personalization. The focused batch passed 8 files / 83 tests and
the full suite passed 90 files / 1,085 tests. Typecheck, zero-warning lint, formatting, Expo
dependency/public-config checks, route inventory, Git whitespace, the one final detector pass, and
web/Android JavaScript exports passed. Firefox covered Arabic/English at 320×720 and 390×844,
storage inspection, reset, and returning-role paths with no horizontal overflow or console errors.
Physical Android and named-human gates remain `BLOCKED / NOT RUN`. The reservation is released at
this local checkpoint; no push, merge, deployment, or release activation was performed.

## 2026-09-06 SMAC Pillar Onboarding Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md}`, the existing
`specs/003-family-growth-garden/design-intake/r003-first-run-experience.md`,
`assets/images/illustrations/r003/{ASSET_MANIFEST.json,PROVENANCE.md,final/onboarding-*.jpg}`,
`src/components/onboarding/{FirstRunOnboarding.tsx,experienceModel.ts}`,
`src/components/illustrations/illustrationSources.ts`, `src/i18n/resources.ts`,
`src/features/startup/preloadStartupImages.ts`, and
`tests/{r003-first-run-experience,r003-illustration-assets,r001-onboarding-flow}.test.ts` only.

**Scope**: Expand the optional first-run story from four to six child-clear moments so Family,
Sustainability, and bounded task-focused AI are distinct, prominent pillars after the Ghaf
introduction and before the existing help and permanent symbolic-growth close. Add two generated
local raster photographs and an accessible three-pillar navigator, then use one purposeful
UI-thread step transition with a reduced-motion equivalent. Startup may add only those two
onboarding photographs to its bounded signed-out readiness set; the remaining packaged imagery
continues warming asynchronously after onboarding paints. Preserve the ordered native splash →
2,000 ms app-owned splash → minimum 1,000 ms loading → onboarding sequence, exact routes,
session/access/task/reward/privacy authorities, deterministic fallback, default-off flags, official
logo, existing assets, and protected user work. AI copy must disclose that it may be wrong and
remain limited to Parent-approved tasks with an adult-help exit. No vector scene, person, hand,
readable text in imagery, remote asset, dependency, networking, new AI behavior, push, merge,
deployment, or release activation is authorized.

**Completion — 2026-09-06**: Root expanded the in-route flow to six bilingual child-clear moments,
made Family, Sustainability, and bounded AI directly selectable pillars, and kept Help and permanent
private symbolic growth as the close. Two OpenAI imagegen JPEGs were visually curated, normalized
to 1200×800 under 500 KB, prompt-embedded, checksummed, and added to the exact 48-entry local
registry. Startup now derives nine blocking rasters while the deferred queue remains 41. One
220 ms image settle and 45 ms staged copy transition uses transform/opacity on the UI thread;
reduced motion is immediately settled. RED recorded 6 expected feature failures and one later
motion failure; final focused coverage passed 3 files / 26 tests and the full suite passed 87 files
/ 1,065 tests. Typecheck, lint, format, Expo dependency alignment, Git whitespace, the 48-raster
prompt scan, and Impeccable detector passed. Web exported 121 files / 39 static routes and Android
JS exported 90 files; both new rasters were byte-identical in both exports. Firefox traversed all
six moments and pillar jumps across Arabic/English at 320×720 and 390×844 with 60px pillar targets,
no horizontal overflow, reduced-motion parity, and zero page errors. Physical Android and named
human-review gates remain `BLOCKED / NOT RUN` because ADB found no target and no reviewer was
available. The reservation is released at this local checkpoint; no push, merge, deployment, or
release activation was performed.

## 2026-09-06 Returning-family Entry and Welcome Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md}`, `app/access/parent/**`,
`app/{parent,child}/index.tsx`, new `src/components/session/**`,
`src/state/usePrototypeStore.ts`, `src/i18n/resources.ts`, and
`tests/{r003-returning-family-entry,r003-screen-flow}.test.ts` only.

**Scope**: Keep first-family creation available only when the immutable local household receipt is
absent. A verified returning Parent with that receipt must reuse the existing family and land on
Parent Home; a returning Child on an active paired-device fixture must land on Today. Record a
one-use, role-bound presentation signal only after those returning sign-ins, then show an
Arabic-first private local update dialog over the corresponding dashboard. The dialog may read
only data already visible to that role, must be dismissible, and must not claim push delivery,
remote sync, production persistence, or a second household. First-family success, new Child
pairing, access separation, reset, default-off flags, route count, existing authorities, theme,
and protected user work remain unchanged. No dependency, asset, URL, push, merge, deployment, or
release activation is authorized.

**Completion — 2026-09-06**: Root added one transient, role-bound returning-user presentation
signal derived only from the established Parent receipt or active Child paired-device fixture.
Returning Parent verification now reuses the existing household and enters Parent Home; returning
Child credentials enter that Child's Today screen. Fresh Parent setup and first Child pairing do not
set the signal. One shared bilingual Soft Geometric modal presents at most two current, private,
role-authorized updates and clears on dismiss, navigation, sign-out, handoff, or reset. RED recorded
5 expected failures; final focused coverage passed 5 tests, the integrated batch passed 4 files /
35 tests, and the full suite passed 87 files / 1,063 tests. Typecheck, lint, formatting, dependency
alignment, Git whitespace, detector, and the 39-route web export passed. Firefox verified fresh and
returning Parent/Child journeys plus Arabic/English 320×720 and 390×844 dialog layouts with no
horizontal overflow or page errors. Physical Android and assistive-technology checks remain
`BLOCKED / NOT RUN` because ADB found no target. The reservation is released at this local
checkpoint; no push, merge, deployment, or release activation was performed.

## 2026-09-06 Ordered Splash-to-loading Startup Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md}`, `app/_layout.tsx`,
`src/components/onboarding/BrandedSplash.tsx`, `src/design/tokens.ts`, and
`tests/r003-first-run-experience.test.ts` only.

**Scope**: Replace the combined startup overlay with an explicit ordered presentation: configured
native splash, fully opaque app-owned Ghaf splash for 2,000 ms after native handoff, simple
three-leaf loading state for at least 1,000 ms and until bounded signed-out readiness settles, then
onboarding. The initial app-owned splash may not enter from transparent or expose the mounted
onboarding surface. Deferred 41-image warming begins only after the loading stage completes.
Preserve the current logo, raster field, leaf loader, reduced-motion behavior, route/access/product
authorities, local asset sets, fallback, flags, and protected user work. No new asset, dependency,
URL, product claim, push, merge, deployment, or release activation is authorized.

**Completion — 2026-09-06**: Root replaced the combined boolean overlay with explicit
`splash → loading → complete` state, removed initial and final overlay transparency, separated
2,000 ms splash and 1,000 ms loading tokens, kept readiness attached only to loading, and deferred
the 41-image queue until two onboarding paint frames. RED recorded 2 failures / 8 passes; final
focused coverage passed 10 tests and the full suite passed 86 files / 1,058 tests. Typecheck, lint,
format, dependency alignment, detector, Git whitespace, web export (119 files), and Android JS
export (88 files) passed. Fresh cached and delayed Firefox timelines both began with the topmost
loader-free splash, then loading, then onboarding; cached loading measured 1,013 ms, delayed
readiness extended it to 3,214 ms, all deferred requests occurred in onboarding, and compact visual
inspection produced zero errors. Physical Android first-frame timing/motion remains
`BLOCKED / NOT RUN` because ADB found no device. The reservation is released at the cohesive local
checkpoint; no push, merge, deployment, or release activation was performed.

## 2026-09-06 Deferred Post-onboarding Image Warm-up Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md}`, `app/_layout.tsx`,
`src/features/startup/**`, and `tests/r003-first-run-experience.test.ts` only.

**Scope**: Preserve the seven-raster/four-font blocking startup gate, then begin a non-blocking
warm-up only after the app-owned splash exits and the onboarding surface has received a paint
opportunity. Load the remaining local rasters asynchronously in bounded parallel batches, share
the existing source-level promise cache with demand-driven section preparation, prioritize the
immediate access/experience set, and leave the large prepared-media fixture until the final batch.
The background queue may never delay first paint, navigation, section transitions, fallback, or
reset and exposes no visible progress or remote-work claim. Preserve routes, access/session and
product authorities, offline packaging, feature flags, current images, fonts, UI, and protected
user work. No new asset, dependency, URL, vector image, push, merge, deployment, or release
activation is authorized.

**Completion — 2026-09-06**: Root extracted one per-source `expo-asset` promise cache, retained the
seven-raster/four-font startup calculation, and added a singleton 41-raster background queue that
starts after two post-splash frames. Batches load six sources concurrently, prioritize access and
experience art, tolerate individual failures, and leave the 2.3 MB prepared fixture last. RED
failed on the absent helper; final focused coverage passed 9 tests and the full suite passed 86
files / 1,057 tests. Typecheck, lint, format, dependency alignment, Git whitespace, web export (119
files), and Android JS export (88 files) passed. A delayed Firefox flow recorded zero deferred
requests while the splash was pending, then exactly 41 after handoff with six simultaneous priority
starts and prepared media last; it had zero page errors. Physical Android decode/cache/memory
remains `BLOCKED / NOT RUN` because ADB found no device. The reservation is released at the
cohesive local checkpoint; no push, merge, deployment, or release activation was performed.

## 2026-09-06 Section-scoped Asset Loading and Simple Leaf-loop Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`, `app.config.ts`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md}`, the existing
`specs/003-family-growth-garden/design-intake/r003-first-run-experience.md`, `app/_layout.tsx`,
`src/features/startup/**`, `src/components/onboarding/**`, `src/i18n/resources.ts`, and
`tests/{r001-design-foundation,r003-first-run-experience}.test.ts` only.

**Scope**: Supersede the all-app startup preload with a section-scoped local-asset policy. Startup
may block only on the official logo, shared leaf-shadow field, four onboarding photographs,
Welcome photograph, and four font files used by the current Alexandria/Readex roles. Parent/Child
access handoffs may warm the five small botanical avatars; Parent/Child experience handoffs may
warm only their immediate field/task imagery. Garden, League, reveal, learning, Shared Growth,
canopy, Circle, and prepared-media rasters remain lazy through the existing Expo Image memory/disk
cache. Begin the 1,200 ms app-owned splash window only after the native splash hide settles, replace
visible resource copy/progress with one reusable three-leaf transform-only loop, keep an
accessibility-only localized loading label and static reduced-motion state, and let the 900 ms
major-section buffer wait for its bounded destination assets. Preserve routes, access/session and
product authorities, offline fallback, flags, image registry, and protected user work. No new
asset, dependency, remote URL, vector image, fake progress, push, merge, deployment, or release
activation is authorized.

**Completion — 2026-09-06**: Root replaced the 48-raster/seven-font startup gate with seven
signed-out rasters and the four font files used by current brand roles, then added cached bounded
access/experience preparation while keeping all deeper imagery lazy in Expo Image. Combined
startup file bytes fell from 10,638,873 to 2,196,726 (79.4%). Native handoff now starts the full
1,200 ms app-owned presentation window. Startup and section buffers share one transform-only
three-leaf loop, no visible technical resource copy, and a static reduced-motion state. The focused
batch passed 2 files / 15 tests after the required RED state; the full suite passed 86 files /
1,056 tests, with typecheck, lint, format, dependency alignment, detector, production exports, and
Git whitespace checks passing. Firefox request/timing evidence showed only the exact seven rasters
and four fonts at startup, a 1,318 ms cached visible handoff including exit, delayed-asset waiting,
post-handoff avatar requests, changing standard rotation, static reduced motion, zero errors, and no
horizontal overflow at 320/390 widths. Physical Android/TalkBack/native decode and OS font-scale
remain `BLOCKED / NOT RUN` because ADB listed no target. The reservation is released at the
cohesive local checkpoint; no push, merge, deployment, or release activation was performed.

## 2026-09-06 Startup Asset-readiness and Loading-motion Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md}`, the existing
`specs/003-family-growth-garden/design-intake/r003-first-run-experience.md`, `app/_layout.tsx`,
new `src/features/startup/**`, `src/components/brand/GhafRasterLogo.tsx`,
`src/components/demoAssets.ts`, `src/components/illustrations/illustrationSources.ts`,
`src/components/onboarding/BrandedSplash.tsx`, `src/i18n/resources.ts`, and
`tests/r003-first-run-experience.test.ts` only.

**Scope**: Keep the branded app-owned splash visible until Alexandria/Readex fonts and every
registered local runtime raster image have settled, including deterministic image-fallback paths.
Load the splash logo and leaf-shadow background before yielding the native splash, then preload the
remaining local images with measured settled-resource progress. Replace the generic spinner with
one Ghaf-specific, UI-thread loading animation and a calm reduced-motion equivalent. Preserve the
1,200 ms minimum, offline behavior, exact routes, access/session and product authorities, image
registry, default-off flags, and protected user work. No new image, dependency, remote URL, fake
percentage, business behavior, push, merge, deployment, or release activation is authorized.

**Completion — 2026-09-06**: Root implemented critical-brand-first loading, batched preload of all
48 registered runtime raster modules, seven-font-set readiness, real accessible progress, fallback
failure accounting, and the Ghaf-specific UI-thread pulse with a static reduced-motion path. The
focused file passed 7 tests and the full suite passed 86 files / 1,055 tests; typecheck, lint,
formatting, dependency alignment, detector, 122-file web export, 91-file Android JS export, and Git
whitespace checks passed. Firefox delayed-raster inspection proved the splash remained after 3.2
seconds at real progress `0.927273`, dismissed after settlement, and logged zero page errors;
Arabic 320×720 and 390×844 layouts were contained. Physical Android/TalkBack/OS font scale and
named-human review remain `BLOCKED / NOT RUN` with no attached ADB target. The reservation is
released to the integration owner at the cohesive local checkpoint; no push, merge, deployment, or
release activation was performed.

## 2026-09-06 Child-clear Onboarding and Branded Access Refinement Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`DESIGN_DIRECTION.md`, `PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md}`, the existing
`specs/003-family-growth-garden/design-intake/r003-first-run-experience.md`, `app/_layout.tsx`,
`app/access/**`,
`assets/images/illustrations/r003/{ASSET_MANIFEST.json,PROVENANCE.md,final/onboarding-*.jpg}`,
`src/design/tokens.ts`, `src/components/access/AccessShell.tsx`, `src/components/brand/**`,
`src/components/onboarding/**`, `src/components/illustrations/illustrationSources.ts`,
`src/i18n/resources.ts`, and
`tests/{r003-first-run-experience,r003-illustration-assets,r001-onboarding-flow,r003-screen-flow}.test.ts`
only.

**Scope**: Supersede the three-moment first-run sequence with four moments beginning with a clear
introduction to Ghaf, rewrite all onboarding copy for younger readers without weakening product
truth, replace the three feature photographs with more vivid child-welcoming raster photography,
and add one new Ghaf-introduction raster. Give startup a measured 1,200 ms minimum presentation
window and major-section orientation buffers a 900 ms dwell, without fake progress or remote-work
claims. Refactor the shared access shell so every Parent/Child sign-in, verification, pairing, and
first-family setup surface carries the official raster Ghaf logo/name and the loader's leaf-shadow
visual world. Preserve exact routes, state, access separation, reset, task/reward authorities,
default-off flags, offline behavior, and protected user work. No vector scene, new dependency,
remote image, production authentication claim, push, merge, deployment, or release activation is
authorized.

**Completion — 2026-09-06**: Root implemented and validated the four-moment child-clear bilingual
onboarding, four vivid onboarding photographs, declared 1,200/900 ms presentation holds, and one
shared raster-logo/leaf-shadow access shell across all Parent/Child access routes. The focused
suite passed 3 files / 16 tests and the complete suite passed 86 files / 1,053 tests; typecheck,
lint, formatting, Expo dependency alignment, the Impeccable detector, 122-file web export,
91-file Android JS export, five-image checksum matching, and Git whitespace checks passed. Firefox
proxy evidence covered four onboarding moments and eight reachable access states at compact
Arabic/English widths with zero final-flow console errors. Physical Android/TalkBack/OS font scale
remains `BLOCKED / NOT RUN` with no attached ADB device; named Arabic/UAE, safeguarding,
accessibility, botanical, and image-rights review remains `NOT RUN`. All reserved boundaries are
released to the integration owner; no push, merge, deployment, or release activation was
performed.

## 2026-09-06 First-run Onboarding and Context Transition Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`DESIGN_DIRECTION.md`, `PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md}`,
`specs/003-family-growth-garden/design-intake/r003-first-run-experience.md`, `app/_layout.tsx`,
`app/index.tsx`, `assets/images/illustrations/r003/{ASSET_MANIFEST.json,PROVENANCE.md,final/**}`,
`src/components/illustrations/illustrationSources.ts`, `src/components/onboarding/**`,
`src/i18n/resources.ts`, and
`tests/{r003-first-run-experience,r003-illustration-assets}.test.ts` only.

**Scope**: Add a three-moment, optional Arabic-first onboarding presentation inside the existing
Welcome route, retain visible Parent and Child access choices after onboarding, and bridge the
native raster splash into one branded local loading presentation. Add one professional transition
buffer only when the app crosses between Welcome, role-specific access, and an authenticated
Parent or Child experience; routine tabs and contextual routes within the same experience never
show the buffer. Use the immutable official raster logo and four new locally generated raster
photographs in the Quiet UAE Botanical Editorial direction. No new product route, vector scene,
account authority, persistence claim, network request, artificial delay, reward/state change,
remote loading claim, dependency, release activation, push, merge, or deployment is authorized.
Existing functional vectors outside this boundary remain protected. Completion is session-local,
skippable, reduced-motion aware, offline deterministic, and equivalent in Arabic RTL and English
LTR. Protected user-owned paths remain untouched.

**Completion — 2026-09-06**: Root implemented the three-moment bilingual onboarding, official
raster-logo treatment, local branded startup handoff, and bounded experience-transition overlay
without adding a route, dependency, network request, or durable authority. Four generated JPEGs
were inspected, normalized, prompt-embedded, checksummed, registered, and verified in both web and
Android production exports. Focused onboarding/route/reset coverage passed 7 files / 76 tests; the
full suite passed 86 files / 1,052 tests; typecheck, lint, formatting, Expo dependency checks, and
`git diff --check` passed. Firefox proxy inspection passed Arabic RTL and English LTR at 320×720
and 390×844 with no horizontal overflow or console errors, including Back/Skip/Start, same-section
transition suppression, and reduced-motion equivalence. Physical Android, TalkBack, OS font-scale,
named-human, and image-rights review remain `BLOCKED` or `NOT RUN` because no device or reviewer was
available. All reserved boundaries are released to the integration owner at the local checkpoints;
no push, merge, deployment, or release activation was performed.

## 2026-09-06 Natural Botanical Artwork Refresh Window

**Integration owner and only runtime/documentation writer**: `/root`

**Asset-generation contributors**: up to three `/root/illustration_*` workers, each restricted to
its separately assigned subdirectory under `assets/images/illustrations/r003/`. They are not
authorized to edit runtime, tests, shared manifests, configuration, evidence, or this ownership
record.

**Exact generation allocation**: `batch-access-ghaf/**` holds the field, Welcome, profile, task,
Ghaf-stage, and first Circle sources; `batch-groves-canopy/**` holds Samar and Sidr stage sources;
`batch-oasis-coast/**` holds Date Palm, Mangrove, reveal, learning, and shared-coastal sources; and
`batch-canopy-circle/**` holds only the two family-canopy and remaining two Circle sources. Root
alone curates those non-overlapping inputs into the shipping `final/**` directory and shared
manifest.

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `DESIGN.md`, `DESIGN_DIRECTION.md`,
`PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`, `docs/design/brand/GHAF_OFFICIAL_LOGO_MIGRATION.md`,
`docs/design/stitch/releases/ghaf-r002a/ASSET_PROVENANCE.md`,
`docs/design/stitch/releases/ghaf-r002b/{SCREEN_INDEX.md,screens/02-garden-chapter/screen-spec.md,screens/06-learning-story/screen-spec.md,screens/08-child-reveal/screen-spec.md,screens/10-shared-growth/screen-spec.md,screens/12-private-league/screen-spec.md}`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md,quickstart.md}`,
`specs/003-family-growth-garden/checklists/requirements.md`,
`specs/003-family-growth-garden/contracts/acceptance-contract.md`,
`specs/003-family-growth-garden/design-intake/{r003-complete-screen-journey.md,r003-natural-artwork-refresh.md}`,
`package.json`, `package-lock.json`, `app.config.ts`, `app/index.tsx`, `assets/images/illustrations/r003/**`,
`src/components/illustrations/**`, `src/components/access/{AccessShell.tsx,BotanicalAvatar.tsx}`,
`src/components/r002a/{R002aScreen.tsx,child/ChildTaskHero.tsx}`,
`src/components/family-growth/{GardenLandscape.tsx,FamilyCanopy.tsx,CircleProgress.tsx,PreparedMedia.tsx}`,
`src/components/r002b/{LearningScreens.tsx,RevealBundleScreen.tsx,SharedGrowthScreens.tsx,PrivateLeagueScreen.tsx}`,
`src/i18n/resources.ts`, and
`tests/{r001-design-foundation,official-brand-platform,r002a-child-task-presentation,r002a-garden-presentation,r002a-parent-home-presentation,r002a-cross-slice-quality,r002b-learning-screen-components,r002b-reveal-screen-components,r002b-shared-growth-screen-components,r003-illustration-assets}.test.{ts,tsx}` only.

**Scope**: Replace vector-like scenic, decorative, botanical-state, task, learning, reveal,
cooperative-growth, and profile-choice drawings with an offline, provenance-recorded local raster
library in the **Quiet UAE Botanical Editorial** direction. The exact library contains one subtle
field texture, one welcome habitat hero, five botanical profile images, one recycling task hero,
twenty-five species-and-stage Garden scenes, two 19/25 and 20/25 family-canopy scenes, three
anonymous cooperative-garden scenes, one recognition reveal, one Mangrove habitat study, and one
shared coastal canopy. Preserve the official Ghaf mark and wordmark, app/platform icons, small
functional navigation/status/safety controls, live progress geometry, accessibility semantics,
Arabic/English copy, routes, state, reward authority, privacy filtering, deterministic reset, and
all default-off R002b flags. Generated images contain no people, faces, hands, readable text,
logos, brands, hazards, fantasy claims, or rasterized UI. Raw Stitch exports and protected
user-owned paths remain untouched. One Expo-native image dependency is authorized only for local
decode, crop, caching, transition, and memory behavior; it adds no media capture or remote service.
No push, merge, deployment, release activation, or shared-history rewrite is authorized.

**Completion — 2026-09-06**: Root curated and integrated 41 local photographic artwork files with
exact prompt, source/final dimension, transformation, route, accessibility, checksum, and review
records. Scenic runtime drawings and the decorative League watermark are removed; the official
Ghaf brand and small functional vectors remain protected. Focused artwork/route/reset coverage
passed 15 files / 151 tests; the full suite passed 85 files / 1,048 tests; typecheck, lint,
formatting, Expo dependency/configuration checks, prompt scan, web export, Android JavaScript
export, and `git diff --check` passed. Default-on Arabic/English Firefox proxy inspection passed at
320/390 widths. Explicitly enabled default-off art routes and named-human/rights checks remain
`NOT RUN`; physical Android is `BLOCKED` because no device or emulator was attached. All reserved
boundaries are released to the integration owner at this local checkpoint. No push, merge,
deployment, or release activation was performed.

## 2026-09-06 Parent Sign-up Flow and Sign-in Hierarchy Window

**Owner and only writer**: `/root`

**Reserved boundary**: `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `DESIGN.md`,
`PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`,
`specs/003-family-growth-garden/{spec.md,plan.md,tasks.md,quickstart.md}`,
`specs/003-family-growth-garden/checklists/requirements.md`,
`specs/003-family-growth-garden/contracts/acceptance-contract.md`,
`specs/003-family-growth-garden/design-intake/r003-complete-screen-journey.md`,
`app/access/parent/{sign-in.tsx,sign-up.tsx,verification.tsx}`,
`src/i18n/resources.ts`, and
`tests/{r001-onboarding-flow,r003-screen-flow,operator-demo-flow}.test.ts` only.

**Scope**: Center the Parent sign-in orientation and supporting copy while retaining logical-start
alignment for mixed phone/email data entry, preserve the filled/neutral/outlined action hierarchy,
and route **Create a new family** to a dedicated code-native Soft Geometric sign-up screen. The
sign-up screen reuses the existing deterministic Parent verification authority and continues to
first-family setup; a closed `create-family` flow marker may restore Verification Back/cancel only
to sign-up. No second household, production account, new access authority, dependency, or live
service is authorized. Delegated audits are read-only; protected user-owned paths remain untouched
and no push or merge is authorized.

**Completion — 2026-09-06**: Parent sign-in now centers its screen-level orientation and support
copy while keeping identifier labels and helper text on the logical form axis. **Create a new
family** navigates without requesting a code to the dedicated bilingual sign-up screen; its
allowlisted verification origin restores sign-up on visible Back, Android Back, and identifier
change, including offline preview. Focused access/navigation coverage passed 3 files / 57 tests;
the full suite passed 84 files / 1,044 tests; typecheck, lint, formatting, dependency/configuration
checks, `git diff --check`, the exact 37-product-route inventory, and the 39-route web export passed.
Firefox proxy inspection passed Arabic and English at 320×720 and 390×844 with equal action
geometry, zero horizontal overflow, and zero application console errors. Physical Android remains
blocked by the recorded unavailable device/toolchain, and named human review remains `NOT RUN`.
All reserved boundaries are released to the integration owner at this checkpoint; no push or merge
was performed.

## 2026-09-06 Parent Sign-in Spacing Refinement Window

**Owner and only writer**: `/root`

**Reserved boundary**: `app/access/parent/sign-in.tsx`,
`tests/r001-onboarding-flow.test.ts`, and this ownership record only.

**Scope**: Refine the user-approved Parent sign-in layout with an explicit logical text axis and a
token-only 4/12/16/20 dp vertical rhythm. Preserve the existing group order, equal button sizing,
copy, behavior, access boundaries, and design authority. Delegated audits are read-only; protected
user-owned paths remain untouched and no push or merge is authorized.

**Completion — 2026-09-06**: Intro and supporting copy now use explicit logical-start alignment;
related text/action gaps use the approved 4/12/16/20 dp cadence; the redundant second divider was
removed; and the content column centers only when spare height exists while remaining naturally
scrollable on compact or keyboard-constrained layouts. Firefox verified Arabic RTL and English LTR
at 320×720 plus the balanced English tall layout at 390×844 with zero console errors. The focused
regression, full 84-file/1,044-test suite, typecheck, lint, formatting, and scoped layout detector
passed. Physical Android remains blocked by the recorded unavailable device/toolchain. The
reservation is released after the cohesive local commit.

## 2026-09-06 Parent Sign-in Layout Redesign Window

**Owner and only writer**: `/root`

**Reserved boundary**: `app/access/parent/sign-in.tsx`,
`tests/r001-onboarding-flow.test.ts`, `DESIGN.md`, and this ownership record only.

**Scope**: Recompose the existing Parent sign-in screen into clear credential, biometric, and
new-family groups using only the approved Ghaf tokens and shared controls. All three actions must
share the full content width, regular minimum height, and corner geometry while preserving their
filled, neutral, and outlined hierarchy. Copy, handlers, route order, synthetic disclosures,
offline/error states, and Parent/Child access separation remain unchanged. Delegated audits are
read-only; protected user-owned paths remain untouched and no push or merge is authorized.

**Completion — 2026-09-06**: The screen now uses a compact intro and deliberate credential,
biometric, and new-family groups instead of one uniform action stack. At the 320×720 Firefox proxy,
all three actions measured 280×60 with 16 px corners; Arabic RTL and English LTR kept the full
Create Family control above the disclosure footer with zero console errors. The focused regression,
full 84-file/1,044-test suite, typecheck, lint, formatting, and scoped layout detector passed.
Physical Android remains blocked by the previously recorded unavailable device/toolchain, so no
native visual claim is added. The reservation is released after the cohesive local commit.

## 2026-09-06 Parent Sign-in CTA Clarity Window

**Owner and only writer**: `/root`

**Reserved boundary**: `app/access/parent/sign-in.tsx`,
`tests/r001-onboarding-flow.test.ts`, and this ownership record only.

**Scope**: Give the existing Parent sign-in “Create a new family” secondary action a clearly
visible outer frame using the approved Ghaf design tokens and shared Button behavior. Preserve its
copy, route action, hierarchy, bilingual layout, and all unrelated access behavior. The delegated
screen audit is read-only; protected user-owned paths remain untouched and no push or merge is
authorized.

**Completion — 2026-09-06**: The CTA now renders the existing shared 1 px Button border in Ghaf
emerald while retaining its quiet variant, 48 px touch target, pill geometry, focus behavior, and
Arabic/English copy. The focused regression, full 84-file/1,044-test suite, typecheck, lint, and
format checks passed. Firefox at 390×844 confirmed the border in Arabic RTL and English LTR with
zero console errors. The reservation is released after the cohesive local commit.

## 2026-09-05 Complete Screen Journey Window

**Integration owner and only writer**: `/root`

**Branch**: `integration/r3-complete-screens-20260905`, created from the validated R002b
implementation checkpoint `45b18bc`.

**User authority**: Complete every missing P0 screen and make the Parent and Child sequences
coherent. A missing Google Stitch frame is no longer an implementation blocker for this local
prototype; new surfaces inherit the approved Soft Geometric Ghaf system in `DESIGN.md` and
`DESIGN_DIRECTION.md`. Existing R002b presentations remain independently default-off; explicit
opt-in is for targeted validation only and does not activate release.

**Reserved boundary**: Feature 003 `spec.md`, `plan.md`, `tasks.md`, new completion design-intake
records, `DESIGN.md`, `DESIGN_DIRECTION.md`, `PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`,
`app/**`, `src/components/r002a/**`, new `src/components/r003/**`, `src/config/**`,
`src/features/access/**`, new `src/features/family-hub/**`, `src/i18n/**`,
`src/state/usePrototypeStore.ts`, and new/focused completion tests in `tests/**`.

The writer must preserve `.codex/config.toml`,
`docs/Ghaf_Official_Logo_and_App_Icon_Pack_v1.0/`, and
`docs/design/stitch/releases/ghaf-r002/` as user-owned input. Those paths must not be edited,
staged, or committed. No package/dependency, production account, network, payment, real media,
push, merge, deployment, or shared-history rewrite is authorized. The reservation ends after the
implemented route manifest, focused/full validation, browser walkthrough, truthful limitations,
and cohesive local commits are handed off.

**Completion and release — 2026-09-06**: Runtime and tests were committed locally as `40fc5fc`;
the documentation/evidence closeout is the commit containing this paragraph. Final gates passed
typecheck, lint, formatting, 84 files / 1,044 tests, dependency/configuration checks, Git whitespace,
and a 38-route web export. Firefox 390×844 passed the scoped Arabic/English journey, revoke/re-pair,
League, reset/Back, and signed-origin focus/scroll probes with zero console errors. Physical Android
remains `BLOCKED` because ADB has no attached device and the SDK/Java toolchain is unavailable;
native and named-human subchecks remain `NOT RUN`. The final design disposition is `recapture`, not
ship, until an authoritative Android capture exists. The protected user-owned paths remained
unstaged, no push or merge occurred, and the complete-screen reservation is released to the team.

**Authority-hardening test migration delegation — 2026-09-06**: `/root` retains runtime and
integration ownership. `/root/session_tests_core` exclusively owns the existing core-flow test
files `mock-core-flow.test.ts`, `parent-task-flow.test.ts`, `child-task-flow.test.ts`,
`garden-circle-flow.test.ts`, `child-ai-presentation.test.ts`, `parent-check-in-flow.test.ts`,
`operator-demo-flow.test.ts`, `prototype-state.test.ts`, `r002a-behavior-characterization.test.ts`,
and `r002a-child-support-follow-up.test.ts`. `/root/session_tests_growth` exclusively owns the
existing Growth test files `r002b-progression-store.test.ts`,
`r002b-reveal-store-integration.test.ts`, `r002b-learning-store.test.ts`,
`r002b-schema3-ledger-characterization.test.ts`, `r002b-shared-growth-store.test.ts`,
`r002b-learning-reveal-integration.test.ts`, and `reward-matrix.test.ts`. Both delegations may use
the shared `tests/helpers/prototypeStore.ts` access helpers but must not edit it, runtime files, or
each other's files; they return focused green evidence without committing.

`/root/r003_flow_docs` exclusively owns `DEMO_RUNBOOK.md`, `PROTOTYPE_LIMITATIONS.md`,
`specs/003-family-growth-garden/quickstart.md`, and
`specs/003-family-growth-garden/contracts/acceptance-contract.md` for the current R003 handoff. It
must replace operational `/role`/role-selector instructions with the implemented Welcome →
role-specific synthetic access → experience sequence, preserve clearly marked historical R001 and
R002a evidence, keep all native/human validation claims truthful, and make no runtime or task-file
edits. It returns documentation checks without committing.

## 2026-09-05 Local Run Guide Simplification Window

**Owner**: `/root`

**Reserved boundary**: `README.md` and `docs/DEVELOPMENT.md` only.

**Scope**: Keep the detailed developer guide consistent with the README by documenting exactly two
supported app-running workflows: offline web testing and a Windows Android Studio/ADB USB device.
Remove QR/Expo Go, LAN/tunnel, emulator, and iOS launch instructions without changing repository
scripts or runtime behavior.

## 2026-09-05 Official Ghaf Brand Migration Window

**Integration owner**: `/root`

**Worktree and branch**:
`/home/smyk/projects/Ghaf-r002-reconciliation-20260904` on
`integration/r3-r002b-implementation-20260905` at preflight head `ca80f9f`.

**Scope**: Integrate the product-owner-designated official Ghaf mark, launcher/adaptive/themed
icons, native splash asset, favicon, and PWA derivatives without changing R001/R002a layouts,
R002b feature-flag defaults, or any product behavior. The source pack in the original worktree is
read-only; `Zone.Identifier` files and raw R002 exports remain excluded.

| Exclusive writer                                                | Exact reserved boundary                                                                                                                          | Handoff condition                                                                                                                                                 |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/root` — brand integration and documentation                   | `TEAM_OWNERSHIP.md`, new `docs/design/brand/**`, final integration review, exact staging, validation, and commits                                | Preserve all behavior and protected content art; record source hashes, replacement decisions, external Stitch status, native blockers, and rollback               |
| `/root/official_brand_orchestrator/brand_asset_inventory`       | New `assets/brand/ghaf/**`, new `src/components/brand/**`, and new `tests/official-brand-mark.test.ts` only                                      | Copy checksum-verified assets without modifying geometry; add one typed mark component using the existing SVG stack; test variants, accessibility, and SVG safety |
| `/root/official_brand_orchestrator/brand_validation_capability` | `app.config.ts`, `package.json`, `package-lock.json`, new `app/+html.tsx`, new `public/**`, and new `tests/official-brand-platform.test.ts` only | Configure platform/web branding against Expo SDK 57, keep existing plugins/config intact, and validate exact dimensions, opacity, safe areas, and resolved paths  |

No writer may edit an existing route, profile avatar, botanical illustration, Garden/League art,
badge, task/navigation icon, feature flag, fixture, service, state, or product specification during
this migration. Delegated writers must accommodate concurrent changes and return work uncommitted.

## 2026-09-05 R002b Feature-Flagged Implementation Window

**Integration owner**: `/root`

**Worktree and branch**:
`/home/smyk/projects/Ghaf-r002-reconciliation-20260904` on
`integration/r3-r002b-implementation-20260905`, created from clean R002a head `0501cf3`.

**Gate**:

- **R002B PRODUCT CONTRACT APPROVED — FEATURE-FLAGGED IMPLEMENTATION AUTHORIZED — RELEASE ACTIVATION BLOCKED**

**Preservation boundary**: R001 and R002a remain regression baselines and the default presentation
whenever an R002b flag is disabled. The six divergent historical commits remain unapplied. The
original worktree and its untracked raw R002 exports remain read-only and must not be staged,
renamed, edited, or imported.

| Exclusive writer                                                                                          | Exact reserved boundary                                                                                                                                                                                                                                                                                                                                                                                                                   | Handoff condition                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/root/r002b_orchestrator` and read-only delegates                                                        | Repository-wide R002b authority, Schema-3, badge, route, flag, and architecture audits only                                                                                                                                                                                                                                                                                                                                               | Return exact evidence and non-overlapping implementation boundaries; no edits                                                                                                                                                                                                    |
| `/root` — contract and integration                                                                        | `PRODUCT.md`, `PROTOTYPE_LIMITATIONS.md`, `DESIGN.md`, `DEMO_RUNBOOK.md`, `TEAM_OWNERSHIP.md`, Feature 003 `spec.md`, `plan.md`, `tasks.md`, `data-model.md`, contracts, design-intake gates/specifications, shared models/store/services/i18n/configuration, `src/features/growth/bootstrap.ts`, `tests/r002b-feature-flags.test.ts`, `tests/r002b-progression-store.test.ts`, route integration, exact staging, validation, and commits | Serialize shared files, keep flags default-off, preserve all R002a behavior, and record every gate truthfully                                                                                                                                                                    |
| `/root/r002b_orchestrator/schema3_characterization_writer`                                                | New `tests/r002b-schema3-ledger-characterization.test.ts` only                                                                                                                                                                                                                                                                                                                                                                            | Add all-green audit coverage for the existing Schema-3 mismatch, task/reward/reset/profile invariants, and absence of persistence; edit no runtime, documentation, or other test file                                                                                            |
| `/root/r002b_orchestrator/progression_engine_writer`                                                      | New `src/models/growthJourney.ts`, `src/features/growth/seedLedger.ts`, and `tests/r002b-lifetime-seed-projection.test.ts` only                                                                                                                                                                                                                                                                                                           | Build the pure immutable ledger audit/migration/lifetime-projection boundary test-first; edit no store, fixture, service, route, resource, configuration, documentation, or other test file                                                                                      |
| `/root/r002b_orchestrator/achievement_engine_writer`                                                      | New `src/models/achievements.ts`, `src/features/growth/badgeRegistry.ts`, `src/features/growth/achievements.ts`, and `tests/r002b-achievements.test.ts` only                                                                                                                                                                                                                                                                              | Encode and evaluate the exact locked 16-badge registry test-first; edit no existing progression file, store, fixture, service, route, resource, configuration, documentation, or other test file                                                                                 |
| `/root/r002b_orchestrator/learning_engine_writer`                                                         | New `src/models/learning.ts`, `src/features/learning/mangroveLearning.ts`, and `tests/r002b-learning.test.ts` only                                                                                                                                                                                                                                                                                                                        | Implement the finite equal-credit package and idempotent completion test-first; edit no store, route, resource, shared model, fixture, service registry, or documentation                                                                                                        |
| `/root/r002b_orchestrator/reveal_bundle_writer`                                                           | New `src/models/revealBundle.ts`, `src/features/rewards/revealBundle.ts`, and `tests/r002b-reveal-bundle.test.ts` only                                                                                                                                                                                                                                                                                                                    | Build the receipt-only superset bundle and lifecycle test-first; never calculate or mutate a reward, and edit no store, route, resource, fixture, service registry, or documentation                                                                                             |
| `/root/r002b_orchestrator/shared_growth_writer`                                                           | New `src/models/sharedGrowth.ts`, `src/features/shared-growth/sharedGrowth.ts`, and `tests/r002b-shared-growth.test.ts` only                                                                                                                                                                                                                                                                                                              | Build the anonymous qualitative view and Parent-governed future-contribution state test-first; preserve private League and every personal/reward authority; edit no store, route, resource, fixture, configuration, or documentation                                             |
| `/root` — queued Parent Progress projection                                                               | New `src/features/growth/parentProgress.ts` and `tests/r002b-parent-progress.test.ts` only                                                                                                                                                                                                                                                                                                                                                | Build a Parent-only, profile/epoch-scoped, read-only projection with transparent Task Builder prefill intents; never assign, mutate, grant, or edit progress, and validate before route integration                                                                              |
| `/root/r002b_orchestrator/learning_content_writer` (reused for Growth UI after releasing its prior files) | New `src/components/r002b/GrowthJourneyScreens.tsx` and `tests/r002b-growth-screen-components.test.tsx` only                                                                                                                                                                                                                                                                                                                              | Build reusable code-native Today/Garden/Impact Path/Badge Gallery/Badge Detail presentation components from the approved screen specs and existing tokens; accept copy/actions/data as props and edit no route, store, resource, token, fixture, configuration, or documentation |
| `/root/r002b_orchestrator/learning_screens_writer`                                                        | New `src/components/r002b/LearningScreens.tsx` and `tests/r002b-learning-screen-components.test.tsx` only                                                                                                                                                                                                                                                                                                                                 | Build prop-driven code-native Story and accessible-equivalent Learning surfaces with finite, no-fail, equal-credit, resumable presentation; edit no route, store, i18n, configuration, documentation, or domain file                                                             |
| `/root` — R002b screen specifications and UI integration                                                  | New `docs/design/stitch/releases/ghaf-r002b/**`, future `src/components/r002b/**` except the reserved `GrowthJourneyScreens.tsx`, future nested R002b route files, and serialized integration into existing routes after the applicable domain interface is stable                                                                                                                                                                        | Define every code-native candidate before implementation, keep each surface behind its independent default-off flag, and preserve the exact R002a fallback and all existing behavior                                                                                             |
| `/root/r002b_evidence_docs` — closeout evidence                                                           | `specs/003-family-growth-garden/tasks.md`, new `specs/003-family-growth-garden/design-intake/r002b-validation-evidence.md`, `docs/design/stitch/releases/ghaf-r002b/SCREEN_INDEX.md`, `TEAM_OWNERSHIP.md`, and `DEMO_RUNBOOK.md` only                                                                                                                                                                                                     | Reconcile only evidence-proven task states, preserve every release/native/human gate, validate the Markdown diff, and return files unstaged to `/root`                                                                                                                           |
| `/root/r002b_completion_audit/shared_garden_recovery` — Shared Garden recovery                            | `app/parent/family/shared-garden.tsx`, `src/features/shared-growth/r002bSharedGrowthViewModel.ts`, `src/components/r002b/SharedGrowthScreens.tsx`, `src/i18n/resources.ts`, and the three focused `tests/r002b-shared-growth-{view-model,screen-components,route-integration}.test.*` files only                                                                                                                                          | Add a bilingual, accessible retry from presentation error back to ready/recovered state without changing participation, consent, flags, store, or domain semantics; use red/green tests and return changes uncommitted                                                           |
| `/root/r002b_completion_audit/reveal_impact_focus` — Reveal and Impact focus hardening                    | `app/child/reveal/[bundleId].tsx`, `app/child/index.tsx`, `src/components/r002b/RevealBundleScreen.tsx`, `src/components/r002b/GrowthJourneyScreens.tsx`, and focused Reveal/Growth/focus/Back tests only                                                                                                                                                                                                                                 | Correct accessible focus targets, initial/return focus, truthful resumed presentation, acknowledged interruption recovery, and native-Back policy using existing lifecycle actions; do not change copy, reward authorities, flags, fixtures, or store/domain semantics           |

No writer may change the same file concurrently. Shared files remain reserved to `/root`; delegated
workers must treat the rest of the repository as read-only and accommodate concurrent changes.

**Progression checkpoint — 2026-09-05**: The pure Seed ledger is integrated with the existing
recognition service through one atomic store write. The compatibility-only validation set passed
42 files / 601 tests, typecheck, focused lint/format, Expo public configuration, dependency check,
18-route static web export, and Git whitespace validation. Restoration is proven for opening,
praise-presented, and one recognized synthetic boundary when a session/runtime snapshot is
available; durable device storage and physical restart evidence remain release-blocked and must not
be inferred from these tests.

**Achievement-domain checkpoint — 2026-09-05**: The exact 16-ID registry, deterministic mastery
credits, permanent private awards, silent Seed-threshold backfill, and gallery/detail projections
passed 49 focused tests and the 43-file / 650-test full suite. Missing criterion translation,
why-it-matters copy, content review, and provenance remain explicit pending fields; this checkpoint
does not authorize the default-off badge UI for release.

**Achievement-integration checkpoint — 2026-09-05**: The same authoritative recognition receipt
now adds the canonical sorting/coast-care credits and evaluates badge awards in the atomic Growth
Journey store projection. Initial Seed-threshold awards remain silent; the new 120 and Sorting Bud
outcomes remain private and resumable. Typecheck, lint, formatting, 43 files / 651 tests, and Git
whitespace validation passed with every R002b presentation flag still default-off.

**Code-native screen-specification checkpoint — 2026-09-05**: The eleven authorized R002b
route surfaces and route-owned modules now have implementation-candidate specifications under
`docs/design/stitch/releases/ghaf-r002b/`. Each specification records its independent default-off
flag, R002a fallback, data/action authority, route/origin guard, responsive/RTL/accessibility states,
and unresolved review evidence before any route implementation. No raw R002 export, runtime file,
or release flag changed; canonical 390×844 implementation captures remain pending until each
surface exists.

**Route-safety checkpoint — 2026-09-05**: A closed R002b route/origin policy now rejects raw return
paths, arbitrary entity IDs, wrong-role or wrong-profile restoration, unauthorized Parent profiles,
and independently disabled features before any new route mounts. Focus, bounded scroll, and Gallery
filter restoration use known tokens with safe Child/Parent fallbacks. The focused 11-test route
suite and 45-file / 681-test repository suite excluding only the concurrently unfinished RevealBundle
test passed; the complete suite is required again after that isolated writer releases its files.

**Growth-presentation checkpoint — 2026-09-05**: One immutable, profile-scoped projection now joins
the canonical Seed ledger, Water and Coast Path station states, actual Mangrove archives, the exact
16-badge Gallery, approved learning unlocks, and existing assigned-task opportunities. It exposes no
writable Impact Path balance, never invents a configured next Garden stage, and fails closed on
cross-profile evidence. The focused 5-test suite, repository typecheck, exact lint/format checks, and
Git whitespace validation passed before route integration; every consuming surface remains behind
its independent default-off flag.

**RevealBundle-domain checkpoint — 2026-09-05**: A receipt-only, immutable Child presentation queue
now preserves and orders all 12 supported consequence kinds under the stable
`reveal:<profileId>:<triggerEventId>` identity, with replay protection, profile/reset isolation,
single-visible-bundle recovery, and the `ready → presenting → acknowledged → archived` lifecycle.
The focused 38-test suite, typecheck, lint, formatting, and Git whitespace validation passed. This
constructor validates every supplied receipt but cannot prove an applicable authority was omitted;
the authority-derived parity adapter remains required before RevealBundle v2 can be integrated or
its default-off flag considered for activation.

**Mangrove-learning evidence checkpoint — 2026-09-05**: A non-authoritative bilingual candidate
pack now traces three bounded lesson claims to directly opened official EAD Arabic/English and Dubai
Municipality pages. It specifies equivalent Story and concise routes, one no-fail check, stable
resource keys, zero reward consequences, offline delivery, and no autoplay. The focused 6-test
evidence suite, typecheck, exact lint/format checks, and Git whitespace validation passed. Factual,
Arabic/English, UAE cultural, safeguarding, accessibility-equivalence, and illustration-rights human
reviews remain NOT RUN, so `r002b_learning_ui` remains default-off and release activation blocked.

**Mangrove-learning resource checkpoint — 2026-09-05**: Every candidate message is now centralized
under the existing Arabic/English i18next resources and mechanically checked against the sourced
evidence pack. The focused resource and repository localization suites passed 8 tests together with
typecheck, exact lint/format checks, and Git whitespace validation. Runtime availability does not
upgrade content approval: the feature flag remains default-off and all six human review gates remain
release-blocking.

**Mangrove-learning integration checkpoint — 2026-09-05**: Profile- and reset-epoch-scoped
learning state now lives beside the Growth Journey runtime. Child-only store actions start or resume
either equal-credit route, record finite ordered progress, provide a no-fail check, and atomically
project the one idempotent completion into achievement evaluation without mutating Seeds, Garden,
canopy, League, Challenge Leaves, Family Rewards, or the existing recognition receipt. Later
recognitions retain the completion evidence needed for composite badge evaluation. Seven focused
files / 132 tests and the complete 51-file / 762-test repository suite passed with typecheck, lint,
formatting, and Git whitespace validation while the separately reserved Shared Growth boundary was
also green. The learning-engine boundary is released to `/root`; `r002b_learning_ui` remains
default-off and all content-review gates remain release-blocking.

**Shared Growth domain checkpoint — 2026-09-05**: A separate household-scoped authority now models
continued, paused, and ended participation for future anonymous signals only. Parent actions require
a supplied bounded reauthentication reference; Pause can reuse consent, while return after End
requires a distinct next-version consent recorded strictly after the matching End. State restoration
replays the consent/action lifecycle and rejects signals recorded outside an active contribution
window. The Child projection strips identity, timestamps, counts, rankings, tasks, Seeds, badges,
League, Challenge, and reward data and remains viewable in every participation state. The focused
27-test suite and complete 51-file / 764-test suite passed with typecheck, lint, formatting, and Git
whitespace validation. The domain writer's three-file boundary is released to `/root`. UI mutation
remains blocked until the existing access service supplies the required capability and
reauthentication adapter; both Shared Growth flags remain default-off.

**Parent Progress projection checkpoint — 2026-09-05**: A pure Parent-report projection now keeps
the selected Child's canonical lifetime ledger, current Mangrove stage, completed-stage archive,
16-badge state, exact criteria, and unlocked learning separate and read-only. It requires an
explicit `view_parent_reports` authority and profile allowlist, rejects profile/reset mismatches,
and recomputes Alya without retaining Salem's stage, learning, or task context. Its only task action
is a typed `prefill_only` intent into the existing Task Builder with normal Parent review/save still
required; it cannot create or assign. The focused 5-test suite, typecheck, exact lint/format checks,
and Git whitespace validation passed. Route/store authorization wiring and visual/device review
remain pending behind the default-off `r002b_parent_progress_ui` flag.

**Parent Progress access checkpoint — 2026-09-05**: The Parent onboarding controller now issues a
least-privilege `view_parent_reports` handoff for exactly one recognized synthetic Child only after
the existing completed Parent session authorizes that capability. The store converts that handoff
into the read-only projection without changing selected-Child, task, Garden, or Growth state, rejects
presentation-role forgery and unknown profiles, and loses report authority on the existing Parent
reset. Ten focused projection/access tests and repository typecheck passed. The route and visual
surface remain pending behind the default-off `r002b_parent_progress_ui` flag.

**Shared Growth access/store checkpoint — 2026-09-05**: The established access service now owns a
dedicated `manage_shared_growth_contribution` capability and single-use
`change_shared_growth_participation` reauthentication purpose. The Parent onboarding controller
keeps its private session hidden while producing a bounded, verified handoff; the store applies
Continue, Pause, and End only to the separate Shared Growth preference, requires fresh explicit
synthetic consent after End, reuses consent after Pause, and creates a new participation epoch on
Parent reset. The qualitative Child view remains available while paused or ended and contains no
identity, task, ranking, numeric, Seed, badge, or reward fields. Fifty-two focused domain/access
tests and repository typecheck passed. Both Shared Growth flags remain default-off.

**Growth Journey presentation checkpoint — 2026-09-05**: Reusable native Today path-card, Garden
chapter, Impact Path, Badge Gallery, and Badge Detail components now accept only typed presentation
data, copy, actions, locale direction, and reduced-motion state. They keep navigation, flags,
translation lookup, state mutation, and reward calculations outside the component boundary; adapt
from compact large-text layouts through wider viewports; and preserve named 48dp controls, live
status text, logical RTL rows, and tabular progress values. An incomplete recommended-badge hint now
falls back to the complete registry instead of hiding an item. The repository test and formatting
globs now collect TSX tests, and the TypeScript project includes those files. The complete suite passed
55 files / 792 tests with typecheck,
lint, formatting, and Git whitespace validation. Route mounting and implementation screenshots
remain pending; all consuming flags remain default-off.

**Growth Journey view-model checkpoint — 2026-09-05**: One pure bilingual adapter now converts the
active profile's immutable Growth projection into Today, Garden, Impact Path, exact 16-badge
Gallery, and Badge Detail presentation contracts. It keeps current Mangrove 48/60 visibly separate
from lifetime 108 and next station 120, derives every visible number from the supplied selectors,
preserves exact composite criteria, and exposes only contextual Path, unlocked-learning, or
already-assigned-task callbacks supplied by the guarded route. Candidate Arabic and English copy is
centralized and honestly marks pending human review/provenance. Eleven focused view-model and
resource-parity tests, typecheck, lint, formatting, and Git whitespace validation passed; no route
or feature flag was activated.

**R002b default-off implementation checkpoint — 2026-09-05**: The branch contains all eleven
expansion surfaces plus the private five-Leaf League compatibility surface, nine guarded nested
route files, and the gated `/league` Child root. The core checkpoint `895af72` passed 76 files / 967
tests; final hardened runtime/test checkpoint `4adcb73` passes 78 files / 989 tests. Local untracked
browser-proxy evidence includes valid
390×844 captures for Child Today, Garden chapter, Impact Path, Badge Gallery, Badge Detail, Parent
Progress, Shared Growth, and Parent Shared Garden settings, plus one R002a Parent Home regression
capture and a private League capture. The eight nonblocked expansion surfaces above now have Arabic
and English 320/360/390/430/768 matrices plus synthetic 200%-text and reduced-motion evidence with
zero document horizontal overflow. Learning Story and Accessible Learning do not have live captures
because the normal fixture truthfully stops before station 132; the combined Child Reveal has no
live capture because the task-approval path remains fail-closed until all private League, Challenge
Leaf, and Family Reward source receipts are authoritative. The private League matrix remains
partial. Commits `38ff275` and `680f91b` harden Shared Garden recovery and Reveal/Impact focus
without changing product authority. All eight flags remain off. Physical Android/TalkBack/Back/IME/
OS font scaling and every named content, privacy, provenance, and human review remain open, so
release activation stays blocked.

**Private League compatibility checkpoint — 2026-09-05**: The new presentation consumes only a
provenance-tagged `approved_synthetic_reset_summary` and sends it through the strict League privacy
projector. It invents no task history. Salem's 4/5→5/5 projection requires the exact canonical task,
Seed receipt, Mangrove receipt, canopy action/origin, and Green-event action/scope/origin. The native
screen preserves RTL Leaf order, compact/large-text reflow, safe error/empty return, the physical
`الدوري | حديقتي | اليوم` order, and the separate identities of private League, Green Circle, and
Shared Growth. Focused League/navigation coverage passes 46 tests; final hardened runtime/test
checkpoint `4adcb73` passes the complete 78-file / 989-test suite. A 390×844 Arabic capture plus Arabic
320/360/200%-text and English 390/430/768 samples are retained as local untracked evidence.

## 2026-09-05 R002a Compatibility Implementation Window

**Integration owner**: `/root`

**Worktree and branch**:
`/home/smyk/projects/Ghaf-r002-reconciliation-20260904` on
`integration/r3-r002a-implementation-20260904`, based on verified R001 evidence head `76fa682` from
`origin/integration/r3-r001-implementation-20260904`.

**Gates**:

- **R002A COMPATIBILITY SCOPE APPROVED — IMPLEMENTATION AUTHORIZED**
- **R002B PRODUCT EXPANSION — DECISIONS OPEN — IMPLEMENTATION BLOCKED**

**Purpose**: Refresh the R002 design inventory, freeze the verified behavioral baseline, and apply
the approved Soft Geometric presentation to compatibility-safe Parent, task, review, Child, and
Garden surfaces. R001 Welcome and Parent onboarding remain frozen regression baselines. The six
divergent historical commits remain unapplied, and the original worktree's untracked R002 exports
remain read-only evidence.

**Completion record — 2026-09-05**: The implementation reservations below were completed and
returned through `a0539e9`. The isolated branch contains separate characterization, Parent Home,
Parent Tasks/Builder, Child task, Parent review/support, Child follow-up, compatible Garden, and
cross-slice quality/visual commits, followed by a bounded Parent large-text containment fix.
Focused tests passed 141/141 and the full suite passed 541/541;
typecheck, lint, formatting, Expo configuration, web export, Android JavaScript export, route/reset
checks, and Git whitespace validation passed. Browser evidence covers Arabic and English plus
320, 360, 390, 430, and 768 widths. Physical Android is `BLOCKED` because no ADB device is listed
and no Android SDK is configured in this environment; named human reviews remain `NOT RUN`. All
temporary reservations are released by the release-documentation commit; the historical table is
kept as an audit of the completed file boundaries.

| Exclusive writer                                                          | Exact reserved boundary                                                                                                                                                                                                                                               | Handoff condition                                                                                                                                                                           |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/root/r002a_orchestrator` and delegated documentation writers            | `PRODUCT.md`, `PROTOTYPE_LIMITATIONS.md`, `DESIGN.md`, `DEMO_RUNBOOK.md`, `specs/003-family-growth-garden/{spec.md,contracts/acceptance-contract.md,design-intake/release-gate.md}`, and newly tracked R002a intake metadata/specifications only                      | Record the split gates and compatibility authority without changing product semantics or importing raw exports; return files for integration review                                         |
| `/root/r002a_orchestrator/r002_inventory` — read-only intake audit        | Original untracked `docs/design/stitch/releases/ghaf-r002/**` only                                                                                                                                                                                                    | Return objective counts, dimensions, hashes, titles, viewport metadata, and candidate classifications; make no file changes                                                                 |
| `/root/r002a_orchestrator/parent_architecture` — read-only behavior audit | `app/parent/**`, relevant components, state, services, and tests                                                                                                                                                                                                      | Identify every existing Parent Home capability and selector without changing files                                                                                                          |
| `/root` — specification integration and commits                           | `AGENTS.md`, `README.md`, `CODEX_IMPLEMENTATION_PROMPT.md`, `docs/README.md`, Growth-only prompt/content records, `TEAM_OWNERSHIP.md`, Feature 003 `plan.md`, `tasks.md`, readiness checklists, historical gate notices, exact staging, validation, and local commits | Keep R002a and R002b gates independent, serialize shared files, validate each slice, and never push without separate authorization                                                          |
| Future R002a characterization writer                                      | New `tests/r002a-behavior-characterization.test.ts` only                                                                                                                                                                                                              | Freeze task ID, zero-reward submission, approval consequences/idempotency, retry, League, canopy, Family Reward, access, voice, reset, and profile-isolation behavior before visual changes |
| Future Parent Home UI writer                                              | `app/parent/index.tsx`, new `src/components/r002a/parent/**`, and new `tests/r002a-parent-home.test.ts` only                                                                                                                                                          | Recompose `/parent` from live selectors, preserve every reachable behavior, and omit unsupported screenshot-only values rather than hard-code them                                          |

Shared runtime files such as `app/_layout.tsx`, `src/i18n/resources.ts`, and
`src/design/tokens.ts` remain reserved to `/root`. No worker may edit R001 routes, dependencies,
fixtures, services, models, state, raw exports, or another worker's boundary. R002b Impact Path,
badges, learning, Parent Progress, Shared Growth changes, combined RevealBundle changes, and
cumulative progression remain blocked.

## 2026-09-04 Revision 3 and R001 Documentation Reconciliation Window

**Integration owner**: `/root`

**Worktree and branch**:
`/home/smyk/projects/Ghaf-r002-reconciliation-20260904` on
`integration/r3-r001-implementation-20260904`, based on documentation checkpoint `b9f01ef2` and
behavioral baseline `a6ca21a6`.

**Purpose**: Reconcile the current user-authoritative Revision 3 product baseline and the approved
R001 Parent-onboarding partial release into the remote-head canonical documentation before any new
runtime work. The remote access, private five-Leaf League, Family Reward, synthetic voice,
privacy/profile isolation, and Parent-authorized reset implementation remains behavioral evidence
that must be preserved rather than overwritten by the six divergent local commits.

**Historical gate, superseded on 2026-09-05**: this window blocked all R002 runtime work and did not
approve an export, post-R001 route, component, asset, dependency, test, or runtime change. The
current independent gates are recorded in the R002a window above.

| Exclusive writer                                                                                                 | Exact reserved boundary                                                                                                                                                                                                                                                                                                                                                                                         | Handoff condition                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/root/r3_preflight` — orchestration and ownership record — **released**                                         | `TEAM_OWNERSHIP.md` only                                                                                                                                                                                                                                                                                                                                                                                        | Recorded the documentation, domain, store, and UI-foundation handoffs; released the file to the integration owner before font/configuration and route integration                                                                                                                               |
| `/root/r3_preflight/r3_product_reconcile` — product/specification reconciliation                                 | `AGENTS.md`, `PRODUCT.md`, `RESEARCH_BASIS.md`, `DESIGN.md`, `DESIGN_DIRECTION.md`, `PROTOTYPE_LIMITATIONS.md`, `README.md`, `CODEX_IMPLEMENTATION_PROMPT.md`, `DEMO_RUNBOOK.md`, `docs/README.md`, `docs/GHAF_GROWTH_JOURNEY_PROMPT_PACK/**`, `docs/content/**`, `docs/architecture/adr/0002-impact-path-projection.md`, and `specs/003-family-growth-garden/**` except `design-intake/revision-3-proposal/**` | Reconcile with targeted patches against the remote baseline; preserve implementation/test facts; keep R001 narrow and later runtime blocked; return exact changed files and validation evidence without committing                                                                              |
| `/root/r3_preflight/r001_access_domain` — tests-first Parent-onboarding controller — **released after QA fixes** | `src/features/access/index.ts`, `src/features/access/parentOnboarding/**`, and new focused test file `tests/parent-onboarding-controller.test.ts`; preserve the integration owner's required service-contract/model layering edits                                                                                                                                                                              | Prove an old session generation and its reauthentication proofs remain invalid after terminate-and-reuse; preserve unrelated sessions/proofs and rerun access/voice/League/Reward/reset regressions; no store, route, UI, registry, config, documentation, or commit                            |
| `/root/r3_preflight/r001_ui_foundation` — R001 native design foundation — **released after integration review**  | `src/design/tokens.ts`, `src/components/primitives.tsx`, `src/components/access/**`, and new focused test file `tests/r001-design-foundation.test.ts` only                                                                                                                                                                                                                                                      | Reconcile reusable R001 tokens, Alexandria/Readex role names, native RTL/LTR primitives and controls, responsive access shell, botanical/icon components, and reduced-motion-aware success sheet; no routes, state, services, registry, i18n resources, package/config, assets, docs, or commit |
| `/root` — R001 integration, routes, and commits                                                                  | `package.json`, `package-lock.json`, `app.config.ts`, `app/_layout.tsx`, `app/index.tsx`, `app/role.tsx`, `app/access/parent/**`, `app/parent/_layout.tsx`, `src/i18n/**`, the service registry, `src/state/usePrototypeStore.ts`, `tests/operator-demo-flow.test.ts`, `tests/r001-onboarding-flow.test.ts`, `tests/parent-onboarding-store.test.ts`, staged-file review, and final commits                     | Install/load the approved fonts, integrate guarded onboarding authority and the seven R001 compositions, preserve the ten remote routes and later-screen gate, run the complete R001 validation, and create only cohesive commits after each GREEN boundary                                     |

No product/specification writer in this window may edit `app/**`, `src/**`, `tests/**`, `assets/**`,
`package.json`, `package-lock.json`, `app.config.ts`, generated output, the untracked R002 directory
in the original worktree, or remote state. The access/domain reservation above is the sole scoped
exception and remains excluded from the documentation commit. The six local-only commits remain
candidate evidence and must not be cherry-picked. All writers must preserve concurrent work and may
not revert another writer's changes.

### Documentation checkpoint handoff

The product/specification reconciliation boundary and `TEAM_OWNERSHIP.md` orchestration boundary
were released to `/root` after the documentation handoff. The checkpoint modifies only canonical
documentation and adds the approved R001 release gate plus non-runtime Growth Journey planning and
content artifacts. Its validation passed Markdown formatting, internal relative-link resolution,
unique task IDs `T001`–`T158`, the exact 16-badge registry, R001 seven-screen inventory and authority
markers, `git diff --check`, preservation of the Revision 3 proposal package, and confirmation that
all six divergent local commits remain unapplied. The access/domain worker above remains separately
reserved, and the UI foundation worker begins only after this documentation commit. Their disjoint
source/test changes must enter separate implementation commits after integration review.

### R001 implementation integration boundary

`/root` exclusively owns `package.json`, `package-lock.json`, `app.config.ts`, `app/**`,
`src/i18n/**`, the service registry, store integration, route guards, and final commits. The UI
foundation worker may define the approved font-family roles but must not install or load font
packages; the integration owner performs that serialized dependency/configuration step while
preserving `expo-audio`. Neither implementation worker may touch R001/R002 design exports or begin a
post-R001 route.

#### R001 access/domain handoff

The access/domain boundary was released to `/root` after adding a private
`ParentOnboardingController`, safe onboarding model/policy projections, and the narrow
identity-validated `terminateParentSession` operation. The focused access/onboarding suite passed 43
tests; the broader access, voice, League, Family Reward, prototype-state, and reset batch passed 149
tests. Typecheck and lint passed before the concurrent UI RED test was added; lint, targeted
formatting, and `git diff --check` passed after the final expired-session cleanup. The full suite's
only four failures were the integration owner's intentionally RED R001 route/resource/layout tests,
not domain regressions. No file was staged or committed by the worker.

The boundary was re-opened after independent read-only QA found two commit-blocking lifecycle gaps:
deterministic ID reuse could make an old session object match a new stored generation, and
unconsumed reauthentication proofs could survive termination into that reused generation. The
worker owns tests-first generation binding and proof cleanup while preserving the integration
owner's required `SyntheticAccessService` termination contract change.

The re-opened boundary was released after the three lifecycle tests went RED then GREEN. Session
resolution now binds to the immutable issued/expiry generation, termination removes only proofs
belonging to that exact Parent session identity, unrelated sessions/proofs remain valid, and
controller cleanup surfaces a termination failure. The final focused eight-file regression batch
passed 152 tests; targeted ESLint, Prettier, and `git diff --check` passed. Global type/lint checks
were deferred only while the concurrent UI worker's import graph was incomplete.

#### R001 store integration checkpoint

The integration owner added the safe onboarding projection/actions to
`src/state/usePrototypeStore.ts` with focused coverage in
`tests/parent-onboarding-store.test.ts`. The test was RED 4/4 before the integration and GREEN 4/4
afterward. The store owns one controller backed by the existing shared access registry, never
exposes the raw Parent session, changes locale and legacy role only after successful capability
completion, preserves household/Child fixtures, and invalidates onboarding authority during the
existing Parent-gated reset. Final R001-A validation and commit were held until the re-opened
session-generation/proof fixes passed the 152-test regression batch recorded in the access/domain
handoff. This store boundary is now ready for the integration owner's final R001-A validation.

#### R001 design-foundation handoff

The UI boundary was released after adding scoped R001 palette, typography, radii, shadow, motion,
logical RTL/bidi helpers, controlled native access controls, a responsive safe-area/scroll/keyboard
shell, code-native icons and botanical avatars, and the reduced-motion-aware success surface. The
integration review restored every legacy palette, radius, shadow, motion, Card, and unbranded
primitive value so the preserved ten-route UI is not redesigned by this release; a focused
regression test now locks that boundary. The botanical picker uses the authoritative underscore
`ChildTreeAvatarId` values and maps them internally to icon names.

The final five-file focused batch passed 43 tests across the R001 foundation, existing bilingual
typography, localization, accessibility, and access suites. Global typecheck, repository lint and
format checks, targeted no-cache ESLint, and `git diff --check` passed after mechanically formatting
the final avatar focus-state fix. Independent read-only QA found no remaining functional commit
blocker. No file was staged or committed by either worker. Route composition screenshots, physical
Android, TalkBack, 200% font scale, and success-sheet focus restoration remain `NOT RUN` until the
integration owner completes R001 routes. The integration owner retains exclusive ownership of the
Expo-compatible font packages/configuration, root font loader, transparent success route, Android
Back behavior, and focus restoration.

### R001-C route integration reservation and handoff

`/root` reserved the shared navigation and route-test boundary. Two disjoint route writers owned
Welcome through verification and family setup through success, while `/root/r001_routes` performed
read-only integration QA. The writers preserved the remote behavioral baseline and did not touch
R002, later Revision 2/Growth screens, the shared store, services, dependencies, or canonical
product authority.

The route writers released all seven R001 route files to `/root` after TypeScript, targeted ESLint,
targeted Prettier, Git whitespace validation, and 88 focused onboarding, access, and operator-flow
tests passed. `/root` now owns their integration, reference comparison, responsive and
accessibility checks, complete repository validation, and final cohesive commits. Physical Android,
TalkBack, native keyboard/IME, and native font-scale evidence remain separate gates and may not be
inferred from browser or source checks.

#### R001 final validation and evidence handoff — 2026-09-05

The integration owner completed R001-C in `4b47394` and reduced the direct font bundle to the
approved weights in `f4451c1`. The final focused audit passed 79/79 tests, and the complete suite
passed 29 files / 482 tests. Typecheck, lint, maintained-file formatting, Expo dependency checks,
Expo Doctor 21/21, public Expo config, web and Android JavaScript exports, the exact 16-product-route
inventory, and Git whitespace validation passed.

All seven Arabic R001 surfaces passed scoped composition comparison against their canonical PNGs at
390×844. Full web-proxy journeys passed at 320×568 Arabic, 430×932 English LTR, and 800×1280 Arabic,
including natural scrolling, reduced motion, deterministic offline presentation, modal
accessibility containment, both Success exits, and post-exit browser Back. Physical Android,
TalkBack, native keyboard/IME, native safe areas, real connectivity loss, and 130%/200% OS font
scaling remain `NOT RUN`; browser/source evidence did not upgrade them.

The evidence owner added the bounded R001 validation record, linked it from the root runbook and
documentation map, and updated only T143–T149. The selected ten screenshots under
`output/playwright/r001-batch-1/` are the seven `release-*` 390×844 captures plus one 320×568, one
430×932 English, and one 800×1280 capture; duplicate and generated comparison boards remain
untracked. This documentation boundary is released to `/root` for the evidence commit after final
Markdown, link, staged-path, and whitespace review.

No R002 or Growth runtime work occurred during that historical window. The original worktree and
its untracked R002 intake remained unchanged. Its blanket gate was later superseded by the
independent R002a compatibility and R002b product-expansion gates recorded above.

## Decision Record

| Item                         | Decision                                                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Product direction            | APPROVED — Family Growth Garden                                                                                                                                    |
| Implementation authorization | USER-AUTHORIZED deterministic P0; implementation begins only after the Feature 003 checklist and cross-artifact gates pass                                         |
| Technical baseline           | Preserve and adapt the locally/web-validated Feature 002 Expo/TypeScript foundation; Android/human gates did not pass                                              |
| Required path                | Deterministic local P0 with prepared synthetic media and assistant fixtures                                                                                        |
| Competition AI path          | One real synthetic-input model transformation when an approved secure server boundary exists; deterministic fallback always remains                                |
| Demo household               | Synthetic Parent plus Salem (9) and Alya (11)                                                                                                                      |
| Social surface               | Seeded, aggregate, cooperative cousin/family circle only                                                                                                           |
| Reward                       | Fixed, symbolic Seeds; never purchased, transferred, removed, or randomized                                                                                        |
| Garden                       | Ghaf, Samar, Sidr, date-palm, and mangrove landscape tracks; Ghaf remains brand hero                                                                               |
| Main demo task               | 12-Seed multi-step Green Impact recycling variant; general waste remains a separate Home Responsibility task with no circle credit                                 |
| Sensitive content            | Prayer, kinship, affection, food consumption, wellbeing, hygiene, disability-related routines, media, reflections, and Parent notes stay out of cross-family views |
| Validation status            | Feature 003 checks begin `NOT RUN`; Feature 002 passes do not transfer                                                                                             |

The product-direction decision authorizes specification work. It does not authorize implementation
outside an approved Spec Kit plan or permit a claim that Feature 003 is complete.

## Integration Owner

Member 1 coordinates shared configuration, dependencies, route integration, combined diffs, final
validation, and the physical Android build. This role does not allow silent overwrites of another
owner's active boundary.

Only the integration owner may merge shared configuration changes. A proposed dependency or route
change must identify the need, affected files, fallback, and validation cost before integration.

## Human Ownership

| Member                                        | Primary responsibility                                                                                                                 | Default write scope                                                                                                                                 | Cross-cutting duty                                                      |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Member 1 — Mobile and visual experience       | Expo routes, navigation, design tokens, Arabic/RTL integration, garden/tree visuals, motion, accessibility, Android build, integration | `app/**`, `src/components/**`, `src/design/**`, `src/i18n/**`, UI feature folders, visual assets; shared config only in reserved integration window | Verify child/parent visual modes and physical Android demo              |
| Member 2 — AI and application logic           | Task/reward schemas, state machine, deterministic assistant providers, garden/circle calculations, reset, focused automated tests      | `src/models/**`, `src/services/**`, `src/state/**`, `src/utils/**`, task/reward/assistant/garden logic and tests                                    | Enforce fixed reward, idempotency, privacy filtering, provider fallback |
| Member 3 — Product, content, QA, presentation | Spec Kit product artifacts, bilingual task catalog, behavioral rules, cultural review coordination, manual QA, runbook, pitch          | `specs/003-family-growth-garden/**` product artifacts, named root documents, demo fixtures/copy through handoff                                     | Own evidence ledger; obtain Arabic/cultural/faith review status         |

Implementation copy in `src/i18n/**` remains inside Member 1's file boundary. Member 3 prepares
reviewed bilingual copy and hands it off rather than editing concurrently.

Member 2 owns automated test files during active logic work. Member 3 owns manual evidence and the
runbook. Reassign explicitly if the work period changes.

## Required Cross-Cutting Reviews

Before Feature 003 is called demo-accepted, record named status for:

| Review                               | Owner                                  | Required evidence                                                      |
| ------------------------------------ | -------------------------------------- | ---------------------------------------------------------------------- |
| Arabic and RTL                       | Member 1 + named fluent reviewer       | Arabic/English walkthrough on target Android build                     |
| Emirati culture and phrase pack      | Member 3 + named UAE cultural reviewer | Reviewed task/phrase IDs and corrections                               |
| Faith content                        | Member 3 + qualified local reviewer    | Scope and wording review; private/nonpunitive confirmation             |
| Child safeguarding and AI boundaries | Member 2 + Member 3                    | Intent allowlist, prohibited-output tests, synthetic-only media review |
| Accessibility                        | Member 1                               | Font scale, touch, contrast, screen-reader labels, reduced motion      |
| Sustainability claims                | Member 3                               | Source for task wording; no unsupported impact conversion              |
| Demo and reset                       | Integration owner                      | Named Android build, exact reset, timed human rehearsals               |

If a reviewer is not available before the competition build, remove or visibly label the unreviewed
sensitive content rather than guessing.

## Project-Agent Write Scopes

Project-scoped Codex agents are helpers, not owners. Reserve their boundaries before use.

| Agent                     | Allowed write scope                                                                         | Never overlaps with                                   |
| ------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `ghaf-orchestrator`       | Feature 003 coordination artifacts, root guidance, explicitly reserved shared configuration | Any human editing those shared files                  |
| `ghaf-product-spec-agent` | Feature 003 `spec.md`, checklists, research/task content assigned by Member 3               | Orchestrator or Member 3 in the same artifact         |
| `ghaf-ui-expo-agent`      | Approved routes, UI components, design, i18n, garden SVG/motion                             | Member 1 or another UI agent in the same area         |
| `ghaf-ai-prototype-agent` | Models, services, store, rewards, assistant fixtures, circle filtering, tests               | Member 2 or another logic agent in the same area      |
| `ghaf-demo-qa-agent`      | Focused tests only when reserved; `DEMO_RUNBOOK.md`                                         | Member 2 in the same tests or Member 3 in the runbook |

Run no more than four agents concurrently. Independent read-only research and review may overlap;
writes to the same file, dependency set, routes, shared configuration, task schema, or bilingual
resource may not.

## Recommended Feature 003 Work Packages

| Package                    | Owner                        | Outcome                                                                                                                                           | Dependency                    |
| -------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| F003-A Specification       | Member 3                     | Approved spec, plan, tasks, screen/state contracts                                                                                                | Constitution and product docs |
| F003-B Domain model        | Member 2                     | Task, recognition mode, valid routine phase, `visibilityScope`, `circleEligible`, assignment, completion, reward, garden, circle, assistant types | Approved spec                 |
| F003-C Deterministic state | Member 2                     | Seed fixtures, no-loss reward, idempotent approval, reset, privacy-before-projection filters                                                      | F003-B                        |
| F003-D Visual foundation   | Member 1                     | Parent/Child modes, garden components, task/reward primitives, RTL                                                                                | Approved design + F003-B      |
| F003-E Parent flow         | Member 1 + Member 2 handoff  | Create/refine/review/assign task                                                                                                                  | F003-C/D                      |
| F003-F Child flow          | Member 1 + Member 2 handoff  | Task/Coach/optional evidence/optional reflection/submit                                                                                           | F003-C/D                      |
| F003-G Confirmation/growth | Member 1 + Member 2 handoff  | Praise, 12 Seeds, Mangrove growth, one eligible canopy leaf and circle action                                                                     | F003-E/F                      |
| F003-H Content review      | Member 3                     | Bilingual categories, task catalog, phrase/safety review                                                                                          | F003-A                        |
| F003-I Demo acceptance     | Integration owner + Member 3 | Android build, reset, timing, comprehension, disclosure                                                                                           | Integrated P0                 |

Member 1 and Member 2 must reserve exact boundary files for each handoff; the table does not permit
simultaneous edits to the same feature folder.

## Reservation Protocol

Record before work starts:

```text
Work period: date/time or session label
Owner: Member/agent
Feature/task IDs: F003-T0XX
Write scope: exact files/directories
Inputs: spec/design/content version
Expected handoff: outcome and validation
```

On completion, record files changed, checks, manual evidence, content review, known gaps, readiness,
and boundary release.

## Active Feature 003 Codex Window

**Work period**: 2026-08-26 Codex implementation session
**Integration owner**: `/root` acting for Member 1
**Inputs**: approved root handoff dated 2026-08-26 and `specs/003-family-growth-garden/`
**Preservation rule**: existing dirty-worktree files, Feature 001/002 artifacts, historical
screenshots, and open native/human evidence remain untouched unless a Feature 003 task explicitly
names the current root document.

| Phase / task IDs                         | Exclusive writer                                                                       | Reserved boundary                                                                                                                                   | Handoff condition                                                                        |
| ---------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| T001–T008 setup and artifact gates       | `/root` orchestrator; independent reviewers are read-only except their named checklist | `TEAM_OWNERSHIP.md`, `specs/003-family-growth-garden/checklists/**`, prepared-fixture provenance files                                              | Checklist and analysis have no unresolved P0 issue                                       |
| T009–T017 RED tests                      | `ghaf-demo-qa-agent`                                                                   | `tests/**` only                                                                                                                                     | Intended Feature 003 failures recorded; boundary released before source work             |
| T018–T029 domain and deterministic state | `ghaf-ai-prototype-agent`                                                              | `src/models/**`, `src/features/{tasks,rewards,garden,circle,assistants}/**`, `src/services/**`, `src/state/**`                                      | Focused policy/store suite GREEN; public contracts handed to UI owner                    |
| T030–T035 design foundation              | `ghaf-ui-expo-agent` after model handoff                                               | `src/i18n/**`, `src/design/**`, `src/components/**`, prepared asset resolver                                                                        | Typecheck and component-level inspection pass; no concurrent domain edits                |
| T037–T077 route stories                  | Same domain/UI owners in task order, one owner per named file                          | Exact files named by each task; shared store and Parent route windows are sequential; T067 reserves `app.config.ts` for predictive Back integration | Story-specific GREEN evidence and released boundary                                      |
| T078–T090 integration and review         | `/root` orchestrator; fresh QA/design reviewers read-only unless assigned a finding    | Whole-tree integration, root `DEMO_RUNBOOK.md`, final ownership handoff                                                                             | Automated/web evidence recorded; unavailable native/human gates stay `BLOCKED`/`NOT RUN` |

### 2026-08-27 recovery reservations

The laptop shutdown released the interrupted agent processes. The recovery window preserves all
completed domain work and replaces the abandoned zero-byte component stub in place.

| Feature/task IDs                                                       | Exclusive writer        | Exact write scope                                                                                                                                                                                                                                                                                                         | Expected handoff                                                                                                                 |
| ---------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| T032–T034                                                              | `f003_ui_foundation`    | `src/components/primitives.tsx`, `src/components/journey.tsx`, `src/components/LanguageSwitcher.tsx`, `src/components/prototype.tsx`, `src/components/demoAssets.ts`, `src/components/family-growth/TaskPanels.tsx`, `src/components/family-growth/AssistantPanels.tsx`, `src/components/family-growth/PreparedMedia.tsx` | Token-only, bilingual/RTL-safe shared components with scoped checks                                                              |
| T035                                                                   | `f003_visuals`          | `src/components/family-growth/GardenLandscape.tsx`, `src/components/family-growth/FamilyCanopy.tsx`, `src/components/family-growth/CircleProgress.tsx`                                                                                                                                                                    | Code-native, privacy-safe static visual system with scoped checks                                                                |
| T061 recovery follow-up                                                | `recovery_visuals`      | `src/components/family-growth/GardenLandscape.tsx` only, after releasing the static T035 boundary                                                                                                                                                                                                                         | Optional 650ms transform/opacity cause-effect reveal with an immediate equivalent reduced-motion state                           |
| T037/T045/T051/T057/T063/T072                                          | `f003_story_tests`      | `tests/parent-task-flow.test.ts`, `tests/child-task-flow.test.ts`, `tests/parent-check-in-flow.test.ts`, `tests/garden-circle-flow.test.ts`, `tests/operator-demo-flow.test.ts`, `tests/parent-overview.test.ts`                                                                                                          | Requirement-grounded tests that fail only for missing story integration; no production edits                                     |
| T036–T090 integration                                                  | `/root`                 | `app/**`, `app.config.ts`, `src/utils/navigation.ts`, remaining named story components, store/service integration windows, Spec Kit evidence, and root `DEMO_RUNBOOK.md`                                                                                                                                                  | Integrated ten-route P0, full automated/web validation, and truthful native/human gate status                                    |
| T074/T089 safety remediation                                           | `assistant_safety_fix`  | `src/features/assistants/policy.ts`, `tests/assistant-safety.test.ts` only                                                                                                                                                                                                                                                | Prohibited Parent/Child language variants fail closed; focused and full tests pass                                               |
| T075/T076 summary correction                                           | `summary_editor_fix`    | `src/components/family-growth/ParentPatternSummary.tsx`, `tests/parent-overview.test.ts` only                                                                                                                                                                                                                             | Parent can locally edit a bounded synthetic fact; unsafe edits fail closed with focused tests                                    |
| T047/T053 adjustment requests                                          | `prospective_actions`   | `src/models/familyGrowth.ts`, `src/state/usePrototypeStore.ts`, `tests/child-task-flow.test.ts`, `tests/parent-check-in-flow.test.ts` only                                                                                                                                                                                | Child/Parent prospective adjustment requests persist without lifecycle, Seed, or growth mutation                                 |
| T068 resilient fixtures                                                | `fixture_fallbacks`     | `src/components/family-growth/PreparedMedia.tsx`, `src/features/circle/projection.ts`, `app/circle.tsx`, `src/i18n/resources.ts`, `tests/garden-circle-flow.test.ts` only                                                                                                                                                 | Image load failure and unavailable circle data render honest local fallbacks with no private records                             |
| T044/T050/T056/T062/T070/T071/T077/T078/T082–T086/T090 evidence ledger | `/root/evidence_ledger` | `specs/003-family-growth-garden/checklists/{story-evidence,web-proxy,source-scan,red-green-evidence,design-audit}.md`, root `DEMO_RUNBOOK.md`, and `TEAM_OWNERSHIP.md` final evidence/release sections only                                                                                                               | Truthful separation of automated, web, native, human, and historical-process evidence; boundary returns to `/root` after handoff |

All recovery writers are aware that other work exists in the shared worktree. They must preserve
and accommodate it, never revert it, and release their exact boundary after reporting checks.

### 2026-08-27 convergence reservations — closed

These historical reservations superseded the broad T036–T090 integration row while convergence was
active. Their boundaries were disjoint and are now released.

| Owner                   | Exact write scope                                                                                                                                                                                                                                                                                                                                                        | Excluded/coordination boundary                                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain_convergence`    | `src/models/**`, `src/features/tasks/**`, `src/features/assistants/policy.ts`, `src/services/mock/index.ts`, `src/state/usePrototypeStore.ts`, `src/components/family-growth/ParentCheckIn.tsx`, and related domain tests `tests/{task-lifecycle,reward-matrix,assistant-safety,prototype-state,parent-check-in-flow,mock-core-flow,parent-overview}.test.ts`            | Does not edit routes, i18n, evidence, Spec Kit artifacts, package files, or shared integration files; coordinates any public-contract change with `/root` and `route_convergence`                        |
| `route_convergence`     | `app/child/index.tsx`, `app/child/task.tsx`, `app/parent/task/review.tsx`, `app/parent/check-in.tsx`, `app/parent/index.tsx` solely for the T095 Parent-resolution surface, `src/components/family-growth/ParentTaskComposer.tsx`, `src/i18n/**`, and route/localization tests `tests/{child-task-flow,parent-task-flow,operator-demo-flow,localization-parity}.test.ts` | Does not edit domain/store/mock policy, evidence, Spec Kit artifacts, package files, or other routes/shared integration files; the added Parent overview reservation ends immediately after T095 handoff |
| `/root`                 | All integrated Feature 003 implementation, Spec Kit, package, and final evidence files after the handoff below                                                                                                                                                                                                                                                           | Evidence files were exclusive until final release; `/root` now owns them for integration/commit                                                                                                          |
| `/root/evidence_ledger` | Historical final-evidence boundary: Feature 003 checklists, root `DEMO_RUNBOOK.md`, and `TEAM_OWNERSHIP.md` evidence/release sections                                                                                                                                                                                                                                    | **Released**; no file reservation retained                                                                                                                                                               |

If a needed change falls in another row, the current owner reports the finding and waits for a
handoff; it does not widen its scope.

**Convergence release update**: `domain_convergence` and `route_convergence` completed T091–T101,
reported focused and shared checks, and released every implementation/test boundary in their rows
back to `/root`. The verified/interrupted `domain_convergence` process retains no file ownership.
`/root` owns the integrated implementation and final review fixes. The final mounted reset replay is
GREEN, and `/root/evidence_ledger` releases its documentation boundary to `/root` with the handoff
below. No convergence, recovery, safety, route, or evidence writer retains a file reservation.

No reservation authorizes a dependency change, remote provider, commit, push, merge, deployment, or
history rewrite. A writer must be explicitly assigned before its phase begins and must not revert
another writer's edits.

## 2026-08-28 Professional MVP Audit Window

**Integration owner**: `/root`
**Completed read-only reviewers**: `/root/design_assessment_a` and
`/root/detector_assessment_b`
**Inputs**: Feature 003 specification, approved Living Family Garden direction, current dirty
worktree, and the final 2026-08-27 evidence baseline

| Owner / workstream                                                                                                                     | Exact reserved boundary                                                                                                                                                                                          | Handoff condition                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `/root/mvp_logic_review` (`domain_hardening`) — reference integrity, coherent alternatives, Guide decision state, and provider timeout | `src/state/usePrototypeStore.ts`, `src/services/mock/index.ts`, `src/features/tasks/{validation,lifecycle}.ts`, and `tests/{parent-check-in-flow,parent-task-flow,assistant-safety,task-lifecycle}.test.ts` only | RED evidence for each accepted defect, focused GREEN tests, exact changed-file report, then release to `/root`                               |
| `/root/child_flow_polish` — lifecycle-aware Child work and role handoff                                                                | `app/child/index.tsx`, `app/child/task.tsx`, `app/role.tsx`, and `tests/{child-task-flow,operator-demo-flow}.test.ts` only                                                                                       | Active assignment first, correct resume/submitted/recognized actions, concise Child composition, handoff state, focused checks, then release |
| `/root/garden_polish` — hierarchy and logical RTL accent                                                                               | `app/garden.tsx`, `src/components/family-growth/GardenLandscape.tsx`, and `tests/{garden-progression,garden-circle-flow}.test.ts` only                                                                           | Changed Mangrove remains dominant, four required tracks remain visible compactly, logical accent verified, focused checks, then release      |
| `/root` — Parent UX, integration, i18n, audit, and evidence                                                                            | All other `app/**`; all other `src/components/**`; `src/i18n/**`; `.impeccable/critique/**`; Feature 003 tasks/checklists; root `DEMO_RUNBOOK.md`; and this section                                              | Before/after critique, bilingual browser verification, full validation, and truthful native/human gates recorded                             |

Every writer is aware that other work exists in the same dirty worktree, must preserve and
accommodate it, must not revert another writer's edits, and must not widen its file boundary.
Package/dependency files remain outside every reservation. The historical Feature 001/002 and
user-owned diffs remain untouched.

**Professional audit release — 2026-08-28**: `mvp_logic_review`, `child_flow_polish`, and
`garden_polish` completed their focused RED/GREEN work and released every boundary to `/root`.
`/root` completed the Parent/integration confirm round, including the progressive Child definition
disclosure and specific unsafe-wording recovery. The settled worktree passed typecheck, lint,
format check, `git diff --check`, the Impeccable detector (`[]`), a 12-route Expo export, and 17
files / 305 tests. Arabic RTL and English LTR 390×844 journeys completed with zero browser errors,
zero horizontal overflow, correct 60/60 growth/circle consequence, and Arabic RTL reset surviving
six Back actions. All audit reservations are released; Android and named human gates remain
`BLOCKED`/`NOT RUN`.

## 2026-08-27 Evidence Handoff and Boundary Release

**Evidence owner**: `/root/evidence_ledger`
**Receiving integration owner**: `/root`
**Worktree**: dirty Feature 003 implementation checkpoint; no commit hash represents the evidence
state

| Item                               | Handoff result                                                                                                                                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Files changed                      | Feature 003 `story-evidence.md`, `web-proxy.md`, `source-scan.md`, `red-green-evidence.md`, `design-audit.md`; root `DEMO_RUNBOOK.md`; this final handoff section                                 |
| Fresh focused checks               | Review batch 4 files / 121; reset file 24/24; independent probes 23/23; final full suite 17 files / 289 tests                                                                                     |
| Convergence                        | T091–T101 and later adversarial/reset writer boundaries released after GREEN; T102 aligned Expo SDK 57 patches without a new library                                                              |
| Final review fix                   | Coach binding, safety/semantic guards, safe equivalent, retry, exact identity/referential checks, garden/circle behavior, and reset locale/direction/history defects fixed                        |
| Latest integration checks reported | `npm ci`, typecheck, lint, format, 289-test suite, Expo install/config/export, detector `[]`, and `git diff --check` passed; 12 static routes exported                                            |
| Web evidence                       | Final bundle completed Arabic RTL and English LTR ten-route journeys; duplicate/equivalent/retry mounted; reset `lang=ar`/RTL and six consecutive Back actions passed; 0 errors, 1 bundle warning |
| Design evidence                    | One token entry; zero measured token escapes across 15,659 TS/TSX lines; final detector `[]`; final Arabic/English and branch frames follow the Living Family Garden direction                    |
| Android                            | **BLOCKED**: `adb`, `emulator`, `sdkmanager`, and `java` were `NOT_FOUND`; `ANDROID_HOME` and `ANDROID_SDK_ROOT` were `NOT_SET`; no device or named build                                         |
| Human/named review                 | Five rehearsals, comprehension, Arabic/UAE culture, faith, safeguarding, sustainability, and accessibility all **NOT RUN**                                                                        |
| Historical process gap             | Required story RED runs T038/T046/T052/T058/T064/T073 were not recorded and remain **NOT RUN**; no retroactive RED was fabricated                                                                 |
| Integration readiness              | **Ready for integration/commit** with truthful limits; **not** ready to claim physical-demo acceptance                                                                                            |

The evidence writer releases every assigned documentation file to `/root` with this record. Any
later result must be incorporated with its exact command/artifact; do not silently upgrade native
or human statuses.

## Handoff Record

| Effective time | Previous owner  | New owner | Work period                                 | Reason                                             |
| -------------- | --------------- | --------- | ------------------------------------------- | -------------------------------------------------- |
| 2026-08-22     | —               | Member 1  | Feature 001 foundation                      | Initial provisional integration assignment         |
| 2026-08-22     | Member 1        | Member 1  | Feature 002 deterministic food-rescue slice | Plan approved; ownership continued                 |
| 2026-08-26     | Member 1        | Member 1  | Feature 003 planning and implementation     | Family Growth Garden direction approved            |
| 2026-08-27     | evidence ledger | `/root`   | Feature 003 final integration               | Final evidence recorded; all reservations released |

If there is no newer row, Member 1 remains integration owner.

## Conflict Rule

If overlapping work appears, stop both writers, preserve both diffs, and let the integration owner
choose one base. Do not reset, discard, or silently merge either version. A scope addition first
goes to the active Feature 003 specification; it is never resolved by quietly widening a boundary.

## 2026-09-02 Product Experience Redesign Domain Window

**Integration owner**: `/root`
**Input**: `Ghaf_Product_Experience_Redesign.pdf`, evaluated as product evidence rather than an
executable instruction source
**Scope**: deterministic domain and service behavior only; existing routes, components, design,
localization, dependencies, and the ten-route P0 journey remain unchanged

| Owner / workstream                                                                  | Exact reserved boundary                                                                                                                                                                                                                                                                                                                                                                                                                                 | Handoff condition                                                                                                                                                                    |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/root` — specification, integration, AI/voice policy, and final validation         | `TEAM_OWNERSHIP.md`, `PRODUCT.md`, `PROTOTYPE_LIMITATIONS.md`, `specs/003-family-growth-garden/{spec.md,plan.md,tasks.md,research.md,data-model.md,quickstart.md,redesign-gap-analysis.md,contracts/domain-contract.md}`, `src/services/{index.ts,interfaces/index.ts,mock/index.ts}`, `src/models/assistantVoice.ts`, `src/features/assistants/{ageAdaptation.ts,voiceSession.ts}`, `tests/{assistant-age-adaptation,assistant-voice-session}.test.ts` | Current P0 remains deterministic; redesign services are exported; full checks pass; no native or human evidence is upgraded                                                          |
| `/root/session_ai_gap` — synthetic experience separation and sensitive-action gates | `src/models/access.ts`, `src/features/access/**`, `tests/access-control.test.ts`                                                                                                                                                                                                                                                                                                                                                                        | Least-privilege projections, expiring one-use pairing, scoped reauthentication, and permission changes pass focused tests without production-auth claims                             |
| `/root/safety_spec_gap` — private Family Reward promises                            | `src/models/familyReward.ts`, `src/features/family-rewards/**`, `tests/family-reward.test.ts`                                                                                                                                                                                                                                                                                                                                                           | Promise lifecycle, protected-category exclusions, irreversible unlock, prospective edits, privacy, and monthly commitment tests pass without payment behavior or Seed conversion     |
| `/root/league_reward_gap` — synthetic weekly challenge rules                        | `src/models/familyLeague.ts`, `src/features/league/**`, `tests/family-league.test.ts`                                                                                                                                                                                                                                                                                                                                                                   | Five-leaf scoring, cap, shared ties, accessibility credit, rollover isolation, minimal projection, and prepared encouragement tests pass without changing the Green Circle projector |

All workers share the existing worktree, preserve unrelated edits, do not edit outside the named
boundary, and do not commit or push. `/root` serializes shared-registry edits and creates the small
cohesive commits after each focused handoff. Real credentials, biometrics, payment custody, real
Child data, real family sharing, and microphone/provider integration remain outside this window.

**Product experience redesign domain release — 2026-09-02**: all reserved boundaries are released
to `/root`. The six phased checkpoints are recorded in commits `eefc435`, `cd86631`, `e8e0630`,
`4e4d5ca`, `acfc02b`, `0f46eb3`, `533d74a`, `978257a`, and `44f5077`. The settled domain code adds
only deterministic access, private Family Reward, synthetic Family League, age-adaptation, and
synthetic voice contracts; no `app/**` file or authored route changed.

| Final evidence                    | Result                                                                                                                                                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Focused redesign suites           | **PASSED** — 5 files / 95 tests                                                                                                                                                                                    |
| Full static and behavioral checks | **PASSED** — typecheck, lint, format check, 23 files / 407 tests, and `git diff --check`                                                                                                                           |
| Route/P0 preservation             | **PASSED** — exactly 10 authored routes; zero `app/**` diff; the existing Zustand P0 aggregate and Green Circle projector remain separate                                                                          |
| Source boundary scan              | **PASSED** — no added block comments in TypeScript and no added network, secret, microphone, audio-capture, speech-provider, or biometric path                                                                     |
| Independent review                | `/root/session_ai_gap`, `/root/league_reward_gap`, and `/root/safety_spec_gap` found no remaining P0–P3 implementation defect after final corrections                                                              |
| Deferred evidence                 | Frontend redesign, physical Android, real microphone/provider behavior, production identity/invitation/payment/persistence, and named Arabic/UAE/safeguarding/accessibility review are **NOT RUN** or out of scope |
| Integration readiness             | **Ready for the domain-only branch checkpoint**; not ready to claim frontend, native-demo, production-security, or human-review acceptance                                                                         |

The Family Reward facade deliberately accepts strict Parent-authorized candidate event fixtures in
this local domain phase. A later frontend phase must derive those events from the authoritative
confirmation/Garden store. Registry recreation or reload may clear all new process-local ledgers;
this is not production persistence. No external security issue records were created because this
was not a sealed Codex Security scan and no issue destination was provided.

## 2026-09-02 Child Voice and Bilingual Typography Integration Window

**Integration owner**: `/root`
**Read-only reviewers**: `/root/child_voice_path`, `/root/typography_audit`, and
`/root/ui_test_audit`
**Scope**: authorize and implement one in-route, prepared-only Child voice rehearsal plus the
existing system-font bilingual typography refinement; no route, dependency, microphone, speech
provider, network service, or production identity is added

| Owner / workstream                                                                                         | Exact reserved boundary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Handoff condition                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/root` — specification, application adapter, Parent grant, Child presentation, typography, and validation | `TEAM_OWNERSHIP.md`, `DESIGN.md`, `PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`, `specs/003-family-growth-garden/{spec.md,plan.md,tasks.md,contracts/acceptance-contract.md,checklists/story-evidence.md,checklists/web-proxy.md}`, `src/design/tokens.ts`, `src/components/{primitives.tsx,LanguageSwitcher.tsx}`, `src/components/family-growth/{TaskPanels.tsx,ParentVoicePermissionPanel.tsx,SyntheticVoicePanel.tsx}`, `src/features/assistants/childVoiceController.ts`, `src/state/usePrototypeStore.ts`, `src/i18n/resources.ts`, `app/{child/task.tsx,parent/task/review.tsx}`, and `tests/{bilingual-typography,child-ai-presentation,child-task-flow}.test.ts` | Parent enablement is explicit and service-authorized; the Child receives age-adapted prepared Coach output and a fully labeled synthetic transcript rehearsal; both scripts use the shared typography resolver; focused/full checks pass; native and named-human evidence stays truthful |

The reviewers are read-only and hold no file boundary. All changes remain inside the exact reserved
files, preserve the ten-route journey and P0 counters, and are committed by `/root` as small,
validated slices. Real Child audio, camera or microphone permission, speech recognition, biometric
inference, live Child AI, and background capture remain prohibited.

## 2026-08-28 Repository Architecture and Developer Experience Cleanup

**Integration owner**: `/root`
**Read-only reviewers**: `/root/repo_architecture_audit`, `/root/docs_inventory_audit`, and
`/root/devex_audit`

| Owner / workstream                                                                                                | Exact reserved boundary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Handoff condition                                                                                                                                                                                                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/root` — repository structure, documentation, commands, artifact curation, and final naming/layering integration | `.env.example`, `.gitignore`, `.nvmrc`, `package.json`, `README.md`, `CONTRIBUTING.md`, `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, `PROTOTYPE_LIMITATIONS.md`, `DEMO_RUNBOOK.md`, `TEAM_OWNERSHIP.md`, `docs/{README.md,DEVELOPMENT.md}`, `docs/architecture/**`, `specs/003-family-growth-garden/{quickstart.md,checklists/story-evidence.md,checklists/web-proxy.md}`, `app/{child/task.tsx,parent/index.tsx}`, `src/components/family-growth/{AssistantPanels.tsx,TrustedAdultExit.tsx,ParentCheckIn.tsx,ParentTaskComposer.tsx}`, `src/services/index.ts`, the exact `.gitkeep` files recorded in this cleanup, and the exact generated/archive paths classified for removal | Current implementation status is truthful; active and historical documents are clearly indexed; one-command verification and reproducible launch paths pass; misleading dead-file names, direct presentation imports of concrete mock modules, and only confirmed generated, superseded, or empty-placeholder files are removed |
| `/root/runtime_launch_polish` — clean Arabic-first web bootstrap and cross-platform accessibility output          | `app/+html.tsx`, `app/index.tsx`, `src/components/{LanguageSwitcher.tsx,journey.tsx,primitives.tsx}`, `src/components/family-growth/{AssistantPanels.tsx,CircleProgress.tsx,FamilyCanopy.tsx,PreparedMedia.tsx,GardenLandscape.tsx,TaskPanels.tsx}`, and `tests/operator-demo-flow.test.ts` only                                                                                                                                                                                                                                                                                                                                                                              | Static HTML starts `ar`/RTL, deprecated web props no longer reach the DOM, native accessibility meaning remains explicit, dead exports inside `AssistantPanels.tsx` are removed, focused/full static checks pass, then release                                                                                                  |
| `/root/dead_code_cleanup` — retired compatibility surface                                                         | `src/components/prototype.tsx`, `src/state/usePrototypeStore.ts`, `src/services/index.ts`, and `src/services/mock/index.ts` only                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Confirmed unreachable component, retired selectors, and unused registry alias are removed without behavior changes; focused/full static checks pass, then release                                                                                                                                                               |

All writers know that the Feature 003 worktree already contains user-owned and prior-agent changes.
They must preserve those changes, use disjoint boundaries, and must not commit, push, move historical
Feature 002 evidence, change dependencies, or widen their reservation.

**Repository cleanup release — 2026-08-28**: all three read-only audits completed. The two bounded
implementation workers removed the retired compatibility surface, cleaned the cross-platform web
document/accessibility output, passed focused and shared checks, and released every file. `/root`
completed documentation indexing, architecture/ADR guidance, current-status corrections, command
consolidation, public service-facade imports, exact artifact curation, and final integration.

The settled cleanup checkpoint passed a clean `npm ci`, `npm run verify` (17 files / 305 tests,
typecheck, lint, maintained-file formatting, Expo dependency alignment, and 12-route export), strict
unused-code TypeScript, local-link validation across 55 Markdown files, `git diff --check`, and an
offline web-start smoke check with Arabic/RTL root HTML. The optional React Native DevTools binary
remains unavailable on this host because `libnspr4.so` is missing; Metro and the app endpoint were
usable. Physical Android and named-human gates remain unchanged. All cleanup reservations are
released to the integration owner; no cleanup subagent retains a write boundary.
