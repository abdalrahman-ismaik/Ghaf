import {
  capabilityTokenClaimsSchema,
  type CapabilityTokenClaims,
} from '../../../src/models/boundedAi';

export type BoundedAiOperation = CapabilityTokenClaims['scope'];
export type GatewayErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'REPLAYED'
  | 'ORIGIN_DENIED'
  | 'METHOD_NOT_ALLOWED'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'BODY_TOO_LARGE'
  | 'RATE_LIMITED'
  | 'BUDGET_BLOCKED'
  | 'INVALID_INPUT'
  | 'SAFETY_REJECTED'
  | 'TIMEOUT'
  | 'REMOTE_UNAVAILABLE'
  | 'INVALID_RESPONSE'
  | 'AUDIO_DELETION_FAILED';

export interface OperationPolicy {
  readonly role: CapabilityTokenClaims['role'];
  readonly maxBodyBytes: number;
  readonly providerTimeoutMs: number;
  readonly maxPerMinuteSubject: number;
  readonly maxPerDaySubject: number;
  readonly maxPerDayTenant: number;
  readonly maxConcurrent: number;
}

export const BOUNDED_AI_OPERATION_POLICIES = Object.freeze({
  draft_parent_task_v1: Object.freeze({
    role: 'parent',
    maxBodyBytes: 8_192,
    providerTimeoutMs: 2_200,
    maxPerMinuteSubject: 6,
    maxPerDaySubject: 30,
    maxPerDayTenant: 30,
    maxConcurrent: 2,
  }),
  coach_approved_task_v1: Object.freeze({
    role: 'child',
    maxBodyBytes: 4_096,
    providerTimeoutMs: 1_500,
    maxPerMinuteSubject: 3,
    maxPerDaySubject: 12,
    maxPerDayTenant: 30,
    maxConcurrent: 1,
  }),
  transcribe_child_task_voice_v1: Object.freeze({
    role: 'child',
    maxBodyBytes: 262_144,
    providerTimeoutMs: 3_500,
    maxPerMinuteSubject: 2,
    maxPerDaySubject: 6,
    maxPerDayTenant: 12,
    maxConcurrent: 1,
  }),
} satisfies Record<BoundedAiOperation, OperationPolicy>);

export interface ReplayStore {
  consume(jti: string, expiresAtEpochSeconds: number, nowEpochSeconds: number): Promise<boolean>;
}

export interface RateLimitStore {
  limit(input: { readonly key: string }): Promise<{ readonly success: boolean }>;
}

export interface BudgetLease {
  readonly success: boolean;
  readonly leaseId?: string;
}

export interface OperationBudgetStore {
  acquire(input: {
    readonly operation: BoundedAiOperation;
    readonly subject: string;
    readonly tenant: string;
    readonly maxPerDaySubject: number;
    readonly maxPerDayTenant: number;
    readonly maxConcurrent: number;
  }): Promise<BudgetLease>;
  release(leaseId: string): Promise<void>;
}

export type OperationCapacity =
  | {
      readonly ok: true;
      readonly leaseId: string;
      readonly release: () => Promise<void>;
    }
  | { readonly ok: false; readonly code: 'RATE_LIMITED' | 'BUDGET_BLOCKED'; readonly status: 429 };

export async function reserveOperationCapacity(input: {
  readonly operation: BoundedAiOperation;
  readonly claims: CapabilityTokenClaims;
  readonly rateLimiter: RateLimitStore;
  readonly budgetStore: OperationBudgetStore;
}): Promise<OperationCapacity> {
  const policy = BOUNDED_AI_OPERATION_POLICIES[input.operation];
  const rate = await input.rateLimiter.limit({
    key: `${input.operation}:${input.claims.sub}`,
  });
  if (!rate.success) return { ok: false, code: 'RATE_LIMITED', status: 429 };
  const lease = await input.budgetStore.acquire({
    operation: input.operation,
    subject: input.claims.sub,
    tenant: input.claims.tenant,
    maxPerDaySubject: policy.maxPerDaySubject,
    maxPerDayTenant: policy.maxPerDayTenant,
    maxConcurrent: policy.maxConcurrent,
  });
  if (!lease.success || !lease.leaseId) {
    return { ok: false, code: 'BUDGET_BLOCKED', status: 429 };
  }
  const leaseId = lease.leaseId;
  let released = false;
  return {
    ok: true,
    leaseId,
    async release() {
      if (released) return;
      released = true;
      await input.budgetStore.release(leaseId);
    },
  };
}

export class MemoryReplayStore implements ReplayStore {
  private readonly expiries = new Map<string, number>();

