import { Platform, StyleSheet, View } from 'react-native';
import { YStack } from 'tamagui';

import { LocalIllustration } from '@/components/illustrations';
import { Text } from '@/components/primitives';
import { nativeViewStyles } from '@/design/nativeStyles';
import { botanical, logicalRowDirection, spacing } from '@/design/tokens';
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
    <YStack
      {...(Platform.OS === 'web'
        ? { 'aria-label': `${title}. ${progressLabel}. ${remainingLabel}` }
        : { accessibilityLabel: `${title}. ${progressLabel}. ${remainingLabel}` })}
      {...nativeViewStyles(styles.card)}
      testID="family-combined-canopy"
    >
      <View style={[styles.landscapeRow, { flexDirection: logicalRowDirection(direction) }]}>
        <View style={styles.landscapeCopy}>
          <Text brand direction={direction} style={styles.forestText} variant="heading">
            {title}
          </Text>
        </View>
        <LocalIllustration
          assetId={current >= 20 ? 'family-canopy-20' : 'family-canopy-19'}
          decorative
          direction={direction}
          priority="high"
          style={styles.landscape}
          testID="parent-canopy-artwork"
        />
      </View>
      <View style={styles.content}>
        <View style={[styles.headingRow, { flexDirection: logicalRowDirection(direction) }]}>
          <Text brand style={[styles.headingText, styles.onForestText]} tabular variant="label">
            {progressLabel}
          </Text>
        </View>
        <View
          accessibilityLabel={progressLabel}
          accessibilityRole="progressbar"
          accessibilityValue={{ max: goal, min: 0, now: current, text: progressLabel }}
          style={[
            styles.progressTrack,
            { alignItems: direction === 'rtl' ? 'flex-end' : 'flex-start' },
          ]}
        >
          <View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <Text brand style={styles.onForestText} variant="caption">
          {remainingLabel}
        </Text>
        <Text brand direction={direction} style={styles.meaningText} variant="caption">
          {meaning}
        </Text>
      </View>
    </YStack>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: botanical.radius.hero,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.sage,
  },
  landscapeRow: {
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.sm,
    padding: botanical.space.inset,
  },
  landscapeCopy: {
    minWidth: 0,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 100,
    gap: spacing.sm,
  },
  landscape: {
    width: 112,
    height: 112,
    flexShrink: 0,
    borderRadius: botanical.radius.surface,
  },
  forestText: {
    color: botanical.colors.forest,
  },
  meaningText: {
    color: botanical.colors.sageStrong,
  },
  onForestText: {
    color: botanical.colors.onForest,
  },
  content: {
    minWidth: 0,
    gap: spacing.sm,
    backgroundColor: botanical.colors.forest,
    paddingHorizontal: botanical.space.inset,
    paddingVertical: spacing.md,
  },
  headingRow: {
    minWidth: 0,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  headingText: {
    maxWidth: '100%',
    flexShrink: 1,
  },
  progressTrack: {
    height: spacing.xs,
    overflow: 'hidden',
    borderRadius: botanical.radius.pill,
    backgroundColor: botanical.colors.forestRaised,
  },
  progressFill: {
    height: '100%',
    borderRadius: botanical.radius.pill,
    backgroundColor: botanical.colors.amber,
  },
});
