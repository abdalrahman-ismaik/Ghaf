import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ChoiceChip } from '@/components/access';
import {
  GardenLandscape,
  type LandscapeTrackContent,
} from '@/components/family-growth/GardenLandscape';
import { Text } from '@/components/primitives';
import { botanical, logicalRowDirection, spacing } from '@/design/tokens';
import type {
  CloudChild,
  CloudCommand,
  CloudCommandResult,
  CloudLandscapeId,
  CloudSnapshot,
} from '@/models/normalizedCloudFamily';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export interface CloudGrowthPanelProps {
  readonly snapshot: CloudSnapshot;
  readonly busy: boolean;
  readonly command: (command: CloudCommand) => Promise<CloudCommandResult | null>;
}

const landscapes: readonly CloudLandscapeId[] = ['mangrove', 'ghaf', 'samar', 'sidr', 'date_palm'];

export function visibleCloudChildren(snapshot: CloudSnapshot): CloudChild[] {
  return snapshot.children.filter(
    (child) =>
      child.active &&
      child.family_id === snapshot.actor.family_id &&
      (snapshot.actor.role === 'parent' || child.id === snapshot.actor.child_id),
  );
}

export function CloudGrowthChildPicker({
  profiles,
  selectedId,
  onSelect,
  disabled,
  label,
}: {
  readonly profiles: readonly CloudChild[];
  readonly selectedId: string;
  readonly onSelect: (id: string) => void;
  readonly disabled: boolean;
  readonly label: string;
}) {
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  return (
    <View style={cloudGrowthStyles.section}>
      <Text brand direction={direction} language={locale} variant="label">
        {label}
      </Text>
      <View style={[cloudGrowthStyles.wrap, { flexDirection: logicalRowDirection(direction) }]}>
        {profiles.map((child) => (
          <ChoiceChip
            key={child.id}
            direction={direction}
            language={locale}
            disabled={disabled}
            selected={selectedId === child.id}
            label={child.nickname}
            onPress={() => onSelect(child.id)}
            testID={`cloud-growth-child-${child.id}`}
          />
        ))}
      </View>
    </View>
  );
}

