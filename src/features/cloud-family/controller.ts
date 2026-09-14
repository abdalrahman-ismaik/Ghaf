import { randomUUID } from 'expo-crypto';

import {
  CloudFamilyError,
  type CloudFamilyCommand,
  type CloudFamilyErrorCode,
  type CloudFamilySnapshot,
  type CloudFamilyState,
  type CloudFamilyTransport,
} from '@/models/cloudFamily';
import { createCloudFamilyService } from '@/services/cloud-family';
import { isCloudUuid, parseCloudFamilyCommand, parseCloudFamilyInvite } from './validation';

const initialState: CloudFamilyState = Object.freeze({
  status: 'loading',
  snapshot: null,
  busy: false,
  error: null,
  conflict: false,
  pendingRequestId: null,
  pendingCommand: null,
  lastInvite: null,
  subscriptionError: false,
});

const errorCodes = new Set<CloudFamilyErrorCode>([
  'access_unavailable',
  'family_unavailable',
  'invalid_command',
  'invalid_transition',
  'request_conflict',
  'invalid_invite',
  'rate_limited',
  'network_unavailable',
  'provider_unavailable',
  'invalid_response',
  'session_expired',
  'storage_unavailable',
  'reauth_required',
]);
const aliases: Readonly<Record<string, CloudFamilyErrorCode>> = {
  profile_conflict: 'request_conflict',
  invalid_profile: 'invalid_command',
  profile_unavailable: 'invalid_response',
  account_unavailable: 'access_unavailable',
  recovery_required: 'access_unavailable',
  operation_cancelled: 'access_unavailable',
  configuration_unavailable: 'provider_unavailable',
  PT409: 'request_conflict',
  PT400: 'invalid_command',
  '42501': 'access_unavailable',
  PT428: 'reauth_required',
};
function errorCode(error: unknown): CloudFamilyErrorCode {
  if (error instanceof CloudFamilyError) return error.code;
  if (error && typeof error === 'object') {
    const record = error as { code?: unknown; message?: unknown };
    for (const value of [record.message, record.code]) {
      if (typeof value === 'string' && errorCodes.has(value as CloudFamilyErrorCode))
        return value as CloudFamilyErrorCode;
      if (typeof value === 'string' && aliases[value]) return aliases[value];
    }
  }
  return error instanceof TypeError ? 'network_unavailable' : 'provider_unavailable';
}
const uncertain = (code: CloudFamilyErrorCode) =>
  ['network_unavailable', 'provider_unavailable', 'invalid_response'].includes(code);
const deniesAccess = (code: CloudFamilyErrorCode) =>
  [
    'access_unavailable',
    'family_unavailable',
    'session_expired',
    'storage_unavailable',
    'invalid_response',
  ].includes(code);
const invalidatesSession = (code: CloudFamilyErrorCode) =>
  deniesAccess(code) && code !== 'invalid_response';

type Pending =
  | {
      readonly kind: 'command';
      readonly requestId: string;
      readonly familyId: string | null;
      readonly command: CloudFamilyCommand;
    }
  | { readonly kind: 'redeem'; readonly requestId: string; readonly token: string };

