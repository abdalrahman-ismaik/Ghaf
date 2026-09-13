import { useEffect } from 'react';
import { AppState } from 'react-native';

import { serviceRegistry } from '@/services';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export function MessagingLifecycle() {
  useEffect(() => {
    const controller = serviceRegistry.familyMessaging.controller;
    const update = () => {
      const state = usePrototypeStore.getState();
      controller.setLocale(state.locale);
      controller.setLocalContext(
        `${state.demoEntryEpoch}:${state.activeExperience}:${state.activeChildId}:${state.journey?.lifecycle ?? 'none'}`,
        state.activeExperience === 'signed_out' ? null : state.activeExperience,
      );
    };
    update();
    const unsubscribe = usePrototypeStore.subscribe(update);
    controller.setForeground(
      AppState.currentState !== 'background' && AppState.currentState !== 'inactive',
    );
    const subscription = AppState.addEventListener('change', (state) =>
      controller.setForeground(state === 'active'),
    );
    return () => {
      unsubscribe();
      subscription.remove();
      controller.setForeground(false);
    };
  }, []);
  return null;
}
