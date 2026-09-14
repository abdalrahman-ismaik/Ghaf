import { describe, expect, it, vi } from 'vitest';
import { createCloudDocumentsController } from '@/features/cloud-study/controller';
import type { CloudDocumentCommand } from '@/models/cloudFamilyDocuments';
import { applyStudyCommand, createEmptyStudyState } from '@/features/study';

vi.mock('expo-crypto', () => ({ randomUUID: () => '020d4000-0000-4000-8000-000000000001' }));
const familyId = '020d2000-0000-4000-8000-000000000001';
const userId = '020d0000-0000-4000-8000-000000000001';
const command: CloudDocumentCommand = {
  type: 'connections.save',
  expectedRevision: 0,
  input: { primaryGuardianName: 'Explicit Parent', secondaryGuardianName: '', relatives: [] },
};
const row = {
  id: '020d5000-0000-4000-8000-000000000001',
  family_id: familyId,
  child_id: null,
  kind: 'connections',
  revision: 1,
  payload: command.input,
  created_at: '2026-09-15T10:00:00.000Z',
  updated_at: '2026-09-15T10:00:00.000Z',
};
const response = { documents: [row], result: { documentId: row.id, revision: 1 } };
const snapshot = (documents: readonly unknown[]) => ({
  schemaVersion: 1,
  actor: { userId, familyId, role: 'parent', childId: null },
  familyId,
  revision: documents.length,
  documentCount: documents.length,
  documents,
});
function setup(familyRequest: (name: string, args: Record<string, unknown>) => Promise<unknown>) {
  return createCloudDocumentsController({
    service: { familyRequest },
    userId,
    familyId,
    role: 'parent',
    childId: null,
  });
}
describe('asynchronous family document controller', () => {
  it('does not claim empty data or permit a write after a read failure', async () => {
    const request = vi.fn().mockRejectedValue(new Error('offline'));
    const controller = setup(request);
    expect(await controller.load()).toBe(false);
    expect(controller.getSnapshot()).toMatchObject({
      documents: null,
      error: 'provider_unavailable',
      saved: false,
    });
    expect(await controller.update(command)).toBe(false);
    expect(request).toHaveBeenCalledTimes(1);
  });
  it('keeps the exact idempotency key and command after an uncertain send', async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(snapshot([]))
      .mockRejectedValueOnce(new Error('network lost'))
      .mockResolvedValueOnce(response);
    const controller = setup(request);
    await controller.load();
    expect(await controller.update(command)).toBe(false);
    expect(controller.getSnapshot()).toMatchObject({ canRetry: true, saved: false });
    expect(
      await controller.update({
        ...command,
        input: { ...command.input, primaryGuardianName: 'Different draft' },
      }),
    ).toBe(false);
    expect(await controller.retry()).toBe(true);
    expect(request.mock.calls[1]).toEqual(request.mock.calls[2]);
    expect(controller.getSnapshot()).toMatchObject({
      saved: true,
      canRetry: false,
      documents: [{ familyId }],
    });
  });
  it('suppresses simultaneous submissions without optimistic success', async () => {
    let finish!: (value: unknown) => void;
    const request = vi
      .fn()
      .mockResolvedValueOnce(snapshot([]))
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      );
    const controller = setup(request);
    await controller.load();
    const pending = controller.update(command);
    expect(controller.getSnapshot()).toMatchObject({ busy: true, saved: false, documents: [] });
    expect(await controller.update(command)).toBe(false);
    finish(response);
    expect(await pending).toBe(true);
    expect(request).toHaveBeenCalledTimes(2);
  });
  it('clears private rows on revoked authority and does not turn it into mock data', async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(snapshot([row]))
      .mockRejectedValueOnce({ code: '42501', message: 'access_unavailable' });
    const controller = setup(request);
    await controller.load();
    await controller.update({ ...command, expectedRevision: 1 });
    expect(controller.getSnapshot()).toMatchObject({
      documents: null,
      error: 'access_unavailable',
      canRetry: false,
      saved: false,
    });
  });
  it('rejects malformed success receipts and preserves a retry for a possibly committed mutation', async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(snapshot([]))
      .mockResolvedValueOnce({ documents: [row], result: null });
    const controller = setup(request);
    await controller.load();
    expect(await controller.update(command)).toBe(false);
    expect(controller.getSnapshot()).toMatchObject({
      documents: null,
      error: 'invalid_response',
      saved: false,
      canRetry: true,
    });
  });
  it.each([
    'session_expired',
    'storage_unavailable',
    'operation_cancelled',
    'account_unavailable',
    'recovery_required',
  ])('removes old private records and pending writes for %s', async (reason) => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(snapshot([row]))
      .mockRejectedValueOnce({ code: reason });
    const controller = setup(request);
    await controller.load();
    expect(await controller.update({ ...command, expectedRevision: 1 })).toBe(false);
    expect(controller.getSnapshot()).toMatchObject({
      documents: null,
      canRetry: false,
      saved: false,
      error: 'access_unavailable',
    });
    expect(await controller.retry()).toBe(false);
    expect(request).toHaveBeenCalledTimes(2);
  });
  it('clears a previously uncertain write and channel when a refresh discovers revocation', async () => {
    const stop = vi.fn();
    const request = vi
      .fn()
      .mockResolvedValueOnce(snapshot([row]))
      .mockRejectedValueOnce(new Error('network lost'))
      .mockRejectedValueOnce({ code: 'session_expired' });
    const controller = createCloudDocumentsController({
      userId,
      familyId,
      role: 'parent',
      childId: null,
      service: { familyRequest: request, subscribeFamily: async () => stop },
    });
    await controller.load();
    await Promise.resolve();
    await controller.update({ ...command, expectedRevision: 1 });
    expect(controller.getSnapshot().canRetry).toBe(true);
    await controller.load();
    expect(controller.getSnapshot()).toMatchObject({
      documents: null,
      canRetry: false,
      error: 'access_unavailable',
    });
    expect(await controller.retry()).toBe(false);
    expect(stop).toHaveBeenCalledOnce();
  });
  it('preserves an uncertain request after a successful refresh until its exact receipt is retried', async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(snapshot([]))
      .mockRejectedValueOnce(new Error('connection lost'))
      .mockResolvedValueOnce(snapshot([row]))
      .mockResolvedValueOnce(response);
    const controller = setup(request);
    await controller.load();
    await controller.update(command);
    await controller.load();
    expect(controller.getSnapshot()).toMatchObject({ error: null, canRetry: true, saved: false });
    expect(await controller.update(command)).toBe(false);
    expect(await controller.retry()).toBe(true);
    expect(request.mock.calls[1]).toEqual(request.mock.calls[3]);
  });
  it('clears private records even when realtime cleanup fails during revocation', async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(snapshot([row]))
      .mockRejectedValueOnce({ code: 'session_expired' });
    const controller = createCloudDocumentsController({
      userId,
      familyId,
      role: 'parent',
      childId: null,
      service: {
        familyRequest: request,
        subscribeFamily: async () => () => {
          throw new Error('channel closed');
        },
      },
    });
    await controller.load();
    await Promise.resolve();
    expect(await controller.update({ ...command, expectedRevision: 1 })).toBe(false);
    expect(controller.getSnapshot()).toMatchObject({
      documents: null,
      canRetry: false,
      busy: false,
      error: 'access_unavailable',
    });
    expect(await controller.retry()).toBe(false);
  });
  it.each([
    ['invalid_profile', 'invalid_command'],
    ['profile_conflict', 'request_conflict'],
    ['rate_limited', 'limit_reached'],
  ])('maps provider %s to the document contract %s', async (provider, expected) => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(snapshot([]))
      .mockRejectedValueOnce({ code: provider });
    const controller = setup(request);
    await controller.load();
    await controller.update(command);
    expect(controller.getSnapshot()).toMatchObject({
      saved: false,
      canRetry: false,
      error: expected,
    });
  });
  it('ignores a late result after account teardown', async () => {
    let finish!: (value: unknown) => void;
    const controller = setup(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const loaded = controller.load();
    controller.dispose();
    finish(snapshot([row]));
    expect(await loaded).toBe(false);
    expect(controller.getSnapshot().documents).toBeNull();
  });
  it('uses realtime only to re-fetch authoritative state and cleans up the channel', async () => {
    let signal!: () => void;
    const stop = vi.fn();
    const familyRequest = vi
      .fn()
      .mockResolvedValueOnce(snapshot([]))
      .mockResolvedValueOnce(snapshot([row]));
    const controller = createCloudDocumentsController({
      userId,
      familyId,
      role: 'parent',
      childId: null,
      service: {
        familyRequest,
        subscribeFamily: async (_family, onChange) => {
          signal = onChange;
          return stop;
        },
      },
    });
    await controller.load();
    await Promise.resolve();
    signal();
    await Promise.resolve();
    await Promise.resolve();
    expect(familyRequest).toHaveBeenCalledTimes(2);
    expect(controller.getSnapshot().documents?.[0]?.id).toBe(row.id);
    controller.dispose();
    expect(stop).toHaveBeenCalledOnce();
  });
  it('loads more than100 valid study documents in one account-bound JSON read and retains them after reload', async () => {
    const childId = '020d3000-0000-4000-8000-000000000001';
    const now = row.created_at;
    const rows: unknown[] = [];
    let study = createEmptyStudyState(familyId);
    for (let index = 0; index < 125; index += 1) {
      const plan = index < 100;
      const id = `${plan ? 'plan' : 'goal'}-${index}`;
      const next = applyStudyCommand(
        study,
        { role: 'parent' },
        plan
          ? {
              type: 'plan.create',
              id,
              childId,
              input: {
                subject: 'Reading',
                title: `Practice ${index}`,
                nextStep: 'Choose one page',
                durationMinutes: 15,
                dueDate: null,
                revisitDate: null,
              },
            }
          : {
              type: 'goal.create',
              id,
              childId,
              input: {
                subject: 'Reading',
                title: `Goal ${index}`,
                nextStep: 'Choose one page',
                parentSupport: 'Read together',
                criterion: { kind: 'practice_count', target: 2 },
                prize: { kind: 'experience', label: 'Choose a family game' },
                targetDate: '2026-12-01',
                reviewDate: '2026-12-02',
              },
            },
        { familyKey: familyId, childIds: [childId], now },
      );
      if (!next.ok) throw new Error('Expected a valid bounded study fixture');
      study = next.data;
      rows.push({
        ...row,
        id: `020d5000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
        child_id: childId,
        kind: plan ? 'study_plan' : 'academic_goal',
        payload: plan
          ? study.plans.find((item) => item.id === id)
          : study.goals.find((item) => item.id === id),
      });
    }
    const request = vi.fn().mockResolvedValue(snapshot(rows));
    const controller = setup(request);
    expect(await controller.load()).toBe(true);
    expect(controller.getSnapshot().documents).toHaveLength(125);
    expect(controller.getSnapshot().documents?.at(-1)?.payload).toMatchObject({ id: 'goal-124' });
    expect(await controller.load()).toBe(true);
    expect(controller.getSnapshot().documents).toHaveLength(125);
    expect(request).toHaveBeenCalledTimes(2);
    expect(request).toHaveBeenLastCalledWith('ghaf_family_document_snapshot', {
      p_family_id: familyId,
    });
    controller.dispose();
  });
  it.each(['identity', 'role', 'count', 'legacy_rows'])(
    'rejects %s read mismatch without accepting a partial collection',
    async (fault) => {
      const reply = snapshot([row]);
      let raw: unknown = reply;
      if (fault === 'identity')
        raw = {
          ...reply,
          actor: { ...reply.actor, userId: '020d0000-0000-4000-8000-000000000002' },
        };
      if (fault === 'role')
        raw = {
          ...reply,
          actor: { ...reply.actor, role: 'child', childId: '020d3000-0000-4000-8000-000000000001' },
        };
      if (fault === 'count') raw = { ...reply, documentCount: 125 };
      if (fault === 'legacy_rows') raw = [row];
      const controller = setup(vi.fn().mockResolvedValue(raw));
      expect(await controller.load()).toBe(false);
      expect(controller.getSnapshot()).toMatchObject({
        documents: null,
        error: 'invalid_response',
        saved: false,
      });
      expect(await controller.update(command)).toBe(false);
      controller.dispose();
    },
  );
});
