import { useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AccessHeader,
  AccessScreen,
  BotanicalAvatar,
  InfoRow,
  PrototypePill,
  StatusBanner,
  SummaryCard,
  type BotanicalAvatarId,
} from '@/components/access';
import { Button, Row, Text } from '@/components/primitives';
import { colors, spacing } from '@/design/tokens';
import type { BasicAccessibilityDefault, ChildTreeAvatarId } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

const DRAFT_TO_AVATAR: Record<ChildTreeAvatarId, BotanicalAvatarId> = {
  ghaf_tree: 'ghaf-tree',
  leaf: 'leaf',
  flower: 'flower',
  energy_leaf: 'energy-leaf',
  water_drop: 'water-drop',
};

export default function ReviewCreateScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const parentAccess = usePrototypeStore((state) => state.parentAccess);
  const draft = usePrototypeStore((state) => state.parentOnboardingDraft);
  const completeOnboarding = usePrototypeStore((state) => state.completeParentOnboarding);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!['verified', 'authenticated_parent'].includes(parentAccess.state)) {
    return <Redirect href="/access/parent/sign-in" />;
  }
  if (draft.familyName.trim().length < 2) {
    return <Redirect href="/access/parent/family-basics" />;
  }
  if (draft.child.nickname.trim().length < 2) {
    return <Redirect href="/access/parent/add-first-child" />;
  }

  const ageLabel = {
    '6_8': t('access.setup.ageSixEight'),
    '9_11': t('access.setup.ageNineEleven'),
    '12_14': t('access.setup.ageTwelveFourteen'),
  }[draft.child.ageBand];
  const languageLabel = {
    ar: t('language.arabic'),
    en: t('language.english'),
    both: t('access.setup.bothLanguages'),
  }[draft.child.preferredLanguage];

  const preferenceLabels: Record<BasicAccessibilityDefault, string> = {
    larger_text: t('access.setup.largerText'),
    simpler_instructions: t('access.setup.simplerInstructions'),
    high_contrast: t('access.setup.highContrast'),
    reduced_motion: t('access.setup.reducedMotion'),
  };

  const createFamily = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    await new Promise<void>((resolve) => setTimeout(resolve, 360));
    const result = completeOnboarding();
    setBusy(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    router.push('/access/parent/family-created-success');
  };

  return (
    <AccessScreen
      background="dotted"
      header={
        <AccessHeader
          backLabel={t('common.back')}
          onBack={() => router.replace('/access/parent/add-first-child')}
          step={3}
          title={t('common.brand')}
          totalSteps={3}
        />
      }
      testID="review-create-screen"
    >
      <View style={styles.heading}>
        <Text color="ink" variant="title">
          {t('access.review.title')}
        </Text>
        <Text color="inkMuted">{t('access.review.body')}</Text>
      </View>

      <SummaryCard testID="family-summary-card">
        <Row style={styles.summaryRow}>
          <View style={styles.summaryCopy}>
            <Text color="inkMuted" variant="caption">
              {t('access.review.family')}
            </Text>
            <Text color="ink" variant="label">
              {draft.familyName}
            </Text>
          </View>
          <BotanicalAvatar id="ghaf-tree" size={48} />
        </Row>

        <View style={styles.rule} />

        <View style={styles.childSummary}>
          <Text color="inkMuted" variant="caption">
            {t('access.review.childDetails')}
          </Text>
          <Row gap={spacing.md}>
            <BotanicalAvatar id={DRAFT_TO_AVATAR[draft.child.avatarId]} size={64} />
            <View style={styles.summaryCopy}>
              <Text color="ink" variant="heading">
                {draft.child.nickname}
              </Text>
              <Text color="inkMuted" variant="caption">
                {t('access.review.ageLanguage', {
                  age: `\u2066${ageLabel}\u2069`,
                  language: languageLabel,
                })}
              </Text>
            </View>
          </Row>
          <View style={styles.preferences}>
            {draft.child.accessibilityDefaults.length > 0 ? (
              draft.child.accessibilityDefaults.map((preference) => (
                <PrototypePill
                  icon="info"
                  key={preference}
                  message={preferenceLabels[preference]}
                />
              ))
            ) : (
              <PrototypePill message={t('access.setup.notNow')} />
            )}
          </View>
        </View>
      </SummaryCard>

      <View style={styles.privacyList}>
        <InfoRow icon="shield" message={t('access.review.parentControls')} />
        <InfoRow icon="media-off" message={t('access.review.mediaUnavailable')} />
        <InfoRow icon="league" message={t('access.review.privateLeague')} />
        <InfoRow icon="person-add" message={t('access.review.addChildrenLater')} />
      </View>

      {error ? <StatusBanner message={error} tone="error" /> : null}

      <View style={styles.actions}>
        <Button
          busy={busy}
          busyLabel={t('access.review.creating')}
          onPress={() => void createFamily()}
          testID="create-family-button"
        >
          {t('access.review.create')}
        </Button>
        <Button
          onPress={() => router.replace('/access/parent/add-first-child')}
          testID="edit-family-button"
          variant="secondary"
        >
          {t('access.review.edit')}
        </Button>
      </View>

      <PrototypePill message={t('access.setup.origin')} />
    </AccessScreen>
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: spacing.xs,
  },
  summaryRow: {
    justifyContent: 'space-between',
  },
  summaryCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  rule: {
    height: 1,
    backgroundColor: colors.line,
  },
  childSummary: {
    gap: spacing.md,
  },
  preferences: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  privacyList: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  actions: {
    gap: spacing.sm,
  },
});
