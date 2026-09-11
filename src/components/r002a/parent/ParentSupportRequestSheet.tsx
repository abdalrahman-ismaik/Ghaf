import { useRef, useState, type RefObject } from 'react';
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
import { PrimaryButton, QuietButton, Text } from '@/components/primitives';
import {
  botanical,
  colors,
  layout,
  logicalRowDirection,
  opacity,
  spacing,
  type LayoutDirection,
  type TypographyLanguage,
} from '@/design/tokens';

export interface ParentSupportStep {
  id: string;
  label: string;
}

interface ParentSupportRequestSheetProps {
  backLabel: string;
  busy: boolean;
  busyLabel: string;
  direction: LayoutDirection;
  error: string | null;
  language: TypographyLanguage;
  message: string;
  noRewardLabel: string;
  onDismiss: () => void;
  onSubmit: (selectedStepIds: readonly string[]) => void;
  returnFocusRef: RefObject<View | null>;
  steps: readonly ParentSupportStep[];
  submitLabel: string;
  title: string;
  visible: boolean;
}

export function ParentSupportRequestSheet({
  backLabel,
  busy,
  busyLabel,
  direction,
  error,
  language,
  message,
  noRewardLabel,
  onDismiss,
  onSubmit,
  returnFocusRef,
  steps,
  submitLabel,
  title,
  visible,
}: ParentSupportRequestSheetProps) {
  const reducedMotion = useReducedMotion();
  const [selectedStepIds, setSelectedStepIds] = useState<readonly string[]>([]);
  const headingRef = useRef<View>(null);
  const nativePhysicalDirection =
    Platform.OS === 'web' ? undefined : ({ direction: 'ltr' } as const);
  const webPhysicalDirection = Platform.OS === 'web' ? ({ dir: 'ltr' } as const) : {};

  const focus = (ref: RefObject<View | null>) => {
    if (Platform.OS === 'web') return;
    const handle = findNodeHandle(ref.current);
    if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
  };

  const dismissAndRestoreFocus = () => {
    if (busy) return;
    onDismiss();
    requestAnimationFrame(() => focus(returnFocusRef));
  };

  const prepareForPresentation = () => {
    setSelectedStepIds([]);
    focus(headingRef);
  };

  const toggleStep = (stepId: string) => {
    setSelectedStepIds((current) =>
      current.includes(stepId)
        ? current.filter((currentId) => currentId !== stepId)
        : [...current, stepId],
    );
  };

  return (
    <Modal
      animationType={reducedMotion ? 'none' : 'slide'}
      onRequestClose={dismissAndRestoreFocus}
      onShow={prepareForPresentation}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View
        {...webPhysicalDirection}
        accessibilityViewIsModal
        importantForAccessibility="yes"
        style={[styles.modal, nativePhysicalDirection]}
        testID="support-request-sheet"
      >
        <Pressable
          accessibilityElementsHidden
          accessible={false}
          disabled={busy}
          importantForAccessibility="no-hide-descendants"
          onPress={dismissAndRestoreFocus}
          style={styles.scrim}
        />
        <View style={styles.sheet}>
          <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
            <View aria-hidden style={styles.handle} />
            <ScrollView
              bounces={false}
              contentContainerStyle={styles.content}
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
                  variant="body"
                >
                  {message}
                </Text>
              </View>

              <View style={styles.stepList}>
                {steps.map((step) => {
                  const selected = selectedStepIds.includes(step.id);
                  return (
                    <Pressable
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: selected }}
                      key={step.id}
                      onPress={() => toggleStep(step.id)}
                      style={({ pressed }) => [
                        styles.step,
                        { flexDirection: logicalRowDirection(direction) },
                        selected ? styles.stepSelected : null,
                        pressed ? styles.pressed : null,
                      ]}
                      testID={`support-step-${step.id}`}
                    >
                      <GhafIcon
                        color={selected ? colors.ghafEmerald : colors.outline}
                        name={selected ? 'check-filled' : 'check'}
                        size={26}
                      />
                      <Text
                        brand
                        color={selected ? 'ghafEmerald' : 'r001Ink'}
                        direction={direction}
                        style={styles.stepLabel}
                        variant="body"
                      >
                        {step.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={[styles.notice, { flexDirection: logicalRowDirection(direction) }]}>
                <GhafIcon color={colors.tertiary} name="info" size={21} />
                <Text
                  brand
                  color="tertiary"
                  direction={direction}
                  style={styles.noticeText}
                  variant="caption"
                >
                  {noRewardLabel}
                </Text>
              </View>

              {error ? (
                <Text accessibilityLiveRegion="assertive" brand color="error" direction={direction}>
                  {error}
                </Text>
              ) : null}

              <PrimaryButton
                brand
                busy={busy}
                busyLabel={busyLabel}
                direction={direction}
                disabled={selectedStepIds.length === 0}
                language={language}
                onPress={() => onSubmit(selectedStepIds)}
                size="regular"
                testID="send-support-request-button"
              >
                {submitLabel}
              </PrimaryButton>
              <QuietButton
                brand
                direction={direction}
                disabled={busy}
                language={language}
                onPress={dismissAndRestoreFocus}
              >
                {backLabel}
              </QuietButton>
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.inverseSurface,
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
    backgroundColor: colors.r001Surface,
  },
  safeArea: {
    maxHeight: '100%',
  },
  handle: {
    position: 'absolute',
    zIndex: 1,
    top: spacing.md,
    width: layout.touchTarget,
    height: 6,
    alignSelf: 'center',
    borderRadius: botanical.radius.pill,
    backgroundColor: colors.outlineVariant,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.huge,
    paddingBottom: spacing.xl,
  },
  heading: {
    gap: spacing.sm,
  },
  stepList: {
    gap: spacing.sm,
  },
  step: {
    minHeight: layout.touchTarget,
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: botanical.radius.control,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: botanical.colors.paper,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  stepSelected: {
    borderColor: colors.ghafEmerald,
    backgroundColor: botanical.colors.sage,
  },
  stepLabel: {
    flex: 1,
  },
  notice: {
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: botanical.radius.small,
    backgroundColor: colors.solarAmberTint,
    padding: spacing.md,
  },
  noticeText: {
    flex: 1,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
