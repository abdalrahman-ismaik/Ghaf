import { readFileSync } from 'node:fs';

import { beforeEach, describe, expect, it } from 'vitest';

import { PARENT_VERIFICATION_CODE } from '../../src/features/access';
import {
  createLocalFamilyProfileRepairCandidate,
  createLocalFamilyRecord,
} from '../../src/features/local-family';
import { serviceRegistry } from '../../src/services';
import {
  LOCAL_FAMILY_STORAGE_KEY,
  PREVIOUS_LOCAL_FAMILY_STORAGE_KEY,
  createLocalFamilyRepository,
  createMemoryLocalKeyValueStorage,
  deviceLocalStorage,
} from '../../src/services/local';
import { usePrototypeStore } from '../../src/state/usePrototypeStore';
import { resetAlteredFamilyFixtureForTest } from '../helpers/prototypeStore';

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): T {
  expect(result.ok).toBe(true);
  if (!result.ok || result.data === undefined) throw new Error('Expected result to succeed');
  return result.data;
}

function currentRecord() {
  return expectOk(
    createLocalFamilyRecord({
      parentIdentifier: {
        normalizedIdentifier: 'parent@example.com',
        identifierKind: 'email',
        maskedDestination: 'p***@example.com',
      },
      familyConnections: {
        primaryGuardianName: 'Rashid',
        secondaryGuardianName: 'Maryam',
        relatives: [],
      },
      familyName: 'Palm Family',
      appLanguage: 'en',
      children: [
        {
          id: 'child_salem',
          role: 'child',
          nickname: 'Salem',
          avatarId: 'ghaf_tree',
          ageBand: '9_11',
          preferredLanguage: 'both',
          sex: 'male',
          interests: ['sustainability', 'nature'],
          hobbies: ['gardening'],
          accessibilityDefaults: ['simpler_instructions'],
          supportPreferences: ['short_steps', 'adult_alongside'],
          customInterest: null,
          customHobby: null,
          customSupportPreference: null,
          customAccessibility: null,
          personalizationEnabled: true,
        },
        {
          id: 'child_alya',
          role: 'child',
          nickname: 'Alya',
          avatarId: 'flower',
          ageBand: '9_11',
          preferredLanguage: 'ar',
          sex: 'female',
          interests: ['stories'],
          hobbies: ['reading'],
          accessibilityDefaults: [],
          supportPreferences: ['visual_examples'],
          customInterest: null,
          customHobby: null,
          customSupportPreference: null,
          customAccessibility: null,
          personalizationEnabled: true,
        },
      ],
      pairedChildIds: ['child_salem'],
      now: '2026-09-06T14:00:00.000Z',
    }),
  );
}

function previousRaw(secondGender: 'girl' | 'prefer_not_to_say' | null = null): string {
  const current = currentRecord();
  return JSON.stringify({
    ...current,
    schemaVersion: 3,
    children: current.children.map((child, index) => {
      const {
        sex: _sex,
        customInterest: _customInterest,
        customHobby: _customHobby,
        customSupportPreference: _customSupportPreference,
        customAccessibility: _customAccessibility,
        ...previous
      } = child;
      return { ...previous, gender: index === 0 ? 'boy' : secondGender };
    }),
  });
}

