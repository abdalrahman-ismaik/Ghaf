import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import { createClient, processLock } from '@supabase/supabase-js';
import { expect, it } from 'vitest';

import {
  SupabaseParentAccountService,
  type AccountClientPort,
} from '../../src/services/accounts/SupabaseParentAccountService';
import { ACCOUNT_STORAGE_KEY, GuardedAccountStorage } from '../../src/services/accounts/storage';
import { createProjectAccountStorage } from '../../src/services/accounts';

const enabled = process.env.GHAF_FAMILY_SERVICE_HOSTED_TEST === '1';
const approvedProject = 'bqcfynlbxevqlzbkimhy';
const uuid = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

function deferred() {
  let release!: () => void;
  const promise = new Promise<void>((done) => {
    release = done;
  });
  return { promise, release };
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Unexpected provider object');
  return value as Record<string, unknown>;
}

it.runIf(enabled)(
  'verifies the real account service, independent clients and pinned identity against approved synthetic Supabase fixtures',
  async () => {
    const fixturePath = process.env.GHAF_FAMILY_TEST_FIXTURES;
    const cli = process.env.SUPABASE_CLI;
    if (!fixturePath || !cli)
      throw new Error('Explicit synthetic fixture path and Supabase CLI are required');
    const fixtureRoot = resolve('.expo/family-verification');
    const absoluteFixture = resolve(fixturePath);
    if (
      !absoluteFixture.startsWith(`${fixtureRoot}/`) &&
      !absoluteFixture.startsWith(`${fixtureRoot}\\`)
    )
      throw new Error('Only the isolated family-verification fixture directory is accepted');
    let fixture: Record<string, unknown>;
    try {
      fixture = record(JSON.parse(await readFile(absoluteFixture, 'utf8')));
    } catch {
      throw new Error('Unable to read synthetic family fixture metadata');
    }
    if (
      fixture.project !== approvedProject ||
      typeof fixture.runId !== 'string' ||
      !uuid.test(fixture.runId) ||
      !Array.isArray(fixture.users) ||
      !Array.isArray(fixture.families)
    )
      throw new Error('Unexpected synthetic fixture scope');
    const users = fixture.users.slice(0, 2).map((candidate, index) => {
      const user = record(candidate);
      if (
        typeof user.id !== 'string' ||
        !uuid.test(user.id) ||
        typeof user.password !== 'string' ||
        user.email !== `ghaf-family-check-${fixture.runId}-${index === 0 ? 'a' : 'b'}@example.test`
      )
        throw new Error('Fixture identities must be the exact synthetic users created by this run');
      return { id: user.id, email: user.email as string, password: user.password };
    });
    const familyB = fixture.families[1];
    if (users.length !== 2 || typeof familyB !== 'string' || !uuid.test(familyB))
      throw new Error('Two isolated fixture accounts and families are required');
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
    const url = `https://${approvedProject}.supabase.co`;
    const runId = randomUUID();
    const report = {
      project: approvedProject,
      runId,
      sourceFixtureRunId: fixture.runId,
      startedAt: new Date().toISOString(),
      passed: [] as string[],
      createdFamilyIds: [] as string[],
      limitation:
        'Installed SDK and actual development Auth/Postgres; request staging only delays transport. No physical device or email-delivery acceptance.',
    };
    const instances: { service: SupabaseParentAccountService }[] = [];
    const make = () => {
      const data = new Map<string, string>();
      const scoped = createProjectAccountStorage(
        {
          getItem: async (key) => data.get(key) ?? null,
          setItem: async (key, value) => {
            data.set(key, value);
          },
          removeItem: async (key) => {
            data.delete(key);
          },
        },
        url,
      );
      const storage = new GuardedAccountStorage(scoped.storage);
      let hold: {
        requestId: string;
        reached: ReturnType<typeof deferred>;
        proceed: ReturnType<typeof deferred>;
      } | null = null;
      let originalToken = '';
      let observedPinned = false;
      let stagedRpcDispatched = false;
      const client = createClient(url, publicKey, {
        auth: {
          storage,
          storageKey: ACCOUNT_STORAGE_KEY,
          persistSession: true,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          lock: processLock,
        },
        global: {
          async fetch(input, init) {
            if (
              hold &&
              new URL(String(input)).pathname === '/rest/v1/rpc/ghaf_family_command' &&
              typeof init?.body === 'string'
            ) {
              const body = record(JSON.parse(init.body));
              if (body.p_request_id === hold.requestId) {
                stagedRpcDispatched = true;
                observedPinned =
                  new Headers(init.headers).get('authorization') === `Bearer ${originalToken}`;
              }
            }
            return fetch(input, { ...init, signal: AbortSignal.timeout(20_000) });
          },
        },
      });
      const port = {
        auth: client.auth,
        from: client.from.bind(client),
        rpc(name: string, args?: Record<string, unknown>) {
          const query = client.rpc(name, args);
          if (hold && name === 'ghaf_family_command' && args?.p_request_id === hold.requestId) {
            const pending = hold.proceed.promise.then(() => query);
            const request = Object.assign(pending, {
              setHeader(name: string, value: string) {
                query.setHeader(name, value);
                return request;
              },
            });
            hold.reached.release();
            return request;
          }
          return query;
        },
      } as unknown as AccountClientPort;
      const service = new SupabaseParentAccountService(async () => ({
        client: port,
        storage,
        confirmIdentity: () => scoped.confirmIdentity(storage),
      }));
      service.setAppActive(false);
      instances.push({ service });
      return {
        service,
        client,
        stage(requestId: string, token: string) {
          originalToken = token;
          hold = { requestId, reached: deferred(), proceed: deferred() };
          return hold;
        },
        pinned: () => observedPinned && stagedRpcDispatched,
      };
    };
    const snapshot = async (
      service: SupabaseParentAccountService,
      userId: string,
      familyId: string | null,
    ) =>
      record(
        await service.familyRequest('ghaf_family_snapshot', { p_family_id: familyId }, userId),
      );
    const command = (
      service: SupabaseParentAccountService,
      userId: string,
      familyId: string | null,
      body: Record<string, unknown>,
      requestId = randomUUID(),
    ) =>
      service.familyRequest(
        'ghaf_family_command',
        { p_family_id: familyId, p_request_id: requestId, p_command: body },
        userId,
      );
    const parentA = users[0]!;
    const parentB = users[1]!;
    try {
      const a = make();
      expect((await a.service.signIn(parentA.email, parentA.password)).userId).toBe(parentA.id);
      expect(await a.service.getAccess(parentA.id)).toBe('approved');
      const creationId = randomUUID();
      const creation = {
        type: 'create_family',
        name: `Synthetic SDK ${runId.slice(0, 8)}`,
        displayName: 'Synthetic Parent A',
      };
      const created = record(
        record(await command(a.service, parentA.id, null, creation, creationId)).snapshot,
      );
      const freshFamily = record(created.family);
      if (typeof freshFamily.id !== 'string' || !uuid.test(freshFamily.id))
        throw new Error('Expected a newly created family identity');
      const familyId = freshFamily.id;
      report.createdFamilyIds.push(familyId);
      for (const field of ['children', 'tasks', 'recognitions', 'memories'])
        expect(created[field]).toEqual([]);
      expect(created.familyCanopyContributions).toBe(0);
      expect(Array.isArray(created.catalog) && created.catalog.length === 25).toBe(true);
      const replay = record(
        record(await command(a.service, parentA.id, null, creation, creationId)).snapshot,
      );
      expect(record(replay.family).id).toBe(familyId);
      report.passed.push(
        'Fresh family uses the real service, has no fabricated history, and setup retry returns the same family',
      );
      const savedName = `Synthetic saved SDK ${runId.slice(0, 8)}`;
      await command(a.service, parentA.id, familyId, { type: 'rename_family', name: savedName });
      await a.service.signOut();
      expect(await a.service.restoreSession()).toBeNull();
      await a.service.signIn(parentA.email, parentA.password);
      expect(record((await snapshot(a.service, parentA.id, familyId)).family).name).toBe(savedName);
      const second = make();
      await second.service.signIn(parentA.email, parentA.password);
      expect(record((await snapshot(second.service, parentA.id, familyId)).family).name).toBe(
        savedName,
      );
      report.passed.push(
        'Saved family data survives signout/signin and loads through an independent SDK service without shared local storage',
      );

      const b = make();
      await b.service.signIn(parentB.email, parentB.password);
      const beforeB = await snapshot(b.service, parentB.id, familyB);
      const beforeBName = record(beforeB.family).name;
      await expect(
        command(b.service, parentA.id, null, {
          type: 'create_family',
          name: 'Synthetic must not create',
          displayName: 'Synthetic Parent',
        }),
      ).rejects.toMatchObject({ code: 'operation_cancelled' });
      expect((await snapshot(b.service, parentB.id, familyB)).families).toEqual(beforeB.families);
      report.passed.push(
        'A stale A caller on a B session is denied before creating any B-owned record',
      );

      const switching = make();
      await switching.service.signIn(parentA.email, parentA.password);
      const active = await switching.client.auth.getSession();
      if (!active.data.session?.access_token)
        throw new Error('Expected authenticated synthetic SDK session');
      const stagedId = randomUUID();
      const staged = switching.stage(stagedId, active.data.session.access_token);
      const attempted = command(
        switching.service,
        parentA.id,
        familyB,
        { type: 'rename_family', name: 'Synthetic forbidden cross-account write' },
        stagedId,
      );
      const denied = expect(attempted).rejects.toMatchObject({ code: 'operation_cancelled' });
      await staged.reached.promise;
      try {
        const changed = await switching.client.auth.signInWithPassword({
          email: parentB.email,
          password: parentB.password,
        });
        if (changed.error || changed.data.user?.id !== parentB.id)
          throw new Error('Unable to switch isolated test identity');
      } finally {
        staged.proceed.release();
      }
      await denied;
      expect(switching.pinned()).toBe(true);
      expect(record((await snapshot(b.service, parentB.id, familyB)).family).name).toBe(
        beforeBName,
      );
      report.passed.push(
        'A staged RPC retains the verified A bearer after SDK switches to B; actual backend denies B-family mutation and the target remains unchanged',
      );
    } finally {
      await Promise.allSettled(
        instances.map(async ({ service }) => {
          try {
            await service.signOut();
          } finally {
            service.dispose();
          }
        }),
      );
      await writeFile(
        join(dirname(absoluteFixture), `sdk-service-${runId}.json`),
        JSON.stringify({ ...report, finishedAt: new Date().toISOString() }, null, 2),
      );
    }
  },
  180_000,
);
