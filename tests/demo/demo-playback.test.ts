import { describe, expect, it, vi } from 'vitest';

import {
  createDemoPlayback,
  type DemoPlaybackState,
} from '../../src/features/onboarding/demoPlayback';

function deferredSeek() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

function setup() {
  const player = {
    pause: vi.fn<() => void>(),
    seekTo: vi.fn(async (_seconds: number): Promise<void> => undefined),
    play: vi.fn<() => void>(),
  };
  const isAllowed = vi.fn(() => true);
  const onChange = vi.fn<(_state: DemoPlaybackState) => void>();
  const playback = createDemoPlayback({ player, isAllowed, onChange });
  return { player, isAllowed, onChange, playback };
}

const interruptions = ['cancel', 'fail', 'dispose'] as const;

describe('optional demo playback', () => {
  it('constructs silently and exposes an immutable initial snapshot', () => {
    const { player, isAllowed, onChange, playback } = setup();

    expect(playback.getState()).toEqual({
      pending: false,
      requested: false,
      unavailable: false,
    });
    expect(Object.isFrozen(playback.getState())).toBe(true);
    expect(isAllowed).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
    expect(player.pause).not.toHaveBeenCalled();
    expect(player.seekTo).not.toHaveBeenCalled();
    expect(player.play).not.toHaveBeenCalled();
  });

  it('starts only on explicit intent, pauses before seek, and supports explicit replay', async () => {
    const { player, playback } = setup();
    const operations: string[] = [];
    player.pause.mockImplementation(() => operations.push('pause'));
    player.seekTo.mockImplementation(async (seconds) => {
      operations.push(`seek:${seconds}`);
    });
    player.play.mockImplementation(() => operations.push('play'));

    await expect(playback.restart()).resolves.toBeUndefined();
    expect(operations).toEqual(['pause', 'seek:0', 'play']);
    expect(playback.getState()).toEqual({ pending: false, requested: true, unavailable: false });

    await playback.restart();
    expect(operations).toEqual(['pause', 'seek:0', 'play', 'pause', 'seek:0', 'play']);
  });

  it('denies playback while foreground or screen-reader permission is false', async () => {
    const { player, playback, isAllowed } = setup();
    isAllowed.mockReturnValue(false);

    await expect(playback.restart()).resolves.toBeUndefined();
    expect(player.seekTo).not.toHaveBeenCalled();
    expect(player.play).not.toHaveBeenCalled();
    expect(playback.getState()).toEqual({ pending: false, requested: false, unavailable: false });

    isAllowed.mockReturnValue(true);
    expect(player.play).not.toHaveBeenCalled();
    await playback.restart();
    expect(player.play).toHaveBeenCalledOnce();
  });

  it('coalesces rapid intents without overlapping seeks or queuing a later replay', async () => {
    const { player, playback } = setup();
    const seek = deferredSeek();
    player.seekTo.mockReturnValueOnce(seek.promise);

    const first = playback.restart();
    await Promise.all([playback.restart(), playback.restart(), playback.restart()]);
    expect(player.seekTo).toHaveBeenCalledOnce();
    expect(player.play).not.toHaveBeenCalled();
    expect(playback.getState()).toMatchObject({ pending: true, requested: true });

    seek.resolve();
    await first;
    expect(player.play).toHaveBeenCalledOnce();
    expect(player.seekTo).toHaveBeenCalledOnce();
  });

  it('cancels synchronously before pause and keeps the old seek locked until settlement', async () => {
    const { player, playback } = setup();
    const seek = deferredSeek();
    player.seekTo.mockReturnValueOnce(seek.promise);
    const first = playback.restart();
    player.pause.mockImplementation(() => {
      expect(playback.getState().requested).toBe(false);
    });

    expect(playback.cancel()).toBeUndefined();
    expect(playback.getState()).toMatchObject({ pending: true, requested: false });
    await playback.restart();
    expect(player.seekTo).toHaveBeenCalledOnce();
    seek.resolve();
    await first;
    expect(player.play).not.toHaveBeenCalled();
    expect(playback.getState()).toEqual({ pending: false, requested: false, unavailable: false });

    player.pause.mockReset();
    await playback.restart();
    expect(player.seekTo).toHaveBeenCalledTimes(2);
    expect(player.play).toHaveBeenCalledOnce();
  });

  it.each(interruptions)('never plays when a deferred seek settles after %s', async (action) => {
    const { player, playback, onChange } = setup();
    const seek = deferredSeek();
    player.seekTo.mockReturnValueOnce(seek.promise);
    const first = playback.restart();
    playback[action]();
    onChange.mockClear();

    seek.resolve();
    await expect(first).resolves.toBeUndefined();
    expect(player.play).not.toHaveBeenCalled();
    expect(playback.getState()).toMatchObject({ pending: false, requested: false });
    if (action === 'dispose') expect(onChange).not.toHaveBeenCalled();
    if (action === 'fail') expect(playback.getState().unavailable).toBe(true);
  });

  it('rechecks permission after a seek and does not resume when permission returns', async () => {
    const { player, playback, isAllowed } = setup();
    const seek = deferredSeek();
    player.seekTo.mockReturnValueOnce(seek.promise);
    const first = playback.restart();
    isAllowed.mockReturnValue(false);

    seek.resolve();
    await first;
    expect(player.play).not.toHaveBeenCalled();
    expect(playback.getState()).toMatchObject({ requested: false, unavailable: false });
    isAllowed.mockReturnValue(true);
    expect(player.play).not.toHaveBeenCalled();
  });

  it.each(['pause', 'seek', 'play', 'guard'] as const)(
    'contains a current %s failure, clears the request, and requires a new player',
    async (operation) => {
      const { player, playback, isAllowed } = setup();
      const failure = () => {
        throw new Error('unavailable audio');
      };
      if (operation === 'pause') player.pause.mockImplementation(failure);
      if (operation === 'seek') player.seekTo.mockRejectedValueOnce(new Error('decode failure'));
      if (operation === 'play') player.play.mockImplementation(failure);
      if (operation === 'guard') isAllowed.mockImplementation(failure);

      await expect(playback.restart()).resolves.toBeUndefined();
      expect(playback.getState()).toEqual({ pending: false, requested: false, unavailable: true });
      const seeks = player.seekTo.mock.calls.length;
      const plays = player.play.mock.calls.length;
      await expect(playback.restart()).resolves.toBeUndefined();
      expect(player.seekTo).toHaveBeenCalledTimes(seeks);
      expect(player.play).toHaveBeenCalledTimes(plays);
      if (operation !== 'play') expect(player.play).not.toHaveBeenCalled();
    },
  );

  it('also contains a synchronous seek throw', async () => {
    const { player, playback } = setup();
    player.seekTo.mockImplementationOnce(() => {
      throw new Error('released player');
    });

    await expect(playback.restart()).resolves.toBeUndefined();
    expect(playback.getState()).toMatchObject({ pending: false, unavailable: true });
    expect(player.play).not.toHaveBeenCalled();
  });

  it('ignores a rejected stale seek and permits only a later explicit retry', async () => {
    const { player, playback, onChange } = setup();
    const seek = deferredSeek();
    player.seekTo.mockReturnValueOnce(seek.promise);
    const first = playback.restart();
    expect(player.seekTo).toHaveBeenCalledOnce();
    playback.cancel();
    onChange.mockClear();

    seek.reject(new Error('old source failed'));
    await expect(first).resolves.toBeUndefined();
    expect(playback.getState()).toEqual({ pending: false, requested: false, unavailable: false });
    expect(onChange.mock.calls.every(([state]) => !state.unavailable)).toBe(true);
    expect(player.play).not.toHaveBeenCalled();
    await playback.restart();
    expect(player.play).toHaveBeenCalledOnce();
  });

  it.each(interruptions)('honors successful initial guard reentry through %s', async (action) => {
    const { player, playback, isAllowed } = setup();
    isAllowed.mockImplementationOnce(() => {
      playback[action]();
      return true;
    });

    await expect(playback.restart()).resolves.toBeUndefined();
    expect(player.seekTo).not.toHaveBeenCalled();
    expect(player.play).not.toHaveBeenCalled();
    expect(playback.getState().requested).toBe(false);
  });

  it.each(interruptions)('honors successful pre-play guard reentry through %s', async (action) => {
    const { player, playback, isAllowed } = setup();
    let afterSeek = false;
    player.seekTo.mockImplementation(async () => {
      afterSeek = true;
    });
    isAllowed.mockImplementation(() => {
      if (afterSeek) playback[action]();
      return true;
    });

    await expect(playback.restart()).resolves.toBeUndefined();
    expect(player.seekTo).toHaveBeenCalledOnce();
    expect(player.play).not.toHaveBeenCalled();
    expect(playback.getState().requested).toBe(false);
  });

  it.each(interruptions)(
    'honors successful loading observer reentry through %s',
    async (action) => {
      const { player, playback, onChange } = setup();
      onChange.mockImplementation((state) => {
        if (state.pending && state.requested) playback[action]();
      });

      await expect(playback.restart()).resolves.toBeUndefined();
      expect(player.seekTo).not.toHaveBeenCalled();
      expect(player.play).not.toHaveBeenCalled();
      expect(playback.getState().requested).toBe(false);
    },
  );

  it.each(interruptions)(
    'honors successful post-seek observer reentry through %s',
    async (action) => {
      const { player, playback, onChange } = setup();
      onChange.mockImplementation((state) => {
        if (!state.pending && state.requested) playback[action]();
      });

      await expect(playback.restart()).resolves.toBeUndefined();
      expect(player.seekTo).toHaveBeenCalledOnce();
      expect(player.play).not.toHaveBeenCalled();
      expect(playback.getState().requested).toBe(false);
    },
  );

  it.each(['guard', 'observer'] as const)(
    'coalesces synchronous restart from a %s',
    async (callback) => {
      const { player, playback, isAllowed, onChange } = setup();
      const nested: Promise<void>[] = [];
      if (callback === 'guard') {
        isAllowed.mockImplementation(() => {
          nested.push(playback.restart());
          return true;
        });
      } else {
        onChange.mockImplementation(() => {
          nested.push(playback.restart());
        });
      }

      await playback.restart();
      await Promise.all(nested);
      expect(nested.length).toBeGreaterThan(0);
      expect(player.seekTo).toHaveBeenCalledOnce();
      expect(player.play).toHaveBeenCalledOnce();
    },
  );

  it.each(interruptions)(
    'rechecks successful pause reentry through %s before seeking',
    async (action) => {
      const { player, playback } = setup();
      player.pause.mockImplementationOnce(() => playback[action]());

      await expect(playback.restart()).resolves.toBeUndefined();
      expect(player.seekTo).not.toHaveBeenCalled();
      expect(player.play).not.toHaveBeenCalled();
    },
  );

  it.each(['guard', 'observer', 'pause'] as const)(
    'ignores a stale %s exception after synchronous cancellation',
    async (callback) => {
      const { player, playback, isAllowed, onChange } = setup();
      const cancelThenThrow = () => {
        playback.cancel();
        throw new Error('old request failed');
      };
      if (callback === 'guard') isAllowed.mockImplementationOnce(cancelThenThrow);
      if (callback === 'observer') onChange.mockImplementationOnce(cancelThenThrow);
      if (callback === 'pause') player.pause.mockImplementationOnce(cancelThenThrow);

      await expect(playback.restart()).resolves.toBeUndefined();
      expect(playback.getState()).toEqual({ pending: false, requested: false, unavailable: false });
      expect(player.seekTo).not.toHaveBeenCalled();
      expect(player.play).not.toHaveBeenCalled();
      await playback.restart();
      expect(player.play).toHaveBeenCalledOnce();
    },
  );

  it.each(['loading', 'ready'] as const)(
    'fails closed when the %s observer throws',
    async (phase) => {
      const { player, playback, onChange } = setup();
      onChange.mockImplementation((state) => {
        if (state.requested && state.pending === (phase === 'loading')) {
          throw new Error('screen update failed');
        }
      });

      await expect(playback.restart()).resolves.toBeUndefined();
      expect(playback.getState()).toEqual({ pending: false, requested: false, unavailable: true });
      expect(player.play).not.toHaveBeenCalled();
    },
  );

  it('contains a repeatedly throwing observer and failure callback without rearming playback', async () => {
    const { player, playback, onChange } = setup();
    const nested: Promise<void>[] = [];
    onChange.mockImplementation((state) => {
      if (state.unavailable) nested.push(playback.restart());
      throw new Error('observer failed');
    });

    await expect(playback.restart()).resolves.toBeUndefined();
    await Promise.all(nested);
    expect(playback.getState()).toMatchObject({ requested: false, unavailable: true });
    expect(player.seekTo).not.toHaveBeenCalled();
    expect(player.play).not.toHaveBeenCalled();
  });

  it('rechecks permission after the ready observer, immediately before play', async () => {
    const { player, playback, onChange, isAllowed } = setup();
    onChange.mockImplementation((state) => {
      if (!state.pending && state.requested) isAllowed.mockReturnValue(false);
    });

    await playback.restart();
    expect(player.seekTo).toHaveBeenCalledOnce();
    expect(player.play).not.toHaveBeenCalled();
    expect(playback.getState().requested).toBe(false);
  });

  it('keeps previous snapshots immutable as loading, cancellation and settlement progress', async () => {
    const { player, playback, onChange } = setup();
    const initial = playback.getState();
    const seek = deferredSeek();
    player.seekTo.mockReturnValueOnce(seek.promise);
    const first = playback.restart();
    const loading = playback.getState();

    expect(() => Object.assign(loading, { requested: false })).toThrow();
    playback.cancel();
    seek.resolve();
    await first;

    expect(initial).toEqual({ pending: false, requested: false, unavailable: false });
    expect(loading).toEqual({ pending: true, requested: true, unavailable: false });
    expect(onChange.mock.calls.every(([state]) => Object.isFrozen(state))).toBe(true);
    expect(playback.getState().requested).toBe(false);
  });

  it('contains repeated cancellation and its pause failures without blocking the caller', async () => {
    const { player, playback } = setup();
    await playback.restart();
    player.pause.mockImplementation(() => {
      throw new Error('output disappeared');
    });

    expect(() => {
      playback.cancel();
      playback.cancel();
      playback.fail();
      playback.fail();
    }).not.toThrow();
    expect(playback.getState()).toEqual({ pending: false, requested: false, unavailable: true });
  });

  it('keeps Stop authoritative when its observer cancels again and requests a replay', async () => {
    const { player, playback, onChange } = setup();
    await playback.restart();
    const nested: Promise<void>[] = [];
    onChange.mockImplementation((state) => {
      if (!state.requested) {
        playback.cancel();
        nested.push(playback.restart());
      }
    });

    playback.cancel();
    await Promise.all(nested);
    expect(nested).toHaveLength(1);
    expect(playback.getState()).toEqual({ pending: false, requested: false, unavailable: false });
    expect(player.seekTo).toHaveBeenCalledOnce();
    expect(player.play).toHaveBeenCalledOnce();

    await playback.restart();
    expect(player.play).toHaveBeenCalledTimes(2);
  });

  it('invalidates a current native error before pause and never rearms that player', async () => {
    const { player, playback } = setup();
    await playback.restart();
    player.pause.mockImplementationOnce(() => {
      expect(playback.getState()).toMatchObject({ requested: false, unavailable: true });
    });

    expect(() => playback.fail()).not.toThrow();
    expect(playback.getState()).toEqual({ pending: false, requested: false, unavailable: true });
    await playback.restart();
    expect(player.seekTo).toHaveBeenCalledOnce();
    expect(player.play).toHaveBeenCalledOnce();
  });

  it('makes disposal permanent and idempotent even when pause throws', async () => {
    const { player, playback, onChange, isAllowed } = setup();
    const seek = deferredSeek();
    player.seekTo.mockReturnValueOnce(seek.promise);
    const first = playback.restart();
    expect(player.seekTo).toHaveBeenCalledOnce();
    player.pause.mockImplementation(() => {
      throw new Error('disposed native object');
    });
    expect(() => playback.dispose()).not.toThrow();
    const pauses = player.pause.mock.calls.length;
    onChange.mockClear();
    isAllowed.mockClear();

    playback.dispose();
    playback.cancel();
    playback.fail();
    await playback.restart();
    seek.reject(new Error('retired seek'));
    await expect(first).resolves.toBeUndefined();

    expect(player.pause).toHaveBeenCalledTimes(pauses);
    expect(player.seekTo).toHaveBeenCalledOnce();
    expect(player.play).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
    expect(isAllowed).not.toHaveBeenCalled();
    expect(playback.getState()).toMatchObject({ pending: false, requested: false });
  });
});
