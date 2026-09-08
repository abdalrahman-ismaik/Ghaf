import { liveChildCoachBoundedTextIsSafe } from '../../../src/features/assistants/liveChildCoach';
import type { CapabilityTokenClaims, ChildCoachTextRequestV1 } from '../../../src/models/boundedAi';

function carriesVoiceAuthority(claims: CapabilityTokenClaims): boolean {
  return (
    claims.voiceGrantVersion != null ||
    claims.voiceNoticeVersion != null ||
    claims.voiceRequestId != null ||
    claims.voiceBindingNonce != null
  );
}

export function childCoachCapabilityMatches(
  claims: CapabilityTokenClaims,
  request: ChildCoachTextRequestV1,
): boolean {
  if (
    claims.role !== 'child' ||
    claims.grantVersion !== request.grantVersion ||
    claims.noticeVersion !== request.noticeVersion
  ) {
    return false;
  }
  if (request.ageBand !== '12_14' || request.inputOrigin !== 'reviewed_voice_transcript') {
    return !carriesVoiceAuthority(claims);
  }
  return (
    claims.voiceGrantVersion === request.voiceGrantVersion &&
    claims.voiceNoticeVersion === request.voiceNoticeVersion &&
    claims.voiceRequestId === request.voiceRequestId &&
    claims.voiceBindingNonce === request.voiceBindingNonce
  );
}

export function childCoachRequestIsSafe(request: ChildCoachTextRequestV1): boolean {
  return (
    request.ageBand !== '12_14' ||
    request.boundedText === undefined ||
    liveChildCoachBoundedTextIsSafe(request.taskArchetypeId, request.boundedText)
  );
}

export function childCoachRequestIsMcpEligible(request: ChildCoachTextRequestV1): boolean {
  return request.ageBand !== '12_14' || request.inputOrigin !== 'reviewed_voice_transcript';
}
