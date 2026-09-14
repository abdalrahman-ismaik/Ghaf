# Feature 017 implementation evidence

Source starts at merged main `c07bad9` on `feature/017-study-family-support`.
Owner instruction: implement saved proposals 8–12; "Proceed from the saved proposals".
Evidence recorded on 2026-09-13 using synthetic local data. No hosted deployment occurred.
Runtime validation applies to `6577897`; subsequent changes only finish documentation.

This is the historical Feature017 source handoff. Later hosted messaging, diagnostic
Android and resumed layout-fix evidence is recorded in the
[current messaging/Android integration record](../016-real-family-messaging/backend-android-validation.md).
Study correction `6726f25` and messaging correction `923cf10` now have limited
physical passes in the internal JavaScript update described below. The later
`0ad7a0d` header correction and full physical acceptance remain pending. The dated
NOT RUN rows below describe the original handoff and do not negate later evidence.

## 2026-09-14 diagnostic and hosted follow-up

The earlier diagnostic APK is `273f97d` on Samsung SM-S918B / Android 16. The
configured browser export is `1a1c474`; it includes the browser transport fix but
predates the later native layout corrections. These candidates must not be recorded
as a passing final corrected APK.

| Boundary                                | Result | Direct evidence                                                                                                                                                                                                                        |
| --------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Diagnostic native study plan            | PASSED | Root exercised the synthetic Mathematics plan `Equal groups`: Child choice, start and completion.                                                                                                                                      |
| Diagnostic native academic goal/prize   | PASSED | Parent approval and Child agreement fixed an 80/100 target with an optional blue-ball gift; Child reported 85, Parent acknowledged the strategy, unlocked the promise and marked it given. Fulfillment was a synthetic rehearsal only. |
| Diagnostic Child isolation              | PASSED | Switching to the actual Alya Child experience showed empty plans and goals.                                                                                                                                                            |
| Diagnostic reset                        | PASSED | Root used Parent Settings reset/confirmation, observed settled Arabic Welcome, then reopened Parent Study with Salem selected and confirmed empty plans/goals.                                                                         |
| Hosted phone/web Parent–Child exchange  | PASSED | Diagnostic `273f97d` phone and `1a1c474` browser displayed both directions in the same verified service thread, once each. This used one phone plus a browser.                                                                         |
| English browser sibling exchange        | PASSED | In isolated Parent, Salem and age-6–8 Alya contexts, Parent explicitly enabled the exact pair; Salem sent text, Alya selected a phrase and explicitly sent it, and both received the messages. Alya had no free-text composer.         |
| Browser peer visibility/revocation      | PASSED | Parent responses/UI exposed permission without peer content. Parent revocation removed both Child peer views and retained their separate Parent conversations with empty drafts.                                                       |
| Web session cleanup                     | PASSED | The three web test sessions signed out, extra contexts and then the browser/server closed. No Parent account or phone device was revoked; synthetic server records/messages remain.                                                    |
| Full corrected Gradle builds            | FAILED | Both `923cf10` and owner-authorized `c4b7c26` retry failed after D: lost writes. The retry produced 17 further exFAT events; no more D: builds are allocated.                                                                          |
| C:-only internal JS-update installation | PASSED | APK `98223bd9…` combines `273f97d` native code with `923cf10` JavaScript from `a365f9b`. Payload/signing checks, install -r and a 1050 ms cold launch passed; this is not a full native rebuild.                                       |
| JS-update native Study/messaging layout | PASSED | Root observed AR/EN Study body/tabs/mixed nickname and messaging body/list corrections, plus restored Parent context and the existing two-message history. Arabic header alignment remained an explicit defect.                        |
| Latest header APK packaging             | PASSED | `0ad7a0d` JavaScript update `d937a462…` verified; separate extraction-only `73aced8e…` package verified and installed on the C: emulator. Functional/physical acceptance remains separate.                                             |

