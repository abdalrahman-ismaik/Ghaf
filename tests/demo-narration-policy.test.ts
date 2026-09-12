import { describe, expect, it, vi } from 'vitest';

import { isDemoNarrationAllowed } from '../src/features/onboarding/demoNarrationPolicy';
import { createDemoPlayback } from '../src/features/onboarding/demoPlayback';

const unknownReader = Object.freeze({
  appActive: true,
  appObserved: true,
  reader: null,
  readerObserved: false,
});

describe('demo narration environment policy', () => {
  it('allows foreground web intent without pretending screen-reader detection succeeded', () => {
    expect(isDemoNarrationAllowed(unknownReader, true)).toBe(true);
    expect(unknownReader.reader).toBeNull();
    expect(unknownReader.readerObserved).toBe(false);
    expect(isDemoNarrationAllowed(unknownReader, false)).toBe(false);
  });

  it.each([
    { reader: null, readerObserved: false },
    { reader: null, readerObserved: true },
    { reader: false, readerObserved: false },
    { reader: true, readerObserved: false },
    { reader: true, readerObserved: true },
  ])('fails closed on native without a known disabled reader: %j', (readerState) => {
    expect(isDemoNarrationAllowed({ ...unknownReader, ...readerState }, false)).toBe(false);
  });

  it.each([false, true])('denies a known active reader on web=%s', (isWeb) => {
    expect(
      isDemoNarrationAllowed({ ...unknownReader, reader: true, readerObserved: true }, isWeb),
    ).toBe(false);
  });

  it.each([false, true])('requires active and observed foreground on web=%s', (isWeb) => {
    const environment = { ...unknownReader, reader: false, readerObserved: true };
    expect(isDemoNarrationAllowed(environment, isWeb)).toBe(true);
    expect(isDemoNarrationAllowed({ ...environment, appActive: false }, isWeb)).toBe(false);
    expect(isDemoNarrationAllowed({ ...environment, appObserved: false }, isWeb)).toBe(false);
    expect(
      isDemoNarrationAllowed({ ...environment, appActive: false, appObserved: false }, isWeb),
    ).toBe(false);
  });

  it('keeps the web controller silent until explicit intent, and Stop requires another intent', async () => {
    const player = {
      pause: vi.fn(),
      seekTo: vi.fn(async () => undefined),
      play: vi.fn(),
    };
    const controller = createDemoPlayback({
      player,
      isAllowed: () => isDemoNarrationAllowed(unknownReader, true),
      onChange: () => undefined,
    });
    await Promise.resolve();
    expect(player.play).not.toHaveBeenCalled();

    await controller.restart();
    expect(player.play).toHaveBeenCalledOnce();
    controller.cancel();
    await Promise.resolve();
    expect(player.play).toHaveBeenCalledOnce();
    expect(controller.getState().requested).toBe(false);

    await controller.restart();
    expect(player.play).toHaveBeenCalledTimes(2);
  });

  it('denies a pending web start after foreground loss and never resumes on return', async () => {
    let settleSeek!: () => void;
    const environment: {
      appActive: boolean;
      appObserved: boolean;
      reader: boolean | null;
      readerObserved: boolean;
    } = { ...unknownReader };
    const player = {
      pause: vi.fn(),
      seekTo: vi.fn(() => new Promise<void>((resolve) => (settleSeek = resolve))),
      play: vi.fn(),
    };
    const controller = createDemoPlayback({
      player,
      isAllowed: () => isDemoNarrationAllowed(environment, true),
      onChange: () => undefined,
    });

    const pendingStart = controller.restart();
    environment.appActive = false;
    settleSeek();
    await pendingStart;
    expect(player.play).not.toHaveBeenCalled();
    expect(controller.getState().requested).toBe(false);

    environment.appActive = true;
    await Promise.resolve();
    expect(player.play).not.toHaveBeenCalled();
    expect(environment.reader).toBeNull();
    expect(environment.readerObserved).toBe(false);
  });
});
