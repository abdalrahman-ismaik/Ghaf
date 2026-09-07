import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  createChildDeviceAffinity,
  createParentDeviceAffinity,
  parseDeviceAffinityRecord,
} from '../src/features/access/rememberedDeviceAccess';
import { createLocalFamilyRecord } from '../src/features/local-family';
import type { LocalFamilyRecord } from '../src/models/localFamily';
import {
  createDeviceAccessRepository,
  createMemoryLocalKeyValueStorage,
  DEVICE_ACCESS_STORAGE_KEY,
} from '../src/services/local';

const CREATED_AT = '2026-09-06T14:00:00.000Z';
const UPDATED_AT = '2026-09-07T09:00:00.000Z';

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): T {
  expect(result.ok).toBe(true);
  if (!result.ok || result.data === undefined) throw new Error('Expected result to succeed');
  return result.data;
}

function localFamily(pairedChildIds: LocalFamilyRecord['pairedChildIds'] = []): LocalFamilyRecord {
  return expectOk(
    createLocalFamilyRecord({
      parentIdentifier: {
        normalizedIdentifier: 'parent@example.com',
        identifierKind: 'email',
        maskedDestination: 'p***@example.com',
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
          gender: 'prefer_not_to_say',
          interests: ['sustainability', 'nature'],
          hobbies: ['gardening'],
          accessibilityDefaults: ['simpler_instructions'],
          supportPreferences: ['short_steps', 'adult_alongside'],
          personalizationEnabled: true,
        },
      ],
      pairedChildIds,
      now: CREATED_AT,
    }),
  );
}

describe('Feature 005 device-affinity schema', () => {
  it('round-trips one exact Parent or eligible Child principal without an access secret', () => {
    const family = localFamily(['child_salem']);
    const parent = expectOk(createParentDeviceAffinity({ family, now: UPDATED_AT }));
    const child = expectOk(
      createChildDeviceAffinity({ family, childId: 'child_salem', now: UPDATED_AT }),
    );

    expect(parseDeviceAffinityRecord(JSON.stringify(parent))).toEqual({ ok: true, data: parent });
    expect(parseDeviceAffinityRecord(JSON.stringify(child))).toEqual({ ok: true, data: child });
    expect(parent).toMatchObject({
      schemaVersion: 1,
      principal: {
        role: 'parent',
        parentId: 'parent_al_noor',
        householdId: 'household_al_noor',
      },
      familyCreatedAt: CREATED_AT,
      origin: 'local_demo',
      capabilityTruth: 'local_prototype_not_authentication',
    });
    expect(child).toMatchObject({
      principal: {
        role: 'child',
        childId: 'child_salem',
        householdId: 'household_al_noor',
      },
    });
    expect(JSON.stringify({ parent, child })).not.toMatch(
      /424242|2468|password|verificationCode|sessionId|expiresAt|capabilities|token|proof/iu,
    );
  });

  it.each([
    'not-json',
    JSON.stringify({ schemaVersion: 2 }),
    JSON.stringify({
      ...expectOk(createParentDeviceAffinity({ family: localFamily(), now: UPDATED_AT })),
      extra: true,
    }),
    JSON.stringify({
      ...expectOk(createParentDeviceAffinity({ family: localFamily(), now: UPDATED_AT })),
      updatedAt: 'not-a-time',
    }),
    JSON.stringify({
      ...expectOk(createParentDeviceAffinity({ family: localFamily(), now: UPDATED_AT })),
      principal: { role: 'child', childId: 'child_unknown', householdId: 'household_al_noor' },
    }),
  ])('fails closed for malformed, expanded, unknown-version, or invalid data', (raw) => {
    expect(parseDeviceAffinityRecord(raw)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
  });

  it('rejects a Child marker before that exact profile is configured and paired', () => {
    expect(
      createChildDeviceAffinity({
        family: localFamily(),
        childId: 'child_salem',
        now: UPDATED_AT,
      }),
    ).toMatchObject({ ok: false });
    expect(
      createChildDeviceAffinity({
        family: localFamily(),
        childId: 'child_alya',
        now: UPDATED_AT,
      }),
    ).toMatchObject({ ok: false });
  });
});

describe('Feature 005 device-affinity repository', () => {
  it('reads absence, replaces one principal, clones reads, clears a matching Child, and clears all', () => {
    const storage = createMemoryLocalKeyValueStorage();
    const repository = createDeviceAccessRepository(storage);
    const family = localFamily(['child_salem']);

    expect(repository.read()).toEqual({ ok: true, data: null });
    const rememberedParent = expectOk(repository.rememberParent(family, UPDATED_AT));
    expect(repository.read()).toEqual({ ok: true, data: rememberedParent });

    const rememberedChild = expectOk(repository.rememberChild(family, 'child_salem', UPDATED_AT));
    expect(repository.read()).toEqual({ ok: true, data: rememberedChild });
    expect(storage.getItem(DEVICE_ACCESS_STORAGE_KEY)).not.toBeNull();

    expect(repository.clearMatchingChild('child_alya')).toEqual({ ok: true, data: false });
    expect(repository.read()).toEqual({ ok: true, data: rememberedChild });
    expect(repository.clearMatchingChild('child_salem')).toEqual({ ok: true, data: true });
    expect(repository.read()).toEqual({ ok: true, data: null });

    expectOk(repository.rememberParent(family, UPDATED_AT));
    expect(repository.clear()).toEqual({ ok: true, data: true });
    expect(repository.read()).toEqual({ ok: true, data: null });
  });

  it('fails closed for corrupt storage and preserves the prior record on failed writes', () => {
    const storage = createMemoryLocalKeyValueStorage();
    const repository = createDeviceAccessRepository(storage);
    const family = localFamily(['child_salem']);
    const rememberedParent = expectOk(repository.rememberParent(family, UPDATED_AT));

    storage.failNextWrite();
    expect(repository.rememberChild(family, 'child_salem', UPDATED_AT)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(repository.read()).toEqual({ ok: true, data: rememberedParent });

    storage.setItem(DEVICE_ACCESS_STORAGE_KEY, '{broken');
    expect(repository.read()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_RESPONSE' },
    });
  });

  it('blocks a clear failure so explicit logout cannot claim the marker was removed', () => {
    const storage = createMemoryLocalKeyValueStorage();
    const repository = createDeviceAccessRepository(storage);
    expectOk(repository.rememberParent(localFamily(), UPDATED_AT));

    storage.failNextWrite();
    expect(repository.clear()).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION' },
    });
    expect(repository.read()).toMatchObject({ ok: true, data: { principal: { role: 'parent' } } });
  });
});

describe('Feature 005 presentation source contract', () => {
  const source = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

  it.todo('shows an accessible unchecked Parent choice or a temporary Child-device notice');
  it.todo('uses the dedicated Child-to-Parent handoff from every Child-facing switch action');
  it.todo('keeps Arabic and English device-access copy structurally paired');

  void source;
});
