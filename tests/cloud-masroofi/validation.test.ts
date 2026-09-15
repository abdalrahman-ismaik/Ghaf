import { describe, expect, it } from 'vitest';

import {
  parseCloudMasroofiCommand,
  parseCloudMasroofiSnapshot,
} from '../../src/features/cloud-masroofi/validation';
import {
  cardSnapshot,
  child,
  childId,
  emptySnapshot,
  familyId,
  fundedSnapshot,
  id,
  parent,
  promisedSnapshot,
  taskId,
  userId,
} from './fixtures';

describe('hosted Masroofi response privacy and ledger validation', () => {
  it('preserves a genuinely empty family and accepts zero enrolled cards without inventing balances', () => {
    expect(parseCloudMasroofiSnapshot(emptySnapshot(), parent)).toEqual(emptySnapshot());
    const result = parseCloudMasroofiSnapshot(cardSnapshot(), userId, familyId, parent);
    expect(result.cards[0]!.balanceFils).toBe(0);
    expect(Object.isFrozen(result.cards[0]!.controls.allowedCategories)).toBe(true);
  });

  it('accepts authoritative credits for Parent and Child with no pending Child reward amount', () => {
    for (const actor of [parent, child]) {
      expect(parseCloudMasroofiSnapshot(promisedSnapshot(actor), actor)).toEqual(
        promisedSnapshot(actor),
      );
      expect(
        parseCloudMasroofiSnapshot(promisedSnapshot(actor, true), actor).cards[0]!.balanceFils,
      ).toBe(1500);
    }
  });

  it.each([{ role: 'child', childId }, { userId: id(90) }, { familyId: id(90) }, { childId }])(
    'rejects changed expected Parent identity %j',
    (patch) => {
      const snapshot = emptySnapshot();
      expect(() =>
        parseCloudMasroofiSnapshot({ ...snapshot, actor: { ...snapshot.actor, ...patch } }, parent),
      ).toThrow('invalid_response');
    },
  );

  it('rejects changed Child identity and sibling cards even when the account UUID matches', () => {
    const snapshot = cardSnapshot(child);
    expect(() =>
      parseCloudMasroofiSnapshot({ ...snapshot, actor: { ...child, childId: id(99) } }, child),
    ).toThrow('invalid_response');
    expect(() =>
      parseCloudMasroofiSnapshot(
        { ...snapshot, cards: [...snapshot.cards, { ...snapshot.cards[0], childId: id(99) }] },
        child,
      ),
    ).toThrow('invalid_response');
  });

  it.each([500, null, undefined])(
    'rejects the presence of a hidden Child amount field (%s)',
    (amountFils) => {
      const snapshot = promisedSnapshot(child);
      expect(() =>
        parseCloudMasroofiSnapshot(
          { ...snapshot, promises: [{ ...snapshot.promises[0], amountFils }] },
          child,
        ),
      ).toThrow('invalid_response');
    },
  );

  it('rejects missing Parent amounts and missing credited Child amounts', () => {
    for (const snapshot of [promisedSnapshot(parent), promisedSnapshot(child, true)]) {
      const { amountFils: ignored, ...promise } = snapshot.promises[0]!;
      expect(ignored).toBe(500);
      expect(() =>
        parseCloudMasroofiSnapshot({ ...snapshot, promises: [promise] }, snapshot.actor),
      ).toThrow('invalid_response');
    }
  });

  it.each(['cards', 'promises', 'transactions'] as const)('rejects duplicate %s rows', (key) => {
    const snapshot = promisedSnapshot(parent, true);
    expect(() =>
      parseCloudMasroofiSnapshot(
        { ...snapshot, [key]: [...snapshot[key], snapshot[key][0]] },
        parent,
      ),
    ).toThrow('invalid_response');
  });

  it('rejects repeated receipt IDs, duplicate task promises, and rows detached from an enrolled card', () => {
    const snapshot = promisedSnapshot(parent, true);
    const [transaction] = snapshot.transactions;
    expect(() =>
      parseCloudMasroofiSnapshot(
        { ...snapshot, transactions: [transaction, { ...transaction, id: id(33) }] },
        parent,
      ),
    ).toThrow('invalid_response');
    expect(() =>
      parseCloudMasroofiSnapshot(
        { ...snapshot, promises: [...snapshot.promises, { ...snapshot.promises[0], id: id(34) }] },
        parent,
      ),
    ).toThrow('invalid_response');
    expect(() =>
      parseCloudMasroofiSnapshot(
        { ...snapshot, promises: [{ ...snapshot.promises[0], childId: id(99) }] },
        parent,
      ),
    ).toThrow('invalid_response');
    expect(() =>
      parseCloudMasroofiSnapshot(
        { ...snapshot, transactions: [{ ...transaction, childId: id(99) }] },
        parent,
      ),
    ).toThrow('invalid_response');
  });

  it('rejects phantom balances, unsafe numbers, extra properties and invalid credited evidence', () => {
    const snapshot = promisedSnapshot(parent, true);
    for (const balanceFils of [1501, -1, 1.5, Number.MAX_SAFE_INTEGER]) {
      expect(() =>
        parseCloudMasroofiSnapshot(
          { ...snapshot, cards: [{ ...snapshot.cards[0], balanceFils }] },
          parent,
        ),
      ).toThrow('invalid_response');
    }
    expect(() => parseCloudMasroofiSnapshot({ ...snapshot, mock: true }, parent)).toThrow(
      'invalid_response',
    );
    expect(() =>
      parseCloudMasroofiSnapshot(
        { ...snapshot, transactions: snapshot.transactions.slice(0, 1) },
        parent,
      ),
    ).toThrow('invalid_response');
    expect(() =>
      parseCloudMasroofiSnapshot(
        { ...snapshot, promises: [{ ...snapshot.promises[0], creditedAt: null }] },
        parent,
      ),
    ).toThrow('invalid_response');
  });

  it('checks declined receipts without deducting them, and rejects forged purchase prices/status', () => {
    const base = fundedSnapshot(child);
    const receipt = {
      ...base.transactions[0],
      id: id(40),
      requestId: id(41),
      kind: 'purchase' as const,
      fixtureId: 'gift' as const,
      amountFils: 2000,
      status: 'declined' as const,
      declineReason: 'category_blocked' as const,
    };
    const snapshot = { ...base, transactions: [...base.transactions, receipt] };
    expect(parseCloudMasroofiSnapshot(snapshot, child).cards[0]!.balanceFils).toBe(1000);
    for (const patch of [
      { amountFils: 1 },
      { declineReason: null },
      { taskId },
      { status: 'credited' },
    ]) {
      expect(() =>
        parseCloudMasroofiSnapshot(
          { ...snapshot, transactions: [...base.transactions, { ...receipt, ...patch }] },
          child,
        ),
      ).toThrow('invalid_response');
    }
  });

  it('rejects oversized, cyclic and malformed payloads instead of producing sample state', () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    for (const value of [null, {}, [], cyclic, { ...emptySnapshot(), schemaVersion: 2 }]) {
      expect(() => parseCloudMasroofiSnapshot(value, parent)).toThrow('invalid_response');
    }
  });
});

