import { existsSync, readFileSync } from 'node:fs';

import { beforeEach, describe, expect, it } from 'vitest';

import { P0_RECYCLING_TEMPLATE } from '../src/features/tasks/demoContent';
import { resources } from '../src/i18n/resources';
import type { ProjectionEligibilityContext } from '../src/models/familyGrowth';
import { serviceRegistry } from '../src/services';
import { createSubmittedP0Session, PREPARED_PRAISE } from '../src/services/mock/fixtures';
import type { PrototypeStoreState } from '../src/state/usePrototypeStore';
import { usePrototypeStore } from '../src/state/usePrototypeStore';

const PRAISE = PREPARED_PRAISE;

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): asserts result is {
  readonly ok: true;
  readonly data: T;
} {
  expect(result.ok).toBe(true);
}

function counters(state: PrototypeStoreState = usePrototypeStore.getState()) {
  return {
    salemSeeds: state.children.child_salem.earnedSeeds,
    mangroveSeeds: state.landscapeProgress.mangrove.cumulativeSeeds,
    mangroveStage: state.landscapeProgress.mangrove.stage,
    mangroveNextThreshold: state.landscapeProgress.mangrove.nextThreshold,
    canopyLeaves: state.household.combinedCanopy.contributionLeaves,
    circleActions: state.circleGoal.eligibleGreenActions,
  };
}

function recognizeP0() {
  expectOk(
    usePrototypeStore.getState().planConfirmation({
      submissionId: 'submission_recycling_p0_v1_attempt_1',
      praise: PRAISE,
      neutralObservation: null,
      uncertainty: null,
    }),
  );
  expectOk(
    usePrototypeStore.getState().markPraisePresented({
      actionId: 'us4-praise',
      source: 'parent_press',
      presentedAt: '2026-08-26T10:00:00.000Z',
    }),
  );
  return usePrototypeStore.getState().applyRecognition({
    actionId: 'us4-recognition',
    source: 'parent_press',
    observedRenderState: 'praise_presented',
    presentationActionId: 'us4-praise',
  });
}

const VALID_CONTEXT: ProjectionEligibilityContext = {
  schemaVersion: '1.0',
  categoryId: 'green_impact',
  recognitionMode: 'standard',
  routinePhase: 'acquisition',
  visibilityScope: 'household',
  circleEligible: true,
  consequenceKind: 'rewarded_acquisition',
  confirmed: true,
  prohibitedSharedFieldsPresent: false,
};

