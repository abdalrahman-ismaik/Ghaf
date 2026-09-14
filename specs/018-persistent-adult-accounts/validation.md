# Feature 018 validation — 2026-09-14

## Published checks and fresh APK continuation

The reviewed work is committed and pushed on `main`: motion `59a45b6`, persistent
accounts `73f3323`, backend/build automation `c9c77e4`, and the CI runner-context
fix `2eb881b`. Existing source/data and the separate local test installation are
preserved. No force-push, reset, history rewrite or database reset occurred.

[Repository CI 34846807782](https://github.com/abdalrahman-ismaik/Ghaf/actions/runs/34846807782)
passed repository checks, 13 tooling tests, type checking, lint, formatting,
2,974 application tests (two opt-in tests skipped), Expo dependency compatibility
and web export. The test phase took 48.30 seconds on its GitHub runner. This is
build/code evidence, not native visual evidence.

[Backend CI 34846807768](https://github.com/abdalrahman-ismaik/Ghaf/actions/runs/34846807768)
passed both jobs: local Supabase migration/lint/pgTAP plus the enabled real Auth
test, and separate PostgreSQL messaging suites of 30 and 13 tests. The initial
workflow was rejected before jobs started because job-level environment values
cannot use the runner context. Resolving the CLI path after runner initialization
fixed that error; the successful rerun did not weaken any backend assertion.

The final local verifier also passed after its Docker context-precedence fix;
`verifier-final-run.log` records the real provider test with none skipped. CI logs
are `repository-ci-passed.log` and `backend-ci-passed.log` under
`.expo/backend-readiness-20260914/`.

The first fresh hosted APK build,
[run 34846738847](https://github.com/abdalrahman-ismaik/Ghaf/actions/runs/34846738847),
succeeded at source `c9c77e4defb803d835d4727986033bf86b17dff7`. It was installed and
tested in the Android emulator as recorded below. Native review found a brief
authentication-shell layout flash; reviewed fix `5ad7faa` passes local checks and
now has a successful fresh build and direct native comparison below. See the
[internal APK guide](../../docs/backend/internal-android.md).

## Final internal APK: verified build and native retest

[Run 34851035020](https://github.com/abdalrahman-ismaik/Ghaf/actions/runs/34851035020)
succeeded for source `5ad7faa63c90c63287b01da2045f58a1b17106d5`. The final artifact
is [ghaf-internal-5ad7faa63c90.apk](../../output/android-internal-final/ghaf-internal-5ad7faa63c90.apk),
88,134,244 bytes, SHA-256
`6e809841e6824dca0f2ef4be339323f73e2ef079449bad1ed262329b1af45100`.
The downloaded hash matches `output/android-internal-final/build-receipt.json`;
local signature verification matches template certificate
`fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`, and 16 KiB ZIP
alignment passes. This fresh Gradle APK includes embedded JavaScript and
`arm64-v8a`/`x86_64`, minimum API 24/target 36. It is non-debuggable and
non-test-only, with disabled backup and no cleartext exception. Template debug
signing remains internal-only; no production signing or store publication is claimed.

`adb -s emulator-5554 install -r` succeeded without clearing existing data.
The app retained UID 10209 on Android user 0; `final-installed-package.txt`
records `x86_64`, version 0.1.0 and the update time. The emulator remains API 35,
720×1600 at density 320. The following post-install results extend the build
receipt's correctly separate native `NOT RUN` field. Unless stated otherwise,
artifacts are under ignored `.expo/backend-readiness-20260914/`.

| Flow / scenario                            | Expected result                                                       | Observed evidence                                                                                                                                                                 | Result                       |
| ------------------------------------------ | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Update preserves session                   | Restore the pre-update B identity without another sign-in             | `final-updated-restored.json`: ready account after normal update                                                                                                                  | PASS                         |
| Logout resets entry                        | Show blank sign-in credentials and no protected account content       | `final-signin-empty.json`                                                                                                                                                         | PASS                         |
| Three immediate sign-in taps               | Reach A's account without a broken transition                         | `final-signin-rapid-taps.json`, `final-a-ready.json`; this UI result alone does not count provider operations                                                                     | PASS for observed UI         |
| A retrieves saved data                     | Restore the same family/member/task/study/profile                     | `final-restored-workspace.json`, `final-restored-task.json`, `final-restored-study.json`, `final-restored-profile.json`                                                           | PASS                         |
| Three rapid completion taps                | Apply one task-completion write                                       | `final-complete-rapid-taps.json`, `final-task-completion.json`; `hosted-native-read-a-1789395259098.json` confirms completed=true and workspace revision 5→6, not three revisions | PASS                         |
| Disabled motion and large text             | Keep logout usable and close protected access immediately             | All three animation scales 0/font scale 1.5; `final-reduced-signed-out.json`                                                                                                      | PASS for observed controls   |
| Back and protected deep link after logout  | Remain signed out                                                     | `final-reduced-back-deeplink.json`                                                                                                                                                | PASS                         |
| Other session survives final native logout | Independent A refresh and read remain usable                          | `hosted-native-companion.json`: refresh at 14:15:51 UTC returns A/workspace revision 6                                                                                            | PASS                         |
| Normal-motion registration and Back        | Open registration and return to a clean sign-in form                  | `final-registration.json`, `final-registration-back.json`; no registration request sent                                                                                           | PASS                         |
| Recovery Back with floating Gboard         | First Back dismisses the keyboard and retains the recovery form/draft | Instead it returns to sign-in and clears the draft; detailed limitation below                                                                                                     | FAIL in tested keyboard mode |

The saved account remains `Hosted Native Parent`, family `Hosted Family`, member
`Synthetic Member`, task `Water plant - second client` and study `Fractions`.
The independent server read confirms the same canonical owner/workspace and a
single completion update. Normal visual testing used 1x animation scales.
`final-accessibility-settings-before.json` and
`final-accessibility-settings-restored.json` confirm the disabled-motion/large-text
test returned all three scales and font scale to their recorded 1.0 settings.
This bounded restoration is separate from the final operator handoff settings check.

### Native shell comparison — PASS within inspected samples

The final actual Android recording `final-signin.mp4` is 19.564422 seconds,
720×1600, SHA-256
`fa0c68a3c09e21fd65844297da24d2f8f09cc5bacb49b62590c26b215fb4ee89`.
The whole-recording overview attempt failed with `ENOSPC` after 14 saved frames;
`final-signin-review/metadata.json` preserves that failure. It is not relabeled
as a passed full-recording review.

The later bounded decoder passed: `final-signin-close/metadata.json` contains
20 seek samples from 4.5–6.4 seconds at 0.1-second intervals. Independent review
in `final-signin-close/review.md` compared full-resolution frames 008/009/010,
presented at 4.999044/5.233411/5.364956 seconds, against the preserved baseline.
The native header, safe-area spacing, tree logo and background remain stable
through checking→ready. The prior approximately 104-pixel inset correction is
not reproduced in those samples. Dark status icons are legible on the light
background. The shorter checking body and longer ready body retain their
appropriate different content positions while the shell stays fixed.

This verifies the targeted defect within the inspected recorded samples. It is
not all-frame coverage, proof of event latency, a frame-rate claim or a physical
device performance measurement. Adjacent functional tests are listed separately.

### Remaining native keyboard limitation

In recovery, Gboard is using a floating/physical-keyboard toolbar mode. Android
reports `mInputShown=true` in `final-recovery-before-back-ime.txt`; captures
`final-recovery-ime-open.json` and `final-onscreen-keyboard.json` show the
recovery form and the observed keyboard. The first Back press navigates to
sign-in and clears the recovery draft (`final-recovery-after-settled-ime-back.json`)
instead of only dismissing the keyboard. The behavior was reproduced with the
expanded popup keys. A normal docked-keyboard comparison is **NOT RUN**; the
platform-mode cause remains unresolved and no source fix is claimed.

Form navigation/cancellation itself works and no recovery email was sent. This
does not pass ordinary recovery keyboard dismissal or hosted recovery delivery.
Keep the keyboard failure separate from the passed registration Back and
signed-out protected-route tests.

### Final code checks and artifact preservation

For source `5ad7faa`,
[repository CI 34851014409](https://github.com/abdalrahman-ismaik/Ghaf/actions/runs/34851014409)
and [backend CI 34851014416](https://github.com/abdalrahman-ismaik/Ghaf/actions/runs/34851014416)
succeeded. The locally downloaded copies of these two CI logs and
`final-android-build-passed.log` were removed as redundant to recover disk space;
their authoritative run URLs remain available. Older CI logs and the final
artifact's build/signature receipts remain preserved. The local 2,983-test,
typecheck/lint/format results are recorded with the source fix below.

Automatic approval review blocked recursive deletion of the seven old cache
directories and the new decoder profile. No alternate deletion mechanism was
used for those targets. Lossless NTFS LZX compression reduced seven generated
packager maps from approximately 185 MB to 41 MB allocated; before/after content
hashes match in `lossless-map-compression.json` and
`lossless-motion-map-compression.json`. Six byte-identical baseline overview
PNGs were deduplicated to `fresh-signin-review/frames/frame-008-t7.000.png`, with
the mapping/hash in `baseline-identical-frame-deduplication.json`. The original
MP4, timing metadata and the two defect keyframes were retained.

The final B-switch repetition passed on this exact APK:
`final-b-empty-family.json`, `final-b-empty-task.json`,
`final-b-empty-study.json` and `final-b-empty-profile.json` show B's empty family,
tasks, study and profile, with no A data. `hosted-native-companion.json` records
the repeated B foreign-read/update/delete denial checks at 14:24:26 UTC.
Native B logged out normally (`final-handoff-signed-out.json`); force-stop and
relaunch remained signed out (`final-handoff-relaunch.json`).

The companion session logged out at 14:30:33 UTC. The separately scoped cleanup
then deleted only the two hosted synthetic users created by this native test
invocation; `hosted-native-cleanup.json` records those exact IDs and `PASS` at
14:30:42 UTC. This explicit test-fixture cleanup is separate from ordinary logout,
which does not delete an account or its saved data. Existing users and the local
test installation/data were preserved.

`final-operator-settings.json`, captured at 14:31:08 UTC, records window and
transition scales 1.0, animator scale restored to its original unset value
(system default 1x), font scale 1.0, no enabled accessibility service and
`show_ime_with_hard_keyboard=1`. Network settings are airplane mode 0, Wi-Fi 1
and mobile data 1. The requested 720×1600 display/density 320 is retained.
`final-runtime-log-summary.json` counts zero `FATAL EXCEPTION`, `AndroidRuntime`
or `ANR` lines for the signed-out relaunch PID 17605. The seven `ReactNativeJS` lines are the startup message plus existing deprecation
warnings for ProgressBarAndroid, SafeAreaView, Clipboard, InteractionManager,
PushNotificationIOS and the Supabase Auth lock option. No warning-free claim or
coverage of every earlier app process is implied.

Additional bounded disk recovery removed a stale 26,565,254-byte incomplete SDK
download from March (`stale-sdk-fragment-cleanup.json`). Lossless LZX compression
of seven archived JavaScript bundles retained every content hash and reclaimed
approximately 79.5 MB of allocated space (`lossless-bundle-compression.json`).
Together with the earlier approximately 144 MB reclaimed from generated maps,
this preserves the build evidence rather than deleting it. Disk space remained
low, approximately 190 MB at this checkpoint; no fresh local native-build or
second-AVD capacity is implied.

Subsequent host activity consumed that headroom. Root then losslessly compressed
521 larger archived Metro cache files; all before/after SHA-256 hashes match in
`lossless-large-metro-cache-compression.json`. This restored approximately 48 MB
free at 14:33 UTC. The disk remains critically low; no AVD/user data, database
volume, APK or source was removed. The empty failed second-AVD configuration
would reclaim only 1,855 logical bytes and was preserved. The new independent
motion pass is outside this APK and final evidence commit; its in-progress files
remain uncommitted and untouched by this delivery.

The last local Auth health and REST probes both returned HTTP 200 at 14:37 UTC
(`final-local-http-status.json`). Fresh Windows Docker container listings timed
out for both local contexts, and a bounded Ubuntu listing also timed out; those
failed management checks are preserved in `final-docker-*-status.json`. No Docker
service, database volume or installed client was stopped or removed. The earlier
full local verifier pass remains historical to its exact run; the last HTTP
checks establish endpoint responsiveness, not a new container-health audit.

### Final documentation publication checks

`npm run repo:check` passed its five tests plus navigation/artifact policy.
Changed delivery documents passed their explicit Prettier check, and scoped
`git diff --check` passed. The final whole-worktree `npm run format:check` failed
on three concurrently edited second-pass files: `BotanicalPressable.tsx`,
`GrowthJourneyScreens.tsx` and `SharedGrowthScreens.tsx`. Their separate owner is
still implementing them; this delivery preserves those files and does not include
them in its commit or APK. The source `5ad7faa` full formatting/type/lint/test
passes above remain tied to that exact built revision. No repeat full app suite
is needed for this documentation-only handoff.

## First fresh hosted APK: build and native account evidence

Artifact: [ghaf-internal-c9c77e4defb8.apk](../../output/android-internal/ghaf-internal-c9c77e4defb8.apk),
88,136,968 bytes. SHA-256:
`f3624db46f7f31fa2eb1292326a2b4a1757a583057752ff6223690dde0be0ce2`.
`output/android-internal/build-receipt.json` records a fresh Expo prebuild and
Gradle APK with embedded JavaScript, `arm64-v8a`/`x86_64`, minimum API 24 and
target API 36. Signature verification and 16 KiB ZIP alignment pass. It is
non-debuggable, non-test-only, has disabled backup and no cleartext exception.
Signing is the unchanged Expo template debug identity for internal use, not a
production signing identity. The receipt's native `NOT RUN` field describes the
build job; the separate post-install evidence below adds runtime results.

The actual target was `emulator-5554`, Android user 0, API 35,
`sdk_gphone64_x86_64`, 720×1600 at density 320. Window and transition scales were
1.0; animator scale was unset (system default 1x), font scale 1.0 and no
accessibility service was enabled (`native-settings-before.json`). The original
local fixture was signed out before updating the existing package. No local
account data or session was migrated into the hosted environment. This APK uses
the reviewed HTTPS adult and messaging project URLs; its account flows do not
depend on Metro, ADB reverse or local Docker.

Unless another location is stated, receipts and captures in this subsection are
under ignored `.expo/backend-readiness-20260914/`. Build/download verification is
recorded in `android-build-passed.log`, `downloaded-apk-signing.txt` and the
artifact's `build-receipt.json`. All native identities/data below are authorized
synthetic fixtures against hosted adult project `bqcfynlbxevqlzbkimhy`.

| Flow / scenario                                | Expected result                                                | Observed evidence                                                                                                                                                                                                                    | Result |
| ---------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| Incorrect credentials                          | Stay outside protected account content with a useful error     | `fresh-invalid-credentials.json`: sign-in remains visible with the generic credential error                                                                                                                                          | PASS   |
| Independent native A sign-in                   | Resolve the real hosted account and load its private workspace | `fresh-hosted-ready-settled.json`; the companion independently resolves the same owner/workspace                                                                                                                                     | PASS   |
| Native profile/family/task/study writes        | Save real account-owned data retrievable elsewhere             | `fresh-profile-save-result.json`, `fresh-member-save-state.json`, `fresh-task-saved.json`, `fresh-study-saved.json`; independent SDK receipt `hosted-native-read-a-1789392640971.json` reads profile revision 1/workspace revision 4 | PASS   |
| Independent client writes, native refreshes    | Retrieve the server change through explicit refresh            | `hosted-native-update-a-1789392643821.json`: task renamed at workspace revision 5; `fresh-two-way-task-result.json` shows that name in the native app                                                                                | PASS   |
| Force-stop and relaunch                        | Restore the same valid account and saved data                  | `fresh-restart-ready.json`, `fresh-restart-family-restored.json`: ready state and the saved family/member return                                                                                                                     | PASS   |
| Native current-session logout and Android Back | Close native access while the independent session continues    | `fresh-logged-out.json`, `fresh-back-after-logout.json`; `hosted-native-companion.json` records successful companion refresh and revision 5 after native logout                                                                      | PASS   |
| B signs into the same native installation      | Show none of A's private profile or workspace                  | `fresh-b-profile-empty.json`, `fresh-user-b-empty-family.json`, `fresh-b-tasks-empty.json`, `fresh-b-study-empty.json`                                                                                                               | PASS   |
| B requests A's protected records               | No foreign reads, updates or deletes                           | `hosted-native-companion.json` records passed assertions from `hosted-native-companion.mjs`: foreign profile/workspace SELECT returns empty; UPDATE/DELETE each return `42501`                                                       | PASS   |

Native A saved `Hosted Native Parent` (English preference), family `Hosted Family`,
member `Synthetic Member`, task `Water plant` and study plan `Fractions` with next
step `Read one example`. The independent SDK A client read all of them, then
renamed the task to `Water plant - second client`; the native app retrieved it.
See the [native refreshed task capture](../../.expo/backend-readiness-20260914/fresh-two-way-task-result.png)
and [signed-out state after Android Back](../../.expo/backend-readiness-20260914/fresh-back-after-logout.png).
These are independently authenticated native and SDK clients, not two hardware
devices or two native clients against the hosted backend. No tokens were copied.

The first family write encountered a displayed connectivity error. The editor
retained `Hosted Family` (`fresh-family-settled.json`,
`fresh-family-retry-controls.json`), the error stayed visible
(`fresh-save-error-visible.json`) and the independent server read still showed
workspace revision 0 (`hosted-native-read-a-1789392335932.json`). Explicit retry
succeeded (`fresh-family-retry-result.json`) and a second server read confirmed
revision 1 (`hosted-native-read-a-1789392442020.json`). The transient failure's
cause is unknown; it is recorded as an observed error with a successful retry,
not silently treated as an uninterrupted happy path.

### Auth-shell visual defect, source fix and local checks

Additional first-APK checks exercised offline startup and font scale1.5. With
airplane mode enabled and Wi-Fi/mobile data disabled, `fresh-offline-startup`
shows the recoverable error gate with no private account UI. After connectivity
returned, the first Retry capture still showed the error; the later
`fresh-offline-recovery-state` shows the same B account ready without another
sign-in. This proves eventual session recovery, not instantaneous retry timing.
The immediate restoration receipt observed mobile data before its asynchronous
enable completed; `offline-network-settings-restored-settled.json` subsequently
confirms the exact original airplane0/Wi-Fi1/mobile1 settings. Large-text capture
`fresh-large-text-settled.png` shows readable wrapped Arabic and the full logout
control; font scale was restored to1.0. Spoken TalkBack and full large-text
workspace editing were not exercised by these checks.

Automatic approval review rejected the attempted removal of seven old isolated
build-cache directories with “blocked by policy.” No cache was deleted and that
operation was not retried through another mechanism. APKs/evidence are preserved.

The actual native recording `fresh-signin.mp4` is 20.987222 seconds at 720×1600.
Offline decoding/review is in `fresh-signin-review/review.md`, its overview sheet
and `transition-close/` frames/metadata. At presented recording times 3.023933
and 3.255978 seconds, the ready page changes from a header beneath the status
bar with absent logo/background to the normal presentation, moving content
approximately 104 recorded pixels. No stuck overlay or visibly different account
appeared in the reviewed samples. Sampling is not proof that every frame is free
of a flash and does not establish FPS or physical-device performance.

Fix `5ad7faa63c90c63287b01da2045f58a1b17106d5` retains the outer access shell and
its native insets/artwork, keys only the inner body by auth phase/user, resets
scroll immediately without animation and supplies dark status-bar icons. It
preserves the workspace user boundary and immediate protected-content removal.
Local typecheck, lint and format checks passed (`auth-shell-typecheck.log`,
`auth-shell-lint.log`, `auth-shell-format.log`). The two focused files passed
54 tests in 1.38 seconds (`auth-shell-focused-tests.log`); the full suite passed
**201 files/2,983 tests, with two files/two tests skipped**, in **95.72 seconds**
(`auth-shell-full-tests.log`). These checks are not native visual evidence.

`final-apk-dispatch.json` records the second fresh build dispatch for `5ad7faa`.
That build subsequently succeeded, and its hash/install and recorded native
comparison are documented in the final-APK section above. The first APK does not
contain the shell fix; its baseline evidence remains distinct.

## Backend maintenance and publication continuation

The owner authorized backend updates and commit/push on main, then requested an
installable APK. Feature 014 remains deferred by the owner's explicit response.
The current accepted-feature inventory is in
[the spec completion report](../../docs/competition-readiness/workstreams/spec-completion-20260914.md).

The new additive `20260914000300_account_provider_status.sql` closes a reproduced
backend authorization gap: banned, soft-deleted or newly anonymous provider users
could access saved data with retained JWT claims. Its focused 42-assertion pgTAP
suite failed 23 assertions before the migration. After migration, all four SQL
files passed **203 assertions**. Existing rows are preserved and the ordinary
session-specific logout/access-JWT-expiry policy is unchanged.

Hosted target `bqcfynlbxevqlzbkimhy` was verified before any changes. Its original
approval table columns/constraints/triggers/indexes, policies/RLS/grants and two
application function bodies matched the reviewed local schema (CRLF difference
only). The manually applied `20260913000100` history entry was then repaired;
the reviewed dry run listed exactly `20260914000100`, `20260914000200` and
`20260914000300`. All three were applied. Final dry run reports no pending migration.
Readback confirms all three app tables, policies, grants and seven application
functions/ACLs match local. No hosted Auth/SMTP/paid-plan setting or existing
account/data was changed by those migrations.

| Check                                   | Observed result                                                                                                                  | Status                     |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| TypeScript and zero-warning lint        | `typecheck.log`, `lint.log`                                                                                                      | PASS                       |
| Full application suite                  | 200 files passed, 2 skipped; 2,974 tests passed, 2 skipped; 157.48 seconds                                                       | PASS                       |
| Local SQL regression                    | 203 assertions across four files; `all-database-tests.log`                                                                       | PASS                       |
| Real local Auth/data integration        | Safe verifier ran the actual enabled provider test with zero skipped cases; `verifier-second-run.log`                            | PASS                       |
| Backend/build-tool safeguards           | 13 Node tests, including Docker context precedence and unsafe APK/key rejection; `tooling-tests.log`                             | PASS                       |
| Hosted schema/history                   | Baseline comparison, three applied migrations, final no-op dry run and readback                                                  | PASS                       |
| Hosted Auth and owned data              | Independent A/A/B password sign-ins; same profile/workspace; writes both ways; stale update and forged read/update/delete denied | PASS                       |
| Hosted logout/ban                       | Current session logout preserves other client refresh; relogin restores same workspace; provider ban blocks retained JWT RPCs    | PASS                       |
| Known hosted messaging SQL              | All 29 repository function bodies match ignoring SQL-editor line indentation; existing latest hourly message retention succeeded | PASS for known objects     |
| Hosted external email/recovery delivery | Synthetic accounts were administrator-provisioned through real provider API without sending email                                | NOT RUN                    |
| Fresh APK and GitHub CI                 | Build and CI workflows added; dispatch/runtime results must be appended separately                                               | NOT RUN at this checkpoint |

All receipts above are in ignored `.expo/backend-readiness-20260914/`.
`hosted-account-smoke-result.json` records the real HTTP scenarios and removal of
both invocation-created synthetic accounts afterward; no existing identity was
deleted and no tokens/passwords or service-role keys were written to artifacts.
This server-side test provisioning is not evidence of delivered verification mail.

The separate messaging project `ijiwkmvjppfallaoahmh` contains additional
foreground-location objects/history outside this checkout. They were preserved,
not folded into the adult migration stream or claimed as fully source-matched.
The function-body comparison keeps line contents after trimming edge indentation;
it is paired with prior hosted messaging runtime evidence, not a fresh peer-flow test.

Supabase security advisors returned no ERROR-level item. WARN entries flag the
five deliberately authenticated security-definer account functions and the
pre-existing platform `rls_auto_enable` helper. The application functions enforce
current provider status, approval, ownership and exact validated commands under
empty search paths; their caller execution is intentional. The platform helper
was preserved. This is reviewed scope, not a claim of zero warnings or production
security certification.

The local verifier initially rejected REST because that container has no Docker
Healthcheck. It now requires a running REST container plus a real read-only
PostgREST catalog probe; other services still require healthy checks. A separate
review found Docker context precedence could bypass the intended local endpoint;
the verifier now resolves the effective context and pins subsequent commands to
the validated local socket. Both corrections have focused regression tests.

The installed local clients still require the five Docker services. None was
stopped or pruned. Exact local native data/credentials remain in place. Fresh
local builds lack NDK 27.1.12297006, CMake 3.30.5 and sufficient C: space; EAS
reported signed out. The new manually dispatched GitHub workflow uses a fresh
Expo prebuild/Gradle build, HTTPS public configuration and template internal
signing, with no production signing or store publication claim.

## Two native installations on one emulator — PASS

The owner authorized a second app on the existing emulator. Both are installed in
Android user 0 on `Ghaf_API35_ARM64Bridge`, serial `emulator-5554`, API 35. The
requested 720×1600 display at density 320 is retained. Window/transition scales are
1.0; animator scale remains unset (system default 1x), font scale 1.0, no enabled
accessibility service. This is two isolated native installations on one device.
The separate second-AVD gate below remains blocked.

| Installation | Application ID               | Android UID | Final persisted test account        |
| ------------ | ---------------------------- | ----------- | ----------------------------------- |
| Ghaf — غاف   | `ae.ac.ku.ghaf.prototype`    | 10209       | B, empty private workspace          |
| Ghaf Test 2  | `ae.ac.ku.ghaf.accounttest2` | 10210       | A, saved profile/family/tasks/study |

Each package has its own `/data/user/0/<application-id>` directory. The second
installation started signed out and received an independent provider password
sign-in. No app storage, passwords or session tokens were copied between apps.
The backend is the existing local Supabase/Mailpit test environment; all records
and accounts are synthetic. No hosted configuration or schema was changed.

Evidence is in ignored `.expo/dual-account-clients-20260914/`. The final
`runtime-verification.json` extends the earlier packaging-only receipt, whose
`nativeRuntimeVerification: NOT RUN` correctly records its pre-install state.

| Flow / scenario                               | Expected result                                                     | Observed result / evidence                                                                                                       | Result                        |
| --------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Fresh second app and independent sign-in      | Separate storage/session; same backend identity when signing into A | `second-first-launch`, `second-signed-in`, `both-independent-sessions.json`, package identity receipts                           | PASS                          |
| Account data retrieval                        | Retrieve A's existing profile, family, member, task and study       | `second-profile-retrieved`, `second-workspace-retrieved`, `second-existing-task`, `second-received-client1-study`                | PASS                          |
| Second app writes; original refreshes         | Original retrieves the new task title                               | `second-task-write-settled.json`: revision 9; `original-received-client2-task` shows the `Client2` suffix                        | PASS                          |
| Original writes; second restarts              | Second retrieves completed study record                             | `original-study-write.json`: revision 10; `second-restart-restored`, `second-received-client1-study`                             | PASS                          |
| Original logs out                             | Original session ends; second remains authorized                    | `logout-session-isolation.json`: original current session removed, second session retained; `second-reloaded-after-other-logout` | PASS                          |
| Back/deep link after logout                   | Original remains outside protected routes                           | `original-back-deeplink-gated` after Back and `ghaf://parent`                                                                    | PASS for settled access state |
| B signs into original while second retains A  | B sees no A records                                                 | `original-b-empty-{family,tasks,study}`, `original-b-private-workspace.json`; `second-still-account-a`                           | PASS                          |
| Force-stop/relaunch both packages             | Restore B in original and A in second                               | `original-b-restart-settled`, `second-a-restart-settled`                                                                         | PASS                          |
| Distinct launcher and link                    | Both apps visible; second link resolves to its activity             | `launcher-two-apps.png/.xml`, `second-scheme-resolution.txt`                                                                     | PASS                          |
| Current-process error scan                    | No matching fatal/React Native error in sampled logs                | `runtime-verification.json`: zero matches in latest 300 lines per current process                                                | PASS, limited sample          |
| Separate second device                        | Independent Android OS environment                                  | Second AVD still cannot allocate userdata; this run used one emulator                                                            | BLOCKED                       |
| Fresh Gradle/release and physical performance | Normal native build and measured physical results                   | Required NDK/CMake unavailable; not measured here                                                                                | BLOCKED / NOT RUN             |

The last restart repetition initially sampled `pilot-restoring-screen`, so the two
`*-a-restart-restored.xml` / `original-b-restart-restored.xml` ready assertions
failed. Later fresh settled captures passed; the early files are preserved. This
does not establish startup latency or absence of a transient flash. An initial
offscreen reload tap was rejected by the helper; scrolling to the visible button
and pressing it passed. The immediate task-write receipt preceded commit; its
separate settled receipt confirms revision 9. These observations were not hidden
or relabeled as successful initial assertions.

The local functional test APK is
`package-v1/ghaf-test-2-LOCAL-FUNCTIONAL-TEST-ONLY.apk` (62,485,690 bytes), SHA-256
`73b6767ef983e0b9b725c1bd7988dc46a66f311c10ccbbbc4763cd22c9c94292`.
The source APK remains unchanged at
`61692537d23d40e3cccb92b16d5c5ab15709d7ba50ed642b32b6a17af7b26a9d`.
All 1,624 code/native/other payloads outside the three bounded metadata/resource
entries are byte-identical. Only manifest identity/authorities/label/scheme,
the resource-table package-name field, and bundled app metadata identity changed.
Native class names and resource IDs are preserved. AAPT semantic checks,
signature verification and `zipalign -P 16 -c 4` passed. The preserved runtime
fingerprint is `beabc1157da125b681b940f076f05693b1e6371d4381029fe07e31b2102266dd`.

No app source, dependency, lockfile or tracked native configuration changed for
this second installation. It reuses the verified native container and fresh Hermes
bundle described below. Existing test-only cleartext access and `testOnly=true`
are retained. A historical bundled predictive-Back metadata value differs from the
actual disabled native manifest; that pre-existing discrepancy was preserved.
This artifact is not a fresh Gradle variant, release build or distributable APK.

Commands executed from the repository root, with `adb` denoting the SDK executable
documented below:

```powershell
python .expo/dual-account-clients-20260914/package-second.py
adb -s emulator-5554 install -t .expo/dual-account-clients-20260914/package-v1/ghaf-test-2-LOCAL-FUNCTIONAL-TEST-ONLY.apk
adb -s emulator-5554 shell am start --user 0 -n ae.ac.ku.ghaf.prototype/.MainActivity
adb -s emulator-5554 shell am start --user 0 -n ae.ac.ku.ghaf.accounttest2/ae.ac.ku.ghaf.prototype.MainActivity
adb -s emulator-5554 shell am force-stop --user 0 ae.ac.ku.ghaf.prototype
adb -s emulator-5554 shell am force-stop --user 0 ae.ac.ku.ghaf.accounttest2
python .expo/dual-account-clients-20260914/device.py capture second-a-restart-settled --client second --serial emulator-5554 --expect pilot-ready-screen
python .expo/dual-account-clients-20260914/final-receipt.py
```

Native capture/tap receipts include fresh selector bounds and target package;
server receipts read only fixture profile/workspace and hashed session IDs, never
access/refresh tokens. Profile and family were retrieved in this run; the two-way
writes changed a task title and study completion. Other older test sessions remain;
ordinary logout removed only the identified original current session. Native forced
expiry/refresh-token rotation, revocation recovery, recovery links, offline faults,
TalkBack, large data volume and animation interruption were not retested in this
run. Prior provider/UI results below are separate evidence. Settled screenshots
and emulator recordings are not physical performance measurements.

Final documentation formatting check and `git diff --check` passed
(`final-doc-format.log`, `final-diff-check.log`). No application source changed in
this continuation, so the already-passed typecheck/lint/full-suite results below
were not rerun. The runtime tests and binary-preservation checks above are new.
`final-git-status.txt` and `final-git-diff-stat.txt` preserve the handoff inventory.

Final receipt records 1,843,277,824 free bytes on C:. No original installation/data
was removed. The launcher is left with both icons available. Main and all existing
uncommitted source work are preserved; no commits, pushes or deployments occurred.

## Subsequent disk-cleanup attempt

The owner subsequently authorized cleaning unneeded disk data to enable the second
Android client. Standard cache maintenance completed:

```powershell
npm cache clean --force --cache C:/Users/narut/AppData/Local/npm-cache
python -m pip cache purge --cache-dir C:/Users/narut/AppData/Local/pip/cache
npm cache clean --force --cache C:/Users/narut/AppData/Local/Temp/ghaf-r003-playwright-cache
npm cache clean --force --cache C:/Users/narut/OneDrive/Desktop/Project/Ghaf/.expo/playwright-npm-cache
dotnet nuget locals global-packages --clear
docker builder prune --all --force
```

Free host space increased from 370,626,560 to 2,208,501,760 bytes (about 1.71 GiB
reclaimed, 2.06 GiB free). Docker separately reported 3.957 GB of removed unused
build cache inside its virtual disk; that number is not additional reclaimed C:
space. No Docker images, containers or volumes were pruned. All five local backend
containers remained running and a read-only query confirmed A's profile still
exists. The final account and pinned native-base APK hashes remain unchanged.

The second AVD was retried on serial 5556 with independent factory storage. It
again failed before boot: 2,108.62 MB available versus 7,372.80 MB required. Serial
5554 remained the only connected Android device. At this cleanup checkpoint the
second-native-client gate was still **BLOCKED**; the later same-emulator
installation evidence above supplies a narrower native-client result.

Automatic command review rejected both the combined cleanup command and a smaller
explicit-path APK deletion batch with `blocked by policy`; no richer reason was
provided. About 1.385 GiB of audited intermediate APKs and isolated build caches
therefore remain. No alternate deletion mechanism was used for those files.
The standard package-cache tools above were accepted separately.

`Get-VHD` inspection of Docker's existing disk returned a Windows authorization
error. The session is not an administrator; no compaction or Docker shutdown was
attempted. A later authorized administrator can inspect/compact that disk while it
is detached or mounted read-only, following
[Microsoft's Optimize-VHD requirements](https://learn.microsoft.com/en-us/powershell/module/hyper-v/optimize-vhd?view=windowsserver2025-ps).
The possible host-space recovery is unmeasured.

Cleanup receipts, logs, the new emulator failure and preserved Git status are in
ignored `.expo/disk-cleanup-20260914/`. No source behavior changed and no application
tests were rerun for cache maintenance. Existing uncommitted work, signed APKs,
screenshots/recordings, private credentials, database and emulator user data remain.

## Original implementation evidence

Owner: `/root` with bounded account backend/UI/test helpers. AI-assisted authorship
is disclosed here. Started on clean `main` at `d91ef57`; existing motion changes
remain in the same uncommitted worktree. No commits, hosted migration, deployment,
branch change, app-data clearing or AVD wipe performed.

## Executed checks

| Check                                                             | Result                                                                       | Evidence                                                  |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------- |
| Additive migrations, local existing database                      | PASS                                                                         | `.expo/persistent-accounts-20260914/local-migration.log`  |
| Database ownership/validation/conflicts                           | PASS, 124 pgTAP assertions                                                   | `database-tests-retest.log`                               |
| Real Supabase Auth + independent clients + profile/workspace sync | PASS, final opt-in integration harness: 7.62 s test / 7.91 s total           | `provider-integration-final.log`                          |
| Focused account behavior/UI                                       | PASS, 8 files / 219 tests                                                    | `account-focused-retest.log`                              |
| Typecheck                                                         | PASS after input-validation/test typing corrections                          | `typecheck-retest.log`                                    |
| Lint                                                              | PASS                                                                         | `lint-first.log`                                          |
| Second-candidate static checks                                    | PASS: typecheck, lint, formatting, repository checks                         | `final-*.log`                                             |
| Native-found/interruption regressions                             | PASS: 6 files / 127 tests                                                    | `interruption-fixes-tests.log`                            |
| Second-candidate complete regression suite                        | PASS: 200 files / 2 skipped; 2,967 tests / 2 skipped; 95.33 s total          | `final-full-tests.log`; `npm test -- --maxWorkers=1`      |
| Logout-error fix typecheck and lint                               | PASS                                                                         | `logout-fix-typecheck.log`, `logout-fix-lint.log`         |
| Logout-error focused regression coverage                          | PASS: 4 files / 96 tests; 2.87 s total                                       | `logout-fix-focused.log`                                  |
| Latest complete regression suite                                  | PASS: 200 files / 2 skipped; 2,974 tests / 2 skipped; 166.74 s total         | `logout-fix-full-tests.log`; `npm test -- --maxWorkers=1` |
| Native runtime                                                    | PASS for the bounded cases below; independent Android storage checks BLOCKED | Final candidate receipts/screens below                    |

All short evidence paths above are relative to ignored
`.expo/persistent-accounts-20260914/`. Logs are sanitized; local test credentials
are excluded from shareable evidence. The local CLI's full status is never a
shareable artifact.

The first pgTAP run exposed an aggregate in a test fixture's UPDATE expression;
the fixture was corrected without altering ownership assertions. The first UI
test run exposed missing Platform mocking and a recursive undefined-child walker;
the harness was repaired. No assertions were removed to obtain the passes.

## Provider coverage

The harness uses separate Supabase clients and independent password sign-ins with
separate storage maps. It verifies the same UUID/workspace, two-way profile/family/
task/study updates, conflict rejection, local logout while the other session can
refresh, same-account relogin, account B isolation, forged RPC parameters/record
references, direct RLS read/write/delete denial, pending/suspended denial, email
verification, invalid/expired codes and password recovery.

These are real local-provider tests, not proof of native secure-storage persistence
or physical-device smoothness. Hosted schema activation and physical-device
performance remain NOT RUN. The legacy sample's reward-bearing task workflow and
academic-goal evidence are not synchronized by this bounded planning workspace.

## Native first candidate

`emulator-5554`, Ghaf_API35_ARM64Bridge, API35, 720×1600/density320, existing data.
Fresh local functional test APK SHA-256:
`dbd47a57bdc5aa8eec977a9bc323a6f193211443e601abbe7fd2c34fc6939f40`.
It uses the current JS/Hermes bundle and the pinned native container, with exactly
two test-only manifest additions verified by AAPT. 1625 other payloads and all 98
resource mappings match. No production build configuration changed.

Actual native registration, local email-code verification, pending approval,
operator approval, bad-password rejection, cloud-empty view and first family save
passed. Screenshots/hierarchies `a-signin-initial`, `a-bad-credentials-rejected`,
`a-registration-keyboard`, `a-email-verification`, `a-approved-pending`,
`a-cloud-empty`, `a-family-saved`; server receipt `native-server-a-1789382372768.json`.
Test A UUID is `3de706d7-efac-4cf5-930c-7aff878c0186`, workspace
`0e80e0ca-3004-489c-a862-47748d4f0307`, revision 1 after the native family save.

This candidate exposed a stale native "busy" accessibility name after loading.
Button now supplies its current explicit text name and preserves caller radio roles.
Review additionally found same-principal refresh unmounting editors and messaging
cleanup rejection disappearing after UI epoch changes. Both were fixed with focused
tests before the final native candidate. They are not counted as native passes yet.

## Native second candidate and bounded results

The second functional test APK (before the logout-error refinement) is
`account-final/ghaf-account-final-LOCAL-FUNCTIONAL-TEST-ONLY.apk`, SHA-256
`c8085f6d85316ae80212b6c7e8c261ec019bd1124c0ffd4a9bcb2cec7cc18dc0`.
Its working-tree runtime fingerprint before/after bundling and at packaging is
`44a5ca05a6a111fb7bec0bb7f9749c56c4898b3ff1990ff1c144ede70e47f2ef`.
The source HEAD remains `d91ef57`; the fingerprint identifies uncommitted runtime
changes, not a clean-HEAD build. See `account-build-final.log`,
`account-final/source-receipt.json` and `account-final/packaging-receipt.json`.

The native container is from `273f97dd4e7f2f1619abab32203c46c226c31c35`.
Packaging preserves 1,625 non-bundle/non-manifest payloads and all 98 resource
mappings. Only the Hermes bundle and manifest change. The manifest adds
`android:testOnly=true` and `android:usesCleartextTraffic=true`, verified by AAPT;
existing attributes/nodes are preserved. The latter is an application-wide
exception in this ignored local test artifact, not a domain-scoped release policy.
The build's real Auth/data endpoint is `http://127.0.0.1:54321`; messaging is
unconfigured and live AI flags remain off. `build-account.ps1 -Name account-final`
records the explicit configuration without credential values. Installation
requires `adb -s emulator-5554 install -r -t <test-apk>` and local connectivity uses
`adb -s emulator-5554 reverse tcp:54321 tcp:54321`.

Native tests use `emulator-5554`, `Ghaf_API35_ARM64Bridge`, API 35,
720×1600/density 320. This is the existing emulator with a taller display, not a
physical device. The SDK executable is
`C:/Users/narut/AppData/Local/Android/Sdk/platform-tools/adb.exe`;
`device.py` records the targeted serial in interaction receipts. This is a current
Hermes bundle inside the verified native container, not a fresh Gradle build or a
release performance build. Required NDK/CMake tooling remains unavailable; see
[the artifact limitation](../../docs/auth.md#android-test-artifact-limitation).

| Flow / scenario                                                                                                                                   | Expected result                                                           | Observed result / evidence                                                                                                                                                                      | Result               |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Adult profile save                                                                                                                                | Persist the name and language after provider acknowledgment               | `a-profile-saved.png/.json`: saved banner, `Test Parent A`, English; matching server receipt below                                                                                              | PASS                 |
| Native family/member/task save                                                                                                                    | Keep one owned family, member and task                                    | `a-task-saved.png/.json` shows `Water plant Device 1` for `Test Child`; server records one member and one task                                                                                  | PASS                 |
| Study save with rapid taps                                                                                                                        | Save one study plan without duplicate records                             | `a-study-draft.png`, `a-study-rapid-save-receipt.json` record three consecutive raw ADB Save taps without settled-state waits; final server receipt has one study plan and workspace revision 4 | PASS                 |
| Force-stop and relaunch                                                                                                                           | Restore the same account without another sign-in                          | `a-force-stop-restored.png/.json` shows the ready account for the same synthetic A identity                                                                                                     | PASS                 |
| Offline startup                                                                                                                                   | Withhold protected account data and offer retry                           | `a-offline-startup.png/.json` shows the network error gate, with retry/sign-out and no previous account records                                                                                 | PASS                 |
| Connectivity restoration and retry                                                                                                                | Revalidate the retained session and reopen the same account               | `a-offline-recovered.png/.json` returns to A's ready account; no new sign-in or account created                                                                                                 | PASS                 |
| Two separate Android Emulators                                                                                                                    | Independent application storage and sign-ins on two emulators             | Second emulator attempts failed before usable boot; exact blockers below                                                                                                                        | BLOCKED              |
| Secondary Android user on the existing emulator                                                                                                   | Separate application storage and independent sign-in                      | Clean sign-in reached; launcher and UiAutomation failures prevented verified second-client access                                                                                               | BLOCKED              |
| Native completion/edit synchronization, logout, account B isolation, Back/deep links, recovery and verification edge cases on the final candidate | Complete the relevant final-artifact journeys                             | Completed cases are recorded below; native recovery/verification edge cases remain untested                                                                                                     | See additional table |
| TalkBack, large text, reduced motion and physical-device performance for this account flow                                                        | Direct platform/accessibility checks and appropriate performance evidence | Not established by these screenshots, provider tests or recordings                                                                                                                              | NOT RUN              |

The server readback `native-server-a-1789383214563.json` records the same A UUID
and workspace as the first native candidate, profile `Test Parent A` / `en`,
family `Ghaf Test Family`, revision 4, one member, one task and one study plan.
The study subject is `Fractions Device 1`, with next step `Read one worked example`;
the task and study plan are not completed. These are synthetic Parent-managed
planning records, not Child-authentication, award or academic-goal evidence.

`a-study-rapid-save.mp4` has offline decoded samples/contact sheet under
`study-save-frames/`; its metadata records the source hash and 30 samples from
0.5–3.5 seconds. This artifact supports review of the transition and raw-tap
sequence, not measured frame timing or a frame-rate guarantee. The server row count
is the duplicate-write evidence; a screenshot alone is not sufficient for it.
The settled restart screenshot does not establish absence of every startup frame
flash. No physical-device smoothness claim follows from this emulator run.

## Independent Android client blockers and privacy distinctions

The existing `Pixel_9_Pro_XL` launch failed because QEMU identified its userdata
image as raw and rejected `overlap-check`: `Block format 'raw' does not support
the option 'overlap-check'`. See `device2-boot.stderr.log` and
`device2-boot.stdout.log`. No existing image was wiped to bypass the failure.

Attempts with isolated userdata for `Ghaf_API35_ARM64Bridge` failed with required
partition space **7,372.80 MB** and only **6,155.22 MB** available
(`device2-isolated.stdout.log`). A `-partition-size 2048` attempt was rejected by
the emulator's supported 10–2047 MB range (`device2-small.stdout.log`); the 2047 MB
retry still required 7,372.80 MB with 6,154.20 MB available
(`device2-small2047.stdout.log`). A separate
`Ghaf_Account_Test_API35_20260914` AVD using only hardware configuration and the
installed factory image also failed with 6,153.27 MB available and the same
7,372.80 MB requirement (`device2-test-avd.stdout.log`).
`device2-avd-creation.json` records that no disk images, credentials or app storage
were copied. The emulator executable for these attempts is
`C:/Users/narut/AppData/Local/Android/Sdk/emulator/emulator.exe`; the logs identify
the AVDs and failing flags rather than serving as a complete launch-argument log.

The separate Node clients in the passed provider suite have independent sign-ins
and storage maps. They prove real server identity/data isolation, not Android
Keystore persistence. Native A restart supplies a separate persistence observation.
The Android user-10 experiment is BLOCKED after a clean sign-in screen; it did
not establish independent native account access. It cannot
be relabeled two-device verification. Native account-switch/logout evidence must
be recorded separately from forged backend request denial in the provider suite.

All native accounts/data are synthetic and the backend is the isolated local
Supabase database with Mailpit. No external recipient delivery, hosted schema
activation, public rollout or physical-device acceptance is claimed. Credentials,
verification codes and full CLI status are not part of shareable artifacts.
The referenced server receipts contain only synthetic identifiers and planning
data. The additional observations below extend this checkpoint.

## Additional native observations

The recovered emulator used the same AVD, serial, API, display and APK, with a
process-only increase to 3,072 MB RAM and two cores. Android user 0 was restored.
Test user 10 is stopped and its original 60,000 ms screen timeout is restored;
neither user's data was cleared.

The secondary-user attempt recorded a launcher crash involving
`recents_animation_input_consumer`, UiAutomation connection timeouts and a black
surface (`secondary-user-system-crashes.log`, `c2-direct.png`). ADB shutdown also
stalled, so only the verified task emulator process was stopped. A cold restart
with more RAM and a later app relaunch recovered the original-user app. Startup
stalls and the brief return to the launcher remain a native acceptance limitation,
not a passed cold-start latency test.

| Flow / scenario                           | Expected result                                                | Observed result / evidence                                                                                                                                          | Result                                                         |
| ----------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Native to independent SDK client          | Independent sign-in reads A's profile/family/member/task/study | `native-sdk-roundtrip.json`: same UUID/workspace and all data types at revision 4; no copied native tokens                                                          | PASS                                                           |
| Independent SDK to native                 | Retrieve real server changes                                   | SDK wrote revision 6; `a-other-client-task-retrieved` and `a-other-client-study-retrieved` show the changed title and next step                                     | PASS: one native and one SDK client                            |
| Native local logout                       | Close access, keeping cloud data and other sessions            | `a-logout-closed-access`; independent SDK refreshed successfully and read the workspace after native logout                                                         | PASS                                                           |
| Back and protected deep link after logout | Never reopen the old account                                   | `logout-back-foreground.txt`, `a-logout-deeplink-gated`: Back then `ghaf://parent` retained sign-in                                                                 | PASS for settled access state                                  |
| B signs in after A                        | Show only B's own empty data                                   | `b-native-result`, `b-family-isolated`, `b-tasks-isolated`, `b-study-isolated`; `native-server-b-1789384326649.json`: different owner/workspace UUIDs, zero records | PASS                                                           |
| A signs back in after B                   | Restore the original account and data                          | `a-relogin-same-account`, `a-edit-flow-visible`: A's identity, saved profile and original record                                                                    | PASS                                                           |
| Draft, foregrounding and remote edit      | Preserve draft without silently rebasing its revision          | `a-draft-after-foreground`: latest server title and distinct unsaved draft coexist                                                                                  | PASS                                                           |
| Stale native Save                         | Reject overwrite and offer explicit reload                     | `a-stale-write-rejected`, `native-conflict-server-write.json`: revision 7 unchanged; `a-conflict-reload-result` shows latest data                                   | PASS                                                           |
| Task completion                           | Show success after a real write                                | `a-task-completed`, server revision 8 with `completed=true`                                                                                                         | PASS                                                           |
| Cancel edited draft                       | Discard text without a write                                   | `a-cancel-no-write`, `native-server-a-1789384553497.json`: title/revision 8 unchanged                                                                               | PASS                                                           |
| Confirmed API outage during logout        | Close access, clear credentials, report unconfirmed steps      | `offline-logout-fault-receipt.json`: proxy paused, access closed, error shown, proxy restored; `a-confirmed-offline-logout-restart` is signed out after restart     | PASS for access/persistence; generic error copy required a fix |

The earlier `reverse --remove` logout probe alone cannot prove a complete network
outage because an existing connection may survive. The decisive logout fault test
paused only `supabase_kong_ghaf-parent-pilot`, preventing responses on existing
connections. Its receipt confirms the proxy was unpaused in `finally`. No hosted
service was affected. The misleading startup error after logout prompted a distinct
`logout-error` state and cleanup-only retry. A successful later cleanup retry does
not prove revocation of a previously unreachable remote session after its local
credentials have already been deleted.

The raw study-save recording was reviewed using 30 decoded samples. It shows
press/loading feedback followed by the saved row. Inline form collapse and status
insertion move scroll content; this is not evidence of uniform frame timing.
Onboarding motion, reduced-motion/large-text observations and residual raster
decode gaps are recorded in
[the native motion report](../../docs/competition-readiness/workstreams/native-motion-main-20260914.md).

## Logout-error refinement and final artifact

The latest local functional test APK is
`account-logout-fix/ghaf-account-logout-fix-LOCAL-FUNCTIONAL-TEST-ONLY.apk`.
SHA-256: `61692537d23d40e3cccb92b16d5c5ab15709d7ba50ed642b32b6a17af7b26a9d`.
Its unchanged before/after runtime fingerprint is
`beabc1157da125b681b940f076f05693b1e6371d4381029fe07e31b2102266dd`.
The Hermes bundle hash is
`9c7e701a20c5a58536666a721ec6dbe5f26d9090c8297dc6d17a0d640c0b95b7`.
See `account-build-logout-fix.log` and `account-logout-fix/{source,packaging}-receipt.json`.
It has the same verified native container and local-test limitations as the second
candidate. Installation with `adb -s emulator-5554 install -r -t` succeeded.

This cold boot produced unrelated Android Messages/System UI not-responding
dialogs. Their hierarchies/screens are `logout-fix-initial.xml`,
`logout-fix-system-anr.png`, and `logout-fix-after-system-dialog.*`. Selecting the
observed Wait controls let Android settle; `logout-fix-settled` then showed the
actual sign-in screen. No app data was cleared. Cold-start performance remains
unverified.

The final artifact independently signed in as A and retrieved the account
(`logout-fix-loaded`). Pausing only the local API proxy reproduced the failure:
`logout-fix-fault-receipt.json` confirms protected access closed and the dedicated
error appeared; `logout-fix-outage-error.png` shows accurate copy and no account
records. The proxy was restored in `finally`. Before the first manual Retry tap,
the existing 60-second gate refresh completed cleanup and reached sign-in. That
attempt is not counted as a manual Retry pass.

The repeated outage exercised the actual Retry control before periodic cleanup:

| Flow / scenario                     | Expected result                                                 | Observed result / evidence                                                                                                                                                  | Result |
| ----------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Failed logout and explicit Retry    | Keep access closed and retry cleanup, never session restoration | `logout-fix-manual-retry-receipt.json`, `logout-fix-2-error`, `logout-fix-2-manual-retry`, `logout-fix-2-retry-signed-out`: dedicated error, actual Retry tap, then sign-in | PASS   |
| Restart after failed logout/cleanup | Keep credentials removed and remain signed out                  | `logout-fix-2-restart-signed-out`, `logout-fix-final-screen`: force-stop/relaunch remains sign-in                                                                           | PASS   |
| Local API restoration               | Leave the existing service usable after fault injection         | Both outage receipts record running/unpaused proxy after `finally`; final Docker inspect is `true false`                                                                    | PASS   |

`logout-fix-final-device-receipt.json` records API 35, user 0, 720×1600/density320,
normal 1x animation scales during testing and font scale 1.0. The original unset
animator setting was restored afterward (default 1x); the requested tall display
override is intentionally retained. No accessibility service is enabled. Current
process inspection found zero matching fatal/React Native error lines in the last
300 log lines (`logout-fix-app-error-excerpts.log`); that limited check is not a
claim that every earlier process log was error-free. The app is left running at
the signed-out Arabic entry screen. The prior A/B records remain in the local DB.

Final handoff checks `npm run format:check` and `npm run repo:check` passed after
the source fixes (`handoff-format-check.log`, `handoff-repo-check.log`). The
latest typecheck/lint/full-suite results are in the executed-checks table. All
generated APKs, recordings and native fixtures remain outside tracked source.

## Reproduction and remaining acceptance

Checks were executed from the repository root:

`supabase` below denotes the installed cached executable on this host:
`C:/Users/narut/AppData/Local/npm-cache/_npx/6f1b058a4d9555af/node_modules/@supabase/cli-windows-x64/bin/supabase.exe`.
It was invoked by absolute path; no global CLI installation is implied.

```powershell
npm run typecheck
npm run lint
npm run format:check
npm run repo:check
npm test -- --maxWorkers=1
# Enable only the loopback harness; obtain its public key without printing CLI status.
node node_modules/vitest/vitest.mjs run tests/access/parent-account-local.integration.test.ts --maxWorkers=1
supabase test db supabase/tests/database/account_profiles.test.sql supabase/tests/database/account_workspaces.test.sql
```

Native commands used the SDK executable documented above:

```powershell
adb devices -l
adb -s emulator-5554 shell getprop sys.boot_completed
adb -s emulator-5554 install -r -t <recorded-local-test-apk>
adb -s emulator-5554 reverse tcp:54321 tcp:54321
adb -s emulator-5554 shell am start --user 0 -n ae.ac.ku.ghaf.prototype/.MainActivity
adb -s emulator-5554 shell am force-stop --user 0 ae.ac.ku.ghaf.prototype
adb -s emulator-5554 shell input keyevent 4
adb -s emulator-5554 shell am start --user 0 -W -a android.intent.action.VIEW -d ghaf://parent ae.ac.ku.ghaf.prototype
python .expo/persistent-accounts-20260914/device.py capture <unique-name> --serial emulator-5554 --expect <screen-test-id>
```

Two-device acceptance still requires a working second AVD/device and is BLOCKED
on this host. The same-emulator result above verifies two local native
installations; the first fresh hosted APK adds native/independent-SDK data and
session evidence. Hosted migrations, approved synthetic-account access and a
fresh Gradle internal build now have direct evidence in the latest sections;
their earlier blocked statuses are historical. The shell-fix APK was installed
and its targeted recorded comparison passed within the inspected samples.
Hosted external verification/recovery email delivery, human acceptance,
physical performance, forced native expiry/revocation and recovery scenarios,
TalkBack spoken traversal and large native record volumes remain outstanding.
The floating-Gboard recovery first-Back case failed; docked-keyboard dismissal
remains unverified. Final fixture cleanup/operator settings and the last B-switch
repetition now pass with the explicit handoff receipts above. No production
readiness is claimed.
