import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/primitives';
import {
  colors,
  layout,
  logicalRowDirection,
  opacity,
  r001Radii,
  spacing,
  type LayoutDirection,
  type TypographyLanguage,
} from '@/design/tokens';

import { GhafIcon } from './GhafIcon';

interface RememberDeviceChoiceProps {
  body: string;
  direction: LayoutDirection;
  disabled?: boolean;
  language: TypographyLanguage;
  onChange: (selected: boolean) => void;
  selected: boolean;
  title: string;
}

export function RememberDeviceChoice({
  body,
  direction,
  disabled = false,
  language,
  onChange,
  selected,
  title,
}: RememberDeviceChoiceProps) {
  return (
    <Pressable
      accessibilityHint={body}
      accessibilityLabel={title}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      aria-checked={selected}
      disabled={disabled}
      onPress={() => onChange(!selected)}
      style={({ pressed }) => [
        styles.control,
        { flexDirection: logicalRowDirection(direction) },
        selected ? styles.selected : null,
        pressed ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
      testID="remember-parent-device-choice"
    >
      <View style={[styles.checkbox, selected ? styles.checkboxSelected : null]}>
        {selected ? <GhafIcon color={colors.ghafEmerald} name="check" size={20} /> : null}
      </View>
      <View style={styles.copy}>
        <Text brand color="deepForest" direction={direction} language={language} variant="label">
          {title}
        </Text>
        <Text
          brand
          color="onSurfaceVariant"
          direction={direction}
          language={language}
          variant="caption"
        >
          {body}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  control: {
    minHeight: layout.touchTarget,
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: r001Radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
  },
  selected: {
    borderColor: colors.primaryFixedDim,
    backgroundColor: colors.primaryFixedTint,
  },
  checkbox: {
    width: 28,
    height: 28,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.sm,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  checkboxSelected: { borderColor: colors.ghafEmerald },
  copy: { flex: 1, minWidth: 0, gap: spacing.xxs },
  pressed: { opacity: opacity.pressed },
  disabled: { opacity: opacity.disabled },
});
