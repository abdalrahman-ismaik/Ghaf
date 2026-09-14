import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, View } from 'react-native';

import { AccessHeader, AccessScreen } from '@/components/access';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { CloudStudyView } from '@/components/cloud-study/CloudStudyView';
import { CloudGrowthView } from '@/components/cloud-growth';
import { CloudMessagingView } from '@/components/cloud-messaging';
import { LocalIllustration } from '@/components/illustrations';
import { Text } from '@/components/primitives';
import { botanical } from '@/design/tokens';
import { selectCloudFamilyProgress, type CloudFamilyController } from '@/features/cloud-family';
import {
  CloudFamilyError,
  type CloudFamilySnapshot,
  type CloudFamilyState,
} from '@/models/cloudFamily';
import type { CloudDocumentServicePort, CloudSavedTemplate } from '@/models/cloudFamilyDocuments';

import type { CloudFamilyBoundaryProps } from './CloudFamilyBoundary';
import { CloudFamilyMembers, CloudFamilySetup, type FamilyEditor } from './CloudFamilySetup';
import { CloudGardenView } from './CloudGardenView';
import { CloudCustomTaskView } from './CloudCustomTaskView';
import { CloudTaskCatalog, CloudTaskDetail } from './CloudTaskViews';
import { CloudAction, CloudActions, CloudSection, cloudStyles, useCloudCopy } from './common';

type Tab = 'family' | 'tasks' | 'garden' | 'study' | 'messages' | 'settings';

export interface CloudFamilyViewProps extends CloudFamilyBoundaryProps {
  readonly controller: CloudFamilyController;
  readonly state: CloudFamilyState;
  readonly snapshot: CloudFamilySnapshot;
}

