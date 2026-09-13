# Tasks — Feature016

## Setup and foundation

- [x] T001 Reconcile shared HEAD/status/resources and publish bounded grants in docs/competition-readiness/coordination/BOARD.md.
- [x] T002 Specify stories, retention, authority, API and architecture in specs/016-real-family-messaging/.
- [ ] T003 Commit bounded constitution/Feature016 contract and activate exact runtime grants in docs/competition-readiness/coordination/BOARD.md.

## US1 — Real authentication and enrollment

Independent test: provisioned Parent authenticates; a second genuine installation identity redeems
its invitation; no unprovisioned/demo/sibling account can acquire the relationship.

- [ ] T004 [P] [US1] Implement SQL identity, device, invitation and server authorization in workers/ghaf-family-messaging/migrations/001_family_messaging.sql.
- [ ] T005 [US1] Add isolated SQL authorization/enrollment/revocation checks in workers/ghaf-family-messaging/tests/.
- [ ] T006 [US1] Implement typed Auth/RPC adapter and credential storage in src/features/familyMessaging/.
- [ ] T007 [US1] Add real access/enrollment/device UI and own route guards in src/components/familyMessaging/ and app/messages/.

## US2 — Durable human exchange

Independent test: real two-installation text exchange; ordered pages and same-key retries produce
one accepted record under server authorization.

- [ ] T008 [US2] Implement transactional thread/message/idempotency/pagination/retention in workers/ghaf-family-messaging/.
- [ ] T009 [US2] Implement thread controller, chronological history and age-specific composer in src/features/familyMessaging/ and src/components/familyMessaging/.
- [ ] T010 [US2] Integrate separate registry, contextual role entries and bilingual resources in src/services/index.ts, app/parent/family/index.tsx, app/child/index.tsx and src/i18n/resources.ts.

## US3 — Failure and lifecycle

Independent test: unknown→same-key retry; account/thread/background interruption cannot reveal stale
content; revocation denies a still-unexpired device token.

- [ ] T011 [US3] Cover timeout/unknown/retry/auth-refresh/stale completions/storage failure in tests/messaging/.
- [ ] T012 [US3] Implement visible sign-out/revocation/offline/reentry and root context clearing in app/messages/, app/_layout.tsx and src/features/familyMessaging/.

## US4 — Existing bounded helper

Independent test: stable user portrait, one existing approved-task answer, editable generic human
draft and explicit Send; no AI transcript or task authority crosses into messaging.

- [ ] T013 [US4] Copy only inspected avatar3 and creator provenance into assets/images/companion/.
- [ ] T014 [US4] Add bounded helper portrait/draft bridge in src/components/companion/ and app/child/task.tsx.
- [ ] T015 [US4] Verify task eligibility, identity changes, generic-only draft and existing +12/no-loss invariants in tests/messaging/ and affected existing suites.

## Integration and evidence

- [ ] T016 Run focused and final integrated static/regression checks; record exact results in docs/competition-readiness/workstreams/m016-implementation.md.
- [ ] T017 Capture one bounded AR/EN browser pass and correct/confirm affected states in output/competition-readiness/family-messaging-016-20260913/.
- [ ] T018 Perform real provider and two-installation/native checks from specs/016-real-family-messaging/quickstart.md, or record precise BLOCKED/NOT RUN gates.
- [ ] T019 Commit coherent validated slices, publish prompts/contributions/known gaps and release exact board paths in docs/competition-readiness/coordination/BOARD.md.

Dependencies: T003 gates all runtime; backend T004/T008 and client T006/T009 may proceed in parallel
with disjoint ownership. T007/T010 integrate agreed DTOs; T011/T012 and T013–T015 follow their seams.
T016–T019 finish the complete milestone. One backend helper maximum, no descendants; one serialized
SQL/test/build slot and one browser lane. No optional calling/custom-goal/multi-turn implementation.
