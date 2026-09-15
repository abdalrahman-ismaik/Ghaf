import { readFileSync } from 'node:fs';
import { isValidElement, type ReactElement, type ReactNode } from 'react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import AddFirstChildScreen from '../../app/access/parent/add-first-child';
import { ChildProfileForm } from '../../src/components/access/ChildProfileForm';
import {
  createInitialParentOnboardingDraft,
  updateParentOnboardingDraft,
  validateCompleteParentOnboardingDraft,
} from '../../src/features/access/parentOnboarding';
import { createPreparedProfilePersonalization } from '../../src/features/assistants/profilePersonalization';
import { LOCAL_FAMILY_SCHEMA_VERSION } from '../../src/models/localFamily';
import { resources } from '../../src/i18n/resources';
import type {
  ParentOnboardingChildDraft,
  ParentOnboardingDraft,
  ParentOnboardingDraftPatch,
} from '../../src/models/parentOnboarding';

const formState = vi.hoisted(() => ({
  childIndex: '0',
  cursor: 0,
  slots: [] as { value: unknown }[],
  locale: 'ar' as 'ar' | 'en',
  draft: null as ParentOnboardingDraft | null,
  onLimitReached: vi.fn(),
  replace: vi.fn(),
}));

vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>();
  return {
    ...react,
    useState: (initial: unknown) => {
      const slot = (formState.slots[formState.cursor++] ??= { value: initial });
      return [slot.value, (value: unknown) => (slot.value = value)];
    },
    useCallback: (callback: unknown) => callback,
    useEffect: () => undefined,
  };
});
vi.mock('react-native', () => ({
  View: 'View',
  Platform: {
    OS: 'web',
    select: (options: Record<string, unknown>) => options.web ?? options.default,
  },
  StyleSheet: { create: (styles: unknown) => styles },
}));
vi.mock('expo-router', () => ({
  Redirect: 'Redirect',
  useLocalSearchParams: () => ({ child: formState.childIndex }),
  useRouter: () => ({ replace: formState.replace }),
}));
vi.mock('@/components/primitives', () => ({ Text: 'Text', PrimaryButton: 'PrimaryButton' }));
vi.mock('@/components/access', () => ({
  AccessActionRegion: 'AccessActionRegion',
  AccessHeader: 'AccessHeader',
  AccessScreen: 'AccessScreen',
  ChildProfileForm: 'ChildProfileForm',
  InfoRow: 'InfoRow',
  StatusBanner: 'StatusBanner',
}));
vi.mock('@/components/access/AccessControls', () => ({
  AccessTextField: 'AccessTextField',
  ChoiceChip: 'ChoiceChip',
  SegmentedControl: 'SegmentedControl',
}));
vi.mock('@/components/access/AIProfilePreview', () => ({ AIProfilePreview: 'AIProfilePreview' }));
vi.mock('@/components/access/BotanicalAvatar', () => ({
  BotanicalAvatarPicker: 'BotanicalAvatarPicker',
}));
vi.mock('@/state/usePrototypeStore', () => ({
  usePrototypeStore: (selector: (state: object) => unknown) =>
    selector({
      locale: formState.locale,
      direction: formState.locale === 'ar' ? 'rtl' : 'ltr',
      parentOnboarding: { status: 'verified', draft: formState.draft },
      localFamily: { status: 'empty' },
      pendingFamilyCreation: null,
      updateParentOnboardingDraft: (patch: ParentOnboardingDraftPatch) => {
        const result = updateParentOnboardingDraft(formState.draft!, patch);
        if (result.ok) formState.draft = result.data;
        return result;
      },
    }),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      key
        .split('.')
        .reduce<unknown>(
          (value, part) => (value as Record<string, unknown>)[part],
          resources[formState.locale].translation,
        ),
  }),
}));

