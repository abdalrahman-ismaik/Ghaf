import { existsSync, readFileSync } from 'node:fs';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { P0_RECYCLING_TEMPLATE } from '../src/features/tasks/demoContent';
import { PARENT_NEXT_ACTIONS } from '../src/features/family/overview';
import type { ParentPatternSummary, ParentSummaryCorrection } from '../src/models/familyGrowth';
import { serviceRegistry } from '../src/services';
import {
  PARENT_SUMMARY_FIXTURE,
  createInitialPrototypeSession,
} from '../src/services/mock/fixtures';
import { usePrototypeStore } from '../src/state/usePrototypeStore';

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): asserts result is {
  readonly ok: true;
  readonly data: T;
} {
  expect(result.ok).toBe(true);
}

async function requestPreparedSummary() {
  return serviceRegistry.parentGuide.summarizePattern({
    requestId: 'us5-seven-day-summary',
    intent: 'summarize_observable_pattern',
    locale: 'ar',
    child: {
      id: 'child_salem',
      age: 9,
      ageBand: '9_11',
      synthetic: true,
    },
    parentText: {
      ar: 'راجع الحقائق الاصطناعية خلال هذا الأسبوع.',
      en: 'Review this week’s synthetic observable facts.',
    },
    taskTemplateId: 'task_recycling_p0_v1',
    taskVersion: 1,
    allowedCategoryId: 'green_impact',
    allowedSafety: P0_RECYCLING_TEMPLATE.safety,
    inputOrigin: 'synthetic',
    syntheticSevenDayFacts: [
      {
        ar: 'أكمل سالم خطوتين وطلب مساعدة شخص بالغ مرة واحدة.',
        en: 'Salem completed two steps and asked for adult help once.',
      },
    ],
  });
}

