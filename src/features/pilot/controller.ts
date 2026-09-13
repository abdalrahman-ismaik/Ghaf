import {
  ParentAccountError,
  type ParentAccountErrorCode,
  type ParentAccountService,
  type RealAccountSession,
} from '../../models/parentAccount';

export type PilotPhase =
  | 'restoring'
  | 'signin'
  | 'register'
  | 'verify'
  | 'forgot'
  | 'recovery-code'
  | 'new-password'
  | 'pending'
  | 'suspended'
  | 'ready'
  | 'error'
  | 'configuration';

export interface PilotState {
  readonly phase: PilotPhase;
  readonly busy: boolean;
  readonly account: RealAccountSession | null;
  readonly email: string;
  readonly error: ParentAccountErrorCode | null;
  readonly notice: 'code_sent' | 'password_updated' | null;
  readonly sampleOpen: boolean;
  readonly accountPanel: boolean;
  readonly sampleGeneration: number;
}

export interface PilotSampleActions {
  start(): Promise<void>;
  clear(): void;
}

const initialState: PilotState = {
  phase: 'restoring',
  busy: false,
  account: null,
  email: '',
  error: null,
  notice: null,
  sampleOpen: false,
  accountPanel: false,
  sampleGeneration: 0,
};

export function createPilotController(
  service: ParentAccountService | null,
  sample: PilotSampleActions,
) {
  let state: PilotState = service
    ? initialState
    : { ...initialState, phase: 'configuration', error: 'configuration_unavailable' };
  let generation = 0;
  let disposed = false;
  let started = false;
  let mutationAttempt: number | null = null;
  let revalidateAfterBusy = false;
  let unsubscribe: (() => void) | undefined;
  const listeners = new Set<() => void>();
  const publish = (patch: Partial<PilotState>) => {
    if (disposed) return;
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  };
  const current = (attempt: number) => !disposed && attempt === generation;
  const errorCode = (error: unknown): ParentAccountErrorCode =>
    error instanceof ParentAccountError ? error.code : 'provider_unavailable';
  const clear = () => {
    publish({ sampleOpen: false, accountPanel: false });
    sample.clear();
  };
  const fail = (error: unknown, phase: PilotPhase) => {
    const code = errorCode(error);
    if (phase === 'error' || code === 'recovery_required') {
      publish({ sampleOpen: false, accountPanel: false });
      try {
        sample.clear();
      } catch {
        // The navigator stays closed even if a sample cleanup reports failure.
      }
    }
    publish({
      phase: code === 'recovery_required' ? 'new-password' : phase,
      busy: false,
      error: code === 'recovery_required' ? null : code,
      notice: null,
    });
  };
  const run = async (
    operation: (attempt: number) => Promise<void>,
    failurePhase: PilotPhase,
    mutatesIdentity = false,
  ) => {
    if (!service || disposed || state.busy) return;
    const attempt = ++generation;
    if (mutatesIdentity) mutationAttempt = attempt;
    publish({ busy: true, error: null, notice: null });
    try {
      await operation(attempt);
    } catch (error) {
      if (current(attempt)) fail(error, failurePhase);
    } finally {
      if (mutationAttempt === attempt) mutationAttempt = null;
      if (current(attempt)) publish({ busy: false });
      if (revalidateAfterBusy && !disposed && mutationAttempt === null) {
        revalidateAfterBusy = false;
        publish({ busy: false });
        void refresh();
      }
    }
  };
  const accept = async (account: RealAccountSession | null, attempt: number) => {
    if (!current(attempt) || !service) return;
    if (!account) {
      clear();
      publish({ phase: 'signin', account: null, email: '' });
      return;
    }
    const status = await service.getAccess(account.userId);
    if (!current(attempt)) return;
    if (status !== 'approved' || state.account?.userId !== account.userId) clear();
    publish({
      phase: status === 'approved' ? 'ready' : status,
      account,
      email: account.email,
      error: null,
    });
  };
  const refresh = async () => {
    if (
      !service ||
      !['restoring', 'ready', 'pending', 'suspended', 'error'].includes(state.phase)
    ) {
      return;
    }
    await run(async (attempt) => accept(await service.restoreSession(), attempt), 'error');
  };
  const signOut = async () => {
    if (!service || disposed) return;
    const attempt = ++generation;
    revalidateAfterBusy = false;
    mutationAttempt = attempt;
    publish({
      ...initialState,
      phase: 'signin',
      busy: true,
      sampleGeneration: state.sampleGeneration + 1,
    });
    try {
      sample.clear();
    } catch {
      // Account signout must still clear credentials if sample teardown fails.
    }
    try {
      await service.signOut();
    } catch (error) {
      if (current(attempt)) fail(error, 'error');
    } finally {
      if (mutationAttempt === attempt) mutationAttempt = null;
      if (current(attempt)) publish({ busy: false });
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
    async initialize() {
      if (!service || disposed || started) return;
      started = true;
      unsubscribe = service.onSessionChange((event) => {
        if (disposed) return;
        if (event !== 'error' && mutationAttempt !== null) return;
        if (event === 'changed' && state.busy) {
          ++generation;
          revalidateAfterBusy = true;
          publish({ phase: 'restoring', error: null });
          return;
        }
        if (event === 'signed-out') {
          revalidateAfterBusy = false;
          ++generation;
          try {
            clear();
            publish({ ...initialState, phase: 'signin' });
          } catch (error) {
            fail(error, 'error');
          }
        } else if (event === 'recovery') {
          revalidateAfterBusy = false;
          ++generation;
          fail(new ParentAccountError('recovery_required'), 'new-password');
        } else if (event === 'error') {
          revalidateAfterBusy = false;
          ++generation;
          fail(new ParentAccountError('storage_unavailable'), 'error');
        } else {
          publish({ phase: 'restoring', error: null });
          void refresh();
        }
      });
      await refresh();
    },
    refresh,
    setActive(active: boolean) {
      service?.setAppActive(active);
      if (active) void refresh();
    },
    showForm(phase: 'signin' | 'register' | 'forgot') {
      if (
        disposed ||
        state.busy ||
        !['signin', 'register', 'verify', 'forgot', 'recovery-code'].includes(state.phase)
      )
        return;
      ++generation;
      publish({ phase, error: null, notice: null });
    },
    continueVerification(email: string) {
      if (disposed || state.busy || !['signin', 'register', 'verify'].includes(state.phase)) return;
      ++generation;
      publish({ phase: 'verify', email: email.trim().toLowerCase(), error: null, notice: null });
    },
    signIn(email: string, password: string) {
      return run(
        async (attempt) => {
          const account = await service!.signIn(email, password);
          if (!current(attempt)) return;
          publish({ phase: 'restoring' });
          await accept(account, attempt);
        },
        'signin',
        true,
      );
    },
    register(email: string, password: string) {
      return run(
        async (attempt) => {
          await service!.signUp(email, password);
          if (current(attempt))
            publish({ phase: 'verify', email: email.trim().toLowerCase(), notice: 'code_sent' });
        },
        'register',
        true,
      );
    },
    verify(code: string) {
      return run(
        async (attempt) => {
          const account = await service!.verifyEmail(state.email, code);
          if (!current(attempt)) return;
          publish({ phase: 'restoring' });
          await accept(account, attempt);
        },
        'verify',
        true,
      );
    },
    resend() {
      return run(async (attempt) => {
        await service!.resendVerification(state.email);
        if (current(attempt)) publish({ notice: 'code_sent' });
      }, state.phase);
    },
    requestRecovery(email: string) {
      return run(async (attempt) => {
        await service!.requestPasswordReset(email);
        if (current(attempt))
          publish({
            phase: 'recovery-code',
            email: email.trim().toLowerCase(),
            notice: 'code_sent',
          });
      }, 'forgot');
    },
    verifyRecovery(code: string) {
      return run(
        async (attempt) => {
          await service!.verifyRecovery(state.email, code);
          if (current(attempt)) publish({ phase: 'new-password', account: null });
        },
        'recovery-code',
        true,
      );
    },
    updatePassword(password: string) {
      return run(
        async (attempt) => {
          await service!.updatePassword(password);
          if (current(attempt))
            publish({ ...initialState, phase: 'signin', notice: 'password_updated' });
        },
        'new-password',
        true,
      );
    },
    async explore() {
      if (state.phase !== 'ready' || !state.account) return;
      await run(async (attempt) => {
        const account = await service!.restoreSession();
        await accept(account, attempt);
        if (!current(attempt) || state.phase !== 'ready') return;
        await sample.start();
        if (current(attempt))
          publish({
            sampleOpen: true,
            accountPanel: false,
            sampleGeneration: state.sampleGeneration + 1,
          });
      }, 'error');
    },
    openAccount() {
      if (state.phase === 'ready') publish({ accountPanel: true });
    },
    continueSample() {
      if (state.phase === 'ready' && state.sampleOpen) publish({ accountPanel: false });
    },
    restartSample() {
      if (state.phase !== 'ready' || state.busy) return;
      ++generation;
      try {
        clear();
        publish({ sampleGeneration: state.sampleGeneration + 1, error: null });
      } catch (error) {
        fail(error, 'error');
      }
    },
    signOut,
    dispose() {
      if (disposed) return;
      disposed = true;
      ++generation;
      unsubscribe?.();
      service?.setAppActive(false);
      service?.dispose();
      listeners.clear();
    },
  };
}

export type PilotController = ReturnType<typeof createPilotController>;
