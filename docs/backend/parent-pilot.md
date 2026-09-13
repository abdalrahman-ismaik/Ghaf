# Real Parent pilot backend

Feature 006 adds real adult email/password accounts around Ghaf's synthetic sample.
Supabase Auth owns credentials and sessions. The only application table is
`public.pilot_access`: an Auth user UUID, `pending | approved | suspended`, and
creation/update timestamps. It contains no email copy, child, family, task, Seed,
garden, reward or media data. App sample state is memory-only in pilot mode.

The SQL migration creates pending access on registration. Authenticated clients
have an own-row SELECT policy and no mutation grants. Anonymous clients have no
table access. Editable user metadata is never approval authority. The signup
trigger runs with an empty search path; neither trigger function is callable by
clients. Trusted Dashboard administration and the server-only `service_role` role
can change status. No admin key is needed in the application.

## Run the isolated local backend

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
adb reverse tcp:54321 tcp:54321
```

Use `http://127.0.0.1:54321` in the Android app as well, then verify native
connectivity directly. The app permits development HTTP only on loopback; hosted
pilot URLs require HTTPS. Obtain the local publishable key from CLI status
without copying service-role, JWT-signing, database or SMTP secrets into app env.

## Prepare the hosted Mumbai pilot

Hosted activation follows review of the implementation and recorded acceptance
evidence. Project organization access and a verified sending domain are external
prerequisites. Do not treat the local configuration file as hosted configuration.

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
   email OTP length to 6, email OTP expiry to 3600 seconds, and resend interval to
   at least 60 seconds. Keep refresh-token rotation enabled. Password recovery
   uses a verified recovery session; leave Secure password change disabled for this
   code-based flow. Set Site URL to the approved pilot web origin and do not add
   wildcard redirect URLs. Ghaf consumes typed codes rather than redirect tokens.
   [Supabase configuration](https://supabase.com/docs/guides/local-development/cli/config)
4. Configure Resend SMTP: `smtp.resend.com`, port `465`, username `resend`, and a
   Resend API key as the password. Supply an owner-controlled sender email on the
   verified domain and sender name `Ghaf — غاف`. Put these values in Supabase SMTP
   settings, never in Expo public env or committed files. Verify the required DNS
   records in Resend before testing a controlled adult recipient. Keep provider
   email tracking disabled. There is no verified sending domain recorded for this
   implementation; external pilot email delivery is **BLOCKED** until it exists.
   [Resend SMTP setup](https://resend.com/docs/send-with-supabase-smtp)
5. Copy `supabase/templates/confirmation.html` into **Confirm signup**, and
   `supabase/templates/recovery.html` into **Reset password**. Use their matching
   bilingual subjects from `config.toml`. Both show Arabic first and English below,
   with a single `{{ .Token }}` code. They contain no confirmation links, tracking
   images, user metadata or embedded app secrets. The one-hour copy must match the
   configured expiry. Editing the local files does not update hosted templates.
   [Supabase email templates](https://supabase.com/docs/guides/auth/auth-email-templates)
6. After review and acceptance, build the pilot with `EXPO_PUBLIC_GHAF_AUTH_MODE=supabase`,
   the project URL and its publishable key from `.env.example`. Keep the default
   competition build in `demo` mode. Only public project configuration belongs in
   the Expo bundle. Never use a service-role or secret key as the publishable key.

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
fixture suite against hosted adult accounts. Supabase and Resend Dashboard setup
are operator steps, not actions performed by the app.

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
  delivery pass. Physical Android, owner account access and sender-domain readiness
  must be recorded independently of local source/unit-test results.

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

Hosted project provisioning is **NOT RUN** and external email delivery is
**BLOCKED** pending owner organization/domain configuration. Local email capture
and SQL permission tests do not establish hosted delivery, Android acceptance or
release readiness. The integration owner's validation record carries subsequent
app and provider evidence.
