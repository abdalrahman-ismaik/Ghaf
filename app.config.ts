import type { ConfigContext, ExpoConfig } from 'expo/config';

// The competition build uses temporary app identifiers.
const PROVISIONAL_ANDROID_PACKAGE = 'ae.ac.ku.ghaf.prototype';
const PROVISIONAL_IOS_BUNDLE_IDENTIFIER = 'ae.ac.ku.ghaf.prototype';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Ghaf — غاف',
  slug: 'ghaf-mvp',
  version: '0.1.0',
  orientation: 'portrait',
  scheme: 'ghaf',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    bundleIdentifier: PROVISIONAL_IOS_BUNDLE_IDENTIFIER,
  },
  android: {
    package: PROVISIONAL_ANDROID_PACKAGE,
    predictiveBackGestureEnabled: true,
  },
  web: {
    bundler: 'metro',
    output: 'static',
  },
  plugins: [
    'expo-router',
    [
      'expo-font',
      {
        fonts: [
          '@expo-google-fonts/alexandria/400Regular/Alexandria_400Regular.ttf',
          '@expo-google-fonts/alexandria/700Bold/Alexandria_700Bold.ttf',
          '@expo-google-fonts/alexandria/800ExtraBold/Alexandria_800ExtraBold.ttf',
          '@expo-google-fonts/readex-pro/400Regular/ReadexPro_400Regular.ttf',
          '@expo-google-fonts/readex-pro/500Medium/ReadexPro_500Medium.ttf',
          '@expo-google-fonts/readex-pro/600SemiBold/ReadexPro_600SemiBold.ttf',
          '@expo-google-fonts/readex-pro/700Bold/ReadexPro_700Bold.ttf',
        ],
      },
    ],
    [
      'expo-localization',
      {
        supportedLocales: {
          android: ['ar', 'en'],
          ios: ['ar', 'en'],
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    prototypeStage: 'MVP Prototype',
    serviceMode: process.env.EXPO_PUBLIC_GHAF_SERVICE_MODE ?? 'mock',
    identifiersAreProvisional: true,
  },
});
