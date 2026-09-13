import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveConfiguredChildAgeBand } from '@/features/local-family';
import type { AgeBand } from '@/models/familyGrowth';
import type { LocalFamilyView } from '@/models/localFamily';
import { serviceRegistry } from '@/services';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import { configureChildAgeForTest } from './helpers/configuredChildAge';
import {
  enterChildExperienceForTest,
  enterParentExperienceForTest,
  resetPrototypeForTest,
} from './helpers/prototypeStore';

function expectOk(result: { readonly ok: boolean }): void {
  expect(result.ok).toBe(true);
}

async function prepareTask(ageBand: AgeBand): Promise<void> {
  configureChildAgeForTest(ageBand);
  expectOk(
    usePrototypeStore.getState().createTaskDraft({
      childId: 'child_salem',
      templateId: 'task_recycling_p0_v1',
      parentText: {
        ar: 'افرز الورق والبلاستيك النظيفين اللذين وافق عليهما شخص بالغ، وتوقف واسأل شخصاً بالغاً عند الشك.',
        en: 'Sort the clean paper and plastic approved by an adult, and stop to ask an adult when unsure.',
      },
    }),
  );
  expectOk(usePrototypeStore.getState().reviewTask());
  expectOk(usePrototypeStore.getState().approveAssignment());
  await enterChildExperienceForTest('child_salem');
  expectOk(usePrototypeStore.getState().chooseAssignment('choice_recycling_p0_v1'));
  expectOk(usePrototypeStore.getState().startAssignment());
}

describe('configured Child age authority', () => {
  beforeEach(async () => {
    expectOk(resetPrototypeForTest());
    await enterParentExperienceForTest();
  });

  afterEach(() => vi.restoreAllMocks());

  it.each(['6_8', '9_11', '12_14'] as const)(
    'resolves %s from the configured directory without changing either fixture',
    (ageBand) => {
      const fixtures = structuredClone(usePrototypeStore.getState().children);
      configureChildAgeForTest(ageBand);
      const { localFamily, children } = usePrototypeStore.getState();
      expect(resolveConfiguredChildAgeBand(localFamily, 'child_salem')).toBe(ageBand);
      expect(resolveConfiguredChildAgeBand(localFamily, 'child_alya')).toBe(
        localFamily.record!.children[1]!.ageBand,
      );
      expect(children).toEqual(fixtures);
      expect(children.child_salem.ageBand).toBe('9_11');
    },
  );

  it.each([
    'unavailable',
    'missing_record',
    'unconfigured',
    'invalid_age',
    'invalid_sibling',
    'mismatched_directory',
    'unknown_profile',
  ] as const)('fails closed for %s without a fixture fallback', (condition) => {
    const view = structuredClone(usePrototypeStore.getState().localFamily);
    const record = view.record!;
    const altered =
      condition === 'unavailable'
        ? { ...view, status: 'unavailable' }
        : condition === 'missing_record'
          ? { ...view, record: null }
          : condition === 'unconfigured'
            ? { ...view, configuredChildIds: ['child_alya'] }
            : condition === 'mismatched_directory'
              ? { ...view, configuredChildIds: ['child_salem', 'child_salem'] }
              : condition === 'invalid_age' || condition === 'invalid_sibling'
                ? {
                    ...view,
                    record: {
                      ...record,
                      children: record.children.map((child, index) =>
                        index === (condition === 'invalid_age' ? 0 : 1)
                          ? { ...child, ageBand: '15_17' }
                          : child,
                      ),
                    },
                  }
                : {
                    ...view,
                    record: { ...record, children: record.children.slice(0, 1) },
                    configuredChildIds: ['child_salem'],
                  };
    expect(
      resolveConfiguredChildAgeBand(
        altered as unknown as LocalFamilyView,
        condition === 'unknown_profile' ? 'child_alya' : 'child_salem',
      ),
    ).toBeNull();
  });

  it.each([
    ['6_8', 1, 'very_short'],
    ['9_11', 3, 'friendly_clear'],
    ['12_14', 3, 'respectful_mature'],
  ] as const)(
    'uses %s for prepared Coach requests and output policy',
    async (ageBand, count, tone) => {
      const fixtures = structuredClone(usePrototypeStore.getState().children);
      await prepareTask(ageBand);
      const respond = vi.spyOn(serviceRegistry.childCoach, 'respond');
      expectOk(
        await usePrototypeStore.getState().requestChildCoach({
          requestId: `configured_${ageBand}`,
          intent: 'show_steps',
        }),
      );
      expect(respond).toHaveBeenCalledWith(
        expect.objectContaining({ child: { id: 'child_salem', ageBand, synthetic: true } }),
      );
      expect(usePrototypeStore.getState().ageAdaptedCoachResult).toMatchObject({
        ageBand,
        policy: { ageBand, maximumSteps: count, tone },
        steps: expect.any(Array),
      });
      expect(usePrototypeStore.getState().ageAdaptedCoachResult!.steps).toHaveLength(count);
      expect(usePrototypeStore.getState().children).toEqual(fixtures);
    },
  );

  it('discards pending prepared Coach output when configured age changes', async () => {
    await prepareTask('12_14');
    const originalRespond = serviceRegistry.childCoach.respond.bind(serviceRegistry.childCoach);
    let release!: () => void;
    const wait = new Promise<void>((resolve) => {
      release = resolve;
    });
    vi.spyOn(serviceRegistry.childCoach, 'respond').mockImplementation(async (request) => {
      const result = await originalRespond(request);
      await wait;
      return result;
    });
    const pending = usePrototypeStore.getState().requestChildCoach({
      requestId: 'configured_pending',
      intent: 'show_steps',
    });
    configureChildAgeForTest('6_8');
    release();
    expect(await pending).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(usePrototypeStore.getState().childCoachResult).toBeNull();
    expect(usePrototypeStore.getState().ageAdaptedCoachResult).toBeNull();
  });

  it('does not request prepared or live Coach content or bind voice without a valid configured age', async () => {
    await prepareTask('9_11');
    const localFamily = usePrototypeStore.getState().localFamily;
    usePrototypeStore.setState({ localFamily: { ...localFamily, record: null } });
    const respond = vi.spyOn(serviceRegistry.childCoach, 'respond');
    expect(
      await usePrototypeStore
        .getState()
        .requestChildCoach({ requestId: 'missing_age', intent: 'show_steps' }),
    ).toMatchObject({ ok: false });
    expect(usePrototypeStore.getState().prepareChildVoice()).toMatchObject({ ok: false });
    expect(
      await usePrototypeStore.getState().requestLiveChildCoach({
        requestId: 'missing_age_request',
        bindingNonce: 'missing_age_binding',
        intent: 'first_step',
      }),
    ).toMatchObject({ ok: false });
    expect(respond).not.toHaveBeenCalled();
  });
});
