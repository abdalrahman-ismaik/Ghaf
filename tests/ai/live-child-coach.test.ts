import { describe, expect, it } from 'vitest';

import {
  createLiveChildCoachRequest,
  validateLiveChildCoachResponse,
} from '@/features/assistants/liveChildCoach';
import { createInitialLiveChildCoachGrant } from '@/features/access';

function activeTextGrant() {
  return {
    ...createInitialLiveChildCoachGrant('child_salem', 'text'),
    status: 'granted' as const,
    grantVersion: 2,
    revokedAt: null,
  };
}

function activeVoiceGrant() {
  return {
    ...createInitialLiveChildCoachGrant('child_salem', 'voice'),
    status: 'granted' as const,
    grantVersion: 4,
    revokedAt: null,
  };
}

function base(ageBand: '6_8' | '9_11' | '12_14') {
  return {
    ageBand,
    childId: 'child_salem' as const,
    locale: 'ar' as const,
    now: '2026-09-07T12:00:00.000Z',
    taskArchetypeId: 'task_recycling_p0_v1' as const,
    catalogVersion: 1,
    approvedTaskVersion: 1,
    requestId: `request_${ageBand}_123456789`,
    bindingNonce: `binding_${ageBand}_123456789`,
    grant: activeTextGrant(),
  };
}

describe('bounded live Child Coach policy', () => {
  it('builds curated-only requests for ages 6–8', () => {
    expect(createLiveChildCoachRequest({ ...base('6_8'), intent: 'show_next_step' })).toMatchObject(
      { ok: true, data: { ageBand: '6_8', intent: 'show_next_step' } },
    );
    expect(createLiveChildCoachRequest({ ...base('6_8'), intent: 'first_step' })).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
  });

  it('builds exact structured templates for ages 9–11 without free text', () => {
    const result = createLiveChildCoachRequest({ ...base('9_11'), intent: 'smaller_chunk' });
    expect(result).toMatchObject({
      ok: true,
      data: {
        ageBand: '9_11',
        intent: 'smaller_chunk',
        templateInput: { supportChoice: 'smaller_chunk' },
      },
    });
    expect(
      createLiveChildCoachRequest({
        ...base('9_11'),
        intent: 'smaller_chunk',
        boundedText: 'free text is not available',
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
  });

  it('allows only bounded task topics for guardian-enabled ages 12–14', () => {
    expect(
      createLiveChildCoachRequest({
        ...base('12_14'),
        intent: 'clarify_step',
        boundedText: 'Please explain the first sorting step.',
        inputOrigin: 'typed',
      }),
    ).toMatchObject({
      ok: true,
      data: { ageBand: '12_14', topic: 'clarify_step', inputOrigin: 'typed' },
    });
    expect(
      createLiveChildCoachRequest({
        ...base('12_14'),
        intent: 'clarify_step',
        boundedText: 'x'.repeat(241),
        inputOrigin: 'typed',
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
  });

  it('binds reviewed voice text to a separate current grant and exact voice correlation', () => {
    const input = {
      ...base('12_14'),
      intent: 'clarify_step' as const,
      boundedText: 'Please explain the first sorting step.',
      inputOrigin: 'reviewed_voice_transcript' as const,
      voiceRequestId: 'voice_request_123456',
      voiceBindingNonce: 'voice_binding_123456',
    };
    expect(createLiveChildCoachRequest(input)).toMatchObject({
      ok: false,
      error: { code: 'PRIVACY_REJECTED' },
    });
    expect(createLiveChildCoachRequest({ ...input, voiceGrant: activeVoiceGrant() })).toMatchObject(
      {
        ok: true,
        data: {
          inputOrigin: 'reviewed_voice_transcript',
          voiceGrantVersion: 4,
          voiceRequestId: 'voice_request_123456',
          voiceBindingNonce: 'voice_binding_123456',
        },
      },
    );
  });

  it('requires a current implementation-only text grant', () => {
    expect(
      createLiveChildCoachRequest({
        ...base('9_11'),
        intent: 'first_step',
        grant: createInitialLiveChildCoachGrant('child_salem', 'text'),
      }),
    ).toMatchObject({ ok: false, error: { code: 'PRIVACY_REJECTED' } });
    expect(
      createLiveChildCoachRequest({
        ...base('9_11'),
        now: '2026-10-08T00:00:00.000Z',
        intent: 'first_step',
      }),
    ).toMatchObject({ ok: false, error: { code: 'PRIVACY_REJECTED' } });
  });

  it('accepts only a correlation-bound, age-sized terminal response', () => {
    const built = createLiveChildCoachRequest({ ...base('6_8'), intent: 'show_next_step' });
    expect(built.ok).toBe(true);
    if (!built.ok) return;
    const response = {
      schemaVersion: '1.0' as const,
      requestId: built.data.requestId,
      taskBindingNonce: built.data.taskBindingNonce,
      intent: built.data.intent,
      disposition: 'coach' as const,
      steps: [{ ar: 'ابدأ بالخطوة الأولى.', en: 'Start with the first step.' }],
      ifThenCue: null,
      reflectionQuestion: null,
      reviewedPhrase: null,
      terminal: true as const,
    };
    expect(validateLiveChildCoachResponse(built.data, response)).toMatchObject({ ok: true });
    expect(
      validateLiveChildCoachResponse(built.data, {
        ...response,
        steps: [...response.steps, response.steps[0]],
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_RESPONSE' } });
  });
});
