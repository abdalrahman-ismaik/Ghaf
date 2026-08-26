import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  DisclosureCard,
  JourneyHeader,
  PreparedAudioButton,
  PreparedMediaImage,
  PreparedSelectionCard,
  SectionHeading,
} from '@/components/journey';
import { Button, Card, Input, Screen, Text } from '@/components/primitives';
import { ProgressBar } from '@/components/prototype';
import { EmptyState } from '@/components/states';
import { colors, layout, radii, spacing } from '@/design/tokens';
import { localize } from '@/i18n';
import {
  selectCanSubmit,
  selectCompletedStepCount,
  usePrototypeStore,
} from '@/state/usePrototypeStore';

export default function ChildMissionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const mission = usePrototypeStore((state) => state.activeMission);
  const submissionDraft = usePrototypeStore((state) => state.submissionDraft);
  const submission = usePrototypeStore((state) => state.submission);
  const journeyStatus = usePrototypeStore((state) => state.journeyStatus);
  const completedSteps = usePrototypeStore(selectCompletedStepCount);
  const canSubmit = usePrototypeStore(selectCanSubmit);
  const setStepCompleted = usePrototypeStore((state) => state.setStepCompleted);
  const choosePreparedEvidence = usePrototypeStore((state) => state.choosePreparedEvidence);
  const requestParentEvidenceConfirmation = usePrototypeStore(
    (state) => state.requestParentEvidenceConfirmation,
  );
  const setReflection = usePrototypeStore((state) => state.setReflection);
  const submitForConfirmation = usePrototypeStore((state) => state.submitForConfirmation);
  const setRole = usePrototypeStore((state) => state.setRole);

  const submit = () => {
    const result = submitForConfirmation();
    if (!result.ok) return;
    setRole('parent');
    router.replace('/parent/confirmation');
  };

  if (!mission?.approvedByParent) {
    return (
      <Screen testID="child-mission-screen">
        <JourneyHeader
          eyebrow={t('childMission.eyebrow')}
          onBack={() => router.replace('/child')}
          title={t('childMission.title')}
        />
        <EmptyState
          action={<Button onPress={() => router.replace('/child')}>{t('common.back')}</Button>}
        />
      </Screen>
    );
  }

  if (journeyStatus === 'awaiting-parent-confirmation') {
    return (
      <Screen testID="child-mission-screen">
        <JourneyHeader
          eyebrow={t('childMission.eyebrow')}
          onBack={() => router.replace('/child')}
          title={t('childMission.awaitingTitle')}
        />
        <Card style={styles.awaitingCard}>
          <View style={styles.awaitingMark}>
            <View style={styles.awaitingCheckShort} />
            <View style={styles.awaitingCheckLong} />
          </View>
          <Text align="center" color="inkMuted">
            {t('childMission.awaitingBody')}
          </Text>
          <Button
            onPress={() => {
              setRole('parent');
              router.replace('/parent/confirmation');
            }}
          >
            {t('childHome.switchToParent')}
          </Button>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen keyboardAware testID="child-mission-screen">
      <JourneyHeader
        eyebrow={t('childMission.eyebrow')}
        onBack={() => router.replace('/child')}
        subtitle={t('childMission.intro')}
        title={localize(mission.title, locale)}
      />

      {submission?.status === 'retry-requested' ? (
        <DisclosureCard
          body={t('childMission.retryBody')}
          kind="safety"
          title={t('childMission.retryTitle')}
        />
      ) : null}

      <Card style={styles.storyCard}>
        <Text color="forest" variant="heading">
          {t('mission.story')}
        </Text>
        <Text color="inkMuted">{localize(mission.story, locale)}</Text>
        <PreparedAudioButton
          label={t('childMission.narrationLabel')}
          mediaId={locale === 'ar' ? 'mission-narration-ar' : 'mission-narration-en'}
          playingLabel={t('childMission.narrationPlaying')}
          testID="play-mission-narration-button"
        />
      </Card>

      <View style={styles.section}>
        <SectionHeading
          detail={t('childMission.progress', { completed: completedSteps })}
          title={t('mission.steps')}
        />
        <ProgressBar
          label={t('childMission.progress', { completed: completedSteps })}
          value={(completedSteps / 3) * 100}
        />
        {mission.steps.map((step) => (
          <Pressable
            accessibilityHint={
              step.completed ? t('childMission.markIncomplete') : t('childMission.markComplete')
            }
            accessibilityRole="checkbox"
            accessibilityState={{ checked: step.completed }}
            key={step.id}
            onPress={() => setStepCompleted(step.id, !step.completed)}
            style={({ pressed }) => [
              styles.stepCard,
              direction === 'rtl' ? styles.rowRtl : null,
              step.completed ? styles.stepCardComplete : null,
              pressed ? styles.pressed : null,
            ]}
            testID={`mission-step-${step.order}`}
          >
            <View style={[styles.stepCheck, step.completed ? styles.stepCheckComplete : null]}>
              <Text align="center" color={step.completed ? 'white' : 'forest'} variant="label">
                {step.order}
              </Text>
              {step.completed ? <View style={styles.completedTick} /> : null}
            </View>
            <Text color="forest" style={styles.stepText} variant="label">
              {localize(step.instruction, locale)}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.section}>
        <SectionHeading title={t('childMission.evidenceTitle')} />
        <PreparedSelectionCard
          detail={t('confirmation.preparedEvidence')}
          label={t('childMission.preparedEvidence')}
          mediaId="child-evidence"
          onPress={choosePreparedEvidence}
          selected={submissionDraft.evidenceMediaId !== null}
          testID="prepared-evidence-button"
        />
        <PreparedSelectionCard
          detail={t('childMission.confirmationSelected')}
          label={t('childMission.parentConfirmation')}
          onPress={requestParentEvidenceConfirmation}
          selected={submissionDraft.parentConfirmationRequested}
          testID="parent-confirmation-evidence-button"
        />
        {submissionDraft.evidenceMediaId ? (
          <View style={styles.evidencePreview}>
            <PreparedMediaImage
              mediaId="child-evidence"
              resizeMode="cover"
              style={styles.evidenceImage}
            />
            <Text color="ghaf" variant="caption">
              {t('childMission.evidenceSelected')}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <SectionHeading title={t('childMission.reflectionLabel')} />
        <Input
          accessibilityLabel={localize(mission.reflectionPrompt, locale)}
          helperText={localize(mission.reflectionPrompt, locale)}
          multiline
          onChangeText={setReflection}
          placeholder={t('childMission.reflectionPlaceholder')}
          style={styles.reflectionInput}
          testID="reflection-input"
          value={submissionDraft.reflection}
        />
      </View>

      <DisclosureCard body={t('childMission.safetyReminder')} kind="safety" />

      {!canSubmit ? (
        <Text align="center" color="inkMuted" variant="caption">
          {t('childMission.submitLocked')}
        </Text>
      ) : null}
      <Button disabled={!canSubmit} onPress={submit} testID="submit-for-parent-button">
        {t('childMission.submit')}
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  storyCard: {
    gap: spacing.md,
    borderColor: colors.sand,
    marginBottom: spacing.xl,
  },
  section: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  stepCard: {
    flexDirection: 'row',
    minHeight: 84,
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  stepCardComplete: {
    borderColor: colors.ghaf,
    backgroundColor: colors.successLight,
  },
  stepCheck: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.leaf,
    backgroundColor: colors.ivory,
  },
  stepCheckComplete: {
    borderColor: colors.ghaf,
    backgroundColor: colors.ghaf,
  },
  completedTick: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.goldLight,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  stepText: {
    minWidth: 0,
    flex: 1,
  },
  evidencePreview: {
    overflow: 'hidden',
    gap: spacing.sm,
    borderRadius: radii.md,
    borderCurve: 'continuous',
    backgroundColor: colors.leafMist,
    paddingBottom: spacing.md,
  },
  evidenceImage: {
    width: '100%',
    height: 168,
  },
  reflectionInput: {
    minHeight: 118,
    textAlignVertical: 'top',
  },
  awaitingCard: {
    gap: spacing.lg,
    alignItems: 'center',
    borderColor: colors.leaf,
    backgroundColor: colors.leafMist,
  },
  awaitingMark: {
    width: 58,
    height: 52,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.leaf,
    backgroundColor: colors.surface,
  },
  awaitingCheckShort: {
    position: 'absolute',
    left: 14,
    top: 28,
    width: 15,
    height: 3,
    backgroundColor: colors.ghaf,
    transform: [{ rotate: '45deg' }],
  },
  awaitingCheckLong: {
    position: 'absolute',
    left: 24,
    top: 24,
    width: 25,
    height: 3,
    backgroundColor: colors.ghaf,
    transform: [{ rotate: '-48deg' }],
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
