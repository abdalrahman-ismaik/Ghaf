import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../', import.meta.url));

function source(relativePath: string) {
  return readFileSync(`${root}${relativePath}`, 'utf8');
}

const routeStateInventory = [
  {
    path: 'app/parent/index.tsx',
    markers: ['parent-home-screen', 'parent-tasks-screen'],
  },
  {
    path: 'src/components/family-growth/ParentTaskComposer.tsx',
    markers: ['parent-task-new-screen', 'task-builder-continue', 'review-task-button'],
  },
  {
    path: 'src/components/r002a/parent/TaskCreatedSuccessSheet.tsx',
    markers: ['task-created-success-sheet'],
  },
  {
    path: 'app/child/index.tsx',
    markers: ['child-home-screen', 'current-assignment'],
  },
  {
    path: 'app/child/task.tsx',
    markers: ['child-task-start-screen', 'child-task-screen', 'child-task-submitted-screen'],
  },
  {
    path: 'src/components/r002a/child/ChildCompletionConfirmationSheet.tsx',
    markers: ['task-completion-confirmation'],
  },
  {
    path: 'app/parent/task/review.tsx',
    markers: ['parent-task-review-screen'],
  },
  {
    path: 'src/components/family-growth/ParentCheckIn.tsx',
    markers: [
      'parent-check-in-screen',
      'kind-retry-state',
      'confirmation-pending-state',
      'praise-presented-state',
      'already-confirmed-state',
    ],
  },
  {
    path: 'src/components/r002a/parent/ParentSupportRequestSheet.tsx',
    markers: ['support-request-sheet'],
  },
  {
    path: 'src/components/r002a/parent/ParentApprovalSuccessSheet.tsx',
    markers: ['parent-approval-success-sheet', 'parent-approval-live-receipt'],
  },
  {
    path: 'app/garden.tsx',
    markers: ['garden-screen', 'uae-landscape-tracks'],
  },
] as const;

const sharedChromeFiles = [
  'src/components/r002a/R002aScreen.tsx',
  'src/components/r002a/R002aFlowHeader.tsx',
  'src/components/r002a/parent/ParentHomeHeader.tsx',
  'src/components/r002a/parent/ParentHomeNavigation.tsx',
  'src/components/r002a/parent/TaskBuilderFooter.tsx',
  'src/components/r002a/child/ChildHomeHeader.tsx',
  'src/components/r002a/child/ChildBottomNavigation.tsx',
  'src/components/r002a/child/ChildTaskActionFooter.tsx',
] as const;

