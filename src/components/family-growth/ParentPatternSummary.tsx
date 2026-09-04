import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, Input, Text } from '@/components/primitives';
import { colors, r001Radii, r001Shadows, spacing } from '@/design/tokens';
import { localize } from '@/i18n';
import type { ParentPatternSummary as ParentPatternSummaryModel } from '@/models/familyGrowth';
import { serviceRegistry } from '@/services';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export interface ParentPatternSummaryProps {
  readonly appearance?: 'legacy' | 'r002a';
  readonly summary: ParentPatternSummaryModel;
  readonly testID?: string;
}

export function ParentPatternSummary({
  appearance = 'legacy',
  summary,
  testID,
}: ParentPatternSummaryProps) {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const [current, setCurrent] = useState(summary);
  const [isEditing, setIsEditing] = useState(false);
  const [draftAr, setDraftAr] = useState(summary.observableFacts[0].ar);
  const [draftEn, setDraftEn] = useState(summary.observableFacts[0].en);
  const [correctionStatus, setCorrectionStatus] = useState<'idle' | 'applied' | 'rejected'>('idle');
  const branded = appearance === 'r002a';

  const beginCorrection = () => {
    const fact = current.observableFacts[0];
    setDraftAr(fact.ar);
    setDraftEn(fact.en);
    setCorrectionStatus('idle');
    setIsEditing(true);
  };

  const cancelCorrection = () => {
    const fact = current.observableFacts[0];
    setDraftAr(fact.ar);
    setDraftEn(fact.en);
    setCorrectionStatus('idle');
    setIsEditing(false);
  };

  const correctSyntheticFact = () => {
    const result = serviceRegistry.parentSummary.applyLocalCorrection(current, {
      operation: 'replace_fact',
      factIndex: 0,
      correctedFact: { ar: draftAr, en: draftEn },
    });
    if (!result.ok || result.data.disposition !== 'applied') {
      if (result.ok) setCurrent(result.data.summary);
      setCorrectionStatus('rejected');
      return;
    }
    setCurrent(result.data.summary);
    setDraftAr(result.data.summary.observableFacts[0].ar);
    setDraftEn(result.data.summary.observableFacts[0].en);
    setCorrectionStatus('applied');
    setIsEditing(false);
  };

  return (
    <View style={[styles.summary, branded ? styles.summaryR002a : null]} testID={testID}>
      <View style={[styles.heading, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <View style={styles.guideMark} />
        <View style={styles.grow}>
          <Text brand={branded} color={branded ? 'deepForest' : 'forest'} variant="heading">
            {t('parentHome.summaryTitle')}
          </Text>
          <Text brand={branded} color={branded ? 'onSurfaceVariant' : 'earth'} variant="caption">
            {localize(current.timeWindow, locale)} · {t('origin.prepared')}
          </Text>
        </View>
      </View>

      <SummaryField
        branded={branded}
        label={t('parentHome.strengths')}
        value={localize(current.strengthsFirst, locale)}
      />
      <View style={styles.field}>
        <Text brand={branded} color={branded ? 'onSurfaceVariant' : 'earth'} variant="caption">
          {t('parentHome.facts')}
        </Text>
        {current.observableFacts.map((fact) => (
          <Text brand={branded} key={fact.en}>
            {localize(fact, locale)}
          </Text>
        ))}
      </View>
      <Button brand={branded} aria-expanded={isEditing} onPress={beginCorrection} variant="ghost">
        {t('parentHome.correctSummary')}
      </Button>
      {isEditing ? (
        <View style={styles.editor}>
          <Text brand={branded} color={branded ? 'deepForest' : 'forest'} variant="label">
            {t('parentHome.correctSummary')}
          </Text>
          <Input
            brand={branded}
            direction="rtl"
            label={t('language.arabic')}
            language="ar"
            maxLength={180}
            multiline
            onChangeText={(value) => {
              setDraftAr(value);
              setCorrectionStatus('idle');
            }}
            testID="parent-summary-fact-ar"
            value={draftAr}
          />
          <Input
            brand={branded}
            direction="ltr"
            label={t('language.english')}
            language="en"
            maxLength={180}
            multiline
            onChangeText={(value) => {
              setDraftEn(value);
              setCorrectionStatus('idle');
            }}
            testID="parent-summary-fact-en"
            value={draftEn}
          />
          <View style={styles.editorActions}>
            <Button
              brand={branded}
              onPress={correctSyntheticFact}
              testID="parent-summary-apply-correction"
              variant="secondary"
            >
              {t('parentHome.correctSummary')}
            </Button>
            <Button brand={branded} onPress={cancelCorrection} variant="ghost">
              {t('common.cancel')}
            </Button>
          </View>
        </View>
      ) : null}
      <SummaryField
        branded={branded}
        label={t('parentHome.uncertainty')}
        value={localize(current.uncertainty, locale)}
      />
      <SummaryField
        branded={branded}
        label={t('parentHome.question')}
        value={localize(current.questionForChild, locale)}
      />
      <SummaryField
        branded={branded}
        label={t('parentHome.adjustment')}
        value={localize(current.possibleAdjustment, locale)}
      />

      <View style={styles.disclosure}>
        <Text brand={branded} color={branded ? 'onSurfaceVariant' : 'inkMuted'} variant="caption">
          {t('parentHome.summaryDisclosure')}
        </Text>
        <Text brand={branded} color={branded ? 'onSurfaceVariant' : 'inkMuted'} variant="caption">
          {localize(current.meta.disclosure.text, locale)}
        </Text>
      </View>
      {correctionStatus === 'applied' ? (
        <Text
          accessibilityLiveRegion="polite"
          brand={branded}
          color={branded ? 'primary' : 'success'}
          testID="parent-summary-correction-status"
          variant="caption"
        >
          {t('parentHome.correctionApplied')}
        </Text>
      ) : correctionStatus === 'rejected' ? (
        <Text
          accessibilityLiveRegion="polite"
          brand={branded}
          color={branded ? 'error' : 'danger'}
          testID="parent-summary-correction-status"
          variant="caption"
        >
          {t('errors.safeRetry')}
        </Text>
      ) : null}
    </View>
  );
}

function SummaryField({
  branded,
  label,
  value,
}: {
  readonly branded: boolean;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <View style={styles.field}>
      <Text brand={branded} color={branded ? 'onSurfaceVariant' : 'earth'} variant="caption">
        {label}
      </Text>
      <Text brand={branded}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    gap: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.water,
    backgroundColor: colors.waterLight,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  summaryR002a: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    backgroundColor: colors.primaryFixedTint,
    padding: spacing.lg,
    ...r001Shadows.soft,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  rowLtr: { flexDirection: 'row' },
  heading: { alignItems: 'center', gap: spacing.sm },
  grow: { flex: 1, minWidth: 0, gap: spacing.xxs },
  guideMark: {
    width: 18,
    height: 28,
    borderTopLeftRadius: 999,
    borderBottomRightRadius: 999,
    backgroundColor: colors.mangrove,
    transform: [{ rotate: '22deg' }],
  },
  field: {
    gap: spacing.xxs,
    borderBottomWidth: 1,
    borderBottomColor: colors.water,
    paddingBottom: spacing.sm,
  },
  disclosure: { gap: spacing.xxs },
  editor: {
    gap: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.water,
    paddingVertical: spacing.md,
  },
  editorActions: { gap: spacing.xs },
});
