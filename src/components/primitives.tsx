import { useState, type PropsWithChildren, type ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as NativeText,
  TextInput as NativeTextInput,
  View,
  type PressableProps,
  type ScrollViewProps,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  colors,
  layout,
  radii,
  resolveTypographyRole,
  shadows,
  spacing,
  type AppColor,
  type TypographyRole,
} from '@/design/tokens';
import type { LocaleCode, TextDirection } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export type TextVariant = TypographyRole;
export type TextAlign = 'start' | 'center' | 'end';

export interface ScreenProps extends PropsWithChildren {
  // Styles the scrolling or static viewport. Put screen centering here.
  contentContainerStyle?: StyleProp<ViewStyle>;
  // Styles the readable content column. Put section spacing here.
  contentStyle?: StyleProp<ViewStyle>;
  keyboardAware?: boolean;
  keyboardVerticalOffset?: number;
  scroll?: boolean;
  scrollProps?: Omit<ScrollViewProps, 'contentContainerStyle'>;
  testID?: string;
}

export function Screen({
  children,
  contentContainerStyle,
  contentStyle,
  keyboardAware = false,
  keyboardVerticalOffset = 0,
  scroll = true,
  scrollProps,
  testID,
}: ScreenProps) {
  const direction = usePrototypeStore((state) => state.direction);
  const content = <View style={[styles.contentWidth, contentStyle]}>{children}</View>;

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.screen} testID={testID}>
      <View
        style={[styles.fieldRule, direction === 'rtl' ? styles.fieldRuleRtl : styles.fieldRuleLtr]}
      >
        <View style={styles.fieldRuleCap} />
        <View style={styles.fieldRuleMark} />
      </View>
      <KeyboardAvoidingView
        behavior={keyboardAware ? (Platform.OS === 'ios' ? 'padding' : 'height') : undefined}
        enabled={keyboardAware}
        keyboardVerticalOffset={keyboardVerticalOffset}
        style={styles.keyboardRoot}
      >
        {scroll ? (
          <ScrollView
            {...scrollProps}
            automaticallyAdjustKeyboardInsets={keyboardAware}
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={[styles.screenContent, contentContainerStyle]}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        ) : (
          <View style={[styles.staticContent, contentContainerStyle]}>{content}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

interface AppTextProps extends React.ComponentProps<typeof NativeText> {
  align?: TextAlign;
  color?: AppColor;
  direction?: TextDirection | 'auto';
  language?: LocaleCode;
  variant?: TextVariant;
}

export function Text({
  align = 'start',
  color = 'ink',
  direction: directionOverride,
  language,
  variant = 'body',
  style,
  ...props
}: AppTextProps) {
  const locale = usePrototypeStore((state) => state.locale);
  const storeDirection = usePrototypeStore((state) => state.direction);
  const resolvedLanguage = language ?? locale;
  const typographyStyle = resolveTypographyRole(variant, resolvedLanguage);
  const direction = directionOverride ?? storeDirection;
  const alignmentDirection = direction === 'auto' ? storeDirection : direction;
  const directionStyle =
    align === 'center'
      ? styles.textCenter
      : align === 'end'
        ? alignmentDirection === 'rtl'
          ? styles.textLeft
          : styles.textRight
        : alignmentDirection === 'rtl'
          ? styles.textRight
          : styles.textLeft;

  return (
    <NativeText
      {...props}
      accessibilityLanguage={
        props.accessibilityLanguage ?? ((language ?? locale) === 'ar' ? 'ar-AE' : 'en-AE')
      }
      accessibilityRole={
        props.accessibilityRole ??
        (variant === 'display' || variant === 'title' ? 'header' : undefined)
      }
      style={[
        styles.textBase,
        typographyStyle,
        { color: colors[color] },
        direction === 'rtl'
          ? styles.writingRtl
          : direction === 'ltr'
            ? styles.writingLtr
            : styles.writingAuto,
        directionStyle,
        style,
      ]}
    />
  );
}

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'ghost';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  busy?: boolean;
  busyLabel?: string;
  children: ReactNode;
  fullWidth?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant;
}

export function Button({
  accessibilityState,
  busy = false,
  busyLabel,
  children,
  disabled = false,
  fullWidth = true,
  icon,
  onBlur,
  onFocus,
  style,
  variant = 'primary',
  ...props
}: ButtonProps) {
  const [focused, setFocused] = useState(false);
  const direction = usePrototypeStore((state) => state.direction);
  const resolvedVariant = variant === 'ghost' ? 'quiet' : variant;
  const labelColor = resolvedVariant === 'primary' ? 'white' : 'forest';
  const isDisabled = disabled === true || busy;
  const renderedLabel = busy && busyLabel ? busyLabel : children;

  return (
    <Pressable
      {...props}
      aria-busy={busy}
      accessibilityRole="button"
      accessibilityState={{ ...accessibilityState, busy, disabled: isDisabled }}
      disabled={isDisabled}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      style={({ pressed }) => [
        styles.button,
        buttonVariants[resolvedVariant],
        fullWidth ? styles.fullWidth : null,
        direction === 'rtl' ? styles.rowRtl : styles.rowLtr,
        focused ? styles.focusedControl : null,
        pressed && !isDisabled
          ? resolvedVariant === 'primary'
            ? styles.primaryPressed
            : styles.pressed
          : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      {busy ? <ActivityIndicator color={colors[labelColor]} size="small" /> : null}
      {!busy && icon ? <View style={styles.buttonIcon}>{icon}</View> : null}
      {typeof renderedLabel === 'string' ? (
        <Text align="center" color={labelColor} style={styles.buttonLabel} variant="label">
          {renderedLabel}
        </Text>
      ) : busy && !busyLabel ? null : (
        renderedLabel
      )}
    </Pressable>
  );
}

type IntentButtonProps = Omit<ButtonProps, 'variant'>;

export function PrimaryButton(props: IntentButtonProps) {
  return <Button {...props} variant="primary" />;
}

export function SecondaryButton(props: IntentButtonProps) {
  return <Button {...props} variant="secondary" />;
}

export function QuietButton(props: IntentButtonProps) {
  return <Button {...props} variant="quiet" />;
}

export type CardVariant = 'paper' | 'tonal' | 'water' | 'coral';

interface CardProps extends PropsWithChildren {
  accessibilityLabel?: string;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  variant?: CardVariant;
}

export function Card({
  accessibilityLabel,
  children,
  elevated = false,
  style,
  testID,
  variant = 'paper',
}: CardProps) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[styles.card, cardVariants[variant], elevated ? styles.cardElevated : null, style]}
      testID={testID}
    >
      {children}
    </View>
  );
}

