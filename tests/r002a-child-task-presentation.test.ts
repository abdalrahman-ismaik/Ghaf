import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { P0_RECYCLING_TEMPLATE } from '../src/features/tasks/demoContent';
import { resources } from '../src/i18n/resources';

const root = fileURLToPath(new URL('../', import.meta.url));

function source(relativePath: string) {
  const absolutePath = `${root}${relativePath}`;
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function sourcesIn(relativeDirectory: string) {
  const absoluteDirectory = `${root}${relativeDirectory}`;
  if (!existsSync(absoluteDirectory)) return '';
  return readdirSync(absoluteDirectory)
    .filter((file) => file.endsWith('.tsx'))
    .map((file) => source(`${relativeDirectory}/${file}`))
    .join('\n');
}

const childPresentationFiles = [
  'src/components/r002a/child/ChildBottomNavigation.tsx',
  'src/components/r002a/child/ChildCompletionConfirmationSheet.tsx',
  'src/components/r002a/child/ChildDefinitionCard.tsx',
  'src/components/r002a/child/ChildGardenProgressCard.tsx',
  'src/components/r002a/child/ChildHomeHeader.tsx',
  'src/components/r002a/child/ChildTaskFollowUpContext.tsx',
  'src/components/r002a/child/ChildTaskActionFooter.tsx',
  'src/components/r002a/child/ChildTaskChecklist.tsx',
  'src/components/r002a/child/ChildTaskHero.tsx',
  'src/components/r002a/child/ChildTaskPlanCard.tsx',
  'src/components/r002a/child/ChildTodayTaskCard.tsx',
  'src/components/r002a/child/ChildWaitingForReview.tsx',
] as const;

describe('R002a Child Today and task presentation', () => {
  it('keeps Today and the complete task lifecycle on the two existing authored routes', () => {
    expect(
      readdirSync(`${root}app/child`)
        .filter((file) => file.endsWith('.tsx'))
        .sort(),
    ).toEqual(['index.tsx', 'task.tsx']);

    expect(
      readdirSync(`${root}src/components/r002a/child`)
        .filter((file) => file.endsWith('.tsx'))
        .sort(),
    ).toEqual(childPresentationFiles.map((path) => path.split('/').at(-1)).sort());

    for (const relativePath of childPresentationFiles) {
      expect(existsSync(`${root}${relativePath}`), relativePath).toBe(true);
      const contents = source(relativePath);
      expect(contents, relativePath).not.toMatch(
        /(?:<div|className=|WebView|\.html["']|\.png["'])/u,
      );
      expect(contents, relativePath).not.toMatch(/https?:\/\//u);
      expect(contents, relativePath).not.toMatch(
        /(?:expo-router|@\/state|@\/services|usePrototypeStore|useRouter|serviceRegistry|router\.)/u,
      );
    }

    const todayRoute = source('app/child/index.tsx');
    const taskRoute = source('app/child/task.tsx');
    const combined = `${todayRoute}\n${taskRoute}`;

    expect(todayRoute).toContain('<ChildBottomNavigation');
    expect(taskRoute).toContain('<ChildTaskChecklist');
    expect(taskRoute).toContain("journey.lifecycle === 'chosen'");
    expect(taskRoute).toContain("journey.lifecycle === 'submitted'");
    expect(combined).not.toMatch(/\/(?:child\/)?task\/(?:active|confirmation|waiting)/u);
  });

  it('projects the active Child profile toward the preserved 60-Seed milestone', () => {
    const todayRoute = source('app/child/index.tsx');

    expect(todayRoute).toContain('child.earnedSeeds');
    expect(todayRoute).toMatch(/(?:gardenTarget|gardenMilestone)\s*=\s*60/u);
    expect(todayRoute).toMatch(
      /gardenCurrent\s*=\s*Math\.min\(child\.earnedSeeds,\s*gardenTarget\)/u,
    );
    expect(todayRoute).toMatch(/<ChildGardenProgressCard[\s\S]{0,500}current=\{gardenCurrent\}/u);
    expect(todayRoute).toMatch(/<ChildGardenProgressCard[\s\S]{0,700}target=\{garden/u);
    expect(todayRoute).not.toContain('currentLandscape.nextThreshold');
  });

  it('renders 0/2, 1/2, and 2/2 as accessible checklist states with physical RTL placement', () => {
    const taskRoute = source('app/child/task.tsx');
    const checklist = source('src/components/r002a/child/ChildTaskChecklist.tsx');
    const combined = `${taskRoute}\n${checklist}`;

    expect(checklist).toContain('accessibilityRole="checkbox"');
    expect(checklist).toContain('accessibilityState={{ checked: completed }}');
    expect(checklist).toContain("direction === 'rtl' ? styles.rowRtl : styles.rowLtr");
    expect(checklist).toMatch(/rowRtl:\s*\{[^}]*flexDirection:\s*'row-reverse'/u);
    expect(checklist).toContain('completedStepIds.length');
    expect(checklist).toContain('steps.length');
    expect(checklist).toContain('task-step-progress');
    expect(checklist).toContain('task-step-');
    expect(combined).toContain('completedStepIds');
    expect(combined).toContain('setCompletedStepIds');
    expect(combined).toContain('completedStepIds.length === taskCheckpoints.length');
  });

  it('keeps the Arabic Child navigation in explicit physical order and uses a native nested Back', () => {
    const navigation = source('src/components/r002a/child/ChildBottomNavigation.tsx');
    const taskRoute = source('app/child/task.tsx');

    const today = navigation.indexOf("id: 'today'");
    const garden = navigation.indexOf("id: 'garden'");
    const league = navigation.indexOf("id: 'league'");

    // Logical source order stays Today → Garden → League for screen readers.
    // RTL flex reversal gives the required physical League | Garden | Today placement.
    expect(today).toBeGreaterThanOrEqual(0);
    expect(garden).toBeGreaterThan(today);
    expect(league).toBeGreaterThan(garden);
    expect(navigation).toContain('physicalRow');
    expect(navigation).toContain("direction === 'rtl' ? styles.rowRtl : styles.rowLtr");
    expect(navigation).toMatch(/rowRtl:\s*\{[^}]*flexDirection:\s*'row-reverse'/u);
    expect(navigation).toContain(
      'accessibilityState={{ disabled: item.disabled, selected: active }}',
    );
    expect(navigation).toContain('layout.touchTarget');
    expect(navigation).toContain('disabled: true');
    expect(navigation).not.toContain("router.push('/circle')");
    expect(taskRoute).toContain("const physicalBack = () => router.replace('/child');");
    expect(taskRoute).toContain('onBack={physicalBack}');
  });

  it('keeps confirmation and waiting as native task states with no early reward claim', () => {
    const taskRoute = source('app/child/task.tsx');
    const presentation = sourcesIn('src/components/r002a/child');
    const combined = `${taskRoute}\n${presentation}`;

    expect(combined).toContain('task-completion-confirmation');
    expect(combined).toContain('<Modal');
    expect(combined).toContain('accessibilityViewIsModal');
    expect(combined).toContain('onRequestClose');
    expect(combined).toContain('showCompletionConfirmation');
    expect(taskRoute).toContain("t('taskReview.noEarlyReward')");
    expect(taskRoute).toContain('child-task-submitted-screen');
    expect(taskRoute).toContain('submitTask({');
    expect(combined).not.toContain('applyRecognition');
    expect(combined).not.toContain('markPraisePresented');
    expect(combined).not.toMatch(/(?:earnedSeeds|cumulativeSeeds)\s*[+\-=]/u);
  });

  it('keeps Ready reachable and opens confirmation only after both presentation checkpoints', () => {
    const todayRoute = source('app/child/index.tsx');
    const taskRoute = source('app/child/task.tsx');
    const footer = source('src/components/r002a/child/ChildTaskActionFooter.tsx');

    expect(todayRoute).not.toContain('startAssignment');
    expect(todayRoute).toContain("router.push('/child/task')");
    const chosenBranch = taskRoute.slice(
      taskRoute.indexOf("journey.lifecycle === 'chosen'"),
      taskRoute.indexOf("journey.lifecycle === 'submitted'"),
    );
    expect(chosenBranch).toContain('onPress={startTask}');
    expect(taskRoute).toContain('const result = startAssignment();');
    expect(taskRoute).toContain('disabled={!taskComplete || !definitionAcknowledged}');
    expect(taskRoute).toContain('setShowCompletionConfirmation(true);');
    expect(taskRoute).toMatch(
      /if\s*\([^)]*!taskComplete[^)]*!definitionAcknowledged[^)]*\)\s*return/u,
    );
    expect(footer).toContain('minHeight: layout.controlHeight');
  });

  it('keeps the canonical definition separate from the active checklist acknowledgement', () => {
    const taskRoute = source('app/child/task.tsx');
    const activeBranch = taskRoute.slice(
      taskRoute.indexOf('return (\n    <>'),
      taskRoute.indexOf('<ChildCompletionConfirmationSheet'),
    );
    const definitionIndex = activeBranch.indexOf('<ChildDefinitionCard');
    const acknowledgementIndex = activeBranch.indexOf('<ChildTaskChecklist');
    const definitionCard = source('src/components/r002a/child/ChildDefinitionCard.tsx');

    expect(definitionIndex).toBeGreaterThanOrEqual(0);
    expect(definitionIndex).toBeGreaterThan(acknowledgementIndex);
    expect(activeBranch).toContain('content.definitionOfDone');
    expect(activeBranch).toContain('acknowledgeLabel=');
    expect(activeBranch).toContain('<ChildTaskChecklist');
    expect(definitionCard).toContain("'child-definition-of-done'");
    expect(definitionCard).toContain('testID="definition-acknowledgement"');
  });

  it('keeps task meaning, supervision, recognition mode, and adjustment safety on the Today card', () => {
    const todayRoute = source('app/child/index.tsx');
    const taskCard = source('src/components/r002a/child/ChildTodayTaskCard.tsx');
    const currentAssignment = todayRoute.slice(
      todayRoute.indexOf('<ChildTodayTaskCard'),
      todayRoute.indexOf("{adjustmentBlocksChoice && currentWorkMode === 'choose'"),
    );

    expect(currentAssignment).toContain('currentTemplate.whyItMatters');
    expect(currentAssignment).toContain('currentTemplate.supervision');
    expect(currentAssignment).toContain('currentTemplate.recognitionMode');
    expect(taskCard).toContain('whyItMatters');
    expect(taskCard).toContain('supervisionValue');
    expect(taskCard).toContain('recognitionValue');

    const adjustmentPanel = todayRoute.slice(
      todayRoute.indexOf('{childDecisionRequired && activeAdjustment.proposal ? ('),
      todayRoute.indexOf('{currentAssignmentChoice && currentTemplate'),
    );
    expect(adjustmentPanel).toContain('activeAdjustment.proposal.content.safety.adultPreCheck');
    expect(adjustmentPanel).toContain('activeAdjustment.proposal.content.safety.stopAndAskAdult');
  });

  it('keeps category and landscape meaning separate and derives recognition copy from content', () => {
    const todayRoute = source('app/child/index.tsx');
    const taskRoute = source('app/child/task.tsx');

    expect(todayRoute).toContain('currentTemplate.categoryId');
    expect(todayRoute).toContain('localize(currentCategory.label, locale)');
    expect(todayRoute).toContain('LANDSCAPE_LABEL_KEYS[template.landscapeId]');
    expect(taskRoute).toContain('content.categoryId');
    expect(taskRoute).toContain('localize(taskCategory.label, locale)');
    expect(taskRoute).not.toContain("categoryLabel={t('garden.mangrove')}");
    expect(taskRoute).toMatch(/displayedSeedAward\s*\?\s*t\('childHome\.awardAfterConfirmation'/u);
    expect(taskRoute).toMatch(/:\s*t\('taskReview\.noSeedRecognition'\)/u);
  });

  it('gives the confirmation sheet the complete review context and renders recoverable errors', () => {
    const taskRoute = source('app/child/task.tsx');
    const confirmationSheet = source(
      'src/components/r002a/child/ChildCompletionConfirmationSheet.tsx',
    );
    const invocation = taskRoute.slice(
      taskRoute.indexOf('<ChildCompletionConfirmationSheet'),
      taskRoute.indexOf('/>', taskRoute.indexOf('<ChildCompletionConfirmationSheet')) + 2,
    );

    expect(invocation).toContain('taskTitle={childFacingTitle}');
    expect(invocation).toContain('privacyLabel=');
    expect(invocation).toContain('reflectionLabel=');
    expect(invocation).toContain('mediaLabel=');
    expect(invocation).toContain('error={error}');

    for (const renderedProp of [
      'taskTitle',
      'privacyLabel',
      'reflectionLabel',
      'mediaLabel',
      'error',
    ]) {
      const occurrences = confirmationSheet.match(new RegExp(`\\b${renderedProp}\\b`, 'gu')) ?? [];
      expect(occurrences.length, renderedProp).toBeGreaterThanOrEqual(3);
    }
    expect(confirmationSheet).toMatch(
      /error\s*\?\s*\([\s\S]{0,240}accessibilityLiveRegion="(?:polite|assertive)"/u,
    );
    expect(confirmationSheet).toContain('iconPosition="end"');
    expect(confirmationSheet).toContain('name="arrow-back"');
    expect(taskRoute).toContain('error && !showCompletionConfirmation');
  });

  it('preserves physical header placement while exposing locale-correct reading order', () => {
    const header = source('src/components/r002a/child/ChildHomeHeader.tsx');

    expect(header).toContain("direction === 'rtl' ? styles.rowRtl : styles.rowLtr");
    expect(header).toMatch(
      /direction === 'rtl'[\s\S]{0,180}\{avatarControl\}[\s\S]{0,100}\{titleControl\}[\s\S]{0,100}\{helpControl\}/u,
    );
    expect(header).toMatch(/rowRtl:\s*\{\s*flexDirection:\s*'row-reverse'/u);
  });

  it('announces the submitted state once for each submission identity', () => {
    const taskRoute = source('app/child/task.tsx');

    expect(taskRoute).toContain('announcedWaitingIdRef');
    expect(taskRoute).toContain('AccessibilityInfo.announceForAccessibility');
    expect(taskRoute).toContain("journey?.lifecycle !== 'submitted'");
    expect(taskRoute).toContain('announcedWaitingIdRef.current === submissionId');
  });

  it('blocks a synchronous double submit before the React busy state rerenders', () => {
    const taskRoute = source('app/child/task.tsx');
    const submitBody = taskRoute.slice(
      taskRoute.indexOf('const submit = () => {'),
      taskRoute.indexOf('\n  };', taskRoute.indexOf('const submit = () => {')),
    );

    expect(taskRoute).toMatch(
      /const\s+submit(?:InFlight|Guard|Timer)Ref\s*=\s*useRef(?:<[^;]+>)?\((?:false|null)\)/u,
    );
    expect(submitBody).toMatch(
      /if\s*\((?:submit(?:InFlight|Guard|Timer)Ref\.current|[^)]*submit(?:InFlight|Guard|Timer)Ref\.current[^)]*)\)\s*return/u,
    );
    expect(submitBody).toMatch(
      /submit(?:InFlight|Guard|Timer)Ref\.current\s*=\s*(?:true|setTimeout)/u,
    );
    expect(submitBody).toMatch(/submit(?:InFlight|Guard|Timer)Ref\.current\s*=\s*(?:false|null)/u);
  });

  it('keeps locale access and safe-area action ownership in the submitted state', () => {
    const taskRoute = source('app/child/task.tsx');
    const submittedBranch = taskRoute.slice(
      taskRoute.indexOf("if (journey.lifecycle === 'submitted')"),
      taskRoute.indexOf('return (\n    <>'),
    );
    expect(submittedBranch).toContain('<LanguageSwitcher');
    expect(submittedBranch).toMatch(
      /safeAreaEdges=\{\[['"]top['"],\s*['"]left['"],\s*['"]right['"],\s*['"]bottom['"]\]\}/u,
    );
  });

  it('uses the compact task hero after work starts while keeping Ready visually complete', () => {
    const taskRoute = source('app/child/task.tsx');
    const hero = source('src/components/r002a/child/ChildTaskHero.tsx');
    const chosenBranch = taskRoute.slice(
      taskRoute.indexOf("if (journey.lifecycle === 'chosen')"),
      taskRoute.indexOf("if (journey.lifecycle === 'submitted')"),
    );
    const activeBranch = taskRoute.slice(
      taskRoute.indexOf('return (\n    <>'),
      taskRoute.indexOf('<ChildCompletionConfirmationSheet'),
    );

    expect(chosenBranch).not.toMatch(/<ChildTaskHero[\s\S]{0,160}variant="active"/u);
    expect(activeBranch).toMatch(/<ChildTaskHero[\s\S]{0,400}variant="active"/u);
    expect(hero).toContain("variant?: 'active' | 'ready'");
    expect(hero).toContain("variant === 'ready'");
  });

  it('recovers an interrupted active route conservatively without changing task authority', () => {
    const taskRoute = source('app/child/task.tsx');

    expect(taskRoute).toContain(
      "journey?.lifecycle === 'in_progress' && journey.submission === null",
    );
    expect(taskRoute).toContain('testID="child-task-interrupted-recovery"');
    expect(taskRoute).toContain("t('childTask.interruptedRecovery')");
    expect(resources.ar.translation.childTask.interruptedRecovery).toContain('لم يتغير');
    expect(resources.en.translation.childTask.interruptedRecovery).toContain('unchanged');
  });

  it('reuses the canonical task identity and preserves help, voice, access, and reset boundaries', () => {
    const todayRoute = source('app/child/index.tsx');
    const taskRoute = source('app/child/task.tsx');
    const store = source('src/state/usePrototypeStore.ts');
    const combined = `${todayRoute}\n${taskRoute}`;

    expect(P0_RECYCLING_TEMPLATE.id).toBe('task_recycling_p0_v1');
    expect(combined).toContain('P0_RECYCLING_TEMPLATE');
    expect(combined).not.toContain('task.recycling_sort.v1');
    expect(combined).not.toMatch(/\b(?:108|120|180)\b/u);
    expect(todayRoute).toContain("role !== 'child'");
    expect(todayRoute).toContain("router.replace('/role')");
    expect(taskRoute).toContain('journey.assignment.childId === activeChildId');
    expect(taskRoute).toContain('requestChildCoach');
    expect(taskRoute).toContain('<TrustedAdultExit');
    expect(taskRoute).toContain('<SyntheticVoicePanel');
    expect(taskRoute).toContain('prepareChildVoice');
    expect(store).toContain(
      "failure('INVALID_TRANSITION', 'Switch to the Parent demo role before reset')",
    );
    expect(store).toContain("childVoiceController.resetPrototype('parent')");
  });

  it('keeps all Child task and navigation copy paired without placeholder text', () => {
    const arabic = {
      navigation: resources.ar.translation.navigation,
      childHome: resources.ar.translation.childHome,
      childTask: resources.ar.translation.childTask,
    };
    const english = {
      navigation: resources.en.translation.navigation,
      childHome: resources.en.translation.childHome,
      childTask: resources.en.translation.childTask,
    };

    expect(Object.keys(arabic.navigation).sort()).toEqual(Object.keys(english.navigation).sort());
    expect(Object.keys(arabic.childHome).sort()).toEqual(Object.keys(english.childHome).sort());
    expect(Object.keys(arabic.childTask).sort()).toEqual(Object.keys(english.childTask).sort());
    expect(JSON.stringify({ arabic, english })).not.toMatch(/EN:S|\{\{DATA:SCREEN:/u);
  });
});
