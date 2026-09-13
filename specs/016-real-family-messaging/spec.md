# Feature 016: Real family messaging and bounded Child helper

**Branch:** `redesign/ui-experiments` (shared; no branch/worktree changes).
**Created:** 2026-09-13. **Authority:** direct user request to implement the released C proposal,
including section13. Contract must be committed before new behavior. User/project owner attests
creation of the supplied character. Neither creator nor real-first selection is reopened.
**Status:** authorized bounded implementation; service provisioning, two-installation acceptance,
physical Android and human review remain evidence-dependent. Not production/compliance acceptance.

## User scenarios and testing

### US1 — Authenticate and enroll the intended Child (P1)

A provisioned Parent signs into real messaging and authorizes a named Child device. The local demo
selector, simulated PIN/OTP and remembered marker cannot grant this access.

Independent acceptance: a real Parent session creates a ten-minute one-use invitation for its
Child; a second installation redeems it and sees only that Parent–Child relationship. Wrong,
expired, reused, revoked or other-household invitations cannot mint membership. Arbitrary signed-in
users, anonymous users without enrollment and client-supplied roles cannot become Parents.

### US2 — Exchange real plain text (P1)

A Parent and enrolled Child open their private thread, compose, explicitly send and receive each
other's service-stored messages. A sibling's messages remain inaccessible.

Independent acceptance: two installations exchange both directions; foreground retrieval normally
shows the accepted message within five seconds on the recorded test network. Repeating a send with
its original key returns the same record; changing its body/thread with that key fails. Pagination
and concurrent sends preserve stable server ordering. A message never changes task/growth state.

### US3 — Recover honestly and revoke access (P1)

Sending, accepted-by-service, outcome-unknown, rejected, offline and revoked are distinguishable.
Sign-out clears this installation's private view; server history has its separately disclosed life.

Independent acceptance: interrupt a send after submission and retry the same key without a duplicate;
leave/reenter without moving a draft to another identity; revoke a device/account and deny its next
read/send even with an unexpired token. Background work stops. No failed network action becomes a
prepared/local success. After restart, revalidated real authentication retrieves durable history.

### US4 — Ask the bounded helper and preview a human request (P2)

On an eligible Parent-approved task, the Child sees the supplied stable portrait and the existing
finite prepared help. Message Parent opens an editable human draft with the actual recipient visible.

Independent acceptance: current task/version/Child restrictions and age-specific AI inputs remain;
no AI transcript enters messaging. The draft does not send until explicit Send. Changing real
identity clears the bridge. No matching real Child session means authenticate/enroll first and
explicitly preview the generic help request; never resolve identity by a demo nickname or ID.

## Functional requirements

- FR001: Real messaging is a separate authority and storage boundary. Use verified backend identity,
  active Parent account, household/Child relationship and active server session/device on every API.
- FR002: Parent accounts are explicitly operator-provisioned team accounts, never client role claims
  or demo records. Parent login uses actual provider authentication. No screen implements password
  hashing or stores a password. Initial test content is synthetic, with team-controlled real sessions.
- FR003: A Parent creates/selects a Child messaging identity (nickname and age band only) and issues
  an expiring invitation. Enrollment creates a scoped revocable device. Code possession plus its
  server-valid invitation and genuine session are necessary; codes have at least80bits entropy.
  Only the creating Parent's active relationship may be enrolled. Invite/device operations are bounded.
- FR004: One thread exists per provisioned Parent–Child relationship. No sibling, other household,
  optional relative, assistant, public discovery, search or group thread is inferred.
- FR005: Messages contain plain text only, 1–500 Unicode code points after whitespace validation;
  render markup/URLs as inert text. No attachments, task references, auto-link opening or media.
- FR006: Sender/household derive server-side. Messages have immutable IDs, participant ID, server
  time and monotonically ordered per-thread sequence, allocated transactionally with insertion.
  Page size defaults30, maximum50; before/after sequence cursors prevent repeated/skipped records.
- FR007: Each send has a stable random client key. Accepted retries return the same record within
  retained history; a changed body/thread is an idempotency conflict. A pending client attempt expires
  after24hours and cannot be automatically resubmitted. No automatic outbox sending or fake fallback.
- FR008: UI labels accepted-by-service, never Delivered/Read/Online/typing/unread without evidence.
  A transport timeout or unreadable success response is unknown, not definitely unsent; explicit
  Retry retains the key/body. Definitive server rejection is failed with a safe actionable reason.
