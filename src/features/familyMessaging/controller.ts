import {
  asMessagingError,
  ATTEMPT_LIFETIME_MS,
  HISTORY_RETENTION_MS,
  matchesPhrase,
  MessagingError,
  PAGE_SIZE,
  phraseText,
  POLL_MS,
  validBody,
  type FamilyMessage,
  type FamilyMessagingService,
  type MessagingChild,
  type MessagingContext,
  type MessagingDevice,
  type MessagingErrorCode,
  type MessagingInvitation,
  type MessagingRole,
  type MessagingThread,
  type PhraseId,
  type PeerPermission,
  type SendInput,
} from './contracts';

type Phase =
  'unavailable' | 'signedOut' | 'authenticating' | 'validating' | 'ready' | 'locked' | 'revoked';
interface Draft {
  text: string;
  phraseId: PhraseId | null;
  originScope?: string;
}
export interface PendingSend extends SendInput {
  status: 'sending' | 'unknown' | 'failed';
  error: MessagingErrorCode | null;
  startedAt: number;
}
export interface MessagingState {
  phase: Phase;
  context: MessagingContext | null;
  threads: MessagingThread[];
  threadId: string | null;
  messages: FamilyMessage[];
  draft: Draft;
  pending: PendingSend | null;
  busy: boolean;
  loading: boolean;
  hasEarlier: boolean;
  hasNewMessages: boolean;
  error: MessagingErrorCode | null;
  children: MessagingChild[];
  peerPermissions: PeerPermission[];
  peerPermissionsLoaded: boolean;
  peerError: MessagingErrorCode | null;
  peerAccessRemoved: boolean;
  devices: MessagingDevice[];
  invitation: MessagingInvitation | null;
  remoteSignoutUnconfirmed: boolean;
  expectedRole: MessagingRole | null;
}
const blankDraft = (): Draft => ({ text: '', phraseId: null });
function initial(configured: boolean): MessagingState {
  return {
    phase: configured ? 'signedOut' : 'unavailable',
    context: null,
    threads: [],
    threadId: null,
    messages: [],
    draft: blankDraft(),
    pending: null,
    busy: false,
    loading: false,
    hasEarlier: false,
    hasNewMessages: false,
    error: null,
    children: [],
    peerPermissions: [],
    peerPermissionsLoaded: false,
    peerError: null,
    peerAccessRemoved: false,
    devices: [],
    invitation: null,
    remoteSignoutUnconfirmed: false,
    expectedRole: null,
  };
}
export function mergeMessages(
  current: readonly FamilyMessage[],
  incoming: readonly FamilyMessage[],
  now = Date.now(),
): FamilyMessage[] {
  const byId = new Map(current.map((message) => [message.id, message]));
  for (const message of incoming) byId.set(message.id, message);
  return [...byId.values()]
    .filter((message) => Date.parse(message.createdAt) > now - HISTORY_RETENTION_MS)
    .sort((a, b) => a.sequence - b.sequence);
}

export class FamilyMessagingController {
  private state: MessagingState;
  private listeners = new Set<() => void>();
  private epoch = 0;
  private requests = new Set<AbortController>();
  private polling: ReturnType<typeof setTimeout> | null = null;
  private visible = false;
  private foreground = true;
  private hydrated = false;
  private principal: string | null = null;
  private selected: string | null = null;
  private drafts = new Map<string, Draft>();
  private fetchedCursors = new Map<string, number>();
  private attempts = new Map<string, PendingSend>();
  private helpRequested = false;
  private localScope = '';
  private helpScope = '';
  private locale: 'ar' | 'en' = 'ar';

