import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StudyButton, StudyText, studyStyles as s } from '@/components/study/shared';
import type { CloudDocumentCommand, CloudFamilyDocument } from '@/models/cloudFamilyDocuments';

export function CloudLearningView({
  role,
  documents,
  earnedSeeds,
  onCommand,
}: {
  role: 'parent' | 'child';
  documents: readonly CloudFamilyDocument[];
  earnedSeeds: number;
  onCommand: (command: CloudDocumentCommand) => Promise<boolean>;
}) {
  const { t } = useTranslation();
  const [route, setRoute] = useState<'story' | 'accessible'>('story');
  const [retry, setRetry] = useState(false);
  const record = documents.find((row) => row.kind === 'learning');
  const payload = record?.kind === 'learning' ? record.payload : null;
  if (payload?.completedAt)
    return (
      <StudyText testID="cloud-learning-complete">{t('cloudDocuments.learningSaved')}</StudyText>
    );
  if (role !== 'child' || earnedSeeds < 132)
    return <StudyText>{t('cloudDocuments.learningLocked')}</StudyText>;
  const progress = payload?.routes[route];
  const ids =
    route === 'story'
      ? (['story_frame_1', 'story_frame_2'] as const)
      : (['accessible_section_1', 'accessible_section_2'] as const);
  return (
    <View style={s.stack}>
      <StudyText>{t('learning.mangroveRoots.objective')}</StudyText>
      <StudyText>{t('learning.mangroveRoots.sources.note')}</StudyText>
      <View style={s.row}>
        {(['story', 'accessible'] as const).map((value) => (
          <StudyButton
            key={value}
            fullWidth={false}
            variant={route === value ? 'primary' : 'secondary'}
            onPress={() => setRoute(value)}
          >
            {t(`cloudDocuments.${value}`)}
          </StudyButton>
        ))}
      </View>
      {!payload ? (
        <StudyButton
          onPress={() => {
            void onCommand({ type: 'learning.start', route });
          }}
        >
          {t('cloudDocuments.learningStart')}
        </StudyButton>
      ) : (
        <>
          {ids.map((id, index) => {
            const resource =
              route === 'story' ? `story.frame${index + 1}` : `accessible.section${index + 1}`;
            const done = progress?.steps.includes(id) ?? false;
            return (
              <View key={id} style={s.card}>
                <StudyText variant="heading">
                  {t(
                    `learning.mangroveRoots.${resource}.${route === 'story' ? 'title' : 'heading'}`,
                  )}
                </StudyText>
                <StudyText>{t(`learning.mangroveRoots.${resource}.body`)}</StudyText>
                <StudyButton
                  disabled={done || (index === 1 && !progress?.steps.includes(ids[0]))}
                  onPress={() => {
                    void onCommand({ type: 'learning.step', route, stepId: id });
                  }}
                >
                  {t('cloudDocuments.learningStep')}
                </StudyButton>
              </View>
            );
          })}
          {progress?.steps.length === 2 ? (
            <>
              <StudyText>{t('learning.mangroveRoots.check.prompt')}</StudyText>
              {(['habitat_support_and_care', 'visit_or_task_reward'] as const).map((optionId) => (
                <StudyButton
                  key={optionId}
                  disabled={progress.checkSatisfied}
                  variant="secondary"
                  onPress={() => {
                    void onCommand({ type: 'learning.check', route, optionId }).then((saved) => {
                      if (saved) setRetry(optionId !== 'habitat_support_and_care');
                    });
                  }}
                >
                  {t(
                    `learning.mangroveRoots.check.option.${optionId === 'habitat_support_and_care' ? 'habitatSupportAndCare' : 'visitOrTaskReward'}`,
                  )}
                </StudyButton>
              ))}
              {retry ? (
                <StudyText accessibilityLiveRegion="polite">
                  {t('cloudDocuments.learningRetry')}
                </StudyText>
              ) : null}
              {progress.checkSatisfied ? (
                <StudyButton
                  onPress={() => {
                    void onCommand({ type: 'learning.complete', route });
                  }}
                >
                  {t('cloudDocuments.learningComplete')}
                </StudyButton>
              ) : null}
            </>
          ) : null}
        </>
      )}
    </View>
  );
}