type FormNode = ReactElement<Record<string, unknown>>;
function formNodes(value: ReactNode): FormNode[] {
  if (Array.isArray(value)) return value.flatMap(formNodes);
  if (!isValidElement<Record<string, unknown>>(value)) return [];
  return [
    value,
    ...formNodes(value.props.children as ReactNode),
    ...formNodes(value.props.footer as ReactNode),
    ...formNodes(value.props.header as ReactNode),
  ];
}
function field(tree: ReactNode, testID: string): FormNode {
  const node = formNodes(tree).find((candidate) => candidate.props.testID === testID);
  expect(node, testID).toBeDefined();
  return node!;
}
function profileForm() {
  return ChildProfileForm({
    child: formState.draft!.children[Number(formState.childIndex)]!,
    direction: formState.locale === 'ar' ? 'rtl' : 'ltr',
    language: formState.locale,
    disabled: false,
    onLimitReached: formState.onLimitReached,
    onValidateName: () => undefined,
    onPatch: (child: Partial<ParentOnboardingChildDraft>) => {
      formState.draft = expectOk(
        updateParentOnboardingDraft(formState.draft!, {
          childIndex: formState.childIndex === '1' ? 1 : 0,
          child,
        }),
      );
    },
  });
}
function childScreen() {
  formState.cursor = 0;
  return AddFirstChildScreen();
}

beforeEach(() => {
  formState.childIndex = '0';
  formState.cursor = 0;
  formState.slots = [];
  formState.locale = 'ar';
  formState.draft = createInitialParentOnboardingDraft();
  formState.onLimitReached.mockClear();
  formState.replace.mockClear();
});

function source(path: string): string {
  return readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
}

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): T {
  expect(result.ok).toBe(true);
  if (!result.ok || result.data === undefined) throw new Error('Expected result to succeed');
  return result.data;
}

const personalizedInput = {
  ageBand: '9_11',
  sex: 'female',
  interests: ['stories'],
  hobbies: ['reading'],
  accessibilityDefaults: ['simpler_instructions'],
  supportPreferences: ['short_steps'],
  customInterest: 'العناية بالبيئة',
  customHobby: null,
  customSupportPreference: 'أفضل أن تعرض لي صورة',
  customAccessibility: null,
  personalizationEnabled: true,
} as const;

