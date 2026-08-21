import { afterEach, describe, expect, it, vi } from 'vitest';

import { serviceRegistry } from '../src/services';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('offline mock service flow', () => {
  it('resolves every external boundary deterministically without fetch', async () => {
    const fetchSpy = vi.fn(() =>
      Promise.reject(new Error('Network must not be used in mock mode')),
    );
    vi.stubGlobal('fetch', fetchSpy);

    const [mission, image, audio, generatedMission, impact, ghaf] = await Promise.all([
      serviceRegistry.mission.getActiveMission(),
      serviceRegistry.media.getPreparedImage(),
      serviceRegistry.media.getPreparedAudio(),
      serviceRegistry.ai.getPregeneratedMission(),
      serviceRegistry.impact.getSummary(),
      serviceRegistry.impact.getGhafProgress(),
    ]);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(mission.ok).toBe(true);
    expect(image.ok).toBe(true);
    expect(audio.ok).toBe(true);
    expect(generatedMission.ok).toBe(true);
    expect(impact).toEqual({
      ok: true,
      data: {
        rescuedGrams: 1_250,
        rescuedPortions: 5,
        completedMissions: 3,
        streakDays: 2,
      },
    });
    expect(ghaf).toMatchObject({ ok: true, data: { stage: 2, progressPercent: 48 } });

    if (mission.ok && generatedMission.ok) {
      expect(mission.data).toEqual(generatedMission.data);
      expect(mission.data.source).toBe('pregenerated-mock');
      expect(mission.data.steps).toHaveLength(3);
    }

    if (image.ok && audio.ok) {
      expect(image.data.kind).toBe('image');
      expect(audio.data.kind).toBe('audio');
      expect(image.data.source).toBe('prepared-demo');
      expect(audio.data.source).toBe('prepared-demo');
    }
  });

  it('returns equivalent fresh values rather than leaking mutable fixture state', async () => {
    const firstMission = await serviceRegistry.mission.getActiveMission();
    const secondMission = await serviceRegistry.mission.getActiveMission();
    const firstSession = serviceRegistry.prototypeSession.getInitialSession();
    const resetSession = serviceRegistry.prototypeSession.reset();

    expect(firstMission).toEqual(secondMission);
    expect(firstMission).not.toBe(secondMission);
    if (firstMission.ok && secondMission.ok) {
      expect(firstMission.data).not.toBe(secondMission.data);
      expect(firstMission.data.steps).not.toBe(secondMission.data.steps);
    }

    expect(firstSession).toEqual(resetSession);
    expect(firstSession).not.toBe(resetSession);
    expect(firstSession.mission).not.toBe(resetSession.mission);
    expect(firstSession.family).not.toBe(resetSession.family);
  });
});
