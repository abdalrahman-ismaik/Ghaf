import { useRef, type RefObject } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GhafIcon } from '@/components/access';
import { PrimaryButton, SecondaryButton, Text } from '@/components/primitives';
import {
  colors,
  layout,
  logicalRowDirection,
  opacity,
  r001Radii,
  r001Shadows,
  spacing,
} from '@/design/tokens';
import type { TextDirection } from '@/models/familyGrowth';

interface ChildCompletionConfirmationSheetProps {
  awardLabel: string;
  busy: boolean;
  busyLabel: string;
  direction: TextDirection;
  error?: string | null;
  hasMedia: boolean;
  mediaLabel: string;
  message: string;
  noEarlyRewardLabel: string;
  onDismiss: () => void;
  onSubmit: () => void;
  privacyLabel: string;
  reflectionLabel: string;
  returnFocusRef: RefObject<View | null>;
  returnLabel: string;
  submitLabel: string;
  taskCompleteLabel: string;
  taskTitle: string;
  taskTitleLabel: string;
  title: string;
  visible: boolean;
}

export function ChildCompletionConfirmationSheet({
  awardLabel,
  busy,
  busyLabel,
  direction,
  error,
  hasMedia,
  mediaLabel,
  message,
  noEarlyRewardLabel,
  onDismiss,
  onSubmit,
  privacyLabel,
  reflectionLabel,
  returnFocusRef,
  returnLabel,
  submitLabel,
  taskCompleteLabel,
  taskTitle,
  taskTitleLabel,
  title,
  visible,
}: ChildCompletionConfirmationSheetProps) {
  const reducedMotion = useReducedMotion();
  const headingRef = useRef<View>(null);

  const focusHeading = () => {
    if (Platform.OS === 'web') return;
    const handle = findNodeHandle(headingRef.current);
    if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
  };

  const dismissAndRestoreFocus = () => {
    if (busy) return;
    onDismiss();
    if (Platform.OS === 'web') return;
    requestAnimationFrame(() => {
      const handle = findNodeHandle(returnFocusRef.current);
      if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
    });
  };

  return (
    <Modal
      animationType={reducedMotion ? 'none' : 'fade'}
      onShow={focusHeading}
      onRequestClose={dismissAndRestoreFocus}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View
        accessibilityViewIsModal
        importantForAccessibility="yes"
        style={styles.modal}
        testID="task-completion-confirmation"
      >
        <Pressable
          accessibilityElementsHidden
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          disabled={busy}
          onPress={dismissAndRestoreFocus}
          style={styles.scrim}
        />
        <View style={styles.sheet}>
          <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
            <View aria-hidden style={styles.handle} />
            <ScrollView
              bounces={false}
              contentContainerStyle={styles.content}
              contentInsetAdjustmentBehavior="automatic"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View
                accessibilityLabel={`${title}. ${message}`}
                accessible
                ref={headingRef}
                style={styles.heading}
              >
                <Text
                  align="center"
                  brand
                  color="r001Ink"
                  direction={direction}
                  variant="screenTitle"
                >
                  {title}
                </Text>
                <Text
                  align="center"
                  brand
                  color="onSurfaceVariant"
                  direction={direction}
                  variant="bodyLarge"
                >
                  {message}
                </Text>
              </View>

              <View style={styles.summaryCard}>
                <View style={styles.taskIdentity}>
                  <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
                    {taskTitleLabel}
                  </Text>
                  <Text brand color="r001Ink" direction={direction} variant="label">
                    {taskTitle}
                  </Text>
                </View>
                <View style={styles.rule} />
                <SummaryRow
                  direction={direction}
                  icon="check-filled"
                  label={taskCompleteLabel}
                  tone="primary"
                />
                <View style={styles.rule} />
                <SummaryRow
                  direction={direction}
                  icon="energy-leaf"
                  label={awardLabel}
                  tone="primary"
                />
                <SummaryRow
                  direction={direction}
                  icon={hasMedia ? 'check-filled' : 'media-off'}
                  label={mediaLabel}
                  tone="neutral"
                />
                <SummaryRow
                  direction={direction}
                  icon="info"
                  label={reflectionLabel}
                  tone="neutral"
                />
              </View>

              <View style={[styles.privacy, { flexDirection: logicalRowDirection(direction) }]}>
                <GhafIcon color={colors.onSurfaceVariant} name="shield" size={20} />
                <Text
                  brand
                  color="onSurfaceVariant"
                  direction={direction}
                  style={styles.grow}
                  variant="caption"
                >
                  {privacyLabel}
                </Text>
              </View>

              <View style={[styles.notice, { flexDirection: logicalRowDirection(direction) }]}>
                <GhafIcon color={colors.tertiary} name="info" size={20} />
                <Text
                  brand
                  color="tertiary"
                  direction={direction}
                  style={styles.grow}
                  variant="caption"
                >
                  {noEarlyRewardLabel}
                </Text>
              </View>

              {error ? (
                <Text
                  accessibilityLiveRegion="assertive"
                  brand
                  color="danger"
                  direction={direction}
                  testID="task-submit-error"
                >
                  {error}
                </Text>
              ) : null}

              <PrimaryButton
                brand
                busy={busy}
                busyLabel={busyLabel}
                direction={direction}
                icon={
                  <GhafIcon
                    color={colors.onPrimary}
                    direction={direction === 'rtl' ? 'ltr' : 'rtl'}
                    name="arrow-back"
                    size={21}
                  />
                }
                iconPosition="end"
                onPress={onSubmit}
                size="regular"
                testID="submit-task-button"
              >
                {submitLabel}
              </PrimaryButton>
              <SecondaryButton
                brand
                direction={direction}
                disabled={busy}
                onPress={dismissAndRestoreFocus}
                size="regular"
                testID="return-to-active-task-button"
              >
                {returnLabel}
              </SecondaryButton>
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

function SummaryRow({
  direction,
  icon,
  label,
  tone,
}: {
  direction: TextDirection;
  icon: 'check-filled' | 'energy-leaf' | 'info' | 'media-off';
  label: string;
  tone: 'neutral' | 'primary';
}) {
  const color = tone === 'primary' ? colors.ghafEmerald : colors.onSurfaceVariant;
  return (
    <View style={[styles.summaryRow, { flexDirection: logicalRowDirection(direction) }]}>
      <GhafIcon color={color} name={icon} size={24} />
      <Text
        brand
        color={tone === 'primary' ? 'deepForest' : 'onSurfaceVariant'}
        direction={direction}
        style={styles.grow}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.deepForest,
    opacity: opacity.scrim,
  },
  sheet: {
    width: '100%',
    maxWidth: layout.accessContentWidth,
    maxHeight: '90%',
    alignSelf: 'center',
    overflow: 'hidden',
    borderTopLeftRadius: r001Radii.sheet,
    borderTopRightRadius: r001Radii.sheet,
    borderCurve: 'continuous',
    backgroundColor: colors.pearlGround,
    ...r001Shadows.lifted,
  },
  safeArea: {
    maxHeight: '100%',
  },
  handle: {
    position: 'absolute',
    zIndex: 2,
    top: spacing.md,
    width: layout.touchTarget,
    height: 6,
    alignSelf: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.outlineVariant,
    opacity: 0.72,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.huge,
    paddingBottom: spacing.xl,
  },
  heading: {
    gap: spacing.xs,
  },
  summaryCard: {
    gap: spacing.md,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
  },
  summaryRow: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  taskIdentity: {
    gap: spacing.xxs,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.surfaceContainerHigh,
  },
  notice: {
    alignItems: 'flex-start',
    gap: spacing.xs,
    borderRadius: r001Radii.md,
    backgroundColor: colors.solarAmberTint,
    padding: spacing.sm,
  },
  privacy: {
    alignItems: 'flex-start',
    gap: spacing.xs,
    borderRadius: r001Radii.md,
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.sm,
  },
  grow: {
    flex: 1,
    minWidth: 0,
  },
});
