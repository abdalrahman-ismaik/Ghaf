import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CloudStudyView,
  type CloudStudyViewProps,
} from '../../src/components/cloud-study/CloudStudyView';

interface HookSlot {
  value?: unknown;
  dependencies?: readonly unknown[];
  effect?: () => void | (() => void);
  cleanup?: () => void;
}
const mock = vi.hoisted(() => ({
  cursor: 0,
  slots: [] as HookSlot[],
  effects: [] as (() => void)[],
  appListeners: new Set<(status: string) => void>(),
  createController: vi.fn(),
}));
vi.mock('react', async (original) => {
  const slot = () => (mock.slots[mock.cursor++] ??= {});
  const same = (a?: readonly unknown[], b?: readonly unknown[]) =>
    Boolean(
      a && b && a.length === b.length && a.every((value, index) => Object.is(value, b[index])),
    );
  return {
    ...(await original<typeof import('react')>()),
    useState(initial: unknown) {
      const current = slot();
      if (!('value' in current))
        current.value = typeof initial === 'function' ? initial() : initial;
      return [
        current.value,
        (next: unknown) => {
          current.value = typeof next === 'function' ? next(current.value) : next;
        },
      ];
    },
    useMemo(factory: () => unknown, dependencies: readonly unknown[]) {
      const current = slot();
      if (!same(current.dependencies, dependencies)) current.value = factory();
      current.dependencies = dependencies;
      return current.value;
    },
    useRef(initial: unknown) {
      const current = slot();
      current.value ??= { current: initial };
      return current.value;
    },
    useSyncExternalStore: (_subscribe: unknown, snapshot: () => unknown) => snapshot(),
    useEffect(effect: () => void | (() => void), dependencies: readonly unknown[]) {
      const current = slot();
      current.effect = effect;
      if (same(current.dependencies, dependencies)) return;
      current.dependencies = dependencies;
      mock.effects.push(() => {
        current.cleanup?.();
        current.cleanup = effect() || undefined;
      });
    },
  };
});
vi.mock('react-native', () => ({
  View: 'View',
  AppState: {
    addEventListener: (_event: string, listener: (status: string) => void) => {
      mock.appListeners.add(listener);
      return {
        remove: () => {
          mock.appListeners.delete(listener);
        },
      };
    },
  },
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/features/cloud-study', () => ({
  createCloudDocumentsController: mock.createController,
}));
vi.mock('@/components/study/StudyForm', () => ({ StudyForm: 'StudyForm' }));
vi.mock('@/components/study/StudyPlanCard', () => ({ StudyPlanCard: 'StudyPlanCard' }));
vi.mock('@/components/study/AcademicGoalCard', () => ({ AcademicGoalCard: 'AcademicGoalCard' }));
vi.mock('@/components/study/StudyPractice', () => ({ StudyPractice: 'StudyPractice' }));
vi.mock('@/components/study/shared', () => ({
  StudyButton: 'StudyButton',
  StudyText: 'StudyText',
  studyStyles: {},
}));
vi.mock('@/components/cloud-study/CloudFamilyDetails', () => ({
  CloudFamilyDetails: 'CloudFamilyDetails',
}));
vi.mock('@/components/cloud-study/CloudLearningView', () => ({
  CloudLearningView: 'CloudLearningView',
}));

const props: CloudStudyViewProps = {
  userId: '02000000-0000-4000-8000-000000000001',
  familyId: '02000000-0000-4000-8000-000000000002',
  role: 'parent',
  childId: null,
  childProfiles: [],
  service: { familyRequest: async () => [] },
};
function controller() {
  const state = {
    documents: null,
    loading: false,
    busy: false,
    error: null,
    saved: false,
    canRetry: false,
  };
  return {
    load: vi.fn().mockResolvedValue(true),
    dispose: vi.fn(),
    subscribe: vi.fn(),
    getSnapshot: () => state,
    update: vi.fn(),
    retry: vi.fn(),
  };
}
function render(input = props) {
  mock.cursor = 0;
  const element = CloudStudyView(input);
  (element.type as (value: CloudStudyViewProps) => ReactNode)(element.props);
  mock.effects.splice(0).forEach((effect) => effect());
}
function cleanup() {
  mock.slots.forEach((slot) => {
    slot.cleanup?.();
    slot.cleanup = undefined;
  });
}
describe('CloudStudyView controller lifetime', () => {
  beforeEach(() => {
    mock.cursor = 0;
    mock.slots = [];
    mock.effects = [];
    mock.appListeners.clear();
    mock.createController.mockReset();
  });
  it('keeps the current controller through effect replay and disposes on actual unmount', async () => {
    const current = controller();
    mock.createController.mockReturnValue(current);
    render();
    cleanup();
    mock.slots.forEach((slot) => {
      if (slot.effect) slot.cleanup = slot.effect() || undefined;
    });
    await Promise.resolve();
    expect(current.dispose).not.toHaveBeenCalled();
    expect(current.load).toHaveBeenCalledTimes(2);
    expect(mock.appListeners.size).toBe(1);
    mock.appListeners.forEach((listener) => listener('active'));
    expect(current.load).toHaveBeenCalledTimes(3);
    cleanup();
    await Promise.resolve();
    expect(current.dispose).toHaveBeenCalledOnce();
    expect(mock.appListeners.size).toBe(0);
  });
  it('disposes the replaced transport controller without disposing its replacement', async () => {
    const first = controller();
    const second = controller();
    mock.createController.mockReturnValueOnce(first).mockReturnValueOnce(second);
    render();
    render({ ...props, service: { familyRequest: async () => [] } });
    await Promise.resolve();
    expect(first.dispose).toHaveBeenCalledOnce();
    expect(second.dispose).not.toHaveBeenCalled();
    expect(second.load).toHaveBeenCalledOnce();
    expect(mock.appListeners.size).toBe(1);
    cleanup();
    await Promise.resolve();
    expect(second.dispose).toHaveBeenCalledOnce();
    expect(mock.appListeners.size).toBe(0);
  });
});
