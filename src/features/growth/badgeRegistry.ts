import type {
  BadgeCriterion,
  BadgeDefinition,
  BadgeId,
  BadgeSourceNote,
} from '../../models/achievements';

export const MASTERY_LEVELS_AR = Object.freeze(['برعم', 'غصن', 'ظل'] as const);

const PENDING_WHY = Object.freeze({
  status: 'pending_human_copy_review' as const,
  ar: null,
  en: null,
});

function sourceNote(): BadgeSourceNote {
  return Object.freeze({
    criterionAuthority: 'docs/content/BADGE_CATALOG.md' as const,
    provenanceManifest: 'unavailable' as const,
    contentReview: 'not_run' as const,
    rightsReview: 'not_run' as const,
  });
}

function definition(input: {
  readonly id: BadgeId;
  readonly ar: string;
  readonly en: string;
  readonly criterionEn: string;
  readonly criteria: readonly BadgeCriterion[];
}): BadgeDefinition {
  return Object.freeze({
    id: input.id,
    label: Object.freeze({ ar: input.ar, en: input.en }),
    criterionText: Object.freeze({
      ar: null,
      en: input.criterionEn,
      status: 'arabic_copy_pending_human_review' as const,
    }),
    criteria: Object.freeze(input.criteria.map((criterion) => Object.freeze({ ...criterion }))),
    whyItMatters: PENDING_WHY,
    sourceNote: sourceNote(),
    privacy: 'private' as const,
    permanence: 'permanent' as const,
  });
}

