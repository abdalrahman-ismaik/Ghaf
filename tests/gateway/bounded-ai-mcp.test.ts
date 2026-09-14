import { webcrypto } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import type {
  CapabilityTokenClaims,
  ChildCoachTextRequestV1,
  ParentTaskDraftRequestV1,
} from '@/models/boundedAi';
import {
  createPreparedChildCoachResponse,
  createPreparedParentTaskDraftSuggestion,
} from '@/services';
import {
  GHAF_MCP_PROTOCOL_VERSION,
  GHAF_MCP_TOOL_OPERATIONS,
  createGhafMcpHandler,
  type GhafMcpOperations,
} from '../../workers/ghaf-ai-gateway/src/mcp';
import worker, { type AiGatewayWorkerEnv } from '../../workers/ghaf-ai-gateway/src/index';
import { MemoryReplayStore } from '../../workers/ghaf-ai-gateway/src/security';

const CAPABILITY_SECRET = 'synthetic-test-secret-at-least-thirty-two-bytes';

const parentRequest: ParentTaskDraftRequestV1 = {
  operation: 'draft_parent_task_v1',
  schemaVersion: '1.0',
  requestId: 'request_mcp_parent_1234',
  bindingNonce: 'binding_mcp_parent_1234',
  localeSet: 'ar_en',
  ageBand: '9_11',
  archetypeId: 'task_recycling_p0_v1',
  catalogVersion: 1,
  intent: 'make_clearer',
  effortBand: 'fifteen_thirty',
  stepCount: 2,
  supportMode: 'adult_alongside',
};

const childRequest: ChildCoachTextRequestV1 = {
  operation: 'coach_approved_task_v1',
  schemaVersion: '1.0',
  requestId: 'request_mcp_child_12345',
  taskBindingNonce: 'binding_mcp_child_12345',
  locale: 'ar',
  taskArchetypeId: 'task_recycling_p0_v1',
  catalogVersion: 1,
  approvedTaskVersion: 1,
  noticeVersion: 1,
  grantVersion: 1,
  ageBand: '6_8',
  intent: 'show_next_step',
};

const unsafeChildRequest: ChildCoachTextRequestV1 = {
  ...childRequest,
  ageBand: '12_14',
  intent: 'clarify_step',
  topic: 'clarify_step',
  boundedText: 'Call me at +971 50 123 4567',
  inputOrigin: 'typed',
};

const envelopeMeta = {
  'io.modelcontextprotocol/protocolVersion': '2026-07-28',
  'io.modelcontextprotocol/clientInfo': { name: 'ghaf-synthetic-test', version: '1.0.0' },
  'io.modelcontextprotocol/clientCapabilities': {},
};

function mcpRequest(input: {
  readonly method: string;
  readonly name?: string;
  readonly arguments?: unknown;
  readonly modern?: boolean;
  readonly authorization?: string;
}): Request {
  const modern = input.modern ?? true;
  const headers = new Headers({ 'content-type': 'application/json', host: 'gateway.example' });
  if (modern) {
    headers.set('MCP-Protocol-Version', GHAF_MCP_PROTOCOL_VERSION);
    headers.set('Mcp-Method', input.method);
    if (input.name) headers.set('Mcp-Name', input.name);
  }
  if (input.authorization) headers.set('authorization', `Bearer ${input.authorization}`);
  return new Request('https://gateway.example/mcp', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: input.method,
      params: {
        ...(input.name ? { name: input.name, arguments: input.arguments ?? {} } : {}),
        ...(modern ? { _meta: envelopeMeta } : {}),
      },
    }),
  });
}

async function capabilityToken(
  scope: CapabilityTokenClaims['scope'],
  role: CapabilityTokenClaims['role'],
  jti: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1_000);
  const claims: CapabilityTokenClaims = {
    iss: 'ghaf-test-broker',
    aud: 'ghaf-bounded-ai-gateway',
    sub: role === 'parent' ? 'subject_mcp_parent_1234' : 'subject_mcp_child_12345',
    tenant: 'tenant_mcp_family_1234',
    role,
    scope,
    grantVersion: role === 'child' ? 1 : null,
    noticeVersion: role === 'child' ? 1 : null,
    iat: now,
    exp: now + 300,
    jti,
    synthetic: true,
  };
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const key = await webcrypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(CAPABILITY_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await webcrypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`v1.${payload}`),
  );
  return `v1.${payload}.${Buffer.from(signature).toString('base64url')}`;
}

