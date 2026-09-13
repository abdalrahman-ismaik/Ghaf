import { StyleSheet, View } from 'react-native';

import { GhafIcon } from '@/components/access';
import { Text } from '@/components/primitives';
import {
  botanical,
  colors,
  logicalRowDirection,
  spacing,
  type LayoutDirection,
} from '@/design/tokens';

interface ParentReviewTaskCardProps {
  awardLabel: string;
  categoryLabel: string;
  childName: string;
  direction: LayoutDirection;
  submittedLabel: string;
  title: string;
}

export function ParentReviewTaskCard({
  awardLabel,
  categoryLabel,
  childName,
  direction,
  submittedLabel,
  title,
}: ParentReviewTaskCardProps) {
  return (
    <View style={styles.card} testID="parent-review-task-card">
      <View style={[styles.identityRow, { flexDirection: logicalRowDirection(direction) }]}>
        <View accessibilityElementsHidden aria-hidden style={styles.avatar}>
          <Text align="center" brand color="white" direction={direction} variant="label">
            {childName.trim().slice(0, 1)}
          </Text>
        </View>
        <View style={styles.identityCopy}>
          <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
            {childName} · {categoryLabel}
          </Text>
          <Text brand color="r001Ink" direction={direction} variant="screenTitle">
            {title}
          </Text>
        </View>
      </View>

      <View style={styles.rule} />

      <View style={[styles.metaRow, { flexDirection: logicalRowDirection(direction) }]}>
        <View style={[styles.metaItem, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon color={colors.onSurfaceVariant} name="check" size={20} />
          <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
            {submittedLabel}
          </Text>
        </View>
        <View style={[styles.metaItem, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon color={colors.mangroveTeal} name="energy-leaf" size={21} />
          <Text brand color="mangroveTeal" direction={direction} tabular variant="label">
            {awardLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    borderRadius: botanical.radius.surface,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: botanical.colors.line,
    backgroundColor: botanical.colors.paper,
    padding: spacing.lg,
  },
  identityRow: {
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.pill,
    backgroundColor: colors.ghafEmerald,
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: botanical.colors.line,
  },
  metaRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
});
