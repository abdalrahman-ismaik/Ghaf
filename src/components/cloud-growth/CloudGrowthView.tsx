import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { AppState, BackHandler, Platform, View } from 'react-native';

import {
  createCloudGrowthController,
  type CloudGrowthController,
} from '@/features/cloud-growth/controller';
import type { CloudFamilyActor, CloudFamilyChild, CloudFamilyTask } from '@/models/cloudFamily';
import {
  CloudGrowthError,
  type CloudGrowthCommand,
  type CloudGrowthTransport,
  type CloudRewardPlan,
} from '@/models/cloudGrowth';
import type { ParentAccountService } from '@/models/parentAccount';

import { CloudBadges, CloudImpactPath } from './CloudJourneyViews';
import { CloudLeagueForm, CloudLeagueView } from './CloudLeagueViews';
import { CloudRewardForm, CloudRewardList } from './CloudRewardViews';
import {
  GrowthButton,
  GrowthField,
  GrowthRow,
  GrowthText,
  growthStyles as s,
  useGrowthCopy,
  useGrowthPassword,
} from './common';

export interface CloudGrowthViewProps {
  readonly service: ParentAccountService;
  readonly userId: string;
  readonly familyId: string;
  readonly actor: CloudFamilyActor;
  readonly childProfiles: readonly CloudFamilyChild[];
  readonly tasks?: readonly CloudFamilyTask[];
  readonly onBack: () => void;
  readonly onOpenLearning?: () => void;
}
type GrowthTab = 'path' | 'badges' | 'rewards' | 'league';
type Form =
  | { kind: 'reward'; plan?: CloudRewardPlan }
  | { kind: 'league' }
  | { kind: 'confirm'; command: CloudGrowthCommand; label: string };

export function CloudGrowthView(props: CloudGrowthViewProps) {
  return (
    <CloudGrowthContent
      key={`${props.userId}:${props.familyId}:${props.actor.role}:${props.actor.childId}`}
      {...props}
    />
  );
}

