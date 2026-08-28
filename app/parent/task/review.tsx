import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { JourneyHeader } from '@/components/journey';
import { SafetyBoundary } from '@/components/family-growth/TaskPanels';
import { Button, Screen, Text } from '@/components/primitives';
import { colors, spacing } from '@/design/tokens';
import { bilingualResource } from '@/i18n';
import type { LocalizedText, RecognitionMode, RoutinePhase } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

function BilingualField({ label, value }: { label: string; value: LocalizedText }) {
  const { t } = useTranslation();
  return (
    <View style={styles.field}>
      <Text color="earth" variant="caption">
        {label}
      </Text>
      <View style={styles.languageBlock}>
        <Text color="forest" direction="rtl" language="ar" variant="label">
          {t('language.arabic')}
        </Text>
        <Text direction="rtl" language="ar">
          {value.ar}
        </Text>
      </View>
      <View style={styles.languageBlock}>
        <Text color="forest" direction="ltr" language="en" variant="label">
          {t('language.english')}
        </Text>
        <Text direction="ltr" language="en">
          {value.en}
        </Text>
      </View>
    </View>
  );
}

function recognitionModeCopy(mode: RecognitionMode): LocalizedText {
  const modeKey: Record<RecognitionMode, string> = {
    standard: 'taskReview.standardRecognition',
    fade_first: 'taskReview.fadeFirstRecognition',
    recognition_only: 'taskReview.recognitionOnly',
  };
  return bilingualResource(modeKey[mode]);
}

function routinePhaseCopy(phase: RoutinePhase): LocalizedText {
  const phaseKey: Record<RoutinePhase, string> = {
    acquisition: 'taskReview.acquisitionPhase',
    maintenance: 'taskReview.maintenancePhase',
    not_applicable: 'taskReview.notApplicablePhase',
  };
  return bilingualResource(phaseKey[phase]);
}

function visibilityCopy(scope: 'child_guardian' | 'household'): LocalizedText {
  return bilingualResource(
    scope === 'household' ? 'taskReview.householdVisibility' : 'taskReview.childGuardianVisibility',
  );
}

interface BilingualTerm {
  label: LocalizedText;
  value: LocalizedText;
}

function BilingualTerms({ terms, title }: { terms: readonly BilingualTerm[]; title: string }) {
  const { t } = useTranslation();
  return (
    <View style={styles.termsRecord} testID="task-recognition-policy">
      <Text color="forest" variant="heading">
        {title}
      </Text>
      <LanguageTerms language="ar" languageLabel={t('language.arabic')} terms={terms} />
      <LanguageTerms language="en" languageLabel={t('language.english')} terms={terms} />
    </View>
  );
}

