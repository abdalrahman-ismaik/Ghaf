interface DemoNarrationEnvironment {
  readonly appActive: boolean;
  readonly appObserved: boolean;
  readonly reader: boolean | null;
  readonly readerObserved: boolean;
}

export function isDemoNarrationAllowed(
  environment: DemoNarrationEnvironment,
  isWeb: boolean,
): boolean {
  const { appActive, appObserved, reader, readerObserved } = environment;
  const readerAllowed =
    (readerObserved && reader === false) || (isWeb && !readerObserved && reader === null);
  return appObserved && appActive && readerAllowed;
}

export function isDemoNarrationPlaying(
  status: {
    readonly playing: boolean;
    readonly isLoaded: boolean;
    readonly isBuffering: boolean;
    readonly currentTime: number;
  },
  isWeb: boolean,
): boolean {
  // Web emits optimistic play/loaded flags before decoding; require a moving media clock.
  return (
    status.playing && status.isLoaded && !status.isBuffering && (!isWeb || status.currentTime > 0)
  );
}
