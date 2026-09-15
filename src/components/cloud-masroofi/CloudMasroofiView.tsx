import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { AppState, BackHandler, Platform, View } from 'react-native';

import { MasroofiCard } from '@/components/masroofi/MasroofiCard';
import {
  createCloudMasroofiController,
  type CloudMasroofiController,
} from '@/features/cloud-masroofi/controller';
import type { CloudFamilyActor, CloudFamilyChild, CloudFamilyTask } from '@/models/cloudFamily';
import {
  CloudMasroofiError,
  type CloudMasroofiCommand,
  type CloudMasroofiTransport,
} from '@/models/cloudMasroofi';
import type { ParentAccountService } from '@/models/parentAccount';

import {
  MasroofiButton,
  MasroofiField,
  MasroofiRow,
  MasroofiText,
  masroofiStyles as s,
  useMasroofiCopy,
  useMasroofiPassword,
} from './common';
import {
  MasroofiControlsForm,
  MasroofiEnrollmentForm,
  MasroofiFundsForm,
  MasroofiRewardForm,
} from './forms';
import {
  MasroofiCardSummary,
  MasroofiHistory,
  MasroofiPromises,
  MasroofiPurchaseShop,
  MasroofiRulesSummary,
  masroofiErrorCopy,
} from './presentation';

export interface CloudMasroofiViewProps {
  readonly service: ParentAccountService;
  readonly userId: string;
  readonly familyId: string;
  readonly actor: CloudFamilyActor;
  readonly childProfiles: readonly CloudFamilyChild[];
  readonly tasks: readonly CloudFamilyTask[];
}

type Form = 'enroll' | 'controls' | 'funds' | 'reward' | null;

function isForeground() {
  return (
    (AppState.currentState === null || AppState.currentState === 'active') &&
    !(
      Platform.OS === 'web' &&
      typeof document !== 'undefined' &&
      document.visibilityState !== 'visible'
    )
  );
}

export function CloudMasroofiView(props: CloudMasroofiViewProps) {
  return (
    <CloudMasroofiContent
      key={`${props.userId}:${props.familyId}:${props.actor.role}:${props.actor.childId}`}
      {...props}
    />
  );
}

