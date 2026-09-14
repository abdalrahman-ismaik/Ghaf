import { createContext, useContext, useState, type PropsWithChildren, type ReactNode } from 'react';
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
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { Text as TamaguiText, View as TamaguiView } from 'tamagui';
import { BotanicalPressable } from '@/components/botanical';
import { nativeTextStyles, nativeViewStyles } from '@/design/nativeStyles';

import {
  botanical,
  colors,
  layout,
  logicalRowDirection,
  logicalTextAlign,
  opacity,
  resolveR001TypographyRole,
  resolveTypographyRole,
  spacing,
  type AppColor,
  type R001TypographyRole,
  type TypographyRole,
} from '@/design/tokens';
import type { LocaleCode, TextDirection } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

type BrandTextVariant = Exclude<R001TypographyRole, TypographyRole>;

export type TextVariant = TypographyRole | BrandTextVariant;
export type TextAlign = 'start' | 'center' | 'end';

const GhafFontContext = createContext(false);

export interface GhafFontProviderProps extends PropsWithChildren {
  loaded: boolean;
}

// The application root owns font loading. Until it reports success, every primitive uses a
// platform fallback so a missing asset can never leave onboarding unreadable.
export function GhafFontProvider({ children, loaded }: GhafFontProviderProps) {
  return <GhafFontContext.Provider value={loaded}>{children}</GhafFontContext.Provider>;
}

