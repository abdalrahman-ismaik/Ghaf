import { CloudFamilyError, type CloudCommand } from '@/models/cloudFamily';
import type { ParentAccountService } from '@/models/parentAccount';
import type { CloudFamilyService } from './controller';
import { cloudError } from './validation';

export function createParentCloudService(account: ParentAccountService): CloudFamilyService {
  const call = async (name: 'ghaf_read' | 'ghaf_command', parameters?: Record<string, unknown>) => {
    if (!account.familyRequest) throw new CloudFamilyError('service_unavailable');
    try {
      const result = await account.familyRequest(name, parameters);
      if (result.error)
        throw cloudError(result.status === 0 ? { name: 'TypeError' } : result.error);
      return result.data;
    } catch (error) {
      throw cloudError(error);
    }
  };
  return {
    read: () => call('ghaf_read'),
    command: (requestId: string, expectedRevision: number, command: CloudCommand) =>
      call('ghaf_command', {
        p_request_id: requestId,
        p_expected_revision: expectedRevision,
        p_command: command,
      }),
  };
}
