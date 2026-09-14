# Release security and privacy evidence

Date: **2026-09-14**. Internal Feature021 assessment; public-release status remains
**BLOCKED**. This records implementation and missing evidence, not a public privacy
policy or a compliance determination. Operator identity, support contact, retention
commitments and public policy URLs have not been supplied or verified.

Authority: [Feature021](../../specs/021-release-readiness/spec.md),
[release ledger](release-readiness.md) and
[coordination record](coordination/STATUS-RELEASE-20260914.md).

## Evidence boundaries

- **Current source, helper inspection:** app configuration, account/storage code,
  family migrations, settings/account UI and server AI adapters. Feature020 is
  actively changing; a migration file does not prove hosted deployment or execution.
  No private rows, credentials or provider requests were inspected by this helper.
- **Production metadata, root Dashboard inspection:** selected main project
  `bqcfynlbxevqlzbkimhy` / `ghaf-parent-pilot`, Mumbai (`ap-south-1`), Free/Nano;
  26 tables with RLS, none shown disabled; no Storage buckets, Edge Functions or
  project backups. These observations do not prove that every RLS policy is correct,
  that another project has the same state, or that recovery works.
- **Auth metadata, root inspection:** Site URL is `http://localhost:3000`, with no
  redirect allowlist. This requires reconciliation with intended web/link flows;
  the native OTP flow may intentionally avoid redirects. No broken OTP behavior is
  inferred from this setting alone.
- **Prior compiled APK:** permission evidence is from source `5ad7faa63c90`, retained
  locally under `output/android-internal-final/` (`build-receipt.json`, `badging.txt`).
  It is not a build of current Feature020 or the later permission fix.
- **Not verified here:** current APK manifest/network traffic, physical-device
  behavior, store declarations, public legal/support hosting, provider retention,
  deletion across recipients, production restore or scheduled retention execution.

## Data map

Recipients below describe intended source-enforced access, not an independent
hosted authorization pass. Supabase operates the account backend; family access is
bounded by membership/RPC checks. The older separate messaging project must not be
silently included in main-project deletion or recovery claims.

