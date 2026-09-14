import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { BadgeGallery, ImpactPathScreen } from '@/components/r002b/GrowthJourneyScreens';
import { BADGE_REGISTRY } from '@/features/growth/badgeRegistry';
import type { BadgeCriterion, BadgeDefinition, BadgeId } from '@/models/achievements';
import type { CloudGrowthChild } from '@/models/cloudGrowth';
import { IMPACT_PATH_STATIONS } from '@/models/growthJourney';
import { useReducedMotionPreference } from '@/utils/useReducedMotionPreference';

import { GrowthButton, GrowthText, growthStyles as s, useGrowthCopy } from './common';

export function CloudImpactPath({
  child,
  onOpenLearning,
}: {
  readonly child: CloudGrowthChild;
  readonly onOpenLearning?: () => void;
}) {
  const { text, t, locale, direction, number } = useGrowthCopy();
  const reducedMotion = useReducedMotionPreference();
  const stations = IMPACT_PATH_STATIONS.map(({ threshold }) => {
    const reached = child.lifetimeSeeds >= threshold;
    return {
      id: String(threshold),
      title: text(`station${threshold}`),
      criterionText: text(`station${threshold}Body`),
      thresholdLabel: text('station', { count: number(threshold) }),
      state: reached ? ('reached' as const) : ('locked' as const),
      statusLabel: text(reached ? 'reached' : 'upcoming'),
      accessibilityLabel: `${text(`station${threshold}`)}. ${text('station', { count: number(threshold) })}. ${text(reached ? 'reached' : 'upcoming')}`,
      ...(threshold === 132 && reached && onOpenLearning
        ? {
            action: {
              label: text('learning'),
              accessibilityLabel: text('learning'),
              onPress: onOpenLearning,
            },
          }
        : {}),
    };
  });
  return (
    <View style={s.stack}>
      <ImpactPathScreen
        direction={direction}
        language={locale}
        reducedMotion={reducedMotion}
        archiveLabel={t('r002bParentProgress.archive.heading')}
        archiveValue={
          child.landscapeSeeds.mangrove >= 60
            ? t('r002bGrowth.chapter.archiveValue', {
                current: number(child.landscapeSeeds.mangrove),
                target: number(60),
              })
            : t('r002bGrowth.chapter.archivePendingValue')
        }
        chapterTitle={t('r002bGrowth.chapter.title')}
        contentState={
          child.lifetimeSeeds >= 180
            ? 'complete'
            : child.lifetimeSeeds < 120
              ? 'not_entered'
              : 'ready'
        }
        currentChapterLabel={t('r002bGrowth.chapter.currentChapter')}
        currentChapterValue={t('r002bGrowth.chapter.range', {
          start: number(120),
          end: number(180),
        })}
        disclosureText={text('permanent')}
        groupLabel={text('path')}
        lifetimeLabel={t('r002bGrowth.chapter.lifetime')}
        lifetimeValue={number(child.lifetimeSeeds)}
        stations={stations}
        statusLabel={text(child.lifetimeSeeds >= 180 ? 'reached' : 'upcoming')}
        summaryText={text('pathBody')}
        testID="cloud-impact-path"
      />
      {child.lifetimeSeeds === 0 ? <GrowthText>{text('noProgress')}</GrowthText> : null}
      {child.learningCompleted.includes('learning.mangrove_roots.v1') ? (
        <GrowthText>{t('cloudDocuments.learningSaved')}</GrowthText>
      ) : null}
      {child.lifetimeSeeds < 132 ? <GrowthText>{text('learningLocked')}</GrowthText> : null}
    </View>
  );
}

const skillKeys = {
  'skill.sorting': 'sorting',
  'skill.coast_care': 'coastCare',
  'skill.water': 'water',
  'skill.energy': 'energy',
  'skill.nature': 'nature',
} as const;
const semanticKeys = {
  wetland_learning: 'wetlandLearning',
  observation_activity: 'observationActivity',
  date_palm_learning: 'datePalmLearning',
  parent_led_reuse_activity: 'parentReuseActivity',
  sadu_learning: 'saduLearning',
  original_pattern_activity: 'originalPatternActivity',
} as const;

