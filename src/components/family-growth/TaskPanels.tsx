import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { Input, SecondaryButton, Text } from '@/components/primitives';
import { colors, layout, radii, spacing } from '@/design/tokens';
import { localize } from '@/i18n';
import type {
  FixedSeedAward,
  LocalizedText,
  TaskSafetyBoundary,
  TaskTemplate,
} from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

type LocalizedValue = LocalizedText | string;

function resolveValue(value: LocalizedValue, locale: 'ar' | 'en'): string {
  return typeof value === 'string' ? value : localize(value, locale);
}

function CheckIcon({ color = colors.white }: { color?: string }) {
  return (
    <Svg aria-hidden height={spacing.lg} viewBox="0 0 20 20" width={spacing.lg}>
      <Path
        d="M4 10.5 8.1 14.5 16 6.5"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Svg>
  );
}

function TargetIcon() {
  return (
    <Svg aria-hidden height={spacing.xl} viewBox="0 0 24 24" width={spacing.xl}>
      <Circle cx="12" cy="12" fill="none" r="8" stroke={colors.mangrove} strokeWidth={2} />
      <Circle cx="12" cy="12" fill={colors.mangrove} r="2.5" />
    </Svg>
  );
}

function SafetyIcon({ alert = false }: { alert?: boolean }) {
  return (
    <Svg aria-hidden height={spacing.xl} viewBox="0 0 24 24" width={spacing.xl}>
      <Path
        d="M12 3 20 6v5.2c0 4.8-3.2 8-8 9.8-4.8-1.8-8-5-8-9.8V6l8-3Z"
        fill={alert ? colors.coralLight : colors.leafMist}
        stroke={alert ? colors.coral : colors.ghaf}
        strokeLinejoin="round"
        strokeWidth={2}
      />
      {alert ? (
        <>
          <Path d="M12 8v5" stroke={colors.coral} strokeLinecap="round" strokeWidth={2} />
          <Circle cx="12" cy="16" fill={colors.coral} r="1" />
        </>
      ) : (
        <Path
          d="m8.5 12 2.2 2.2 4.8-5"
          fill="none"
          stroke={colors.ghaf}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      )}
    </Svg>
  );
}

function SeedIcon() {
  return (
    <Svg aria-hidden height={spacing.xxl} viewBox="0 0 32 32" width={spacing.xxl}>
      <Path
        d="M16 25c-5-1.4-8-5.3-8-10.1C8 9.2 12 6.1 21.8 6c.2 9.3-1.4 17.1-5.8 19Z"
        fill={colors.goldLight}
        stroke={colors.gold}
        strokeLinejoin="round"
        strokeWidth={2}
      />
      <Path d="M12 20c2-3.8 4.7-6.3 8-8" fill="none" stroke={colors.earth} strokeWidth={2} />
    </Svg>
  );
}

const landscapeKeys: Record<TaskTemplate['landscapeId'], string> = {
  ghaf: 'garden.ghaf',
  samar: 'garden.samar',
  sidr: 'garden.sidr',
  date_palm: 'garden.datePalm',
  mangrove: 'garden.mangrove',
};

interface TaskChoiceProps {
  actionHint?: string;
  disabled?: boolean;
  onPress?: () => void;
  recognitionText: string;
  selected?: boolean;
  statusLabel?: string;
  template: TaskTemplate;
  testID?: string;
}