export const BADGE_REGISTRY: readonly BadgeDefinition[] = Object.freeze([
  definition({
    id: 'badge.journey.seed_start.v1',
    ar: 'بذرة البداية',
    en: 'Seed Start',
    criterionEn: 'confirmed lifetime Seeds ≥ 12',
    criteria: [{ kind: 'lifetime_seeds', required: 12 }],
  }),
  definition({
    id: 'badge.journey.growing_branch.v1',
    ar: 'غصن نامٍ',
    en: 'Growing Branch',
    criterionEn: 'confirmed lifetime Seeds ≥ 60',
    criteria: [{ kind: 'lifetime_seeds', required: 60 }],
  }),
  definition({
    id: 'badge.journey.expanding_shade.v1',
    ar: 'ظلّ يتّسع',
    en: 'Expanding Shade',
    criterionEn: 'confirmed lifetime Seeds ≥ 120',
    criteria: [{ kind: 'lifetime_seeds', required: 120 }],
  }),
  definition({
    id: 'badge.journey.coastal_care.v1',
    ar: 'رعاية الساحل',
    en: 'Coastal Care',
    criterionEn: 'confirmed lifetime Seeds ≥ 180',
    criteria: [{ kind: 'lifetime_seeds', required: 180 }],
  }),
  definition({
    id: 'badge.skill.sorting.bud.v1',
    ar: 'الفرز الذكي — برعم',
    en: 'Smart Sorting — Bud',
    criterionEn: 'sorting acquisition credit ≥ 1',
    criteria: [{ kind: 'acquisition_credits', skillId: 'skill.sorting', required: 1 }],
  }),
  definition({
    id: 'badge.skill.sorting.branch.v1',
    ar: 'الفرز الذكي — غصن',
    en: 'Smart Sorting — Branch',
    criterionEn: 'Sorting Bud earned and sorting credit ≥ 3',
    criteria: [
      { kind: 'prerequisite_badge', badgeId: 'badge.skill.sorting.bud.v1' },
      { kind: 'acquisition_credits', skillId: 'skill.sorting', required: 3 },
    ],
  }),
  definition({
    id: 'badge.skill.sorting.shade.v1',
    ar: 'الفرز الذكي — ظل',
    en: 'Smart Sorting — Shade',
    criterionEn: 'Sorting Branch earned and sorting credit ≥ 7',
    criteria: [
      { kind: 'prerequisite_badge', badgeId: 'badge.skill.sorting.branch.v1' },
      { kind: 'acquisition_credits', skillId: 'skill.sorting', required: 7 },
    ],
  }),
  definition({
    id: 'badge.skill.water.bud.v1',
    ar: 'ترشيد المياه — برعم',
    en: 'Water Care — Bud',
    criterionEn: 'station 156 reached and water credit ≥ 2',
    criteria: [
      { kind: 'station_reached', threshold: 156 },
      { kind: 'acquisition_credits', skillId: 'skill.water', required: 2 },
    ],
  }),
  definition({
    id: 'badge.skill.water.branch.v1',
    ar: 'ترشيد المياه — غصن',
    en: 'Water Care — Branch',
    criterionEn: 'Water Bud earned and water credit ≥ 5',
    criteria: [
      { kind: 'prerequisite_badge', badgeId: 'badge.skill.water.bud.v1' },
      { kind: 'acquisition_credits', skillId: 'skill.water', required: 5 },
    ],
  }),
  definition({
    id: 'badge.skill.water.shade.v1',
    ar: 'ترشيد المياه — ظل',
    en: 'Water Care — Shade',
    criterionEn: 'Water Branch earned and water credit ≥ 10',
    criteria: [
      { kind: 'prerequisite_badge', badgeId: 'badge.skill.water.branch.v1' },
      { kind: 'acquisition_credits', skillId: 'skill.water', required: 10 },
    ],
  }),
  definition({
    id: 'badge.skill.energy.bud.v1',
    ar: 'ترشيد الطاقة — برعم',
    en: 'Energy Care — Bud',
    criterionEn: 'energy acquisition credit ≥ 2',
    criteria: [{ kind: 'acquisition_credits', skillId: 'skill.energy', required: 2 }],
  }),
  definition({
    id: 'badge.habitat.ghaf_roots.v1',
    ar: 'جذور الغاف',
    en: 'Ghaf Roots',
    criterionEn: '`learning.ghaf_basics.v1` complete and nature credit ≥ 3',
    criteria: [
      { kind: 'learning_completed', learningId: 'learning.ghaf_basics.v1' },
      { kind: 'acquisition_credits', skillId: 'skill.nature', required: 3 },
    ],
  }),
  definition({
    id: 'badge.habitat.mangrove_care.v1',
    ar: 'رعاية القرم',
    en: 'Mangrove Care',
    criterionEn:
      'station 132 reached, `learning.mangrove_roots.v1` complete, and coast-care credit ≥ 3',
    criteria: [
      { kind: 'station_reached', threshold: 132 },
      { kind: 'learning_completed', learningId: 'learning.mangrove_roots.v1' },
      { kind: 'acquisition_credits', skillId: 'skill.coast_care', required: 3 },
    ],
  }),
  definition({
    id: 'badge.biodiversity.wetland_exploration.v1',
    ar: 'استكشاف الأراضي الرطبة',
    en: 'Wetland Exploration',
    criterionEn: 'wetland learning and observation activity complete',
    criteria: [
      { kind: 'semantic_component', component: 'wetland_learning' },
      { kind: 'semantic_component', component: 'observation_activity' },
    ],
  }),
  definition({
    id: 'badge.heritage.date_palm_gifts.v1',
    ar: 'عطاء النخلة',
    en: 'Gifts of the Date Palm',
    criterionEn: 'date-palm learning and Parent-led reuse activity complete',
    criteria: [
      { kind: 'semantic_component', component: 'date_palm_learning' },
      { kind: 'semantic_component', component: 'parent_led_reuse_activity' },
    ],
  }),
  definition({
    id: 'badge.heritage.sadu_patterns.v1',
    ar: 'نقوش السدو',
    en: 'Al-Sadu Patterns',
    criterionEn: 'Sadu learning and original-pattern activity complete',
    criteria: [
      { kind: 'semantic_component', component: 'sadu_learning' },
      { kind: 'semantic_component', component: 'original_pattern_activity' },
    ],
  }),
]);

export const BADGE_IDS: readonly BadgeId[] = Object.freeze(BADGE_REGISTRY.map((item) => item.id));

const DEFINITIONS_BY_ID = new Map<BadgeId, BadgeDefinition>(
  BADGE_REGISTRY.map((item) => [item.id, item]),
);

export function getBadgeDefinition(id: string): BadgeDefinition | null {
  return DEFINITIONS_BY_ID.get(id as BadgeId) ?? null;
}
