import { useState } from 'react';
import { Redirect, useRouter, type Href } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AccessScreen, PrototypePill } from '@/components/access';
import { GhafRasterLogo } from '@/components/brand/GhafRasterLogo';
import { LocalIllustration } from '@/components/illustrations';
import { FirstRunOnboarding, useFirstRunExperience } from '@/components/onboarding';
import { Button, Text } from '@/components/primitives';
import { colors, layout, r001Radii, spacing } from '@/design/tokens';
import {
  selectCanEnterChildExperience,
  selectHasActiveParentExperience,
  usePrototypeStore,
} from '@/state/usePrototypeStore';
import { entryMode } from '@/config/demoEntry';
import { DemoEntryScreen } from '@/components/demo/DemoEntryScreen';
import type { DemoEntryCopy } from '@/components/demo/types';
import type { DemoPrincipal } from '@/models/demoEntry';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const setLocale = usePrototypeStore((state) => state.setLocale);
  const parentOnboarding = usePrototypeStore((state) => state.parentOnboarding);
  const childAccess = usePrototypeStore((state) => state.childAccess);
  const activeExperience = usePrototypeStore((state) => state.activeExperience);
  const temporaryParentAccess = usePrototypeStore((state) => state.temporaryParentAccess);
  const enterParentExperience = usePrototypeStore((state) => state.enterParentExperience);
  const { state: firstRunState } = useFirstRunExperience();

  const switchLocale = () => {
    setLocale(locale === 'ar' ? 'en' : 'ar');
  };

  if (entryMode === 'demo') return <DemoWelcomeRoute />;

  if (activeExperience === 'parent' && parentOnboarding.status === 'authenticated_parent') {
    return <Redirect href="/parent" />;
  }
  if (activeExperience === 'child' && childAccess.canEnterChildExperience) {
    return <Redirect href="/child" />;
  }
  if (activeExperience === 'signed_out' && temporaryParentAccess) {
    return <Redirect href="/access/parent/sign-in" />;
  }
  if (!firstRunState.completed) return <FirstRunOnboarding />;

  const openParent = () => {
    const existing = enterParentExperience();
    router.push((existing.ok ? '/parent' : '/access/parent/sign-in') as Href);
  };

  return (
    <AccessScreen
      background="welcome"
      contentContainerStyle={styles.viewport}
      contentMaxWidth={layout.readableContentWidth}
      contentStyle={styles.content}
      header={
        <View
          style={[
            styles.languageBar,
            direction === 'rtl' ? styles.languageBarRtl : styles.languageBarLtr,
          ]}
        >
          <Button
            accessibilityLabel={t('access.welcome.switchLanguage')}
            brand
            direction="ltr"
            fullWidth={false}
            language={locale}
            onPress={switchLocale}
            style={styles.languageButton}
            testID="welcome-language-button"
            variant="quiet"
          >
            {t('access.welcome.switchLanguage')}
          </Button>
        </View>
      }
      testID="welcome-screen"
    >
      <View style={styles.hero}>
        <GhafRasterLogo
          accessibilityLabel={t('common.brand')}
          size={76}
          testID="welcome-raster-logo"
        />
        <Text
          align="center"
          brand
          color="ghafEmerald"
          direction="rtl"
          language="ar"
          testID="welcome-wordmark"
          variant="wordmark"
        >
          {t('common.brand')}
        </Text>
        <LocalIllustration
          assetId="welcome-ghaf-habitat"
          decorative
          direction={direction}
          language={locale}
          priority="high"
          style={styles.heroImage}
          testID="welcome-natural-hero"
        />
        <Text
          align="center"
          brand
          color="deepForest"
          direction={direction}
          language={locale}
          style={styles.title}
          testID="welcome-title"
          variant="hero"
        >
          {t('access.welcome.title')}
        </Text>
        <Text
          align="center"
          brand
          color="onSurfaceVariant"
          direction={direction}
          language={locale}
          style={styles.body}
          variant="body"
        >
          {t('access.welcome.body')}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          brand
          direction={direction}
          language={locale}
          onPress={openParent}
          size="regular"
          testID="welcome-parent-button"
        >
          {t('access.welcome.parentAction')}
        </Button>
        <Button
          brand
          direction={direction}
          language={locale}
          onPress={() => router.push('/access/child' as Href)}
          size="regular"
          testID="welcome-child-button"
          variant="secondary"
        >
          {t('access.welcome.childAction')}
        </Button>
      </View>

      <PrototypePill
        direction={direction}
        language={locale}
        message={t('access.welcome.origin')}
        style={styles.origin}
      />
    </AccessScreen>
  );
}