interface InputProps extends TextInputProps {
  direction?: TextDirection;
  errorText?: string;
  helperText?: string;
  label?: string;
}

export function Input({
  direction: directionOverride,
  errorText,
  label,
  helperText,
  multiline,
  onBlur,
  onFocus,
  style,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const storeDirection = usePrototypeStore((state) => state.direction);
  const locale = usePrototypeStore((state) => state.locale);
  const inputTypography = resolveTypographyRole('body', locale);
  const direction = directionOverride ?? storeDirection;

  return (
    <View style={styles.inputGroup}>
      {label ? <Text variant="label">{label}</Text> : null}
      <NativeTextInput
        {...props}
        accessibilityLabel={props.accessibilityLabel ?? label}
        accessibilityLanguage={props.accessibilityLanguage ?? (locale === 'ar' ? 'ar-AE' : 'en-AE')}
        accessibilityState={{ ...props.accessibilityState, disabled: props.editable === false }}
        multiline={multiline}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        placeholderTextColor={colors.inkMuted}
        style={[
          styles.input,
          inputTypography,
          multiline ? styles.inputMultiline : null,
          direction === 'rtl' ? styles.inputRtl : styles.inputLtr,
          focused ? styles.focusedControl : null,
          errorText ? styles.inputError : null,
          style,
        ]}
      />
      {errorText || helperText ? (
        <Text
          accessibilityLiveRegion={errorText ? 'polite' : undefined}
          color={errorText ? 'danger' : 'inkMuted'}
          variant="caption"
        >
          {errorText ?? helperText}
        </Text>
      ) : null}
    </View>
  );
}

interface IconButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  icon: ReactNode;
  label: string;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  accessibilityState,
  disabled,
  icon,
  label,
  onBlur,
  onFocus,
  style,
  ...props
}: IconButtonProps) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      {...props}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ ...accessibilityState, disabled: disabled === true }}
      disabled={disabled}
      hitSlop={spacing.xs}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      style={({ pressed }) => [
        styles.iconButton,
        focused ? styles.focusedControl : null,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      {icon}
    </Pressable>
  );
}

