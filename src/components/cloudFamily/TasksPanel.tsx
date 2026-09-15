import { useRef, useState } from 'react';
import { View } from 'react-native';

import { AccessTextField } from '@/components/access';
import { Button, Text } from '@/components/primitives';
import { ParentReviewTaskCard } from '@/components/r002a/parent/ParentReviewTaskCard';
import type {
  CloudAssignment,
  CloudCommand,
  CloudSnapshot,
  CloudTask,
} from '@/models/normalizedCloudFamily';

import {
  CloudChoices,
  coreStyles,
  useCloudCoreCopy,
  type CloudCorePanelProps,
} from './FamilyPanel';
import { TaskEditor } from './TaskEditor';

export type CloudTaskFilter = 'all' | 'drafts' | 'assigned' | 'pending' | 'completed';

export function cloudParentTaskRows(
  snapshot: CloudSnapshot,
  childId: string,
  filter: CloudTaskFilter,
) {
  const rows: { task: CloudTask; assignment?: CloudAssignment }[] = [];
  for (const assignment of snapshot.assignments) {
    const task = snapshot.tasks.find(
      (item) => item.id === assignment.task_id && item.version === assignment.task_version,
    );
    if (task) rows.push({ task, assignment });
  }
  for (const task of snapshot.tasks) {
    if (
      task.status !== 'assigned' &&
      !rows.some((row) => row.task.id === task.id && row.task.version === task.version) &&
      !snapshot.tasks.some((other) => other.id === task.id && other.version > task.version)
    )
      rows.push({ task });
  }
  return rows.filter(({ task, assignment }) => {
    if (childId && task.child_id !== childId) return false;
    if (filter === 'all') return true;
    if (filter === 'drafts') return !assignment;
    if (filter === 'pending')
      return assignment?.state === 'submitted' || assignment?.state === 'confirmed';
    if (filter === 'completed') return assignment?.state === 'recognized';
    return (
      !!assignment && ['assigned', 'chosen', 'in_progress', 'retry'].includes(assignment.state)
    );
  });
}

