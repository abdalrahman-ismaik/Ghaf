import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { StudyCommand, StudyPlan } from '@/models/study';
import {
  normalizeStudyDigits,
  StudyButton,
  StudyInput,
  StudyText,
  studyStyles as s,
} from './shared';

export function StudyPlanCard({
  plan,
  role,
  onCommand,
}: {
  plan: StudyPlan;
  role: 'parent' | 'child';
  onCommand: (command: StudyCommand) => boolean;
}) {
  const { t } = useTranslation();
  const [revisit, setRevisit] = useState(plan.revisitDate ?? '');
  const [showRevisit, setShowRevisit] = useState(false);
  return (
    <View style={s.card} testID={`study-plan-${plan.id}`}>
      <StudyText variant="caption">
        {plan.subject} · {t(`study.status.${plan.status}`)}
      </StudyText>
      <StudyText variant="heading">{plan.title}</StudyText>
      <StudyText>{plan.nextStep}</StudyText>
      <StudyText tabular variant="caption">
        {t('study.minutes', { count: plan.durationMinutes })}
      </StudyText>
      {plan.dueDate ? <StudyText>{t('study.due', { date: plan.dueDate })}</StudyText> : null}
      {plan.revisitDate ? (
        <StudyText>{t('study.revisitOn', { date: plan.revisitDate })}</StudyText>
      ) : null}
      {plan.helpRequest ? (
        <View style={s.notice}>
          <StudyText>
            {t('study.helpPending', { request: t(`study.${plan.helpRequest}`) })}
          </StudyText>
          {role === 'parent' ? (
            <StudyButton
              variant="secondary"
              onPress={() => onCommand({ type: 'plan.help_resolved', id: plan.id })}
            >
              {t('study.helpResolved')}
            </StudyButton>
          ) : null}
        </View>
      ) : null}
      {role === 'child' ? (
        <>
          {plan.status === 'proposed' ? (
            <StudyButton
              testID="study-plan-accept"
              onPress={() => onCommand({ type: 'plan.accept', id: plan.id })}
            >
              {t('study.acceptPlan')}
            </StudyButton>
          ) : null}
          {plan.status === 'planned' || plan.status === 'paused' ? (
            <StudyButton
              testID="study-plan-start"
              onPress={() => onCommand({ type: 'plan.start', id: plan.id })}
            >
              {t('study.start')}
            </StudyButton>
          ) : null}
          {plan.status === 'active' ? (
            <>
              <StudyButton
                testID="study-plan-complete"
                onPress={() => onCommand({ type: 'plan.complete', id: plan.id })}
              >
                {t('study.complete')}
              </StudyButton>
              <StudyButton
                variant="secondary"
                onPress={() => onCommand({ type: 'plan.pause', id: plan.id })}
              >
                {t('study.pause')}
              </StudyButton>
            </>
          ) : null}
          <StudyText variant="label">{t('study.help')}</StudyText>
          {(['explain', 'smaller_step', 'together'] as const).map((request) => (
            <StudyButton
              key={request}
              variant="quiet"
              onPress={() => onCommand({ type: 'plan.help', id: plan.id, request })}
            >
              {t(`study.${request}`)}
            </StudyButton>
          ))}
        </>
      ) : null}
      {role === 'child' ? (
        <StudyButton variant="quiet" onPress={() => setShowRevisit(!showRevisit)}>
          {t('study.revisit')}
        </StudyButton>
      ) : null}
      {role === 'child' && showRevisit ? (
        <>
          <StudyInput
            label={t('study.revisitDate')}
            value={revisit}
            onChangeText={setRevisit}
            maxLength={10}
            direction="ltr"
          />
          <StudyButton
            variant="secondary"
            onPress={() => {
              if (
                onCommand({
                  type: 'plan.revisit',
                  id: plan.id,
                  date: normalizeStudyDigits(revisit) || null,
                })
              )
                setShowRevisit(false);
            }}
          >
            {t('study.save')}
          </StudyButton>
        </>
      ) : null}
      <StudyText variant="caption">{t('study.selfReport')}</StudyText>
    </View>
  );
}
