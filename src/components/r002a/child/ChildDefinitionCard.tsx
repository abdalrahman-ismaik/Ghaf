import { Pressable, StyleSheet, View } from 'react-native';

import { GhafIcon } from '@/components/access';
import { Text } from '@/components/primitives';
import {
  colors,
  layout,
  logicalRowDirection,
  opacity,
  r001Radii,
  r001Shadows,
  spacing,
} from '@/design/tokens';
import type { TextDirection } from '@/models/familyGrowth';

interface ChildDefinitionCardProps {
  acknowledgeLabel?: string;
  acknowledged?: boolean;
  direction: TextDirection;
  numberOfLines?: number;
  onToggleAcknowledgement?: () => void;
  testID?: string;
  title: string;
  value: string;
}

export function ChildDefinitionCard({
  acknowledgeLabel,
  acknowledged = false,
  direction,
  numberOfLines,
  onToggleAcknowledgement,
  testID = 'child-definition-of-done',
  title,
  value,
}: ChildDefinitionCardProps) {
  return (
    <View style={styles.card} testID={testID}>
      <View style={[styles.heading, { flexDirection: logicalRowDirection(direction) }]}>
        <View style={styles.icon}>
          <GhafIcon color={colors.ghafEmerald} name="check" size={24} />
        </View>
        <View style={styles.copy}>
          <Text brand color="deepForest" direction={direction} variant="label">
            {title}
          </Text>
          <Text brand color="onSurfaceVariant" direction={direction} numberOfLines={numberOfLines}>
            {value}
          </Text>
        </View>
      </View>

      {acknowledgeLabel && onToggleAcknowledgement ? (
        <Pressable
          accessibilityLabel={acknowledgeLabel}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acknowledged }}
          aria-checked={acknowledged}
          onPress={onToggleAcknowledgement}
          style={({ pressed }) => [
            styles.acknowledgement,
            { flexDirection: logicalRowDirection(direction) },
            acknowledged ? styles.acknowledged : null,
            pressed ? styles.pressed : null,
          ]}
          testID="definition-acknowledgement"
        >
          <View style={[styles.checkbox, acknowledged ? styles.checkboxChecked : null]}>
            {acknowledged ? (
              <GhafIcon color={colors.ghafEmerald} name="check-filled" size={28} />
            ) : null}
          </View>
          <Text brand color="deepForest" direction={direction} style={styles.copy} variant="label">
            {acknowledgeLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.lg,
    ...r001Shadows.soft,
  },
  heading: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  icon: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.primaryFixedTint,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  acknowledgement: {
    minHeight: layout.touchTarget,
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: r001Radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.sm,
  },
  acknowledged: {
    borderColor: colors.primaryFixedDim,
    backgroundColor: colors.primaryFixedTint,
  },
  checkbox: {
    width: 36,
    height: 36,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  checkboxChecked: {
    borderColor: colors.ghafEmerald,
  },
  pressed: {
    opacity: opacity.pressed,
    transform: [{ scale: 0.99 }],
  },
});
