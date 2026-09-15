import { MessagingEntry } from '@/components/familyMessaging/MessagingEntry';
import { MasroofiTaskRewardNotice } from '@/components/masroofi/MasroofiTaskRewardNotice';
import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { CompanionPortrait } from '@/components/companion/CompanionPortrait';
import { Button, Text } from '@/components/primitives';
import { R002aFlowHeader, R002aScreen } from '@/components/r002a';
import { localize } from '@/i18n';
import type { CompletionMode, TaskJourney } from '@/models/familyGrowth';
import { selectCanEnterChildExperience, usePrototypeStore } from '@/state/usePrototypeStore';
import { CatalogDetails, CatalogToggle, catalogStyles } from './CatalogDetails';

export function CatalogChildTask({ journey }: { journey: TaskJourney }) {
  const { t } = useTranslation();
  const router = useRouter();
  const direction = usePrototypeStore((state) => state.direction);
  const locale = usePrototypeStore((state) => state.locale);
  const authorized = usePrototypeStore(selectCanEnterChildExperience);
  const childId = usePrototypeStore((state) => state.activeChildId);
  const requests = usePrototypeStore((state) => state.catalogSupportRequests);
  const [checked, setChecked] = useState<readonly string[]>([]);
  const [ack, setAck] = useState(false);
  const [mode, setMode] = useState<CompletionMode | null>(null);
  const [help, setHelp] = useState(false);
  const [adult, setAdult] = useState(false);
  const [error, setError] = useState(false);
  const content = journey.task.content;
  const metadata = content.catalogExecution;
  const back = () => router.replace('/child');
  if (!authorized || journey.assignment?.childId !== childId || !metadata) return null;
  const act = (command: () => { ok: boolean }) => {
    setError(!command().ok);
  };
  const start = () => {
    const state = usePrototypeStore.getState();
    if (journey.lifecycle === 'assigned') {
      const choice = state.choicePool.p0AssignmentChoice;
      if (!choice || !state.chooseAssignment(choice.id).ok) {
        setError(true);
        return;
      }
    }
    act(() => state.startAssignment());
  };
  const submit = () => {
    if (
      !mode ||
      !ack ||
      metadata?.steps.some((step) => step.kind === 'action' && !checked.includes(step.id))
    )
      return;
    act(() =>
      usePrototypeStore.getState().submitTask({
        definitionAcknowledged: true,
        completionMode: mode,
        helpUsed: mode === 'permitted_help' ? content.permittedHelp : null,
        preparedMediaFixtureId: null,
        reflection: null,
        observableFacts: [],
      }),
    );
  };
  const pending = journey.lifecycle === 'submitted' || journey.lifecycle === 'confirmed';
  const complete = journey.lifecycle === 'recognized';
  const required = metadata.steps.filter((step) => step.kind === 'action');
  return (
    <R002aScreen
      testID="catalog-child-task"
      header={
        <R002aFlowHeader
          direction={direction}
          backLabel={t('common.back')}
          title={t('catalog.tasks')}
          onBack={back}
        />
      }
    >
      <CatalogDetails content={content} />
      <MasroofiTaskRewardNotice />
      <Text brand direction={direction}>
        {localize(content.supervision, locale)}
      </Text>
      <Text brand direction={direction}>
        {localize(content.safety.stopAndAskAdult, locale)}
      </Text>
      <Text brand direction={direction} variant="heading" accessibilityLiveRegion="polite">
        {t(`catalog.${journey.lifecycle}`)}
      </Text>
      {pending ? (
        <Text brand direction={direction}>
          {t('catalog.waiting')}
        </Text>
      ) : null}
      {complete ? (
        <Text brand direction={direction}>
          {t('catalog.complete')}
        </Text>
      ) : null}
      {journey.lifecycle === 'retry' ? (
        <Text brand direction={direction}>
          {t('catalog.retryNote')}
        </Text>
      ) : null}
      {['assigned', 'chosen', 'in_progress'].includes(journey.lifecycle) ? (
        <>
          <Text brand direction={direction} variant="heading">
            {t('catalog.steps')}
          </Text>
          {metadata.steps.map((step) => (
            <View key={step.id} style={catalogStyles.stack}>
              <Text brand direction={direction} variant="label">
                {t(`catalog.${step.kind}`)}
              </Text>
              {step.kind === 'action' && journey.lifecycle === 'in_progress' ? (
                <CatalogToggle
                  label={localize(step.text, locale)}
                  checked={checked.includes(step.id)}
                  onChange={() =>
                    setChecked((previous) =>
                      previous.includes(step.id)
                        ? previous.filter((id) => id !== step.id)
                        : [...previous, step.id],
                    )
                  }
                  testID={`catalog-step-${step.id}`}
                />
              ) : (
                <Text brand direction={direction}>
                  {localize(step.text, locale)}
                </Text>
              )}
            </View>
          ))}
          {journey.lifecycle === 'assigned' || journey.lifecycle === 'chosen' ? (
            <>
              <Button brand direction={direction} onPress={start} testID="catalog-start">
                {t(journey.lifecycle === 'chosen' ? 'catalog.start' : 'catalog.choose')}
              </Button>
              {journey.lifecycle === 'assigned' ? (
                <Button
                  brand
                  direction={direction}
                  variant="secondary"
                  onPress={() =>
                    act(() => usePrototypeStore.getState().requestCatalogSmallerTask())
                  }
                  testID="catalog-smaller"
                >
                  {t('catalog.smaller')}
                </Button>
              ) : null}
              {requests[journey.assignment.id] ? (
                <Text brand direction={direction} accessibilityLiveRegion="polite">
                  {t('catalog.supportSent')}
                </Text>
              ) : null}
            </>
          ) : (
            <>
              <Text brand direction={direction} color="onSurfaceVariant">
                {t('catalog.checklistResume')}
              </Text>
              <Text brand direction={direction} variant="heading">
                {t('catalog.mode')}
              </Text>
              {(['independent', 'permitted_help'] as const).map((option) => (
                <CatalogToggle
                  key={option}
                  label={t(option === 'independent' ? 'catalog.independent' : 'catalog.withHelp')}
                  checked={mode === option}
                  onChange={() => setMode(option)}
                  testID={`catalog-mode-${option}`}
                />
              ))}
              <CatalogToggle
                label={t('catalog.ack')}
                checked={ack}
                onChange={() => setAck(!ack)}
                testID="catalog-ack"
              />
              <Button
                brand
                direction={direction}
                onPress={submit}
                disabled={!ack || !mode || required.some((step) => !checked.includes(step.id))}
                testID="catalog-submit"
              >
                {t('catalog.submit')}
              </Button>
            </>
          )}
          <Button
            brand
            direction={direction}
            variant="secondary"
            onPress={() => setHelp(!help)}
            testID="catalog-help"
          >
            {t('catalog.askHelp')}
          </Button>
          {help ? (
            <View style={catalogStyles.card}>
              <CompanionPortrait />
              <MessagingEntry role="child" helperDraft />
              <Text brand direction={direction}>
                {t('catalog.prepared')}
              </Text>
              {metadata.steps.map((step) => (
                <Text key={step.id} brand direction={direction}>
                  {localize(step.text, locale)}
                </Text>
              ))}
              <Text brand direction={direction}>
                {localize(content.safety.stopAndAskAdult, locale)}
              </Text>
            </View>
          ) : null}
          <Button brand direction={direction} variant="secondary" onPress={() => setAdult(true)}>
            {t('catalog.adultHelp')}
          </Button>
          {adult ? (
            <Text brand direction={direction} accessibilityLiveRegion="polite">
              {t('catalog.adultExit')}
            </Text>
          ) : null}
        </>
      ) : null}
      {error ? (
        <Text brand direction={direction} color="error" accessibilityLiveRegion="assertive">
          {t('errors.safeRetry')}
        </Text>
      ) : null}
      <Button brand direction={direction} variant="secondary" onPress={back}>
        {t('catalog.different')}
      </Button>
    </R002aScreen>
  );
}
