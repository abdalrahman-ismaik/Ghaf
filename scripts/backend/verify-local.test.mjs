import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  assertExpectedContainers,
  assertLocalConfiguration,
  assertLocalDockerHost,
  localPublicConfiguration,
  verifyLocalBackend,
} from './verify-local.mjs';

const config =
  'project_id = "ghaf-parent-pilot"\n[api]\nport = 54321\n[db]\nport = 54322\n[local_smtp]\nport = 54324\n';
const containers = ['db', 'auth', 'rest', 'kong', 'inbucket']
  .map((service) =>
    JSON.stringify({
      name: `/supabase_${service}_ghaf-parent-pilot`,
      running: true,
      health: service === 'rest' ? 'missing' : 'healthy',
    }),
  )
  .join('\n');
const status = JSON.stringify({
  API_URL: 'http://127.0.0.1:54321',
  PUBLISHABLE_KEY: 'sb_publishable_fixture',
  SECRET_KEY: 'must-never-escape',
  SERVICE_ROLE_KEY: 'also-private',
});

test('rejects another project, incompatible ports and remote Docker before any mutation', () => {
  assert.doesNotThrow(() => assertLocalConfiguration(config));
  assert.throws(() => assertLocalConfiguration(config.replace('ghaf-parent-pilot', 'production')));
  assert.throws(() => assertLocalConfiguration(config.replace('54324', '54325')));
  assert.doesNotThrow(() => assertLocalDockerHost('unix:///var/run/docker.sock'));
  assert.doesNotThrow(() => assertLocalDockerHost('npipe:////./pipe/dockerDesktopLinuxEngine'));
  assert.throws(() => assertLocalDockerHost('tcp://production:2376'));
  assert.throws(() => assertLocalDockerHost('npipe:////server/pipe/docker_engine'));
  assert.throws(() => assertExpectedContainers(containers.replace('healthy', 'unhealthy')));
  assert.doesNotThrow(() => assertExpectedContainers(containers));
  assert.throws(() => assertExpectedContainers(containers.replace('missing', 'unhealthy')));
  assert.throws(() => assertExpectedContainers(containers.replace('healthy', 'missing')));
  assert.throws(() => assertExpectedContainers(containers.replace('ghaf-parent-pilot', 'other')));
});

test('extracts only public local configuration and refuses URL tricks or privileged keys', () => {
  assert.deepEqual(localPublicConfiguration(status), {
    url: 'http://127.0.0.1:54321',
    publishableKey: 'sb_publishable_fixture',
  });
  for (const url of [
    'https://project.supabase.co',
    'http://127.0.0.1:54321@attacker.test',
    'http://localhost:54321/private',
    'http://127.0.0.1:54322',
  ]) {
    assert.throws(() => localPublicConfiguration(status.replace('http://127.0.0.1:54321', url)));
  }
  assert.throws(() =>
    localPublicConfiguration(status.replace('sb_publishable_fixture', 'sb_secret_fixture')),
  );
  assert.throws(
    () => localPublicConfiguration('{"SECRET_KEY":"private"'),
    (error) => !error.message.includes('private'),
  );
});

function harness(overrides = {}) {
  const calls = [];
  const messages = [];
  return {
    calls,
    messages,
    options: {
      read: () => config,
      env: { SUPABASE_CLI: '/validated/supabase', SUPABASE_ACCESS_TOKEN: 'private' },
      request: async () => ({ ok: true, json: async () => ({ swagger: '2.0', paths: {} }) }),
      log: (message) => messages.push(message),
      run: (command, args, options) => {
        calls.push({ command, args, options });
        const joined = args.join(' ');
        const output =
          args[0] === '--version'
            ? '2.117.0\n'
            : joined.startsWith('context inspect')
              ? '"unix:///var/run/docker.sock"'
              : args[0] === 'inspect'
                ? containers
                : args[0] === 'status'
                  ? status
                  : joined.includes('vitest.mjs')
                    ? JSON.stringify({ success: true, numPassedTests: 1, numPendingTests: 0 })
                    : '';
        return { status: 0, stdout: output };
      },
      ...overrides,
    },
  };
}

test('uses local migrations and tests without exporting privileged credentials or stopping services', async () => {
  const { calls, messages, options } = harness();
  await verifyLocalBackend(options);
  for (const call of calls.filter(({ args }) => ['migration', 'db', 'test'].includes(args[0]))) {
    assert.ok(call.args.includes('--local'));
  }
  assert.ok(
    calls.every(({ args }) => !args.some((arg) => ['--linked', 'reset', 'stop'].includes(arg))),
  );
  assert.ok(calls.every(({ options: child }) => child.env.SUPABASE_ACCESS_TOKEN === undefined));
  const integration = calls.at(-1);
  assert.equal(integration.options.env.GHAF_LOCAL_ACCOUNT_TEST, '1');
  assert.equal(
    integration.options.env.GHAF_LOCAL_SUPABASE_PUBLISHABLE_KEY,
    'sb_publishable_fixture',
  );
  assert.ok(!JSON.stringify(messages).includes('must-never-escape'));
});

