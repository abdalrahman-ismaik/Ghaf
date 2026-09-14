import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/primitives';
import type { CloudFamilyController } from '@/features/cloud-family';
import type { CloudFamilySnapshot, CloudFamilyTask } from '@/models/cloudFamily';
import type { TaskTemplate } from '@/models/familyGrowth';
import type { ParentAccountService } from '@/models/parentAccount';
import { CloudMaintenancePrompt } from './CloudMaintenancePrompt';
import { CloudPreparedTaskGuide } from './CloudPreparedTaskGuide';

import {
  CloudAction,
  CloudActions,
  CloudField,
  CloudSection,
  cloudStyles,
  useCloudCopy,
} from './common';

function TemplateDetails({
  template,
  custom = false,
}: {
  readonly template: TaskTemplate;
  readonly custom?: boolean;
}) {
  const { text, locale } = useCloudCopy();
  const award =
    template.recognitionMode !== 'recognition_only' && template.routinePhase === 'acquisition'
      ? (template.displayedSeedAward ?? 0)
      : 0;
  const displayedSafetyText = new Set<string>();
  const safetyGroups = [
    {
      label: 'adultResponsibilities',
      items: [template.safety.adultPreCheck, ...template.safety.adultOwnedActions],
    },
    {
      label: 'safetyBoundaries',
      items: [...template.safety.excludedHazards, template.safety.stopAndAskAdult],
    },
    {
      label: 'routeAndAlternative',
      items: [template.safety.routeConstraint, template.safety.indoorAlternative],
    },
    {
      label: 'afterActivity',
      items: [template.safety.adultSecondCheck, template.safety.aftercare],
    },
  ].map((group) => ({
    label: group.label,
    items: group.items.flatMap((item) => {
      const value = item?.[locale];
      if (!value || displayedSafetyText.has(value)) return [];
      displayedSafetyText.add(value);
      return [value];
    }),
  }));
  return (
    <>
      <Text brand>{template.positiveAction[locale]}</Text>
      <Text brand color="primary">
        {award ? text('award', { count: award }) : text('noAward')}
      </Text>
      <CloudSection title={text('why')}>
        <Text brand>{template.whyItMatters[locale]}</Text>
      </CloudSection>
      <CloudSection title={text('doneMeans')}>
        <Text brand>{template.definitionOfDone[locale]}</Text>
      </CloudSection>
      <CloudSection title={text('help')}>
        <Text brand>{template.permittedHelp[locale]}</Text>
        <Text brand>{template.supervision[locale]}</Text>
      </CloudSection>
      <CloudSection title={text('safety')} testID="cloud-task-safety">
        {safetyGroups.map((group) =>
          group.items.length ? (
            <View key={group.label} style={cloudStyles.row}>
              <Text brand variant="label" accessibilityRole="header">
                {text(group.label)}
              </Text>
              {group.items.map((item) => (
                <Text brand key={item}>
                  {item}
                </Text>
              ))}
            </View>
          ) : null,
        )}
      </CloudSection>
      <Text brand color="onSurfaceVariant">
        {template.privacyNotice[locale]}
      </Text>
      <Text brand variant="caption" color="onSurfaceVariant">
        {text(custom ? 'parentDefined' : 'reference')}
      </Text>
    </>
  );
}

