import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { expect, it } from 'vitest';

import {
  parseCloudMessage,
  parseMessageInbox,
  parseMessagePage,
  parseMessagePermissions,
} from '../../src/features/cloud-messaging/validation';
import type { CloudMessageThread, CloudMessagingActor } from '../../src/models/cloudMessaging';

const enabled = process.env.GHAF_FAMILY_MESSAGING_HOSTED_TEST === '1';
const approvedProject = 'bqcfynlbxevqlzbkimhy';
const approvedFixtureRun = '4d2450ee-924c-4666-8369-ba9fb84ef1b3';
const uuid = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
type Actor = { client: SupabaseClient; identity: CloudMessagingActor };

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Unexpected provider object');
  return value as Record<string, unknown>;
}
function identifier(value: unknown): string {
  if (typeof value !== 'string' || !uuid.test(value))
    throw new Error('Unexpected provider identity');
  return value;
}
async function success(
  operation: PromiseLike<{ data?: unknown; error: unknown }>,
  label: string,
): Promise<unknown> {
  let reply: { data?: unknown; error: unknown };
  try {
    reply = await operation;
  } catch {
    throw new Error(`${label}: provider transport failed`);
  }
  if (reply.error) {
    const code = record(reply.error).code;
    const safeCode =
      typeof code === 'string' && /^[A-Z0-9]{5,12}$/u.test(code) ? code : 'unavailable';
    throw new Error(`${label}: provider operation was not confirmed (${safeCode})`);
  }
  return reply.data;
}
async function denied(operation: PromiseLike<{ error: unknown }>, expectedCode = '42501') {
  let reply: { error: unknown };
  try {
    reply = await operation;
  } catch {
    throw new Error('Negative authorization check: provider transport failed');
  }
  expect(Boolean(reply.error)).toBe(true);
  expect(record(reply.error).code).toBe(expectedCode);
}

