import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { AccessibilityInfo, AppState, Platform, type AppStateStatus } from 'react-native';

import { resolveAmbientPlaybackDecision, type AmbientAudioAppState } from '@/features/audio';
import { usePrototypeStore } from '@/state/usePrototypeStore';

const ambientSoundscapeSource = require('../../../assets/audio/ambient/nature-soundscape-v1.mp3');

interface AmbientAudioContextValue {
  readonly setNarrationPlaying: (playing: boolean) => void;
  readonly unlockPlayback: () => void;
  readonly webPlaybackUnlocked: boolean;
}

const AmbientAudioContext = createContext<AmbientAudioContextValue | null>(null);

function normalizeAppState(state: AppStateStatus | null): AmbientAudioAppState {
  if (state === 'active' || state === 'background' || state === 'inactive') return state;
  return 'unknown';
}

function isExclusiveAudioStatus(status: string): boolean {
  return (
    status === 'requesting_permission' ||
    status === 'recording_held' ||
    status === 'transcribing' ||
    status === 'deleting'
  );
}

function configureAmbientPlayer(player: ReturnType<typeof useAudioPlayer>): void {
  try {
    player.loop = true;
  } catch {
    pauseAmbientPlayer(player);
  }
}

function applyAmbientPlayback(
  player: ReturnType<typeof useAudioPlayer>,
  shouldPlay: boolean,
  volume: number,
): void {
  try {
    player.volume = volume;
    if (shouldPlay) player.play();
    else player.pause();
  } catch {
    pauseAmbientPlayer(player);
  }
}

function pauseAmbientPlayer(player: ReturnType<typeof useAudioPlayer>): void {
  try {
    player.pause();
  } catch {
    // Playback errors stay silent and never block the deterministic app path.
  }
}

export function AmbientAudioProvider({
  children,
  startupReady,
}: PropsWithChildren<{ readonly startupReady: boolean }>) {
  const preference = usePrototypeStore((state) => state.ambientAudioPreference);
  const liveVoiceStatus = usePrototypeStore(
    (state) => state.liveVoiceCapture?.state.envelope.status ?? 'idle',
  );
  const player = useAudioPlayer(ambientSoundscapeSource, { updateInterval: 1_000 });
  const [appState, setAppState] = useState<AmbientAudioAppState>(() =>
    normalizeAppState(AppState.currentState),
  );
  const [screenReaderActive, setScreenReaderActive] = useState<boolean | null>(
    Platform.OS === 'web' ? false : null,
  );
  const [webPlaybackUnlocked, setWebPlaybackUnlocked] = useState(Platform.OS !== 'web');
  const [narrationPlaying, setNarrationPlayingState] = useState(false);

  const unlockPlayback = useCallback(() => setWebPlaybackUnlocked(true), []);
  const setNarrationPlaying = useCallback(
    (playing: boolean) => setNarrationPlayingState(playing),
    [],
  );

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
    configureAmbientPlayer(player);
  }, [player]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      setAppState(normalizeAppState(nextState));
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    let mounted = true;
    const updateScreenReader = (active: boolean) => {
      if (mounted) setScreenReaderActive(active);
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
    if (Platform.OS !== 'web' || webPlaybackUnlocked) return;
    const unlock = () => setWebPlaybackUnlocked(true);
    globalThis.addEventListener('pointerdown', unlock, { once: true });
    globalThis.addEventListener('keydown', unlock, { once: true });
    return () => {
      globalThis.removeEventListener('pointerdown', unlock);
      globalThis.removeEventListener('keydown', unlock);
    };
  }, [webPlaybackUnlocked]);

  const decision = resolveAmbientPlaybackDecision({
    enabled: preference.enabled,
    startupReady,
    appState,
    screenReaderActive,
    webPlaybackUnlocked,
    narrationPlaying,
    exclusiveAudioActive: isExclusiveAudioStatus(liveVoiceStatus),
  });

  useEffect(() => {
    applyAmbientPlayback(player, decision.shouldPlay, decision.volume);
  }, [decision.shouldPlay, decision.volume, player]);

  useEffect(
    () => () => {
      pauseAmbientPlayer(player);
    },
    [player],
  );

  const value = useMemo(
    () => ({ setNarrationPlaying, unlockPlayback, webPlaybackUnlocked }),
    [setNarrationPlaying, unlockPlayback, webPlaybackUnlocked],
  );

  return <AmbientAudioContext.Provider value={value}>{children}</AmbientAudioContext.Provider>;
}

export function useAmbientAudio(): AmbientAudioContextValue {
  const value = useContext(AmbientAudioContext);
  if (!value) throw new Error('Ambient audio must be used inside AmbientAudioProvider.');
  return value;
}
