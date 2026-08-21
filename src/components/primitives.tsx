import { useState, type PropsWithChildren, type ReactNode } from 'react';
import {
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

import {
  colors,
  layout,
  radii,
  shadows,
  spacing,
  typography,
  type AppColor,
} from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

type TextVariant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption';
type TextAlign = 'start' | 'center' | 'end';

interface ScreenProps extends PropsWithChildren {
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardAware?: boolean;
  scrollProps?: Omit<ScrollViewProps, 'contentContainerStyle'>;
  testID?: string;
}

export function Screen({
  children,
  contentContainerStyle,
  keyboardAware = false,
  scrollProps,
  testID,
}: ScreenProps) {
  const direction = usePrototypeStore((state) => state.direction);

  return (
    <View style={styles.screen} testID={testID}>
      <View pointerEvents="none" style={styles.ambientTop} />
      <View pointerEvents="none" style={styles.ambientBottom} />
      <KeyboardAvoidingView
        behavior={keyboardAware && Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={keyboardAware}
        style={styles.keyboardRoot}
      >
        <ScrollView
          {...scrollProps}
          automaticallyAdjustKeyboardInsets={keyboardAware}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={[
            styles.screenContent,
            direction === 'rtl' ? styles.directionRtl : styles.directionLtr,
            contentContainerStyle,
          ]}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentWidth}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

interface AppTextProps extends React.ComponentProps<typeof NativeText> {
  align?: TextAlign;
  color?: AppColor;
  variant?: TextVariant;
}

export function Text({
  align = 'start',
  color = 'ink',
  variant = 'body',
  style,
  ...props
}: AppTextProps) {
  const direction = usePrototypeStore((state) => state.direction);
  const directionStyle =
    align === 'center'
      ? styles.textCenter
      : align === 'end'
        ? direction === 'rtl'
          ? styles.textLeft
          : styles.textRight
        : direction === 'rtl'
          ? styles.textRight
          : styles.textLeft;

  return (
    <NativeText
      {...props}
      style={[
        styles.textBase,
        textVariants[variant],
        { color: colors[color] },
        direction === 'rtl' ? styles.writingRtl : styles.writingLtr,
        directionStyle,
        style,
      ]}
    />
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  children: ReactNode;
  fullWidth?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant;
}

export function Button({
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
  const labelColor = variant === 'primary' ? 'white' : variant === 'secondary' ? 'forest' : 'ghaf';
  const isDisabled = disabled === true;

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
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
        buttonVariants[variant],
        fullWidth ? styles.fullWidth : null,
        direction === 'rtl' ? styles.directionRtl : styles.directionLtr,
        focused ? styles.focusedControl : null,
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      {icon ? <View style={styles.buttonIcon}>{icon}</View> : null}
      {typeof children === 'string' ? (
        <Text align="center" color={labelColor} style={styles.buttonLabel} variant="label">
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

interface CardProps extends PropsWithChildren {
  accessibilityLabel?: string;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Card({ accessibilityLabel, children, elevated = false, style, testID }: CardProps) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[styles.card, elevated ? styles.cardElevated : null, style]}
      testID={testID}
    >
      {children}
    </View>
  );
}

interface InputProps extends TextInputProps {
  errorText?: string;
  label?: string;
  helperText?: string;
}

export function Input({
  errorText,
  label,
  helperText,
  onBlur,
  onFocus,
  style,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const direction = usePrototypeStore((state) => state.direction);

  return (
    <View style={styles.inputGroup}>
      {label ? <Text variant="label">{label}</Text> : null}
      <NativeTextInput
        {...props}
        accessibilityLabel={props.accessibilityLabel ?? label}
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
          direction === 'rtl' ? styles.inputRtl : styles.inputLtr,
          focused ? styles.focusedControl : null,
          errorText ? styles.inputError : null,
          style,
        ]}
      />
      {errorText || helperText ? (
        <Text color={errorText ? 'danger' : 'inkMuted'} variant="caption">
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

export function IconButton({ icon, label, onBlur, onFocus, style, ...props }: IconButtonProps) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      {...props}
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={8}
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
        pressed ? styles.pressed : null,
        style,
      ]}
    >
      {typeof icon === 'string' ? (
        <Text align="center" style={styles.iconGlyph}>
          {icon}
        </Text>
      ) : (
        icon
      )}
    </Pressable>
  );
}

const textVariants = StyleSheet.create({
  display: {
    fontSize: typography.sizes.display,
    lineHeight: typography.lineHeights.display,
    fontWeight: typography.weights.heavy,
    letterSpacing: -1.2,
  },
  title: {
    fontSize: typography.sizes.title,
    lineHeight: typography.lineHeights.title,
    fontWeight: typography.weights.bold,
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: typography.sizes.heading,
    lineHeight: typography.lineHeights.heading,
    fontWeight: typography.weights.bold,
  },
  body: {
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
    fontWeight: typography.weights.regular,
  },
  label: {
    fontSize: typography.sizes.label,
    lineHeight: typography.lineHeights.label,
    fontWeight: typography.weights.semibold,
  },
  caption: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.lineHeights.caption,
    fontWeight: typography.weights.medium,
  },
});

const buttonVariants = StyleSheet.create({
  primary: {
    backgroundColor: colors.ghaf,
    borderColor: colors.ghaf,
  },
  secondary: {
    backgroundColor: colors.leafLight,
    borderColor: colors.leafLight,
  },
  ghost: {
    backgroundColor: colors.transparent,
    borderColor: colors.line,
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.huge,
  },
  contentWidth: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: layout.maxContentWidth,
  },
  ambientTop: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderCurve: 'continuous',
    backgroundColor: colors.sandLight,
    opacity: 0.58,
    top: -135,
    right: -90,
  },
  ambientBottom: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderCurve: 'continuous',
    backgroundColor: colors.leafLight,
    opacity: 0.48,
    bottom: -125,
    left: -90,
  },
  directionRtl: {
    direction: 'rtl',
  },
  directionLtr: {
    direction: 'ltr',
  },
  textBase: {
    fontFamily: typography.family,
    includeFontPadding: false,
  },
  writingRtl: {
    writingDirection: 'rtl',
    letterSpacing: 0,
  },
  writingLtr: {
    writingDirection: 'ltr',
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
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.45,
  },
  focusedControl: {
    borderColor: colors.gold,
    borderWidth: 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.soft,
  },
  cardElevated: {
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
    fontFamily: typography.family,
    fontSize: typography.sizes.body,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputError: {
    borderColor: colors.danger,
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
    borderRadius: radii.pill,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  iconGlyph: {
    fontSize: typography.sizes.heading,
    lineHeight: typography.lineHeights.heading,
  },
});
