import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, Card, Text } from '@/components/primitives';
import { colors, spacing } from '@/design/tokens';
import { localize } from '@/i18n';
import type { PrivateFamilyRewardView } from '@/models/familyReward';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export interface FamilyRewardPanelProps {
  readonly error: string | null;
  readonly onCreate: () => void;
  readonly onMarkGiven: () => void;
  readonly plan: PrivateFamilyRewardView | null;
  readonly role: 'parent' | 'child';
}

const STATUS_KEYS: Readonly<Record<PrivateFamilyRewardView['lifecycle'], string>> = {
  promised: 'familyReward.promised',
  unlocked: 'familyReward.unlocked',
  given: 'familyReward.given',
};

export function FamilyRewardPanel({
  error,
  onCreate,
  onMarkGiven,
  plan,
  role,
}: FamilyRewardPanelProps) {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);

  if (role === 'child' && !plan) return null;

  return (
    <Card testID="family-reward-panel" variant={plan?.lifecycle === 'unlocked' ? 'water' : 'paper'}>
      <View style={styles.heading}>
        <Text accessibilityRole="header" color="forest" variant="heading">
          {t('familyReward.title')}
        </Text>
        <Text color="inkMuted">
          {t(role === 'parent' ? 'familyReward.parentBody' : 'familyReward.childBody')}
        </Text>
        <Text color="mangrove" variant="caption">
          {t('familyReward.private')}
        </Text>
      </View>

      {plan ? (
        <View accessibilityLiveRegion="polite" style={styles.plan} testID="family-reward-plan">
          <Text color="earth" variant="caption">
            {t(STATUS_KEYS[plan.lifecycle])}
          </Text>
          <Text color="forest" variant="label">
            {localize(plan.promise.label, locale)}
          </Text>
          <Text>{t('familyReward.milestone')}</Text>
          <Text color="inkMuted" variant="caption">
            {t('familyReward.unlockMeaning')}
          </Text>
          {role === 'parent' && plan.lifecycle === 'unlocked' ? (
            <Button onPress={onMarkGiven} testID="mark-family-reward-given" variant="secondary">
              {t('familyReward.markGiven')}
            </Button>
          ) : null}
        </View>
      ) : (
        <View style={styles.empty}>
          <Text color="inkMuted">{t('familyReward.notCreated')}</Text>
          <Button onPress={onCreate} testID="create-family-reward" variant="secondary">
            {t('familyReward.create')}
          </Button>
        </View>
      )}

      {error ? (
        <Text accessibilityLiveRegion="polite" color="danger" testID="family-reward-error">
          {error}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  heading: { gap: spacing.xs },
  plan: {
    gap: spacing.xs,
    borderStartWidth: 1,
    borderStartColor: colors.gold,
    paddingStart: spacing.md,
  },
  empty: { gap: spacing.sm },
});
