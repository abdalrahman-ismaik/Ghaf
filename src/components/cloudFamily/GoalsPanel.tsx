import { useState } from 'react';
import { View } from 'react-native';
import type {
  AcademicGoal,
  AcademicGoalInput,
  StudyCriterion,
  StudyPrize,
  StudyReportedResult,
} from '@/models/study';
import type { CloudCommand } from '@/models/normalizedCloudFamily';
import {
  CloudButton,
  CloudChoice,
  CloudEditReview,
  CloudInput,
  CloudMemberPicker,
  CloudNotice,
  CloudText,
  cloudNumber,
  cloudPanelStyles as s,
  useCloudCommand,
  useCloudPresentation,
  type CloudPanelProps,
} from './StudyPanel';

export function GoalsPanel({ snapshot, busy, command }: CloudPanelProps) {
  const { text, row } = useCloudPresentation();
  const action = useCloudCommand(busy, command);
  const [editor, setEditor] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editVersion, setEditVersion] = useState<number | null>(null);
  const [member, setMember] = useState('');
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [support, setSupport] = useState('');
  const [criterionKind, setCriterionKind] = useState<StudyCriterion['kind']>('practice_count');
  const [target, setTarget] = useState('');
  const [description, setDescription] = useState('');
  const [threshold, setThreshold] = useState('');
  const [denominator, setDenominator] = useState('');
  const [prizeKind, setPrizeKind] = useState<StudyPrize['kind'] | 'none'>('none');
  const [prizeLabel, setPrizeLabel] = useState('');
  const parent = snapshot.actor.role === 'parent';
  const childId = parent ? member : (snapshot.actor.child_id ?? '');
  const childExists = snapshot.children.some((child) => child.id === childId && child.active);
  const goals = snapshot.extras.goals;
  const current = goals.find((goal) => goal.id === editing);
  const editable =
    !editing ||
    (current?.childAcceptedRevision === null &&
      ['proposed', 'change_requested', 'declined'].includes(current.status));
  const changed = Boolean(current && editVersion !== current.revision);
  function edit(goal: AcademicGoal) {
    if (goal.childAcceptedRevision !== null) return;
    setEditing(goal.id);
    setEditVersion(goal.revision);
    setEditor(true);
    setMember(goal.childId);
    setSubject(goal.subject);
    setTitle(goal.title);
    setNextStep(goal.nextStep);
    setSupport(goal.parentSupport);
    setCriterionKind(goal.criterion.kind);
    setPrizeKind(goal.prize?.kind ?? 'none');
    setPrizeLabel(goal.prize?.label ?? '');
    if (goal.criterion.kind === 'practice_count') setTarget(String(goal.criterion.target));
    else if (goal.criterion.kind === 'achievement') setDescription(goal.criterion.description);
    else {
      setThreshold(String(goal.criterion.threshold));
      setDenominator(String(goal.criterion.denominator));
    }
  }
  async function save() {
    if (changed || (editing && editVersion === null)) return;
    const targetNumber = cloudNumber(target);
    const thresholdNumber = cloudNumber(threshold);
    const denominatorNumber = cloudNumber(denominator);
    if (
      !childExists ||
      !editable ||
      !subject.trim() ||
      !title.trim() ||
      !nextStep.trim() ||
      !support.trim() ||
      (prizeKind !== 'none' && !prizeLabel.trim()) ||
      (criterionKind === 'practice_count' &&
        (!Number.isSafeInteger(targetNumber) || targetNumber < 1)) ||
      (criterionKind === 'achievement' && !description.trim()) ||
      (criterionKind === 'mark' &&
        (!Number.isFinite(thresholdNumber) ||
          !Number.isFinite(denominatorNumber) ||
          denominatorNumber <= 0 ||
          thresholdNumber < 0 ||
          thresholdNumber > denominatorNumber))
    ) {
      action.setNotice('invalid');
      return;
    }
    const criterion: StudyCriterion =
      criterionKind === 'practice_count'
        ? { kind: criterionKind, target: targetNumber }
        : criterionKind === 'achievement'
          ? { kind: criterionKind, description: description.trim() }
          : { kind: criterionKind, threshold: thresholdNumber, denominator: denominatorNumber };
    const input: AcademicGoalInput = {
      subject: subject.trim(),
      title: title.trim(),
      nextStep: nextStep.trim(),
      parentSupport: support.trim(),
      criterion,
      prize: prizeKind === 'none' ? null : { kind: prizeKind, label: prizeLabel.trim() },
    };
    if (
      await action.run(
        editing && editVersion !== null
          ? { type: 'goal.edit', id: editing, expectedRevision: editVersion, input }
          : { type: 'goal.create', childId, input },
      )
    ) {
      setEditor(false);
      setEditing(null);
      setSubject('');
      setTitle('');
      setNextStep('');
      setSupport('');
      setTarget('');
      setDescription('');
      setThreshold('');
      setDenominator('');
      setPrizeKind('none');
      setPrizeLabel('');
    }
  }
  return (
    <View style={s.stack} testID="cloud-goals-panel">
      <CloudText variant="heading">{text('goals.title')}</CloudText>
      <CloudText color="inkMuted">{text('goals.body')}</CloudText>
      {!editor ? (
        <CloudButton onPress={() => setEditor(true)} testID="cloud-goal-create">
          {text(title || subject || nextStep ? 'study.resumeDraft' : 'goals.create')}
        </CloudButton>
      ) : null}
      {editor ? (
        <View style={s.editor} testID="cloud-goal-editor">
          <CloudMemberPicker
            snapshot={snapshot}
            value={member}
            onChange={setMember}
            disabled={action.disabled || editing !== null}
          />
          <CloudInput
            editable={!action.disabled}
            label={text('study.subject')}
            value={subject}
            onChangeText={setSubject}
            maxLength={80}
            testID="cloud-goal-subject"
          />
          <CloudInput
            editable={!action.disabled}
            label={text('goals.titleField')}
            value={title}
            onChangeText={setTitle}
            maxLength={120}
            testID="cloud-goal-title"
          />
          <CloudInput
            editable={!action.disabled}
            label={text('study.nextStep')}
            value={nextStep}
            onChangeText={setNextStep}
            maxLength={300}
            multiline
            testID="cloud-goal-next-step"
          />
          <CloudInput
            editable={!action.disabled}
            label={text('study.parentSupport')}
            value={support}
            onChangeText={setSupport}
            maxLength={300}
            multiline
            testID="cloud-goal-support"
          />
          <CloudText variant="label">{text('goals.criterion')}</CloudText>
          <View style={row} accessibilityRole="radiogroup">
            {(['practice_count', 'achievement', 'mark'] as const).map((item) => (
              <CloudChoice
                disabled={action.disabled}
                selected={criterionKind === item}
                key={item}
                onPress={() => setCriterionKind(item)}
                testID={`cloud-goal-criterion-${item}`}
              >
                {text(`goals.${item}`)}
              </CloudChoice>
            ))}
          </View>
          {criterionKind === 'practice_count' ? (
            <CloudInput
              editable={!action.disabled}
              label={text('goals.target')}
              value={target}
              onChangeText={setTarget}
              keyboardType="number-pad"
              maxLength={4}
              testID="cloud-goal-target"
            />
          ) : criterionKind === 'achievement' ? (
            <CloudInput
              editable={!action.disabled}
              label={text('goals.description')}
              value={description}
              onChangeText={setDescription}
              maxLength={300}
              testID="cloud-goal-description"
            />
          ) : (
            <>
              <CloudInput
                editable={!action.disabled}
                label={text('goals.threshold')}
                value={threshold}
                onChangeText={setThreshold}
                keyboardType="decimal-pad"
                maxLength={8}
                testID="cloud-goal-threshold"
              />
              <CloudInput
                editable={!action.disabled}
                label={text('goals.denominator')}
                value={denominator}
                onChangeText={setDenominator}
                keyboardType="decimal-pad"
                maxLength={8}
                testID="cloud-goal-denominator"
              />
            </>
          )}
          <CloudText variant="label">{text('goals.prize')}</CloudText>
          <View style={row} accessibilityRole="radiogroup">
            {(['none', 'gift', 'experience', 'privilege'] as const).map((item) => (
              <CloudChoice
                disabled={action.disabled}
                selected={prizeKind === item}
                key={item}
                onPress={() => setPrizeKind(item)}
                testID={`cloud-goal-prize-${item}`}
              >
                {text(`goals.${item}`)}
              </CloudChoice>
            ))}
          </View>
          {prizeKind !== 'none' ? (
            <CloudInput
              editable={!action.disabled}
              label={text('goals.prizeLabel')}
              value={prizeLabel}
              onChangeText={setPrizeLabel}
              maxLength={160}
              testID="cloud-goal-prize-label"
            />
          ) : null}
          {!editable ? <CloudNotice>{text('goals.immutable')}</CloudNotice> : null}
          {changed && current && editable ? (
            <CloudEditReview
              testID="cloud-goal-conflict"
              disabled={action.disabled}
              onKeep={() => setEditVersion(current.revision)}
              onReload={() => edit(current)}
            >
              <CloudText>
                {current.subject} · {current.title}
              </CloudText>
              <CloudText>{current.nextStep}</CloudText>
              <CloudText>
                {text('study.parentSupport')}: {current.parentSupport}
              </CloudText>
              <CloudText>
                {current.criterion.kind === 'practice_count'
                  ? text('goals.practiceTarget', { count: current.criterion.target })
                  : current.criterion.kind === 'mark'
                    ? text('goals.markTarget', {
                        threshold: current.criterion.threshold,
                        denominator: current.criterion.denominator,
                      })
                    : current.criterion.description}
              </CloudText>
              <CloudText>
                {current.prize
                  ? `${text(`goals.${current.prize.kind}`)} · ${current.prize.label}`
                  : text('goals.none')}
              </CloudText>
            </CloudEditReview>
          ) : null}
          <CloudButton
            disabled={action.disabled || !childExists || !editable || changed}
            onPress={() => void save()}
            testID="cloud-goal-save"
          >
            {text('study.save')}
          </CloudButton>
          <CloudButton variant="quiet" disabled={action.disabled} onPress={() => setEditor(false)}>
            {text('study.cancel')}
          </CloudButton>
        </View>
      ) : null}
      {action.notice ? (
        <CloudNotice error={action.notice !== 'saved'}>
          {text(`study.${action.notice}`)}
        </CloudNotice>
      ) : null}
      {goals.length === 0 ? <CloudText>{text('goals.empty')}</CloudText> : null}
      {goals.map((goal) => (
        <CloudGoalRow
          key={goal.id}
          goal={goal}
          parent={parent}
          nickname={snapshot.children.find((child) => child.id === goal.childId)?.nickname ?? ''}
          disabled={action.disabled}
          editDisabled={editor}
          run={action.run}
          onEdit={() => edit(goal)}
        />
      ))}
      <CloudText variant="caption" color="inkMuted">
        {text('goals.boundary')}
      </CloudText>
    </View>
  );
}

