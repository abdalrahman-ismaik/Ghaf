import { describe, expect, it } from 'vitest';

import {
  createMasroofiRuntime,
  eligibleJourney,
  MASROOFI_DEFAULT_CONTROLS,
  MASROOFI_MAX_BALANCE_FILS,
  masroofiService as service,
} from '../../src/features/masroofi/service';
import { P0_RECYCLING_TEMPLATE, TASK_TEMPLATES } from '../../src/features/tasks/demoContent';
import type {
  CompletionMode,
  RecognitionReceipt,
  SyntheticChildId,
  TaskJourney,
  TaskTemplate,
} from '../../src/models/familyGrowth';
import type {
  MasroofiControls,
  MasroofiPurchaseInput,
  MasroofiResult,
  MasroofiRuntime,
} from '../../src/models/masroofi';

const parent = { role: 'parent' } as const;
const child = { role: 'child', childId: 'child_salem' } as const;
const day = '2026-09-13';
const timestamp = `${day}T10:00:00.000Z`;

it('does not allow Parent attestation to override a known under-10 competition age', () => {
  const input = {
    actor: parent,
    childId: 'child_salem' as const,
    ageBand: '9_11' as const,
    age10PlusConfirmed: true,
  };
  expect(service.enable(createMasroofiRuntime(), { ...input, knownAge: 9 }).ok).toBe(false);
  expect(
    service.enable(createMasroofiRuntime(), { ...input, childId: 'child_alya', knownAge: 11 }).ok,
  ).toBe(true);
});

