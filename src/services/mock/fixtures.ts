import {
  P0_EXECUTABLE_CHOICE,
  P0_RECYCLING_TEMPLATE,
  RESET_PREVIEW_CHOICES,
  SYNTHETIC_CHILDREN,
  SYNTHETIC_HOUSEHOLD,
} from '../../features/tasks/demoContent';
import { PREPARED_COACH_MATERIALS } from '../../features/assistants/preparedContent';
import type {
  ChildCoachResult,
  ChildTaskDraftState,
  ParentGuideTaskSuggestion,
  ParentPatternSummary,
  PreparedMediaFixture,
  PrototypeSession as FamilyGrowthPrototypeSession,
  RecognitionReceipt,
  TaskJourney,
} from '../../models/familyGrowth';

export const FEATURE_003_TIMESTAMP = '2026-08-26T09:00:00.000Z';

const preparedGuideDisclosure = {
  text: {
    ar: 'مثال مُعدّ مسبقاً لمساعد بالذكاء الاصطناعي. قد تكون الاستجابة غير صحيحة، ووليّ الأمر هو صاحب القرار.',
    en: 'Prepared AI example. AI can be wrong; the Parent decides.',
  },
  saysAiMayBeWrong: true,
  saysHumanDecides: true,
  preparedIsExplicit: true,
} as const;

const preparedCoachMaterial = PREPARED_COACH_MATERIALS.coach_recycling_steps_v1;

const preparedCoachDisclosure = {
  text: preparedCoachMaterial.aiDisclosure,
  saysAiMayBeWrong: true,
  saysHumanDecides: false,
  preparedIsExplicit: true,
} as const;

export const PARENT_GUIDE_FIXTURE: ParentGuideTaskSuggestion = {
  meta: {
    requestId: 'guide_request_fixture_v1',
    audience: 'parent',
    origin: 'prepared',
    fixtureId: 'guide_recycling_refine_v1',
    fallbackUsed: false,
    fallbackReason: null,
    disclosure: preparedGuideDisclosure,
  },
  originalParentText: {
    ar: 'أخرج مواد إعادة التدوير.',
    en: 'Take the recycling out.',
  },
  suggestedContent: P0_RECYCLING_TEMPLATE,
  changedFields: [
    'positiveAction',
    'whyItMatters',
    'definitionOfDone',
    'estimatedEffort',
    'permittedHelp',
    'supervision',
    'safety',
  ],
  availableActions: ['accept_suggestion', 'keep_mine', 'make_smaller'],
  accepted: false,
};

export const CHILD_COACH_FIXTURE: ChildCoachResult = {
  meta: {
    requestId: 'coach_request_fixture_v1',
    audience: 'child',
    origin: 'prepared',
    fixtureId: 'coach_recycling_steps_v1',
    fallbackUsed: false,
    fallbackReason: null,
    disclosure: preparedCoachDisclosure,
  },
  taskId: preparedCoachMaterial.taskId,
  approvedTaskVersion: preparedCoachMaterial.approvedTaskVersion,
  steps: preparedCoachMaterial.steps,
  ifThenCue: {
    ar: 'بعد أن يفحص الشخص البالغ المواد، أفرز المواد النظيفة القابلة لإعادة التدوير.',
    en: 'After the adult checks the items, I sort the clean recyclables.',
  },
  optionalReflection: {
    ar: 'أي خطوة ساعدتك على إبقاء المهمة آمنة؟ يمكنك تخطي هذا السؤال.',
    en: 'Which step helped keep the task safe? You can skip this question.',
  },
  adultExit: {
    label: preparedCoachMaterial.adultExit,
    alwaysVisible: true,
  },
  changesDefinitionOfDone: false,
};

export const PREPARED_PRAISE = {
  ar: 'لقد فرزت المواد النظيفة القابلة لإعادة التدوير وسألت قبل الذهاب إلى الحاوية؛ وهذا جعل المهمة أكثر أماناً وساعد أسرتنا.',
  en: 'You sorted the clean recyclables and asked before going to the bin—that kept the job safe and helped our household.',
} as const;

