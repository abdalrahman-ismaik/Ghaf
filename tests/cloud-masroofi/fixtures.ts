import type { CloudFamilyActor } from '../../src/models/cloudFamily';
import type { CloudMasroofiSnapshot } from '../../src/models/cloudMasroofi';
import { MASROOFI_DEFAULT_CONTROLS } from '../../src/features/cloud-masroofi/reference';

export const id = (number: number) => `00000000-0000-4000-8000-${String(number).padStart(12, '0')}`;
export const userId = id(1);
export const familyId = id(2);
export const childId = id(3);
export const taskId = id(4);
export const requestId = id(5);
export const parent: CloudFamilyActor = { userId, familyId, role: 'parent', childId: null };
export const child: CloudFamilyActor = { userId: id(6), familyId, role: 'child', childId };
export const createdAt = '2026-09-15T10:00:00.000Z';

export function emptySnapshot(actor = parent): CloudMasroofiSnapshot {
  return {
    schemaVersion: 1,
    actor,
    familyId,
    revision: 0,
    cards: [],
    promises: [],
    transactions: [],
  };
}

export function cardSnapshot(actor = parent): CloudMasroofiSnapshot {
  return {
    ...emptySnapshot(actor),
    revision: 1,
    cards: [
      {
        childId,
        balanceFils: 0,
        controlsVersion: 1,
        age10PlusConfirmed: true,
        controls: structuredClone(MASROOFI_DEFAULT_CONTROLS),
      },
    ],
  };
}

export function fundedSnapshot(actor = parent): CloudMasroofiSnapshot {
  const snapshot = cardSnapshot(actor);
  return {
    ...snapshot,
    revision: 2,
    cards: snapshot.cards.map((card) => ({ ...card, balanceFils: 1000 })),
    transactions: [
      {
        id: id(10),
        childId,
        requestId,
        kind: 'top_up',
        amountFils: 1000,
        status: 'credited',
        declineReason: null,
        fixtureId: null,
        day: '2026-09-15',
        balanceAfterFils: 1000,
        taskId: null,
        createdAt,
      },
    ],
  };
}

export function promisedSnapshot(actor = parent, credited = false): CloudMasroofiSnapshot {
  const snapshot = fundedSnapshot(actor);
  const creditTime = '2026-09-15T11:00:00.000Z';
  return {
    ...snapshot,
    revision: credited ? 4 : 3,
    cards: snapshot.cards.map((card) => ({ ...card, balanceFils: credited ? 1500 : 1000 })),
    promises: [
      {
        id: id(11),
        childId,
        taskId,
        taskRevision: 1,
        ...(actor.role === 'parent' || credited ? { amountFils: 500 } : {}),
        status: credited ? 'credited' : 'promised',
        createdAt,
        creditedAt: credited ? creditTime : null,
      },
    ],
    transactions: credited
      ? [
          ...snapshot.transactions,
          {
            id: id(12),
            childId,
            requestId: id(11),
            kind: 'reward',
            amountFils: 500,
            status: 'credited',
            declineReason: null,
            fixtureId: null,
            day: '2026-09-15',
            balanceAfterFils: 1500,
            taskId,
            createdAt: creditTime,
          },
        ]
      : snapshot.transactions,
  };
}
