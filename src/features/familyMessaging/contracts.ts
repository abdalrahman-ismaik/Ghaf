import { z } from 'zod';

export const MESSAGE_LIMIT = 500;
export const PAGE_SIZE = 30;
export const POLL_MS = 3_000;
export const ATTEMPT_LIFETIME_MS = 24 * 60 * 60 * 1_000;
export const HISTORY_RETENTION_MS = 30 * 24 * 60 * 60 * 1_000;
export const ageBandSchema = z.enum(['6_8', '9_11', '12_14']);
export type MessagingAgeBand = z.infer<typeof ageBandSchema>;
export type MessagingRole = 'parent' | 'child';
export const phraseIds = ['help', 'ready', 'thanks', 'pause'] as const;
export type PhraseId = (typeof phraseIds)[number];
export const phraseText = {
  ar: {
    help: 'هل يمكنك مساعدتي؟',
    ready: 'أنا مستعدّ.',
    thanks: 'شكرًا لمساعدتك.',
    pause: 'أحتاج إلى استراحة قصيرة.',
  },
  en: {
    help: 'Can you help me?',
    ready: 'I am ready.',
    thanks: 'Thank you for helping.',
    pause: 'I need a short break.',
  },
} as const;
const id = z.string().uuid();
const name = z
  .string()
  .refine((value) => /[^\s\u0085]/u.test(value) && Array.from(value).length <= 60);
export const contextSchema = z
  .object({
    role: z.enum(['parent', 'child']),
    personId: id,
    displayName: name,
    householdId: id,
    deviceId: id,
    ageBand: ageBandSchema.nullable(),
  })
  .refine((context) =>
    context.role === 'parent' ? context.ageBand === null : context.ageBand !== null,
  );
export type MessagingContext = z.infer<typeof contextSchema>;
export const childSchema = z.object({
  id,
  displayName: name,
  ageBand: ageBandSchema,
  threadId: id,
  active: z.boolean(),
});
export type MessagingChild = z.infer<typeof childSchema>;
export const threadSchema = z
  .object({
    id,
    kind: z.enum(['parent_child', 'child_child']).default('parent_child'),
    childId: id,
    otherName: name,
    otherRole: z.enum(['parent', 'child']),
  })
  .refine((thread) => thread.kind !== 'child_child' || thread.otherRole === 'child');
export type MessagingThread = z.infer<typeof threadSchema>;
export const peerPermissionSchema = z
  .object({
    firstChildId: id,
    secondChildId: id,
    firstName: name,
    secondName: name,
    threadId: id.nullable(),
    enabled: z.boolean(),
    available: z.boolean(),
  })
  .refine(
    (pair) => pair.firstChildId < pair.secondChildId && (!pair.enabled || pair.threadId !== null),
  );
export type PeerPermission = z.infer<typeof peerPermissionSchema>;
export const messageSchema = z.object({
  id,
  threadId: id,
  senderId: id,
  body: z.string().refine(validBody),
  sequence: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  createdAt: z.string().datetime({ offset: true }),
  clientKey: id,
});
export type FamilyMessage = z.infer<typeof messageSchema>;
export const deviceSchema = z.object({
  id,
  personName: name,
  role: z.enum(['parent', 'child']),
  label: name,
  active: z.boolean(),
  current: z.boolean(),
});
export type MessagingDevice = z.infer<typeof deviceSchema>;
export const invitationSchema = z.object({
  code: z.string().min(16).max(128),
  expiresAt: z.string().datetime({ offset: true }),
  childName: name,
});
export type MessagingInvitation = z.infer<typeof invitationSchema>;
export const sessionSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  expires_at: z.number().positive(),
  user: z.object({ id }),
});
export type MessagingSession = z.infer<typeof sessionSchema>;
export interface CredentialStorage {
  read(): Promise<string | null>;
  write(value: string): Promise<void>;
  clear(): Promise<void>;
}
export interface MessagingConfig {
  readonly url: string;
  readonly publishableKey: string;
}
export const errorCodes = [
  'not_authenticated',
  'not_authorized',
  'access_revoked',
  'invalid_invite',
  'rate_limited',
  'invalid_message',
  'idempotency_conflict',
  'invalid_request',
  'service_unavailable',
  'offline',
  'unknown',
  'storage_failed',
  'role_mismatch',
  'attempt_expired',
] as const;
export type MessagingErrorCode = (typeof errorCodes)[number];
export class MessagingError extends Error {
  constructor(readonly code: MessagingErrorCode) {
    super(code);
    this.name = 'MessagingError';
  }
}
export function asMessagingError(error: unknown): MessagingError {
  return error instanceof MessagingError ? error : new MessagingError('service_unavailable');
}
export function validBody(body: string): boolean {
  return (
    /[^\s\u0085]/u.test(body) && Array.from(body).length <= MESSAGE_LIMIT && !body.includes('\0')
  );
}
export function matchesPhrase(body: string, phraseId: PhraseId | null): boolean {
  return (
    phraseId !== null && (phraseText.ar[phraseId] === body || phraseText.en[phraseId] === body)
  );
}
export interface SendInput {
  threadId: string;
  clientKey: string;
  body: string;
  phraseId: PhraseId | null;
}
export interface FamilyMessagingService {
  readonly configured: boolean;
  restore(signal?: AbortSignal): Promise<MessagingContext | null>;
  signIn(
    email: string,
    password: string,
    label: string,
    signal?: AbortSignal,
  ): Promise<MessagingContext>;
  enroll(code: string, label: string, signal?: AbortSignal): Promise<MessagingContext>;
  context(signal?: AbortSignal): Promise<MessagingContext>;
  threads(signal?: AbortSignal): Promise<MessagingThread[]>;
  messages(
    threadId: string,
    cursor: { before?: number; after?: number },
    signal?: AbortSignal,
  ): Promise<FamilyMessage[]>;
  send(input: SendInput, signal?: AbortSignal): Promise<FamilyMessage>;
  children(signal?: AbortSignal): Promise<MessagingChild[]>;
  peerPermissions(signal?: AbortSignal): Promise<PeerPermission[]>;
  setPeerPermission(
    firstChildId: string,
    secondChildId: string,
    enabled: boolean,
    signal?: AbortSignal,
  ): Promise<void>;
  leavePeerThread(threadId: string, signal?: AbortSignal): Promise<void>;
  createChild(
    name: string,
    ageBand: MessagingAgeBand,
    signal?: AbortSignal,
  ): Promise<MessagingChild>;
  invite(childId: string, signal?: AbortSignal): Promise<MessagingInvitation>;
  devices(signal?: AbortSignal): Promise<MessagingDevice[]>;
  revokeDevice(deviceId: string, signal?: AbortSignal): Promise<void>;
  revokeAccount(signal?: AbortSignal): Promise<void>;
  signOut(): Promise<{ remoteConfirmed: boolean }>;
  forget(): Promise<void>;
}
