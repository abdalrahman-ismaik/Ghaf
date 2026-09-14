import { z } from 'zod';
import { isCloudUuid } from '@/features/cloud-family/validation';
import {
  parseCloudGrowthCommand,
  parseCloudGrowthSnapshot,
} from '@/features/cloud-growth/validation';
import {
  CloudGrowthError,
  type CloudGrowthService,
  type CloudGrowthTransport,
} from '@/models/cloudGrowth';

export function createCloudGrowthService({
  transport,
  userId,
  familyId,
}: {
  readonly transport: CloudGrowthTransport;
  readonly userId: string;
  readonly familyId: string;
}): CloudGrowthService {
  if (!isCloudUuid(userId) || !isCloudUuid(familyId))
    throw new CloudGrowthError('access_unavailable');
  return {
    async load() {
      return parseCloudGrowthSnapshot(
        await transport.familyRequest('ghaf_family_growth', { p_family_id: familyId }),
        userId,
        familyId,
      );
    },
    async command(requestId, input) {
      if (!isCloudUuid(requestId)) throw new CloudGrowthError('invalid_command');
      const command = parseCloudGrowthCommand(input);
      const parsed = z
        .object({ snapshot: z.unknown() })
        .strict()
        .safeParse(
          await transport.familyRequest('ghaf_family_growth_command', {
            p_family_id: familyId,
            p_request_id: requestId,
            p_command: command,
          }),
        );
      if (!parsed.success) throw new CloudGrowthError('invalid_response');
      return parseCloudGrowthSnapshot(parsed.data.snapshot, userId, familyId);
    },
  };
}
