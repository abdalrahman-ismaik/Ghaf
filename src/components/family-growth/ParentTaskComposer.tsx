import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GhafIcon, type GhafIconName } from '@/components/access';
import { Button, Input, Text } from '@/components/primitives';
import {
  R002aFlowHeader,
  R002aScreen,
  TaskBuilderFooter,
  TaskStepIndicator,
} from '@/components/r002a';
import {
  colors,
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
import { createPreparedTaskCategoryPlan } from '@/features/assistants/profilePersonalization';
import type { ParentProgressTaskPrefill } from '@/features/growth/parentProgress';
import { localize } from '@/i18n';
import type {
  LocalizedText,
  ParentGuideIntent,
  SyntheticChildId,
  TaskCategoryId,
  TaskTemplate,
} from '@/models/familyGrowth';
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
  const createTaskDraft = usePrototypeStore((state) => state.createTaskDraft);
  const updateTaskDraftParentText = usePrototypeStore((state) => state.updateTaskDraftParentText);
  const requestParentGuide = usePrototypeStore((state) => state.requestParentGuide);
  const acceptGuideSuggestion = usePrototypeStore((state) => state.acceptGuideSuggestion);
  const keepParentText = usePrototypeStore((state) => state.keepParentText);
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

  const [selectedChildId, setSelectedChildId] = useState<SyntheticChildId | null>(
    journey?.task.targetChildId ?? acceptedInitialPrefill?.childId ?? activeChildId,
  );
  const profileCategoryPlan = useMemo(() => {
    const profile = localFamily.record?.children.find((child) => child.id === selectedChildId);
    if (!profile) return null;
    const result = createPreparedTaskCategoryPlan(
      {
        ageBand: profile.ageBand,
        interests: profile.interests,
        hobbies: profile.hobbies,
        accessibilityDefaults: profile.accessibilityDefaults,
        supportPreferences: profile.supportPreferences,
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
  const [stage, setStage] = useState<BuilderStage>(journey ? 'edit' : 'choose');
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
  const guideDisclosure =
    suggestion?.meta.disclosure.text ?? serviceRegistry.parentGuidePrimary.disclosure.text;
  const guideSuggestionApplied = Boolean(journey?.task.acceptedGuideFixtureId) && !suggestion;
  const hasExecutableSelection =
    selectedChildId === 'child_salem' &&
    categoryId === 'green_impact' &&
    selectedTemplateId === P0_RECYCLING_TEMPLATE.id;

  const categoryTemplates = useMemo(
    () =>
      [...TASK_TEMPLATES, P0_RECYCLING_TEMPLATE].filter(
        (template) => template.categoryId === categoryId,
      ),
    [categoryId],
  );

  const ensureDraft = () => {
    if (journey?.lifecycle === 'draft') return true;
    if (journey?.lifecycle === 'reviewed') {
      const returned = returnReviewedTaskToDraft();
      if (returned.ok) return true;
      setError(t('errors.safeRetry'));
      return false;
    }
    if (journey) {
      setError(t('errors.invalidState'));
      return false;
    }
    if (!hasExecutableSelection) {
      setError(t('errors.invalidState'));
      return false;
    }
    const created = createTaskDraft({
      childId: selectedChildId,
      templateId: P0_RECYCLING_TEMPLATE.id,
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
    if (!hasExecutableSelection) {
      setError(t('errors.invalidState'));
      return;
    }
    setStage('edit');
  };

  return (
    <R002aScreen
      contentContainerStyle={styles.screenContent}
      footer={
        stage === 'choose' ? (
          <TaskBuilderFooter
            actionLabel={t('r002aTasks.continue')}
            direction={direction}
            disabled={!hasExecutableSelection}
            onPress={continueToEdit}
            testID="task-builder-continue"
          />
        ) : (
          <TaskBuilderFooter
            actionLabel={t('taskNew.review')}
            busy={busyIntent !== null}
            busyLabel={t('assistant.loading')}
            direction={direction}
            disabled={!hasExecutableSelection || Boolean(suggestion)}
            onPress={continueToReview}
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
          direction={direction}
          error={error}
          locale={locale}
          onCategoryChange={(value) => {
            setCategoryId(value);
            setSelectedTemplateId(null);
            setError(null);
          }}
          onChildChange={(value) => {
            setSelectedChildId(value);
            if (value === 'child_alya') {
              setCategoryId(null);
              setSelectedTemplateId(null);
            } else {
              setCategoryId('green_impact');
              setSelectedTemplateId(P0_RECYCLING_TEMPLATE.id);
            }
            setError(null);
          }}
          onTemplateChange={(value) => {
            setSelectedTemplateId(value);
            setError(null);
          }}
          selectedChildId={selectedChildId}
          selectedTemplateId={selectedTemplateId}
          orderedCategories={orderedCategories}
          recommendedCategoryIds={recommendedCategoryIds}
        />
      ) : (
        <EditStage
          busyIntent={busyIntent}
          categoryId={categoryId}
          direction={direction}
          displayedSeedAward={
            journey?.task.content.displayedSeedAward ??
            P0_RECYCLING_TEMPLATE.displayedSeedAward ??
            0
          }
          error={error}
          guideDisclosure={guideDisclosure}
          guideSuggestionApplied={guideSuggestionApplied}
          journeyExists={Boolean(journey)}
          locale={locale}
          onAccept={accept}
          onAskGuide={askGuide}
          onChangeSelection={() => setStage('choose')}
          onKeepMine={keepMine}
          onParentTextChange={setParentText}
          parentText={parentText}
          suggestion={suggestion}
        />
      )}
    </R002aScreen>
  );
}

interface ChooseStageProps {
  categoryId: TaskCategoryId | null;
  categoryTemplates: readonly TaskTemplate[];
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
}

function ChooseStage({
  categoryId,
  categoryTemplates,
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
}: ChooseStageProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.stage}>
      <View style={styles.stageHeading}>
        <Text brand color="deepForest" variant="screenTitle">
          {t('r002aTasks.chooseHeading')}
        </Text>
        <Text brand color="onSurfaceVariant" variant="body">
          {t('r002aTasks.chooseBody')}
        </Text>
      </View>

      <View accessibilityRole="radiogroup" style={styles.childChoices}>
        <ParentChildChoice
          disabled={false}
          label={t('role.chooseSalem')}
          onPress={() => onChildChange('child_salem')}
          selected={selectedChildId === 'child_salem'}
          testID="task-child-salem"
        />
        <ParentChildChoice
          disabled={false}
          label={t('role.chooseAlya')}
          onPress={() => onChildChange('child_alya')}
          selected={selectedChildId === 'child_alya'}
          testID="task-child-alya"
        />
      </View>
      {selectedChildId === 'child_alya' ? (
        <Text brand color="onSurfaceVariant" variant="caption">
          {t('origin.future')}
        </Text>
      ) : null}

      {selectedChildId === 'child_salem' ? (
        <View style={styles.section}>
          <Text brand color="deepForest" variant="heading">
            {t('r002aTasks.categoryHeading')}
          </Text>
          {recommendedCategoryIds.length > 0 ? (
            <Text brand color="onSurfaceVariant" variant="caption">
              {t('taskNew.profileRecommendationDisclosure')}
            </Text>
          ) : null}
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
              const selected = selectedTemplateId === template.id;
              const disabled = !isP0;
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
                        {template.displayedSeedAward
                          ? t('common.seeds', { count: template.displayedSeedAward })
                          : t('origin.future')}
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
                      {isP0 ? t('childHome.availableTask') : t('origin.future')}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          {categoryId !== 'green_impact' ? (
            <Text brand color="onSurfaceVariant" variant="caption">
              {t('origin.future')}
            </Text>
          ) : null}
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
  guideDisclosure: LocalizedText;
  guideSuggestionApplied: boolean;
  journeyExists: boolean;
  locale: 'ar' | 'en';
  onAccept: () => void;
  onAskGuide: (intent: ParentGuideIntent) => Promise<void>;
  onChangeSelection: () => void;
  onKeepMine: () => void;
  onParentTextChange: (text: LocalizedText) => void;
  parentText: LocalizedText;
  suggestion: ReturnType<typeof usePrototypeStore.getState>['parentGuideSuggestion'];
}

function EditStage({
  busyIntent,
  categoryId,
  direction,
  displayedSeedAward,
  error,
  guideDisclosure,
  guideSuggestionApplied,
  journeyExists,
  locale,
  onAccept,
  onAskGuide,
  onChangeSelection,
  onKeepMine,
  onParentTextChange,
  parentText,
  suggestion,
}: EditStageProps) {
  const { t } = useTranslation();
  const journey = usePrototypeStore((state) => state.journey);
  const selectedCategory = TASK_CATEGORIES.find((item) => item.id === categoryId);

  return (
    <View style={styles.stage}>
      <View style={styles.stageHeading}>
        <Text brand color="deepForest" variant="screenTitle">
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
            {t('role.chooseSalem')}
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
          {localize(P0_RECYCLING_TEMPLATE.title, locale)}
        </Text>
        <Input
          brand
          direction="rtl"
          editable={
            !suggestion &&
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

      <View style={styles.guideSection}>
        <View style={[styles.guideHeading, { flexDirection: logicalRowDirection(direction) }]}>
          <View style={styles.guideMark}>
            <GhafIcon color={colors.mangroveTeal} name="sparkle" size={25} />
          </View>
          <View style={styles.grow}>
            <Text brand color="secondary" variant="heading">
              {t('taskNew.guideTitle')}
            </Text>
            <Text brand color="onSurfaceVariant" variant="caption">
              {localize(guideDisclosure, locale)}
            </Text>
          </View>
        </View>
        <View style={[styles.intentGrid, { flexDirection: logicalRowDirection(direction) }]}>
          {GUIDE_INTENTS.map(({ intent, key }) => (
            <Button
              brand
              busy={busyIntent === intent}
              busyLabel={t('assistant.loading')}
              disabled={busyIntent !== null || Boolean(suggestion)}
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
  guideSection: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.secondaryFixedDim,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.secondaryTint,
    padding: spacing.lg,
  },
  guideHeading: { alignItems: 'center', gap: spacing.sm },
  guideMark: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.lg,
    backgroundColor: colors.surfaceContainerLowest,
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
  pressed: { opacity: opacity.pressed, transform: [{ scale: 0.99 }] },
  focused: { borderColor: colors.secondary, borderWidth: 3 },
  disabled: { opacity: opacity.disabled },
});
