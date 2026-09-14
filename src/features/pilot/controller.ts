import {
  ParentAccountError,
  type AccountProfile,
  type ParentAccountErrorCode,
  type ParentAccountService,
  type RealAccountSession,
} from '../../models/parentAccount';

export interface AccountProfileDraft {
  readonly userId: string;
  readonly displayName: string;
  readonly preferredLocale: 'ar' | 'en';
  readonly expectedRevision: number;
}

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
  | 'logout-error'
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
  readonly profile: AccountProfile | null;
  readonly profileDraft: AccountProfileDraft | null;
  readonly profileDirty: boolean;
  readonly profileBusy: boolean;
  readonly profileError: ParentAccountErrorCode | null;
  readonly profileNotice: 'saved' | null;
}

export interface PilotSampleActions {
  start(): Promise<void>;
  clear(): void;
  clearPrivate?(): Promise<void>;
}

const emptyProfile = {
  profile: null,
  profileDraft: null,
  profileDirty: false,
  profileBusy: false,
  profileError: null,
  profileNotice: null,
} as const;

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
  ...emptyProfile,
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
  let logoutRequired = false;
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
    const recoveryRequired = code === 'recovery_required' && phase !== 'logout-error';
    if (
      phase === 'error' ||
      phase === 'logout-error' ||
      [
        'recovery_required',
        'access_unavailable',
        'account_unavailable',
        'session_expired',
        'storage_unavailable',
      ].includes(code)
    ) {
      publish({
        ...emptyProfile,
        account: null,
        email: '',
        sampleOpen: false,
        accountPanel: false,
      });
      try {
        sample.clear();
      } catch {
        // The navigator stays closed even if a sample cleanup reports failure.
      }
    }
    publish({
      phase: recoveryRequired ? 'new-password' : phase,
      busy: false,
      error: recoveryRequired ? null : code,
      notice: null,
    });
  };
  const run = async (
    operation: (attempt: number) => Promise<void>,
    failurePhase: PilotPhase,
    mutatesIdentity = false,
  ) => {
    if (!service || disposed || state.busy || logoutRequired) return;
    const attempt = ++generation;
    if (mutatesIdentity) {
      mutationAttempt = attempt;
      publish({ ...emptyProfile, account: null, sampleOpen: false, accountPanel: false });
    }
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
  const profileRequiresRevalidation = (error: unknown) =>
    error instanceof ParentAccountError &&
    [
      'access_unavailable',
      'account_unavailable',
      'session_expired',
      'storage_unavailable',
      'operation_cancelled',
      'recovery_required',
    ].includes(error.code);
  const applyProfile = (profile: AccountProfile, discardDraft: boolean) => {
    const keepDraft =
      !discardDraft && state.profileDirty && state.profileDraft?.userId === profile.userId;
    publish({
      profile,
      profileDraft: keepDraft
        ? state.profileDraft
        : {
            userId: profile.userId,
            displayName: profile.displayName,
            preferredLocale: profile.preferredLocale,
            expectedRevision: profile.revision,
          },
      profileDirty: keepDraft,
      profileError:
        keepDraft && state.profileError === 'profile_conflict' ? 'profile_conflict' : null,
    });
  };
  const loadProfile = async (
    account: RealAccountSession,
    attempt: number,
    discardDraft: boolean,
  ) => {
    if (!current(attempt) || !service) return;
    publish({ profileBusy: true, profileNotice: null });
    try {
      const profile = await service.loadProfile(account.userId);
      if (!current(attempt) || state.account?.userId !== account.userId) return;
      if (profile.userId !== account.userId) throw new ParentAccountError('profile_unavailable');
      applyProfile(profile, discardDraft);
    } catch (error) {
      if (!current(attempt)) return;
      if (profileRequiresRevalidation(error)) throw error;
      publish({ profile: null, profileError: errorCode(error), profileNotice: null });
    } finally {
      if (current(attempt)) publish({ profileBusy: false });
    }
  };
  const accept = async (
    account: RealAccountSession | null,
    attempt: number,
    discardDraft = false,
  ) => {
    if (!current(attempt) || !service) return;
    if (!account) {
      clear();
      publish({ ...emptyProfile, phase: 'signin', account: null, email: '' });
      await sample.clearPrivate?.();
      return;
    }
    if (state.account?.userId !== account.userId) {
      clear();
      publish({ ...emptyProfile, phase: 'restoring', account: null, email: '' });
      await sample.clearPrivate?.();
      if (!current(attempt)) return;
    }
    const status = await service.getAccess(account.userId);
    if (!current(attempt)) return;
    if (status !== 'approved') {
      clear();
      publish(emptyProfile);
    }
    publish({
      phase: status === 'approved' ? 'ready' : status,
      account,
      email: account.email,
      error: null,
    });
    if (status === 'approved' && account.role !== 'child')
      await loadProfile(account, attempt, discardDraft);
  };
  const refresh = async (discardDraft = false) => {
    if (state.phase === 'logout-error') {
      await signOut();
      return;
    }
    if (
      !service ||
      !['restoring', 'ready', 'pending', 'suspended', 'error'].includes(state.phase)
    ) {
      return;
    }
    await run(
      async (attempt) => accept(await service.restoreSession(), attempt, discardDraft),
      'error',
    );
  };
  const signOut = async () => {
    if (!service || disposed || (logoutRequired && state.busy)) return;
    logoutRequired = true;
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
      const results = await Promise.allSettled([
        Promise.resolve().then(() => service.signOut()),
        Promise.resolve().then(() => sample.clearPrivate?.()),
      ]);
      const failed = results.find((result) => result.status === 'rejected');
      if (failed?.status === 'rejected') throw failed.reason;
      if (current(attempt)) logoutRequired = false;
    } catch (error) {
      if (current(attempt)) fail(error, 'logout-error');
    } finally {
      if (mutationAttempt === attempt) mutationAttempt = null;
      if (current(attempt)) publish({ busy: false });
    }
  };

  return {
    pairChildAvailable: Boolean(service?.pairChildDevice),
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
        // Both logout cleanup paths must finish before provider events can restore access.
        if (logoutRequired) return;
        if (event !== 'error' && mutationAttempt !== null) return;
        if (event === 'refreshed') {
          // A known principal keeps its editor mounted while access is revalidated.
          if (state.busy) revalidateAfterBusy = true;
          else void refresh();
          return;
        }
        if (event === 'changed' && state.busy) {
          ++generation;
          revalidateAfterBusy = true;
          publish({ phase: 'restoring', profile: null, profileNotice: null, error: null });
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
          publish({ phase: 'restoring', profile: null, profileNotice: null, error: null });
          void refresh();
        }
      });
      await refresh();
    },
    refresh,
    reloadProfile() {
      if (state.phase !== 'ready' || state.account?.role === 'child') return Promise.resolve();
      return refresh(true);
    },
    editProfile(patch: Partial<Pick<AccountProfileDraft, 'displayName' | 'preferredLocale'>>) {
      if (disposed || state.phase !== 'ready' || state.busy || !state.profileDraft) return;
      const draft = { ...state.profileDraft, ...patch };
      publish({
        profileDraft: draft,
        profileDirty:
          draft.displayName !== state.profile?.displayName ||
          draft.preferredLocale !== state.profile?.preferredLocale,
        profileError: state.profileError === 'profile_conflict' ? 'profile_conflict' : null,
        profileNotice: null,
      });
    },
    saveProfile() {
      const draft = state.profileDraft;
      if (
        state.phase !== 'ready' ||
        !draft ||
        !state.profile ||
        !state.profileDirty ||
        draft.userId !== state.account?.userId ||
        state.profileError === 'profile_conflict'
      )
        return Promise.resolve();
      const nameLength = Array.from(draft.displayName.trim()).length;
      if (nameLength < 1 || nameLength > 80) {
        publish({ profileError: 'invalid_profile', profileNotice: null });
        return Promise.resolve();
      }
      return run(async (attempt) => {
        publish({ profileBusy: true, profileError: null, profileNotice: null });
        try {
          const profile = await service!.saveProfile(
            {
              displayName: draft.displayName,
              preferredLocale: draft.preferredLocale,
              expectedRevision: draft.expectedRevision,
            },
            draft.userId,
          );
          if (!current(attempt) || state.account?.userId !== draft.userId) return;
          if (profile.userId !== draft.userId) throw new ParentAccountError('profile_unavailable');
          applyProfile(profile, true);
          publish({ profileNotice: 'saved' });
        } catch (error) {
          if (!current(attempt)) return;
          if (profileRequiresRevalidation(error)) throw error;
          publish({ profileError: errorCode(error), profileNotice: null });
        } finally {
          if (current(attempt)) publish({ profileBusy: false });
        }
      }, 'error');
    },
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
    pairChildDevice(token: string, requestId: string) {
      if (!service?.pairChildDevice || !['signin', 'error'].includes(state.phase) || state.account)
        return Promise.resolve();
      return run(
        async (attempt) => {
          const account = await service.pairChildDevice!(token, requestId);
          if (!current(attempt)) return;
          if (account.role !== 'child') throw new ParentAccountError('access_unavailable');
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
      if (state.phase !== 'ready' || !state.account || state.account.role === 'child') return;
      await run(async (attempt) => {
        const account = await service!.restoreSession();
        await accept(account, attempt);
        if (!current(attempt) || state.phase !== 'ready' || state.account?.role === 'child') return;
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
      if (state.phase === 'ready' && state.sampleOpen && state.account?.role !== 'child')
        publish({ accountPanel: false });
    },
    restartSample() {
      if (state.phase !== 'ready' || state.busy || state.account?.role === 'child') return;
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
      state = { ...initialState, phase: 'signin' };
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
