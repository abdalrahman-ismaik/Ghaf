import { describe, expect, it } from 'vitest';

import {
  applyVoiceTranscript,
  beginVoiceDeletion,
  beginVoicePermissionRequest,
  beginVoiceTranscriptSend,
  completeVoiceDeletion,
  completeVoiceTranscriptSend,
  createLiveVoiceCaptureState,
  editVoiceTranscript,
  markVoiceTranscriptReady,
  resolveVoicePermission,
  startHeldVoiceCapture,
  stopHeldVoiceCapture,
} from '@/features/assistants/liveVoiceCapture';
function expectOk<T>(
  result: { readonly ok: true; readonly data: T } | { readonly ok: false; readonly error: unknown },
): T {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error('Expected valid voice transition');
  return result.data;
}

function initial() {
  return createLiveVoiceCaptureState({
    voiceSessionId: 'voice_session_123456',
    requestId: 'request_voice_123456',
    bindingNonce: 'binding_voice_123456',
    locale: 'en',
    noticeVersion: 1,
    grantVersion: 2,
    taskArchetypeId: 'task_recycling_p0_v1',
    approvedTaskVersion: 1,
  });
}

function stopped() {
  let state = initial();
  state = expectOk(beginVoicePermissionRequest(state));
  state = expectOk(resolveVoicePermission(state, true));
  state = expectOk(startHeldVoiceCapture(state, '2026-09-07T10:00:00.000Z'));
  return expectOk(
    stopHeldVoiceCapture(state, {
      stoppedAt: '2026-09-07T10:00:05.000Z',
      durationMs: 5_000,
      byteCount: 4,
      cacheUri: 'file:///cache/voice.m4a',
    }),
  );
}

describe('live voice foreground state machine', () => {
  it('requires explicit permission before a held recording', () => {
    expect(startHeldVoiceCapture(initial(), '2026-09-07T10:00:00.000Z')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    const denied = expectOk(
      resolveVoicePermission(expectOk(beginVoicePermissionRequest(initial())), false),
    );
    expect(denied.envelope).toMatchObject({
      status: 'permission_denied',
      permissionState: 'denied',
    });
  });

  it('moves only from visible held capture to transcription within hard limits', () => {
    const state = stopped();
    expect(state.envelope).toMatchObject({
      status: 'transcribing',
      durationMs: 5_000,
      byteCount: 4,
      cacheUri: 'file:///cache/voice.m4a',
      deletionStatus: 'pending',
    });
    expect(
      stopHeldVoiceCapture(
        { ...state, envelope: { ...state.envelope, status: 'recording_held' } },
        {
          stoppedAt: '2026-09-07T10:00:16.000Z',
          durationMs: 15_001,
          byteCount: 4,
          cacheUri: 'file:///cache/voice.m4a',
        },
      ),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
  });

  it('requires transcript review and explicit send after audio deletion', () => {
    let state = stopped();
    state = expectOk(
      applyVoiceTranscript(state, {
        schemaVersion: '1.0',
        requestId: state.envelope.requestId,
        bindingNonce: state.envelope.bindingNonce,
        text: 'Please clarify the first step.',
        locale: 'en',
        audioDeleted: true,
      }),
    );
    expect(state.envelope).toMatchObject({
      status: 'transcript_review',
      cacheUri: null,
      deletionStatus: 'deleted',
    });
    expect(beginVoiceTranscriptSend(state)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    state = expectOk(editVoiceTranscript(state, 'Please explain the first sorting step.'));
    expect(beginVoiceTranscriptSend(state)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    state = expectOk(markVoiceTranscriptReady(state));
    state = expectOk(beginVoiceTranscriptSend(state));
    state = expectOk(completeVoiceTranscriptSend(state));
    expect(state.envelope.status).toBe('terminal');
    expect(state.transcript?.reviewStatus).toBe('ready_to_send');
  });

  it('deletes audio and transcript without allowing a send', () => {
    let state = stopped();
    state = expectOk(beginVoiceDeletion(state));
    state = expectOk(completeVoiceDeletion(state, true));
    expect(state).toMatchObject({
      envelope: { status: 'deleted', cacheUri: null, deletionStatus: 'deleted' },
      transcript: null,
    });
    expect(beginVoiceTranscriptSend(state)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
  });
});
