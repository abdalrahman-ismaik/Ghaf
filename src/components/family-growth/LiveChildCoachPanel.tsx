import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Crypto from 'expo-crypto';
import { useTranslation } from 'react-i18next';

import { Button, Input, Text } from '../primitives';
import { colors, logicalRowDirection, r001Radii, spacing } from '../../design/tokens';
import type {
  LiveChildCoachIntent,
  LiveChildCoachView,
} from '../../features/assistants/liveChildCoach';
import { localize } from '../../i18n';
import type { ChildCoachTextResponseV1, LiveChildCoachGrant } from '../../models/boundedAi';
import type { AgeBand, LocaleCode, TextDirection } from '../../models/familyGrowth';
import type { ServiceResult } from '../../services';

const BAND_INTENTS: Readonly<Record<AgeBand, readonly LiveChildCoachIntent[]>> = {
  '6_8': ['show_next_step', 'make_step_shorter', 'need_adult'],
  '9_11': ['first_step', 'next_step', 'smaller_chunk', 'if_then', 'rehearse_phrase', 'need_adult'],
  '12_14': ['clarify_step', 'plan_order', 'ask_for_help', 'reflect_on_strategy', 'need_adult'],
};

const INTENT_KEYS: Readonly<Record<LiveChildCoachIntent, string>> = {
  show_next_step: 'liveCoachIntentNext',
  make_step_shorter: 'liveCoachIntentShorter',
  need_adult: 'liveCoachAdultExit',
  first_step: 'liveCoachIntentFirst',
  next_step: 'liveCoachIntentNext',
  smaller_chunk: 'liveCoachIntentShorter',
  if_then: 'liveCoachIntentIfThen',
  rehearse_phrase: 'liveCoachIntentPhrase',
  clarify_step: 'liveCoachIntentClarify',
  plan_order: 'liveCoachIntentPlan',
  ask_for_help: 'liveCoachIntentAskHelp',
  reflect_on_strategy: 'liveCoachIntentReflect',
};

interface LiveChildCoachPanelProps {
  readonly ageBand: AgeBand;
  readonly direction: TextDirection;
  readonly locale: LocaleCode;
  readonly grant: LiveChildCoachGrant;
  readonly view: LiveChildCoachView;
  readonly onRequest: (input: {
    readonly requestId: string;
    readonly bindingNonce: string;
    readonly intent: LiveChildCoachIntent;
    readonly boundedText?: string;
    readonly inputOrigin?: 'typed';
  }) => Promise<ServiceResult<ChildCoachTextResponseV1>>;
  readonly onDecline: () => ServiceResult<true>;
  readonly onClear: () => ServiceResult<true>;
}

