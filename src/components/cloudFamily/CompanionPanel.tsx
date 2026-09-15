import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ChoiceChip, StatusBanner } from '@/components/access';
import { FamilyMessagingScreen } from '@/components/familyMessaging/FamilyMessagingScreen';
import { PracticeSessionScreen } from '@/components/familyPractices/FamilyPracticesScreen';
import { StudyPractice } from '@/components/study/StudyPractice';
import { Button, Text } from '@/components/primitives';
import type { CloudPanelProps } from './CloudFamilyScreen';
import { serviceRegistry } from '@/services';
import { usePrototypeStore } from '@/state/usePrototypeStore';

import { cloudGrowthStyles } from './GrowthPanel';

type Section = 'overview' | 'messages' | 'practice' | 'study' | 'coach';
type CoachChoice = 'first' | 'plan' | 'cue';

export function CompanionPanel({
  snapshot,
  busy,
  command,
  active,
}: CloudPanelProps & { readonly active: boolean }) {
  const { t } = useTranslation();
  const language = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const controller = serviceRegistry.familyMessaging.controller;
  const actor = snapshot.actor;
  const actorScope = `cloud:${actor.user_id}:${actor.family_id}:${actor.role}:${actor.child_id ?? ''}`;
  const [selection, setSelection] = useState<{ scope: string; section: Section }>({
    scope: actorScope,
    section: 'overview',
  });
  const [assignmentId, setAssignmentId] = useState('');
  const [answer, setAnswer] = useState<{
    taskId: string;
    version: number;
    choice: CoachChoice;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<'helpSaved' | 'failed' | null>(null);
  const pending = useRef(false);
  const section = selection.scope === actorScope ? selection.section : 'overview';
  const text = (key: string) => t(`cloudFamily.companion.${key}`);
  const exit = useCallback(
    () => setSelection({ scope: actorScope, section: 'overview' }),
    [actorScope],
  );
  useEffect(
    () => () => {
      controller.setVisible(false);
      // The account boundary also awaits private cleanup and reports durable-storage failure.
      void controller.clearAccountSession().catch(() => undefined);
    },
    [actorScope, controller],
  );
  const child = snapshot.children.find(
    (entry) => entry.id === actor.child_id && entry.family_id === actor.family_id && entry.active,
  );
  const permission = snapshot.permissions.find((entry) => entry.child_id === child?.id);
  const rows =
    actor.role === 'child'
      ? snapshot.assignments
          .filter(
            (assignment) =>
              assignment.child_id === child?.id &&
              assignment.family_id === actor.family_id &&
              ['chosen', 'in_progress'].includes(assignment.state),
          )
          .flatMap((assignment) => {
            const task = snapshot.tasks.find(
              (entry) =>
                entry.id === assignment.task_id &&
                entry.child_id === child?.id &&
                entry.family_id === actor.family_id &&
                entry.version === assignment.task_version &&
                entry.status === 'assigned',
            );
            return task ? [{ assignment, task }] : [];
          })
      : [];
  const current = rows.find((entry) => entry.assignment.id === assignmentId) ?? rows[0];
  const permitted = !!child?.age_band && !!permission?.ai_granted;
  const reply =
    answer &&
    current &&
    answer.taskId === current.task.id &&
    answer.version === current.task.version
      ? answer.choice
      : null;
  const askForHelp = async () => {
    if (!active || busy || pending.current || !permitted || !current) return;
    pending.current = true;
    setSaving(true);
    setFeedback(null);
    try {
      const result = await command({
        type: 'assignment.help',
        assignmentId: current.assignment.id,
      });
      setFeedback(result ? 'helpSaved' : 'failed');
    } catch {
      setFeedback('failed');
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };
  if (!active) return null;
  if (section === 'messages')
    return (
      <FamilyMessagingScreen
        key={actorScope}
        controller={controller}
        embedded
        onExit={exit}
        localContext={{ scope: actorScope, role: actor.role }}
      />
    );
  if (section === 'practice')
    return <PracticeSessionScreen key={actorScope} role={actor.role} embedded onExit={exit} />;

  return (
    <View style={cloudGrowthStyles.panel} testID="cloud-companion-panel">
      <Text
        brand
        direction={direction}
        language={language}
        variant="screenTitle"
        accessibilityRole="header"
      >
        {text('title')}
      </Text>
      {section === 'overview' ? (
        <>
          <Text brand direction={direction} language={language}>
            {text('body')}
          </Text>
          {(
            ['messages', 'practice', 'study', ...(actor.role === 'child' ? ['coach'] : [])] as const
          ).map((entry) => (
            <View key={entry} style={cloudGrowthStyles.rule}>
              <Button
                brand
                direction={direction}
                language={language}
                variant="secondary"
                disabled={busy}
                onPress={() => {
                  setSelection({ scope: actorScope, section: entry as Section });
                  setFeedback(null);
                }}
                testID={`cloud-companion-${entry}`}
              >
                {text(entry)}
              </Button>
              <Text brand direction={direction} language={language}>
                {text(`${entry}Body`)}
              </Text>
            </View>
          ))}
        </>
      ) : (
        <Button
          brand
          direction={direction}
          language={language}
          variant="quiet"
          onPress={exit}
          testID="cloud-companion-back"
        >
          {text('back')}
        </Button>
      )}
      {section === 'study' ? <StudyPractice key={actorScope} /> : null}
      {section === 'coach' ? (
        <View style={cloudGrowthStyles.section}>
          <Text brand direction={direction} language={language} variant="heading">
            {text('coach')}
          </Text>
          {!permitted ? (
            <Text brand direction={direction} language={language}>
              {text('coachPermission')}
            </Text>
          ) : !current ? (
            <Text brand direction={direction} language={language}>
              {text('coachEmpty')}
            </Text>
          ) : (
            <>
              <Text brand direction={direction} language={language} variant="caption">
                {text('coachPrepared')}
              </Text>
              {rows.map((entry) => (
                <ChoiceChip
                  key={entry.assignment.id}
                  direction={direction}
                  language={language}
                  disabled={busy || saving}
                  label={entry.task.title}
                  selected={current.assignment.id === entry.assignment.id}
                  onPress={() => {
                    setAssignmentId(entry.assignment.id);
                    setAnswer(null);
                    setFeedback(null);
                  }}
                  testID={`cloud-coach-task-${entry.assignment.id}`}
                />
              ))}
              {(
                ['first', 'plan', ...(child?.age_band !== '6_8' ? ['cue'] : [])] as CoachChoice[]
              ).map((choice) => (
                <Button
                  key={choice}
                  brand
                  direction={direction}
                  language={language}
                  disabled={busy || saving}
                  variant="secondary"
                  onPress={() =>
                    setAnswer({ taskId: current.task.id, version: current.task.version, choice })
                  }
                  testID={`cloud-coach-${choice}`}
                >
                  {text(choice)}
                </Button>
              ))}
              <Button
                brand
                direction={direction}
                language={language}
                disabled={busy || saving}
                onPress={() => void askForHelp()}
                testID="cloud-coach-help"
              >
                {text('adult')}
              </Button>
              {reply === 'first' ? (
                <Text brand direction={direction} language={language} testID="cloud-coach-response">
                  {current.task.steps[0]}
                </Text>
              ) : null}
              {reply === 'plan' ? (
                <View style={cloudGrowthStyles.section} testID="cloud-coach-response">
                  {current.task.steps.map((step, index) => (
                    <Text key={index} brand direction={direction} language={language}>
                      {step}
                    </Text>
                  ))}
                </View>
              ) : null}
              {reply === 'cue' ? (
                <Text brand direction={direction} language={language} testID="cloud-coach-response">
                  {text('cueBody')}
                </Text>
              ) : null}
              {current.task.permitted_help ? (
                <Text brand direction={direction} language={language}>
                  {current.task.permitted_help}
                </Text>
              ) : null}
              {feedback ? (
                <StatusBanner
                  direction={direction}
                  language={language}
                  tone={feedback === 'failed' ? 'error' : 'success'}
                  message={text(feedback)}
                />
              ) : null}
            </>
          )}
          <Text
            brand
            direction={direction}
            language={language}
            color="onSurfaceVariant"
            variant="caption"
          >
            {text('unchanged')}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
