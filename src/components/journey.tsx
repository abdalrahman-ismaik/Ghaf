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
        <View style={styles.headerActions}>
          {onBack ? (
            <IconButton
              icon={direction === 'rtl' ? '→' : '←'}
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
        <Text color="gold" variant="label">
          {eyebrow}
        </Text>
        <Text color="forest" variant="title">
          {title}
        </Text>
        {subtitle ? <Text color="inkMuted">{subtitle}</Text> : null}
      </View>
    </View>
  );
}

interface DisclosureCardProps {
  body: string;
  kind?: 'prepared' | 'simulated' | 'estimated' | 'safety';
  title?: string;
}

export function DisclosureCard({ body, kind = 'prepared', title }: DisclosureCardProps) {
  const glyph =
    kind === 'prepared' ? '◆' : kind === 'simulated' ? '✦' : kind === 'safety' ? '!' : '≈';

  return (
    <View style={[styles.disclosure, kind === 'safety' ? styles.safetyDisclosure : null]}>
      <View style={[styles.disclosureGlyph, kind === 'safety' ? styles.safetyGlyph : null]}>
        <Text align="center" color={kind === 'safety' ? 'danger' : 'earth'} variant="caption">
          {glyph}
        </Text>
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
          <Text align="center" color={selected ? 'white' : 'inkMuted'} variant="caption">
            {selected ? '✓' : '+'}
          </Text>
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
          <Text align="center" color="white" variant="label">
            {status.playing ? 'Ⅱ' : '▶'}
          </Text>
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
  disclosure: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.md,
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
    width: 34,
    height: 34,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.goldLight,
  },
  safetyGlyph: {
    backgroundColor: colors.surface,
  },
  disclosureCopy: {
    minWidth: 0,
    flex: 1,
    gap: spacing.xxs,
  },
  selectionCard: {
    minHeight: layout.touchTarget,
    overflow: 'hidden',
    borderRadius: radii.lg,
    borderCurve: 'continuous',
    borderWidth: 1.5,
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
    borderRadius: radii.pill,
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
    borderRadius: radii.pill,
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
    borderRadius: radii.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.leaf,
    backgroundColor: colors.leafMist,
    padding: spacing.md,
  },
  audioGlyph: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.ghaf,
  },
  audioCopy: {
    minWidth: 0,
    flex: 1,
    gap: spacing.xxs,
  },
  sectionHeading: {
    gap: spacing.xs,
  },
  statPill: {
    minWidth: 148,
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
});
