# R002a Parent Review screen specification

> **R002A COMPATIBILITY SCOPE APPROVED — IMPLEMENTATION AUTHORIZED**  
> **R002B PRODUCT EXPANSION — DECISIONS OPEN — IMPLEMENTATION BLOCKED**

Status: selected presentation specification for existing Parent check-in, approval, and retry behavior.

## Evidence

All evidence is under `docs/design/stitch/releases/ghaf-r002/` in the original worktree.

| State            | Candidate                                 | PNG dimensions / SHA-256                                                    | HTML SHA-256                                                     |
| ---------------- | ----------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Pending          | ghaf_parent_task_review_pending_corrected | 706×1600 / 134d59b98bca5b2ab232b993b42af343ec2303226288a11a94d9886028ae9dad | c6d76a11498f7c2b583e349d193952c7295caf17c8ae782fd51e14e363308333 |
| Support          | ghaf_parent_task_review_support_request_2 | 687×1600 / d2857ca65b531978c99c0b793f40828080b1319a2bc74739976ae38c66484e68 | cc984318b247a368b1f5ca2683c98920164f74acd241ed2b13f222191587be10 |
| Approval success | ghaf_parent_task_review_approved_success  | 706×1600 / 6c4aceb26d12ec38dddb549c31617a9a14859456ac4b9686e61fe7496d9b361c | 481bde0874adbfa920d79171e2011c548e455d0870dad7735d0c81614d56516c |

HTML titles identify Pending, Support Request, and Approved Success; viewports are width=device-width, initial-scale=1.0. The pending HTML contains {{DATA:SCREEN:SCREEN_34}} and its PNG visibly renders :EN:S; both outputs are discarded. Support _2 has a desktop outer wrapper: only its extractable 390×844 phone structure and states are evidence. Support _1 is supporting default composition.

## Route and transaction

Owner route is /parent/check-in behind Parent capability/reauthentication rules. Render the current submission, allowed help/evidence summary, neutral observation/praise inputs, and existing approve/retry actions. Approval calls the existing atomic idempotent transaction once; UI never computes Seeds or consequences.

Success presents the complete existing receipt, including every applicable committed Seed, landscape/stage, canopy, private League/Challenge Leaf, private Family Reward, and other current consequence. Omit only fields absent from that receipt; never replace the full consequence set with screenshot fragments.

Support request uses default, selected, sending, and sent presentation states. It must map to the existing kind-retry/neutral Parent-note path. Exact per-step persisted targeting is not proven in the current model and must not be claimed or invented in R002a.

## Quality and recovery

Loading and error preserve the submission. Busy actions disable duplicates. Interrupted approval re-reads the stored receipt; idempotency prevents a second award. One native success sheet traps/restores focus and never stacks. Use code-native avatar/icon assets, 48×48 targets, keyboard avoidance, 200% text, physical RTL Back, semantic errors/status, 4.5:1 contrast, and reduced-motion instant sheet.

## Acceptance boundary

Existing rewards, access, privacy, task ID, reset, and profile isolation are unchanged. Revised combined RevealBundle and all R002b surfaces remain blocked.
