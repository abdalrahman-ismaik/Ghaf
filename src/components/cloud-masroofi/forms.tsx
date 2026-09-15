import { useState } from 'react';
import { View } from 'react-native';

import {
  MASROOFI_MAX_REWARD_FILS,
  MASROOFI_MAX_TOP_UP_FILS,
} from '@/features/cloud-masroofi/reference';
import { P0_RECYCLING_TEMPLATE, TASK_TEMPLATES } from '@/features/tasks/demoContent';
import type { CloudFamilyChild, CloudFamilyTask } from '@/models/cloudFamily';
import type {
  CloudMasroofiCard,
  CloudMasroofiCommand,
  CloudMasroofiPromise,
} from '@/models/cloudMasroofi';
import { MASROOFI_CATEGORIES, type MasroofiCategory } from '@/models/masroofi';

import {
  MasroofiButton,
  MasroofiField,
  MasroofiRow,
  MasroofiText,
  MasroofiToggle,
  masroofiStyles as s,
  useMasroofiCopy,
  useMasroofiPassword,
} from './common';

const rewardTemplates = new Set(['task_recycling_p0_v1', 'HR01', 'HR05', 'GI01', 'GI02', 'GI03']);

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonical(record[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value) ?? 'undefined';
}

function personalizeReference(value: unknown, name: string): unknown {
  if (Array.isArray(value)) return value.map((item) => personalizeReference(item, name));
  if (value === null || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      (key === 'ar' || key === 'en') && typeof item === 'string'
        ? item.replaceAll('Salem', name).replaceAll('سالم', name)
        : personalizeReference(item, name),
    ]),
  );
}

export function eligibleMasroofiTasks(
  tasks: readonly CloudFamilyTask[],
  child: CloudFamilyChild,
  promises: readonly CloudMasroofiPromise[],
) {
  return tasks.filter((task) => {
    const template = [P0_RECYCLING_TEMPLATE, ...TASK_TEMPLATES].find(
      (item) => item.id === task.catalogId,
    );
    const expected =
      task.catalogId === P0_RECYCLING_TEMPLATE.id
        ? personalizeReference(template, child.displayName)
        : template;
    return (
      child.active &&
      child.ageBand !== '6_8' &&
      task.childId === child.id &&
      task.familyId === child.familyId &&
      task.status === 'assigned' &&
      task.recognizedAt === null &&
      task.submittedAt === null &&
      rewardTemplates.has(task.catalogId) &&
      template !== undefined &&
      template.childAgeBands.includes(child.ageBand) &&
      template.routinePhase === 'acquisition' &&
      template.recognitionMode !== 'recognition_only' &&
      template.visibilityScope === 'household' &&
      (template.categoryId === 'green_impact' || template.categoryId === 'home_responsibility') &&
      canonical(task.template) === canonical(expected) &&
      !promises.some((promise) => promise.taskId === task.id)
    );
  });
}

