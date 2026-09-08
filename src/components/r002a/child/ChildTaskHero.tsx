import { StyleSheet, View } from 'react-native';

import { GhafIcon } from '@/components/access';
import { LocalIllustration } from '@/components/illustrations';
import { Text } from '@/components/primitives';
import { colors, logicalRowDirection, r001Radii, r001Shadows, spacing } from '@/design/tokens';
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
        <View style={styles.categoryBadge}>
          <GhafIcon color={colors.mangroveTeal} name="leaf" size={16} />
          <Text brand color="mangroveTeal" direction={direction} variant="label">
            {categoryLabel}
          </Text>
        </View>
      </View>
      <Text align="center" brand color="deepForest" direction={direction} variant="screenTitle">
        {title}
      </Text>
      <View style={[styles.metadata, { flexDirection: logicalRowDirection(direction) }]}>
        <View style={[styles.metaChip, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon color={colors.onSurfaceVariant} name="calendar" size={18} />
          <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
            {effortLabel}
          </Text>
        </View>
        <View style={[styles.metaChip, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon color={colors.ghafEmerald} name="energy-leaf" size={18} />
          <Text brand color="ghafEmerald" direction={direction} variant="caption">
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
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: r001Radii.xl,
    backgroundColor: colors.primaryFixedTint,
    ...r001Shadows.soft,
  },
  badges: {
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  statusBadge: {
    minHeight: 34,
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.tertiaryFixedDim,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxs,
  },
  categoryBadge: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.mangroveTealTint,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  metadata: {
    alignItems: 'stretch',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  metaChip: {
    minHeight: 38,
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
