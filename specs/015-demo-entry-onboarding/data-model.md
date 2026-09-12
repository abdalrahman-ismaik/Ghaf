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
