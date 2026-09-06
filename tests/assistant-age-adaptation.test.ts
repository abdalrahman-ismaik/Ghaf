import { describe, expect, it } from 'vitest';

import {
  adaptPreparedCoachResult,
  coachOutputPolicyForAgeBand,
  PREPARED_COACH_MATERIALS,
} from '../src/features/assistants/ageAdaptation';
import type { AgeBand } from '../src/models/familyGrowth';
import { serviceRegistry } from '../src/services';

function inputFor(ageBand: AgeBand) {
  return {
    context: {
      childId: 'child_salem',
      ageBand,
      taskId: 'task_recycling_p0_v1',
      approvedTaskVersion: 1,
      lifecycle: 'in_progress' as const,
      approvedByParent: true as const,
    },
    material: {
      ...PREPARED_COACH_MATERIALS.coach_recycling_steps_v1,
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

  it('rejects caller-authored material carrying a prepared label', () => {
    const input = inputFor('12_14');
    const result = adaptPreparedCoachResult({
      ...input,
      material: {
        ...input.material,
        steps: input.material.steps.map((step, index) =>
          index === 0 ? { ...step, en: 'Caller supplied instruction.' } : step,
        ),
      },
    });

    expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
  });

  it('does not expose mutable age policies or prepared fixtures', () => {
    const policy = coachOutputPolicyForAgeBand('9_11');
    expect(() => {
      (policy as { maximumSteps: number }).maximumSteps = 1;
    }).not.toThrow();
    expect(coachOutputPolicyForAgeBand('9_11').maximumSteps).toBe(3);
    expect(Object.isFrozen(PREPARED_COACH_MATERIALS)).toBe(true);
    expect(Object.isFrozen(PREPARED_COACH_MATERIALS.coach_recycling_steps_v1.steps)).toBe(true);
  });

  it('rejects an unreviewed runtime age band', () => {
    expect(() => coachOutputPolicyForAgeBand('15_17' as AgeBand)).toThrow(RangeError);
    expect(serviceRegistry.coachAdaptation.policyForAgeBand('15_17')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
    expect(
      adaptPreparedCoachResult({
        ...inputFor('9_11'),
        context: { ...inputFor('9_11').context, ageBand: '15_17' as AgeBand },
      }),
    ).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
  });

  it('exposes Coach adaptation and synthetic voice through the deterministic registry', () => {
    expect(serviceRegistry.coachAdaptation.policyForAgeBand('9_11')).toMatchObject({
      ok: true,
      data: { maximumSteps: 3 },
    });
    expect(serviceRegistry.syntheticVoice).toBeDefined();
  });
});
