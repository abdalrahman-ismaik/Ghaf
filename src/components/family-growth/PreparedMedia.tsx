import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { resolvePreparedMediaSource } from '@/components/demoAssets';
import { OriginDisclosure } from '@/components/journey';
import { QuietButton, SecondaryButton, Text } from '@/components/primitives';
import { colors, layout, radii, spacing } from '@/design/tokens';
import { localize } from '@/i18n';
import type { PreparedMediaFixture } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

function MediaTypeIcon({ kind }: { kind: PreparedMediaFixture['kind'] }) {
  return (
    <Svg aria-hidden height={spacing.xl} viewBox="0 0 24 24" width={spacing.xl}>
      {kind === 'image' ? (
        <>
          <Path
            d="M4 5h16v14H4z"
            fill={colors.waterLight}
            stroke={colors.mangrove}
            strokeLinejoin="round"
            strokeWidth={2}
          />
          <Path
            d="m6.5 16 3.5-4 2.5 2.5 2.3-2.8 2.7 4.3"
            fill="none"
            stroke={colors.mangrove}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
          <Path d="M15.5 8.5h.01" stroke={colors.mangrove} strokeLinecap="round" strokeWidth={3} />
        </>
      ) : (
        <>
          <Path
            d="M8 9v6M12 6v12M16 9v6M4 11v2M20 11v2"
            fill="none"
            stroke={colors.mangrove}
            strokeLinecap="round"
            strokeWidth={2}
          />
        </>
      )}
    </Svg>
  );
}

function SelectedMark() {
  return (
    <Svg aria-hidden height={spacing.lg} viewBox="0 0 20 20" width={spacing.lg}>
      <Path
        d="M4 10.5 8.1 14.5 16 6.5"
        fill="none"
        stroke={colors.white}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Svg>
  );
}

interface PreparedMediaProps {
  onRemove?: () => void;
  onSelect?: () => void;
  onUnavailable?: () => void;
  selected?: boolean;
  testID?: string;
  unavailable?: boolean;
  fixture: PreparedMediaFixture;
}

