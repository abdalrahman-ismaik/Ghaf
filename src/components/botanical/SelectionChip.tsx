import { StyleSheet } from 'react-native';

import { BotanicalPressable } from '@/components/botanical/BotanicalPressable';
import { Text } from '@/components/primitives';
import { botanical, colors, layout, spacing } from '@/design/tokens';
import type { TextDirection } from '@/models/familyGrowth';

// A radio chooses one value inside a group; a tab chooses which slice of the same list is
// shown. They look alike on purpose and keep their own role, because assistive technology
// announces and navigates them differently.
export type SelectionChipRole = 'radio' | 'tab';

export interface SelectionChipProps {
  accessibilityLabel?: string;
  direction: TextDirection;
  disabled?: boolean;
  // Equal-width segments for a fixed set; hugging chips for a list that can wrap.
  fill?: boolean;
  label: string;
  onPress: () => void;
  role: SelectionChipRole;
  selected: boolean;
  testID?: string;
}

export function SelectionChip({
  accessibilityLabel,
  direction,
  disabled = false,
  fill = false,
  label,
  onPress,
  role,
  selected,
  testID,
}: SelectionChipProps) {
  return (
    <BotanicalPressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole={role}
      accessibilityState={
        role === 'radio' ? { checked: selected, disabled } : { selected, disabled }
      }
      {...(role === 'radio' ? { 'aria-checked': selected } : { 'aria-selected': selected })}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.chip,
        fill ? styles.fill : styles.hug,
        selected ? styles.selected : null,
        disabled ? styles.disabled : null,
      ]}
      testID={testID}
    >
      <Text
        align="center"
        brand
        color={selected ? 'deepForest' : 'onSurfaceVariant'}
        direction={direction}
        style={styles.label}
        variant="label"
      >
        {label}
      </Text>
    </BotanicalPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.pill,
    borderCurve: 'continuous',
    // An unselected option still reads as a control, so the row does not look like
    // one button beside plain text.
    borderWidth: 1,
    borderColor: botanical.colors.line,
    backgroundColor: botanical.colors.paper,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  hug: {
    minWidth: layout.touchTarget,
    flexShrink: 1,
  },
  fill: {
    flex: 1,
    minWidth: 0,
    // Equal segments share a narrow row, so the label keeps the width the padding would take.
    paddingHorizontal: spacing.xs,
  },
  // Selected stays light on light. A dark fill under a light label cannot change state
  // gradually without dropping label contrast partway through.
  selected: {
    borderColor: botanical.colors.sageStrong,
    backgroundColor: botanical.colors.sage,
  },
  disabled: {
    opacity: 0.46,
    borderColor: colors.line,
  },
  label: {
    width: '100%',
    minWidth: 0,
    flexShrink: 1,
  },
});
