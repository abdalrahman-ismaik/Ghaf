# Requested demo entry, onboarding and narration changes

Product brief prepared by A on 2026-09-12 after the user's explicit request. This is selected
product intent and implementation planning input, **not a committed Spec Kit implementation
contract or a human-reviewed diff**. A must reconcile/amend existing003/005 authority and commit
the smallest specification/plan/tasks/typed contract before granting implementation. Do not ask
the user again whether they want the already requested three demo profiles.

## Outcome and scope

Opening the competition demo should offer exactly three clearly labelled synthetic profiles:
one Parent, Salem and Alya. Choosing one opens that role's home without email, OTP, PIN, picture
sequence, pairing or family setup. All profile/role authorization inside the app still applies.
This is a demo doorway, not production sign-in and not a role toggle inside an authenticated view.

The optional introduction should explain the family value quickly through polished, responsive,
Arabic-first storytelling. The user can reach the profile selector immediately from the first
screen, skip the story and replay it later from signed-out entry. Narration should be optional,
natural and linguistically correct; it must never delay entry or navigation.

Preserve normal local setup/verification as a separate prototype exploration path. No backend,
real accounts, live AI, microphone, payment, new task category or recovery implementation is added.
Selecting Alya must not silently duplicate Salem's executable recycling task. Her independent
seeded experience is available, with the existing one-task limit labelled honestly.

## Access contract to resolve before implementation

1. Use the existing principals `parent_al_noor`, `child_salem`, `child_alya` in
   `household_al_noor`. Reconcile the seed's visible family name, currently inconsistent with the
   onboarding “Palm Family” default. All names/data are synthetic; no invented real reviewer.
2. Use an explicit demo configuration and isolated memory repositories through the registry's
   existing factories. Never replace or repurpose a stored custom family to gain fast entry.
   `origin: local_demo` cannot distinguish a canonical seed: ordinary local records also use it.
3. Specify a typed entry command with a three-value principal union, result/error type and
   signed-out/demo-only preconditions. Validate the canonical family/receipt and prepared pair
   markers, then call only the selected controller's no-credential resume method. Do not fake a
   verified OTP, import a test helper, mutate `role` directly or bypass controller capabilities.
4. Existing seams: `src/models/access.ts`, `src/features/local-family/schema.ts`,
   `src/features/access/parentOnboarding/controller.ts`, `src/features/access/childAccess.ts`,
   `src/services/index.ts`, `src/state/usePrototypeStore.ts`, `app/index.tsx`. Routes remain thin.
   A owns registry/store/routes/localization until a precise transfer. A pure demo fixture/controller
   module can be given to B; a props-only entry/onboarding component can be given to C.
5. Initialize the demo family once per in-memory demo run. Signing out clears authority and
   transient assistant/media/access state but preserves the current run's task/progression.
   Selecting another profile must not reseed, auto-approve, grant media permission or award Seeds.
   Clear the old navigation stack before presenting the signed-out picker; Back cannot reopen it.
6. Never persist a selected principal/session/token. Startup enters the signed-out selector;
   process death begins a fresh demo run with an honest notice. Recovery014 remains deferred.
   Explicit Parent demo reset returns to signed-out Arabic entry and exact default Seeds/Garden/
   League/Reward fixtures. It affects only isolated demo data, not the normal local family.
7. Reject unknown principals, concurrent/repeated entry, active-session entry and stale async
   completion after reset. Failure leaves no partial authority or changed progress. Reuse the
   established reset/navigation approach rather than reintroducing the prior queued-pop race.
8. Selecting demo mode from another mode requires an explicit signed-out transition with a clear
   local-data boundary. No public URL/query parameter may grant authority in the ordinary mode.
   Define mode selection once in the accepted contract; don't let individual screens infer it.

## Onboarding design brief for C

**Mode:** Operate for profile entry; brief Experience moments for the optional story. Audience:
judges/family members who have seconds to understand and enter the demo. First value is selecting
a role and seeing a concrete family action; no staged “AI generation” or fake progress is needed.

Retain the approved botanical identity, Tamagui, Alexandria/Readex, logical RTL and local approved
artwork. Use the selected Family Field Journal direction as the foundation, not another global
theme vote. Make a deliberate full-screen composition with clear type hierarchy, warm natural
surfaces, restrained motion and generous touch targets. Avoid repeating decorative icon cards,
vague inspirational claims or a long list of features. Images must serve the actual story.

