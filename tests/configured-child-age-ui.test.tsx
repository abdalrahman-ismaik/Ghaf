import { createRequire } from 'node:module';
import { createElement, type ReactNode } from 'react';
import { createInstance } from 'i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ChildTaskScreen from '../app/child/task';
import ParentPermissionsScreen from '../app/parent/settings/permissions';
import {
  adaptPreparedCoachResult,
  PREPARED_COACH_MATERIALS,
} from '../src/features/assistants/ageAdaptation';
import { createLocalFamilyRecord } from '../src/features/local-family/schema';
import { resources } from '../src/i18n/resources';
import type { AgeBand, LocaleCode } from '../src/models/familyGrowth';
import { CHILD_COACH_FIXTURE, createSubmittedP0Session } from '../src/services/mock/fixtures';

const { renderToStaticMarkup } = createRequire(import.meta.url)('react-dom/server') as {
  renderToStaticMarkup(node: ReactNode): string;
};

const mock = vi.hoisted(() => ({
  state: {} as Record<string, unknown>,
  values: [] as unknown[],
  cursor: 0,
  actions: new Map<string, () => void>(),
  push: vi.fn(),
  textLive: true,
  voiceLive: true,
  translate: (key: string, _values?: Record<string, unknown>) => key,
}));

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  // Retain state across server renders to exercise the actual route's support toggle.
  useState: (initial: unknown) => {
    const index = mock.cursor++;
    if (index >= mock.values.length)
      mock.values[index] = typeof initial === 'function' ? initial() : initial;
    return [
      mock.values[index],
      (next: unknown) => {
        mock.values[index] = typeof next === 'function' ? next(mock.values[index]) : next;
      },
    ];
  },
}));

vi.mock('@/state/usePrototypeStore', () => ({
  usePrototypeStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mock.state),
  selectCanEnterChildExperience: () => true,
}));

vi.mock('@/config/aiFeatureFlags', () => ({
  aiFeatureFlags: {
    get ai_child_coach_text_live() {
      return mock.textLive;
    },
    get ai_child_coach_voice_live() {
      return mock.voiceLive;
    },
  },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: mock.translate }) }));
vi.mock('@/i18n', () => ({
  localize: (text: Record<string, string>, locale: string) => text[locale],
  bilingualResource: (key: string) => ({ ar: key, en: key }),
}));
vi.mock('expo-router', () => ({ useRouter: () => ({ push: mock.push, replace: vi.fn() }) }));
vi.mock('expo-crypto', () => ({ randomUUID: () => 'synthetic-ui-request' }));
vi.mock('@/services', () => ({
  serviceRegistry: {
    media: { listPrepared: () => [] },
    childCoach: { disclosure: { text: { ar: 'معد مسبقًا', en: 'Prepared' } } },
  },
}));

vi.mock('react-native', async () => {
  const { createElement } = await import('react');
  return {
    Platform: { select: (options: Record<string, unknown>) => options.default },
    AccessibilityInfo: { announceForAccessibility: vi.fn() },
    StyleSheet: { create: (styles: unknown) => styles },
    View: ({ children, testID }: { children?: ReactNode; testID?: string }) =>
      createElement('div', { 'data-testid': testID }, children),
  };
});

vi.mock('@/components/primitives', async () => {
  const { createElement } = await import('react');
  const content = ({
    children,
    testID,
    onPress,
    maxLength,
  }: {
    children?: ReactNode;
    testID?: string;
    onPress?: () => void;
    maxLength?: number;
  }) => {
    if (onPress) mock.actions.set(testID ?? String(children), onPress);
    return createElement('span', { 'data-testid': testID, 'data-max-length': maxLength }, children);
  };
  return { Text: content, Button: content, QuietButton: content, Input: content };
});
vi.mock('@/components/access', () => ({ GhafIcon: () => null }));
vi.mock('@/components/AssistantIdentity', () => ({ AssistantIdentity: () => null }));
vi.mock('@/components/LanguageSwitcher', () => ({ LanguageSwitcher: () => null }));
vi.mock('@/components/family-growth/PreparedMedia', () => ({ PreparedMedia: () => null }));
vi.mock('@/components/family-growth/TrustedAdultExit', () => ({ TrustedAdultExit: () => null }));
vi.mock('@/components/family-growth/LiveVoiceCapturePanel', async () => {
  const { createElement } = await import('react');
  return {
    LiveVoiceCapturePanel: () => createElement('div', { 'data-testid': 'real-voice-panel' }),
  };
});
vi.mock('@/components/family-growth/SyntheticVoicePanel', async () => {
  const { createElement } = await import('react');
  return {
    SyntheticVoicePanel: () => createElement('div', { 'data-testid': 'synthetic-voice-panel' }),
  };
});
vi.mock('@/components/r002a', async () => {
  const { createElement } = await import('react');
  const content = ({
    children,
    header,
    title,
  }: {
    children?: ReactNode;
    header?: ReactNode;
    title?: string;
  }) => createElement('section', null, title, header, children);
  return {
    R002aFlowHeader: content,
    R002aScreen: content,
    ChildCompletionConfirmationSheet: () => null,
    ChildDefinitionCard: () => null,
    ChildTaskActionFooter: () => null,
    ChildTaskChecklist: () => null,
    ChildTaskFollowUpContext: () => null,
    ChildTaskHero: () => null,
    ChildTaskPlanCard: () => null,
    ChildWaitingForReview: () => null,
  };
});
vi.mock('@/components/r003', async () => {
  const { createElement } = await import('react');
  const content = ({
    children,
    title,
    message,
    testID,
    onPress,
  }: {
    children?: ReactNode;
    title?: string;
    message?: string;
    testID?: string;
    onPress?: () => void;
  }) => {
    if (onPress && testID) mock.actions.set(testID, onPress);
    return createElement('section', { 'data-testid': testID }, title, message, children);
  };
  return { R003ActionRow: content, R003Hero: content, R003Section: content, R003Status: content };
});