export function CloudBadges({
  child,
  onOpenLearning,
  onDetailChange,
}: {
  readonly child: CloudGrowthChild;
  readonly onOpenLearning?: () => void;
  readonly onDetailChange?: (dismiss: (() => void) | null) => void;
}) {
  const { text, t, locale, direction, number } = useGrowthCopy();
  const reducedMotion = useReducedMotionPreference();
  const [selected, setSelected] = useState<BadgeId | null>(null);
  useEffect(() => {
    onDetailChange?.(selected ? () => setSelected(null) : null);
    return () => onDetailChange?.(null);
  }, [onDetailChange, selected]);
  const awards = new Map(child.badges.map((award) => [award.badgeId, award]));
  const criterionText = (criterion: BadgeCriterion): string => {
    const key = 'r002bGrowth.badges.criteria';
    if (criterion.kind === 'lifetime_seeds')
      return t(`${key}.lifetimeSeeds`, {
        current: number(child.lifetimeSeeds),
        required: number(criterion.required),
      });
    if (criterion.kind === 'station_reached')
      return t(`${key}.stationReached`, { threshold: number(criterion.threshold) });
    if (criterion.kind === 'acquisition_credits') {
      const current =
        criterion.skillId === 'skill.sorting'
          ? child.sortingCredits
          : criterion.skillId === 'skill.coast_care'
            ? child.coastCareCredits
            : 0;
      return t(`${key}.acquisitionCredits`, {
        current: number(current),
        required: number(criterion.required),
        skill: t(`r002bGrowth.badges.skills.${skillKeys[criterion.skillId]}`),
      });
    }
    if (criterion.kind === 'prerequisite_badge')
      return t(`${key}.prerequisiteBadge`, {
        badge:
          BADGE_REGISTRY.find((definition) => definition.id === criterion.badgeId)?.label[locale] ??
          '',
      });
    if (criterion.kind === 'learning_completed')
      return criterion.learningId === 'learning.mangrove_roots.v1'
        ? t(`${key}.learningCompleted`)
        : text('ghafLearningRequired');
    return t(`${key}.semantic.${semanticKeys[criterion.component]}`);
  };
  const missingContent = (definition: BadgeDefinition) =>
    definition.criteria.some(
      (criterion) =>
        criterion.kind === 'semantic_component' ||
        (criterion.kind === 'learning_completed' &&
          criterion.learningId !== 'learning.mangrove_roots.v1') ||
        (criterion.kind === 'acquisition_credits' &&
          !['skill.sorting', 'skill.coast_care'].includes(criterion.skillId)),
    );
  const items = BADGE_REGISTRY.map((definition) => {
    const earned = awards.has(definition.id);
    const title = definition.label[locale];
    const criteria = definition.criteria.map(criterionText).join(' · ');
    return {
      id: definition.id,
      title,
      state: earned ? ('earned' as const) : ('locked' as const),
      criterionText: criteria,
      progressText: earned ? text('earned') : text('unearned'),
      statusLabel: earned ? text('earned') : text('unearned'),
      accessibilityLabel: `${title}. ${earned ? text('earned') : text('unearned')}. ${criteria}`,
      onPress: () => setSelected(definition.id),
      testID: `cloud-badge-${definition.id}`,
    };
  });
  const detail = BADGE_REGISTRY.find((definition) => definition.id === selected);
  if (detail) {
    const award = awards.get(detail.id);
    return (
      <View style={s.card} testID="cloud-badge-detail">
        <GrowthButton variant="secondary" onPress={() => setSelected(null)}>
          {text('back')}
        </GrowthButton>
        <GrowthText variant="heading" accessibilityRole="header">
          {detail.label[locale]}
        </GrowthText>
        <GrowthText>{text(award ? 'earned' : 'unearned')}</GrowthText>
        {award ? (
          <GrowthText>
            {text('badgeDate', {
              date: new Intl.DateTimeFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
                dateStyle: 'medium',
              }).format(new Date(award.awardedAt)),
            })}
          </GrowthText>
        ) : null}
        <GrowthText>{text('criteria')}</GrowthText>
        {detail.criteria.map((criterion, index) => (
          <GrowthText key={index}>{criterionText(criterion)}</GrowthText>
        ))}
        {missingContent(detail) ? <GrowthText>{text('evidenceUnavailable')}</GrowthText> : null}
        <GrowthText>{text('private')}</GrowthText>
        {detail.id === 'badge.habitat.mangrove_care.v1' &&
        child.lifetimeSeeds >= 132 &&
        onOpenLearning ? (
          <GrowthButton onPress={onOpenLearning}>{text('learning')}</GrowthButton>
        ) : null}
      </View>
    );
  }
  return (
    <BadgeGallery
      direction={direction}
      language={locale}
      reducedMotion={reducedMotion}
      chapterTitle={text('badges')}
      contentState="ready"
      description={text('badgeBody')}
      groupLabel={text('badges')}
      items={items}
      privacyNote={text('private')}
      statusLabel={text('seeds', { count: number(child.lifetimeSeeds) })}
      testID="cloud-badge-gallery"
    />
  );
}
