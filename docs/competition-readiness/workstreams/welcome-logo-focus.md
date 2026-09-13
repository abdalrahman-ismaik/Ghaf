# Welcome with larger Ghaf logo

User: “I want you to remove the photo from the page that contains: Growing good habits together
and focus more on the logo and make it bigger”.

Runtime829c9db, baseline7b5f4a7, shared /home/smyk/projects/Ghaf on redesign/ui-experiments.
This explicit choice supersedes exact-original-restoration only for the Welcome photo/brand layout.

Changed src/components/access/OriginalWelcomeScreen.tsx: remove the habitat photo and photo-only
styling/imports, enlarge existing selected5A mark from76 to208dp, group with live wordmark, and allow
natural scrollable height instead of the old500dp hero minimum. Original headline, body, locale
switch, Parent/Child callbacks, busy/error state, botanical background and typography remain.
The same component serves ordinary and demo entry. No assets, packages, flags or authority changes.
Updated the one superseded Welcome-photo assertion in tests/platform/access-family-portraits.test.tsx;
separate Parent/Child portrait checks remain. No new test suite was added for this presentation change.

Evidence: **/home/smyk/projects/Ghaf/output/competition-readiness/welcome-logo-focus-20260913/**.

| Check | Status | Evidence |
| --- | --- | --- |
| Existing affected tests | PASSED | tests.log,46tests/4files, maxWorkers1, including current unedited shared demo controls |
| Full TypeScript | PASSED | typecheck.log |
| Changed-file lint/format | PASSED | lint.log,format.log |
| Actual Arabic Welcome | PASSED | Firefox155/Linux390×844;208×208logo, zero photo elements, both60px-high controls fully visible |
| Actual English Welcome | PASSED | 320×740;208×208logo, zero photo elements,58px-high controls; vertical scroll exposes complete Child button/disclosure |
| Language/Child/Back/Parent keyboard | PASSED | Actual controls: Child→/access/child→Back, Parent via Enter→/access/parent/sign-in→Back |
| Horizontal overflow | PASSED | None in either recorded viewport |
| Enlarged text | NOT RUN | CSS attempt used unscoped selector with retained routes; visible-route scaling not established |
| Physical Android / human exact-diff | NOT RUN | No native Back/TalkBack/font scaling or named human acceptance claimed |

Lead visually inspected welcome-ar-390.png and welcome-en-320.png. The third image,
welcome-en-320-scrolled.png, shows ordinary scrolled content; it is explicitly not enlarged-text
proof. No visual defect required a second implementation round. Browser closed, helper/check slots
released, user Metro62701/8082 preserved. OriginalDemoEntryScreen, narration, other tests and B/C/D
status edits were preserved and not staged. Checks.json and receipt.json record source and limits.

Lead applied existing Impeccable distillation and Expo design-system guidance; no context-script
rerun or design-system rewrite. One read-only helper messaging_seams identified shared consumers
and the sole conflicting photo assertion, then released without writes, jobs or descendants.
Helper prompt scope: find tests expecting the old photo/76px/logo/minHeight500 and confirm shared
ordinary/demo usage; lead implements and verifies. Existing settings observation: lead config
Astra/xhigh/Fast, effective runtime unexposed; helper originally requested Astra/Ultra, effective
tier unexposed. No settings were changed. User selected the change; exact-diff/human/native review
remains pending. Boundary ready for local integration, no push/deployment.
