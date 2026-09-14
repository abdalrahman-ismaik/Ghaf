# Native motion continuation on main — 2026-09-14

Starting point: clean `main`, `d91ef57`. User requests actual Android Emulator
build/run/inspect/fix/retest. No Git mutation beyond working-file edits is authorized.
All prior source boundaries are released; current reservations are in TEAM_OWNERSHIP.
This record is also the tracked Codex assistance disclosure; no human acceptance is
inferred from assistant implementation or automated tests.

Scope: finish native verification of shared press/live preferences, section loading,
existing success sheets, and adjacent synthetic Study interactions. Fix only issues
reproduced or directly established in these flows. No outbound messages, account
changes, new cloud behavior, purchases or destructive resets.

Recovered baseline: main runtime files/package lock match `e8ae266`; app config
matches `9d756ef`. Previous emulator APK `615048cd27c2c2856fbbaac2de113024325d3ec8d8819d9b56c216770705b27f`
contains that runtime/config using the existing native container with extraction
enabled. It is a source-matched baseline, not a successful full Gradle rebuild.
Fresh installed identity and runtime observations remain pending.

Artifacts: ignored `.expo/native-motion-main-20260914/`. Emulator target and original
settings will be recorded before interactions. Baseline capture, scenario results,
implementation, test commands and final working-tree state follow below.

## Recovered environment and baseline

- `git branch --show-current`: `main`; status/diff empty at start; HEAD `d91ef57`.
- Expo 57.0.20 / RN 0.86.3 / React 19.2.3, npm lockfile, Hermes/New Architecture;
  Reanimated 4.5.1, Worklets 0.10.1, RNGH 2.32.0 and Router 57.0.19. No upgrade.
- Existing AVD `Ghaf_API35_ARM64Bridge`, serial `emulator-5554`, API 35 Google Play
  x86_64 with ARM64 translation, 1536 MB RAM, 2 cores. Reused its data; no wipe,
  clear, uninstall, account change, outbound message or purchase.
- Initial 720×1280 at density 320 (360×640 dp). Per user steering, also tested
  `adb -s emulator-5554 shell wm size 720x1600` (360×800 dp, 20:9).
- Original settings are in `original-settings.json`: window/transition 1.0,
  animator unset (platform default), font 1.0, no enabled accessibility service.
  Normal tests explicitly use all three animation scales at 1.0.
- Installed starting APK pulled and SHA-256 matched `615048cd…`. Cold launch
  reported 4499 ms in `am start -W`; this is activity timing, not full UI readiness.
- Fresh current-main synthetic baseline compiled with `expo export:embed --dev
  false --max-workers 1`, Hermes 98, and packaged into the same native container.
  APK SHA-256 `c955a57f23a62f8d269e3660d984f481afe9f9b236a5a992f3c85ea11b2b0b34`.
  Explicit mock services/demo auth/demo entry, live AI off, messaging unconfigured.
  No private dotenv or credential file loaded. `adb install -r` succeeded.
- The container is non-debuggable, previously built native code at `273f97d`,
  with existing debug signer and current Back/extraction manifest. Packaging
  verified 98 resource mappings, 1626 unchanged non-bundle payloads, v2/v3 signer,
  Hermes bytecode 98 and 16 KiB alignment. This is **not a full Gradle rebuild**.
  Required NDK 27.1/CMake 3.30.5 are absent on C:; only NDK 27.0 is installed.
  The prior D: build workflow is excluded because of documented filesystem errors.

## Prioritized findings and bounded implementation

| Priority / file | Confirmed issue and impact | Change | Risk / verification |
| --- | --- | --- | --- |
| P1 FirstRunOnboarding | Native baseline Next is initially clipped to 27dp visible height at 360×640; a swipe reveals it. | Existing footer holds full controls; story retains natural scrolling. | Low; native bounds, text, scroll and 20:9/compact checks. |
| P1 FirstRunOnboarding | Step-name-only readiness allows narration too early on Next→Back; four new tests reproduce it. | Visit-scoped readiness rejects stale image/timer callbacks. | Medium; red/green reversal tests plus native rapid navigation. |
| P2 FirstRunOnboarding | Startup-only motion preference and unconditional entrance reset cannot handle live changes coherently. | Shared live preference, settle/cancel, no replay of current step. | Medium; live emulator setting and background tests; hook tests. |
| P2 FirstRunOnboarding / LocalIllustration | Baseline video shows blank image frames and independent inner image fade during parent transition. | One synchronized 180ms parent transition, optional image-duration override set to zero only here. | Low; native recordings, preserve default image behavior test. |

Preserve native navigation/Back, existing press spring, section readiness, garden
recognition, tab architecture, image identity/error fallback, Arabic/English copy,
business actions and all backend/messaging files. No new gesture or animation library.

