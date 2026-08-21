import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PrototypeStatusBar } from '@/components/PrototypeStatusBar';
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
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <View style={styles.root}>
        <PrototypeStatusBar />
        <Stack
          screenOptions={{
            animation: 'fade',
            contentStyle: { backgroundColor: colors.ivory },
            headerShown: false,
          }}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
});
