import { existsSync, readFileSync } from 'node:fs';

import { beforeEach, describe, expect, it } from 'vitest';

import { P0_RECYCLING_TEMPLATE, TASK_TEMPLATES } from '../src/features/tasks/demoContent';
import type { PreparedMediaFixture } from '../src/models/familyGrowth';
import { serviceRegistry } from '../src/services';
import { createResetSourceSession } from '../src/services/mock/fixtures';
import type { PrototypeStoreState } from '../src/state/usePrototypeStore';
import { usePrototypeStore } from '../src/state/usePrototypeStore';

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): asserts result is {
  readonly ok: true;
  readonly data: T;
} {
  expect(result.ok).toBe(true);
}

function counters(state: PrototypeStoreState = usePrototypeStore.getState()) {
  return {
    salemSeeds: state.children.child_salem.earnedSeeds,
    mangroveSeeds: state.landscapeProgress.mangrove.cumulativeSeeds,
    mangroveStage: state.landscapeProgress.mangrove.stage,
    canopyLeaves: state.household.combinedCanopy.contributionLeaves,
    circleActions: state.circleGoal.eligibleGreenActions,
  };
}

function setAssignedSalemJourney(): void {
  usePrototypeStore.setState(createResetSourceSession('assigned'));
  usePrototypeStore.getState().setRole('child');
  expectOk(usePrototypeStore.getState().setActiveChild('child_salem'));
}