describe('US4 symbolic garden and privacy-safe circle consequence', () => {
  beforeEach(() => {
    usePrototypeStore.getState().setRole('parent');
    expectOk(usePrototypeStore.getState().resetPrototype());
    usePrototypeStore.setState(createSubmittedP0Session());
  });

  it('has authored garden and circle routes for the static consequence and cooperative aggregate', () => {
    expect(
      existsSync(new URL('../app/garden.tsx', import.meta.url)),
      '/garden must be an authored Feature 003 route',
    ).toBe(true);
    expect(
      existsSync(new URL('../app/circle.tsx', import.meta.url)),
      '/circle must be an authored Feature 003 route',
    ).toBe(true);
  });

  it('changes exactly the four canonical counters and crosses Shoot to Sapling once', () => {
    expect(counters()).toEqual({
      salemSeeds: 48,
      mangroveSeeds: 48,
      mangroveStage: 'shoot',
      mangroveNextThreshold: 60,
      canopyLeaves: 19,
      circleActions: 11,
    });

    const result = recognizeP0();
    expectOk(result);
    expect(result.data).toMatchObject({
      disposition: 'applied',
      receipt: {
        seedTransaction: {
          amount: 12,
          balanceBefore: 48,
          balanceAfter: 60,
          meaning: 'symbolic_nonfinancial',
        },
        landscapeGrowth: {
          landscapeId: 'mangrove',
          seedsBefore: 48,
          seedsAfter: 60,
          stageBefore: 'shoot',
          stageAfter: 'sapling',
          crossedThreshold: 60,
          symbolicOnly: true,
        },
        canopyContribution: {
          actionKind: 'eligible_household_acquisition',
          leafDelta: 1,
          origin: 'synthetic',
        },
        circleEvent: {
          actionKind: 'eligible_green_action',
          actionDelta: 1,
          sourceScope: 'household',
          origin: 'synthetic_local',
        },
      },
    });
    expect(counters()).toEqual({
      salemSeeds: 60,
      mangroveSeeds: 60,
      mangroveStage: 'sapling',
      mangroveNextThreshold: 120,
      canopyLeaves: 20,
      circleActions: 12,
    });
  });

  it('uses one coarse eligible Green action rather than Seeds or a Child/task record', () => {
    const plan = serviceRegistry.familyProjection.planAfterConfirmation(VALID_CONTEXT);
    expectOk(plan);
    expect(plan.data.circleEvent).toEqual({
      actionKind: 'eligible_green_action',
      actionDelta: 1,
      sourceScope: 'household',
      origin: 'synthetic_local',
    });
    expect(plan.data.circleEvent).not.toHaveProperty('seeds');
    expect(plan.data.circleEvent).not.toHaveProperty('childId');
    expect(plan.data.circleEvent).not.toHaveProperty('taskId');
    expect(plan.data.circleEvent).not.toHaveProperty('media');
    expect(plan.data.circleEvent).not.toHaveProperty('reflection');
  });

  it.each([
    ['private', { ...VALID_CONTEXT, visibilityScope: 'child_guardian', circleEligible: false }],
    ['non-Green', { ...VALID_CONTEXT, categoryId: 'home_responsibility' }],
    ['sensitive', { ...VALID_CONTEXT, prohibitedSharedFieldsPresent: true }],
    ['identity-bearing', { ...VALID_CONTEXT, childId: 'child_salem' }],
    ['Seed-bearing', { ...VALID_CONTEXT, seedAmount: 12 }],
    [
      'invalid recognition pair',
      {
        ...VALID_CONTEXT,
        recognitionMode: 'recognition_only',
        routinePhase: 'acquisition',
      },
    ],
  ] as const)('rejects or excludes %s projection before any shared mutation', (_label, input) => {
    const baseline = counters();
    const validated = serviceRegistry.familyProjection.validateEligibilityContext(input);

    if (input.visibilityScope === 'child_guardian' && !input.circleEligible) {
      expectOk(validated);
      const plan = serviceRegistry.familyProjection.planAfterConfirmation(validated.data);
      expectOk(plan);
      expect(plan.data).toMatchObject({
        canopyContribution: null,
        circleEvent: null,
        canopyRejection: 'private_scope',
        circleRejection: 'private_scope',
      });
    } else if (validated.ok) {
      expect(serviceRegistry.familyProjection.planAfterConfirmation(validated.data)).toMatchObject({
        ok: false,
        error: { code: 'PRIVACY_REJECTED' },
      });
    } else {
      expect(validated).toMatchObject({ ok: false, error: { code: 'PRIVACY_REJECTED' } });
    }

    expect(counters()).toEqual(baseline);
  });

  it('returns the same static final state for motion-independent presentation', () => {
    const result = recognizeP0();
    expectOk(result);
    const authoritativeStaticState = {
      counters: counters(),
      stage: result.data.receipt.landscapeGrowth?.stageAfter,
      cause: PRAISE,
      symbolicOnly: result.data.receipt.landscapeGrowth?.symbolicOnly,
    };

    for (const presentationMode of ['animated', 'reduced_motion', 'motion_unavailable'] as const) {
      expect({ ...authoritativeStaticState, presentationMode }).toMatchObject({
        counters: {
          salemSeeds: 60,
          mangroveSeeds: 60,
          mangroveStage: 'sapling',
          canopyLeaves: 20,
          circleActions: 12,
        },
        stage: 'sapling',
        cause: PRAISE,
        symbolicOnly: true,
        presentationMode,
      });
    }
  });

  it('states practical symbolic sustainability meaning without a measured-impact or planted-tree claim', () => {
    expect(P0_RECYCLING_TEMPLATE.whyItMatters).toEqual({
      ar: 'يساعد الفرز الدقيق الأسرة على التعامل بمسؤولية مع المواد القابلة لإعادة التدوير. هذه صلة عملية بالاستدامة، وليست قياساً لكمية الكربون أو الماء أو النفايات، ولا تعني زراعة شجرة حقيقية.',
      en: 'Careful sorting helps the household handle recyclable materials responsibly. This is a practical sustainability connection, not a quantified carbon, water, waste, or real-tree claim.',
    });
    expect(P0_RECYCLING_TEMPLATE.whyItMatters.en).toContain('not a quantified');
    expect(P0_RECYCLING_TEMPLATE.whyItMatters.en).toContain('not a');
    expect(P0_RECYCLING_TEMPLATE.whyItMatters.ar).toContain('لا تعني زراعة شجرة حقيقية');
  });

  it('keeps direct garden/circle reads and a duplicate recognition from inferring another completion', () => {
    const first = recognizeP0();
    expectOk(first);
    const afterFirst = counters();
    const receipt = structuredClone(first.data.receipt);

    // Garden and circle reads must leave the stored counters unchanged.
    expect(serviceRegistry.garden.stageForSeeds(afterFirst.mangroveSeeds)).toBe('sapling');
    expect(serviceRegistry.garden.nextThresholdForSeeds(afterFirst.mangroveSeeds)).toBe(120);
    expect(counters()).toEqual(afterFirst);

    const duplicate = usePrototypeStore.getState().applyRecognition({
      actionId: 'us4-duplicate',
      source: 'parent_press',
      observedRenderState: 'praise_presented',
      presentationActionId: 'us4-praise',
    });
    expect(duplicate).toMatchObject({
      ok: true,
      data: { disposition: 'already_confirmed', receipt },
    });
    expect(counters()).toEqual(afterFirst);
  });

  it('keeps garden route entry read-only and consumes the one-time reveal only on explicit continuation', () => {
    const source = readFileSync(new URL('../app/garden.tsx', import.meta.url), 'utf8');
    const entryEffects = source.match(/useEffect\([\s\S]*?\);/g) ?? [];
    expect(entryEffects.join('\n')).not.toContain('consumeCelebration');
    expect(source).toContain('const openCircle = () =>');
    expect(source).toMatch(
      /const openCircle = \(\) =>[\s\S]*consumeCelebration\(\)[\s\S]*router\.push\('\/circle'\)/,
    );
    expect(source).toContain('onPress={openCircle}');
  });

  it('keeps Mangrove as the sole detailed hero and presents the other four tracks as compact connected markers', () => {
    const landscapeSource = readFileSync(
      new URL('../src/components/family-growth/GardenLandscape.tsx', import.meta.url),
      'utf8',
    );

    expect(landscapeSource).toContain('testID="active-landscape-hero"');
    expect(landscapeSource).toContain('const supportingLandscapeIds = LANDSCAPE_ORDER.filter');
    expect(landscapeSource).toContain('<CompactHorizonTrack');
    expect(landscapeSource).toContain('testID={`compact-landscape-${id}`}');
    expect(landscapeSource).toContain('{content.stageLabel}');
    expect(landscapeSource).toContain('{content.progressLabel}');
    expect(landscapeSource).toMatch(/direction="ltr"[\s\S]{0,180}\{content\.progressLabel\}/);
    expect(landscapeSource).not.toMatch(/LANDSCAPE_ORDER\.map\([\s\S]{0,600}<LandscapeTrack/);
  });

  it('uses direction-aware inline accents on the Arabic garden instead of a physical-left side tab', () => {
    const routeSource = readFileSync(new URL('../app/garden.tsx', import.meta.url), 'utf8');

    expect(routeSource).toContain(
      'const direction = usePrototypeStore((state) => state.direction)',
    );
    expect(routeSource).toContain(
      "direction === 'rtl' ? styles.inlineAccentRtl : styles.inlineAccentLtr",
    );
    expect(routeSource).toMatch(/inlineAccentRtl:\s*\{[\s\S]{0,160}flexDirection:\s*'row'/);
    expect(routeSource).not.toMatch(/\bstart:\s*0/);
    expect(routeSource).not.toContain('borderStartWidth');
  });

  it('falls back when a resolved prepared image emits a load error and removes any stale selection', () => {
    const preparedMediaSource = readFileSync(
      new URL('../src/components/family-growth/PreparedMedia.tsx', import.meta.url),
      'utf8',
    );

    expect(preparedMediaSource).toContain('onError={handleImageLoadError}');
    expect(preparedMediaSource).toContain('setFailedImageId(fixture.id)');
    expect(preparedMediaSource).toContain('onUnavailable?.()');
    expect(preparedMediaSource).toMatch(
      /const selectable\s*=\s*!imageLoadFailed\s*&&\s*!unavailable/,
    );
  });

  it('resolves unknown, private, or malformed circle fixtures to one deny-by-default local state', async () => {
    const projection = await import('../src/features/circle/projection');
    const resolveCircleFixture: unknown = Reflect.get(projection, 'resolveCircleFixture');

    expect(resolveCircleFixture).toBeTypeOf('function');
    if (typeof resolveCircleFixture !== 'function') return;

    expect(
      resolveCircleFixture({
        eligibleGreenActions: 11,
        goal: 12,
        origin: 'synthetic_local',
      }),
    ).toEqual({
      status: 'available',
      current: 11,
      goal: 12,
      origin: 'synthetic_local',
    });

    expect(
      resolveCircleFixture({
        eligibleGreenActions: 13,
        goal: 12,
        origin: 'synthetic_local',
      }),
    ).toEqual({
      status: 'available',
      current: 13,
      goal: 12,
      origin: 'synthetic_local',
    });

    const unavailable = {
      status: 'unavailable',
      goal: 12,
      origin: 'local_fallback',
    };
    const malformedFixtures: readonly unknown[] = [
      null,
      undefined,
      {},
      '11 of 12',
      { eligibleGreenActions: -1, goal: 12, origin: 'synthetic_local' },
      { eligibleGreenActions: 11, goal: 0, origin: 'synthetic_local' },
      { eligibleGreenActions: 11, goal: 12, origin: 'remote' },
      {
        eligibleGreenActions: 11,
        goal: 12,
        origin: 'synthetic_local',
        childId: 'private-child',
        task: 'private-task',
      },
    ];

    for (const fixture of malformedFixtures) {
      const result = resolveCircleFixture(fixture);
      expect(result).toEqual(unavailable);
      expect(JSON.stringify(result)).not.toMatch(/private-child|private-task|childId|task/);
    }
  });

  it('renders the unavailable circle as a private household-goal fallback in both languages', () => {
    const circleRouteSource = readFileSync(new URL('../app/circle.tsx', import.meta.url), 'utf8');

    expect(circleRouteSource).toContain('resolveCircleFixture(circle)');
    expect(circleRouteSource).toContain("circleState.status === 'available'");
    expect(circleRouteSource).toContain('testID="circle-unavailable"');
    expect(circleRouteSource).toContain("t('circle.unavailablePrivacy')");
    expect(circleRouteSource).toContain("t('circle.unavailableGoal', { goal: circleState.goal })");

    for (const locale of ['ar', 'en'] as const) {
      const copy = resources[locale].translation.circle;
      expect(copy.unavailableTitle).toBeTruthy();
      expect(copy.unavailableBody).toBeTruthy();
      expect(copy.unavailablePrivacy).toBeTruthy();
      expect(copy.unavailableGoal).toContain('{{goal}}');
    }
  });
});