function workerEnv(mcpEnabled: boolean): AiGatewayWorkerEnv & { readonly MCP_ENABLED: string } {
  return {
    AI: { run: vi.fn().mockResolvedValue({ response: {} }) },
    PARENT_DRAFT_RATE_LIMITER: { limit: vi.fn().mockResolvedValue({ success: true }) },
    CHILD_TEXT_RATE_LIMITER: { limit: vi.fn().mockResolvedValue({ success: true }) },
    CHILD_VOICE_RATE_LIMITER: { limit: vi.fn().mockResolvedValue({ success: true }) },
    CAPABILITY_HMAC_SECRET: CAPABILITY_SECRET,
    CAPABILITY_ISSUER: 'ghaf-test-broker',
    CAPABILITY_AUDIENCE: 'ghaf-bounded-ai-gateway',
    REPLAY_STORE: new MemoryReplayStore(),
    OPERATION_BUDGET_STORE: {
      acquire: vi.fn().mockResolvedValue({ success: true, leaseId: 'lease_mcp_1234' }),
      release: vi.fn().mockResolvedValue(undefined),
    },
    MCP_ENABLED: mcpEnabled ? 'true' : 'false',
    MCP_ALLOWED_HOST: 'gateway.example',
  };
}

function operations(
  authorizedOperation: GhafMcpOperations['authorizedOperation'],
): GhafMcpOperations {
  return {
    authorizedOperation,
    executeParentTaskDraft: vi.fn(async (request) => ({
      ok: true as const,
      data: createPreparedParentTaskDraftSuggestion({
        requestId: request.requestId,
        bindingNonce: request.bindingNonce,
        archetypeId: request.archetypeId,
      })!,
    })),
    executeChildCoach: vi.fn(async (request) => ({
      ok: true as const,
      data: createPreparedChildCoachResponse(request),
    })),
  };
}

async function responseBody(response: Response): Promise<Record<string, unknown>> {
  return (await response.json()) as Record<string, unknown>;
}

function sourceFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return ['.ts', '.tsx', '.js', '.jsx'].includes(extname(path)) ? [path] : [];
  });
}

