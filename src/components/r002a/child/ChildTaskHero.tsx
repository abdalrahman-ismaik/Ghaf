import { StyleSheet, View } from 'react-native';

import { GhafIcon } from '@/components/access';
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
        <View aria-hidden style={styles.botanicalHero}>
          <View style={styles.heroHalo} />
          <View style={[styles.heroLeaf, styles.heroLeafOne]} />
          <View style={[styles.heroLeaf, styles.heroLeafTwo]} />
          <View style={styles.heroIcon}>
            <GhafIcon color={colors.ghafEmerald} name="ghaf-tree" size={58} />
          </View>
        </View>
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
  heroHalo: {
    position: 'absolute',
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: colors.surfaceContainerLowest,
    opacity: 0.94,
  },
  heroIcon: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 44,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  heroLeaf: {
    position: 'absolute',
    width: 54,
    height: 30,
    borderTopLeftRadius: 27,
    borderBottomRightRadius: 27,
    backgroundColor: colors.primaryFixed,
    opacity: 0.55,
  },
  heroLeafOne: {
    top: 18,
    left: 26,
    transform: [{ rotate: '-16deg' }],
  },
  heroLeafTwo: {
    right: 28,
    bottom: 18,
    transform: [{ rotate: '164deg' }],
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
