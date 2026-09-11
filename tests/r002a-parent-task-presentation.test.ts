import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { resources } from '../src/i18n/resources';

const root = fileURLToPath(new URL('../', import.meta.url));

function source(relativePath: string) {
  return readFileSync(`${root}${relativePath}`, 'utf8');
}

const presentationFiles = [
  'src/components/r002a/R002aFlowHeader.tsx',
  'src/components/r002a/parent/ParentTasksView.tsx',
  'src/components/r002a/parent/TaskBuilderFooter.tsx',
  'src/components/r002a/parent/TaskStepIndicator.tsx',
  'src/components/r002a/parent/TaskCreatedSuccessSheet.tsx',
] as const;

describe('R002a Parent Tasks and Builder presentation', () => {
  it('keeps Parent Tasks and builder stages as states of existing native routes', () => {
    for (const relativePath of presentationFiles) {
      expect(existsSync(`${root}${relativePath}`), relativePath).toBe(true);
      const contents = source(relativePath);
      expect(contents, relativePath).not.toMatch(
        /(?:<div|className=|WebView|\.html["']|\.png["'])/u,
      );
      expect(contents, relativePath).not.toMatch(/https?:\/\//u);
    }

    const parentHome = source('app/parent/index.tsx');
    const tasksRoute = source('app/parent/index.tsx');
    const composer = source('src/components/family-growth/ParentTaskComposer.tsx');

    expect(parentHome).toContain("params: { section: 'tasks' }");
    expect(tasksRoute).toContain('state.journey');
    expect(tasksRoute).toContain('state.activeChildId');
    expect(tasksRoute).toContain('taskAddedToken !== dismissedTaskAddedToken');
    expect(tasksRoute).toContain("router.push('/parent/task/new')");
    expect(composer).toContain("type BuilderStage = 'choose' | 'edit'");
    expect(composer).toContain('<TaskStepIndicator');
    expect(composer).not.toMatch(/router\.(?:push|replace)/u);
  });

  it('preserves the existing task commands, canonical ID, and guarded review payload', () => {
    const composer = source('src/components/family-growth/ParentTaskComposer.tsx');
    const review = source('app/parent/task/review.tsx');
    const combined = `${composer}\n${review}`;

    for (const command of [
      'createTaskDraft',
      'updateTaskDraftParentText',
      'requestParentGuide',
      'acceptGuideSuggestion',
      'keepParentText',
      'reviewTask',
      'returnReviewedTaskToDraft',
      'approveAssignment',
      'setChildVoicePermission',
    ]) {
      expect(combined, command).toContain(command);
    }
    expect(combined).toContain('P0_RECYCLING_TEMPLATE.id');
    expect(combined).not.toContain('task.recycling_sort.v1');
    expect(review).toContain('<SafetyBoundary');
    expect(review).toContain('<ParentVoicePermissionPanel');
    expect(review).toContain("t('taskReview.noEarlyReward')");
    expect(review).toContain('approvalNavigationPending.current = true');
    expect(review).toContain('const result = approveAssignment()');
    expect(review).toContain("BackHandler.addEventListener('hardwareBackPress'");
    expect(review).toMatch(/hardwareBackPress[\s\S]{0,120}edit\(\)/u);
    expect(review).toContain("bilingualResource('taskReview.awardWithCount'");
    expect(review).not.toContain("bilingualResource('taskReview.award')");
    expect(review).toContain('router.dismissTo({');
    expect(review).toContain('added: journey!.task.id');
    expect(review).toContain('router.dismissAll();');
    expect(review).toContain('signOutExperience();');
    expect(review).toContain("router.replace('/access/child' as Href);");
  });

  it('keeps established automation hooks and adds truthful success/list states', () => {
    const tasksRoute = source('app/parent/index.tsx');
    const composer = source('src/components/family-growth/ParentTaskComposer.tsx');
    const review = source('app/parent/task/review.tsx');
    const footer = source('src/components/r002a/parent/TaskBuilderFooter.tsx');
    const steps = source('src/components/r002a/parent/TaskStepIndicator.tsx');
    const success = source('src/components/r002a/parent/TaskCreatedSuccessSheet.tsx');
    const combined = `${tasksRoute}\n${composer}\n${review}\n${footer}\n${steps}\n${success}`;

    for (const testId of [
      'parent-tasks-screen',
      'parent-task-new-screen',
      'parent-task-review-screen',
      'task-child-salem',
      'task-child-alya',
      'parent-wording-ar',
      'parent-wording-en',
      'review-task-button',
      'approve-assignment-button',
      'edit-reviewed-task-button',
      'task-created-success-sheet',
    ]) {
      expect(combined, testId).toContain(testId);
    }
    expect(composer).toContain('testID={`category-${category.id}`}');
    expect(composer).toContain('testID={`template-${template.id}`}');
    expect(footer).toContain('iconPosition="end"');
    expect(footer).toContain('direction={direction}');
    expect(footer).not.toContain("direction={direction === 'rtl' ? 'ltr' : 'rtl'}");
    expect(steps).toContain('styles.connectorRail');
    expect(steps).toContain('color={colors.ghafEmerald}');
    expect(success).toContain('accessibilityViewIsModal');
    expect(success).toContain('announcementMessage={`${message} ${consequence}`}');
    expect(success).toContain('<Modal');
    expect(success).toContain('onRequestClose={onDismiss}');
    expect(success).toContain('useReducedMotion');
    expect(tasksRoute).toContain('accessibilityLiveRegion="polite"');
    expect(combined).not.toMatch(/\b(?:108|120|180)\b/u);
  });

  it('provides paired Arabic and English copy without placeholders', () => {
    const arabic = resources.ar.translation.r002aTasks;
    const english = resources.en.translation.r002aTasks;

    expect(arabic).toBeDefined();
    expect(english).toBeDefined();
    expect(Object.keys(arabic ?? {}).sort()).toEqual(Object.keys(english ?? {}).sort());
    expect(JSON.stringify({ arabic, english })).not.toMatch(/EN:S|\{\{DATA:SCREEN:/u);
  });
});
