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
import { colors, layout, radii, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

import { GhafIcon } from './GhafIcon';
import { PrototypePill, type StatusTone } from './AccessControls';

export type AccessBackground = 'dotted' | 'organic' | 'plain' | 'welcome';

interface AccessScreenProps extends PropsWithChildren {
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
  const content = (
    <View style={[styles.contentColumn, { maxWidth: contentMaxWidth }, contentStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.screen} testID={testID}>
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

interface OrganicBackdropProps {
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

interface AccessHeaderProps {
  backLabel?: string;
  brand?: string;
  onBack?: () => void;
  progressLabel?: string;
  step?: number;
  title?: string;
  totalSteps?: number;
  trailing?: ReactNode;
}

export function AccessHeader({
  backLabel = 'Back',
  brand,
  onBack,
  progressLabel,
  step,
  title,
  totalSteps,
  trailing,
}: AccessHeaderProps) {
  const direction = usePrototypeStore((state) => state.direction);
  const resolvedBrand = brand ?? title ?? 'غاف';
  const resolvedProgress =
    progressLabel ??
    (step && totalSteps
      ? direction === 'rtl'
        ? `${step} من ${totalSteps}`
        : `${step} of ${totalSteps}`
      : undefined);

  return (
    <View style={styles.header}>
      <View
        style={[
          styles.headerSlot,
          styles.headerEdge,
          direction === 'rtl' ? styles.edgeRight : styles.edgeLeft,
        ]}
      >
        {onBack ? (
          <IconButton
            icon={
              <GhafIcon color={colors.onSurfaceVariant} direction={direction} name="arrow-back" />
            }
            label={backLabel}
            onPress={onBack}
            style={styles.headerButton}
          />
        ) : null}
      </View>
      <Text align="center" color="ghafEmerald" style={styles.headerBrand} variant="screenTitle">
        {resolvedBrand}
      </Text>
      <View
        style={[
          styles.headerSlot,
          styles.headerEdge,
          direction === 'rtl' ? styles.edgeLeft : styles.edgeRight,
        ]}
      >
        {trailing ??
          (resolvedProgress ? (
            <Text align="center" color="onSurfaceVariant" style={styles.progress} variant="caption">
              {resolvedProgress}
            </Text>
          ) : null)}
      </View>
    </View>
  );
}

interface AccessFooterProps extends PropsWithChildren {
  originLabel?: string;
  originTone?: StatusTone;
  style?: StyleProp<ViewStyle>;
}

export function AccessFooter({
  children,
  originLabel,
  originTone = 'origin',
  style,
}: AccessFooterProps) {
  return (
    <View style={[styles.footer, style]}>
      {children}
      {originLabel ? <PrototypePill message={originLabel} tone={originTone} /> : null}
    </View>
  );
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
    backgroundColor: 'rgba(247,248,243,0.96)',
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  footerColumn: {
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.screenPadding,
  },
  headerSlot: {
    width: layout.touchTarget,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerEdge: {
    position: 'absolute',
    top: spacing.xs,
  },
  edgeRight: {
    right: layout.screenPadding,
  },
  edgeLeft: {
    left: layout.screenPadding,
  },
  headerButton: {
    borderColor: colors.transparent,
    borderRadius: radii.pill,
  },
  headerBrand: {
    width: '100%',
    paddingHorizontal: spacing.massive,
    fontSize: 24,
    lineHeight: 34,
  },
  progress: {
    minWidth: layout.touchTarget,
    fontVariant: ['tabular-nums'],
  },
  footer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
});
