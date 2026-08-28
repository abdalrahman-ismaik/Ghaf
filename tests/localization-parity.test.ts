import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { P0_RECYCLING_TEMPLATE } from '../src/features/tasks/demoContent';
import { localize } from '../src/i18n';
import { resources } from '../src/i18n/resources';
import { serviceRegistry } from '../src/services';
import {
  CHILD_COACH_FIXTURE,
  PARENT_GUIDE_FIXTURE,
  PARENT_SUMMARY_FIXTURE,
  PREPARED_MEDIA_FIXTURES,
  PREPARED_PRAISE,
} from '../src/services/mock/fixtures';

const canonicalArabicTitle =
  'فرز المواد النظيفة القابلة لإعادة التدوير ومرافقة شخص بالغ إلى حاوية إعادة تدوير آمنة يحددها وليّ الأمر';

const canonicalArabicDefinition =
  'بعد أن يفحص شخص بالغ المواد مسبقاً، يفرز سالم الورق والبلاستيك النظيفين والسليمين وغير الحادّين والمقبولين في نظام إعادة التدوير المحلي، ويضعهما في الحاوية المنزلية الصحيحة. عند الحاجة، يساعد سالم بعد فحص ثانٍ من الشخص البالغ على إغلاق كيس إعادة تدوير خفيف، ثم يرافق الشخص البالغ عبر مسار آمن يوافق عليه وليّ الأمر. يقيّم الشخص البالغ الحرارة وحركة المركبات، ويحمل الكيس ويتولى التخلّص منه. لا يتطلب المسار عبور طريق، ويبقى سالم بعيداً عن مسارات المركبات وضواغط النفايات ومزالقها وآلات غرف الحاويات. إذا كانت الحرارة أو حركة المركبات غير آمنة، تؤجَّل الرحلة أو يُستخدم بديل للفرز داخل المنزل. النفايات المنزلية العامة ليست جزءاً من هذه المهمة.';

const canonicalArabicCoachSteps = [
  'اطلب من شخص بالغ فحص المواد النظيفة مسبقاً وتحديد حاوية إعادة التدوير المنزلية.',
  'افرز فقط الورق والبلاستيك السليمين وغير الحادّين اللذين وافق عليهما الشخص البالغ.',
  'توقّف واسأل شخصاً بالغاً إذا كان أي شيء حاداً أو متسرباً أو متسخاً أو مجهولاً.',
  'بعد الفحص الثاني، ساعد في إغلاق كيس إعادة التدوير الخفيف عند الحاجة، ورافق الشخص البالغ عبر المسار الآمن بينما يحمل الكيس ويتولى التخلّص منه، ثم اغسل يديك.',
] as const;

const canonicalArabicCoachCue =
  'بعد أن يفحص الشخص البالغ المواد، أفرز المواد النظيفة القابلة لإعادة التدوير.';
const canonicalArabicCoachDisclosure =
  'مثال مُعدّ مسبقاً لمساعد بالذكاء الاصطناعي؛ هذه الاستجابة مكتوبة مسبقاً وقد تكون غير صحيحة.';
const canonicalArabicGuideDisclosure =
  'مثال مُعدّ مسبقاً لمساعد بالذكاء الاصطناعي. قد تكون الاستجابة غير صحيحة، ووليّ الأمر هو صاحب القرار.';
const canonicalArabicPraise =
  'لقد فرزت المواد النظيفة القابلة لإعادة التدوير وسألت قبل الذهاب إلى الحاوية؛ وهذا جعل المهمة أكثر أماناً وساعد أسرتنا.';

