# Demo entry v1 — exact integration contract

Status: D failure/privacy review complete (D-NB1-20260912T0122Z-root-004); scope requested by user, runtime grants follow this contract commit. Source baseline e02d02b. This is not recovery014 or R002b release activation.

## Configuration and storage

A owns `src/config/demoEntry.ts`: `EntryMode = 'ordinary' | 'demo'` and immutable `entryMode`.
Only `process.env.EXPO_PUBLIC_GHAF_DEMO_ENTRY === 'true'` selects demo; absent/other values select
ordinary. Use the exact static access expression for Expo substitution. No runtime URL, setting,
role mutation or persisted flag can choose mode. B builds the new internal candidate with this
explicit environment value once A publishes its source; ordinary mode remains the regression build.

Extract existing `createMemoryLocalKeyValueStorage` into `src/services/local/memoryStorage.ts`;
export it explicitly from local/index without relying on Metro's `.native/.web` storage resolution.
Keep current test/node `storage.ts` device default and native/web device storage behavior unchanged.
In demo mode the registry's family, device-affinity, saved-template and ambience repositories use
one new isolated memory storage instance; no reads/writes to platform storage. Startup skips normal
family/affinity restoration and starts signed out. No new package/config/lock change is needed.

## Adapter owned by B after exact grant

Runtime file: `src/features/access/demoEntry.ts`.
Tests: `tests/demo-entry-adapter.test.ts`.
Use direct type imports; importing the registry barrel here would create a construction cycle.

```ts
// A publishes this shared union in src/models/demoEntry.ts before C begins.
export type DemoPrincipal = 'parent_al_noor' | 'child_salem' | 'child_alya';

export interface DemoEntryContext {
  readonly mode: 'ordinary' | 'demo';
  readonly runGeneration: number;
  readonly entryEpoch: number;
  readonly activeExperience: 'signed_out' | 'parent' | 'child';
  readonly activeChildId: SyntheticChildId;
  readonly temporaryParentAccess: boolean;
}

export interface DemoEntryRequest {
  readonly principal: DemoPrincipal;
  readonly expectedGeneration: number;
  readonly expectedEpoch: number;
}

export interface DemoEntryHandoff {
  readonly principal: DemoPrincipal;
  readonly destination: '/parent' | '/child';
  readonly activeChildId: SyntheticChildId;
  readonly family: LocalFamilyRecord;
  readonly parentOnboarding: ParentOnboardingView;
  readonly childAccess: ChildAccessView;
  readonly runGeneration: number;
  readonly entryEpoch: number;
}

export interface DemoEntryDependencies {
  readonly family: LocalFamilyRepository;
  readonly parent: Pick<
    ParentOnboardingController,
    'getView' | 'restoreCompletionReceipt' | 'resumeRememberedParent'
  >;
  readonly child: Pick<
    ChildAccessController,
    'getView' | 'restorePairedDevices' | 'resumeRememberedChild'
  >;
  readonly readContext: () => DemoEntryContext;
  readonly now: () => string;
  readonly runAtomically: <T>(operation: () => ServiceResult<T>) => ServiceResult<T>;
}

export interface DemoEntryAdapter {
  enter(request: DemoEntryRequest): ServiceResult<DemoEntryHandoff>;
  invalidate(): void;
}

export function createCanonicalDemoFamily(now: string): ServiceResult<LocalFamilyRecord>;
export function createDemoEntryAdapter(dependencies: DemoEntryDependencies): DemoEntryAdapter;
```

Named types come from existing model/controller/local-repository modules. No raw session or snapshot
is returned to UI or persisted. Runtime validates unknown/malformed request fields despite TypeScript.
Use existing ServiceResult/error types (`INVALID_INPUT`, `INVALID_TRANSITION`, `INVALID_RESPONSE`).

Canonical family: `household_al_noor`, exactly `parent_al_noor`, Salem and Alya with existing
valid two-Child profile defaults; visible family name `أسرة النور` / `Al Noor Family` (the record's
single display-name field uses Arabic initially). Use the existing schema/receipt conversion, no
handcrafted invalid record or runtime test helper. Parent label is a role, not an invented person.
No relatives, credentials, sensitive notes or real media. Both prepared Child markers are synthetic.

