interface WorkersAI {
  run(model: string, input: Record<string, unknown>): Promise<unknown>;
}

interface Env {
  readonly AI: WorkersAI;
  readonly AI_MODEL?: string;
}

const DEFAULT_MODEL = '@cf/meta/llama-3.1-8b-instruct-fast';
const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

const localizedTextSchema = {
  type: 'object',
  additionalProperties: false,
  properties: { ar: { type: 'string' }, en: { type: 'string' } },
  required: ['ar', 'en'],
};

const missionSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    title: localizedTextSchema,
    story: localizedTextSchema,
    steps: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          order: { type: 'integer', minimum: 1, maximum: 3 },
          instruction: localizedTextSchema,
        },
        required: ['order', 'instruction'],
      },
    },
    reflectionPrompt: localizedTextSchema,
    impactTarget: {
      type: 'object',
      additionalProperties: false,
      properties: {
        value: { type: 'integer', minimum: 1 },
        unit: { type: 'string', enum: ['grams', 'portions'] },
      },
      required: ['value', 'unit'],
    },
    evidenceMethod: {
      type: 'string',
      enum: ['prepared-evidence', 'parent-confirmation', 'either'],
    },
    reward: { anyOf: [localizedTextSchema, { type: 'null' }] },
    personalization: {
      type: 'object',
      additionalProperties: false,
      properties: {
        childAgeBand: { type: 'string' },
        foodSituation: localizedTextSchema,
        familyWisdomSummary: localizedTextSchema,
        availableMinutes: { type: 'integer', minimum: 1, maximum: 60 },
      },
      required: ['childAgeBand', 'foodSituation', 'familyWisdomSummary', 'availableMinutes'],
    },
  },
  required: [
    'schemaVersion',
    'title',
    'story',
    'steps',
    'reflectionPrompt',
    'impactTarget',
    'evidenceMethod',
    'reward',
    'personalization',
  ],
};

const coachSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    requestId: { type: 'string' },
    taskId: { type: 'string' },
    message: localizedTextSchema,
    quickChoices: { type: 'array', maxItems: 3, items: localizedTextSchema },
    askAdult: {
      type: 'object',
      additionalProperties: false,
      properties: { label: localizedTextSchema, recommended: { type: 'boolean' } },
      required: ['label', 'recommended'],
    },
    languageMode: { type: 'string', enum: ['ar', 'en', 'code-switched'] },
    safety: {
      type: 'object',
      additionalProperties: false,
      properties: {
        foodSafetyVerdict: { type: 'boolean', enum: [false] },
        requiresAdult: { type: 'boolean' },
      },
      required: ['foodSafetyVerdict', 'requiresAdult'],
    },
  },
  required: [
    'schemaVersion',
    'requestId',
    'taskId',
    'message',
    'quickChoices',
    'askAdult',
    'languageMode',
    'safety',
  ],
};

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: CORS_HEADERS });
}

function unwrapModelResponse(result: unknown): unknown {
  if (!result || typeof result !== 'object') throw new Error('Workers AI returned no result');
  const response = (result as { response?: unknown }).response;
  if (typeof response === 'string') return JSON.parse(response);
  if (response && typeof response === 'object') return response;
  return result;
}

function missionPrompt(request: unknown): string {
  return [
    'Create one Parent-reviewable Ghaf sustainability mission from this synthetic prototype request.',
    'Return Arabic and English for every localized field and exactly three ordered steps numbered 1, 2, and 3.',
    'Adapt to the child age band, quantity, available time, reward, prepared transcript, and current food situation.',
    'Use clear Modern Standard Arabic. Do not claim to inspect media that is not transcribed in the request.',
    'Never decide food safety, tell a child to eat uncertain food, assign the mission, verify evidence, or bypass Parent approval.',
    `Request JSON: ${JSON.stringify(request)}`,
  ].join('\n');
}

function coachPrompt(request: unknown): string {
  return [
    'You are Ghaf Coach. Support only the current Parent-approved task in the request.',
    'For ages 6-8 give one very short instruction and an early Ask an adult option.',
    'For ages 9-11 give two or three short steps and quick choices.',
    'For ages 12-14 be concise, respectful, mature, and never babyish.',
    'Return clear Modern Standard Arabic and natural English; understand Arabic-English code-switching.',
    'Do not invent dialect, issue religious or medical rulings, request private data, or provide a food-safety verdict.',
    'Set requiresAdult and recommend Ask an adult whenever adult judgment is needed.',
    'Echo requestId and taskId exactly. The Arabic Ask an adult label must contain اسأل and the English label must contain Ask.',
    `Request JSON: ${JSON.stringify(request)}`,
  ].join('\n');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS')
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    if (request.method !== 'POST')
      return json(
        { ok: false, error: { code: 'INVALID_INPUT', message: 'POST is required' } },
        405,
      );

    const contentLength = Number(request.headers.get('content-length') ?? 0);
    if (contentLength > 32_000)
      return json(
        { ok: false, error: { code: 'INVALID_INPUT', message: 'Request is too large' } },
        413,
      );

    let body: { operation?: unknown; request?: unknown };
    try {
      body = (await request.json()) as { operation?: unknown; request?: unknown };
    } catch {
      return json(
        { ok: false, error: { code: 'INVALID_INPUT', message: 'Valid JSON is required' } },
        400,
      );
    }
    if (body.operation !== 'generateMission' && body.operation !== 'respondToCoach') {
      return json(
        { ok: false, error: { code: 'INVALID_INPUT', message: 'Unknown AI operation' } },
        400,
      );
    }

    const isMission = body.operation === 'generateMission';
    const schema = isMission ? missionSchema : coachSchema;
    const prompt = isMission ? missionPrompt(body.request) : coachPrompt(body.request);
    try {
      const result = await env.AI.run(env.AI_MODEL || DEFAULT_MODEL, {
        messages: [
          { role: 'system', content: 'Return only structured JSON matching the supplied schema.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: isMission ? 1_500 : 500,
        response_format: { type: 'json_schema', json_schema: schema },
      });
      return json({
        ok: true,
        data: unwrapModelResponse(result),
        provider: { name: 'cloudflare-workers-ai', model: env.AI_MODEL || DEFAULT_MODEL },
      });
    } catch {
      return json(
        {
          ok: false,
          error: { code: 'REMOTE_UNAVAILABLE', message: 'Workers AI generation failed' },
        },
        503,
      );
    }
  },
};
