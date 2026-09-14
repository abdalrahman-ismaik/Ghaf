import type { AccountWorkspace, WorkspaceCommand } from '../../models/accountWorkspace';
import {
  ParentAccountError,
  type ParentAccountErrorCode,
  type ParentAccountService,
} from '../../models/parentAccount';

export interface AccountWorkspaceState {
  readonly data: AccountWorkspace | null;
  readonly loading: boolean;
  readonly busy: boolean;
  readonly error: ParentAccountErrorCode | null;
  readonly conflict: boolean;
  readonly notice: 'saved' | null;
}

const initialState: AccountWorkspaceState = {
  data: null,
  loading: true,
  busy: false,
  error: null,
  conflict: false,
  notice: null,
};

export function createWorkspaceController(
  service: Pick<ParentAccountService, 'loadWorkspace' | 'updateWorkspace'>,
  userId: string,
) {
  let state = initialState;
  let generation = 0;
  let disposed = false;
  let workspaceId: string | null = null;
  const listeners = new Set<() => void>();
  const publish = (patch: Partial<AccountWorkspaceState>) => {
    if (disposed) return;
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  };
  const current = (attempt: number) => !disposed && attempt === generation;
  const validateOwner = (data: AccountWorkspace) => {
    if (data.userId !== userId || (workspaceId !== null && data.workspaceId !== workspaceId)) {
      throw new ParentAccountError('profile_unavailable');
    }
    workspaceId = data.workspaceId;
  };
  const errorCode = (error: unknown): ParentAccountErrorCode =>
    error instanceof ParentAccountError ? error.code : 'provider_unavailable';
  const read = async (resolveConflict: boolean) => {
    if (disposed || state.busy) return false;
    const attempt = ++generation;
    publish({ busy: true, loading: true, error: null, notice: null });
    try {
      const data = await service.loadWorkspace();
      if (!current(attempt)) return false;
      validateOwner(data);
      publish({
        data,
        conflict: resolveConflict ? false : state.conflict,
        error: !resolveConflict && state.conflict ? 'profile_conflict' : null,
      });
      return true;
    } catch (error) {
      if (current(attempt)) publish({ data: null, error: errorCode(error), notice: null });
      return false;
    } finally {
      if (current(attempt)) publish({ busy: false, loading: false });
    }
  };

  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    load: () => read(false),
    reload: () => read(true),
    async update(command: WorkspaceCommand, expectedRevision = state.data?.revision) {
      if (disposed || state.busy || !state.data || state.conflict) return false;
      if (
        typeof expectedRevision !== 'number' ||
        !Number.isSafeInteger(expectedRevision) ||
        expectedRevision < 0
      ) {
        publish({ error: 'invalid_profile', notice: null });
        return false;
      }
      const attempt = ++generation;
      publish({ busy: true, error: null, notice: null });
      try {
        const data = await service.updateWorkspace({ expectedRevision, command });
        if (!current(attempt)) return false;
        validateOwner(data);
        if (data.revision <= expectedRevision) throw new ParentAccountError('profile_unavailable');
        publish({ data, error: null, conflict: false, notice: 'saved' });
        return true;
      } catch (error) {
        if (current(attempt)) {
          const code = errorCode(error);
          const deniesAccess = [
            'access_unavailable',
            'account_unavailable',
            'session_expired',
            'storage_unavailable',
          ].includes(code);
          publish({
            ...(deniesAccess ? { data: null } : {}),
            error: code,
            conflict: code === 'profile_conflict',
            notice: null,
          });
        }
        return false;
      } finally {
        if (current(attempt)) publish({ busy: false });
      }
    },
    dispose() {
      if (disposed) return;
      state = { ...initialState, loading: false };
      disposed = true;
      ++generation;
      workspaceId = null;
      listeners.clear();
    },
  };
}

export type AccountWorkspaceController = ReturnType<typeof createWorkspaceController>;
