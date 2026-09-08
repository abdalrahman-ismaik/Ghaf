import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { GhafIcon } from '@/components/access/GhafIcon';
import { Text } from '@/components/primitives';
import {
  colors,
  logicalRowDirection,
  r001Radii,
  spacing,
  type LayoutDirection,
  type TypographyLanguage,
} from '@/design/tokens';

export type AssistantIdentityOrigin = 'prepared' | 'live' | 'synthetic' | 'simulated';

export interface AssistantIdentityProps {
  readonly brand?: boolean;
  readonly description?: string;
  readonly direction: LayoutDirection;
  readonly language?: TypographyLanguage;
  readonly origin: AssistantIdentityOrigin;
  readonly originLabel: string;
  readonly originTestID?: string;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
  readonly title: string;
}

// Keep capability, origin, and purpose together so families see the boundary before acting.
export function AssistantIdentity({
  brand = true,
  description,
  direction,
  language,
  origin,
  originLabel,
  originTestID,
  style,
  testID,
  title,
}: AssistantIdentityProps) {
  return (
    <View
      style={[styles.root, { flexDirection: logicalRowDirection(direction) }, style]}
      testID={testID}
    >
      <View aria-hidden style={styles.icon}>
        <GhafIcon color={colors.ghafEmerald} direction={direction} name="sparkle" size={23} />
      </View>
      <View style={styles.copy}>
        <Text
          brand={brand}
          color={brand ? 'deepForest' : 'forest'}
          direction={direction}
          language={language}
          variant="heading"
        >
          {title}
        </Text>
        <View
          accessibilityLabel={originLabel}
          accessible
          style={[styles.origin, { flexDirection: logicalRowDirection(direction) }]}
          testID={originTestID ?? `assistant-origin-${origin}`}
        >
          <View aria-hidden style={[styles.originDot, originDotStyles[origin]]} />
          <Text
            brand={brand}
            color={brand ? 'onSurfaceVariant' : 'earth'}
            direction={direction}
            language={language}
            variant="caption"
          >
            {originLabel}
          </Text>
        </View>
        {description ? (
          <Text
            brand={brand}
            color={brand ? 'onSurfaceVariant' : 'inkMuted'}
            direction={direction}
            language={language}
            variant="caption"
          >
            {description}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const originDotStyles = StyleSheet.create({
  prepared: { backgroundColor: colors.solarAmber },
  live: { backgroundColor: colors.success },
  synthetic: { backgroundColor: colors.mangroveTeal },
  simulated: { backgroundColor: colors.secondary },
});

const styles = StyleSheet.create({
  root: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  icon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  origin: {
    minHeight: 24,
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
  },
  originDot: {
    width: spacing.xs,
    height: spacing.xs,
    flexShrink: 0,
    borderRadius: r001Radii.pill,
  },
});
