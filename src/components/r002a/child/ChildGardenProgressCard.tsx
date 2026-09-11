import { StyleSheet, View } from 'react-native';

import { GhafIcon } from '@/components/access';
import { QuietButton, Text } from '@/components/primitives';
import { botanical, logicalRowDirection, spacing } from '@/design/tokens';
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
  const formatter = new Intl.NumberFormat(direction === 'rtl' ? 'ar-AE' : 'en-AE');

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
            <Text
              align={direction === 'rtl' ? 'end' : 'start'}
              brand
              color="r001Ink"
              direction="ltr"
              tabular
              variant="bodyLarge"
            >
              {formatter.format(current)} / {formatter.format(target)}
            </Text>
          </View>
          <View style={styles.iconCircle}>
            <GhafIcon color={botanical.colors.forest} name="flower" size={25} />
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
          <GhafIcon color={botanical.colors.ink} name="leaf" size={17} />
          <Text brand color="deepForest" direction={direction} style={styles.grow} variant="label">
            {remainingLabel}
          </Text>
        </View>
        <View style={[styles.canopy, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon color={botanical.colors.forestRaised} name="ghaf-tree" size={18} />
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
          icon={<GhafIcon color={botanical.colors.forest} name="ghaf-tree" size={19} />}
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
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: botanical.colors.line,
    paddingTop: botanical.space.section,
  },
  card: {
    gap: spacing.md,
    paddingBottom: botanical.space.small,
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
    borderRadius: botanical.radius.pill,
    backgroundColor: botanical.colors.paper,
  },
  track: {
    height: 6,
    overflow: 'hidden',
    borderRadius: botanical.radius.pill,
    backgroundColor: botanical.colors.line,
  },
  fill: {
    height: '100%',
    borderRadius: botanical.radius.pill,
    backgroundColor: botanical.colors.forest,
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
  },
  grow: {
    flex: 1,
    minWidth: 0,
  },
});
