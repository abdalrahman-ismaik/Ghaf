import { useEffect, useRef, useState, type PropsWithChildren, type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Row, Text } from '@/components/primitives';
import { colors, layout, opacity, radii, shadows, spacing, typography } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

import { GhafIcon, type GhafIconName } from './GhafIcon';

export type StatusTone = 'error' | 'offline' | 'origin' | 'success';

const toneColors: Record<
  StatusTone,
  { background: string; foreground: string; icon: GhafIconName }
> = {
  error: {
    background: colors.errorContainer,
    foreground: colors.onErrorContainer,
    icon: 'info',
  },
  offline: {
    background: colors.tertiaryFixed,
    foreground: colors.onTertiaryFixed,
    icon: 'info',
  },
  origin: {
    background: colors.surfaceContainerLow,
    foreground: colors.onSurfaceVariant,
    icon: 'science',
  },
  success: {
    background: colors.successLight,
    foreground: colors.deepForest,
    icon: 'check',
  },
};

const normalizeOtpDigits = (value: string) =>
  value
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[^0-9]/g, '');

interface PrototypePillProps {
  icon?: GhafIconName;
  message: string;
  style?: StyleProp<ViewStyle>;
  tone?: StatusTone;
}

export function PrototypePill({ icon, message, style, tone = 'origin' }: PrototypePillProps) {
  const palette = toneColors[tone];

  return (
    <Row gap={spacing.xs} style={[styles.pill, { backgroundColor: palette.background }, style]}>
      <GhafIcon color={palette.foreground} name={icon ?? palette.icon} size={16} />
      <Text color="onSurfaceVariant" style={{ color: palette.foreground }} variant="caption">
        {message}
      </Text>
    </Row>
  );
}

interface StatusBannerProps {
  actionLabel?: string;
  message: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
  title?: string;
  tone: StatusTone;
}

export function StatusBanner({
  actionLabel,
  message,
  onAction,
  style,
  title,
  tone,
}: StatusBannerProps) {
  const palette = toneColors[tone];

  return (
    <View
      accessibilityLiveRegion={tone === 'error' || tone === 'offline' ? 'polite' : undefined}
      style={[styles.banner, { backgroundColor: palette.background }, style]}
    >
      <Row align="flex-start" gap={spacing.sm}>
        <View style={styles.bannerIcon}>
          <GhafIcon color={palette.foreground} name={palette.icon} size={20} />
        </View>
        <View style={styles.bannerCopy}>
          {title ? (
            <Text style={{ color: palette.foreground }} variant="label">
              {title}
            </Text>
          ) : null}
          <Text style={{ color: palette.foreground }} variant="caption">
            {message}
          </Text>
        </View>
      </Row>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [styles.bannerAction, pressed ? styles.pressed : null]}
        >
          <Text style={{ color: palette.foreground }} variant="label">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

interface OtpInputProps {
  accessibilityLabel?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  errorText?: string;
  length?: number;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  testID?: string;
  value: string;
}

export function OtpInput({
  accessibilityLabel,
  autoFocus = false,
  disabled = false,
  errorText,
  length = 6,
  onChange,
  onComplete,
  testID = 'otp-input',
  value,
}: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const completedValueRef = useRef<string | null>(null);
  const [focused, setFocused] = useState(false);
  const { fontScale, width } = useWindowDimensions();
  const availableWidth = Math.min(width - layout.screenPadding * 2, layout.readableContentWidth);
  const cellGap = width < 340 ? spacing.xxs : spacing.xs;
  const cellWidth = Math.max(
    36,
    Math.min(50, Math.floor((availableWidth - cellGap * (length - 1)) / length)),
  );
  const cellHeight = Math.max(layout.controlHeight, Math.min(76, 38 * fontScale));

  useEffect(() => {
    if (value.length === length && completedValueRef.current !== value) {
      completedValueRef.current = value;
      onComplete?.(value);
    } else if (value.length !== length) {
      completedValueRef.current = null;
    }
  }, [length, onComplete, value]);

  const updateValue = (nextValue: string) => {
    onChange(normalizeOtpDigits(nextValue).slice(0, length));
  };

  return (
    <View style={styles.otpGroup} testID={testID}>
      <Pressable
        accessible={false}
        onPress={() => inputRef.current?.focus()}
        style={[styles.otpCells, { gap: cellGap }]}
      >
        {Array.from({ length }, (_, index) => {
          const digit = value[index];
          const active = focused && index === Math.min(value.length, length - 1);
          return (
            <View
              key={index}
              style={[
                styles.otpCell,
                { height: cellHeight, width: cellWidth },
                active ? styles.otpCellFocused : null,
                errorText ? styles.otpCellError : null,
                disabled ? styles.disabled : null,
              ]}
            >
              <Text
                align="center"
                direction="ltr"
                maxFontSizeMultiplier={1.5}
                style={styles.otpDigit}
                variant="screenTitle"
              >
                {digit ?? ''}
              </Text>
            </View>
          );
        })}
        <TextInput
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ disabled }}
          autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
          autoFocus={autoFocus}
          caretHidden
          editable={!disabled}
          inputMode="numeric"
          maxLength={length}
          onBlur={() => setFocused(false)}
          onChangeText={updateValue}
          onFocus={() => setFocused(true)}
          ref={inputRef}
          style={styles.otpNativeInput}
          textContentType="oneTimeCode"
          value={value}
        />
      </Pressable>
      {errorText ? (
        <Text accessibilityLiveRegion="polite" color="danger" variant="caption">
          {errorText}
        </Text>
      ) : null}
    </View>
  );
}

