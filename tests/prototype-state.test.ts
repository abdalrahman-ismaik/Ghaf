import { beforeEach, describe, expect, it } from 'vitest';

import type { PrototypeSession } from '../src/models/familyGrowth';
import {
  createInitialPrototypeSession,
  createResetSourceSession,
  createSubmittedP0Session,
} from '../src/services/mock/fixtures';
import { usePrototypeStore } from '../src/state/usePrototypeStore';

const RESET_SOURCE_STATES = [
  'draft',
  'assistant_result',
  'assistant_fallback',
  'prepared_media_selected',
  'prepared_media_removed',
  'prepared_image_unavailable',
  'prepared_audio_unavailable',
  'reviewed',
  'assigned',
  'chosen',
  'in_progress',
  'submitted',
  'retry',
  'confirmed',
  'recognized',
  'celebration_available',
  'celebration_consumed',
  'garden',
  'circle',
] as const;

function sessionSnapshot(state = usePrototypeStore.getState()): PrototypeSession {
  return {
    schemaVersion: state.schemaVersion,
    locale: state.locale,
    direction: state.direction,
    role: state.role,
    household: state.household,
    children: state.children,
    activeChildId: state.activeChildId,
    choicePool: state.choicePool,
    activeAssignmentId: state.activeAssignmentId,
    journey: state.journey,
    landscapeProgress: state.landscapeProgress,
    circleGoal: state.circleGoal,
    recognitionLedger: state.recognitionLedger,
    preparedParentGuideFixtureId: state.preparedParentGuideFixtureId,
    preparedChildCoachFixtureId: state.preparedChildCoachFixtureId,
    preparedImageFixtureId: state.preparedImageFixtureId,
    preparedAudioFixtureId: state.preparedAudioFixtureId,
    assistantMode: state.assistantMode,
    celebration: state.celebration,
  };
}

function counters(state = usePrototypeStore.getState()) {
  return {
    salemSeeds: state.children.child_salem.earnedSeeds,
    mangroveSeeds: state.landscapeProgress.mangrove.cumulativeSeeds,
    mangroveStage: state.landscapeProgress.mangrove.stage,
    mangroveNextThreshold: state.landscapeProgress.mangrove.nextThreshold,
    canopyLeaves: state.household.combinedCanopy.contributionLeaves,
    circleActions: state.circleGoal.eligibleGreenActions,
  };
}

function expectCanonicalResetState(): void {
  const state = usePrototypeStore.getState();

  expect(sessionSnapshot(state)).toEqual(createInitialPrototypeSession());
  expect(state).toMatchObject({
    schemaVersion: 3,
    locale: 'ar',
    direction: 'rtl',
    role: 'parent',
    household: {
      id: 'household_al_noor',
      origin: 'synthetic',
      childIds: ['child_salem', 'child_alya'],
      combinedCanopy: { contributionLeaves: 19, goalLeaves: 25 },
    },
    children: {
      child_salem: {
        id: 'child_salem',
        age: 9,
        ageBand: '9_11',
        origin: 'synthetic',
        earnedSeeds: 48,
      },
      child_alya: {
        id: 'child_alya',
        age: 11,
        ageBand: '9_11',
        origin: 'synthetic',
        earnedSeeds: 36,
      },
    },
    activeChildId: 'child_salem',
    choicePool: {
      seededPreviewChoices: [
        {
          id: 'choice_preview_hr02_v1',
          demoAvailability: 'display_only',
          origin: 'prepared',
        },
        {
          id: 'choice_preview_lw01_v1',
          demoAvailability: 'display_only',
          origin: 'prepared',
        },
      ],
      p0AssignmentChoice: null,
    },
    activeAssignmentId: null,
    journey: null,
    landscapeProgress: {
      mangrove: {
        landscapeId: 'mangrove',
        cumulativeSeeds: 48,
        stage: 'shoot',
        nextThreshold: 60,
      },
    },
    circleGoal: {
      eligibleGreenActions: 11,
      goal: 12,
      origin: 'synthetic_local',
    },
    recognitionLedger: {},
    preparedParentGuideFixtureId: 'guide_recycling_refine_v1',
    preparedChildCoachFixtureId: 'coach_recycling_steps_v1',
    preparedImageFixtureId: 'fixture_recycling_clean_v1',
    preparedAudioFixtureId: 'fixture_salem_plan_ar_v1',
    assistantMode: 'deterministic_prepared',
    celebration: { available: false, consumed: false },
    parentGuideSuggestion: null,
    childCoachResult: null,
    confirmationPlan: null,
    lastRecognitionAttempt: null,
    prospectiveTaskAdjustment: null,
    childTaskDraft: {
      selectedMediaFixtureId: null,
      removedMediaFixtureIds: [],
      unavailableMediaFixtureIds: [],
      reflection: null,
    },
  });
  expect(Object.keys(state.landscapeProgress).sort()).toEqual([
    'date_palm',
    'ghaf',
    'mangrove',
    'samar',
    'sidr',
  ]);
  expect(counters(state)).toEqual({
    salemSeeds: 48,
    mangroveSeeds: 48,
    mangroveStage: 'shoot',
    mangroveNextThreshold: 60,
    canopyLeaves: 19,
    circleActions: 11,
  });

  for (const forbiddenRouterField of ['route', 'currentRoute', 'history', 'navigationState']) {
    expect(state).not.toHaveProperty(forbiddenRouterField);
  }
}

