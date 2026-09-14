import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { expect, it } from 'vitest';

import {
  parseCloudFamilyInvite,
  parseCloudFamilyResponse,
  parseCloudFamilySnapshot,
} from '../../src/features/cloud-family/validation';
import { parseCloudGrowthSnapshot } from '../../src/features/cloud-growth/validation';
import type { CloudFamilyCommand } from '../../src/models/cloudFamily';

const enabled = process.env.GHAF_FAMILY_REALTIME_HOSTED_TEST === '1';
const approvedProject = 'bqcfynlbxevqlzbkimhy';
const approvedFixtureRun = '4d2450ee-924c-4666-8369-ba9fb84ef1b3';
const uuid = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
type Client = SupabaseClient;

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
async function denied(operation: PromiseLike<{ error: unknown }>) {
  let reply: { error: unknown };
  try {
    reply = await operation;
  } catch {
    throw new Error('Negative authorization check: provider transport failed');
  }
  expect(Boolean(reply.error)).toBe(true);
  expect(record(reply.error).code).toBe('42501');
}

async function observeFamily(client: Client, familyId: string, label: string) {
  const revisions: number[] = [];
  const listeners = new Set<() => void>();
  const channel = client.channel(`ghaf-realtime-check:${randomUUID()}`);
  let invalidPayload = false;
  let disconnected = false;
  let subscriptionCount = 0;
  await new Promise<void>((resolveReady, rejectReady) => {
    const timer = setTimeout(
      () => rejectReady(new Error(`${label}: WebSocket subscription was not confirmed`)),
      20_000,
    );
    channel
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'app_families', filter: `id=eq.${familyId}` },
        (event) => {
          // Only coarse identity and revision are observed; family content is never logged.
          const row = event.new;
          if (
            row.id !== familyId ||
            typeof row.revision !== 'number' ||
            !Number.isSafeInteger(row.revision) ||
            row.revision < 0
          ) {
            invalidPayload = true;
          } else {
            revisions.push(row.revision);
          }
          for (const notify of listeners) notify();
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          subscriptionCount += 1;
          disconnected = false;
          clearTimeout(timer);
          resolveReady();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          disconnected = true;
          clearTimeout(timer);
          rejectReady(new Error(`${label}: WebSocket subscription unavailable (${status})`));
        }
      });
  });
  return {
    revisions,
    healthy: () => !invalidPayload && !disconnected && subscriptionCount > 0,
    async waitForRevision(revision: number) {
      await new Promise<void>((resolveEvent, rejectEvent) => {
        const finish = () => {
          if (!invalidPayload && !revisions.includes(revision)) return;
          clearTimeout(timer);
          listeners.delete(finish);
          if (invalidPayload) rejectEvent(new Error(`${label}: unexpected coarse event`));
          else resolveEvent();
        };
        const timer = setTimeout(() => {
          listeners.delete(finish);
          rejectEvent(new Error(`${label}: actual database UPDATE event was not received`));
        }, 20_000);
        listeners.add(finish);
        finish();
      });
    },
    async close() {
      const status = await client.removeChannel(channel);
      if (status !== 'ok') throw new Error(`${label}: channel cleanup was not confirmed`);
    },
  };
}

