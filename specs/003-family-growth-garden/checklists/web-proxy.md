# Feature 003 Web-Proxy Evidence

**Recorded**: 2026-08-27 reset-fix replay; extended by the 2026-08-28 professional-audit replay
**Purpose**: secondary responsive/flow inspection only
**Authoritative native target**: Android; no web observation below passes a native criterion

The latest checkpoint is the 2026-08-28 section at the end of this file, using bundle
`entry-09e5b5d373078942395b4f713ab42137.js`. The environment table below preserves the earlier
reset-fix replay rather than rewriting historical evidence.

## Environment

| Item                     | Observed value                                                                 |
| ------------------------ | ------------------------------------------------------------------------------ |
| Reset-fix export command | `npx expo export --platform web --output-dir dist`                             |
| Reset-fix export result  | Exit 0; 12 static routes = ten product routes plus generated sitemap/not-found |
| Reset-fix bundle         | `entry-b6a1a8fc6cff35694e752042443290f8.js`                                    |
| Local origin             | `http://127.0.0.1:4180`                                                        |
| Browser                  | Firefox through Playwright CLI                                                 |
| Viewport                 | 390×844 CSS px                                                                 |
| Data/provider            | Local synthetic fixtures and deterministic prepared providers                  |
| Screenshot directory     | `output/playwright/feature003-audit/`                                          |

The 2026-08-27 mounted replay used the exported bundle above. Browser requests remained static-only.
That is evidence for that local browser session, not a physical airplane-mode or
network-conditioner result.

## Observed route journeys

The Arabic main path and the complete English LTR path each traversed all ten authored product
routes:

| Route/state           | Final Arabic observation                                                                                                                                                               | Final English observation                                                                        | Result                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------- |
| `/`                   | Arabic RTL entry, Ghaf wordmark, landscape, synthetic/prepared disclosure, reload limitation, and enter action                                                                         | English LTR entry rendered with equivalent disclosure                                            | Arabic/English **PASSED**    |
| `/role`               | Parent and Salem/Alya controls; shared-device/not-authentication and synthetic privacy copy                                                                                            | Equivalent role and identity-boundary controls under `lang=en` and computed LTR                  | Arabic/English **PASSED**    |
| `/parent`             | One combined canopy, distinct sibling next actions/supports, bounded summary, correction control, and create/garden/circle actions                                                     | Equivalent Parent surface retained LTR                                                           | Arabic/English **PASSED**    |
| `/parent/task/new`    | Salem gating, eight categories, distinct P0 template, prepared Guide/fallibility disclosure, original/proposed comparison, Accept/Keep                                                 | Equivalent task-authoring route retained LTR                                                     | Arabic/English **PASSED**    |
| `/parent/task/review` | Complete Arabic-first/English-second action, definition, safety, media/privacy, recognition, 12 Seeds, phase, recurrence, Mangrove, visibility, and circle eligibility before approval | Full route traversed with English document direction                                             | Arabic/English **PASSED**    |
| `/child`              | Salem 48/60 own-goal, display-only future choices, fixed-award assignment, prospective smaller request, separate choose/open-start                                                     | Equivalent Child choice route retained LTR                                                       | Arabic/English **PASSED**    |
| `/child/task`         | Approved definition, four steps, bounded Coach, adult exit, prepared disclosures/result, prepared image, unavailable-audio transcript, optional reflection, acknowledgement, submit    | Equivalent task/Coach route retained LTR                                                         | Arabic/English **PASSED**    |
| `/parent/check-in`    | Completion facts/media, editable action praise, praise-first continuation, duplicate-recognition state                                                                                 | Kind-retry state showed no-loss copy and explicit open/start resume                              | Main + sampled branches PASS |
| `/garden`             | 60/60 Sapling, 20/25 canopy, five tracks, symbolic/nonfinancial boundary, action praise, and cause text                                                                                | Equivalent 60/60, 20 leaves, five tracks, praise/cause, and boundary copy                        | Arabic/English **PASSED**    |
| `/circle`             | Cooperative 12/12 eligible actions, synthetic/local disclosure, no Child profiles, rank, messages, Seeds, task/media details                                                           | 12/12 and explicit copy: other households never see Child identity, task, media, or Seed details | Arabic/English **PASSED**    |

Expo Router's generated sitemap and not-found support pages were exported but are not product
routes.

## Interaction, branch, and reset observations

- Required task controls remained disabled until Child/category/template prerequisites were met.
- The Guide was visibly prepared, retained the Parent original until acceptance, and never claimed
  a live provider.
- Child choose and open/start were separate controls; submission said no Seeds/growth had been
  added.
- Prepared media kept its origin, description/transcript, optionality, and Parent visibility.
- Parent praise rendered before a distinct recognition continuation.
- Arabic and English garden/circle states reached 60/60 Sapling, 20/25 leaves, and 12/12 eligible
  Green actions.