describe('schema-3 Prototype Session reset', () => {
  beforeEach(() => {
    usePrototypeStore.getState().resetPrototype();
  });

  it('starts from the exact Arabic Parent/Salem canonical fixture', () => {
    expectCanonicalResetState();
  });

  it.each(RESET_SOURCE_STATES)('atomically resets from %s', (source) => {
    const sourceSession = createResetSourceSession(source);
    expect(sourceSession).not.toEqual(createInitialPrototypeSession());
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      usePrototypeStore.setState(createResetSourceSession(source));

      if (source === 'assistant_result') {
        expect(usePrototypeStore.getState().parentGuideSuggestion).toMatchObject({
          meta: { fixtureId: 'guide_recycling_refine_v1', fallbackUsed: false },
        });
      } else if (source === 'assistant_fallback') {
        expect(usePrototypeStore.getState().parentGuideSuggestion).toMatchObject({
          meta: { fixtureId: 'guide_recycling_refine_v1', fallbackUsed: true },
        });
      } else if (source === 'prepared_media_selected') {
        expect(usePrototypeStore.getState().childTaskDraft.selectedMediaFixtureId).toBe(
          'fixture_recycling_clean_v1',
        );
      } else if (source === 'prepared_media_removed') {
        expect(usePrototypeStore.getState().childTaskDraft.removedMediaFixtureIds).toEqual([
          'fixture_recycling_clean_v1',
        ]);
      } else if (source === 'prepared_image_unavailable') {
        expect(usePrototypeStore.getState().childTaskDraft.unavailableMediaFixtureIds).toEqual([
          'fixture_recycling_clean_v1',
        ]);
      } else if (source === 'prepared_audio_unavailable') {
        expect(usePrototypeStore.getState().childTaskDraft.unavailableMediaFixtureIds).toEqual([
          'fixture_salem_plan_ar_v1',
        ]);
      }

      const beforeRoleSwitch = counters();
      if (usePrototypeStore.getState().role === 'child') {
        usePrototypeStore.getState().setRole('parent');
        expect(counters()).toEqual(beforeRoleSwitch);
      }

      const emissions: PrototypeSession[] = [];
      const unsubscribe = usePrototypeStore.subscribe((state) =>
        emissions.push(sessionSnapshot(state)),
      );
      const result = usePrototypeStore.getState().resetPrototype();
      unsubscribe();

      expect(result, `reset attempt ${attempt}`).toMatchObject({
        ok: true,
        data: { navigateTo: '/', replaceHistory: true },
      });
      expect(emissions, `reset attempt ${attempt}`).toHaveLength(1);
      expect(emissions[0], `reset attempt ${attempt}`).toEqual(createInitialPrototypeSession());
      expectCanonicalResetState();
    }
  });

  it('exposes no command that can partially set one recognition counter', () => {
    const state = usePrototypeStore.getState() as unknown as Record<string, unknown>;
    for (const forbiddenCommand of [
      'setSalemSeeds',
      'setEarnedSeeds',
      'setMangroveProgress',
      'setLandscapeSeeds',
      'setCanopyLeaves',
      'setCircleActions',
      'incrementCanopy',
      'incrementCircle',
    ]) {
      expect(state[forbiddenCommand], forbiddenCommand).toBeUndefined();
    }
  });
});