export function LiveChildCoachPanel({
  ageBand,
  direction,
  locale,
  grant,
  view,
  onRequest,
  onDecline,
  onClear,
}: LiveChildCoachPanelProps) {
  const { t } = useTranslation();
  const [boundedText, setBoundedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const requesting = view.status === 'requesting';
  const granted = grant.status === 'granted';

  const request = async (intent: LiveChildCoachIntent) => {
    setError(null);
    const result = await onRequest({
      requestId: Crypto.randomUUID(),
      bindingNonce: Crypto.randomUUID(),
      intent,
      ...(ageBand === '12_14' && intent !== 'need_adult'
        ? { boundedText, inputOrigin: 'typed' as const }
        : {}),
    });
    if (!result.ok) setError(t('childTask.liveCoachDenied'));
  };

  const decline = () => {
    setError(null);
    if (!onDecline().ok) setError(t('errors.safeRetry'));
  };

  return (
    <View style={styles.panel} testID="live-child-coach-panel">
      <Text brand color="deepForest" direction={direction} variant="screenTitle">
        {t('childTask.liveCoachTitle')}
      </Text>
      <Text
        brand
        color="onSurfaceVariant"
        direction={direction}
        testID="live-child-coach-notice"
        variant="caption"
      >
        {t('childTask.liveCoachNotice')}
      </Text>
      <Text brand color="tertiary" direction={direction} variant="caption">
        {t('childTask.liveCoachAiDisclosure')}
      </Text>

      {view.status === 'declined' ? (
        <Text accessibilityLiveRegion="polite" brand color="deepForest" direction={direction}>
          {t('childTask.liveCoachDeclined')}
        </Text>
      ) : !granted ? (
        <Text accessibilityLiveRegion="polite" brand color="tertiary" direction={direction}>
          {t('childTask.liveCoachGrantRequired')}
        </Text>
      ) : view.response ? (
        <View
          accessibilityLiveRegion="polite"
          style={styles.result}
          testID="live-child-coach-result"
        >
          <Text brand color="mangroveTeal" direction={direction} variant="label">
            {t(
              view.origin === 'live'
                ? 'childTask.liveCoachLiveOrigin'
                : 'childTask.liveCoachPreparedOrigin',
            )}
          </Text>
          {view.status === 'fallback' ? (
            <Text brand color="tertiary" direction={direction} variant="caption">
              {t('childTask.liveCoachFallback')}
            </Text>
          ) : null}
          {view.response.steps.map((step, index) => (
            <Text brand direction={direction} key={`${index}-${step.en}`}>
              {localize(step, locale)}
            </Text>
          ))}
          {view.response.ifThenCue ? (
            <Text brand direction={direction}>
              {localize(view.response.ifThenCue, locale)}
            </Text>
          ) : null}
          {view.response.reflectionQuestion ? (
            <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
              {localize(view.response.reflectionQuestion, locale)}
            </Text>
          ) : null}
          {view.response.reviewedPhrase ? (
            <Text brand direction={direction}>
              {localize(view.response.reviewedPhrase, locale)}
            </Text>
          ) : null}
          <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
            {t('childTask.liveCoachTerminal')}
          </Text>
          <Button brand direction={direction} onPress={onClear} variant="quiet">
            {t('childTask.liveCoachDone')}
          </Button>
        </View>
      ) : (
        <>
          {ageBand === '12_14' ? (
            <Input
              accessibilityLabel={t('childTask.liveCoachTextLabel')}
              brand
              direction={direction}
              editable={!requesting}
              helperText={t('childTask.liveCoachTextLimit')}
              language={locale}
              maxLength={240}
              onChangeText={setBoundedText}
              placeholder={t('childTask.liveCoachTextPlaceholder')}
              testID="live-child-coach-bounded-text"
              value={boundedText}
            />
          ) : null}
          <View style={[styles.intents, { flexDirection: logicalRowDirection(direction) }]}>
            {BAND_INTENTS[ageBand].map((intent) => (
              <Button
                brand
                busy={requesting}
                busyLabel={t('assistant.loading')}
                disabled={
                  requesting ||
                  (ageBand === '12_14' && intent !== 'need_adult' && !boundedText.trim())
                }
                fullWidth={false}
                key={intent}
                onPress={() => void request(intent)}
                testID={`live-child-coach-${intent}`}
                variant={intent === 'need_adult' ? 'secondary' : 'quiet'}
              >
                {t(`childTask.${INTENT_KEYS[intent]}`)}
              </Button>
            ))}
          </View>
        </>
      )}

      {view.status !== 'declined' ? (
        <Button
          brand
          direction={direction}
          disabled={requesting}
          onPress={decline}
          testID="decline-live-child-coach"
          variant="ghost"
        >
          {t('childTask.liveCoachDecline')}
        </Button>
      ) : null}
      {error ? (
        <Text accessibilityLiveRegion="polite" brand color="error" direction={direction}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: r001Radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  intents: {
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  result: {
    backgroundColor: colors.secondaryContainer,
    borderRadius: r001Radii.md,
    gap: spacing.sm,
    padding: spacing.md,
  },
});
