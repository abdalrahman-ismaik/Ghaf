# Child Today, task review and League clarity

## Ownership and authorization

The user requested continuing development from the screen-status review on 2026-09-13.
This root continuation takes only the independent presentation repairs QAF-006, QAF-008 and
QAF-011. Baseline: `e7fa118` on `redesign/ui-experiments`, with existing accessibility,
narration, catalog-planning and coordination edits preserved.

Exact source boundary: `app/child/index.tsx`,
`src/components/r002a/child/ChildTodayLandscape.tsx`, `app/parent/task/review.tsx`,
`app/league.tsx`, and `tests/presentation/league-profile-header.test.tsx`.
Contract/evidence boundary: this report and
`specs/003-family-growth-garden/contracts/screen-clarity.md`.
No helpers, shared store/resource/token changes, Garden changes, catalog activation,
accessibility-slice edits, narration integration, provider deployment or feature activation.
The independent active A/B/C/D writers retain their files and coordination records.

## Implementation and evidence

Implementation COMPLETE; release every exact source/test/contract/report path above after the
scoped local commit. Board 99/100 explicitly protected these paths pending this handoff; Session A
may then integrate its CE1 changes. Browser allocation RELEASED at 2026-09-13 14:16 UTC:
Playwright closed the owned page and process inspection confirmed Firefox PID 225334 ended.
Metro PID 62701 on 8082 remains unchanged. No helper, browser, native or check job is retained.

- QAF-006: `ChildTodayLandscape` supports a compact horizontal welcome when the route has current
  work. The empty-state illustration stays full size; all welcome and task wording remains.
- QAF-008: recipient and confirmation-only award appear together. Review action, permitted help,
  supervision, definition of completion and safety precede effort and rationale. Stronger field
  headings and quieter language labels improve scanning; every Arabic and English value remains
  visible. Long bilingual review content still requires scrolling. Participant comprehension and
  further simplification remain open; this is a bounded presentation improvement.
- QAF-011: the private League header now uses the selected local Child's nickname and avatar,
  matching Today. Shared League rows are unchanged. Committed as `997a952` with a rendered route
  regression covering Salem/Alya, Arabic/English, missing-profile fallback and sibling isolation.

### Automated evidence

- PASSED: final focused regression, five files / 52 tests, 3.61 seconds at 18:05:26 Asia/Dubai.
  Command: `npx --no-install vitest run tests/presentation/league-profile-header.test.tsx tests/growth/r002b-private-league-route-integration.test.ts tests/growth/r002b-private-league-presentation.test.ts tests/presentation/r002a-child-task-presentation.test.ts tests/presentation/r002a-parent-review-presentation.test.ts --maxWorkers=1`.
- The new League test first failed four identity cases while two fallback cases passed; the
  header correction then passed all six. An initial test-harness translation mock was corrected
  before that red/green comparison; no production behavior was changed to satisfy a mock.
- PASSED: scoped ESLint with `--max-warnings=0` for the five source/test paths in the ownership
  boundary, repeated on continuation after the final review ordering/spacing adjustment.
- PASSED: the bounded Impeccable detector returned no findings for the four affected UI files.
- PASSED: `npm run typecheck` before concurrent CE1 source edits. FAILED on the shared checkout
  during final handoff, with five errors in files outside this slice: missing
  `parentWelcomeUpdates` in `app/parent/index.tsx`; two unsupported
  `conditional_both_agree` kinds in `src/features/tasks/catalogDefinitions.ts`; and two
  insufficiently narrowed `presentationActionId` accesses in `tests/tasks/catalog-execution.test.ts`.
  Session A owns these active CE1 paths. This report does not claim a green combined checkout.
- PASSED: scoped `prettier --check` for all seven source/test/documentation paths and
  `git diff --check` for the three remaining source changes.

### Manual browser evidence

Firefox, ordinary Expo web preview `http://localhost:8082`, synthetic profiles, at 390×844 and
320×740. Evidence is local and ignored at
`/home/smyk/projects/Ghaf/output/playwright/screen-clarity-20260913/`.

- PASSED: Parent task creation, prepared Guide suggestion, bilingual Review and assignment in
  English and Arabic using real controls. Final review captures: `review-{en,ar}-{390,320}.png`.
  Permitted help and supervision precede completion/rationale in the rendered document. The sticky
  approval control remains reachable at both widths. No Seed award occurs on assignment.
- PASSED: Salem's Arabic active-task welcome and visible task action at 390 px; captures
  `today-ar-{390,320}.png`. Action bounds at 390 were y=662, height=60. At 320 the action remained
  below the first viewport (y=756); readable text and full safety guidance were preserved.
- English active-task geometry was observed at 390 (action y=664, height=58) and 320 (y=840).
  `today-en-{390,320}.png` were captured during the returning-welcome exit transition and are
  explicitly excluded from settled visual acceptance. The attempted repeat was interrupted and
  then blocked by concurrent CE1 changes; no replacement screenshots or repeat pass is claimed.
- PASSED: Alya's empty Today state keeps its larger illustration without Salem's task. Captures:
  `today-alya-en-390.png`, `today-alya-ar-320.png`. Today and League expose the same local nickname
  and flower avatar source; captures: `league-alya-en-390.png`, `league-alya-ar-320.png`.
  Salem's Arabic League header was also visited (`league-salem-ar-390.png`).
- Local Parent/Child entry and switching used prepared account, PIN and picture-sequence controls.
  One explicit full-page navigation cleared in-memory task state, consistent with deferred
  recovery 014. This slice does not implement restart recovery or revalidate the full award cycle.

Observed locator timeouts, one array-inspection mistake and an initial incorrect Arabic-label
assertion were corrected in the browser harness. They are not treated as product failures or
discarded passes. Earlier screen evidence was collected on a shared dirty checkout including
other owners' narration changes; it is not clean-build or native acceptance.

To Session A (board 100): earlier browser evidence predates CE1 edits. The attempted final
English screenshot repeat encountered `ReferenceError: parentWelcomeUpdates is not defined`
in the concurrently edited Parent Home. Evidence:
`output/playwright/screen-clarity-20260913/console-errors.log`.
Please include that route in CE1 integration checks; this session has not edited it.

### Remaining gates and integration disposition

Source candidate ready for Session A integration after the scoped commit; paths and browser/check
allocations released. Final combined CE1 typecheck/browser verification remains required.
Physical Android, TalkBack, OS font scaling, native Back/keyboard, reduced motion, participant
comprehension and named Arabic/human review: NOT RUN by this slice. No advanced flag activation,
provider setup, production delivery or native acceptance is claimed.

## Assistance

AI-assisted source inspection and presentation implementation. No student authorship,
human comprehension, Arabic editorial approval or physical-device acceptance is claimed.
