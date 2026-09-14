# Family documents v1

`ghaf_family_documents(p_family_id uuid)` returns permitted rows from
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

`createCloudDocumentsController` owns async loading, pending/conflict/failure, stable
request retries, authority validation, realtime refresh and disposal. The root composes
it alongside the core family controller and mounts `CloudStudyView`; child selection is
supplied from the core's verified family snapshot. Existing local/demo routes are intact.

The owner explicitly authorizes the real-account learning route independently of the
historical default-off demo UI flag. Its existing 132-Seed server unlock, finite authored
content, accessible alternative and zero-award rule remain intact. Legacy demo flags are
unchanged; content/source/human acceptance remains separately recorded evidence.
