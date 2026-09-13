import { StyleSheet, View } from 'react-native';

import { landscapeArtworkIds, LocalIllustration } from '@/components/illustrations';
import { Text } from '@/components/primitives';
import { botanical, logicalRowDirection, spacing } from '@/design/tokens';
import type { GardenStage, LandscapeId, TextDirection } from '@/models/familyGrowth';

interface ChildTodayLandscapeProps {
  body: string;
  compact?: boolean;
  direction: TextDirection;
  landscapeId: LandscapeId;
  stage: GardenStage;
  title: string;
}

export function ChildTodayLandscape({
  body,
  compact = false,
  direction,
  landscapeId,
  stage,
  title,
}: ChildTodayLandscapeProps) {
  return (
    <View
      style={[
        styles.hero,
        compact && [styles.compactHero, { flexDirection: logicalRowDirection(direction) }],
      ]}
      testID="child-today-landscape"
    >
      <LocalIllustration
        assetId={landscapeArtworkIds[landscapeId][stage]}
        decorative
        direction={direction}
        priority="high"
        style={compact ? styles.compactArtwork : styles.artwork}
      />
      <View style={[styles.copy, compact && styles.compactCopy]}>
        <Text
          brand
          direction={direction}
          style={styles.title}
          variant={compact ? 'heading' : 'screenTitle'}
        >
          {title}
        </Text>
        <Text brand direction={direction} style={styles.body}>
          {body}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: botanical.radius.hero,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.forest,
  },
  copy: {
    minWidth: 0,
    gap: spacing.xxs,
    padding: botanical.space.inset,
  },
  title: { color: botanical.colors.onForest },
  body: { color: botanical.colors.sageStrong },
  compactHero: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  compactCopy: {
    flex: 1,
    padding: 0,
  },
  compactArtwork: {
    width: 64,
    height: 64,
    flexShrink: 0,
    borderRadius: botanical.radius.small,
    backgroundColor: botanical.colors.water,
  },
  artwork: {
    width: '100%',
    aspectRatio: 2.4,
    backgroundColor: botanical.colors.water,
  },
});
