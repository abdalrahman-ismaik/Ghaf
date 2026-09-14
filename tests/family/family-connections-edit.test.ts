import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PARENT_VERIFICATION_CODE } from '../../src/features/access';
import { createLocalFamilyRepository, LOCAL_FAMILY_STORAGE_KEY } from '../../src/services/local';
import { deviceLocalStorage } from '../../src/services/local/storage';
import { serviceRegistry } from '../../src/services';
import { usePrototypeStore } from '../../src/state/usePrototypeStore';
import type { FamilyConnectionDirectory } from '../../src/models/familyConnections';
import { enterChildExperienceForTest, resetPrototypeForTest } from '../helpers/prototypeStore';

function data<T>(result: { ok: true; data: T } | { ok: false; error: { message: string } }): T {
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

function record() {
  const family = usePrototypeStore.getState().localFamily.record;
  if (!family) throw new Error('Expected a family');
  return family;
}

function request(directory: FamilyConnectionDirectory) {
  return {
    directory,
    expectedFamilySnapshot: JSON.stringify(record()),
    expectedGeneration: usePrototypeStore.getState().demoRunGeneration,
  };
}

const directory: FamilyConnectionDirectory = {
  primaryGuardianName: ' Rashid ',
  secondaryGuardianName: ' Mariam ',
  relatives: [
    {
      id: 'relative_1',
      displayName: ' Grandmother Fatima ',
      relationship: 'grandmother',
      rhythm: 'monthly',
    },
  ],
};

async function createFamily() {
  data(
    usePrototypeStore.getState().requestParentVerification({
      identifier: 'parent@example.com',
      networkAvailable: false,
    }),
  );
  data(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
  data(
    usePrototypeStore.getState().updateParentOnboardingDraft({
      familyConnections: {
        primaryGuardianName: 'Rashid',
        secondaryGuardianName: '',
        relatives: [],
      },
    }),
  );
  data(usePrototypeStore.getState().completeParentOnboarding());
}

beforeEach(async () => {
  data(resetPrototypeForTest());
  await createFamily();
});

afterEach(() => vi.restoreAllMocks());

describe('Parent-only saved family connection editing', () => {
  it('adds the first relative, persists it and preserves family identity and progression', () => {
    const before = record();
    const progress = usePrototypeStore.getState();
    const plan = data(usePrototypeStore.getState().saveFamilyConnections(request(directory)));
    expect(plan.entries[0]).toMatchObject({
      displayName: 'Grandmother Fatima',
      progressEffects: 'none',
      recognitionMode: 'recognition_only',
    });
    const saved = data(createLocalFamilyRepository(deviceLocalStorage).read());
    expect(saved).toEqual(record());
    expect(saved).toMatchObject({
      createdAt: before.createdAt,
      familyName: before.familyName,
      parent: before.parent,
      children: before.children,
      pairedChildIds: before.pairedChildIds,
      familyConnections: {
        primaryGuardianName: 'Rashid',
        secondaryGuardianName: 'Mariam',
      },
    });
    const after = usePrototypeStore.getState();
    expect(after.children).toEqual(progress.children);
    expect(after.landscapeProgressByChild).toEqual(progress.landscapeProgressByChild);
    expect(after.taskAssignments).toEqual(progress.taskAssignments);
    expect(after.familyReward).toEqual(progress.familyReward);
    expect(after.recognitionLedger).toEqual(progress.recognitionLedger);
  });

  it('edits existing relationships/rhythms and allows removing every optional person', () => {
    data(usePrototypeStore.getState().saveFamilyConnections(request(directory)));
    const edited: FamilyConnectionDirectory = {
      ...record().familyConnections,
      secondaryGuardianName: '',
      relatives: [
        {
          id: 'relative_1',
          displayName: 'Aunt Hessa',
          relationship: 'aunt',
          rhythm: 'no_schedule',
        },
      ],
    };
    const plan = data(usePrototypeStore.getState().saveFamilyConnections(request(edited)));
    expect(plan.entries[0]).toMatchObject({ relationship: 'aunt', rhythm: 'no_schedule' });
    const empty = data(
      usePrototypeStore.getState().saveFamilyConnections(request({ ...edited, relatives: [] })),
    );
    expect(empty.entries).toEqual([]);
    expect(empty.guardianDisplayNames).toEqual(['Rashid']);
  });

  it('denies stale snapshots and old reset generations before writing', () => {
    const stale = request(directory);
    data(usePrototypeStore.getState().saveFamilyConnections(request(directory)));
    const save = vi.spyOn(serviceRegistry.localFamily, 'save');
    expect(usePrototypeStore.getState().saveFamilyConnections(stale).ok).toBe(false);
    expect(
      usePrototypeStore.getState().saveFamilyConnections({
        ...request(directory),
        expectedGeneration: usePrototypeStore.getState().demoRunGeneration - 1,
      }).ok,
    ).toBe(false);
    expect(save).not.toHaveBeenCalled();
  });

  it('denies Child and signed-out mutations despite a remembered family snapshot', async () => {
    const candidate = request(directory);
    data(usePrototypeStore.getState().signOutExperience());
    const save = vi.spyOn(serviceRegistry.localFamily, 'save');
    expect(usePrototypeStore.getState().saveFamilyConnections(candidate)).toMatchObject({
      ok: false,
      error: { code: 'PRIVACY_REJECTED' },
    });
    await enterChildExperienceForTest();
    save.mockClear();
    expect(usePrototypeStore.getState().saveFamilyConnections(candidate)).toMatchObject({
      ok: false,
      error: { code: 'PRIVACY_REJECTED' },
    });
    expect(usePrototypeStore.getState().getFamilyConnectionPlan().ok).toBe(false);
    expect(save).not.toHaveBeenCalled();
  });

  it('rejects added contact fields without writing', () => {
    const save = vi.spyOn(serviceRegistry.localFamily, 'save');
    const candidate = request({
      ...directory,
      relatives: [{ ...directory.relatives[0]!, contact: 'private-address' }],
    } as unknown as FamilyConnectionDirectory);
    expect(usePrototypeStore.getState().saveFamilyConnections(candidate)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
    expect(save).not.toHaveBeenCalled();
  });

  it('retains saved people and current state when storage throws or ignores the write', () => {
    const before = record();
    const raw = deviceLocalStorage.getItem(LOCAL_FAMILY_STORAGE_KEY);
    deviceLocalStorage.failNextWrite();
    expect(usePrototypeStore.getState().saveFamilyConnections(request(directory)).ok).toBe(false);
    expect(record()).toEqual(before);
    expect(deviceLocalStorage.getItem(LOCAL_FAMILY_STORAGE_KEY)).toBe(raw);
    vi.spyOn(deviceLocalStorage, 'setItem').mockImplementation(() => undefined);
    expect(usePrototypeStore.getState().saveFamilyConnections(request(directory)).ok).toBe(false);
    expect(record()).toEqual(before);
    expect(deviceLocalStorage.getItem(LOCAL_FAMILY_STORAGE_KEY)).toBe(raw);
  });

  it('rejects another saved family without overwriting it', () => {
    const candidate = request(directory);
    const foreign = {
      ...record(),
      familyName: 'Another family',
      createdAt: '2020-01-01T00:00:00.000Z',
    };
    data(serviceRegistry.localFamily.save(foreign));
    const save = vi.spyOn(serviceRegistry.localFamily, 'save');
    expect(usePrototypeStore.getState().saveFamilyConnections(candidate).ok).toBe(false);
    expect(save).not.toHaveBeenCalled();
    expect(data(serviceRegistry.localFamily.read())).toEqual(foreign);
    // Restore this deliberately substituted test fixture for the next isolated case.
    save.mockRestore();
    data(serviceRegistry.localFamily.save(record()));
  });

  it('rechecks authority after reading before writing', () => {
    const candidate = request(directory);
    const read = serviceRegistry.localFamily.read.bind(serviceRegistry.localFamily);
    vi.spyOn(serviceRegistry.localFamily, 'read').mockImplementationOnce(() => {
      const stored = read();
      data(usePrototypeStore.getState().signOutExperience());
      return stored;
    });
    const save = vi.spyOn(serviceRegistry.localFamily, 'save');
    expect(usePrototypeStore.getState().saveFamilyConnections(candidate).ok).toBe(false);
    expect(save).not.toHaveBeenCalled();
  });

  it('confirms a retry after interrupted readback without issuing another write', () => {
    const candidate = request(directory);
    const read = serviceRegistry.localFamily.read.bind(serviceRegistry.localFamily);
    vi.spyOn(serviceRegistry.localFamily, 'read')
      .mockImplementationOnce(read)
      .mockReturnValueOnce({
        ok: false,
        error: {
          code: 'INVALID_TRANSITION',
          message: 'Read unavailable',
          retryable: true,
          fallbackAvailable: false,
        },
      });
    expect(usePrototypeStore.getState().saveFamilyConnections(candidate).ok).toBe(false);
    expect(record().familyConnections.relatives).toHaveLength(0);
    const save = vi.spyOn(serviceRegistry.localFamily, 'save');
    const retried = usePrototypeStore.getState().saveFamilyConnections(candidate);
    expect(retried.ok).toBe(true);
    expect(record().familyConnections.relatives).toHaveLength(1);
    expect(save).not.toHaveBeenCalled();
  });
});
