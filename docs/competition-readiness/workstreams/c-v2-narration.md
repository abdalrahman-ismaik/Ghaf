# Arabic onboarding v2 narration repair

## Current result — all six Arabic v2 clips connected

Updated 2026-09-13T09:07:55.016493+00:00. The user replaced the empty sustainability file with a valid
164,720-byte MP3, duration10.292188s, SHA256
`f2f0b5886529b8767c3747f0dbeb94a1535732fb96f8449ef5588bbe93330549`. Fresh ffprobe and full ffmpeg decode pass;
the existing8082preview returns HTTP200audio/mpeg with identical bytes. The prior five file hashes
are unchanged, so their passing decode checks are reused rather than repeated.

All six Arabic runtime bindings now select v2. The sustainability page has its narrator again.
The earlier text-only state and proposed12→11test patch below are **superseded**; do not apply that
patch. Existing M016 platformtest expectation12 is correct and was never changed by C.

C also repaired M016's reported test lint defect: the VM hook invocation has an explicit
`invokeNarratorWithDoubles` alias. Missing-source tests use a copied injected fixture; actual asset
identity covers all6hashes, and available-playback cases cover each topic. No lint suppression,
production-map mutation or native-evidence claim was introduced. Scoped ESLint on changed map/test
passes (exit0), as does formatting. The production hook/UI behavior from the previous slice is
unchanged. M016's earlier integrated test run reported2073passes and one failure at the temporary
11versus12asset assertion; that historical result is not represented as a pass for this updated
candidate. Final integrated checks remain M016-owned.

Evidence: `output/native-ui/v2-narration-20260913-c/replacement/`. Earlier empty-file and failed
lint/fullsuite records remain preserved. No clip generation, provider request, new browser, native
build, shared index or other-owner file edit. Final human pronunciation/text-parity and physical
Android playback acceptance remain separate and unclaimed.

## Earlier five-clip repair record — superseded where noted above

Session C, `C-20260912T011718Z-root`, shared `/home/smyk/projects/Ghaf` on
`redesign/ui-experiments`. Started at `07c3a8e9f3cecad3d4fdcbd2c01a9898c97e0c73`, board85.
Direct user instruction: “why does the app uses the old audio? use v2 audio”.

## Observed cause and change

The ordinary onboarding source map still required all six Arabic v1 MP3s. The restored demo
wrapper separately passed `narrationEnabled={false}`. This is a source-selection finding; no
stale-cache diagnosis was established.

Five supplied Arabic v2 MP3s are valid: intro, family, assistant, support and growth. All five now
replace their corresponding Arabic v1 source bindings. No Arabic v1 fallback remains in this map.
The restored demo enables its existing narrator for Arabic; English demo remains silent and the
ordinary English v1 mappings remain unchanged because no English v2 files were supplied.

The sixth file, `assets/audio/onboarding/narration-ar-sustainability-v2.mp3`, remains0bytes. It is
not registered with Expo: the sustainability source is explicitly null, returns unavailable,
and cannot autoplay or replay. The visible screen remains navigable. Its existing speaker control
is disabled and receives the existing bilingual unavailable label. Available sources retain their
retry control after a playback error; missing audio is distinguished from a temporary error.

The hook retains unconditional `useAudioPlayer`, existing readiness/screen-reader/web-unlock
rules, and every revision-based playback cleanup. No new audio player, dependency, translation,
route, design, account, provider request or narration generation was introduced. Media bytes
were not modified. The old v1 files remain historical assets.

## Exact boundary

- `src/components/onboarding/onboardingAudioSources.ts`
- `src/components/onboarding/useOnboardingNarrator.ts`
- `src/components/onboarding/FirstRunOnboarding.tsx` — unavailable audio control only
- `src/components/demo/OriginalDemoEntryScreen.tsx` — Arabic narration prop only
- `tests/demo/original-demo-entry.test.tsx` — actual AR/EN prop expectations
- `tests/presentation/onboarding-v2-audio.test.tsx` — exact asset identity and mocked hook effects
- `assets/audio/onboarding/README.md` — new selection and preserved historical authoring record
- This report and ignored `output/native-ui/v2-narration-20260913-c/**`

The five registered v2 assets must accompany any source commit/build. Do not include the empty
sustainability file as a playable runtime asset. C preserves M016's active app/routes/resources,
messaging work and existing `tests/platform/r003-first-run-experience.test.ts` ownership.

