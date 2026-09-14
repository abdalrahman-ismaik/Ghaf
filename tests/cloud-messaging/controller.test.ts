import { afterEach, describe, expect, it, vi } from 'vitest';

import { createCloudMessagingController } from '../../src/features/cloud-messaging/controller';
import { parseMessageInbox, parseMessagePage } from '../../src/features/cloud-messaging/validation';
import type {
  CloudMessageInbox,
  CloudMessagingActor,
  CloudMessagingTransport,
} from '../../src/models/cloudMessaging';

vi.mock('expo-crypto', () => ({ randomUUID: () => '00000000-0000-4000-8000-000000000099' }));
const id = (number: number) => `00000000-0000-4000-8000-${String(number).padStart(12, '0')}`;
const userId = id(1);
const familyId = id(2);
const childId = id(3);
const threadId = id(4);
const actor: CloudMessagingActor = { personId: userId, role: 'parent', ageBand: null };
const message = (sequence = 1, body = 'A real family message', senderId = childId) => ({
  id: id(sequence + 20),
  threadId,
  senderId,
  body,
  sequence,
  clientKey: id(99),
  createdAt: '2026-09-15T00:00:00+00:00',
});
const inbox = (who = actor, sequence = 0): CloudMessageInbox => ({
  actor: who,
  threads: [
    {
      id: threadId,
      kind: 'parent_child',
      childId,
      otherPersonId: who.role === 'parent' ? childId : userId,
      otherRole: who.role === 'parent' ? 'child' : 'parent',
      otherName: 'Actual family member',
      lastSequence: sequence,
      readSequence: 0,
      unreadCount: sequence,
    },
  ],
});
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((yes) => {
    resolve = yes;
  });
  return { promise, resolve };
}
const controllers: ReturnType<typeof createCloudMessagingController>[] = [];
afterEach(() => {
  controllers.forEach((controller) => controller.dispose());
  controllers.length = 0;
  vi.useRealTimers();
});
function setup(handler?: CloudMessagingTransport['familyRequest'], who = actor) {
  const request = vi.fn<CloudMessagingTransport['familyRequest']>(
    handler ??
      (async (name) => {
        if (name === 'ghaf_family_message_threads') return inbox(who);
        if (name === 'ghaf_family_peer_permissions') return [];
        if (name === 'ghaf_family_message_page') return { messages: [], hasMore: false };
        return { ok: true };
      }),
  );
  const stop = vi.fn();
  const service = { familyRequest: request, subscribeFamily: vi.fn(async () => stop) };
  const controller = createCloudMessagingController({
    service,
    userId,
    familyId,
    actor: who,
    makeRequestId: () => id(99),
  });
  controllers.push(controller);
  return { controller, request, stop, service };
}

