import { useState, type ReactNode } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Image, Pressable, StyleSheet, View, type ImageProps } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card, IconButton, Text } from '@/components/primitives';
import { resolveDemoMediaSource } from '@/components/demoAssets';
import { colors, layout, radii, spacing } from '@/design/tokens';
import type { DemoMediaAssetId } from '@/features/missions/demoContent';
import { usePrototypeStore } from '@/state/usePrototypeStore';

interface JourneyHeaderProps {
  action?: ReactNode;
  backLabel?: string;
  eyebrow: string;
  onBack?: () => void;
  subtitle?: string;
  title: string;
}

export function JourneyHeader({
  action,
  backLabel,
  eyebrow,
  onBack,
  subtitle,
  title,
}: JourneyHeaderProps) {
  const { t } = useTranslation();
  const direction = usePrototypeStore((state) => state.direction);

  return (
    <View style={styles.header}>
      {onBack || action ? (
        <View style={[styles.headerActions, direction === 'rtl' ? styles.rowRtl : null]}>
          {onBack ? (
            <IconButton
              icon={<DirectionArrow reverse={direction === 'rtl'} />}
              label={backLabel ?? t('common.back')}
              onPress={onBack}
              testID="back-button"
            />
          ) : (
            <View style={styles.headerSpacer} />
          )}
          {action ?? <View style={styles.headerSpacer} />}
        </View>
      ) : null}
      <View style={styles.headerCopy}>
        <Text color="forest" variant="title">
          {title}
        </Text>
        {subtitle ? <Text color="inkMuted">{subtitle}</Text> : null}
        <View style={styles.headerRecord}>
          <View style={styles.headerRecordLine} />
          <Text color="earth" variant="caption">
            {eyebrow}
          </Text>
        </View>
      </View>
    </View>
  );
}

function DirectionArrow({ reverse }: { reverse: boolean }) {
  return (
    <View style={[styles.arrow, reverse ? styles.arrowReverse : null]}>
      <View style={styles.arrowShaft} />
      <View style={[styles.arrowHead, styles.arrowHeadTop]} />
      <View style={[styles.arrowHead, styles.arrowHeadBottom]} />
    </View>
  );
}

function CheckMark({ selected }: { selected: boolean }) {
  if (!selected) return <View style={styles.unselectedMark} />;

  return (
    <View style={styles.checkMark}>
      <View style={styles.checkShort} />
      <View style={styles.checkLong} />
    </View>
  );
}

function AudioControlMark({ playing }: { playing: boolean }) {
  return playing ? (
    <View style={styles.pauseMark}>
      <View style={styles.pauseBar} />
      <View style={styles.pauseBar} />
    </View>
  ) : (
    <View style={styles.playMark} />
  );
}

interface DisclosureCardProps {
  body: string;
  kind?: 'prepared' | 'simulated' | 'estimated' | 'safety';
  title?: string;
}

export function DisclosureCard({ body, kind = 'prepared', title }: DisclosureCardProps) {
  return (
    <View style={[styles.disclosure, kind === 'safety' ? styles.safetyDisclosure : null]}>
      <View style={[styles.disclosureGlyph, kind === 'safety' ? styles.safetyGlyph : null]}>
        <View style={[styles.disclosureMark, kind === 'safety' ? styles.safetyMark : null]} />
      </View>
      <View style={styles.disclosureCopy}>
        {title ? (
          <Text color="forest" variant="label">
            {title}
          </Text>
        ) : null}
        <Text color="inkMuted" variant="caption">
          {body}
        </Text>
      </View>
    </View>
  );
}

interface PreparedSelectionCardProps {
  detail: string;
  mediaId?: DemoMediaAssetId;
  label: string;
  onPress: () => void;
  selected: boolean;
  testID: string;
}

