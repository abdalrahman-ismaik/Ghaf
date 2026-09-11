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

import { Input, Row, Text, type InputProps } from '@/components/primitives';
import {
  colors,
  layout,
  logicalRowDirection,
  opacity,
  r001Radii,
  r001Shadows,
  spacing,
  type LayoutDirection,
  type TypographyLanguage,
} from '@/design/tokens';

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

export function normalizeOtpDigits(value: string) {
  return value
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[^0-9]/g, '');
}

export interface PrototypePillProps {
  direction: LayoutDirection;
  icon?: GhafIconName;
  language: TypographyLanguage;
  message: string;
  style?: StyleProp<ViewStyle>;
  tone?: StatusTone;
}

export function PrototypePill({
  direction,
  icon,
  language,
  message,
  style,
  tone = 'origin',
}: PrototypePillProps) {
  const palette = toneColors[tone];

  return (
    <Row
      direction={direction}
      gap={spacing.xs}
      style={[styles.pill, { backgroundColor: palette.background }, style]}
    >
      <GhafIcon
        color={palette.foreground}
        direction={direction}
        name={icon ?? palette.icon}
        size={16}
      />
      <Text
        brand
        direction={direction}
        language={language}
        style={{ color: palette.foreground }}
        variant="caption"
      >
        {message}
      </Text>
    </Row>
  );
}

export interface StatusBannerProps {
  actionLabel?: string;
  direction: LayoutDirection;
  language: TypographyLanguage;
  message: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
  title?: string;
  tone: StatusTone;
}

export function StatusBanner({
  actionLabel,
  direction,
  language,
  message,
  onAction,
  style,
  title,
  tone,
}: StatusBannerProps) {
  const palette = toneColors[tone];

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.banner, { backgroundColor: palette.background }, style]}
    >
      <Row align="flex-start" direction={direction} gap={spacing.sm}>
        <View style={styles.bannerIcon}>
          <GhafIcon
            color={palette.foreground}
            direction={direction}
            name={palette.icon}
            size={20}
          />
        </View>
        <View style={styles.bannerCopy}>
          {title ? (
            <Text
              brand
              direction={direction}
              language={language}
              style={{ color: palette.foreground }}
              variant="label"
            >
              {title}
            </Text>
          ) : null}
          <Text
            brand
            direction={direction}
            language={language}
            style={{ color: palette.foreground }}
            variant="caption"
          >
            {message}
          </Text>
        </View>
      </Row>
      {actionLabel && onAction ? (
        <FocusablePressable
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          onPress={onAction}
          style={styles.bannerAction}
        >
          <Text
            brand
            direction={direction}
            language={language}
            style={{ color: palette.foreground }}
            variant="label"
          >
            {actionLabel}
          </Text>
        </FocusablePressable>
      ) : null}
    </View>
  );
}

export interface AccessTextFieldProps extends Omit<InputProps, 'brand' | 'direction' | 'language'> {
  direction: LayoutDirection | 'auto';
  language: TypographyLanguage;
}

export function AccessTextField({ direction, language, ...props }: AccessTextFieldProps) {
  return <Input {...props} brand direction={direction} language={language} />;
}

export interface OtpInputProps {
  accessibilityLabel: string;
  autoFocus?: boolean;
  disabled?: boolean;
  direction: LayoutDirection;
  errorText?: string;
  language: TypographyLanguage;
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
  direction,
  errorText,
  language,
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
  const cellHeight = Math.max(layout.controlHeight, Math.min(80, 40 * fontScale));
  const normalizedValue = normalizeOtpDigits(value).slice(0, length);

  useEffect(() => {
    if (normalizedValue.length === length && completedValueRef.current !== normalizedValue) {
      completedValueRef.current = normalizedValue;
      onComplete?.(normalizedValue);
    } else if (normalizedValue.length !== length) {
      completedValueRef.current = null;
    }
  }, [length, normalizedValue, onComplete]);

  const updateValue = (nextValue: string) => {
    onChange(normalizeOtpDigits(nextValue).slice(0, length));
  };

