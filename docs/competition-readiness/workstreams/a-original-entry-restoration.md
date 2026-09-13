# Exact original onboarding and main entry restoration

Latest user instruction: “I want you to restore the onboarding screens and the main login screen
exactly as they were”. This supersedes the reference-led redesign. Contract42b1a07 precedes source
integration33a37c1;46e9b58 corrects affected regression boundaries. The separate Parent dashboard
slice9afd720 is preserved. No poster artifact, public submission, remote branch or release changed.

## Restored presentation and preserved behavior

The demo now renders the existing FirstRunOnboarding itself: the original six topics, titles/body,
3:2 artwork, Ghaf lockup, language/Skip controls, three topic buttons, perimeter progress animation,
six dots and original Next/Back layout. None of its visual JSX/styles or resource text was redesigned.
Its only adapter is an optional narrationEnabled gate, default true for unchanged ordinary entry.

OriginalWelcomeScreen extracts the ordinary app/index.tsx presentation verbatim: original logo,
wordmark, habitat, heading/body, Parent/Child buttons, origin label and stylesheet. Exactly equal
stylesheet evidence is in original-source-equality.json against aa0c3b3. Callback props preserve the
ordinary router behavior; invisible idle busy/error slots protect the demo without altering its
normal appearance. The main screen again has two role choices, as the latest user requested.

Parent opens the existing synthetic Parent controller. Child opens the original Child chooser
layout with Salem/Alya and the same safe controller. Chooser copy avoids promising PIN/pairing steps
that demo does not require. It handles missing data, busy/error and Back without granting access.
No store/registry/session authority, task, Seed, Garden, League, reward or recovery behavior changes.

The user was asked whether to restore old Arabic recordings too because their quality had been
rejected. No answer arrived during implementation; demo narration stays off. The Wiam assets remain
unchanged and are not played over the restored, different wording. Actual browser media-call
observations were empty for both six-page language runs. No new voice/provider/asset/right is claimed.

## Evidence and checks

- output/native-integration/015/exact-original-restoration/: six actual Arabic and six English
  onboarding captures; both original main-entry and Child chooser screens;320px captures; receipt.
- Actual browser navigation completed six steps in both languages, both main-entry actions, Salem,
  Alya and Parent access. No page errors/horizontal document overflow recorded. This is web evidence.
- original-source-equality.json: original Welcome stylesheet equality PASSED. The onboarding uses
  the original component directly; its diff only gates narration.
- Existing route/onboarding/media tests plus10new original-entry/Child-chooser tests cover source
  and callback behavior. New SSR tests explicitly do not claim mounted/native Back/effect evidence.
- First integrated typecheck/lint/format passed. Full suite exposed four failing files: two source
  assertions still reading the old location, a missing mock for the new presentation boundary, and
  raw typography left in the discarded design. All corrected without weakening the typography
  rule;29affected tests passed. Initial logs remain under checks/, final logs under checks-final/.
- Independent reviewer inspected exact source, screenshots and controller paths: no blocker found.
  Native RTL/Back/font scaling/audio, student code teach-back and human exact-diff acceptance remain
  NOT RUN/PENDING. This restoration does not create an APK or establish native acceptance.

## Assistance and review

A's actual selected prompt is quoted above; the prior six-page choice and rejected redesign are
preserved in a-six-page-restoration.md. A performed the reuse contract, route adapter, original
narration gate, source equality, browser and regression integration. A did not invent student work.

Helper original_welcome_extraction received three sequential one-file assignments: copy original
Welcome JSX/styles and change only three callback references; adapt original Child chooser into
props-only demo selection with safe labels/Back/busy/error; write bounded SSR/callback tests for
fresh/completed/handoff entry, exact Parent/Child identity binding and malformed/busy rejection.
It produced only OriginalWelcomeScreen.tsx, OriginalDemoChildChooser.tsx and
original-demo-entry.test.tsx respectively, releasing each before the next task. A added safe optional
notice/busy props to the Welcome and integrated all released files. No helper staged or committed.

The independent six_page_independent_review helper then received the exact latest user prompt,
source33a37c1, equality receipt and real captures. It confirmed source/presentation restoration and
found no authority regression. It changed nothing. Both helpers were explicitly requested with
gpt-6-astra/ultra; Fast is unexposed. Primary actual selection cannot be independently inspected.
No parallel native build, new package, copied external template material or new provider was used.

Rejected suggestions: further reinterpretation of the original layout; reusing mismatched Wiam
scripts; restoring previously rejected narration without a user choice; treating copied presentation
as production authentication; calling source/browser tests physical Android validation.

## Final source/check disposition

Exact runtime46e9b58a7aa5ed87999ba3e731371ca3ddcb1447: typecheck, lint and format PASS; full
suite153files/2,025tests PASS at2026-09-12T17:37:13Z. Final receipt is checks-final/receipt.json.
All helper/browser/check jobs are released. A retains the requested canonical preview427191/8081
with normal file watching. Earlier Metro366844 exhausted its1024MiB heap; its log is preserved and
the one-worker replacement uses1536MiB after measured available memory. No project dependency or
host-tool change was needed. Original narration choice remains unanswered, so demo voice stays off.