- FR009: Fetch on entry/resume and bounded polling only while foreground and conversation visible.
  Abort/invalidate stale requests on identity, conversation, background, sign-out and revocation.
  Do not auto-scroll a reader away from older history; chronology is screen-reader order.
- FR010: Server text history is30days, hidden after expiry and removed by an hourly retention job.
  Idempotency guarantee covers retained history. No backups or end-to-end encryption claim is made;
  actual provider backup retention must be recorded before any non-test household rollout.
- FR011: Message bodies and drafts are memory-only on client, scoped to real identity and thread.
  Preserve a same-session draft across ordinary route/keyboard changes; clear on sign-out, real
  account/device change, revocation and process restart. Background hides private content until
  revalidation. No AsyncStorage/localStorage/SQLite chat or token cache.
- FR012: Native authentication tokens use platform secure storage; web tokens are tab memory only.
  Revalidate the provider session and server device before showing history. Real session restoration
  never grants Parent task controls or adopts a simulated Parent/Child session.
- FR013: Device sign-out first requests server device revocation and provider local-session logout,
  then clears local credentials/view regardless. If offline, explain remote revocation is unconfirmed
  and offer Parent device management from another authorized installation. Never claim remote erase.
  Parent can revoke an enrolled device or all messaging access for its account; account revocation
  disables relationships, invitations and devices. Operator re-provisioning is required to restore it.
- FR014: Parent composers support bounded text. Child ages6–8 select/edit by curated human quick
  phrases only; ages9–11 and12–14 may edit bounded human plain text. Server enforces age policy.
  Human messaging permission does not expand any AI input permission.
- FR015: Keep Parent/Child bottom destinations. Contextual Messages entry identifies the actual
  signed-in messaging person; selecting a local demo profile never selects a backend recipient.
  Server identity and local task demo are explicitly separate during team testing.
- FR016: Stable `avatar3.png` is the initial helper portrait, contained and never mirrored. No random
  identity changes, sad/affection animation, continuous idle motion or GIF dependency is needed.
  Missing image retains textual AI identity. Existing press feedback obeys reduced motion.
- FR017: Helper is AI/prepared assistance that may be wrong, limited to current approved task and
  existing one-intent/one-terminal-answer contract. Keep adult-help and Return to task exits.
  Multi-turn memory, custom goals, live-AI activation and assistant calling are excluded.
- FR018: Message Parent prepares only a generic practical-help phrase, never title, task ID, assistant
  content or transcript. Show authenticated human recipient and editable draft before Send. A
  mismatch between local demo identity and real Child is disclosed, not silently mapped by name.
- FR019: Arabic starts first; equivalent English, content-aware mixed-script direction, logical
  alignment/icons, wrapping text, >=48dp controls, keyboard avoidance and ordered accessible content.
  Physical Back dismisses keyboard before route navigation. No essential truncation/font-scale disable.
- FR020: Preserve `task_recycling_p0_v1`, approval-before-assignment/recognition, help+12, retry-no-loss,
  once-only award, default48→60Seeds/Mangrove48/60→60/60. Messages synchronize none of those authorities.
- FR021: Calls remain a roadmap: T1 approved-number dialer, V1 foreground voice, V2 explicit video /
  audio-only answer, V3 later background/locked-screen. Each needs its own contract and eligibility.
  No call controls appear in the text milestone. No auto-answer, recording, transcription or AI media.

## Assumptions and explicit limits

Adopt the proposal's30day text retention,500character limit, foreground synchronization and age
composer policy as routine first-milestone defaults authorized by this brief. Parent identifiers,
provider account/region and device inventory require concrete operator setup; no paid/public
provisioning is inferred. Web-only tab memory requires sign-in/reenrollment after a browser restart;
native secure session restoration is the intended installation flow. This first candidate uses
synthetic household content with real service authentication/transport. Real Child-data safeguarding,
provider operations and human review are separate rollout gates, not fabricated acceptance.

## Success criteria

SC001: Two identified installations exchange Parent→Child→Parent through durable service history.
SC002: Unauthorized/sibling/revoked read, send and enrollment attempts return no private records.
SC003: Retried accepted sends create one record; pagination/concurrent sends retain chronology.
SC004: Network loss/timeout and sign-out during send never become fake success or wrong-person draft.
SC005: AR/EN320/390 browser states are usable; physical Android keyboard/Back/TalkBack/font scaling
have their own exact build/device receipts, or remain BLOCKED/NOT RUN.
SC006: Existing task/help/approval/growth regression remains intact. Human messages never enter AI.
