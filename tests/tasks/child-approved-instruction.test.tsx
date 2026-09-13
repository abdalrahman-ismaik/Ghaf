import { createRequire } from 'node:module';

import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ChildTaskScreen from '../../app/child/task';
import { P0_RECYCLING_TEMPLATE } from '@/features/tasks/demoContent';
import { bilingualResource, i18n } from '@/i18n';
import type { LocaleCode } from '@/models/prototype';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import {
  enterChildExperienceForTest,
  enterParentExperienceForTest,
  resetPrototypeForTest,
} from '../helpers/prototypeStore';

interface HostProps {
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'checkbox' | 'progressbar';
  accessibilityState?: { checked?: boolean; disabled?: boolean };
  children?: ReactNode;
  direction?: 'ltr' | 'rtl';
  disabled?: boolean;
  footer?: ReactNode;
  header?: ReactNode;
  testID?: string;
}

function HostView({
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
  children,
  disabled,
  footer,
  header,
  testID,
}: HostProps) {
  return (
    <div
      aria-checked={accessibilityState?.checked}
      aria-disabled={disabled ?? accessibilityState?.disabled}
      aria-label={accessibilityLabel}
      data-testid={testID}
      role={accessibilityRole}
    >
      {header}
      {children}
      {footer}
    </div>
  );
}

function HostText({ children, direction, testID }: HostProps) {
  return (
    <span data-testid={testID} dir={direction}>
      {children}
    </span>
  );
}

