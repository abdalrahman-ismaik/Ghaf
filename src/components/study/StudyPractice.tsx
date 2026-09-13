import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StudyButton, StudyText, studyStyles as s } from './shared';
import { checkStudyPracticeAnswer, STUDY_PRACTICE_EXAMPLE } from '@/features/study/practice';

const steps = ['recall', 'check', 'explainStep', 'revisitStep'] as const;

export function StudyPractice() {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  return (
    <View style={s.card} testID="study-practice">
      <StudyText variant="heading">{t('study.understandingTitle')}</StudyText>
      <StudyText>{t('study.understandingBody')}</StudyText>
      <View style={s.notice}>
        <StudyText>{t('study.example.question')}</StudyText>
        <StudyText variant="caption">{t('study.example.accessible')}</StudyText>
        {STUDY_PRACTICE_EXAMPLE.answerOptions.map((answer) => (
          <StudyButton
            key={answer}
            variant="secondary"
            onPress={() => {
              const result = checkStudyPracticeAnswer(answer);
              if (result.ok) setFeedback(result.data.feedbackKey);
            }}
          >
            {answer}
          </StudyButton>
        ))}
        {feedback ? <StudyText accessibilityLiveRegion="polite">{t(feedback)}</StudyText> : null}
        <StudyButton variant="quiet" onPress={() => setFeedback('study.example.explanation')}>
          {t('study.explain')}
        </StudyButton>
      </View>
      <View style={s.notice}>
        <StudyText>
          {step < steps.length ? t(`study.${steps[step]}`) : t('study.practiceDone')}
        </StudyText>
      </View>
      {step < steps.length ? (
        <>
          <StudyButton onPress={() => setStep(step + 1)}>
            {t(step === steps.length - 1 ? 'study.finish' : 'study.next')}
          </StudyButton>
          <StudyButton variant="quiet" onPress={() => setStep(step + 1)}>
            {t('study.skip')}
          </StudyButton>
          {step > 0 ? (
            <StudyButton variant="secondary" onPress={() => setStep(step - 1)}>
              {t('study.previous')}
            </StudyButton>
          ) : null}
        </>
      ) : (
        <StudyButton onPress={() => setStep(0)}>{t('study.again')}</StudyButton>
      )}
    </View>
  );
}