- Duplicate recognized check-in mounted with “already confirmed” and no additional Seeds, leaves,
  or actions.
- The distinct safe-equivalent branch mounted with an indoor-only definition, adult ownership of
  carrying/transfer/disposal, fixed 12-Seed award, unavailable adjusted-task Coach, and trusted-adult
  exit.
- Kind retry mounted in English with no-loss copy and an explicit open/start resume action.
- From recognized English `/garden`, confirmed reset produced URL `/`, `html lang=ar`, `html
dir=rtl`, computed RTL, and Arabic selected. Six consecutive real Back actions all remained at `/`
  with the entry visible and no private route, covering the deeper pre-reset history stack that had
  exposed a stale route during independent review.
- Synthetic missing-image/circle injection was not mounted in this final browser session; focused
  deterministic tests cover those fallbacks.

## Responsive and visual observations

The fresh Arabic entry/garden/circle and English garden screenshots preserve the approved warm
field-paper, botanical-ink, Mangrove-water, and scarce-gold direction at the 390×844 phone proxy.
Long Arabic and English headings wrap inside the viewport; the sampled frames show no horizontal
overflow, overlap, clipped primary control, stock desert image, generic AI avatar, leaderboard,
neon reward treatment, or excessive elevated-card stack.

Final bundle artifacts:

- `final3-entry-ar.png`
- `final3-garden-ar.png`
- `final3-circle-ar.png`
- `final3-garden-en.png`
- `final3-duplicate-ar.png`
- `final3-reset-ar.png`
- `final3-adjusted-child-ar.png`
- `final3-retry-en.png`

These screenshots are browser output. They do not validate Android safe areas, IME, native font
scaling, TalkBack order, physical touch targets, native media behavior, predictive Back, or reduced
motion.

## Console and requests

The final bundle produced **0 console errors** and **1 warning**:

```text
JavaScript Warning: "unreachable code after return statement"
generated web bundle entry-b6a1a8fc6cff35694e752042443290f8.js:1219
```

No application exception or broken transition accompanied it. The warning is recorded as a
nonblocking generated-bundle/framework warning, not silently discarded. Browser requests remained
static-only; no remote provider request was observed.

## Status boundary

| Gate                                                     | Status                                                                |
| -------------------------------------------------------- | --------------------------------------------------------------------- |
| Arabic final-bundle ten-route web journey                | **PASSED**                                                            |
| English final-bundle ten-route web journey               | **PASSED**                                                            |
| Duplicate / safe-equivalent / kind-retry mounted samples | **PASSED**                                                            |
| Reset locale/direction and six consecutive Back actions  | **PASSED on web proxy**                                               |
| Browser console errors                                   | **PASSED** (0 errors)                                                 |
| Browser warning-free                                     | **FAILED** (1 generated-bundle warning, nonblocking in observed flow) |
| Native Android journey/accessibility/media/Back/keyboard | **BLOCKED / NOT RUN**; web cannot satisfy it                          |

## 2026-08-28 professional-audit replay

The final post-audit bundle `entry-09e5b5d373078942395b4f713ab42137.js` was served locally and
replayed in Firefox at 390×844. Arabic completed the full Parent → Guide → Child → Parent → garden
→ circle journey. English first exercised the unsafe default shorthand, observed the new specific
Guide-or-edit recovery message, and then completed the same recognized path.

Measured final-route observations:

- `/child/task`: `lang=en`, `dir=ltr`, one visible H1, zero horizontal overflow, zero measured
  interactive targets below 44 CSS px, and the canonical definition clamped to four visual lines
  with an accessible “Show the full definition of done” control;
- `/garden`: Mangrove `60/60 · Sapling`, zero horizontal overflow, one changed hero and four compact
  required tracks;
- `/circle`: only the coarse 12/12 eligible Green-action state and family-level privacy copy;
- reset: `/`, `lang=ar`, `dir=rtl`, zero overflow, and six browser Back actions remained `/`; and
- console: 0 errors and the same single generated unreachable-code warning, now at bundle line 673.

Final screenshots are under `output/playwright/feature003-audit/final/`. These observations update
the web proxy only and do not change any native or named-human status.

## 2026-08-28 repository-cleanup build/start checkpoint

After the repository architecture and developer-experience cleanup, `npm run verify` again passed
17 files / 305 tests, Expo dependency alignment, and a 12-route static export. The resulting bundle
was `entry-735bb0ad95f4d16e3497160215ba85e4.js`; static and development-server HTML began
`lang="ar" dir="rtl"` and included the Expo scroll reset. An offline Expo web start served HTTP
successfully without the earlier deprecated accessibility/pointer-event DOM-prop warnings.

