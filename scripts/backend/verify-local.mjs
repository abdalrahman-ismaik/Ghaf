import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const projectId = 'ghaf-parent-pilot';
const cliVersion = '2.117.0';
const containerNames = ['db', 'auth', 'rest', 'kong', 'inbucket'].map(
  (service) => `supabase_${service}_${projectId}`,
);

export class BackendVerificationError extends Error {}

export function assertLocalConfiguration(config) {
  const project = config.match(/^project_id\s*=\s*"([^"]+)"\s*$/mu)?.[1];
  if (project !== projectId) {
    throw new BackendVerificationError('Refusing a different Supabase project.');
  }
  for (const [section, port] of [
    ['api', 54321],
    ['db', 54322],
    ['local_smtp', 54324],
  ]) {
    const block = config.match(new RegExp(`^\\[${section}\\]\\s*\\n([^[]*)`, 'mu'))?.[1];
    if (!block || !new RegExp(`^port\\s*=\\s*${port}\\s*$`, 'mu').test(block)) {
      throw new BackendVerificationError('Local integration ports do not match the test harness.');
    }
  }
}

export function localPublicConfiguration(statusText) {
  let status;
  try {
    status = JSON.parse(statusText);
  } catch {
    throw new BackendVerificationError('Supabase status did not return valid JSON.');
  }
  if (!status || !['http://127.0.0.1:54321', 'http://localhost:54321'].includes(status.API_URL)) {
    throw new BackendVerificationError('Refusing a non-loopback or unexpected Supabase API.');
  }
  if (
    typeof status.PUBLISHABLE_KEY !== 'string' ||
    !/^sb_publishable_[A-Za-z0-9_-]+$/u.test(status.PUBLISHABLE_KEY)
  ) {
    throw new BackendVerificationError('The local stack must provide a publishable client key.');
  }
  // Never return privileged status fields or forward the complete status to another process.
  return { url: status.API_URL, publishableKey: status.PUBLISHABLE_KEY };
}

export function assertLocalDockerHost(host) {
  if (
    typeof host !== 'string' ||
    !/^(?:unix:\/\/\/[^\r\n]+|npipe:\/\/\/\/\.\/pipe\/[^/\r\n]+)$/u.test(host)
  ) {
    throw new BackendVerificationError(
      'Verification requires a local Docker socket or named pipe.',
    );
  }
}

export function assertExpectedContainers(text) {
  let containers;
  try {
    containers = text
      .trim()
      .split(/\r?\n/u)
      .map((line) => JSON.parse(line));
  } catch {
    throw new BackendVerificationError('Could not inspect the expected local containers.');
  }
  if (
    containers.length !== containerNames.length ||
    !containerNames.every((name) =>
      containers.some(
        (container) =>
          container?.name === `/${name}` &&
          container.running === true &&
          (container.health === 'healthy' ||
            (name === `supabase_rest_${projectId}` && container.health === 'missing')),
      ),
    )
  ) {
    throw new BackendVerificationError(
      'Required Ghaf database, Auth, REST, gateway or mail service is not healthy.',
    );
  }
}