describe('required Child profile details', () => {
  it.each([
    ['child-interest-custom', 'child-custom-interest'],
    ['child-hobby-custom', 'child-custom-hobby'],
    ['child-support-custom', 'child-custom-support'],
    ['child-accessibility-custom', 'child-custom-accessibility'],
  ])(
    'explains the incomplete Other answer beside %s before Continue is available',
    (choiceID, inputID) => {
      expect(field(childScreen(), 'add-child-continue').props.disabled).toBe(false);
      (field(profileForm(), choiceID).props.onPress as () => void)();

      for (const value of ['', ' ', 'a']) {
        (field(profileForm(), inputID).props.onChangeText as (next: string) => void)(value);
        const input = field(profileForm(), inputID);
        expect(input.props.errorText).toBe(
          resources.ar.translation.access.setup.customAnswerRequired,
        );
        expect(input.props.maxLength).toBe(80);
        expect(field(childScreen(), 'add-child-continue').props.disabled).toBe(true);
      }

      (field(profileForm(), inputID).props.onChangeText as (next: string) => void)('نباتات');
      expect(field(profileForm(), inputID).props.errorText).toBeUndefined();
      expect(field(childScreen(), 'add-child-continue').props.disabled).toBe(false);

      (field(profileForm(), choiceID).props.onPress as () => void)();
      expect(formNodes(profileForm()).some((node) => node.props.testID === inputID)).toBe(false);
      expect(field(childScreen(), 'add-child-continue').props.disabled).toBe(false);
    },
  );

  it('translates custom-answer feedback without losing typed names, selections or other answers', () => {
    (field(profileForm(), 'child-name-input').props.onChangeText as (value: string) => void)(
      'اسم محفوظ',
    );
    (field(profileForm(), 'child-hobby-custom').props.onPress as () => void)();
    (field(profileForm(), 'child-custom-hobby').props.onChangeText as (value: string) => void)(
      'الرسم',
    );
    (field(profileForm(), 'child-interest-custom').props.onPress as () => void)();
    const draft = formState.draft;

    for (const locale of ['en', 'ar'] as const) {
      formState.locale = locale;
      expect(field(profileForm(), 'child-custom-interest').props.errorText).toBe(
        resources[locale].translation.access.setup.customAnswerRequired,
      );
      expect(field(profileForm(), 'child-name-input').props.value).toBe('اسم محفوظ');
      expect(field(profileForm(), 'child-custom-hobby').props.value).toBe('الرسم');
      expect(field(profileForm(), 'child-interest-custom').props.selected).toBe(true);
      expect(formState.draft).toBe(draft);
      expect(field(childScreen(), 'add-child-continue').props.disabled).toBe(true);
    }
  });

  it('updates a visible name error when the interface language changes', () => {
    (field(profileForm(), 'child-name-input').props.onChangeText as (value: string) => void)('a');
    const screenForm = () =>
      formNodes(childScreen()).find((node) => node.type === 'ChildProfileForm')!;
    (screenForm().props.onValidateName as () => void)();
    expect(screenForm().props.errorText).toBe(resources.ar.translation.access.setup.childNameError);

    formState.locale = 'en';
    expect(screenForm().props.errorText).toBe(resources.en.translation.access.setup.childNameError);
    expect(formState.draft!.children[0]?.nickname).toBe('a');
  });

  it('resets only the access scroll position when moving between retained child drafts', () => {
    (field(profileForm(), 'child-name-input').props.onChangeText as (value: string) => void)(
      'First draft',
    );
    const first = field(childScreen(), 'add-first-child-screen');
    expect(first.props.scrollResetKey).toBe('child-0');
    expect(first.key).toBeNull();

    formState.childIndex = '1';
    const second = field(childScreen(), 'add-first-child-screen');
    expect(second.props.scrollResetKey).toBe('child-1');
    expect(second.key).toBeNull();
    (field(profileForm(), 'child-name-input').props.onChangeText as (value: string) => void)(
      'Second draft',
    );

    formState.childIndex = '0';
    expect(field(childScreen(), 'add-first-child-screen').props.scrollResetKey).toBe('child-0');
    expect(field(profileForm(), 'child-name-input').props.value).toBe('First draft');
    expect(formState.draft!.children[1]?.nickname).toBe('Second draft');
  });

  it('requires one explicit male or female value before profile completion', () => {
    const initial = createInitialParentOnboardingDraft() as unknown as {
      children: readonly { sex: string | null }[];
    };
    expect(initial.children.map((child) => child.sex)).toEqual(['male', 'female']);

    const missing = expectOk(
      updateParentOnboardingDraft(createInitialParentOnboardingDraft(), {
        childIndex: 0,
        child: { sex: null },
      }),
    );
    expect(validateCompleteParentOnboardingDraft(missing)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });

    const first = expectOk(
      updateParentOnboardingDraft(createInitialParentOnboardingDraft(), {
        childIndex: 0,
        child: { sex: 'male' },
      } as never),
    );
    const complete = expectOk(
      updateParentOnboardingDraft(first, {
        childIndex: 1,
        child: { sex: 'female' },
      } as never),
    );
    expect(validateCompleteParentOnboardingDraft(complete)).toMatchObject({ ok: true });

    for (const sex of ['boy', 'girl', 'prefer_not_to_say', 'unknown']) {
      expect(
        updateParentOnboardingDraft(createInitialParentOnboardingDraft(), {
          child: { sex },
        } as never),
      ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    }
  });

  it('accepts four independent bounded custom answers and rejects incomplete or unsafe values', () => {
    const initial = createInitialParentOnboardingDraft();
    const updated = expectOk(
      updateParentOnboardingDraft(initial, {
        child: {
          sex: 'male',
          customInterest: 'العناية بالنباتات',
          customHobby: 'بناء مجسمات ورقية',
          customSupportPreference: 'اعرض مثالاً أولاً',
          customAccessibility: 'مكان هادئ',
        },
      } as never),
    ) as unknown as { children: readonly Record<string, unknown>[] };

    expect(updated.children[0]).toMatchObject({
      customInterest: 'العناية بالنباتات',
      customHobby: 'بناء مجسمات ورقية',
      customSupportPreference: 'اعرض مثالاً أولاً',
      customAccessibility: 'مكان هادئ',
    });

    for (const customInterest of ['', ' ']) {
      const draft = expectOk(
        updateParentOnboardingDraft(initial, {
          child: { sex: 'male', customInterest },
        } as never),
      );
      expect(validateCompleteParentOnboardingDraft(draft)).toMatchObject({
        ok: false,
        error: { code: 'INVALID_INPUT' },
      });
    }
    for (const customInterest of ['x\u0000y', 'x'.repeat(81)]) {
      expect(
        updateParentOnboardingDraft(initial, {
          child: { sex: 'male', customInterest },
        } as never),
      ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    }

    const overLimit = expectOk(
      updateParentOnboardingDraft(initial, {
        child: {
          sex: 'male',
          interests: ['nature', 'making', 'stories'],
          customInterest: 'الاستدامة',
        },
      }),
    );
    expect(validateCompleteParentOnboardingDraft(overLimit)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
  });

  it('renders exactly two sex choices and four conditional Other inputs in both locales', () => {
    const form = source('src/components/access/ChildProfileForm.tsx');
    const route = source('app/access/parent/add-first-child.tsx');

    expect(form).toContain("{ value: 'male', label: t('access.setup.sexMale') }");
    expect(form).toContain("{ value: 'female', label: t('access.setup.sexFemale') }");
    expect(form).not.toMatch(/prefer_not_to_say|genderPreferNot|not_selected/iu);
    for (const id of [
      'child-custom-interest',
      'child-custom-hobby',
      'child-custom-support',
      'child-custom-accessibility',
    ]) {
      expect(form).toContain(`'${id}'`);
    }
    expect(form.match(/t\('access\.setup\.customOption'\)/gu)).toHaveLength(1);
    expect(form).toContain('updateCustom(null)');
    expect(route).toContain('isChildProfileComplete');

    for (const locale of ['ar', 'en'] as const) {
      const setup = resources[locale].translation.access.setup as Record<string, unknown>;
      for (const key of [
        'sexRequired',
        'sexMale',
        'sexFemale',
        'sexPersonalizationBoundary',
        'customOption',
        'customInterestLabel',
        'customHobbyLabel',
        'customSupportLabel',
        'customAccessibilityLabel',
        'customAnswerHint',
        'customAnswerRequired',
      ]) {
        expect(setup[key], `${locale} ${key}`).toBeTruthy();
      }
    }
  });
});

describe('bounded profile suggestion context', () => {
  it('uses sex only for grammatical address and never changes category order by sex', () => {
    const female = expectOk(createPreparedProfilePersonalization(personalizedInput));
    const male = expectOk(
      createPreparedProfilePersonalization({ ...personalizedInput, sex: 'male' }),
    );

    expect(female.addressForm).toBe('feminine');
    expect(male.addressForm).toBe('masculine');
    expect(male.recommendedCategoryIds).toEqual(female.recommendedCategoryIds);
    expect(male.coachingStyle).toBe(female.coachingStyle);
  });

  it('reduces reviewed custom signals without echoing Parent text or calling a provider', () => {
    const result = expectOk(createPreparedProfilePersonalization(personalizedInput));

    expect(result.recommendedCategoryIds).toContain('green_impact');
    expect(result.coachingStyle).toBe('short_visual_steps');
    expect(result.customSignalsUsed).toBe(true);
    expect(JSON.stringify(result)).not.toContain(personalizedInput.customInterest);
    expect(JSON.stringify(result)).not.toContain(personalizedInput.customSupportPreference);
    expect(result.meta).toMatchObject({ localOnly: true, providerCalled: false });
  });

  it('ignores unknown custom wording and keeps opt-out empty', () => {
    const withoutCustom = expectOk(
      createPreparedProfilePersonalization({
        ...personalizedInput,
        customInterest: null,
        customSupportPreference: null,
      }),
    );
    const unknown = expectOk(
      createPreparedProfilePersonalization({
        ...personalizedInput,
        customInterest: 'هواية خاصة غير مصنفة',
        customSupportPreference: 'طريقة أخرى غير مصنفة',
      }),
    );
    const disabled = expectOk(
      createPreparedProfilePersonalization({
        ...personalizedInput,
        personalizationEnabled: false,
      }),
    );

    expect(unknown.recommendedCategoryIds).toEqual(withoutCustom.recommendedCategoryIds);
    expect(unknown.coachingStyle).toBe(withoutCustom.coachingStyle);
    expect(disabled.recommendedCategoryIds).toEqual([]);
    expect(disabled.customSignalsUsed).toBe(false);
  });

  it('keeps the local-family record explicitly versioned for the new profile shape', () => {
    expect(LOCAL_FAMILY_SCHEMA_VERSION).toBe(4);
  });
});
