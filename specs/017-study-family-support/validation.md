# Feature 017 implementation evidence

Source starts at merged main `c07bad9` on `feature/017-study-family-support`.
Owner instruction: implement saved proposals 8–12; "Proceed from the saved proposals".
Evidence recorded on 2026-09-13 using synthetic local data. No hosted deployment occurred.
Runtime validation applies to `6577897`; subsequent changes only finish documentation.

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
