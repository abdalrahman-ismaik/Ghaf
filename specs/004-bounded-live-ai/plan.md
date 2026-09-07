# Implementation Plan: Bounded Live AI Drafting and Coach

**Branch**: `004-bounded-live-ai` | **Date**: 2026-09-07 | **Spec**: [spec.md](spec.md)

**Input**: Approved Feature 004 specification from `specs/004-bounded-live-ai/spec.md`

## Summary

Add three independently default-off capabilities to the existing Expo application: copy-only
Parent task drafting, one-turn age-banded Child Coach text, and ages-12–14 foreground
push-to-talk/transcript review. Extend the current models, service registry, Zustand commands,
Parent task composer, Child task screen, permission flow, and reference Cloudflare Worker rather
than reviving the Feature 002 mission model. Every remote seam has a deterministic same-attempt
fallback; models cannot alter task, Seed, Garden, Circle, League, Family Reward, badge, or learning
authority. Development uses synthetic inputs and fake providers only. All flags remain false and
deployment, real provider execution, real Child data, and release activation remain blocked.

## Technical Context

**Language/Version**: TypeScript 6.0 in strict mode; Node.js 22.13+; React 19.2; React Native 0.86
through Expo SDK 57

**Primary Dependencies**: Existing Expo Router, Expo Audio, React Native `StyleSheet`, Zustand 5,
Zod 4, i18next/react-i18next, Cloudflare Workers AI binding, Vitest, ESLint, and Prettier. Add only
Expo FileSystem for explicit cache-audio deletion and Expo Crypto for native/web random 128-bit
request and binding identifiers, both at Expo SDK-compatible versions.

**Storage**: Existing schema-versioned in-memory Zustand prototype state and device-local family
directory remain authoritative. F4 accepted wording may enter the existing private task draft.
F5 response, audio, and transcript state is ephemeral and must be cleared on terminal display,
delete, route/task/profile/grant change, background, sign-out, reset, timeout, or failure. Reference
gateway controls use injected replay/rate interfaces; no production persistence is added.

**Testing**: Vitest contract, pure-policy, service, Worker, store, reset, source, and component-flow
tests using synthetic fixtures and fake network/media bindings; TypeScript, Expo ESLint, Prettier,
Expo dependency/config validation, secret/log scan, static web export, Android JavaScript export,
and later named physical Android/human gates

**Target Platform**: Android is authoritative for real push-to-talk evidence; iOS is compatibility;
web remains a secondary visual and deterministic fallback surface. Cloudflare Worker code is a
non-deployed reference boundary.

**Project Type**: One existing Expo/React Native application plus one existing reference Worker;
no second app, production backend, account system, analytics pipeline, or new screen route

**Performance Goals**: Flag-off startup and task flows produce zero new network calls. F4 client
deadline is 2.5 seconds, Child text 1.8 seconds, and transcription 4 seconds after capture. A
timeout/failure returns the prepared path during the same user attempt. Only one Child request or
voice operation may be pending per profile.

**Constraints**: Arabic-first RTL/English parity; synthetic data/media only during implementation;
no client secret; no open Child chat; no free text below age 12; no real voice below age 12; no
background recording; no raw audio to the Coach model; no provider history/tools/retries; strict
unknown-key rejection; all flags false; unchanged deterministic reset and P0 journey

**Scale/Scope**: One synthetic household and current reviewed task catalog. Four initial F4
archetypes, seven bounded Coach intents, three age bands, one terminal result, one foreground voice
clip capped at 15 seconds/256 KiB, and operation-specific request/rate/budget contracts. This is a
competition prototype, not a multi-tenant production service.

## Constitution Check

_Gate evaluated before research and rechecked after design._