describe('hosted Masroofi command boundary', () => {
  it('accepts a newly assigned task at revision zero while rejecting negative revisions', () => {
    const command = { type: 'reward.promise', taskId, expectedTaskRevision: 0, amountFils: 500 };
    expect(parseCloudMasroofiCommand(command).type).toBe('reward.promise');
    expect(() => parseCloudMasroofiCommand({ ...command, expectedTaskRevision: -1 })).toThrow(
      'invalid_command',
    );
    const snapshot = promisedSnapshot();
    expect(
      parseCloudMasroofiSnapshot(
        { ...snapshot, promises: [{ ...snapshot.promises[0], taskRevision: 0 }] },
        parent,
      ).promises[0]!.taskRevision,
    ).toBe(0);
  });

  it.each([
    { type: 'card.enable', childId, age10PlusConfirmed: false },
    { type: 'card.top_up', childId, amountFils: 0 },
    { type: 'card.top_up', childId, amountFils: 50001 },
    { type: 'reward.promise', taskId, expectedTaskRevision: 1, amountFils: 10001 },
    { type: 'purchase', childId, fixtureId: 'gift', amountFils: 1 },
    { type: 'purchase', childId: 'child_alya', fixtureId: 'gift' },
    {
      type: 'card.controls',
      childId,
      expectedVersion: 0,
      controls: cardSnapshot().cards[0]!.controls,
    },
  ])('rejects unsafe or synthetic command %j', (command) => {
    expect(() => parseCloudMasroofiCommand(command)).toThrow('invalid_command');
  });

  it('rejects repeated category permissions', () => {
    expect(() =>
      parseCloudMasroofiCommand({
        type: 'card.controls',
        childId,
        expectedVersion: 1,
        controls: { ...cardSnapshot().cards[0]!.controls, allowedCategories: ['books', 'books'] },
      }),
    ).toThrow('invalid_command');
  });

  it.each([0, 50001, 1.5])(
    'rejects out-of-range control limits %s in commands and snapshots',
    (limit) => {
      const snapshot = cardSnapshot();
      for (const key of ['perPurchaseLimitFils', 'dailyLimitFils']) {
        const controls = { ...snapshot.cards[0]!.controls, [key]: limit };
        expect(() =>
          parseCloudMasroofiCommand({
            type: 'card.controls',
            childId,
            expectedVersion: 1,
            controls,
          }),
        ).toThrow('invalid_command');
        expect(() =>
          parseCloudMasroofiSnapshot(
            { ...snapshot, cards: [{ ...snapshot.cards[0], controls }] },
            parent,
          ),
        ).toThrow('invalid_response');
      }
    },
  );

  it.each([1, 50000])('accepts permitted control boundaries %s', (limit) => {
    const controls = {
      ...cardSnapshot().cards[0]!.controls,
      perPurchaseLimitFils: limit,
      dailyLimitFils: limit,
    };
    expect(
      parseCloudMasroofiCommand({ type: 'card.controls', childId, expectedVersion: 1, controls })
        .type,
    ).toBe('card.controls');
  });
});
