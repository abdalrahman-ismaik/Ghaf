import { StyleSheet, View } from 'react-native';

import { GhafIcon } from '@/components/access';
import { Text } from '@/components/primitives';
import { botanical, colors, layout, logicalRowDirection, spacing } from '@/design/tokens';
import type { TextDirection } from '@/models/familyGrowth';

export interface ChildTaskFollowUpContextProps {
  body: string;
  completionModeLabel: string;
  completionModeValue: string;
  direction: TextDirection;
  factsLabel: string;
  factValues: readonly string[];
  freshStepsBody: string;
  freshStepsTitle: string;
  helpLabel: string;
  helpValue: string;
  noLossLabel: string;
  parentNote: string;
  parentNoteLabel: string;
  priorAttemptLabel: string;
  statusLabel: string;
  title: string;
}

export function ChildTaskFollowUpContext({
  body,
  completionModeLabel,
  completionModeValue,
  direction,
  factsLabel,
  factValues,
  freshStepsBody,
  freshStepsTitle,
  helpLabel,
  helpValue,
  noLossLabel,
  parentNote,
  parentNoteLabel,
  priorAttemptLabel,
  statusLabel,
  title,
}: ChildTaskFollowUpContextProps) {
  return (
    <View
      accessibilityLiveRegion="polite"
      importantForAccessibility="yes"
      style={styles.root}
      testID="child-task-follow-up-context"
    >
      <View style={styles.supportSummary}>
        <View style={[styles.statusRow, { flexDirection: logicalRowDirection(direction) }]}>
          <View style={styles.supportIcon}>
            <GhafIcon color={botanical.colors.forest} name="help" size={26} />
          </View>
          <View style={styles.statusPill}>
            <Text brand color="primary" direction={direction} variant="label">
              {statusLabel}
            </Text>
          </View>
        </View>
        <Text brand color="deepForest" direction={direction} variant="screenTitle">
          {title}
        </Text>
        <Text brand color="onSurfaceVariant" direction={direction} variant="bodyLarge">
          {body}
        </Text>
      </View>

      <View style={styles.parentNoteCard}>
        <SectionHeading direction={direction} icon="person" label={parentNoteLabel} />
        <View style={styles.rule} />
        <Text brand color="deepForest" direction={direction} variant="bodyLarge">
          {parentNote}
        </Text>
      </View>

      <View style={styles.evidenceCard}>
        <SectionHeading direction={direction} icon="check" label={priorAttemptLabel} />
        <View style={styles.evidenceBody}>
          <EvidenceField
            direction={direction}
            label={completionModeLabel}
            value={completionModeValue}
          />
          <View style={styles.rule} />
          <EvidenceField direction={direction} label={helpLabel} value={helpValue} />
          {factValues.length > 0 ? (
            <>
              <View style={styles.rule} />
              <View style={styles.factSection}>
                <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
                  {factsLabel}
                </Text>
                <View style={styles.factList}>
                  {factValues.map((fact, index) => (
                    <View
                      key={`${index}-${fact}`}
                      style={[styles.factRow, { flexDirection: logicalRowDirection(direction) }]}
                    >
                      <GhafIcon color={botanical.colors.forest} name="check" size={20} />
                      <Text
                        brand
                        color="deepForest"
                        direction={direction}
                        style={styles.grow}
                        variant="body"
                      >
                        {fact}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          ) : null}
        </View>
      </View>

      <View style={styles.freshStepsCard}>
        <View style={[styles.freshStepsMain, { flexDirection: logicalRowDirection(direction) }]}>
          <View style={styles.freshStepsIcon}>
            <GhafIcon color={botanical.colors.forest} name="check" size={26} />
          </View>
          <View style={styles.freshStepsCopy}>
            <Text brand color="deepForest" direction={direction} variant="bodyLarge">
              {freshStepsTitle}
            </Text>
            <Text brand color="onSurfaceVariant" direction={direction} variant="body">
              {freshStepsBody}
            </Text>
          </View>
        </View>
        <View style={[styles.noLoss, { flexDirection: logicalRowDirection(direction) }]}>
          <GhafIcon color={colors.tertiary} name="info" size={20} />
          <Text brand color="tertiary" direction={direction} style={styles.grow} variant="caption">
            {noLossLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

function SectionHeading({
  direction,
  icon,
  label,
}: {
  direction: TextDirection;
  icon: 'check' | 'person';
  label: string;
}) {
  return (
    <View style={[styles.sectionHeading, { flexDirection: logicalRowDirection(direction) }]}>
      <View style={styles.sectionIcon}>
        <GhafIcon color={botanical.colors.forest} name={icon} size={22} />
      </View>
      <Text brand color="deepForest" direction={direction} style={styles.grow} variant="label">
        {label}
      </Text>
    </View>
  );
}

function EvidenceField({
  direction,
  label,
  value,
}: {
  direction: TextDirection;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.evidenceField}>
      <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
        {label}
      </Text>
      <Text brand color="deepForest" direction={direction} variant="body">
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    minWidth: 0,
    gap: spacing.lg,
  },
  supportSummary: {
    minWidth: 0,
    gap: spacing.sm,
    borderRadius: botanical.radius.surface,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: botanical.colors.sageStrong,
    backgroundColor: botanical.colors.water,
    padding: spacing.lg,
  },
  statusRow: {
    minWidth: 0,
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  supportIcon: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.pill,
    backgroundColor: botanical.colors.paper,
  },
  statusPill: {
    minWidth: 0,
    flexShrink: 1,
    justifyContent: 'center',
    borderRadius: botanical.radius.pill,
    backgroundColor: botanical.colors.water,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  parentNoteCard: {
    minWidth: 0,
    gap: spacing.md,
    borderRadius: botanical.radius.surface,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.paper,
    padding: spacing.lg,
  },
  sectionHeading: {
    minWidth: 0,
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionIcon: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.pill,
    backgroundColor: botanical.colors.sage,
    padding: spacing.xs,
  },
  evidenceCard: {
    minWidth: 0,
    gap: spacing.md,
    borderRadius: botanical.radius.surface,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: botanical.colors.line,
    backgroundColor: botanical.colors.paper,
    padding: spacing.lg,
  },
  evidenceBody: {
    minWidth: 0,
    gap: spacing.md,
    borderRadius: botanical.radius.control,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.canvas,
    padding: spacing.md,
  },
  evidenceField: {
    minWidth: 0,
    gap: spacing.xxs,
  },
  factSection: {
    minWidth: 0,
    gap: spacing.sm,
  },
  factList: {
    minWidth: 0,
    gap: spacing.xs,
  },
  factRow: {
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  freshStepsCard: {
    minWidth: 0,
    gap: spacing.md,
    borderRadius: botanical.radius.surface,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: botanical.colors.sageStrong,
    backgroundColor: botanical.colors.sage,
    padding: spacing.lg,
  },
  freshStepsMain: {
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  freshStepsIcon: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: botanical.radius.pill,
    backgroundColor: botanical.colors.paper,
  },
  noLoss: {
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.xs,
    borderRadius: botanical.radius.small,
    borderCurve: 'continuous',
    backgroundColor: botanical.colors.amberWash,
    padding: spacing.sm,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: botanical.colors.line,
  },
  grow: {
    flex: 1,
    minWidth: 0,
  },
  freshStepsCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
});