export function TaskChoice({
  actionHint,
  disabled = false,
  onPress,
  recognitionText,
  selected = false,
  statusLabel,
  template,
  testID,
}: TaskChoiceProps) {
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);
  const direction = usePrototypeStore((state) => state.direction);
  const locale = usePrototypeStore((state) => state.locale);
  const title = localize(template.title, locale);
  const meaning = localize(template.whyItMatters, locale);

  return (
    <Pressable
      accessibilityHint={actionHint}
      accessibilityLabel={[title, meaning, recognitionText, statusLabel].filter(Boolean).join('. ')}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.taskChoice,
        selected ? styles.taskChoiceSelected : null,
        focused ? styles.focusedRecord : null,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
      testID={testID}
    >
      {selected ? <View style={styles.selectedRule} /> : null}
      <View style={[styles.taskHeader, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <View style={styles.taskTitleBlock}>
          <Text color="forest" variant="heading">
            {title}
          </Text>
          <Text color="inkMuted">{meaning}</Text>
        </View>
        <View style={[styles.choiceMark, selected ? styles.choiceMarkSelected : null]}>
          {selected ? <CheckIcon /> : <View style={styles.choiceMarkIdle} />}
        </View>
      </View>

      {statusLabel ? (
        <View style={styles.statusRecord}>
          <Text color="earth" variant="caption">
            {statusLabel}
          </Text>
        </View>
      ) : null}

      <View style={[styles.metadataGrid, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <Metadata
          label={t('taskReview.effort')}
          value={localize(template.estimatedEffort, locale)}
        />
        <Metadata label={t('taskReview.help')} value={localize(template.permittedHelp, locale)} />
        <Metadata label={t('taskReview.recognition')} value={recognitionText} />
        <Metadata
          label={t('taskReview.landscape')}
          value={t(landscapeKeys[template.landscapeId])}
        />
      </View>
    </Pressable>
  );
}

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metadataItem}>
      <Text color="inkMuted" variant="caption">
        {label}
      </Text>
      <Text color="forest" variant="label">
        {value}
      </Text>
    </View>
  );
}

interface DefinitionOfDoneProps {
  evidenceHint?: LocalizedValue;
  numberOfLines?: number;
  testID?: string;
  title?: string;
  value: LocalizedValue;
}