export function PreparedMedia({
  fixture,
  onRemove,
  onSelect,
  onUnavailable,
  selected = false,
  testID,
  unavailable = false,
}: PreparedMediaProps) {
  const { t } = useTranslation();
  const direction = usePrototypeStore((state) => state.direction);
  const locale = usePrototypeStore((state) => state.locale);
  const [failedImageId, setFailedImageId] = useState<PreparedMediaFixture['id'] | null>(null);
  const source = fixture.kind === 'image' ? resolvePreparedMediaSource(fixture.id) : null;
  const imageLoadFailed = fixture.kind === 'image' && failedImageId === fixture.id;
  const imageAvailable =
    fixture.kind === 'image' && source !== null && !unavailable && !imageLoadFailed;
  const transcriptAvailable = fixture.kind === 'audio' && fixture.transcript !== null;
  const selectable = !imageLoadFailed && !unavailable && (imageAvailable || transcriptAvailable);
  const effectiveSelected = selected && selectable;
  const label = fixture.kind === 'image' ? t('media.imageLabel') : t('media.audioLabel');
  const fallbackVisible = unavailable || (fixture.kind === 'audio' && fixture.uri === null);
  const fallbackShown = fixture.kind === 'image' && !imageAvailable;
  const handleImageLoadError = () => {
    setFailedImageId(fixture.id);
    onUnavailable?.();
  };

  return (
    <View
      accessibilityLabel={[
        label,
        localize(fallbackShown ? fixture.fallbackText : fixture.accessibleDescription, locale),
        localize(fixture.parentVisibilityNotice, locale),
      ].join('. ')}
      style={[styles.media, effectiveSelected ? styles.mediaSelected : null]}
      testID={testID}
    >
      {effectiveSelected ? <View style={styles.selectedRule} /> : null}
      <View style={[styles.mediaHeader, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <View style={styles.mediaIcon}>
          <MediaTypeIcon kind={fixture.kind} />
        </View>
        <View style={styles.mediaTitleCopy}>
          <Text color="forest" variant="heading">
            {label}
          </Text>
          <Text color="inkMuted" variant="caption">
            {localize(fixture.accessibleDescription, locale)}
          </Text>
        </View>
        {effectiveSelected ? (
          <View style={styles.selectedBadge}>
            <SelectedMark />
          </View>
        ) : null}
      </View>

      {fixture.kind === 'image' ? (
        imageAvailable && source ? (
          <Image
            accessibilityLabel={localize(fixture.accessibleDescription, locale)}
            accessibilityRole="image"
            onError={handleImageLoadError}
            resizeMode="cover"
            source={source}
            style={styles.preparedImage}
            testID={`${testID ?? 'prepared-media'}-image`}
          />
        ) : (
          <FallbackRecord text={localize(fixture.fallbackText, locale)} />
        )
      ) : (
        <View style={styles.transcriptRecord}>
          {fallbackVisible ? (
            <Text color="earth" variant="caption">
              {localize(fixture.fallbackText, locale)}
            </Text>
          ) : null}
          {fixture.transcript ? (
            <Text direction="auto">{localize(fixture.transcript, locale)}</Text>
          ) : (
            <Text color="inkMuted">{localize(fixture.fallbackText, locale)}</Text>
          )}
        </View>
      )}

      <OriginDisclosure
        body={t('media.optional')}
        compact
        label={t('origin.prepared')}
        origin="prepared"
      />

      <View style={[styles.visibilityRecord, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <View style={styles.visibilityMark} />
        <Text color="inkMuted" style={styles.visibilityText} variant="caption">
          {localize(fixture.parentVisibilityNotice, locale)}
        </Text>
      </View>

      <View style={styles.mediaActions}>
        {effectiveSelected && fixture.removeAllowed && onRemove ? (
          <QuietButton onPress={onRemove} testID={`${testID ?? 'prepared-media'}-remove`}>
            {t('childTask.removeMedia')}
          </QuietButton>
        ) : null}
        {!effectiveSelected && selectable && onSelect ? (
          <SecondaryButton onPress={onSelect} testID={`${testID ?? 'prepared-media'}-select`}>
            {fixture.kind === 'image' ? t('childTask.useImage') : t('childTask.useTranscript')}
          </SecondaryButton>
        ) : null}
      </View>
    </View>
  );
}

function FallbackRecord({ text }: { text: string }) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.fallbackRecord}>
      <View style={styles.fallbackScene}>
        <View style={styles.fallbackLineLong} />
        <View style={styles.fallbackLineShort} />
        <View style={styles.fallbackLineLong} />
      </View>
      <Text color="inkMuted" variant="caption">
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  rowRtl: { flexDirection: 'row-reverse' },
  rowLtr: { flexDirection: 'row' },
  media: {
    overflow: 'hidden',
    gap: spacing.md,
    borderRadius: radii.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  mediaSelected: {
    borderColor: colors.ghaf,
    backgroundColor: colors.leafMist,
  },
  selectedRule: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: spacing.xxs,
    backgroundColor: colors.ghaf,
  },
  mediaHeader: { alignItems: 'flex-start', gap: spacing.sm },
  mediaIcon: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.waterLight,
  },
  mediaTitleCopy: { minWidth: 0, flex: 1, gap: spacing.xxs },
  selectedBadge: {
    width: spacing.xxl,
    height: spacing.xxl,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.ghaf,
  },
  preparedImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radii.md,
    borderCurve: 'continuous',
    backgroundColor: colors.sandLight,
  },
  transcriptRecord: {
    gap: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.water,
    backgroundColor: colors.waterLight,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  fallbackRecord: {
    gap: spacing.sm,
    borderRadius: radii.md,
    borderCurve: 'continuous',
    backgroundColor: colors.sandLight,
    padding: spacing.md,
  },
  fallbackScene: {
    height: spacing.huge,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.ivory,
  },
  fallbackLineLong: {
    width: '58%',
    height: spacing.xxs,
    borderRadius: radii.pill,
    backgroundColor: colors.sand,
  },
  fallbackLineShort: {
    width: '34%',
    height: spacing.xxs,
    borderRadius: radii.pill,
    backgroundColor: colors.water,
  },
  visibilityRecord: {
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: spacing.sm,
  },
  visibilityMark: {
    width: spacing.sm,
    height: spacing.sm,
    flexShrink: 0,
    marginTop: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: colors.mangrove,
  },
  visibilityText: { minWidth: 0, flex: 1 },
  mediaActions: { gap: spacing.xs },
});
