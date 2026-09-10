interface PreparedAudioPlayer {
  pause(): void;
  play(): void;
  seekTo(seconds: number): Promise<void>;
}

export function runOptionalAudio(action: () => void): void {
  try {
    action();
  } catch {
    // Audio can be unavailable or already released; the visible story stays usable.
  }
}

export function createOnboardingPlayback(player: PreparedAudioPlayer) {
  let enabled = false;
  let revision = 0;

  return {
    setEnabled(value: boolean) {
      enabled = value;
      revision += 1;
      runOptionalAudio(() => player.pause());
    },
    async restart() {
      if (!enabled) return;
      const request = ++revision;
      try {
        player.pause();
        await player.seekTo(0);
        if (enabled && request === revision) player.play();
      } catch {
        // The visible transcript and navigation remain usable when audio is unavailable.
      }
    },
  };
}
