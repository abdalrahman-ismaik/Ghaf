import { beforeEach, describe, expect, it } from 'vitest';

import {
  createGrowthJourneyPresentation,
  type GrowthJourneyPresentationActions,
} from '@/features/growth/r002bViewModel';
import { projectR002bGrowthExperience } from '@/features/growth/presentation';
import { i18n } from '@/i18n';
import type { BadgeId } from '@/models/achievements';
import { usePrototypeStore } from '@/state/usePrototypeStore';

function projection() {
  const state = usePrototypeStore.getState();
  const result = projectR002bGrowthExperience({
    runtime: state.growthJourney,
    profileId: 'child_salem',
    journey: state.journey,
    learningCompletions: [],
    semanticCriterionEvidence: [],
  });
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

function translate(language: 'ar' | 'en') {
  const fixed = i18n.getFixedT(language);
  return (key: string, values: Record<string, string | number> = {}) => String(fixed(key, values));
}

function actions(overrides: Partial<GrowthJourneyPresentationActions> = {}) {
  return {
    openImpactPath: () => undefined,
    openBadges: () => undefined,
    openBadge: (_badgeId: BadgeId) => undefined,
    ...overrides,
  } satisfies GrowthJourneyPresentationActions;
}

describe('R002b Growth Journey view model', () => {
  beforeEach(() => {
    usePrototypeStore.setState(usePrototypeStore.getInitialState(), true);
  });

  it('keeps current Mangrove 48/60 distinct from cumulative lifetime 108 and next 120', () => {
    const model = createGrowthJourneyPresentation({
      projection: projection(),
      currentMangroveStage: { currentSeeds: 48, targetSeeds: 60 },
      language: 'ar',
      direction: 'rtl',
      reducedMotion: false,
      translate: translate('ar'),
      actions: actions(),
    });

    expect(model.today.lifetimeValue).toContain('108');
    expect(model.today.requirementText).toContain('12');
    expect(model.garden.currentStageValue).toContain('48');
    expect(model.garden.currentStageValue).toContain('60');
    expect(model.garden.lifetimeValue).toContain('108');
    expect(model.impactPath.currentChapterValue).toContain('120');
    expect(model.impactPath.currentChapterValue).toContain('180');
    expect(model.impactPath.stations.map((station) => station.id)).toEqual([
      'impact-path-station-120',
      'impact-path-station-132',
      'impact-path-station-144',
      'impact-path-station-156',
      'impact-path-station-168',
      'impact-path-station-180',
    ]);
  });

  it('renders only independently supplied Garden and Path entry actions', () => {
    const openImpactPath = () => undefined;
    const model = createGrowthJourneyPresentation({
      projection: projection(),
      currentMangroveStage: { currentSeeds: 48, targetSeeds: 60 },
      language: 'en',
      direction: 'ltr',
      reducedMotion: true,
      translate: translate('en'),
      actions: actions({ openImpactPath, openBadges: undefined }),
    });

    expect(model.today.action?.onPress).toBe(openImpactPath);
    expect(model.garden.entries.map((entry) => entry.id)).toEqual(['impact-path']);
    expect(model.impactPath.relatedActions).toEqual([]);
    expect(model.today.reducedMotion).toBe(true);
  });

  it('maps the exact 16-item registry without duplicate recommendation or mutation', () => {
    const source = projection();
    const before = structuredClone(source);
    const model = createGrowthJourneyPresentation({
      projection: source,
      currentMangroveStage: { currentSeeds: 48, targetSeeds: 60 },
      language: 'en',
      direction: 'ltr',
      reducedMotion: false,
      translate: translate('en'),
      actions: actions(),
    });

    expect(model.badgeGallery.items).toHaveLength(16);
    expect(new Set(model.badgeGallery.items.map((item) => item.id)).size).toBe(16);
    expect(model.badgeGallery.recommendedItemId).toBeTruthy();
    expect(
      model.badgeGallery.items.filter((item) => item.id === model.badgeGallery.recommendedItemId),
    ).toHaveLength(1);
    expect(source).toEqual(before);
  });

  it('shows every composite criterion and permits only a projected contextual action', () => {
    const openedThresholds: number[] = [];
    const openImpactStation = (threshold: number) => openedThresholds.push(threshold);
    const model = createGrowthJourneyPresentation({
      projection: projection(),
      currentMangroveStage: { currentSeeds: 48, targetSeeds: 60 },
      language: 'en',
      direction: 'ltr',
      reducedMotion: false,
      translate: translate('en'),
      actions: actions({ openImpactStation }),
      earnedAtByBadgeId: {
        'badge.journey.seed_start.v1': null,
      },
    });

    const mangrove = model.badgeDetail('badge.habitat.mangrove_care.v1');
    expect(mangrove?.criteria).toHaveLength(3);
    expect(mangrove?.criteria.map((criterion) => criterion.label).join(' ')).toContain('132');
    expect(mangrove?.action).toBeDefined();
    mangrove?.action?.onPress();
    expect(openedThresholds).toEqual([132]);

    const coastal = model.badgeDetail('badge.journey.coastal_care.v1');
    coastal?.action?.onPress();
    expect(openedThresholds).toEqual([132, 180]);

    const historical = model.badgeDetail('badge.journey.seed_start.v1');
    expect(historical?.historicalDateText).toBeTruthy();
    expect(historical?.earnedDateText).toBeUndefined();
    expect(model.badgeDetail('badge.unknown.v1')).toBeNull();
  });

  it('provides equivalent, non-placeholder Arabic and English candidate copy', () => {
    const base = {
      projection: projection(),
      currentMangroveStage: { currentSeeds: 48, targetSeeds: 60 },
      reducedMotion: false,
      actions: actions(),
    } as const;
    const arabic = createGrowthJourneyPresentation({
      ...base,
      language: 'ar',
      direction: 'rtl',
      translate: translate('ar'),
    });
    const english = createGrowthJourneyPresentation({
      ...base,
      language: 'en',
      direction: 'ltr',
      translate: translate('en'),
    });

    expect(arabic.impactPath.chapterTitle).toMatch(/[\u0600-\u06ff]/u);
    expect(english.impactPath.chapterTitle).toMatch(/Water|Coast/u);
    expect(JSON.stringify(arabic)).not.toMatch(/EN:S|TODO|placeholder/iu);
    expect(JSON.stringify(english)).not.toMatch(/EN:S|TODO|placeholder/iu);
    expect(arabic.badgeGallery.privacyNote).not.toBe(english.badgeGallery.privacyNote);
  });
});
