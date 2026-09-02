import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { TrustedAdultExit } from '@/components/family-growth/TrustedAdultExit';
import { PreparedMedia } from '@/components/family-growth/PreparedMedia';
import { SyntheticVoicePanel } from '@/components/family-growth/SyntheticVoicePanel';
import { DefinitionOfDone, TaskSteps } from '@/components/family-growth/TaskPanels';
import { JourneyHeader } from '@/components/journey';
import { Button, Input, Screen, Text } from '@/components/primitives';
import { colors, layout, radii, spacing } from '@/design/tokens';
import type { ChildVoiceCommand } from '@/features/assistants/childVoiceController';
import { P0_RECYCLING_TEMPLATE } from '@/features/tasks/demoContent';
import { TASK_REFLECTION_MAX_LENGTH } from '@/features/tasks/validation';
import { bilingualResource, localize } from '@/i18n';
import type { AgeAdaptedCoachResult } from '@/models/assistantVoice';
import type { ChildCoachIntent, ChildCoachResult, LocalizedText } from '@/models/familyGrowth';
import { serviceRegistry } from '@/services';
import { usePrototypeStore } from '@/state/usePrototypeStore';

const COACH_INTENTS: readonly { intent: ChildCoachIntent; key: string }[] = [
  { intent: 'show_steps', key: 'showSteps' },
  { intent: 'simplify_task', key: 'helpPlan' },
  { intent: 'need_adult', key: 'adultExit' },
] as const;

function coachLinesForIntent(
  coach: ChildCoachResult,
  adapted: AgeAdaptedCoachResult,
  intent: ChildCoachIntent,
): readonly LocalizedText[] {
  switch (intent) {
    case 'show_steps':
      return adapted.steps;
    case 'simplify_task':
      return adapted.steps.slice(0, 2);
    case 'create_if_then_cue':
    case 'rehearse_reviewed_phrase':
    case 'respond_to_prepared_fixture':
      return [coach.ifThenCue];
    case 'offer_optional_reflection':
      return coach.optionalReflection ? [coach.optionalReflection] : [];
    case 'need_adult':
      return [];
  }
}