export const PARENT_SUMMARY_FIXTURE: ParentPatternSummary = {
  meta: {
    requestId: 'parent_summary_fixture_v1',
    audience: 'parent',
    origin: 'prepared',
    fixtureId: 'parent_summary_week_v1',
    fallbackUsed: false,
    fallbackReason: null,
    disclosure: preparedGuideDisclosure,
  },
  timeWindow: { ar: 'خلال هذا الأسبوع', en: 'This week' },
  strengthsFirst: {
    ar: 'بدأ سالم بخطوات واضحة للأثر الأخضر، وكان طلب المساعدة قبل المتابعة خياراً آمناً.',
    en: 'Salem began with clear Green Impact steps, and asking for help before continuing was a safe choice.',
  },
  observableFacts: [
    {
      ar: 'أكمل سالم خطوتين من مهام الأثر الأخضر باستقلالية، وطلب مساعدة شخص بالغ مرة واحدة.',
      en: 'Salem independently completed two Green Impact steps and asked for adult help once.',
    },
  ],
  uncertainty: {
    ar: 'السجل الحالي اصطناعي ومحدود، ولا يوضّح سبب تأجيل مهمة أخرى.',
    en: 'The current record is synthetic and limited; it does not show why another task was postponed.',
  },
  questionForChild: {
    ar: 'اسأل سالم: أي خطوة بدت أسهل؟',
    en: 'Ask Salem: which step felt easiest?',
  },
  possibleAdjustment: {
    ar: 'اسأل ما إذا كان من الأفضل إبقاء المهمة التالية بالحجم نفسه.',
    en: 'Ask whether the next task should stay the same size.',
  },
  parentCorrectable: true,
  dataOrigin: 'synthetic',
  localCorrection: { applied: false, operation: null, factIndex: null },
};

export const PREPARED_MEDIA_FIXTURES: readonly PreparedMediaFixture[] = [
  {
    id: 'fixture_recycling_clean_v1',
    kind: 'image',
    origin: 'prepared',
    synthetic: true,
    optional: true,
    uri: 'asset:fixture-recycling-clean-v1',
    accessibleDescription: {
      ar: 'صورة اصطناعية مُعدّة لورق وبلاستيك نظيفين وسليمين وغير حادّين على سطح محايد، من دون طفل أو وجه أو يد أو علامة تجارية.',
      en: 'Prepared synthetic image of intact, non-sharp clean paper and plastic on a neutral surface, with no Child, face, hand, or brand.',
    },
    transcript: null,
    parentVisibilityNotice: {
      ar: 'يمكن لوليّ الأمر رؤية هذه الصورة الاختيارية؛ ولا تتم مشاركتها مع أسر أخرى.',
      en: 'The Parent can see this optional image; it is never shared with other households.',
    },
    crossHouseholdSharing: false,
    removeAllowed: true,
    fallbackText: {
      ar: 'الصورة المُعدّة غير متاحة؛ استخدم وصف المواد النظيفة وتابع من دون صورة.',
      en: 'The prepared image is unavailable; use the clean-material description and continue without an image.',
    },
  },
  {
    id: 'fixture_salem_plan_ar_v1',
    kind: 'audio',
    origin: 'prepared',
    synthetic: true,
    optional: true,
    uri: null,
    accessibleDescription: {
      ar: 'تسجيل صوتي اصطناعي مُعدّ لخطة المهمة.',
      en: 'Prepared synthetic audio for the task plan.',
    },
    transcript: {
      ar: 'بعد أن يفحص الشخص البالغ المواد، أفرز المواد النظيفة القابلة لإعادة التدوير.',
      en: 'After the adult checks the items, I sort the clean recyclables.',
    },
    parentVisibilityNotice: {
      ar: 'يمكن لوليّ الأمر رؤية النص المكتوب لهذا الصوت الاختياري؛ ولا تتم مشاركته مع أسر أخرى.',
      en: 'The Parent can see the transcript for this optional audio; it is never shared with other households.',
    },
    crossHouseholdSharing: false,
    removeAllowed: true,
    fallbackText: {
      ar: 'ملف الصوت غير متاح؛ استخدم النص المكتوب المُعدّ وتابع من دون طلب إذن الميكروفون.',
      en: 'The audio file is unavailable; use the prepared transcript and continue without microphone permission.',
    },
  },
];

