import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// The optional runner dependency is isolated from the application dependency graph.
const require = createRequire(new URL('../../.expo/family-db-tools/package.json', import.meta.url));
const { Client } = require('pg');
const files = process.argv.slice(2);
if (files.length === 0) throw new Error('Pass explicit local pgTAP test paths.');
const client = new Client({
  host: '127.0.0.1',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
  connectionTimeoutMillis: 8000,
});
try {
  await client.connect();
  for (const file of files) {
    const path = resolve(file);
    const testRoot = resolve('supabase/tests/database');
    if (!path.startsWith(`${testRoot}\\`) && !path.startsWith(`${testRoot}/`))
      throw new Error('Only repository database tests are accepted.');
    const response = await client.query(await readFile(path, 'utf8'));
    const replies = Array.isArray(response) ? response : [response];
    const lines = replies
      .flatMap((reply) => reply.rows.flatMap((row) => Object.values(row)))
      .filter((value) => typeof value === 'string' && /^(?:ok |not ok |1\.\.|#)/u.test(value));
    const checks = lines.filter((line) => /^(?:ok |not ok )/u.test(line));
    const failed = checks.filter((line) => /^not ok /u.test(line));
    console.log(`${file}: ${checks.length - failed.length}/${checks.length} passed`);
    if (failed.length) console.log(lines.join('\n'));
    if (lines.some((line) => /(?:^not ok |Looks like you failed|planned .* ran)/u.test(line)))
      process.exitCode = 1;
    if (!lines.some((line) => /^1\.\./u.test(line)))
      throw new Error('Test did not emit a pgTAP plan.');
  }
} catch (error) {
  // PostgreSQL metadata is useful; never print query parameters or connection credentials.
  console.error(`Database tests failed: ${error.code ?? ''} ${error.message}`);
  if (error.where) console.error(error.where);
  process.exitCode = 1;
} finally {
  await client.query('rollback').catch(() => {});
  await client.end();
}