const buttonVariants = StyleSheet.create({
  primary: {
    backgroundColor: colors.ghaf,
    borderColor: colors.ghaf,
  },
  secondary: {
    backgroundColor: colors.leafLight,
    borderColor: colors.leaf,
  },
  quiet: {
    backgroundColor: colors.transparent,
    borderColor: colors.line,
  },
});

const cardVariants = StyleSheet.create({
  paper: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
  },
  tonal: {
    backgroundColor: colors.leafMist,
    borderColor: colors.leafLight,
  },
  water: {
    backgroundColor: colors.waterLight,
    borderColor: colors.water,
  },
  coral: {
    backgroundColor: colors.coralLight,
    borderColor: colors.coral,
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ivory,
    overflow: 'hidden',
  },
  keyboardRoot: {
    flex: 1,
  },
  screenContent: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.huge,
  },
  staticContent: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  contentWidth: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: layout.maxContentWidth,
    gap: spacing.xl,
  },
  fieldRule: {
    position: 'absolute',
    pointerEvents: 'none',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.line,
    opacity: 0.72,
  },
  fieldRuleRtl: {
    right: spacing.sm,
  },
  fieldRuleLtr: {
    left: spacing.sm,
  },
  fieldRuleCap: {
    position: 'absolute',
    top: spacing.xl,
    width: 1,
    height: spacing.xxxl,
    backgroundColor: colors.ghaf,
  },
  fieldRuleMark: {
    position: 'absolute',
    top: spacing.huge + spacing.xxl,
    width: spacing.xxs,
    height: spacing.xxs,
    marginStart: -2,
    backgroundColor: colors.gold,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  rowLtr: {
    flexDirection: 'row',
  },
  textBase: {
    includeFontPadding: true,
  },
  writingRtl: {
    writingDirection: 'rtl',
  },
  writingLtr: {
    writingDirection: 'ltr',
  },
  writingAuto: {
    writingDirection: 'auto',
  },
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
  textLeft: {
    textAlign: 'left',
  },
  button: {
    minHeight: layout.touchTarget,
    borderRadius: radii.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  fullWidth: {
    width: '100%',
  },
  buttonLabel: {
    flexShrink: 1,
  },
  buttonIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryPressed: {
    backgroundColor: colors.ghafPressed,
    borderColor: colors.ghafPressed,
    transform: [{ scale: 0.985 }],
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.46,
  },
  focusedControl: {
    borderColor: colors.gold,
    borderWidth: 2,
  },
  card: {
    borderRadius: radii.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  cardElevated: {
    borderWidth: 0,
    ...shadows.lifted,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  input: {
    minHeight: layout.touchTarget,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    color: colors.ink,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputMultiline: {
    minHeight: spacing.huge * 2,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.coral,
    backgroundColor: colors.coralLight,
  },
  inputRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputLtr: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  iconButton: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    borderRadius: radii.sm,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.line,
  },
});