| Data and purpose                                                                           | Storage and recipients                                                                                                                                                                                                                                                                                                     | Retention and deletion evidence                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Adult email/password for authentication; managed Child Auth identity and session           | Supabase Auth through the [account service](../../src/services/accounts/SupabaseParentAccountService.ts#L705). Session persistence uses [native SecureStore](../../src/services/accounts/platformStorage.ts#L8); [web localStorage](../../src/services/accounts/platformStorage.web.ts#L6) is a separate exposure surface. | [Sign-out clears local credentials](../../src/services/accounts/storage.ts#L77), not the account or family records. No end-to-end account-erasure path was found. Provider operational-log retention is unverified.                                                                                                                        |
| Adult display name/locale; family names; Child names and coarse age bands                  | [Account profiles](../../supabase/migrations/20260914000100_account_profiles.sql#L3) and [family tables](../../supabase/migrations/20260915000100_family_accounts.sql#L4) in the main database. Parents manage their family; Child projections are scoped.                                                                 | No finite family/profile retention policy found. Current family ownership and membership reference Auth users without cascading deletion; older profile cascade behavior is insufficient for complete erasure.                                                                                                                             |
| Membership, paired session IDs and hashed invitations for device/family authorization      | [Membership and invitation tables](../../supabase/migrations/20260915000100_family_accounts.sql#L21); authorized family operations and backend operator.                                                                                                                                                                   | Invitations expire after ten minutes; expiry/revocation is not physical deletion. No general invitation/receipt purge was located.                                                                                                                                                                                                         |
| Task wording, status, help requests, praise, recognition, growth and memories              | [Task/recognition/memory tables](../../supabase/migrations/20260915000100_family_accounts.sql#L59); scoped Parent/Child projections.                                                                                                                                                                                       | Growth is permanent within the product lifecycle. [Memory removal timestamps the row](../../supabase/migrations/20260915000100_family_accounts.sql#L454), retaining its title. Account-erasure handling remains undefined.                                                                                                                 |
| Study plans, academic goals/prizes, connections, preferences, saved templates and learning | [Validated family documents](../../supabase/migrations/20260915000200_family_documents.sql#L1) in the main database, with role/kind-specific access. Private rewards remain promises, not payment processing.                                                                                                              | Some commands remove document rows, but [request receipts retain submitted commands](../../supabase/migrations/20260915000200_family_documents.sql#L434). No comprehensive retention/erasure treatment of those copies was found.                                                                                                          |
| Human message body, sender/thread IDs and read position for family communication           | [Main message tables](../../supabase/migrations/20260915000400_family_messages.sql#L19); authorized participants. Parent management of sibling permissions does not itself grant conversation access.                                                                                                                      | Source filters/purges messages after [30 days](../../supabase/migrations/20260915000400_family_messages.sql#L255); an [hourly job](../../supabase/migrations/20260915001400_family_message_retention.sql#L12) is defined. Successful hosted execution is unverified here; account deletion and operational copies need separate treatment. |
| Explicit synthetic demo state and local audio preferences                                  | [SQLite key/value storage on native](../../src/services/local/storage.native.ts#L1), localStorage on web. Demo content is isolated from real account authority.                                                                                                                                                            | Local reset/storage lifecycle applies; reset is not a hosted deletion request. Do not import demo records into accounts or describe local reset as server erasure.                                                                                                                                                                         |
| Optional bounded AI input, transcript and short voice clip                                 | Default-off adapters: Cloudflare [Workers AI text](../../workers/ghaf-ai-gateway/src/operations.ts#L159), [transcription](../../workers/ghaf-ai-gateway/src/voice.ts#L38), optional server-side [Google Gemini text](../../workers/ghaf-ai-gateway/src/gemini.ts#L174). No provider secret belongs in Expo.                | The app's [capability broker remains blocked](../../src/services/mock/boundedAi.ts#L99). Local file/byte cleanup does not establish provider deletion, training exclusions or retention. Real-content activation remains blocked by the [AI approval boundary](../../workers/ghaf-ai-gateway/README.md#L3).                                |

## Android and SDK evidence

The prior APK declares `INTERNET`, `MODIFY_AUDIO_SETTINGS`, `RECORD_AUDIO`,
`SYSTEM_ALERT_WINDOW`, `VIBRATE`, `ACCESS_NETWORK_STATE`, `WAKE_LOCK`,
`USE_BIOMETRIC`, `USE_FINGERPRINT` and the app's signature-protected dynamic-receiver
permission. No location, camera, contacts, notification or external-storage
permission appears in that retained badging output. This is a declaration inventory,
not evidence that every permission was requested or used at runtime.

Current [audio configuration](../../app.config.ts) disables background recording
and playback. [Microphone prompting](../../src/services/native/ExpoVoiceCaptureService.ts#L229)
is explicit; capture is capped at 15 seconds. Expo Audio contributes audio settings;
Expo SecureStore depends on AndroidX Biometric. Installed dependencies also include
Supabase JS, Expo SQLite and Expo FileSystem. No advertising/analytics SDK was
identified in the reviewed direct dependency list; this does not replace a
transitive SDK and actual-network inventory.

## Dependency triage — 2026-09-14

Root's retained `npm audit --omit=dev --json` result at
`.expo/release-20260914/dependency-audit.json` reports **15 affected package
entries: 14 moderate and one high**, arising from **three distinct advisories**.
The helper read that result, the [lockfile](../../package-lock.json) and installed
imports; it did not rerun audit, install dependencies, build or exercise a payload.
`--omit=dev` includes Expo's transitive build tools and does not establish which
code executes on a phone. The installed baseline is Expo 57.0.20, Router 57.0.19
and React Native 0.86.3. This is a scoped advisory triage, not a complete dependency
or release-bundle security assessment.

| Advisory / priority                                                              | Actual dependency path and exposure                                                                                                                                                                                                                                                      | Remediation and current limit                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DEP-01 / high upstream; patch pending installed validation                       | `@expo/xcpretty@4.4.4 → js-yaml@4.3.1`; development ESLint also consumes it. `@expo/xcpretty/build/utils/parsePodfileLock.js:7,15` parses an iOS build file. No application/Worker YAML import was found.                                                                                | Repeated empty YAML merge sources can consume excessive CPU; upstream fixes the installed major line in **4.3.2**. Root changed only the lockfile to 4.3.2 within existing `^4.1.0` / `^4.3.0` ranges. Shared `node_modules` remains 4.3.1 while another lane builds; no patched installed-tree or APK claim. Verify a clean isolated install and fresh audit/build. [Maintainer advisory](https://github.com/nodeca/js-yaml/security/advisories/GHSA-2883-xcg3-v3hh).                                                                                                                                                                                                                                    |
| DEP-02 / moderate upstream; runtime reachability review remains open             | `expo-router@57.0.19 → query-string@7.1.3 → decode-uri-component@0.2.2`. This chain is imported by runtime navigation, not merely a CLI. The active Expo inbound path uses `URL.searchParams`; the vulnerable upstream fallback parser still exists. Details below distinguish them.     | Malformed encoded input can exhaust CPU. Upstream fixes versions through 0.4.2 in **0.5.0** and lists input-size limiting as a workaround. No controlled-input call or device reproduction was established here. Prefer a compatible Router dependency correction; a blind override crosses `^0.2.2` and changes the decoder from CommonJS to ESM while query-string expects a callable `require`. Validate module interop and parsing before any override. [Maintainer advisory](https://github.com/SamVerschueren/decode-uri-component/security/advisories/GHSA-vcc3-ghjq-m6fr), [patched package metadata](https://raw.githubusercontent.com/SamVerschueren/decode-uri-component/v0.5.0/package.json). |
| DEP-03 / moderate upstream; observed call does not meet the vulnerable condition | `@expo/config-plugins@57.0.9 → xcode@3.0.1 → uuid@7.0.3`; Expo CLI/config/Metro/prebuild/splash entries inherit this finding. `xcode/lib/pbxProject.js:23,90` generates project IDs using `uuid.v4()` with no output buffer. No direct app/Worker import of this uuid package was found. | The advisory concerns **v3/v5/v6 methods with caller-supplied buffer/offset**, not the observed v4 call. Source review classifies this path as configuration/iOS tooling, not mobile account-ID generation. Patched lines start at 11.1.1, 12.0.1 and 13.0.1; none satisfies xcode's `^7.0.3`. A tested upstream tool update or narrowly reviewed override is future work; 11.1.1 retains CommonJS exports but is not an automatically compatible upgrade. [Maintainer advisory](https://github.com/uuidjs/uuid/security/advisories/GHSA-w5hq-g745-h8pq), [11.1.1 exports](https://raw.githubusercontent.com/uuidjs/uuid/v11.1.1/package.json).                                                           |

Installed Router tracing found these distinct paths:

- `getLinkingConfig.js:90` supplies the Expo fork;
  `link/linking.js:45` selects `fork/getStateFromPath`, whose query handling at
  `fork/getStateFromPath-forks.js:370` uses `URL.searchParams`.
- `fork/getPathFromState.js:273` and `fork/getPathFromState-forks.js:71` use
  `query-string.stringify`, which does not invoke its decoder on that path.
- `react-navigation/core/getStateFromPath.js:499` still calls
  `query-string.parse`; `query-string/index.js:233` then calls the affected decoder.
  NavigationContainer/useLinking provide this upstream parser as a fallback.
  Normal Expo linking supplies its own parser, so package inclusion alone does
  not demonstrate that a hostile incoming URL reaches the fallback. An exact
  release-bundle call-path check remains necessary before claiming exclusion.

A small independent hardening opportunity is a new `app/+native-intent.tsx`
`redirectSystemPath` guard for **both cold and warm native links**: bound raw input
before decoding, reject malformed encoding without logging URL/token contents,
and return a safe existing entry route on rejection. Preserve valid Arabic and
existing route parameters; leave authentication to the existing authority.
Installed Router calls this hook for both paths, consistent with
[Expo's documented hook](https://docs.expo.dev/router/advanced/native-intent/).
This is a proposed input-boundary mitigation, not an implemented decoder fix or
proof that the fallback is reachable. It does not cover web URLs or arbitrary
internal parser calls; those need separate routing/hosting evidence. Focused
checks should verify benign/malformed input, preserved parameters and no decoder
call after rejection before current native link acceptance.

Do not apply the audit's proposed Expo 46 / Router 5 / splash-screen 55 downgrade
to this SDK57 application. Those suggestions do not establish framework
compatibility. Root owns dependency changes and subsequent audit results; this
helper changed only this report. Workflow `34888514880` at `d13c148` was still in
progress at the reported checkpoint and does not contain the later local YAML
lockfile patch. No patched artifact, current native pass or zero-finding result is
claimed. DEP-02 needs explicit acceptance evidence before release; DEP-03 retains
a scoped source-based rationale, not a blanket waiver of tooling updates.

## Findings and completed mitigations

P1 means a public-release blocker; P2 means bounded hardening or verification work.

| ID / severity             | Finding and next acceptance evidence                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| PRIV-01 / P1              | Account/dependent-data deletion has no discoverable in-app or external request path. Implement identity-verified initiation and authorized processing across Auth, families, memberships, documents, receipts, messages and other recipients; demonstrate completion and any justified retention. Sign-out and demo reset are insufficient.                                                                                    |
| PRIV-02 / P1              | No verified public privacy/support/deletion pages or accountable operator/contact. Establish real ownership and hosted URLs, bilingual in-app access, data-recipient disclosures and accurate store declarations. This document must not be published as the privacy policy.                                                                                                                                                   |
| PRIV-03 / P1              | Child-directed SDK eligibility, notices, adult-controlled social features and store audience/Data safety declarations need a complete review. Existing age bands and Parent controls are implementation inputs, not Families-policy acceptance.                                                                                                                                                                                |
| PRIV-04 / P1              | Root found no project backups on Free. No independent restore proof or operational recovery owner is established. Agree recovery objectives, protect an authorized backup and prove restore in an isolated environment; include Storage objects separately if introduced. No production export/restore was performed for this audit.                                                                                           |
| PRIV-05 / P1              | Retention/deletion is incomplete beyond message expiry: command receipts retain payloads and memory removal retains rows. Define per-record and provider handling, then verify physical purge, authorized exceptions and restored-backup behavior.                                                                                                                                                                             |
| SEC-01 / P2, source fixed | Replay fallback removed in `a6b57f6`: [gateway authorization](../../workers/ghaf-ai-gateway/src/index.ts#L283) rejects a missing store before reading input or invoking providers. Five new rejection cases failed before the fix; 18 focused tests passed afterward. Explicit local test adapters remain supported. Durable distributed replay/budget adapters and deployment evidence are still absent; live AI remains off. |
| SEC-02 / P2, source fixed | Unused overlay permission blocked in `bb75cbb`; configuration and artifact rejection guard are implemented. The old APK still contains it. Require a fresh merged manifest and unchanged supported voice/secure-storage behavior before closing native verification.                                                                                                                                                           |
| SEC-03 / P2               | Reconcile remaining merged permissions and SDK processing with actual product use. Verify configured auth URLs against each intended OTP/link/web journey; `localhost` metadata alone is not a reproduced authentication defect.                                                                                                                                                                                               |

## Official reference checks — 2026-09-14

- Google Play account creation requires an in-app deletion path and a web resource
  for requesting deletion of the account and associated data. A qualifying in-app
  link may initiate the web process. [Account deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111).
- Families requirements cover Child-data disclosure, APIs/SDKs and adult controls
  for social features; actual age targeting must be reflected accurately in store
  declarations. [Families policies](https://support.google.com/googleplay/android-developer/answer/9893335).
- Apps including Children in their target audience are subject to Families
  requirements; target-audience setup requires a privacy policy and accurate
  content/access information. [Target audience and content](https://support.google.com/googleplay/android-developer/answer/9867159).
- Managed daily backups are described for paid plans; Free projects are advised
  to maintain regular off-site exports. Database backups exclude Storage object
  contents. This agrees with root's observed absence of Free project backups.
  [Supabase database backups](https://supabase.com/docs/guides/platform/backups).

These are dated policy/operations inputs, not legal advice or proof of acceptance.
Root owns integration, current native/backend evidence and the release verdict.
Next action: reconcile this map against the coherent Feature020 candidate and
close P1 gates with direct evidence before publication.

## Subsequent root execution

The compatible YAML patch is committed as `f129b7f`. An isolated4.3.2 install
rejected the bounded empty-merge input accepted by4.3.1; all three workflow parse
results were identical. The locked production audit now reports0high/14moderate;
fresh repository/backend CI for that commit passed. Shared local node_modules was
left unchanged during the other lane's native build. This does not close DEP-02
or claim an APK with the patch has been accepted.

Root independently compared deployed/local schema metadata:26tables,5policies,
60indexes,144constraints, grants and Realtime publication matched. Two earlier
trigger body hashes differed only by line endings; the hosted platform event
trigger is separate. Root later deployed the one-predicate Help migration015
with local tests, exact dryrun and schema-only corrective DDL, then passed ordinary
restricted Parent/Child Help/retry/readback checks. No privilege grant or award
authority changed, and no private family data was exported.

Additional Dashboard observations: only Email is enabled among displayed adult
providers; email confirmation and anonymous Child sign-in are enabled, manual
linking is off. Access tokens expire after3600seconds, refresh replay detection
is enabled with10second reuse interval. Single-session/timebox/inactivity controls
are unavailable on this Free plan; no paid change was made. Anonymous sign-ins
are limited to30/IP/hour; signup/sign-in and OTP checks to30/IP/5minutes, refresh
to150/IP/5minutes. These configured limits are not abuse/load-test acceptance.

Confirmation/recovery previews contain one-time codes and one-hour expiry;
pilot/sample-copy remains to reconcile before public launch. Root subsequently
read back the scheduled retention success at19:45UTC and active restored hourly
job; no message content or purge was requested by this lane. Database/media
backup and restore, account erasure and accountable support remain blocked.