function prepare(ageBand: AgeBand, locale: LocaleCode) {
  const translator = createInstance();
  void translator.init({ resources, lng: locale, initAsync: false });
  mock.translate = (key, values) => translator.t(key, values);
  const directory = createLocalFamilyRecord({
    parentIdentifier: {
      normalizedIdentifier: 'parent@example.com',
      identifierKind: 'email',
      maskedDestination: 'p***@example.com',
    },
    familyName: 'Palm Family',
    appLanguage: locale,
    children: [
      {
        id: 'child_salem',
        role: 'child',
        nickname: 'Configured Palm',
        avatarId: 'water_drop',
        ageBand,
        preferredLanguage: 'both',
        gender: null,
        interests: [],
        hobbies: [],
        accessibilityDefaults: [],
        supportPreferences: [],
        personalizationEnabled: false,
      },
    ],
    pairedChildIds: ['child_salem'],
    now: '2026-09-11T08:00:00.000Z',
  });
  if (!directory.ok) throw new Error(directory.error.message);
  const session = createSubmittedP0Session();
  mock.state = {
    ...session,
    role: 'child',
    locale,
    direction: locale === 'ar' ? 'rtl' : 'ltr',
    journey: { ...session.journey, lifecycle: 'in_progress', submission: null },
    localFamily: {
      status: 'ready',
      record: directory.data,
      configuredChildIds: ['child_salem'],
      errorCode: null,
      storageTruth: 'device_local_demo_only',
    },
    childCoachResult: null,
    ageAdaptedCoachResult: null,
    childTaskDraft: {
      selectedMediaFixtureId: null,
      unavailableMediaFixtureIds: [],
      reflection: null,
    },
    liveChildCoachView: { status: 'idle', response: null },
    liveChildAiGrants: {
      child_salem: { text: { status: 'granted' }, voice: { status: 'granted' } },
    },
    liveVoiceCapture: null,
    getChildPermissionGrant: () => ({ ok: false }),
  };
  return session.children;
}

function render(component = ChildTaskScreen): string {
  mock.cursor = 0;
  mock.actions.clear();
  return renderToStaticMarkup(createElement(component));
}

function setGrants(text: 'granted' | 'denied', voice: 'granted' | 'denied') {
  mock.state.liveChildAiGrants = {
    child_salem: { text: { status: text }, voice: { status: voice } },
  };
}

function clearConfiguredAge(status: 'ready' | 'unavailable' = 'ready') {
  mock.state.localFamily = {
    status,
    record: null,
    configuredChildIds: [],
    errorCode: status === 'unavailable' ? 'invalid_or_unavailable_local_data' : null,
    storageTruth: 'device_local_demo_only',
  };
}

function openSupport(): string {
  render();
  const open = mock.actions.get('toggle-support-tools-button');
  if (!open) throw new Error('Expected the actual support tools toggle');
  open();
  return render();
}

beforeEach(() => {
  mock.values = [];
  mock.textLive = true;
  mock.voiceLive = true;
});

