import { Modal, StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { SuccessSheet } from '@/components/access';
import { Text } from '@/components/primitives';
import { botanical, spacing, type LayoutDirection, type TypographyLanguage } from '@/design/tokens';

export interface TaskCreatedSuccessSheetProps {
  visible: boolean;
  direction: LayoutDirection;
  language: TypographyLanguage;
  title: string;
  message: string;
  consequence: string;
  actionLabel: string;
  secondaryLabel: string;
  onAction: () => void;
  onSecondary: () => void;
  onDismiss: () => void;
}

export function TaskCreatedSuccessSheet({
  visible,
  direction,
  language,
  title,
  message,
  consequence,
  actionLabel,
  secondaryLabel,
  onAction,
  onSecondary,
  onDismiss,
}: TaskCreatedSuccessSheetProps) {
  const reducedMotion = useReducedMotion();

  if (!visible) return null;

  return (
    <Modal animationType="none" onRequestClose={onDismiss} statusBarTranslucent transparent visible>
      <View accessibilityViewIsModal style={styles.modalBoundary}>
        <SuccessSheet
          actionLabel={actionLabel}
          announcementMessage={`${message} ${consequence}`}
          direction={direction}
          dismissLabel={actionLabel}
          key={reducedMotion ? 'reduced-motion' : 'standard-motion'}
          language={language}
          message={message}
          onAction={onAction}
          onDismiss={onDismiss}
          onSecondary={onSecondary}
          secondaryLabel={secondaryLabel}
          testID="task-created-success-sheet"
          title={title}
          visible
        >
          <View style={styles.consequence}>
            <Text
              align="center"
              brand
              color="ghafEmerald"
              direction={direction}
              language={language}
              variant="body"
            >
              {consequence}
            </Text>
          </View>
        </SuccessSheet>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBoundary: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 10,
  },
  consequence: {
    borderRadius: botanical.radius.control,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.sage,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
