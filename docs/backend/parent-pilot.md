# Real Parent pilot backend

Feature 006 adds real adult email/password accounts around Ghaf's synthetic sample.
Supabase Auth owns credentials and sessions. `public.pilot_access` contains an Auth
user UUID, `pending | approved | suspended`, and creation/update timestamps.
Feature 018 adds owned `account_profiles` and `account_workspaces` for the bounded
adult profile and family/task/study planning data described in
[the account guide](../auth.md). The existing synthetic sample and its progression
remain separate; no local records are uploaded automatically.

The SQL migration creates pending access on registration. Authenticated clients
have an own-row SELECT policy and no mutation grants. Anonymous clients have no
table access. Editable user metadata is never approval authority. The signup
trigger runs with an empty search path; neither trigger function is callable by
clients. Trusted Dashboard administration and the server-only `service_role` role
can change status. No admin key is needed in the application.

## Run the isolated local backend

The verified CLI version for the current backend is **2.117.0**. Once the existing
local services are running, `node scripts/backend/verify-local.mjs` verifies the
local Docker endpoint/project, applies pending local migrations without reset,
lints functions, runs all pgTAP tests and executes the real Auth integration suite.
Set `SUPABASE_CLI` to an installed absolute executable path when it is not on PATH.
The verifier withholds credential-bearing status output and leaves services running.
Its safety tests are `node --test scripts/backend/verify-local.test.mjs`.

Prerequisites: supported Node, the Supabase CLI, and a running Docker Linux engine.
Use this repository's `ghaf-parent-pilot` local project only. Do not supply a hosted
database URL or a `--linked` flag to local tests.

```powershell
npx supabase start
npx supabase migration up --local
npx supabase test db
```

The CLI loads `supabase/config.toml`. PostgreSQL 17 runs on 54322, the API on
54321, Studio on 54323, and the local email inbox on 54324. `start` applies
migrations to a fresh local database; `migration up --local` applies later pending
migrations. Open the inbox address printed by the CLI to read synthetic test codes.
Local email is captured inside the local stack; it does not establish external
email delivery. Storage, Realtime, analytics and Edge Functions are disabled.

If optional Studio/postgres-meta images cannot execute on this host, the verified
database/Auth/mailbox-only startup is:

```powershell
npx supabase start --exclude studio,postgres-meta
```

Studio is unavailable in this mode; database and authentication tests still run.
Do not delete global images or other projects' volumes as a recovery step.

