# Plan: Study and family support

Reuse Expo Router, strict TypeScript, Zustand, existing serviceRegistry/local storage,
Zod, botanical primitives and current messaging Supabase Auth/RPC transport. Add no
application dependency or parallel theme, state library, chat provider or AI framework.

## Boundaries

- `src/models/study.ts`, `src/features/study/`: typed private records, validation,
  pure plan/goal transitions and finite prepared practice. No progression imports.
- `src/services/local/studyRepository.ts`: versioned, bounded, family-instance-bound
  storage with detached reads, explicit corruption/failure and verified clearing.
- Existing service registry and prototype store: derive authorized actor from actual
  role controllers, bind selected family/Child, invoke pure domain commands, persist
  before state publication, refresh on entry and integrate all reset/replacement paths.
- `src/components/study/`, `app/{parent,child}/study.tsx`: shared role-aware study and
  goals screen with thin guarded routes, bilingual forms and clear next actions.
- `src/features/familyPractices/`, `src/components/familyPractices/`,
  `app/{parent,child}/practices.tsx`: sourced finite guided sessions; no domain rewards.
- `src/features/familyMessaging/`, existing messaging components, additive migration
  `workers/ghaf-family-messaging/migrations/002_peer_threads.sql`: peer approval and
  server-authorized threads, preserving Feature016 identities/data and offline truth.
- Dedicated `studyResources.ts`, `familyPracticeResources.ts`, and
  `peerMessagingResources.ts`, wired once into `src/i18n/resources.ts`.

Root owns integration/store/resources aggregation, source documentation and checks.
Disjoint workers own study domain/repository, messaging extension and family practices.
At most four active agents and one serialized heavy test/build/database/browser lane.

## Validation strategy

Focused domain tests precede integration. Preserve existing task/reward/access/AI
tests. Add role/actor spoofing, stale agreement, lower result retry, write failure,
reset, direct route and Arabic/English UI coverage. Peer SQL tests run against an
isolated local PostgreSQL instance with synthetic auth fixtures, never the pilot DB.
No hosted release is inferred from local SQL or synthetic HTTP tests. Run full static
checks, regressions, web/Android bundles and actual available browser interactions.
