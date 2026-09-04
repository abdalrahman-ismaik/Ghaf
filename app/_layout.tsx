import 'react-native-gesture-handler';
import 'react-native-reanimated';

import {
  Alexandria_400Regular,
  Alexandria_700Bold,
  Alexandria_800ExtraBold,
} from '@expo-google-fonts/alexandria';
import {
  ReadexPro_400Regular,
  ReadexPro_500Medium,
  ReadexPro_600SemiBold,
  ReadexPro_700Bold,
} from '@expo-google-fonts/readex-pro';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PrototypeStatusBar } from '@/components/PrototypeStatusBar';
import { GhafFontProvider } from '@/components/primitives';
import { colors } from '@/design/tokens';
import { configureNativeDirection, setI18nLocale, synchronizeWebDocumentLocale } from '@/i18n';
import { usePrototypeStore } from '@/state/usePrototypeStore';

// THESIS: Family action becomes a clear living record. Avoid centered card piles,
// pastel wellness styling, and generic achievement chrome.
// OWN-WORLD: The Ghaf Phenology Ledger uses warm paper, dark green ink, small saffron accents,
// measured rules, botanical plates, low-radius controls, and equal Arabic/English support.
// STORY: A Parent gives context, a Child acts, a Parent checks, and the Ghaf record grows.
// FIRST VIEWPORT: Show the tree as an open specimen, framed by identity and one action.
// FORM: Grounded direction 7, seed ce3efa7d.
// FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review,
// the verdict, DESIGN.md, and every shipping raster carrying its provenance.

export default function RootLayout() {
  const locale = usePrototypeStore((state) => state.locale);
  const pathname = usePathname();
  const [fontsLoaded, fontError] = useFonts({
    Alexandria_400Regular,
    Alexandria_700Bold,
    Alexandria_800ExtraBold,
    ReadexPro_400Regular,
    ReadexPro_500Medium,
    ReadexPro_600SemiBold,
    ReadexPro_700Bold,
  });

  useEffect(() => {
    configureNativeDirection(locale);
    void setI18nLocale(locale);
    if (Platform.OS === 'web') synchronizeWebDocumentLocale(locale);
  }, [locale]);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.scrollTo({ left: 0, top: 0 });
    }
  }, [pathname]);

  useEffect(() => {
    if (fontError) console.warn('Ghaf brand fonts could not be loaded; using system fallbacks.');
  }, [fontError]);

  return (
    <SafeAreaProvider>
      <GhafFontProvider loaded={fontsLoaded}>
        <StatusBar style="light" />
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
      </GhafFontProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ivory,
    overflow: 'hidden',
  },
});
