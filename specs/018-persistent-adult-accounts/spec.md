# Feature 018: Persistent adult account data

The later [primary workspace and stability amendment](stability-and-primary-workspace.md)
authorizes promoting real family/task/study data into the primary signed-in experience and
repairing the reported family, task, language and startup failures. Historical evidence below
remains attributed to the earlier increment.

Authority: the user's 2026-09-14 request for real login/logout, persistent sessions,
account-owned backend data, independent-device access and isolation on `main`.
The initial increment did not authorize publication or hosted deployment. The
subsequent backend-readiness request authorizes updating existing backend schema,
committing and pushing reviewed work on main. Paid resources, destructive
migrations and public rollout remain outside this maintenance scope.

## First complete increment

Reuse Feature 006's real Supabase adult identity, verification/recovery, approval
and SecureStore lifecycle. Add a private adult profile (display name and preferred
language) owned by `auth.users.id`, accessible after verified approved sign-in.
The user's scope answer also includes family, tasks and study data. The first
supported cloud workspace contains a family name, member nicknames, Parent-managed
task titles/completion and study subjects/next steps/completion. It appears at the
existing authenticated entry using existing controls. Its records have server UUIDs,
ownership and revisions. It does not fabricate Seeds, rewards, Child approval,
academic-goal evidence or restore synthetic access sessions.

The existing sample journey remains an explicit separate action. No local sample
record is uploaded automatically; the migration policy for this increment is to
leave device-only records intact and start an empty server workspace. Import and
full reward-bearing task/academic-goal restoration are not implemented by this slice.
Real account operations have no mock-auth fallback.

## Requirements

1. Existing real registration, verification/resend, sign-in, recovery and local
   sign-out remain accessible. Passwords are never normalized, persisted or logged.
2. Restore/validate the session before protected content. Network errors retain
   potentially recoverable credentials but withhold protected data and allow retry.
3. Initialize one profile per provider UUID idempotently, without overwriting an
   existing name/language/revision. Read and edit use authenticated backend authority.
4. Save requires an expected server revision; a stale edit fails explicitly.
   Refresh retrieves server data; no offline queued writes or private profile cache.
5. Load after sign-in/restoration, refresh on foreground/manual refresh, and apply
   only results belonging to the current account/lifecycle generation. Old request
   completion must never populate a new user's view or undo local logout.
6. Ordinary logout ends the current device session and clears private app state;
   it does not delete cloud data or revoke other devices. Remote revocation failure
   is distinguished from local access removal and durable-storage failure.
7. Independent messaging credentials must not survive an adult account switch as
   access to the previous person's content. Existing separate messaging identity
   is not silently linked by email or copied into the adult provider.
8. Profile policies deny anonymous/cross-account read, write and delete. Client
   owner/role claims are not authority. Keep admin keys outside the app.
9. Bilingual UI uses existing controls, keyboard behavior, live motion and Android
   Back. Loading/error/conflict/saved states describe actual provider results.
10. The backend creates the workspace once. Family, member, task and study edits
    require its expected revision. Commands derive ownership from authentication,
    validate exact input fields and reject member/record IDs outside this workspace.
    Completion here is a Parent-managed planning record, not an award authority.
11. Bound workspace size to 20 members, 200 tasks and 200 study plans. Validate
    names (1–80 characters), titles/subjects (1–160) and next steps (1–300).
    Do not queue writes offline or copy credentials/device permissions into data.
12. Enforce current provider account status on protected profile/workspace reads
    and writes: deny banned, soft-deleted and anonymous identities even if an
    older access JWT is still cryptographically valid. Expired bans may recover
    after normal verified/approved access checks. Ordinary session-specific
    logout retains the documented access-JWT expiry behavior.

## Acceptance

Exercise real local/provider registration and independent sign-ins with synthetic
test accounts. Device/client A saves a profile, B reads the same UUID/profile and
saves another revision, A refreshes it. Repeat for family, members, tasks and study
plans, including completion and cross-workspace ID attacks. A logs out while B remains authorized; A
signs back in and retrieves the same data. Another account cannot read/write/delete
A's row, including forged request parameters. Test refresh/network/storage failures,
logout during requests, restart persistence, keyboard/Back and rapid submits.

Use actual Android Emulator evidence where possible. Mocks prove behavior only;
missing local/hosted configuration and independent-device gates remain explicitly
BLOCKED/NOT RUN. Never count cloud identity alone as saved-data synchronization.

The owner subsequently authorized two installations on the same emulator as an
alternative to the disk-blocked second AVD. A test-only second application ID may
use the same source/backend with its own Android UID, data directory, Keystore
scope, launcher label and URL scheme. Both clients must sign in independently;
copying app storage or session tokens is prohibited. Verify two-way saved data,
restart persistence and logout isolation. Record this as two native installations
on one device; physical/two-device behavior remains a separate acceptance gate.
