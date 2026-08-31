import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { FamilyCanopy } from '@/components/family-growth/FamilyCanopy';
import {
  GardenLandscape,
  type LandscapeTrackContent,
} from '@/components/family-growth/GardenLandscape';
import { JourneyHeader } from '@/components/journey';
import { Button, Screen, Text } from '@/components/primitives';
import { colors, spacing } from '@/design/tokens';
import { buildRecognitionAnnouncement } from '@/features/garden/announcements';
import { localize } from '@/i18n';
import type { LandscapeId } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

const LANDSCAPE_IDS: readonly LandscapeId[] = ['mangrove', 'ghaf', 'samar', 'sidr', 'date_palm'];

export default function GardenScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const journey = usePrototypeStore((state) => state.journey);
  const landscapeProgress = usePrototypeStore((state) => state.landscapeProgress);
  const canopy = usePrototypeStore((state) => state.household.combinedCanopy);
  const celebration = usePrototypeStore((state) => state.celebration);
  const circleGoal = usePrototypeStore((state) => state.circleGoal);
  const recognitionLedger = usePrototypeStore((state) => state.recognitionLedger);
  const consumeCelebration = usePrototypeStore((state) => state.consumeCelebration);
  const recognized = journey?.lifecycle === 'recognized';
  const [revealOnMount] = useState(
    () => recognized && celebration.available && !celebration.consumed,
  );

  const openCircle = () => {
    if (revealOnMount) consumeCelebration();
    router.push('/circle');
  };

  const recognitionReceipt = Object.values(recognitionLedger)[0] ?? null;
  const recognitionAnnouncement = recognitionReceipt
    ? buildRecognitionAnnouncement({
        award: recognitionReceipt.seedTransaction
          ? t('common.seeds', { count: recognitionReceipt.seedTransaction.amount })
          : null,
        landscape: recognitionReceipt.landscapeGrowth
          ? `${t('garden.mangrove')} · ${t(`garden.${recognitionReceipt.landscapeGrowth.stageAfter}`)}`
          : null,
        canopy: recognitionReceipt.canopyContribution ? t('garden.canopy') : null,
        circle: recognitionReceipt.circleEvent
          ? circleGoal.eligibleGreenActions >= circleGoal.goal
            ? `${t('circle.milestone')} · ${t('circle.progress', {
                current: circleGoal.eligibleGreenActions,
                goal: circleGoal.goal,
              })}`
            : t('circle.contribution')
          : null,
      })
    : '';

  const tracks = useMemo(
    () =>
      Object.fromEntries(
        LANDSCAPE_IDS.map((id) => {
          const progress = landscapeProgress[id];
          const target =
            id === 'mangrove' && progress.cumulativeSeeds >= 60
              ? 60
              : (progress.nextThreshold ?? 200);
          const nameKey = id === 'date_palm' ? 'datePalm' : id;
          const label = `${progress.cumulativeSeeds} / ${target}`;
          const content: LandscapeTrackContent = {
            accessibilityLabel: `${t(`garden.${nameKey}`)}. ${t(`garden.${progress.stage}`)}. ${label}`,
            categoryLabel:
              id === 'mangrove' ? t('garden.greenCategory') : t('garden.otherCategory'),
            cumulativeSeeds: progress.cumulativeSeeds,
            name: t(`garden.${nameKey}`),
            originNote: t('origin.symbolic'),
            progressLabel:
              id === 'mangrove' ? t(recognized ? 'garden.after' : 'garden.before') : label,
            stage: progress.stage,
            stageLabel: t(`garden.${progress.stage}`),
            targetSeeds: target,
          };
          return [id, content];
        }),
      ) as Record<LandscapeId, LandscapeTrackContent>,
    [landscapeProgress, recognized, t],
  );

  return (
    <Screen contentContainerStyle={styles.screenContent} testID="garden-screen">
      <JourneyHeader
        eyebrow={t('origin.symbolic')}
        subtitle={t('garden.body')}
        title={t('garden.title')}
      />

      {recognized ? (
        <View style={styles.causeRecord} testID="garden-cause-record">
          <View
            style={[
              styles.inlineAccent,
              direction === 'rtl' ? styles.inlineAccentRtl : styles.inlineAccentLtr,
            ]}
          >
            <View style={[styles.inlineAccentLine, styles.causeAccentLine]} />
            <Text color="earth" style={styles.inlineAccentText} variant="caption">
              {t('checkIn.praiseLabel')}
            </Text>
          </View>
          <Text color="forest" variant="heading">
            {journey.checkIn?.praise ? localize(journey.checkIn.praise, locale) : t('garden.cause')}
          </Text>
          <Text color="forest" variant="label">
            {t('garden.cause')}
          </Text>
        </View>
      ) : null}

      <GardenLandscape
        accessibilityLabel={`${t('garden.title')}. ${t(
          recognized ? 'garden.after' : 'garden.before',
        )}`}
        activeLandscapeId="mangrove"
        labels={{
          activeTrack: t(recognized ? 'garden.activeTrack' : 'garden.focusTrack'),
          inspiredBy: t('garden.inspiredBy'),
          symbolicDisclosure: t('garden.symbolicDisclosure'),
        }}
        recognitionReveal={
          recognized
            ? {
                play: revealOnMount,
                sequenceKey: Object.keys(recognitionLedger)[0] ?? 'recognized-p0',
                accessibilityAnnouncement: recognitionAnnouncement,
              }
            : undefined
        }
        testID="uae-landscape-tracks"
        tracks={tracks}
      />

      <FamilyCanopy
        accessibilityLabel={`${t('parentHome.canopyTitle')}. ${canopy.contributionLeaves} / ${canopy.goalLeaves}`}
        contributionLeaves={canopy.contributionLeaves}
        goalLeaves={canopy.goalLeaves}
        highlightLatestContribution={recognized}
        latestContributionLabel={recognized ? t('garden.canopy') : undefined}
        meaning={t('parentHome.canopyMeaning')}
        progressAccessibilityLabel={t('accessibility.progress', {
          current: canopy.contributionLeaves,
          goal: canopy.goalLeaves,
        })}
        progressLabel={t('common.leaves', { count: canopy.contributionLeaves })}
        testID="recognized-family-canopy"
        title={t('parentHome.canopyTitle')}
      />

      <View style={styles.symbolicBoundary}>
        <View
          style={[
            styles.inlineAccent,
            direction === 'rtl' ? styles.inlineAccentRtl : styles.inlineAccentLtr,
          ]}
        >
          <View style={[styles.inlineAccentLine, styles.disclosureAccentLine]} />
          <Text color="forest" style={styles.inlineAccentText} variant="label">
            {t('garden.symbolicDisclosure')}
          </Text>
        </View>
        <Text color="inkMuted" variant="caption">
          {t('origin.synthetic')}
        </Text>
      </View>
      <Button onPress={openCircle} testID="open-circle-button">
        {t('navigation.circle')}
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: { paddingBottom: spacing.huge },
  causeRecord: {
    gap: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gold,
    paddingVertical: spacing.xl,
  },
  inlineAccent: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  inlineAccentLtr: {
    flexDirection: 'row',
  },
  inlineAccentRtl: {
    // Yoga follows the document direction, so the first item stays at the logical start.
    flexDirection: 'row',
  },
  inlineAccentLine: {
    width: spacing.xl,
    height: 1,
  },
  inlineAccentText: {
    minWidth: 0,
    flex: 1,
  },
  causeAccentLine: {
    backgroundColor: colors.gold,
  },
  disclosureAccentLine: {
    backgroundColor: colors.mangrove,
  },
  symbolicBoundary: {
    gap: spacing.xs,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.water,
    backgroundColor: colors.waterLight,
    padding: spacing.md,
  },
});