export async function verifyLocalBackend({
  root = repositoryRoot,
  env = process.env,
  run = spawnSync,
  read = readFileSync,
  request = fetch,
  log = console.log,
} = {}) {
  assertLocalConfiguration(read(resolve(root, 'supabase/config.toml'), 'utf8'));
  const cli = env.SUPABASE_CLI || 'supabase';
  const childEnv = Object.fromEntries(
    Object.entries(env).filter(
      ([key]) => !/^(?:SUPABASE_|GHAF_LOCAL_|EXPO_PUBLIC_SUPABASE_)/u.test(key),
    ),
  );
  const execute = (label, command, args, extraEnv = {}) => {
    let result;
    try {
      result = run(command, args, {
        cwd: root,
        env: { ...childEnv, ...extraEnv },
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 180_000,
        maxBuffer: 8 * 1024 * 1024,
        windowsHide: true,
      });
    } catch {
      throw new BackendVerificationError(`${label} could not start; check the local executable.`);
    }
    if (result.error || result.status !== 0) {
      // CLI failures can contain credentials in stdout, stderr and Error properties.
      throw new BackendVerificationError(`${label} failed; raw process output was withheld.`);
    }
    return result.stdout;
  };
  const supabase = (label, args) => execute(label, cli, [...args, '--workdir', root]);
  if (execute('CLI version check', cli, ['--version']).trim() !== cliVersion) {
    throw new BackendVerificationError(`Use the validated Supabase CLI ${cliVersion}.`);
  }
  // Docker's explicit context takes precedence over DOCKER_HOST.
  const dockerContext = env.DOCKER_CONTEXT;
  let dockerHost = dockerContext ? undefined : env.DOCKER_HOST;
  if (!dockerHost) {
    try {
      dockerHost = JSON.parse(
        execute('Docker context check', 'docker', [
          'context',
          'inspect',
          '--format',
          '{{json .Endpoints.docker.Host}}',
          ...(dockerContext ? ['--', dockerContext] : []),
        ]),
      );
    } catch {
      throw new BackendVerificationError('Could not verify the local Docker context.');
    }
  }
  assertLocalDockerHost(dockerHost);
  // Pin every subsequent CLI and test process to the validated local endpoint.
  delete childEnv.DOCKER_CONTEXT;
  childEnv.DOCKER_HOST = dockerHost;
  assertExpectedContainers(
    execute('Container health check', 'docker', [
      'inspect',
      '--format',
      '{"name":{{json .Name}},"running":{{json .State.Running}},"health":{{if .State.Health}}{{json .State.Health.Status}}{{else}}"missing"{{end}}}',
      ...containerNames,
    ]),
  );
  const publicConfig = localPublicConfiguration(
    supabase('Local status check', ['status', '-o', 'json']),
  );
  try {
    const response = await request(`${publicConfig.url}/auth/v1/health`, {
      headers: { apikey: publicConfig.publishableKey },
      redirect: 'error',
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error();
  } catch {
    throw new BackendVerificationError('The expected loopback Auth endpoint is unavailable.');
  }
  try {
    // This PostgREST image has no Docker Healthcheck; its anonymous catalog is read-only.
    const response = await request(`${publicConfig.url}/rest/v1/`, {
      headers: {
        apikey: publicConfig.publishableKey,
        accept: 'application/openapi+json',
      },
      redirect: 'error',
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error();
    const catalog = await response.json();
    if (catalog?.swagger !== '2.0' || !catalog.paths || typeof catalog.paths !== 'object') {
      throw new Error();
    }
  } catch {
    throw new BackendVerificationError('The expected loopback PostgREST catalog is unavailable.');
  }
  log('[backend] Local project, containers, Auth and PostgREST endpoints verified.');
  supabase('Local migration application', ['migration', 'up', '--local']);
  log('[backend] Pending local migrations applied; existing data preserved.');
  supabase('Local database lint', [
    'db',
    'lint',
    '--local',
    '--schema',
    'public',
    '--fail-on',
    'error',
  ]);
  log('[backend] Public database functions passed lint.');
  supabase('Local pgTAP suite', ['test', 'db', '--local']);
  log('[backend] Local pgTAP suite passed.');
  const reportText = execute(
    'Real local Auth integration',
    process.execPath,
    [
      resolve(root, 'node_modules/vitest/vitest.mjs'),
      'run',
      'tests/access/parent-account-local.integration.test.ts',
      '--reporter=json',
      '--maxWorkers=1',
    ],
    {
      GHAF_LOCAL_ACCOUNT_TEST: '1',
      GHAF_LOCAL_SUPABASE_URL: publicConfig.url,
      GHAF_LOCAL_SUPABASE_PUBLISHABLE_KEY: publicConfig.publishableKey,
      EXPO_NO_DOTENV: '1',
    },
  );
  let report;
  try {
    report = JSON.parse(reportText);
  } catch {
    throw new BackendVerificationError(
      'Real Auth integration did not produce its expected report.',
    );
  }
  if (
    report?.success !== true ||
    !Number.isInteger(report.numPassedTests) ||
    report.numPassedTests < 1 ||
    report.numPendingTests !== 0
  ) {
    throw new BackendVerificationError('Real Auth integration failed or was skipped.');
  }
  log(`[backend] Real Auth integration passed (${report.numPassedTests} test, none skipped).`);
  log(
    '[backend] Local verification complete. Docker services remain running; no hosted changes made.',
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  verifyLocalBackend().catch((error) => {
    console.error(
      error instanceof BackendVerificationError
        ? error.message
        : 'Backend verification could not complete because local tooling failed.',
    );
    process.exitCode = 1;
  });
}