export function PreparedSelectionCard({
  detail,
  mediaId,
  label,
  onPress,
  selected,
  testID,
}: PreparedSelectionCardProps) {
  const { t } = useTranslation();
  const direction = usePrototypeStore((state) => state.direction);

  return (
    <Pressable
      accessibilityLabel={`${label}. ${detail}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.selectionCard,
        selected ? styles.selectionCardSelected : null,
        pressed ? styles.pressed : null,
      ]}
      testID={testID}
    >
      {mediaId ? (
        <Image
          resizeMode="cover"
          source={resolveDemoMediaSource(mediaId)}
          style={styles.selectionImage}
        />
      ) : null}
      <View style={[styles.selectionBody, mediaId ? styles.selectionBodyWithImage : null]}>
        <View style={styles.selectionCopy}>
          <Text color="forest" variant="label">
            {label}
          </Text>
          <Text color="inkMuted" variant="caption">
            {detail}
          </Text>
        </View>
        <View style={[styles.check, selected ? styles.checkSelected : null]}>
          <CheckMark selected={selected} />
        </View>
      </View>
      <View
        style={[
          styles.preparedBadge,
          direction === 'rtl' ? styles.preparedBadgeRtl : styles.preparedBadgeLtr,
        ]}
      >
        <Text align="center" color="earth" variant="caption">
          {selected ? t('common.selected') : t('common.prepared')}
        </Text>
      </View>
    </Pressable>
  );
}

interface PreparedAudioButtonProps {
  label: string;
  mediaId: DemoMediaAssetId;
  playingLabel: string;
  testID: string;
}

export function PreparedAudioButton({
  label,
  mediaId,
  playingLabel,
  testID,
}: PreparedAudioButtonProps) {
  const { t } = useTranslation();
  const [localError, setLocalError] = useState(false);
  const player = useAudioPlayer(resolveDemoMediaSource(mediaId), { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);

  const togglePlayback = () => {
    setLocalError(false);
    try {
      if (status.playing) {
        player.pause();
      } else {
        if (status.didJustFinish) {
          void player.seekTo(0);
        }
        player.play();
      }
    } catch {
      setLocalError(true);
    }
  };

  return (
    <View style={styles.audioGroup}>
      <Pressable
        accessibilityLabel={status.playing ? t('media.stopAudio') : label}
        accessibilityRole="button"
        accessibilityState={{ busy: status.isBuffering }}
        onPress={togglePlayback}
        style={({ pressed }) => [styles.audioButton, pressed ? styles.pressed : null]}
        testID={testID}
      >
        <View style={styles.audioGlyph}>
          <AudioControlMark playing={status.playing} />
        </View>
        <View style={styles.audioCopy}>
          <Text color="forest" variant="label">
            {status.playing ? playingLabel : label}
          </Text>
          <Text color="inkMuted" variant="caption">
            {status.isBuffering ? t('media.loading') : t('media.preparedBadge')}
          </Text>
        </View>
      </Pressable>
      {localError || status.error ? (
        <Text color="danger" variant="caption">
          {t('media.playbackError')}
        </Text>
      ) : null}
    </View>
  );
}

interface PreparedMediaImageProps extends Omit<ImageProps, 'source'> {
  mediaId: DemoMediaAssetId;
}

export function PreparedMediaImage({ mediaId, ...props }: PreparedMediaImageProps) {
  return <Image {...props} source={resolveDemoMediaSource(mediaId)} />;
}

interface SectionHeadingProps {
  detail?: string;
  title: string;
}

export function SectionHeading({ detail, title }: SectionHeadingProps) {
  return (
    <View style={styles.sectionHeading}>
      <Text color="forest" variant="heading">
        {title}
      </Text>
      {detail ? (
        <Text color="inkMuted" variant="caption">
          {detail}
        </Text>
      ) : null}
    </View>
  );
}

interface StatPillProps {
  label: string;
  value: string;
}

export function StatPill({ label, value }: StatPillProps) {
  return (
    <Card style={styles.statPill}>
      <Text color="ghaf" variant="heading">
        {value}
      </Text>
      <Text color="inkMuted" variant="caption">
        {label}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  headerActions: {
    flexDirection: 'row',
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerSpacer: {
    width: layout.touchTarget,
    height: layout.touchTarget,
  },
  headerCopy: {
    gap: spacing.sm,
  },
  headerRecord: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  headerRecordLine: {
    width: 32,
    height: 1,
    backgroundColor: colors.gold,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  arrow: {
    width: 22,
    height: 16,
    justifyContent: 'center',
  },
  arrowReverse: {
    transform: [{ rotate: '180deg' }],
  },
  arrowShaft: {
    width: 20,
    height: 1.5,
    backgroundColor: colors.forest,
  },
  arrowHead: {
    position: 'absolute',
    left: 0,
    width: 8,
    height: 1.5,
    backgroundColor: colors.forest,
    transformOrigin: 'left center',
  },
  arrowHeadTop: {
    transform: [{ rotate: '42deg' }],
  },
  arrowHeadBottom: {
    transform: [{ rotate: '-42deg' }],
  },
  disclosure: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.sm,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.goldGlow,
    padding: spacing.md,
  },
  safetyDisclosure: {
    borderColor: colors.dangerLight,
    backgroundColor: colors.dangerLight,
  },
  disclosureGlyph: {
    width: 18,
    height: 36,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  safetyGlyph: {
    borderColor: colors.danger,
  },
  disclosureMark: {
    width: 4,
    height: 18,
    backgroundColor: colors.gold,
  },
  safetyMark: {
    backgroundColor: colors.danger,
  },
  disclosureCopy: {
    minWidth: 0,
    flex: 1,
    gap: spacing.xxs,
  },
  selectionCard: {
    minHeight: layout.touchTarget,
    overflow: 'hidden',
    borderRadius: radii.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  selectionCardSelected: {
    borderColor: colors.ghaf,
    backgroundColor: colors.leafMist,
  },
  selectionImage: {
    width: '100%',
    height: 154,
    backgroundColor: colors.sandLight,
  },
  selectionBody: {
    flexDirection: 'row',
    minHeight: 92,
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  selectionBodyWithImage: {
    minHeight: 78,
  },
  selectionCopy: {
    minWidth: 0,
    flex: 1,
    gap: spacing.xxs,
  },
  check: {
    width: 32,
    height: 32,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.ivory,
  },
  checkSelected: {
    borderColor: colors.ghaf,
    backgroundColor: colors.ghaf,
  },
  preparedBadge: {
    position: 'absolute',
    top: spacing.sm,
    borderRadius: radii.sm,
    borderCurve: 'continuous',
    backgroundColor: colors.goldLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  preparedBadgeRtl: {
    left: spacing.sm,
  },
  preparedBadgeLtr: {
    right: spacing.sm,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  audioGroup: {
    gap: spacing.xs,
  },
  audioButton: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.leaf,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  audioGlyph: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.ghaf,
  },
  unselectedMark: {
    width: 5,
    height: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.inkMuted,
  },
  checkMark: {
    width: 17,
    height: 14,
  },
  checkShort: {
    position: 'absolute',
    left: 2,
    top: 7,
    width: 7,
    height: 2,
    backgroundColor: colors.white,
    transform: [{ rotate: '45deg' }],
  },
  checkLong: {
    position: 'absolute',
    left: 6,
    top: 6,
    width: 11,
    height: 2,
    backgroundColor: colors.white,
    transform: [{ rotate: '-48deg' }],
  },
  pauseMark: {
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  pauseBar: {
    width: 3,
    height: 15,
    backgroundColor: colors.white,
  },
  playMark: {
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 13,
    borderTopColor: colors.transparent,
    borderBottomColor: colors.transparent,
    borderLeftColor: colors.white,
    marginLeft: spacing.xxs,
  },
  audioCopy: {
    minWidth: 0,
    flex: 1,
    gap: spacing.xxs,
  },
  sectionHeading: {
    gap: spacing.xs,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  statPill: {
    minWidth: 148,
    flex: 1,
    backgroundColor: colors.transparent,
    borderTopColor: colors.ghaf,
    padding: spacing.md,
  },
});