function CloudGoalRow({
  goal,
  parent,
  nickname,
  disabled,
  editDisabled,
  run,
  onEdit,
}: {
  goal: AcademicGoal;
  parent: boolean;
  nickname: string;
  disabled: boolean;
  editDisabled: boolean;
  run: (value: CloudCommand) => Promise<boolean>;
  onEdit: () => void;
}) {
  const { text, row } = useCloudPresentation();
  const [value, setValue] = useState('');
  const [achieved, setAchieved] = useState<boolean | null>(null);
  const [acknowledgement, setAcknowledgement] = useState('');
  const [invalid, setInvalid] = useState(false);
  const accepted = goal.childAcceptedRevision !== null;
  const criterionText =
    goal.criterion.kind === 'practice_count'
      ? text('goals.practiceTarget', { count: goal.criterion.target })
      : goal.criterion.kind === 'mark'
        ? text('goals.markTarget', {
            threshold: goal.criterion.threshold,
            denominator: goal.criterion.denominator,
          })
        : goal.criterion.description;
  const last = goal.submissions.at(-1);
  async function submit() {
    const number = cloudNumber(value);
    if (
      (goal.criterion.kind === 'achievement' && achieved === null) ||
      (goal.criterion.kind !== 'achievement' && (!Number.isFinite(number) || number < 0)) ||
      (goal.criterion.kind === 'practice_count' && !Number.isInteger(number)) ||
      (goal.criterion.kind === 'mark' && number > goal.criterion.denominator)
    ) {
      setInvalid(true);
      return;
    }
    const result: StudyReportedResult =
      goal.criterion.kind === 'achievement'
        ? { kind: 'achievement', achieved: achieved === true }
        : goal.criterion.kind === 'practice_count'
          ? { kind: 'practice_count', count: number }
          : { kind: 'mark', value: number };
    if (await run({ type: 'goal.submit', id: goal.id, result })) {
      setValue('');
      setAchieved(null);
      setInvalid(false);
    }
  }
  return (
    <View style={s.record} testID={`cloud-goal-${goal.id}`}>
      <CloudText variant="heading">{goal.title}</CloudText>
      <CloudText color="inkMuted">
        {[parent ? nickname : '', goal.subject, text(`goals.${goal.status}`)]
          .filter(Boolean)
          .join(' · ')}
      </CloudText>
      <CloudText>{goal.nextStep}</CloudText>
      <CloudText variant="label">{text('goals.criterion')}</CloudText>
      <CloudText tabular>{criterionText}</CloudText>
      <CloudText variant="label">{text('study.parentSupport')}</CloudText>
      <CloudText>{goal.parentSupport}</CloudText>
      <CloudText variant="caption">{text('goals.revision', { number: goal.revision })}</CloudText>
      {goal.prize ? (
        <CloudNotice>
          <CloudText>{goal.prize.label}</CloudText>
          {goal.prizeStatus ? (
            <CloudText testID={`cloud-goal-prize-status-${goal.id}`}>
              {text(`goals.${goal.prizeStatus}`)}
            </CloudText>
          ) : null}
        </CloudNotice>
      ) : null}
      {accepted ? <CloudText variant="caption">{text('goals.immutable')}</CloudText> : null}
      {!accepted && goal.status === 'proposed' ? (
        <View style={s.group}>
          <CloudText>
            {text(
              goal.parentApprovedRevision === goal.revision
                ? 'goals.waitingChild'
                : 'goals.waitingParent',
            )}
          </CloudText>
          {parent && goal.parentApprovedRevision !== goal.revision ? (
            <CloudButton
              disabled={disabled}
              onPress={() =>
                void run({ type: 'goal.approve', id: goal.id, expectedRevision: goal.revision })
              }
              testID={`cloud-goal-approve-${goal.id}`}
            >
              {text('goals.approve')}
            </CloudButton>
          ) : null}
          {!parent ? (
            <>
              <CloudButton
                disabled={disabled || goal.parentApprovedRevision !== goal.revision}
                onPress={() =>
                  void run({ type: 'goal.accept', id: goal.id, expectedRevision: goal.revision })
                }
                testID={`cloud-goal-accept-${goal.id}`}
              >
                {text('goals.accept')}
              </CloudButton>
              <CloudButton
                variant="quiet"
                disabled={disabled}
                onPress={() => void run({ type: 'goal.decline', id: goal.id })}
              >
                {text('goals.decline')}
              </CloudButton>
            </>
          ) : null}
        </View>
      ) : null}
      {!accepted && ['proposed', 'change_requested', 'declined'].includes(goal.status) ? (
        <CloudButton
          variant="secondary"
          disabled={disabled || editDisabled}
          onPress={onEdit}
          testID={`cloud-goal-edit-${goal.id}`}
        >
          {text('goals.edit')}
        </CloudButton>
      ) : null}
      {!parent && accepted && ['active', 'paused', 'change_requested'].includes(goal.status) ? (
        <View style={row}>
          <CloudButton
            variant="secondary"
            disabled={disabled}
            onPress={() =>
              void run({
                type: goal.status === 'active' ? 'goal.pause' : 'goal.resume',
                id: goal.id,
              })
            }
          >
            {text(goal.status === 'active' ? 'goals.pause' : 'goals.resume')}
          </CloudButton>
          {goal.status !== 'change_requested' ? (
            <CloudButton
              variant="quiet"
              disabled={disabled}
              onPress={() => void run({ type: 'goal.request_change', id: goal.id })}
            >
              {text('goals.requestChange')}
            </CloudButton>
          ) : null}
        </View>
      ) : null}
      {!parent && goal.status === 'active' ? (
        <View style={s.group}>
          <CloudText variant="label">{text('goals.report')}</CloudText>
          {goal.criterion.kind === 'achievement' ? (
            <View style={row} accessibilityRole="radiogroup">
              <CloudChoice
                disabled={disabled}
                selected={achieved === true}
                onPress={() => setAchieved(true)}
              >
                {text('goals.achieved')}
              </CloudChoice>
              <CloudChoice
                disabled={disabled}
                selected={achieved === false}
                onPress={() => setAchieved(false)}
              >
                {text('goals.notYet')}
              </CloudChoice>
            </View>
          ) : (
            <CloudInput
              editable={!disabled}
              label={text('goals.result')}
              value={value}
              onChangeText={setValue}
              keyboardType="decimal-pad"
              maxLength={8}
              testID={`cloud-goal-result-${goal.id}`}
            />
          )}
          {invalid ? <CloudText color="danger">{text('study.invalid')}</CloudText> : null}
          <CloudButton
            disabled={disabled}
            onPress={() => void submit()}
            testID={`cloud-goal-submit-${goal.id}`}
          >
            {text('goals.submit')}
          </CloudButton>
          <CloudText variant="caption">{text('goals.selfReport')}</CloudText>
        </View>
      ) : null}
      {goal.submissions.map((submission) => (
        <View style={s.group} key={submission.id}>
          <CloudText tabular>
            {text('goals.result')}:{' '}
            {submission.result.kind === 'achievement'
              ? text(submission.result.achieved ? 'goals.achieved' : 'goals.notYet')
              : submission.result.kind === 'mark'
                ? submission.result.value
                : submission.result.count}
          </CloudText>
          {submission.acknowledgement ? <CloudText>{submission.acknowledgement}</CloudText> : null}
          {submission.metCriterion === false ? (
            <CloudText>{text('goals.belowTarget')}</CloudText>
          ) : null}
        </View>
      ))}
      {parent && goal.status === 'awaiting_confirmation' && last && last.reviewedAt === null ? (
        <View style={s.group}>
          <CloudInput
            editable={!disabled}
            label={text('goals.acknowledgement')}
            value={acknowledgement}
            onChangeText={setAcknowledgement}
            maxLength={300}
            multiline
            testID={`cloud-goal-acknowledgement-${goal.id}`}
          />
          <CloudButton
            disabled={disabled || !acknowledgement.trim()}
            onPress={() =>
              void run({
                type: 'goal.confirm',
                id: goal.id,
                submissionId: last.id,
                acknowledgement: acknowledgement.trim(),
              })
            }
            testID={`cloud-goal-confirm-${goal.id}`}
          >
            {text('goals.confirm')}
          </CloudButton>
        </View>
      ) : null}
      {parent && goal.prizeStatus === 'unlocked' ? (
        <CloudButton
          disabled={disabled}
          onPress={() => void run({ type: 'goal.give', id: goal.id })}
          testID={`cloud-goal-give-${goal.id}`}
        >
          {text('goals.give')}
        </CloudButton>
      ) : null}
    </View>
  );
}
