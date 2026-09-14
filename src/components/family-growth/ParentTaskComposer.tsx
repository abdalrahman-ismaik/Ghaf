import { CatalogParentReview } from '@/components/catalog/CatalogParentReview';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Crypto from 'expo-crypto';

import { GhafIcon, type GhafIconName } from '@/components/access';
import { AssistantIdentity, type AssistantIdentityOrigin } from '@/components/AssistantIdentity';
import { Button, Input, Text } from '@/components/primitives';
import {
  R002aFlowHeader,
  R002aScreen,
  TaskBuilderFooter,
  TaskStepIndicator,
} from '@/components/r002a';
import { aiFeatureFlags } from '@/config/aiFeatureFlags';
import { taskWorkspaceFeatureFlag } from '@/config/taskWorkspaceFeatureFlag';
import {
  colors,
  isolateBidiText,
  logicalRowDirection,
  opacity,
  r001Radii,
  r001Shadows,
  spacing,
} from '@/design/tokens';
import {
  P0_RECYCLING_TEMPLATE,
  TASK_CATEGORIES,
  TASK_TEMPLATES,
} from '@/features/tasks/demoContent';
import {
  createPreparedTaskCategoryPlan,
  type PreparedCategoryRecommendation,
} from '@/features/assistants/profilePersonalization';
import type { ParentProgressTaskPrefill } from '@/features/growth/parentProgress';
import { localize } from '@/i18n';
import type {
  LocalizedText,
  ParentGuideIntent,
  SyntheticChildId,
  TaskCategoryId,
  TaskTemplate,
} from '@/models/familyGrowth';
import type { ParentTaskDraftRequestV1 } from '@/models/boundedAi';
import type { LocalChildProfile } from '@/models/localFamily';
import type { SavedParentTaskTemplate } from '@/models/savedTaskTemplate';
import { PARENT_GUIDE_FIXTURE, serviceRegistry } from '@/services';
import { usePrototypeStore } from '@/state/usePrototypeStore';

interface ParentTaskComposerProps {
  initialPrefill?: ParentProgressTaskPrefill;
  onBack: () => void;
  onReadyForReview: () => void;
}

type BuilderStage = 'choose' | 'edit';

const GUIDE_INTENTS: readonly { intent: ParentGuideIntent; key: string }[] = [
  { intent: 'make_clearer', key: 'makeClearer' },
  { intent: 'make_smaller', key: 'makeSmaller' },
  { intent: 'check_safety', key: 'checkSafety' },
  { intent: 'adapt_age', key: 'adaptAge' },
] as const;

const LIVE_DRAFT_INTENTS: readonly {
  intent: ParentTaskDraftRequestV1['intent'];
  key: string;
}[] = [
  { intent: 'draft', key: 'liveDraftRequest' },
  { intent: 'make_clearer', key: 'makeClearer' },
  { intent: 'make_smaller', key: 'makeSmaller' },
  { intent: 'adapt_age', key: 'adaptAge' },
] as const;

const CATEGORY_ICONS: Record<TaskCategoryId, GhafIconName> = {
  faith_gratitude: 'sparkle',
  roots_kinship: 'ghaf-tree',
  home_responsibility: 'check',
  green_impact: 'leaf',
  food_hospitality: 'water-drop',
  heritage_etiquette: 'flower',
  kindness_community: 'family',
  learning_wellbeing: 'science',
};

const CHILD_AGE_LABEL_KEYS: Record<LocalChildProfile['ageBand'], string> = {
  '6_8': 'access.setup.ageSixEight',
  '9_11': 'access.setup.ageNineEleven',
  '12_14': 'access.setup.ageTwelveFourteen',
};