vi.mock('expo-router', () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock('expo-crypto', () => ({ randomUUID: () => 'approved-instruction-test' }));
vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: i18n.getFixedT(usePrototypeStore.getState().locale) }),
}));
vi.mock('react-native', () => ({
  AccessibilityInfo: { announceForAccessibility: vi.fn() },
  ActivityIndicator: () => null,
  Platform: { OS: 'web', select: (options: Record<string, unknown>) => options.default },
  StyleSheet: { create: <T,>(styles: T) => styles, hairlineWidth: 1 },
  View: HostView,
}));
vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
vi.mock('@/components/access', () => ({ GhafIcon: () => null }));
vi.mock('@/components/botanical', () => ({ BotanicalPressable: HostView }));
vi.mock('@/components/illustrations', () => ({ LocalIllustration: () => null }));
vi.mock('@/components/primitives', () => ({
  Button: HostView,
  Input: () => null,
  QuietButton: HostView,
  Text: HostText,
}));
vi.mock('@/components/AssistantIdentity', () => ({ AssistantIdentity: () => null }));
vi.mock('@/components/LanguageSwitcher', () => ({ LanguageSwitcher: () => null }));
vi.mock('@/components/family-growth/PreparedMedia', () => ({ PreparedMedia: () => null }));
vi.mock('@/components/family-growth/LiveChildCoachPanel', () => ({
  LiveChildCoachPanel: () => null,
}));
vi.mock('@/components/family-growth/LiveVoiceCapturePanel', () => ({
  LiveVoiceCapturePanel: () => null,
}));
vi.mock('@/components/family-growth/SyntheticVoicePanel', () => ({
  SyntheticVoicePanel: () => null,
}));
vi.mock('@/components/family-growth/TrustedAdultExit', () => ({
  TrustedAdultExit: ({ body, label }: { body: string; label: string }) => (
    <div>
      <span>{label}</span>
      <span>{body}</span>
    </div>
  ),
}));
vi.mock('@/components/r002a', async () => ({
  ...(await import('../../src/components/r002a/child/ChildTaskHero')),
  ...(await import('../../src/components/r002a/child/ChildTaskPlanCard')),
  ...(await import('../../src/components/r002a/child/ChildTaskChecklist')),
  ...(await import('../../src/components/r002a/child/ChildDefinitionCard')),
  ...(await import('../../src/components/r002a/child/ChildTaskActionFooter')),
  ChildCompletionConfirmationSheet: () => null,
  ChildTaskFollowUpContext: () => null,
  ChildWaitingForReview: () => null,
  R002aFlowHeader: () => null,
  R002aScreen: HostView,
}));
vi.mock('@/state/usePrototypeStore', async (importOriginal) => {
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

const APPROVED_ACTION = {
  ar: 'افرز الورق والبلاستيك النظيفين اللذين وافق عليهما شخص بالغ، وتوقف واسأل شخصاً بالغاً عند الشك.',
  en: 'Sort the clean paper and plastic approved by an adult, and stop to ask an adult when unsure.',
} as const;

const { renderToStaticMarkup } = createRequire(import.meta.url)('react-dom/server') as {
  renderToStaticMarkup: (element: ReactNode) => string;
};

function expectOk(result: { readonly ok: boolean }) {
  expect(result.ok).toBe(true);
}

async function assignApprovedTask() {
  expectOk(usePrototypeStore.getState().reviewTask());
  expectOk(usePrototypeStore.getState().approveAssignment());
  await enterChildExperienceForTest();
}

async function resumeAfterRetry() {
  expectOk(
    usePrototypeStore.getState().submitTask({
      definitionAcknowledged: true,
      completionMode: 'permitted_help',
      helpUsed: bilingualResource('checkIn.recordedHelp'),
      preparedMediaFixtureId: null,
      reflection: null,
      observableFacts: [bilingualResource('checkIn.recordedFact')],
    }),
  );
  await enterParentExperienceForTest();
  expectOk(
    usePrototypeStore.getState().requestKindRetry(bilingualResource('checkIn.retryObservation')),
  );
  expectOk(usePrototypeStore.getState().resumeRetry());
  await enterChildExperienceForTest();
  expect(usePrototypeStore.getState().journey?.submission).not.toBeNull();
}

function renderTask(locale: LocaleCode) {
  usePrototypeStore.getState().setLocale(locale);
  return renderToStaticMarkup(<ChildTaskScreen />);
}

function expectVisibleText(markup: string, value: string) {
  expect(markup).toContain(`>${value}<`);
}

beforeEach(async () => {
  expectOk(resetPrototypeForTest());
  await enterParentExperienceForTest();
  expectOk(
    usePrototypeStore.getState().createTaskDraft({
      childId: 'child_salem',
      templateId: P0_RECYCLING_TEMPLATE.id,
      parentText: APPROVED_ACTION,
    }),
  );
});

describe.each(['ar', 'en'] as const)('Child approved instruction in %s', (locale) => {
  it.each(['chosen', 'in_progress', 'retry_follow_up'] as const)(
    'shows exact approved wording in %s while retaining the fixed safety steps',
    async (phase) => {
      await assignApprovedTask();
      expectOk(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1'));
      if (phase !== 'chosen') expectOk(usePrototypeStore.getState().startAssignment());
      if (phase === 'retry_follow_up') await resumeAfterRetry();
      const journey = structuredClone(usePrototypeStore.getState().journey);
      expect(journey?.task.content.positiveAction).toEqual(APPROVED_ACTION);

      const markup = renderTask(locale);
      const t = i18n.getFixedT(locale);
      expectVisibleText(markup, APPROVED_ACTION[locale]);
      expect(markup).toContain(
        `data-testid="child-approved-action" dir="${locale === 'ar' ? 'rtl' : 'ltr'}">${APPROVED_ACTION[locale]}<`,
      );
      expect(markup).not.toContain(APPROVED_ACTION[locale === 'ar' ? 'en' : 'ar']);
      expectVisibleText(markup, t('childTask.title'));
      for (const step of ['stepOne', 'stepTwo', 'stepThree', 'stepFour']) {
        expectVisibleText(markup, t(`childTask.${step}`));
      }
      expectVisibleText(markup, P0_RECYCLING_TEMPLATE.definitionOfDone[locale]);
      if (phase === 'chosen') {
        expectVisibleText(markup, P0_RECYCLING_TEMPLATE.permittedHelp[locale]);
        expect(markup).toContain('data-testid="child-task-start-screen"');
      } else {
        expectVisibleText(markup, t('childTask.adultExitBody'));
        expect(
          markup.match(/data-testid="task-step-(?:adult-check-and-sort|stop-route-aftercare)"/gu),
        ).toHaveLength(2);
        expect(markup).toContain('aria-disabled="true" data-testid="complete-task-button"');
        expect(markup).toContain('data-testid="definition-acknowledgement"');
      }
      expect(usePrototypeStore.getState().journey).toEqual(journey);
    },
  );

  it.each(['chosen', 'in_progress'] as const)(
    'preserves the version-two adjusted action and definition in %s',
    async (phase) => {
      await assignApprovedTask();
      expectOk(usePrototypeStore.getState().requestSmallerTask());
      await enterParentExperienceForTest();
      expectOk(
        usePrototypeStore.getState().resolvePreAcceptanceAdjustment({ decision: 'smaller' }),
      );
      await enterChildExperienceForTest();
      expectOk(usePrototypeStore.getState().respondToPreAcceptanceAdjustment('accept'));
      expectOk(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1'));
      if (phase === 'in_progress') expectOk(usePrototypeStore.getState().startAssignment());
      const task = usePrototypeStore.getState().journey?.task;
      expect(task?.version).toBe(2);
      expect(task?.content.positiveAction).not.toEqual(APPROVED_ACTION);

      const markup = renderTask(locale);
      expectVisibleText(markup, task!.content.positiveAction[locale]);
      expectVisibleText(markup, task!.content.definitionOfDone[locale]);
      expect(markup).not.toContain(APPROVED_ACTION[locale]);
      expect(markup).not.toContain('data-testid="child-approved-action"');
    },
  );

  it('does not expose unassigned Parent draft wording to the Child', async () => {
    await enterChildExperienceForTest();
    expect(usePrototypeStore.getState().journey?.assignment).toBeNull();
    expect(renderTask(locale)).toBe('');
  });

  it('does not expose an assignment before the Child chooses it', async () => {
    await assignApprovedTask();
    expect(usePrototypeStore.getState().journey?.lifecycle).toBe('assigned');
    expect(renderTask(locale)).toBe('');
  });

  it.each(['chosen', 'in_progress'] as const)(
    'does not expose Salem’s %s instruction to Alya',
    async (phase) => {
      await assignApprovedTask();
      expectOk(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1'));
      if (phase === 'in_progress') expectOk(usePrototypeStore.getState().startAssignment());
      await enterChildExperienceForTest('child_alya');
      expect(usePrototypeStore.getState().journey?.task.content.positiveAction).toEqual(
        APPROVED_ACTION,
      );
      expect(usePrototypeStore.getState().activeChildId).toBe('child_alya');
      expect(renderTask(locale)).toBe('');
    },
  );
});