describe('R002a cross-slice quality contracts', () => {
  it('inventories every released route state and remains native-only without web runtime', () => {
    for (const entry of routeStateInventory) {
      expect(existsSync(`${root}${entry.path}`), entry.path).toBe(true);
      const contents = source(entry.path);
      for (const marker of entry.markers)
        expect(contents, `${entry.path}: ${marker}`).toContain(marker);
    }

    const auditedFiles = [...routeStateInventory.map(({ path }) => path), ...sharedChromeFiles];
    const webRuntimePattern =
      /(?:<\/?div\b|className=|WebView|document\.|window\.|localStorage|sessionStorage|<iframe\b|@playwright\/test|\.html["'`]|docs\/design\/|output\/)/u;
    const offenders = auditedFiles.filter((path) => webRuntimePattern.test(source(path)));

    expect(offenders).toEqual([]);
    expect(source('src/components/r002a/R002aScreen.tsx')).toContain("from 'react-native'");
  });

  it('applies one physical RTL and LTR direction contract across released slices', () => {
    const tokens = source('src/design/tokens.ts');
    const flowHeader = source('src/components/r002a/R002aFlowHeader.tsx');
    const parentHeader = source('src/components/r002a/parent/ParentHomeHeader.tsx');
    const childHeader = source('src/components/r002a/child/ChildHomeHeader.tsx');
    const parentNavigation = source('src/components/r002a/parent/ParentHomeNavigation.tsx');
    const childNavigation = source('src/components/r002a/child/ChildBottomNavigation.tsx');
    const checklist = source('src/components/r002a/child/ChildTaskChecklist.tsx');
    const parentFooter = source('src/components/r002a/parent/TaskBuilderFooter.tsx');
    const childFooter = source('src/components/r002a/child/ChildTaskActionFooter.tsx');

    expect(tokens).toContain(
      "return rtl !== reverse ? ('row-reverse' as const) : ('row' as const);",
    );
    expect(flowHeader).toContain("{direction === 'rtl' ? actionControl : backControl}");
    expect(flowHeader).toContain("{direction === 'rtl' ? backControl : actionControl}");
    expect(flowHeader).toMatch(/physicalRow:\s*\{[\s\S]*?flexDirection:\s*'row'/u);

    const settings = parentHeader.indexOf('testID="parent-settings-button"');
    const parentTitle = parentHeader.indexOf('<GhafHeaderTitle');
    const parentAvatar = parentHeader.indexOf('accessibilityLabel={profileLabel}');
    expect(settings).toBeGreaterThanOrEqual(0);
    expect(parentTitle).toBeGreaterThanOrEqual(0);
    expect(parentAvatar).toBeGreaterThanOrEqual(0);
    expect([settings, parentTitle, parentAvatar]).toEqual(
      [...[settings, parentTitle, parentAvatar]].sort((left, right) => left - right),
    );

    expect(childHeader).toContain("direction === 'rtl' ? styles.rowRtl : styles.rowLtr");
    expect(childHeader).toMatch(
      /direction === 'rtl'[\s\S]*?\{avatarControl\}[\s\S]*?\{titleControl\}[\s\S]*?\{helpControl\}/u,
    );
    expect(childHeader).toMatch(/rowRtl:\s*\{\s*flexDirection:\s*'row-reverse'/u);

    const today = childNavigation.indexOf("id: 'today'");
    const garden = childNavigation.indexOf("id: 'garden'");
    const league = childNavigation.indexOf("id: 'league'");
    expect(today).toBeGreaterThanOrEqual(0);
    expect(garden).toBeGreaterThan(today);
    expect(league).toBeGreaterThan(garden);
    expect(childNavigation).toMatch(/rowRtl:\s*\{[\s\S]*?flexDirection:\s*'row-reverse'/u);
    expect(parentNavigation).toContain('flexDirection: logicalRowDirection(direction)');
    expect(checklist).toContain("direction === 'rtl' ? styles.rowRtl : styles.rowLtr");
    expect(parentFooter).toContain('direction={direction}');
    expect(parentFooter).not.toContain("direction={direction === 'rtl' ? 'ltr' : 'rtl'}");
    expect(childFooter).toContain("direction={direction === 'rtl' ? 'ltr' : 'rtl'}");
  });

  it('preserves scalable responsive invariants without a fixed 390 by 844 canvas', () => {
    const auditedFiles = [
      ...routeStateInventory.map(({ path }) => path),
      ...sharedChromeFiles,
      'src/components/r002a/child/ChildTaskChecklist.tsx',
      'src/components/r002a/child/ChildTaskFollowUpContext.tsx',
      'src/components/r002a/parent/ParentTasksView.tsx',
      'app/parent/task/review.tsx',
    ];
    const fixedViewportPattern =
      /\b(?:width|height|minWidth|minHeight|maxWidth|maxHeight)\s*:\s*(?:390|844)\b/u;
    const disabledScalingPattern =
      /(?:allowFontScaling\s*=\s*\{false\}|adjustsFontSizeToFit|minimumFontScale)/u;
    const fixedViewportOffenders = auditedFiles.filter((path) =>
      fixedViewportPattern.test(source(path)),
    );
    const disabledScalingOffenders = auditedFiles.filter((path) =>
      disabledScalingPattern.test(source(path)),
    );
    const requiredCopyFiles = [
      'src/components/r002a/R002aFlowHeader.tsx',
      'src/components/r002a/parent/ParentHomeHeader.tsx',
      'src/components/r002a/parent/ParentHomeNavigation.tsx',
      'src/components/r002a/parent/TaskBuilderFooter.tsx',
      'src/components/r002a/child/ChildHomeHeader.tsx',
      'src/components/r002a/child/ChildBottomNavigation.tsx',
      'src/components/r002a/child/ChildTaskActionFooter.tsx',
    ];
    const clampedRequiredCopyFiles = requiredCopyFiles.filter((path) =>
      /numberOfLines\s*=\s*\{1\}/u.test(source(path)),
    );
    const shell = source('src/components/r002a/R002aScreen.tsx');

    expect(fixedViewportOffenders).toEqual([]);
    expect(disabledScalingOffenders).toEqual([]);
    expect(clampedRequiredCopyFiles).toEqual([]);
    expect(shell).toMatch(/content:\s*\{[\s\S]*?width:\s*'100%'/u);
    expect(shell).toMatch(/content:\s*\{[\s\S]*?maxWidth:\s*layout\.compactContentWidth/u);
    for (const path of [
      'src/components/r002a/R002aFlowHeader.tsx',
      'src/components/r002a/parent/ParentHomeHeader.tsx',
      'src/components/r002a/child/ChildHomeHeader.tsx',
    ]) {
      expect(source(path), path).toMatch(/titleSlot:\s*\{[\s\S]*?minWidth:\s*0/u);
    }

    const parentHome = source('app/parent/index.tsx');
    const canopy = source('src/components/r002a/parent/ParentCanopySummaryCard.tsx');
    const lifecycle = source('src/components/r002a/parent/ParentLifecycleCard.tsx');
    const children = source('src/components/r002a/parent/ParentChildrenSection.tsx');
    const parentNavigation = source('src/components/r002a/parent/ParentHomeNavigation.tsx');

    expect(parentHome).toMatch(/prototypeLabel:\s*\{[\s\S]*?minWidth:\s*0[\s\S]*?flex:\s*1/u);
    expect(canopy).toMatch(/headingText:\s*\{[\s\S]*?maxWidth:\s*'100%'[\s\S]*?flexShrink:\s*1/u);
    expect(lifecycle).toMatch(/chip:\s*\{[\s\S]*?maxWidth:\s*'100%'[\s\S]*?flexShrink:\s*1/u);
    expect(children).toMatch(
      /selectedChip:\s*\{[\s\S]*?maxWidth:\s*'100%'[\s\S]*?flexShrink:\s*1/u,
    );
    expect(parentNavigation).toMatch(/item:\s*\{[\s\S]*?minWidth:\s*layout\.touchTarget/u);
    expect(parentNavigation).toMatch(/label:\s*\{[\s\S]*?width:\s*'100%'[\s\S]*?flexShrink:\s*1/u);
  });

  it('keeps fixed actions structurally clear, safe-area aware, and at least 48 or 56 dp', () => {
    const shell = source('src/components/r002a/R002aScreen.tsx');
    const tokens = source('src/design/tokens.ts');
    const footerFiles = [
      'src/components/r002a/parent/ParentHomeNavigation.tsx',
      'src/components/r002a/parent/TaskBuilderFooter.tsx',
      'src/components/r002a/child/ChildBottomNavigation.tsx',
      'src/components/r002a/child/ChildTaskActionFooter.tsx',
    ];

    expect(shell.indexOf('{footer}')).toBeGreaterThan(shell.indexOf('</KeyboardAvoidingView>'));
    expect(shell).toContain("safeAreaEdges = ['top', 'left', 'right']");
    for (const path of footerFiles) {
      const contents = source(path);
      expect(contents, path).toContain('useSafeAreaInsets');
      expect(contents, path).toContain('insets.bottom');
      expect(contents, path).not.toMatch(/position:\s*'absolute'/u);
    }
    expect(source('src/components/family-growth/ParentCheckIn.tsx')).toContain(
      "<SafeAreaView edges={['right', 'bottom', 'left']} style={styles.footerSafeArea}>",
    );
    expect(source('app/parent/task/review.tsx')).toContain('useSafeAreaInsets');
    expect(source('app/parent/task/review.tsx')).toContain('insets.bottom');
    expect(tokens).toMatch(/touchTarget:\s*48\b/u);
    expect(tokens).toMatch(/controlHeight:\s*56\b/u);
    expect(source('src/components/r002a/child/ChildTaskActionFooter.tsx')).toContain(
      'minHeight: layout.controlHeight',
    );
  });

  it('makes every released editable state keyboard aware', () => {
    const shell = source('src/components/r002a/R002aScreen.tsx');
    const editableHosts = [
      {
        host: 'app/parent/index.tsx',
        editable: 'src/components/family-growth/ParentPatternSummary.tsx',
      },
      {
        host: 'src/components/family-growth/ParentTaskComposer.tsx',
        editable: 'src/components/family-growth/ParentTaskComposer.tsx',
      },
      {
        host: 'src/components/family-growth/ParentCheckIn.tsx',
        editable: 'src/components/family-growth/ParentCheckIn.tsx',
      },
      {
        host: 'app/child/task.tsx',
        editable: 'app/child/task.tsx',
      },
    ] as const;

    expect(shell).toContain('<KeyboardAvoidingView');
    expect(shell).toContain('enabled={keyboardAware}');
    expect(shell).toContain('automaticallyAdjustKeyboardInsets={keyboardAware}');
    expect(shell).toContain('keyboardShouldPersistTaps="handled"');
    for (const { editable, host } of editableHosts) {
      expect(source(editable), `${editable}: editable control`).toContain('<Input');
      expect(source(host), `${host}: keyboard-aware host`).toContain('keyboardAware');
    }
  });

  it('keeps reduced motion available and state transitions independent of animation completion', () => {
    const animatedFiles = [
      'src/components/access/SuccessSheet.tsx',
      'src/components/family-growth/GardenLandscape.tsx',
      'src/components/r002a/child/ChildCompletionConfirmationSheet.tsx',
      'src/components/r002a/parent/ParentSupportRequestSheet.tsx',
      'src/components/r002a/parent/TaskCreatedSuccessSheet.tsx',
      'src/components/r002a/parent/ParentApprovalSuccessSheet.tsx',
    ];

    for (const path of animatedFiles) {
      expect(source(path), path).toContain('useReducedMotion');
    }
    expect(source('src/components/family-growth/GardenLandscape.tsx')).toContain(
      'reduceMotion: ReduceMotion.System',
    );
    expect(source('src/components/r002a/child/ChildCompletionConfirmationSheet.tsx')).toContain(
      "animationType={reducedMotion ? 'none' : 'fade'}",
    );
    expect(source('src/components/r002a/parent/ParentSupportRequestSheet.tsx')).toContain(
      "animationType={reducedMotion ? 'none' : 'slide'}",
    );

    const transitionSources = [
      source('src/components/access/SuccessSheet.tsx'),
      source('src/components/family-growth/GardenLandscape.tsx'),
      source('src/components/r002a/child/ChildCompletionConfirmationSheet.tsx'),
      source('src/components/r002a/parent/ParentSupportRequestSheet.tsx'),
    ].join('\n');
    expect(transitionSources).not.toMatch(
      /(?:withTiming|withSpring)\([\s\S]{0,600}(?:scheduleOnRN|runOnJS)\((?:onAction|onDismiss|onSubmit|onOpenGarden|onReturnToTasks)/u,
    );
  });
});
