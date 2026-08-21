import { create } from 'zustand';

import {
  coerceLocale,
  getLocaleDirection,
  type PrototypeRole,
  type PrototypeSession,
  type TextDirection,
} from '../models/prototype';
import { serviceRegistry } from '../services';

export interface PrototypeStoreState extends PrototypeSession {
  readonly direction: TextDirection;
  readonly setLocale: (value: unknown) => void;
  readonly setRole: (role: PrototypeRole) => void;
  readonly switchRole: () => void;
  readonly resetDemo: () => void;
}

function sessionState(session: PrototypeSession): PrototypeSession & {
  direction: TextDirection;
} {
  const locale = coerceLocale(session.locale);
  return {
    ...session,
    locale,
    direction: getLocaleDirection(locale),
  };
}

export const usePrototypeStore = create<PrototypeStoreState>((set) => ({
  ...sessionState(serviceRegistry.prototypeSession.getInitialSession()),
  setLocale: (value) => {
    const locale = coerceLocale(value);
    set({ locale, direction: getLocaleDirection(locale) });
  },
  setRole: (role) => set({ role }),
  switchRole: () =>
    set((state) => ({
      role: state.role === 'parent' ? 'child' : 'parent',
    })),
  resetDemo: () => set(sessionState(serviceRegistry.prototypeSession.reset())),
}));
