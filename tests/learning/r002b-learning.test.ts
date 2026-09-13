import { describe, expect, it } from 'vitest';

import type {
  LearningOrigin,
  LearningRoute,
  MangroveLearningState,
} from '../../src/models/learning';
import {
  MANGROVE_ROOTS_LEARNING_PACKAGE,
  advanceMangroveLearningStep,
  completeMangroveLearning,
  createMangroveLearningState,
  createMangroveReturnIntent,
  restoreMangroveLearningState,
  startMangroveLearningRoute,
  submitMangroveLearningCheck,
} from '../../src/features/learning/mangroveLearning';

const PROFILE_ID = 'child_salem';
const OTHER_PROFILE_ID = 'child_alya';
const EPOCH_ID = 'reset-epoch-001';
const OTHER_EPOCH_ID = 'reset-epoch-002';
const COMPLETED_AT = '2026-09-05T12:00:00.000Z';

const IMPACT_PATH_ORIGIN: LearningOrigin = {
  kind: 'impact_path',
  route: '/garden/impact-path',
  profileId: PROFILE_ID,
  focusTargetId: 'impact-path-learning-station-132',
  scrollOffset: 544,
};

const TODAY_COMPLETE_ORIGIN: LearningOrigin = {
  kind: 'today_complete',
  route: '/child',
  profileId: PROFILE_ID,
  focusTargetId: 'today-complete-heading',
  scrollOffset: 0,
};

const BADGE_DETAIL_ORIGIN: LearningOrigin = {
  kind: 'badge_detail',
  route: '/garden/badges/[badgeId]',
  profileId: PROFILE_ID,
  badgeId: 'badge.habitat.mangrove_care.v1',
  filter: 'in_progress',
  focusTargetId: 'r002b-badge-detail-learning-action',
  galleryScrollOffset: 188,
  scrollOffset: 312,
};

const UNLOCK_EVIDENCE = {
  profileId: PROFILE_ID,
  profileEpochId: EPOCH_ID,
  source: 'canonical_impact_path_projection',
  reachedThresholds: [120, 132],
} as const;

function expectOk<T>(result: {
  readonly ok: boolean;
  readonly data?: T;
}): asserts result is { readonly ok: true; readonly data: T } {
  expect(result.ok).toBe(true);
}

function emptyState(profileId = PROFILE_ID, profileEpochId = EPOCH_ID): MangroveLearningState {
  const result = createMangroveLearningState({ profileId, profileEpochId });
  expectOk(result);
  return result.data;
}

function startedState(
  route: LearningRoute,
  origin: LearningOrigin = IMPACT_PATH_ORIGIN,
): MangroveLearningState {
  const result = startMangroveLearningRoute({
    state: emptyState(),
    profileId: PROFILE_ID,
    profileEpochId: EPOCH_ID,
    route,
    origin,
    unlockEvidence: UNLOCK_EVIDENCE,
  });
  expectOk(result);
  return result.data.state;
}

function visitAllContent(
  state: MangroveLearningState,
  route: LearningRoute,
): MangroveLearningState {
  let current = state;
  for (const stepId of MANGROVE_ROOTS_LEARNING_PACKAGE.routes[route].contentStepIds) {
    const result = advanceMangroveLearningStep({
      state: current,
      profileId: PROFILE_ID,
      profileEpochId: EPOCH_ID,
      route,
      stepId,
    });
    expectOk(result);
    current = result.data.state;
  }
  return current;
}

function readyState(route: LearningRoute): MangroveLearningState {
  const contentComplete = visitAllContent(startedState(route), route);
  const result = submitMangroveLearningCheck({
    state: contentComplete,
    profileId: PROFILE_ID,
    profileEpochId: EPOCH_ID,
    route,
    optionId: 'habitat_support_and_care',
  });
  expectOk(result);
  return result.data.state;
}