describe('main-account human messaging controller', () => {
  it('loads an empty real conversation without fabricating messages', async () => {
    const { controller, request } = setup();
    expect(await controller.load()).toBe(true);
    expect(await controller.open(threadId)).toBe(true);
    expect(controller.getSnapshot()).toMatchObject({
      status: 'ready',
      messages: [],
      pending: null,
      error: null,
    });
    expect(request.mock.calls.every(([, args]) => args.p_family_id === familyId)).toBe(true);
    expect(request.mock.calls.some(([name]) => /ai|gemini|enroll|sign_in/.test(name))).toBe(false);
  });

  it('keeps uncertain sends distinct and retries the same committed key without another draft', async () => {
    let committed = false;
    let sends = 0;
    const saved = message(1, 'Our agreed activity', userId);
    const { controller, request } = setup(async (name) => {
      if (name === 'ghaf_family_message_threads') return inbox(actor, committed ? 1 : 0);
      if (name === 'ghaf_family_peer_permissions') return [];
      if (name === 'ghaf_family_message_page')
        return { messages: committed ? [saved] : [], hasMore: false };
      if (name === 'ghaf_family_message_send') {
        sends += 1;
        if (!committed) {
          committed = true;
          throw new TypeError('Lost response');
        }
        return saved;
      }
      return { ok: true };
    });
    await controller.load();
    await controller.open(threadId);
    expect(await controller.send('Our agreed activity')).toBe(false);
    expect(controller.getSnapshot()).toMatchObject({
      messages: [],
      pending: { status: 'failed', requestId: id(99) },
    });
    expect(controller.close()).toBe(false);
    expect(await controller.send('Another draft')).toBe(false);
    expect(await controller.refresh()).toBe(true);
    expect(controller.getSnapshot().pending?.status).toBe('failed');
    expect(await controller.retry()).toBe(true);
    expect(controller.getSnapshot()).toMatchObject({ pending: null, messages: [saved] });
    const requests = request.mock.calls.filter(([name]) => name === 'ghaf_family_message_send');
    expect(requests).toHaveLength(2);
    expect(requests[1]).toEqual(requests[0]);
    expect(sends).toBe(2);
  });

  it('does not present a merely optimistic message as saved', async () => {
    const response = deferred<unknown>();
    const { controller } = setup(async (name) => {
      if (name === 'ghaf_family_message_threads') return inbox();
      if (name === 'ghaf_family_peer_permissions') return [];
      if (name === 'ghaf_family_message_send') return response.promise;
      return { messages: [], hasMore: false };
    });
    await controller.load();
    await controller.open(threadId);
    const sending = controller.send('Reviewed message');
    expect(controller.getSnapshot()).toMatchObject({
      messages: [],
      pending: { status: 'sending', body: 'Reviewed message' },
    });
    response.resolve(message(1, 'Reviewed message', userId));
    expect(await sending).toBe(true);
    expect(controller.getSnapshot()).toMatchObject({
      pending: null,
      messages: [message(1, 'Reviewed message', userId)],
    });
  });

  it('rejects a different recipient or sender before exposing the response', async () => {
    expect(() => parseMessageInbox(inbox({ ...actor, personId: id(50) }), actor)).toThrow();
    const current = inbox().threads[0]!;
    expect(() =>
      parseMessagePage(
        { messages: [message(1, 'Wrong identity', id(55))], hasMore: false },
        current,
        actor,
      ),
    ).toThrow();
    expect(() =>
      parseMessagePage(
        { messages: [{ ...message(), threadId: id(77) }], hasMore: false },
        current,
        actor,
      ),
    ).toThrow();
    expect(() =>
      parseMessagePage({ messages: [message(2), message(1)], hasMore: false }, current, actor),
    ).toThrow();
  });

  it('preserves loaded older pages during polling and fills messages before a later send acknowledgement', async () => {
    let lastSequence = 60;
    const { controller, request } = setup(async (name, args) => {
      if (name === 'ghaf_family_message_threads') return inbox(actor, lastSequence);
      if (name === 'ghaf_family_peer_permissions') return [];
      if (name === 'ghaf_family_message_page') {
        const before = args.p_before as number | null;
        const after = args.p_after as number | null;
        const values = Array.from({ length: lastSequence }, (_, index) =>
          index === 62 ? message(63, 'A later send acknowledgement', userId) : message(index + 1),
        );
        const eligible = values.filter(
          (item) =>
            (before === null || item.sequence < before) &&
            (after === null || item.sequence > after),
        );
        return {
          messages: after === null ? eligible.slice(-30) : eligible.slice(0, 30),
          hasMore: eligible.length > 30,
        };
      }
      if (name === 'ghaf_family_message_send') {
        lastSequence = 63;
        return message(63, args.p_body as string, userId);
      }
      return { ok: true };
    });
    await controller.load();
    await controller.open(threadId);
    expect(controller.getSnapshot().messages[0]?.sequence).toBe(31);
    expect(await controller.loadOlder()).toBe(true);
    expect(controller.getSnapshot().messages).toHaveLength(60);
    expect(controller.getSnapshot().hasMore).toBe(false);
    lastSequence = 61;
    expect(await controller.refresh()).toBe(true);
    expect(controller.getSnapshot().messages).toHaveLength(61);
    expect(controller.getSnapshot().messages[0]?.sequence).toBe(1);
    expect(controller.getSnapshot().hasMore).toBe(false);
    expect(await controller.send('A later send acknowledgement')).toBe(true);
    expect(await controller.refresh()).toBe(true);
    expect(controller.getSnapshot().messages.map((item) => item.sequence)).toEqual(
      Array.from({ length: 63 }, (_, index) => index + 1),
    );
    expect(
      request.mock.calls.some(
        ([name, args]) => name === 'ghaf_family_message_page' && args.p_after === 61,
      ),
    ).toBe(true);
  });

  it('clears cached private state and subscriptions when server access is revoked', async () => {
    let revoked = false;
    const { controller, stop } = setup(async (name) => {
      if (revoked) throw { code: 'access_unavailable' };
      if (name === 'ghaf_family_message_threads') return inbox(actor, 1);
      if (name === 'ghaf_family_peer_permissions') return [];
      if (name === 'ghaf_family_message_page') return { messages: [message()], hasMore: false };
      return { ok: true };
    });
    await controller.load();
    await controller.open(threadId);
    expect(controller.getSnapshot().messages).toHaveLength(1);
    revoked = true;
    expect(await controller.refresh()).toBe(false);
    expect(controller.getSnapshot()).toMatchObject({
      inbox: null,
      messages: [],
      pending: null,
      status: 'unavailable',
    });
    expect(stop).toHaveBeenCalledOnce();
  });

  it('enforces curated young-Child phrases before any request and cannot call Parent peer controls', async () => {
    const young: CloudMessagingActor = { personId: childId, role: 'child', ageBand: '6_8' };
    const { controller, request } = setup(async (name, args) => {
      if (name === 'ghaf_family_message_threads') return inbox(young);
      if (name === 'ghaf_family_message_page') return { messages: [], hasMore: false };
      if (name === 'ghaf_family_message_send') return message(1, args.p_body as string, childId);
      return [];
    }, young);
    await controller.load();
    await controller.open(threadId);
    expect(await controller.send('Arbitrary text')).toBe(false);
    expect(await controller.send('Mismatched phrase', 'ready')).toBe(false);
    expect(await controller.setPeerPermission(childId, id(5), true)).toBe(false);
    expect(await controller.send('I am ready.', 'ready')).toBe(true);
    expect(request.mock.calls.filter(([name]) => name === 'ghaf_family_message_send')).toHaveLength(
      1,
    );
    expect(request.mock.calls.some(([name]) => name.includes('peer_permission'))).toBe(false);
  });

  it('does not acknowledge messages after the app backgrounds while a page is loading', async () => {
    const response = deferred<unknown>();
    const { controller, request } = setup(async (name) => {
      if (name === 'ghaf_family_message_threads') return inbox(actor, 1);
      if (name === 'ghaf_family_peer_permissions') return [];
      if (name === 'ghaf_family_message_page') return response.promise;
      return { ok: true };
    });
    await controller.load();
    const opening = controller.open(threadId);
    controller.setActive(false);
    response.resolve({ messages: [message()], hasMore: false });
    await opening;
    expect(request.mock.calls.some(([name]) => name === 'ghaf_family_message_mark_read')).toBe(
      false,
    );
  });

  it('expires an uncertain retry after24hours without creating a new server request', async () => {
    vi.useFakeTimers();
    const { controller, request } = setup(async (name) => {
      if (name === 'ghaf_family_message_threads') return inbox();
      if (name === 'ghaf_family_peer_permissions') return [];
      if (name === 'ghaf_family_message_page') return { messages: [], hasMore: false };
      throw new TypeError('Offline');
    });
    await controller.load();
    await controller.open(threadId);
    await controller.send('Review this message');
    vi.setSystemTime(Date.now() + 24 * 60 * 60 * 1000 + 1);
    expect(await controller.retry()).toBe(false);
    expect(controller.getSnapshot().error).toBe('attempt_expired');
    expect(request.mock.calls.filter(([name]) => name === 'ghaf_family_message_send')).toHaveLength(
      1,
    );
    expect(controller.discardPending()).toBe(true);
    expect(controller.close()).toBe(true);
  });

  it('ignores a response after disposal and does not acknowledge its contents', async () => {
    const response = deferred<unknown>();
    const { controller, request } = setup(async (name) => {
      if (name === 'ghaf_family_message_threads') return inbox(actor, 1);
      if (name === 'ghaf_family_peer_permissions') return [];
      return response.promise;
    });
    await controller.load();
    const opening = controller.open(threadId);
    controller.dispose();
    response.resolve({ messages: [message()], hasMore: false });
    expect(await opening).toBe(false);
    expect(controller.getSnapshot().messages).toEqual([]);
    expect(request.mock.calls.some(([name]) => name === 'ghaf_family_message_mark_read')).toBe(
      false,
    );
  });
});
