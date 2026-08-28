import { readFileSync, readdirSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { PreparedMediaFixture, PrototypeSession } from '../src/models/familyGrowth';
import type { ParentGuideService } from '../src/services';
import { serviceRegistry } from '../src/services';
import {
  createInitialPrototypeSession,
  createResetSourceSession,
  createSubmittedP0Session,
  PREPARED_PRAISE,
} from '../src/services/mock/fixtures';
import type { PrototypeStoreState } from '../src/state/usePrototypeStore';
import { usePrototypeStore } from '../src/state/usePrototypeStore';

const EXPECTED_ROUTES = [
  '/',
  '/role',
  '/parent',
  '/parent/task/new',
  '/parent/task/review',
  '/child',
  '/child/task',
  '/parent/check-in',
  '/garden',
  '/circle',
] as const;

const LEGACY_ROUTES = [
  '/parent/create',
  '/parent/generating',
  '/parent/review',
  '/child/mission',
  '/parent/confirmation',
  '/celebration',
] as const;

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

function sessionSnapshot(
  state: PrototypeStoreState = usePrototypeStore.getState(),
): PrototypeSession {
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

function listTsxFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const child = resolve(directory, entry.name);
    if (entry.isDirectory()) return listTsxFiles(child);
    return entry.isFile() && entry.name.endsWith('.tsx') ? [child] : [];
  });
}

function authoredRoutes(): string[] {
  const appRoot = resolve(import.meta.dirname, '../app');
  return listTsxFiles(appRoot)
    .map((file) => relative(appRoot, file).split(sep).join('/'))
    .filter((file) => file !== '_layout.tsx' && file !== '+html.tsx')
    .map((file) => {
      const withoutExtension = file.replace(/\.tsx$/u, '');
      const withoutIndex = withoutExtension.replace(/(?:^|\/)index$/u, '');
      return withoutIndex ? `/${withoutIndex}` : '/';
    })
    .sort();
}

function unavailableParentGuide(
  code: 'TIMEOUT' | 'REMOTE_UNAVAILABLE' | 'INVALID_RESPONSE' | 'SAFETY_REJECTED',
): ParentGuideService {
  const error = {
    code,
    message: `Synthetic ${code} operator test`,
    retryable: code === 'TIMEOUT' || code === 'REMOTE_UNAVAILABLE',
    fallbackAvailable: true,
  } as const;
  return {
    refineTask: async () => ({ ok: false as const, error }),
    summarizePattern: async () => ({ ok: false as const, error }),
  };
}