Proposed smallest replacement story has three optional moments: **choose a safe action together;
get bounded help and support from a Parent; celebrate the confirmed action through symbolic
growth**. This changes the existing six-moment contract and autoplay behavior, so A must amend
the applicable003 requirements before C implements it. No durable memory or personalized live-AI
claim. Intro must not imply that every category is executable or all app progress survives restart.

Deliver one annotated Arabic/English storyboard with exact copy and corresponding state/CTA,
then implement the accepted component boundary. One prominent demo-entry CTA remains available;
language and skip controls stay obvious and reachable. Profile selector uses three accessible,
distinct controls with visible role/name and synthetic-demo disclosure. Parent and Child homes
stay separate after selection. No portraits are used as identity proof.

Test narrow/common Android widths, long Arabic labels, mixed-script names, safe areas, large text,
TalkBack order, reduced motion, image/audio failure, repeated entry/exit and locale changes. A
desktop screenshot cannot pass those native requirements. Do not start a second Metro/browser
or overlap C preview with B native compilation.

## Arabic narration repair

Current audio is bundled MP3, not device TTS: six Arabic clips authored with
`ar-AE-FatimaNeural` at +7% speed/+2 Hz pitch. Source audit did not listen and does not attribute
the user's complaint solely to those parameters. The intro's `كيف تحوّل أفعال...` wording also
needs editorial attention. Replacing a voice without fixing the text will not settle language quality.

Use concise Modern Standard Arabic, consistent audience/address and natural pauses. Keep required
Parent approval, AI fallibility, full help credit and symbolic-growth boundaries. Prepare a bilingual
script sheet first; mark named Arabic/cultural review pending. Synchronize visible transcript and
spoken content; every accepted line needs a matching clip. Reuse an approved generation method or
provide a script/recording packet if generation capability is unavailable. No real Child audio,
cloned personal voice, new paid service/account/package or sensitive upload is selected.

The revised presentation should default to silence with a clear opt-in play/stop control and replay,
plus complete visible text. Narration stops on skip, account entry, Back, locale/step change and
background/exit; screen-reader speech wins. Missing/unreviewed audio cannot block the visual flow.
Do not ship mismatched old clips under new copy. Keep unreviewed replacement clips out of the
accepted demo candidate; provide the complete silent experience until real review is recorded.

Review the exact clips on an actual phone: comprehensibility, grammar, pronunciation, prosody,
pace, volume, pauses and transcript parity. Verify Ghaf and culturally specific words explicitly.
Asset metadata/checksums and mocked-player lifecycle tests do not establish voice quality. Record
method/voice/settings/license/provenance/checksums, actual reviewer/date and any rejected takes.

## Ordered tasks and acceptance

| Task  | Owner after A grant | Required output / gate                                                                                                                                           |
| ----- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A-N05 | A                   | Small Spec Kit amendment + exact demo-mode/entry/reset/storage typed contract, reconcile003/005, commit before implementation; D failure/privacy review          |
| B-N05 | B                   | Pure seed/access adapter in exact granted new module/tests; real controller sessions, failure cleanup, isolated repositories; no direct aggregate-store edits    |
| C-N04 | C                   | Accepted entry/onboarding components and bilingual script/candidate at exact granted paths; preserve existing app stack/design system; no invented native review |
| A-N06 | A                   | Registry/store/routes/resources integration, coherent checks, publish candidate to B for APK and D for independent retest                                        |
| D-N04 | D                   | Entry/role/sibling/Back/reset/storage isolation matrix and actual onboarding/audio review packet; human listening and devices stay pending until performed       |

Initial B-N01/C-N01/D-N01 grants do not own these future source paths. A may complete A-N05 while
baseline APK work proceeds; this user's scope does not authorize recovery014 or other proposed
features. No worker must wait for another routine approval after receiving the committed contract
and exact board grant.

Acceptance target: from settled signed-out entry, select each of the three profiles without
authentication/setup; role home appears without a blocking story. Measure cold-start separately
from tap-to-home on each actual device rather than inventing speed numbers. Parent→sign-out→Salem→
sign-out→Alya must retain current-run progress and deny cross-profile actions. Reset starts a fresh
exact demo; normal local family storage remains byte-for-byte unchanged. The silent/optional story
must remain usable if every narration asset fails. No new APK/phone/content pass exists yet.