function ok<T>(result: MasroofiResult<T>): T {
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

function assigned(
  template: TaskTemplate = P0_RECYCLING_TEMPLATE,
  childId: SyntheticChildId = 'child_salem',
  version = 1,
): TaskJourney {
  return {
    lifecycle: 'assigned',
    task: {
      id: `task:${template.id}`,
      version,
      templateId: template.id,
      targetChildId: childId,
      parentOriginalText: template.positiveAction,
      acceptedGuideFixtureId: null,
      content: structuredClone(template),
      origin: 'synthetic',
      approvedAgeBand: '9_11',
    },
    assignment: {
      id: `assignment:${template.id}:${childId}`,
      taskId: `task:${template.id}`,
      taskVersion: version,
      childId,
      approvedByParent: true,
      approvalSequence: 1,
      createdAt: timestamp,
    },
    submission: null,
    checkIn: null,
  };
}

function enabled(childId: SyntheticChildId = 'child_salem', runtime = createMasroofiRuntime()) {
  return ok(
    service.enable(runtime, {
      actor: parent,
      childId,
      ageBand: '9_11',
      age10PlusConfirmed: true,
    }),
  );
}

function controls(runtime: MasroofiRuntime, patch: Partial<MasroofiControls>) {
  return ok(
    service.setControls(runtime, {
      actor: parent,
      childId: 'child_salem',
      controls: { ...MASROOFI_DEFAULT_CONTROLS, ...patch },
    }),
  );
}

function funded(amountFils = 2000) {
  return ok(
    service.topUp(enabled(), {
      actor: parent,
      childId: 'child_salem',
      amountFils,
      requestId: 'fund:1',
      day,
    }),
  );
}

function promised(journey = assigned(), runtime = enabled()) {
  return ok(service.promise(runtime, { actor: parent, journey, amountFils: 500 }));
}

function recognized(source = assigned(), completionMode: CompletionMode = 'independent') {
  const recognitionKey = `recognition:${source.assignment!.id}:${source.task.version}`;
  const submissionId = `submission:${source.assignment!.id}:${source.task.version}`;
  const checkInId = `checkin:${submissionId}`;
  const journey: TaskJourney = {
    ...source,
    lifecycle: 'recognized',
    submission: {
      id: submissionId,
      assignmentId: source.assignment!.id,
      taskVersion: source.task.version,
      attempt: 2,
      definitionAcknowledged: true,
      completionMode,
      helpUsed: completionMode === 'permitted_help' ? source.task.content.permittedHelp : null,
      preparedMediaFixtureId: null,
      reflection: null,
      observableFacts: [],
      submittedAt: timestamp,
    },
    checkIn: {
      id: checkInId,
      submissionId,
      decision: 'confirm',
      praise: { ar: 'رتبت المواد المتفق عليها.', en: 'You sorted the agreed materials.' },
      neutralObservation: null,
      uncertainty: null,
      replacementTaskId: null,
      recognitionKey,
      confirmationPresentation: 'recognition_applied',
      praisePresentedAt: timestamp,
      createdAt: timestamp,
    },
  };
  const receipt: RecognitionReceipt = {
    recognitionKey,
    checkInId,
    provenance: {
      schemaVersion: 'r003.recognition-provenance.v1',
      taskId: source.task.id,
      taskVersion: source.task.version,
      submissionId,
      profileId: source.task.targetChildId,
      landscapeId: source.task.content.landscapeId,
      completionMode,
      projection: {
        schemaVersion: '1.0',
        categoryId: source.task.content.categoryId,
        recognitionMode: source.task.content.recognitionMode,
        routinePhase: 'acquisition',
        visibilityScope: source.task.content.visibilityScope,
        circleEligible: source.task.content.circleEligible,
        consequenceKind: 'rewarded_acquisition',
        confirmed: true,
        prohibitedSharedFieldsPresent: false,
      },
      recurrence: source.task.content.recurrence,
      routineCompletionCountBefore: 0,
      routineCompletionCountAfter: 1,
      familyRewardEligible: true,
      challengeLeafEligible: false,
    },
    seedTransaction: {
      id: `seeds:${recognitionKey}`,
      recognitionKey,
      childId: source.task.targetChildId,
      amount: source.task.content.displayedSeedAward!,
      balanceBefore: 108,
      balanceAfter: 108 + source.task.content.displayedSeedAward!,
      meaning: 'symbolic_nonfinancial',
    },
    landscapeGrowth: null,
    canopyContribution: null,
    circleEvent: null,
    phaseReview: null,
  };
  return { actor: parent, journey, receipt, day };
}

function purchaseInput(overrides: Partial<MasroofiPurchaseInput> = {}): MasroofiPurchaseInput {
  return {
    actor: child,
    childId: child.childId,
    fixtureId: 'stationery',
    requestId: 'buy:1',
    day,
    ...overrides,
  };
}

describe('Masroofi enablement and private authority', () => {
  it('begins empty; enabling never creates money and cannot reset existing credit', () => {
    expect(createMasroofiRuntime()).toEqual({ cards: {}, promises: [], transactions: [] });
    expect(enabled().cards.child_salem?.balanceFils).toBe(0);
    const runtime = funded();
    expect(enabled('child_salem', runtime)).toBe(runtime);
    expect(createMasroofiRuntime()).not.toBe(createMasroofiRuntime());
  });

  it.each([
    ['6_8', true],
    ['9_11', false],
    ['12_14', false],
  ] as const)('rejects age band %s with attestation %s', (ageBand, age10PlusConfirmed) => {
    expect(
      service.enable(createMasroofiRuntime(), {
        actor: parent,
        childId: child.childId,
        ageBand,
        age10PlusConfirmed,
      }),
    ).toMatchObject({ ok: false, error: { code: 'age_ineligible' } });
  });

  it('requires Parent authority and rejects another Child profile', () => {
    expect(
      service.enable(createMasroofiRuntime(), {
        actor: child,
        childId: child.childId,
        ageBand: '12_14',
        age10PlusConfirmed: true,
      }),
    ).toMatchObject({ ok: false, error: { code: 'parent_required' } });
    const runtime = promised();
    expect(service.projectParent(runtime, { actor: child, childId: child.childId }).ok).toBe(false);
    expect(service.projectChild(runtime, { actor: child, childId: 'child_alya' }).ok).toBe(false);
    expect(service.purchase(runtime, purchaseInput({ childId: 'child_alya' })).ok).toBe(false);
    expect(service.purchase(runtime, purchaseInput({ actor: parent })).ok).toBe(false);
  });

  it('projects only own activity and omits every unearned amount from the Child DTO', () => {
    let runtime = promised();
    runtime = enabled('child_alya', runtime);
    runtime = ok(
      service.promise(runtime, {
        actor: parent,
        journey: assigned(
          TASK_TEMPLATES.find((item) => item.id === 'HR01')!,
          'child_alya',
        ),
        amountFils: 987,
      }),
    );
    const view = ok(service.projectChild(runtime, { actor: child, childId: child.childId }));
    expect(view.transactions).toEqual([]);
    expect(view.promisedTasks).toEqual([
      { assignmentId: assigned().assignment!.id, taskVersion: 1 },
    ]);
    expect(JSON.stringify(view)).not.toMatch(
      /amountFils|:500[,}]|:987[,}]|child_alya|contentFingerprint/,
    );
    const parentView = ok(
      service.projectParent(runtime, { actor: parent, childId: child.childId }),
    );
    expect(parentView.promises.map((promise) => promise.amountFils)).toEqual([500]);
    (view.card!.controls.allowedCategories as string[]).push('games');
    expect(runtime.cards.child_salem!.controls.allowedCategories).toEqual(['stationery']);
  });
});