async function completeOfflineCycle(cycle: number): Promise<void> {
  const reset = usePrototypeStore.getState().resetPrototype();
  expect(reset).toEqual({ navigateTo: '/', replaceHistory: true });

  expectOk(
    usePrototypeStore.getState().createTaskDraft({
      childId: 'child_salem',
      templateId: 'task_recycling_p0_v1',
      parentText: { ar: 'أخرج مواد إعادة التدوير.', en: 'Take the recycling out.' },
    }),
  );
  expectOk(
    await usePrototypeStore.getState().requestParentGuide({
      requestId: `operator-guide-${cycle}`,
      intent: 'make_clearer',
    }),
  );
  expectOk(usePrototypeStore.getState().acceptGuideSuggestion());
  expectOk(usePrototypeStore.getState().reviewTask());
  expectOk(usePrototypeStore.getState().approveAssignment());

  usePrototypeStore.getState().setRole('child');
  expectOk(usePrototypeStore.getState().setActiveChild('child_salem'));
  expectOk(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1'));
  expectOk(usePrototypeStore.getState().startAssignment());
  expectOk(
    await usePrototypeStore.getState().requestChildCoach({
      requestId: `operator-coach-${cycle}`,
      intent: 'show_steps',
    }),
  );
  expectOk(
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
  );

  usePrototypeStore.getState().setRole('parent');
  expectOk(
    usePrototypeStore.getState().planConfirmation({
      submissionId: 'submission_recycling_p0_v1_attempt_1',
      praise: PREPARED_PRAISE,
      neutralObservation: null,
      uncertainty: null,
    }),
  );
  expectOk(
    usePrototypeStore.getState().markPraisePresented({
      actionId: `operator-praise-${cycle}`,
      source: 'parent_press',
      presentedAt: `2026-08-26T10:00:0${cycle}.000Z`,
    }),
  );
  expectOk(
    usePrototypeStore.getState().applyRecognition({
      actionId: `operator-recognition-${cycle}`,
      source: 'parent_press',
      observedRenderState: 'praise_presented',
      presentationActionId: `operator-praise-${cycle}`,
    }),
  );
  expect(counters()).toEqual({
    salemSeeds: 60,
    mangroveSeeds: 60,
    mangroveStage: 'sapling',
    canopyLeaves: 20,
    circleActions: 12,
  });
}

describe('US6 bilingual offline operator and reset flow', () => {
  beforeEach(() => {
    usePrototypeStore.getState().resetPrototype();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('contains exactly the ten authored Feature 003 routes and no replaced Feature 002 route', () => {
    const actual = authoredRoutes();
    expect(actual).toEqual([...EXPECTED_ROUTES].sort());
    for (const legacyRoute of LEGACY_ROUTES) {
      expect(actual).not.toContain(legacyRoute);
    }
  });

  it('automatically replaces invalid conditional deep links without rendering private guard detail', () => {
    const cases = [
      {
        source: readFileSync(new URL('../app/parent/task/review.tsx', import.meta.url), 'utf8'),
        destination: '/parent/task/new',
        retiredGuard: 'parent-task-review-guard',
        nullGuard: 'if (!content || !reviewable) return null;',
      },
      {
        source: readFileSync(new URL('../app/child/task.tsx', import.meta.url), 'utf8'),
        destination: '/child',
        retiredGuard: 'child-task-guard',
        nullGuard: 'if (!hasTaskPrerequisite) return null;',
      },
      {
        source: readFileSync(new URL('../app/parent/check-in.tsx', import.meta.url), 'utf8'),
        destination: '/parent',
        retiredGuard: 'parent-check-in-guard',
        nullGuard: 'if (!admission?.ok) return null;',
      },
    ] as const;

    for (const routeCase of cases) {
      expect(routeCase.source).toContain(`router.replace('${routeCase.destination}')`);
      expect(routeCase.source).toContain(routeCase.nullGuard);
      expect(routeCase.source).not.toContain(routeCase.retiredGuard);
    }

    expect(sessionSnapshot()).toEqual(createInitialPrototypeSession());
  });

  it('admits only matching submitted, pending-praise, praise-presented, and recognized check-in states', () => {
    const missing = serviceRegistry.recognition.resolveCheckInState(
      usePrototypeStore.getState(),
      'missing-submission',
    );
    expect(missing).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(counters()).toEqual({
      salemSeeds: 48,
      mangroveSeeds: 48,
      mangroveStage: 'shoot',
      canopyLeaves: 19,
      circleActions: 11,
    });

    usePrototypeStore.setState(createSubmittedP0Session());
    const submissionId = 'submission_recycling_p0_v1_attempt_1';
    expect(
      serviceRegistry.recognition.resolveCheckInState(usePrototypeStore.getState(), submissionId),
    ).toMatchObject({ ok: true, data: { state: 'submitted' } });

    expectOk(
      usePrototypeStore.getState().planConfirmation({
        submissionId,
        praise: {
          ar: 'لقد فرزت المواد النظيفة وسألت شخصاً بالغاً قبل المتابعة.',
          en: 'You sorted the clean items and asked an adult before continuing.',
        },
        neutralObservation: null,
        uncertainty: null,
      }),
    );
    expect(
      serviceRegistry.recognition.resolveCheckInState(usePrototypeStore.getState(), submissionId),
    ).toMatchObject({
      ok: true,
      data: {
        state: 'confirmation_pending',
        attempt: { disposition: 'pending_praise' },
      },
    });

    expectOk(
      usePrototypeStore.getState().markPraisePresented({
        actionId: 'operator-guard-praise',
        source: 'parent_press',
        presentedAt: '2026-08-26T10:00:00.000Z',
      }),
    );
    expect(
      serviceRegistry.recognition.resolveCheckInState(usePrototypeStore.getState(), submissionId),
    ).toMatchObject({
      ok: true,
      data: {
        state: 'confirmation_pending',
        attempt: { disposition: 'praise_presented' },
      },
    });

    expectOk(
      usePrototypeStore.getState().applyRecognition({
        actionId: 'operator-guard-recognition',
        source: 'parent_press',
        observedRenderState: 'praise_presented',
        presentationActionId: 'operator-guard-praise',
      }),
    );
    expect(
      serviceRegistry.recognition.resolveCheckInState(usePrototypeStore.getState(), submissionId),
    ).toMatchObject({
      ok: true,
      data: {
        state: 'already_confirmed',
        attempt: { disposition: 'already_confirmed' },
      },
    });
  });

  it('rejects retry, confirmed, or recognized check-in state with mismatched references', () => {
    const submissionId = 'submission_recycling_p0_v1_attempt_1';
    for (const lifecycle of ['retry', 'confirmed', 'recognized'] as const) {
      const session = createResetSourceSession(lifecycle);
      const journey = session.journey;
      if (!journey?.checkIn) throw new Error(`Expected ${lifecycle} check-in fixture`);
      const corrupted = {
        ...session,
        journey: {
          ...journey,
          checkIn: { ...journey.checkIn, submissionId: 'submission_spoofed' },
        },
      };
      expect(
        serviceRegistry.recognition.resolveCheckInState(corrupted, submissionId),
      ).toMatchObject({
        ok: false,
      });
    }

    const confirmed = createResetSourceSession('confirmed');
    if (!confirmed.journey?.checkIn) throw new Error('Expected confirmed fixture');
    expect(
      serviceRegistry.recognition.resolveCheckInState(
        {
          ...confirmed,
          journey: {
            ...confirmed.journey,
            checkIn: { ...confirmed.journey.checkIn, recognitionKey: 'recognition:spoofed' },
          },
        },
        submissionId,
      ),
    ).toMatchObject({ ok: false });

    const recognized = createResetSourceSession('recognized');
    const expectedKey = `recognition:${submissionId}`;
    const receipt = recognized.recognitionLedger[expectedKey];
    if (!receipt) throw new Error('Expected recognized receipt fixture');
    expect(
      serviceRegistry.recognition.resolveCheckInState(
        {
          ...recognized,
          recognitionLedger: {
            ...recognized.recognitionLedger,
            [expectedKey]: { ...receipt, recognitionKey: 'recognition:spoofed' },
          },
        },
        submissionId,
      ),
    ).toMatchObject({ ok: false });
  });

  it('preserves task identity, lifecycle, Parent input, and counters across safe locale switches', () => {
    usePrototypeStore.setState(createResetSourceSession('in_progress'));
    const before = {
      taskId: usePrototypeStore.getState().journey?.task.id,
      taskVersion: usePrototypeStore.getState().journey?.task.version,
      lifecycle: usePrototypeStore.getState().journey?.lifecycle,
      parentText: usePrototypeStore.getState().journey?.task.parentOriginalText,
      counters: counters(),
    };

    usePrototypeStore.getState().setLocale('en');
    expect(usePrototypeStore.getState()).toMatchObject({ locale: 'en', direction: 'ltr' });
    expect({
      taskId: usePrototypeStore.getState().journey?.task.id,
      taskVersion: usePrototypeStore.getState().journey?.task.version,
      lifecycle: usePrototypeStore.getState().journey?.lifecycle,
      parentText: usePrototypeStore.getState().journey?.task.parentOriginalText,
      counters: counters(),
    }).toEqual(before);

    usePrototypeStore.getState().setLocale('ar');
    expect(usePrototypeStore.getState()).toMatchObject({ locale: 'ar', direction: 'rtl' });
    expect(counters()).toEqual(before.counters);
  });

  it('hands the shared device back to the exact Salem lifecycle without duplicate role copy', () => {
    const source = readFileSync(new URL('../app/role.tsx', import.meta.url), 'utf8');

    expect(source).toContain("chosen: '/child/task'");
    expect(source).toContain("in_progress: '/child/task'");
    expect(source).toContain("submitted: '/child/task'");
    expect(source).toContain("recognized: '/garden'");
    expect(source).toContain("['submitted', 'retry', 'confirmed', 'recognized']");
    expect(source).toContain('status={salemHandoffLabel}');
    expect(source).toContain('statusTestID="salem-handoff-status"');
    expect(source).not.toContain("{t('role.body')} {t('origin.synthetic')}");
    expect(source).not.toContain("{t('origin.synthetic')}");
  });

  it.each(RESET_SOURCE_STATES)(
    'atomically resets the %s source state to Arabic / with replacement',
    (source) => {
      usePrototypeStore.setState(createResetSourceSession(source));
      const reset = usePrototypeStore.getState().resetPrototype();

      expect(reset).toEqual({ navigateTo: '/', replaceHistory: true });
      expect(sessionSnapshot()).toEqual(createInitialPrototypeSession());
      expect(usePrototypeStore.getState()).toMatchObject({
        locale: 'ar',
        direction: 'rtl',
        role: 'parent',
        activeChildId: 'child_salem',
        activeAssignmentId: null,
        journey: null,
        recognitionLedger: {},
        celebration: { available: false, consumed: false },
      });
    },
  );

  it('keeps route/history state out of the session aggregate and returns explicit history replacement', () => {
    const state = usePrototypeStore.getState() as unknown as Record<string, unknown>;
    for (const key of [
      'route',
      'currentRoute',
      'history',
      'navigationState',
      'backStack',
      'previousRoute',
    ]) {
      expect(state[key], key).toBeUndefined();
    }
    expect(usePrototypeStore.getState().resetPrototype()).toEqual({
      navigateTo: '/',
      replaceHistory: true,
    });
  });

  it('completes five deterministic cycles with every external service denied', async () => {
    const fetchSpy = vi.fn(() => Promise.reject(new Error('External services denied')));
    vi.stubGlobal('fetch', fetchSpy);
    expect(serviceRegistry).toMatchObject({
      parentGuide: { mode: 'deterministic_prepared' },
      childCoach: { mode: 'deterministic_prepared' },
    });
    expect(serviceRegistry).not.toHaveProperty('liveParentGuide');
    expect(serviceRegistry).not.toHaveProperty('liveChildCoach');

    for (let cycle = 1; cycle <= 5; cycle += 1) {
      await completeOfflineCycle(cycle);
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it.each([
    ['TIMEOUT', 'timeout'],
    ['REMOTE_UNAVAILABLE', 'remote_failure'],
    ['INVALID_RESPONSE', 'malformed_response'],
    ['SAFETY_REJECTED', 'safety_rejected'],
  ] as const)(
    'retains input and uses the same-attempt prepared result after %s',
    async (code, reason) => {
      expectOk(
        usePrototypeStore.getState().createTaskDraft({
          childId: 'child_salem',
          templateId: 'task_recycling_p0_v1',
          parentText: { ar: 'أخرج مواد إعادة التدوير.', en: 'Take the recycling out.' },
        }),
      );
      const requestId = `operator-fallback-${code}`;
      const fallback = await usePrototypeStore
        .getState()
        .requestParentGuide({ requestId, intent: 'make_clearer' }, unavailableParentGuide(code));

      expect(fallback).toMatchObject({
        ok: true,
        data: {
          originalParentText: {
            ar: 'أخرج مواد إعادة التدوير.',
            en: 'Take the recycling out.',
          },
          meta: {
            requestId,
            origin: 'prepared',
            fixtureId: 'guide_recycling_refine_v1',
            fallbackUsed: true,
            fallbackReason: reason,
            disclosure: { preparedIsExplicit: true, saysAiMayBeWrong: true },
          },
        },
      });
      expect(usePrototypeStore.getState().journey).toMatchObject({
        lifecycle: 'draft',
        task: {
          parentOriginalText: {
            ar: 'أخرج مواد إعادة التدوير.',
            en: 'Take the recycling out.',
          },
          acceptedGuideFixtureId: null,
        },
      });
    },
  );

  it('keeps missing prepared image/audio paths accessible and nonblocking', async () => {
    const audio = await serviceRegistry.media.getPrepared('fixture_salem_plan_ar_v1');
    expect(audio).toMatchObject({
      ok: true,
      data: {
        available: false,
        fixture: {
          kind: 'audio',
          optional: true,
          transcript: { ar: expect.any(String), en: expect.any(String) },
          removeAllowed: true,
        },
        fallbackText: { ar: expect.any(String), en: expect.any(String) },
      },
    });

    const missing = await serviceRegistry.media.getPrepared(
      'fixture_missing_for_operator_test' as PreparedMediaFixture['id'],
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
});
