# C native batch — selected onboarding and a bounded product proposal

Session `C-20260912T011718Z-root`; prepared branch `redesign/native-ui-20260912`, initial
HEAD `52c61fcab45f40b233d823a9178780fd07c56efd` (runtime `7fff0f3`). Board r25 grants this
report only for C-N02 and C-N04 preparation. The user selected fast synthetic demo entry,
onboarding redesign and Arabic narration repair. A is preparing Feature015; its committed
contract and exact source grants must precede implementation. The reciprocal story below remains
an unselected hypothesis. No report text changes app behavior, awards, release flags or storage.

## Selected C-N04: reach the family experience immediately

**User action:** choose one synthetic role and enter its existing home. The current six-moment
introduction plus simulated setup/credentials obscure this first value. Reuse Family Field Journal,
the approved botanical imagery, official mark, Alexandria headings and Readex controls. The new
entry is an Operate surface; its optional story supplies three brief Experience moments. This
replaces onboarding composition, not the rest of Ghaf's visual identity or authenticated navigation.

### One proposed composition and storyboard

The signed-out screen leads with the Ghaf lockup and language control, one short family statement,
then three full-width, distinct profile rows: Parent, Salem, Alya. Use existing tree/avatar artwork
as supporting identity, never as identity proof. Keep imagery compact here so all three choices
are discoverable; no new portrait, dashboard metric or ceremonial animation. The optional story
is a clearly separate secondary action below the selector. No login fields precede demo entry.
A's emerging015 contract selects ordinary access through a separately configured run, so the
demo selector has no in-app ordinary-access/mode-switch control.

The optional story uses one existing approved subject image, a short title, expanded transcript,
and simple reading/navigation controls. Give the subject a generous landscape-shaped region at
ordinary text size; let content scroll naturally at enlarged sizes. Do not put safety copy inside
an image. A compact top bar contains language and Skip; a persistent-in-flow entry CTA appears
on every moment. Back and Next remain adjacent to the step indicator. No timed advance, six-dot
legacy navigator, perimeter timer or hidden dependency on image/audio readiness remains proposed.

| Screen                | Actual proposed reading/action order                                                                    | Image and interaction rationale                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Signed-out selector   | Brand/language → title/disclosure → Parent → Salem → Alya → optional story                              | Three named native controls establish the choice immediately; ordinary access stays in a separately configured run. Profile selection requests the authoritative callback once. |
| Moment 1: safe choice | Language/Skip → one safe-action image → title/body → optional narration → 1 of 3/Back/Next → Enter demo | One concrete approved task explains the family action without implying a whole executable catalog.                                                                              |
| Moment 2: help        | Same structure, help/support image and copy; 2 of 3                                                     | Make permitted help and Parent responsibility explicit; no simulated chat or live notification.                                                                                 |
| Moment 3: recognition | Same structure, approved symbolic-growth image; 3 of 3; final action returns to the selector            | Describe confirmation before growth. An onboarding image is an illustration, never a new Seed event.                                                                            |

At the first story moment, Back returns to the selector; later Back returns one moment. Skip,
Enter demo and the final action return to the signed-out selector without choosing a profile.
Android Back follows that same intent when A connects the route/reducer. `onOpenStory` always
starts at moment 1 with silence. `onReplayNarration` replays only the current body. The last
moment has no Next action: its Enter demo control calls `onEnterDemo` to return to the selector. A owns final mode-selection and normal-access boundary semantics.

### Proposed bilingual selector and control copy

Copy below is a review packet, not a second runtime resource authority. A owns canonical resource
integration; named Arabic review is **PENDING**. Existing synthetic spelling is `سالم` / Salem
and `علياء` / Alya. The family display-name reconciliation remains A's contract decision; no
invented Parent personal name is inserted here.

| Role/key         | Arabic proposal                                              | English equivalent                                                    |
| ---------------- | ------------------------------------------------------------ | --------------------------------------------------------------------- |
| Entry title      | خطوة صغيرة، ننجزها معًا                                      | A small step, done together                                           |
| Entry disclosure | عرض تجريبي ببيانات افتراضية. اختر وليّ الأمر أو أحد الطفلين. | A demo with synthetic data. Choose the Parent or one of the Children. |
| Parent           | وليّ الأمر                                                   | Parent                                                                |
| Parent purpose   | راجع المهمة وقدّم الدعم                                      | Review the task and offer support                                     |
| Salem            | سالم                                                         | Salem                                                                 |
| Salem purpose    | جرّب المهمة واطلب المساعدة                                   | Try the task and ask for help                                         |
| Alya             | علياء                                                        | Alya                                                                  |
| Alya purpose     | استكشف ملف علياء التجريبي                                    | Explore Alya’s demo profile                                           |
| Breadth notice   | المهمة القابلة للتجربة متاحة لسالم فقط في هذا العرض.         | The executable task is available only to Salem in this demo.          |
| Restart notice   | تبدأ تجربة جديدة عند إعادة تشغيل التطبيق.                    | Restarting the app begins a fresh demo run.                           |
| Optional story   | تعرّف إلى غاف                                                | Discover Ghaf                                                         |
| Enter/skip       | دخول العرض التجريبي / تخطّي المقدمة                          | Enter demo / Skip introduction                                        |
| Back/Next        | السابق / التالي                                              | Back / Next                                                           |
| Audio            | استمع / إيقاف / استمع مجددًا                                 | Listen / Stop / Listen again                                          |
| Missing audio    | السرد الصوتي غير متاح. يمكنك قراءة النص والمتابعة.           | Narration is unavailable. Read the text and continue.                 |
| Entry busy       | جارٍ فتح الملف التجريبي…                                     | Opening demo profile…                                                 |
| Entry failure    | تعذّر فتح الملف التجريبي. حاول مجددًا.                       | The demo profile could not open. Try again.                           |
| Image fallback   | الصورة غير متاحة؛ النص يشرح هذه الخطوة.                      | The image is unavailable; the text explains this step.                |

No “secure account,” “online,” delivery, payment or measured impact claim is proposed. Detailed
error wording must reflect A's actual result type; a generic message cannot hide corrupted mode
or authority. The three-value principal union belongs to A/B, not these display labels.

### Recording packet: exact proposed body transcripts

Each body below is both the full visible transcript and the proposed spoken clip. Titles are
visible but not additional hidden spoken sentences. This gives one exact parity authority after
A accepts the text. No old clip can be relabelled as matching these scripts. Spoken numbers,
punctuation and pauses are reviewed with the actual recording, not inferred from file metadata.

| Moment          | Arabic title and body                                                                                                                                                                                                                                       | English title and body                                                                                                                                                                                                                                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 — choice      | **نختار خطوة آمنة معًا** — يختار الطفل من المهام التي وافق عليها وليّ الأمر. في هذا العرض، يجرّب سالم فرز مواد نظيفة قابلة لإعادة التدوير، مع إشراف شخص بالغ.                                                                                               | **Choose a safe step together** — The Child chooses from tasks approved by the Parent. In this demo, Salem tries sorting clean recyclable materials with adult supervision.                                                                                                                                                      |
| 2 — help        | **المساعدة جزء من المهمة** — قبل قبول المهمة، يمكن للطفل طلب نسخة أصغر يراجعها وليّ الأمر. المساعدة المسموح بها لا تقلّل المكافأة المتفق عليها. إرشادات الذكاء الاصطناعي هنا أمثلة مُعدّة للمهمة المعتمدة وقد تخطئ؛ ويمكن للطفل سؤال وليّ الأمر عند الحاجة. | **Help is part of the task** — Before accepting the task, the Child can ask the Parent to review a smaller version. Permitted help does not reduce the agreed award. The AI guidance here uses prepared examples for the approved task and may be wrong; the Child can ask the Parent when needed.                               |
| 3 — recognition | **نقدّر الفعل، ثم تنمو الحديقة** — بعد تأكيد وليّ الأمر إكمال هذه المهمة وتقدير ما أُنجز، تُضاف البذور وتُظهر الحديقة الخاصة نموًا رمزيًا. لا يثبت ذلك زراعة أشجار أو أثرًا بيئيًا مقاسًا. هذا العرض محلي؛ تبدأ تجربة جديدة عند إعادة تشغيل التطبيق.        | **Recognize the action, then grow the garden** — After the Parent confirms completion of this task and praises the action, Seeds are added and the private garden shows symbolic growth. This does not prove trees were planted or environmental impact was measured. This demo is local; restarting the app begins a fresh run. |

