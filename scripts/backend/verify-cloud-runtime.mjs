import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const toolingRoot = resolve(repositoryRoot, 'output/supabase-migration/tooling/pglite');
const evidenceRoot = resolve(repositoryRoot, 'output/supabase-migration');
const evidenceScope = 'In-memory PostgreSQL SQL tests with a minimal Supabase Auth SQL facade';

function snapshotValidator() {
  const require = createRequire(import.meta.url);
  const ts = require('typescript');
  const compile = (path, localRequire = require) => {
    const source = readFileSync(resolve(repositoryRoot, path), 'utf8');
    const compiled = ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    }).outputText;
    const module = { exports: {} };
    new Function('require', 'exports', 'module', compiled)(localRequire, module.exports, module);
    return module.exports;
  };
  const model = compile('src/models/cloudFamily.ts');
  return compile('src/features/cloudFamily/validation.ts', (name) =>
    name === '../../models/cloudFamily' ? model : require(name),
  );
}

class VerificationError extends Error {
  constructor(reason) {
    super(reason);
    this.reason = reason;
  }
}

// This facade supplies SQL dependencies only. It does not run GoTrue or verify JWT signatures.
const authFacade = `
create role anon nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
create role authenticated nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
create role service_role nologin nosuperuser nocreatedb nocreaterole noinherit bypassrls;
create role authenticator nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
grant anon, authenticated, service_role to authenticator;
create schema auth;
create schema extensions;
grant usage on schema public, auth, extensions to anon, authenticated, service_role;

create table auth.users (
  instance_id uuid,
  id uuid primary key,
  aud varchar(255),
  role varchar(255),
  email varchar(255),
  encrypted_password varchar(255),
  email_confirmed_at timestamptz,
  invited_at timestamptz,
  confirmation_token varchar(255),
  confirmation_sent_at timestamptz,
  recovery_token varchar(255),
  recovery_sent_at timestamptz,
  email_change_token_new varchar(255),
  email_change varchar(255),
  email_change_sent_at timestamptz,
  last_sign_in_at timestamptz,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  is_super_admin boolean,
  created_at timestamptz,
  updated_at timestamptz,
  phone text,
  phone_confirmed_at timestamptz,
  banned_until timestamptz,
  deleted_at timestamptz,
  is_sso_user boolean not null default false,
  is_anonymous boolean not null default false
);
create table auth.sessions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz,
  updated_at timestamptz,
  factor_id uuid,
  aal text,
  not_after timestamptz,
  refreshed_at timestamptz,
  user_agent text,
  ip inet,
  tag text
);
revoke all on auth.users, auth.sessions from public, anon, authenticated, service_role;

create function auth.uid() returns uuid language sql stable as $facade$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'
  )::uuid;
$facade$;
create function auth.jwt() returns jsonb language sql stable as $facade$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb);
$facade$;
create function auth.role() returns text language sql stable as $facade$
  select coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'
  );
$facade$;
create extension pgcrypto with schema extensions;
set search_path = public, extensions;
`;

function readSqlFiles(directory, pattern) {
  const files = readdirSync(resolve(repositoryRoot, directory), { withFileTypes: true })
    .filter((entry) => entry.name.endsWith('.sql'))
    .sort((left, right) => left.name.localeCompare(right.name));
  if (files.length === 0) throw new VerificationError('missing_sql_files');
  return files.map((entry) => {
    if (!entry.isFile() || !pattern.test(entry.name)) {
      throw new VerificationError('unexpected_sql_file');
    }
    const source = readFileSync(resolve(repositoryRoot, directory, entry.name), 'utf8');
    if (!source.trim()) throw new VerificationError('empty_sql_file');
    return {
      name: entry.name,
      source,
      sha256: createHash('sha256').update(source).digest('hex'),
    };
  });
}

function requireRollbackSuite(source) {
  const withoutComments = source.replace(/^\s*--[^\r\n]*/gmu, '').trim();
  if (
    !/^begin\s*;/iu.test(withoutComments) ||
    !/rollback\s*;\s*$/iu.test(withoutComments) ||
    !/\bselect\s+(?:\*\s+from\s+)?(?:extensions\.)?finish\s*\(/iu.test(source) ||
    /^\s*\\/mu.test(source)
  ) {
    throw new VerificationError('suite_requires_rollback_and_finish');
  }
}

function isolatedModule(packageName, version, modulePath) {
  const packageRoot = resolve(toolingRoot, 'node_modules', packageName);
  const installed = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8'));
  if (installed.version !== version) throw new VerificationError('unexpected_tooling_version');
  const file = realpathSync(resolve(packageRoot, modulePath));
  const relativePath = relative(realpathSync(toolingRoot), file);
  if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
    throw new VerificationError('tooling_path_escaped');
  }
  return pathToFileURL(file).href;
}

