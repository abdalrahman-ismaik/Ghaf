import { createMemoryLocalKeyValueStorage, type MemoryLocalKeyValueStorage } from './memoryStorage';

export { createMemoryLocalKeyValueStorage, type MemoryLocalKeyValueStorage } from './memoryStorage';

export const deviceLocalStorage: MemoryLocalKeyValueStorage = createMemoryLocalKeyValueStorage();