describe('R002b Mangrove learning package authority', () => {
  it('defines exactly one finite bilingual package with equal-credit Story and accessible routes', () => {
    expect(MANGROVE_ROOTS_LEARNING_PACKAGE).toMatchObject({
      id: 'learning.mangrove_roots.v1',
      title: {
        ar: 'بين جذور القرم',
        en: 'Among the Mangrove Roots',
      },
      unlockThreshold: 132,
      reviewedLearningObjectiveId: 'objective.mangrove_habitat_stewardship.v1',
      completionCreditId: 'learning.mangrove_roots.v1',
      finite: true,
      noFail: true,
      autoplayNextLearning: false,
      routes: {
        story: {
          packageId: 'learning.mangrove_roots.v1',
          route: 'story',
          routePath: '/garden/learn/learning.mangrove_roots.v1/story',
          reviewedLearningObjectiveId: 'objective.mangrove_habitat_stewardship.v1',
          completionCreditId: 'learning.mangrove_roots.v1',
        },
        accessible: {
          packageId: 'learning.mangrove_roots.v1',
          route: 'accessible',
          routePath: '/garden/learn/learning.mangrove_roots.v1/accessible',
          reviewedLearningObjectiveId: 'objective.mangrove_habitat_stewardship.v1',
          completionCreditId: 'learning.mangrove_roots.v1',
        },
      },
    });

    expect(MANGROVE_ROOTS_LEARNING_PACKAGE.routes.story.contentStepIds.length).toBeGreaterThan(0);
    expect(MANGROVE_ROOTS_LEARNING_PACKAGE.routes.accessible.contentStepIds.length).toBeGreaterThan(
      0,
    );
    expect(MANGROVE_ROOTS_LEARNING_PACKAGE.routes.story.contentStepIds).not.toEqual(
      MANGROVE_ROOTS_LEARNING_PACKAGE.routes.accessible.contentStepIds,
    );
    expect(MANGROVE_ROOTS_LEARNING_PACKAGE.routes.story.checkId).toBe(
      MANGROVE_ROOTS_LEARNING_PACKAGE.routes.accessible.checkId,
    );
  });

  it('keeps unapproved live copy, provenance, and every named human review gate explicit', () => {
    expect(MANGROVE_ROOTS_LEARNING_PACKAGE.content).toEqual({
      status: 'blocked_pending_named_human_review',
      ar: null,
      en: null,
      bilingualParity: 'not_run',
    });
    expect(MANGROVE_ROOTS_LEARNING_PACKAGE.provenance).toEqual({
      packageAuthority: 'docs/content/LEARNING_STORIES.md',
      candidateResearchLocation:
        '96cad3b917f43adad32c491153be54d3ab24f899:docs/GHAF_GROWTH_JOURNEY_PROMPT_PACK/report-source.md#E2',
      candidateResearchStatus: 'not_revalidated',
      externalRuntimeDependency: false,
    });
    expect(MANGROVE_ROOTS_LEARNING_PACKAGE.reviewGates).toEqual([
      {
        id: 'source_link_and_mutable_fact_revalidation',
        status: 'not_run',
        releaseEffect: 'blocks_release_activation',
        evidence: null,
      },
      {
        id: 'arabic_english_factual_equivalence',
        status: 'not_run',
        releaseEffect: 'blocks_release_activation',
        evidence: null,
      },
      {
        id: 'uae_cultural_and_place_wording',
        status: 'not_run',
        releaseEffect: 'blocks_release_activation',
        evidence: null,
      },
      {
        id: 'child_safeguarding_and_age_comprehension',
        status: 'not_run',
        releaseEffect: 'blocks_release_activation',
        evidence: null,
      },
      {
        id: 'accessible_equal_credit_equivalence',
        status: 'not_run',
        releaseEffect: 'blocks_release_activation',
        evidence: null,
      },
      {
        id: 'original_illustration_and_rights',
        status: 'not_run',
        releaseEffect: 'blocks_release_activation',
        evidence: null,
      },
    ]);
    expect(MANGROVE_ROOTS_LEARNING_PACKAGE.release).toEqual({
      featureFlag: 'r002b_learning_ui',
      defaultEnabled: false,
      implementation: 'authorized',
      activation: 'blocked',
    });
  });

  it('is deeply immutable and declares no network, media, visit-proof, or live-AI capability', () => {
    expect(MANGROVE_ROOTS_LEARNING_PACKAGE.capabilities).toEqual({
      offline: true,
      requiresGps: false,
      requiresVisitProof: false,
      requiresCamera: false,
      requiresMicrophone: false,
      opensExternalBrowser: false,
      generatedFacts: false,
      liveAi: false,
    });
    expect(Object.isFrozen(MANGROVE_ROOTS_LEARNING_PACKAGE)).toBe(true);
    expect(Object.isFrozen(MANGROVE_ROOTS_LEARNING_PACKAGE.title)).toBe(true);
    expect(Object.isFrozen(MANGROVE_ROOTS_LEARNING_PACKAGE.routes)).toBe(true);
    expect(Object.isFrozen(MANGROVE_ROOTS_LEARNING_PACKAGE.routes.story)).toBe(true);
    expect(Object.isFrozen(MANGROVE_ROOTS_LEARNING_PACKAGE.routes.story.contentStepIds)).toBe(true);
    expect(Object.isFrozen(MANGROVE_ROOTS_LEARNING_PACKAGE.reviewGates)).toBe(true);
    expect(MANGROVE_ROOTS_LEARNING_PACKAGE.reviewGates.every((gate) => Object.isFrozen(gate))).toBe(
      true,
    );
  });
});

