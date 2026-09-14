import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { expect, it } from 'vitest';

import {
  parseCloudDocumentCommand,
  parseCloudDocumentResponse,
  parseCloudDocumentSnapshot,
} from '../../src/features/cloud-study/validation';
import type {
  CloudDocumentCommand,
  CloudFamilyDocument,
  CloudProfilePreferences,
  CloudSavedTemplate,
} from '../../src/models/cloudFamilyDocuments';
import type { AcademicGoalInput, StudyCommand } from '../../src/models/study';

const enabled = process.env.GHAF_FAMILY_DOCUMENTS_HOSTED_TEST === '1';
const approvedProject = 'bqcfynlbxevqlzbkimhy';
const approvedFixtureRun = '4d2450ee-924c-4666-8369-ba9fb84ef1b3';
const uuid = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
type Client = SupabaseClient;
type Actor = { client: Client; userId: string; role: 'parent' | 'child'; childId: string | null };

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
  'persists complete study agreements and private family documents through real isolated Parent and Child Supabase sessions',
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
    const familyA = identifier(fixture.families[0]);
    const familyB = identifier(fixture.families[1]);
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
    const prefix = `documents-hosted-${runId}`;
    const artifact = join(dirname(absoluteFixture), `${prefix}.json`);
    const report = {
      project: approvedProject,
      sourceFixtureRunId: approvedFixtureRun,
      runId,
      startedAt: new Date().toISOString(),
      finishedAt: null as string | null,
      status: 'RUNNING',
      stage: 'Restricted provider sign-in',
      passed: [] as string[],
      createdAnonymousUserIds: [] as string[],
      createdDocumentIds: [] as string[],
      updatedExistingDocumentIds: [] as string[],
      limitations: [
        'Actual development Auth/Postgres with synthetic records. No physical-device, email-delivery, school-record or real-money verification.',
      ],
    };
    await writeFile(artifact, JSON.stringify(report, null, 2), { flag: 'wx' });
    const baselineDocumentIds = new Set<string>();
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
    const snapshot = async (client: Client, familyId: string) =>
      record(
        await success(
          client.rpc('ghaf_family_snapshot', { p_family_id: familyId }),
          'Family snapshot',
        ),
      );
    const docs = async (actor: Actor, familyId = familyA) =>
      parseCloudDocumentSnapshot(
        await success(
          actor.client.rpc('ghaf_family_document_snapshot', { p_family_id: familyId }),
          'Document read',
        ),
        { userId: actor.userId, familyId, role: actor.role, childId: actor.childId },
      ).documents;
    const rawCommand = (
      actor: Actor,
      command: unknown,
      requestId = randomUUID(),
      familyId = familyA,
    ) =>
      actor.client.rpc('ghaf_family_document_command', {
        p_family_id: familyId,
        p_request_id: requestId,
        p_command: command,
      });
    const command = async (actor: Actor, body: CloudDocumentCommand, requestId = randomUUID()) => {
      const reply = await success(
        rawCommand(actor, parseCloudDocumentCommand(body), requestId),
        'Document command',
      );
      const rows = parseCloudDocumentResponse(reply, {
        familyId: familyA,
        role: actor.role,
        childId: actor.childId,
      });
      const id = identifier(record(record(reply).result).documentId);
      const trackedIds = baselineDocumentIds.has(id)
        ? report.updatedExistingDocumentIds
        : report.createdDocumentIds;
      if (!trackedIds.includes(id)) trackedIds.push(id);
      return rows;
    };
    const studyRecord = (rows: readonly CloudFamilyDocument[], id: string) => {
      const row = rows.find(
        (entry) =>
          (entry.kind === 'study_plan' || entry.kind === 'academic_goal') &&
          entry.payload.id === id,
      );
      if (!row || (row.kind !== 'study_plan' && row.kind !== 'academic_goal'))
        throw new Error('Expected committed study record');
      return row;
    };
    const studyBody = async (actor: Actor, nested: StudyCommand): Promise<CloudDocumentCommand> => {
      const rows = await docs(actor);
      const current = rows.find(
        (entry) =>
          (entry.kind === 'study_plan' || entry.kind === 'academic_goal') &&
          entry.payload.id === nested.id,
      );
      return { type: 'study', expectedRevision: current?.revision ?? 0, command: nested };
    };
    const study = async (actor: Actor, nested: StudyCommand) =>
      studyRecord(await command(actor, await studyBody(actor, nested)), nested.id);
    const parentA: Actor = { client: make(), userId: users[0]!.id, role: 'parent', childId: null };
    const parentA2: Actor = { client: make(), userId: users[0]!.id, role: 'parent', childId: null };
    const parentB: Actor = { client: make(), userId: users[1]!.id, role: 'parent', childId: null };
    try {
      for (const [actor, user] of [
        [parentA, users[0]!],
        [parentA2, users[0]!],
        [parentB, users[1]!],
      ] as const) {
        const signed = record(
          await success(
            actor.client.auth.signInWithPassword({ email: user.email, password: user.password }),
            'Restricted Parent sign-in',
          ),
        );
        expect(record(signed.user).id).toBe(user.id);
      }
      const initial = await snapshot(parentA.client, familyA);
      expect(record(initial.family).id).toBe(familyA);
      const childRows = initial.children;
      if (!Array.isArray(childRows) || childRows.length !== 1)
        throw new Error(
          'Expected the one existing fixture Child; this test never creates Children',
        );
      const childId = identifier(record(childRows[0]).id);
      expect(record(childRows[0]).active).toBe(true);
      const originalRecognition = initial.recognitions;
      expect(Array.isArray(originalRecognition) && originalRecognition.length >= 1).toBe(true);
      const beforeDocuments = await docs(parentA);
      beforeDocuments.forEach((row) => baselineDocumentIds.add(row.id));
      report.stage = 'Fresh Child provider pairing';
      const invitation = record(
        record(
          await success(
            parentA.client.rpc('ghaf_family_command', {
              p_family_id: familyA,
              p_request_id: randomUUID(),
              p_command: { type: 'invite_child', childId },
            }),
            'Parent Child invitation',
          ),
        ).result,
      );
      if (typeof invitation.token !== 'string' || !invitation.token)
        throw new Error('Expected a fresh one-use Child invitation');
      const child: Actor = { client: make(), userId: '', role: 'child', childId };
      const anonymous = record(
        await success(child.client.auth.signInAnonymously(), 'Fresh anonymous Child identity'),
      );
      child.userId = identifier(record(anonymous.user).id);
      report.createdAnonymousUserIds.push(child.userId);
      // Retain only this invocation's new anonymous identity for separately authorized cleanup.
      await writeFile(artifact, JSON.stringify(report, null, 2));
      await denied(child.client.rpc('ghaf_family_documents', { p_family_id: familyA }));
      await success(
        child.client.rpc('ghaf_redeem_family_invite', {
          p_token: invitation.token,
          p_request_id: randomUUID(),
        }),
        'Parent-approved Child pairing',
      );
      const paired = record((await snapshot(child.client, familyA)).actor);
      expect(paired.role).toBe('child');
      expect(paired.childId).toBe(childId);
      expect(paired.userId).not.toBe(users[0]!.id);
      report.passed.push(
        'Fresh provider Child session requires a real Parent-issued invitation and receives its own identity',
      );

      report.stage = 'Study plan lifecycle and retries';
      const planId = `${prefix}-plan`;
      const plan: CloudDocumentCommand = {
        type: 'study',
        expectedRevision: 0,
        command: {
          type: 'plan.create',
          id: planId,
          childId,
          input: {
            subject: 'Reading',
            title: 'Read a chosen page',
            nextStep: 'Choose a quiet place',
            durationMinutes: 15,
            dueDate: '2026-12-10',
            revisitDate: null,
          },
        },
      };
      const planRequest = randomUUID();
      await command(parentA, plan, planRequest);
      await command(parentA, plan, planRequest);
      expect(
        (await docs(parentA2)).filter(
          (row) => row.kind === 'study_plan' && row.payload.id === planId,
        ),
      ).toHaveLength(1);
      expect(studyRecord(await docs(child), planId).payload.status).toBe('proposed');
      await denied(
        rawCommand(parentA, await studyBody(parentA, { type: 'plan.complete', id: planId })),
      );
      await denied(
        rawCommand(child, await studyBody(child, { type: 'plan.complete', id: planId })),
        '22023',
      );
      await study(child, { type: 'plan.accept', id: planId });
      await study(child, { type: 'plan.start', id: planId });
      await study(child, { type: 'plan.help', id: planId, request: 'together' });
      await study(child, { type: 'plan.pause', id: planId });
      await study(parentA, { type: 'plan.help_resolved', id: planId });
      await study(child, { type: 'plan.start', id: planId });
      const complete = await studyBody(child, { type: 'plan.complete', id: planId });
      const completionRequest = randomUUID();
      const completed = studyRecord(await command(child, complete, completionRequest), planId);
      expect(completed.payload.status).toBe('completed');
      expect(studyRecord(await command(child, complete, completionRequest), planId)).toEqual(
        completed,
      );
      await study(child, { type: 'plan.revisit', id: planId, date: '2027-01-02' });
      const restoredPlan = studyRecord(await docs(parentA2), planId);
      expect(restoredPlan.payload).toMatchObject({
        status: 'completed',
        revisitDate: '2027-01-02',
        helpRequest: null,
      });
      report.passed.push(
        'Study proposal, Child acceptance, start/pause/help/completion/revisit and exact retry persist on an independent Parent client',
      );

      report.stage = 'Goal agreement, review and private prize';
      const goalId = `${prefix}-practice`;
      const goalInput: AcademicGoalInput = {
        subject: 'Reading',
        title: 'Discuss three chosen pages',
        nextStep: 'Choose a page',
        parentSupport: 'Read together if requested',
        criterion: { kind: 'practice_count', target: 3 },
        prize: { kind: 'experience', label: 'Choose a family game' },
        targetDate: '2026-12-10',
        reviewDate: '2026-12-20',
      };
      await study(parentA, { type: 'goal.create', id: goalId, childId, input: goalInput });
      await study(parentA, { type: 'goal.approve', id: goalId, expectedRevision: 1 });
      const edited = await study(parentA, {
        type: 'goal.edit',
        id: goalId,
        expectedRevision: 1,
        input: { ...goalInput, title: 'Discuss three agreed pages' },
      });
      expect(edited.payload).toMatchObject({
        revision: 2,
        parentApprovedRevision: null,
        childAcceptedRevision: null,
      });
      await denied(
        rawCommand(
          child,
          await studyBody(child, { type: 'goal.approve', id: goalId, expectedRevision: 2 }),
        ),
      );
      await study(parentA, { type: 'goal.approve', id: goalId, expectedRevision: 2 });
      await study(child, { type: 'goal.accept', id: goalId, expectedRevision: 2 });
      await denied(
        rawCommand(
          parentA,
          await studyBody(parentA, {
            type: 'goal.edit',
            id: goalId,
            expectedRevision: 2,
            input: { ...goalInput, targetDate: '2027-01-01', reviewDate: '2027-01-02' },
          }),
        ),
        '22023',
      );
      await study(child, { type: 'goal.pause', id: goalId });
      await study(child, { type: 'goal.resume', id: goalId });
      await study(child, { type: 'goal.request_change', id: goalId });
      await study(child, { type: 'goal.resume', id: goalId });
      const firstReport = `${prefix}-practice-below`;
      await study(child, {
        type: 'goal.submit',
        id: goalId,
        submissionId: firstReport,
        result: { kind: 'practice_count', count: 1 },
      });
      await denied(
        rawCommand(
          child,
          await studyBody(child, {
            type: 'goal.confirm',
            id: goalId,
            submissionId: firstReport,
            acknowledgement: 'Forbidden self-confirmation',
          }),
        ),
      );
      const below = await study(parentA, {
        type: 'goal.confirm',
        id: goalId,
        submissionId: firstReport,
        acknowledgement: 'You chose a manageable first step',
      });
      expect(below.payload).toMatchObject({ status: 'active', prizeStatus: 'promised' });
      const achievedReport = `${prefix}-practice-achieved`;
      await study(child, {
        type: 'goal.submit',
        id: goalId,
        submissionId: achievedReport,
        result: { kind: 'practice_count', count: 3 },
      });
      const confirmation = await studyBody(parentA, {
        type: 'goal.confirm',
        id: goalId,
        submissionId: achievedReport,
        acknowledgement: 'You completed the agreed practice with help',
      });
      const confirmationId = randomUUID();
      const unlocked = studyRecord(await command(parentA, confirmation, confirmationId), goalId);
      expect(unlocked.payload).toMatchObject({
        status: 'acknowledged',
        prizeStatus: 'unlocked',
        targetDate: '2026-12-10',
        reviewDate: '2026-12-20',
      });
      expect(studyRecord(await command(parentA, confirmation, confirmationId), goalId)).toEqual(
        unlocked,
      );
      await denied(rawCommand(child, await studyBody(child, { type: 'goal.give', id: goalId })));
      await study(parentA, { type: 'goal.give', id: goalId });
      expect(studyRecord(await docs(parentA2), goalId).payload).toMatchObject({
        prizeStatus: 'given',
        submissions: [{ metCriterion: false }, { metCriterion: true }],
      });
      for (const mode of ['mark', 'achievement'] as const) {
        const id = `${prefix}-${mode}`;
        const criterion =
          mode === 'mark'
            ? { kind: 'mark' as const, threshold: 8, denominator: 10 }
            : { kind: 'achievement' as const, description: 'Finish an agreed draft' };
        await study(child, {
          type: 'goal.create',
          id,
          childId,
          input: { ...goalInput, criterion, prize: null },
        });
        await study(parentA, { type: 'goal.approve', id, expectedRevision: 1 });
        await study(child, { type: 'goal.accept', id, expectedRevision: 1 });
        if (mode === 'mark')
          await denied(
            rawCommand(
              child,
              await studyBody(child, {
                type: 'goal.submit',
                id,
                submissionId: `${id}-invalid`,
                result: { kind: 'mark', value: 11 },
              }),
            ),
            '22023',
          );
        const submissionId = `${id}-report`;
        await study(child, {
          type: 'goal.submit',
          id,
          submissionId,
          result:
            mode === 'mark'
              ? { kind: 'mark', value: 8.5 }
              : { kind: 'achievement', achieved: true },
        });
        const reviewed = await study(parentA, {
          type: 'goal.confirm',
          id,
          submissionId,
          acknowledgement: 'You reviewed your chosen work',
        });
        expect(reviewed.payload).toMatchObject({
          status: 'acknowledged',
          prizeStatus: null,
          criterion,
        });
      }
      report.passed.push(
        'All three criteria, both proposal roles, exact agreement, accepted-date immutability, below-target retry and Parent-only prize fulfillment survive provider persistence',
      );

      report.stage = 'Preferences, connections and reusable templates';
      const currentPreferences = (await docs(parentA)).find(
        (row) => row.kind === 'profile_preferences' && row.childId === childId,
      );
      const preferences: CloudProfilePreferences = {
        avatarId: 'leaf',
        preferredLanguage: 'both',
        sex: 'male',
        interests: ['nature'],
        hobbies: ['reading'],
        accessibilityDefaults: ['reduced_motion'],
        supportPreferences: ['adult_alongside'],
        customInterest: null,
        customHobby: null,
        customSupportPreference: null,
        customAccessibility: null,
        personalizationEnabled: false,
      };
      const preferenceBody: CloudDocumentCommand = {
        type: 'preferences.save',
        expectedRevision: currentPreferences?.revision ?? 0,
        childId,
        input: preferences,
      };
      await denied(rawCommand(child, preferenceBody));
      await command(parentA, preferenceBody);
      expect(
        (await docs(parentA2)).find(
          (row) => row.kind === 'profile_preferences' && row.childId === childId,
        )?.payload,
      ).toEqual(preferences);
      expect(
        (await docs(child)).find((row) => row.kind === 'profile_preferences')?.payload,
      ).toEqual(preferences);
      const currentDirectory = (await docs(parentA)).find((row) => row.kind === 'connections');
      const connectionBody: CloudDocumentCommand = {
        type: 'connections.save',
        expectedRevision: currentDirectory?.revision ?? 0,
        input: {
          primaryGuardianName: 'Synthetic Parent A',
          secondaryGuardianName: '',
          relatives: [],
        },
      };
      await command(parentA, connectionBody);
      await denied(rawCommand(child, { ...connectionBody, expectedRevision: 1 }));
      const template: CloudSavedTemplate = {
        categoryId: 'home_responsibility',
        title: { ar: `ترتيب الكتب ${runId.slice(0, 8)}`, en: `Arrange books ${runId.slice(0, 8)}` },
        positiveAction: { ar: 'ضع الكتب المتفق عليها في مكانها', en: 'Put agreed books away' },
        recurrence: 'once',
      };
      const templateBody: CloudDocumentCommand = {
        type: 'template.save',
        id: null,
        expectedRevision: 0,
        input: template,
      };
      await denied(rawCommand(child, templateBody));
      const templateRequest = randomUUID();
      const savedTemplates = await command(parentA, templateBody, templateRequest);
      await command(parentA, templateBody, templateRequest);
      const savedTemplate = savedTemplates.find(
        (row) => row.kind === 'saved_template' && row.payload.title.en === template.title.en,
      );
      if (!savedTemplate) throw new Error('Expected the newly saved template');
      expect((await docs(parentA2)).find((row) => row.id === savedTemplate.id)?.payload).toEqual(
        template,
      );
      await denied(rawCommand(parentA, templateBody), 'PT409');
      const updatedTemplate = { ...template, recurrence: 'recurrent' as const };
      await command(parentA, {
        type: 'template.save',
        id: savedTemplate.id,
        expectedRevision: savedTemplate.revision,
        input: updatedTemplate,
      });
      expect((await docs(parentA2)).find((row) => row.id === savedTemplate.id)?.payload).toEqual(
        updatedTemplate,
      );
      const childDocuments = await docs(child);
      expect(
        childDocuments.every(
          (row) =>
            row.childId === childId && row.kind !== 'connections' && row.kind !== 'saved_template',
        ),
      ).toBe(true);
      const childRls = await success(
        child.client
          .from('app_family_documents')
          .select('id,kind,child_id')
          .eq('family_id', familyA),
        'Child RLS read',
      );
      expect(
        Array.isArray(childRls) &&
          childRls.every(
            (row) =>
              record(row).child_id === childId &&
              !['connections', 'saved_template'].includes(String(record(row).kind)),
          ),
      ).toBe(true);
      await denied(
        child.client.from('app_family_documents').insert({
          family_id: familyA,
          child_id: childId,
          kind: 'profile_preferences',
          payload: preferences,
        }),
      );
      report.passed.push(
        'Explicit preferences/opt-out, optional connections and bilingual reusable templates persist; retries/deduplication and Parent-only RPC/RLS controls are enforced',
      );

      report.stage = 'Cross-family isolation and permanent progress readback';
      const beforeAttackA = await docs(parentA2);
      const beforeAttackB = await docs(parentB, familyB);
      await denied(parentB.client.rpc('ghaf_family_documents', { p_family_id: familyA }));
      await denied(
        rawCommand(parentB, { type: 'template.delete', id: savedTemplate.id, expectedRevision: 2 }),
      );
      await denied(rawCommand(parentA, templateBody, randomUUID(), familyB));
      expect(await docs(parentA2)).toEqual(beforeAttackA);
      expect(await docs(parentB, familyB)).toEqual(beforeAttackB);
      expect((await snapshot(parentA2.client, familyA)).recognitions).toEqual(originalRecognition);
      expect((await snapshot(parentA2.client, familyA)).familyCanopyContributions).toEqual(
        initial.familyCanopyContributions,
      );
      expect((await snapshot(parentA2.client, familyA)).memories).toEqual(initial.memories);
      expect((await snapshot(parentA2.client, familyA)).children).toEqual(initial.children);
      await success(parentA.client.auth.signOut({ scope: 'local' }), 'Parent sign-out');
      await success(
        parentA.client.auth.signInWithPassword({
          email: users[0]!.email,
          password: users[0]!.password,
        }),
        'Parent sign-in restoration',
      );
      expect(await docs(parentA)).toEqual(beforeAttackA);
      expect((await docs(parentA)).length).toBeGreaterThan(beforeDocuments.length);
      report.passed.push(
        'Cross-family reads/writes are denied without changing either target; study/prizes issue zero Seeds/canopy/memories and documents restore after new sign-in',
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
      // No remote family, task, document or anonymous user is deleted by this test.
      await writeFile(artifact, JSON.stringify(report, null, 2));
    }
  },
  300_000,
);
