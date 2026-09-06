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
  readonly state: FirstRunState;
}

const FirstRunExperienceContext = createContext<FirstRunExperienceValue | null>(null);

export function FirstRunExperienceProvider({ children }: PropsWithChildren) {
  const [state, reducerDispatch] = useReducer(reduceFirstRunState, initialFirstRunState);
  const dispatch = useCallback((action: FirstRunAction) => reducerDispatch(action), []);
  const value = useMemo(() => ({ dispatch, state }), [dispatch, state]);

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
