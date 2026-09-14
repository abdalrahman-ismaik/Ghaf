import { describe, expect, it, vi } from 'vitest';
import { createCloudGrowthService } from '../../src/services/cloud-growth';
import { cloudId, familyId, userId } from '../cloud-family/fixtures';

const snapshot = {
  schemaVersion: 1,
  actor: { userId, role: 'parent', familyId, childId: null },
  familyId,
  revision: 0,
  currentWeekKey: '2026-W38',
  children: [],
  rewards: [],
  league: null,
};
describe('cloud growth transport adapter', () => {
  it('sends only the authenticated command port and provided stable request UUID', async () => {
    const familyRequest = vi.fn().mockResolvedValue({ snapshot });
    const service = createCloudGrowthService({
      transport: { familyRequest, subscribeFamily: vi.fn() },
      userId,
      familyId,
    });
    const command = { type: 'reward.give' as const, planId: cloudId(10), expectedVersion: 1 };
    await service.command(cloudId(20), command);
    await service.command(cloudId(20), command);
    expect(familyRequest).toHaveBeenNthCalledWith(1, 'ghaf_family_growth_command', {
      p_family_id: familyId,
      p_request_id: cloudId(20),
      p_command: command,
    });
    expect(familyRequest.mock.calls[1]).toEqual(familyRequest.mock.calls[0]);
  });
  it('never treats malformed or wrong-family service output as an empty successful family', async () => {
    const familyRequest = vi.fn().mockResolvedValue({ ...snapshot, familyId: cloudId(99) });
    const service = createCloudGrowthService({
      transport: { familyRequest, subscribeFamily: vi.fn() },
      userId,
      familyId,
    });
    await expect(service.load()).rejects.toThrow('invalid_response');
    familyRequest.mockResolvedValue(null);
    await expect(
      service.command(cloudId(20), {
        type: 'reward.give',
        planId: cloudId(10),
        expectedVersion: 1,
      }),
    ).rejects.toThrow('invalid_response');
  });
});
