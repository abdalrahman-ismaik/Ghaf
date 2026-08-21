import type { ReactNode } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'react-native-reanimated';

import { Button, Card, Text } from '@/components/primitives';
import { colors, radii, spacing } from '@/design/tokens';

interface LoadingExperienceProps {
  body?: string;
  title?: string;
}

export function LoadingExperience({ body, title }: LoadingExperienceProps) {
  const { t } = useTranslation();

  return (
    <Card style={styles.stateCard} testID="loading-state">
      <View style={styles.loadingOrb}>
        <ActivityIndicator color={colors.ghaf} size="large" />
      </View>
      <Text align="center" color="forest" variant="heading">
        {title ?? t('states.loadingTitle')}
      </Text>
      <Text align="center" color="inkMuted">
        {body ?? t('states.loadingBody')}
      </Text>
    </Card>
  );
}

interface EmptyStateProps {
  action?: ReactNode;
  body?: string;
  title?: string;
}

export function EmptyState({ action, body, title }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <Card style={styles.stateCard} testID="empty-state">
      <View style={styles.emptySeed}>
        <View style={styles.emptyLeaf} />
      </View>
      <Text align="center" color="forest" variant="heading">
        {title ?? t('states.emptyTitle')}
      </Text>
      <Text align="center" color="inkMuted">
        {body ?? t('states.emptyBody')}
      </Text>
      {action ? <View style={styles.action}>{action}</View> : null}
    </Card>
  );
}

interface ErrorStateProps {
  body?: string;
  onRetry?: () => void;
  title?: string;
}

export function ErrorState({ body, onRetry, title }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <Card style={styles.stateCard} testID="error-state">
      <View style={styles.errorMark}>
        <Text align="center" color="danger" variant="heading">
          !
        </Text>
      </View>
      <Text align="center" color="forest" variant="heading">
        {title ?? t('states.errorTitle')}
      </Text>
      <Text align="center" color="inkMuted">
        {body ?? t('states.errorBody')}
      </Text>
      {onRetry ? (
        <View style={styles.action}>
          <Button onPress={onRetry} variant="secondary">
            {t('states.retry')}
          </Button>
        </View>
      ) : null}
    </Card>
  );
}

interface CelebrationOverlayProps {
  body?: string;
  milestone?: string;
  onClose: () => void;
  reward?: string;
  title?: string;
  visible: boolean;
}

export function CelebrationOverlay({
  body,
  milestone,
  onClose,
  reward,
  title,
  visible,
}: CelebrationOverlayProps) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();

  return (
    <Modal
      animationType={reducedMotion ? 'none' : 'fade'}
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.modalRoot}>
        <Pressable
          accessibilityLabel={t('states.close')}
          accessibilityRole="button"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View accessibilityViewIsModal style={styles.celebrationCard}>
          <View pointerEvents="none" style={styles.confettiOne} />
          <View pointerEvents="none" style={styles.confettiTwo} />
          <View style={styles.celebrationIcon}>
            <Text align="center" style={styles.leafGlyph}>
              ❧
            </Text>
          </View>
          <Text align="center" color="forest" variant="title">
            {title ?? t('states.celebrationTitle')}
          </Text>
          <Text align="center" color="inkMuted">
            {body ?? t('states.celebrationBody')}
          </Text>
          {milestone ? (
            <View style={styles.celebrationDetail}>
              <Text align="center" color="gold" variant="caption">
                {t('celebration.milestoneTitle')}
              </Text>
              <Text align="center" color="forest" variant="label">
                {milestone}
              </Text>
              {reward ? (
                <Text align="center" color="earth" variant="caption">
                  {reward}
                </Text>
              ) : null}
            </View>
          ) : null}
          <Button onPress={onClose}>{t('states.close')}</Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  stateCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
    gap: spacing.sm,
  },
  loadingOrb: {
    width: 76,
    height: 76,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.leafLight,
  },
  emptySeed: {
    width: 62,
    height: 48,
    borderRadius: radii.pill,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sandLight,
    transform: [{ rotate: '-8deg' }],
  },
  emptyLeaf: {
    width: 20,
    height: 12,
    borderTopLeftRadius: radii.pill,
    borderBottomRightRadius: radii.pill,
    backgroundColor: colors.ghaf,
    transform: [{ rotate: '-28deg' }],
  },
  errorMark: {
    width: 62,
    height: 62,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dangerLight,
  },
  action: {
    width: '100%',
    paddingTop: spacing.xs,
  },
  modalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(18, 39, 28, 0.62)',
    padding: spacing.lg,
  },
  celebrationCard: {
    width: '100%',
    maxWidth: 460,
    overflow: 'hidden',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.ivory,
    padding: spacing.xxl,
  },
  celebrationIcon: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.leafLight,
  },
  celebrationDetail: {
    width: '100%',
    gap: spacing.xs,
    borderRadius: radii.md,
    borderCurve: 'continuous',
    backgroundColor: colors.goldGlow,
    padding: spacing.md,
  },
  leafGlyph: {
    color: colors.ghaf,
    fontSize: 52,
    lineHeight: 58,
  },
  confettiOne: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.goldLight,
    opacity: 0.7,
    top: -45,
    right: -30,
  },
  confettiTwo: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.leafLight,
    opacity: 0.75,
    bottom: -35,
    left: -24,
  },
});
