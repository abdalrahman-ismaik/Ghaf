import { StyleSheet, View } from 'react-native';

import { GhafIcon } from '@/components/access';
import { Text } from '@/components/primitives';
import {
  botanical,
  colors,
  layout,
  logicalRowDirection,
  spacing,
  type LayoutDirection,
} from '@/design/tokens';

export interface TaskStepIndicatorProps {
  current: 1 | 2 | 3;
  direction: LayoutDirection;
  labels: readonly [string, string, string];
}

const steps = [1, 2, 3] as const;

export function TaskStepIndicator({ current, direction, labels }: TaskStepIndicatorProps) {
  const formatter = new Intl.NumberFormat(direction === 'rtl' ? 'ar-AE' : 'en-AE');

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: 3, now: current, text: labels[current - 1] }}
      style={[styles.root, { flexDirection: logicalRowDirection(direction) }]}
      testID="task-step-indicator"
    >
      <View aria-hidden style={styles.connectorRail}>
        <View
          style={[
            styles.connectorComplete,
            {
              [direction === 'rtl' ? 'right' : 'left']: 0,
              width: `${((current - 1) / 2) * 100}%`,
            },
          ]}
        />
      </View>
      {steps.map((step) => {
        const complete = step < current;
        const active = step === current;

        return (
          <View key={step} style={styles.step}>
            <View
              style={[
                styles.marker,
                complete || active ? styles.markerActive : styles.markerPending,
              ]}
            >
              {complete ? (
                <GhafIcon color={colors.ghafEmerald} name="check-filled" size={24} />
              ) : (
                <Text
                  align="center"
                  brand
                  color={active ? 'white' : 'onSurfaceVariant'}
                  direction={direction}
                  tabular
                  variant="label"
                >
                  {formatter.format(step)}
                </Text>
              )}
            </View>
            <Text
              align="center"
              brand
              color={active || complete ? 'ghafEmerald' : 'onSurfaceVariant'}
              direction={direction}
              style={styles.label}
              variant="caption"
            >
              {labels[step - 1]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    width: '100%',
    maxWidth: layout.compactContentWidth,
    alignSelf: 'center',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  step: {
    zIndex: 1,
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.xs,
  },
  marker: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.pill,
    borderCurve: 'continuous',
    borderWidth: 1.5,
  },
  markerActive: {
    borderColor: colors.ghafEmerald,
    backgroundColor: colors.ghafEmerald,
  },
  markerPending: {
    borderColor: colors.outlineVariant,
    backgroundColor: botanical.colors.paper,
  },
  label: {
    minHeight: layout.touchTarget,
  },
  connectorRail: {
    position: 'absolute',
    top: layout.touchTarget / 2 - 1,
    right: '16.666%',
    left: '16.666%',
    height: 2,
    overflow: 'hidden',
    backgroundColor: colors.outlineVariant,
  },
  connectorComplete: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.ghafEmerald,
  },
});
