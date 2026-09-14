import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { AcademicGoal, StudyCommand, StudyReportedResult } from '@/models/study';
import {
  newStudyId,
  parseStudyNumber,
  StudyButton,
  StudyInput,
  StudyText,
  studyStyles as s,
} from './shared';

export function AcademicGoalCard({
  goal,
  role,
  onCommand,
  onEdit,
  onReplace,
}: {
  goal: AcademicGoal;
  role: 'parent' | 'child';
  onCommand: (command: StudyCommand) => boolean;
  onEdit: () => void;
  onReplace: () => void;
}) {
  const { t } = useTranslation();
  const [resultValue, setResultValue] = useState('');
  const [achieved, setAchieved] = useState(false);
  const [acknowledgement, setAcknowledgement] = useState('');
  const last = goal.submissions.at(-1);
  const editable = goal.childAcceptedRevision === null;
  const proposal = editable && goal.status === 'proposed';
  const criterion =
    goal.criterion.kind === 'practice_count'
      ? t('study.practiceCriterion', { count: goal.criterion.target })
      : goal.criterion.kind === 'mark'
        ? t('study.markCriterion', goal.criterion)
        : goal.criterion.description;
  const report = () => {
    const result: StudyReportedResult =
      goal.criterion.kind === 'practice_count'
        ? { kind: 'practice_count', count: parseStudyNumber(resultValue) }
        : goal.criterion.kind === 'mark'
          ? { kind: 'mark', value: parseStudyNumber(resultValue) }
          : { kind: 'achievement', achieved };
    onCommand({ type: 'goal.submit', id: goal.id, submissionId: newStudyId('report'), result });
  };
  return (
    <View style={s.card} testID={`study-goal-${goal.id}`}>
      <StudyText variant="caption">
        {goal.subject} · {t(`study.status.${goal.status}`)}
      </StudyText>
      <StudyText variant="heading">{goal.title}</StudyText>
      <StudyText>{goal.nextStep}</StudyText>
      {goal.targetDate ? (
        <StudyText tabular testID="study-goal-target-date-display">
          {t('study.goalTargetOn', { date: '\u2068' + goal.targetDate + '\u2069' })}
        </StudyText>
      ) : null}
      {goal.reviewDate ? (
        <StudyText tabular testID="study-goal-review-date-display">
          {t('study.goalReviewOn', { date: '\u2068' + goal.reviewDate + '\u2069' })}
        </StudyText>
      ) : null}
      <StudyText variant="label">{t('study.criterion')}</StudyText>
      <StudyText tabular>{criterion}</StudyText>
      <StudyText variant="label">{t('study.parentSupport')}</StudyText>
      <StudyText>{goal.parentSupport}</StudyText>
      <View style={s.notice}>
        <StudyText>
          {goal.prize
            ? `${t(`study.${goal.prize.kind}`)} · ${goal.prize.label}`
            : t('study.noPrize')}
        </StudyText>
        {goal.prizeStatus && !editable ? (
          <StudyText testID="study-prize-status">
            {t(`study.prizeStatus.${goal.prizeStatus}`)}
          </StudyText>
        ) : null}
        <StudyText variant="caption">{t('study.prizeBoundary')}</StudyText>
      </View>
      <StudyText variant="caption">{t('study.agreement', { revision: goal.revision })}</StudyText>
      {proposal ? (
        <>
          <StudyText>
            {t(
              goal.parentApprovedRevision === goal.revision
                ? 'study.parentApproved'
                : 'study.waitingParent',
            )}
          </StudyText>
          {role === 'parent' && goal.parentApprovedRevision !== goal.revision ? (
            <StudyButton
              testID="study-goal-approve"
              onPress={() =>
                onCommand({ type: 'goal.approve', id: goal.id, expectedRevision: goal.revision })
              }
            >
              {t('study.approve')}
            </StudyButton>
          ) : null}
          {role === 'parent' && goal.parentApprovedRevision === goal.revision ? (
            <StudyText>{t('study.waitingChild')}</StudyText>
          ) : null}
          {role === 'child' ? (
            <>
              <StudyButton
                testID="study-goal-accept"
                disabled={goal.parentApprovedRevision !== goal.revision}
                onPress={() =>
                  onCommand({ type: 'goal.accept', id: goal.id, expectedRevision: goal.revision })
                }
              >
                {t('study.accept')}
              </StudyButton>
              <StudyButton
                variant="quiet"
                onPress={() => onCommand({ type: 'goal.decline', id: goal.id })}
              >
                {t('study.decline')}
              </StudyButton>
            </>
          ) : null}
        </>
      ) : null}
      {editable && ['proposed', 'change_requested', 'declined'].includes(goal.status) ? (
        <StudyButton variant="secondary" onPress={onEdit}>
          {t('study.edit')}
        </StudyButton>
      ) : null}
      {role === 'child' && (goal.status === 'active' || goal.status === 'paused') ? (
        <>
          <StudyButton
            variant="secondary"
            onPress={() =>
              onCommand({
                type: goal.status === 'paused' ? 'goal.resume' : 'goal.pause',
                id: goal.id,
              })
            }
          >
            {t(`study.${goal.status === 'paused' ? 'resume' : 'pause'}`)}
          </StudyButton>
          <StudyButton
            variant="quiet"
            onPress={() => onCommand({ type: 'goal.request_change', id: goal.id })}
          >
            {t('study.requestChange')}
          </StudyButton>
        </>
      ) : null}
      {role === 'child' && !editable && goal.status === 'change_requested' ? (
        <StudyButton
          variant="secondary"
          onPress={() => onCommand({ type: 'goal.resume', id: goal.id })}
        >
          {t('study.resume')}
        </StudyButton>
      ) : null}
      {!editable ? (
        <StudyButton variant="quiet" onPress={onReplace}>
          {t('study.replace')}
        </StudyButton>
      ) : null}
      {role === 'child' && goal.status === 'active' ? (
        <View style={s.divider}>
          <StudyText variant="label">{t('study.reportResult')}</StudyText>
          {goal.criterion.kind === 'achievement' ? (
            <>
              <StudyButton
                variant={achieved ? 'primary' : 'secondary'}
                accessibilityState={{ selected: achieved }}
                onPress={() => setAchieved(true)}
              >
                {t('study.achieved')}
              </StudyButton>
              <StudyButton
                variant={!achieved ? 'primary' : 'secondary'}
                accessibilityState={{ selected: !achieved }}
                onPress={() => setAchieved(false)}
              >
                {t('study.notYet')}
              </StudyButton>
            </>
          ) : (
            <StudyInput
              label={t('study.result')}
              keyboardType="decimal-pad"
              value={resultValue}
              onChangeText={setResultValue}
              maxLength={10}
              testID="study-result"
            />
          )}
          <StudyText variant="caption">{t('study.selfReport')}</StudyText>
          <StudyButton testID="study-goal-submit" onPress={report}>
            {t('study.submit')}
          </StudyButton>
        </View>
      ) : null}
      {last ? (
        <View style={s.divider}>
          <StudyText tabular>
            {t('study.result')}:{' '}
            {last.result.kind === 'achievement'
              ? t(last.result.achieved ? 'study.achieved' : 'study.notYet')
              : last.result.kind === 'mark'
                ? last.result.value
                : last.result.count}
          </StudyText>
          {last.acknowledgement ? <StudyText>{last.acknowledgement}</StudyText> : null}
          {last.metCriterion === false ? <StudyText>{t('study.belowTarget')}</StudyText> : null}
          {role === 'parent' && goal.status === 'awaiting_confirmation' ? (
            <>
              <StudyText>{t('study.reviewPrompt')}</StudyText>
              <StudyInput
                label={t('study.acknowledgement')}
                value={acknowledgement}
                onChangeText={setAcknowledgement}
                maxLength={300}
                multiline
                testID="study-acknowledgement"
              />
              <StudyButton
                testID="study-goal-confirm"
                onPress={() =>
                  onCommand({
                    type: 'goal.confirm',
                    id: goal.id,
                    submissionId: last.id,
                    acknowledgement,
                  })
                }
              >
                {t('study.confirm')}
              </StudyButton>
            </>
          ) : null}
        </View>
      ) : null}
      {role === 'parent' && goal.prizeStatus === 'unlocked' ? (
        <StudyButton
          testID="study-goal-give"
          onPress={() => onCommand({ type: 'goal.give', id: goal.id })}
        >
          {t('study.markGiven')}
        </StudyButton>
      ) : null}
    </View>
  );
}
