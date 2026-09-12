import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DemoEntryRequest, DemoPrincipal } from '../src/models/demoEntry';

async function freshRun(mode: 'demo' | 'ordinary' = 'demo') {
  vi.stubEnv('EXPO_PUBLIC_GHAF_DEMO_ENTRY', mode === 'demo' ? 'true' : undefined);
  vi.resetModules();
  const module = await import('../src/state/usePrototypeStore');
  const { serviceRegistry } = await import('../src/services');
  const state = module.usePrototypeStore.getState;
  const request = (principal: DemoPrincipal): DemoEntryRequest => ({
    principal,
    expectedGeneration: state().demoRunGeneration,
    expectedEpoch: state().demoEntryEpoch,
  });
  const enter = (principal: DemoPrincipal) => state().enterDemoExperience(request(principal));
  return { ...module, serviceRegistry, state, request, enter };
}

function ok(result: { readonly ok: boolean }) {
  expect(result).toMatchObject({ ok: true });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('isolated three-profile demo controller integration', () => {
  it.each(['parent_al_noor', 'child_salem', 'child_alya'] as const)(
    'enters %s from a fresh signed-out run without verification or pairing',
    async (principal) => {
      const run = await freshRun();
      const before = structuredClone(run.state().growthJourney);
      expect(run.state().activeExperience).toBe('signed_out');
      expect(run.state().localFamily.record).toBeNull();
      ok(run.enter(principal));
      expect(run.state().growthJourney).toEqual(before);
      expect(run.state().localFamily.configuredChildIds).toEqual(['child_salem', 'child_alya']);
      expect(run.state().deviceAccess.record).toBeNull();
      expect(run.state().temporaryParentAccess).toBeNull();
      expect(run.state().journey).toBeNull();
      if (principal === 'parent_al_noor') {
        ok(run.state().authorizeParentExperience());
        expect(run.state().authorizeChildExperience().ok).toBe(false);
      } else {
        expect(run.state().activeChildId).toBe(principal);
        ok(run.state().authorizeChildExperience());
        expect(run.state().authorizeParentExperience().ok).toBe(false);
        expect(run.state().getFamilyReward().ok).toBe(false);
      }
      expect(run.enter('parent_al_noor').ok).toBe(false);
    },
  );

  it('denies quick entry in ordinary mode and retains ordinary verification', async () => {
    const run = await freshRun('ordinary');
    expect(run.enter('parent_al_noor').ok).toBe(false);
    ok(
      run
        .state()
        .requestParentVerification({ identifier: 'parent@example.com', networkAvailable: false }),
    );
  });

  it('rejects old selector callbacks after sign-out without replacing the run', async () => {
    const run = await freshRun();
    const captured = run.request('parent_al_noor');
    ok(run.state().enterDemoExperience(captured));
    const generation = run.state().demoRunGeneration;
    ok(run.state().signOutExperience());
    expect(run.state().enterDemoExperience(captured).ok).toBe(false);
    expect(run.state().activeExperience).toBe('signed_out');
    expect(run.state().demoRunGeneration).toBe(generation);
    ok(run.enter('child_alya'));
    ok(run.state().beginTemporaryParentAccess());
    expect(run.state().activeExperience).toBe('signed_out');
    expect(run.state().temporaryParentAccess).toBeNull();
    ok(run.enter('parent_al_noor'));
  });

  it('denies ordinary credential/setup entry commands in a demo build', async () => {
    const run = await freshRun();
    expect(run.state().requestParentVerification({ identifier: 'parent@example.com' }).ok).toBe(
      false,
    );
    expect(
      run.state().requestExistingParentVerification({ identifier: 'parent@example.com' }).ok,
    ).toBe(false);
    expect(run.state().selectChildAccessProfile('child_salem').ok).toBe(false);
    expect(run.state().verifyChildCredential('2468').ok).toBe(false);
    expect(run.state().completeParentOnboarding().ok).toBe(false);
    expect(run.state().enterParentExperience().ok).toBe(false);
    expect(run.state().activeExperience).toBe('signed_out');
  });

  it('keeps a Parent-approved task across handoffs and excludes the sibling', async () => {
    const run = await freshRun();
    const { P0_RECYCLING_TEMPLATE } = await import('../src/features/tasks/demoContent');
    ok(run.enter('parent_al_noor'));
    ok(
      run.state().createTaskDraft({
        childId: 'child_salem',
        templateId: P0_RECYCLING_TEMPLATE.id,
        parentText: {
          ar: 'افرز الورق والبلاستيك النظيفين اللذين وافق عليهما شخص بالغ، وتوقف واسأل شخصاً بالغاً عند الشك.',
          en: 'Sort the clean paper and plastic approved by an adult, and stop to ask an adult when unsure.',
        },
      }),
    );
    ok(run.state().reviewTask());
    ok(run.state().approveAssignment());
    const assigned = structuredClone(run.state().journey);
    ok(run.state().signOutExperience());
    ok(run.enter('child_alya'));
    expect(run.state().chooseAssignment('choice_recycling_p0_v1').ok).toBe(false);
    expect(run.state().startAssignment().ok).toBe(false);
    expect(run.state().journey).toEqual(assigned);
    ok(run.state().signOutExperience());
    ok(run.enter('child_salem'));
    ok(run.state().chooseAssignment('choice_recycling_p0_v1'));
    ok(run.state().startAssignment());
    expect(run.state().journey?.task.id).toBe(assigned?.task.id);
    expect(run.state().demoRunGeneration).toBe(0);
    ok(
      run.state().submitTask({
        definitionAcknowledged: true,
        completionMode: 'permitted_help',
        helpUsed: P0_RECYCLING_TEMPLATE.permittedHelp,
        preparedMediaFixtureId: null,
        reflection: null,
        observableFacts: [],
      }),
    );
    expect(run.state().children.child_salem.earnedSeeds).toBe(48);
    ok(run.state().signOutExperience());
    ok(run.enter('parent_al_noor'));
    const { PREPARED_PRAISE } = await import('../src/services');
    const submissionId = run.state().journey?.submission?.id ?? '';
    ok(run.state().restoreCheckInState(submissionId));
    ok(
      run.state().confirmAndPresentPraise(
        { submissionId, praise: PREPARED_PRAISE, neutralObservation: null, uncertainty: null },
        {
          actionId: 'demo-praise',
          source: 'parent_press',
          presentedAt: '2026-08-26T10:00:00.000Z',
        },
      ),
    );
    expect(run.state().children.child_salem.earnedSeeds).toBe(48);
    const action = {
      actionId: 'demo-growth',
      source: 'parent_press' as const,
      observedRenderState: 'praise_presented' as const,
      presentationActionId: 'demo-praise',
    };
    ok(run.state().applyRecognition(action));
    expect(run.state().children.child_salem.earnedSeeds).toBe(60);
    const authorities = structuredClone({
      growth: run.state().growthJourney,
      league: run.state().privateLeague,
      reward: run.state().familyReward,
    });
    ok(run.state().applyRecognition(action));
    expect(run.state().children.child_salem.earnedSeeds).toBe(60);
    expect({
      growth: run.state().growthJourney,
      league: run.state().privateLeague,
      reward: run.state().familyReward,
    }).toEqual(authorities);
  });

  it('clears Salem voice and draft media across profile handoffs without losing progress or permission', async () => {
    const run = await freshRun();
    const { P0_RECYCLING_TEMPLATE } = await import('../src/features/tasks/demoContent');
    ok(run.enter('parent_al_noor'));
    ok(
      run.state().createTaskDraft({
        childId: 'child_salem',
        templateId: P0_RECYCLING_TEMPLATE.id,
        parentText: {
          ar: 'افرز الورق والبلاستيك النظيفين اللذين وافق عليهما شخص بالغ، وتوقف واسأل شخصاً بالغاً عند الشك.',
          en: 'Sort the clean paper and plastic approved by an adult, and stop to ask an adult when unsure.',
        },
      }),
    );
    ok(run.state().reviewTask());
    ok(run.state().setChildVoicePermission(true));
    ok(run.state().approveAssignment());
    const permission = run.state().getChildPermissionGrant('child_salem');
    expect(permission).toMatchObject({
      ok: true,
      data: { childId: 'child_salem', voiceGranted: true, aiGranted: true },
    });

    ok(run.state().signOutExperience());
    ok(run.enter('child_salem'));
    ok(run.state().chooseAssignment('choice_recycling_p0_v1'));
    ok(run.state().startAssignment());
    ok(run.state().prepareChildVoice());
    ok(run.state().runChildVoiceCommand({ type: 'start' }));
    ok(run.state().runChildVoiceCommand({ type: 'stop' }));
    ok(run.state().runChildVoiceCommand({ type: 'replay' }));
    expect(run.state().childVoiceView).toMatchObject({
      lifecycle: 'transcript_review',
      transcript: { ar: expect.any(String), en: expect.any(String) },
      replayCount: 1,
    });
    ok(run.state().selectPreparedMedia('fixture_recycling_clean_v1'));
    ok(run.state().markPreparedMediaUnavailable('fixture_salem_plan_ar_v1'));
    const reflection = { ar: 'طلبت مساعدة عند الشك.', en: 'I asked for help when unsure.' };
    ok(run.state().setChildTaskReflection(reflection));
    expect(run.state().childTaskDraft).toMatchObject({
      selectedMediaFixtureId: 'fixture_recycling_clean_v1',
      unavailableMediaFixtureIds: ['fixture_salem_plan_ar_v1'],
      reflection,
    });
    ok(await run.state().requestChildCoach({ requestId: 'handoff-coach', intent: 'show_steps' }));
    expect(run.state().childCoachResult).not.toBeNull();
    expect(run.state().ageAdaptedCoachResult).not.toBeNull();

    const progress = () => ({
      journey: run.state().journey,
      activeAssignmentId: run.state().activeAssignmentId,
      children: run.state().children,
      growthJourney: run.state().growthJourney,
      recognitionLedger: run.state().recognitionLedger,
      demoRunGeneration: run.state().demoRunGeneration,
    });
    const retainedProgress = structuredClone(progress());
    const expectClearedTransients = () => {
      expect(run.state().childTaskDraft).toEqual({
        selectedMediaFixtureId: null,
        removedMediaFixtureIds: [],
        unavailableMediaFixtureIds: [],
        reflection: null,
      });
      expect(run.state().childVoiceView).toMatchObject({
        taskId: null,
        approvedTaskVersion: null,
        lifecycle: 'idle',
        transcript: null,
        replayCount: 0,
        activeIndicatorVisible: false,
        sentAt: null,
      });
      expect(run.state().childCoachResult).toBeNull();
      expect(run.state().ageAdaptedCoachResult).toBeNull();
      expect(run.state().liveVoiceCapture).toBeNull();
      expect(progress()).toEqual(retainedProgress);
    };

    ok(run.state().signOutExperience());
    expect(run.state().activeExperience).toBe('signed_out');
    expectClearedTransients();
    ok(run.enter('parent_al_noor'));
    expectClearedTransients();
    expect(run.state().getChildPermissionGrant('child_salem')).toEqual(permission);
    expect(run.state().runChildVoiceCommand({ type: 'replay' }).ok).toBe(false);

    ok(run.state().signOutExperience());
    ok(run.enter('child_alya'));
    expectClearedTransients();
    expect(run.state().prepareChildVoice().ok).toBe(false);
    expect(run.state().runChildVoiceCommand({ type: 'replay' }).ok).toBe(false);
    expectClearedTransients();

    ok(run.state().signOutExperience());
    ok(run.enter('child_salem'));
    expectClearedTransients();
    expect(run.state().getOwnChildPermissionGrant()).toEqual(permission);
    expect(run.state().runChildVoiceCommand({ type: 'replay' }).ok).toBe(false);
    ok(run.state().prepareChildVoice());
    expect(run.state().childVoiceView).toMatchObject({
      permissionEnabled: true,
      availability: 'ready',
      lifecycle: 'idle',
      transcript: null,
      replayCount: 0,
      sentAt: null,
    });
    expect(progress()).toEqual(retainedProgress);
    expect(run.state().childTaskDraft.reflection).toBeNull();
    expect(run.state().childTaskDraft.selectedMediaFixtureId).toBeNull();
  });

  it('resets to fresh Arabic defaults, invalidates captured entry, and can enter again', async () => {
    const run = await freshRun();
    const captured = run.request('child_salem');
    ok(run.enter('parent_al_noor'));
    run.state().setLocale('en');
    ok(run.state().resetPrototype());
    expect(run.state().locale).toBe('ar');
    expect(run.state().activeExperience).toBe('signed_out');
    expect(run.state().demoRunGeneration).toBe(1);
    expect(run.state().demoResetFailed).toBe(false);
    expect(run.state().enterDemoExperience(captured).ok).toBe(false);
    ok(run.enter('child_salem'));
    ok(run.state().authorizeChildExperience());
  });

  it.each(['first', 'middle', 'last', 'throw'] as const)(
    'closes every entry/role after %s reset failure and requires a fresh process',
    async (stage) => {
      const run = await freshRun();
      ok(run.enter('parent_al_noor'));
      const failure = {
        ok: false as const,
        error: {
          code: 'INVALID_RESPONSE' as const,
          message: 'Injected reset failure',
          retryable: false,
          fallbackAvailable: false,
        },
      };
      if (stage === 'first')
        vi.spyOn(run.serviceRegistry.deviceAccess, 'clear').mockReturnValueOnce(failure);
      if (stage === 'middle')
        vi.spyOn(run.serviceRegistry.savedTaskTemplates, 'clear').mockReturnValueOnce(failure);
      if (stage === 'last')
        vi.spyOn(run.serviceRegistry.boundedAi.childAiGrants, 'reset').mockReturnValueOnce(failure);
      if (stage === 'throw')
        vi.spyOn(run.serviceRegistry.localFamily, 'clear').mockImplementationOnce(() => {
          throw new Error('Injected exception');
        });
      expect(run.state().resetPrototype().ok).toBe(false);
      expect(run.state().demoResetFailed).toBe(true);
      expect(run.state().activeExperience).toBe('signed_out');
      expect(run.selectHasActiveParentExperience(run.state())).toBe(false);
      expect(run.selectCanEnterChildExperience(run.state())).toBe(false);
      for (const principal of ['parent_al_noor', 'child_salem', 'child_alya'] as const) {
        expect(run.enter(principal).ok).toBe(false);
      }
      expect(run.state().authorizeParentExperience().ok).toBe(false);
      expect(run.state().authorizeChildExperience().ok).toBe(false);
      expect(run.state().resetPrototype().ok).toBe(false);
      expect(run.state().enterParentExperience().ok).toBe(false);
      expect(run.state().getFamilyReward().ok).toBe(false);
      expect(run.state().requestParentVerification({ identifier: 'parent@example.com' }).ok).toBe(
        false,
      );
      const restarted = await freshRun();
      expect(restarted.state().demoResetFailed).toBe(false);
      ok(restarted.enter('parent_al_noor'));
    },
  );
  it.each(['signout', 'reset', 'entry'] as const)(
    'rolls back when %s reenters authority creation',
    async (reentry) => {
      const run = await freshRun();
      const signIn = run.serviceRegistry.access.signInParent.bind(run.serviceRegistry.access);
      vi.spyOn(run.serviceRegistry.access, 'signInParent').mockImplementationOnce((input) => {
        const attempted =
          reentry === 'signout'
            ? run.state().signOutExperience()
            : reentry === 'reset'
              ? run.state().resetPrototype()
              : run.enter('child_alya');
        expect(attempted.ok).toBe(false);
        return signIn(input);
      });
      expect(run.enter('parent_al_noor').ok).toBe(false);
      expect(run.state().activeExperience).toBe('signed_out');
      expect(run.state().demoResetFailed).toBe(false);
      expect(run.state().authorizeParentExperience().ok).toBe(false);
      ok(run.enter('parent_al_noor'));
    },
  );

  it('preserves the run and retries after a failed family seed', async () => {
    const run = await freshRun();
    const before = structuredClone(run.state().growthJourney);
    vi.spyOn(run.serviceRegistry.localFamily, 'save').mockReturnValueOnce({
      ok: false,
      error: {
        code: 'INVALID_TRANSITION',
        message: 'Prepared write failure',
        retryable: false,
        fallbackAvailable: false,
      },
    });
    expect(run.enter('parent_al_noor').ok).toBe(false);
    expect(run.state().activeExperience).toBe('signed_out');
    expect(run.state().growthJourney).toEqual(before);
    ok(run.enter('parent_al_noor'));
  });

  it('discards an old Child Coach response after signing out and re-entering the same task', async () => {
    const run = await freshRun();
    const { P0_RECYCLING_TEMPLATE } = await import('../src/features/tasks/demoContent');
    ok(run.enter('parent_al_noor'));
    ok(
      run.state().createTaskDraft({
        childId: 'child_salem',
        templateId: P0_RECYCLING_TEMPLATE.id,
        parentText: {
          ar: 'افرز الورق والبلاستيك النظيفين اللذين وافق عليهما شخص بالغ، وتوقف واسأل شخصاً بالغاً عند الشك.',
          en: 'Sort the clean paper and plastic approved by an adult, and stop to ask an adult when unsure.',
        },
      }),
    );
    ok(run.state().reviewTask());
    ok(run.state().approveAssignment());
    ok(run.state().signOutExperience());
    ok(run.enter('child_salem'));
    ok(run.state().chooseAssignment('choice_recycling_p0_v1'));
    ok(run.state().startAssignment());
    const respond = run.serviceRegistry.childCoach.respond.bind(run.serviceRegistry.childCoach);
    let complete: () => void = () => {
      throw new Error('Response has not started');
    };
    vi.spyOn(run.serviceRegistry.childCoach, 'respond').mockImplementationOnce(
      (request) =>
        new Promise((resolve) => {
          complete = () => {
            void Promise.resolve(respond(request)).then(resolve);
          };
        }),
    );
    const pending = run
      .state()
      .requestChildCoach({ requestId: 'old-demo-coach', intent: 'show_steps' });
    ok(run.state().signOutExperience());
    ok(run.enter('child_salem'));
    complete();
    expect(await pending).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(run.state().childCoachResult).toBeNull();
  });
});
