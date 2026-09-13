import { afterEach, describe, expect, it, vi } from 'vitest';
import { FamilyMessagingController } from '../../src/features/familyMessaging/controller';
import {
  MessagingError,
  phraseText,
  type MessagingContext,
} from '../../src/features/familyMessaging/contracts';
import { child, deferred, fakeService, ids, message, parent, thread } from './fixtures';

const siblingId = '30000000-0000-4000-8000-000000000002';
const peer = {
  ...thread,
  id: '40000000-0000-4000-8000-000000000002',
  kind: 'child_child' as const,
  childId: siblingId,
  otherName: 'Synthetic Sibling',
  otherRole: 'child' as const,
};
const parentThread = { ...thread, otherName: 'Synthetic Parent', otherRole: 'parent' as const };
const permission = {
  firstChildId: child.personId,
  secondChildId: siblingId,
  firstName: child.displayName,
  secondName: peer.otherName,
  threadId: peer.id,
  enabled: true,
  available: true,
};
const controllers: FamilyMessagingController[] = [];
afterEach(() => {
  controllers.forEach((controller) => controller.setVisible(false));
  controllers.length = 0;
});
async function setup(context: MessagingContext = child) {
  const service = fakeService(context);
  vi.mocked(service.threads).mockResolvedValue(
    context.role === 'child' ? [peer, parentThread] : [thread],
  );
  vi.mocked(service.peerPermissions).mockResolvedValue([permission]);
  const controller = new FamilyMessagingController(service, async () => ids.key);
  controllers.push(controller);
  controller.setLocalContext('synthetic:local-family', context.role);
  controller.openFor(context.role);
  controller.setVisible(true);
  await vi.waitFor(() => expect(controller.getSnapshot().threads.length).toBeGreaterThan(0));
  return { controller, service };
}