describe('US2 Child choice, bounded help, and submission flow', () => {
  beforeEach(() => {
    usePrototypeStore.getState().resetPrototype();
    setAssignedSalemJourney();
  });

  it('has the authored Child task route rather than a Feature 002 mission route', () => {
    expect(
      existsSync(new URL('../app/child/task.tsx', import.meta.url)),
      '/child/task must be an authored Feature 003 route',
    ).toBe(true);
  });

  it('shows two display-only approved choices plus exactly one executable Salem choice', () => {
    const pool = usePrototypeStore.getState().choicePool;

    expect(pool.seededPreviewChoices).toHaveLength(2);
    expect(pool.seededPreviewChoices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'choice_preview_hr02_v1',
          childId: 'child_salem',
          demoAvailability: 'display_only',
        }),
        expect.objectContaining({
          id: 'choice_preview_lw01_v1',
          childId: 'child_salem',
          demoAvailability: 'display_only',
        }),
      ]),
    );
    expect(pool.p0AssignmentChoice).toMatchObject({
      id: 'choice_recycling_p0_v1',
      childId: 'child_salem',
      taskTemplateId: 'task_recycling_p0_v1',
      approvalState: 'parent_approved_fixture',
      demoAvailability: 'p0_executable',
    });
    expect(P0_RECYCLING_TEMPLATE).toMatchObject({
      whyItMatters: { ar: expect.any(String), en: expect.any(String) },
      estimatedEffort: { ar: '15–30 دقيقة', en: '15–30 minutes' },
      permittedHelp: { ar: expect.any(String), en: expect.any(String) },
      supervision: { ar: expect.any(String), en: expect.any(String) },
      landscapeId: 'mangrove',
      recognitionMode: 'standard',
      displayedSeedAward: 12,
    });
  });

  it('renders every preview with its mapped landscape and keeps Alya in a bounded empty state', () => {
    const pool = usePrototypeStore.getState().choicePool;
    const templates = new Map(
      [...TASK_TEMPLATES, P0_RECYCLING_TEMPLATE].map((template) => [template.id, template]),
    );
    const salemChoices = [
      ...pool.seededPreviewChoices,
      ...(pool.p0AssignmentChoice ? [pool.p0AssignmentChoice] : []),
    ].filter((choice) => choice.childId === 'child_salem');

    expect(
      salemChoices.map((choice) => ({
        id: choice.id,
        landscapeId: templates.get(choice.taskTemplateId)?.landscapeId,
      })),
    ).toEqual([
      { id: 'choice_preview_hr02_v1', landscapeId: 'samar' },
      { id: 'choice_preview_lw01_v1', landscapeId: 'sidr' },
      { id: 'choice_recycling_p0_v1', landscapeId: 'mangrove' },
    ]);

    const childHomeSource = readFileSync(
      new URL('../app/child/index.tsx', import.meta.url),
      'utf8',
    );
    expect(childHomeSource).toContain('t(LANDSCAPE_LABEL_KEYS[template.landscapeId])');
    expect(childHomeSource).not.toContain("template.landscapeId === 'mangrove'");
    expect(childHomeSource).not.toMatch(/\brank(?:ing)?\b/i);

    expectOk(usePrototypeStore.getState().setActiveChild('child_alya'));
    const alyaChoices = [
      ...pool.seededPreviewChoices,
      ...(pool.p0AssignmentChoice ? [pool.p0AssignmentChoice] : []),
    ].filter((choice) => choice.childId === 'child_alya');
    expect(alyaChoices).toEqual([]);
    expect(usePrototypeStore.getState().journey).toMatchObject({
      lifecycle: 'assigned',
      assignment: { childId: 'child_salem' },
    });
    expect(childHomeSource).toContain('choices.length === 0');
  });

  it('puts current work before compact future previews and derives every Child action from lifecycle', () => {
    const childHomeSource = readFileSync(
      new URL('../app/child/index.tsx', import.meta.url),
      'utf8',
    );

    expect(childHomeSource).toContain("assigned: 'choose'");
    expect(childHomeSource).toContain("chosen: 'start'");
    expect(childHomeSource).toContain("in_progress: 'resume'");
    expect(childHomeSource).toContain("submitted: 'waiting'");
    expect(childHomeSource).toContain("confirmed: 'waiting'");
    expect(childHomeSource).toContain("recognized: 'garden'");
    expect(childHomeSource).toContain('testID="current-assignment"');
    expect(childHomeSource).toContain('testID="preview-only-choices"');
    expect(childHomeSource.indexOf('testID="current-assignment"')).toBeLessThan(
      childHomeSource.indexOf('testID="preview-only-choices"'),
    );
    expect(childHomeSource).toContain('testID="resume-current-task-button"');
    expect(childHomeSource).toContain('testID="current-task-waiting"');
    expect(childHomeSource).toContain('testID="open-recognized-garden-button"');
    expect(childHomeSource).not.toContain(
      "const chosen = executable && journey?.lifecycle === 'chosen';",
    );
  });

  it.each(['in_progress', 'submitted', 'recognized'] as const)(
    'preserves the %s Salem journey when the shared device reselects his profile',
    (lifecycle) => {
      usePrototypeStore.setState(createResetSourceSession(lifecycle));
      usePrototypeStore.getState().setRole('child');
      expectOk(usePrototypeStore.getState().setActiveChild('child_salem'));
      const before = structuredClone(usePrototypeStore.getState().journey);

      expectOk(usePrototypeStore.getState().setActiveChild('child_alya'));
      expectOk(usePrototypeStore.getState().setActiveChild('child_salem'));

      expect(usePrototypeStore.getState().journey).toEqual(before);
      expect(usePrototypeStore.getState().journey).toMatchObject({
        lifecycle,
        task: { id: 'task_recycling_p0_v1' },
        assignment: { childId: 'child_salem' },
      });
    },
  );

  it('rejects the wrong synthetic profile and keeps choose separate from start', () => {
    const baseline = counters();
    expectOk(usePrototypeStore.getState().setActiveChild('child_alya'));
    expect(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1')).toMatchObject({
      ok: false,
      error: { code: 'NOT_ASSIGNED_CHILD' },
    });
    expect(usePrototypeStore.getState().journey?.lifecycle).toBe('assigned');

    expectOk(usePrototypeStore.getState().setActiveChild('child_salem'));
    expectOk(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1'));
    expect(usePrototypeStore.getState().journey).toMatchObject({
      lifecycle: 'chosen',
      task: { version: 1 },
      assignment: { taskVersion: 1, childId: 'child_salem' },
    });
    expect(counters()).toEqual(baseline);

    expectOk(usePrototypeStore.getState().startAssignment());
    expect(usePrototypeStore.getState().journey).toMatchObject({
      lifecycle: 'in_progress',
      task: {
        version: 1,
        content: { definitionOfDone: P0_RECYCLING_TEMPLATE.definitionOfDone },
      },
    });
    expect(counters()).toEqual(baseline);
  });

  it('rejects Parent-role attempts to choose, start, Coach, or submit the Child task', async () => {
    const baseline = counters();
    usePrototypeStore.getState().setRole('parent');
    expect(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState().journey?.lifecycle).toBe('assigned');

    usePrototypeStore.setState(createResetSourceSession('chosen'));
    usePrototypeStore.getState().setRole('parent');
    expect(usePrototypeStore.getState().startAssignment()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState().journey?.lifecycle).toBe('chosen');

    usePrototypeStore.setState(createResetSourceSession('in_progress'));
    usePrototypeStore.getState().setRole('parent');
    expect(
      await usePrototypeStore.getState().requestChildCoach({
        requestId: 'parent-role-coach-attempt',
        intent: 'show_steps',
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(
      usePrototypeStore.getState().submitTask({
        definitionAcknowledged: true,
        completionMode: 'permitted_help',
        helpUsed: null,
        preparedMediaFixtureId: null,
        reflection: null,
        observableFacts: [
          {
            ar: 'فرز سالم المواد النظيفة التي وافق عليها شخص بالغ.',
            en: 'Salem sorted the clean items an adult approved.',
          },
        ],
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(usePrototypeStore.getState().journey?.lifecycle).toBe('in_progress');
    expect(usePrototypeStore.getState().childCoachResult).toBeNull();
    expect(counters()).toEqual(baseline);
  });

  it('records a smaller-task request for Parent review before acceptance without changing progress', () => {
    const baselineCounters = counters();
    const baselineJourney = structuredClone(usePrototypeStore.getState().journey);
    const baselineLedger = structuredClone(usePrototypeStore.getState().recognitionLedger);

    const requested = usePrototypeStore.getState().requestSmallerTask();

    expectOk(requested);
    expect(requested.data).toEqual({
      kind: 'smaller',
      requestedBy: 'child',
      sourceTaskId: 'task_recycling_p0_v1',
      sourceTaskVersion: 1,
      childId: 'child_salem',
      sourceSubmissionId: null,
      status: 'parent_review_required',
      appliesTo: 'future_task_only',
      origin: 'synthetic_local',
    });
    expect(usePrototypeStore.getState().prospectiveTaskAdjustment).toEqual(requested.data);
    expect(usePrototypeStore.getState().journey).toEqual(baselineJourney);
    expect(usePrototypeStore.getState().recognitionLedger).toEqual(baselineLedger);
    expect(counters()).toEqual(baselineCounters);
  });

  it('wires the resolved pre-acceptance proposal to explicit Child accept or keep-current actions', () => {
    const childHomeSource = readFileSync(
      new URL('../app/child/index.tsx', import.meta.url),
      'utf8',
    );
    const parentHomeSource = readFileSync(
      new URL('../app/parent/index.tsx', import.meta.url),
      'utf8',
    );

    expect(childHomeSource).toContain('state.preAcceptanceAdjustment');
    expect(childHomeSource).toContain('state.respondToPreAcceptanceAdjustment');
    expect(childHomeSource).toContain("respondToAdjustment('accept')");
    expect(childHomeSource).toContain("respondToAdjustment('keep_current')");
    expect(childHomeSource).toContain("status === 'child_decision_required'");
    expect(childHomeSource).toContain('pre-acceptance-adjustment-panel');
    expect(childHomeSource).toContain('pre-acceptance-accept-button');
    expect(childHomeSource).toContain('pre-acceptance-keep-button');
    expect(childHomeSource).not.toContain('pre-acceptance-second-choice');

    expect(parentHomeSource).toContain('state.preAcceptanceAdjustment');
    expect(parentHomeSource).toContain('state.resolvePreAcceptanceAdjustment');
    expect(parentHomeSource).toContain("status === 'parent_review_required'");
    expect(parentHomeSource).toContain('pre-acceptance-parent-review');
    expect(parentHomeSource).toContain('resolve-smaller-task-button');
    expect(parentHomeSource).toContain('resolve-safe-equivalent-button');
    expect(parentHomeSource).toContain("setRole('child')");
    expect(parentHomeSource).toContain("router.replace('/child')");
  });

  it('fails closed for Parent, wrong-Child, and already-accepted smaller-task requests', () => {
    const baselineCounters = counters();

    usePrototypeStore.getState().setRole('parent');
    expect(usePrototypeStore.getState().requestSmallerTask()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState().prospectiveTaskAdjustment).toBeNull();

    usePrototypeStore.getState().setRole('child');
    expectOk(usePrototypeStore.getState().setActiveChild('child_alya'));
    expect(usePrototypeStore.getState().requestSmallerTask()).toMatchObject({
      ok: false,
      error: { code: 'NOT_ASSIGNED_CHILD' },
    });
    expect(usePrototypeStore.getState().prospectiveTaskAdjustment).toBeNull();

    expectOk(usePrototypeStore.getState().setActiveChild('child_salem'));
    expectOk(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1'));
    expect(usePrototypeStore.getState().requestSmallerTask()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState().prospectiveTaskAdjustment).toBeNull();
    expect(usePrototypeStore.getState().journey?.lifecycle).toBe('chosen');
    expect(counters()).toEqual(baselineCounters);
  });

  it('rejects stale start, Coach, and submit commands after the active profile changes', async () => {
    const baseline = counters();
    expectOk(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1'));
    expectOk(usePrototypeStore.getState().setActiveChild('child_alya'));

    expect(usePrototypeStore.getState().startAssignment()).toMatchObject({
      ok: false,
      error: { code: 'NOT_ASSIGNED_CHILD' },
    });
    expect(usePrototypeStore.getState().journey?.lifecycle).toBe('chosen');

    expectOk(usePrototypeStore.getState().setActiveChild('child_salem'));
    expectOk(usePrototypeStore.getState().startAssignment());
    expectOk(usePrototypeStore.getState().setActiveChild('child_alya'));

    expect(
      await usePrototypeStore.getState().requestChildCoach({
        requestId: 'us2-wrong-profile-coach',
        intent: 'show_steps',
      }),
    ).toMatchObject({ ok: false, error: { code: 'NOT_ASSIGNED_CHILD' } });
    expect(
      usePrototypeStore.getState().submitTask({
        definitionAcknowledged: true,
        completionMode: 'permitted_help',
        helpUsed: {
          ar: 'فحص شخص بالغ المواد وحمل الكيس وتولى التخلّص منه.',
          en: 'An adult checked the items, carried the bag, and handled disposal.',
        },
        preparedMediaFixtureId: null,
        reflection: null,
        observableFacts: [
          {
            ar: 'فرز سالم المواد النظيفة التي وافق عليها شخص بالغ.',
            en: 'Salem sorted the clean items an adult approved.',
          },
        ],
      }),
    ).toMatchObject({ ok: false, error: { code: 'NOT_ASSIGNED_CHILD' } });
    expect(usePrototypeStore.getState().journey?.lifecycle).toBe('in_progress');
    expect(usePrototypeStore.getState().childCoachResult).toBeNull();
    expect(counters()).toEqual(baseline);
  });

  it('keeps the prepared Coach task/version-bound, allowlisted, disclosed, and adult-exitable', async () => {
    expectOk(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1'));
    expectOk(usePrototypeStore.getState().startAssignment());

    const coach = await usePrototypeStore.getState().requestChildCoach({
      requestId: 'us2-coach-steps',
      intent: 'show_steps',
    });
    expectOk(coach);
    expect(coach.data).toMatchObject({
      taskId: 'task_recycling_p0_v1',
      approvedTaskVersion: 1,
      changesDefinitionOfDone: false,
      steps: [
        { en: expect.stringContaining('adult to pre-check') },
        { en: expect.stringContaining('intact, non-sharp') },
        { en: expect.stringContaining('Stop and ask an adult') },
        { en: expect.stringContaining('wash your hands') },
      ],
      adultExit: {
        label: { ar: 'أحتاج إلى شخص بالغ', en: 'I need an adult' },
        alwaysVisible: true,
      },
      meta: {
        requestId: 'us2-coach-steps',
        audience: 'child',
        origin: 'prepared',
        fixtureId: 'coach_recycling_steps_v1',
        fallbackUsed: false,
        disclosure: { preparedIsExplicit: true, saysAiMayBeWrong: true },
      },
    });

    const adultExit = await usePrototypeStore.getState().requestChildCoach({
      requestId: 'us2-coach-adult',
      intent: 'need_adult',
    });
    expectOk(adultExit);
    expect(adultExit.data.adultExit.alwaysVisible).toBe(true);
    expect(adultExit.data.taskId).toBe(usePrototypeStore.getState().journey?.task.id);
    expect(adultExit.data.approvedTaskVersion).toBe(
      usePrototypeStore.getState().journey?.task.version,
    );
  });

  it('presents the prepared Coach response for the requested intent instead of replaying every field', () => {
    const childTaskSource = readFileSync(new URL('../app/child/task.tsx', import.meta.url), 'utf8');

    expect(childTaskSource).toContain("case 'show_steps'");
    expect(childTaskSource).toContain("case 'simplify_task'");
    expect(childTaskSource).toContain("case 'create_if_then_cue'");
    expect(childTaskSource).toContain("case 'rehearse_reviewed_phrase'");
    expect(childTaskSource).toContain("case 'need_adult'");
    expect(childTaskSource).toContain('coach.steps.slice(0, 2)');
    expect(childTaskSource).toContain('[coach.ifThenCue]');
    expect(childTaskSource).not.toContain('coach.steps.map((step');
  });

  it('keeps the approved definition and four-step safety sequence before progressively disclosed media', () => {
    const childTaskSource = readFileSync(new URL('../app/child/task.tsx', import.meta.url), 'utf8');

    expect(childTaskSource).toContain(
      'const [showDefinitionDetails, setShowDefinitionDetails] = useState(false);',
    );
    expect(childTaskSource).toContain('numberOfLines={showDefinitionDetails ? undefined : 4}');
    expect(childTaskSource).toContain('accessibilityState={{ expanded: showDefinitionDetails }}');
    expect(childTaskSource).toContain('testID="toggle-definition-details-button"');
    expect(childTaskSource).toContain('const [showOptionalMedia, setShowOptionalMedia]');
    expect(childTaskSource).toContain('accessibilityState={{ expanded: showOptionalMedia }}');
    expect(childTaskSource).toContain('testID="toggle-optional-media-button"');
    expect(childTaskSource).toContain('showOptionalMedia ? (');
    expect(childTaskSource).toContain('accessibilityState={{ checked: acknowledged }}');
    expect(childTaskSource.indexOf('testID="child-definition-of-done"')).toBeLessThan(
      childTaskSource.indexOf('testID="child-task-steps"'),
    );
    expect(childTaskSource.indexOf('testID="child-task-steps"')).toBeLessThan(
      childTaskSource.indexOf('testID="toggle-optional-media-button"'),
    );
    expect(childTaskSource).toContain("t('childTask.stepFour')");
  });

  it('fails closed instead of attaching the version-one prepared Coach to an adjusted task', async () => {
    expectOk(usePrototypeStore.getState().requestSmallerTask());
    usePrototypeStore.getState().setRole('parent');
    expectOk(usePrototypeStore.getState().resolvePreAcceptanceAdjustment({ decision: 'smaller' }));
    usePrototypeStore.getState().setRole('child');
    expectOk(usePrototypeStore.getState().respondToPreAcceptanceAdjustment('accept'));
    expectOk(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1'));
    expectOk(usePrototypeStore.getState().startAssignment());

    const coach = await usePrototypeStore.getState().requestChildCoach({
      requestId: 'us2-coach-smaller-v2',
      intent: 'show_steps',
    });

    expect(coach).toMatchObject({
      ok: false,
      error: {
        code: 'INVALID_TRANSITION',
        fallbackAvailable: true,
      },
    });
    expect(usePrototypeStore.getState().childCoachResult).toBeNull();

    const childTaskSource = readFileSync(new URL('../app/child/task.tsx', import.meta.url), 'utf8');
    expect(childTaskSource).toContain('preparedCoachAvailable');
    expect(childTaskSource).toContain("t('childTask.adjustedCoachUnavailable')");
    expect(childTaskSource).toContain('localize(content.positiveAction, locale)');
    expect(childTaskSource).toContain('localize(content.safety.stopAndAskAdult, locale)');
  });

  it('discloses optional prepared media, Parent visibility, no cross-household sharing, removal, and fallback', async () => {
    const fixtures = serviceRegistry.media.listPrepared();
    expect(fixtures).toHaveLength(2);
    for (const fixture of fixtures) {
      expect(fixture).toMatchObject({
        origin: 'prepared',
        synthetic: true,
        optional: true,
        parentVisibilityNotice: { ar: expect.any(String), en: expect.any(String) },
        crossHouseholdSharing: false,
        removeAllowed: true,
        fallbackText: { ar: expect.any(String), en: expect.any(String) },
      });
      expect(fixture.accessibleDescription.ar.trim()).not.toBe('');
      expect(fixture.accessibleDescription.en.trim()).not.toBe('');
    }
    expect(fixtures.find((fixture) => fixture.kind === 'audio')?.transcript).toEqual({
      ar: 'بعد أن يفحص الشخص البالغ المواد، أفرز المواد النظيفة القابلة لإعادة التدوير.',
      en: 'After the adult checks the items, I sort the clean recyclables.',
    });

    const missing = await serviceRegistry.media.getPrepared(
      'missing_prepared_fixture' as PreparedMediaFixture['id'],
    );
    expect(missing).toMatchObject({
      ok: true,
      data: {
        fixture: null,
        available: false,
        fallbackText: { ar: expect.any(String), en: expect.any(String) },
      },
    });
  });

  it('records optional media, removal, fallback, and reflection as resettable task-scoped state', () => {
    const baseline = counters();
    expectOk(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1'));
    expectOk(usePrototypeStore.getState().startAssignment());

    const imageId = 'fixture_recycling_clean_v1' as const;
    const audioId = 'fixture_salem_plan_ar_v1' as const;
    expect(usePrototypeStore.getState().childTaskDraft).toEqual({
      selectedMediaFixtureId: null,
      removedMediaFixtureIds: [],
      unavailableMediaFixtureIds: [],
      reflection: null,
    });

    expectOk(usePrototypeStore.getState().selectPreparedMedia(imageId));
    expect(usePrototypeStore.getState().childTaskDraft).toMatchObject({
      selectedMediaFixtureId: imageId,
      removedMediaFixtureIds: [],
    });

    expectOk(usePrototypeStore.getState().removePreparedMedia(imageId));
    expect(usePrototypeStore.getState().childTaskDraft).toMatchObject({
      selectedMediaFixtureId: null,
      removedMediaFixtureIds: [imageId],
    });

    expectOk(usePrototypeStore.getState().selectPreparedMedia(audioId));
    expectOk(usePrototypeStore.getState().markPreparedMediaUnavailable(audioId));
    expect(usePrototypeStore.getState().childTaskDraft).toMatchObject({
      selectedMediaFixtureId: null,
      unavailableMediaFixtureIds: [audioId],
    });

    expectOk(
      usePrototypeStore.getState().setChildTaskReflection({
        ar: 'طلبت مساعدة عند الشك.',
        en: 'I asked for help when unsure.',
      }),
    );
    expect(usePrototypeStore.getState().childTaskDraft.reflection).toEqual({
      ar: 'طلبت مساعدة عند الشك.',
      en: 'I asked for help when unsure.',
    });
    expect(usePrototypeStore.getState().journey?.lifecycle).toBe('in_progress');
    expect(counters()).toEqual(baseline);
  });

  it('submits with permitted help and no media or reflection while all four counters stay unchanged', () => {
    const baseline = counters();
    expectOk(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1'));
    expectOk(usePrototypeStore.getState().startAssignment());

    const submitted = usePrototypeStore.getState().submitTask({
      definitionAcknowledged: true,
      completionMode: 'permitted_help',
      helpUsed: {
        ar: 'فحص شخص بالغ المواد وحمل الكيس وتولى التخلّص منه.',
        en: 'An adult checked the items, carried the bag, and handled disposal.',
      },
      preparedMediaFixtureId: null,
      reflection: null,
      observableFacts: [
        {
          ar: 'فرز سالم المواد النظيفة التي وافق عليها شخص بالغ.',
          en: 'Salem sorted the clean items an adult approved.',
        },
      ],
    });

    expectOk(submitted);
    expect(submitted.data).toMatchObject({
      lifecycle: 'submitted',
      submission: {
        definitionAcknowledged: true,
        completionMode: 'permitted_help',
        helpUsed: { ar: expect.any(String), en: expect.any(String) },
        preparedMediaFixtureId: null,
        reflection: null,
      },
    });
    expect(counters()).toEqual(baseline);
    expect(usePrototypeStore.getState().recognitionLedger).toEqual({});
  });
});