it.runIf(enabled)(
  'persists real human messages across independently authenticated Parent and Child clients in a new isolated family',
  async () => {
    const fixturePath = process.env.GHAF_FAMILY_TEST_FIXTURES;
    const cli = process.env.SUPABASE_CLI;
    if (!fixturePath || !cli || process.env.GHAF_TEST_PROJECT_REF !== approvedProject)
      throw new Error(
        'Explicit approved project, isolated fixture path and Supabase CLI are required',
      );
    const absoluteFixture = resolve(fixturePath);
    if (
      absoluteFixture !==
      resolve('.expo/family-verification', approvedFixtureRun, 'private-fixtures.json')
    )
      throw new Error(
        'This test only accepts the explicitly approved synthetic fixture invocation',
      );
    let fixture: Record<string, unknown>;
    try {
      fixture = record(JSON.parse(await readFile(absoluteFixture, 'utf8')));
    } catch {
      throw new Error('Unable to read isolated fixture metadata');
    }
    if (
      fixture.project !== approvedProject ||
      fixture.runId !== approvedFixtureRun ||
      !Array.isArray(fixture.users) ||
      !Array.isArray(fixture.families)
    )
      throw new Error('Unexpected fixture scope');
    const users = fixture.users.slice(0, 2).map((candidate, index) => {
      const value = record(candidate);
      if (
        value.email !==
          `ghaf-family-check-${approvedFixtureRun}-${index === 0 ? 'a' : 'b'}@example.test` ||
        typeof value.password !== 'string' ||
        !value.password
      )
        throw new Error('Only the exact synthetic fixture accounts are accepted');
      return { id: identifier(value.id), email: value.email as string, password: value.password };
    });
    if (users.length !== 2) throw new Error('Both isolated Parent fixture accounts are required');
    const originalFamilyB = identifier(fixture.families[1]);
    let publicKey: string;
    try {
      const keys: unknown = JSON.parse(
        execFileSync(
          cli,
          ['projects', 'api-keys', '--project-ref', approvedProject, '-o', 'json'],
          {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
            timeout: 30_000,
            windowsHide: true,
          },
        ),
      );
      const candidate = Array.isArray(keys)
        ? keys.map(record).find((key) => key.name === 'anon')?.api_key
        : undefined;
      if (typeof candidate !== 'string' || !candidate) throw new Error('Missing client key');
      publicKey = candidate;
    } catch {
      throw new Error('Unable to obtain the approved project client-safe key');
    }

    const runId = randomUUID();
    const artifact = join(dirname(absoluteFixture), `messaging-hosted-${runId}.json`);
    const report = {
      project: approvedProject,
      sourceFixtureRunId: approvedFixtureRun,
      runId,
      startedAt: new Date().toISOString(),
      finishedAt: null as string | null,
      status: 'RUNNING',
      stage: 'Restricted provider sign-in',
      passed: [] as string[],
      createdFamilyIds: [] as string[],
      createdChildIds: [] as string[],
      createdAnonymousUserIds: [] as string[],
      createdThreadIds: [] as string[],
      createdMessageIds: [] as string[],
      attemptedRequests: [] as { kind: string; requestId: string }[],
      limitations: [
        'Actual development Auth/Postgres using synthetic accounts. Independent SDK clients are not physical devices or native UI evidence.',
        'No message-retention schedule or provider-backup deletion is executed by this test.',
        'Original fixture family A, its Child identities and all family documents are untouched.',
      ],
    };
    await writeFile(artifact, JSON.stringify(report, null, 2), { flag: 'wx' });
    const persist = () => writeFile(artifact, JSON.stringify(report, null, 2));
    const trackRequest = async (kind: string, requestId: string = randomUUID()) => {
      if (!report.attemptedRequests.some((request) => request.requestId === requestId)) {
        report.attemptedRequests.push({ kind, requestId });
        await persist();
      }
      return requestId;
    };
    const clients: SupabaseClient[] = [];
    const make = () => {
      const client = createClient(`https://${approvedProject}.supabase.co`, publicKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        global: {
          fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(20_000) }),
        },
      });
      clients.push(client);
      return client;
    };
    const parentA: Actor = {
      client: make(),
      identity: { personId: users[0]!.id, role: 'parent', ageBand: null },
    };
    const parentA2: Actor = { client: make(), identity: parentA.identity };
    const parentB: Actor = {
      client: make(),
      identity: { personId: users[1]!.id, role: 'parent', ageBand: null },
    };
    let familyId: string | null = null;
    const requireFamily = () => {
      if (!familyId) throw new Error('Isolated messaging family is not created');
      return familyId;
    };
    const snapshot = async (client: SupabaseClient, id = requireFamily()) =>
      record(
        await success(client.rpc('ghaf_family_snapshot', { p_family_id: id }), 'Family snapshot'),
      );
    const command = async (
      body: Record<string, unknown>,
      target: string | null = requireFamily(),
    ) => {
      const requestId = await trackRequest(String(body.type));
      return record(
        await success(
          parentA.client.rpc('ghaf_family_command', {
            p_family_id: target,
            p_request_id: requestId,
            p_command: body,
          }),
          'Family command',
        ),
      );
    };
    const inbox = async (actor: Actor) => {
      const value = parseMessageInbox(
        await success(
          actor.client.rpc('ghaf_family_message_threads', { p_family_id: requireFamily() }),
          'Message inbox',
        ),
        actor.identity,
      );
      const created = value.threads
        .map((thread) => thread.id)
        .filter((id) => !report.createdThreadIds.includes(id));
      if (created.length) {
        report.createdThreadIds.push(...created);
        await persist();
      }
      return value;
    };
    const threadFor = async (actor: Actor, id: string) => {
      const thread = (await inbox(actor)).threads.find((item) => item.id === id);
      if (!thread) throw new Error('Expected authorized conversation');
      return thread;
    };
    const page = async (actor: Actor, thread: CloudMessageThread) =>
      parseMessagePage(
        await success(
          actor.client.rpc('ghaf_family_message_page', {
            p_family_id: requireFamily(),
            p_thread_id: thread.id,
            p_before: null,
            p_after: null,
            p_limit: 30,
          }),
          'Message page',
        ),
        thread,
        actor.identity,
      );
    const rawSend = (
      actor: Actor,
      threadId: string,
      requestId: string,
      body: string,
      phraseId: string | null = null,
    ) =>
      actor.client.rpc('ghaf_family_message_send', {
        p_family_id: requireFamily(),
        p_thread_id: threadId,
        p_request_id: requestId,
        p_body: body,
        p_phrase_id: phraseId,
      });
    const send = async (
      actor: Actor,
      thread: CloudMessageThread,
      body: string,
      phraseId: string | null = null,
      requestId: string = randomUUID(),
    ) => {
      await trackRequest('message_send', requestId);
      const saved = parseCloudMessage(
        await success(rawSend(actor, thread.id, requestId, body, phraseId), 'Message send'),
        thread,
        actor.identity,
      );
      if (!report.createdMessageIds.includes(saved.id)) {
        report.createdMessageIds.push(saved.id);
        await persist();
      }
      expect(saved.senderId).toBe(actor.identity.personId);
      expect(saved.body).toBe(body);
      expect(saved.clientKey).toBe(requestId);
      return saved;
    };
    const permissions = async () =>
      parseMessagePermissions(
        await success(
          parentA.client.rpc('ghaf_family_peer_permissions', { p_family_id: requireFamily() }),
          'Guardian permissions',
        ),
      );
    const setPeer = async (first: string, second: string, value: boolean) => {
      const requestId = await trackRequest('peer_permission');
      expect(
        await success(
          parentA.client.rpc('ghaf_family_peer_permission', {
            p_family_id: requireFamily(),
            p_first_child_id: first,
            p_second_child_id: second,
            p_enabled: value,
            p_request_id: requestId,
          }),
          'Guardian permission mutation',
        ),
      ).toEqual({ ok: true });
      for (const permission of await permissions()) {
        if (permission.threadId && !report.createdThreadIds.includes(permission.threadId)) {
          report.createdThreadIds.push(permission.threadId);
          await persist();
        }
      }
    };
    const pair = async (childId: string, ageBand: '6_8' | '9_11'): Promise<Actor> => {
      const child: Actor = {
        client: make(),
        identity: { personId: childId, role: 'child', ageBand },
      };
      const anonymous = record(
        await success(child.client.auth.signInAnonymously(), 'Fresh Child provider identity'),
      );
      const userId = identifier(record(anonymous.user).id);
      report.createdAnonymousUserIds.push(userId);
      await persist();
      expect(userId).not.toBe(users[0]!.id);
      expect(record(anonymous.user).is_anonymous).toBe(true);
      await denied(
        child.client.rpc('ghaf_family_message_threads', { p_family_id: requireFamily() }),
      );
      const invitation = record((await command({ type: 'invite_child', childId })).result);
      if (typeof invitation.token !== 'string' || !invitation.token)
        throw new Error('Expected one-use Parent invitation');
      const requestId = await trackRequest('redeem_invitation');
      await success(
        child.client.rpc('ghaf_redeem_family_invite', {
          p_token: invitation.token,
          p_request_id: requestId,
        }),
        'Parent-approved Child pairing',
      );
      const actual = record((await snapshot(child.client)).actor);
      expect(actual).toMatchObject({ userId, role: 'child', familyId: requireFamily(), childId });
      return child;
    };
    const signIn = async (actor: Actor, index: number) => {
      const user = users[index];
      if (!user) throw new Error('Unexpected fixture account index');
      const value = record(
        await success(
          actor.client.auth.signInWithPassword({ email: user.email, password: user.password }),
          'Restricted Parent sign-in',
        ),
      );
      expect(record(value.user).id).toBe(user.id);
    };

    try {
      await signIn(parentA, 0);
      await signIn(parentA2, 0);
      await signIn(parentB, 1);
      const originalB = await snapshot(parentB.client, originalFamilyB);
      report.stage = 'Fresh isolated family and secure Child pairing';
      await persist();
      const created = await command(
        {
          type: 'create_family',
          name: `Messaging verification ${runId.slice(0, 8)}`,
          displayName: 'Synthetic messaging Parent',
        },
        null,
      );
      familyId = identifier(record(record(created.snapshot).family).id);
      report.createdFamilyIds.push(familyId);
      await persist();
      expect(fixture.families).not.toContain(familyId);
      const fresh = record(created.snapshot);
      for (const key of ['children', 'tasks', 'recognitions', 'memories'])
        expect(fresh[key]).toEqual([]);
      expect(fresh.familyCanopyContributions).toBe(0);
      expect((await inbox(parentA)).threads).toEqual([]);
      const childIds: string[] = [];
      for (const [name, ageBand] of [
        ['Synthetic younger Child', '6_8'],
        ['Synthetic older Child', '9_11'],
      ] as const) {
        const childId = identifier(
          record((await command({ type: 'add_child', displayName: name, ageBand })).result).childId,
        );
        report.createdChildIds.push(childId);
        childIds.push(childId);
        await persist();
      }
      const youngId = childIds[0]!;
      const olderId = childIds[1]!;
      const young = await pair(youngId, '6_8');
      const older = await pair(olderId, '9_11');
      const parentThread = (await inbox(parentA)).threads.find(
        (thread) => thread.childId === youngId,
      );
      if (!parentThread) throw new Error('Expected real Parent/Child thread');
      const youngThread = await threadFor(young, parentThread.id);
      expect(youngThread.otherPersonId).toBe(users[0]!.id);
      expect((await page(parentA, parentThread)).messages).toEqual([]);
      report.passed.push(
        'Fresh isolated family contains zero fabricated messages/progress; two real anonymous Child sessions require Parent pairing',
      );
      await persist();

      report.stage = 'Persisted bidirectional delivery and exact retries';
      await persist();
      const parentRequest = randomUUID();
      const parentMessage = await send(
        parentA,
        parentThread,
        'Our agreed family activity is ready.',
        null,
        parentRequest,
      );
      expect(
        await send(
          parentA,
          parentThread,
          'Our agreed family activity is ready.',
          null,
          parentRequest,
        ),
      ).toEqual(parentMessage);
      const youngInbox = await threadFor(young, parentThread.id);
      expect(youngInbox.unreadCount).toBe(1);
      expect((await page(young, youngInbox)).messages).toEqual([parentMessage]);
      await denied(
        rawSend(young, youngThread.id, randomUUID(), 'Unrestricted youngest-band text'),
        'PT400',
      );
      await denied(rawSend(young, youngThread.id, randomUUID(), 'Forged phrase', 'help'), 'PT400');
      const childMessage = await send(young, youngThread, 'هل يمكنك مساعدتي؟', 'help');
      expect((await page(parentA2, await threadFor(parentA2, parentThread.id))).messages).toEqual([
        parentMessage,
        childMessage,
      ]);
      expect(childMessage.sequence).toBe(parentMessage.sequence + 1);
      expect(
        await success(
          young.client.rpc('ghaf_family_message_mark_read', {
            p_family_id: requireFamily(),
            p_thread_id: parentThread.id,
            p_sequence: childMessage.sequence,
          }),
          'Own read cursor',
        ),
      ).toEqual({ ok: true });
      expect((await threadFor(young, parentThread.id)).unreadCount).toBe(0);
      const beforeDenials = await page(parentA2, parentThread);
      const beforeDeniedSnapshot = await snapshot(parentA2.client);
      await denied(
        rawSend(parentA, parentThread.id, parentRequest, 'A changed retry body'),
        'PT409',
      );
      await denied(
        parentB.client.rpc('ghaf_family_message_page', {
          p_family_id: requireFamily(),
          p_thread_id: parentThread.id,
        }),
      );
      await denied(rawSend(parentB, parentThread.id, randomUUID(), 'Cross-family write'));
      await denied(
        older.client.rpc('ghaf_family_message_page', {
          p_family_id: requireFamily(),
          p_thread_id: parentThread.id,
        }),
      );
      await denied(rawSend(older, parentThread.id, randomUUID(), 'Wrong sibling participant'));
      await denied(
        young.client.from('app_family_messages').select('id').eq('thread_id', parentThread.id),
      );
      expect(await page(parentA2, parentThread)).toEqual(beforeDenials);
      expect((await snapshot(parentA2.client)).family).toEqual(beforeDeniedSnapshot.family);
      const afterB = await snapshot(parentB.client, originalFamilyB);
      for (const key of [
        'family',
        'children',
        'tasks',
        'recognitions',
        'memories',
        'familyCanopyContributions',
      ])
        expect(afterB[key]).toEqual(originalB[key]);
      report.passed.push(
        'Parent and Child messages are read by independent clients; send retries are unique, order/read cursor persist, and cross-family/nonparticipant attacks change neither target',
      );
      await persist();

      report.stage = 'Independent-client reload and second paired Child device';
      await persist();
      await success(
        parentA2.client.auth.signOut({ scope: 'local' }),
        'Independent Parent sign-out',
      );
      const restartedParent: Actor = { client: make(), identity: parentA.identity };
      await signIn(restartedParent, 0);
      expect(
        (await page(restartedParent, await threadFor(restartedParent, parentThread.id))).messages,
      ).toEqual([parentMessage, childMessage]);
      const secondYoungDevice = await pair(youngId, '6_8');
      const secondThread = await threadFor(secondYoungDevice, parentThread.id);
      expect(secondThread.readSequence).toBe(childMessage.sequence);
      expect((await page(secondYoungDevice, secondThread)).messages).toEqual([
        parentMessage,
        childMessage,
      ]);
      expect(
        await send(
          secondYoungDevice,
          secondThread,
          childMessage.body,
          'help',
          childMessage.clientKey,
        ),
      ).toEqual(childMessage);
      report.passed.push(
        'A fresh Parent SDK instance and separately paired anonymous Child identity restore persisted conversation/read state; the managed Child send key remains idempotent',
      );
      await persist();

      report.stage = 'Guardian-controlled peer conversations and server-enforced disable';
      await persist();
      const initialPermissions = await permissions();
      expect(initialPermissions).toHaveLength(1);
      expect(initialPermissions[0]).toMatchObject({
        enabled: false,
        available: true,
        threadId: null,
      });
      await denied(
        young.client.rpc('ghaf_family_peer_permission', {
          p_family_id: requireFamily(),
          p_first_child_id: youngId,
          p_second_child_id: olderId,
          p_enabled: true,
          p_request_id: randomUUID(),
        }),
      );
      await setPeer(youngId, olderId, true);
      const peerId = (await permissions())[0]?.threadId;
      if (!peerId) throw new Error('Expected authorized peer conversation identity');
      const youngPeer = await threadFor(young, peerId);
      const olderPeer = await threadFor(older, peerId);
      const peerMessage = await send(young, youngPeer, 'I am ready.', 'ready');
      const olderReply = await send(older, olderPeer, 'I can join the agreed activity.');
      const peerBaseline = await page(older, olderPeer);
      expect(peerBaseline.messages).toEqual([peerMessage, olderReply]);
      await denied(
        parentA.client.rpc('ghaf_family_message_page', {
          p_family_id: requireFamily(),
          p_thread_id: peerId,
        }),
      );
      await denied(
        rawSend(parentA, peerId, randomUUID(), 'Parent cannot join this peer conversation'),
      );
      expect(await page(older, olderPeer)).toEqual(peerBaseline);
      await setPeer(youngId, olderId, false);
      await denied(
        young.client.rpc('ghaf_family_message_page', {
          p_family_id: requireFamily(),
          p_thread_id: peerId,
        }),
      );
      await denied(rawSend(young, peerId, peerMessage.clientKey, peerMessage.body, 'ready'));
      await denied(rawSend(older, peerId, randomUUID(), 'Disabled peer send'));
      expect((await inbox(young)).threads.some((thread) => thread.id === peerId)).toBe(false);
      await setPeer(youngId, olderId, true);
      expect(await page(older, await threadFor(older, peerId))).toEqual(peerBaseline);
      const leaveRequest = await trackRequest('peer_leave');
      expect(
        await success(
          older.client.rpc('ghaf_family_peer_leave', {
            p_family_id: requireFamily(),
            p_thread_id: peerId,
            p_request_id: leaveRequest,
          }),
          'Child peer exit',
        ),
      ).toEqual({ ok: true });
      await denied(
        young.client.rpc('ghaf_family_message_page', {
          p_family_id: requireFamily(),
          p_thread_id: peerId,
        }),
      );
      expect((await page(restartedParent, parentThread)).messages).toEqual([
        parentMessage,
        childMessage,
      ]);
      const finalFamily = await snapshot(restartedParent.client);
      expect(finalFamily.tasks).toEqual([]);
      expect(finalFamily.recognitions).toEqual([]);
      expect(finalFamily.memories).toEqual([]);
      expect(finalFamily.familyCanopyContributions).toBe(0);
      report.passed.push(
        'Only guardian-enabled sibling participants exchange bounded real text; Parent/nonparticipant reads and disabled sends/retries fail, retained content is unchanged, and either Child may disable the conversation',
      );
      report.status = 'PASS';
    } finally {
      if (report.status !== 'PASS') report.status = 'FAIL';
      report.finishedAt = new Date().toISOString();
      await Promise.allSettled(
        clients.map(async (client) => {
          client.auth.stopAutoRefresh();
          await client.removeAllChannels();
          await client.auth.signOut({ scope: 'local' });
        }),
      );
      // No remote family, Child, message or anonymous user is deleted by this test.
      await persist();
    }
  },
  420_000,
);