it.runIf(enabled)(
  'receives hosted family updates through independent WebSockets, rereads authoritative state and rejects foreign or revoked access',
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
      throw new Error('Only the explicitly approved synthetic fixture invocation is accepted');
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
    const parentA = users[0];
    const parentB = users[1];
    if (!parentA || !parentB) throw new Error('Both isolated Parent accounts are required');
    const originalFamilyIds = fixture.families.map(identifier);
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
    const artifact = join(dirname(absoluteFixture), `realtime-hosted-${runId}.json`);
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
      observations: [] as { label: string; revision: number; notificationLatencyMs: number }[],
      outsiderObservedUpdates: 0,
      outsiderObservationMs: 0,
      limitations: [
        'Real hosted Auth, Postgres and independent SDK WebSockets with synthetic records; no physical-device or mobile-background verification.',
        'Foreign subscription isolation is observed for the recorded window, with separate authoritative read denials.',
        'A revoked Child need not receive the revocation UPDATE; a subsequent authoritative read must deny access.',
        'Only the new invocation-owned family is mutated. Its IDs remain recorded for separately authorized cleanup.',
      ],
    };
    await writeFile(artifact, JSON.stringify(report, null, 2), { flag: 'wx' });
    const clients: Client[] = [];
    const make = (): Client => {
      const client = createClient(`https://${approvedProject}.supabase.co`, publicKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        global: {
          fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(20_000) }),
        },
      });
      clients.push(client);
      return client;
    };
    const checkpoint = async (stage: string) => {
      report.stage = stage;
      await writeFile(artifact, JSON.stringify(report, null, 2));
    };
    try {
      const writer = make();
      const reader = make();
      const outsider = make();
      for (const [client, account] of [
        [writer, parentA],
        [reader, parentA],
        [outsider, parentB],
      ] as const) {
        const signedIn = record(
          await success(
            client.auth.signInWithPassword({ email: account.email, password: account.password }),
            'Independent synthetic account sign-in',
          ),
        );
        expect(identifier(record(signedIn.user).id)).toBe(account.id);
      }
      const create = parseCloudFamilyResponse(
        await success(
          writer.rpc('ghaf_family_command', {
            p_family_id: null,
            p_request_id: randomUUID(),
            p_command: {
              type: 'create_family',
              name: `Realtime ${runId}`,
              displayName: 'Realtime test Parent',
            },
          }),
          'Create invocation-owned family',
        ),
        parentA.id,
      );
      const familyId = identifier(create.snapshot.family?.id);
      expect(originalFamilyIds.includes(familyId)).toBe(false);
      report.createdFamilyIds.push(familyId);
      await checkpoint('Fresh family authoritative state');
      const command = async (value: CloudFamilyCommand) =>
        parseCloudFamilyResponse(
          await success(
            writer.rpc('ghaf_family_command', {
              p_family_id: familyId,
              p_request_id: randomUUID(),
              p_command: value,
            }),
            'Invocation-owned family command',
          ),
          parentA.id,
        );
      const read = async (client: Client, userId: string) =>
        parseCloudFamilySnapshot(
          await success(
            client.rpc('ghaf_family_snapshot', { p_family_id: familyId }),
            'Independent authoritative family read',
          ),
          userId,
        );
      const growth = async (client: Client, userId: string) =>
        parseCloudGrowthSnapshot(
          await success(
            client.rpc('ghaf_family_growth', { p_family_id: familyId }),
            'Independent authoritative growth read',
          ),
          userId,
          familyId,
        );
      const fresh = await read(reader, parentA.id);
      expect(fresh.family?.id).toBe(familyId);
      expect(fresh.children).toHaveLength(0);
      expect(fresh.tasks).toHaveLength(0);
      expect(fresh.recognitions).toHaveLength(0);
      expect(fresh.memories).toHaveLength(0);
      expect(fresh.customTemplates).toHaveLength(0);
      expect(fresh.familyCanopyContributions).toBe(0);
      const freshGrowth = await growth(reader, parentA.id);
      expect(freshGrowth.children).toHaveLength(0);
      expect(freshGrowth.rewards).toHaveLength(0);
      expect(freshGrowth.league).toBeNull();
      report.passed.push('Fresh family and growth reads contain no imported demonstration history');
      await denied(outsider.rpc('ghaf_family_snapshot', { p_family_id: familyId }));
      await denied(outsider.rpc('ghaf_family_growth', { p_family_id: familyId }));

      await checkpoint('Parent and foreign WebSocket subscriptions');
      let parentObserver = await observeFamily(reader, familyId, 'Authorized Parent');
      const foreignObserver = await observeFamily(outsider, familyId, 'Foreign Parent');
      const foreignStarted = Date.now();
      const renamed = async (
        observer: Awaited<ReturnType<typeof observeFamily>>,
        observingClient: Client,
        observingUserId: string,
        label: string,
      ) => {
        const started = Date.now();
        const name = `Realtime ${runId} ${label}`;
        const response = await command({ type: 'rename_family', name });
        const revision = response.snapshot.family?.revision;
        if (revision === undefined) throw new Error('Missing committed family revision');
        await observer.waitForRevision(revision);
        expect(observer.healthy()).toBe(true);
        const authoritative = await read(observingClient, observingUserId);
        expect(authoritative.family?.id).toBe(familyId);
        expect(authoritative.family?.revision).toBe(revision);
        expect(authoritative.family?.name).toBe(name);
        report.observations.push({
          label,
          revision,
          notificationLatencyMs: Date.now() - started,
        });
      };
      await renamed(parentObserver, reader, parentA.id, 'Parent update');
      report.passed.push(
        'Actual Parent WebSocket UPDATE followed by independent authoritative read',
      );
      await checkpoint('Parent socket disconnect and new subscription');
      await parentObserver.close();
      expect(await reader.realtime.disconnect()).toBe('ok');
      reader.realtime.connect();
      parentObserver = await observeFamily(reader, familyId, 'Reconnected Parent');
      await renamed(parentObserver, reader, parentA.id, 'Reconnected update');
      report.passed.push(
        'Socket disconnect, reconnect and resubscription receive the next committed update',
      );

      await checkpoint('New paired Child and zero-derived growth');
      const added = await command({
        type: 'add_child',
        displayName: 'Realtime test Child',
        ageBand: '9_11',
      });
      const childId = identifier(record(added.result).childId);
      report.createdChildIds.push(childId);
      await checkpoint('Pair invocation-owned Child');
      const child = make();
      const childLogin = record(
        await success(child.auth.signInAnonymously(), 'Synthetic Child sign-in'),
      );
      const childUserId = identifier(record(childLogin.user).id);
      report.createdAnonymousUserIds.push(childUserId);
      await checkpoint('Redeem invocation-owned Child invitation');
      const invitation = parseCloudFamilyInvite(
        (await command({ type: 'invite_child', childId })).result,
      );
      if ('tokenUnavailable' in invitation)
        throw new Error('New invitation token was not available');
      const paired = parseCloudFamilyResponse(
        await success(
          child.rpc('ghaf_redeem_family_invite', {
            p_token: invitation.token,
            p_request_id: randomUUID(),
          }),
          'Pair invocation-owned Child',
        ),
        childUserId,
      );
      expect(paired.snapshot.actor.role).toBe('child');
      expect(paired.snapshot.actor.childId).toBe(childId);
      const childGrowth = await growth(child, childUserId);
      expect(childGrowth.children).toHaveLength(1);
      const ownGrowth = childGrowth.children[0];
      if (!ownGrowth) throw new Error('Missing real Child zero-derived growth');
      expect(ownGrowth.childId).toBe(childId);
      expect(ownGrowth.lifetimeSeeds).toBe(0);
      expect(Object.values(ownGrowth.landscapeSeeds).every((seeds) => seeds === 0)).toBe(true);
      expect(ownGrowth.sortingCredits).toBe(0);
      expect(ownGrowth.coastCareCredits).toBe(0);
      expect(ownGrowth.learningCompleted).toHaveLength(0);
      expect(ownGrowth.badges).toHaveLength(0);
      expect(childGrowth.rewards).toHaveLength(0);
      expect(childGrowth.league).toBeNull();
      report.passed.push(
        'Real paired Child has zero Seeds, landscapes, badges, learning and private rewards',
      );
      const childObserver = await observeFamily(child, familyId, 'Paired Child');
      await renamed(childObserver, child, childUserId, 'Child update');
      report.passed.push(
        'Paired Child receives actual WebSocket UPDATE and its own authoritative snapshot',
      );

      await checkpoint('Membership revocation and explicit refresh');
      await command({ type: 'revoke_child', childId });
      await denied(child.rpc('ghaf_family_snapshot', { p_family_id: familyId }));
      await denied(child.rpc('ghaf_family_growth', { p_family_id: familyId }));
      await childObserver.close();
      expect(await child.realtime.disconnect()).toBe('ok');
      child.realtime.connect();
      await denied(child.rpc('ghaf_family_snapshot', { p_family_id: familyId }));
      report.passed.push(
        'Revoked Child authoritative reads are denied before and after transport reconnect',
      );

      await checkpoint('Foreign subscription observation window');
      await new Promise<void>((done) => setTimeout(done, 3_000));
      report.outsiderObservedUpdates = foreignObserver.revisions.length;
      report.outsiderObservationMs = Date.now() - foreignStarted;
      expect(foreignObserver.healthy()).toBe(true);
      expect(foreignObserver.revisions).toHaveLength(0);
      await denied(outsider.rpc('ghaf_family_snapshot', { p_family_id: familyId }));
      await denied(outsider.rpc('ghaf_family_growth', { p_family_id: familyId }));
      report.passed.push(
        'Subscribed foreign Parent receives no family UPDATE and remains denied by both read RPCs',
      );
      await parentObserver.close();
      await foreignObserver.close();
      report.status = 'PASS';
      report.stage = 'Completed actual hosted WebSocket and authoritative read checks';
    } catch {
      report.status = 'FAIL';
      throw new Error(
        `Hosted Realtime check failed at: ${report.stage}. See the sanitized invocation artifact.`,
      );
    } finally {
      await Promise.allSettled(
        clients.map(async (client) => {
          client.auth.stopAutoRefresh();
          await client.removeAllChannels();
          await client.realtime.disconnect();
          await client.auth.signOut({ scope: 'local' });
        }),
      );
      report.finishedAt = new Date().toISOString();
      await writeFile(artifact, JSON.stringify(report, null, 2));
    }
  },
  300_000,
);