describe('atomic praise-first recognition', () => {
  beforeEach(() => {
    usePrototypeStore.getState().resetPrototype();
    usePrototypeStore.setState(createSubmittedP0Session());
  });

  it('keeps all counters unchanged through confirmation planning and praise presentation', () => {
    const baseline = counters();
    const planned = usePrototypeStore.getState().planConfirmation({
      submissionId: 'submission_recycling_p0_v1_attempt_1',
      praise: {
        ar: 'لقد فرزت المواد النظيفة وسألت شخصاً بالغاً قبل المتابعة.',
        en: 'You sorted the clean items and asked an adult before continuing.',
      },
      neutralObservation: null,
      uncertainty: null,
    });

    expect(planned).toMatchObject({
      ok: true,
      data: {
        disposition: 'pending_praise',
        plan: {
          recognitionKey: 'recognition:submission_recycling_p0_v1_attempt_1',
          renderState: 'confirmation_pending',
        },
      },
    });
    expect(counters()).toEqual(baseline);
    expect(usePrototypeStore.getState().recognitionLedger).toEqual({});

    const presented = usePrototypeStore.getState().markPraisePresented({
      actionId: 'parent-praise-press-1',
      source: 'parent_press',
      presentedAt: '2026-08-26T10:00:00.000Z',
    });
    expect(presented).toMatchObject({
      ok: true,
      data: {
        renderState: 'praise_presented',
        presentationActionId: 'parent-praise-press-1',
        checkIn: { confirmationPresentation: 'praise_presented' },
      },
    });
    expect(usePrototypeStore.getState().journey).toMatchObject({
      lifecycle: 'confirmed',
      checkIn: { confirmationPresentation: 'praise_presented' },
    });
    expect(counters()).toEqual(baseline);
    expect(usePrototypeStore.getState().recognitionLedger).toEqual({});
  });

  it('rejects same-action recognition without a partial write', () => {
    const baseline = counters();
    usePrototypeStore.getState().planConfirmation({
      submissionId: 'submission_recycling_p0_v1_attempt_1',
      praise: {
        ar: 'لقد فرزت المواد النظيفة وسألت شخصاً بالغاً قبل المتابعة.',
        en: 'You sorted the clean items and asked an adult before continuing.',
      },
      neutralObservation: null,
      uncertainty: null,
    });
    usePrototypeStore.getState().markPraisePresented({
      actionId: 'same-action',
      source: 'parent_press',
      presentedAt: '2026-08-26T10:00:00.000Z',
    });

    expect(
      usePrototypeStore.getState().applyRecognition({
        actionId: 'same-action',
        source: 'parent_press',
        observedRenderState: 'praise_presented',
        presentationActionId: 'same-action',
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(counters()).toEqual(baseline);
    expect(usePrototypeStore.getState().recognitionLedger).toEqual({});
  });

  it('commits exactly the four P0 counters once and returns one immutable receipt five times', () => {
    const unchangedIdentity = {
      locale: usePrototypeStore.getState().locale,
      role: usePrototypeStore.getState().role,
      activeChildId: usePrototypeStore.getState().activeChildId,
      fixtureIds: [
        usePrototypeStore.getState().preparedParentGuideFixtureId,
        usePrototypeStore.getState().preparedChildCoachFixtureId,
        usePrototypeStore.getState().preparedImageFixtureId,
        usePrototypeStore.getState().preparedAudioFixtureId,
      ],
    };
    usePrototypeStore.getState().planConfirmation({
      submissionId: 'submission_recycling_p0_v1_attempt_1',
      praise: {
        ar: 'لقد فرزت المواد النظيفة وسألت شخصاً بالغاً قبل المتابعة.',
        en: 'You sorted the clean items and asked an adult before continuing.',
      },
      neutralObservation: null,
      uncertainty: null,
    });
    usePrototypeStore.getState().markPraisePresented({
      actionId: 'parent-praise-press-1',
      source: 'parent_press',
      presentedAt: '2026-08-26T10:00:00.000Z',
    });

    const first = usePrototypeStore.getState().applyRecognition({
      actionId: 'parent-recognition-press-1',
      source: 'parent_press',
      observedRenderState: 'praise_presented',
      presentationActionId: 'parent-praise-press-1',
    });
    expect(first).toMatchObject({
      ok: true,
      data: {
        disposition: 'applied',
        journey: { lifecycle: 'recognized' },
        receipt: {
          recognitionKey: 'recognition:submission_recycling_p0_v1_attempt_1',
          seedTransaction: {
            amount: 12,
            balanceBefore: 48,
            balanceAfter: 60,
            meaning: 'symbolic_nonfinancial',
          },
          landscapeGrowth: {
            landscapeId: 'mangrove',
            seedsBefore: 48,
            seedsAfter: 60,
            stageBefore: 'shoot',
            stageAfter: 'sapling',
            crossedThreshold: 60,
            symbolicOnly: true,
          },
          canopyContribution: { actionKind: 'eligible_household_acquisition', leafDelta: 1 },
          circleEvent: { actionKind: 'eligible_green_action', actionDelta: 1 },
        },
      },
    });
    if (!first.ok) throw new Error('Expected first recognition to succeed');
    expect(first.data.receipt).not.toHaveProperty('alreadyApplied');
    expect(counters()).toEqual({
      salemSeeds: 60,
      mangroveSeeds: 60,
      mangroveStage: 'sapling',
      mangroveNextThreshold: 120,
      canopyLeaves: 20,
      circleActions: 12,
    });
    expect(usePrototypeStore.getState().celebration).toEqual({
      available: true,
      consumed: false,
    });
    expect({
      locale: usePrototypeStore.getState().locale,
      role: usePrototypeStore.getState().role,
      activeChildId: usePrototypeStore.getState().activeChildId,
      fixtureIds: [
        usePrototypeStore.getState().preparedParentGuideFixtureId,
        usePrototypeStore.getState().preparedChildCoachFixtureId,
        usePrototypeStore.getState().preparedImageFixtureId,
        usePrototypeStore.getState().preparedAudioFixtureId,
      ],
    }).toEqual(unchangedIdentity);

    const postFirstCounters = counters();
    const storedReceipt = structuredClone(first.data.receipt);
    const postFirstCelebration = structuredClone(usePrototypeStore.getState().celebration);
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const duplicate = usePrototypeStore.getState().applyRecognition({
        actionId: `duplicate-parent-press-${attempt}`,
        source: 'parent_press',
        observedRenderState: 'praise_presented',
        presentationActionId: 'parent-praise-press-1',
      });
      expect(duplicate).toMatchObject({
        ok: true,
        data: {
          disposition: 'already_confirmed',
          receipt: storedReceipt,
          message: { ar: expect.any(String), en: expect.any(String) },
        },
      });
      expect(counters()).toEqual(postFirstCounters);
      expect(usePrototypeStore.getState().celebration).toEqual(postFirstCelebration);
      expect(
        usePrototypeStore.getState().recognitionLedger[
          'recognition:submission_recycling_p0_v1_attempt_1'
        ],
      ).toEqual(storedReceipt);
    }
  });
});
