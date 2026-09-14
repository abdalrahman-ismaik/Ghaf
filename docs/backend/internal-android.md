# Internal Android APK

The [Internal Android APK workflow](../../.github/workflows/android-internal.yml)
builds a fresh native APK on GitHub's Ubuntu 24.04 runner. It generates Android
from the committed Expo configuration, installs the pinned native toolchain and
runs Gradle `:app:assembleRelease`. No EAS account or local Android build is needed.

This is an internal pilot artifact signed with Expo's generated template debug
key. The key is not a production signing identity. A successful build is not a
store release, production-readiness claim or native acceptance result.

## Build configuration

Open **Actions → Internal Android APK → Run workflow**, select the reviewed
`main` revision and provide these two public client keys:

| Input                  | Fixed backend                              |
| ---------------------- | ------------------------------------------ |
| `adult_public_key`     | `https://bqcfynlbxevqlzbkimhy.supabase.co` |
| `messaging_public_key` | `https://ijiwkmvjppfallaoahmh.supabase.co` |

Use each project's `sb_publishable_…` key. Never supply an administrative,
service-role, personal access or legacy JWT key. Inputs are public application
configuration, not a secret-storage mechanism. The validator rejects missing or
malformed keys and any backend URL other than these reviewed HTTPS targets;
receipts contain key hashes, not key values. Do not commit local environment files.

