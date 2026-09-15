import { useEffect, useState, type ComponentProps, type PropsWithChildren } from 'react';
import { AppState, Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AccessTextField } from '@/components/access';
import { Button, Text } from '@/components/primitives';
import { botanical, logicalRowDirection, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export function useMasroofiCopy() {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const text = (key: string, values?: Record<string, unknown>) => t(`cloudMasroofi.${key}`, values);
  return {
    locale,
    direction,
    text,
    money: (fils: number) =>
      text('amount', {
        amount: new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(fils / 100),
      }),
    date: (value: string) =>
      new Intl.DateTimeFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value)),
  };
}

export function useMasroofiPassword() {
  const [password, setPassword] = useState('');
  useEffect(() => {
    const listener = AppState.addEventListener('change', (value) => {
      if (value !== 'active') setPassword('');
    });
    const visibility = () => {
      if (document.visibilityState !== 'visible') setPassword('');
    };
    if (Platform.OS === 'web' && typeof document !== 'undefined')
      document.addEventListener('visibilitychange', visibility);
    return () => {
      listener.remove();
      if (Platform.OS === 'web' && typeof document !== 'undefined')
        document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  return [password, setPassword] as const;
}

export function MasroofiText(props: ComponentProps<typeof Text>) {
  const { locale, direction } = useMasroofiCopy();
  return <Text brand language={locale} direction={direction} {...props} />;
}

export function MasroofiButton(props: ComponentProps<typeof Button>) {
  const { locale, direction } = useMasroofiCopy();
  return <Button brand fullWidth={false} language={locale} direction={direction} {...props} />;
}

export function MasroofiField(
  props: Omit<ComponentProps<typeof AccessTextField>, 'language' | 'direction'>,
) {
  const { locale, direction } = useMasroofiCopy();
  return <AccessTextField language={locale} direction={direction} autoComplete="off" {...props} />;
}

export function MasroofiRow({ children }: PropsWithChildren) {
  const { direction } = useMasroofiCopy();
  return (
    <View style={[masroofiStyles.row, { flexDirection: logicalRowDirection(direction) }]}>
      {children}
    </View>
  );
}

export function MasroofiToggle({
  label,
  checked,
  disabled,
  onChange,
}: {
  readonly label: string;
  readonly checked: boolean;
  readonly disabled: boolean;
  readonly onChange: (value: boolean) => void;
}) {
  return (
    <MasroofiButton
      variant={checked ? 'primary' : 'secondary'}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
    >
      {label}
    </MasroofiButton>
  );
}

export const masroofiStyles = StyleSheet.create({
  stack: { gap: spacing.md },
  row: { gap: spacing.sm, flexWrap: 'wrap', alignItems: 'center' },
  section: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderColor: botanical.colors.line,
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
  muted: { color: botanical.colors.muted },
  amount: { fontVariant: ['tabular-nums'] },
  grow: { flexGrow: 1, flexShrink: 1 },
});
