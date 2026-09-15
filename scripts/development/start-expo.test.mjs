import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { basename, resolve } from 'node:path';
import { test } from 'node:test';

import { createExpoLaunch, runExpo } from './start-expo.mjs';

function environmentFiles(files = {}) {
  return (path) => {
    const name = basename(path);
    if (Object.hasOwn(files, name)) return files[name];
    throw Object.assign(new Error('Missing file'), { code: 'ENOENT' });
  };
}

test('pilot starts without optional files and always selects real adult access', () => {
  const env = { EXPO_PUBLIC_GHAF_AUTH_MODE: 'demo', EXISTING: 'retained' };
  const launch = createExpoLaunch({ mode: 'pilot', env, readFile: environmentFiles() });
  assert.equal(launch.options.env.EXPO_PUBLIC_GHAF_AUTH_MODE, 'supabase');
  assert.equal(launch.options.env.EXISTING, 'retained');
  assert.equal(env.EXPO_PUBLIC_GHAF_AUTH_MODE, 'demo');
  assert.equal(launch.args.includes('--clear'), false);
});

test('base configuration works when the mode override is absent', () => {
  const launch = createExpoLaunch({
    mode: 'pilot',
    env: {},
    readFile: environmentFiles({
      '.env':
        'EXPO_PUBLIC_SUPABASE_URL=https://adult.example.test\nEXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY="public test key"',
    }),
  });
  assert.equal(launch.options.env.EXPO_PUBLIC_SUPABASE_URL, 'https://adult.example.test');
  assert.equal(launch.options.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY, 'public test key');
});

test('shell values beat mode files, which beat standard development files', () => {
  const launch = createExpoLaunch({
    mode: 'pilot',
    env: { SHELL_FIRST: 'shell', EMPTY: '' },
    readFile: environmentFiles({
      '.env': 'BASE=base\nDEVELOPMENT=base\nLOCAL=base\nMODE=base\nSHELL_FIRST=base\nEMPTY=base',
      '.env.development': 'DEVELOPMENT=development\nLOCAL=development\nMODE=development',
      '.env.local': 'LOCAL=local\nMODE=local',
      '.env.development.local': 'LOCAL=development-local\nMODE=development-local',
      '.env.pilot.local': 'MODE=pilot\nSHELL_FIRST=pilot\nEMPTY=pilot',
      '.env.messaging.local': 'MODE=wrong-mode',
    }),
  });
  assert.deepEqual(launch.options.env, {
    BASE: 'base',
    DEVELOPMENT: 'development',
    LOCAL: 'development-local',
    MODE: 'pilot',
    SHELL_FIRST: 'shell',
    EMPTY: '',
    EXPO_PUBLIC_GHAF_AUTH_MODE: 'supabase',
  });
});

test('messaging retains its independent keys and never implicitly selects adult login', () => {
  const readFile = environmentFiles({
    '.env': 'EXPO_PUBLIC_SUPABASE_URL=https://adult.example.test',
    '.env.pilot.local': 'EXPO_PUBLIC_GHAF_AUTH_MODE=supabase',
    '.env.messaging.local': 'EXPO_PUBLIC_GHAF_MESSAGING_URL=https://messaging.example.test',
  });
  const launch = createExpoLaunch({ mode: 'messaging', env: {}, readFile });
  assert.equal(launch.options.env.EXPO_PUBLIC_SUPABASE_URL, 'https://adult.example.test');
  assert.equal(launch.options.env.EXPO_PUBLIC_GHAF_MESSAGING_URL, 'https://messaging.example.test');
  assert.equal(launch.options.env.EXPO_PUBLIC_GHAF_AUTH_MODE, undefined);
});

test('EXPO_NO_DOTENV skips standard files while keeping explicit mode overrides', () => {
  const launch = createExpoLaunch({
    mode: 'messaging',
    env: { EXPO_NO_DOTENV: '1' },
    readFile: environmentFiles({ '.env': 'BASE=ignored', '.env.messaging.local': 'MODE=selected' }),
  });
  assert.equal(launch.options.env.BASE, undefined);
  assert.equal(launch.options.env.MODE, 'selected');
});

test('forwards arguments exactly without a shell or automatic cache clearing', () => {
  const args = ['--web', '--port', '8083', '--host', 'localhost', 'literal $(echo value)'];
  const cwd = resolve('workspace with spaces');
  const launch = createExpoLaunch({
    mode: 'pilot',
    args,
    cwd,
    execPath: 'node executable',
    env: {},
    readFile: environmentFiles(),
  });
  assert.equal(launch.command, 'node executable');
  assert.deepEqual(launch.args, [resolve(cwd, 'node_modules/expo/bin/cli'), 'start', ...args]);
  assert.equal(launch.options.cwd, cwd);
  assert.equal(launch.options.shell, false);
  assert.equal(launch.options.stdio, 'inherit');
  assert.equal(launch.args.includes('--clear'), false);
});

test('a mode-file permission error stops before Expo without leaking error contents', async () => {
  const messages = [];
  let spawned = false;
  const code = await runExpo(
    {
      mode: 'pilot',
      env: {},
      readFile: (path) => {
        if (basename(path) === '.env.pilot.local') {
          throw Object.assign(new Error('SENSITIVE_CONFIGURATION'), { code: 'EACCES' });
        }
        return environmentFiles()(path);
      },
    },
    {
      spawnProcess: () => {
        spawned = true;
      },
      reportError: (message) => messages.push(message),
    },
  );
  assert.equal(code, 1);
  assert.equal(spawned, false);
  assert.match(messages[0], /Unable to load \.env\.pilot\.local/);
  assert.equal(messages[0].includes('SENSITIVE_CONFIGURATION'), false);
});

test('rejects unsupported modes before reading files or spawning Expo', async () => {
  const messages = [];
  const code = await runExpo(
    {
      mode: '../private',
      readFile: () => assert.fail('Must not read a file'),
    },
    {
      spawnProcess: () => assert.fail('Must not spawn'),
      reportError: (message) => messages.push(message),
    },
  );
  assert.equal(code, 1);
  assert.equal(messages.length, 1);
  assert.equal(messages[0].includes('../private'), false);
});

for (const [event, payload, expectedCode] of [
  ['exit', [0, null], 0],
  ['exit', [7, null], 7],
  ['exit', [null, 'SIGINT'], 130],
  ['error', [new Error('SENSITIVE_SPAWN_ERROR')], 1],
]) {
  test(`propagates Expo ${event} result ${expectedCode} without printing secrets`, async () => {
    const messages = [];
    const code = await runExpo(
      { mode: 'pilot', env: {}, readFile: environmentFiles() },
      {
        spawnProcess: () => {
          const child = new EventEmitter();
          queueMicrotask(() => child.emit(event, ...payload));
          return child;
        },
        reportError: (message) => messages.push(message),
      },
    );
    assert.equal(code, expectedCode);
    assert.equal(messages.join('').includes('SENSITIVE_SPAWN_ERROR'), false);
  });
}
