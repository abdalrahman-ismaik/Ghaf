import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type PropsWithChildren,
} from 'react';

import {
  initialFirstRunState,
  reduceFirstRunState,
  type FirstRunAction,
  type FirstRunState,
} from './experienceModel';

interface FirstRunExperienceValue {
  readonly dispatch: (action: FirstRunAction) => void;
  readonly presentationReady: boolean;
  readonly state: FirstRunState;
}

const FirstRunExperienceContext = createContext<FirstRunExperienceValue | null>(null);

interface FirstRunExperienceProviderProps extends PropsWithChildren {
  readonly presentationReady: boolean;
}

export function FirstRunExperienceProvider({
  children,
  presentationReady,
}: FirstRunExperienceProviderProps) {
  const [state, reducerDispatch] = useReducer(reduceFirstRunState, initialFirstRunState);
  const dispatch = useCallback((action: FirstRunAction) => reducerDispatch(action), []);
  const value = useMemo(
    () => ({ dispatch, presentationReady, state }),
    [dispatch, presentationReady, state],
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
