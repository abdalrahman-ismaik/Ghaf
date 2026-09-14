import { z } from 'zod';

export const GEMINI_MAX_RESPONSE_BYTES = 65_536;

export interface GeminiTextConfig {
  readonly GEMINI_API_KEY?: string;
  readonly GEMINI_MODEL?: string;
}

export type GeminiTextResult =
  | { readonly status: 'ok'; readonly value: unknown }
  | { readonly status: 'timeout' | 'error' | 'invalid' | 'blocked' };

interface GeminiTextInput {
  readonly prompt: string;
  readonly schema: Record<string, unknown>;
  readonly maxTokens: number;
  readonly timeoutMs: number;
}

function providerSchema(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(providerSchema);
  if (!value || typeof value !== 'object') return value;
  const schema = value as Record<string, unknown>;
  // Gemini's schema subset omits string lengths and boolean enums; Ghaf still validates both.
  return Object.fromEntries(
    Object.entries(schema)
      .filter(
        ([key]) =>
          key !== 'minLength' &&
          key !== 'maxLength' &&
          !(key === 'enum' && schema.type === 'boolean'),
      )
      .map(([key, child]) => [key, providerSchema(child)]),
  );
}

const safetyRatingSchema = z.object({ blocked: z.boolean().optional() }).passthrough();
const envelopeSchema = z
  .object({
    promptFeedback: z
      .object({
        blockReason: z.string().optional(),
        safetyRatings: z.array(safetyRatingSchema).optional(),
      })
      .passthrough()
      .optional(),
    candidates: z
      .array(
        z
          .object({
            finishReason: z.string(),
            safetyRatings: z.array(safetyRatingSchema).optional(),
            content: z
              .object({
                role: z.literal('model'),
                parts: z
                  .array(z.object({ text: z.string().min(1) }).strict())
                  .min(1)
                  .max(8),
              })
              .strict()
              .optional(),
          })
          .passthrough(),
      )
      .optional(),
  })
  .passthrough();

function parseEnvelope(value: unknown): GeminiTextResult {
  const parsed = envelopeSchema.safeParse(value);
  if (!parsed.success || 'error' in parsed.data) return { status: 'invalid' };
  const { promptFeedback, candidates } = parsed.data;
  if (
    promptFeedback?.blockReason ||
    promptFeedback?.safetyRatings?.some((rating) => rating.blocked)
  )
    return { status: 'blocked' };
  if (candidates?.length !== 1) return { status: 'invalid' };
  const candidate = candidates[0];
  if (!candidate) return { status: 'invalid' };
  if (
    candidate.safetyRatings?.some((rating) => rating.blocked) ||
    ['SAFETY', 'BLOCKLIST', 'PROHIBITED_CONTENT', 'SPII'].includes(candidate.finishReason)
  )
    return { status: 'blocked' };
  if (candidate.finishReason !== 'STOP' || !candidate.content) return { status: 'invalid' };
  try {
    const result: unknown = JSON.parse(candidate.content.parts.map((part) => part.text).join(''));
    // Match the existing provider envelope so application JSON cannot supply its own wrapper.
    return { status: 'ok', value: { response: result } };
  } catch {
    return { status: 'invalid' };
  }
}

async function readResponse(response: Response, signal: AbortSignal): Promise<GeminiTextResult> {
  const declared = response.headers.get('content-length');
  const contentType = response.headers.get('content-type')?.trim() ?? '';
  if (
    !response.ok ||
    !/^application\/json(?:;|$)/iu.test(contentType) ||
    !response.body ||
    (declared !== null &&
      (!Number.isSafeInteger(Number(declared)) ||
        Number(declared) < 0 ||
        Number(declared) > GEMINI_MAX_RESPONSE_BYTES))
  ) {
    void response.body?.cancel().catch(() => undefined);
    return { status: response.ok ? 'invalid' : 'error' };
  }
  const reader = response.body.getReader();
  const cancel = () => void reader.cancel().catch(() => undefined);
  signal.addEventListener('abort', cancel, { once: true });
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let bytes = 0;
  let text = '';
  try {
    while (!signal.aborted) {
      const chunk = await reader.read();
      if (signal.aborted) return { status: 'timeout' };
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > GEMINI_MAX_RESPONSE_BYTES) {
        cancel();
        return { status: 'invalid' };
      }
      text += decoder.decode(chunk.value, { stream: true });
    }
    if (signal.aborted) return { status: 'timeout' };
    text += decoder.decode();
    return parseEnvelope(JSON.parse(text) as unknown);
  } catch {
    cancel();
    return { status: signal.aborted ? 'timeout' : 'invalid' };
  } finally {
    signal.removeEventListener('abort', cancel);
    reader.releaseLock();
  }
}

export async function runGeminiText(
  config: GeminiTextConfig,
  input: GeminiTextInput,
  fetchImplementation: typeof fetch = (...args) => globalThis.fetch(...args),
): Promise<GeminiTextResult> {
  const key = config.GEMINI_API_KEY;
  const model = config.GEMINI_MODEL;
  if (
    !key ||
    !/^[\x21-\x7E]{1,256}$/u.test(key) ||
    !model ||
    !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/u.test(model) ||
    !Number.isSafeInteger(input.maxTokens) ||
    input.maxTokens < 1 ||
    input.maxTokens > 1_200 ||
    !Number.isSafeInteger(input.timeoutMs) ||
    input.timeoutMs < 1 ||
    input.timeoutMs > 2_200
  )
    return { status: 'error' };
  const abort = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const deadline = new Promise<GeminiTextResult>((resolve) => {
      timer = setTimeout(() => {
        resolve({ status: 'timeout' });
        abort.abort();
      }, input.timeoutMs);
    });
    const operation = (async (): Promise<GeminiTextResult> => {
      const response = await fetchImplementation(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
          redirect: 'error',
          signal: abort.signal,
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: 'You are a bounded Ghaf task transformation. Return only the requested strict JSON.',
                },
              ],
            },
            contents: [{ role: 'user', parts: [{ text: input.prompt }] }],
            generationConfig: {
              temperature: 0,
              candidateCount: 1,
              maxOutputTokens: input.maxTokens,
              responseMimeType: 'application/json',
              responseJsonSchema: providerSchema(input.schema),
            },
          }),
        },
      );
      if (abort.signal.aborted) {
        void response.body?.cancel().catch(() => undefined);
        return { status: 'timeout' };
      }
      return readResponse(response, abort.signal);
    })();
    return await Promise.race([operation, deadline]);
  } catch {
    return { status: abort.signal.aborted ? 'timeout' : 'error' };
  } finally {
    if (timer) clearTimeout(timer);
    abort.abort();
  }
}
