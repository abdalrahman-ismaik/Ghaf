# Real accounts and family access

Feature 020 extends the existing Supabase adult authentication into real family
data and backend-enforced managed Child access. It supersedes Feature 018's
planning-only application boundary. See the [current specification](../specs/020-supabase-family-data/spec.md),
[family-data setup and evidence](backend/family-data.md), and
[migration inventory](competition-readiness/supabase-data-migration.md).

Supabase is now the normal authentication mode. New families start with their actual
founding Parent and no Children, assignments, earned progress or fabricated history.
Returning accounts retrieve their saved records; sign-in never resets them. The
explicit `npm run start:demo` mode remains synthetic and separate from real accounts.

Reviewed additive family migrations have been applied to the existing hosted
pilot project (labelled main / Production), with restricted-identity SQL and independent HTTP/service
checks. Those results do not establish a verified Feature 020 Android build,
physical-device acceptance, email delivery or production readiness. The linked
inventory records exact migration coverage and remaining work.

For a standalone hosted build procedure, follow the
[internal Android APK guide](backend/internal-android.md). It includes the build
inputs, download, checksum and non-destructive installation workflow.

## Supported saved data

The real account flow saves the adult profile/language, families and memberships,
managed Child profiles, custom templates and assignments, task completion and
Parent recognition, permanent Seeds/landscapes/canopy, eligible text memories,
study plans and academic goals/prizes, family connections/preferences, learning
evidence, private reward promises, League and human messages to Supabase. Shared
catalog and educational content remain reference material, not personal history.

The earlier adult-owned planning workspace remains available separately. Its member
nicknames do not create Child identities or family memberships. Existing planning
records are preserved, and their historical completion flags never grant Seeds,
academic verification or reward evidence. No automatic workspace or local-demo
import is performed.

Account-owned profiles and legacy plans are private to the authenticated owner.
Family-shared records use authoritative membership and Child ownership. A joining
member sees legitimately shared records without duplicating or resetting them.
Conversations remain participant-only; Parent membership alone does not expose
another Parent's messages or a Child–Child conversation.

Device-local demo data is never attached to the next person who signs in. The sample
remains an explicit separate experience; resetting it cannot delete server records.
There is no permanent user-uploaded photo, attachment or recording flow in this
increment: memories are text, artwork is bundled reference content, and temporary
recordings remain outside saved family history.

## Configuration and migration

Use the existing public configuration in the ignored `.env.pilot.local`:

```dotenv
EXPO_PUBLIC_GHAF_AUTH_MODE=supabase
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_PUBLIC_KEY
```

Start the configured account app with `npm run start:pilot` or
`npm run start:pilot -- --web`. Its existing script name is retained. An absent mode
selects Supabase; invalid mode, missing configuration or failed authentication does
not fall back to demo records. For an explicitly synthetic preview, run
`npm run start:demo -- --web --offline`.

Use the existing Supabase project, email confirmation/recovery templates and
administrator approval policy. New verified accounts remain pending until an
administrator approves their `pilot_access` row. No administrator/service-role key
belongs in Expo configuration. Auth email/abuse limits are enforced by Supabase;
the UI submit guard is not a security boundary.

The versioned migrations under `supabase/migrations/` extend the existing
pilot-access/profile/workspace schema. The verified account project is
`bqcfynlbxevqlzbkimhy`; the separate historical messaging project must not receive
these migrations. Follow [family data](backend/family-data.md) for exact migration
order, schema/configuration review and remaining deployment steps. Do not assume
that an earlier successful dry run includes later migration files.

Feature 020 requires anonymous Auth for restricted Child pairing and the authorized
`app_families` Realtime publication. Anonymous signup by itself grants no family
access. Earlier adult-only instructions to disable anonymous Auth and Realtime
describe Feature 006/018 and do not apply to this family configuration.

For local development with Docker and the validated Supabase CLI 2.117.0 on PATH
(or its executable path in `SUPABASE_CLI`):

```powershell
supabase start
supabase migration up --local
supabase test db
```

These commands start the local project, apply additive migrations and exercise its
SQL tests. Use the family-data guide's restricted-client HTTP checks as a separate
layer; SQL or mocked controller tests alone do not prove SDK behavior. Do not use
`db reset` to bypass setup errors. The earlier opt-in adult-only harness is
`tests/access/parent-account-local.integration.test.ts`: set
`GHAF_LOCAL_ACCOUNT_TEST=1` and `GHAF_LOCAL_SUPABASE_PUBLISHABLE_KEY` from local
status, then run that file with Vitest. It refuses non-loopback endpoints, creates
synthetic `@example.test` accounts, verifies local Mailpit codes and tests independent
sign-ins. It remains regression coverage for its earlier scope, not full family
acceptance. Do not log the full CLI status; it also contains privileged test keys.

## Parent and Child identity

An adult Auth user, a family membership and a managed Child profile are separate
records. A Parent creates a Child with a chosen display name and age band; no demo
children, fake emails or shared passwords are created. Current Free family capacity
is enforced by the backend; demo premium flags do not grant real entitlements.

For a separate Child device, the Parent creates a ten-minute single-use pairing
token. The signed-out Child device uses its own Supabase anonymous Auth identity
and redeems that token through an authorized RPC. The backend binds its live session
to the exact managed Child. It never receives the Parent's token or privileges.
Token hashes, expiry and revocation are enforced on the server. A selected local
role, remembered avatar or unpaired anonymous session cannot grant family access.