export function parseMasroofiAmount(value: string, maximum: number): number | null {
  const normalized = value
    .trim()
    .replace(/[٠-٩]/gu, (digit) => String(digit.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/gu, (digit) => String(digit.charCodeAt(0) - 0x6f0))
    .replace('٫', '.');
  if (!/^\d+(?:\.\d{1,2})?$/u.test(normalized)) return null;
  const [whole, fraction = ''] = normalized.split('.');
  const fils = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(fils) && fils > 0 && fils <= maximum ? fils : null;
}

interface FormProps {
  readonly busy: boolean;
  readonly onSave: (command: CloudMasroofiCommand, password?: string) => Promise<boolean>;
  readonly onCancel: () => void;
}

function PasswordField({
  password,
  setPassword,
  busy,
}: {
  readonly password: string;
  readonly setPassword: (value: string) => void;
  readonly busy: boolean;
}) {
  const { text } = useMasroofiCopy();
  return (
    <MasroofiField
      label={text('password')}
      value={password}
      onChangeText={setPassword}
      secureTextEntry
      autoCapitalize="none"
      autoComplete="current-password"
      editable={!busy}
    />
  );
}

export function MasroofiEnrollmentForm({
  child,
  busy,
  onSave,
  onCancel,
}: FormProps & { readonly child: CloudFamilyChild }) {
  const { text } = useMasroofiCopy();
  const [confirmed, setConfirmed] = useState(false);
  const [password, setPassword] = useMasroofiPassword();
  return (
    <View style={s.section} testID="hosted-masroofi-enrollment">
      <MasroofiText variant="heading" accessibilityRole="header">
        {text('enableTitle')}
      </MasroofiText>
      <MasroofiText>{text('enableBody')}</MasroofiText>
      {child.ageBand === '6_8' ? (
        <MasroofiText>{text('underAge')}</MasroofiText>
      ) : (
        <>
          <MasroofiText>{text('enableZero')}</MasroofiText>
          <MasroofiToggle
            label={text('ageConfirm')}
            checked={confirmed}
            disabled={busy}
            onChange={setConfirmed}
          />
          <PasswordField password={password} setPassword={setPassword} busy={busy} />
          <MasroofiButton
            disabled={busy || !confirmed || !password}
            onPress={() => {
              if (busy || !confirmed || !password) return;
              const submitted = password;
              setPassword('');
              void onSave(
                { type: 'card.enable', childId: child.id, age10PlusConfirmed: true },
                submitted,
              );
            }}
          >
            {text('enable')}
          </MasroofiButton>
        </>
      )}
      <MasroofiButton variant="quiet" disabled={busy} onPress={onCancel}>
        {text('cancel')}
      </MasroofiButton>
    </View>
  );
}

export function MasroofiControlsForm({
  card,
  busy,
  onSave,
  onCancel,
}: FormProps & { readonly card: CloudMasroofiCard }) {
  const { text, money } = useMasroofiCopy();
  const [expectedVersion] = useState(card.controlsVersion);
  const conflict = expectedVersion !== card.controlsVersion;
  const [frozen, setFrozen] = useState(card.controls.frozen);
  const [onlineAllowed, setOnlineAllowed] = useState(card.controls.onlineAllowed);
  const [allowedCategories, setAllowedCategories] = useState<readonly MasroofiCategory[]>(
    card.controls.allowedCategories,
  );
  const [perPurchase, setPerPurchase] = useState(String(card.controls.perPurchaseLimitFils / 100));
  const [daily, setDaily] = useState(String(card.controls.dailyLimitFils / 100));
  const [password, setPassword] = useMasroofiPassword();
  const [invalid, setInvalid] = useState(false);
  const save = () => {
    if (busy || !password || conflict) return;
    const perPurchaseLimitFils = parseMasroofiAmount(perPurchase, MASROOFI_MAX_TOP_UP_FILS);
    const dailyLimitFils = parseMasroofiAmount(daily, MASROOFI_MAX_TOP_UP_FILS);
    if (perPurchaseLimitFils === null || dailyLimitFils === null) {
      setInvalid(true);
      return;
    }
    const submitted = password;
    setPassword('');
    setInvalid(false);
    void onSave(
      {
        type: 'card.controls',
        childId: card.childId,
        expectedVersion,
        controls: {
          frozen,
          onlineAllowed,
          allowedCategories,
          perPurchaseLimitFils,
          dailyLimitFils,
        },
      },
      submitted,
    );
  };
  return (
    <View style={s.section} testID="hosted-masroofi-controls">
      <MasroofiText variant="heading" accessibilityRole="header">
        {text('controlsTitle')}
      </MasroofiText>
      <MasroofiText>{text('controlsBody')}</MasroofiText>
      {conflict ? (
        <MasroofiText accessibilityRole="alert">{text('controlsConflict')}</MasroofiText>
      ) : null}
      <MasroofiToggle
        label={text('freeze')}
        checked={frozen}
        disabled={busy}
        onChange={setFrozen}
      />
      <MasroofiText variant="caption">{text('freezeHelp')}</MasroofiText>
      <MasroofiToggle
        label={text('online')}
        checked={onlineAllowed}
        disabled={busy}
        onChange={setOnlineAllowed}
      />
      <MasroofiText variant="control">{text('categories')}</MasroofiText>
      <MasroofiRow>
        {MASROOFI_CATEGORIES.map((category) => (
          <MasroofiToggle
            key={category}
            label={text(category)}
            checked={allowedCategories.includes(category)}
            disabled={busy}
            onChange={(checked) =>
              setAllowedCategories((current) =>
                checked ? [...current, category] : current.filter((value) => value !== category),
              )
            }
          />
        ))}
      </MasroofiRow>
      <MasroofiField
        label={text('purchaseLimit')}
        value={perPurchase}
        onChangeText={setPerPurchase}
        keyboardType="decimal-pad"
        maxLength={8}
        editable={!busy}
      />
      <MasroofiField
        label={text('dailyLimit')}
        value={daily}
        onChangeText={setDaily}
        keyboardType="decimal-pad"
        maxLength={8}
        editable={!busy}
      />
      <MasroofiText variant="caption">
        {text('amountRange', { minimum: money(1), maximum: money(MASROOFI_MAX_TOP_UP_FILS) })}
      </MasroofiText>
      {invalid ? (
        <MasroofiText accessibilityRole="alert">{text('errorAmount')}</MasroofiText>
      ) : null}
      <PasswordField password={password} setPassword={setPassword} busy={busy} />
      <MasroofiRow>
        <MasroofiButton disabled={busy || !password || conflict} onPress={save}>
          {text('saveControls')}
        </MasroofiButton>
        <MasroofiButton variant="quiet" disabled={busy} onPress={onCancel}>
          {text('cancel')}
        </MasroofiButton>
      </MasroofiRow>
    </View>
  );
}

export function MasroofiFundsForm({
  childId,
  busy,
  onSave,
  onCancel,
}: FormProps & { readonly childId: string }) {
  const { text, money } = useMasroofiCopy();
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useMasroofiPassword();
  const [invalid, setInvalid] = useState(false);
  const save = () => {
    if (busy || !password) return;
    const amountFils = parseMasroofiAmount(amount, MASROOFI_MAX_TOP_UP_FILS);
    if (amountFils === null) {
      setInvalid(true);
      return;
    }
    const submitted = password;
    setPassword('');
    setInvalid(false);
    void onSave({ type: 'card.top_up', childId, amountFils }, submitted);
  };
  return (
    <View style={s.section} testID="hosted-masroofi-funds">
      <MasroofiText variant="heading" accessibilityRole="header">
        {text('fundsTitle')}
      </MasroofiText>
      <MasroofiText>{text('fundsBody')}</MasroofiText>
      <MasroofiField
        label={text('topUpAmount')}
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        maxLength={8}
        editable={!busy}
      />
      <MasroofiText variant="caption">
        {text('topUpLimit', { amount: money(MASROOFI_MAX_TOP_UP_FILS) })}
      </MasroofiText>
      {invalid ? (
        <MasroofiText accessibilityRole="alert">{text('errorAmount')}</MasroofiText>
      ) : null}
      <PasswordField password={password} setPassword={setPassword} busy={busy} />
      <MasroofiRow>
        <MasroofiButton disabled={busy || !password || !amount} onPress={save}>
          {text('addFundsAction')}
        </MasroofiButton>
        <MasroofiButton variant="quiet" disabled={busy} onPress={onCancel}>
          {text('cancel')}
        </MasroofiButton>
      </MasroofiRow>
    </View>
  );
}

export function MasroofiRewardForm({
  child,
  tasks,
  promises,
  busy,
  onSave,
  onCancel,
}: FormProps & {
  readonly child: CloudFamilyChild;
  readonly tasks: readonly CloudFamilyTask[];
  readonly promises: readonly CloudMasroofiPromise[];
}) {
  const { text, locale, money } = useMasroofiCopy();
  const eligible = eligibleMasroofiTasks(tasks, child, promises);
  const [selected, setSelected] = useState<{ id: string; revision: number } | null>(null);
  const task = eligible.find((item) => item.id === selected?.id);
  const conflict = selected !== null && task?.revision !== selected.revision;
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useMasroofiPassword();
  const [invalid, setInvalid] = useState(false);
  const save = () => {
    if (busy || !password || !task || !selected || conflict) return;
    const amountFils = parseMasroofiAmount(amount, MASROOFI_MAX_REWARD_FILS);
    if (amountFils === null) {
      setInvalid(true);
      return;
    }
    const submitted = password;
    setPassword('');
    setInvalid(false);
    void onSave(
      {
        type: 'reward.promise',
        taskId: task.id,
        expectedTaskRevision: selected.revision,
        amountFils,
      },
      submitted,
    );
  };
  return (
    <View style={s.section} testID="hosted-masroofi-reward">
      <MasroofiText variant="heading" accessibilityRole="header">
        {text('rewardTitle')}
      </MasroofiText>
      <MasroofiText>{text('rewardBody')}</MasroofiText>
      <MasroofiText>{text('immutableTask')}</MasroofiText>
      {conflict ? (
        <MasroofiText accessibilityRole="alert">{text('taskConflict')}</MasroofiText>
      ) : null}
      {eligible.length === 0 ? (
        <MasroofiText>{text('noTasks')}</MasroofiText>
      ) : (
        <>
          <MasroofiText variant="control">{text('chooseTask')}</MasroofiText>
          <MasroofiRow>
            {eligible.map((item) => (
              <MasroofiButton
                key={item.id}
                disabled={busy}
                variant={item.id === selected?.id ? 'primary' : 'secondary'}
                accessibilityState={{ selected: item.id === selected?.id }}
                onPress={() => {
                  setSelected({ id: item.id, revision: item.revision });
                  setPassword('');
                }}
              >
                {item.template.title[locale]}
              </MasroofiButton>
            ))}
          </MasroofiRow>
          <MasroofiField
            label={text('rewardAmount')}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            maxLength={8}
            editable={!busy}
          />
          <MasroofiText variant="caption">
            {text('rewardLimit', { amount: money(MASROOFI_MAX_REWARD_FILS) })}
          </MasroofiText>
          {invalid ? (
            <MasroofiText accessibilityRole="alert">{text('errorAmount')}</MasroofiText>
          ) : null}
          <PasswordField password={password} setPassword={setPassword} busy={busy} />
          <MasroofiButton
            disabled={busy || !task || !password || !amount || conflict}
            onPress={save}
          >
            {text('lockReward')}
          </MasroofiButton>
        </>
      )}
      <MasroofiButton variant="quiet" disabled={busy} onPress={onCancel}>
        {text('cancel')}
      </MasroofiButton>
    </View>
  );
}
