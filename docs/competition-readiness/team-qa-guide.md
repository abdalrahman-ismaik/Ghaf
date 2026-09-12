# Team understanding and judge Q&A

The supplied SMAC orientation assigns **25% to Q&A** and **10% to GitHub/development evidence**
(physical pages 13 and 17). Each team member should explain their own contribution and trace one
user action through the actual code. A memorized answer is insufficient when a judge asks to open
the implementation or change an input.

Use these prompts for a team rehearsal. Suggested answer content is a study aid, not a claim
that the team has completed the exercise. Verify every answer against the final build.

| Judge question                                     | What a sound answer should explain                                                                                                         | Evidence to open                                                         |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| What family problem are you solving?               | Unclear expectations and difficult support/recognition moments; Child choice and human conversation                                        | The task/help/recognition journey                                        |
| What is original about Ghaf?                       | Arabic-first family agreement plus help-preserved recognition and private cooperative UAE growth; not a claim of being the first chore app | Core screens and research strategy                                       |
| Why use AI here?                                   | A bounded transformation can make a task clearer; Parent reviews it; deterministic rules handle authority and rewards                      | Assistant contract, registry and actual mode label                       |
| Is the model live?                                 | Identify the selected mode accurately; prepared response is not live inference                                                             | Direct request/result evidence if available; otherwise prepared fixtures |
| Can the Child ask the AI anything?                 | No; current Parent-approved task and age-appropriate bounded intents                                                                       | Assistant safety tests and Child Coach component                         |
| Who decides a task was completed?                  | Parent authority; AI does not verify truthfulness or real-world impact                                                                     | Confirmation command and lifecycle tests                                 |
| What happens if Confirm is pressed twice?          | Same recognized event/result; no second award                                                                                              | Idempotency regression and counter oracle                                |
| What if the Child needed help?                     | Accepted task retains its displayed award; smaller awards require agreement before acceptance                                              | Allowed-help transition tests                                            |
| Where are the data stored?                         | Directory/access use local validated persistence; identify actual progress persistence in this build                                       | Local repositories and store initialization                              |
| Why use two phones?                                | The primary runs the complete local journey; the secondary independently checks the same build. Their stores do not synchronize            | Per-device installation and rehearsal records                            |
| What makes a memory leaf safe to replay?           | A proposed memory is private evidence of one confirmed action; opening it cannot award Seeds again                                         | Accepted memory story and idempotency test, once implemented             |
| How do you stop a Child approving themselves?      | Role/Child/task binding enforced in commands; UI hiding is not enough                                                                      | Access and wrong-role tests                                              |
| What does a tree mean?                             | Symbolic record of approved activity; no claim of real trees or measured carbon                                                            | Growth policy and product labels                                         |
| Are Seeds money?                                   | No; separate permanent progress authority, private Parent promises and no universal exchange rate                                          | Reward eligibility and lifecycle tests                                   |
| Why no default GPS tracking?                       | Discovery can use an adult-owned place link; tracking needs its own purpose/privacy/native design                                          | Map proposal and absence of location collection                          |
| Will this improve grades or cognitive development? | Evidence informs techniques, but Ghaf has not demonstrated those outcomes                                                                  | Research table, population/causality limitations                         |
| Why offer retrieval and spaced study?              | Explain the technique, feedback and later revisit; a timer alone is not evidence of learning                                               | Reviewed learning sample and cited classroom studies                     |
| What happens without internet?                     | Prepared local path remains; cold launch must work with Metro stopped and internet unavailable                                             | Actual offline/failure rehearsal                                         |
| Is Arabic only translated English?                 | Explain logical direction, mixed numbers, typography, long-label and native accessibility checks                                           | Paired captures and direct Android observations                          |
| What did each teammate build?                      | Accurate personal work, AI-assisted contributions, decisions and tests                                                                     | Own commits, review notes and AI-assistance log                          |
| What went wrong, and how did you debug it?         | Configured-child selector defect: hardcoded fixtures differed from actual profile data; focused regression and fix                         | Targeted fix diff and RED/GREEN evidence                                 |
| What remains unfinished?                           | Restart recovery, saved memory, recommendation presentation and unobserved physical/human gates as applicable                              | Current QA and limitations                                               |

## Three teach-back exercises

1. Trace Parent confirmation from the route through the store/service/domain policy to each
   separate counter and the displayed result. Explain why a replay creates zero new recognition.
2. Start with one renamed Child profile and show how Task Builder discovers available children.
   Explain why displaying a hardcoded second profile was wrong, and why age band differs from age.
3. Disconnect or reload during the chosen demo. Explain what actually survives, what cannot be
   inferred from remembered access, and how reset and the prepared fallback work. Identify missing persistence honestly.

For each exercise, record the participating member, actual date, code paths opened, explanation,
questions they could not answer and follow-up learning. Do not prefill these as completed. A
short live modification or input variation is a useful understanding check when safe and reversible.

## Repository evidence

The [GitHub guide](../SMAC%202026/SMAC2026_GitHub_Guide.pdf), pages 7–11, expects recognizable
individual accounts, meaningful small commits, team participation, organized files and a README
with project/team/idea/run instructions. It says public or private as required; it does not provide
a judge account, mandate public visibility or specify an access-sharing procedure.

Preserve accurate history and each person's identity. Do not fabricate activity, backdate commits,
assign AI-generated work to a teammate who did not do it, or share one account. Keep real meeting
notes and explicit review records. The assistance log should identify generated code, documents, tests and assets, including suggestions that were rejected. Recover actual earlier prompts from
the team's records; do not invent a complete historical log from filenames.

Before submission or an allowed update, review the precise package with the team: required video,
two-page description, GitHub accounts/access, honest AI report, and the qualified-team demo
instructions. The orientation does not specify the AI-report length or whether it is an appendix.

## Feature015 demo-entry teach-back — student review pending

**Why can three profiles enter without a password?** This is a separate, explicitly selected
synthetic demo build. The selector asks existing Parent/Child controllers to create the correct
session; it does not change a role variable or authenticate a real person. Ordinary builds keep
their verification/pairing flow. Do not describe demo access as production authentication.

**What prevents Alya approving or completing Salem's task?** The controller and guarded commands
bind authority to the selected role and Child. Entry creates no task. Salem's approved assignment
is retained through handoffs, while Alya's commands cannot act on it. Parent approval, praise and
recognition remain distinct steps; permitted help earns the accepted +12 once.

**What happens if entry or reset fails?** Entry uses one synchronous transaction retaining private
controller snapshots until all participants finish. Any failure rolls back all three authorities
and permits retry. Existing reset is sequential; if it fails, the demo denies every entry and shows
an instruction to fully restart. It does not claim atomic reset or recovery of partially cleared data.

**What survives restarting the app?** Nothing from the demo run is restored. The four repositories
use isolated memory; restart returns to the three-profile selector with a fresh synthetic fixture.
Signing out within the running app preserves task progress. Independent phones do not synchronize.

**Why are the new onboarding screens silent?** The old recordings do not match the revised text.
Six replacement candidates are prepared for actual listening review; AI text review, MP3 metadata,
mocked playback tests and human listening are separate kinds of evidence. No unheard recording has
been accepted as a repaired Arabic narrator.

Student action: review the actual Feature015 diff, explain one rollback and one sibling-isolation
test, then demonstrate the same behavior on the exact APK. Names, answers and acceptance remain
pending until those activities actually happen; this packet does not fabricate participation.
