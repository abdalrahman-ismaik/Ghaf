import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DisclosureCard, JourneyHeader, SectionHeading } from '@/components/journey';
import { Button, Card, Screen, Text } from '@/components/primitives';
import { formatQuantity, OriginPill } from '@/components/prototype';
import { EmptyState } from '@/components/states';
import { colors, radii, spacing } from '@/design/tokens';
import { i18n, localize } from '@/i18n';
import type { LocaleCode, Mission } from '@/models/prototype';
import { usePrototypeStore } from '@/state/usePrototypeStore';

interface LanguagePreviewProps {
  language: LocaleCode;
  label: string;
  mission: Mission;
}

function LanguagePreview({ language, label, mission }: LanguagePreviewProps) {
  const fixedT = i18n.getFixedT(language);
  const translate = (key: string, options?: Record<string, unknown>) =>
    String(fixedT(key, options));

  return (
    <Card style={styles.languageCard} testID={`mission-preview-${language}`}>
      <View style={[styles.languageBadge, language === 'ar' ? styles.languageBadgeArabic : null]}>
        <Text color="earth" variant="caption">
          {label}
        </Text>
      </View>
      <Text
        color="forest"
        style={language === 'ar' ? styles.arabicCopy : styles.englishCopy}
        variant="heading"
      >
        {mission.title[language]}
      </Text>
      <Text color="inkMuted" style={language === 'ar' ? styles.arabicCopy : styles.englishCopy}>
        {mission.story[language]}
      </Text>
      <View style={styles.steps}>
        {mission.steps.map((step) => (
          <View
            key={`${language}-${step.id}`}
            style={[styles.previewStep, language === 'ar' ? styles.previewStepArabic : null]}
          >
            <View style={styles.stepNumber}>
              <Text align="center" color="white" variant="caption">
                {step.order}
              </Text>
            </View>
            <Text
              style={[styles.stepCopy, language === 'ar' ? styles.arabicCopy : styles.englishCopy]}
            >
              {step.instruction[language]}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.previewDetails}>
        <Text color="earth" variant="label">
          {translate('childMission.reflectionLabel')}
        </Text>
        <Text style={language === 'ar' ? styles.arabicCopy : styles.englishCopy}>
          {mission.reflectionPrompt[language]}
        </Text>
        <Text color="earth" variant="label">
          {translate('mission.impactTarget')}
        </Text>
        <Text style={language === 'ar' ? styles.arabicCopy : styles.englishCopy}>
          {formatQuantity(mission.impactTarget, language, translate)}
        </Text>
        <Text color="earth" variant="label">
          {translate('mission.evidence')}
        </Text>
        <Text style={language === 'ar' ? styles.arabicCopy : styles.englishCopy}>
          {translate('review.evidenceMethod')}
        </Text>
        <Text color="earth" variant="label">
          {translate('mission.reward')}
        </Text>
        <Text style={language === 'ar' ? styles.arabicCopy : styles.englishCopy}>
          {mission.reward ? mission.reward[language] : translate('common.optional')}
        </Text>
      </View>
    </Card>
  );
}

export default function ParentMissionReviewScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const child = usePrototypeStore((state) => state.family.child);
  const mission = usePrototypeStore((state) => state.activeMission);
  const missionInput = usePrototypeStore((state) => state.missionInput);
  const editMission = usePrototypeStore((state) => state.editMission);
  const approveMission = usePrototypeStore((state) => state.approveMission);
  const setRole = usePrototypeStore((state) => state.setRole);
  const reviewContext = missionInput.quantity
    ? [
        localize(child.displayName, locale),
        t('createMission.foodImageValue'),
        formatQuantity(missionInput.quantity, locale, t),
        t('common.minutes', { count: missionInput.availableMinutes }),
      ].join(' • ')
    : t('states.emptyBody');

  const edit = () => {
    const result = editMission();
    if (result.ok) router.back();
  };

  const approve = () => {
    const result = approveMission();
    if (!result.ok) return;
    setRole('child');
    router.replace('/child');
  };

  return (
    <Screen testID="parent-review-screen">
      <JourneyHeader
        eyebrow={t('review.eyebrow')}
        onBack={() => router.replace('/parent')}
        subtitle={t('review.subtitle')}
        title={t('review.title')}
      />

      {!mission ? (
        <EmptyState
          action={
            <Button onPress={() => router.replace('/parent/create')}>
              {t('parentHome.createMission')}
            </Button>
          }
        />
      ) : (
        <>
          <View style={styles.section}>
            <View style={styles.previewHeading}>
              <SectionHeading title={t('review.bilingualPreview')} />
              <OriginPill origin={mission.origin} />
            </View>
            <LanguagePreview label={t('review.arabicVersion')} language="ar" mission={mission} />
            <LanguagePreview label={t('review.englishVersion')} language="en" mission={mission} />
          </View>

          <Card style={styles.contextCard}>
            <Text color="forest" variant="heading">
              {t('review.familyContext')}
            </Text>
            <Text color="inkMuted">{reviewContext}</Text>
            <View style={styles.rule} />
            <Text color="forest" variant="label">
              {t('mission.impactTarget')}
            </Text>
            <Text color="earth">
              {formatQuantity(mission.impactTarget, locale, t)} ·{' '}
              {t('common.minutes', { count: missionInput.availableMinutes })}
            </Text>
            <Text color="inkMuted" variant="caption">
              {t('review.evidenceMethod')}
            </Text>
            <Text color="forest" variant="label">
              {t('review.reward')}:{' '}
              {mission.reward ? localize(mission.reward, locale) : t('common.optional')}
            </Text>
          </Card>

          <DisclosureCard body={t('review.sourceDisclosure')} kind="simulated" />
          <DisclosureCard body={t('review.approvalNote')} kind="safety" />

          <View style={styles.actions}>
            <Button onPress={edit} testID="edit-mission-button" variant="ghost">
              {t('review.editMission')}
            </Button>
            <Button onPress={approve} testID="approve-mission-button">
              {t('review.approveMission')}
            </Button>
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  previewHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  languageCard: {
    gap: spacing.md,
    borderTopColor: colors.ghaf,
  },
  languageBadge: {
    alignSelf: 'flex-start',
    borderRadius: radii.sm,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.goldGlow,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  languageBadgeArabic: {
    alignSelf: 'flex-end',
  },
  arabicCopy: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  englishCopy: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  steps: {
    gap: spacing.sm,
  },
  previewDetails: {
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: spacing.md,
  },
  previewStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  previewStepArabic: {
    flexDirection: 'row-reverse',
  },
  stepNumber: {
    width: 30,
    height: 30,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.ghaf,
  },
  stepCopy: {
    minWidth: 0,
    flex: 1,
  },
  contextCard: {
    gap: spacing.sm,
    backgroundColor: colors.leafMist,
    borderColor: colors.leaf,
    marginBottom: spacing.lg,
  },
  rule: {
    height: 1,
    backgroundColor: colors.line,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
