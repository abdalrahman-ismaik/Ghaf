import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/primitives';
import { colors, logicalRowDirection, r001Radii, r001Shadows, spacing } from '@/design/tokens';
import type { TextDirection } from '@/models/familyGrowth';

interface ParentCanopySummaryCardProps {
  current: number;
  direction: TextDirection;
  goal: number;
  meaning: string;
  progressLabel: string;
  remainingLabel: string;
  title: string;
}

export function ParentCanopySummaryCard({
  current,
  direction,
  goal,
  meaning,
  progressLabel,
  remainingLabel,
  title,
}: ParentCanopySummaryCardProps) {
  const ratio = goal > 0 ? Math.min(1, Math.max(0, current / goal)) : 0;
  const progressWidth = `${ratio * 100}%` as const;

  return (
    <View
      accessibilityLabel={`${title}. ${progressLabel}. ${remainingLabel}`}
      style={styles.card}
      testID="family-combined-canopy"
    >
      <View aria-hidden style={styles.botanicalWashOne} />
      <View aria-hidden style={styles.botanicalWashTwo} />
      <View style={styles.content}>
        <View style={[styles.headingRow, { flexDirection: logicalRowDirection(direction) }]}>
          <Text brand color="ghafEmerald" variant="screenTitle">
            {title}
          </Text>
          <Text brand color="ghafEmerald" tabular variant="label">
            {progressLabel}
          </Text>
        </View>
        <View
          accessibilityLabel={progressLabel}
          accessibilityRole="progressbar"
          accessibilityValue={{ max: goal, min: 0, now: current, text: progressLabel }}
          style={styles.progressTrack}
        >
          <View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <Text brand color="onSurfaceVariant" variant="caption">
          {remainingLabel}
        </Text>
        <Text brand color="onSurfaceVariant" variant="caption">
          {meaning}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 144,
    overflow: 'hidden',
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    backgroundColor: colors.surfaceBright,
    padding: spacing.xl,
    ...r001Shadows.soft,
  },
  content: {
    zIndex: 1,
    gap: spacing.sm,
  },
  headingRow: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  progressTrack: {
    height: spacing.xs,
    overflow: 'hidden',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerHigh,
  },
  progressFill: {
    height: '100%',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.ghafEmerald,
  },
  botanicalWashOne: {
    position: 'absolute',
    right: -28,
    bottom: -42,
    width: 126,
    height: 126,
    borderRadius: 63,
    backgroundColor: colors.ghafEmeraldTint,
  },
  botanicalWashTwo: {
    position: 'absolute',
    left: -24,
    bottom: -36,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.mangroveTealTint,
  },
});
