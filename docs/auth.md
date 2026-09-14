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

For a standalone hosted build, follow the
[internal Android APK guide](backend/internal-android.md). It includes the build
inputs, download, checksum and non-destructive installation workflow.

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

For local development with Docker and the validated Supabase CLI 2.117.0 on PATH
(or its executable path in `SUPABASE_CLI`):

```powershell
supabase start --exclude studio,postgres-meta,realtime,storage-api,imgproxy,edge-runtime,logflare,vector,supavisor
node scripts/backend/verify-local.mjs
```

The verifier applies pending local migrations, lints SQL and runs every database
test plus the real Auth harness. It rejects remote targets and leaves services
running. Do not use `db reset` to bypass setup errors. The opt-in real-provider harness is
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

## Final hosted internal APK evidence

[Build 34851035020](https://github.com/abdalrahman-ismaik/Ghaf/actions/runs/34851035020)
passed for source `5ad7faa63c90c63287b01da2045f58a1b17106d5`. The final artifact is
`output/android-internal-final/ghaf-internal-5ad7faa63c90.apk`, 88,134,244 bytes,
SHA-256 `6e809841e6824dca0f2ef4be339323f73e2ef079449bad1ed262329b1af45100`.
Its native update retained the installation UID and restored the valid hosted
session. Independent account A sign-in retrieved the saved profile, family, task
and study records. Three rapid completion taps produced one server revision
change, from 5 to 6. Recorded samples showed the preserved account shell and dark
status-bar icons without the earlier observed shell jump. Sampling does not
establish every-frame smoothness or physical-device performance.

Native logout retained the independent SDK session; switching to account B showed
empty private profile/family/task/study fields, and independent SDK requests as B
were denied access to A's records. Separate checks with animation scales at zero and font scale 1.5
passed logout and Back/deep-link access denial. Recovery keyboard behavior remains
**FAILED** with the tested floating Gboard toolbar: the first Back left recovery
instead of only dismissing the keyboard. Docked-keyboard behavior is **NOT RUN**;
no recovery email was sent in this check. External email delivery, full native
recovery/expiry/revocation, spoken TalkBack, separate-device and physical/human
acceptance remain open. Final fixture cleanup and restoration of operator settings
passed with separate receipts. See [Feature018 validation](../specs/018-persistent-adult-accounts/validation.md)
for the exact scenarios and [the APK guide](backend/internal-android.md) for
installation and internal-signing limitations.

## Historical localhost Android test artifacts

The earlier local account tests used a freshly compiled working-tree Hermes bundle
in the previously verified native container because this workstation lacked the
required NDK/CMake combination. Package, dependency, native payload and resource
hashes were checked. Those artifacts are explicitly `testOnly=true` and require
`adb install -t`. Only these ignored localhost test artifacts add cleartext
permission to reach
`http://127.0.0.1:54321` through an explicitly targeted `adb reverse`.

That permission is application-wide in those artifacts, not a domain-scoped
production policy. Do not distribute them or use them for release performance
claims. Test 2 still uses this localhost artifact. The original installation has
since been updated to a fresh Gradle-built hosted APK: it uses HTTPS, is not
test-only and has no cleartext exception. See the [internal APK guide](backend/internal-android.md)
for its exact identity, internal signing limitation and completed shell-fix build.
Native and physical-device results remain separately recorded in the validation
record; a successful internal build does not establish release acceptance.

## Two installations and their current backend environments

The existing API 35 emulator now has `Ghaf — غاف` (`ae.ac.ku.ghaf.prototype`) and
`Ghaf Test 2` (`ae.ac.ku.ghaf.accounttest2`). They use separate Android UIDs, private
storage and independent provider sign-ins. No credentials or storage were cloned.
Both icons are in the app drawer.

The original package now runs the fresh hosted APK against
`bqcfynlbxevqlzbkimhy`. Test 2 retains its earlier local Supabase configuration and
synthetic account data. These two currently installed copies therefore use
different backend environments; they do not synchronize with each other as-is.
The original needs no local Docker service or port forwarding. Test 2 still needs
the local Supabase backend and port 54321 reversed to the explicit target emulator.
Launch the original hosted installation with the SDK `adb`:

```powershell
adb -s emulator-5554 shell am start --user 0 -n ae.ac.ku.ghaf.prototype/.MainActivity
```

For the retained localhost Test 2 installation:

```powershell
adb -s emulator-5554 reverse tcp:54321 tcp:54321
adb -s emulator-5554 shell am start --user 0 -n ae.ac.ku.ghaf.accounttest2/ae.ac.ku.ghaf.prototype.MainActivity
```

The second uses the distinct `ghaf-test2://` scheme. Its ignored artifact and
packaging/interaction receipts are in `.expo/dual-account-clients-20260914/`.
Before the original was updated, both copies used the same local backend. That
earlier test passed native two-way task/study writes, profile/family retrieval,
restart persistence and logout isolation through independent sign-ins. The
original local fixture was signed out before its hosted update; local account
data was not migrated to the hosted project. The fresh hosted APK was subsequently
tested with an independently authenticated SDK client. These are separate results,
not two current hosted native clients or verification on two separate devices. See
[the validation record](../specs/018-persistent-adult-accounts/validation.md).
