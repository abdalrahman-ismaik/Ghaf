import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

import type { LocaleCode } from '@/models/familyGrowth';
import { createOnboardingPlayback, runOptionalAudio } from '@/features/onboarding/playback';

import type { OnboardingStep } from './experienceModel';
import { onboardingNarrationSources } from './onboardingAudioSources';

export type OnboardingNarrationStatus = 'idle' | 'speaking' | 'unavailable';

interface UseOnboardingNarratorOptions {
  readonly locale: LocaleCode;
  readonly ready: boolean;
  readonly step: OnboardingStep;
  readonly webPlaybackUnlocked: boolean;
}

interface OnboardingNarrator {
  readonly replay: () => void;
  readonly screenReaderActive: boolean;
  readonly screenReaderReady: boolean;
  readonly status: OnboardingNarrationStatus;
}

function configureNarrationPlayer(player: ReturnType<typeof useAudioPlayer>) {
  player.loop = false;
  player.volume = 1;
}

export function useOnboardingNarrator({
  locale,
  ready,
  step,
  webPlaybackUnlocked,
}: UseOnboardingNarratorOptions): OnboardingNarrator {
  const player = useAudioPlayer(onboardingNarrationSources[locale][step], {
    updateInterval: 120,
  });
  const playerStatus = useAudioPlayerStatus(player);
  const playback = useMemo(() => createOnboardingPlayback(player), [player]);
  const [screenReaderEnabled, setScreenReaderEnabled] = useState<boolean | null>(
    Platform.OS === 'web' ? false : null,
  );

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let mounted = true;
    let receivedChange = false;
    const updateScreenReader = (active: boolean) => {
      if (mounted) setScreenReaderEnabled(active);
    };

    void AccessibilityInfo.isScreenReaderEnabled()
      .then((active) => {
        if (!receivedChange) updateScreenReader(active);
      })
      .catch(() => {
        if (!receivedChange) updateScreenReader(true);
      });
    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', (active) => {
      receivedChange = true;
      updateScreenReader(active);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    runOptionalAudio(() => configureNarrationPlayer(player));
  }, [player]);

  useEffect(() => {
    playback.setEnabled(ready && screenReaderEnabled === false);

    if (
      !ready ||
      screenReaderEnabled !== false ||
      (Platform.OS === 'web' && !webPlaybackUnlocked)
    ) {
      return () => playback.setEnabled(false);
    }

    void playback.restart();
    return () => playback.setEnabled(false);
  }, [locale, playback, ready, screenReaderEnabled, step, webPlaybackUnlocked]);

  const replay = useCallback(() => {
    void playback.restart();
  }, [playback]);

  return {
    replay,
    screenReaderActive: screenReaderEnabled === true,
    screenReaderReady: screenReaderEnabled !== null,
    status: playerStatus.error ? 'unavailable' : playerStatus.playing ? 'speaking' : 'idle',
  };
}