export function GrowthPanel({ snapshot, busy }: CloudGrowthPanelProps) {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const [selectedId, setSelectedId] = useState('');
  const [activeLandscape, setActiveLandscape] = useState<CloudLandscapeId>('mangrove');
  const children = visibleCloudChildren(snapshot);
  const child = children.find((item) => item.id === selectedId) ?? children[0];
  const text = (key: string, values?: Record<string, string | number>) =>
    t(`normalizedCloudFamily.growth.${key}`, values);
  const childProgress = snapshot.landscape_progress.filter((entry) => entry.child_id === child?.id);
  const total = snapshot.seed_entries
    .filter((entry) => entry.child_id === child?.id)
    .reduce((sum, entry) => sum + entry.amount, 0);
  const badges = snapshot.extras.learning.badges.filter((badge) => badge.childId === child?.id);
  const impactPath = snapshot.impact_paths.find((entry) => entry.child_id === child?.id);
  const tracks = {} as Record<CloudLandscapeId, LandscapeTrackContent>;
  const hasTracks = landscapes.every((id) =>
    childProgress.some((entry) => entry.landscape_id === id),
  );
  if (hasTracks) {
    for (const id of landscapes) {
      const entry = childProgress.find((item) => item.landscape_id === id)!;
      const name = text(`landscapes.${id}`);
      const target = entry.next_threshold ?? entry.cumulative_seeds;
      tracks[id] = {
        accessibilityLabel: `${name}: ${text(`stages.${entry.stage}`)}`,
        categoryLabel: name,
        cumulativeSeeds: entry.cumulative_seeds,
        name,
        progressLabel: text('landscapeProgress', { count: entry.cumulative_seeds, target }),
        stage: entry.stage,
        stageLabel: text(`stages.${entry.stage}`),
        targetSeeds: target,
      };
    }
  }
  const criterionText = (criterion: unknown): string => {
    if (!criterion || typeof criterion !== 'object') return text('criterionUnavailable');
    const item = criterion as Record<string, unknown>;
    if (
      (item.kind === 'lifetime_seeds' || item.kind === 'station_reached') &&
      typeof (item.required ?? item.threshold) === 'number'
    ) {
      return text('threshold', { count: (item.required ?? item.threshold) as number });
    }
    if (
      item.kind === 'acquisition_credits' &&
      typeof item.required === 'number' &&
      typeof item.skillId === 'string'
    ) {
      return text('credits', {
        count: item.required,
        skill: text(`skills.${item.skillId.replace(/^skill\./, '')}`),
      });
    }
    if (item.kind === 'prerequisite_badge') {
      const prerequisite = badges.find((badge) => badge.id === item.badgeId);
      return prerequisite
        ? text('prerequisite', {
            name: locale === 'ar' ? prerequisite.labelAr : prerequisite.labelEn,
          })
        : text('criterionUnavailable');
    }
    if (item.kind === 'learning_completed') {
      const learning = snapshot.extras.learning.packages.find(
        (entry) => entry.id === item.learningId,
      );
      const name = learning
        ? locale === 'ar'
          ? learning.labelAr
          : learning.labelEn
        : item.learningId === 'learning.ghaf_basics.v1'
          ? text('ghafLearning')
          : null;
      return name ? text('learningCriterion', { name }) : text('criterionUnavailable');
    }
    if (item.kind === 'semantic_component' && typeof item.component === 'string') {
      return text('activity', { name: text(`components.${item.component}`) });
    }
    return text('criterionUnavailable');
  };

  return (
    <View style={cloudGrowthStyles.panel} testID="cloud-growth-panel">
      <Text
        brand
        direction={direction}
        language={locale}
        variant="screenTitle"
        accessibilityRole="header"
      >
        {text('title')}
      </Text>
      <Text brand direction={direction} language={locale} variant="body">
        {text('body')}
      </Text>
      {!child ? (
        <Text brand direction={direction} language={locale}>
          {text('empty')}
        </Text>
      ) : (
        <>
          {snapshot.actor.role === 'parent' ? (
            <CloudGrowthChildPicker
              profiles={children}
              selectedId={child.id}
              onSelect={setSelectedId}
              disabled={busy}
              label={text('chooseChild')}
            />
          ) : null}
          <Text
            brand
            direction={direction}
            language={locale}
            variant="heading"
            style={cloudGrowthStyles.numbers}
            testID="cloud-growth-seeds"
          >
            {text('seeds', { count: total })}
          </Text>
          {total === 0 ? (
            <Text brand direction={direction} language={locale}>
              {text('noProgress')}
            </Text>
          ) : null}
          <View style={[cloudGrowthStyles.wrap, { flexDirection: logicalRowDirection(direction) }]}>
            {landscapes.map((id) => (
              <ChoiceChip
                key={id}
                direction={direction}
                language={locale}
                disabled={busy}
                label={text(`landscapes.${id}`)}
                selected={activeLandscape === id}
                onPress={() => setActiveLandscape(id)}
                testID={`cloud-landscape-${id}`}
              />
            ))}
          </View>
          {hasTracks ? (
            <GardenLandscape
              activeLandscapeId={activeLandscape}
              tracks={tracks}
              accessibilityLabel={text('garden')}
              testID="cloud-garden-landscape"
              labels={{
                activeTrack: text('active'),
                inspiredBy: text('garden'),
                symbolicDisclosure: text('symbolic'),
              }}
            />
          ) : (
            <Text brand direction={direction} language={locale}>
              {text('unavailable')}
            </Text>
          )}
          {impactPath ? (
            <View style={cloudGrowthStyles.section} testID="cloud-impact-path">
              <Text brand direction={direction} language={locale} variant="heading">
                {text('impactPath')}
              </Text>
              <Text brand direction={direction} language={locale}>
                {text('impactBody')}
              </Text>
              <Text brand direction={direction} language={locale} variant="label">
                {text(`chapter.${impactPath.chapter_state}`)}
              </Text>
              {[120, 132, 144, 156, 168, 180].map((threshold) => (
                <View key={threshold} style={cloudGrowthStyles.rule}>
                  <Text brand direction={direction} language={locale}>
                    {text('station', { count: threshold })}
                  </Text>
                  <Text
                    brand
                    direction={direction}
                    language={locale}
                    color={
                      impactPath.reached_thresholds.includes(threshold)
                        ? 'ghafEmerald'
                        : 'onSurfaceVariant'
                    }
                  >
                    {text(
                      impactPath.reached_thresholds.includes(threshold) ? 'reached' : 'upcoming',
                    )}
                  </Text>
                </View>
              ))}
              {impactPath.next_threshold !== null ? (
                <Text brand direction={direction} language={locale}>
                  {text('nextStation', { count: impactPath.next_threshold })}
                </Text>
              ) : null}
            </View>
          ) : null}
          <View style={cloudGrowthStyles.section}>
            <Text brand direction={direction} language={locale} variant="heading">
              {text('badges')}
            </Text>
            <Text brand direction={direction} language={locale}>
              {text('badgeBody')}
            </Text>
            {badges.length === 0 ? (
              <Text brand direction={direction} language={locale}>
                {text('noBadges')}
              </Text>
            ) : null}
            {badges.map((badge) => (
              <View
                key={badge.id}
                style={cloudGrowthStyles.rule}
                testID={`cloud-badge-${badge.id}`}
              >
                <Text brand direction={direction} language={locale} variant="label">
                  {locale === 'ar' ? badge.labelAr : badge.labelEn}
                </Text>
                <Text
                  brand
                  direction={direction}
                  language={locale}
                  color={badge.earnedAt ? 'ghafEmerald' : 'onSurfaceVariant'}
                >
                  {text(badge.earnedAt ? 'earned' : 'notEarned')}
                </Text>
                {(Array.isArray(badge.criteria) ? badge.criteria : []).map(
                  (criterion: unknown, index: number) => (
                    <Text
                      key={index}
                      brand
                      direction={direction}
                      language={locale}
                      variant="caption"
                    >
                      {criterionText(criterion)}
                    </Text>
                  ),
                )}
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

export const cloudGrowthStyles = StyleSheet.create({
  panel: { gap: spacing.lg },
  section: { gap: spacing.sm },
  numbers: { fontVariant: ['tabular-nums'] },
  wrap: { flexWrap: 'wrap', gap: spacing.sm },
  rule: {
    borderTopColor: botanical.colors.line,
    borderTopWidth: 1,
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
});