Native evidence is recorded in ignored
`.expo/messaging-integration/diagnostic-study-journey.json` and
`diagnostic-reset-settled.json`, with screenshots `resume-study-plan-proposed.png`,
`resume-study-plan-child-complete.png`, `resume-study-goal-parent-agreed.png`,
`resume-study-child-goal-submitted.png`, `resume-study-prize-unlocked.png`,
`resume-study-prize-given.png`, `resume-study-alya-plans-isolated.png`,
`resume-study-alya-goals-isolated.png`, `resume-native-arabic-reset-settled.png`,
`resume-native-study-reset-empty.png` and `resume-native-goals-reset-empty.png`.
Root performed the phone actions; the documentation owner inspected the
fulfillment/isolation/empty-reset images. The settled Welcome receipt is recorded
at 05:49:08 UTC; the earlier `resume-native-arabic-reset.png` captures only the splash
transition. Diagnostic screens still expose the nickname-direction and narrow-tab
defects addressed by later source corrections. The subsequent internal update's
presentation passes have their own artifact identity and receipts below.

The installed C:-only internal update has APK SHA-256
`98223bd92160c843c7c9db36d19c1f38cdec0316ce945ac72c0fa4cf77f219fe`. Its 98 resource
mappings and payload preservation were checked: only the JavaScript bundle changed
against the base; 1,626 other payloads stayed unchanged, and all 1,627 candidate
payloads matched after signing. Root verified 16 KiB alignment and the expected
internal certificate. Receipts are under
`%LOCALAPPDATA%/GhafIntegration/20260914/js-update-923cf10/`, including
`source-receipt.json`, `repackage-validation.json`, `signed-artifact.json`,
`signed-payload-verification.json`, `signing-verification.log`, `install.log` and
`launch.log`. The documentation owner inspected those receipts and the English
Study/Arabic messaging images; root performed installation and the phone actions.
Screenshots under `.expo/messaging-integration/` include `js-update-study-{ar,en}.png`,
`js-update-messaging-en-settled.png`, `js-update-messaging-ar.png` and
`js-update-messaging-history-en.png`. The Arabic header in this artifact remains
left-aligned; source `0ad7a0d` addresses it. Its original package failed before
JavaScript on the ARM-translation emulator; the separate extraction-only package
now renders Arabic onboarding and enters Parent Home. Installed SHA-256 is
`73aced8e982653a4825b191a28a4137e8ebb63a3080c7e18006534ac8b94c3b3`.
The primary integration record retains exact packaging/startup receipts. These
observations do not establish the later Study/header or physical gates. Its source-test log
is `final-header-messaging-tests.log`: 73 passed, one skipped, 10:00:24 Dubai,
6.75 seconds. The full D: retry's separate failure is recorded in
`d-drive-second-write-failure.json` and `failed-native-054842/`.

Browser receipts under `.expo/messaging-integration/web-audit/` include
`bidirectional-history.json`, `sibling-permission-granted.json`,
`sibling-text-salem-to-alya.json`, `sibling-phrase-alya-to-salem.json`,
`parent-peer-visibility.json`, `sibling-permission-revoked.json`,
`sibling-audit-cleanup.json` and `final-web-session-cleanup.json`. The phone-tested
Salem was matched by server identity/thread despite a duplicate synthetic nickname.
The peer thread retained two ordered messages; permission removal did not erase
server history or revoke the family account. The detailed candidate identities and
safe message receipts are in the current integration record linked above.

Remaining work includes direct emulator header, keyboard/Back, lifecycle/revocation,
accessibility and critical Study/goal/reset
regressions on the final candidate. The installed internal update is a separate
passing artifact; both full Gradle rebuilds failed. Arabic sibling UI,
Child-initiated stop and offline/unknown-send UI
recovery were not run in the English browser audit. Named Arabic review, student
teach-back and two-physical-phone acceptance remain separate gaps.

## Original 2026-09-13 handoff matrix