function DemoWelcomeRoute() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const setLocale = usePrototypeStore((state) => state.setLocale);
  const parentActive = usePrototypeStore(selectHasActiveParentExperience);
  const childActive = usePrototypeStore(selectCanEnterChildExperience);
  const runGeneration = usePrototypeStore((state) => state.demoRunGeneration);
  const entryEpoch = usePrototypeStore((state) => state.demoEntryEpoch);
  const restartRequired = usePrototypeStore((state) => state.demoResetFailed);
  const enterDemoExperience = usePrototypeStore((state) => state.enterDemoExperience);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (parentActive) return <Redirect href="/parent" />;
  if (childActive) return <Redirect href="/child" />;

  const choose = (principal: DemoPrincipal) => {
    if (busy || restartRequired) return;
    setError(null);
    setBusy(true);
    const result = enterDemoExperience({
      principal,
      expectedGeneration: runGeneration,
      expectedEpoch: entryEpoch,
    });
    setBusy(false);
    if (!result.ok) {
      setError(t('demoEntry.entryError'));
      return;
    }
    router.replace(result.data.destination);
  };
  const copy: DemoEntryCopy = {
    title: t('demoEntry.title'),
    body: t('demoEntry.body'),
    disclosure: t('demoEntry.disclosure'),
    restartNotice: t('demoEntry.restartNotice'),
    breadthNotice: t('demoEntry.breadthNotice'),
    busyLabel: t('demoEntry.busyLabel'),
    unavailableError: t(
      Platform.OS === 'web' ? 'demoEntry.unavailableErrorWeb' : 'demoEntry.unavailableError',
    ),
    restartRequiredTitle: t('demoEntry.restartRequiredTitle'),
    restartRequiredBody: t(
      Platform.OS === 'web' ? 'demoEntry.restartRequiredBodyWeb' : 'demoEntry.restartRequiredBody',
    ),
    storyAction: t('demoEntry.storyAction'),
    languageAction: t('demoEntry.languageAction'),
    profiles: [
      {
        principal: 'parent_al_noor',
        name: t('common.parent'),
        roleLabel: t('common.parent'),
        description: t('demoEntry.parentDescription'),
        avatar: 'parent',
      },
      {
        principal: 'child_salem',
        name: t('common.salem'),
        roleLabel: t('common.child'),
        description: t('demoEntry.salemDescription'),
        avatar: 'ghaf_tree',
      },
      {
        principal: 'child_alya',
        name: t('common.alya'),
        roleLabel: t('common.child'),
        description: t('demoEntry.alyaDescription'),
        avatar: 'flower',
      },
    ],
    moments: [
      {
        id: 'together',
        title: t('demoEntry.moments.together.title'),
        body: t('demoEntry.moments.together.body'),
        imageAlt: t('demoEntry.moments.together.imageAlt'),
        assetId: 'onboarding-action',
      },
      {
        id: 'support',
        title: t('demoEntry.moments.support.title'),
        body: t('demoEntry.moments.support.body'),
        imageAlt: t('demoEntry.moments.support.imageAlt'),
        assetId: 'onboarding-support',
      },
      {
        id: 'growth',
        title: t('demoEntry.moments.growth.title'),
        body: t('demoEntry.moments.growth.body'),
        imageAlt: t('demoEntry.moments.growth.imageAlt'),
        assetId: 'onboarding-growth',
      },
    ],
    story: {
      close: t('demoEntry.story.close'),
      next: t('demoEntry.story.next'),
      back: t('demoEntry.story.back'),
      finish: t('demoEntry.story.finish'),
      audioUnavailable: t('demoEntry.story.audioUnavailable'),
      audioPlay: t('demoEntry.story.audioPlay'),
      audioStop: t('demoEntry.story.audioStop'),
      audioReplay: t('demoEntry.story.audioReplay'),
      audioLoading: t('demoEntry.story.audioLoading'),
      audioScreenReader: t('demoEntry.story.audioScreenReader'),
      progressLabel: (current, total) => t('demoEntry.story.progress', { current, total }),
    },
  };
  return (
    <DemoEntryScreen
      runGeneration={runGeneration}
      entryEpoch={entryEpoch}
      locale={locale}
      direction={direction}
      copy={copy}
      busy={busy}
      error={error}
      restartRequired={restartRequired}
      onChooseProfile={choose}
      onChangeLocale={() => {
        setError(null);
        setLocale(locale === 'ar' ? 'en' : 'ar');
      }}
    />
  );
}

const styles = StyleSheet.create({
  languageBar: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: layout.readableContentWidth + layout.screenPadding * 2,
    minHeight: layout.touchTarget + spacing.xs,
    justifyContent: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xs,
  },
  languageBarRtl: { alignItems: 'flex-end' },
  languageBarLtr: { alignItems: 'flex-start' },
  languageButton: {
    borderRadius: r001Radii.pill,
    paddingHorizontal: spacing.sm,
  },
  viewport: {
    paddingTop: 0,
    paddingBottom: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    gap: spacing.xl,
  },
  hero: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    minHeight: 500,
    paddingTop: spacing.xl,
  },
  heroImage: {
    width: '100%',
    aspectRatio: 3 / 2,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLow,
  },
  title: { maxWidth: 340 },
  body: { maxWidth: 340 },
  actions: {
    width: '100%',
    gap: spacing.md,
  },
  origin: { marginTop: spacing.xs },
});
