import type { EntryMode } from '../models/demoEntry';

export type { EntryMode } from '../models/demoEntry';

// Expo substitutes this exact build-time expression; no stored value or URL can select demo mode.
export const entryMode: EntryMode =
  process.env.EXPO_PUBLIC_GHAF_DEMO_ENTRY === 'true' ? 'demo' : 'ordinary';