export function ParentTaskComposer({
  initialPrefill,
  onBack,
  onReadyForReview,
}: ParentTaskComposerProps) {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
  const localFamily = usePrototypeStore((state) => state.localFamily);
  const journey = usePrototypeStore((state) => state.journey);
  const suggestion = usePrototypeStore((state) => state.parentGuideSuggestion);
  const liveDraftView = usePrototypeStore((state) => state.parentTaskDraftingView);
  const createTaskDraft = usePrototypeStore((state) => state.createTaskDraft);
  const updateTaskDraftParentText = usePrototypeStore((state) => state.updateTaskDraftParentText);
  const requestParentGuide = usePrototypeStore((state) => state.requestParentGuide);
  const acceptGuideSuggestion = usePrototypeStore((state) => state.acceptGuideSuggestion);
  const keepParentText = usePrototypeStore((state) => state.keepParentText);
  const requestParentTaskDraft = usePrototypeStore((state) => state.requestParentTaskDraft);
  const acceptParentTaskDraft = usePrototypeStore((state) => state.acceptParentTaskDraft);
  const keepParentTaskDraft = usePrototypeStore((state) => state.keepParentTaskDraft);
  const editParentTaskDraft = usePrototypeStore((state) => state.editParentTaskDraft);
  const reviewTask = usePrototypeStore((state) => state.reviewTask);
  const returnReviewedTaskToDraft = usePrototypeStore((state) => state.returnReviewedTaskToDraft);
  const acceptedInitialPrefill =
    initialPrefill?.intent === 'prefill_only' &&
    initialPrefill.requiresParentReviewAndSave === true &&
    initialPrefill.route === '/parent/task/new' &&
    initialPrefill.childId === activeChildId &&
    initialPrefill.childId === 'child_salem' &&
    initialPrefill.templateId === P0_RECYCLING_TEMPLATE.id
      ? initialPrefill
      : null;

  const configuredChildren =
    localFamily.record?.children.filter((child) =>
      localFamily.configuredChildIds.includes(child.id),
    ) ?? [];
  const [requestedChildId, setSelectedChildId] = useState<SyntheticChildId | null>(
    journey?.task.targetChildId ?? acceptedInitialPrefill?.childId ?? activeChildId,
  );
  const selectedProfile = configuredChildren.find((child) => child.id === requestedChildId);
  const selectedChildId = selectedProfile?.id ?? null;
  const profileCategoryPlan = useMemo(() => {
    const profile = localFamily.record?.children.find((child) => child.id === selectedChildId);
    if (!profile) return null;
    const result = createPreparedTaskCategoryPlan(
      {
        ageBand: profile.ageBand,
        sex: profile.sex,
        interests: profile.interests,
        hobbies: profile.hobbies,
        accessibilityDefaults: profile.accessibilityDefaults,
        supportPreferences: profile.supportPreferences,
        customInterest: profile.customInterest,
        customHobby: profile.customHobby,
        customSupportPreference: profile.customSupportPreference,
        customAccessibility: profile.customAccessibility,
        personalizationEnabled: profile.personalizationEnabled,
      },
      TASK_CATEGORIES.map((category) => category.id),
    );
    return result.ok ? result.data : null;
  }, [localFamily.record, selectedChildId]);
  const orderedCategories = useMemo(
    () =>
      (profileCategoryPlan?.orderedCategoryIds ?? TASK_CATEGORIES.map((category) => category.id))
        .map((id) => TASK_CATEGORIES.find((category) => category.id === id))
        .filter((category): category is (typeof TASK_CATEGORIES)[number] => Boolean(category)),
    [profileCategoryPlan],
  );
  const recommendedCategoryIds = profileCategoryPlan?.recommendedCategoryIds ?? [];
  const [stage, setStage] = useState<BuilderStage>(
    journey && ['draft', 'reviewed'].includes(journey.lifecycle) ? 'edit' : 'choose',
  );
  const [categoryId, setCategoryId] = useState<TaskCategoryId | null>(
    journey?.task.content.categoryId ??
      (acceptedInitialPrefill || activeChildId === 'child_salem'
        ? (profileCategoryPlan?.preselectedCategoryId ?? 'green_impact')
        : null),
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    journey?.task.templateId ??
      acceptedInitialPrefill?.templateId ??
      (activeChildId === 'child_salem' ? P0_RECYCLING_TEMPLATE.id : null),
  );
  const [parentText, setParentText] = useState<LocalizedText>({
    ...(journey?.task.parentOriginalText ?? PARENT_GUIDE_FIXTURE.originalParentText),
  });
  const [busyIntent, setBusyIntent] = useState<ParentGuideIntent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedTemplateMessage, setSavedTemplateMessage] = useState<string | null>(null);
  const [savedTaskTemplates, setSavedTaskTemplates] = useState<readonly SavedParentTaskTemplate[]>(
    () => {
      if (!taskWorkspaceFeatureFlag) return [];
      const result = serviceRegistry.savedTaskTemplates.read('household_al_noor');
      return result.ok ? result.data : [];
    },
  );
  const guideOrigin: AssistantIdentityOrigin =
    serviceRegistry.parentGuidePrimary.mode === 'live_optional' ? 'live' : 'prepared';
  const guideSuggestionApplied = Boolean(journey?.task.acceptedGuideFixtureId) && !suggestion;
  const liveDraftPending =
    liveDraftView.status === 'requesting' || liveDraftView.suggestion !== null;
  const hasExecutableSelection = Boolean(
    selectedChildId &&
    (TASK_TEMPLATES.some(
      (item) => item.id === selectedTemplateId && item.categoryId === categoryId,
    ) ||
      (selectedChildId === 'child_salem' && selectedTemplateId === P0_RECYCLING_TEMPLATE.id)),
  );
  const hasCompleteSelection = Boolean(selectedChildId && categoryId && selectedTemplateId);
  const canContinueSelection = taskWorkspaceFeatureFlag
    ? hasCompleteSelection
    : hasExecutableSelection;
  const selectedTemplate = [...TASK_TEMPLATES, P0_RECYCLING_TEMPLATE].find(
    (template) => template.id === selectedTemplateId,
  );

  const categoryTemplates = useMemo(
    () =>
      [...TASK_TEMPLATES, P0_RECYCLING_TEMPLATE].filter(
        (template) => template.categoryId === categoryId,
      ),
    [categoryId],
  );

  const ensureDraft = () => {
    if (!selectedChildId) {
      setError(t('errors.invalidState'));
      return false;
    }
    if (
      journey?.lifecycle === 'draft' &&
      journey.task.templateId === selectedTemplateId &&
      journey.task.targetChildId === selectedChildId
    )
      return true;
    if (journey?.lifecycle === 'reviewed') {
      const returned = returnReviewedTaskToDraft();
      if (returned.ok) return true;
      setError(t('errors.safeRetry'));
      return false;
    }
    if (journey && !usePrototypeStore.getState().beginNewTask().ok) {
      setError(t('errors.invalidState'));
      return false;
    }
    if (!hasExecutableSelection) {
      setError(t('errors.invalidState'));
      return false;
    }
    const created = createTaskDraft({
      childId: selectedChildId,
      templateId: selectedTemplateId ?? P0_RECYCLING_TEMPLATE.id,
      parentText,
    });
    if (!created.ok) {
      setError(t('errors.safeRetry'));
      return false;
    }
    return true;
  };

  const syncParentText = () => {
    if (!ensureDraft()) return false;
    const updated = updateTaskDraftParentText(parentText);
    if (updated.ok) return true;
    setError(
      t(updated.error.code === 'INVALID_INPUT' ? 'errors.invalidState' : 'errors.safeRetry'),
    );
    return false;
  };

  const askGuide = async (intent: ParentGuideIntent) => {
    setError(null);
    if (!syncParentText()) return;
    setBusyIntent(intent);
    const result = await requestParentGuide({
      requestId: `parent-guide-${intent}-v1`,
      intent,
    });
    setBusyIntent(null);
    if (!result.ok) setError(t('errors.safeRetry'));
  };

  const askLiveDraft = async (intent: ParentTaskDraftRequestV1['intent']) => {
    setError(null);
    if (!syncParentText()) return;
    const result = await requestParentTaskDraft({
      requestId: Crypto.randomUUID(),
      bindingNonce: Crypto.randomUUID(),
      intent,
      effortBand: 'fifteen_thirty',
      stepCount: 2,
      supportMode: 'adult_alongside',
    });
    if (!result.ok) setError(t('errors.safeRetry'));
  };

  const acceptLiveDraft = () => {
    setError(null);
    const result = acceptParentTaskDraft();
    if (!result.ok) setError(t('errors.safeRetry'));
  };

  const keepLiveDraft = () => {
    setError(null);
    const result = keepParentTaskDraft();
    if (!result.ok) setError(t('errors.safeRetry'));
  };

  const editLiveDraft = () => {
    setError(null);
    const suggestedAction = liveDraftView.suggestion?.positiveAction;
    const result = editParentTaskDraft();
    if (!result.ok) {
      setError(t('errors.safeRetry'));
      return;
    }
    if (suggestedAction) setParentText({ ...suggestedAction });
  };

  const accept = () => {
    setError(null);
    const result = acceptGuideSuggestion();
    if (!result.ok) setError(t('errors.safeRetry'));
  };

  const keepMine = () => {
    setError(null);
    const result = keepParentText();
    if (!result.ok) setError(t('errors.safeRetry'));
  };

  const continueToReview = () => {
    setError(null);
    if (!syncParentText()) return;
    const result = reviewTask();
    if (!result.ok) {
      setError(
        result.error.code === 'SAFETY_REJECTED'
          ? t('taskNew.reviewNeedsSafety')
          : t('errors.safeRetry'),
      );
      return;
    }
    onReadyForReview();
  };

  const saveCurrentTemplate = () => {
    setSavedTemplateMessage(null);
    const result = serviceRegistry.savedTaskTemplates.save(
      {
        householdId: 'household_al_noor',
        categoryId: categoryId ?? 'green_impact',
        title: parentText,
        positiveAction: parentText,
        recurrence: 'once',
      },
      new Date().toISOString(),
    );
    if (!result.ok) {
      setSavedTemplateMessage(t('errors.invalidState'));
      return;
    }
    setSavedTaskTemplates((current) => [...current, result.data]);
    setSavedTemplateMessage(t('taskWorkspace.savedSuccess'));
  };

  const deleteSavedTemplate = (id: string) => {
    const result = serviceRegistry.savedTaskTemplates.remove(id, 'household_al_noor');
    if (!result.ok) {
      setSavedTemplateMessage(t('errors.safeRetry'));
      return;
    }
    setSavedTaskTemplates((current) => current.filter((item) => item.id !== id));
    setSavedTemplateMessage(null);
  };

  const returnFromBuilder = () => {
    if (stage === 'edit' && !journey) {
      setError(null);
      setStage('choose');
      return;
    }
    onBack();
  };

  const continueToEdit = () => {
    setError(null);
    if (!canContinueSelection) {
      setError(t('errors.invalidState'));
      return;
    }
    setStage('edit');
  };

  if (stage === 'edit' && selectedTemplate?.catalogExecution && selectedChildId) {
    return (
      <CatalogParentReview
        key={`${selectedChildId}:${selectedTemplate.id}`}
        content={selectedTemplate}
        childId={selectedChildId}
        childName={selectedProfile?.nickname ?? ''}
        onBack={() => setStage('choose')}
        onDone={onBack}
      />
    );
  }

  return (
    <R002aScreen
      contentContainerStyle={styles.screenContent}
      footer={
        stage === 'choose' ? (
          <TaskBuilderFooter
            actionLabel={t('r002aTasks.continue')}
            direction={direction}
            disabled={!canContinueSelection}
            onPress={continueToEdit}
            testID="task-builder-continue"
          />
        ) : (
          <TaskBuilderFooter
            actionLabel={
              hasExecutableSelection || !taskWorkspaceFeatureFlag
                ? t('taskNew.review')
                : t('taskWorkspace.saveTemplate')
            }
            busy={busyIntent !== null || liveDraftView.status === 'requesting'}
            busyLabel={t(
              busyIntent !== null && guideOrigin === 'live'
                ? 'assistant.liveLoading'
                : 'assistant.loading',
            )}
            direction={direction}
            disabled={!canContinueSelection || Boolean(suggestion) || liveDraftPending}
            onPress={
              hasExecutableSelection || !taskWorkspaceFeatureFlag
                ? continueToReview
                : saveCurrentTemplate
            }
            testID="review-task-button"
          />
        )
      }
      header={
        <R002aFlowHeader
          backLabel={t('common.back')}
          direction={direction}
          onBack={returnFromBuilder}
          title={t('common.brand')}
        />
      }
      keyboardAware
      testID="parent-task-new-screen"
    >
      <View style={[styles.prototypeIdentity, { flexDirection: logicalRowDirection(direction) }]}>
        <View aria-hidden style={styles.prototypeDot} />
        <Text brand color="onSurfaceVariant" variant="caption">
          {t('common.prototype')} · {t('origin.synthetic')}
        </Text>
      </View>

      <Text brand color="deepForest" direction={direction} variant="screenTitle">
        {t('r002aTasks.createTask')}
      </Text>

      <TaskStepIndicator
        current={stage === 'choose' ? 1 : 2}
        direction={direction}
        labels={[t('r002aTasks.stepChoose'), t('r002aTasks.stepEdit'), t('r002aTasks.stepReview')]}
      />

      {stage === 'choose' ? (
        <ChooseStage
          categoryId={categoryId}
          categoryTemplates={categoryTemplates}
          childProfiles={configuredChildren}
          direction={direction}
          error={error}
          locale={locale}
          onCategoryChange={(value) => {
            setCategoryId(value);
            setSelectedTemplateId(null);
            setError(null);
          }}
          onChildChange={(value) => {
            if (!configuredChildren.some((child) => child.id === value)) return;
            setSelectedChildId(value);
            if (taskWorkspaceFeatureFlag || value === 'child_salem') {
              setCategoryId('green_impact');
              setSelectedTemplateId(P0_RECYCLING_TEMPLATE.id);
              setParentText({ ...P0_RECYCLING_TEMPLATE.positiveAction });
            } else {
              setCategoryId(null);
              setSelectedTemplateId(null);
            }
            setError(null);
          }}
          onTemplateChange={(value) => {
            setSelectedTemplateId(value);
            const template = [...TASK_TEMPLATES, P0_RECYCLING_TEMPLATE].find(
              (item) => item.id === value,
            );
            if (template) setParentText({ ...template.positiveAction });
            setError(null);
          }}
          selectedChildId={selectedChildId}
          selectedTemplateId={selectedTemplateId}
          orderedCategories={orderedCategories}
          recommendedCategoryIds={recommendedCategoryIds}
          recommendations={profileCategoryPlan?.recommendations ?? []}
        />
      ) : (
        <EditStage
          busyIntent={busyIntent}
          categoryId={categoryId}
          direction={direction}
          displayedSeedAward={
            journey?.task.content.displayedSeedAward ?? selectedTemplate?.displayedSeedAward ?? 0
          }
          error={error}
          guideOrigin={guideOrigin}
          guideSuggestionApplied={guideSuggestionApplied}
          liveDraftView={liveDraftView}
          journeyExists={Boolean(journey)}
          executableSelection={hasExecutableSelection}
          locale={locale}
          onAccept={accept}
          onAskGuide={askGuide}
          onAskLiveDraft={askLiveDraft}
          onAcceptLiveDraft={acceptLiveDraft}
          onChangeSelection={() => setStage('choose')}
          onKeepMine={keepMine}
          onKeepLiveDraft={keepLiveDraft}
          onEditLiveDraft={editLiveDraft}
          onParentTextChange={setParentText}
          parentText={parentText}
          selectedChildLabel={selectedProfile?.nickname ?? ''}
          selectedTemplate={selectedTemplate ?? P0_RECYCLING_TEMPLATE}
          savedTaskTemplates={savedTaskTemplates}
          savedTemplateMessage={savedTemplateMessage}
          onDeleteSavedTemplate={deleteSavedTemplate}
          onSaveCurrentTemplate={saveCurrentTemplate}
          onUseSavedTemplate={(template) => {
            setParentText({ ...template.positiveAction });
            setSavedTemplateMessage(null);
          }}
          suggestion={suggestion}
        />
      )}
    </R002aScreen>
  );
}

