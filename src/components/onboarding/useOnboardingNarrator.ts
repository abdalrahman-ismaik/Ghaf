import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

import type { LocaleCode } from '@/models/familyGrowth';

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
  const [screenReaderEnabled, setScreenReaderEnabled] = useState<boolean | null>(
    Platform.OS === 'web' ? false : null,
  );

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let mounted = true;
    const updateScreenReader = (active: boolean) => {
      if (mounted) setScreenReaderEnabled(active);
    };

    void AccessibilityInfo.isScreenReaderEnabled()
      .then(updateScreenReader)
      .catch(() => updateScreenReader(true));
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      updateScreenReader,
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    configureNarrationPlayer(player);
  }, [player]);

  useEffect(() => {
    let active = true;
    player.pause();

    if (
      !ready ||
      screenReaderEnabled !== false ||
      (Platform.OS === 'web' && !webPlaybackUnlocked)
    ) {
      return undefined;
    }

    const start = async () => {
      try {
        await player.seekTo(0);
        if (active) player.play();
      } catch {
        // The complete visible transcript keeps onboarding usable when playback fails.
      }
    };

    void start();
    return () => {
      active = false;
      player.pause();
    };
  }, [player, ready, screenReaderEnabled, webPlaybackUnlocked]);

  const replay = useCallback(() => {
    if (screenReaderEnabled !== false) return;

    const restart = async () => {
      try {
        player.pause();
        await player.seekTo(0);
        player.play();
      } catch {
        // A replay failure does not block reading or navigation.
      }
    };

    void restart();
  }, [player, screenReaderEnabled]);

  return {
    replay,
    screenReaderActive: screenReaderEnabled === true,
    status: playerStatus.error ? 'unavailable' : playerStatus.playing ? 'speaking' : 'idle',
  };
}
