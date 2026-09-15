import { z } from 'zod';

import { isCloudUuid } from '@/features/cloud-family/validation';
import {
  assertCloudMasroofiActor,
  parseCloudMasroofiCommand,
  parseCloudMasroofiSnapshot,
} from '@/features/cloud-masroofi/validation';
import type { CloudFamilyActor } from '@/models/cloudFamily';
import {
  CloudMasroofiError,
  type CloudMasroofiService,
  type CloudMasroofiTransport,
} from '@/models/cloudMasroofi';

export function createCloudMasroofiService(options: {
  readonly transport: CloudMasroofiTransport;
  readonly userId: string;
  readonly familyId: string;
  readonly actor: CloudFamilyActor;
}): CloudMasroofiService {
  const { transport, userId, familyId } = options;
  let actor: CloudFamilyActor;
  try {
    actor = assertCloudMasroofiActor(options.actor, userId, familyId);
  } catch {
    throw new CloudMasroofiError('access_unavailable');
  }
  const parseSnapshot = (value: unknown) =>
    parseCloudMasroofiSnapshot(value, userId, familyId, actor);
  return {
    async load() {
      return parseSnapshot(
        await transport.familyRequest('ghaf_family_masroofi', { p_family_id: familyId }),
      );
    },
    async command(requestId, input) {
      if (!isCloudUuid(requestId)) throw new CloudMasroofiError('invalid_command');
      const command = parseCloudMasroofiCommand(input);
      if (
        actor.role === 'child'
          ? command.type !== 'purchase' || command.childId !== actor.childId
          : command.type === 'purchase'
      ) {
        throw new CloudMasroofiError('access_unavailable');
      }
      const parsed = z
        .object({ snapshot: z.unknown() })
        .strict()
        .safeParse(
          await transport.familyRequest('ghaf_family_masroofi_command', {
            p_family_id: familyId,
            p_request_id: requestId,
            p_command: command,
          }),
        );
      if (!parsed.success) throw new CloudMasroofiError('invalid_response');
      return parseSnapshot(parsed.data.snapshot);
    },
  };
}
