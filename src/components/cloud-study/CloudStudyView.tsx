import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { AppState, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StudyForm } from '@/components/study/StudyForm';
import { StudyPlanCard } from '@/components/study/StudyPlanCard';
import { AcademicGoalCard } from '@/components/study/AcademicGoalCard';
import { StudyPractice } from '@/components/study/StudyPractice';
import { StudyButton, StudyText, studyStyles as s } from '@/components/study/shared';
import { createCloudDocumentsController } from '@/features/cloud-study';
import type { CloudDocumentServicePort, CloudSavedTemplate } from '@/models/cloudFamilyDocuments';
import type { AcademicGoal, StudyCommand } from '@/models/study';
import { CloudFamilyDetails } from './CloudFamilyDetails';
import { CloudLearningView } from './CloudLearningView';

export interface CloudStudyViewProps {
  service: CloudDocumentServicePort;
  userId: string;
  familyId: string;
  role: 'parent' | 'child';
  childId: string | null;
  childProfiles: readonly {
    id: string;
    displayName: string;
    ageBand?: '6_8' | '9_11' | '12_14';
    active?: boolean;
  }[];
  section?: 'study' | 'family' | 'learning';
  earnedSeeds?: number;
  onUseTemplate?: (template: CloudSavedTemplate) => void;
}
export function CloudStudyView(props: CloudStudyViewProps) {
  return (
    <CloudStudyContent
      key={`${props.userId}:${props.familyId}:${props.role}:${props.childId}:${props.section ?? 'study'}`}
      {...props}
    />
  );
}
function CloudStudyContent(props: CloudStudyViewProps) {
  const { t } = useTranslation();
  const controller = useMemo(
    () =>
      createCloudDocumentsController({
        service: props.service,
        userId: props.userId,
        familyId: props.familyId,
        role: props.role,
        childId: props.childId,
      }),
    [props.service, props.userId, props.familyId, props.role, props.childId],
  );
  const lifetimes = useRef(new Map<typeof controller, number>());
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  const [selection, setSelection] = useState<string | null>(
    props.childId ?? props.childProfiles.find((child) => child.active !== false)?.id ?? null,
  );
  const [tab, setTab] = useState<'plans' | 'goals' | 'practice'>('plans');
  const [form, setForm] = useState<{
    kind: 'plan' | 'goal';
    goal?: AcademicGoal;
    documentRevision?: number;
  } | null>(null);
  const childId = props.role === 'child' ? props.childId : selection;
  const validChild = props.childProfiles.some(
    (child) => child.id === childId && child.active !== false,
  );
  useEffect(() => {
    const generations = lifetimes.current;
    generations.set(controller, (generations.get(controller) ?? 0) + 1);
    void controller.load();
    const listener = AppState.addEventListener('change', (status) => {
      if (status === 'active') void controller.load();
    });
    return () => {
      listener.remove();
      const cleanup = (generations.get(controller) ?? 0) + 1;
      generations.set(controller, cleanup);
      void Promise.resolve().then(() => {
        if (cleanup === generations.get(controller)) {
          controller.dispose();
          generations.delete(controller);
        }
      });
    };
  }, [controller]);
  const studyCommand = (command: StudyCommand, closeForm = false): boolean => {
    const existing = state.documents?.find(
      (document) =>
        (document.kind === 'study_plan' || document.kind === 'academic_goal') &&
        document.payload.id === command.id,
    );
    void controller
      .update({
        type: 'study',
        expectedRevision:
          closeForm && form?.documentRevision !== undefined
            ? form.documentRevision
            : (existing?.revision ?? 0),
        command,
      })
      .then((saved) => {
        if (saved && closeForm) setForm(null);
      });
    return false;
  };
  const rows = state.documents?.filter((document) => document.childId === childId) ?? [];
  return (
    <View style={s.stack} testID="cloud-study-view">
      <StudyText accessibilityRole="header" variant="heading">
        {t(
          props.section === 'family'
            ? 'cloudDocuments.connections'
            : props.section === 'learning'
              ? 'learning.mangroveRoots.title'
              : 'study.title',
        )}
      </StudyText>
      <StudyText>{t('cloudDocuments.privateBoundary')}</StudyText>
      {state.loading ? (
        <StudyText accessibilityLiveRegion="polite">{t('cloudDocuments.loading')}</StudyText>
      ) : null}
      {state.busy && !state.loading ? (
        <StudyText accessibilityLiveRegion="polite">{t('cloudDocuments.saving')}</StudyText>
      ) : null}
      {state.error ? (
        <View style={s.notice} testID="cloud-documents-error">
          <StudyText accessibilityRole="alert">
            {t(
              state.error === 'request_conflict'
                ? 'cloudDocuments.conflict'
                : state.documents === null
                  ? 'cloudDocuments.unavailable'
                  : 'cloudDocuments.error',
            )}
          </StudyText>
        </View>
      ) : null}
      {state.canRetry ? (
        <StudyButton
          disabled={state.busy}
          onPress={() => {
            void controller.retry().then((saved) => {
              if (saved) setForm(null);
            });
          }}
        >
          {t('cloudDocuments.retry')}
        </StudyButton>
      ) : null}
      <StudyButton
        variant="quiet"
        disabled={state.busy}
        onPress={() => {
          void controller.load();
        }}
      >
        {t('cloudDocuments.refresh')}
      </StudyButton>
      {state.saved ? (
        <StudyText accessibilityLiveRegion="polite" testID="cloud-documents-saved">
          {t('cloudDocuments.savedOnServer')}
        </StudyText>
      ) : null}
      {state.documents !== null ? (
        <View
          style={s.stack}
          pointerEvents={state.busy ? 'none' : 'auto'}
          accessibilityElementsHidden={false}
        >
          {props.role === 'parent' && props.childProfiles.length > 0 ? (
            <View style={s.row}>
              {props.childProfiles
                .filter((child) => child.active !== false)
                .map((child) => (
                  <StudyButton
                    key={child.id}
                    fullWidth={false}
                    variant={child.id === childId ? 'primary' : 'secondary'}
                    disabled={state.busy}
                    accessibilityState={{ selected: child.id === childId }}
                    onPress={() => {
                      setSelection(child.id);
                      setForm(null);
                    }}
                  >
                    {child.displayName}
                  </StudyButton>
                ))}
            </View>
          ) : null}
          {props.section === 'family' ? (
            props.role === 'parent' ? (
              <CloudFamilyDetails
                key={childId ?? 'family'}
                documents={state.documents}
                getDocuments={() => controller.getSnapshot().documents}
                childId={validChild ? childId : null}
                childAgeBand={props.childProfiles.find((child) => child.id === childId)?.ageBand}
                busy={state.busy}
                onCommand={controller.update}
                onUseTemplate={props.onUseTemplate}
              />
            ) : null
          ) : props.section === 'learning' ? (
            <CloudLearningView
              role={props.role}
              documents={rows}
              earnedSeeds={props.earnedSeeds ?? 0}
              onCommand={controller.update}
            />
          ) : !validChild || !childId ? (
            <StudyText>{t('cloudDocuments.emptyChildren')}</StudyText>
          ) : (
            <>
              <View style={s.row}>
                {(['plans', 'goals', 'practice'] as const).map((value) => (
                  <StudyButton
                    key={value}
                    fullWidth={false}
                    variant={tab === value ? 'primary' : 'secondary'}
                    accessibilityState={{ selected: tab === value }}
                    onPress={() => {
                      setTab(value);
                      setForm(null);
                    }}
                  >
                    {t(`study.${value}`)}
                  </StudyButton>
                ))}
              </View>
              {form ? (
                <StudyForm
                  key={`${childId}:${form.kind}:${form.goal?.id ?? 'new'}`}
                  kind={form.kind}
                  goal={form.goal}
                  childId={childId}
                  onSave={(command) => studyCommand(command, true)}
                  onCancel={() => setForm(null)}
                />
              ) : (
                <>
                  {tab === 'plans' ? (
                    <View style={s.stack}>
                      <StudyButton
                        testID="cloud-study-new-plan"
                        onPress={() => setForm({ kind: 'plan' })}
                      >
                        {t('study.newPlan')}
                      </StudyButton>
                      {!rows.some((row) => row.kind === 'study_plan') ? (
                        <StudyText>{t('study.emptyPlans')}</StudyText>
                      ) : null}
                      {rows.map((row) =>
                        row.kind === 'study_plan' ? (
                          <StudyPlanCard
                            key={`${row.id}:${row.revision}`}
                            plan={row.payload}
                            role={props.role}
                            onCommand={studyCommand}
                          />
                        ) : null,
                      )}
                    </View>
                  ) : null}
                  {tab === 'goals' ? (
                    <View style={s.stack}>
                      <StudyButton
                        testID="cloud-study-new-goal"
                        onPress={() => setForm({ kind: 'goal' })}
                      >
                        {t('study.newGoal')}
                      </StudyButton>
                      {!rows.some((row) => row.kind === 'academic_goal') ? (
                        <StudyText>{t('study.emptyGoals')}</StudyText>
                      ) : null}
                      {rows.map((row) =>
                        row.kind === 'academic_goal' ? (
                          <AcademicGoalCard
                            key={`${row.id}:${row.revision}`}
                            goal={row.payload}
                            role={props.role}
                            onCommand={studyCommand}
                            onEdit={() =>
                              setForm({
                                kind: 'goal',
                                goal: row.payload,
                                documentRevision: row.revision,
                              })
                            }
                            onReplace={() => setForm({ kind: 'goal' })}
                          />
                        ) : null,
                      )}
                    </View>
                  ) : null}
                  {tab === 'practice' ? <StudyPractice /> : null}
                </>
              )}
            </>
          )}
        </View>
      ) : null}
    </View>
  );
}