function CloudGrowthContent(props: CloudGrowthViewProps) {
  const { text, number } = useGrowthCopy();
  const transport = useMemo<CloudGrowthTransport>(
    () => ({
      familyRequest(name, args) {
        if (!props.service.familyRequest)
          return Promise.reject(new CloudGrowthError('provider_unavailable'));
        return props.service.familyRequest(name, args, props.userId);
      },
      subscribeFamily(familyId, onChange) {
        if (!props.service.subscribeFamily)
          return Promise.reject(new CloudGrowthError('provider_unavailable'));
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
  const lifetime = useMemo(
    () => ({
      controller: createCloudGrowthController({
        transport,
        userId: props.userId,
        familyId: props.familyId,
      }),
    }),
    [transport, props.userId, props.familyId],
  );
  const controller = lifetime.controller;
  const controllerGenerations = useRef(new Map<CloudGrowthController, number>());
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  const [selection, setSelection] = useState<string | null>(
    props.actor.childId ?? props.childProfiles.find((child) => child.active)?.id ?? null,
  );
  const [tab, setTab] = useState<GrowthTab>('path');
  const [form, setForm] = useState<Form | null>(null);
  const [retryPassword, setRetryPassword] = useGrowthPassword();
  const detailBack = useRef<(() => void) | null>(null);
  const registerDetail = useCallback((dismiss: (() => void) | null) => {
    detailBack.current = dismiss;
  }, []);
  useEffect(() => {
    const generations = controllerGenerations.current;
    generations.set(controller, (generations.get(controller) ?? 0) + 1);
    void controller.load();
    controller.setActive(AppState.currentState === null || AppState.currentState === 'active');
    const listener = AppState.addEventListener('change', (value) => {
      controller.setActive(value === 'active');
      if (value !== 'active') setRetryPassword('');
    });
    const visibility = () => controller.setActive(document.visibilityState === 'visible');
    if (Platform.OS === 'web' && typeof document !== 'undefined')
      document.addEventListener('visibilitychange', visibility);
    const poll = setInterval(() => {
      if (AppState.currentState !== null && AppState.currentState !== 'active') return;
      if (
        Platform.OS === 'web' &&
        typeof document !== 'undefined' &&
        document.visibilityState !== 'visible'
      )
        return;
      void controller.refresh();
    }, 60_000);
    return () => {
      clearInterval(poll);
      listener.remove();
      if (Platform.OS === 'web' && typeof document !== 'undefined')
        document.removeEventListener('visibilitychange', visibility);
      const cleanup = (generations.get(controller) ?? 0) + 1;
      generations.set(controller, cleanup);
      void Promise.resolve().then(() => {
        if (generations.get(controller) === cleanup) {
          controller.dispose();
          generations.delete(controller);
        }
      });
    };
  }, [controller, lifetime, setRetryPassword]);
  const back = useCallback(() => {
    setRetryPassword('');
    if (form) setForm(null);
    else if (detailBack.current) detailBack.current();
    else if (tab !== 'path') setTab('path');
    else props.onBack();
    return true;
  }, [form, props, setRetryPassword, tab]);
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const listener = BackHandler.addEventListener('hardwareBackPress', back);
    return () => listener.remove();
  }, [back]);
  const save = async (command: CloudGrowthCommand, password?: string) => {
    const saved = await controller.command(command, password);
    if (saved) setForm(null);
    return saved;
  };
  const snapshot = state.snapshot;
  const parent = snapshot?.actor.role === 'parent';
  const visibleChildren = props.childProfiles.filter(
    (child) => child.active && snapshot?.children.some((record) => record.childId === child.id),
  );
  const childId = snapshot?.actor.role === 'child' ? snapshot.actor.childId : selection;
  const child = visibleChildren.find((record) => record.id === childId) ?? null;
  const progress = snapshot?.children.find((record) => record.childId === child?.id);
  const blocked = state.busy || state.pendingRequestId !== null || state.conflict;
  const switchTab = (next: GrowthTab) => {
    setForm(null);
    setRetryPassword('');
    setTab(next);
  };
  return (
    <View style={s.stack} testID="cloud-growth-view">
      <GrowthText variant="heading" accessibilityRole="header">
        {text('title')}
      </GrowthText>
      <GrowthRow>
        <GrowthButton variant="secondary" onPress={back}>
          {text('back')}
        </GrowthButton>
        <GrowthButton
          variant="quiet"
          disabled={state.busy}
          onPress={() => {
            void controller.refresh();
          }}
        >
          {text('refresh')}
        </GrowthButton>
      </GrowthRow>
      {state.loading ? (
        <GrowthText accessibilityLiveRegion="polite">{text('loading')}</GrowthText>
      ) : null}
      {state.busy && !state.loading ? (
        <GrowthText accessibilityLiveRegion="polite">{text('saving')}</GrowthText>
      ) : null}
      {state.error ? (
        <View style={s.error} testID="cloud-growth-error">
          <GrowthText accessibilityRole="alert">
            {text(
              state.error === 'reauth_required'
                ? 'reauthError'
                : state.conflict
                  ? 'conflict'
                  : snapshot
                    ? 'error'
                    : 'unavailable',
            )}
          </GrowthText>
        </View>
      ) : null}
      {state.pendingRequestId ? (
        <View style={s.notice} testID="cloud-growth-pending">
          <GrowthText>{text('pending')}</GrowthText>
          {state.retryNeedsPassword ? (
            <GrowthField
              label={text('password')}
              value={retryPassword}
              onChangeText={setRetryPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="current-password"
              editable={!state.busy}
            />
          ) : null}
          <GrowthButton
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
          </GrowthButton>
        </View>
      ) : null}
      {state.saved ? (
        <GrowthText accessibilityLiveRegion="polite" testID="cloud-growth-saved">
          {text('saved')}
        </GrowthText>
      ) : null}
      {state.subscriptionError ? <GrowthText>{text('reconnect')}</GrowthText> : null}
      {snapshot ? (
        <>
          {parent ? (
            <GrowthRow>
              {visibleChildren.map((record) => (
                <GrowthButton
                  key={record.id}
                  variant={record.id === childId ? 'primary' : 'secondary'}
                  accessibilityState={{ selected: record.id === childId }}
                  onPress={() => {
                    setSelection(record.id);
                    setForm(null);
                    setRetryPassword('');
                  }}
                >
                  {record.displayName}
                </GrowthButton>
              ))}
            </GrowthRow>
          ) : null}
          <GrowthRow>
            {(['path', 'badges', 'rewards', 'league'] as const).map((next) => (
              <GrowthButton
                key={next}
                variant={tab === next ? 'primary' : 'secondary'}
                accessibilityState={{ selected: tab === next }}
                onPress={() => switchTab(next)}
              >
                {text(next)}
              </GrowthButton>
            ))}
          </GrowthRow>
          {child && progress ? (
            <View style={s.stack} key={`${child.id}:${tab}`}>
              <GrowthText>
                {child.displayName} · {text('seeds', { count: number(progress.lifetimeSeeds) })}
              </GrowthText>
              {form?.kind === 'reward' && parent ? (
                <CloudRewardForm
                  key={form.plan?.id ?? 'new'}
                  childId={child.id}
                  plan={form.plan}
                  busy={blocked}
                  onSave={save}
                  onCancel={() => setForm(null)}
                />
              ) : form?.kind === 'league' && parent ? (
                <CloudLeagueForm
                  child={child}
                  tasks={props.tasks ?? []}
                  revision={snapshot.league?.revision ?? 0}
                  nomination={snapshot.league?.nominations.find(
                    (record) => record.childId === child.id,
                  )}
                  busy={blocked}
                  onSave={save}
                  onCancel={() => setForm(null)}
                />
              ) : form?.kind === 'confirm' && parent ? (
                <PasswordConfirmation
                  label={form.label}
                  busy={blocked}
                  onSave={(password) => save(form.command, password)}
                  onCancel={() => setForm(null)}
                />
              ) : (
                <>
                  {tab === 'path' ? (
                    <CloudImpactPath child={progress} onOpenLearning={props.onOpenLearning} />
                  ) : null}
                  {tab === 'badges' ? (
                    <CloudBadges
                      child={progress}
                      onOpenLearning={props.onOpenLearning}
                      onDetailChange={registerDetail}
                    />
                  ) : null}
                  {tab === 'rewards' ? (
                    <CloudRewardList
                      plans={snapshot.rewards.filter((plan) => plan.childId === child.id)}
                      parent={parent}
                      busy={blocked}
                      onCreate={() => setForm({ kind: 'reward' })}
                      onRevise={(plan) => setForm({ kind: 'reward', plan })}
                      onGive={(plan) =>
                        setForm({
                          kind: 'confirm',
                          label: text('giveReward'),
                          command: {
                            type: 'reward.give',
                            planId: plan.id,
                            expectedVersion: plan.version,
                          },
                        })
                      }
                    />
                  ) : null}
                  {tab === 'league' ? (
                    <CloudLeagueView
                      league={snapshot.league}
                      currentWeekKey={snapshot.currentWeekKey}
                      child={child}
                      parent={parent}
                      busy={blocked}
                      onNominate={() => setForm({ kind: 'league' })}
                      onRest={(nomination) =>
                        setForm({
                          kind: 'confirm',
                          label: text(nomination.rest ? 'resume' : 'rest'),
                          command: {
                            type: 'league.rest',
                            childId: child.id,
                            expectedRevision: snapshot.league!.revision,
                            rest: !nomination.rest,
                          },
                        })
                      }
                      onEncourage={(recipientId, phraseId) => {
                        void save({ type: 'league.encourage', recipientId, phraseId });
                      }}
                    />
                  ) : null}
                </>
              )}
            </View>
          ) : (
            <GrowthText testID="cloud-growth-empty">{text('emptyChildren')}</GrowthText>
          )}
        </>
      ) : null}
    </View>
  );
}

function PasswordConfirmation({
  label,
  busy,
  onSave,
  onCancel,
}: {
  readonly label: string;
  readonly busy: boolean;
  readonly onSave: (password: string) => Promise<boolean>;
  readonly onCancel: () => void;
}) {
  const { text } = useGrowthCopy();
  const [password, setPassword] = useGrowthPassword();
  return (
    <View style={s.card}>
      <GrowthText variant="heading">{label}</GrowthText>
      <GrowthText>{text('passwordNotice')}</GrowthText>
      <GrowthField
        label={text('password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        editable={!busy}
      />
      <GrowthRow>
        <GrowthButton
          disabled={busy || !password}
          onPress={() => {
            const value = password;
            setPassword('');
            void onSave(value);
          }}
        >
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