export function DefinitionOfDone({
  evidenceHint,
  numberOfLines,
  testID,
  title,
  value,
}: DefinitionOfDoneProps) {
  const { t } = useTranslation();
  const direction = usePrototypeStore((state) => state.direction);
  const locale = usePrototypeStore((state) => state.locale);
  const resolvedTitle = title ?? t('taskReview.definition');

  return (
    <View
      accessibilityLabel={`${resolvedTitle}. ${resolveValue(value, locale)}`}
      style={styles.definition}
      testID={testID}
    >
      <View style={styles.definitionRule} />
      <View style={[styles.definitionHeading, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <View style={styles.definitionIcon}>
          <TargetIcon />
        </View>
        <Text color="forest" style={styles.flexText} variant="heading">
          {resolvedTitle}
        </Text>
      </View>
      <Text numberOfLines={numberOfLines}>{resolveValue(value, locale)}</Text>
      {evidenceHint ? (
        <View style={styles.evidenceRecord}>
          <Text color="earth" variant="caption">
            {t('taskReview.evidence')}
          </Text>
          <Text color="inkMuted" variant="caption">
            {resolveValue(evidenceHint, locale)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

interface TaskStepsProps {
  steps: readonly LocalizedValue[];
  testID?: string;
  title?: string;
}

export function TaskSteps({ steps, testID, title }: TaskStepsProps) {
  const { t } = useTranslation();
  const direction = usePrototypeStore((state) => state.direction);
  const locale = usePrototypeStore((state) => state.locale);
  const formatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE');

  return (
    <View style={styles.steps} testID={testID}>
      <Text color="forest" variant="heading">
        {title ?? t('childTask.steps')}
      </Text>
      <View style={styles.stepList}>
        {steps.slice(0, 4).map((step, index) => {
          const stepText = resolveValue(step, locale);
          const ordinal = formatter.format(index + 1);
          return (
            <View
              accessibilityLabel={`${ordinal}. ${stepText}`}
              accessible
              key={`${index}-${stepText}`}
              style={[styles.stepRow, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}
            >
              <View style={styles.stepNumber}>
                <Text align="center" color="forest" variant="label">
                  {ordinal}
                </Text>
              </View>
              <Text aria-hidden style={styles.stepCopy}>
                {stepText}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

interface SafetyBoundaryProps {
  bilingual?: boolean;
  safety: TaskSafetyBoundary;
  testID?: string;
  title?: string;
}

export function SafetyBoundary({ bilingual = false, safety, testID, title }: SafetyBoundaryProps) {
  const { t } = useTranslation();
  const direction = usePrototypeStore((state) => state.direction);
  const locale = usePrototypeStore((state) => state.locale);
  const standardLines = [
    safety.adultPreCheck,
    safety.adultSecondCheck,
    ...safety.adultOwnedActions,
    ...safety.childAllowedActions,
  ];
  const additionalLines = [
    safety.routeConstraint,
    safety.indoorAlternative,
    safety.aftercare,
  ].filter((value): value is LocalizedText => value !== null);

  return (
    <View style={styles.safetyBoundary} testID={testID}>
      <View style={styles.safetyRule} />
      <View style={[styles.safetyHeading, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <SafetyIcon />
        <Text color="forest" style={styles.flexText} variant="heading">
          {title ?? t('taskReview.safety')}
        </Text>
      </View>

      <View style={styles.boundaryList}>
        {standardLines.map((line, index) => (
          <BoundaryLine
            key={`safe-${index}-${line.en}`}
            secondaryValue={bilingual ? line.en : undefined}
            value={bilingual ? line.ar : localize(line, locale)}
          />
        ))}
        {additionalLines.map((line, index) => (
          <BoundaryLine
            key={`additional-${index}-${line.en}`}
            secondaryValue={bilingual ? line.en : undefined}
            value={bilingual ? line.ar : localize(line, locale)}
          />
        ))}
      </View>

      <View style={styles.hazardBlock}>
        {safety.excludedHazards.map((line, index) => (
          <BoundaryLine
            alert
            key={`hazard-${index}-${line.en}`}
            secondaryValue={bilingual ? line.en : undefined}
            value={bilingual ? line.ar : localize(line, locale)}
          />
        ))}
        <BoundaryLine
          alert
          prominent
          secondaryValue={bilingual ? safety.stopAndAskAdult.en : undefined}
          value={bilingual ? safety.stopAndAskAdult.ar : localize(safety.stopAndAskAdult, locale)}
        />
      </View>
    </View>
  );
}

function BoundaryLine({
  alert = false,
  prominent = false,
  secondaryValue,
  value,
}: {
  alert?: boolean;
  prominent?: boolean;
  secondaryValue?: string;
  value: string;
}) {
  const direction = usePrototypeStore((state) => state.direction);

  return (
    <View
      accessibilityLabel={secondaryValue ? undefined : value}
      accessible={!secondaryValue}
      style={[
        styles.boundaryLine,
        direction === 'rtl' ? styles.rowRtl : styles.rowLtr,
        prominent ? styles.prominentBoundary : null,
      ]}
    >
      <View style={styles.boundaryIcon}>
        {alert ? <SafetyIcon alert /> : <CheckIcon color={colors.ghaf} />}
      </View>
      <View style={styles.boundaryText}>
        <Text
          aria-hidden={!secondaryValue}
          color={alert ? 'forest' : 'ink'}
          direction={secondaryValue ? 'rtl' : 'auto'}
          language={secondaryValue ? 'ar' : undefined}
          style={prominent ? styles.prominentText : null}
          variant={prominent ? 'label' : 'body'}
        >
          {value}
        </Text>
        {secondaryValue ? (
          <Text color="inkMuted" direction="ltr" language="en" variant="caption">
            {secondaryValue}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

interface SeedAwardProps {
  amount: FixedSeedAward;
  destinationLabel: string;
  statusText: string;
  symbolicText: string;
  testID?: string;
}

export function SeedAward({
  amount,
  destinationLabel,
  statusText,
  symbolicText,
  testID,
}: SeedAwardProps) {
  const { t } = useTranslation();
  const direction = usePrototypeStore((state) => state.direction);

  return (
    <View
      accessibilityLabel={[
        t('common.seeds', { count: amount }),
        statusText,
        destinationLabel,
        symbolicText,
      ].join('. ')}
      style={[styles.seedAward, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}
      testID={testID}
    >
      <View style={styles.seedIcon}>
        <SeedIcon />
      </View>
      <View style={styles.seedCopy}>
        <Text color="gold" variant="heading">
          {t('common.seeds', { count: amount })}
        </Text>
        <Text color="forest" variant="label">
          {statusText}
        </Text>
        <Text color="inkMuted" variant="caption">
          {destinationLabel}
        </Text>
        <Text color="inkMuted" variant="caption">
          {symbolicText}
        </Text>
      </View>
    </View>
  );
}

interface RecognitionBaseProps {
  meaning?: string;
  modeLabel: string;
  phaseLabel: string;
  testID?: string;
  title?: string;
}

type RecognitionPanelProps = RecognitionBaseProps &
  ({ noSeedText?: never; seedAward: SeedAwardProps } | { noSeedText: string; seedAward?: never });

export function RecognitionPanel({
  meaning,
  modeLabel,
  noSeedText,
  phaseLabel,
  seedAward,
  testID,
  title,
}: RecognitionPanelProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.recognitionPanel} testID={testID}>
      <Text color="forest" variant="heading">
        {title ?? t('taskReview.recognition')}
      </Text>
      <View style={styles.recognitionMeta}>
        <Text color="forest" variant="label">
          {modeLabel}
        </Text>
        <Text color="inkMuted" variant="caption">
          {phaseLabel}
        </Text>
      </View>
      {seedAward ? <SeedAward {...seedAward} /> : null}
      {noSeedText ? (
        <View style={styles.noSeedRecord}>
          <Text color="forest" variant="label">
            {noSeedText}
          </Text>
        </View>
      ) : null}
      {meaning ? <Text color="inkMuted">{meaning}</Text> : null}
    </View>
  );
}

interface PraiseEditorProps {
  editable?: boolean;
  errorText?: string;
  helperText?: string;
  label?: string;
  maxLength?: number;
  onChangeText: (value: string) => void;
  placeholder?: string;
  testID?: string;
  value: string;
}

export function PraiseEditor({
  editable = true,
  errorText,
  helperText,
  label,
  maxLength = 280,
  onChangeText,
  placeholder,
  testID,
  value,
}: PraiseEditorProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.praiseEditor} testID={testID}>
      <Input
        editable={editable}
        errorText={errorText}
        helperText={helperText}
        label={label ?? t('checkIn.praiseLabel')}
        maxLength={maxLength}
        multiline
        onChangeText={onChangeText}
        placeholder={placeholder ?? t('checkIn.praisePlaceholder')}
        value={value}
      />
    </View>
  );
}

export interface RetryOption {
  detail?: string;
  id: string;
  label: string;
}

interface RetryPanelProps {
  body: string;
  onSelect: (id: string) => void;
  options: readonly RetryOption[];
  selectedId?: string | null;
  testID?: string;
  title: string;
}

export function RetryPanel({
  body,
  onSelect,
  options,
  selectedId = null,
  testID,
  title,
}: RetryPanelProps) {
  const direction = usePrototypeStore((state) => state.direction);

  return (
    <View
      style={[styles.retryPanel, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}
      testID={testID}
    >
      <View style={styles.retryPath}>
        <View style={styles.retryPathLine} />
        <View style={styles.retryPathTurn} />
      </View>
      <View style={styles.retryCopy}>
        <Text color="forest" variant="heading">
          {title}
        </Text>
        <Text color="inkMuted">{body}</Text>
        <View style={styles.retryActions}>
          {options.map((option) => (
            <SecondaryButton
              accessibilityState={{ selected: selectedId === option.id }}
              key={option.id}
              onPress={() => onSelect(option.id)}
              testID={`${testID ?? 'retry'}-${option.id}`}
            >
              <View style={styles.optionCopy}>
                <Text align="center" color="forest" variant="label">
                  {option.label}
                </Text>
                {option.detail ? (
                  <Text align="center" color="inkMuted" variant="caption">
                    {option.detail}
                  </Text>
                ) : null}
              </View>
            </SecondaryButton>
          ))}
        </View>
      </View>
    </View>
  );
}

export interface PhaseReviewOption {
  detail: string;
  id: 'keep_acquisition' | 'move_future_to_maintenance';
  label: string;
}

interface RoutinePhaseReviewProps {
  assuranceText: string;
  body: string;
  onSelect: (id: PhaseReviewOption['id']) => void;
  options: readonly [PhaseReviewOption, PhaseReviewOption];
  selectedId: PhaseReviewOption['id'] | null;
  testID?: string;
  title: string;
}

export function RoutinePhaseReview({
  assuranceText,
  body,
  onSelect,
  options,
  selectedId,
  testID,
  title,
}: RoutinePhaseReviewProps) {
  return (
    <View style={styles.phaseReview} testID={testID}>
      <Text color="forest" variant="heading">
        {title}
      </Text>
      <Text color="inkMuted">{body}</Text>
      <View accessibilityRole="radiogroup" style={styles.phaseOptions}>
        {options.map((option) => (
          <PhaseOption
            key={option.id}
            onPress={() => onSelect(option.id)}
            option={option}
            selected={selectedId === option.id}
            testID={`${testID ?? 'phase-review'}-${option.id}`}
          />
        ))}
      </View>
      <View style={styles.phaseAssurance}>
        <Text color="forest" variant="caption">
          {assuranceText}
        </Text>
      </View>
    </View>
  );
}

function PhaseOption({
  onPress,
  option,
  selected,
  testID,
}: {
  onPress: () => void;
  option: PhaseReviewOption;
  selected: boolean;
  testID: string;
}) {
  const [focused, setFocused] = useState(false);
  const direction = usePrototypeStore((state) => state.direction);

  return (
    <Pressable
      aria-checked={selected}
      accessibilityLabel={`${option.label}. ${option.detail}`}
      accessibilityRole="radio"
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.phaseOption,
        selected ? styles.phaseOptionSelected : null,
        focused ? styles.focusedRecord : null,
        pressed ? styles.pressed : null,
        direction === 'rtl' ? styles.rowRtl : styles.rowLtr,
      ]}
      testID={testID}
    >
      <View style={[styles.radioMark, selected ? styles.radioMarkSelected : null]}>
        {selected ? <CheckIcon /> : null}
      </View>
      <View style={styles.optionCopy}>
        <Text color="forest" variant="label">
          {option.label}
        </Text>
        <Text color="inkMuted" variant="caption">
          {option.detail}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rowRtl: { flexDirection: 'row-reverse' },
  rowLtr: { flexDirection: 'row' },
  flexText: { minWidth: 0, flex: 1 },
  focusedRecord: {
    borderColor: colors.gold,
    borderWidth: 2,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  disabled: { opacity: 0.46 },
  taskChoice: {
    minHeight: layout.touchTarget,
    overflow: 'hidden',
    gap: spacing.md,
    borderRadius: radii.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  taskChoiceSelected: {
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
  taskHeader: {
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  taskTitleBlock: {
    minWidth: 0,
    flex: 1,
    gap: spacing.xs,
  },
  choiceMark: {
    width: spacing.xxxl,
    height: spacing.xxxl,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.ivory,
  },
  choiceMarkSelected: {
    borderColor: colors.ghaf,
    backgroundColor: colors.ghaf,
  },
  choiceMarkIdle: {
    width: spacing.xs,
    height: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.inkMuted,
  },
  statusRecord: {
    alignSelf: 'flex-start',
    borderRadius: radii.sm,
    borderCurve: 'continuous',
    backgroundColor: colors.goldGlow,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  metadataItem: {
    minWidth: spacing.huge * 2,
    flexGrow: 1,
    flexBasis: '45%',
    gap: spacing.xxs,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: spacing.sm,
    paddingEnd: spacing.sm,
  },
  definition: {
    overflow: 'hidden',
    gap: spacing.md,
    borderRadius: radii.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.water,
    backgroundColor: colors.waterLight,
    padding: spacing.lg,
  },
  definitionRule: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: spacing.xxs,
    backgroundColor: colors.mangrove,
  },
  definitionHeading: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  definitionIcon: {
    width: spacing.xxxl,
    height: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  evidenceRecord: {
    gap: spacing.xxs,
    borderTopWidth: 1,
    borderTopColor: colors.water,
    paddingTop: spacing.sm,
  },
  steps: { gap: spacing.md },
  stepList: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  stepRow: {
    minHeight: layout.touchTarget + spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: spacing.sm,
  },
  stepNumber: {
    minWidth: spacing.xxxl,
    minHeight: spacing.xxxl,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.leaf,
    backgroundColor: colors.leafMist,
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xxs,
  },
  stepCopy: { minWidth: 0, flex: 1 },
  safetyBoundary: {
    overflow: 'hidden',
    gap: spacing.md,
    borderRadius: radii.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.coral,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  safetyRule: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: spacing.xxs,
    backgroundColor: colors.coral,
  },
  safetyHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  boundaryList: { gap: spacing.sm },
  hazardBlock: {
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.coral,
    paddingTop: spacing.md,
  },
  boundaryLine: {
    minHeight: layout.touchTarget,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  boundaryIcon: {
    width: spacing.xxl,
    minHeight: spacing.xxl,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boundaryText: { minWidth: 0, flex: 1 },
  prominentBoundary: {
    borderRadius: radii.md,
    borderCurve: 'continuous',
    backgroundColor: colors.coralLight,
    padding: spacing.sm,
  },
  prominentText: { paddingTop: spacing.xxs },
  seedAward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gold,
    paddingVertical: spacing.md,
  },
  seedIcon: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.goldGlow,
  },
  seedCopy: { minWidth: 0, flex: 1, gap: spacing.xxs },
  recognitionPanel: {
    gap: spacing.md,
    borderRadius: radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.leafMist,
    padding: spacing.lg,
  },
  recognitionMeta: {
    gap: spacing.xxs,
    borderBottomWidth: 1,
    borderBottomColor: colors.leafLight,
    paddingBottom: spacing.sm,
  },
  noSeedRecord: {
    borderRadius: radii.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.leaf,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  praiseEditor: { gap: spacing.xs },
  retryPanel: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.md,
    borderRadius: radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.waterLight,
    padding: spacing.lg,
  },
  retryPath: {
    width: spacing.xl,
    flexShrink: 0,
    alignItems: 'center',
  },
  retryPathLine: {
    width: 2,
    flex: 1,
    minHeight: spacing.xxl,
    backgroundColor: colors.mangrove,
  },
  retryPathTurn: {
    width: spacing.md,
    height: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.mangrove,
    backgroundColor: colors.surface,
  },
  retryCopy: { minWidth: 0, flex: 1, gap: spacing.sm },
  retryActions: { gap: spacing.xs, paddingTop: spacing.xs },
  optionCopy: { minWidth: 0, flex: 1, gap: spacing.xxs },
  phaseReview: {
    gap: spacing.md,
    borderRadius: radii.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.goldGlow,
    padding: spacing.lg,
  },
  phaseOptions: { gap: spacing.xs },
  phaseOption: {
    minHeight: layout.touchTarget,
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  phaseOptionSelected: {
    borderColor: colors.ghaf,
    backgroundColor: colors.leafMist,
  },
  radioMark: {
    width: spacing.xxl,
    height: spacing.xxl,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.ivory,
  },
  radioMarkSelected: {
    borderColor: colors.ghaf,
    backgroundColor: colors.ghaf,
  },
  phaseAssurance: {
    borderTopWidth: 1,
    borderTopColor: colors.sand,
    paddingTop: spacing.sm,
  },
});
