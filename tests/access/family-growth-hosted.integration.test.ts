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
import {
  parseCloudDocumentResponse,
  parseCloudDocumentSnapshot,
} from '../../src/features/cloud-study/validation';
import type {
  CloudFamilyCommand,
  CloudFamilySnapshot,
  CloudFamilyTask,
} from '../../src/models/cloudFamily';
import type {
  CloudDocumentCommand,
  CloudFamilyDocument,
} from '../../src/models/cloudFamilyDocuments';
import type { CloudGrowthCommand, CloudGrowthSnapshot } from '../../src/models/cloudGrowth';

const enabled = process.env.GHAF_FAMILY_GROWTH_HOSTED_TEST === '1';
const approvedProject = 'bqcfynlbxevqlzbkimhy';
const approvedFixtureRun = '4d2450ee-924c-4666-8369-ba9fb84ef1b3';
const uuid = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const canonicalTaskId = 'task_recycling_p0_v1';
const learningPackageId = 'learning.mangrove_roots.v1';
const careBadgeId = 'badge.habitat.mangrove_care.v1';
type Client = SupabaseClient;
type Actor = { client: Client; userId: string; role: 'parent' | 'child'; childId: string | null };

class HostedCheckError extends Error {}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new HostedCheckError('Unexpected provider object');
  return value as Record<string, unknown>;
}
function identifier(value: unknown): string {
  if (typeof value !== 'string' || !uuid.test(value))
    throw new HostedCheckError('Unexpected provider identity');
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
    throw new HostedCheckError(`${label}: provider transport failed`);
  }
  if (reply.error) {
    const code = record(reply.error).code;
    const safeCode =
      typeof code === 'string' && /^[A-Z0-9]{5,12}$/u.test(code) ? code : 'unavailable';
    throw new HostedCheckError(`${label}: provider operation was not confirmed (${safeCode})`);
  }
  return reply.data;
}
async function rejected(operation: PromiseLike<{ error: unknown }>, expectedCode: string) {
  let reply: { error: unknown };
  try {
    reply = await operation;
  } catch {
    throw new HostedCheckError('Negative authorization check: provider transport failed');
  }
  expect(Boolean(reply.error)).toBe(true);
  expect(record(reply.error).code).toBe(expectedCode);
}
function taskIn(snapshot: CloudFamilySnapshot, taskId: string): CloudFamilyTask {
  const task = snapshot.tasks.find((candidate) => candidate.id === taskId);
  if (!task) throw new HostedCheckError('Expected authorized task was not returned');
  return task;
}
function childIn(snapshot: CloudGrowthSnapshot, childId: string) {
  const child = snapshot.children.find((candidate) => candidate.childId === childId);
  if (!child) throw new HostedCheckError('Expected authorized growth profile was not returned');
  return child;
}
function rewardIn(snapshot: CloudGrowthSnapshot, planId: string) {
  const reward = snapshot.rewards.find((candidate) => candidate.id === planId);
  if (!reward) throw new HostedCheckError('Expected authorized private promise was not returned');
  return reward;
}
function learningIn(documents: readonly CloudFamilyDocument[], childId: string) {
  const document = documents.find(
    (candidate) => candidate.kind === 'learning' && candidate.childId === childId,
  );
  if (!document || document.kind !== 'learning')
    throw new HostedCheckError('Expected authorized learning evidence was not returned');
  return document;
}