Inviting another Parent requires a server-issued family invitation and an already
approved adult account. Direct membership insertion and self-promotion are denied.
Parent revocation removes paired-device access while keeping the Child profile and
earned history. Restrict test pairing to isolated development families.

## Identity, persistence and logout

The adult identity is `auth.users.id`; family and Child UUIDs identify different
owners. Profile initialization inserts only necessary missing records. Family
creation and related writes use server authority and request IDs, so callbacks and
retries do not create duplicate families or rewards. Each adult client signs in
independently, and Child devices pair independently; credentials are not cloned.

The installed Supabase SDK owns refresh and its process lock. The existing native
adapter stores credentials through Expo SecureStore using Android Keystore-backed
encryption, with guarded, serialized chunk/manifest storage and explicit read,
write and deletion errors. Passwords are never persisted by the app. There is no
AsyncStorage token fallback. See [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
and [Supabase native lifecycle guidance](https://supabase.com/docs/guides/auth/quickstarts/react-native).

Session storage is scoped to the backend project. An older matching-project
credential may be considered for migration only after identity validation; it does
not authorize an account by decoded metadata or import any sample data.

Startup restores and remotely validates the session before exposing account data.
Foregrounding revalidates access; the active gate also rechecks every 60 seconds.
Family revision notifications, foreground refresh and explicit refresh retrieve
saved records through authorized RPCs. Realtime carries a coarse revision signal;
it is not the durable copy of tasks or messages.
Network failure preserves recoverable credentials. Failed startup/session
revalidation closes protected access; a failed profile or workspace load hides
the affected data until retry succeeds. Account/family controllers reject identity
or membership denial, clear private state and disregard old in-flight responses.
Network failures do not become empty accounts. Failed mutations show an error;
uncertain family commands retain their exact request ID for an explicit safe retry.
There is no durable private family-data cache or offline write queue.

Ordinary logout uses `scope: 'local'`, clears local access immediately and waits for
credential cleanup. It does not delete family/profile/workspace records or sign out other
devices. Password recovery retains its separate existing global logout behavior.
Remote revocation failure and durable-storage failure are surfaced. Revoking refresh
tokens does not revoke an already-issued access JWT before its expiry; this is the
[provider's documented behavior](https://supabase.com/docs/reference/javascript/auth-signout).
Family operations additionally require the corresponding live server session and
active membership; retaining a JWT does not bypass those application checks.

Incomplete logout has a separate closed-access error screen. Retry repeats cleanup;
it cannot restore the prior account. A later successful local cleanup does not
confirm revocation of an unreachable remote session whose local credentials have
already been deleted. Stale provider events cannot reopen that account while
cleanup is incomplete.

Main-account messages use the same trusted family identity, with participant-only
access and Parent-controlled optional sibling text. The older separately configured
messaging project is preserved without email/name matching or automatic import.
Switching accounts removes old subscriptions and private screen state. Transport
calls pin the originating user and verified bearer token; a queued request cannot
silently run as the next account.

## Ownership and conflicts

RLS allows approved, verified adult owners to read their own profile and legacy
workspace. Family helpers check live Auth/session status, founding-owner approval,
active membership and in-family Child references. Paired Child identities receive
only their permitted projection; bare anonymous sessions receive none. Direct
client mutations of authority, balances, rewards and application records are denied.
Narrow RPCs use a constrained search path, derive the caller from trusted Auth and
validate any supplied family/Child/record UUID against that authority.

Updates that edit versioned records require the observed server revision. A stale write fails without
overwriting server data. Editors retain the revision from when editing began;
foreground refresh cannot quietly rebase a stale draft. Explicit reload replaces
the draft. Success is shown only after server acknowledgment. A request already
committed on the server can remain saved even if logout prevents its response from
reaching the UI; logging in and refreshing retrieves the authoritative result.

Controllers and the service discard stale results on account changes/disposal.
Account UI is keyed by the stable owner. Nothing from an old account is used as an
initial value for another account.

Task confirmation, recognition and memory creation are transactional and retry-safe.
The client cannot assign earned totals, badges or premium status. Private reward,
League and other sensitive Parent changes require a recent server-verifiable
password authentication event; a local PIN or hidden control is not sufficient.

## Feature 020 verification boundary

The [migration inventory](competition-readiness/supabase-data-migration.md) records
the executed SQL, restricted Auth/HTTP clients and application-service scenarios.
Fresh and returning accounts, separate-family attacks, Child restrictions,
duplicate requests and account switching are checked at their stated levels.
Native build/device/recovery and complete two-physical-device acceptance remain
separate; the historical APK evidence below does not pass Feature 020.

## Historical Feature 018 hosted internal APK evidence — 2026-09-14

This section records the earlier adult planning-only source and artifact. It does
not describe the current Feature 020 family application or a newly verified build.

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

## Historical installation snapshot — 2026-09-14

At this recorded Feature 018 checkpoint, the API 35 emulator had `Ghaf — غاف` (`ae.ac.ku.ghaf.prototype`) and
`Ghaf Test 2` (`ae.ac.ku.ghaf.accounttest2`). They use separate Android UIDs, private
storage and independent provider sign-ins. No credentials or storage were cloned.
Both icons are in the app drawer.

At that checkpoint, the original package ran the hosted APK against
`bqcfynlbxevqlzbkimhy`. Test 2 retains its earlier local Supabase configuration and
synthetic account data. Those two recorded copies therefore used
different backend environments and did not synchronize with each other as-is.
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
