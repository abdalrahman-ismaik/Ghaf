import { describe, expect, it } from 'vitest';

import {
  createPreparedProfilePersonalization,
  type ProfilePersonalizationInput,
} from '../../src/features/assistants/profilePersonalization';
import { profileRecommendationResources } from '../../src/i18n/profileRecommendationResources';

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
        recommendations: [
          { categoryId: 'green_impact', reasonCode: 'sustainability' },
          { categoryId: 'learning_wellbeing', reasonCode: 'simplerInstructions' },
        ],
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
      data: {
        enabled: false,
        recommendedCategoryIds: [],
        recommendations: [],
        parentApprovalRequired: true,
      },
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

  it.each([
    {
      field: 'interests',
      value: 'sustainability',
      category: 'green_impact',
      reason: 'sustainability',
    },
    { field: 'interests', value: 'nature', category: 'green_impact', reason: 'nature' },
    { field: 'hobbies', value: 'gardening', category: 'green_impact', reason: 'gardening' },
    { field: 'interests', value: 'stories', category: 'learning_wellbeing', reason: 'stories' },
    { field: 'hobbies', value: 'reading', category: 'learning_wellbeing', reason: 'reading' },
    { field: 'hobbies', value: 'puzzles', category: 'learning_wellbeing', reason: 'puzzles' },
    {
      field: 'accessibilityDefaults',
      value: 'simpler_instructions',
      category: 'learning_wellbeing',
      reason: 'simplerInstructions',
    },
    {
      field: 'interests',
      value: 'family_helping',
      category: 'home_responsibility',
      reason: 'familyHelping',
    },
    { field: 'interests', value: 'making', category: 'kindness_community', reason: 'making' },
    { field: 'hobbies', value: 'drawing', category: 'kindness_community', reason: 'drawing' },
  ])('explains the actual $field match $value', ({ field, value, category, reason }) => {
    const result = createPreparedProfilePersonalization({
      ...input,
      interests: [],
      hobbies: [],
      accessibilityDefaults: [],
      [field]: [value],
    });
    expect(result).toMatchObject({
      ok: true,
      data: {
        recommendedCategoryIds: [category],
        recommendations: [{ categoryId: category, reasonCode: reason }],
      },
    });
    if (!result.ok) throw new Error('Expected a prepared reason');
    for (const recommendation of result.data.recommendations) {
      expect(profileRecommendationResources.ar[recommendation.reasonCode]).toBeTruthy();
      expect(profileRecommendationResources.en[recommendation.reasonCode]).toBeTruthy();
    }
  });

  it('explains custom matches without copying private descriptions into the result', () => {
    const customInterest = 'Gardening near our private family kitchen';
    const result = createPreparedProfilePersonalization({
      ...input,
      interests: [],
      hobbies: [],
      accessibilityDefaults: [],
      customInterest,
    });
    expect(result).toMatchObject({
      ok: true,
      data: {
        recommendations: [
          { categoryId: 'green_impact', reasonCode: 'customInterestMatch' },
          { categoryId: 'home_responsibility', reasonCode: 'customInterestMatch' },
        ],
      },
    });
    expect(JSON.stringify(result)).not.toContain(customInterest);
    expect(JSON.stringify(result)).not.toContain('private family kitchen');
  });

  it('identifies a generic starting point without inventing a matching preference', () => {
    const result = createPreparedProfilePersonalization({
      ...input,
      interests: [],
      hobbies: ['sports'],
      accessibilityDefaults: [],
    });
    expect(result).toMatchObject({
      ok: true,
      data: {
        recommendations: [{ categoryId: 'home_responsibility', reasonCode: 'practicalStart' }],
      },
    });
  });

  it('retains original category priority and cap when curated and custom matches overlap', () => {
    const selected: ProfilePersonalizationInput = {
      ...input,
      interests: ['making', 'family_helping'],
      hobbies: ['gardening', 'reading', 'drawing'],
      accessibilityDefaults: [],
      customInterest: 'A garden and books',
    };
    expect(createPreparedProfilePersonalization(selected)).toMatchObject({
      ok: true,
      data: {
        recommendedCategoryIds: ['green_impact', 'learning_wellbeing'],
        recommendations: [
          { categoryId: 'green_impact', reasonCode: 'gardening' },
          { categoryId: 'learning_wellbeing', reasonCode: 'reading' },
        ],
      },
    });
    expect(Object.keys(profileRecommendationResources.ar).sort()).toEqual(
      Object.keys(profileRecommendationResources.en).sort(),
    );
  });
});
