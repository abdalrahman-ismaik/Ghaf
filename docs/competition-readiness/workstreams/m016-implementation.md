# Feature 016 — real family messaging implementation handoff

The real-service boundary and bilingual messaging/helper UI are implemented locally. **The first
real two-installation milestone is BLOCKED**, because the user confirms no Supabase project exists.
No hosted authentication, service exchange, deployment, physical installation or production-readiness
claim is made. Start setup from [quickstart](../../../specs/016-real-family-messaging/quickstart.md).

## Contract, source and authority

- Shared branch `redesign/ui-experiments`; no branch/worktree switch, reset, push, merge or deployment.
- `45d6796` commits the bounded Feature016 Spec Kit contract and constitution exception **before** new
  runtime behavior. `e54924f` adds the SQL service; `07c3a8e` adds the independent Auth/client/controller.
  `4829483` fixes the unbound locale transition; `fd6b72c` integrates UI/helper and registry/resources.
  Acceptance applies to the integrated working candidate/manifest, not isolated intermediate commits.
- Canonical board revisions 81–87 grant exact files, one helper maximum and serialized heavy/browser lanes.
  No other session status was overwritten. Concurrent maintenance moved canonical product/design
  documents under `docs/` in `052b4a8`; concurrent audio/onboarding work remains separately owned.
- The current service has no fallback that turns a failed real send into a local success. Demo profile,
  PIN, pairing and remembered-marker state are never backend authority. Real messaging does not
  authorize or synchronize local tasks, approvals, Seeds, Garden, League or rewards.

## What changed

**Service:** Supabase Auth plus PostgreSQL RPCs. The operator provisions a confirmed Parent user and
allowlist; an anonymous provider session identifies a Child installation but grants no household
access until a Parent-created, single-use, ten-minute invitation is consumed. Each read/send checks
provider user/session, active Parent account, exact relationship and device. Direct table access is
denied. Atomic per-thread sequencing and sender/key receipts preserve ordering and idempotent retry.
Plain text is limited to 500 Unicode code points; ages 6–8 are server restricted to the curated phrases.
History expires after 30 days; the hourly purge and actual provider backup retention require hosted setup.

**Client:** small typed fetch adapter, Zod DTO checks, independent registry/controller and generation
checks for every async operation. Native credentials use Expo 57-compatible `expo-secure-store` 57.0.4;
web credentials, drafts and message views stay in tab memory. No Supabase/chat/state library was added.
Foreground polling, pagination, explicit same-key retry, unknown/failed/accepted states, sign-out,
revocation, stale-result rejection and queued secure-storage operations are covered by focused tests.
Only fetched history advances the polling cursor; own acknowledgements cannot skip unseen messages.

**UI:** thin `/messages` route; Parent Family and Child Today entries; Parent sign-in and explicit
Child enrollment; actual server identity and recipient; Child/device management; chronological plain
text; role/age-specific composers and quick phrases; actions with at least 48dp touch targets; private
sign-out/revocation confirmation; Arabic-first RTL and English. Quick phrases collapse for text-capable
users so Send remains visible at regular text. Ages 6–8 keep phrases visible. No unbacked read, delivered,
online, unread or typing state and no call controls are presented.

**Helper:** the user-created `avatar3.png` is copied byte-for-byte into
`assets/images/companion/task-helper.png`, with provenance beside it. No Flutter/build/template code,
font or artwork is imported. The existing prepared approved-task helper, fallibility disclosure,
age limits, adult-help exits and one-answer authority remain in place. Message Parent opens a visible,
editable generic help draft with actual messaging identity and separation notice. It does not send
silently, attach a task or expose an assistant transcript. The portrait stays still, contained and
usable with an image-error fallback.

## Review and browser corrections

The sole helper first inspected architecture read-only, then implemented SQL and tests, then reviewed
client lifecycle and finally inspected UI read-only. Lead owned contract, UI, registry, resources,
portrait, browser and integration. Helpers had no descendants and never committed or wrote the board.

Concrete corrections include authentication/sign-out races, immediate private-view clearing, same-role
local profile locking, explicit retry without new keys, persisted credential-clear ordering, retention
pruning, Parent-list revocation polling, uppercase enrollment normalization, and the own-send cursor gap.
Browser checks additionally corrected Arabic Back placement, a web `selectable` prop warning, composer
crowding, numeric counter direction and an unnecessary lock when changing locale in an unbound demo scope.

Booking's identified-person-before-message pattern and Wallet's recipient-name/relationship rows inform
original Ghaf compositions. Reference previews and C's proposed HTML compositions were inspected; none
are treated as implemented or human-accepted Ghaf screens. Finance, ratings, maps, sample people,
template art/fonts and unimplemented call actions were not copied.

## Evidence and validation

Absolute evidence directory:
`/home/smyk/projects/Ghaf/output/competition-readiness/family-messaging-016-20260913/`.

- Actual isolated PostgreSQL: **PASSED: 29/29** in 8.813 seconds on a dedicated 127.0.0.1:55432 cluster;
  final PID 44240 stopped. `backend/run-sDsBmrgd/{tests.log,result.txt,lifecycle.log}`. Existing 5432 database
  untouched. Fake Auth tables/claims test SQL authorization, not Supabase login or JWT verification.
- Scoped final checks: **PASSED:216 tests across 9 files** (messaging and affected task/assistant/routes),
  plus zero-warning lint on every changed messaging/source integration path.
