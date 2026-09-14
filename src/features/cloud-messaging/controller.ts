import { randomUUID } from 'expo-crypto';

import {
  ATTEMPT_LIFETIME_MS,
  HISTORY_RETENTION_MS,
  MessagingError,
  POLL_MS,
  type FamilyMessage,
  type MessagingErrorCode,
  type PhraseId,
} from '@/features/familyMessaging/contracts';
import type {
  CloudMessagePending,
  CloudMessageThread,
  CloudMessagingActor,
  CloudMessagingState,
  CloudMessagingTransport,
} from '@/models/cloudMessaging';
import { createCloudMessagingService } from '@/services/cloud-messaging';
import { messagingUuid, validMessageInput } from './validation';

const initialState: CloudMessagingState = {
  status: 'loading',
  inbox: null,
  permissions: [],
  threadId: null,
  messages: [],
  hasMore: false,
  busy: false,
  error: null,
  pending: null,
};
function safeError(error: unknown): MessagingErrorCode {
  if (error instanceof MessagingError) return error.code;
  const code = error && typeof error === 'object' && 'code' in error ? error.code : null;
  if (
    [
      'access_unavailable',
      'account_unavailable',
      'session_expired',
      'operation_cancelled',
      'recovery_required',
      '42501',
    ].includes(String(code))
  )
    return 'access_revoked';
  if (code === 'rate_limited' || code === 'PT429') return 'rate_limited';
  if (code === 'profile_conflict' || code === 'PT409') return 'idempotency_conflict';
  if (code === 'invalid_profile' || code === 'PT400') return 'invalid_request';
  if (code === 'network_unavailable' || error instanceof TypeError) return 'offline';
  return 'service_unavailable';
}
const denied = (code: MessagingErrorCode) =>
  ['not_authenticated', 'not_authorized', 'access_revoked', 'role_mismatch'].includes(code);
function mergeMessages(
  previous: readonly FamilyMessage[],
  incoming: readonly FamilyMessage[],
): readonly FamilyMessage[] {
  const merged = new Map(previous.map((message) => [message.id, message]));
  const sequences = new Map(previous.map((message) => [message.sequence, message.id]));
  incoming.forEach((message) => {
    const existing = merged.get(message.id);
    if (
      existing &&
      (existing.body !== message.body ||
        existing.senderId !== message.senderId ||
        existing.sequence !== message.sequence ||
        existing.clientKey !== message.clientKey ||
        Date.parse(existing.createdAt) !== Date.parse(message.createdAt))
    )
      throw new MessagingError('not_authorized');
    if (sequences.has(message.sequence) && sequences.get(message.sequence) !== message.id)
      throw new MessagingError('not_authorized');
    merged.set(message.id, message);
    sequences.set(message.sequence, message.id);
  });
  return [...merged.values()].sort((a, b) => a.sequence - b.sequence);
}