The optional local React Native DevTools process could not start because this host lacks
`libnspr4.so`; Metro and the application endpoint remained available. This checkpoint validated
install, compilation, static output, and launch hygiene only. It did not replay the complete
ten-route browser journey and does not supersede the professional-audit interaction evidence or
change any Android/human status.

## 2026-09-02 Child voice and bilingual typography replay

The presentation checkpoint exported bundle
`entry-a36ed701f6f11cbcbc2a457b47e66670.js` with 12 static routes. A headed Playwright browser served
the export from `http://127.0.0.1:4173` and replayed the new surfaces at 390×844 CSS px.

| Surface/state           | Direct observation                                                                                                                                                                                                                                 | Result               |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Arabic Parent review    | Voice and AI grants began off; the panel explained prepared local simulation, no background listening/capture, no microphone/recording, and no real send. A distinct Parent action changed the stored state to enabled before assignment approval. | **PASSED web proxy** |
| Age-adapted Child Coach | Salem's result displayed exactly three complete reviewed steps, three reviewed quick choices, `9_11`, standard pace, task binding, no open chat, prepared/may-be-wrong language, and a persistent adult exit.                                      | **PASSED web proxy** |
| Active rehearsal        | Start changed the visible status to active with a stop action and explicit “no audio is being recorded” copy. Switching to English preserved the active state and changed document/UI direction.                                                   | **PASSED web proxy** |
| Transcript review       | Stop loaded the canonical fixture transcript. Captions, 0.75×, 1×, replay, delete-before-send, rehearsal-only send, and reset controls were visible without clamping. Replay changed the visible count from 0 to 1.                                | **PASSED web proxy** |
| Locale preservation     | English rendered the equivalent transcript and controls; switching back to Arabic retained transcript review and replay count 1 with `html lang=ar`, `dir=rtl`.                                                                                    | **PASSED web proxy** |
| Send/reset/delete       | Send entered a visibly simulated-only sent state; reset restored ready with no transcript/count. A second review followed by delete also restored ready.                                                                                           | **PASSED web proxy** |
| Responsive width        | `innerWidth`, `body.scrollWidth`, and `documentElement.scrollWidth` were all 390 CSS px in the sampled Arabic Child state.                                                                                                                         | **PASSED sampled**   |

Artifacts:

- `output/playwright/feature003-voice/parent-permission-ar.png`
- `output/playwright/feature003-voice/child-review-en-top.png`
- `output/playwright/feature003-voice/child-review-en-bottom.png`

The browser console contained one 404 for `/favicon.ico` from the local static server and no
observed application exception. This replay does not pass Android microphone-permission absence,
native playback, 200% font scale, TalkBack order, physical touch target, safe-area, or bidi gates;
those remain **BLOCKED / NOT RUN**.

## 2026-09-02 Family experience frontend replay

The final production export generated bundle
`entry-3746a82ee19bdfeb4140e22a9b7168c9.js` and retained 12 static pages. A headed Playwright browser
served the export locally and exercised the new in-route family surfaces at 412×915 and 320×700 CSS
pixels.

| Surface/state | Direct observation | Result |
| ------------- | ------------------ | ------ |
| Arabic entry | `/` and `/role` began with `html lang=ar`, `dir=rtl`; the access panel identified fixed synthetic sessions and allowed Parent entry through the governed store action | **PASSED web proxy** |
| Parent access control | The Parent revoked Salem, the main Salem entry became disabled with truthful blocked copy, and restore re-enabled entry | **PASSED web proxy** |
| Private Family Reward | The Parent created the prepared non-monetary promise, viewed its personal milestone state, and retained the Parent-only delivery action | **PASSED web proxy** |
| Synthetic Family League | The Parent started the fixed week; direct participant labels, capped cooperative progress, and synthetic/no-public-ranking disclosure rendered | **PASSED web proxy** |
| Salem projection | Salem saw the matching private Reward and minimal League projection and could send one allowlisted prepared encouragement | **PASSED web proxy** |
| Privacy projection | Alya had no Salem Reward projection; routes did not display credentials, raw eligibility events, task records, Seeds, evidence, or private notes in League data | **PASSED source + web sample** |
| Locale and width | Switching to English produced `lang=en`, `dir=ltr`; Arabic and English each kept `scrollWidth === innerWidth === 320` at the narrow sample | **PASSED sampled** |
| Protected history | A Child-to-role handoff cleared the protected stack; browser Back left the application instead of exposing the stale Child or Parent screen | **PASSED web proxy** |

Artifacts are under `output/playwright/family-experience/`. The browser console contained one local
`/favicon.ico` 404 and no observed application exception. This replay does not pass Android launch,
native Back, safe areas, keyboard/IME, TalkBack, 200% font scale, reduced motion, offline runtime,
physical touch, or performance criteria; those remain **BLOCKED / NOT RUN**.
