import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { logicalRowDirection } from '@/design/tokens';
import type { AcademicGoal, StudyCommand, StudyCriterion, StudyPrize } from '@/models/study';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import {
  newStudyId,
  parseStudyNumber,
  normalizeStudyDigits,
  StudyButton,
  StudyInput,
  StudyText,
  studyStyles as s,
} from './shared';

export function StudyForm({
  kind,
  childId,
  goal,
  onSave,
  onCancel,
}: {
  kind: 'plan' | 'goal';
  childId: string;
  goal?: AcademicGoal;
  onSave: (command: StudyCommand) => boolean;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const direction = usePrototypeStore((state) => state.direction);
  const [subject, setSubject] = useState(goal?.subject ?? '');
  const [title, setTitle] = useState(goal?.title ?? '');
  const [nextStep, setNextStep] = useState(goal?.nextStep ?? '');
  const [duration, setDuration] = useState('15');
  const [dueDate, setDueDate] = useState('');
  const [revisitDate, setRevisitDate] = useState('');
  const [parentSupport, setParentSupport] = useState(goal?.parentSupport ?? '');
  const [criterionKind, setCriterionKind] = useState<StudyCriterion['kind']>(
    goal?.criterion.kind ?? 'practice_count',
  );
  const [target, setTarget] = useState(
    String(goal?.criterion.kind === 'practice_count' ? goal.criterion.target : 3),
  );
  const [achievement, setAchievement] = useState(
    goal?.criterion.kind === 'achievement' ? goal.criterion.description : '',
  );
  const [threshold, setThreshold] = useState(
    String(goal?.criterion.kind === 'mark' ? goal.criterion.threshold : 80),
  );
  const [denominator, setDenominator] = useState(
    String(goal?.criterion.kind === 'mark' ? goal.criterion.denominator : 100),
  );
  const [prizeKind, setPrizeKind] = useState<StudyPrize['kind'] | 'none'>(
    goal?.prize?.kind ?? 'none',
  );
  const [prizeLabel, setPrizeLabel] = useState(goal?.prize?.label ?? '');
  const row = [s.row, { direction: 'ltr' as const, flexDirection: logicalRowDirection(direction) }];
  const save = () => {
    if (kind === 'plan') {
      onSave({
        type: 'plan.create',
        id: newStudyId('plan'),
        childId,
        input: {
          subject,
          title,
          nextStep,
          durationMinutes: parseStudyNumber(duration),
          dueDate: normalizeStudyDigits(dueDate) || null,
          revisitDate: normalizeStudyDigits(revisitDate) || null,
        },
      });
      return;
    }
    const input = {
      subject,
      title,
      nextStep,
      parentSupport,
      criterion:
        criterionKind === 'practice_count'
          ? { kind: criterionKind, target: parseStudyNumber(target) }
          : criterionKind === 'achievement'
            ? { kind: criterionKind, description: achievement }
            : {
                kind: criterionKind,
                threshold: parseStudyNumber(threshold),
                denominator: parseStudyNumber(denominator),
              },
      prize: prizeKind === 'none' ? null : { kind: prizeKind, label: prizeLabel },
    };
    onSave(
      goal
        ? { type: 'goal.edit', id: goal.id, expectedRevision: goal.revision, input }
        : { type: 'goal.create', id: newStudyId('goal'), childId, input },
    );
  };
  return (
    <View style={s.card} testID="study-form">
      <StudyText variant="heading">
        {t(`study.${kind === 'plan' ? 'newPlan' : goal ? 'edit' : 'newGoal'}`)}
      </StudyText>
      <StudyInput
        label={t('study.subject')}
        value={subject}
        onChangeText={setSubject}
        maxLength={80}
        testID="study-subject"
      />
      <StudyInput
        label={t('study.titleField')}
        value={title}
        onChangeText={setTitle}
        maxLength={120}
        testID="study-title"
      />
      <StudyInput
        label={t('study.nextStep')}
        value={nextStep}
        onChangeText={setNextStep}
        maxLength={300}
        multiline
        testID="study-next-step"
      />
      {kind === 'plan' ? (
        <>
          <StudyInput
            label={t('study.duration')}
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
            maxLength={3}
            testID="study-duration"
          />
          <StudyInput
            label={t('study.dueDate')}
            value={dueDate}
            onChangeText={setDueDate}
            maxLength={10}
            direction="ltr"
            testID="study-due-date"
          />
          <StudyInput
            label={t('study.revisitDate')}
            value={revisitDate}
            onChangeText={setRevisitDate}
            maxLength={10}
            direction="ltr"
            testID="study-revisit-date"
          />
        </>
      ) : (
        <>
          <StudyInput
            label={t('study.parentSupport')}
            value={parentSupport}
            onChangeText={setParentSupport}
            maxLength={300}
            multiline
            testID="study-parent-support"
          />
          <StudyText variant="label">{t('study.criterion')}</StudyText>
          <View style={row}>
            {(['practice_count', 'achievement', 'mark'] as const).map((value) => (
              <StudyButton
                key={value}
                fullWidth={false}
                variant={criterionKind === value ? 'primary' : 'secondary'}
                accessibilityState={{ selected: criterionKind === value }}
                onPress={() => setCriterionKind(value)}
                testID={`study-criterion-${value}`}
              >
                {t(`study.${value}`)}
              </StudyButton>
            ))}
          </View>
          {criterionKind === 'practice_count' ? (
            <StudyInput
              label={t('study.target')}
              value={target}
              onChangeText={setTarget}
              keyboardType="number-pad"
              maxLength={4}
              testID="study-target"
            />
          ) : null}
          {criterionKind === 'achievement' ? (
            <StudyInput
              label={t('study.achievementDescription')}
              value={achievement}
              onChangeText={setAchievement}
              maxLength={300}
              testID="study-achievement"
            />
          ) : null}
          {criterionKind === 'mark' ? (
            <>
              <StudyInput
                label={t('study.threshold')}
                value={threshold}
                onChangeText={setThreshold}
                keyboardType="decimal-pad"
                maxLength={10}
                testID="study-threshold"
              />
              <StudyInput
                label={t('study.denominator')}
                value={denominator}
                onChangeText={setDenominator}
                keyboardType="decimal-pad"
                maxLength={10}
                testID="study-denominator"
              />
            </>
          ) : null}
          <StudyText variant="label">{t('study.prize')}</StudyText>
          <View style={row}>
            {(['none', 'gift', 'experience', 'privilege'] as const).map((value) => (
              <StudyButton
                key={value}
                fullWidth={false}
                variant={prizeKind === value ? 'primary' : 'secondary'}
                accessibilityState={{ selected: prizeKind === value }}
                onPress={() => setPrizeKind(value)}
                testID={`study-prize-${value}`}
              >
                {t(`study.${value}`)}
              </StudyButton>
            ))}
          </View>
          {prizeKind !== 'none' ? (
            <StudyInput
              label={t('study.prizeLabel')}
              value={prizeLabel}
              onChangeText={setPrizeLabel}
              maxLength={160}
              testID="study-prize-label"
            />
          ) : null}
          <StudyText variant="caption">{t('study.prizeBoundary')}</StudyText>
        </>
      )}
      <StudyButton onPress={save} testID="study-save">
        {t(`study.${kind === 'plan' ? 'savePlan' : 'save'}`)}
      </StudyButton>
      <StudyButton variant="quiet" onPress={onCancel}>
        {t('study.cancel')}
      </StudyButton>
    </View>
  );
}
