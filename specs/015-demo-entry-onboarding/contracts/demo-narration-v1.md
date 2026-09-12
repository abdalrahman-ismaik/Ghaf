# Feature015 T014 — optional Arabic demo narration v1

Status: A accepts the selected T014 controller/shared boundaries after D061 and the native
adapter retirement contract after D063 (report887cdf2). D reviewed exact f452d25 source-contract
content; subsequent status text records preparation/acceptance without changing the API or rules.
C implementation still requires A's published prerequisites and exact synchronization/file grant.
Product intent and the user's three exact listening approvals are already recorded. Baseline APK
runtime5d8a3e8 stays frozen. No native, mounted, student or public-distribution acceptance is claimed.

## Scope and accepted content

Use the three body-only scripts in `demoEntry.moments.{together,support,growth}.body` and the
three exact Arabic MP3s released by C060/5dca312. English remains fully readable and silent;
no English recording has been accepted. Preserve ordinary six-step narration and its player helper.
No TTS/network/provider, microphone, library, account, persisted audio preference or new authority.

| Moment   | Internal candidate target                            | Exact supplied SHA256                                            |
| -------- | ---------------------------------------------------- | ---------------------------------------------------------------- |
| together | assets/audio/demo-onboarding/ar-together-wiam-v1.mp3 | 8782ac7eb4bbd6ec04296206e700dea62562cc4b43258744c5b66caeeab19edf |
| support  | assets/audio/demo-onboarding/ar-support-wiam-v1.mp3  | 3815ad0eedd67a6cd8e9446599640239732e222f04272200ecd115acf756c034 |
| growth   | assets/audio/demo-onboarding/ar-growth-wiam-v1.mp3   | ff7d2ae63f6985c5a8a0d19164f52c0bd9130273d68bad37d4189fc3c7da0d5e |

Copy these user-supplied bytes without conversion. Asset README records source paths, hashes,
user-reported Wiam/Multilingual v2 and Free plan, actual listening decisions, and the C-N06
primary-source rights/attribution disposition. Free-plan provenance is now known; permitted
public uses must not be inferred from listening approval. Internal candidate integration does not establish public distribution rights. Public
release, named student review and actual native listening remain separate gates.

## Exact ownership and dependency order

A owns this contract and plan/tasks/research/model/quickstart amendments. After D review, A owns:
`src/features/onboarding/demoPlayback.ts`, `tests/demo-playback.test.ts`, the three asset paths above,
`assets/audio/demo-onboarding/README.md`, `app/index.tsx`, `src/i18n/resources.ts`,
`tests/demo-entry-routes.test.tsx`, and the preparatory shared type/fixture edits in
`src/components/demo/types.ts` and `tests/demo-entry-presentation.test.tsx`. A publishes required
scope/copy types, route values, equivalent labels and typed fixture updates together so the
preparatory slice typechecks. Story narration controls are optional until C wires them; absence
retains the existing silent fallback. A then explicitly releases types/presentation-test paths to C. A retains store/routes/registry/shared primitives/dependencies.

After A publishes the controller/assets commit and an exact clean synchronization grant, C owns
only `src/components/demo/{types.ts,DemoEntryScreen.tsx,DemoOnboardingStory.tsx,
useDemoOnboardingNarrator.ts,demoNarrationSources.ts}` and
`tests/{demo-entry-presentation.test.tsx,demo-narration.test.tsx}`. The latter may claim mounted
lifecycle coverage only when an actual supported harness executes; no SSR-only substitute.
C may prepare an ignored harness under `output/native-ui/narration-lifecycle-harness/**`, using
existing Metro/ReactDOM/Playwright tooling only after a concrete harness plan and A preview grant.
No new test library is authorized, and mounted rows remain BLOCKED until that tooling works. C may delegate only disjoint
parts inside this grant within quota1; no shared primitive, resource, route, package or old narrator edit.
D owns its report and ignored native evidence, and reviews the concrete contract read-only first.
Original C presentation/source allocations were explicitly released; no stale lock takeover.

## Pure playback controller — A publishes before C

Types and factory live together in `src/features/onboarding/demoPlayback.ts`:

```ts
export interface DemoPlaybackPort {
  pause(): void;
  seekTo(seconds: number): Promise<void>;
  play(): void;
}
export interface DemoPlaybackState {
  readonly pending: boolean;
  readonly requested: boolean;
  readonly unavailable: boolean;
}
export interface DemoPlaybackOptions {
  readonly player: DemoPlaybackPort;
  readonly isAllowed: () => boolean;
  readonly onChange: (state: DemoPlaybackState) => void;
}
export interface DemoPlaybackController {
  getState(): DemoPlaybackState;
  restart(): Promise<void>;
  cancel(): void;
  fail(): void;
  dispose(): void;
}
export function createDemoPlayback(options: DemoPlaybackOptions): DemoPlaybackController;
```