- Full shared checks: **PASSED TypeScript and formatting**; **FAILED lint** in concurrent unowned
  `tests/presentation/onboarding-v2-audio.test.tsx:93` (hook called inside lowercase render);
  **FAILED full suite: 2073 passed, 1 failed** because concurrent narration now has 11 source requires
  while the unchanged narration assertion expects 12. The audio owner is notified on board revision 86.
  M016 changes only the route-count assertion in that shared first-run test, not its audio contract.
- Expo dependency compatibility: **FAILED** with 13 existing package patch-version gaps;
  `expo-secure-store` is not flagged. The check log is `receipts/expo-dependency-check.log`; its
  process ended, but the exit receipt was unavailable after session closure. No unrelated upgrades
  were performed. Native acceptance must evaluate the exact dependency candidate.
- Final source/type/lint/format/regression outcomes: `receipts/checks-final.json` and any scoped follow-up
  receipt; initial failures are retained. Three old exhaustive route inventories now include only the
  newly contracted `/messages` addition; other route assertions and task invariants remain intact.
- Browser: Firefox 155 on Linux, 320×740 and 390×844. Unconfigured UI and restart observed against actual
  source; Auth/message/device states use explicitly injected synthetic transport. Prepared-task setup,
  Image.onError injection and CSS 1.6× text enlargement are separately labeled simulations.
  `receipts/browser-operations.json`, `receipts/browser-entry-confirmation.json`,
  `receipts/install-browser-fixture.js`, screenshots and console log. Child Today entry was moved
  immediately after current work, before Garden/future previews; its actual tap and Parent Family
  entry both opened the unconfigured messaging route, without granting any real backend access.
- The prepared answer→human draft interaction left Seeds 48 and the synthetic send count unchanged.
  Arabic/English, mixed scripts, blank/over500 disabling, older 31-message pagination, pending/unknown/
  retry/offline/revoked states, sibling drafts, device/account confirmation and text-field Tab focus
  were exercised. At 320×740 with simulated 1.6× text, Send remained fully reachable at height 75.6px.
- Browser screenshot corrections were confirmed. A hidden retained Expo route initially caused a
  strict test-selector ambiguity; scoping to the visible route resolved it. A 31-character string was
  initially asserted as 30 in the harness; the corrected measured assertion passed. These were harness
  errors, not app defects. Initial cold single-worker bundling took about 72 seconds and exceeded the
  browser tool's 60-second navigation timeout; it is not native performance evidence.
- Missing optional React Native DevTools system library and browser audio-sink/font-preload warnings
  remain environment/other-surface observations. This work neither enabled narration nor changes its
  acceptance. A separate user terminal started 8082 two seconds after our 8081; our server was stopped,
  the user preview reused without restart, and our browser closed at handoff.

## External gates and next action

| Gate                           | Status  | Exact remaining work                                                                                                                                                                                                                     |
| ------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supabase project/Auth/RPC      | BLOCKED | Create a dedicated team-test project; apply reviewed migration; configure Auth; provision Parent allowlist. Share only HTTPS URL and publishable key.                                                                                    |
| Hosted retention/backup/region | BLOCKED | Install/review Cron, observe hourly deletion, record actual region/operator/backup policies and anonymous-signup controls.                                                                                                               |
| Real Parent–Child exchange     | BLOCKED | Two separate native installations, real provider sessions, authorized enrollment, actual bidirectional text and retry/revocation evidence.                                                                                               |
| Native acceptance              | NOT RUN | Exact APK/build identity, device/OS/network, SecureStore persistence/backup behavior, keyboard, Back, TalkBack, font scaling, reduced motion, installation and performance. Hardware availability was not established by this milestone. |
| Human Arabic and usability     | NOT RUN | Named review of new strings/age phrases, accessibility reading order, participant tasks and exact implementation diff. No student participation is invented.                                                                             |
| Calling                        | NOT RUN | T1/V1/V2/V3 need separate contracts after text acceptance. LiveKit is only a candidate; Expo 57/native compatibility, operating requirements and UAE provider eligibility remain unverified.                                             |

The source is a controlled team-test candidate, not a public Child service. Provider setup and the
real two-installation test are the next dependencies; do not activate calling, task attachments,
custom goals or multi-turn AI to bypass them. The setup guide and operator scripts make the next
external step concrete; no password, service-role key or database credential belongs in chat or source.

## AI assistance and human status

Requested: GPT-6 Astra, Ultra, Fast where available. Observable lead configuration:
`gpt-6-astra`, `model_reasoning_effort=xhigh`, `service_tier=fast`; the active runtime variant/effort/tier
is not independently exposed. Helpers were explicitly requested as Astra/Ultra; effective tier is
unexposed. No setting was silently claimed to meet Ultra on the lead.

Actual prompt excerpts, helper contributions, rejected directions and review status are in
`receipts/ai-assistance.json`. The user selected real messaging first, separate human/assistant
conversations, the supplied user-created character and reference-informed design. Rejected directions
include custom password/server operations, synthetic backend authority, fake-send fallback, imported
Flutter/template runtime, automatic transcript sharing and premature calling. Implementation and tests
were AI-assisted; exact-diff/student/human Arabic acceptance remains pending.

All M016 source, helper, browser and heavy-job allocations are released in board revision 87.
The existing user preview on port 8082 remains running and belongs to its original session.
