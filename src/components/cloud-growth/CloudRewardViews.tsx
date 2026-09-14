import { useState } from 'react';
import { View } from 'react-native';

import type { CloudGrowthCommand, CloudRewardPlan } from '@/models/cloudGrowth';
import type { LandscapeId } from '@/models/familyGrowth';
import type {
  FamilyRewardMilestone,
  FamilyRewardMilestoneStage,
  FamilyRewardPromiseKind,
} from '@/models/familyReward';

import {
  GrowthButton,
  GrowthField,
  GrowthRow,
  GrowthText,
  growthStyles as s,
  useGrowthCopy,
  useGrowthPassword,
} from './common';

const landscapes: readonly LandscapeId[] = ['ghaf', 'samar', 'sidr', 'date_palm', 'mangrove'];
const stages: readonly FamilyRewardMilestoneStage[] = ['shoot', 'sapling', 'shade', 'flourishing'];
const kinds: readonly FamilyRewardPromiseKind[] = ['experience', 'gift', 'privilege', 'money'];
const milestones: readonly FamilyRewardMilestone['kind'][] = [
  'eligible_seed_delta',
  'landscape_stage',
  'landscapes_at_stage',
];

function numeric(value: string): string {
  return value
    .trim()
    .replace(/[٠-٩]/gu, (digit) => String(digit.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/gu, (digit) => String(digit.charCodeAt(0) - 0x6f0))
    .replace('٫', '.');
}
export function parsePromiseAmount(value: string): number | null {
  const normalized = numeric(value);
  if (!/^\d+(?:\.\d{1,2})?$/u.test(normalized)) return null;
  const [whole, fraction = ''] = normalized.split('.');
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}

export function isReachableRewardMilestone(milestone: FamilyRewardMilestone): boolean {
  if (milestone.kind === 'landscape_stage') return milestone.landscapeId === 'mangrove';
  if (milestone.kind === 'landscapes_at_stage') return milestone.requiredCount === 1;
  return Number.isSafeInteger(milestone.requiredSeedDelta) && milestone.requiredSeedDelta > 0;
}

export function CloudRewardForm({
  childId,
  plan,
  busy,
  onSave,
  onCancel,
}: {
  readonly childId: string;
  readonly plan?: CloudRewardPlan;
  readonly busy: boolean;
  readonly onSave: (command: CloudGrowthCommand, password?: string) => Promise<boolean>;
  readonly onCancel: () => void;
}) {
  const { text, locale, number } = useGrowthCopy();
  const [label, setLabel] = useState(plan?.promise.label[locale] ?? '');
  const [kind, setKind] = useState<FamilyRewardPromiseKind>(plan?.promise.kind ?? 'experience');
  const [month, setMonth] = useState(plan?.month ?? new Date().toISOString().slice(0, 7));
  const [amount, setAmount] = useState(
    plan?.promise.kind === 'money' ? String(plan.promise.amountMinor / 100) : '',
  );
  const [currency, setCurrency] = useState(
    plan?.promise.kind === 'money' ? plan.promise.currency : 'AED',
  );
  const [milestoneKind, setMilestoneKind] = useState<FamilyRewardMilestone['kind']>(
    plan?.milestone.kind ?? 'eligible_seed_delta',
  );
  const [required, setRequired] = useState(
    plan?.milestone.kind === 'eligible_seed_delta' ? String(plan.milestone.requiredSeedDelta) : '',
  );
  const [count, setCount] = useState(
    plan?.milestone.kind === 'landscapes_at_stage' ? String(plan.milestone.requiredCount) : '1',
  );
  const [landscape, setLandscape] = useState<LandscapeId>(
    plan?.milestone.kind === 'landscape_stage' ? plan.milestone.landscapeId : 'mangrove',
  );
  const [stage, setStage] = useState<FamilyRewardMilestoneStage>(
    plan?.milestone.kind !== 'eligible_seed_delta' && plan ? plan.milestone.targetStage : 'shoot',
  );
  const [password, setPassword] = useGrowthPassword();
  const [invalid, setInvalid] = useState(false);
  const needsPassword = Boolean(plan) || kind === 'money';
  const immutable = plan !== undefined && plan.lifecycle !== 'promised';
  const supportedTarget =
    milestoneKind === 'eligible_seed_delta' ||
    (milestoneKind === 'landscape_stage' ? landscape === 'mangrove' : Number(numeric(count)) === 1);
  const save = () => {
    if (immutable || !supportedTarget) return;
    const normalizedLabel = label.trim();
    const normalizedCurrency = currency.trim().toUpperCase();
    const amountMinor = parsePromiseAmount(amount);
    const numberValue = Number(numeric(milestoneKind === 'eligible_seed_delta' ? required : count));
    if (
      !normalizedLabel ||
      normalizedLabel.length > 200 ||
      !/^\d{4}-(?:0[1-9]|1[0-2])$/u.test(month) ||
      (kind === 'money' && (amountMinor === null || !/^[A-Z]{3}$/u.test(normalizedCurrency))) ||
      (milestoneKind !== 'landscape_stage' &&
        (!Number.isSafeInteger(numberValue) ||
          numberValue < 1 ||
          (milestoneKind === 'landscapes_at_stage' && numberValue > 5)))
    ) {
      setInvalid(true);
      return;
    }
    if (needsPassword && !password) {
      setInvalid(true);
      return;
    }
    const localizedLabel = {
      ...(plan?.promise.label ?? { ar: normalizedLabel, en: normalizedLabel }),
      [locale]: normalizedLabel,
    };
    const promise =
      kind === 'money'
        ? { kind, label: localizedLabel, currency: normalizedCurrency, amountMinor: amountMinor! }
        : { kind, label: localizedLabel };
    const milestone: FamilyRewardMilestone =
      milestoneKind === 'eligible_seed_delta'
        ? { kind: milestoneKind, requiredSeedDelta: numberValue }
        : milestoneKind === 'landscape_stage'
          ? { kind: milestoneKind, landscapeId: landscape, targetStage: stage }
          : { kind: milestoneKind, targetStage: stage, requiredCount: numberValue };
    if (!isReachableRewardMilestone(milestone)) {
      setInvalid(true);
      return;
    }
    const command: CloudGrowthCommand = plan
      ? {
          type: 'reward.revise',
          planId: plan.id,
          expectedVersion: plan.version,
          month,
          promise,
          milestone,
        }
      : { type: 'reward.create', childId, month, promise, milestone };
    setInvalid(false);
    setPassword('');
    void onSave(command, needsPassword ? password : undefined);
  };
  if (immutable)
    return (
      <View style={s.card} testID="cloud-reward-immutable">
        <GrowthText variant="heading">{plan.promise.label[locale]}</GrowthText>
        <GrowthText>{text(plan.lifecycle)}</GrowthText>
        <GrowthText>{text('rewardLocked')}</GrowthText>
        <GrowthButton variant="secondary" onPress={onCancel}>
          {text('back')}
        </GrowthButton>
      </View>
    );
  return (
    <View style={s.card} testID="cloud-reward-form">
      <GrowthText variant="heading" accessibilityRole="header">
        {text(plan ? 'reviseReward' : 'createReward')}
      </GrowthText>
      <GrowthText>{text('rewardEligibility')}</GrowthText>
      {plan ? <GrowthText>{text('revisionNotice')}</GrowthText> : null}
      <GrowthField
        label={text('rewardLabel')}
        value={label}
        onChangeText={setLabel}
        maxLength={200}
        editable={!busy}
      />
      <GrowthField
        label={text('month')}
        value={month}
        onChangeText={setMonth}
        maxLength={7}
        editable={!busy}
      />
      <GrowthRow>
        {kinds.map((value) => (
          <GrowthButton
            key={value}
            variant={kind === value ? 'primary' : 'secondary'}
            disabled={busy}
            accessibilityState={{ selected: kind === value }}
            onPress={() => setKind(value)}
          >
            {text(value)}
          </GrowthButton>
        ))}
      </GrowthRow>
      {kind === 'money' ? (
        <>
          <GrowthField
            label={text('amount')}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            maxLength={12}
            editable={!busy}
          />
          <GrowthField
            label={text('currency')}
            value={currency}
            onChangeText={setCurrency}
            autoCapitalize="characters"
            maxLength={3}
            editable={!busy}
          />
        </>
      ) : null}
      <GrowthRow>
        {milestones.map((value) => (
          <GrowthButton
            key={value}
            variant={milestoneKind === value ? 'primary' : 'secondary'}
            disabled={busy}
            accessibilityState={{ selected: milestoneKind === value }}
            onPress={() => setMilestoneKind(value)}
          >
            {text(value)}
          </GrowthButton>
        ))}
      </GrowthRow>
      {milestoneKind === 'eligible_seed_delta' ? (
        <GrowthField
          label={text('requiredSeeds')}
          value={required}
          onChangeText={setRequired}
          keyboardType="number-pad"
          maxLength={8}
          editable={!busy}
        />
      ) : (
        <>
          <GrowthText>{text('supportedRewardLandscape')}</GrowthText>
          <GrowthText>{text('crossingNotice')}</GrowthText>
          {milestoneKind === 'landscapes_at_stage' ? (
            <>
              <GrowthText>{text('requiredCount')}</GrowthText>
              <GrowthRow>
                {[1, 2, 3, 4, 5].map((value) => (
                  <GrowthButton
                    key={value}
                    testID={`cloud-reward-landscape-count-${value}`}
                    variant={Number(numeric(count)) === value ? 'primary' : 'secondary'}
                    disabled={busy || value !== 1}
                    accessibilityLabel={text('landscapeCountChoice', { count: number(value) })}
                    accessibilityState={{
                      selected: Number(numeric(count)) === value,
                      disabled: busy || value !== 1,
                    }}
                    onPress={() => {
                      if (value === 1) setCount(String(value));
                    }}
                  >
                    {number(value)}
                  </GrowthButton>
                ))}
              </GrowthRow>
            </>
          ) : (
            <>
              <GrowthText>{text('landscape')}</GrowthText>
              <GrowthRow>
                {landscapes.map((value) => (
                  <GrowthButton
                    key={value}
                    testID={`cloud-reward-landscape-${value}`}
                    variant={landscape === value ? 'primary' : 'secondary'}
                    disabled={busy || value !== 'mangrove'}
                    accessibilityState={{
                      selected: landscape === value,
                      disabled: busy || value !== 'mangrove',
                    }}
                    onPress={() => {
                      if (value === 'mangrove') setLandscape(value);
                    }}
                  >
                    {text(value)}
                  </GrowthButton>
                ))}
              </GrowthRow>
            </>
          )}
          <GrowthText>{text('stage')}</GrowthText>
          <GrowthRow>
            {stages.map((value) => (
              <GrowthButton
                key={value}
                variant={stage === value ? 'primary' : 'secondary'}
                disabled={busy}
                accessibilityState={{ selected: stage === value }}
                onPress={() => setStage(value)}
              >
                {text(value)}
              </GrowthButton>
            ))}
          </GrowthRow>
        </>
      )}
      {needsPassword ? (
        <>
          <GrowthText>{text('passwordNotice')}</GrowthText>
          <GrowthField
            label={text('password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            autoCapitalize="none"
            editable={!busy}
          />
        </>
      ) : null}
      {invalid ? <GrowthText accessibilityRole="alert">{text('validation')}</GrowthText> : null}
      <GrowthRow>
        <GrowthButton testID="cloud-reward-save" disabled={busy || !supportedTarget} onPress={save}>
          {text('confirm')}
        </GrowthButton>
        <GrowthButton
          variant="secondary"
          disabled={busy}
          onPress={() => {
            setPassword('');
            onCancel();
          }}
        >
          {text('cancel')}
        </GrowthButton>
      </GrowthRow>
    </View>
  );
}

export function CloudRewardList({
  plans,
  parent,
  busy,
  onCreate,
  onRevise,
  onGive,
}: {
  readonly plans: readonly CloudRewardPlan[];
  readonly parent: boolean;
  readonly busy: boolean;
  readonly onCreate: () => void;
  readonly onRevise: (plan: CloudRewardPlan) => void;
  readonly onGive: (plan: CloudRewardPlan) => void;
}) {
  const { text, locale, number } = useGrowthCopy();
  const monetary = new Map<string, { month: string; currency: string; amount: number }>();
  for (const plan of plans) {
    if (plan.promise.kind !== 'money') continue;
    const key = `${plan.month}:${plan.promise.currency}`;
    const total = monetary.get(key) ?? {
      month: plan.month,
      currency: plan.promise.currency,
      amount: 0,
    };
    total.amount += plan.promise.amountMinor;
    monetary.set(key, total);
  }
  return (
    <View style={s.stack} testID="cloud-reward-list">
      <GrowthText>{text('rewardBody')}</GrowthText>
      {parent ? (
        <GrowthButton onPress={onCreate} disabled={busy}>
          {text('createReward')}
        </GrowthButton>
      ) : null}
      {plans.length === 0 ? (
        <GrowthText testID="cloud-rewards-empty">{text('noRewards')}</GrowthText>
      ) : null}
      {plans.map((plan) => (
        <View key={plan.id} style={s.card}>
          <GrowthText variant="heading">{plan.promise.label[locale]}</GrowthText>
          <GrowthText>{text(plan.lifecycle)}</GrowthText>
          <GrowthText>{plan.month}</GrowthText>
          {plan.promise.kind === 'money' ? (
            <GrowthText>
              {text('monthlyAmount', {
                amount: number(plan.promise.amountMinor / 100),
                currency: plan.promise.currency,
              })}
            </GrowthText>
          ) : null}
          <GrowthText>
            {plan.milestone.kind === 'eligible_seed_delta'
              ? text('rewardSeedProgress', {
                  current: number(plan.eligibleSeeds),
                  required: number(plan.milestone.requiredSeedDelta),
                })
              : plan.milestone.kind === 'landscape_stage'
                ? text('rewardLandscapeProgress', {
                    landscape: text(plan.milestone.landscapeId),
                    before: number(plan.eligibleLandscapeBaseline[plan.milestone.landscapeId]),
                    added: number(plan.eligibleLandscapeSeeds[plan.milestone.landscapeId]),
                    stage: text(plan.milestone.targetStage),
                  })
                : text('rewardManyProgress', {
                    required: number(plan.milestone.requiredCount),
                    stage: text(plan.milestone.targetStage),
                  })}
          </GrowthText>
          {plan.milestone.kind !== 'eligible_seed_delta' ? (
            <GrowthText>{text('crossingNotice')}</GrowthText>
          ) : null}
          {plan.milestone.kind === 'landscapes_at_stage'
            ? landscapes.map((id) => (
                <GrowthText key={id}>
                  {text('rewardLandscapeProgress', {
                    landscape: text(id),
                    before: number(plan.eligibleLandscapeBaseline[id]),
                    added: number(plan.eligibleLandscapeSeeds[id]),
                    stage: text(
                      plan.milestone.kind === 'landscapes_at_stage'
                        ? plan.milestone.targetStage
                        : 'shoot',
                    ),
                  })}
                </GrowthText>
              ))
            : null}
          {plan.lifecycle !== 'promised' ? <GrowthText>{text('rewardLocked')}</GrowthText> : null}
          {parent && plan.lifecycle === 'promised' ? (
            <GrowthButton variant="secondary" disabled={busy} onPress={() => onRevise(plan)}>
              {text('reviseReward')}
            </GrowthButton>
          ) : null}
          {parent && plan.lifecycle === 'unlocked' ? (
            <GrowthButton disabled={busy} onPress={() => onGive(plan)}>
              {text('giveReward')}
            </GrowthButton>
          ) : null}
        </View>
      ))}
      {parent
        ? [...monetary.values()].map((entry) => (
            <View key={`${entry.month}:${entry.currency}`} style={s.notice}>
              <GrowthText>{text('monthly', { month: entry.month })}</GrowthText>
              <GrowthText>
                {text('monthlyAmount', {
                  amount: number(entry.amount / 100),
                  currency: entry.currency,
                })}
              </GrowthText>
            </View>
          ))
        : null}
    </View>
  );
}
