import { StyleSheet, View } from 'react-native';

import { Button, Text } from '@/components/primitives';
import { colors, r001Radii, spacing } from '@/design/tokens';

interface AdjustmentOption {
  awardLabel: string;
  body: string;
  label: string;
  safetyLabel?: string;
  title: string;
}

interface ParentAdjustmentReviewProps {
  body: string;
  childDecisionLabel: string;
  current: AdjustmentOption;
  error: string | null;
  safeEquivalent: AdjustmentOption;
  safeEquivalentAction: string;
  smaller: AdjustmentOption | null;
  smallerAction: string;
  safeEquivalentTestID?: string;
  smallerTestID?: string;
  testID?: string;
  title: string;
  onResolveSafeEquivalent: () => void;
  onResolveSmaller: () => void;
}

export function ParentAdjustmentReview({
  body,
  childDecisionLabel,
  current,
  error,
  safeEquivalent,
  safeEquivalentAction,
  smaller,
  smallerAction,
  safeEquivalentTestID = 'resolve-safe-equivalent-button',
  smallerTestID = 'resolve-smaller-task-button',
  testID = 'pre-acceptance-parent-review',
  title,
  onResolveSafeEquivalent,
  onResolveSmaller,
}: ParentAdjustmentReviewProps) {
  return (
    <View style={styles.card} testID={testID}>
      <View style={styles.heading}>
        <Text brand color="deepForest" variant="screenTitle">
          {title}
        </Text>
        <Text brand color="onSurfaceVariant">
          {body}
        </Text>
      </View>
      <Option option={current} />
      {smaller ? (
        <View style={styles.optionWithAction}>
          <Option option={smaller} />
          <Button brand onPress={onResolveSmaller} testID={smallerTestID} variant="secondary">
            {smallerAction}
          </Button>
        </View>
      ) : null}
      <View style={styles.optionWithAction}>
        <Option option={safeEquivalent} />
        <Button
          brand
          onPress={onResolveSafeEquivalent}
          testID={safeEquivalentTestID}
          variant="quiet"
        >
          {safeEquivalentAction}
        </Button>
      </View>
      <Text brand color="onSurfaceVariant" variant="caption">
        {childDecisionLabel}
      </Text>
      {error ? (
        <Text accessibilityLiveRegion="polite" brand color="error" variant="caption">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

function Option({ option }: { option: AdjustmentOption }) {
  return (
    <View style={styles.option}>
      <Text brand color="onSurfaceVariant" variant="caption">
        {option.label}
      </Text>
      <Text brand color="deepForest" variant="label">
        {option.title}
      </Text>
      <Text brand color="onSurfaceVariant">
        {option.body}
      </Text>
      {option.safetyLabel ? (
        <Text brand color="deepForest" variant="caption">
          {option.safetyLabel}
        </Text>
      ) : null}
      <Text brand color="primary" tabular variant="caption">
        {option.awardLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.secondary,
    backgroundColor: colors.secondaryTint,
    padding: spacing.lg,
  },
  heading: {
    gap: spacing.xs,
  },
  optionWithAction: {
    gap: spacing.sm,
  },
  option: {
    gap: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
    paddingBottom: spacing.md,
  },
});
