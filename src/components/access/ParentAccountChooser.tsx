import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { BotanicalPressable } from '@/components/botanical';
import { Text } from '@/components/primitives';
import { colors, layout, logicalRowDirection, opacity, r001Radii, spacing } from '@/design/tokens';
import type { LocaleCode, TextDirection } from '@/models/familyGrowth';

import { BotanicalAvatar } from './BotanicalAvatar';
import { GhafIcon } from './GhafIcon';

interface ParentAccountChooserProps {
  readonly direction: TextDirection;
  readonly language: LocaleCode;
  readonly familyName: string;
  readonly detail: string;
  readonly actionLabel: string;
  readonly busyLabel: string;
  readonly busy: boolean;
  readonly disabled: boolean;
  readonly onSelect: () => void;
}

export function ParentAccountChooser({
  direction,
  language,
  familyName,
  detail,
  actionLabel,
  busyLabel,
  busy,
  disabled,
  onSelect,
}: ParentAccountChooserProps) {
  return (
    <BotanicalPressable
      accessibilityLabel={`${busy ? busyLabel : actionLabel}: ${familyName}. ${detail}`}
      accessibilityRole="button"
      accessibilityState={{ busy, disabled: disabled || busy }}
      disabled={disabled || busy}
      onPress={onSelect}
      style={({ pressed }) => [
        styles.account,
        { flexDirection: logicalRowDirection(direction) },
        pressed && styles.pressed,
        (disabled || busy) && styles.disabled,
      ]}
      testID="local-parent-account-button"
    >
      <BotanicalAvatar direction={direction} id="ghaf_tree" />
      <View style={styles.identity}>
        <Text brand color="deepForest" direction={direction} language={language} variant="heading">
          {familyName}
        </Text>
        <Text
          brand
          color="onSurfaceVariant"
          direction={direction}
          language={language}
          variant="caption"
        >
          {busy ? busyLabel : detail}
        </Text>
      </View>
      {busy ? (
        <ActivityIndicator color={colors.deepForest} />
      ) : (
        <GhafIcon
          color={colors.deepForest}
          direction={direction}
          name="chevron"
          size={spacing.lg}
        />
      )}
    </BotanicalPressable>
  );
}

const styles = StyleSheet.create({
  account: {
    alignItems: 'center',
    width: '100%',
    minHeight: layout.touchTarget,
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: r001Radii.lg,
    borderWidth: 1,
    borderColor: colors.ghafEmerald,
    backgroundColor: colors.surfaceContainerLow,
  },
  identity: { flex: 1, minWidth: 0, gap: spacing.xxs },
  pressed: { backgroundColor: colors.surfaceContainerHigh },
  disabled: { opacity: opacity.disabled },
});