export function CloudTaskCatalog({
  snapshot,
  controller,
  disabled,
  onAssigned,
}: {
  readonly snapshot: CloudFamilySnapshot;
  readonly controller: CloudFamilyController;
  readonly disabled: boolean;
  readonly onAssigned: (taskId: string | null) => void;
}) {
  const { text, locale } = useCloudCopy();
  const children = snapshot.children.filter((child) => child.active);
  const [childId, setChildId] = useState(children.length === 1 ? children[0]!.id : '');
  const [category, setCategory] = useState('all');
  const [templateId, setTemplateId] = useState<string | null>(null);
  const child = children.find((item) => item.id === childId);
  const template = snapshot.catalog.find((item) => item.id === templateId);
  if (snapshot.actor.role !== 'parent') return null;
  if (template)
    return (
      <CloudTaskAssignment
        key={`${template.id}:${locale}`}
        template={template}
        snapshot={snapshot}
        childId={childId}
        controller={controller}
        disabled={disabled}
        onBack={() => setTemplateId(null)}
        onAssigned={onAssigned}
      />
    );
  const categories = [...new Set(snapshot.catalog.map((item) => item.categoryId))];
  return (
    <CloudSection title={text('catalog')} testID="cloud-task-catalog">
      <CloudSection title={text('chooseChild')}>
        <CloudActions>
          {children.map((item) => (
            <CloudAction
              key={item.id}
              disabled={disabled}
              accessibilityRole="radio"
              accessibilityState={{ checked: item.id === childId }}
              variant={item.id === childId ? 'primary' : 'secondary'}
              onPress={() => setChildId(item.id)}
            >
              {item.displayName}
            </CloudAction>
          ))}
        </CloudActions>
      </CloudSection>
      <CloudActions>
        {['all', ...categories].map((id) => (
          <CloudAction
            key={id}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ checked: id === category }}
            variant={id === category ? 'primary' : 'secondary'}
            onPress={() => setCategory(id)}
          >
            {text(id === 'all' ? 'allCategories' : `categories.${id}`)}
          </CloudAction>
        ))}
      </CloudActions>
      {snapshot.catalog
        .filter((item) => category === 'all' || item.categoryId === category)
        .map((item) => {
          const suitable = child !== undefined && item.childAgeBands.includes(child.ageBand);
          return (
            <View style={cloudStyles.card} key={item.id} testID={`cloud-catalog-${item.id}`}>
              <Text brand variant="label">
                {item.title[locale]}
              </Text>
              <Text brand>{item.estimatedEffort[locale]}</Text>
              <Text brand color="onSurfaceVariant">
                {item.whyItMatters[locale]}
              </Text>
              {child && !suitable ? <Text brand>{text('ageMismatch')}</Text> : null}
              <CloudAction
                disabled={disabled || !suitable}
                onPress={() => setTemplateId(item.id)}
                testID={`cloud-review-${item.id}`}
              >
                {text('review')}
              </CloudAction>
            </View>
          );
        })}
    </CloudSection>
  );
}

function CloudTaskAssignment({
  template,
  snapshot,
  childId,
  controller,
  disabled,
  onBack,
  onAssigned,
}: {
  readonly template: TaskTemplate;
  readonly snapshot: CloudFamilySnapshot;
  readonly childId: string;
  readonly controller: CloudFamilyController;
  readonly disabled: boolean;
  readonly onBack: () => void;
  readonly onAssigned: (id: string | null) => void;
}) {
  const { text, locale } = useCloudCopy();
  const [title, setTitle] = useState(template.title[locale]);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const assign = async () => {
    const before = new Set(snapshot.tasks.map((task) => task.id));
    const saved = await controller.command({
      type: 'assign_task',
      childId,
      catalogId: template.id,
      content: { title: { ...template.title, [locale]: title.trim() } },
    });
    if (!saved || !mounted.current) return;
    const assigned = controller
      .getSnapshot()
      .snapshot?.tasks.find((task) => task.childId === childId && !before.has(task.id));
    onAssigned(assigned?.id ?? null);
  };
  return (
    <CloudSection title={text('review')} testID="cloud-task-review">
      <Text brand variant="heading">
        {snapshot.children.find((child) => child.id === childId)?.displayName}
      </Text>
      <CloudField
        label={text('taskTitle')}
        value={title}
        onChangeText={setTitle}
        editable={!disabled}
        maxLength={160}
        testID="cloud-task-title-input"
      />
      <Text brand variant="caption">
        {text('wordingNotice')}
      </Text>
      <TemplateDetails template={template} />
      <CloudActions>
        <CloudAction
          disabled={disabled || !title.trim()}
          onPress={() => void assign()}
          testID="cloud-task-assign"
        >
          {text('assign')}
        </CloudAction>
        <CloudAction disabled={disabled} onPress={onBack} variant="quiet">
          {text('back')}
        </CloudAction>
      </CloudActions>
    </CloudSection>
  );
}

