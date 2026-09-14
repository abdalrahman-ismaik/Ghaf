import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

import { createWorkspaceController } from '@/features/pilot/workspaceController';
import type { ParentAccountService } from '@/models/parentAccount';

import { AccountWorkspaceView } from './AccountWorkspaceView';

export function AccountWorkspaceBoundary({
  service,
  userId,
}: {
  readonly service: ParentAccountService;
  readonly userId: string;
}) {
  const [controller] = useState(() => createWorkspaceController(service, userId));
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  const lifetime = useRef(0);
  useEffect(() => {
    lifetime.current += 1;
    void controller.load();
    const listener = AppState.addEventListener('change', (next) => {
      if (next === 'active') void controller.load();
    });
    return () => {
      listener.remove();
      const cleanup = ++lifetime.current;
      void Promise.resolve().then(() => {
        if (cleanup === lifetime.current) controller.dispose();
      });
    };
  }, [controller]);
  return <AccountWorkspaceView controller={controller} state={state} />;
}