export interface SegmentOption<Value extends string> {
  label: string;
  value: Value;
}

interface SegmentedControlProps<Value extends string> {
  accessibilityLabel?: string;
  disabled?: boolean;
  label?: string;
  onChange: (value: Value) => void;
  options: readonly SegmentOption<Value>[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
  value: Value;
}

export function SegmentedControl<Value extends string>({
  accessibilityLabel,
  disabled = false,
  label,
  onChange,
  options,
  style,
  testID = 'segmented-control',
  value,
}: SegmentedControlProps<Value>) {
  const direction = usePrototypeStore((state) => state.direction);

  return (
    <View style={[styles.segmentedGroup, style]} testID={testID}>
      {label ? <Text variant="label">{label}</Text> : null}
      <View
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityRole="radiogroup"
        style={[
          styles.segments,
          direction === 'rtl' ? styles.rowRtl : styles.rowLtr,
          disabled ? styles.disabled : null,
        ]}
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              accessibilityLabel={option.label}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled }}
              disabled={disabled}
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.segment,
                selected ? styles.segmentSelected : null,
                pressed ? styles.pressed : null,
              ]}
              testID={`${testID}-${option.value}`}
            >
              <Text
                align="center"
                color={selected ? 'ghafEmerald' : 'onSurfaceVariant'}
                variant="label"
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

interface ChoiceChipProps {
  accessibilityLabel?: string;
  disabled?: boolean;
  icon?: ReactNode;
  label: string;
  onPress: () => void;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function ChoiceChip({
  accessibilityLabel,
  disabled = false,
  icon,
  label,
  onPress,
  selected = false,
  style,
  testID,
}: ChoiceChipProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choiceChip,
        selected ? styles.choiceChipSelected : null,
        pressed ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
      testID={testID}
    >
      <Row gap={spacing.xs}>
        {icon}
        <Text align="center" color={selected ? 'ghafEmerald' : 'onSurfaceVariant'} variant="label">
          {label}
        </Text>
      </Row>
    </Pressable>
  );
}

interface SummaryCardProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function SummaryCard({ children, style, testID }: SummaryCardProps) {
  return (
    <View style={[styles.summaryCard, style]} testID={testID}>
      {children}
    </View>
  );
}

interface InfoRowProps {
  icon: GhafIconName;
  message: string;
  tone?: 'muted' | 'primary';
}

export function InfoRow({ icon, message, tone = 'muted' }: InfoRowProps) {
  const foreground = tone === 'primary' ? colors.ghafEmerald : colors.onSurfaceVariant;
  return (
    <Row align="flex-start" gap={spacing.sm}>
      <View style={styles.infoIcon}>
        <GhafIcon color={foreground} name={icon} size={20} />
      </View>
      <Text
        color="onSurfaceVariant"
        style={[styles.infoCopy, { color: foreground }]}
        variant="label"
      >
        {message}
      </Text>
    </Row>
  );
}

interface LabeledDividerProps {
  label: string;
}

export function LabeledDivider({ label }: LabeledDividerProps) {
  return (
    <Row gap={spacing.md}>
      <View style={styles.divider} />
      <Text align="center" color="inkMuted" variant="caption">
        {label}
      </Text>
      <View style={styles.divider} />
    </Row>
  );
}

const styles = StyleSheet.create({
  rowRtl: {
    flexDirection: 'row',
  },
  rowLtr: {
    flexDirection: 'row',
  },
  pressed: {
    opacity: opacity.pressed,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: opacity.disabled,
  },
  pill: {
    alignSelf: 'center',
    minHeight: 32,
    maxWidth: '100%',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  banner: {
    gap: spacing.sm,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  bannerIcon: {
    minHeight: spacing.xl,
    justifyContent: 'center',
  },
  bannerCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  bannerAction: {
    alignSelf: 'flex-start',
    minHeight: layout.touchTarget,
    justifyContent: 'center',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
  },
  otpGroup: {
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
  },
  otpCells: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  otpCell: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: radii.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    backgroundColor: colors.surfaceContainerLowest,
    ...shadows.soft,
  },
  otpCellFocused: {
    borderColor: colors.ghafEmerald,
    borderWidth: 2,
  },
  otpCellError: {
    borderColor: colors.error,
  },
  otpDigit: {
    fontFamily: typography.families.readexSemiBold,
    fontVariant: ['tabular-nums'],
  },
  otpNativeInput: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    color: colors.transparent,
    opacity: 0.02,
  },
  segments: {
    gap: spacing.sm,
    width: '100%',
  },
  segmentedGroup: {
    gap: spacing.sm,
  },
  segment: {
    flex: 1,
    minWidth: 0,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  segmentSelected: {
    borderColor: colors.ghafEmerald,
    borderWidth: 2,
    backgroundColor: colors.leafMist,
  },
  choiceChip: {
    minHeight: layout.touchTarget,
    minWidth: 92,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  choiceChipSelected: {
    borderColor: colors.ghafEmerald,
    backgroundColor: colors.leafMist,
  },
  summaryCard: {
    gap: spacing.xl,
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: spacing.xl,
  },
  infoIcon: {
    width: spacing.xl,
    minHeight: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCopy: {
    flex: 1,
    minWidth: 0,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.outlineVariant,
  },
});