// Parse TAP values without logging query results, fixture identities, or SQL diagnostics.
export function summarizeTap(results) {
  const lines = results.flatMap((result) =>
    (result.rows ?? []).flatMap((row) =>
      Object.values(row).flatMap((value) =>
        typeof value === 'string' ? value.split(/\r?\n/u) : [],
      ),
    ),
  );
  const assertions = [];
  const plans = [];
  let bailedOut = false;
  for (const raw of lines) {
    const line = raw.trim();
    const assertion = line.match(/^(not ok|ok)\b(?:\s+(\d+))?(?:\s|$)/u);
    if (assertion) {
      assertions.push({
        number: assertion[2] === undefined ? null : Number(assertion[2]),
        passed: assertion[1] === 'ok',
        skipped: /#\s*skip\b/iu.test(line),
      });
    }
    const plan = line.match(/^1\.\.(\d+)(?:\s|$)/u);
    if (plan) plans.push(Number(plan[1]));
    if (/^Bail out!/iu.test(line)) bailedOut = true;
  }
  const failedAssertions = assertions
    .filter((assertion) => !assertion.passed)
    .map((assertion) => assertion.number);
  const planValid =
    plans.length === 1 &&
    plans[0] > 0 &&
    plans[0] === assertions.length &&
    assertions.every((assertion, index) => assertion.number === index + 1);
  return {
    assertions: assertions.length,
    passed: assertions.filter((assertion) => assertion.passed && !assertion.skipped).length,
    skipped: assertions.filter((assertion) => assertion.skipped).length,
    failedAssertions,
    diagnostics: lines.filter((line) => /^(?:not ok|#)/u.test(line.trim())).slice(0, 80),
    planValid,
    bailedOut,
    ok: planValid && failedAssertions.length === 0 && !bailedOut,
  };
}

export async function verifyCloudRuntime() {
  const receipt = {
    scope: evidenceScope,
    pglite: '0.5.8',
    pgtap: '0.0.9',
    startedAt: new Date().toISOString(),
    database: 'memory only; no network connection',
    providerAuth: 'NOT RUN',
    hostedMigration: 'NOT RUN',
    native: 'NOT RUN',
    status: 'FAILED',
    stage: 'preflight',
    migrations: [],
    suites: [],
    snapshotContracts: [],
  };
  let database;
  const syntheticContracts = [];
  console.log(`[sql-only] ${evidenceScope}.`);
  console.log(
    '[sql-only] GoTrue, JWT signature verification, hosted access and native tests are NOT RUN.',
  );
  try {
    const validators = snapshotValidator();
    const migrations = readSqlFiles('supabase/migrations', /^\d{14}_[a-z0-9_]+\.sql$/u);
    const suites = readSqlFiles('supabase/tests/database', /^[a-z0-9_-]+\.test\.sql$/u);
    for (const suite of suites) requireRollbackSuite(suite.source);
    if (
      new Set(migrations.map((migration) => migration.name.slice(0, 14))).size !== migrations.length
    ) {
      throw new VerificationError('duplicate_migration_version');
    }
    const [{ PGlite }, { pgcrypto }, { pgtap }] = await Promise.all([
      import(isolatedModule('@electric-sql/pglite', '0.5.8', 'dist/index.js')),
      import(isolatedModule('@electric-sql/pglite', '0.5.8', 'dist/contrib/pgcrypto.js')),
      import(isolatedModule('@electric-sql/pglite-pgtap', '0.0.9', 'dist/index.js')),
    ]);
    receipt.stage = 'auth_sql_facade';
    database = await PGlite.create('memory://', { extensions: { pgcrypto, pgtap } });
    await database.exec(authFacade);
    const runtime = await database.query(
      "select current_setting('server_version') as version, current_user as runner",
    );
    receipt.postgresVersion = runtime.rows[0]?.version;
    const runner = runtime.rows[0]?.runner;
    const roles = await database.query(
      "select rolname, rolsuper, rolbypassrls from pg_roles where rolname in ('anon', 'authenticated', 'service_role')",
    );
    if (
      roles.rows.length !== 3 ||
      roles.rows.some(
        (role) => role.rolsuper || role.rolbypassrls !== (role.rolname === 'service_role'),
      )
    ) {
      throw new VerificationError('invalid_test_role_authority');
    }
    console.log(
      `[sql-only] PostgreSQL ${receipt.postgresVersion}; restricted database roles initialized.`,
    );

    for (const migration of migrations) {
      receipt.stage = 'migration';
      receipt.file = migration.name;
      await database.exec(migration.source);
      receipt.migrations.push({ name: migration.name, sha256: migration.sha256, status: 'PASSED' });
      console.log(`[sql-only] Migration PASSED: ${migration.name}`);
    }

    for (const suite of suites) {
      receipt.stage = 'pgtap';
      receipt.file = suite.name;
      const results = await database.exec(suite.source);
      for (const result of results) {
        for (const row of result.rows ?? []) {
          if (
            (!row.contract_snapshot && !row.contract_result) ||
            typeof row.contract_label !== 'string'
          )
            continue;
          const snapshot = row.contract_snapshot ?? row.contract_result.snapshot;
          const actor = snapshot.actor;
          try {
            const expected = {
              role: actor.role,
              userId: actor.user_id,
              familyId: actor.family_id,
              childId: actor.child_id ?? undefined,
            };
            if (row.contract_result)
              validators.parseCloudCommandResult(row.contract_result, expected);
            else validators.parseCloudSnapshot(snapshot, expected);
            syntheticContracts.push({
              label: row.contract_label,
              snapshot,
              result: row.contract_result?.result,
            });
            receipt.snapshotContracts.push({
              suite: suite.name,
              label: row.contract_label,
              status: 'PASSED',
            });
          } catch {
            mkdirSync(evidenceRoot, { recursive: true });
            const artifact = `synthetic-contract-failure-${receipt.startedAt.replace(/[:.]/gu, '-')}.json`;
            writeFileSync(
              resolve(evidenceRoot, artifact),
              JSON.stringify(
                {
                  suite: suite.name,
                  label: row.contract_label,
                  snapshot,
                  result: row.contract_result?.result,
                },
                null,
                2,
              ),
              { flag: 'wx' },
            );
            receipt.snapshotContracts.push({
              suite: suite.name,
              label: row.contract_label,
              status: 'FAILED',
              artifact,
            });
            throw new VerificationError('snapshot_contract_failed');
          }
        }
      }
      const summary = summarizeTap(results);
      receipt.suites.push({ name: suite.name, sha256: suite.sha256, ...summary });
      console.log(`[sql-only] ${suite.name}: ${JSON.stringify(summary)}`);
      const cleanup = await database.query(
        'select current_user = $1 as role_restored, (select count(*) from auth.users) = 0 as no_users, (select count(*) from auth.sessions) = 0 as no_sessions',
        [runner],
      );
      if (
        !cleanup.rows[0]?.role_restored ||
        !cleanup.rows[0]?.no_users ||
        !cleanup.rows[0]?.no_sessions
      ) {
        throw new VerificationError('suite_rollback_not_preserved');
      }
    }
    receipt.totalAssertions = receipt.suites.reduce((total, suite) => total + suite.assertions, 0);
    if (receipt.suites.some((suite) => !suite.ok)) {
      throw new VerificationError('pgtap_assertion_or_plan_failed');
    }
    if (receipt.snapshotContracts.length === 0)
      throw new VerificationError('snapshot_contract_not_exercised');
    console.log(
      `[sql-only] Real SQL snapshot contracts PASSED: ${receipt.snapshotContracts.length}`,
    );
    receipt.status = 'PASSED';
    receipt.stage = 'complete';
    mkdirSync(evidenceRoot, { recursive: true });
    const artifact = `synthetic-contracts-${receipt.startedAt.replace(/[:.]/gu, '-')}.json`;
    writeFileSync(resolve(evidenceRoot, artifact), JSON.stringify(syntheticContracts, null, 2), {
      flag: 'wx',
    });
    receipt.syntheticContractArtifact = artifact;
  } catch (error) {
    receipt.failure = {
      reason: error instanceof VerificationError ? error.reason : 'sql_or_tooling_error',
      sqlState:
        typeof error?.code === 'string' && /^[A-Z0-9]{5}$/u.test(error.code) ? error.code : null,
      position: /^\d+$/u.test(String(error?.position)) ? Number(error.position) : null,
      diagnostic: typeof error?.message === 'string' ? error.message.slice(0, 400) : null,
      internalPosition: /^\d+$/u.test(String(error?.internalPosition))
        ? Number(error.internalPosition)
        : null,
      context: typeof error?.where === 'string' ? error.where.slice(0, 1000) : null,
    };
    console.error(
      `[sql-only] FAILED: ${JSON.stringify({ stage: receipt.stage, file: receipt.file, ...receipt.failure })}`,
    );
  } finally {
    if (database) {
      try {
        await database.close();
      } catch {
        receipt.status = 'FAILED';
        receipt.failure = { reason: 'in_memory_database_close_failed', sqlState: null };
      }
    }
  }
  receipt.finishedAt = new Date().toISOString();
  const filename = `sql-verification-${receipt.startedAt.replace(/[:.]/gu, '-')}.json`;
  mkdirSync(evidenceRoot, { recursive: true });
  writeFileSync(resolve(evidenceRoot, filename), `${JSON.stringify(receipt, null, 2)}\n`, {
    flag: 'wx',
  });
  console.log(`[sql-only] ${receipt.status}; receipt: output/supabase-migration/${filename}`);
  return receipt;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (process.argv.length !== 2) {
    console.error('Usage: node scripts/backend/verify-cloud-runtime.mjs');
    process.exitCode = 1;
  } else {
    verifyCloudRuntime()
      .then((receipt) => {
        if (receipt.status !== 'PASSED') process.exitCode = 1;
      })
      .catch(() => {
        console.error(
          '[sql-only] FAILED: unable to initialize tooling or write the sanitized receipt.',
        );
        process.exitCode = 1;
      });
  }
}
