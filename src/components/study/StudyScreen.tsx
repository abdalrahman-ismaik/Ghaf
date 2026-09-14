import { useCallback, useEffect, useMemo, useState } from 'react';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { BackHandler, Keyboard, Platform, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/primitives';
import { entryMode } from '@/config/demoEntry';
import { logicalRowDirection } from '@/design/tokens';
import { localize } from '@/i18n';
import type { AcademicGoal, StudyCommand, StudyErrorCode } from '@/models/study';
import { pilotSampleEnabled } from '@/services';
import {
  selectCanEnterChildExperience,
  selectHasActiveParentExperience,
  usePrototypeStore,
} from '@/state/usePrototypeStore';
import { AcademicGoalCard } from './AcademicGoalCard';
import { StudyForm } from './StudyForm';
import { StudyPlanCard } from './StudyPlanCard';
import { StudyPractice } from './StudyPractice';
import { StudyButton, StudyText, studyStyles as s } from './shared';

export function StudyScreen({ role }: { role: 'parent' | 'child' }) {
  const parentAllowed = usePrototypeStore(selectHasActiveParentExperience);
  const childAllowed = usePrototypeStore(selectCanEnterChildExperience);
  const childId = usePrototypeStore((state) => state.activeChildId);
  const family = usePrototypeStore((state) => state.localFamily.record);
  const authorized = role === 'parent' ? parentAllowed : childAllowed;
  if (!authorized)
    return <Redirect href={parentAllowed ? '/parent' : childAllowed ? '/child' : '/'} />;
  return (
    <StudyWorkspace
      key={`${role}:${childId}:${family?.studyInstanceId ?? family?.createdAt}`}
      role={role}
    />
  );
}

function StudyWorkspace({ role }: { role: 'parent' | 'child' }) {
  const { t } = useTranslation();
  const router = useRouter();
  const direction = usePrototypeStore((state) => state.direction);
  const locale = usePrototypeStore((state) => state.locale);
  const childId = usePrototypeStore((state) => state.activeChildId);
  const children = usePrototypeStore((state) => state.children);
  const family = usePrototypeStore((state) => state.localFamily.record);
  const setActiveChild = usePrototypeStore((state) => state.setActiveChild);
  const revision = usePrototypeStore((state) => state.studyRevision);
  const getStudy = usePrototypeStore((state) => state.getStudy);
  const initializeStudy = usePrototypeStore((state) => state.initializeStudy);
  const dispatchStudy = usePrototypeStore((state) => state.dispatchStudy);
  const [refresh, setRefresh] = useState(0);
  const [tab, setTab] = useState<'plans' | 'goals' | 'practice'>('plans');
  const [form, setForm] = useState<{ kind: 'plan' | 'goal'; goal?: AcademicGoal } | null>(null);
  const [error, setError] = useState<StudyErrorCode | null>(null);
  const [saved, setSaved] = useState(false);
  const back = useCallback(() => {
    if (Keyboard.isVisible()) {
      Keyboard.dismiss();
      return;
    }
    router.replace(role === 'parent' ? '/parent' : '/child');
  }, [role, router]);
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        back();
        return true;
      });
      return () => subscription.remove();
    }, [back]),
  );
  useEffect(() => {
    initializeStudy();
  }, [initializeStudy, refresh]);
  const loaded = useMemo(() => {
    void revision;
    void refresh;
    return getStudy();
  }, [getStudy, revision, refresh]);
  const plans = loaded.ok ? loaded.data.plans.filter((plan) => plan.childId === childId) : [];
  const goals = loaded.ok ? loaded.data.goals.filter((goal) => goal.childId === childId) : [];
  const name = (id: typeof childId) =>
    family?.children.find((child) => child.id === id)?.nickname ??
    localize(children[id].displayName, locale);
  const command = (value: StudyCommand): boolean => {
    const result = dispatchStudy(value);
    setError(result.ok ? null : result.error.code);
    setSaved(result.ok);
    return result.ok;
  };
  const errorCode = error ?? (!loaded.ok ? loaded.error.code : null);
  const errorKey =
    errorCode === 'stale_revision'
      ? 'study.stale'
      : !family?.studyInstanceId ||
          (errorCode &&
            [
              'storage_read',
              'storage_write',
              'storage_clear',
              'corrupt_data',
              'family_mismatch',
            ].includes(errorCode))
        ? 'study.storageError'
        : 'study.error';
  return (
    <Screen
      keyboardAware
      contentStyle={[s.stack, Platform.OS === 'web' ? null : { direction: 'ltr' }]}
      testID={`study-${role}-screen`}
    >
      <StudyButton variant="quiet" onPress={back}>
        {t('study.back')}
      </StudyButton>
      <View style={s.hero}>
        <StudyText variant="caption">{t('study.eyebrow')}</StudyText>
        <StudyText variant="title" accessibilityRole="header">
          {t('study.title')}
        </StudyText>
        <StudyText>{t('study.subtitle')}</StudyText>
        <StudyText variant="label">
          {t('study.selectedChild', { child: '\u2068' + name(childId) + '\u2069' })}
        </StudyText>
      </View>
      {role === 'parent' ? (
        <View style={[s.row, { direction: 'ltr', flexDirection: logicalRowDirection(direction) }]}>
          {family?.children.map((child) => (
            <StudyButton
              key={child.id}
              fullWidth={false}
              variant={child.id === childId ? 'primary' : 'secondary'}
              accessibilityState={{ selected: child.id === childId }}
              onPress={() => setActiveChild(child.id)}
            >
              {name(child.id)}
            </StudyButton>
          ))}
        </View>
      ) : null}
      <View style={[s.row, { direction: 'ltr', flexDirection: logicalRowDirection(direction) }]}>
        {(['plans', 'goals', 'practice'] as const).map((value) => (
          <StudyButton
            key={value}
            style={s.tabs}
            fullWidth={false}
            variant={tab === value ? 'primary' : 'secondary'}
            accessibilityState={{ selected: tab === value }}
            onPress={() => {
              setTab(value);
              setForm(null);
              setError(null);
              setSaved(false);
            }}
            testID={`study-tab-${value}`}
          >
            {t(`study.${value}`)}
          </StudyButton>
        ))}
      </View>
      {errorCode ? (
        <View style={s.notice} testID="study-error">
          <StudyText accessibilityRole="alert">{t(errorKey)}</StudyText>
          <StudyButton
            variant="secondary"
            onPress={() => {
              setRefresh(refresh + 1);
              setError(null);
            }}
          >
            {t('study.retry')}
          </StudyButton>
        </View>
      ) : null}
      {saved ? <StudyText accessibilityLiveRegion="polite">{t('study.saved')}</StudyText> : null}
      {loaded.ok ? (
        <>
          {form ? (
            <StudyForm
              key={`${form.kind}:${form.goal?.id ?? 'new'}`}
              kind={form.kind}
              goal={form.goal}
              childId={childId}
              onCancel={() => setForm(null)}
              onSave={(value) => {
                if (!command(value)) return false;
                setForm(null);
                return true;
              }}
            />
          ) : (
            <>
              {tab === 'plans' ? (
                <View style={s.section}>
                  <StudyButton
                    onPress={() => {
                      setForm({ kind: 'plan' });
                      setSaved(false);
                    }}
                    testID="study-add-plan"
                  >
                    {t('study.newPlan')}
                  </StudyButton>
                  {plans.length === 0 ? <StudyText>{t('study.emptyPlans')}</StudyText> : null}
                  {[...plans].reverse().map((plan) => (
                    <StudyPlanCard key={plan.id} plan={plan} role={role} onCommand={command} />
                  ))}
                </View>
              ) : null}
              {tab === 'goals' ? (
                <View style={s.section}>
                  <StudyButton
                    onPress={() => {
                      setForm({ kind: 'goal' });
                      setSaved(false);
                    }}
                    testID="study-add-goal"
                  >
                    {t('study.newGoal')}
                  </StudyButton>
                  {goals.length === 0 ? <StudyText>{t('study.emptyGoals')}</StudyText> : null}
                  {[...goals].reverse().map((goal) => (
                    <AcademicGoalCard
                      key={`${goal.id}:${goal.status}`}
                      goal={goal}
                      role={role}
                      onCommand={command}
                      onEdit={() => setForm({ kind: 'goal', goal })}
                      onReplace={() => setForm({ kind: 'goal' })}
                    />
                  ))}
                </View>
              ) : null}
              {tab === 'practice' ? <StudyPractice /> : null}
            </>
          )}
        </>
      ) : null}
      <View style={s.divider}>
        <StudyText variant="caption">{t('study.privacy')}</StudyText>
        <StudyText variant="caption">
          {t(entryMode === 'demo' || pilotSampleEnabled ? 'study.memoryOnly' : 'study.localOnly')}
        </StudyText>
      </View>
    </Screen>
  );
}
