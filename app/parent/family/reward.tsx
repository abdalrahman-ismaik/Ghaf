import { useMemo, useState } from 'react';
import { useRouter, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PrimaryButton, Text } from '@/components/primitives';
import { R002aFlowHeader, R002aScreen } from '@/components/r002a';
import { R003Hero, R003Progress, R003Section, R003Status } from '@/components/r003';
import { botanical, colors, logicalRowDirection, spacing } from '@/design/tokens';
import { localize } from '@/i18n';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function ParentFamilyRewardScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const familyReward = usePrototypeStore((state) => state.familyReward);
  const children = usePrototypeStore((state) => state.children);
  const getFamilyReward = usePrototypeStore((state) => state.getFamilyReward);
  const markGiven = usePrototypeStore((state) => state.markFamilyRewardGiven);
  const [notice, setNotice] = useState<{
    readonly message: string;
    readonly tone: 'success' | 'warning';
  } | null>(null);
  const reward = useMemo(() => {
    void familyReward;
    return getFamilyReward();
  }, [familyReward, getFamilyReward]);
  const formatter = useMemo(
    () => new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', { useGrouping: false }),
    [locale],
  );

  const give = () => {
    const result = markGiven();
    setNotice({
      message: result.ok ? t('r003.reward.givenConfirmation') : t('errors.safeRetry'),
      tone: result.ok ? 'success' : 'warning',
    });
  };

  return (
    <R002aScreen
      header={
        <R002aFlowHeader
          backLabel={t('common.back')}
          direction={direction}
          onBack={() => router.replace('/parent/family' as Href)}
          title={t('r003.reward.title')}
        />
      }
      testID="parent-family-reward-screen"
    >
      <R003Hero
        body={t('r003.reward.body')}
        direction={direction}
        icon="lock"
        language={locale}
        title={t('r003.reward.title')}
      />
      {reward.ok ? (
        <>
          <R003Section testID="private-family-reward-plan">
            <View style={[styles.statusRow, { flexDirection: logicalRowDirection(direction) }]}>
              <View style={styles.statusMark} />
              <Text brand color="deepForest" direction={direction} variant="label">
                {t(`r003.reward.${reward.data.view.lifecycle}`)}
              </Text>
            </View>
            <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
              {t('r003.reward.promiseTitle')}
            </Text>
            <Text brand color="deepForest" direction={direction} variant="screenTitle">
              {localize(reward.data.view.promise.label, locale)}
            </Text>
            <Text brand color="mangroveTeal" direction={direction} variant="label">
              {t('r003.reward.promiseKind')}
            </Text>
            <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
              {t('r003.reward.owner', {
                name: localize(children[reward.data.view.childId].displayName, locale),
              })}
            </Text>
          </R003Section>

          <R003Section title={t('r003.reward.progressTitle')}>
            <Text brand color="deepForest" direction={direction} tabular variant="bodyLarge">
              {t('r003.reward.progress', {
                current: formatter.format(reward.data.currentEligibleSeeds),
                target: formatter.format(reward.data.targetEligibleSeeds),
              })}
            </Text>
            <R003Progress
              accessibilityLabel={t('r003.reward.progress', {
                current: formatter.format(reward.data.currentEligibleSeeds),
                target: formatter.format(reward.data.targetEligibleSeeds),
              })}
              current={reward.data.currentEligibleSeeds}
              direction={direction}
              target={reward.data.targetEligibleSeeds}
            />
            <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
              {reward.data.remainingEligibleSeeds > 0
                ? t('r003.reward.remaining', {
                    count: formatter.format(reward.data.remainingEligibleSeeds),
                  })
                : t('r003.reward.reached')}
            </Text>
          </R003Section>

          <R003Status
            direction={direction}
            icon="shield"
            language={locale}
            message={t('r003.reward.independence')}
          />
          {reward.data.view.lifecycle === 'unlocked' ? (
            <PrimaryButton
              brand
              direction={direction}
              language={locale}
              onPress={give}
              testID="mark-family-reward-given"
            >
              {t('r003.reward.markGiven')}
            </PrimaryButton>
          ) : null}
          {notice ? (
            <R003Status
              direction={direction}
              icon={notice.tone === 'success' ? 'check-filled' : 'info'}
              language={locale}
              message={notice.message}
              tone={notice.tone}
            />
          ) : null}
        </>
      ) : (
        <R003Status
          direction={direction}
          language={locale}
          message={t('r003.reward.unavailable')}
          tone="warning"
        />
      )}
    </R002aScreen>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    borderRadius: botanical.radius.pill,
    backgroundColor: colors.solarAmberTint,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusMark: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.solarAmber },
});