describe('US5 cooperative Parent overview and bounded pattern summary', () => {
  beforeEach(() => {
    usePrototypeStore.getState().resetPrototype();
  });

  it('has a dedicated bounded Parent pattern-summary component for the overview route', () => {
    expect(
      existsSync(
        new URL('../src/components/family-growth/ParentPatternSummary.tsx', import.meta.url),
      ),
      'ParentPatternSummary must exist before the Parent overview story is integrated',
    ).toBe(true);
  });

  it('offers a bounded bilingual fact editor instead of applying a predetermined correction', () => {
    const source = readFileSync(
      new URL('../src/components/family-growth/ParentPatternSummary.tsx', import.meta.url),
      'utf8',
    );

    expect(source).toContain('testID="parent-summary-fact-ar"');
    expect(source).toContain('testID="parent-summary-fact-en"');
    expect(source).toContain('testID="parent-summary-apply-correction"');
    expect(source).toContain('testID="parent-summary-correction-status"');
    expect(source).toContain('serviceRegistry.parentSummary.applyLocalCorrection');
    expect(source).toContain('correctedFact: { ar: draftAr, en: draftEn }');
    expect(source).toContain('if (result.ok) setCurrent(result.data.summary)');
    expect(source).toContain('accessibilityLiveRegion="polite"');
    expect(source).toContain("t('parentHome.correctionApplied')");
    expect(source).toContain("t('errors.safeRetry')");
    expect(source).not.toContain("bilingualResource('parentHome.correctedFact')");
  });

  it('represents household progress as one combined canopy without a per-Child comparison DTO', () => {
    const session = createInitialPrototypeSession();

    expect(session.household).toMatchObject({
      id: 'household_al_noor',
      origin: 'synthetic',
      childIds: ['child_salem', 'child_alya'],
      combinedCanopy: { contributionLeaves: 19, goalLeaves: 25 },
    });
    expect(session.household).not.toHaveProperty('childSeedTotals');
    expect(session.household).not.toHaveProperty('rank');
    expect(session.household).not.toHaveProperty('pace');
    expect(session.household).not.toHaveProperty('contributionByChild');

    expect(PARENT_NEXT_ACTIONS).toEqual([
      {
        childId: 'child_salem',
        nameKey: 'common.salem',
        nextKey: 'parentHome.salemNext',
        supportKey: 'parentHome.salemSupport',
      },
      {
        childId: 'child_alya',
        nameKey: 'common.alya',
        nextKey: 'parentHome.alyaNext',
        supportKey: 'parentHome.alyaSupport',
      },
    ]);
    const safeOverviewFacts = JSON.stringify({
      canopy: session.household.combinedCanopy,
      nextActions: PARENT_NEXT_ACTIONS,
    });
    expect(safeOverviewFacts).not.toMatch(/earnedSeeds|rank|pace|ageUnequal|contributionTrail/i);
  });

  it('returns the exact prepared, strengths-first, correctable seven-day summary shape', async () => {
    const result = await requestPreparedSummary();
    expectOk(result);

    expect(result.data).toMatchObject({
      meta: {
        requestId: 'us5-seven-day-summary',
        audience: 'parent',
        origin: 'prepared',
        fixtureId: 'parent_summary_week_v1',
        fallbackUsed: false,
        disclosure: {
          preparedIsExplicit: true,
          saysAiMayBeWrong: true,
          saysHumanDecides: true,
        },
      },
      timeWindow: { ar: 'خلال هذا الأسبوع', en: 'This week' },
      strengthsFirst: {
        ar: expect.stringContaining('خياراً آمناً'),
        en: expect.stringContaining('safe choice'),
      },
      observableFacts: [
        {
          ar: expect.stringContaining('خطوتين'),
          en: expect.stringContaining('two Green Impact steps'),
        },
      ],
      uncertainty: {
        ar: expect.stringContaining('اصطناعي ومحدود'),
        en: expect.stringContaining('synthetic and limited'),
      },
      questionForChild: {
        ar: expect.stringContaining('أي خطوة بدت أسهل'),
        en: expect.stringContaining('which step felt easiest'),
      },
      possibleAdjustment: {
        ar: expect.stringContaining('بالحجم نفسه'),
        en: expect.stringContaining('same size'),
      },
      parentCorrectable: true,
      dataOrigin: 'synthetic',
      localCorrection: { applied: false, operation: null, factIndex: null },
    });
    expect(serviceRegistry.parentSummary.validate(result.data)).toMatchObject({ ok: true });
    expect(JSON.stringify(result.data)).not.toMatch(
      /Alya|earnedSeeds|rank|pace|diagnosis|ADHD|truthfulness|religiosity|parenting quality/i,
    );
  });

  it('applies one bounded local fact correction, changes no other field, and revalidates it', () => {
    const correctedFact = {
      ar: 'أكمل سالم خطوة فرز واحدة وطلب من شخص بالغ فحص المواد.',
      en: 'Salem completed one sorting step and asked an adult to check the items.',
    } as const;
    const correction: ParentSummaryCorrection = {
      operation: 'replace_fact',
      factIndex: 0,
      correctedFact,
    };
    const result = serviceRegistry.parentSummary.applyLocalCorrection(
      PARENT_SUMMARY_FIXTURE,
      correction,
    );
    expectOk(result);
    expect(result.data).toMatchObject({
      disposition: 'applied',
      rejectedFor: [],
      summary: {
        observableFacts: [correctedFact],
        localCorrection: { applied: true, operation: 'replace_fact', factIndex: 0 },
      },
    });
    expect(result.data.summary).toMatchObject({
      meta: PARENT_SUMMARY_FIXTURE.meta,
      timeWindow: PARENT_SUMMARY_FIXTURE.timeWindow,
      strengthsFirst: PARENT_SUMMARY_FIXTURE.strengthsFirst,
      uncertainty: PARENT_SUMMARY_FIXTURE.uncertainty,
      questionForChild: PARENT_SUMMARY_FIXTURE.questionForChild,
      possibleAdjustment: PARENT_SUMMARY_FIXTURE.possibleAdjustment,
      parentCorrectable: true,
      dataOrigin: 'synthetic',
    });
    expect(serviceRegistry.parentSummary.validate(result.data.summary)).toMatchObject({ ok: true });
  });

  it('keeps correction local and never invokes a Parent Guide provider or remote conversation', () => {
    const refineSpy = vi.spyOn(serviceRegistry.parentGuide, 'refineTask');
    const summarizeSpy = vi.spyOn(serviceRegistry.parentGuide, 'summarizePattern');
    const twoFactSummary: ParentPatternSummary = {
      ...PARENT_SUMMARY_FIXTURE,
      observableFacts: [
        ...PARENT_SUMMARY_FIXTURE.observableFacts,
        {
          ar: 'طلب سالم من شخص بالغ فحص المواد مرة واحدة.',
          en: 'Salem asked an adult to check the items once.',
        },
      ],
    };
    const result = serviceRegistry.parentSummary.applyLocalCorrection(twoFactSummary, {
      operation: 'mark_fact_uncertain',
      factIndex: 0,
    });

    expectOk(result);
    expect(result.data).toMatchObject({
      disposition: 'applied',
      summary: {
        observableFacts: expect.any(Array),
        uncertainty: { ar: expect.any(String), en: expect.stringContaining('Uncertain fact') },
        localCorrection: { applied: true, operation: 'mark_fact_uncertain', factIndex: 0 },
      },
    });
    expect(refineSpy).not.toHaveBeenCalled();
    expect(summarizeSpy).not.toHaveBeenCalled();
  });

  it.each([
    ['character', { ar: 'سالم طفل جيد.', en: 'Salem is a good child.' }],
    ['diagnosis', { ar: 'هذا تشخيص.', en: 'Salem has ADHD.' }],
    ['emotion inference', { ar: 'سالم غاضب.', en: 'Salem is anxious.' }],
    ['truthfulness', { ar: 'سالم غير صادق.', en: 'Salem is lying.' }],
    ['religiosity', { ar: 'إيمانه ضعيف.', en: 'Salem is not religious enough.' }],
    ['parenting quality', { ar: 'هذه تربية سيئة.', en: 'This is bad parenting.' }],
    ['autism conclusion', { ar: 'سالم لديه توحد.', en: 'Salem has autism.' }],
    ['dyslexia conclusion', { ar: 'سالم لديه عسر القراءة.', en: 'Salem has dyslexia.' }],
  ] as const)(
    'rejects the %s judgment and returns the last reviewed prepared summary',
    (_label, fact) => {
      const result = serviceRegistry.parentSummary.applyLocalCorrection(PARENT_SUMMARY_FIXTURE, {
        operation: 'replace_fact',
        factIndex: 0,
        correctedFact: fact,
      });

      expectOk(result);
      expect(result.data).toMatchObject({
        disposition: 'rejected',
        summary: PARENT_SUMMARY_FIXTURE,
        rejectedFor: expect.arrayContaining([
          fact.en.includes('autism') || fact.en.includes('dyslexia')
            ? 'not_observable_fact'
            : 'prohibited_language',
        ]),
      });
    },
  );

  it('rejects a prohibited whole summary while the reviewed prepared summary remains valid', () => {
    const prohibited: ParentPatternSummary = {
      ...PARENT_SUMMARY_FIXTURE,
      observableFacts: [
        {
          ar: 'سالم طفل كسول ويحتاج إلى تشخيص.',
          en: 'Salem is a lazy child and needs a diagnosis.',
        },
      ],
    };
    expect(serviceRegistry.parentSummary.validate(prohibited)).toMatchObject({
      ok: false,
      error: { code: 'SAFETY_REJECTED' },
    });
    expect(serviceRegistry.parentSummary.validate(PARENT_SUMMARY_FIXTURE)).toMatchObject({
      ok: true,
      data: PARENT_SUMMARY_FIXTURE,
    });
  });

  it.each([
    ['raw summary', { ...PARENT_SUMMARY_FIXTURE }],
    ['Parent note', { parentNote: 'private note' }],
    ['Child identity', { childId: 'child_salem' }],
    ['media', { mediaFixtureId: 'fixture_recycling_clean_v1' }],
    ['reflection', { reflection: 'private reflection' }],
    ['assistant content', { assistantContent: 'prepared summary' }],
  ] as const)('rejects %s before any circle projection can expose it', (_label, privateField) => {
    const input = {
      schemaVersion: '1.0',
      categoryId: 'green_impact',
      recognitionMode: 'standard',
      routinePhase: 'acquisition',
      visibilityScope: 'household',
      circleEligible: true,
      consequenceKind: 'rewarded_acquisition',
      confirmed: true,
      prohibitedSharedFieldsPresent: false,
      ...privateField,
    };
    expect(serviceRegistry.familyProjection.validateEligibilityContext(input)).toMatchObject({
      ok: false,
      error: { code: 'PRIVACY_REJECTED' },
    });
  });
});
