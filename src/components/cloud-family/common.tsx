import type { ComponentProps, PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AccessTextField } from '@/components/access';
import { Button, Text } from '@/components/primitives';
import { botanical, logicalRowDirection, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export function useCloudCopy() {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  return {
    locale,
    direction,
    text: (key: string, values?: Record<string, unknown>) => t(`cloudFamily.${key}`, values),
  };
}

export function CloudSection({
  title,
  children,
  testID,
}: PropsWithChildren<{ title?: string; testID?: string }>) {
  return (
    <View style={styles.section} testID={testID}>
      {title ? (
        <Text brand variant="heading" accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

export function CloudActions({ children }: PropsWithChildren) {
  const { direction } = useCloudCopy();
  return (
    <View style={[styles.actions, { flexDirection: logicalRowDirection(direction) }]}>
      {children}
    </View>
  );
}

export function CloudAction(props: ComponentProps<typeof Button>) {
  const { locale, direction } = useCloudCopy();
  return <Button brand fullWidth={false} language={locale} direction={direction} {...props} />;
}

export function CloudField({
  inputLanguage,
  ...props
}: Omit<ComponentProps<typeof AccessTextField>, 'direction' | 'language'> & {
  readonly inputLanguage?: 'ar' | 'en';
}) {
  const { locale, direction } = useCloudCopy();
  return (
    <AccessTextField
      language={inputLanguage ?? locale}
      direction={inputLanguage ? (inputLanguage === 'ar' ? 'rtl' : 'ltr') : direction}
      autoComplete="off"
      {...props}
    />
  );
}

export const cloudStyles = StyleSheet.create({
  content: { gap: spacing.lg, paddingBottom: spacing.xl },
  row: { gap: spacing.sm },
  card: {
    backgroundColor: botanical.colors.paper,
    borderColor: botanical.colors.line,
    borderWidth: 1,
    borderRadius: botanical.radius.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  note: { color: botanical.colors.muted },
  status: {
    backgroundColor: botanical.colors.sage,
    padding: spacing.md,
    borderRadius: botanical.radius.small,
    gap: spacing.sm,
  },
  error: {
    backgroundColor: botanical.colors.amberWash,
    padding: spacing.md,
    borderRadius: botanical.radius.small,
    gap: spacing.sm,
  },
  divider: {
    borderTopWidth: 1,
    borderColor: botanical.colors.line,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
});

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  actions: { flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
});