The build enables real adult authentication and the existing separate messaging
provider. The ordinary sample experience remains synthetic; live AI and the
default-off candidate flags remain disabled. Messaging identity is not automatically
linked to the adult account by email. See [account behavior and administrator
approval](../auth.md#configuration-and-migration) and the
[hosted backend record](hosted-pilot.md).

JavaScript and assets are bundled in the APK. This hosted configuration uses no
Metro server, `adb reverse` or local Docker service at runtime. Account operations
still require network access to the hosted providers. Local Docker remains useful
for database development and for the separately labeled older localhost test APKs.

The build uses Java 17, Android SDK/target 36, build tools 36.0.0, NDK
27.1.12297006 and CMake 3.30.5. The APK requires **Android 7.0/API 24 or later**
and includes **arm64-v8a and x86_64** libraries; it does not support 32-bit-only
devices. Its application ID is `ae.ac.ku.ghaf.prototype`.

## Download and install

After the workflow succeeds, download its **ghaf-internal-apk** artifact from
the run page. GitHub retains this artifact for seven days. It contains:

- `ghaf-internal-<source-prefix>.apk` and its `.sha256` checksum;
- `build-receipt.json`, recording the exact source revision and public configuration
  hashes; and
- manifest, package, signing and alignment verification output.

The verifier requires a signed, non-debuggable, non-test-only APK, embedded
JavaScript, disabled backups and no cleartext exception. It verifies the generated
template signer and 16 KiB ZIP alignment. That alignment check alone is not a
physical-device compatibility or performance result.

For a successful run, the GitHub CLI can download the same artifact:

```powershell
gh run download SUCCESSFUL_RUN_ID --repo abdalrahman-ismaik/Ghaf --name ghaf-internal-apk --dir .\output\android-internal
Get-FileHash -LiteralPath '.\output\android-internal\ghaf-internal-SOURCE_PREFIX.apk' -Algorithm SHA256
```

Replace the run ID and source prefix with the successful run's values. Compare
the hash with both the `.sha256` file and `build-receipt.json` before installing.
For ADB, list devices and explicitly select the intended serial on every command:

```powershell
adb devices -l
adb -s DEVICE_SERIAL install -r .\output\android-internal\ghaf-internal-SOURCE_PREFIX.apk
adb -s DEVICE_SERIAL shell am start -n ae.ac.ku.ghaf.prototype/.MainActivity
```

`install -r` updates a compatible existing installation while retaining its data.
If Android rejects a signing or version mismatch, preserve the installation and
resolve that mismatch; do not uninstall, clear app data or wipe an emulator to
bypass it. This normal APK does not require the test-install `-t` flag. Each
independent client must sign in itself; never copy session storage between clients.

New adult accounts must complete the configured verification and administrator
approval process before account-owned data is available. See
[authentication setup](../auth.md#configuration-and-migration). A working build
does not bypass approval or prove external email delivery.

## Current release-engineering evidence

The latest validated internal artifact in this lane is
[ghaf-internal-b2b43028ebd6.apk](../../output/release-021-candidate/ghaf-internal-b2b43028ebd6.apk),
from [run34891473556](https://github.com/abdalrahman-ismaik/Ghaf/actions/runs/34891473556).
It is88,451,812bytes, SHA-256
`ec870fa8bf8153c847751482ae4bba161f86fd141bedb4b70078606ea3510ff5`,
and retains the existing internal template signer. It is not a production-signed
AAB or store-distributed release.

Root installed its normal update into API35 user11 and enabled it with clean app
data in user12. Independent Child/Parent native sessions completed the controlled
GI01 submission, praise, recognition and memory loop, then recovered16Seeds, two
canopy contributions and two memories after restart. Account B showed a truthful
empty setup. Exact boundaries and remaining blockers are in the
[release QA record](../competition-readiness/release-qa-results.md).

The default footer improved, but font1.5 split one Arabic label. Follow-up
`4dd6490` passed source checks and is building in
[run34896135774](https://github.com/abdalrahman-ismaik/Ghaf/actions/runs/34896135774);
its artifact/native acceptance remains pending. Public verdict is **NOT READY**.
Do not substitute the older Feature018 evidence below for these newer journeys.

## Historical Feature018 acceptance evidence

The Feature018 installable artifact was
[ghaf-internal-5ad7faa63c90.apk](../../output/android-internal-final/ghaf-internal-5ad7faa63c90.apk),
from successful [run 34851035020](https://github.com/abdalrahman-ismaik/Ghaf/actions/runs/34851035020)
at source `5ad7faa63c90c63287b01da2045f58a1b17106d5`. Its size is 88,134,244 bytes;
SHA-256 is `6e809841e6824dca0f2ef4be339323f73e2ef079449bad1ed262329b1af45100`.
Local hash/signature/alignment checks and normal emulator update installation
passed. Download this successful run into a new directory such as
`output/android-internal-final` to retain the earlier artifact and receipts.

The final APK restored the pre-update session, independently signed in as A,
retrieved the saved profile/family/task/study data and applied one task-completion
revision after three rapid taps. Logout with disabled animations/font scale 1.5,
protected Back/deep-link denial and independent companion-session refresh passed.
The bounded native recording comparison showed stable header/insets/logo through
auth-ready and readable dark status icons. Source checks pass 2,983 tests, type
checking, lint and formatting; repository/backend CI also passed for this source.

Recovery's first Back press in the emulator's floating Gboard/physical-keyboard
toolbar mode returns to sign-in and clears the draft instead of only dismissing
the keyboard. That case failed; normal docked-keyboard behavior and root cause
remain unverified. No recovery email was sent. The final native B-switch showed
empty private data and repeated backend ownership denials passed. Native logout
and force-stop/relaunch left the app signed out; the independent companion was
also signed out. Only the two invocation-created hosted test accounts were then
removed by explicit fixture cleanup. Normal animation/font/network settings were
restored, retaining the requested tall emulator display. Exact receipts are in
the validation record; these cleanup actions do not change normal account/logout
behavior.

[Run 34846738847](https://github.com/abdalrahman-ismaik/Ghaf/actions/runs/34846738847)
succeeded for source `c9c77e4defb803d835d4727986033bf86b17dff7`. Its first fresh APK
is `output/android-internal/ghaf-internal-c9c77e4defb8.apk`, SHA-256
`f3624db46f7f31fa2eb1292326a2b4a1757a583057752ff6223690dde0be0ce2`.
It was installed on the API 35 Android emulator; hosted sign-in, saved data in
both directions with an independent SDK client, restart persistence, current-device
logout and account isolation were exercised. A transient family-save connectivity
error preserved the draft and succeeded on retry; its cause remains unknown.

The first artifact exposed the auth-ready header/inset jump and does not contain
the fix. The current artifact above includes `5ad7faa` and its separate native
comparison. Exact identities, retained evidence and remaining gates are recorded
in [Feature 018 validation](../../specs/018-persistent-adult-accounts/validation.md).

Test the exact downloaded APK: independent sign-ins, saved data in both
directions, restart persistence, current-device logout, another user's isolation,
keyboard and Android Back. Record the APK hash, device/API and backend used.
Build receipts intentionally leave native runtime and physical performance
verification `NOT RUN`; emulator evidence and physical-device measurements must
be recorded separately.
