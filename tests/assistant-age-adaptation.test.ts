import { describe, expect, it } from 'vitest';

import {
  adaptPreparedCoachResult,
  coachOutputPolicyForAgeBand,
} from '../src/features/assistants/ageAdaptation';
import type { AgeBand, LocalizedText } from '../src/models/familyGrowth';
import { serviceRegistry } from '../src/services';

const steps: readonly LocalizedText[] = [
  { ar: 'اطلب من شخص بالغ فحص المواد.', en: 'Ask an adult to check the items.' },
  { ar: 'اختر الورق والبلاستيك النظيفين.', en: 'Choose the clean paper and plastic.' },
  { ar: 'ضع كل نوع في مكانه الصحيح.', en: 'Put each type in the correct place.' },
  { ar: 'اغسل يديك بعد الانتهاء.', en: 'Wash your hands after finishing.' },
];

function inputFor(ageBand: AgeBand) {
  return {
    context: {
      childId: `synthetic_${ageBand}`,
      ageBand,
      taskId: 'task_green_v1',
      approvedTaskVersion: 1,
      lifecycle: 'in_progress' as const,
      approvedByParent: true as const,
    },
    material: {
      taskId: 'task_green_v1',
      approvedTaskVersion: 1,
      steps,
      quickChoices: [
        { ar: 'أرني خطوتين', en: 'Show two steps' },
        { ar: 'بسّطها', en: 'Make it simpler' },
        { ar: 'أحتاج إلى شخص بالغ', en: 'I need an adult' },
        { ar: 'سؤال إضافي', en: 'One more choice' },
      ],
      adultExit: { ar: 'اسأل شخصاً كبيراً', en: 'Ask an adult' },
      aiDisclosure: {
        ar: 'هذا مدرب ذكاء اصطناعي وقد يخطئ.',
        en: 'This is an AI coach and it may be wrong.',
      },
      origin: 'prepared' as const,
    },
  };
}

describe('age-adaptive prepared Coach output', () => {
  it.each([
    ['6_8', 1, 'slow', 'very_short', 0, 'early'],
    ['9_11', 3, 'standard', 'friendly_clear', 3, 'persistent'],
    ['12_14', 3, 'standard', 'respectful_mature', 0, 'persistent'],
  ] as const)(
    'defines bounded output for %s',
    (ageBand, maximumSteps, pace, tone, quickChoiceLimit, adultExitPlacement) => {
      expect(coachOutputPolicyForAgeBand(ageBand)).toEqual({
        ageBand,
        maximumSteps,
        pace,
        tone,
        quickChoiceLimit,
        adultExitPlacement,
      });
    },
  );

  it.each([
    ['6_8', 1, 0],
    ['9_11', 3, 3],
    ['12_14', 3, 0],
  ] as const)('adapts the prepared material for %s', (ageBand, stepCount, choiceCount) => {
    const result = adaptPreparedCoachResult(inputFor(ageBand));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.steps).toHaveLength(stepCount);
    expect(result.data.quickChoices).toHaveLength(choiceCount);
    expect(result.data.adultExit.alwaysVisible).toBe(true);
    expect(result.data.changesDefinitionOfDone).toBe(false);
    expect(result.data.origin).toBe('prepared');
  });

  it('places the adult exit early for ages 6–8', () => {
    const result = adaptPreparedCoachResult(inputFor('6_8'));

    expect(result).toMatchObject({
      ok: true,
      data: { adultExit: { placement: 'early', alwaysVisible: true } },
    });
  });

  it('rejects a result not bound to the active approved task', () => {
    const input = inputFor('9_11');
    const result = adaptPreparedCoachResult({
      ...input,
      material: { ...input.material, approvedTaskVersion: 2 },
    });

    expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
  });

  it('rejects empty bilingual prepared steps', () => {
    const input = inputFor('12_14');
    const result = adaptPreparedCoachResult({
      ...input,
      material: { ...input.material, steps: [{ ar: '', en: 'Ready' }] },
    });

    expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
  });

  it('exposes Coach adaptation and synthetic voice through the deterministic registry', () => {
    expect(serviceRegistry.coachAdaptation.policyForAgeBand('9_11').maximumSteps).toBe(3);
    expect(serviceRegistry.syntheticVoice).toBeDefined();
  });
});
