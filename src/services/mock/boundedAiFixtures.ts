import type {
  ChildCoachTextRequestV1,
  ChildCoachTextResponseV1,
  ParentTaskDraftSuggestionV1,
  VoiceTranscriptionMetadataV1,
  VoiceTranscriptionResponseV1,
} from '../../models/boundedAi';
import { P0_RECYCLING_TEMPLATE, TASK_TEMPLATES } from '../../features/tasks/demoContent';

const reviewedTemplates = [P0_RECYCLING_TEMPLATE, ...TASK_TEMPLATES].filter((template) =>
  ['task_recycling_p0_v1', 'GI01', 'HR02', 'LW01'].includes(template.id),
);

export function createPreparedParentTaskDraftSuggestion(input: {
  readonly requestId: string;
  readonly bindingNonce: string;
  readonly archetypeId: 'task_recycling_p0_v1' | 'GI01' | 'HR02' | 'LW01';
}): ParentTaskDraftSuggestionV1 | null {
  const template = reviewedTemplates.find((candidate) => candidate.id === input.archetypeId);
  if (!template) return null;
  return {
    schemaVersion: '1.0',
    requestId: input.requestId,
    bindingNonce: input.bindingNonce,
    archetypeId: input.archetypeId,
    title: template.title,
    positiveAction: template.positiveAction,
    whyItMatters: template.whyItMatters,
    steps: [{ order: 1, text: template.positiveAction }],
    supportCue: template.permittedHelp,
  };
}

export function createPreparedChildCoachResponse(
  request: ChildCoachTextRequestV1,
): ChildCoachTextResponseV1 {
  const needsAdult = request.intent === 'need_adult';
  return {
    schemaVersion: '1.0',
    requestId: request.requestId,
    taskBindingNonce: request.taskBindingNonce,
    intent: request.intent,
    disposition: needsAdult ? 'ask_adult' : 'coach',
    steps: needsAdult
      ? []
      : [
          {
            ar: 'ابدأ بالخطوة الأولى المعروضة، وتوقّف لطلب مساعدة شخص بالغ عند الحاجة.',
            en: 'Start with the first shown step, and stop to ask an adult when needed.',
          },
        ],
    ifThenCue: needsAdult
      ? null
      : {
          ar: 'إذا لم تكن الخطوة واضحة، فتوقّف واطلب مساعدة شخص بالغ.',
          en: 'If the step is not clear, stop and ask an adult for help.',
        },
    reflectionQuestion: null,
    reviewedPhrase: null,
    terminal: true,
  };
}

export function createPreparedVoiceTranscription(
  metadata: VoiceTranscriptionMetadataV1,
): VoiceTranscriptionResponseV1 {
  return {
    schemaVersion: '1.0',
    requestId: metadata.requestId,
    bindingNonce: metadata.bindingNonce,
    text:
      metadata.locale === 'ar'
        ? 'أحتاج إلى توضيح الخطوة الأولى.'
        : 'I need the first step clarified.',
    locale: metadata.locale,
    audioDeleted: true,
  };
}