Initialization is a separate idempotent, zero-authority phase on the first explicit entry. Create/
validate/save the canonical family in isolated memory before the access transaction. If that write
fails, enter no controllers. The canonical memory record may remain after failed access; this is
not progression, a remembered principal or a persisted account. Ordinary storage remains unchanged.
After successful initialization, current valid in-memory profile wording may be retained; never
reseed progress or replace the run on each profile entry. Reject missing/mismatched records in an
already initialized generation instead of silently repairing a changed family.

For access: require demo, matching nonnegative integer run generation AND entry epoch, signed-out aggregate state,
no temporary Parent handoff, Parent status `signed_out`, Child status `signed_out` and no reentry.
First successful initialization restores the family receipt and both Child markers in the transaction.
Then call ONLY the chosen Parent/Child resume method; Parent preserves current selected Child (initial
Salem), Child selects its own ID. Before success check the SAME run generation/entry epoch and still
signed-out aggregate context, but the expected controller POSTCONDITIONS: chosen role authenticated
with its authorized capability, other role signed_out. Do not re-require the chosen controller signed_out.
Set initialized-generation cache only after success. Invalidating clears that cache, never progression.
The operation is fully synchronous: no verification, pairing request, permissions, reset, timers,
promises, navigation or Zustand writes. Declared failure/throw must leave usable signed-out controllers.

## A-owned authority transaction

Add `withDemoEntryTransaction<T>(operation: () => ServiceResult<T>): ServiceResult<T>` to the
existing access service and Parent/Child controllers. Access owns the outer wrapper, Parent the
middle, Child the inner. On error/throw/malformed or thenable result, restore private state directly;
never call termination/reset for rollback. Sanitize exceptions as INVALID_RESPONSE, no raw error copy.
Reject same-instance reentry and propagate abort so a swallowed nested error cannot commit.

Snapshot only entry-mutated state by value:

- Access: sessions (clone principal/capabilities), devices, proofs; preserve map identities by clear/set.
- Parent controller: status, identifier kind/normalized identifier/masked destination, delivery,
  offline fallback, draft, session, completion/replacement receipts and draft backups,
  verification attempt and session generation. Reuse existing clone helpers.
- Child controller: status, selected Child, pairing request, session, device map and sequence.

Do not include run-generation/transaction-control guards in rollback snapshots. Do not mutate
pairing requests, permission grants, voice state or progression inside the transaction; B's narrow
ports intentionally omit those APIs. A rejects reset or sign-out reentry while entry is running.
Thenable rejection is defensive: it cannot cancel arbitrary async work; reviewed callbacks may
not schedule such work. Fault injection must prove actual maps and command authority, not just flags.

Existing SyntheticAccessService may expose the wrapper as an optional capability for structural
compatibility with old test/providers; demo integration MUST fail closed if unavailable. The default
deterministic service implements it. This is an internal callback, not a user-accessible capability.

## A-owned aggregate commit and route integration

Add the store's run generation, entry epoch, demo-reset-failure latch and `enterDemoExperience(request)` command. Validate both controller
sessions as signed out before opening the adapter transaction; never use direct `setRole` or fake
verified credentials. Commit the handoff once after success, retaining all existing progress and
clearing only stale transient access/assistant/media views. No fallible entry operation follows
that commit. Increment entryEpoch in this success commit; increment it again on successful sign-out.
The epoch is distinct from runGeneration: it invalidates captured old-selector callbacks even after
a later sign-out within the same run, without reseeding progression. Publish errors without making
partially restored controller views visible.

The welcome route uses the demo selector before the ordinary FirstRunOnboarding branch in demo
configuration. Active authorized roles still redirect to their own home. Guard `/access` ordinary
setup/sign-in/pairing routes back to signed-out demo entry in demo mode. Authenticated Parent/Child
layout guards remain authoritative; deep links never select profiles.

Sign-out uses the current role's termination/cleanup and returns through a fresh signed-out root
using the proven navigation reset helper. No in-app role toggle. Existing Child `beginTemporaryParentAccess`
CTAs in demo mode perform a normal sign-out to the selector, with no temporary remembered-Child
marker or credential screen; ordinary mode retains current behavior. Parent→Child return therefore
also uses the explicit selector. Do not bypass praise/confirmation to speed the demo.

Explicit Parent reset rejects an in-flight entry (mark the attempt aborted if reentrant code tries
reset). Once a real authorized reset begins, increment entryEpoch immediately. On successful existing
aggregate reset, increment runGeneration, invalidate the adapter and return to signed-out Arabic
selector. Old callbacks carry the old epoch/generation and are rejected.

