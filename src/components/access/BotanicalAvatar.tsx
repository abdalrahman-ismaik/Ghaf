import { useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/primitives';
import { colors, layout, logicalRowDirection, opacity, r001Radii, spacing } from '@/design/tokens';
import type { LocaleCode, TextDirection } from '@/models/familyGrowth';
import type { ChildTreeAvatarId } from '@/models/parentOnboarding';

import { GhafIcon, type GhafIconName } from './GhafIcon';

export type BotanicalAvatarId = ChildTreeAvatarId;

export const botanicalAvatarOptions: readonly BotanicalAvatarId[] = [
  'ghaf_tree',
  'leaf',
  'flower',
  'energy_leaf',
  'water_drop',
];

const iconByAvatarId: Readonly<Record<BotanicalAvatarId, GhafIconName>> = {
  ghaf_tree: 'ghaf-tree',
  leaf: 'leaf',
  flower: 'flower',
  energy_leaf: 'energy-leaf',
  water_drop: 'water-drop',
};

export interface BotanicalAvatarProps {
  direction: TextDirection;
  disabled?: boolean;
  id: BotanicalAvatarId;
  selected?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function BotanicalAvatar({
  direction,
  disabled = false,
  id,
  selected = false,
  size = layout.touchTarget,
  style,
  testID,
}: BotanicalAvatarProps) {
  const resolvedSize = Math.max(spacing.xl, size);
  const iconSize = Math.max(20, Math.round(resolvedSize * 0.48));

  return (
    <View
      accessible={false}
      aria-hidden
      style={[
        styles.avatar,
        { height: resolvedSize, width: resolvedSize },
        selected ? styles.avatarSelected : styles.avatarIdle,
        disabled ? styles.avatarDisabled : null,
        style,
      ]}
      testID={testID}
    >
      <GhafIcon
        color={selected ? colors.onPrimary : colors.ghafEmerald}
        direction={direction}
        name={iconByAvatarId[id]}
        size={iconSize}
      />
    </View>
  );
}

export interface BotanicalAvatarPickerProps {
  direction: TextDirection;
  disabled?: boolean;
  focusedValue?: BotanicalAvatarId | null;
  label: string;
  labels: Readonly<Record<BotanicalAvatarId, string>>;
  language: LocaleCode;
  onChange: (value: BotanicalAvatarId) => void;
  onFocusChange?: (value: BotanicalAvatarId | null) => void;
  options?: readonly BotanicalAvatarId[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
  value: BotanicalAvatarId;
}

export function BotanicalAvatarPicker({
  direction,
  disabled = false,
  focusedValue,
  label,
  labels,
  language,
  onChange,
  onFocusChange,
  options = botanicalAvatarOptions,
  style,
  testID = 'botanical-avatar-picker',
  value,
}: BotanicalAvatarPickerProps) {
  const [internalFocusedValue, setInternalFocusedValue] = useState<BotanicalAvatarId | null>(null);
  const resolvedFocusedValue = focusedValue ?? internalFocusedValue;

  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="radiogroup"
      accessibilityState={{ disabled }}
      style={[styles.picker, style]}
      testID={testID}
    >
      <Text brand direction={direction} language={language} variant="label">
        {label}
      </Text>
      <View style={[styles.options, direction === 'rtl' ? styles.optionsRtl : styles.optionsLtr]}>
        {options.map((id) => {
          const selected = id === value;
          const focused = id === resolvedFocusedValue;

          return (
            <Pressable
              accessibilityLabel={labels[id]}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled }}
              disabled={disabled}
              focusable={!disabled}
              key={id}
              onBlur={() => {
                if (focused) {
                  setInternalFocusedValue(null);
                  onFocusChange?.(null);
                }
              }}
              onFocus={() => {
                setInternalFocusedValue(id);
                onFocusChange?.(id);
              }}
              onPress={() => {
                if (!selected) onChange(id);
              }}
              pressRetentionOffset={spacing.sm}
              style={({ pressed }) => [
                styles.option,
                selected ? styles.optionSelected : null,
                focused ? styles.optionFocused : null,
                pressed && !disabled ? styles.optionPressed : null,
                disabled ? styles.optionDisabled : null,
              ]}
              testID={`${testID}-${id}`}
            >
              <BotanicalAvatar direction={direction} id={id} selected={selected} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  picker: {
    gap: spacing.sm,
    minWidth: 0,
  },
  options: {
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    minWidth: 0,
    padding: spacing.xxs,
  },
  optionsRtl: {
    flexDirection: logicalRowDirection('rtl'),
  },
  optionsLtr: {
    flexDirection: logicalRowDirection('ltr'),
  },
  option: {
    alignItems: 'center',
    borderColor: colors.transparent,
    borderCurve: 'continuous',
    borderRadius: r001Radii.pill,
    borderWidth: 2,
    height: layout.touchTarget + spacing.xs,
    justifyContent: 'center',
    width: layout.touchTarget + spacing.xs,
  },
  optionSelected: {
    borderColor: colors.ghafEmerald,
  },
  optionFocused: {
    borderColor: colors.solarAmber,
  },
  optionPressed: {
    opacity: opacity.pressed,
    transform: [{ scale: 0.97 }],
  },
  optionDisabled: {
    opacity: opacity.disabled,
  },
  avatar: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: r001Radii.pill,
    justifyContent: 'center',
  },
  avatarIdle: {
    backgroundColor: colors.surfaceContainerHighest,
    borderColor: colors.outlineVariant,
    borderWidth: 1,
  },
  avatarSelected: {
    backgroundColor: colors.ghafEmerald,
    borderWidth: 0,
  },
  avatarDisabled: {
    opacity: opacity.disabled,
  },
});
