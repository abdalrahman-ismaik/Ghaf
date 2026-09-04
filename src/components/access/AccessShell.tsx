import type { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Path, Pattern, Rect } from 'react-native-svg';

import { IconButton, Text } from '@/components/primitives';
import {
  colors,
  layout,
  logicalRowDirection,
  r001Radii,
  spacing,
  type LayoutDirection,
  type TypographyLanguage,
} from '@/design/tokens';

import { GhafIcon } from './GhafIcon';

export type AccessBackground = 'dotted' | 'organic' | 'plain' | 'welcome';

export interface AccessScreenProps extends PropsWithChildren {
  accessibilityHidden?: boolean;
  background?: AccessBackground;
  contentContainerStyle?: StyleProp<ViewStyle>;
  contentMaxWidth?: number;
  contentStyle?: StyleProp<ViewStyle>;
  footer?: ReactNode;
  footerStyle?: StyleProp<ViewStyle>;
  header?: ReactNode;
  keyboardAware?: boolean;
  keyboardVerticalOffset?: number;
  scroll?: boolean;
  scrollProps?: Omit<ScrollViewProps, 'contentContainerStyle'>;
  testID?: string;
}

export function AccessScreen({
  accessibilityHidden = false,
  background = 'organic',
  children,
  contentContainerStyle,
  contentMaxWidth = layout.accessContentWidth,
  contentStyle,
  footer,
  footerStyle,
  header,
  keyboardAware = false,
  keyboardVerticalOffset = 0,
  scroll = true,
  scrollProps,
  testID,
}: AccessScreenProps) {
  // R001 rows apply locale direction explicitly so language changes do not require a restart.
  const nativePhysicalDirection: ViewStyle | undefined =
    Platform.OS === 'web' ? undefined : { direction: 'ltr' };
  const webPhysicalDirection = Platform.OS === 'web' ? ({ dir: 'ltr' } as const) : {};
  const content = (
    <View style={[styles.contentColumn, { maxWidth: contentMaxWidth }, contentStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView
      {...webPhysicalDirection}
      accessibilityElementsHidden={accessibilityHidden}
      aria-hidden={accessibilityHidden || undefined}
      edges={['top', 'right', 'bottom', 'left']}
      importantForAccessibility={accessibilityHidden ? 'no-hide-descendants' : 'auto'}
      style={[styles.screen, nativePhysicalDirection]}
      testID={testID}
    >
      <OrganicBackdrop variant={background} />
      {header ? <View style={styles.headerFrame}>{header}</View> : null}
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
            contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={[styles.scroller, scrollProps?.style]}
          >
            {content}
          </ScrollView>
        ) : (
          <View style={[styles.staticContent, contentContainerStyle]}>{content}</View>
        )}
        {footer ? (
          <View style={[styles.footerFrame, footerStyle]}>
            <View style={[styles.footerColumn, { maxWidth: contentMaxWidth }]}>{footer}</View>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export interface OrganicBackdropProps {
  variant?: AccessBackground;
}

export function OrganicBackdrop({ variant = 'organic' }: OrganicBackdropProps) {
  if (variant === 'plain') return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg height="100%" preserveAspectRatio="none" viewBox="0 0 390 844" width="100%">
        <Defs>
          <Pattern height="24" id="ghaf-dots" patternUnits="userSpaceOnUse" width="24">
            <Circle cx="2" cy="2" fill={colors.ghafEmerald} opacity={0.12} r="0.75" />
          </Pattern>
        </Defs>
        <Rect fill="url(#ghaf-dots)" height="844" opacity={0.42} width="390" />
        {variant === 'welcome' ? (
          <>
            <Path
              d="M0 844h390V570c-74-38-128-18-185 20-66 44-122-7-205-48v302z"
              fill={colors.surfaceContainerLow}
              opacity={0.72}
            />
            <Path
              d="M0 844h390V704c-76-22-116 13-171 20-73 9-97-45-147-26-31 12-51 36-72 62v84z"
              fill={colors.surfaceContainer}
              opacity={0.5}
            />
          </>
        ) : null}
        {variant === 'organic' ? (
          <>
            <Path
              d="M0 0h390v104c-79 27-136-2-207 13C108 133 55 156 0 132V0z"
              fill={colors.surfaceContainerLow}
              opacity={0.48}
            />
            <Path
              d="M0 844h390v-78c-64-18-115 13-181 4-72-10-126-45-209-10v84z"
              fill={colors.surfaceContainerLow}
              opacity={0.3}
            />
          </>
        ) : null}
      </Svg>
    </View>
  );
}

export interface AccessHeaderProps {
  backLabel?: string;
  brand: string;
  direction: LayoutDirection;
  language: TypographyLanguage;
  onBack?: () => void;
  progressLabel?: string;
  title?: string;
  trailing?: ReactNode;
}

export function AccessHeader({
  backLabel,
  brand,
  direction,
  language,
  onBack,
  progressLabel,
  title,
  trailing,
}: AccessHeaderProps) {
  const leading = onBack ? (
    <IconButton
      brand
      icon={<GhafIcon color={colors.onSurfaceVariant} direction={direction} name="arrow-back" />}
      label={backLabel ?? title ?? brand}
      onPress={onBack}
      style={styles.headerButton}
    />
  ) : null;

  return (
    <View style={[styles.header, { flexDirection: logicalRowDirection(direction) }]}>
      <View style={styles.headerSlot}>{leading}</View>
      <View style={styles.headerCenter}>
        <Text
          align="center"
          brand
          color="ghafEmerald"
          direction={direction}
          language={language}
          style={styles.headerBrand}
          variant="screenTitle"
        >
          {brand}
        </Text>
        {title ? (
          <Text
            align="center"
            brand
            color="onSurfaceVariant"
            direction={direction}
            language={language}
            variant="caption"
          >
            {title}
          </Text>
        ) : null}
      </View>
      <View style={styles.headerSlot}>
        {trailing ??
          (progressLabel ? (
            <Text
              align="center"
              brand
              color="onSurfaceVariant"
              direction={direction}
              language={language}
              style={styles.progressLabel}
              tabular
              variant="caption"
            >
              {progressLabel}
            </Text>
          ) : null)}
      </View>
    </View>
  );
}

export interface AccessProgressProps {
  accessibilityLabel: string;
  current: number;
  direction: LayoutDirection;
  label?: string;
  language: TypographyLanguage;
  total: number;
}

export function AccessProgress({
  accessibilityLabel,
  current,
  direction,
  label,
  language,
  total,
}: AccessProgressProps) {
  const safeTotal = Math.max(1, total);
  const safeCurrent = Math.min(Math.max(0, current), safeTotal);
  const width = `${(safeCurrent / safeTotal) * 100}%` as const;

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: safeTotal, now: safeCurrent }}
      style={styles.progressGroup}
    >
      {label ? (
        <Text
          brand
          color="onSurfaceVariant"
          direction={direction}
          language={language}
          tabular
          variant="caption"
        >
          {label}
        </Text>
      ) : null}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              alignSelf: direction === 'rtl' ? 'flex-end' : 'flex-start',
              width,
            },
          ]}
        />
      </View>
    </View>
  );
}

