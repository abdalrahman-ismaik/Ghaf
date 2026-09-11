import { StyleSheet, View } from 'react-native';

import { GhafIcon } from '@/components/access';
import { PrimaryButton, Text } from '@/components/primitives';
import { botanical, colors, logicalRowDirection, spacing } from '@/design/tokens';
import type { TextDirection } from '@/models/familyGrowth';

interface ChildWaitingForReviewProps {
  actionLabel: string;
  body: string;
  direction: TextDirection;
  noEarlyRewardLabel: string;
  onAction: () => void;
  statusLabel: string;
  taskLabel: string;
  title: string;
}

export function ChildWaitingForReview({
  actionLabel,
  body,
  direction,
  noEarlyRewardLabel,
  onAction,
  statusLabel,
  taskLabel,
  title,
}: ChildWaitingForReviewProps) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.root}>
      <View aria-hidden style={styles.botanicalMark}>
        <GhafIcon color={botanical.colors.forest} name="leaf" size={38} />
      </View>
      <View style={styles.heading}>
        <Text align="center" brand color="ghafEmerald" direction={direction} variant="hero">
          {title}
        </Text>
        <Text
          align="center"
          brand
          color="onSurfaceVariant"
          direction={direction}
          variant="bodyLarge"
        >
          {body}
        </Text>
      </View>
      <View style={styles.card}>
        <View style={[styles.row, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon color={botanical.colors.forest} name="check-filled" size={25} />
          <Text brand color="deepForest" direction={direction} style={styles.grow} variant="label">
            {taskLabel}
          </Text>
        </View>
        <View style={styles.rule} />
        <View style={[styles.row, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon color={colors.onSurfaceVariant} name="calendar" size={23} />
          <Text brand color="onSurfaceVariant" direction={direction} style={styles.grow}>
            {statusLabel}
          </Text>
        </View>
        <View style={[styles.notice, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon color={colors.tertiary} name="info" size={20} />
          <Text brand color="tertiary" direction={direction} style={styles.grow} variant="caption">
            {noEarlyRewardLabel}
          </Text>
        </View>
      </View>
      <PrimaryButton brand direction={direction} onPress={onAction} size="regular">
        {actionLabel}
      </PrimaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.xl,
  },
  botanicalMark: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.pill,
    backgroundColor: botanical.colors.sage,
  },
  heading: {
    gap: spacing.xs,
  },
  card: {
    gap: spacing.md,
    borderRadius: botanical.radius.surface,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: botanical.colors.line,
    backgroundColor: botanical.colors.paper,
    padding: spacing.lg,
  },
  row: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  notice: {
    alignItems: 'flex-start',
    gap: spacing.xs,
    borderRadius: botanical.radius.small,
    backgroundColor: botanical.colors.amberWash,
    padding: spacing.sm,
  },
  grow: {
    flex: 1,
    minWidth: 0,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: botanical.colors.line,
  },
});
