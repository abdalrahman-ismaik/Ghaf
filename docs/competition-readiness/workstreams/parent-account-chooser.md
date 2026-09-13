# Parent account chooser — September 13 handoff

Parent “مرحبًا بعودتك” now shows a selectable local family account and Create new family.
A fresh device offers the prepared Al Noor demo account. Selecting it opens Parent Home without
email, phone, password, verification code or a second welcome dialog. When a local family already
exists, the chooser displays that actual family and preserves its data. The one-family repository
does not fabricate additional saved accounts or replace an existing family to show another demo.

Contract 4f48a75 preceded implementation; runtime 65efe80 on redesign/ui-experiments.
No branch/worktree change, package/flag change, push, merge or deployment. All other sessions'
status and narration edits remain unstaged by this work. Existing user preview on 8082 is retained.

## Implementation

- app/access/parent/sign-in.tsx consumes one store command and the new botanical
  ParentAccountChooser.tsx. Existing portrait, Back and Create-family routes remain in place.
- src/features/access/localParentEntry.ts reuses the canonical prepared family factory, validated
  receipt, synthetic Parent controller and access/Parent/Child rollback wrappers. It seeds
  only an empty, successfully read directory; existing family entry performs no write.
- src/state/usePrototypeStore.ts adds the bounded local entry action. Active Child/demo-mode,
  incomplete setup, unavailable/stale data and reentrant attempts fail closed. Session time
  matches the existing fixed authorization clock. Current locale, temporary Child return marker,
  pairing, task state and progression are retained. No remembered Parent marker is created.
- src/i18n/resources.ts provides equivalent Arabic/English labels and explicit local/demo truth.
  No synthetic selector, local receipt or marker authorizes Feature016 messaging. Supabase setup
  remains independently blocked by the absent project.
- Legacy profile repair keeps its explicit verification route with the known identifier;
  the normal saved/prepared account requires no code. New-family setup is unchanged.

## Validation and evidence

Evidence: /home/smyk/projects/Ghaf/output/competition-readiness/parent-account-chooser-20260913/.

| Check                                   | Status  | Evidence and limit                                                                                                                                               |
| --------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full TypeScript                         | PASSED  | typecheck.log, 19.65 seconds; subsequent delta only removes redundant welcome state                                                                              |
| Full formatting                         | PASSED  | format.log; final changed-file formatting also passed                                                                                                            |
| Initial full lint                       | FAILED  | One import-order warning in the new rendered test; corrected, final scoped lint PASSED                                                                           |
| Initial full regression                 | FAILED  | 2093 passed / one obsolete portrait-test expectation for the removed credential button; tests.log                                                                |
| Corrected affected regressions          | PASSED  | 29 tests / 4 files; corrected-affected-tests.log; only superseded expectations changed                                                                           |
| Final access/handoff regressions        | PASSED  | 49 tests / 3 files after removing second welcome; browser-correction-tests.log                                                                                   |
| Final changed-source lint/format        | PASSED  | final-scoped-lint.log, final-scoped-format.log                                                                                                                   |
| Actual ordinary browser journey         | PASSED  | Firefox/Linux, AR 390×844 and EN 320×740. Actual Skip→Welcome Parent→account→Parent Home; zero credential fields, no auth requests observed on account selection |
| Back, Create family, sign-out, keyboard | PASSED  | Actual controls, setup/replacement route preserved, Enter activates account; browser-final.json                                                                  |
| Larger text                             | PASSED  | CSS 1.6× simulation at 320×740: account 204.4px, Create 110.8px; reachable by scrolling, no horizontal overflow; not native font scaling                         |
| Physical Android and human review       | NOT RUN | Native Back/keyboard/TalkBack/font scaling and named Arabic/student exact-diff review not claimed                                                                |

Settled screenshots: final-chooser-ar-390.png and settled-chooser-en-320.png.
The first regular-size captures and final-chooser-en-320.png caught the existing section-transition
fade and are **not** settled visual proof. English was recaptured after explicit overlay
retirement, without another source change. chooser-en-320-large-text.png is the labeled CSS
simulation. The browser found an unnecessary welcome dialog after selection; removing that local
entry state was confirmed in both languages with zero visible extra welcome dialogs.

A retained hidden Expo route caused one strict-selector error; visible-route scoping corrected
the harness. Initial Platform.select test-mock omission and superseded no-demo-copy assertions were
also corrected. Historical failures are retained. No further full-suite pass is inferred from
focused retests. Browser and helper/check allocations are closed/released in board revision 89.

## AI assistance and review

User request: “now when I click on parent login, the screen with "مرحبًا بعودتك" should not require
email, just show the prelogined accounts and the option to create a new family, ideally the demo
account that I talked about earlier should be shown to login without email or password or code”.

Lead applied local Spec Kit, Expo design-system and Impeccable refinement guidance,
with ten reviewed requirement-checklist items already checked. One helper, messaging_seams, first
traced read-only authority and then owned only the local entry helper, one store action and nine
behavior tests. Lead owned contract, route, component, translations, rendered tests,
integration and browser evidence. No descendants or parallel heavy jobs. Helper release was
received before lead formatting/checks. Existing settings observation remains Astra/xhigh/Fast for
lead configuration, effective runtime unexposed; helper originally requested Astra/Ultra, effective
tier unexposed. No settings change was made. Human implementation acceptance is pending.

Rejected: changing the demo flag, routing through fake OTP, bypassing real messaging Auth, replacing
stored family data, adding imaginary accounts, changing protected Welcome/onboarding,
and adding another confirmation after selecting the local account.
