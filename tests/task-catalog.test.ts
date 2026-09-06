import { describe, expect, it } from 'vitest';

import {
  CULTURAL_PHRASE_OPTIONS,
  P0_RECYCLING_TEMPLATE,
  TASK_CATEGORIES,
  TASK_TEMPLATES,
} from '../src/features/tasks/demoContent';
import { taskTemplateSchema } from '../src/features/tasks/validation';

const expectedCategoryMap = {
  faith_gratitude: 'sidr',
  roots_kinship: 'ghaf',
  home_responsibility: 'samar',
  green_impact: 'mangrove',
  food_hospitality: 'date_palm',
  heritage_etiquette: 'ghaf',
  kindness_community: 'samar',
  learning_wellbeing: 'sidr',
} as const;

function englishSafetyText(template: (typeof TASK_TEMPLATES)[number]): string {
  return [
    template.safety.adultPreCheck.en,
    template.safety.adultSecondCheck.en,
    ...template.safety.adultOwnedActions.map((item) => item.en),
    ...template.safety.childAllowedActions.map((item) => item.en),
    ...template.safety.excludedHazards.map((item) => item.en),
    template.safety.stopAndAskAdult.en,
    template.safety.routeConstraint?.en,
    template.safety.indoorAlternative?.en,
    template.safety.aftercare?.en,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

describe('Feature 003 curated task content', () => {
  it('defines all eight bilingual categories across all five landscape tracks', () => {
    expect(TASK_CATEGORIES).toHaveLength(8);
    expect(Object.fromEntries(TASK_CATEGORIES.map((item) => [item.id, item.landscapeId]))).toEqual(
      expectedCategoryMap,
    );
    expect(new Set(TASK_CATEGORIES.map((item) => item.landscapeId))).toEqual(
      new Set(['ghaf', 'samar', 'sidr', 'date_palm', 'mangrove']),
    );
    expect(TASK_CATEGORIES.every((item) => item.label.ar.trim() && item.label.en.trim())).toBe(
      true,
    );
  });

  it('keeps GI01 distinct from the 12-Seed recurrence-once P0 task', () => {
    const gi01 = TASK_TEMPLATES.find((template) => template.id === 'GI01');

    expect(gi01).toMatchObject({
      categoryId: 'green_impact',
      landscapeId: 'mangrove',
      recognitionMode: 'fade_first',
      routinePhase: 'acquisition',
      displayedSeedAward: 8,
      visibilityScope: 'household',
      circleEligible: true,
    });
    expect(P0_RECYCLING_TEMPLATE).toMatchObject({
      id: 'task_recycling_p0_v1',
      categoryId: 'green_impact',
      landscapeId: 'mangrove',
      recognitionMode: 'standard',
      routinePhase: 'acquisition',
      recurrence: 'once',
      displayedSeedAward: 12,
      visibilityScope: 'household',
      circleEligible: true,
      evidencePolicy: 'optional_prepared_only',
      reflectionPolicy: 'optional_task_focused',
    });
  });

  it('keeps every required recycling hazard and adult-owned action explicit', () => {
    const safety = englishSafetyText(P0_RECYCLING_TEMPLATE);

    for (const required of [
      'adult',
      'glass',
      'sharp',
      'batter',
      'chemical',
      'medicine',
      'spoiled',
      'leaking',
      'unknown',
      'road crossing',
      'vehicle',
      'compactor',
      'chute',
      'bin-room',
      'heat',
      'traffic',
      'carry',
      'disposal',
      'wash',
    ]) {
      expect(safety, required).toContain(required);
    }
  });

  it('keeps hot gahwa adult-owned and general waste outside Green/circle credit', () => {
    const hospitality = TASK_TEMPLATES.find((template) => template.id === 'FH04');
    const generalWaste = TASK_TEMPLATES.find((template) => template.id === 'HR05');

    expect(hospitality && englishSafetyText(hospitality)).toContain('hot gahwa');
    expect(
      hospitality?.safety.childAllowedActions.map((item) => item.en.toLowerCase()).join(' '),
    ).not.toContain('hot gahwa');
    expect(generalWaste).toMatchObject({
      categoryId: 'home_responsibility',
      landscapeId: 'samar',
      circleEligible: false,
    });
  });

  it('excludes food/body pressure and keeps faith and affection-related tasks nontransactional', () => {
    const fh01 = TASK_TEMPLATES.find((template) => template.id === 'FH01');
    if (!fh01) throw new Error('Expected FH01 food-care fixture');

    const foodText = TASK_TEMPLATES.filter((template) => template.categoryId === 'food_hospitality')
      .map((template) => `${template.title.en} ${template.positiveAction.en}`.toLowerCase())
      .join(' ');

    for (const prohibited of ['weight', 'calorie', 'diet', 'clean plate', 'finish every bite']) {
      expect(foodText).not.toContain(prohibited);
    }

    for (const templateId of ['FA01', 'FA02', 'RK04', 'KC01']) {
      expect(TASK_TEMPLATES.find((template) => template.id === templateId)).toMatchObject({
        recognitionMode: 'recognition_only',
        routinePhase: 'not_applicable',
        displayedSeedAward: null,
        circleEligible: false,
      });
    }

    expect(taskTemplateSchema.safeParse(fh01).success).toBe(true);
    expect(
      taskTemplateSchema.safeParse({
        ...fh01,
        positiveAction: { ar: 'إنهاء كل الطعام', en: 'Finish every bite on the clean plate' },
        displayedSeedAward: 12,
      }).success,
    ).toBe(false);
  });

  it('offers multiple Parent-approved cultural phrases without one universal correct answer', () => {
    const greetings = CULTURAL_PHRASE_OPTIONS.find(
      (group) => group.situation === 'general_greeting',
    );
    const weddings = CULTURAL_PHRASE_OPTIONS.find(
      (group) => group.situation === 'wedding_congratulations',
    );

    expect(greetings?.options.length).toBeGreaterThanOrEqual(3);
    expect(weddings?.options.length).toBeGreaterThanOrEqual(3);
    for (const group of CULTURAL_PHRASE_OPTIONS) {
      expect(group).toMatchObject({
        parentApprovalRequired: true,
        namedHumanReviewRequired: true,
      });
      expect(group.options.every((option) => option.ar.trim() && option.en.trim())).toBe(true);
      expect(group).not.toHaveProperty('correctOptionId');
    }
  });
});
