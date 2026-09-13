import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  createInitialParentOnboardingDraft,
  updateParentOnboardingDraft,
  validateCompleteParentOnboardingDraft,
} from '../../src/features/access/parentOnboarding';
import { createPreparedProfilePersonalization } from '../../src/features/assistants/profilePersonalization';
import { LOCAL_FAMILY_SCHEMA_VERSION } from '../../src/models/localFamily';
import { resources } from '../../src/i18n/resources';

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
