import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(new URL('../../tools/codex/package.json', import.meta.url));
const { Client } = await import(
  pathToFileURL(require.resolve('@modelcontextprotocol/sdk/client/index.js'))
);
const { StdioClientTransport } = await import(
  pathToFileURL(require.resolve('@modelcontextprotocol/sdk/client/stdio.js'))
);
const { StreamableHTTPClientTransport } = await import(
  pathToFileURL(require.resolve('@modelcontextprotocol/sdk/client/streamableHttp.js'))
);
const launcher = fileURLToPath(new URL('./mcp.mjs', import.meta.url));
const syntheticMessage = 'Synthetic connection check: the prepared fallback remains available.';
const online = process.argv.slice(2).includes('--online');
const options = { timeout: 25000 };
let failed = false;

async function check(name, transport, exercise) {
  const client = new Client({ name: 'ghaf-tooling-check', version: '1.0.0' });
  try {
    await client.connect(transport, options);
    const result = await client.listTools({}, options);
    assert.ok(result.tools.length > 0, 'Server returned no tools');
    const detail = await exercise(client, result.tools);
    console.log(JSON.stringify({ name, status: 'PASSED', tools: result.tools.length, detail }));
  } catch (error) {
    failed = true;
    console.error(JSON.stringify({ name, status: 'FAILED', error: error.message }));
  } finally {
    await client.close();
  }
}

function localTransport(name) {
  return new StdioClientTransport({
    command: process.execPath,
    args: [launcher, name],
    cwd: tmpdir(),
    stderr: 'pipe',
  });
}

const sequential = localTransport('sequential-thinking');
let sequentialStderr = '';
sequential.stderr.on('data', (data) => {
  sequentialStderr += data.toString();
});
await check('sequential-thinking', sequential, async (client, tools) => {
  assert.ok(tools.some((tool) => tool.name === 'sequentialthinking'));
  const result = await client.callTool(
    {
      name: 'sequentialthinking',
      arguments: {
        thought: syntheticMessage,
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      },
    },
    undefined,
    options,
  );
  assert.ok(!result.isError, 'Synthetic tool call failed');
  assert.ok(!sequentialStderr.includes(syntheticMessage), 'Thought text appeared in stderr');
  return 'Initialize, list tools, synthetic call, no thought text in stderr; launched from temp directory';
});

const fixture = createServer((_request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(
    '<!doctype html><html lang="en"><title>Ghaf tooling check</title><main><h1>Synthetic browser fixture</h1></main></html>',
  );
});
await new Promise((resolve) => fixture.listen(0, '127.0.0.1', resolve));
try {
  await check('playwright', localTransport('playwright'), async (client, tools) => {
    assert.ok(tools.some((tool) => tool.name === 'browser_navigate'));
    const result = await client.callTool(
      {
        name: 'browser_navigate',
        arguments: { url: `http://127.0.0.1:${fixture.address().port}` },
      },
      undefined,
      options,
    );
    assert.ok(!result.isError, JSON.stringify(result));
    const snapshot = await client.callTool(
      { name: 'browser_snapshot', arguments: {} },
      undefined,
      options,
    );
    assert.ok(!snapshot.isError, 'Browser snapshot failed');
    assert.ok(
      JSON.stringify(snapshot).includes('Synthetic browser fixture'),
      `Fixture not visible: ${JSON.stringify(snapshot)}`,
    );
    await client.callTool({ name: 'browser_close', arguments: {} }, undefined, options);
    return 'Initialize, list tools, isolated Firefox opens local synthetic fixture with sandbox requested; launched from temp directory';
  });
} finally {
  await new Promise((resolve) => fixture.close(resolve));
}

if (online) {
  await check(
    'context7',
    new StreamableHTTPClientTransport(new URL('https://mcp.context7.com/mcp')),
    async (client, tools) => {
      assert.ok(tools.some((tool) => tool.name === 'resolve-library-id'));
      const result = await client.callTool(
        {
          name: 'resolve-library-id',
          arguments: {
            libraryName: 'expo',
            query: 'Find public Expo SDK documentation for accessible text and RTL layout.',
          },
        },
        undefined,
        options,
      );
      assert.ok(!result.isError, 'Public documentation lookup failed');
      assert.ok(
        JSON.stringify(result).toLowerCase().includes('expo'),
        'Lookup did not return Expo',
      );
      return 'Initialize, list tools, public Expo documentation lookup without credentials or project data';
    },
  );
} else {
  console.log(
    JSON.stringify({
      name: 'context7',
      status: 'NOT RUN',
      detail: 'Use --online for the public documentation lookup',
    }),
  );
}

process.exitCode = failed ? 1 : 0;
