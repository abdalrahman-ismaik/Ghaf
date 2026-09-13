import { describe, expect, it, vi } from 'vitest';

import { createOnboardingPlayback, runOptionalAudio } from '../../src/features/onboarding/playback';

function deferredSeek() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function setup() {
  const player = {
    pause: vi.fn(),
    play: vi.fn(),
    seekTo: vi.fn(async (_seconds: number): Promise<void> => undefined),
  };
  const playback = createOnboardingPlayback(player);
  return { player, playback };
}

describe('prepared onboarding playback lifecycle', () => {
  it('contains unavailable ambience configuration, playback, and cleanup failures', () => {
    const unavailable = () => {
      throw new Error('released native audio object');
    };
    const player = {
      set loop(_value: boolean) {
        unavailable();
      },
      set volume(_value: number) {
        unavailable();
      },
      play: unavailable,
      pause: unavailable,
    };
    for (const operation of [
      () => {
        player.loop = true;
      },
      () => {
        player.volume = 0.08;
      },
      () => player.play(),
      () => player.pause(),
    ]) {
      expect(() => runOptionalAudio(operation)).not.toThrow();
    }
  });

  it('stays silent until the screen and accessibility state permit playback', async () => {
    const { player, playback } = setup();
    await playback.restart();
    expect(player.seekTo).not.toHaveBeenCalled();
    expect(player.play).not.toHaveBeenCalled();

    playback.setEnabled(true);
    await playback.restart();
    expect(player.seekTo).toHaveBeenCalledWith(0);
    expect(player.play).toHaveBeenCalledOnce();
  });

  it('cancels a pending replay when the slide exits or accessibility blocks audio', async () => {
    const { player, playback } = setup();
    const seek = deferredSeek();
    player.seekTo.mockReturnValueOnce(seek.promise);
    playback.setEnabled(true);
    const replay = playback.restart();
    playback.setEnabled(false);
    seek.resolve();
    await replay;

    expect(player.play).not.toHaveBeenCalled();
    await playback.restart();
    expect(player.seekTo).toHaveBeenCalledOnce();
  });

  it('does not revive an old replay when the next screen becomes ready', async () => {
    const { player, playback } = setup();
    const seek = deferredSeek();
    player.seekTo.mockReturnValueOnce(seek.promise);
    playback.setEnabled(true);
    const stale = playback.restart();
    playback.setEnabled(false);
    playback.setEnabled(true);
    await playback.restart();
    seek.resolve();
    await stale;

    expect(player.play).toHaveBeenCalledOnce();
  });

  it('plays only the newest replay when seeks settle out of order', async () => {
    const { player, playback } = setup();
    const first = deferredSeek();
    const second = deferredSeek();
    player.seekTo.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    playback.setEnabled(true);
    const stale = playback.restart();
    const current = playback.restart();
    second.resolve();
    await current;
    first.resolve();
    await stale;

    expect(player.play).toHaveBeenCalledOnce();
  });

  it('keeps cancellation and failed playback nonblocking after a player is released', async () => {
    const { player, playback } = setup();
    playback.setEnabled(true);
    player.pause.mockImplementation(() => {
      throw new Error('released player');
    });
    expect(() => playback.setEnabled(false)).not.toThrow();
    await expect(playback.restart()).resolves.toBeUndefined();
    expect(player.play).not.toHaveBeenCalled();
  });

  it('contains seek and playback failures without blocking a later retry', async () => {
    const { player, playback } = setup();
    playback.setEnabled(true);
    player.seekTo.mockRejectedValueOnce(new Error('unavailable audio'));
    await expect(playback.restart()).resolves.toBeUndefined();
    expect(player.play).not.toHaveBeenCalled();
    player.play.mockImplementationOnce(() => {
      throw new Error('unavailable output');
    });
    await expect(playback.restart()).resolves.toBeUndefined();
    await playback.restart();
    expect(player.play).toHaveBeenCalledTimes(2);
  });
});
