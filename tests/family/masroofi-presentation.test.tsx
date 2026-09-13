import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { masroofiResources } from '../../src/i18n/masroofi';
import { resources } from '../../src/i18n/resources';

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

  it('keeps card markings synthetic and uses the version-aware Child projection for hidden rewards', () => {
    const card = source('src/components/masroofi/MasroofiCard.tsx');
    expect(card).toContain("t('masroofi.demo')");
    expect(card).not.toMatch(/\b(?:Visa|Mastercard|CVV|IBAN)\b/);
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
