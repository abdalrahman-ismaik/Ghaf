import { readFileSync } from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import {
  createCanonicalLiveParentGuidePayload,
  LIVE_PARENT_GUIDE_OPERATION,
} from '../src/features/assistants/liveParentGuide';
import { P0_RECYCLING_TEMPLATE } from '../src/features/tasks/demoContent';
import type { ParentGuideRequest } from '../src/models/familyGrowth';
import worker, { type ParentGuideWorkerEnv } from '../workers/ghaf-parent-guide/src/index';

const TOKEN = 'worker-test-token';
const ORIGIN = 'https://demo.example.test';

function requestValue(): ParentGuideRequest {
  return {
    requestId: 'worker-request-v1',
    intent: 'make_clearer',
    locale: 'ar',
    child: { id: 'child_salem', age: 9, ageBand: '9_11', synthetic: true },
    parentText: { ar: 'أخرج مواد إعادة التدوير.', en: 'Take the recycling out.' },
    taskTemplateId: P0_RECYCLING_TEMPLATE.id,
    taskVersion: 1,
    allowedCategoryId: 'green_impact',
    allowedSafety: P0_RECYCLING_TEMPLATE.safety,
    inputOrigin: 'synthetic',
  };
}

function createEnv(options: { rateAllowed?: boolean; modelResult?: unknown } = {}) {
  return {
    GHAF_DEMO_ACCESS_TOKEN: TOKEN,
    ALLOWED_ORIGIN: ORIGIN,
    AI_MODEL: '@cf/meta/llama-3.1-8b-instruct',
    PARENT_GUIDE_RATE_LIMITER: {
      limit: vi.fn().mockResolvedValue({ success: options.rateAllowed ?? true }),
    },
    AI: {
      run: vi.fn().mockResolvedValue(
        options.modelResult ?? {
          response: createCanonicalLiveParentGuidePayload(requestValue()),
        },
      ),
    },
  } satisfies ParentGuideWorkerEnv;
}

function workerRequest(
  options: {
    token?: string;
    origin?: string | null;
    body?: unknown;
    method?: string;
    path?: string;
    contentType?: string;
  } = {},
) {
  const headers = new Headers({
    accept: 'application/json',
    'content-type': options.contentType ?? 'application/json',
  });
  if (options.token !== '') headers.set('authorization', `Bearer ${options.token ?? TOKEN}`);
  if (options.origin !== null) headers.set('origin', options.origin ?? ORIGIN);
  return new Request(`https://worker.example${options.path ?? '/v1/parent-guide/refine'}`, {
    method: options.method ?? 'POST',
    headers,
    body:
      (options.method ?? 'POST') === 'GET'
        ? undefined
        : JSON.stringify(
            options.body ?? { operation: LIVE_PARENT_GUIDE_OPERATION, request: requestValue() },
          ),
  });
}

