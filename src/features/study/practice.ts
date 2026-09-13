import type { StudyResult } from '../../models/study';

export const STUDY_PRACTICE_EXAMPLE = {
  id: 'equal_groups',
  promptKey: 'study.example.question',
  answerOptions: ['7', '12', '16'],
  explanationKey: 'study.example.explanation',
  explainPromptKey: 'study.example.explainPrompt',
  accessibleKey: 'study.example.accessible',
} as const;

export function checkStudyPracticeAnswer(
  answerId: string,
): StudyResult<{ correct: boolean; feedbackKey: string }> {
  if (!(STUDY_PRACTICE_EXAMPLE.answerOptions as readonly string[]).includes(answerId)) {
    return { ok: false, error: { code: 'invalid_input' } };
  }
  const correct = answerId === '12';
  return {
    ok: true,
    data: {
      correct,
      feedbackKey: correct ? 'study.example.correct' : 'study.example.tryAgain',
    },
  };
}
