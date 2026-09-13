import { createRequire } from 'node:module';

import { createElement, type ComponentType, type ReactNode, type SetStateAction } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ServiceResult } from '@/services/interfaces';
import type { EntryResetNavigation } from '@/utils/navigation';

interface HostProps {
  children?: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
  onPress?: () => void;
  testID?: string;
}

interface SuccessProps {
  onSecondary: () => void;
  visible: boolean;
}

const rendered = vi.hoisted(() => ({
  controls: new Map<string, HostProps>(),
  success: null as SuccessProps | null,
  stateSlots: [] as unknown[],
  stateCursor: 0,
  translate: (key: string, _values?: Record<string, unknown>): string => key,
  router: { dismissAll: vi.fn(), dismissTo: vi.fn(), replace: vi.fn() },
  navigation: {
    getRootState: vi.fn<EntryResetNavigation['getRootState']>(),
    resetRoot: vi.fn<EntryResetNavigation['resetRoot']>(),
  },
}));

function host(tag: 'main' | 'div' | 'span' | 'button', props: HostProps) {
  if (props.onPress && props.testID) rendered.controls.set(props.testID, props);
  return createElement(
    tag,
    { 'data-testid': props.testID },
    props.header,
    props.children,
    props.footer,
  );
}

// Keep local UI state across server renders; only actual route callbacks update these slots.
// The domain store, approval, authority and sign-out commands remain real.
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useState: <T,>(initial: T | (() => T)) => {
    const slot = rendered.stateCursor++;
    if (!(slot in rendered.stateSlots)) {
      rendered.stateSlots[slot] = typeof initial === 'function' ? (initial as () => T)() : initial;
    }
    return [
      rendered.stateSlots[slot] as T,
      (next: SetStateAction<T>) => {
        rendered.stateSlots[slot] =
          typeof next === 'function'
            ? (next as (previous: T) => T)(rendered.stateSlots[slot] as T)
            : next;
      },
    ];
  },
}));
vi.mock('expo-router', () => ({
  useRouter: () => rendered.router,
  useNavigationContainerRef: () => rendered.navigation,
}));
vi.mock('react-native', () => ({
  BackHandler: { addEventListener: vi.fn() },
  Platform: { OS: 'web', select: (options: Record<string, unknown>) => options.default },
  StyleSheet: { create: <T,>(styles: T) => styles, hairlineWidth: 1 },
  View: (props: HostProps) => host('div', props),
}));
vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
vi.mock('expo-crypto', () => ({ randomUUID: () => 'prepared-task-handoff-test' }));
vi.mock('react-i18next', () => ({
  initReactI18next: { type: '3rdParty', init: () => undefined },
  useTranslation: () => ({ t: rendered.translate }),
}));
vi.mock('@/components/primitives', () => ({
  Button: (props: HostProps) => host('button', props),
  Text: (props: HostProps) => host('span', props),
}));
vi.mock('@/components/family-growth/ParentVoicePermissionPanel', () => ({
  ParentVoicePermissionPanel: () => null,
}));
vi.mock('@/components/family-growth/TaskPanels', () => ({ SafetyBoundary: () => null }));
vi.mock('@/components/r002a', () => ({
  R002aFlowHeader: () => null,
  R002aScreen: (props: HostProps) => host('main', props),
  TaskStepIndicator: () => null,
  TaskCreatedSuccessSheet: (props: SuccessProps) => {
    rendered.success = props;
    return null;
  },
}));

const { renderToStaticMarkup } = createRequire(import.meta.url)('react-dom/server') as {
  renderToStaticMarkup: (element: ReactNode) => string;
};

function ok(result: { readonly ok: boolean }) {
  expect(result).toMatchObject({ ok: true });
}