function cloneP0TaskJourney(lifecycle: TaskJourney['lifecycle']): TaskJourney {
  const task = {
    id: 'task_recycling_p0_v1',
    version: 1,
    templateId: 'task_recycling_p0_v1',
    targetChildId: 'child_salem' as const,
    parentOriginalText: {
      ar: 'أخرج مواد إعادة التدوير.',
      en: 'Take the recycling out.',
    },
    acceptedGuideFixtureId:
      lifecycle === 'draft' ? null : ('guide_recycling_refine_v1' as string | null),
    content: P0_RECYCLING_TEMPLATE,
    origin: 'synthetic' as const,
  };

  const needsAssignment = !['draft', 'reviewed'].includes(lifecycle);
  const assignment = needsAssignment
    ? {
        id: 'assignment_recycling_p0_v1',
        taskId: task.id,
        taskVersion: task.version,
        childId: 'child_salem' as const,
        approvedByParent: true as const,
        approvalSequence: 1,
        createdAt: FEATURE_003_TIMESTAMP,
      }
    : null;
  const needsSubmission = ['submitted', 'retry', 'confirmed', 'recognized'].includes(lifecycle);
  const submission =
    needsSubmission && assignment
      ? {
          id: 'submission_recycling_p0_v1_attempt_1',
          assignmentId: assignment.id,
          taskVersion: 1,
          attempt: 1,
          definitionAcknowledged: true as const,
          completionMode: 'permitted_help' as const,
          helpUsed: {
            ar: 'فحص شخص بالغ المواد وحمل الكيس وتولى التخلّص منه.',
            en: 'An adult checked the items, carried the bag, and handled disposal.',
          },
          preparedMediaFixtureId: null,
          reflection: null,
          observableFacts: [
            {
              ar: 'فرز سالم الورق والبلاستيك النظيفين اللذين وافق عليهما شخص بالغ.',
              en: 'Salem sorted the clean paper and plastic approved by an adult.',
            },
          ],
          submittedAt: '2026-08-26T09:30:00.000Z',
        }
      : null;

  const checkIn =
    lifecycle === 'retry' && submission
      ? {
          id: 'checkin_recycling_p0_v1_attempt_1',
          submissionId: submission.id,
          decision: 'kind_retry' as const,
          praise: null,
          neutralObservation: {
            ar: 'نحتاج إلى محاولة أخرى بخطوة أصغر.',
            en: 'We need another try with a smaller step.',
          },
          uncertainty: null,
          replacementTaskId: null,
          recognitionKey: null,
          confirmationPresentation: null,
          praisePresentedAt: null,
          createdAt: '2026-08-26T09:35:00.000Z',
        }
      : (lifecycle === 'confirmed' || lifecycle === 'recognized') && submission
        ? {
            id: 'checkin_recycling_p0_v1_attempt_1',
            submissionId: submission.id,
            decision: 'confirm' as const,
            praise: PREPARED_PRAISE,
            neutralObservation: null,
            uncertainty: null,
            replacementTaskId: null,
            recognitionKey: `recognition:${submission.id}`,
            confirmationPresentation:
              lifecycle === 'recognized'
                ? ('recognition_applied' as const)
                : ('editing_praise' as const),
            praisePresentedAt: lifecycle === 'recognized' ? '2026-08-26T09:40:00.000Z' : null,
            createdAt: '2026-08-26T09:38:00.000Z',
          }
        : null;

  return { lifecycle, task, assignment, submission, checkIn };
}