export default function ChildTaskScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const role = usePrototypeStore((state) => state.role);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
  const journey = usePrototypeStore((state) => state.journey);
  const coach = usePrototypeStore((state) => state.childCoachResult);
  const ageAdaptedCoachResult = usePrototypeStore((state) => state.ageAdaptedCoachResult);
  const childVoiceView = usePrototypeStore((state) => state.childVoiceView);
  const childTaskDraft = usePrototypeStore((state) => state.childTaskDraft);
  const startAssignment = usePrototypeStore((state) => state.startAssignment);
  const prepareChildVoice = usePrototypeStore((state) => state.prepareChildVoice);
  const runChildVoiceCommand = usePrototypeStore((state) => state.runChildVoiceCommand);
  const requestChildCoach = usePrototypeStore((state) => state.requestChildCoach);
  const selectPreparedMedia = usePrototypeStore((state) => state.selectPreparedMedia);
  const removePreparedMedia = usePrototypeStore((state) => state.removePreparedMedia);
  const markPreparedMediaUnavailable = usePrototypeStore(
    (state) => state.markPreparedMediaUnavailable,
  );
  const setChildTaskReflection = usePrototypeStore((state) => state.setChildTaskReflection);
  const submitTask = usePrototypeStore((state) => state.submitTask);
  const [busyIntent, setBusyIntent] = useState<ChildCoachIntent | null>(null);
  const [activeCoachIntent, setActiveCoachIntent] = useState<ChildCoachIntent | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [adultSupportRequested, setAdultSupportRequested] = useState(false);
  const [showDefinitionDetails, setShowDefinitionDetails] = useState(false);
  const [showOptionalMedia, setShowOptionalMedia] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasTaskPrerequisite = Boolean(
    journey?.assignment &&
    journey.assignment.childId === activeChildId &&
    journey.task.targetChildId === activeChildId &&
    ['chosen', 'in_progress', 'submitted'].includes(journey.lifecycle),
  );

  useEffect(() => {
    if (role !== 'child') {
      router.replace('/role');
      return;
    }
    if (!hasTaskPrerequisite) router.replace('/child');
  }, [hasTaskPrerequisite, role, router]);

  useEffect(() => {
    if (role === 'child' && journey?.lifecycle === 'in_progress') {
      prepareChildVoice();
    }
  }, [journey?.lifecycle, journey?.task.id, journey?.task.version, prepareChildVoice, role]);

  const askCoach = async (intent: ChildCoachIntent) => {
    setBusyIntent(intent);
    setError(null);
    const result = await requestChildCoach({ requestId: `child-coach-${intent}-v1`, intent });
    setBusyIntent(null);
    if (!result.ok) {
      setError(t('errors.safeRetry'));
      return;
    }
    setActiveCoachIntent(intent);
  };

  const submit = () => {
    setError(null);
    const result = submitTask({
      definitionAcknowledged: acknowledged,
      completionMode: 'permitted_help',
      helpUsed: bilingualResource('checkIn.recordedHelp'),
      preparedMediaFixtureId: childTaskDraft.selectedMediaFixtureId,
      reflection: childTaskDraft.reflection,
      observableFacts: [bilingualResource('checkIn.recordedFact')],
    });
    if (!result.ok) {
      setError(t('errors.safeRetry'));
      return;
    }
  };

  const runVoiceCommand = (command: ChildVoiceCommand) => {
    setError(null);
    const result = runChildVoiceCommand(command);
    if (!result.ok) setError(t('errors.safeRetry'));
  };

  if (role !== 'child') return null;
  if (!hasTaskPrerequisite) return null;
  if (!journey?.assignment) return null;

  const content = journey.task.content;
  const childFacingTitle =
    content.id === P0_RECYCLING_TEMPLATE.id
      ? t('childTask.title')
      : localize(content.title, locale);
  const fixtures = serviceRegistry.media.listPrepared();
  const coachDisclosure =
    ageAdaptedCoachResult?.aiDisclosure ??
    coach?.meta.disclosure.text ??
    serviceRegistry.childCoach.disclosure.text;
  const preparedCoachAvailable = journey.task.version === 1;
  const taskSteps = preparedCoachAvailable
    ? [
        t('childTask.stepOne'),
        t('childTask.stepTwo'),
        t('childTask.stepThree'),
        t('childTask.stepFour'),
      ]
    : [localize(content.positiveAction, locale), localize(content.safety.stopAndAskAdult, locale)];
  const displayedCoachIntent = activeCoachIntent ?? (coach ? 'show_steps' : null);
  const displayedCoachLines =
    coach && ageAdaptedCoachResult && displayedCoachIntent
      ? coachLinesForIntent(coach, ageAdaptedCoachResult, displayedCoachIntent)
      : [];
  const coachIntentLabel = displayedCoachIntent
    ? t(
        displayedCoachIntent === 'need_adult'
          ? 'childTask.adultExit'
          : `childTask.${
              COACH_INTENTS.find(({ intent }) => intent === displayedCoachIntent)?.key ??
              'showSteps'
            }`,
      )
    : null;
  const stepFormatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE');

  if (journey.lifecycle === 'chosen') {
    return (
      <Screen testID="child-task-start-screen">
        <JourneyHeader
          action={<LanguageSwitcher compact showGuidance={false} />}
          eyebrow={t('origin.prepared')}
          onBack={() => router.replace('/child')}
          subtitle={localize(content.whyItMatters, locale)}
          title={childFacingTitle}
        />
        <DefinitionOfDone
          numberOfLines={showDefinitionDetails ? undefined : 4}
          testID="child-definition-of-done"
          title={t('childTask.definition')}
          value={content.definitionOfDone}
        />
        <Button
          accessibilityState={{ expanded: showDefinitionDetails }}
          fullWidth={false}
          onPress={() => setShowDefinitionDetails((value) => !value)}
          style={direction === 'rtl' ? styles.definitionToggleRtl : styles.definitionToggleLtr}
          testID="toggle-definition-details-button"
          variant="ghost"
        >
          {t(
            showDefinitionDetails
              ? 'childTask.hideDefinitionDetails'
              : 'childTask.showDefinitionDetails',
          )}
        </Button>
        <Button
          onPress={() => {
            const result = startAssignment();
            if (!result.ok) setError(t('errors.safeRetry'));
          }}
          testID="start-task-button"
        >
          {t('childHome.openTask')}
        </Button>
      </Screen>
    );
  }

  if (journey.lifecycle === 'submitted') {
    return (
      <Screen testID="child-task-submitted-screen">
        <JourneyHeader
          action={<LanguageSwitcher compact showGuidance={false} />}
          eyebrow={t('origin.synthetic')}
          title={childFacingTitle}
        />
        <View accessibilityLiveRegion="polite" style={styles.submitted}>
          <View style={styles.submittedLeaf} />
          <Text color="forest" variant="heading">
            {t('childTask.submitted')}
          </Text>
          <Text color="inkMuted">{t('taskReview.noEarlyReward')}</Text>
        </View>
        <Button onPress={() => router.replace('/role')}>{t('navigation.switchToParent')}</Button>
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.screenContent} keyboardAware testID="child-task-screen">
      <JourneyHeader
        action={<LanguageSwitcher compact showGuidance={false} />}
        eyebrow={t('origin.prepared')}
        onBack={() => router.replace('/child')}
        subtitle={localize(content.whyItMatters, locale)}
        title={childFacingTitle}
      />
      <DefinitionOfDone
        numberOfLines={showDefinitionDetails ? undefined : 4}
        testID="child-definition-of-done"
        title={t('childTask.definition')}
        value={content.definitionOfDone}
      />
      <Button
        accessibilityState={{ expanded: showDefinitionDetails }}
        fullWidth={false}
        onPress={() => setShowDefinitionDetails((value) => !value)}
        style={direction === 'rtl' ? styles.definitionToggleRtl : styles.definitionToggleLtr}
        testID="toggle-definition-details-button"
        variant="ghost"
      >
        {t(
          showDefinitionDetails
            ? 'childTask.hideDefinitionDetails'
            : 'childTask.showDefinitionDetails',
        )}
      </Button>
      <TaskSteps steps={taskSteps} testID="child-task-steps" />
      <View style={styles.coach}>
        <Text color="forest" variant="heading">
          {t('childTask.coachTitle')}
        </Text>
        {preparedCoachAvailable ? (
          <>
            <Text color="inkMuted" variant="caption">
              {localize(coachDisclosure, locale)}
            </Text>
            <Text color="inkMuted" variant="caption">
              {t('assistant.noChat')}
            </Text>
            <View
              style={[
                styles.intentGrid,
                direction === 'rtl' ? styles.intentGridRtl : styles.intentGridLtr,
              ]}
            >
              {COACH_INTENTS.slice(
                0,
                ageAdaptedCoachResult?.policy.quickChoiceLimit ?? COACH_INTENTS.length,
              ).map(({ intent, key }, index) => (
                <Button
                  busy={busyIntent === intent}
                  busyLabel={t('assistant.loading')}
                  disabled={busyIntent !== null}
                  fullWidth={false}
                  key={intent}
                  onPress={() => void askCoach(intent)}
                  variant="ghost"
                >
                  {ageAdaptedCoachResult?.quickChoices[index]
                    ? localize(ageAdaptedCoachResult.quickChoices[index], locale)
                    : t(`childTask.${key}`)}
                </Button>
              ))}
            </View>
          </>
        ) : (
          <Text color="inkMuted" testID="adjusted-task-coach-unavailable">
            {t('childTask.adjustedCoachUnavailable')}
          </Text>
        )}
        {preparedCoachAvailable && coach && ageAdaptedCoachResult ? (
          <View
            accessibilityLiveRegion="polite"
            style={styles.coachResult}
            testID="child-coach-result"
          >
            {coach.meta.fallbackUsed ? (
              <Text accessibilityLiveRegion="polite" color="earth" variant="caption">
                {t('assistant.unavailable')}
              </Text>
            ) : null}
            <Text color="forest" variant="caption">
              {t('assistant.preparedLabel')}
            </Text>
            <View style={styles.coachPolicy} testID="child-coach-age-policy">
              <Text color="forest" variant="label">
                {t('coachPolicy.title')}
              </Text>
              <Text color="inkMuted" variant="caption">
                {t('coachPolicy.ageAdapted', {
                  band: ageAdaptedCoachResult.ageBand.replace('_', '–'),
                })}
              </Text>
              <Text color="inkMuted" variant="caption">
                {t('coachPolicy.maximumSteps', {
                  count: ageAdaptedCoachResult.policy.maximumSteps,
                })}
                {' · '}
                {t(
                  ageAdaptedCoachResult.policy.pace === 'slow'
                    ? 'coachPolicy.slowerPace'
                    : 'coachPolicy.standardPace',
                )}
              </Text>
              <Text color="inkMuted" variant="caption">
                {t('coachPolicy.taskBound')} {t('coachPolicy.noOpenChat')}
              </Text>
            </View>
            {coachIntentLabel ? (
              <Text color="mangrove" variant="label">
                {coachIntentLabel}
              </Text>
            ) : null}
            {displayedCoachLines.map((line, index) => (
              <Text key={`${displayedCoachIntent}-${line.en}`}>
                {displayedCoachLines.length > 1 ? `${stepFormatter.format(index + 1)}. ` : ''}
                {localize(line, locale)}
              </Text>
            ))}
            {displayedCoachIntent === 'show_steps' && coach.optionalReflection ? (
              <Text color="inkMuted" variant="caption">
                {localize(coach.optionalReflection, locale)}
              </Text>
            ) : null}
            {displayedCoachIntent === 'need_adult' ? (
              <Text color="forest" variant="label">
                {localize(coach.adultExit.label, locale)}
              </Text>
            ) : null}
          </View>
        ) : null}
        <TrustedAdultExit
          body={t('childTask.adultExitBody')}
          label={t('childTask.adultExit')}
          onPress={() => {
            if (preparedCoachAvailable) {
              void askCoach('need_adult');
            } else {
              setAdultSupportRequested(true);
            }
          }}
          testID="trusted-adult-exit"
        />
        {adultSupportRequested ? (
          <Text accessibilityLiveRegion="polite" color="forest" variant="label">
            {t('childTask.adultExitBody')}
          </Text>
        ) : null}
      </View>
      <SyntheticVoicePanel
        onCommand={runVoiceCommand}
        taskSupported={preparedCoachAvailable}
        view={childVoiceView}
      />
      <Button
        accessibilityState={{ expanded: showOptionalMedia }}
        onPress={() => setShowOptionalMedia((value) => !value)}
        testID="toggle-optional-media-button"
        variant="ghost"
      >
        {t(showOptionalMedia ? 'childTask.hideOptionalDetails' : 'childTask.showOptionalDetails')}
      </Button>
      {showOptionalMedia ? (
        <View style={styles.mediaSection} testID="optional-media-section">
          <Text color="forest" variant="heading">
            {t('childTask.mediaTitle')}
          </Text>
          <Text color="inkMuted" variant="caption">
            {t('childTask.mediaDisclosure')}
          </Text>
          {fixtures.map((fixture) => {
            const selected = childTaskDraft.selectedMediaFixtureId === fixture.id;
            const unavailable = childTaskDraft.unavailableMediaFixtureIds.includes(fixture.id);
            return (
              <PreparedMedia
                fixture={fixture}
                key={fixture.id}
                onRemove={() => {
                  const result = removePreparedMedia(fixture.id);
                  if (!result.ok) setError(t('errors.safeRetry'));
                }}
                onSelect={() => {
                  const result = selectPreparedMedia(fixture.id);
                  if (!result.ok) setError(t('errors.safeRetry'));
                }}
                onUnavailable={() => {
                  const result = markPreparedMediaUnavailable(fixture.id);
                  if (!result.ok) setError(t('errors.safeRetry'));
                }}
                selected={selected}
                testID={`prepared-media-${fixture.kind}`}
                unavailable={unavailable}
              />
            );
          })}
          <Text color="inkMuted" variant="caption">
            {t('media.optional')}
          </Text>
          <Input
            accessibilityLanguage={locale === 'ar' ? 'ar-AE' : 'en-AE'}
            direction={direction}
            label={t('childTask.reflection')}
            maxLength={TASK_REFLECTION_MAX_LENGTH}
            multiline
            onChangeText={(value) => {
              const current = childTaskDraft.reflection ?? { ar: '', en: '' };
              const result = setChildTaskReflection({ ...current, [locale]: value });
              if (!result.ok) setError(t('errors.safeRetry'));
            }}
            value={childTaskDraft.reflection?.[locale] ?? ''}
          />
        </View>
      ) : null}
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: acknowledged }}
        onPress={() => setAcknowledged((value) => !value)}
        style={({ pressed }) => [
          styles.acknowledgement,
          direction === 'rtl' ? styles.rowRtl : styles.rowLtr,
          acknowledged ? styles.acknowledged : null,
          pressed ? styles.pressed : null,
        ]}
        testID="definition-acknowledgement"
      >
        <View style={[styles.check, acknowledged ? styles.checkSelected : null]} />
        <Text style={styles.grow}>{t('childTask.acknowledge')}</Text>
      </Pressable>
      <Text color="inkMuted" variant="caption">
        {t('childTask.visibilityBeforeSubmit')}
      </Text>
      {error ? (
        <Text accessibilityLiveRegion="polite" color="danger">
          {error}
        </Text>
      ) : null}
      <Button disabled={!acknowledged} onPress={submit} testID="submit-task-button">
        {t('childTask.submit')}
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: { paddingBottom: spacing.huge },
  grow: { flex: 1, minWidth: 0 },
  definitionToggleLtr: { alignSelf: 'flex-start' },
  definitionToggleRtl: { alignSelf: 'flex-end' },
  coach: {
    gap: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.water,
    paddingVertical: spacing.lg,
  },
  intentGrid: { flexWrap: 'wrap', gap: spacing.xs },
  intentGridRtl: { flexDirection: 'row-reverse' },
  intentGridLtr: { flexDirection: 'row' },
  coachResult: { gap: spacing.sm, backgroundColor: colors.waterLight, padding: spacing.md },
  coachPolicy: {
    gap: spacing.xxs,
    borderStartWidth: 2,
    borderStartColor: colors.mangrove,
    paddingStart: spacing.sm,
  },
  mediaSection: { gap: spacing.md },
  acknowledgement: {
    minHeight: layout.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  acknowledged: { borderColor: colors.ghaf, backgroundColor: colors.leafMist },
  check: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.inkMuted,
    borderRadius: radii.sm,
  },
  checkSelected: { borderColor: colors.ghaf, backgroundColor: colors.ghaf },
  rowRtl: { flexDirection: 'row-reverse' },
  rowLtr: { flexDirection: 'row' },
  pressed: { opacity: 0.74, transform: [{ scale: 0.99 }] },
  submitted: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.huge },
  submittedLeaf: {
    width: 64,
    height: 90,
    borderTopLeftRadius: radii.pill,
    borderBottomRightRadius: radii.pill,
    backgroundColor: colors.ghaf,
    transform: [{ rotate: '20deg' }],
  },
});
