import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/design/tokens';
import { configureNativeDirection, setI18nLocale } from '@/i18n';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function RootLayout() {
  const locale = usePrototypeStore((state) => state.locale);

  useEffect(() => {
    configureNativeDirection(locale);
    void setI18nLocale(locale);
  }, [locale]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          animation: 'fade',
          contentStyle: { backgroundColor: colors.ivory },
          headerShown: false,
        }}
      />
    </>
  );
}