| Principle                     | Plan evidence                                                                                                    | Result |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------ |
| I. MVP Prototype First        | Default-off reference implementation, synthetic-only evidence, no deployment or production claim                 | PASS   |
| II. One Complete Journey      | Existing Feature 003 remains runnable and is the fallback for every disabled/failing operation                   | PASS   |
| III. Design Is a Core Feature | Existing primitives/tokens and in-place Task Builder/Child Task surfaces are reused                              | PASS   |
| IV. Arabic-First              | Every visible state is resource-backed and contract outputs require equivalent Arabic/English                    | PASS   |
| V. Mock-First Services        | Prepared Parent/Child/voice providers remain default and fake bindings cover all remote seams                    | PASS   |
| VI. Keep Architecture Small   | Additive contracts and one reference Worker; no second app, state library, media library, or provider SDK        | PASS   |
| VII. Visible AI Value         | Parent sees a wording diff; Child receives one bounded result after an explicit intent/transcript send           | PASS   |
| VIII. Honest Boundaries       | Origin labels distinguish prepared/live; flag-off, blocked auth, and missing native/human evidence stay explicit | PASS   |
| IX. Fast Collaboration        | Exact planning/runtime reservations and task-level file paths serialize shared-file work                         | PASS   |
| X. Demo Reliability           | Same-attempt deterministic fallback and exact reset remain mandatory; network is never required                  | PASS   |

The constitution excludes production infrastructure from the MVP. This plan therefore implements
only provider-neutral contracts, fake-boundary evidence, and a non-deployed reference Worker. It
does not claim or build production accounts, compliance, deployment, or operational staffing.

## Architecture

### Runtime selection

`src/config/aiFeatureFlags.ts` owns exact boolean parsing for the three public presentation flags;
all default false. Flags control whether a screen may request an optional primary service, but they
are never authorization. `src/services/index.ts` continues to export a deterministic registry.
Tests and a later trusted bootstrap may create a registry with injected F4, F5 text, token, media,
or transcription adapters. With no injection, every operation resolves to the prepared provider
without a remote call.

### Parent drafting

`src/features/assistants/parentTaskDrafting.ts` owns strict V1 request/suggestion schemas,
allowlisted archetypes, immutable task-authority snapshots, copy-only mapping, and the canonical
prepared suggestion. `ParentTaskDraftingService` is separate from `ParentGuideService`. The store
captures the active Parent, Child, archetype, draft revision, and authority digest before awaiting;
it rechecks them before showing or accepting a suggestion. Acceptance copies only bilingual title,
positive action, rationale, and ordered-step wording. Current task validation and Parent
review/approval remain authoritative.

### Child text

`src/features/assistants/liveChildCoach.ts` owns age-discriminated request schemas, exact intent and
structured-input allowlists, Unicode/byte/topic/contact/URL/safety checks, terminal response schema,
and canonical prepared fallbacks. Ages 6–8 send only an intent; ages 9–11 send exact structured
choices; ages 12–14 may additionally send bounded text or a reviewed transcript. The request uses
a public reviewed archetype/catalog reference, random correlation, and capability versions; local
profile/assignment identifiers never enter provider input. A successful or fallback result is
ephemeral and produces zero progression effects.

### Voice

`src/features/assistants/liveVoiceCapture.ts` is a pure state machine over permission, held capture,
transcribing, transcript review, delete, explicit send, failure, background, revoke, and reset.
`src/components/family-growth/LiveVoiceCapturePanel.tsx` owns the native Expo Audio hook and maps
foreground lifecycle events into that state machine. The config plugin permits microphone capture
but explicitly keeps background recording/playback disabled. The panel is rendered only when the
voice flag, 12–14 age policy, separate synthetic test grant, and active task checks pass. No current
P0 profile is 12–14, so the competition path remains unchanged.

The `VoiceTranscriptionService` receives an ephemeral URI/byte envelope behind an interface. Its
prepared/fake implementation returns reviewed synthetic transcript text without reading audio.
The remote adapter and Worker route are implemented for fake-binding tests but cannot receive a
token from the default app bootstrap. Raw audio is never passed to `LiveChildCoachTextService`;
only a locally reviewed transcript can be explicitly submitted as bounded text.

### Gateway and authentication seam

The Feature 004 Worker uses exact routes for Parent drafting, Child text, and transcription. A
capability verifier validates issuer, audience, operation scope, role, subject, grant/notice
version, expiry, and single-use `jti` before body parsing or inference. A reference HMAC-signed
token verifier is testable, but the app ships only a blocked token provider. Rate, concurrency,
daily budget, body, replay, origin, no-store, timeout, and non-content error policies are
operation-specific. Cloudflare JSON mode is treated as untrusted and every response is parsed by
local Zod/policy validation. Transcription is a separate Workers AI call and returns text only.

