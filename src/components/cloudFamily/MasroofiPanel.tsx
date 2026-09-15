import { useState } from 'react';
import { Switch, View } from 'react-native';
import { MasroofiCard } from '@/components/masroofi/MasroofiCard';
import { botanical } from '@/design/tokens';
import {
  MASROOFI_CATEGORIES,
  type MasroofiCategory,
  type MasroofiControls,
} from '@/models/masroofi';
import {
  CloudButton,
  CloudChoice,
  CloudEditReview,
  CloudInput,
  CloudMemberPicker,
  CloudNotice,
  CloudText,
  cloudFils,
  cloudPanelStyles as s,
  useCloudCommand,
  useCloudPresentation,
  type CloudPanelProps,
} from './StudyPanel';

export function MasroofiPanel({ snapshot, busy, command }: CloudPanelProps) {
  const { text, locale, direction, amount, row } = useCloudPresentation();
  const action = useCloudCommand(busy, command);
  const parent = snapshot.actor.role === 'parent';
  const [member, setMember] = useState('');
  const [attested, setAttested] = useState(false);
  const [editControls, setEditControls] = useState(false);
  const [controlsVersion, setControlsVersion] = useState<number | null>(null);
  const [frozen, setFrozen] = useState(false);
  const [online, setOnline] = useState(false);
  const [categories, setCategories] = useState<readonly MasroofiCategory[]>([]);
  const [purchaseLimit, setPurchaseLimit] = useState('');
  const [dailyLimit, setDailyLimit] = useState('');
  const [topUp, setTopUp] = useState('');
  const [assignmentId, setAssignmentId] = useState('');
  const [assignmentVersion, setAssignmentVersion] = useState<number | null>(null);
  const [rewardAmount, setRewardAmount] = useState('');
  const [shopCategory, setShopCategory] = useState<MasroofiCategory>('stationery');
  const childId = parent ? member : (snapshot.actor.child_id ?? '');
  const child = snapshot.children.find((item) => item.id === childId && item.active);
  const data = snapshot.extras.masroofi;
  const card = data.cards.find((item) => item.childId === childId);
  const promises = data.promises.filter((item) => item.childId === childId);
  const transactions = data.transactions.filter((item) => item.childId === childId);
  const eligible = snapshot.assignments.filter(
    (assignment) =>
      assignment.child_id === childId &&
      assignment.state === 'assigned' &&
      !promises.some(
        (promise) =>
          promise.assignmentId === assignment.id && promise.taskVersion === assignment.task_version,
      ) &&
      snapshot.tasks.some(
        (task) =>
          task.id === assignment.task_id &&
          task.version === assignment.task_version &&
          task.reward_eligible,
      ),
  );
  const selectedTask = eligible.find(
    (item) => item.id === assignmentId && item.task_version === assignmentVersion,
  );
  const controlsChanged =
    editControls && card !== undefined && controlsVersion !== card.controlsVersion;
  const credited = [...promises]
    .reverse()
    .find((promise) => promise.status === 'credited' && typeof promise.amountFils === 'number');
  function selectMember(id: string) {
    setMember(id);
    setAttested(false);
    setAssignmentId('');
  }
  function openControls() {
    if (!card) return;
    setFrozen(card.controls.frozen);
    setOnline(card.controls.onlineAllowed);
    setCategories([...card.controls.allowedCategories]);
    setPurchaseLimit(String(card.controls.perPurchaseLimitFils / 100));
    setDailyLimit(String(card.controls.dailyLimitFils / 100));
    setControlsVersion(card.controlsVersion);
    setEditControls(true);
  }
  async function saveControls() {
    if (controlsChanged || controlsVersion === null) return;
    const perPurchaseLimitFils = cloudFils(purchaseLimit);
    const dailyLimitFils = cloudFils(dailyLimit);
    if (
      !child ||
      !card ||
      !Number.isSafeInteger(perPurchaseLimitFils) ||
      !Number.isSafeInteger(dailyLimitFils) ||
      perPurchaseLimitFils < 0 ||
      dailyLimitFils < 0
    ) {
      action.setNotice('invalid');
      return;
    }
    const controls: MasroofiControls = {
      frozen,
      onlineAllowed: online,
      allowedCategories: categories,
      perPurchaseLimitFils,
      dailyLimitFils,
    };
    if (
      await action.run({
        type: 'masroofi.controls',
        childId,
        expectedVersion: controlsVersion,
        controls,
      })
    )
      setEditControls(false);
  }
  async function addBalance() {
    if (card?.ageEligible !== true) return;
    const amountFils = cloudFils(topUp);
    if (
      !child ||
      !card ||
      !Number.isSafeInteger(amountFils) ||
      amountFils < 1 ||
      amountFils > 50000
    ) {
      action.setNotice('invalid');
      return;
    }
    if (await action.run({ type: 'masroofi.top_up', childId, amountFils })) setTopUp('');
  }
  async function promise() {
    if (card?.ageEligible !== true) return;
    const amountFils = cloudFils(rewardAmount);
    if (
      !selectedTask ||
      assignmentVersion === null ||
      !card ||
      !Number.isSafeInteger(amountFils) ||
      amountFils < 1 ||
      amountFils > 10000
    ) {
      action.setNotice('invalid');
      return;
    }
    if (
      await action.run({
        type: 'masroofi.promise',
        assignmentId,
        expectedTaskVersion: assignmentVersion,
        amountFils,
      })
    ) {
      setRewardAmount('');
      setAssignmentId('');
    }
  }
  return (
    <View style={s.stack} testID="cloud-masroofi-panel">
      <CloudText variant="heading">{text('masroofi.title')}</CloudText>
      <CloudText color="inkMuted">{text('masroofi.body')}</CloudText>
      <CloudMemberPicker
        snapshot={snapshot}
        value={member}
        onChange={selectMember}
        disabled={action.disabled || editControls}
      />
      {child && !card ? (
        <View style={s.group}>
          <CloudText>{text('masroofi.empty')}</CloudText>
          {parent ? (
            child.age_band === '6_8' ? (
              <CloudNotice>{text('masroofi.ageDenied')}</CloudNotice>
            ) : !child.age_band || !child.age10_plus_confirmed ? (
              <CloudNotice>{text('masroofi.ageRequired')}</CloudNotice>
            ) : (
              <>
                <CloudSwitch
                  label={text('masroofi.attest')}
                  value={attested}
                  disabled={action.disabled}
                  onChange={setAttested}
                  testID="cloud-masroofi-attest"
                />
                <CloudButton
                  disabled={action.disabled || !attested}
                  onPress={() => {
                    if (attested && child.age10_plus_confirmed && child.age_band !== '6_8')
                      void action.run({ type: 'masroofi.enable', childId });
                  }}
                  testID="cloud-masroofi-enable"
                >
                  {text('masroofi.enable')}
                </CloudButton>
              </>
            )
          ) : null}
        </View>
      ) : null}
      {child && card ? (
        <>
          <View style={s.group}>
            <MasroofiCard holderName={child.nickname} locale={locale} direction={direction} />
            <CloudText variant="caption" color="inkMuted">
              {text('masroofi.notice')}
            </CloudText>
          </View>
          <View style={s.group}>
            <CloudText variant="label">{text('masroofi.balance')}</CloudText>
            <CloudText variant="hero" tabular testID="cloud-masroofi-balance">
              {amount(card.balanceFils)}
            </CloudText>
            <CloudText>
              {text(
                card.ageEligible !== true
                  ? 'masroofi.ageUnavailable'
                  : card.controls.frozen
                    ? 'masroofi.frozen'
                    : 'masroofi.active',
              )}
            </CloudText>
          </View>
          {card.ageEligible !== true ? (
            <CloudNotice>
              <CloudText accessibilityLiveRegion="polite" testID="cloud-masroofi-age-unavailable">
                {text('masroofi.ageUnavailableBody')}
              </CloudText>
            </CloudNotice>
          ) : null}
          {!parent && credited && typeof credited.amountFils === 'number' ? (
            <CloudNotice>
              <CloudText
                variant="heading"
                accessibilityLiveRegion="polite"
                testID="cloud-masroofi-earned"
              >
                {text('masroofi.credited', { amount: amount(credited.amountFils) })}
              </CloudText>
            </CloudNotice>
          ) : null}
          {parent ? (
            <>
              <View style={s.record}>
                <CloudText variant="heading">{text('masroofi.controls')}</CloudText>
                {!editControls ? (
                  <>
                    <CloudText tabular>
                      {text('masroofi.perPurchase')}: {amount(card.controls.perPurchaseLimitFils)}
                    </CloudText>
                    <CloudText tabular>
                      {text('masroofi.daily')}: {amount(card.controls.dailyLimitFils)}
                    </CloudText>
                    <CloudText>
                      {card.controls.allowedCategories
                        .map((category) => text(`masroofi.${category}`))
                        .join(' · ')}
                    </CloudText>
                    <CloudButton
                      variant="secondary"
                      disabled={action.disabled}
                      onPress={openControls}
                      testID="cloud-masroofi-edit-controls"
                    >
                      {text('masroofi.editControls')}
                    </CloudButton>
                  </>
                ) : (
                  <View style={s.group}>
                    <CloudSwitch
                      label={text('masroofi.freeze')}
                      value={frozen}
                      onChange={setFrozen}
                      disabled={action.disabled}
                      testID="cloud-masroofi-freeze"
                    />
                    <CloudSwitch
                      label={text('masroofi.online')}
                      value={online}
                      onChange={setOnline}
                      disabled={action.disabled}
                      testID="cloud-masroofi-online"
                    />
                    <CloudInput
                      editable={!action.disabled}
                      label={text('masroofi.perPurchase')}
                      value={purchaseLimit}
                      onChangeText={setPurchaseLimit}
                      keyboardType="decimal-pad"
                      maxLength={8}
                      testID="cloud-masroofi-per-purchase"
                    />
                    <CloudInput
                      editable={!action.disabled}
                      label={text('masroofi.daily')}
                      value={dailyLimit}
                      onChangeText={setDailyLimit}
                      keyboardType="decimal-pad"
                      maxLength={8}
                      testID="cloud-masroofi-daily"
                    />
                    <CloudText variant="label">{text('masroofi.categories')}</CloudText>
                    {MASROOFI_CATEGORIES.map((category) => (
                      <CloudSwitch
                        key={category}
                        label={text(`masroofi.${category}`)}
                        value={categories.includes(category)}
                        disabled={action.disabled}
                        onChange={(allowed) =>
                          setCategories((current) =>
                            allowed
                              ? [...current.filter((item) => item !== category), category]
                              : current.filter((item) => item !== category),
                          )
                        }
                        testID={`cloud-masroofi-category-${category}`}
                      />
                    ))}
                    {controlsChanged ? (
                      <CloudEditReview
                        testID="cloud-masroofi-conflict"
                        disabled={action.disabled}
                        onKeep={() => setControlsVersion(card.controlsVersion)}
                        onReload={openControls}
                      >
                        <CloudText>
                          {text(card.controls.frozen ? 'masroofi.frozen' : 'masroofi.active')}
                        </CloudText>
                        <CloudText>
                          {text(
                            card.controls.onlineAllowed
                              ? 'masroofi.online'
                              : 'masroofi.online_blocked',
                          )}
                        </CloudText>
                        <CloudText tabular>
                          {text('masroofi.perPurchase')}:{' '}
                          {amount(card.controls.perPurchaseLimitFils)}
                        </CloudText>
                        <CloudText tabular>
                          {text('masroofi.daily')}: {amount(card.controls.dailyLimitFils)}
                        </CloudText>
                        <CloudText>
                          {text('masroofi.categories')}:{' '}
                          {card.controls.allowedCategories
                            .map((category) => text(`masroofi.${category}`))
                            .join(' · ')}
                        </CloudText>
                      </CloudEditReview>
                    ) : null}
                    <CloudButton
                      disabled={action.disabled || controlsChanged}
                      onPress={() => void saveControls()}
                      testID="cloud-masroofi-save-controls"
                    >
                      {text('masroofi.saveControls')}
                    </CloudButton>
                    <CloudButton
                      variant="quiet"
                      disabled={action.disabled}
                      onPress={() => setEditControls(false)}
                    >
                      {text('study.cancel')}
                    </CloudButton>
                  </View>
                )}
              </View>
              <View style={s.record}>
                <CloudText variant="heading">{text('masroofi.topUp')}</CloudText>
                <CloudInput
                  editable={!action.disabled}
                  label={text('masroofi.topUpAmount')}
                  value={topUp}
                  onChangeText={setTopUp}
                  keyboardType="decimal-pad"
                  maxLength={6}
                  testID="cloud-masroofi-topup-amount"
                />
                <CloudButton
                  disabled={action.disabled || card.ageEligible !== true || !topUp.trim()}
                  onPress={() => void addBalance()}
                  testID="cloud-masroofi-topup"
                >
                  {text('masroofi.topUp')}
                </CloudButton>
              </View>
              <View style={s.record}>
                <CloudText variant="heading">{text('masroofi.promise')}</CloudText>
                <CloudText color="inkMuted">{text('masroofi.promiseBody')}</CloudText>
                {assignmentId && !selectedTask ? (
                  <CloudNotice>{text('masroofi.taskChanged')}</CloudNotice>
                ) : null}
                {eligible.length === 0 ? (
                  <CloudText>{text('masroofi.noTasks')}</CloudText>
                ) : (
                  <>
                    <View style={s.group} accessibilityRole="radiogroup">
                      {eligible.map((assignment) => (
                        <CloudChoice
                          key={assignment.id}
                          selected={
                            assignmentId === assignment.id &&
                            assignmentVersion === assignment.task_version
                          }
                          disabled={action.disabled}
                          onPress={() => {
                            setAssignmentId(assignment.id);
                            setAssignmentVersion(assignment.task_version);
                          }}
                          testID={`cloud-masroofi-task-${assignment.id}`}
                        >
                          {
                            snapshot.tasks.find(
                              (task) =>
                                task.id === assignment.task_id &&
                                task.version === assignment.task_version,
                            )?.title
                          }
                        </CloudChoice>
                      ))}
                    </View>
                    <CloudInput
                      editable={!action.disabled}
                      label={text('masroofi.promiseAmount')}
                      value={rewardAmount}
                      onChangeText={setRewardAmount}
                      keyboardType="decimal-pad"
                      maxLength={6}
                      testID="cloud-masroofi-reward-amount"
                    />
                    <CloudButton
                      disabled={
                        action.disabled ||
                        card.ageEligible !== true ||
                        !selectedTask ||
                        !rewardAmount.trim()
                      }
                      onPress={() => void promise()}
                      testID="cloud-masroofi-promise"
                    >
                      {text('masroofi.savePromise')}
                    </CloudButton>
                  </>
                )}
              </View>
            </>
          ) : (
            <View style={s.record}>
              <CloudText variant="heading">{text('masroofi.shop')}</CloudText>
              <View style={row} accessibilityRole="radiogroup">
                {MASROOFI_CATEGORIES.filter((category) =>
                  data.purchaseCatalog.some((item) => item.category === category),
                ).map((category) => (
                  <CloudChoice
                    key={category}
                    selected={shopCategory === category}
                    onPress={() => setShopCategory(category)}
                    testID={`cloud-shop-category-${category}`}
                  >
                    {text(`masroofi.${category}`)}
                  </CloudChoice>
                ))}
              </View>
              {data.purchaseCatalog
                .filter((item) => item.category === shopCategory)
                .map((item) => (
                  <View style={s.group} key={item.id}>
                    <CloudText variant="heading">{text(`masroofi.item_${item.id}`)}</CloudText>
                    <CloudText tabular>{amount(item.amountFils)}</CloudText>
                    <CloudText color="inkMuted">
                      {text(item.online ? 'masroofi.onlineItem' : 'masroofi.inPerson')}
                    </CloudText>
                    <CloudButton
                      disabled={action.disabled || card.ageEligible !== true}
                      onPress={() => {
                        if (card.ageEligible === true)
                          void action.run({ type: 'masroofi.purchase', fixtureId: item.id });
                      }}
                      testID={`cloud-masroofi-purchase-${item.id}`}
                    >
                      {text('masroofi.buy')}
                    </CloudButton>
                  </View>
                ))}
            </View>
          )}
          {promises.map((item) => {
            const assignment = snapshot.assignments.find((entry) => entry.id === item.assignmentId);
            const task = snapshot.tasks.find(
              (entry) => entry.id === assignment?.task_id && entry.version === item.taskVersion,
            );
            return (
              <View style={s.record} key={item.id} testID={`cloud-masroofi-promise-${item.id}`}>
                <CloudText variant="label">{task?.title ?? text('masroofi.promise')}</CloudText>
                <CloudText>
                  {parent && typeof item.amountFils === 'number'
                    ? amount(item.amountFils)
                    : item.status === 'credited' && typeof item.amountFils === 'number'
                      ? text('masroofi.credited', { amount: amount(item.amountFils) })
                      : text('masroofi.promised')}
                </CloudText>
              </View>
            );
          })}
          <View style={s.record}>
            <CloudText variant="heading">{text('masroofi.history')}</CloudText>
            {transactions.length === 0 ? (
              <CloudText color="inkMuted">{text('masroofi.historyEmpty')}</CloudText>
            ) : null}
            {[...transactions].reverse().map((transaction) => (
              <View
                key={transaction.id}
                style={s.record}
                testID={`cloud-masroofi-transaction-${transaction.id}`}
              >
                <CloudText variant="label">
                  {text(`masroofi.${transaction.kind}`)}
                  {transaction.kind === 'purchase'
                    ? ` · ${text(`masroofi.${transaction.status}`)}`
                    : ''}
                </CloudText>
                {transaction.fixtureId ? (
                  <CloudText>{text(`masroofi.item_${transaction.fixtureId}`)}</CloudText>
                ) : null}
                <CloudText tabular>{amount(transaction.amountFils)}</CloudText>
                {transaction.status === 'declined' && transaction.declineReason ? (
                  <CloudText color="inkMuted">
                    {text(`masroofi.${transaction.declineReason}`)}
                  </CloudText>
                ) : null}
                <CloudText tabular variant="caption">
                  {transaction.day} ·{' '}
                  {text('masroofi.balanceAfter', { amount: amount(transaction.balanceAfterFils) })}
                </CloudText>
              </View>
            ))}
          </View>
        </>
      ) : null}
      {action.notice ? (
        <CloudNotice error={action.notice !== 'saved'}>
          {text(`study.${action.notice}`)}
        </CloudNotice>
      ) : null}
    </View>
  );
}

function CloudSwitch({
  label,
  value,
  onChange,
  disabled,
  testID,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  testID?: string;
}) {
  const { row } = useCloudPresentation();
  return (
    <View style={row}>
      <CloudText style={{ flex: 1, minWidth: 0 }}>{label}</CloudText>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        testID={testID}
        thumbColor={botanical.colors.paper}
        trackColor={{ false: botanical.colors.muted, true: botanical.colors.forest }}
      />
    </View>
  );
}
