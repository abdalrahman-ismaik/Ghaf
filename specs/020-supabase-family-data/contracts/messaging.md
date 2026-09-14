# Main-account family messaging contract

Feature 020 migration 004 uses the existing real-account Supabase client and the
trusted `ghaf_family_actor` session/membership helper. It never maps or imports
the separate Feature 016 project's people, credentials or conversations. Messages
are human conversations; no AI provider receives their contents.

## DTOs

```ts
type Inbox = {
  actor: { personId: string; role: 'parent' | 'child'; ageBand: '6_8' | '9_11' | '12_14' | null };
  threads: Thread[];
};
type Thread = {
  id: string;
  kind: 'parent_child' | 'child_child';
  childId: string;
  otherName: string;
  otherRole: 'parent' | 'child';
  otherPersonId: string;
  lastSequence: number;
  readSequence: number;
  unreadCount: number;
};
type Message = {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  sequence: number;
  createdAt: string;
  clientKey: string;
};
type Page = { messages: Message[]; hasMore: boolean };
type Permission = {
  firstChildId: string;
  secondChildId: string;
  firstName: string;
  secondName: string;
  threadId: string | null;
  enabled: boolean;
  available: boolean;
};
```

All IDs are UUIDs; sequence values are JavaScript-safe nonnegative integers
(message sequence is positive). Display names allow the core model's 80 Unicode
characters. Parent personId is its Auth user UUID; Child personId is its stable
managed Child UUID, shared by independently paired Child devices. Current actor
identity always comes from the server and must agree with the active core snapshot.

## RPCs

- `ghaf_family_message_threads(p_family_id uuid) -> Inbox`. Creates only missing
  empty Parent/Child thread metadata for actual active family memberships. Each
  Parent has a separate conversation with each Child; another Parent does not
  gain access to that Parent's messages merely by belonging to the same family.
- `ghaf_family_message_page(p_family_id uuid,p_thread_id uuid,p_before bigint
default null,p_after bigint default null,p_limit integer default 30) -> Page`.
  At most one cursor; 1–30 records; ascending response order. With no cursor,
  return the latest page. `before` loads older and `after` loads newer records.
- `ghaf_family_message_send(p_family_id uuid,p_thread_id uuid,p_request_id uuid,
p_body text,p_phrase_id text default null) -> Message`.
- `ghaf_family_message_mark_read(p_family_id uuid,p_thread_id uuid,
p_sequence bigint) -> {ok:true}`. Monotonic own-person cursor, bounded by the
  thread's committed sequence; it does not claim that another person has read it.
- `ghaf_family_peer_permissions(p_family_id uuid) -> Permission[]`. Parents only;
  configuration exposes names/availability, never peer message contents.
- `ghaf_family_peer_permission(p_family_id uuid,p_first_child_id uuid,
p_second_child_id uuid,p_enabled boolean,p_request_id uuid) -> {ok:true}`.
  Parents only; enable requires both Children to have active paired identities.
- `ghaf_family_peer_leave(p_family_id uuid,p_thread_id uuid,
p_request_id uuid) -> {ok:true}`. Either participating Child can disable the
  conversation. Only a Parent can enable it again.

Family, session, participant and peer-enabled checks precede reads, sends and
receipt replays. Disabling peer messaging blocks retained history as well as new
sends at the server. A second family, sibling, different Parent, revoked device
or changed request body cannot use a known ID to bypass those checks.

Send keys are scoped to the stable sender and retained message window. Exact retry
returns the committed row, changed payload/thread rejects. New sends are limited
to 30 per minute per sender; exact committed retries do not consume that limit.
Bodies contain 1–500 Unicode characters and non-whitespace text. Ages 6–8 may send
only the four existing approved bilingual `help`, `ready`, `thanks`, `pause`
phrases with matching phrase IDs; older Children and Parents use bounded text.

Messages are readable for 30 days, matching Feature 016. The operator-only purge
RPC deletes expired rows; its schedule requires separate operator configuration
and execution evidence. Client retries expire after 24 hours. Read cursors and
empty thread configuration persist. No message bodies appear in command receipts,
logs, analytics, AI context or realtime payloads: clients subscribe only to the
authorized coarse family revision, then fetch their own threads/pages.

After the operator enables the reviewed `pg_cron` extension in this same project,
the retention job is `select cron.schedule('ghaf-main-family-message-retention',
'0 * * * *', 'select public.ghaf_family_message_purge_expired();');`.
This document does not run that command. Verify a completed job-run result after
the next hourly boundary; a schedule row alone is not purge execution evidence.
Provider backups/region retention remain separate configuration decisions. The
app's authenticated allowlist excludes this global operator function.

Invited Parent names resolve from their explicit family membership name or saved
account profile name. An unnamed Parent must save a real display name before its
conversation is exposed; email addresses and invented people are not substitutes.

## Client/controller seam

`createCloudMessagingController({service,userId,familyId,actor,makeRequestId?})`
uses the same `familyRequest`/`subscribeFamily` transport as cloud family. Methods:
`load()`, `open(threadId)`, `loadOlder()`, `send(body,phraseId?)`, `retry()`,
`setPeerPermission(first,second,enabled)`, `leavePeer()`, `refresh()`,
`setActive(boolean)`, `subscribe(listener)`, `getSnapshot()`, `dispose()`,
`close():boolean`, `discardPending():boolean`.
Actor is `{personId,role,ageBand}` from the current core snapshot. State includes
`status`, `inbox`, `permissions`, `threadId`, `messages`, `hasMore`, `busy`,
`error` and `pending` with request/body/phrase and `sending|failed` status.
Confirmed messages come only from validated server results; pending is visibly
separate. Disposing or changing identity prevents stale response publication and
clears in-memory drafts. An unavailable network leaves an explicit retry state.
The transport adapter pins `familyRequest(name,args,userId)` to the expected account.
Validated message senders must be the actor or the thread's explicit otherPersonId.
`send` and `retry` return true only after a validated committed server result.
Closing refuses while busy or pending; explicit discard clears a failed local
attempt without claiming cancellation of an already committed message.
