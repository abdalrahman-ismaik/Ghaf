import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { FamilyCanopy } from '@/components/family-growth/FamilyCanopy';
import { ParentPatternSummary } from '@/components/family-growth/ParentPatternSummary';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { JourneyHeader, OriginDisclosure } from '@/components/journey';
import { Button, Screen, Text } from '@/components/primitives';
import { colors, radii, spacing } from '@/design/tokens';
import { PARENT_NEXT_ACTIONS } from '@/features/family/overview';
import { P0_SAFE_EQUIVALENT_TEMPLATE } from '@/features/tasks/demoContent';
import { localize } from '@/i18n';
import type { ProspectiveTaskAdjustmentKind } from '@/models/familyGrowth';
import { PARENT_SUMMARY_FIXTURE, serviceRegistry } from '@/services';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function ParentHomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const role = usePrototypeStore((state) => state.role);
  const canopy = usePrototypeStore((state) => state.household.combinedCanopy);
  const journey = usePrototypeStore((state) => state.journey);
  const preAcceptanceAdjustment = usePrototypeStore((state) => state.preAcceptanceAdjustment);
  const resolvePreAcceptanceAdjustment = usePrototypeStore(
    (state) => state.resolvePreAcceptanceAdjustment,
  );
  const setRole = usePrototypeStore((state) => state.setRole);
  const [adjustmentError, setAdjustmentError] = useState<string | null>(null);

  useEffect(() => {
    if (role !== 'parent') router.replace('/role');
  }, [role, router]);

  if (role !== 'parent') {
    return (
      <Screen testID="parent-home-role-guard">
        <JourneyHeader eyebrow={t('origin.synthetic')} title={t('errors.wrongRole')} />
      </Screen>
    );
  }

  const adjustmentUnderReview =
    preAcceptanceAdjustment?.status === 'parent_review_required' &&
    preAcceptanceAdjustment.sourceAssignmentId === journey?.assignment?.id &&
    preAcceptanceAdjustment.sourceTaskId === journey?.task.id
      ? preAcceptanceAdjustment
      : null;
  const smallerCandidate = serviceRegistry.task
    .listTemplates('green_impact')
    .find((template) => template.id === 'GI01');

  const resolveAdjustment = (decision: ProspectiveTaskAdjustmentKind) => {
    setAdjustmentError(null);
    const result = resolvePreAcceptanceAdjustment({ decision });
    if (!result.ok) {
      setAdjustmentError(t('errors.safeRetry'));
      return;
    }
    setRole('child');
    requestAnimationFrame(() => router.replace('/child'));
  };

  const nextRoute =
    journey?.lifecycle === 'retry'
      ? '/parent/check-in'
      : journey?.lifecycle === 'submitted' || journey?.lifecycle === 'confirmed'
        ? '/parent/check-in'
        : journey?.lifecycle === 'recognized'
          ? '/garden'
          : journey?.lifecycle === 'assigned' ||
              journey?.lifecycle === 'chosen' ||
              journey?.lifecycle === 'in_progress'
            ? '/child'
            : '/parent/task/new';
  const nextLabel =
    nextRoute === '/parent/check-in'
      ? t('checkIn.title')
      : nextRoute === '/garden'
        ? t('parentHome.openGarden')
        : nextRoute === '/child'
          ? t('navigation.childHome')
          : t('parentHome.createTask');

  return (
    <Screen contentContainerStyle={styles.screenContent} testID="parent-home-screen">
      <JourneyHeader
        action={<LanguageSwitcher compact showGuidance={false} />}
        eyebrow={t('origin.synthetic')}
        subtitle={t('parentHome.body')}
        title={t('parentHome.title')}
      />

      <FamilyCanopy
        accessibilityLabel={`${t('parentHome.canopyTitle')}. ${canopy.contributionLeaves} / ${canopy.goalLeaves}`}
        contributionLeaves={canopy.contributionLeaves}
        goalLeaves={canopy.goalLeaves}
        meaning={t('parentHome.canopyMeaning')}
        progressAccessibilityLabel={t('accessibility.progress', {
          current: canopy.contributionLeaves,
          goal: canopy.goalLeaves,
        })}
        progressLabel={t('common.leaves', { count: canopy.contributionLeaves })}
        testID="family-combined-canopy"
        title={t('parentHome.canopyTitle')}
      />

      <View style={[styles.milestoneRecord, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <View style={styles.milestoneMark} />
        <View style={styles.grow}>
          <Text color="forest" variant="label">
            {t('parentHome.nextMilestone')}
          </Text>
        </View>
      </View>

      {!adjustmentUnderReview ? (
        <Button
          onPress={() => {
            router.push(nextRoute === '/child' ? '/role' : nextRoute);
          }}
          testID="parent-primary-action"
        >
          {nextLabel}
        </Button>
      ) : null}

      <View style={styles.childLedger}>
        {PARENT_NEXT_ACTIONS.map((action) => (
          <ChildNextAction
            key={action.childId}
            name={t(action.nameKey)}
            next={t(action.nextKey)}
            support={t(action.supportKey)}
          />
        ))}
      </View>

      {adjustmentUnderReview && journey?.assignment ? (
        <View style={styles.adjustmentReview} testID="pre-acceptance-parent-review">
          <View style={styles.adjustmentHeading}>
            <Text color="earth" variant="caption">
              {t('origin.synthetic')}
            </Text>
            <Text color="forest" variant="heading">
              {t('parentHome.adjustmentReviewTitle')}
            </Text>
            <Text color="inkMuted">{t('parentHome.adjustmentReviewBody')}</Text>
          </View>

          <View style={styles.currentTaskRecord}>
            <Text color="earth" variant="caption">
              {t('parentHome.currentAssignment')}
            </Text>
            <Text color="forest" variant="label">
              {localize(journey.task.content.title, locale)}
            </Text>
            <Text>{localize(journey.task.content.definitionOfDone, locale)}</Text>
            <Text color="forest" variant="caption">
              {t('childHome.awardAfterConfirmation', {
                count: journey.task.content.displayedSeedAward ?? 0,
              })}
            </Text>
          </View>

          {smallerCandidate ? (
            <View style={styles.resolutionOption}>
              <Text color="mangrove" variant="label">
                {t('parentHome.smallerResolution')}
              </Text>
              <Text color="forest" variant="label">
                {localize(smallerCandidate.title, locale)}
              </Text>
              <Text color="inkMuted">{localize(smallerCandidate.definitionOfDone, locale)}</Text>
              <Text color="earth" variant="caption">
                {t('childHome.awardAfterConfirmation', {
                  count: smallerCandidate.displayedSeedAward ?? 0,
                })}
              </Text>
              <Button
                onPress={() => resolveAdjustment('smaller')}
                testID="resolve-smaller-task-button"
                variant="secondary"
              >
                {t('parentHome.resolveSmaller')}
              </Button>
            </View>
          ) : null}

          <View style={styles.resolutionOption}>
            <Text color="mangrove" variant="label">
              {t('parentHome.safeEquivalentResolution')}
            </Text>
            <Text color="forest" variant="label">
              {localize(P0_SAFE_EQUIVALENT_TEMPLATE.title, locale)}
            </Text>
            <Text color="inkMuted">
              {localize(P0_SAFE_EQUIVALENT_TEMPLATE.definitionOfDone, locale)}
            </Text>
            <Text color="forest" variant="caption">
              {localize(
                P0_SAFE_EQUIVALENT_TEMPLATE.safety.routeConstraint ??
                  P0_SAFE_EQUIVALENT_TEMPLATE.safety.stopAndAskAdult,
                locale,
              )}
            </Text>
            <Text color="earth" variant="caption">
              {t('childHome.awardAfterConfirmation', {
                count: P0_SAFE_EQUIVALENT_TEMPLATE.displayedSeedAward ?? 0,
              })}
            </Text>
            <Button
              onPress={() => resolveAdjustment('safe_equivalent')}
              testID="resolve-safe-equivalent-button"
              variant="ghost"
            >
              {t('parentHome.resolveSafeEquivalent')}
            </Button>
          </View>

          <Text color="inkMuted" variant="caption">
            {t('parentHome.childDecisionNext')}
          </Text>
          {adjustmentError ? (
            <Text accessibilityLiveRegion="polite" color="danger">
              {adjustmentError}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.secondaryActions}>
        {nextRoute !== '/garden' ? (
          <Button onPress={() => router.push('/garden')} variant="secondary">
            {t('parentHome.openGarden')}
          </Button>
        ) : null}
        <Button onPress={() => router.push('/circle')} variant="ghost">
          {t('parentHome.openCircle')}
        </Button>
      </View>

      <ParentPatternSummary summary={PARENT_SUMMARY_FIXTURE} testID="prepared-parent-summary" />

      <OriginDisclosure
        body={t('parentHome.syntheticPrivacyBoundary')}
        label={t('origin.synthetic')}
        origin="synthetic"
      />

      <Button onPress={() => router.replace('/role')} variant="ghost">
        {t('navigation.switchToChild')}
      </Button>
    </Screen>
  );
}

function ChildNextAction({ name, next, support }: { name: string; next: string; support: string }) {
  const direction = usePrototypeStore((state) => state.direction);
  return (
    <View style={[styles.childRow, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
      <View style={styles.childGlyph}>
        <View style={styles.childLeaf} />
      </View>
      <View style={styles.grow}>
        <Text color="forest" variant="heading">
          {name}
        </Text>
        <Text>{next}</Text>
        <Text color="inkMuted" variant="caption">
          {support}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContent: { paddingBottom: spacing.huge },
  rowRtl: { flexDirection: 'row-reverse' },
  rowLtr: { flexDirection: 'row' },
  milestoneRecord: {
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingBottom: spacing.lg,
  },
  milestoneMark: { width: 4, height: 44, backgroundColor: colors.gold },
  grow: { flex: 1, minWidth: 0, gap: spacing.xxs },
  childLedger: { borderTopWidth: 1, borderTopColor: colors.line },
  adjustmentReview: {
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.mangrove,
    backgroundColor: colors.waterLight,
    padding: spacing.lg,
  },
  adjustmentHeading: { gap: spacing.xs },
  currentTaskRecord: {
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.water,
    paddingBottom: spacing.md,
  },
  resolutionOption: { gap: spacing.sm },
  childRow: {
    minHeight: 96,
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: spacing.md,
  },
  childGlyph: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.leafMist,
  },
  childLeaf: {
    width: 20,
    height: 28,
    borderTopLeftRadius: radii.pill,
    borderBottomRightRadius: radii.pill,
    backgroundColor: colors.ghaf,
    transform: [{ rotate: '22deg' }],
  },
  secondaryActions: { gap: spacing.xs },
});
