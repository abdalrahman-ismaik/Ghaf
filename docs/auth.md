# Persistent adult accounts

Feature 018 extends the existing Feature 006 adult Supabase account. The owner
requested profile, family, tasks and study synchronization on 2026-09-14. See
[the specification](../specs/018-persistent-adult-accounts/spec.md) and
[validation](../specs/018-persistent-adult-accounts/validation.md).

The 2026-09-14 backend maintenance applied the profile/workspace/provider-status
migrations to both the local Docker database and the existing hosted adult project.
Hosted independent Auth/HTTP data-isolation checks passed with disposable synthetic
provider accounts. External email delivery, full native acceptance and production
readiness remain separate gates. See [the hosted operator record](backend/hosted-pilot.md).

## Supported saved data

The authenticated account page contains the adult display name/language and a
private workspace: family name, member nicknames, Parent-managed task plans and
study plans. Plans support editing and completion. These records are saved by the
real provider and retrieved on another independently authenticated client.
Workspace members are nickname records owned by the signed-in adult; adding one
does not create a Child login or give another adult access to the household.

The existing sample family remains a separate explicit action. Its Child access,
task approval, Seeds, rewards, League, academic goals and prepared media retain
their current synthetic behavior. A cloud planning completion does not award Seeds
or constitute Child/academic/reward evidence. Full synchronization of that legacy
workflow is not implemented in this increment.

Device-local demo data is not imported, overwritten or attached to the next adult
who signs in. Existing local records stay local. The cloud workspace starts empty.
No tokens, pairing grants, remembered-device credentials or assistant/media state
are serialized into account data. A sample reset cannot delete server records.

## Configuration and migration

The competition default remains `EXPO_PUBLIC_GHAF_AUTH_MODE=demo`. For the real
account build, use the existing public configuration:

```dotenv
EXPO_PUBLIC_GHAF_AUTH_MODE=supabase
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_PUBLIC_KEY
```

Use the existing Supabase project, email confirmation/recovery templates and
administrator approval policy. New verified accounts remain pending until an
administrator approves their `pilot_access` row. No administrator/service-role key
belongs in Expo configuration. Auth email/abuse limits are enforced by Supabase;
the UI submit guard is not a security boundary.

Additive migrations:

- `20260914000100_account_profiles.sql`
- `20260914000200_account_workspaces.sql`
- `20260914000300_account_provider_status.sql`

They require the existing pilot-access migration. All three are now applied to
the local `ghaf-parent-pilot` database and the verified hosted adult project
`bqcfynlbxevqlzbkimhy`. The hosted baseline history was reconciled only after schema
comparison; the final dry run has no pending migration. The separate messaging
project uses its own migration stream and must not receive these migrations.

For local development with the existing Docker/Supabase CLI installation:

```powershell
supabase start --exclude studio,postgres-meta
supabase migration up --local
supabase test db supabase/tests/database/account_profiles.test.sql supabase/tests/database/account_workspaces.test.sql
```

Do not use `db reset` to bypass setup errors. The opt-in real-provider harness is
`tests/access/parent-account-local.integration.test.ts`: set
`GHAF_LOCAL_ACCOUNT_TEST=1` and `GHAF_LOCAL_SUPABASE_PUBLISHABLE_KEY` from local
status, then run that file with Vitest. It refuses non-loopback endpoints, creates
synthetic `@example.test` accounts, verifies local Mailpit codes and tests independent
sign-ins. Do not log the full CLI status; it also contains privileged test keys.

## Identity, persistence and logout

The canonical owner is `auth.users.id`. Profile/workspace initialization inserts
only when absent. Workspace/member/task/study IDs are generated on the server.
Each client signs in independently; no credentials are copied between devices.

