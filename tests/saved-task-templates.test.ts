import { describe, expect, it } from 'vitest';

import { createSavedTaskTemplateRepository } from '../src/services/local/savedTaskTemplateRepository';
import { createMemoryLocalKeyValueStorage } from '../src/services/local/storage';

const input = {
  householdId: 'household_al_noor' as const,
  categoryId: 'home_responsibility' as const,
  title: { ar: 'ترتيب مساحة الدراسة', en: 'Tidy the study space' },
  positiveAction: {
    ar: 'رتّب الكتب والأقلام في مكانها.',
    en: 'Put books and pens in their places.',
  },
  recurrence: 'recurrent' as const,
};

describe('Parent saved task templates', () => {
  it('saves, restores, reuses, and deletes bounded local wording without task authority', () => {
    const storage = createMemoryLocalKeyValueStorage();
    const repository = createSavedTaskTemplateRepository(storage);
    const saved = repository.save(input, '2026-09-08T10:00:00.000Z');
    expect(saved.ok).toBe(true);
    if (!saved.ok) throw new Error('Expected saved template');
    expect(saved.data).not.toHaveProperty('displayedSeedAward');
    expect(saved.data).not.toHaveProperty('childId');
    expect(repository.read('household_al_noor')).toMatchObject({ ok: true, data: [saved.data] });
    expect(repository.remove(saved.data.id, 'household_al_noor')).toMatchObject({
      ok: true,
      data: true,
    });
    expect(repository.read('household_al_noor')).toMatchObject({ ok: true, data: [] });
  });

  it('rejects blanks, duplicates, unknown fields, and more than twenty entries', () => {
    const repository = createSavedTaskTemplateRepository(createMemoryLocalKeyValueStorage());
    expect(
      repository.save({ ...input, title: { ar: ' ', en: ' ' } }, '2026-09-08T10:00:00.000Z').ok,
    ).toBe(false);
    expect(
      repository.save({ ...input, evidence: 'photo' } as never, '2026-09-08T10:00:00.000Z').ok,
    ).toBe(false);
    expect(repository.save(input, '2026-09-08T10:00:00.000Z').ok).toBe(true);
    expect(repository.save(input, '2026-09-08T10:01:00.000Z').ok).toBe(false);
    for (let index = 1; index < 20; index += 1) {
      expect(
        repository.save(
          { ...input, title: { ar: `مهمة ${index}`, en: `Task ${index}` } },
          `2026-09-08T10:${String(index).padStart(2, '0')}:00.000Z`,
        ).ok,
      ).toBe(true);
    }
    expect(
      repository.save(
        { ...input, title: { ar: 'أكثر', en: 'Overflow' } },
        '2026-09-08T11:00:00.000Z',
      ).ok,
    ).toBe(false);
  });

  it('fails closed for corrupt storage and clears deterministically', () => {
    const storage = createMemoryLocalKeyValueStorage();
    storage.setItem('ghaf:saved-task-templates:v1', '{bad json');
    const repository = createSavedTaskTemplateRepository(storage);
    expect(repository.read('household_al_noor').ok).toBe(false);
    expect(repository.clear()).toMatchObject({ ok: true, data: true });
    expect(repository.read('household_al_noor')).toMatchObject({ ok: true, data: [] });
  });
});
