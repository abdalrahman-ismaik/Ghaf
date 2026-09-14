import type { CloudFamilyCommand, CloudFamilyTransport } from '@/models/cloudFamily';
import { CloudFamilyError } from '@/models/cloudFamily';
import {
  isCloudUuid,
  parseCloudFamilyCommand,
  parseCloudFamilyIdentity,
  parseCloudFamilyResponse,
  parseCloudFamilySnapshot,
} from '@/features/cloud-family/validation';

export function createCloudFamilyService(transport: CloudFamilyTransport, userId: string) {
  if (!isCloudUuid(userId)) throw new CloudFamilyError('access_unavailable');
  return {
    async identity() {
      return parseCloudFamilyIdentity(
        await transport.familyRequest('ghaf_family_identity', {}),
        userId,
      );
    },
    async load(familyId: string | null = null) {
      if (familyId !== null && !isCloudUuid(familyId))
        throw new CloudFamilyError('invalid_command');
      const snapshot = parseCloudFamilySnapshot(
        await transport.familyRequest('ghaf_family_snapshot', { p_family_id: familyId }),
        userId,
      );
      if (familyId !== null && snapshot.family?.id !== familyId)
        throw new CloudFamilyError('invalid_response');
      return snapshot;
    },
    async command(familyId: string | null, requestId: string, input: CloudFamilyCommand) {
      const command = parseCloudFamilyCommand(input);
      if (!isCloudUuid(requestId) || (command.type !== 'create_family' && !isCloudUuid(familyId)))
        throw new CloudFamilyError('invalid_command');
      const response = parseCloudFamilyResponse(
        await transport.familyRequest('ghaf_family_command', {
          p_family_id: command.type === 'create_family' ? null : familyId,
          p_request_id: requestId,
          p_command: command,
        }),
        userId,
      );
      if (command.type !== 'create_family' && response.snapshot.family?.id !== familyId)
        throw new CloudFamilyError('invalid_response');
      return response;
    },
    async redeemInvite(token: string, requestId: string) {
      if (
        typeof token !== 'string' ||
        token.trim() !== token ||
        token.length < 32 ||
        token.length > 512 ||
        !isCloudUuid(requestId)
      )
        throw new CloudFamilyError('invalid_invite');
      return parseCloudFamilyResponse(
        await transport.familyRequest('ghaf_redeem_family_invite', {
          p_token: token,
          p_request_id: requestId,
        }),
        userId,
      );
    },
    subscribe(familyId: string, onChange: () => void) {
      if (!isCloudUuid(familyId)) throw new CloudFamilyError('invalid_command');
      return transport.subscribeFamily(familyId, onChange);
    },
  };
}