The installed Supabase SDK owns refresh and its process lock. The existing native
adapter stores credentials through Expo SecureStore using Android Keystore-backed
encryption, with guarded, serialized chunk/manifest storage and explicit read,
write and deletion errors. Passwords are never persisted by the app. There is no
AsyncStorage token fallback. See [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
and [Supabase native lifecycle guidance](https://supabase.com/docs/guides/auth/quickstarts/react-native).

Startup restores and remotely validates the session before exposing account data.
Foregrounding revalidates access; the active gate also rechecks every 60 seconds.
Workspace foreground refresh and its explicit refresh button retrieve saved data.
Network failure preserves recoverable credentials. Failed startup/session
revalidation closes protected access; a failed profile or workspace load hides
the affected data until retry succeeds. A failed write retains the current
in-memory data and unsaved draft, shows an error and does not report success.
There is no durable private data cache or offline write queue in this increment.

Ordinary logout uses `scope: 'local'`, clears local access immediately and waits for
credential cleanup. It does not delete profiles/workspaces or sign out other
devices. Password recovery retains its separate existing global logout behavior.
Remote revocation failure and durable-storage failure are surfaced. Revoking refresh
tokens does not revoke an already-issued access JWT before its expiry; this is the
[provider's documented behavior](https://supabase.com/docs/reference/javascript/auth-signout).

Incomplete logout has a separate closed-access error screen. Retry repeats cleanup;
it cannot restore the prior account. A later successful local cleanup does not
confirm revocation of an unreachable remote session whose local credentials have
already been deleted. Stale provider events cannot reopen that account while
cleanup is incomplete.

Messaging currently has an independent configured identity boundary. It is not
linked by email. Entering a different adult account and logging out clear its local
credentials/private state; failed cleanup prevents subsequent sample access.

## Ownership and conflicts

RLS allows approved, verified owners to select only their own profile/workspace.
The shared predicate also reads current provider status: active bans, soft deletion
and anonymous identities deny reads and RPC writes even with a retained access JWT.
An expired ban may recover only when the normal verified/approved checks also pass.
Anonymous access and direct client insert/update/delete are denied. Narrow
security-definer RPCs use an empty search path and derive ownership from `auth.uid()`;
they never accept an owner ID. Workspace commands validate exact fields, lengths,
limits and member/record references inside that owner's workspace.

Every write requires the last observed server revision. A stale write fails without
overwriting server data. Editors retain the revision from when editing began;
foreground refresh cannot quietly rebase a stale draft. Explicit reload replaces
the draft. Success is shown only after server acknowledgment. A request already
committed on the server can remain saved even if logout prevents its response from
reaching the UI; logging in and refreshing retrieves the authoritative result.

Controllers and the service discard stale results on account changes/disposal.
Account UI is keyed by the stable owner. Nothing from an old account is used as an
initial value for another account.

## Android test artifact limitation

This host lacks the required NDK/CMake combination for a fresh native build. The
local test uses a freshly compiled working-tree Hermes bundle in the previously
verified native container. Package, dependency, native payload and resource hashes
are checked. The artifact is explicitly `testOnly=true` and requires `adb install -t`.
Only this ignored test artifact adds cleartext permission to reach
`http://127.0.0.1:54321` through an explicitly targeted `adb reverse`.

That permission is application-wide in the test artifact, not a domain-scoped
production policy. Tracked production configuration is unchanged. Do not distribute
this APK or use it for release performance claims. Hosted builds use HTTPS; a normal
native build remains required for release acceptance. Native and physical-device
results are recorded separately in the validation record.

## Two test installations on one emulator

The existing API 35 emulator now has `Ghaf — غاف` (`ae.ac.ku.ghaf.prototype`) and
`Ghaf Test 2` (`ae.ac.ku.ghaf.accounttest2`). They use separate Android UIDs, private
storage and independent provider sign-ins. Signing into the same account retrieves
the same server data; signing into different accounts retains separate private
workspaces. No credentials or storage were cloned. Both icons are in the app drawer.

The original is currently signed into synthetic user B; Test 2 retains synthetic
user A. The local Supabase backend must be running, with port 54321 reversed to the
explicit target emulator. Launch either existing installation with the SDK `adb`:

```powershell
adb -s emulator-5554 reverse tcp:54321 tcp:54321
adb -s emulator-5554 shell am start --user 0 -n ae.ac.ku.ghaf.prototype/.MainActivity
adb -s emulator-5554 shell am start --user 0 -n ae.ac.ku.ghaf.accounttest2/ae.ac.ku.ghaf.prototype.MainActivity
```

The second uses the distinct `ghaf-test2://` scheme. Its ignored artifact and
packaging/interaction receipts are in `.expo/dual-account-clients-20260914/`.
The original APK/data and tracked source/configuration were preserved. This bounded
test-only packaging shares the native-build limitation above; a normal Gradle
variant is still required for release acceptance. Native two-way task/study writes,
profile/family retrieval, restart persistence and local logout isolation passed.
This is same-emulator evidence, not verification on two separate devices. See
[the validation record](../specs/018-persistent-adult-accounts/validation.md).
