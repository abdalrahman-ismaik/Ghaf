import { useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Input, Text } from '@/components/primitives';
import { botanical, logicalRowDirection, spacing } from '@/design/tokens';
import type { CloudCommand, CloudCommandResult, CloudSnapshot } from '@/models/cloudFamily';
import type { StudyPlan } from '@/models/study';

export interface CloudPanelProps {
  snapshot: CloudSnapshot;
  busy: boolean;
  command: (command: CloudCommand) => Promise<CloudCommandResult | null>;
}

export function useCloudPresentation() {
  const { t, i18n } = useTranslation();
  const locale =
    i18n.resolvedLanguage?.startsWith('ar') || i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  const text = (key: string, values?: Record<string, unknown>) => t(`cloudFamily.${key}`, values);
  const amount = (fils: number) =>
    text('masroofi.amount', {
      amount: new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
        minimumFractionDigits: fils % 100 ? 2 : 0,
        maximumFractionDigits: 2,
      }).format(fils / 100),
    });
  const row: StyleProp<ViewStyle> = [
    cloudPanelStyles.row,
    { direction: 'ltr', flexDirection: logicalRowDirection(direction) },
  ];
  return { text, locale, direction, amount, row } as const;
}

export function CloudText(props: ComponentProps<typeof Text>) {
  const { locale, direction } = useCloudPresentation();
  return <Text brand language={locale} direction={direction} {...props} />;
}
export function CloudButton(props: ComponentProps<typeof Button>) {
  const { locale, direction } = useCloudPresentation();
  return <Button brand language={locale} direction={direction} {...props} />;
}
export function CloudInput(props: ComponentProps<typeof Input>) {
  const { locale, direction } = useCloudPresentation();
  return <Input brand language={locale} direction={direction} {...props} />;
}
export function CloudChoice({
  selected,
  children,
  ...props
}: ComponentProps<typeof Button> & { selected: boolean }) {
  return (
    <CloudButton
      fullWidth={false}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      variant={selected ? 'primary' : 'secondary'}
      {...props}
    >
      {children}
    </CloudButton>
  );
}
export function CloudNotice({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return (
    <View style={cloudPanelStyles.notice}>
      {typeof children === 'string' ? (
        <CloudText color={error ? 'danger' : 'deepForest'} accessibilityLiveRegion="polite">
          {children}
        </CloudText>
      ) : (
        children
      )}
    </View>
  );
}
export function CloudEditReview({
  children,
  testID,
  disabled,
  onKeep,
  onReload,
}: {
  children: ReactNode;
  testID: string;
  disabled: boolean;
  onKeep: () => void;
  onReload: () => void;
}) {
  const { text } = useCloudPresentation();
  return (
    <View style={cloudPanelStyles.notice} testID={testID}>
      <CloudText variant="heading" accessibilityLiveRegion="polite">
        {text('study.savedChanged')}
      </CloudText>
      <CloudText>{text('study.reviewDraft')}</CloudText>
      <CloudText variant="label">{text('study.latestSaved')}</CloudText>
      {children}
      <CloudButton
        disabled={disabled}
        variant="secondary"
        onPress={onKeep}
        testID={`${testID}-keep`}
      >
        {text('study.keepDraft')}
      </CloudButton>
      <CloudButton
        disabled={disabled}
        variant="quiet"
        onPress={onReload}
        testID={`${testID}-reload`}
      >
        {text('study.loadSaved')}
      </CloudButton>
    </View>
  );
}
export function CloudMemberPicker({
  snapshot,
  value,
  onChange,
  disabled,
}: {
  snapshot: CloudSnapshot;
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  const { text, row } = useCloudPresentation();
  if (snapshot.actor.role === 'child') return null;
  const children = snapshot.children.filter((child) => child.active);
  return (
    <View style={cloudPanelStyles.group}>
      <CloudText variant="label">{text('study.member')}</CloudText>
      {children.length === 0 ? <CloudText>{text('study.noMembers')}</CloudText> : null}
      <View accessibilityRole="radiogroup" style={row}>
        {children.map((child) => (
          <CloudChoice
            key={child.id}
            selected={value === child.id}
            disabled={disabled}
            onPress={() => onChange(child.id)}
            testID={`cloud-member-${child.id}`}
          >
            {child.nickname}
          </CloudChoice>
        ))}
      </View>
    </View>
  );
}
export function useCloudCommand(busy: boolean, command: CloudPanelProps['command']) {
  const guard = useRef(false);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<'saved' | 'saveFailed' | 'invalid' | null>(null);
  async function run(value: CloudCommand): Promise<boolean> {
    if (busy || guard.current) return false;
    guard.current = true;
    setPending(true);
    setNotice(null);
    try {
      const result = await command(value);
      setNotice(result ? 'saved' : 'saveFailed');
      return result !== null;
    } catch {
      setNotice('saveFailed');
      return false;
    } finally {
      guard.current = false;
      setPending(false);
    }
  }
  return { run, disabled: busy || pending, notice, setNotice };
}
export function cloudNumber(value: string): number {
  const normalized = cloudDigits(value).replace(/٫/g, '.');
  return normalized === '' ? Number.NaN : Number(normalized);
}
export function cloudFils(value: string): number {
  const number = cloudNumber(value);
  const fils = Math.round(number * 100);
  return Number.isSafeInteger(fils) && Math.abs(number * 100 - fils) < 0.000001 ? fils : Number.NaN;
}
export function cloudDigits(value: string): string {
  return value
    .trim()
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776));
}
export function cloudDate(value: string): string | null | false {
  const normalized = cloudDigits(value);
  if (!normalized) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return false;
  const date = new Date(`${normalized}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === normalized
    ? normalized
    : false;
}

export function StudyPanel({ snapshot, busy, command }: CloudPanelProps) {
  const { text } = useCloudPresentation();
  const action = useCloudCommand(busy, command);
  const [member, setMember] = useState('');
  const [editor, setEditor] = useState(false);
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [duration, setDuration] = useState('15');
  const [due, setDue] = useState('');
  const [revisit, setRevisit] = useState('');
  const childId = snapshot.actor.role === 'child' ? (snapshot.actor.child_id ?? '') : member;
  const childExists = snapshot.children.some((child) => child.id === childId && child.active);
  const plans = snapshot.extras.studyPlans;
  async function save() {
    const minutes = cloudNumber(duration);
    const dueDate = cloudDate(due);
    const revisitDate = cloudDate(revisit);
    if (
      !childExists ||
      !subject.trim() ||
      !title.trim() ||
      !nextStep.trim() ||
      !Number.isInteger(minutes) ||
      minutes < 1 ||
      minutes > 60 ||
      dueDate === false ||
      revisitDate === false
    ) {
      action.setNotice('invalid');
      return;
    }
    if (
      await action.run({
        type: 'study.create',
        childId,
        input: {
          subject: subject.trim(),
          title: title.trim(),
          nextStep: nextStep.trim(),
          durationMinutes: minutes,
          dueDate,
          revisitDate,
        },
      })
    ) {
      setEditor(false);
      setSubject('');
      setTitle('');
      setNextStep('');
      setDue('');
      setRevisit('');
    }
  }
  return (
    <View style={cloudPanelStyles.stack} testID="cloud-study-panel">
      <CloudText variant="heading">{text('study.title')}</CloudText>
      <CloudText color="inkMuted">{text('study.body')}</CloudText>
      {!editor ? (
        <CloudButton onPress={() => setEditor(true)} testID="cloud-study-create">
          {text(subject || title || nextStep ? 'study.resumeDraft' : 'study.create')}
        </CloudButton>
      ) : null}
      {editor ? (
        <View style={cloudPanelStyles.editor} testID="cloud-study-editor">
          <CloudMemberPicker
            snapshot={snapshot}
            value={member}
            onChange={setMember}
            disabled={action.disabled}
          />
          <CloudInput
            editable={!action.disabled}
            label={text('study.subject')}
            value={subject}
            onChangeText={setSubject}
            maxLength={80}
            testID="cloud-study-subject"
          />
          <CloudInput
            editable={!action.disabled}
            label={text('study.titleField')}
            value={title}
            onChangeText={setTitle}
            maxLength={120}
            testID="cloud-study-title"
          />
          <CloudInput
            editable={!action.disabled}
            label={text('study.nextStep')}
            value={nextStep}
            onChangeText={setNextStep}
            maxLength={300}
            multiline
            testID="cloud-study-next-step"
          />
          <CloudInput
            editable={!action.disabled}
            label={text('study.duration')}
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
            maxLength={3}
            testID="cloud-study-duration"
          />
          <CloudInput
            editable={!action.disabled}
            label={text('study.due')}
            value={due}
            onChangeText={setDue}
            maxLength={10}
            direction="ltr"
            testID="cloud-study-due"
          />
          <CloudInput
            editable={!action.disabled}
            label={text('study.revisit')}
            value={revisit}
            onChangeText={setRevisit}
            maxLength={10}
            direction="ltr"
            testID="cloud-study-revisit"
          />
          <CloudButton
            disabled={action.disabled || !childExists}
            busy={action.disabled}
            onPress={() => void save()}
            testID="cloud-study-save"
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
      {plans.length === 0 ? <CloudText>{text('study.empty')}</CloudText> : null}
      {plans.map((plan) => (
        <CloudStudyRow
          key={plan.id}
          plan={plan}
          parent={snapshot.actor.role === 'parent'}
          nickname={snapshot.children.find((child) => child.id === plan.childId)?.nickname ?? ''}
          disabled={action.disabled}
          run={action.run}
        />
      ))}
      <CloudText variant="caption" color="inkMuted">
        {text('study.boundary')}
      </CloudText>
    </View>
  );
}

function CloudStudyRow({
  plan,
  parent,
  nickname,
  disabled,
  run,
}: {
  plan: StudyPlan;
  parent: boolean;
  nickname: string;
  disabled: boolean;
  run: (value: CloudCommand) => Promise<boolean>;
}) {
  const { text, row } = useCloudPresentation();
  const [editor, setEditor] = useState(false);
  const [revisit, setRevisit] = useState(plan.revisitDate ?? '');
  const [invalid, setInvalid] = useState(false);
  async function saveRevisit() {
    const date = cloudDate(revisit);
    if (date === false) {
      setInvalid(true);
      return;
    }
    if (await run({ type: 'study.revisit', id: plan.id, date })) {
      setEditor(false);
      setInvalid(false);
    }
  }
  return (
    <View style={cloudPanelStyles.record} testID={`cloud-study-${plan.id}`}>
      <CloudText variant="heading">{plan.title}</CloudText>
      <CloudText color="inkMuted">
        {[parent ? nickname : '', plan.subject, text(`study.${plan.status}`)]
          .filter(Boolean)
          .join(' · ')}
      </CloudText>
      <CloudText>{plan.nextStep}</CloudText>
      <CloudText tabular>{text('study.minutes', { count: plan.durationMinutes })}</CloudText>
      {plan.dueDate ? <CloudText>{text('study.dueOn', { date: plan.dueDate })}</CloudText> : null}
      {plan.revisitDate ? (
        <CloudText>{text('study.revisitOn', { date: plan.revisitDate })}</CloudText>
      ) : null}
      {parent && plan.status === 'proposed' ? (
        <CloudText>{text('study.waitingChild')}</CloudText>
      ) : null}
      {!parent ? (
        <View style={row}>
          {plan.status === 'proposed' ? (
            <CloudButton
              disabled={disabled}
              onPress={() => void run({ type: 'study.accept', id: plan.id })}
              testID={`cloud-study-accept-${plan.id}`}
            >
              {text('study.accept')}
            </CloudButton>
          ) : null}
          {plan.status === 'planned' || plan.status === 'paused' ? (
            <CloudButton
              disabled={disabled}
              onPress={() => void run({ type: 'study.start', id: plan.id })}
            >
              {text('study.start')}
            </CloudButton>
          ) : null}
          {plan.status === 'active' ? (
            <>
              <CloudButton
                disabled={disabled}
                onPress={() => void run({ type: 'study.complete', id: plan.id })}
                testID={`cloud-study-complete-${plan.id}`}
              >
                {text('study.complete')}
              </CloudButton>
              <CloudButton
                variant="secondary"
                disabled={disabled}
                onPress={() => void run({ type: 'study.pause', id: plan.id })}
              >
                {text('study.pause')}
              </CloudButton>
            </>
          ) : null}
        </View>
      ) : null}
      {plan.helpRequest ? (
        <CloudNotice>
          <CloudText>
            {text('study.helpPending', { request: text(`study.${plan.helpRequest}`) })}
          </CloudText>
          <CloudButton
            variant="secondary"
            disabled={disabled}
            onPress={() => void run({ type: 'study.help_resolved', id: plan.id })}
          >
            {text('study.helpResolved')}
          </CloudButton>
        </CloudNotice>
      ) : null}
      {!parent && plan.status !== 'completed' && plan.status !== 'proposed' ? (
        <View style={cloudPanelStyles.group}>
          <CloudText variant="label">{text('study.help')}</CloudText>
          <View style={row}>
            {(['explain', 'smaller_step', 'together'] as const).map((request) => (
              <CloudButton
                key={request}
                fullWidth={false}
                variant="quiet"
                disabled={disabled}
                onPress={() => void run({ type: 'study.help', id: plan.id, request })}
              >
                {text(`study.${request}`)}
              </CloudButton>
            ))}
          </View>
        </View>
      ) : null}
      {plan.status !== 'completed' ? (
        <CloudButton variant="quiet" disabled={disabled} onPress={() => setEditor(!editor)}>
          {text('study.setRevisit')}
        </CloudButton>
      ) : null}
      {editor ? (
        <View style={cloudPanelStyles.group}>
          <CloudInput
            editable={!disabled}
            label={text('study.revisit')}
            value={revisit}
            onChangeText={setRevisit}
            maxLength={10}
            direction="ltr"
          />
          {invalid ? <CloudText color="danger">{text('study.invalid')}</CloudText> : null}
          <CloudButton disabled={disabled} onPress={() => void saveRevisit()}>
            {text('study.save')}
          </CloudButton>
        </View>
      ) : null}
    </View>
  );
}

export const cloudPanelStyles = StyleSheet.create({
  stack: { gap: spacing.lg },
  group: { gap: spacing.sm },
  row: { flexWrap: 'wrap', gap: spacing.xs, alignItems: 'center' },
  editor: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: botanical.radius.control,
    backgroundColor: botanical.colors.paper,
  },
  record: {
    gap: spacing.sm,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: botanical.colors.line,
  },
  notice: {
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: botanical.colors.sage,
    borderRadius: botanical.radius.small,
  },
});
