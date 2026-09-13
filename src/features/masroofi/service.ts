import { P0_RECYCLING_TEMPLATE, TASK_TEMPLATES } from '../tasks/demoContent';
import type { SyntheticChildId, TaskJourney } from '../../models/familyGrowth';
import { MASROOFI_CATEGORIES } from '../../models/masroofi';
import type {
  MasroofiCard,
  MasroofiCategory,
  MasroofiControls,
  MasroofiDeclineReason,
  MasroofiErrorCode,
  MasroofiPurchaseFixtureId,
  MasroofiResult,
  MasroofiRuntime,
  MasroofiService,
  MasroofiTransaction,
} from '../../models/masroofi';

export type { MasroofiService } from '../../models/masroofi';

export const MASROOFI_DEFAULT_CONTROLS: MasroofiControls = {
  frozen: false,
  onlineAllowed: false,
  allowedCategories: ['stationery'],
  perPurchaseLimitFils: 2000,
  dailyLimitFils: 5000,
};

export const MASROOFI_PURCHASE_FIXTURES = {
  stationery: { id: 'stationery', category: 'stationery', online: false, amountFils: 300 },
  storybook: { id: 'storybook', category: 'books', online: false, amountFils: 800 },
  football: { id: 'football', category: 'sports', online: false, amountFils: 1800 },
  art_supplies: { id: 'art_supplies', category: 'arts', online: false, amountFils: 1000 },
  museum_ticket: { id: 'museum_ticket', category: 'outings', online: true, amountFils: 1500 },
  snack: { id: 'snack', category: 'snacks', online: false, amountFils: 400 },
  gift: { id: 'gift', category: 'gifts', online: false, amountFils: 2000 },
  game_online: { id: 'game_online', category: 'games', online: true, amountFils: 1200 },
} as const satisfies Readonly<
  Record<
    MasroofiPurchaseFixtureId,
    {
      readonly id: MasroofiPurchaseFixtureId;
      readonly category: MasroofiCategory;
      readonly online: boolean;
      readonly amountFils: number;
    }
  >
>;

export const MASROOFI_MAX_REWARD_FILS = 10000;
export const MASROOFI_MAX_TOP_UP_FILS = 50000;
export const MASROOFI_MAX_BALANCE_FILS = 1000000;

// School preparation and all sensitive categories remain outside paid tasks.
const ELIGIBLE_TEMPLATE_IDS = ['task_recycling_p0_v1', 'HR01', 'HR05', 'GI01', 'GI02', 'GI03'];

const canonicalTemplates = [...TASK_TEMPLATES, P0_RECYCLING_TEMPLATE].filter((template) =>
  ELIGIBLE_TEMPLATE_IDS.includes(template.id),
);

export function createMasroofiRuntime(): MasroofiRuntime {
  return { cards: {}, promises: [], transactions: [] };
}

function success<T>(data: T): MasroofiResult<T> {
  return { ok: true, data };
}

function failure(code: MasroofiErrorCode): MasroofiResult<never> {
  return { ok: false, error: { code, message: `Masroofi: ${code}` } };
}

function validChildId(childId: SyntheticChildId): boolean {
  return childId === 'child_salem' || childId === 'child_alya';
}

function validFils(amount: number, maximum: number): boolean {
  return Number.isSafeInteger(amount) && amount > 0 && amount <= maximum;
}

