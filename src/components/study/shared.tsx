import type { ComponentProps } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Button, Input, Text } from '@/components/primitives';
import { botanical, spacing } from '@/design/tokens';

export function StudyText(props: ComponentProps<typeof Text>) {
  return <Text brand color="deepForest" {...props} />;
}
export function StudyButton(props: ComponentProps<typeof Button>) {
  return <Button brand size="regular" {...props} />;
}
export function StudyInput(props: ComponentProps<typeof Input>) {
  return <Input brand {...props} />;
}
export const studyStyles = StyleSheet.create({
  stack: { gap: spacing.md },
  section: { gap: spacing.md, paddingVertical: spacing.md },
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: botanical.colors.paper,
    borderRadius: botanical.radius.surface,
  },
  hero: {
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: botanical.colors.sage,
    borderRadius: botanical.radius.surface,
  },
  row: { flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' },
  tabs: { flex: 1, minWidth: Platform.OS === 'web' ? 110 : 180 },
  notice: {
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: botanical.colors.sage,
    borderRadius: botanical.radius.small,
  },
  divider: {
    borderTopWidth: 1,
    borderColor: botanical.colors.line,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
});

export function newStudyId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function parseStudyNumber(value: string): number {
  const normalized = normalizeStudyDigits(value).replace(/٫/g, '.');
  return normalized === '' ? Number.NaN : Number(normalized);
}

export function normalizeStudyDigits(value: string): string {
  return value
    .trim()
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776));
}
