import { afterEach, describe, expect, it, vi } from 'vitest';
import { FamilyMessagingController } from '../../src/features/familyMessaging/controller';
import { SupabaseFamilyMessagingService } from '../../src/features/familyMessaging/client';
import {
  ATTEMPT_LIFETIME_MS,
  HISTORY_RETENTION_MS,
  MessagingError,
  phraseText,
  POLL_MS,
} from '../../src/features/familyMessaging/contracts';
import {
  child,
  deferred,
  fakeService,
  ids,
  memoryStorage,
  message,
  parent,
  thread,
} from './fixtures';

const controllers: FamilyMessagingController[] = [];
afterEach(() => {
  controllers.forEach((controller) => controller.setVisible(false));
  controllers.length = 0;
  vi.useRealTimers();
});
async function ready(context = parent) {
  const service = fakeService(context);
  const controller = new FamilyMessagingController(service, async () => ids.key);
  controllers.push(controller);
  controller.setLocalContext('local:initial', context.role);
  controller.setVisible(true);
  await vi.waitFor(() => expect(controller.getSnapshot().phase).toBe('ready'));
  await controller.openThread(ids.thread);
  return { service, controller };
}

describe('real messaging controller lifecycle', () => {
  it('keeps a directly authenticated inbox open on an unchanged signed-out demo scope', async () => {
    const { controller } = await ready();
    controller.setLocalContext('signed-out:stable', null);
    await controller.validate();
    expect(controller.getSnapshot().phase).toBe('ready');
    controller.setLocale('ar');
    controller.setLocalContext('signed-out:stable', null);
    expect(controller.getSnapshot().phase).toBe('ready');
  });
  it('fetches unseen earlier messages after an own accepted send jumps ahead', async () => {
    const { controller, service } = await ready();
    vi.mocked(service.messages).mockResolvedValueOnce([message]);
    await controller.openThread(ids.thread);
    const earlier = {
      ...message,
      id: '70000000-0000-4000-8000-000000000002',
      sequence: 2,
      senderId: ids.person,
    };
    const own = { ...message, id: '70000000-0000-4000-8000-000000000003', sequence: 3 };
    vi.mocked(service.send).mockResolvedValueOnce(own);
    controller.setDraft(message.body);
    await controller.send();
    vi.mocked(service.messages).mockResolvedValueOnce([earlier, own]);
    await controller.sync();
    expect(service.messages).toHaveBeenLastCalledWith(
      ids.thread,
      { after: 1 },
      expect.any(AbortSignal),
    );
    expect(controller.getSnapshot().messages.map((row) => row.sequence)).toEqual([1, 2, 3]);
    vi.mocked(service.messages).mockResolvedValueOnce([]);
    await controller.sync();
    expect(service.messages).toHaveBeenLastCalledWith(
      ids.thread,
      { after: 3 },
      expect.any(AbortSignal),
    );
  });
  it('retains same-thread memory draft across route and keyboard lifecycle', async () => {
    const { controller } = await ready();
    controller.setDraft('Memory-only draft');
    controller.setVisible(false);
    expect(controller.getSnapshot().draft.text).toBe('');
    controller.setVisible(true);
    await vi.waitFor(() => expect(controller.getSnapshot().draft.text).toBe('Memory-only draft'));
  });

  it('locks private content on a same-role local Child switch and drops the helper draft', async () => {
    const { controller } = await ready(child);
    controller.openFor('child', true);
    await controller.openThread(ids.thread);
    expect(controller.getSnapshot().draft.text).toBe(phraseText.ar.help);
    controller.setLocalContext('local:other-child', 'child');
    expect(controller.getSnapshot().phase).toBe('locked');
    expect(controller.getSnapshot().context).toBeNull();
    expect(controller.getSnapshot().draft.text).toBe('');
    await controller.validate();
    expect(controller.getSnapshot().context?.personId).toBe(ids.person);
    expect(controller.getSnapshot().draft.text).toBe('');
  });

  it('never reveals restored Parent inventory from a local Child entry', async () => {
    const service = fakeService(parent);
    const controller = new FamilyMessagingController(service, async () => ids.key);
    controllers.push(controller);
    controller.openFor('child');
    controller.setVisible(true);
    await vi.waitFor(() => expect(controller.getSnapshot().error).toBe('role_mismatch'));
    expect(controller.getSnapshot().context).toBeNull();
    expect(service.threads).not.toHaveBeenCalled();
  });

  it('immediately clears private view during slow revocation cleanup', async () => {
    const { controller, service } = await ready();
    controller.setDraft('Private draft');
    const clearing = deferred<void>();
    vi.mocked(service.forget).mockReturnValue(clearing.promise);
    vi.mocked(service.context).mockRejectedValue(new MessagingError('access_revoked'));
    const syncing = controller.sync();
    await vi.waitFor(() => expect(service.forget).toHaveBeenCalled());
    expect(controller.getSnapshot().phase).toBe('revoked');
    expect(controller.getSnapshot().context).toBeNull();
    expect(controller.getSnapshot().draft.text).toBe('');
    clearing.resolve();
    await syncing;
  });

  it.each(['code', 'error_code'])(
    'clears private state and credentials on terminal provider refresh using %s',
    async (field) => {
      let now = Date.parse(message.createdAt);
      let rejectRefresh = false;
      const storage = memoryStorage();
      const fetcher = vi.fn<typeof fetch>(async (url) => {
        const path = new URL(String(url)).pathname;
        if (path === '/auth/v1/token') {
          if (rejectRefresh)
            return new Response(JSON.stringify({ [field]: 'refresh_token_not_found' }), {
              status: 400,
            });
          return new Response(
            JSON.stringify({
              access_token: 'synthetic-access',
              refresh_token: 'synthetic-refresh',
              expires_in: 3600,
              user: { id: ids.user },
            }),
          );
        }
        if (path === '/auth/v1/user') return new Response(JSON.stringify({ id: ids.user }));
        if (path === '/rest/v1/rpc/fm_register_parent' || path === '/rest/v1/rpc/fm_context')
          return new Response(JSON.stringify(parent));
        if (path === '/rest/v1/rpc/fm_threads') return new Response(JSON.stringify([thread]));
        if (path === '/rest/v1/rpc/fm_messages') return new Response(JSON.stringify([message]));
        throw new Error('Unexpected synthetic endpoint');
      });
      const service = new SupabaseFamilyMessagingService(
        { url: 'https://synthetic.invalid', publishableKey: 'sb_publishable_synthetic_test' },
        storage,
        fetcher,
        () => now,
      );
      await service.signIn('synthetic@example.invalid', 'synthetic-password', 'Test');
      const controller = new FamilyMessagingController(
        service,
        async () => ids.key,
        () => now,
      );
      controllers.push(controller);
      controller.setVisible(true);
      await vi.waitFor(() => expect(controller.getSnapshot().phase).toBe('ready'));
      await controller.openThread(ids.thread);
      expect(controller.getSnapshot().messages).toEqual([message]);
      controller.setDraft('Private draft');
      now += 3_550_000;
      rejectRefresh = true;
      await controller.sync();
      expect(controller.getSnapshot()).toMatchObject({
        phase: 'revoked',
        context: null,
        messages: [],
        threads: [],
        draft: { text: '' },
        pending: null,
        error: 'not_authenticated',
      });
      expect(await storage.read()).toBeNull();
      const requestsAfterRevocation = fetcher.mock.calls.length;
      await controller.sync();
      expect(fetcher.mock.calls).toHaveLength(requestsAfterRevocation);
    },
  );

  it('does not mint a fresh operation when Retry has no pending attempt', async () => {
    const { controller, service } = await ready();
    await controller.send(true);
    expect(service.send).not.toHaveBeenCalled();
  });

  it('retries an uncertain operation with its same key/body and clears after service acceptance', async () => {
    const { controller, service } = await ready();
    vi.mocked(service.send)
      .mockRejectedValueOnce(new MessagingError('unknown'))
      .mockResolvedValue(message);
    controller.setDraft(message.body);
    await controller.send();
    expect(controller.getSnapshot().pending?.status).toBe('unknown');
    controller.setDraft('Must not replace pending body');
    await controller.send(true);
    const [first, second] = vi.mocked(service.send).mock.calls;
    if (!first || !second) throw new Error('Both explicit send attempts must be recorded');
    expect(first[0]).toMatchObject({ clientKey: ids.key, body: message.body });
    expect(second[0]).toMatchObject(first[0]);
    expect(controller.getSnapshot().messages).toEqual([message]);
    expect(controller.getSnapshot().pending).toBeNull();
  });

  it('does not leave busy stuck after changing route during a send', async () => {
    const { controller, service } = await ready();
    const sending = deferred<typeof message>();
    vi.mocked(service.send).mockReturnValue(sending.promise);
    controller.setDraft(message.body);
    const operation = controller.send();
    await vi.waitFor(() => expect(service.send).toHaveBeenCalled());
    controller.closeThread();
    expect(controller.getSnapshot().busy).toBe(false);
    await controller.openThread(ids.thread);
    expect(controller.getSnapshot().pending?.status).toBe('unknown');
    sending.resolve(message);
    await operation;
    expect(controller.getSnapshot().messages).toEqual([]);
  });

  it('treats mismatched success records as unknown and never invents acceptance', async () => {
    const { controller, service } = await ready();
    vi.mocked(service.send).mockResolvedValue({ ...message, body: 'Different body' });
    controller.setDraft(message.body);
    await controller.send();
    expect(controller.getSnapshot().pending?.status).toBe('unknown');
    expect(controller.getSnapshot().messages).toEqual([]);
  });

  it('rejects edited age-six-to-eight phrases before human send', async () => {
    const { controller, service } = await ready({ ...child, ageBand: '6_8' });
    controller.setDraft('Uncurated text', 'help');
    await controller.send();
    expect(service.send).not.toHaveBeenCalled();
    controller.setDraft(phraseText.en.help, 'help');
    vi.mocked(service.send).mockResolvedValue({
      ...message,
      body: phraseText.en.help,
      senderId: child.personId,
    });
    await controller.send();
    expect(service.send).toHaveBeenCalledTimes(1);
  });

  it('does not show stale messages when sign-out completes during an outstanding request', async () => {
    const { controller, service } = await ready();
    const loading = deferred<(typeof message)[]>();
    vi.mocked(service.messages).mockReturnValue(loading.promise);
    const syncing = controller.sync();
    await vi.waitFor(() => expect(controller.getSnapshot().loading).toBe(true));
    await controller.signOut();
    loading.resolve([message]);
    await syncing;
    expect(controller.getSnapshot().context).toBeNull();
    expect(controller.getSnapshot().messages).toEqual([]);
  });

  it('limits uncertain sends to less than 24 hours without automatic retransmission', async () => {
    const service = fakeService(parent);
    let now = 0;
    const controller = new FamilyMessagingController(
      service,
      async () => ids.key,
      () => now,
    );
    controllers.push(controller);
    controller.setVisible(true);
    await vi.waitFor(() => expect(controller.getSnapshot().phase).toBe('ready'));
    await controller.openThread(ids.thread);
    controller.setDraft(message.body);
    vi.mocked(service.send).mockRejectedValue(new MessagingError('unknown'));
    await controller.send();
    now = ATTEMPT_LIFETIME_MS;
    await controller.send(true);
    expect(service.send).toHaveBeenCalledTimes(1);
    expect(controller.getSnapshot().pending?.error).toBe('attempt_expired');
  });

  it('requires revalidation after background without automatically sending a draft', async () => {
    const { controller, service } = await ready();
    controller.setDraft('Draft survives only current identity');
    controller.setForeground(false);
    expect(controller.getSnapshot().context).toBeNull();
    expect(controller.getSnapshot().messages).toEqual([]);
    controller.setForeground(true);
    await vi.waitFor(() => expect(controller.getSnapshot().phase).toBe('ready'));
    expect(service.context).toHaveBeenCalled();
    expect(service.send).not.toHaveBeenCalled();
  });

  it('polls revocation on a ready Parent list without a selected thread', async () => {
    const { controller, service } = await ready();
    vi.useFakeTimers();
    controller.closeThread();
    vi.mocked(service.context).mockRejectedValue(new MessagingError('access_revoked'));
    await vi.advanceTimersByTimeAsync(POLL_MS);
    expect(controller.getSnapshot().phase).toBe('revoked');
    expect(controller.getSnapshot().threads).toEqual([]);
  });

  it('locks on local signed-out reset while repeated unchanged scope is inert', async () => {
    const { controller, service } = await ready();
    controller.setDraft('Private draft');
    const calls = vi.mocked(service.context).mock.calls.length;
    controller.setLocalContext('local:initial', 'parent');
    expect(controller.getSnapshot().phase).toBe('ready');
    expect(service.context).toHaveBeenCalledTimes(calls);
    controller.setLocalContext('local:reset', null);
    expect(controller.getSnapshot().phase).toBe('locked');
    expect(controller.getSnapshot().context).toBeNull();
    expect(controller.getSnapshot().expectedRole).toBeNull();
  });

  it('drops memory history at 30 days even when its next foreground poll is offline', async () => {
    let now = Date.parse(message.createdAt);
    const service = fakeService(parent);
    vi.mocked(service.messages).mockResolvedValue([message]);
    const controller = new FamilyMessagingController(
      service,
      async () => ids.key,
      () => now,
    );
    controllers.push(controller);
    controller.setVisible(true);
    await vi.waitFor(() => expect(controller.getSnapshot().phase).toBe('ready'));
    await controller.openThread(ids.thread);
    expect(controller.getSnapshot().messages).toEqual([message]);
    now += HISTORY_RETENTION_MS;
    vi.mocked(service.context).mockRejectedValue(new MessagingError('offline'));
    await controller.sync();
    expect(controller.getSnapshot().messages).toEqual([]);
    expect(controller.getSnapshot().error).toBe('offline');
  });

  it('does not let a stale sign-out result overwrite newer authentication', async () => {
    const { controller, service } = await ready();
    const logout = deferred<{ remoteConfirmed: boolean }>();
    vi.mocked(service.signOut).mockReturnValue(logout.promise);
    const signingOut = controller.signOut();
    controller.setVisible(false);
    controller.setVisible(true);
    await vi.waitFor(() => expect(controller.getSnapshot().phase).toBe('ready'));
    logout.resolve({ remoteConfirmed: false });
    await signingOut;
    expect(controller.getSnapshot().remoteSignoutUnconfirmed).toBe(false);
    expect(controller.getSnapshot().phase).toBe('ready');
  });

  it('drops private drafts after a different verified device becomes active', async () => {
    const { controller, service } = await ready();
    controller.setDraft('Previous device draft');
    controller.setVisible(false);
    vi.mocked(service.context).mockResolvedValue({
      ...parent,
      deviceId: '50000000-0000-4000-8000-000000000009',
    });
    controller.setVisible(true);
    await vi.waitFor(() => expect(controller.getSnapshot().phase).toBe('ready'));
    await controller.openThread(ids.thread);
    expect(controller.getSnapshot().draft.text).toBe('');
  });

  it('prepares only a generic human help draft and requires explicit Send', async () => {
    const { controller, service } = await ready(child);
    controller.setLocale('en');
    controller.openFor('child', true);
    await controller.openThread(ids.thread);
    expect(controller.getSnapshot().draft.text).toBe(phraseText.en.help);
    expect(service.send).not.toHaveBeenCalled();
    vi.mocked(service.send).mockResolvedValue({
      ...message,
      senderId: child.personId,
      body: phraseText.en.help,
    });
    await controller.send();
    expect(vi.mocked(service.send).mock.calls[0]?.[0]).toMatchObject({
      body: phraseText.en.help,
      phraseId: 'help',
    });
    expect(controller.getSnapshot().messages[0]?.body).toBe(phraseText.en.help);
  });
});
