import { useState } from 'react';
import { View } from 'react-native';
import type {
  CloudLandscapeId,
  CloudRewardInput,
  CloudRewardMilestone,
  CloudStage,
} from '@/models/normalizedCloudFamily';
import {
  CloudButton,
  CloudChoice,
  CloudEditReview,
  CloudInput,
  CloudMemberPicker,
  CloudNotice,
  CloudText,
  cloudDigits,
  cloudFils,
  cloudNumber,
  cloudPanelStyles as s,
  useCloudCommand,
  useCloudPresentation,
  type CloudPanelProps,
} from './StudyPanel';

export function RewardsPanel({ snapshot, busy, command }: CloudPanelProps) {
  const { text, amount, locale, row } = useCloudPresentation();
  const action = useCloudCommand(busy, command);
  const parent = snapshot.actor.role === 'parent';
  const [editor, setEditor] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editVersion, setEditVersion] = useState<number | null>(null);
  const [member, setMember] = useState('');
  const [label, setLabel] = useState('');
  const [kind, setKind] = useState<CloudRewardInput['kind']>('gift');
  const [value, setValue] = useState('');
  const [maximum, setMaximum] = useState('');
  const [month, setMonth] = useState('');
  const [milestoneKind, setMilestoneKind] =
    useState<CloudRewardMilestone['kind']>('eligible_seed_delta');
  const [seeds, setSeeds] = useState('');
  const [landscape, setLandscape] = useState<CloudLandscapeId | ''>('');
  const [stage, setStage] = useState<Exclude<CloudStage, 'seed'>>('shoot');
  const [count, setCount] = useState('');
  const rewards = snapshot.extras.rewards;
  const childExists = snapshot.children.some((child) => child.id === member && child.active);
  const editingRecord = rewards.find((reward) => reward.id === editing);
  const editable = !editing || editingRecord?.status === 'promised';
  const changed = Boolean(editingRecord && editVersion !== editingRecord.version);
  function edit(id: string) {
    const reward = rewards.find((item) => item.id === id);
    if (!reward || reward.status !== 'promised') return;
    setEditing(id);
    setEditVersion(reward.version);
    setEditor(true);
    setMember(reward.childId);
    setLabel(reward.label);
    setKind(reward.kind);
    setValue(reward.amountFils === null ? '' : String(reward.amountFils / 100));
    setMonth(reward.month);
    setMaximum(String(reward.monthlyMaximumFils / 100));
    setMilestoneKind(reward.milestone.kind);
    if (reward.milestone.kind === 'eligible_seed_delta')
      setSeeds(String(reward.milestone.requiredSeedDelta));
    else {
      setStage(reward.milestone.targetStage);
      if (reward.milestone.kind === 'landscape_stage') setLandscape(reward.milestone.landscapeId);
      else setCount(String(reward.milestone.requiredCount));
    }
  }
  async function save() {
    if (changed || (editing && editVersion === null)) return;
    const amountFils = cloudFils(value);
    const monthlyMaximumFils = cloudFils(maximum);
    const target = cloudNumber(seeds);
    const landscapeCount = cloudNumber(count);
    const normalizedMonth = cloudDigits(month);
    if (
      !parent ||
      !childExists ||
      !editable ||
      !label.trim() ||
      !/^\d{4}-(0[1-9]|1[0-2])$/.test(normalizedMonth) ||
      (kind === 'money' &&
        (!Number.isSafeInteger(amountFils) ||
          amountFils < 1 ||
          !Number.isSafeInteger(monthlyMaximumFils) ||
          monthlyMaximumFils < amountFils)) ||
      (milestoneKind === 'eligible_seed_delta' && (!Number.isSafeInteger(target) || target < 1)) ||
      (milestoneKind === 'landscape_stage' &&
        !snapshot.landscapes.some((item) => item.id === landscape)) ||
      (milestoneKind === 'landscapes_at_stage' &&
        (!Number.isInteger(landscapeCount) ||
          landscapeCount < 1 ||
          landscapeCount > snapshot.landscapes.length))
    ) {
      action.setNotice('invalid');
      return;
    }
    const milestone: CloudRewardMilestone =
      milestoneKind === 'eligible_seed_delta'
        ? { kind: milestoneKind, requiredSeedDelta: target }
        : milestoneKind === 'landscape_stage'
          ? { kind: milestoneKind, landscapeId: landscape as CloudLandscapeId, targetStage: stage }
          : { kind: milestoneKind, targetStage: stage, requiredCount: landscapeCount };
    const input: CloudRewardInput = {
      childId: member,
      label: label.trim(),
      kind,
      ...(kind === 'money' ? { amountFils } : {}),
      month: normalizedMonth,
      monthlyMaximumFils: kind === 'money' ? monthlyMaximumFils : 0,
      milestone,
    };
    if (
      await action.run(
        editing && editVersion !== null
          ? { type: 'reward.edit', id: editing, expectedVersion: editVersion, ...input }
          : { type: 'reward.create', ...input },
      )
    ) {
      setEditor(false);
      setEditing(null);
      setLabel('');
      setValue('');
      setMaximum('');
      setMonth('');
      setSeeds('');
      setLandscape('');
      setCount('');
    }
  }
  function milestoneText(milestone: CloudRewardMilestone) {
    if (milestone.kind === 'eligible_seed_delta')
      return text('rewards.seedTarget', { count: milestone.requiredSeedDelta });
    if (milestone.kind === 'landscapes_at_stage')
      return text('rewards.landscapesTarget', {
        count: milestone.requiredCount,
        stage: text(`rewards.${milestone.targetStage}`),
      });
    const name = snapshot.landscapes.find((item) => item.id === milestone.landscapeId);
    return text('rewards.landscapeTarget', {
      landscape: name ? (locale === 'ar' ? name.label_ar : name.label_en) : '',
      stage: text(`rewards.${milestone.targetStage}`),
    });
  }
  return (
    <View style={s.stack} testID="cloud-rewards-panel">
      <CloudText variant="heading">{text('rewards.title')}</CloudText>
      <CloudText color="inkMuted">{text('rewards.body')}</CloudText>
      {parent && !editor ? (
        <CloudButton onPress={() => setEditor(true)} testID="cloud-reward-create">
          {text(label ? 'study.resumeDraft' : 'rewards.create')}
        </CloudButton>
      ) : null}
      {parent && editor ? (
        <View style={s.editor} testID="cloud-reward-editor">
          <CloudMemberPicker
            snapshot={snapshot}
            value={member}
            onChange={setMember}
            disabled={action.disabled || editing !== null}
          />
          <CloudInput
            editable={!action.disabled}
            label={text('rewards.label')}
            value={label}
            onChangeText={setLabel}
            maxLength={160}
            testID="cloud-reward-label"
          />
          <CloudText variant="label">{text('rewards.kind')}</CloudText>
          <View style={row} accessibilityRole="radiogroup">
            {(['gift', 'experience', 'privilege', 'money'] as const).map((item) => (
              <CloudChoice
                disabled={action.disabled}
                selected={kind === item}
                key={item}
                onPress={() => setKind(item)}
                testID={`cloud-reward-kind-${item}`}
              >
                {text(`rewards.${item}`)}
              </CloudChoice>
            ))}
          </View>
          {kind === 'money' ? (
            <>
              <CloudInput
                editable={!action.disabled}
                label={text('rewards.amount')}
                value={value}
                onChangeText={setValue}
                keyboardType="decimal-pad"
                maxLength={9}
                testID="cloud-reward-amount"
              />
              <CloudInput
                editable={!action.disabled}
                label={text('rewards.maximum')}
                value={maximum}
                onChangeText={setMaximum}
                keyboardType="decimal-pad"
                maxLength={9}
                testID="cloud-reward-maximum"
              />
            </>
          ) : null}
          <CloudInput
            editable={!action.disabled}
            label={text('rewards.month')}
            value={month}
            onChangeText={setMonth}
            direction="ltr"
            maxLength={7}
            testID="cloud-reward-month"
          />
          <CloudText variant="label">{text('rewards.milestone')}</CloudText>
          <View style={row} accessibilityRole="radiogroup">
            {(['eligible_seed_delta', 'landscape_stage', 'landscapes_at_stage'] as const).map(
              (item) => (
                <CloudChoice
                  disabled={action.disabled}
                  selected={milestoneKind === item}
                  key={item}
                  onPress={() => setMilestoneKind(item)}
                >
                  {text(`rewards.${item}`)}
                </CloudChoice>
              ),
            )}
          </View>
          {milestoneKind === 'eligible_seed_delta' ? (
            <CloudInput
              editable={!action.disabled}
              label={text('rewards.seeds')}
              value={seeds}
              onChangeText={setSeeds}
              keyboardType="number-pad"
              maxLength={6}
              testID="cloud-reward-seeds"
            />
          ) : (
            <>
              {milestoneKind === 'landscape_stage' ? (
                <View style={s.group}>
                  <CloudText variant="label">{text('rewards.landscape')}</CloudText>
                  <View style={row} accessibilityRole="radiogroup">
                    {snapshot.landscapes.map((item) => (
                      <CloudChoice
                        disabled={action.disabled}
                        selected={landscape === item.id}
                        key={item.id}
                        onPress={() => setLandscape(item.id)}
                      >
                        {locale === 'ar' ? item.label_ar : item.label_en}
                      </CloudChoice>
                    ))}
                  </View>
                </View>
              ) : (
                <CloudInput
                  editable={!action.disabled}
                  label={text('rewards.count')}
                  value={count}
                  onChangeText={setCount}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              )}
              <CloudText variant="label">{text('rewards.stage')}</CloudText>
              <View style={row} accessibilityRole="radiogroup">
                {(['shoot', 'sapling', 'shade', 'flourishing'] as const).map((item) => (
                  <CloudChoice
                    disabled={action.disabled}
                    selected={stage === item}
                    key={item}
                    onPress={() => setStage(item)}
                  >
                    {text(`rewards.${item}`)}
                  </CloudChoice>
                ))}
              </View>
            </>
          )}
          {!editable ? <CloudNotice>{text('rewards.locked')}</CloudNotice> : null}
          {changed && editingRecord && editable ? (
            <CloudEditReview
              testID="cloud-reward-conflict"
              disabled={action.disabled}
              onKeep={() => setEditVersion(editingRecord.version)}
              onReload={() => edit(editingRecord.id)}
            >
              <CloudText>{editingRecord.label}</CloudText>
              <CloudText>
                {text(`rewards.${editingRecord.kind}`)} · {editingRecord.month}
              </CloudText>
              {editingRecord.kind === 'money' && editingRecord.amountFils !== null ? (
                <>
                  <CloudText tabular>{amount(editingRecord.amountFils)}</CloudText>
                  <CloudText tabular>
                    {text('rewards.maximum')}: {amount(editingRecord.monthlyMaximumFils)}
                  </CloudText>
                </>
              ) : null}
              <CloudText>{milestoneText(editingRecord.milestone)}</CloudText>
            </CloudEditReview>
          ) : null}
          <CloudButton
            disabled={action.disabled || !childExists || !editable || changed}
            onPress={() => void save()}
            testID="cloud-reward-save"
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
      {rewards.length === 0 ? <CloudText>{text('rewards.empty')}</CloudText> : null}
      {rewards.map((reward) => (
        <View style={s.record} key={reward.id} testID={`cloud-reward-${reward.id}`}>
          <CloudText variant="heading">{reward.label}</CloudText>
          <CloudText color="inkMuted">
            {[
              parent
                ? snapshot.children.find((child) => child.id === reward.childId)?.nickname
                : '',
              text(`rewards.${reward.status}`),
              reward.month,
            ]
              .filter(Boolean)
              .join(' · ')}
          </CloudText>
          {reward.kind === 'money' && reward.amountFils !== null ? (
            <CloudText tabular>{amount(reward.amountFils)}</CloudText>
          ) : null}
          <CloudText>{milestoneText(reward.milestone)}</CloudText>
          <CloudText tabular>{text('rewards.progress', { count: reward.eligibleSeeds })}</CloudText>
          {reward.status !== 'promised' ? (
            <CloudText variant="caption">{text('rewards.locked')}</CloudText>
          ) : null}
          {parent && reward.status === 'promised' ? (
            <CloudButton
              variant="secondary"
              disabled={action.disabled || editor}
              onPress={() => edit(reward.id)}
              testID={`cloud-reward-edit-${reward.id}`}
            >
              {text('rewards.edit')}
            </CloudButton>
          ) : null}
          {parent && reward.status === 'unlocked' ? (
            <CloudButton
              disabled={action.disabled}
              onPress={() => void action.run({ type: 'reward.give', id: reward.id })}
              testID={`cloud-reward-give-${reward.id}`}
            >
              {text('rewards.give')}
            </CloudButton>
          ) : null}
        </View>
      ))}
      <CloudText color="inkMuted" variant="caption">
        {text('rewards.boundary')}
      </CloudText>
    </View>
  );
}
