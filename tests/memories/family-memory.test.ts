import { describe, expect, it } from 'vitest';

import {
  addFamilyMemory,
  deleteFamilyMemory,
  emptyFamilyMemories,
  memoryFromRecognition,
  parseFamilyMemories,
  projectFamilyMemories,
} from '../../src/features/family-memory';
import { FAMILY_MEMORY_STORAGE_KEY, type FamilyMemory } from '../../src/models/familyMemory';
import { createFamilyMemoryRepository } from '../../src/services/local/familyMemoryRepository';
import { createMemoryLocalKeyValueStorage } from '../../src/services/local/memoryStorage';
import { createResetSourceSession } from '../../src/services/mock/fixtures';

const familyKey = 'memory:opaque-family-1';
const parent = { role: 'parent' } as const;
const child = { role: 'child', childId: 'child_alya' } as const;
const memory: FamilyMemory = {
  id: 'run-a:recognized-a',
  sourceEventId: 'run-a:recognized-a',
  familyKey,
  occurrenceId: 'assignment-a',
  childId: 'child_salem',
  title: { ar: 'فرز المواد النظيفة', en: 'Sort clean materials' },
  confirmedAt: '2026-09-14T10:00:00.000Z',
  savedAt: '2026-09-14T10:01:00.000Z',
  origin: 'local_synthetic_activity',
};
function ok<T>(result: { ok: true; data: T } | { ok: false; error: unknown }): T {
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.data;
}