No React, store, route, media source or platform import in this module. State is ephemeral and
returned as immutable snapshots. Creation is silent. Only explicit `restart` requests playback.
Reject/coalesce another restart while a seek is outstanding; never overlap seeks on one player.
Pause before seeking, capture a revision, await `seekTo(0)`, then recheck revision/disposal and
`isAllowed()` immediately before `play()`. Checks must occur both before AND after each
external guard/callback: a guard or onChange callback can synchronously cancel, fail, dispose or
reenter and still return successfully. Re-read revision/disposal/failure state after it returns
and before the next player operation. Capture request identity before the first external call,
set the pending/reentry lock before callbacks, and never let a successful callback undo cancellation.
Recheck after pause and after loading notification before issuing seek. Ignore stale guard/error
results, including successful reentrant callbacks; observer exceptions never permit playback.
Catch thrown/rejected player operations and guard errors;
return settled promises, never leak an unhandled rejection. Treat callback errors defensively without
turning a failure callback into permission to play. No automatic retry or delayed queued replay.

`cancel` increments revision and clears requested state before attempting pause; it is synchronous.
It never waits for an old seek. An outstanding seek remains internally locked until settled, even
when cancelled; stale settlement may release its own pending marker but must not alter a newer
request/source, report a stale error or play. Current pause/play/seek/guard failure marks unavailable
and invalidates requests. `fail` handles a matching current native player error the same way.
`dispose` permanently disables the instance, invalidates/pause-cleans it, and suppresses subsequent
callbacks; it must be idempotent and catch disposal-time pause errors. Native player ownership,
removal and release belong exclusively to the adapter. A new player gets a new controller.

## Presentation and native adapter — C

Export these shared presentation types from `src/components/demo/types.ts`:

```ts
export interface DemoNarrationControls {
  readonly status: 'silent' | 'loading' | 'playing' | 'unavailable';
  readonly canPlay: boolean;
  readonly canStop: boolean;
  readonly canReplay: boolean;
  readonly screenReaderActive: boolean;
  readonly onPlay: () => void;
  readonly onStop: () => void;
  readonly onReplay: () => void;
}
```

Add required `runGeneration: number` and `entryEpoch: number` to DemoEntryScreenProps. A passes
existing aggregate values from app/index.tsx; no new state authority. Add optional `narration?: DemoNarrationControls` to
DemoOnboardingStoryProps; missing controls render the complete silent fallback. Extend `copy.story` with `audioPlay`, `audioStop`, `audioReplay`,
`audioLoading`, `audioScreenReader`; retain `audioUnavailable`. A alone adds equivalent resources.
Use visible plain labels, existing accessible buttons and full transcript. Never shrink or truncate
essential navigation. At most one primary play/stop action plus replay when meaningful; loading
retains immediate Stop and all navigation. English/unavailable/screen-reader states keep readable
text and a truthful short status without presenting a broken enabled playback control.

`useDemoOnboardingNarrator` accepts `{ locale, step, active, runGeneration, entryEpoch }`, where
step is DemoStoryStep|null. It returns controls; C may add an internal synchronous cancel alias.
Keep the hook in DemoEntryScreen outside keyed AccessScreen. No player exists until an accepted
explicit Play/Replay intent. Use existing `createAudioPlayer` with `downloadFirst: false`, never
`useAudioPlayer` ownership or a download/replace continuation. Each accepted intent creates a new
player/controller and immutable session token containing source, locale, step, generation and epoch.
Repeated input while pending is coalesced; never replace a source or reuse a retired player. Resolve
only the three Arabic IDs, and use no source for English/inactive/invalid scope. A source/player,
locale, step, generation or epoch change invalidates the previous controller in layout cleanup.

Configure non-looping playback and bounded normal volume using existing APIs, catching failures.
Subscribe with `player.addListener('playbackStatusUpdate', handler)` and inspect current status
after subscription; require the active session token and matching status.id for every event.
`playing` requires `playing && isLoaded && !isBuffering` plus current permission. This is
player-reported playback, not proof of audible sound. Matching `status.error` retires the session
and marks unavailable. A 10,000ms startup deadline measured from accepted intent retires a session
that never reaches this playback state; do not retry automatically. After playback began, an
observed unexpected stopped/interrupted status retires it. Completion retires it silently without
starting a clip or advancing the story. All stale events and timers are ignored by identity.