Failed-reset oracle is intentionally different from failed-entry rollback: current aggregate reset
performs sequential clears and cannot promise its old run survives a mid-reset failure. In demo mode,
any such failure sets demoResetFailed, closes the aggregate experience, clears transient UI/media
views and invalidates entry. Every role selector/requirement and demo entry fails closed while the
latch is set. Show a complete localized restart-required state, without task/progression or profile
entry actions; do not claim reset success or offer a misleading retry on partially cleared state.
A full process restart creates new memory/controllers and a fresh usable run. Test first/middle/last
failing reset stages and actual command/route denial while latched, then fresh-process initialization.
The label must say to fully close and reopen the app (web: reload), not imply a normal background/
foreground resumes it. This is a bounded failure fallback, not atomic reset or recovery014. Ordinary
reset behavior remains unchanged. A native reboot/restart result must be actually recorded by D.

## C-owned presentation contract

Files after grant: `src/components/demo/DemoEntryScreen.tsx`,
`src/components/demo/DemoOnboardingStory.tsx`, `src/components/demo/types.ts`,
`tests/demo-entry-presentation.test.tsx`. A owns route/resources; C components never import store,
service registry, access controllers or router. No barrel modification required: A imports directly.

Props are defined in types.ts before implementation, matching this contract:

```ts
interface DemoProfileOption {
  readonly principal: DemoPrincipal;
  readonly name: string;
  readonly roleLabel: string;
  readonly description: string;
  readonly avatar: 'parent' | 'ghaf_tree' | 'flower';
}
interface DemoStoryMoment {
  readonly id: 'together' | 'support' | 'growth';
  readonly title: string;
  readonly body: string;
  readonly imageAlt: string;
  readonly assetId: 'onboarding-action' | 'onboarding-support' | 'onboarding-growth';
}
interface DemoEntryCopy {
  readonly title: string;
  readonly body: string;
  readonly disclosure: string;
  readonly restartNotice: string;
  readonly breadthNotice: string;
  readonly busyLabel: string;
  readonly restartRequiredTitle: string;
  readonly restartRequiredBody: string;
  readonly storyAction: string;
  readonly languageAction: string;
  readonly profiles: readonly DemoProfileOption[];
  readonly moments: readonly DemoStoryMoment[];
  readonly story: {
    readonly close: string;
    readonly next: string;
    readonly back: string;
    readonly finish: string;
    readonly progressLabel: (current: number, total: number) => string;
    readonly audioUnavailable: string;
  };
}
interface DemoEntryScreenProps {
  readonly locale: LocaleCode;
  readonly direction: TextDirection;
  readonly copy: DemoEntryCopy;
  readonly busy: boolean;
  readonly error: string | null;
  readonly restartRequired: boolean;
  readonly onChooseProfile: (principal: DemoPrincipal) => void;
  readonly onChangeLocale: () => void;
}
```

The three asset IDs above exist in illustrationSources.ts; use action/support/growth, with no
new artwork. C imports DemoPrincipal from A's shared src/models/demoEntry.ts, published before its
source grant. The three profile choices are fixed IDs, not an arbitrary array-driven account list. When restartRequired is true, render the complete restart instruction and language control but
no profile buttons/story entry; no authority-dependent content. C can own local story-open/step UI state; it
never chooses a role from story completion. Closing/finishing returns to the same selector; replay
starts at first moment, silent. No audio starts in this slice while no reviewed matching clips exist.
C also owns a script/voice candidate packet in c-product-refinement.md; content is pending Arabic
review. A integrates equivalent resources after review of the exact draft. A later explicit exact
asset/lifecycle grant is required for reviewed replacement clips, preserving opt-in playback and
stop/screen-reader/background behavior. Do not wire six old clips to three new moments.

## Evidence oracles

B adapter tests: all profiles; invalid/active/temporary/reentrant entry; failed seed/second marker;
authorization plus cleanup failure; exception; generation invalidation; retry; unchanged current-run
progress; no auto approval/permission. A transaction tests: inspect maps/authority after failure and
preserve unrelated permissions/voice authority; ordinary regression unchanged. A store/route tests:
real controller sessions and isolated repositories, handoff, Back, deep links, reset, same-run Seed
48→60 and task help +12 once, and no Salem action under Alya. C rendered tests: real props/actions,
three profiles, three optional moments, bilingual copy, failure state and no automatic audio.
D independent retests actual source/APK, native large text/RTL/Back and real Arabic listening.
