# Tamagui Botanical Redesign Evidence — 2026-09-11

Implementation started September 11; final review completed September 12 on
`redesign/tamagui-botanical`. Local `main` is preserved at `16583a3`; nothing was pushed.

## Scope

User-authorized presentation update to the shared application shell, controls, access surfaces,
Parent Home/tasks/Family, Child Today/task, Garden, League, settings and supporting states.
Tamagui and its Reanimated adapter are pinned to 2.7.7. Existing dependency versions, approved
Alexandria/Readex assets, translations, domain commands, routing and default-off flags are retained.

Shared text and layout primitives use Tamagui; inputs retain native keyboard/focus behavior.
Buttons retain React Native press semantics through `BotanicalPressable`, with a 120ms UI-thread
scale response and reduced-motion handling. Existing event-owned growth/reveal motion remains the
authority for celebrations. The theme's state/sheet timing tokens are available for future use;
this migration does not claim that every existing transition was replaced.

## Automated evidence

| Check                        | Result                        | Evidence                                                                                                        |
| ---------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Strict TypeScript            | PASSED                        | `npm.cmd run typecheck`                                                                                         |
| Expo lint                    | PASSED                        | `npm.cmd run lint`, zero warnings                                                                               |
| Maintained-source formatting | PASSED                        | `npm.cmd run format:check`                                                                                      |
| Regression suite             | PASSED                        | 136 files / 1,654 tests; `npm.cmd test -- --maxWorkers=2`                                                       |
| Web production export        | PASSED                        | `npm.cmd run build:web`; 39 routes                                                                              |
| Android Hermes export        | PASSED                        | `npx.cmd expo export --platform android --output-dir output/botanical-android-export`; one bundle and 96 assets |
| Presentation review          | PASSED within inspected scope | Independent source review and compact web captures; a Tamagui raw-style omission was corrected                  |

Source-based presentation assertions were reconciled with the new botanical composition. Existing
domain, privacy, access, locale and event ownership assertions remain. Earlier migration failures
were resolved: raw React Native style arrays cannot be passed to Tamagui 2's DOM `style`, web
accessibility props need explicit ARIA mapping, and a Tamagui `asChild` wrapper removed native
button styling. The final implementation uses flattened style props and native press controls.

## Browser proxy and limitations

Review uses local headless Chrome, synthetic household fixtures and the existing deterministic
Parent/Child access path. Fixture timestamps match the app's fixed demonstration clock. An initial
September 11 fixture failed remembered-Child validation against the fixed September 6 clock; only
the ignored review fixture was corrected, with no authentication or store changes.

Captured evidence lives under ignored `output/botanical-review/`; it is local review material,
not a replacement for any historical Feature 002/003 capture. Parent sign-in, language switching,
prepared Guide suggestion, task review and Parent assignment were exercised through UI controls.

The final production web build also exercised Child PIN access, the returning-Child panel,
Today/Garden/League navigation, language switching, temporary Parent entry and Parent sign-in.
The captures were opened and checked for loaded assets, unobscured content and label direction:

- `parent-ar-390.png` and `parent-en-390.png`: final Parent Home, 390×844.
- `parent-en-320.png` and `settings-ar-320.png`: compact development-build proxy review, 320×844.
- `child-ar-390.png` and `child-en-390.png`: Child Today with no assignment, 390×844.
- `garden-ar-390.png`: selected Mangrove landscape, 390×844.
- `league-ar-320.png` and `league-en-320.png`: private League, 320×844; document width equals viewport.

Independent review requested one material fix: isolate the Child progress fraction left-to-right
while preserving Arabic right alignment. The final recapture displays `48 / 60` consistently with
12 remaining; the reviewer scored that fix **resolved**, disposition **ship** at browser-proxy
scope only. Three focused presentation files / 31 tests also passed after the correction.
General project agents substituted for unavailable named Impeccable review/documentation agents;
the design rulebook was reconciled with actual implementation. No new raster asset was produced.

## Outstanding acceptance gates

Physical Android is **NOT RUN**: `adb devices` reported no connected device. Hermes export proves
bundling only. Android RTL, TalkBack/focus order, font scaling, IME/keyboard, Back, lifecycle,
reduced-motion response and the complete judge rehearsal still require device observation.
Named Arabic/cultural/human review is **NOT RUN**. No existing release activation gate is passed
by this presentation work. General utility screens inherit the shared system; the first-run
illustrated narrative and flag-gated Growth Journey retain their existing composition and rules.

No production authentication, live Child media processing, live AI, deployment, or measured impact
claim is introduced. All optional release flags remain at their existing defaults.
