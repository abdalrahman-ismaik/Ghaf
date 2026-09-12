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