export function CloudTaskDetail({
  task,
  snapshot,
  controller,
  disabled,
  onGarden,
  service,
}: {
  readonly task: CloudFamilyTask;
  readonly snapshot: CloudFamilySnapshot;
  readonly controller: CloudFamilyController;
  readonly disabled: boolean;
  readonly onGarden: (recognitionId?: string) => void;
  readonly service?: ParentAccountService;
}) {
  const { text, locale } = useCloudCopy();
  const parent = snapshot.actor.role === 'parent';
  const child = snapshot.actor.role === 'child' && snapshot.actor.childId === task.childId;
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.template.title[locale]);
  const [praise, setPraise] = useState('');
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const steps = task.template.catalogExecution?.steps ?? [];
  const stepsReadyForReview = steps.every(
    (step) =>
      task.stepStates[step.id] === 'done' ||
      (step.kind !== 'action' && task.stepStates[step.id] === 'skipped'),
  );
  const command = (
    type: 'accept_task' | 'start_task' | 'request_help' | 'submit_task' | 'save_memory',
  ) => {
    if (disabled || (type === 'submit_task' && !stepsReadyForReview)) return Promise.resolve(false);
    return controller.command({ type, taskId: task.id, expectedRevision: task.revision });
  };
  const memory = snapshot.memories.find((item) => item.taskId === task.id);
  const eligibleMemory =
    task.status === 'recognized' &&
    !snapshot.deletedMemoryTaskIds.includes(task.id) &&
    snapshot.recognitions.some(
      (receipt) => receipt.taskId === task.id && receipt.canopyContribution === 1,
    );
  const confirm = async () => {
    const saved = await controller.command({
      type: 'recognize_task',
      taskId: task.id,
      expectedRevision: task.revision,
    });
    if (saved && mounted.current)
      onGarden(
        controller
          .getSnapshot()
          .snapshot?.recognitions.find((receipt) => receipt.taskId === task.id)?.id,
      );
  };
  const edit = async () => {
    const saved = await controller.command({
      type: 'edit_task',
      taskId: task.id,
      expectedRevision: task.revision,
      content: { title: { ...task.template.title, [locale]: title.trim() } },
    });
    if (saved && mounted.current) setEditing(false);
  };
  if (!parent && !child) return null;
  return (
    <CloudSection title={task.template.title[locale]} testID="cloud-task-detail">
      <Text brand variant="caption">
        {snapshot.children.find((item) => item.id === task.childId)?.displayName} ·{' '}
        {text(`statuses.${task.status}`)}
      </Text>
      {parent && task.status === 'assigned' ? (
        editing ? (
          <View style={cloudStyles.card}>
            <CloudField
              label={text('taskTitle')}
              value={title}
              onChangeText={setTitle}
              maxLength={160}
              editable={!disabled}
            />
            <Text brand>{text('wordingNotice')}</Text>
            <CloudActions>
              <CloudAction disabled={disabled || !title.trim()} onPress={() => void edit()}>
                {text('save')}
              </CloudAction>
              <CloudAction disabled={disabled} onPress={() => setEditing(false)} variant="quiet">
                {text('cancel')}
              </CloudAction>
            </CloudActions>
          </View>
        ) : (
          <CloudAction
            disabled={disabled}
            onPress={() => {
              setTitle(task.template.title[locale]);
              setEditing(true);
            }}
            variant="secondary"
          >
            {text('editTask')}
          </CloudAction>
        )
      ) : null}
      <TemplateDetails
        template={task.template}
        custom={!snapshot.catalog.some((item) => item.id === task.catalogId)}
      />
      {parent ? (
        <CloudMaintenancePrompt
          snapshot={snapshot}
          task={task}
          service={service}
          controller={controller}
          disabled={disabled}
        />
      ) : null}
      {task.helpRequested ? (
        <Text brand accessibilityLiveRegion="polite">
          {text('helpRequested')}
        </Text>
      ) : null}
      {child && task.status === 'assigned' ? (
        <CloudAction
          disabled={disabled}
          onPress={() => void command('accept_task')}
          testID="cloud-task-accept"
        >
          {text('accept')}
        </CloudAction>
      ) : null}
      {child && task.status === 'accepted' ? (
        <CloudAction
          disabled={disabled}
          onPress={() => void command('start_task')}
          testID="cloud-task-start"
        >
          {text('start')}
        </CloudAction>
      ) : null}
      {steps.length ? (
        <CloudSection title={text('steps')}>
          {steps.map((step, index) => (
            <View style={cloudStyles.card} key={step.id} testID={`cloud-step-${step.id}`}>
              <Text brand>
                {index + 1}. {step.text[locale]}
              </Text>
              {step.condition ? (
                <Text brand color="onSurfaceVariant">
                  {step.condition[locale]}
                </Text>
              ) : null}
              {task.stepStates[step.id] ? (
                <Text brand accessibilityLiveRegion="polite">
                  {text(task.stepStates[step.id] === 'done' ? 'completedStep' : 'skippedStep')}
                </Text>
              ) : null}
              {child && task.status === 'in_progress' ? (
                <CloudActions>
                  <CloudAction
                    disabled={disabled || task.stepStates[step.id] === 'done'}
                    onPress={() =>
                      void controller.command({
                        type: 'set_step',
                        taskId: task.id,
                        expectedRevision: task.revision,
                        stepId: step.id,
                        state: 'done',
                      })
                    }
                    testID={`cloud-step-done-${step.id}`}
                  >
                    {text('stepDone')}
                  </CloudAction>
                  {step.kind !== 'action' ? (
                    <CloudAction
                      disabled={disabled || task.stepStates[step.id] === 'skipped'}
                      variant="secondary"
                      testID={`cloud-step-skip-${step.id}`}
                      onPress={() =>
                        void controller.command({
                          type: 'set_step',
                          taskId: task.id,
                          expectedRevision: task.revision,
                          stepId: step.id,
                          state: 'skipped',
                        })
                      }
                    >
                      {text('stepSkip')}
                    </CloudAction>
                  ) : null}
                </CloudActions>
              ) : null}
            </View>
          ))}
        </CloudSection>
      ) : null}
      {child && ['assigned', 'accepted', 'in_progress'].includes(task.status) ? (
        <CloudPreparedTaskGuide key={task.id} task={task} />
      ) : null}
      {child && ['assigned', 'accepted', 'in_progress'].includes(task.status) ? (
        <CloudAction
          disabled={disabled || task.helpRequested}
          onPress={() => void command('request_help')}
          variant="secondary"
          testID="cloud-task-help"
        >
          {text('requestHelp')}
        </CloudAction>
      ) : null}
      {child && task.status === 'in_progress' ? (
        <>
          {!stepsReadyForReview ? <Text brand>{text('requiredSteps')}</Text> : null}
          <CloudAction
            disabled={disabled || !stepsReadyForReview}
            onPress={() => void command('submit_task')}
            testID="cloud-task-submit"
          >
            {text('submit')}
          </CloudAction>
        </>
      ) : null}
      {child && ['submitted', 'praised'].includes(task.status) ? (
        <Text brand>{text('awaitingParent')}</Text>
      ) : null}
      {task.praise ? (
        <View style={cloudStyles.status} testID="cloud-task-parent-praise">
          <Text brand>{task.praise}</Text>
        </View>
      ) : null}
      {parent && task.status === 'submitted' ? (
        <CloudSection title={text('praise')}>
          <CloudField
            label={text('praise')}
            helperText={text('praiseHint')}
            value={praise}
            onChangeText={setPraise}
            editable={!disabled}
            maxLength={500}
            multiline
            testID="cloud-task-praise-input"
          />
          <CloudAction
            disabled={disabled || !praise.trim()}
            onPress={() =>
              void controller.command({
                type: 'praise_task',
                taskId: task.id,
                expectedRevision: task.revision,
                praise: praise.trim(),
              })
            }
            testID="cloud-task-praise"
          >
            {text('praiseAction')}
          </CloudAction>
        </CloudSection>
      ) : null}
      {parent && task.status === 'praised' ? (
        <CloudAction
          disabled={disabled}
          onPress={() => void confirm()}
          testID="cloud-task-recognize"
        >
          {text('confirm')}
        </CloudAction>
      ) : null}
      {task.status === 'recognized' ? (
        <View style={cloudStyles.status}>
          <Text brand>{text('confirmed')}</Text>
          <CloudActions>
            <CloudAction onPress={() => onGarden()} variant="secondary">
              {text('viewGarden')}
            </CloudAction>
            {parent && eligibleMemory ? (
              memory ? (
                <Text brand>{text('memorySaved')}</Text>
              ) : (
                <CloudAction
                  disabled={disabled}
                  onPress={() => void command('save_memory')}
                  testID="cloud-task-save-memory"
                >
                  {text('saveMemory')}
                </CloudAction>
              )
            ) : null}
          </CloudActions>
        </View>
      ) : null}
    </CloudSection>
  );
}