Proposed six new clips: three Arabic and three English, bundled MP3, natural neutral delivery,
no music mixed into narration and no imitation of a person. Do not prescribe a runtime TTS voice:
the existing defect concerns bundled recordings. Reuse an already approved method only after the
reviewed text and method are available. No paid service, new account, voice cloning, real Child
recording or unreviewed uploaded content is selected. Current reviewer/method/new clips: **none**.
Audio acceptance is **BLOCKED**, while the complete silent visual path can proceed when granted.

Recording acceptance sheet per clip: script version/hash; locale/moment; generation or recording
method; provider/voice/settings and applicable rights; source file/hash; reviewer name/date;
actual phone/headphone or speaker setup; grammar, Ghaf pronunciation, prosody, pauses, pace,
volume, comprehensibility and exact transcript match; accepted/rejected with reason. Do not fill
these fields with a helper's source review. No takes have been generated or rejected in this run.

### Props/state handoff proposed to A

Use separate props-only selector/story components, with a small controller-owned view model.
Selector receives a keyed presentation for exactly `parent_al_noor`, `child_salem` and
`child_alya`, rendered once each, never an arbitrary length-three array, plus `idle | entering | error`,
pending principal, localized error/disclosure and `onSelectPrincipal`, `onCancelEntry`, `onOpenStory`,
`onLocaleChange`. Story receives a three-value moment, localized copy,
approved artwork ID, narration state and `onBack`, `onNext`, `onSkip`, `onEnterDemo`,
`onPlay`, `onStop`, `onReplayNarration`, `onLocaleChange`. A chooses the final typed file/interface.

Components never import access controllers, fake credentials, write `role`, seed the family,
mutate progression or route around a denied command. A owns authority, async invalidation,
navigation reset, mode config, canonical resources and lifecycle cancellation. New files can
live beside existing `src/components/onboarding/`; do not add routes or duplicate primitive APIs.

| State/trigger                          | Visible result and callback requirement                                                                                                                                                                                                                                                               |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Idle selector                          | Three complete named controls, no preset principal/session. Accessible name combines role/name and purpose; no auto-entry.                                                                                                                                                                            |
| Entering                               | Selected control shows actual busy text; all entry controls disabled against repeated taps. No artificial delay. Story/locale controls also disable while entering; an explicit Cancel/Back calls `onCancelEntry` before returning to idle. A owns invalidation, so stale completion cannot navigate. |
| Entry failure                          | Inline announced error; retry reuses `onSelectPrincipal(errorPrincipal)` only when A marks the error retryable. Mode/corruption errors follow A's recovery action. No partial-authority home or changed-progress implication.                                                                         |
| Story normal                           | Full transcript available immediately; steps move only from explicit controls. Play/Stop/Replay is optional.                                                                                                                                                                                          |
| Missing/loading image                  | Stable subject space or compact fallback; text, Skip and entry usable throughout. Image readiness does not gate input.                                                                                                                                                                                |
| Missing/unreviewed/failed clip         | Silent readable story and localized unavailable notice; no playback of old or wrong-language audio.                                                                                                                                                                                                   |
| Step/locale/Back/Skip/entry/background | Existing player receives stop/cancel; stale completion cannot start another clip or advance. Reentry remains silent.                                                                                                                                                                                  |
| Screen reader                          | Native reading order follows visual order; no automatic narration competition. Spoken-control policy supplied by A's narrator; human TalkBack evidence pending.                                                                                                                                       |
| Enlarged text/reduced motion           | Wrapping expands layout, actions remain reachable; image shrinks or scrolls before essential text. No text shrink/truncation or animation delay.                                                                                                                                                      |

Meaningful checks after grant: selected principal callback and duplicate suppression; error retry;
Back/Skip/locale callback mapping; narration stop/replay and stale completion with real player
adapter tests; image failure and silent fallback. A/B tests own authorization/progress isolation.
One AR/EN ×320/390 normal/enlarged-state browser pass, one correction confirmation; loaded source
identity must match candidate. Phone TalkBack/Back/font/audio tests remain D-owned evidence.

### Selected reference ideas and rejected alternatives

The existing [template catalog](../template-catalog.md) is the provenance source; archives were
not extracted or executed again. **Quickfit — Shadhin** (filename attribution), four tour moments
inside eight artboards: use one subject/concept and clear Skip/Next; reject fitness metrics, cyan
identity and imported photos. **Notes — Atiq31416** (filename attribution), three artboards: use
image → short text → action rhythm; reject unrestricted notes and location reminders. **Music —
Atiqur Rahaman/atiq31416** (embedded creator attribution), Now Playing/Lyrics: distinguish current
audio from expanded transcript; reject autoplay, streaming shelves and decorative waveform.
Its personal-use notice does not establish asset redistribution rights. **Booking — Hoangpts**
(filename attribution): consistent selection/busy/error anatomy, without rating Children or
artificial waiting. Only composition ideas are used; all runtime artwork remains approved Ghaf art.

Reject another three-theme comparison, repeated icon-card feature lists, autoplay narration,
mandatory tutorial completion, fake generation progress, and a single authenticated role toggle.
The requested three-moment structure comes from the user/A contract, not from copying Quickfit.

## C-N02 optional proposal: make support reciprocal on the same task