describe('legacy required-sex profile repair repository', () => {
  it.each([null, 'prefer_not_to_say'] as const)(
    'projects a strict read-only repair candidate for %s without inference or storage mutation',
    (oldValue) => {
      const storage = createMemoryLocalKeyValueStorage();
      const repository = createLocalFamilyRepository(storage);
      const raw = previousRaw(oldValue);
      storage.setItem(PREVIOUS_LOCAL_FAMILY_STORAGE_KEY, raw);

      expect(repository.read()).toMatchObject({ ok: false });
      const candidate = expectOk(repository.readProfileRepairCandidate());

      expect(candidate).toMatchObject({
        sourceSchemaVersion: 3,
        familyName: 'Palm Family',
        parent: { normalizedIdentifier: 'parent@example.com', identifierKind: 'email' },
        children: [
          { id: 'child_salem', sex: 'male' },
          {
            id: 'child_alya',
            sex: null,
            customInterest: null,
            customHobby: null,
            customSupportPreference: null,
            customAccessibility: null,
          },
        ],
        pairedChildIds: ['child_salem'],
      });
      expect(storage.getItem(PREVIOUS_LOCAL_FAMILY_STORAGE_KEY)).toBe(raw);
      expect(storage.getItem(LOCAL_FAMILY_STORAGE_KEY)).toBeNull();
    },
  );

  it('rejects corrupt input and a prior record that already has explicit values', () => {
    expect(createLocalFamilyProfileRepairCandidate('{}', 3)).toMatchObject({ ok: false });
    expect(createLocalFamilyProfileRepairCandidate(previousRaw('girl'), 3)).toMatchObject({
      ok: false,
    });
  });

  it.each([1, 2] as const)(
    'normalizes a repairable schema-%s candidate through its historical strict defaults',
    (sourceSchemaVersion) => {
      const previous = JSON.parse(previousRaw()) as Record<string, unknown>;
      const { familyConnections: _familyConnections, ...withoutConnections } = previous;
      const historical =
        sourceSchemaVersion === 1
          ? {
              ...withoutConnections,
              schemaVersion: 1,
              parent: { id: 'parent_al_noor', role: 'parent' },
            }
          : { ...withoutConnections, schemaVersion: 2 };

      expectOk(
        createLocalFamilyProfileRepairCandidate(JSON.stringify(historical), sourceSchemaVersion),
      );
      expect(
        createLocalFamilyProfileRepairCandidate(JSON.stringify(historical), sourceSchemaVersion),
      ).toMatchObject({
        ok: true,
        data: {
          sourceSchemaVersion,
          parent: {
            normalizedIdentifier: 'parent@example.com',
            identifierKind: 'email',
          },
          children: [{ sex: 'male' }, { sex: null }],
        },
      });
    },
  );

  it('writes a complete schema-4 record before retiring the old key', () => {
    const storage = createMemoryLocalKeyValueStorage();
    const repository = createLocalFamilyRepository(storage);
    const raw = previousRaw();
    storage.setItem(PREVIOUS_LOCAL_FAMILY_STORAGE_KEY, raw);

    storage.failNextWrite();
    expect(repository.saveProfileRepair(currentRecord())).toMatchObject({ ok: false });
    expect(storage.getItem(PREVIOUS_LOCAL_FAMILY_STORAGE_KEY)).toBe(raw);
    expect(storage.getItem(LOCAL_FAMILY_STORAGE_KEY)).toBeNull();

    expect(repository.saveProfileRepair(currentRecord())).toMatchObject({
      ok: true,
      data: { schemaVersion: 4, pairedChildIds: ['child_salem'] },
    });
    expect(storage.getItem(LOCAL_FAMILY_STORAGE_KEY)).not.toBeNull();
    expect(storage.getItem(PREVIOUS_LOCAL_FAMILY_STORAGE_KEY)).toBeNull();
  });
});

