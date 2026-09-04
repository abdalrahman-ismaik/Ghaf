import { StyleSheet, View } from 'react-native';

import { GhafIcon } from '@/components/access';
import { QuietButton, Text } from '@/components/primitives';
import { colors, logicalRowDirection, r001Radii, r001Shadows, spacing } from '@/design/tokens';
import type { TextDirection } from '@/models/familyGrowth';

interface ChildGardenProgressCardProps {
  actionLabel: string;
  canopyLabel: string;
  current: number;
  direction: TextDirection;
  onAction: () => void;
  progressLabel: string;
  remainingLabel: string;
  symbolicLabel: string;
  target: number;
  title: string;
}

export function ChildGardenProgressCard({
  actionLabel,
  canopyLabel,
  current,
  direction,
  onAction,
  progressLabel,
  remainingLabel,
  symbolicLabel,
  target,
  title,
}: ChildGardenProgressCardProps) {
  const safeTarget = Math.max(1, target);
  const progress = Math.min(100, Math.max(0, (current / safeTarget) * 100));

  return (
    <View style={styles.section}>
      <Text brand color="ghafEmerald" direction={direction} variant="screenTitle">
        {title}
      </Text>
      <View style={styles.card}>
        <View style={[styles.header, { flexDirection: logicalRowDirection(direction) }]}>
          <View style={styles.copy}>
            <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
              {progressLabel}
            </Text>
            <Text brand color="r001Ink" direction={direction} tabular variant="bodyLarge">
              {current} / {target}
            </Text>
          </View>
          <View style={styles.iconCircle}>
            <GhafIcon color={colors.ghafEmerald} name="flower" size={25} />
          </View>
        </View>

        <View
          accessibilityLabel={progressLabel}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: target, now: Math.min(current, target) }}
          style={styles.track}
          testID="child-garden-progress"
        >
          <View
            style={[
              styles.fill,
              { width: `${progress}%` },
              direction === 'rtl' ? styles.fillRtl : styles.fillLtr,
            ]}
          />
        </View>

        <View style={[styles.remaining, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon color={colors.deepForest} name="leaf" size={17} />
          <Text brand color="deepForest" direction={direction} style={styles.grow} variant="label">
            {remainingLabel}
          </Text>
        </View>
        <View style={[styles.canopy, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon color={colors.mangroveTeal} name="ghaf-tree" size={18} />
          <Text
            brand
            color="mangroveTeal"
            direction={direction}
            style={styles.grow}
            variant="caption"
          >
            {canopyLabel}
          </Text>
        </View>
        <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
          {symbolicLabel}
        </Text>
        <QuietButton
          brand
          direction={direction}
          icon={<GhafIcon color={colors.ghafEmerald} name="ghaf-tree" size={19} />}
          onPress={onAction}
          size="compact"
          testID="child-open-garden-button"
        >
          {actionLabel}
        </QuietButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  card: {
    gap: spacing.md,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.lg,
    ...r001Shadows.soft,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  iconCircle: {
    width: 48,
    height: 48,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerLowest,
  },
  track: {
    height: 12,
    overflow: 'hidden',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerHighest,
  },
  fill: {
    height: '100%',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.ghafEmerald,
  },
  fillRtl: {
    alignSelf: 'flex-end',
  },
  fillLtr: {
    alignSelf: 'flex-start',
  },
  remaining: {
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  canopy: {
    alignItems: 'flex-start',
    gap: spacing.xs,
    borderRadius: r001Radii.md,
    backgroundColor: colors.mangroveTealTint,
    padding: spacing.sm,
  },
  grow: {
    flex: 1,
    minWidth: 0,
  },
});