### Cancellation and reset

Store request revisions, task/draft/profile/grant snapshots, and `AbortController` boundaries
reject late results. Route exit, sign-out, reset, permission revocation, task/profile change, and
voice background/interruption clear transient F4/F5 state. Reset never waits for cleanup and the
deterministic session is restored even if an adapter cleanup fails.

## Project Structure

### Documentation (this feature)

```text
specs/004-bounded-live-ai/
├── spec.md
├── approval-packet.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── bounded-ai-v1.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source code (existing Expo app and reference Worker)

```text
app/
├── child/task.tsx
└── parent/settings/permissions.tsx

src/
├── components/family-growth/
│   ├── LiveChildCoachPanel.tsx
│   ├── LiveVoiceCapturePanel.tsx
│   └── ParentTaskComposer.tsx
├── config/aiFeatureFlags.ts
├── features/assistants/
│   ├── parentTaskDrafting.ts
│   ├── liveChildCoach.ts
│   └── liveVoiceCapture.ts
├── models/boundedAi.ts
├── services/
│   ├── interfaces/index.ts
│   ├── mock/index.ts
│   ├── remote/
│   │   ├── GatewayParentTaskDraftingService.ts
│   │   ├── GatewayChildCoachService.ts
│   │   └── GatewayVoiceTranscriptionService.ts
│   └── index.ts
├── state/usePrototypeStore.ts
└── i18n/resources.ts

workers/ghaf-ai-gateway/
├── src/index.ts
├── wrangler.jsonc
└── README.md