it.runIf(enabled)(
  'earns hosted growth through real authorized task commands and persists private learning, rewards and five-Leaf League evidence',
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
    const accountA = users[0];
    const accountB = users[1];
    if (!accountA || !accountB) throw new Error('Both isolated Parent accounts are required');
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
    const artifact = join(dirname(absoluteFixture), `growth-hosted-${runId}.json`);
    const report = {
      project: approvedProject,
      sourceFixtureRunId: approvedFixtureRun,
      runId,
      startedAt: new Date().toISOString(),
      finishedAt: null as string | null,
      status: 'RUNNING',
      stage: 'Restricted provider sign-in',
      operation: '',
      failure: null as string | null,
      failureSite: null as string | null,
      passed: [] as string[],
      createdFamilyIds: [] as string[],
      createdChildIds: [] as string[],
      createdAnonymousUserIds: [] as string[],
      createdTaskIds: [] as string[],
      createdRecognitionIds: [] as string[],
      createdRewardIds: [] as string[],
      createdDocumentIds: [] as string[],
      commandCount: 0,
      results: {
        childASeeds: 0,
        childBSeeds: 0,
        confirmedReceipts: 0,
        canopyContributions: 0,
        leagueLeaves: 0,
        scores: [] as number[],
      },
      limitations: [
        'Actual hosted Auth/Postgres RPCs and independent SDK sessions using synthetic task confirmations. No real recycling, environmental impact or physical-device acceptance is asserted.',
        'The promise is a synthetic nonmonetary Parent record; given tests record persistence, not an actual purchase, payment or externally fulfilled reward.',
        'Current-week scoring, shared ties, no extra-task credit and rest are checked. Calendar-week rollover, stale-password elapsed-time expiry and native UI are not exercised here.',
        'Only newly created invocation-owned family records are mutated. Existing fixture families are untouched; own IDs remain available for separately authorized cleanup.',
      ],
    };
    await writeFile(artifact, JSON.stringify(report, null, 2), { flag: 'wx' });
    const checkpoint = async (stage: string) => {
      report.stage = stage;
      await writeFile(artifact, JSON.stringify(report, null, 2));
    };
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
    const signIn = async (
      client: Client,
      account: { id: string; email: string; password: string },
    ) => {
      report.operation = 'Same-account password authentication';
      const login = record(
        await success(
          client.auth.signInWithPassword({ email: account.email, password: account.password }),
          report.operation,
        ),
      );
      expect(identifier(record(login.user).id)).toBe(account.id);
    };
    try {
      const parent: Actor = { client: make(), userId: accountA.id, role: 'parent', childId: null };
      const reader: Actor = { client: make(), userId: accountA.id, role: 'parent', childId: null };
      const outsider: Actor = {
        client: make(),
        userId: accountB.id,
        role: 'parent',
        childId: null,
      };
      await signIn(parent.client, accountA);
      await signIn(reader.client, accountA);
      await signIn(outsider.client, accountB);
      const created = parseCloudFamilyResponse(
        await success(
          parent.client.rpc('ghaf_family_command', {
            p_family_id: null,
            p_request_id: randomUUID(),
            p_command: {
              type: 'create_family',
              name: `Growth ${runId}`,
              displayName: 'Growth test Parent',
            },
          }),
          'Create invocation-owned family',
        ),
        parent.userId,
      );
      const familyId = identifier(created.snapshot.family?.id);
      expect(originalFamilyIds.includes(familyId)).toBe(false);
      report.createdFamilyIds.push(familyId);
      await checkpoint('Create two zero-start Child profiles');
      const coreRaw = (actor: Actor, command: CloudFamilyCommand, requestId = randomUUID()) => {
        report.operation = command.type;
        report.commandCount += 1;
        return actor.client.rpc('ghaf_family_command', {
          p_family_id: familyId,
          p_request_id: requestId,
          p_command: command,
        });
      };
      const core = async (actor: Actor, command: CloudFamilyCommand, requestId = randomUUID()) =>
        parseCloudFamilyResponse(
          await success(coreRaw(actor, command, requestId), command.type),
          actor.userId,
        );
      const readCore = async (actor: Actor) => {
        report.operation = 'ghaf_family_snapshot';
        return parseCloudFamilySnapshot(
          await success(
            actor.client.rpc('ghaf_family_snapshot', { p_family_id: familyId }),
            report.operation,
          ),
          actor.userId,
        );
      };
      const growthRaw = (actor: Actor, command: CloudGrowthCommand, requestId = randomUUID()) => {
        report.operation = command.type;
        report.commandCount += 1;
        return actor.client.rpc('ghaf_family_growth_command', {
          p_family_id: familyId,
          p_request_id: requestId,
          p_command: command,
        });
      };
      const growthCommand = async (
        actor: Actor,
        command: CloudGrowthCommand,
        requestId = randomUUID(),
      ) => {
        const response = record(await success(growthRaw(actor, command, requestId), command.type));
        expect(Object.keys(response)).toEqual(['snapshot']);
        return parseCloudGrowthSnapshot(response.snapshot, actor.userId, familyId);
      };
      const readGrowth = async (actor: Actor) => {
        report.operation = 'ghaf_family_growth';
        return parseCloudGrowthSnapshot(
          await success(
            actor.client.rpc('ghaf_family_growth', { p_family_id: familyId }),
            report.operation,
          ),
          actor.userId,
          familyId,
        );
      };
      const documentRaw = (
        actor: Actor,
        command: CloudDocumentCommand,
        requestId = randomUUID(),
      ) => {
        report.operation = command.type;
        report.commandCount += 1;
        return actor.client.rpc('ghaf_family_document_command', {
          p_family_id: familyId,
          p_request_id: requestId,
          p_command: command,
        });
      };
      const documentCommand = async (
        actor: Actor,
        command: CloudDocumentCommand,
        requestId = randomUUID(),
      ) =>
        parseCloudDocumentResponse(
          await success(documentRaw(actor, command, requestId), command.type),
          { familyId, role: actor.role, childId: actor.childId },
        );
      const readDocuments = async (actor: Actor) => {
        report.operation = 'ghaf_family_document_snapshot';
        return parseCloudDocumentSnapshot(
          await success(
            actor.client.rpc('ghaf_family_document_snapshot', { p_family_id: familyId }),
            report.operation,
          ),
          { familyId, userId: actor.userId, role: actor.role, childId: actor.childId },
        );
      };
      const pairChild = async (name: string): Promise<Actor> => {
        const added = await core(parent, { type: 'add_child', displayName: name, ageBand: '9_11' });
        const childId = identifier(record(added.result).childId);
        report.createdChildIds.push(childId);
        await checkpoint('Pair invocation-owned Child');
        const client = make();
        const login = record(
          await success(client.auth.signInAnonymously(), 'New synthetic Child session'),
        );
        const userId = identifier(record(login.user).id);
        report.createdAnonymousUserIds.push(userId);
        await checkpoint('Redeem invocation-owned Child invitation');
        const invitation = parseCloudFamilyInvite(
          (await core(parent, { type: 'invite_child', childId })).result,
        );
        if ('tokenUnavailable' in invitation)
          throw new HostedCheckError('New invitation token unavailable');
        const paired = parseCloudFamilyResponse(
          await success(
            client.rpc('ghaf_redeem_family_invite', {
              p_token: invitation.token,
              p_request_id: randomUUID(),
            }),
            'Pair new synthetic Child',
          ),
          userId,
        );
        expect(paired.snapshot.actor.role).toBe('child');
        expect(paired.snapshot.actor.childId).toBe(childId);
        return { client, userId, role: 'child', childId };
      };
      const childA = await pairChild('Growth test Child A');
      const childB = await pairChild('Growth test Child B');
      const childAId = identifier(childA.childId);
      const childBId = identifier(childB.childId);
      for (const actor of [childA, childB]) {
        const initial = await readGrowth(actor);
        expect(initial.children).toHaveLength(1);
        const own = childIn(initial, identifier(actor.childId));
        expect(own.lifetimeSeeds).toBe(0);
        expect(Object.values(own.landscapeSeeds).every((value) => value === 0)).toBe(true);
        expect(own.badges).toHaveLength(0);
        expect(own.learningCompleted).toHaveLength(0);
        expect(initial.rewards).toHaveLength(0);
        expect(initial.league).toBeNull();
        expect((await readDocuments(actor)).documents).toHaveLength(0);
      }
      const baseline = await readCore(reader);
      expect(baseline.tasks).toHaveLength(0);
      expect(baseline.recognitions).toHaveLength(0);
      expect(baseline.memories).toHaveLength(0);
      expect(baseline.familyCanopyContributions).toBe(0);
      await rejected(outsider.client.rpc('ghaf_family_growth', { p_family_id: familyId }), '42501');
      await rejected(documentRaw(childA, { type: 'learning.start', route: 'accessible' }), '22023');
      report.passed.push(
        'Real paired Children start at zero with no imported tasks, badges, learning, promises or League',
      );

      await checkpoint('Assign and explicitly nominate five Leaves per Child');
      const assign = async (actor: Actor) => {
        const assigned = await core(parent, {
          type: 'assign_task',
          childId: identifier(actor.childId),
          catalogId: canonicalTaskId,
        });
        const taskId = identifier(record(assigned.result).taskId);
        report.createdTaskIds.push(taskId);
        const task = taskIn(assigned.snapshot, taskId);
        report.operation = 'Validate canonical P0 assignment';
        expect(task.template.displayedSeedAward).toBe(12);
        expect(task.template.recognitionMode).toBe('standard');
        expect(task.template.routinePhase).toBe('acquisition');
        expect(task.template.recurrence).toBe('once');
        return task;
      };
      const tasksA: CloudFamilyTask[] = [];
      const tasksB: CloudFamilyTask[] = [];
      for (let index = 0; index < 5; index += 1) {
        tasksA.push(await assign(childA));
        tasksB.push(await assign(childB));
      }
      await checkpoint('Parent password-authenticated League nominations');
      await signIn(parent.client, accountA);
      const nominateA: CloudGrowthCommand = {
        type: 'league.nominate',
        childId: childAId,
        expectedRevision: 0,
        nickname: { ar: 'غصن', en: 'Branch' },
        treeAvatarToken: 'ghaf_leaf',
        taskIds: tasksA.map((task) => task.id),
      };
      await rejected(growthRaw(childA, nominateA), '42501');
      let leagueState = await growthCommand(parent, nominateA);
      if (!leagueState.league) throw new HostedCheckError('Explicit League nomination missing');
      leagueState = await growthCommand(parent, {
        type: 'league.nominate',
        childId: childBId,
        expectedRevision: leagueState.league.revision,
        nickname: { ar: 'ورقة', en: 'Leaf' },
        treeAvatarToken: 'sidr_sapling',
        taskIds: tasksB.map((task) => task.id),
      });
      expect(leagueState.league?.rows).toHaveLength(2);
      expect(leagueState.league?.rows.every((row) => row.score === 0 && row.position === 1)).toBe(
        true,
      );
      expect(leagueState.league?.cooperativeGoal).toBe(10);
      const weekKey = leagueState.currentWeekKey;
      const complete = async (
        actor: Actor,
        assigned: CloudFamilyTask,
        replayRecognition = false,
      ) => {
        let task = assigned;
        const transition = async (
          type: 'accept_task' | 'start_task' | 'request_help' | 'submit_task',
        ) => {
          task = taskIn(
            (await core(actor, { type, taskId: task.id, expectedRevision: task.revision }))
              .snapshot,
            task.id,
          );
        };
        await transition('accept_task');
        await transition('start_task');
        if (replayRecognition) await transition('request_help');
        for (const step of task.template.catalogExecution?.steps ?? []) {
          task = taskIn(
            (
              await core(actor, {
                type: 'set_step',
                taskId: task.id,
                expectedRevision: task.revision,
                stepId: step.id,
                state: 'done',
              })
            ).snapshot,
            task.id,
          );
        }
        await transition('submit_task');
        task = taskIn(
          (
            await core(parent, {
              type: 'praise_task',
              taskId: task.id,
              expectedRevision: task.revision,
              praise: 'You sorted the checked materials carefully and used the agreed help.',
            })
          ).snapshot,
          task.id,
        );
        const recognition: CloudFamilyCommand = {
          type: 'recognize_task',
          taskId: task.id,
          expectedRevision: task.revision,
        };
        const requestId = randomUUID();
        const confirmed = await core(parent, recognition, requestId);
        const receipt = confirmed.snapshot.recognitions.find(
          (candidate) => candidate.taskId === task.id,
        );
        if (!receipt)
          throw new HostedCheckError('Confirmed activity did not return its immutable receipt');
        expect(receipt.seeds).toBe(12);
        expect(receipt.childId).toBe(actor.childId);
        expect(receipt.landscapeId).toBe('mangrove');
        expect(receipt.canopyContribution).toBe(1);
        report.createdRecognitionIds.push(receipt.id);
        if (replayRecognition) {
          const replayed = await core(parent, recognition, requestId);
          expect(
            replayed.snapshot.recognitions.filter((candidate) => candidate.taskId === task.id),
          ).toEqual([receipt]);
          expect(replayed.snapshot.familyCanopyContributions).toBe(
            confirmed.snapshot.familyCanopyContributions,
          );
          await rejected(coreRaw(parent, recognition), 'PT409');
        }
        return confirmed.snapshot;
      };
      const firstTask = tasksA[0];
      if (!firstTask) throw new HostedCheckError('Missing first approved occurrence');
      await checkpoint('First earned recognition and exact replay');
      await complete(childA, firstTask, true);
      let current = await readGrowth(reader);
      expect(childIn(current, childAId).lifetimeSeeds).toBe(12);
      expect(childIn(current, childBId).lifetimeSeeds).toBe(0);
      expect(current.league?.rows.map((row) => row.score).sort((a, b) => a - b)).toEqual([0, 20]);
      report.passed.push(
        'Permitted-help confirmation earns one immutable12-Seed receipt; exact replay and stale new request cannot award twice',
      );

      await checkpoint('Prospective Parent promise after the first earned receipt');
      const monthParts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Dubai',
        year: 'numeric',
        month: '2-digit',
      }).formatToParts(new Date());
      const month = `${monthParts.find((part) => part.type === 'year')?.value}-${monthParts.find((part) => part.type === 'month')?.value}`;
      const promise = {
        kind: 'experience' as const,
        label: { ar: 'نشاط عائلي', en: 'Choose a family activity' },
      };
      const createReward: CloudGrowthCommand = {
        type: 'reward.create',
        childId: childAId,
        month,
        promise,
        milestone: { kind: 'eligible_seed_delta', requiredSeedDelta: 12 },
      };
      await rejected(growthRaw(childA, createReward), '42501');
      await rejected(growthRaw(outsider, createReward), '42501');
      const createRequest = randomUUID();
      current = await growthCommand(parent, createReward, createRequest);
      const plan = current.rewards[0];
      if (!plan || current.rewards.length !== 1)
        throw new HostedCheckError('Expected one new private promise');
      report.createdRewardIds.push(plan.id);
      expect(plan.lifecycle).toBe('promised');
      expect(plan.eligibleSeeds).toBe(0);
      expect(plan.eligibleLandscapeBaseline.mangrove).toBe(12);
      expect((await growthCommand(parent, createReward, createRequest)).rewards).toHaveLength(1);
      await signIn(parent.client, accountA);
      const revision: CloudGrowthCommand = {
        type: 'reward.revise',
        planId: plan.id,
        expectedVersion: plan.version,
        month,
        promise,
        milestone: { kind: 'eligible_seed_delta', requiredSeedDelta: 24 },
      };
      current = await growthCommand(parent, revision);
      const promised = rewardIn(current, plan.id);
      expect(promised.version).toBe(2);
      expect(promised.eligibleSeeds).toBe(0);
      expect(promised.eligibleLandscapeBaseline.mangrove).toBe(12);
      expect((await readGrowth(childB)).rewards).toHaveLength(0);
      for (let index = 1; index <= 2; index += 1) {
        const task = tasksA[index];
        if (!task) throw new HostedCheckError('Missing nominated occurrence');
        await checkpoint(`Prospective reward confirmation ${index}`);
        await complete(childA, task);
        current = await readGrowth(reader);
        expect(rewardIn(current, plan.id).eligibleSeeds).toBe(index * 12);
        expect(rewardIn(current, plan.id).lifecycle).toBe(index === 1 ? 'promised' : 'unlocked');
      }
      const unlocked = rewardIn(current, plan.id);
      expect(unlocked.unlockedAt).not.toBeNull();
      await signIn(parent.client, accountA);
      await rejected(
        growthRaw(parent, { ...revision, expectedVersion: unlocked.version }),
        'PT409',
      );
      const give: CloudGrowthCommand = {
        type: 'reward.give',
        planId: plan.id,
        expectedVersion: unlocked.version,
      };
      await rejected(growthRaw(childA, give), '42501');
      const giveRequest = randomUUID();
      current = await growthCommand(parent, give, giveRequest);
      const given = rewardIn(current, plan.id);
      expect(given.lifecycle).toBe('given');
      expect(given.givenAt).not.toBeNull();
      expect(given.unlockedAt).toBe(unlocked.unlockedAt);
      expect(rewardIn(await growthCommand(parent, give, giveRequest), plan.id)).toEqual(given);
      await rejected(growthRaw(parent, { ...revision, expectedVersion: given.version }), 'PT409');
      report.passed.push(
        'Only prospective eligible receipts unlock a reviewed promise; fresh Parent marks given, retries preserve it and Child/sibling/foreign restrictions hold',
      );

      await checkpoint('Complete explicitly nominated Leaves and verify shared ties');
      for (const task of tasksA.slice(3)) await complete(childA, task);
      current = await readGrowth(reader);
      expect(childIn(current, childAId).lifetimeSeeds).toBe(60);
      expect(current.league?.rows.map((row) => row.score).sort((a, b) => a - b)).toEqual([0, 100]);
      for (let index = 0; index < tasksB.length; index += 1) {
        const task = tasksB[index];
        if (!task) throw new HostedCheckError('Missing sibling nominated occurrence');
        await checkpoint(`Second Child nominated confirmation ${index + 1}`);
        await complete(childB, task);
      }
      current = await readGrowth(reader);
      expect(current.currentWeekKey).toBe(weekKey);
      expect(current.league?.rows).toHaveLength(2);
      expect(
        current.league?.rows.every(
          (row) => row.completedLeafCount === 5 && row.score === 100 && row.position === 1,
        ),
      ).toBe(true);
      expect(current.league?.cooperativeConfirmedCount).toBe(10);
      const childLeague = await readGrowth(childA);
      expect(childLeague.children).toHaveLength(1);
      expect(childLeague.league?.nominations).toHaveLength(0);
      for (const row of childLeague.league?.rows ?? [])
        expect(Object.keys(row).sort()).toEqual(
          [
            'completedLeafCount',
            'nickname',
            'participantId',
            'position',
            'score',
            'treeAvatarToken',
          ].sort(),
        );
      const tiedRows = current.league?.rows;
      for (let index = 6; index <= 11; index += 1) {
        await checkpoint(`Extra approved Child A occurrence ${index} of 11`);
        await complete(childA, await assign(childA));
        current = await readGrowth(reader);
        expect(childIn(current, childAId).lifetimeSeeds).toBe(index * 12);
        expect(current.currentWeekKey).toBe(weekKey);
        expect(current.league?.rows).toEqual(tiedRows);
        expect(current.league?.cooperativeConfirmedCount).toBe(10);
      }
      expect(childIn(current, childAId).lifetimeSeeds).toBe(132);
      expect(childIn(current, childAId).sortingCredits).toBe(11);
      expect(childIn(current, childAId).coastCareCredits).toBe(11);
      expect(childIn(current, childAId).badges.some((badge) => badge.badgeId === careBadgeId)).toBe(
        false,
      );
      expect(childIn(current, childBId).lifetimeSeeds).toBe(60);
      report.passed.push(
        'Five nominated Leaves give100 each with shared first place despite different completion times; six extra tasks add permanent growth but no League credit',
      );

      await checkpoint('Accessible learning requires actual132-Seed evidence');
      const learningPromise = await growthCommand(parent, {
        ...createReward,
        promise: {
          ...promise,
          label: { ar: 'نشاط عائلي آخر', en: 'Choose another family activity' },
        },
      });
      const pendingLearningPlan = learningPromise.rewards.find(
        (candidate) => candidate.id !== plan.id,
      );
      if (!pendingLearningPlan)
        throw new HostedCheckError('Missing learning-zero-credit comparison promise');
      report.createdRewardIds.push(pendingLearningPlan.id);
      expect(pendingLearningPlan.lifecycle).toBe('promised');
      expect(pendingLearningPlan.eligibleSeeds).toBe(0);
      const beforeLearningCore = await readCore(reader);
      const beforeLearningGrowth = await readGrowth(reader);
      await rejected(documentRaw(parent, { type: 'learning.start', route: 'accessible' }), '42501');
      await rejected(documentRaw(childB, { type: 'learning.start', route: 'accessible' }), '22023');
      const start = await documentCommand(childA, { type: 'learning.start', route: 'accessible' });
      report.createdDocumentIds.push(learningIn(start, childAId).id);
      await checkpoint('Finite accessible learning sections and knowledge check');
      await rejected(
        documentRaw(childA, { type: 'learning.complete', route: 'accessible' }),
        '22023',
      );
      await rejected(
        documentRaw(childA, {
          type: 'learning.step',
          route: 'accessible',
          stepId: 'accessible_section_2',
        }),
        '22023',
      );
      await documentCommand(childA, {
        type: 'learning.step',
        route: 'accessible',
        stepId: 'accessible_section_1',
      });
      await documentCommand(childA, {
        type: 'learning.step',
        route: 'accessible',
        stepId: 'accessible_section_2',
      });
      await documentCommand(childA, {
        type: 'learning.check',
        route: 'accessible',
        optionId: 'visit_or_task_reward',
      });
      await rejected(
        documentRaw(childA, { type: 'learning.complete', route: 'accessible' }),
        '22023',
      );
      await documentCommand(childA, {
        type: 'learning.check',
        route: 'accessible',
        optionId: 'habitat_support_and_care',
      });
      const completeLearning: CloudDocumentCommand = {
        type: 'learning.complete',
        route: 'accessible',
      };
      const learningRequest = randomUUID();
      const completedLearning = learningIn(
        await documentCommand(childA, completeLearning, learningRequest),
        childAId,
      );
      expect(completedLearning.payload.packageId).toBe(learningPackageId);
      expect(completedLearning.payload.completedRoute).toBe('accessible');
      expect(completedLearning.payload.completedAt).not.toBeNull();
      expect(
        learningIn(await documentCommand(childA, completeLearning, learningRequest), childAId),
      ).toEqual(completedLearning);
      expect(
        learningIn(
          await documentCommand(childA, { type: 'learning.complete', route: 'story' }),
          childAId,
        ),
      ).toEqual(completedLearning);
      current = await readGrowth(reader);
      const learned = childIn(current, childAId);
      expect(learned.learningCompleted).toEqual([learningPackageId]);
      expect(learned.badges.filter((badge) => badge.badgeId === careBadgeId)).toHaveLength(1);
      expect(learned.lifetimeSeeds).toBe(132);
      expect(learned.landscapeSeeds).toEqual(
        childIn(beforeLearningGrowth, childAId).landscapeSeeds,
      );
      expect(learned.sortingCredits).toBe(11);
      expect(learned.coastCareCredits).toBe(11);
      expect(current.league).toEqual(beforeLearningGrowth.league);
      expect(current.rewards).toEqual(beforeLearningGrowth.rewards);
      const afterLearningCore = await readCore(reader);
      expect(afterLearningCore.recognitions).toEqual(beforeLearningCore.recognitions);
      expect(afterLearningCore.familyCanopyContributions).toBe(16);
      expect(afterLearningCore.recognitions).toHaveLength(16);
      expect(
        afterLearningCore.recognitions.filter((receipt) => receipt.childId === childAId),
      ).toHaveLength(11);
      expect(
        afterLearningCore.recognitions.filter((receipt) => receipt.childId === childBId),
      ).toHaveLength(5);
      expect((await readDocuments(childB)).documents).toHaveLength(0);
      report.passed.push(
        'Accessible sections and correct check grant one permanent MangroveCare badge; replay/alternate-route completion add zero Seeds, receipts, canopy, League or reward progress',
      );

      await checkpoint('Rest keeps private earned history and fulfilled promises');
      if (!current.league) throw new HostedCheckError('Expected explicitly created League');
      await signIn(parent.client, accountA);
      const rested = await growthCommand(parent, {
        type: 'league.rest',
        childId: childBId,
        expectedRevision: current.league.revision,
        rest: true,
      });
      expect(rested.league?.rows).toHaveLength(1);
      expect(childIn(rested, childAId).lifetimeSeeds).toBe(132);
      expect(childIn(rested, childBId).lifetimeSeeds).toBe(60);
      expect(rewardIn(rested, plan.id).lifecycle).toBe('given');
      if (!rested.league) throw new HostedCheckError('Expected retained private League');
      current = await growthCommand(parent, {
        type: 'league.rest',
        childId: childBId,
        expectedRevision: rested.league.revision,
        rest: false,
      });
      expect(current.league?.rows).toEqual(tiedRows);

      await checkpoint('Independent authenticated restart reads persisted evidence');
      const restarted: Actor = {
        client: make(),
        userId: accountA.id,
        role: 'parent',
        childId: null,
      };
      await signIn(restarted.client, accountA);
      const persisted = await readGrowth(restarted);
      expect(persisted).toEqual(await readGrowth(reader));
      expect(learningIn((await readDocuments(restarted)).documents, childAId)).toEqual(
        completedLearning,
      );
      expect(rewardIn(persisted, plan.id).givenAt).toBe(given.givenAt);
      expect(rewardIn(persisted, plan.id).unlockedAt).toBe(given.unlockedAt);
      expect(rewardIn(persisted, plan.id).promise).toEqual(given.promise);
      expect(rewardIn(persisted, pendingLearningPlan.id).lifecycle).toBe('promised');
      expect(rewardIn(persisted, pendingLearningPlan.id).eligibleSeeds).toBe(0);
      await rejected(outsider.client.rpc('ghaf_family_growth', { p_family_id: familyId }), '42501');
      await rejected(
        outsider.client.rpc('ghaf_family_document_snapshot', { p_family_id: familyId }),
        '42501',
      );
      report.passed.push(
        'Rest/restoration preserves earned evidence; a new authenticated client reloads the same private growth, learning and immutable given promise',
      );
      report.results = {
        childASeeds: childIn(persisted, childAId).lifetimeSeeds,
        childBSeeds: childIn(persisted, childBId).lifetimeSeeds,
        confirmedReceipts: afterLearningCore.recognitions.length,
        canopyContributions: afterLearningCore.familyCanopyContributions,
        leagueLeaves: persisted.league?.cooperativeConfirmedCount ?? 0,
        scores: persisted.league?.rows.map((row) => row.score) ?? [],
      };
      report.status = 'PASS';
      report.stage = 'Completed actual hosted growth lifecycle';
    } catch (error) {
      report.status = 'FAIL';
      const location =
        error instanceof Error
          ? error.stack?.match(/family-growth-hosted\.integration\.test\.ts:(\d+):(\d+)/u)
          : null;
      report.failureSite = location
        ? `family-growth-hosted.integration.test.ts:${location[1]}:${location[2]}`
        : null;
      const category =
        error instanceof Error &&
        ['AssertionError', 'ZodError', 'CloudFamilyError', 'CloudGrowthError'].includes(error.name)
          ? error.name
          : 'Assertion or DTO validation failed';
      report.failure = error instanceof HostedCheckError ? error.message : category;
      throw new Error(
        `Hosted growth check failed at ${report.stage} / ${report.operation}: ${report.failure} (${report.failureSite ?? 'source location unavailable'}). See the sanitized invocation artifact.`,
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
  600_000,
);
