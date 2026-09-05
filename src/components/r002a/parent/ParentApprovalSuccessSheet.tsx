import type { ReactNode } from 'react';
import { Modal, Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'react-native-reanimated';

import { GhafIcon, SuccessSheet } from '@/components/access';
import { Text } from '@/components/primitives';
import {
  colors,
  logicalRowDirection,
  r001Radii,
  spacing,
  type LayoutDirection,
  type TypographyLanguage,
} from '@/design/tokens';
import type { RecognitionReceipt } from '@/models/familyGrowth';

interface ParentApprovalSuccessSheetProps {
  actionLabel: string;
  children?: ReactNode;
  direction: LayoutDirection;
  language: TypographyLanguage;
  landscapeLabel: string;
  landscapeStageAfterLabel: string;
  landscapeStageBeforeLabel: string;
  message: string;
  onOpenGarden: () => void;
  onReturnToTasks: () => void;
  receipt: RecognitionReceipt;
  secondaryLabel: string;
  title: string;
}

export function ParentApprovalSuccessSheet({
  actionLabel,
  children,
  direction,
  language,
  landscapeLabel,
  landscapeStageAfterLabel,
  landscapeStageBeforeLabel,
  message,
  onOpenGarden,
  onReturnToTasks,
  receipt,
  secondaryLabel,
  title,
}: ParentApprovalSuccessSheetProps) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const formatter = new Intl.NumberFormat(language === 'ar' ? 'ar-AE' : 'en-AE');
  const nativePhysicalDirection =
    Platform.OS === 'web' ? undefined : ({ direction: 'ltr' } as const);
  const webPhysicalDirection = Platform.OS === 'web' ? ({ dir: 'ltr' } as const) : {};
  const consequences: { icon: 'energy-leaf' | 'ghaf-tree' | 'leaf'; label: string }[] = [];

  if (receipt.seedTransaction) {
    consequences.push({
      icon: 'energy-leaf',
      label: t('r002aReview.seedReceipt', {
        amount: formatter.format(receipt.seedTransaction.amount),
        before: formatter.format(receipt.seedTransaction.balanceBefore),
        after: formatter.format(receipt.seedTransaction.balanceAfter),
      }),
    });
  }
  if (receipt.landscapeGrowth) {
    consequences.push({
      icon: 'ghaf-tree',
      label: t('r002aReview.landscapeReceipt', {
        landscape: landscapeLabel,
        before: landscapeStageBeforeLabel,
        after: landscapeStageAfterLabel,
        seedsBefore: formatter.format(receipt.landscapeGrowth.seedsBefore),
        seedsAfter: formatter.format(receipt.landscapeGrowth.seedsAfter),
      }),
    });
  }
  if (receipt.canopyContribution) {
    consequences.push({ icon: 'leaf', label: t('r002aReview.canopyReceipt') });
  }
  if (receipt.circleEvent) {
    consequences.push({ icon: 'leaf', label: t('r002aReview.circleReceipt') });
  }

  return (
    <Modal
      animationType="none"
      onRequestClose={onReturnToTasks}
      statusBarTranslucent
      transparent
      visible
    >
      <View
        {...webPhysicalDirection}
        accessibilityViewIsModal
        style={[styles.modalBoundary, nativePhysicalDirection]}
      >
        <SuccessSheet
          actionLabel={actionLabel}
          announcementMessage={`${message} ${consequences.map(({ label }) => label).join(' ')}`}
          direction={direction}
          dismissLabel={actionLabel}
          key={reducedMotion ? 'reduced-motion' : 'standard-motion'}
          language={language}
          message={message}
          onAction={onReturnToTasks}
          onDismiss={onReturnToTasks}
          onSecondary={onOpenGarden}
          secondaryLabel={secondaryLabel}
          testID="parent-approval-success-sheet"
          title={title}
          visible
        >
          <View style={styles.receipt} testID="parent-approval-live-receipt">
            {consequences.map((consequence) => (
              <View
                key={consequence.label}
                style={[styles.receiptRow, { flexDirection: logicalRowDirection(direction) }]}
              >
                <View style={styles.iconWell}>
                  <GhafIcon color={colors.ghafEmerald} name={consequence.icon} size={22} />
                </View>
                <Text
                  brand
                  color="r001Ink"
                  direction={direction}
                  style={styles.receiptText}
                  tabular
                  variant="body"
                >
                  {consequence.label}
                </Text>
              </View>
            ))}
          </View>
          {children}
        </SuccessSheet>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBoundary: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
  },
  receipt: {
    width: '100%',
    gap: spacing.xs,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.ghafEmeraldTint,
    padding: spacing.md,
  },
  receiptRow: {
    minHeight: 44,
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWell: {
    width: 36,
    height: 36,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerLowest,
  },
  receiptText: {
    flex: 1,
  },
});
