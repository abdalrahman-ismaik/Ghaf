import type { DomainResult, LocalizedText } from '../../models/familyGrowth';
import type {
  CreateVoiceSessionInput,
  StopVoiceSessionInput,
  SyntheticVoiceSession,
  VoiceAccessContext,
  VoicePlaybackInput,
} from '../../models/assistantVoice';
import { P0_APPROVED_COACH_BINDING, PREPARED_VOICE_TRANSCRIPTS } from './preparedContent';

export { PREPARED_VOICE_TRANSCRIPTS } from './preparedContent';

function failure(
  message: string,
  code: 'INVALID_INPUT' | 'INVALID_TRANSITION' = 'INVALID_INPUT',
): DomainResult<never> {
  return {
    ok: false,
    error: { code, message, retryable: false, fallbackAvailable: false },
  };
}

function validText(value: LocalizedText): boolean {
  return (
    value.ar.trim().length > 0 &&
    value.en.trim().length > 0 &&
    value.ar.length <= 240 &&
    value.en.length <= 240 &&
    !/[\r\n]/u.test(value.ar) &&
    !/[\r\n]/u.test(value.en)
  );
}

function validAccess(access: VoiceAccessContext): boolean {
  return (
    access.childId === P0_APPROVED_COACH_BINDING.childId &&
    access.accessSessionId.trim().length > 0 &&
    access.taskId === P0_APPROVED_COACH_BINDING.taskId &&
    access.approvedTaskVersion === P0_APPROVED_COACH_BINDING.approvedTaskVersion &&
    access.approvedByParent &&
    ['chosen', 'in_progress'].includes(access.lifecycle) &&
    access.grant.childId === access.childId &&
    access.grant.version > 0 &&
    access.grant.voiceEnabled &&
    access.grant.aiEnabled
  );
}

function accessMatches(session: SyntheticVoiceSession, access: VoiceAccessContext): boolean {
  return (
    validAccess(access) &&
    session.childId === access.childId &&
    session.accessSessionId === access.accessSessionId &&
    session.taskId === access.taskId &&
    session.approvedTaskVersion === access.approvedTaskVersion &&
    session.permissionVersion === access.grant.version
  );
}

function idleShape(
  session: Pick<
    SyntheticVoiceSession,
    | 'voiceSessionId'
    | 'childId'
    | 'accessSessionId'
    | 'taskId'
    | 'approvedTaskVersion'
    | 'permissionVersion'
  >,
): SyntheticVoiceSession {
  return {
    voiceSessionId: session.voiceSessionId,
    childId: session.childId,
    accessSessionId: session.accessSessionId,
    taskId: session.taskId,
    approvedTaskVersion: session.approvedTaskVersion,
    permissionVersion: session.permissionVersion,
    lifecycle: 'idle',
    transcriptFixtureId: null,
    transcript: null,
    captionsEnabled: true,
    playbackRate: 1,
    replayCount: 0,
    recordingVisible: false,
    backgroundRecording: false,
    sentAt: null,
    origin: 'synthetic',
  };
}

function copySession(session: SyntheticVoiceSession): SyntheticVoiceSession {
  return {
    voiceSessionId: session.voiceSessionId,
    childId: session.childId,
    accessSessionId: session.accessSessionId,
    taskId: session.taskId,
    approvedTaskVersion: session.approvedTaskVersion,
    permissionVersion: session.permissionVersion,
    lifecycle: session.lifecycle,
    transcriptFixtureId: session.transcriptFixtureId,
    transcript: session.transcript ? { ...session.transcript } : null,
    captionsEnabled: session.captionsEnabled,
    playbackRate: session.playbackRate,
    replayCount: session.replayCount,
    recordingVisible: session.recordingVisible,
    backgroundRecording: false,
    sentAt: session.sentAt,
    origin: 'synthetic',
  };
}

export function createIdleVoiceSession(
  input: CreateVoiceSessionInput,
): DomainResult<SyntheticVoiceSession> {
  if (!input.voiceSessionId.trim() || !validAccess(input.access)) {
    return failure('Synthetic voice session requires an approved task and stored Parent grant');
  }
  return {
    ok: true,
    data: idleShape({
      voiceSessionId: input.voiceSessionId,
      childId: input.access.childId,
      accessSessionId: input.access.accessSessionId,
      taskId: input.access.taskId,
      approvedTaskVersion: input.access.approvedTaskVersion,
      permissionVersion: input.access.grant.version,
    }),
  };
}

