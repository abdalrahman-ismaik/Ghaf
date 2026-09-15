import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { constants } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseEnv } from 'node:util';

const modeFiles = {
  pilot: '.env.pilot.local',
  messaging: '.env.messaging.local',
};

function readOptionalEnv(path, name, readFile) {
  try {
    return parseEnv(readFile(path, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return {};
    throw new Error(`Unable to load ${name}. Check its permissions and environment-file syntax.`);
  }
}

export function createExpoLaunch({
  mode,
  args = [],
  cwd = process.cwd(),
  env = process.env,
  readFile = readFileSync,
  execPath = process.execPath,
}) {
  if (!Object.hasOwn(modeFiles, mode)) {
    throw new Error('Select a supported launch mode: pilot or messaging.');
  }

  const dotenvDisabled = /^(?:1|true|yes|on)$/iu.test(env.EXPO_NO_DOTENV ?? '');
  const files = dotenvDisabled
    ? []
    : ['.env', '.env.development', '.env.local', '.env.development.local'];
  files.push(modeFiles[mode]);

  const fileEnv = {};
  for (const name of files) {
    Object.assign(fileEnv, readOptionalEnv(resolve(cwd, name), name, readFile));
  }

  // Explicit shell values win over files; choosing pilot always selects real adult access.
  const childEnv = { ...fileEnv, ...env };
  if (mode === 'pilot') childEnv.EXPO_PUBLIC_GHAF_AUTH_MODE = 'supabase';

  return {
    command: execPath,
    args: [resolve(cwd, 'node_modules/expo/bin/cli'), 'start', ...args],
    options: { cwd, env: childEnv, stdio: 'inherit', shell: false },
  };
}

export async function runExpo(
  options,
  { spawnProcess = spawn, reportError = (message) => process.stderr.write(`${message}\n`) } = {},
) {
  let launch;
  try {
    launch = createExpoLaunch(options);
  } catch (error) {
    reportError(error.message);
    return 1;
  }

  return new Promise((resolveExit) => {
    const failed = () => {
      reportError('Unable to start Expo. Check the local Node and Expo installation.');
      resolveExit(1);
    };

    try {
      const child = spawnProcess(launch.command, launch.args, launch.options);
      child.once('error', failed);
      child.once('exit', (code, signal) => {
        resolveExit(code ?? (signal ? 128 + (constants.signals[signal] ?? 1) : 1));
      });
    } catch {
      failed();
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [mode, ...args] = process.argv.slice(2);
  process.exitCode = await runExpo({ mode, args });
}
