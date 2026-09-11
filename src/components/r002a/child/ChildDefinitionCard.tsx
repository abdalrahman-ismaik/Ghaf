import { StyleSheet, View } from 'react-native';

import { BotanicalPressable as Pressable } from '@/components/botanical';
import { GhafIcon } from '@/components/access';
import { Text } from '@/components/primitives';
import { botanical, layout, logicalRowDirection, opacity, spacing } from '@/design/tokens';
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
          <GhafIcon color={botanical.colors.forest} name="check" size={24} />
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
              <GhafIcon color={botanical.colors.forest} name="check-filled" size={28} />
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
    borderRadius: botanical.radius.surface,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: botanical.colors.line,
    backgroundColor: botanical.colors.paper,
    padding: spacing.lg,
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
    borderRadius: botanical.radius.pill,
    backgroundColor: botanical.colors.sage,
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
    borderRadius: botanical.radius.control,
    borderWidth: 1,
    borderColor: botanical.colors.line,
    backgroundColor: botanical.colors.canvas,
    padding: spacing.sm,
  },
  acknowledged: {
    borderColor: botanical.colors.sageStrong,
    backgroundColor: botanical.colors.sage,
  },
  checkbox: {
    width: 36,
    height: 36,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.pill,
    borderWidth: 2,
    borderColor: botanical.colors.line,
    backgroundColor: botanical.colors.paper,
  },
  checkboxChecked: {
    borderColor: botanical.colors.forest,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
