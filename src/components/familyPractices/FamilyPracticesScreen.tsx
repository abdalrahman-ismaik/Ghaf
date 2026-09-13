import { useCallback, useReducer, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { BackHandler, Linking, StyleSheet, View } from 'react-native';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button, Card, Text } from '@/components/primitives';
import { R002aFlowHeader, R002aScreen } from '@/components/r002a';
import { R003ActionRow, R003Hero, R003Section } from '@/components/r003';
import { spacing } from '@/design/tokens';
import {
  familyPractices,
  practiceSessionReducer,
  practiceSources,
  practiceStepIds,
  type PracticeAction,
} from '@/features/familyPractices';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export function FamilyPracticesScreen({ role }: { role: 'parent' | 'child' }) {
  const childId = usePrototypeStore((state) => state.activeChildId);
  return <PracticeSessionScreen key={`${role}:${childId}`} role={role} />;
}

export function PracticeSessionScreen({ role }: { role: 'parent' | 'child' }) {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const [session, dispatch] = useReducer(practiceSessionReducer, null);
  const [sourceError, setSourceError] = useState(false);
  const back = useCallback(() => {
    setSourceError(false);
    if (session) dispatch({ type: 'back' });
    else router.replace(role === 'parent' ? '/parent' : '/child');
  }, [role, router, session]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        back();
        return true;
      });
      return () => subscription.remove();
    }, [back]),
  );

  const act = (action: PracticeAction) => {
    setSourceError(false);
    dispatch(action);
  };
  const practice = familyPractices.find((item) => item.id === session?.practiceId);
  const key = practice ? `familyPractices.activities.${practice.id}` : '';
  const finished = session?.phase === 'finished' || session?.phase === 'skipped';
  const step = session ? practiceStepIds[session.stepIndex] : null;
  const finalStep = session?.stepIndex === practiceStepIds.length - 1;
  const textProps = { brand: true, direction, language: locale } as const;
  const buttonProps = { ...textProps, fullWidth: true } as const;

  return (
    <R002aScreen
      header={
        <R002aFlowHeader
          backLabel={t('familyPractices.back')}
          direction={direction}
          onBack={back}
          title={t('familyPractices.navTitle')}
        />
      }
      key={`${session?.practiceId ?? 'catalog'}:${session?.phase ?? ''}:${session?.stepIndex ?? ''}`}
      safeAreaEdges={['top', 'left', 'right', 'bottom']}
      testID="family-practices-screen"
    >
      <LanguageSwitcher compact showGuidance={false} />
      {!session || !practice ? (
        <>
          <R003Hero
            body={t('familyPractices.introduction')}
            direction={direction}
            icon="family"
            language={locale}
            title={t('familyPractices.title')}
          />
          <R003Section>
            {familyPractices.map((item) => (
              <R003ActionRow
                body={t(`familyPractices.activities.${item.id}.purpose`)}
                direction={direction}
                icon={item.source === 'unicef' ? 'family' : 'simple'}
                key={item.id}
                language={locale}
                onPress={() => act({ type: 'choose', practiceId: item.id })}
                testID={`practice-choose-${item.id}`}
                title={t(`familyPractices.activities.${item.id}.title`)}
              />
            ))}
          </R003Section>
          <Text {...textProps} color="onSurfaceVariant" variant="caption">
            {t('familyPractices.privacy')}
          </Text>
          <Text {...textProps} color="onSurfaceVariant" variant="caption">
            {t('familyPractices.evidence')}
          </Text>
        </>
      ) : finished ? (
        <>
          <R003Hero
            body={t(
              `familyPractices.${session.phase === 'finished' ? 'completedBody' : 'skippedBody'}`,
            )}
            direction={direction}
            icon={session.phase === 'finished' ? 'check' : 'leaf'}
            language={locale}
            title={t(`familyPractices.${session.phase === 'finished' ? 'completed' : 'skipped'}`)}
          />
          <Text {...textProps} accessibilityLiveRegion="polite" testID="practice-outcome">
            {t(`${key}.title`)}
          </Text>
          <Button {...buttonProps} onPress={() => act({ type: 'close' })} testID="practice-another">
            {t('familyPractices.another')}
          </Button>
        </>
      ) : (
        <>
          <View style={styles.copy}>
            <Text {...textProps} accessibilityRole="header" variant="screenTitle">
              {t(`${key}.title`)}
            </Text>
            <Text {...textProps} color="onSurfaceVariant">
              {t(`${key}.purpose`)}
            </Text>
          </View>
          {session.phase === 'active' && step ? (
            <Card testID="practice-current-step" variant="tonal">
              <Text {...textProps} accessibilityLiveRegion="polite" tabular variant="caption">
                {t('familyPractices.step', {
                  current: session.stepIndex + 1,
                  total: practiceStepIds.length,
                })}
              </Text>
              <Text {...textProps} accessibilityRole="header" variant="screenTitle">
                {t(`${key}.steps.${step}.title`)}
              </Text>
              <Text {...textProps} testID="practice-step-body" variant="bodyLarge">
                {t(`${key}.steps.${step}.${session.mode}`)}
              </Text>
            </Card>
          ) : null}
          <View style={styles.copy}>
            <Text {...textProps} accessibilityRole="header" variant="label">
              {t('familyPractices.parent')}
            </Text>
            <Text {...textProps}>{t(`${key}.parent`)}</Text>
          </View>
          <View style={styles.copy}>
            <Button
              {...buttonProps}
              accessibilityState={{ selected: session.mode === 'accessible' }}
              onPress={() =>
                act({
                  type: 'mode',
                  mode: session.mode === 'accessible' ? 'together' : 'accessible',
                })
              }
              testID="practice-mode"
              variant="secondary"
            >
              {t(`familyPractices.${session.mode === 'accessible' ? 'together' : 'accessible'}`)}
            </Button>
            <Text {...textProps} color="onSurfaceVariant" variant="caption">
              {t('familyPractices.equivalent')}
            </Text>
          </View>
          <View style={styles.copy}>
            <Button
              {...buttonProps}
              onPress={() =>
                act({ type: session.phase === 'ready' ? 'start' : finalStep ? 'finish' : 'next' })
              }
              testID="practice-primary"
            >
              {t(
                `familyPractices.${session.phase === 'ready' ? 'start' : finalStep ? 'finish' : 'next'}`,
              )}
            </Button>
            <Button
              {...buttonProps}
              onPress={() => act({ type: 'skip' })}
              testID="practice-skip"
              variant="quiet"
            >
              {t('familyPractices.skip')}
            </Button>
          </View>
          {session.phase === 'ready' ? (
            <View style={styles.copy}>
              <Text {...textProps} accessibilityRole="header" variant="label">
                {t('familyPractices.why')}
              </Text>
              <Text {...textProps}>{t(`${key}.rationale`)}</Text>
              <Text {...textProps} color="onSurfaceVariant" variant="caption">
                {t('familyPractices.evidence')}
              </Text>
            </View>
          ) : null}
          <View style={styles.sources}>
            <Text {...textProps} accessibilityRole="header" variant="label">
              {t('familyPractices.scope')}
            </Text>
            <Text {...textProps} color="onSurfaceVariant" variant="caption">
              {t(`familyPractices.sources.${practice.source}.scope`)}
            </Text>
            <Text {...textProps} color="onSurfaceVariant" variant="caption">
              {t(`familyPractices.sources.${practice.source}.title`)}
            </Text>
            <Button
              {...buttonProps}
              onPress={() => {
                setSourceError(false);
                void Linking.openURL(practiceSources[practice.source]).catch(() =>
                  setSourceError(true),
                );
              }}
              testID="practice-source"
              variant="quiet"
            >
              {t('familyPractices.source')}
            </Button>
            {sourceError ? (
              <Text
                {...textProps}
                accessibilityLiveRegion="polite"
                color="error"
                testID="practice-source-error"
                variant="caption"
              >
                {t('familyPractices.sourceUnavailable')}
              </Text>
            ) : null}
          </View>
        </>
      )}
    </R002aScreen>
  );
}

const styles = StyleSheet.create({
  copy: { gap: spacing.sm },
  sources: { gap: spacing.sm, paddingTop: spacing.lg },
});