describe('R002b finite learning progress and interruption recovery', () => {
  it('starts only in the requested route and records one safe immutable origin', () => {
    const base = emptyState();
    const result = startMangroveLearningRoute({
      state: base,
      profileId: PROFILE_ID,
      profileEpochId: EPOCH_ID,
      route: 'story',
      origin: IMPACT_PATH_ORIGIN,
      unlockEvidence: UNLOCK_EVIDENCE,
    });
    expectOk(result);

    expect(base.origin).toBeNull();
    expect(base.routeProgress.story.lifecycle).toBe('not_started');
    expect(result.data.disposition).toBe('started');
    expect(result.data.state.origin).toEqual(IMPACT_PATH_ORIGIN);
    expect(result.data.state.routeProgress.story.lifecycle).toBe('in_progress');
    expect(result.data.state.routeProgress.accessible.lifecycle).toBe('not_started');
    expect(result.data.state.completion).toBeNull();
  });

  it('requires exact profile-scoped canonical station-132 evidence before either route starts', () => {
    const state = emptyState();
    expect(
      startMangroveLearningRoute({
        state,
        profileId: PROFILE_ID,
        profileEpochId: EPOCH_ID,
        route: 'story',
        origin: IMPACT_PATH_ORIGIN,
      }),
    ).toMatchObject({ ok: false, error: { code: 'NOT_UNLOCKED' } });
    expect(
      startMangroveLearningRoute({
        state,
        profileId: PROFILE_ID,
        profileEpochId: EPOCH_ID,
        route: 'accessible',
        origin: IMPACT_PATH_ORIGIN,
        unlockEvidence: { ...UNLOCK_EVIDENCE, reachedThresholds: [120] },
      }),
    ).toMatchObject({ ok: false, error: { code: 'NOT_UNLOCKED' } });
    expect(
      startMangroveLearningRoute({
        state,
        profileId: PROFILE_ID,
        profileEpochId: EPOCH_ID,
        route: 'accessible',
        origin: IMPACT_PATH_ORIGIN,
        unlockEvidence: { ...UNLOCK_EVIDENCE, reachedThresholds: [132] },
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(
      startMangroveLearningRoute({
        state,
        profileId: PROFILE_ID,
        profileEpochId: EPOCH_ID,
        route: 'accessible',
        origin: IMPACT_PATH_ORIGIN,
        unlockEvidence: { ...UNLOCK_EVIDENCE, profileId: OTHER_PROFILE_ID },
      }),
    ).toMatchObject({ ok: false, error: { code: 'PROFILE_SCOPE_MISMATCH' } });

    const started = startedState('accessible');
    expect(started.unlockEvidence).toEqual(UNLOCK_EVIDENCE);
    expect(Object.isFrozen(started.unlockEvidence)).toBe(true);
    expect(Object.isFrozen(started.unlockEvidence?.reachedThresholds)).toBe(true);
  });

  it('advances in canonical order, makes duplicate delivery neutral, and cannot skip content', () => {
    const started = startedState('story');
    const [firstStep, secondStep] = MANGROVE_ROOTS_LEARNING_PACKAGE.routes.story.contentStepIds;
    expect(firstStep).toBeDefined();
    expect(secondStep).toBeDefined();

    const first = advanceMangroveLearningStep({
      state: started,
      profileId: PROFILE_ID,
      profileEpochId: EPOCH_ID,
      route: 'story',
      stepId: firstStep,
    });
    expectOk(first);
    expect(first.data.disposition).toBe('recorded');
    expect(first.data.state.routeProgress.story.completedContentStepIds).toEqual([firstStep]);

    const duplicate = advanceMangroveLearningStep({
      state: first.data.state,
      profileId: PROFILE_ID,
      profileEpochId: EPOCH_ID,
      route: 'story',
      stepId: firstStep,
    });
    expectOk(duplicate);
    expect(duplicate.data.disposition).toBe('already_recorded');
    expect(duplicate.data.state).toEqual(first.data.state);

    expect(
      advanceMangroveLearningStep({
        state: started,
        profileId: PROFILE_ID,
        profileEpochId: EPOCH_ID,
        route: 'story',
        stepId: secondStep,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_STEP_ORDER' } });
  });

  it('restores immutable partial progress and resumes at the exact next boundary', () => {
    const started = startedState('accessible');
    const firstStep = MANGROVE_ROOTS_LEARNING_PACKAGE.routes.accessible.contentStepIds[0];
    expect(firstStep).toBeDefined();
    const advanced = advanceMangroveLearningStep({
      state: started,
      profileId: PROFILE_ID,
      profileEpochId: EPOCH_ID,
      route: 'accessible',
      stepId: firstStep,
    });
    expectOk(advanced);

    const serialized = structuredClone(advanced.data.state);
    const restored = restoreMangroveLearningState(serialized);
    expectOk(restored);
    const resumed = startMangroveLearningRoute({
      state: restored.data,
      profileId: PROFILE_ID,
      profileEpochId: EPOCH_ID,
      route: 'accessible',
      origin: IMPACT_PATH_ORIGIN,
    });
    expectOk(resumed);

    expect(resumed.data.disposition).toBe('resumed');
    expect(resumed.data.state.routeProgress.accessible.completedContentStepIds).toEqual([
      firstStep,
    ]);
    expect(Object.isFrozen(restored.data)).toBe(true);
    expect(Object.isFrozen(restored.data.routeProgress)).toBe(true);
    expect(Object.isFrozen(restored.data.routeProgress.accessible)).toBe(true);
    expect(Object.isFrozen(restored.data.routeProgress.accessible.completedContentStepIds)).toBe(
      true,
    );
  });

  it('rejects stale mutations from a route that is no longer active', () => {
    const storyAwaitingCheck = visitAllContent(startedState('story'), 'story');
    const switched = startMangroveLearningRoute({
      state: storyAwaitingCheck,
      profileId: PROFILE_ID,
      profileEpochId: EPOCH_ID,
      route: 'accessible',
      origin: IMPACT_PATH_ORIGIN,
    });
    expectOk(switched);

    expect(
      submitMangroveLearningCheck({
        state: switched.data.state,
        profileId: PROFILE_ID,
        profileEpochId: EPOCH_ID,
        route: 'story',
        optionId: 'habitat_support_and_care',
      }),
    ).toMatchObject({ ok: false, error: { code: 'INACTIVE_ROUTE' } });

    const storyReady = readyState('story');
    const switchedAfterCheck = startMangroveLearningRoute({
      state: storyReady,
      profileId: PROFILE_ID,
      profileEpochId: EPOCH_ID,
      route: 'accessible',
      origin: IMPACT_PATH_ORIGIN,
    });
    expectOk(switchedAfterCheck);
    expect(
      completeMangroveLearning({
        state: switchedAfterCheck.data.state,
        profileId: PROFILE_ID,
        profileEpochId: EPOCH_ID,
        route: 'story',
        completedAt: COMPLETED_AT,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INACTIVE_ROUTE' } });

    const storyPartial = startedState('story');
    const firstStoryStep = MANGROVE_ROOTS_LEARNING_PACKAGE.routes.story.contentStepIds[0];
    const secondStoryStep = MANGROVE_ROOTS_LEARNING_PACKAGE.routes.story.contentStepIds[1];
    expect(firstStoryStep).toBeDefined();
    expect(secondStoryStep).toBeDefined();
    const firstRecorded = advanceMangroveLearningStep({
      state: storyPartial,
      profileId: PROFILE_ID,
      profileEpochId: EPOCH_ID,
      route: 'story',
      stepId: firstStoryStep,
    });
    expectOk(firstRecorded);
    const switchedMidContent = startMangroveLearningRoute({
      state: firstRecorded.data.state,
      profileId: PROFILE_ID,
      profileEpochId: EPOCH_ID,
      route: 'accessible',
      origin: IMPACT_PATH_ORIGIN,
    });
    expectOk(switchedMidContent);
    expect(
      advanceMangroveLearningStep({
        state: switchedMidContent.data.state,
        profileId: PROFILE_ID,
        profileEpochId: EPOCH_ID,
        route: 'story',
        stepId: secondStoryStep,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INACTIVE_ROUTE' } });
  });

  it('uses a retryable no-fail check and preserves all completed content after a wrong answer', () => {
    const contentComplete = visitAllContent(startedState('story'), 'story');
    const beforeSteps = contentComplete.routeProgress.story.completedContentStepIds;
    const retry = submitMangroveLearningCheck({
      state: contentComplete,
      profileId: PROFILE_ID,
      profileEpochId: EPOCH_ID,
      route: 'story',
      optionId: 'visit_or_task_reward',
    });
    expectOk(retry);

    expect(retry.data.disposition).toBe('retry_available');
    expect(retry.data.state.routeProgress.story.lifecycle).toBe('awaiting_check');
    expect(retry.data.state.routeProgress.story.checkAttempts).toBe(1);
    expect(retry.data.state.routeProgress.story.checkSatisfied).toBe(false);
    expect(retry.data.state.routeProgress.story.completedContentStepIds).toEqual(beforeSteps);
    expect(retry.data.state.completion).toBeNull();

    const understood = submitMangroveLearningCheck({
      state: retry.data.state,
      profileId: PROFILE_ID,
      profileEpochId: EPOCH_ID,
      route: 'story',
      optionId: 'habitat_support_and_care',
    });
    expectOk(understood);
    expect(understood.data.disposition).toBe('ready_to_complete');
    expect(understood.data.state.routeProgress.story.lifecycle).toBe('ready_to_complete');
    expect(understood.data.state.routeProgress.story.checkAttempts).toBe(2);
    expect(understood.data.state.routeProgress.story.checkSatisfied).toBe(true);
  });

  it('requires every content step, the no-fail check, and one explicit completion command', () => {
    const merelyOpened = startedState('story');
    expect(merelyOpened.completion).toBeNull();
    expect(
      completeMangroveLearning({
        state: merelyOpened,
        profileId: PROFILE_ID,
        profileEpochId: EPOCH_ID,
        route: 'story',
        completedAt: COMPLETED_AT,
      }),
    ).toMatchObject({ ok: false, error: { code: 'NOT_READY_TO_COMPLETE' } });

    const contentComplete = visitAllContent(merelyOpened, 'story');
    expect(contentComplete.completion).toBeNull();
    expect(
      completeMangroveLearning({
        state: contentComplete,
        profileId: PROFILE_ID,
        profileEpochId: EPOCH_ID,
        route: 'story',
        completedAt: COMPLETED_AT,
      }),
    ).toMatchObject({ ok: false, error: { code: 'NOT_READY_TO_COMPLETE' } });

    const ready = readyState('story');
    expect(ready.completion).toBeNull();
  });
});

describe('R002b equal-credit completion', () => {
  it.each(['story', 'accessible'] as const)(
    'commits the same zero-reward package credit through the %s route',
    (route) => {
      const ready = readyState(route);
      const result = completeMangroveLearning({
        state: ready,
        profileId: PROFILE_ID,
        profileEpochId: EPOCH_ID,
        route,
        completedAt: COMPLETED_AT,
      });
      expectOk(result);

      expect(result.data.disposition).toBe('completed');
      expect(result.data.event).toEqual({
        id: `learning-completion:${PROFILE_ID}:${EPOCH_ID}:learning.mangrove_roots.v1`,
        triggerEventId: `learning-completion:${PROFILE_ID}:${EPOCH_ID}:learning.mangrove_roots.v1`,
        profileId: PROFILE_ID,
        profileEpochId: EPOCH_ID,
        learningId: 'learning.mangrove_roots.v1',
        route,
        status: 'committed',
        completedAt: COMPLETED_AT,
        completionCreditId: 'learning.mangrove_roots.v1',
        consequences: {
          seedDelta: 0,
          gardenGrowthDelta: 0,
          canopyContributionDelta: 0,
          greenCircleActionDelta: 0,
          privateLeagueLeafDelta: 0,
          challengeLeafDelta: 0,
          familyRewardProgressDelta: 0,
          masteryCreditIds: [],
          taskRecognitionIds: [],
        },
      });
      expect(result.data.state.routeProgress[route].lifecycle).toBe('completed');
      expect(result.data.state.completion).toBe(result.data.event);
      expect(Object.isFrozen(result.data.event)).toBe(true);
      expect(Object.isFrozen(result.data.event.consequences)).toBe(true);
      expect(Object.isFrozen(result.data.event.consequences.masteryCreditIds)).toBe(true);
      expect(Object.isFrozen(result.data.event.consequences.taskRecognitionIds)).toBe(true);
    },
  );

  it('returns the one original completion across routes and concurrent retry delivery', () => {
    const storyReady = readyState('story');
    const command = {
      state: storyReady,
      profileId: PROFILE_ID,
      profileEpochId: EPOCH_ID,
      route: 'story',
      completedAt: COMPLETED_AT,
    } as const;
    const first = completeMangroveLearning(command);
    const concurrent = completeMangroveLearning(structuredClone(command));
    expectOk(first);
    expectOk(concurrent);
    expect(concurrent.data).toEqual(first.data);

    const duplicate = completeMangroveLearning({
      state: first.data.state,
      profileId: PROFILE_ID,
      profileEpochId: EPOCH_ID,
      route: 'story',
      completedAt: '2026-09-05T12:05:00.000Z',
    });
    expectOk(duplicate);
    const otherRoute = completeMangroveLearning({
      state: duplicate.data.state,
      profileId: PROFILE_ID,
      profileEpochId: EPOCH_ID,
      route: 'accessible',
      completedAt: '2026-09-05T12:10:00.000Z',
    });
    expectOk(otherRoute);

    expect(duplicate.data.disposition).toBe('already_completed');
    expect(otherRoute.data.disposition).toBe('already_completed');
    expect(duplicate.data.event).toEqual(first.data.event);
    expect(otherRoute.data.event).toEqual(first.data.event);
    expect(otherRoute.data.event.route).toBe('story');
    expect(otherRoute.data.event.completedAt).toBe(COMPLETED_AT);
    expect(otherRoute.data.state).toEqual(first.data.state);
  });

  it('keeps profile and active reset epoch isolated for every transition', () => {
    const state = startedState('story');
    const firstStep = MANGROVE_ROOTS_LEARNING_PACKAGE.routes.story.contentStepIds[0];
    expect(firstStep).toBeDefined();

    expect(
      advanceMangroveLearningStep({
        state,
        profileId: OTHER_PROFILE_ID,
        profileEpochId: EPOCH_ID,
        route: 'story',
        stepId: firstStep,
      }),
    ).toMatchObject({ ok: false, error: { code: 'PROFILE_SCOPE_MISMATCH' } });
    expect(
      advanceMangroveLearningStep({
        state,
        profileId: PROFILE_ID,
        profileEpochId: OTHER_EPOCH_ID,
        route: 'story',
        stepId: firstStep,
      }),
    ).toMatchObject({ ok: false, error: { code: 'EPOCH_SCOPE_MISMATCH' } });

    const alya = createMangroveLearningState({
      profileId: OTHER_PROFILE_ID,
      profileEpochId: OTHER_EPOCH_ID,
    });
    expectOk(alya);
    expect(alya.data.profileId).toBe(OTHER_PROFILE_ID);
    expect(alya.data.profileEpochId).toBe(OTHER_EPOCH_ID);
    expect(alya.data.completion).toBeNull();
  });
});

describe('R002b safe learning recovery and return intent', () => {
  it('rejects sparse Story progress before it can authorize package completion', () => {
    const ready = structuredClone(readyState('story'));
    const sparseSteps: unknown[] = [];
    sparseSteps.length = MANGROVE_ROOTS_LEARNING_PACKAGE.routes.story.contentStepIds.length;
    Object.assign(ready.routeProgress.story, { completedContentStepIds: sparseSteps });

    expect(restoreMangroveLearningState(ready)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_STATE' },
    });
    expect(
      completeMangroveLearning({
        state: ready,
        profileId: PROFILE_ID,
        profileEpochId: EPOCH_ID,
        route: 'story',
        completedAt: COMPLETED_AT,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_STATE' } });

    const completed = completeMangroveLearning({
      state: readyState('story'),
      profileId: PROFILE_ID,
      profileEpochId: EPOCH_ID,
      route: 'story',
      completedAt: COMPLETED_AT,
    });
    expectOk(completed);
    const forgedCompletion = structuredClone(completed.data.state);
    Object.assign(forgedCompletion.routeProgress.story, {
      completedContentStepIds: sparseSteps,
    });
    expect(forgedCompletion.completion?.completionCreditId).toBe('learning.mangrove_roots.v1');
    expect(restoreMangroveLearningState(forgedCompletion)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_STATE' },
    });
  });

  it('requires dense plain arrays for unlock and zero-reward completion evidence', () => {
    const malformedUnlock = structuredClone(startedState('story'));
    const sparseThresholds: unknown[] = [];
    sparseThresholds.length = 2;
    sparseThresholds[1] = 132;
    if (malformedUnlock.unlockEvidence) {
      Object.assign(malformedUnlock.unlockEvidence, { reachedThresholds: sparseThresholds });
    }
    expect(restoreMangroveLearningState(malformedUnlock)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_STATE' },
    });

    const completed = completeMangroveLearning({
      state: readyState('accessible'),
      profileId: PROFILE_ID,
      profileEpochId: EPOCH_ID,
      route: 'accessible',
      completedAt: COMPLETED_AT,
    });
    expectOk(completed);
    for (const field of ['masteryCreditIds', 'taskRecognitionIds'] as const) {
      const malformedCompletion = structuredClone(completed.data.state);
      const nonPlainEmptyArray: unknown[] = [];
      Object.setPrototypeOf(nonPlainEmptyArray, null);
      if (malformedCompletion.completion) {
        Object.assign(malformedCompletion.completion.consequences, {
          [field]: nonPlainEmptyArray,
        });
      }
      expect(restoreMangroveLearningState(malformedCompletion)).toMatchObject({
        ok: false,
        error: { code: 'COMPLETION_CONFLICT' },
      });
    }
  });

  it('restores only a canonical complete event and rejects conflicting reward evidence', () => {
    const completed = completeMangroveLearning({
      state: readyState('accessible'),
      profileId: PROFILE_ID,
      profileEpochId: EPOCH_ID,
      route: 'accessible',
      completedAt: COMPLETED_AT,
    });
    expectOk(completed);

    const wrongIdentity = structuredClone(completed.data.state);
    if (wrongIdentity.completion) {
      Object.assign(wrongIdentity.completion, { id: 'learning-completion:conflict' });
    }
    expect(restoreMangroveLearningState(wrongIdentity)).toMatchObject({
      ok: false,
      error: { code: 'COMPLETION_CONFLICT' },
    });

    const rewardConflict = structuredClone(completed.data.state);
    if (rewardConflict.completion) {
      Object.assign(rewardConflict.completion.consequences, { seedDelta: 12 });
    }
    expect(restoreMangroveLearningState(rewardConflict)).toMatchObject({
      ok: false,
      error: { code: 'COMPLETION_CONFLICT' },
    });
  });

  it('fails closed for malformed partial, unknown-route, and invalid timestamp input', () => {
    expect(restoreMangroveLearningState({ profileId: PROFILE_ID })).toMatchObject({
      ok: false,
      error: { code: 'INVALID_STATE' },
    });
    expect(
      startMangroveLearningRoute({
        state: emptyState(),
        profileId: PROFILE_ID,
        profileEpochId: EPOCH_ID,
        route: 'video',
        origin: IMPACT_PATH_ORIGIN,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(
      completeMangroveLearning({
        state: readyState('story'),
        profileId: PROFILE_ID,
        profileEpochId: EPOCH_ID,
        route: 'story',
        completedAt: 'tomorrow',
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
  });

  it('accepts only allowlisted same-profile Child origins and cannot replace one mid-package', () => {
    const base = emptyState();
    expect(
      startMangroveLearningRoute({
        state: base,
        profileId: PROFILE_ID,
        profileEpochId: EPOCH_ID,
        route: 'story',
        origin: { ...IMPACT_PATH_ORIGIN, route: '/parent' },
        unlockEvidence: UNLOCK_EVIDENCE,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_ORIGIN' } });
    expect(
      startMangroveLearningRoute({
        state: base,
        profileId: PROFILE_ID,
        profileEpochId: EPOCH_ID,
        route: 'story',
        origin: { ...IMPACT_PATH_ORIGIN, profileId: OTHER_PROFILE_ID },
        unlockEvidence: UNLOCK_EVIDENCE,
      }),
    ).toMatchObject({ ok: false, error: { code: 'PROFILE_SCOPE_MISMATCH' } });
    expect(
      startMangroveLearningRoute({
        state: base,
        profileId: PROFILE_ID,
        profileEpochId: EPOCH_ID,
        route: 'story',
        origin: { ...IMPACT_PATH_ORIGIN, focusTargetId: 'arbitrary-dom-selector' },
        unlockEvidence: UNLOCK_EVIDENCE,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_ORIGIN' } });

    const started = startedState('story');
    expect(
      startMangroveLearningRoute({
        state: started,
        profileId: PROFILE_ID,
        profileEpochId: EPOCH_ID,
        route: 'accessible',
        origin: TODAY_COMPLETE_ORIGIN,
        unlockEvidence: UNLOCK_EVIDENCE,
      }),
    ).toMatchObject({ ok: false, error: { code: 'ORIGIN_CONFLICT' } });
  });

  it('validates Badge Detail origins and preserves badge identity, filter, focus, and scroll', () => {
    const started = startMangroveLearningRoute({
      state: emptyState(),
      profileId: PROFILE_ID,
      profileEpochId: EPOCH_ID,
      route: 'story',
      origin: BADGE_DETAIL_ORIGIN,
      unlockEvidence: UNLOCK_EVIDENCE,
    });
    expectOk(started);

    expect(createMangroveReturnIntent({ state: started.data.state })).toEqual({
      ok: true,
      data: {
        kind: 'badge_detail',
        route: '/garden/badges/[badgeId]',
        profileId: PROFILE_ID,
        badgeId: 'badge.habitat.mangrove_care.v1',
        filter: 'in_progress',
        focusTargetId: 'r002b-badge-detail-learning-action',
        galleryScrollOffset: 188,
        scrollOffset: 312,
        replaceHistory: true,
        autoplayLearningId: null,
      },
    });
    expect(
      startMangroveLearningRoute({
        state: emptyState(),
        profileId: PROFILE_ID,
        profileEpochId: EPOCH_ID,
        route: 'story',
        origin: {
          ...BADGE_DETAIL_ORIGIN,
          badgeId: 'badge.unknown.v1',
        } as unknown as LearningOrigin,
        unlockEvidence: UNLOCK_EVIDENCE,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_ORIGIN' } });
    expect(
      startMangroveLearningRoute({
        state: started.data.state,
        profileId: PROFILE_ID,
        profileEpochId: EPOCH_ID,
        route: 'accessible',
        origin: { ...BADGE_DETAIL_ORIGIN, filter: 'earned' },
        unlockEvidence: UNLOCK_EVIDENCE,
      }),
    ).toMatchObject({ ok: false, error: { code: 'ORIGIN_CONFLICT' } });
  });

  it('returns to the exact recorded origin or finite Today-complete state and never autoplays', () => {
    const impactState = startedState('story');
    const impactIntent = createMangroveReturnIntent({ state: impactState });
    expectOk(impactIntent);
    expect(impactIntent.data).toEqual({
      kind: 'restore_origin',
      route: '/garden/impact-path',
      profileId: PROFILE_ID,
      focusTargetId: 'impact-path-learning-station-132',
      scrollOffset: 544,
      replaceHistory: true,
      autoplayLearningId: null,
    });

    const todayState = startedState('accessible', TODAY_COMPLETE_ORIGIN);
    const todayIntent = createMangroveReturnIntent({ state: todayState });
    expectOk(todayIntent);
    expect(todayIntent.data).toEqual({
      kind: 'today_complete',
      route: '/child',
      profileId: PROFILE_ID,
      focusTargetId: 'today-complete-heading',
      scrollOffset: 0,
      replaceHistory: true,
      autoplayLearningId: null,
    });
  });

  it('deep-freezes every state transition without mutating caller-owned input', () => {
    const base = emptyState();
    const before = structuredClone(base);
    const started = startMangroveLearningRoute({
      state: base,
      profileId: PROFILE_ID,
      profileEpochId: EPOCH_ID,
      route: 'story',
      origin: IMPACT_PATH_ORIGIN,
      unlockEvidence: UNLOCK_EVIDENCE,
    });
    expectOk(started);

    expect(base).toEqual(before);
    expect(Object.isFrozen(base)).toBe(true);
    expect(Object.isFrozen(base.routeProgress)).toBe(true);
    expect(Object.isFrozen(base.routeProgress.story)).toBe(true);
    expect(Object.isFrozen(base.routeProgress.story.completedContentStepIds)).toBe(true);
    expect(Object.isFrozen(started.data.state)).toBe(true);
    expect(Object.isFrozen(started.data.state.origin)).toBe(true);
  });
});
