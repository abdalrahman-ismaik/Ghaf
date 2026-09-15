import { CloudFamilyError, type CloudCommand } from '@/models/normalizedCloudFamily';
import type { ParentAccountService } from '@/models/parentAccount';
import type { CloudFamilyService } from './controller';
import { cloudError } from './validation';

export function createParentCloudService(
  account: ParentAccountService,
  expectedUserId: string,
): CloudFamilyService {
  const call = async (name: 'ghaf_read' | 'ghaf_command', parameters?: Record<string, unknown>) => {
    if (!account.normalizedFamilyRequest) throw new CloudFamilyError('service_unavailable');
    try {
      const result = await account.normalizedFamilyRequest(name, parameters, expectedUserId);
      if (result.error)
        throw cloudError(result.status === 0 ? { name: 'TypeError' } : result.error);
      return result.data;
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'reauth_required'
      )
        throw new CloudFamilyError('reauthentication_required');
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
