import { useState, type ReactNode } from 'react';
import { Image, type ImageContentFit } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { Text } from '@/components/primitives';
import { colors, motion, spacing } from '@/design/tokens';
import type { LocaleCode, TextDirection } from '@/models/familyGrowth';

import { artworkSources, type ArtworkId } from './illustrationSources';

export interface LocalIllustrationProps {
  readonly accessibilityLabel?: string;
  readonly assetId: ArtworkId;
  readonly contentFit?: ImageContentFit;
  readonly decorative?: boolean;
  readonly direction?: TextDirection;
  readonly fallback?: ReactNode;
  readonly fallbackLabel?: string;
  readonly language?: LocaleCode;
  readonly onSettled?: () => void;
  readonly priority?: 'low' | 'normal' | 'high';
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
  readonly transitionDuration?: number;
}

export function LocalIllustration({
  accessibilityLabel,
  assetId,
  contentFit = 'cover',
  decorative = false,
  direction = 'ltr',
  fallback,
  fallbackLabel,
  language = 'en',
  onSettled,
  priority = 'normal',
  style,
  testID,
  transitionDuration = motion.duration.quick,
}: LocalIllustrationProps) {
  const reduceMotion = useReducedMotion();
  const [failedAssetId, setFailedAssetId] = useState<ArtworkId | null>(null);
  const failed = failedAssetId === assetId;

  return (
    <View style={[styles.frame, style]} testID={testID}>
      {failed ? (
        <View
          accessibilityLabel={decorative ? undefined : (fallbackLabel ?? accessibilityLabel)}
          accessibilityRole={decorative ? undefined : 'image'}
          accessible={!decorative}
          aria-hidden={decorative || undefined}
          style={styles.fallback}
          testID={testID ? `${testID}-fallback` : undefined}
        >
          {fallback ??
            (fallbackLabel ? (
              <Text
                align="center"
                brand
                color="onSurfaceVariant"
                direction={direction}
                language={language}
                variant="caption"
              >
                {fallbackLabel}
              </Text>
            ) : null)}
        </View>
      ) : (
        <Image
          accessibilityLabel={decorative ? undefined : accessibilityLabel}
          accessibilityRole={decorative ? undefined : 'image'}
          accessible={!decorative}
          aria-hidden={decorative || undefined}
          cachePolicy="memory-disk"
          contentFit={contentFit}
          contentPosition="center"
          onError={() => {
            setFailedAssetId(assetId);
            onSettled?.();
          }}
          onLoad={onSettled}
          placeholderContentFit={contentFit}
          priority={priority}
          recyclingKey={assetId}
          source={artworkSources[assetId]}
          style={styles.image}
          transition={reduceMotion ? 0 : transitionDuration}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    position: 'relative',
    minWidth: 0,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerLow,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
  },
});
