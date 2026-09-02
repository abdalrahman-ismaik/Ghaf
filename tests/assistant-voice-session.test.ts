import { describe, expect, it } from 'vitest';

import {
  createIdleVoiceSession,
  deleteVoiceTranscript,
  replayVoiceTranscript,
  resetVoiceSession,
  sendVoiceTranscript,
  setVoicePlayback,
  startVoiceSession,
  stopVoiceSessionWithPreparedTranscript,
} from '../src/features/assistants/voiceSession';

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
  it('runs explicit start, stop, review, playback, replay, and send transitions', () => {
    const started = startVoiceSession(idleSession(), access);
    expect(started).toMatchObject({
      ok: true,
      data: { lifecycle: 'recording', recordingVisible: true, backgroundRecording: false },
    });
    if (!started.ok) return;

    const reviewed = stopVoiceSessionWithPreparedTranscript(started.data, {
      access,
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
    [{ ...access, grant: { ...access.grant, voiceEnabled: false } }, 'permission'],
    [{ ...access, grant: { ...access.grant, aiEnabled: false } }, 'permission'],
    [{ ...access, taskId: 'task_other' }, 'task'],
    [{ ...access, approvedTaskVersion: 2 }, 'task'],
    [{ ...access, approvedByParent: false as const }, 'approval'],
  ])('fails start for invalid %s context', (invalidAccess) => {
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
        transcript: { ar: '', en: 'Prepared text.' },
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(
      stopVoiceSessionWithPreparedTranscript(started.data, {
        access,
        transcript: { ar: 'نص مجهز.', en: 'Prepared\ntext.' },
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
});
