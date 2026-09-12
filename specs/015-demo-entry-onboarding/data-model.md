# Feature015 data and state

- EntryMode: immutable ordinary/demo selected before repositories/controllers. Never persisted.
- DemoPrincipal: fixed parent_al_noor / child_salem / child_alya; no arbitrary user ID lookup.
- DemoRunGeneration: monotonic nonnegative integer within the process; increments on successful
  explicit reset, remains outside transaction rollback. Restart constructs generation0 with new memory.
- DemoEntryEpoch: monotonic per-process counter, incremented on successful entry/sign-out and
  authorized reset start; stale selectors cannot re-enter after a later handoff in the same run.
- DemoResetFailed: terminal current-process failure latch after any partial demo reset; denies role/
  profile commands and presents full-close/restart instructions. No old-state restoration promise.
- DemoEntryRequest: principal plus expectedGeneration and expectedEpoch captured by current entry view.
- DemoEntryHandoff: selected principal/destination/current Child/family/controller public views and
  generation and entryEpoch. No raw token/session snapshot. Used once by A's synchronous aggregate commit.
- Initialized-generation cache: adapter-local only, set after successful access initialization;
  cleared by invalidate. It is not a persistent record or proof of actual identity/pairing.
- Canonical family: existing versioned schema and receipt, one Parent/two children. Save only to demo
  memory; display family name begins أسرة النور (Al Noor Family). No extra relative or private content.
- Story: exactly three fixed IDs together/support/growth, bilingual resources, approved static image
  IDs action/support/growth. Selecting/replaying/completing a story never selects a profile or awards.
- Narration: candidate script/clip/review metadata; no accepted new clips yet. Complete text-only
  fallback is mandatory. No runtime recording/provider/network.

Transitions: signed_out/uninitialized → fixture_ready/signed_out → selected authorized principal.
Failure in fixture save remains signed_out; authority failure returns to exact prior controller/
access state. A saved zero-authority memory fixture may remain. Successful sign-out returns to
selector with the same task/progress. Successful Parent reset invalidates generation and clears the
run; process death starts a fresh run. Ordinary mode bypasses all new demo entry commands/UI.

## T014 ephemeral narration context

All three exact Arabic Wiam clips now have actual user listening approval (C060); the earlier
no-accepted-clips statement above is historical. No audio is yet imported into the baseline5d build.
The new controller holds only revision, pending/requested/unavailable flags and disposed status.
Its source context binds locale, one story ID, runGeneration, entryEpoch and one player identity.
No context or playback preference is persisted; it creates no session, permission, Seed or event.
Only explicit Play/Replay may request start; cancellation invalidates before pause, and stale seek
completion cannot play. View playing state comes from matching current native status. See exact
controller/presentation contracts in contracts/demo-narration-v1.md.

Each accepted playback intent creates a fresh manually owned player/controller and session token.
Retirement clears the active token before independent cleanup attempts. Startup deadline and native
status subscriptions are session-bound; stale events/timers never affect a newer intent. Native
resource release is asynchronous and focus interruption observation is incomplete; acceptance
retains those explicit device gates. Nothing in this context confers access or progression.
