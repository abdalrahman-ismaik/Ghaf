import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { beforeEach, describe, expect, it } from 'vitest';

import { PARENT_VERIFICATION_CODE } from '../../src/features/access';
import {
  createFamilyConnectionPlan,
  validateCompleteFamilyConnectionDirectory,
} from '../../src/features/family-connections';
import {
  FAMILY_RELATIVE_IDS,
  type FamilyConnectionDirectory,
} from '../../src/models/familyConnections';
import { resources } from '../../src/i18n/resources';
import {
  LEGACY_LOCAL_FAMILY_STORAGE_KEY,
  LOCAL_FAMILY_STORAGE_KEY,
  PREVIOUS_LOCAL_FAMILY_STORAGE_KEY,
} from '../../src/services/local';
import { deviceLocalStorage } from '../../src/services/local/storage';
import { usePrototypeStore } from '../../src/state/usePrototypeStore';
import { enterChildExperienceForTest, resetPrototypeForTest } from '../helpers/prototypeStore';

function source(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(`../../${relativePath}`, import.meta.url)), 'utf8');
}

function directory(overrides: Partial<FamilyConnectionDirectory> = {}): FamilyConnectionDirectory {
  return {
    primaryGuardianName: ' راشد ',
    secondaryGuardianName: ' مريم ',
    relatives: [
      {
        id: 'relative_1',
        displayName: ' الجدة فاطمة ',
        relationship: 'grandmother',
        rhythm: 'monthly',
      },
      {
        id: 'relative_2',
        displayName: ' العم خالد ',
        relationship: 'uncle',
        rhythm: 'every_three_months',
      },
    ],
    ...overrides,
  };
}

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): T {
  expect(result.ok).toBe(true);
  if (!result.ok || result.data === undefined) throw new Error('Expected success');
  return result.data;
}