| Boundary                                                | Result  | Evidence                                                                                                                                                                                                                                               |
| ------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Study domain/repository                                 | PASSED  | Focused tests cover roles, agreements, stale revisions, lower-mark retry, idempotency, corruption and verified storage.                                                                                                                                |
| Store/family binding                                    | PASSED  | 126-test focused integration run, including unchanged timestamp/new family, failed orphan clear, Parent/Child handoffs and zero progression effect.                                                                                                    |
| Messaging transport/controller/UI                       | PASSED  | 57 tests after the peer extension; legacy Parent threads, consent/revocation races and helper targeting preserved.                                                                                                                                     |
| SQL migration and authorization                         | PASSED  | 29 existing RPC tests + 12 peer tests in PostgreSQL 16; migration001 history survives002. Isolated localhost55432 cluster stopped after run.                                                                                                           |
| Compact AR/EN browser journey                           | PASSED  | Chrome via Playwright at390×844: Arabic plan and date digits, target٨٫٥/١٠, Parent approval, Child plan/help/completion, goal acceptance/result, Parent acknowledgement/fulfilment, separate Alya space, supported listening session and Arabic reset. |
| Static checks/full regression                           | PASSED  | Typecheck, lint and maintained-file formatting passed. Final regression: 2,718 passed, one pre-existing opt-in integration test skipped; 189 passed files and one skipped file.                                                                        |
| Web/Android bundles                                     | PASSED  | Web export includes 44 static routes, including all four new study/practices routes. Android export produced one 8.9 MB Hermes bundle and metadata. Both commands exited 0.                                                                            |
| Hosted Auth/PostgREST/two-device delivery               | NOT RUN | Separate messaging service remains unconfigured; pilot credentials are unrelated.                                                                                                                                                                      |
| Physical Android/keyboard/Back/TalkBack/process restart | NOT RUN | Browser and bundle checks cannot pass physical-device gates.                                                                                                                                                                                           |
| Named human Arabic review and student teach-back        | NOT RUN | Generated bilingual content and implementation need actual named review.                                                                                                                                                                               |

## Local browser evidence

Observed screenshots in ignored `.playwright-cli/`:

- `page-2026-09-13T19-02-12-302Z.png`: supported listening activity completed in English.
- `page-2026-09-13T19-03-12-071Z.png`: academic promise marked fulfilled after Parent review; synthetic rehearsal, no actual prize delivered.
- `page-2026-09-13T19-04-04-805Z.png`: signed-out Arabic reset after meaningful work.
- `page-2026-09-13T19-09-26-880Z.png`: final exported Arabic Study space with correct right-to-left selector order.
- `page-2026-09-13T19-10-30-903Z.png`: Arabic messaging setup state with no false delivery claim.

Final exported Arabic finite practice also exercised an incorrect answer, neutral
retry, and the correct answer with explanation. Parent/Child handoffs used the
quick-demo development entry; the final exported visual check used the ordinary
local Parent chooser.

English goal screen measured 390 px document width at a 390 px viewport; zero horizontal
overflowing elements. No new console error during study, goals, family practices or
reset. Skipping the existing onboarding narration logged an audio play/pause AbortError
before the new flows; existing web file-system and pointerEvents warnings also occurred.
These are recorded observations, not a clean-console or native-audio acceptance claim.

SQL logs: WSL `/tmp/ghaf-messaging-017/run-eekoSmlX/`. PostgreSQL 16 was installed in
the local Ubuntu distribution for isolated tests; an existing interrupted package
configuration had to finish first. No application package/lockfile dependency changed.

The first full regression exposed seven exact-inventory failures: four new routes
and the extra study-key removal/readback. Those tests were updated with explicit
authorized entries and preserved exclusions. The final full regression passed.

## Automated evidence

Ignored logs under `.expo/feature017-evidence/`:

- `typecheck-final.log`: `npm run typecheck`.
- `lint-final.log`: `npm run lint`.
- `format-final.log`: `npm run format:check`.
- `tests-final.log`: `npm test`, 26.92 seconds, started at 23:07:19 Dubai time.
- `web-export.log`: web export to `.expo/feature017-web/`.
- `android-export.log`: Android export to `.expo/feature017-android/`.

The web exporter printed its forced-exit notice after completing the export, with
exit code 0. This is bundle evidence, not an Android installation or device rehearsal.

SQL command:

```powershell
wsl -d Ubuntu -- env FM_RUN_ROOT=/tmp/ghaf-messaging-017 bash /mnt/c/Users/narut/OneDrive/Desktop/Project/Ghaf/workers/ghaf-family-messaging/tests/run.sh
```

The harness used synthetic Auth fixtures and actual SQL authorization functions,
not a hosted messaging account.

## Integration handoff

The independently verifiable commits are `c14e413` (authority/specification),
`2164dd2` (study domain/storage), `39d0b88` (peer messaging), `32cbe8f` (guided
practices), and `6577897` (bilingual UI/store integration). All helper write
boundaries are released. Source is ready for the user's authorized merge and push;
hosted delivery, physical acceptance and named human review remain separate gates.
