import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { masroofiResources } from '../../src/i18n/masroofi';
import { resources } from '../../src/i18n/resources';
import { MASROOFI_CATEGORIES } from '../../src/models/masroofi';
import { MASROOFI_PURCHASE_FIXTURES } from '../../src/features/masroofi/service';

const source = (path: string) =>
  readFileSync(fileURLToPath(new URL(`../../${path}`, import.meta.url)), 'utf8');

describe('Masroofi bilingual presentation and route boundaries', () => {
  it('registers equivalent nonempty Arabic and English copy with matching placeholders', () => {
    expect(Object.keys(masroofiResources.ar).sort()).toEqual(
      Object.keys(masroofiResources.en).sort(),
    );
    for (const key of Object.keys(masroofiResources.ar) as (keyof typeof masroofiResources.ar)[]) {
      const ar = masroofiResources.ar[key];
      const en = masroofiResources.en[key];
      expect(ar.trim()).not.toBe('');
      expect(en.trim()).not.toBe('');
      expect(ar.match(/\{\{[^}]+\}\}/g) ?? []).toEqual(en.match(/\{\{[^}]+\}\}/g) ?? []);
    }
    expect(resources.ar.translation.masroofi).toEqual(masroofiResources.ar);
    expect(resources.en.translation.masroofi).toEqual(masroofiResources.en);
  });

  it('places both routes beneath existing role guards and honors the independent disable switch', () => {
    expect(source('app/parent/_layout.tsx')).toContain('authorizeParentExperience');
    expect(source('app/child/_layout.tsx')).toContain('authorizeChildExperience');
    for (const path of ['app/parent/family/masroofi.tsx', 'app/child/masroofi.tsx']) {
      expect(source(path)).toContain('if (!masroofiDemoEnabled)');
      expect(source(path)).toContain('Redirect');
    }
    expect(source('src/config/masroofi.ts')).toContain(
      "process.env.EXPO_PUBLIC_GHAF_MASROOFI !== 'false'",
    );
  });

  it('provides readable labels for every spending category and purchase in both languages', () => {
    for (const locale of ['ar', 'en'] as const) {
      const copy: Readonly<Record<string, string>> = masroofiResources[locale];
      for (const category of MASROOFI_CATEGORIES) expect(copy[category]?.trim()).toBeTruthy();
      for (const fixture of Object.values(MASROOFI_PURCHASE_FIXTURES)) {
        expect(copy[`item_${fixture.id}`]?.trim()).toBeTruthy();
      }
      expect(copy.channelOnline).not.toBe(copy.channelInStore);
    }
  });

  it('uses the version-aware Child projection for hidden task rewards', () => {
    const notice = source('src/components/masroofi/MasroofiTaskRewardNotice.tsx');
    expect(notice).toContain('getMasroofiChild');
    expect(notice).toContain('promisedTasks');
    expect(notice).not.toContain('getMasroofiParent');
    expect(notice).not.toContain('.promises');
    expect(source('src/components/catalog/CatalogTaskList.tsx')).toContain(
      'MasroofiTaskRewardNotice',
    );
  });
});
