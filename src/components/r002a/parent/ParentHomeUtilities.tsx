import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Text } from '@/components/primitives';
import { botanical, colors, spacing } from '@/design/tokens';

interface ParentHomeUtilitiesProps {
  cancelLabel: string;
  confirmingReset: boolean;
  description: string;
  error: string | null;
  languageControl: ReactNode;
  open: boolean;
  resetActionLabel: string;
  resetConfirmLabel: string;
  resetTitle: string;
  switchRoleLabel: string;
  title: string;
  onCancelReset: () => void;
  onConfirmReset: () => void;
  onRequestReset: () => void;
  onSwitchRole: () => void;
}

export function ParentHomeUtilities({
  cancelLabel,
  confirmingReset,
  description,
  error,
  languageControl,
  open,
  resetActionLabel,
  resetConfirmLabel,
  resetTitle,
  switchRoleLabel,
  title,
  onCancelReset,
  onConfirmReset,
  onRequestReset,
  onSwitchRole,
}: ParentHomeUtilitiesProps) {
  return (
    <View>
      {open ? (
        <View
          accessibilityLiveRegion={error ? 'polite' : undefined}
          style={styles.panel}
          testID="parent-settings-panel"
        >
          <View style={styles.heading}>
            <Text brand color="deepForest" variant="screenTitle">
              {title}
            </Text>
            <Text brand color="onSurfaceVariant" variant="caption">
              {description}
            </Text>
          </View>
          {languageControl}
          {confirmingReset ? (
            <View style={styles.confirmation}>
              <Text brand color="error" variant="label">
                {resetTitle}
              </Text>
              <Button brand onPress={onConfirmReset} testID="confirm-reset-button">
                {resetConfirmLabel}
              </Button>
              <Button brand onPress={onCancelReset} testID="cancel-reset-button" variant="quiet">
                {cancelLabel}
              </Button>
            </View>
          ) : (
            <Button brand onPress={onRequestReset} testID="reset-demo-button" variant="secondary">
              {resetActionLabel}
            </Button>
          )}
          <Button brand onPress={onSwitchRole} variant="quiet">
            {switchRoleLabel}
          </Button>
          {error ? (
            <Text accessibilityLiveRegion="polite" brand color="error" variant="caption">
              {error}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing.md,
    borderRadius: botanical.radius.surface,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: botanical.colors.line,
    backgroundColor: botanical.colors.paper,
    padding: spacing.lg,
  },
  heading: {
    gap: spacing.xxs,
  },
  confirmation: {
    gap: spacing.sm,
    borderRadius: botanical.radius.control,
    borderCurve: 'continuous',
    backgroundColor: colors.errorContainer,
    padding: spacing.md,
  },
});