  async consume(
    jti: string,
    expiresAtEpochSeconds: number,
    nowEpochSeconds: number,
  ): Promise<boolean> {
    for (const [key, expiry] of this.expiries) {
      if (expiry < nowEpochSeconds) this.expiries.delete(key);
    }
    if (this.expiries.has(jti)) return false;
    this.expiries.set(jti, expiresAtEpochSeconds);
    return true;
  }
}

export interface CapabilityVerificationOptions {
  readonly secret: string;
  readonly issuer: string;
  readonly audience: string;
  readonly expectedRole: CapabilityTokenClaims['role'];
  readonly expectedScope: BoundedAiOperation;
  readonly nowEpochSeconds: number;
  readonly replayStore: ReplayStore;
  readonly maximumClockSkewSeconds?: number;
}

export type CapabilityVerification =
  | { readonly ok: true; readonly claims: CapabilityTokenClaims }
  | { readonly ok: false; readonly code: GatewayErrorCode; readonly status: number };

function unauthorized(): CapabilityVerification {
  return { ok: false, code: 'UNAUTHORIZED', status: 401 };
}

function decodeBase64Url(value: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]+$/u.test(value)) return null;
  try {
    const normalized = value.replace(/-/gu, '+').replace(/_/gu, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const decoded = atob(padded);
    return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

function bearerToken(request: Request): string | null {
  const match = /^Bearer ([^\s]+)$/u.exec(request.headers.get('authorization') ?? '');
  return match?.[1] ?? null;
}

async function signatureIsValid(
  signingInput: string,
  signature: Uint8Array<ArrayBuffer>,
  secret: string,
): Promise<boolean> {
  if (secret.length < 32) return false;
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    return await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      new TextEncoder().encode(signingInput),
    );
  } catch {
    return false;
  }
}

export async function verifyCapabilityRequest(
  request: Request,
  options: CapabilityVerificationOptions,
): Promise<CapabilityVerification> {
  const token = bearerToken(request);
  if (!token) return unauthorized();
  const parts = token.split('.');
  const version = parts[0];
  const encodedPayload = parts[1];
  const encodedSignature = parts[2];
  if (parts.length !== 3 || version !== 'v1' || !encodedPayload || !encodedSignature) {
    return unauthorized();
  }
  const signature = decodeBase64Url(encodedSignature);
  if (!signature || !(await signatureIsValid(`v1.${encodedPayload}`, signature, options.secret))) {
    return unauthorized();
  }

  const payloadBytes = decodeBase64Url(encodedPayload);
  if (!payloadBytes) return unauthorized();
  let payload: unknown;
  try {
    payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as unknown;
  } catch {
    return unauthorized();
  }
  const parsed = capabilityTokenClaimsSchema.safeParse(payload);
  if (!parsed.success) return unauthorized();
  const claims = parsed.data;
  const skew = options.maximumClockSkewSeconds ?? 30;
  if (
    claims.iss !== options.issuer ||
    claims.aud !== options.audience ||
    claims.role !== options.expectedRole ||
    claims.scope !== options.expectedScope ||
    claims.iat > options.nowEpochSeconds + skew ||
    claims.exp < options.nowEpochSeconds
  ) {
    return { ok: false, code: 'FORBIDDEN', status: 403 };
  }
  if (!(await options.replayStore.consume(claims.jti, claims.exp, options.nowEpochSeconds))) {
    return { ok: false, code: 'REPLAYED', status: 409 };
  }
  return { ok: true, claims };
}

export function resolveAllowedOrigin(
  requestOrigin: string | null,
  configuredOrigin: string | undefined,
): string | null | false {
  if (!requestOrigin) return null;
  const allowed = configuredOrigin?.trim();
  return allowed && requestOrigin === allowed ? requestOrigin : false;
}

function responseHeaders(origin: string | null): HeadersInit {
  return {
    ...(origin ? { 'access-control-allow-origin': origin } : {}),
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8',
    'referrer-policy': 'no-referrer',
    'x-content-type-options': 'nosniff',
    vary: 'Origin',
  };
}

export function safeJsonResponse(data: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(data), { status, headers: responseHeaders(origin) });
}

export function safeErrorResponse(
  code: GatewayErrorCode,
  status: number,
  origin: string | null,
  fallbackAvailable: boolean,
  retryable = false,
): Response {
  return safeJsonResponse(
    { ok: false, error: { code, retryable, fallbackAvailable } },
    status,
    origin,
  );
}

export async function readBoundedJson(
  request: Request,
  maximumBytes: number,
): Promise<{ readonly ok: true; readonly value: unknown } | { readonly ok: false }> {
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > maximumBytes) return { ok: false };
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maximumBytes) return { ok: false };
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false };
  }
}