## Validation and limitations

| Check                                                           | Result                             | Evidence                                                                                      |
| --------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| Exact media identity and full MP3 decoding                      | PASS for five clips                | `media-checks.json`; ffprobe/ffmpeg exit0 for each                                            |
| Sustainability v2                                               | FAILED / unavailable               | 0bytes, ffprobe exit1; no attempted decode                                                    |
| Existing preview asset serving                                  | PASS                               | All5HTTP200audio/mpeg and exact SHA equality; Metro62701cwd canonicalGhaf; served-assets.json |
| Owned TS/TSX syntax                                             | PASS                               | 6production/test modules transpile with0diagnostics; not semantic typecheck                   |
| Scoped formatting                                               | PASS                               | Prettier on exact C source/test/audioREADME paths                                             |
| New source identity/hook-effect and existing cancellation tests | BLOCKED: lane handoff not received | C109 request; no second test pool during M016 browser                                         |
| Existing demo entry props                                       | BLOCKED: same scoped run           | Arabic selected, English preserved                                                            |
| Existing source-count regression in M016 test                   | Requested exact owner patch        | C109:12static requires→11, no M016 file edited by C                                           |
| Browser actual loaded source/audio playback                     | NOT RUN                            | Existing8082/Metro62701 and M016 Firefox62800 preserved                                       |
| Native Android/audio/Back/TalkBack                              | NOT RUN                            | No device action, APK build or native acceptance                                              |
| Per-clip pronunciation/transcript parity                        | PENDING                            | Technical decode does not establish either                                                    |

The new tests execute the real compiled source map with mocked Metro registration and the real
hook effects/playback controller with deterministic React/Expo doubles. They are not mounted
React or native playback evidence. Existing deferred-seek cancellation tests remain applicable.
No passing full-suite, native or human results are inherited from earlier batches.

## Assistance and review

Applied local `ghaf-quality-workflow` and existing UI/design-system conventions. Lead traced the
actual runtime sources, decoded five clips, implemented the bounded repair and prepared regression
coverage. One read-only helper `/root/duration_review` confirmed nullable Expo sources and the
existing cleanup contract, identified the conflicting12asset test, and caught an initial UI choice
that would disable retries for ordinary playback errors. Lead corrected it to use `hasSource`.

Actual helper prompt and contribution are preserved in the ignored assistance receipt. Requested
Astra/Ultra/Fast follows the session preference; root/serving settings are unexposed and the resumed
helper reported no observable model/Fast setting. No named human/student participation or exact-diff
acceptance is invented. The user explicitly selects v2; new clips' provider/model/provenance and
transcript review are not inferred from the earlier three Wiam recordings.

## Recovery and integration

Replace the empty sustainability file with a valid recording, then explicitly bind that source and
validate its new bytes; copying a file does not automatically replace the null mapping. Continue
using text on this one page meanwhile. Do not restore the old Arabic narrator.

C109 requests M016's one-line source-count expectation update and a serialized scoped check slot.
No browser restart is needed for this source repair; the existing development server may reload
changed modules. An already installed APK would require the revised assets in a new build.
The proposed one-line M016 test patch is in `m016-source-count-proposed.patch`; it is unapplied.
C source/evidence checkpoint is ready for M016/A integration validation; this is not a passing
full-test or semantic-typecheck claim. Five assets are
served by the current preview with exact local hashes, which does not prove audible playback.
No C test/browser pool or commit overlaps M016. Source is explicitly released to M016/A for integration checks. C has no jobs/helpers remaining.
No staged coordination records or other contributor changes are included.

Final C handoff 2026-09-13T09:00:23.059032+00:00, observed HEAD `07c3a8e9f3cecad3d4fdcbd2c01a9898c97e0c73`. Scoped format/diff and
6module TypeScript syntax checks pass;5MP3decodes and5served-asset hashes pass. C109/C110 requests
for the shared test adjustment/check slot remain unacknowledged. Firefox62800 has since ended
and no test pool was observed; absence is not an ownership transfer. C did not acquire the lane.
The pending one-line M016 test expectation and unavailable sixth recording are explicit blockers.
All C source/report/artifact/helper allocations are released for integration; only STATUS-C remains
C-owned. No local commit was attempted through M016's shared index ownership.