export function startVoiceSession(
  session: SyntheticVoiceSession,
  access: VoiceAccessContext,
): DomainResult<SyntheticVoiceSession> {
  if (session.lifecycle !== 'idle') {
    return failure('Voice can start only from idle', 'INVALID_TRANSITION');
  }
  if (!accessMatches(session, access)) {
    return failure('Voice start is not bound to the approved Child, task, and Parent grant');
  }
  return {
    ok: true,
    data: { ...copySession(session), lifecycle: 'recording', recordingVisible: true },
  };
}

export function stopVoiceSessionWithPreparedTranscript(
  session: SyntheticVoiceSession,
  input: StopVoiceSessionInput,
): DomainResult<SyntheticVoiceSession> {
  if (session.lifecycle !== 'recording') {
    return failure('Voice can stop only while recording is visible', 'INVALID_TRANSITION');
  }
  const preparedTranscript = PREPARED_VOICE_TRANSCRIPTS[input.transcriptFixtureId];
  if (
    !accessMatches(session, input.access) ||
    !validText(input.transcript) ||
    !preparedTranscript ||
    preparedTranscript.taskId !== session.taskId ||
    preparedTranscript.approvedTaskVersion !== session.approvedTaskVersion ||
    preparedTranscript.transcript.ar !== input.transcript.ar ||
    preparedTranscript.transcript.en !== input.transcript.en
  ) {
    return failure('Prepared transcript or active-task access is invalid');
  }
  return {
    ok: true,
    data: {
      ...copySession(session),
      lifecycle: 'transcript_review',
      transcriptFixtureId: input.transcriptFixtureId,
      transcript: { ...input.transcript },
      recordingVisible: false,
      replayCount: 0,
    },
  };
}

export function deleteVoiceTranscript(
  session: SyntheticVoiceSession,
): DomainResult<SyntheticVoiceSession> {
  if (session.lifecycle !== 'transcript_review' || !session.transcript) {
    return failure('Only an unsent reviewed transcript can be deleted', 'INVALID_TRANSITION');
  }
  return { ok: true, data: idleShape(session) };
}

export function sendVoiceTranscript(
  session: SyntheticVoiceSession,
  sentAt: string,
): DomainResult<SyntheticVoiceSession> {
  if (session.lifecycle !== 'transcript_review' || !session.transcript) {
    return failure('Only a reviewed transcript can be sent', 'INVALID_TRANSITION');
  }
  if (!sentAt.trim() || Number.isNaN(Date.parse(sentAt))) {
    return failure('Voice transcript send time is invalid');
  }
  return { ok: true, data: { ...copySession(session), lifecycle: 'sent', sentAt } };
}

export function setVoicePlayback(
  session: SyntheticVoiceSession,
  input: VoicePlaybackInput,
): DomainResult<SyntheticVoiceSession> {
  if (!['transcript_review', 'sent'].includes(session.lifecycle) || !session.transcript) {
    return failure('Playback settings require a prepared transcript', 'INVALID_TRANSITION');
  }
  if (![0.75, 1].includes(input.playbackRate)) {
    return failure('Playback rate is outside the reviewed options');
  }
  return {
    ok: true,
    data: {
      ...copySession(session),
      captionsEnabled: input.captionsEnabled,
      playbackRate: input.playbackRate,
    },
  };
}

export function replayVoiceTranscript(
  session: SyntheticVoiceSession,
): DomainResult<SyntheticVoiceSession> {
  if (!['transcript_review', 'sent'].includes(session.lifecycle) || !session.transcript) {
    return failure('Replay requires a prepared transcript', 'INVALID_TRANSITION');
  }
  return {
    ok: true,
    data: { ...copySession(session), replayCount: session.replayCount + 1 },
  };
}

export function resetVoiceSession(session: SyntheticVoiceSession): SyntheticVoiceSession {
  return idleShape(session);
}
