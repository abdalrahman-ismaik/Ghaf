# Onboarding and browser narration correction — September 12

The owner rejected the delivered opening at `http://localhost:8081/`: the introduction looked like
one screen, narration was absent and Parent/Child entry was unclear. This is a correction after
the poster handoff; the submitted-file candidate and its screenshots are not rewritten.

## Reproduced causes

At source98be865, DemoEntryScreen initialized storyStep=null and hid three moments behind a low
Discover Ghaf action. Parent/Salem/Alya choices existed, but the page did not distinguish onboarding
from profile selection. The narrator explicitly threw for Platform.OS=web; every browser therefore
rendered unavailable. All three exact user-approved Wiam clips were already bundled. No runtime
provider, account, rights or microphone gate caused this result.

Installed React Native Web cannot detect screen-reader use: its query always resolves true and
its observer only supports reduced motion. Removing the throw alone would not fix playback. The
previous contract required this silent web fallback; the selected correction updates that rule
without inventing a disabled screen reader. Native still requires known-disabled reader and
observed foreground state. Web permits direct Play/Replay intent only, with unknown reader state.

The previous Metro225406 was launched with CI=1 and kept serving the frozen98be865 transform after
source edits. A reload still showed the old copy. A stopped that verified own process group to
refresh the exact candidate; this was not a route/cache bypass in the application.

## Selected correction

Contract5ab8571 and reset clarification6bfea81 precede implementation. Fresh process opens moment1
of3, with a profile-selection escape on every page. Next/Back use the existing fixed AccessScreen
footer while full body text scrolls. Skip/finish chooses no authority: it opens the three fixed
profiles. Nonzero-epoch handoff and explicit Parent reset keep the fast direct selector; no store,
authority or persistence field changes. Onboarding can be replayed from the selector.

The selector explicitly asks who is joining and describes credential-free Parent/Child demo
profiles. Approved three body scripts, Arabic audio bytes, task/privacy/progression semantics and
ordinary six-step onboarding remain unchanged. English describes the Arabic-only narration;
Arabic offers explicit speaker/Listen, Stop and Replay controls. No autoplay or native/public
release acceptance is inferred.

## Evidence

- Actual pre-fix browser body and screenshot: output/onboarding-correction-before.png and
  Playwright output/playwright/4066 records. Three moments existed; web narration unavailable.
- Fresh-entry regression failed twice (Arabic/English) before UI correction; old40 tests passed.
  output/onboarding-correction-red.log. Corrected focused presentation+narration:46PASS.
- Audio helper pure policy/controller:12PASS; scoped ESLint/Prettier/diffPASS. Initial unsupported
  minWorkers option rejected before execution. These are not mounted hook/native tests.
- First full typecheck found TS2322 in new test fixture (frozen literal true assigned false).
  A made the test-local environment explicitly mutable; corrected typecheckPASS. Both logs retained.
- Initial integrated candidatecad80c0: all four checksPASS,151files/1,993tests. UI helper review
  found no material footer, heading-group, handoff or cancellation regression.
- Actual playback exposed a second failure: Expo web's onplay reports playing=true/isLoaded=true
  before loading. Its zero-time loadeddata then reports playing=false, causing immediate retirement.
  Fix0da7237 requires positive web media time before setting started; native behavior unchanged.
  New predicate regression plus existing controller:58PASS. No speculative player rewrite.
- MCP Firefox lacked PULSE_SERVER and failed with OnMediaSinkAudioError after decode. A separate
  browser in the same serialized lane inherited the existing WSLg Pulse socket; no system change.
  The earlier muted probe is retained and cannot establish audible output. Initial cold Metro
  bundle took~78seconds and caused tool timeouts; those failures remain in Playwright records.
- Final browser script and receipt: output/native-integration/015/onboarding-correction-browser/.
  On0da7237 it recorded initial0playcalls, all3UNMUTED media clocks >0.5s (volume1), durations
  15.36/23.719125/22.88325s, Stop, Replay, cancellation on Next/finish, silent English explanation,
  320px no horizontal overflow with reachable fixed controls, and actual Parent/Salem/Alya homes.
  No complete-clip listening or native/human review is claimed. Earlier locale cancellation was
  observed in the separately labeled muted probe. All three MP3s keep exact supplied identities.
- Six final screenshots have loaded original images; earlier startup/blank-image captures are
  superseded and unaccepted. The compact support body scrolls behind the fixed footer; full text
  remains present and navigation outside its scroll view. This is browser evidence, not native
  large-font/touch/Back acceptance. No second visual polishing loop or new artwork was introduced.
- Final full checks for0da7237 are recorded in onboarding-correction-final-checks/receipt.json.
  All four checks PASSED on exact0da7237:151files/1,995tests.
- Native APK/listening/focus, actual screen-reader interaction and student review remain pending.

## Assistance record

Actual owner request: “the current onboarding screen is very bad. why did you make it just one
screen? and where are the audio narrations? and the layout and design to choose if you want to
login as a parent or a child screen also where is it?” Owner confirmed localhost8081.

A generated the bounded015 amendment, UI/footer composition, bilingual selector/control changes,
regression and evidence. One Astra/ultra helper first read the actual narrator and installed RN
Web/audio implementations, then owned only the hook, pure environment policy and policy tests.
Fast selector/effective served model settings are unexposed. Helper prompt required foreground
manual web intent, truthful unknown reader state, unchanged native fail-closed observation,
unchanged session retirement and no provider/browser/dependency work. A separately owns actual
browser checks. Later the same helper reviews only UI lifecycle/footer/heading semantics read-only.

Rejected: deleting only the web throw; setting reader=false without evidence; restoring bad old
clips; autoplay; forcing a mandatory login ceremony; new packages; native/sound acceptance from
SSR or pure tests; claiming the earlier poster screenshots depict this later candidate. Actual
student exact-diff understanding, approval and public audio rights remain pending.

The final bounded browser is closed and all helper allocations are released. The sole canonical
preview is PID366844 on8081 with normal watching, original demo/mock environment and all11flags off.
Source0da7237 supersedes the UI shown by the frozen poster screenshots without changing that poster.
The final source0da7237 is ready for owner review; no native APK build was selected.