Retirement first invalidates the session token and clears the active slot synchronously, then
independently attempts controller cancellation/disposal, subscription removal, `player.remove()`
and `player.release()`. Every cleanup is guarded so one exception cannot skip later attempts.
Cancellation includes best-effort pause; remove alone does not stop sound. Never invoke a player
after release. No global audio-mode, dependency or native-source change is authorized. Subsequent
explicit Play/Replay creates a fresh instance rather than rearming the old one.
Foreground permission requires a known current `AppState` value exactly `active`. Unknown initial
state, failed state observation or failed change subscription fails closed. Cancellation events
update the synchronous permission refs and invalidate requests BEFORE React state publication;
a queued seek continuation must already see inactive/screen-reader state. This also applies to
source/player/reset identity changes. No effect, load event, source change, foreground restoration or screen-reader disablement starts
playback. Play and Replay are the only start intents.

Before close/skip/finish/step/Back/locale/profile callbacks, synchronously retire. Native Back in
DemoEntryScreen must cancel before changing story state. On background/inactive or screen-reader
enablement events, cancel immediately before publishing React state. Unknown/rejected screen-reader
query or subscription failure fails closed. A late initial result cannot override a newer event.
Do not assume web screen readers are disabled; unavailable detection leaves narration silent.
Unmount, reset identity change and inactive story cleanup invalidate pending work. Foreground or
returning to a previous moment never auto-resumes. Navigation/readable story cannot wait on media.

Installed Android focus/background restoration can call play on registered players independently
of JS requests. Its pause does not clear that resume state. `remove()` synchronously unregisters
the player only; `release()` detaches its shared object and schedules native player release on
the main dispatcher. Successful removal excludes it from later fresh registry iterations, but
cannot revoke a native callback's already-captured reference. Generic status does not expose a
synchronous audio-focus-loss event. Thus this design closes pause-only reuse and observed lifecycle
paths; cancellation before an unobserved native focus-loss/gain cycle is NOT PROVEN. The stronger
no-resume requirement remains a native acceptance gate, not a guarantee from source or mocks.
The installed Android player also hardcodes status.error to null and has no effective native error
callback override. Defensive error handling and the startup deadline preserve silent fallback;
exhaustive native decode-error reporting is not claimed. These limits must accompany test results.

Installed expo-audio57.0.4 declares pause/play/remove as synchronous void and seekTo as Promise.
Its web player discards the underlying HTML media play promise: outer try/catch cannot establish
exhaustive web playback-error handling. Preserve fallback, report that limitation, and do not add
another library or claim native acceptance from browser/mocked players.

## Required evidence

A pure tests: no construction autoplay; permitted explicit start; pause/seek/play/guard failure;
deferred seek then cancel/dispose/permission loss; multiple rapid requests coalesced; old settlement
never starts another request; state callback exceptions and successful reentrant guard/onChange callbacks that cancel, fail,
dispose or call restart; repeated cancel/dispose. A false foreground/reader guard never starts. No exact-mirror tests.

C mounted hook/component tests: actual event wiring for Back, step, close, finish, locale, profile,
background/inactive, reset generation/entry epoch, unmount, screen-reader detection failure/event
race; settle outstanding seek after each and assert no play. Current native error, source/player
replacement, completion without autoplay, English/missing-media silence, no optimistic playing,
startup timeout, retirement cleanup exceptions, fresh-intent player allocation, stale events/timers,
source/hash mapping and full transcript/controls. Native focus/background return after Stop must
be tested on the actual artifact; mocked registry removal cannot pass that gate. Existing server-rendered presentation tests alone
cannot pass lifecycle wiring; preserve ordinary tests and no old-clip imports into the demo path.

Actual harness prerequisite: current Vitest runs in Node and existing presentation tests use SSR.
D verified no react-test-renderer, jsdom, happy-dom, testing-library, react-reconciler or Vitest
browser package; A additionally found esbuild unavailable. ReactDOM/client and the existing Expo
Metro/Playwright tools exist. No new dependency is selected. Mounted lifecycle rows are explicitly
BLOCKED until C proposes and runs a bounded existing-tool harness in its ignored directory under
a granted preview lane; hook/effect mocks must remain labeled mocks. Source preparation and pure
controller tests may proceed after contract acceptance, but T014 cannot be called fully validated
from those alone. Actual native testing remains separately required.

A integrates released source, adds route/resources and runs proportional focused checks plus the
full typecheck/lint/format/suite once for the new candidate after native-heavy release. B rebuilds
only A's published exact runtime candidate; baseline5d APK stays separately identified. D independently
verifies the new APK and real native lifecycle, Arabic quality and touch/RTL states when authorized
hardware is available. User listening approvals are retained; native/student/public-rights gaps
remain honestly pending. No recovery014, optional feature or release-flag activation follows.