This section is not selected implementation. Existing recent work improved correctness and
presentation; calendar, generic study/custom goals, money practice, maps, free chat and memory
have not shipped. Reuse [A's service/access/audio findings](a-product-service-review.md) and
[existing research](../research-and-product-strategy.md); recovery014 remains deferred despite
the earlier strategy's proposed ordering. Do not reopen the completed audits or implement memory.

The strongest small hypothesis is a **specific support agreement attached to an accepted task**:
Salem chooses the attainable approved recycling task; may request that the Parent sort the first
items with him; the Parent explicitly accepts that support action or offers another time; after
the real activity, each may acknowledge what they did. This makes the adult's action visible
without rewarding closeness, creating a chat platform or assessing who is a good Parent/Child.

The full reciprocal hypothesis includes two acknowledgments, but the smallest recommended
acceptance story is only **one Child request and one Parent acknowledgment**. Optional completion
acknowledgments can follow later without holding task completion hostage. Parent unavailability
must offer a smaller safe plan or postponement through the existing domain flow; it is not a
public rejection, lost Seed event or failure badge.

### Evaluate the ideas as parts of one relationship

| Idea/current truth                                                                    | Concrete future behavior and family interaction                                                                             | Evidence, feasibility and limitation                                                                                                                                                                                | Decision, seams and relative effort                                                                                                                                                                           |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Calendar: no executable schedule; Feature008 rhythms are descriptions                 | Agree one optional task window, let Child request moving it; Parent confirms the change in person                           | Clear agreement may aid coordination: design inference, not app efficacy. Offline feasible; date/timezone, cancellation and no-response require real semantics. A month grid adds no family action by itself.       | Propose later, after explicit selection. Task planning model + Parent/Child contextual views, no Google sync. Medium vs the small request story.                                                              |
| Study/custom goals: catalog previews and gated finite learning, no generic study mode | Choose one short practice strategy; Parent offers a worked example or checks the Child's explanation; agree a later revisit | Retrieval-practice evidence supports practice with feedback, not a timer/marks dashboard. Curriculum and cultural applicability remain unresolved. Offline authored examples feasible.                              | Propose later, separately reviewed material + task/learning adapter. Medium–large. Education stays ineligible for Family Rewards; no cash for grades.                                                         |
| Money literacy: private Reward promise exists, no wallet or budgeting                 | Discuss two synthetic spending/saving allocations and explain one choice; equivalent route for families without allowance   | CFPB provides a developmental design framework, not proof a balance screen teaches competence. Offline exercise feasible; age/material review needed.                                                               | Propose later as zero-progression finite learning, separate from Seeds/Reward. Medium. No custody, transfers, investment, debt or exchange rate.                                                              |
| Maps: no tracking, live map or visit proof                                            | Parent reads a curated shared-outing card and chooses an indoor equivalent if unsuitable                                    | Shared activity rationale is a design hypothesis; no new scientific claim. Offline place cards feasible; real navigation needs separate reviewed transport/privacy/service scope.                                   | Propose later; curated content/list first, map optional. Medium–large. Reject surveillance, arrival awards and Child coordinate collection.                                                                   |
| Chat: “ask an adult” is a local instruction, no delivered request                     | One task-bound request followed by Parent acknowledgment on the same primary phone                                          | Specific language/listening/credible support follows UNICEF guidance. This is not validated family-outcome improvement. Offline local handoff is demonstrable and explainable; secondary phone remains independent. | Recommend smallest proposal for later selection. Small: version-bound finite request projection + two existing task surfaces. Reject free chat, inbox/unread pressure, push and emotional disclosure prompts. |
| Memory leaf: absent; recovery deferred                                                | Later private acknowledgment of an accepted shared event, no award or unlock authority                                      | A useful reminder is only a hypothesis. Cannot honestly promise durability now. Visibility/deletion/content/minimal evidence need another contract.                                                                 | Defer beyond recovery decision and native validation; no leaf/timeline in this acceptance story. Medium dependent work.                                                                                       |

### Evidence used without outcome claims

Three relevant original references from the existing report were reopened on 2026-09-12;
no new competitor search, archive extraction or interviews were performed. UNICEF recommends
clear specific language, listening, action-focused praise and keeping credible promises; this
supports the proposed interaction as a design inference, not an app trial or proof across ages6–14.
[UNICEF guidance](https://www.unicef.org/lac/en/parenting-lac/nurturing-care/how-communicate-effectively-young-child).

Agarwal, Nunes and Blunt's classroom review examines retrieval practice and reports limited
non-WEIRD representation. A later study story can use reviewed recall/feedback, without claiming
Ghaf improves cognition, grades or wellbeing.
[Institutional author record](https://remix.berklee.edu/faculty-works/12/).
CFPB's report proposes childhood foundations and promising strategies for financial capability;
it does not evaluate this app or validate a synthetic allocation screen.
[CFPB report](https://www.consumerfinance.gov/data-research/research-reports/building-blocks-help-youth-achieve-financial-capability/).

### Before/after and one Parent/Child storyboard

| Existing loop                                           | Proposed addition                                                     | What stays unchanged                                                                        |
| ------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Parent approves executable task and safety terms        | Parent can see an explicit task-bound support request                 | No request assigns/revises a task or relaxes adult safety responsibilities.                 |
| Child chooses task, receives “ask an adult” instruction | Child taps a curated request such as sorting the first items together | Full accepted +12 with permitted help; no request points.                                   |
| Parent chiefly reviews submitted completion             | Parent acknowledges a concrete support action before the family acts  | Parent may defer safely; no demand for instant response, notification or automatic handoff. |
| Child returns to generic help copy                      | Same-task view says Parent accepted the named support action          | No chat history, free text, diagnosis or appearance of live delivery.                       |
| Parent confirms/praises; Seeds/Garden update            | Optional acknowledgment can name the shared action after completion   | Confirmation/recognition still own all progression; opening acknowledgment earns nothing.   |

Proposed sequence for a future 2–3 minute primary-phone demonstration: Parent approves the
existing task → signed-out handoff to Salem → Salem chooses it and requests help with the first
items → signed-out handoff to Parent → Parent acknowledges the exact support → return to Salem
and do the real safe action with adult support → submit → Parent confirms and gives action-specific
praise → existing +12 and symbolic Mangrove growth. This proposal adds one purposeful exchange;
the selected quick-entry work makes presenting roles easier but does not implement this request.
Do not spend the demo opening unimplemented calendar/map/money modules.

Expected optional-agreement states: `none → requested → acknowledged`; Child may withdraw a
pending request; Parent may return an explicit `unavailable` response with safe existing next-step
options. A new request uses a new identifier after withdrawal/unavailability, not silent mutation
of the previous acknowledgment. Replacement/reset invalidates the request. Any later `done`
acknowledgment is optional and cannot gate submission or recognition. Dates and durable history
are omitted from the smallest story; restart begins without an agreement under the existing
process-local limitation. These are proposed semantics requiring A's exact accepted contract.

Likely future seams: new small support-agreement model/reducer/service; A's existing registry and
aggregate-store adapter; Child task help panel and Parent task/check-in context; canonical bilingual
resources; focused authorization/idempotency/reset tests. No new route/library or arbitrary message
store is needed. The existing A-P01 trace already established that no such request service exists.
Do not quietly reinterpret the current help toast as a delivered agreement.

Failure/privacy acceptance proposal: reject cross-family, cross-Child and changed-task/version
requests; signed-out or Child callers cannot acknowledge as Parent; repeated taps are idempotent;
stale async work after reset cannot revive a request; missing Parent response is neutral; no task
title/help/accommodation/disclosure reaches League/Green/other households; no support data changes
Seeds, lifetime, Garden, Leaf eligibility, canopy or private Reward progress. The request may
never replace adult safety presence, create pressure to disclose emotions or force affection.

**Smallest proposed acceptance story:** Given Salem's already approved canonical task on one
synthetic phone, when Salem requests help with the first items and the Parent later acknowledges
under a valid separate Parent session, only Salem's matching task shows that acknowledgment.
The family can still postpone, retry or complete with permitted help. Submission awards zero;
the existing Parent confirmation/praise/recognition awards +12 once. Alya sees no request; reset
removes it. This is one bounded product addition, not approval to build it now.

AI role: prepared current-task examples may explain a step or phrase a reviewed request. The
human chooses/acknowledges the action. AI neither detects need, generates an agreement, judges
Parent compliance, diagnoses the Child, listens in the background nor determines rewards.
No additional model service is required to demonstrate the proposed reciprocal interaction.

## Decisions and actual contribution record

- User selection: three synthetic profiles, onboarding redesign, Arabic narration repair.
- A implementation authority: Feature015 in progress at r25; source paths not yet granted.
- Recommended reciprocal story: proposal only; student/user selection PENDING.
- Named student owner, understanding/teach-back, exact-diff acceptance, Arabic script/listening
  reviewer, device/operator settings: PENDING/unknown. No interviews or participation fabricated.
- Root requested Astra/Ultra/Fast; fresh config reads `gpt-6-astra`/`xhigh`/`fast`, served settings
  unexposed. Ultra is not verified for root. No config or runtime dependency changed.
- Root authored this bounded storyboard/copy/state proposal and reused cited research/catalog;
  no full app, template code, image or voice asset generated. Helper reviewed C-N01 diagnosis and this bounded script/interface packet read-only.

Exact user prompt is the supplied Session C native-batch role instruction, mirrored in canonical
`docs/competition-readiness/native-batch/session-c-native-ui.md`, SHA-256
`adc2142821a4eca68cf69980bffc3122ea7b89e09fe88bbfa228212534ee33c6`. All generated wording above is a candidate
requiring named review. Rejected directions and missing audio acceptance are explicit. No runtime
tests/browser/native pass is claimed for this report; formatting/whitespace and source receipt
will accompany its coherent local commit. C-N04 implementation takes priority when A grants it.

### Supporting script review, not human acceptance

The same one allocated helper independently reviewed only the selected scripts/interfaces. Lead
accepted two corrections: a smaller proposal is Parent-reviewed before task acceptance (not just
before starting), and Seeds follow explicit Parent confirmation of this task's completion. Lead
also separated opening the story from replaying the current clip, specified final-moment entry,
retry/cancel semantics, three distinct IDs and third-person task-bounded AI wording. A's emerging
015 decision removed the proposed in-app ordinary-access link; ordinary mode is a separate run.
These are draft refinements, not shipped behavior or named Arabic approval. Helper released its
allocation with no writes, jobs or descendants. Actual user question requesting the Arabic reviewer
name is pending; no name or approval is invented.

Exact follow-up prompt:

```text
C-N01 read-only allocation released; reuse same one C r25 slot for independent script/props review. READ ONLY, no writes/coordination/browser/tests/jobs/descendants; preserve others. Exact target /home/smyk/projects/Ghaf-ui-studio/docs/competition-readiness/workstreams/c-product-refinement.md C-N04 storyboard + six proposed body transcripts only (not optional reciprocal proposal). Compare canonical /home/smyk/projects/Ghaf/docs/competition-readiness/native-batch/entry-onboarding-contract.md selected intent. Check bilingual semantic parity, safety/Parent approval, full permitted-help credit vs smaller-before-acceptance, prepared/fallible AI, symbolic-growth/restart truth, three-profile exclusivity and visible-vs-spoken parity. Flag concrete missing/misleading claims or ambiguous component state/callback interfaces to A. Do NOT represent your review as named human Arabic/cultural/listening approval; no clip exists. Do not redo access/audio service audit or D's spec/privacy review. Lead concurrently formats/commits C-N01 checklist then aligns proposed components with A's emerging015 draft. Return focused findings/release; exact prompt will be logged.
```

## User-delegated Arabic editorial review — C-N04 revision 1

Review recorded at 2026-09-12 01:49:20 UTC. The user replied:

> the text you can review it and the recordings I can hear it by my self and determine if its good enough

This supersedes the earlier requirement to find a separate human text reviewer for this selected
script packet. **AI Arabic/English editorial review: PASSED for the revision below.** Reviewer:
Session C/Codex, instance `C-20260912T011718Z-root`; this is explicitly AI review, not named human
participation. The **user is the voice-quality decision-maker**, name unspecified. Listening
acceptance is still **PENDING** because no replacement recording has been generated or heard.
A's resource integration and exact asset/lifecycle grant remain separate boundaries. Earlier draft
text and pending-review records above are historical, not deleted or presented as human approval.

The review checked ordinary MSA grammar, a speakable sentence structure, action-focused praise,
Parent approval, smaller-task timing, full permitted-help credit, prepared/fallible AI, adult help,
private symbolic growth and restart truth. It makes no cognition/family-outcome claim. No dialect,
religious phrase, personal-character judgment or new task behavior was introduced.

| Observed wording issue                                                            | Editorial decision                                                             | Meaning retained                                                          |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| “يختار الطفل من المهام” is understandable but leaves the chosen object implicit   | Say “يختار الطفل مهمةً وافق عليها وليّ الأمر”                                  | The Child chooses one already approved task                               |
| “مع إشراف” is less natural here than the direct preposition                       | Use “بإشراف شخص بالغ”                                                          | Adult supervision remains explicit                                        |
| “نسخة أصغر” is abstract when spoken                                               | Use “مهمة أصغر ليراجعها وليّ الأمر”                                            | Request and Parent review happen before acceptance; no automatic approval |
| Long help sentence joins prepared AI, fallibility and adult help with a semicolon | Separate prepared/fallible guidance and asking the Parent into short sentences | No live/general assistant or replacement-Parent promise                   |
| Nested confirmation/recognition clause is hard to follow aloud                    | State confirmation and action appreciation, then Seeds and growth              | Praise/confirmation still precede symbolic growth                         |
| A 3-moment body script differs from old title+body narration                      | Generate only the exact visible body text                                      | No old audio or hidden spoken sentence is substituted                     |

### Exact reviewed revision for A's bilingual resource patch

The following bodies supersede the draft packet only after A applies them to the canonical
resources. C does not edit those resources. Titles remain unchanged. Body text, including
punctuation/diacritics, must be the input to the matching candidate recording; no separate spoken
paraphrase. The English revision below preserves the same meaning and order.

| Moment   | Arabic body — reviewed revision 1                                                                                                                                                                                                                | Equivalent English body                                                                                                                                                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| together | يختار الطفل مهمةً وافق عليها وليّ الأمر. في هذا العرض، يجرّب سالم فرز مواد نظيفة قابلة لإعادة التدوير، بإشراف شخص بالغ.                                                                                                                          | The Child chooses a task already approved by the Parent. In this demo, Salem tries sorting clean recyclable materials with adult supervision.                                                                                                                                          |
| support  | قبل قبول المهمة، يمكن للطفل طلب مهمة أصغر ليراجعها وليّ الأمر. المساعدة المسموح بها لا تقلّل المكافأة المتفق عليها. إرشادات الذكاء الاصطناعي هنا أمثلة مُعدّة مسبقًا للمهمة المعتمدة، وقد تكون غير دقيقة. يمكن للطفل سؤال وليّ الأمر عند الحاجة. | Before accepting the task, the Child can ask for a smaller task for the Parent to review. Permitted help does not reduce the agreed award. The AI guidance here uses prepared examples for the approved task and may be inaccurate. The Child can ask the Parent when needed.          |
| growth   | يؤكد وليّ الأمر إكمال المهمة ويقدّر ما أُنجز. بعدها تُضاف البذور، وتنمو الحديقة الخاصة نموًا رمزيًا. هذا النمو لا يعني زراعة أشجار حقيقية أو قياس أثر بيئي. هذا عرض محلي؛ تبدأ تجربة جديدة عند إعادة تشغيل التطبيق.                              | The Parent confirms completion of the task and praises the action. Seeds are then added, and the private garden grows symbolically. This growth does not mean real trees were planted or environmental impact was measured. This demo is local; restarting the app begins a fresh run. |

The user need not approve the same text-review assignment again. A reconciles this exact resource
patch with the selected contract; the user's later listening decision applies to the actual clips.
A bad pronunciation, clipped word, rushed pause, mismatched text or robotic delivery is a reason
to reject a take, even if its MP3 metadata/checksum is valid. Do not normalize pitch/rate afterward
and call the result the same reviewed take; a changed clip needs its own listening record.

### Available method, proposed candidate and limits

No callable speech-generation tool is exposed to this session. Read-only local checks did not find
`edge-tts` on PATH, in the checked project/user tool environments, or importable by `python3`.
No generator was installed or invoked. Existing `ffmpeg` availability is not a voice generator.

Provenance correction: `assets/audio/onboarding/README.md` records Arabic `ar-AE-FatimaNeural`
(rate+7%, pitch+2Hz) and English `en-US-EmmaMultilingualNeural` (rate+8%, pitch+2Hz), dated2026-09-07;
it does **not** establish the generating tool/version. `docs/DESIGN_DIRECTION.md` records
edge-tts7.2.8 for four older Feature002 fixtures; that does not prove the onboarding clips used it.
The existing README retains voice-quality and asset-rights review as pending.

The [generator's own documentation](https://github.com/rany2/edge-tts) describes an online
Microsoft Edge TTS client and its voice/rate/pitch controls. This would be **asset preparation before bundling**, requiring connectivity during generation,
never runtime TTS or in-app networking.
The output would be bundled only after the applicable acceptance/grant. This source does not
establish output redistribution permission or actual present service availability.

Proposed first method for A's decision: isolated pinned edge-tts tooling in
`output/native-ui/narration-tool/**`; exact text/MP3/log/receipt files in
`output/native-ui/narration-candidates/**`; existing Fatima/Emma voice IDs at **rate+0%, pitch+0Hz**,
normal volume, no music. This removes the earlier tuning as a comparison variable; it is **not**
a claim neutral settings sound better. No new voice/person imitation, paid service, account or
Child recording is proposed. C requests exact tool version/method/path authority through outbox015.
Candidate clips stay outside runtime assets/imports until actual user listening and A's grant.

Candidate invocation shape after method/tool approval (not executed):

```bash
edge-tts --voice ar-AE-FatimaNeural --rate=+0% --pitch=+0Hz \
  --file output/native-ui/narration-candidates/ar-together.txt \
  --write-media output/native-ui/narration-candidates/ar-together-candidate.mp3
```

Clip review ledger now: **0 generated, 0 accepted, 0 rejected replacement takes**. User listening
PENDING, current provider/voice availability NOT RUN, method/output-rights reconciliation PENDING.
The complete silent UI at931a186 is already released; these audio dependencies do not undo it.

Exact helper prompt for method preparation, `/root/duration_review`, one C allocation:

```text
New user authorizes C/AI to review Arabic text and says they personally will listen to recordings and decide quality. Bounded read-only method preparation under C's one helper quota; no descendants or writes. Lead reviews Arabic scripts now. Locate the existing narration generation method/provenance and whether its recorded edge-tts7.2.8 tool/environment is already available locally (read assets/audio/onboarding/README.md, docs/DESIGN_DIRECTION.md and narrow repo/tool paths; avoid secrets/private data). Explain minimal candidate-only invocation at neutral rate/pitch using synthetic script, proposed existing voice choices, and what remains unknown about method approval/rights. No network generation, installs, provider/account changes, voice cloning, tests, browser/heavy jobs or source/coordination/report writes. Do not re-audit runtime audio/access services. Return exact evidence paths/available executable, or truthful not found, and release. Worktree /home/smyk/projects/Ghaf-ui-studio. Preserve others' concurrent edits.
```

Helper corrected the provenance distinction and confirmed only the bounded absence checks. C
accepted those findings, authored the MSA/English revision and retains review responsibility.
Helper released with no writes/jobs/descendants; no listening or human approval was inferred.

## Generated listening candidates — A060

This receipt supersedes the earlier zero-take checkpoint. A060 authorized a private generator and
six review-only MP3s. The user authorized AI text review and personally retains listening judgment.
These files are **candidates, not accepted runtime assets**. No narrator/player import was changed.

Exact private edge-tts7.2.8 wheel was checked against publisher SHA256
`361fe48ce7ef613adbe30f664e3765dd71029c6cb57427279eff8ad6df2eb211` before installation.
The [versioned publisher page](https://pypi.org/project/edge-tts/7.2.8/) provides the wheel/hash;
actual installed Python/pip tooling, dependency versions/archive hashes and wheel license are in
`output/native-ui/narration-tool/{install.receipt.json,pip-install-report.json,pip-freeze.txt,wheel-license.json}`.
Private venv/cache only; no global or Expo dependency change. Tool licensing does not establish
rights to redistribute speech-service output; no such clearance is claimed.

All six UTF-8 body files came directly from committed `ff72d78` revision1. Before sending, every
exact body matched A's current canonical `src/i18n/resources.ts`; source/body hashes are in
`output/native-ui/narration-candidates/scripts-v1.json`. Only these synthetic public scripts went
to the approved speech service. No title, user data, additional SSML, music, clone or recorded person.

Actual generation used `python -m edge_tts --voice <voice> --rate=+0% --pitch=+0Hz --volume=+0%`
with exact `--file`, `--write-media` and `--write-subtitles` paths. Arabic voice Fatima, English
Emma, exactly as A060. The runner allowed50seconds/request and at most one retry, stopped after
any double failure, and sent only one request at a time. All six succeeded on first attempt;
no timeout, retry, rejected listening take or alternate voice was produced.

| Candidate MP3                                                                                                               | Duration, seconds | SHA256                                                             | Listening / runtime    |
| --------------------------------------------------------------------------------------------------------------------------- | ----------------: | ------------------------------------------------------------------ | ---------------------- |
| [ar-together-neutral-v1-attempt-1.mp3](../../../output/native-ui/narration-candidates/ar-together-neutral-v1-attempt-1.mp3) |            13.248 | `ad01129b26e80be2d037429180cffd8efe148f8be8ada822b24d1c871c45eca0` | PENDING / not imported |
| [ar-support-neutral-v1-attempt-1.mp3](../../../output/native-ui/narration-candidates/ar-support-neutral-v1-attempt-1.mp3)   |            26.544 | `555986d0e670e8d56d6a7885ac2a7984660726f12ac07aa095da2c306d757a88` | PENDING / not imported |
| [ar-growth-neutral-v1-attempt-1.mp3](../../../output/native-ui/narration-candidates/ar-growth-neutral-v1-attempt-1.mp3)     |            23.904 | `6ad07e11b30d0454a46755ecddb2c936b213eed9532831d06228362f16385b91` | PENDING / not imported |
| [en-together-neutral-v1-attempt-1.mp3](../../../output/native-ui/narration-candidates/en-together-neutral-v1-attempt-1.mp3) |             9.384 | `7e1039097bbaf22eb907c0c540c89088f12ca7d6b0f92405dd5c6b2b3c9615cd` | PENDING / not imported |
| [en-support-neutral-v1-attempt-1.mp3](../../../output/native-ui/narration-candidates/en-support-neutral-v1-attempt-1.mp3)   |            16.824 | `2ab447f03e1135d7608a4b73f50ec1568becaad1b1616cfc5fbd4a7791d11c5f` | PENDING / not imported |
| [en-growth-neutral-v1-attempt-1.mp3](../../../output/native-ui/narration-candidates/en-growth-neutral-v1-attempt-1.mp3)     |            17.040 | `64b167a7ba4ec68613d07b2223b0bbc92dd8c0eb01ebd4fbd47ac97ac9bdd38e` | PENDING / not imported |

Generation UTC `2026-09-12T01:55:58.157723+00:00` → `2026-09-12T01:56:22.310221+00:00`, runner428787/session92724;
children428812/428902/428957/429063/429195/429357 all exited0. No resident process remains.
The receipt `generation-v1.receipt.json` records commands, source/script/tool settings, each PID,
file bytes/hash, format probe and actual times. MP3/24kHz/mono metadata is technical evidence,
not a pronunciation or naturalness pass. C cannot establish listening quality from file metadata.

C supplied the three Arabic MP3 links/audio attachments to the user and asked whether pronunciation,
pacing and tone are good enough. **No listening response has been received at this checkpoint.**
English clips are available above for later listening too. A decision about three Arabic takes
must not automatically accept three unheard English takes. Listening device/model/context is
unknown; a user's audio decision does not pass APK/TalkBack/Back/native lifecycle requirements.

Ledger:6 technically generated candidates,0 accepted,0 rejected by the listener. Preserve these
exact files and failed/rejected replacements if later required. A must publish exact accepted
asset/player paths and matching resources before runtime wiring; completion of this candidate
packet does not activate narration, recovery014 or any new release flag.

C releases completed candidate files/receipts to A for user review and keeps the private tool
installation for a bounded requested revision. No audio-generation request remains running.

## User rejects the first Arabic narrator; replacement auditions — 2026-09-12

This is the current listening decision and supersedes the preceding pending-v1 snapshot. The user
first delegated text review to C/AI and retained personal recording review. The user then reported:
“I just heard the 3 recordings and they still sound very bad, change the narrator to more
professional text to speech arabic narrator that has the correct pronunciation and”. All three
Fatima-v1 Arabic takes are therefore **REJECTED** and preserved. English-v1 remains unreviewed.
Listener identity beyond the conversation user, device and playback setting are unspecified.
No human text reviewer is invented; the accepted delegation remains AI editorial review.

C proposed comparing a short identical first-moment script with different narrators before
regenerating all bodies. A071 initially named Hamed/Zariyah; A073 superseded the second voice with
Salma after the bounded metadata review. The helper received A073 before starting any request:
**no Zariyah synthesis occurred**. No script mutation, speed effect or postprocessing concealed
the narrator change. The same reviewed body fromff72d78 was used byte-for-byte.

| Audition                                                                                                                   | Duration | SHA256                                                             | Current status                              |
| -------------------------------------------------------------------------------------------------------------------------- | -------: | ------------------------------------------------------------------ | ------------------------------------------- |
| [Hamed](../../../output/native-ui/narration-candidates/audition-v2/ar-together-hamed-audition-v2.mp3), `ar-SA-HamedNeural` |  12.816s | `cb90f830023bfe3ed413f1ff51c6ca7f75026b3d732d1cc79a247d6139db3b89` | PENDING actual user selection; not imported |
| [Salma](../../../output/native-ui/narration-candidates/audition-v2/ar-together-salma-audition-v2.mp3), `ar-EG-SalmaNeural` |  12.912s | `f8cf14cc9d582bd39e5d67d816d292ecfbdace472f3e7efceaf5b432cd8db8a5` | PENDING actual user selection; not imported |

Exact tool: existing isolated edge-tts7.2.8, same approved Microsoft Edge speech method,
rate+0%, pitch+0Hz, volume+0%. Both IDs were verified in the live catalog; the
[Microsoft voice table](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support)
also lists their Arabic locales. Metadata is general-purpose/friendly/positive, not proof of
professional narration quality, accurate pronunciation of this script or native playback.
The [tool documentation](https://github.com/rany2/edge-tts) does not offer custom phoneme/SSML
pronunciation control. Existing output-rights uncertainty remains unchanged.

Receipt `output/native-ui/narration-candidates/audition-v2/generation-v2.receipt.json` records
UTC02:12:48.730006–02:12:53.842627, runner455996, catalog456019, synth456028/456103,
version/probe456009/456102/456188, all exited0. Two serial synthesis requests succeeded first try;
50-second limit and one retry maximum were configured, no retry used. Both outputs are MP3,
24kHz, mono,48kbps; sizes76896/77472 bytes. These are technical measurements only.
Reviewed transcript SHA256 `63e063ba64027d655a57cdab1fb8a586f119eed7c6ad99ac26fca5426fb4d773`
matched the original and audition copy. Lead inspected the receipt and preserved original files.

Actual supporting prompts to `/root/duration_review`:

1. Read-only: “User listened to all three ar-AE-FatimaNeural candidate MP3s and rejects them as very
   bad; asks a more professional Arabic narrator with correct pronunciation. Review existing tool
   metadata/docs and primary official voice sources for two suitable different Arabic narrators
   usable through the already-installed candidate-only edge-tts7.2.8 tool, without accounts/payment/
   voice cloning/new provider selection.” No browser/source/coordination writes or descendants.
2. Execution after A071: verify exact Hamed/Zariyah catalog IDs, then generate two unchanged
   first-moment auditions serially under ignored `audition-v2/**`,50s/one retry; record commands,
   PIDs, source/output hashes and actual failures. Preserve others' concurrent edits.
3. A073 amendment before requests: “exact second voice now ar-EG-SalmaNeural, Hamed unchanged.
   Stop before starting Zariyah if possible … If a Zariyah request already ran, preserve/report
   timing as superseded take … no other voice/full regeneration.” Helper confirmed none had run.

Helper contributions: primary-source/catalog comparison, exact candidate generator/receipts and
bounded two-file synthesis. Lead accepted the recorded provenance and delivered both direct MP3
links with an actual listening question. Neither agent listened to or accepted the takes. Requested
helper Astra/ultra was explicit; Fast/effective serving remain unexposed. Helper allocation, two
candidate paths and all jobs are RELEASED. No tracked app source or coordination file was written
by the helper.

Current ledger:3 rejected Arabic full takes,3 unreviewed English takes,2 pending Arabic auditions,
0 accepted runtime clips. A voice choice must precede full-script replacement, and every eventual
full take still needs listening review and exact A resource/asset/lifecycle grant. No paid account,
new runtime provider, voice cloning, real Child recording or product expansion was selected.

## 2026-09-12 — User selects an ElevenLabs Abdullah audition

A089 regrants only this report and ignored `output/native-ui/narration-research/**`; all runtime
and preview paths remain released. Base C HEAD `219a6f4`; A's frozen runtime is `5d8a3e8`.
User's latest request: “I saw good examples in https://elevenlabs.io/, can you try this Arabic
option: ‘Abdullah - Professional, and Energetic’”. This supersedes the earlier exclusion of
ElevenLabs and selects one audition. It does not accept a recording or select a paid subscription.

The conversation user rejected Salma-v2 and preferred Hamed-v2 comparatively, without accepting
Hamed. Fatima-v1's three Arabic takes remain rejected; English-v1 remains unreviewed. Preserve
all earlier files and their original receipts. Hamed and Salma were Microsoft Edge neural voices
through edge-tts7.2.8, not ElevenLabs voices. Arabic text review remains delegated to C/AI;
actual recording quality is reviewed by the user, whose personal name/device is unspecified.

The preceding bounded research recommended Google Gemini TTS as an audition option, not a selected
replacement or proven quality improvement. Its official [speech guide](https://ai.google.dev/gemini-api/docs/speech-generation)
lists Arabic, delivery controls and `gemini-3.1-flash-tts-preview`. [AI Studio](https://aistudio.google.com/generate-speech)
redirected to Google sign-in; [pricing](https://ai.google.dev/gemini-api/docs/pricing) lists a free
tier. No account, generation or output-rights check occurred. Amazon Polly's current voice table
lists Zayd as neural, and its [launch note](https://aws.amazon.com/about-aws/whats-new/2023/08/amazon-polly-gulf-arabic-male-ntts-voice/)
explicitly describes Gulf and Modern Standard Arabic support. No Polly account, generation or
output-rights check occurred. These alternatives are now secondary to the user's Abdullah choice;
no new broad comparison, feature scope or provider integration is needed.

### Exact voice and prepared recording packet

Read-only helper `/root/abdullah_voice_review` located the exact name in the public embedded data
on [ElevenLabs' Arabic TTS page](https://elevenlabs.io/text-to-speech/arabic): voice ID
`pCKbQ4EPGE06zpEPGNvS`. The provider describes a dynamic baritone and categorizes the voice as
entertainment. This is provider metadata, not an agent listening judgment. The public page offers
an editable demo; it is not evidence that this session has authenticated account or API access.

[ElevenLabs' TTS documentation](https://elevenlabs.io/docs/overview/capabilities/text-to-speech)
states that Voice Library voices are unavailable through the API to free-tier users. The
[model guide](https://elevenlabs.io/docs/overview/models) lists Arabic for Multilingual v2.
Proposed first model: `eleven_multilingual_v2`, subject to actual access and this voice's supported
models. No claim that it is the model used in the provider's public preview. No settings were
executed, no account plan was observed, and no provider key was inspected.

Prepared exact first-moment transcript, unchanged from the prior auditions:

> يختار الطفل مهمةً وافق عليها وليّ الأمر. في هذا العرض، يجرّب سالم فرز مواد نظيفة قابلة لإعادة التدوير، بإشراف شخص بالغ.

`output/native-ui/narration-research/abdullah-short-script.txt` preserves the original SHA256
`63e063ba64027d655a57cdab1fb8a586f119eed7c6ad99ac26fca5426fb4d773`.
The adjacent `abdullah-audition-plan.json` is now BLOCKED_ACCESS_NOT_EXECUTED, with the verified
voice ID, zero generation requests and zero audio files. `abdullah-request.json` holds the exact
text/model and proposed first-take settings: stability0.5, similarity0.75, style0, speed1.0 and
speaker boost enabled. These are a neutral starting configuration, not a validated pronunciation
recipe. Input SHA256 parity was checked; no paid operation was executed. A097 grants one initial
synthetic take once usable owner-authorized access and the concrete method are verified; no full three-script regeneration is selected by this preparation.

Send only the transcript to the proposed Multilingual v2 model. Do not reuse the Gemini-style
spoken direction prompt: ElevenLabs warns that descriptive instructions can be spoken aloud.
Do not invent SSML/phoneme support for Arabic; the [pronunciation guide](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices)
states Multilingual v2 does not support phoneme tags. Any later diacritic or pronunciation edit
must be versioned against the reviewed transcript rather than silently changing what is spoken.

After usable account access and the exact generation grant exist, save one take with provider,
voice, model/settings, UTC, unchanged input hash and output hash/duration. Give the user the actual
MP3 directly. Check their pronunciation, pacing and tone verdict on this exact text; metadata and
checksum checks cannot pass audio quality. If accepted for direction, obtain all three full takes
and actual listening before a separate runtime asset/lifecycle integration. Native playback,
TalkBack priority, Back/background cancellation and transcript parity remain independent gates.

The provider's [output guidance](https://elevenlabs.io/docs/overview/capabilities/text-to-speech)
reserves commercial usage for paid plans. No new account/payment was selected, and this report does
not establish distribution rights for a future clip. No real Child recording, voice cloning,
provider secret in the mobile bundle, runtime service, source change or APK acceptance occurred.

### Assistance, checks and pending access

Helper task summary (verbatim initial prompt in ignored `helper-prompt.txt`): independently verify the exact Abdullah Voice Library listing, official
page/voice ID/native language/description/model compatibility, public preview and account/plan
restrictions. Official primary sources and public read-only requests only; no credentials,
generation, media download, browser/server/build/test jobs, file or coordination writes, or
subagents. Preserve others' concurrent work. Lead prepared the identical script and this report
while the helper checked identity. No audio was generated or listened to by either agent.
Requested helper Astra/Ultra/Fast; launcher accepted Astra/ultra, Fast unavailable. Root config
previously observed Astra/xhigh/fast; effective serving is unexposed, no settings were changed.

No connected ElevenLabs tool is available in this session. After the user restored full
filesystem permission, presence-only checks for ELEVENLABS_API_KEY and XI_API_KEY both returned
false; no values, credential files or unrelated environment entries were read. User was asked
whether website or local API access already exists; “continue” and filesystem permission did
not supply account details. Never ask the user to paste a secret into chat. Under A097, new
generation is now blocked only on usable owner-authorized access and method verification;
public voice discovery and script preparation are complete. Student exact-diff review and audio
acceptance remain PENDING. No device or browser quality pass is implied by this report.

Final helper receipt: exact public preview URL is retained in the ignored plan. Lead HEAD check
returned405 (method unsupported), which does not establish GET/playback failure. No audio body
was downloaded or listened to. The helper reported one unauthenticated library metadata
GET returned401; no authenticated entitlement result exists and no restriction was bypassed.
Exact training language/regional accent and per-model compatibility remain unknown. Helper
read-only allocation is complete/released, no helper files, jobs or descendants. The public voice
preview is a provider example, not a Ghaf-script take. Use the official Arabic page, find Abdullah's
exact name or ID, and generate the text above with the recorded model/settings if the user's
account permits it. Inspect any account restriction before proceeding; no subscription purchase
or account creation is inferred. Save the resulting MP3 for actual listening, separate from runtime.

The interrupted report save later returned exit0; only this report changed. The full-permission
restoration resolves sibling-worktree write access. It does not create an ElevenLabs account.
No new source or native job was started. Formatting, diff whitespace and exact request/transcript
parity checks accompany the report commit; app suites and browser matrices are unnecessary here.

## 2026-09-12 09:44 UTC — Key setup verified; Abdullah API take refused

The user entered an ElevenLabs key through the hidden terminal prompt and supplied the “Key
saved locally” confirmation. C inspected only the exact user-selected ignored file, verified
regular/nonsymlink/current-owner metadata and mode0600, then loaded the key only in memory for
the authorized requests. No key value or hash entered tool output, source, this report or receipts.
No account was created, subscription changed, key permissions edited or package installed by C.

Actual read-only access checks:09:42:38–40UTC, PID39862/session92085 ended0. Models GET200 confirms
`eleven_multilingual_v2`, TTS/speaker-boost capability and Arabic. Direct voice GET400 returned
`voice_not_found`; this did not prove the key invalid or the shared voice unavailable. Shared
library GET200 at09:43:28–29UTC, PID41315, found the exact selected `pCKbQ4EPGE06zpEPGNvS`, name
Abdullah - Professional, and Energetic, language ar, accent modern standard, rate1.0,
`free_users_allowed:true` and ar-SA verified for Multilingual v2. Provider metadata is not an
agent listening pass. Sanitized receipts are in ignored `narration-research/access-checks/`.

The [official Voice Library guide](https://elevenlabs.io/docs/eleven-creative/voices/voice-library)
allows direct use without saving a voice to My Voices. C therefore made no Add Voice or other
account mutation. Under A097, exactly ONE synthesis POST used the unchanged119-character first
transcript (SHA256 `63e063ba64027d655a57cdab1fb8a586f119eed7c6ad99ac26fca5426fb4d773`),
`eleven_multilingual_v2`, stability0.5, similarity0.75, style0, speed1.0, speaker boost enabled,
and requested MP3 at44.1kHz/128kbps. No descriptive directions, SSML or alternate voice were sent.

Actual request09:44:26.211508–09:44:35.482375UTC, PID42257/session72962 ended0 with captured
provider rejection: HTTP402, code `payment_required`, message:

> Free users cannot use library voices via the API. Please upgrade your subscription to use this voice.

This is a provider plan restriction, not a failed local key setup. No audio file was returned or
created; no listening, duration, pronunciation or native playback pass exists. The request was
not retried, no different voice/model substituted, and no purchase or API-access workaround was
attempted. Actual billing/credit consumption was not queried or inferred. The receipt is
`output/native-ui/narration-research/abdullah-audition/generation-v1.receipt.json`.

Next step: the owner can use the provider website with the same exact voice/script; the voice
listing allows free users, but available website credits have not been observed. Alternatively,
the owner may independently select an eligible paid API plan. That decision has not been made.
A subsequent API attempt needs the changed entitlement and a renewed bounded attempt grant;
A097's single attempted POST has been used. Do not replace this402 evidence or ask for the key
again. The ignored credential file remains private for the owner's authorized future use.

Lead applied the local API integration specialist skill for narrow authentication, timeouts,
redirect refusal and error handling. The task's one-attempt limit overrides generic retry advice;
there is no runtime client or new app dependency. Only official api.elevenlabs.io received the
key header, with redirects disabled. Receipt output uses selected fields and redacts the loaded
key from error messages. All commands/jobs ended; no helper or browser was needed for these serial
access requests. Scoped report formatting/diff checks and request/transcript SHA parity passed;
no broad app suite was rerun. User/student clip acceptance remains pending, not fabricated.

## 2026-09-12 — User approves a supplied Wiam sample

The user supplied `output/native-ui/narration-research/voice_preview_wiam - confident.mp3` and
reported “much much better and very good”. This is actual positive listening review of that exact
file. The user then confirmed “It reads your Ghaf test script”. Record the first together clip
as approved by the user for sound quality and intended transcript match. Preserve it unchanged.
Reviewer is the conversation user; personal name, playback device and settings are unspecified.
This does not approve the two remaining clips, student diff or native playback.

Actual file:245805bytes; SHA256 `8782ac7eb4bbd6ec04296206e700dea62562cc4b43258744c5b66caeeab19edf`;
MP3,15.360s,44100Hz,mono. The sole embedded tag is encoder `Lavf60.16.101`; it does not identify the
voice, model, settings or spoken text. C did not listen/transcribe or upload the recording. The
first-script match is supported by the user's explicit confirmation, not independent transcription.

A bounded read-only helper search found no indexed exact Wiam listing and its direct public page
read encountered a network restriction; that result is preserved without treating absence of an
indexed result as absence of the voice. Lead's single authenticated shared-library GET200 at
09:59:32–35UTC, PID54950/session82764, found **Wiam - Confident**, ID `R5kMoWNNTn84ezIJA53m`, ar,
modern standard, professional category, rate1.0 and free-users-allowed. Arabic/Multilingual v2 is
in its verified model metadata. This is an exact name match for the filename, not cryptographic
proof of the supplied file's generator. The owner's export model/settings remain unknown.

Ignored `wiam-intake.json` records file identity and the bounded human review; the sanitized
lookup receipt is `access-checks/wiam-20260912T095935Z.json`. `wiam-recording-packet.md` and
`wiam-script-manifest.json` copy all three unchanged reviewed narration bodies with hashes.
The first clip maps to together and the unchanged first-transcript SHA256
`63e063ba64027d655a57cdab1fb8a586f119eed7c6ad99ac26fca5426fb4d773`. Retain it and obtain only support
and growth, using the same preferred voice/settings on the website. Do not add instructions or
hashes to spoken text. Those two full clips still need actual user listening approval.

No new synthesis, account change, voice upload, provider switch in code or runtime import occurred.
The prior authenticated Abdullah API402 restriction remains; the Wiam metadata's free-user flag
is not proof of free-tier API entitlement. A097's single attempted POST remains consumed. Future
asset integration requires A's exact candidate/paths and transcript parity. Existing silent
onboarding and frozen runtime5d8a3e8 remain unchanged. Student review, licensing/plan provenance
for the uploaded export and native audio lifecycle evidence remain pending.

Helper task was the distinct, public-source-only Wiam name/voice-ID/model lookup; no credentials,
media, files, generation, browser, native jobs or descendants. Lead handled the supplied file,
actual authenticated name lookup and report/packet while the helper worked. Helper allocation is
released. Requested Astra/ultra used the prior launcher, Fast/effective serving unexposed. No
human or agent listening beyond the user's stated review is invented. Scoped report/packet format,
unchanged-file hash and transcript-manifest parity passed. Single-thread local FFmpeg decode to
null output returned0 with no errors; that is file decodability, not a second listening or native
acceptance claim. The MP3 remains byte-identical to the supplied file.

## 2026-09-12 — Remaining Wiam exports received

The user replied “done” to the remaining-two recording request, then supplied the actual directory
`output/native-ui/narration-candidates`. Both requested filenames are present there. The initial
check of `narration-research` found only the first clip because the new files were saved in this
other directory; that observation is retained in C057/C058, without treating it as a file defect.
The first approved MP3 remains in its original research directory. No file was renamed or replaced.

| Story    | Supplied file relative to `output/native-ui/`           | Bytes  | Duration    | SHA256                                                             |
| -------- | ------------------------------------------------------- | ------ | ----------- | ------------------------------------------------------------------ |
| Together | `narration-research/voice_preview_wiam - confident.mp3` | 245805 | 15.360000 s | `8782ac7eb4bbd6ec04296206e700dea62562cc4b43258744c5b66caeeab19edf` |
| Support  | `narration-candidates/ar-support-wiam-v1.mp3`           | 379551 | 23.719125 s | `3815ad0eedd67a6cd8e9446599640239732e222f04272200ecd115acf756c034` |
| Growth   | `narration-candidates/ar-growth-wiam-v1.mp3`            | 366177 | 22.883250 s | `ff7d2ae63f6985c5a8a0d19164f52c0bd9130273d68bad37d4189fc3c7da0d5e` |

All three are MP3/44100Hz/mono with encoder tag Lavf60.16.101. Neither that tag nor matching file
properties proves a voice/model or pronunciation. The intended new scripts retain support SHA256
`9299aab4bdcf884d62eba7a545622081113654c9257b9ac58daafabcab9e754d` and growth SHA256
`316ca89f3d25f99a4f109e750967096caa253985b8c8ec34115fc9f1f807b1bf`.
New-clip mapping is based on the requested export filenames, not independent transcription.

Local intake at10:55:42–43UTC, runner109619, verified all three transcript-manifest hashes and
unchanged MP3 hashes. Single-thread FFmpeg decode of support (PID109622) and growth (PID109642)
returned0 with empty stderr. The first clip's prior successful decode was not repeated. All jobs
ended. Exact argv, times, metadata and source identities are in ignored
`narration-research/wiam-three-clip-intake-v1.json`; a readable three-clip/script mapping is in
`wiam-three-clip-handoff.md`. Total file duration is61.962375seconds, not a measured demo time.

First-clip actual user approval is unchanged. C asked whether the newly located support/growth
clips had approved full wording, pronunciation and delivery, and which ElevenLabs model was used.
The user answered **“yes, multilingual v2”**. Both exact new clips are therefore USER APPROVED
for those aspects, and all three Wiam narrations now have actual user listening approval. Record
**Multilingual v2 (`eleven_multilingual_v2`)** as the user-reported generation model; MP3 metadata
does not independently identify it. Other generation settings and export-plan/rights provenance
are unspecified. Reviewer is the conversation user; no personal name or device is invented.
Agent listening/transcription was NOT RUN. Native playback and student exact-diff review remain
pending. No original audio was modified, uploaded or synthesized; no credential was read and no
paid operation, source import or APK job was performed.

A089 permits this report/ignored-research intake. The source base remains C8822e13 and frozen
runtime5d8a3e8; eventual accepted audio requires A's exact asset/lifecycle candidate grant.
The existing silent introduction remains usable. New files do not authorize changing app audio,
reenabling old mismatched clips, or accepting English audio without its own review.

### Independent text parity and integration handoff

C reused the sole read-only helper `/root/abdullah_voice_review` while the lead inspected files
and wrote this intake. It verified all three intended body-only scripts byte-for-byte against
current canonical `src/i18n/resources.ts` fields `demoEntry.moments.{together,support,growth}.body`
at lines34/39/44:216/438/382 UTF-8 bytes, matching the three manifest hashes. Separate moment titles
are not narrated. This proves intended text/resource parity, not speech-to-text parity.

The helper identified the exact existing integration seams for A: `app/index.tsx` supplies the
three IDs/copy; `src/components/demo/types.ts` and `DemoOnboardingStory.tsx` currently have no
playback API and render the silent fallback. The older `onboardingAudioSources.ts` belongs to
six-step onboarding and must not be treated as this three-script registry merely because some
IDs overlap. `useOnboardingNarrator.ts` provides a reuse reference for player/replay/status/
screen-reader handling, but automatically restarts when eligible, exposes no explicit stop method
and has no direct background listener. Its downstream internals were outside this review scope.
A must reconcile the accepted opt-in/stop/cancellation contract in its exact integration grant;
copying the new files into the old registry alone does not implement the requested behavior.

Exact bounded helper prompt is retained in ignored `wiam-three-clip-helper-prompt.txt`; findings
and prompt hash are in the intake JSON. Scope was the named canonical copy/contract/demo and old
onboarding files plus three script texts/manifest. No helper writes, media listening, credential
access, network, tests, browser/native jobs or descendants. Helper completed/released. Requested
Astra/Ultra/Fast; reused launcher previously accepted Astra/ultra, Fast/effective serving unexposed.
Lead config remains previously observed Astra/xhigh/fast; no settings were changed.

Validation: scoped `prettier --check --ignore-path /dev/null` passed for this report, the handoff
Markdown and intake JSON; `git diff --check` passed. A focused local verification matched all
original audio/transcript/prompt hashes, checked recorded approval/model consistency, and confirmed
both decode processes ended. No application behavior changed, so no app suite/browser matrix was
rerun. Only this report is committed; ignored receipts/media remain local, with source hashes above.