## Evidence handling and checks so far

Baseline focused command `npm test -- --maxWorkers=1 tests/motion
tests/platform/onboarding-presentation-readiness.test.tsx
tests/platform/r003-first-run-experience.test.ts tests/study`: **137 passed**.
First implementation typecheck passed. The new unmount test initially counted an
unrelated root warmup timer; it now asserts cancellation of the exact narration
timer and preserves that root timer. Focused checks then passed **62 tests**.
Four new Next/Back/stale-image tests failed on the earlier candidate and passed
after visit-scoped readiness; one obsolete source-string assertion was updated.

Useful baseline recordings: `baseline-reversal.mp4` (step 2 → 3 → 2 repeated),
`baseline-live-reduced.mp4`, and `baseline-onboarding.mp4` (compact scrolling).
`baseline-reversal-frames/` and `baseline-live-reduced-frames/` contain decoded
timestamped full-resolution PNGs/contact sheets. Existing local Chromium/Playwright
decode the native MP4 offline; no web application is used as native evidence.

Excluded from comparison: `demo-baseline-tall.png` captured before the resize
finished; `tall-baseline.mp4` reached the Child chooser because rapid inputs began
before the intended stable onboarding state. Their captures are retained and are
not claimed as onboarding reversal or comparative performance passes.

Intermediate candidate `0227ca643fd2bebf4f9ef1232f3ceab1e14a12da587bc9505b097def0f754f3b`
installed successfully. `candidate-first-tall.png`, `candidate-first-compact.png`
and `candidate-first-compact-scrolled.png` confirm full 60dp Next controls and
scroll access to the full compact story body. It predates the visit-readiness fix;
final runtime results must identify the subsequent candidate separately.

## Final motion candidate runtime

Installed final motion APK:
`256f18b5c807e234866537e2d05cab3e0434fc6b5562f970ea07a4c74d16858a`.
Its fresh working-tree bundle includes visit readiness; native payload is unchanged.
The later Feature 018 account test APK also includes these motion changes.

| Flow / scenario | Expected | Observed | Result |
| --- | --- | --- | --- |
| Compact onboarding, 360×640 dp | Full Next target, scrollable story | 60dp control at `[40,1088][680,1208]`; story can scroll | PASS |
| Taller onboarding, 360×800 dp | Full controls with safe insets | 60dp Next at `[40,1408][680,1528]` | PASS |
| Raw rapid Next/Back reversal | Latest step wins, no stuck blocker | Repeated 2→3→2 returns to step 2 | PASS |
| Press DOWN then CANCEL | Feedback releases without action | Step 2 remains selected | PASS |
| Live animation scales 1→0 | Immediate non-spatial final states | Copy changes immediately; no parent spatial transition | PASS |
| Background, return, restore 1× | Preserve current step, no replay | Step 2 retained | PASS |
| Font scale 1.5 | Full navigation, reachable body | Wrapped Arabic body fully reachable by scroll | PASS |
| TalkBack spoken traversal | Correct labels/focus | Service bound; system permission surface interrupted testing | NOT RUN |
| Adjacent Study keyboard/Back, success sheet | Preserve existing behavior | Not exercised natively in this motion continuation | NOT RUN |

Evidence: `final-intro-tall.png`, `final-reversal-state.png`,
`final-press-held.png`, `final-press-cancelled.png`, `final-live-reduced-state.png`,
`final-resumed-motion.png`, `final-large-text.png`,
`final-large-text-scrolled.png`, `final-reversal.mp4`,
`final-live-reduced.mp4` and their decoded frame/contact-sheet directories.
Recordings were inspected, not merely captured. Residual raster decode blank frames
remain during rapid image replacement, including with reduced motion. Removing the
extra fade did not eliminate that decode gap; no flicker-free claim is made.

`dumpsys gfxinfo` samples during recorded reversals: baseline 28 frames / 15 janky
(53.57%), final 35 / 19 (54.29%). Baseline p50/p90/p95: 57/97/97ms; final:
48/133/150ms. These tiny emulator/ARM-translation samples are not a controlled
performance benchmark and do not demonstrate an improvement. Physical mid-range
release profiling is still NOT RUN. No 60/120FPS or jank-free claim is made.

Animation/font/TalkBack settings were restored: window/transition 1.0, animator
unset (platform default), font 1.0, accessibility services unset, accessibility
enabled 0. The user-requested taller 720×1600 override is retained for subsequent
account testing; original size is recorded above and `wm size reset` restores it.

Full baseline suite had 2786 passed / 1 failed / 2 skipped. The only failure was
the pre-existing source test expecting predictive Back true while main already
sets false in `9d756ef`; the test was reconciled without a native config change.
Final motion-focused checks passed 71 tests. Combined account/motion final checks
and final Git status are recorded in Feature 018 validation after its runtime run.
