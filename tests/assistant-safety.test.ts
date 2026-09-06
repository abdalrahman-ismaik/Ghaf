import { describe, expect, it } from 'vitest';

import {
  applyLocalSummaryCorrection,
  evaluateAssistantSafety,
  evaluateChildInteraction,
  policyForAgeBand,
  resolveParentGuideFallback,
  validateChildCoachIntent,
  validateChildCoachRequest,
  validateParentGuideIntent,
  validateParentSummary,
} from '../src/features/assistants/policy';
import { validateTaskForReview, validateTaskTemplate } from '../src/features/tasks/validation';
import type {
  ChildCoachRequest,
  LocalizedText,
  ParentGuideRequest,
  Task,
} from '../src/models/familyGrowth';
import {
  CHILD_COACH_FIXTURE,
  PARENT_GUIDE_FIXTURE,
  PARENT_SUMMARY_FIXTURE,
  PREPARED_MEDIA_FIXTURES,
} from '../src/services/mock/fixtures';

const parentIntents = [
  'make_clearer',
  'make_smaller',
  'check_safety',
  'adapt_age',
  'draft_descriptive_praise',
  'summarize_observable_pattern',
  'suggest_parent_question',
] as const;

const childIntents = [
  'simplify_task',
  'show_steps',
  'create_if_then_cue',
  'rehearse_reviewed_phrase',
  'respond_to_prepared_fixture',
  'offer_optional_reflection',
  'need_adult',
] as const;

const parentRequest: ParentGuideRequest = {
  requestId: 'guide-request-1',
  intent: 'make_clearer',
  locale: 'ar',
  child: {
    id: 'child_salem',
    age: 9,
    ageBand: '9_11',
    synthetic: true,
  },
  parentText: {
    ar: 'أخرج مواد إعادة التدوير.',
    en: 'Take the recycling out.',
  },
  taskTemplateId: 'task_recycling_p0_v1',
  taskVersion: 1,
  allowedCategoryId: 'green_impact',
  allowedSafety: PARENT_GUIDE_FIXTURE.suggestedContent.safety,
  inputOrigin: 'synthetic',
};

const childRequest: ChildCoachRequest = {
  requestId: 'coach-request-1',
  intent: 'show_steps',
  locale: 'ar',
  child: {
    id: 'child_salem',
    ageBand: '9_11',
    synthetic: true,
  },
  assignmentId: 'assignment_recycling_p0_v1',
  taskId: 'task_recycling_p0_v1',
  approvedTaskVersion: 1,
  lifecycle: 'in_progress',
  fixtureId: null,
  templateSelection: 'show_steps',
};

const activeCoachContext = {
  activeChildId: 'child_salem' as const,
  assignmentId: 'assignment_recycling_p0_v1',
  taskId: 'task_recycling_p0_v1',
  approvedTaskVersion: 1,
  lifecycle: 'in_progress' as const,
  approvedByParent: true as const,
};

function localized(en: string, ar = 'نص آمن للاختبار'): LocalizedText {
  return { ar, en };
}

function retainedP0Task(positiveAction: LocalizedText): Task {
  return {
    id: PARENT_GUIDE_FIXTURE.suggestedContent.id,
    version: 1,
    templateId: PARENT_GUIDE_FIXTURE.suggestedContent.id,
    targetChildId: 'child_salem',
    parentOriginalText: positiveAction,
    acceptedGuideFixtureId: null,
    content: {
      ...PARENT_GUIDE_FIXTURE.suggestedContent,
      positiveAction,
    },
    origin: 'synthetic',
  };
}