describe('family connection directory', () => {
  it('trims complete guardian and relative display names while preserving selected structure', () => {
    expect(expectOk(validateCompleteFamilyConnectionDirectory(directory()))).toEqual({
      primaryGuardianName: 'راشد',
      secondaryGuardianName: 'مريم',
      relatives: [
        {
          id: 'relative_1',
          displayName: 'الجدة فاطمة',
          relationship: 'grandmother',
          rhythm: 'monthly',
        },
        {
          id: 'relative_2',
          displayName: 'العم خالد',
          relationship: 'uncle',
          rhythm: 'every_three_months',
        },
      ],
    });
  });

  it('accepts zero or six optional relatives and duplicate display names with unique slots', () => {
    expect(validateCompleteFamilyConnectionDirectory(directory({ relatives: [] })).ok).toBe(true);
    const relatives = FAMILY_RELATIVE_IDS.map((id, index) => ({
      id,
      displayName: index % 2 === 0 ? 'فاطمة' : 'Fatima',
      relationship: index % 2 === 0 ? ('grandmother' as const) : ('aunt' as const),
      rhythm: index % 3 === 0 ? ('weekly' as const) : ('no_schedule' as const),
    }));
    expect(validateCompleteFamilyConnectionDirectory(directory({ relatives })).ok).toBe(true);
  });

  it.each([
    directory({ primaryGuardianName: ' ' }),
    directory({ primaryGuardianName: 'را\u202Eشد' }),
    directory({ secondaryGuardianName: 'x' }),
    directory({
      relatives: [{ ...directory().relatives[0]!, displayName: 'فاطمة\u0000' }],
    }),
    directory({
      relatives: [
        ...directory().relatives,
        ...FAMILY_RELATIVE_IDS.slice(2).map((id) => ({
          id,
          displayName: id,
          relationship: 'grandfather' as const,
          rhythm: 'weekly' as const,
        })),
        {
          id: 'relative_1',
          displayName: 'seventh',
          relationship: 'uncle',
          rhythm: 'monthly',
        },
      ],
    }),
    directory({
      relatives: [directory().relatives[0]!, { ...directory().relatives[1]!, id: 'relative_1' }],
    }),
    {
      ...directory(),
      relatives: [{ ...directory().relatives[0]!, contact: '+971500000000' }],
    } as unknown as FamilyConnectionDirectory,
  ])('fails closed for incomplete, expanded, duplicated, or over-limit data', (candidate) => {
    expect(validateCompleteFamilyConnectionDirectory(candidate)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
  });
});

describe('prepared family connection plan', () => {
  it('derives one stable private no-effects entry for every explicitly configured relative', () => {
    const first = expectOk(createFamilyConnectionPlan(directory()));
    const second = expectOk(createFamilyConnectionPlan(directory()));

    expect(second).toEqual(first);
    expect(first.entries).toHaveLength(2);
    expect(first.guardianDisplayNames).toEqual(['راشد', 'مريم']);
    expect(first.entries.map((entry) => entry.relativeId)).toEqual(['relative_1', 'relative_2']);
    expect(first.entries.every((entry) => entry.remoteAlternativeId === 'call_or_message')).toBe(
      true,
    );
    expect(first.entries.every((entry) => entry.recognitionMode === 'recognition_only')).toBe(true);
    expect(first.entries.every((entry) => entry.requiresParentReview)).toBe(true);
    expect(first.entries.every((entry) => entry.childMayChooseOrSkip)).toBe(true);
    expect(first.entries.every((entry) => entry.schedulingAuthority === 'none')).toBe(true);
    expect(first.entries.every((entry) => entry.progressEffects === 'none')).toBe(true);
    expect(first.entries.every((entry) => entry.origin === 'prepared_local')).toBe(true);
  });

  it('creates no inferred plan entry when no relative was provided', () => {
    expect(expectOk(createFamilyConnectionPlan(directory({ relatives: [] })))).toEqual({
      entries: [],
      guardianDisplayNames: ['راشد', 'مريم'],
      origin: 'prepared_local',
      localOnly: true,
    });
  });
});

describe('family connection presentation and isolation contract', () => {
  it('keeps people setup on Family Basics and exposes later editing only through Parent routes', () => {
    const basics = source('app/access/parent/family-basics.tsx');
    const review = source('app/access/parent/review-create.tsx');
    const parentFamily = source('app/parent/family/index.tsx');

    expect(basics).toContain('<FamilyPeopleEditor');
    expect(basics.indexOf('<FamilyPeopleEditor')).toBeLessThan(
      basics.indexOf('testID="family-name-input"'),
    );
    expect(review).toContain('family-connections-review');
    expect(parentFamily).toContain('<FamilyConnectionPlan');
    expect(parentFamily).toContain('getFamilyConnectionPlan');
    expect(parentFamily).not.toContain('record.familyConnections');
  });

  it('keeps the approved catalog separate from private family contacts', () => {
    const composer = source('src/components/family-growth/ParentTaskComposer.tsx');
    const taskService = source('src/services/mock/index.ts');

    expect(composer).toContain('selectedTemplateId === P0_RECYCLING_TEMPLATE.id');
    expect(composer).toContain('template.catalogExecution');
    expect(composer).toContain('<CatalogParentReview');
    expect(composer).not.toContain('family-connections');
    expect(taskService).not.toContain('family-connections');
  });

  it('does not import the private directory into Child, Circle, assistant, League, or reward code', () => {
    const privateConsumers = [
      'app/child/index.tsx',
      'app/child/task.tsx',
      'app/league.tsx',
      'app/circle.tsx',
      'src/features/assistants/policy.ts',
      'src/features/league/index.ts',
      'src/features/family-rewards/index.ts',
      'src/features/shared-growth/sharedGrowth.ts',
    ];
    for (const path of privateConsumers) {
      const text = source(path);
      expect(text).not.toMatch(/familyConnections|family-connections|FamilyConnectionPlan/u);
    }
  });

  it('keeps Arabic and English controls equivalent and contains no scheduling implementation', () => {
    const ar = resources.ar.translation.access.setup;
    const en = resources.en.translation.access.setup;
    expect(Object.keys(ar.relationship)).toEqual(Object.keys(en.relationship));
    expect(Object.keys(ar.rhythm)).toEqual(Object.keys(en.rhythm));
    expect(ar.peopleTitle).not.toBe(en.peopleTitle);
    expect(ar.peoplePrivacy).not.toBe(en.peoplePrivacy);

    const implementation = [
      source('src/features/family-connections/index.ts'),
      source('src/components/family/FamilyConnectionPlan.tsx'),
    ].join('\n');
    expect(implementation).not.toMatch(
      /expo-notifications|scheduleNotificationAsync|setInterval|new Date/u,
    );
    const plan = source('src/components/family/FamilyConnectionPlan.tsx');
    expect(plan).toContain('FamilyPeopleEditor');
    expect(plan).toContain('saveFamilyConnections');
    expect(plan).toContain('selectHasActiveParentExperience');
  });

  it('isolates mixed-script names and gives the Parent explicit visit and help responsibility', () => {
    const plan = source('src/components/family/FamilyConnectionPlan.tsx');
    const ar = resources.ar.translation.r003.family.connectionBoundary;
    const en = resources.en.translation.r003.family.connectionBoundary;

    expect(plan).toContain("'\\u2068' + value + '\\u2069'");
    expect(plan).toMatch(/plan\.guardianDisplayNames\s*\.map\(isolateFamilyName\)/u);
    expect(plan).toContain('name: isolateFamilyName(entry.displayName)');
    expect(en).toMatch(/Parent arranges contact and transport/u);
    expect(en).toMatch(/hot, sharp, electrical, chemical, medication, breakable/u);
    expect(ar).toMatch(/وليّ الأمر.*التواصل والتنقّل/u);
    expect(ar).toMatch(/ساخن|حاد|كهربائي|كيميائي|دواء|قابل للكسر/u);
    expect(source('src/components/access/FamilyPeopleEditor.tsx')).toContain(
      'CONTROL_CHARACTER_PATTERN',
    );
  });
});

describe('family connection Parent authority and reset', () => {
  beforeEach(() => {
    expectOk(resetPrototypeForTest());
  });

  async function createFamilyWithRelative() {
    expectOk(
      usePrototypeStore.getState().requestParentVerification({
        identifier: 'parent@example.com',
        networkAvailable: false,
      }),
    );
    expectOk(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
    expectOk(
      usePrototypeStore.getState().updateParentOnboardingDraft({
        familyConnections: {
          primaryGuardianName: 'راشد',
          secondaryGuardianName: 'مريم',
          relatives: [
            {
              id: 'relative_1',
              displayName: 'الجدة فاطمة',
              relationship: 'grandmother',
              rhythm: 'monthly',
            },
          ],
        },
      }),
    );
    expectOk(usePrototypeStore.getState().completeParentOnboarding());
  }

  it('returns the prepared plan only to an active Parent and denies a Child', async () => {
    expect(usePrototypeStore.getState().getFamilyConnectionPlan()).toMatchObject({
      ok: false,
      error: { code: 'PRIVACY_REJECTED' },
    });

    await createFamilyWithRelative();
    expect(usePrototypeStore.getState().getFamilyConnectionPlan()).toMatchObject({
      ok: true,
      data: {
        localOnly: true,
        entries: [
          {
            displayName: 'الجدة فاطمة',
            ideaKind: 'visit_or_call',
            progressEffects: 'none',
          },
        ],
      },
    });

    expectOk(usePrototypeStore.getState().signOutExperience());
    await enterChildExperienceForTest();
    expect(usePrototypeStore.getState().getFamilyConnectionPlan()).toMatchObject({
      ok: false,
      error: { code: 'PRIVACY_REJECTED' },
    });
  });

  it('removes current and older family-directory keys through exact reset', async () => {
    await createFamilyWithRelative();
    deviceLocalStorage.setItem(PREVIOUS_LOCAL_FAMILY_STORAGE_KEY, '{}');
    deviceLocalStorage.setItem(LEGACY_LOCAL_FAMILY_STORAGE_KEY, '{}');

    expectOk(usePrototypeStore.getState().resetPrototype());
    expect(deviceLocalStorage.getItem(LOCAL_FAMILY_STORAGE_KEY)).toBeNull();
    expect(deviceLocalStorage.getItem(PREVIOUS_LOCAL_FAMILY_STORAGE_KEY)).toBeNull();
    expect(deviceLocalStorage.getItem(LEGACY_LOCAL_FAMILY_STORAGE_KEY)).toBeNull();
    expect(usePrototypeStore.getState().parentOnboarding.draft.familyConnections).toEqual({
      primaryGuardianName: 'راشد',
      secondaryGuardianName: '',
      relatives: [],
    });
  });
});
