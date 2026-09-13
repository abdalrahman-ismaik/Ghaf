import { describe, expect, it } from 'vitest';

import {
  AI_ZERO_EFFECTS,
  aiControlEventSchema,
  aiZeroEffectsSchema,
  childCoachTextResponseV1Schema,
  liveChildCoachGrantSchema,
  requestCorrelationV1Schema,
} from '@/models/boundedAi';

const correlation = {
  requestId: 'request_123456789',
  bindingNonce: 'binding_123456789',
  schemaVersion: '1.0' as const,
  issuedAt: '2026-09-07T10:00:00.000Z',
  expiresAt: '2026-09-07T10:05:00.000Z',
};

describe('Feature 004 shared contracts', () => {
  it('accepts only URL-safe, short-lived, closed correlation records', () => {
    expect(requestCorrelationV1Schema.safeParse(correlation).success).toBe(true);

    for (const invalid of [
      { ...correlation, requestId: 'spaces are rejected' },
      { ...correlation, requestId: 'short' },
      { ...correlation, schemaVersion: '2.0' },
      { ...correlation, expiresAt: '2026-09-07T10:05:01.000Z' },
      { ...correlation, content: 'private task text' },
    ]) {
      expect(requestCorrelationV1Schema.safeParse(invalid).success).toBe(false);
    }
  });

  it('requires separate, explicitly synthetic, time-bounded grants', () => {
    const grant = {
      capability: 'text' as const,
      status: 'granted' as const,
      childSubject: 'subject_123456789',
      grantVersion: 1,
      noticeVersion: 1,
      policyVersion: 'child-coach-policy-v1',
      providerVersion: 'prepared-provider-v1',
      issuedAt: '2026-09-07T10:00:00.000Z',
      expiresAt: '2026-10-07T10:00:00.000Z',
      revokedAt: null,
      reauthenticationProofId: 'reauth_123456789',
      capabilityTruth: 'synthetic_implementation_only' as const,
    };

    expect(liveChildCoachGrantSchema.safeParse(grant).success).toBe(true);
    expect(liveChildCoachGrantSchema.safeParse({ ...grant, capability: 'voice' }).success).toBe(
      true,
    );
    expect(
      liveChildCoachGrantSchema.safeParse({ ...grant, capabilityTruth: 'production' }).success,
    ).toBe(false);
    expect(
      liveChildCoachGrantSchema.safeParse({
        ...grant,
        expiresAt: '2026-10-07T10:00:01.000Z',
      }).success,
    ).toBe(false);
    expect(liveChildCoachGrantSchema.safeParse({ ...grant, rawChildName: 'Salem' }).success).toBe(
      false,
    );
  });

  it('accepts terminal Coach output and rejects unknown or continuation fields', () => {
    const response = {
      schemaVersion: '1.0' as const,
      requestId: correlation.requestId,
      taskBindingNonce: correlation.bindingNonce,
      intent: 'show_next_step' as const,
      disposition: 'coach' as const,
      steps: [{ ar: 'ضع الورق في الحاوية.', en: 'Put the paper in the bin.' }],
      ifThenCue: null,
      reflectionQuestion: null,
      reviewedPhrase: null,
      terminal: true as const,
    };

    expect(childCoachTextResponseV1Schema.safeParse(response).success).toBe(true);
    expect(childCoachTextResponseV1Schema.safeParse({ ...response, terminal: false }).success).toBe(
      false,
    );
    expect(
      childCoachTextResponseV1Schema.safeParse({ ...response, continueConversation: true }).success,
    ).toBe(false);
  });

  it('makes every AI progression authority explicitly and immutably false', () => {
    expect(aiZeroEffectsSchema.parse(AI_ZERO_EFFECTS)).toEqual(AI_ZERO_EFFECTS);
    expect(Object.isFrozen(AI_ZERO_EFFECTS)).toBe(true);

    for (const field of Object.keys(AI_ZERO_EFFECTS)) {
      expect(
        aiZeroEffectsSchema.safeParse({ ...AI_ZERO_EFFECTS, [field]: true }).success,
        field,
      ).toBe(false);
    }
  });

  it('allows only non-content control telemetry', () => {
    const event = {
      operation: 'coach_approved_task_v1' as const,
      schemaVersion: '1.0' as const,
      ageBand: '12_14' as const,
      outcome: 'fallback' as const,
      latencyBucket: 'under_1500_ms' as const,
      fallbackReason: 'timeout' as const,
      rateLimitBucket: 'within_limit' as const,
      deploymentVersion: 'local-test-v1',
      requestCorrelation: 'request_123456789',
      deletionOutcome: 'not_applicable' as const,
    };

    expect(aiControlEventSchema.safeParse(event).success).toBe(true);
    for (const privateField of ['taskText', 'name', 'audio', 'transcript', 'cacheUri']) {
      expect(
        aiControlEventSchema.safeParse({ ...event, [privateField]: 'private content' }).success,
        privateField,
      ).toBe(false);
    }
  });
});