function CloudMasroofiContent(props: CloudMasroofiViewProps) {
  const { text, locale, direction } = useMasroofiCopy();
  const actor = useMemo(
    () => ({
      userId: props.actor.userId,
      role: props.actor.role,
      familyId: props.actor.familyId,
      childId: props.actor.childId,
    }),
    [props.actor.userId, props.actor.role, props.actor.familyId, props.actor.childId],
  );
  const transport = useMemo<CloudMasroofiTransport>(
    () => ({
      familyRequest(name, args) {
        if (!props.service.familyRequest)
          return Promise.reject(new CloudMasroofiError('provider_unavailable'));
        return props.service.familyRequest(name, args, props.userId);
      },
      subscribeFamily(familyId, onChange) {
        if (!props.service.subscribeFamily)
          return Promise.reject(new CloudMasroofiError('provider_unavailable'));
        return props.service.subscribeFamily(familyId, onChange);
      },
      ...(props.service.reauthenticate
        ? {
            reauthenticate: (password: string) =>
              props.service.reauthenticate!(password, props.userId),
          }
        : {}),
    }),
    [props.service, props.userId],
  );
  const controller = useMemo(
    () =>
      createCloudMasroofiController({
        transport,
        userId: props.userId,
        familyId: props.familyId,
        actor,
      }),
    [transport, props.userId, props.familyId, actor],
  );
  const generations = useRef(new Map<CloudMasroofiController, number>());
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  const [selection, setSelection] = useState<string | null>(
    actor.childId ??
      props.childProfiles.find((child) => child.active && child.familyId === props.familyId)?.id ??
      null,
  );
  const [form, setForm] = useState<Form>(null);
  const [shop, setShop] = useState(false);
  const [foreground, setForeground] = useState(isForeground);
  const [retryPassword, setRetryPassword] = useMasroofiPassword();

  useEffect(() => {
    const lifetimes = generations.current;
    lifetimes.set(controller, (lifetimes.get(controller) ?? 0) + 1);
    const activate = () => {
      const active = isForeground();
      setForeground(active);
      controller.setActive(active);
      if (!active) {
        setForm(null);
        setShop(false);
        setRetryPassword('');
      }
    };
    activate();
    if (isForeground()) void controller.load();
    const listener = AppState.addEventListener('change', activate);
    if (Platform.OS === 'web' && typeof document !== 'undefined')
      document.addEventListener('visibilitychange', activate);
    const poll = setInterval(() => {
      if (isForeground()) void controller.refresh();
    }, 60_000);
    return () => {
      clearInterval(poll);
      listener.remove();
      if (Platform.OS === 'web' && typeof document !== 'undefined')
        document.removeEventListener('visibilitychange', activate);
      const cleanup = (lifetimes.get(controller) ?? 0) + 1;
      lifetimes.set(controller, cleanup);
      void Promise.resolve().then(() => {
        if (lifetimes.get(controller) === cleanup) {
          controller.dispose();
          lifetimes.delete(controller);
        }
      });
    };
  }, [controller, setRetryPassword]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (form) {
        setForm(null);
        setRetryPassword('');
        return true;
      }
      if (shop) {
        setShop(false);
        return true;
      }
      return false;
    });
    return () => listener.remove();
  }, [form, shop, setRetryPassword]);

  const snapshot = state.snapshot;
  const parent = actor.role === 'parent';
  const visibleChildren = props.childProfiles.filter(
    (child) =>
      child.active && child.familyId === props.familyId && (parent || child.id === actor.childId),
  );
  const child =
    visibleChildren.find((record) => record.id === selection) ?? visibleChildren[0] ?? null;
  const card = snapshot?.cards.find((record) => record.childId === child?.id);
  const unavailable =
    state.error !== null &&
    [
      'schema_unavailable',
      'invalid_response',
      'network_unavailable',
      'provider_unavailable',
      'access_unavailable',
      'family_unavailable',
    ].includes(state.error);
  const blocked =
    state.busy ||
    state.loading ||
    state.pendingRequestId !== null ||
    state.conflict ||
    unavailable ||
    !foreground;
  const closeForm = () => setForm(null);
  const save = async (command: CloudMasroofiCommand, password?: string) => {
    if (blocked) return false;
    const saved = await controller.command(command, password);
    if (saved) setForm(null);
    return saved;
  };

  return (
    <View style={s.stack} testID="cloud-masroofi-view">
      <MasroofiRow>
        <MasroofiText variant="heading" accessibilityRole="header" style={s.grow}>
          {text('title')}
        </MasroofiText>
        <MasroofiButton
          variant="quiet"
          disabled={state.busy || state.loading || !foreground}
          onPress={() => {
            setForm(null);
            setRetryPassword('');
            void controller.refresh();
          }}
        >
          {text('refresh')}
        </MasroofiButton>
      </MasroofiRow>
      <MasroofiText variant="caption" style={s.muted} testID="hosted-masroofi-simulation-notice">
        {text('demoNotice')}
      </MasroofiText>
      {!foreground ? (
        <MasroofiText>{text('paused')}</MasroofiText>
      ) : (
        <>
          {parent && visibleChildren.length > 0 ? (
            <View style={s.stack}>
              <MasroofiText variant="control">{text('selectChild')}</MasroofiText>
              <MasroofiRow>
                {visibleChildren.map((record) => (
                  <MasroofiButton
                    key={record.id}
                    variant={record.id === child?.id ? 'primary' : 'secondary'}
                    accessibilityState={{ selected: record.id === child?.id }}
                    disabled={state.busy || state.pendingRequestId !== null}
                    onPress={() => {
                      setSelection(record.id);
                      setForm(null);
                      setShop(false);
                      setRetryPassword('');
                    }}
                  >
                    {record.displayName}
                  </MasroofiButton>
                ))}
              </MasroofiRow>
            </View>
          ) : null}
          <View
            accessibilityLabel={
              child ? text('cardLabel', { name: child.displayName }) : text('preview')
            }
          >
            <MasroofiCard
              holderName={child?.displayName ?? ''}
              locale={locale}
              direction={direction}
            />
          </View>
          {state.loading ? (
            <MasroofiText accessibilityLiveRegion="polite">{text('loading')}</MasroofiText>
          ) : null}
          {state.busy && !state.loading ? (
            <MasroofiText accessibilityLiveRegion="polite">{text('saving')}</MasroofiText>
          ) : null}
          {state.error ? (
            <View style={s.error} testID="hosted-masroofi-error">
              <MasroofiText accessibilityRole="alert">
                {text(state.conflict ? 'conflict' : masroofiErrorCopy(state.error))}
              </MasroofiText>
              {snapshot ? <MasroofiText>{text('stale')}</MasroofiText> : null}
            </View>
          ) : null}
          {state.pendingRequestId ? (
            <View style={s.notice} testID="hosted-masroofi-pending">
              <MasroofiText>{text('pending')}</MasroofiText>
              {state.retryNeedsPassword ? (
                <MasroofiField
                  label={text('password')}
                  value={retryPassword}
                  onChangeText={setRetryPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="current-password"
                  editable={!state.busy}
                />
              ) : null}
              <MasroofiButton
                disabled={state.busy || (state.retryNeedsPassword && !retryPassword)}
                onPress={() => {
                  const password = retryPassword;
                  setRetryPassword('');
                  void controller.retry(password).then((saved) => {
                    if (saved) setForm(null);
                  });
                }}
              >
                {text('retry')}
              </MasroofiButton>
            </View>
          ) : null}
          {state.saved ? (
            <MasroofiText accessibilityLiveRegion="polite" testID="hosted-masroofi-saved">
              {text('saved')}
            </MasroofiText>
          ) : null}
          {state.subscriptionError ? <MasroofiText>{text('reconnect')}</MasroofiText> : null}
          {!snapshot ? (
            <MasroofiText>{text('previewNotice')}</MasroofiText>
          ) : !child ? (
            <MasroofiText>{text(parent ? 'noChildren' : 'childUnavailable')}</MasroofiText>
          ) : (
            <>
              {card ? (
                <MasroofiCardSummary card={card} />
              ) : (
                <MasroofiText>{text('notEnabled')}</MasroofiText>
              )}
              {parent ? (
                <>
                  {!card && form !== 'enroll' ? (
                    <View style={s.stack}>
                      <MasroofiText>
                        {text(child.ageBand === '6_8' ? 'underAge' : 'enableBody')}
                      </MasroofiText>
                      {child.ageBand !== '6_8' ? (
                        <MasroofiButton disabled={blocked} onPress={() => setForm('enroll')}>
                          {text('enable')}
                        </MasroofiButton>
                      ) : null}
                    </View>
                  ) : null}
                  {card ? (
                    <MasroofiRow>
                      {(['controls', 'funds', 'reward'] as const).map((next) => (
                        <MasroofiButton
                          key={next}
                          disabled={blocked}
                          variant={form === next ? 'primary' : 'secondary'}
                          onPress={() => setForm(next)}
                        >
                          {text(
                            next === 'controls'
                              ? 'rules'
                              : next === 'funds'
                                ? 'addFundsAction'
                                : 'rewardAction',
                          )}
                        </MasroofiButton>
                      ))}
                    </MasroofiRow>
                  ) : null}
                  {form === 'enroll' && !card ? (
                    <MasroofiEnrollmentForm
                      key={child.id}
                      child={child}
                      busy={blocked}
                      onSave={save}
                      onCancel={closeForm}
                    />
                  ) : null}
                  {form === 'controls' && card ? (
                    <MasroofiControlsForm
                      key={child.id}
                      card={card}
                      busy={blocked}
                      onSave={save}
                      onCancel={closeForm}
                    />
                  ) : null}
                  {form === 'funds' && card ? (
                    <MasroofiFundsForm
                      key={child.id}
                      childId={child.id}
                      busy={blocked}
                      onSave={save}
                      onCancel={closeForm}
                    />
                  ) : null}
                  {form === 'reward' && card ? (
                    <MasroofiRewardForm
                      key={child.id}
                      child={child}
                      tasks={props.tasks}
                      promises={snapshot.promises}
                      busy={blocked}
                      onSave={save}
                      onCancel={closeForm}
                    />
                  ) : null}
                </>
              ) : card ? (
                <MasroofiRow>
                  <MasroofiButton
                    variant={shop ? 'secondary' : 'primary'}
                    accessibilityState={{ selected: !shop }}
                    onPress={() => setShop(false)}
                  >
                    {text('cardOverview')}
                  </MasroofiButton>
                  <MasroofiButton
                    variant={shop ? 'primary' : 'secondary'}
                    accessibilityState={{ selected: shop }}
                    onPress={() => setShop(true)}
                  >
                    {text('shopTitle')}
                  </MasroofiButton>
                </MasroofiRow>
              ) : (
                <MasroofiText>{text('waitingParent')}</MasroofiText>
              )}
              {card && !form ? <MasroofiRulesSummary card={card} /> : null}
              {!parent && card && shop ? (
                <MasroofiPurchaseShop
                  card={card}
                  busy={blocked}
                  onPurchase={(fixtureId) => {
                    void save({ type: 'purchase', childId: child.id, fixtureId });
                  }}
                />
              ) : null}
              {card && !form ? (
                <>
                  <MasroofiPromises
                    promises={snapshot.promises}
                    tasks={props.tasks}
                    childId={child.id}
                    parent={parent}
                  />
                  <MasroofiHistory transactions={snapshot.transactions} childId={child.id} />
                </>
              ) : null}
            </>
          )}
        </>
      )}
    </View>
  );
}
