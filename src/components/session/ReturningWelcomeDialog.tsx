import { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GhafIcon, type GhafIconName } from '@/components/access';
import { PrimaryButton, Text } from '@/components/primitives';
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

export interface ReturningWelcomeUpdate {
  readonly body: string;
  readonly icon: GhafIconName;
  readonly id: string;
  readonly onPress?: () => void;
  readonly title: string;
}

interface ReturningWelcomeDialogProps {
  readonly actionLabel: string;
  readonly direction: LayoutDirection;
  readonly language: TypographyLanguage;
  readonly message: string;
  readonly onDismiss: () => void;
  readonly summaryLabel: string;
  readonly testID: string;
  readonly title: string;
  readonly updates: readonly ReturningWelcomeUpdate[];
  readonly visible: boolean;
}

export function ReturningWelcomeDialog({
  actionLabel,
  direction,
  language,
  message,
  onDismiss,
  summaryLabel,
  testID,
  title,
  updates,
  visible,
}: ReturningWelcomeDialogProps) {
  const reducedMotion = useReducedMotion();
  const { height, width } = useWindowDimensions();
  const announcementRef = useRef<View>(null);
  const compact = height <= 720 || width <= 340;
  const visibleUpdates = updates.slice(0, 2);

  useEffect(() => {
    if (!visible || Platform.OS === 'web') return undefined;
    const frame = requestAnimationFrame(() => {
      const reactTag = findNodeHandle(announcementRef.current);
      if (reactTag) AccessibilityInfo.setAccessibilityFocus(reactTag);
    });
    return () => cancelAnimationFrame(frame);
  }, [visible]);

  return (
    <Modal
      animationType={reducedMotion ? 'none' : 'fade'}
      hardwareAccelerated
      onRequestClose={onDismiss}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      testID={testID}
      transparent
      visible={visible}
    >
      <View accessibilityViewIsModal importantForAccessibility="yes" style={styles.overlay}>
        <Pressable
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          onPress={onDismiss}
          style={styles.scrim}
        />
        <SafeAreaView
          edges={['top', 'right', 'bottom', 'left']}
          style={[styles.safeArea, compact ? styles.safeAreaCompact : null]}
        >
          <View style={styles.dialog} testID={`${testID}-content`}>
            <View aria-hidden style={styles.accent} />
            <ScrollView
              bounces={false}
              contentContainerStyle={[styles.content, compact ? styles.contentCompact : null]}
              contentInsetAdjustmentBehavior="automatic"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View
                accessibilityLabel={`${title}. ${message}`}
                accessibilityLiveRegion="polite"
                accessible
                ref={announcementRef}
                style={[
                  styles.intro,
                  compact ? styles.introCompact : null,
                  { flexDirection: logicalRowDirection(direction) },
                ]}
              >
                <View
                  accessibilityElementsHidden
                  aria-hidden
                  importantForAccessibility="no-hide-descendants"
                  style={[styles.welcomeMark, compact ? styles.welcomeMarkCompact : null]}
                >
                  <GhafIcon
                    color={colors.ghafEmerald}
                    direction={direction}
                    name="ghaf-tree"
                    size={32}
                  />
                </View>
                <View style={styles.introCopy}>
                  <Text
                    brand
                    color="deepForest"
                    direction={direction}
                    language={language}
                    variant="hero"
                  >
                    {title}
                  </Text>
                  <Text
                    brand
                    color="onSurfaceVariant"
                    direction={direction}
                    language={language}
                    variant="body"
                  >
                    {message}
                  </Text>
                </View>
              </View>

              <View
                style={[styles.privateLabel, { flexDirection: logicalRowDirection(direction) }]}
              >
                <GhafIcon color={colors.mangroveTeal} direction={direction} name="lock" size={18} />
                <Text
                  brand
                  color="onSurfaceVariant"
                  direction={direction}
                  language={language}
                  style={styles.privateLabelText}
                  variant="caption"
                >
                  {summaryLabel}
                </Text>
              </View>

              <View style={styles.updates}>
                {visibleUpdates.map((update, index) => {
                  const content = (
                    <>
                      <View style={styles.updateIcon}>
                        <GhafIcon
                          color={index === 0 ? colors.ghafEmerald : colors.mangroveTeal}
                          direction={direction}
                          name={update.icon}
                          size={23}
                        />
                      </View>
                      <View style={styles.updateCopy}>
                        <Text
                          brand
                          color="deepForest"
                          direction={direction}
                          language={language}
                          variant="label"
                        >
                          {update.title}
                        </Text>
                        <Text
                          brand
                          color="onSurfaceVariant"
                          direction={direction}
                          language={language}
                          variant="caption"
                        >
                          {update.body}
                        </Text>
                      </View>
                      {update.onPress ? (
                        <GhafIcon
                          color={colors.outline}
                          direction={direction}
                          name="chevron"
                          size={20}
                        />
                      ) : null}
                    </>
                  );
                  const rowStyle = [
                    styles.updateRow,
                    compact ? styles.updateRowCompact : null,
                    { flexDirection: logicalRowDirection(direction) },
                    index < visibleUpdates.length - 1 ? styles.updateDivider : null,
                  ];

                  return update.onPress ? (
                    <Pressable
                      accessibilityRole="button"
                      key={update.id}
                      onPress={update.onPress}
                      pressRetentionOffset={spacing.sm}
                      style={({ pressed }) => [rowStyle, pressed ? styles.pressed : null]}
                      testID={`${testID}-update-${update.id}`}
                    >
                      {content}
                    </Pressable>
                  ) : (
                    <View key={update.id} style={rowStyle}>
                      {content}
                    </View>
                  );
                })}
              </View>

              <PrimaryButton
                brand
                direction={direction}
                language={language}
                onPress={onDismiss}
                size="regular"
                testID={`${testID}-continue`}
              >
                {actionLabel}
              </PrimaryButton>
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.transparent,
  },
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.inverseSurface,
    opacity: opacity.scrim,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.xl,
  },
  safeAreaCompact: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dialog: {
    width: '100%',
    maxWidth: layout.readableContentWidth,
    maxHeight: '100%',
    overflow: 'hidden',
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    backgroundColor: colors.surfaceContainerLowest,
    ...r001Shadows.lifted,
  },
  accent: {
    width: '100%',
    height: spacing.xs,
    backgroundColor: colors.ghafEmerald,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  contentCompact: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  intro: {
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  introCompact: {
    gap: spacing.sm,
  },
  welcomeMark: {
    width: 56,
    height: 56,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.lg,
    backgroundColor: colors.ghafEmeraldTint,
  },
  welcomeMarkCompact: {
    width: layout.touchTarget,
    height: layout.touchTarget,
  },
  introCopy: {
    minWidth: 0,
    flex: 1,
    gap: spacing.xs,
  },
  privateLabel: {
    minHeight: layout.touchTarget,
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: r001Radii.md,
    backgroundColor: colors.mangroveTealTint,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  privateLabelText: {
    minWidth: 0,
    flex: 1,
  },
  updates: {
    overflow: 'hidden',
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.r001Surface,
  },
  updateRow: {
    minHeight: 76,
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  updateRowCompact: {
    minHeight: 68,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  updateDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  updateIcon: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerLow,
  },
  updateCopy: {
    minWidth: 0,
    flex: 1,
    gap: spacing.xxs,
  },
  pressed: {
    opacity: opacity.pressed,
    backgroundColor: colors.ghafEmeraldSelection,
  },
});
