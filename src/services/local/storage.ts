import { createMemoryLocalKeyValueStorage, type MemoryLocalKeyValueStorage } from './memory';

export { createMemoryLocalKeyValueStorage, type MemoryLocalKeyValueStorage } from './memory';

export const deviceLocalStorage: MemoryLocalKeyValueStorage = createMemoryLocalKeyValueStorage();