describe('bounded assistant intent and age policy', () => {
  it('accepts every allowlisted intent and rejects chat or analysis intents', () => {
    for (const intent of parentIntents) {
      expect(validateParentGuideIntent(intent)).toMatchObject({ ok: true, data: intent });
    }
    for (const intent of childIntents) {
      expect(validateChildCoachIntent(intent)).toMatchObject({ ok: true, data: intent });
    }

    for (const intent of ['chat', 'analyze_child', 'diagnose', 'score', 'keep_talking']) {
      expect(validateParentGuideIntent(intent)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_INPUT' },
      });
      expect(validateChildCoachIntent(intent)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_INPUT' },
      });
    }
  });

  it('defines the three age-band policies without unrestricted chat', () => {
    expect(policyForAgeBand('6_8')).toEqual({
      ageBand: '6_8',
      inputMode: 'curated_intents_only',
      freeTextAllowed: false,
      pushToTalkAllowed: false,
      unrestrictedChatAllowed: false,
    });
    expect(policyForAgeBand('9_11')).toEqual({
      ageBand: '9_11',
      inputMode: 'structured_template',
      freeTextAllowed: false,
      pushToTalkAllowed: false,
      unrestrictedChatAllowed: false,
    });
    expect(policyForAgeBand('12_14')).toEqual({
      ageBand: '12_14',
      inputMode: 'guardian_enabled_bounded',
      freeTextAllowed: true,
      pushToTalkAllowed: true,
      unrestrictedChatAllowed: false,
    });
  });

  it.each([
    ['6_8', 'curated_intent', false, true, 'none'],
    ['6_8', 'structured_template', false, false, 'wrong_input_mode'],
    ['6_8', 'bounded_text', true, false, 'wrong_input_mode'],
    ['6_8', 'push_to_talk', true, false, 'wrong_input_mode'],
    ['9_11', 'curated_intent', false, true, 'none'],
    ['9_11', 'structured_template', false, true, 'none'],
    ['9_11', 'bounded_text', true, false, 'wrong_input_mode'],
    ['9_11', 'push_to_talk', true, false, 'wrong_input_mode'],
    ['12_14', 'curated_intent', false, true, 'none'],
    ['12_14', 'structured_template', false, true, 'none'],
    ['12_14', 'bounded_text', false, false, 'guardian_enablement_required'],
    ['12_14', 'push_to_talk', false, false, 'guardian_enablement_required'],
    ['12_14', 'bounded_text', true, true, 'none'],
    ['12_14', 'push_to_talk', true, true, 'none'],
  ] as const)(
    'evaluates %s %s with guardianEnabled=%s',
    (ageBand, attempt, guardianEnabled, allowed, rejectedFor) => {
      expect(evaluateChildInteraction({ ageBand, attempt, guardianEnabled })).toMatchObject({
        allowed,
        rejectedFor,
        policy: { ageBand, unrestrictedChatAllowed: false },
      });
    },
  );

  it.each(['6_8', '9_11', '12_14'] as const)(
    'rejects unrestricted chat for %s even with guardian enablement',
    (ageBand) => {
      expect(
        evaluateChildInteraction({
          ageBand,
          attempt: 'unrestricted_chat',
          guardianEnabled: true,
        }),
      ).toMatchObject({
        allowed: false,
        rejectedFor: 'unrestricted_chat_prohibited',
      });
    },
  );

  it('limits P0 Coach requests to 9_11 and the active approved task/version', () => {
    expect(validateChildCoachRequest(childRequest, activeCoachContext)).toMatchObject({ ok: true });

    for (const patch of [
      { child: { ...childRequest.child, ageBand: '6_8' } },
      { child: { ...childRequest.child, ageBand: '12_14' } },
      { child: { ...childRequest.child, id: 'child_alya' } },
      { assignmentId: 'wrong-assignment' },
      { taskId: 'wrong-task' },
      { approvedTaskVersion: 2 },
      { lifecycle: 'submitted' },
    ]) {
      expect(
        validateChildCoachRequest({ ...childRequest, ...patch }, activeCoachContext),
      ).toMatchObject({ ok: false });
    }

    expect(
      validateChildCoachRequest(childRequest, {
        ...activeCoachContext,
        approvedByParent: false,
      }),
    ).toMatchObject({ ok: false });
  });
});

