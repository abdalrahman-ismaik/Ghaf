# Family Messaging v1 API / UI contract

Provider Auth endpoints: `/auth/v1/token?grant_type=password`, `/auth/v1/signup` for anonymous Child
installation, `/auth/v1/token?grant_type=refresh_token`, `/auth/v1/user`, `/auth/v1/logout?scope=local`.
Use HTTPS, publishable key as `apikey`, and user bearer access token for authenticated RPCs. No
service-role key, Parent provisioning, role claim or fake OTP endpoint exists in the mobile bundle.

PostgREST RPC POST `/rest/v1/rpc/<name>`; parameters below are JSON. Responses use camelCase fields.
Every RPC except enrollment/register requires the active device. Those exceptions still require
verified active auth user/session and their appropriate allowlist/invitation. Only authenticated
provider JWTs may call RPCs; anonymous API-key-only requests have no permission. Narrow failures
return a safe error identifier, never raw SQL or private rows.

| RPC                | Parameters                                        | Result                                                                                 |
| ------------------ | ------------------------------------------------- | -------------------------------------------------------------------------------------- |
| fm_register_parent | p_device_label                                    | Context                                                                                |
| fm_context         | none                                              | Context                                                                                |
| fm_children        | none                                              | Child[] (Parent only)                                                                  |
| fm_create_child    | p_name,p_age_band                                 | Child and its one thread (Parent only)                                                 |
| fm_invite          | p_child_id                                        | {code,expiresAt,childName} (Parent only)                                               |
| fm_enroll          | p_code,p_device_label                             | Context; atomic one-use invitation, safe same-session retry                            |
| fm_threads         | none                                              | Thread[] only authorized relationships                                                 |
| fm_messages        | p_thread_id,p_before=null,p_after=null,p_limit=30 | Message[] ascending; initial latest page; before previous page; after next page; max50 |
| fm_send            | p_thread_id,p_client_key,p_body,p_phrase_id=null  | original/new Message; max500Unicodecodepoints; age6_8 exact curated phrase only        |
| fm_devices         | none                                              | Device[] authorized Parent household only                                              |
| fm_revoke_device   | p_device_id                                       | success; Parent-owned device or self                                                   |
| fm_revoke_account  | none                                              | success; Parent disables whole messaging account/relationships/devices/invites         |
| fm_purge_expired   | none                                              | deleted count; operator/cron only, never authenticated public execution                |

Context: `{role:'parent'|'child',personId,displayName,householdId,deviceId,ageBand:null|'6_8'|'9_11'|'12_14'}`.
Child: `{id,displayName,ageBand,threadId,active}`. Thread: `{id,childId,otherName,otherRole:'parent'|'child'}`.
Message: `{id,threadId,senderId,body,sequence,createdAt,clientKey}`; sequence is positive safe integer.
Device: `{id,personName,role,label,active,current}`. Void operations return `{ok:true}`.
Safe RPC errors use `{code:<identifier>,message:<same identifier>}` with an appropriate4xx status.
Enrollment returns this response rather than raising so failed-attempt counters commit.
Errors include `not_authenticated`, `not_authorized`, `access_revoked`, `invalid_invite`,
`rate_limited`, `invalid_message`, `idempotency_conflict`, `invalid_request` and `service_unavailable`.
Client maps unexpected HTTP/shape failures safely; POST send timeout/malformed success/5xx is unknown,
not fake failure/success. Definitive4xx denial is failed/revoked. No automatic retry of mutations.

Child6_8 phrases (server allowlist and bilingual resources tested for exact parity):
`help`: «هل يمكنك مساعدتي؟» / “Can you help me?”;
`ready`: «أنا مستعدّ.» / “I am ready.”;
`thanks`: «شكرًا لمساعدتك.» / “Thank you for helping.”;
`pause`: «أحتاج إلى استراحة قصيرة.» / “I need a short break.”
All other permitted users may use these or edit ordinary plain text. Edited text loses phraseId.
No server message goes to any assistant endpoint. A typed “approved/done” has no task effect.

Helper bridge: no URL/body transcript. Place only the generic `help` phrase in an ephemeral draft
intent; validate current local task/profile/epoch and real Child role/auth epoch. If identities are
unbound, present the actual real identity and explicit human-draft review. Do not send from a cached
Parent session on a Child surface. Ineligible or changed local task clears intent. Backend accepts
plain text, never that local task snapshot as authorization or attachment.

UI has accessible real participant header, history, true state text, quick phrases, bounded composer,
explicit Send. At48dp minimum controls, AR/EN wrapping and keyboard avoidance, Back/cancel preserve
only same-identity memory draft. No call, presence, unread, receipt or attachment controls are shown.