describe('Parent Guide Worker boundary', () => {
  it('authenticates, rate-limits, validates, and invokes one structured Parent operation', async () => {
    const env = createEnv();
    const response = await worker.fetch(workerRequest(), env);

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('access-control-allow-origin')).toBe(ORIGIN);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      data: createCanonicalLiveParentGuidePayload(requestValue()),
      provider: { name: 'cloudflare-workers-ai' },
    });
    expect(env.PARENT_GUIDE_RATE_LIMITER.limit).toHaveBeenCalledWith({
      key: 'authenticated-parent-guide',
    });
    expect(env.AI.run).toHaveBeenCalledTimes(1);
    expect(env.AI.run).toHaveBeenCalledWith(
      env.AI_MODEL,
      expect.objectContaining({
        temperature: 0,
        response_format: expect.objectContaining({ type: 'json_schema' }),
      }),
    );
  });

  it.each([
    ['missing token', workerRequest({ token: '' })],
    ['wrong token', workerRequest({ token: 'wrong-token' })],
  ])('rejects %s before rate limiting or inference', async (_label, request) => {
    const env = createEnv();
    const response = await worker.fetch(request, env);
    expect(response.status).toBe(401);
    expect(env.PARENT_GUIDE_RATE_LIMITER.limit).not.toHaveBeenCalled();
    expect(env.AI.run).not.toHaveBeenCalled();
  });

  it('rejects rate-limited calls before parsing or inference', async () => {
    const env = createEnv({ rateAllowed: false });
    const response = await worker.fetch(workerRequest({ body: 'not-the-contract' }), env);
    expect(response.status).toBe(429);
    expect(env.AI.run).not.toHaveBeenCalled();
  });

  it.each([
    ['unknown operation', { operation: 'respond_to_child_coach', request: requestValue() }],
    [
      'unknown envelope field',
      { operation: LIVE_PARENT_GUIDE_OPERATION, request: requestValue(), extra: true },
    ],
    [
      'real Child marker',
      {
        operation: LIVE_PARENT_GUIDE_OPERATION,
        request: { ...requestValue(), child: { ...requestValue().child, synthetic: false } },
      },
    ],
    [
      'arbitrary task',
      {
        operation: LIVE_PARENT_GUIDE_OPERATION,
        request: { ...requestValue(), taskTemplateId: 'arbitrary-task' },
      },
    ],
  ])('rejects %s before inference', async (_label, body) => {
    const env = createEnv();
    const response = await worker.fetch(workerRequest({ body }), env);
    expect(response.status).toBe(400);
    expect(env.AI.run).not.toHaveBeenCalled();
  });

  it('rejects malformed envelopes and non-JSON content before inference', async () => {
    const malformedEnv = createEnv();
    expect((await worker.fetch(workerRequest({ body: 'invalid-root' }), malformedEnv)).status).toBe(
      400,
    );
    expect(malformedEnv.AI.run).not.toHaveBeenCalled();

    const contentTypeEnv = createEnv();
    expect(
      (
        await worker.fetch(
          workerRequest({ contentType: 'text/plain; charset=utf-8' }),
          contentTypeEnv,
        )
      ).status,
    ).toBe(415);
    expect(contentTypeEnv.AI.run).not.toHaveBeenCalled();
  });

  it('rejects unapproved browser origins while allowing originless native requests', async () => {
    const deniedEnv = createEnv();
    const denied = await worker.fetch(
      workerRequest({ origin: 'https://unapproved.example' }),
      deniedEnv,
    );
    expect(denied.status).toBe(403);
    expect(deniedEnv.AI.run).not.toHaveBeenCalled();

    const nativeEnv = createEnv();
    const native = await worker.fetch(workerRequest({ origin: null }), nativeEnv);
    expect(native.status).toBe(200);
    expect(native.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('rejects wrong paths, methods, oversized bodies, and malformed model output', async () => {
    expect((await worker.fetch(workerRequest({ method: 'GET' }), createEnv())).status).toBe(405);
    expect(
      (await worker.fetch(workerRequest({ path: '/v1/child-coach' }), createEnv())).status,
    ).toBe(404);
    expect(
      (await worker.fetch(workerRequest({ body: { padding: 'x'.repeat(20_000) } }), createEnv()))
        .status,
    ).toBe(413);
    expect(
      (
        await worker.fetch(
          workerRequest(),
          createEnv({ modelResult: { response: { requestId: 'wrong' } } }),
        )
      ).status,
    ).toBe(502);
  });

  it('keeps secrets and Worker state out of tracked configuration', () => {
    const config = readFileSync(
      new URL('../workers/ghaf-parent-guide/wrangler.jsonc', import.meta.url),
      'utf8',
    );
    const gitignore = readFileSync(new URL('../.gitignore', import.meta.url), 'utf8');
    expect(config).toContain('PARENT_GUIDE_RATE_LIMITER');
    expect(config).toContain('GHAF_DEMO_ACCESS_TOKEN');
    expect(config).not.toContain(TOKEN);
    expect(config).not.toMatch(/access-control-allow-origin['"]?\s*:\s*['"]\*['"]/iu);
    expect(gitignore).toContain('.dev.vars');
    expect(gitignore).toContain('.wrangler');
  });
});
