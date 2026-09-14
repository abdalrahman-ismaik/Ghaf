import { ParentAccountError } from '../../models/parentAccount';
import type { AccountStorage } from './storage';

export interface SecureStorePort {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

const CHUNK_SIZE = 450;
const MAX_CHUNKS = 128;

interface Manifest {
  bank: 0 | 1;
  count: number;
  length: number;
}

function readManifest(value: string | null): Manifest | null {
  if (value === null) return null;
  try {
    const parsed = JSON.parse(value) as Manifest;
    if (
      (parsed.bank === 0 || parsed.bank === 1) &&
      Number.isInteger(parsed.count) &&
      parsed.count > 0 &&
      parsed.count <= MAX_CHUNKS &&
      Number.isInteger(parsed.length) &&
      parsed.length > 0 &&
      parsed.length <= MAX_CHUNKS * CHUNK_SIZE
    )
      return parsed;
  } catch {}
  throw new ParentAccountError('storage_unavailable');
}

// Each UTF-16 chunk stays below native per-item limits, including non-ASCII email metadata.
export function createSecureAccountStorage(secure: SecureStorePort): AccountStorage {
  const manifestKey = (key: string) => `${key}.manifest`;
  const chunkKey = (key: string, bank: number, index: number) => `${key}.${bank}.${index}`;
  const bankKey = (key: string, bank: number) => `${key}.bank.${bank}`;
  const clearBank = async (key: string, bank: number) => {
    const inventory = await secure.getItemAsync(bankKey(key, bank));
    const parsed = Number(inventory);
    const count =
      inventory === null
        ? 0
        : Number.isInteger(parsed) && parsed > 0 && parsed <= MAX_CHUNKS
          ? parsed
          : MAX_CHUNKS;
    for (let index = 0; index < count; index++) {
      await secure.deleteItemAsync(chunkKey(key, bank, index));
    }
    await secure.deleteItemAsync(bankKey(key, bank));
  };
  return {
    async getItem(key) {
      const manifest = readManifest(await secure.getItemAsync(manifestKey(key)));
      if (!manifest) return null;
      const chunks: string[] = [];
      for (let index = 0; index < manifest.count; index++) {
        const part = await secure.getItemAsync(chunkKey(key, manifest.bank, index));
        if (part === null) throw new ParentAccountError('storage_unavailable');
        chunks.push(part);
      }
      const value = chunks.join('');
      if (value.length !== manifest.length) throw new ParentAccountError('storage_unavailable');
      return value;
    },
    async setItem(key, value) {
      if (!value.length || value.length > MAX_CHUNKS * CHUNK_SIZE) {
        throw new ParentAccountError('storage_unavailable');
      }
      const old = readManifest(await secure.getItemAsync(manifestKey(key)));
      const bank = old?.bank === 0 ? 1 : 0;
      const count = Math.ceil(value.length / CHUNK_SIZE);
      await clearBank(key, bank);
      await secure.setItemAsync(bankKey(key, bank), String(count));
      for (let index = 0; index < count; index++) {
        await secure.setItemAsync(
          chunkKey(key, bank, index),
          value.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE),
        );
      }
      await secure.setItemAsync(
        manifestKey(key),
        JSON.stringify({ bank, count, length: value.length }),
      );
      if (old) {
        await clearBank(key, old.bank);
      }
    },
    async removeItem(key) {
      // The inventory is committed before chunks, so interrupted writes can also be cleared.
      await secure.deleteItemAsync(manifestKey(key));
      for (const bank of [0, 1]) {
        await clearBank(key, bank);
      }
    },
  };
}