describe('Masroofi fixed task agreements and recognition', () => {
  it('accepts only exact finite Green/home templates and excludes school preparation', () => {
    const accepted = [...TASK_TEMPLATES, P0_RECYCLING_TEMPLATE]
      .filter((template) => eligibleJourney(assigned(template)))
      .map((template) => template.id);
    expect(accepted.sort()).toEqual([
      'GI01',
      'GI02',
      'GI03',
      'HR01',
      'HR05',
      'task_recycling_p0_v1',
    ]);
  });

  it.each([
    { positiveAction: { ar: 'نص مختلف', en: 'Do a different task' } },
    { title: { ar: 'نص مختلف', en: 'A different title' } },
    { routinePhase: 'maintenance', displayedSeedAward: null },
    { recognitionMode: 'recognition_only' },
    { categoryId: 'faith_gratitude' },
    { displayedSeedAward: 15 },
    { catalogExecution: undefined },
  ] satisfies Partial<TaskTemplate>[])(
    'fails closed for modified canonical content %j',
    (patch) => {
      const journey = assigned(TASK_TEMPLATES.find((item) => item.id === 'HR01')!);
      const modified = {
        ...journey,
        task: { ...journey.task, content: { ...journey.task.content, ...patch } },
      };
      expect(
        service.promise(enabled(), { actor: parent, journey: modified, amountFils: 500 }),
      ).toMatchObject({ ok: false, error: { code: 'task_ineligible' } });
    },
  );

  it.each(['chosen', 'in_progress', 'submitted', 'retry', 'confirmed', 'recognized'] as const)(
    'cannot attach a new reward after acceptance (%s)',
    (lifecycle) => {
      expect(
        service.promise(enabled(), {
          actor: parent,
          journey: { ...assigned(), lifecycle },
          amountFils: 500,
        }),
      ).toMatchObject({ ok: false, error: { code: 'task_not_available' } });
    },
  );

  it('locks the Parent amount and assignment identity without mutating the input', () => {
    const original = enabled();
    const journey = assigned();
    const runtime = promised(journey, original);
    expect(original.promises).toEqual([]);
    expect(ok(service.promise(runtime, { actor: parent, journey, amountFils: 500 }))).toBe(runtime);
    expect(service.promise(runtime, { actor: parent, journey, amountFils: 400 })).toMatchObject({
      ok: false,
      error: { code: 'promise_locked' },
    });
    expect(
      service.promise(enabled(), {
        actor: parent,
        journey: { ...journey, assignment: { ...journey.assignment!, childId: 'child_alya' } },
        amountFils: 500,
      }),
    ).toMatchObject({ ok: false, error: { code: 'task_ineligible' } });
  });

  it.each([0, -100, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 10001])(
    'rejects invalid reward fils %s',
    (amountFils) => {
      expect(
        service.promise(enabled(), { actor: parent, journey: assigned(), amountFils }),
      ).toMatchObject({ ok: false, error: { code: 'invalid_amount' } });
    },
  );

  it.each(['independent', 'permitted_help'] as const)(
    'credits exactly once after praise/recognition, including %s and a retry',
    (mode) => {
      const source = promised();
      const recognition = recognized(assigned(), mode);
      const runtime = ok(service.credit(source, recognition));
      expect(runtime.cards.child_salem!.balanceFils).toBe(500);
      expect(runtime.transactions).toHaveLength(1);
      expect(runtime.promises[0]!.status).toBe('credited');
      expect(source.cards.child_salem!.balanceFils).toBe(0);
      expect(ok(service.credit(runtime, recognition))).toBe(runtime);
      const view = ok(service.projectChild(runtime, { actor: child, childId: child.childId }));
      expect(view.promisedTasks).toEqual([]);
      expect(view.transactions[0]!.amountFils).toBe(500);
    },
  );

  it('freeze blocks spending but never removes a credit already promised', () => {
    const runtime = controls(promised(), { frozen: true });
    const credited = ok(service.credit(runtime, recognized()));
    expect(credited.cards.child_salem!.balanceFils).toBe(500);
    expect(ok(service.purchase(credited, purchaseInput())).transactions.at(-1)?.declineReason).toBe(
      'card_frozen',
    );
  });

  it.each(['submitted', 'retry', 'confirmed'] as const)(
    'never credits at the %s stage',
    (lifecycle) => {
      const input = recognized();
      expect(
        service.credit(promised(), { ...input, journey: { ...input.journey, lifecycle } }),
      ).toMatchObject({ ok: false, error: { code: 'recognition_required' } });
    },
  );

  it('requires matching praise, submission and receipt provenance', () => {
    const input = recognized();
    const mismatchedReceipt = {
      ...input.receipt,
      provenance: { ...input.receipt.provenance, profileId: 'child_alya' as const },
    };
    expect(service.credit(promised(), { ...input, receipt: mismatchedReceipt })).toMatchObject({
      ok: false,
      error: { code: 'recognition_mismatch' },
    });
    expect(
      service.credit(promised(), {
        ...input,
        journey: {
          ...input.journey,
          checkIn: { ...input.journey.checkIn!, praisePresentedAt: null },
        },
      }),
    ).toMatchObject({ ok: false, error: { code: 'recognition_required' } });
    expect(
      service.credit(promised(), {
        ...input,
        receipt: { ...input.receipt, seedTransaction: null },
      }),
    ).toMatchObject({ ok: false, error: { code: 'recognition_mismatch' } });
  });

  it('does not pay a stale agreement after a version adaptation; a new exact agreement can be credited', () => {
    const runtime = promised();
    const versionTwo = assigned(P0_RECYCLING_TEMPLATE, 'child_salem', 2);
    expect(ok(service.credit(runtime, recognized(versionTwo)))).toBe(runtime);
    const next = ok(
      service.promise(runtime, { actor: parent, journey: versionTwo, amountFils: 300 }),
    );
    const credited = ok(service.credit(next, recognized(versionTwo)));
    expect(credited.cards.child_salem!.balanceFils).toBe(300);
    expect(credited.promises.map((promise) => promise.status)).toEqual(['promised', 'credited']);
    expect(credited.promises.map((promise) => promise.amountFils)).toEqual([500, 300]);
  });

  it('no-ops tasks without a promise and reserves room for every locked reward', () => {
    const runtime = enabled();
    expect(ok(service.credit(runtime, recognized()))).toBe(runtime);
    const nearlyFull: MasroofiRuntime = {
      ...runtime,
      cards: {
        child_salem: {
          ...runtime.cards.child_salem!,
          balanceFils: MASROOFI_MAX_BALANCE_FILS - 500,
        },
      },
    };
    const agreement = promised(assigned(), nearlyFull);
    expect(
      service.topUp(agreement, {
        actor: parent,
        childId: child.childId,
        amountFils: 1,
        requestId: 'too-full',
        day,
      }),
    ).toMatchObject({ ok: false, error: { code: 'balance_limit' } });
    expect(ok(service.credit(agreement, recognized())).cards.child_salem!.balanceFils).toBe(
      MASROOFI_MAX_BALANCE_FILS,
    );
  });
});

