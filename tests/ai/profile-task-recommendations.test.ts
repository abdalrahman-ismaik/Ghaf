import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  createPreparedTaskCategoryPlan,
  type ProfilePersonalizationInput,
} from '../../src/features/assistants/profilePersonalization';
import { TASK_CATEGORIES } from '../../src/features/tasks/demoContent';

const categoryIds = TASK_CATEGORIES.map((category) => category.id);
const profile: ProfilePersonalizationInput = {
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
};

describe('prepared profile recommendations in Task Builder', () => {
  it('moves at most two recommendations ahead of a stable exact-once catalog remainder', () => {
    const result = createPreparedTaskCategoryPlan(profile, categoryIds);

    expect(result).toMatchObject({
      ok: true,
      data: {
        recommendedCategoryIds: ['green_impact', 'learning_wellbeing'],
        recommendations: [
          { categoryId: 'green_impact', reasonCode: 'sustainability' },
          { categoryId: 'learning_wellbeing', reasonCode: 'simplerInstructions' },
        ],
        preselectedCategoryId: 'green_impact',
        parentApprovalRequired: true,
        meta: {
          origin: 'prepared',
          localOnly: true,
          saysAiMayBeWrong: true,
          providerCalled: false,
        },
      },
    });
    if (!result.ok) throw new Error('Expected a prepared task category plan');
    expect(result.data.orderedCategoryIds).toHaveLength(categoryIds.length);
    expect(new Set(result.data.orderedCategoryIds)).toEqual(new Set(categoryIds));
    expect(result.data.orderedCategoryIds.slice(2)).toEqual(
      categoryIds.filter((id) => !['green_impact', 'learning_wellbeing'].includes(id)),
    );
  });

  it('preserves canonical order and no preselection when the Parent opts out', () => {
    expect(
      createPreparedTaskCategoryPlan({ ...profile, personalizationEnabled: false }, categoryIds),
    ).toMatchObject({
      ok: true,
      data: {
        recommendedCategoryIds: [],
        recommendations: [],
        orderedCategoryIds: categoryIds,
        preselectedCategoryId: null,
        parentApprovalRequired: true,
      },
    });
  });

  it('fails closed for incomplete/duplicate catalogs and prohibited profile fields', () => {
    expect(createPreparedTaskCategoryPlan(profile, [...categoryIds, 'green_impact'])).toMatchObject(
      {
        ok: false,
        error: { code: 'INVALID_INPUT' },
      },
    );
    expect(
      createPreparedTaskCategoryPlan({ ...profile, nickname: 'private identity' }, categoryIds),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
  });

  it('renders prepared recommendations without changing executable-template authority', () => {
    const source = readFileSync(
      new URL('../../src/components/family-growth/ParentTaskComposer.tsx', import.meta.url),
      'utf8',
    );
    const resources = readFileSync(new URL('../../src/i18n/resources.ts', import.meta.url), 'utf8');

    expect(source).toContain('createPreparedTaskCategoryPlan');
    expect(source).toContain('recommendations={profileCategoryPlan?.recommendations ?? []}');
    expect(source).toContain('t(`profileRecommendations.${recommendation.reasonCode}`)');
    expect(source).toContain('recommendedCategoryIds.includes(category.id)');
    expect(source).toContain("t('taskNew.profileRecommended')");
    expect(source).toContain(
      "(template.catalogExecution || (isP0 && selectedChildId === 'child_salem'))",
    );
    expect(source).toContain(
      'const disabled = !isExecutableForSelection && !taskWorkspaceFeatureFlag',
    );
    expect(source).toContain("selectedChildId === 'child_salem'");
    expect(source).toContain('<CatalogParentReview');
    expect(resources).toContain('profileRecommended:');
    expect(resources).toContain('profileRecommendationDisclosure:');
  });

  it('binds each rationale to its recommended category and selected profile', () => {
    const first = createPreparedTaskCategoryPlan(profile, categoryIds);
    const second = createPreparedTaskCategoryPlan(
      { ...profile, interests: ['family_helping'], hobbies: [], accessibilityDefaults: [] },
      categoryIds,
    );
    if (!first.ok || !second.ok) throw new Error('Expected prepared category plans');
    expect(second.data.recommendations).toEqual([
      { categoryId: 'home_responsibility', reasonCode: 'familyHelping' },
    ]);
    for (const plan of [first.data, second.data]) {
      expect(plan.recommendations.map((entry) => entry.categoryId)).toEqual(
        plan.recommendedCategoryIds,
      );
    }
    expect(first.data.recommendations).toEqual([
      { categoryId: 'green_impact', reasonCode: 'sustainability' },
      { categoryId: 'learning_wellbeing', reasonCode: 'simplerInstructions' },
    ]);
  });
});
