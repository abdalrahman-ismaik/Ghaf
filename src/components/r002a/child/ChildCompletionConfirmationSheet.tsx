import { useRef, type RefObject } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GhafIcon } from '@/components/access';
import { PrimaryButton, SecondaryButton, Text } from '@/components/primitives';
import { botanical, colors, layout, logicalRowDirection, opacity, spacing } from '@/design/tokens';
import type { TextDirection } from '@/models/familyGrowth';
import { useTaskModalPresentation } from '@/utils/useTaskModalPresentation';

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
  const headingRef = useRef<View>(null);
  const modalPresentation = useTaskModalPresentation(visible, headingRef, returnFocusRef, 'fade');

  const dismissAndRestoreFocus = () => {
    if (busy || !visible) return;
    onDismiss();
  };

  return (
    <Modal
      animationType={modalPresentation.animationType}
      onShow={modalPresentation.onShow}
      onDismiss={modalPresentation.onDismiss}
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
              style={styles.scroll}
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
            </ScrollView>
            <View style={styles.actions} testID="task-completion-actions">
              <PrimaryButton
                brand
                busy={busy}
                busyLabel={busyLabel}
                direction={direction}
                onPress={() => {
                  if (visible && !busy) onSubmit();
                }}
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
            </View>
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
  const color = tone === 'primary' ? botanical.colors.forest : colors.onSurfaceVariant;
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
    backgroundColor: botanical.colors.ink,
    opacity: opacity.scrim,
  },
  sheet: {
    width: '100%',
    maxWidth: layout.accessContentWidth,
    maxHeight: '90%',
    alignSelf: 'center',
    overflow: 'hidden',
    borderTopLeftRadius: botanical.radius.hero,
    borderTopRightRadius: botanical.radius.hero,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.canvas,
  },
  safeArea: {
    flexShrink: 1,
    maxHeight: '100%',
  },
  scroll: {
    flexShrink: 1,
  },
  actions: {
    flexShrink: 0,
    gap: spacing.sm,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
  },
  handle: {
    position: 'absolute',
    zIndex: 2,
    top: spacing.md,
    width: layout.touchTarget,
    height: 6,
    alignSelf: 'center',
    borderRadius: botanical.radius.pill,
    backgroundColor: botanical.colors.line,
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
    borderRadius: botanical.radius.surface,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: botanical.colors.line,
    backgroundColor: botanical.colors.paper,
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
    backgroundColor: botanical.colors.line,
  },
  notice: {
    alignItems: 'flex-start',
    gap: spacing.xs,
    borderRadius: botanical.radius.small,
    backgroundColor: botanical.colors.amberWash,
    padding: spacing.sm,
  },
  privacy: {
    alignItems: 'flex-start',
    gap: spacing.xs,
    borderRadius: botanical.radius.small,
    backgroundColor: botanical.colors.canvas,
    padding: spacing.sm,
  },
  grow: {
    flex: 1,
    minWidth: 0,
  },
});
