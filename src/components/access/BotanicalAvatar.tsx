import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Text } from '@/components/primitives';
import { colors, layout, radii, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

import { GhafIcon, type GhafIconName } from './GhafIcon';

export type BotanicalAvatarId = 'ghaf-tree' | 'leaf' | 'flower' | 'energy-leaf' | 'water-drop';

const defaultAvatarOptions: readonly BotanicalAvatarId[] = [
  'ghaf-tree',
  'leaf',
  'flower',
  'energy-leaf',
  'water-drop',
];

interface BotanicalAvatarProps {
  id: BotanicalAvatarId;
  selected?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function BotanicalAvatar({ id, selected = false, size = 48, style }: BotanicalAvatarProps) {
  const iconSize = Math.max(22, Math.round(size * 0.48));

  return (
    <View
      aria-hidden
      style={[
        styles.avatar,
        { height: size, width: size },
        selected ? styles.avatarSelected : styles.avatarIdle,
        style,
      ]}
    >
      <GhafIcon
        color={selected ? colors.onPrimary : colors.ghafEmerald}
        name={id as GhafIconName}
        size={iconSize}
      />
    </View>
  );
}

interface BotanicalAvatarPickerProps {
  label?: string;
  labels?: Partial<Record<BotanicalAvatarId, string>>;
  onChange: (value: BotanicalAvatarId) => void;
  options?: readonly BotanicalAvatarId[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
  value: BotanicalAvatarId;
}

export function BotanicalAvatarPicker({
  label,
  labels,
  onChange,
  options = defaultAvatarOptions,
  style,
  testID = 'botanical-avatar-picker',
  value,
}: BotanicalAvatarPickerProps) {
  const [focused, setFocused] = useState<BotanicalAvatarId | null>(null);
  const direction = usePrototypeStore((state) => state.direction);

  return (
    <View style={[styles.picker, style]} testID={testID}>
      {label ? <Text variant="label">{label}</Text> : null}
      <ScrollView
        accessibilityLabel={label}
        accessibilityRole="radiogroup"
        contentContainerStyle={[
          styles.options,
          direction === 'rtl' ? styles.optionsRtl : styles.optionsLtr,
        ]}
        horizontal
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
      >
        {options.map((id) => {
          const selected = id === value;
          return (
            <Pressable
              accessibilityLabel={labels?.[id] ?? id}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              hitSlop={spacing.xxs}
              key={id}
              onBlur={() => setFocused(null)}
              onFocus={() => setFocused(id)}
              onPress={() => onChange(id)}
              style={({ pressed }) => [
                styles.option,
                selected ? styles.optionSelected : null,
                focused === id ? styles.optionFocused : null,
                pressed ? styles.optionPressed : null,
              ]}
              testID={`${testID}-${id}`}
            >
              <BotanicalAvatar id={id} selected={selected} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  picker: {
    gap: spacing.sm,
  },
  options: {
    gap: spacing.md,
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xxs,
  },
  optionsRtl: {
    flexDirection: 'row',
  },
  optionsLtr: {
    flexDirection: 'row',
  },
  option: {
    minHeight: layout.touchTarget + spacing.xs,
    minWidth: layout.touchTarget + spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.transparent,
  },
  optionFocused: {
    borderColor: colors.solarAmber,
  },
  optionSelected: {
    borderColor: colors.ghafEmerald,
  },
  optionPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.96 }],
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    borderCurve: 'continuous',
  },
  avatarIdle: {
    backgroundColor: colors.surfaceContainerHighest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  avatarSelected: {
    backgroundColor: colors.ghafEmerald,
    borderWidth: 0,
  },
});
