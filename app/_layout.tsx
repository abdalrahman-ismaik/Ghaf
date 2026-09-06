import 'react-native-gesture-handler';

import { Alexandria_700Bold } from '@expo-google-fonts/alexandria/700Bold';
import { Alexandria_800ExtraBold } from '@expo-google-fonts/alexandria/800ExtraBold';
import { ReadexPro_400Regular } from '@expo-google-fonts/readex-pro/400Regular';
import { ReadexPro_500Medium } from '@expo-google-fonts/readex-pro/500Medium';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useReducedMotion } from 'react-native-reanimated';

import { PrototypeStatusBar } from '@/components/PrototypeStatusBar';
import {
  BrandedSplash,
  FirstRunExperienceProvider,
  SectionTransitionOverlay,
} from '@/components/onboarding';
import { GhafFontProvider } from '@/components/primitives';
import { colors, firstRunMotion } from '@/design/tokens';
import {
  preloadDeferredImages,
  preloadStartupImages,
  startupImageTotal,
  type StartupImageProgress,
} from '@/features/startup';
import { configureNativeDirection, setI18nLocale, synchronizeWebDocumentLocale } from '@/i18n';
import { usePrototypeStore } from '@/state/usePrototypeStore';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

// THESIS: Family action becomes a clear living record. Avoid centered card piles,
// pastel wellness styling, and generic achievement chrome.
// OWN-WORLD: The Ghaf Phenology Ledger uses warm paper, dark green ink, small saffron accents,
// measured rules, botanical plates, low-radius controls, and equal Arabic/English support.
// STORY: A Parent gives context, a Child acts, a Parent checks, and the Ghaf record grows.
// FIRST VIEWPORT: Show the tree as an open specimen, framed by identity and one action.
// FORM: Grounded direction 7, seed ce3efa7d.
// FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review,
// the verdict, DESIGN.md, and every shipping raster carrying its provenance.

const startupFontAssets = {
  Alexandria_700Bold,
  Alexandria_800ExtraBold,
  ReadexPro_400Regular,
  ReadexPro_500Medium,
} as const;

export default function RootLayout() {
  const locale = usePrototypeStore((state) => state.locale);
  const pathname = usePathname();
  const reducedMotion = Boolean(useReducedMotion());
  const splashStartedAt = useRef<number | null>(null);
  const [nativeSplashHidden, setNativeSplashHidden] = useState(false);
  const [showBrandedSplash, setShowBrandedSplash] = useState(true);
  const [imageProgress, setImageProgress] = useState<StartupImageProgress>({
    failed: 0,
    presentationReady: false,
    settled: 0,
    total: startupImageTotal,
  });
  const isR001Route = pathname === '/' || pathname.startsWith('/access/');
  const isR002aParentSurface = pathname.startsWith('/parent');
  const usesLightSystemChrome =
    isR001Route ||
    isR002aParentSurface ||
    pathname.startsWith('/child') ||
    pathname === '/garden' ||
    pathname.startsWith('/garden/') ||
    pathname === '/league' ||
    pathname === '/circle/shared-growth';
  const [fontsLoaded, fontError] = useFonts(startupFontAssets);
  const fontsSettled = fontsLoaded || Boolean(fontError);
  const imagesSettled = imageProgress.settled === imageProgress.total;
  const startupReady = fontsSettled && imagesSettled;

  useEffect(() => {
    let mounted = true;
    void preloadStartupImages((progress) => {
      if (mounted) setImageProgress(progress);
    });
    return () => {
      mounted = false;
    };
  }, []);

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

  useEffect(() => {
    if (imagesSettled && imageProgress.failed > 0) {
      console.warn(
        `${imageProgress.failed} Ghaf image asset(s) could not be preloaded; using local fallbacks.`,
      );
    }
  }, [imageProgress.failed, imagesSettled]);

  useEffect(() => {
    if (!imageProgress.presentationReady || nativeSplashHidden) return;
    let mounted = true;
    const hideNativeSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch {
        // The app-owned loading surface remains a safe handoff if the native splash is already gone.
      } finally {
        if (mounted) {
          splashStartedAt.current = Date.now();
          setNativeSplashHidden(true);
        }
      }
    };
    void hideNativeSplash();
    return () => {
      mounted = false;
    };
  }, [imageProgress.presentationReady, nativeSplashHidden]);

  useEffect(() => {
    if (!startupReady || !nativeSplashHidden || splashStartedAt.current === null) return;
    let mounted = true;
    let frame: number | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const elapsed = Date.now() - splashStartedAt.current;
    const remaining = Math.max(0, firstRunMotion.startupHold - elapsed);
    timeout = setTimeout(() => {
      frame = requestAnimationFrame(() => {
        if (mounted) setShowBrandedSplash(false);
      });
    }, remaining);
    return () => {
      mounted = false;
      if (timeout !== undefined) clearTimeout(timeout);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [nativeSplashHidden, startupReady]);

  useEffect(() => {
    if (showBrandedSplash) return;
    let mounted = true;
    let firstFrame: number | undefined;
    let secondFrame: number | undefined;

    firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        void preloadDeferredImages().then((result) => {
          if (mounted && result.failed > 0) {
            console.warn(
              `${result.failed} deferred Ghaf image asset(s) could not be warmed; using local fallbacks.`,
            );
          }
        });
      });
    });

    return () => {
      mounted = false;
      if (firstFrame !== undefined) cancelAnimationFrame(firstFrame);
      if (secondFrame !== undefined) cancelAnimationFrame(secondFrame);
    };
  }, [showBrandedSplash]);

  return (
    <SafeAreaProvider>
      <GhafFontProvider loaded={fontsLoaded}>
        <FirstRunExperienceProvider>
          <StatusBar style={usesLightSystemChrome ? 'dark' : 'light'} />
          <View style={styles.root}>
            {usesLightSystemChrome ? null : <PrototypeStatusBar />}
            <Stack
              screenOptions={{
                animation: reducedMotion ? 'none' : 'fade',
                contentStyle: { backgroundColor: colors.ivory },
                headerShown: false,
              }}
            />
            <SectionTransitionOverlay />
            <BrandedSplash visible={showBrandedSplash} />
          </View>
        </FirstRunExperienceProvider>
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
