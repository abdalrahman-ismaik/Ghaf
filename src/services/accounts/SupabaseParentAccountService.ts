import {
  ParentAccountError,
  type AccountProfile,
  type AccountProfileUpdate,
  type ParentAccountErrorCode,
  type ParentAccountEvent,
  type ParentAccountService,
  type PilotAccessStatus,
  type RealAccountSession,
} from '../../models/parentAccount';
import { GuardedAccountStorage, RECOVERY_STORAGE_KEY } from './storage';
import type {
  AccountWorkspace,
  AccountWorkspaceUpdate,
  WorkspaceCommand,
} from '../../models/accountWorkspace';

interface ProviderUser {
  id: string;
  email?: string;
  email_confirmed_at?: string;
}

interface ProviderResult<T> {
  data: T;
  error: unknown;
  status?: number;
}

interface RecoveryReceipt {
  version: 1;
  state: 'pending' | 'verified';
  email: string;
  userId?: string;
}

function recoveryReceipt(value: string): RecoveryReceipt | null {
  try {
    const receipt = JSON.parse(value) as Partial<RecoveryReceipt> | null;
    if (
      receipt?.version === 1 &&
      (receipt.state === 'pending' || receipt.state === 'verified') &&
      typeof receipt.email === 'string' &&
      (receipt.state === 'pending' ||
        (typeof receipt.userId === 'string' && receipt.userId.length > 0))
    )
      return receipt as RecoveryReceipt;
  } catch {
    // Legacy or interrupted metadata is a barrier, never proof of verified recovery.
  }
  return null;
}

export interface AccountClientPort {
  auth: {
    signUp(credentials: {
      email: string;
      password: string;
    }): Promise<ProviderResult<{ session: unknown }>>;
    signInWithPassword(credentials: {
      email: string;
      password: string;
    }): Promise<ProviderResult<{ session: unknown }>>;
    verifyOtp(credentials: {
      email: string;
      token: string;
      type: 'signup' | 'recovery';
    }): Promise<ProviderResult<{ session: unknown }>>;
    resend(credentials: { email: string; type: 'signup' }): Promise<ProviderResult<unknown>>;
    resetPasswordForEmail(email: string): Promise<ProviderResult<unknown>>;
    updateUser(attributes: { password: string }): Promise<ProviderResult<unknown>>;
    getSession(): Promise<ProviderResult<{ session: unknown }>>;
    getUser(): Promise<ProviderResult<{ user: ProviderUser | null }>>;
    signOut(options: { scope: 'local' | 'global' }): Promise<{ error: unknown }>;
    onAuthStateChange(
      listener: (event: string, session?: { user?: ProviderUser } | null) => void,
    ): {
      data: { subscription: { unsubscribe(): void } };
    };
    startAutoRefresh(): Promise<void>;
    stopAutoRefresh(): Promise<void>;
  };
  from(table: 'pilot_access'): {
    select(columns: 'user_id,status'): {
      eq(
        column: 'user_id',
        value: string,
      ): {
        maybeSingle(): PromiseLike<ProviderResult<{ user_id: string; status: string } | null>>;
      };
    };
  };
  rpc(
    name:
      | 'get_or_create_account_profile'
      | 'save_account_profile'
      | 'get_or_create_account_workspace'
      | 'update_account_workspace'
      | 'ghaf_read'
      | 'ghaf_command',
    parameters?:
      | {
          p_display_name: string;
          p_preferred_locale: 'ar' | 'en';
          p_expected_revision: number;
        }
      | { p_expected_revision: number; p_command: WorkspaceCommand }
      | Record<string, unknown>,
  ): PromiseLike<ProviderResult<unknown>>;
}

export interface AccountRuntime {
  client: AccountClientPort;
  storage: GuardedAccountStorage;
}