async function freshReviewedTask(mode: 'demo' | 'ordinary' = 'demo') {
  vi.stubEnv('EXPO_PUBLIC_GHAF_DEMO_ENTRY', mode === 'demo' ? 'true' : undefined);
  vi.resetModules();
  vi.doMock('@/state/usePrototypeStore', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/state/usePrototypeStore')>();
    return {
      ...original,
      usePrototypeStore: Object.assign(
        (selector: (state: ReturnType<typeof original.usePrototypeStore.getState>) => unknown) =>
          selector(original.usePrototypeStore.getState()),
        original.usePrototypeStore,
      ),
    };
  });
  const { usePrototypeStore } = await import('@/state/usePrototypeStore');
  const { serviceRegistry } = await import('@/services');
  const { P0_RECYCLING_TEMPLATE } = await import('@/features/tasks/demoContent');
  const { PARENT_VERIFICATION_CODE } = await import('@/features/access');
  const { i18n } = await import('@/i18n');
  const { default: Review } = await import('../../app/parent/task/review');
  const state = usePrototypeStore.getState;
  rendered.translate = (key, values) => i18n.t(key, { ...values, lng: state().locale });

  if (mode === 'demo') {
    ok(
      state().enterDemoExperience({
        principal: 'parent_al_noor',
        expectedGeneration: state().demoRunGeneration,
        expectedEpoch: state().demoEntryEpoch,
      }),
    );
  } else {
    ok(
      state().requestParentVerification({
        identifier: 'parent@example.com',
        networkAvailable: false,
      }),
    );
    ok(await state().verifyParentCode(PARENT_VERIFICATION_CODE));
    ok(state().completeParentOnboarding());
  }
  ok(state().authorizeParentExperience());
  ok(
    state().createTaskDraft({
      childId: 'child_salem',
      templateId: P0_RECYCLING_TEMPLATE.id,
      parentText: P0_RECYCLING_TEMPLATE.positiveAction,
    }),
  );
  ok(await state().requestParentGuide({ requestId: 'task-handoff-guide', intent: 'make_clearer' }));
  ok(state().acceptGuideSuggestion());
  ok(state().reviewTask());
  expect(state().journey?.lifecycle).toBe('reviewed');
  return { state, serviceRegistry, Review };
}

function render(component: ComponentType) {
  rendered.stateCursor = 0;
  rendered.controls.clear();
  rendered.success = null;
  return renderToStaticMarkup(createElement(component));
}

function approveFromRoute(run: Awaited<ReturnType<typeof freshReviewedTask>>) {
  render(run.Review);
  expect(rendered.success?.visible).toBe(false);
  const approve = rendered.controls.get('approve-assignment-button')?.onPress;
  expect(approve).toEqual(expect.any(Function));
  approve!();
  expect(run.state().journey?.lifecycle).toBe('assigned');
  render(run.Review);
  expect(rendered.success?.visible).toBe(true);
  expect(rendered.controls.has('approve-assignment-button')).toBe(false);
  return rendered.success!.onSecondary;
}

beforeEach(() => {
  vi.clearAllMocks();
  rendered.stateSlots.length = 0;
  rendered.navigation.getRootState.mockReturnValue({
    index: 0,
    routes: [
      { name: 'app-shell', state: { type: 'stack', routeNames: ['index', 'parent', 'child'] } },
    ],
  });
  rendered.navigation.resetRoot.mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.doUnmock('@/state/usePrototypeStore');
  vi.resetModules();
});