describe('participant-only peer messaging controller', () => {
  it('opens a Child conversation list when multiple approved threads exist and Back returns to it', async () => {
    const { controller } = await setup();
    expect(controller.getSnapshot().threadId).toBeNull();
    await controller.openThread(peer.id);
    controller.closeThread();
    expect(controller.getSnapshot()).toMatchObject({
      threadId: null,
      messages: [],
      draft: { text: '' },
    });
    expect(controller.getSnapshot().threads).toHaveLength(2);
  });

  it('always targets Parent for a helper draft after the sibling was last selected', async () => {
    const { controller, service } = await setup();
    await controller.openThread(peer.id);
    controller.setDraft('Sibling-only draft');
    controller.setVisible(false);
    controller.openFor('child', true);
    controller.setVisible(true);
    await vi.waitFor(() => expect(controller.getSnapshot().threadId).toBe(parentThread.id));
    expect(controller.getSnapshot().draft.text).toBe(phraseText.ar.help);
    expect(service.send).not.toHaveBeenCalled();
    await controller.openThread(peer.id);
    expect(controller.getSnapshot().draft.text).toBe('Sibling-only draft');
  });

  it('isolates drafts and rejects late peer message results after switching to Parent', async () => {
    const { controller, service } = await setup();
    await controller.openThread(peer.id);
    controller.setDraft('Only for sibling');
    const late = deferred<(typeof message)[]>();
    vi.mocked(service.messages).mockReturnValueOnce(late.promise);
    const read = controller.openThread(peer.id);
    await controller.openThread(parentThread.id);
    expect(controller.getSnapshot().draft.text).toBe('');
    late.resolve([{ ...message, threadId: peer.id }]);
    await read;
    expect(controller.getSnapshot().messages).toEqual([]);
    expect(controller.getSnapshot().threadId).toBe(parentThread.id);
  });

  it('clears revoked peer content, pending sends and drafts while retaining Parent access', async () => {
    const { controller, service } = await setup();
    await controller.openThread(peer.id);
    controller.setDraft('Private sibling draft');
    vi.mocked(service.send).mockRejectedValueOnce(new MessagingError('unknown'));
    await controller.send();
    expect(controller.getSnapshot().pending).not.toBeNull();
    vi.mocked(service.threads).mockResolvedValue([parentThread]);
    await controller.sync();
    expect(controller.getSnapshot()).toMatchObject({
      phase: 'ready',
      threadId: null,
      messages: [],
      pending: null,
      draft: { text: '' },
      peerAccessRemoved: true,
    });
    expect(service.forget).not.toHaveBeenCalled();
    vi.mocked(service.threads).mockResolvedValue([parentThread, peer]);
    await controller.sync();
    await controller.openThread(peer.id);
    expect(controller.getSnapshot().draft.text).toBe('');
    expect(controller.getSnapshot().pending).toBeNull();
  });

  it('does not restore an inaccessible peer draft after a background revalidation', async () => {
    const { controller, service } = await setup();
    await controller.openThread(peer.id);
    controller.setDraft('Revoked in background');
    controller.setVisible(false);
    vi.mocked(service.threads).mockResolvedValue([parentThread]);
    controller.setVisible(true);
    await vi.waitFor(() => expect(controller.getSnapshot().threads).toHaveLength(1));
    vi.mocked(service.threads).mockResolvedValue([parentThread, peer]);
    await controller.validate();
    await controller.openThread(peer.id);
    expect(controller.getSnapshot().draft.text).toBe('');
  });

  it('clears a peer revoked between list and message fetch without signing out Parent access', async () => {
    const { controller, service } = await setup();
    await controller.openThread(peer.id);
    controller.setDraft('Removed during fetch');
    vi.mocked(service.messages).mockRejectedValueOnce(new MessagingError('not_authorized'));
    await controller.sync();
    expect(controller.getSnapshot()).toMatchObject({
      phase: 'ready',
      threadId: null,
      messages: [],
      peerAccessRemoved: true,
      draft: { text: '' },
    });
    expect(service.forget).not.toHaveBeenCalled();
    await controller.openThread(parentThread.id);
    expect(controller.getSnapshot().threadId).toBe(parentThread.id);
  });

  it('either participating Child can leave and a failed leave never claims success', async () => {
    const { controller, service } = await setup();
    await controller.openThread(peer.id);
    vi.mocked(service.leavePeerThread).mockRejectedValueOnce(new MessagingError('offline'));
    await controller.leavePeerThread();
    expect(controller.getSnapshot().threadId).toBe(peer.id);
    expect(controller.getSnapshot().error).toBe('offline');
    await controller.leavePeerThread();
    expect(service.leavePeerThread).toHaveBeenLastCalledWith(peer.id, expect.any(AbortSignal));
    expect(controller.getSnapshot()).toMatchObject({
      threadId: null,
      peerAccessRemoved: true,
      busy: false,
    });
    await controller.openThread(parentThread.id);
    await controller.leavePeerThread();
    expect(service.leavePeerThread).toHaveBeenCalledTimes(2);
  });

  it('does not grant Child permission management and keeps legacy Parent management usable', async () => {
    const run = await setup();
    await run.controller.setPeerPermission(child.personId, siblingId, true);
    await run.controller.loadPeerPermissions();
    expect(run.service.setPeerPermission).not.toHaveBeenCalled();
    expect(run.service.peerPermissions).not.toHaveBeenCalled();
    const adult = await setup(parent);
    vi.mocked(adult.service.peerPermissions).mockRejectedValueOnce(
      new MessagingError('invalid_request'),
    );
    await adult.controller.manage('load');
    expect(adult.controller.getSnapshot()).toMatchObject({
      phase: 'ready',
      busy: false,
      peerError: 'invalid_request',
    });
    await adult.controller.openThread(thread.id);
    expect(adult.controller.getSnapshot().threadId).toBe(thread.id);
  });

  it('uses only server-listed enrolled pairs and waits for acknowledged permission state', async () => {
    const { controller, service } = await setup(parent);
    await controller.manage('load');
    await controller.setPeerPermission(child.personId, ids.user, true);
    expect(service.setPeerPermission).not.toHaveBeenCalled();
    vi.mocked(service.peerPermissions).mockResolvedValue([{ ...permission, enabled: false }]);
    await controller.setPeerPermission(child.personId, siblingId, false);
    expect(service.setPeerPermission).toHaveBeenCalledWith(
      child.personId,
      siblingId,
      false,
      expect.any(AbortSignal),
    );
    expect(controller.getSnapshot().peerPermissions[0]?.enabled).toBe(false);
  });

  it('refreshes loaded Parent permissions while another Child can stop the conversation', async () => {
    const { controller, service } = await setup(parent);
    await controller.manage('load');
    expect(controller.getSnapshot().peerPermissions[0]?.enabled).toBe(true);
    vi.mocked(service.peerPermissions).mockResolvedValue([{ ...permission, enabled: false }]);
    await controller.sync();
    expect(controller.getSnapshot().peerPermissions[0]?.enabled).toBe(false);
  });

  it('applies age-six-to-eight phrase controls to peer sends', async () => {
    const { controller, service } = await setup({ ...child, ageBand: '6_8' });
    await controller.openThread(peer.id);
    controller.setDraft('Unbounded sibling text');
    await controller.send();
    expect(service.send).not.toHaveBeenCalled();
    controller.setDraft(phraseText.en.thanks, 'thanks');
    vi.mocked(service.send).mockResolvedValue({
      ...message,
      threadId: peer.id,
      senderId: child.personId,
      body: phraseText.en.thanks,
    });
    await controller.send();
    expect(controller.getSnapshot().messages[0]?.body).toBe(phraseText.en.thanks);
  });
});