function sanitize(
  error: unknown,
  fallback: ParentAccountErrorCode = 'provider_unavailable',
): ParentAccountError {
  if (error instanceof ParentAccountError) return error;
  if (typeof error !== 'object' || error === null) return new ParentAccountError(fallback);
  const candidate = error as { code?: unknown; status?: unknown; name?: unknown };
  const codes: Record<string, ParentAccountErrorCode> = {
    invalid_credentials: 'invalid_credentials',
    email_not_confirmed: 'email_not_verified',
    otp_expired: 'invalid_code',
    otp_disabled: 'invalid_code',
    weak_password: 'weak_password',
    same_password: 'weak_password',
    over_email_send_rate_limit: 'rate_limited',
    over_request_rate_limit: 'rate_limited',
    user_banned: 'account_unavailable',
    user_not_found: 'session_expired',
    session_not_found: 'session_expired',
    refresh_token_not_found: 'session_expired',
    refresh_token_already_used: 'session_expired',
    PGRST301: 'session_expired',
    PGRST303: 'session_expired',
    PT400: 'invalid_profile',
    PT409: 'profile_conflict',
    '42501': 'access_unavailable',
  };
  if (typeof candidate.code === 'string' && codes[candidate.code]) {
    return new ParentAccountError(codes[candidate.code]!);
  }
  if (candidate.status === 429) return new ParentAccountError('rate_limited');
  if (
    candidate.status === 401 ||
    candidate.status === 403 ||
    candidate.name === 'AuthSessionMissingError'
  ) {
    return new ParentAccountError('session_expired');
  }
  if (
    candidate.name === 'AbortError' ||
    candidate.name === 'TimeoutError' ||
    candidate.name === 'TypeError' ||
    candidate.name === 'AuthRetryableFetchError'
  ) {
    return new ParentAccountError('network_unavailable');
  }
  return new ParentAccountError(fallback);
}

function emailAddress(value: string): string {
  const email = value.trim().toLowerCase();
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ParentAccountError('invalid_credentials');
  }
  return email;
}

function strongPassword(value: string) {
  if (value.length < 12 || value.length > 256) throw new ParentAccountError('weak_password');
}

function emailCode(value: string) {
  if (!/^(?:[0-9]{6}|[0-9]{8})$/.test(value)) throw new ParentAccountError('invalid_code');
}

function checked<T>(result: ProviderResult<T>, fallback?: ParentAccountErrorCode): T {
  if (result.error && result.status === 0) throw new ParentAccountError('network_unavailable');
  if (result.error) throw sanitize(result.error, fallback);
  return result.data;
}

function profileFromRow(data: unknown, userId: string): AccountProfile {
  if (!Array.isArray(data) || data.length !== 1) {
    throw new ParentAccountError('profile_unavailable');
  }
  const row: unknown = data[0];
  if (typeof row !== 'object' || row === null) {
    throw new ParentAccountError('profile_unavailable');
  }
  const profile = row as Record<string, unknown>;
  if (
    !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(userId) ||
    profile.user_id !== userId ||
    typeof profile.display_name !== 'string' ||
    Array.from(profile.display_name).length > 80 ||
    profile.display_name !== profile.display_name.trim() ||
    (profile.preferred_locale !== 'ar' && profile.preferred_locale !== 'en') ||
    typeof profile.revision !== 'number' ||
    !Number.isSafeInteger(profile.revision) ||
    profile.revision < 0 ||
    (profile.revision > 0 && profile.display_name.length === 0) ||
    typeof profile.updated_at !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/.test(profile.updated_at) ||
    !Number.isFinite(Date.parse(profile.updated_at))
  ) {
    throw new ParentAccountError('profile_unavailable');
  }
  return {
    userId,
    displayName: profile.display_name,
    preferredLocale: profile.preferred_locale,
    revision: profile.revision,
    updatedAt: profile.updated_at,
  };
}