export interface AccessActionRegionProps extends PropsWithChildren {
  accessibilityLabel?: string;
  direction: LayoutDirection;
  language: TypographyLanguage;
  supportingText?: string;
  style?: StyleProp<ViewStyle>;
}

export function AccessActionRegion({
  accessibilityLabel,
  children,
  direction,
  language,
  supportingText,
  style,
}: AccessActionRegionProps) {
  return (
    <View accessibilityLabel={accessibilityLabel} style={[styles.actionRegion, style]}>
      {children}
      {supportingText ? (
        <Text
          align="center"
          brand
          color="inkMuted"
          direction={direction}
          language={language}
          variant="caption"
        >
          {supportingText}
        </Text>
      ) : null}
    </View>
  );
}

export interface AccessFooterProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
}

export function AccessFooter({ children, style }: AccessFooterProps) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.pearlGround,
  },
  keyboardRoot: {
    flex: 1,
  },
  scroller: {
    flex: 1,
  },
  headerFrame: {
    flexShrink: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  staticContent: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  contentColumn: {
    alignSelf: 'center',
    width: '100%',
    gap: spacing.xxl,
  },
  footerFrame: {
    flexShrink: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surfaceContainerLow,
    backgroundColor: colors.pearlGround,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  footerColumn: {
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    minHeight: 72,
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.xs,
  },
  headerSlot: {
    width: 64,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },
  headerButton: {
    borderColor: colors.transparent,
    borderRadius: r001Radii.pill,
  },
  headerBrand: {
    width: '100%',
  },
  progressLabel: {
    minWidth: layout.touchTarget,
  },
  progressGroup: {
    width: '100%',
    gap: spacing.xs,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    overflow: 'hidden',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerHigh,
  },
  progressFill: {
    height: '100%',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.ghafEmerald,
  },
  actionRegion: {
    width: '100%',
    gap: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
});
