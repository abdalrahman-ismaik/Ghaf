import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type PropsWithChildren,
} from 'react';

import { entryMode } from '@/config/demoEntry';
import { serviceRegistry } from '@/services';
import { usePrototypeStore } from '@/state/usePrototypeStore';

import {
  initialFirstRunState,
  reduceFirstRunState,
  type FirstRunAction,
  type FirstRunState,
} from './experienceModel';

interface FirstRunExperienceValue {
  readonly completionSaveFailed: boolean;
  readonly continueWithoutSaving: () => void;
  readonly dispatch: (action: FirstRunAction) => void;
  readonly presentationReady: boolean;
  readonly state: FirstRunState;
}

const FirstRunExperienceContext = createContext<FirstRunExperienceValue | null>(null);

interface FirstRunExperienceProviderProps extends PropsWithChildren {
  readonly presentationReady: boolean;
}

interface FirstRunSnapshot {
  readonly generation: number;
  readonly state: FirstRunState;
  readonly completionLoaded: boolean;
  readonly completionSaveFailed: boolean;
}

function createFirstRunStore(generation: number) {
  const initialSnapshot: FirstRunSnapshot = {
    generation,
    state: initialFirstRunState,
    completionLoaded: false,
    completionSaveFailed: false,
  };
  let snapshot = initialSnapshot;
  const listeners = new Set<() => void>();
  const publish = (next: FirstRunSnapshot) => {
    snapshot = next;
    for (const listener of listeners) listener();
  };

  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => initialSnapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (!snapshot.completionLoaded) {
        // Storage is read only when React subscribes after the initial render or hydration.
        const saved = entryMode === 'demo' ? null : serviceRegistry.onboardingCompletion.read();
        publish({
          ...snapshot,
          state: { ...initialFirstRunState, completed: saved?.ok === true && saved.completed },
          completionLoaded: true,
        });
      }
      return () => {
        listeners.delete(listener);
      };
    },
    dispatch(action: FirstRunAction) {
      if (!snapshot.completionLoaded) return;
      const current = snapshot.state;
      const next = reduceFirstRunState(current, action);
      if (!current.completed && next.completed && entryMode !== 'demo') {
        const saved = serviceRegistry.onboardingCompletion.complete();
        if (!saved.ok || !saved.completed) {
          publish({ ...snapshot, completionSaveFailed: true });
          return;
        }
      }
      publish({ ...snapshot, state: next, completionSaveFailed: false });
    },
    continueWithoutSaving() {
      if (!snapshot.completionSaveFailed) return;
      publish({
        ...snapshot,
        state: { ...snapshot.state, completed: true },
        completionSaveFailed: false,
      });
    },
  };
}

export function FirstRunExperienceProvider({
  children,
  presentationReady,
}: FirstRunExperienceProviderProps) {
  const resetSequence = usePrototypeStore((snapshot) => snapshot.growthJourney.resetSequence);
  // A committed reset replaces only this session store; the route tree stays mounted.
  const store = useMemo(() => createFirstRunStore(resetSequence), [resetSequence]);
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  const value = useMemo(
    () => ({
      completionSaveFailed: snapshot.completionSaveFailed,
      continueWithoutSaving: store.continueWithoutSaving,
      dispatch: store.dispatch,
      presentationReady: presentationReady && snapshot.completionLoaded,
      state: snapshot.state,
    }),
    [presentationReady, snapshot, store],
  );

  return (
    <FirstRunExperienceContext.Provider value={value}>
      {children}
    </FirstRunExperienceContext.Provider>
  );
}

export function useFirstRunExperience(): FirstRunExperienceValue {
  const value = useContext(FirstRunExperienceContext);
  if (!value) throw new Error('First-run experience must be used inside its provider.');
  return value;
}
