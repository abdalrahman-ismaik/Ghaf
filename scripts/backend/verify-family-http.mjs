import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const project = process.env.GHAF_TEST_PROJECT_REF;
const cli = process.env.SUPABASE_CLI;
if (project !== 'bqcfynlbxevqlzbkimhy' || !cli)
  throw new Error('Select the existing approved development project and CLI explicitly.');
const runId = randomUUID();
const output = `.expo/family-verification/${runId}`;
await mkdir(output, { recursive: true });
const report = {
  project,
  runId,
  startedAt: new Date().toISOString(),
  passed: [],
  limitations: [
    'Synthetic provider-created verified users; this does not verify email delivery or physical devices.',
  ],
};
const users = [];
const clients = [];
const families = [];
let admin;
let publicKey;
let stage = 'operator configuration';
const mark = (label) => {
  report.passed.push(label);
  console.log(`PASS ${label}`);
};
const success = async (operation, label) => {
  const reply = await operation;
  assert.equal(reply.error?.code ?? null, null, label);
  return reply.data;
};
const make = (key) => {
  const client = createClient(`https://${project}.supabase.co`, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(15000) }) },
  });
  clients.push(client);
  return client;
};
const snapshot = (client, familyId = null) =>
  success(client.rpc('ghaf_family_snapshot', { p_family_id: familyId }), 'Family read');
const command = (client, familyId, body, requestId = randomUUID()) =>
  success(
    client.rpc('ghaf_family_command', {
      p_family_id: familyId,
      p_request_id: requestId,
      p_command: body,
    }),
    `Family command ${body.type}`,
  );
const deny = async (operation, label) => {
  const reply = await operation;
  assert.ok(reply.error, label);
};