describe('assistant safety and deterministic fallback', () => {
  it.each([
    ['normality_or_character_judgment', 'Salem is a lazy child.'],
    ['diagnosis_or_condition_inference', 'This proves Salem has ADHD.'],
    ['emotion_personality_or_risk_score', 'His anxiety risk score is 80%.'],
    ['truthfulness_or_deception_judgment', 'Salem is lying about the task.'],
    ['religious_judgment', 'This proves his prayer is invalid.'],
    ['parenting_or_family_quality_judgment', 'This is bad parenting.'],
    ['food_safety_or_medical_decision', 'This food is safe to eat.'],
    ['hazardous_child_instruction', 'Pick up the broken glass yourself.'],
    ['secret_or_exclusivity_request', 'Keep this secret from your Parent.'],
    ['attachment_or_dependency_language', 'I am your special friend and you need me.'],
    ['continued_conversation_lure', 'Stay here and keep talking to me.'],
    ['face_voice_or_biometric_inference', 'I can identify you from your voice.'],
    ['cross_household_private_content', 'Share the Child reflection with every family.'],
    ['hazardous_child_instruction', 'Carry the glass and batteries to the bin yourself.'],
  ] as const)('rejects %s', (reason, en) => {
    expect(
      evaluateAssistantSafety({
        audience: 'child',
        texts: [localized(en)],
      }),
    ).toMatchObject({
      accepted: false,
      value: null,
      rejectedFor: expect.arrayContaining([reason]),
    });
  });

  it.each([
    ['emotion_personality_or_risk_score', 'Salem feels anxious.', 'Salem appears worried.'],
    ['truthfulness_or_deception_judgment', 'Salem is dishonest.', 'Salem cannot be trusted.'],
    ['religious_judgment', 'Salem lacks faith.', 'Salem has no faith.'],
    [
      'parenting_or_family_quality_judgment',
      'Your family is dysfunctional.',
      'This is a broken family.',
    ],
  ] as const)('rejects Parent-summary %s variants', (reason, ...variants) => {
    for (const en of variants) {
      expect(
        evaluateAssistantSafety({
          audience: 'parent',
          texts: [localized(en)],
        }),
      ).toMatchObject({
        accepted: false,
        value: null,
        rejectedFor: expect.arrayContaining([reason]),
      });
    }
  });

  it.each([
    [
      'secret_or_exclusivity_request',
      'You should keep that between us.',
      'This stays between you and me.',
      'Do not tell anyone about this.',
    ],
    [
      'emotion_personality_or_risk_score',
      'Tell me how you feel.',
      'Share your feelings with me.',
      'Describe your emotions to me.',
    ],
  ] as const)('rejects Child-Coach %s variants', (reason, ...variants) => {
    for (const en of variants) {
      expect(
        evaluateAssistantSafety({
          audience: 'child',
          texts: [localized(en)],
        }),
      ).toMatchObject({
        accepted: false,
        value: null,
        rejectedFor: expect.arrayContaining([reason]),
      });
    }
  });

  it.each([
    ['parent', 'Salem is dishonest.', 'سالم غير صادق.'],
    ['parent', 'Salem lacks faith.', 'سالم يفتقر إلى الإيمان.'],
    ['parent', 'Your family is dysfunctional.', 'أسرتك مختلة.'],
    ['child', 'You should keep that between us.', 'يجب أن تحتفظ بهذا بيننا.'],
    ['child', 'Tell me how you feel.', 'أخبرني كيف تشعر.'],
  ] as const)('rejects bilingual %s safety variants: %s', (audience, en, ar) => {
    expect(
      evaluateAssistantSafety({
        audience,
        texts: [{ en, ar }],
      }),
    ).toMatchObject({ accepted: false, value: null });
  });

  it.each([
    ['truthfulness_or_deception_judgment', 'Salem is a liar.', 'سالم غير جدير بالثقة.'],
    ['emotion_personality_or_risk_score', 'Salem is nervous.', 'سالم متوتر.'],
    ['parenting_or_family_quality_judgment', 'Your parenting is terrible.', 'تربيتك فظيعة.'],
    ['religious_judgment', 'Salem has deficient faith.', 'إيمان سالم ناقص.'],
  ] as const)(
    'rejects %s variants across Parent, Child, Arabic, and local-summary paths',
    (reason, en, ar) => {
      for (const audience of ['parent', 'child'] as const) {
        expect(
          evaluateAssistantSafety({
            audience,
            texts: [localized(en)],
          }),
        ).toMatchObject({
          accepted: false,
          value: null,
          rejectedFor: expect.arrayContaining([reason]),
        });
      }

      expect(
        evaluateAssistantSafety({
          audience: 'parent',
          texts: [localized('Salem completed one approved recycling step.', ar)],
        }),
      ).toMatchObject({
        accepted: false,
        value: null,
        rejectedFor: expect.arrayContaining([reason]),
      });

      expect(
        applyLocalSummaryCorrection(PARENT_SUMMARY_FIXTURE, {
          operation: 'replace_fact',
          factIndex: 0,
          correctedFact: localized(en),
        }),
      ).toMatchObject({
        ok: true,
        data: {
          disposition: 'rejected',
          summary: PARENT_SUMMARY_FIXTURE,
          rejectedFor: expect.arrayContaining(['prohibited_language']),
        },
      });
    },
  );

  it('preserves bounded task-focused reflection and trusted-adult help', () => {
    expect(
      evaluateAssistantSafety({
        audience: 'child',
        texts: [
          localized('Which approved recycling step felt easiest? You may skip this question.'),
          localized('Stop and ask an adult if an item is sharp, leaking, dirty, or unknown.'),
        ],
      }),
    ).toMatchObject({ accepted: true, rejectedFor: [] });

    expect(
      evaluateAssistantSafety({
        audience: 'parent',
        texts: [localized('Ask Salem which recycling step felt easiest and let him skip it.')],
      }),
    ).toMatchObject({ accepted: true, rejectedFor: [] });
  });

  it('rejects a hazardous Guide/custom instruction that contradicts unchanged safe metadata', () => {
    const hazardousSuggestion = {
      ...PARENT_GUIDE_FIXTURE.suggestedContent,
      positiveAction: {
        ar: 'احمل الزجاج والبطاريات إلى الحاوية بنفسك.',
        en: 'Carry the glass and batteries to the bin yourself.',
      },
    };

    expect(validateTaskTemplate(hazardousSuggestion)).toMatchObject({
      ok: false,
      error: { code: 'SAFETY_REJECTED' },
    });

    expect(
      validateTaskTemplate({
        ...PARENT_GUIDE_FIXTURE.suggestedContent,
        positiveAction: {
          ar: 'اجمع الزجاج المكسور والبطاريات ثم ضعها في الحاوية.',
          en: 'Collect broken glass and batteries, then place them in the bin.',
        },
      }),
    ).toMatchObject({
      ok: false,
      error: { code: 'SAFETY_REJECTED' },
    });
  });

  it.each([
    {
      ar: 'اجمع المواد الفاسدة والأكياس المتسربة وضعها في الحاوية.',
      en: 'Collect the spoiled material and leaking bags and put them in the bin.',
    },
    {
      ar: 'احمل كيس إعادة التدوير إلى الحاوية بينما يمشي شخص بالغ معك.',
      en: 'Carry the recycling bag to the bin while an adult walks with you.',
    },
    {
      ar: 'اجمع النفايات المنزلية العامة وضعها في الكيس.',
      en: 'Collect general household waste and put it in the bag.',
    },
  ])('rejects an out-of-bound retained P0 recycling action: $en', (positiveAction) => {
    expect(validateTaskForReview(retainedP0Task(positiveAction))).toMatchObject({
      ok: false,
      error: { code: 'SAFETY_REJECTED' },
    });
  });

  it('admits only the bounded retained-parent grammar or the exact reviewed Guide action for P0', () => {
    const boundedParentAction = {
      ar: 'افرز الورق والبلاستيك النظيفين اللذين وافق عليهما شخص بالغ، وتوقف واسأل شخصاً بالغاً عند الشك.',
      en: 'Sort the clean paper and plastic approved by an adult, and stop to ask an adult when unsure.',
    };
    expect(validateTaskForReview(retainedP0Task(boundedParentAction))).toMatchObject({ ok: true });

    const guidedTask: Task = {
      ...retainedP0Task(PARENT_GUIDE_FIXTURE.suggestedContent.positiveAction),
      parentOriginalText: PARENT_GUIDE_FIXTURE.originalParentText,
      acceptedGuideFixtureId: 'guide_recycling_refine_v1',
    };
    expect(validateTaskForReview(guidedTask)).toMatchObject({ ok: true });
    expect(
      validateTaskForReview({
        ...guidedTask,
        content: { ...guidedTask.content, positiveAction: boundedParentAction },
      }),
    ).toMatchObject({ ok: false, error: { code: 'SAFETY_REJECTED' } });
  });

  it('rejects character-label praise appended to an observable action without blocking responsible action wording', () => {
    expect(
      evaluateAssistantSafety({
        audience: 'parent',
        texts: [
          {
            ar: 'فرزت الورق—يا لك من طفل مسؤول!',
            en: 'You sorted the paper—such a responsible child!',
          },
        ],
      }),
    ).toMatchObject({
      accepted: false,
      value: null,
      rejectedFor: expect.arrayContaining(['normality_or_character_judgment']),
    });

    expect(
      evaluateAssistantSafety({
        audience: 'parent',
        texts: [
          {
            ar: 'فرزت الورق بمسؤولية وطلبت المساعدة عند الحاجة.',
            en: 'You sorted the paper responsibly and asked for help when needed.',
          },
        ],
      }),
    ).toMatchObject({ accepted: true, rejectedFor: [] });
  });

  it('accepts the reviewed prepared Coach while preserving its task boundary and disclosure', () => {
    expect(
      evaluateAssistantSafety({
        audience: 'child',
        texts: [
          ...CHILD_COACH_FIXTURE.steps,
          CHILD_COACH_FIXTURE.ifThenCue,
          CHILD_COACH_FIXTURE.adultExit.label,
          CHILD_COACH_FIXTURE.meta.disclosure.text,
        ],
      }),
    ).toMatchObject({ accepted: true, rejectedFor: [] });
    expect(CHILD_COACH_FIXTURE).toMatchObject({
      taskId: 'task_recycling_p0_v1',
      approvedTaskVersion: 1,
      changesDefinitionOfDone: false,
      meta: {
        audience: 'child',
        origin: 'prepared',
        fixtureId: 'coach_recycling_steps_v1',
        fallbackUsed: false,
        disclosure: { saysAiMayBeWrong: true, preparedIsExplicit: true },
      },
      adultExit: { alwaysVisible: true },
    });
  });

  it.each([
    ['timeout', 'timeout'],
    ['remote_failure', 'remote_failure'],
    ['malformed_response', 'malformed_response'],
    ['safety_rejected', 'safety_rejected'],
  ] as const)('returns a same-attempt prepared result for %s', (failureReason, expectedReason) => {
    const resolved = resolveParentGuideFallback({
      request: parentRequest,
      failureReason,
      preparedSuggestion: PARENT_GUIDE_FIXTURE,
    });

    expect(resolved).toMatchObject({
      ok: true,
      data: {
        originalParentText: parentRequest.parentText,
        accepted: false,
        meta: {
          requestId: parentRequest.requestId,
          audience: 'parent',
          origin: 'prepared',
          fixtureId: 'guide_recycling_refine_v1',
          fallbackUsed: true,
          fallbackReason: expectedReason,
          disclosure: {
            saysAiMayBeWrong: true,
            saysHumanDecides: true,
            preparedIsExplicit: true,
          },
        },
      },
    });
    expect(parentRequest.parentText).toEqual({
      ar: 'أخرج مواد إعادة التدوير.',
      en: 'Take the recycling out.',
    });
  });

  it('keeps media optional and provides accessible missing-file fallbacks', () => {
    expect(PREPARED_MEDIA_FIXTURES).toHaveLength(2);
    for (const fixture of PREPARED_MEDIA_FIXTURES) {
      expect(fixture).toMatchObject({
        origin: 'prepared',
        synthetic: true,
        optional: true,
        crossHouseholdSharing: false,
        removeAllowed: true,
      });
      expect(fixture.fallbackText.ar.trim().length).toBeGreaterThan(0);
      expect(fixture.fallbackText.en.trim().length).toBeGreaterThan(0);
      expect(fixture.parentVisibilityNotice.ar.trim().length).toBeGreaterThan(0);
      expect(fixture.parentVisibilityNotice.en.trim().length).toBeGreaterThan(0);
      if (fixture.kind === 'audio') {
        expect(fixture.transcript?.ar.trim().length).toBeGreaterThan(0);
        expect(fixture.transcript?.en.trim().length).toBeGreaterThan(0);
      } else {
        expect(fixture.accessibleDescription.ar.trim().length).toBeGreaterThan(0);
        expect(fixture.accessibleDescription.en.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

describe('correctable, non-diagnostic Parent summary', () => {
  it('accepts the prepared seven-day summary and one bounded local fact replacement', () => {
    expect(validateParentSummary(PARENT_SUMMARY_FIXTURE)).toMatchObject({ ok: true });

    const before = structuredClone(PARENT_SUMMARY_FIXTURE);
    const correctedFact = {
      ar: 'أكمل سالم خطوة فرز واحدة وطلب مساعدة شخص بالغ قبل المتابعة.',
      en: 'Salem completed one sorting step and asked an adult before continuing.',
    };
    const result = applyLocalSummaryCorrection(PARENT_SUMMARY_FIXTURE, {
      operation: 'replace_fact',
      factIndex: 0,
      correctedFact,
    });

    expect(result).toMatchObject({
      ok: true,
      data: {
        disposition: 'applied',
        summary: {
          observableFacts: [correctedFact],
          timeWindow: PARENT_SUMMARY_FIXTURE.timeWindow,
          questionForChild: PARENT_SUMMARY_FIXTURE.questionForChild,
          possibleAdjustment: PARENT_SUMMARY_FIXTURE.possibleAdjustment,
          dataOrigin: 'synthetic',
          localCorrection: { applied: true, operation: 'replace_fact', factIndex: 0 },
        },
        rejectedFor: [],
      },
    });
    expect(PARENT_SUMMARY_FIXTURE).toEqual(before);
  });

  it.each([
    'Salem is lazy.',
    'Salem has ADHD.',
    'Salem has a high anxiety risk score.',
    'Salem feels anxious.',
    'Salem is lying.',
    'Salem is dishonest.',
    'Salem is not sincere in prayer.',
    'Salem lacks faith.',
    'This shows poor parenting.',
    'Your family is dysfunctional.',
  ])('rejects a prohibited correction and retains the last safe summary: %s', (en) => {
    const result = applyLocalSummaryCorrection(PARENT_SUMMARY_FIXTURE, {
      operation: 'replace_fact',
      factIndex: 0,
      correctedFact: localized(en),
    });

    expect(result).toMatchObject({
      ok: true,
      data: {
        disposition: 'rejected',
        summary: PARENT_SUMMARY_FIXTURE,
        rejectedFor: expect.arrayContaining(['prohibited_language']),
      },
    });
  });

  it.each([
    {
      ar: 'سالم لديه توحد.',
      en: 'Salem has autism.',
    },
    {
      ar: 'سالم لديه عسر القراءة.',
      en: 'Salem has dyslexia.',
    },
    {
      ar: 'سالم لديه أداء تنفيذي استثنائي.',
      en: 'Salem has exceptional executive function.',
    },
  ])('rejects condition conclusions without relying on a named-condition denylist', (fact) => {
    expect(
      applyLocalSummaryCorrection(PARENT_SUMMARY_FIXTURE, {
        operation: 'replace_fact',
        factIndex: 0,
        correctedFact: fact,
      }),
    ).toMatchObject({
      ok: true,
      data: {
        disposition: 'rejected',
        summary: PARENT_SUMMARY_FIXTURE,
        rejectedFor: expect.arrayContaining(['not_observable_fact']),
      },
    });
  });

  it('rejects a condition conclusion embedded after an otherwise observable action', () => {
    expect(
      applyLocalSummaryCorrection(PARENT_SUMMARY_FIXTURE, {
        operation: 'replace_fact',
        factIndex: 0,
        correctedFact: {
          ar: 'أكمل سالم خطوة فرز رغم التوحد.',
          en: 'Salem completed one sorting step despite autism.',
        },
      }),
    ).toMatchObject({
      ok: true,
      data: {
        disposition: 'rejected',
        summary: PARENT_SUMMARY_FIXTURE,
        rejectedFor: expect.arrayContaining(['not_observable_fact']),
      },
    });

    expect(
      applyLocalSummaryCorrection(PARENT_SUMMARY_FIXTURE, {
        operation: 'replace_fact',
        factIndex: 0,
        correctedFact: {
          ar: 'أكمل سالم خطوة فرز واحدة، مما يؤكد وجود تأخر نمائي.',
          en: 'Salem completed one sorting step, confirming a developmental delay.',
        },
      }),
    ).toMatchObject({
      ok: true,
      data: {
        disposition: 'rejected',
        summary: PARENT_SUMMARY_FIXTURE,
        rejectedFor: expect.arrayContaining(['prohibited_language']),
      },
    });
  });

  it.each([
    {
      ar: 'أكمل سالم خطوة فرز واحدة، مما يثبت موهبته.',
      en: 'Salem completed one sorting step, proving giftedness.',
    },
    {
      ar: 'أكمل سالم خطوة فرز واحدة، مما يؤكد انخفاض ذكائه.',
      en: 'Salem completed one sorting step, confirming low intelligence.',
    },
  ])('rejects every unreviewed conclusion appended to an observable fact: $en', (correctedFact) => {
    expect(
      applyLocalSummaryCorrection(PARENT_SUMMARY_FIXTURE, {
        operation: 'replace_fact',
        factIndex: 0,
        correctedFact,
      }),
    ).toMatchObject({
      ok: true,
      data: {
        disposition: 'rejected',
        summary: PARENT_SUMMARY_FIXTURE,
        rejectedFor: expect.arrayContaining(['not_observable_fact']),
      },
    });
  });

  it('strictly rejects free-form/unknown correction fields and an empty fact list', () => {
    expect(
      applyLocalSummaryCorrection(PARENT_SUMMARY_FIXTURE, {
        operation: 'replace_fact',
        factIndex: 0,
        correctedFact: localized('Salem completed one reviewed recycling step.'),
        chatPrompt: 'Analyze this Child',
      }),
    ).toMatchObject({
      ok: true,
      data: { disposition: 'rejected', rejectedFor: expect.arrayContaining(['invalid_shape']) },
    });

    const oneFactSummary = {
      ...PARENT_SUMMARY_FIXTURE,
      observableFacts: [PARENT_SUMMARY_FIXTURE.observableFacts[0]],
    };
    expect(
      applyLocalSummaryCorrection(oneFactSummary, {
        operation: 'remove_fact',
        factIndex: 0,
      }),
    ).toMatchObject({
      ok: true,
      data: {
        disposition: 'rejected',
        rejectedFor: expect.arrayContaining(['would_remove_all_facts']),
      },
    });
  });
});
