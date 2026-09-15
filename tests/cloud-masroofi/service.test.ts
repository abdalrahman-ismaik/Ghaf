import { describe, expect, it, vi } from 'vitest';

import { CloudMasroofiError } from '../../src/models/cloudMasroofi';
import { createCloudMasroofiService } from '../../src/services/cloud-masroofi';
import { child, childId, emptySnapshot, familyId, id, parent, requestId, userId } from './fixtures';

describe('hosted Masroofi RPC adapter', () => {
  it('sends only bounded RPC arguments and retains the supplied idempotency UUID', async () => {
    const familyRequest = vi.fn().mockResolvedValue({ snapshot: emptySnapshot() });
    const service = createCloudMasroofiService({
      transport: { familyRequest, subscribeFamily: vi.fn() },
      userId,
      familyId,
      actor: parent,
    });
    const command = { type: 'card.enable' as const, childId, age10PlusConfirmed: true as const };
    await service.command(requestId, command);
    await service.command(requestId, command);
    expect(familyRequest.mock.calls).toEqual(
      Array(2).fill([
        'ghaf_family_masroofi_command',
        { p_family_id: familyId, p_request_id: requestId, p_command: command },
      ]),
    );
    familyRequest.mockResolvedValue(emptySnapshot());
    await service.load();
    expect(familyRequest).toHaveBeenLastCalledWith('ghaf_family_masroofi', {
      p_family_id: familyId,
    });
  });

  it('rejects invalid identity, synthetic request IDs and role violations before transport', async () => {
    const familyRequest = vi.fn();
    const transport = { familyRequest, subscribeFamily: vi.fn() };
    expect(() =>
      createCloudMasroofiService({ transport, userId, familyId: id(99), actor: parent }),
    ).toThrow('access_unavailable');
    const service = createCloudMasroofiService({ transport, userId, familyId, actor: parent });
    await expect(
      service.command('local_request', { type: 'card.top_up', childId, amountFils: 100 }),
    ).rejects.toThrow('invalid_command');
    await expect(
      service.command(requestId, { type: 'purchase', childId, fixtureId: 'gift' }),
    ).rejects.toThrow('access_unavailable');
    const childService = createCloudMasroofiService({
      transport,
      userId: child.userId,
      familyId,
      actor: child,
    });
    await expect(
      childService.command(requestId, { type: 'card.top_up', childId, amountFils: 100 }),
    ).rejects.toThrow('access_unavailable');
    await expect(
      childService.command(requestId, { type: 'purchase', childId: id(99), fixtureId: 'gift' }),
    ).rejects.toThrow('access_unavailable');
    expect(familyRequest).not.toHaveBeenCalled();
  });

  it('preserves safe provider errors and rejects mismatched and extra response envelopes', async () => {
    const error = new CloudMasroofiError('schema_unavailable');
    const familyRequest = vi.fn().mockRejectedValue(error);
    const service = createCloudMasroofiService({
      transport: { familyRequest, subscribeFamily: vi.fn() },
      userId,
      familyId,
      actor: parent,
    });
    await expect(service.load()).rejects.toBe(error);
    for (const response of [
      null,
      { snapshot: emptySnapshot(), success: true },
      { snapshot: emptySnapshot(child) },
      { snapshot: { ...emptySnapshot(), familyId: id(99) } },
    ]) {
      familyRequest.mockResolvedValue(response);
      await expect(
        service.command(requestId, { type: 'card.enable', childId, age10PlusConfirmed: true }),
      ).rejects.toThrow('invalid_response');
    }
  });
});