function profileUpdate(value: AccountProfileUpdate): AccountProfileUpdate {
  if (
    typeof value?.displayName !== 'string' ||
    Array.from(value.displayName.trim()).length < 1 ||
    Array.from(value.displayName.trim()).length > 80 ||
    (value.preferredLocale !== 'ar' && value.preferredLocale !== 'en') ||
    !Number.isSafeInteger(value.expectedRevision) ||
    value.expectedRevision < 0 ||
    value.expectedRevision >= Number.MAX_SAFE_INTEGER
  ) {
    throw new ParentAccountError('invalid_profile');
  }
  return { ...value, displayName: value.displayName.trim() };
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: string[]) {
  return (
    Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key))
  );
}

function boundedText(value: unknown, max: number, allowEmpty = false): value is string {
  return (
    typeof value === 'string' &&
    value === value.trim() &&
    (allowEmpty || value.length > 0) &&
    Array.from(value).length <= max
  );
}

function workspaceFromRow(data: unknown, userId: string): AccountWorkspace {
  const invalid = () => new ParentAccountError('profile_unavailable');
  if (!Array.isArray(data) || data.length !== 1 || !isRecord(data[0])) throw invalid();
  const row = data[0];
  if (
    !hasExactKeys(row, [
      'user_id',
      'workspace_id',
      'family_name',
      'members',
      'tasks',
      'study_plans',
      'revision',
      'updated_at',
    ]) ||
    !isUuid(userId) ||
    row.user_id !== userId ||
    !isUuid(row.workspace_id) ||
    !boundedText(row.family_name, 80, true) ||
    typeof row.revision !== 'number' ||
    !Number.isSafeInteger(row.revision) ||
    row.revision < 0 ||
    typeof row.updated_at !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/.test(row.updated_at) ||
    !Number.isFinite(Date.parse(row.updated_at)) ||
    !Array.isArray(row.members) ||
    row.members.length > 20 ||
    !Array.isArray(row.tasks) ||
    row.tasks.length > 200 ||
    !Array.isArray(row.study_plans) ||
    row.study_plans.length > 200
  )
    throw invalid();
  const allIds = new Set<string>([row.workspace_id.toLowerCase()]);
  const uniqueId = (value: unknown): value is string => {
    if (!isUuid(value) || allIds.has(value.toLowerCase())) return false;
    allIds.add(value.toLowerCase());
    return true;
  };
  const members = row.members.map((member: unknown) => {
    if (
      !isRecord(member) ||
      !hasExactKeys(member, ['id', 'nickname']) ||
      !uniqueId(member.id) ||
      !boundedText(member.nickname, 80)
    )
      throw invalid();
    return { id: member.id, nickname: member.nickname };
  });
  const memberIds = new Set(members.map((member) => member.id));
  const tasks = row.tasks.map((task: unknown) => {
    if (
      !isRecord(task) ||
      !hasExactKeys(task, ['id', 'childId', 'title', 'completed']) ||
      !uniqueId(task.id) ||
      !isUuid(task.childId) ||
      !memberIds.has(task.childId) ||
      !boundedText(task.title, 160) ||
      typeof task.completed !== 'boolean'
    )
      throw invalid();
    return { id: task.id, childId: task.childId, title: task.title, completed: task.completed };
  });
  const studyPlans = row.study_plans.map((plan: unknown) => {
    if (
      !isRecord(plan) ||
      !hasExactKeys(plan, ['id', 'childId', 'subject', 'nextStep', 'completed']) ||
      !uniqueId(plan.id) ||
      !isUuid(plan.childId) ||
      !memberIds.has(plan.childId) ||
      !boundedText(plan.subject, 160) ||
      !boundedText(plan.nextStep, 300) ||
      typeof plan.completed !== 'boolean'
    )
      throw invalid();
    return {
      id: plan.id,
      childId: plan.childId,
      subject: plan.subject,
      nextStep: plan.nextStep,
      completed: plan.completed,
    };
  });
  return {
    userId,
    workspaceId: row.workspace_id,
    familyName: row.family_name,
    revision: row.revision,
    updatedAt: row.updated_at,
    members,
    tasks,
    studyPlans,
  };
}

