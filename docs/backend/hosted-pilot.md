# Hosted Parent pilot operator record

## 2026-09-14 account schema maintenance

The owner authorized updating the existing backend and publishing reviewed code.
The linked target was verified as `bqcfynlbxevqlzbkimhy`, the dedicated adult pilot.
The hosted `pilot_access` columns, constraints, triggers, indexes, RLS, policies,
grants and function definitions matched the reviewed local baseline; only CRLF
differed inside function source. The platform `rls_auto_enable` function was kept.

After that comparison, CLI 2.117.0 marked the manually applied
`20260913000100` baseline as applied. The dry run contained exactly the three new
migrations: account profiles, account workspaces and provider-status enforcement
(`20260914000100` through `20260914000300`). They were applied additively. A second
dry run reported no pending migration. No Auth, SMTP, paid-plan or public rollout
setting changed, and existing users/data were preserved.

Real hosted Auth/HTTP checks passed with two invocation-owned synthetic accounts
provisioned through the provider's administrator API. Three clients independently
signed in; profile/family/member/task/study retrieval, writes both ways, stale-write
conflicts, cross-owner read/update/delete denial, local logout with another session
refreshing, same-account relogin and retained-JWT ban denial passed. Both temporary
accounts and their fixture rows were removed afterward. This deliberate test
provisioning does not verify signup email delivery or recovery messages.

The separate messaging project remains `ijiwkmvjppfallaoahmh`; do not apply adult
Auth settings or this migration directory to it. Its additional foreground-location
objects/history are outside the current checkout and were preserved. Current
evidence is in ignored `.expo/backend-readiness-20260914/` and
[Feature 018 validation](../../specs/018-persistent-adult-accounts/validation.md).
The older operator notes below remain historical.

## Original Feature 006 setup

Recorded **2026-09-13** for Feature 006. The owner authorized creation of the
dedicated Mumbai pilot and signed into Supabase. `/root` owns Dashboard changes
and direct hosted evidence; this record contains no passwords, keys or account
emails. It does not establish pilot activation or external email delivery.

The owner subsequently chose a **zero-cost pilot for other adult registrants**
using a dedicated Gmail SMTP sender and declined a domain purchase. Resend with a
verified owned domain remains a later alternative, not an immediate launch gate.

## Project

