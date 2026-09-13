import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const definitions = {
  playwright: {
    entry: '@playwright/mcp/cli.js',
    args: [
      '--headless',
      '--isolated',
      '--browser',
      'firefox',
      '--sandbox',
      '--output-dir',
      resolve(root, 'output/playwright', String(process.pid)),
    ],
  },
  'sequential-thinking': {
    entry: '@modelcontextprotocol/server-sequential-thinking/dist/index.js',
    args: [],
  },
};
const definition = definitions[process.argv[2]];

if (!definition || process.argv.length !== 3) {
  console.error('Usage: node scripts/tooling/mcp.mjs playwright|sequential-thinking');
  process.exit(1);
}

const entry = resolve(root, 'tools/codex/node_modules', definition.entry);
if (!existsSync(entry)) {
  console.error('Missing Ghaf tooling. Run: npm ci --prefix tools/codex --ignore-scripts');
  process.exit(1);
}

const child = spawn(process.execPath, [entry, ...definition.args], {
  cwd: root,
  env: { ...process.env, DISABLE_THOUGHT_LOGGING: 'true' },
  stdio: 'inherit',
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
child.on('error', (error) => {
  console.error(`Ghaf MCP launch failed: ${error.message}`);
  process.exitCode = 1;
});
child.on('exit', (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