  return (
    <View style={styles.otpGroup} testID={testID}>
      <Pressable
        accessible={false}
        disabled={disabled}
        onPress={() => inputRef.current?.focus()}
        pressRetentionOffset={spacing.sm}
        style={[styles.otpCells, { gap: cellGap }]}
      >
        {Array.from({ length }, (_, index) => {
          const digit = normalizedValue[index];
          const active = focused && index === Math.min(normalizedValue.length, length - 1);
          return (
            <View
              accessibilityElementsHidden
              aria-hidden
              importantForAccessibility="no-hide-descendants"
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
                accessibilityElementsHidden
                aria-hidden
                accessibilityRole="none"
                align="center"
                brand
                direction="ltr"
                language={language}
                style={styles.otpDigit}
                tabular
                variant="screenTitle"
              >
                {digit ?? ''}
              </Text>
            </View>
          );
        })}
        <TextInput
          accessibilityLabel={accessibilityLabel}
          accessibilityLanguage={language === 'ar' ? 'ar-AE' : 'en-AE'}
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
          value={normalizedValue}
        />
      </Pressable>
      {errorText ? (
        <Text
          accessibilityLiveRegion="polite"
          brand
          color="danger"
          direction={direction}
          language={language}
          variant="caption"
        >
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

export interface SegmentedControlProps<Value extends string> {
  accessibilityLabel?: string;
  direction: LayoutDirection;
  disabled?: boolean;
  label?: string;
  language: TypographyLanguage;
  onChange: (value: Value) => void;
  options: readonly SegmentOption<Value>[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
  value: Value;
}

export function SegmentedControl<Value extends string>({
  accessibilityLabel,
  direction,
  disabled = false,
  label,
  language,
  onChange,
  options,
  style,
  testID = 'segmented-control',
  value,
}: SegmentedControlProps<Value>) {
  return (
    <View style={[styles.segmentedGroup, style]} testID={testID}>
      {label ? (
        <Text brand direction={direction} language={language} variant="label">
          {label}
        </Text>
      ) : null}
      <View
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityRole="radiogroup"
        style={[
          styles.segments,
          { flexDirection: logicalRowDirection(direction) },
          disabled ? styles.disabled : null,
        ]}
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <FocusablePressable
              accessibilityLabel={option.label}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled }}
              aria-checked={selected}
              disabled={disabled}
              key={option.value}
              onPress={() => onChange(option.value)}
              selected={selected}
              style={styles.segment}
              testID={`${testID}-${option.value}`}
            >
              <Text
                align="center"
                brand
                color={selected ? 'ghafEmerald' : 'onSurfaceVariant'}
                direction={direction}
                language={language}
                variant="label"
              >
                {option.label}
              </Text>
            </FocusablePressable>
          );
        })}
      </View>
    </View>
  );
}

export interface ChoiceChipProps {
  accessibilityLabel?: string;
  direction: LayoutDirection;
  disabled?: boolean;
  icon?: ReactNode;
  label: string;
  language: TypographyLanguage;
  onPress: () => void;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function ChoiceChip({
  accessibilityLabel,
  direction,
  disabled = false,
  icon,
  label,
  language,
  onPress,
  selected = false,
  style,
  testID,
}: ChoiceChipProps) {
  return (
    <FocusablePressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      aria-checked={selected}
      disabled={disabled}
      onPress={onPress}
      selected={selected}
      selectedStyle={styles.choiceChipSelected}
      style={[styles.choiceChip, style]}
      testID={testID}
    >
      <Row direction={direction} gap={spacing.xs} wrap>
        {icon}
        <Text
          align="center"
          brand
          color={selected ? 'ghafEmerald' : 'onSurfaceVariant'}
          direction={direction}
          language={language}
          variant="label"
        >
          {label}
        </Text>
      </Row>
    </FocusablePressable>
  );
}

export interface SummaryCardProps extends PropsWithChildren {
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function SummaryCard({ accessibilityLabel, children, style, testID }: SummaryCardProps) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[styles.summaryCard, style]}
      testID={testID}
    >
      {children}
    </View>
  );
}

export interface ReviewRowProps {
  direction: LayoutDirection;
  icon?: GhafIconName;
  label: string;
  language: TypographyLanguage;
  numeric?: boolean;
  testID?: string;
  value: string;
  valueDirection?: LayoutDirection | 'auto';
}

