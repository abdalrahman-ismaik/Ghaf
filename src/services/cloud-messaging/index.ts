import { MessagingError, type PhraseId } from '@/features/familyMessaging/contracts';
import {
  messagingUuid,
  parseCloudMessage,
  parseMessageInbox,
  parseMessageOk,
  parseMessagePage,
  parseMessagePermissions,
  validMessageInput,
} from '@/features/cloud-messaging/validation';
import type {
  CloudMessageThread,
  CloudMessagingActor,
  CloudMessagingTransport,
} from '@/models/cloudMessaging';

export function createCloudMessagingService(
  transport: CloudMessagingTransport,
  familyId: string,
  actor: CloudMessagingActor,
) {
  if (!messagingUuid(familyId) || !messagingUuid(actor.personId))
    throw new MessagingError('not_authorized');
  const request = (name: string, args: Record<string, unknown> = {}) =>
    transport.familyRequest(name, { p_family_id: familyId, ...args });
  return {
    async inbox() {
      return parseMessageInbox(await request('ghaf_family_message_threads'), actor);
    },
    async permissions() {
      if (actor.role !== 'parent') return [];
      return parseMessagePermissions(await request('ghaf_family_peer_permissions'));
    },
    async page(thread: CloudMessageThread, before?: number, after?: number) {
      if (before !== undefined && (!Number.isSafeInteger(before) || before < 1))
        throw new MessagingError('invalid_request');
      if (
        after !== undefined &&
        (!Number.isSafeInteger(after) || after < 0 || before !== undefined)
      )
        throw new MessagingError('invalid_request');
      const page = parseMessagePage(
        await request('ghaf_family_message_page', {
          p_thread_id: thread.id,
          p_before: before ?? null,
          p_after: after ?? null,
          p_limit: 30,
        }),
        thread,
        actor,
      );
      if (
        page.messages.some(
          (message) =>
            (before !== undefined && message.sequence >= before) ||
            (after !== undefined && message.sequence <= after),
        )
      )
        throw new MessagingError('not_authorized');
      return page;
    },
    async send(
      thread: CloudMessageThread,
      requestId: string,
      body: string,
      phraseId: PhraseId | null,
    ) {
      if (!messagingUuid(requestId) || !validMessageInput(body, phraseId, actor))
        throw new MessagingError('invalid_message');
      const message = parseCloudMessage(
        await request('ghaf_family_message_send', {
          p_thread_id: thread.id,
          p_request_id: requestId,
          p_body: body,
          p_phrase_id: phraseId,
        }),
        thread,
        actor,
      );
      if (
        message.senderId !== actor.personId ||
        message.clientKey !== requestId ||
        message.body !== body
      )
        throw new MessagingError('service_unavailable');
      return message;
    },
    async markRead(thread: CloudMessageThread, sequence: number) {
      if (!Number.isSafeInteger(sequence) || sequence < 0)
        throw new MessagingError('invalid_request');
      parseMessageOk(
        await request('ghaf_family_message_mark_read', {
          p_thread_id: thread.id,
          p_sequence: sequence,
        }),
      );
    },
    async permission(first: string, second: string, enabled: boolean, requestId: string) {
      if (
        actor.role !== 'parent' ||
        !messagingUuid(first) ||
        !messagingUuid(second) ||
        first === second ||
        !messagingUuid(requestId)
      )
        throw new MessagingError('not_authorized');
      parseMessageOk(
        await request('ghaf_family_peer_permission', {
          p_first_child_id: first,
          p_second_child_id: second,
          p_enabled: enabled,
          p_request_id: requestId,
        }),
      );
    },
    async leave(threadId: string, requestId: string) {
      if (actor.role !== 'child' || !messagingUuid(threadId) || !messagingUuid(requestId))
        throw new MessagingError('not_authorized');
      parseMessageOk(
        await request('ghaf_family_peer_leave', { p_thread_id: threadId, p_request_id: requestId }),
      );
    },
    subscribe(listener: () => void) {
      return transport.subscribeFamily(familyId, listener);
    },
  };
}
