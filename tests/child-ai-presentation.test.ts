import { readFileSync } from 'node:fs';

import { beforeEach, describe, expect, it } from 'vitest';

import {
  createChildVoiceController,
  INITIAL_CHILD_VOICE_VIEW,
  type ChildVoiceTaskContext,
} from '../src/features/assistants/childVoiceController';
import { PREPARED_VOICE_TRANSCRIPTS } from '../src/features/assistants/voiceSession';
import { localize } from '../src/i18n';
import { resources } from '../src/i18n/resources';
import { createFeature003ServiceRegistry } from '../src/services';
import { usePrototypeStore } from '../src/state/usePrototypeStore';

const taskContext: ChildVoiceTaskContext = {
  actorRole: 'child',
  childId: 'child_salem',
  ageBand: '9_11',
  taskId: 'task_recycling_p0_v1',
  approvedTaskVersion: 1,
  lifecycle: 'in_progress',
  approvedByParent: true,
};

function expectOk<T>(result: { ok: true; data: T } | { ok: false; error: { message: string } }): T {
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

function grantedController() {
  const controller = createChildVoiceController(createFeature003ServiceRegistry());
  expectOk(
    controller.configureParentPermission({
      actorRole: 'parent',
      childId: 'child_salem',
      languagePreference: 'ar',
      enabled: true,
    }),
  );
  expectOk(controller.bindActiveTask(taskContext));
  return controller;
}

function reviewP0Task() {
  expectOk(
    usePrototypeStore.getState().createTaskDraft({
      childId: 'child_salem',
      templateId: 'task_recycling_p0_v1',
      parentText: {
        ar: 'افرز الورق والبلاستيك النظيفين اللذين وافق عليهما شخص بالغ، وتوقف واسأل شخصاً بالغاً عند الشك.',
        en: 'Sort the clean paper and plastic approved by an adult, and stop to ask an adult when unsure.',
      },
    }),
  );
  expectOk(usePrototypeStore.getState().reviewTask());
}

describe('Child AI presentation controller', () => {
  it('starts with grants off and rejects Child-side enablement', () => {
    const controller = createChildVoiceController(createFeature003ServiceRegistry());

    expect(controller.getView()).toEqual(INITIAL_CHILD_VOICE_VIEW);
    expect(
      controller.configureParentPermission({
        actorRole: 'child',
        childId: 'child_salem',
        languagePreference: 'ar',
        enabled: true,
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(controller.bindActiveTask(taskContext)).toMatchObject({
      ok: false,
      error: { code: 'PRIVACY_REJECTED' },
    });
    expect(controller.getView()).toEqual(INITIAL_CHILD_VOICE_VIEW);
  });

  it('uses stored Parent authority and canonical task binding before start', () => {
    const controller = createChildVoiceController(createFeature003ServiceRegistry());
    const permission = expectOk(
      controller.configureParentPermission({
        actorRole: 'parent',
        childId: 'child_salem',
        languagePreference: 'ar',
        enabled: true,
      }),
    );
    expect(permission).toMatchObject({ permissionEnabled: true, lifecycle: 'idle' });

    expect(controller.bindActiveTask({ ...taskContext, taskId: 'task_other' })).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
    const bound = expectOk(controller.bindActiveTask(taskContext));
    expect(bound).toMatchObject({
      permissionEnabled: true,
      availability: 'ready',
      taskId: 'task_recycling_p0_v1',
      approvedTaskVersion: 1,
      lifecycle: 'idle',
    });
    expect(bound).not.toHaveProperty('accessSessionId');
    expect(bound).not.toHaveProperty('permissionVersion');
  });

  it('adapts the prepared Coach from the active Child age band', () => {
    const controller = createChildVoiceController(createFeature003ServiceRegistry());
    const result = expectOk(controller.adaptCoach(taskContext));

    expect(result).toMatchObject({
      ageBand: '9_11',
      policy: {
        maximumSteps: 3,
        quickChoiceLimit: 3,
        pace: 'standard',
        tone: 'friendly_clear',
        adultExitPlacement: 'persistent',
      },
      adultExit: { alwaysVisible: true },
      changesDefinitionOfDone: false,
      origin: 'prepared',
    });
    expect(result.steps).toHaveLength(3);
    expect(result.quickChoices).toHaveLength(3);
  });

  it('runs the complete synthetic rehearsal without exposing authority data', () => {
    const controller = grantedController();

    expectOk(controller.start('child'));
    expect(controller.getView()).toMatchObject({
      availability: 'active',
      lifecycle: 'recording',
      activeIndicatorVisible: true,
    });

    const review = expectOk(controller.stop('child'));
    expect(review).toMatchObject({
      availability: 'review',
      lifecycle: 'transcript_review',
      activeIndicatorVisible: false,
      transcript: PREPARED_VOICE_TRANSCRIPTS.voice_recycling_complete_v1.transcript,
    });

    expectOk(controller.setPlayback('child', { captionsEnabled: false, playbackRate: 0.75 }));
    expectOk(controller.replay('child'));
    expect(controller.getView()).toMatchObject({
      captionsEnabled: false,
      playbackRate: 0.75,
      replayCount: 1,
    });

    const sent = expectOk(controller.send('child'));
    expect(sent).toMatchObject({
      availability: 'sent',
      lifecycle: 'sent',
      transcript: PREPARED_VOICE_TRANSCRIPTS.voice_recycling_complete_v1.transcript,
    });
    expect(sent).not.toHaveProperty('accessSessionId');
    expect(sent).not.toHaveProperty('permissionVersion');
  });

  it('deletes before send and restores the exact task-bound idle view', () => {
    const controller = grantedController();
    expectOk(controller.start('child'));
    expectOk(controller.stop('child'));

    const deleted = expectOk(controller.deleteBeforeSend('child'));
    expect(deleted).toMatchObject({
      permissionEnabled: true,
      availability: 'ready',
      lifecycle: 'idle',
      transcript: null,
      captionsEnabled: true,
      playbackRate: 1,
      replayCount: 0,
      activeIndicatorVisible: false,
      sentAt: null,
    });
    expect(controller.replay('child')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
  });

  it('lets only the Parent clear a completed task binding while keeping the grants', () => {
    const controller = grantedController();
    expectOk(controller.start('child'));
    expectOk(controller.stop('child'));
    expectOk(controller.send('child'));

    expect(controller.clearTaskBinding('child')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(controller.getView().availability).toBe('sent');

    expect(expectOk(controller.clearTaskBinding('parent'))).toMatchObject({
      permissionEnabled: true,
      availability: 'task_required',
      lifecycle: 'idle',
      transcript: null,
      sentAt: null,
    });
  });

  it('changes rendered language without mutating task or voice state', () => {
    const controller = grantedController();
    expectOk(controller.start('child'));
    const review = expectOk(controller.stop('child'));
    expectOk(controller.setPlayback('child', { captionsEnabled: true, playbackRate: 0.75 }));
    expectOk(controller.replay('child'));
    const before = controller.getView();

    expect(localize(review.transcript!, 'ar')).toBe(
      PREPARED_VOICE_TRANSCRIPTS.voice_recycling_complete_v1.transcript.ar,
    );
    expect(localize(review.transcript!, 'en')).toBe(
      PREPARED_VOICE_TRANSCRIPTS.voice_recycling_complete_v1.transcript.en,
    );
    expect(controller.getView()).toEqual(before);
  });

  it.each(['idle', 'recording', 'transcript_review', 'sent'] as const)(
    'resets grants and exact voice state from %s and remains reusable',
    (lifecycle) => {
      const controller = grantedController();
      if (lifecycle !== 'idle') expectOk(controller.start('child'));
      if (lifecycle === 'transcript_review' || lifecycle === 'sent') {
        expectOk(controller.stop('child'));
      }
      if (lifecycle === 'sent') expectOk(controller.send('child'));

      expectOk(controller.resetPrototype('parent'));
      expect(controller.getView()).toEqual(INITIAL_CHILD_VOICE_VIEW);

      expectOk(
        controller.configureParentPermission({
          actorRole: 'parent',
          childId: 'child_salem',
          languagePreference: 'en',
          enabled: true,
        }),
      );
      expectOk(controller.bindActiveTask(taskContext));
      expectOk(controller.start('child'));
      expect(controller.getView().lifecycle).toBe('recording');
    },
  );

  it('restores the Arabic voice preference when reset follows English enablement', () => {
    const controller = createChildVoiceController(createFeature003ServiceRegistry());
    expectOk(
      controller.configureParentPermission({
        actorRole: 'parent',
        childId: 'child_salem',
        languagePreference: 'en',
        enabled: true,
      }),
    );
    expectOk(controller.bindActiveTask(taskContext));

    expectOk(controller.resetPrototype('parent'));
    expect(controller.getView()).toEqual(INITIAL_CHILD_VOICE_VIEW);
  });
});

describe('Child AI presentation store integration', () => {
  beforeEach(() => {
    usePrototypeStore.getState().setRole('parent');
    expectOk(usePrototypeStore.getState().resetPrototype());
  });

  it('keeps Parent permission explicit and rejects a role-only Child grant', () => {
    reviewP0Task();
    usePrototypeStore.getState().setRole('child');

    expect(usePrototypeStore.getState().setChildVoicePermission(true)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState().childVoiceView).toEqual(INITIAL_CHILD_VOICE_VIEW);

    usePrototypeStore.getState().setRole('parent');
    expect(expectOk(usePrototypeStore.getState().setChildVoicePermission(true))).toMatchObject({
      permissionEnabled: true,
      availability: 'task_required',
      lifecycle: 'idle',
    });
  });

  it('preserves voice state across language changes and resets the complete presentation', async () => {
    reviewP0Task();
    expectOk(usePrototypeStore.getState().setChildVoicePermission(true));
    expectOk(usePrototypeStore.getState().approveAssignment());
    usePrototypeStore.getState().setRole('child');
    expectOk(usePrototypeStore.getState().setActiveChild('child_salem'));
    expectOk(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1'));
    expectOk(usePrototypeStore.getState().startAssignment());
    expectOk(usePrototypeStore.getState().prepareChildVoice());

    expectOk(usePrototypeStore.getState().runChildVoiceCommand({ type: 'start' }));
    expectOk(usePrototypeStore.getState().runChildVoiceCommand({ type: 'stop' }));
    expectOk(
      usePrototypeStore.getState().runChildVoiceCommand({
        type: 'playback',
        captionsEnabled: false,
        playbackRate: 0.75,
      }),
    );
    expectOk(usePrototypeStore.getState().runChildVoiceCommand({ type: 'replay' }));
    const voiceBeforeLocaleChange = usePrototypeStore.getState().childVoiceView;

    usePrototypeStore.getState().setLocale('en');
    expect(usePrototypeStore.getState().childVoiceView).toEqual(voiceBeforeLocaleChange);
    usePrototypeStore.getState().setLocale('ar');
    expect(usePrototypeStore.getState().childVoiceView).toEqual(voiceBeforeLocaleChange);

    expectOk(
      await usePrototypeStore.getState().requestChildCoach({
        requestId: 'child-ai-presentation-age-v1',
        intent: 'show_steps',
      }),
    );
    expect(usePrototypeStore.getState().ageAdaptedCoachResult).toMatchObject({
      ageBand: '9_11',
      policy: { maximumSteps: 3, quickChoiceLimit: 3, pace: 'standard' },
      changesDefinitionOfDone: false,
      origin: 'prepared',
    });
    expect(usePrototypeStore.getState().ageAdaptedCoachResult?.steps).toHaveLength(3);

    expectOk(
      usePrototypeStore.getState().submitTask({
        definitionAcknowledged: true,
        completionMode: 'permitted_help',
        helpUsed: {
          ar: 'فحص شخص بالغ المواد وتولى حملها والتخلص منها.',
          en: 'An adult checked, carried, and disposed of the materials.',
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
    expect(usePrototypeStore.getState().runChildVoiceCommand({ type: 'replay' })).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });

    expect(usePrototypeStore.getState().resetPrototype()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState().childVoiceView).toEqual(voiceBeforeLocaleChange);

    usePrototypeStore.getState().setRole('parent');
    expectOk(usePrototypeStore.getState().resetPrototype());
    expect(usePrototypeStore.getState()).toMatchObject({
      locale: 'ar',
      direction: 'rtl',
      role: 'parent',
      ageAdaptedCoachResult: null,
      childVoiceView: INITIAL_CHILD_VOICE_VIEW,
    });
  });

  it('rejects voice and Coach commands when the assignment binding becomes stale', async () => {
    reviewP0Task();
    expectOk(usePrototypeStore.getState().setChildVoicePermission(true));
    expectOk(usePrototypeStore.getState().approveAssignment());
    usePrototypeStore.getState().setRole('child');
    expectOk(usePrototypeStore.getState().setActiveChild('child_salem'));
    expectOk(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1'));
    expectOk(usePrototypeStore.getState().startAssignment());
    expectOk(usePrototypeStore.getState().prepareChildVoice());

    const journey = usePrototypeStore.getState().journey!;
    usePrototypeStore.setState({
      journey: {
        ...journey,
        assignment: { ...journey.assignment!, taskId: 'stale_other_task' },
      },
    });

    expect(usePrototypeStore.getState().prepareChildVoice()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(usePrototypeStore.getState().runChildVoiceCommand({ type: 'start' })).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(
      await usePrototypeStore.getState().requestChildCoach({
        requestId: 'stale-assignment-coach-v1',
        intent: 'show_steps',
      }),
    ).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
  });

  it('clears a sent transcript before a later journey reuses the same task fixture', () => {
    reviewP0Task();
    expectOk(usePrototypeStore.getState().setChildVoicePermission(true));
    expectOk(usePrototypeStore.getState().approveAssignment());
    usePrototypeStore.getState().setRole('child');
    expectOk(usePrototypeStore.getState().setActiveChild('child_salem'));
    expectOk(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1'));
    expectOk(usePrototypeStore.getState().startAssignment());
    expectOk(usePrototypeStore.getState().prepareChildVoice());
    expectOk(usePrototypeStore.getState().runChildVoiceCommand({ type: 'start' }));
    expectOk(usePrototypeStore.getState().runChildVoiceCommand({ type: 'stop' }));
    expectOk(usePrototypeStore.getState().runChildVoiceCommand({ type: 'send' }));
    expect(usePrototypeStore.getState().childVoiceView.availability).toBe('sent');

    usePrototypeStore.getState().setRole('parent');
    reviewP0Task();
    expect(usePrototypeStore.getState().childVoiceView).toMatchObject({
      permissionEnabled: true,
      availability: 'task_required',
      lifecycle: 'idle',
      transcript: null,
      sentAt: null,
    });

    expectOk(usePrototypeStore.getState().approveAssignment());
    usePrototypeStore.getState().setRole('child');
    expectOk(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1'));
    expectOk(usePrototypeStore.getState().startAssignment());
    expect(expectOk(usePrototypeStore.getState().prepareChildVoice())).toMatchObject({
      availability: 'ready',
      lifecycle: 'idle',
      transcript: null,
      sentAt: null,
    });
  });
});

describe('Child AI presentation source contract', () => {
  it('mounts explicit Parent permission and Child language/voice controls on existing routes', () => {
    const parentRoute = readFileSync(
      new URL('../app/parent/task/review.tsx', import.meta.url),
      'utf8',
    );
    const childRoute = readFileSync(new URL('../app/child/task.tsx', import.meta.url), 'utf8');
    const store = readFileSync(
      new URL('../src/state/usePrototypeStore.ts', import.meta.url),
      'utf8',
    );

    expect(parentRoute).toContain('<ParentVoicePermissionPanel');
    expect(parentRoute).toContain('setChildVoicePermission');
    expect(childRoute).toContain('<LanguageSwitcher compact showGuidance={false} />');
    expect(childRoute).toContain('<SyntheticVoicePanel');
    expect(childRoute).toContain('taskSupported={preparedCoachAvailable}');
    expect(childRoute).toContain('ageAdaptedCoachResult');
    expect(childRoute).toContain("{ intent: 'need_adult', key: 'adultExit' }");
    expect(childRoute).not.toContain(
      "{ intent: 'rehearse_reviewed_phrase', key: 'phrasePractice' }",
    );
    expect(store).toContain('childVoiceController.adaptCoach');
    expect(store).toContain('childVoiceController.resetPrototype');
  });

  it('keeps every presentation source free of capture, speech, provider, and network imports', () => {
    const paths = [
      '../src/features/assistants/childVoiceController.ts',
      '../src/components/family-growth/ParentVoicePermissionPanel.tsx',
      '../src/components/family-growth/SyntheticVoicePanel.tsx',
      '../app/parent/task/review.tsx',
      '../app/child/task.tsx',
    ];

    for (const path of paths) {
      const source = readFileSync(new URL(path, import.meta.url), 'utf8');
      expect(source).not.toMatch(
        /from\s+['"][^'"]*(?:audio|microphone|recording|speech|openai|provider|network)[^'"]*['"]/iu,
      );
      expect(source).not.toMatch(/\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/u);
    }
  });

  it('keeps voice copy paired and canonical transcript text out of translation resources', () => {
    const voiceKeys = [
      'title',
      'disclosure',
      'permissionRequired',
      'parentTitle',
      'parentBody',
      'parentSetting',
      'parentEnable',
      'parentDisable',
      'start',
      'stop',
      'reviewTitle',
      'delete',
      'send',
      'captions',
      'slower',
      'standardSpeed',
      'replay',
      'reset',
      'sent',
      'unavailable',
      'taskUnavailable',
    ] as const;
    for (const key of voiceKeys) {
      expect(resources.ar.translation.childVoice[key].trim()).not.toBe('');
      expect(resources.en.translation.childVoice[key].trim()).not.toBe('');
    }
    expect(resources.ar.translation.childVoice.parentBody).toContain('الذكاء الاصطناعي');
    expect(resources.en.translation.childVoice.parentBody).toContain('AI');

    const permissionPanel = readFileSync(
      new URL('../src/components/family-growth/ParentVoicePermissionPanel.tsx', import.meta.url),
      'utf8',
    );
    expect(permissionPanel).toContain("accessibilityLabel={t('childVoice.parentSetting')}");
    expect(permissionPanel).toContain('accessibilityHint={actionLabel}');

    const resourceSource = readFileSync(
      new URL('../src/i18n/resources.ts', import.meta.url),
      'utf8',
    );
    expect(resourceSource).not.toContain(
      PREPARED_VOICE_TRANSCRIPTS.voice_recycling_complete_v1.transcript.ar,
    );
    expect(resourceSource).not.toContain(
      PREPARED_VOICE_TRANSCRIPTS.voice_recycling_complete_v1.transcript.en,
    );
  });
});
