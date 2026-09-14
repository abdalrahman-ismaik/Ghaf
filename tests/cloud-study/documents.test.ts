import { describe, expect, it } from 'vitest';
import { applyStudyCommand, createEmptyStudyState } from '@/features/study';
import {
  parseCloudDocumentCommand,
  parseCloudDocumentResponse,
  parseCloudDocuments,
  parseCloudDocumentSnapshot,
} from '@/features/cloud-study/validation';
import { cloudDocumentResources } from '@/features/cloud-study/resources';

const familyId = '020d2000-0000-4000-8000-000000000001';
const childId = '020d3000-0000-4000-8000-000000000001';
const otherChild = '020d3000-0000-4000-8000-000000000002';
const now = '2026-09-15T10:00:00.000Z';
const parent = { familyId, role: 'parent' as const, childId: null };
const userId = '020d0000-0000-4000-8000-000000000001';
function planRow() {
  const next = applyStudyCommand(
    createEmptyStudyState(familyId),
    { role: 'parent' },
    {
      type: 'plan.create',
      id: 'plan-live-one',
      childId,
      input: {
        subject: 'Math',
        title: 'Read a chosen example',
        nextStep: 'Choose one example',
        durationMinutes: 15,
        dueDate: null,
        revisitDate: null,
      },
    },
    { familyKey: familyId, childIds: [childId], now },
  );
  if (!next.ok) throw new Error('Invalid fixture');
  return {
    id: '020d5000-0000-4000-8000-000000000001',
    family_id: familyId,
    child_id: childId,
    kind: 'study_plan',
    revision: 1,
    payload: next.data.plans[0],
    created_at: now,
    updated_at: now,
  };
}
describe('cloud document transport validation', () => {
  it('validates the snapshot account, family, role and complete count before exposing rows', () => {
    const authority = { ...parent, userId };
    const snapshot = {
      schemaVersion: 1,
      actor: authority,
      familyId,
      revision: 5,
      documentCount: 1,
      documents: [planRow()],
    };
    expect(parseCloudDocumentSnapshot(snapshot, authority).documents).toHaveLength(1);
    expect(() =>
      parseCloudDocumentSnapshot({ ...snapshot, documentCount: 101 }, authority),
    ).toThrow();
    expect(() =>
      parseCloudDocumentSnapshot(
        { ...snapshot, actor: { ...authority, userId: '020d0000-0000-4000-8000-000000000002' } },
        authority,
      ),
    ).toThrow();
    expect(() =>
      parseCloudDocumentSnapshot(
        { ...snapshot, familyId: '020d2000-0000-4000-8000-000000000002' },
        authority,
      ),
    ).toThrow();
    expect(() =>
      parseCloudDocumentSnapshot(snapshot, { ...authority, role: 'child', childId }),
    ).toThrow();
  });
  it('returns true empty server state without creating sample records', () => {
    expect(parseCloudDocuments([], parent)).toEqual([]);
    expect(() => parseCloudDocuments(null, parent)).toThrow();
  });
  it('accepts the actual study domain with an authenticated UUID child', () => {
    const parsed = parseCloudDocuments([planRow()], parent);
    expect(parsed[0]).toMatchObject({
      childId,
      familyId,
      kind: 'study_plan',
      payload: { status: 'proposed', completedAt: null },
    });
  });
  it('fails closed on foreign families, mismatched payload children and sibling projection', () => {
    expect(() =>
      parseCloudDocuments(
        [{ ...planRow(), family_id: '020d2000-0000-4000-8000-000000000002' }],
        parent,
      ),
    ).toThrow();
    expect(() => parseCloudDocuments([{ ...planRow(), child_id: otherChild }], parent)).toThrow();
    expect(() =>
      parseCloudDocuments([planRow()], { familyId, role: 'child', childId: otherChild }),
    ).toThrow();
  });
  it('rejects a Parent-only document even if a backend accidentally sends it to a Child', () => {
    const row = {
      ...planRow(),
      kind: 'connections',
      child_id: null,
      payload: { primaryGuardianName: 'Explicit adult', secondaryGuardianName: '', relatives: [] },
    };
    expect(parseCloudDocuments([row], parent)).toHaveLength(1);
    expect(() => parseCloudDocuments([row], { familyId, role: 'child', childId })).toThrow();
  });
  it('cannot accept malformed state, forged completion or duplicated document IDs', () => {
    const row = planRow();
    expect(() => parseCloudDocuments([row, row], parent)).toThrow();
    expect(() =>
      parseCloudDocuments([{ ...row, payload: { ...row.payload, completedAt: now } }], parent),
    ).toThrow();
    expect(() => parseCloudDocuments([{ ...row, revision: -1 }], parent)).toThrow();
  });
  it('validates exact commands rather than accepting complete client state or actor claims', () => {
    const command = {
      type: 'study',
      expectedRevision: 1,
      command: { type: 'plan.accept', id: 'plan-live-one' },
    };
    expect(parseCloudDocumentCommand(command)).toEqual(command);
    expect(() => parseCloudDocumentCommand({ ...command, role: 'parent' })).toThrow();
    expect(() =>
      parseCloudDocumentCommand({ type: 'study', state: createEmptyStudyState(familyId) }),
    ).toThrow();
    expect(() =>
      parseCloudDocumentCommand({
        type: 'preferences.save',
        childId: 'child_salem',
        expectedRevision: 0,
        input: {},
      }),
    ).toThrow();
  });
  it('requires a valid command receipt before showing save success', () => {
    expect(() =>
      parseCloudDocumentResponse({ documents: [planRow()], result: null }, parent),
    ).toThrow();
    expect(() =>
      parseCloudDocumentResponse(
        { documents: [planRow()], result: { documentId: 'fake', revision: 1 } },
        parent,
      ),
    ).toThrow();
    expect(
      parseCloudDocumentResponse(
        { documents: [planRow()], result: { documentId: planRow().id, revision: 1 } },
        parent,
      ),
    ).toHaveLength(1);
  });
  it('keeps bilingual new resources aligned', () => {
    expect(Object.keys(cloudDocumentResources.ar).sort()).toEqual(
      Object.keys(cloudDocumentResources.en).sort(),
    );
    expect(Object.keys(cloudDocumentResources.ar.options).sort()).toEqual(
      Object.keys(cloudDocumentResources.en.options).sort(),
    );
  });
});