export function createInitialPrototypeSession(): FamilyGrowthPrototypeSession {
  return {
    schemaVersion: 3,
    locale: 'ar',
    direction: 'rtl',
    role: 'parent',
    household: {
      ...SYNTHETIC_HOUSEHOLD,
      displayName: { ...SYNTHETIC_HOUSEHOLD.displayName },
      childIds: [...SYNTHETIC_HOUSEHOLD.childIds],
      combinedCanopy: { ...SYNTHETIC_HOUSEHOLD.combinedCanopy },
    },
    children: {
      child_salem: {
        ...SYNTHETIC_CHILDREN.child_salem,
        displayName: { ...SYNTHETIC_CHILDREN.child_salem.displayName },
      },
      child_alya: {
        ...SYNTHETIC_CHILDREN.child_alya,
        displayName: { ...SYNTHETIC_CHILDREN.child_alya.displayName },
      },
    },
    activeChildId: 'child_salem',
    choicePool: {
      seededPreviewChoices: [{ ...RESET_PREVIEW_CHOICES[0] }, { ...RESET_PREVIEW_CHOICES[1] }],
      p0AssignmentChoice: null,
    },
    activeAssignmentId: null,
    journey: null,
    landscapeProgress: {
      ghaf: { landscapeId: 'ghaf', cumulativeSeeds: 0, stage: 'seed', nextThreshold: 20 },
      samar: { landscapeId: 'samar', cumulativeSeeds: 0, stage: 'seed', nextThreshold: 20 },
      sidr: { landscapeId: 'sidr', cumulativeSeeds: 0, stage: 'seed', nextThreshold: 20 },
      date_palm: {
        landscapeId: 'date_palm',
        cumulativeSeeds: 0,
        stage: 'seed',
        nextThreshold: 20,
      },
      mangrove: {
        landscapeId: 'mangrove',
        cumulativeSeeds: 48,
        stage: 'shoot',
        nextThreshold: 60,
      },
    },
    circleGoal: { eligibleGreenActions: 11, goal: 12, origin: 'synthetic_local' },
    recognitionLedger: {},
    preparedParentGuideFixtureId: 'guide_recycling_refine_v1',
    preparedChildCoachFixtureId: 'coach_recycling_steps_v1',
    preparedImageFixtureId: 'fixture_recycling_clean_v1',
    preparedAudioFixtureId: 'fixture_salem_plan_ar_v1',
    assistantMode: 'deterministic_prepared',
    celebration: { available: false, consumed: false },
  };
}

export function createSubmittedP0Session(): FamilyGrowthPrototypeSession {
  const session = createInitialPrototypeSession();
  const journey = cloneP0TaskJourney('submitted');
  return {
    ...session,
    choicePool: {
      ...session.choicePool,
      p0AssignmentChoice: { ...P0_EXECUTABLE_CHOICE },
    },
    activeAssignmentId: journey.assignment?.id ?? null,
    journey,
  };
}

export type ResetSourceState =
  | 'draft'
  | 'assistant_result'
  | 'assistant_fallback'
  | 'prepared_media_selected'
  | 'prepared_media_removed'
  | 'prepared_image_unavailable'
  | 'prepared_audio_unavailable'
  | 'reviewed'
  | 'assigned'
  | 'chosen'
  | 'in_progress'
  | 'submitted'
  | 'retry'
  | 'confirmed'
  | 'recognized'
  | 'celebration_available'
  | 'celebration_consumed'
  | 'garden'
  | 'circle';

export type ResetSourceSnapshot = FamilyGrowthPrototypeSession & {
  readonly parentGuideSuggestion?: ParentGuideTaskSuggestion | null;
  readonly childTaskDraft?: ChildTaskDraftState;
};

