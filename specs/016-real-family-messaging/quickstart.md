# Setup, validation and two-installation acceptance

## Service setup — operator action, no public deployment by this implementation

Current setup: the user confirms no project exists (2026-09-13). Source work and isolated tests
continue; hosted Auth, cleanup and a real two-installation exchange are BLOCKED.

Create a dedicated team-test Supabase project using a team-controlled operator account.
Record the selected region and project owner before applying the migration. Do not purchase a plan
or expose real Child data under this work. The app needs only the HTTPS project URL and publishable key; never send a service-role
key, database password, Parent password or refresh token through chat or commit them.

1. In the chosen project's SQL editor, review/apply
   `workers/ghaf-family-messaging/migrations/001_family_messaging.sql`. The narrow RPCs deny direct
   table access and use the provider Auth schema. Do not run against unrelated application data.
2. Enable email/password Auth and anonymous sign-ins for enrolled Child installations. Disable
   unneeded Auth providers. Record rate limits/anonymous-sign-in controls; public access/real data
   needs a separately reviewed abuse-control setup. Anonymous identity alone grants no thread access.
3. Create a confirmed team-controlled Parent Auth account through the operator dashboard. Record
   its provider UUID privately. Apply `workers/ghaf-family-messaging/provision-parent.sql` using
   that UUID and synthetic Parent/household display data. The app cannot provision its own Parent.
4. Enable the reviewed hourly cleanup in `workers/ghaf-family-messaging/retention.sql`; verify a
   run and record provider backup/region settings. Until this is verified, remote retention acceptance
   is BLOCKED even though reads hide messages older than 30 days.
5. Configure local ignored environment values `EXPO_PUBLIC_GHAF_MESSAGING_URL` and
   `EXPO_PUBLIC_GHAF_MESSAGING_PUBLISHABLE_KEY`. No demo/live-AI/R002b flag changes are required.
   Missing values give an unavailable messaging surface; they never select a fake provider.
6. Build the exact candidate with secure-store included on two installations under a separately
   granted native build lane. Record commit/dirty diff, app build, device/model/OS and network.
   Web tab-memory does not represent native credential persistence.

This document makes setup concrete; source implementation, SQL/client tests and UI work continue
without an available project. Project creation/provisioning/deployment remains operator action.
Do not claim the text milestone passed until the real two-installation procedure below is observed.

## Focused checks

Run the backend test script from `workers/ghaf-family-messaging/README.md`; it uses only
its own temporary PostgreSQL cluster and synthetic auth claims. It validates SQL authorization,
not actual provider login. Run `npx vitest run tests/messaging --maxWorkers=1` using installed tools,
then affected task/assistant/demo/localization regressions. Reuse shared test lane and do not overlap
another build/pool. Typecheck/lint/format and integrated suite follow the final coherent candidate.

A bounded browser pass covers AR/EN 320×740 and 390×844, authentication/enrollment, empty/thread/draft,
sending/accepted/unknown/retry/offline/revoked, keyboard/Back/large text and helper image fallback.
If transport is intercepted for test states, label fixtures explicitly; do not call that real delivery.
Correct observed defects in one batch and confirm affected states. Physical gates remain separate.

## Real two-installation procedure

1. Parent installation A signs in with the provisioned real account. Create Salem (9–11) and Alya
   as separate messaging identities; issue an invitation for Salem. Record recipient before sharing
   the short-lived code privately. Child installation B redeems it and sees the actual Parent name.
2. Parent opens Salem thread and sends a unique synthetic text. Child receives it through the
   service and replies. Parent sees that reply. Record server message IDs/sequences and redacted
   screenshots; no tokens, passwords, invitation code or real Child data in evidence.
3. Start a send with connection interrupted after request. Outcome is unknown; restoring connection
   and retrying the same key yields exactly one server message. Test definitive rejection separately.
4. Load earlier pages and exchange concurrent messages. Reenter/background/resume and verify stable
   order, no stale sibling draft and no catch-up automatic send. Restart native installations and
   revalidate credential/session/device before showing server history.
5. Attempt Alya's thread from Salem, wrong household access, reused/expired invitation and revoked
   device access; verify denial. Parent revokes B; its next request clears private view. Sign-out
   erases local view/cache without claiming remote history deletion. Verify 30-day retention separately.
6. On the local approved task, open the supplied-character prepared helper, request the supported
   explanation, select Message Parent, inspect/edit the generic draft under the actual remote Child
   identity, and Send. Parent receives plain text only. No assistant transcript, task reference,
   assignment, approval, Seed or Garden data is transported. The local task demo remains independent.

Record PASSED/FAILED/BLOCKED/NOT RUN for source, SQL, actual Auth, service deployment, each device
exchange, native Back/TalkBack/keyboard/font scale, network, and human Arabic/participant review.
There are no call controls. T1/V1/V2/V3 are future separately contracted milestones.
