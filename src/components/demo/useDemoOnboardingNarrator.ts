import { createAudioPlayer, type AudioPlayer, type AudioStatus } from 'expo-audio';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, Platform } from 'react-native';

import {
  createDemoPlayback,
  type DemoPlaybackController,
} from '@/features/onboarding/demoPlayback';
import type { LocaleCode } from '@/models/familyGrowth';

import { getDemoNarrationSource } from './demoNarrationSources';
import type { DemoNarrationControls, DemoStoryStep } from './types';

interface NarratorOptions {
  readonly locale: LocaleCode;
  readonly step: DemoStoryStep | null;
  readonly active: boolean;
  readonly runGeneration: number;
  readonly entryEpoch: number;
}

interface Session {
  readonly key: string;
  player: AudioPlayer | null;
  playerId: string | null;
  controller: DemoPlaybackController | null;
  subscription: { remove(): void } | null;
  deadline: ReturnType<typeof setTimeout> | null;
  started: boolean;
  retired: boolean;
}

const startupTimeout = 10_000;

function attempt(action: () => void): boolean {
  try {
    action();
    return true;
  } catch {
    return false;
  }
}

export function useDemoOnboardingNarrator({
  locale,
  step,
  active,
  runGeneration,
  entryEpoch,
}: NarratorOptions): DemoNarrationControls & { readonly cancel: () => void } {
  const validScope =
    Number.isSafeInteger(runGeneration) &&
    runGeneration >= 0 &&
    Number.isSafeInteger(entryEpoch) &&
    entryEpoch >= 0;
  const source = getDemoNarrationSource(locale, step, active && validScope);
  const key = `${locale}:${step}:${active}:${runGeneration}:${entryEpoch}:${source}`;
  const scope = useRef({ key, source });
  const mounted = useRef(false);
  const session = useRef<Session | null>(null);
  const creating = useRef(false);
  const retiring = useRef(false);
  const failed = useRef(false);
  const played = useRef(false);
  const environment = useRef({
    appActive: false,
    appObserved: false,
    reader: null as boolean | null,
    readerObserved: false,
  });
  const [permissions, setPermissions] = useState(environment.current);
  const [display, setDisplay] = useState<DemoNarrationControls['status']>('silent');
  const [replay, setReplay] = useState(false);

  const publish = useCallback((status: DemoNarrationControls['status']) => {
    if (mounted.current) {
      setDisplay(status);
      setReplay(played.current);
    }
  }, []);

  const retire = useCallback(
    (expected?: Session, unavailable = false, notify = true) => {
      const current = session.current;
      if (expected && current !== expected) return;
      session.current = null;
      const alreadyRetiring = retiring.current;
      retiring.current = true;
      let clean = true;
      if (current && !current.retired) {
        // Invalidate before any external operation can emit a reentrant status callback.
        current.retired = true;
        if (current.deadline !== null) clearTimeout(current.deadline);
        current.deadline = null;
        if (current.controller) {
          clean = attempt(() => current.controller!.cancel()) && clean;
          clean = attempt(() => current.controller!.dispose()) && clean;
        } else if (current.player) {
          clean = attempt(() => current.player!.pause()) && clean;
        }
        if (current.subscription) clean = attempt(() => current.subscription!.remove()) && clean;
        if (current.player) {
          clean = attempt(() => current.player!.remove()) && clean;
          clean = attempt(() => current.player!.release()) && clean;
        }
      }
      failed.current = failed.current || unavailable || !clean;
      retiring.current = alreadyRetiring;
      if (notify) publish(failed.current ? 'unavailable' : 'silent');
    },
    [publish],
  );

  const permitted = useCallback((expectedKey: string) => {
    const env = environment.current;
    return (
      mounted.current &&
      scope.current.key === expectedKey &&
      scope.current.source !== null &&
      env.appObserved &&
      env.appActive &&
      env.readerObserved &&
      env.reader === false &&
      !failed.current
    );
  }, []);

  const isCurrent = useCallback(
    (current: Session) => session.current === current && !current.retired && permitted(current.key),
    [permitted],
  );

  useLayoutEffect(() => {
    scope.current = { key, source };
    mounted.current = true;
    failed.current = false;
    played.current = false;
    publish('silent');
    return () => {
      mounted.current = false;
      retire(undefined, false, false);
    };
  }, [key, source, publish, retire]);

  useEffect(() => {
    let alive = true;
    let readerRevision = 0;
    let appSubscription: { remove(): void } | undefined;
    let readerSubscription: { remove(): void } | undefined;
    const announce = () => {
      if (alive && mounted.current) setPermissions({ ...environment.current });
    };
    environment.current = {
      appActive: false,
      appObserved: false,
      reader: null,
      readerObserved: false,
    };
    try {
      environment.current.appActive = AppState.currentState === 'active';
      appSubscription = AppState.addEventListener('change', (state) => {
        if (!alive) return;
        environment.current.appActive = state === 'active';
        if (!environment.current.appActive) retire();
        announce();
      });
      if (typeof appSubscription?.remove !== 'function')
        throw new Error('App state observer unavailable');
      environment.current.appObserved = true;
    } catch {
      environment.current.appObserved = false;
      environment.current.appActive = false;
      retire();
    }
    try {
      // React Native Web cannot determine whether a screen reader is active.
      if (Platform.OS === 'web') throw new Error('Screen reader detection unavailable');
      readerSubscription = AccessibilityInfo.addEventListener('screenReaderChanged', (enabled) => {
        if (!alive) return;
        readerRevision += 1;
        environment.current.reader = typeof enabled === 'boolean' ? enabled : null;
        if (environment.current.reader !== false) retire();
        announce();
      });
      if (typeof readerSubscription?.remove !== 'function')
        throw new Error('Screen reader observer unavailable');
      environment.current.readerObserved = true;
      const queryRevision = readerRevision;
      Promise.resolve(AccessibilityInfo.isScreenReaderEnabled()).then(
        (enabled) => {
          if (!alive || readerRevision !== queryRevision) return;
          environment.current.reader = typeof enabled === 'boolean' ? enabled : null;
          if (environment.current.reader !== false) retire();
          announce();
        },
        () => {
          if (!alive || readerRevision !== queryRevision) return;
          environment.current.reader = null;
          retire();
          announce();
        },
      );
    } catch {
      environment.current.readerObserved = false;
      environment.current.reader = null;
      retire();
    }
    announce();
    return () => {
      alive = false;
      environment.current = {
        appActive: false,
        appObserved: false,
        reader: null,
        readerObserved: false,
      };
      retire(undefined, false, false);
      if (appSubscription) attempt(() => appSubscription?.remove());
      if (readerSubscription) attempt(() => readerSubscription?.remove());
    };
  }, [retire]);

  const start = useCallback(() => {
    if (
      !permitted(key) ||
      creating.current ||
      retiring.current ||
      (session.current && !session.current.started) ||
      session.current?.controller?.getState().pending
    )
      return;
    if (session.current) retire();
    if (!permitted(key)) return;
    const current: Session = {
      key,
      player: null,
      playerId: null,
      controller: null,
      subscription: null,
      deadline: null,
      started: false,
      retired: false,
    };
    session.current = current;
    creating.current = true;
    publish('loading');
    current.deadline = setTimeout(() => {
      if (session.current === current && !current.started) retire(current, true);
    }, startupTimeout);
    try {
      const player = createAudioPlayer(scope.current.source, {
        downloadFirst: false,
        updateInterval: 100,
      });
      current.player = player;
      if (!isCurrent(current)) {
        attempt(() => player.pause());
        attempt(() => player.remove());
        attempt(() => player.release());
        return;
      }
      current.playerId = player.id;
      if (!isCurrent(current)) return;
      player.loop = false;
      if (!isCurrent(current)) return;
      player.volume = 1;
      if (!isCurrent(current)) return;
      current.controller = createDemoPlayback({
        player,
        isAllowed: () => isCurrent(current),
        onChange: (state) => {
          if (session.current !== current || current.retired) return;
          if (state.unavailable) retire(current, true);
          else if (!state.requested) retire(current);
        },
      });
      const onStatus = (status: AudioStatus) => {
        if (session.current !== current || current.retired || status.id !== current.playerId)
          return;
        if (!isCurrent(current)) {
          retire(current);
          return;
        }
        if (status.error || status.mediaServicesDidReset) {
          retire(current, true);
          return;
        }
        if (status.didJustFinish) {
          retire(current);
          return;
        }
        if (status.playing && status.isLoaded && !status.isBuffering) {
          if (!current.controller?.getState().requested) {
            retire(current, true);
            return;
          }
          current.started = true;
          played.current = true;
          if (current.deadline !== null) clearTimeout(current.deadline);
          current.deadline = null;
          publish('playing');
        } else if (current.started) {
          retire(current);
        }
      };
      const subscription = player.addListener('playbackStatusUpdate', onStatus);
      if (!isCurrent(current)) {
        attempt(() => subscription.remove());
        return;
      }
      current.subscription = subscription;
      onStatus(player.currentStatus);
      if (isCurrent(current)) void current.controller.restart();
    } catch {
      if (session.current === current) retire(current, true);
    } finally {
      creating.current = false;
    }
  }, [key, permitted, retire, publish, isCurrent]);

  const cancel = useCallback(() => retire(), [retire]);
  const allowed =
    source !== null &&
    permissions.appObserved &&
    permissions.appActive &&
    permissions.readerObserved &&
    permissions.reader === false;
  const status = !allowed ? 'unavailable' : display;
  const stoppable = status === 'loading' || status === 'playing';
  return {
    status,
    canPlay: allowed && status === 'silent',
    canStop: stoppable,
    canReplay: allowed && status !== 'loading' && status !== 'unavailable' && replay,
    screenReaderActive: permissions.reader === true,
    onPlay: start,
    onStop: cancel,
    onReplay: start,
    cancel,
  };
}
