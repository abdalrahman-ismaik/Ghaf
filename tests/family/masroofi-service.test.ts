import { describe, expect, it } from 'vitest';

import {
  createMasroofiRuntime,
  eligibleJourney,
  MASROOFI_DEFAULT_CONTROLS,
  MASROOFI_MAX_BALANCE_FILS,
  MASROOFI_PURCHASE_FIXTURES,
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
import { MASROOFI_CATEGORIES } from '../../src/models/masroofi';
import type {
  MasroofiCategory,
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

describe('Masroofi independent spending categories', () => {
  const fixtures = Object.values(MASROOFI_PURCHASE_FIXTURES);

  function permitted(fixture: (typeof fixtures)[number], amountFils = 50000) {
    return controls(funded(amountFils), {
      allowedCategories: [fixture.category],
      onlineAllowed: true,
      perPurchaseLimitFils: 50000,
      dailyLimitFils: 50000,
    });
  }

  it.each(fixtures)(
    '$id requires its own category and never unlocks another category',
    (fixture) => {
      const runtime = permitted(fixture);
      const bought = ok(service.purchase(runtime, purchaseInput({ fixtureId: fixture.id })));
      expect(bought.cards.child_salem!.balanceFils).toBe(50000 - fixture.amountFils);
      expect(bought.transactions.at(-1)).toMatchObject({
        fixtureId: fixture.id,
        status: 'approved',
        amountFils: fixture.amountFils,
      });
      for (const other of fixtures.filter((item) => item.category !== fixture.category)) {
        const declined = ok(service.purchase(runtime, purchaseInput({ fixtureId: other.id })));
        expect(declined.transactions.at(-1)).toMatchObject({
          status: 'declined',
          declineReason: 'category_blocked',
        });
        expect(declined.cards.child_salem!.balanceFils).toBe(50000);
      }
      expect(runtime.transactions).toHaveLength(1);
    },
  );

  it.each(fixtures.filter((fixture) => fixture.category !== 'stationery'))(
    '$id stays blocked under the existing default controls',
    (fixture) => {
      const runtime = funded(50000);
      const attempted = ok(service.purchase(runtime, purchaseInput({ fixtureId: fixture.id })));
      expect(attempted.transactions.at(-1)?.declineReason).toBe('category_blocked');
      expect(attempted.cards.child_salem!.balanceFils).toBe(50000);
    },
  );

  it.each(fixtures)(
    '$id respects freeze, per-purchase, daily and balance boundaries',
    (fixture) => {
      const runtime = permitted(fixture);
      const input = purchaseInput({ fixtureId: fixture.id });
      const withControls = (patch: Partial<MasroofiControls>) =>
        controls(runtime, {
          ...runtime.cards.child_salem!.controls,
          ...patch,
        });
      for (const [declineReason, restricted] of [
        ['card_frozen', withControls({ frozen: true })],
        ['per_purchase_limit', withControls({ perPurchaseLimitFils: fixture.amountFils - 1 })],
        ['daily_limit', withControls({ dailyLimitFils: fixture.amountFils - 1 })],
        ['insufficient_balance', permitted(fixture, fixture.amountFils - 1)],
      ] as const) {
        const attempted = ok(service.purchase(restricted, input));
        expect(attempted.transactions.at(-1)?.declineReason).toBe(declineReason);
        expect(attempted.cards.child_salem!.balanceFils).toBe(
          restricted.cards.child_salem!.balanceFils,
        );
      }
      const boundary = withControls({
        perPurchaseLimitFils: fixture.amountFils,
        dailyLimitFils: fixture.amountFils,
      });
      const first = ok(service.purchase(boundary, input));
      expect(first.transactions.at(-1)?.status).toBe('approved');
      const next = ok(service.purchase(first, { ...input, requestId: 'same-day-next' }));
      expect(next.transactions.at(-1)?.declineReason).toBe('daily_limit');
      const tomorrow = ok(
        service.purchase(next, { ...input, requestId: 'tomorrow', day: '2026-09-14' }),
      );
      expect(tomorrow.transactions.at(-1)?.status).toBe('approved');
      expect(tomorrow.cards.child_salem!.balanceFils).toBe(50000 - fixture.amountFils * 2);
    },
  );

  it.each(fixtures)('$id applies online permission independently of its category', (fixture) => {
    const runtime = permitted(fixture);
    const offlineOnly = controls(runtime, {
      ...runtime.cards.child_salem!.controls,
      onlineAllowed: false,
    });
    const attempted = ok(service.purchase(offlineOnly, purchaseInput({ fixtureId: fixture.id })));
    const onlinePurchase = fixture.id === 'museum_ticket' || fixture.id === 'game_online';
    expect(attempted.transactions.at(-1)?.status).toBe(onlinePurchase ? 'declined' : 'approved');
    expect(attempted.transactions.at(-1)?.declineReason).toBe(
      onlinePurchase ? 'online_blocked' : null,
    );
    expect(attempted.cards.child_salem!.balanceFils).toBe(
      onlinePurchase ? 50000 : 50000 - fixture.amountFils,
    );
  });

  it.each(fixtures)('$id retains idempotency across retries and permission changes', (fixture) => {
    const runtime = permitted(fixture);
    const input = purchaseInput({ fixtureId: fixture.id });
    const approved = ok(service.purchase(runtime, input));
    expect(ok(service.purchase(approved, input))).toBe(approved);
    const otherFixture = fixture.id === 'stationery' ? 'storybook' : 'stationery';
    expect(service.purchase(approved, { ...input, fixtureId: otherFixture })).toMatchObject({
      ok: false,
      error: { code: 'request_conflict' },
    });
    const restricted = controls(runtime, {
      ...runtime.cards.child_salem!.controls,
      allowedCategories: [],
    });
    const declined = ok(service.purchase(restricted, input));
    const reallowed = controls(declined, runtime.cards.child_salem!.controls);
    expect(ok(service.purchase(reallowed, input))).toBe(reallowed);
    const fresh = ok(service.purchase(reallowed, { ...input, requestId: 'retry-explicit-new' }));
    expect(fresh.cards.child_salem!.balanceFils).toBe(50000 - fixture.amountFils);
  });

  it('combines spending across categories in one daily allowance', () => {
    const runtime = controls(funded(5000), {
      allowedCategories: ['books', 'snacks'],
      onlineAllowed: false,
      dailyLimitFils: 1000,
    });
    const book = ok(service.purchase(runtime, purchaseInput({ fixtureId: 'storybook' })));
    expect(book.cards.child_salem!.balanceFils).toBe(4200);
    const snack = ok(
      service.purchase(book, purchaseInput({ fixtureId: 'snack', requestId: 'snack-after-book' })),
    );
    expect(snack.transactions.at(-1)?.declineReason).toBe('daily_limit');
    expect(snack.cards.child_salem!.balanceFils).toBe(4200);
  });

  it('can enable all finite categories while keeping the original controls default isolated', () => {
    const categories = [...MASROOFI_CATEGORIES];
    const runtime = controls(enabled(), { allowedCategories: categories });
    categories.pop();
    expect(runtime.cards.child_salem!.controls.allowedCategories).toHaveLength(8);
    expect(MASROOFI_DEFAULT_CONTROLS.allowedCategories).toEqual(['stationery']);
    expect(enabled('child_alya', runtime).cards.child_alya!.controls.allowedCategories).toEqual([
      'stationery',
    ]);
  });

  it.each(['__proto__', 'constructor', 'toString', 'hasOwnProperty', 'unknown'])(
    'rejects non-fixture object key %s without recording a transaction',
    (fixtureId) => {
      const runtime = funded();
      expect(
        service.purchase(
          runtime,
          purchaseInput({ fixtureId: fixtureId as MasroofiPurchaseInput['fixtureId'] }),
        ),
      ).toMatchObject({ ok: false, error: { code: 'invalid_request' } });
      expect(runtime.transactions).toHaveLength(1);
      expect(runtime.cards.child_salem!.balanceFils).toBe(2000);
    },
  );

  it('rejects malformed categories rather than coercing unknown values into permission', () => {
    const sparse = new Array<MasroofiCategory>(1);
    for (const allowedCategories of [
      ['__proto__'],
      ['constructor'],
      ['books', 'books'],
      ['shopping'],
      [null],
      [5],
      sparse,
    ]) {
      expect(
        service.setControls(enabled(), {
          actor: parent,
          childId: child.childId,
          controls: {
            ...MASROOFI_DEFAULT_CONTROLS,
            allowedCategories: allowedCategories as readonly MasroofiCategory[],
          },
        }),
      ).toMatchObject({ ok: false, error: { code: 'invalid_controls' } });
    }
  });
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
