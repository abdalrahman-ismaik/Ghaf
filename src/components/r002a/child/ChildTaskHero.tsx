import { StyleSheet, View } from 'react-native';

import { GhafIcon } from '@/components/access';
import { LocalIllustration } from '@/components/illustrations';
import { Text } from '@/components/primitives';
import { botanical, colors, logicalRowDirection, spacing } from '@/design/tokens';
import type { TextDirection } from '@/models/familyGrowth';

interface ChildTaskHeroProps {
  awardLabel: string;
  categoryLabel: string;
  direction: TextDirection;
  effortLabel: string;
  statusLabel: string;
  title: string;
  variant?: 'active' | 'ready';
}

export function ChildTaskHero({
  awardLabel,
  categoryLabel,
  direction,
  effortLabel,
  statusLabel,
  title,
  variant = 'ready',
}: ChildTaskHeroProps) {
  return (
    <View style={styles.root}>
      {variant === 'ready' ? (
        <LocalIllustration
          assetId="task-recycling"
          decorative
          direction={direction}
          priority="high"
          style={styles.botanicalHero}
          testID="child-task-natural-hero"
        />
      ) : null}
      <View style={[styles.badges, { flexDirection: logicalRowDirection(direction) }]}>
        <View style={styles.statusBadge}>
          <Text brand color="onTertiaryFixed" direction={direction} variant="label">
            {statusLabel}
          </Text>
        </View>
        <View style={[styles.categoryBadge, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon color={botanical.colors.forestRaised} name="leaf" size={16} />
          <Text
            brand
            color="mangroveTeal"
            direction={direction}
            style={styles.metaLabel}
            variant="label"
          >
            {categoryLabel}
          </Text>
        </View>
      </View>
      <Text brand color="deepForest" direction={direction} variant="screenTitle">
        {title}
      </Text>
      <View style={[styles.metadata, { flexDirection: logicalRowDirection(direction) }]}>
        <View style={[styles.metaChip, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon color={colors.onSurfaceVariant} name="calendar" size={18} />
          <Text
            brand
            color="onSurfaceVariant"
            direction={direction}
            style={styles.metaLabel}
            variant="caption"
          >
            {effortLabel}
          </Text>
        </View>
        <View style={[styles.metaChip, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon color={botanical.colors.forest} name="energy-leaf" size={18} />
          <Text
            brand
            color="ghafEmerald"
            direction={direction}
            style={styles.metaLabel}
            variant="caption"
          >
            {awardLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'stretch',
    gap: spacing.md,
  },
  botanicalHero: {
    aspectRatio: 2,
    maxHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: botanical.radius.hero,
    backgroundColor: botanical.colors.sage,
  },
  badges: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  statusBadge: {
    maxWidth: '100%',
    minHeight: 34,
    justifyContent: 'center',
    borderRadius: botanical.radius.small,
    backgroundColor: botanical.colors.sage,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  categoryBadge: {
    maxWidth: '100%',
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xxs,
  },
  metadata: {
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  metaChip: {
    maxWidth: '100%',
    minHeight: 38,
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xs,
  },
  metaLabel: { minWidth: 0, flexShrink: 1 },
});
