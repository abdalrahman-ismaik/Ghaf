import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  DisclosureCard,
  JourneyHeader,
  PreparedMediaImage,
  SectionHeading,
} from '@/components/journey';
import { Button, Card, Input, Screen, Text } from '@/components/primitives';
import { formatQuantity } from '@/components/prototype';
import { EmptyState } from '@/components/states';
import { colors, radii, spacing } from '@/design/tokens';
import { localize } from '@/i18n';
import { quantitySchema } from '@/features/missions/validation';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function ParentConfirmationScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const mission = usePrototypeStore((state) => state.activeMission);
  const submission = usePrototypeStore((state) => state.submission);
  const requestRetry = usePrototypeStore((state) => state.requestRetry);
  const approveCompletion = usePrototypeStore((state) => state.approveCompletion);
  const setRole = usePrototypeStore((state) => state.setRole);
  const confirmedUnit = mission?.impactTarget.unit ?? 'grams';
  const [quantity, setQuantity] = useState(() => String(mission?.impactTarget.value ?? 250));
  const [quantityError, setQuantityError] = useState(false);
  const [alreadyApproved, setAlreadyApproved] = useState(false);
  const retryGuidance =
    locale === 'ar'
      ? 'رتّب المكان، ثم أعد إرسال صورة واضحة للطبق.'
      : 'Tidy the space, then send one clear photo of the dish.';

  const retry = () => {
    const result = requestRetry();
    if (!result.ok) return;
    setRole('child');
    router.replace('/child/mission');
  };

  const approve = () => {
    const confirmedQuantity = {
      value: Math.round(Number(quantity)),
      unit: confirmedUnit,
    };
    if (!quantitySchema.safeParse(confirmedQuantity).success) {
      setQuantityError(true);
      return;
    }
    setQuantityError(false);
    const result = approveCompletion(confirmedQuantity);
    if (!result.ok) {
      setQuantityError(result.error.code === 'INVALID_INPUT');
      return;
    }
    if (result.data.alreadyApplied) {
      setAlreadyApproved(true);
      return;
    }
    router.replace('/celebration');
  };

  return (
    <Screen keyboardAware testID="parent-confirmation-screen">
      <JourneyHeader
        eyebrow={t('confirmation.eyebrow')}
        onBack={() => router.replace('/parent')}
        subtitle={t('confirmation.subtitle')}
        title={t('confirmation.title')}
      />

      {!mission || !submission ? (
        <EmptyState
          action={<Button onPress={() => router.replace('/parent')}>{t('common.back')}</Button>}
        />
      ) : (
        <>
          <Card style={styles.submissionCard}>
            <Text color="forest" variant="heading">
              {localize(mission.title, locale)}
            </Text>
            <SectionHeading title={t('confirmation.completedSteps')} />
            <View style={styles.steps}>
              {mission.steps.map((step) => (
                <View key={step.id} style={styles.stepRow}>
                  <View style={styles.check}>
                    <Text align="center" color="white" variant="caption">
                      {step.order}
                    </Text>
                  </View>
                  <Text style={styles.stepText}>{localize(step.instruction, locale)}</Text>
                </View>
              ))}
            </View>
          </Card>

          <View style={styles.section}>
            <SectionHeading title={t('confirmation.evidence')} />
            {submission.evidenceMediaId ? (
              <Card style={styles.evidenceCard}>
                <PreparedMediaImage
                  accessibilityLabel={t('confirmation.preparedEvidence')}
                  mediaId="child-evidence"
                  resizeMode="cover"
                  style={styles.evidenceImage}
                />
                <Text color="inkMuted" variant="caption">
                  {t('confirmation.preparedEvidence')}
                </Text>
              </Card>
            ) : (
              <DisclosureCard body={t('confirmation.confirmationRequested')} kind="prepared" />
            )}
          </View>

          <View style={styles.reflectionCard}>
            <Text color="forest" variant="label">
              {t('confirmation.reflection')}
            </Text>
            <Text color="earth">“{submission.reflection}”</Text>
          </View>

          <View style={styles.quantityCard}>
            <Input
              errorText={quantityError ? t('validation.confirmedQuantityRequired') : undefined}
              helperText={
                mission
                  ? t('confirmation.quantityValue', {
                      quantity: formatQuantity(mission.impactTarget, locale, t),
                    })
                  : undefined
              }
              keyboardType="number-pad"
              label={`${t('confirmation.quantityLabel')} (${t(
                confirmedUnit === 'grams' ? 'mission.gramsUnit' : 'mission.portionsUnit',
              )})`}
              onChangeText={(value) => {
                setQuantity(value);
                setQuantityError(false);
              }}
              testID="confirmed-quantity-input"
              value={quantity}
            />
            <DisclosureCard body={t('confirmation.estimateNote')} kind="estimated" />
          </View>

          <View style={styles.retryBlock}>
            <View style={styles.retryGuidanceCard}>
              <Text color="forest" variant="label">
                {t('confirmation.retryGuidanceLabel')}
              </Text>
              <Text color="inkMuted">{retryGuidance}</Text>
            </View>
            <Text color="inkMuted" variant="caption">
              {t('confirmation.retryNoAward')}
            </Text>
            <Button onPress={retry} testID="request-retry-button" variant="ghost">
              {t('confirmation.requestRetry')}
            </Button>
          </View>

          {alreadyApproved ? (
            <DisclosureCard body={t('confirmation.alreadyApproved')} kind="estimated" />
          ) : null}
          <Button onPress={approve} testID="approve-completion-button">
            {t('confirmation.approveCompletion')}
          </Button>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  submissionCard: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  section: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  steps: {
    gap: spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  check: {
    width: 32,
    height: 32,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.ghaf,
  },
  stepText: {
    minWidth: 0,
    flex: 1,
  },
  evidenceCard: {
    overflow: 'hidden',
    gap: spacing.sm,
    paddingTop: 0,
  },
  evidenceImage: {
    width: '100%',
    height: 210,
    borderRadius: radii.md,
  },
  reflectionCard: {
    gap: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gold,
    backgroundColor: colors.goldGlow,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  quantityCard: {
    gap: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    paddingVertical: spacing.lg,
    marginBottom: spacing.xl,
  },
  retryBlock: {
    gap: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.line,
    paddingTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  retryGuidanceCard: {
    gap: spacing.xs,
    backgroundColor: colors.sandLight,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
});
