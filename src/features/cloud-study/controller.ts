import * as Crypto from 'expo-crypto';
import type {
  CloudDocumentCommand,
  CloudDocumentError,
  CloudDocumentServicePort,
  CloudFamilyDocument,
} from '../../models/cloudFamilyDocuments';
import {
  parseCloudDocumentCommand,
  parseCloudDocumentResponse,
  parseCloudDocumentSnapshot,
} from './validation';

export interface CloudDocumentsState {
  documents: readonly CloudFamilyDocument[] | null;
  loading: boolean;
  busy: boolean;
  error: CloudDocumentError | null;
  canRetry: boolean;
  saved: boolean;
}
export interface CloudDocumentsOptions {
  service: CloudDocumentServicePort;
  userId: string;
  familyId: string;
  role: 'parent' | 'child';
  childId: string | null;
  requestId?: () => string;
}
const codes: readonly string[] = [
  'access_unavailable',
  'family_unavailable',
  'invalid_command',
  'invalid_transition',
  'request_conflict',
  'limit_reached',
  'provider_unavailable',
  'invalid_response',
];
const accessErrors = new Set([
  'session_expired',
  'storage_unavailable',
  'operation_cancelled',
  'account_unavailable',
  'not_authenticated',
  'unauthorized',
  'recovery_required',
  'reauth_required',
]);
const aliases: Readonly<Record<string, CloudDocumentError>> = {
  invalid_profile: 'invalid_command',
  profile_conflict: 'request_conflict',
  rate_limited: 'limit_reached',
  profile_unavailable: 'invalid_response',
};
function code(error: unknown): CloudDocumentError {
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    for (const field of ['code', 'message'] as const) {
      const value = record[field];
      if (typeof value === 'string' && accessErrors.has(value)) return 'access_unavailable';
      const alias =
        typeof value === 'string' && Object.hasOwn(aliases, value) ? aliases[value] : undefined;
      if (alias) return alias;
      if (typeof value === 'string' && codes.includes(value)) return value as CloudDocumentError;
    }
  }
  return 'provider_unavailable';
}
export function createCloudDocumentsController(options: CloudDocumentsOptions) {
  const { service } = options;
  let state: CloudDocumentsState = {
    documents: null,
    loading: true,
    busy: false,
    error: null,
    canRetry: false,
    saved: false,
  };
  let generation = 0;
  let disposed = false;
  let stop: (() => void) | null = null;
  let subscribing = false;
  let subscriptionGeneration = 0;
  let refreshPending = false;
  let pending: { id: string; command: CloudDocumentCommand } | null = null;
  const listeners = new Set<() => void>();
  const publish = (next: Partial<CloudDocumentsState>) => {
    if (disposed) return;
    state = { ...state, ...next };
    listeners.forEach((listener) => listener());
  };
  const current = (attempt: number) => !disposed && generation === attempt;
  const denyAccess = () => {
    pending = null;
    refreshPending = false;
    ++subscriptionGeneration;
    const cleanup = stop;
    stop = null;
    try {
      cleanup?.();
    } catch {
      // A channel cleanup failure must not retain private account state.
    }
  };
  const parse = (value: unknown) => {
    try {
      return parseCloudDocumentSnapshot(value, options).documents;
    } catch {
      throw new Error('invalid_response');
    }
  };
  const subscribeRemote = async () => {
    if (!service.subscribeFamily || stop || subscribing || disposed) return;
    subscribing = true;
    const subscription = ++subscriptionGeneration;
    try {
      const cleanup = await service.subscribeFamily(options.familyId, () => {
        if (disposed || subscription !== subscriptionGeneration) return;
        if (state.busy) refreshPending = true;
        else void load();
      });
      if (disposed || subscription !== subscriptionGeneration) cleanup();
      else stop = cleanup;
    } catch {
      // Foreground/manual refresh remains available when realtime is unavailable.
    } finally {
      subscribing = false;
    }
  };
  const load = async (): Promise<boolean> => {
    if (disposed || state.busy) return false;
    const attempt = ++generation;
    publish({ loading: true, busy: true, error: null, saved: false });
    try {
      const raw = await service.familyRequest('ghaf_family_document_snapshot', {
        p_family_id: options.familyId,
      });
      if (!current(attempt)) return false;
      publish({ documents: parse(raw) });
      void subscribeRemote();
      return true;
    } catch (error) {
      if (current(attempt)) {
        const errorCode = code(error);
        if (errorCode === 'access_unavailable' || errorCode === 'family_unavailable') denyAccess();
        publish({ documents: null, error: errorCode, canRetry: pending !== null });
      }
      return false;
    } finally {
      if (current(attempt)) {
        publish({ loading: false, busy: false });
        if (refreshPending) {
          refreshPending = false;
          void load();
        }
      }
    }
  };
  const send = async (): Promise<boolean> => {
    if (disposed || state.busy || !pending) return false;
    const request = pending;
    const attempt = ++generation;
    publish({ busy: true, error: null, saved: false, canRetry: false });
    try {
      const raw = await service.familyRequest('ghaf_family_document_command', {
        p_family_id: options.familyId,
        p_request_id: request.id,
        p_command: request.command,
      });
      if (!current(attempt)) return false;
      let documents: CloudFamilyDocument[];
      try {
        documents = parseCloudDocumentResponse(raw, options);
      } catch {
        throw new Error('invalid_response');
      }
      pending = null;
      publish({ documents, saved: true, canRetry: false });
      return true;
    } catch (error) {
      if (current(attempt)) {
        const errorCode = code(error);
        if (errorCode === 'access_unavailable' || errorCode === 'family_unavailable') denyAccess();
        if (!['provider_unavailable', 'invalid_response'].includes(errorCode)) pending = null;
        publish({
          error: errorCode,
          canRetry: pending !== null,
          ...(['access_unavailable', 'family_unavailable', 'invalid_response'].includes(errorCode)
            ? { documents: null }
            : {}),
        });
      }
      return false;
    } finally {
      if (current(attempt)) {
        publish({ busy: false, loading: false });
        if (refreshPending) {
          refreshPending = false;
          void load();
        }
      }
    }
  };
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    load,
    async update(command: CloudDocumentCommand): Promise<boolean> {
      if (disposed || state.busy || pending || state.documents === null) return false;
      try {
        pending = {
          id: (options.requestId ?? Crypto.randomUUID)(),
          command: parseCloudDocumentCommand(command),
        };
      } catch {
        publish({ error: 'invalid_command', saved: false });
        return false;
      }
      return send();
    },
    retry: send,
    dispose() {
      disposed = true;
      ++generation;
      denyAccess();
      state = {
        documents: null,
        loading: false,
        busy: false,
        error: null,
        canRetry: false,
        saved: false,
      };
      listeners.clear();
    },
  };
}
export type CloudDocumentsController = ReturnType<typeof createCloudDocumentsController>;