export function createCloudFamilyController({
  service: transport,
  userId,
  makeRequestId = randomUUID,
}: {
  readonly service: CloudFamilyTransport;
  readonly userId: string;
  readonly makeRequestId?: () => string;
}) {
  const service = createCloudFamilyService(transport, userId);
  let state = initialState;
  let disposed = false;
  let active = true;
  let generation = 0;
  let familyId: string | null = null;
  let pending: Pending | null = null;
  let refreshRequested = false;
  let subscriptionFamily: string | null = null;
  let subscriptionGeneration = 0;
  let unsubscribe: (() => void) | null = null;
  let refreshTimer: ReturnType<typeof setInterval> | null = null;
  const listeners = new Set<() => void>();
  const publish = (patch: Partial<CloudFamilyState>) => {
    if (disposed) return;
    state = Object.freeze({ ...state, ...patch });
    listeners.forEach((listener) => listener());
  };
  const current = (attempt: number) => !disposed && attempt === generation;
  const stopSubscription = () => {
    ++subscriptionGeneration;
    subscriptionFamily = null;
    const stop = unsubscribe;
    unsubscribe = null;
    try {
      stop?.();
    } catch {
      // Removed subscription callbacks are generation-guarded.
    }
  };
  const synchronizeSubscription = (nextFamily: string | null) => {
    if (nextFamily === subscriptionFamily) return;
    stopSubscription();
    if (nextFamily === null || disposed) return;
    subscriptionFamily = nextFamily;
    const attempt = subscriptionGeneration;
    void Promise.resolve()
      .then(() =>
        service.subscribe(nextFamily, () => {
          if (disposed || subscriptionGeneration !== attempt || subscriptionFamily !== nextFamily)
            return;
          if (!active || state.busy) refreshRequested = true;
          else void load();
        }),
      )
      .then((stop) => {
        if (disposed || subscriptionGeneration !== attempt) {
          stop();
          return;
        }
        unsubscribe = stop;
        publish({ subscriptionError: false });
      })
      .catch(() => {
        if (!disposed && subscriptionGeneration === attempt) {
          subscriptionFamily = null;
          publish({ subscriptionError: true });
        }
      });
  };
  const accept = (snapshot: CloudFamilySnapshot) => {
    familyId = snapshot.family?.id ?? null;
    publish({
      snapshot,
      status: snapshot.family ? 'ready' : 'empty',
      error: null,
      conflict: false,
    });
    synchronizeSubscription(familyId);
    startPolling();
  };
  const drainRefresh = () => {
    if (!disposed && active && refreshRequested && !state.busy) {
      refreshRequested = false;
      void load();
    }
  };
  const load = async (requestedFamily: string | null = familyId): Promise<boolean> => {
    if (disposed) return false;
    if (state.busy) {
      refreshRequested = true;
      return false;
    }
    if (requestedFamily !== null && !isCloudUuid(requestedFamily)) {
      publish({ error: 'invalid_command' });
      return false;
    }
    const attempt = ++generation;
    publish({
      busy: true,
      error: null,
      ...(state.snapshot === null ? { status: 'loading' as const } : {}),
    });
    try {
      const snapshot = await service.load(requestedFamily);
      if (!current(attempt)) return false;
      accept(snapshot);
      return true;
    } catch (error) {
      if (current(attempt)) {
        const code = errorCode(error);
        if (deniesAccess(code)) stopSubscription();
        if (invalidatesSession(code)) pending = null;
        publish({
          status: 'error',
          error: code,
          ...(deniesAccess(code) ? { snapshot: null, lastInvite: null } : {}),
          ...(invalidatesSession(code) ? { pendingRequestId: null, pendingCommand: null } : {}),
        });
      }
      return false;
    } finally {
      if (current(attempt)) {
        publish({ busy: false });
        drainRefresh();
      }
    }
  };
  const execute = async (): Promise<boolean> => {
    if (disposed || state.busy || !pending) return false;
    const operation = pending;
    const attempt = ++generation;
    publish({
      busy: true,
      error: null,
      lastInvite: null,
      pendingRequestId: operation.requestId,
      pendingCommand: operation.kind === 'redeem' ? 'redeem_invite' : operation.command.type,
    });
    try {
      const response =
        operation.kind === 'redeem'
          ? await service.redeemInvite(operation.token, operation.requestId)
          : await service.command(operation.familyId, operation.requestId, operation.command);
      if (!current(attempt)) return false;
      const invite =
        operation.kind === 'command' &&
        ['invite_parent', 'invite_child'].includes(operation.command.type)
          ? parseCloudFamilyInvite(response.result)
          : null;
      pending = null;
      accept(response.snapshot);
      publish({ pendingRequestId: null, pendingCommand: null, lastInvite: invite });
      return true;
    } catch (error) {
      if (current(attempt)) {
        const code = errorCode(error);
        if (!uncertain(code)) pending = null;
        if (deniesAccess(code)) stopSubscription();
        publish({
          error: code,
          conflict: code === 'request_conflict',
          pendingRequestId: pending?.requestId ?? null,
          pendingCommand: pending
            ? pending.kind === 'redeem'
              ? 'redeem_invite'
              : pending.command.type
            : null,
          ...(deniesAccess(code) ? { status: 'error' as const, snapshot: null } : {}),
        });
      }
      return false;
    } finally {
      if (current(attempt)) {
        publish({ busy: false });
        drainRefresh();
      }
    }
  };
  const newRequestId = () => {
    const id = makeRequestId();
    if (!isCloudUuid(id)) throw new CloudFamilyError('invalid_command');
    return id;
  };
  const startPolling = () => {
    if (disposed || refreshTimer !== null) return;
    refreshTimer = setInterval(() => {
      if (!disposed && active && state.snapshot !== null) {
        if (state.busy) refreshRequested = true;
        else void load();
      }
    }, 60_000);
  };

  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      if (!disposed) listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    load,
    refresh: () => load(),
    retry: () => (pending ? execute() : load()),
    async selectFamily(nextFamilyId: string) {
      if (disposed || state.busy || pending) return false;
      if (
        !isCloudUuid(nextFamilyId) ||
        !state.snapshot?.families.some((family) => family.id === nextFamilyId)
      )
        return false;
      stopSubscription();
      familyId = nextFamilyId;
      publish({ snapshot: null, lastInvite: null, status: 'loading' });
      return load(nextFamilyId);
    },
    async command(input: CloudFamilyCommand) {
      if (disposed || state.busy || pending || state.conflict || !state.snapshot) return false;
      try {
        const command = parseCloudFamilyCommand(input);
        const childCommand = [
          'accept_task',
          'start_task',
          'request_help',
          'set_step',
          'submit_task',
        ].includes(command.type);
        if ((state.snapshot.actor.role === 'child') !== childCommand)
          throw new CloudFamilyError('access_unavailable');
        if ('taskId' in command) {
          const task = state.snapshot.tasks.find((item) => item.id === command.taskId);
          if (
            !task ||
            (state.snapshot.actor.role === 'child' && task.childId !== state.snapshot.actor.childId)
          )
            throw new CloudFamilyError('access_unavailable');
          if (task.revision !== command.expectedRevision)
            throw new CloudFamilyError('request_conflict');
        }
        pending = {
          kind: 'command',
          requestId: newRequestId(),
          familyId: command.type === 'create_family' ? null : familyId,
          command,
        };
      } catch (error) {
        const code = errorCode(error);
        publish({ error: code, conflict: code === 'request_conflict' });
        return false;
      }
      return execute();
    },
    async redeemInvite(token: string) {
      if (disposed || state.busy || pending) return false;
      try {
        pending = { kind: 'redeem', requestId: newRequestId(), token };
      } catch (error) {
        publish({ error: errorCode(error) });
        return false;
      }
      return execute();
    },
    setActive(value: boolean) {
      if (disposed) return;
      const resumed = value && !active;
      active = value;
      if (resumed) {
        refreshRequested = false;
        void load();
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (refreshTimer !== null) clearInterval(refreshTimer);
      refreshTimer = null;
      ++generation;
      pending = null;
      state = Object.freeze({ ...initialState, status: 'empty' });
      stopSubscription();
      listeners.clear();
    },
  };
}

export type CloudFamilyController = ReturnType<typeof createCloudFamilyController>;