describe('verified returning-family profile repair', () => {
  beforeEach(() => {
    expectOk(resetAlteredFamilyFixtureForTest());
    deviceLocalStorage.setItem(PREVIOUS_LOCAL_FAMILY_STORAGE_KEY, previousRaw());
    const candidate = expectOk(serviceRegistry.localFamily.readProfileRepairCandidate());
    usePrototypeStore.setState({
      activeExperience: 'signed_out',
      role: 'parent',
      localFamily: {
        status: 'unavailable',
        record: null,
        configuredChildIds: [],
        errorCode: 'invalid_or_unavailable_local_data',
        storageTruth: 'device_local_demo_only',
      },
      localFamilyProfileRepair: candidate,
      pendingFamilyCreation: null,
    });
  });

  it('accepts only the exact saved Parent identifier and grants no authority before completion', async () => {
    expect(
      usePrototypeStore.getState().requestExistingParentVerification({
        identifier: 'someone@example.com',
        networkAvailable: false,
      }),
    ).toMatchObject({ ok: false, error: { code: 'NOT_FOUND' } });

    expectOk(
      usePrototypeStore.getState().requestExistingParentVerification({
        identifier: 'parent@example.com',
        networkAvailable: false,
      }),
    );
    expect(usePrototypeStore.getState().pendingFamilyCreation).toBe('profile_repair');
    await expect(usePrototypeStore.getState().verifyParentCode('111111')).resolves.toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
    expect(usePrototypeStore.getState().activeExperience).toBe('signed_out');
    expect(deviceLocalStorage.getItem(PREVIOUS_LOCAL_FAMILY_STORAGE_KEY)).not.toBeNull();

    expectOk(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
    expectOk(usePrototypeStore.getState().beginVerifiedFamilyProfileRepair());
    expect(usePrototypeStore.getState()).toMatchObject({
      activeExperience: 'signed_out',
      parentOnboarding: {
        status: 'verified',
        completionReceipt: null,
        draft: {
          familyName: 'Palm Family',
          children: [
            { nickname: 'Salem', sex: 'male' },
            { nickname: 'Alya', sex: null },
          ],
        },
      },
      localFamily: { status: 'unavailable', record: null, configuredChildIds: [] },
    });
    expect(usePrototypeStore.getState().completeParentOnboarding()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
  });

  it('preserves the old record on cancel or failed save', async () => {
    expectOk(
      usePrototypeStore.getState().requestExistingParentVerification({
        identifier: 'parent@example.com',
      }),
    );
    expectOk(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
    expectOk(usePrototypeStore.getState().beginVerifiedFamilyProfileRepair());
    expectOk(usePrototypeStore.getState().cancelParentVerification());
    expect(usePrototypeStore.getState()).toMatchObject({
      activeExperience: 'signed_out',
      pendingFamilyCreation: null,
      localFamilyProfileRepair: { familyName: 'Palm Family' },
    });
    expect(deviceLocalStorage.getItem(PREVIOUS_LOCAL_FAMILY_STORAGE_KEY)).not.toBeNull();

    expectOk(
      usePrototypeStore.getState().requestExistingParentVerification({
        identifier: 'parent@example.com',
      }),
    );
    expectOk(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
    expectOk(usePrototypeStore.getState().beginVerifiedFamilyProfileRepair());
    expectOk(
      usePrototypeStore.getState().updateParentOnboardingDraft({
        childIndex: 1,
        child: { sex: 'female' },
      }),
    );
    deviceLocalStorage.failNextWrite();
    expect(usePrototypeStore.getState().completeParentOnboarding()).toMatchObject({ ok: false });
    expect(usePrototypeStore.getState().activeExperience).toBe('signed_out');
    expect(deviceLocalStorage.getItem(PREVIOUS_LOCAL_FAMILY_STORAGE_KEY)).not.toBeNull();
    expect(deviceLocalStorage.getItem(LOCAL_FAMILY_STORAGE_KEY)).toBeNull();
  });

  it('promotes the completed record, preserves pairing, and allows normal returning sign-in', async () => {
    expectOk(
      usePrototypeStore.getState().requestExistingParentVerification({
        identifier: 'parent@example.com',
        networkAvailable: false,
      }),
    );
    expectOk(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
    expectOk(usePrototypeStore.getState().beginVerifiedFamilyProfileRepair());
    expectOk(
      usePrototypeStore.getState().updateParentOnboardingDraft({
        childIndex: 1,
        child: { sex: 'female' },
      }),
    );
    expectOk(usePrototypeStore.getState().completeParentOnboarding());

    expect(usePrototypeStore.getState()).toMatchObject({
      activeExperience: 'parent',
      pendingFamilyCreation: null,
      localFamilyProfileRepair: null,
      localFamily: {
        status: 'ready',
        record: {
          schemaVersion: 4,
          familyName: 'Palm Family',
          pairedChildIds: ['child_salem'],
          children: [{ sex: 'male' }, { sex: 'female' }],
        },
        configuredChildIds: ['child_salem', 'child_alya'],
      },
    });
    expect(deviceLocalStorage.getItem(PREVIOUS_LOCAL_FAMILY_STORAGE_KEY)).toBeNull();
    expect(deviceLocalStorage.getItem(LOCAL_FAMILY_STORAGE_KEY)).not.toBeNull();

    expectOk(usePrototypeStore.getState().signOutExperience());
    expectOk(
      usePrototypeStore.getState().requestExistingParentVerification({
        identifier: 'parent@example.com',
      }),
    );
  });
});

describe('profile repair route contract', () => {
  it('reuses local profile and review screens with equivalent bilingual explanation', () => {
    const verification = readFileSync(
      new URL('../../app/access/parent/verification.tsx', import.meta.url),
      'utf8',
    );
    const childProfile = readFileSync(
      new URL('../../app/access/parent/add-first-child.tsx', import.meta.url),
      'utf8',
    );
    const review = readFileSync(
      new URL('../../app/access/parent/review-create.tsx', import.meta.url),
      'utf8',
    );
    const resources = readFileSync(new URL('../../src/i18n/resources.ts', import.meta.url), 'utf8');

    expect(verification).not.toContain('beginVerifiedFamilyProfileRepair');
    expect(verification).toContain("pendingFamilyCreation === 'profile_repair'");
    expect(childProfile).toContain("pendingFamilyCreation === 'profile_repair'");
    expect(review).toContain("pendingFamilyCreation === 'profile_repair'");
    expect(
      readFileSync(new URL('../../app/access/parent/sign-in.tsx', import.meta.url), 'utf8'),
    ).toContain('beginLocalFamilyProfileRepair');
    for (const key of ['profileRepairTitle', 'profileRepairBody', 'profileRepairReview']) {
      expect(resources.match(new RegExp(`${key}:`, 'gu'))).toHaveLength(2);
    }
  });
});