describe('Masroofi finite practice spending', () => {
  it.each([
    ['card_disabled', createMasroofiRuntime()],
    ['insufficient_balance', enabled()],
    ['card_frozen', controls(funded(), { frozen: true })],
    ['category_blocked', controls(funded(), { allowedCategories: [] })],
    ['per_purchase_limit', controls(funded(), { perPurchaseLimitFils: 200 })],
    ['daily_limit', controls(funded(), { dailyLimitFils: 200 })],
  ] as const)('declines %s with zero debit', (declineReason, runtime) => {
    const before = runtime.cards.child_salem?.balanceFils;
    const next = ok(service.purchase(runtime, purchaseInput()));
    expect(next.cards.child_salem?.balanceFils).toBe(before);
    expect(next.transactions.at(-1)).toMatchObject({ status: 'declined', declineReason });
  });

  it('enforces category and online permissions independently', () => {
    let runtime = funded();
    expect(
      ok(service.purchase(runtime, purchaseInput({ fixtureId: 'game_online' }))).transactions.at(-1)
        ?.declineReason,
    ).toBe('category_blocked');
    runtime = controls(runtime, { allowedCategories: ['stationery', 'games'] });
    expect(
      ok(service.purchase(runtime, purchaseInput({ fixtureId: 'game_online' }))).transactions.at(-1)
        ?.declineReason,
    ).toBe('online_blocked');
    runtime = controls(runtime, {
      allowedCategories: ['stationery', 'games'],
      onlineAllowed: true,
    });
    const bought = ok(service.purchase(runtime, purchaseInput({ fixtureId: 'game_online' })));
    expect(bought.cards.child_salem!.balanceFils).toBe(800);
  });

  it('debits once per unique request; a conflicting fixture/day/profile never reuses a request', () => {
    const original = funded();
    const bought = ok(service.purchase(original, purchaseInput()));
    expect(bought.cards.child_salem!.balanceFils).toBe(1700);
    expect(original.cards.child_salem!.balanceFils).toBe(2000);
    expect(ok(service.purchase(bought, purchaseInput()))).toBe(bought);
    for (const override of [{ fixtureId: 'game_online' as const }, { day: '2026-09-14' }]) {
      expect(service.purchase(bought, purchaseInput(override))).toMatchObject({
        ok: false,
        error: { code: 'request_conflict' },
      });
    }
    const sibling = enabled('child_alya', bought);
    expect(
      service.purchase(
        sibling,
        purchaseInput({ actor: { role: 'child', childId: 'child_alya' }, childId: 'child_alya' }),
      ),
    ).toMatchObject({ ok: false, error: { code: 'request_conflict' } });
  });

  it('retains a declined attempt after controls change; only an explicit fresh request can purchase', () => {
    const declined = ok(service.purchase(enabled(), purchaseInput()));
    const runtime = ok(
      service.topUp(declined, {
        actor: parent,
        childId: child.childId,
        amountFils: 1000,
        requestId: 'fund-new',
        day,
      }),
    );
    expect(ok(service.purchase(runtime, purchaseInput()))).toBe(runtime);
    expect(
      ok(service.purchase(runtime, purchaseInput({ requestId: 'buy:2' }))).cards.child_salem!
        .balanceFils,
    ).toBe(700);
  });

  it('counts approved purchases only toward the injected day and keeps balance across days', () => {
    let runtime = controls(funded(), { dailyLimitFils: 500 });
    runtime = ok(service.purchase(runtime, purchaseInput()));
    runtime = ok(service.purchase(runtime, purchaseInput({ requestId: 'buy:2' })));
    expect(runtime.transactions.at(-1)?.declineReason).toBe('daily_limit');
    runtime = ok(
      service.purchase(runtime, purchaseInput({ requestId: 'buy:3', day: '2026-09-14' })),
    );
    expect(runtime.transactions.at(-1)?.status).toBe('approved');
    expect(runtime.cards.child_salem!.balanceFils).toBe(1400);
  });

  it('top-up retries are idempotent and cross-operation request reuse fails', () => {
    const runtime = funded();
    expect(
      ok(
        service.topUp(runtime, {
          actor: parent,
          childId: child.childId,
          amountFils: 2000,
          requestId: 'fund:1',
          day,
        }),
      ),
    ).toBe(runtime);
    expect(
      service.topUp(runtime, {
        actor: parent,
        childId: child.childId,
        amountFils: 1000,
        requestId: 'fund:1',
        day,
      }),
    ).toMatchObject({ ok: false, error: { code: 'request_conflict' } });
    expect(service.purchase(runtime, purchaseInput({ requestId: 'fund:1' }))).toMatchObject({
      ok: false,
      error: { code: 'request_conflict' },
    });
    expect(
      service.topUp(runtime, {
        actor: child,
        childId: child.childId,
        amountFils: 2000,
        requestId: 'fund:2',
        day,
      }).ok,
    ).toBe(false);
  });

  it('rejects unknown items, impossible dates and unsafe request identifiers', () => {
    for (const patch of [
      { fixtureId: 'unknown' as MasroofiPurchaseInput['fixtureId'] },
      { day: '2026-02-30' },
      { day: '' },
      { requestId: '' },
      { requestId: 'reward:reserved' },
    ])
      expect(service.purchase(funded(), purchaseInput(patch))).toMatchObject({
        ok: false,
        error: { code: 'invalid_request' },
      });
  });

  it('rejects invalid controls and does not mutate Parent-supplied arrays', () => {
    for (const patch of [
      { perPurchaseLimitFils: 1.5 },
      { dailyLimitFils: 0 },
      { allowedCategories: ['games', 'games'] as const },
    ])
      expect(
        service.setControls(enabled(), {
          actor: parent,
          childId: child.childId,
          controls: { ...MASROOFI_DEFAULT_CONTROLS, ...patch },
        }),
      ).toMatchObject({ ok: false, error: { code: 'invalid_controls' } });
    const categories: ('stationery' | 'games')[] = ['stationery'];
    const runtime = controls(enabled(), { allowedCategories: categories });
    categories.push('games');
    expect(runtime.cards.child_salem!.controls.allowedCategories).toEqual(['stationery']);
  });
});
