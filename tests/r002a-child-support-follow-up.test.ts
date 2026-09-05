import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { beforeEach, describe, expect, it } from 'vitest';

import { resources } from '../src/i18n/resources';
import { createSubmittedP0Session } from '../src/services/mock/fixtures';
import { usePrototypeStore } from '../src/state/usePrototypeStore';

const root = fileURLToPath(new URL('../', import.meta.url));

function source(relativePath: string) {
  const absolutePath = `${root}${relativePath}`;
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): asserts result is {
  readonly ok: true;
  readonly data: T;
} {
  expect(result.ok).toBe(true);
}

function recognitionCounters() {
  const state = usePrototypeStore.getState();
  return {
    canopyLeaves: state.household.combinedCanopy.contributionLeaves,
    circleActions: state.circleGoal.eligibleGreenActions,
    mangroveSeeds: state.landscapeProgress.mangrove.cumulativeSeeds,
    mangroveStage: state.landscapeProgress.mangrove.stage,
    salemSeeds: state.children.child_salem.earnedSeeds,
  };
}

describe('R002a Child support follow-up presentation', () => {
  beforeEach(() => {
    usePrototypeStore.setState(createSubmittedP0Session());
    usePrototypeStore.getState().setRole('parent');
  });

  it('preserves the prior submission through Parent resume and awards nothing on resubmission', () => {
    const priorSubmission = structuredClone(usePrototypeStore.getState().journey?.submission);
    const baseline = recognitionCounters();

    expectOk(
      usePrototypeStore.getState().requestKindRetry({
        ar: 'لنراجع الخطوة مرة أخرى بأمان.',
        en: 'Let us review the step safely once more.',
      }),
    );
    expectOk(usePrototypeStore.getState().resumeRetry());
    expect(usePrototypeStore.getState().journey).toMatchObject({
      lifecycle: 'in_progress',
      submission: priorSubmission,
      checkIn: null,
    });
    expect(recognitionCounters()).toEqual(baseline);

    usePrototypeStore.getState().setRole('child');
    expectOk(
      usePrototypeStore.getState().submitTask({
        completionMode: 'permitted_help',
        definitionAcknowledged: true,
        helpUsed: null,
        observableFacts: [
          {
            ar: 'أكمل سالم الخطوات المعتمدة مع شخص بالغ.',
            en: 'Salem completed the approved steps with an adult.',
          },
        ],
        preparedMediaFixtureId: null,
        reflection: null,
      }),
    );
    expect(usePrototypeStore.getState().journey).toMatchObject({
      lifecycle: 'submitted',
      submission: {
        attempt: 2,
        id: 'submission_recycling_p0_v1_attempt_2',
      },
    });
    expect(recognitionCounters()).toEqual(baseline);
  });

  it('detects only a resumed retry and keeps every current approved step fresh', () => {
    const route = source('app/child/task.tsx');

    expect(route).toContain("journey?.lifecycle === 'in_progress' && journey.submission !== null");
    expect(route).toContain('<ChildTaskFollowUpContext');
    expect(route).toMatch(/isRetryFollowUp\s*\?\s*'r002aFollowUp\.headerTitle'/u);
    expect(route).toContain("parentNote={t('checkIn.retryObservation')}");
    expect(route).toContain(
      'const [completedStepIds, setCompletedStepIds] = useState<readonly string[]>([]);',
    );
    expect(route).not.toMatch(/completedStepIds\s*[:=][^;\n]*submission/u);
    expect(route).not.toMatch(/(?:108|120|180)|1\s*(?:of|من)\s*2/u);
  });

  it('uses one store-free native context with truthful retry evidence and physical RTL', () => {
    const componentPath = 'src/components/r002a/child/ChildTaskFollowUpContext.tsx';
    const component = source(componentPath);

    expect(existsSync(`${root}${componentPath}`)).toBe(true);
    expect(component).toContain('testID="child-task-follow-up-context"');
    expect(component).toContain('accessibilityLiveRegion="polite"');
    expect(component).toContain('logicalRowDirection(direction)');
    expect(component).toContain('priorAttemptLabel');
    expect(component).toContain('helpValue');
    expect(component).toContain('factValues');
    expect(component).toContain('parentNote');
    expect(component).toContain('freshStepsBody');
    expect(component).not.toMatch(
      /(?:<div|className=|WebView|\.html["']|\.png["']|https?:\/\/|expo-router|usePrototypeStore|@\/services)/u,
    );
    expect(component).not.toMatch(/(?:108|120|180)|1\s*(?:of|من)\s*2/u);
  });

  it('keeps Arabic and English follow-up copy equivalent and placeholder-free', () => {
    const arabic = resources.ar.translation.r002aFollowUp;
    const english = resources.en.translation.r002aFollowUp;

    expect(Object.keys(arabic).sort()).toEqual(Object.keys(english).sort());
    expect(arabic.parentNote).toContain('وليّ الأمر');
    expect(english.parentNote).toContain('Parent');
    expect(arabic.freshStepsBody).toContain('غير محددة');
    expect(english.freshStepsBody).toContain('unchecked');
    expect(JSON.stringify({ arabic, english })).not.toMatch(/EN:S|\{\{DATA:SCREEN:/u);
  });
});
