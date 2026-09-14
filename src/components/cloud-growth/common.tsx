import { useEffect, useState, type ComponentProps, type PropsWithChildren } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AccessTextField } from '@/components/access';
import { Button, Text } from '@/components/primitives';
import { botanical, logicalRowDirection, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export function useGrowthCopy() {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  return {
    locale,
    direction,
    t,
    text: (key: string, values?: Record<string, unknown>) => t(`cloudGrowth.${key}`, values),
    number: (value: number) =>
      new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE').format(value),
  };
}
export function useGrowthPassword() {
  const [password, setPassword] = useState('');
  useEffect(() => {
    const listener = AppState.addEventListener('change', (value) => {
      if (value !== 'active') setPassword('');
    });
    return () => listener.remove();
  }, []);
  return [password, setPassword] as const;
}
export function GrowthText(props: ComponentProps<typeof Text>) {
  const { locale, direction } = useGrowthCopy();
  return <Text brand language={locale} direction={direction} {...props} />;
}
export function GrowthButton(props: ComponentProps<typeof Button>) {
  const { locale, direction } = useGrowthCopy();
  return <Button brand fullWidth={false} language={locale} direction={direction} {...props} />;
}
export function GrowthField(
  props: Omit<ComponentProps<typeof AccessTextField>, 'language' | 'direction'>,
) {
  const { locale, direction } = useGrowthCopy();
  return <AccessTextField language={locale} direction={direction} autoComplete="off" {...props} />;
}
export function GrowthRow({ children }: PropsWithChildren) {
  const { direction } = useGrowthCopy();
  return (
    <View style={[growthStyles.row, { flexDirection: logicalRowDirection(direction) }]}>
      {children}
    </View>
  );
}
export const growthStyles = StyleSheet.create({
  stack: { gap: spacing.md },
  row: { gap: spacing.sm, flexWrap: 'wrap', alignItems: 'center' },
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: botanical.radius.surface,
    borderColor: botanical.colors.line,
    borderWidth: 1,
    backgroundColor: botanical.colors.paper,
  },
  notice: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: botanical.radius.small,
    backgroundColor: botanical.colors.sage,
  },
  error: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: botanical.radius.small,
    backgroundColor: botanical.colors.amberWash,
  },
  divider: {
    gap: spacing.sm,
    borderTopWidth: 1,
    borderColor: botanical.colors.line,
    paddingTop: spacing.md,
  },
});
