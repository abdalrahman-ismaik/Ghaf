import { useState } from 'react';
import { Redirect, useRouter, type Href } from 'expo-router';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

import { FirstRunOnboarding, useFirstRunExperience } from '@/components/onboarding';
import {
  selectCanEnterChildExperience,
  selectHasActiveParentExperience,
  usePrototypeStore,
} from '@/state/usePrototypeStore';
import { entryMode } from '@/config/demoEntry';
import type { DemoEntryCopy } from '@/components/demo/types';
import { OriginalWelcomeScreen } from '@/components/access/OriginalWelcomeScreen';
import { OriginalDemoEntryScreen } from '@/components/demo/OriginalDemoEntryScreen';
import type { DemoPrincipal } from '@/models/demoEntry';

export default function WelcomeScreen() {
  const router = useRouter();
  useTranslation();
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
    <OriginalWelcomeScreen
      locale={locale}
      direction={direction}
      onChangeLocale={switchLocale}
      onParent={openParent}
      onChild={() => router.push('/access/child' as Href)}
    />
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
    brand: t('common.brand'),
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
        id: 'intro',
        title: t('demoEntry.moments.intro.title'),
        body: t('demoEntry.moments.intro.body'),
        imageAlt: t('demoEntry.moments.intro.imageAlt'),
        assetId: 'onboarding-ghaf-intro',
      },
      {
        id: 'family',
        title: t('demoEntry.moments.family.title'),
        body: t('demoEntry.moments.family.body'),
        imageAlt: t('demoEntry.moments.family.imageAlt'),
        assetId: 'onboarding-family',
      },
      {
        id: 'together',
        title: t('demoEntry.moments.together.title'),
        body: t('demoEntry.moments.together.body'),
        imageAlt: t('demoEntry.moments.together.imageAlt'),
        assetId: 'onboarding-action',
      },
      {
        id: 'ai',
        title: t('demoEntry.moments.ai.title'),
        body: t('demoEntry.moments.ai.body'),
        imageAlt: t('demoEntry.moments.ai.imageAlt'),
        assetId: 'onboarding-ai',
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
    <OriginalDemoEntryScreen
      locale={locale}
      direction={direction}
      copy={copy}
      busy={busy}
      error={error}
      restartRequired={restartRequired}
      runGeneration={runGeneration}
      entryEpoch={entryEpoch}
      onChooseProfile={choose}
      onChangeLocale={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
    />
  );
}