function createRecognizedSession(consumed: boolean): FamilyGrowthPrototypeSession {
  const baseline = createInitialPrototypeSession();
  const journey = cloneP0TaskJourney('recognized');
  if (!journey.checkIn || !journey.submission) return baseline;
  const recognitionKey = `recognition:${journey.submission.id}`;
  const receipt: RecognitionReceipt = {
    recognitionKey,
    checkInId: journey.checkIn.id,
    seedTransaction: {
      id: 'seed_transaction_recycling_p0_v1_attempt_1',
      recognitionKey,
      childId: 'child_salem',
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
    canopyContribution: {
      actionKind: 'eligible_household_acquisition',
      leafDelta: 1,
      origin: 'synthetic',
    },
    circleEvent: {
      actionKind: 'eligible_green_action',
      actionDelta: 1,
      sourceScope: 'household',
      origin: 'synthetic_local',
    },
    phaseReview: null,
  };
  return {
    ...baseline,
    household: {
      ...baseline.household,
      combinedCanopy: { contributionLeaves: 20, goalLeaves: 25 },
    },
    children: {
      ...baseline.children,
      child_salem: { ...baseline.children.child_salem, earnedSeeds: 60 },
    },
    choicePool: {
      ...baseline.choicePool,
      p0AssignmentChoice: { ...P0_EXECUTABLE_CHOICE },
    },
    activeAssignmentId: journey.assignment?.id ?? null,
    journey,
    landscapeProgress: {
      ...baseline.landscapeProgress,
      mangrove: {
        landscapeId: 'mangrove',
        cumulativeSeeds: 60,
        stage: 'sapling',
        nextThreshold: 120,
      },
    },
    circleGoal: { ...baseline.circleGoal, eligibleGreenActions: 12 },
    recognitionLedger: { [recognitionKey]: receipt },
    celebration: { available: true, consumed },
  };
}

export function createResetSourceSession(source: ResetSourceState): ResetSourceSnapshot {
  if (['recognized', 'celebration_available', 'garden', 'circle'].includes(source)) {
    return createRecognizedSession(false);
  }
  if (source === 'celebration_consumed') return createRecognizedSession(true);
  if (source === 'submitted') return createSubmittedP0Session();

  const baseline = createInitialPrototypeSession();
  const lifecycle =
    source === 'reviewed'
      ? 'reviewed'
      : source === 'assigned'
        ? 'assigned'
        : source === 'chosen'
          ? 'chosen'
          : [
                'in_progress',
                'prepared_media_selected',
                'prepared_media_removed',
                'prepared_image_unavailable',
                'prepared_audio_unavailable',
              ].includes(source)
            ? 'in_progress'
            : source === 'retry'
              ? 'retry'
              : source === 'confirmed'
                ? 'confirmed'
                : 'draft';
  const journey = cloneP0TaskJourney(lifecycle);
  const sourceTransient: Pick<ResetSourceSnapshot, 'parentGuideSuggestion' | 'childTaskDraft'> =
    source === 'assistant_result'
      ? { parentGuideSuggestion: PARENT_GUIDE_FIXTURE }
      : source === 'assistant_fallback'
        ? {
            parentGuideSuggestion: {
              ...PARENT_GUIDE_FIXTURE,
              meta: {
                ...PARENT_GUIDE_FIXTURE.meta,
                fallbackUsed: true,
                fallbackReason: 'remote_failure',
              },
            },
          }
        : source === 'prepared_media_selected'
          ? {
              childTaskDraft: {
                selectedMediaFixtureId: 'fixture_recycling_clean_v1',
                removedMediaFixtureIds: [],
                unavailableMediaFixtureIds: [],
                reflection: null,
              },
            }
          : source === 'prepared_media_removed'
            ? {
                childTaskDraft: {
                  selectedMediaFixtureId: null,
                  removedMediaFixtureIds: ['fixture_recycling_clean_v1'],
                  unavailableMediaFixtureIds: [],
                  reflection: null,
                },
              }
            : source === 'prepared_image_unavailable'
              ? {
                  childTaskDraft: {
                    selectedMediaFixtureId: null,
                    removedMediaFixtureIds: [],
                    unavailableMediaFixtureIds: ['fixture_recycling_clean_v1'],
                    reflection: null,
                  },
                }
              : source === 'prepared_audio_unavailable'
                ? {
                    childTaskDraft: {
                      selectedMediaFixtureId: null,
                      removedMediaFixtureIds: [],
                      unavailableMediaFixtureIds: ['fixture_salem_plan_ar_v1'],
                      reflection: null,
                    },
                  }
                : {};

  return {
    ...baseline,
    choicePool: {
      ...baseline.choicePool,
      p0AssignmentChoice: journey.assignment ? { ...P0_EXECUTABLE_CHOICE } : null,
    },
    activeAssignmentId: journey.assignment?.id ?? null,
    journey,
    ...sourceTransient,
  };
}
