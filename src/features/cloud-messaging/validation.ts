import { z } from 'zod';

import {
  MessagingError,
  ageBandSchema,
  messageSchema,
  validBody,
  matchesPhrase,
  type FamilyMessage,
} from '@/features/familyMessaging/contracts';
import type {
  CloudMessageInbox,
  CloudMessagePage,
  CloudMessagePermission,
  CloudMessageThread,
  CloudMessagingActor,
} from '@/models/cloudMessaging';

const id = z.string().uuid();
const counter = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
const name = z.string().refine((value) => validBody(value) && Array.from(value).length <= 80);
const actorSchema = z
  .object({ personId: id, role: z.enum(['parent', 'child']), ageBand: ageBandSchema.nullable() })
  .strict()
  .refine((actor) => (actor.role === 'parent') === (actor.ageBand === null));
const threadSchema = z
  .object({
    id,
    kind: z.enum(['parent_child', 'child_child']),
    childId: id,
    otherName: name,
    otherRole: z.enum(['parent', 'child']),
    otherPersonId: id,
    lastSequence: counter,
    readSequence: counter,
    unreadCount: counter,
  })
  .strict()
  .refine(
    (thread) =>
      thread.readSequence <= thread.lastSequence &&
      thread.unreadCount <= thread.lastSequence - thread.readSequence,
  );
const inboxSchema = z
  .object({ actor: actorSchema, threads: z.array(threadSchema).max(500) })
  .strict();
const permissionSchema = z
  .object({
    firstChildId: id,
    secondChildId: id,
    firstName: name,
    secondName: name,
    threadId: id.nullable(),
    enabled: z.boolean(),
    available: z.boolean(),
  })
  .strict()
  .refine(
    (pair) => pair.firstChildId < pair.secondChildId && (!pair.enabled || pair.threadId !== null),
  );
const pageSchema = z
  .object({ messages: z.array(messageSchema.strict()).max(30), hasMore: z.boolean() })
  .strict();
export function messagingUuid(value: unknown): value is string {
  return id.safeParse(value).success;
}
export function sameMessagingActor(first: CloudMessagingActor, second: CloudMessagingActor) {
  return (
    first.personId === second.personId &&
    first.role === second.role &&
    first.ageBand === second.ageBand
  );
}
function invalid(): never {
  throw new MessagingError('not_authorized');
}
export function parseMessageInbox(value: unknown, actor: CloudMessagingActor): CloudMessageInbox {
  const parsed = inboxSchema.safeParse(value);
  if (!parsed.success || !sameMessagingActor(parsed.data.actor, actor)) return invalid();
  const { threads } = parsed.data;
  if (new Set(threads.map((thread) => thread.id)).size !== threads.length) return invalid();
  for (const thread of threads) {
    if (thread.otherPersonId === actor.personId) return invalid();
    if (
      actor.role === 'parent' &&
      (thread.kind !== 'parent_child' ||
        thread.otherRole !== 'child' ||
        thread.childId !== thread.otherPersonId)
    )
      return invalid();
    if (
      actor.role === 'child' &&
      thread.kind === 'parent_child' &&
      (thread.otherRole !== 'parent' || thread.childId !== actor.personId)
    )
      return invalid();
    if (
      thread.kind === 'child_child' &&
      (thread.otherRole !== 'child' ||
        ![actor.personId, thread.otherPersonId].includes(thread.childId))
    )
      return invalid();
  }
  return parsed.data;
}
export function parseCloudMessage(
  value: unknown,
  thread: CloudMessageThread,
  actor: CloudMessagingActor,
): FamilyMessage {
  const parsed = messageSchema.strict().safeParse(value);
  if (
    !parsed.success ||
    parsed.data.threadId !== thread.id ||
    ![actor.personId, thread.otherPersonId].includes(parsed.data.senderId)
  )
    return invalid();
  return parsed.data;
}
export function parseMessagePage(
  value: unknown,
  thread: CloudMessageThread,
  actor: CloudMessagingActor,
): CloudMessagePage {
  const parsed = pageSchema.safeParse(value);
  if (!parsed.success) return invalid();
  const messages = parsed.data.messages.map((message) => parseCloudMessage(message, thread, actor));
  if (
    new Set(messages.map((message) => message.id)).size !== messages.length ||
    messages.some(
      (message, index) => index > 0 && message.sequence <= messages[index - 1]!.sequence,
    )
  )
    return invalid();
  return { messages, hasMore: parsed.data.hasMore };
}
export function parseMessagePermissions(value: unknown): readonly CloudMessagePermission[] {
  const parsed = z.array(permissionSchema).max(500).safeParse(value);
  if (
    !parsed.success ||
    new Set(parsed.data.map((pair) => `${pair.firstChildId}:${pair.secondChildId}`)).size !==
      parsed.data.length
  )
    return invalid();
  return parsed.data;
}
export function parseMessageOk(value: unknown): void {
  if (
    !z
      .object({ ok: z.literal(true) })
      .strict()
      .safeParse(value).success
  )
    invalid();
}
export function validMessageInput(
  body: string,
  phraseId: Parameters<typeof matchesPhrase>[1],
  actor: CloudMessagingActor,
): boolean {
  return validBody(body) && (actor.ageBand !== '6_8' || matchesPhrase(body, phraseId));
}
