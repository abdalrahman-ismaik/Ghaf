import { describe, expect, it } from 'vitest';

import {
  createIdleVoiceSession,
  deleteVoiceTranscript,
  PREPARED_VOICE_TRANSCRIPTS,
  replayVoiceTranscript,
  resetVoiceSession,
  sendVoiceTranscript,
  setVoicePlayback,
  startVoiceSession,
  stopVoiceSessionWithPreparedTranscript,
} from '../src/features/assistants/voiceSession';
import {
  SYNTHETIC_CHILD_CREDENTIAL_FIXTURES,
  SYNTHETIC_PARENT_ACCESS_FIXTURE,
  SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
} from '../src/models/access';
import { createFeature003ServiceRegistry } from '../src/services';

const access = {
  childId: 'child_salem',
  accessSessionId: 'access_child_salem_device_1',
  taskId: 'task_recycling_p0_v1',
  approvedTaskVersion: 1,
  lifecycle: 'in_progress' as const,
  approvedByParent: true as const,
  grant: {
    childId: 'child_salem',
    version: 3,
    voiceEnabled: true,
    aiEnabled: true,
  },
};

function idleSession() {
  const result = createIdleVoiceSession({
    voiceSessionId: 'voice_session_1',
    access,
  });
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

describe('synthetic voice session', () => {
  it('binds prepared transcript fixtures to the canonical reviewed task', () => {
    expect(
      createIdleVoiceSession({
        voiceSessionId: 'voice_other_task',
        access: { ...access, taskId: 'task_other' },
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(
      createIdleVoiceSession({
        voiceSessionId: 'voice_wrong_child',
        access: {
          ...access,
          childId: 'child_alya',
          grant: { ...access.grant, childId: 'child_alya' },
        },
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(PREPARED_VOICE_TRANSCRIPTS.voice_recycling_complete_v1).toMatchObject({
      taskId: 'task_recycling_p0_v1',
      approvedTaskVersion: 1,
    });
    expect(Object.isFrozen(PREPARED_VOICE_TRANSCRIPTS)).toBe(true);
    expect(Object.isFrozen(PREPARED_VOICE_TRANSCRIPTS.voice_recycling_complete_v1)).toBe(true);
    expect(Object.isFrozen(PREPARED_VOICE_TRANSCRIPTS.voice_recycling_complete_v1.transcript)).toBe(
      true,
    );
  });

  it('runs explicit start, stop, review, playback, replay, and send transitions', () => {
    const started = startVoiceSession(idleSession(), access);
    expect(started).toMatchObject({
      ok: true,
      data: { lifecycle: 'recording', recordingVisible: true, backgroundRecording: false },
    });
    if (!started.ok) return;

    const reviewed = stopVoiceSessionWithPreparedTranscript(started.data, {
      access,
      transcriptFixtureId: 'voice_recycling_complete_v1',
      transcript: {
        ar: 'بعد فحص الشخص البالغ، أفرز المواد النظيفة.',
        en: 'After the adult checks, I sort the clean items.',
      },
    });
    expect(reviewed).toMatchObject({
      ok: true,
      data: { lifecycle: 'transcript_review', recordingVisible: false },
    });
    if (!reviewed.ok) return;

    const playback = setVoicePlayback(reviewed.data, {
      captionsEnabled: true,
      playbackRate: 0.75,
    });
    expect(playback).toMatchObject({
      ok: true,
      data: { captionsEnabled: true, playbackRate: 0.75 },
    });
    if (!playback.ok) return;

    const replayed = replayVoiceTranscript(playback.data);
    expect(replayed).toMatchObject({ ok: true, data: { replayCount: 1 } });
    if (!replayed.ok) return;

    expect(sendVoiceTranscript(replayed.data, '2026-09-02T10:00:00.000Z')).toMatchObject({
      ok: true,
      data: { lifecycle: 'sent', sentAt: '2026-09-02T10:00:00.000Z' },
    });
  });

  it('deletes a transcript before send and removes replay availability', () => {
    const started = startVoiceSession(idleSession(), access);
    if (!started.ok) return;
    const reviewed = stopVoiceSessionWithPreparedTranscript(started.data, {
      access,
      transcriptFixtureId: 'voice_short_review_v1',
      transcript: { ar: 'نص مجهز.', en: 'Prepared text.' },
    });
    if (!reviewed.ok) return;

    const deleted = deleteVoiceTranscript(reviewed.data);
    expect(deleted).toMatchObject({
      ok: true,
      data: { lifecycle: 'idle', transcript: null, replayCount: 0, sentAt: null },
    });
    if (!deleted.ok) return;
    expect(replayVoiceTranscript(deleted.data)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
  });

  it.each([
    {
      label: 'voice permission',
      invalidAccess: { ...access, grant: { ...access.grant, voiceEnabled: false } },
    },
    {
      label: 'AI permission',
      invalidAccess: { ...access, grant: { ...access.grant, aiEnabled: false } },
    },
    { label: 'task identity', invalidAccess: { ...access, taskId: 'task_other' } },
    { label: 'task version', invalidAccess: { ...access, approvedTaskVersion: 2 } },
    { label: 'Parent approval', invalidAccess: { ...access, approvedByParent: false } },
  ])('fails start for invalid $label context', ({ invalidAccess }) => {
    expect(startVoiceSession(idleSession(), invalidAccess)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
  });

  it('rejects stop outside recording and send outside transcript review', () => {
    const session = idleSession();
    expect(
      stopVoiceSessionWithPreparedTranscript(session, {
        access,
        transcriptFixtureId: 'voice_short_review_v1',
        transcript: { ar: 'نص مجهز.', en: 'Prepared text.' },
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(sendVoiceTranscript(session, '2026-09-02T10:00:00.000Z')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
  });

  it('rejects an empty or multiline prepared transcript', () => {
    const started = startVoiceSession(idleSession(), access);
    if (!started.ok) return;

    expect(
      stopVoiceSessionWithPreparedTranscript(started.data, {
        access,
        transcriptFixtureId: 'voice_short_review_v1',
        transcript: { ar: '', en: 'Prepared text.' },
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(
      stopVoiceSessionWithPreparedTranscript(started.data, {
        access,
        transcriptFixtureId: 'voice_short_review_v1',
        transcript: { ar: 'نص مجهز.', en: 'Prepared\ntext.' },
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(
      stopVoiceSessionWithPreparedTranscript(started.data, {
        access,
        transcriptFixtureId: 'voice_short_review_v1',
        transcript: { ar: 'نص آخر.', en: 'Caller supplied text.' },
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
  });

  it('resets every state to the exact idle shape without media or provider data', () => {
    const started = startVoiceSession(idleSession(), access);
    if (!started.ok) return;
    const reset = resetVoiceSession(started.data);

    expect(reset).toEqual(idleSession());
    expect(JSON.stringify(reset)).not.toMatch(/microphone|biometric|provider|audioBytes/iu);
  });

  it('rejects a forged grant and accepts the current stored Parent grants', () => {
    const registry = createFeature003ServiceRegistry();
    const parent = registry.access.signInParent({
      sessionId: 'voice-parent-session',
      parentFixtureId: SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId,
      deviceId: 'voice-parent-device',
      now: '2026-09-02T10:00:00.000Z',
    });
    if (!parent.ok) throw new Error(parent.error.message);
    const pairing = registry.access.requestPairing({
      requestId: 'voice-child-pairing',
      pairingCode: 'synthetic-code-voice-child',
      childId: 'child_salem',
      requestingDeviceId: 'voice-child-device',
      now: '2026-09-02T10:00:00.000Z',
    });
    if (!pairing.ok) throw new Error(pairing.error.message);
    const approved = registry.access.approvePairing({
      requestId: pairing.data.id,
      childId: 'child_salem',
      requestingDeviceId: 'voice-child-device',
      parentSession: parent.data,
      now: '2026-09-02T10:00:01.000Z',
    });
    if (!approved.ok) throw new Error(approved.error.message);
    const child = registry.access.consumePairing({
      requestId: pairing.data.id,
      pairingCode: pairing.data.pairingCode,
      childId: 'child_salem',
      deviceId: 'voice-child-device',
      childCredentialFixtureId: SYNTHETIC_CHILD_CREDENTIAL_FIXTURES.child_salem.fixtureId,
      sessionId: 'voice-child-session',
      now: '2026-09-02T10:00:02.000Z',
    });
    if (!child.ok) throw new Error(child.error.message);
    const authority = { session: child.data, now: '2026-09-02T10:03:00.000Z' };
    const forgedAccess = {
      ...access,
      accessSessionId: child.data.id,
      grant: { ...access.grant, version: 1 },
    };

    expect(
      registry.syntheticVoice.createIdle(
        { voiceSessionId: 'forged-voice-session', access: forgedAccess },
        authority,
      ),
    ).toMatchObject({ ok: false, error: { code: 'PRIVACY_REJECTED' } });

    const voiceProof = registry.access.issueReauthentication({
      proofId: 'voice-permission-proof',
      parentSession: parent.data,
      reauthenticationFixtureId: SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
      purpose: 'change_voice_permission',
      now: '2026-09-02T10:01:00.000Z',
    });
    if (!voiceProof.ok) throw new Error(voiceProof.error.message);
    const voiceGrant = registry.access.updateChildPermissions({
      parentSession: parent.data,
      childId: 'child_salem',
      expectedVersion: 1,
      change: { kind: 'voice', granted: true, proofId: voiceProof.data.id },
      now: '2026-09-02T10:01:01.000Z',
    });
    if (!voiceGrant.ok) throw new Error(voiceGrant.error.message);
    const aiProof = registry.access.issueReauthentication({
      proofId: 'voice-ai-proof',
      parentSession: parent.data,
      reauthenticationFixtureId: SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
      purpose: 'change_ai_permission',
      now: '2026-09-02T10:02:00.000Z',
    });
    if (!aiProof.ok) throw new Error(aiProof.error.message);
    const aiGrant = registry.access.updateChildPermissions({
      parentSession: parent.data,
      childId: 'child_salem',
      expectedVersion: voiceGrant.data.version,
      change: { kind: 'ai', granted: true, proofId: aiProof.data.id },
      now: '2026-09-02T10:02:01.000Z',
    });
    if (!aiGrant.ok) throw new Error(aiGrant.error.message);
    const storedAccess = {
      ...forgedAccess,
      grant: {
        childId: 'child_salem',
        version: aiGrant.data.version,
        voiceEnabled: aiGrant.data.voiceGranted,
        aiEnabled: aiGrant.data.aiGranted,
      },
    };

    const idle = registry.syntheticVoice.createIdle(
      { voiceSessionId: 'stored-voice-session', access: storedAccess },
      authority,
    );
    expect(idle).toMatchObject({
      ok: true,
      data: { childId: 'child_salem', permissionVersion: aiGrant.data.version },
    });
    if (!idle.ok) throw new Error(idle.error.message);
    const started = registry.syntheticVoice.start(idle.data, storedAccess, authority);
    if (!started.ok) throw new Error(started.error.message);
    expect(
      registry.syntheticVoice.send(
        {
          ...started.data,
          lifecycle: 'transcript_review',
          transcriptFixtureId: 'voice_short_review_v1',
          transcript: { ar: 'نص مجهز.', en: 'Prepared text.' },
          recordingVisible: false,
        },
        '2026-09-02T10:03:01.000Z',
        authority,
      ),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    const reviewed = registry.syntheticVoice.stopWithPreparedTranscript(
      started.data,
      {
        access: storedAccess,
        transcriptFixtureId: 'voice_short_review_v1',
        transcript: { ar: 'نص مجهز.', en: 'Prepared text.' },
      },
      authority,
    );
    if (!reviewed.ok) throw new Error(reviewed.error.message);

    const revokeProof = registry.access.issueReauthentication({
      proofId: 'voice-revoke-proof',
      parentSession: parent.data,
      reauthenticationFixtureId: SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
      purpose: 'change_voice_permission',
      now: '2026-09-02T10:04:00.000Z',
    });
    if (!revokeProof.ok) throw new Error(revokeProof.error.message);
    const revokedGrant = registry.access.updateChildPermissions({
      parentSession: parent.data,
      childId: 'child_salem',
      expectedVersion: aiGrant.data.version,
      change: { kind: 'voice', granted: false, proofId: revokeProof.data.id },
      now: '2026-09-02T10:04:01.000Z',
    });
    if (!revokedGrant.ok) throw new Error(revokedGrant.error.message);
    const afterRevocation = { ...authority, now: '2026-09-02T10:05:00.000Z' };

    expect(
      registry.syntheticVoice.send(reviewed.data, '2026-09-02T10:05:01.000Z', afterRevocation),
    ).toMatchObject({ ok: false, error: { code: 'PRIVACY_REJECTED' } });
    expect(
      registry.syntheticVoice.setPlayback(
        reviewed.data,
        { captionsEnabled: true, playbackRate: 0.75 },
        afterRevocation,
      ),
    ).toMatchObject({ ok: false, error: { code: 'PRIVACY_REJECTED' } });
    expect(registry.syntheticVoice.replay(reviewed.data, afterRevocation)).toMatchObject({
      ok: false,
      error: { code: 'PRIVACY_REJECTED' },
    });
    expect(registry.syntheticVoice.deleteBeforeSend(reviewed.data, afterRevocation)).toMatchObject({
      ok: true,
      data: { lifecycle: 'idle', transcript: null },
    });
  });
});
