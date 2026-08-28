import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, Input, Text } from '@/components/primitives';
import { colors, layout, radii, spacing } from '@/design/tokens';
import {
  P0_RECYCLING_TEMPLATE,
  TASK_CATEGORIES,
  TASK_TEMPLATES,
} from '@/features/tasks/demoContent';
import { localize } from '@/i18n';
import type {
  LocalizedText,
  ParentGuideIntent,
  SyntheticChildId,
  TaskCategoryId,
} from '@/models/familyGrowth';
import { PARENT_GUIDE_FIXTURE, serviceRegistry } from '@/services';
import { usePrototypeStore } from '@/state/usePrototypeStore';

interface ParentTaskComposerProps {
  onReadyForReview: () => void;
}

const GUIDE_INTENTS: readonly { intent: ParentGuideIntent; key: string }[] = [
  { intent: 'make_clearer', key: 'makeClearer' },
  { intent: 'make_smaller', key: 'makeSmaller' },
  { intent: 'check_safety', key: 'checkSafety' },
  { intent: 'adapt_age', key: 'adaptAge' },
] as const;

export function ParentTaskComposer({ onReadyForReview }: ParentTaskComposerProps) {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const journey = usePrototypeStore((state) => state.journey);
  const suggestion = usePrototypeStore((state) => state.parentGuideSuggestion);
  const createTaskDraft = usePrototypeStore((state) => state.createTaskDraft);
  const updateTaskDraftParentText = usePrototypeStore((state) => state.updateTaskDraftParentText);
  const requestParentGuide = usePrototypeStore((state) => state.requestParentGuide);
  const acceptGuideSuggestion = usePrototypeStore((state) => state.acceptGuideSuggestion);
  const keepParentText = usePrototypeStore((state) => state.keepParentText);
  const reviewTask = usePrototypeStore((state) => state.reviewTask);
  const returnReviewedTaskToDraft = usePrototypeStore((state) => state.returnReviewedTaskToDraft);

  const [categoryId, setCategoryId] = useState<TaskCategoryId | null>(
    journey?.task.content.categoryId ?? null,
  );
  const [selectedChildId, setSelectedChildId] = useState<SyntheticChildId | null>(
    journey?.task.targetChildId ?? null,
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    journey?.task.templateId ?? null,
  );
  const [parentText, setParentText] = useState<LocalizedText>({
    ...(journey?.task.parentOriginalText ?? PARENT_GUIDE_FIXTURE.originalParentText),
  });
  const [busyIntent, setBusyIntent] = useState<ParentGuideIntent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const guideDisclosure =
    suggestion?.meta.disclosure.text ?? serviceRegistry.parentGuide.disclosure.text;
  const guideSuggestionApplied = Boolean(journey?.task.acceptedGuideFixtureId) && !suggestion;

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
    if (
      selectedChildId !== 'child_salem' ||
      categoryId !== 'green_impact' ||
      selectedTemplateId !== P0_RECYCLING_TEMPLATE.id
    ) {
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

  return (
    <View style={styles.root}>
      <View style={styles.section}>
        <Text color="forest" variant="label">
          {t('taskNew.childLabel')}
        </Text>
        <View accessibilityRole="radiogroup" style={styles.childChoices}>
          <ParentChildChoice
            disabled={Boolean(journey)}
            label={t('role.chooseSalem')}
            onPress={() => {
              setSelectedChildId('child_salem');
              setError(null);
            }}
            selected={selectedChildId === 'child_salem'}
            testID="task-child-salem"
          />
          <ParentChildChoice
            disabled={Boolean(journey)}
            label={t('role.chooseAlya')}
            onPress={() => {
              setSelectedChildId('child_alya');
              setCategoryId(null);
              setSelectedTemplateId(null);
              setError(null);
            }}
            selected={selectedChildId === 'child_alya'}
            testID="task-child-alya"
          />
        </View>
        {selectedChildId === 'child_alya' ? (
          <Text color="inkMuted" variant="caption">
            {t('origin.future')}
          </Text>
        ) : null}
      </View>

      {selectedChildId === 'child_salem' ? (
        <View style={styles.section}>
          <Text color="forest" variant="label">
            {t('taskNew.categoryLabel')}
          </Text>
          <View
            accessibilityRole="radiogroup"
            style={[styles.chipGrid, direction === 'rtl' ? styles.rowRtl : null]}
          >
            {TASK_CATEGORIES.map((category) => {
              const selected = category.id === categoryId;
              const disabled = Boolean(journey);
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected, disabled }}
                  disabled={disabled}
                  key={category.id}
                  onPress={() => {
                    setCategoryId(category.id);
                    setSelectedTemplateId(null);
                    setError(null);
                  }}
                  style={({ pressed }) => [
                    styles.chip,
                    selected ? styles.chipSelected : null,
                    pressed && !disabled ? styles.pressed : null,
                    disabled ? styles.disabled : null,
                  ]}
                  testID={`category-${category.id}`}
                >
                  <Text color={selected ? 'white' : 'forest'} variant="caption">
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
          <Text color="forest" variant="label">
            {t('taskNew.templateLabel')}
          </Text>
          <View accessibilityRole="radiogroup">
            {categoryTemplates.map((template) => {
              const isP0 = template.id === P0_RECYCLING_TEMPLATE.id;
              const selected = selectedTemplateId === template.id;
              const disabled = !isP0 || Boolean(journey);
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected, disabled }}
                  disabled={disabled}
                  key={template.id}
                  onPress={() => {
                    setSelectedTemplateId(template.id);
                    setError(null);
                  }}
                  style={({ pressed }) => [
                    styles.templateRow,
                    direction === 'rtl' ? styles.rowRtl : null,
                    selected ? styles.templateActive : null,
                    pressed && !disabled ? styles.pressed : null,
                    disabled ? styles.disabled : null,
                  ]}
                  testID={`template-${template.id}`}
                >
                  <View style={styles.grow}>
                    <Text color="forest" variant="label">
                      {localize(template.title, locale)}
                    </Text>
                    <Text color="inkMuted" variant="caption">
                      {localize(template.estimatedEffort, locale)} ·{' '}
                      {template.displayedSeedAward
                        ? t('common.seeds', { count: template.displayedSeedAward })
                        : t('origin.future')}
                    </Text>
                  </View>
                  <Text color={selected ? 'ghaf' : 'inkMuted'} variant="caption">
                    {isP0 ? t('childHome.availableTask') : t('origin.future')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {categoryId !== 'green_impact' ? (
            <Text color="inkMuted" variant="caption">
              {t('origin.future')}
            </Text>
          ) : null}
        </View>
      ) : null}

      {selectedTemplateId === P0_RECYCLING_TEMPLATE.id ? (
        <View style={styles.section}>
          <Input
            accessibilityLanguage="ar-AE"
            direction="rtl"
            editable={
              !suggestion &&
              (!journey || journey.lifecycle === 'draft' || journey.lifecycle === 'reviewed')
            }
            label={`${t('taskNew.parentTextLabel')} · ${t('language.arabic')}`}
            multiline
            onChangeText={(ar) => setParentText((current) => ({ ...current, ar }))}
            testID="parent-wording-ar"
            value={parentText.ar}
          />
          <Input
            accessibilityLanguage="en-AE"
            direction="ltr"
            editable={
              !suggestion &&
              (!journey || journey.lifecycle === 'draft' || journey.lifecycle === 'reviewed')
            }
            label={`${t('taskNew.parentTextLabel')} · ${t('language.english')}`}
            multiline
            onChangeText={(en) => setParentText((current) => ({ ...current, en }))}
            testID="parent-wording-en"
            value={parentText.en}
          />
        </View>
      ) : null}

      {selectedTemplateId === P0_RECYCLING_TEMPLATE.id ? (
        <View style={styles.guideSection}>
          <View style={[styles.guideHeading, direction === 'rtl' ? styles.rowRtl : null]}>
            <View style={styles.guideMark}>
              <View style={styles.guideLeaf} />
            </View>
            <View style={styles.grow}>
              <Text color="forest" variant="heading">
                {t('taskNew.guideTitle')}
              </Text>
              <Text color="inkMuted" variant="caption">
                {localize(guideDisclosure, locale)}
              </Text>
            </View>
          </View>
          <View style={[styles.intentGrid, direction === 'rtl' ? styles.rowRtl : null]}>
            {GUIDE_INTENTS.map(({ intent, key }) => (
              <Button
                busy={busyIntent === intent}
                busyLabel={t('assistant.loading')}
                disabled={busyIntent !== null || Boolean(suggestion)}
                fullWidth={false}
                key={intent}
                onPress={() => void askGuide(intent)}
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
                <Text accessibilityLiveRegion="polite" color="earth" variant="caption">
                  {t('assistant.unavailable')}
                </Text>
              ) : null}
              <View style={styles.comparisonColumn}>
                <Text color="earth" variant="caption">
                  {t('assistant.retainedInput')}
                </Text>
                <Text>{localize(suggestion.originalParentText, locale)}</Text>
              </View>
              <View style={styles.comparisonColumn}>
                <Text color="ghaf" variant="caption">
                  {t('assistant.preparedLabel')}
                </Text>
                <Text>{localize(suggestion.suggestedContent.positiveAction, locale)}</Text>
              </View>
              <View style={styles.comparisonActions}>
                <Button onPress={accept} testID="accept-guide-suggestion">
                  {t('taskNew.acceptSuggestion')}
                </Button>
                <Button onPress={keepMine} testID="keep-parent-wording" variant="ghost">
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
              <Text color="forest" variant="label">
                {t('taskNew.suggestionApplied')}
              </Text>
              <Text color="inkMuted" variant="caption">
                {t('assistant.humanDecides')}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {selectedTemplateId === P0_RECYCLING_TEMPLATE.id ? (
        <View style={styles.rewardRecord}>
          <Text color="earth" variant="caption">
            {t('taskReview.recognition')}
          </Text>
          <Text color="forest" variant="heading">
            {t('taskReview.award')}
          </Text>
          <Text color="inkMuted" variant="caption">
            {t('taskReview.noEarlyReward')}
          </Text>
        </View>
      ) : null}

      {error ? (
        <Text accessibilityLiveRegion="polite" color="danger" testID="task-composer-error">
          {error}
        </Text>
      ) : null}

      {selectedTemplateId === P0_RECYCLING_TEMPLATE.id ? (
        <Button
          disabled={
            categoryId !== 'green_impact' ||
            selectedChildId !== 'child_salem' ||
            busyIntent !== null ||
            Boolean(suggestion)
          }
          onPress={continueToReview}
          testID="review-task-button"
        >
          {t('taskNew.review')}
        </Button>
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
      disabled={disabled}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.fixedSelection,
        direction === 'rtl' ? styles.rowRtl : null,
        selected ? styles.childSelectionActive : null,
        focused ? styles.focused : null,
        pressed ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
      testID={testID}
    >
      <View style={[styles.childMark, selected ? styles.childMarkSelected : null]} />
      <View style={styles.grow}>
        <Text color="forest" variant="label">
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.xl },
  section: { gap: spacing.sm },
  childChoices: { gap: spacing.xs },
  grow: { flex: 1, minWidth: 0, gap: spacing.xxs },
  rowRtl: { flexDirection: 'row-reverse' },
  fixedSelection: {
    minHeight: layout.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  childSelectionActive: { borderColor: colors.ghaf, backgroundColor: colors.leafMist },
  childMark: {
    width: 18,
    height: 24,
    borderTopLeftRadius: radii.pill,
    borderBottomRightRadius: radii.pill,
    backgroundColor: colors.ghaf,
    transform: [{ rotate: '22deg' }],
  },
  childMarkSelected: { backgroundColor: colors.mangrove },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    minHeight: layout.touchTarget,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipSelected: { borderColor: colors.ghaf, backgroundColor: colors.ghaf },
  pressed: { opacity: 0.74, transform: [{ scale: 0.98 }] },
  focused: { borderColor: colors.gold, borderWidth: 2 },
  disabled: { opacity: 0.48 },
  templateRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: spacing.sm,
  },
  templateActive: {
    borderWidth: 1,
    borderColor: colors.mangrove,
    borderRadius: radii.sm,
    backgroundColor: colors.waterLight,
    paddingHorizontal: spacing.sm,
  },
  guideSection: {
    gap: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.water,
    backgroundColor: colors.waterLight,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  guideHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  guideMark: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.water,
    backgroundColor: colors.surface,
  },
  guideLeaf: {
    width: 21,
    height: 29,
    borderTopLeftRadius: radii.pill,
    borderBottomRightRadius: radii.pill,
    backgroundColor: colors.mangrove,
    transform: [{ rotate: '24deg' }],
  },
  intentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  comparison: {
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.water,
    paddingTop: spacing.md,
  },
  comparisonColumn: { gap: spacing.xs },
  comparisonActions: { gap: spacing.xs },
  appliedRecord: {
    gap: spacing.xxs,
    borderTopWidth: 1,
    borderTopColor: colors.water,
    paddingTop: spacing.md,
  },
  rewardRecord: {
    gap: spacing.xxs,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: radii.sm,
    backgroundColor: colors.goldGlow,
    padding: spacing.md,
  },
});
