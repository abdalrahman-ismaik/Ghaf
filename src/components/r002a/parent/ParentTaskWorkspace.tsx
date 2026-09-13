import { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GhafIcon, type GhafIconName } from '@/components/access';
import { BotanicalPressable as Pressable } from '@/components/botanical';
import { Button, Text } from '@/components/primitives';
import {
  botanical,
  colors,
  layout,
  logicalRowDirection,
  opacity,
  spacing,
  type LayoutDirection,
} from '@/design/tokens';
import {
  RESET_PREVIEW_CHOICES,
  TASK_CATEGORIES,
  TASK_TEMPLATES,
} from '@/features/tasks/demoContent';
import { localize } from '@/i18n';
import type { SyntheticChildId, TaskCategoryId } from '@/models/familyGrowth';
import type { ParentTaskProjection } from './ParentTasksView';

type ChildFilter = 'all' | SyntheticChildId;

interface WorkspaceChild {
  readonly id: SyntheticChildId;
  readonly label: string;
}

interface ParentTaskWorkspaceProps {
  readonly activeChildId: SyntheticChildId;
  readonly childProfiles: readonly WorkspaceChild[];
  readonly current: (ParentTaskProjection & { readonly childId: SyntheticChildId }) | null;
  readonly direction: LayoutDirection;
  readonly locale: 'ar' | 'en';
  readonly onCreateTask: (childId: SyntheticChildId) => void;
  readonly onOpenCurrent: () => void;
}

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

const CategoryCard = memo(function CategoryCard({
  icon,
  label,
}: {
  readonly icon: GhafIconName;
  readonly label: string;
}) {
  return (
    <View accessible accessibilityLabel={label} style={styles.categoryCard}>
      <View style={styles.categoryIcon}>
        <GhafIcon color={colors.ghafEmerald} name={icon} size={25} />
      </View>
      <Text brand color="deepForest" variant="label">
        {label}
      </Text>
    </View>
  );
});

const TemplateCard = memo(function TemplateCard({
  category,
  title,
  previewLabel,
}: {
  readonly category: string;
  readonly title: string;
  readonly previewLabel: string;
}) {
  return (
    <View accessible accessibilityLabel={`${title}. ${previewLabel}`} style={styles.templateCard}>
      <View style={styles.templateMeta}>
        <Text brand color="primary" variant="caption">
          {category}
        </Text>
        <View style={styles.previewChip}>
          <Text brand color="onSurfaceVariant" variant="caption">
            {previewLabel}
          </Text>
        </View>
      </View>
      <Text brand color="deepForest" variant="heading">
        {title}
      </Text>
    </View>
  );
});