export function TasksPanel({ snapshot, busy, command }: CloudCorePanelProps) {
  const { text, language, direction } = useCloudCoreCopy('tasks');
  const [childId, setChildId] = useState('');
  const [filter, setFilter] = useState<CloudTaskFilter>('all');
  const [editor, setEditor] = useState<{ task?: CloudTask } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [praise, setPraise] = useState<Record<string, string>>({});
  const [retry, setRetry] = useState<Record<string, string>>({});
  const [smaller, setSmaller] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const pending = useRef(false);
  const disabled = busy || saving;
  const rows = cloudParentTaskRows(snapshot, childId, filter);
  const act = async (input: CloudCommand) => {
    if (pending.current || disabled || snapshot.actor.role !== 'parent') return;
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
  if (snapshot.actor.role !== 'parent') return null;
  return (
    <View style={coreStyles.panel} testID="cloud-tasks-panel">
      <Text brand direction={direction} language={language} variant="parentHero">
        {text('title')}
      </Text>
      <Text direction={direction} language={language}>
        {text('intro')}
      </Text>
      {!editor ? (
        <Button
          brand
          direction={direction}
          language={language}
          disabled={disabled || !snapshot.children.some((child) => child.active && child.age_band)}
          testID="cloud-task-new"
          onPress={() => setEditor({})}
        >
          {text('new')}
        </Button>
      ) : null}
      {!snapshot.children.some((child) => child.active && child.age_band) ? (
        <Text direction={direction} language={language}>
          {text('noProfiles')}
        </Text>
      ) : null}
      {editor ? (
        <TaskEditor
          key={editor.task?.id ?? 'new'}
          snapshot={snapshot}
          busy={disabled}
          command={command}
          task={editor.task}
          onClose={() => setEditor(null)}
        />
      ) : null}
      <CloudChoices
        label={text('child')}
        disabled={disabled}
        selected={[childId]}
        testID="cloud-tasks-child-filter"
        options={[
          { value: '', label: text('allChildren') },
          ...snapshot.children.map((child) => ({ value: child.id, label: child.nickname })),
        ]}
        onSelect={setChildId}
      />
      <CloudChoices
        label={text('title')}
        disabled={disabled}
        selected={[filter]}
        testID="cloud-tasks-status-filter"
        options={(['all', 'drafts', 'assigned', 'pending', 'completed'] as const).map((value) => ({
          value,
          label: text(value),
        }))}
        onSelect={(value) => {
          if (
            value === 'all' ||
            value === 'drafts' ||
            value === 'assigned' ||
            value === 'pending' ||
            value === 'completed'
          )
            setFilter(value);
        }}
      />
      {!rows.length ? (
        <Text direction={direction} language={language} testID="cloud-tasks-empty">
          {text('empty')}
        </Text>
      ) : null}
      {rows.map(({ task, assignment }) => {
        const key = assignment?.id ?? `${task.id}:${task.version}`;
        const child = snapshot.children.find((item) => item.id === task.child_id);
        const category = snapshot.categories.find((item) => item.id === task.category_id);
        const checkIn = snapshot.check_ins
          .filter((item) => item.assignment_id === assignment?.id && item.decision === 'confirm')
          .at(-1);
        const recognition = snapshot.recognitions.find(
          (item) => item.assignment_id === assignment?.id,
        );
        const adjustment = snapshot.adjustments.find(
          (item) =>
            item.assignment_id === assignment?.id && item.status === 'parent_review_required',
        );
        const opened = selected === key;
        return (
          <View key={key} style={coreStyles.listRow} testID={`cloud-task-row-${key}`}>
            <Button
              brand
              variant="quiet"
              direction={direction}
              language={language}
              disabled={disabled}
              accessibilityState={{ expanded: opened }}
              testID={`cloud-task-open-${key}`}
              onPress={() => setSelected(opened ? null : key)}
            >
              {task.title}
            </Button>
            <Text direction={direction} language={language}>
              {child?.nickname} · {text(`status.${assignment?.state ?? task.status}`)}
            </Text>
            {opened ? (
              <View style={coreStyles.group}>
                <ParentReviewTaskCard
                  title={task.title}
                  childName={child?.nickname ?? ''}
                  direction={direction}
                  categoryLabel={
                    category ? (language === 'ar' ? category.label_ar : category.label_en) : ''
                  }
                  awardLabel={text('awardCount', { count: task.seed_award ?? 0 })}
                  submittedLabel={text(`status.${assignment?.state ?? task.status}`)}
                />
                <Text direction={direction} language={language}>
                  {task.definition_of_done}
                </Text>
                <Text direction={direction} language={language}>
                  {task.positive_action}
                </Text>
                <Text direction={direction} language={language}>
                  {task.why_it_matters}
                </Text>
                {task.steps.map((step, index) => (
                  <Text key={index} direction={direction} language={language}>
                    {index + 1}. {step}
                  </Text>
                ))}
                <Text direction={direction} language={language}>
                  {text('recognition')}: {text(task.recognition_mode)} · {text(task.routine_phase)}
                </Text>
                <Text direction={direction} language={language}>
                  {text('privacy')}:{' '}
                  {text(task.visibility_scope === 'household' ? 'household' : 'child_private')}
                </Text>
                <Text direction={direction} language={language}>
                  {text('permittedHelp')}: {task.permitted_help}
                </Text>
                <Text direction={direction} language={language}>
                  {text('supervisionText')}: {task.supervision}
                </Text>
                {Object.entries(task.safety).map(([field, value]) =>
                  value && (!Array.isArray(value) || value.length) ? (
                    <Text key={field} direction={direction} language={language}>
                      {text(field)}: {Array.isArray(value) ? value.join(' · ') : value}
                    </Text>
                  ) : null,
                )}
                {!assignment ? (
                  <>
                    <Text direction={direction} language={language}>
                      {text('reviewFirst')}
                    </Text>
                    <Button
                      brand
                      variant="secondary"
                      direction={direction}
                      language={language}
                      disabled={disabled || editor !== null}
                      testID={`cloud-task-edit-${task.id}`}
                      onPress={() => setEditor({ task })}
                    >
                      {text('edit')}
                    </Button>
                    <Button
                      brand
                      direction={direction}
                      language={language}
                      disabled={disabled}
                      testID={`cloud-task-${task.status === 'reviewed' ? 'assign' : 'review'}-${task.id}`}
                      onPress={() =>
                        void act({
                          type: task.status === 'reviewed' ? 'task.assign' : 'task.review',
                          taskId: task.id,
                        })
                      }
                    >
                      {text(task.status === 'reviewed' ? 'assign' : 'review')}
                    </Button>
                  </>
                ) : (
                  <Text direction={direction} language={language} variant="caption">
                    {text('acceptedTerms')}
                  </Text>
                )}
                <Button
                  brand
                  variant="quiet"
                  direction={direction}
                  language={language}
                  disabled={disabled}
                  testID={`cloud-task-template-save-${task.id}`}
                  onPress={() => void act({ type: 'task.save_template', taskId: task.id })}
                >
                  {text('saveTemplate')}
                </Button>
                {assignment?.help_requested ? (
                  <View style={coreStyles.notice}>
                    <Text direction={direction} language={language}>
                      {text('helpRequested')}
                    </Text>
                    <Text direction={direction} language={language}>
                      {task.permitted_help}
                    </Text>
                    <Button
                      brand
                      variant="secondary"
                      direction={direction}
                      language={language}
                      disabled={disabled}
                      testID={`cloud-task-help-resolved-${key}`}
                      onPress={() =>
                        void act({ type: 'assignment.help_resolved', assignmentId: assignment.id })
                      }
                    >
                      {text('resolveHelp')}
                    </Button>
                  </View>
                ) : null}
                {adjustment ? (
                  <View style={coreStyles.notice}>
                    <CloudChoices
                      label={text('proposeSmaller')}
                      disabled={disabled}
                      selected={[smaller[adjustment.id] ?? '']}
                      options={snapshot.templates
                        .filter(
                          (template) =>
                            !child?.age_band || template.age_bands.includes(child.age_band),
                        )
                        .map((template) => ({
                          value: template.id,
                          label: language === 'ar' ? template.title_ar : template.title_en,
                        }))}
                      testID={`cloud-adjustment-template-${adjustment.id}`}
                      onSelect={(id) =>
                        setSmaller((current) => ({ ...current, [adjustment.id]: id }))
                      }
                    />
                    <Button
                      brand
                      direction={direction}
                      language={language}
                      disabled={disabled || !smaller[adjustment.id]}
                      testID={`cloud-adjustment-propose-${adjustment.id}`}
                      onPress={() =>
                        void act({
                          type: 'adjustment.propose',
                          adjustmentId: adjustment.id,
                          templateId: smaller[adjustment.id]!,
                        })
                      }
                    >
                      {text('proposeSmaller')}
                    </Button>
                  </View>
                ) : null}
                {assignment?.state === 'submitted' ? (
                  <View style={coreStyles.group}>
                    <AccessTextField
                      label={text('praise')}
                      helperText={text('praiseHint')}
                      value={praise[key] ?? ''}
                      direction={direction}
                      language={language}
                      editable={!disabled}
                      maxLength={1000}
                      multiline
                      testID={`cloud-task-praise-${key}`}
                      onChangeText={(value) =>
                        setPraise((current) => ({ ...current, [key]: value }))
                      }
                    />
                    <Button
                      brand
                      direction={direction}
                      language={language}
                      disabled={disabled || !praise[key]?.trim()}
                      testID={`cloud-task-confirm-${key}`}
                      onPress={() =>
                        void act({
                          type: 'checkin.confirm',
                          assignmentId: assignment.id,
                          praise: praise[key]!.trim(),
                        })
                      }
                    >
                      {text('confirm')}
                    </Button>
                    <AccessTextField
                      label={text('retryObservation')}
                      value={retry[key] ?? ''}
                      direction={direction}
                      language={language}
                      editable={!disabled}
                      maxLength={1000}
                      multiline
                      testID={`cloud-task-retry-note-${key}`}
                      onChangeText={(value) =>
                        setRetry((current) => ({ ...current, [key]: value }))
                      }
                    />
                    <Button
                      brand
                      variant="secondary"
                      direction={direction}
                      language={language}
                      disabled={disabled || !retry[key]?.trim()}
                      testID={`cloud-task-retry-${key}`}
                      onPress={() =>
                        void act({
                          type: 'checkin.retry',
                          assignmentId: assignment.id,
                          observation: retry[key]!.trim(),
                        })
                      }
                    >
                      {text('retry')}
                    </Button>
                  </View>
                ) : null}
                {checkIn && !recognition ? (
                  <View style={coreStyles.notice}>
                    <Text brand direction={direction} language={language} variant="heading">
                      {checkIn.praise}
                    </Text>
                    {checkIn.presentation === 'editing_praise' ? (
                      <Button
                        brand
                        direction={direction}
                        language={language}
                        disabled={disabled}
                        testID={`cloud-task-present-praise-${key}`}
                        onPress={() =>
                          void act({ type: 'checkin.praise_presented', checkInId: checkIn.id })
                        }
                      >
                        {text('presentPraise')}
                      </Button>
                    ) : null}
                    {checkIn.presentation === 'praise_presented' ? (
                      <Button
                        brand
                        direction={direction}
                        language={language}
                        disabled={disabled}
                        testID={`cloud-task-recognize-${key}`}
                        onPress={() =>
                          void act({ type: 'recognition.apply', checkInId: checkIn.id })
                        }
                      >
                        {text('applyRecognition')}
                      </Button>
                    ) : null}
                  </View>
                ) : null}
                {recognition ? (
                  <View style={coreStyles.notice} testID={`cloud-task-receipt-${key}`}>
                    <Text brand direction={direction} language={language} variant="heading">
                      {text('receipt')}
                    </Text>
                    <Text direction={direction} language={language} tabular>
                      {text('awardCount', { count: recognition.seed_amount })}
                    </Text>
                    <Text direction={direction} language={language}>
                      {checkIn?.praise}
                    </Text>
                    <Text direction={direction} language={language}>
                      {text('permanent')}
                    </Text>
                    {task.recurrence === 'recurrent' && task.recognition_mode === 'fade_first' ? (
                      <Button
                        brand
                        variant="secondary"
                        direction={direction}
                        language={language}
                        disabled={disabled}
                        testID={`cloud-task-routine-${key}`}
                        onPress={() =>
                          void act({
                            type: 'routine.phase',
                            taskId: task.id,
                            phase:
                              task.routine_phase === 'maintenance' ? 'acquisition' : 'maintenance',
                          })
                        }
                      >
                        {text(task.routine_phase === 'maintenance' ? 'acquisition' : 'maintenance')}
                      </Button>
                    ) : null}
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
      {snapshot.legacy_records
        .filter((record) => record.kind === 'task' && (!childId || record.child_id === childId))
        .map((record) => (
          <View
            key={record.id}
            style={coreStyles.listRow}
            testID={`cloud-legacy-task-${record.id}`}
          >
            <Text brand direction={direction} language={language}>
              {record.title}
            </Text>
            <Text direction={direction} language={language} variant="caption">
              {text('legacy')}
            </Text>
            {!record.converted_task_id ? (
              <>
                <CloudChoices
                  label={text('legacyTemplate')}
                  disabled={disabled}
                  selected={[smaller[record.id] ?? '']}
                  options={snapshot.templates.map((template) => ({
                    value: template.id,
                    label: language === 'ar' ? template.title_ar : template.title_en,
                  }))}
                  testID={`cloud-legacy-template-${record.id}`}
                  onSelect={(id) => setSmaller((current) => ({ ...current, [record.id]: id }))}
                />
                <Button
                  brand
                  variant="secondary"
                  direction={direction}
                  language={language}
                  disabled={disabled || !smaller[record.id]}
                  testID={`cloud-legacy-convert-${record.id}`}
                  onPress={() =>
                    void act({
                      type: 'legacy.convert',
                      legacyId: record.id,
                      templateId: smaller[record.id]!,
                      locale: language,
                    })
                  }
                >
                  {text('legacyConvert')}
                </Button>
              </>
            ) : null}
          </View>
        ))}
      {error ? (
        <Text
          accessibilityRole="alert"
          color="error"
          direction={direction}
          language={language}
          testID="cloud-tasks-error"
        >
          {text('retained')}
        </Text>
      ) : null}
    </View>
  );
}
