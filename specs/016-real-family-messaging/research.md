# Architecture and reference decisions

## Managed identity and relational storage selected

Supabase Auth issues real sessions and supports anonymous installation identities distinct from an
API key. Anonymous identities still require explicit Ghaf enrollment; authenticated alone never means
Parent or thread access. Use an operator allowlist and server device/session joins, not editable
user metadata. [Auth anonymous](https://supabase.com/docs/guides/auth/auth-anonymous).

Provider session JWTs include session_id; checking the corresponding auth.sessions row supports
immediate denial after session deletion rather than waiting only for token expiry. Ghaf also checks
its own active device/account on every RPC. [Sessions](https://supabase.com/docs/guides/auth/sessions).

Use least-privilege RPCs and deny table access with RLS. Publishable keys may be in clients; secret /
service-role keys must stay server-side. [Data security](https://supabase.com/docs/guides/database/secure-data),
[database functions](https://supabase.com/docs/guides/database/functions).

Alternatives: a custom Node/password/SQLite server avoids provider setup but adds password/session
operations and hosting maintenance; rejected for this student team. Firebase managed Auth/Firestore
would need comparable enrollment authorization plus a different durable ordering/transaction model;
no existing project advantage found. Existing AI Workers lack identity, membership and durable chat
and cannot simply become a messaging gateway. Supabase adds one service, no client SDK, and testable
SQL boundaries. No price, region, account availability or production suitability is assumed.

## Measured credential gap

Current package/source inspection finds SQLite KV, web localStorage and memory storage, but no secure
native credentials adapter. Add only Expo-version-aligned expo-secure-store. The platform API uses
OS credential facilities; Android backup/uninstall behavior and native failure cases require a real
build/device check. Web remains memory-only. [SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/).
Auth fetch shapes are checked against [provider OpenAPI](https://github.com/supabase/auth/blob/master/openapi.yaml).
No password, refresh token or message body is logged in routine receipts.

## Retention and operating setup

Adopt30day text history and hourly deletion; use provider cron only after its actual installation.
[pg_cron](https://supabase.com/docs/guides/database/extensions/pg_cron). Public/real-Child rollout requires
recorded provider region, backup retention, operator access and anonymous-sign-in abuse controls.
Controlled team test uses existing provider rate limits plus bounded enrollment/message RPCs; a
public anonymous signup endpoint is not represented as abuse-proof. No production deployment here.

## UI and artwork

Use C's section13 Booking identified-person→Message hierarchy and Wallet375×60 recipient anatomy,
translated into original botanical Ghaf controls >=48dp. Exclude maps, finance, ratings, contact
import, sample people, template code/fonts/art and unimplemented call icons. The eight AR/EN HTML
sketches are proposed compositions, not runtime or human acceptance. Sources: C's released
`messaging-calls-20260913-c/{index.html,references.json,sources.json}` and template catalog.

Use original user-created avatar3 PNG, inspected directly, as a contained stable portrait. No
Flutter/generated files or random motion. Keep AI/fallibility/prepared labels, approved task bounds,
adult exit and original service safeguards. Human-message text is never assistant input.

## Calling remains unselected technical work

LiveKit Expo currently requires native WebRTC packages/plugins and a custom build. Exact Expo57 /
ReactNative0.86 compatibility is NOT VERIFIED; no SDK selected or installed.
[LiveKit Expo](https://docs.livekit.io/transport/sdk-platforms/expo/).
TDRA's VoIP framework requires provider/service eligibility; technical SDK support alone does not
establish UAE availability. Eligibility and intended networks remain BLOCKED for V1 selection.
[TDRA](https://tdra.gov.ae/en/About/tdra-sectors/information-and-digital-government/departments/policy-and-programs-department/internet-guidelines).
T1/V1/V2/V3 need separate accepted contracts after real text; no calls advance during this milestone.