interface ChooseStageProps {
  categoryId: TaskCategoryId | null;
  categoryTemplates: readonly TaskTemplate[];
  childProfiles: readonly LocalChildProfile[];
  direction: 'rtl' | 'ltr';
  error: string | null;
  locale: 'ar' | 'en';
  onCategoryChange: (categoryId: TaskCategoryId) => void;
  onChildChange: (childId: SyntheticChildId) => void;
  onTemplateChange: (templateId: string) => void;
  selectedChildId: SyntheticChildId | null;
  selectedTemplateId: string | null;
  orderedCategories: typeof TASK_CATEGORIES;
  recommendedCategoryIds: readonly TaskCategoryId[];
  recommendations: readonly PreparedCategoryRecommendation[];
}

function ChooseStage({
  categoryId,
  categoryTemplates,
  childProfiles,
  direction,
  error,
  locale,
  onCategoryChange,
  onChildChange,
  onTemplateChange,
  selectedChildId,
  selectedTemplateId,
  orderedCategories,
  recommendedCategoryIds,
  recommendations,
}: ChooseStageProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.stage}>
      <View style={styles.stageHeading}>
        <Text brand color="deepForest" variant="heading">
          {t('r002aTasks.chooseHeading')}
        </Text>
        <Text brand color="onSurfaceVariant" variant="body">
          {t('r002aTasks.chooseBody')}
        </Text>
      </View>

      <View accessibilityRole="radiogroup" style={styles.childChoices}>
        {childProfiles.map((child) => (
          <ParentChildChoice
            disabled={false}
            key={child.id}
            label={`${child.nickname} · ${t('access.setup.ageBand')} ${isolateBidiText(t(CHILD_AGE_LABEL_KEYS[child.ageBand]), 'ltr')}`}
            onPress={() => onChildChange(child.id)}
            selected={selectedChildId === child.id}
            testID={child.id === 'child_salem' ? 'task-child-salem' : 'task-child-alya'}
          />
        ))}
      </View>

      {selectedChildId ? (
        <View style={styles.section}>
          {recommendedCategoryIds.length > 0 ? (
            <View style={styles.recommendationPanel} testID="profile-recommendation-panel">
              <AssistantIdentity
                description={t('taskNew.profileRecommendationDisclosure')}
                direction={direction}
                language={locale}
                origin="prepared"
                originLabel={t('origin.prepared')}
                title={t('taskNew.profileRecommendationTitle')}
              />
              <View
                style={[
                  styles.recommendationCategories,
                  { flexDirection: logicalRowDirection(direction) },
                ]}
              >
                {orderedCategories
                  .filter((category) => recommendedCategoryIds.includes(category.id))
                  .map((category) => {
                    const recommendation = recommendations.find(
                      (entry) => entry.categoryId === category.id,
                    );
                    return (
                      <View key={category.id} style={styles.recommendationItem}>
                        <View
                          style={[
                            styles.recommendationChip,
                            { flexDirection: logicalRowDirection(direction) },
                          ]}
                        >
                          <GhafIcon
                            color={colors.ghafEmerald}
                            name={CATEGORY_ICONS[category.id]}
                            size={18}
                          />
                          <Text brand color="primary" variant="caption">
                            {localize(category.label, locale)}
                          </Text>
                        </View>
                        {recommendation ? (
                          <Text
                            brand
                            color="onSurfaceVariant"
                            direction={direction}
                            language={locale}
                            variant="caption"
                            testID={`task-reason-${category.id}`}
                          >
                            {t(`profileRecommendations.${recommendation.reasonCode}`)}
                          </Text>
                        ) : null}
                      </View>
                    );
                  })}
              </View>
            </View>
          ) : null}
          <Text brand color="deepForest" variant="heading">
            {t('r002aTasks.categoryHeading')}
          </Text>
          <View
            accessibilityRole="radiogroup"
            style={[styles.categoryGrid, { flexDirection: logicalRowDirection(direction) }]}
          >
            {orderedCategories.map((category) => {
              const selected = category.id === categoryId;
              const recommended = recommendedCategoryIds.includes(category.id);
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  aria-checked={selected}
                  key={category.id}
                  onPress={() => onCategoryChange(category.id)}
                  style={({ pressed }) => [
                    styles.categoryCard,
                    selected ? styles.categoryCardSelected : null,
                    pressed ? styles.pressed : null,
                  ]}
                  testID={`category-${category.id}`}
                >
                  <GhafIcon
                    color={selected ? colors.ghafEmerald : colors.onSurfaceVariant}
                    name={CATEGORY_ICONS[category.id]}
                    size={27}
                  />
                  {recommended ? (
                    <View style={styles.recommendationBadge}>
                      <Text brand color="primary" variant="caption">
                        {t('taskNew.profileRecommended')}
                      </Text>
                    </View>
                  ) : null}
                  <Text
                    align="center"
                    brand
                    color={selected ? 'primary' : 'onSurface'}
                    variant="control"
                  >
                    {localize(category.label, locale)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {categoryId ? (
        <View style={styles.section}>
          <Text brand color="deepForest" variant="heading">
            {t('taskNew.templateLabel')}
          </Text>
          <View accessibilityRole="radiogroup" style={styles.templateList}>
            {categoryTemplates.map((template) => {
              const isP0 = template.id === P0_RECYCLING_TEMPLATE.id;
              const isExecutableForSelection = Boolean(
                selectedChildId &&
                (template.catalogExecution || (isP0 && selectedChildId === 'child_salem')),
              );
              const selected = selectedTemplateId === template.id;
              const disabled = !isExecutableForSelection && !taskWorkspaceFeatureFlag;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected, disabled }}
                  aria-checked={selected}
                  disabled={disabled}
                  key={template.id}
                  onPress={() => onTemplateChange(template.id)}
                  style={({ pressed }) => [
                    styles.templateRow,
                    selected ? styles.templateActive : null,
                    pressed && !disabled ? styles.pressed : null,
                    disabled ? styles.disabled : null,
                  ]}
                  testID={`template-${template.id}`}
                >
                  <View
                    style={[styles.templateMain, { flexDirection: logicalRowDirection(direction) }]}
                  >
                    <View style={styles.templateIcon}>
                      <GhafIcon color={colors.ghafEmerald} name="leaf" size={24} />
                    </View>
                    <View style={styles.grow}>
                      <Text brand color="onSurface" variant="control">
                        {localize(template.title, locale)}
                      </Text>
                      <Text brand color="onSurfaceVariant" variant="caption">
                        {localize(template.estimatedEffort, locale)} ·{' '}
                        {isExecutableForSelection || !taskWorkspaceFeatureFlag
                          ? template.recognitionMode === 'recognition_only'
                            ? t('catalog.noAward')
                            : t('catalog.award', { count: template.displayedSeedAward })
                          : t('taskWorkspace.previewOnly')}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.templateAvailability,
                      { alignSelf: direction === 'rtl' ? 'flex-end' : 'flex-start' },
                    ]}
                  >
                    <Text brand color={selected ? 'primary' : 'onSurfaceVariant'} variant="caption">
                      {isExecutableForSelection
                        ? t('catalog.ready')
                        : t(
                            taskWorkspaceFeatureFlag
                              ? 'taskWorkspace.previewOnly'
                              : 'origin.future',
                          )}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {error ? (
        <Text accessibilityLiveRegion="polite" brand color="error" testID="task-composer-error">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

interface EditStageProps {
  busyIntent: ParentGuideIntent | null;
  categoryId: TaskCategoryId | null;
  direction: 'rtl' | 'ltr';
  displayedSeedAward: number;
  error: string | null;
  guideOrigin: AssistantIdentityOrigin;
  guideSuggestionApplied: boolean;
  liveDraftView: ReturnType<typeof usePrototypeStore.getState>['parentTaskDraftingView'];
  journeyExists: boolean;
  executableSelection: boolean;
  locale: 'ar' | 'en';
  onAccept: () => void;
  onAskGuide: (intent: ParentGuideIntent) => Promise<void>;
  onAskLiveDraft: (intent: ParentTaskDraftRequestV1['intent']) => Promise<void>;
  onAcceptLiveDraft: () => void;
  onChangeSelection: () => void;
  onKeepMine: () => void;
  onKeepLiveDraft: () => void;
  onEditLiveDraft: () => void;
  onParentTextChange: (text: LocalizedText) => void;
  parentText: LocalizedText;
  selectedChildLabel: string;
  selectedTemplate: TaskTemplate;
  savedTaskTemplates: readonly SavedParentTaskTemplate[];
  savedTemplateMessage: string | null;
  onDeleteSavedTemplate: (id: string) => void;
  onSaveCurrentTemplate: () => void;
  onUseSavedTemplate: (template: SavedParentTaskTemplate) => void;
  suggestion: ReturnType<typeof usePrototypeStore.getState>['parentGuideSuggestion'];
}

function EditStage({
  busyIntent,
  categoryId,
  direction,
  displayedSeedAward,
  error,
  guideOrigin,
  guideSuggestionApplied,
  liveDraftView,
  journeyExists,
  executableSelection,
  locale,
  onAccept,
  onAskGuide,
  onAskLiveDraft,
  onAcceptLiveDraft,
  onChangeSelection,
  onKeepMine,
  onKeepLiveDraft,
  onEditLiveDraft,
  onParentTextChange,
  parentText,
  selectedChildLabel,
  selectedTemplate,
  savedTaskTemplates,
  savedTemplateMessage,
  onDeleteSavedTemplate,
  onSaveCurrentTemplate,
  onUseSavedTemplate,
  suggestion,
}: EditStageProps) {
  const { t } = useTranslation();
  const journey = usePrototypeStore((state) => state.journey);
  const selectedCategory = TASK_CATEGORIES.find((item) => item.id === categoryId);

  return (
    <View style={styles.stage}>
      <View style={styles.stageHeading}>
        <Text brand color="deepForest" variant="heading">
          {t('r002aTasks.editHeading')}
        </Text>
        <Text brand color="onSurfaceVariant" variant="bodyLarge">
          {t('r002aTasks.editBody')}
        </Text>
      </View>

      <View style={[styles.selectionSummary, { flexDirection: logicalRowDirection(direction) }]}>
        <View style={styles.summaryIcon}>
          <GhafIcon color={colors.ghafEmerald} name="leaf" size={26} />
        </View>
        <View style={styles.grow}>
          <Text brand color="onSurface" variant="label">
            {selectedChildLabel}
          </Text>
          {selectedCategory ? (
            <Text brand color="secondary" variant="body">
              {localize(selectedCategory.label, locale)}
            </Text>
          ) : null}
        </View>
        {!journeyExists ? (
          <Button
            brand
            fullWidth={false}
            onPress={onChangeSelection}
            size="compact"
            variant="quiet"
          >
            {t('r002aTasks.change')}
          </Button>
        ) : null}
      </View>

      <View style={styles.sectionCard}>
        <Text brand color="deepForest" variant="heading">
          {t('taskNew.templateLabel')}
        </Text>
        <Text brand color="onSurface" variant="bodyLarge">
          {localize(selectedTemplate.title, locale)}
        </Text>
        <Input
          brand
          direction="rtl"
          editable={
            !suggestion &&
            !liveDraftView.suggestion &&
            liveDraftView.status !== 'requesting' &&
            (!journey || journey.lifecycle === 'draft' || journey.lifecycle === 'reviewed')
          }
          label={`${t('taskNew.parentTextLabel')} · ${t('language.arabic')}`}
          language="ar"
          multiline
          onChangeText={(ar) => onParentTextChange({ ...parentText, ar })}
          testID="parent-wording-ar"
          value={parentText.ar}
        />
        <Input
          brand
          direction="ltr"
          editable={
            !suggestion &&
            !liveDraftView.suggestion &&
            liveDraftView.status !== 'requesting' &&
            (!journey || journey.lifecycle === 'draft' || journey.lifecycle === 'reviewed')
          }
          label={`${t('taskNew.parentTextLabel')} · ${t('language.english')}`}
          language="en"
          multiline
          onChangeText={(en) => onParentTextChange({ ...parentText, en })}
          testID="parent-wording-en"
          value={parentText.en}
        />
      </View>

      {taskWorkspaceFeatureFlag ? (
        <View style={styles.savedTemplates} testID="saved-task-templates">
          <View style={styles.stageHeading}>
            <Text brand color="deepForest" variant="heading">
              {t('taskWorkspace.savedTitle')}
            </Text>
            <Text brand color="onSurfaceVariant" variant="body">
              {t('taskWorkspace.savedBody')}
            </Text>
          </View>
          <Button brand onPress={onSaveCurrentTemplate} variant="secondary">
            {t('taskWorkspace.saveTemplate')}
          </Button>
          {savedTemplateMessage ? (
            <Text accessibilityLiveRegion="polite" brand color="primary" variant="caption">
              {savedTemplateMessage}
            </Text>
          ) : null}
          {savedTaskTemplates.length === 0 ? (
            <Text brand color="onSurfaceVariant" variant="body">
              {t('taskWorkspace.emptySaved')}
            </Text>
          ) : (
            savedTaskTemplates.map((template) => (
              <View key={template.id} style={styles.savedTemplateRow}>
                <Text brand color="deepForest" variant="bodyLarge">
                  {localize(template.title, locale)}
                </Text>
                <View
                  style={[
                    styles.savedTemplateActions,
                    { flexDirection: logicalRowDirection(direction) },
                  ]}
                >
                  <Button
                    brand
                    fullWidth={false}
                    onPress={() => onUseSavedTemplate(template)}
                    size="compact"
                    variant="secondary"
                  >
                    {t('taskWorkspace.useTemplate')}
                  </Button>
                  <Button
                    brand
                    fullWidth={false}
                    onPress={() => onDeleteSavedTemplate(template.id)}
                    size="compact"
                    variant="quiet"
                  >
                    {t('taskWorkspace.deleteTemplate')}
                  </Button>
                </View>
              </View>
            ))
          )}
        </View>
      ) : null}

      {aiFeatureFlags.ai_parent_task_drafting_live ? (
        <View style={styles.liveDraftSection} testID="parent-task-drafting-controls">
          <AssistantIdentity
            description={t('taskNew.liveDraftDisclosure')}
            direction={direction}
            language={locale}
            origin="live"
            originLabel={t('assistant.liveLabel')}
            title={t('taskNew.liveDraftTitle')}
          />

          <View style={[styles.intentGrid, { flexDirection: logicalRowDirection(direction) }]}>
            {LIVE_DRAFT_INTENTS.map(({ intent, key }) => (
              <Button
                brand
                busy={liveDraftView.status === 'requesting'}
                busyLabel={t('assistant.loading')}
                disabled={
                  liveDraftView.status === 'requesting' ||
                  Boolean(liveDraftView.suggestion) ||
                  Boolean(suggestion)
                }
                fullWidth={false}
                key={intent}
                onPress={() => void onAskLiveDraft(intent)}
                testID={`parent-task-drafting-${intent}`}
                variant="secondary"
              >
                {t(`taskNew.${key}`)}
              </Button>
            ))}
          </View>

          {liveDraftView.suggestion && liveDraftView.retainedCopy ? (
            <View
              accessibilityLiveRegion="polite"
              style={styles.comparison}
              testID="parent-task-drafting-diff"
            >
              <Text brand color="secondary" testID="parent-task-drafting-origin" variant="caption">
                {liveDraftView.origin === 'live'
                  ? t('taskNew.liveDraftLiveOrigin')
                  : t('taskNew.liveDraftPreparedOrigin')}
              </Text>
              {liveDraftView.status === 'fallback' ? (
                <Text brand color="tertiary" variant="caption">
                  {t('taskNew.liveDraftFallback')}
                </Text>
              ) : null}
              <View style={styles.comparisonColumn} testID="parent-task-drafting-retained">
                <Text brand color="onSurfaceVariant" variant="caption">
                  {t('taskNew.liveDraftRetained')}
                </Text>
                <Text brand>{localize(liveDraftView.retainedCopy.title, locale)}</Text>
                <Text brand>{localize(liveDraftView.retainedCopy.positiveAction, locale)}</Text>
              </View>
              <View style={styles.comparisonColumn} testID="parent-task-drafting-suggested">
                <Text brand color="secondary" variant="caption">
                  {t('taskNew.liveDraftSuggested')}
                </Text>
                <Text brand>{localize(liveDraftView.suggestion.title, locale)}</Text>
                <Text brand>{localize(liveDraftView.suggestion.positiveAction, locale)}</Text>
                <Text brand>{localize(liveDraftView.suggestion.whyItMatters, locale)}</Text>
                {liveDraftView.suggestion.steps.map((step) => (
                  <Text brand key={step.order}>
                    {step.order}. {localize(step.text, locale)}
                  </Text>
                ))}
                <Text brand>{localize(liveDraftView.suggestion.supportCue, locale)}</Text>
              </View>
              <View style={styles.comparisonActions}>
                <Button brand onPress={onAcceptLiveDraft} testID="accept-parent-task-draft">
                  {t('taskNew.liveDraftAccept')}
                </Button>
                <Button
                  brand
                  onPress={onKeepLiveDraft}
                  testID="keep-parent-task-draft"
                  variant="quiet"
                >
                  {t('taskNew.liveDraftKeep')}
                </Button>
                <Button
                  brand
                  onPress={onEditLiveDraft}
                  testID="edit-parent-task-draft"
                  variant="quiet"
                >
                  {t('taskNew.liveDraftEdit')}
                </Button>
              </View>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.guideSection}>
        <AssistantIdentity
          description={t('taskNew.guidePurpose')}
          direction={direction}
          language={locale}
          origin={guideOrigin}
          originLabel={t(
            guideOrigin === 'live' ? 'assistant.liveLabel' : 'assistant.preparedLabel',
          )}
          originTestID="parent-guide-origin"
          title={t('taskNew.guideTitle')}
        />
        <Text
          brand
          color="deepForest"
          direction={direction}
          testID="guide-actions-heading"
          variant="label"
        >
          {t('taskNew.guideActionsTitle')}
        </Text>
        <View style={[styles.intentGrid, { flexDirection: logicalRowDirection(direction) }]}>
          {GUIDE_INTENTS.map(({ intent, key }) => (
            <Button
              brand
              busy={busyIntent === intent}
              busyLabel={t(guideOrigin === 'live' ? 'assistant.liveLoading' : 'assistant.loading')}
              disabled={
                busyIntent !== null ||
                Boolean(suggestion) ||
                liveDraftView.status === 'requesting' ||
                Boolean(liveDraftView.suggestion)
              }
              fullWidth={false}
              key={intent}
              onPress={() => void onAskGuide(intent)}
              testID={`guide-${intent}`}
              variant="secondary"
            >
              {t(`taskNew.${key}`)}
            </Button>
          ))}
        </View>

        {suggestion ? (
          <View
            accessibilityLiveRegion="polite"
            style={styles.comparison}
            testID="guide-suggestion"
          >
            {suggestion.meta.fallbackUsed ? (
              <Text accessibilityLiveRegion="polite" brand color="tertiary" variant="caption">
                {t('assistant.unavailable')}
              </Text>
            ) : null}
            <View style={styles.comparisonColumn}>
              <Text brand color="onSurfaceVariant" variant="caption">
                {t('assistant.retainedInput')}
              </Text>
              <Text brand>{localize(suggestion.originalParentText, locale)}</Text>
            </View>
            <View style={styles.comparisonColumn}>
              <Text brand color="secondary" variant="caption">
                {suggestion.meta.origin === 'live'
                  ? t('assistant.liveLabel')
                  : t('assistant.preparedLabel')}
              </Text>
              <Text brand>{localize(suggestion.suggestedContent.positiveAction, locale)}</Text>
            </View>
            <View style={styles.comparisonActions}>
              <Button brand onPress={onAccept} testID="accept-guide-suggestion">
                {t('taskNew.acceptSuggestion')}
              </Button>
              <Button brand onPress={onKeepMine} testID="keep-parent-wording" variant="quiet">
                {t('taskNew.keepMine')}
              </Button>
            </View>
          </View>
        ) : null}

        {guideSuggestionApplied ? (
          <View
            accessibilityLiveRegion="polite"
            style={styles.appliedRecord}
            testID="guide-suggestion-applied"
          >
            <Text brand color="primary" variant="label">
              {t('taskNew.suggestionApplied')}
            </Text>
            <Text brand color="onSurfaceVariant" variant="caption">
              {t('assistant.humanDecides')}
            </Text>
          </View>
        ) : null}
      </View>

      {executableSelection ? (
        <View style={styles.rewardRecord}>
          <Text brand color="tertiary" variant="caption">
            {t('taskReview.recognition')}
          </Text>
          <Text brand color="deepForest" variant="heading">
            {t('taskReview.awardWithCount', {
              count: displayedSeedAward,
            })}
          </Text>
          <Text brand color="onSurfaceVariant" variant="caption">
            {t('taskReview.noEarlyReward')}
          </Text>
        </View>
      ) : (
        <View style={[styles.previewRecord, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon color={colors.mangroveTeal} name="plus" size={23} />
          <Text brand color="onSurfaceVariant" style={styles.grow} variant="body">
            {t('taskWorkspace.previewEditing')}
          </Text>
        </View>
      )}

      {error ? (
        <Text accessibilityLiveRegion="polite" brand color="error" testID="task-composer-error">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

function ParentChildChoice({
  disabled,
  label,
  onPress,
  selected,
  testID,
}: {
  disabled: boolean;
  label: string;
  onPress: () => void;
  selected: boolean;
  testID: string;
}) {
  const [focused, setFocused] = useState(false);
  const direction = usePrototypeStore((state) => state.direction);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      aria-checked={selected}
      disabled={disabled}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.childSelection,
        { flexDirection: logicalRowDirection(direction) },
        selected ? styles.childSelectionActive : null,
        focused ? styles.focused : null,
        pressed ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
      testID={testID}
    >
      <View style={[styles.childMark, selected ? styles.childMarkSelected : null]}>
        <GhafIcon color={selected ? colors.onPrimary : colors.ghafEmerald} name="child" size={25} />
      </View>
      <View style={styles.grow}>
        <Text brand color="onSurface" variant="bodyLarge">
          {label}
        </Text>
      </View>
      <GhafIcon
        color={selected ? colors.ghafEmerald : colors.outline}
        name={selected ? 'check-filled' : 'check'}
        size={25}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screenContent: { paddingBottom: spacing.xxl },
  stage: { gap: spacing.xl },
  stageHeading: { gap: spacing.xs },
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
  section: { gap: spacing.md },
  childChoices: { gap: spacing.sm },
  grow: { flex: 1, minWidth: 0, gap: spacing.xxs },
  childSelection: {
    minHeight: 88,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
    ...r001Shadows.soft,
  },
  childSelectionActive: {
    borderWidth: 2,
    borderColor: colors.ghafEmerald,
    backgroundColor: colors.ghafEmeraldSelection,
  },
  childMark: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.primaryFixedTint,
  },
  childMarkSelected: { backgroundColor: colors.ghafEmerald },
  categoryGrid: { flexWrap: 'wrap', gap: spacing.sm },
  recommendationPanel: {
    gap: spacing.md,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.ghafEmeraldTint,
    padding: spacing.md,
  },
  recommendationCategories: {
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  recommendationItem: {
    width: '100%',
    gap: spacing.xxs,
  },
  recommendationChip: {
    minHeight: 36,
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  categoryCard: {
    minHeight: 112,
    flexGrow: 1,
    flexBasis: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
    ...r001Shadows.soft,
  },
  categoryCardSelected: {
    borderWidth: 2,
    borderColor: colors.ghafEmerald,
    backgroundColor: colors.ghafEmeraldSelection,
  },
  recommendationBadge: {
    borderRadius: r001Radii.pill,
    backgroundColor: colors.primaryFixedTint,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  templateList: { gap: spacing.sm },
  templateRow: {
    minHeight: 88,
    alignItems: 'stretch',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
  },
  templateMain: {
    alignItems: 'center',
    gap: spacing.md,
  },
  templateAvailability: {
    minHeight: 32,
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.primaryFixedTint,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  templateActive: {
    borderWidth: 2,
    borderColor: colors.ghafEmerald,
    backgroundColor: colors.ghafEmeraldSelection,
  },
  templateIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.primaryFixedTint,
  },
  selectionSummary: {
    minHeight: 88,
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
  },
  summaryIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.surfaceContainerLowest,
  },
  sectionCard: {
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.lg,
    ...r001Shadows.soft,
  },
  savedTemplates: {
    gap: spacing.md,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.lg,
  },
  savedTemplateRow: {
    gap: spacing.sm,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
  },
  savedTemplateActions: { flexWrap: 'wrap', gap: spacing.xs },
  guideSection: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.secondaryFixedDim,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.secondaryTint,
    padding: spacing.lg,
  },
  liveDraftSection: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.mangroveTeal,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.secondaryTint,
    padding: spacing.lg,
  },
  intentGrid: { flexWrap: 'wrap', gap: spacing.xs },
  comparison: {
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondaryFixedDim,
    paddingTop: spacing.md,
  },
  comparisonColumn: { gap: spacing.xs },
  comparisonActions: { gap: spacing.xs },
  appliedRecord: {
    gap: spacing.xxs,
    borderTopWidth: 1,
    borderTopColor: colors.secondaryFixedDim,
    paddingTop: spacing.md,
  },
  rewardRecord: {
    gap: spacing.xxs,
    borderWidth: 1,
    borderColor: colors.solarAmberBorder,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.solarAmberTint,
    padding: spacing.md,
  },
  previewRecord: {
    minHeight: 64,
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.secondaryTint,
    padding: spacing.md,
  },
  pressed: { opacity: opacity.pressed, transform: [{ scale: 0.99 }] },
  focused: { borderColor: colors.secondary, borderWidth: 3 },
  disabled: { opacity: opacity.disabled },
});
