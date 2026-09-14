# Setup, validation and two-installation acceptance

## Authorized service setup — 2026-09-14

The user authorized backend integration and physical Android testing using Android Studio.
The current session may provision/configure and test a dedicated synthetic team messaging
project. The adult pilot remains a separate project and authority; its URL, key, SMTP and
adult approval workflow must not silently become messaging configuration.

At session start, messaging configuration is absent and the operator browser awaits Supabase
sign-in. Historical Feature016/017 records correctly marked hosted Auth, cleanup and actual
device exchange BLOCKED/NOT RUN at their source handoff. The later authorization permits
performing these steps; it does not itself establish a pass.

Create a dedicated team-test Supabase project using a team-controlled operator account.
Record the selected region and project owner before applying the migration. Do not purchase a plan
or expose real Child data under this work. The app needs only the HTTPS project URL and publishable key; never send a service-role
key, database password, Parent password or refresh token through chat or commit them.

1. In the chosen project's SQL editor, review/apply
   `workers/ghaf-family-messaging/migrations/001_family_messaging.sql` once for a fresh messaging
   schema, then `002_peer_threads.sql` for approved sibling conversations and
   `003_idempotent_retry_budget.sql` for exact accepted retries at the send-attempt limit. If001 is already
   installed, inspect that state and apply only the missing upgrade; do not drop history or rerun001.
   The narrow RPCs deny direct table access and use the actual provider Auth schema. Never apply
   `tests/auth-fixture.sql` to a hosted project or run against unrelated application data.
2. Enable email/password Auth and anonymous sign-ins for enrolled Child installations. Disable
   unneeded Auth providers. Record rate limits/anonymous-sign-in controls; public access/real data
   needs a separately reviewed abuse-control setup. Anonymous identity alone grants no thread access.
   The current client sends no CAPTCHA token and has no challenge UI. If the selected project
   requires CAPTCHA for signup or sign-in, these flows cannot complete until compatible client
   support exists. Do not turn off an existing project's protections to fit the client. An
   explicitly selected dedicated synthetic test configuration without CAPTCHA does not establish
   production safety. See [Supabase CAPTCHA integration](https://supabase.com/docs/guides/auth/auth-captcha)
   and its [anonymous sign-in controls](https://supabase.com/docs/guides/auth/auth-anonymous).
3. Create a confirmed team-controlled Parent Auth account through the operator dashboard. Record
   its provider UUID privately. Apply `workers/ghaf-family-messaging/provision-parent.sql` using
   that UUID and synthetic Parent/household display data. The app cannot provision its own Parent.
4. Enable the reviewed hourly cleanup in `workers/ghaf-family-messaging/retention.sql`; verify a
   run and record provider backup/region settings. Until this is verified, remote retention acceptance
   is BLOCKED even though reads hide messages older than 30 days.
5. Configure local ignored environment values `EXPO_PUBLIC_GHAF_MESSAGING_URL` and
   `EXPO_PUBLIC_GHAF_MESSAGING_PUBLISHABLE_KEY`. No demo/live-AI/R002b flag changes are required.
   Missing values give an unavailable messaging surface; they never select a fake provider.
   The adapter accepts an HTTPS origin and an `sb_publishable_` key. A legacy anon JWT, service key
   or pilot variable name will not activate it. Rebuild/restart the exact candidate after loading
   this environment; retain the unconfigured competition launch path.
6. Build the exact candidate with secure-store included on two installations under a separately
   allocated native build lane. Android Studio physical testing is now authorized. Record
   commit/dirty diff, app build, device/model/OS and network. An Android Studio emulator is
   separate emulator evidence, and web tab-memory does not represent native credential persistence.
7. Confirm PostgREST commits expected rejected enrollment attempts and does not allow a client
   `Prefer: tx=rollback` override to undo the rate counter. Check a real HTTP400 invalid invitation,
   its committed counter and HTTP429 after the configured attempt threshold. Also confirm that
   public/API-key-only requests cannot call authenticated RPCs or read private tables.

Project creation/provisioning remains an operator action within the current explicit authorization.
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

## Feature017 sibling acceptance

Keep Parent A and Child B from the preceding procedure and enroll a second synthetic Child C
in a distinct session/installation. Three authenticated participants are needed to exercise
Parent permission management while both Children exchange text. A browser participant can
support backend checks, but cannot replace that participant's native persistence evidence.

1. Before permission, B and C see their separate Parent conversations and no peer thread.
   Parent enables only the displayed B/C pair after both devices are enrolled. Verify one
   canonical thread, including when the same pair is requested in reversed order.
2. B and C exchange unique synthetic messages through the service. Parent sees permission
   metadata but cannot list, read or send the peer content. Another Child in the same family
   and another household also receive server denial; local demo IDs never grant access.
3. Exercise the 6–8 phrase-only band on one enrolled Child and confirm the server rejects
   uncurated text. Confirm older bounded text and the 500-code-point limit separately.
4. Parent revokes the pair; both Child reads/sends are denied immediately at the server and
   foreground refresh clears inaccessible messages, pending attempts and drafts. Re-enable
   explicitly and verify retained history follows the 30-day policy without reviving old drafts.
5. Repeat by letting each Child stop the conversation. Neither Child can re-enable it; Parent
   must give fresh permission. Their separate Parent conversations remain available.
6. After viewing a sibling thread, open the approved task helper's Message Parent action.
   Confirm the actual Parent recipient and generic draft, with no automatic send or transcript
   transfer. Check Back, background/resume and session changes for stale content.

Record native keyboard, Android Back, TalkBack, font scaling and process restart on each actual
physical candidate. Keep SQL fixtures, intercepted HTTP, browser, emulator and physical receipts
distinct. For hosted retention, inspect a successful later run of the named hourly job in
`cron.job_run_details`; an initial manual purge or installed schedule alone does not pass it.

Record PASSED/FAILED/BLOCKED/NOT RUN for source, SQL, actual Auth, service deployment, each device
exchange, native Back/TalkBack/keyboard/font scale, network, and human Arabic/participant review.
There are no call controls. T1/V1/V2/V3 are future separately contracted milestones.