describe.each(['ar', 'en'] as const)('configured age UI in %s', (locale) => {
  it.each([
    { band: '6_8', intent: 'show_next_step' },
    { band: '9_11', intent: 'first_step' },
    { band: '12_14', intent: 'clarify_step' },
  ] as const)('uses configured $band controls while the demo stays 9–11', ({ band, intent }) => {
    const fixtureChildren = prepare(band, locale);
    const markup = openSupport();

    expect(markup).toContain(`data-testid="live-child-coach-${intent}"`);
    expect(markup.includes('data-testid="live-child-coach-bounded-text"')).toBe(band === '12_14');
    expect(markup.includes('data-testid="real-voice-panel"')).toBe(band === '12_14');
    expect(markup.includes('data-testid="synthetic-voice-panel"')).toBe(band !== '12_14');
    if (band === '12_14') expect(markup).toContain('data-max-length="240"');
    expect(mock.state.children).toEqual(fixtureChildren);
    expect(fixtureChildren.child_salem.ageBand).toBe('9_11');
  });

  it.each(['6_8', '9_11', '12_14'] as const)(
    'offers separate Parent voice grant only for configured 12–14 (%s)',
    (band) => {
      prepare(band, locale);
      setGrants('denied', 'denied');
      const markup = render(ParentPermissionsScreen);

      expect(markup).toContain('Configured Palm');
      expect(markup).toContain('data-testid="change-live-child-ai-text"');
      expect(markup.includes('data-testid="change-live-child-ai-voice"')).toBe(band === '12_14');
      if (band === '12_14') {
        mock.actions.get('change-live-child-ai-voice')!();
        expect(mock.push).toHaveBeenCalledWith({
          pathname: '/parent/reauthenticate',
          params: {
            profileId: 'child_salem',
            kind: 'live_child_voice',
            granted: 'true',
            returnTo: '/parent/settings/permissions',
          },
        });
      }
    },
  );

  it.each(['6_8', '12_14'] as const)(
    'retains curated actions after the configured %s prepared response',
    (ageBand) => {
      prepare(ageBand, locale);
      mock.textLive = false;
      mock.voiceLive = false;
      const material = PREPARED_COACH_MATERIALS.coach_recycling_steps_v1;
      const adapted = adaptPreparedCoachResult({
        context: {
          childId: 'child_salem',
          ageBand,
          taskId: material.taskId,
          approvedTaskVersion: 1,
          lifecycle: 'in_progress',
          approvedByParent: true,
        },
        material,
      });
      if (!adapted.ok) throw new Error(adapted.error.message);
      mock.state.childCoachResult = CHILD_COACH_FIXTURE;
      mock.state.ageAdaptedCoachResult = adapted.data;
      const markup = openSupport();

      expect(adapted.data.policy.quickChoiceLimit).toBe(0);
      for (const key of ['showSteps', 'helpPlan', 'adultExit']) {
        expect(mock.actions.has(mock.translate(`childTask.${key}`))).toBe(true);
      }
      expect(markup).toContain('data-testid="child-coach-age-policy"');
      expect(markup).toContain('data-testid="synthetic-voice-panel"');
    },
  );
});

describe('missing configured age and independent release flags', () => {
  it.each([ChildTaskScreen, ParentPermissionsScreen])(
    'suppresses new live controls when the configured age is unavailable',
    (component) => {
      prepare('12_14', 'en');
      setGrants('denied', 'denied');
      clearConfiguredAge();
      const markup = component === ChildTaskScreen ? openSupport() : render(component);

      for (const id of [
        'live-child-coach-panel',
        'real-voice-panel',
        'change-live-child-ai-text',
        'change-live-child-ai-voice',
      ]) {
        expect(markup).not.toContain(`data-testid="${id}"`);
      }
    },
  );

  it.each([
    { text: false, voice: false },
    { text: true, voice: false },
    { text: false, voice: true },
  ])('keeps flags independent with text=$text and voice=$voice', ({ text, voice }) => {
    prepare('12_14', 'en');
    mock.textLive = text;
    mock.voiceLive = voice;
    const markup = openSupport();

    expect(markup.includes('data-testid="live-child-coach-panel"')).toBe(text);
    expect(markup.includes('data-testid="real-voice-panel"')).toBe(voice);
  });
});

describe.each(['text', 'voice'] as const)('existing live %s grant revocation', (capability) => {
  it.each(['6_8', '9_11', '12_14', 'missing', 'unavailable'] as const)(
    'retains Parent revocation with configured age %s',
    (age) => {
      prepare(age === 'missing' || age === 'unavailable' ? '12_14' : age, 'en');
      if (age === 'missing' || age === 'unavailable')
        clearConfiguredAge(age === 'unavailable' ? 'unavailable' : 'ready');
      const markup = render(ParentPermissionsScreen);
      const action = mock.actions.get(`change-live-child-ai-${capability}`);

      expect(markup).toContain(mock.translate('r003.permissions.liveAiRevoke'));
      expect(action).toBeTypeOf('function');
      action!();
      expect(mock.push).toHaveBeenCalledWith({
        pathname: '/parent/reauthenticate',
        params: {
          profileId: 'child_salem',
          kind: `live_child_${capability}`,
          granted: 'false',
          returnTo: '/parent/settings/permissions',
        },
      });
    },
  );

  it('does not enable the other capability when age is unknown', () => {
    prepare('12_14', 'en');
    clearConfiguredAge();
    setGrants(
      capability === 'text' ? 'granted' : 'denied',
      capability === 'voice' ? 'granted' : 'denied',
    );
    render(ParentPermissionsScreen);

    expect(mock.actions.has(`change-live-child-ai-${capability}`)).toBe(true);
    expect(
      mock.actions.has(`change-live-child-ai-${capability === 'text' ? 'voice' : 'text'}`),
    ).toBe(false);
  });
});

describe('Parent revocation release flags', () => {
  it.each([
    { text: false, voice: false },
    { text: true, voice: false },
    { text: false, voice: true },
  ])('keeps revocation flags independent with text=$text and voice=$voice', ({ text, voice }) => {
    prepare('12_14', 'en');
    clearConfiguredAge();
    mock.textLive = text;
    mock.voiceLive = voice;
    render(ParentPermissionsScreen);

    expect(mock.actions.has('change-live-child-ai-text')).toBe(text);
    expect(mock.actions.has('change-live-child-ai-voice')).toBe(voice);
  });
});
