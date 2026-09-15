import { useRef, useState } from 'react';
import { View } from 'react-native';

import { ChoiceChip } from '@/components/access';
import { Button, Text } from '@/components/primitives';
import { ChildTaskPlanCard } from '@/components/r002a/child/ChildTaskPlanCard';
import { ChildTaskChecklist } from '@/components/r002a/child/ChildTaskChecklist';
import type { CloudCommand, CloudSnapshot } from '@/models/normalizedCloudFamily';

import { coreStyles, useCloudCoreCopy, type CloudCorePanelProps } from './FamilyPanel';

export function cloudChildTaskRows(snapshot: CloudSnapshot) {
  if (snapshot.actor.role !== 'child' || !snapshot.actor.child_id) return [];
  const childId = snapshot.actor.child_id;
  return snapshot.assignments
    .filter((assignment) => assignment.child_id === childId)
    .flatMap((assignment) => {
      const task = snapshot.tasks.find(
        (item) =>
          item.child_id === childId &&
          item.id === assignment.task_id &&
          item.version === assignment.task_version,
      );
      return task ? [{ assignment, task }] : [];
    });
}

export function ChildTaskPanel({ snapshot, busy, command }: CloudCorePanelProps) {
  const { text, language, direction } = useCloudCoreCopy('tasks');
  const [selected, setSelected] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Record<string, string[]>>({});
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});
  const [withHelp, setWithHelp] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const pending = useRef(false);
  const disabled = busy || saving;
  const rows = cloudChildTaskRows(snapshot);
  const act = async (input: CloudCommand) => {
    if (disabled || pending.current || snapshot.actor.role !== 'child' || !snapshot.actor.child_id)
      return;
    pending.current = true;
    setSaving(true);
    setError(false);
    try {
      if (!(await command(input))) setError(true);
    } catch {
      setError(true);
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };
  if (snapshot.actor.role !== 'child' || !snapshot.actor.child_id)
    return (
      <Text direction={direction} language={language}>
        {text('childUnavailable')}
      </Text>
    );
  return (
    <View style={coreStyles.panel} testID="cloud-child-tasks-panel">
      <Text brand direction={direction} language={language} variant="parentHero">
        {text('childTitle')}
      </Text>
      {!rows.length ? (
        <Text direction={direction} language={language} testID="cloud-child-tasks-empty">
          {text('childEmpty')}
        </Text>
      ) : null}
      {rows.map(({ task, assignment }) => {
        const attempt = snapshot.submissions
          .filter((item) => item.assignment_id === assignment.id)
          .reduce((latest, item) => Math.max(latest, item.attempt), 0);
        const key = `${assignment.id}:${task.version}:${attempt}`;
        const opened = selected === assignment.id || rows.length === 1;
        const checkpoints = task.steps.map((title, index) => ({
          id: `${key}:${index}`,
          title,
          detail: '',
        }));
        const adjustment = snapshot.adjustments.find(
          (item) =>
            item.assignment_id === assignment.id &&
            item.child_id === snapshot.actor.child_id &&
            (item.status === 'parent_review_required' || item.status === 'child_decision_required'),
        );
        const proposed =
          adjustment?.proposed_version === null
            ? undefined
            : snapshot.tasks.find(
                (item) =>
                  item.id === task.id &&
                  item.child_id === snapshot.actor.child_id &&
                  item.version === adjustment?.proposed_version,
              );
        const checkIn = snapshot.check_ins
          .filter((item) => item.assignment_id === assignment.id && item.decision === 'confirm')
          .at(-1);
        const retryCheckIn = snapshot.check_ins
          .filter((item) => item.assignment_id === assignment.id && item.decision === 'kind_retry')
          .at(-1);
        const receipt = snapshot.recognitions.find(
          (item) =>
            item.assignment_id === assignment.id && item.child_id === snapshot.actor.child_id,
        );
        const reveal = snapshot.reveals.find(
          (item) =>
            item.child_id === snapshot.actor.child_id && item.recognition_id === receipt?.id,
        );
        const canAct = !disabled && !adjustment;
        return (
          <View
            key={assignment.id}
            style={coreStyles.listRow}
            testID={`cloud-child-assignment-${assignment.id}`}
          >
            <Button
              brand
              variant="quiet"
              direction={direction}
              language={language}
              disabled={disabled}
              accessibilityState={{ expanded: opened }}
              testID={`cloud-child-task-open-${assignment.id}`}
              onPress={() => setSelected(opened ? null : assignment.id)}
            >
              {task.title}
            </Button>
            <Text direction={direction} language={language}>
              {text(`status.${assignment.state}`)}
            </Text>
            <Text direction={direction} language={language} tabular>
              {text('awardCount', { count: task.seed_award ?? 0 })}
            </Text>
            {opened ? (
              <View style={coreStyles.group}>
                <Text direction={direction} language={language}>
                  {task.definition_of_done}
                </Text>
                <Text direction={direction} language={language}>
                  {task.positive_action}
                </Text>
                <Text direction={direction} language={language}>
                  {task.why_it_matters}
                </Text>
                {assignment.state !== 'in_progress' ? (
                  <ChildTaskPlanCard
                    direction={direction}
                    title={text('stepPlan')}
                    steps={checkpoints}
                  />
                ) : null}
                <Text direction={direction} language={language}>
                  {text('permittedHelp')}: {task.permitted_help}
                </Text>
                <Text direction={direction} language={language}>
                  {text('supervisionText')}: {task.supervision}
                </Text>
                <Text direction={direction} language={language}>
                  {task.safety.stop_and_ask_adult}
                </Text>
                {task.safety.excluded_hazards.length ? (
                  <Text direction={direction} language={language}>
                    {task.safety.excluded_hazards.join(' · ')}
                  </Text>
                ) : null}
                {(['route_constraint', 'indoor_alternative', 'aftercare'] as const).map((field) =>
                  task.safety[field] ? (
                    <Text key={field} direction={direction} language={language}>
                      {text(field)}: {task.safety[field]}
                    </Text>
                  ) : null,
                )}
                {retryCheckIn?.observation &&
                (assignment.state === 'retry' || assignment.state === 'in_progress') ? (
                  <View
                    style={coreStyles.notice}
                    testID={`cloud-child-retry-guidance-${assignment.id}`}
                  >
                    <Text direction={direction} language={language}>
                      {retryCheckIn.observation}
                    </Text>
                  </View>
                ) : null}
                <Text direction={direction} language={language} variant="caption">
                  {text('fixedAward')}
                </Text>
                {assignment.state === 'assigned' ? (
                  <>
                    <Button
                      brand
                      direction={direction}
                      language={language}
                      disabled={!canAct}
                      testID={`cloud-child-accept-${assignment.id}`}
                      onPress={() =>
                        void act({ type: 'assignment.accept', assignmentId: assignment.id })
                      }
                    >
                      {text('accept')}
                    </Button>
                    <Button
                      brand
                      variant="secondary"
                      direction={direction}
                      language={language}
                      disabled={!canAct}
                      testID={`cloud-child-smaller-${assignment.id}`}
                      onPress={() =>
                        void act({ type: 'adjustment.request', assignmentId: assignment.id })
                      }
                    >
                      {text('smaller')}
                    </Button>
                  </>
                ) : null}
                {assignment.state === 'chosen' ? (
                  <Button
                    brand
                    direction={direction}
                    language={language}
                    disabled={!canAct}
                    testID={`cloud-child-start-${assignment.id}`}
                    onPress={() =>
                      void act({ type: 'assignment.start', assignmentId: assignment.id })
                    }
                  >
                    {text('start')}
                  </Button>
                ) : null}
                {assignment.state === 'retry' ? (
                  <Button
                    brand
                    direction={direction}
                    language={language}
                    disabled={!canAct}
                    testID={`cloud-child-resume-${assignment.id}`}
                    onPress={() =>
                      void act({ type: 'assignment.resume_retry', assignmentId: assignment.id })
                    }
                  >
                    {text('resume')}
                  </Button>
                ) : null}
                {['assigned', 'chosen', 'in_progress', 'retry'].includes(assignment.state) ? (
                  <Button
                    brand
                    variant="quiet"
                    direction={direction}
                    language={language}
                    disabled={disabled || assignment.help_requested}
                    testID={`cloud-child-help-${assignment.id}`}
                    onPress={() =>
                      void act({ type: 'assignment.help', assignmentId: assignment.id })
                    }
                  >
                    {text(assignment.help_requested ? 'helpSent' : 'help')}
                  </Button>
                ) : null}
                {assignment.state === 'in_progress' ? (
                  <View style={coreStyles.group}>
                    <ChildTaskChecklist
                      direction={direction}
                      title={text('stepPlan')}
                      completedLabel={text('completed')}
                      steps={checkpoints}
                      completedStepIds={completed[key] ?? []}
                      onToggle={(id) => {
                        if (disabled || pending.current) return;
                        setCompleted((current) => {
                          const values = current[key] ?? [];
                          return {
                            ...current,
                            [key]: values.includes(id)
                              ? values.filter((value) => value !== id)
                              : [...values, id],
                          };
                        });
                      }}
                    />
                    <ChoiceChip
                      direction={direction}
                      language={language}
                      label={text('acknowledge')}
                      selected={acknowledged[key] === true}
                      disabled={disabled}
                      testID={`cloud-child-acknowledge-${assignment.id}`}
                      onPress={() =>
                        setAcknowledged((current) => ({ ...current, [key]: !current[key] }))
                      }
                    />
                    <ChoiceChip
                      direction={direction}
                      language={language}
                      label={text('withHelp')}
                      selected={withHelp[key] === true}
                      disabled={disabled}
                      testID={`cloud-child-with-help-${assignment.id}`}
                      onPress={() =>
                        setWithHelp((current) => ({ ...current, [key]: !current[key] }))
                      }
                    />
                    <Button
                      brand
                      direction={direction}
                      language={language}
                      disabled={
                        !canAct ||
                        !acknowledged[key] ||
                        (completed[key]?.length ?? 0) !== checkpoints.length
                      }
                      testID={`cloud-child-submit-${assignment.id}`}
                      onPress={() => {
                        if (
                          !acknowledged[key] ||
                          (completed[key]?.length ?? 0) !== checkpoints.length
                        )
                          return;
                        void act({
                          type: 'assignment.submit',
                          assignmentId: assignment.id,
                          definitionAcknowledged: true,
                          completionMode: withHelp[key] ? 'permitted_help' : 'independent',
                        });
                      }}
                    >
                      {text('submit')}
                    </Button>
                  </View>
                ) : null}
                {adjustment?.status === 'parent_review_required' ? (
                  <Text direction={direction} language={language}>
                    {text('smallerWaiting')}
                  </Text>
                ) : null}
                {adjustment?.status === 'child_decision_required' ? (
                  <View style={coreStyles.notice}>
                    <Text direction={direction} language={language}>
                      {text('smallerDecision')}
                    </Text>
                    {proposed ? (
                      <>
                        <Text brand direction={direction} language={language} variant="heading">
                          {proposed.title}
                        </Text>
                        <Text direction={direction} language={language}>
                          {proposed.definition_of_done}
                        </Text>
                        {proposed.steps.map((step, index) => (
                          <Text key={index} direction={direction} language={language}>
                            {index + 1}. {step}
                          </Text>
                        ))}
                        <Text direction={direction} language={language} tabular>
                          {text('awardCount', { count: proposed.seed_award ?? 0 })}
                        </Text>
                        <Text direction={direction} language={language}>
                          {proposed.permitted_help}
                        </Text>
                        <Button
                          brand
                          direction={direction}
                          language={language}
                          disabled={disabled}
                          testID={`cloud-child-adjustment-accept-${adjustment.id}`}
                          onPress={() =>
                            void act({ type: 'adjustment.accept', adjustmentId: adjustment.id })
                          }
                        >
                          {text('acceptSmaller')}
                        </Button>
                      </>
                    ) : null}
                    <Button
                      brand
                      variant="secondary"
                      direction={direction}
                      language={language}
                      disabled={disabled}
                      testID={`cloud-child-adjustment-keep-${adjustment.id}`}
                      onPress={() =>
                        void act({ type: 'adjustment.keep', adjustmentId: adjustment.id })
                      }
                    >
                      {text('keepCurrent')}
                    </Button>
                  </View>
                ) : null}
                {assignment.state === 'submitted' || assignment.state === 'confirmed' ? (
                  <Text direction={direction} language={language}>
                    {text('waiting')}
                  </Text>
                ) : null}
                {checkIn?.praise && checkIn.presentation !== 'editing_praise' ? (
                  <Text brand direction={direction} language={language} variant="heading">
                    {checkIn.praise}
                  </Text>
                ) : null}
                {receipt ? (
                  <View style={coreStyles.notice} testID={`cloud-child-receipt-${assignment.id}`}>
                    <Text brand direction={direction} language={language} variant="heading">
                      {text('receipt')}
                    </Text>
                    <Text direction={direction} language={language} tabular>
                      {text('awardCount', { count: receipt.seed_amount })}
                    </Text>
                    <Text direction={direction} language={language}>
                      {text('permanent')}
                    </Text>
                    {reveal && !reveal.acknowledged_at ? (
                      <Button
                        brand
                        direction={direction}
                        language={language}
                        disabled={disabled}
                        testID={`cloud-child-reveal-ack-${reveal.id}`}
                        onPress={() =>
                          void act({ type: 'reveal.acknowledge', revealId: reveal.id })
                        }
                      >
                        {text('acknowledgeReveal')}
                      </Button>
                    ) : null}
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
      {error ? (
        <Text
          accessibilityRole="alert"
          color="error"
          direction={direction}
          language={language}
          testID="cloud-child-task-error"
        >
          {text('retained')}
        </Text>
      ) : null}
    </View>
  );
}
