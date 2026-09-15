import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  authFacade,
  isolatedModule,
  requireRollbackSuite,
  summarizeTap,
} from './verify-cloud-runtime.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const output = resolve(root, 'output/browser-runtime-repair');
const require = createRequire(import.meta.url);
const ts = require('typescript');
const cache = new Map();
function loadSource(filename) {
  const path = resolve(root, filename);
  if (cache.has(path)) return cache.get(path).exports;
  const module = { exports: {} };
  cache.set(path, module);
  const compiled = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const sourceRequire = (name) => {
    if (name.startsWith('@/')) return loadSource(`src/${name.slice(2)}.ts`);
    if (name.startsWith('.')) return loadSource(resolve(dirname(path), `${name}.ts`));
    return require(name);
  };
  new Function('require', 'exports', 'module', compiled)(sourceRequire, module.exports, module);
  return module.exports;
}

const excluded = [
  '20260914182327_normalized_family_runtime.sql',
  '20260914182411_normalized_family_extensions.sql',
  '20260915001400_family_message_retention.sql',
];
const receipt = {
  scope:
    'Hosted-family Masroofi SQL in memory; Cron, normalized runtime, GoTrue, hosted and native NOT RUN',
  startedAt: new Date().toISOString(),
  status: 'FAILED',
  excludedMigrations: excluded,
  migrations: [],
  suites: [],
  contracts: [],
};
let db;
try {
  const [{ PGlite }, { pgcrypto }, { pgtap }] = await Promise.all([
    import(isolatedModule('@electric-sql/pglite', '0.5.8', 'dist/index.js')),
    import(isolatedModule('@electric-sql/pglite', '0.5.8', 'dist/contrib/pgcrypto.js')),
    import(isolatedModule('@electric-sql/pglite-pgtap', '0.0.9', 'dist/index.js')),
  ]);
  db = await PGlite.create('memory://', { extensions: { pgcrypto, pgtap } });
  await db.exec(authFacade);
  const files = readdirSync(resolve(root, 'supabase/migrations'))
    .filter((name) => /^\d{14}_[a-z0-9_]+\.sql$/.test(name) && !excluded.includes(name))
    .sort();
  if (!files.includes('20260915095557_hosted_family_masroofi.sql'))
    throw new Error('Missing Masroofi migration');
  for (const name of files) {
    receipt.current = name;
    const sql = readFileSync(resolve(root, 'supabase/migrations', name), 'utf8');
    if (!sql.trim()) throw new Error('Empty migration');
    await db.exec(sql);
    receipt.migrations.push({ name, sha256: createHash('sha256').update(sql).digest('hex') });
    console.log(`Migration passed: ${name}`);
  }
  for (const name of ['family_masroofi.test.sql']) {
    receipt.current = name;
    const sql = readFileSync(resolve(root, 'supabase/tests/database', name), 'utf8');
    requireRollbackSuite(sql);
    const results = await db.exec(sql);
    const summary = summarizeTap(results);
    receipt.suites.push({ name, ...summary });
    console.log(JSON.stringify({ suite: name, ...summary }));
    if (!summary.ok) throw new Error('SQL assertions failed');
    for (const result of results)
      for (const row of result.rows ?? []) {
        if (!row.contract_snapshot || typeof row.contract_label !== 'string') continue;
        const snapshot = row.contract_snapshot;
        const validation = loadSource('src/features/cloud-masroofi/validation.ts');
        validation.parseCloudMasroofiSnapshot(snapshot, snapshot.actor);
        receipt.contracts.push({
          label: row.contract_label,
          snapshot,
          familySnapshot: row.contract_family_snapshot,
        });
      }
    const remaining = await db.query(
      'select (select count(*) from auth.users)::int as users, (select count(*) from auth.sessions)::int as sessions',
    );
    if (remaining.rows[0].users !== 0 || remaining.rows[0].sessions !== 0)
      throw new Error('SQL suite did not roll back');
  }
  if (receipt.contracts.length === 0) throw new Error('No SQL-to-app snapshot contracts');
  receipt.status = 'PASSED';
} catch (error) {
  receipt.failure = {
    message: error.message?.slice(0, 600),
    code: error.code ?? null,
    position: error.position ?? null,
    internalPosition: error.internalPosition ?? null,
    where: error.where?.slice(0, 1000),
  };
  console.error(
    JSON.stringify({ status: 'FAILED', current: receipt.current, failure: receipt.failure }),
  );
  process.exitCode = 1;
} finally {
  await db?.close();
  receipt.finishedAt = new Date().toISOString();
  mkdirSync(output, { recursive: true });
  const path = resolve(output, `masroofi-sql-${receipt.startedAt.replace(/[:.]/g, '-')}.json`);
  writeFileSync(path, `${JSON.stringify(receipt, null, 2)}\n`, { flag: 'wx' });
  console.log(`${receipt.status}; evidence: ${path}`);
}
