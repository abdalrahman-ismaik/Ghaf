export interface DemoPlaybackPort {
  pause(): void;
  seekTo(seconds: number): Promise<void>;
  play(): void;
}

export interface DemoPlaybackState {
  readonly pending: boolean;
  readonly requested: boolean;
  readonly unavailable: boolean;
}

export interface DemoPlaybackOptions {
  readonly player: DemoPlaybackPort;
  readonly isAllowed: () => boolean;
  readonly onChange: (state: DemoPlaybackState) => void;
}

export interface DemoPlaybackController {
  getState(): DemoPlaybackState;
  restart(): Promise<void>;
  cancel(): void;
  fail(): void;
  dispose(): void;
}

export function createDemoPlayback(options: DemoPlaybackOptions): DemoPlaybackController {
  let state: DemoPlaybackState = Object.freeze({
    pending: false,
    requested: false,
    unavailable: false,
  });
  let lastNotified = state;
  let revision = 0;
  let pendingRequest: number | null = null;
  let disposed = false;
  let pausing = false;
  let stopping = false;

  function update(next: DemoPlaybackState): void {
    if (
      next.pending !== state.pending ||
      next.requested !== state.requested ||
      next.unavailable !== state.unavailable
    ) {
      state = Object.freeze(next);
    }
  }

  function isCurrent(request: number): boolean {
    return !disposed && request === revision && state.requested && !state.unavailable;
  }

  function notify(request: number): boolean {
    if (disposed || request !== revision) return false;
    if (lastNotified !== state) {
      // Record first so a reentrant cancellation cannot notify the same snapshot forever.
      lastNotified = state;
      try {
        options.onChange(state);
      } catch {
        if (!disposed && request === revision) stop(true, false);
        return false;
      }
    }
    return isCurrent(request);
  }

  function pause(request: number): void {
    if (request !== revision || pausing) return;
    pausing = true;
    try {
      options.player.pause();
    } catch {
      if (!disposed && request === revision) stop(true);
    } finally {
      pausing = false;
    }
  }

  function stop(unavailable: boolean, shouldNotify = true): void {
    if (disposed) return;
    const request = ++revision;
    update({ ...state, requested: false, unavailable: state.unavailable || unavailable });
    const alreadyStopping = stopping;
    stopping = true;
    try {
      pause(request);
      if (shouldNotify) notify(request);
    } finally {
      stopping = alreadyStopping;
    }
  }

  function allowed(request: number): boolean {
    if (!isCurrent(request)) return false;
    const permitted = options.isAllowed();
    if (!isCurrent(request)) return false;
    if (!permitted) {
      stop(false);
      return false;
    }
    return true;
  }

  return {
    getState: () => state,
    async restart() {
      if (disposed || state.unavailable || pendingRequest !== null || stopping) return;

      // Lock before any external code, including guards and state observers.
      const request = ++revision;
      pendingRequest = request;
      update({ ...state, pending: true, requested: true });
      try {
        if (!allowed(request)) return;
        pause(request);
        if (!isCurrent(request) || !notify(request)) return;

        await options.player.seekTo(0);
        if (!isCurrent(request)) return;

        update({ ...state, pending: false });
        if (!notify(request) || !allowed(request)) return;
        options.player.play();
      } catch {
        if (isCurrent(request)) stop(true);
      } finally {
        if (pendingRequest === request) {
          // A cancelled seek only clears its own pending marker; it cannot restore a request.
          update({ ...state, pending: false });
          notify(revision);
          pendingRequest = null;
        }
      }
    },
    cancel() {
      stop(false);
    },
    fail() {
      stop(true);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      const request = ++revision;
      update({ ...state, requested: false });
      pause(request);
    },
  };
}