describe('Feature 004 minimal MCP adapter', () => {
  it('discovers exactly two read-only text tools and no other capability', async () => {
    const handler = createGhafMcpHandler(operations(null));
    const response = await handler.fetch(mcpRequest({ method: 'tools/list' }));
    const body = await responseBody(response);
    const result = body.result as { readonly tools: readonly Record<string, unknown>[] };

    expect(response.status).toBe(200);
    expect(result.tools.map((tool) => tool.name)).toEqual(Object.keys(GHAF_MCP_TOOL_OPERATIONS));
    for (const tool of result.tools) {
      expect(tool.annotations).toMatchObject({
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      });
      expect(tool.inputSchema).toMatchObject({ type: 'object' });
      expect(JSON.stringify(tool.inputSchema)).toContain('"additionalProperties":false');
      expect(tool.outputSchema).toMatchObject({ type: 'object', additionalProperties: false });
    }

    const discovery = await responseBody(
      await handler.fetch(mcpRequest({ method: 'server/discover' })),
    );
    const capabilities = (discovery.result as { readonly capabilities: Record<string, unknown> })
      .capabilities;
    expect(Object.keys(capabilities)).toEqual(['tools']);
  });

  it('returns the existing Parent DTO as structured content', async () => {
    const configured = operations('draft_parent_task_v1');
    const response = await createGhafMcpHandler(configured).fetch(
      mcpRequest({ method: 'tools/call', name: 'draft_parent_task', arguments: parentRequest }),
    );
    const body = await responseBody(response);
    const result = body.result as {
      readonly structuredContent: unknown;
      readonly content: readonly { readonly text: string }[];
    };

    expect(result.structuredContent).toEqual(
      createPreparedParentTaskDraftSuggestion({
        requestId: parentRequest.requestId,
        bindingNonce: parentRequest.bindingNonce,
        archetypeId: parentRequest.archetypeId,
      }),
    );
    expect(result.content).toEqual([{ type: 'text', text: 'Bounded Parent task draft ready.' }]);
    expect(configured.executeParentTaskDraft).toHaveBeenCalledOnce();
    expect(configured.executeChildCoach).not.toHaveBeenCalled();
  });

  it('returns the existing terminal Child Coach DTO as structured content', async () => {
    const configured = operations('coach_approved_task_v1');
    const response = await createGhafMcpHandler(configured).fetch(
      mcpRequest({ method: 'tools/call', name: 'coach_current_task', arguments: childRequest }),
    );
    const body = await responseBody(response);
    const result = body.result as { readonly structuredContent: unknown };

    expect(result.structuredContent).toEqual(createPreparedChildCoachResponse(childRequest));
    expect(configured.executeChildCoach).toHaveBeenCalledOnce();
    expect(configured.executeParentTaskDraft).not.toHaveBeenCalled();
  });

  it('fails closed for legacy traffic, wrong scope, and unknown arguments', async () => {
    const parentOnly = operations('draft_parent_task_v1');
    const legacy = await createGhafMcpHandler(parentOnly).fetch(
      mcpRequest({ method: 'initialize', modern: false }),
    );
    expect(legacy.status).toBe(400);

    const wrongScope = await createGhafMcpHandler(parentOnly).fetch(
      mcpRequest({ method: 'tools/call', name: 'coach_current_task', arguments: childRequest }),
    );
    expect(JSON.stringify(await responseBody(wrongScope))).toContain('FORBIDDEN');
    expect(parentOnly.executeChildCoach).not.toHaveBeenCalled();

    const unknownArgument = await createGhafMcpHandler(parentOnly).fetch(
      mcpRequest({
        method: 'tools/call',
        name: 'draft_parent_task',
        arguments: { ...parentRequest, privateChildName: 'canary-private-name' },
      }),
    );
    const unknownBody = await responseBody(unknownArgument);
    expect(JSON.stringify(unknownBody)).not.toContain('canary-private-name');
    expect(parentOnly.executeParentTaskDraft).not.toHaveBeenCalled();
  });

  it('keeps the MCP dependency outside the Expo application graph', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      readonly dependencies?: Record<string, string>;
    };
    expect(packageJson.dependencies?.['@modelcontextprotocol/server']).toBe('2.0.0');

    const mobileSources = [...sourceFiles('app'), ...sourceFiles('src')];
    for (const path of mobileSources) {
      const source = readFileSync(path, 'utf8');
      expect(source, path).not.toContain('@modelcontextprotocol/');
      expect(source, path).not.toMatch(/\bMCP\b|Model Context Protocol/iu);
    }
  });

  it('keeps the Worker endpoint unavailable unless its server-only switch is exactly true', async () => {
    const env = workerEnv(false);
    const request = mcpRequest({ method: 'tools/list' });
    const response = await worker.fetch(request, env);

    expect(response.status).toBe(404);
    expect(request.bodyUsed).toBe(false);
    expect(env.AI.run).not.toHaveBeenCalled();

    const wrongCaseEnv = { ...workerEnv(true), MCP_ENABLED: 'TRUE' };
    const wrongCaseRequest = mcpRequest({ method: 'tools/list' });
    const wrongCaseResponse = await worker.fetch(wrongCaseRequest, wrongCaseEnv);
    expect(wrongCaseResponse.status).toBe(404);
    expect(wrongCaseRequest.bodyUsed).toBe(false);

    const wrongHostEnv = { ...workerEnv(true), MCP_ALLOWED_HOST: 'different.example' };
    const wrongHostRequest = mcpRequest({ method: 'tools/list' });
    const wrongHostResponse = await worker.fetch(wrongHostRequest, wrongHostEnv);
    expect(wrongHostResponse.status).toBe(403);
    expect(wrongHostRequest.bodyUsed).toBe(false);
  });

  it.each([
    { name: 'draft_parent_task', scope: 'draft_parent_task_v1', role: 'parent' },
    { name: 'coach_current_task', scope: 'coach_approved_task_v1', role: 'child' },
  ] as const)(
    'blocks $name without replay storage before reading tool arguments',
    async ({ name, scope, role }) => {
      const env = { ...workerEnv(true), REPLAY_STORE: undefined };
      const request = mcpRequest({
        method: 'tools/call',
        name,
        arguments: { canaryPrivateChildText: 'must-not-be-read' },
        authorization: await capabilityToken(scope, role, `token_no_replay_${role}_1234`),
      });

      const response = await worker.fetch(request, env);

      expect(response.status).toBe(503);
      expect(await responseBody(response)).toMatchObject({ error: { code: 'BUDGET_BLOCKED' } });
      expect(request.bodyUsed).toBe(false);
      expect(env.AI.run).not.toHaveBeenCalled();
      expect(env.OPERATION_BUDGET_STORE?.acquire).not.toHaveBeenCalled();
      expect(env.PARENT_DRAFT_RATE_LIMITER.limit).not.toHaveBeenCalled();
      expect(env.CHILD_TEXT_RATE_LIMITER.limit).not.toHaveBeenCalled();
    },
  );

  it('keeps public MCP tool discovery available without replay storage or inference', async () => {
    const env = { ...workerEnv(true), REPLAY_STORE: undefined };
    const response = await worker.fetch(mcpRequest({ method: 'tools/list' }), env);

    expect(response.status).toBe(200);
    expect(env.AI.run).not.toHaveBeenCalled();
    expect(env.OPERATION_BUDGET_STORE?.acquire).not.toHaveBeenCalled();
  });

  it('authorizes an MCP tool call before arguments are parsed or inference runs', async () => {
    const env = workerEnv(true);
    const wrongScopeToken = await capabilityToken(
      'draft_parent_task_v1',
      'parent',
      'token_mcp_wrong_scope_1234',
    );
    const request = mcpRequest({
      method: 'tools/call',
      name: 'coach_current_task',
      arguments: { canaryPrivateChildText: 'must-not-be-read' },
      authorization: wrongScopeToken,
    });
    const response = await worker.fetch(request, env);

    expect(response.status).toBe(403);
    expect(request.bodyUsed).toBe(false);
    expect(env.AI.run).not.toHaveBeenCalled();
    expect(JSON.stringify(await responseBody(response))).not.toContain('must-not-be-read');

    const wrongGrantToken = await capabilityToken(
      'coach_approved_task_v1',
      'child',
      'token_mcp_wrong_grant_1234',
    );
    const wrongGrantRequest = mcpRequest({
      method: 'tools/call',
      name: 'coach_current_task',
      arguments: { ...childRequest, grantVersion: 2 },
      authorization: wrongGrantToken,
    });
    const wrongGrantResponse = await worker.fetch(wrongGrantRequest, env);
    expect(wrongGrantResponse.status).toBe(200);
    expect(JSON.stringify(await responseBody(wrongGrantResponse))).toContain('FORBIDDEN');
    expect(env.AI.run).not.toHaveBeenCalled();
  });

  it('routes discovery and both authorized tools through the Worker boundary', async () => {
    const env = workerEnv(true);
    const parentSuggestion = createPreparedParentTaskDraftSuggestion({
      requestId: parentRequest.requestId,
      bindingNonce: parentRequest.bindingNonce,
      archetypeId: parentRequest.archetypeId,
    });
    const childResponse = createPreparedChildCoachResponse(childRequest);
    vi.mocked(env.AI.run)
      .mockResolvedValueOnce({ response: parentSuggestion })
      .mockResolvedValueOnce({ response: childResponse });

    const discovery = await worker.fetch(mcpRequest({ method: 'tools/list' }), env);
    expect(discovery.status).toBe(200);
    expect(discovery.headers.get('cache-control')).toBe('no-store');
    const discoveryBody = await responseBody(discovery);
    expect(
      (
        discoveryBody.result as {
          readonly tools: readonly { readonly name: string }[];
        }
      ).tools.map((tool) => tool.name),
    ).toEqual(['draft_parent_task', 'coach_current_task']);

    const parent = await worker.fetch(
      mcpRequest({
        method: 'tools/call',
        name: 'draft_parent_task',
        arguments: parentRequest,
        authorization: await capabilityToken(
          'draft_parent_task_v1',
          'parent',
          'token_mcp_parent_success_1234',
        ),
      }),
      env,
    );
    expect(parent.status).toBe(200);
    expect(
      (await responseBody(parent)).result as { readonly structuredContent: unknown },
    ).toMatchObject({ structuredContent: parentSuggestion });

    const child = await worker.fetch(
      mcpRequest({
        method: 'tools/call',
        name: 'coach_current_task',
        arguments: childRequest,
        authorization: await capabilityToken(
          'coach_approved_task_v1',
          'child',
          'token_mcp_child_success_12345',
        ),
      }),
      env,
    );
    expect(child.status).toBe(200);
    expect(
      (await responseBody(child)).result as { readonly structuredContent: unknown },
    ).toMatchObject({ structuredContent: childResponse });
    expect(env.AI.run).toHaveBeenCalledTimes(2);
    expect(env.OPERATION_BUDGET_STORE?.release).toHaveBeenCalledTimes(2);
  });

  it('rejects unknown capabilities and replay before another inference', async () => {
    const env = workerEnv(true);
    const parentSuggestion = createPreparedParentTaskDraftSuggestion({
      requestId: parentRequest.requestId,
      bindingNonce: parentRequest.bindingNonce,
      archetypeId: parentRequest.archetypeId,
    });
    vi.mocked(env.AI.run).mockResolvedValue({ response: parentSuggestion });

    const unknown = mcpRequest({
      method: 'tools/call',
      name: 'grow_garden',
      arguments: { canaryPrivateValue: 'must-not-be-read' },
    });
    const unknownResponse = await worker.fetch(unknown, env);
    expect(unknownResponse.status).toBe(404);
    expect(unknown.bodyUsed).toBe(false);
    expect(env.AI.run).not.toHaveBeenCalled();

    const token = await capabilityToken(
      'draft_parent_task_v1',
      'parent',
      'token_mcp_replay_check_1234',
    );
    const first = await worker.fetch(
      mcpRequest({
        method: 'tools/call',
        name: 'draft_parent_task',
        arguments: parentRequest,
        authorization: token,
      }),
      env,
    );
    expect(first.status).toBe(200);

    const replay = mcpRequest({
      method: 'tools/call',
      name: 'draft_parent_task',
      arguments: { canaryPrivateValue: 'must-not-be-read-on-replay' },
      authorization: token,
    });
    const replayResponse = await worker.fetch(replay, env);
    expect(replayResponse.status).toBe(409);
    expect(replay.bodyUsed).toBe(false);
    expect(env.AI.run).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(await responseBody(replayResponse))).not.toContain(
      'must-not-be-read-on-replay',
    );
  });

  it('rechecks bounded Child input server-side before a model call', async () => {
    const env = workerEnv(true);
    const response = await worker.fetch(
      mcpRequest({
        method: 'tools/call',
        name: 'coach_current_task',
        arguments: unsafeChildRequest,
        authorization: await capabilityToken(
          'coach_approved_task_v1',
          'child',
          'token_mcp_child_safety_12345',
        ),
      }),
      env,
    );
    const body = await responseBody(response);

    expect(response.status).toBe(200);
    expect(JSON.stringify(body)).toContain('SAFETY_REJECTED');
    expect(JSON.stringify(body)).not.toContain(unsafeChildRequest.boundedText ?? '');
    expect(env.AI.run).not.toHaveBeenCalled();
    expect(env.OPERATION_BUDGET_STORE?.release).toHaveBeenCalledOnce();
  });
});