describe('family memory domain and durable local repository', () => {
  it('restores exact text memories through a new repository instance and detaches reads', () => {
    const storage = createMemoryLocalKeyValueStorage();
    const first = createFamilyMemoryRepository(storage);
    const saved = ok(addFamilyMemory(emptyFamilyMemories(familyKey), parent, memory));
    expect(first.save(saved).ok).toBe(true);
    const restarted = createFamilyMemoryRepository(storage);
    expect(ok(restarted.load(familyKey))).toEqual(saved);
    const exposed = ok(restarted.load(familyKey));
    (exposed.memories[0]!.title as { en: string }).en = 'Changed caller copy';
    expect(ok(restarted.load(familyKey)).memories[0]!.title.en).toBe(memory.title.en);
  });

  it('deduplicates completion retries and retains a deletion tombstone after restart', () => {
    const storage = createMemoryLocalKeyValueStorage();
    const repository = createFamilyMemoryRepository(storage);
    const initial = ok(addFamilyMemory(emptyFamilyMemories(familyKey), parent, memory));
    const retried = ok(
      addFamilyMemory(initial, parent, { ...memory, savedAt: '2026-09-14T11:00:00.000Z' }),
    );
    expect(retried).toEqual(initial);
    const deleted = ok(deleteFamilyMemory(retried, parent, memory.id));
    expect(repository.save(deleted).ok).toBe(true);
    const restarted = ok(createFamilyMemoryRepository(storage).load(familyKey));
    expect(restarted.memories).toEqual([]);
    expect(addFamilyMemory(restarted, parent, memory)).toEqual({
      ok: false,
      error: { code: 'deleted' },
    });
    expect(ok(deleteFamilyMemory(restarted, parent, memory.id))).toEqual(restarted);
  });

  it('denies child mutations, sibling projection and other-family reads/writes', () => {
    const collection = ok(addFamilyMemory(emptyFamilyMemories(familyKey), parent, memory));
    expect(addFamilyMemory(collection, child, memory)).toEqual({
      ok: false,
      error: { code: 'forbidden' },
    });
    expect(deleteFamilyMemory(collection, child, memory.id)).toEqual({
      ok: false,
      error: { code: 'forbidden' },
    });
    expect(ok(projectFamilyMemories(collection, familyKey, child))).toEqual([]);
    expect(
      ok(projectFamilyMemories(collection, familyKey, { role: 'child', childId: 'child_salem' })),
    ).toEqual([memory]);
    expect(projectFamilyMemories(collection, 'another-family', parent).ok).toBe(false);
    const repository = createFamilyMemoryRepository(createMemoryLocalKeyValueStorage());
    ok(repository.save(collection));
    expect(repository.load('another-family')).toEqual({
      ok: false,
      error: { code: 'family_mismatch' },
    });
    expect(repository.save(emptyFamilyMemories('another-family')).ok).toBe(false);
    expect(ok(repository.load(familyKey))).toEqual(collection);
  });

  it('rejects forged schema, private fields, duplicate identifiers and invalid dates', () => {
    const collection = ok(addFamilyMemory(emptyFamilyMemories(familyKey), parent, memory));
    expect(parseFamilyMemories({ ...collection, media: 'private' }).ok).toBe(false);
    expect(
      parseFamilyMemories({ ...collection, memories: [{ ...memory, transcript: 'private' }] }).ok,
    ).toBe(false);
    expect(parseFamilyMemories({ ...collection, memories: [memory, memory] }).ok).toBe(false);
    expect(
      parseFamilyMemories({
        ...collection,
        memories: [{ ...memory, confirmedAt: '2026-02-30T00:00:00.000Z' }],
      }).ok,
    ).toBe(false);
    expect(
      parseFamilyMemories({ ...collection, deletedSourceIds: [memory.sourceEventId] }).ok,
    ).toBe(false);
  });

  it('reports thrown/silent storage failure and retries the same event safely', () => {
    const storage = createMemoryLocalKeyValueStorage();
    const repository = createFamilyMemoryRepository(storage);
    const collection = ok(addFamilyMemory(emptyFamilyMemories(familyKey), parent, memory));
    storage.failNextWrite();
    expect(repository.save(collection)).toEqual({ ok: false, error: { code: 'storage_write' } });
    expect(ok(repository.load(familyKey)).memories).toEqual([]);
    ok(repository.save(collection));
    const silent = createFamilyMemoryRepository({
      getItem: storage.getItem,
      setItem: () => undefined,
      removeItem: () => undefined,
    });
    expect(silent.save({ ...collection, memories: [] }).ok).toBe(false);
    expect(silent.clear()).toEqual({ ok: false, error: { code: 'storage_clear' } });
    expect(ok(repository.load(familyKey))).toEqual(collection);
    storage.setItem(FAMILY_MEMORY_STORAGE_KEY, '{bad');
    expect(repository.load(familyKey).ok).toBe(false);
    expect(repository.save(collection).ok).toBe(false);
  });

  it('clears old family data before establishing a replacement directory', () => {
    const repository = createFamilyMemoryRepository(createMemoryLocalKeyValueStorage());
    ok(repository.save(ok(addFamilyMemory(emptyFamilyMemories(familyKey), parent, memory))));
    ok(repository.clear());
    expect(ok(repository.load('memory:new-family')).memories).toEqual([]);
  });

  it('rejects edits to saved receipt fields, stale collections and removed tombstones', () => {
    const repository = createFamilyMemoryRepository(createMemoryLocalKeyValueStorage());
    const initial = ok(addFamilyMemory(emptyFamilyMemories(familyKey), parent, memory));
    ok(repository.save(initial));
    expect(
      repository.save({
        ...initial,
        memories: [{ ...memory, title: { ...memory.title, en: 'Changed title' } }],
      }).ok,
    ).toBe(false);
    expect(repository.save(emptyFamilyMemories(familyKey)).ok).toBe(false);
    const removed = ok(deleteFamilyMemory(initial, parent, memory.id));
    ok(repository.save(removed));
    expect(repository.save(initial).ok).toBe(false);
    expect(ok(repository.load(familyKey))).toEqual(removed);
  });

  it('derives only a confirmed eligible receipt and never imports submission or assistant details', () => {
    const session = createResetSourceSession('recognized');
    const result = memoryFromRecognition(session, {
      familyKey,
      runId: 'session-one',
      savedAt: memory.savedAt,
    });
    expect(result.ok).toBe(true);
    const value = ok(result);
    expect(value.childId).toBe('child_salem');
    expect(value.title).toEqual(session.journey!.task.content.title);
    expect(value.occurrenceId).toBe(session.journey!.assignment!.id);
    expect(Object.keys(value).sort()).toEqual(Object.keys(memory).sort());
    expect(
      memoryFromRecognition(createResetSourceSession('submitted'), {
        familyKey,
        runId: 'session-one',
        savedAt: memory.savedAt,
      }).ok,
    ).toBe(false);
    const wrongProfile = {
      ...session,
      journey: {
        ...session.journey!,
        task: { ...session.journey!.task, targetChildId: 'child_alya' as const },
      },
    };
    expect(
      memoryFromRecognition(wrongProfile, {
        familyKey,
        runId: 'session-one',
        savedAt: memory.savedAt,
      }).ok,
    ).toBe(false);
    const privateTask = {
      ...session,
      journey: {
        ...session.journey!,
        task: {
          ...session.journey!.task,
          content: { ...session.journey!.task.content, visibilityScope: 'child_guardian' as const },
        },
      },
    };
    expect(
      memoryFromRecognition(privateTask, {
        familyKey,
        runId: 'session-one',
        savedAt: memory.savedAt,
      }).ok,
    ).toBe(false);
    const changedTitle = {
      ...session,
      journey: {
        ...session.journey!,
        task: {
          ...session.journey!.task,
          content: {
            ...session.journey!.task.content,
            title: { ar: 'عنوان آخر', en: 'Unapproved private wording' },
          },
        },
      },
    };
    expect(
      memoryFromRecognition(changedTitle, {
        familyKey,
        runId: 'session-one',
        savedAt: memory.savedAt,
      }).ok,
    ).toBe(false);
    const changedAssignment = {
      ...session,
      journey: {
        ...session.journey!,
        assignment: { ...session.journey!.assignment!, taskId: 'other-task' },
      },
    };
    expect(
      memoryFromRecognition(changedAssignment, {
        familyKey,
        runId: 'session-one',
        savedAt: memory.savedAt,
      }).ok,
    ).toBe(false);
    const restarted = ok(
      memoryFromRecognition(session, { familyKey, runId: 'session-two', savedAt: memory.savedAt }),
    );
    expect(restarted.sourceEventId).not.toBe(value.sourceEventId);
  });
});