test('a selected remote Docker context overrides a local host and is refused before mutations', async () => {
  const remote = harness({
    env: {
      SUPABASE_CLI: '/validated/supabase',
      DOCKER_HOST: 'unix:///var/run/docker.sock',
      DOCKER_CONTEXT: 'remote-production',
    },
  });
  const normalRun = remote.options.run;
  remote.options.run = (command, args, child) => {
    const result = normalRun(command, args, child);
    return args[0] === 'context'
      ? { status: 0, stdout: '"ssh://production.example.test"' }
      : result;
  };
  await assert.rejects(verifyLocalBackend(remote.options), /local Docker socket or named pipe/u);
  assert.deepEqual(remote.calls.at(-1).args.slice(-2), ['--', 'remote-production']);
  assert.ok(!remote.calls.some(({ args }) => ['inspect', 'status', 'migration'].includes(args[0])));
});

test('Docker Desktop context remains supported and every subsequent process uses its validated socket', async () => {
  const desktop = harness({
    env: {
      SUPABASE_CLI: '/validated/supabase',
      DOCKER_HOST: 'tcp://stale-remote:2376',
      DOCKER_CONTEXT: 'desktop-linux',
    },
  });
  const normalRun = desktop.options.run;
  const desktopHost = 'npipe:////./pipe/dockerDesktopLinuxEngine';
  desktop.options.run = (command, args, child) => {
    const result = normalRun(command, args, child);
    return args[0] === 'context' ? { status: 0, stdout: JSON.stringify(desktopHost) } : result;
  };
  await verifyLocalBackend(desktop.options);
  const contextIndex = desktop.calls.findIndex(({ args }) => args[0] === 'context');
  assert.deepEqual(desktop.calls[contextIndex].args.slice(-2), ['--', 'desktop-linux']);
  for (const call of desktop.calls.slice(contextIndex + 1)) {
    assert.equal(call.options.env.DOCKER_HOST, desktopHost);
    assert.equal(call.options.env.DOCKER_CONTEXT, undefined);
  }
  assert.equal(desktop.options.env.DOCKER_CONTEXT, 'desktop-linux');
});

test('a failed CLI command does not expose its sensitive buffers or continue to mutations', async () => {
  const { calls, options } = harness();
  const normalRun = options.run;
  options.run = (command, args, child) =>
    args[0] === 'status'
      ? { status: 1, stdout: status, stderr: 'credential-secret', error: new Error('private') }
      : normalRun(command, args, child);
  await assert.rejects(
    verifyLocalBackend(options),
    (error) =>
      error.message.includes('Local status check failed') &&
      !/private|credential-secret|must-never-escape/u.test(error.message),
  );
  assert.ok(!calls.some(({ args }) => args[0] === 'migration'));
});

test('an unavailable Auth endpoint stops before migrations and a skipped real suite cannot pass', async () => {
  const offline = harness({
    request: async () => {
      throw new Error('network');
    },
  });
  await assert.rejects(verifyLocalBackend(offline.options), /Auth endpoint is unavailable/u);
  assert.ok(!offline.calls.some(({ args }) => args[0] === 'migration'));
  const skipped = harness();
  const normalRun = skipped.options.run;
  skipped.options.run = (command, args, child) =>
    args.some((arg) => arg.endsWith('vitest.mjs'))
      ? {
          status: 0,
          stdout: JSON.stringify({ success: true, numPassedTests: 0, numPendingTests: 1 }),
        }
      : normalRun(command, args, child);
  await assert.rejects(verifyLocalBackend(skipped.options), /failed or was skipped/u);
});

test('missing REST Healthcheck still requires a reachable and recognizable read-only HTTP catalog', async () => {
  for (const response of [
    { ok: false },
    { ok: true, json: async () => ({ unexpected: 'another service' }) },
  ]) {
    const unavailable = harness({
      request: async (url) => (url.endsWith('/rest/v1/') ? response : { ok: true }),
    });
    await assert.rejects(
      verifyLocalBackend(unavailable.options),
      /PostgREST catalog is unavailable/u,
    );
    assert.ok(!unavailable.calls.some(({ args }) => args[0] === 'migration'));
  }
  const probes = [];
  const ready = harness({
    request: async (url, options) => {
      probes.push({ url, options });
      return { ok: true, json: async () => ({ swagger: '2.0', paths: {} }) };
    },
  });
  await verifyLocalBackend(ready.options);
  assert.deepEqual(
    probes.map(({ url }) => url),
    ['http://127.0.0.1:54321/auth/v1/health', 'http://127.0.0.1:54321/rest/v1/'],
  );
  assert.ok(
    probes.every(({ options }) => options.method === undefined && options.redirect === 'error'),
  );
  assert.ok(probes.every(({ options }) => options.headers.apikey === 'sb_publishable_fixture'));
});