function validDay(day: string): boolean {
  if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const date = new Date(`${day}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === day;
}

function validRequestId(requestId: string): boolean {
  return (
    typeof requestId === 'string' &&
    /^[a-zA-Z0-9:_-]{1,160}$/.test(requestId) &&
    !requestId.startsWith('reward:')
  );
}

function outstandingFils(runtime: MasroofiRuntime, childId: SyntheticChildId): number {
  return runtime.promises.reduce(
    (total, promise) =>
      promise.childId === childId && promise.status === 'promised'
        ? total + promise.amountFils
        : total,
    0,
  );
}

function canonicalValue(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalValue).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalValue(object[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value) ?? 'undefined';
}

function validAssignment(journey: TaskJourney): boolean {
  const { assignment, task } = journey;
  return Boolean(
    assignment &&
    assignment.id &&
    assignment.approvedByParent === true &&
    assignment.taskId === task.id &&
    assignment.taskVersion === task.version &&
    assignment.childId === task.targetChildId &&
    validChildId(assignment.childId) &&
    Number.isSafeInteger(task.version) &&
    task.version > 0 &&
    (!task.occurrence ||
      (task.occurrence.assignmentId === assignment.id &&
        task.occurrence.taskId === task.id &&
        task.occurrence.childId === task.targetChildId)),
  );
}

function eligibleContent(journey: TaskJourney): boolean {
  const { task } = journey;
  const canonical = canonicalTemplates.find((template) => template.id === task.templateId);
  return Boolean(
    canonical &&
    (task.content.categoryId === 'green_impact' ||
      task.content.categoryId === 'home_responsibility') &&
    task.content.routinePhase === 'acquisition' &&
    task.content.recognitionMode !== 'recognition_only' &&
    canonicalValue(task.content) === canonicalValue(canonical) &&
    (!task.approvedAgeBand || canonical.childAgeBands.includes(task.approvedAgeBand)),
  );
}

export function eligibleJourney(journey: TaskJourney): boolean {
  return (
    journey.lifecycle === 'assigned' &&
    journey.submission === null &&
    journey.checkIn === null &&
    validAssignment(journey) &&
    eligibleContent(journey)
  );
}

function cloneControls(controls: MasroofiControls): MasroofiControls {
  return { ...controls, allowedCategories: [...controls.allowedCategories] };
}

function cloneCard(card: MasroofiCard | undefined): MasroofiCard | null {
  return card ? { ...card, controls: cloneControls(card.controls) } : null;
}

function appendTransaction(
  runtime: MasroofiRuntime,
  transaction: MasroofiTransaction,
): MasroofiRuntime {
  const card = runtime.cards[transaction.childId];
  return {
    ...runtime,
    cards: card
      ? { ...runtime.cards, [card.childId]: { ...card, balanceFils: transaction.balanceAfterFils } }
      : runtime.cards,
    transactions: [...runtime.transactions, transaction],
  };
}

function purchaseDecline(
  runtime: MasroofiRuntime,
  childId: SyntheticChildId,
  fixtureId: MasroofiPurchaseFixtureId,
  day: string,
): MasroofiDeclineReason | null {
  const card = runtime.cards[childId];
  const item = MASROOFI_PURCHASE_FIXTURES[fixtureId];
  if (!card?.enabled) return 'card_disabled';
  const { controls } = card;
  if (controls.frozen) return 'card_frozen';
  if (!controls.allowedCategories.includes(item.category)) return 'category_blocked';
  if (item.online && !controls.onlineAllowed) return 'online_blocked';
  if (item.amountFils > controls.perPurchaseLimitFils) return 'per_purchase_limit';
  const spentToday = runtime.transactions.reduce(
    (total, transaction) =>
      transaction.childId === childId &&
      transaction.day === day &&
      transaction.kind === 'purchase' &&
      transaction.status === 'approved'
        ? total + transaction.amountFils
        : total,
    0,
  );
  if (spentToday + item.amountFils > controls.dailyLimitFils) return 'daily_limit';
  if (item.amountFils > card.balanceFils) return 'insufficient_balance';
  return null;
}

// The store supplies actors only after checking current session and configured profile authority.
export const masroofiService: MasroofiService = {
  eligibleJourney,
  enable(runtime, input) {
    if (input.actor.role !== 'parent') return failure('parent_required');
    if (!validChildId(input.childId)) return failure('profile_mismatch');
    if (!['9_11', '12_14'].includes(input.ageBand) || input.age10PlusConfirmed !== true)
      return failure('age_ineligible');
    if (
      input.knownAge !== undefined &&
      (!Number.isInteger(input.knownAge) || input.knownAge < 10 || input.knownAge > 14)
    )
      return failure('age_ineligible');
    if (runtime.cards[input.childId]) return success(runtime);
    return success({
      ...runtime,
      cards: {
        ...runtime.cards,
        [input.childId]: {
          childId: input.childId,
          enabled: true,
          age10PlusConfirmed: true,
          balanceFils: 0,
          controls: cloneControls(MASROOFI_DEFAULT_CONTROLS),
          origin: 'simulated',
        },
      },
    });
  },

  setControls(runtime, input) {
    if (input.actor.role !== 'parent') return failure('parent_required');
    if (!validChildId(input.childId)) return failure('profile_mismatch');
    const card = runtime.cards[input.childId];
    if (!card) return failure('card_disabled');
    const { controls } = input;
    if (
      typeof controls.frozen !== 'boolean' ||
      typeof controls.onlineAllowed !== 'boolean' ||
      !validFils(controls.perPurchaseLimitFils, MASROOFI_MAX_TOP_UP_FILS) ||
      !validFils(controls.dailyLimitFils, MASROOFI_MAX_TOP_UP_FILS) ||
      !Array.isArray(controls.allowedCategories) ||
      new Set(controls.allowedCategories).size !== controls.allowedCategories.length ||
      Array.from(controls.allowedCategories).some(
        (category) =>
          typeof category !== 'string' ||
          !MASROOFI_CATEGORIES.some((allowed) => allowed === category),
      )
    )
      return failure('invalid_controls');
    return success({
      ...runtime,
      cards: { ...runtime.cards, [input.childId]: { ...card, controls: cloneControls(controls) } },
    });
  },

  topUp(runtime, input) {
    if (input.actor.role !== 'parent') return failure('parent_required');
    if (!validChildId(input.childId)) return failure('profile_mismatch');
    if (!validFils(input.amountFils, MASROOFI_MAX_TOP_UP_FILS)) return failure('invalid_amount');
    if (!validRequestId(input.requestId) || !validDay(input.day)) return failure('invalid_request');
    const existing = runtime.transactions.find(
      (transaction) => transaction.requestId === input.requestId,
    );
    if (existing)
      return existing.kind === 'top_up' &&
        existing.childId === input.childId &&
        existing.amountFils === input.amountFils &&
        existing.day === input.day
        ? success(runtime)
        : failure('request_conflict');
    const card = runtime.cards[input.childId];
    if (!card) return failure('card_disabled');
    const balanceAfterFils = card.balanceFils + input.amountFils;
    if (balanceAfterFils + outstandingFils(runtime, input.childId) > MASROOFI_MAX_BALANCE_FILS)
      return failure('balance_limit');
    return success(
      appendTransaction(runtime, {
        id: `masroofi:fund:${input.requestId}`,
        requestId: input.requestId,
        childId: input.childId,
        kind: 'top_up',
        amountFils: input.amountFils,
        status: 'credited',
        declineReason: null,
        fixtureId: null,
        day: input.day,
        balanceAfterFils,
        assignmentId: null,
        origin: 'simulated',
      }),
    );
  },

  promise(runtime, input) {
    if (input.actor.role !== 'parent') return failure('parent_required');
    const { journey } = input;
    if (!validAssignment(journey)) return failure('task_ineligible');
    const assignment = journey.assignment!;
    if (!runtime.cards[assignment.childId]) return failure('card_disabled');
    if (!validFils(input.amountFils, MASROOFI_MAX_REWARD_FILS)) return failure('invalid_amount');
    const existing = runtime.promises.find(
      (promise) =>
        promise.assignmentId === assignment.id &&
        promise.taskVersion === journey.task.version &&
        promise.childId === assignment.childId,
    );
    if (existing)
      return existing.amountFils === input.amountFils &&
        existing.taskId === journey.task.id &&
        existing.taskVersion === journey.task.version &&
        existing.childId === assignment.childId &&
        existing.contentFingerprint === canonicalValue(journey.task.content)
        ? success(runtime)
        : failure('promise_locked');
    if (journey.lifecycle !== 'assigned' || journey.submission || journey.checkIn)
      return failure('task_not_available');
    if (!eligibleJourney(journey)) return failure('task_ineligible');
    if (
      runtime.cards[assignment.childId]!.balanceFils +
        outstandingFils(runtime, assignment.childId) +
        input.amountFils >
      MASROOFI_MAX_BALANCE_FILS
    )
      return failure('balance_limit');
    return success({
      ...runtime,
      promises: [
        ...runtime.promises,
        {
          id: `masroofi:promise:${assignment.id}:${journey.task.version}:${assignment.childId}`,
          childId: assignment.childId,
          taskId: journey.task.id,
          taskVersion: journey.task.version,
          assignmentId: assignment.id,
          amountFils: input.amountFils,
          contentFingerprint: canonicalValue(journey.task.content),
          status: 'promised',
          recognitionKey: null,
        },
      ],
    });
  },

  credit(runtime, input) {
    if (input.actor.role !== 'parent') return failure('parent_required');
    const { journey, receipt } = input;
    const promise = runtime.promises.find(
      (candidate) =>
        candidate.assignmentId === journey.assignment?.id &&
        candidate.taskVersion === journey.task.version &&
        candidate.childId === journey.task.targetChildId,
    );
    if (!promise) return success(runtime);
    if (!validDay(input.day)) return failure('invalid_request');
    if (
      !validAssignment(journey) ||
      !eligibleContent(journey) ||
      promise.childId !== journey.task.targetChildId ||
      promise.taskId !== journey.task.id ||
      promise.taskVersion !== journey.task.version ||
      promise.contentFingerprint !== canonicalValue(journey.task.content)
    )
      return failure('recognition_mismatch');
    const { submission, checkIn } = journey;
    if (
      journey.lifecycle !== 'recognized' ||
      !submission ||
      !checkIn ||
      submission.assignmentId !== promise.assignmentId ||
      submission.taskVersion !== promise.taskVersion ||
      submission.definitionAcknowledged !== true ||
      checkIn.submissionId !== submission.id ||
      checkIn.decision !== 'confirm' ||
      checkIn.confirmationPresentation !== 'recognition_applied' ||
      !checkIn.praisePresentedAt ||
      !checkIn.praise?.ar.trim() ||
      !checkIn.praise.en.trim()
    )
      return failure('recognition_required');
    const provenance = receipt.provenance;
    if (
      !checkIn.recognitionKey ||
      receipt.recognitionKey !== checkIn.recognitionKey ||
      receipt.checkInId !== checkIn.id ||
      provenance.schemaVersion !== 'r003.recognition-provenance.v1' ||
      provenance.taskId !== promise.taskId ||
      provenance.taskVersion !== promise.taskVersion ||
      provenance.profileId !== promise.childId ||
      provenance.submissionId !== submission.id ||
      provenance.completionMode !== submission.completionMode ||
      provenance.landscapeId !== journey.task.content.landscapeId ||
      provenance.projection.consequenceKind !== 'rewarded_acquisition' ||
      provenance.projection.confirmed !== true ||
      provenance.projection.routinePhase !== 'acquisition' ||
      provenance.projection.categoryId !== journey.task.content.categoryId ||
      !receipt.seedTransaction ||
      receipt.seedTransaction.childId !== promise.childId ||
      receipt.seedTransaction.recognitionKey !== receipt.recognitionKey ||
      receipt.seedTransaction.amount !== journey.task.content.displayedSeedAward
    )
      return failure('recognition_mismatch');
    if (promise.status === 'credited')
      return promise.recognitionKey === receipt.recognitionKey
        ? success(runtime)
        : failure('recognition_mismatch');
    if (runtime.promises.some((candidate) => candidate.recognitionKey === receipt.recognitionKey))
      return failure('recognition_mismatch');
    const card = runtime.cards[promise.childId];
    if (!card) return failure('card_disabled');
    const balanceAfterFils = card.balanceFils + promise.amountFils;
    if (!Number.isSafeInteger(balanceAfterFils)) return failure('balance_limit');
    const next = appendTransaction(runtime, {
      id: `masroofi:credit:${promise.id}`,
      requestId: `reward:${promise.id}`,
      childId: promise.childId,
      kind: 'reward',
      amountFils: promise.amountFils,
      status: 'credited',
      declineReason: null,
      fixtureId: null,
      day: input.day,
      balanceAfterFils,
      assignmentId: promise.assignmentId,
      origin: 'simulated',
    });
    return success({
      ...next,
      promises: next.promises.map((candidate) =>
        candidate.id === promise.id
          ? { ...candidate, status: 'credited', recognitionKey: receipt.recognitionKey }
          : candidate,
      ),
    });
  },

  purchase(runtime, input) {
    if (input.actor.role !== 'child') return failure('child_required');
    if (!validChildId(input.childId) || input.actor.childId !== input.childId)
      return failure('profile_mismatch');
    if (
      !validRequestId(input.requestId) ||
      !validDay(input.day) ||
      typeof input.fixtureId !== 'string' ||
      !Object.prototype.hasOwnProperty.call(MASROOFI_PURCHASE_FIXTURES, input.fixtureId)
    )
      return failure('invalid_request');
    const existing = runtime.transactions.find(
      (transaction) => transaction.requestId === input.requestId,
    );
    if (existing)
      return existing.kind === 'purchase' &&
        existing.childId === input.childId &&
        existing.fixtureId === input.fixtureId &&
        existing.day === input.day
        ? success(runtime)
        : failure('request_conflict');
    const item = MASROOFI_PURCHASE_FIXTURES[input.fixtureId];
    const declineReason = purchaseDecline(runtime, input.childId, input.fixtureId, input.day);
    const balanceBeforeFils = runtime.cards[input.childId]?.balanceFils ?? 0;
    return success(
      appendTransaction(runtime, {
        id: `masroofi:purchase:${input.requestId}`,
        requestId: input.requestId,
        childId: input.childId,
        kind: 'purchase',
        amountFils: item.amountFils,
        status: declineReason ? 'declined' : 'approved',
        declineReason,
        fixtureId: input.fixtureId,
        day: input.day,
        balanceAfterFils: declineReason ? balanceBeforeFils : balanceBeforeFils - item.amountFils,
        assignmentId: null,
        origin: 'simulated',
      }),
    );
  },

  projectParent(runtime, input) {
    if (input.actor.role !== 'parent') return failure('parent_required');
    if (!validChildId(input.childId)) return failure('profile_mismatch');
    return success({
      card: cloneCard(runtime.cards[input.childId]),
      promises: runtime.promises
        .filter((promise) => promise.childId === input.childId)
        .map((promise) => ({ ...promise })),
      transactions: runtime.transactions
        .filter((transaction) => transaction.childId === input.childId)
        .map((transaction) => ({ ...transaction })),
    });
  },

  projectChild(runtime, input) {
    if (input.actor.role !== 'child') return failure('child_required');
    if (!validChildId(input.childId) || input.actor.childId !== input.childId)
      return failure('profile_mismatch');
    return success({
      card: cloneCard(runtime.cards[input.childId]),
      transactions: runtime.transactions
        .filter((transaction) => transaction.childId === input.childId)
        .map((transaction) => ({ ...transaction })),
      promisedAssignmentIds: runtime.promises
        .filter((promise) => promise.childId === input.childId && promise.status === 'promised')
        .map((promise) => promise.assignmentId),
      promisedTasks: runtime.promises
        .filter((promise) => promise.childId === input.childId && promise.status === 'promised')
        .map((promise) => ({
          assignmentId: promise.assignmentId,
          taskVersion: promise.taskVersion,
        })),
    });
  },
};
