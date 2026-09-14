# Family documents v1

The application reads `ghaf_family_document_snapshot(p_family_id uuid)` (migration012),
a scalar JSON object containing `{schemaVersion:1,actor:{userId,role,familyId,childId},
familyId,revision,documentCount,documents:[permitted snake-case rows]}`. It uses the
existing verified account transport. The client checks the exact account/family/role,
all row ownership, and count before accepting the complete collection. A missing
migration fails visibly; the app never falls back to a possibly truncated row list.

The POST RPC takes a shared family lock and rechecks membership before collecting rows,
so document mutations cannot interleave between the revision and collection read.
It is explicitly volatile to permit those locks through PostgREST. It writes no data.
The existing API row limit stays unchanged: the document array is nested in one JSON
result, so up to100 study plans plus100 goals and the other bounded documents remain
available together. Scalar and table-returning RPC behavior follows the official
[PostgREST functions contract](https://docs.postgrest.org/en/stable/references/api/functions.html).

`ghaf_family_documents(p_family_id uuid)` remains compatible for SQL/internal callers and
explicitly paginated older clients; it returns permitted rows from
`app_family_documents`: `{id,family_id,child_id,kind,revision,payload,created_at,updated_at}`.
IDs are server UUIDs; study payload IDs retain their bounded opaque command IDs.
The client validates snake-case rows and exposes `CloudFamilyDocument` camel-case DTOs.

`ghaf_family_document_command(p_family_id uuid,p_request_id uuid,p_command jsonb)`
returns `{documents:[currently permitted rows],result:{documentId,revision}}`.
The request UUID binds to the current authenticated actor, family and exact JSON command.
Authorization is checked before receipt lookup, after acquiring the family lock, and on
every read. Replays return current permitted rows, never a cached private snapshot.

Exact command types are declared in `src/models/cloudFamilyDocuments.ts`:

- `study {expectedRevision,command:StudyCommand}`: expected document revision is zero
  on create. Nested goal expectedRevision remains the separate agreed-terms revision.
- `connections.save {expectedRevision,input:FamilyConnectionDirectory}`: Parent-only
  family singleton; no prefilled people. Maximum six optional named relatives, no contacts.
- `preferences.save {childId,expectedRevision,input:CloudProfilePreferences}`: Parent
  edits one active in-family Child's explicit preferences; Child can read their own.
- `template.save {id:null|uuid,expectedRevision,input:CloudSavedTemplate}` and
  `template.delete {id,expectedRevision}`: Parent-only, twenty templates, bounded
  bilingual wording. Saved wording changes no task authority until reviewed/assigned.
- `learning.start/step/check/complete`: current Child only, fixed Mangrove package,
  equal-credit story/accessible routes, server-derived unlock and one completion.

Study is the existing full plan/goal/prize domain, not the legacy adult checkbox
workspace. Roles/time/ownership are server-derived. Exact-revision agreement, immutable
accepted terms, immutable submission/review evidence, Parent-only confirmation and
`promised → unlocked → given` are retained. Study and learning never issue Seeds,
landscape/canopy/League or private Family Reward credit.

Direct client writes and private receipt reads are revoked. Parent-only documents are
never returned to Children; Child documents are limited to the caller's managed profile.
There is no full-client-state upload, automatic demo import, transcript persistence,
fake initial family, or fallback from unavailable Supabase to sample success.

The additive `20260915000600_document_hardening.sql` validates a composite Child/family
foreign key without rewriting existing rows. New text must be trimmed. Template
deduplication normalizes both existing and submitted wording under the family lock,
so historical surrounding spaces cannot bypass duplicate prevention. Existing text is
preserved on reads; the migration does not rename or replace a family's content.

`createCloudDocumentsController` owns async loading, pending/conflict/failure, stable
request retries, authority validation, realtime refresh and disposal. The root composes
it alongside the core family controller and mounts `CloudStudyView`; child selection is
supplied from the core's verified family snapshot. Existing local/demo routes are intact.
Its transport must be bound to the verified account user ID. Session/identity denials
clear private records, pending requests and realtime subscriptions; an uncertain network
result keeps the original request UUID for explicit retry, including after a fresh read.

The owner explicitly authorizes the real-account learning route independently of the
historical default-off demo UI flag. Its existing 132-Seed server unlock, finite authored
content, accessible alternative and zero-award rule remain intact. Legacy demo flags are
unchanged; content/source/human acceptance remains separately recorded evidence.
