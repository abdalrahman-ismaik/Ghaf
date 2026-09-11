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
  icon: './assets/brand/ghaf/app-icon/icon.png',
  scheme: 'ghaf',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    bundleIdentifier: PROVISIONAL_IOS_BUNDLE_IDENTIFIER,
    icon: './assets/brand/ghaf/app-icon/ios-icon-1024.png',
  },
  android: {
    package: PROVISIONAL_ANDROID_PACKAGE,
    allowBackup: false,
    blockedPermissions: [
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
    ],
    predictiveBackGestureEnabled: true,
    softwareKeyboardLayoutMode: 'resize',
    icon: './assets/brand/ghaf/app-icon/android-legacy-icon-1024.png',
    adaptiveIcon: {
      foregroundImage: './assets/brand/ghaf/app-icon/android-adaptive-foreground-1024.png',
      monochromeImage: './assets/brand/ghaf/app-icon/android-adaptive-monochrome-1024.png',
      backgroundColor: '#F7F8F3',
    },
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/brand/ghaf/app-icon/favicon-48.png',
  },
  plugins: [
    'expo-router',
    'expo-image',
    'expo-sqlite',
    [
      'expo-font',
      {
        fonts: [
          './node_modules/@expo-google-fonts/alexandria/700Bold/Alexandria_700Bold.ttf',
          './node_modules/@expo-google-fonts/alexandria/800ExtraBold/Alexandria_800ExtraBold.ttf',
          './node_modules/@expo-google-fonts/readex-pro/400Regular/ReadexPro_400Regular.ttf',
          './node_modules/@expo-google-fonts/readex-pro/500Medium/ReadexPro_500Medium.ttf',
        ],
      },
    ],
    [
      'expo-audio',
      {
        microphonePermission: 'Allow Ghaf to record one held task-help clip for transcript review.',
        recordAudioAndroid: true,
        enableBackgroundRecording: false,
        enableBackgroundPlayback: false,
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
    [
      'expo-splash-screen',
      {
        image: './assets/brand/ghaf/app-icon/splash-icon-1024.png',
        imageWidth: 240,
        resizeMode: 'contain',
        backgroundColor: '#F7F8F3',
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