export function ParentTaskWorkspace({
  activeChildId,
  childProfiles,
  current,
  direction,
  locale,
  onCreateTask,
  onOpenCurrent,
}: ParentTaskWorkspaceProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [childFilter, setChildFilter] = useState<ChildFilter>('all');
  const [categoryId, setCategoryId] = useState<TaskCategoryId>('green_impact');
  const cardWidth = Math.min(264, Math.max(216, width - spacing.xxl * 2.4));
  const visibleChildren =
    childFilter === 'all' ? childProfiles : childProfiles.filter((item) => item.id === childFilter);
  const categoryTemplates = useMemo(
    () => TASK_TEMPLATES.filter((item) => item.categoryId === categoryId),
    [categoryId],
  );
  const createTarget = childFilter === 'all' ? activeChildId : childFilter;

  const selectChild = useCallback((id: ChildFilter) => setChildFilter(id), []);
  const renderCategory = useCallback(
    ({ item }: { item: (typeof TASK_CATEGORIES)[number] }) => (
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ checked: categoryId === item.id }}
        onPress={() => setCategoryId(item.id)}
        style={({ pressed }) => [
          categoryId === item.id ? styles.selectedRailCard : null,
          pressed ? styles.pressed : null,
        ]}
        testID={`workspace-category-${item.id}`}
      >
        <CategoryCard icon={CATEGORY_ICONS[item.id]} label={localize(item.label, locale)} />
      </Pressable>
    ),
    [categoryId, locale],
  );
  const renderTemplate = useCallback(
    ({ item }: { item: (typeof TASK_TEMPLATES)[number] }) => (
      <View style={{ width: cardWidth }}>
        <TemplateCard
          category={localize(
            TASK_CATEGORIES.find((category) => category.id === item.categoryId)!.label,
            locale,
          )}
          previewLabel={t('taskWorkspace.previewOnly')}
          title={localize(item.title, locale)}
        />
      </View>
    ),
    [cardWidth, locale, t],
  );

  return (
    <View style={styles.root} testID="parent-task-workspace">
      <View style={styles.createPanel}>
        <View style={styles.createCopy}>
          <Text brand color="deepForest" variant="heading">
            {t('taskWorkspace.createTitle')}
          </Text>
          <Text brand color="onSurfaceVariant" variant="body">
            {t('taskWorkspace.createBody')}
          </Text>
        </View>
        <Button
          brand
          fullWidth
          icon={<GhafIcon color={colors.onPrimary} name="plus" size={23} />}
          onPress={() => onCreateTask(createTarget)}
          testID="parent-tasks-create-task"
        >
          {t('r002aTasks.createTask')}
        </Button>
      </View>

      <View
        accessibilityRole="radiogroup"
        style={[styles.filterRail, { flexDirection: logicalRowDirection(direction) }]}
      >
        {(['all', ...childProfiles.map((item) => item.id)] as const).map((id) => {
          const selected = childFilter === id;
          const label =
            id === 'all'
              ? t('taskWorkspace.allChildren')
              : childProfiles.find((item) => item.id === id)!.label;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              key={id}
              onPress={() => selectChild(id)}
              style={({ pressed }) => [
                styles.filterChip,
                selected ? styles.filterChipSelected : null,
                pressed ? styles.pressed : null,
              ]}
              testID={`workspace-child-${id}`}
            >
              <Text
                align="center"
                brand
                color={selected ? 'onPrimary' : 'onSurfaceVariant'}
                variant="label"
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text brand color="deepForest" variant="heading">
            {t('taskWorkspace.familyTasks')}
          </Text>
          <Text brand color="onSurfaceVariant" variant="body">
            {t('taskWorkspace.familyTasksBody')}
          </Text>
        </View>
        {visibleChildren.map((child) => {
          const childCurrent = current?.childId === child.id ? current : null;
          const preview = RESET_PREVIEW_CHOICES.find((item) => item.childId === child.id);
          const previewTemplate = TASK_TEMPLATES.find(
            (item) => item.id === preview?.taskTemplateId,
          );
          return (
            <View
              key={child.id}
              style={styles.childSection}
              testID={`workspace-child-section-${child.id}`}
            >
              <View
                style={[styles.childHeading, { flexDirection: logicalRowDirection(direction) }]}
              >
                <View style={styles.childAvatar}>
                  <GhafIcon color={colors.ghafEmerald} name="child" size={24} />
                </View>
                <Text brand color="deepForest" style={styles.flexText} variant="heading">
                  {child.label}
                </Text>
                <Text brand color={childCurrent ? 'primary' : 'onSurfaceVariant'} variant="caption">
                  {childCurrent ? t('taskWorkspace.oneCurrent') : t('taskWorkspace.noCurrent')}
                </Text>
              </View>
              {childCurrent ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={onOpenCurrent}
                  style={({ pressed }) => [styles.currentTask, pressed ? styles.pressed : null]}
                >
                  <Text brand color="primary" variant="caption">
                    {childCurrent.statusLabel}
                  </Text>
                  <Text brand color="deepForest" variant="heading">
                    {childCurrent.title}
                  </Text>
                  {childCurrent.metaLabel ? (
                    <Text brand color="onSurfaceVariant" variant="caption">
                      {childCurrent.metaLabel}
                    </Text>
                  ) : null}
                </Pressable>
              ) : null}
              {previewTemplate ? (
                <View style={styles.preparedRow}>
                  <Text brand color="onSurfaceVariant" variant="caption">
                    {t('taskWorkspace.preparedNext')}
                  </Text>
                  <Text brand color="onSurface" variant="body">
                    {localize(previewTemplate.title, locale)}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text brand color="deepForest" variant="heading">
            {t('taskWorkspace.categories')}
          </Text>
          <Text brand color="onSurfaceVariant" variant="body">
            {t('taskWorkspace.categoriesBody')}
          </Text>
        </View>
        <FlatList
          accessibilityRole="radiogroup"
          contentContainerStyle={styles.horizontalContent}
          data={TASK_CATEGORIES}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          showsHorizontalScrollIndicator={false}
          testID="workspace-category-carousel"
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text brand color="deepForest" variant="heading">
            {t('taskWorkspace.quickStarts')}
          </Text>
          <Text brand color="onSurfaceVariant" variant="body">
            {t('taskWorkspace.quickStartsBody')}
          </Text>
        </View>
        <FlatList
          contentContainerStyle={styles.horizontalContent}
          data={categoryTemplates}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={renderTemplate}
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth + spacing.md}
          testID="workspace-template-carousel"
        />
        <Button brand onPress={() => onCreateTask(createTarget)} variant="secondary">
          {t('taskWorkspace.openFullLibrary')}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    maxWidth: layout.compactContentWidth,
    alignSelf: 'center',
    gap: spacing.xxl,
  },
  createPanel: {
    alignItems: 'stretch',
    gap: spacing.md,
    borderRadius: botanical.radius.surface,
    borderCurve: 'continuous',
    paddingBottom: botanical.space.section,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: botanical.colors.line,
  },
  createCopy: { gap: spacing.xs },
  filterRail: { gap: spacing.xs, flexWrap: 'wrap' },
  filterChip: {
    minHeight: layout.touchTarget,
    justifyContent: 'center',
    borderRadius: botanical.radius.pill,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.sage,
    paddingHorizontal: spacing.md,
  },
  filterChipSelected: { backgroundColor: botanical.colors.forest },
  section: { gap: spacing.md },
  sectionHeading: { gap: spacing.xs },
  horizontalContent: {
    gap: spacing.md,
    paddingHorizontal: 1,
    paddingBottom: spacing.sm,
    paddingEnd: spacing.xxl,
  },
  categoryCard: {
    width: 132,
    minHeight: 124,
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderRadius: botanical.radius.control,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.paper,
    padding: spacing.md,
  },
  selectedRailCard: {
    borderRadius: botanical.radius.control,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: botanical.colors.forest,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.small,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.sage,
  },
  templateCard: {
    minHeight: 154,
    justifyContent: 'space-between',
    gap: spacing.lg,
    borderRadius: botanical.radius.control,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.sage,
    padding: spacing.lg,
  },
  templateMeta: { gap: spacing.xs },
  previewChip: {
    minWidth: 0,
  },
  childSection: {
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: botanical.colors.line,
    paddingVertical: spacing.md,
  },
  childHeading: { minHeight: layout.touchTarget, alignItems: 'center', gap: spacing.sm },
  childAvatar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.pill,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.sage,
  },
  currentTask: {
    minHeight: layout.touchTarget,
    gap: spacing.xs,
    borderRadius: botanical.radius.control,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.sage,
    padding: spacing.md,
  },
  preparedRow: {
    gap: spacing.xxs,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    paddingTop: spacing.sm,
  },
  flexText: { flex: 1, minWidth: 0 },
  pressed: { opacity: opacity.pressed },
});