| Setting                         | Recorded value                                                    |
| ------------------------------- | ----------------------------------------------------------------- |
| Project name                    | `ghaf-parent-pilot`                                               |
| Project reference               | `bqcfynlbxevqlzbkimhy`                                            |
| Project URL                     | [Ghaf Parent pilot API](https://bqcfynlbxevqlzbkimhy.supabase.co) |
| Organization / plan             | `kaz4n's Org` / Free                                              |
| Region                          | Mumbai, `ap-south-1`                                              |
| Dashboard health after creation | Healthy                                                           |
| Data API                        | Enabled                                                           |
| Automatically expose new tables | Off                                                               |
| Automatic RLS                   | On                                                                |

Only adult Auth identities, sessions and `public.pilot_access` approval are
authorized remotely. Child identities, family profiles, tasks, Seeds, gardens,
rewards and media remain synthetic app data. The dedicated project reference is
public configuration, not an authentication credential.

## Provisioning and schema evidence

| Check                                                  | Result                     | Evidence                                                                                                                                                 |
| ------------------------------------------------------ | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Owner-authorized project provisioning                  | **PASSED**                 | Root configured the creation form; the owner clicked Create. The named Mumbai project reported Healthy.                                                  |
| Empty-project preflight                                | **PASSED**                 | Root's read-only SQL returned zero Auth users and no `public.pilot_access` table.                                                                        |
| Approved migration application                         | **PASSED**                 | Root applied the exact repository file `supabase/migrations/20260913000100_pilot_access.sql` through the SQL Editor successfully.                        |
| Post-application schema, policies, grants and triggers | **PASSED**                 | Root's metadata-only SQL verified the exact schema and authority boundaries detailed below.                                                              |
| Post-application data counts                           | **PASSED**                 | `auth_users=0`, `pilot_rows=0`; the only public application table is `pilot_access`. No new data was created.                                            |
| Hosted core authentication configuration               | **PASSED**                 | Root verified the saved email, password, OTP and session settings detailed below.                                                                        |
| Hosted public Auth settings read                       | **PASSED**                 | Publishable-key GET `/auth/v1/settings` returned HTTP 200 with email enabled, anonymous disabled, email confirmation required and signup enabled.        |
| Anonymous approval API denial                          | **PASSED**                 | Anonymous GET `/rest/v1/pilot_access?select=user_id,status&limit=1` returned HTTP 401, code `42501`, permission denied.                                  |
| Hosted endpoint rate settings                          | **PASSED**                 | Root recorded the existing Dashboard verification, signup/signin and refresh limits without changing them.                                               |
| Email resend interval                                  | **PASSED**                 | Root reloaded the saved SMTP configuration and verified the persisted 60-second minimum interval.                                                        |
| Hosted bilingual email templates                       | **PASSED — configuration** | Both subjects persisted; after Dashboard reload, full saved bodies matched repository source with normalized newlines. Arabic/English previews verified. |
| Dedicated Gmail custom SMTP                            | **PASSED — configuration** | After the owner completed 2-Step Verification and app-password entry/save, Root reloaded SMTP and verified it enabled with the recorded settings.        |
| SMTP hourly email limit                                | **PASSED**                 | Root directly verified 30 emails/hour in the Dashboard Rate Limits screenshot.                                                                           |
| Actual external email delivery                         | **NOT RUN**                | No hosted authentication message has been sent or delivery verified. No paid upgrade or Send Email Hook was configured.                                  |
| Hosted app registration, login and recovery            | **NOT RUN**                | No hosted account-flow pass is inferred from local integration tests.                                                                                    |
| Pilot release activation                               | **BLOCKED**                | Required hosted email, native and activation evidence remains incomplete.                                                                                |

Root's read-only metadata verification confirmed:

- RLS is enabled. The four columns are non-null: UUID `user_id`, text `status`,
  and timestamp-with-time-zone `created_at` and `updated_at`. Constraints are the
  user primary key, the `pending | approved | suspended` status check, and the
  foreign key to `auth.users` with cascading deletion.
- The sole policy is `pilot_access_read_own`: SELECT for `authenticated`, with
  `(select auth.uid()) = user_id`. Anonymous CRUD grants are all false;
  authenticated SELECT is true and INSERT/UPDATE/DELETE are false; trusted
  `service_role` CRUD grants are true.
- Both trigger functions have an empty search path. Signup uses SECURITY DEFINER;
  timestamp updates use SECURITY INVOKER. EXECUTE is false for `anon`,
  `authenticated` and `service_role` on both functions. Both triggers are enabled
  (`O`) on their intended tables and events.

On the first verification attempt, the SQL Editor retained the prior migration
text and rejected a duplicate-table creation; that transaction changed nothing.
Root explicitly replaced the entire editor contents with fresh read-only queries,
which returned the verified results above.

The two public API checks were read-only and used the project publishable key.
They created no accounts, sent no emails and performed no writes. Anonymous API
denial confirms this boundary only; it does not replace a future approved
two-account hosted isolation check.

## Hosted Auth and email settings

| Setting                                                    | Verified value                                                     |
| ---------------------------------------------------------- | ------------------------------------------------------------------ |
| Email provider / new signup / Confirm email                | On / On / On                                                       |
| Phone, social providers, anonymous sign-in, manual linking | Off                                                                |
| Minimum password length                                    | 12; saved value confirmed in the Dashboard                         |
| Secure email change                                        | On                                                                 |
| Secure password change                                     | Off                                                                |
| Email OTP length                                           | Hosted default of 8 digits retained; app accepts 6 or 8 digits     |
| Email OTP expiry                                           | 3600 seconds                                                       |
| JWT expiry                                                 | 3600 seconds                                                       |
| Compromised refresh-token detection                        | On                                                                 |
| Refresh-token reuse interval                               | 10 seconds                                                         |
| Verification requests                                      | 30 per 5 minutes per IP; unchanged                                 |
| Signup/signin requests                                     | 30 per 5 minutes; unchanged                                        |
| Refresh requests                                           | 150 per 5 minutes; unchanged                                       |
| IP forwarding                                              | Off                                                                |
| Custom SMTP                                                | On; persisted value verified after reload                          |
| SMTP minimum resend interval                               | 60 seconds; persisted value verified after reload                  |
| SMTP hourly email limit                                    | 30 emails/hour; directly verified in Dashboard Rate Limits         |
| Site URL                                                   | Default `http://localhost:3000`; final approved web origin pending |
| Additional redirect URLs                                   | None                                                               |

The hosted 8-digit OTP default differs from the 6-digit local configuration. The
app was adjusted to accept either length; both configurations use a one-hour code
expiry. This configuration evidence does not demonstrate a completed hosted
verification or recovery flow.

The saved email resend interval is verified at 60 seconds. The final approved pilot
web origin remains pending; the Site URL still needs its separate configuration.

The Free Dashboard initially required custom SMTP before editing email templates.
After SMTP was saved, Root saved the repository's confirmation and recovery bodies
and their matching bilingual subjects through the Dashboard. After reload, both
subjects persisted and the full saved bodies matched repository source with
newlines normalized: confirmation 1,983 characters, recovery 2,075 characters, each
with exactly one `{{ .Token }}` placeholder. Both Dashboard previews showed
Arabic-first and English content. No paid Pro upgrade or Send Email Hook was
configured. These configuration checks do not establish hosted delivery,
login/recovery or public activation.

## Saved Gmail SMTP configuration

The owner completed 2-Step Verification, entered the app password directly into
Supabase and saved the SMTP settings. Root reloaded the page and observed these
persisted values with Save disabled, confirming no outstanding form changes:

| Field                   | Recorded value                                                           |
| ----------------------- | ------------------------------------------------------------------------ |
| Custom SMTP             | On                                                                       |
| Sender name             | `Ghaf — غاف`                                                             |
| SMTP host               | `smtp.gmail.com`                                                         |
| SMTP port               | `465`; Gmail uses implicit TLS on this port                              |
| Minimum interval        | `60` seconds                                                             |
| Sender email / username | Owner's dedicated Gmail address; omitted from this record                |
| Password                | Owner entered an app password directly; no value retained in this record |
| Hourly email limit      | 30 emails/hour; directly verified in Dashboard Rate Limits               |

The Google account password must not be used for SMTP.
Never put credentials in chat or the repository; keep real sender/recipient
addresses out of the committed repository.
Some Google account configurations do not expose app passwords; setup must resolve
that prerequisite without disabling verification or lowering account protection.
[Google app passwords](https://support.google.com/accounts/answer/185833?hl=en)

The Dashboard warns that Gmail is a personal rather than transactional email
provider and that deliverability may be affected. Gmail's 500-email/day consumer
ceiling is not guaranteed pilot capacity; throttling or temporary blocks remain
possible. The approved scope is a limited adult pilot, with email confirmation on,
30 emails/hour, at least 60 seconds between resends and controlled delivery checks
before invitations. No public-readiness claim follows from saving the form.
[Gmail sending limits](https://support.google.com/mail/answer/22839?hl=en),
[Supabase custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)

Google processes adult recipient addresses and authentication message content,
including codes, and Gmail SMTP automatically stores copies in Sent. This adds
an email-provider copy, not cloud family or Child records. Deletion in Supabase
does not establish deletion of these copies or complete provider erasure.
[Gmail SMTP sent copies](https://support.google.com/mail/answer/78892)

Next validate controlled adult delivery and complete account flows. No app-side
Resend integration is required. Physical Android acceptance also remains **NOT RUN**;
the latest `adb devices` check still listed no connected devices.

The existing local suite passed 37 PostgreSQL assertions against an isolated local
stack. That result does not pass hosted account isolation or delivery checks. The
canonical implementation acceptance record remains
`specs/006-real-parent-pilot/validation.md`.

## Local pilot launch configuration

Root retrieved the public project configuration and saved it only in the ignored
`.env.pilot.local` file. No public key value is reproduced in this operator record.
The dedicated command explicitly loads that file and clears the Expo/Metro cache:

```powershell
npm run start:pilot -- --web
```

The ordinary demo launch remains separate and unchanged. The dedicated command
started successfully on localhost port 8081. Brave directly displayed the Arabic
login (screenshot reviewed) and equivalent English controls. Direct `/parent` and
`/child` navigation both settled on the signed-out account gate, with no error-level
browser console entries. This is a **PASSED signed-out preview check** with hosted
public configuration, not registration, verified login, delivered email or public
activation. No credentials were entered. Initial browser requests occurred during
Metro's cold compilation; the final checks ran after bundling finished.

Final source checks passed: TypeScript, lint, formatting and 1,878 regression tests
with one worker. A two-worker run first hit the existing branding-config test's
5-second timeout; that file passed alone and the complete one-worker rerun passed.
The separate six/eight-digit compatibility selection passed all 71 tests.

## Reconcile migration history before using the CLI

Applying SQL in the Dashboard SQL Editor changes the schema but **does not register
the file as an applied CLI migration** in Supabase's migration history. Migration
version **`20260913000100`** was applied manually to this project.

Before the first linked `supabase db push`:

1. Verify the linked project is exactly `bqcfynlbxevqlzbkimhy` and inspect its
   migration history.
2. Compare the hosted schema, policy, grants and trigger definitions with the
   reviewed repository migration. Resolve any discrepancy before changing history.
3. Use a reviewed Supabase **migration repair** operation to mark version
   `20260913000100` as applied, without executing its DDL again. If history already
   records that exact version, verify it rather than adding a duplicate repair.
4. Inspect the migration list and a dry-run push. The already-applied table and
   functions must not appear as pending creation before any future push proceeds.

Do not blindly reapply this migration: it intentionally uses `create table` and
`create function` statements for a new project. No CLI history repair has been
performed as part of the recorded manual SQL application.

For the Auth settings, email templates, environment/cache handling and routine
approval/suspension/deletion procedure, use [the backend runbook](parent-pilot.md).
Future evidence updates must distinguish configured settings, delivered messages,
real account-flow results and physical Android acceptance.