describe('approved task success dialog handoff', () => {
  it('prepares a demo root reset before sign-out and applies it once after authority ends', async () => {
    const run = await freshReviewedTask();
    const openChild = approveFromRoute(run);
    const assigned = structuredClone(run.state().journey);
    const progress = structuredClone(run.state().children);
    const epoch = run.state().demoEntryEpoch;
    const root = rendered.navigation.getRootState();
    const observed: string[] = [];
    rendered.navigation.getRootState.mockImplementation(() => {
      observed.push(`prepare:${run.state().activeExperience}`);
      ok(run.state().authorizeParentExperience());
      return root;
    });
    rendered.navigation.resetRoot.mockImplementation(() => {
      observed.push(`reset:${run.state().activeExperience}`);
      expect(run.state().authorizeParentExperience().ok).toBe(false);
      expect(run.state().authorizeChildExperience().ok).toBe(false);
    });

    openChild();

    expect(observed).toEqual(['prepare:parent', 'reset:signed_out']);
    expect(rendered.navigation.resetRoot).toHaveBeenCalledExactlyOnceWith({
      index: 0,
      routes: [{ name: 'app-shell', state: { index: 0, routes: [{ name: 'index' }] } }],
    });
    expect(rendered.router.dismissAll).not.toHaveBeenCalled();
    expect(rendered.router.replace).not.toHaveBeenCalled();
    expect(run.state().journey).toEqual(assigned);
    expect(run.state().children).toEqual(progress);
    expect(run.state().demoEntryEpoch).toBe(epoch + 1);
  });

  it('retains the approved task and Parent authority when demo root navigation is unavailable', async () => {
    const run = await freshReviewedTask();
    const openChild = approveFromRoute(run);
    const before = run.state();
    const terminate = vi.spyOn(run.serviceRegistry.access, 'terminateParentSession');
    rendered.navigation.getRootState.mockReturnValue(undefined);

    openChild();

    expect(run.state()).toBe(before);
    ok(run.state().authorizeParentExperience());
    expect(terminate).not.toHaveBeenCalled();
    expect(rendered.navigation.resetRoot).not.toHaveBeenCalled();
    expect(rendered.router.dismissAll).not.toHaveBeenCalled();
    expect(rendered.router.replace).not.toHaveBeenCalled();
    expect(render(run.Review)).toContain(rendered.translate('errors.safeRetry'));
    expect(rendered.success?.visible).toBe(true);
  });

  it('does not reset or pop navigation when the real demo sign-out command fails', async () => {
    const run = await freshReviewedTask();
    const openChild = approveFromRoute(run);
    const assigned = structuredClone(run.state().journey);
    const epoch = run.state().demoEntryEpoch;
    const failure: ServiceResult<never> = {
      ok: false,
      error: {
        code: 'INVALID_RESPONSE',
        message: 'Prepared sign-out failure',
        retryable: false,
        fallbackAvailable: false,
      },
    };
    const clear = vi.spyOn(run.serviceRegistry.deviceAccess, 'clear').mockReturnValueOnce(failure);

    openChild();

    expect(rendered.navigation.getRootState).toHaveBeenCalledOnce();
    expect(clear).toHaveBeenCalledOnce();
    ok(run.state().authorizeParentExperience());
    expect(run.state().journey).toEqual(assigned);
    expect(run.state().demoEntryEpoch).toBe(epoch);
    expect(rendered.navigation.resetRoot).not.toHaveBeenCalled();
    expect(rendered.router.dismissAll).not.toHaveBeenCalled();
    expect(rendered.router.replace).not.toHaveBeenCalled();
    expect(render(run.Review)).toContain(rendered.translate('errors.safeRetry'));
  });

  it('preserves the ordinary Child access handoff without requiring a demo root reset', async () => {
    const run = await freshReviewedTask('ordinary');
    const openChild = approveFromRoute(run);
    const assigned = structuredClone(run.state().journey);
    rendered.navigation.getRootState.mockReturnValue(undefined);

    openChild();

    expect(run.state().activeExperience).toBe('signed_out');
    expect(run.state().authorizeParentExperience().ok).toBe(false);
    expect(run.state().authorizeChildExperience().ok).toBe(false);
    expect(run.state().journey).toEqual(assigned);
    expect(rendered.navigation.getRootState).not.toHaveBeenCalled();
    expect(rendered.navigation.resetRoot).not.toHaveBeenCalled();
    expect(rendered.router.dismissAll).toHaveBeenCalledOnce();
    expect(rendered.router.replace).toHaveBeenCalledExactlyOnceWith('/access/child');
  });
});
