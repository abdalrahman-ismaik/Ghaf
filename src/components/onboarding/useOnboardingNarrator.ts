import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  readonly canStop: boolean;
  readonly hasSource: boolean;
  readonly replay: () => void;
  readonly stop: () => void;
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
  const source = onboardingNarrationSources[locale][step];
  const player = useAudioPlayer(source, {
    updateInterval: 120,
  });
  const playerStatus = useAudioPlayerStatus(player);
  const playback = useMemo(() => createOnboardingPlayback(player), [player]);
  const [starting, setStarting] = useState(false);
  const attempt = useRef(0);
  const clip = `${locale}:${step}`;
  const currentClip = useRef(clip);
  const stoppedClip = useRef<string | null>(null);
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

  const startPlayback = useCallback(() => {
    const revision = ++attempt.current;
    setStarting(true);
    void playback.restart().finally(() => {
      if (revision === attempt.current) setStarting(false);
    });
  }, [playback]);

  useEffect(() => {
    if (currentClip.current !== clip) {
      currentClip.current = clip;
      stoppedClip.current = null;
    }
    playback.setEnabled(source !== null && ready && screenReaderEnabled === false);
    const cancel = () => {
      attempt.current += 1;
      setStarting(false);
      playback.setEnabled(false);
    };

    if (
      !ready ||
      source === null ||
      screenReaderEnabled !== false ||
      (Platform.OS === 'web' && !webPlaybackUnlocked) ||
      stoppedClip.current === clip
    ) {
      return cancel;
    }

    startPlayback();
    return cancel;
  }, [clip, playback, ready, screenReaderEnabled, source, startPlayback, webPlaybackUnlocked]);

  const replay = useCallback(() => {
    if (source === null || !ready || screenReaderEnabled !== false) return;
    stoppedClip.current = null;
    startPlayback();
  }, [ready, screenReaderEnabled, source, startPlayback]);

  const stop = useCallback(() => {
    stoppedClip.current = clip;
    attempt.current += 1;
    setStarting(false);
    playback.stop();
  }, [clip, playback]);

  return {
    canStop: starting || playerStatus.playing,
    hasSource: source !== null,
    replay,
    stop,
    screenReaderActive: screenReaderEnabled === true,
    screenReaderReady: screenReaderEnabled !== null,
    status:
      source === null || playerStatus.error
        ? 'unavailable'
        : playerStatus.playing
          ? 'speaking'
          : 'idle',
  };
}
