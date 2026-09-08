import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';

import { onboardingAmbienceSource } from './onboardingAudioSources';

interface UseOnboardingAmbienceOptions {
  readonly narrationPlaying: boolean;
  readonly ready: boolean;
  readonly screenReaderActive: boolean;
  readonly webPlaybackUnlocked: boolean;
}

interface OnboardingAmbience {
  readonly resume: () => void;
}

function configureAmbiencePlayer(player: ReturnType<typeof useAudioPlayer>) {
  player.loop = true;
}

function setAmbienceVolume(player: ReturnType<typeof useAudioPlayer>, narrationPlaying: boolean) {
  player.volume = narrationPlaying ? 0.08 : 0.32;
}

export function useOnboardingAmbience({
  narrationPlaying,
  ready,
  screenReaderActive,
  webPlaybackUnlocked,
}: UseOnboardingAmbienceOptions): OnboardingAmbience {
  const player = useAudioPlayer(onboardingAmbienceSource, { updateInterval: 1_000 });

  useEffect(() => {
    void setAudioModeAsync({
      allowsBackgroundRecording: false,
      allowsRecording: false,
      interruptionMode: 'mixWithOthers',
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    configureAmbiencePlayer(player);
  }, [player]);

  useEffect(() => {
    setAmbienceVolume(player, narrationPlaying);
  }, [narrationPlaying, player]);

  useEffect(() => {
    if (!ready || screenReaderActive || (Platform.OS === 'web' && !webPlaybackUnlocked)) {
      player.pause();
      return undefined;
    }

    player.play();
    return () => {
      player.pause();
    };
  }, [player, ready, screenReaderActive, webPlaybackUnlocked]);

  const resume = useCallback(() => {
    if (ready && !screenReaderActive) player.play();
  }, [player, ready, screenReaderActive]);

  return { resume };
}