function workspaceUpdate(value: AccountWorkspaceUpdate): AccountWorkspaceUpdate {
  const invalid = () => new ParentAccountError('invalid_profile');
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ['expectedRevision', 'command']) ||
    typeof value.expectedRevision !== 'number' ||
    !Number.isSafeInteger(value.expectedRevision) ||
    value.expectedRevision < 0 ||
    value.expectedRevision >= Number.MAX_SAFE_INTEGER ||
    !isRecord(value.command)
  )
    throw invalid();
  const command: Record<string, unknown> = value.command;
  const text = (field: string, max: number) => {
    if (typeof command[field] !== 'string') throw invalid();
    const result = command[field].trim();
    if (!boundedText(result, max)) throw invalid();
    return result;
  };
  const id = (field: string) => {
    if (!isUuid(command[field])) throw invalid();
    return command[field].toLowerCase();
  };
  const keys = (...fields: string[]) => {
    if (!hasExactKeys(command, ['type', ...fields])) throw invalid();
  };
  let valid: WorkspaceCommand;
  switch (command.type) {
    case 'rename_family':
      keys('name');
      valid = { type: command.type, name: text('name', 80) };
      break;
    case 'add_member':
      keys('nickname');
      valid = { type: command.type, nickname: text('nickname', 80) };
      break;
    case 'rename_member':
      keys('id', 'nickname');
      valid = { type: command.type, id: id('id'), nickname: text('nickname', 80) };
      break;
    case 'add_task':
      keys('childId', 'title');
      valid = { type: command.type, childId: id('childId'), title: text('title', 160) };
      break;
    case 'edit_task':
      keys('id', 'title');
      valid = { type: command.type, id: id('id'), title: text('title', 160) };
      break;
    case 'complete_task':
    case 'complete_study_plan':
      keys('id', 'completed');
      if (typeof command.completed !== 'boolean') throw invalid();
      valid = { type: command.type, id: id('id'), completed: command.completed };
      break;
    case 'add_study_plan':
      keys('childId', 'subject', 'nextStep');
      valid = {
        type: command.type,
        childId: id('childId'),
        subject: text('subject', 160),
        nextStep: text('nextStep', 300),
      };
      break;
    case 'edit_study_plan':
      keys('id', 'subject', 'nextStep');
      valid = {
        type: command.type,
        id: id('id'),
        subject: text('subject', 160),
        nextStep: text('nextStep', 300),
      };
      break;
    default:
      throw invalid();
  }
  return { expectedRevision: value.expectedRevision, command: valid };
}

function workspaceReflectsCommand(workspace: AccountWorkspace, command: WorkspaceCommand) {
  switch (command.type) {
    case 'rename_family':
      return workspace.familyName === command.name;
    case 'add_member':
      return workspace.members.at(-1)?.nickname === command.nickname;
    case 'rename_member':
      return (
        workspace.members.find((member) => member.id === command.id)?.nickname === command.nickname
      );
    case 'add_task': {
      const task = workspace.tasks.at(-1);
      return task?.childId === command.childId && task.title === command.title && !task.completed;
    }
    case 'edit_task':
      return workspace.tasks.find((task) => task.id === command.id)?.title === command.title;
    case 'complete_task':
      return (
        workspace.tasks.find((task) => task.id === command.id)?.completed === command.completed
      );
    case 'add_study_plan': {
      const plan = workspace.studyPlans.at(-1);
      return (
        plan?.childId === command.childId &&
        plan.subject === command.subject &&
        plan.nextStep === command.nextStep &&
        !plan.completed
      );
    }
    case 'edit_study_plan': {
      const plan = workspace.studyPlans.find((candidate) => candidate.id === command.id);
      return plan?.subject === command.subject && plan.nextStep === command.nextStep;
    }
    case 'complete_study_plan':
      return (
        workspace.studyPlans.find((plan) => plan.id === command.id)?.completed === command.completed
      );
  }
}

