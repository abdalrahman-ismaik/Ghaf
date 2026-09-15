import { MessagingEntry } from '@/components/familyMessaging/MessagingEntry';
import { StudyEntries } from '@/components/study/StudyEntries';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ParentHomeHeader, ParentHomeNavigation, R002aScreen } from '@/components/r002a';
import { R003ActionRow, R003Hero, R003Progress, R003Section, R003Status } from '@/components/r003';
import { FamilyConnectionPlan } from '@/components/family/FamilyConnectionPlan';
import { Text } from '@/components/primitives';
import { r002bFeatureFlags } from '@/config/r002bFeatureFlags';
import { createR002bOrigin, serializeR002bOrigin } from '@/features/navigation/r002bOrigin';
import type { R002bRouteParam } from '@/features/navigation/r002bRouteRequest';
import { localize } from '@/i18n';
import type { SyntheticChildId } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import { focusAccessibilityTarget } from '@/utils/accessibilityFocus';

interface ParentFamilyParams extends Record<string, R002bRouteParam> {
  readonly restoreFocusTarget?: R002bRouteParam;
  readonly restoreProfileId?: R002bRouteParam;
  readonly restoreScrollOffset?: R002bRouteParam;
}

export default function ParentFamilyScreen() {
  const params = useLocalSearchParams() as unknown as ParentFamilyParams;
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
  const children = usePrototypeStore((state) => state.children);
  const localFamily = usePrototypeStore((state) => state.localFamily);
  const familyReward = usePrototypeStore((state) => state.familyReward);
  const getFamilyConnectionPlan = usePrototypeStore((state) => state.getFamilyConnectionPlan);
  const getFamilyReward = usePrototypeStore((state) => state.getFamilyReward);
  const setActiveChild = usePrototypeStore((state) => state.setActiveChild);
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const progressEntryRef = useRef<View | null>(null);
  const sharedGardenEntryRef = useRef<View | null>(null);
  const reward = useMemo(() => {
    void familyReward;
    return getFamilyReward();
  }, [familyReward, getFamilyReward]);
  const familyConnections = useMemo(() => {
    void localFamily;
    return getFamilyConnectionPlan();
  }, [getFamilyConnectionPlan, localFamily]);
  const formatter = useMemo(
    () => new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', { useGrouping: false }),
    [locale],
  );
  const activeChild = children[activeChildId];
  const activeChildName =
    localFamily.record?.children.find((child) => child.id === activeChildId)?.nickname ??
    localize(activeChild.displayName, locale);
  const requestedFocus =
    typeof params.restoreFocusTarget === 'string' ? params.restoreFocusTarget : undefined;
  const restoreProfileId =
    typeof params.restoreProfileId === 'string' ? params.restoreProfileId : undefined;
  const restoredFocusTarget =
    restoreProfileId === activeChildId &&
    ((requestedFocus === 'r003-family-progress-row' &&
      r002bFeatureFlags.r002b_parent_progress_ui) ||
      (requestedFocus === 'r003-family-shared-garden-row' &&
        r002bFeatureFlags.r002b_shared_growth_view))
      ? requestedFocus
      : undefined;
  const rawRestoreScrollOffset = params.restoreScrollOffset;
  const restoredScrollOffset =
    restoredFocusTarget &&
    typeof rawRestoreScrollOffset === 'string' &&
    /^\d+$/u.test(rawRestoreScrollOffset) &&
    Number(rawRestoreScrollOffset) <= 100_000
      ? Number(rawRestoreScrollOffset)
      : 0;
  const familyScrollOffsetRef = useRef(restoredScrollOffset);

  useFocusEffect(
    useCallback(() => {
      if (!restoredFocusTarget) return;
      const frame = requestAnimationFrame(() => {
        focusAccessibilityTarget(
          restoredFocusTarget === 'r003-family-progress-row'
            ? progressEntryRef.current
            : sharedGardenEntryRef.current,
        );
      });
      return () => cancelAnimationFrame(frame);
    }, [restoredFocusTarget]),
  );

  const openProgress = (childId: SyntheticChildId) => {
    setTransitionError(null);
    const selected = setActiveChild(childId);
    if (!selected.ok) {
      setTransitionError(t('errors.safeRetry'));
      return;
    }
    const origin = createR002bOrigin({
      id: 'parent_family_overview_progress_row',
      profileId: childId,
      scrollOffset: familyScrollOffsetRef.current,
    });
    if (!origin.ok) {
      setTransitionError(t('errors.safeRetry'));
      return;
    }
    router.push({
      pathname: '/parent/family/[profileId]/progress',
      params: { profileId: childId, ...serializeR002bOrigin(origin.data) },
    } as unknown as Href);
  };

  const openSharedGarden = () => {
    setTransitionError(null);
    const origin = createR002bOrigin({
      id: 'parent_family_overview_shared_garden_row',
      profileId: activeChildId,
      scrollOffset: familyScrollOffsetRef.current,
    });
    if (!origin.ok) {
      setTransitionError(t('errors.safeRetry'));
      return;
    }
    router.push({
      pathname: '/parent/family/shared-garden',
      params: { profileId: activeChildId, ...serializeR002bOrigin(origin.data) },
    } as unknown as Href);
  };

  return (
    <R002aScreen
      footer={
        <ParentHomeNavigation
          activeKey="family"
          direction={direction}
          familyLabel={t('navigation.family')}
          gardenLabel={t('navigation.garden')}
          homeLabel={t('parentHome.homeLabel')}
          onFamily={() => undefined}
          onGarden={() => router.replace('/garden')}
          onHome={() => router.replace('/parent')}
          onTasks={() => router.replace({ pathname: '/parent', params: { section: 'tasks' } })}
          tasksLabel={t('parentHome.tasksLabel')}
        />
      }
      header={
        <ParentHomeHeader
          direction={direction}
          onToggleSettings={() => router.push('/parent/settings' as Href)}
          profileLabel={t('parentHome.selectedChild', {
            child: activeChildName,
          })}
          settingsLabel={t('parentHome.settingsLabel')}
          settingsOpen={false}
          title={t('r003.family.title')}
        />
      }
      scrollProps={{
        contentOffset: { x: 0, y: restoredScrollOffset },
        onScroll: (event) => {
          familyScrollOffsetRef.current = Math.max(
            0,
            Math.round(event.nativeEvent.contentOffset.y),
          );
        },
        scrollEventThrottle: 16,
      }}
      testID="parent-family-screen"
    >
      <R003Hero
        body={t('r003.family.body')}
        direction={direction}
        icon="family"
        language={locale}
        title={t('r003.family.title')}
      />

      <MessagingEntry role="parent" />
      <StudyEntries role="parent" />
      {familyConnections.ok && familyConnections.data.entries.length > 0 ? (
        <FamilyConnectionPlan
          direction={direction}
          language={locale}
          plan={familyConnections.data}
        />
      ) : null}

      <R003Section title={t('r003.family.childrenTitle')}>
        {localFamily.configuredChildIds.map((childId) => {
          const child = children[childId];
          const name =
            localFamily.record?.children.find((profile) => profile.id === childId)?.nickname ??
            localize(child.displayName, locale);
          return (
            <R003ActionRow
              body={t(
                childId === 'child_salem' ? 'r003.family.salemStatus' : 'r003.family.alyaStatus',
              )}
              direction={direction}
              icon={childId === 'child_salem' ? 'ghaf-tree' : 'flower'}
              key={childId}
              language={locale}
              meta={
                r002bFeatureFlags.r002b_parent_progress_ui
                  ? undefined
                  : t('r003.family.progressUnavailable')
              }
              onPress={
                r002bFeatureFlags.r002b_parent_progress_ui ? () => openProgress(childId) : undefined
              }
              ref={childId === activeChildId ? progressEntryRef : undefined}
              testID={`family-progress-${childId}`}
              title={
                r002bFeatureFlags.r002b_parent_progress_ui
                  ? t('r003.family.progressAction', { name })
                  : name
              }
            />
          );
        })}
      </R003Section>

      {reward.ok ? (
        <R003Section testID="family-reward-summary">
          <R003ActionRow
            body={t('r003.family.rewardPrivate')}
            direction={direction}
            icon="lock"
            language={locale}
            meta={t(`r003.reward.${reward.data.view.lifecycle}`)}
            onPress={() => router.push('/parent/family/reward' as Href)}
            testID="open-family-reward"
            title={t('r003.family.rewardTitle')}
          />
          <R003Progress
            accessibilityLabel={t('r003.family.rewardProgress', {
              current: formatter.format(reward.data.currentEligibleSeeds),
              target: formatter.format(reward.data.targetEligibleSeeds),
            })}
            current={reward.data.currentEligibleSeeds}
            direction={direction}
            target={reward.data.targetEligibleSeeds}
          />
          <Text brand color="deepForest" direction={direction} language={locale} variant="label">
            {localize(reward.data.view.promise.label, locale)}
          </Text>
          <Text
            brand
            color="onSurfaceVariant"
            direction={direction}
            language={locale}
            variant="caption"
          >
            {t('r003.family.rewardOwner', {
              name:
                localFamily.record?.children.find(
                  (profile) => profile.id === reward.data.view.childId,
                )?.nickname ?? localize(children[reward.data.view.childId].displayName, locale),
            })}
          </Text>
          <Text
            brand
            color="onSurfaceVariant"
            direction={direction}
            language={locale}
            tabular
            variant="caption"
          >
            {t('r003.family.rewardProgress', {
              current: formatter.format(reward.data.currentEligibleSeeds),
              target: formatter.format(reward.data.targetEligibleSeeds),
            })}
          </Text>
        </R003Section>
      ) : null}

      {transitionError ? (
        <R003Status
          direction={direction}
          language={locale}
          message={transitionError}
          tone="warning"
        />
      ) : null}

      <R003Section>
        {r002bFeatureFlags.r002b_shared_growth_view ? (
          <R003ActionRow
            body={t('r003.family.sharedGardenBody')}
            direction={direction}
            icon="flower"
            language={locale}
            onPress={openSharedGarden}
            ref={sharedGardenEntryRef}
            testID="open-shared-garden-settings"
            title={t('r003.family.sharedGardenTitle')}
          />
        ) : null}
        <R003ActionRow
          direction={direction}
          icon="leaf"
          language={locale}
          onPress={() => router.push('/circle')}
          title={t('r003.family.circleAction')}
        />
        <R003ActionRow
          direction={direction}
          icon="settings"
          language={locale}
          onPress={() => router.push('/parent/settings' as Href)}
          title={t('r003.family.settingsAction')}
        />
      </R003Section>
    </R002aScreen>
  );
}