Every assertion in `supabase/tests/database/pilot_access.test.sql` executes inside
one transaction that is rolled back. Only the reserved `00600000-...` identities
with `example.invalid` emails are created. The suite covers registration, ignored
metadata, both directions of account isolation, anonymous denial, self/other
approval writes, upsert/delete denial, administrator approval and suspension,
missing rows/identity claims, invalid statuses, timestamps and cascading deletion.
These are direct PostgreSQL permission tests; app unit tests do not replace them.
[Supabase database testing](https://supabase.com/docs/guides/database/testing)

For a disposable local reset, first verify the project printed by
`npx supabase status`, then run `npx supabase db reset --local`. This removes only
that local project's data and reapplies migrations. Do not use it against hosted
data. Stop the local stack with `npx supabase stop` when finished.

For web, use the local API URL `http://127.0.0.1:54321`. For an Android emulator or
USB-connected development device, select the intended device with ADB and forward
the local API port before starting the app:

```powershell
adb -s YOUR_DEVICE_SERIAL reverse tcp:54321 tcp:54321
```

Use `http://127.0.0.1:54321` in the Android app as well, then verify native
connectivity directly. The app permits development HTTP only on loopback; hosted
pilot URLs require HTTPS. Obtain the local publishable key from CLI status
without copying service-role, JWT-signing, database or SMTP secrets into app env.

## Prepare the hosted Mumbai pilot

Hosted activation follows review of the implementation and recorded acceptance
evidence. The owner approved a zero-cost pilot using a dedicated Gmail sender and
declined a domain purchase. Owner-controlled SMTP credentials and verified delivery
are prerequisites; an owned domain is needed only for the optional Resend route.
Do not treat the local configuration file as hosted configuration.

1. In the owner's Supabase organization, create the dedicated pilot project in
   **South Asia (Mumbai), `ap-south-1`**. Record its project reference and region in
   the private operator record. Store the database password in the owner's secret
   manager. Mumbai is a supported Supabase region; its selection does not establish
   a residency or compliance guarantee.
   [Supabase regions](https://supabase.com/docs/guides/platform/regions)
2. Before opening registration, apply
   `supabase/migrations/20260913000100_pilot_access.sql` using the Dashboard SQL
   editor, or use the reviewed CLI migration workflow below. Confirm table RLS is
   enabled and only the own-row SELECT policy exists. This is a fresh pilot project;
   the migration intentionally does not backfill or approve preexisting accounts.
3. In Authentication, enable email/password signup and **Confirm email**. Disable
   anonymous, phone and social-provider sign-in. Set minimum password length to 12,
   email OTP length to 8, email OTP expiry to 3600 seconds, and resend interval to
   at least 60 seconds. Keep refresh-token rotation enabled. Password recovery
   uses a verified recovery session; leave Secure password change disabled for this
   code-based flow. Set Site URL to the approved pilot web origin and do not add
   wildcard redirect URLs. Ghaf consumes typed codes rather than redirect tokens.
   [Supabase configuration](https://supabase.com/docs/guides/local-development/cli/config)
   The app accepts exactly six or eight digits, including normalized Arabic/Persian
   input. Local tests retain six-digit codes; the hosted project retains its
   eight-digit default.
4. Configure the approved **dedicated Gmail SMTP sender** for this limited pilot:
   - The owner creates a dedicated Gmail account, enables **2-Step Verification**,
     then generates a Google app password. App passwords may be unavailable for
     some managed accounts, Advanced Protection or security-key-only verification.
     If unavailable, resolve the sender account setup before proceeding; do not
     substitute the Google account password or weaken account protection.
     [Google app passwords](https://support.google.com/accounts/answer/185833?hl=en)
   - In Supabase custom SMTP, use host `smtp.gmail.com`, port `465` with implicit
     TLS, the full dedicated Gmail address for both username and sender email,
     and sender name `Ghaf — غاف`. The owner enters the app password directly into
     Supabase. Do not paste it into chat, Expo env, evidence or committed files.
     No purchased domain or extra mailbox purchase is required for this route.
     [Gmail SMTP settings](https://developers.google.com/workspace/gmail/imap/imap-smtp)
   - Keep **Confirm email** enabled. Retain the conservative custom-SMTP default
     of **30 emails/hour**, and verify a minimum resend interval of **60 seconds**
     after saving. Request-rate limits and the email/hour limit are separate.
     [Supabase custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
   - Gmail is a personal email service. Its consumer sending ceiling of 500 emails
     per day is not guaranteed capacity; throttling and temporary sending blocks
     can interrupt the pilot. Supabase also warns about Gmail deliverability.
     This setup does not establish public-launch readiness or a delivery SLA.
     [Gmail sending limits](https://support.google.com/mail/answer/22839?hl=en)
5. Copy `supabase/templates/confirmation.html` into **Confirm signup**, and
   `supabase/templates/recovery.html` into **Reset password**. Use their matching
   bilingual subjects from `config.toml`. Both show Arabic first and English below,
   with a single `{{ .Token }}` code. They contain no confirmation links, tracking
   images, user metadata or embedded app secrets. The one-hour copy must match the
   configured expiry. Editing the local files does not update hosted templates.
   [Supabase email templates](https://supabase.com/docs/guides/auth/auth-email-templates)
   On this Free project, the Dashboard required custom SMTP before template editing.
   SMTP is now saved. Both subjects and full template bodies were verified after
   Dashboard reload, and both Arabic/English previews were checked; see
   [the operator record](hosted-pilot.md). Do not invite participants before controlled
   delivery and complete account-flow validation pass.
6. After review and acceptance, build the pilot with `EXPO_PUBLIC_GHAF_AUTH_MODE=supabase`,
   the project URL and its publishable key from `.env.example`. Keep the default
   competition build in `demo` mode. Only public project configuration belongs in
   the Expo bundle. Never use a service-role or secret key as the publishable key.

Google receives adult recipient addresses and the authentication message content,
including verification/recovery codes. Messages sent through Gmail SMTP are
automatically copied into Gmail's Sent folder. Restrict access to the dedicated
sender account; deleting an adult from Supabase does not erase those email copies
or establish provider-wide erasure. No family profiles, tasks or Child data are
sent through this flow. [Gmail SMTP sent copies](https://support.google.com/mail/answer/78892)

**Optional later sender:** Resend SMTP requires an owner-controlled, verified
sending domain. Use `smtp.resend.com`, port `465`, username `resend`, a Resend API
key as password, and an address on that domain with sender name `Ghaf — غاف`.
Verify its DNS records before controlled delivery tests and keep email tracking
disabled. Credentials remain in Supabase, with no Resend SDK in the app. This
alternative is deferred; a domain purchase is not a Gmail pilot launch gate.
[Resend SMTP setup](https://resend.com/docs/send-with-supabase-smtp)

### Run the separate hosted preview

The owner-authorized project is now provisioned; see [its operator record](hosted-pilot.md)
for verified settings and remaining gates. This workstation has an ignored
`.env.pilot.local` containing only the public project URL/key and pilot-mode flags.
From a shell without conflicting `EXPO_PUBLIC_...` overrides, run:

```powershell
npm run start:pilot -- --web
```

The command explicitly loads that file and clears Metro's cache. `npm start` and
`npm run web` do not load `.env.pilot.local`; their default remains demo. On a fresh
checkout, create `.env.pilot.local` from the relevant entries in `.env.example`,
set auth mode to `supabase`, and use the intended project's publishable settings.
Do not use `.env.local` for this separate preview, as Expo loads that file during
ordinary demo starts too. Node's existing shell environment takes precedence over
`--env-file`, so unset conflicting mode/project variables before starting.

When returning from the pilot preview to the default browser demo, stop the pilot
server and run `npm run web -- --clear` from a shell without pilot overrides. The
cache-clearing requirement below also applies in this direction.

This command is a development preview, not pilot activation. Hosted registration
and recovery still require controlled delivery and account-flow validation;
physical Android and review gates also remain open.

### Clear the app cache when switching mode or project

Expo embeds public environment values in the app bundle. Whenever the authentication
mode, Supabase URL or publishable key changes, set the intended environment values
and clear the Metro cache for the next development session or export:

```powershell
npx expo start --clear
npx expo export --platform web --clear
```

Use `--clear` for Android exports as well. Changing environment files does not
reconfigure an existing exported artifact. During this implementation, a nominal
demo export without a cleared cache retained the previous pilot values. Preview
the newly generated artifact and verify its effective authentication mode and
project before handoff. The default demo must open the deterministic experience
without making Supabase authentication calls; a successful export alone does not
verify that boundary.

### Apply reviewed hosted migrations

Optional reviewed CLI migration workflow, after selecting the correct new project:

```powershell
npx supabase login
npx supabase link --project-ref <approved-pilot-project-ref>
npx supabase db push --dry-run
npx supabase db push
```

The last command changes the linked hosted database. Inspect the project reference
and dry-run migration list before the approved activation. Never run the pgTAP
fixture suite against hosted adult accounts. Supabase and email-provider setup
are operator steps, not actions performed by the app.

The recorded hosted project already received migration `20260913000100` through
the SQL Editor. Before using this CLI workflow there, follow the migration-history
reconciliation in [the operator record](hosted-pilot.md); do not execute its DDL twice.

## Dashboard approval, suspension and deletion

Use the owner's authenticated Supabase Dashboard. Only an authorized pilot
administrator performs these operations; there is no in-app admin control.

| Operation           | Operator action                                                                                                                                                                 | Expected app result                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Review registration | Find the adult email in Authentication → Users. Check email confirmation and copy its exact UUID. Locate the matching `pilot_access.user_id`.                                   | A pending user can authenticate and verify email but cannot open the sample.                         |
| Approve             | Confirm the intended adult participant, then change only that row's `status` from `pending` to `approved` in the Table Editor.                                                  | On Refresh or the next active check, the user sees **Explore the sample family**.                    |
| Suspend             | Set the matching row's `status` to `suspended`.                                                                                                                                 | The next foreground, manual or active-minute check closes the sample and shows suspension.           |
| Restore             | After an explicit administrator decision, set `suspended` to `approved`.                                                                                                        | The user may open a fresh sample after the next successful check.                                    |
| Missing row         | Leave access denied. Check migration and signup-trigger logs. Only an administrator may recreate a `pending` row for an existing intended adult UUID and separately approve it. | Missing status never grants access or falls back to the demo.                                        |
| Delete              | Confirm the adult's deletion request and exact UUID. Suspend first; then delete the user in Authentication → Users and verify the approval row disappeared.                     | The foreign key removes approval; session validation fails and the account cannot reopen the sample. |

Status checks are polling, not push revocation. Suspension can take up to the next
active one-minute check; a failed check also closes the gate. Account deletion does
not erase an already issued JWT immediately. The app validates the user with Auth
and reads approval again before allowing entry. No cloud family records exist to
delete, and real logout clears the memory-only sample. Logs or backups retained by
providers are governed by their configuration; no complete erasure or retention
claim is made here. [Supabase user management](https://supabase.com/docs/guides/auth/managing-user-data)

## Acceptance record

Record results in `specs/006-real-parent-pilot/validation.md`, with command output or
direct evidence. Never put email codes, passwords, access/refresh tokens or real
participant details in evidence committed to the repository.

- Run local pgTAP and app regression suites; verify a fresh registration creates
  exactly one pending row before email verification.
- With controlled adult test accounts, verify confirmation, wrong/expired/reused
  code handling, recovery, password login and pending → approved → suspended.
- Verify Arabic and English messages in a real recipient inbox. Check that the
  confirmation and recovery codes work when email is opened on another device.
- On Android and web, test signout from Child view, restart sample without signing
  out, account switching, direct routes while blocked, background/foreground and
  connection failure. Check the sample stays synthetic and never saves real email.
- Do not activate until required direct browser/native checks and hosted email
  delivery pass. Physical Android, owner account access and SMTP sender readiness
  must be recorded independently of local source/unit-test results. Domain
  verification applies only if the optional Resend route is selected.

Direct local evidence on 2026-09-13: Docker Engine **29.2.1**, Supabase CLI
**2.117.0**, PostgreSQL image **17.6.1.167**. The migration applied successfully and
`npx --yes supabase@latest test db` returned **Files=1, Tests=37, Result: PASS**.
Initial full startup failed because the optional Studio and postgres-meta images
reported `exec format error`. The targeted `start --exclude studio,postgres-meta`
command passed; Auth, API, PostgreSQL and the local mailbox were available. No
global images, existing other-project volumes or hosted data were removed.

Final local verification also passed the Supabase account integration suite after
the recovery-session fixes, all **1,866 regression tests**, typecheck, lint and
format checks. The pilot Android Hermes JavaScript export **PASSED**. Physical
Android acceptance remains **NOT RUN**: `adb devices` listed no connected device.
An exported JavaScript bundle does not establish native session-storage, keyboard,
Back or physical-device behavior.

Hosted Mumbai provisioning, schema/access metadata verification and a read-only
public-API connection check are **PASSED**. The connection check returned Auth
settings successfully and denied an anonymous approval-table read. Hosted email
SMTP configuration is **PASSED** after reload: enabled Gmail SMTP on port 465,
sender name `Ghaf — غاف` and a 60-second resend interval. Both bilingual templates
and subjects passed independent readback against repository source, and Dashboard
Rate Limits directly verified 30 emails/hour. Actual hosted delivery and registration/login/recovery are
**NOT RUN**. Local email capture
and SQL permission tests do not establish hosted account flows, Android acceptance
or release readiness. The integration owner's validation record carries subsequent
app and provider evidence.