  constructor(
    readonly service: FamilyMessagingService,
    private readonly createId: () => Promise<string>,
    private readonly now = Date.now,
  ) {
    this.state = initial(service.configured);
  }
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private publish(patch: Partial<MessagingState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((listener) => listener());
  }
  private cancel() {
    this.epoch += 1;
    this.requests.forEach((request) => request.abort());
    this.requests.clear();
    if (this.polling) clearTimeout(this.polling);
    this.polling = null;
    for (const [id, attempt] of this.attempts) {
      if (attempt.status === 'sending')
        this.attempts.set(id, { ...attempt, status: 'unknown', error: 'unknown' });
    }
  }
  private clearPrivate() {
    this.principal = null;
    this.selected = null;
    this.drafts.clear();
    this.fetchedCursors.clear();
    this.attempts.clear();
    this.helpRequested = false;
  }
  private async run<T>(operation: (signal: AbortSignal) => Promise<T>): Promise<T> {
    const epoch = this.epoch;
    const request = new AbortController();
    this.requests.add(request);
    try {
      const result = await operation(request.signal);
      if (epoch !== this.epoch || request.signal.aborted)
        throw new MessagingError('not_authenticated');
      return result;
    } finally {
      this.requests.delete(request);
    }
  }
  private async fail(error: unknown, epoch: number) {
    if (epoch !== this.epoch) return;
    const code = asMessagingError(error).code;
    if (['access_revoked', 'not_authenticated', 'not_authorized'].includes(code)) {
      this.cancel();
      this.clearPrivate();
      this.hydrated = false;
      const failedEpoch = this.epoch;
      this.publish({
        ...initial(this.service.configured),
        phase: 'revoked',
        error: code,
        expectedRole: this.state.expectedRole,
      });
      try {
        await this.service.forget();
      } catch {
        if (failedEpoch === this.epoch) this.publish({ error: 'storage_failed' });
      }
    } else {
      this.publish({ error: code, busy: false, loading: false });
    }
  }
  private async failThread(error: unknown, epoch: number, threadId: string) {
    if (epoch !== this.epoch) return;
    if (
      asMessagingError(error).code === 'not_authorized' &&
      this.state.threads.some((thread) => thread.id === threadId && thread.kind === 'child_child')
    ) {
      this.acceptThreads(this.state.threads.filter((thread) => thread.id !== threadId));
      return;
    }
    await this.fail(error, epoch);
  }
  setLocale(locale: 'ar' | 'en') {
    this.locale = locale;
  }
  setLocalContext(scope: string, role: MessagingRole | null) {
    const scopeChanged = this.localScope !== '' && this.localScope !== scope;
    if (scopeChanged) {
      this.helpRequested = false;
      for (const [id, draft] of this.drafts) if (draft.originScope) this.drafts.delete(id);
    }
    this.localScope = scope;
    if (scopeChanged || (role && this.state.context && role !== this.state.context.role))
      this.lock();
    if (this.state.expectedRole !== role) this.publish({ expectedRole: role });
  }
  openFor(role: MessagingRole, help = false) {
    this.publish({ expectedRole: role });
    if (help) {
      this.helpRequested = true;
      this.helpScope = this.localScope;
    }
    if (this.state.context && this.state.context.role !== role) this.lock();
  }
  setVisible(visible: boolean) {
    this.visible = visible;
    if (visible && this.foreground) void this.validate();
    else this.lock();
  }
  setForeground(foreground: boolean) {
    this.foreground = foreground;
    if (!foreground) this.lock();
    else if (this.visible) void this.validate();
  }
  lock() {
    this.cancel();
    if (!this.service.configured) return;
    this.publish({
      ...initial(true),
      phase: this.hydrated ? 'locked' : 'signedOut',
      expectedRole: this.state.expectedRole,
    });
  }
  private acceptContext(context: MessagingContext) {
    if (this.state.expectedRole && context.role !== this.state.expectedRole)
      throw new MessagingError('role_mismatch');
    const key = `${context.householdId}:${context.personId}:${context.deviceId}`;
    if (this.principal && this.principal !== key) this.clearPrivate();
    this.principal = key;
    this.publish({ phase: 'ready', context, error: null, remoteSignoutUnconfirmed: false });
  }
  private acceptThreads(threads: MessagingThread[]) {
    const allowed = new Set(threads.map((thread) => thread.id));
    for (const id of this.drafts.keys()) if (!allowed.has(id)) this.drafts.delete(id);
    for (const id of this.attempts.keys()) if (!allowed.has(id)) this.attempts.delete(id);
    for (const id of this.fetchedCursors.keys())
      if (!allowed.has(id)) this.fetchedCursors.delete(id);
    const removed = this.selected !== null && !allowed.has(this.selected);
    this.publish({ threads });
    if (removed) {
      this.closeThread();
      this.publish({ peerAccessRemoved: true });
    }
    return removed;
  }
  private preferredThread(context: MessagingContext, threads: MessagingThread[]) {
    if (context.role === 'child' && this.helpRequested)
      return threads.find(
        (thread) => thread.kind === 'parent_child' && thread.otherRole === 'parent',
      );
    return (
      threads.find((thread) => thread.id === this.selected) ??
      (context.role === 'child' && threads.length === 1 ? threads[0] : undefined)
    );
  }
  async validate() {
    if (
      !this.service.configured ||
      !this.foreground ||
      !this.visible ||
      this.state.phase === 'authenticating'
    )
      return;
    this.cancel();
    const epoch = this.epoch;
    this.publish({
      ...initial(this.service.configured),
      phase: 'validating',
      expectedRole: this.state.expectedRole,
    });
    try {
      const context = await this.run((signal) =>
        this.hydrated ? this.service.context(signal) : this.service.restore(signal),
      );
      this.hydrated = context !== null;
      if (!context) {
        this.publish({ phase: 'signedOut' });
        return;
      }
      this.acceptContext(context);
      const threads = await this.run((signal) => this.service.threads(signal));
      this.acceptThreads(threads);
      const selected = this.preferredThread(context, threads);
      if (selected) await this.openThread(selected.id);
      else this.schedule();
    } catch (error) {
      if (epoch !== this.epoch) return;
      if (asMessagingError(error).code === 'role_mismatch') {
        this.publish({ phase: 'locked', context: null, threads: [], error: 'role_mismatch' });
      } else {
        await this.fail(error, epoch);
        if (this.state.phase === 'validating') this.publish({ phase: 'locked' });
      }
    }
  }
  async authenticate(
    mode: MessagingRole,
    values: { email: string; password: string; code: string; label: string },
  ) {
    if (this.state.busy || !this.service.configured) return;
    if (this.state.expectedRole && mode !== this.state.expectedRole) {
      this.publish({ error: 'role_mismatch' });
      return;
    }
    this.cancel();
    const epoch = this.epoch;
    if (this.principal) this.clearPrivate();
    this.publish({
      ...initial(this.service.configured),
      phase: 'authenticating',
      busy: true,
      expectedRole: mode,
    });
    try {
      const context = await this.run((signal) =>
        mode === 'parent'
          ? this.service.signIn(values.email, values.password, values.label, signal)
          : this.service.enroll(values.code, values.label, signal),
      );
      this.hydrated = true;
      if (context.role !== mode) throw new MessagingError('role_mismatch');
      this.acceptContext(context);
      const threads = await this.run((signal) => this.service.threads(signal));
      this.acceptThreads(threads);
      this.publish({ busy: false });
      const selected = this.preferredThread(context, threads);
      if (selected) await this.openThread(selected.id);
      else this.schedule();
    } catch (error) {
      if (epoch !== this.epoch) return;
      this.publish({ phase: 'signedOut', busy: false, context: null });
      await this.fail(error, epoch);
    }
  }
  private schedule() {
    if (this.polling) clearTimeout(this.polling);
    if (!this.visible || !this.foreground || this.state.phase !== 'ready' || !this.state.context)
      return;
    this.polling = setTimeout(() => {
      this.polling = null;
      void this.sync();
    }, POLL_MS);
  }
  async openThread(threadId: string) {
    if (!this.state.context || !this.state.threads.some((thread) => thread.id === threadId)) return;
    if (this.helpRequested && this.state.context.role === 'child') {
      const parentThread = this.state.threads.find(
        (thread) => thread.kind === 'parent_child' && thread.otherRole === 'parent',
      );
      if (!parentThread) return;
      threadId = parentThread.id;
    }
    this.cancel();
    this.selected = threadId;
    const epoch = this.epoch;
    if (
      this.helpRequested &&
      this.state.context.role === 'child' &&
      this.helpScope === this.localScope
    ) {
      if (!this.drafts.get(threadId)?.text)
        this.drafts.set(threadId, {
          text: phraseText[this.locale].help,
          phraseId: 'help',
          originScope: this.helpScope,
        });
      this.helpRequested = false;
    }
    this.publish({
      threadId,
      messages: [],
      loading: true,
      busy: false,
      error: null,
      hasEarlier: false,
      hasNewMessages: false,
      peerAccessRemoved: false,
      draft: this.drafts.get(threadId) ?? blankDraft(),
      pending: this.attempts.get(threadId) ?? null,
    });
    try {
      const messages = await this.run((signal) => this.service.messages(threadId, {}, signal));
      this.fetchedCursors.set(threadId, messages.at(-1)?.sequence ?? 0);
      this.reconcile(messages);
      this.publish({
        messages: mergeMessages([], messages, this.now()),
        loading: false,
        hasEarlier: messages.length === PAGE_SIZE,
      });
    } catch (error) {
      await this.failThread(error, epoch, threadId);
    } finally {
      if (epoch === this.epoch) this.schedule();
    }
  }
  closeThread() {
    this.cancel();
    this.selected = null;
    this.publish({
      threadId: null,
      messages: [],
      draft: blankDraft(),
      pending: null,
      error: null,
      loading: false,
      busy: false,
    });
    this.schedule();
  }
  private reconcile(messages: readonly FamilyMessage[]) {
    const threadId = this.state.threadId;
    if (!threadId) return;
    const pending = this.attempts.get(threadId);
    if (
      pending &&
      messages.some(
        (message) =>
          message.clientKey === pending.clientKey &&
          message.senderId === this.state.context?.personId &&
          message.threadId === pending.threadId &&
          message.body === pending.body,
      )
    ) {
      this.attempts.delete(threadId);
      this.drafts.delete(threadId);
      this.publish({ pending: null, draft: blankDraft() });
    }
  }
  async sync(earlier = false) {
    const threadId = this.state.threadId;
    if (
      !this.state.context ||
      this.state.phase !== 'ready' ||
      this.state.loading ||
      !this.visible ||
      !this.foreground
    )
      return;
    const epoch = this.epoch;
    this.publish({ loading: true, messages: mergeMessages(this.state.messages, [], this.now()) });
    try {
      const cursor = earlier
        ? { before: this.state.messages[0]?.sequence }
        : { after: threadId ? (this.fetchedCursors.get(threadId) ?? 0) : undefined };
      const context = await this.run((signal) => this.service.context(signal));
      if (
        context.personId !== this.state.context?.personId ||
        context.deviceId !== this.state.context?.deviceId ||
        context.householdId !== this.state.context.householdId ||
        context.role !== this.state.context.role ||
        context.ageBand !== this.state.context.ageBand
      )
        throw new MessagingError('access_revoked');
      const threads = await this.run((signal) => this.service.threads(signal));
      if (this.acceptThreads(threads)) return;
      if (context.role === 'parent' && this.state.peerPermissionsLoaded) {
        await this.loadPeerPermissions();
        if (epoch !== this.epoch) return;
      }
      if (!threadId) {
        this.publish({ loading: false, error: null });
        return;
      }
      const incoming = await this.run((signal) => this.service.messages(threadId, cursor, signal));
      // An accepted own send can be ahead of unseen messages; only fetched pages move this cursor.
      if (!earlier && incoming.length) this.fetchedCursors.set(threadId, incoming.at(-1)!.sequence);
      this.reconcile(incoming);
      this.publish({
        messages: mergeMessages(this.state.messages, incoming, this.now()),
        loading: false,
        error: null,
        hasEarlier: earlier ? incoming.length === PAGE_SIZE : this.state.hasEarlier,
        hasNewMessages: !earlier && incoming.length > 0 ? true : this.state.hasNewMessages,
      });
    } catch (error) {
      if (threadId) await this.failThread(error, epoch, threadId);
      else await this.fail(error, epoch);
    } finally {
      if (epoch === this.epoch) this.schedule();
    }
  }
  acknowledgeNewMessages() {
    this.publish({ hasNewMessages: false });
  }
  setDraft(text: string, phraseId: PhraseId | null = null) {
    const { context, threadId, pending } = this.state;
    if (
      !context ||
      !threadId ||
      pending ||
      (context.ageBand === '6_8' && !matchesPhrase(text, phraseId))
    )
      return;
    if (!matchesPhrase(text, phraseId)) phraseId = null;
    const draft: Draft = {
      text,
      phraseId,
      ...(this.state.draft.originScope ? { originScope: this.state.draft.originScope } : {}),
    };
    this.drafts.set(threadId, draft);
    this.publish({ draft, error: null });
  }
  async send(retry = false) {
    const { context, threadId, draft } = this.state;
    if (!context || !threadId || this.state.busy || !this.foreground || !this.visible) return;
    if (!retry && this.attempts.has(threadId)) return;
    if (
      retry &&
      (!this.attempts.has(threadId) || this.attempts.get(threadId)?.status === 'sending')
    )
      return;
    if (draft.originScope && draft.originScope !== this.localScope) {
      this.setDraft('');
      return;
    }
    if (!validBody(draft.text) && !retry) {
      this.publish({ error: 'invalid_message' });
      return;
    }
    this.publish({ busy: true, error: null });
    const epoch = this.epoch;
    let attempt = retry ? this.attempts.get(threadId) : undefined;
    try {
      if (!attempt) {
        const clientKey = await this.createId();
        if (epoch !== this.epoch) return;
        attempt = {
          threadId,
          clientKey,
          body: draft.text,
          phraseId: draft.phraseId,
          startedAt: this.now(),
          status: 'sending',
          error: null,
        };
      }
      if (this.now() - attempt.startedAt >= ATTEMPT_LIFETIME_MS)
        throw new MessagingError('attempt_expired');
      attempt = { ...attempt, status: 'sending', error: null };
      this.attempts.set(threadId, attempt);
      this.publish({ pending: attempt });
      const accepted = await this.run((signal) => this.service.send(attempt!, signal));
      if (
        accepted.clientKey !== attempt.clientKey ||
        accepted.threadId !== threadId ||
        accepted.senderId !== context.personId ||
        accepted.body !== attempt.body
      )
        throw new MessagingError('unknown');
      this.attempts.delete(threadId);
      this.drafts.delete(threadId);
      this.publish({
        messages: mergeMessages(this.state.messages, [accepted], this.now()),
        pending: null,
        draft: blankDraft(),
        busy: false,
        hasNewMessages: true,
      });
    } catch (error) {
      if (epoch !== this.epoch) return;
      const code = asMessagingError(error).code;
      if (attempt) {
        const failed: PendingSend = {
          ...attempt,
          status: code === 'unknown' || code === 'offline' ? 'unknown' : 'failed',
          error: code,
        };
        this.attempts.set(threadId, failed);
        this.publish({ pending: failed, busy: false });
      }
      await this.failThread(error, epoch, threadId);
    }
  }
  cancelAttempt() {
    const { threadId, pending } = this.state;
    if (!threadId || !pending || pending.status === 'sending') return;
    this.attempts.delete(threadId);
    this.drafts.delete(threadId);
    this.publish({ pending: null, draft: blankDraft(), error: null });
  }
  async manage(
    operation: 'load' | 'create' | 'invite' | 'revoke' | 'revokeAccount',
    input?: { name?: string; ageBand?: '6_8' | '9_11' | '12_14'; id?: string },
  ) {
    if (
      this.state.context?.role !== 'parent' ||
      this.state.phase !== 'ready' ||
      this.state.busy ||
      !this.foreground ||
      !this.visible
    )
      return;
    const epoch = this.epoch;
    this.publish({ busy: true, error: null, invitation: null });
    try {
      if (operation === 'create' && input?.name && input.ageBand)
        await this.run((signal) => this.service.createChild(input.name!, input.ageBand!, signal));
      if (operation === 'invite' && input?.id)
        this.publish({
          invitation: await this.run((signal) => this.service.invite(input.id!, signal)),
        });
      if (operation === 'revoke' && input?.id) {
        await this.run((signal) => this.service.revokeDevice(input.id!, signal));
        if (input.id === this.state.context?.deviceId) {
          await this.signOut();
          return;
        }
      }
      if (operation === 'revokeAccount') {
        await this.run((signal) => this.service.revokeAccount(signal));
        await this.signOut();
        return;
      }
      const children = await this.run((signal) => this.service.children(signal));
      const devices = await this.run((signal) => this.service.devices(signal));
      const threads = await this.run((signal) => this.service.threads(signal));
      this.acceptThreads(threads);
      this.publish({ children, devices, busy: false });
      await this.loadPeerPermissions();
    } catch (error) {
      await this.fail(error, epoch);
    }
  }
  async loadPeerPermissions() {
    if (this.state.context?.role !== 'parent' || this.state.phase !== 'ready') return;
    const epoch = this.epoch;
    try {
      const peerPermissions = await this.run((signal) => this.service.peerPermissions(signal));
      this.publish({ peerPermissions, peerError: null, peerPermissionsLoaded: true });
    } catch (error) {
      if (epoch !== this.epoch) return;
      const code = asMessagingError(error).code;
      if (['access_revoked', 'not_authenticated', 'not_authorized'].includes(code))
        await this.fail(error, epoch);
      else this.publish({ peerPermissions: [], peerError: code, peerPermissionsLoaded: true });
    }
  }
  async setPeerPermission(firstChildId: string, secondChildId: string, enabled: boolean) {
    if (
      this.state.context?.role !== 'parent' ||
      this.state.phase !== 'ready' ||
      this.state.busy ||
      !this.visible ||
      !this.foreground
    )
      return;
    const pair = this.state.peerPermissions.find(
      (candidate) =>
        candidate.firstChildId === firstChildId && candidate.secondChildId === secondChildId,
    );
    if (!pair || (enabled && !pair.available)) return;
    const epoch = this.epoch;
    this.publish({ busy: true, peerError: null });
    try {
      await this.run((signal) =>
        this.service.setPeerPermission(firstChildId, secondChildId, enabled, signal),
      );
      await this.loadPeerPermissions();
      if (epoch === this.epoch) this.publish({ busy: false });
    } catch (error) {
      await this.fail(error, epoch);
    }
  }
  async leavePeerThread() {
    const { threadId, context } = this.state;
    if (
      context?.role !== 'child' ||
      this.state.phase !== 'ready' ||
      !threadId ||
      this.state.busy ||
      !this.visible ||
      !this.foreground ||
      !this.state.threads.some((thread) => thread.id === threadId && thread.kind === 'child_child')
    )
      return;
    const epoch = this.epoch;
    this.publish({ busy: true, error: null });
    try {
      await this.run((signal) => this.service.leavePeerThread(threadId, signal));
      this.acceptThreads(this.state.threads.filter((thread) => thread.id !== threadId));
    } catch (error) {
      await this.failThread(error, epoch, threadId);
    }
  }
  dismissInvitation() {
    this.publish({ invitation: null });
  }
  async signOut() {
    this.cancel();
    const epoch = this.epoch;
    const expectedRole = this.state.expectedRole;
    this.clearPrivate();
    this.publish({ ...initial(this.service.configured), expectedRole, busy: true });
    try {
      const result = await this.service.signOut();
      if (epoch !== this.epoch) return;
      this.hydrated = false;
      this.publish({ busy: false, remoteSignoutUnconfirmed: !result.remoteConfirmed });
    } catch (error) {
      if (epoch === this.epoch) this.publish({ busy: false, error: asMessagingError(error).code });
    }
  }
}
