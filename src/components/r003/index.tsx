import { forwardRef, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { YStack } from 'tamagui';
import { BotanicalPressable as Pressable } from '@/components/botanical';
import { nativeViewStyles } from '@/design/nativeStyles';

import { GhafIcon, type GhafIconName } from '@/components/access';
import { Text } from '@/components/primitives';
import {
  botanical,
  colors,
  layout,
  logicalRowDirection,
  opacity,
  r001Radii,
  spacing,
} from '@/design/tokens';
import type { LocaleCode, TextDirection } from '@/models/familyGrowth';

export function R003Hero({
  body,
  direction,
  icon,
  language,
  title,
}: {
  body: string;
  direction: TextDirection;
  icon: GhafIconName;
  language: LocaleCode;
  title: string;
}) {
  return (
    <View style={[styles.hero, { flexDirection: logicalRowDirection(direction) }]}>
      <View style={styles.heroIcon}>
        <GhafIcon color={colors.ghafEmerald} direction={direction} name={icon} size={30} />
      </View>
      <View style={styles.heroCopy}>
        <Text
          align="start"
          brand
          color="deepForest"
          direction={direction}
          language={language}
          variant="hero"
        >
          {title}
        </Text>
        <Text
          align="start"
          brand
          color="onSurfaceVariant"
          direction={direction}
          language={language}
          variant="bodyLarge"
        >
          {body}
        </Text>
      </View>
    </View>
  );
}

export function R003Section({
  children,
  style,
  testID,
  title,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  title?: string;
}) {
  return (
    <YStack {...nativeViewStyles([styles.section, style])} testID={testID}>
      {title ? (
        <Text brand color="deepForest" variant="screenTitle">
          {title}
        </Text>
      ) : null}
      {children}
    </YStack>
  );
}

interface R003ActionRowProps {
  body?: string;
  direction: TextDirection;
  disabled?: boolean;
  icon: GhafIconName;
  language: LocaleCode;
  meta?: string;
  onPress?: () => void;
  testID?: string;
  title: string;
}

export const R003ActionRow = forwardRef<View, R003ActionRowProps>(function R003ActionRow(
  { body, direction, disabled = false, icon, language, meta, onPress, testID, title },
  ref,
) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { disabled } : undefined}
      disabled={disabled || !onPress}
      onPress={onPress}
      ref={ref}
      style={({ pressed }) => [
        styles.actionRow,
        { flexDirection: logicalRowDirection(direction) },
        pressed && !disabled && onPress ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
      testID={testID}
    >
      <View style={styles.rowIcon}>
        <GhafIcon color={colors.mangroveTeal} direction={direction} name={icon} size={23} />
      </View>
      <View style={styles.rowCopy}>
        <Text brand color="deepForest" direction={direction} language={language} variant="label">
          {title}
        </Text>
        {body ? (
          <Text
            brand
            color="onSurfaceVariant"
            direction={direction}
            language={language}
            variant="caption"
          >
            {body}
          </Text>
        ) : null}
      </View>
      {meta ? (
        <Text
          brand
          color="ghafEmerald"
          direction={direction}
          language={language}
          tabular
          variant="caption"
        >
          {meta}
        </Text>
      ) : onPress ? (
        <GhafIcon color={colors.onSurfaceVariant} direction={direction} name="chevron" size={20} />
      ) : null}
    </Pressable>
  );
});

export function R003Progress({
  accessibilityLabel,
  current,
  direction,
  target,
}: {
  accessibilityLabel: string;
  current: number;
  direction: TextDirection;
  target: number;
}) {
  const width = `${Math.max(
    0,
    Math.min(100, target > 0 ? (current / target) * 100 : 0),
  )}%` as `${number}%`;
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: target, now: current }}
      style={styles.progressTrack}
    >
      <View
        style={[
          styles.progressFill,
          { width },
          direction === 'rtl' ? styles.progressFillRtl : styles.progressFillLtr,
        ]}
      />
    </View>
  );
}

export function R003Status({
  direction,
  icon = 'info',
  language,
  message,
  tone = 'neutral',
}: {
  direction: TextDirection;
  icon?: GhafIconName;
  language: LocaleCode;
  message: string;
  tone?: 'neutral' | 'success' | 'warning';
}) {
  const palette = {
    neutral: { background: colors.primaryFixedTint, color: colors.ghafEmerald },
    success: { background: colors.mangroveTealTint, color: colors.mangroveTeal },
    warning: { background: colors.solarAmberTint, color: colors.tertiary },
  }[tone];
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.status,
        { backgroundColor: palette.background, flexDirection: logicalRowDirection(direction) },
      ]}
    >
      <GhafIcon color={palette.color} direction={direction} name={icon} size={20} />
      <Text
        brand
        color={tone === 'warning' ? 'tertiary' : 'deepForest'}
        direction={direction}
        language={language}
        style={styles.rowCopy}
        variant="caption"
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'flex-start',
    gap: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
  heroIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.control,
    backgroundColor: botanical.colors.sage,
  },
  heroCopy: {
    maxWidth: layout.readableContentWidth,
    minWidth: 0,
    flex: 1,
    gap: spacing.xs,
  },
  section: {
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: botanical.colors.line,
    paddingTop: botanical.space.section,
    paddingBottom: spacing.sm,
  },
  actionRow: {
    minHeight: 72,
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: botanical.colors.line,
    paddingVertical: spacing.md,
  },
  rowIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.small,
    backgroundColor: botanical.colors.sage,
  },
  rowCopy: {
    minWidth: 0,
    flex: 1,
    gap: spacing.xxs,
  },
  pressed: {
    opacity: opacity.pressed,
    transform: [{ scale: 0.99 }],
  },
  disabled: { opacity: opacity.disabled },
  progressTrack: {
    width: '100%',
    height: 10,
    overflow: 'hidden',
    borderRadius: r001Radii.pill,
    backgroundColor: botanical.colors.sageStrong,
  },
  progressFill: {
    height: '100%',
    borderRadius: r001Radii.pill,
    backgroundColor: botanical.colors.forest,
  },
  progressFillLtr: { alignSelf: 'flex-start' },
  progressFillRtl: { alignSelf: 'flex-end' },
  status: {
    minHeight: layout.touchTarget,
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: r001Radii.md,
    padding: spacing.sm,
  },
});
