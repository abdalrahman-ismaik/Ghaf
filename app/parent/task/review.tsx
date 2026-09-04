import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { BackHandler, Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ParentVoicePermissionPanel } from '@/components/family-growth/ParentVoicePermissionPanel';
import { SafetyBoundary } from '@/components/family-growth/TaskPanels';
import { Button, Text } from '@/components/primitives';
import {
  R002aFlowHeader,
  R002aScreen,
  TaskCreatedSuccessSheet,
  TaskStepIndicator,
} from '@/components/r002a';
import {
  colors,
  layout,
  logicalRowDirection,
  r001Radii,
  r001Shadows,
  spacing,
  type LayoutDirection,
} from '@/design/tokens';
import { bilingualResource, localize } from '@/i18n';
import type { LocalizedText, RecognitionMode, RoutinePhase } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

function BilingualField({ label, value }: { label: string; value: LocalizedText }) {
  const { t } = useTranslation();
  return (
    <View style={styles.field}>
      <Text brand color="onSurfaceVariant" variant="caption">
        {label}
      </Text>
      <View style={styles.languageBlock}>
        <Text brand color="primary" direction="rtl" language="ar" variant="label">
          {t('language.arabic')}
        </Text>
        <Text brand direction="rtl" language="ar">
          {value.ar}
        </Text>
      </View>
      <View style={styles.languageBlock}>
        <Text brand color="primary" direction="ltr" language="en" variant="label">
          {t('language.english')}
        </Text>
        <Text brand direction="ltr" language="en">
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
      <Text brand color="deepForest" variant="heading">
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
      <Text
        brand
        color="onSurfaceVariant"
        direction={direction}
        language={language}
        variant="label"
      >
        {languageLabel}
      </Text>
      {terms.map((term) => (
        <View
          key={`${language}-${term.label.en}`}
          style={[styles.termRow, language === 'ar' ? styles.termRowRtl : styles.termRowLtr]}
        >
          <Text
            brand
            color="onSurfaceVariant"
            direction={direction}
            language={language}
            style={styles.termLabel}
            variant="caption"
          >
            {term.label[language]}
          </Text>
          <Text
            brand
            color="primary"
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
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const role = usePrototypeStore((state) => state.role);
  const journey = usePrototypeStore((state) => state.journey);
  const children = usePrototypeStore((state) => state.children);
  const childVoiceView = usePrototypeStore((state) => state.childVoiceView);
  const approveAssignment = usePrototypeStore((state) => state.approveAssignment);
  const setChildVoicePermission = usePrototypeStore((state) => state.setChildVoicePermission);
  const returnReviewedTaskToDraft = usePrototypeStore((state) => state.returnReviewedTaskToDraft);
  const [error, setError] = useState<string | null>(null);
  const [successVisible, setSuccessVisible] = useState(false);
  const approvalNavigationPending = useRef(false);

  const reviewable = journey?.lifecycle === 'reviewed';
  const content = journey?.task.content;

  const edit = useCallback(() => {
    setError(null);
    const result = returnReviewedTaskToDraft();
    if (!result.ok) {
      setError(t('errors.safeRetry'));
      return;
    }
    router.replace('/parent/task/new');
  }, [returnReviewedTaskToDraft, router, t]);

  useEffect(() => {
    if (role !== 'parent') {
      router.replace('/role');
      return;
    }
    if (!content || (!reviewable && !approvalNavigationPending.current)) {
      router.replace('/parent/task/new');
    }
  }, [content, reviewable, role, router]);

  useEffect(() => {
    if (Platform.OS !== 'android' || role !== 'parent' || !reviewable || successVisible) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      edit();
      return true;
    });
    return () => subscription.remove();
  }, [edit, reviewable, role, successVisible]);

  const approve = () => {
    setError(null);
    approvalNavigationPending.current = true;
    const result = approveAssignment();
    if (!result.ok) {
      approvalNavigationPending.current = false;
      setError(t('errors.safeRetry'));
      return;
    }
    setSuccessVisible(true);
  };

  if (role !== 'parent') return null;
  if (!content || (!reviewable && !successVisible)) return null;

  const child = children[journey!.task.targetChildId];

  const policyTerms: readonly BilingualTerm[] = [
    {
      label: bilingualResource('taskReview.recognition'),
      value: recognitionModeCopy(content.recognitionMode),
    },
    {
      label: bilingualResource('taskReview.awardLabel'),
      value: content.displayedSeedAward
        ? bilingualResource('taskReview.awardWithCount', {
            count: content.displayedSeedAward,
          })
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

  const returnToTasks = () =>
    router.dismissTo({
      pathname: '/parent',
      params: { added: journey!.task.id, section: 'tasks' },
    });

  const continueToChild = () => {
    router.dismissAll();
    router.replace('/role');
  };

  return (
    <>
      <R002aScreen
        contentContainerStyle={styles.screenContent}
        footer={
          reviewable && !successVisible ? (
            <ReviewFooter
              approveLabel={t('taskReview.approveAssignment')}
              direction={direction}
              editLabel={t('common.edit')}
              onApprove={approve}
              onEdit={edit}
            />
          ) : undefined
        }
        header={
          <R002aFlowHeader
            backLabel={t('common.back')}
            direction={direction}
            onBack={edit}
            title={t('common.brand')}
          />
        }
        testID="parent-task-review-screen"
      >
        <View style={[styles.prototypeIdentity, { flexDirection: logicalRowDirection(direction) }]}>
          <View aria-hidden style={styles.prototypeDot} />
          <Text brand color="onSurfaceVariant" variant="caption">
            {t('common.prototype')} · {t('origin.synthetic')}
          </Text>
        </View>

        <TaskStepIndicator
          current={3}
          direction={direction}
          labels={[
            t('r002aTasks.stepChoose'),
            t('r002aTasks.stepEdit'),
            t('r002aTasks.stepReview'),
          ]}
        />

        <View style={styles.heading}>
          <Text brand color="deepForest" variant="screenTitle">
            {t('r002aTasks.reviewHeading')}
          </Text>
          <Text brand color="onSurfaceVariant" variant="bodyLarge">
            {t('r002aTasks.reviewBody')}
          </Text>
        </View>

        <View style={[styles.childSummary, { flexDirection: logicalRowDirection(direction) }]}>
          <View style={styles.childMark}>
            <Text align="center" brand color="onPrimary" variant="label">
              {localize(child.displayName, locale).slice(0, 1)}
            </Text>
          </View>
          <View style={styles.flexText}>
            <Text brand color="onSurface" variant="label">
              {localize(child.displayName, locale)}
            </Text>
            <Text brand color="secondary" variant="caption">
              {localize(
                content.categoryId === 'green_impact'
                  ? bilingualResource('taskNew.greenImpact')
                  : bilingualResource('origin.future'),
                locale,
              )}
            </Text>
          </View>
        </View>

        <View style={styles.record}>
          <Text brand color="primary" variant="heading">
            {localize(content.title, locale)}
          </Text>
          <BilingualField label={t('taskReview.action')} value={content.positiveAction} />
          <BilingualField label={t('taskReview.definition')} value={content.definitionOfDone} />
          <BilingualField label={t('taskReview.why')} value={content.whyItMatters} />
          <BilingualField label={t('taskReview.effort')} value={content.estimatedEffort} />
          <BilingualField label={t('taskReview.help')} value={content.permittedHelp} />
          <BilingualField label={t('taskReview.supervision')} value={content.supervision} />
        </View>

        <View style={styles.panel}>
          <SafetyBoundary bilingual safety={content.safety} testID="task-safety-boundary" />
        </View>

        <BilingualTerms terms={policyTerms} title={t('taskReview.recognition')} />

        <View style={styles.panel}>
          <ParentVoicePermissionPanel
            enabled={childVoiceView.permissionEnabled}
            onChange={(enabled) => {
              setError(null);
              const result = setChildVoicePermission(enabled);
              if (!result.ok) setError(t('errors.safeRetry'));
            }}
          />
        </View>

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
          <Text brand color="primary" variant="label">
            {t('taskReview.noEarlyReward')}
          </Text>
          <Text brand color="onSurfaceVariant" variant="caption">
            {t('origin.symbolic')}
          </Text>
        </View>

        {error ? (
          <Text accessibilityLiveRegion="polite" brand color="error">
            {error}
          </Text>
        ) : null}
      </R002aScreen>

      <TaskCreatedSuccessSheet
        actionLabel={t('r002aTasks.returnToTasks')}
        consequence={t('r002aTasks.rewardLater', {
          child: localize(child.displayName, locale),
          count: content.displayedSeedAward ?? 0,
        })}
        direction={direction}
        language={locale}
        message={t('r002aTasks.taskAddedMessage', {
          child: localize(child.displayName, locale),
          task: localize(content.title, locale),
        })}
        onAction={returnToTasks}
        onDismiss={returnToTasks}
        onSecondary={continueToChild}
        secondaryLabel={t('r002aTasks.continueToChild')}
        title={t('r002aTasks.taskAddedTitle')}
        visible={successVisible}
      />
    </>
  );
}

function ReviewFooter({
  approveLabel,
  direction,
  editLabel,
  onApprove,
  onEdit,
}: {
  approveLabel: string;
  direction: LayoutDirection;
  editLabel: string;
  onApprove: () => void;
  onEdit: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      <View style={styles.footerContent}>
        <Button
          brand
          direction={direction}
          onPress={onApprove}
          size="regular"
          testID="approve-assignment-button"
        >
          {approveLabel}
        </Button>
        <Button
          brand
          direction={direction}
          onPress={onEdit}
          testID="edit-reviewed-task-button"
          variant="quiet"
        >
          {editLabel}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContent: { paddingBottom: spacing.xxl },
  heading: { gap: spacing.xs },
  prototypeIdentity: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  prototypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.mangroveTeal,
  },
  childSummary: {
    minHeight: 88,
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
  },
  childMark: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.ghafEmerald,
  },
  flexText: { flex: 1, minWidth: 0, gap: spacing.xxs },
  record: {
    gap: spacing.xl,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.lg,
    ...r001Shadows.soft,
  },
  field: {
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    paddingBottom: spacing.lg,
  },
  languageBlock: { gap: spacing.xxs },
  termsRecord: {
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.lg,
    ...r001Shadows.soft,
  },
  termsLanguage: { gap: spacing.xs },
  termRow: {
    alignItems: 'flex-start',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    paddingBottom: spacing.xs,
  },
  termRowRtl: { flexDirection: 'row-reverse' },
  termRowLtr: { flexDirection: 'row' },
  termLabel: { flex: 2, minWidth: 0 },
  termValue: { flex: 3, minWidth: 0 },
  metadata: {
    gap: spacing.xl,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.lg,
    ...r001Shadows.soft,
  },
  panel: {
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  pendingNotice: {
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.solarAmberBorder,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.solarAmberTint,
    padding: spacing.md,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surfaceContainerHigh,
    backgroundColor: colors.r001Surface,
    paddingTop: spacing.md,
    paddingHorizontal: layout.screenPadding,
    ...r001Shadows.sheet,
  },
  footerContent: {
    width: '100%',
    maxWidth: layout.compactContentWidth,
    alignSelf: 'center',
    gap: spacing.xs,
  },
});
