import { describe, expect, it } from 'vitest';

import { createPreparedProfilePersonalization } from '../../src/features/assistants/profilePersonalization';

const input = {
  ageBand: '9_11',
  sex: 'male',
  interests: ['sustainability', 'nature'],
  hobbies: ['gardening'],
  accessibilityDefaults: ['simpler_instructions'],
  supportPreferences: ['short_steps', 'visual_examples'],
  customInterest: null,
  customHobby: null,
  customSupportPreference: null,
  customAccessibility: null,
  personalizationEnabled: true,
} as const;

describe('bounded profile personalization', () => {
  it('returns deterministic prepared coaching and allowlisted category suggestions', () => {
    const first = createPreparedProfilePersonalization(input);
    const second = createPreparedProfilePersonalization(input);

    expect(first).toEqual(second);
    expect(first).toMatchObject({
      ok: true,
      data: {
        enabled: true,
        coachingStyle: 'short_visual_steps',
        recommendedCategoryIds: ['green_impact', 'learning_wellbeing'],
        parentApprovalRequired: true,
        meta: {
          origin: 'prepared',
          localOnly: true,
          saysAiMayBeWrong: true,
          providerCalled: false,
        },
      },
    });
  });

  it('returns a bounded opt-out and rejects legacy gender, identity, and general free-text fields', () => {
    expect(
      createPreparedProfilePersonalization({ ...input, personalizationEnabled: false }),
    ).toMatchObject({
      ok: true,
      data: { enabled: false, recommendedCategoryIds: [], parentApprovalRequired: true },
    });

    for (const prohibited of [
      { gender: 'girl' },
      { nickname: 'Alya' },
      { familyName: 'Palm Family' },
      { importantInfo: 'private note' },
      { diagnosis: 'ADHD' },
      { emotion: 'sad' },
    ]) {
      expect(createPreparedProfilePersonalization({ ...input, ...prohibited })).toMatchObject({
        ok: false,
        error: { code: 'INVALID_INPUT' },
      });
    }
  });

  it('rejects unknown or duplicate curated values', () => {
    expect(
      createPreparedProfilePersonalization({
        ...input,
        interests: ['sustainability', 'sustainability'],
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(
      createPreparedProfilePersonalization({ ...input, hobbies: ['competitive_scoring'] }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
  });
});