export function CloudFamilyView({
  controller,
  state,
  snapshot,
  service,
  userId,
  onSignOut,
  onOpenLegacy,
  onOpenAccount,
}: CloudFamilyViewProps) {
  const { text, locale, direction } = useCloudCopy();
  const parent = snapshot.actor.role === 'parent';
  const home = parent ? 'family' : 'tasks';
  const [tab, setTab] = useState<Tab>(home);
  const [editor, setEditor] = useState<FamilyEditor | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customDraft, setCustomDraft] = useState<CloudSavedTemplate | undefined>();
  const [growthOpen, setGrowthOpen] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [recognitionId, setRecognitionId] = useState<string | null>(null);
  const [childFilter, setChildFilter] = useState('all');
  const documentService = useMemo<CloudDocumentServicePort>(
    () => ({
      familyRequest(name, args) {
        if (!service.familyRequest)
          return Promise.reject(new CloudFamilyError('provider_unavailable'));
        return service.familyRequest(name, args, userId);
      },
      subscribeFamily(familyId, onChange) {
        if (!service.subscribeFamily)
          return Promise.reject(new CloudFamilyError('provider_unavailable'));
        return service.subscribeFamily(familyId, onChange);
      },
    }),
    [service, userId],
  );
  const progress = useMemo(() => selectCloudFamilyProgress(snapshot), [snapshot]);
  const documents = (section: 'study' | 'family' | 'learning') =>
    snapshot.family ? (
      <CloudStudyView
        service={documentService}
        userId={userId}
        familyId={snapshot.family.id}
        role={snapshot.actor.role}
        childId={snapshot.actor.childId}
        childProfiles={snapshot.children}
        section={section}
        onUseTemplate={(draft) => {
          setCustomDraft(draft);
          setCustomOpen(true);
          setTab('tasks');
          setCatalogOpen(false);
          setTaskId(null);
        }}
        earnedSeeds={
          snapshot.actor.childId
            ? (progress.children[snapshot.actor.childId]?.seeds ?? 0)
            : undefined
        }
      />
    ) : null;
  const disabled = state.busy || state.pendingRequestId !== null || state.conflict;
  const goBack = useCallback(() => {
    if (growthOpen) setGrowthOpen(false);
    else if (editor) setEditor(null);
    else if (catalogOpen) setCatalogOpen(false);
    else if (customOpen) setCustomOpen(false);
    else if (taskId) setTaskId(null);
    else if (tab !== home) {
      setRecognitionId(null);
      setTab(home);
    } else return false;
    return true;
  }, [catalogOpen, customOpen, editor, growthOpen, home, tab, taskId]);
  useEffect(() => {
    if (Platform.OS !== 'android' || growthOpen || tab === 'messages') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', goBack);
    return () => subscription.remove();
  }, [goBack, growthOpen, tab]);
  const selectTab = (next: Tab) => {
    setEditor(null);
    setCatalogOpen(false);
    setCustomOpen(false);
    setGrowthOpen(false);
    setTaskId(null);
    if (next !== 'garden') setRecognitionId(null);
    setTab(next);
  };
  const showGarden = (id?: string) => {
    setTaskId(null);
    setCatalogOpen(false);
    setCustomOpen(false);
    setGrowthOpen(false);
    setRecognitionId(id ?? null);
    setTab('garden');
  };
  const task = snapshot.tasks.find(
    (item) => item.id === taskId && (parent || item.childId === snapshot.actor.childId),
  );
  const tasks = snapshot.tasks.filter(
    (item) =>
      (parent || item.childId === snapshot.actor.childId) &&
      (childFilter === 'all' || item.childId === childFilter),
  );
  const tabs: Tab[] = snapshot.family
    ? ['family', 'tasks', 'garden', 'study', 'messages', 'settings']
    : ['family', 'settings'];
  const hasBack =
    editor !== null || catalogOpen || customOpen || growthOpen || taskId !== null || tab !== home;
  return (
    <AccessScreen
      background="organic"
      contentMaxWidth={760}
      contentStyle={cloudStyles.content}
      keyboardAware
      scrollResetKey={`${snapshot.family?.id}:${tab}:${taskId}:${catalogOpen}:${customOpen}:${growthOpen}:${editor?.kind}`}
      testID="cloud-family-screen"
      header={
        <AccessHeader
          brand={locale === 'ar' ? 'غاف' : 'Ghaf'}
          direction={direction}
          language={locale}
          title={text(parent ? 'parent' : 'child')}
          onBack={
            hasBack && tab !== 'messages'
              ? () => {
                  goBack();
                }
              : undefined
          }
          backLabel={text('back')}
        />
      }
      footer={
        <CloudActions>
          {tabs.map((item) => (
            <CloudAction
              key={item}
              accessibilityRole="tab"
              accessibilityState={{ selected: item === tab }}
              aria-selected={item === tab}
              variant={item === tab ? 'primary' : 'quiet'}
              onPress={() => selectTab(item)}
              testID={`cloud-tab-${item}`}
            >
              {text(item)}
            </CloudAction>
          ))}
        </CloudActions>
      }
    >
      {state.busy ? (
        <View style={cloudStyles.status}>
          <ActivityIndicator />
          <Text brand accessibilityLiveRegion="polite">
            {text(state.pendingRequestId ? 'saving' : 'loading')}
          </Text>
        </View>
      ) : null}
      {state.error ||
      state.subscriptionError ||
      (state.pendingRequestId !== null && !state.busy) ? (
        <View style={cloudStyles.error} testID="cloud-family-error">
          <Text brand accessibilityRole="alert">
            {text(state.pendingRequestId ? 'uncertain' : state.conflict ? 'conflict' : 'error')}
          </Text>
          <CloudAction
            disabled={state.busy}
            onPress={() => void (state.conflict ? controller.refresh() : controller.retry())}
            testID="cloud-family-retry"
          >
            {text(state.conflict ? 'refresh' : 'retry')}
          </CloudAction>
        </View>
      ) : null}
      {growthOpen && snapshot.family ? (
        <CloudGrowthView
          service={service}
          userId={userId}
          familyId={snapshot.family.id}
          actor={snapshot.actor}
          childProfiles={snapshot.children}
          tasks={snapshot.tasks}
          onBack={() => setGrowthOpen(false)}
          onOpenLearning={!parent ? () => setGrowthOpen(false) : undefined}
        />
      ) : editor && parent ? (
        <CloudFamilySetup
          key={`${editor.kind}:${editor.kind === 'edit-child' ? editor.childId : ''}`}
          editor={editor}
          snapshot={snapshot}
          controller={controller}
          disabled={disabled}
          onClose={() => setEditor(null)}
        />
      ) : catalogOpen && parent ? (
        <CloudTaskCatalog
          snapshot={snapshot}
          controller={controller}
          disabled={disabled}
          onAssigned={(id) => {
            setCatalogOpen(false);
            setTab('tasks');
            setTaskId(id);
          }}
        />
      ) : customOpen && parent ? (
        <CloudCustomTaskView
          snapshot={snapshot}
          controller={controller}
          disabled={disabled}
          draft={customDraft}
          onAssigned={(id) => {
            setCustomOpen(false);
            setTab('tasks');
            setTaskId(id);
          }}
        />
      ) : task ? (
        <CloudTaskDetail
          key={task.id}
          task={task}
          service={service}
          snapshot={snapshot}
          controller={controller}
          disabled={disabled}
          onGarden={showGarden}
        />
      ) : tab === 'family' ? (
        <CloudFamilyMembers
          snapshot={snapshot}
          state={state}
          controller={controller}
          disabled={disabled}
          onEdit={setEditor}
        />
      ) : tab === 'tasks' ? (
        <CloudSection title={text('assignedTasks')}>
          {parent ? (
            <CloudActions>
              <CloudAction
                disabled={disabled || !snapshot.children.some((child) => child.active)}
                onPress={() => setCatalogOpen(true)}
                testID="cloud-browse-tasks"
              >
                {text('browse')}
              </CloudAction>
              <CloudAction
                disabled={disabled}
                onPress={() => {
                  setCustomDraft(undefined);
                  setCustomOpen(true);
                }}
                variant="secondary"
                testID="cloud-custom-tasks"
              >
                {text('customTasks')}
              </CloudAction>
              <CloudAction
                onPress={() => setChildFilter('all')}
                variant={childFilter === 'all' ? 'primary' : 'secondary'}
              >
                {text('family')}
              </CloudAction>
              {snapshot.children
                .filter((child) => child.active)
                .map((child) => (
                  <CloudAction
                    key={child.id}
                    variant={childFilter === child.id ? 'primary' : 'secondary'}
                    onPress={() => setChildFilter(child.id)}
                  >
                    {child.displayName}
                  </CloudAction>
                ))}
            </CloudActions>
          ) : null}
          {!tasks.length ? (
            <Text brand testID="cloud-tasks-empty">
              {text('noTasks')}
            </Text>
          ) : null}
          {tasks.map((item) => (
            <View key={item.id} style={cloudStyles.card} testID={`cloud-task-${item.id}`}>
              <Text brand variant="label">
                {item.template.title[locale]}
              </Text>
              <Text brand color="onSurfaceVariant">
                {text(`statuses.${item.status}`)}
              </Text>
              <CloudAction onPress={() => setTaskId(item.id)} variant="secondary">
                {text('review')}
              </CloudAction>
            </View>
          ))}
        </CloudSection>
      ) : tab === 'garden' ? (
        <>
          {!snapshot.children.some((child) => child.active) &&
          progress.canopyContributions === 0 ? (
            <LocalIllustration
              assetId="ghaf-seed"
              decorative
              language={locale}
              direction={direction}
              style={{
                width: '100%',
                aspectRatio: 22 / 13,
                borderRadius: botanical.radius.surface,
              }}
              testID="cloud-empty-garden-artwork"
            />
          ) : null}
          <CloudGardenView
            snapshot={snapshot}
            controller={controller}
            disabled={disabled}
            recognitionId={recognitionId}
          />
          <CloudAction
            onPress={() => setGrowthOpen(true)}
            variant="secondary"
            testID="cloud-open-growth"
          >
            {text('growthJourney')}
          </CloudAction>
          {!parent ? documents('learning') : null}
        </>
      ) : tab === 'study' ? (
        documents('study')
      ) : tab === 'messages' && snapshot.family ? (
        <CloudMessagingView
          service={service}
          userId={userId}
          familyId={snapshot.family.id}
          actor={snapshot.actor}
          childProfiles={snapshot.children}
          onBack={() => selectTab(home)}
        />
      ) : (
        <CloudSection title={text('settings')}>
          <LanguageSwitcher />
          <Text brand>{text('realData')}</Text>
          <CloudActions>
            <CloudAction
              disabled={state.busy || state.pendingRequestId !== null}
              onPress={() => void controller.refresh()}
            >
              {text('refresh')}
            </CloudAction>
            {parent && onOpenAccount ? (
              <CloudAction variant="secondary" onPress={onOpenAccount}>
                {text('account')}
              </CloudAction>
            ) : null}
            {parent && onOpenLegacy ? (
              <CloudAction variant="secondary" onPress={onOpenLegacy}>
                {text('legacy')}
              </CloudAction>
            ) : null}
            {parent && snapshot.family ? (
              <CloudAction
                disabled={disabled}
                variant="secondary"
                onPress={() => setEditor({ kind: 'join' })}
              >
                {text('joinFamily')}
              </CloudAction>
            ) : null}
            <CloudAction variant="quiet" onPress={onSignOut} testID="cloud-family-signout">
              {text('signOut')}
            </CloudAction>
          </CloudActions>
          {parent ? documents('family') : null}
        </CloudSection>
      )}
    </AccessScreen>
  );
}