function flattenStrings(value: unknown, path = ''): Map<string, string> {
  const result = new Map<string, string>();
  if (typeof value === 'string') {
    result.set(path, value);
    return result;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return result;

  for (const [key, child] of Object.entries(value)) {
    for (const [childPath, text] of flattenStrings(child, path ? `${path}.${key}` : key)) {
      result.set(childPath, text);
    }
  }
  return result;
}

function collectLocalizedStrings(value: unknown, locale: 'ar' | 'en'): string[] {
  if (!value || typeof value !== 'object') return [];
  if (
    !Array.isArray(value) &&
    typeof (value as Record<string, unknown>)[locale] === 'string' &&
    typeof (value as Record<string, unknown>)[locale === 'ar' ? 'en' : 'ar'] === 'string'
  ) {
    return [(value as Record<'ar' | 'en', string>)[locale]];
  }
  return Object.values(value).flatMap((child) => collectLocalizedStrings(child, locale));
}

describe('Feature 003 bilingual resource parity', () => {
  it('has the same non-empty translation leaf keys in Arabic and English', () => {
    const ar = flattenStrings(resources.ar.translation);
    const en = flattenStrings(resources.en.translation);

    expect([...ar.keys()].sort()).toEqual([...en.keys()].sort());
    for (const key of ar.keys()) {
      expect(ar.get(key)?.trim(), `Arabic resource ${key}`).not.toBe('');
      expect(en.get(key)?.trim(), `English resource ${key}`).not.toBe('');
    }
  });

  it('keeps the canonical P0 Arabic title, definition, and safety boundaries stable', () => {
    expect(P0_RECYCLING_TEMPLATE.title.ar).toBe(canonicalArabicTitle);
    expect(P0_RECYCLING_TEMPLATE.definitionOfDone.ar).toBe(canonicalArabicDefinition);

    const safety = collectLocalizedStrings(P0_RECYCLING_TEMPLATE.safety, 'ar').join(' ');
    for (const requiredBoundary of [
      'يفحص شخص بالغ جميع المواد مسبقاً',
      'الزجاج',
      'الأدوات الحادّة',
      'البطاريات',
      'المواد الكيميائية',
      'الأدوية',
      'أي مادة مجهولة',
      'الفحص قبل إغلاق الكيس',
      'الحرارة وحركة المركبات',
      'لا يتطلب المسار عبور طريق',
      'يحمل الكيس',
      'يتولى التخلّص',
      'بديل داخلي',
      'سؤال شخص بالغ عند الشك',
      'تُغسل اليدان بعد الانتهاء',
    ]) {
      expect(safety).toContain(requiredBoundary);
    }
  });

  it('keeps the canonical Coach steps, cue, adult exit, and disclosure stable', () => {
    expect(CHILD_COACH_FIXTURE.steps.map((step) => step.ar)).toEqual(canonicalArabicCoachSteps);
    expect(CHILD_COACH_FIXTURE.ifThenCue.ar).toBe(canonicalArabicCoachCue);
    expect(CHILD_COACH_FIXTURE.adultExit).toEqual({
      label: { ar: 'أحتاج إلى شخص بالغ', en: 'I need an adult' },
      alwaysVisible: true,
    });
    expect(CHILD_COACH_FIXTURE.meta.disclosure.text.ar).toBe(canonicalArabicCoachDisclosure);
  });

  it('keeps prepared Guide, praise, summary, and media provenance bilingual', () => {
    expect(PARENT_GUIDE_FIXTURE.meta).toMatchObject({
      origin: 'prepared',
      fixtureId: 'guide_recycling_refine_v1',
      fallbackUsed: false,
      disclosure: {
        text: { ar: canonicalArabicGuideDisclosure },
        saysAiMayBeWrong: true,
        saysHumanDecides: true,
        preparedIsExplicit: true,
      },
    });
    expect(PREPARED_PRAISE).toEqual({
      ar: canonicalArabicPraise,
      en: 'You sorted the clean recyclables and asked before going to the bin—that kept the job safe and helped our household.',
    });

    const summaryAr = collectLocalizedStrings(PARENT_SUMMARY_FIXTURE, 'ar').join(' ');
    const summaryEn = collectLocalizedStrings(PARENT_SUMMARY_FIXTURE, 'en').join(' ');
    for (const text of [summaryAr, summaryEn]) {
      expect(text.length).toBeGreaterThan(100);
    }
    expect(summaryAr).toContain('خلال هذا الأسبوع');
    expect(summaryAr).toContain('السجل الحالي اصطناعي ومحدود');
    expect(summaryAr).toContain('لا يوضّح سبب تأجيل مهمة أخرى');
    expect(summaryEn).toContain('This week');
    expect(summaryEn).toContain('synthetic and limited');
    expect(summaryEn).toContain('does not show why another task was postponed');

    expect(PREPARED_MEDIA_FIXTURES.map((fixture) => fixture.id)).toEqual([
      'fixture_recycling_clean_v1',
      'fixture_salem_plan_ar_v1',
    ]);
    for (const fixture of PREPARED_MEDIA_FIXTURES) {
      expect(fixture).toMatchObject({
        origin: 'prepared',
        synthetic: true,
        optional: true,
        crossHouseholdSharing: false,
      });
      expect(collectLocalizedStrings(fixture, 'ar').every((text) => text.trim().length > 0)).toBe(
        true,
      );
      expect(collectLocalizedStrings(fixture, 'en').every((text) => text.trim().length > 0)).toBe(
        true,
      );
    }
  });

  it('uses canonical validated assistant disclosure metadata at each point of use', () => {
    const parentComposerSource = readFileSync(
      new URL('../src/components/family-growth/ParentTaskComposer.tsx', import.meta.url),
      'utf8',
    );
    const childTaskSource = readFileSync(new URL('../app/child/task.tsx', import.meta.url), 'utf8');

    for (const disclosure of [
      PARENT_GUIDE_FIXTURE.meta.disclosure.text,
      CHILD_COACH_FIXTURE.meta.disclosure.text,
    ]) {
      expect(disclosure.ar.trim()).not.toBe('');
      expect(disclosure.en.trim()).not.toBe('');
    }

    expect(serviceRegistry.parentGuide.disclosure).toEqual(PARENT_GUIDE_FIXTURE.meta.disclosure);
    expect(serviceRegistry.childCoach.disclosure).toEqual(CHILD_COACH_FIXTURE.meta.disclosure);

    expect(parentComposerSource).toContain('suggestion?.meta.disclosure.text');
    expect(parentComposerSource).toContain('serviceRegistry.parentGuide.disclosure.text');
    expect(parentComposerSource).toContain('localize(guideDisclosure, locale)');
    expect(parentComposerSource).not.toContain("t('taskNew.guideDisclosure')");

    expect(childTaskSource).toContain('coach?.meta.disclosure.text');
    expect(childTaskSource).toContain('serviceRegistry.childCoach.disclosure.text');
    expect(childTaskSource).toContain('localize(coachDisclosure, locale)');
    expect(childTaskSource).not.toContain("t('childTask.coachDisclosure')");

    expect(resources.ar.translation.taskNew).not.toHaveProperty('guideDisclosure');
    expect(resources.en.translation.taskNew).not.toHaveProperty('guideDisclosure');
    expect(resources.ar.translation.childTask).not.toHaveProperty('coachDisclosure');
    expect(resources.en.translation.childTask).not.toHaveProperty('coachDisclosure');
  });

  it('preserves mixed-script values and contains no retired or unsupported claim copy', () => {
    const mixed = {
      ar: 'سالم · Mangrove · 12 بذرة',
      en: 'Salem · المنغروف · 12 Seeds',
    };
    expect(localize(mixed, 'ar')).toBe('سالم · Mangrove · 12 بذرة');
    expect(localize(mixed, 'en')).toBe('Salem · المنغروف · 12 Seeds');

    const allCopy = [
      ...flattenStrings(resources.ar.translation).values(),
      ...flattenStrings(resources.en.translation).values(),
    ].join('\n');
    for (const prohibited of [
      /food rescued/i,
      /طعام تم إنقاذه/u,
      /rescued grams/i,
      /kilograms saved/i,
      /litres? saved/i,
      /carbon saved/i,
      /real tree (?:was )?planted/i,
      /زرعنا شجرة حقيقية/u,
      /good child/i,
      /bad child/i,
      /lazy child/i,
      /normal child/i,
      /abnormal child/i,
    ]) {
      expect(allCopy).not.toMatch(prohibited);
    }
  });
});