export function ReviewRow({
  direction,
  icon,
  label,
  language,
  numeric = false,
  testID,
  value,
  valueDirection = 'auto',
}: ReviewRowProps) {
  return (
    <View
      style={[styles.reviewRow, { flexDirection: logicalRowDirection(direction, true) }]}
      testID={testID}
    >
      {icon ? (
        <View style={styles.reviewIcon}>
          <GhafIcon color={colors.ghafEmerald} direction={direction} name={icon} size={24} />
        </View>
      ) : null}
      <View style={styles.reviewCopy}>
        <Text brand color="inkMuted" direction={direction} language={language} variant="caption">
          {label}
        </Text>
        <Text
          brand
          color="onSurface"
          direction={valueDirection}
          language={language}
          tabular={numeric}
          variant="control"
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

export interface InfoRowProps {
  direction: LayoutDirection;
  icon: GhafIconName;
  language: TypographyLanguage;
  message: string;
  tone?: 'muted' | 'primary';
}

export function InfoRow({ direction, icon, language, message, tone = 'muted' }: InfoRowProps) {
  const foreground = tone === 'primary' ? colors.ghafEmerald : colors.onSurfaceVariant;
  return (
    <Row align="flex-start" direction={direction} gap={spacing.sm}>
      <View style={styles.infoIcon}>
        <GhafIcon color={foreground} direction={direction} name={icon} size={20} />
      </View>
      <Text
        brand
        direction={direction}
        language={language}
        style={[styles.infoCopy, { color: foreground }]}
        variant="label"
      >
        {message}
      </Text>
    </Row>
  );
}

export interface LabeledDividerProps {
  direction: LayoutDirection;
  label: string;
  language: TypographyLanguage;
}

export function LabeledDivider({ direction, label, language }: LabeledDividerProps) {
  return (
    <Row direction={direction} gap={spacing.md}>
      <View style={styles.divider} />
      <Text
        align="center"
        brand
        color="inkMuted"
        direction={direction}
        language={language}
        variant="caption"
      >
        {label}
      </Text>
      <View style={styles.divider} />
    </Row>
  );
}

interface FocusablePressableProps extends React.ComponentProps<typeof Pressable> {
  selected?: boolean;
  selectedStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

function FocusablePressable({
  disabled,
  onBlur,
  onFocus,
  selected = false,
  selectedStyle,
  style,
  ...props
}: FocusablePressableProps) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      {...props}
      disabled={disabled}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      pressRetentionOffset={props.pressRetentionOffset ?? spacing.sm}
      style={({ pressed }) => [
        style,
        selected ? styles.selectionSelected : null,
        selected ? selectedStyle : null,
        focused ? styles.selectionFocused : null,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: opacity.pressed,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: opacity.disabled,
  },
  pill: {
    alignSelf: 'center',
    minHeight: 32,
    maxWidth: '100%',
    borderRadius: r001Radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  banner: {
    gap: spacing.sm,
    borderRadius: r001Radii.lg,
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
    borderRadius: r001Radii.md,
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
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    backgroundColor: colors.surfaceContainerLowest,
    ...r001Shadows.soft,
  },
  otpCellFocused: {
    borderColor: colors.ghafEmerald,
    borderWidth: 2,
  },
  otpCellError: {
    borderColor: colors.error,
    backgroundColor: colors.errorContainer,
  },
  otpDigit: {
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
    textAlign: 'center',
    writingDirection: 'ltr',
  },
  segmentedGroup: {
    gap: spacing.sm,
  },
  segments: {
    width: '100%',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  segment: {
    flexGrow: 1,
    flexBasis: 128,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  selectionSelected: {
    borderColor: colors.ghafEmerald,
    borderWidth: 2,
    backgroundColor: colors.leafMist,
  },
  selectionFocused: {
    borderColor: colors.solarAmber,
    borderWidth: 2,
  },
  choiceChip: {
    minHeight: layout.touchTarget,
    minWidth: 92,
    maxWidth: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  choiceChipSelected: {
    borderColor: colors.secondaryContainer,
    backgroundColor: colors.secondaryContainer,
  },
  summaryCard: {
    width: '100%',
    gap: spacing.md,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.lg,
    ...r001Shadows.soft,
  },
  reviewRow: {
    minHeight: layout.touchTarget,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  reviewIcon: {
    width: layout.touchTarget,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.leafMist,
  },
  reviewCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  infoIcon: {
    minHeight: spacing.xl,
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