export function createCloudMessagingController({
  service: transport,
  userId,
  familyId,
  actor,
  makeRequestId = randomUUID,
}: {
  readonly service: CloudMessagingTransport;
  readonly userId: string;
  readonly familyId: string;
  readonly actor: CloudMessagingActor;
  readonly makeRequestId?: () => string;
}) {
  if (!messagingUuid(userId) || (actor.role === 'parent' && actor.personId !== userId))
    throw new MessagingError('not_authorized');
  const service = createCloudMessagingService(transport, familyId, actor);
  let state: CloudMessagingState = initialState;
  let disposed = false;
  let active = true;
  let generation = 0;
  let subscriptionGeneration = 0;
  let unsubscribe: (() => void) | null = null;
  let subscribing = false;
  let timer: ReturnType<typeof setInterval> | null = null;
  let refreshQueued = false;
  let fetchedSequence = 0;
  const listeners = new Set<() => void>();
  const publish = (patch: Partial<CloudMessagingState>) => {
    if (disposed) return;
    state = Object.freeze({ ...state, ...patch });
    listeners.forEach((listener) => listener());
  };
  const current = (attempt: number) => !disposed && attempt === generation;
  const selected = () => state.inbox?.threads.find((thread) => thread.id === state.threadId);
  const fail = (error: unknown) => {
    const code = safeError(error);
    if (denied(code)) {
      ++generation;
      stopTimer();
      stopSubscription();
      refreshQueued = false;
      fetchedSequence = 0;
      publish({ ...initialState, status: 'unavailable', error: code });
    } else publish({ busy: false, error: code, status: state.inbox ? 'ready' : 'unavailable' });
  };
  const stopSubscription = () => {
    ++subscriptionGeneration;
    subscribing = false;
    try {
      unsubscribe?.();
    } catch {
      // Stale subscription callbacks are also generation-guarded.
    }
    unsubscribe = null;
  };
  const stopTimer = () => {
    if (timer !== null) clearInterval(timer);
    timer = null;
  };
  const afterOperation = () => {
    if (refreshQueued && active && !disposed && !state.busy) {
      refreshQueued = false;
      void refresh();
    }
  };
  const watch = () => {
    if (!active || disposed) return;
    if (timer === null)
      timer = setInterval(() => {
        if (!state.busy) void refresh();
      }, POLL_MS);
    if (unsubscribe || subscribing) return;
    subscribing = true;
    const attempt = subscriptionGeneration;
    void service
      .subscribe(() => {
        if (disposed || !active || attempt !== subscriptionGeneration) return;
        if (state.busy) refreshQueued = true;
        else void refresh();
      })
      .then((stop) => {
        if (disposed || !active || attempt !== subscriptionGeneration) {
          stop();
          return;
        }
        subscribing = false;
        unsubscribe = stop;
      })
      .catch(() => {
        if (disposed || attempt !== subscriptionGeneration) return;
        subscribing = false;
        // Bounded foreground polling and explicit refresh remain available.
      });
  };
  async function readVisible(
    thread: CloudMessageThread,
    messages: readonly FamilyMessage[],
    attempt: number,
  ) {
    if (!active || !current(attempt) || state.threadId !== thread.id) return;
    const last = messages.at(-1)?.sequence;
    if (last === undefined || last <= thread.readSequence) return;
    await service.markRead(thread, last);
    if (current(attempt) && active && state.inbox)
      publish({
        inbox: {
          ...state.inbox,
          threads: state.inbox.threads.map((item) =>
            item.id === thread.id
              ? {
                  ...item,
                  readSequence: Math.max(item.readSequence, last),
                  lastSequence: Math.max(item.lastSequence, last),
                  unreadCount: 0,
                }
              : item,
          ),
        },
      });
  }
  async function refresh(): Promise<boolean> {
    if (disposed || !active) return false;
    if (state.busy) {
      refreshQueued = true;
      return false;
    }
    const attempt = generation;
    publish({ busy: true, error: null });
    try {
      const [inbox, permissions] = await Promise.all([service.inbox(), service.permissions()]);
      if (!current(attempt)) return false;
      const thread = inbox.threads.find((item) => item.id === state.threadId);
      if (state.threadId && !thread) {
        fetchedSequence = 0;
        publish({
          inbox,
          permissions,
          threadId: null,
          messages: [],
          pending: null,
          hasMore: false,
          busy: false,
          status: 'ready',
          error: 'access_revoked',
        });
        return false;
      }
      publish({ inbox, permissions, status: 'ready' });
      if (thread && active) {
        if (state.messages.length === 0) {
          const page = await service.page(thread);
          if (!current(attempt)) return false;
          fetchedSequence = page.messages.at(-1)?.sequence ?? 0;
          publish({ messages: page.messages, hasMore: page.hasMore });
        } else {
          // Sent acknowledgements do not advance the read frontier past unseen messages.
          for (let pageCount = 0; pageCount < 20; pageCount += 1) {
            const page = await service.page(thread, undefined, fetchedSequence);
            if (!current(attempt)) return false;
            const retained = state.messages.filter(
              (message) => Date.parse(message.createdAt) > Date.now() - HISTORY_RETENTION_MS,
            );
            publish({ messages: mergeMessages(retained, page.messages) });
            fetchedSequence = page.messages.at(-1)?.sequence ?? fetchedSequence;
            if (!page.hasMore || page.messages.length === 0 || !active) break;
          }
        }
        await readVisible(
          thread,
          state.messages.filter((message) => message.sequence <= fetchedSequence),
          attempt,
        );
      }
      if (!current(attempt)) return false;
      publish({ busy: false });
      watch();
      return true;
    } catch (error) {
      if (current(attempt)) fail(error);
      return false;
    } finally {
      afterOperation();
    }
  }
  async function open(threadId: string): Promise<boolean> {
    if (disposed || !active || state.busy || state.pending) return false;
    const thread = state.inbox?.threads.find((item) => item.id === threadId);
    if (!thread) return false;
    const attempt = ++generation;
    fetchedSequence = 0;
    publish({ threadId, messages: [], hasMore: false, busy: true, error: null });
    try {
      const page = await service.page(thread);
      if (!current(attempt)) return false;
      fetchedSequence = page.messages.at(-1)?.sequence ?? 0;
      publish({ messages: page.messages, hasMore: page.hasMore });
      await readVisible(thread, page.messages, attempt);
      if (!current(attempt)) return false;
      publish({ busy: false });
      return true;
    } catch (error) {
      if (current(attempt)) fail(error);
      return false;
    } finally {
      afterOperation();
    }
  }
  async function loadOlder(): Promise<boolean> {
    const thread = selected();
    const before = state.messages[0]?.sequence;
    if (!thread || before === undefined || !state.hasMore || state.busy || !active || disposed)
      return false;
    const attempt = generation;
    publish({ busy: true, error: null });
    try {
      const page = await service.page(thread, before);
      if (!current(attempt)) return false;
      if (page.messages.some((message) => message.sequence >= before))
        throw new MessagingError('not_authorized');
      publish({
        messages: mergeMessages(page.messages, state.messages),
        hasMore: page.hasMore,
        busy: false,
      });
      return true;
    } catch (error) {
      if (current(attempt)) fail(error);
      return false;
    } finally {
      afterOperation();
    }
  }
  async function attemptSend(pending: CloudMessagePending): Promise<boolean> {
    const thread = selected();
    if (!thread || thread.id !== pending.threadId || state.busy || disposed || !active)
      return false;
    if (Date.now() - pending.createdAt > ATTEMPT_LIFETIME_MS) {
      publish({ error: 'attempt_expired' });
      return false;
    }
    const attempt = generation;
    publish({ busy: true, error: null, pending: { ...pending, status: 'sending' } });
    try {
      const message = await service.send(thread, pending.requestId, pending.body, pending.phraseId);
      if (!current(attempt)) return false;
      publish({ messages: mergeMessages(state.messages, [message]), pending: null, busy: false });
      return true;
    } catch (error) {
      if (current(attempt)) {
        const code = safeError(error);
        if (denied(code)) fail(error);
        else publish({ busy: false, error: code, pending: { ...pending, status: 'failed' } });
      }
      return false;
    } finally {
      afterOperation();
    }
  }
  async function send(body: string, phraseId?: PhraseId): Promise<boolean> {
    if (state.pending || !state.threadId || !validMessageInput(body, phraseId ?? null, actor))
      return false;
    return attemptSend({
      threadId: state.threadId,
      requestId: makeRequestId(),
      body,
      phraseId: phraseId ?? null,
      createdAt: Date.now(),
      status: 'sending',
    });
  }
  async function setPeerPermission(
    first: string,
    second: string,
    enabled: boolean,
  ): Promise<boolean> {
    if (disposed || !active || state.busy || state.pending || actor.role !== 'parent') return false;
    const attempt = generation;
    publish({ busy: true, error: null });
    try {
      await service.permission(first, second, enabled, makeRequestId());
      if (!current(attempt)) return false;
      publish({ busy: false });
      return refresh();
    } catch (error) {
      if (current(attempt)) fail(error);
      return false;
    } finally {
      afterOperation();
    }
  }
  async function leavePeer(): Promise<boolean> {
    const thread = selected();
    if (
      disposed ||
      !active ||
      state.busy ||
      state.pending ||
      actor.role !== 'child' ||
      thread?.kind !== 'child_child'
    )
      return false;
    const attempt = generation;
    publish({ busy: true, error: null });
    try {
      await service.leave(thread.id, makeRequestId());
      if (!current(attempt)) return false;
      ++generation;
      fetchedSequence = 0;
      publish({ busy: false, threadId: null, messages: [], hasMore: false });
      return refresh();
    } catch (error) {
      if (current(attempt)) fail(error);
      return false;
    } finally {
      afterOperation();
    }
  }
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    load: refresh,
    refresh,
    open,
    loadOlder,
    send,
    retry: () =>
      state.pending?.status === 'failed' ? attemptSend(state.pending) : Promise.resolve(false),
    setPeerPermission,
    leavePeer,
    close() {
      if (disposed || state.busy || state.pending) return false;
      ++generation;
      fetchedSequence = 0;
      publish({ threadId: null, messages: [], hasMore: false, error: null });
      return true;
    },
    discardPending() {
      if (state.busy || state.pending?.status !== 'failed') return false;
      publish({ pending: null, error: null });
      return true;
    },
    setActive(value: boolean) {
      if (disposed || value === active) return;
      active = value;
      if (!active) {
        stopTimer();
        stopSubscription();
      } else {
        watch();
        void refresh();
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      ++generation;
      stopTimer();
      stopSubscription();
      state = initialState;
      listeners.clear();
    },
  };
}
