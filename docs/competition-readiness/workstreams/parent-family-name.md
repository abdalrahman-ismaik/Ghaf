# User-selected family name

User prompt: “dont use weird names for the families, use a name like عائلة أبو راشد”.

Runtime0b400da on redesign/ui-experiments, baseline98aa066, shared /home/smyk/projects/Ghaf.
Prepared/default Arabic family now uses **عائلة أبو راشد**; English uses **Abu Rashid Family**.

- Updated src/i18n/resources.ts, access/demoEntry.ts, access/parentOnboarding/policy.ts and
  tasks/demoContent.ts: prepared account, setup default/example, household and garden labels.
- Added features/access/localFamilyDisplayName.ts for the two saved-name consumers:
  app/access/parent/sign-in.tsx and app/parent/index.tsx. It aliases only the exact old/current
  canonical name when the complete fixture content matches (locale/update time may differ).
  It never writes storage, changes receipts/identifiers, or treats a custom name/profile as a fixture.
- Added seven compatibility cases; updated existing default-name expectations in three test files.
  Existing access, cancellation, task state, Child profiles and progress remain unchanged.

Evidence: **/home/smyk/projects/Ghaf/output/competition-readiness/parent-family-name-20260913/**.

| Check | Status | Evidence |
| --- | --- | --- |
| Focused access/demo suite | PASSED | tests.log: 208 tests / eight files, maxWorkers1 |
| Full TypeScript | PASSED | typecheck.log |
| Changed-source lint/format | PASSED | lint.log, format.log; later one-string titlecase correction also passed both scoped commands |
| Fresh Arabic real controls | PASSED | 390×844 Firefox155/Linux: Skip → Parent → named account → Parent Home; newly seeded name matches |
| Existing saved demo display | PASSED | Explicitly synthetic legacy storage fixture; AR account and EN320×740 account/Home show selected name, stored old name remains unchanged |
| Native and human exact-diff | NOT RUN | No physical Android or named student/English transliteration acceptance claimed |

Screenshots: chooser-ar-390.png, legacy-chooser-en-320.png, legacy-home-en-320.png.
Lead visually inspected the Arabic account capture; browser assertions verified both locales.
Initial legacy test timed out because reload reopened original onboarding; Skip corrected the
harness. English Home initially used lowercase family from the household fixture. One titlecase
correction aligned the selected name; the affected English account/Home passed on confirmation.
Receipt.json separates actual fresh controls from injected legacy-state coverage and records hashes.

One read-only helper messaging_seams traced consumers, fixture provenance and relevant tests. Its
assignment was to identify minimal presentation compatibility for an already-saved canonical demo
name without reset, persistence changes or altered custom names; no edits, jobs or descendants.
Lead owned implementation, tests, evidence and commits. Rejected broad aliases for saved Palm or
English Al Noor names: existing edited-family tests demonstrate those may be customized. No explicit
fixture-provenance field exists, so complete canonical-content matching is the narrow fallback.

Previously observed lead config: Astra/xhigh/Fast; effective runtime unexposed. Helper originally
requested Astra/Ultra; effective tier unexposed; no settings changes. Arabic name was explicitly
selected by the user; exact implementation and English transliteration have no claimed human review.
Browser/helper/check allocations released, user Metro62701/8082 preserved, unrelated narration and
coordination status edits left unstaged. Ready for local integration; no push/deployment performed.
