# Next batch: product corrections, demo entry, onboarding and Android validation

Prepared after user decision52c61fc. Recovery implementation is deferred until the current APK/native
journey is validated; it still needs later scope/typed-contract acceptance. This pack is a new
bounded assignment, not a restart of the completed recovery/design audits. It now also carries the
user's explicitly selected three-profile demo entry, onboarding redesign and Arabic voice repair.
Read the [source-based product review](../workstreams/a-product-service-review.md) and
[entry/onboarding brief](entry-onboarding-contract.md) before assigning implementation.

## Launch order

Use the existing A/B/C/D conversations if convenient. Paste each short launcher below into its
matching session; the role file and shared contract contain the full task. **Start A first**, let
it publish NB1 ACTIVE grants, then start B/C/D. A must remain active for resource/source handoffs.
The files do not start sessions or wake them. B/C/D were NOT STARTED when this pack was prepared.

| Session | Work for this batch                                                                                            | Full prompt                                      |
| ------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| A       | Commit demo-access contract, resolve shared integration, coordinate and publish exact candidates               | [A integration](session-a-native-integration.md) |
| B       | Repeatable APK/toolchain path, then the granted demo-access adapter and tests                                  | [B build and access](session-b-android-build.md) |
| C       | Onboarding/profile-selector design and implementation, Arabic script/voice repair, concrete product refinement | [C product and UI](session-c-native-ui.md)       |
| D       | Independent role/sibling/reset/storage acceptance, APK/native and actual Arabic listening evidence             | [D independent QA](session-d-device-qa.md)       |

A launcher (paste here in the integration conversation):

```text
Run the next Ghaf product-and-native batch as Session A. Read and execute /home/smyk/projects/Ghaf/docs/competition-readiness/native-batch/session-a-native-integration.md, shared-contract.md and entry-onboarding-contract.md in that directory. Activate the board before worker writes. The three synthetic demo profiles, onboarding redesign and Arabic narration repair are requested scope; commit their exact Spec Kit contract before delegation. Recovery014 stays deferred. Continue eligible handoffs and record exact evidence.
```

B launcher:

```text
Resume as Ghaf Session B for APK build and the later granted demo-access adapter. Read and execute /home/smyk/projects/Ghaf/docs/competition-readiness/native-batch/session-b-android-build.md, shared-contract.md and entry-onboarding-contract.md in that directory. Worktree: /home/smyk/projects/Ghaf-demo-systems. Read the canonical board and acknowledge the exact grant before work. Preserve old branches and others' changes; do not stop after the first eligible task.
```

C launcher:

```text
Resume as Ghaf Session C for onboarding/profile-selector design, Arabic narration repair and product refinement. Read and execute /home/smyk/projects/Ghaf/docs/competition-readiness/native-batch/session-c-native-ui.md, shared-contract.md and entry-onboarding-contract.md in that directory. Worktree: /home/smyk/projects/Ghaf-ui-studio. Use the canonical board and acknowledge exact grants. Build the requested UI after A's committed contract; do not repeat completed audits or treat a proposal as shipped. Recovery014 stays deferred.
```

D launcher:

```text
Resume as Ghaf Session D for independent product and Android acceptance. Read and execute /home/smyk/projects/Ghaf/docs/competition-readiness/native-batch/session-d-device-qa.md, shared-contract.md and entry-onboarding-contract.md in that directory. Worktree: /home/smyk/projects/Ghaf-qa-rehearsal. Acknowledge canonical board grants. Cover all three demo profiles, role/storage isolation, onboarding and real Arabic listening review. Prepare tooling while APK/devices are pending; never invent native or human passes.
```

All role/shared files are in `/home/smyk/projects/Ghaf/docs/competition-readiness/native-batch/`.
Read the full path; the worker's checkout at52c61fc predates this pack. A prepared clean fresh
branches `redesign/native-build-20260912`, `redesign/native-ui-20260912` and
`redesign/native-qa-20260912`, all at52c61fc. Previous B/C/D branches are preserved. Don't run the
older worktree-create commands again. A's product review subsequently completed a narrow
Parent-approved instruction repair, committed as `e02d02b`; read its receipt and A's current candidate instead of assuming
worker branches contain it. No APK or native toolchain was generated during prompt preparation.
Canonical A stays on `redesign/ui-experiments`.

## Expected work and limits

B/C/D have independent concrete outputs: build script, one defect candidate plus a connected
family-experience proposal, and read-only device collector/acceptance packet. C must explain how
the proposed product improves on today's task/approval loop, using the existing research and the
user's calendar/study/money/maps/chat ideas. That proposal is not an implemented feature. B's actual native build requires the measured
missing host tools and license readiness; D's physical checks require an APK and actual phones.
The selected demo-entry/onboarding work has its own ordered contract and implementation queue;
the reciprocal-task and calendar/study/money/maps/chat proposals are not automatically selected.
Those native prerequisites cannot be fixed by a longer prompt. The next human inputs will be any unresolved SDK
license step and actual device/operator selection, requested only when the step is prepared.

Request GPT-6 Astra / Ultra / Fast where offered, recording actual settings rather than promising
availability or throughput. Use scoped helpers under the board's initial four-helper global budget,
one per lead; preserve configured capacity ten per session. Do not run forty helpers. Keep a single
heavy job and serialize native work against the shared browser/Metro lane.

The prompts specify action, sustained follow-through, bounded delegation and proportionate checks,
consistent with [official Astra prompting guidance](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-6-astra#prompting-best-practices).
They cannot guarantee an unattended duration. Each session continues until its eligible task queue
and active handoffs are exhausted, then publishes a precise handoff instead of inventing work.