function LanguageTerms({
  language,
  languageLabel,
  terms,
}: {
  language: 'ar' | 'en';
  languageLabel: string;
  terms: readonly BilingualTerm[];
}) {
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  return (
    <View style={styles.termsLanguage}>
      <Text color="earth" direction={direction} language={language} variant="label">
        {languageLabel}
      </Text>
      {terms.map((term) => (
        <View
          key={`${language}-${term.label.en}`}
          style={[styles.termRow, language === 'ar' ? styles.termRowRtl : styles.termRowLtr]}
        >
          <Text
            color="inkMuted"
            direction={direction}
            language={language}
            style={styles.termLabel}
            variant="caption"
          >
            {term.label[language]}
          </Text>
          <Text
            color="forest"
            direction={direction}
            language={language}
            style={styles.termValue}
            variant="label"
          >
            {term.value[language]}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function ParentTaskReviewScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const role = usePrototypeStore((state) => state.role);
  const journey = usePrototypeStore((state) => state.journey);
  const approveAssignment = usePrototypeStore((state) => state.approveAssignment);
  const returnReviewedTaskToDraft = usePrototypeStore((state) => state.returnReviewedTaskToDraft);
  const [error, setError] = useState<string | null>(null);
  const approvalNavigationPending = useRef(false);

  const reviewable = journey?.lifecycle === 'reviewed';
  const content = journey?.task.content;
  useEffect(() => {
    if (role !== 'parent') {
      router.replace('/role');
      return;
    }
    if (!content || (!reviewable && !approvalNavigationPending.current)) {
      router.replace('/parent/task/new');
    }
  }, [content, reviewable, role, router]);

  const approve = () => {
    setError(null);
    approvalNavigationPending.current = true;
    const result = approveAssignment();
    if (!result.ok) {
      approvalNavigationPending.current = false;
      setError(t('errors.safeRetry'));
      return;
    }
    router.replace('/role');
  };

  const edit = () => {
    setError(null);
    const result = returnReviewedTaskToDraft();
    if (!result.ok) {
      setError(t('errors.safeRetry'));
      return;
    }
    router.replace('/parent/task/new');
  };

  if (role !== 'parent') return null;
  if (!content || !reviewable) return null;

  const policyTerms: readonly BilingualTerm[] = [
    {
      label: bilingualResource('taskReview.recognition'),
      value: recognitionModeCopy(content.recognitionMode),
    },
    {
      label: bilingualResource('taskReview.awardLabel'),
      value: content.displayedSeedAward
        ? bilingualResource('taskReview.award')
        : bilingualResource('taskReview.noSeedRecognition'),
    },
    {
      label: bilingualResource('taskReview.phase'),
      value: routinePhaseCopy(content.routinePhase),
    },
    {
      label: bilingualResource('taskReview.recurrence'),
      value: bilingualResource(
        content.recurrence === 'once'
          ? 'taskReview.recurrenceOnce'
          : 'taskReview.recurrenceRecurrent',
      ),
    },
    {
      label: bilingualResource('taskReview.landscape'),
      value: bilingualResource('garden.mangrove'),
    },
  ];

  return (
    <Screen contentContainerStyle={styles.screenContent} testID="parent-task-review-screen">
      <JourneyHeader
        eyebrow={t('origin.prepared')}
        onBack={edit}
        subtitle={t('taskReview.body')}
        title={t('taskReview.title')}
      />

      <View style={styles.record}>
        <BilingualField label={t('taskReview.action')} value={content.positiveAction} />
        <BilingualField label={t('taskReview.definition')} value={content.definitionOfDone} />
        <BilingualField label={t('taskReview.why')} value={content.whyItMatters} />
        <BilingualField label={t('taskReview.effort')} value={content.estimatedEffort} />
        <BilingualField label={t('taskReview.help')} value={content.permittedHelp} />
        <BilingualField label={t('taskReview.supervision')} value={content.supervision} />
      </View>

      <SafetyBoundary bilingual safety={content.safety} testID="task-safety-boundary" />

      <BilingualTerms terms={policyTerms} title={t('taskReview.recognition')} />

      <View style={styles.metadata} testID="bilingual-review-metadata">
        <BilingualField
          label={t('taskReview.evidence')}
          value={
            content.evidencePolicy === 'optional_prepared_only'
              ? bilingualResource('taskReview.preparedEvidence')
              : bilingualResource('origin.future')
          }
        />
        <BilingualField label={t('taskReview.privacy')} value={content.privacyNotice} />
        <BilingualField
          label={t('taskReview.visibility')}
          value={visibilityCopy(content.visibilityScope)}
        />
        <BilingualField
          label={t('circle.title')}
          value={bilingualResource(
            content.circleEligible ? 'taskReview.circleEligible' : 'origin.future',
          )}
        />
      </View>

      <View style={styles.pendingNotice}>
        <Text color="forest" variant="label">
          {t('taskReview.noEarlyReward')}
        </Text>
        <Text color="inkMuted" variant="caption">
          {t('origin.symbolic')}
        </Text>
      </View>

      {error ? <Text color="danger">{error}</Text> : null}
      <Button onPress={approve} testID="approve-assignment-button">
        {t('taskReview.approveAssignment')}
      </Button>
      <Button onPress={edit} testID="edit-reviewed-task-button" variant="ghost">
        {t('common.edit')}
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: { paddingBottom: spacing.huge },
  record: { gap: spacing.xl },
  field: {
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingBottom: spacing.lg,
  },
  languageBlock: { gap: spacing.xxs },
  termsRecord: {
    gap: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    paddingVertical: spacing.lg,
  },
  termsLanguage: { gap: spacing.xs },
  termRow: {
    alignItems: 'flex-start',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingBottom: spacing.xs,
  },
  termRowRtl: { flexDirection: 'row-reverse' },
  termRowLtr: { flexDirection: 'row' },
  termLabel: { flex: 2, minWidth: 0 },
  termValue: { flex: 3, minWidth: 0 },
  metadata: {
    gap: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: spacing.lg,
  },
  pendingNotice: {
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: colors.goldGlow,
    padding: spacing.md,
  },
});