try {
  const keys = JSON.parse(
    execFileSync(cli, ['projects', 'api-keys', '--project-ref', project, '-o', 'json'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 30000,
      windowsHide: true,
    }),
  );
  publicKey = keys.find((key) => key.name === 'anon')?.api_key;
  const adminKey = keys.find((key) => key.name === 'service_role')?.api_key;
  assert.ok(publicKey && adminKey, 'Operator keys unavailable');
  admin = make(adminKey);
  stage = 'synthetic test accounts';
  for (const name of ['a', 'b']) {
    const email = `ghaf-family-check-${runId}-${name}@example.test`;
    const password = `Synthetic-${randomUUID()}-only`;
    const data = await success(
      admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { ghaf_test_run: runId },
      }),
      'Create test account',
    );
    assert.ok(data.user?.id);
    users.push({ id: data.user.id, email, password });
    await success(
      admin
        .from('pilot_access')
        .update({ status: 'approved' })
        .eq('user_id', data.user.id)
        .select('user_id')
        .single(),
      'Approve exact test identity',
    );
  }
  const [a, a2, b, child] = [make(publicKey), make(publicKey), make(publicKey), make(publicKey)];
  for (const [client, user] of [
    [a, users[0]],
    [a2, users[0]],
    [b, users[1]],
  ]) {
    const data = await success(
      client.auth.signInWithPassword({ email: user.email, password: user.password }),
      'Restricted password sign-in',
    );
    assert.equal(data.user.id, user.id);
  }
  stage = 'fresh initialization';
  for (const client of [a, b]) {
    const fresh = await snapshot(client);
    assert.equal(fresh.family, null);
    assert.equal(fresh.familyCanopyContributions, 0);
    for (const field of ['children', 'tasks', 'recognitions', 'memories'])
      assert.equal(fresh[field].length, 0);
    assert.equal(fresh.catalog.length, 25);
  }
  mark(
    'Fresh real accounts have no family, demo people or earned history; global catalog is available',
  );
  const request = randomUUID();
  const creation = {
    type: 'create_family',
    name: 'Synthetic Family A',
    displayName: 'Synthetic Parent A',
  };
  let state = (await command(a, null, creation, request)).snapshot;
  const familyA = state.family.id;
  families.push(familyA);
  assert.equal((await command(a, null, creation, request)).snapshot.family.id, familyA);
  assert.equal(state.members.length, 1);
  state = (
    await command(a, familyA, {
      type: 'add_child',
      displayName: 'Synthetic Child A',
      ageBand: '9_11',
    })
  ).snapshot;
  const childId = state.children[0].id;
  assert.equal((await snapshot(a2)).children[0].id, childId);
  const familyB = (
    await command(b, null, {
      type: 'create_family',
      name: 'Synthetic Family B',
      displayName: 'Synthetic Parent B',
    })
  ).snapshot.family.id;
  families.push(familyB);
  const before = await snapshot(a, familyA);
  await deny(b.rpc('ghaf_family_snapshot', { p_family_id: familyA }), 'Foreign read denied');
  await deny(
    b.rpc('ghaf_family_command', {
      p_family_id: familyA,
      p_request_id: randomUUID(),
      p_command: { type: 'rename_family', name: 'Denied mutation' },
    }),
    'Foreign mutation denied',
  );
  await deny(
    b
      .from('app_family_members')
      .insert({ family_id: familyA, auth_user_id: users[1].id, role: 'parent' }),
    'Direct membership escalation denied',
  );
  assert.deepEqual(await snapshot(a, familyA), before);
  mark(
    'Family creation retries are idempotent; independent session restores children; cross-family attacks leave target unchanged',
  );
  stage = 'Child provider pairing';
  const invitation = (await command(a, familyA, { type: 'invite_child', childId })).result;
  const anonymous = await success(
    child.auth.signInAnonymously(),
    'Separate anonymous provider identity',
  );
  users.push({ id: anonymous.user.id, anonymous: true });
  await deny(child.rpc('ghaf_family_snapshot'), 'Anonymous identity alone denied');
  await success(
    child.rpc('ghaf_redeem_family_invite', {
      p_token: invitation.token,
      p_request_id: randomUUID(),
    }),
    'Redeem Parent invitation',
  );
  const paired = await snapshot(child);
  assert.equal(paired.actor.role, 'child');
  assert.equal(paired.actor.childId, childId);
  assert.notEqual(paired.actor.userId, users[0].id);
  await deny(
    child.rpc('ghaf_family_command', {
      p_family_id: familyA,
      p_request_id: randomUUID(),
      p_command: { type: 'add_child', displayName: 'Denied', ageBand: '9_11' },
    }),
    'Child cannot add a person',
  );
  mark(
    'Separate provider Child session has only its paired permissions; no Parent credentials transferred',
  );
  stage = 'task, growth and memory';
  state = (await command(a, familyA, { type: 'assign_task', childId, catalogId: 'GI01' })).snapshot;
  let task = state.tasks.at(-1);
  const mutateTask = async (client, type, extra = {}) => {
    const result = await command(client, familyA, {
      type,
      taskId: task.id,
      expectedRevision: task.revision,
      ...extra,
    });
    task = result.snapshot.tasks.find((entry) => entry.id === task.id);
    return result;
  };
  await mutateTask(child, 'accept_task');
  await mutateTask(child, 'start_task');
  await mutateTask(child, 'request_help');
  for (const step of task.template.catalogExecution.steps)
    await mutateTask(child, 'set_step', { stepId: step.id, state: 'done' });
  await mutateTask(child, 'submit_task');
  await deny(
    child.rpc('ghaf_family_command', {
      p_family_id: familyA,
      p_request_id: randomUUID(),
      p_command: { type: 'recognize_task', taskId: task.id, expectedRevision: task.revision },
    }),
    'Child cannot approve own award',
  );
  await mutateTask(a, 'praise_task', {
    praise: 'You sorted the items carefully and asked for help.',
  });
  const recognitionRequest = randomUUID();
  const recognition = { type: 'recognize_task', taskId: task.id, expectedRevision: task.revision };
  const recognized = await command(a, familyA, recognition, recognitionRequest);
  await command(a, familyA, recognition, recognitionRequest);
  task = recognized.snapshot.tasks.find((entry) => entry.id === task.id);
  await mutateTask(a, 'save_memory');
  const saved = await snapshot(a2, familyA);
  assert.equal(saved.recognitions.length, 1);
  assert.equal(saved.recognitions[0].seeds, 8);
  assert.equal(saved.memories.length, 1);
  await success(a.auth.signOut({ scope: 'local' }), 'Sign out first client');
  await success(
    a.auth.signInWithPassword({ email: users[0].email, password: users[0].password }),
    'Sign back in',
  );
  assert.deepEqual(await snapshot(a, familyA), saved);
  mark(
    'Parent/Child task lifecycle persists; permitted help retains award; retries award once; memory and second-session/sign-in restoration verified',
  );
  stage = 'revocation';
  await command(a, familyA, { type: 'revoke_child', childId });
  await deny(
    child.rpc('ghaf_family_snapshot', { p_family_id: familyA }),
    'Revoked retained Child token denied',
  );
  assert.equal((await snapshot(a2, familyA)).recognitions.length, 1);
  mark('Pairing revocation denies retained Child token while keeping earned records');
  report.result = 'PASS';
} catch (error) {
  report.result = 'FAIL';
  report.failedStage = stage;
  report.failure =
    error instanceof assert.AssertionError
      ? error.message.split('\n')[0]
      : 'Provider/tool operation failed; inspect the named stage with safe diagnostics.';
  process.exitCode = 1;
} finally {
  for (const client of clients) {
    client.auth.stopAutoRefresh();
    await client.removeAllChannels();
  }
  // Keep exact invocation-owned fixture IDs for a separately reviewed cleanup or UI rehearsal.
  // Passwords are confined to the ignored local artifact and are never logged or committed.
  await writeFile(
    `${output}/private-fixtures.json`,
    JSON.stringify({ project, runId, users, families }, null, 2),
    { flag: 'wx' },
  );
  report.fixtureCount = users.length;
  report.finishedAt = new Date().toISOString();
  await writeFile(`${output}/result.json`, JSON.stringify(report, null, 2), { flag: 'wx' });
  console.log(`${report.result}: ${report.passed.length} groups; report ${output}/result.json`);
  process.exit(process.exitCode ?? 0);
}