export class SupabaseParentAccountService implements ParentAccountService {
  private runtimePromise: Promise<AccountRuntime> | null = null;
  private runtime: AccountRuntime | null = null;
  private generation = 0;
  private queue: Promise<unknown> = Promise.resolve();
  private listeners = new Set<(event: ParentAccountEvent) => void>();
  private unsubscribe: (() => void) | null = null;
  private blocked = false;
  private disposed = false;
  private active = true;
  private recovering = false;
  private knownUserId: string | null = null;
  private ownAuthMutation = false;
  private ownMutationEmail: string | null = null;

  constructor(private readonly initialize: () => Promise<AccountRuntime>) {}

  private emit(event: ParentAccountEvent) {
    if (!this.disposed) this.listeners.forEach((listener) => listener(event));
  }

  private async getRuntime(): Promise<AccountRuntime> {
    if (!this.runtimePromise) {
      this.runtimePromise = this.initialize()
        .then((runtime) => {
          this.runtime = runtime;
          if (this.blocked || this.disposed) runtime.storage.blockWrites();
          const { data } = runtime.client.auth.onAuthStateChange((event, session) => {
            if (this.blocked || this.disposed) return;
            if (event === 'SIGNED_OUT') {
              this.generation++;
              this.blocked = true;
              runtime.storage.blockWrites();
              this.emit('signed-out');
              void runtime.storage.clearCredentials().catch(() => this.emit('error'));
            } else if (event === 'PASSWORD_RECOVERY') {
              this.recovering = true;
              this.emit('recovery');
            } else if (
              event === 'TOKEN_REFRESHED' ||
              event === 'SIGNED_IN' ||
              event === 'USER_UPDATED'
            ) {
              const sameIdentity =
                !this.ownAuthMutation &&
                this.knownUserId !== null &&
                session?.user?.id === this.knownUserId &&
                (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN');
              if (event === 'SIGNED_IN' && session?.user?.id) {
                const changedDuringRead =
                  !this.ownAuthMutation && this.knownUserId && session.user.id !== this.knownUserId;
                const unexpectedMutationIdentity =
                  this.ownAuthMutation &&
                  this.ownMutationEmail &&
                  session.user.email?.trim().toLowerCase() !== this.ownMutationEmail;
                if (changedDuringRead || unexpectedMutationIdentity) {
                  this.generation++;
                  this.knownUserId = session.user.id;
                }
              }
              this.emit(
                runtime.storage.hasFailed
                  ? 'error'
                  : this.recovering
                    ? 'recovery'
                    : sameIdentity
                      ? 'refreshed'
                      : 'changed',
              );
            }
          });
          this.unsubscribe = () => data.subscription.unsubscribe();
          if (this.disposed) this.unsubscribe();
          this.setAppActive(this.active);
          return runtime;
        })
        .catch((error: unknown) => {
          this.runtimePromise = null;
          throw sanitize(error);
        });
    }
    return this.runtimePromise;
  }

  private run<T>(
    operation: (runtime: AccountRuntime, generation: number) => Promise<T>,
    allowSignIn = false,
  ): Promise<T> {
    const generation = this.generation;
    const pending = this.queue.then(async () => {
      this.assertCurrent(generation);
      const runtime = await this.getRuntime();
      this.assertCurrent(generation);
      if (allowSignIn) {
        this.blocked = false;
        runtime.storage.allowWrites();
        this.setAppActive(this.active);
      } else if (this.blocked) {
        throw new ParentAccountError('session_expired');
      }
      try {
        const result = await operation(runtime, generation);
        this.assertCurrent(generation);
        if (runtime.storage.hasFailed) throw new ParentAccountError('storage_unavailable');
        return result;
      } catch (error) {
        this.assertCurrent(generation);
        if (runtime.storage.hasFailed) throw new ParentAccountError('storage_unavailable');
        throw sanitize(error);
      }
    });
    this.queue = pending.catch(() => undefined);
    return pending;
  }

  private assertCurrent(generation: number) {
    if (generation !== this.generation || this.disposed)
      throw new ParentAccountError('operation_cancelled');
  }

  private async identity(runtime: AccountRuntime): Promise<RealAccountSession> {
    const generation = this.generation;
    const { user } = checked(await runtime.client.auth.getUser());
    this.assertCurrent(generation);
    if (!user?.id || !user.email) throw new ParentAccountError('session_expired');
    if (!user.email_confirmed_at) throw new ParentAccountError('email_not_verified');
    this.knownUserId = user.id;
    return { userId: user.id, email: user.email };
  }

  signUp(email: string, password: string): Promise<void> {
    return this.run(async ({ client }) => {
      strongPassword(password);
      const { session } = checked(
        await this.authMutation(
          () => client.auth.signUp({ email: emailAddress(email), password }),
          emailAddress(email),
        ),
      );
      if (session) {
        await this.clearRuntimeSession();
        throw new ParentAccountError('configuration_unavailable');
      }
    }, true);
  }

  verifyEmail(email: string, code: string): Promise<RealAccountSession> {
    return this.run(async (runtime, generation) => {
      emailCode(code);
      checked(
        await this.authMutation(
          () =>
            runtime.client.auth.verifyOtp({
              email: emailAddress(email),
              token: code,
              type: 'signup',
            }),
          emailAddress(email),
        ),
        'invalid_code',
      );
      this.assertCurrent(generation);
      const session = await this.identity(runtime);
      this.assertCurrent(generation);
      await runtime.storage.removeItem(RECOVERY_STORAGE_KEY);
      this.recovering = false;
      return session;
    }, true);
  }

  signIn(email: string, password: string): Promise<RealAccountSession> {
    return this.run(async (runtime, generation) => {
      if (!password || password.length > 256) throw new ParentAccountError('invalid_credentials');
      checked(
        await this.authMutation(
          () => runtime.client.auth.signInWithPassword({ email: emailAddress(email), password }),
          emailAddress(email),
        ),
      );
      this.assertCurrent(generation);
      const session = await this.identity(runtime);
      this.assertCurrent(generation);
      await runtime.storage.removeItem(RECOVERY_STORAGE_KEY);
      this.recovering = false;
      return session;
    }, true);
  }

  restoreSession(): Promise<RealAccountSession | null> {
    if (this.blocked) return Promise.resolve(null);
    return this.run(async (runtime) => {
      const rawReceipt = await runtime.storage.getItem(RECOVERY_STORAGE_KEY);
      if (rawReceipt) {
        this.recovering = true;
        const receipt = recoveryReceipt(rawReceipt);
        if (receipt?.state !== 'verified') {
          await this.clearRuntimeSession('local', true);
          throw new ParentAccountError('session_expired');
        }
        const identity = await this.identity(runtime);
        if (receipt.userId !== identity.userId || receipt.email !== emailAddress(identity.email)) {
          await this.clearRuntimeSession('local', true);
          throw new ParentAccountError('session_expired');
        }
        throw new ParentAccountError('recovery_required');
      }
      const { session } = checked(await runtime.client.auth.getSession());
      return session ? this.identity(runtime) : null;
    });
  }

  getAccess(userId: string): Promise<PilotAccessStatus> {
    return this.run(async (runtime) => {
      if (this.recovering || (await runtime.storage.getItem(RECOVERY_STORAGE_KEY)))
        throw new ParentAccountError('recovery_required');
      const session = await this.identity(runtime);
      if (session.userId !== userId) throw new ParentAccountError('access_unavailable');
      const row = checked(
        await runtime.client
          .from('pilot_access')
          .select('user_id,status')
          .eq('user_id', userId)
          .maybeSingle(),
        'access_unavailable',
      );
      if (
        !row ||
        row.user_id !== userId ||
        !['pending', 'approved', 'suspended'].includes(row.status)
      ) {
        throw new ParentAccountError('access_unavailable');
      }
      return row.status as PilotAccessStatus;
    });
  }

  loadProfile(): Promise<AccountProfile> {
    return this.run(async (runtime, generation) => {
      const session = await this.profileIdentity(runtime, generation);
      const data = checked(
        await runtime.client.rpc('get_or_create_account_profile'),
        'profile_unavailable',
      );
      this.assertCurrent(generation);
      return profileFromRow(data, session.userId);
    });
  }

  saveProfile(update: AccountProfileUpdate): Promise<AccountProfile> {
    return this.run(async (runtime, generation) => {
      const valid = profileUpdate(update);
      const session = await this.profileIdentity(runtime, generation);
      const data = checked(
        await runtime.client.rpc('save_account_profile', {
          p_display_name: valid.displayName,
          p_preferred_locale: valid.preferredLocale,
          p_expected_revision: valid.expectedRevision,
        }),
        'profile_unavailable',
      );
      this.assertCurrent(generation);
      const profile = profileFromRow(data, session.userId);
      if (
        profile.revision !== valid.expectedRevision + 1 ||
        profile.displayName !== valid.displayName ||
        profile.preferredLocale !== valid.preferredLocale
      ) {
        throw new ParentAccountError('profile_unavailable');
      }
      return profile;
    });
  }

  private async profileIdentity(runtime: AccountRuntime, generation: number) {
    const recovery = this.recovering || (await runtime.storage.getItem(RECOVERY_STORAGE_KEY));
    this.assertCurrent(generation);
    if (recovery) throw new ParentAccountError('recovery_required');
    const session = await this.identity(runtime);
    this.assertCurrent(generation);
    return session;
  }

  loadWorkspace(): Promise<AccountWorkspace> {
    return this.run(async (runtime, generation) => {
      const session = await this.profileIdentity(runtime, generation);
      const data = checked(
        await runtime.client.rpc('get_or_create_account_workspace'),
        'profile_unavailable',
      );
      this.assertCurrent(generation);
      return workspaceFromRow(data, session.userId);
    });
  }

  familyRequest(name: 'ghaf_read' | 'ghaf_command', parameters?: Record<string, unknown>) {
    return this.run(async (runtime, generation) => {
      await this.profileIdentity(runtime, generation);
      const result = await runtime.client.rpc(name, parameters);
      this.assertCurrent(generation);
      return result;
    });
  }

  updateWorkspace(update: AccountWorkspaceUpdate): Promise<AccountWorkspace> {
    return this.run(async (runtime, generation) => {
      const valid = workspaceUpdate(update);
      const session = await this.profileIdentity(runtime, generation);
      const data = checked(
        await runtime.client.rpc('update_account_workspace', {
          p_expected_revision: valid.expectedRevision,
          p_command: valid.command,
        }),
        'profile_unavailable',
      );
      this.assertCurrent(generation);
      const workspace = workspaceFromRow(data, session.userId);
      if (
        workspace.revision !== valid.expectedRevision + 1 ||
        !workspaceReflectsCommand(workspace, valid.command)
      ) {
        throw new ParentAccountError('profile_unavailable');
      }
      return workspace;
    });
  }

  resendVerification(email: string): Promise<void> {
    return this.run(async ({ client }) => {
      checked(await client.auth.resend({ email: emailAddress(email), type: 'signup' }));
    }, true);
  }

  requestPasswordReset(email: string): Promise<void> {
    return this.run(async ({ client }) => {
      checked(await client.auth.resetPasswordForEmail(emailAddress(email)));
    }, true);
  }

  verifyRecovery(email: string, code: string): Promise<void> {
    return this.run(async (runtime, generation) => {
      emailCode(code);
      const normalizedEmail = emailAddress(email);
      const pending: RecoveryReceipt = { version: 1, state: 'pending', email: normalizedEmail };
      await runtime.storage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(pending));
      this.recovering = true;
      await this.clearRuntimeSession('local', true);
      this.assertCurrent(generation);
      this.blocked = false;
      runtime.storage.allowWrites();
      this.setAppActive(this.active);
      try {
        const { session } = checked(
          await this.authMutation(
            () =>
              runtime.client.auth.verifyOtp({
                email: normalizedEmail,
                token: code,
                type: 'recovery',
              }),
            normalizedEmail,
          ),
          'invalid_code',
        );
        this.assertCurrent(generation);
        if (!session) throw new ParentAccountError('invalid_code');
        const identity = await this.identity(runtime);
        this.assertCurrent(generation);
        if (emailAddress(identity.email) !== normalizedEmail)
          throw new ParentAccountError('invalid_code');
        const receipt: RecoveryReceipt = {
          version: 1,
          state: 'verified',
          email: normalizedEmail,
          userId: identity.userId,
        };
        await runtime.storage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(receipt));
      } catch (error) {
        this.assertCurrent(generation);
        await this.clearRuntimeSession('local', true);
        throw error;
      }
    }, true);
  }

  updatePassword(password: string): Promise<void> {
    return this.run(async (runtime, generation) => {
      strongPassword(password);
      const rawReceipt = await runtime.storage.getItem(RECOVERY_STORAGE_KEY);
      const receipt = rawReceipt ? recoveryReceipt(rawReceipt) : null;
      if (receipt?.state !== 'verified') throw new ParentAccountError('recovery_required');
      const identity = await this.identity(runtime);
      this.assertCurrent(generation);
      if (receipt.userId !== identity.userId || receipt.email !== emailAddress(identity.email)) {
        await this.clearRuntimeSession('local', true);
        throw new ParentAccountError('session_expired');
      }
      checked(
        await this.authMutation(
          () => runtime.client.auth.updateUser({ password }),
          emailAddress(identity.email),
        ),
      );
      await this.clearRuntimeSession('global');
    });
  }

  private async authMutation<T>(operation: () => Promise<T>, expectedEmail: string): Promise<T> {
    this.ownAuthMutation = true;
    this.ownMutationEmail = expectedEmail;
    try {
      return await operation();
    } finally {
      this.ownAuthMutation = false;
      this.ownMutationEmail = null;
    }
  }

  private async clearRuntimeSession(
    scope: 'local' | 'global' = 'local',
    preserveRecovery = false,
  ): Promise<void> {
    const runtime = this.runtime;
    if (!runtime) return;
    this.blocked = true;
    runtime.storage.blockWrites();
    let providerError: unknown;
    try {
      await runtime.client.auth.stopAutoRefresh();
      providerError = (await runtime.client.auth.signOut({ scope })).error;
    } catch (error) {
      providerError = error;
    } finally {
      try {
        await runtime.storage.clearCredentials(preserveRecovery);
      } finally {
        runtime.storage.forgetSnapshot();
        this.recovering = preserveRecovery;
        this.knownUserId = null;
      }
    }
    if (providerError) throw sanitize(providerError);
  }

  signOut(): Promise<void> {
    this.generation++;
    this.blocked = true;
    this.recovering = false;
    this.runtime?.storage.blockWrites();
    this.emit('signed-out');
    const immediateClear = this.runtime?.storage.clearCredentials().catch(() => undefined);
    const pending = this.queue.then(async () => {
      await immediateClear;
      if (this.runtimePromise) await this.runtimePromise.catch(() => undefined);
      await this.clearRuntimeSession();
    });
    this.queue = pending.catch(() => undefined);
    return pending;
  }

  onSessionChange(listener: (event: ParentAccountEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setAppActive(active: boolean): void {
    this.active = active;
    if (this.runtime) {
      const auth = this.runtime.client.auth;
      void (
        active && !this.blocked && !this.disposed ? auth.startAutoRefresh() : auth.stopAutoRefresh()
      ).catch(() => this.emit('error'));
    }
  }

  dispose(): void {
    this.disposed = true;
    this.generation++;
    this.runtime?.storage.blockWrites();
    this.unsubscribe?.();
    this.listeners.clear();
    this.setAppActive(false);
  }
}