tests/
├── bounded-ai-feature-flags.test.ts
├── parent-task-drafting.test.ts
├── live-child-coach.test.ts
├── live-voice-capture.test.ts
├── bounded-ai-gateway.test.ts
└── bounded-ai-integration.test.tsx
```

**Structure Decision**: Extend the single Expo application through provider-neutral services and
thin in-place UI components. Keep the Feature 003 Parent Guide Worker unchanged as regression
evidence; add a Feature 004 gateway directory so broader Parent drafting and Child data policies do
not silently widen the old endpoint. Share strict feature contracts, not runtime secrets, between
the app and reference Worker.

## Implementation Sequence and Integration Boundaries

1. Planning artifacts, ownership, baseline verification, and default-off flags.
2. Shared Feature 004 data types, validation primitives, service contracts, and deterministic
   providers with RED/GREEN tests.
3. F4 authority snapshot/mapper, prepared/live adapters, store race guards, and Parent composer
   diff/accept/keep integration.
4. Capability-token and Worker middleware contracts with fake-binding auth-before-inference,
   replay, rate, body, strict-schema, no-log, timeout, and fallback tests.
5. F5 age-banded text policy/provider, separate grant state, store binding, and terminal Child UI.
6. Voice pure state machine and synthetic transcriber, followed by Expo Audio held-capture adapter
   and ages-12–14-only panel. No real audio/provider evidence is used.
7. Full reset/zero-effects/profile/stale/failure/i18n/accessibility regression and repository
   checks; record native/human/provider/deployment gates honestly.

Shared files—service interfaces/registry, store, resources, Parent composer, Child task route,
permissions route, app config, and Worker configuration—are serialized through the integration
owner. Each functional slice is committed only after its focused tests pass.

## Validation Strategy

### Automated and source-verifiable gates

- Flags: exact names, strict `true` parsing, independent defaults false, and zero network when off.
- Schemas: unknown/missing/wrong-version fields, actual UTF-8/body sizes, correlations, and output
  parity fail closed.
- F4 authority: mutation tests cover every non-copy task field; Parent acceptance remains required.
- F5 age/safety: every age/intent/input combination, multilingual adversarial case, and terminal
  response restriction is exercised.
- Voice: age/grant/permission, held capture, stop/delete/send, timeout/failure/background/reset,
  text-only Coach handoff, and no inference attribute are exercised with synthetic media.
- Gateway: auth before parse/inference, token claims, replay, rate/concurrency/budget, route/method/
  origin/content-type/body, no-store, schema, timeout, refusal, and provider failure.
- State: task/profile/grant/draft revision changes reject late results; all AI interactions have
  zero task/reward/growth/social effects; reset clears every transient.
- Presentation: Arabic/English resources, RTL/LTR ordering, long labels, 200% text source
  resilience, disclosure, adult exit, permission denial, and prepared/live origin.
- Repository: `npm run typecheck`, `npm run lint`, targeted and full `npm test`,
  `npm run format:check`, `npx expo install --check`, web export, Android JavaScript export,
  `git diff --check`, and a scoped secret scan.

### Evidence that remains blocked or not run

- Trusted token broker/deployed authorization and penetration evidence.
- Provider account, model/transcription retention/ZDR, region, subprocessor, deletion, moderation,
  quota, outage, and real-network evidence.
- Real Child content or audio; none is permitted for implementation testing.
- Named privacy/legal, safeguarding, Arabic/UAE, accessibility, incident, and image/audio-rights
  reviews.
- Physical Android microphone permission, foreground-only capture, interruption, background,
  process-death, cleanup, TalkBack, font scale, and performance evidence.
- Deployment, live flags, and release activation.

## Main Risks and Bounded Mitigations

| Risk                                                   | Mitigation                                                                                                          | Residual gate                             |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| A model changes task authority through prose or fields | Copy-only DTO, immutable snapshot/digest, current task validation, Parent diff and acceptance                       | F4 authority corpus passes                |
| Child input escapes age/task bounds                    | Discriminated age schemas, server catalog, local prefilter, terminal response, no history/tools                     | Safeguarding/Arabic review passes         |
| Client flag or token is mistaken for authorization     | Flags are presentation only; blocked default token source; gateway verifies short-lived claims first                | Broker/security evidence passes           |
| Late result crosses profile/task/grant/reset           | Request revision, nonce, snapshots, cancellation, and post-response reauthorization                                 | Concurrency/profile/reset tests pass      |
| Voice records in background or persists                | Held foreground capture, background disabled in config/runtime, stop-on-boundary, cache-only URI, explicit deletion | Physical Android/deletion evidence passes |
| Audio or transcript leaks through logs/providers       | Separate transcriber, no content logs, synthetic canaries, ZDR/deletion gate, text-only Coach handoff               | Privacy/provider evidence passes          |
| Remote failure harms the demo                          | No retry, bounded deadline, same-attempt prepared fallback, flags off by default                                    | Outage/rehearsal evidence passes          |

## Constitution Check — After Design

The design still passes all ten principles. It adds no state, UI, media, localization, or provider
framework; Expo FileSystem closes the deletion gap and Expo Crypto closes the correlation-entropy
gap without inventing a random source. It keeps the single Expo app, leaves Feature 003 complete, makes every remote seam
replaceable; exposes AI only through bounded task-centered actions; and records all provider,
native, human, legal, deployment, and release evidence as blocked/not run until directly observed.

## Complexity Tracking

| Violation                                    | Why Needed                                                                                                                                                    | Simpler Alternative Rejected Because                                                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Second reference Worker directory            | Feature 004 introduces Child text/audio trust boundaries that must not silently widen the existing Parent-only P0 endpoint                                    | Extending `ghaf-parent-guide` would weaken its tested guarantee that no Child/media route exists and would obscure rollback      |
| Microphone permission in a default-off build | Compiling the approved native capture adapter requires an explicit platform permission declaration                                                            | A prepared transcript alone would remain the existing synthetic rehearsal and would not implement the approved push-to-talk path |
| One Expo FileSystem dependency               | Expo Audio records to cache but provides no recording-file deletion API; explicit deletion is required after transcript, cancel, failure, sign-out, and reset | Relying on eventual OS cache eviction cannot satisfy the approved deletion contract                                              |
| One Expo Crypto dependency                   | Each remote action requires native/web random 128-bit request and binding identifiers                                                                         | Timestamps, counters, and `Math.random()` do not satisfy the approved correlation contract                                       |