export interface ScreenProps extends PropsWithChildren {
  // Styles the scrolling or static viewport. Put screen centering here.
  contentContainerStyle?: StyleProp<ViewStyle>;
  // Styles the readable content column. Put section spacing here.
  contentStyle?: StyleProp<ViewStyle>;
  keyboardAware?: boolean;
  keyboardVerticalOffset?: number;
  safeAreaEdges?: Edge[];
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
  safeAreaEdges = ['left', 'right', 'bottom'],
  scroll = true,
  scrollProps,
  testID,
}: ScreenProps) {
  const direction = usePrototypeStore((state) => state.direction);
  const content = <View style={[styles.contentWidth, contentStyle]}>{children}</View>;

  return (
    <SafeAreaView edges={safeAreaEdges} style={styles.screen} testID={testID}>
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

export interface AppTextProps extends React.ComponentProps<typeof NativeText> {
  align?: TextAlign;
  'aria-level'?: number;
  brand?: boolean;
  color?: AppColor;
  direction?: TextDirection | 'auto';
  language?: LocaleCode;
  tabular?: boolean;
  variant?: TextVariant;
}

const baselineRoleNames: Record<TypographyRole, true> = {
  display: true,
  title: true,
  heading: true,
  body: true,
  label: true,
  caption: true,
};

function isBaselineTypographyRole(variant: TextVariant): variant is TypographyRole {
  return variant in baselineRoleNames;
}

function textWebRole(role: AppTextProps['accessibilityRole'] | AppTextProps['role']) {
  if (role === 'header') return 'heading';
  if (role === 'image') return 'img';
  if (role === 'none') return 'presentation';
  if (role === 'adjustable') return 'slider';
  if (role === 'summary') return 'region';
  if (role === 'text' || role === 'imagebutton' || role === 'keyboardkey') return undefined;
  return role as React.ComponentProps<typeof TamaguiText>['role'];
}

// Tamagui 2 renders DOM directly; native accessibility names need explicit web equivalents.
function textAccessibilityProps(
  props: Omit<
    AppTextProps,
    'align' | 'brand' | 'color' | 'direction' | 'language' | 'tabular' | 'variant' | 'style'
  >,
) {
  if (Platform.OS !== 'web') return props;
  const webProps = Object.fromEntries(
    Object.entries(props).filter(
      ([key]) => !key.startsWith('accessibility') && key !== 'accessible' && key !== 'nativeID',
    ),
  );
  const role = textWebRole(props.role ?? props.accessibilityRole);
  return {
    ...webProps,
    id: props.id ?? props.nativeID,
    lang: props.accessibilityLanguage,
    role,
    'aria-level': props['aria-level'] ?? (role === 'heading' ? 2 : undefined),
    'aria-label': props['aria-label'] ?? props.accessibilityLabel,
    'aria-description': props.accessibilityHint,
    'aria-live':
      props['aria-live'] ??
      (props.accessibilityLiveRegion === 'none' ? 'off' : props.accessibilityLiveRegion),
    'aria-hidden': props['aria-hidden'] ?? props.accessibilityElementsHidden,
    'aria-busy': props['aria-busy'] ?? props.accessibilityState?.busy,
    'aria-checked': props['aria-checked'] ?? props.accessibilityState?.checked,
    'aria-disabled': props['aria-disabled'] ?? props.accessibilityState?.disabled,
    'aria-expanded': props['aria-expanded'] ?? props.accessibilityState?.expanded,
    'aria-selected': props['aria-selected'] ?? props.accessibilityState?.selected,
    'aria-valuemin': props['aria-valuemin'] ?? props.accessibilityValue?.min,
    'aria-valuemax': props['aria-valuemax'] ?? props.accessibilityValue?.max,
    'aria-valuenow': props['aria-valuenow'] ?? props.accessibilityValue?.now,
    'aria-valuetext': props['aria-valuetext'] ?? props.accessibilityValue?.text,
  } as const;
}

const brandRoleForBaseline: Record<TypographyRole, R001TypographyRole> = {
  display: 'display',
  title: 'parentHero',
  heading: 'screenTitle',
  body: 'body',
  label: 'label',
  caption: 'caption',
};

export function Text({
  align = 'start',
  brand = false,
  color,
  direction: directionOverride,
  language,
  tabular = false,
  variant = 'body',
  style,
  ...props
}: AppTextProps) {
  const locale = usePrototypeStore((state) => state.locale);
  const storeDirection = usePrototypeStore((state) => state.direction);
  const fontsLoaded = useContext(GhafFontContext);
  const resolvedLanguage = language ?? locale;
  const baselineRole = isBaselineTypographyRole(variant);
  const resolvedColor = color ?? (brand ? 'r001Ink' : 'ink');
  const typographyStyle =
    baselineRole && !brand
      ? resolveTypographyRole(variant, resolvedLanguage)
      : resolveR001TypographyRole(
          baselineRole ? brandRoleForBaseline[variant] : variant,
          resolvedLanguage,
          fontsLoaded,
        );
  const direction = directionOverride ?? storeDirection;
  const alignmentDirection = direction === 'auto' ? storeDirection : direction;

  return (
    <TamaguiText
      unstyled
      {...textAccessibilityProps({
        ...props,
        accessibilityLanguage:
          props.accessibilityLanguage ?? (resolvedLanguage === 'ar' ? 'ar-AE' : 'en-AE'),
        accessibilityRole:
          props.accessibilityRole ??
          (variant === 'display' ||
          variant === 'title' ||
          variant === 'hero' ||
          variant === 'parentHero' ||
          variant === 'screenTitle'
            ? 'header'
            : undefined),
      })}
      {...(Platform.OS === 'web' ? { dir: direction } : {})}
      {...nativeTextStyles([
        Platform.OS === 'web' ? null : styles.textBase,
        typographyStyle,
        { color: colors[resolvedColor] },
        Platform.OS === 'web'
          ? null
          : direction === 'rtl'
            ? styles.writingRtl
            : direction === 'ltr'
              ? styles.writingLtr
              : styles.writingAuto,
        { textAlign: logicalTextAlign(align, alignmentDirection) },
        tabular ? styles.tabularNumbers : null,
        style,
      ])}
    />
  );
}

export type ButtonVariant = 'primary' | 'secondary' | 'neutral' | 'quiet' | 'ghost';
export type ButtonSize = 'compact' | 'regular';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  brand?: boolean;
  busy?: boolean;
  busyLabel?: string;
  children: ReactNode;
  dimWhenDisabled?: boolean;
  direction?: TextDirection;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'start' | 'end';
  language?: LocaleCode;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant;
}

export function Button({
  accessibilityState,
  brand = false,
  busy = false,
  busyLabel,
  children,
  dimWhenDisabled = true,
  direction: directionOverride,
  disabled = false,
  fullWidth = true,
  icon,
  iconPosition = 'start',
  language,
  onBlur,
  onFocus,
  pressRetentionOffset,
  size = 'compact',
  style,
  variant = 'primary',
  ...props
}: ButtonProps) {
  const [focused, setFocused] = useState(false);
  const storeDirection = usePrototypeStore((state) => state.direction);
  const direction = directionOverride ?? storeDirection;
  const resolvedVariant = variant === 'ghost' ? 'quiet' : variant;
  const labelColor: AppColor = brand
    ? resolvedVariant === 'primary'
      ? 'white'
      : resolvedVariant === 'neutral'
        ? 'onSurface'
        : 'ghafEmerald'
    : resolvedVariant === 'primary'
      ? 'white'
      : 'forest';
  const isDisabled = disabled === true || busy;
  const renderedLabel = busy && busyLabel ? busyLabel : children;
  const accessibilityLabel =
    props['aria-label'] ??
    props.accessibilityLabel ??
    (typeof renderedLabel === 'string' ? renderedLabel : undefined);

  return (
    <BotanicalPressable
      {...props}
      aria-busy={busy}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={props.accessibilityRole ?? 'button'}
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
      pressRetentionOffset={pressRetentionOffset ?? spacing.sm}
      style={[
        styles.button,
        brand ? styles.buttonBrand : null,
        size === 'regular' ? styles.buttonRegular : styles.buttonCompact,
        buttonVariants[resolvedVariant],
        brand ? brandButtonVariants[resolvedVariant] : null,
        fullWidth ? styles.fullWidth : null,
        { flexDirection: logicalRowDirection(direction) },
        brand ? style : null,
        focused ? (brand ? styles.brandFocusedControl : styles.focusedControl) : null,
        isDisabled && dimWhenDisabled ? (brand ? styles.brandDisabled : styles.disabled) : null,
        brand ? null : style,
      ]}
    >
      {busy ? <ActivityIndicator color={colors[labelColor]} size="small" /> : null}
      {!busy && icon && iconPosition === 'start' ? (
        <View style={styles.buttonIcon}>{icon}</View>
      ) : null}
      {typeof renderedLabel === 'string' ? (
        <Text
          align="center"
          brand={brand}
          color={labelColor}
          direction={direction}
          language={language}
          style={styles.buttonLabel}
          variant={brand ? 'control' : 'label'}
        >
          {renderedLabel}
        </Text>
      ) : busy && !busyLabel ? null : (
        renderedLabel
      )}
      {!busy && icon && iconPosition === 'end' ? (
        <View style={styles.buttonIcon}>{icon}</View>
      ) : null}
    </BotanicalPressable>
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

export interface CardProps extends PropsWithChildren {
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
    <TamaguiView
      {...(Platform.OS === 'web' ? { 'aria-label': accessibilityLabel } : { accessibilityLabel })}
      {...nativeViewStyles([
        styles.card,
        cardVariants[variant],
        elevated ? styles.cardElevated : null,
        style,
      ])}
      testID={testID}
    >
      {children}
    </TamaguiView>
  );
}

export interface InputProps extends TextInputProps {
  brand?: boolean;
  direction?: TextDirection | 'auto';
  errorText?: string;
  helperText?: string;
  label?: string;
  language?: LocaleCode;
  successText?: string;
}

export function Input({
  brand = false,
  direction: directionOverride,
  editable = true,
  errorText,
  label,
  helperText,
  language,
  multiline,
  onBlur,
  onFocus,
  style,
  successText,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const fontsLoaded = useContext(GhafFontContext);
  const storeDirection = usePrototypeStore((state) => state.direction);
  const locale = usePrototypeStore((state) => state.locale);
  const resolvedLanguage = language ?? locale;
  const inputTypography = brand
    ? resolveR001TypographyRole('body', resolvedLanguage, fontsLoaded)
    : resolveTypographyRole('body', resolvedLanguage);
  const direction = directionOverride ?? storeDirection;
  const statusText = errorText ?? successText ?? helperText;
  const statusColor: AppColor = errorText
    ? brand
      ? 'error'
      : 'danger'
    : successText
      ? brand
        ? 'ghafEmerald'
        : 'success'
      : brand
        ? 'onSurfaceVariant'
        : 'inkMuted';

  return (
    <TamaguiView style={styles.inputGroup}>
      {label ? (
        <Text brand={brand} direction={direction} language={language} variant="label">
          {label}
        </Text>
      ) : null}
      <NativeTextInput
        {...props}
        aria-invalid={Boolean(errorText)}
        accessibilityLabel={props.accessibilityLabel ?? label}
        accessibilityLanguage={
          props.accessibilityLanguage ?? (resolvedLanguage === 'ar' ? 'ar-AE' : 'en-AE')
        }
        accessibilityState={{ ...props.accessibilityState, disabled: !editable }}
        editable={editable}
        multiline={multiline}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        placeholderTextColor={brand ? colors.onSurfaceVariant : colors.inkMuted}
        selectionColor={brand ? colors.primaryContainer : props.selectionColor}
        style={[
          styles.input,
          brand ? styles.inputBrand : null,
          inputTypography,
          multiline ? styles.inputMultiline : null,
          direction === 'rtl'
            ? styles.inputRtl
            : direction === 'ltr'
              ? styles.inputLtr
              : styles.inputAuto,
          brand ? style : null,
          focused ? (brand ? styles.brandFocusedControl : styles.focusedControl) : null,
          successText && !errorText ? styles.inputSuccess : null,
          errorText ? (brand ? styles.brandInputError : styles.inputError) : null,
          !editable && brand ? styles.brandDisabled : null,
          brand ? null : style,
        ]}
      />
      {statusText ? (
        <Text
          accessibilityLiveRegion={errorText || successText ? 'polite' : undefined}
          brand={brand}
          color={statusColor}
          direction={direction}
          language={language}
          variant="caption"
        >
          {statusText}
        </Text>
      ) : null}
    </TamaguiView>
  );
}

export interface IconButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  brand?: boolean;
  icon: ReactNode;
  label: string;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  accessibilityState,
  brand = false,
  disabled,
  icon,
  label,
  onBlur,
  onFocus,
  pressRetentionOffset,
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
      pressRetentionOffset={pressRetentionOffset ?? spacing.sm}
      style={({ pressed }) => [
        styles.iconButton,
        brand ? styles.brandIconButton : null,
        style,
        focused ? (brand ? styles.brandFocusedControl : styles.focusedControl) : null,
        pressed && !disabled ? (brand ? styles.brandPressed : styles.pressed) : null,
        disabled ? (brand ? styles.brandDisabled : styles.disabled) : null,
      ]}
    >
      {icon}
    </Pressable>
  );
}

export interface RowProps extends PropsWithChildren {
  align?: ViewStyle['alignItems'];
  direction?: TextDirection;
  gap?: number;
  reverse?: boolean;
  style?: StyleProp<ViewStyle>;
  wrap?: boolean;
}

export function Row({
  align = 'center',
  children,
  direction: directionOverride,
  gap = spacing.sm,
  reverse = false,
  style,
  wrap = false,
}: RowProps) {
  const storeDirection = usePrototypeStore((state) => state.direction);
  const direction = directionOverride ?? storeDirection;

  return (
    <TamaguiView
      {...nativeViewStyles([
        styles.row,
        {
          alignItems: align,
          flexDirection: logicalRowDirection(direction, reverse),
          flexWrap: wrap ? 'wrap' : 'nowrap',
          gap,
        },
        style,
      ])}
    >
      {children}
    </TamaguiView>
  );
}

const buttonVariants = StyleSheet.create({
  primary: {
    backgroundColor: botanical.colors.forest,
    borderColor: botanical.colors.forest,
  },
  secondary: {
    backgroundColor: botanical.colors.sage,
    borderColor: botanical.colors.sage,
  },
  neutral: {
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.transparent,
  },
  quiet: {
    backgroundColor: colors.transparent,
    borderColor: colors.line,
  },
});

const brandButtonVariants = StyleSheet.create({
  primary: {
    backgroundColor: botanical.colors.forest,
    borderColor: botanical.colors.forest,
  },
  secondary: {
    backgroundColor: botanical.colors.sage,
    borderColor: botanical.colors.sage,
  },
  neutral: {
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.transparent,
  },
  quiet: {
    backgroundColor: colors.transparent,
    borderColor: colors.transparent,
  },
});

const cardVariants = StyleSheet.create({
  paper: {
    backgroundColor: botanical.colors.paper,
    borderColor: botanical.colors.line,
  },
  tonal: {
    backgroundColor: botanical.colors.sage,
    borderColor: botanical.colors.sage,
  },
  water: {
    backgroundColor: botanical.colors.water,
    borderColor: botanical.colors.water,
  },
  coral: {
    backgroundColor: colors.coralLight,
    borderColor: colors.coral,
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: botanical.colors.canvas,
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
  row: {
    minWidth: 0,
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
  tabularNumbers: {
    fontVariant: ['tabular-nums'],
  },
  button: {
    minHeight: layout.touchTarget,
    borderRadius: botanical.radius.control,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  buttonBrand: {
    borderRadius: botanical.radius.control,
  },
  buttonCompact: {
    paddingVertical: spacing.sm,
  },
  buttonRegular: {
    minHeight: layout.controlHeight,
    paddingVertical: spacing.md,
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
  brandPrimaryPressed: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    opacity: opacity.pressed,
    transform: [{ scale: 0.985 }],
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.985 }],
  },
  brandPressed: {
    opacity: opacity.pressed,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.46,
  },
  brandDisabled: {
    opacity: opacity.disabled,
  },
  focusedControl: {
    borderColor: colors.gold,
    borderWidth: 2,
  },
  brandFocusedControl: {
    borderColor: colors.solarAmber,
    borderWidth: 2,
  },
  card: {
    borderRadius: botanical.radius.surface,
    borderCurve: 'continuous',
    borderWidth: 0,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  cardElevated: {
    borderWidth: 0,
    boxShadow: botanical.shadow.surface,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  input: {
    minHeight: layout.touchTarget,
    borderWidth: 1,
    borderColor: botanical.colors.line,
    borderRadius: botanical.radius.control,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.paper,
    color: colors.ink,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputBrand: {
    minHeight: layout.controlHeight,
    borderColor: botanical.colors.line,
    borderRadius: botanical.radius.control,
    backgroundColor: botanical.colors.paper,
    color: colors.r001Ink,
  },
  inputMultiline: {
    minHeight: spacing.huge * 2,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.coral,
    backgroundColor: colors.coralLight,
  },
  brandInputError: {
    borderColor: colors.error,
    backgroundColor: colors.errorContainer,
  },
  inputSuccess: {
    borderColor: colors.success,
  },
  inputRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputLtr: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  inputAuto: {
    textAlign: 'auto',
    writingDirection: 'auto',
  },
  iconButton: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    borderRadius: botanical.radius.control,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: botanical.colors.line,
  },
  brandIconButton: {
    borderRadius: botanical.radius.control,
  },
});
