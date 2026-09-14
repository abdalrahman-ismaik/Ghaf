# Tasks — Feature016

## Current hosted/native integration — 2026-09-14

The user authorized a dedicated backend and Android testing. Hosted Auth/HTTP
acceptance now passes; native compilation and acceptance are in progress. See
[current integration evidence](backend-android-validation.md). The older project
availability and operator deferrals below remain historical records.

## Setup and foundation

- [x] T001 Reconcile shared HEAD/status/resources and publish bounded grants in docs/competition-readiness/coordination/BOARD.md.
- [x] T002 Specify stories, retention, authority, API and architecture in specs/016-real-family-messaging/.
- [x] T003 Commit bounded constitution/Feature016 contract and activate exact runtime grants in docs/competition-readiness/coordination/BOARD.md.

## US1 — Real authentication and enrollment

Independent test: provisioned Parent authenticates; a second genuine installation identity redeems
its invitation; no unprovisioned/demo/sibling account can acquire the relationship.

- [x] T004 [P] [US1] Implement SQL identity, device, invitation and server authorization in workers/ghaf-family-messaging/migrations/001_family_messaging.sql.
- [x] T005 [US1] Add isolated SQL authorization/enrollment/revocation checks in workers/ghaf-family-messaging/tests/.
- [x] T006 [US1] Implement typed Auth/RPC adapter and credential storage in src/features/familyMessaging/.
- [x] T007 [US1] Add real access/enrollment/device UI and own route guards in src/components/familyMessaging/ and app/messages/.

## US2 — Durable human exchange

Independent test: real two-installation text exchange; ordered pages and same-key retries produce
one accepted record under server authorization.

- [x] T008 [US2] Implement transactional thread/message/idempotency/pagination/retention in workers/ghaf-family-messaging/.
- [x] T009 [US2] Implement thread controller, chronological history and age-specific composer in src/features/familyMessaging/ and src/components/familyMessaging/.
- [x] T010 [US2] Integrate separate registry, contextual role entries and bilingual resources in src/services/index.ts, app/parent/family/index.tsx, app/child/index.tsx and src/i18n/resources.ts.

## US3 — Failure and lifecycle

Independent test: unknown→same-key retry; account/thread/background interruption cannot reveal stale
content; revocation denies a still-unexpired device token.

- [x] T011 [US3] Cover timeout/unknown/retry/auth-refresh/stale completions/storage failure in tests/messaging/.
- [x] T012 [US3] Implement visible sign-out/revocation/offline/reentry and root context clearing in app/messages/, app/_layout.tsx and src/features/familyMessaging/.

## US4 — Existing bounded helper

Independent test: stable user portrait, one existing approved-task answer, editable generic human
draft and explicit Send; no AI transcript or task authority crosses into messaging.

- [x] T013 [US4] Copy only inspected avatar3 and creator provenance into assets/images/companion/.
- [x] T014 [US4] Add bounded helper portrait/draft bridge in src/components/companion/ and app/child/task.tsx.
- [x] T015 [US4] Verify task eligibility, identity changes, generic-only draft and existing +12/no-loss invariants in tests/messaging/ and affected existing suites.

## Integration and evidence

- [x] T016 Run focused and final integrated static/regression checks; record exact results in docs/competition-readiness/workstreams/m016-implementation.md.
- [x] T017 Capture one bounded AR/EN browser pass and correct/confirm affected states in output/competition-readiness/family-messaging-016-20260913/.
- [x] T018 Perform real provider and two-installation/native checks from specs/016-real-family-messaging/quickstart.md, or record precise BLOCKED/NOT RUN gates.
- [x] T019 Commit coherent validated slices, publish prompts/contributions/known gaps and release exact board paths in docs/competition-readiness/coordination/BOARD.md.

Dependencies: T003 gates all runtime; backend T004/T008 and client T006/T009 may proceed in parallel
with disjoint ownership. T007/T010 integrate agreed DTOs; T011/T012 and T013–T015 follow their seams.
T016–T019 finish the complete milestone. One backend helper maximum, no descendants; one serialized
SQL/test/build slot and one browser lane. No optional calling/custom-goal/multi-turn implementation.

## Completion evidence and remaining acceptance

Contract 45d6796 preceded runtime; backend e54924f, client 07c3a8e, locale correction 4829483,
UI integration fd6b72c. Source implementation and bounded checks/handoff complete. T018 is completed
as the explicitly permitted BLOCKED/NOT RUN record, not a claim of real-device acceptance.
The real text milestone remains BLOCKED because the user has no Supabase project.
See docs/competition-readiness/workstreams/m016-implementation.md and the unique Feature 016 evidence directory.

Validation: 29 isolated SQL cases; 216 focused/affected tests in 9 files; scoped zero-warning lint;
full TypeScript and formatting pass. Concurrent audio work causes one unrelated full suite failure (2073 passed) and one
unowned hook lint failure. These are recorded, not silently repaired or counted as messaging failures.
Browser fixtures, preapproved task state, image-error injection and 1.6× text are explicitly synthetic.
All helpers/browser/owned Metro jobs released; user terminal 8082 retained.

The dependency compatibility check flags 13 existing Expo package patch updates; no broad upgrade
was made. All exact source and resource allocations are released in board revision 87.
